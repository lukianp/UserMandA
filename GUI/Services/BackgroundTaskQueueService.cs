using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;

namespace MandADiscoverySuite.Services
{
    /// <summary>
    /// Service for managing background task execution with priority queuing and throttling
    /// </summary>
    public class BackgroundTaskQueueService : IDisposable
    {
        private readonly ILogger<BackgroundTaskQueueService> _logger;
        private readonly NotificationService _notificationService;
        private readonly ConcurrentDictionary<BackgroundTaskPriority, ConcurrentQueue<BackgroundTaskItem>> _taskQueues;
        private readonly ConcurrentDictionary<string, BackgroundTaskItem> _runningTasks;
        private readonly ConcurrentDictionary<string, BackgroundTaskItem> _completedTasks;
        private readonly Timer _processingTimer;
        private readonly SemaphoreSlim _processingLock;
        private readonly object _lockObject = new object();
        
        private readonly BackgroundTaskConfiguration _configuration;
        private int _activeTaskCount;
        private bool _disposed;
        private bool _isProcessing;

        public BackgroundTaskQueueService(
            ILogger<BackgroundTaskQueueService> logger = null,
            NotificationService notificationService = null)
        {
            _logger = logger;
            _notificationService = notificationService;
            _configuration = new BackgroundTaskConfiguration();
            
            _taskQueues = new ConcurrentDictionary<BackgroundTaskPriority, ConcurrentQueue<BackgroundTaskItem>>();
            _runningTasks = new ConcurrentDictionary<string, BackgroundTaskItem>();
            _completedTasks = new ConcurrentDictionary<string, BackgroundTaskItem>();
            
            // Initialize queues for each priority level
            foreach (BackgroundTaskPriority priority in Enum.GetValues<BackgroundTaskPriority>())
            {
                _taskQueues[priority] = new ConcurrentQueue<BackgroundTaskItem>();
            }
            
            _processingLock = new SemaphoreSlim(1, 1);
            
            // Start processing timer (check every 100ms)
            _processingTimer = new Timer(ProcessTasks, null, TimeSpan.FromMilliseconds(100), TimeSpan.FromMilliseconds(100));
            
            _logger?.LogInformation("Background task queue service initialized with max concurrent tasks: {MaxConcurrentTasks}", 
                _configuration.MaxConcurrentTasks);
        }

        #region Public Properties

        /// <summary>
        /// Gets the total number of queued tasks across all priorities
        /// </summary>
        public int QueuedTaskCount => _taskQueues.Values.Sum(queue => queue.Count);

        /// <summary>
        /// Gets the number of currently running tasks
        /// </summary>
        public int RunningTaskCount => _runningTasks.Count;

        /// <summary>
        /// Gets the number of completed tasks
        /// </summary>
        public int CompletedTaskCount => _completedTasks.Count;

        /// <summary>
        /// Gets whether the queue is currently processing tasks
        /// </summary>
        public bool IsProcessing => _isProcessing;

        /// <summary>
        /// Gets the maximum number of concurrent tasks allowed
        /// </summary>
        public int MaxConcurrentTasks => _configuration.MaxConcurrentTasks;

        #endregion

        #region Events

        /// <summary>
        /// Raised when a task is queued
        /// </summary>
        public event Action<BackgroundTaskItem> OnTaskQueued;

        /// <summary>
        /// Raised when a task starts execution
        /// </summary>
        public event Action<BackgroundTaskItem> OnTaskStarted;

        /// <summary>
        /// Raised when a task completes successfully
        /// </summary>
        public event Action<BackgroundTaskItem> OnTaskCompleted;

        /// <summary>
        /// Raised when a task fails
        /// </summary>
        public event Action<BackgroundTaskItem> OnTaskFailed;

        /// <summary>
        /// Raised when task progress is updated
        /// </summary>
        public event Action<BackgroundTaskItem> OnTaskProgressUpdated;

