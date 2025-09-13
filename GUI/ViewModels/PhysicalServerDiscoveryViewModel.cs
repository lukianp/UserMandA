using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Linq;
using System.Threading.Tasks;
using MandADiscoverySuite.Services;
using MandADiscoverySuite.Models;
using MandADiscoverySuite.Views;
using Microsoft.Extensions.Logging;
using CommunityToolkit.Mvvm.Input;
using MandADiscoverySuite.ViewModels;

namespace MandADiscoverySuite.ViewModels
{
    /// <summary>
    /// ViewModel for Physical Server Discovery module
    /// </summary>
    public class PhysicalServerDiscoveryViewModel : ModuleViewModel
    {
        private readonly CsvDataServiceNew _csvService;

        #region Constructor

        public PhysicalServerDiscoveryViewModel(
            ModuleInfo moduleInfo,
            MainViewModel mainViewModel,
            ILogger<PhysicalServerDiscoveryViewModel> logger)
            : base(moduleInfo, mainViewModel, logger)
        {
            _logger?.LogInformation("Initializing PhysicalServerDiscoveryViewModel");

            // Get CSV service
            var loggerFactory = Microsoft.Extensions.Logging.LoggerFactory.Create(builder => builder.AddConsole());
            var csvLogger = loggerFactory.CreateLogger<CsvDataServiceNew>();
            _csvService = new CsvDataServiceNew(csvLogger);

            // Initialize filter options
            FilterOptions = new ObservableCollection<string>
            {
                "All Components",
                "Processors",
                "Memory",
                "Storage",
                "Network"
            };
            SelectedFilter = "All Components";

            // Initialize commands
            LoadCommand = new AsyncRelayCommand(LoadAsync);
            ViewDetailsCommand = new RelayCommand<dynamic>(ViewDetails);
        }

        #endregion

        #region Properties

        // Summary card properties
        private int _totalProcessors;
        public int TotalProcessors
        {
            get => _totalProcessors;
            set => SetProperty(ref _totalProcessors, value);
        }

        private int _totalCores;
        public int TotalCores
        {
            get => _totalCores;
            set => SetProperty(ref _totalCores, value);
        }

        private int _totalMemoryModules;
        public int TotalMemoryModules
        {
            get => _totalMemoryModules;
            set => SetProperty(ref _totalMemoryModules, value);
        }

        private int _totalStorageDevices;
        public int TotalStorageDevices
        {
            get => _totalStorageDevices;
            set => SetProperty(ref _totalStorageDevices, value);
        }

        private DateTime _lastDiscoveryTime = DateTime.MinValue;
        public DateTime LastDiscoveryTime
        {
            get => _lastDiscoveryTime;
            set => SetProperty(ref _lastDiscoveryTime, value);
        }

        // Filter properties
        private ObservableCollection<string> _filterOptions = new();
        public ObservableCollection<string> FilterOptions
        {
            get => _filterOptions;
            set => SetProperty(ref _filterOptions, value);
        }

        private string _selectedFilter = "All Components";
        public string SelectedFilter
        {
            get => _selectedFilter;
            set
            {
                if (SetProperty(ref _selectedFilter, value))
                {
                    ApplyFilter();
                }
            }
        }

        // Data properties
        private ObservableCollection<dynamic> _allResults = new();
        private ObservableCollection<dynamic> _selectedResults = new();
        public ObservableCollection<dynamic> SelectedResults
        {
            get => _selectedResults;
            set => SetProperty(ref _selectedResults, value);
        }

        private dynamic? _selectedItem;
        public dynamic? SelectedItem
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

        private ObservableCollection<dynamic> _selectedItemDetails = new();
        public ObservableCollection<dynamic> SelectedItemDetails
        {
            get => _selectedItemDetails;
            set => SetProperty(ref _selectedItemDetails, value);
        }

        private ObservableCollection<string> _headerWarnings = new();
        public new ObservableCollection<string> HeaderWarnings
        {
            get => _headerWarnings;
            set => SetProperty(ref _headerWarnings, value);
        }

        public new bool HasResults => _selectedResults.Count > 0;

        // Commands
        public AsyncRelayCommand LoadCommand { get; }
        public RelayCommand<dynamic> ViewDetailsCommand { get; private set; }

        #endregion

        #region Methods

        protected override async Task ExecuteModuleAsync()
        {
            await LoadAsync();
        }

        private new async Task LoadAsync()
        {
            try
            {
                IsProcessing = true;
                ProcessingMessage = "Loading physical server hardware data...";
                HeaderWarnings.Clear();

                _logger?.LogInformation("Starting PhysicalServerDiscovery data load");

                // Try to load data from CSV
                var csvPath = @"C:\discoverydata\ljpops\Raw\PhysicalServerDiscovery.csv";
                var csvData = await _csvService.LoadCsvDataAsync(csvPath);

                // Apply HeaderWarnings logic
                if (csvData != null && csvData.Any())
                {
                    HeaderWarnings.Clear();

                    _allResults.Clear();
                    foreach (var item in csvData)
                    {
                        _allResults.Add(item);
                    }

                    ApplyFilter();
                    CalculateSummaryMetrics();
                    LastDiscoveryTime = DateTime.Now;

                    _logger?.LogInformation($"Loaded {csvData.Count} physical server hardware records");
                }
                else
                {
                    // Data collection is empty, but no warnings exist from service, so no population needed
                    _allResults.Clear();
                    SelectedResults.Clear();
                    ResetSummaryMetrics();
                }

                OnPropertyChanged(nameof(HasResults));
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error loading Physical Server Discovery data");
                ErrorMessage = $"Failed to load physical server data: {ex.Message}";
                HeaderWarnings.Add($"Error loading data: {ex.Message}");
            }
            finally
            {
                IsProcessing = false;
            }
        }

