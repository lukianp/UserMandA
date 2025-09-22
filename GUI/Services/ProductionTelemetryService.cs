using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;

namespace MandADiscoverySuite.Services
{
    /// <summary>
    /// Production-grade telemetry service for enterprise monitoring and analytics
    /// </summary>
    public class ProductionTelemetryService : IDisposable
    {
        private readonly ILogger<ProductionTelemetryService> _logger;
        private readonly Timer _metricsTimer;
        private readonly Dictionary<string, PerformanceCounter> _performanceCounters;
        private readonly object _metricsLock = new object();
        
        private readonly Dictionary<string, long> _counters = new Dictionary<string, long>();
        private readonly Dictionary<string, double> _gauges = new Dictionary<string, double>();
        private readonly Dictionary<string, List<double>> _histograms = new Dictionary<string, List<double>>();
        
        public ProductionTelemetryService(ILogger<ProductionTelemetryService> logger = null)
        {
            _logger = logger;
            _performanceCounters = InitializePerformanceCounters();
            _metricsTimer = new Timer(CollectMetrics, null, TimeSpan.Zero, TimeSpan.FromSeconds(15));
            
            _logger?.LogInformation("Production telemetry service initialized");
        }
        
        [System.Diagnostics.CodeAnalysis.SuppressMessage("Interoperability", "CA1416:Validate platform compatibility", Justification = "PerformanceCounter is Windows-specific but used in production environment where Windows is expected")]
        private Dictionary<string, PerformanceCounter> InitializePerformanceCounters()
        {
            var counters = new Dictionary<string, PerformanceCounter>();

            try
            {
                // CPU Usage
                counters["cpu"] = new PerformanceCounter(
                    "Processor",
                    "% Processor Time",
                    "_Total",
                    true);

                // Memory Usage
                counters["memory"] = new PerformanceCounter(
                    "Memory",
                    "Available MBytes",
                    true);

                // Process-specific counters
                var processName = Process.GetCurrentProcess().ProcessName;

                counters["process_cpu"] = new PerformanceCounter(
                    "Process",
                    "% Processor Time",
                    processName,
                    true);

                counters["process_memory"] = new PerformanceCounter(
                    "Process",
                    "Working Set",
                    processName,
                    true);

                counters["process_threads"] = new PerformanceCounter(
                    "Process",
                    "Thread Count",
                    processName,
                    true);
            }
            catch (Exception ex)
            {
                _logger?.LogWarning(ex, "Failed to initialize some performance counters");
            }

            return counters;
        }
        
        /// <summary>
        /// Track a migration event with detailed telemetry
        /// </summary>
        public void TrackMigrationEvent(MigrationTelemetryEvent migrationEvent)
        {
            try
            {
                // Increment counters
                IncrementCounter($"migration.{migrationEvent.MigrationType}.started");
                
                if (migrationEvent.Success)
                {
                    IncrementCounter($"migration.{migrationEvent.MigrationType}.success");
                }
                else
                {
                    IncrementCounter($"migration.{migrationEvent.MigrationType}.failed");
                }
                
                // Track duration
                if (migrationEvent.Duration.HasValue)
                {
                    RecordHistogram($"migration.{migrationEvent.MigrationType}.duration", 
                                   migrationEvent.Duration.Value.TotalSeconds);
                }
                
                // Track items processed
                if (migrationEvent.ItemsProcessed > 0)
                {
                    RecordGauge($"migration.{migrationEvent.MigrationType}.items", 
                               migrationEvent.ItemsProcessed);
                }
                
                // Log the event
                _logger?.LogInformation(
                    "Migration telemetry: Type={Type}, Success={Success}, Duration={Duration}s, Items={Items}",
                    migrationEvent.MigrationType,
                    migrationEvent.Success,
                    migrationEvent.Duration?.TotalSeconds ?? 0,
                    migrationEvent.ItemsProcessed);
                
                // Send to Application Insights or other telemetry service
                SendToTelemetryService(migrationEvent);
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Failed to track migration telemetry");
            }
        }
        
        /// <summary>
        /// Track application performance metrics
        /// </summary>
        public void TrackPerformanceMetric(string metricName, double value, Dictionary<string, string> properties = null)
        {
            try
            {
                RecordGauge($"app.performance.{metricName}", value);
                
                _logger?.LogDebug("Performance metric: {Metric}={Value}", metricName, value);
                
                // Send to telemetry service
                SendPerformanceMetric(metricName, value, properties);
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Failed to track performance metric");
            }
        }
        
        /// <summary>
        /// Track user interaction events
        /// </summary>
        public void TrackUserInteraction(string action, string target, Dictionary<string, string> properties = null)
        {
            try
            {
                IncrementCounter($"user.interaction.{action}");
                
                _logger?.LogInformation("User interaction: Action={Action}, Target={Target}", action, target);
                
                // Send to telemetry service
                SendUserInteractionEvent(action, target, properties);
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Failed to track user interaction");
            }
        }
        
