#nullable enable

using System;
using System.Threading;
using System.Threading.Tasks;
using System.Windows;
using System.Windows.Threading;
using Microsoft.Extensions.Logging;

namespace MandADiscoverySuite.Services
{
    /// <summary>
    /// Central navigation service that prevents async deadlocks and race conditions
    /// </summary>
    public class NavigationService : IDisposable
    {
        private readonly ILogger<NavigationService>? _logger;
        private readonly TabsService _tabsService;
        private readonly SemaphoreSlim _navigationSemaphore;
        private CancellationTokenSource? _cancellationTokenSource;
        private bool _disposed = false;

        public event EventHandler<NavigationEventArgs>? NavigationStarted;
        public event EventHandler<NavigationEventArgs>? NavigationCompleted;
        public event EventHandler<NavigationEventArgs>? NavigationFailed;

        public NavigationService(TabsService tabsService, ILogger<NavigationService>? logger = null)
        {
            _tabsService = tabsService ?? throw new ArgumentNullException(nameof(tabsService));
            _logger = logger;
            _navigationSemaphore = new SemaphoreSlim(1, 1);
        }

        /// <summary>
        /// Navigate to a tab safely without deadlocks
        /// </summary>
        public async Task<bool> NavigateToTabAsync(string tabKey, string? title = null, CancellationToken cancellationToken = default)
        {
            if (string.IsNullOrWhiteSpace(tabKey))
            {
                _logger?.LogWarning("[NavigationService] Empty tab key provided");
                return false;
            }

            var navigationId = Guid.NewGuid().ToString("N")[..8];
            _logger?.LogInformation($"[NavigationService] [{navigationId}] Starting navigation to: {tabKey}");

            try
            {
                // Use semaphore to prevent race conditions during navigation
                await _navigationSemaphore.WaitAsync(cancellationToken);
                
                try
                {
                    // Cancel any previous navigation
                    _cancellationTokenSource?.Cancel();
                    _cancellationTokenSource = CancellationTokenSource.CreateLinkedTokenSource(cancellationToken);

                    var navArgs = new NavigationEventArgs { TabKey = tabKey, Title = title, NavigationId = navigationId };
                    NavigationStarted?.Invoke(this, navArgs);

                    // Execute navigation on UI thread if needed, but avoid deadlock
                    bool success = false;

                    if (IsOnUIThread())
                    {
                        // Already on UI thread - execute directly
                        success = await ExecuteNavigationAsync(tabKey, title, _cancellationTokenSource.Token);
                    }
                    else
                    {
                        // On background thread - use proper dispatching
                        var tcs = new TaskCompletionSource<bool>();

                        await Application.Current.Dispatcher.InvokeAsync(async () =>
                        {
                            try
                            {
                                var result = await ExecuteNavigationAsync(tabKey, title, _cancellationTokenSource.Token);
                                tcs.SetResult(result);
                            }
                            catch (Exception ex)
                            {
                                tcs.SetException(ex);
                            }
                        }, DispatcherPriority.Normal);

                        success = await tcs.Task;
                    }

                    if (success)
                    {
                        _logger?.LogInformation($"[NavigationService] [{navigationId}] Successfully navigated to: {tabKey}");
                        NavigationCompleted?.Invoke(this, navArgs);
                    }
                    else
                    {
                        _logger?.LogWarning($"[NavigationService] [{navigationId}] Failed to navigate to: {tabKey}");
                        NavigationFailed?.Invoke(this, navArgs);
                    }

                    return success;
                }
                finally
                {
                    _navigationSemaphore.Release();
                }
            }
            catch (OperationCanceledException)
            {
                _logger?.LogInformation($"[NavigationService] [{navigationId}] Navigation cancelled for: {tabKey}");
                return false;
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, $"[NavigationService] [{navigationId}] Error navigating to: {tabKey}");
                
                var navArgs = new NavigationEventArgs { TabKey = tabKey, Title = title, NavigationId = navigationId };
                NavigationFailed?.Invoke(this, navArgs);
                
                return false;
            }
        }

        /// <summary>
        /// Execute the actual navigation logic
        /// </summary>
        private async Task<bool> ExecuteNavigationAsync(string tabKey, string? title, CancellationToken cancellationToken)
        {
            try
            {
                // Ensure we're on the UI thread
                if (!IsOnUIThread())
                {
                    throw new InvalidOperationException("ExecuteNavigationAsync must be called on UI thread");
                }

                cancellationToken.ThrowIfCancellationRequested();

                // Use TabsService to open the tab
                var success = await _tabsService.OpenTabAsync(tabKey, title);
                
                return success;
            }
            catch (OperationCanceledException)
            {
                throw;
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, $"[NavigationService] Error executing navigation to: {tabKey}");
                return false;
            }
        }

        /// <summary>
        /// Check if currently on UI thread
        /// </summary>
        private static bool IsOnUIThread()
        {
            return Application.Current?.Dispatcher?.CheckAccess() == true;
        }

        /// <summary>
        /// Cancel any ongoing navigation
        /// </summary>
        public void CancelNavigation()
        {
            _cancellationTokenSource?.Cancel();
            _logger?.LogInformation("[NavigationService] Navigation cancelled by user request");
        }

        /// <summary>
        /// Dispose resources
        /// </summary>
        public void Dispose()
        {
            _logger?.LogInformation("[NavigationService] Dispose() method called - cleaning up resources");
            Dispose(true);
            GC.SuppressFinalize(this);
        }

        /// <summary>
        /// Releases the unmanaged resources used by the NavigationService and optionally releases the managed resources
        /// </summary>
        /// <param name="disposing">true to release both managed and unmanaged resources; false to release only unmanaged resources</param>
        protected virtual void Dispose(bool disposing)
        {
            if (!_disposed)
            {
                if (disposing)
                {
                    // Dispose managed resources
                    _cancellationTokenSource?.Cancel();
                    _cancellationTokenSource?.Dispose();
                    _navigationSemaphore?.Dispose();
                    _logger?.LogInformation("[NavigationService] Disposed managed resources successfully");
                }

                _disposed = true;
            }
        }
    }

    /// <summary>
    /// Navigation event arguments
    /// </summary>
    public class NavigationEventArgs : EventArgs
    {
        public string TabKey { get; set; } = string.Empty;
        public string? Title { get; set; }
        public string NavigationId { get; set; } = string.Empty;
    }
}