using System;
using System.Collections.ObjectModel;
using System.Linq;
using System.Threading.Tasks;
using MandADiscoverySuite.Services;
using MandADiscoverySuite.Models;
using Microsoft.Extensions.Logging;
using CommunityToolkit.Mvvm.Input;

namespace MandADiscoverySuite.ViewModels
{
    public class EnvironmentRiskAssessmentViewModel : ModuleViewModel
    {
        public enum EnvironmentType { OnPrem, Azure, Hybrid, Unknown }

        private readonly CsvDataServiceNew _csvService;

        public EnvironmentRiskAssessmentViewModel(
            ModuleInfo moduleInfo,
            MainViewModel mainViewModel,
            ILogger<EnvironmentRiskAssessmentViewModel> logger)
            : base(moduleInfo, mainViewModel, logger)
        {
            var loggerFactory = Microsoft.Extensions.Logging.LoggerFactory.Create(builder => builder.AddConsole());
            var csvLogger = loggerFactory.CreateLogger<CsvDataServiceNew>();
            _csvService = new CsvDataServiceNew(csvLogger);
        }

        // Properties
        private int _totalAssessments;
        public int TotalAssessments { get => _totalAssessments; set => SetProperty(ref _totalAssessments, value); }

        private int _highRiskCount;
        public int HighRiskCount { get => _highRiskCount; set => SetProperty(ref _highRiskCount, value); }

        private int _mediumRiskCount;
        public int MediumRiskCount { get => _mediumRiskCount; set => SetProperty(ref _mediumRiskCount, value); }

        private DateTime _lastAssessmentTime;
        public DateTime LastAssessmentTime { get => _lastAssessmentTime; set => SetProperty(ref _lastAssessmentTime, value); }

        // Environment specific properties
        private EnvironmentType _detectedEnvironment;
        public EnvironmentType DetectedEnvironment { get => _detectedEnvironment; set => SetProperty(ref _detectedEnvironment, value); }

        private int _azureSecurityGaps;
        public int AzureSecurityGaps { get => _azureSecurityGaps; set => SetProperty(ref _azureSecurityGaps, value); }

        private int _migrationBlockers;
        public int MigrationBlockers { get => _migrationBlockers; set => SetProperty(ref _migrationBlockers, value); }

        public ObservableCollection<dynamic> SelectedResults { get; } = new();
        private object _selectedItem;
        public object SelectedItem { get => _selectedItem; set => SetProperty(ref _selectedItem, value); }

        // Commands
        public AsyncRelayCommand RunAssessmentCommand => new AsyncRelayCommand(RunAssessmentAsync);
        public AsyncRelayCommand RefreshDataCommand => new AsyncRelayCommand(RefreshDataAsync);
        public AsyncRelayCommand ExportCommand => new AsyncRelayCommand(ExportDataAsync);
        public new AsyncRelayCommand ViewLogsCommand => new AsyncRelayCommand(ViewLogsAsync);

        // Overrides
        protected override async Task ExecuteModuleAsync()
        {
            try
            {
                _log?.LogInformation("Executing Environment Risk Assessment module");
                await LoadFromCsvAsync(new System.Collections.Generic.List<dynamic>());
            }
            catch (Exception ex)
            {
                _log?.LogError(ex, "Error executing Environment Risk Assessment");
                ShowError("Discovery Failed", ex.Message);
            }
        }

        protected override async Task LoadFromCsvAsync(System.Collections.Generic.List<dynamic> csvData)
        {
            try
            {
                IsProcessing = true;
                ProcessingMessage = "Loading Environment Risk data...";

                var csvPath = @"C:\discoverydata\ljpops\Raw\EnvironmentRiskAssessment.csv";
                var loadedCsvData = await _csvService.LoadCsvDataAsync(csvPath);

                var results = new System.Collections.Generic.List<dynamic>();
                foreach (var item in loadedCsvData) results.Add(item);
                var result = DataLoaderResult<dynamic>.Success(results, new System.Collections.Generic.List<string>());

                if (result.HeaderWarnings.Any())
                {
                    ErrorMessage = string.Join("; ", result.HeaderWarnings);
                    HasErrors = true;
                }
                else
                {
                    HasErrors = false;
                    ErrorMessage = string.Empty;
                }

                SelectedResults.Clear();
                foreach (var item in result.Data) SelectedResults.Add(item);
                CalculateSummaryStatistics(result.Data);
                LastUpdated = DateTime.Now;
                OnPropertyChanged(nameof(ResultsCount));
                OnPropertyChanged(nameof(HasResults));
                _log?.LogInformation($"Loaded {result.Data.Count} Environment Risk records");
            }
            catch (Exception ex)
            {
                _log?.LogError(ex, "Error loading Environment Risk CSV data");
                ShowError("Data Load Failed", ex.Message);
            }
            finally
            {
                IsProcessing = false;
            }
        }

        private async Task RunAssessmentAsync()
        {
            try
            {
                IsProcessing = true;
                StatusText = "Running Assessment";
                ProcessingMessage = "Executing Environment Risk Assessment...";
                await LoadFromCsvAsync(new System.Collections.Generic.List<dynamic>());
                StatusText = "Assessment Complete";
            }
            catch (Exception ex)
            {
                _log?.LogError(ex, "Error running Environment Risk Assessment");
                ShowError("Assessment Error", ex.Message);
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
                _log?.LogInformation("Exporting Environment Risk data");
                await Task.CompletedTask;
            }
            catch (Exception ex) { _log?.LogError(ex, "Error exporting data"); ShowError("Export Failed", ex.Message); }
        }

