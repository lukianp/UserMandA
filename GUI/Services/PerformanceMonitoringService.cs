using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using System.Windows;
using System.Windows.Threading;

namespace MandADiscoverySuite.Services
{
    /// <summary>
    /// Service for monitoring and logging application performance metrics
    /// </summary>
    public class PerformanceMonitoringService
    {
        private readonly Dictionary<string, Stopwatch> _activeTimers = new();
        private readonly List<PerformanceMetric> _metrics = new();
        private readonly object _lock = new();
        private readonly DispatcherTimer _memoryMonitor;
        private readonly string _logPath;
        private long _lastGcMemory;
        private int _gcCount;

        public PerformanceMonitoringService()
        {
            _logPath = Path.Combine(
                Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData),
                "MandADiscoverySuite",
                "Performance",
                $"performance_{DateTime.Now:yyyyMMdd_HHmmss}.log"
            );
            
            Directory.CreateDirectory(Path.GetDirectoryName(_logPath));
            
            // Monitor memory every 30 seconds
            _memoryMonitor = new DispatcherTimer
            {
                Interval = TimeSpan.FromSeconds(30)
            };
            _memoryMonitor.Tick += MonitorMemory;
            _memoryMonitor.Start();
        }

        /// <summary>
        /// Starts timing an operation
        /// </summary>
        public void StartTimer(string operationName)
        {
            lock (_lock)
            {
                if (!_activeTimers.ContainsKey(operationName))
                {
                    _activeTimers[operationName] = Stopwatch.StartNew();
                }
                else
                {
                    _activeTimers[operationName].Restart();
                }
            }
        }

        /// <summary>
        /// Stops timing an operation and logs the result
        /// </summary>
        public TimeSpan StopTimer(string operationName)
        {
            lock (_lock)
            {
                if (_activeTimers.TryGetValue(operationName, out var timer))
                {
                    timer.Stop();
                    var elapsed = timer.Elapsed;
                    
                    var metric = new PerformanceMetric
                    {
                        Operation = operationName,
                        Duration = elapsed,
                        Timestamp = DateTime.UtcNow,
                        MemoryUsedMB = GC.GetTotalMemory(false) / (1024 * 1024)
                    };
                    
                    _metrics.Add(metric);
                    _activeTimers.Remove(operationName);
                    
                    LogMetric(metric);
                    
                    return elapsed;
                }
                
                return TimeSpan.Zero;
            }
        }

        /// <summary>
        /// Measures the time taken to execute an action
        /// </summary>
        public void MeasureTime(string operationName, Action action)
        {
            StartTimer(operationName);
            try
            {
                action();
            }
            finally
            {
                StopTimer(operationName);
            }
        }

        /// <summary>
        /// Measures the time taken to execute an async operation
        /// </summary>
        public async Task<T> MeasureTimeAsync<T>(string operationName, Func<Task<T>> operation)
        {
            StartTimer(operationName);
            try
            {
                return await operation();
            }
            finally
            {
                StopTimer(operationName);
            }
        }

        /// <summary>
        /// Logs a performance warning if an operation exceeds the threshold
        /// </summary>
        public void LogIfSlow(string operationName, TimeSpan duration, TimeSpan threshold)
        {
            if (duration > threshold)
            {
                var warning = $"SLOW OPERATION: {operationName} took {duration.TotalMilliseconds:F2}ms (threshold: {threshold.TotalMilliseconds:F2}ms)";
                LogMessage(warning);
                Debug.WriteLine(warning);
            }
        }

        /// <summary>
        /// Gets performance statistics for a specific operation
        /// </summary>
        public OperationStats GetStats(string operationName)
        {
            lock (_lock)
            {
                var operationMetrics = _metrics.Where(m => m.Operation == operationName).ToList();
                
                if (!operationMetrics.Any())
                    return new OperationStats { Operation = operationName };
                
                var durations = operationMetrics.Select(m => m.Duration.TotalMilliseconds).ToList();
                
                return new OperationStats
                {
                    Operation = operationName,
                    Count = operationMetrics.Count,
                    TotalMs = durations.Sum(),
                    AverageMs = durations.Average(),
                    MinMs = durations.Min(),
                    MaxMs = durations.Max(),
                    MedianMs = GetMedian(durations)
                };
            }
        }

