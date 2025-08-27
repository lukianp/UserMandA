using System.Windows.Input;
using CommunityToolkit.Mvvm.Input;

namespace MandADiscoverySuite.ViewModels
{
    /// <summary>
    /// ViewModel for the MissingView placeholder
    /// </summary>
    public class MissingViewViewModel : BaseViewModel
    {
        private string _key = string.Empty;
        private string _reason = string.Empty;
        private string _timestamp = string.Empty;
        private string _headerText = "Missing View";
        private string _subHeaderText = "This view is under construction";

        public MissingViewViewModel()
        {
            RefreshCommand = new RelayCommand(RefreshView);
        }

        public string Key
        {
            get => _key;
            set => SetProperty(ref _key, value);
        }

        public string Reason
        {
            get => _reason;
            set => SetProperty(ref _reason, value);
        }

        public string Timestamp
        {
            get => _timestamp;
            set => SetProperty(ref _timestamp, value);
        }

        public string HeaderText
        {
            get => _headerText;
            set => SetProperty(ref _headerText, value);
        }

        public string SubHeaderText
        {
            get => _subHeaderText;
            set => SetProperty(ref _subHeaderText, value);
        }

        public ICommand RefreshCommand { get; }

        private void RefreshView()
        {
            // For now, just update timestamp to show the refresh occurred
            Timestamp = System.DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss");
        }

        public override async System.Threading.Tasks.Task LoadAsync()
        {
            IsLoading = true;
            HasData = false;
            LastError = null;
            HeaderWarnings.Clear();

            try
            {
                // No actual data to load for missing view
                await System.Threading.Tasks.Task.Delay(100); // Simulate brief loading
                
                HasData = true;
            }
            catch (System.Exception ex)
            {
                LastError = $"Error loading missing view data: {ex.Message}";
            }
            finally
            {
                IsLoading = false;
            }
        }
    }
}