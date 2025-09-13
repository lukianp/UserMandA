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
    }
}