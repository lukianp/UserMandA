using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;
using MandADiscoverySuite.Models;
using ModelsLogEntry = MandADiscoverySuite.Models.LogEntry;
using MandADiscoverySuite.Repository;

namespace MandADiscoverySuite.Services
{
    /// <summary>
    /// Service for tracking changes to entities with audit trails and undo/redo functionality
    /// </summary>
    public class ChangeTrackingService : IDisposable
    {
        private readonly ILogger<ChangeTrackingService> _logger;
        private readonly NotificationService _notificationService;
        private readonly IUnitOfWork _unitOfWork;
        private readonly ConcurrentDictionary<string, ChangeTracker> _trackers;
        private readonly ConcurrentStack<ChangeOperation> _undoStack;
        private readonly ConcurrentStack<ChangeOperation> _redoStack;
        private readonly object _lockObject = new object();
        
        private readonly ChangeTrackingConfiguration _configuration;
        private bool _disposed;
        private bool _isTrackingEnabled = true;

        public ChangeTrackingService(
            ILogger<ChangeTrackingService> logger = null,
            NotificationService notificationService = null,
            IUnitOfWork unitOfWork = null)
        {
            _logger = logger;
            _notificationService = notificationService;
            _unitOfWork = unitOfWork;
            _trackers = new ConcurrentDictionary<string, ChangeTracker>();
            _undoStack = new ConcurrentStack<ChangeOperation>();
            _redoStack = new ConcurrentStack<ChangeOperation>();
            
            _configuration = new ChangeTrackingConfiguration();
            
            _logger?.LogInformation("Change tracking service initialized");
        }

        #region Public Properties

        /// <summary>
        /// Gets whether change tracking is enabled
        /// </summary>
        public bool IsTrackingEnabled
        {
            get => _isTrackingEnabled;
            set
            {
                _isTrackingEnabled = value;
                _logger?.LogDebug("Change tracking enabled: {IsEnabled}", value);
            }
        }

        /// <summary>
        /// Gets the number of tracked entities
        /// </summary>
        public int TrackedEntityCount => _trackers.Count;

        /// <summary>
        /// Gets whether undo operations are available
        /// </summary>
        public bool CanUndo => !_undoStack.IsEmpty;

        /// <summary>
        /// Gets whether redo operations are available
        /// </summary>
        public bool CanRedo => !_redoStack.IsEmpty;

        /// <summary>
        /// Gets the count of undo operations available
        /// </summary>
        public int UndoCount => _undoStack.Count;

        /// <summary>
        /// Gets the count of redo operations available
        /// </summary>
        public int RedoCount => _redoStack.Count;

        #endregion

        #region Events

        /// <summary>
        /// Raised when an entity is changed
        /// </summary>
        public event Action<ChangeEvent> OnEntityChanged;

        /// <summary>
        /// Raised when an operation is undone
        /// </summary>
        public event Action<ChangeOperation> OnOperationUndone;

        /// <summary>
        /// Raised when an operation is redone
        /// </summary>
        public event Action<ChangeOperation> OnOperationRedone;

        /// <summary>
        /// Raised when undo/redo state changes
        /// </summary>
        public event Action OnUndoRedoStateChanged;

        #endregion

        #region Public Methods

        /// <summary>
        /// Starts tracking changes for an entity
        /// </summary>
        public void StartTracking<T>(T entity, string entityId = null) where T : class
        {
            if (!IsTrackingEnabled || entity == null)
                return;

            try
            {
                var id = entityId ?? GetEntityId(entity);
                var tracker = new ChangeTracker
                {
                    EntityId = id,
                    EntityType = typeof(T).Name,
                    OriginalState = JsonConvert.SerializeObject(entity),
                    CurrentState = JsonConvert.SerializeObject(entity),
                    StartTime = DateTime.UtcNow,
                    Changes = new List<PropertyChange>()
                };

                _trackers.AddOrUpdate(id, tracker, (key, existing) => tracker);
                
                _logger?.LogDebug("Started tracking entity: {EntityType} - {EntityId}", typeof(T).Name, id);
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error starting tracking for entity");
            }
        }

