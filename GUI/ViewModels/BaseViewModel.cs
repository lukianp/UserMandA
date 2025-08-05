using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Linq;
using System.Runtime.CompilerServices;
using System.Threading;
using System.Threading.Tasks;
using System.Windows.Input;
using System.Windows.Threading;
using Microsoft.Extensions.Logging;
using CommunityToolkit.Mvvm.Messaging;

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
        private readonly DispatcherTimer _notificationTimer;
        
        // Modern MVVM infrastructure
        protected readonly ILogger Logger;
        protected readonly IMessenger Messenger;

        // Common state properties
        private bool _isLoading;
        private string _statusMessage = string.Empty;
        private bool _hasErrors;
        private string _errorMessage = string.Empty;

        public bool IsLoading
        {
            get => _isLoading;
            set => SetProperty(ref _isLoading, value);
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
        /// Initializes the BaseViewModel with modern MVVM infrastructure
        /// </summary>
        protected BaseViewModel(ILogger logger = null, IMessenger messenger = null)
        {
            Logger = logger;
            Messenger = messenger ?? WeakReferenceMessenger.Default;
            
            _notificationTimer = new DispatcherTimer(DispatcherPriority.Background)
            {
                Interval = TimeSpan.FromMilliseconds(10) // Batch notifications every 10ms
            };
            _notificationTimer.Tick += ProcessPendingNotifications;

            InitializeCommands();
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
            _notificationTimer.Stop();
            string[] notifications;

            lock (_notificationLock)
            {
                notifications = _pendingNotifications.ToArray();
                _pendingNotifications.Clear();
                _isNotificationScheduled = false;
            }

            foreach (var propertyName in notifications)
            {
                OnPropertyChanged(propertyName);
            }
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

                Logger?.LogInformation("Starting {OperationName}", operationName);
                await operation();
                Logger?.LogInformation("Completed {OperationName}", operationName);

                StatusMessage = $"{operationName} completed successfully";
            }
            catch (Exception ex)
            {
                HasErrors = true;
                ErrorMessage = ex.Message;
                StatusMessage = $"{operationName} failed: {ex.Message}";
                Logger?.LogError(ex, "Error in {OperationName}", operationName);
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

                Logger?.LogInformation("Starting {OperationName}", operationName);
                var result = await operation();
                Logger?.LogInformation("Completed {OperationName}", operationName);

                StatusMessage = $"{operationName} completed successfully";
                return result;
            }
            catch (Exception ex)
            {
                HasErrors = true;
                ErrorMessage = ex.Message;
                StatusMessage = $"{operationName} failed: {ex.Message}";
                Logger?.LogError(ex, "Error in {OperationName}", operationName);
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
                    _notificationTimer?.Stop();
                    if (_notificationTimer != null)
                    {
                        _notificationTimer.Tick -= ProcessPendingNotifications;
                    }
                    
                    // Unregister from messaging
                    Messenger?.UnregisterAll(this);
                    
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