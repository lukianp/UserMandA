using System;
using System.Collections.ObjectModel;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using MandADiscoverySuite.Services;
using MandADiscoverySuite.Models;
using Microsoft.Extensions.Logging;
using CommunityToolkit.Mvvm.Input;

namespace MandADiscoverySuite.ViewModels
{
    /// <summary>
    /// ViewModel for SharePoint Discovery module
    /// </summary>
    public class SharePointDiscoveryViewModel : ModuleViewModel
    {
        private readonly CsvDataServiceNew _csvService;

        #region Constructor

        public SharePointDiscoveryViewModel(
            ModuleInfo moduleInfo,
            MainViewModel mainViewModel,
            ILogger<SharePointDiscoveryViewModel> logger)
            : base(moduleInfo, mainViewModel, logger)
        {
            _log?.LogInformation("Initializing SharePointDiscoveryViewModel");

            // Get CSV service
            var loggerFactory = Microsoft.Extensions.Logging.LoggerFactory.Create(builder => builder.AddConsole());
            var csvLogger = loggerFactory.CreateLogger<CsvDataServiceNew>();
            _csvService = new CsvDataServiceNew(csvLogger);

            // Initialize commands
            ViewDetailsCommand = new RelayCommand<dynamic>(ViewDetails, asset => asset != null);
        }

        #endregion

        #region Properties

        // Summary card properties
        private int _totalSites;
        public int TotalSites
        {
            get => _totalSites;
            set => SetProperty(ref _totalSites, value);
        }

        private int _totalDocumentLibraries;
        public int TotalDocumentLibraries
        {
            get => _totalDocumentLibraries;
            set => SetProperty(ref _totalDocumentLibraries, value);
        }

        private int _totalLists;
        public int TotalLists
        {
            get => _totalLists;
            set => SetProperty(ref _totalLists, value);
        }

        private double _totalStorageUsed;
        public double TotalStorageUsed
        {
            get => _totalStorageUsed;
            set => SetProperty(ref _totalStorageUsed, value);
        }

        // Data binding collections
        public ObservableCollection<dynamic> SelectedResults { get; } = new ObservableCollection<dynamic>();

        private object _selectedItem;
        public object SelectedItem
        {
            get => _selectedItem;
            set
            {
                if (SetProperty(ref _selectedItem, value))
                {
                    // Update selected item details for details panel
                    UpdateSelectedItemDetails();
                }
            }
        }

        private ObservableCollection<KeyValuePair<string, string>> _selectedItemDetails = new ObservableCollection<KeyValuePair<string, string>>();
        public ObservableCollection<KeyValuePair<string, string>> SelectedItemDetails
        {
            get => _selectedItemDetails;
            set => SetProperty(ref _selectedItemDetails, value);
        }

        // Site hierarchy and permissions for details panel
        private ObservableCollection<string> _siteHierarchy = new ObservableCollection<string>();
        public ObservableCollection<string> SiteHierarchy
        {
            get => _siteHierarchy;
            set => SetProperty(ref _siteHierarchy, value);
        }

        private ObservableCollection<PermissionLevelInfo> _permissionLevels = new ObservableCollection<PermissionLevelInfo>();
        public ObservableCollection<PermissionLevelInfo> PermissionLevels
        {
            get => _permissionLevels;
            set => SetProperty(ref _permissionLevels, value);
        }

        #endregion

        #region Commands

        // Additional commands beyond inherited ones
        public AsyncRelayCommand RunDiscoveryCommand => new AsyncRelayCommand(RunDiscoveryAsync);
        public AsyncRelayCommand RefreshDataCommand => new AsyncRelayCommand(RefreshDataAsync);
        public AsyncRelayCommand ExportCommand => new AsyncRelayCommand(ExportDataAsync);
        public RelayCommand<dynamic> ViewDetailsCommand { get; }

        #endregion

        #region Overrides

        protected override async Task ExecuteModuleAsync()
        {
            try
            {
                _log?.LogInformation("Executing SharePoint discovery module");

                // Load data from CSV
                await LoadFromCsvAsync(new System.Collections.Generic.List<dynamic>());
            }
            catch (Exception ex)
            {
                _log?.LogError(ex, "Error executing SharePoint discovery");
                ShowError("Discovery Failed", ex.Message);
            }
        }

        protected override async Task LoadFromCsvAsync(System.Collections.Generic.List<dynamic> csvData)
        {
            try
            {
                IsProcessing = true;
                ProcessingMessage = "Loading SharePoint data...";

                // Load SharePoint discovery data from profile paths
                var loadedCsvData = await _csvService.LoadSharePointDiscoveryAsync();

                // Convert to dynamic list
                var results = new List<dynamic>();
                foreach (var item in loadedCsvData)
                {
                    results.Add(item);
                }

                var result = DataLoaderResult<dynamic>.Success(results, new List<string>());

                // Apply HeaderWarnings logic
                if (result.Data.Any())
                {
                    HeaderWarnings.Clear();
                }

                // Update collections and summary statistics
                SelectedResults.Clear();
                foreach (var item in result.Data)
                {
                    SelectedResults.Add(item);
                }

                // Calculate summary statistics
                CalculateSummaryStatistics(result.Data);

                LastUpdated = DateTime.Now;
                OnPropertyChanged(nameof(ResultsCount));
                OnPropertyChanged(nameof(HasResults));

                _log?.LogInformation($"Loaded {result.Data.Count} SharePoint records");
            }
            catch (Exception ex)
            {
                _log?.LogError(ex, "Error loading SharePoint CSV data");
                ShowError("Data Load Failed", ex.Message);
            }
            finally
            {
                IsProcessing = false;
            }
        }