        /// <summary>
        /// Raised when queue statistics are updated
        /// </summary>
        public event Action<BackgroundTaskQueueStats> OnQueueStatsUpdated;

        #endregion

        #region Public Methods

        /// <summary>
        /// Queues a background task for execution
        /// </summary>
        public string QueueTask(Func<CancellationToken, IProgress<TaskProgress>, Task> taskFunc, 
            string name, 
            BackgroundTaskPriority priority = BackgroundTaskPriority.Normal,
            string description = null,
            object metadata = null)
        {
            if (taskFunc == null)
                throw new ArgumentNullException(nameof(taskFunc));

            try
            {
                var taskItem = new BackgroundTaskItem
                {
                    Id = Guid.NewGuid().ToString(),
                    Name = name ?? "Unnamed Task",
                    Description = description,
                    Priority = priority,
                    TaskFunction = taskFunc,
                    Metadata = metadata,
                    Status = BackgroundTaskStatus.Queued,
                    QueuedAt = DateTime.UtcNow,
                    CancellationTokenSource = new CancellationTokenSource()
                };

                _taskQueues[priority].Enqueue(taskItem);
                
                OnTaskQueued?.Invoke(taskItem);
                
                _logger?.LogDebug("Queued task: {TaskName} ({TaskId}) with priority {Priority}", 
                    taskItem.Name, taskItem.Id, priority);
                
                return taskItem.Id;
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error queuing task: {TaskName}", name);
                throw;
            }
        }

        /// <summary>
        /// Queues a background task that returns a result
        /// </summary>
        public string QueueTask<T>(Func<CancellationToken, IProgress<TaskProgress>, Task<T>> taskFunc,
            string name,
            BackgroundTaskPriority priority = BackgroundTaskPriority.Normal,
            string description = null,
            object metadata = null)
        {
            return QueueTask(async (ct, progress) =>
            {
                var result = await taskFunc(ct, progress);
                // Store result in metadata or handle as needed
            }, name, priority, description, metadata);
        }

        /// <summary>
        /// Cancels a queued or running task
        /// </summary>
        public bool CancelTask(string taskId)
        {
            if (string.IsNullOrEmpty(taskId))
                return false;

            try
            {
                // Check if task is running
                if (_runningTasks.TryGetValue(taskId, out var runningTask))
                {
                    runningTask.CancellationTokenSource.Cancel();
                    runningTask.Status = BackgroundTaskStatus.Cancelled;
                    runningTask.CompletedAt = DateTime.UtcNow;
                    
                    _logger?.LogDebug("Cancelled running task: {TaskName} ({TaskId})", runningTask.Name, taskId);
                    return true;
                }

                // Check if task is queued
                foreach (var queue in _taskQueues.Values)
                {
                    var queuedTasks = new List<BackgroundTaskItem>();
                    BackgroundTaskItem foundTask = null;

                    // Dequeue all tasks to find the target
                    while (queue.TryDequeue(out var task))
                    {
                        if (task.Id == taskId)
                        {
                            foundTask = task;
                        }
                        else
                        {
                            queuedTasks.Add(task);
                        }
                    }

                    // Re-queue all tasks except the cancelled one
                    foreach (var task in queuedTasks)
                    {
                        queue.Enqueue(task);
                    }

                    if (foundTask != null)
                    {
                        foundTask.Status = BackgroundTaskStatus.Cancelled;
                        foundTask.CompletedAt = DateTime.UtcNow;
                        _completedTasks.TryAdd(foundTask.Id, foundTask);
                        
                        _logger?.LogDebug("Cancelled queued task: {TaskName} ({TaskId})", foundTask.Name, taskId);
                        return true;
                    }
                }

                return false;
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error cancelling task: {TaskId}", taskId);
                return false;
            }
        }

