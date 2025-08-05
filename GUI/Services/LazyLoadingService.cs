using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using MandADiscoverySuite.Repository;

namespace MandADiscoverySuite.Services
{
    /// <summary>
    /// Service for implementing lazy loading strategies to optimize data loading and UI performance
    /// </summary>
    public class LazyLoadingService : IDisposable
    {
        private readonly ILogger<LazyLoadingService> _logger;
        private readonly IntelligentCacheService _cacheService;
        private readonly BackgroundTaskQueueService _taskQueueService;
        private readonly ConcurrentDictionary<string, LazyLoadContext> _loadingContexts;
        private readonly ConcurrentDictionary<string, object> _loadedData;
        private readonly Timer _cleanupTimer;
        private readonly SemaphoreSlim _loadingSemaphore;
        
        private readonly LazyLoadingConfiguration _configuration;
        private bool _disposed;

        public LazyLoadingService(
            ILogger<LazyLoadingService> logger = null,
            IntelligentCacheService cacheService = null,
            BackgroundTaskQueueService taskQueueService = null)
        {
            _logger = logger;
            _cacheService = cacheService;
            _taskQueueService = taskQueueService;
            _configuration = new LazyLoadingConfiguration();
            
            _loadingContexts = new ConcurrentDictionary<string, LazyLoadContext>();
            _loadedData = new ConcurrentDictionary<string, object>();
            _loadingSemaphore = new SemaphoreSlim(_configuration.MaxConcurrentLoads, _configuration.MaxConcurrentLoads);
            
            // Cleanup timer runs every 5 minutes
            _cleanupTimer = new Timer(PerformCleanup, null, TimeSpan.FromMinutes(5), TimeSpan.FromMinutes(5));
            
            _logger?.LogInformation("Lazy loading service initialized with max concurrent loads: {MaxLoads}", 
                _configuration.MaxConcurrentLoads);
        }

        #region Public Properties

        /// <summary>
        /// Gets the number of active loading contexts
        /// </summary>
        public int ActiveContexts => _loadingContexts.Count;

        /// <summary>
        /// Gets the number of items in the loaded data cache
        /// </summary>
        public int CachedItems => _loadedData.Count;

        /// <summary>
        /// Gets whether lazy loading is enabled
        /// </summary>
        public bool IsEnabled { get; set; } = true;

        #endregion

        #region Events

        /// <summary>
        /// Raised when data loading starts
        /// </summary>
        public event Action<LazyLoadEventArgs> OnLoadingStarted;

        /// <summary>
        /// Raised when data loading completes
        /// </summary>
        public event Action<LazyLoadEventArgs> OnLoadingCompleted;

        /// <summary>
        /// Raised when data loading fails
        /// </summary>
        public event Action<LazyLoadEventArgs> OnLoadingFailed;

        /// <summary>
        /// Raised when loading progress is updated
        /// </summary>
        public event Action<LazyLoadProgressEventArgs> OnLoadingProgress;

        #endregion

        #region Public Methods

        /// <summary>
        /// Creates a lazy loader for the specified data source
        /// </summary>
        public ILazyLoader<T> CreateLoader<T>(
            Func<Task<IEnumerable<T>>> dataFactory,
            string key,
            LazyLoadStrategy strategy = LazyLoadStrategy.OnDemand,
            TimeSpan? cacheExpiration = null)
        {
            if (dataFactory == null)
                throw new ArgumentNullException(nameof(dataFactory));
            
            if (string.IsNullOrEmpty(key))
                throw new ArgumentException("Key cannot be null or empty", nameof(key));

            return new LazyLoader<T>(this, dataFactory, key, strategy, cacheExpiration ?? _configuration.DefaultCacheExpiration);
        }

        /// <summary>
        /// Creates a paged lazy loader for large datasets
        /// </summary>
        public IPagedLazyLoader<T> CreatePagedLoader<T>(
            Func<int, int, Task<PagedResult<T>>> pagedDataFactory,
            string key,
            int pageSize = 50,
            LazyLoadStrategy strategy = LazyLoadStrategy.OnDemand)
        {
            if (pagedDataFactory == null)
                throw new ArgumentNullException(nameof(pagedDataFactory));
            
            if (string.IsNullOrEmpty(key))
                throw new ArgumentException("Key cannot be null or empty", nameof(key));

            return new PagedLazyLoader<T>(this, pagedDataFactory, key, pageSize, strategy);
        }

