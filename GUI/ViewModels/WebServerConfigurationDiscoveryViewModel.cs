using System;
using System.Collections.ObjectModel;
using System.Linq;
using System.Threading.Tasks;
using System.Collections.Generic;
using MandADiscoverySuite.Services;
using MandADiscoverySuite.Models;
using Microsoft.Extensions.Logging;
using CommunityToolkit.Mvvm.Input;

namespace MandADiscoverySuite.ViewModels
{
    public class WebServerConfigurationDiscoveryViewModel : ModuleViewModel
    {
        private readonly CsvDataServiceNew _csvService;

        public WebServerConfigurationDiscoveryViewModel(
            ModuleInfo moduleInfo,
            MainViewModel mainViewModel,
            ILogger<WebServerConfigurationDiscoveryViewModel> logger)
            : base(moduleInfo, mainViewModel, logger)
        {
            var loggerFactory = Microsoft.Extensions.Logging.LoggerFactory.Create(builder => builder.AddConsole());
            var csvLogger = loggerFactory.CreateLogger<CsvDataServiceNew>();
            _csvService = new CsvDataServiceNew(csvLogger);
        }

        // Properties
        private int _webServersCount;
        public int WebServersCount { get => _webServersCount; set => SetProperty(ref _webServersCount, value); }

        private int _iisCount;
        public int IISCount { get => _iisCount; set => SetProperty(ref _iisCount, value); }

        private int _apacheCount;
        public int ApacheCount { get => _apacheCount; set => SetProperty(ref _apacheCount, value); }

        private int _totalWebsites;
        public int TotalWebsites { get => _totalWebsites; set => SetProperty(ref _totalWebsites, value); }

        public ObservableCollection<dynamic> SelectedResults { get; } = new();
        private object _selectedItem;
        public object SelectedItem { get => _selectedItem; set => SetProperty(ref _selectedItem, value); }

        // Commands
        public AsyncRelayCommand RunDiscoveryCommand => new AsyncRelayCommand(RunDiscoveryAsync);
        public AsyncRelayCommand RefreshDataCommand => new AsyncRelayCommand(RefreshDataAsync);
        public AsyncRelayCommand ExportCommand => new AsyncRelayCommand(ExportDataAsync);
        public AsyncRelayCommand<object> ViewDetailsCommand => new AsyncRelayCommand<object>(ViewDetailsAsync);

        // Overrides
        protected override async Task ExecuteModuleAsync()
        {
            try
            {
                _log?.LogInformation("Executing Web Server discovery module");
                await LoadFromCsvAsync(new System.Collections.Generic.List<dynamic>());
            }
            catch (Exception ex)
            {
                _log?.LogError(ex, "Error executing Web Server discovery");
                ShowError("Discovery Failed", ex.Message);
            }
        }

        protected override async Task LoadFromCsvAsync(System.Collections.Generic.List<dynamic> csvData)
        {
            try
            {
                IsProcessing = true;
                ProcessingMessage = "Loading Web Server data...";

                var csvPath = @"C:\discoverydata\ljpops\Raw\WebServerConfigurationDiscovery.csv";
                var loadedCsvData = await _csvService.LoadCsvDataAsync(csvPath);

                var results = new System.Collections.Generic.List<dynamic>();
                foreach (var item in loadedCsvData)
                {
                    // Create enhanced dynamic object with computed properties
                    var enhancedItem = new System.Dynamic.ExpandoObject();
                    var itemDict = (System.Collections.Generic.IDictionary<string, object>)enhancedItem;

                    // Copy all original properties
                    var originalDict = (System.Collections.Generic.IDictionary<string, object>)item;
                    foreach (var kvp in originalDict)
                    {
                        itemDict[kvp.Key] = kvp.Value;
                    }

                    // Add computed properties for DataGrid columns
                    itemDict["WebsitesCount"] = CalculateWebsitesCount(item);
                    itemDict["AppPoolsCount"] = CalculateAppPoolsCount(item);

                    results.Add(enhancedItem);
                }

                var result = DataLoaderResult<dynamic>.Success(results, new System.Collections.Generic.List<string>());

                // Apply HeaderWarnings logic
                if (result.Data.Any())
                {
                    HeaderWarnings.Clear();
                }

                SelectedResults.Clear();
                foreach (var item in result.Data) SelectedResults.Add(item);
                CalculateSummaryStatistics(result.Data);
                LastUpdated = DateTime.Now;
                OnPropertyChanged(nameof(ResultsCount));
                OnPropertyChanged(nameof(HasResults));
                _log?.LogInformation($"Loaded {result.Data.Count} Web Server records");
            }
            catch (Exception ex)
            {
                _log?.LogError(ex, "Error loading Web Server CSV data");
                ShowError("Data Load Failed", ex.Message);
            }
            finally
            {
                IsProcessing = false;
            }
        }