        protected override async Task ViewLogsAsync()
        {
            try
            {
                _log?.LogInformation("Viewing Environment Risk logs");
                await Task.CompletedTask;
                // Navigation to logs view can be implemented here if needed
            }
            catch (Exception ex) { _log?.LogError(ex, "Error viewing logs"); ShowError("View Logs Failed", ex.Message); }
        }

        private void CalculateSummaryStatistics(System.Collections.Generic.List<dynamic> data)
        {
            TotalAssessments = data.Count;

            // Detect environment type
            DetectedEnvironment = DetectEnvironmentType(data);

            // Base risk calculations
            HighRiskCount = data.Count(item =>
            {
                var dict = (System.Collections.Generic.IDictionary<string, object>)item;
                dict.TryGetValue("risklevel", out var riskObj);
                return riskObj?.ToString().ToLower().Contains("high") ?? false;
            });
            MediumRiskCount = data.Count(item =>
            {
                var dict = (System.Collections.Generic.IDictionary<string, object>)item;
                dict.TryGetValue("risklevel", out var riskObj);
                return riskObj?.ToString().ToLower().Contains("medium") ?? false;
            });

            // Environment-specific calculations
            switch (DetectedEnvironment)
            {
                case EnvironmentType.Azure:
                    AzureSecurityGaps = data.Count(item => IsAzureSecurityGap(item));
                    MigrationBlockers = data.Count(item =>
                    {
                        var dict = (System.Collections.Generic.IDictionary<string, object>)item;
                        dict.TryGetValue("category", out var catObj);
                        return catObj?.ToString().ToLower().Contains("compatibility") ?? false;
                    });
                    break;

                case EnvironmentType.OnPrem:
                    MigrationBlockers = data.Count(item =>
                    {
                        var dict = (System.Collections.Generic.IDictionary<string, object>)item;
                        dict.TryGetValue("severity", out var sevObj);
                        return sevObj?.ToString().ToLower().Contains("blocker") ?? false;
                    });
                    AzureSecurityGaps = 0; // Not applicable for on-prem
                    break;

                case EnvironmentType.Hybrid:
                    AzureSecurityGaps = data.Count(item => IsAzureSecurityGap(item));
                    MigrationBlockers = data.Count(item =>
                    {
                        var dict = (System.Collections.Generic.IDictionary<string, object>)item;
                        dict.TryGetValue("category", out var catObj);
                        return (catObj?.ToString().ToLower().Contains("compatibility") ?? false) ||
                               (catObj?.ToString().ToLower().Contains("integration") ?? false);
                    });
                    break;

                default:
                    AzureSecurityGaps = 0;
                    MigrationBlockers = 0;
                    break;
            }

            // Set last assessment date
            LastAssessmentTime = data.Max(item =>
            {
                var dict = (System.Collections.Generic.IDictionary<string, object>)item;
                dict.TryGetValue("assessmentdate", out var dateObj);
                return DateTime.TryParse(dateObj?.ToString(), out var parsedDate) ? parsedDate : DateTime.MinValue;
            });
            if (LastAssessmentTime == DateTime.MinValue) LastAssessmentTime = DateTime.Now;
        }

        private EnvironmentType DetectEnvironmentType(System.Collections.Generic.List<dynamic> data)
        {
            int azureCount = 0, honorCount = 0, hybridCount = 0;

            foreach (var item in data)
            {
                var dict = (System.Collections.Generic.IDictionary<string, object>)item;

                // Check category field for environment indicators
                if (dict.TryGetValue("category", out var catObj))
                {
                    var category = catObj?.ToString().ToLower() ?? "";
                    if (category.Contains("azure")) azureCount++;
                    else if (category.Contains("on-prem") || category.Contains("onprem")) honorCount++;
                    else if (category.Contains("hybrid")) hybridCount++;
                }

                // Check status field for mix of environments
                if (dict.TryGetValue("status", out var statusObj))
                {
                    var status = statusObj?.ToString().ToLower() ?? "";
                    if (status.Contains("azure")) azureCount++;
                    else if (status.Contains("on-prem")) honorCount++;
                }
            }

            // Determine dominant environment
            if (hybridCount > azureCount && hybridCount > honorCount) return EnvironmentType.Hybrid;
            if (azureCount > honorCount) return EnvironmentType.Azure;
            if (honorCount > 0) return EnvironmentType.OnPrem;

            return EnvironmentType.Unknown;
        }

        private bool IsAzureSecurityGap(dynamic item)
        {
            var dict = (System.Collections.Generic.IDictionary<string, object>)item;
            if (dict.TryGetValue("severity", out var sevObj) && dict.TryGetValue("category", out var catObj))
            {
                var severity = sevObj?.ToString().ToLower() ?? "";
                var category = catObj?.ToString().ToLower() ?? "";
                return (severity.Contains("high") || severity.Contains("critical")) &&
                       (category.Contains("security") || category.Contains("compliance"));
            }
            return false;
        }
    }
}