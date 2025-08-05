using System;
using System.Windows.Input;
using Microsoft.Extensions.Logging;
using CommunityToolkit.Mvvm.Messaging;

namespace MandADiscoverySuite.ViewModels
{
    /// <summary>
    /// ViewModel for real-time status indicators
    /// </summary>
    public class StatusIndicatorViewModel : BaseViewModel
    {
        private string _statusText = "Ready";
        private string _statusIcon = "\uE73E"; // CheckMark
        private string _statusColor = "#FF059669"; // Green
        private string _statusBackgroundColor = "#1A059669"; // Light Green
        private string _statusBorderColor = "#FF059669";
        private string _statusTooltip = "System is ready";
        private double _progressValue = 0;
        private bool _showProgress = false;
        private bool _showPulse = false;
        private bool _showSpin = false;
        private bool _showBlink = false;
        private StatusType _currentStatus = StatusType.Ready;

        public StatusIndicatorViewModel(ILogger<StatusIndicatorViewModel> logger, IMessenger messenger) 
            : base(logger, messenger)
        {
            ClickCommand = new RelayCommand(OnStatusClick);
        }

        #region Properties

        public string StatusText
        {
            get => _statusText;
            set => SetProperty(ref _statusText, value);
        }

        public string StatusIcon
        {
            get => _statusIcon;
            set => SetProperty(ref _statusIcon, value);
        }

        public string StatusColor
        {
            get => _statusColor;
            set => SetProperty(ref _statusColor, value);
        }

        public string StatusBackgroundColor
        {
            get => _statusBackgroundColor;
            set => SetProperty(ref _statusBackgroundColor, value);
        }

        public string StatusBorderColor
        {
            get => _statusBorderColor;
            set => SetProperty(ref _statusBorderColor, value);
        }

        public string StatusTooltip
        {
            get => _statusTooltip;
            set => SetProperty(ref _statusTooltip, value);
        }

        public double ProgressValue
        {
            get => _progressValue;
            set => SetProperty(ref _progressValue, value);
        }

        public bool ShowProgress
        {
            get => _showProgress;
            set => SetProperty(ref _showProgress, value);
        }

        public bool ShowPulse
        {
            get => _showPulse;
            set => SetProperty(ref _showPulse, value);
        }

        public bool ShowSpin
        {
            get => _showSpin;
            set => SetProperty(ref _showSpin, value);
        }

        public bool ShowBlink
        {
            get => _showBlink;
            set => SetProperty(ref _showBlink, value);
        }

        public StatusType CurrentStatus
        {
            get => _currentStatus;
            private set => SetProperty(ref _currentStatus, value);
        }

        public ICommand ClickCommand { get; }

        #endregion

        #region Public Methods

        public void UpdateStatus(StatusType status, string text = null, double? progress = null, string tooltip = null)
        {
            CurrentStatus = status;
            StatusText = text ?? GetDefaultStatusText(status);
            StatusTooltip = tooltip ?? GetDefaultStatusTooltip(status);

            if (progress.HasValue)
            {
                ProgressValue = progress.Value;
                ShowProgress = true;
            }
            else
            {
                ShowProgress = false;
            }

            ApplyStatusStyle(status);
            
            Logger?.LogDebug("Status updated: {Status} - {Text}", status, StatusText);
        }

        public void UpdateProgress(double progress, string text = null)
        {
            ProgressValue = Math.Max(0, Math.Min(100, progress));
            if (!string.IsNullOrEmpty(text))
            {
                StatusText = text;
            }
            ShowProgress = true;
        }

        public void ClearProgress()
        {
            ShowProgress = false;
            ProgressValue = 0;
        }

        public void StartPulse()
        {
            ShowPulse = true;
        }

        public void StopPulse()
        {
            ShowPulse = false;
        }

        public void StartSpin()
        {
            ShowSpin = true;
        }

        public void StopSpin()
        {
            ShowSpin = false;
        }

        public void StartBlink()
        {
            ShowBlink = true;
        }

        public void StopBlink()
        {
            ShowBlink = false;
        }

        public void StopAllAnimations()
        {
            ShowPulse = false;
            ShowSpin = false;
            ShowBlink = false;
        }

        #endregion

        #region Private Methods

