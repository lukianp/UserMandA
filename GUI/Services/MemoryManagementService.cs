using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Runtime;
using System.Threading;
using System.Threading.Tasks;
using System.Windows.Threading;
using Microsoft.Extensions.Logging;

namespace MandADiscoverySuite.Services
{
    /// <summary>
    /// Service for monitoring and managing application memory usage with garbage collection optimization
    /// </summary>
    public class MemoryManagementService : IDisposable
    {
        private readonly ILogger<MemoryManagementService> _logger;
        private readonly NotificationService _notificationService;
        private readonly Timer _monitoringTimer;
        private readonly Timer _cleanupTimer;
        private readonly object _lockObject = new object();
        
        private readonly MemoryConfiguration _configuration;
        private readonly ConcurrentQueue<MemorySnapshot> _memoryHistory;
        private readonly ConcurrentDictionary<string, WeakReference> _trackedObjects;
        private readonly List<IMemoryOptimizable> _optimizableServices;
        
        private MemorySnapshot _lastSnapshot;
        private DateTime _lastGarbageCollection;
        private bool _disposed;
        private bool _isLowMemoryMode;

        public MemoryManagementService(
            ILogger<MemoryManagementService> logger = null,
            NotificationService notificationService = null)
        {
            _logger = logger;
            _notificationService = notificationService;
            _configuration = new MemoryConfiguration();
            _memoryHistory = new ConcurrentQueue<MemorySnapshot>();
            _trackedObjects = new ConcurrentDictionary<string, WeakReference>();
            _optimizableServices = new List<IMemoryOptimizable>();
            
            // Start monitoring every 30 seconds
            _monitoringTimer = new Timer(MonitorMemory, null, TimeSpan.Zero, TimeSpan.FromSeconds(30));
            
            // Start cleanup every 5 minutes
            _cleanupTimer = new Timer(PerformCleanup, null, TimeSpan.FromMinutes(1), TimeSpan.FromMinutes(5));
            
            // Configure GC for workstation mode with concurrent collection
            GCSettings.LatencyMode = GCLatencyMode.Interactive;
            
            _logger?.LogInformation("Memory management service initialized");
        }

        #region Public Properties

        /// <summary>
        /// Gets whether the application is in low memory mode
        /// </summary>
        public bool IsLowMemoryMode
        {
            get => _isLowMemoryMode;
            private set
            {
                if (_isLowMemoryMode != value)
                {
                    _isLowMemoryMode = value;
                    OnLowMemoryModeChanged?.Invoke(value);
                    
                    if (value)
                    {
                        _notificationService?.AddWarning("Memory Warning", "Application is running in low memory mode");
                        _logger?.LogWarning("Entered low memory mode");
                    }
                    else
                    {
                        _notificationService?.AddInfo("Memory Status", "Exited low memory mode");
                        _logger?.LogInformation("Exited low memory mode");
                    }
                }
            }
        }

        /// <summary>
        /// Gets the current memory usage statistics
        /// </summary>
        public MemoryStatistics CurrentMemoryStats => GetCurrentMemoryStats();

        /// <summary>
        /// Gets the last memory snapshot
        /// </summary>
        public MemorySnapshot LastSnapshot => _lastSnapshot;

        /// <summary>
        /// Gets the count of tracked objects
        /// </summary>
        public int TrackedObjectCount => _trackedObjects.Count;

        #endregion

        #region Events

        /// <summary>
        /// Raised when low memory mode status changes
        /// </summary>
        public event Action<bool> OnLowMemoryModeChanged;

        /// <summary>
        /// Raised when memory threshold is exceeded
        /// </summary>
        public event Action<MemoryThresholdEvent> OnMemoryThresholdExceeded;

        /// <summary>
        /// Raised when garbage collection is performed
        /// </summary>
        public event Action<GarbageCollectionEvent> OnGarbageCollectionPerformed;

        /// <summary>
        /// Raised when memory cleanup is completed
        /// </summary>
        public event Action<MemoryCleanupEvent> OnMemoryCleanupCompleted;

        #endregion

        #region Public Methods

