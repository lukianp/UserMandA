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
using GUI.Interfaces;

namespace MandADiscoverySuite.ViewModels
{
    /// <summary>
    /// ViewModel for Azure Discovery module
    /// </summary>
    public class AzureDiscoveryViewModel : ModuleViewModel, IDetailViewSupport
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

            // Initialize commands
            ViewDetailsCommand = new AsyncRelayCommand<object>(OpenDetailViewAsync);
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
        public ICommand ViewDetailsCommand { get; private set; }

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

                // Apply HeaderWarnings logic
                if (result.Any())
                {
                    HeaderWarnings.Clear();
                }

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

                // Create export data structure
                var exportData = SelectedResults.Select(item => (IDictionary<string, object>)item).ToList();

                if (exportData.Any())
                {
                    // Generate CSV content
                    var csvContent = GenerateCsvContent(exportData);

                    // Save to file
                    var exportPath = System.IO.Path.Combine(
                        Environment.GetFolderPath(Environment.SpecialFolder.Desktop),
                        $"Azure_Discovery_Export_{DateTime.Now:yyyyMMdd_HHmmss}.csv");

                    await System.IO.File.WriteAllTextAsync(exportPath, csvContent);

                    ShowInformation($"Export completed successfully. File saved to: {exportPath}");
                    _log?.LogInformation($"Azure discovery data exported to: {exportPath}");
                }
                else
                {
                    ShowInformation("No data available to export");
                }
            }
            catch (Exception ex)
            {
                _log?.LogError(ex, "Error exporting data");
                ShowError("Export Failed", ex.Message);
            }
        }

        public async Task OpenDetailViewAsync(object selectedItem)
        {
            try
            {
                if (selectedItem == null) return;

                _log?.LogInformation($"Viewing details for Azure resource: {selectedItem}");

                // Open AssetDetailWindow with resource data
                var assetDetailWindow = new Views.AssetDetailWindow();

                // Show the dialog
                var result = assetDetailWindow.ShowDialog();

                // Log the result
                if (result == true)
                {
                    _log?.LogInformation("Asset detail view closed with confirmation");
                }
                else
                {
                    _log?.LogInformation("Asset detail view closed without changes");
                }
            }
            catch (Exception ex)
            {
                _log?.LogError(ex, "Error viewing Azure resource details");
                ShowError("View Details Failed", ex.Message);
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
                // Show all available fields from the selected item
                foreach (var kvp in dict)
                {
                    var key = FormatFieldName(kvp.Key);
                    var value = kvp.Value?.ToString() ?? string.Empty;
                    if (!string.IsNullOrWhiteSpace(value))
                    {
                        SelectedItemDetails.Add(new KeyValuePair<string, string>(key, value));
                    }
                }
            }
        }

        private string FormatFieldName(string fieldName)
        {
            if (string.IsNullOrWhiteSpace(fieldName))
                return "Unknown Field";

            // Convert camelCase to Proper Case
            if (fieldName.Length == 1)
                return fieldName.ToUpper();

            // Handle special cases and normalize underscores
            fieldName = fieldName.Replace("_", " ").Replace("-", " ").Trim();

            // Convert to title case
            return CultureInfo.CurrentCulture.TextInfo.ToTitleCase(fieldName.ToLower());
        }

        private string GenerateCsvContent(List<IDictionary<string, object>> data)
        {
            if (!data.Any()) return string.Empty;

            var csv = new System.Text.StringBuilder();

            // Get all unique keys from all items
            var allKeys = data.SelectMany(d => d.Keys).Distinct().ToList();

            // Write header
            csv.AppendLine(string.Join(",", allKeys.Select(k => $"\"{k}\"")));

            // Write data rows
            foreach (var item in data)
            {
                var values = allKeys.Select(key =>
                {
                    var value = item.ContainsKey(key) ? item[key]?.ToString() ?? "" : "";
                    // Escape quotes and wrap in quotes if contains comma, quote, or newline
                    if (value.Contains("\"") || value.Contains(",") || value.Contains("\n") || value.Contains("\r"))
                    {
                        return $"\"{value.Replace("\"", "\"\"")}\"";
                    }
                    return value;
                });
                csv.AppendLine(string.Join(",", values));
            }

            return csv.ToString();
        }

        #endregion
    }
}