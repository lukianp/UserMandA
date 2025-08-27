using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using MandADiscoverySuite.Models;
using Microsoft.Extensions.Logging;
using System.Text.Json;

namespace MandADiscoverySuite.Services
{
    /// <summary>
    /// Discovery runtime service for log tailing and module status management
    /// </summary>
    public class DiscoveryRuntimeService : IDisposable
    {
        private readonly ILogger<DiscoveryRuntimeService> _logger;
        private readonly StructuredLoggingService _structuredLogger;
        private readonly List<FileSystemWatcher> _watchers = new();
        private bool _disposed = false;

        public DiscoveryRuntimeService(ILogger<DiscoveryRuntimeService> logger)
        {
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
            _structuredLogger = StructuredLoggingService.Instance;
        }

        /// <summary>
        /// Starts tailing log files with pattern and calls onLine for each new line
        /// </summary>
        public void StartTail(string logPathPattern, Action<string> onLine)
        {
            try
            {
                var logDirectory = Path.GetDirectoryName(logPathPattern) ?? @"C:\discoverydata\ljpops\Logs";
                var filePattern = Path.GetFileName(logPathPattern) ?? "*.log";

                if (!Directory.Exists(logDirectory))
                {
                    Directory.CreateDirectory(logDirectory);
                }

                var watcher = new FileSystemWatcher(logDirectory, filePattern)
                {
                    NotifyFilter = NotifyFilters.LastWrite | NotifyFilters.Size,
                    EnableRaisingEvents = true
                };

                watcher.Changed += (sender, e) =>
                {
                    try
                    {
                        // Read new lines from file
                        var lines = File.ReadAllLines(e.FullPath);
                        foreach (var line in lines.TakeLast(5)) // Get last 5 lines
                        {
                            if (!string.IsNullOrWhiteSpace(line))
                            {
                                onLine?.Invoke(line);
                            }
                        }
                    }
                    catch (Exception ex)
                    {
                        _logger?.LogWarning($"Error reading log file {e.FullPath}: {ex.Message}");
                    }
                };

                _watchers.Add(watcher);
                
                _structuredLogger?.LogInfo("DiscoveryRuntimeService", 
                    new { action = "start_tail", pattern = logPathPattern }, 
                    "Started log tail monitoring");
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, $"Failed to start log tail for pattern: {logPathPattern}");
                _structuredLogger?.LogError("DiscoveryRuntimeService", ex,
                    new { action = "start_tail_fail", pattern = logPathPattern },
                    "Failed to start log tail monitoring");
            }
        }

        /// <summary>
        /// Stops all log tailing
        /// </summary>
        public void StopTail()
        {
            foreach (var watcher in _watchers)
            {
                watcher?.Dispose();
            }
            _watchers.Clear();
            
            _structuredLogger?.LogInfo("DiscoveryRuntimeService",
                new { action = "stop_tail" },
                "Stopped all log tail monitoring");
        }

        /// <summary>
        /// Gets module statuses from status file or infers from logs
        /// </summary>
        public Dictionary<string, string> GetModuleStatuses()
        {
            var statuses = new Dictionary<string, string>();
            
            try
            {
                var statusFilePath = @"C:\discoverydata\ljpops\Logs\discovery-status.json";
                
                if (File.Exists(statusFilePath))
                {
                    var json = File.ReadAllText(statusFilePath);
                    var data = JsonSerializer.Deserialize<Dictionary<string, object>>(json);
                    
                    foreach (var kvp in data ?? new Dictionary<string, object>())
                    {
                        statuses[kvp.Key] = kvp.Value?.ToString() ?? "Pending";
                    }
                }
                else
                {
                    // Default to Pending for all modules if no status file
                    var defaultModules = new[] { "Users", "Groups", "Infrastructure", "Applications", 
                        "Exchange", "Teams", "SharePoint", "Intune", "NetworkInfrastructure", 
                        "SQLServer", "FileServer", "VMware", "PhysicalServer" };
                    
                    foreach (var module in defaultModules)
                    {
                        statuses[module] = "Pending";
                    }
                }
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Failed to get module statuses");
                _structuredLogger?.LogError("DiscoveryRuntimeService", ex,
                    new { action = "get_module_statuses_fail" },
                    "Failed to load module statuses");
            }

            return statuses;
        }

        /// <summary>
        /// Runs a discovery module asynchronously using the universal launcher script
        /// </summary>
        public async Task RunModuleAsync(DiscoveryModuleTile tile)
        {
            if (tile == null) throw new ArgumentNullException(nameof(tile));

            try
            {
                _structuredLogger?.LogInfo("DiscoveryRuntimeService",
                    new { action = "module_start", module = tile.Key, script = tile.ScriptPath },
                    $"Starting discovery module: {tile.DisplayName}");

                // Use DiscoveryModuleLauncher.ps1 as specified in instructions
                var launcherPath = @"C:\enterprisediscovery\Scripts\DiscoveryModuleLauncher.ps1";
                var currentProfile = ProfileService.Instance?.CurrentProfile ?? "ljpops";
                var arguments = $"-NoProfile -ExecutionPolicy Bypass -File \"{launcherPath}\" -ModuleName \"{tile.Key}\" -CompanyName \"{currentProfile}\"";

                var processStartInfo = new ProcessStartInfo
                {
                    FileName = "powershell.exe",
                    Arguments = arguments,
                    UseShellExecute = true,
                    CreateNoWindow = false,
                    WorkingDirectory = @"C:\enterprisediscovery"
                };

                using var process = new Process { StartInfo = processStartInfo };
                
                process.Start();
                
                // Since UseShellExecute = true, we can't redirect output, but the PowerShell window will show progress
                await process.WaitForExitAsync();

                if (process.ExitCode == 0)
                {
                    _structuredLogger?.LogInfo("DiscoveryRuntimeService",
                        new { action = "module_complete", module = tile.Key, exit_code = process.ExitCode },
                        $"Discovery module completed successfully: {tile.DisplayName}");
                }
                else
                {
                    _structuredLogger?.LogError("DiscoveryRuntimeService", 
                        new { action = "module_error", module = tile.Key, exit_code = process.ExitCode },
                        $"Discovery module failed: {tile.DisplayName}");
                }
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, $"Failed to run discovery module: {tile.DisplayName}");
                _structuredLogger?.LogError("DiscoveryRuntimeService", ex,
                    new { action = "module_run_fail", module = tile.Key },
                    $"Failed to run discovery module: {tile.DisplayName}");
            }
        }

        public void Dispose()
        {
            if (!_disposed)
            {
                StopTail();
                _disposed = true;
            }
        }
    }
}