        /// <summary>
        /// Creates a hierarchical lazy loader for tree structures
        /// </summary>
        public IHierarchicalLazyLoader<T> CreateHierarchicalLoader<T>(
            Func<string, Task<IEnumerable<T>>> childrenFactory,
            Func<T, string> keySelector,
            string rootKey,
            LazyLoadStrategy strategy = LazyLoadStrategy.OnDemand)
        {
            if (childrenFactory == null)
                throw new ArgumentNullException(nameof(childrenFactory));
            
            if (keySelector == null)
                throw new ArgumentNullException(nameof(keySelector));

            return new HierarchicalLazyLoader<T>(this, childrenFactory, keySelector, rootKey, strategy);
        }

        /// <summary>
        /// Loads data asynchronously with caching and context management
        /// </summary>
        internal async Task<T> LoadAsync<T>(
            string key,
            Func<Task<T>> factory,
            LazyLoadStrategy strategy,
            TimeSpan cacheExpiration,
            CancellationToken cancellationToken = default)
        {
            if (!IsEnabled)
            {
                return await factory();
            }

            try
            {
                // Check cache first
                if (_cacheService != null)
                {
                    var cached = await _cacheService.GetOrCreateAsync(key, 
                        async () => await ExecuteLoadWithContext(key, factory, strategy, cancellationToken),
                        cacheExpiration);
                    
                    if (cached != null)
                        return (T)cached;
                }

                // Fallback to direct execution
                return await ExecuteLoadWithContext(key, factory, strategy, cancellationToken);
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error loading data for key: {Key}", key);
                throw;
            }
        }

        /// <summary>
        /// Preloads data in the background
        /// </summary>
        public string PreloadAsync<T>(
            string key,
            Func<Task<T>> factory,
            TimeSpan? cacheExpiration = null,
            BackgroundTaskPriority priority = BackgroundTaskPriority.Low)
        {
            if (!IsEnabled)
                return null;

            try
            {
                var taskId = _taskQueueService?.QueueTask(
                    async (ct, progress) =>
                    {
                        progress.Report(new TaskProgress 
                        { 
                            PercentageComplete = 0, 
                            CurrentOperation = $"Preloading {key}",
                            StatusMessage = "Starting preload"
                        });

                        var data = await factory();
                        
                        if (_cacheService != null)
                        {
                            await _cacheService.SetAsync(key, data, cacheExpiration ?? _configuration.DefaultCacheExpiration);
                        }

                        progress.Report(new TaskProgress 
                        { 
                            PercentageComplete = 100, 
                            CurrentOperation = $"Preloading {key}",
                            StatusMessage = "Preload completed"
                        });
                    },
                    $"Preload: {key}",
                    priority,
                    $"Preloading data for key: {key}"
                );

                _logger?.LogDebug("Queued preload task for key: {Key} (TaskId: {TaskId})", key, taskId);
                return taskId;
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error queuing preload task for key: {Key}", key);
                return null;
            }
        }

        /// <summary>
        /// Invalidates cached data for a specific key
        /// </summary>
        public void InvalidateCache(string key)
        {
            try
            {
                _cacheService?.Invalidate(key);
                _loadedData.TryRemove(key, out _);
                
                _logger?.LogDebug("Invalidated cache for key: {Key}", key);
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error invalidating cache for key: {Key}", key);
            }
        }

        /// <summary>
        /// Invalidates all cached data matching a pattern
        /// </summary>
        public void InvalidateCachePattern(string pattern)
        {
            try
            {
                _cacheService?.InvalidatePattern(pattern);
                
                var keysToRemove = _loadedData.Keys.Where(key => key.Contains(pattern)).ToList();
                foreach (var key in keysToRemove)
                {
                    _loadedData.TryRemove(key, out _);
                }
                
                _logger?.LogDebug("Invalidated cache for pattern: {Pattern} ({Count} items)", pattern, keysToRemove.Count);
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error invalidating cache for pattern: {Pattern}", pattern);
            }
        }

