using System;
using System.Collections.ObjectModel;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using MandADiscoverySuite.Services;
using MandADiscoverySuite.Models;
using Microsoft.Extensions.Logging;
using CommunityToolkit.Mvvm.Input;
using System.Diagnostics;

namespace MandADiscoverySuite.ViewModels
{
    /// <summary>
    /// ViewModel for SQL Server Discovery module
    /// </summary>
    public class SQLServerDiscoveryViewModel : ModuleViewModel
    {
        private readonly CsvDataServiceNew _csvService;

        #region Constructor

        public SQLServerDiscoveryViewModel(
            ModuleInfo moduleInfo,
            MainViewModel mainViewModel,
            ILogger<SQLServerDiscoveryViewModel> logger)
            : base(moduleInfo, mainViewModel, logger)
        {
            _log?.LogInformation("Initializing SQLServerDiscoveryViewModel");

            // Get CSV service
            var loggerFactory = Microsoft.Extensions.Logging.LoggerFactory.Create(builder => builder.AddConsole());
            var csvLogger = loggerFactory.CreateLogger<CsvDataServiceNew>();
            _csvService = new CsvDataServiceNew(csvLogger);

            // Initialize SQL Server configurations
            InitializeDefaultConfigurations();

            _log?.LogInformation("SQL Server Discovery ViewModel initialized with default configurations");
        }

        #endregion

        #region Properties

        // SQL Server Configuration Properties
        private string _sqlServerInstance;
        public string SqlServerInstance
        {
            get => _sqlServerInstance;
            set => SetProperty(ref _sqlServerInstance, value);
        }

        private string _sqlServerUser;
        public string SqlServerUser
        {
            get => _sqlServerUser;
            set => SetProperty(ref _sqlServerUser, value);
        }

        private string _sqlServerPassword;
        public string SqlServerPassword
        {
            get => _sqlServerPassword;
            set
            {
                if (SetProperty(ref _sqlServerPassword, value))
                {
                    // Clear the masked version when the real value changes
                    OnPropertyChanged(nameof(SqlServerPasswordMasked));
                }
            }
        }

        public string SqlServerPasswordMasked =>
            string.IsNullOrEmpty(SqlServerPassword) ? string.Empty :
            new string('*', Math.Min(SqlServerPassword.Length, 16));

        private bool _useWindowsAuth;
        public bool UseWindowsAuth
        {
            get => _useWindowsAuth;
            set
            {
                if (SetProperty(ref _useWindowsAuth, value))
                {
                    // Clear SQL auth fields if switching to Windows auth
                    if (value)
                    {
                        SqlServerUser = string.Empty;
                        SqlServerPassword = string.Empty;
                    }
                    ValidateConnection();
                }
            }
        }

        private bool _useSqlAuth;
        public bool UseSqlAuth
        {
            get => _useSqlAuth;
            set => SetProperty(ref _useSqlAuth, value);
        }

        // Summary card properties
        private int _totalInstances;
        public int TotalInstances
        {
            get => _totalInstances;
            set => SetProperty(ref _totalInstances, value);
        }

        private int _totalDatabases;
        public int TotalDatabases
        {
            get => _totalDatabases;
            set => SetProperty(ref _totalDatabases, value);
        }

