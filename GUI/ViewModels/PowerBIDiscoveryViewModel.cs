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
    /// ViewModel for PowerBI Discovery module
    /// </summary>
    public class PowerBIDiscoveryViewModel : ModuleViewModel
    {
        private readonly CsvDataServiceNew _csvService;

        #region Constructor

        public PowerBIDiscoveryViewModel(
            ModuleInfo moduleInfo,
            MainViewModel mainViewModel,
            ILogger<PowerBIDiscoveryViewModel> logger)
            : base(moduleInfo, mainViewModel, logger)
        {
            _log?.LogInformation("Initializing PowerBIDiscoveryViewModel");

            // Get CSV service
            var loggerFactory = Microsoft.Extensions.Logging.LoggerFactory.Create(builder => builder.AddConsole());
            var csvLogger = loggerFactory.CreateLogger<CsvDataServiceNew>();
            _csvService = new CsvDataServiceNew(csvLogger);
        }

        #endregion

        #region Properties

        // Summary card properties
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

        private int _totalDashboards;
        public int TotalDashboards
        {
            get => _totalDashboards;
            set => SetProperty(ref _totalDashboards, value);
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
            set => SetProperty(ref _selectedItem, value);
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

                // Load from specific CSV path
                var csvPath = @"C:\discoverydata\ljpops\Raw\PowerBIDiscovery.csv";
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

                // Implement export logic here
                _log?.LogInformation("Exporting PowerBI data");
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
            TotalReports = 0;
            TotalDatasets = 0;
            TotalDashboards = 0;

            foreach (var item in data)
            {
                var dict = (System.Collections.Generic.IDictionary<string, object>)item;

                // Count by content type
                if (dict.TryGetValue("contenttype", out var contentTypeObj))
                {
                    var contentType = contentTypeObj?.ToString().ToLower();
                    if (contentType == "report") TotalReports++;
                    else if (contentType == "dataset") TotalDatasets++;
                    else if (contentType == "dashboard") TotalDashboards++;
                }
            }
        }

        #endregion
    }
}