        private async Task RunDiscoveryAsync()
        {
            try
            {
                IsProcessing = true;
                StatusText = "Running Discovery";
                ProcessingMessage = "Executing Web Server discovery...";
                await LoadFromCsvAsync(new System.Collections.Generic.List<dynamic>());
                StatusText = "Discovery Complete";
            }
            catch (Exception ex)
            {
                _log?.LogError(ex, "Error running Web Server discovery");
                ShowError("Discovery Error", ex.Message);
            }
            finally
            {
                IsProcessing = false;
            }
        }

        private async Task RefreshDataAsync()
        {
            try { await LoadFromCsvAsync(new System.Collections.Generic.List<dynamic>()); }
            catch (Exception ex) { _log?.LogError(ex, "Error refreshing data"); ShowError("Refresh Failed", ex.Message); }
        }

        private async Task ExportDataAsync()
        {
            try
            {
                if (SelectedResults.Count == 0) { ShowInformation("No data to export"); return; }

                // Create export data structure
                var exportData = SelectedResults.Select(item => (IDictionary<string, object>)item).ToList();

                if (exportData.Any())
                {
                    // Generate CSV content
                    var csvContent = GenerateCsvContent(exportData);

                    // Save to file
                    var exportPath = System.IO.Path.Combine(
                        Environment.GetFolderPath(Environment.SpecialFolder.Desktop),
                        $"WebServer_Discovery_Export_{DateTime.Now:yyyyMMdd_HHmmss}.csv");

                    await System.IO.File.WriteAllTextAsync(exportPath, csvContent);

                    ShowInformation($"Export completed successfully. File saved to: {exportPath}");
                    _log?.LogInformation($"Web Server data exported to: {exportPath}");
                }
                else
                {
                    ShowInformation("No data available to export");
                }
            }
            catch (Exception ex) { _log?.LogError(ex, "Error exporting data"); ShowError("Export Failed", ex.Message); }
        }


        private void CalculateSummaryStatistics(System.Collections.Generic.List<dynamic> data)
        {
            int webServersCount = 0;
            int iisCount = 0;
            int apacheCount = 0;
            int totalWebsites = 0;

            foreach (var item in data)
            {
                var dict = (System.Collections.Generic.IDictionary<string, object>)item;

                // Count web servers based on FrameworkName
                string frameworkName = "";
                dict.TryGetValue("FrameworkName", out var frameworkNameObj);
                if (frameworkNameObj != null)
                {
                    frameworkName = frameworkNameObj.ToString().ToLowerInvariant();

                    // Count total web servers
                    if (frameworkName.Contains("iis") || frameworkName.Contains("apache") ||
                        frameworkName.Contains("nginx") || frameworkName.Contains("tomcat"))
                    {
                        webServersCount++;
                    }

                    // Count IIS servers
                    if (frameworkName.Contains("iis"))
                    {
                        iisCount++;
                    }

                    // Count Apache servers
                    if (frameworkName.Contains("apache"))
                    {
                        apacheCount++;
                    }
                }

                // Count websites based on ObjectType
                string objectType = "";
                dict.TryGetValue("ObjectType", out var objectTypeObj);
                if (objectTypeObj != null)
                {
                    objectType = objectTypeObj.ToString().ToLowerInvariant();
                    if (objectType.Contains("site") || objectType.Contains("virtualhost") ||
                        objectType.Contains("website") || objectType.Contains("webapplication"))
                    {
                        totalWebsites++;
                    }
                }
            }

            WebServersCount = webServersCount;
            IISCount = iisCount;
            ApacheCount = apacheCount;
            TotalWebsites = totalWebsites;
        }

