using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.ComponentModel;
using System.Linq;
using System.Threading.Tasks;
using System.Windows.Data;
using System.Windows.Input;
using CommunityToolkit.Mvvm.Input;
using MandADiscoverySuite.Collections;
using MandADiscoverySuite.Models;
using MandADiscoverySuite.Services;

namespace MandADiscoverySuite.ViewModels
{
    /// <summary>
    /// ViewModel for the Infrastructure & Assets view that combines all discovered IT assets
    /// </summary>
    public class InfrastructureAssetsViewModel : BaseViewModel
    {
        private readonly CsvDataService _csvDataService;
        private readonly MainViewModel _mainViewModel;
        private readonly IDataService _dataService;

        #region Private Fields

        private OptimizedObservableCollection<InfrastructureData> _assets;
        private ICollectionView _assetsView;
        private InfrastructureData _selectedAsset;
        private string _searchText = string.Empty;
        private string _selectedTypeFilter = string.Empty;
        private string _selectedLocationFilter = string.Empty;
        private bool _isLoading;
        private string _loadingMessage = "Ready";
        private int _totalAssetsCount;
        private int _filteredAssetsCount;
        private bool _hasErrors;
        private string _errorMessage;

        #endregion

        #region Properties

        /// <summary>
        /// Collection of all infrastructure assets
        /// </summary>
        public OptimizedObservableCollection<InfrastructureData> Assets
        {
            get => _assets;
            set => SetProperty(ref _assets, value);
        }

        /// <summary>
        /// Filtered and sorted view of assets
        /// </summary>
        public ICollectionView AssetsView
        {
            get => _assetsView;
            set => SetProperty(ref _assetsView, value);
        }

        /// <summary>
        /// Currently selected asset
        /// </summary>
        public InfrastructureData SelectedAsset
        {
            get => _selectedAsset;
            set => SetProperty(ref _selectedAsset, value);
        }

        /// <summary>
        /// Search text for filtering assets
        /// </summary>
        public string SearchText
        {
            get => _searchText;
            set
            {
                if (SetProperty(ref _searchText, value))
                {
                    AssetsView?.Refresh();
                    OnPropertyChanged(nameof(FilteredAssetsCount));
                }
            }
        }

        /// <summary>
        /// Selected type filter
        /// </summary>
        public string SelectedTypeFilter
        {
            get => _selectedTypeFilter;
            set
            {
                if (SetProperty(ref _selectedTypeFilter, value))
                {
                    AssetsView?.Refresh();
                    OnPropertyChanged(nameof(FilteredAssetsCount));
                }
            }
        }

        /// <summary>
        /// Selected location filter
        /// </summary>
        public string SelectedLocationFilter
        {
            get => _selectedLocationFilter;
            set
            {
                if (SetProperty(ref _selectedLocationFilter, value))
                {
                    AssetsView?.Refresh();
                    OnPropertyChanged(nameof(FilteredAssetsCount));
                }
            }
        }

        /// <summary>
        /// Available asset types for filtering
        /// </summary>
        public ObservableCollection<string> AssetTypes { get; }

        /// <summary>
        /// Available locations for filtering
        /// </summary>
        public ObservableCollection<string> AssetLocations { get; }

        /// <summary>
        /// Whether data is currently loading
        /// </summary>
        public new bool IsLoading
        {
            get => _isLoading;
            set => SetProperty(ref _isLoading, value);
        }

        /// <summary>
        /// Loading progress message
        /// </summary>
        public new string LoadingMessage
        {
            get => _loadingMessage;
            set => SetProperty(ref _loadingMessage, value);
        }

        /// <summary>
        /// Total number of assets loaded
        /// </summary>
        public int TotalAssetsCount
        {
            get => _totalAssetsCount;
            set => SetProperty(ref _totalAssetsCount, value);
        }

        /// <summary>
        /// Number of assets after filtering
        /// </summary>
        public int FilteredAssetsCount
        {
            get
            {
                if (AssetsView == null) return 0;
                var count = 0;
                foreach (var item in AssetsView)
                {
                    count++;
                }
                return count;
            }
        }

