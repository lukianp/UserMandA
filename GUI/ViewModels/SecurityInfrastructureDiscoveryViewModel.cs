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
    /// ViewModel for Security Infrastructure Discovery module
    /// </summary>
    public class SecurityInfrastructureDiscoveryViewModel : ModuleViewModel
    {
        private readonly CsvDataServiceNew _csvService;

        #region Constructor

        public SecurityInfrastructureDiscoveryViewModel(
            ModuleInfo moduleInfo,
            MainViewModel mainViewModel,
            ILogger<SecurityInfrastructureDiscoveryViewModel> logger)
            : base(moduleInfo, mainViewModel, logger)
        {
            _logger?.LogInformation("Initializing SecurityInfrastructureDiscoveryViewModel");

            // Get CSV service
            var loggerFactory = Microsoft.Extensions.Logging.LoggerFactory.Create(builder => builder.AddConsole());
            var csvLogger = loggerFactory.CreateLogger<CsvDataServiceNew>();
            _csvService = new CsvDataServiceNew(csvLogger);

            // Initialize filter options
            FilterOptions = new ObservableCollection<string>
            {
                "All Security Components",
                "VPNs",
                "Firewalls",
                "IDS/IPS"
            };
            SelectedFilter = "All Security Components";

            // Initialize commands
            LoadCommand = new AsyncRelayCommand(LoadAsync);
        }

        #endregion

        #region Properties

        // Summary card properties
        private int _totalDevices;
        public int TotalDevices
        {
            get => _totalDevices;
            set => SetProperty(ref _totalDevices, value);
        }

        private int _totalVpns;
        public int TotalVpns
        {
            get => _totalVpns;
            set => SetProperty(ref _totalVpns, value);
        }

        private int _totalFirewalls;
        public int TotalFirewalls
        {
            get => _totalFirewalls;
            set => SetProperty(ref _totalFirewalls, value);
        }

        private int _totalIdsIps;
        public int TotalIdsIps
        {
            get => _totalIdsIps;
            set => SetProperty(ref _totalIdsIps, value);
        }

        private DateTime _lastSecurityScan = DateTime.MinValue;
        public DateTime LastSecurityScan
        {
            get => _lastSecurityScan;
            set => SetProperty(ref _lastSecurityScan, value);
        }

        // Filter properties
        private ObservableCollection<string> _filterOptions = new();
        public ObservableCollection<string> FilterOptions
        {
            get => _filterOptions;
            set => SetProperty(ref _filterOptions, value);
        }

        private string _selectedFilter = "All Security Components";
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
                ProcessingMessage = "Loading security infrastructure data...";
                HeaderWarnings.Clear();

                _logger?.LogInformation("Starting SecurityInfrastructureDiscovery data load");

                // Try to load data from multiple security-related CSV files
                var allSecurityData = new List<dynamic>();

                var csvFiles = new[]
                {
                    @"C:\discoverydata\ljpops\Raw\Security_Firewall.csv",
                    @"C:\discoverydata\ljpops\Raw\Security_Antivirus.csv",
                    @"C:\discoverydata\ljpops\Raw\Security_VPN.csv",
                    @"C:\discoverydata\ljpops\Raw\SecurityInfrastructureDiscovery.csv"
                };

                foreach (var csvPath in csvFiles)
                {
                    try
                    {
                        var csvData = await _csvService.LoadCsvDataAsync(csvPath);
                        if (csvData != null && csvData.Any())
                        {
                            allSecurityData.AddRange(csvData);
                            _logger?.LogInformation($"Loaded {csvData.Count} records from {System.IO.Path.GetFileName(csvPath)}");
                        }
                    }
                    catch (Exception ex)
                    {
                        _logger?.LogWarning(ex, $"Could not load security data from {csvPath}");
                    }
                }

                if (allSecurityData.Any())
                {
                    _allResults.Clear();
                    foreach (var item in allSecurityData)
                    {
                        _allResults.Add(item);
                    }

                    ApplyFilter();
                    CalculateSummaryMetrics();
                    LastSecurityScan = DateTime.Now;

                    _logger?.LogInformation($"Loaded {allSecurityData.Count} total security infrastructure records");
                }
                else
                {
                    HeaderWarnings.Add("No security infrastructure data found. Please run the Security Infrastructure Discovery module first.");
                    _allResults.Clear();
                    SelectedResults.Clear();
                    ResetSummaryMetrics();
                }

                OnPropertyChanged(nameof(HasResults));
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error loading Security Infrastructure Discovery data");
                ErrorMessage = $"Failed to load security infrastructure data: {ex.Message}";
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

            if (SelectedFilter != "All Security Components")
            {
                filtered = SelectedFilter switch
                {
                    "VPNs" => filtered.Where(item => GetStringProperty(item, "ComponentType")?.Contains("VPN") == true ||
                                                     GetStringProperty(item, "Type")?.Contains("VPN") == true),
                    "Firewalls" => filtered.Where(item => GetStringProperty(item, "ComponentType")?.Contains("Firewall") == true ||
                                                          GetStringProperty(item, "Type")?.Contains("Firewall") == true),
                    "IDS/IPS" => filtered.Where(item => GetStringProperty(item, "ComponentType")?.Contains("IDS") == true ||
                                                        GetStringProperty(item, "ComponentType")?.Contains("IPS") == true ||
                                                        GetStringProperty(item, "Type")?.Contains("Intrusion") == true),
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

            TotalDevices = _allResults.Count;

            // Count by security component types
            TotalFirewalls = _allResults.Count(item =>
                GetStringProperty(item, "ComponentType")?.Contains("Firewall") == true ||
                GetStringProperty(item, "Type")?.Contains("Firewall") == true);

            TotalVpns = _allResults.Count(item =>
                GetStringProperty(item, "ComponentType")?.Contains("VPN") == true ||
                GetStringProperty(item, "Type")?.Contains("VPN") == true);

            TotalIdsIps = _allResults.Count(item =>
                GetStringProperty(item, "ComponentType")?.Contains("IDS") == true ||
                GetStringProperty(item, "ComponentType")?.Contains("IPS") == true ||
                GetStringProperty(item, "Type")?.Contains("Intrusion") == true);
        }

        private void ResetSummaryMetrics()
        {
            TotalDevices = 0;
            TotalVpns = 0;
            TotalFirewalls = 0;
            TotalIdsIps = 0;
        }

        private string _selectedItemSecurityConfig;
        public string SelectedItemSecurityConfig
        {
            get => _selectedItemSecurityConfig;
            set => SetProperty(ref _selectedItemSecurityConfig, value);
        }

        private void UpdateSelectedItemDetails()
        {
            SelectedItemDetails.Clear();
            SelectedItemSecurityConfig = string.Empty;

            if (SelectedItem == null) return;

            try
            {
                var properties = ((IDictionary<string, object>)SelectedItem);
                var securityConfigParts = new List<string>();

                foreach (var kvp in properties)
                {
                    if (kvp.Value != null && !string.IsNullOrEmpty(kvp.Value.ToString()))
                    {
                        var key = FormatPropertyName(kvp.Key);
                        var value = kvp.Value.ToString();

                        // Add to details list
                        SelectedItemDetails.Add(new { Key = key, Value = value });

                        // Collect security-related configuration
                        if (key.Contains("Security") || key.Contains("Policy") || key.Contains("Rule") ||
                            key.Contains("Config") || key.Contains("Setting") || key.Contains("Auth"))
                        {
                            securityConfigParts.Add($"{key}: {value}");
                        }
                    }
                }

                SelectedItemSecurityConfig = securityConfigParts.Any() ?
                    string.Join(Environment.NewLine, securityConfigParts) :
                    "No security configuration details available";
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error updating selected item details");
                SelectedItemDetails.Add(new { Key = "Error", Value = "Unable to load item details" });
                SelectedItemSecurityConfig = "Error loading security configuration";
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

        #endregion
    }
}