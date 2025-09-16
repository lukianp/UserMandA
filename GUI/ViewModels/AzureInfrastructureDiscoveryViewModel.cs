using System;
using System.Collections.ObjectModel;
using System.Collections.Generic;
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
    /// ViewModel for Azure Infrastructure Discovery module
    /// </summary>
    public class AzureInfrastructureDiscoveryViewModel : ModuleViewModel
    {
        private readonly CsvDataServiceNew _csvService;

        #region Constructor

        public AzureInfrastructureDiscoveryViewModel(
            ModuleInfo moduleInfo,
            MainViewModel mainViewModel,
            ILogger<AzureInfrastructureDiscoveryViewModel> logger)
            : base(moduleInfo, mainViewModel, logger)
        {
            _log?.LogInformation("Initializing AzureInfrastructureDiscoveryViewModel");

            // Get CSV service
            var loggerFactory = Microsoft.Extensions.Logging.LoggerFactory.Create(builder => builder.AddConsole());
            var csvLogger = loggerFactory.CreateLogger<CsvDataServiceNew>();
            _csvService = new CsvDataServiceNew(csvLogger);
        }

        #endregion

        #region Properties

        // Summary card properties
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

        private int _totalVMs;
        public int TotalVMs
        {
            get => _totalVMs;
            set => SetProperty(ref _totalVMs, value);
        }

        private int _totalStorage;
        public int TotalStorage
        {
            get => _totalStorage;
            set => SetProperty(ref _totalStorage, value);
        }

        private int _totalStorageAccounts;
        public int TotalStorageAccounts
        {
            get => _totalStorageAccounts;
            set => SetProperty(ref _totalStorageAccounts, value);
        }

        private int _totalResourceGroups;
        public int TotalResourceGroups
        {
            get => _totalResourceGroups;
            set => SetProperty(ref _totalResourceGroups, value);
        }

        // Base template properties
        public string ModuleIcon => "☁️";
        public string ModuleTitle => "Azure Infrastructure Discovery";
        public string ModuleDescription => "Discover and manage Azure resources and infrastructure";
        public int TotalRecords => TotalResources;
        public int ActiveRecords => TotalVMs;
        // Explicitly hide inherited LastUpdated property with module-specific implementation
        public new DateTime LastUpdated { get; set; }
        public string DiscoveryStatus => "Ready";

        // Details panel properties
        public ObservableCollection<KeyValuePair<string, string>> SelectedItemTags { get; } = new ObservableCollection<KeyValuePair<string, string>>();
        public decimal SelectedItemCost { get; set; }

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
                    UpdateSelectedItemDetails();
                }
            }
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
                _log?.LogInformation("Executing Azure Infrastructure discovery module");

                // Load data from CSV
                await LoadFromCsvAsync(new System.Collections.Generic.List<dynamic>());
            }
            catch (Exception ex)
            {
                _log?.LogError(ex, "Error executing Azure Infrastructure discovery");
                ShowError("Discovery Failed", ex.Message);
            }
        }

        protected override async Task LoadFromCsvAsync(System.Collections.Generic.List<dynamic> csvData)
        {
            try
            {
                IsProcessing = true;
                ProcessingMessage = "Loading Azure Infrastructure data...";

                // Load from specific CSV path
                var csvPath = @"C:\discoverydata\ljpops\Raw\AzureInfrastructureDiscovery.csv";
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

                _log?.LogInformation($"Loaded {result.Data.Count} Azure Infrastructure records");
            }
            catch (Exception ex)
            {
                _log?.LogError(ex, "Error loading Azure Infrastructure CSV data");
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
                ProcessingMessage = "Executing Azure Infrastructure discovery...";

                // Here you would implement the actual discovery logic
                // For now, just simulate loading from CSV
                await LoadFromCsvAsync(new System.Collections.Generic.List<dynamic>());

                StatusText = "Discovery Complete";
            }
            catch (Exception ex)
            {
                _log?.LogError(ex, "Error running Azure Infrastructure discovery");
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
                _log?.LogInformation("Exporting Azure Infrastructure data");
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
            TotalResources = data.Count;
            // Specific calculations based on Azure data structure
            TotalVMs = data.Count(item =>
            {
                var dict = (System.Collections.Generic.IDictionary<string, object>)item;
                dict.TryGetValue("resourcetype", out var resourceTypeObj);
                return resourceTypeObj?.ToString().Contains("Microsoft.Compute/virtualMachines") ?? false;
            });

            TotalStorageAccounts = data.Count(item =>
            {
                var dict = (System.Collections.Generic.IDictionary<string, object>)item;
                dict.TryGetValue("resourcetype", out var resourceTypeObj);
                return resourceTypeObj?.ToString().Contains("Microsoft.Storage/storageAccounts") ?? false;
            });

            TotalResourceGroups = data.Select(item =>
            {
                var dict = (System.Collections.Generic.IDictionary<string, object>)item;
                dict.TryGetValue("resourcegroup", out var rg);
                return rg?.ToString();
            }).Distinct().Count(rg => !string.IsNullOrEmpty(rg));
        }

        private void UpdateSelectedItemDetails()
        {
            SelectedItemTags.Clear();
            SelectedItemCost = 0;

            if (SelectedItem is System.Collections.Generic.IDictionary<string, object> dict)
            {
                // Tags - assume tags is a string like "key1=value1,key2=value2" or dictionary
                if (dict.TryGetValue("tags", out var tagsObj))
                {
                    var tagsStr = tagsObj?.ToString();
                    if (!string.IsNullOrEmpty(tagsStr))
                    {
                        // Simple parsing, assuming comma-separated key=value pairs
                        var pairs = tagsStr.Split(',');
                        foreach (var pair in pairs)
                        {
                            var kv = pair.Split('=');
                            if (kv.Length == 2)
                            {
                                SelectedItemTags.Add(new KeyValuePair<string, string>(kv[0].Trim(), kv[1].Trim()));
                            }
                        }
                    }
                }

                // Cost
                if (dict.TryGetValue("cost", out var costObj))
                {
                    decimal.TryParse(costObj?.ToString(), out var cost);
                    SelectedItemCost = cost;
                }
            }

            OnPropertyChanged(nameof(SelectedItemTags));
            OnPropertyChanged(nameof(SelectedItemCost));
        }

        #endregion
    }
}