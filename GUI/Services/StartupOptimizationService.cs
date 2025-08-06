using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Runtime;
using System.Threading.Tasks;
using System.Windows;
using System.Windows.Threading;
using MandADiscoverySuite.Helpers;
using MandADiscoverySuite.Services;

namespace MandADiscoverySuite.Services
{
    /// <summary>
    /// Service for optimizing application startup performance
    /// </summary>
    public class StartupOptimizationService
    {
        private readonly Dictionary<string, Stopwatch> _timers = new();
        private readonly List<StartupMetric> _metrics = new();
        private readonly DispatcherTimer _idleTimer;
        private bool _startupComplete = false;

        public StartupOptimizationService()
        {
            // Timer to detect when application becomes idle
            _idleTimer = new DispatcherTimer(DispatcherPriority.ApplicationIdle)
            {
                Interval = TimeSpan.FromMilliseconds(100)
            };
            _idleTimer.Tick += OnApplicationIdle;
        }

        /// <summary>
        /// Starts timing a startup phase
        /// </summary>
        public void StartPhase(string phaseName)
        {
            var timer = Stopwatch.StartNew();
            _timers[phaseName] = timer;
        }

        /// <summary>
        /// Ends timing a startup phase
        /// </summary>
        public void EndPhase(string phaseName)
        {
            if (_timers.TryGetValue(phaseName, out var timer))
            {
                timer.Stop();
                var metric = new StartupMetric
                {
                    PhaseName = phaseName,
                    Duration = timer.Elapsed,
                    Timestamp = DateTime.UtcNow,
                    MemoryUsedMB = GC.GetTotalMemory(false) / (1024 * 1024)
                };
                
                _metrics.Add(metric);
                _timers.Remove(phaseName);
                
                Debug.WriteLine($"Startup Phase '{phaseName}': {timer.ElapsedMilliseconds}ms");
            }
        }

        /// <summary>
        /// Optimizes application resources during startup
        /// </summary>
        public void OptimizeStartup()
        {
            StartPhase("ResourceOptimization");
            
            try
            {
                // Freeze application brushes for better rendering performance
                BrushOptimizer.FreezeApplicationBrushes(Application.Current);
                
                // Set process priority to above normal during startup
                using var currentProcess = Process.GetCurrentProcess();
                currentProcess.PriorityClass = ProcessPriorityClass.AboveNormal;
                
                // Optimize garbage collection for startup
                GCSettings.LatencyMode = System.Runtime.GCLatencyMode.Interactive;
                
                // Pre-JIT critical assemblies
                PreJitCriticalCode();
                
                // Enable idle processing detection
                _idleTimer.Start();
            }
            catch (Exception ex)
            {
                Debug.WriteLine($"Startup optimization error: {ex.Message}");
            }
            finally
            {
                EndPhase("ResourceOptimization");
            }
        }

        /// <summary>
        /// Performs post-startup cleanup and optimization
        /// </summary>
        public async Task CompleteStartupAsync()
        {
            if (_startupComplete) return;
            
            StartPhase("StartupCompletion");
            
            try
            {
                // Restore normal process priority
                using var currentProcess = Process.GetCurrentProcess();
                currentProcess.PriorityClass = ProcessPriorityClass.Normal;
                
                // Optimize memory after startup
                await OptimizeMemoryAsync();
                
                // Generate startup performance report
                await GenerateStartupReportAsync();
                
                _startupComplete = true;
            }
            catch (Exception ex)
            {
                Debug.WriteLine($"Startup completion error: {ex.Message}");
            }
            finally
            {
                EndPhase("StartupCompletion");
                _idleTimer.Stop();
            }
        }