        /// <summary>
        /// Gets all performance metrics
        /// </summary>
        public List<PerformanceMetric> GetAllMetrics()
        {
            lock (_lock)
            {
                return new List<PerformanceMetric>(_metrics);
            }
        }

        /// <summary>
        /// Exports performance report to file
        /// </summary>
        public async Task ExportReportAsync(string filePath = null)
        {
            filePath = filePath ?? Path.ChangeExtension(_logPath, ".report.txt");
            
            var report = new StringBuilder();
            report.AppendLine("=== M&A Discovery Suite Performance Report ===");
            report.AppendLine($"Generated: {DateTime.Now:yyyy-MM-dd HH:mm:ss}");
            report.AppendLine();
            
            // Group metrics by operation
            var groupedMetrics = _metrics.GroupBy(m => m.Operation);
            
            foreach (var group in groupedMetrics.OrderBy(g => g.Key))
            {
                var stats = GetStats(group.Key);
                report.AppendLine($"Operation: {stats.Operation}");
                report.AppendLine($"  Executions: {stats.Count}");
                report.AppendLine($"  Total: {stats.TotalMs:F2}ms");
                report.AppendLine($"  Average: {stats.AverageMs:F2}ms");
                report.AppendLine($"  Min: {stats.MinMs:F2}ms");
                report.AppendLine($"  Max: {stats.MaxMs:F2}ms");
                report.AppendLine($"  Median: {stats.MedianMs:F2}ms");
                report.AppendLine();
            }
            
            // Memory statistics
            report.AppendLine("Memory Statistics:");
            report.AppendLine($"  Current: {GC.GetTotalMemory(false) / (1024 * 1024):F2} MB");
            report.AppendLine($"  GC Collections: {_gcCount}");
            report.AppendLine();
            
            await File.WriteAllTextAsync(filePath, report.ToString());
        }

        private void MonitorMemory(object sender, EventArgs e)
        {
            var currentMemory = GC.GetTotalMemory(false);
            
            // Check for significant memory changes or GC
            if (Math.Abs(currentMemory - _lastGcMemory) > 10 * 1024 * 1024) // 10MB change
            {
                _gcCount++;
                LogMessage($"Memory: {currentMemory / (1024 * 1024):F2}MB, GC Count: {_gcCount}");
            }
            
            _lastGcMemory = currentMemory;
        }

        private void LogMetric(PerformanceMetric metric)
        {
            var logEntry = $"{metric.Timestamp:HH:mm:ss.fff} | {metric.Operation} | {metric.Duration.TotalMilliseconds:F2}ms | {metric.MemoryUsedMB:F2}MB";
            LogMessage(logEntry);
        }

        private void LogMessage(string message)
        {
            try
            {
                File.AppendAllText(_logPath, $"{DateTime.Now:yyyy-MM-dd HH:mm:ss.fff} | {message}{Environment.NewLine}");
            }
            catch
            {
                // Ignore logging errors
            }
        }

        private double GetMedian(List<double> values)
        {
            if (!values.Any()) return 0;
            
            var sorted = values.OrderBy(v => v).ToList();
            int middle = sorted.Count / 2;
            
            if (sorted.Count % 2 == 0)
                return (sorted[middle - 1] + sorted[middle]) / 2.0;
            
            return sorted[middle];
        }

        public void Dispose()
        {
            _memoryMonitor?.Stop();
        }
    }

    /// <summary>
    /// Represents a single performance metric
    /// </summary>
    public class PerformanceMetric
    {
        public string Operation { get; set; }
        public TimeSpan Duration { get; set; }
        public DateTime Timestamp { get; set; }
        public long MemoryUsedMB { get; set; }
    }

    /// <summary>
    /// Performance statistics for an operation
    /// </summary>
    public class OperationStats
    {
        public string Operation { get; set; }
        public int Count { get; set; }
        public double TotalMs { get; set; }
        public double AverageMs { get; set; }
        public double MinMs { get; set; }
        public double MaxMs { get; set; }
        public double MedianMs { get; set; }
    }
}