using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;

namespace MandADiscoverySuite.Services
{
    /// <summary>
    /// Service for intelligent data refresh with change detection, adaptive intervals, and user-driven triggers
    /// </summary>
    public class SmartDataRefreshService : IDisposable
    {
        private readonly ILogger<SmartDataRefreshService> _logger;
        private readonly NotificationService _notificationService;
        private readonly BackgroundTaskQueueService _taskQueueService;
        private readonly IntelligentCacheService _cacheService;
        private readonly ChangeTrackingService _changeTrackingService;
        
        private readonly ConcurrentDictionary<string, DataRefreshContext> _refreshContexts;
        private readonly ConcurrentDictionary<string, Timer> _refreshTimers;
        private readonly Timer _maintenanceTimer;
        private readonly SemaphoreSlim _refreshSemaphore;
        
        private readonly SmartRefreshConfiguration _configuration;
        private bool _disposed;

        public SmartDataRefreshService(
            ILogger<SmartDataRefreshService> logger = null,
            NotificationService notificationService = null,
            BackgroundTaskQueueService taskQueueService = null,
            IntelligentCacheService cacheService = null,
            ChangeTrackingService changeTrackingService = null)
        {
            _logger = logger;
            _notificationService = notificationService;
            _taskQueueService = taskQueueService;
            _cacheService = cacheService;
            _changeTrackingService = changeTrackingService;
            
            _refreshContexts = new ConcurrentDictionary<string, DataRefreshContext>();
            _refreshTimers = new ConcurrentDictionary<string, Timer>();
            _configuration = new SmartRefreshConfiguration();
            _refreshSemaphore = new SemaphoreSlim(_configuration.MaxConcurrentRefreshes, _configuration.MaxConcurrentRefreshes);
            
            // Maintenance timer runs every minute
            _maintenanceTimer = new Timer(PerformMaintenance, null, TimeSpan.FromMinutes(1), TimeSpan.FromMinutes(1));
            
            _logger?.LogInformation("Smart data refresh service initialized with max concurrent refreshes: {MaxRefreshes}", 
                _configuration.MaxConcurrentRefreshes);
        }

        #region Public Properties

        /// <summary>
        /// Gets the number of registered refresh contexts
        /// </summary>
        public int RegisteredContexts => _refreshContexts.Count;

        /// <summary>
        /// Gets the number of active refresh timers
        /// </summary>
        public int ActiveTimers => _refreshTimers.Count;

        /// <summary>
        /// Gets whether smart refresh is enabled
        /// </summary>
        public bool IsEnabled { get; set; } = true;

        #endregion

        #region Events

        /// <summary>
        /// Raised when a refresh operation starts
        /// </summary>
        public event Action<DataRefreshEventArgs> OnRefreshStarted;

        /// <summary>
        /// Raised when a refresh operation completes
        /// </summary>
        public event Action<DataRefreshEventArgs> OnRefreshCompleted;

        /// <summary>
        /// Raised when a refresh operation fails
        /// </summary>
        public event Action<DataRefreshEventArgs> OnRefreshFailed;

        /// <summary>
        /// Raised when data changes are detected
        /// </summary>
        public event Action<DataChangeEventArgs> OnDataChanged;

        /// <summary>
        /// Raised when refresh interval is automatically adjusted
        /// </summary>
        public event Action<IntervalAdjustmentEventArgs> OnIntervalAdjusted;

        #endregion

        #region Public Methods

        /// <summary>
        /// Registers a data source for smart refresh
        /// </summary>
        public void RegisterDataSource<T>(
            string key,
            Func<Task<T>> dataFactory,
            TimeSpan refreshInterval,
            RefreshStrategy strategy = RefreshStrategy.Adaptive,
            Func<T, T, bool> changeDetector = null)
        {
            if (string.IsNullOrEmpty(key))
                throw new ArgumentException("Key cannot be null or empty", nameof(key));
            
            if (dataFactory == null)
                throw new ArgumentNullException(nameof(dataFactory));

            try
            {
                var context = new DataRefreshContext<T>
                {
                    Key = key,
                    DataFactory = dataFactory,
                    RefreshInterval = refreshInterval,
                    Strategy = strategy,
                    ChangeDetector = changeDetector ?? DefaultChangeDetector,
                    RegistrationTime = DateTime.UtcNow,
                    LastRefreshTime = DateTime.MinValue,
                    RefreshCount = 0,
                    ChangeDetectionCount = 0,
                    AdaptiveMultiplier = 1.0
                };

                _refreshContexts.AddOrUpdate(key, context, (k, existing) => context);
                
                SetupRefreshTimer(context);
                
                _logger?.LogDebug("Registered data source: {Key} with interval {Interval} and strategy {Strategy}", 
                    key, refreshInterval, strategy);
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error registering data source: {Key}", key);
                throw;
            }
        }

