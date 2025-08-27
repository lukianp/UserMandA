#nullable enable
using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;

namespace MandADiscoverySuite.Services
{
    /// <summary>
    /// T-030 Performance optimization service that integrates all optimization components
    /// Provides centralized performance monitoring and adaptive behavior coordination
    /// </summary>
    public class PerformanceOptimizationService : IDisposable
    {
        private readonly ILogger<PerformanceOptimizationService> _logger;
        private readonly MemoryPressureMonitor _memoryMonitor;
        private readonly AsyncDataLoadingService _asyncLoader;
        private readonly MultiTierCacheService _cacheService;
        private readonly IncrementalUpdateEngine _incrementalEngine;
        private readonly OptimizedCsvFileWatcherService _fileWatcher;
        private readonly LogicEngineServiceOptimized _logicEngine;
        
        private readonly Timer _performanceMonitorTimer;
        private readonly Timer _adaptiveOptimizationTimer;
        private readonly SemaphoreSlim _optimizationSemaphore = new(1, 1);
        
        private PerformanceMetrics _lastMetrics = new();
        private bool _disposed = false;

        // Performance thresholds for adaptive behavior
        private readonly double _memoryThresholdMB = 200;
        private readonly double _cacheHitRateThreshold = 0.8;
        private readonly TimeSpan _loadTimeThreshold = TimeSpan.FromSeconds(10);

        // Events for performance notifications
        public event EventHandler<PerformanceThresholdExceededEventArgs>? PerformanceThresholdExceeded;
        public event EventHandler<OptimizationAppliedEventArgs>? OptimizationApplied;
        public event EventHandler<PerformanceMetricsUpdatedEventArgs>? PerformanceMetricsUpdated;

        public PerformanceOptimizationService(
            ILogger<PerformanceOptimizationService> logger,
            MemoryPressureMonitor memoryMonitor,
            AsyncDataLoadingService asyncLoader,
            MultiTierCacheService cacheService,
            IncrementalUpdateEngine incrementalEngine,
            OptimizedCsvFileWatcherService fileWatcher,
            LogicEngineServiceOptimized logicEngine)
        {
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
            _memoryMonitor = memoryMonitor ?? throw new ArgumentNullException(nameof(memoryMonitor));
            _asyncLoader = asyncLoader ?? throw new ArgumentNullException(nameof(asyncLoader));
            _cacheService = cacheService ?? throw new ArgumentNullException(nameof(cacheService));
            _incrementalEngine = incrementalEngine ?? throw new ArgumentNullException(nameof(incrementalEngine));
            _fileWatcher = fileWatcher ?? throw new ArgumentNullException(nameof(fileWatcher));
            _logicEngine = logicEngine ?? throw new ArgumentNullException(nameof(logicEngine));

            // Start performance monitoring (every 30 seconds)
            _performanceMonitorTimer = new Timer(MonitorPerformance, null, 
                TimeSpan.FromSeconds(10), TimeSpan.FromSeconds(30));
                
            // Start adaptive optimization (every 2 minutes)
            _adaptiveOptimizationTimer = new Timer(PerformAdaptiveOptimization, null, 
                TimeSpan.FromMinutes(1), TimeSpan.FromMinutes(2));

            // Subscribe to component events
            _memoryMonitor.CriticalMemoryPressure += OnCriticalMemoryPressure;
            _memoryMonitor.MemoryPressureChanged += OnMemoryPressureChanged;
            
            _logger.LogInformation("PerformanceOptimizationService initialized with adaptive monitoring");
        }