        /// <summary>
        /// Track exceptions with full context
        /// </summary>
        public void TrackException(Exception exception, Dictionary<string, string> properties = null)
        {
            try
            {
                IncrementCounter($"app.exceptions.{exception.GetType().Name}");
                
                _logger?.LogError(exception, "Tracked exception");
                
                // Send to telemetry service with full stack trace
                SendExceptionTelemetry(exception, properties);
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Failed to track exception telemetry");
            }
        }
        
        /// <summary>
        /// Get current metrics snapshot for Prometheus export
        /// </summary>
        public string GetPrometheusMetrics()
        {
            lock (_metricsLock)
            {
                var metrics = new System.Text.StringBuilder();
                
                // Export counters
                foreach (var counter in _counters)
                {
                    metrics.AppendLine($"# TYPE {counter.Key} counter");
                    metrics.AppendLine($"{counter.Key} {counter.Value}");
                }
                
                // Export gauges
                foreach (var gauge in _gauges)
                {
                    metrics.AppendLine($"# TYPE {gauge.Key} gauge");
                    metrics.AppendLine($"{gauge.Key} {gauge.Value}");
                }
                
                // Export histograms (simplified - just average for now)
                foreach (var histogram in _histograms)
                {
                    if (histogram.Value.Count > 0)
                    {
                        var avg = histogram.Value.Count > 0 
                            ? histogram.Value.Average() 
                            : 0;
                        
                        metrics.AppendLine($"# TYPE {histogram.Key} histogram");
                        metrics.AppendLine($"{histogram.Key}_avg {avg}");
                        metrics.AppendLine($"{histogram.Key}_count {histogram.Value.Count}");
                    }
                }
                
                return metrics.ToString();
            }
        }
        
        [System.Diagnostics.CodeAnalysis.SuppressMessage("Interoperability", "CA1416:Validate platform compatibility", Justification = "PerformanceCounter.NextValue() is Windows-specific but used in production environment where Windows is expected")]
        private void CollectMetrics(object state)
        {
            try
            {
                // Collect system metrics
                foreach (var counter in _performanceCounters)
                {
                    try
                    {
                        var value = counter.Value.NextValue();
                        RecordGauge($"system.{counter.Key}", value);
                    }
                    catch
                    {
                        // Ignore individual counter failures
                    }
                }

                // Collect GC metrics
                RecordGauge("dotnet.gc.gen0", GC.CollectionCount(0));
                RecordGauge("dotnet.gc.gen1", GC.CollectionCount(1));
                RecordGauge("dotnet.gc.gen2", GC.CollectionCount(2));
                RecordGauge("dotnet.gc.memory", GC.GetTotalMemory(false) / (1024 * 1024)); // MB
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Failed to collect metrics");
            }
        }
        
        private void IncrementCounter(string name)
        {
            lock (_metricsLock)
            {
                if (!_counters.ContainsKey(name))
                    _counters[name] = 0;
                _counters[name]++;
            }
        }
        
        private void RecordGauge(string name, double value)
        {
            lock (_metricsLock)
            {
                _gauges[name] = value;
            }
        }
        
        private void RecordHistogram(string name, double value)
        {
            lock (_metricsLock)
            {
                if (!_histograms.ContainsKey(name))
                    _histograms[name] = new List<double>();
                
                _histograms[name].Add(value);
                
                // Keep only last 100 values to prevent memory growth
                if (_histograms[name].Count > 100)
                    _histograms[name].RemoveAt(0);
            }
        }
        
        private void SendToTelemetryService(MigrationTelemetryEvent telemetryEvent)
        {
            // TODO: Implement Application Insights or custom telemetry service integration
            // This would send to Azure Application Insights, Datadog, New Relic, etc.
        }
        
        private void SendPerformanceMetric(string name, double value, Dictionary<string, string> properties)
        {
            // TODO: Implement telemetry service integration
        }
        
        private void SendUserInteractionEvent(string action, string target, Dictionary<string, string> properties)
        {
            // TODO: Implement telemetry service integration
        }
        
        private void SendExceptionTelemetry(Exception exception, Dictionary<string, string> properties)
        {
            // TODO: Implement telemetry service integration
        }
        
        [System.Diagnostics.CodeAnalysis.SuppressMessage("Interoperability", "CA1416:Validate platform compatibility", Justification = "PerformanceCounter disposal is Windows-specific but used in production environment where Windows is expected")]
        public void Dispose()
        {
            _metricsTimer?.Dispose();

            foreach (var counter in _performanceCounters.Values)
            {
                counter?.Dispose();
            }

            _logger?.LogInformation("Production telemetry service disposed");
        }
    }
    
    /// <summary>
    /// Migration telemetry event data
    /// </summary>
    public class MigrationTelemetryEvent
    {
        public string MigrationId { get; set; }
        public string MigrationType { get; set; }
        public bool Success { get; set; }
        public TimeSpan? Duration { get; set; }
        public int ItemsProcessed { get; set; }
        public int ItemsFailed { get; set; }
        public string ErrorMessage { get; set; }
        public Dictionary<string, string> Properties { get; set; }
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    }
}