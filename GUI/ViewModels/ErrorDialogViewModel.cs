using System;
using System.Windows.Input;

namespace MandADiscoverySuite.ViewModels
{
    public class ErrorDialogViewModel : BaseViewModel
    {
        private string _title = "Error";
        private string _timestamp;
        private string _errorMessage = "";
        private string _exceptionDetails = "";
        private bool _hasDetails;
        private bool _canRetry;
        private bool _detailsVisible;

        public string Title
        {
            get => _title;
            set => SetProperty(ref _title, value);
        }

        public string Timestamp
        {
            get => _timestamp;
            set => SetProperty(ref _timestamp, value);
        }

        public string ErrorMessage
        {
            get => _errorMessage;
            set => SetProperty(ref _errorMessage, value);
        }

        public string ExceptionDetails
        {
            get => _exceptionDetails;
            set => SetProperty(ref _exceptionDetails, value);
        }

        public bool HasDetails
        {
            get => _hasDetails;
            set => SetProperty(ref _hasDetails, value);
        }

        public bool CanRetry
        {
            get => _canRetry;
            set => SetProperty(ref _canRetry, value);
        }

        public bool DetailsVisible
        {
            get => _detailsVisible;
            set => SetProperty(ref _detailsVisible, value);
        }

        public string ToggleButtonText => DetailsVisible ? "▲ Hide Details" : "▼ Show Details";

        #region Commands

        public ICommand ToggleDetailsCommand { get; private set; }
        public ICommand CloseCommand { get; private set; }
        public ICommand RetryCommand { get; private set; }
        public ICommand IgnoreCommand { get; private set; }

        #endregion

        public event EventHandler<ErrorDialogResult> DialogClosed;

        public enum ErrorDialogResult
        {
            Close,
            Retry,
            Ignore
        }

        public ErrorDialogViewModel()
        {
            Timestamp = DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss");
            InitializeCommands();
        }

        private void InitializeCommands()
        {
            ToggleDetailsCommand = new RelayCommand(ToggleDetails);
            CloseCommand = new RelayCommand(() => DialogClosed?.Invoke(this, ErrorDialogResult.Close));
            RetryCommand = new RelayCommand(() => DialogClosed?.Invoke(this, ErrorDialogResult.Retry));
            IgnoreCommand = new RelayCommand(() => DialogClosed?.Invoke(this, ErrorDialogResult.Ignore));
        }

        public void SetError(string message, Exception ex, string operation = null)
        {
            ErrorMessage = message;

            if (!string.IsNullOrEmpty(operation))
            {
                Title = $"Error in {operation}";
            }

            if (ex != null)
            {
                ExceptionDetails = $"{ex.GetType().Name}: {ex.Message}";
                if (ex.StackTrace != null)
                {
                    ExceptionDetails += $"\n\nStack Trace:\n{ex.StackTrace}";
                }
                HasDetails = true;
            }
            else
            {
                HasDetails = false;
            }

            CanRetry = !string.IsNullOrEmpty(operation);
        }

        private void ToggleDetails()
        {
            DetailsVisible = !DetailsVisible;
            OnPropertyChanged(nameof(ToggleButtonText));
        }
    }
}