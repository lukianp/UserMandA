using System;
using System.Collections.Generic;
using System.IO;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;

namespace MandADiscoverySuite.Services
{
    /// <summary>
    /// Service that monitors CSV files for changes and triggers view refreshes
    /// </summary>
    public class CsvFileWatcherService : IDisposable
    {
        private readonly ILogger<CsvFileWatcherService> _logger;
        private readonly string _watchPath;
        private FileSystemWatcher _watcher;
        private readonly Dictionary<string, DateTime> _lastProcessed = new();
        private bool _disposed = false;

        // Events for view refresh
        public event EventHandler<string> InfrastructureDataChanged;
        public event EventHandler<string> UsersDataChanged;
        public event EventHandler<string> ApplicationsDataChanged;
        public event EventHandler<string> DatabasesDataChanged;
        public event EventHandler<string> FileServersDataChanged;

        public CsvFileWatcherService(ILogger<CsvFileWatcherService> logger)
        {
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
            _watchPath = Path.Combine(ConfigurationService.Instance.DiscoveryDataRootPath, "ljpops", "Raw");
        }

        public void StartWatching()
        {
            try
            {
                if (!Directory.Exists(_watchPath))
                {
                    Directory.CreateDirectory(_watchPath);
                }

                _watcher = new FileSystemWatcher(_watchPath, "*.csv")
                {
                    NotifyFilter = NotifyFilters.LastWrite | NotifyFilters.FileName | NotifyFilters.Size,
                    EnableRaisingEvents = true
                };

                _watcher.Changed += OnCsvFileChanged;
                _watcher.Created += OnCsvFileChanged;
                _watcher.Renamed += OnCsvFileRenamed;

                _logger?.LogInformation($"CsvFileWatcherService started monitoring: {_watchPath}");
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Failed to start CSV file watcher");
            }
        }

        private void OnCsvFileChanged(object sender, FileSystemEventArgs e)
        {
            try
            {
                // Debounce file changes - only process if more than 2 seconds since last change
                var now = DateTime.Now;
                if (_lastProcessed.ContainsKey(e.FullPath) && 
                    (now - _lastProcessed[e.FullPath]).TotalSeconds < 2)
                {
                    return;
                }
                _lastProcessed[e.FullPath] = now;

                var fileName = Path.GetFileName(e.Name).ToLowerInvariant();
                _logger?.LogInformation($"CSV file changed: {fileName}");

                // Trigger appropriate view refresh based on file pattern
                if (IsInfrastructureFile(fileName))
                {
                    InfrastructureDataChanged?.Invoke(this, e.FullPath);
                }
                else if (IsUsersFile(fileName))
                {
                    UsersDataChanged?.Invoke(this, e.FullPath);
                }
                else if (IsApplicationsFile(fileName))
                {
                    ApplicationsDataChanged?.Invoke(this, e.FullPath);
                }
                else if (IsDatabasesFile(fileName))
                {
                    DatabasesDataChanged?.Invoke(this, e.FullPath);
                }
                else if (IsFileServersFile(fileName))
                {
                    FileServersDataChanged?.Invoke(this, e.FullPath);
                }
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, $"Error processing file change: {e.FullPath}");
            }
        }

        private void OnCsvFileRenamed(object sender, RenamedEventArgs e)
        {
            OnCsvFileChanged(sender, e);
        }

        private static bool IsInfrastructureFile(string fileName)
        {
            return fileName.Contains("computer") || fileName.Contains("vm") || 
                   fileName.Contains("server") || fileName.Contains("infrastructure") ||
                   fileName.Contains("assets");
        }

        private static bool IsUsersFile(string fileName)
        {
            return fileName.Contains("users") || fileName.Contains("activedirectoryusers") ||
                   fileName.Contains("azureusers");
        }

        private static bool IsApplicationsFile(string fileName)
        {
            return fileName.Contains("applications") || fileName.Contains("serviceprincipals") ||
                   fileName.Contains("azureapplications");
        }

        private static bool IsDatabasesFile(string fileName)
        {
            return fileName.Contains("databases") || fileName.Contains("sqlserver");
        }

        private static bool IsFileServersFile(string fileName)
        {
            return fileName.Contains("fileservers") || fileName.Contains("shares");
        }

        public void StopWatching()
        {
            try
            {
                if (_watcher != null)
                {
                    _watcher.EnableRaisingEvents = false;
                    _watcher.Dispose();
                    _watcher = null;
                    _logger?.LogInformation("CsvFileWatcherService stopped");
                }
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error stopping CSV file watcher");
            }
        }

        public void Dispose()
        {
            if (!_disposed)
            {
                StopWatching();
                _disposed = true;
            }
        }
    }
}