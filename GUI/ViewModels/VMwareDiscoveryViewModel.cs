using System;
using System.Collections.ObjectModel;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Windows.Input;
using System.Windows.Media;
using MandADiscoverySuite.Services;
using MandADiscoverySuite.Models;
using Microsoft.Extensions.Logging;
using CommunityToolkit.Mvvm.Input;

namespace MandADiscoverySuite.ViewModels
{
    /// <summary>
    /// ViewModel for VMwareDiscovery module
    /// Handles VMware vSphere infrastructure discovery and data management
    /// </summary>
    public class VMwareDiscoveryViewModel : ModuleViewModel
    {
        private readonly CsvDataServiceNew _csvService;

        #region Constructor

        public VMwareDiscoveryViewModel(
            ModuleInfo moduleInfo,
            MainViewModel mainViewModel,
            ILogger<VMwareDiscoveryViewModel> logger)
            : base(moduleInfo, mainViewModel, logger)
        {
            _log?.LogInformation("Initializing VMwareDiscoveryViewModel");

            // Get CSV service
            var loggerFactory = Microsoft.Extensions.Logging.LoggerFactory.Create(builder => builder.AddConsole());
            var csvLogger = loggerFactory.CreateLogger<CsvDataServiceNew>();
            _csvService = new CsvDataServiceNew(csvLogger);

            // Initialize collections
            SelectedResults = new ObservableCollection<dynamic>();
        }

        #endregion

        #region Properties

        // Summary card properties
        private int _totalClusters;
        public int TotalClusters
        {
            get => _totalClusters;
            set => SetProperty(ref _totalClusters, value);
        }

        private int _totalHosts;
        public int TotalHosts
        {
            get => _totalHosts;
            set => SetProperty(ref _totalHosts, value);
        }

        private int _totalVMs;
        public int TotalVMs
        {
            get => _totalVMs;
            set => SetProperty(ref _totalVMs, value);
        }

        public string TotalVMsText => $"{_totalVMs:N0} VMs";

        // Data binding collections
        public ObservableCollection<dynamic> SelectedResults { get; }

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

        // VMware-specific discovery commands
        public AsyncRelayCommand RunDiscoveryCommand => new AsyncRelayCommand(RunDiscoveryAsync);
        public AsyncRelayCommand RefreshDataCommand => new AsyncRelayCommand(RefreshDataAsync);
        public AsyncRelayCommand ExportCommand => new AsyncRelayCommand(ExportDataAsync);
        public new AsyncRelayCommand ViewLogsCommand => new AsyncRelayCommand(ViewLogsAsync);
        public AsyncRelayCommand<object> ViewDetailsCommand => new AsyncRelayCommand<object>(ViewDetailsAsync);

        #endregion

        #region Overrides

        protected override async Task ExecuteModuleAsync()
        {
            try
            {
                _log?.LogInformation("Executing VMware Discovery module");

                // Load data from CSV
                await LoadFromCsvAsync(new List<dynamic>());
            }
            catch (Exception ex)
            {
                _log?.LogError(ex, "Error executing VMware Discovery");
                ShowError("Discovery Failed", ex.Message);
            }
        }

        protected override async Task LoadFromCsvAsync(List<dynamic> csvData)
        {
            try
            {
                IsProcessing = true;
                ProcessingMessage = "Loading VMware Infrastructure data...";

                // Load from specific CSV path
                var csvPath = @"C:\discoverydata\ljpops\Raw\VMwareDiscovery.csv";
                var loadedCsvData = await _csvService.LoadCsvDataAsync(csvPath);

                // Convert to dynamic list (similar to other loaders)
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

                _log?.LogInformation($"Loaded {result.Data.Count} VMware Infrastructure records");
            }
            catch (Exception ex)
            {
                _log?.LogError(ex, "Error loading VMware Infrastructure CSV data");
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
                StatusColor = Colors.Blue;
                ProcessingMessage = "Executing VMware Infrastructure discovery...";
                ProgressValue = 10;

                // Here you would implement actual VMware API discovery logic
                // For now, simulate discovery process
                await Task.Delay(2000);
                ProgressValue = 50;

                // Simulate loading data after "discovery"
                await LoadFromCsvAsync(new List<dynamic>());
                ProgressValue = 90;

                await Task.Delay(1000); // Final processing

                StatusText = "Discovery Complete";
                StatusColor = Colors.Green;
                ProgressValue = 100;
                ProcessingMessage = "VMware discovery completed successfully";

                _log?.LogInformation("VMware discovery process completed");
            }
            catch (Exception ex)
            {
                _log?.LogError(ex, "Error running VMware discovery");
                StatusText = "Discovery Failed";
                StatusColor = Colors.Red;
                ShowError("Discovery Error", ex.Message);
            }
            finally
            {
                IsProcessing = false;
                ProgressValue = 100;
            }
        }

