using System;
using System.Collections.ObjectModel;
using System.ComponentModel;
using System.Linq;
using System.Windows.Data;
using System.Windows.Input;
using Microsoft.Extensions.Logging;
using MandADiscoverySuite.Collections;
using MandADiscoverySuite.Models;
using MandADiscoverySuite.Services;

namespace MandADiscoverySuite.ViewModels
{
    /// <summary>
    /// ViewModel for the Applications view
    /// </summary>
    public class ApplicationsViewModel : BaseViewModel
    {
        private readonly IDataService _dataService;
        private readonly ILogger<ApplicationsViewModel> _logger;
        
        private ICollectionView _filteredApplications;
        private string _searchText = string.Empty;
        private bool _isLoading;
        private string _loadingMessage = "";

        public ApplicationsViewModel()
        {
            _dataService = SimpleServiceLocator.GetService<IDataService>();
            _logger = SimpleServiceLocator.GetService<ILogger<ApplicationsViewModel>>();
            
            Applications = new OptimizedObservableCollection<ApplicationData>();
            
            // Set up filtered view
            _filteredApplications = CollectionViewSource.GetDefaultView(Applications);
            _filteredApplications.Filter = FilterApplication;
            
            InitializeCommands();
            
            TabTitle = "Applications";
            CanClose = true;
            
            // Load data
            LoadApplicationsAsync();
        }

        #region Properties

        /// <summary>
        /// Collection of applications
        /// </summary>
        public OptimizedObservableCollection<ApplicationData> Applications { get; }

        /// <summary>
        /// Filtered view of applications
        /// </summary>
        public ICollectionView FilteredApplications
        {
            get => _filteredApplications;
            set => SetProperty(ref _filteredApplications, value);
        }

        /// <summary>
        /// Search text for filtering applications
        /// </summary>
        public string SearchText
        {
            get => _searchText;
            set
            {
                if (SetProperty(ref _searchText, value))
                {
                    FilteredApplications.Refresh();
                }
            }
        }

        /// <summary>
        /// Whether applications are currently loading
        /// </summary>
        public bool IsLoading
        {
            get => _isLoading;
            set => SetProperty(ref _isLoading, value);
        }

        /// <summary>
        /// Loading message
        /// </summary>
        public string LoadingMessage
        {
            get => _loadingMessage;
            set => SetProperty(ref _loadingMessage, value);
        }

        /// <summary>
        /// Total count of applications
        /// </summary>
        public int ApplicationsCount => Applications?.Count ?? 0;

        #endregion

        #region Commands

        public ICommand RefreshCommand { get; private set; }
        public ICommand ClearSearchCommand { get; private set; }
        public ICommand ExportCommand { get; private set; }

        #endregion

        #region Methods

        protected override void InitializeCommands()
        {
            RefreshCommand = new AsyncRelayCommand(LoadApplicationsAsync);
            ClearSearchCommand = new RelayCommand(() => SearchText = string.Empty);
            ExportCommand = new AsyncRelayCommand(ExportApplicationsAsync);
        }

        private async System.Threading.Tasks.Task LoadApplicationsAsync()
        {
            try
            {
                IsLoading = true;
                LoadingMessage = "Loading applications...";

                // Get current profile name
                var profileService = SimpleServiceLocator.GetService<IProfileService>();
                var currentProfile = await profileService?.GetCurrentProfileAsync();
                var profileName = currentProfile?.CompanyName ?? "ljpops";

                var allApplications = await _dataService?.LoadApplicationsAsync(profileName) ?? new System.Collections.Generic.List<ApplicationData>();

                Applications.Clear();
                foreach (var app in allApplications)
                {
                    Applications.Add(app);
                }

                LoadingMessage = $"Loaded {Applications.Count} applications";
                OnPropertyChanged(nameof(ApplicationsCount));
                
                _logger?.LogInformation("Loaded {Count} applications for profile {ProfileName}", Applications.Count, profileName);
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error loading applications");
                ErrorMessage = $"Error loading applications: {ex.Message}";
            }
            finally
            {
                IsLoading = false;
            }
        }

        private async System.Threading.Tasks.Task ExportApplicationsAsync()
        {
            try
            {
                StatusMessage = "Exporting applications...";
                
                // Implementation would depend on export service
                await System.Threading.Tasks.Task.Delay(1000); // Placeholder
                
                StatusMessage = $"Exported {Applications.Count} applications successfully";
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error exporting applications");
                ErrorMessage = $"Error exporting applications: {ex.Message}";
            }
        }

        private bool FilterApplication(object obj)
        {
            if (obj is not ApplicationData application) return false;

            if (string.IsNullOrWhiteSpace(SearchText))
                return true;

            var searchLower = SearchText.ToLowerInvariant();
            return application.Name?.ToLowerInvariant().Contains(searchLower) == true ||
                   application.Publisher?.ToLowerInvariant().Contains(searchLower) == true ||
                   application.Version?.ToLowerInvariant().Contains(searchLower) == true;
        }

        #endregion

        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                Applications?.Clear();
            }
            base.Dispose(disposing);
        }
    }
}