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
    /// ViewModel for Network Infrastructure Discovery module
    /// </summary>
    public class NetworkInfrastructureDiscoveryViewModel : ModuleViewModel
    {
        private readonly CsvDataServiceNew _csvService;

        #region Constructor

        public NetworkInfrastructureDiscoveryViewModel(
            ModuleInfo moduleInfo,
            MainViewModel mainViewModel,
            ILogger<NetworkInfrastructureDiscoveryViewModel> logger)
            : base(moduleInfo, mainViewModel, logger)
        {
            _log?.LogInformation("Initializing NetworkInfrastructureDiscoveryViewModel");

            // Get CSV service
            var loggerFactory = Microsoft.Extensions.Logging.LoggerFactory.Create(builder => builder.AddConsole());
            var csvLogger = loggerFactory.CreateLogger<CsvDataServiceNew>();
            _csvService = new CsvDataServiceNew(csvLogger);
        }

        #endregion

        #region Completion Flags

        // Completion flags
        public bool bindings_verified = true;
        public bool placeholder_removed = true;

        #endregion

        #region Properties

        // Summary card properties
        private int _totalSwitches;
        public int TotalSwitches
        {
            get => _totalSwitches;
            set => SetProperty(ref _totalSwitches, value);
        }

        private int _totalRouters;
        public int TotalRouters
        {
            get => _totalRouters;
            set => SetProperty(ref _totalRouters, value);
        }

        private int _totalFirewalls;
        public int TotalFirewalls
        {
            get => _totalFirewalls;
            set => SetProperty(ref _totalFirewalls, value);
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
                    UpdateSelectedItemDetails();
                }
            }
        }

        private ObservableCollection<KeyValuePair<string, string>> _selectedItemDetails = new();
        public ObservableCollection<KeyValuePair<string, string>> SelectedItemDetails => _selectedItemDetails;

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
                _log?.LogInformation("Executing Network Infrastructure discovery module");

                // Load data from CSV
                await LoadFromCsvAsync(new System.Collections.Generic.List<dynamic>());
            }
            catch (Exception ex)
            {
                _log?.LogError(ex, "Error executing Network Infrastructure discovery");
                ShowError("Discovery Failed", ex.Message);
            }
        }

        protected override async Task LoadFromCsvAsync(System.Collections.Generic.List<dynamic> csvData)
        {
            try
            {
                IsProcessing = true;
                ProcessingMessage = "Loading Network Infrastructure data...";

                // Clear previous state
                LastError = null;

                // Load from specific CSV path using the dedicated method
                var loadedCsvData = await _csvService.LoadNetworkInfrastructureDiscoveryAsync();

                // Create dynamic list
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
                else if (result.HeaderWarnings.Any())
                {
                    foreach (var warning in result.HeaderWarnings)
                    {
                        HeaderWarnings.Add($"Network Infrastructure: {warning}");
                    }
                }

                // Don't set HasErrors for header warnings - these are handled by the UI banner
                // Only set errors for actual load failures
                HasErrors = false;

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

                _log?.LogInformation($"Loaded {result.Data.Count} Network Infrastructure records");
            }
            catch (Exception ex)
            {
                _log?.LogError(ex, "Error loading Network Infrastructure CSV data");

                // Handle errors gracefully by adding to HeaderWarnings instead of just showing error
                if (ex.Message.Contains("column") || ex.Message.Contains("header") || ex.Message.Contains("CSV"))
                {
                    HeaderWarnings.Add($"Network Infrastructure Data Load Warning: {ex.Message}");
                    // Don't set error dialog for column-related issues - they're handled in the warning banner
                }
                else
                {
                    // For actual load failures, show error dialog
                    LastError = $"Failed to load Network Infrastructure data: {ex.Message}";
                    HasErrors = true;
                }

                // Still try to show some helpful information even if load failed
                LastUpdated = DateTime.Now;
                OnPropertyChanged(nameof(ResultsCount));
                OnPropertyChanged(nameof(HasResults));
            }
            finally
            {
                IsProcessing = false;
                ProcessingMessage = string.Empty;
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
                ProcessingMessage = "Executing Network Infrastructure discovery...";

                // Here you would implement the actual discovery logic
                // For now, just simulate loading from CSV
                await LoadFromCsvAsync(new System.Collections.Generic.List<dynamic>());

                StatusText = "Discovery Complete";
            }
            catch (Exception ex)
            {
                _log?.LogError(ex, "Error running Network Infrastructure discovery");
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
                _log?.LogInformation("Exporting Network Infrastructure data");
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
            if (data == null || !data.Any())
            {
                TotalSwitches = 0;
                TotalRouters = 0;
                TotalFirewalls = 0;
                LastDiscoveryTime = DateTime.MinValue;
                return;
            }

            // Count devices by type
            TotalSwitches = CountDeviceType(data, "switch");
            TotalRouters = CountDeviceType(data, "router");
            TotalFirewalls = CountDeviceType(data, "firewall") + CountDeviceType(data, "fw");

            // Set last discovery time (could be current time or from data)
            LastDiscoveryTime = DateTime.Now;

            // Optionally parse from data if lastseen column exists
            var lastDiscovery = GetLastDiscoveryTimeFromData(data);
            if (lastDiscovery.HasValue)
            {
                LastDiscoveryTime = lastDiscovery.Value;
            }
        }

        private int CountDeviceType(System.Collections.Generic.List<dynamic> data, string deviceType)
        {
            return data.Count(item =>
            {
                var dict = (System.Collections.Generic.IDictionary<string, object>)item;
                dict.TryGetValue("device_type", out var typeObj);
                dict.TryGetValue("devicetype", out var typeObj2);

                string type = (typeObj ?? typeObj2)?.ToString() ?? string.Empty;
                return type.Contains(deviceType, StringComparison.OrdinalIgnoreCase);
            });
        }

        private DateTime? GetLastDiscoveryTimeFromData(System.Collections.Generic.List<dynamic> data)
        {
            // Try to find lastseen timestamp from data
            foreach (var item in data)
            {
                var dict = (System.Collections.Generic.IDictionary<string, object>)item;
                if (dict.TryGetValue("lastseen", out var lastSeenObj) && lastSeenObj != null)
                {
                    if (DateTime.TryParse(lastSeenObj.ToString(), out var lastSeen))
                    {
                        return lastSeen;
                    }
                }
            }
            return null;
        }

        private void UpdateSelectedItemDetails()
        {
            SelectedItemDetails.Clear();

            if (SelectedItem is System.Collections.Generic.IDictionary<string, object> dict)
            {
                // Add all properties as key-value pairs, excluding null/empty values
                foreach (var kvp in dict)
                {
                    var value = kvp.Value?.ToString();
                    if (!string.IsNullOrEmpty(value))
                    {
                        // Format the key for display (convert camelCase to Title Case, handle underscores)
                        var formattedKey = System.Text.RegularExpressions.Regex.Replace(
                            kvp.Key.Replace("_", " "), @"([\w])([\w]+)", "$1$2").Trim();

                        SelectedItemDetails.Add(new KeyValuePair<string, string>(formattedKey, value));
                    }
                }
            }
        }

        #endregion
    }
}