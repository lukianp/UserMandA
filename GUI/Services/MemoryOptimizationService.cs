using System;
using System.Collections.Generic;
using System.Runtime;
using System.Threading;
using System.Threading.Tasks;
using System.Windows.Threading;

namespace MandADiscoverySuite.Services
{
    /// <summary>
    /// Service for optimizing memory usage and managing garbage collection
    /// </summary>
    public sealed class MemoryOptimizationService : IDisposable
    {
        private readonly Timer _memoryCleanupTimer;
        private readonly object _lockObject = new object();
        private bool _disposed;
        private readonly PerformanceMonitorService _performanceMonitor;

        /// <summary>
        /// Memory threshold in MB above which aggressive cleanup is triggered
        /// </summary>
        public long MemoryThresholdMB { get; set; } = 800;

        /// <summary>
        /// Interval for automatic memory cleanup checks
        /// </summary>
        public TimeSpan CleanupInterval { get; set; } = TimeSpan.FromMinutes(2);

        public MemoryOptimizationService(PerformanceMonitorService performanceMonitor = null)
        {
            _performanceMonitor = performanceMonitor;

            // Configure .NET garbage collection for better performance
            ConfigureGarbageCollection();

            // Start periodic memory cleanup
            _memoryCleanupTimer = new Timer(PerformMemoryCleanup, null, CleanupInterval, CleanupInterval);
        }

        /// <summary>
        /// Performs immediate memory optimization
        /// </summary>
        public void OptimizeMemoryNow()
        {
            lock (_lockObject)
            {
                if (_disposed) return;

                try
                {
                    var stopwatch = _performanceMonitor?.StartTiming("MemoryOptimization");

                    // Force garbage collection
                    GC.Collect(2, GCCollectionMode.Optimized);
                    GC.WaitForPendingFinalizers();
                    GC.Collect(2, GCCollectionMode.Optimized);

                    // Compact the large object heap
                    GCSettings.LargeObjectHeapCompactionMode = GCLargeObjectHeapCompactionMode.CompactOnce;
                    GC.Collect();

                    _performanceMonitor?.RecordOperationTime("MemoryOptimization", stopwatch?.Elapsed ?? TimeSpan.Zero);
                }
                catch (Exception ex)
                {
                    System.Diagnostics.Debug.WriteLine($"Memory optimization error: {ex.Message}");
                }
            }
        }

        /// <summary>
        /// Gets current memory usage statistics
        /// </summary>
        /// <returns>Memory usage information</returns>
        public MemoryUsageInfo GetMemoryUsage()
        {
            var process = System.Diagnostics.Process.GetCurrentProcess();
            
            return new MemoryUsageInfo
            {
                WorkingSetMB = process.WorkingSet64 / 1024 / 1024,
                PrivateMemoryMB = process.PrivateMemorySize64 / 1024 / 1024,
                GCTotalMemoryMB = GC.GetTotalMemory(false) / 1024 / 1024,
                Gen0Collections = GC.CollectionCount(0),
                Gen1Collections = GC.CollectionCount(1),
                Gen2Collections = GC.CollectionCount(2),
                LargeObjectHeapSizeMB = GetLargeObjectHeapSize() / 1024 / 1024
            };
        }

        /// <summary>
        /// Optimizes memory usage for large dataset operations
        /// </summary>
        /// <param name="expectedDataSize">Expected size of data to be loaded in MB</param>
        public void PrepareForLargeDataOperation(long expectedDataSizeMB)
        {
            if (expectedDataSizeMB > 100) // If loading more than 100MB
            {
                // Pre-emptively clean up memory
                OptimizeMemoryNow();

                // Adjust GC settings for large allocations
                var currentLatencyMode = GCSettings.LatencyMode;
                if (currentLatencyMode != GCLatencyMode.Batch)
                {
                    GCSettings.LatencyMode = GCLatencyMode.Batch;
                    
                    // Schedule restoration of original mode
                    Task.Run(async () =>
                    {
                        await Task.Delay(TimeSpan.FromMinutes(5));
                        GCSettings.LatencyMode = currentLatencyMode;
                    });
                }
            }
        }