        /// <summary>
        /// Gets loading statistics
        /// </summary>
        public LazyLoadingStats GetStatistics()
        {
            try
            {
                return new LazyLoadingStats
                {
                    Timestamp = DateTime.UtcNow,
                    ActiveContexts = _loadingContexts.Count,
                    CachedItems = _loadedData.Count,
                    IsEnabled = IsEnabled,
                    MaxConcurrentLoads = _configuration.MaxConcurrentLoads,
                    DefaultCacheExpiration = _configuration.DefaultCacheExpiration,
                    ContextDetails = _loadingContexts.Values.Select(ctx => new LoadingContextInfo
                    {
                        Key = ctx.Key,
                        Strategy = ctx.Strategy,
                        StartTime = ctx.StartTime,
                        IsCompleted = ctx.IsCompleted,
                        HasError = ctx.Exception != null
                    }).ToList()
                };
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error getting lazy loading statistics");
                return new LazyLoadingStats { Timestamp = DateTime.UtcNow };
            }
        }

        /// <summary>
        /// Sets lazy loading configuration
        /// </summary>
        public void SetConfiguration(LazyLoadingConfiguration configuration)
        {
            if (configuration == null)
                throw new ArgumentNullException(nameof(configuration));

            _configuration.MaxConcurrentLoads = configuration.MaxConcurrentLoads;
            _configuration.DefaultCacheExpiration = configuration.DefaultCacheExpiration;
            _configuration.EnablePreloading = configuration.EnablePreloading;
            _configuration.CleanupInterval = configuration.CleanupInterval;
            _configuration.MaxCacheItems = configuration.MaxCacheItems;

            _logger?.LogDebug("Updated lazy loading configuration");
        }

        #endregion

        #region Private Methods

        private async Task<T> ExecuteLoadWithContext<T>(
            string key,
            Func<Task<T>> factory,
            LazyLoadStrategy strategy,
            CancellationToken cancellationToken)
        {
            var context = new LazyLoadContext
            {
                Key = key,
                Strategy = strategy,
                StartTime = DateTime.UtcNow
            };

            _loadingContexts.TryAdd(key, context);

            try
            {
                OnLoadingStarted?.Invoke(new LazyLoadEventArgs { Key = key, Strategy = strategy });

                await _loadingSemaphore.WaitAsync(cancellationToken);

                try
                {
                    var result = await factory();
                    context.IsCompleted = true;
                    context.CompletionTime = DateTime.UtcNow;
                    
                    _loadedData.TryAdd(key, result);
                    
                    OnLoadingCompleted?.Invoke(new LazyLoadEventArgs 
                    { 
                        Key = key, 
                        Strategy = strategy,
                        Duration = context.CompletionTime - context.StartTime
                    });

                    return result;
                }
                finally
                {
                    _loadingSemaphore.Release();
                }
            }
            catch (Exception ex)
            {
                context.Exception = ex;
                context.IsCompleted = true;
                context.CompletionTime = DateTime.UtcNow;
                
                OnLoadingFailed?.Invoke(new LazyLoadEventArgs 
                { 
                    Key = key, 
                    Strategy = strategy,
                    Error = ex,
                    Duration = context.CompletionTime - context.StartTime
                });
                
                throw;
            }
            finally
            {
                // Remove context after a delay to allow for statistics gathering
                _ = Task.Delay(TimeSpan.FromMinutes(1)).ContinueWith(_ => 
                {
                    LazyLoadContext removed;
                    _loadingContexts.TryRemove(key, out removed);
                });
            }
        }

