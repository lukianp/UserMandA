using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using MandADiscoverySuite.Models;

namespace MandADiscoverySuite.Services
{
    /// <summary>
    /// Enterprise-grade migration state persistence and recovery service
    /// </summary>
    public class MigrationStateService : IDisposable
    {
        private readonly ILogger<MigrationStateService> _logger;
        private readonly string _stateStorePath;
        private readonly Timer _persistenceTimer;
        private readonly ConcurrentDictionary<string, MigrationState> _activeStates;
        private readonly ConcurrentDictionary<string, DateTime> _stateLastModified;
        private readonly SemaphoreSlim _persistenceLock;
        private readonly object _lockObject = new object();
        private bool _disposed = false;

        public event EventHandler<StateChangedEventArgs> StateChanged;
        public event EventHandler<StatePersistedEventArgs> StatePersisted;
        public event EventHandler<StateRecoveredEventArgs> StateRecovered;

        public MigrationStateService(ILogger<MigrationStateService> logger = null)
        {
            _logger = logger;
            
            // Initialize state storage location
            var appDataPath = Path.Combine(
                Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData),
                "MandADiscoverySuite",
                "State"
            );
            
            Directory.CreateDirectory(appDataPath);
            _stateStorePath = appDataPath;
            
            _activeStates = new ConcurrentDictionary<string, MigrationState>();
            _stateLastModified = new ConcurrentDictionary<string, DateTime>();
            _persistenceLock = new SemaphoreSlim(1, 1);
            
            // Auto-save timer - persist state every 30 seconds
            _persistenceTimer = new Timer(
                AutoPersistState, 
                null, 
                TimeSpan.FromSeconds(30), 
                TimeSpan.FromSeconds(30));
            
            // Load existing states on startup
            LoadPersistedStates();
            
            _logger?.LogInformation("Migration state service initialized");
        }

        /// <summary>
        /// Create new migration state for wave execution
        /// </summary>
        public async Task<string> CreateMigrationStateAsync(
            string profileName,
            MigrationWaveExtended wave,
            MigrationExecutionOptions options = null)
        {
            var stateId = Guid.NewGuid().ToString();
            var migrationState = new MigrationState
            {
                StateId = stateId,
                ProfileName = profileName,
                WaveName = wave.Name,
                WaveId = wave.Id,
                Status = MigrationStateStatus.Initialized,
                CreatedDate = DateTime.Now,
                LastUpdated = DateTime.Now,
                Wave = CloneWave(wave),
                ExecutionOptions = options ?? new MigrationExecutionOptions(),
                Progress = new MigrationProgress(),
                ExecutionLog = new List<MigrationLogEntry>(),
                Checkpoints = new List<MigrationCheckpoint>(),
                Metadata = new Dictionary<string, object>()
            };

            _activeStates[stateId] = migrationState;
            _stateLastModified[stateId] = DateTime.Now;

            await CreateCheckpointAsync(stateId, "Migration state initialized", CheckpointType.Initialize);
            
            OnStateChanged(new StateChangedEventArgs
            {
                StateId = stateId,
                OldStatus = MigrationStateStatus.None,
                NewStatus = MigrationStateStatus.Initialized,
                ChangedAt = DateTime.Now
            });

            _logger?.LogInformation($"Created migration state {stateId} for wave {wave.Name}");
            
            return stateId;
        }

        /// <summary>
        /// Update migration state progress
        /// </summary>
        public async Task UpdateProgressAsync(
            string stateId,
            string stage,
            double progressPercentage,
            int completedItems = 0,
            int totalItems = 0,
            string currentItem = null)
        {
            if (!_activeStates.TryGetValue(stateId, out var state))
            {
                _logger?.LogWarning($"Migration state {stateId} not found");
                return;
            }

            lock (_lockObject)
            {
                state.Progress.Stage = stage;
                state.Progress.ProgressPercentage = progressPercentage;
                state.Progress.CompletedItems = completedItems;
                state.Progress.TotalItems = totalItems;
                state.Progress.CurrentItem = currentItem;
                state.Progress.LastUpdated = DateTime.Now;
                state.LastUpdated = DateTime.Now;
                
                _stateLastModified[stateId] = DateTime.Now;
            }

            // Log progress entry
            await AddLogEntryAsync(stateId, LogLevel.Information, $"Progress: {stage} - {progressPercentage:F1}%");

            _logger?.LogDebug($"Updated progress for state {stateId}: {stage} - {progressPercentage:F1}%");
        }

