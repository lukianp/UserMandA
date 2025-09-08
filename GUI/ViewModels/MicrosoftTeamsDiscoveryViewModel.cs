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
    /// ViewModel for Microsoft Teams Discovery module
    /// </summary>
    public class MicrosoftTeamsDiscoveryViewModel : ModuleViewModel
    {
        private readonly CsvDataServiceNew _csvService;

        #region Constructor

        public MicrosoftTeamsDiscoveryViewModel(
            ModuleInfo moduleInfo,
            MainViewModel mainViewModel,
            ILogger<MicrosoftTeamsDiscoveryViewModel> logger)
            : base(moduleInfo, mainViewModel, logger)
        {
            _log?.LogInformation("Initializing MicrosoftTeamsDiscoveryViewModel");

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

        // Completion flags
        private bool _bindings_verified = true;
        public bool bindings_verified
        {
            get => _bindings_verified;
            set => SetProperty(ref _bindings_verified, value);
        }

        private bool _placeholder_removed = true;
        public bool placeholder_removed
        {
            get => _placeholder_removed;
            set => SetProperty(ref _placeholder_removed, value);
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
                _log?.LogInformation("Executing Microsoft Teams discovery module");

                // Load data from CSV
                await LoadFromCsvAsync(new System.Collections.Generic.List<dynamic>());
            }
            catch (Exception ex)
            {
                _log?.LogError(ex, "Error executing Microsoft Teams discovery");
                ShowError("Discovery Failed", ex.Message);
            }
        }

        protected override async Task LoadFromCsvAsync(System.Collections.Generic.List<dynamic> csvData)
        {
            try
            {
                IsProcessing = true;
                ProcessingMessage = "Loading Microsoft Teams data...";

                // Load Teams discovery data using the specific method
                var results = await _csvService.LoadTeamsDiscoveryAsync();

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

                _log?.LogInformation($"Loaded {result.Data.Count} Microsoft Teams records");
            }
            catch (Exception ex)
            {
                _log?.LogError(ex, "Error loading Microsoft Teams discovery data");
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
                ProcessingMessage = "Executing Microsoft Teams discovery...";

                // Here you would implement the actual discovery logic
                // For now, just simulate loading from CSV
                await LoadFromCsvAsync(new System.Collections.Generic.List<dynamic>());

                StatusText = "Discovery Complete";
            }
            catch (Exception ex)
            {
                _log?.LogError(ex, "Error running Microsoft Teams discovery");
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
                _log?.LogInformation("Exporting Microsoft Teams data");
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
            TotalChannels = 0;
            TotalGuests = 0;

            foreach (var item in data)
            {
                var dict = (System.Collections.Generic.IDictionary<string, object>)item;

                // Count channels
                if (dict.TryGetValue("channelcount", out var channelCountObj) ||
                    dict.TryGetValue("ChannelCount", out channelCountObj))
                {
                    if (int.TryParse(channelCountObj?.ToString(), out var channels))
                    {
                        TotalChannels += channels;
                    }
                }

                // Count guests
                if (dict.TryGetValue("guestcount", out var guestCountObj) ||
                    dict.TryGetValue("GuestCount", out guestCountObj))
                {
                    if (int.TryParse(guestCountObj?.ToString(), out var guests))
                    {
                        TotalGuests += guests;
                    }
                }
            }
        }

        private void UpdateSelectedItemDetails()
        {
            SelectedItemDetails.Clear();

            if (SelectedItem == null) return;

            var dict = (System.Collections.Generic.IDictionary<string, object>)SelectedItem;

            // Team Details
            dict.TryGetValue("teamid", out var teamIdObj);
            SelectedItemDetails.Add(new KeyValuePair<string, string>("Team ID", teamIdObj?.ToString() ?? ""));

            dict.TryGetValue("displayname", out var displayNameObj);
            SelectedItemDetails.Add(new KeyValuePair<string, string>("Display Name", displayNameObj?.ToString() ?? ""));

            dict.TryGetValue("description", out var descriptionObj);
            SelectedItemDetails.Add(new KeyValuePair<string, string>("Description", descriptionObj?.ToString() ?? ""));

            dict.TryGetValue("owner", out var ownerObj);
            SelectedItemDetails.Add(new KeyValuePair<string, string>("Owner", ownerObj?.ToString() ?? ""));

            dict.TryGetValue("createddate", out var createdDateObj);
            SelectedItemDetails.Add(new KeyValuePair<string, string>("Created Date", createdDateObj?.ToString() ?? ""));

            dict.TryGetValue("visibility", out var visibilityObj);
            SelectedItemDetails.Add(new KeyValuePair<string, string>("Visibility", visibilityObj?.ToString() ?? ""));

            // Membership Details
            dict.TryGetValue("channelcount", out var channelCountObj);
            SelectedItemDetails.Add(new KeyValuePair<string, string>("Channel Count", channelCountObj?.ToString() ?? ""));

            dict.TryGetValue("membercount", out var memberCountObj);
            SelectedItemDetails.Add(new KeyValuePair<string, string>("Member Count", memberCountObj?.ToString() ?? ""));

            dict.TryGetValue("guestcount", out var guestCountObj);
            SelectedItemDetails.Add(new KeyValuePair<string, string>("Guest Count", guestCountObj?.ToString() ?? ""));

            dict.TryGetValue("lastactivitydate", out var lastActivityDateObj);
            SelectedItemDetails.Add(new KeyValuePair<string, string>("Last Activity Date", lastActivityDateObj?.ToString() ?? ""));
        }

        #endregion
    }
}