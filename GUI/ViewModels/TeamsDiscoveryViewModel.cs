using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Linq;
using System.Threading.Tasks;
using MandADiscoverySuite.Services;
using MandADiscoverySuite.Models;
using Microsoft.Extensions.Logging;
using CommunityToolkit.Mvvm.Input;

namespace MandADiscoverySuite.ViewModels
{
    /// <summary>
    /// ViewModel for Teams Discovery module
    /// </summary>
    public class TeamsDiscoveryViewModel : ModuleViewModel
    {
        private readonly CsvDataServiceNew _csvService;

        #region Constructor

        public TeamsDiscoveryViewModel(
            ModuleInfo moduleInfo,
            MainViewModel mainViewModel,
            ILogger<TeamsDiscoveryViewModel> logger)
            : base(moduleInfo, mainViewModel, logger)
        {
            _log?.LogInformation("Initializing TeamsDiscoveryViewModel");

            // Get CSV service
            var loggerFactory = Microsoft.Extensions.Logging.LoggerFactory.Create(builder => builder.AddConsole());
            var csvLogger = loggerFactory.CreateLogger<CsvDataServiceNew>();
            _csvService = new CsvDataServiceNew(csvLogger);
        }

        #endregion

        #region Properties

        // Summary card properties
        private int _totalTeams;
        public int TotalTeams
        {
            get => _totalTeams;
            set => SetProperty(ref _totalTeams, value);
        }

        private DateTime _lastDiscoveryTime = DateTime.MinValue;
        public DateTime LastDiscoveryTime
        {
            get => _lastDiscoveryTime;
            set => SetProperty(ref _lastDiscoveryTime, value);
        }

        private int _totalChannels;
        public int TotalChannels
        {
            get => _totalChannels;
            set => SetProperty(ref _totalChannels, value);
        }

        private int _totalGuests;
        public int TotalGuests
        {
            get => _totalGuests;
            set => SetProperty(ref _totalGuests, value);
        }

        // Data binding collections
        public ObservableCollection<dynamic> SelectedResults { get; } = new ObservableCollection<dynamic>();

        private object _selectedItem;
        public object SelectedItem
        {
            get => _selectedItem;
            set
            {
                SetProperty(ref _selectedItem, value);
                UpdateSelectedItemDetails();
            }
        }

        private void UpdateSelectedItemDetails()
        {
            SelectedItemDetails.Clear();
            if (SelectedItem is not IDictionary<string, object> selectedDict)
                return;

            foreach (var kvp in selectedDict)
            {
                // Format key for display
                var displayKey = FormatPropertyName(kvp.Key);
                var displayValue = kvp.Value?.ToString() ?? "N/A";

                // Format dates
                if (kvp.Key.Contains("date", StringComparison.OrdinalIgnoreCase) && kvp.Value is string dateStr)
                {
                    if (DateTime.TryParse(dateStr, out var date))
                        displayValue = date.ToString("MMM dd, yyyy HH:mm:ss");
                }

                SelectedItemDetails.Add(new KeyValuePair<string, string>(displayKey, displayValue));
            }
        }

        private string FormatPropertyName(string propertyName)
        {
            return propertyName switch
            {
                "teamname" => "Team Name",
                "channelcount" => "Channel Count",
                "membercount" => "Member Count",
                "createddate" => "Created Date",
                "visibility" => "Visibility",
                "description" => "Description",
                "owner" => "Owner",
                _ => propertyName
            };
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
                _log?.LogInformation("Executing Teams discovery module");

                // Load data from CSV
                await LoadFromCsvAsync(new System.Collections.Generic.List<dynamic>());
            }
            catch (Exception ex)
            {
                _log?.LogError(ex, "Error executing Teams discovery");
                ShowError("Discovery Failed", ex.Message);
            }
        }

        protected override async Task LoadFromCsvAsync(System.Collections.Generic.List<dynamic> csvData)
        {
            try
            {
                IsProcessing = true;
                ProcessingMessage = "Loading Teams data...";

                // Load from specific CSV path
                var csvPath = @"C:\discoverydata\ljpops\Raw\TeamsDiscovery.csv";
                var loadedCsvData = await _csvService.LoadCsvDataAsync(csvPath);

                // Convert to dynamic list
                var results = new System.Collections.Generic.List<dynamic>();
                foreach (var item in loadedCsvData)
                {
                    results.Add(item);
                }

                var result = DataLoaderResult<dynamic>.Success(results, new System.Collections.Generic.List<string>());

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

                _log?.LogInformation($"Loaded {result.Data.Count} Teams records");
            }
            catch (Exception ex)
            {
                _log?.LogError(ex, "Error loading Teams CSV data");
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
                ProcessingMessage = "Executing Teams discovery...";

                // Simulate loading from CSV
                await LoadFromCsvAsync(new System.Collections.Generic.List<dynamic>());

                StatusText = "Discovery Complete";
            }
            catch (Exception ex)
            {
                _log?.LogError(ex, "Error running Teams discovery");
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

                // Export logic
                _log?.LogInformation("Exporting Teams data");
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
            TotalTeams = data.Count;

            // Calculate channels and members/guests from the CSV data
            var channelCount = 0;
            var memberCount = 0;

            foreach (var item in data)
            {
                if (item is System.Collections.Generic.IDictionary<string, object> dict)
                {
                    // Count channels by looking at channelcount field (if it represents the number of channels per team)
                    if (dict.TryGetValue("channelcount", out var channelCountObj))
                    {
                        if (int.TryParse(channelCountObj.ToString(), out var cc))
                            channelCount += cc;
                    }

                    // Count members/guests
                    if (dict.TryGetValue("membercount", out var memberCountObj))
                    {
                        if (int.TryParse(memberCountObj.ToString(), out var mc))
                            memberCount += mc;
                    }
                }
            }

            TotalChannels = channelCount;
            TotalGuests = memberCount;

            // Set discovery time after loading
            if (LastDiscoveryTime == DateTime.MinValue)
                LastDiscoveryTime = DateTime.Now;
        }

        #endregion
    }
}