        private void PerformCleanup(object state)
        {
            try
            {
                var now = DateTime.UtcNow;
                var contextsToRemove = new List<string>();

                // Clean up old loading contexts
                foreach (var kvp in _loadingContexts)
                {
                    var context = kvp.Value;
                    if (context.IsCompleted && 
                        context.CompletionTime.HasValue && 
                        now - context.CompletionTime.Value > TimeSpan.FromMinutes(10))
                    {
                        contextsToRemove.Add(kvp.Key);
                    }
                }

                foreach (var key in contextsToRemove)
                {
                    _loadingContexts.TryRemove(key, out _);
                }

                // Clean up cached data if over limit
                if (_loadedData.Count > _configuration.MaxCacheItems)
                {
                    var itemsToRemove = _loadedData.Count - _configuration.MaxCacheItems;
                    var keysToRemove = _loadedData.Keys.Take(itemsToRemove).ToList();
                    
                    foreach (var key in keysToRemove)
                    {
                        _loadedData.TryRemove(key, out _);
                    }
                }

                if (contextsToRemove.Count > 0)
                {
                    _logger?.LogDebug("Cleaned up {Count} old loading contexts", contextsToRemove.Count);
                }
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error during lazy loading cleanup");
            }
        }

        #endregion

        #region IDisposable

        public void Dispose()
        {
            if (!_disposed)
            {
                try
                {
                    _cleanupTimer?.Dispose();
                    _loadingSemaphore?.Dispose();
                    _loadingContexts.Clear();
                    _loadedData.Clear();
                    
                    _logger?.LogInformation("Lazy loading service disposed");
                }
                catch (Exception ex)
                {
                    _logger?.LogError(ex, "Error disposing lazy loading service");
                }
                finally
                {
                    _disposed = true;
                }
            }
        }

        #endregion
    }

    #region Interfaces and Implementations

    /// <summary>
    /// Interface for lazy loaders
    /// </summary>
    public interface ILazyLoader<T> : IDisposable
    {
        bool IsLoaded { get; }
        bool IsLoading { get; }
        Task<IEnumerable<T>> LoadAsync(CancellationToken cancellationToken = default);
        Task<IEnumerable<T>> ReloadAsync(CancellationToken cancellationToken = default);
        void InvalidateCache();
        string PreloadAsync(BackgroundTaskPriority priority = BackgroundTaskPriority.Low);
    }

    /// <summary>
    /// Interface for paged lazy loaders
    /// </summary>
    public interface IPagedLazyLoader<T> : IDisposable
    {
        int PageSize { get; }
        int? TotalCount { get; }
        Task<PagedResult<T>> LoadPageAsync(int pageNumber, CancellationToken cancellationToken = default);
        Task<IEnumerable<T>> LoadAllAsync(CancellationToken cancellationToken = default);
        void InvalidateCache();
    }

    /// <summary>
    /// Interface for hierarchical lazy loaders
    /// </summary>
    public interface IHierarchicalLazyLoader<T> : IDisposable
    {
        Task<IEnumerable<T>> LoadChildrenAsync(string parentKey, CancellationToken cancellationToken = default);
        Task<IEnumerable<T>> LoadAllDescendantsAsync(string parentKey, CancellationToken cancellationToken = default);
        void InvalidateCache(string parentKey = null);
    }

    /// <summary>
    /// Standard lazy loader implementation
    /// </summary>
    public class LazyLoader<T> : ILazyLoader<T>
    {
        private readonly LazyLoadingService _service;
        private readonly Func<Task<IEnumerable<T>>> _dataFactory;
        private readonly string _key;
        private readonly LazyLoadStrategy _strategy;
        private readonly TimeSpan _cacheExpiration;
        
        private IEnumerable<T> _data;
        private bool _isLoaded;
        private bool _isLoading;
        private bool _disposed;

        public LazyLoader(LazyLoadingService service, Func<Task<IEnumerable<T>>> dataFactory, 
            string key, LazyLoadStrategy strategy, TimeSpan cacheExpiration)
        {
            _service = service;
            _dataFactory = dataFactory;
            _key = key;
            _strategy = strategy;
            _cacheExpiration = cacheExpiration;
        }

        public bool IsLoaded => _isLoaded;
        public bool IsLoading => _isLoading;

