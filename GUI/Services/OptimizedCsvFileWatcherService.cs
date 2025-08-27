#nullable enable
using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.IO;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;

namespace MandADiscoverySuite.Services
{
    /// <summary>
    /// T-030 Enhanced CSV file watcher service with incremental updates and performance optimization
    /// Extends existing CsvFileWatcherService with IncrementalUpdateEngine integration
    /// </summary>
    public class OptimizedCsvFileWatcherService : IDisposable
    {
        private readonly ILogger<OptimizedCsvFileWatcherService> _logger;
        private readonly string _watchPath;
        private readonly IncrementalUpdateEngine _incrementalEngine;
        private readonly AsyncDataLoadingService _asyncLoader;
        private readonly MemoryPressureMonitor _memoryMonitor;
        
        private readonly List<FileSystemWatcher> _watchers = new();
        private readonly ConcurrentDictionary<string, DateTime> _lastProcessed = new();
        private readonly ConcurrentDictionary<string, CancellationTokenSource> _activeUpdates = new();
        private readonly SemaphoreSlim _updateSemaphore = new(3, 3); // Max 3 concurrent updates
        
        private bool _disposed = false;
        private readonly TimeSpan _debounceDelay = TimeSpan.FromSeconds(2);

        // Enhanced events with data type information
        public event EventHandler<OptimizedDataChangeEventArgs>? DataChanged;
        public event EventHandler<IncrementalUpdateCompletedEventArgs>? IncrementalUpdateCompleted;
        public event EventHandler<FullReloadRequestedEventArgs>? FullReloadRequested;

        // File pattern mappings for better categorization
        private readonly Dictionary<string, string[]> _dataTypePatterns = new()
        {
            ["Users"] = new[] { "*users*.csv", "*activedirectoryusers*.csv", "*azureusers*.csv" },
            ["Groups"] = new[] { "*groups*.csv", "*activedirectorygroups*.csv", "*groupmembers*.csv" },
            ["Devices"] = new[] { "*computer*.csv", "*device*.csv", "*computerinventory*.csv" },
            ["Applications"] = new[] { "*app*.csv", "*application*.csv", "*appinventory*.csv" },
            ["Infrastructure"] = new[] { "*infrastructure*.csv", "*server*.csv", "*network*.csv" },
            ["Mailboxes"] = new[] { "*mailbox*.csv", "*exchange*.csv", "*mail*.csv" },
            ["FileServers"] = new[] { "*fileserver*.csv", "*share*.csv", "*ntfs*.csv" },
            ["Databases"] = new[] { "*database*.csv", "*sql*.csv", "*db*.csv" },
            ["ThreatDetection"] = new[] { "*threat*.csv", "*security*.csv", "*incident*.csv" },
            ["DataGovernance"] = new[] { "*governance*.csv", "*compliance*.csv", "*metadata*.csv" },
            ["DataLineage"] = new[] { "*lineage*.csv", "*dataflow*.csv", "*dependency*.csv" },
            ["ExternalIdentities"] = new[] { "*external*.csv", "*federation*.csv", "*identity*.csv" }
        };

        public OptimizedCsvFileWatcherService(
            ILogger<OptimizedCsvFileWatcherService> logger,
            IncrementalUpdateEngine incrementalEngine,
            AsyncDataLoadingService asyncLoader,
            MemoryPressureMonitor memoryMonitor)
        {
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
            _incrementalEngine = incrementalEngine ?? throw new ArgumentNullException(nameof(incrementalEngine));
            _asyncLoader = asyncLoader ?? throw new ArgumentNullException(nameof(asyncLoader));
            _memoryMonitor = memoryMonitor ?? throw new ArgumentNullException(nameof(memoryMonitor));
            
            _watchPath = Path.Combine(ConfigurationService.Instance.DiscoveryDataRootPath, "ljpops", "Raw");
            
            // Subscribe to incremental update events
            _incrementalEngine.IncrementalUpdate += OnIncrementalUpdateAvailable;
            _incrementalEngine.DependencyInvalidated += OnDependencyInvalidated;
        }

        /// <summary>
        /// Starts watching CSV files with enhanced monitoring
        /// </summary>
        public async Task StartWatchingAsync()
        {
            try
            {
                if (!Directory.Exists(_watchPath))
                {
                    Directory.CreateDirectory(_watchPath);
                    _logger.LogInformation("Created watch directory: {WatchPath}", _watchPath);
                }

                // Create multiple watchers for better performance and reliability
                await CreateFileSystemWatchersAsync();
                
                // Register existing files with incremental engine
                await RegisterExistingFilesAsync();

                _logger.LogInformation("OptimizedCsvFileWatcherService started monitoring: {WatchPath} with {WatcherCount} watchers", 
                    _watchPath, _watchers.Count);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to start optimized CSV file watcher");
                throw;
            }
        }

