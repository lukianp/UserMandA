#nullable enable
#pragma warning disable CA1416 // Platform compatibility
using System;
using System.Diagnostics;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;

namespace MandADiscoverySuite.Services
{
    /// <summary>
    /// Monitors memory pressure and provides adaptive behavior recommendations
    /// Part of T-030 performance optimization to prevent crashes and UI freezes
    /// </summary>
    public class MemoryPressureMonitor : IDisposable
    {
        private readonly ILogger<MemoryPressureMonitor> _logger;
        private readonly Timer _monitorTimer;
        private readonly PerformanceCounter _memoryCounter;
        private readonly object _statusLock = new();
        
        // Memory thresholds in MB
        private readonly long _lowThresholdMB = 100;      // < 100MB = Low pressure
        private readonly long _mediumThresholdMB = 200;   // 100-200MB = Medium pressure  
        private readonly long _highThresholdMB = 300;     // 200-300MB = High pressure
        private readonly long _criticalThresholdMB = 400; // > 300MB = Critical pressure

        // Current status
        private MemoryPressureLevel _currentLevel = MemoryPressureLevel.Low;
        private long _currentMemoryUsageMB = 0;
        private DateTime _lastUpdate = DateTime.UtcNow;
        private int _consecutiveCriticalReadings = 0;
        
        // Events for pressure change notifications
        public event EventHandler<MemoryPressureChangedEventArgs>? MemoryPressureChanged;
        public event EventHandler<CriticalMemoryPressureEventArgs>? CriticalMemoryPressure;

        private bool _disposed = false;

        public MemoryPressureMonitor(ILogger<MemoryPressureMonitor> logger)
        {
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
            
            try
            {
                // Initialize performance counter for more accurate memory monitoring
                _memoryCounter = new PerformanceCounter("Process", "Working Set - Private", Process.GetCurrentProcess().ProcessName);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to initialize performance counter, falling back to GC monitoring");
                _memoryCounter = null!;
            }
            
            // Start monitoring timer (check every 5 seconds)
            _monitorTimer = new Timer(MonitorMemoryPressure, null, TimeSpan.Zero, TimeSpan.FromSeconds(5));
            
            _logger.LogInformation("MemoryPressureMonitor initialized with thresholds: Low<{Low}MB, Medium<{Medium}MB, High<{High}MB, Critical>{Critical}MB", 
                _lowThresholdMB, _mediumThresholdMB, _highThresholdMB, _criticalThresholdMB);
        }

        /// <summary>
        /// Gets the current memory pressure level
        /// </summary>
        public async Task<MemoryPressureLevel> GetCurrentPressureAsync()
        {
            // Force an update if data is older than 10 seconds
            if (DateTime.UtcNow - _lastUpdate > TimeSpan.FromSeconds(10))
            {
                await Task.Run(() => UpdateMemoryStatus());
            }
            
            lock (_statusLock)
            {
                return _currentLevel;
            }
        }

        /// <summary>
        /// Gets current memory usage in MB
        /// </summary>
        public long GetCurrentMemoryUsageMB()
        {
            lock (_statusLock)
            {
                return _currentMemoryUsageMB;
            }
        }

        /// <summary>
        /// Gets detailed memory status
        /// </summary>
        public MemoryStatus GetDetailedStatus()
        {
            lock (_statusLock)
            {
                var gcMemory = GC.GetTotalMemory(false);
                var workingSet = Environment.WorkingSet;
                
                return new MemoryStatus(
                    PressureLevel: _currentLevel,
                    WorkingSetMB: _currentMemoryUsageMB,
                    GCMemoryMB: gcMemory / (1024 * 1024),
                    ProcessWorkingSetMB: workingSet / (1024 * 1024),
                    LastUpdate: _lastUpdate,
                    Gen0Collections: GC.CollectionCount(0),
                    Gen1Collections: GC.CollectionCount(1),
                    Gen2Collections: GC.CollectionCount(2)
                );
            }
        }

        /// <summary>
        /// Triggers garbage collection if memory pressure is high
        /// </summary>
        public async Task<bool> TriggerGarbageCollectionAsync()
        {
            var currentLevel = await GetCurrentPressureAsync();
            
            if (currentLevel >= MemoryPressureLevel.High)
            {
                _logger.LogInformation("Triggering garbage collection due to {PressureLevel} memory pressure", currentLevel);
                
                var beforeMB = GetCurrentMemoryUsageMB();
                
                // Force full GC
                await Task.Run(() =>
                {
                    GC.Collect(2, GCCollectionMode.Forced, true);
                    GC.WaitForPendingFinalizers();
                    GC.Collect(2, GCCollectionMode.Forced, true);
                });
                
                // Wait a moment and update status
                await Task.Delay(500);
                UpdateMemoryStatus();
                
                var afterMB = GetCurrentMemoryUsageMB();
                var freedMB = beforeMB - afterMB;
                
                _logger.LogInformation("Garbage collection completed: {FreedMB}MB freed ({BeforeMB}MB → {AfterMB}MB)", 
                    freedMB, beforeMB, afterMB);
                
                return freedMB > 10; // Consider successful if > 10MB freed
            }
            
            return false;
        }

