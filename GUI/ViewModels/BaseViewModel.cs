using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.ComponentModel;
using System.Linq;
using System.Runtime.CompilerServices;
using System.Threading;
using System.Threading.Tasks;
using System.Windows.Input;
using System.Windows.Threading;
using Microsoft.Extensions.Logging;
using CommunityToolkit.Mvvm.Messaging;
using MandADiscoverySuite.Services;

namespace MandADiscoverySuite.ViewModels
{
    /// <summary>
    /// Base view model class that implements INotifyPropertyChanged and IDisposable with performance optimizations
    /// </summary>
    public abstract class BaseViewModel : INotifyPropertyChanged, IDisposable
    {
        public event PropertyChangedEventHandler PropertyChanged;
        
        private readonly HashSet<string> _pendingNotifications = new HashSet<string>();
        private readonly object _notificationLock = new object();
        private bool _isNotificationScheduled;
        private int _notificationProcessCount = 0;
        private const int MAX_NOTIFICATION_PROCESS_COUNT = 100; // Circuit breaker
        private DispatcherTimer _notificationTimer;
        
        // Modern MVVM infrastructure
        protected readonly ILogger _log;
        
        // Provide Logger property for backwards compatibility
        protected ILogger Logger => _log;
        protected readonly IMessenger Messenger;
        protected ProgressTrackingService ProgressTracker;
        
        // Centralized structured logging
        protected StructuredLoggingService StructuredLogger;
        protected string LogSourceName => GetType().Name;

        // Common state properties
        private bool _isLoading;
        private string _loadingMessage = "Loading...";
        private int _loadingProgress;
        private string _statusMessage = string.Empty;
        private bool _hasErrors;
        private string _errorMessage = string.Empty;
        private string _tabTitle = "Untitled";
        private bool _canClose = true;
        
        // Header warnings collection for CSV validation
        public ObservableCollection<string> HeaderWarnings { get; } = new ObservableCollection<string>();

        public bool IsLoading
        {
            get => _isLoading;
            set => SetProperty(ref _isLoading, value);
        }

        public string LoadingMessage
        {
            get => _loadingMessage;
            set => SetProperty(ref _loadingMessage, value);
        }

        /// <summary>
        /// Loading progress percentage (0-100)
        /// </summary>
        public int LoadingProgress
        {
            get => _loadingProgress;
            set => SetProperty(ref _loadingProgress, value);
        }

        public string StatusMessage
        {
            get => _statusMessage;
            set => SetProperty(ref _statusMessage, value);
        }

        public bool HasErrors
        {
            get => _hasErrors;
            set => SetProperty(ref _hasErrors, value);
        }

        public string ErrorMessage
        {
            get => _errorMessage;
            set => SetProperty(ref _errorMessage, value);
        }

        /// <summary>
        /// Alias for ErrorMessage to match unified pattern requirements
        /// </summary>
        public string LastError
        {
            get => _errorMessage;
            set => SetProperty(ref _errorMessage, value);
        }

        /// <summary>
        /// Whether the view has data to display - can be overridden by derived classes
        /// </summary>
        private bool _hasData;
        public virtual bool HasData
        {
            get => _hasData;
            protected set => SetProperty(ref _hasData, value);
        }

        /// <summary>
        /// Whether the view has no data to display - derived classes can override for custom logic
        /// </summary>
        public virtual bool HasNoData => !IsLoading && !HasData;

        /// <summary>
        /// Tab title for the document interface
        /// </summary>
        public virtual string TabTitle
        {
            get => _tabTitle;
            set => SetProperty(ref _tabTitle, value);
        }

        /// <summary>
        /// Whether this tab can be closed
        /// </summary>
        public virtual bool CanClose
        {
            get => _canClose;
            set => SetProperty(ref _canClose, value);
        }