        /// <summary>
        /// Forces garbage collection
        /// </summary>
        public void ForceGarbageCollection()
        {
            try
            {
                var stopwatch = Stopwatch.StartNew();
                var memoryBefore = GC.GetTotalMemory(false);
                
                GC.Collect();
                GC.WaitForPendingFinalizers();
                GC.Collect();
                
                stopwatch.Stop();
                var memoryAfter = GC.GetTotalMemory(false);
                var memoryFreed = memoryBefore - memoryAfter;
                
                _lastGarbageCollection = DateTime.UtcNow;
                
                var gcEvent = new GarbageCollectionEvent
                {
                    Timestamp = DateTime.UtcNow,
                    MemoryBefore = memoryBefore,
                    MemoryAfter = memoryAfter,
                    MemoryFreed = memoryFreed,
                    Duration = stopwatch.Elapsed,
                    Generation = GC.MaxGeneration,
                    IsForced = true
                };
                
                OnGarbageCollectionPerformed?.Invoke(gcEvent);
                
                _logger?.LogInformation("Forced garbage collection freed {MemoryFreed:N0} bytes in {Duration:F2}ms", 
                    memoryFreed, stopwatch.ElapsedMilliseconds);
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error during forced garbage collection");
            }
        }

        /// <summary>
        /// Optimizes memory usage by cleaning up cached data and forcing GC
        /// </summary>
        public async Task OptimizeMemoryAsync()
        {
            try
            {
                var stopwatch = Stopwatch.StartNew();
                var memoryBefore = GC.GetTotalMemory(false);
                
                // Notify optimizable services to clean up
                var cleanupTasks = _optimizableServices.Select(service => service.OptimizeMemoryAsync());
                await Task.WhenAll(cleanupTasks);
                
                // Clean up tracked objects
                CleanupTrackedObjects();
                
                // Force garbage collection
                ForceGarbageCollection();
                
                stopwatch.Stop();
                var memoryAfter = GC.GetTotalMemory(false);
                var memoryFreed = memoryBefore - memoryAfter;
                
                var cleanupEvent = new MemoryCleanupEvent
                {
                    Timestamp = DateTime.UtcNow,
                    MemoryBefore = memoryBefore,
                    MemoryAfter = memoryAfter,
                    MemoryFreed = memoryFreed,
                    Duration = stopwatch.Elapsed,
                    OptimizedServices = _optimizableServices.Count
                };
                
                OnMemoryCleanupCompleted?.Invoke(cleanupEvent);
                
                _notificationService?.AddSuccess("Memory Optimization", 
                    $"Freed {FormatBytes(memoryFreed)} of memory");
                
                _logger?.LogInformation("Memory optimization freed {MemoryFreed:N0} bytes in {Duration:F2}ms", 
                    memoryFreed, stopwatch.ElapsedMilliseconds);
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error during memory optimization");
                _notificationService?.AddError("Memory Optimization Failed", "An error occurred during memory optimization");
            }
        }

        /// <summary>
        /// Registers a service for memory optimization
        /// </summary>
        public void RegisterOptimizableService(IMemoryOptimizable service)
        {
            if (service == null)
                throw new ArgumentNullException(nameof(service));

            lock (_optimizableServices)
            {
                if (!_optimizableServices.Contains(service))
                {
                    _optimizableServices.Add(service);
                    _logger?.LogDebug("Registered optimizable service: {ServiceType}", service.GetType().Name);
                }
            }
        }

        /// <summary>
        /// Unregisters a service from memory optimization
        /// </summary>
        public void UnregisterOptimizableService(IMemoryOptimizable service)
        {
            if (service == null)
                return;

            lock (_optimizableServices)
            {
                if (_optimizableServices.Remove(service))
                {
                    _logger?.LogDebug("Unregistered optimizable service: {ServiceType}", service.GetType().Name);
                }
            }
        }

        /// <summary>
        /// Tracks an object for memory monitoring
        /// </summary>
        public void TrackObject(string key, object obj)
        {
            if (string.IsNullOrEmpty(key) || obj == null)
                return;

            try
            {
                _trackedObjects.AddOrUpdate(key, new WeakReference(obj), (k, existing) => new WeakReference(obj));
                _logger?.LogDebug("Started tracking object: {Key}", key);
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error tracking object: {Key}", key);
            }
        }

        /// <summary>
        /// Stops tracking an object
        /// </summary>
        public void UntrackObject(string key)
        {
            if (string.IsNullOrEmpty(key))
                return;

            try
            {
                if (_trackedObjects.TryRemove(key, out _))
                {
                    _logger?.LogDebug("Stopped tracking object: {Key}", key);
                }
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error untracking object: {Key}", key);
            }
        }