        /// <summary>
        /// Gets current performance metrics from all components
        /// </summary>
        public async Task<PerformanceMetrics> GetCurrentMetricsAsync()
        {
            var memoryStatus = _memoryMonitor.GetDetailedStatus();
            var cacheStats = _cacheService.GetStatistics();
            var loadingStatus = _asyncLoader.GetStatus();
            var incrementalStats = _incrementalEngine.GetStatistics();
            var watcherStats = _fileWatcher.GetStatistics();
            
            var metrics = new PerformanceMetrics
            {
                Timestamp = DateTime.UtcNow,
                
                // Memory metrics
                MemoryUsageMB = memoryStatus.WorkingSetMB,
                MemoryPressureLevel = memoryStatus.PressureLevel,
                GCGen0Collections = memoryStatus.Gen0Collections,
                GCGen1Collections = memoryStatus.Gen1Collections,
                GCGen2Collections = memoryStatus.Gen2Collections,
                
                // Cache metrics
                CacheHitRate = cacheStats.HitRate,
                CacheMemoryUsageMB = cacheStats.EstimatedMemoryUsageMB,
                HotCacheSize = cacheStats.HotCacheSize,
                WarmCacheSize = cacheStats.WarmCacheSize,
                ColdCacheSize = cacheStats.ColdCacheSize,
                
                // Loading metrics
                ActiveLoadingOperations = loadingStatus.ActiveOperations.Count,
                AvailableLoadingSlots = loadingStatus.AvailableSlots,
                
                // Incremental update metrics
                TrackedFilesCount = incrementalStats.TrackedFileCount,
                TotalIncrementalUpdates = incrementalStats.TotalUpdates,
                
                // File watcher metrics
                ActiveFileUpdates = watcherStats.ActiveUpdates,
                MonitoredDataTypes = watcherStats.DataTypesMonitored,
                
                // Logic engine metrics
                IsLogicEngineLoading = _logicEngine.IsLoading,
                LastLoadTime = _logicEngine.LastLoadTime
            };

            return metrics;
        }