        /// <summary>
        /// Initializes the BaseViewModel with unified loading pipeline
        /// </summary>
        protected BaseViewModel(ILogger log)
        {
            _log = log ?? throw new ArgumentNullException(nameof(log));
            Messenger = WeakReferenceMessenger.Default;
            
            Initialize();
        }
        
        /// <summary>
        /// Legacy constructor for backwards compatibility
        /// </summary>
        protected BaseViewModel(ILogger logger = null, IMessenger messenger = null)
        {
            _log = logger;
            Messenger = messenger ?? WeakReferenceMessenger.Default;
            
            Initialize();
        }
        
        private void Initialize()
        {
            // Initialize structured logging
            StructuredLogger = StructuredLoggingService.Instance;
            
            // Removed obsolete SimpleServiceLocator usage
            // ProgressTracker will remain null - no longer using obsolete service locator
            
            // Initialize timer with memory-safe settings and circuit breaker
            _notificationTimer = new DispatcherTimer(DispatcherPriority.Background)
            {
                Interval = TimeSpan.FromMilliseconds(50) // Increased from 10ms to reduce CPU load
            };
            _notificationTimer.Tick += ProcessPendingNotifications;

            InitializeCommands();
            
            // Log initialization with structured format
            StructuredLogger?.LogDebug(LogSourceName, new { component = "viewmodel", action = "initialized" }, 
                "BaseViewModel initialized with structured logging and memory safeguards");
        }

        /// <summary>
        /// Initializes common commands - override in derived classes to add specific commands
        /// </summary>
        protected virtual void InitializeCommands()
        {
            ClearErrorsCommand = new RelayCommand(ClearErrors);
        }

        public ICommand ClearErrorsCommand { get; private set; }

        /// <summary>
        /// Raises the PropertyChanged event immediately
        /// </summary>
        /// <param name="propertyName">Name of the property that changed</param>
        protected virtual void OnPropertyChanged([CallerMemberName] string propertyName = null)
        {
            PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(propertyName));
        }

        /// <summary>
        /// Queues a property change notification for batched processing (better performance for multiple changes)
        /// </summary>
        /// <param name="propertyName">Name of the property that changed</param>
        protected virtual void OnPropertyChangedBatched([CallerMemberName] string propertyName = null)
        {
            if (string.IsNullOrEmpty(propertyName)) return;

            lock (_notificationLock)
            {
                _pendingNotifications.Add(propertyName);
                if (!_isNotificationScheduled)
                {
                    _isNotificationScheduled = true;
                    _notificationTimer.Start();
                }
            }
        }

        /// <summary>
        /// Sets the property value and raises PropertyChanged if the value has changed
        /// </summary>
        /// <typeparam name="T">Type of the property</typeparam>
        /// <param name="field">Reference to the backing field</param>
        /// <param name="value">New value to set</param>
        /// <param name="propertyName">Name of the property</param>
        /// <returns>True if the value was changed, false otherwise</returns>
        protected bool SetProperty<T>(ref T field, T value, [CallerMemberName] string propertyName = null)
        {
            if (EqualityComparer<T>.Default.Equals(field, value))
                return false;

            field = value;
            OnPropertyChanged(propertyName);
            return true;
        }

        /// <summary>
        /// Sets the property value and raises PropertyChanged if the value has changed
        /// Also executes additional action when property changes
        /// </summary>
        /// <typeparam name="T">Type of the property</typeparam>
        /// <param name="field">Reference to the backing field</param>
        /// <param name="value">New value to set</param>
        /// <param name="onChanged">Action to execute when property changes</param>
        /// <param name="propertyName">Name of the property</param>
        /// <returns>True if the value was changed, false otherwise</returns>
        protected bool SetProperty<T>(ref T field, T value, Action onChanged, [CallerMemberName] string propertyName = null)
        {
            if (SetProperty(ref field, value, propertyName))
            {
                onChanged?.Invoke();
                return true;
            }
            return false;
        }

