using System;
using System.Windows.Input;
using MandADiscoverySuite.Services;

namespace MandADiscoverySuite.ViewModels.Placeholders
{
    /// <summary>
    /// ViewModel for missing or unregistered views
    /// </summary>
    public class MissingViewModel : BaseViewModel
    {
        private string _key = "Unknown";
        private string _reason = "No reason specified";
        private DateTime _timestamp = DateTime.Now;

        /// <summary>
        /// The navigation key that was requested
        /// </summary>
        public string Key
        {
            get => _key;
            set => SetProperty(ref _key, value);
        }

        /// <summary>
        /// The reason why the view is missing
        /// </summary>
        public string Reason
        {
            get => _reason;
            set => SetProperty(ref _reason, value);
        }

        /// <summary>
        /// When this placeholder was created
        /// </summary>
        public DateTime Timestamp
        {
            get => _timestamp;
            set => SetProperty(ref _timestamp, value);
        }

        /// <summary>
        /// Header text for the view
        /// </summary>
        public string HeaderText => $"{Key} - View Missing";

        /// <summary>
        /// Sub-header text for the view
        /// </summary>
        public string SubHeaderText => "This view has not been implemented yet";

        /// <summary>
        /// Command to refresh/reload the view
        /// </summary>
        public ICommand RefreshCommand { get; }

        public MissingViewModel()
        {
            RefreshCommand = new RelayCommand(ExecuteRefresh);
        }

        private async void ExecuteRefresh()
        {
            try
            {
                _ = EnhancedLoggingService.Instance.LogUserActionAsync($"Refresh MissingView", $"Key: {Key}");
                
                // Update timestamp to show user that refresh was clicked
                Timestamp = DateTime.Now;
                OnPropertyChanged(nameof(Timestamp));
            }
            catch (Exception ex)
            {
                _ = EnhancedLoggingService.Instance.LogErrorAsync($"MissingViewModel.ExecuteRefresh failed: {ex.Message}");
                System.Diagnostics.Debug.WriteLine($"MissingViewModel.ExecuteRefresh failed: {ex.Message}");
            }
        }
    }
}