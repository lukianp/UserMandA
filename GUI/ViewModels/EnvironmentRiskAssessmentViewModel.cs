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

        private int _highRisk;
        public int HighRisk { get => _highRisk; set => SetProperty(ref _highRisk, value); }

        private int _mediumRisk;
        public int MediumRisk { get => _mediumRisk; set => SetProperty(ref _mediumRisk, value); }

        public ObservableCollection<dynamic> SelectedResults { get; } = new();
        private object _selectedItem;
        public object SelectedItem { get => _selectedItem; set => SetProperty(ref _selectedItem, value); }

        // Commands
        public AsyncRelayCommand RunDiscoveryCommand => new AsyncRelayCommand(RunDiscoveryAsync);
        public AsyncRelayCommand RefreshDataCommand => new AsyncRelayCommand(RefreshDataAsync);
        public AsyncRelayCommand ExportCommand => new AsyncRelayCommand(ExportDataAsync);

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

        private async Task RunDiscoveryAsync()
        {
            try
            {
                IsProcessing = true;
                StatusText = "Running Discovery";
                ProcessingMessage = "Executing Environment Risk Assessment...";
                await LoadFromCsvAsync(new System.Collections.Generic.List<dynamic>());
                StatusText = "Discovery Complete";
            }
            catch (Exception ex)
            {
                _log?.LogError(ex, "Error running Environment Risk Assessment");
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
                _log?.LogInformation("Exporting Environment Risk data");
                await Task.CompletedTask;
            }
            catch (Exception ex) { _log?.LogError(ex, "Error exporting data"); ShowError("Export Failed", ex.Message); }
        }

        private void CalculateSummaryStatistics(System.Collections.Generic.List<dynamic> data)
        {
            TotalAssessments = data.Count;
            HighRisk = data.Count(item =>
            {
                var dict = (System.Collections.Generic.IDictionary<string, object>)item;
                dict.TryGetValue("risklevel", out var riskObj);
                return riskObj?.ToString().ToLower().Contains("high") ?? false;
            });
            MediumRisk = data.Count(item =>
            {
                var dict = (System.Collections.Generic.IDictionary<string, object>)item;
                dict.TryGetValue("risklevel", out var riskObj);
                return riskObj?.ToString().ToLower().Contains("medium") ?? false;
            });
        }
    }
}