        /// <summary>
        /// Update batch execution state
        /// </summary>
        public async Task UpdateBatchStateAsync(
            string stateId,
            string batchId,
            MigrationStatus status,
            string statusMessage = null,
            Exception error = null)
        {
            if (!_activeStates.TryGetValue(stateId, out var state))
            {
                _logger?.LogWarning($"Migration state {stateId} not found");
                return;
            }

            lock (_lockObject)
            {
                var batch = state.Wave.Batches?.FirstOrDefault(b => b.Id == batchId);
                if (batch != null)
                {
                    batch.Status = status;
                    if (status == MigrationStatus.InProgress && batch.StartTime == null)
                    {
                        batch.StartTime = DateTime.Now;
                    }
                    else if (status == MigrationStatus.Completed || status == MigrationStatus.Failed || status == MigrationStatus.Cancelled)
                    {
                        batch.EndTime = DateTime.Now;
                    }

                    if (!string.IsNullOrEmpty(statusMessage))
                    {
                        batch.StatusMessage = statusMessage;
                    }

                    if (error != null)
                    {
                        batch.Errors.Add(error.Message);
                    }
                }

                state.LastUpdated = DateTime.Now;
                _stateLastModified[stateId] = DateTime.Now;
            }

            var logLevel = status == MigrationStatus.Failed ? LogLevel.Error : LogLevel.Information;
            await AddLogEntryAsync(stateId, logLevel, $"Batch {batchId} status: {status} - {statusMessage}");

            _logger?.LogInformation($"Updated batch {batchId} status to {status} in state {stateId}");
        }

        /// <summary>
        /// Update item execution state
        /// </summary>
        public async Task UpdateItemStateAsync(
            string stateId,
            string itemId,
            MigrationStatus status,
            string output = null,
            List<string> errors = null)
        {
            if (!_activeStates.TryGetValue(stateId, out var state))
            {
                _logger?.LogWarning($"Migration state {stateId} not found");
                return;
            }

            lock (_lockObject)
            {
                var item = state.Wave.Batches?
                    .SelectMany(b => b.Items ?? new List<MigrationItem>())
                    .FirstOrDefault(i => i.Id == itemId);

                if (item != null)
                {
                    item.Status = status;
                    if (status == MigrationStatus.InProgress && item.StartTime == null)
                    {
                        item.StartTime = DateTime.Now;
                    }
                    else if (status == MigrationStatus.Completed || status == MigrationStatus.Failed || status == MigrationStatus.Cancelled)
                    {
                        item.EndTime = DateTime.Now;
                    }

                    if (!string.IsNullOrEmpty(output))
                    {
                        item.Output = output;
                    }

                    if (errors?.Any() == true)
                    {
                        item.Errors.AddRange(errors);
                    }
                }

                state.LastUpdated = DateTime.Now;
                _stateLastModified[stateId] = DateTime.Now;
            }

            var logLevel = status == MigrationStatus.Failed ? LogLevel.Error : LogLevel.Information;
            await AddLogEntryAsync(stateId, logLevel, $"Item {itemId} status: {status}");

            _logger?.LogDebug($"Updated item {itemId} status to {status} in state {stateId}");
        }

        /// <summary>
        /// Change overall migration state status
        /// </summary>
        public async Task ChangeStateStatusAsync(
            string stateId,
            MigrationStateStatus newStatus,
            string reason = null)
        {
            if (!_activeStates.TryGetValue(stateId, out var state))
            {
                _logger?.LogWarning($"Migration state {stateId} not found");
                return;
            }

            var oldStatus = state.Status;
            
            lock (_lockObject)
            {
                state.Status = newStatus;
                state.LastUpdated = DateTime.Now;
                
                if (newStatus == MigrationStateStatus.Running && state.StartedDate == null)
                {
                    state.StartedDate = DateTime.Now;
                }
                else if (newStatus == MigrationStateStatus.Completed || 
                         newStatus == MigrationStateStatus.Failed || 
                         newStatus == MigrationStateStatus.Cancelled)
                {
                    state.CompletedDate = DateTime.Now;
                }

                _stateLastModified[stateId] = DateTime.Now;
            }

            // Create checkpoint for status change
            await CreateCheckpointAsync(stateId, $"Status changed to {newStatus}: {reason}", 
                GetCheckpointType(newStatus));

            OnStateChanged(new StateChangedEventArgs
            {
                StateId = stateId,
                OldStatus = oldStatus,
                NewStatus = newStatus,
                Reason = reason,
                ChangedAt = DateTime.Now
            });

            _logger?.LogInformation($"Changed state {stateId} status from {oldStatus} to {newStatus}");
        }

