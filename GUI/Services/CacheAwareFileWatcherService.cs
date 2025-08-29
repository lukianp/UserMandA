using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;

namespace MandADiscoverySuite.Services
{
    /// <summary>
    /// T-030: Enhanced file watcher service that integrates with multi-tier cache for automatic invalidation
    /// </summary>
    public class CacheAwareFileWatcherService : IDisposable
    {
        private readonly ILogger<CacheAwareFileWatcherService> _logger;
        private readonly MultiTierCacheService _cacheService;
        private readonly ILogicEngineService _logicEngineService;
        private readonly string _watchPath;
        private FileSystemWatcher _watcher;
        private readonly ConcurrentDictionary<string, DateTime> _lastProcessed = new();
        private readonly Timer _debounceTimer;
        private readonly ConcurrentQueue<string> _changedFiles = new();
        private readonly SemaphoreSlim _processingLock = new(1, 1);
        private bool _disposed = false;

        // Cache invalidation patterns - maps file patterns to cache key prefixes to invalidate
        private readonly Dictionary<string, string[]> _cacheInvalidationMap = new(StringComparer.OrdinalIgnoreCase)
        {
            { "*users*.csv", new[] { "UserDetail:", "Users:", "UserList:" } },
            { "*groups*.csv", new[] { "GroupDetail:", "Groups:", "GroupList:" } },
            { "*computers*.csv", new[] { "AssetDetail:", "Devices:", "DeviceList:" } },
            { "*applications*.csv", new[] { "Applications:", "AppList:" } },
            { "*databases*.csv", new[] { "DatabaseDetail:", "Databases:", "SqlDb:" } },
            { "*fileservers*.csv", new[] { "FileShares:", "ShareDetail:" } },
            { "*mailboxes*.csv", new[] { "MailboxDetail:", "Mailboxes:" } },
            { "*threats*.csv", new[] { "ThreatAnalysis:", "SecurityDashboard:" } },
            { "*governance*.csv", new[] { "DataGovernance:", "ComplianceReport:" } },
            { "*lineage*.csv", new[] { "DataLineage:", "DependencyGraph:" } }
        };

        // Events for view refresh
        public event EventHandler<CacheInvalidationEventArgs> CacheInvalidated;
        public event EventHandler<string> DataRefreshRequired;

        public CacheAwareFileWatcherService(
            ILogger<CacheAwareFileWatcherService> logger, 
            MultiTierCacheService cacheService,
            ILogicEngineService logicEngineService)
        {
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
            _cacheService = cacheService ?? throw new ArgumentNullException(nameof(cacheService));
            _logicEngineService = logicEngineService ?? throw new ArgumentNullException(nameof(logicEngineService));
            _watchPath = Path.Combine(ConfigurationService.Instance.DiscoveryDataRootPath, "ljpops", "Raw");
            
            // Debounce timer to batch file change processing
            _debounceTimer = new Timer(ProcessFileChanges, null, Timeout.Infinite, Timeout.Infinite);
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
                    EnableRaisingEvents = true,
                    IncludeSubdirectories = true // Monitor subdirectories as well
                };

                _watcher.Changed += OnCsvFileChanged;
                _watcher.Created += OnCsvFileChanged;
                _watcher.Renamed += OnCsvFileRenamed;
                _watcher.Error += OnWatcherError;