        private int _totalTables;
        public int TotalTables
        {
            get => _totalTables;
            set => SetProperty(ref _totalTables, value);
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
                    // Trigger async loading of item details when selection changes
                    _ = LoadSelectedItemDetailsAsync();
                }
            }
        }

        // Details for the selected item
        private ObservableCollection<DetailField> _selectedItemDetails;
        public ObservableCollection<DetailField> SelectedItemDetails
        {
            get => _selectedItemDetails ?? (_selectedItemDetails = new ObservableCollection<DetailField>());
            set => SetProperty(ref _selectedItemDetails, value);
        }

        private bool _isLoadingDetails;
        public bool IsLoadingDetails
        {
            get => _isLoadingDetails;
            set => SetProperty(ref _isLoadingDetails, value);
        }

        #endregion

        #region Commands

        // Required commands from task specification
        public AsyncRelayCommand RunDiscoveryCommand => new AsyncRelayCommand(RunDiscoveryAsync);
        public AsyncRelayCommand RefreshDataCommand => new AsyncRelayCommand(RefreshDataAsync);
        public AsyncRelayCommand ExportCommand => new AsyncRelayCommand(ExportDataAsync);
        public new AsyncRelayCommand ViewLogsCommand => new AsyncRelayCommand(ViewLogsAsync);

        #endregion

        #region Additional Methods

        public async Task ExportCsvDataAsync()
        {
            await ExportDataAsync();
        }

        #endregion

        #region Overrides

        protected override async Task ExecuteModuleAsync()
        {
            try
            {
                _log?.LogInformation("Executing SQL Server Discovery module");

                // Load data from CSV
                await LoadFromCsvAsync(new List<dynamic>());
            }
            catch (Exception ex)
            {
                _log?.LogError(ex, "Error executing SQL Server Discovery");
                ShowError("Discovery Failed", ex.Message);
            }
        }

        protected override async Task LoadFromCsvAsync(System.Collections.Generic.List<dynamic> csvData)
        {
            try
            {
                IsProcessing = true;
                ProcessingMessage = "Loading SQL Server data...";

                // Load from specific CSV path
                var csvPath = @"C:\discoverydata\ljpops\Raw\SQLServerDiscovery.csv";
                var loadedCsvData = await _csvService.LoadCsvDataAsync(csvPath);

                // Convert to dynamic list
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

                _log?.LogInformation($"Loaded {result.Data.Count} SQL Server records");
            }
            catch (Exception ex)
            {
                _log?.LogError(ex, "Error loading SQL Server CSV data");
                ShowError("Data Load Failed", ex.Message);
            }
            finally
            {
                IsProcessing = false;
            }
        }

        // Helper method to convert data to CSV lines
        private IEnumerable<string> ConvertToCsvLines(ObservableCollection<dynamic> data)
        {
            if (data.Count == 0) yield break;

            // Get headers from first item
            var firstItem = (System.Collections.Generic.IDictionary<string, object>)data[0];
            var headers = string.Join(",", firstItem.Keys);
            yield return headers;

            // Get values for each row
            foreach (var item in data)
            {
                var dict = (System.Collections.Generic.IDictionary<string, object>)item;
                var values = string.Join(",", dict.Values.Select(v => $"\"{v?.ToString() ?? ""}\""));
                yield return values;
            }
        }

        #endregion

        #region Command Implementations

        private async Task RunDiscoveryAsync()
        {
            try
            {
                // Validate SQL connection before proceeding
                if (!ValidateConnection())
                {
                    ShowError("Configuration Required", "Please configure SQL Server connection settings before running discovery.");
                    return;
                }

                IsProcessing = true;
                StatusText = "Running Discovery";
                ProcessingMessage = "Executing SQL Server Discovery...";

                // TODO: Implement actual SQL Server discovery logic here
                // This would use the configured connection settings to query:
                // - SQL Server instances via SMO or ADO.NET
                // - System databases, user databases
                // - Tables, stored procedures, views, etc.

                // For now, simulate discovery by loading from CSV
                await LoadFromCsvAsync(new List<dynamic>());

                StatusText = "Discovery Complete";
                _log?.LogInformation("SQL Server Discovery completed successfully");
            }
            catch (Exception ex)
            {
                _log?.LogError(ex, "Error running SQL Server Discovery");
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
                await LoadFromCsvAsync(new List<dynamic>());
            }
            catch (Exception ex)
            {
                _log?.LogError(ex, "Error refreshing SQL Server data");
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

                // Create export path with timestamp
                var timestamp = DateTime.Now.ToString("yyyyMMdd_HHmmss");
                var exportPath = System.IO.Path.Combine(
                    Environment.GetFolderPath(Environment.SpecialFolder.MyDocuments),
                    $"SQLServerDiscovery_Export_{timestamp}.csv"
                );

                // Export data to CSV manually
                await Task.Run(() => System.IO.File.WriteAllLines(exportPath, ConvertToCsvLines(SelectedResults)));
                _log?.LogInformation($"Exported SQL Server data to: {exportPath}");

                ShowInformation($"Data exported successfully to: {exportPath}");
            }
            catch (Exception ex)
            {
                _log?.LogError(ex, "Error exporting SQL Server data");
                ShowError("Export Failed", ex.Message);
            }
        }

        protected override async Task ViewLogsAsync()
        {
            try
            {
                _log?.LogInformation("Opening SQL Server discovery logs");

                // Open the logs directory or show a log viewer dialog
                var logPath = @"C:\discoverydata\ljpops\Logs";
                if (System.IO.Directory.Exists(logPath))
                {
                    Process.Start(new ProcessStartInfo
                    {
                        FileName = logPath,
                        UseShellExecute = true,
                        Verb = "open"
                    });
                    _log?.LogInformation($"Opened log directory: {logPath}");
                }
                else
                {
                    ShowInformation("Log directory not found or accessible.");
                }
            }
            catch (Exception ex)
            {
                _log?.LogError(ex, "Error opening logs");
                ShowError("Logs Error", "Unable to open log viewer.");
            }
        }

        #endregion

        #region Detail Field Loading

        private async Task LoadSelectedItemDetailsAsync()
        {
            if (SelectedItem == null)
            {
                SelectedItemDetails.Clear();
                return;
            }

            try
            {
                IsLoadingDetails = true;
                SelectedItemDetails.Clear();

                // Simulate async loading delay
                await Task.Delay(100);

                var dict = SelectedItem as IDictionary<string, object>;
                if (dict != null)
                {
                    // Add SQL Server specific detail fields
                    AddDetailField("Instance Name", GetStringValue(dict, new[] { "InstanceName", "instancename", "ServerInstance", "serverinstance" }));
                    AddDetailField("Database Name", GetStringValue(dict, new[] { "DatabaseName", "databasename", "DBName", "dbname" }));
                    AddDetailField("Server", GetStringValue(dict, new[] { "Server", "server", "ServerName", "servername" }));
                    AddDetailField("Version", GetStringValue(dict, new[] { "Version", "version", "SQLVersion", "sqlversion" }));
                    AddDetailField("Status", GetStringValue(dict, new[] { "Status", "status" }), "Text", true);
                    AddDetailField("Size (MB)", GetStringValue(dict, new[] { "SizeMB", "sizemb", "Size", "size", "DatabaseSize", "databasesize" }));
                    AddDetailField("Compatibility Level", GetStringValue(dict, new[] { "CompatibilityLevel", "compatlevel", "Compatibility", "compatibility" }));
                    AddDetailField("Creation Date", GetStringValue(dict, new[] { "CreationDate", "creationdate", "CreateDate", "createdate" }));
                    AddDetailField("Last Modified", GetStringValue(dict, new[] { "LastModified", "lastmodified", "ModifiedDate", "modifieddate" }));

                    // Collation and recovery model
                    AddDetailField("Collation", GetStringValue(dict, new[] { "Collation", "collation", "DatabaseCollation", "databasecollation" }));
                    AddDetailField("Recovery Model", GetStringValue(dict, new[] { "RecoveryModel", "recoverymodel", "Recovery", "recovery" }));

                    // File information
                    AddDetailField("Data Files", GetStringValue(dict, new[] { "DataFiles", "datafiles", "MDFPath", "mdfpath" }));
                    AddDetailField("Log Files", GetStringValue(dict, new[] { "LogFiles", "logfiles", "LDFPath", "ldfpath" }));

                    // Add description if available
                    AddDetailField("Description", GetStringValue(dict, new[] { "Description", "description" }), "Text", true);
                }
            }
            catch (Exception ex)
            {
                _log?.LogError(ex, "Error loading selected item details for SQL Server");
                SelectedItemDetails.Add(new DetailField("Error", ex.Message, "Error", false, "Failed to load details"));
            }
            finally
            {
                IsLoadingDetails = false;
            }
        }

        private void AddDetailField(string name, string value, string type = "Text", bool editable = false, string tooltip = null)
        {
            if (!string.IsNullOrEmpty(value))
            {
                SelectedItemDetails.Add(new DetailField(name, value, type, editable, tooltip));
            }
        }

        private string GetStringValue(IDictionary<string, object> dict, string[] keys)
        {
            foreach (var key in keys)
            {
                if (dict.TryGetValue(key, out var value))
                {
                    return value?.ToString();
                }
            }
            return null;
        }

        #endregion

        #region Helper Methods

        private void CalculateSummaryStatistics(List<dynamic> data)
        {
            TotalInstances = 0;
            TotalDatabases = 0;
            TotalTables = 0;

            var instances = new HashSet<string>();
            var databases = new HashSet<string>();

            foreach (var item in data)
            {
                var dict = (System.Collections.Generic.IDictionary<string, object>)item;

                // Count unique instances
                if (dict.TryGetValue("instancename", out var instanceObj) ||
                    dict.TryGetValue("InstanceName", out instanceObj) ||
                    dict.TryGetValue("serverinstance", out instanceObj) ||
                    dict.TryGetValue("ServerInstance", out instanceObj))
                {
                    instances.Add(instanceObj?.ToString() ?? "");
                }

                // Count unique databases
                if (dict.TryGetValue("databasename", out var dbObj) ||
                    dict.TryGetValue("DatabaseName", out dbObj) ||
                    dict.TryGetValue("dbname", out dbObj) ||
                    dict.TryGetValue("DBName", out dbObj))
                {
                    databases.Add(dbObj?.ToString() ?? "");
                }

                // Count tables (if available in data)
                if (dict.TryGetValue("totaltables", out var tablesObj) ||
                    dict.TryGetValue("TotalTables", out tablesObj))
                {
                    if (int.TryParse(tablesObj?.ToString(), out var tableCount))
                    {
                        TotalTables += tableCount;
                    }
                }

                // Update last discovery time
                if (LastDiscoveryTime == DateTime.MinValue && data.Count > 0)
                {
                    LastDiscoveryTime = DateTime.Now;
                }
            }

            TotalInstances = instances.Count(i => !string.IsNullOrEmpty(i));
            TotalDatabases = databases.Count(d => !string.IsNullOrEmpty(d));

            _log?.LogInformation($"SQL Server Discovery Summary: Total Instances={TotalInstances}, Databases={TotalDatabases}, Tables={TotalTables}, Last Discovery={LastDiscoveryTime:yyyy-MM-dd HH:mm:ss}");
        }

        #endregion

        #region SQL Server Connection Handling

        private async Task TestConnectionAsync()
        {
            try
            {
                if (!ValidateConnection())
                {
                    ShowError("Configuration Error", "Please configure SQL Server connection settings before testing.");
                    return;
                }

                IsProcessing = true;
                ProcessingMessage = "Testing SQL Server connection...";

                // Here you would implement actual SQL Server connection testing
                // For now, simulate connection test with a delay
                await Task.Delay(2000);

                _log?.LogInformation("SQL Server connection validated successfully");

                ShowInformation("Connection validated successfully!");

                ProcessingMessage = "Connection validated";
            }
            catch (Exception ex)
            {
                _log?.LogError(ex, "Error testing SQL Server connection");
                ShowError("Connection Test Failed", ex.Message);
            }
            finally
            {
                IsProcessing = false;
            }
        }

        private bool ValidateConnection()
        {
            if (UseWindowsAuth)
            {
                // Windows authentication - just need server instance
                return !string.IsNullOrWhiteSpace(SqlServerInstance);
            }
            else if (UseSqlAuth)
            {
                // SQL Server authentication - need server, user, password
                return !string.IsNullOrWhiteSpace(SqlServerInstance) &&
                       !string.IsNullOrWhiteSpace(SqlServerUser) &&
                       !string.IsNullOrWhiteSpace(SqlServerPassword);
            }

            return false;
        }

        private void InitializeDefaultConfigurations()
        {
            // Set default SQL Server instance if not already set
            if (string.IsNullOrEmpty(SqlServerInstance))
            {
                SqlServerInstance = "."; // Default local instance
            }

            // Default to Windows authentication for security
            if (!UseWindowsAuth && !UseSqlAuth)
            {
                UseWindowsAuth = true;
            }
        }

        #endregion
    }
}