        private void ApplyFilter()
        {
            if (_allResults == null || !_allResults.Any())
            {
                SelectedResults.Clear();
                return;
            }

            var filtered = _allResults.AsEnumerable();

            if (SelectedFilter != "All Components")
            {
                filtered = SelectedFilter switch
                {
                    "Processors" => filtered.Where(item => GetStringProperty(item, "ComponentType")?.Contains("Processor") == true),
                    "Memory" => filtered.Where(item => GetStringProperty(item, "ComponentType")?.Contains("Memory") == true),
                    "Storage" => filtered.Where(item => GetStringProperty(item, "ComponentType")?.Contains("Storage") == true ||
                                                       GetStringProperty(item, "ComponentType")?.Contains("Disk") == true),
                    "Network" => filtered.Where(item => GetStringProperty(item, "ComponentType")?.Contains("Network") == true),
                    _ => filtered
                };
            }

            SelectedResults.Clear();
            foreach (var item in filtered)
            {
                SelectedResults.Add(item);
            }

            OnPropertyChanged(nameof(HasResults));
        }

        private void CalculateSummaryMetrics()
        {
            if (!_allResults.Any())
            {
                ResetSummaryMetrics();
                return;
            }

            // Count by component types
            TotalProcessors = _allResults.Count(item => GetStringProperty(item, "ComponentType")?.Contains("Processor") == true);
            TotalMemoryModules = _allResults.Count(item => GetStringProperty(item, "ComponentType")?.Contains("Memory") == true);
            TotalStorageDevices = _allResults.Count(item => GetStringProperty(item, "ComponentType")?.Contains("Storage") == true ||
                                                           GetStringProperty(item, "ComponentType")?.Contains("Disk") == true);

            // Calculate total cores from processors
            TotalCores = 0;
            foreach (var processor in _allResults.Where(item => GetStringProperty(item, "ComponentType")?.Contains("Processor") == true))
            {
                if (int.TryParse(GetStringProperty(processor, "NumberOfCores"), out int cores))
                {
                    TotalCores += cores;
                }
            }
        }

        private void ResetSummaryMetrics()
        {
            TotalProcessors = 0;
            TotalCores = 0;
            TotalMemoryModules = 0;
            TotalStorageDevices = 0;
        }

        private void UpdateSelectedItemDetails()
        {
            SelectedItemDetails.Clear();

            if (SelectedItem == null) return;

            try
            {
                var properties = ((IDictionary<string, object>)SelectedItem);

                foreach (var kvp in properties)
                {
                    if (kvp.Value != null && !string.IsNullOrEmpty(kvp.Value.ToString()))
                    {
                        SelectedItemDetails.Add(new { Key = FormatPropertyName(kvp.Key), Value = kvp.Value.ToString() });
                    }
                }
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error updating selected item details");
                SelectedItemDetails.Add(new { Key = "Error", Value = "Unable to load item details" });
            }
        }

        private string FormatPropertyName(string propertyName)
        {
            // Convert camelCase to Title Case
            if (string.IsNullOrEmpty(propertyName)) return propertyName;

            var result = string.Empty;
            for (int i = 0; i < propertyName.Length; i++)
            {
                if (i == 0)
                {
                    result += char.ToUpper(propertyName[i]);
                }
                else if (char.IsUpper(propertyName[i]))
                {
                    result += " " + propertyName[i];
                }
                else
                {
                    result += propertyName[i];
                }
            }
            return result;
        }

        private string? GetStringProperty(dynamic item, string propertyName)
        {
            try
            {
                if (item is IDictionary<string, object> dict && dict.ContainsKey(propertyName))
                {
                    return dict[propertyName]?.ToString();
                }
                return null;
            }
            catch
            {
                return null;
            }
        }

        /// <summary>
        /// Open the asset detail view for the selected hardware component
        /// </summary>
        private void ViewDetails(dynamic? asset)
        {
            if (asset == null) return;

            try
            {
                _logger?.LogInformation("Opening asset detail view for hardware component");

                // Create AssetDetailViewModel with the dynamic asset object
                var assetDetailViewModel = new AssetDetailViewModel(
                    asset,
                    new LogicEngineService(null), // TODO: Inject proper logger
                    _logger);

                // Create and show the AssetDetailWindow
                var assetDetailWindow = new AssetDetailWindow();
                assetDetailWindow.DataContext = assetDetailViewModel;
                assetDetailWindow.Show();

                _logger?.LogInformation("Asset detail window opened successfully");

            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error opening asset detail view");
                ErrorMessage = $"Failed to open asset details: {ex.Message}";
            }
        }

        #endregion
    }
}