        /// <summary>
        /// Unregisters a data source from smart refresh
        /// </summary>
        public void UnregisterDataSource(string key)
        {
            if (string.IsNullOrEmpty(key))
                return;

            try
            {
                _refreshContexts.TryRemove(key, out _);
                
                if (_refreshTimers.TryRemove(key, out var timer))
                {
                    timer.Dispose();
                }
                
                _logger?.LogDebug("Unregistered data source: {Key}", key);
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error unregistering data source: {Key}", key);
            }
        }

        /// <summary>
        /// Manually triggers a refresh for a specific data source
        /// </summary>
        public async Task<RefreshResult> RefreshAsync(string key, bool force = false)
        {
            if (string.IsNullOrEmpty(key))
                throw new ArgumentException("Key cannot be null or empty", nameof(key));

            if (!_refreshContexts.TryGetValue(key, out var context))
            {
                return new RefreshResult 
                { 
                    Success = false, 
                    Message = "Data source not registered" 
                };
            }

            try
            {
                return await ExecuteRefreshAsync(context, force);
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error during manual refresh: {Key}", key);
                return new RefreshResult 
                { 
                    Success = false, 
                    Message = ex.Message 
                };
            }
        }

        /// <summary>
        /// Refreshes all registered data sources
        /// </summary>
        public async Task<Dictionary<string, RefreshResult>> RefreshAllAsync(bool force = false)
        {
            var results = new Dictionary<string, RefreshResult>();
            var refreshTasks = new List<Task<(string Key, RefreshResult Result)>>();

            foreach (var context in _refreshContexts.Values)
            {
                refreshTasks.Add(Task.Run(async () =>
                {
                    var result = await ExecuteRefreshAsync(context, force);
                    return (context.Key, result);
                }));
            }

            var completedTasks = await Task.WhenAll(refreshTasks);
            
            foreach (var (key, result) in completedTasks)
            {
                results[key] = result;
            }

            _logger?.LogDebug("Refreshed all data sources: {Count} sources", results.Count);
            return results;
        }

        /// <summary>
        /// Updates the refresh interval for a data source
        /// </summary>
        public void UpdateRefreshInterval(string key, TimeSpan newInterval)
        {
            if (string.IsNullOrEmpty(key))
                throw new ArgumentException("Key cannot be null or empty", nameof(key));

            if (_refreshContexts.TryGetValue(key, out var context))
            {
                context.RefreshInterval = newInterval;
                SetupRefreshTimer(context);
                
                _logger?.LogDebug("Updated refresh interval for {Key} to {Interval}", key, newInterval);
            }
        }

        /// <summary>
        /// Pauses refresh for a specific data source
        /// </summary>
        public void PauseRefresh(string key)
        {
            if (string.IsNullOrEmpty(key))
                return;

            if (_refreshTimers.TryGetValue(key, out var timer))
            {
                timer.Change(Timeout.Infinite, Timeout.Infinite);
                
                if (_refreshContexts.TryGetValue(key, out var context))
                {
                    context.IsPaused = true;
                }
                
                _logger?.LogDebug("Paused refresh for: {Key}", key);
            }
        }

        /// <summary>
        /// Resumes refresh for a specific data source
        /// </summary>
        public void ResumeRefresh(string key)
        {
            if (string.IsNullOrEmpty(key))
                return;

            if (_refreshContexts.TryGetValue(key, out var context))
            {
                context.IsPaused = false;
                SetupRefreshTimer(context);
                
                _logger?.LogDebug("Resumed refresh for: {Key}", key);
            }
        }