        /// <summary>
        /// Cleans up after large dataset operations
        /// </summary>
        public void CleanupAfterLargeDataOperation()
        {
            // Aggressive cleanup after large operations
            Task.Run(() =>
            {
                Thread.Sleep(100); // Allow operations to complete
                OptimizeMemoryNow();
            });
        }

        /// <summary>
        /// Configures application for optimal memory usage
        /// </summary>
        public void ConfigureForOptimalMemoryUsage()
        {
            // Configure server GC for better throughput (if available)
            if (GCSettings.IsServerGC)
            {
                GCSettings.LatencyMode = GCLatencyMode.SustainedLowLatency;
            }
            else
            {
                GCSettings.LatencyMode = GCLatencyMode.Interactive;
            }

            // Set process priority for better responsiveness
            try
            {
                System.Diagnostics.Process.GetCurrentProcess().PriorityClass = 
                    System.Diagnostics.ProcessPriorityClass.AboveNormal;
            }
            catch
            {
                // Ignore if we don't have permission to change priority
            }
        }

        private void ConfigureGarbageCollection()
        {
            // Set appropriate GC mode based on system characteristics
            if (Environment.ProcessorCount >= 4) // Multi-core systems
            {
                GCSettings.LatencyMode = GCLatencyMode.SustainedLowLatency;
            }
            else
            {
                GCSettings.LatencyMode = GCLatencyMode.Interactive;
            }
        }

        private void PerformMemoryCleanup(object state)
        {
            try
            {
                var memoryUsage = GetMemoryUsage();
                
                // Check if we're above the memory threshold
                if (memoryUsage.WorkingSetMB > MemoryThresholdMB)
                {
                    System.Diagnostics.Debug.WriteLine($"Memory threshold exceeded: {memoryUsage.WorkingSetMB}MB > {MemoryThresholdMB}MB");
                    
                    // Perform cleanup on background thread to avoid UI blocking
                    Task.Run(() =>
                    {
                        OptimizeMemoryNow();
                        
                        // Notify performance monitor if available
                        _performanceMonitor?.RecordOperationTime("AutoMemoryCleanup", TimeSpan.FromMilliseconds(100));
                    });
                }
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Memory cleanup timer error: {ex.Message}");
            }
        }

        private long GetLargeObjectHeapSize()
        {
            // Estimate LOH size (this is an approximation)
            var totalMemory = GC.GetTotalMemory(false);
            var gen2Memory = GC.GetTotalMemory(true);
            return Math.Max(0, totalMemory - gen2Memory);
        }

        public void Dispose()
        {
            if (!_disposed)
            {
                lock (_lockObject)
                {
                    if (!_disposed)
                    {
                        _memoryCleanupTimer?.Dispose();
                        
                        // Final cleanup
                        OptimizeMemoryNow();
                        
                        _disposed = true;
                    }
                }
            }
        }
    }

    /// <summary>
    /// Memory usage information
    /// </summary>
    public class MemoryUsageInfo
    {
        public long WorkingSetMB { get; set; }
        public long PrivateMemoryMB { get; set; }
        public long GCTotalMemoryMB { get; set; }
        public int Gen0Collections { get; set; }
        public int Gen1Collections { get; set; }
        public int Gen2Collections { get; set; }
        public long LargeObjectHeapSizeMB { get; set; }

        public override string ToString()
        {
            return $"Working Set: {WorkingSetMB}MB, Private: {PrivateMemoryMB}MB, GC Total: {GCTotalMemoryMB}MB, " +
                   $"Collections: Gen0={Gen0Collections}, Gen1={Gen1Collections}, Gen2={Gen2Collections}";
        }
    }
}