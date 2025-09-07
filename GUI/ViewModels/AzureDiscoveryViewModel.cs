using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Globalization;
using System.Linq;
using System.Threading.Tasks;
using System.Windows.Input;
using MandADiscoverySuite.Services;
using MandADiscoverySuite.Models;
using Microsoft.Extensions.Logging;
using CommunityToolkit.Mvvm.Input;

namespace MandADiscoverySuite.ViewModels
{
    /// <summary>
    /// ViewModel for Azure Discovery module
    /// </summary>
    public class AzureDiscoveryViewModel : ModuleViewModel
    {
        private readonly CsvDataServiceNew _csvService;

        #region Constructor

        public AzureDiscoveryViewModel(
            ModuleInfo moduleInfo,
            MainViewModel mainViewModel,
            ILogger<AzureDiscoveryViewModel> logger)
            : base(moduleInfo, mainViewModel, logger)
        {
            _log?.LogInformation("Initializing AzureDiscoveryViewModel");

            // Get CSV service
            var loggerFactory = Microsoft.Extensions.Logging.LoggerFactory.Create(builder => builder.AddConsole());
            var csvLogger = loggerFactory.CreateLogger<CsvDataServiceNew>();
            _csvService = new CsvDataServiceNew(csvLogger);
        }

        #endregion

        #region Properties

        // Summary card properties
        private int _totalSubscriptions;
        public int TotalSubscriptions
        {
            get => _totalSubscriptions;
            set => SetProperty(ref _totalSubscriptions, value);
        }

        private int _totalResourceGroups;
        public int TotalResourceGroups
        {
            get => _totalResourceGroups;
            set => SetProperty(ref _totalResourceGroups, value);
        }

        private int _totalVirtualMachines;
        public int TotalVirtualMachines
        {
            get => _totalVirtualMachines;
            set => SetProperty(ref _totalVirtualMachines, value);
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
                    PopulateSelectedItemDetails();
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

        #endregion

        #region Overrides

        protected override async Task ExecuteModuleAsync()
        {
            try
            {
                _log?.LogInformation("Executing Azure discovery module");

                // Load data from CSV
                await LoadFromCsvAsync(new System.Collections.Generic.List<dynamic>());
            }
            catch (Exception ex)
            {
                _log?.LogError(ex, "Error executing Azure discovery");
                ShowError("Discovery Failed", ex.Message);
            }
        }

        protected override async Task LoadFromCsvAsync(System.Collections.Generic.List<dynamic> csvData)
        {
            try
            {
                IsProcessing = true;
                ProcessingMessage = "Loading Azure discovery data...";

                // Load from specific CSV path using the service
                var result = await _csvService.LoadAzureDiscoveryAsync();

                // Update collections and summary statistics
                SelectedResults.Clear();
                foreach (var item in result)
                {
                    SelectedResults.Add(item);
                }

                // Calculate summary statistics
                CalculateSummaryStatistics(result);

                LastUpdated = DateTime.Now;
                LastDiscoveryTime = DateTime.Now; // Update last discovery time
                OnPropertyChanged(nameof(ResultsCount));
                OnPropertyChanged(nameof(HasResults));

                _log?.LogInformation($"Loaded {result.Count} Azure discovery records");
            }
            catch (Exception ex)
            {
                _log?.LogError(ex, "Error loading Azure discovery CSV data");
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
                ProcessingMessage = "Executing Azure discovery...";

                // Here you would implement the actual discovery logic
                // For now, just simulate loading from CSV
                await LoadFromCsvAsync(new System.Collections.Generic.List<dynamic>());

                StatusText = "Discovery Complete";
            }
            catch (Exception ex)
            {
                _log?.LogError(ex, "Error running Azure discovery");
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
                _log?.LogInformation("Exporting Azure discovery data");
                await Task.CompletedTask; // Placeholder
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
            var uniqueSubscriptions = new System.Collections.Generic.HashSet<string>();
            var uniqueResourceGroups = new System.Collections.Generic.HashSet<string>();
            var virtualMachineCount = 0;

            foreach (var item in data)
            {
                var dict = (System.Collections.Generic.IDictionary<string, object>)item;

                // Extract subscription
                if (dict.TryGetValue("subscriptionname", out var subscriptionNameObj) ||
                    dict.TryGetValue("subscription", out subscriptionNameObj) ||
                    dict.TryGetValue("azure_subscription", out subscriptionNameObj))
                {
                    var subscriptionName = subscriptionNameObj?.ToString();
                    if (!string.IsNullOrWhiteSpace(subscriptionName))
                    {
                        uniqueSubscriptions.Add(subscriptionName);
                    }
                }

                // Extract resource group
                if (dict.TryGetValue("resourcegroup", out var resourceGroupObj) ||
                    dict.TryGetValue("resource_group", out resourceGroupObj) ||
                    dict.TryGetValue("azure_resource_group", out resourceGroupObj))
                {
                    var resourceGroup = resourceGroupObj?.ToString();
                    if (!string.IsNullOrWhiteSpace(resourceGroup))
                    {
                        uniqueResourceGroups.Add(resourceGroup);
                    }
                }

                // Count virtual machines
                if (dict.TryGetValue("resourcetype", out var resourceTypeObj) ||
                    dict.TryGetValue("type", out resourceTypeObj))
                {
                    var resourceType = resourceTypeObj?.ToString();
                    if (!string.IsNullOrWhiteSpace(resourceType) &&
                        resourceType.Contains("Virtual Machine", System.StringComparison.OrdinalIgnoreCase))
                    {
                        virtualMachineCount++;
                    }
                }
            }

            TotalSubscriptions = uniqueSubscriptions.Count;
            TotalResourceGroups = uniqueResourceGroups.Count;
            TotalVirtualMachines = virtualMachineCount;
        }

        private void PopulateSelectedItemDetails()
        {
            SelectedItemDetails.Clear();
            if (SelectedItem is System.Collections.Generic.IDictionary<string, object> dict)
            {
                foreach (var kvp in dict)
                {
                    string key = CultureInfo.CurrentCulture.TextInfo.ToTitleCase(kvp.Key);
                    string value = kvp.Value?.ToString() ?? string.Empty;
                    SelectedItemDetails.Add(new KeyValuePair<string, string>(key, value));
                }
            }
        }

        #endregion
    }
}