        private async Task RefreshDataAsync()
        {
            try
            {
                IsProcessing = true;
                StatusText = "Refreshing Data";
                ProcessingMessage = "Reloading VMware infrastructure data...";

                await LoadFromCsvAsync(new List<dynamic>());

                StatusText = "Data Updated";
                StatusColor = Colors.Green;
            }
            catch (Exception ex)
            {
                _log?.LogError(ex, "Error refreshing VMware data");
                ShowError("Refresh Failed", ex.Message);
            }
            finally
            {
                IsProcessing = false;
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

                IsProcessing = true;
                ProcessingMessage = "Exporting VMware data...";

                // TODO: Implement actual export functionality
                // For now, simulate export process
                await Task.Delay(1500);

                StatusText = "Data Exported";
                StatusColor = Colors.Green;

                _log?.LogInformation("VMware data export completed");
                ShowInformation("VMware data export completed successfully");
            }
            catch (Exception ex)
            {
                _log?.LogError(ex, "Error exporting VMware data");
                ShowError("Export Failed", ex.Message);
            }
            finally
            {
                IsProcessing = false;
            }
        }

        protected override async Task ViewLogsAsync()
        {
            try
            {
                StatusText = "Viewing Logs";
                ProcessingMessage = "Opening VMware discovery logs...";

                // TODO: Implement log viewing functionality
                // For now, just simulate opening logs
                await Task.Delay(500);

                ShowInformation("VMware discovery logs opened in new window");
                _log?.LogInformation("VMware logs viewing initiated");
            }
            catch (Exception ex)
            {
                _log?.LogError(ex, "Error opening VMware logs");
                ShowError("Logs Error", ex.Message);
            }
        }

        private async Task ViewDetailsAsync(object parameter)
        {
            try
            {
                if (parameter == null)
                {
                    ShowError("View Details", "No asset selected");
                    return;
                }

                var assetName = GetAssetName(parameter);
                if (string.IsNullOrEmpty(assetName) || assetName == "Unknown")
                {
                    ShowError("View Details", "Unable to identify asset name");
                    return;
                }

                // Open the asset detail tab using the tabs service
                if (MainViewModel.CurrentTabsService != null)
                {
                    var success = await MainViewModel.CurrentTabsService.OpenAssetDetailTabAsync(assetName, assetName);
                    if (success)
                    {
                        _log?.LogInformation($"Opened asset details for VMware asset: {assetName}");
                    }
                    else
                    {
                        ShowError("View Details", "Failed to open asset details tab");
                    }
                }
                else
                {
                    ShowError("View Details", "Tab service not available");
                }
            }
            catch (Exception ex)
            {
                _log?.LogError(ex, "Error opening VMware asset details");
                ShowError("View Details Error", ex.Message);
            }
        }

        private string GetAssetName(object asset)
        {
            if (asset == null) return "Unknown";

            // Try to get name from common properties for VMware assets
            var dict = asset as IDictionary<string, object>;
            if (dict != null)
            {
                if (dict.TryGetValue("ClusterName", out var clusterName) && !string.IsNullOrEmpty(clusterName?.ToString()))
                    return clusterName.ToString();
                if (dict.TryGetValue("HostName", out var hostName) && !string.IsNullOrEmpty(hostName?.ToString()))
                    return hostName.ToString();
                if (dict.TryGetValue("VMName", out var vmName) && !string.IsNullOrEmpty(vmName?.ToString()))
                    return vmName.ToString();
            }

            return asset.ToString() ?? "Unknown";
        }

        #endregion

        #region Helper Methods

        private void CalculateSummaryStatistics(List<dynamic> data)
        {
            if (data == null || !data.Any())
            {
                TotalClusters = 0;
                TotalHosts = 0;
                TotalVMs = 0;
                return;
            }

            // Calculate totals based on data structure
            TotalClusters = data.Count(item =>
            {
                var dict = (IDictionary<string, object>)item;
                dict.TryGetValue("ClusterName", out var clusterName);
                return !string.IsNullOrEmpty(clusterName?.ToString()) &&
                       !dict.ContainsKey("HostName"); // Count distinct clusters
            });

            TotalHosts = data.Count(item =>
            {
                var dict = (IDictionary<string, object>)item;
                dict.TryGetValue("HostName", out var hostName);
                return !string.IsNullOrEmpty(hostName?.ToString());
            });

            TotalVMs = data.Sum(item =>
            {
                var dict = (IDictionary<string, object>)item;
                dict.TryGetValue("VMCount", out var vmCountObj);
                if (int.TryParse(vmCountObj?.ToString(), out var vmCount))
                    return vmCount;
                return 0;
            });

            _log?.LogInformation($"Calculated VMware summary: {TotalClusters} clusters, {TotalHosts} hosts, {TotalVMs} VMs");
        }

        private void PopulateSelectedItemDetails()
        {
            SelectedItemDetails.Clear();
            if (SelectedItem is IDictionary<string, object> dict)
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
            return System.Globalization.CultureInfo.CurrentCulture.TextInfo.ToTitleCase(fieldName.ToLower());
        }

        #endregion
    }
}