using System;
using System.Threading.Tasks;
using System.Windows.Threading;
using System.Windows;
using System.Diagnostics;

namespace MandADiscoverySuite.Services
{
    /// <summary>
    /// Service for optimizing dispatcher operations and UI thread management
    /// </summary>
    public class DispatcherOptimizationService
    {
        private readonly Dispatcher _dispatcher;
        private int _pendingOperations = 0;
        private readonly object _lock = new object();

        public DispatcherOptimizationService()
        {
            _dispatcher = Application.Current?.Dispatcher ?? Dispatcher.CurrentDispatcher;
        }

        /// <summary>
        /// Executes an action with optimal dispatcher priority for UI responsiveness
        /// </summary>
        public Task InvokeAsync(Action action, DispatcherPriority priority = DispatcherPriority.Background)
        {
            if (action == null) return Task.CompletedTask;

            lock (_lock)
            {
                _pendingOperations++;
            }

            return _dispatcher.InvokeAsync(() =>
            {
                try
                {
                    action();
                }
                finally
                {
                    lock (_lock)
                    {
                        _pendingOperations--;
                    }
                }
            }, priority).Task;
        }

        /// <summary>
        /// Executes an async function with optimal dispatcher priority
        /// </summary>
        public async Task<T> InvokeAsync<T>(Func<T> func, DispatcherPriority priority = DispatcherPriority.Background)
        {
            if (func == null) return default(T);

            lock (_lock)
            {
                _pendingOperations++;
            }

            try
            {
                return await _dispatcher.InvokeAsync(func, priority);
            }
            finally
            {
                lock (_lock)
                {
                    _pendingOperations--;
                }
            }
        }

        /// <summary>
        /// Executes an async function with optimal dispatcher priority
        /// </summary>
        public async Task<T> InvokeAsync<T>(Func<Task<T>> asyncFunc, DispatcherPriority priority = DispatcherPriority.Background)
        {
            if (asyncFunc == null) return default(T);

            lock (_lock)
            {
                _pendingOperations++;
            }

            try
            {
                var result = await _dispatcher.InvokeAsync(asyncFunc, priority);
                return await result;
            }
            finally
            {
                lock (_lock)
                {
                    _pendingOperations--;
                }
            }
        }

        /// <summary>
        /// Schedules UI updates with appropriate priorities to maintain responsiveness
        /// </summary>
        public Task ScheduleUIUpdate(Action updateAction, UIUpdatePriority priority = UIUpdatePriority.Normal)
        {
            var dispatcherPriority = ConvertToDispatcherPriority(priority);
            return InvokeAsync(updateAction, dispatcherPriority);
        }

        /// <summary>
        /// Schedules data operations with background priority to avoid blocking UI
        /// </summary>
        public Task ScheduleDataOperation(Action dataAction)
        {
            return InvokeAsync(dataAction, DispatcherPriority.Background);
        }

        /// <summary>
        /// Schedules validation operations with input priority
        /// </summary>
        public Task ScheduleValidation(Action validationAction)
        {
            return InvokeAsync(validationAction, DispatcherPriority.Input);
        }

        /// <summary>
        /// Schedules layout operations with loaded priority
        /// </summary>
        public Task ScheduleLayoutUpdate(Action layoutAction)
        {
            return InvokeAsync(layoutAction, DispatcherPriority.Loaded);
        }

        /// <summary>
        /// Batches multiple UI updates to reduce dispatcher calls
        /// </summary>
        public Task BatchUIUpdates(params Action[] actions)
        {
            if (actions == null || actions.Length == 0) return Task.CompletedTask;

            return InvokeAsync(() =>
            {
                foreach (var action in actions)
                {
                    try
                    {
                        action?.Invoke();
                    }
                    catch (Exception ex)
                    {
                        Debug.WriteLine($"Batched UI update error: {ex.Message}");
                    }
                }
            }, DispatcherPriority.Normal);
        }

        /// <summary>
        /// Executes operations during idle time to avoid interfering with user interactions
        /// </summary>
        public Task ExecuteOnIdle(Action idleAction)
        {
            return InvokeAsync(idleAction, DispatcherPriority.ApplicationIdle);
        }