        /// <summary>
        /// Gets the status of a task
        /// </summary>
        public BackgroundTaskItem GetBackgroundTaskStatus(string taskId)
        {
            if (string.IsNullOrEmpty(taskId))
                return null;

            // Check running tasks
            if (_runningTasks.TryGetValue(taskId, out var runningTask))
                return runningTask;

            // Check completed tasks
            if (_completedTasks.TryGetValue(taskId, out var completedTask))
                return completedTask;

            // Check queued tasks
            foreach (var queue in _taskQueues.Values)
            {
                foreach (var task in queue)
                {
                    if (task.Id == taskId)
                        return task;
                }
            }

            return null;
        }

        /// <summary>
        /// Gets all tasks with optional status filter
        /// </summary>
        public List<BackgroundTaskItem> GetTasks(BackgroundTaskStatus? statusFilter = null)
        {
            try
            {
                var allTasks = new List<BackgroundTaskItem>();

                // Add running tasks
                allTasks.AddRange(_runningTasks.Values);

                // Add completed tasks
                allTasks.AddRange(_completedTasks.Values);

                // Add queued tasks
                foreach (var queue in _taskQueues.Values)
                {
                    allTasks.AddRange(queue);
                }

                if (statusFilter.HasValue)
                {
                    allTasks = allTasks.Where(t => t.Status == statusFilter.Value).ToList();
                }

                return allTasks.OrderByDescending(t => t.QueuedAt).ToList();
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error getting tasks");
                return new List<BackgroundTaskItem>();
            }
        }

        /// <summary>
        /// Clears completed tasks from memory
        /// </summary>
        public int ClearCompletedTasks(TimeSpan? olderThan = null)
        {
            try
            {
                var cutoffTime = DateTime.UtcNow - (olderThan ?? TimeSpan.FromHours(1));
                var tasksToRemove = new List<string>();

                foreach (var kvp in _completedTasks)
                {
                    if (kvp.Value.CompletedAt.HasValue && kvp.Value.CompletedAt.Value < cutoffTime)
                    {
                        tasksToRemove.Add(kvp.Key);
                    }
                }

                foreach (var taskId in tasksToRemove)
                {
                    _completedTasks.TryRemove(taskId, out _);
                }

                _logger?.LogDebug("Cleared {Count} completed tasks", tasksToRemove.Count);
                return tasksToRemove.Count;
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error clearing completed tasks");
                return 0;
            }
        }

        /// <summary>
        /// Gets queue statistics
        /// </summary>
        public BackgroundTaskQueueStats GetStatistics()
        {
            try
            {
                var stats = new BackgroundTaskQueueStats
                {
                    Timestamp = DateTime.UtcNow,
                    QueuedTasks = QueuedTaskCount,
                    RunningTasks = RunningTaskCount,
                    CompletedTasks = CompletedTaskCount,
                    MaxConcurrentTasks = MaxConcurrentTasks,
                    IsProcessing = IsProcessing,
                    PriorityQueueStats = new Dictionary<BackgroundTaskPriority, int>()
                };

                foreach (var kvp in _taskQueues)
                {
                    stats.PriorityQueueStats[kvp.Key] = kvp.Value.Count;
                }

                return stats;
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error getting queue statistics");
                return new BackgroundTaskQueueStats { Timestamp = DateTime.UtcNow };
            }
        }

        /// <summary>
        /// Sets the maximum number of concurrent tasks
        /// </summary>
        public void SetMaxConcurrentTasks(int maxTasks)
        {
            if (maxTasks <= 0)
                throw new ArgumentException("Max concurrent tasks must be greater than 0", nameof(maxTasks));

            _configuration.MaxConcurrentTasks = maxTasks;
            _logger?.LogDebug("Updated max concurrent tasks to: {MaxTasks}", maxTasks);
        }

        /// <summary>
        /// Pauses task processing
        /// </summary>
        public void PauseProcessing()
        {
            _configuration.IsPaused = true;
            _logger?.LogInformation("Task processing paused");
        }

