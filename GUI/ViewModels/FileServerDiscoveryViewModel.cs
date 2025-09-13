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
    /// ViewModel for File Server Discovery module
    /// </summary>
    public class FileServerDiscoveryViewModel : ModuleViewModel
    {
        private readonly CsvDataServiceNew _csvService;

        #region Constructor

        public FileServerDiscoveryViewModel(
            ModuleInfo moduleInfo,
            MainViewModel mainViewModel,
            ILogger<FileServerDiscoveryViewModel> logger)
            : base(moduleInfo, mainViewModel, logger)
        {
            _log?.LogInformation("Initializing FileServerDiscoveryViewModel");

            // Get CSV service
            var loggerFactory = Microsoft.Extensions.Logging.LoggerFactory.Create(builder => builder.AddConsole());
            var csvLogger = loggerFactory.CreateLogger<CsvDataServiceNew>();
            _csvService = new CsvDataServiceNew(csvLogger);
        }

        #endregion

        #region Properties

        // Summary card properties
        private int _totalShares;
        public int TotalShares
        {
            get => _totalShares;
            set => SetProperty(ref _totalShares, value);
        }

        private long _totalSizeBytes;
        public long TotalSizeBytes
        {
            get => _totalSizeBytes;
            set => SetProperty(ref _totalSizeBytes, value);
        }

        public string TotalSizeDisplay =>
            _totalSizeBytes > 0 ? BytesToReadableString(_totalSizeBytes) : "0 B";

        private int _totalServers;
        public int TotalServers
        {
            get => _totalServers;
            set
            {
                SetProperty(ref _totalServers, value);
                OnPropertyChanged(nameof(TotalSizeDisplay)); // Update display when servers change
            }
        }

        private int _totalACLs;
        public int TotalACLs
        {
            get => _totalACLs;
            set => SetProperty(ref _totalACLs, value);
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
        public new AsyncRelayCommand ViewLogsCommand => new AsyncRelayCommand(ViewLogsAsync);

        #endregion

        #region Overrides

        protected override async Task ExecuteModuleAsync()
        {
            try
            {
                _log?.LogInformation("Executing File Server discovery module");

                // Load data from CSV
                await LoadFromCsvAsync(new System.Collections.Generic.List<dynamic>());
            }
            catch (Exception ex)
            {
                _log?.LogError(ex, "Error executing File Server discovery");
                ShowError("Discovery Failed", ex.Message);
            }
        }

        protected override async Task LoadFromCsvAsync(System.Collections.Generic.List<dynamic> csvData)
        {
            try
            {
                IsProcessing = true;
                ProcessingMessage = "Loading File Server data...";

                // Load from specific CSV path
                var csvPath = @"C:\discoverydata\ljpops\Raw\FileServerDiscovery.csv";
                var loadedCsvData = await _csvService.LoadCsvDataAsync(csvPath);

                // Convert to dynamic list (similar to other loaders)
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

                _log?.LogInformation($"Loaded {result.Data.Count} File Server records");
            }
            catch (Exception ex)
            {
                _log?.LogError(ex, "Error loading File Server CSV data");
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
                ProcessingMessage = "Executing File Server discovery...";

                // Here you would implement the actual discovery logic
                // For now, just simulate loading from CSV
                await LoadFromCsvAsync(new System.Collections.Generic.List<dynamic>());

                StatusText = "Discovery Complete";
                LastDiscoveryTime = DateTime.Now;
            }
            catch (Exception ex)
            {
                _log?.LogError(ex, "Error running File Server discovery");
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
                _log?.LogInformation("Exporting File Server data");
                await Task.CompletedTask; // Placeholder
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
                // Navigate to logs view or open logs dialog
                _log?.LogInformation("Viewing File Server logs");
                await Task.CompletedTask; // Placeholder
            }
            catch (Exception ex)
            {
                _log?.LogError(ex, "Error viewing logs");
                ShowError("Logs Error", ex.Message);
            }
        }

        #endregion

        #region Helper Methods

        private void CalculateSummaryStatistics(System.Collections.Generic.List<dynamic> data)
        {
            TotalShares = data.Count;

            // Calculate unique servers
            var serverNames = new HashSet<string>();
            long totalBytes = 0;
            int totalACLs = 0;

            foreach (var item in data)
            {
                try
                {
                    var dict = (System.Collections.Generic.IDictionary<string, object>)item;

                    // Extract server name
                    object serverNameValue = null;
                    if (dict.TryGetValue("ServerName", out serverNameValue) ||
                        dict.TryGetValue("SERVERNAME", out serverNameValue) ||
                        dict.TryGetValue("Server Name", out serverNameValue))
                    {
                        var serverName = serverNameValue?.ToString();
                        if (!string.IsNullOrEmpty(serverName))
                        {
                            serverNames.Add(serverName);
                        }
                    }

                    // Extract size
                    if (dict.TryGetValue("Size", out var sizeObj) ||
                        dict.TryGetValue("SIZE", out sizeObj))
                    {
                        if (sizeObj != null && long.TryParse(sizeObj.ToString(), out var sizeBytes))
                        {
                            totalBytes += sizeBytes;
                        }
                    }

                    // Extract ACL count from Permissions
                    if (dict.TryGetValue("Permissions", out var permissionsObj) ||
                        dict.TryGetValue("PERMISSIONS", out permissionsObj))
                    {
                        var permissions = permissionsObj?.ToString();
                        if (!string.IsNullOrEmpty(permissions))
                        {
                            var aclCount = permissions.Split(new[] { ';', ',', '\n' }, StringSplitOptions.RemoveEmptyEntries).Length;
                            totalACLs += aclCount;
                        }
                    }
                    else if (dict.TryGetValue("ACLCount", out var aclCountObj) ||
                             dict.TryGetValue("AclCount", out aclCountObj) ||
                             dict.TryGetValue("PermissionsCount", out aclCountObj))
                    {
                        if (int.TryParse(aclCountObj?.ToString(), out var aclCount))
                        {
                            totalACLs += aclCount;
                        }
                    }
                }
                catch (Exception ex)
                {
                    _log?.LogWarning(ex, "Error processing item for statistics calculation");
                }
            }

            TotalServers = serverNames.Count;
            TotalSizeBytes = totalBytes;
            TotalACLs = totalACLs;
            OnPropertyChanged(nameof(TotalSizeDisplay));
            OnPropertyChanged(nameof(TotalACLs));
        }

        private static string BytesToReadableString(long bytes)
        {
            const long KB = 1024;
            const long MB = KB * 1024;
            const long GB = MB * 1024;
            const long TB = GB * 1024;

            if (bytes >= TB)
                return $"{(double)bytes / TB:F2} TB";
            if (bytes >= GB)
                return $"{(double)bytes / GB:F2} GB";
            if (bytes >= MB)
                return $"{(double)bytes / MB:F2} MB";
            if (bytes >= KB)
                return $"{(double)bytes / KB:F2} KB";

            return $"{bytes} B";
        }

        #endregion
    }
}