        /// <summary>
        /// Gets memory history snapshots
        /// </summary>
        public List<MemorySnapshot> GetMemoryHistory(int maxEntries = 100)
        {
            try
            {
                return _memoryHistory.TakeLast(maxEntries).ToList();
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error getting memory history");
                return new List<MemorySnapshot>();
            }
        }

        /// <summary>
        /// Gets detailed memory statistics
        /// </summary>
        public MemoryDiagnostics GetMemoryDiagnostics()
        {
            try
            {
                var process = Process.GetCurrentProcess();
                var gcMemoryInfo = GC.GetGCMemoryInfo();
                
                return new MemoryDiagnostics
                {
                    Timestamp = DateTime.UtcNow,
                    WorkingSet = process.WorkingSet64,
                    PrivateMemorySize = process.PrivateMemorySize64,
                    VirtualMemorySize = process.VirtualMemorySize64,
                    TotalAllocatedBytes = GC.GetTotalAllocatedBytes(),
                    TotalMemory = GC.GetTotalMemory(false),
                    Gen0Collections = GC.CollectionCount(0),
                    Gen1Collections = GC.CollectionCount(1),
                    Gen2Collections = GC.CollectionCount(2),
                    IsServerGC = GCSettings.IsServerGC,
                    LatencyMode = GCSettings.LatencyMode.ToString(),
                    MaxGeneration = GC.MaxGeneration,
                    HeapSize = gcMemoryInfo.HeapSizeBytes,
                    FragmentedBytes = gcMemoryInfo.FragmentedBytes,
                    TrackedObjectCount = _trackedObjects.Count,
                    AliveTrackedObjects = GetAliveTrackedObjectCount(),
                    IsLowMemoryMode = IsLowMemoryMode
                };
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error getting memory diagnostics");
                return new MemoryDiagnostics { Timestamp = DateTime.UtcNow };
            }
        }

        /// <summary>
        /// Sets memory thresholds for monitoring
        /// </summary>
        public void SetMemoryThresholds(long warningThreshold, long criticalThreshold)
        {
            _configuration.WarningThreshold = warningThreshold;
            _configuration.CriticalThreshold = criticalThreshold;
            
            _logger?.LogDebug("Updated memory thresholds: Warning={Warning}, Critical={Critical}", 
                FormatBytes(warningThreshold), FormatBytes(criticalThreshold));
        }

        /// <summary>
        /// Enables or disables low memory mode
        /// </summary>
        public void SetLowMemoryMode(bool enabled)
        {
            IsLowMemoryMode = enabled;
            
            if (enabled)
            {
                // Optimize for low memory
                GCSettings.LatencyMode = GCLatencyMode.Batch;
            }
            else
            {
                // Restore interactive mode
                GCSettings.LatencyMode = GCLatencyMode.Interactive;
            }
        }

        #endregion

        #region Private Methods

        private void MonitorMemory(object state)
        {
            try
            {
                var snapshot = CreateMemorySnapshot();
                _lastSnapshot = snapshot;
                
                // Add to history
                _memoryHistory.Enqueue(snapshot);
                
                // Trim history to max size
                while (_memoryHistory.Count > _configuration.MaxHistoryEntries)
                {
                    _memoryHistory.TryDequeue(out _);
                }
                
                // Check thresholds
                CheckMemoryThresholds(snapshot);
                
                _logger?.LogDebug("Memory snapshot: Working Set={WorkingSet}, Private={Private}, GC={GCMemory}", 
                    FormatBytes(snapshot.WorkingSet), FormatBytes(snapshot.PrivateMemory), FormatBytes(snapshot.GCMemory));
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error during memory monitoring");
            }
        }

        private void PerformCleanup(object state)
        {
            try
            {
                // Clean up dead weak references
                CleanupTrackedObjects();
                
                // Check if we should perform automatic GC
                if (ShouldPerformAutomaticGC())
                {
                    ForceGarbageCollection();
                }
                
                _logger?.LogDebug("Performed routine memory cleanup");
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error during routine cleanup");
            }
        }

        private MemorySnapshot CreateMemorySnapshot()
        {
            var process = Process.GetCurrentProcess();
            
            return new MemorySnapshot
            {
                Timestamp = DateTime.UtcNow,
                WorkingSet = process.WorkingSet64,
                PrivateMemory = process.PrivateMemorySize64,
                VirtualMemory = process.VirtualMemorySize64,
                GCMemory = GC.GetTotalMemory(false),
                Gen0Collections = GC.CollectionCount(0),
                Gen1Collections = GC.CollectionCount(1),
                Gen2Collections = GC.CollectionCount(2),
                TrackedObjects = _trackedObjects.Count,
                AliveTrackedObjects = GetAliveTrackedObjectCount()
            };
        }

