using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;
using MandADiscoverySuite.Models;
using MandADiscoverySuite.Repository;

namespace MandADiscoverySuite.Services
{
    /// <summary>
    /// Service for managing offline mode functionality with local data storage and synchronization
    /// </summary>
    public class OfflineModeService : IDisposable
    {
        private readonly ILogger<OfflineModeService> _logger;
        private readonly NotificationService _notificationService;
        private readonly IntelligentCacheService _cacheService;
        private readonly IUnitOfWork _unitOfWork;
        private readonly string _offlineDataPath;
        private readonly object _lockObject = new object();
        
        private bool _isOfflineMode;
        private DateTime _lastSyncTime;
        private readonly List<OfflineOperation> _pendingOperations;
        private readonly OfflineConfiguration _configuration;
        private bool _disposed;

        public OfflineModeService(
            ILogger<OfflineModeService> logger = null,
            NotificationService notificationService = null,
            IntelligentCacheService cacheService = null,
            IUnitOfWork unitOfWork = null)
        {
            _logger = logger;
            _notificationService = notificationService;
            _cacheService = cacheService;
            _unitOfWork = unitOfWork;
            _pendingOperations = new List<OfflineOperation>();
            
            _offlineDataPath = Path.Combine(
                Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData),
                "MandADiscoverySuite", "OfflineData");
            
            _configuration = LoadConfiguration();
            
            Directory.CreateDirectory(_offlineDataPath);
            LoadPendingOperations();
            
            _logger?.LogInformation("Offline mode service initialized");
        }

        #region Public Properties

        /// <summary>
        /// Gets whether the application is currently in offline mode
        /// </summary>
        public bool IsOfflineMode
        {
            get => _isOfflineMode;
            private set
            {
                if (_isOfflineMode != value)
                {
                    _isOfflineMode = value;
                    OnOfflineModeChanged?.Invoke(value);
                    
                    var status = value ? "Offline" : "Online";
                    _notificationService?.AddInfo("Connection Status", $"Application is now {status}");
                    _logger?.LogInformation("Offline mode changed to: {IsOfflineMode}", value);
                }
            }
        }

        /// <summary>
        /// Gets the last synchronization time
        /// </summary>
        public DateTime LastSyncTime => _lastSyncTime;

        /// <summary>
        /// Gets the count of pending operations
        /// </summary>
        public int PendingOperationCount
        {
            get
            {
                lock (_lockObject)
                {
                    return _pendingOperations.Count;
                }
            }
        }

        /// <summary>
        /// Gets whether synchronization is available
        /// </summary>
        public bool CanSynchronize => !IsOfflineMode && PendingOperationCount > 0;

        #endregion

        #region Events

        /// <summary>
        /// Raised when offline mode status changes
        /// </summary>
        public event Action<bool> OnOfflineModeChanged;

        /// <summary>
        /// Raised when synchronization starts
        /// </summary>
        public event Action OnSyncStarted;

        /// <summary>
        /// Raised when synchronization completes
        /// </summary>
        public event Action<bool> OnSyncCompleted; // bool indicates success

        /// <summary>
        /// Raised when sync progress changes
        /// </summary>
        public event Action<int, int> OnSyncProgress; // current, total

        #endregion

        #region Public Methods

        /// <summary>
        /// Enables offline mode
        /// </summary>
        public async Task EnableOfflineModeAsync()
        {
            try
            {
                if (!IsOfflineMode)
                {
                    // Cache critical data for offline use
                    await CacheCriticalDataAsync();
                    
                    IsOfflineMode = true;
                    _logger?.LogInformation("Offline mode enabled");
                }
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error enabling offline mode");
                throw;
            }
        }

        /// <summary>
        /// Disables offline mode
        /// </summary>
        public async Task DisableOfflineModeAsync()
        {
            try
            {
                if (IsOfflineMode)
                {
                    IsOfflineMode = false;
                    
                    // Auto-sync pending operations when going online
                    if (PendingOperationCount > 0)
                    {
                        await SynchronizeAsync();
                    }
                    
                    _logger?.LogInformation("Offline mode disabled");
                }
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error disabling offline mode");
                throw;
            }
        }