        /// <summary>
        /// Creates file system watchers for different file patterns
        /// </summary>
        private async Task CreateFileSystemWatchersAsync()
        {
            await Task.Run(() =>
            {
                // Create a watcher for each major data type to improve performance
                foreach (var dataType in _dataTypePatterns.Keys)
                {
                    try
                    {
                        var watcher = new FileSystemWatcher(_watchPath, "*.csv")
                        {
                            NotifyFilter = NotifyFilters.LastWrite | NotifyFilters.FileName | NotifyFilters.Size,
                            EnableRaisingEvents = true,
                            IncludeSubdirectories = true
                        };

                        watcher.Changed += (sender, e) => OnCsvFileChanged(e, dataType);
                        watcher.Created += (sender, e) => OnCsvFileCreated(e, dataType);
                        watcher.Renamed += (sender, e) => OnCsvFileRenamed(e, dataType);
                        watcher.Deleted += (sender, e) => OnCsvFileDeleted(e, dataType);

                        _watchers.Add(watcher);
                        
                        _logger.LogDebug("Created file watcher for data type: {DataType}", dataType);
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, "Failed to create file watcher for data type: {DataType}", dataType);
                    }
                }
            });
        }

        /// <summary>
        /// Registers existing files with the incremental update engine
        /// </summary>
        private async Task RegisterExistingFilesAsync()
        {
            var allFiles = Directory.GetFiles(_watchPath, "*.csv", SearchOption.AllDirectories);
            var registrationTasks = new List<Task>();

            foreach (var file in allFiles)
            {
                var dataType = DetermineDataType(file);
                if (!string.IsNullOrEmpty(dataType))
                {
                    registrationTasks.Add(_incrementalEngine.RegisterFileAsync(file, dataType));
                }
            }

            await Task.WhenAll(registrationTasks);
            _logger.LogInformation("Registered {FileCount} existing CSV files with incremental update engine", allFiles.Length);
        }

        /// <summary>
        /// Handles CSV file changes with debouncing and incremental processing
        /// </summary>
        private async void OnCsvFileChanged(FileSystemEventArgs e, string suggestedDataType)
        {
            try
            {
                var fileName = Path.GetFileName(e.Name ?? "").ToLowerInvariant();
                var now = DateTime.UtcNow;
                
                // Debounce file changes
                if (_lastProcessed.TryGetValue(e.FullPath, out var lastTime) && 
                    (now - lastTime) < _debounceDelay)
                {
                    return;
                }
                _lastProcessed[e.FullPath] = now;

                _logger.LogDebug("Processing CSV file change: {FilePath}", e.FullPath);

                // Cancel any existing update for this file
                if (_activeUpdates.TryGetValue(e.FullPath, out var existingCts))
                {
                    existingCts.Cancel();
                }

                // Create new cancellation token for this update
                var cts = new CancellationTokenSource(TimeSpan.FromMinutes(5)); // 5 minute timeout
                _activeUpdates[e.FullPath] = cts;

                // Wait for semaphore to control concurrency
                await _updateSemaphore.WaitAsync(cts.Token);

                try
                {
                    // Check memory pressure before processing
                    var memoryPressure = await _memoryMonitor.GetCurrentPressureAsync();
                    if (memoryPressure >= MemoryPressureLevel.Critical)
                    {
                        _logger.LogWarning("Critical memory pressure, deferring file processing: {FilePath}", e.FullPath);
                        return;
                    }

                    // Determine the actual data type
                    var dataType = DetermineDataType(e.FullPath) ?? suggestedDataType;
                    
                    // Process incremental update
                    var updateResult = await _incrementalEngine.ProcessFileChangeAsync(e.FullPath, cts.Token);
                    
                    // Fire appropriate events based on update result
                    await HandleUpdateResultAsync(e.FullPath, dataType, updateResult, cts.Token);
                }
                finally
                {
                    _updateSemaphore.Release();
                    _activeUpdates.TryRemove(e.FullPath, out _);
                }
            }
            catch (OperationCanceledException)
            {
                _logger.LogDebug("File processing cancelled: {FilePath}", e.FullPath);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing file change: {FilePath}", e.FullPath);
            }
        }

