using System;
using System.Collections.ObjectModel;
using System.Diagnostics;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using System.Windows.Input;
using CommunityToolkit.Mvvm.Input;
using Microsoft.Extensions.Logging;
using MandADiscoverySuite.Services;

namespace MandADiscoverySuite.ViewModels
{
    /// <summary>
    /// ViewModel for progress overlay functionality
    /// </summary>
    public partial class ProgressOverlayViewModel : BaseViewModel
    {
        private readonly NotificationService _notificationService;
        private readonly Stopwatch _stopwatch;
        private readonly Timer _updateTimer;
        private CancellationTokenSource _cancellationTokenSource;

        // Visibility
        private bool _isVisible;
        
        // Progress properties
        private string _title = "";
        private string _message = "";
        private bool _isIndeterminate = true;
        private double _progressValue;
        private double _progressMaximum = 100;
        private string _progressDetails = "";
        
        // Animation properties
        private bool _showSpinner = true;
        private bool _showDots;
        private bool _showPulse;
        
        // Control properties
        private bool _canCancel = true;
        private bool _canHide;
        private bool _showElapsedTime = true;
        
        // Sub tasks
        private ObservableCollection<ProgressSubTask> _subTasks;

        public ProgressOverlayViewModel() : base()
        {
            _notificationService = ServiceLocator.GetService<NotificationService>();
            _stopwatch = new Stopwatch();
            _subTasks = new ObservableCollection<ProgressSubTask>();
            
            // Timer to update elapsed time
            _updateTimer = new Timer(UpdateElapsedTime, null, Timeout.Infinite, Timeout.Infinite);
            
            InitializeCommands();
        }

        #region Properties

        public bool IsVisible
        {
            get => _isVisible;
            set
            {
                if (SetProperty(ref _isVisible, value))
                {
                    if (value)
                    {
                        _stopwatch.Start();
                        _updateTimer.Change(0, 1000); // Update every second
                    }
                    else
                    {
                        _stopwatch.Stop();
                        _updateTimer.Change(Timeout.Infinite, Timeout.Infinite);
                    }
                }
            }
        }

        public string Title
        {
            get => _title;
            set => SetProperty(ref _title, value);
        }

        public string Message
        {
            get => _message;
            set => SetProperty(ref _message, value);
        }

        public bool IsIndeterminate
        {
            get => _isIndeterminate;
            set
            {
                if (SetProperty(ref _isIndeterminate, value))
                {
                    OnPropertyChanged(nameof(IsDeterminate));
                }
            }
        }

        public bool IsDeterminate => !IsIndeterminate;

        public double ProgressValue
        {
            get => _progressValue;
            set
            {
                if (SetProperty(ref _progressValue, value))
                {
                    OnPropertyChanged(nameof(ProgressPercentage));
                }
            }
        }

        public double ProgressMaximum
        {
            get => _progressMaximum;
            set
            {
                if (SetProperty(ref _progressMaximum, value))
                {
                    OnPropertyChanged(nameof(ProgressPercentage));
                }
            }
        }

        public double ProgressPercentage => ProgressMaximum > 0 ? ProgressValue / ProgressMaximum : 0;

        public string ProgressDetails
        {
            get => _progressDetails;
            set => SetProperty(ref _progressDetails, value);
        }

        public bool ShowSpinner
        {
            get => _showSpinner;
            set => SetProperty(ref _showSpinner, value);
        }

        public bool ShowDots
        {
            get => _showDots;
            set => SetProperty(ref _showDots, value);
        }

        public bool ShowPulse
        {
            get => _showPulse;
            set => SetProperty(ref _showPulse, value);
        }

        public bool CanCancel
        {
            get => _canCancel;
            set => SetProperty(ref _canCancel, value);
        }

        public bool CanHide
        {
            get => _canHide;
            set => SetProperty(ref _canHide, value);
        }

        public bool ShowElapsedTime
        {
            get => _showElapsedTime;
            set => SetProperty(ref _showElapsedTime, value);
        }

        public ObservableCollection<ProgressSubTask> SubTasks
        {
            get => _subTasks;
            set => SetProperty(ref _subTasks, value);
        }

        // Computed properties
        public bool HasActions => CanCancel || CanHide;
        public bool HasSubTasks => SubTasks?.Any() == true;
        public string ElapsedTime => _stopwatch.Elapsed.ToString(@"mm\:ss");

        #endregion

        #region Commands

        public ICommand CancelCommand { get; private set; }
        public ICommand HideCommand { get; private set; }

        #endregion

        #region Private Methods