        /// <summary>
        /// Create recovery checkpoint
        /// </summary>
        public async Task CreateCheckpointAsync(
            string stateId,
            string description,
            CheckpointType type = CheckpointType.Progress)
        {
            if (!_activeStates.TryGetValue(stateId, out var state))
            {
                _logger?.LogWarning($"Migration state {stateId} not found");
                return;
            }

            var checkpoint = new MigrationCheckpoint
            {
                Id = Guid.NewGuid().ToString(),
                Description = description,
                Type = type,
                CreatedAt = DateTime.Now,
                StateSnapshot = JsonSerializer.Serialize(state.Wave),
                ProgressSnapshot = JsonSerializer.Serialize(state.Progress)
            };

            lock (_lockObject)
            {
                state.Checkpoints.Add(checkpoint);
                _stateLastModified[stateId] = DateTime.Now;
            }

            _logger?.LogDebug($"Created checkpoint for state {stateId}: {description}");
        }

        /// <summary>
        /// Add log entry to migration state
        /// </summary>
        public async Task AddLogEntryAsync(
            string stateId,
            LogLevel level,
            string message,
            Exception exception = null)
        {
            if (!_activeStates.TryGetValue(stateId, out var state))
            {
                return;
            }

            var logEntry = new MigrationLogEntry
            {
                Timestamp = DateTime.Now,
                Level = level,
                Message = message,
                Exception = exception?.ToString()
            };

            lock (_lockObject)
            {
                state.ExecutionLog.Add(logEntry);
                
                // Keep only last 1000 log entries to prevent memory issues
                if (state.ExecutionLog.Count > 1000)
                {
                    state.ExecutionLog.RemoveRange(0, state.ExecutionLog.Count - 1000);
                }

                _stateLastModified[stateId] = DateTime.Now;
            }
        }

        /// <summary>
        /// Get migration state
        /// </summary>
        public MigrationState GetMigrationState(string stateId)
        {
            return _activeStates.TryGetValue(stateId, out var state) ? CloneState(state) : null;
        }

        /// <summary>
        /// Get all active migration states
        /// </summary>
        public List<MigrationStateSummary> GetActiveStates()
        {
            return _activeStates.Values
                .Where(s => s.Status == MigrationStateStatus.Running || s.Status == MigrationStateStatus.Paused)
                .Select(s => new MigrationStateSummary
                {
                    StateId = s.StateId,
                    ProfileName = s.ProfileName,
                    WaveName = s.WaveName,
                    Status = s.Status,
                    ProgressPercentage = s.Progress?.ProgressPercentage ?? 0,
                    StartedDate = s.StartedDate,
                    LastUpdated = s.LastUpdated
                })
                .ToList();
        }