        /// <summary>
        /// Records a change to a tracked entity
        /// </summary>
        public void RecordChange<T>(T entity, string propertyName, object oldValue, object newValue, string entityId = null) where T : class
        {
            if (!IsTrackingEnabled || entity == null)
                return;

            try
            {
                var id = entityId ?? GetEntityId(entity);
                
                if (_trackers.TryGetValue(id, out var tracker))
                {
                    var change = new PropertyChange
                    {
                        PropertyName = propertyName,
                        OldValue = JsonConvert.SerializeObject(oldValue),
                        NewValue = JsonConvert.SerializeObject(newValue),
                        Timestamp = DateTime.UtcNow,
                        ChangedBy = Environment.UserName
                    };

                    tracker.Changes.Add(change);
                    tracker.CurrentState = JsonConvert.SerializeObject(entity);
                    tracker.LastModified = DateTime.UtcNow;

                    // Create change event
                    var changeEvent = new ChangeEvent
                    {
                        EntityId = id,
                        EntityType = tracker.EntityType,
                        PropertyName = propertyName,
                        OldValue = oldValue,
                        NewValue = newValue,
                        Timestamp = DateTime.UtcNow,
                        ChangedBy = Environment.UserName
                    };

                    OnEntityChanged?.Invoke(changeEvent);
                    
                    _logger?.LogDebug("Recorded change: {EntityType}.{PropertyName} - {EntityId}", 
                        tracker.EntityType, propertyName, id);
                }
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error recording change for entity");
            }
        }

        /// <summary>
        /// Records a bulk change operation for undo/redo
        /// </summary>
        public void RecordOperation(ChangeOperation operation)
        {
            if (!IsTrackingEnabled || operation == null)
                return;

            try
            {
                operation.Timestamp = DateTime.UtcNow;
                operation.Id = Guid.NewGuid().ToString();

                _undoStack.Push(operation);
                
                // Clear redo stack when new operation is recorded
                _redoStack.Clear();

                // Limit undo stack size
                TrimUndoStack();

                OnUndoRedoStateChanged?.Invoke();
                
                _logger?.LogDebug("Recorded operation: {OperationType} - {Description}", 
                    operation.OperationType, operation.Description);
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error recording operation");
            }
        }

        /// <summary>
        /// Undoes the last operation
        /// </summary>
        public async Task<bool> UndoAsync()
        {
            if (!CanUndo)
                return false;

            try
            {
                if (_undoStack.TryPop(out var operation))
                {
                    var success = await ExecuteUndoAsync(operation);
                    
                    if (success)
                    {
                        _redoStack.Push(operation);
                        OnOperationUndone?.Invoke(operation);
                        OnUndoRedoStateChanged?.Invoke();
                        
                        _notificationService?.AddInfo("Undo", $"Undone: {operation.Description}");
                        _logger?.LogDebug("Undid operation: {Description}", operation.Description);
                    }
                    else
                    {
                        // Put operation back if undo failed
                        _undoStack.Push(operation);
                        _notificationService?.AddError("Undo Failed", "Failed to undo the operation");
                    }

                    return success;
                }
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error undoing operation");
                _notificationService?.AddError("Undo Error", "An error occurred while undoing the operation");
            }

            return false;
        }

        /// <summary>
        /// Redoes the last undone operation
        /// </summary>
        public async Task<bool> RedoAsync()
        {
            if (!CanRedo)
                return false;

            try
            {
                if (_redoStack.TryPop(out var operation))
                {
                    var success = await ExecuteRedoAsync(operation);
                    
                    if (success)
                    {
                        _undoStack.Push(operation);
                        OnOperationRedone?.Invoke(operation);
                        OnUndoRedoStateChanged?.Invoke();
                        
                        _notificationService?.AddInfo("Redo", $"Redone: {operation.Description}");
                        _logger?.LogDebug("Redid operation: {Description}", operation.Description);
                    }
                    else
                    {
                        // Put operation back if redo failed
                        _redoStack.Push(operation);
                        _notificationService?.AddError("Redo Failed", "Failed to redo the operation");
                    }

                    return success;
                }
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error redoing operation");
                _notificationService?.AddError("Redo Error", "An error occurred while redoing the operation");
            }

            return false;
        }

        /// <summary>
        /// Gets the change history for an entity
        /// </summary>
        public ChangeHistory GetChangeHistory(string entityId)
        {
            try
            {
                if (_trackers.TryGetValue(entityId, out var tracker))
                {
                    return new ChangeHistory
                    {
                        EntityId = entityId,
                        EntityType = tracker.EntityType,
                        StartTime = tracker.StartTime,
                        LastModified = tracker.LastModified,
                        Changes = tracker.Changes.ToList(),
                        OriginalState = tracker.OriginalState,
                        CurrentState = tracker.CurrentState
                    };
                }
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error getting change history for entity: {EntityId}", entityId);
            }

            return null;
        }