        /// <summary>
        /// Raises PropertyChanged for multiple properties immediately
        /// </summary>
        /// <param name="propertyNames">Names of properties that changed</param>
        protected void OnPropertiesChanged(params string[] propertyNames)
        {
            foreach (var propertyName in propertyNames)
            {
                OnPropertyChanged(propertyName);
            }
        }

        /// <summary>
        /// Queues multiple property change notifications for batched processing
        /// </summary>
        /// <param name="propertyNames">Names of properties that changed</param>
        protected void OnPropertiesChangedBatched(params string[] propertyNames)
        {
            foreach (var propertyName in propertyNames)
            {
                OnPropertyChangedBatched(propertyName);
            }
        }

        /// <summary>
        /// Forces immediate processing of all pending notifications
        /// </summary>
        protected void FlushPendingNotifications()
        {
            if (_isNotificationScheduled)
            {
                _notificationTimer.Stop();
                ProcessPendingNotifications(null, null);
            }
        }

        private void ProcessPendingNotifications(object sender, EventArgs e)
        {
            // Circuit breaker to prevent infinite loops
            _notificationProcessCount++;
            if (_notificationProcessCount > MAX_NOTIFICATION_PROCESS_COUNT)
            {
                _log?.LogWarning($"[{GetType().Name}] Circuit breaker triggered - too many notification processes");
                _notificationTimer?.Stop();
                lock (_notificationLock)
                {
                    _pendingNotifications.Clear();
                    _isNotificationScheduled = false;
                }
                _notificationProcessCount = 0;
                return;
            }

            _notificationTimer?.Stop();
            string[] notifications;

            lock (_notificationLock)
            {
                notifications = _pendingNotifications.ToArray();
                _pendingNotifications.Clear();
                _isNotificationScheduled = false;
            }

            // Limit the number of notifications processed at once
            var limitedNotifications = notifications.Take(20).ToArray();
            
            foreach (var propertyName in limitedNotifications)
            {
                if (_disposed) break; // Safety check
                try
                {
                    OnPropertyChanged(propertyName);
                }
                catch (Exception ex)
                {
                    _log?.LogError(ex, $"Error processing property change notification for {propertyName}");
                    break; // Stop processing on error
                }
            }

            // Reset counter after successful processing
            _notificationProcessCount = Math.Max(0, _notificationProcessCount - 10);
        }

        #region Modern MVVM Operations

        /// <summary>
        /// Executes an async operation with error handling and loading state management
        /// </summary>
        protected async Task ExecuteAsync(Func<Task> operation, string operationName = "Operation")
        {
            try
            {
                IsLoading = true;
                HasErrors = false;
                ErrorMessage = string.Empty;
                StatusMessage = $"Executing {operationName}...";

                _log?.LogInformation("Starting {OperationName}", operationName);
                await operation();
                _log?.LogInformation("Completed {OperationName}", operationName);

                StatusMessage = $"{operationName} completed successfully";
            }
            catch (Exception ex)
            {
                HasErrors = true;
                ErrorMessage = ex.Message;
                StatusMessage = $"{operationName} failed: {ex.Message}";
                _log?.LogError(ex, "Error in {OperationName}", operationName);
            }
            finally
            {
                IsLoading = false;
            }
        }

        /// <summary>
        /// Executes an async operation with result and error handling
        /// </summary>
        protected async Task<T> ExecuteAsync<T>(Func<Task<T>> operation, string operationName = "Operation", T defaultValue = default)
        {
            try
            {
                IsLoading = true;
                HasErrors = false;
                ErrorMessage = string.Empty;
                StatusMessage = $"Executing {operationName}...";

                _log?.LogInformation("Starting {OperationName}", operationName);
                var result = await operation();
                _log?.LogInformation("Completed {OperationName}", operationName);

                StatusMessage = $"{operationName} completed successfully";
                return result;
            }
            catch (Exception ex)
            {
                HasErrors = true;
                ErrorMessage = ex.Message;
                StatusMessage = $"{operationName} failed: {ex.Message}";
                _log?.LogError(ex, "Error in {OperationName}", operationName);
                return defaultValue;
            }
            finally
            {
                IsLoading = false;
            }
        }

