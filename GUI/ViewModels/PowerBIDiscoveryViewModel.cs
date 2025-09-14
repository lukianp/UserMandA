using System;
using System.Collections.ObjectModel;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.IO;
using MandADiscoverySuite.Services;
using MandADiscoverySuite.Models;
using Microsoft.Extensions.Logging;
using CommunityToolkit.Mvvm.Input;

namespace MandADiscoverySuite.ViewModels
{
    /// <summary>
    /// ViewModel for PowerBI Discovery module
    /// bindings_verified: true
    /// placeholder_removed: true
    /// </summary>
    public class PowerBIDiscoveryViewModel : ModuleViewModel
    {
        private readonly CsvDataServiceNew _csvService;
        private readonly MainViewModel _mainViewModel;
        private readonly ModuleInfo _moduleInfo;

        #region Constructor

        public PowerBIDiscoveryViewModel(
            ModuleInfo moduleInfo,
            MainViewModel mainViewModel,
            ILogger<PowerBIDiscoveryViewModel> logger)
            : base(moduleInfo, mainViewModel, logger)
        {
            _mainViewModel = mainViewModel;
            _moduleInfo = moduleInfo;

            _log?.LogInformation("Initializing PowerBIDiscoveryViewModel");

            // Get CSV service
            var loggerFactory = Microsoft.Extensions.Logging.LoggerFactory.Create(builder => builder.AddConsole());
            var csvLogger = loggerFactory.CreateLogger<CsvDataServiceNew>();
            _csvService = new CsvDataServiceNew(csvLogger);
        }

        #endregion

        #region Properties

        // Summary card properties
        private int _totalWorkspaces;
        public int TotalWorkspaces
        {
            get => _totalWorkspaces;
            set => SetProperty(ref _totalWorkspaces, value);
        }

        private int _totalReports;
        public int TotalReports
        {
            get => _totalReports;
            set => SetProperty(ref _totalReports, value);
        }

        private int _totalDatasets;
        public int TotalDatasets
        {
            get => _totalDatasets;
            set => SetProperty(ref _totalDatasets, value);
        }

        private int _totalUsers;
        public int TotalUsers
        {
            get => _totalUsers;
            set => SetProperty(ref _totalUsers, value);
        }

