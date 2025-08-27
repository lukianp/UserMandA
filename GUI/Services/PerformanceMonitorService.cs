using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Windows.Threading;

namespace MandADiscoverySuite.Services
{
    /// <summary>
    /// Service for monitoring UI performance and providing optimization feedback
    /// </summary>
    public class PerformanceMonitorService : IDisposable
    {
        private readonly Dictionary<string, PerformanceCounter> _counters;
        private readonly Dictionary<string, List<TimeSpan>> _operationTimes;
        private readonly DispatcherTimer _monitoringTimer;
        private bool _disposed;

        /// <summary>
        /// Event raised when performance issues are detected
        /// </summary>
        public event EventHandler<PerformanceWarningEventArgs> PerformanceWarning;

        public PerformanceMonitorService()
        {
            _counters = new Dictionary<string, PerformanceCounter>();
            _operationTimes = new Dictionary<string, List<TimeSpan>>();

            // Initialize performance counters
            InitializeCounters();

            // Set up monitoring timer (check every 5 seconds)
            _monitoringTimer = new DispatcherTimer(DispatcherPriority.Background)
            {
                Interval = TimeSpan.FromSeconds(5)
            };
            _monitoringTimer.Tick += MonitoringTimer_Tick;
            _monitoringTimer.Start();
        }

        /// <summary>
        /// Starts timing an operation
        /// </summary>
        /// <param name="operationName">Name of the operation</param>
        /// <returns>Stopwatch instance to stop timing</returns>
        public Stopwatch StartTiming(string operationName)
        {
            var stopwatch = Stopwatch.StartNew();
            return stopwatch;
        }

        /// <summary>
        /// Records the completion time of an operation
        /// </summary>
        /// <param name="operationName">Name of the operation</param>
        /// <param name="elapsed">Elapsed time</param>
        public void RecordOperationTime(string operationName, TimeSpan elapsed)
        {
            if (!_operationTimes.ContainsKey(operationName))
            {
                _operationTimes[operationName] = new List<TimeSpan>();
            }

            _operationTimes[operationName].Add(elapsed);

            // Keep only the last 50 measurements to prevent memory growth
            if (_operationTimes[operationName].Count > 50)
            {
                _operationTimes[operationName].RemoveAt(0);
            }

            // Check for performance issues
            CheckPerformanceThresholds(operationName, elapsed);
        }

        /// <summary>
        /// Gets performance statistics for an operation
        /// </summary>
        /// <param name="operationName">Name of the operation</param>
        /// <returns>Performance statistics</returns>
        public PerformanceStats GetOperationStats(string operationName)
        {
            if (!_operationTimes.ContainsKey(operationName) || !_operationTimes[operationName].Any())
            {
                return new PerformanceStats
                {
                    OperationName = operationName,
                    SampleCount = 0
                };
            }

            var times = _operationTimes[operationName];
            var totalMs = times.Sum(t => t.TotalMilliseconds);

            return new PerformanceStats
            {
                OperationName = operationName,
                SampleCount = times.Count,
                AverageMs = totalMs / times.Count,
                MinMs = times.Min(t => t.TotalMilliseconds),
                MaxMs = times.Max(t => t.TotalMilliseconds),
                TotalMs = totalMs
            };
        }

        /// <summary>
        /// Gets all recorded performance statistics
        /// </summary>
        /// <returns>Dictionary of operation names to statistics</returns>
        public Dictionary<string, PerformanceStats> GetAllStats()
        {
            var stats = new Dictionary<string, PerformanceStats>();
            foreach (var operationName in _operationTimes.Keys)
            {
                stats[operationName] = GetOperationStats(operationName);
            }
            return stats;
        }

        /// <summary>
        /// Gets current system performance metrics
        /// </summary>
        /// <returns>System performance metrics</returns>
        public SystemPerformanceMetrics GetSystemMetrics()
        {
            var metrics = new SystemPerformanceMetrics();

            try
            {
                if (_counters.ContainsKey("CPU"))
                    metrics.CpuUsagePercent = _counters["CPU"].NextValue();

                if (_counters.ContainsKey("Memory"))
                    metrics.MemoryUsageMB = _counters["Memory"].NextValue() / 1024 / 1024;

                // Get current process info
                var process = Process.GetCurrentProcess();
                metrics.WorkingSetMB = process.WorkingSet64 / 1024 / 1024;
                metrics.PrivateMemoryMB = process.PrivateMemorySize64 / 1024 / 1024;
                metrics.ThreadCount = process.Threads.Count;
                metrics.HandleCount = process.HandleCount;
            }
            catch (Exception ex)
            {
                Debug.WriteLine($"Error getting system metrics: {ex.Message}");
            }

            return metrics;
        }

