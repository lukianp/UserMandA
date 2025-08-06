using System;
using System.Threading;
using System.Threading.Tasks;
using System.Windows.Threading;

namespace MandADiscoverySuite.Services
{
    /// <summary>
    /// Service that provides debounced search functionality to prevent excessive searches while typing
    /// </summary>
    public class DebouncedSearchService
    {
        private Timer _debounceTimer;
        private readonly object _lock = new();
        private readonly int _debounceMilliseconds;
        
        /// <summary>
        /// Initializes a new instance of the DebouncedSearchService
        /// </summary>
        /// <param name="debounceMilliseconds">Delay in milliseconds before executing search (default 300ms)</param>
        public DebouncedSearchService(int debounceMilliseconds = 300)
        {
            _debounceMilliseconds = debounceMilliseconds;
        }
        
        /// <summary>
        /// Debounces a search action to only execute after the specified delay with no further input
        /// </summary>
        /// <param name="searchAction">The search action to execute</param>
        public void DebounceSearch(Action searchAction)
        {
            lock (_lock)
            {
                _debounceTimer?.Dispose();
                
                _debounceTimer = new Timer(_ =>
                {
                    App.Current?.Dispatcher.InvokeAsync(searchAction, DispatcherPriority.Normal);
                }, null, _debounceMilliseconds, Timeout.Infinite);
            }
        }
        
        /// <summary>
        /// Debounces an async search function
        /// </summary>
        /// <param name="searchFunc">The async search function to execute</param>
        /// <returns>Task representing the debounced operation</returns>
        public Task DebounceSearchAsync(Func<Task> searchFunc)
        {
            var tcs = new TaskCompletionSource<bool>();
            
            lock (_lock)
            {
                _debounceTimer?.Dispose();
                
                _debounceTimer = new Timer(async _ =>
                {
                    try
                    {
                        await App.Current?.Dispatcher.InvokeAsync(async () =>
                        {
                            await searchFunc();
                            tcs.SetResult(true);
                        });
                    }
                    catch (Exception ex)
                    {
                        tcs.SetException(ex);
                    }
                }, null, _debounceMilliseconds, Timeout.Infinite);
            }
            
            return tcs.Task;
        }
        
        /// <summary>
        /// Cancels any pending search operation
        /// </summary>
        public void CancelPendingSearch()
        {
            lock (_lock)
            {
                _debounceTimer?.Dispose();
                _debounceTimer = null;
            }
        }
        
        /// <summary>
        /// Disposes of resources used by the service
        /// </summary>
        public void Dispose()
        {
            lock (_lock)
            {
                _debounceTimer?.Dispose();
                _debounceTimer = null;
            }
        }
    }
    
    /// <summary>
    /// Generic version of DebouncedSearchService that returns search results
    /// </summary>
    /// <typeparam name="T">Type of search results</typeparam>
    public class DebouncedSearchService<T>
    {
        private Timer _debounceTimer;
        private readonly object _lock = new();
        private readonly int _debounceMilliseconds;
        private CancellationTokenSource _cts;
        
        /// <summary>
        /// Initializes a new instance of the generic DebouncedSearchService
        /// </summary>
        /// <param name="debounceMilliseconds">Delay in milliseconds before executing search (default 300ms)</param>
        public DebouncedSearchService(int debounceMilliseconds = 300)
        {
            _debounceMilliseconds = debounceMilliseconds;
        }
        
        /// <summary>
        /// Debounces a search function that returns results
        /// </summary>
        /// <param name="searchFunc">The search function to execute</param>
        /// <param name="resultHandler">Handler for the search results</param>
        /// <param name="errorHandler">Optional error handler</param>
        public void DebounceSearch(
            Func<CancellationToken, Task<T>> searchFunc, 
            Action<T> resultHandler,
            Action<Exception> errorHandler = null)
        {
            lock (_lock)
            {
                _cts?.Cancel();
                _cts = new CancellationTokenSource();
                var token = _cts.Token;
                
                _debounceTimer?.Dispose();
                
                _debounceTimer = new Timer(async _ =>
                {
                    if (token.IsCancellationRequested) return;
                    
                    try
                    {
                        var result = await searchFunc(token);
                        
                        if (!token.IsCancellationRequested)
                        {
                            App.Current?.Dispatcher.InvokeAsync(() => resultHandler(result), DispatcherPriority.Normal);
                        }
                    }
                    catch (OperationCanceledException)
                    {
                        // Search was cancelled, ignore
                    }
                    catch (Exception ex)
                    {
                        if (!token.IsCancellationRequested && errorHandler != null)
                        {
                            App.Current?.Dispatcher.InvokeAsync(() => errorHandler(ex), DispatcherPriority.Normal);
                        }
                    }
                }, null, _debounceMilliseconds, Timeout.Infinite);
            }
        }
        
        /// <summary>
        /// Cancels any pending search operation
        /// </summary>
        public void CancelPendingSearch()
        {
            lock (_lock)
            {
                _cts?.Cancel();
                _debounceTimer?.Dispose();
                _debounceTimer = null;
            }
        }
        
        /// <summary>
        /// Disposes of resources used by the service
        /// </summary>
        public void Dispose()
        {
            lock (_lock)
            {
                _cts?.Cancel();
                _cts?.Dispose();
                _debounceTimer?.Dispose();
                _debounceTimer = null;
            }
        }
    }
}