        private async Task ViewDetailsAsync(object parameter)
        {
            try
            {
                if (parameter == null)
                {
                    ShowError("View Details", "No asset selected");
                    return;
                }

                var assetName = GetAssetName(parameter);
                if (string.IsNullOrEmpty(assetName) || assetName == "Unknown")
                {
                    ShowError("View Details", "Unable to identify asset name");
                    return;
                }

                // Open the asset detail tab using the tabs service
                if (MainViewModel.CurrentTabsService != null)
                {
                    var success = await MainViewModel.CurrentTabsService.OpenAssetDetailTabAsync(assetName, assetName);
                    if (success)
                    {
                        _log?.LogInformation($"Opened asset details for web server asset: {assetName}");
                    }
                    else
                    {
                        ShowError("View Details", "Failed to open asset details tab");
                    }
                }
                else
                {
                    ShowError("View Details", "Tab service not available");
                }
            }
            catch (Exception ex)
            {
                _log?.LogError(ex, "Error opening web server asset details");
                ShowError("View Details Error", ex.Message);
            }
        }

        private int CalculateWebsitesCount(dynamic item)
        {
            try
            {
                var dict = (System.Collections.Generic.IDictionary<string, object>)item;

                // Check if WebsitesCount is already provided in the data
                if (dict.TryGetValue("WebsitesCount", out var websitesCountObj))
                {
                    if (int.TryParse(websitesCountObj?.ToString(), out var count))
                        return count;
                }

                // Calculate based on ObjectType (simple heuristic)
                if (dict.TryGetValue("ObjectType", out var objectTypeObj))
                {
                    var objectType = objectTypeObj?.ToString().ToLowerInvariant();
                    if (objectType != null)
                    {
                        if (objectType.Contains("server") || objectType.Contains("installation"))
                            return 5; // Assume servers host multiple websites
                        if (objectType.Contains("site") || objectType.Contains("website"))
                            return 1; // Individual sites
                    }
                }

                return 0; // Default
            }
            catch
            {
                return 0;
            }
        }

        private int CalculateAppPoolsCount(dynamic item)
        {
            try
            {
                var dict = (System.Collections.Generic.IDictionary<string, object>)item;

                // Check if AppPoolsCount is already provided in the data
                if (dict.TryGetValue("AppPoolsCount", out var appPoolsCountObj))
                {
                    if (int.TryParse(appPoolsCountObj?.ToString(), out var count))
                        return count;
                }

                // Calculate based on FrameworkName (simple heuristic for IIS)
                if (dict.TryGetValue("FrameworkName", out var frameworkNameObj))
                {
                    var frameworkName = frameworkNameObj?.ToString().ToLowerInvariant();
                    if (frameworkName != null && frameworkName.Contains("iis"))
                    {
                        return 3; // Assume IIS servers have app pools
                    }
                }

                return 0; // Default for non-IIS servers
            }
            catch
            {
                return 0;
            }
        }

        private string GetAssetName(object asset)
        {
            if (asset == null) return "Unknown";

            // Try to get name from common properties for web server assets
            var dict = asset as System.Collections.Generic.IDictionary<string, object>;
            if (dict != null)
            {
                if (dict.TryGetValue("Name", out var name) && !string.IsNullOrEmpty(name?.ToString()))
                    return name.ToString();
                if (dict.TryGetValue("ObjectType", out var objectType) && !string.IsNullOrEmpty(objectType?.ToString()))
                    return objectType.ToString();
            }

            return asset.ToString() ?? "Unknown";
        }

        private string GenerateCsvContent(List<IDictionary<string, object>> data)
        {
            if (!data.Any()) return string.Empty;

            var csv = new System.Text.StringBuilder();

            // Get all unique keys from all items
            var allKeys = data.SelectMany(d => d.Keys).Distinct().ToList();

            // Write header
            csv.AppendLine(string.Join(",", allKeys.Select(k => $"\"{k}\"")));

            // Write data rows
            foreach (var item in data)
            {
                var values = allKeys.Select(key =>
                {
                    var value = item.ContainsKey(key) ? item[key]?.ToString() ?? "" : "";
                    // Escape quotes and wrap in quotes if contains comma, quote, or newline
                    if (value.Contains("\"") || value.Contains(",") || value.Contains("\n") || value.Contains("\r"))
                    {
                        return $"\"{value.Replace("\"", "\"\"")}\"";
                    }
                    return value;
                });
                csv.AppendLine(string.Join(",", values));
            }

            return csv.ToString();
        }
    }
}