        /// <summary>
        /// Pre-JITs critical code paths to avoid startup JIT delays
        /// </summary>
        private void PreJitCriticalCode()
        {
            try
            {
                // Pre-JIT common WPF operations
                var dummy = new System.Windows.Controls.Button();
                dummy.Content = "Dummy";
                dummy.Measure(new Size(100, 30));
                
                // Pre-JIT data binding operations
                var dummyData = new { Name = "Test", Value = 42 };
                var dummyString = dummyData.ToString();
                
                // Pre-JIT collection operations
                var dummyList = new List<object> { 1, "test", DateTime.Now };
                var dummyQuery = dummyList.Where(x => x != null).ToList();
            }
            catch (Exception ex)
            {
                Debug.WriteLine($"Pre-JIT error: {ex.Message}");
            }
        }

        /// <summary>
        /// Called when application becomes idle during startup
        /// </summary>
        private async void OnApplicationIdle(object sender, EventArgs e)
        {
            if (!_startupComplete)
            {
                // Perform idle-time optimizations
                await PerformIdleOptimizationsAsync();
            }
        }

        /// <summary>
        /// Performs optimizations during idle time
        /// </summary>
        private async Task PerformIdleOptimizationsAsync()
        {
            await Task.Run(() =>
            {
                // Background optimizations that don't affect UI responsiveness
                try
                {
                    // Pre-load critical resources
                    PreloadCriticalResources();
                    
                    // Warm up caching systems
                    WarmupCaches();
                    
                    // Optimize memory layout
                    GC.Collect(0, GCCollectionMode.Optimized);
                }
                catch (Exception ex)
                {
                    Debug.WriteLine($"Idle optimization error: {ex.Message}");
                }
            });
        }

        /// <summary>
        /// Pre-loads critical resources during idle time
        /// </summary>
        private void PreloadCriticalResources()
        {
            try
            {
                // Use the ResourcePreloader helper for optimized resource loading
                ResourcePreloader.WarmupResourceSystem();
                ResourcePreloader.PreloadCriticalResources();
            }
            catch (Exception ex)
            {
                Debug.WriteLine($"Critical resource preload error: {ex.Message}");
            }
        }

        /// <summary>
        /// Warms up caching systems
        /// </summary>
        private void WarmupCaches()
        {
            try
            {
                // Warm up intelligent cache service if available
                var cacheService = ServiceLocator.GetService<IntelligentCacheService>();
                // Note: IntelligentCacheService may not have OptimizeCache method yet
                // This is a placeholder for future cache optimization
                
                // Warm up other caching systems
                var memoryService = ServiceLocator.GetService<MemoryOptimizationService>();
                // Note: MemoryOptimizationService may not have OptimizeMemoryUsage method yet
                // This is a placeholder for future memory optimization
                
                // Basic cache warmup by forcing service instantiation
                if (cacheService != null || memoryService != null)
                {
                    Debug.WriteLine("Cache services initialized during startup");
                }
            }
            catch (Exception ex)
            {
                Debug.WriteLine($"Cache warmup error: {ex.Message}");
            }
        }

        /// <summary>
        /// Optimizes memory usage after startup
        /// </summary>
        private async Task OptimizeMemoryAsync()
        {
            await Task.Run(() =>
            {
                try
                {
                    // Force garbage collection to clean up startup overhead
                    GC.Collect();
                    GC.WaitForPendingFinalizers();
                    GC.Collect();
                    
                    // Compact large object heap
                    GCSettings.LargeObjectHeapCompactionMode = GCLargeObjectHeapCompactionMode.CompactOnce;
                    GC.Collect();
                    
                    // Reset GC latency mode to interactive
                    GCSettings.LatencyMode = System.Runtime.GCLatencyMode.Interactive;
                }
                catch (Exception ex)
                {
                    Debug.WriteLine($"Memory optimization error: {ex.Message}");
                }
            });
        }