        /// <summary>
        /// Gets refresh statistics for all data sources
        /// </summary>
        public SmartRefreshStats GetStatistics()
        {
            try
            {
                var stats = new SmartRefreshStats
                {
                    Timestamp = DateTime.UtcNow,
                    RegisteredSources = _refreshContexts.Count,
                    ActiveTimers = _refreshTimers.Count,
                    IsEnabled = IsEnabled,
                    MaxConcurrentRefreshes = _configuration.MaxConcurrentRefreshes,
                    SourceStats = new List<DataSourceStats>()
                };

                foreach (var context in _refreshContexts.Values)
                {
                    stats.SourceStats.Add(new DataSourceStats
                    {
                        Key = context.Key,
                        Strategy = context.Strategy,
                        RefreshInterval = context.RefreshInterval,
                        LastRefreshTime = context.LastRefreshTime,
                        NextRefreshTime = context.NextRefreshTime,
                        RefreshCount = context.RefreshCount,
                        ChangeDetectionCount = context.ChangeDetectionCount,
                        ErrorCount = context.ErrorCount,
                        IsPaused = context.IsPaused,
                        AdaptiveMultiplier = context.AdaptiveMultiplier
                    });
                }

                return stats;
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error getting refresh statistics");
                return new SmartRefreshStats { Timestamp = DateTime.UtcNow };
            }
        }

        /// <summary>
        /// Sets smart refresh configuration
        /// </summary>
        public void SetConfiguration(SmartRefreshConfiguration configuration)
        {
            if (configuration == null)
                throw new ArgumentNullException(nameof(configuration));

            _configuration.MaxConcurrentRefreshes = configuration.MaxConcurrentRefreshes;
            _configuration.AdaptiveIntervalAdjustment = configuration.AdaptiveIntervalAdjustment;
            _configuration.MinRefreshInterval = configuration.MinRefreshInterval;
            _configuration.MaxRefreshInterval = configuration.MaxRefreshInterval;
            _configuration.ChangeDetectionThreshold = configuration.ChangeDetectionThreshold;
            _configuration.ErrorBackoffMultiplier = configuration.ErrorBackoffMultiplier;
            _configuration.MaxErrorBackoff = configuration.MaxErrorBackoff;

            _logger?.LogDebug("Updated smart refresh configuration");
        }

        #endregion

        #region Private Methods

        private void SetupRefreshTimer(DataRefreshContext context)
        {
            try
            {
                // Circuit breaker - limit number of active timers
                if (_refreshTimers.Count >= _configuration.MaxConcurrentRefreshes * 2)
                {
                    _logger?.LogWarning("Circuit breaker: Too many active timers ({Count}), skipping timer setup for {Key}", 
                        _refreshTimers.Count, context.Key);
                    return;
                }

                // Dispose existing timer
                if (_refreshTimers.TryRemove(context.Key, out var existingTimer))
                {
                    existingTimer?.Dispose();
                }

                if (context.IsPaused || _disposed)
                    return;

                // Calculate actual interval with adaptive adjustment
                var actualInterval = CalculateActualInterval(context);
                
                // Enforce minimum interval to prevent excessive CPU usage
                if (actualInterval.TotalSeconds < 30)
                {
                    actualInterval = TimeSpan.FromSeconds(30);
                    _logger?.LogDebug("Enforced minimum interval of 30 seconds for {Key}", context.Key);
                }

                context.NextRefreshTime = DateTime.UtcNow.Add(actualInterval);

                // Create new timer with one-shot mode, not repeating to prevent leaks
                var timer = new Timer(async _ => await TimerRefreshCallback(context.Key), 
                    null, actualInterval, Timeout.InfiniteTimeSpan);
                
                _refreshTimers.TryAdd(context.Key, timer);
                
                _logger?.LogDebug("Setup refresh timer for {Key} with interval {Interval}", 
                    context.Key, actualInterval);
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error setting up refresh timer for: {Key}", context.Key);
            }
        }