        /// <summary>
        /// Timer callback to monitor memory pressure
        /// </summary>
        private void MonitorMemoryPressure(object? state)
        {
            try
            {
                UpdateMemoryStatus();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during memory pressure monitoring");
            }
        }

        /// <summary>
        /// Updates the current memory status
        /// </summary>
        private void UpdateMemoryStatus()
        {
            try
            {
                long currentMemoryBytes;
                
                // Try performance counter first, fall back to GC if not available
                if (_memoryCounter != null)
                {
                    try
                    {
                        currentMemoryBytes = (long)_memoryCounter.NextValue();
                    }
                    catch
                    {
                        currentMemoryBytes = GC.GetTotalMemory(false);
                    }
                }
                else
                {
                    currentMemoryBytes = GC.GetTotalMemory(false);
                }
                
                var currentMemoryMB = currentMemoryBytes / (1024 * 1024);
                var previousLevel = _currentLevel;
                
                // Determine pressure level
                var newLevel = currentMemoryMB switch
                {
                    var mb when mb < _lowThresholdMB => MemoryPressureLevel.Low,
                    var mb when mb < _mediumThresholdMB => MemoryPressureLevel.Medium,
                    var mb when mb < _highThresholdMB => MemoryPressureLevel.High,
                    _ => MemoryPressureLevel.Critical
                };
                
                lock (_statusLock)
                {
                    _currentMemoryUsageMB = currentMemoryMB;
                    _currentLevel = newLevel;
                    _lastUpdate = DateTime.UtcNow;
                    
                    // Track consecutive critical readings
                    if (newLevel == MemoryPressureLevel.Critical)
                    {
                        _consecutiveCriticalReadings++;
                    }
                    else
                    {
                        _consecutiveCriticalReadings = 0;
                    }
                }
                
                // Fire events if level changed
                if (newLevel != previousLevel)
                {
                    _logger.LogInformation("Memory pressure changed: {PreviousLevel} → {NewLevel} ({MemoryMB}MB)", 
                        previousLevel, newLevel, currentMemoryMB);
                    
                    MemoryPressureChanged?.Invoke(this, new MemoryPressureChangedEventArgs(
                        previousLevel, newLevel, currentMemoryMB));
                }
                
                // Fire critical pressure event if sustained
                if (newLevel == MemoryPressureLevel.Critical && _consecutiveCriticalReadings >= 3)
                {
                    _logger.LogWarning("Sustained critical memory pressure detected: {MemoryMB}MB for {ConsecutiveReadings} readings", 
                        currentMemoryMB, _consecutiveCriticalReadings);
                    
                    CriticalMemoryPressure?.Invoke(this, new CriticalMemoryPressureEventArgs(
                        currentMemoryMB, _consecutiveCriticalReadings));
                }
                
                // Log periodic status updates at debug level
                if (_lastUpdate.Second % 30 == 0) // Every 30 seconds
                {
                    _logger.LogDebug("Memory status: {Level} pressure, {MemoryMB}MB used, GC counts: Gen0={Gen0}, Gen1={Gen1}, Gen2={Gen2}", 
                        newLevel, currentMemoryMB, GC.CollectionCount(0), GC.CollectionCount(1), GC.CollectionCount(2));
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to update memory status");
            }
        }

        public void Dispose()
        {
            if (!_disposed)
            {
                _monitorTimer?.Dispose();
                _memoryCounter?.Dispose();
                _disposed = true;
                _logger.LogInformation("MemoryPressureMonitor disposed");
            }
        }
    }

    #region Supporting Types

    /// <summary>
    /// Detailed memory status information
    /// </summary>
    public record MemoryStatus(
        MemoryPressureLevel PressureLevel,
        long WorkingSetMB,
        long GCMemoryMB,
        long ProcessWorkingSetMB,
        DateTime LastUpdate,
        int Gen0Collections,
        int Gen1Collections,
        int Gen2Collections
    );

    /// <summary>
    /// Event args for memory pressure changes
    /// </summary>
    public class MemoryPressureChangedEventArgs : EventArgs
    {
        public MemoryPressureLevel PreviousLevel { get; }
        public MemoryPressureLevel NewLevel { get; }
        public long CurrentMemoryMB { get; }
        public DateTime Timestamp { get; }

        public MemoryPressureChangedEventArgs(MemoryPressureLevel previousLevel, MemoryPressureLevel newLevel, long currentMemoryMB)
        {
            PreviousLevel = previousLevel;
            NewLevel = newLevel;
            CurrentMemoryMB = currentMemoryMB;
            Timestamp = DateTime.UtcNow;
        }
    }

    /// <summary>
    /// Event args for critical memory pressure
    /// </summary>
    public class CriticalMemoryPressureEventArgs : EventArgs
    {
        public long CurrentMemoryMB { get; }
        public int ConsecutiveReadings { get; }
        public DateTime Timestamp { get; }

        public CriticalMemoryPressureEventArgs(long currentMemoryMB, int consecutiveReadings)
        {
            CurrentMemoryMB = currentMemoryMB;
            ConsecutiveReadings = consecutiveReadings;
            Timestamp = DateTime.UtcNow;
        }
    }

    #endregion
}