        /// <summary>
        /// Toggles offline mode
        /// </summary>
        public async Task ToggleOfflineModeAsync()
        {
            if (IsOfflineMode)
            {
                await DisableOfflineModeAsync();
            }
            else
            {
                await EnableOfflineModeAsync();
            }
        }

        /// <summary>
        /// Saves data for offline access
        /// </summary>
        public async Task SaveOfflineDataAsync<T>(string key, T data)
        {
            try
            {
                var filePath = Path.Combine(_offlineDataPath, $"{key}.json");
                var json = JsonConvert.SerializeObject(data, Formatting.Indented);
                await File.WriteAllTextAsync(filePath, json);
                
                _logger?.LogDebug("Saved offline data: {Key}", key);
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error saving offline data: {Key}", key);
                throw;
            }
        }

        /// <summary>
        /// Loads data from offline storage
        /// </summary>
        public async Task<T> LoadOfflineDataAsync<T>(string key, T defaultValue = default(T))
        {
            try
            {
                var filePath = Path.Combine(_offlineDataPath, $"{key}.json");
                
                if (!File.Exists(filePath))
                {
                    return defaultValue;
                }

                var json = await File.ReadAllTextAsync(filePath);
                return JsonConvert.DeserializeObject<T>(json) ?? defaultValue;
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error loading offline data: {Key}", key);
                return defaultValue;
            }
        }

        /// <summary>
        /// Queues an operation for later synchronization
        /// </summary>
        public async Task QueueOperationAsync(OfflineOperation operation)
        {
            try
            {
                if (operation == null)
                    throw new ArgumentNullException(nameof(operation));

                operation.Id = Guid.NewGuid().ToString();
                operation.Timestamp = DateTime.UtcNow;
                operation.Status = OfflineOperationStatus.Pending;

                lock (_lockObject)
                {
                    _pendingOperations.Add(operation);
                }

                await SavePendingOperationsAsync();
                
                _logger?.LogDebug("Queued offline operation: {OperationType} - {EntityId}", 
                    operation.OperationType, operation.EntityId);
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error queuing offline operation");
                throw;
            }
        }

        /// <summary>
        /// Synchronizes pending operations with the server
        /// </summary>
        public async Task<SyncResult> SynchronizeAsync()
        {
            try
            {
                if (IsOfflineMode)
                {
                    return new SyncResult { Success = false, Message = "Cannot sync while in offline mode" };
                }

                OnSyncStarted?.Invoke();
                
                var operations = new List<OfflineOperation>();
                lock (_lockObject)
                {
                    operations.AddRange(_pendingOperations.Where(op => op.Status == OfflineOperationStatus.Pending));
                }

                if (operations.Count == 0)
                {
                    _lastSyncTime = DateTime.UtcNow;
                    OnSyncCompleted?.Invoke(true);
                    return new SyncResult { Success = true, Message = "No operations to sync" };
                }

                var syncResult = new SyncResult
                {
                    TotalOperations = operations.Count,
                    StartTime = DateTime.UtcNow
                };

                for (int i = 0; i < operations.Count; i++)
                {
                    var operation = operations[i];
                    OnSyncProgress?.Invoke(i + 1, operations.Count);

                    try
                    {
                        var success = await ExecuteOperationAsync(operation);
                        
                        if (success)
                        {
                            operation.Status = OfflineOperationStatus.Synchronized;
                            operation.SyncedAt = DateTime.UtcNow;
                            syncResult.SuccessfulOperations++;
                        }
                        else
                        {
                            operation.Status = OfflineOperationStatus.Failed;
                            operation.ErrorMessage = "Operation execution failed";
                            syncResult.FailedOperations++;
                        }
                    }
                    catch (Exception ex)
                    {
                        operation.Status = OfflineOperationStatus.Failed;
                        operation.ErrorMessage = ex.Message;
                        syncResult.FailedOperations++;
                        
                        _logger?.LogError(ex, "Error executing offline operation: {OperationId}", operation.Id);
                    }
                }

                // Remove synchronized operations
                lock (_lockObject)
                {
                    _pendingOperations.RemoveAll(op => op.Status == OfflineOperationStatus.Synchronized);
                }

                await SavePendingOperationsAsync();
                
                syncResult.EndTime = DateTime.UtcNow;
                syncResult.Success = syncResult.FailedOperations == 0;
                _lastSyncTime = DateTime.UtcNow;

                var message = $"Sync completed: {syncResult.SuccessfulOperations} successful, {syncResult.FailedOperations} failed";
                _notificationService?.AddInfo("Synchronization", message);
                
                OnSyncCompleted?.Invoke(syncResult.Success);
                _logger?.LogInformation("Synchronization completed: {Result}", message);
                
                return syncResult;
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error during synchronization");
                OnSyncCompleted?.Invoke(false);
                throw;
            }
        }