        private TimeSpan CalculateActualInterval(DataRefreshContext context)
        {
            var baseInterval = context.RefreshInterval;

            switch (context.Strategy)
            {
                case RefreshStrategy.Adaptive:
                    var adaptiveInterval = TimeSpan.FromMilliseconds(baseInterval.TotalMilliseconds * context.AdaptiveMultiplier);
                    return ClampInterval(adaptiveInterval);

                case RefreshStrategy.BackoffOnError:
                    if (context.ConsecutiveErrors > 0)
                    {
                        var backoffMultiplier = Math.Pow(_configuration.ErrorBackoffMultiplier, context.ConsecutiveErrors);
                        var backoffInterval = TimeSpan.FromMilliseconds(baseInterval.TotalMilliseconds * backoffMultiplier);
                        return ClampInterval(backoffInterval);
                    }
                    return baseInterval;

                case RefreshStrategy.Fixed:
                default:
                    return baseInterval;
            }
        }

        private TimeSpan ClampInterval(TimeSpan interval)
        {
            if (interval < _configuration.MinRefreshInterval)
                return _configuration.MinRefreshInterval;
            
            if (interval > _configuration.MaxRefreshInterval)
                return _configuration.MaxRefreshInterval;
            
            return interval;
        }

        private async Task TimerRefreshCallback(string key)
        {
            if (!IsEnabled || _disposed)
                return;

            try
            {
                if (_refreshContexts.TryGetValue(key, out var context))
                {
                    // Remove the one-shot timer immediately to prevent accumulation
                    if (_refreshTimers.TryRemove(key, out var usedTimer))
                    {
                        usedTimer?.Dispose();
                    }

                    var result = await ExecuteRefreshAsync(context, false);
                    
                    // Only reschedule if refresh was successful and context still exists
                    if (result.Success && _refreshContexts.ContainsKey(key) && !_disposed)
                    {
                        // Delay before rescheduling to prevent tight loops
                        await Task.Delay(1000);
                        SetupRefreshTimer(context);
                    }
                }
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error in timer refresh callback for key: {Key}", key);
            }
        }

        private async Task<RefreshResult> ExecuteRefreshAsync(DataRefreshContext context, bool force)
        {
            if (!IsEnabled && !force)
            {
                return new RefreshResult { Success = false, Message = "Smart refresh is disabled" };
            }

            await _refreshSemaphore.WaitAsync();

            try
            {
                var startTime = DateTime.UtcNow;
                var eventArgs = new DataRefreshEventArgs
                {
                    Key = context.Key,
                    Strategy = context.Strategy,
                    StartTime = startTime,
                    IsManual = force
                };

                OnRefreshStarted?.Invoke(eventArgs);

                // Execute the data factory
                var newData = await context.ExecuteDataFactory();
                
                var endTime = DateTime.UtcNow;
                eventArgs.EndTime = endTime;
                eventArgs.Duration = endTime - startTime;

                // Check for changes
                bool hasChanges = false;
                if (context.LastData != null)
                {
                    hasChanges = context.DetectChanges(context.LastData, newData);
                    
                    if (hasChanges)
                    {
                        context.ChangeDetectionCount++;
                        OnDataChanged?.Invoke(new DataChangeEventArgs
                        {
                            Key = context.Key,
                            OldData = context.LastData,
                            NewData = newData,
                            DetectionTime = endTime
                        });
                    }
                }

                // Update context
                context.LastData = newData;
                context.LastRefreshTime = endTime;
                context.RefreshCount++;
                context.ConsecutiveErrors = 0; // Reset error count on success

                // Update cache if available
                if (_cacheService != null)
                {
                    await _cacheService.SetAsync(context.Key, newData, context.RefreshInterval);
                }

                // Adjust adaptive interval
                if (context.Strategy == RefreshStrategy.Adaptive)
                {
                    AdjustAdaptiveInterval(context, hasChanges);
                }

                eventArgs.Success = true;
                eventArgs.HasChanges = hasChanges;
                OnRefreshCompleted?.Invoke(eventArgs);

                return new RefreshResult
                {
                    Success = true,
                    HasChanges = hasChanges,
                    Data = newData,
                    Duration = eventArgs.Duration
                };
            }
            catch (Exception ex)
            {
                context.ErrorCount++;
                context.ConsecutiveErrors++;
                context.LastError = ex;
                context.LastErrorTime = DateTime.UtcNow;

                // Adjust timer for error backoff
                if (context.Strategy == RefreshStrategy.BackoffOnError)
                {
                    SetupRefreshTimer(context);
                }

                var eventArgs = new DataRefreshEventArgs
                {
                    Key = context.Key,
                    Strategy = context.Strategy,
                    StartTime = DateTime.UtcNow,
                    IsManual = force,
                    Success = false,
                    Error = ex
                };

                OnRefreshFailed?.Invoke(eventArgs);

                _logger?.LogError(ex, "Error refreshing data source: {Key}", context.Key);

                return new RefreshResult
                {
                    Success = false,
                    Message = ex.Message,
                    Error = ex
                };
            }
            finally
            {
                _refreshSemaphore.Release();
            }
        }

