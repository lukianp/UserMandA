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
    /// ViewModel for Application Discovery module
    /// </summary>
    public class ApplicationDiscoveryViewModel : ModuleViewModel
    {
        private readonly CsvDataServiceNew _csvService;

        #region Constructor

        public ApplicationDiscoveryViewModel(
            ModuleInfo moduleInfo,
            MainViewModel mainViewModel,
            ILogger<ApplicationDiscoveryViewModel> logger)
            : base(moduleInfo, mainViewModel, logger)
        {
            _log?.LogInformation("Initializing ApplicationDiscoveryViewModel");

            // Get CSV service
            var loggerFactory = Microsoft.Extensions.Logging.LoggerFactory.Create(builder => builder.AddConsole());
            var csvLogger = loggerFactory.CreateLogger<CsvDataServiceNew>();
            _csvService = new CsvDataServiceNew(csvLogger);
        }

        #endregion

        #region Properties

        // Summary card properties
        private int _totalApplications;
        public int TotalApplications
        {
            get => _totalApplications;
            set => SetProperty(ref _totalApplications, value);
        }

        private int _webApplications;
        public int WebApplications
        {
            get => _webApplications;
            set => SetProperty(ref _webApplications, value);
        }

        private int _windowsApplications;
        public int WindowsApplications
        {
            get => _windowsApplications;
            set => SetProperty(ref _windowsApplications, value);
        }

        private int _services;
        public int Services
        {
            get => _services;
            set => SetProperty(ref _services, value);
        }

        private DateTime _lastDiscovery = DateTime.MinValue;
        public DateTime LastDiscovery
        {
            get => _lastDiscovery;
            set => SetProperty(ref _lastDiscovery, value);
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

        // Properties for template binding
        public string ModuleIcon => Icon;
        public string ModuleTitle => DisplayName;

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
                _log?.LogInformation("Executing Application discovery module");

                // Load data from CSV
                await LoadFromCsvAsync(new System.Collections.Generic.List<dynamic>());
            }
            catch (Exception ex)
            {
                _log?.LogError(ex, "Error executing Application discovery");
                ShowError("Discovery Failed", ex.Message);
            }
        }

        protected override async Task LoadFromCsvAsync(System.Collections.Generic.List<dynamic> csvData)
        {
            try
            {
                IsProcessing = true;
                ProcessingMessage = "Loading Application data...";

                // Load Application discovery data using the ApplicationsAsync method
                var appResult = await _csvService.LoadApplicationsAsync("default");
                var results = appResult.Data.Cast<dynamic>().ToList();

                var result = DataLoaderResult<dynamic>.Success(results, new List<string>());

                // Update collections and summary statistics
                SelectedResults.Clear();
                foreach (var item in result.Data)
                {
                    SelectedResults.Add(item);
                }

                // Calculate summary statistics
                CalculateSummaryStatistics(result.Data);

                // Set last discovery to now
                LastDiscovery = DateTime.Now;

                OnPropertyChanged(nameof(ResultsCount));
                OnPropertyChanged(nameof(HasResults));

                _log?.LogInformation($"Loaded {result.Data.Count} Application records");
            }
            catch (Exception ex)
            {
                _log?.LogError(ex, "Error loading Application discovery data");
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
                ProcessingMessage = "Executing Application discovery...";

                // Here you would implement the actual discovery logic
                // For now, just simulate loading from CSV
                await LoadFromCsvAsync(new System.Collections.Generic.List<dynamic>());

                StatusText = "Discovery Complete";
            }
            catch (Exception ex)
            {
                _log?.LogError(ex, "Error running Application discovery");
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
                _log?.LogInformation("Exporting Application data");
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
            TotalApplications = data.Count;

            // Count different types of applications
            WebApplications = 0;
            WindowsApplications = 0;
            Services = 0;

            foreach (var item in data)
            {
                var dict = (System.Collections.Generic.IDictionary<string, object>)item;

                // Categorize applications based on type
                if (dict.TryGetValue("type", out var typeObj) ||
                    dict.TryGetValue("Type", out typeObj))
                {
                    var type = typeObj?.ToString()?.ToLower() ?? "";
                    if (type.Contains("web"))
                        WebApplications++;
                    else if (type.Contains("windows") || type.Contains("desktop"))
                        WindowsApplications++;
                    else if (type.Contains("service"))
                        Services++;
                }
            }
        }

        private void UpdateSelectedItemDetails()
        {
            SelectedItemDetails.Clear();

            if (SelectedItem == null) return;

            var dict = (System.Collections.Generic.IDictionary<string, object>)SelectedItem;

            // Application Details
            dict.TryGetValue("name", out var nameObj);
            SelectedItemDetails.Add(new KeyValuePair<string, string>("Name", nameObj?.ToString() ?? ""));

            dict.TryGetValue("version", out var versionObj);
            SelectedItemDetails.Add(new KeyValuePair<string, string>("Version", versionObj?.ToString() ?? ""));

            dict.TryGetValue("publisher", out var publisherObj);
            SelectedItemDetails.Add(new KeyValuePair<string, string>("Publisher", publisherObj?.ToString() ?? ""));

            dict.TryGetValue("installdate", out var installDateObj);
            SelectedItemDetails.Add(new KeyValuePair<string, string>("Install Date", installDateObj?.ToString() ?? ""));

            dict.TryGetValue("size", out var sizeObj);
            SelectedItemDetails.Add(new KeyValuePair<string, string>("Size", sizeObj?.ToString() ?? ""));

            dict.TryGetValue("type", out var typeObj);
            SelectedItemDetails.Add(new KeyValuePair<string, string>("Type", typeObj?.ToString() ?? ""));

            dict.TryGetValue("description", out var descriptionObj);
            SelectedItemDetails.Add(new KeyValuePair<string, string>("Description", descriptionObj?.ToString() ?? ""));
        }

        #endregion
    }
}