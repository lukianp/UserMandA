using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using System.Windows.Threading;

namespace MandADiscoverySuite.Services
{
    /// <summary>
    /// Service for providing debounced search functionality to improve UI responsiveness
    /// </summary>
    public class DebouncedSearchService : IDisposable
    {
        private readonly Dictionary<string, SearchContext> _searchContexts;
        private readonly object _lockObject = new object();
        private bool _disposed;

        public DebouncedSearchService()
        {
            _searchContexts = new Dictionary<string, SearchContext>();
        }

        /// <summary>
        /// Performs a debounced search operation
        /// </summary>
        /// <param name="searchId">Unique identifier for this search context</param>
        /// <param name="searchTerm">Search term to process</param>
        /// <param name="searchAction">Action to execute after debounce delay</param>
        /// <param name="debounceDelay">Delay before executing search (default 300ms)</param>
        public void DebouncedSearch(string searchId, string searchTerm, Action<string> searchAction, TimeSpan? debounceDelay = null)
        {
            if (_disposed) return;

            var delay = debounceDelay ?? TimeSpan.FromMilliseconds(300);

            lock (_lockObject)
            {
                // Cancel existing search for this ID
                if (_searchContexts.TryGetValue(searchId, out var existingContext))
                {
                    existingContext.CancellationTokenSource.Cancel();
                    existingContext.CancellationTokenSource.Dispose();
                }

                // Create new search context
                var cancellationTokenSource = new CancellationTokenSource();
                var context = new SearchContext
                {
                    SearchTerm = searchTerm,
                    SearchAction = searchAction,
                    CancellationTokenSource = cancellationTokenSource,
                    Timer = new DispatcherTimer(DispatcherPriority.Background)
                    {
                        Interval = delay
                    }
                };

                context.Timer.Tick += (sender, e) =>
                {
                    context.Timer.Stop();
                    if (!cancellationTokenSource.Token.IsCancellationRequested)
                    {
                        try
                        {
                            searchAction(searchTerm);
                        }
                        catch (Exception ex)
                        {
                            System.Diagnostics.Debug.WriteLine($"Debounced search error: {ex.Message}");
                        }
                        finally
                        {
                            lock (_lockObject)
                            {
                                if (_searchContexts.ContainsKey(searchId))
                                {
                                    _searchContexts[searchId].Dispose();
                                    _searchContexts.Remove(searchId);
                                }
                            }
                        }
                    }
                };

                _searchContexts[searchId] = context;
                context.Timer.Start();
            }
        }

        /// <summary>
        /// Performs an async debounced search operation
        /// </summary>
        /// <param name="searchId">Unique identifier for this search context</param>
        /// <param name="searchTerm">Search term to process</param>
        /// <param name="searchActionAsync">Async action to execute after debounce delay</param>
        /// <param name="debounceDelay">Delay before executing search (default 300ms)</param>
        public void DebouncedSearchAsync(string searchId, string searchTerm, Func<string, CancellationToken, Task> searchActionAsync, TimeSpan? debounceDelay = null)
        {
            if (_disposed) return;

            var delay = debounceDelay ?? TimeSpan.FromMilliseconds(300);

            lock (_lockObject)
            {
                // Cancel existing search for this ID
                if (_searchContexts.TryGetValue(searchId, out var existingContext))
                {
                    existingContext.CancellationTokenSource.Cancel();
                    existingContext.CancellationTokenSource.Dispose();
                }

                // Create new search context
                var cancellationTokenSource = new CancellationTokenSource();
                var context = new SearchContext
                {
                    SearchTerm = searchTerm,
                    SearchActionAsync = searchActionAsync,
                    CancellationTokenSource = cancellationTokenSource,
                    Timer = new DispatcherTimer(DispatcherPriority.Background)
                    {
                        Interval = delay
                    }
                };

                context.Timer.Tick += async (sender, e) =>
                {
                    context.Timer.Stop();
                    if (!cancellationTokenSource.Token.IsCancellationRequested)
                    {
                        try
                        {
                            await searchActionAsync(searchTerm, cancellationTokenSource.Token);
                        }
                        catch (OperationCanceledException)
                        {
                            // Expected when cancelled
                        }
                        catch (Exception ex)
                        {
                            System.Diagnostics.Debug.WriteLine($"Debounced async search error: {ex.Message}");
                        }
                        finally
                        {
                            lock (_lockObject)
                            {
                                if (_searchContexts.ContainsKey(searchId))
                                {
                                    _searchContexts[searchId].Dispose();
                                    _searchContexts.Remove(searchId);
                                }
                            }
                        }
                    }
                };

                _searchContexts[searchId] = context;
                context.Timer.Start();
            }
        }

        /// <summary>
        /// Cancels any pending search for the specified ID
        /// </summary>
        /// <param name="searchId">Search ID to cancel</param>
        public void CancelSearch(string searchId)
        {
            lock (_lockObject)
            {
                if (_searchContexts.TryGetValue(searchId, out var context))
                {
                    context.CancellationTokenSource.Cancel();
                    context.Dispose();
                    _searchContexts.Remove(searchId);
                }
            }
        }

        /// <summary>
        /// Gets the current search term for a given search ID
        /// </summary>
        /// <param name="searchId">Search ID</param>
        /// <returns>Current search term or null if not found</returns>
        public string GetCurrentSearchTerm(string searchId)
        {
            lock (_lockObject)
            {
                return _searchContexts.TryGetValue(searchId, out var context) ? context.SearchTerm : null;
            }
        }

        /// <summary>
        /// Gets whether a search is currently pending for the given ID
        /// </summary>
        /// <param name="searchId">Search ID</param>
        /// <returns>True if search is pending</returns>
        public bool IsSearchPending(string searchId)
        {
            lock (_lockObject)
            {
                return _searchContexts.ContainsKey(searchId);
            }
        }

        public void Dispose()
        {
            if (!_disposed)
            {
                lock (_lockObject)
                {
                    foreach (var context in _searchContexts.Values)
                    {
                        context.Dispose();
                    }
                    _searchContexts.Clear();
                    _disposed = true;
                }
            }
        }

        private class SearchContext : IDisposable
        {
            public string SearchTerm { get; set; }
            public Action<string> SearchAction { get; set; }
            public Func<string, CancellationToken, Task> SearchActionAsync { get; set; }
            public CancellationTokenSource CancellationTokenSource { get; set; }
            public DispatcherTimer Timer { get; set; }

            public void Dispose()
            {
                Timer?.Stop();
                CancellationTokenSource?.Cancel();
                CancellationTokenSource?.Dispose();
            }
        }
    }
}