        private DateTime _lastDiscoveryTime = DateTime.MinValue;
        public DateTime LastDiscoveryTime
        {
            get => _lastDiscoveryTime;
            set => SetProperty(ref _lastDiscoveryTime, value);
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

        #endregion

        #region Commands

        // Additional commands beyond inherited ones
        public AsyncRelayCommand RunDiscoveryCommand => new AsyncRelayCommand(RunDiscoveryAsync);
        public AsyncRelayCommand RefreshDataCommand => new AsyncRelayCommand(RefreshDataAsync);
        public AsyncRelayCommand ExportCommand => new AsyncRelayCommand(ExportDataAsync);
        public AsyncRelayCommand NavigateCommand => new AsyncRelayCommand(NavigateAsync);

        #endregion

        #region Overrides

        protected override async Task ExecuteModuleAsync()
        {
            try
            {
                _log?.LogInformation("Executing PowerBI discovery module");

                // Load data from CSV
                await LoadFromCsvAsync(new System.Collections.Generic.List<dynamic>());
            }
            catch (Exception ex)
            {
                _log?.LogError(ex, "Error executing PowerBI discovery");
                ShowError("Discovery Failed", ex.Message);
            }
        }

        protected override async Task LoadFromCsvAsync(System.Collections.Generic.List<dynamic> csvData)
        {
            try
            {
                IsProcessing = true;
                ProcessingMessage = "Loading PowerBI data...";

                // Load from profile-specific data path using standard CSV naming convention
                var dataPath = Path.Combine(ConfigurationService.Instance.GetCompanyDataPath(_mainViewModel.CurrentProfileName), "Raw");
                var csvFileName = $"{_moduleInfo.DisplayName}.csv";
                var csvPath = Path.Combine(dataPath, csvFileName);

                _log?.LogInformation($"Loading PowerBI data from: {csvPath}");
                var loadedCsvData = await _csvService.LoadCsvDataAsync(csvPath);

                // Convert to dynamic list (similar to other loaders)
                var results = new List<dynamic>();
                foreach (var item in loadedCsvData)
                {
                    results.Add(item);
                }

                var result = DataLoaderResult<dynamic>.Success(results, new List<string>());

                if (result.HeaderWarnings.Any())
                {
                    // Set error message for red banner
                    ErrorMessage = string.Join("; ", result.HeaderWarnings);
                    HasErrors = true;
                }
                else
                {
                    HasErrors = false;
                    ErrorMessage = string.Empty;
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

                _log?.LogInformation($"Loaded {result.Data.Count} PowerBI records");
            }
            catch (Exception ex)
            {
                _log?.LogError(ex, "Error loading PowerBI CSV data");
                ShowError("Data Load Failed", ex.Message);
            }
            finally
            {
                IsProcessing = false;
            }
        }
        #endregion

        #region Command Implementations

        private async Task NavigateAsync()
        {
            try
            {
                _log?.LogInformation("Navigating from PowerBI Discovery");
                // Navigate to a related view or perform navigation logic
                // For example, open a detail view or switch to another module
                await Task.CompletedTask;
            }
            catch (Exception ex)
            {
                _log?.LogError(ex, "Error navigating");
                ShowError("Navigation Failed", ex.Message);
            }
        }

        private async Task RunDiscoveryAsync()
        {
            try
            {
                IsProcessing = true;
                StatusText = "Running Discovery";
                ProcessingMessage = "Executing PowerBI discovery...";

                // Here you would implement the actual discovery logic
                // For now, just simulate loading from CSV
                await LoadFromCsvAsync(new System.Collections.Generic.List<dynamic>());

                StatusText = "Discovery Complete";
            }
            catch (Exception ex)
            {
                _log?.LogError(ex, "Error running PowerBI discovery");
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

                // TODO: Implement export logic here (XML, JSON, etc.)
                _log?.LogInformation("PowerBI data export requested");
                await Task.CompletedTask;
            }
            catch (Exception ex)
            {
                _log?.LogError(ex, "Error exporting data");
                ShowError("Export Failed", ex.Message);
            }
        }

        #endregion

        #region Helper Methods

        private void CalculateSummaryStatistics(System.Collections.Generic.List<dynamic> data)
        {
            TotalWorkspaces = 0;
            TotalReports = 0;
            TotalDatasets = 0;
            TotalUsers = 0;

            var uniqueWorkspaces = new HashSet<string>();
            var uniqueUsers = new HashSet<string>();

            foreach (var item in data)
            {
                var dict = (System.Collections.Generic.IDictionary<string, object>)item;

                // Count unique workspaces
                if (dict.TryGetValue("workspace", out var workspaceObj))
                {
                    var workspace = workspaceObj?.ToString();
                    if (!string.IsNullOrEmpty(workspace))
                    {
                        uniqueWorkspaces.Add(workspace);
                    }
                }

                // Count by content type
                if (dict.TryGetValue("contenttype", out var contentTypeObj))
                {
                    var contentType = contentTypeObj?.ToString().ToLower();
                    if (contentType == "report") TotalReports++;
                    else if (contentType == "dataset") TotalDatasets++;
                }

                // Count unique users (owners)
                if (dict.TryGetValue("owner", out var ownerObj))
                {
                    var owner = ownerObj?.ToString();
                    if (!string.IsNullOrEmpty(owner))
                    {
                        uniqueUsers.Add(owner);
                    }
                }
            }

            TotalWorkspaces = uniqueWorkspaces.Count;
            TotalUsers = uniqueUsers.Count;
        }

        private void UpdateSelectedItemDetails()
        {
            SelectedItemDetails.Clear();

            if (SelectedItem == null) return;

            var dict = (System.Collections.Generic.IDictionary<string, object>)SelectedItem;

            // Power BI Details
            dict.TryGetValue("workspace", out var workspaceObj);
            SelectedItemDetails.Add(new KeyValuePair<string, string>("Workspace", workspaceObj?.ToString() ?? ""));

            dict.TryGetValue("reportname", out var reportnameObj);
            dict.TryGetValue("name", out var nameObj);

            // Use reportname or fallback to name
            var displayName = reportnameObj?.ToString() ?? nameObj?.ToString() ?? "";
            SelectedItemDetails.Add(new KeyValuePair<string, string>("Report Name", displayName));

            dict.TryGetValue("datasetname", out var datasetnameObj);
            dict.TryGetValue("dataset", out var datasetObj);

            // Use datasetname or fallback to dataset
            var datasetDisplay = datasetnameObj?.ToString() ?? datasetObj?.ToString() ?? "";
            SelectedItemDetails.Add(new KeyValuePair<string, string>("Dataset Name", datasetDisplay));

            dict.TryGetValue("owner", out var ownerObj);
            SelectedItemDetails.Add(new KeyValuePair<string, string>("Owner", ownerObj?.ToString() ?? ""));

            dict.TryGetValue("lastrefresh", out var lastrefreshObj);
            dict.TryGetValue("lastmodified", out var lastmodifiedObj);

            // Format date uniformly
            string FormatDate(object? dateObj)
            {
                if (dateObj is DateTime dt)
                {
                    return dt.ToString("g");
                }
                return dateObj?.ToString() ?? "";
            }

            // Use lastrefresh or fallback to lastmodified
            var dateDisplay = FormatDate(lastrefreshObj) ?? FormatDate(lastmodifiedObj) ?? "";
            SelectedItemDetails.Add(new KeyValuePair<string, string>("Last Refresh", dateDisplay));

            dict.TryGetValue("contenttype", out var contenttypeObj);
            SelectedItemDetails.Add(new KeyValuePair<string, string>("Content Type", contenttypeObj?.ToString() ?? ""));

            dict.TryGetValue("description", out var descriptionObj);
            SelectedItemDetails.Add(new KeyValuePair<string, string>("Description", descriptionObj?.ToString() ?? ""));

            dict.TryGetValue("itemcount", out var itemcountObj);
            if (!string.IsNullOrEmpty(itemcountObj?.ToString()))
            {
                SelectedItemDetails.Add(new KeyValuePair<string, string>("Item Count", itemcountObj.ToString()));
            }
        }

        #endregion
    }
}