        private void CheckMemoryThresholds(MemorySnapshot snapshot)
        {
            try
            {
                var memoryUsage = snapshot.WorkingSet;
                
                if (memoryUsage > _configuration.CriticalThreshold)
                {
                    if (!IsLowMemoryMode)
                    {
                        SetLowMemoryMode(true);
                        OnMemoryThresholdExceeded?.Invoke(new MemoryThresholdEvent
                        {
                            Timestamp = DateTime.UtcNow,
                            ThresholdType = MemoryThresholdType.Critical,
                            CurrentMemory = memoryUsage,
                            Threshold = _configuration.CriticalThreshold,
                            Snapshot = snapshot
                        });
                    }
                }
                else if (memoryUsage > _configuration.WarningThreshold)
                {
                    OnMemoryThresholdExceeded?.Invoke(new MemoryThresholdEvent
                    {
                        Timestamp = DateTime.UtcNow,
                        ThresholdType = MemoryThresholdType.Warning,
                        CurrentMemory = memoryUsage,
                        Threshold = _configuration.WarningThreshold,
                        Snapshot = snapshot
                    });
                }
                else if (IsLowMemoryMode && memoryUsage < _configuration.WarningThreshold * 0.8)
                {
                    // Exit low memory mode when usage drops significantly below warning threshold
                    SetLowMemoryMode(false);
                }
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error checking memory thresholds");
            }
        }

        private void CleanupTrackedObjects()
        {
            try
            {
                var deadKeys = new List<string>();
                
                foreach (var kvp in _trackedObjects)
                {
                    if (!kvp.Value.IsAlive)
                    {
                        deadKeys.Add(kvp.Key);
                    }
                }
                
                foreach (var key in deadKeys)
                {
                    _trackedObjects.TryRemove(key, out _);
                }
                
                if (deadKeys.Count > 0)
                {
                    _logger?.LogDebug("Cleaned up {Count} dead object references", deadKeys.Count);
                }
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error cleaning up tracked objects");
            }
        }

        private bool ShouldPerformAutomaticGC()
        {
            try
            {
                // Perform GC if it's been more than the configured interval
                if (DateTime.UtcNow - _lastGarbageCollection > _configuration.AutoGCInterval)
                {
                    return true;
                }
                
                // Perform GC if memory usage is high
                var currentMemory = GC.GetTotalMemory(false);
                return currentMemory > _configuration.AutoGCThreshold;
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error determining if automatic GC should be performed");
                return false;
            }
        }

        private int GetAliveTrackedObjectCount()
        {
            try
            {
                return _trackedObjects.Values.Count(wr => wr.IsAlive);
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error counting alive tracked objects");
                return 0;
            }
        }

        private MemoryStatistics GetCurrentMemoryStats()
        {
            try
            {
                var process = Process.GetCurrentProcess();
                
                return new MemoryStatistics
                {
                    WorkingSet = process.WorkingSet64,
                    PrivateMemory = process.PrivateMemorySize64,
                    VirtualMemory = process.VirtualMemorySize64,
                    GCMemory = GC.GetTotalMemory(false),
                    IsLowMemoryMode = IsLowMemoryMode,
                    LastGarbageCollection = _lastGarbageCollection,
                    TrackedObjects = _trackedObjects.Count
                };
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error getting current memory stats");
                return new MemoryStatistics();
            }
        }

        private string FormatBytes(long bytes)
        {
            string[] sizes = { "B", "KB", "MB", "GB", "TB" };
            double len = bytes;
            int order = 0;
            while (len >= 1024 && order < sizes.Length - 1)
            {
                order++;
                len = len / 1024;
            }
            return $"{len:0.##} {sizes[order]}";
        }

        #endregion

        #region IDisposable

        public void Dispose()
        {
            if (!_disposed)
            {
                try
                {
                    _monitoringTimer?.Dispose();
                    _cleanupTimer?.Dispose();
                    _trackedObjects.Clear();
                    _optimizableServices.Clear();
                    
                    _logger?.LogInformation("Memory management service disposed");
                }
                catch (Exception ex)
                {
                    _logger?.LogError(ex, "Error disposing memory management service");
                }
                finally
                {
                    _disposed = true;
                }
            }
        }