        #endregion

        #region Command Implementations

        private async Task RunDiscoveryAsync()
        {
            try
            {
                IsProcessing = true;
                StatusText = "Running Discovery";
                ProcessingMessage = "Executing SharePoint discovery...";

                // Here you would implement the actual discovery logic
                // For now, just simulate loading from CSV
                await LoadFromCsvAsync(new System.Collections.Generic.List<dynamic>());

                StatusText = "Discovery Complete";
            }
            catch (Exception ex)
            {
                _log?.LogError(ex, "Error running SharePoint discovery");
                ShowError("Discovery Error", ex.Message);
            }
            finally
            {
                IsProcessing = false;
            }
        }

        private async Task RefreshDataAsync()
        {
            try
            {
                await LoadFromCsvAsync(new System.Collections.Generic.List<dynamic>());
            }
            catch (Exception ex)
            {
                _log?.LogError(ex, "Error refreshing data");
                ShowError("Refresh Failed", ex.Message);
            }
        }

        private async Task ExportDataAsync()
        {
            try
            {
                if (SelectedResults.Count == 0)
                {
                    ShowInformation("No data to export");
                    return;
                }

                // Implement export logic here
                _log?.LogInformation("Exporting SharePoint data");
                await Task.CompletedTask; // Placeholder
            }
            catch (Exception ex)
            {
                _log?.LogError(ex, "Error exporting data");
                ShowError("Export Failed", ex.Message);
            }
        }

        private async void ViewDetails(dynamic asset)
        {
            if (asset == null) return;

            try
            {
                _log?.LogInformation("Opening asset detail tab for SharePoint site");

                // Extract site identifier - use sitename first, then url as fallback
                var dict = (System.Collections.Generic.IDictionary<string, object>)asset;
                var deviceName = dict.TryGetValue("sitename", out var siteNameObj) && siteNameObj != null ? siteNameObj.ToString() : "Unknown Site";
                var displayName = deviceName;

                // Use TabsService from MainViewModel to open asset detail tab
                if (MainViewModel.CurrentTabsService != null)
                {
                    var success = await MainViewModel.CurrentTabsService.OpenAssetDetailTabAsync(
                        deviceName,
                        displayName);

                    if (success)
                    {
                        _log?.LogInformation("Opened asset detail tab for SharePoint site {SiteName}", deviceName);
                    }
                    else
                    {
                        _log?.LogWarning("Failed to open asset detail tab for SharePoint site {SiteName}", deviceName);
                        ShowError("Asset Details", "Failed to open asset details");
                    }
                }
                else
                {
                    _log?.LogError("TabsService not available");
                    ShowError("Asset Details", "TabsService not available");
                }
            }
            catch (Exception ex)
            {
                _log?.LogError(ex, "Failed to open asset detail tab for SharePoint site");
                ShowError("Asset Details", $"Failed to open asset details: {ex.Message}");
            }
        }

        #endregion

        #region Helper Methods

        private void CalculateSummaryStatistics(System.Collections.Generic.List<dynamic> data)
        {
            TotalSiteCollections = data.Count;
            TotalSites = data.Count;
            TotalLists = 0;

            foreach (var item in data)
            {
                var dict = (System.Collections.Generic.IDictionary<string, object>)item;

                // Count lists
                if (dict.TryGetValue("listcount", out var listCountObj) ||
                    dict.TryGetValue("ListCount", out listCountObj))
                {
                    if (int.TryParse(listCountObj?.ToString(), out var lists))
                    {
                        TotalLists += lists;
                    }
                }
            }
        }

        private void UpdateSelectedItemDetails()
        {
            SelectedItemDetails.Clear();

            if (SelectedItem == null) return;

            var dict = (System.Collections.Generic.IDictionary<string, object>)SelectedItem;

            // Site Details
            dict.TryGetValue("sitename", out var siteNameObj);
            SelectedItemDetails.Add(new KeyValuePair<string, string>("Site Name", siteNameObj?.ToString() ?? ""));

            dict.TryGetValue("url", out var urlObj);
            SelectedItemDetails.Add(new KeyValuePair<string, string>("URL", urlObj?.ToString() ?? ""));

            dict.TryGetValue("owner", out var ownerObj);
            SelectedItemDetails.Add(new KeyValuePair<string, string>("Owner", ownerObj?.ToString() ?? ""));

            dict.TryGetValue("sitetemplate", out var siteTemplateObj);
            SelectedItemDetails.Add(new KeyValuePair<string, string>("Site Template", siteTemplateObj?.ToString() ?? ""));

            dict.TryGetValue("storageused", out var storageUsedObj);
            SelectedItemDetails.Add(new KeyValuePair<string, string>("Storage Used", storageUsedObj?.ToString() ?? ""));

            dict.TryGetValue("createddate", out var createdDateObj);
            SelectedItemDetails.Add(new KeyValuePair<string, string>("Created Date", createdDateObj?.ToString() ?? ""));

            dict.TryGetValue("modifieddate", out var modifiedDateObj);
            SelectedItemDetails.Add(new KeyValuePair<string, string>("Modified Date", modifiedDateObj?.ToString() ?? ""));

            // Additional Details
            dict.TryGetValue("listcount", out var listCountObj);
            SelectedItemDetails.Add(new KeyValuePair<string, string>("List Count", listCountObj?.ToString() ?? ""));

            dict.TryGetValue("itemcount", out var itemCountObj);
            SelectedItemDetails.Add(new KeyValuePair<string, string>("Item Count", itemCountObj?.ToString() ?? ""));
        }

        #endregion
    }
}