using System;
using System.Collections.Concurrent;
using System.ComponentModel;
using System.Threading;
using System.Threading.Tasks;
using System.Windows.Threading;

namespace MandADiscoverySuite.Services
{
    /// <summary>
    /// Service for tracking and managing progress of long-running operations
    /// </summary>
    public class ProgressTrackingService : IDisposable
    {
        private readonly ConcurrentDictionary<string, ProgressOperation> _operations = new();
        private readonly Timer _progressUpdateTimer;
        private readonly object _lockObject = new();
        
        public event EventHandler<ProgressUpdatedEventArgs> ProgressUpdated;
        public event EventHandler<ProgressCompletedEventArgs> ProgressCompleted;
        
        public ProgressTrackingService()
        {
            // Update progress every 100ms for smooth progress bars
            _progressUpdateTimer = new Timer(UpdateProgressCallbacks, null, 100, 100);
        }

        /// <summary>
        /// Starts tracking a new operation
        /// </summary>
        public ProgressToken StartOperation(string operationId, string description, bool isIndeterminate = false)
        {
            var operation = new ProgressOperation
            {
                Id = operationId,
                Description = description,
                IsIndeterminate = isIndeterminate,
                StartTime = DateTime.Now,
                LastUpdate = DateTime.Now
            };

            _operations[operationId] = operation;
            
            var token = new ProgressToken(operationId, this);
            
            // Notify immediately
            ProgressUpdated?.Invoke(this, new ProgressUpdatedEventArgs
            {
                OperationId = operationId,
                Description = description,
                Progress = 0,
                IsIndeterminate = isIndeterminate,
                IsActive = true
            });

            return token;
        }

        /// <summary>
        /// Updates the progress of an operation
        /// </summary>
        internal void UpdateProgress(string operationId, int progress, string status = null)
        {
            if (_operations.TryGetValue(operationId, out var operation))
            {
                lock (_lockObject)
                {
                    operation.Progress = Math.Max(0, Math.Min(100, progress));
                    operation.Status = status ?? operation.Status;
                    operation.LastUpdate = DateTime.Now;
                    operation.HasPendingUpdate = true;
                }
            }
        }

        /// <summary>
        /// Completes an operation
        /// </summary>
        internal void CompleteOperation(string operationId, bool success = true, string finalMessage = null)
        {
            if (_operations.TryRemove(operationId, out var operation))
            {
                var completedArgs = new ProgressCompletedEventArgs
                {
                    OperationId = operationId,
                    Description = operation.Description,
                    Success = success,
                    Duration = DateTime.Now - operation.StartTime,
                    FinalMessage = finalMessage ?? (success ? "Completed successfully" : "Operation failed")
                };

                // Update on UI thread
                App.Current?.Dispatcher.InvokeAsync(() =>
                {
                    ProgressCompleted?.Invoke(this, completedArgs);
                }, DispatcherPriority.Normal);
            }
        }

        /// <summary>
        /// Gets the current progress of an operation
        /// </summary>
        public ProgressInfo GetProgress(string operationId)
        {
            if (_operations.TryGetValue(operationId, out var operation))
            {
                return new ProgressInfo
                {
                    OperationId = operationId,
                    Description = operation.Description,
                    Progress = operation.Progress,
                    Status = operation.Status,
                    IsIndeterminate = operation.IsIndeterminate,
                    ElapsedTime = DateTime.Now - operation.StartTime
                };
            }
            return null;
        }

        /// <summary>
        /// Timer callback to update progress on UI thread
        /// </summary>
        private void UpdateProgressCallbacks(object state)
        {
            var pendingUpdates = new System.Collections.Generic.List<ProgressOperation>();
            
            // Collect operations that need UI updates
            lock (_lockObject)
            {
                foreach (var operation in _operations.Values)
                {
                    if (operation.HasPendingUpdate)
                    {
                        pendingUpdates.Add(operation);
                        operation.HasPendingUpdate = false;
                    }
                }
            }

            // Update UI on main thread
            if (pendingUpdates.Count > 0)
            {
                App.Current?.Dispatcher.InvokeAsync(() =>
                {
                    foreach (var operation in pendingUpdates)
                    {
                        ProgressUpdated?.Invoke(this, new ProgressUpdatedEventArgs
                        {
                            OperationId = operation.Id,
                            Description = operation.Description,
                            Progress = operation.Progress,
                            Status = operation.Status,
                            IsIndeterminate = operation.IsIndeterminate,
                            IsActive = true,
                            ElapsedTime = DateTime.Now - operation.StartTime
                        });
                    }
                }, DispatcherPriority.Normal);
            }
        }

        public void Dispose()
        {
            _progressUpdateTimer?.Dispose();
            _operations.Clear();
        }
    }

    /// <summary>
    /// Token for tracking and updating a specific operation
    /// </summary>
    public class ProgressToken : IDisposable
    {
        private readonly string _operationId;
        private readonly ProgressTrackingService _service;
        private bool _isCompleted;

        internal ProgressToken(string operationId, ProgressTrackingService service)
        {
            _operationId = operationId;
            _service = service;
        }

        /// <summary>
        /// Updates the progress percentage (0-100)
        /// </summary>
        public void Report(int progress, string status = null)
        {
            if (!_isCompleted)
            {
                _service.UpdateProgress(_operationId, progress, status);
            }
        }

        /// <summary>
        /// Completes the operation
        /// </summary>
        public void Complete(bool success = true, string finalMessage = null)
        {
            if (!_isCompleted)
            {
                _isCompleted = true;
                _service.CompleteOperation(_operationId, success, finalMessage);
            }
        }

        public void Dispose()
        {
            Complete();
        }
    }

    /// <summary>
    /// Internal operation tracking
    /// </summary>
    internal class ProgressOperation
    {
        public string Id { get; set; }
        public string Description { get; set; }
        public int Progress { get; set; }
        public string Status { get; set; }
        public bool IsIndeterminate { get; set; }
        public DateTime StartTime { get; set; }
        public DateTime LastUpdate { get; set; }
        public bool HasPendingUpdate { get; set; }
    }

    /// <summary>
    /// Event arguments for progress updates
    /// </summary>
    public class ProgressUpdatedEventArgs : EventArgs
    {
        public string OperationId { get; set; }
        public string Description { get; set; }
        public int Progress { get; set; }
        public string Status { get; set; }
        public bool IsIndeterminate { get; set; }
        public bool IsActive { get; set; }
        public TimeSpan ElapsedTime { get; set; }
    }

    /// <summary>
    /// Event arguments for progress completion
    /// </summary>
    public class ProgressCompletedEventArgs : EventArgs
    {
        public string OperationId { get; set; }
        public string Description { get; set; }
        public bool Success { get; set; }
        public TimeSpan Duration { get; set; }
        public string FinalMessage { get; set; }
    }

    /// <summary>
    /// Current progress information
    /// </summary>
    public class ProgressInfo
    {
        public string OperationId { get; set; }
        public string Description { get; set; }
        public int Progress { get; set; }
        public string Status { get; set; }
        public bool IsIndeterminate { get; set; }
        public TimeSpan ElapsedTime { get; set; }
    }
}