        /// <summary>
        /// Clears any error state
        /// </summary>
        public virtual void ClearErrors()
        {
            HasErrors = false;
            ErrorMessage = string.Empty;
            StatusMessage = string.Empty;
        }

        /// <summary>
        /// Sends a message via the messaging bus
        /// </summary>
        protected void SendMessage<T>(T message) where T : class
        {
            Messenger?.Send(message);
        }

        /// <summary>
        /// Registers for a message type
        /// </summary>
        protected void RegisterForMessage<T>(MessageHandler<object, T> handler) where T : class
        {
            Messenger?.Register<T>(this, handler);
        }

        #endregion

        #region Progress Tracking Helpers

        /// <summary>
        /// Starts a progress operation
        /// </summary>
        protected ProgressToken StartProgress(string operationId, string description, bool isIndeterminate = false)
        {
            var token = ProgressTracker?.StartOperation(operationId, description, isIndeterminate);
            if (token != null)
            {
                IsLoading = true;
                LoadingMessage = description;
                LoadingProgress = 0;
            }
            return token;
        }

        /// <summary>
        /// Updates progress for the current loading operation
        /// </summary>
        protected void UpdateProgress(int progress, string status = null)
        {
            LoadingProgress = progress;
            if (!string.IsNullOrEmpty(status))
            {
                LoadingMessage = status;
            }
        }

        /// <summary>
        /// Executes an operation with automatic progress tracking
        /// </summary>
        protected async Task<T> ExecuteWithProgressAsync<T>(
            string operationId,
            string description,
            Func<ProgressToken, Task<T>> operation,
            T defaultValue = default(T))
        {
            using var progressToken = StartProgress(operationId, description);
            
            try
            {
                var result = await operation(progressToken);
                progressToken?.Complete(true, "Operation completed successfully");
                StatusMessage = $"{description} completed successfully";
                return result;
            }
            catch (Exception ex)
            {
                progressToken?.Complete(false, ex.Message);
                HasErrors = true;
                ErrorMessage = ex.Message;
                StatusMessage = $"{description} failed: {ex.Message}";
                _log?.LogError(ex, "Error in {OperationDescription}", description);
                return defaultValue;
            }
            finally
            {
                IsLoading = false;
                LoadingProgress = 0;
            }
        }

        #endregion

        #region Unified Loading Pipeline

        /// <summary>
        /// Virtual LoadAsync method that derived ViewModels must override
        /// Implements the unified loading pipeline pattern exactly as specified
        /// </summary>
        public virtual async Task LoadAsync()
        {
            IsLoading = true; 
            HasData = false; 
            LastError = null; 
            HeaderWarnings.Clear();

            try 
            {
                _log?.LogDebug($"[{GetType().Name}] Load start");
                StructuredLogger?.LogDebug(LogSourceName, new { action = "load_start", component = "viewmodel" }, "LoadAsync started");
                
                // Default implementation - derived classes should override this
                await Task.Delay(100); // Simulate loading
                
                _log?.LogInformation($"[{GetType().Name}] Load ok rows=0");
                StructuredLogger?.LogInfo(LogSourceName, new { action = "load_complete", component = "viewmodel", rows = 0 }, "LoadAsync completed successfully");
            }
            catch (Exception ex) 
            {
                LastError = $"Unexpected error: {ex.Message}";
                _log?.LogError($"[{GetType().Name}] Load fail ex={ex}");
                StructuredLogger?.LogError(LogSourceName, ex, new { action = "load_fail", component = "viewmodel" }, "LoadAsync failed");
            }
            finally 
            { 
                IsLoading = false; 
            }
        }