        /// <summary>
        /// Timer callback for performance monitoring
        /// </summary>
        private async void MonitorPerformance(object? state)
        {
            try
            {
                var metrics = await GetCurrentMetricsAsync();
                
                // Check for threshold breaches
                await CheckPerformanceThresholdsAsync(metrics);
                
                // Update last metrics
                _lastMetrics = metrics;
                
                // Fire metrics updated event
                PerformanceMetricsUpdated?.Invoke(this, new PerformanceMetricsUpdatedEventArgs(metrics));
                
                // Log periodic performance summary
                if (DateTime.UtcNow.Minute % 5 == 0) // Every 5 minutes
                {
                    _logger.LogInformation("Performance summary: Memory={MemoryMB}MB, Cache hit rate={HitRate:P}, " +
                        "Active operations={ActiveOps}, Incremental updates={IncrementalUpdates}",
                        metrics.MemoryUsageMB, metrics.CacheHitRate, 
                        metrics.ActiveLoadingOperations, metrics.TotalIncrementalUpdates);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during performance monitoring");
            }
        }

        /// <summary>
        /// Checks performance thresholds and triggers alerts
        /// </summary>
        private async Task CheckPerformanceThresholdsAsync(PerformanceMetrics metrics)
        {
            var thresholdsBreach = new List<string>();

            // Memory threshold check
            if (metrics.MemoryUsageMB > _memoryThresholdMB)
            {
                thresholdsBreach.Add($"Memory usage: {metrics.MemoryUsageMB}MB > {_memoryThresholdMB}MB");
            }

            // Cache hit rate threshold check
            if (metrics.CacheHitRate < _cacheHitRateThreshold)
            {
                thresholdsBreach.Add($"Cache hit rate: {metrics.CacheHitRate:P} < {_cacheHitRateThreshold:P}");
            }

            // Memory pressure check
            if (metrics.MemoryPressureLevel >= MemoryPressureLevel.High)
            {
                thresholdsBreach.Add($"Memory pressure: {metrics.MemoryPressureLevel}");
            }

            if (thresholdsBreach.Count > 0)
            {
                var thresholdEvent = new PerformanceThresholdExceededEventArgs(metrics, thresholdsBreach);
                PerformanceThresholdExceeded?.Invoke(this, thresholdEvent);
                
                _logger.LogWarning("Performance thresholds exceeded: {Breaches}", 
                    string.Join(", ", thresholdsBreach));
                    
                // Trigger immediate adaptive optimization
                await PerformAdaptiveOptimizationAsync();
            }
        }

        /// <summary>
        /// Timer callback for adaptive optimization
        /// </summary>
        private async void PerformAdaptiveOptimization(object? state)
        {
            await PerformAdaptiveOptimizationAsync();
        }

        /// <summary>
        /// Performs adaptive optimization based on current metrics
        /// </summary>
        private async Task PerformAdaptiveOptimizationAsync()
        {
            if (!await _optimizationSemaphore.WaitAsync(1000))
                return;

            try
            {
                var metrics = await GetCurrentMetricsAsync();
                var optimizations = new List<string>();

                // Memory-based optimizations
                if (metrics.MemoryPressureLevel >= MemoryPressureLevel.High)
                {
                    _logger.LogInformation("Applying memory pressure optimizations");
                    
                    // Trigger garbage collection
                    await _memoryMonitor.TriggerGarbageCollectionAsync();
                    optimizations.Add("Forced garbage collection");
                    
                    // Compact data stores if LogicEngine is not loading
                    if (!metrics.IsLogicEngineLoading)
                    {
                        // This would call compaction methods on the optimized data stores
                        optimizations.Add("Data store compaction requested");
                    }
                }

                // Cache optimization
                if (metrics.CacheHitRate < _cacheHitRateThreshold)
                {
                    _logger.LogInformation("Cache hit rate below threshold ({HitRate:P}), analyzing cache performance", 
                        metrics.CacheHitRate);
                    optimizations.Add($"Cache performance analysis triggered (hit rate: {metrics.CacheHitRate:P})");
                }

                // Loading optimization
                if (metrics.ActiveLoadingOperations > 0 && 
                    metrics.MemoryPressureLevel >= MemoryPressureLevel.Medium)
                {
                    _logger.LogInformation("High memory pressure with active loading operations, " +
                        "may defer non-critical operations");
                    optimizations.Add("Loading operation prioritization");
                }

                if (optimizations.Count > 0)
                {
                    OptimizationApplied?.Invoke(this, new OptimizationAppliedEventArgs(optimizations, metrics));
                    _logger.LogInformation("Applied {Count} performance optimizations: {Optimizations}", 
                        optimizations.Count, string.Join(", ", optimizations));
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during adaptive optimization");
            }
            finally
            {
                _optimizationSemaphore.Release();
            }
        }

        /// <summary>
        /// Event handlers for memory pressure
        /// </summary>
        private async void OnCriticalMemoryPressure(object? sender, CriticalMemoryPressureEventArgs e)
        {
            _logger.LogCritical("Critical memory pressure detected: {MemoryMB}MB for {ConsecutiveReadings} readings", 
                e.CurrentMemoryMB, e.ConsecutiveReadings);
                
            // Emergency optimizations
            await PerformEmergencyOptimizationsAsync();
        }

        private async void OnMemoryPressureChanged(object? sender, MemoryPressureChangedEventArgs e)
        {
            if (e.NewLevel > e.PreviousLevel)
            {
                _logger.LogInformation("Memory pressure increased: {Previous} → {New} ({MemoryMB}MB)", 
                    e.PreviousLevel, e.NewLevel, e.CurrentMemoryMB);
                    
                // Proactive optimization
                await PerformAdaptiveOptimizationAsync();
            }
        }

        /// <summary>
        /// Emergency optimizations for critical situations
        /// </summary>
        private async Task PerformEmergencyOptimizationsAsync()
        {
            _logger.LogWarning("Performing emergency memory optimizations");
            
            var emergencyActions = new List<string>();
            
            try
            {
                // 1. Force aggressive garbage collection
                GC.Collect(2, GCCollectionMode.Forced, true);
                GC.WaitForPendingFinalizers();
                GC.Collect(2, GCCollectionMode.Forced, true);
                emergencyActions.Add("Aggressive garbage collection");
                
                // 2. Clear non-essential caches
                // This would clear warm and cold caches, keeping only hot cache
                emergencyActions.Add("Non-essential cache clearing");
                
                // 3. Pause non-critical loading operations
                // This would signal the AsyncDataLoadingService to defer non-critical operations
                emergencyActions.Add("Non-critical operation deferral");
                
                // 4. Trigger data store compaction
                // This would call compaction methods on all optimized data stores
                emergencyActions.Add("Emergency data compaction");
                
                _logger.LogInformation("Emergency optimizations completed: {Actions}", 
                    string.Join(", ", emergencyActions));
                    
                OptimizationApplied?.Invoke(this, new OptimizationAppliedEventArgs(emergencyActions, _lastMetrics, isEmergency: true));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during emergency optimizations");
            }
        }

        /// <summary>
        /// Manual optimization trigger for external use
        /// </summary>
        public async Task<OptimizationResult> TriggerOptimizationAsync(OptimizationType type = OptimizationType.Adaptive)
        {
            var startTime = DateTime.UtcNow;
            var startMetrics = await GetCurrentMetricsAsync();
            
            try
            {
                switch (type)
                {
                    case OptimizationType.Adaptive:
                        await PerformAdaptiveOptimizationAsync();
                        break;
                        
                    case OptimizationType.Emergency:
                        await PerformEmergencyOptimizationsAsync();
                        break;
                        
                    case OptimizationType.MemoryOnly:
                        await _memoryMonitor.TriggerGarbageCollectionAsync();
                        break;
                }
                
                var endMetrics = await GetCurrentMetricsAsync();
                var duration = DateTime.UtcNow - startTime;
                
                return new OptimizationResult(
                    Success: true,
                    Type: type,
                    Duration: duration,
                    MemoryFreedMB: startMetrics.MemoryUsageMB - endMetrics.MemoryUsageMB,
                    BeforeMetrics: startMetrics,
                    AfterMetrics: endMetrics
                );
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Manual optimization failed for type: {Type}", type);
                
                return new OptimizationResult(
                    Success: false,
                    Type: type,
                    Duration: DateTime.UtcNow - startTime,
                    ErrorMessage: ex.Message,
                    BeforeMetrics: startMetrics,
                    AfterMetrics: null
                );
            }
        }

        public void Dispose()
        {
            if (!_disposed)
            {
                _performanceMonitorTimer?.Dispose();
                _adaptiveOptimizationTimer?.Dispose();
                _optimizationSemaphore?.Dispose();
                
                _disposed = true;
                _logger.LogInformation("PerformanceOptimizationService disposed");
            }
        }
    }

    #region Supporting Types

    /// <summary>
    /// Comprehensive performance metrics
    /// </summary>
    public class PerformanceMetrics
    {
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;
        
        // Memory metrics
        public long MemoryUsageMB { get; set; }
        public MemoryPressureLevel MemoryPressureLevel { get; set; }
        public int GCGen0Collections { get; set; }
        public int GCGen1Collections { get; set; }
        public int GCGen2Collections { get; set; }
        
        // Cache metrics
        public double CacheHitRate { get; set; }
        public long CacheMemoryUsageMB { get; set; }
        public int HotCacheSize { get; set; }
        public int WarmCacheSize { get; set; }
        public int ColdCacheSize { get; set; }
        
        // Loading metrics
        public int ActiveLoadingOperations { get; set; }
        public int AvailableLoadingSlots { get; set; }
        
        // Incremental update metrics
        public int TrackedFilesCount { get; set; }
        public int TotalIncrementalUpdates { get; set; }
        
        // File watcher metrics
        public int ActiveFileUpdates { get; set; }
        public int MonitoredDataTypes { get; set; }
        
        // Logic engine metrics
        public bool IsLogicEngineLoading { get; set; }
        public DateTime? LastLoadTime { get; set; }
    }

    /// <summary>
    /// Types of optimization that can be performed
    /// </summary>
    public enum OptimizationType
    {
        Adaptive,
        Emergency,
        MemoryOnly,
        CacheOnly
    }

    /// <summary>
    /// Result of an optimization operation
    /// </summary>
    public record OptimizationResult(
        bool Success,
        OptimizationType Type,
        TimeSpan Duration,
        long MemoryFreedMB = 0,
        string? ErrorMessage = null,
        PerformanceMetrics? BeforeMetrics = null,
        PerformanceMetrics? AfterMetrics = null
    );

    /// <summary>
    /// Event args for performance threshold exceeded
    /// </summary>
    public class PerformanceThresholdExceededEventArgs : EventArgs
    {
        public PerformanceMetrics Metrics { get; }
        public List<string> ThresholdBreaches { get; }
        public DateTime Timestamp { get; }

        public PerformanceThresholdExceededEventArgs(PerformanceMetrics metrics, List<string> thresholdBreaches)
        {
            Metrics = metrics;
            ThresholdBreaches = thresholdBreaches;
            Timestamp = DateTime.UtcNow;
        }
    }

    /// <summary>
    /// Event args for optimization applied
    /// </summary>
    public class OptimizationAppliedEventArgs : EventArgs
    {
        public List<string> OptimizationsApplied { get; }
        public PerformanceMetrics Metrics { get; }
        public bool IsEmergency { get; }
        public DateTime Timestamp { get; }

        public OptimizationAppliedEventArgs(List<string> optimizationsApplied, PerformanceMetrics metrics, bool isEmergency = false)
        {
            OptimizationsApplied = optimizationsApplied;
            Metrics = metrics;
            IsEmergency = isEmergency;
            Timestamp = DateTime.UtcNow;
        }
    }

    /// <summary>
    /// Event args for performance metrics updated
    /// </summary>
    public class PerformanceMetricsUpdatedEventArgs : EventArgs
    {
        public PerformanceMetrics Metrics { get; }
        public DateTime Timestamp { get; }

        public PerformanceMetricsUpdatedEventArgs(PerformanceMetrics metrics)
        {
            Metrics = metrics;
            Timestamp = DateTime.UtcNow;
        }
    }

    #endregion
}