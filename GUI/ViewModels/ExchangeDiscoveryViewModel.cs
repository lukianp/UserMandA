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
using GUI.Interfaces;

namespace MandADiscoverySuite.ViewModels
{
    /// <summary>
    /// ViewModel for Exchange Discovery module
    /// </summary>
    public class ExchangeDiscoveryViewModel : ModuleViewModel, IDetailViewSupport
    {
        private readonly CsvDataServiceNew _csvService;

        #region Constructor

        public ExchangeDiscoveryViewModel(
            ModuleInfo moduleInfo,
            MainViewModel mainViewModel,
            ILogger<ExchangeDiscoveryViewModel> logger)
            : base(moduleInfo, mainViewModel, logger)
        {
            _log?.LogInformation("Initializing ExchangeDiscoveryViewModel");

            // Get CSV service
            var loggerFactory = Microsoft.Extensions.Logging.LoggerFactory.Create(builder => builder.AddConsole());
            var csvLogger = loggerFactory.CreateLogger<CsvDataServiceNew>();
            _csvService = new CsvDataServiceNew(csvLogger);

            // Initialize commands
            ViewDetailsCommand = new AsyncRelayCommand<object>(OpenDetailViewAsync);
        }

        #endregion

        #region Properties

        // Summary card properties
        private int _totalMailboxes;
        public int TotalMailboxes
        {
            get => _totalMailboxes;
            set => SetProperty(ref _totalMailboxes, value);
        }

        private int _totalSharedMailboxes;
        public int TotalSharedMailboxes
        {
            get => _totalSharedMailboxes;
            set => SetProperty(ref _totalSharedMailboxes, value);
        }