        public async Task<IEnumerable<T>> LoadAsync(CancellationToken cancellationToken = default)
        {
            if (_isLoaded && _data != null)
                return _data;

            if (_isLoading)
            {
                // Wait for current loading to complete
                while (_isLoading && !cancellationToken.IsCancellationRequested)
                {
                    await Task.Delay(100, cancellationToken);
                }
                return _data ?? Enumerable.Empty<T>();
            }

            try
            {
                _isLoading = true;
                _data = await _service.LoadAsync(_key, _dataFactory, _strategy, _cacheExpiration, cancellationToken);
                _isLoaded = true;
                return _data ?? Enumerable.Empty<T>();
            }
            finally
            {
                _isLoading = false;
            }
        }

        public async Task<IEnumerable<T>> ReloadAsync(CancellationToken cancellationToken = default)
        {
            InvalidateCache();
            _isLoaded = false;
            return await LoadAsync(cancellationToken);
        }

        public void InvalidateCache()
        {
            _service.InvalidateCache(_key);
            _data = null;
            _isLoaded = false;
        }

        public string PreloadAsync(BackgroundTaskPriority priority = BackgroundTaskPriority.Low)
        {
            return _service.PreloadAsync(_key, _dataFactory, _cacheExpiration, priority);
        }

        public void Dispose()
        {
            if (!_disposed)
            {
                _data = null;
                _disposed = true;
            }
        }
    }

    /// <summary>
    /// Paged lazy loader implementation
    /// </summary>
    public class PagedLazyLoader<T> : IPagedLazyLoader<T>
    {
        private readonly LazyLoadingService _service;
        private readonly Func<int, int, Task<PagedResult<T>>> _pagedDataFactory;
        private readonly string _key;
        private readonly LazyLoadStrategy _strategy;
        private readonly ConcurrentDictionary<int, PagedResult<T>> _pageCache;
        
        private bool _disposed;

        public PagedLazyLoader(LazyLoadingService service, Func<int, int, Task<PagedResult<T>>> pagedDataFactory,
            string key, int pageSize, LazyLoadStrategy strategy)
        {
            _service = service;
            _pagedDataFactory = pagedDataFactory;
            _key = key;
            PageSize = pageSize;
            _strategy = strategy;
            _pageCache = new ConcurrentDictionary<int, PagedResult<T>>();
        }

        public int PageSize { get; }
        public int? TotalCount { get; private set; }

        public async Task<PagedResult<T>> LoadPageAsync(int pageNumber, CancellationToken cancellationToken = default)
        {
            var pageKey = $"{_key}:page:{pageNumber}";
            
            return await _service.LoadAsync(pageKey, 
                async () =>
                {
                    var result = await _pagedDataFactory(pageNumber, PageSize);
                    TotalCount = result.TotalCount;
                    return result;
                },
                _strategy,
                TimeSpan.FromMinutes(5),
                cancellationToken);
        }

        public async Task<IEnumerable<T>> LoadAllAsync(CancellationToken cancellationToken = default)
        {
            var allItems = new List<T>();
            var pageNumber = 1;
            PagedResult<T> page;

            do
            {
                page = await LoadPageAsync(pageNumber, cancellationToken);
                allItems.AddRange(page.Items);
                pageNumber++;
            }
            while (page.HasNextPage && !cancellationToken.IsCancellationRequested);

            return allItems;
        }

        public void InvalidateCache()
        {
            _service.InvalidateCachePattern(_key);
            _pageCache.Clear();
            TotalCount = null;
        }

        public void Dispose()
        {
            if (!_disposed)
            {
                _pageCache.Clear();
                _disposed = true;
            }
        }
    }

    /// <summary>
    /// Hierarchical lazy loader implementation
    /// </summary>
    public class HierarchicalLazyLoader<T> : IHierarchicalLazyLoader<T>
    {
        private readonly LazyLoadingService _service;
        private readonly Func<string, Task<IEnumerable<T>>> _childrenFactory;
        private readonly Func<T, string> _keySelector;
        private readonly string _rootKey;
        private readonly LazyLoadStrategy _strategy;
        
        private bool _disposed;

        public HierarchicalLazyLoader(LazyLoadingService service, Func<string, Task<IEnumerable<T>>> childrenFactory,
            Func<T, string> keySelector, string rootKey, LazyLoadStrategy strategy)
        {
            _service = service;
            _childrenFactory = childrenFactory;
            _keySelector = keySelector;
            _rootKey = rootKey;
            _strategy = strategy;
        }