        /// <summary>
        /// Handles the result of an incremental update
        /// </summary>
        private async Task HandleUpdateResultAsync(string filePath, string dataType, UpdateResult updateResult, CancellationToken cancellationToken)
        {
            switch (updateResult.UpdateType)
            {
                case UpdateType.Incremental:
                    _logger.LogInformation("Incremental update completed for {DataType}: {Changes} changes", 
                        dataType, updateResult.TotalChanges);
                        
                    IncrementalUpdateCompleted?.Invoke(this, new IncrementalUpdateCompletedEventArgs(
                        filePath, dataType, updateResult.TotalChanges, updateResult.AddedItems, 
                        updateResult.ModifiedItems, updateResult.DeletedItems));
                    break;

                case UpdateType.FullReload:
                    _logger.LogInformation("Full reload requested for {DataType}: {Reason}", 
                        dataType, updateResult.Message);
                        
                    FullReloadRequested?.Invoke(this, new FullReloadRequestedEventArgs(
                        filePath, dataType, updateResult.Message ?? "Unknown reason"));
                    break;

                case UpdateType.NoChange:
                    _logger.LogDebug("No changes detected for {DataType}", dataType);
                    break;

                case UpdateType.NotTracked:
                    // Register the file for future tracking
                    await _incrementalEngine.RegisterFileAsync(filePath, dataType);
                    _logger.LogDebug("Registered new file for tracking: {DataType} -> {FilePath}", dataType, filePath);
                    break;

                case UpdateType.Failed:
                    _logger.LogError("Failed to process update for {DataType}: {Error}", 
                        dataType, updateResult.Message);
                    break;
            }

            // Fire general data changed event
            DataChanged?.Invoke(this, new OptimizedDataChangeEventArgs(
                filePath, dataType, updateResult.UpdateType, DateTime.UtcNow));
        }

        /// <summary>
        /// Handles new CSV file creation
        /// </summary>
        private async void OnCsvFileCreated(FileSystemEventArgs e, string suggestedDataType)
        {
            try
            {
                _logger.LogInformation("New CSV file created: {FilePath}", e.FullPath);
                
                var dataType = DetermineDataType(e.FullPath) ?? suggestedDataType;
                
                // Register with incremental engine
                await _incrementalEngine.RegisterFileAsync(e.FullPath, dataType);
                
                // Trigger initial load
                DataChanged?.Invoke(this, new OptimizedDataChangeEventArgs(
                    e.FullPath, dataType, UpdateType.FullReload, DateTime.UtcNow));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error handling file creation: {FilePath}", e.FullPath);
            }
        }

        /// <summary>
        /// Handles CSV file renaming
        /// </summary>
        private void OnCsvFileRenamed(RenamedEventArgs e, string suggestedDataType)
        {
            try
            {
                _logger.LogInformation("CSV file renamed: {OldPath} -> {NewPath}", e.OldFullPath, e.FullPath);
                
                var dataType = DetermineDataType(e.FullPath) ?? suggestedDataType;
                
                // Fire data change event for both old and new paths
                DataChanged?.Invoke(this, new OptimizedDataChangeEventArgs(
                    e.OldFullPath, dataType, UpdateType.FullReload, DateTime.UtcNow));
                DataChanged?.Invoke(this, new OptimizedDataChangeEventArgs(
                    e.FullPath, dataType, UpdateType.FullReload, DateTime.UtcNow));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error handling file rename: {OldPath} -> {NewPath}", e.OldFullPath, e.FullPath);
            }
        }

        /// <summary>
        /// Handles CSV file deletion
        /// </summary>
        private void OnCsvFileDeleted(FileSystemEventArgs e, string suggestedDataType)
        {
            try
            {
                _logger.LogInformation("CSV file deleted: {FilePath}", e.FullPath);
                
                var dataType = DetermineDataType(e.FullPath) ?? suggestedDataType;
                
                DataChanged?.Invoke(this, new OptimizedDataChangeEventArgs(
                    e.FullPath, dataType, UpdateType.FullReload, DateTime.UtcNow));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error handling file deletion: {FilePath}", e.FullPath);
            }
        }

        /// <summary>
        /// Determines data type from file path using pattern matching
        /// </summary>
        private string? DetermineDataType(string filePath)
        {
            var fileName = Path.GetFileName(filePath).ToLowerInvariant();
            
            foreach (var kvp in _dataTypePatterns)
            {
                foreach (var pattern in kvp.Value)
                {
                    if (IsFileMatchingPattern(fileName, pattern.ToLowerInvariant()))
                    {
                        return kvp.Key;
                    }
                }
            }
            
            return null;
        }

        /// <summary>
        /// Simple pattern matching for file names
        /// </summary>
        private bool IsFileMatchingPattern(string fileName, string pattern)
        {
            // Simple wildcard matching
            if (pattern.StartsWith("*") && pattern.EndsWith("*"))
            {
                var middle = pattern.Substring(1, pattern.Length - 2);
                return fileName.Contains(middle);
            }
            else if (pattern.StartsWith("*"))
            {
                var suffix = pattern.Substring(1);
                return fileName.EndsWith(suffix);
            }
            else if (pattern.EndsWith("*"))
            {
                var prefix = pattern.Substring(0, pattern.Length - 1);
                return fileName.StartsWith(prefix);
            }
            else
            {
                return fileName.Equals(pattern);
            }
        }

