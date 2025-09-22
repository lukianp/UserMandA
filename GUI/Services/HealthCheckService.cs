#nullable enable

using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using MandADiscoverySuite.Models;

namespace MandADiscoverySuite.Services
{
    /// <summary>
    /// Health monitoring service for production environments
    /// Monitors critical system components and data pipeline health
    /// </summary>
    public class HealthCheckService
    {
        private readonly ILogger<HealthCheckService> _logger;
        private readonly CsvDataServiceNew _csvService;
        private readonly ProfileService _profileService;
        private static HealthCheckService? _instance;

        public static HealthCheckService Instance => _instance ??= new HealthCheckService(
            LoggerFactory.Create(builder => builder.AddDebug()).CreateLogger<HealthCheckService>(),
            new CsvDataServiceNew(LoggerFactory.Create(builder => builder.AddDebug()).CreateLogger<CsvDataServiceNew>()),
            ProfileService.Instance
        );

        public HealthCheckService(
            ILogger<HealthCheckService> logger,
            CsvDataServiceNew csvService,
            ProfileService profileService)
        {
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
            _csvService = csvService ?? throw new ArgumentNullException(nameof(csvService));
            _profileService = profileService ?? throw new ArgumentNullException(nameof(profileService));
        }

        /// <summary>
        /// Performs comprehensive health check of all system components
        /// </summary>
        public async Task<SystemHealthCheckResult> PerformHealthCheckAsync()
        {
            var sw = Stopwatch.StartNew();
            var result = new SystemHealthCheckResult
            {
                Timestamp = DateTime.UtcNow,
                Checks = new List<ComponentHealthCheck>()
            };

            _logger.LogInformation("[HealthCheck] Starting comprehensive health check");

            try
            {
                // Check data paths
                result.Checks.Add(CheckDataPaths());

                // Check CSV data availability
                result.Checks.Add(await CheckCsvDataAsync());

                // Check ViewRegistry
                result.Checks.Add(CheckViewRegistry());

                // Check memory usage
                result.Checks.Add(CheckMemoryUsage());

                // Check log files
                result.Checks.Add(CheckLogFiles());

                // Calculate overall status
                result.OverallStatus = result.Checks.All(c => c.Status == HealthStatus.Healthy) 
                    ? HealthStatus.Healthy 
                    : result.Checks.Any(c => c.Status == HealthStatus.Critical) 
                        ? HealthStatus.Critical 
                        : HealthStatus.Warning;

                result.Duration = sw.Elapsed;
                
                _logger.LogInformation($"[HealthCheck] Complete status={result.OverallStatus} duration={result.Duration.TotalMilliseconds}ms checks={result.Checks.Count}");
                
                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "[HealthCheck] Failed");
                
                result.OverallStatus = HealthStatus.Critical;
                result.Duration = sw.Elapsed;
                result.Checks.Add(new ComponentHealthCheck
                {
                    Component = "HealthCheckService",
                    Status = HealthStatus.Critical,
                    Message = $"Health check failed: {ex.Message}",
                    Details = ex.ToString()
                });
                
                return result;
            }
        }

        private ComponentHealthCheck CheckDataPaths()
        {
            var check = new ComponentHealthCheck { Component = "DataPaths" };

            try
            {
                var primaryPath = Path.Combine(ConfigurationService.Instance.DiscoveryDataRootPath, "ljpops", "Raw") + Path.DirectorySeparatorChar;
                var secondaryPath = Path.Combine(ConfigurationService.Instance.DiscoveryDataRootPath, "Profiles", "ljpops", "Raw") + Path.DirectorySeparatorChar;
                var logsPath = Path.Combine(ConfigurationService.Instance.DiscoveryDataRootPath, "ljpops", "Logs") + Path.DirectorySeparatorChar;

                var issues = new List<string>();

                if (!Directory.Exists(primaryPath))
                    issues.Add($"Primary data path missing: {primaryPath}");
                
                if (!Directory.Exists(secondaryPath))
                    issues.Add($"Secondary data path missing: {secondaryPath}");
                
                if (!Directory.Exists(logsPath))
                    issues.Add($"Logs path missing: {logsPath}");

                if (issues.Count == 0)
                {
                    check.Status = HealthStatus.Healthy;
                    check.Message = "All data paths accessible";
                }
                else
                {
                    check.Status = HealthStatus.Warning;
                    check.Message = $"Some paths missing: {string.Join(", ", issues)}";
                    check.Details = string.Join("\n", issues);
                }
            }
            catch (Exception ex)
            {
                check.Status = HealthStatus.Critical;
                check.Message = $"Data path check failed: {ex.Message}";
                check.Details = ex.ToString();
            }

            return check;
        }

        private async Task<ComponentHealthCheck> CheckCsvDataAsync()
        {
            var check = new ComponentHealthCheck { Component = "CsvData" };
            
            try
            {
                var profile = _profileService.CurrentProfile ?? "ljpops";
                var dataLoaders = new List<(string Name, Func<Task<object>> Loader)>
                {
                    ("Users", async () => await _csvService.LoadUsersAsync(profile)),
                    ("Groups", async () => await _csvService.LoadGroupsAsync(profile)),
                    ("Infrastructure", async () => await _csvService.LoadInfrastructureAsync(profile)),
                    ("Applications", async () => await _csvService.LoadApplicationsAsync(profile))
                };

                var results = new List<string>();
                var totalRecords = 0;

                foreach (var (name, loader) in dataLoaders)
                {
                    try
                    {
                        var result = await loader();
                        var recordCount = GetRecordCount(result);
                        totalRecords += recordCount;
                        results.Add($"{name}: {recordCount} records");
                    }
                    catch (Exception ex)
                    {
                        results.Add($"{name}: Error - {ex.Message}");
                    }
                }

                check.Status = totalRecords > 0 ? HealthStatus.Healthy : HealthStatus.Warning;
                check.Message = $"Data loading check: {totalRecords} total records";
                check.Details = string.Join("\n", results);
            }
            catch (Exception ex)
            {
                check.Status = HealthStatus.Critical;
                check.Message = $"CSV data check failed: {ex.Message}";
                check.Details = ex.ToString();
            }

            return check;
        }