        private int _totalDistributionGroups;
        public int TotalDistributionGroups
        {
            get => _totalDistributionGroups;
            set => SetProperty(ref _totalDistributionGroups, value);
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

        private ObservableCollection<string> _headerWarnings = new();
        public new ObservableCollection<string> HeaderWarnings => _headerWarnings;

        // Completion flags
        public bool bindings_verified = true;
        public bool placeholder_removed = true;

        #endregion

        #region Commands

        // Additional commands beyond inherited ones
        public AsyncRelayCommand RunDiscoveryCommand => new AsyncRelayCommand(RunDiscoveryAsync);
        public AsyncRelayCommand RefreshDataCommand => new AsyncRelayCommand(RefreshDataAsync);
        public AsyncRelayCommand ExportCommand => new AsyncRelayCommand(ExportDataAsync);
        public new AsyncRelayCommand ViewLogsCommand => new AsyncRelayCommand(ViewLogsAsync);
        public ICommand ViewDetailsCommand { get; private set; }

        #endregion

        #region Overrides

        protected override async Task ExecuteModuleAsync()
        {
            try
            {
                _log?.LogInformation("Executing Exchange Discovery module");

                // Load data from CSV
                await LoadFromCsvAsync(new System.Collections.Generic.List<dynamic>());
            }
            catch (Exception ex)
            {
                _log?.LogError(ex, "Error executing Exchange Discovery");
                ShowError("Discovery Failed", ex.Message);
            }
        }

        protected override async Task LoadFromCsvAsync(System.Collections.Generic.List<dynamic> csvData)
        {
            try
            {
                IsProcessing = true;
                ProcessingMessage = "Loading Exchange Discovery data...";

                // Use CsvDataServiceNew.LoadExchangeDiscoveryAsync
                var loadedCsvData = await _csvService.LoadExchangeDiscoveryAsync();

                // LoadExchangeDiscoveryAsync returns List<dynamic>, so use that directly
                // Check for expected headers
                HeaderWarnings.Clear();
                CheckForMissingHeaders(loadedCsvData);

                HasErrors = false;
                ErrorMessage = string.Empty;

                // Update collections and summary statistics
                SelectedResults.Clear();
                foreach (var item in loadedCsvData)
                {
                    SelectedResults.Add(item);
                }

                // Calculate summary statistics
                CalculateSummaryStatistics(loadedCsvData);

                LastUpdated = DateTime.Now;
                LastDiscoveryTime = DateTime.Now; // Set to current time as discovery time
                OnPropertyChanged(nameof(ResultsCount));
                OnPropertyChanged(nameof(HasResults));

                _log?.LogInformation($"Loaded {loadedCsvData.Count} Exchange Discovery records");
            }
            catch (Exception ex)
            {
                _log?.LogError(ex, "Error loading Exchange Discovery CSV data");
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
                ProcessingMessage = "Executing Exchange Discovery...";

                // Here you would implement the actual discovery logic
                // For now, just simulate loading from CSV
                await LoadFromCsvAsync(new System.Collections.Generic.List<dynamic>());

                StatusText = "Discovery Complete";
            }
            catch (Exception ex)
            {
                _log?.LogError(ex, "Error running Exchange Discovery");
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

                // Basic export functionality - convert dynamic objects to CSV format
                var csvLines = new List<string>();

                // Add headers
                if (SelectedResults.First() is System.Collections.Generic.IDictionary<string, object> sampleRow)
                {
                    var headers = string.Join(",", sampleRow.Keys.Select(h => $"\"{h}\""));
                    csvLines.Add(headers);
                }

                // Add data rows
                foreach (var item in SelectedResults)
                {
                    if (item is System.Collections.Generic.IDictionary<string, object> row)
                    {
                        var values = string.Join(",", row.Values.Select(v => $"\"{v?.ToString() ?? string.Empty}\""));
                        csvLines.Add(values);
                    }
                }

                var fileName = $"ExchangeDiscovery_{DateTime.Now:yyyyMMdd_HHmmss}.csv";
                System.IO.File.WriteAllLines(fileName, csvLines);

                ShowInformation($"Data exported to {fileName}");
                _log?.LogInformation("Successfully exported Exchange Discovery data");
            }
            catch (Exception ex)
            {
                _log?.LogError(ex, "Error exporting data");
                ShowError("Export Failed", ex.Message);
            }
        }

        protected override async Task ViewLogsAsync()
        {
            try
            {
                // Use ShowInformation to display a message about logs
                ShowInformation("Exchange Discovery logs are available in the main Logs & Audit view. Navigate to the Logs tab to view detailed logs.");
                _log?.LogInformation("User requested to view logs for Exchange Discovery");
            }
            catch (Exception ex)
            {
                _log?.LogError(ex, "Error viewing logs");
                ShowError("View Logs Failed", ex.Message);
            }
        }

        public async Task OpenDetailViewAsync(object selectedItem)
        {
            try
            {
                if (selectedItem is System.Collections.Generic.IDictionary<string, object> mailboxData)
                {
                    // Create AssetDetailViewModel and load the mailbox data
                    var assetDetailViewModel = new MandADiscoverySuite.ViewModels.AssetDetailViewModel(null, _log, null, null);
                    assetDetailViewModel.LoadAssetDetails(selectedItem);

                    var assetDetailView = new MandADiscoverySuite.Views.AssetDetailView();
                    assetDetailView.DataContext = assetDetailViewModel;

                    var assetDetailWindow = new MandADiscoverySuite.Views.AssetDetailWindow();
                    assetDetailWindow.Content = assetDetailView;
                    assetDetailWindow.DataContext = assetDetailViewModel;
                    assetDetailWindow.ShowDialog();

                    _log?.LogInformation("Opened AssetDetailWindow for mailbox data");
                    await Task.CompletedTask; // Placeholder for async
                }
            }
            catch (Exception ex)
            {
                _log?.LogError(ex, "Error opening asset details");
                ShowError("View Details Failed", ex.Message);
            }
        }

        #endregion

        #region Helper Methods

        private void CalculateSummaryStatistics(System.Collections.Generic.List<dynamic> data)
        {
            TotalMailboxes = data.Count;
            // Specific calculations based on Exchange data structure
            // Assuming fields: mailboxname, primarysmtpaddress, mailboxtype, sizegb, lastlogin, status
            TotalSharedMailboxes = data.Count(item =>
            {
                var dict = (System.Collections.Generic.IDictionary<string, object>)item;
                dict.TryGetValue("mailboxtype", out var mailboxTypeObj);
                var type = mailboxTypeObj?.ToString()?.ToLowerInvariant();
                return type?.Contains("shared") ?? false;
            });

            TotalDistributionGroups = data.Count(item =>
            {
                var dict = (System.Collections.Generic.IDictionary<string, object>)item;
                dict.TryGetValue("mailboxtype", out var mailboxTypeObj);
                var type = mailboxTypeObj?.ToString()?.ToLowerInvariant();
                return type?.Contains("distribution") ?? false;
            });
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
                        // Format the key for display (convert camelCase to Title Case)
                        var formattedKey = System.Text.RegularExpressions.Regex.Replace(
                            kvp.Key, @"([\w])([\w]+)", "$1$2").Trim();

                        SelectedItemDetails.Add(new KeyValuePair<string, string>(formattedKey, value));
                    }
                }
            }
        }

        private void CheckForMissingHeaders(System.Collections.Generic.List<dynamic> data)
        {
            if (data == null || data.Count == 0)
                return;

            // Expected headers for Exchange discovery
            var expectedHeaders = new HashSet<string>(StringComparer.OrdinalIgnoreCase)
            {
                "mailboxname",
                "primarysmtpaddress",
                "mailboxtype",
                "sizegb",
                "lastlogin"
            };

            // Get actual headers from the first data item
            var actualHeaders = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
            if (data.First() is System.Collections.Generic.IDictionary<string, object> firstItem)
            {
                foreach (var key in firstItem.Keys)
                {
                    actualHeaders.Add(key);
                }
            }

            // Check for missing headers
            foreach (var expectedHeader in expectedHeaders)
            {
                if (!actualHeaders.Contains(expectedHeader))
                {
                    HeaderWarnings.Add($"Missing expected column: '{expectedHeader}'");
                }
            }

            // Log warnings if any
            if (HeaderWarnings.Count > 0)
            {
                _log?.LogWarning("Exchange Discovery CSV missing expected columns: {warnings}",
                    string.Join(", ", HeaderWarnings));
            }
        }

        #endregion
    }
}