        /// <summary>
        /// Event handlers for incremental update engine
        /// </summary>
        private void OnIncrementalUpdateAvailable(object? sender, IncrementalUpdateEventArgs e)
        {
            _logger.LogDebug("Incremental update available for {DataType}: {Changes} changes", 
                e.DataType, e.Changes.TotalChanges);
        }

        private void OnDependencyInvalidated(object? sender, DependencyInvalidationEventArgs e)
        {
            _logger.LogInformation("Dependencies invalidated for {SourceType}, affecting: {DependentTypes}", 
                e.SourceDataType, string.Join(", ", e.DependentDataTypes));
                
            // Fire full reload requests for dependent data types
            foreach (var dependentType in e.DependentDataTypes)
            {
                FullReloadRequested?.Invoke(this, new FullReloadRequestedEventArgs(
                    "", dependentType, $"Dependency invalidation from {e.SourceDataType}"));
            }
        }

        /// <summary>
        /// Gets service statistics
        /// </summary>
        public WatcherStatistics GetStatistics()
        {
            return new WatcherStatistics(
                WatchersCount: _watchers.Count,
                WatchedPath: _watchPath,
                ActiveUpdates: _activeUpdates.Count,
                TrackedFiles: _lastProcessed.Count,
                DataTypesMonitored: _dataTypePatterns.Count
            );
        }

        /// <summary>
        /// Stops watching and cleanup
        /// </summary>
        public void StopWatching()
        {
            foreach (var watcher in _watchers)
            {
                watcher.EnableRaisingEvents = false;
                watcher.Dispose();
            }
            
            _watchers.Clear();
            
            // Cancel all active updates
            foreach (var cts in _activeUpdates.Values)
            {
                cts.Cancel();
            }
            _activeUpdates.Clear();
            
            _logger.LogInformation("OptimizedCsvFileWatcherService stopped");
        }

        public void Dispose()
        {
            if (!_disposed)
            {
                StopWatching();
                _updateSemaphore?.Dispose();
                
                foreach (var cts in _activeUpdates.Values)
                {
                    cts.Dispose();
                }
                
                _disposed = true;
                _logger.LogInformation("OptimizedCsvFileWatcherService disposed");
            }
        }
    }

    #region Supporting Types

    /// <summary>
    /// Enhanced data change event args with detailed information
    /// </summary>
    public class OptimizedDataChangeEventArgs : EventArgs
    {
        public string FilePath { get; }
        public string DataType { get; }
        public UpdateType UpdateType { get; }
        public DateTime Timestamp { get; }

        public OptimizedDataChangeEventArgs(string filePath, string dataType, UpdateType updateType, DateTime timestamp)
        {
            FilePath = filePath;
            DataType = dataType;
            UpdateType = updateType;
            Timestamp = timestamp;
        }
    }

    /// <summary>
    /// Event args for completed incremental updates
    /// </summary>
    public class IncrementalUpdateCompletedEventArgs : EventArgs
    {
        public string FilePath { get; }
        public string DataType { get; }
        public int TotalChanges { get; }
        public int AddedItems { get; }
        public int ModifiedItems { get; }
        public int DeletedItems { get; }
        public DateTime Timestamp { get; }

        public IncrementalUpdateCompletedEventArgs(string filePath, string dataType, int totalChanges, 
            int addedItems, int modifiedItems, int deletedItems)
        {
            FilePath = filePath;
            DataType = dataType;
            TotalChanges = totalChanges;
            AddedItems = addedItems;
            ModifiedItems = modifiedItems;
            DeletedItems = deletedItems;
            Timestamp = DateTime.UtcNow;
        }
    }

    /// <summary>
    /// Event args for full reload requests
    /// </summary>
    public class FullReloadRequestedEventArgs : EventArgs
    {
        public string FilePath { get; }
        public string DataType { get; }
        public string Reason { get; }
        public DateTime Timestamp { get; }

        public FullReloadRequestedEventArgs(string filePath, string dataType, string reason)
        {
            FilePath = filePath;
            DataType = dataType;
            Reason = reason;
            Timestamp = DateTime.UtcNow;
        }
    }

    /// <summary>
    /// Statistics for the watcher service
    /// </summary>
    public record WatcherStatistics(
        int WatchersCount,
        string WatchedPath,
        int ActiveUpdates,
        int TrackedFiles,
        int DataTypesMonitored
    );

    #endregion
}