        #endregion
    }

    #region Interfaces

    /// <summary>
    /// Interface for services that can optimize their memory usage
    /// </summary>
    public interface IMemoryOptimizable
    {
        Task OptimizeMemoryAsync();
    }

    #endregion

    #region Support Classes

    /// <summary>
    /// Memory management configuration
    /// </summary>
    public class MemoryConfiguration
    {
        public long WarningThreshold { get; set; } = 512 * 1024 * 1024; // 512MB
        public long CriticalThreshold { get; set; } = 1024 * 1024 * 1024; // 1GB
        public long AutoGCThreshold { get; set; } = 256 * 1024 * 1024; // 256MB
        public TimeSpan AutoGCInterval { get; set; } = TimeSpan.FromMinutes(10);
        public int MaxHistoryEntries { get; set; } = 288; // 24 hours at 5-minute intervals
        public bool EnableAutomaticOptimization { get; set; } = true;
        public TimeSpan OptimizationInterval { get; set; } = TimeSpan.FromMinutes(30);
    }

    /// <summary>
    /// Memory snapshot for monitoring
    /// </summary>
    public class MemorySnapshot
    {
        public DateTime Timestamp { get; set; }
        public long WorkingSet { get; set; }
        public long PrivateMemory { get; set; }
        public long VirtualMemory { get; set; }
        public long GCMemory { get; set; }
        public int Gen0Collections { get; set; }
        public int Gen1Collections { get; set; }
        public int Gen2Collections { get; set; }
        public int TrackedObjects { get; set; }
        public int AliveTrackedObjects { get; set; }
    }

    /// <summary>
    /// Current memory statistics
    /// </summary>
    public class MemoryStatistics
    {
        public long WorkingSet { get; set; }
        public long PrivateMemory { get; set; }
        public long VirtualMemory { get; set; }
        public long GCMemory { get; set; }
        public bool IsLowMemoryMode { get; set; }
        public DateTime LastGarbageCollection { get; set; }
        public int TrackedObjects { get; set; }
    }

    /// <summary>
    /// Detailed memory diagnostics
    /// </summary>
    public class MemoryDiagnostics
    {
        public DateTime Timestamp { get; set; }
        public long WorkingSet { get; set; }
        public long PrivateMemorySize { get; set; }
        public long VirtualMemorySize { get; set; }
        public long TotalAllocatedBytes { get; set; }
        public long TotalMemory { get; set; }
        public int Gen0Collections { get; set; }
        public int Gen1Collections { get; set; }
        public int Gen2Collections { get; set; }
        public bool IsServerGC { get; set; }
        public string LatencyMode { get; set; }
        public int MaxGeneration { get; set; }
        public long HeapSize { get; set; }
        public long FragmentedBytes { get; set; }
        public int TrackedObjectCount { get; set; }
        public int AliveTrackedObjects { get; set; }
        public bool IsLowMemoryMode { get; set; }
    }

    /// <summary>
    /// Memory threshold event
    /// </summary>
    public class MemoryThresholdEvent
    {
        public DateTime Timestamp { get; set; }
        public MemoryThresholdType ThresholdType { get; set; }
        public long CurrentMemory { get; set; }
        public long Threshold { get; set; }
        public MemorySnapshot Snapshot { get; set; }
    }

    /// <summary>
    /// Garbage collection event
    /// </summary>
    public class GarbageCollectionEvent
    {
        public DateTime Timestamp { get; set; }
        public long MemoryBefore { get; set; }
        public long MemoryAfter { get; set; }
        public long MemoryFreed { get; set; }
        public TimeSpan Duration { get; set; }
        public int Generation { get; set; }
        public bool IsForced { get; set; }
    }

    /// <summary>
    /// Memory cleanup event
    /// </summary>
    public class MemoryCleanupEvent
    {
        public DateTime Timestamp { get; set; }
        public long MemoryBefore { get; set; }
        public long MemoryAfter { get; set; }
        public long MemoryFreed { get; set; }
        public TimeSpan Duration { get; set; }
        public int OptimizedServices { get; set; }
    }

    /// <summary>
    /// Memory threshold types
    /// </summary>
    public enum MemoryThresholdType
    {
        Warning,
        Critical
    }

    #endregion
}