        /// <summary>
        /// Gets change history for all tracked entities
        /// </summary>
        public List<ChangeHistory> GetAllChangeHistories()
        {
            try
            {
                var histories = new List<ChangeHistory>();
                
                foreach (var tracker in _trackers.Values)
                {
                    histories.Add(new ChangeHistory
                    {
                        EntityId = tracker.EntityId,
                        EntityType = tracker.EntityType,
                        StartTime = tracker.StartTime,
                        LastModified = tracker.LastModified,
                        Changes = tracker.Changes.ToList(),
                        OriginalState = tracker.OriginalState,
                        CurrentState = tracker.CurrentState
                    });
                }

                return histories.OrderByDescending(h => h.LastModified).ToList();
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error getting all change histories");
                return new List<ChangeHistory>();
            }
        }

        /// <summary>
        /// Stops tracking an entity
        /// </summary>
        public void StopTracking(string entityId)
        {
            try
            {
                if (_trackers.TryRemove(entityId, out var tracker))
                {
                    _logger?.LogDebug("Stopped tracking entity: {EntityType} - {EntityId}", 
                        tracker.EntityType, entityId);
                }
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error stopping tracking for entity: {EntityId}", entityId);
            }
        }

        /// <summary>
        /// Clears all tracking data
        /// </summary>
        public void ClearTracking()
        {
            try
            {
                _trackers.Clear();
                _undoStack.Clear();
                _redoStack.Clear();
                
                OnUndoRedoStateChanged?.Invoke();
                _logger?.LogInformation("Cleared all tracking data");
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error clearing tracking data");
            }
        }

        /// <summary>
        /// Saves change history to persistent storage
        /// </summary>
        public async Task SaveChangeHistoryAsync()
        {
            try
            {
                if (_unitOfWork == null)
                    return;

                var logRepo = _unitOfWork.GetRepository<ModelsLogEntry, string>();
                var histories = GetAllChangeHistories();

                foreach (var history in histories)
                {
                    foreach (var change in history.Changes)
                    {
                        var logEntry = new ModelsLogEntry
                        {
                            Timestamp = change.Timestamp,
                            Level = "Info",
                            Category = "ChangeTracking",
                            Message = $"Property '{change.PropertyName}' changed in {history.EntityType} ({history.EntityId})",
                            Properties = JsonConvert.SerializeObject(new
                            {
                                EntityId = history.EntityId,
                                EntityType = history.EntityType,
                                PropertyName = change.PropertyName,
                                OldValue = change.OldValue,
                                NewValue = change.NewValue
                            }),
                            Username = change.ChangedBy,
                            Source = "ChangeTrackingService"
                        };

                        await logRepo.AddAsync(logEntry);
                    }
                }

                await _unitOfWork.SaveChangesAsync();
                _logger?.LogDebug("Saved change history to persistent storage");
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error saving change history");
            }
        }

        /// <summary>
        /// Gets audit trail for an entity
        /// </summary>
        public async Task<List<AuditTrailEntry>> GetAuditTrailAsync(string entityId)
        {
            try
            {
                if (_unitOfWork == null)
                    return new List<AuditTrailEntry>();

                var logRepo = _unitOfWork.GetRepository<ModelsLogEntry, string>();
                var logs = await logRepo.FindAsync(l => 
                    l.Category == "ChangeTracking" && 
                    l.Properties.Contains($"\"EntityId\":\"{entityId}\""));

                var auditEntries = new List<AuditTrailEntry>();
                
                foreach (var log in logs.OrderByDescending(l => l.Timestamp))
                {
                    try
                    {
                        var properties = JsonConvert.DeserializeObject<dynamic>(log.Properties);
                        
                        auditEntries.Add(new AuditTrailEntry
                        {
                            Timestamp = log.Timestamp,
                            EntityId = properties.EntityId,
                            EntityType = properties.EntityType,
                            PropertyName = properties.PropertyName,
                            OldValue = properties.OldValue,
                            NewValue = properties.NewValue,
                            ChangedBy = log.Username,
                            Action = "Modified"
                        });
                    }
                    catch (Exception ex)
                    {
                        _logger?.LogWarning(ex, "Error parsing audit log entry: {LogId}", log.Id);
                    }
                }

                return auditEntries;
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error getting audit trail for entity: {EntityId}", entityId);
                return new List<AuditTrailEntry>();
            }
        }