        /// <summary>
        /// Helper method to raise all common property change notifications
        /// </summary>
        protected void RaiseAllLoadingProperties()
        {
            OnPropertyChanged(nameof(IsLoading));
            OnPropertyChanged(nameof(HasData));
            OnPropertyChanged(nameof(LastError));
            OnPropertyChanged(nameof(HasErrors));
        }

        #endregion

        #region IDisposable

        private bool _disposed = false;

        /// <summary>
        /// Performs application-defined tasks associated with freeing, releasing, or resetting unmanaged resources
        /// </summary>
        public void Dispose()
        {
            Dispose(true);
            GC.SuppressFinalize(this);
        }

        /// <summary>
        /// Releases the unmanaged resources used by the BaseViewModel and optionally releases the managed resources
        /// </summary>
        /// <param name="disposing">true to release both managed and unmanaged resources; false to release only unmanaged resources</param>
        protected virtual void Dispose(bool disposing)
        {
            if (!_disposed)
            {
                if (disposing)
                {
                    // Dispose managed resources here
                    if (_notificationTimer != null)
                    {
                        _notificationTimer.Stop();
                        _notificationTimer.Tick -= ProcessPendingNotifications;
                        _notificationTimer = null;
                    }
                    
                    // Clear pending notifications
                    lock (_notificationLock)
                    {
                        _pendingNotifications.Clear();
                        _isNotificationScheduled = false;
                    }
                    
                    // Unregister from messaging
                    Messenger?.UnregisterAll(this);
                    
                    // Clear collections to prevent memory leaks
                    HeaderWarnings?.Clear();
                    
                    // Derived classes should override this method to dispose their resources
                    OnDisposing();
                }
                
                _disposed = true;
            }
        }

        /// <summary>
        /// Called when the view model is being disposed. Override in derived classes to dispose resources
        /// </summary>
        protected virtual void OnDisposing()
        {
            // Base implementation does nothing
            // Derived classes should override this to dispose their specific resources
        }

        /// <summary>
        /// Throws an ObjectDisposedException if this instance has been disposed
        /// </summary>
        protected void ThrowIfDisposed()
        {
            if (_disposed)
                throw new ObjectDisposedException(GetType().Name);
        }