        /// <summary>
        /// Gets the list of pending operations
        /// </summary>
        public List<OfflineOperation> GetPendingOperations()
        {
            lock (_lockObject)
            {
                return _pendingOperations.ToList();
            }
        }

        /// <summary>
        /// Clears all pending operations
        /// </summary>
        public async Task ClearPendingOperationsAsync()
        {
            try
            {
                lock (_lockObject)
                {
                    _pendingOperations.Clear();
                }

                await SavePendingOperationsAsync();
                _logger?.LogInformation("Cleared all pending operations");
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error clearing pending operations");
                throw;
            }
        }

        /// <summary>
        /// Removes a specific pending operation
        /// </summary>
        public async Task RemovePendingOperationAsync(string operationId)
        {
            try
            {
                lock (_lockObject)
                {
                    _pendingOperations.RemoveAll(op => op.Id == operationId);
                }

                await SavePendingOperationsAsync();
                _logger?.LogDebug("Removed pending operation: {OperationId}", operationId);
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error removing pending operation: {OperationId}", operationId);
                throw;
            }
        }

        /// <summary>
        /// Checks if the application can operate offline
        /// </summary>
        public async Task<bool> CanOperateOfflineAsync()
        {
            try
            {
                // Check if critical data is cached
                var hasProfiles = await LoadOfflineDataAsync<List<DiscoveryProfile>>("profiles") != null;
                var hasResults = await LoadOfflineDataAsync<List<DiscoveryResult>>("results") != null;
                
                return hasProfiles || hasResults;
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error checking offline capability");
                return false;
            }
        }

        /// <summary>
        /// Gets offline storage statistics
        /// </summary>
        public async Task<OfflineStorageStats> GetStorageStatsAsync()
        {
            try
            {
                var stats = new OfflineStorageStats();
                
                if (Directory.Exists(_offlineDataPath))
                {
                    var files = Directory.GetFiles(_offlineDataPath, "*.json");
                    stats.FileCount = files.Length;
                    stats.TotalSize = files.Sum(f => new FileInfo(f).Length);
                    stats.LastModified = files.Any() ? 
                        files.Max(f => File.GetLastWriteTime(f)) : 
                        DateTime.MinValue;
                }

                stats.PendingOperations = PendingOperationCount;
                stats.LastSyncTime = LastSyncTime;
                
                return stats;
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error getting storage stats");
                return new OfflineStorageStats();
            }
        }

        #endregion

        #region Private Methods

        private async Task CacheCriticalDataAsync()
        {
            try
            {
                if (_unitOfWork != null)
                {
                    // Cache discovery profiles
                    var profileRepo = _unitOfWork.GetRepository<DiscoveryProfile, string>();
                    var profiles = await profileRepo.GetAllAsync();
                    await SaveOfflineDataAsync("profiles", profiles);

                    // Cache recent discovery results
                    var resultRepo = _unitOfWork.GetRepository<DiscoveryResult, string>();
                    var recentResults = await resultRepo.FindAsync(r => r.CreatedAt > DateTime.UtcNow.AddDays(-7));
                    await SaveOfflineDataAsync("results", recentResults);

                    // Cache user settings
                    var settingsRepo = _unitOfWork.GetRepository<UserSettings, string>();
                    var settings = await settingsRepo.GetAllAsync();
                    await SaveOfflineDataAsync("settings", settings);
                }

                _logger?.LogDebug("Cached critical data for offline use");
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error caching critical data");
                throw;
            }
        }

