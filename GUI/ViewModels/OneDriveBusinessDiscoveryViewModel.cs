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
    /// ViewModel for OneDrive Business Discovery module
    /// </summary>
    public class OneDriveBusinessDiscoveryViewModel : ModuleViewModel
    {
        private readonly CsvDataServiceNew _csvService;

        #region Constructor

        public OneDriveBusinessDiscoveryViewModel(
            ModuleInfo moduleInfo,
            MainViewModel mainViewModel,
            ILogger<OneDriveBusinessDiscoveryViewModel> logger)
            : base(moduleInfo, mainViewModel, logger)
        {
            _log?.LogInformation("Initializing OneDriveBusinessDiscoveryViewModel");

            // Get CSV service
            var loggerFactory = Microsoft.Extensions.Logging.LoggerFactory.Create(builder => builder.AddConsole());
            var csvLogger = loggerFactory.CreateLogger<CsvDataServiceNew>();
            _csvService = new CsvDataServiceNew(csvLogger);
        }

        #endregion

        #region Properties

        // Summary card properties
        private int _totalUsers;
        public int TotalUsers
        {
            get => _totalUsers;
            set => SetProperty(ref _totalUsers, value);
        }

        private int _totalFiles;
        public int TotalFiles
        {
            get => _totalFiles;
            set => SetProperty(ref _totalFiles, value);
        }

        private long _totalStorage;
        public long TotalStorage
        {
            get => _totalStorage;
            set => SetProperty(ref _totalStorage, value);
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
                _log?.LogInformation("Executing OneDrive Business discovery module");

                // Load data from CSV
                await LoadFromCsvAsync(new System.Collections.Generic.List<dynamic>());
            }
            catch (Exception ex)
            {
                _log?.LogError(ex, "Error executing OneDrive Business discovery");
                ShowError("Discovery Failed", ex.Message);
            }
        }

        protected override async Task LoadFromCsvAsync(System.Collections.Generic.List<dynamic> csvData)
        {
            try
            {
                IsProcessing = true;
                ProcessingMessage = "Loading OneDrive Business data...";

                // Load from specific CSV path
                var csvPath = @"C:\discoverydata\ljpops\Raw\OneDriveBusinessDiscovery.csv";
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

                _log?.LogInformation($"Loaded {result.Data.Count} OneDrive Business records");
            }
            catch (Exception ex)
            {
                _log?.LogError(ex, "Error loading OneDrive Business CSV data");
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
                ProcessingMessage = "Executing OneDrive Business discovery...";

                // Here you would implement the actual discovery logic
                // For now, just simulate loading from CSV
                await LoadFromCsvAsync(new System.Collections.Generic.List<dynamic>());

                StatusText = "Discovery Complete";
            }
            catch (Exception ex)
            {
                _log?.LogError(ex, "Error running OneDrive Business discovery");
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
                _log?.LogInformation("Exporting OneDrive Business data");
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
            TotalUsers = data.Count;
            TotalFiles = 0;
            TotalStorage = 0;

            foreach (var item in data)
            {
                var dict = (System.Collections.Generic.IDictionary<string, object>)item;

                // Count files
                if (dict.TryGetValue("filecount", out var fileCountObj) ||
                    dict.TryGetValue("FileCount", out fileCountObj))
                {
                    if (int.TryParse(fileCountObj?.ToString(), out var files))
                    {
                        TotalFiles += files;
                    }
                }

                // Sum storage
                if (dict.TryGetValue("storagesize", out var storageObj) ||
                    dict.TryGetValue("StorageSize", out storageObj) ||
                    dict.TryGetValue("storageused", out storageObj))
                {
                    if (long.TryParse(storageObj?.ToString(), out var storage))
                    {
                        TotalStorage += storage;
                    }
                }
            }
        }

        #endregion
    }
}