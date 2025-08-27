using System;
using System.Collections.ObjectModel;
using System.ComponentModel;
using System.Linq;
using System.Threading.Tasks;
using System.Windows.Data;
using System.Windows.Input;
using CommunityToolkit.Mvvm.Input;
using Microsoft.Extensions.Logging;
using MandADiscoverySuite.Models;
using MandADiscoverySuite.Services;

namespace MandADiscoverySuite.ViewModels
{
    /// <summary>
    /// Application Inventory ViewModel using unified loading pipeline
    /// </summary>
    public class ApplicationInventoryViewModel : BaseViewModel
    {
        private readonly CsvDataServiceNew _csvService;
        private readonly ProfileService _profileService;
        private ICollectionView _applicationsView;
        private string _searchText = string.Empty;
        
        // Data collection - using Items for unified pattern consistency
        public ObservableCollection<ApplicationData> Items { get; } = new();
        
        // Implement HasData for this specific view
        public override bool HasData => Items.Count > 0;
        
        // Filtered view for search functionality
        public ICollectionView ApplicationsView
        {
            get => _applicationsView;
            private set => SetProperty(ref _applicationsView, value);
        }
        
        // Search functionality
        public string SearchText
        {
            get => _searchText;
            set
            {
                if (SetProperty(ref _searchText, value))
                {
                    ApplicationsView?.Refresh();
                }
            }
        }
        
        // Commands
        public ICommand RefreshApplicationsCommand { get; }
        public ICommand ClearSearchCommand { get; }
        
        public ApplicationInventoryViewModel(
            CsvDataServiceNew csvService, 
            ILogger<ApplicationInventoryViewModel> logger, 
            ProfileService profileService) 
            : base(logger)
        {
            _csvService = csvService ?? throw new ArgumentNullException(nameof(csvService));
            _profileService = profileService ?? throw new ArgumentNullException(nameof(profileService));
            
            // Initialize filtered view
            ApplicationsView = CollectionViewSource.GetDefaultView(Items);
            ApplicationsView.Filter = FilterApplication;
            
            // Initialize commands
            RefreshApplicationsCommand = new AsyncRelayCommand(LoadAsync);
            ClearSearchCommand = new RelayCommand(() => SearchText = string.Empty);
        }
        
        /// <summary>
        /// Unified LoadAsync implementation - follows exact specification pattern
        /// </summary>
        public override async Task LoadAsync()
        {
            IsLoading = true; 
            HasData = false; 
            LastError = null; 
            HeaderWarnings.Clear();

            try 
            {
                StructuredLogger?.LogDebug(LogSourceName, new { action = "load_start", component = "application_inventory" }, "Starting application inventory load");
                
                // Use Applications loader method
                var result = await _csvService.LoadApplicationsAsync(_profileService.CurrentProfile ?? "ljpops");
                
                // Process warnings - these become red banners
                foreach (var warning in result.HeaderWarnings) 
                    HeaderWarnings.Add(warning);
                
                // Update data collection
                Items.Clear();
                foreach (var item in result.Data) 
                    Items.Add(item);
                
                HasData = Items.Count > 0;
                
                StructuredLogger?.LogInfo(LogSourceName, new { action = "load_complete", component = "application_inventory", rows = Items.Count, warnings = HeaderWarnings.Count }, "Application inventory load completed successfully");
            }
            catch (Exception ex) 
            {
                LastError = $"Unexpected error: {ex.Message}";
                StructuredLogger?.LogError(LogSourceName, ex, new { action = "load_fail", component = "application_inventory" }, "Failed to load application inventory");
            }
            finally 
            { 
                IsLoading = false; 
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
    }
}