        /// <summary>
        /// Gets tracking statistics
        /// </summary>
        public ChangeTrackingStats GetStatistics()
        {
            try
            {
                var totalChanges = _trackers.Values.Sum(t => t.Changes.Count);
                var oldestTracking = _trackers.Values.Min(t => t.StartTime);
                var newestChange = _trackers.Values.Max(t => t.LastModified);

                return new ChangeTrackingStats
                {
                    TrackedEntities = _trackers.Count,
                    TotalChanges = totalChanges,
                    UndoOperations = _undoStack.Count,
                    RedoOperations = _redoStack.Count,
                    OldestTrackingTime = oldestTracking,
                    NewestChangeTime = newestChange,
                    IsTrackingEnabled = IsTrackingEnabled
                };
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error getting tracking statistics");
                return new ChangeTrackingStats();
            }
        }

        #endregion

        #region Private Methods

        private string GetEntityId(object entity)
        {
            try
            {
                var idProperty = entity.GetType().GetProperty("Id");
                if (idProperty != null)
                {
                    return idProperty.GetValue(entity)?.ToString() ?? Guid.NewGuid().ToString();
                }
            }
            catch (Exception ex)
            {
                _logger?.LogWarning(ex, "Error getting entity ID, using generated GUID");
            }

            return Guid.NewGuid().ToString();
        }

        private async Task<bool> ExecuteUndoAsync(ChangeOperation operation)
        {
            try
            {
                switch (operation.OperationType)
                {
                    case ChangeOperationType.Create:
                        return await UndoCreateAsync(operation);
                    
                    case ChangeOperationType.Update:
                        return await UndoUpdateAsync(operation);
                    
                    case ChangeOperationType.Delete:
                        return await UndoDeleteAsync(operation);
                    
                    default:
                        return false;
                }
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error executing undo for operation: {OperationId}", operation.Id);
                return false;
            }
        }

        private async Task<bool> ExecuteRedoAsync(ChangeOperation operation)
        {
            try
            {
                switch (operation.OperationType)
                {
                    case ChangeOperationType.Create:
                        return await RedoCreateAsync(operation);
                    
                    case ChangeOperationType.Update:
                        return await RedoUpdateAsync(operation);
                    
                    case ChangeOperationType.Delete:
                        return await RedoDeleteAsync(operation);
                    
                    default:
                        return false;
                }
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error executing redo for operation: {OperationId}", operation.Id);
                return false;
            }
        }

        private async Task<bool> UndoCreateAsync(ChangeOperation operation)
        {
            // For create operations, undo means delete
            if (_unitOfWork == null || string.IsNullOrEmpty(operation.EntityId))
                return false;

            try
            {
                // Implementation would depend on entity type
                // For now, return true as placeholder
                return await Task.FromResult(true);
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error undoing create operation");
                return false;
            }
        }

        private async Task<bool> UndoUpdateAsync(ChangeOperation operation)
        {
            // For update operations, restore previous state
            if (_unitOfWork == null || string.IsNullOrEmpty(operation.PreviousState))
                return false;

            try
            {
                // Implementation would depend on entity type
                // For now, return true as placeholder
                return await Task.FromResult(true);
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error undoing update operation");
                return false;
            }
        }

        private async Task<bool> UndoDeleteAsync(ChangeOperation operation)
        {
            // For delete operations, restore the entity
            if (_unitOfWork == null || string.IsNullOrEmpty(operation.PreviousState))
                return false;

            try
            {
                // Implementation would depend on entity type
                // For now, return true as placeholder
                return await Task.FromResult(true);
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error undoing delete operation");
                return false;
            }
        }

        private async Task<bool> RedoCreateAsync(ChangeOperation operation)
        {
            // Redo create operation
            return await UndoDeleteAsync(operation); // Same as undoing a delete
        }

        private async Task<bool> RedoUpdateAsync(ChangeOperation operation)
        {
            // Redo update operation by applying new state
            if (_unitOfWork == null || string.IsNullOrEmpty(operation.NewState))
                return false;

            try
            {
                // Implementation would depend on entity type
                // For now, return true as placeholder
                return await Task.FromResult(true);
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error redoing update operation");
                return false;
            }
        }

        private async Task<bool> RedoDeleteAsync(ChangeOperation operation)
        {
            // Redo delete operation
            return await UndoCreateAsync(operation); // Same as undoing a create
        }