        /// <summary>
        /// Status information text
        /// </summary>
        public string StatusInfo => $"Showing {FilteredAssetsCount} of {TotalAssetsCount} assets";

        /// <summary>
        /// Whether there are assets to display
        /// </summary>
        public bool HasAssets => TotalAssetsCount > 0;

        /// <summary>
        /// Whether there are errors
        /// </summary>
        public new bool HasErrors
        {
            get => _hasErrors;
            set => SetProperty(ref _hasErrors, value);
        }

        /// <summary>
        /// Error message if any
        /// </summary>
        public new string ErrorMessage
        {
            get => _errorMessage;
            set => SetProperty(ref _errorMessage, value);
        }

        #endregion

        #region Commands

        public ICommand RefreshAssetsCommand { get; }
        public ICommand OpenAssetDetailCommand { get; }
        public ICommand ClearSearchCommand { get; }
        public ICommand ClearFiltersCommand { get; }
        public ICommand ExportAssetsCommand { get; }

        #endregion

        #region Constructor

        public InfrastructureAssetsViewModel(IDataService dataService = null, CsvDataService csvDataService = null, MainViewModel mainViewModel = null)
        {
            _ = EnhancedLoggingService.Instance.LogInformationAsync("InfrastructureAssetsViewModel constructor: Starting initialization");
            
            _dataService = dataService ?? SimpleServiceLocator.GetService<IDataService>();
            _csvDataService = csvDataService ?? SimpleServiceLocator.GetService<CsvDataService>();
            _mainViewModel = mainViewModel;
            
            _ = EnhancedLoggingService.Instance.LogInformationAsync($"InfrastructureAssetsViewModel constructor: Services initialized - _csvDataService is {(_csvDataService != null ? "not null" : "null")}");

            Assets = new OptimizedObservableCollection<InfrastructureData>();
            Assets.CollectionChanged += (s, e) => 
            {
                OnPropertiesChanged(nameof(TotalAssetsCount), nameof(StatusInfo), nameof(HasAssets));
                UpdateAssetFilters();
            };

            AssetTypes = new ObservableCollection<string>();
            AssetLocations = new ObservableCollection<string>();

            // Create collection view for filtering and sorting
            AssetsView = CollectionViewSource.GetDefaultView(Assets);
            AssetsView.Filter = FilterAssets;

            // Initialize commands
            RefreshAssetsCommand = new AsyncRelayCommand(RefreshAssetsAsync, () => !IsLoading);
            OpenAssetDetailCommand = new RelayCommand<InfrastructureData>(OpenAssetDetail, asset => asset != null);
            ClearSearchCommand = new RelayCommand(ClearSearch, () => !string.IsNullOrEmpty(SearchText));
            ClearFiltersCommand = new RelayCommand(ClearFilters, () => !string.IsNullOrEmpty(SelectedTypeFilter) || !string.IsNullOrEmpty(SelectedLocationFilter));
            ExportAssetsCommand = new AsyncRelayCommand(ExportAssetsAsync, () => Assets.Count > 0);

            LoadingMessage = "Ready";
            
            // Auto-load data when ViewModel is created
            _ = LoadDataAsync();
        }
        
        private async Task LoadDataAsync()
        {
            await RefreshAssetsAsync();
        }

        #endregion

        #region Methods