        protected override void InitializeCommands()
        {
            CancelCommand = new RelayCommand(Cancel);
            HideCommand = new RelayCommand(Hide);
        }

        private void UpdateElapsedTime(object state)
        {
            App.Current?.Dispatcher.Invoke(() =>
            {
                OnPropertyChanged(nameof(ElapsedTime));
            });
        }

        private void Cancel()
        {
            try
            {
                _cancellationTokenSource?.Cancel();
                
                _notificationService?.AddWarning(
                    "Operation Cancelled", 
                    "The current operation was cancelled by user");
                
                Hide();
                
                Logger?.LogInformation("User cancelled progress operation: {Title}", Title);
            }
            catch (Exception ex)
            {
                Logger?.LogError(ex, "Error cancelling progress operation");
            }
        }

        private void Hide()
        {
            try
            {
                IsVisible = false;
                Logger?.LogDebug("Progress overlay hidden");
            }
            catch (Exception ex)
            {
                Logger?.LogError(ex, "Error hiding progress overlay");
            }
        }

        #endregion

        #region Public Methods

        /// <summary>
        /// Shows the progress overlay with indeterminate progress
        /// </summary>
        public void ShowIndeterminate(string title, string message = "", 
            ProgressAnimationType animationType = ProgressAnimationType.Spinner)
        {
            try
            {
                Title = title;
                Message = message;
                IsIndeterminate = true;
                
                // Set animation type
                ShowSpinner = animationType == ProgressAnimationType.Spinner;
                ShowDots = animationType == ProgressAnimationType.Dots;
                ShowPulse = animationType == ProgressAnimationType.Pulse;
                
                IsVisible = true;
                
                Logger?.LogDebug("Showing indeterminate progress: {Title}", title);
            }
            catch (Exception ex)
            {
                Logger?.LogError(ex, "Error showing indeterminate progress");
            }
        }

        /// <summary>
        /// Shows the progress overlay with determinate progress
        /// </summary>
        public void ShowDeterminate(string title, string message = "", 
            double maximum = 100, double current = 0)
        {
            try
            {
                Title = title;
                Message = message;
                IsIndeterminate = false;
                ProgressMaximum = maximum;
                ProgressValue = current;
                
                IsVisible = true;
                
                Logger?.LogDebug("Showing determinate progress: {Title} ({Current}/{Maximum})", 
                    title, current, maximum);
            }
            catch (Exception ex)
            {
                Logger?.LogError(ex, "Error showing determinate progress");
            }
        }

        /// <summary>
        /// Updates the progress value
        /// </summary>
        public void UpdateProgress(double value, string details = "")
        {
            try
            {
                ProgressValue = value;
                if (!string.IsNullOrEmpty(details))
                {
                    ProgressDetails = details;
                }
                
                Logger?.LogDebug("Updated progress: {Value}/{Maximum} - {Details}", value, ProgressMaximum, details);
            }
            catch (Exception ex)
            {
                Logger?.LogError(ex, "Error updating progress");
            }
        }

        /// <summary>
        /// Updates the progress message
        /// </summary>
        public void UpdateMessage(string message)
        {
            try
            {
                Message = message;
                Logger?.LogDebug("Updated progress message: {Message}", message);
            }
            catch (Exception ex)
            {
                Logger?.LogError(ex, "Error updating progress message");
            }
        }

        /// <summary>
        /// Adds a sub-task to the progress display
        /// </summary>
        public void AddSubTask(string name, ProgressSubTaskStatus status = ProgressSubTaskStatus.Pending)
        {
            try
            {
                var subTask = new ProgressSubTask
                {
                    Name = name,
                    Status = status
                };
                
                SubTasks.Add(subTask);
                OnPropertyChanged(nameof(HasSubTasks));
                
                Logger?.LogDebug("Added sub-task: {Name} ({Status})", name, status);
            }
            catch (Exception ex)
            {
                Logger?.LogError(ex, "Error adding sub-task: {Name}", name);
            }
        }

        /// <summary>
        /// Updates a sub-task status
        /// </summary>
        public void UpdateSubTask(string name, ProgressSubTaskStatus status)
        {
            try
            {
                var subTask = SubTasks.FirstOrDefault(st => st.Name == name);
                if (subTask != null)
                {
                    subTask.Status = status;
                    Logger?.LogDebug("Updated sub-task: {Name} -> {Status}", name, status);
                }
            }
            catch (Exception ex)
            {
                Logger?.LogError(ex, "Error updating sub-task: {Name}", name);
            }
        }