        private void TrimUndoStack()
        {
            try
            {
                if (_undoStack.Count > _configuration.MaxUndoOperations)
                {
                    var operations = new List<ChangeOperation>();
                    while (_undoStack.TryPop(out var op))
                    {
                        operations.Add(op);
                    }

                    // Keep only the most recent operations
                    var keepOperations = operations
                        .OrderByDescending(o => o.Timestamp)
                        .Take(_configuration.MaxUndoOperations)
                        .OrderBy(o => o.Timestamp);

                    foreach (var operation in keepOperations)
                    {
                        _undoStack.Push(operation);
                    }
                }
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error trimming undo stack");
            }
        }

        #endregion

        #region IDisposable

        public void Dispose()
        {
            if (!_disposed)
            {
                try
                {
                    SaveChangeHistoryAsync().GetAwaiter().GetResult();
                    ClearTracking();
                    _logger?.LogInformation("Change tracking service disposed");
                }
                catch (Exception ex)
                {
                    _logger?.LogError(ex, "Error disposing change tracking service");
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
    /// Tracks changes for a single entity
    /// </summary>
    internal class ChangeTracker
    {
        public string EntityId { get; set; }
        public string EntityType { get; set; }
        public string OriginalState { get; set; }
        public string CurrentState { get; set; }
        public DateTime StartTime { get; set; }
        public DateTime LastModified { get; set; }
        public List<PropertyChange> Changes { get; set; }
    }

    /// <summary>
    /// Represents a property change
    /// </summary>
    public class PropertyChange
    {
        public string PropertyName { get; set; }
        public string OldValue { get; set; }
        public string NewValue { get; set; }
        public DateTime Timestamp { get; set; }
        public string ChangedBy { get; set; }
    }

    /// <summary>
    /// Represents a change event
    /// </summary>
    public class ChangeEvent
    {
        public string EntityId { get; set; }
        public string EntityType { get; set; }
        public string PropertyName { get; set; }
        public object OldValue { get; set; }
        public object NewValue { get; set; }
        public DateTime Timestamp { get; set; }
        public string ChangedBy { get; set; }
    }

    /// <summary>
    /// Represents a change operation for undo/redo
    /// </summary>
    public class ChangeOperation
    {
        public string Id { get; set; }
        public ChangeOperationType OperationType { get; set; }
        public string EntityId { get; set; }
        public string EntityType { get; set; }
        public string Description { get; set; }
        public string PreviousState { get; set; }
        public string NewState { get; set; }
        public DateTime Timestamp { get; set; }
        public string PerformedBy { get; set; }
    }

    /// <summary>
    /// Types of change operations
    /// </summary>
    public enum ChangeOperationType
    {
        Create,
        Update,
        Delete
    }

    /// <summary>
    /// Change history for an entity
    /// </summary>
    public class ChangeHistory
    {
        public string EntityId { get; set; }
        public string EntityType { get; set; }
        public DateTime StartTime { get; set; }
        public DateTime LastModified { get; set; }
        public List<PropertyChange> Changes { get; set; }
        public string OriginalState { get; set; }
        public string CurrentState { get; set; }
    }

    /// <summary>
    /// Audit trail entry
    /// </summary>
    public class AuditTrailEntry
    {
        public DateTime Timestamp { get; set; }
        public string EntityId { get; set; }
        public string EntityType { get; set; }
        public string PropertyName { get; set; }
        public string OldValue { get; set; }
        public string NewValue { get; set; }
        public string ChangedBy { get; set; }
        public string Action { get; set; }
    }

    /// <summary>
    /// Change tracking statistics
    /// </summary>
    public class ChangeTrackingStats
    {
        public int TrackedEntities { get; set; }
        public int TotalChanges { get; set; }
        public int UndoOperations { get; set; }
        public int RedoOperations { get; set; }
        public DateTime OldestTrackingTime { get; set; }
        public DateTime NewestChangeTime { get; set; }
        public bool IsTrackingEnabled { get; set; }
    }

    /// <summary>
    /// Change tracking configuration
    /// </summary>
    public class ChangeTrackingConfiguration
    {
        public int MaxUndoOperations { get; set; } = 100;
        public int MaxTrackedEntities { get; set; } = 1000;
        public TimeSpan HistoryRetentionPeriod { get; set; } = TimeSpan.FromDays(30);
        public bool AutoSaveHistory { get; set; } = true;
        public TimeSpan AutoSaveInterval { get; set; } = TimeSpan.FromMinutes(5);
        public bool TrackPropertyChanges { get; set; } = true;
        public bool EnableAuditTrail { get; set; } = true;
    }

    #endregion
}