        /// <summary>
        /// Refreshes the assets data from CSV files
        /// </summary>
        private async Task RefreshAssetsAsync()
        {
            try
            {
                _ = EnhancedLoggingService.Instance.LogInformationAsync("InfrastructureAssetsViewModel.RefreshAssetsAsync: Starting asset refresh");
                IsLoading = true;
                HasErrors = false;
                ErrorMessage = null;
                LoadingMessage = "Loading infrastructure assets...";

                Assets.Clear();
                
                // Get current profile name
                var profileService = SimpleServiceLocator.GetService<IProfileService>();
                var currentProfile = await profileService?.GetCurrentProfileAsync();
                var profileName = currentProfile?.CompanyName ?? "ljpops";
                _ = EnhancedLoggingService.Instance.LogInformationAsync($"InfrastructureAssetsViewModel.RefreshAssetsAsync: Using profile name: {profileName}");

                LoadingMessage = "Loading all infrastructure data...";

                // Use CsvDataService to load all infrastructure data
                IEnumerable<InfrastructureData> infrastructureData;
                if (_csvDataService != null)
                {
                    _ = EnhancedLoggingService.Instance.LogInformationAsync("InfrastructureAssetsViewModel.RefreshAssetsAsync: Using CsvDataService to load infrastructure data");
                    infrastructureData = await _csvDataService.LoadInfrastructureAsync(profileName) ?? new List<InfrastructureData>();
                    _ = EnhancedLoggingService.Instance.LogInformationAsync($"InfrastructureAssetsViewModel.RefreshAssetsAsync: Loaded {infrastructureData.Count()} infrastructure items from CsvDataService");
                }
                else
                {
                    _ = EnhancedLoggingService.Instance.LogInformationAsync("InfrastructureAssetsViewModel.RefreshAssetsAsync: CsvDataService is null, using fallback IDataService");
                    infrastructureData = await _dataService?.LoadInfrastructureAsync(profileName) ?? new List<InfrastructureData>();
                    _ = EnhancedLoggingService.Instance.LogInformationAsync($"InfrastructureAssetsViewModel.RefreshAssetsAsync: Loaded {infrastructureData.Count()} infrastructure items from IDataService");
                }

                LoadingMessage = "Processing asset data...";

                var assetList = infrastructureData.ToList();

                // Ensure UI updates happen on UI thread
                await System.Windows.Application.Current.Dispatcher.InvokeAsync(() =>
                {
                    foreach (var asset in assetList)
                    {
                        Assets.Add(asset);
                    }

                    LoadingMessage = "Applying filters...";
                    AssetsView.Refresh();
                    OnPropertiesChanged(nameof(FilteredAssetsCount), nameof(TotalAssetsCount), nameof(StatusInfo), nameof(HasAssets));

                    LoadingMessage = $"Loaded {Assets.Count} assets successfully";
                });
                
                _ = EnhancedLoggingService.Instance.LogInformationAsync($"InfrastructureAssetsViewModel.RefreshAssetsAsync: Successfully loaded {Assets.Count} assets");
            }
            catch (Exception ex)
            {
                _ = EnhancedLoggingService.Instance.LogErrorAsync("InfrastructureAssetsViewModel.RefreshAssetsAsync: Error during asset refresh", ex);
                ErrorMessage = $"Failed to refresh assets: {ex.Message}";
                HasErrors = true;
                LoadingMessage = "Failed to load assets";
            }
            finally
            {
                await System.Windows.Application.Current.Dispatcher.InvokeAsync(() =>
                {
                    IsLoading = false;
                });
            }
        }

        /// <summary>
        /// Filters assets based on search text and selected filters
        /// </summary>
        private bool FilterAssets(object obj)
        {
            if (obj is not InfrastructureData asset)
                return false;

            // Search text filter
            if (!string.IsNullOrEmpty(SearchText))
            {
                var searchLower = SearchText.ToLower();
                if (!asset.Name?.ToLower().Contains(searchLower) == true &&
                    !asset.IPAddress?.ToLower().Contains(searchLower) == true &&
                    !asset.Description?.ToLower().Contains(searchLower) == true &&
                    !asset.Type?.ToLower().Contains(searchLower) == true)
                {
                    return false;
                }
            }

            // Type filter
            if (!string.IsNullOrEmpty(SelectedTypeFilter) && SelectedTypeFilter != "All")
            {
                if (asset.Type != SelectedTypeFilter)
                    return false;
            }

            // Location filter
            if (!string.IsNullOrEmpty(SelectedLocationFilter) && SelectedLocationFilter != "All")
            {
                if (asset.Location != SelectedLocationFilter)
                    return false;
            }

            return true;
        }