        /// <summary>
        /// Generates a startup performance report
        /// </summary>
        private async Task GenerateStartupReportAsync()
        {
            await Task.Run(() =>
            {
                try
                {
                    var report = GenerateStartupReport();
                    
                    // Write report to debug output
                    Debug.WriteLine("=== STARTUP PERFORMANCE REPORT ===");
                    Debug.WriteLine(report);
                    
                    // Optionally save to file for analysis
                    var logPath = Path.Combine(
                        Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData),
                        "MandADiscoverySuite",
                        "Performance",
                        $"startup_report_{DateTime.Now:yyyyMMdd_HHmmss}.txt"
                    );
                    
                    Directory.CreateDirectory(Path.GetDirectoryName(logPath));
                    File.WriteAllText(logPath, report);
                }
                catch (Exception ex)
                {
                    Debug.WriteLine($"Report generation error: {ex.Message}");
                }
            });
        }

        /// <summary>
        /// Gets startup performance statistics
        /// </summary>
        public StartupStats GetStartupStats()
        {
            var totalDuration = _metrics.Sum(m => m.Duration.TotalMilliseconds);
            var peakMemory = _metrics.Any() ? _metrics.Max(m => m.MemoryUsedMB) : 0;
            var phases = _metrics.Count;

            return new StartupStats
            {
                TotalStartupMs = totalDuration,
                PhaseCount = phases,
                PeakMemoryMB = peakMemory,
                IsOptimized = _startupComplete,
                Metrics = new List<StartupMetric>(_metrics)
            };
        }

        /// <summary>
        /// Generates a formatted startup report
        /// </summary>
        private string GenerateStartupReport()
        {
            var stats = GetStartupStats();
            var report = new System.Text.StringBuilder();
            
            report.AppendLine($"Application: M&A Discovery Suite");
            report.AppendLine($"Startup Time: {DateTime.Now:yyyy-MM-dd HH:mm:ss}");
            report.AppendLine($"Total Startup Duration: {stats.TotalStartupMs:F2}ms");
            report.AppendLine($"Peak Memory Usage: {stats.PeakMemoryMB:F2}MB");
            report.AppendLine($"Startup Phases: {stats.PhaseCount}");
            report.AppendLine();
            
            report.AppendLine("Phase Breakdown:");
            foreach (var metric in _metrics.OrderBy(m => m.Timestamp))
            {
                report.AppendLine($"  {metric.PhaseName}: {metric.Duration.TotalMilliseconds:F2}ms ({metric.MemoryUsedMB:F2}MB)");
            }
            
            // Performance recommendations
            report.AppendLine();
            report.AppendLine("Performance Analysis:");
            
            if (stats.TotalStartupMs > 3000)
            {
                report.AppendLine("  ⚠️  Startup time is above optimal threshold (3 seconds)");
            }
            else if (stats.TotalStartupMs > 2000)
            {
                report.AppendLine("  ⚠️  Startup time is acceptable but could be improved");
            }
            else
            {
                report.AppendLine("  ✅ Startup time is optimal");
            }
            
            if (stats.PeakMemoryMB > 200)
            {
                report.AppendLine("  ⚠️  Peak memory usage is high during startup");
            }
            else
            {
                report.AppendLine("  ✅ Memory usage during startup is reasonable");
            }
            
            return report.ToString();
        }

        public void Dispose()
        {
            _idleTimer?.Stop();
            _timers.Clear();
            _metrics.Clear();
        }
    }

    /// <summary>
    /// Represents a single startup phase metric
    /// </summary>
    public class StartupMetric
    {
        public string PhaseName { get; set; }
        public TimeSpan Duration { get; set; }
        public DateTime Timestamp { get; set; }
        public long MemoryUsedMB { get; set; }
    }

    /// <summary>
    /// Startup performance statistics
    /// </summary>
    public class StartupStats
    {
        public double TotalStartupMs { get; set; }
        public int PhaseCount { get; set; }
        public long PeakMemoryMB { get; set; }
        public bool IsOptimized { get; set; }
        public List<StartupMetric> Metrics { get; set; } = new List<StartupMetric>();

        public override string ToString()
        {
            return $"Startup: {TotalStartupMs:F1}ms, Peak Memory: {PeakMemoryMB}MB, Phases: {PhaseCount}";
        }
    }
}