                _logger.LogInformation("CacheAwareFileWatcherService started monitoring: {WatchPath}", _watchPath);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to start cache-aware CSV file watcher");
            }
        }

        private void OnCsvFileChanged(object sender, FileSystemEventArgs e)
        {
            try
            {
                // Debounce file changes - only process if more than 2 seconds since last change
                var now = DateTime.UtcNow;
                if (_lastProcessed.ContainsKey(e.FullPath) && 
                    (now - _lastProcessed[e.FullPath]).TotalSeconds < 2)
                {
                    return;
                }
                _lastProcessed[e.FullPath] = now;

                var fileName = Path.GetFileName(e.Name).ToLowerInvariant();
                _logger.LogInformation("CSV file changed: {FileName} at {Path}", fileName, e.FullPath);

                // Queue file for processing
                _changedFiles.Enqueue(e.FullPath);

                // Reset debounce timer to batch changes
                _debounceTimer.Change(TimeSpan.FromSeconds(3), Timeout.InfiniteTimeSpan);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error handling file change: {FilePath}", e.FullPath);
            }
        }

        private void OnCsvFileRenamed(object sender, RenamedEventArgs e)
        {
            OnCsvFileChanged(sender, e);
        }

        private void OnWatcherError(object sender, ErrorEventArgs e)
        {
            _logger.LogError(e.GetException(), "FileSystemWatcher error occurred");
            
            // Attempt to restart the watcher
            Task.Run(async () =>
            {
                await Task.Delay(5000); // Wait 5 seconds before restarting
                try
                {
                    StopWatching();
                    StartWatching();
                    _logger.LogInformation("FileSystemWatcher restarted after error");
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Failed to restart FileSystemWatcher");
                }
            });
        }

        /// <summary>
        /// Process accumulated file changes in a batch to improve performance
        /// </summary>
        private async void ProcessFileChanges(object state)
        {
            if (!await _processingLock.WaitAsync(1000))
                return;

            try
            {
                var filesToProcess = new List<string>();
                
                // Drain the queue
                while (_changedFiles.TryDequeue(out var file))
                {
                    filesToProcess.Add(file);
                }

                if (!filesToProcess.Any())
                    return;

                _logger.LogInformation("Processing {Count} file changes in batch", filesToProcess.Count);

                var invalidatedCacheKeys = new HashSet<string>();
                var dataTypesToRefresh = new HashSet<string>();

                // Process each file and determine cache keys to invalidate
                foreach (var filePath in filesToProcess.Distinct())
                {
                    var fileName = Path.GetFileName(filePath).ToLowerInvariant();
                    
                    foreach (var pattern in _cacheInvalidationMap.Keys)
                    {
                        if (IsFileMatchingPattern(fileName, pattern))
                        {
                            var cacheKeyPrefixes = _cacheInvalidationMap[pattern];
                            foreach (var prefix in cacheKeyPrefixes)
                            {
                                invalidatedCacheKeys.Add(prefix);
                            }
                            
                            // Determine what data type needs refresh
                            var dataType = DetermineDataTypeFromPattern(pattern);
                            if (!string.IsNullOrEmpty(dataType))
                            {
                                dataTypesToRefresh.Add(dataType);
                            }
                            break;
                        }
                    }
                }

                // Invalidate cache entries
                await InvalidateCacheEntriesAsync(invalidatedCacheKeys);

                // Notify about required data refresh
                foreach (var dataType in dataTypesToRefresh)
                {
                    DataRefreshRequired?.Invoke(this, dataType);
                }

                // Notify about cache invalidation
                CacheInvalidated?.Invoke(this, new CacheInvalidationEventArgs(
                    filesToProcess, invalidatedCacheKeys.ToList(), dataTypesToRefresh.ToList()));

                _logger.LogInformation("Batch processed: invalidated {CacheCount} cache key patterns, refreshing {DataCount} data types", 
                    invalidatedCacheKeys.Count, dataTypesToRefresh.Count);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing file changes batch");
            }
            finally
            {
                _processingLock.Release();
            }
        }

        /// <summary>
        /// Invalidate cache entries by key prefixes
        /// </summary>
        private async Task InvalidateCacheEntriesAsync(IEnumerable<string> keyPrefixes)
        {
            var prefixes = keyPrefixes?.Where(p => !string.IsNullOrWhiteSpace(p)).Distinct(StringComparer.OrdinalIgnoreCase).ToArray() ?? Array.Empty<string>();
            if (prefixes.Length == 0)
                return;

            await Task.Run(() =>
            {
                try
                {
                    var removed = _cacheService.InvalidateByPrefix(prefixes);
                    _logger.LogInformation("Cache invalidation by prefix completed. Removed {Count} entries.", removed);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Cache invalidation by prefix failed");
                }
            }).ConfigureAwait(false);
        }

        /// <summary>
        /// Check if a filename matches a wildcard pattern
        /// </summary>
        private static bool IsFileMatchingPattern(string fileName, string pattern)
        {
            // Simple wildcard matching - convert to regex-like behavior
            var regexPattern = pattern.Replace("*", ".*").Replace("?", ".");
            return System.Text.RegularExpressions.Regex.IsMatch(fileName, regexPattern, 
                System.Text.RegularExpressions.RegexOptions.IgnoreCase);
        }

        /// <summary>
        /// Determine data type from file pattern for refresh notifications
        /// </summary>
        private static string DetermineDataTypeFromPattern(string pattern)
        {
            return pattern.ToLowerInvariant() switch
            {
                var p when p.Contains("users") => "Users",
                var p when p.Contains("groups") => "Groups", 
                var p when p.Contains("computers") => "Devices",
                var p when p.Contains("applications") => "Applications",
                var p when p.Contains("databases") => "Databases",
                var p when p.Contains("fileservers") => "FileServers",
                var p when p.Contains("mailboxes") => "Mailboxes",
                var p when p.Contains("threats") => "Security",
                var p when p.Contains("governance") => "Governance",
                var p when p.Contains("lineage") => "DataLineage",
                _ => string.Empty
            };
        }

        /// <summary>
        /// Force immediate refresh of data without waiting for debounce
        /// </summary>
        public async Task ForceRefreshAsync()
        {
            _logger.LogInformation("Force refresh requested");
            
            try
            {
                // Invalidate all caches
                var allPrefixes = _cacheInvalidationMap.Values.SelectMany(x => x).Distinct();
                await InvalidateCacheEntriesAsync(allPrefixes);
                
                // Trigger data reload
                if (_logicEngineService != null)
                {
                    await _logicEngineService.LoadAllAsync();
                }
                
                // Notify all data types need refresh
                var allDataTypes = _cacheInvalidationMap.Keys.Select(DetermineDataTypeFromPattern).Where(x => !string.IsNullOrEmpty(x));
                foreach (var dataType in allDataTypes)
                {
                    DataRefreshRequired?.Invoke(this, dataType);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during force refresh");
            }
        }

        /// <summary>
        /// Get cache statistics for monitoring
        /// </summary>
        public CacheInvalidationStatistics GetStatistics()
        {
            return new CacheInvalidationStatistics(
                WatchedPath: _watchPath,
                IsWatching: _watcher?.EnableRaisingEvents == true,
                QueuedChanges: _changedFiles.Count,
                TrackedFiles: _lastProcessed.Count,
                CacheInvalidationPatterns: _cacheInvalidationMap.Count
            );
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
                    _logger.LogInformation("CacheAwareFileWatcherService stopped");
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error stopping cache-aware CSV file watcher");
            }
        }

        public void Dispose()
        {
            if (!_disposed)
            {
                StopWatching();
                _debounceTimer?.Dispose();
                _processingLock?.Dispose();
                _disposed = true;
            }
        }
    }

    /// <summary>
    /// Event arguments for cache invalidation notifications
    /// </summary>
    public class CacheInvalidationEventArgs : EventArgs
    {
        public List<string> ChangedFiles { get; }
        public List<string> InvalidatedCacheKeys { get; }
        public List<string> AffectedDataTypes { get; }
        public DateTime Timestamp { get; }

        public CacheInvalidationEventArgs(List<string> changedFiles, List<string> invalidatedCacheKeys, List<string> affectedDataTypes)
        {
            ChangedFiles = changedFiles;
            InvalidatedCacheKeys = invalidatedCacheKeys;
            AffectedDataTypes = affectedDataTypes;
            Timestamp = DateTime.UtcNow;
        }
    }

    /// <summary>
    /// Statistics for cache invalidation monitoring
    /// </summary>
    public record CacheInvalidationStatistics(
        string WatchedPath,
        bool IsWatching,
        int QueuedChanges,
        int TrackedFiles,
        int CacheInvalidationPatterns
    );
}