        /// <summary>
        /// Resumes task processing
        /// </summary>
        public void ResumeProcessing()
        {
            _configuration.IsPaused = false;
            _logger?.LogInformation("Task processing resumed");
        }

        #endregion

        #region Private Methods

        private void ProcessTasks(object state)
        {
            if (_disposed || _configuration.IsPaused)
                return;

            if (!_processingLock.Wait(0))
                return;

            try
            {
                _isProcessing = true;
                ProcessTasksInternal();
            }
            finally
            {
                _isProcessing = false;
                _processingLock.Release();
            }
        }

        private void ProcessTasksInternal()
        {
            try
            {
                // Check if we can start more tasks
                while (_runningTasks.Count < _configuration.MaxConcurrentTasks)
                {
                    var nextTask = GetNextTask();
                    if (nextTask == null)
                        break;

                    StartTask(nextTask);
                }

                // Update statistics
                var stats = GetStatistics();
                OnQueueStatsUpdated?.Invoke(stats);
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error processing tasks");
            }
        }

        private BackgroundTaskItem GetNextTask()
        {
            // Process tasks by priority (High -> Normal -> Low)
            var priorities = new[] { BackgroundTaskPriority.High, BackgroundTaskPriority.Normal, BackgroundTaskPriority.Low };

            foreach (var priority in priorities)
            {
                if (_taskQueues[priority].TryDequeue(out var task))
                {
                    return task;
                }
            }

            return null;
        }

        private void StartTask(BackgroundTaskItem taskItem)
        {
            try
            {
                taskItem.Status = BackgroundTaskStatus.Running;
                taskItem.StartedAt = DateTime.UtcNow;
                
                _runningTasks.TryAdd(taskItem.Id, taskItem);
                
                OnTaskStarted?.Invoke(taskItem);
                
                // Create progress reporter
                var progress = new Progress<TaskProgress>(p =>
                {
                    taskItem.Progress = p;
                    OnTaskProgressUpdated?.Invoke(taskItem);
                });

                // Start the task
                Task.Run(async () =>
                {
                    try
                    {
                        await taskItem.TaskFunction(taskItem.CancellationTokenSource.Token, progress);
                        
                        taskItem.Status = BackgroundTaskStatus.Completed;
                        taskItem.CompletedAt = DateTime.UtcNow;
                        
                        OnTaskCompleted?.Invoke(taskItem);
                        
                        _logger?.LogDebug("Task completed: {TaskName} ({TaskId})", taskItem.Name, taskItem.Id);
                    }
                    catch (OperationCanceledException)
                    {
                        taskItem.Status = BackgroundTaskStatus.Cancelled;
                        taskItem.CompletedAt = DateTime.UtcNow;
                        
                        _logger?.LogDebug("Task cancelled: {TaskName} ({TaskId})", taskItem.Name, taskItem.Id);
                    }
                    catch (Exception ex)
                    {
                        taskItem.Status = BackgroundTaskStatus.Failed;
                        taskItem.CompletedAt = DateTime.UtcNow;
                        taskItem.ErrorMessage = ex.Message;
                        taskItem.Exception = ex;
                        
                        OnTaskFailed?.Invoke(taskItem);
                        
                        _logger?.LogError(ex, "Task failed: {TaskName} ({TaskId})", taskItem.Name, taskItem.Id);
                    }
                    finally
                    {
                        // Move from running to completed
                        _runningTasks.TryRemove(taskItem.Id, out _);
                        _completedTasks.TryAdd(taskItem.Id, taskItem);
                        
                        // Clean up
                        taskItem.CancellationTokenSource?.Dispose();
                    }
                });
                
                _logger?.LogDebug("Started task: {TaskName} ({TaskId})", taskItem.Name, taskItem.Id);
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error starting task: {TaskName} ({TaskId})", taskItem.Name, taskItem.Id);
                
                taskItem.Status = BackgroundTaskStatus.Failed;
                taskItem.CompletedAt = DateTime.UtcNow;
                taskItem.ErrorMessage = ex.Message;
                taskItem.Exception = ex;
                
                _completedTasks.TryAdd(taskItem.Id, taskItem);
            }
        }