        private ComponentHealthCheck CheckViewRegistry()
        {
            var check = new ComponentHealthCheck { Component = "ViewRegistry" };

            try
            {
                var registry = ViewRegistry.Instance;
                var requiredViews = new[]
                {
                    "users", "groups", "computers", "applications", "fileservers",
                    "databases", "security", "domaindiscovery", "waves", "migrate",
                    "management", "reports", "analytics", "settings", "dashboard", "discovery"
                };

                var missingViews = requiredViews.Where(view => !registry.IsViewRegistered(view)).ToList();

                if (missingViews.Count == 0)
                {
                    check.Status = HealthStatus.Healthy;
                    check.Message = $"All {requiredViews.Length} required views registered";
                }
                else
                {
                    check.Status = HealthStatus.Critical;
                    check.Message = $"Missing views: {string.Join(", ", missingViews)}";
                    check.Details = $"Missing {missingViews.Count} of {requiredViews.Length} required views";
                }
            }
            catch (Exception ex)
            {
                check.Status = HealthStatus.Critical;
                check.Message = $"ViewRegistry check failed: {ex.Message}";
                check.Details = ex.ToString();
            }

            return check;
        }

        private ComponentHealthCheck CheckMemoryUsage()
        {
            var check = new ComponentHealthCheck { Component = "Memory" };

            try
            {
                using (var process = Process.GetCurrentProcess())
                {
                    var workingSetMB = process.WorkingSet64 / (1024 * 1024);
                    var privateMB = process.PrivateMemorySize64 / (1024 * 1024);

                    if (workingSetMB < 1000) // Less than 1GB
                    {
                        check.Status = HealthStatus.Healthy;
                        check.Message = $"Memory usage normal: {workingSetMB}MB working set";
                    }
                    else if (workingSetMB < 2000) // Less than 2GB
                    {
                        check.Status = HealthStatus.Warning;
                        check.Message = $"Memory usage elevated: {workingSetMB}MB working set";
                    }
                    else
                    {
                        check.Status = HealthStatus.Critical;
                        check.Message = $"Memory usage high: {workingSetMB}MB working set";
                    }

                    check.Details = $"Working Set: {workingSetMB}MB\nPrivate Memory: {privateMB}MB";
                }
            }
            catch (Exception ex)
            {
                check.Status = HealthStatus.Warning;
                check.Message = $"Memory check failed: {ex.Message}";
                check.Details = ex.ToString();
            }

            return check;
        }

        private ComponentHealthCheck CheckLogFiles()
        {
            var check = new ComponentHealthCheck { Component = "Logging" };

            try
            {
                var logsPath = Path.Combine(ConfigurationService.Instance.DiscoveryDataRootPath, "ljpops", "Logs") + Path.DirectorySeparatorChar;
                var logFiles = new[] { "gui-debug.log", "gui-clicks.log", "gui-binding.log" };
                var results = new List<string>();

                foreach (var logFile in logFiles)
                {
                    var filePath = Path.Combine(logsPath, logFile);
                    if (File.Exists(filePath))
                    {
                        var info = new FileInfo(filePath);
                        var sizeMB = info.Length / (1024.0 * 1024.0);
                        results.Add($"{logFile}: {sizeMB:F1}MB (modified {info.LastWriteTime:HH:mm:ss})");
                    }
                    else
                    {
                        results.Add($"{logFile}: Missing");
                    }
                }

                var existingLogs = logFiles.Count(f => File.Exists(Path.Combine(logsPath, f)));
                
                if (existingLogs == logFiles.Length)
                {
                    check.Status = HealthStatus.Healthy;
                    check.Message = "All log files present and active";
                }
                else if (existingLogs > 0)
                {
                    check.Status = HealthStatus.Warning;
                    check.Message = $"Some log files missing: {existingLogs}/{logFiles.Length} present";
                }
                else
                {
                    check.Status = HealthStatus.Critical;
                    check.Message = "No log files found";
                }

                check.Details = string.Join("\n", results);
            }
            catch (Exception ex)
            {
                check.Status = HealthStatus.Warning;
                check.Message = $"Log file check failed: {ex.Message}";
                check.Details = ex.ToString();
            }

            return check;
        }

        private static int GetRecordCount(object result)
        {
            if (result == null) return 0;
            
            var type = result.GetType();
            if (type.IsGenericType && type.GetGenericTypeDefinition() == typeof(DataLoaderResult<>))
            {
                var dataProperty = type.GetProperty("Data");
                if (dataProperty?.GetValue(result) is System.Collections.ICollection collection)
                {
                    return collection.Count;
                }
            }
            
            return 0;
        }
    }

    /// <summary>
    /// Health check result for an individual component
    /// </summary>
    public class ComponentHealthCheck
    {
        public string Component { get; set; } = string.Empty;
        public HealthStatus Status { get; set; }
        public string Message { get; set; } = string.Empty;
        public string? Details { get; set; }
    }

    /// <summary>
    /// Health check result for the entire system - Uses EnterpriseMonitoringModels.HealthCheckResult
    /// </summary>
    public class SystemHealthCheckResult
    {
        public DateTime Timestamp { get; set; }
        public HealthStatus OverallStatus { get; set; }
        public TimeSpan Duration { get; set; }
        public List<ComponentHealthCheck> Checks { get; set; } = new();
    }
}