        public async Task<IEnumerable<T>> LoadChildrenAsync(string parentKey, CancellationToken cancellationToken = default)
        {
            var childrenKey = $"{_rootKey}:children:{parentKey}";
            
            return await _service.LoadAsync(childrenKey,
                () => _childrenFactory(parentKey),
                _strategy,
                TimeSpan.FromMinutes(10),
                cancellationToken);
        }

        public async Task<IEnumerable<T>> LoadAllDescendantsAsync(string parentKey, CancellationToken cancellationToken = default)
        {
            var allDescendants = new List<T>();
            var children = await LoadChildrenAsync(parentKey, cancellationToken);
            
            foreach (var child in children)
            {
                allDescendants.Add(child);
                var childKey = _keySelector(child);
                var grandchildren = await LoadAllDescendantsAsync(childKey, cancellationToken);
                allDescendants.AddRange(grandchildren);
            }

            return allDescendants;
        }

        public void InvalidateCache(string parentKey = null)
        {
            if (parentKey == null)
            {
                _service.InvalidateCachePattern(_rootKey);
            }
            else
            {
                _service.InvalidateCache($"{_rootKey}:children:{parentKey}");
            }
        }

        public void Dispose()
        {
            if (!_disposed)
            {
                _disposed = true;
            }
        }
    }

    #endregion

    #region Support Classes

    /// <summary>
    /// Lazy loading strategies
    /// </summary>
    public enum LazyLoadStrategy
    {
        OnDemand,       // Load when requested
        Preload,        // Load proactively
        Background,     // Load in background
        Progressive     // Load incrementally
    }

    /// <summary>
    /// Lazy loading configuration
    /// </summary>
    public class LazyLoadingConfiguration
    {
        public int MaxConcurrentLoads { get; set; } = 5;
        public TimeSpan DefaultCacheExpiration { get; set; } = TimeSpan.FromMinutes(15);
        public bool EnablePreloading { get; set; } = true;
        public TimeSpan CleanupInterval { get; set; } = TimeSpan.FromMinutes(5);
        public int MaxCacheItems { get; set; } = 1000;
    }

    /// <summary>
    /// Loading context for tracking
    /// </summary>
    internal class LazyLoadContext
    {
        public string Key { get; set; }
        public LazyLoadStrategy Strategy { get; set; }
        public DateTime StartTime { get; set; }
        public DateTime? CompletionTime { get; set; }
        public bool IsCompleted { get; set; }
        public Exception Exception { get; set; }
    }

    /// <summary>
    /// Lazy load event arguments
    /// </summary>
    public class LazyLoadEventArgs
    {
        public string Key { get; set; }
        public LazyLoadStrategy Strategy { get; set; }
        public TimeSpan? Duration { get; set; }
        public Exception Error { get; set; }
    }

    /// <summary>
    /// Lazy load progress event arguments
    /// </summary>
    public class LazyLoadProgressEventArgs
    {
        public string Key { get; set; }
        public int PercentageComplete { get; set; }
        public string StatusMessage { get; set; }
        public long? ItemsLoaded { get; set; }
        public long? TotalItems { get; set; }
    }

    /// <summary>
    /// Lazy loading statistics
    /// </summary>
    public class LazyLoadingStats
    {
        public DateTime Timestamp { get; set; }
        public int ActiveContexts { get; set; }
        public int CachedItems { get; set; }
        public bool IsEnabled { get; set; }
        public int MaxConcurrentLoads { get; set; }
        public TimeSpan DefaultCacheExpiration { get; set; }
        public List<LoadingContextInfo> ContextDetails { get; set; } = new List<LoadingContextInfo>();
    }

    /// <summary>
    /// Loading context information
    /// </summary>
    public class LoadingContextInfo
    {
        public string Key { get; set; }
        public LazyLoadStrategy Strategy { get; set; }
        public DateTime StartTime { get; set; }
        public bool IsCompleted { get; set; }
        public bool HasError { get; set; }
    }

    #endregion
}