        #endregion

        #region IDisposable

        public void Dispose()
        {
            if (!_disposed)
            {
                _disposed = true;

                try
                {
                    _processingTimer?.Dispose();
                    _processingLock?.Dispose();

                    // Cancel all running tasks
                    foreach (var task in _runningTasks.Values)
                    {
                        task.CancellationTokenSource?.Cancel();
                    }

                    // Cancel all queued tasks
                    foreach (var queue in _taskQueues.Values)
                    {
                        while (queue.TryDequeue(out var task))
                        {
                            task.CancellationTokenSource?.Cancel();
                        }
                    }

                    _logger?.LogInformation("Background task queue service disposed");
                }
                catch (Exception ex)
                {
                    _logger?.LogError(ex, "Error disposing background task queue service");
                }
            }
        }

        #endregion
    }

    #region Support Classes

    /// <summary>
    /// Background task item
    /// </summary>
    public class BackgroundTaskItem
    {
        public string Id { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public BackgroundTaskPriority Priority { get; set; }
        public BackgroundTaskStatus Status { get; set; }
        public DateTime QueuedAt { get; set; }
        public DateTime? StartedAt { get; set; }
        public DateTime? CompletedAt { get; set; }
        public TaskProgress Progress { get; set; }
        public string ErrorMessage { get; set; }
        public Exception Exception { get; set; }
        public object Metadata { get; set; }
        public Func<CancellationToken, IProgress<TaskProgress>, Task> TaskFunction { get; set; }
        public CancellationTokenSource CancellationTokenSource { get; set; }

        public TimeSpan? Duration => CompletedAt.HasValue && StartedAt.HasValue ? CompletedAt.Value - StartedAt.Value : null;
        public TimeSpan QueueTime => StartedAt.HasValue ? StartedAt.Value - QueuedAt : DateTime.UtcNow - QueuedAt;
    }

    /// <summary>
    /// Task progress information
    /// </summary>
    public class TaskProgress
    {
        public int PercentageComplete { get; set; }
        public string CurrentOperation { get; set; }
        public string StatusMessage { get; set; }
        public long? ItemsProcessed { get; set; }
        public long? TotalItems { get; set; }
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;
        public Dictionary<string, object> AdditionalData { get; set; } = new Dictionary<string, object>();
    }

    /// <summary>
    /// Background task priorities
    /// </summary>
    public enum BackgroundTaskPriority
    {
        Low = 0,
        Normal = 1,
        High = 2
    }

    /// <summary>
    /// Background task status enumeration
    /// </summary>
    public enum BackgroundTaskStatus
    {
        Queued,
        Running,
        Completed,
        Failed,
        Cancelled
    }

    /// <summary>
    /// Background task queue configuration
    /// </summary>
    public class BackgroundTaskConfiguration
    {
        public int MaxConcurrentTasks { get; set; } = Environment.ProcessorCount;
        public bool IsPaused { get; set; } = false;
        public TimeSpan TaskTimeout { get; set; } = TimeSpan.FromMinutes(30);
        public int MaxQueueSize { get; set; } = 1000;
        public TimeSpan CompletedTaskRetention { get; set; } = TimeSpan.FromHours(24);
        public bool EnableTaskMetrics { get; set; } = true;
    }

    /// <summary>
    /// Queue statistics
    /// </summary>
    public class BackgroundTaskQueueStats
    {
        public DateTime Timestamp { get; set; }
        public int QueuedTasks { get; set; }
        public int RunningTasks { get; set; }
        public int CompletedTasks { get; set; }
        public int MaxConcurrentTasks { get; set; }
        public bool IsProcessing { get; set; }
        public Dictionary<BackgroundTaskPriority, int> PriorityQueueStats { get; set; }
    }

    #endregion
}