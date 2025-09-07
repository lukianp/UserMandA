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
    /// ViewModel for Environment Detection module
    /// </summary>
    public class EnvironmentDetectionViewModel : ModuleViewModel
    {
        private readonly CsvDataServiceNew _csvService;

        #region Constructor

        public EnvironmentDetectionViewModel(
            ModuleInfo moduleInfo,
            MainViewModel mainViewModel,
            ILogger<EnvironmentDetectionViewModel> logger)
            : base(moduleInfo, mainViewModel, logger)
        {
            _log?.LogInformation("Initializing EnvironmentDetectionViewModel");

            // Get CSV service
            var loggerFactory = Microsoft.Extensions.Logging.LoggerFactory.Create(builder => builder.AddConsole());
            var csvLogger = loggerFactory.CreateLogger<CsvDataServiceNew>();
            _csvService = new CsvDataServiceNew(csvLogger);
        }

        #endregion

        #region Properties

        // Summary card properties
        private int _totalEnvironments;
        public int TotalEnvironments
        {
            get => _totalEnvironments;
            set => SetProperty(ref _totalEnvironments, value);
        }

        private int _activeEnvironments;
        public int ActiveEnvironments
        {
            get => _activeEnvironments;
            set => SetProperty(ref _activeEnvironments, value);
        }

        private int _totalResources;
        public int TotalResources
        {
            get => _totalResources;
            set => SetProperty(ref _totalResources, value);
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
                    // Trigger async loading of item details when selection changes
                    _ = LoadSelectedItemDetailsAsync();
                }
            }
        }

        // Details for the selected item
        private ObservableCollection<DetailField> _selectedItemDetails;
        public ObservableCollection<DetailField> SelectedItemDetails
        {
            get => _selectedItemDetails ?? (_selectedItemDetails = new ObservableCollection<DetailField>());
            set => SetProperty(ref _selectedItemDetails, value);
        }

        private bool _isLoadingDetails;
        public bool IsLoadingDetails
        {
            get => _isLoadingDetails;
            set => SetProperty(ref _isLoadingDetails, value);
        }

        #endregion

        #region Commands

        // Additional commands beyond inherited ones
        public AsyncRelayCommand RunDiscoveryCommand => new AsyncRelayCommand(RunDiscoveryAsync);
        public AsyncRelayCommand RefreshDataCommand => new AsyncRelayCommand(RefreshDataAsync);
        public AsyncRelayCommand ExportCommand => new AsyncRelayCommand(ExportDataAsync);

        #endregion

        #region Overrides

        protected override async Task ExecuteModuleAsync()
        {
            try
            {
                _log?.LogInformation("Executing Environment Detection module");

                // Load data from CSV
                await LoadFromCsvAsync(new System.Collections.Generic.List<dynamic>());
            }
            catch (Exception ex)
            {
                _log?.LogError(ex, "Error executing Environment Detection");
                ShowError("Discovery Failed", ex.Message);
            }
        }

        protected override async Task LoadFromCsvAsync(System.Collections.Generic.List<dynamic> csvData)
        {
            try
            {
                IsProcessing = true;
                ProcessingMessage = "Loading Environment Detection data...";

                // Load from specific CSV path
                var csvPath = @"C:\discoverydata\ljpops\Raw\EnvironmentDetection.csv";
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

                _log?.LogInformation($"Loaded {result.Data.Count} Environment Detection records");
            }
            catch (Exception ex)
            {
                _log?.LogError(ex, "Error loading Environment Detection CSV data");
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
                ProcessingMessage = "Executing Environment Detection...";

                // Here you would implement the actual discovery logic
                // For now, just simulate loading from CSV
                await LoadFromCsvAsync(new System.Collections.Generic.List<dynamic>());

                StatusText = "Discovery Complete";
            }
            catch (Exception ex)
            {
                _log?.LogError(ex, "Error running Environment Detection");
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
                _log?.LogInformation("Exporting Environment Detection data");
                await Task.CompletedTask; // Placeholder
            }
            catch (Exception ex)
            {
                _log?.LogError(ex, "Error exporting data");
                ShowError("Export Failed", ex.Message);
            }
        }

        #endregion

        #region Detail Field Loading

        private async Task LoadSelectedItemDetailsAsync()
        {
            if (SelectedItem == null)
            {
                SelectedItemDetails.Clear();
                return;
            }

            try
            {
                IsLoadingDetails = true;
                SelectedItemDetails.Clear();

                // Simulate async loading delay
                await Task.Delay(100);

                var dict = SelectedItem as IDictionary<string, object>;
                if (dict != null)
                {
                    // Add detail fields based on environment detection requirements
                    AddDetailField("Environment Name", GetStringValue(dict, new[] { "EnvironmentName", "environmentname", "Name", "name" }));
                    AddDetailField("Type", GetStringValue(dict, new[] { "Type", "type" }), "Text", true);
                    AddDetailField("Status", GetStringValue(dict, new[] { "Status", "status" }), "Text", true);
                    AddDetailField("Resource Count", GetStringValue(dict, new[] { "ResourceCount", "resourcecount", "Resources", "resources" }));
                    AddDetailField("Description", GetStringValue(dict, new[] { "Description", "description" }), "Text", true);
                    AddDetailField("Location", GetStringValue(dict, new[] { "Location", "location" }), "Text", true);
                    AddDetailField("Last Scanned", GetStringValue(dict, new[] { "LastScanned", "lastscanned", "LastScan", "lastscan" }));
                    AddDetailField("Compliance Status", GetStringValue(dict, new[] { "ComplianceStatus", "compliancestatus" }));

                    // Environment-specific fields
                    var envType = GetStringValue(dict, new[] { "Type", "type" })?.ToLower();
                    if (envType?.Contains("azure") == true)
                    {
                        AddDetailField("Subscription ID", GetStringValue(dict, new[] { "SubscriptionId", "subscriptionid" }));
                        AddDetailField("Resource Group", GetStringValue(dict, new[] { "ResourceGroup", "resourcegroup" }));
                    }
                    else if (envType?.Contains("aws") == true)
                    {
                        AddDetailField("AWS Account ID", GetStringValue(dict, new[] { "AccountId", "accountid" }));
                        AddDetailField("Region", GetStringValue(dict, new[] { "Region", "region" }));
                    }
                    else if (envType?.Contains("on-prem") == true || envType?.Contains("hybrid") == true)
                    {
                        AddDetailField("Domain", GetStringValue(dict, new[] { "Domain", "domain" }));
                        AddDetailField("Network", GetStringValue(dict, new[] { "Network", "network" }));
                    }
                }
            }
            catch (Exception ex)
            {
                _log?.LogError(ex, "Error loading selected item details");
                SelectedItemDetails.Add(new DetailField("Error", ex.Message, "Error", false, "Failed to load details"));
            }
            finally
            {
                IsLoadingDetails = false;
            }
        }

        private void AddDetailField(string name, string value, string type = "Text", bool editable = false, string tooltip = null)
        {
            if (!string.IsNullOrEmpty(value))
            {
                SelectedItemDetails.Add(new DetailField(name, value, type, editable, tooltip));
            }
        }

        private string GetStringValue(IDictionary<string, object> dict, string[] keys)
        {
            foreach (var key in keys)
            {
                if (dict.TryGetValue(key, out var value))
                {
                    return value?.ToString();
                }
            }
            return null;
        }

        #endregion

        #region Helper Methods

        private void CalculateSummaryStatistics(System.Collections.Generic.List<dynamic> data)
        {
            TotalEnvironments = data.Count;
            TotalResources = 0;
            ActiveEnvironments = 0;

            var onPremEnvs = 0;
            var azureEnvs = 0;
            var awsEnvs = 0;
            var hybridEnvs = 0;

            foreach (var item in data)
            {
                var dict = (System.Collections.Generic.IDictionary<string, object>)item;

                // Count resources
                if (dict.TryGetValue("resourcecount", out var resourceCountObj) ||
                    dict.TryGetValue("ResourceCount", out resourceCountObj))
                {
                    if (int.TryParse(resourceCountObj?.ToString(), out var resources))
                    {
                        TotalResources += resources;
                    }
                }

                // Count active environments
                if (dict.TryGetValue("status", out var statusObj) &&
                    statusObj?.ToString().ToLower().Contains("active") == true)
                {
                    ActiveEnvironments++;
                }

                // Categorize by environment type
                if (dict.TryGetValue("type", out var typeObj) ||
                    dict.TryGetValue("Type", out typeObj))
                {
                    var envType = typeObj?.ToString().ToLower();
                    if (envType?.Contains("on-prem") == true || envType?.Contains("onprem") == true)
                    {
                        onPremEnvs++;
                    }
                    else if (envType?.Contains("azure") == true)
                    {
                        azureEnvs++;
                    }
                    else if (envType?.Contains("aws") == true)
                    {
                        awsEnvs++;
                    }
                    else if (envType?.Contains("hybrid") == true)
                    {
                        hybridEnvs++;
                    }
                }

                // Update last discovery time
                if (dict.TryGetValue("lastdiscovery", out var lastDiscoveryObj) ||
                    dict.TryGetValue("LastDiscovery", out lastDiscoveryObj) ||
                    dict.TryGetValue("LastScanned", out lastDiscoveryObj))
                {
                    if (DateTime.TryParse(lastDiscoveryObj?.ToString(), out var lastDiscovery))
                    {
                        if (LastDiscoveryTime == DateTime.MinValue || lastDiscovery > LastDiscoveryTime)
                        {
                            LastDiscoveryTime = lastDiscovery;
                        }
                    }
                }
            }

            // Log environment type breakdown
            _log?.LogInformation($"Environment Discovery Summary: Total={TotalEnvironments}, Active={ActiveEnvironments}, Resources={TotalResources}");
            _log?.LogInformation($"Environment Types: On-Prem={onPremEnvs}, Azure={azureEnvs}, AWS={awsEnvs}, Hybrid={hybridEnvs}");
        }

        #endregion
    }
}