        private void AdjustAdaptiveInterval(DataRefreshContext context, bool hasChanges)
        {
            try
            {
                var oldMultiplier = context.AdaptiveMultiplier;
                
                if (hasChanges)
                {
                    // Data changed - decrease interval (increase frequency)
                    context.AdaptiveMultiplier = Math.Max(0.5, context.AdaptiveMultiplier * 0.9);
                }
                else
                {
                    // No changes - increase interval (decrease frequency)
                    context.AdaptiveMultiplier = Math.Min(3.0, context.AdaptiveMultiplier * 1.1);
                }

                if (Math.Abs(oldMultiplier - context.AdaptiveMultiplier) > 0.1) // Significant change
                {
                    SetupRefreshTimer(context);
                    
                    OnIntervalAdjusted?.Invoke(new IntervalAdjustmentEventArgs
                    {
                        Key = context.Key,
                        OldMultiplier = oldMultiplier,
                        NewMultiplier = context.AdaptiveMultiplier,
                        Reason = hasChanges ? "Data changes detected" : "No changes detected"
                    });
                }
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error adjusting adaptive interval for: {Key}", context.Key);
            }
        }

        private bool DefaultChangeDetector<T>(T oldData, T newData)
        {
            if (oldData == null && newData == null)
                return false;
            
            if (oldData == null || newData == null)
                return true;

            return !oldData.Equals(newData);
        }

