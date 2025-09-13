using System;
using System.Collections.ObjectModel;
using System.Linq;
using System.Threading.Tasks;
using MandADiscoverySuite.Services;
using MandADiscoverySuite.Models;
using Microsoft.Extensions.Logging;
using CommunityToolkit.Mvvm.Input;

namespace MandADiscoverySuite.ViewModels
{
    public class WebServerConfigurationDiscoveryViewModel : ModuleViewModel
    {
        private readonly CsvDataServiceNew _csvService;

        public WebServerConfigurationDiscoveryViewModel(
            ModuleInfo moduleInfo,
            MainViewModel mainViewModel,
            ILogger<WebServerConfigurationDiscoveryViewModel> logger)
            : base(moduleInfo, mainViewModel, logger)
        {
            var loggerFactory = Microsoft.Extensions.Logging.LoggerFactory.Create(builder => builder.AddConsole());
            var csvLogger = loggerFactory.CreateLogger<CsvDataServiceNew>();
            _csvService = new CsvDataServiceNew(csvLogger);
        }

        // Properties
        private int _totalServers;
        public int TotalServers { get => _totalServers; set => SetProperty(ref _totalServers, value); }

        private int _totalWebsites;
        public int TotalWebsites { get => _totalWebsites; set => SetProperty(ref _totalWebsites, value); }

        private int _totalConfigurations;
        public int TotalConfigurations { get => _totalConfigurations; set => SetProperty(ref _totalConfigurations, value); }

        public ObservableCollection<dynamic> SelectedResults { get; } = new();
        private object _selectedItem;
        public object SelectedItem { get => _selectedItem; set => SetProperty(ref _selectedItem, value); }

        // Commands
        public AsyncRelayCommand RunDiscoveryCommand => new AsyncRelayCommand(RunDiscoveryAsync);
        public AsyncRelayCommand RefreshDataCommand => new AsyncRelayCommand(RefreshDataAsync);
        public AsyncRelayCommand ExportCommand => new AsyncRelayCommand(ExportDataAsync);
        public AsyncRelayCommand<object> ViewDetailsCommand => new AsyncRelayCommand<object>(ViewDetailsAsync);

        // Overrides
        protected override async Task ExecuteModuleAsync()
        {
            try
            {
                _log?.LogInformation("Executing Web Server discovery module");
                await LoadFromCsvAsync(new System.Collections.Generic.List<dynamic>());
            }
            catch (Exception ex)
            {
                _log?.LogError(ex, "Error executing Web Server discovery");
                ShowError("Discovery Failed", ex.Message);
            }
        }

        protected override async Task LoadFromCsvAsync(System.Collections.Generic.List<dynamic> csvData)
        {
            try
            {
                IsProcessing = true;
                ProcessingMessage = "Loading Web Server data...";

                var csvPath = @"C:\discoverydata\ljpops\Raw\WebServerConfigurationDiscovery.csv";
                var loadedCsvData = await _csvService.LoadCsvDataAsync(csvPath);

                var results = new System.Collections.Generic.List<dynamic>();
                foreach (var item in loadedCsvData) results.Add(item);
                var result = DataLoaderResult<dynamic>.Success(results, new System.Collections.Generic.List<string>());

                // Apply HeaderWarnings logic
                if (result.Data.Any())
                {
                    HeaderWarnings.Clear();
                }

                SelectedResults.Clear();
                foreach (var item in result.Data) SelectedResults.Add(item);
                CalculateSummaryStatistics(result.Data);
                LastUpdated = DateTime.Now;
                OnPropertyChanged(nameof(ResultsCount));
                OnPropertyChanged(nameof(HasResults));
                _log?.LogInformation($"Loaded {result.Data.Count} Web Server records");
            }
            catch (Exception ex)
            {
                _log?.LogError(ex, "Error loading Web Server CSV data");
                ShowError("Data Load Failed", ex.Message);
            }
            finally
            {
                IsProcessing = false;
            }
        }

        private async Task RunDiscoveryAsync()
        {
            try
            {
                IsProcessing = true;
                StatusText = "Running Discovery";
                ProcessingMessage = "Executing Web Server discovery...";
                await LoadFromCsvAsync(new System.Collections.Generic.List<dynamic>());
                StatusText = "Discovery Complete";
            }
            catch (Exception ex)
            {
                _log?.LogError(ex, "Error running Web Server discovery");
                ShowError("Discovery Error", ex.Message);
            }
            finally
            {
                IsProcessing = false;
            }
        }

        private async Task RefreshDataAsync()
        {
            try { await LoadFromCsvAsync(new System.Collections.Generic.List<dynamic>()); }
            catch (Exception ex) { _log?.LogError(ex, "Error refreshing data"); ShowError("Refresh Failed", ex.Message); }
        }

        private async Task ExportDataAsync()
        {
            try
            {
                if (SelectedResults.Count == 0) { ShowInformation("No data to export"); return; }
                _log?.LogInformation("Exporting Web Server data");
                await Task.CompletedTask;
            }
            catch (Exception ex) { _log?.LogError(ex, "Error exporting data"); ShowError("Export Failed", ex.Message); }
        }


        private void CalculateSummaryStatistics(System.Collections.Generic.List<dynamic> data)
        {
            int serverCount = 0;
            int websiteCount = 0;
            int configCount = 0;

            foreach (var item in data)
            {
                var dict = (System.Collections.Generic.IDictionary<string, object>)item;

                // Count servers based on ObjectType
                string objectType = "";
                dict.TryGetValue("ObjectType", out var objectTypeObj);
                if (objectTypeObj != null)
                {
                    objectType = objectTypeObj.ToString();
                    if (objectType.Contains("Site") || objectType.Contains("Application") || objectType.Contains("Installation"))
                        serverCount++;

                    if (objectType.Contains("Site") || objectType.Contains("VirtualHost") || objectType.Contains("Website"))
                        websiteCount++;

                    if (objectType.Contains("Config"))
                        configCount++;
                }
            }

            TotalServers = serverCount;
            TotalWebsites = websiteCount;
            TotalConfigurations = configCount;
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
                        _log?.LogInformation($"Opened asset details for web server asset: {assetName}");
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
                _log?.LogError(ex, "Error opening web server asset details");
                ShowError("View Details Error", ex.Message);
            }
        }

        private string GetAssetName(object asset)
        {
            if (asset == null) return "Unknown";

            // Try to get name from common properties for web server assets
            var dict = asset as System.Collections.Generic.IDictionary<string, object>;
            if (dict != null)
            {
                if (dict.TryGetValue("Name", out var name) && !string.IsNullOrEmpty(name?.ToString()))
                    return name.ToString();
                if (dict.TryGetValue("ObjectType", out var objectType) && !string.IsNullOrEmpty(objectType?.ToString()))
                    return objectType.ToString();
            }

            return asset.ToString() ?? "Unknown";
        }
    }
}