        private void InitializeCounters()
        {
            try
            {
                // CPU usage counter
                _counters["CPU"] = new PerformanceCounter("Processor", "% Processor Time", "_Total");

                // Available memory counter
                _counters["Memory"] = new PerformanceCounter("Memory", "Available MBytes");
            }
            catch (Exception ex)
            {
                Debug.WriteLine($"Failed to initialize performance counters: {ex.Message}");
            }
        }

        private void MonitoringTimer_Tick(object sender, EventArgs e)
        {
            try
            {
                var systemMetrics = GetSystemMetrics();

                // Check for high CPU usage
                if (systemMetrics.CpuUsagePercent > 80)
                {
                    OnPerformanceWarning(new PerformanceWarningEventArgs
                    {
                        WarningType = PerformanceWarningType.HighCpuUsage,
                        Message = $"High CPU usage detected: {systemMetrics.CpuUsagePercent:F1}%",
                        Value = systemMetrics.CpuUsagePercent
                    });
                }

                // Check for high memory usage
                if (systemMetrics.WorkingSetMB > 1000) // > 1GB
                {
                    OnPerformanceWarning(new PerformanceWarningEventArgs
                    {
                        WarningType = PerformanceWarningType.HighMemoryUsage,
                        Message = $"High memory usage detected: {systemMetrics.WorkingSetMB:F0} MB",
                        Value = systemMetrics.WorkingSetMB
                    });
                }
            }
            catch (Exception ex)
            {
                Debug.WriteLine($"Error in performance monitoring: {ex.Message}");
            }
        }

        private void CheckPerformanceThresholds(string operationName, TimeSpan elapsed)
        {
            var thresholds = new Dictionary<string, double>
            {
                { "DataLoad", 2000 }, // 2 seconds
                { "UIUpdate", 100 },  // 100 ms
                { "Search", 500 },    // 500 ms
                { "Navigation", 200 } // 200 ms
            };

            foreach (var threshold in thresholds)
            {
                if (operationName.Contains(threshold.Key, StringComparison.InvariantCultureIgnoreCase) && 
                    elapsed.TotalMilliseconds > threshold.Value)
                {
                    OnPerformanceWarning(new PerformanceWarningEventArgs
                    {
                        WarningType = PerformanceWarningType.SlowOperation,
                        Message = $"Slow {operationName} operation: {elapsed.TotalMilliseconds:F0}ms (threshold: {threshold.Value}ms)",
                        Value = elapsed.TotalMilliseconds,
                        OperationName = operationName
                    });
                    break;
                }
            }
        }

        private void OnPerformanceWarning(PerformanceWarningEventArgs e)
        {
            PerformanceWarning?.Invoke(this, e);
            Debug.WriteLine($"Performance Warning: {e.Message}");
        }

        public void Dispose()
        {
            if (!_disposed)
            {
                _monitoringTimer?.Stop();
                
                foreach (var counter in _counters.Values)
                {
                    counter?.Dispose();
                }
                _counters.Clear();
                _operationTimes.Clear();

                _disposed = true;
            }
        }
    }

    /// <summary>
    /// Performance statistics for an operation
    /// </summary>
    public class PerformanceStats
    {
        public string OperationName { get; set; }
        public int SampleCount { get; set; }
        public double AverageMs { get; set; }
        public double MinMs { get; set; }
        public double MaxMs { get; set; }
        public double TotalMs { get; set; }
    }

    /// <summary>
    /// System performance metrics
    /// </summary>
    public class SystemPerformanceMetrics
    {
        public double CpuUsagePercent { get; set; }
        public double MemoryUsageMB { get; set; }
        public long WorkingSetMB { get; set; }
        public long PrivateMemoryMB { get; set; }
        public int ThreadCount { get; set; }
        public int HandleCount { get; set; }
    }

    /// <summary>
    /// Performance warning event arguments
    /// </summary>
    public class PerformanceWarningEventArgs : EventArgs
    {
        public PerformanceWarningType WarningType { get; set; }
        public string Message { get; set; }
        public double Value { get; set; }
        public string OperationName { get; set; }
    }

    /// <summary>
    /// Types of performance warnings
    /// </summary>
    public enum PerformanceWarningType
    {
        SlowOperation,
        HighCpuUsage,
        HighMemoryUsage,
        ExcessiveGarbageCollection
    }
}