        private async Task<bool> ExecuteOperationAsync(OfflineOperation operation)
        {
            try
            {
                if (_unitOfWork == null)
                    return false;

                switch (operation.OperationType)
                {
                    case OfflineOperationType.Create:
                        return await ExecuteCreateOperationAsync(operation);
                    
                    case OfflineOperationType.Update:
                        return await ExecuteUpdateOperationAsync(operation);
                    
                    case OfflineOperationType.Delete:
                        return await ExecuteDeleteOperationAsync(operation);
                    
                    default:
                        _logger?.LogWarning("Unknown operation type: {OperationType}", operation.OperationType);
                        return false;
                }
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error executing operation: {OperationId}", operation.Id);
                return false;
            }
        }

        private async Task<bool> ExecuteCreateOperationAsync(OfflineOperation operation)
        {
            try
            {
                switch (operation.EntityType)
                {
                    case nameof(DiscoveryProfile):
                        var profileRepo = _unitOfWork.GetRepository<DiscoveryProfile, string>();
                        var profile = JsonConvert.DeserializeObject<DiscoveryProfile>(operation.Data);
                        await profileRepo.AddAsync(profile);
                        break;
                        
                    case nameof(DiscoveryResult):
                        var resultRepo = _unitOfWork.GetRepository<DiscoveryResult, string>();
                        var result = JsonConvert.DeserializeObject<DiscoveryResult>(operation.Data);
                        await resultRepo.AddAsync(result);
                        break;
                        
                    default:
                        return false;
                }

                await _unitOfWork.SaveChangesAsync();
                return true;
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error executing create operation");
                return false;
            }
        }

        private async Task<bool> ExecuteUpdateOperationAsync(OfflineOperation operation)
        {
            try
            {
                switch (operation.EntityType)
                {
                    case nameof(DiscoveryProfile):
                        var profileRepo = _unitOfWork.GetRepository<DiscoveryProfile, string>();
                        var profile = JsonConvert.DeserializeObject<DiscoveryProfile>(operation.Data);
                        await profileRepo.UpdateAsync(profile);
                        break;
                        
                    case nameof(DiscoveryResult):
                        var resultRepo = _unitOfWork.GetRepository<DiscoveryResult, string>();
                        var result = JsonConvert.DeserializeObject<DiscoveryResult>(operation.Data);
                        await resultRepo.UpdateAsync(result);
                        break;
                        
                    default:
                        return false;
                }

                await _unitOfWork.SaveChangesAsync();
                return true;
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error executing update operation");
                return false;
            }
        }

        private async Task<bool> ExecuteDeleteOperationAsync(OfflineOperation operation)
        {
            try
            {
                switch (operation.EntityType)
                {
                    case nameof(DiscoveryProfile):
                        var profileRepo = _unitOfWork.GetRepository<DiscoveryProfile, string>();
                        await profileRepo.RemoveAsync(operation.EntityId);
                        break;
                        
                    case nameof(DiscoveryResult):
                        var resultRepo = _unitOfWork.GetRepository<DiscoveryResult, string>();
                        await resultRepo.RemoveAsync(operation.EntityId);
                        break;
                        
                    default:
                        return false;
                }

                await _unitOfWork.SaveChangesAsync();
                return true;
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error executing delete operation");
                return false;
            }
        }

        private void LoadPendingOperations()
        {
            try
            {
                var filePath = Path.Combine(_offlineDataPath, "pending_operations.json");
                
                if (File.Exists(filePath))
                {
                    var json = File.ReadAllText(filePath);
                    var operations = JsonConvert.DeserializeObject<List<OfflineOperation>>(json) ?? new List<OfflineOperation>();
                    
                    lock (_lockObject)
                    {
                        _pendingOperations.AddRange(operations);
                    }
                    
                    _logger?.LogDebug("Loaded {Count} pending operations", operations.Count);
                }
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error loading pending operations");
            }
        }