        /// <summary>
        /// Recover migration state from checkpoint
        /// </summary>
        public async Task<bool> RecoverFromCheckpointAsync(string stateId, string checkpointId)
        {
            try
            {
                if (!_activeStates.TryGetValue(stateId, out var state))
                {
                    _logger?.LogWarning($"Migration state {stateId} not found for recovery");
                    return false;
                }

                var checkpoint = state.Checkpoints.FirstOrDefault(c => c.Id == checkpointId);
                if (checkpoint == null)
                {
                    _logger?.LogWarning($"Checkpoint {checkpointId} not found in state {stateId}");
                    return false;
                }

                // Restore state from checkpoint
                lock (_lockObject)
                {
                    if (!string.IsNullOrEmpty(checkpoint.StateSnapshot))
                    {
                        state.Wave = JsonSerializer.Deserialize<MigrationWaveExtended>(checkpoint.StateSnapshot);
                    }

                    if (!string.IsNullOrEmpty(checkpoint.ProgressSnapshot))
                    {
                        state.Progress = JsonSerializer.Deserialize<MigrationProgress>(checkpoint.ProgressSnapshot);
                    }

                    state.Status = MigrationStateStatus.Recovered;
                    state.LastUpdated = DateTime.Now;
                    _stateLastModified[stateId] = DateTime.Now;
                }

                OnStateRecovered(new StateRecoveredEventArgs
                {
                    StateId = stateId,
                    CheckpointId = checkpointId,
                    RecoveredAt = DateTime.Now
                });

                _logger?.LogInformation($"Recovered migration state {stateId} from checkpoint {checkpointId}");
                return true;
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, $"Failed to recover state {stateId} from checkpoint {checkpointId}");
                return false;
            }
        }

        /// <summary>
        /// Persist state to disk immediately
        /// </summary>
        public async Task PersistStateAsync(string stateId)
        {
            if (!_activeStates.TryGetValue(stateId, out var state))
            {
                return;
            }

            await _persistenceLock.WaitAsync();
            try
            {
                var filePath = Path.Combine(_stateStorePath, $"{stateId}.json");
                var stateJson = JsonSerializer.Serialize(state, new JsonSerializerOptions 
                { 
                    WriteIndented = true 
                });
                
                await File.WriteAllTextAsync(filePath, stateJson);

                OnStatePersisted(new StatePersistedEventArgs
                {
                    StateId = stateId,
                    FilePath = filePath,
                    PersistedAt = DateTime.Now
                });

                _logger?.LogDebug($"Persisted migration state {stateId} to disk");
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, $"Failed to persist migration state {stateId}");
            }
            finally
            {
                _persistenceLock.Release();
            }
        }

        /// <summary>
        /// Load persisted states from disk
        /// </summary>
        private void LoadPersistedStates()
        {
            try
            {
                var stateFiles = Directory.GetFiles(_stateStorePath, "*.json");
                var loadedCount = 0;

                foreach (var filePath in stateFiles)
                {
                    try
                    {
                        var stateJson = File.ReadAllText(filePath);
                        var state = JsonSerializer.Deserialize<MigrationState>(stateJson);
                        
                        if (state != null && 
                            (state.Status == MigrationStateStatus.Running || 
                             state.Status == MigrationStateStatus.Paused))
                        {
                            _activeStates[state.StateId] = state;
                            _stateLastModified[state.StateId] = state.LastUpdated;
                            loadedCount++;
                        }
                    }
                    catch (Exception ex)
                    {
                        _logger?.LogWarning(ex, $"Failed to load state from {filePath}");
                    }
                }

                _logger?.LogInformation($"Loaded {loadedCount} persisted migration states");
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Failed to load persisted states");
            }
        }

        /// <summary>
        /// Auto-persist modified states
        /// </summary>
        private async void AutoPersistState(object state)
        {
            try
            {
                var modifiedStates = _stateLastModified
                    .Where(kvp => kvp.Value > DateTime.Now.AddMinutes(-1))
                    .Select(kvp => kvp.Key)
                    .ToList();

                foreach (var stateId in modifiedStates)
                {
                    await PersistStateAsync(stateId);
                }
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error during auto-persist");
            }
        }

        private MigrationWaveExtended CloneWave(MigrationWaveExtended original)
        {
            var json = JsonSerializer.Serialize(original);
            return JsonSerializer.Deserialize<MigrationWaveExtended>(json);
        }

        private MigrationState CloneState(MigrationState original)
        {
            var json = JsonSerializer.Serialize(original);
            return JsonSerializer.Deserialize<MigrationState>(json);
        }

        private CheckpointType GetCheckpointType(MigrationStateStatus status)
        {
            return status switch
            {
                MigrationStateStatus.Initialized => CheckpointType.Initialize,
                MigrationStateStatus.Running => CheckpointType.Progress,
                MigrationStateStatus.Paused => CheckpointType.Pause,
                MigrationStateStatus.Completed => CheckpointType.Complete,
                MigrationStateStatus.Failed => CheckpointType.Error,
                MigrationStateStatus.Cancelled => CheckpointType.Cancel,
                _ => CheckpointType.Progress
            };
        }

        protected virtual void OnStateChanged(StateChangedEventArgs e) => StateChanged?.Invoke(this, e);
        protected virtual void OnStatePersisted(StatePersistedEventArgs e) => StatePersisted?.Invoke(this, e);
        protected virtual void OnStateRecovered(StateRecoveredEventArgs e) => StateRecovered?.Invoke(this, e);

        public void Dispose()
        {
            if (_disposed) return;

            _persistenceTimer?.Dispose();
            _persistenceLock?.Dispose();

            // Final persistence of all active states
            foreach (var stateId in _activeStates.Keys)
            {
                try
                {
                    PersistStateAsync(stateId).Wait(TimeSpan.FromSeconds(5));
                }
                catch (Exception ex)
                {
                    _logger?.LogError(ex, $"Failed to persist state {stateId} during disposal");
                }
            }

            _disposed = true;
            _logger?.LogInformation("Migration state service disposed");
        }
    }

    #region Supporting Classes

    public class MigrationState
    {
        public string StateId { get; set; }
        public string ProfileName { get; set; }
        public string WaveName { get; set; }
        public string WaveId { get; set; }
        public MigrationStateStatus Status { get; set; }
        public DateTime CreatedDate { get; set; }
        public DateTime? StartedDate { get; set; }
        public DateTime? CompletedDate { get; set; }
        public DateTime LastUpdated { get; set; }
        public MigrationWaveExtended Wave { get; set; }
        public MigrationExecutionOptions ExecutionOptions { get; set; }
        public MigrationProgress Progress { get; set; }
        public List<MigrationLogEntry> ExecutionLog { get; set; } = new();
        public List<MigrationCheckpoint> Checkpoints { get; set; } = new();
        public Dictionary<string, object> Metadata { get; set; } = new();
    }

    public class MigrationProgress
    {
        public string Stage { get; set; }
        public double ProgressPercentage { get; set; }
        public int CompletedItems { get; set; }
        public int TotalItems { get; set; }
        public string CurrentItem { get; set; }
        public DateTime LastUpdated { get; set; }
    }

    public class MigrationLogEntry
    {
        public DateTime Timestamp { get; set; }
        public LogLevel Level { get; set; }
        public string Message { get; set; }
        public string Exception { get; set; }
        
        // Additional properties for ViewModel compatibility
        public string Source { get; set; }
        public string ItemName { get; set; }
        public string Id { get; set; } = Guid.NewGuid().ToString();
        public string Category { get; set; }
        public Dictionary<string, object> Properties { get; set; } = new Dictionary<string, object>();
    }

    public class MigrationCheckpoint
    {
        public string Id { get; set; }
        public string Description { get; set; }
        public CheckpointType Type { get; set; }
        public DateTime CreatedAt { get; set; }
        public string StateSnapshot { get; set; }
        public string ProgressSnapshot { get; set; }
    }

    public class MigrationStateSummary
    {
        public string StateId { get; set; }
        public string ProfileName { get; set; }
        public string WaveName { get; set; }
        public MigrationStateStatus Status { get; set; }
        public double ProgressPercentage { get; set; }
        public DateTime? StartedDate { get; set; }
        public DateTime LastUpdated { get; set; }
    }

    public class MigrationExecutionOptions
    {
        public bool EnableRollback { get; set; } = true;
        public bool EnableValidation { get; set; } = true;
        public int MaxConcurrentItems { get; set; } = 10;
        public int MaxRetryAttempts { get; set; } = 3;
        public TimeSpan RetryDelay { get; set; } = TimeSpan.FromMinutes(5);
        public Dictionary<string, object> Parameters { get; set; } = new();
    }

    public enum MigrationStateStatus
    {
        None,
        Initialized,
        Running,
        Paused,
        Completed,
        Failed,
        Cancelled,
        Recovered
    }

    public enum CheckpointType
    {
        Initialize,
        Progress,
        Pause,
        Resume,
        Error,
        Complete,
        Cancel
    }

    #endregion

    #region Event Args

    public class StateChangedEventArgs : EventArgs
    {
        public string StateId { get; set; }
        public MigrationStateStatus OldStatus { get; set; }
        public MigrationStateStatus NewStatus { get; set; }
        public string Reason { get; set; }
        public DateTime ChangedAt { get; set; }
    }

    public class StatePersistedEventArgs : EventArgs
    {
        public string StateId { get; set; }
        public string FilePath { get; set; }
        public DateTime PersistedAt { get; set; }
    }

    public class StateRecoveredEventArgs : EventArgs
    {
        public string StateId { get; set; }
        public string CheckpointId { get; set; }
        public DateTime RecoveredAt { get; set; }
    }

    #endregion
}