        private void ApplyStatusStyle(StatusType status)
        {
            // Stop all animations first
            StopAllAnimations();

            switch (status)
            {
                case StatusType.Ready:
                    StatusIcon = "\uE73E"; // CheckMark
                    StatusColor = "#FF059669"; // Green
                    StatusBackgroundColor = "#1A059669";
                    StatusBorderColor = "#FF059669";
                    break;

                case StatusType.Running:
                    StatusIcon = "\uE768"; // Play
                    StatusColor = "#FF4F46E5"; // Blue
                    StatusBackgroundColor = "#1A4F46E5";
                    StatusBorderColor = "#FF4F46E5";
                    StartPulse();
                    break;

                case StatusType.Processing:
                    StatusIcon = "\uE8B5"; // Settings
                    StatusColor = "#FF7C3AED"; // Purple
                    StatusBackgroundColor = "#1A7C3AED";
                    StatusBorderColor = "#FF7C3AED";
                    StartSpin();
                    break;

                case StatusType.Warning:
                    StatusIcon = "\uE730"; // Warning
                    StatusColor = "#FFEA580C"; // Orange
                    StatusBackgroundColor = "#1AEA580C";
                    StatusBorderColor = "#FFEA580C";
                    StartPulse();
                    break;

                case StatusType.Error:
                    StatusIcon = "\uE711"; // Error
                    StatusColor = "#FFDC2626"; // Red
                    StatusBackgroundColor = "#1ADC2626";
                    StatusBorderColor = "#FFDC2626";
                    StartBlink();
                    break;

                case StatusType.Critical:
                    StatusIcon = "\uE7BA"; // ErrorBadge
                    StatusColor = "#FFDC2626"; // Red
                    StatusBackgroundColor = "#1ADC2626";
                    StatusBorderColor = "#FFDC2626";
                    StartBlink();
                    break;

                case StatusType.Offline:
                    StatusIcon = "\uE894"; // Disconnect
                    StatusColor = "#FF6B7280"; // Gray
                    StatusBackgroundColor = "#1A6B7280";
                    StatusBorderColor = "#FF6B7280";
                    break;

                case StatusType.Connecting:
                    StatusIcon = "\uE774"; // Sync
                    StatusColor = "#FF4F46E5"; // Blue
                    StatusBackgroundColor = "#1A4F46E5";
                    StatusBorderColor = "#FF4F46E5";
                    StartSpin();
                    break;

                case StatusType.Syncing:
                    StatusIcon = "\uE895"; // SyncFolder
                    StatusColor = "#FF059669"; // Green
                    StatusBackgroundColor = "#1A059669";
                    StatusBorderColor = "#FF059669";
                    StartSpin();
                    break;

                case StatusType.Paused:
                    StatusIcon = "\uE769"; // Pause
                    StatusColor = "#FFEA580C"; // Orange
                    StatusBackgroundColor = "#1AEA580C";
                    StatusBorderColor = "#FFEA580C";
                    break;

                case StatusType.Completed:
                    StatusIcon = "\uE73E"; // CheckMark
                    StatusColor = "#FF10B981"; // Bright Green
                    StatusBackgroundColor = "#1A10B981";
                    StatusBorderColor = "#FF10B981";
                    break;

                case StatusType.Cancelled:
                    StatusIcon = "\uE711"; // Cancel
                    StatusColor = "#FF6B7280"; // Gray
                    StatusBackgroundColor = "#1A6B7280";
                    StatusBorderColor = "#FF6B7280";
                    break;

                default:
                    StatusIcon = "\uE946"; // Info
                    StatusColor = "#FF4F46E5"; // Blue
                    StatusBackgroundColor = "#1A4F46E5";
                    StatusBorderColor = "#FF4F46E5";
                    break;
            }
        }

        private string GetDefaultStatusText(StatusType status)
        {
            return status switch
            {
                StatusType.Ready => "Ready",
                StatusType.Running => "Running",
                StatusType.Processing => "Processing",
                StatusType.Warning => "Warning",
                StatusType.Error => "Error",
                StatusType.Critical => "Critical",
                StatusType.Offline => "Offline",
                StatusType.Connecting => "Connecting",
                StatusType.Syncing => "Syncing",
                StatusType.Paused => "Paused",
                StatusType.Completed => "Completed",
                StatusType.Cancelled => "Cancelled",
                _ => "Unknown"
            };
        }

        private string GetDefaultStatusTooltip(StatusType status)
        {
            return status switch
            {
                StatusType.Ready => "System is ready and operational",
                StatusType.Running => "Operation is currently running",
                StatusType.Processing => "Processing data, please wait",
                StatusType.Warning => "Warning condition detected",
                StatusType.Error => "An error has occurred",
                StatusType.Critical => "Critical issue requires immediate attention",
                StatusType.Offline => "System is offline or unreachable",
                StatusType.Connecting => "Attempting to establish connection",
                StatusType.Syncing => "Synchronizing data",
                StatusType.Paused => "Operation is paused",
                StatusType.Completed => "Operation completed successfully",
                StatusType.Cancelled => "Operation was cancelled",
                _ => "Status information not available"
            };
        }

        private void OnStatusClick()
        {
            // Send a message with the current status for handling by parent components
            SendMessage(new StatusClickedMessage(CurrentStatus, StatusText, StatusTooltip));
            Logger?.LogInformation("Status indicator clicked: {Status}", CurrentStatus);
        }

        #endregion
    }

    /// <summary>
    /// Enumeration of possible status types
    /// </summary>
    public enum StatusType
    {
        Ready,
        Running,
        Processing,
        Warning,
        Error,
        Critical,
        Offline,
        Connecting,
        Syncing,
        Paused,
        Completed,
        Cancelled
    }

    /// <summary>
    /// Message sent when a status indicator is clicked
    /// </summary>
    public class StatusClickedMessage
    {
        public StatusClickedMessage(StatusType status, string text, string tooltip)
        {
            Status = status;
            Text = text;
            Tooltip = tooltip;
            Timestamp = DateTime.Now;
        }

        public StatusType Status { get; }
        public string Text { get; }
        public string Tooltip { get; }
        public DateTime Timestamp { get; }
    }
}