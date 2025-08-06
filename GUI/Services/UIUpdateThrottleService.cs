using System;
using System.Collections.Concurrent;
using System.Threading;
using System.Threading.Tasks;
using System.Windows.Threading;

namespace MandADiscoverySuite.Services
{
    /// <summary>
    /// Service for throttling UI updates to prevent excessive render cycles
    /// </summary>
    public class UIUpdateThrottleService
    {
        private readonly ConcurrentDictionary<string, ThrottleTimer> _throttleTimers = new();
        
        /// <summary>
        /// Throttles an action to execute at most once every specified interval
        /// </summary>
        public void Throttle(string key, TimeSpan throttleInterval, Action action, DispatcherPriority priority = DispatcherPriority.Normal)
        {
            var timer = _throttleTimers.GetOrAdd(key, _ => new ThrottleTimer());
            
            timer.Throttle(throttleInterval, action, priority);
        }
        
        /// <summary>
        /// Debounces an action to execute only after the specified delay with no further calls
        /// </summary>
        public void Debounce(string key, TimeSpan debounceDelay, Action action, DispatcherPriority priority = DispatcherPriority.Normal)
        {
            var timer = _throttleTimers.GetOrAdd(key, _ => new ThrottleTimer());
            
            timer.Debounce(debounceDelay, action, priority);
        }
        
        /// <summary>
        /// Clears throttle state for a specific key
        /// </summary>
        public void ClearThrottle(string key)
        {
            if (_throttleTimers.TryRemove(key, out var timer))
            {
                timer.Dispose();
            }
        }
        
        /// <summary>
        /// Clears all throttle states
        /// </summary>
        public void ClearAll()
        {
            foreach (var kvp in _throttleTimers)
            {
                kvp.Value.Dispose();
            }
            _throttleTimers.Clear();
        }
        
        private class ThrottleTimer : IDisposable
        {
            private readonly object _lock = new();
            private DateTime _lastExecuted = DateTime.MinValue;
            private Timer _debounceTimer;
            private bool _disposed;
            
            public void Throttle(TimeSpan throttleInterval, Action action, DispatcherPriority priority)
            {
                lock (_lock)
                {
                    if (_disposed) return;
                    
                    var now = DateTime.UtcNow;
                    if (now - _lastExecuted >= throttleInterval)
                    {
                        _lastExecuted = now;
                        
                        // Execute on UI thread with specified priority
                        App.Current?.Dispatcher.InvokeAsync(action, priority);
                    }
                }
            }
            
            public void Debounce(TimeSpan debounceDelay, Action action, DispatcherPriority priority)
            {
                lock (_lock)
                {
                    if (_disposed) return;
                    
                    _debounceTimer?.Dispose();
                    
                    _debounceTimer = new Timer(_ =>
                    {
                        App.Current?.Dispatcher.InvokeAsync(action, priority);
                    }, null, debounceDelay, Timeout.InfiniteTimeSpan);
                }
            }
            
            public void Dispose()
            {
                if (!_disposed)
                {
                    lock (_lock)
                    {
                        _debounceTimer?.Dispose();
                        _disposed = true;
                    }
                }
            }
        }
    }
}