        #endregion
    }

    /// <summary>
    /// Generic relay command implementation
    /// </summary>
    public class RelayCommand : ICommand
    {
        private readonly Action _execute;
        private readonly Func<bool> _canExecute;

        public RelayCommand(Action execute, Func<bool> canExecute = null)
        {
            _execute = execute ?? throw new ArgumentNullException(nameof(execute));
            _canExecute = canExecute;
        }

        public event EventHandler CanExecuteChanged
        {
            add { CommandManager.RequerySuggested += value; }
            remove { CommandManager.RequerySuggested -= value; }
        }

        public bool CanExecute(object parameter) => _canExecute == null || _canExecute();

        public void Execute(object parameter) => _execute();

        public void RaiseCanExecuteChanged() => CommandManager.InvalidateRequerySuggested();
    }

    /// <summary>
    /// Generic relay command implementation with parameter
    /// </summary>
    /// <typeparam name="T">Type of the command parameter</typeparam>
    public class RelayCommand<T> : ICommand
    {
        private readonly Action<T> _execute;
        private readonly Func<T, bool> _canExecute;

        public RelayCommand(Action<T> execute, Func<T, bool> canExecute = null)
        {
            _execute = execute ?? throw new ArgumentNullException(nameof(execute));
            _canExecute = canExecute;
        }

        public event EventHandler CanExecuteChanged
        {
            add { CommandManager.RequerySuggested += value; }
            remove { CommandManager.RequerySuggested -= value; }
        }

        public bool CanExecute(object parameter)
        {
            if (parameter == null && typeof(T).IsValueType)
                return false;

            return _canExecute == null || _canExecute((T)parameter);
        }

        public void Execute(object parameter) => _execute((T)parameter);

        public void RaiseCanExecuteChanged() => CommandManager.InvalidateRequerySuggested();
    }

    /// <summary>
    /// Async command implementation
    /// </summary>
    public class AsyncRelayCommand : ICommand
    {
        private readonly Func<System.Threading.Tasks.Task> _execute;
        private readonly Func<bool> _canExecute;
        private bool _isExecuting;

        public AsyncRelayCommand(Func<System.Threading.Tasks.Task> execute, Func<bool> canExecute = null)
        {
            _execute = execute ?? throw new ArgumentNullException(nameof(execute));
            _canExecute = canExecute;
        }

        public event EventHandler CanExecuteChanged
        {
            add { CommandManager.RequerySuggested += value; }
            remove { CommandManager.RequerySuggested -= value; }
        }

        public bool CanExecute(object parameter) => !_isExecuting && (_canExecute == null || _canExecute());

        public async void Execute(object parameter)
        {
            _isExecuting = true;
            RaiseCanExecuteChanged();

            try
            {
                await _execute();
            }
            finally
            {
                _isExecuting = false;
                RaiseCanExecuteChanged();
            }
        }

        public void RaiseCanExecuteChanged() => CommandManager.InvalidateRequerySuggested();
    }

    /// <summary>
    /// Async relay command with parameter support
    /// </summary>
    public class AsyncRelayCommand<T> : ICommand
    {
        private readonly Func<T, System.Threading.Tasks.Task> _execute;
        private readonly Func<T, bool> _canExecute;
        private bool _isExecuting;

        public AsyncRelayCommand(Func<T, System.Threading.Tasks.Task> execute, Func<T, bool> canExecute = null)
        {
            _execute = execute ?? throw new ArgumentNullException(nameof(execute));
            _canExecute = canExecute;
        }

        public event EventHandler CanExecuteChanged
        {
            add { CommandManager.RequerySuggested += value; }
            remove { CommandManager.RequerySuggested -= value; }
        }

        public bool CanExecute(object parameter) => !_isExecuting && (_canExecute == null || _canExecute((T)parameter));

        public async void Execute(object parameter)
        {
            _isExecuting = true;
            RaiseCanExecuteChanged();

            try
            {
                await _execute((T)parameter);
            }
            finally
            {
                _isExecuting = false;
                RaiseCanExecuteChanged();
            }
        }

        public void RaiseCanExecuteChanged() => CommandManager.InvalidateRequerySuggested();
    }

    /// <summary>
    /// Async drop command for drag-drop operations
    /// </summary>
    public class AsyncDropCommand : ICommand
    {
        private readonly Func<string[], System.Threading.Tasks.Task> _execute;
        private readonly Func<string[], bool> _canExecute;
        private bool _isExecuting;

        public AsyncDropCommand(Func<string[], System.Threading.Tasks.Task> execute, Func<string[], bool> canExecute = null)
        {
            _execute = execute ?? throw new ArgumentNullException(nameof(execute));
            _canExecute = canExecute;
        }

        public event EventHandler CanExecuteChanged
        {
            add { CommandManager.RequerySuggested += value; }
            remove { CommandManager.RequerySuggested -= value; }
        }

        public bool CanExecute(object parameter)
        {
            if (_isExecuting) return false;
            if (parameter is string[] files)
                return _canExecute == null || _canExecute(files);
            return false;
        }

        public async void Execute(object parameter)
        {
            if (parameter is string[] files)
            {
                _isExecuting = true;
                RaiseCanExecuteChanged();

                try
                {
                    await _execute(files);
                }
                finally
                {
                    _isExecuting = false;
                    RaiseCanExecuteChanged();
                }
            }
        }

        public void RaiseCanExecuteChanged() => CommandManager.InvalidateRequerySuggested();
    }
}