        /// <summary>
        /// Updates the filter dropdowns based on current assets
        /// </summary>
        private void UpdateAssetFilters()
        {
            // Update type filter
            var types = Assets.Where(a => !string.IsNullOrEmpty(a.Type))
                             .Select(a => a.Type)
                             .Distinct()
                             .OrderBy(t => t)
                             .ToList();
            
            AssetTypes.Clear();
            AssetTypes.Add("All");
            foreach (var type in types)
            {
                AssetTypes.Add(type);
            }

            // Update location filter
            var locations = Assets.Where(a => !string.IsNullOrEmpty(a.Location))
                                 .Select(a => a.Location)
                                 .Distinct()
                                 .OrderBy(l => l)
                                 .ToList();
            
            AssetLocations.Clear();
            AssetLocations.Add("All");
            foreach (var location in locations)
            {
                AssetLocations.Add(location);
            }
        }

        /// <summary>
        /// Opens the detail view for the selected asset
        /// </summary>
        private void OpenAssetDetail(InfrastructureData asset)
        {
            if (asset == null || _mainViewModel == null)
                return;

            try
            {
                _ = EnhancedLoggingService.Instance.LogInformationAsync($"InfrastructureAssetsViewModel.OpenAssetDetail: Opening detail for asset '{asset.Name}'");
                
                // Create AssetDetailViewModel
                var detailViewModel = new AssetDetailViewModel(asset, _csvDataService, _mainViewModel);
                detailViewModel.TabTitle = $"Asset: {asset.Name}";
                
                // Add as a new tab in MainViewModel
                _mainViewModel.OpenTabs.Add(detailViewModel);
                _mainViewModel.SelectedTab = detailViewModel;
            }
            catch (Exception ex)
            {
                _ = EnhancedLoggingService.Instance.LogErrorAsync($"InfrastructureAssetsViewModel.OpenAssetDetail: Error opening detail for asset '{asset?.Name}'", ex);
                ErrorMessage = $"Failed to open asset detail: {ex.Message}";
                HasErrors = true;
            }
        }

        /// <summary>
        /// Clears the search text
        /// </summary>
        private void ClearSearch()
        {
            SearchText = string.Empty;
        }

        /// <summary>
        /// Clears all filters
        /// </summary>
        private void ClearFilters()
        {
            SelectedTypeFilter = string.Empty;
            SelectedLocationFilter = string.Empty;
        }

        /// <summary>
        /// Exports assets to CSV
        /// </summary>
        private async Task ExportAssetsAsync()
        {
            try
            {
                LoadingMessage = "Exporting assets...";
                IsLoading = true;

                // Get filtered assets
                var assetsToExport = new List<InfrastructureData>();
                foreach (InfrastructureData asset in AssetsView)
                {
                    assetsToExport.Add(asset);
                }

                // Use the same export mechanism as other views
                var exportPath = System.IO.Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.Desktop), 
                    $"InfrastructureAssets_Export_{DateTime.Now:yyyyMMdd_HHmmss}.csv");

                await _csvDataService?.ExportInfrastructureAsync(assetsToExport, exportPath);

                LoadingMessage = $"Exported {assetsToExport.Count} assets to {exportPath}";
                
                // Show success message
                System.Windows.MessageBox.Show($"Successfully exported {assetsToExport.Count} assets to:\n{exportPath}", 
                    "Export Complete", System.Windows.MessageBoxButton.OK, System.Windows.MessageBoxImage.Information);
            }
            catch (Exception ex)
            {
                _ = EnhancedLoggingService.Instance.LogErrorAsync("InfrastructureAssetsViewModel.ExportAssetsAsync: Error during export", ex);
                ErrorMessage = $"Failed to export assets: {ex.Message}";
                HasErrors = true;
                LoadingMessage = "Export failed";
            }
            finally
            {
                IsLoading = false;
            }
        }

        #endregion
    }
}