        private void PerformMaintenance(object state)
        {
            try
            {
                var now = DateTime.UtcNow;
                var contextsToCleanup = new List<string>();

                foreach (var kvp in _refreshContexts)
                {
                    var context = kvp.Value;
                    
                    // Clean up contexts that haven't been refreshed in a long time
                    if (now - context.RegistrationTime > TimeSpan.FromHours(24) && 
                        context.RefreshCount == 0)
                    {
                        contextsToCleanup.Add(kvp.Key);
                    }
                    
                    // Reset consecutive errors after a period of time
                    if (context.ConsecutiveErrors > 0 && 
                        context.LastErrorTime.HasValue &&
                        now - context.LastErrorTime.Value > TimeSpan.FromHours(1))
                    {
                        context.ConsecutiveErrors = 0;
                        if (context.Strategy == RefreshStrategy.BackoffOnError)
                        {
                            SetupRefreshTimer(context);
                        }
                    }
                }

                foreach (var key in contextsToCleanup)
                {
                    UnregisterDataSource(key);
                }

                if (contextsToCleanup.Count > 0)
                {
                    _logger?.LogDebug("Cleaned up {Count} unused refresh contexts", contextsToCleanup.Count);
                }
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error during refresh service maintenance");
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
                    _maintenanceTimer?.Dispose();
                    _refreshSemaphore?.Dispose();

                    foreach (var timer in _refreshTimers.Values)
                    {
                        timer?.Dispose();
                    }
                    
                    _refreshTimers.Clear();
                    _refreshContexts.Clear();

                    _logger?.LogInformation("Smart data refresh service disposed");
                }
                catch (Exception ex)
                {
                    _logger?.LogError(ex, "Error disposing smart data refresh service");
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
    /// Base data refresh context
    /// </summary>
    public abstract class DataRefreshContext
    {
        public string Key { get; set; }
        public TimeSpan RefreshInterval { get; set; }
        public RefreshStrategy Strategy { get; set; }
        public DateTime RegistrationTime { get; set; }
        public DateTime LastRefreshTime { get; set; }
        public DateTime NextRefreshTime { get; set; }
        public int RefreshCount { get; set; }
        public int ChangeDetectionCount { get; set; }
        public int ErrorCount { get; set; }
        public int ConsecutiveErrors { get; set; }
        public Exception LastError { get; set; }
        public DateTime? LastErrorTime { get; set; }
        public bool IsPaused { get; set; }
        public double AdaptiveMultiplier { get; set; } = 1.0;
        public object LastData { get; set; }

        public abstract Task<object> ExecuteDataFactory();
        public abstract bool DetectChanges(object oldData, object newData);
    }

    /// <summary>
    /// Generic data refresh context
    /// </summary>
    public class DataRefreshContext<T> : DataRefreshContext
    {
        public Func<Task<T>> DataFactory { get; set; }
        public Func<T, T, bool> ChangeDetector { get; set; }

        public override async Task<object> ExecuteDataFactory()
        {
            return await DataFactory();
        }

        public override bool DetectChanges(object oldData, object newData)
        {
            if (ChangeDetector != null && oldData is T oldTyped && newData is T newTyped)
            {
                return ChangeDetector(oldTyped, newTyped);
            }
            return !Equals(oldData, newData);
        }
    }

    /// <summary>
    /// Refresh strategies
    /// </summary>
    public enum RefreshStrategy
    {
        Fixed,          // Fixed interval
        Adaptive,       // Adjust based on change frequency
        BackoffOnError, // Increase interval on errors
        UserDriven      // Only refresh on user request
    }

    /// <summary>
    /// Smart refresh configuration
    /// </summary>
    public class SmartRefreshConfiguration
    {
        public int MaxConcurrentRefreshes { get; set; } = 5;
        public bool AdaptiveIntervalAdjustment { get; set; } = true;
        public TimeSpan MinRefreshInterval { get; set; } = TimeSpan.FromSeconds(30);
        public TimeSpan MaxRefreshInterval { get; set; } = TimeSpan.FromHours(24);
        public double ChangeDetectionThreshold { get; set; } = 0.1;
        public double ErrorBackoffMultiplier { get; set; } = 2.0;
        public TimeSpan MaxErrorBackoff { get; set; } = TimeSpan.FromHours(1);
    }

    /// <summary>
    /// Refresh result
    /// </summary>
    public class RefreshResult
    {
        public bool Success { get; set; }
        public bool HasChanges { get; set; }
        public string Message { get; set; }
        public object Data { get; set; }
        public TimeSpan? Duration { get; set; }
        public Exception Error { get; set; }
    }

    /// <summary>
    /// Data refresh event arguments
    /// </summary>
    public class DataRefreshEventArgs
    {
        public string Key { get; set; }
        public RefreshStrategy Strategy { get; set; }
        public DateTime StartTime { get; set; }
        public DateTime? EndTime { get; set; }
        public TimeSpan? Duration { get; set; }
        public bool IsManual { get; set; }
        public bool Success { get; set; }
        public bool HasChanges { get; set; }
        public Exception Error { get; set; }
    }

    /// <summary>
    /// Data change event arguments
    /// </summary>
    public class DataChangeEventArgs
    {
        public string Key { get; set; }
        public object OldData { get; set; }
        public object NewData { get; set; }
        public DateTime DetectionTime { get; set; }
    }

    /// <summary>
    /// Interval adjustment event arguments
    /// </summary>
    public class IntervalAdjustmentEventArgs
    {
        public string Key { get; set; }
        public double OldMultiplier { get; set; }
        public double NewMultiplier { get; set; }
        public string Reason { get; set; }
    }

    /// <summary>
    /// Smart refresh statistics
    /// </summary>
    public class SmartRefreshStats
    {
        public DateTime Timestamp { get; set; }
        public int RegisteredSources { get; set; }
        public int ActiveTimers { get; set; }
        public bool IsEnabled { get; set; }
        public int MaxConcurrentRefreshes { get; set; }
        public List<DataSourceStats> SourceStats { get; set; } = new List<DataSourceStats>();
    }

    /// <summary>
    /// Data source statistics
    /// </summary>
    public class DataSourceStats
    {
        public string Key { get; set; }
        public RefreshStrategy Strategy { get; set; }
        public TimeSpan RefreshInterval { get; set; }
        public DateTime LastRefreshTime { get; set; }
        public DateTime NextRefreshTime { get; set; }
        public int RefreshCount { get; set; }
        public int ChangeDetectionCount { get; set; }
        public int ErrorCount { get; set; }
        public bool IsPaused { get; set; }
        public double AdaptiveMultiplier { get; set; }
    }

    #endregion
}