        private async Task SavePendingOperationsAsync()
        {
            try
            {
                var filePath = Path.Combine(_offlineDataPath, "pending_operations.json");
                
                List<OfflineOperation> operationsToSave;
                lock (_lockObject)
                {
                    operationsToSave = _pendingOperations.ToList();
                }

                var json = JsonConvert.SerializeObject(operationsToSave, Formatting.Indented);
                await File.WriteAllTextAsync(filePath, json);
                
                _logger?.LogDebug("Saved {Count} pending operations", operationsToSave.Count);
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error saving pending operations");
            }
        }

        private OfflineConfiguration LoadConfiguration()
        {
            try
            {
                var configPath = Path.Combine(_offlineDataPath, "offline_config.json");
                
                if (File.Exists(configPath))
                {
                    var json = File.ReadAllText(configPath);
                    return JsonConvert.DeserializeObject<OfflineConfiguration>(json) ?? new OfflineConfiguration();
                }
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error loading offline configuration");
            }

            return new OfflineConfiguration();
        }

        #endregion

        #region IDisposable

        public void Dispose()
        {
            if (!_disposed)
            {
                try
                {
                    SavePendingOperationsAsync().Wait();
                    _logger?.LogInformation("Offline mode service disposed");
                }
                catch (Exception ex)
                {
                    _logger?.LogError(ex, "Error disposing offline mode service");
                }
                finally
                {
                    _disposed = true;
                }
            }
        }

        #endregion
    }

    #region Support Classes

    /// <summary>
    /// Represents an offline operation to be synchronized
    /// </summary>
    public class OfflineOperation
    {
        public string Id { get; set; }
        public OfflineOperationType OperationType { get; set; }
        public string EntityType { get; set; }
        public string EntityId { get; set; }
        public string Data { get; set; }
        public DateTime Timestamp { get; set; }
        public OfflineOperationStatus Status { get; set; }
        public DateTime? SyncedAt { get; set; }
        public string ErrorMessage { get; set; }
        public int RetryCount { get; set; }
    }

    /// <summary>
    /// Types of offline operations
    /// </summary>
    public enum OfflineOperationType
    {
        Create,
        Update,
        Delete
    }

    /// <summary>
    /// Status of offline operations
    /// </summary>
    public enum OfflineOperationStatus
    {
        Pending,
        Synchronized,
        Failed
    }

    /// <summary>
    /// Result of synchronization operation
    /// </summary>
    public class SyncResult
    {
        public bool Success { get; set; }
        public string Message { get; set; }
        public int TotalOperations { get; set; }
        public int SuccessfulOperations { get; set; }
        public int FailedOperations { get; set; }
        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }
        public TimeSpan Duration => EndTime - StartTime;
    }

    /// <summary>
    /// Offline storage statistics
    /// </summary>
    public class OfflineStorageStats
    {
        public int FileCount { get; set; }
        public long TotalSize { get; set; }
        public DateTime LastModified { get; set; }
        public int PendingOperations { get; set; }
        public DateTime LastSyncTime { get; set; }
        
        public string FormattedSize
        {
            get
            {
                var bytes = TotalSize;
                string[] sizes = { "B", "KB", "MB", "GB" };
                int order = 0;
                while (bytes >= 1024 && order < sizes.Length - 1)
                {
                    order++;
                    bytes = bytes / 1024;
                }
                return $"{bytes:0.##} {sizes[order]}";
            }
        }
    }

    /// <summary>
    /// Offline mode configuration
    /// </summary>
    public class OfflineConfiguration
    {
        public bool AutoSyncOnConnect { get; set; } = true;
        public int MaxPendingOperations { get; set; } = 1000;
        public int SyncRetryAttempts { get; set; } = 3;
        public TimeSpan SyncTimeout { get; set; } = TimeSpan.FromMinutes(5);
        public TimeSpan DataCacheExpiration { get; set; } = TimeSpan.FromDays(7);
        public bool CompressOfflineData { get; set; } = true;
        public long MaxOfflineStorageSize { get; set; } = 100 * 1024 * 1024; // 100MB
    }

    #endregion
}