        /// <summary>
        /// Throttles operations to prevent overwhelming the dispatcher
        /// </summary>
        public async Task ThrottledInvoke(Action action, int maxConcurrent = 5)
        {
            // Wait if too many operations are pending
            while (GetPendingOperations() >= maxConcurrent)
            {
                await Task.Delay(10);
            }

            await InvokeAsync(action, DispatcherPriority.Background);
        }

        /// <summary>
        /// Gets the number of pending dispatcher operations
        /// </summary>
        public int GetPendingOperations()
        {
            lock (_lock)
            {
                return _pendingOperations;
            }
        }

        /// <summary>
        /// Checks if the current thread is the UI thread
        /// </summary>
        public bool IsUIThread()
        {
            return _dispatcher.CheckAccess();
        }

        /// <summary>
        /// Ensures an action runs on the UI thread with the specified priority
        /// </summary>
        public async Task EnsureUIThread(Action action, DispatcherPriority priority = DispatcherPriority.Normal)
        {
            if (IsUIThread())
            {
                action();
            }
            else
            {
                await InvokeAsync(action, priority);
            }
        }

        /// <summary>
        /// Yields control to allow other operations to execute
        /// </summary>
        public static async Task Yield()
        {
            await Application.Current.Dispatcher.InvokeAsync(() => { }, DispatcherPriority.Background);
        }

        /// <summary>
        /// Processes pending dispatcher operations
        /// </summary>
        public void ProcessPendingOperations()
        {
            if (IsUIThread())
            {
                // Force processing of background priority items
                _dispatcher.Invoke(() => { }, DispatcherPriority.Background);
            }
        }

        /// <summary>
        /// Gets dispatcher performance statistics
        /// </summary>
        public DispatcherStats GetStats()
        {
            return new DispatcherStats
            {
                PendingOperations = GetPendingOperations(),
                IsUIThread = IsUIThread(),
                HasShutdownStarted = _dispatcher.HasShutdownStarted,
                HasShutdownFinished = _dispatcher.HasShutdownFinished
            };
        }

        private DispatcherPriority ConvertToDispatcherPriority(UIUpdatePriority priority)
        {
            return priority switch
            {
                UIUpdatePriority.Critical => DispatcherPriority.Send,
                UIUpdatePriority.High => DispatcherPriority.Render,
                UIUpdatePriority.Normal => DispatcherPriority.Normal,
                UIUpdatePriority.Low => DispatcherPriority.Background,
                UIUpdatePriority.Idle => DispatcherPriority.ApplicationIdle,
                _ => DispatcherPriority.Normal
            };
        }
    }

    /// <summary>
    /// Priority levels for UI updates
    /// </summary>
    public enum UIUpdatePriority
    {
        Critical,   // Immediate, blocks everything else
        High,       // Rendering priority
        Normal,     // Standard UI updates
        Low,        // Background operations
        Idle        // Only when application is idle
    }

    /// <summary>
    /// Dispatcher performance statistics
    /// </summary>
    public class DispatcherStats
    {
        public int PendingOperations { get; set; }
        public bool IsUIThread { get; set; }
        public bool HasShutdownStarted { get; set; }
        public bool HasShutdownFinished { get; set; }

        public override string ToString()
        {
            return $"Pending: {PendingOperations}, UI Thread: {IsUIThread}, Shutdown: {HasShutdownStarted}";
        }
    }

    /// <summary>
    /// Extension methods for easier dispatcher optimization usage
    /// </summary>
    public static class DispatcherExtensions
    {
        private static readonly DispatcherOptimizationService _service = new DispatcherOptimizationService();

        /// <summary>
        /// Executes action with background priority
        /// </summary>
        public static Task InvokeBackground(this Dispatcher dispatcher, Action action)
        {
            return _service.InvokeAsync(action, DispatcherPriority.Background);
        }

        /// <summary>
        /// Executes action on idle
        /// </summary>
        public static Task InvokeOnIdle(this Dispatcher dispatcher, Action action)
        {
            return _service.ExecuteOnIdle(action);
        }

        /// <summary>
        /// Schedules UI update with specified priority
        /// </summary>
        public static Task ScheduleUpdate(this Dispatcher dispatcher, Action action, UIUpdatePriority priority = UIUpdatePriority.Normal)
        {
            return _service.ScheduleUIUpdate(action, priority);
        }
    }
}