        /// <summary>
        /// Clears all sub-tasks
        /// </summary>
        public void ClearSubTasks()
        {
            try
            {
                SubTasks.Clear();
                OnPropertyChanged(nameof(HasSubTasks));
                Logger?.LogDebug("Cleared all sub-tasks");
            }
            catch (Exception ex)
            {
                Logger?.LogError(ex, "Error clearing sub-tasks");
            }
        }

        /// <summary>
        /// Sets the cancellation token source for cancellation support
        /// </summary>
        public void SetCancellationTokenSource(CancellationTokenSource tokenSource)
        {
            _cancellationTokenSource = tokenSource;
        }

        /// <summary>
        /// Completes the progress and hides the overlay
        /// </summary>
        public void Complete(string completionMessage = "")
        {
            try
            {
                if (!string.IsNullOrEmpty(completionMessage))
                {
                    _notificationService?.AddSuccess(
                        "Operation Completed", 
                        completionMessage);
                }
                
                IsVisible = false;
                
                Logger?.LogInformation("Progress completed: {Title} in {Elapsed}", Title, _stopwatch.Elapsed);
            }
            catch (Exception ex)
            {
                Logger?.LogError(ex, "Error completing progress");
            }
        }

        /// <summary>
        /// Shows an error and hides the overlay
        /// </summary>
        public void Error(string errorMessage)
        {
            try
            {
                _notificationService?.AddError(
                    "Operation Failed", 
                    errorMessage);
                
                IsVisible = false;
                
                Logger?.LogError("Progress failed: {Title} - {Error}", Title, errorMessage);
            }
            catch (Exception ex)
            {
                Logger?.LogError(ex, "Error handling progress error");
            }
        }

        /// <summary>
        /// Creates a task-based progress operation
        /// </summary>
        public async Task<T> ExecuteWithProgressAsync<T>(
            string title, 
            Func<IProgress<ProgressInfo>, CancellationToken, Task<T>> operation,
            string message = "")
        {
            try
            {
                _cancellationTokenSource = new CancellationTokenSource();
                var progress = new Progress<ProgressInfo>(info =>
                {
                    if (info.IsIndeterminate)
                    {
                        ShowIndeterminate(title, info.Message ?? message);
                    }
                    else
                    {
                        if (!IsVisible || IsIndeterminate)
                        {
                            ShowDeterminate(title, info.Message ?? message, info.Maximum, info.Value);
                        }
                        else
                        {
                            UpdateProgress(info.Value, info.Details);
                            if (!string.IsNullOrEmpty(info.Message))
                                UpdateMessage(info.Message);
                        }
                    }
                });

                ShowIndeterminate(title, message);
                
                var result = await operation(progress, _cancellationTokenSource.Token);
                
                Complete();
                return result;
            }
            catch (OperationCanceledException)
            {
                _notificationService?.AddWarning("Cancelled", "Operation was cancelled");
                IsVisible = false;
                throw;
            }
            catch (Exception ex)
            {
                Error($"Operation failed: {ex.Message}");
                throw;
            }
        }

        #endregion

        #region IDisposable

        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                _updateTimer?.Dispose();
                _cancellationTokenSource?.Dispose();
                _stopwatch?.Stop();
            }
            base.Dispose(disposing);
        }

        #endregion
    }

    /// <summary>
    /// Progress information for task-based operations
    /// </summary>
    public class ProgressInfo
    {
        public bool IsIndeterminate { get; set; } = true;
        public double Value { get; set; }
        public double Maximum { get; set; } = 100;
        public string Message { get; set; }
        public string Details { get; set; }
    }

    /// <summary>
    /// Sub-task for progress operations
    /// </summary>
    public class ProgressSubTask : BaseViewModel
    {
        private ProgressSubTaskStatus _status;

        public string Name { get; set; }
        
        public ProgressSubTaskStatus Status
        {
            get => _status;
            set
            {
                if (SetProperty(ref _status, value))
                {
                    OnPropertyChanged(nameof(StatusIcon));
                }
            }
        }

        public string StatusIcon => Status switch
        {
            ProgressSubTaskStatus.Pending => "⏳",
            ProgressSubTaskStatus.Running => "🔄",
            ProgressSubTaskStatus.Completed => "✅",
            ProgressSubTaskStatus.Failed => "❌",
            ProgressSubTaskStatus.Skipped => "⏭️",
            _ => "❓"
        };
    }

    /// <summary>
    /// Progress animation types
    /// </summary>
    public enum ProgressAnimationType
    {
        Spinner,
        Dots,
        Pulse
    }

    /// <summary>
    /// Sub-task status enumeration
    /// </summary>
    public enum ProgressSubTaskStatus
    {
        Pending,
        Running,
        Completed,
        Failed,
        Skipped
    }
}