using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.ComponentModel;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Management.Automation;
using System.Threading.Tasks;
using System.Windows;
using System.Windows.Input;
using Microsoft.Extensions.Logging;
using MandADiscoverySuite.Models;
using MandADiscoverySuite.Services;

namespace MandADiscoverySuite.ViewModels
{
    public class ReportsViewModel : BaseViewModel
    {
        private readonly CsvDataServiceNew _csvDataService;
        private readonly string _enterpriseDiscoveryPath = @"C:\enterprisediscovery";
        private readonly string _rawDataOutputPath = @"C:\discoverydata\ljpops\Raw";
        
        // Template Library Panel
        private ObservableCollection<ReportTemplate> _reportTemplates;
        private ReportTemplate _selectedTemplate;
        private string _templateSearchText;
        private string _selectedCategory;
        
        // Configuration Panel
        private ReportDefinition _currentReport;
        private ObservableCollection<DataSourceInfo> _availableDataSources;
        private DataSourceInfo _selectedDataSource;
        private ObservableCollection<ReportParameter> _reportParameters;
        
        // Preview Panel
        private ObservableCollection<dynamic> _previewData;
        private string _reportPreviewHtml;
        private bool _isPreviewMode;
        private int _previewRowCount;
        
        // Generation & Export
        private ObservableCollection<GeneratedReport> _generatedReports;
        private ObservableCollection<ReportSchedule> _reportSchedules;
        private bool _isGenerating;
        private string _generationProgress;

        public ReportsViewModel(ILogger<ReportsViewModel> logger = null, CsvDataServiceNew csvDataService = null) 
            : base(logger)
        {
            _csvDataService = csvDataService ?? SimpleServiceLocator.Instance.GetService<CsvDataServiceNew>() ?? new CsvDataServiceNew(SimpleServiceLocator.Instance.GetService<ILogger<CsvDataServiceNew>>());
            
            TabTitle = "Reports";
            CanClose = true;
            
            InitializeCollections();
            InitializeCommands();
            
            // Don't call async methods in constructor - this can cause crashes
            // LoadTemplatesAsync will be called via LoadAsync() method instead
        }

        #region Properties

        // Template Library
        public ObservableCollection<ReportTemplate> ReportTemplates
        {
            get => _reportTemplates;
            set => SetProperty(ref _reportTemplates, value);
        }

        public ReportTemplate SelectedTemplate
        {
            get => _selectedTemplate;
            set => SetProperty(ref _selectedTemplate, value, OnSelectedTemplateChanged);
        }

        public string TemplateSearchText
        {
            get => _templateSearchText;
            set => SetProperty(ref _templateSearchText, value, FilterTemplates);
        }

        public string SelectedCategory
        {
            get => _selectedCategory;
            set => SetProperty(ref _selectedCategory, value, FilterTemplates);
        }

        public ObservableCollection<string> AvailableCategories { get; private set; }

        // Configuration Panel
        public ReportDefinition CurrentReport
        {
            get => _currentReport;
            set => SetProperty(ref _currentReport, value);
        }

        public ObservableCollection<DataSourceInfo> AvailableDataSources
        {
            get => _availableDataSources;
            set => SetProperty(ref _availableDataSources, value);
        }

        public DataSourceInfo SelectedDataSource
        {
            get => _selectedDataSource;
            set => SetProperty(ref _selectedDataSource, value, OnDataSourceChanged);
        }

        public ObservableCollection<ReportParameter> ReportParameters
        {
            get => _reportParameters;
            set => SetProperty(ref _reportParameters, value);
        }

        // Preview Panel
        public ObservableCollection<dynamic> PreviewData
        {
            get => _previewData;
            set => SetProperty(ref _previewData, value);
        }

        public string ReportPreviewHtml
        {
            get => _reportPreviewHtml;
            set => SetProperty(ref _reportPreviewHtml, value);
        }

        public bool IsPreviewMode
        {
            get => _isPreviewMode;
            set => SetProperty(ref _isPreviewMode, value);
        }

        public int PreviewRowCount
        {
            get => _previewRowCount;
            set => SetProperty(ref _previewRowCount, value);
        }

        // Generation & Export
        public ObservableCollection<GeneratedReport> GeneratedReports
        {
            get => _generatedReports;
            set => SetProperty(ref _generatedReports, value);
        }

        public ObservableCollection<ReportSchedule> ReportSchedules
        {
            get => _reportSchedules;
            set => SetProperty(ref _reportSchedules, value);
        }

        public bool IsGenerating
        {
            get => _isGenerating;
            set => SetProperty(ref _isGenerating, value);
        }

        public string GenerationProgress
        {
            get => _generationProgress;
            set => SetProperty(ref _generationProgress, value);
        }

        #endregion

        #region Commands

        public ICommand NewReportCommand { get; private set; }
        public ICommand LoadTemplateCommand { get; private set; }
        public ICommand SaveTemplateCommand { get; private set; }
        public ICommand DeleteTemplateCommand { get; private set; }
        public ICommand RefreshDataSourcesCommand { get; private set; }
        public ICommand PreviewReportCommand { get; private set; }
        public ICommand GenerateReportCommand { get; private set; }
        public ICommand ExportReportCommand { get; private set; }
        public ICommand ScheduleReportCommand { get; private set; }
        public ICommand OpenReportCommand { get; private set; }
        public ICommand DeleteReportCommand { get; private set; }
        public ICommand RefreshTemplatesCommand { get; private set; }

        #endregion

        #region Initialization

        private void InitializeCollections()
        {
            ReportTemplates = new ObservableCollection<ReportTemplate>();
            AvailableDataSources = new ObservableCollection<DataSourceInfo>();
            ReportParameters = new ObservableCollection<ReportParameter>();
            PreviewData = new ObservableCollection<dynamic>();
            GeneratedReports = new ObservableCollection<GeneratedReport>();
            ReportSchedules = new ObservableCollection<ReportSchedule>();
            AvailableCategories = new ObservableCollection<string>
            {
                "All", "User Reports", "System Reports", "Compliance", "Security", "Migration", "Analytics"
            };
            
            // Initialize with a new blank report
            CurrentReport = new ReportDefinition
            {
                Name = "New Report",
                Description = "Custom report",
                ReportType = ReportType.Table
            };
        }

        protected override void InitializeCommands()
        {
            NewReportCommand = new RelayCommand(CreateNewReport);
            LoadTemplateCommand = new AsyncRelayCommand(LoadSelectedTemplateAsync);
            SaveTemplateCommand = new AsyncRelayCommand(SaveCurrentAsTemplateAsync);
            DeleteTemplateCommand = new AsyncRelayCommand(DeleteSelectedTemplateAsync);
            RefreshDataSourcesCommand = new AsyncRelayCommand(RefreshDataSourcesAsync);
            PreviewReportCommand = new AsyncRelayCommand(PreviewCurrentReportAsync);
            GenerateReportCommand = new AsyncRelayCommand(GenerateCurrentReportAsync);
            ExportReportCommand = new RelayCommand<ReportOutputFormat>(format => Task.Run(() => ExportReportAsync(format)));
            ScheduleReportCommand = new AsyncRelayCommand(ScheduleCurrentReportAsync);
            OpenReportCommand = new RelayCommand<GeneratedReport>(OpenGeneratedReport);
            DeleteReportCommand = new RelayCommand<GeneratedReport>(DeleteGeneratedReport);
            RefreshTemplatesCommand = new AsyncRelayCommand(LoadTemplatesAsync);
        }

        #endregion

        #region Template Management

        private async Task LoadTemplatesAsync()
        {
            try
            {
                IsLoading = true;
                LoadingMessage = "Loading report templates...";
                
                // Create built-in templates
                var templates = CreateBuiltInTemplates();
                
                // TODO: Load user-created templates from file system
                
                await Application.Current.Dispatcher.InvokeAsync(() =>
                {
                    ReportTemplates.Clear();
                    foreach (var template in templates)
                    {
                        ReportTemplates.Add(template);
                    }
                });
                
                _log?.LogInformation("Loaded {Count} report templates", templates.Count);
            }
            catch (Exception ex)
            {
                _log?.LogError(ex, "Failed to load report templates");
                ErrorMessage = $"Failed to load templates: {ex.Message}";
            }
            finally
            {
                IsLoading = false;
            }
        }

        private void OnSelectedTemplateChanged()
        {
            if (SelectedTemplate?.Definition != null)
            {
                LoadTemplateCommand?.Execute(null);
            }
        }

        private async Task LoadSelectedTemplateAsync()
        {
            if (SelectedTemplate?.Definition == null) return;
            
            try
            {
                // Deep copy the template definition
                CurrentReport = CloneReportDefinition(SelectedTemplate.Definition);
                CurrentReport.Name = $"{SelectedTemplate.Name} - Copy";
                CurrentReport.IsTemplate = false;
                
                // Load data source information
                await RefreshDataSourcesAsync();
                
                // Set default data source if available
                if (CurrentReport.DataSources.Any() && AvailableDataSources.Any())
                {
                    var dataSourceType = CurrentReport.DataSources.First().Type;
                    SelectedDataSource = AvailableDataSources.FirstOrDefault(ds => ds.Type == dataSourceType);
                }
                
                StatusMessage = $"Loaded template: {SelectedTemplate.Name}";
            }
            catch (Exception ex)
            {
                _log?.LogError(ex, "Failed to load template {TemplateName}", SelectedTemplate?.Name);
                ErrorMessage = $"Failed to load template: {ex.Message}";
            }
        }

        private void FilterTemplates()
        {
            // TODO: Implement filtering logic based on search text and category
            // For now, this is a placeholder
        }

        #endregion

        #region Data Source Management

        private async Task RefreshDataSourcesAsync()
        {
            try
            {
                IsLoading = true;
                LoadingMessage = "Discovering available data sources...";
                
                var dataSources = await DiscoverDataSourcesAsync();
                
                await Application.Current.Dispatcher.InvokeAsync(() =>
                {
                    AvailableDataSources.Clear();
                    foreach (var dataSource in dataSources)
                    {
                        AvailableDataSources.Add(dataSource);
                    }
                });
                
                _log?.LogInformation("Discovered {Count} data sources", dataSources.Count);
            }
            catch (Exception ex)
            {
                _log?.LogError(ex, "Failed to refresh data sources");
                ErrorMessage = $"Failed to refresh data sources: {ex.Message}";
            }
            finally
            {
                IsLoading = false;
            }
        }

        private async Task<System.Collections.Generic.List<DataSourceInfo>> DiscoverDataSourcesAsync()
        {
            var dataSources = new System.Collections.Generic.List<DataSourceInfo>();
            
            // Check for CSV files in the raw data output directory
            if (Directory.Exists(_rawDataOutputPath))
            {
                var csvFiles = Directory.GetFiles(_rawDataOutputPath, "*.csv", SearchOption.AllDirectories);
                
                foreach (var csvFile in csvFiles)
                {
                    var fileName = Path.GetFileNameWithoutExtension(csvFile);
                    var dataSourceType = DetermineDataSourceType(fileName);
                    
                    dataSources.Add(new DataSourceInfo
                    {
                        Name = fileName,
                        Type = dataSourceType,
                        FilePath = csvFile,
                        LastUpdated = File.GetLastWriteTime(csvFile),
                        RecordCount = await CountCsvRecordsAsync(csvFile)
                    });
                }
            }
            
            return dataSources.OrderBy(ds => ds.Name).ToList();
        }

        private DataSourceType DetermineDataSourceType(string fileName)
        {
            var lowerName = fileName.ToLowerInvariant();
            
            if (lowerName.Contains("user")) return DataSourceType.Users;
            if (lowerName.Contains("group")) return DataSourceType.Groups;
            if (lowerName.Contains("computer")) return DataSourceType.Computers;
            if (lowerName.Contains("application")) return DataSourceType.Applications;
            if (lowerName.Contains("infrastructure")) return DataSourceType.Infrastructure;
            if (lowerName.Contains("wave")) return DataSourceType.MigrationWaves;
            if (lowerName.Contains("discovery")) return DataSourceType.DiscoveryResults;
            
            return DataSourceType.Custom;
        }

        private async Task<int> CountCsvRecordsAsync(string filePath)
        {
            try
            {
                var lines = await File.ReadAllLinesAsync(filePath);
                return Math.Max(0, lines.Length - 1); // Subtract header row
            }
            catch
            {
                return 0;
            }
        }

        private void OnDataSourceChanged()
        {
            if (SelectedDataSource != null)
            {
                // Update current report with selected data source
                CurrentReport.DataSources.Clear();
                CurrentReport.DataSources.Add(new ReportDataSource
                {
                    Name = SelectedDataSource.Name,
                    Type = SelectedDataSource.Type,
                    ConnectionString = SelectedDataSource.FilePath
                });
                
                // Auto-preview if data source is selected
                Task.Run(PreviewCurrentReportAsync);
            }
        }

        #endregion

        #region Report Generation

        private async Task PreviewCurrentReportAsync()
        {
            if (CurrentReport == null || !CurrentReport.DataSources.Any()) return;
            
            try
            {
                IsLoading = true;
                LoadingMessage = "Generating report preview...";
                
                var dataSource = SelectedDataSource;
                if (dataSource?.FilePath != null && File.Exists(dataSource.FilePath))
                {
                    // Load preview data from CSV using direct file reading
                    var previewData = await LoadCsvPreviewAsync(dataSource.FilePath);
                    
                    await Application.Current.Dispatcher.InvokeAsync(() =>
                    {
                        PreviewData.Clear();
                        foreach (var row in previewData.Take(50)) // Limit preview to 50 rows
                        {
                            PreviewData.Add(row);
                        }
                        PreviewRowCount = previewData.Count;
                        IsPreviewMode = true;
                    });
                }
                
                StatusMessage = $"Preview generated with {PreviewRowCount} rows";
            }
            catch (Exception ex)
            {
                _log?.LogError(ex, "Failed to generate report preview");
                ErrorMessage = $"Preview failed: {ex.Message}";
            }
            finally
            {
                IsLoading = false;
            }
        }

        private async Task GenerateCurrentReportAsync()
        {
            if (CurrentReport == null) return;
            
            try
            {
                IsGenerating = true;
                GenerationProgress = "Initializing report generation...";
                
                // Execute PowerShell ReportingEngine module
                await ExecuteReportingModuleAsync();
                
                // Create generated report record
                var generatedReport = new GeneratedReport
                {
                    ReportId = CurrentReport.Id,
                    Name = CurrentReport.Name,
                    GeneratedDate = DateTime.Now,
                    Status = ReportStatus.Completed,
                    FilePath = Path.Combine(_rawDataOutputPath, "Reports", $"{CurrentReport.Name}_{DateTime.Now:yyyyMMdd_HHmmss}.pdf"),
                    RecordCount = PreviewRowCount,
                    GeneratedBy = Environment.UserName
                };
                
                await Application.Current.Dispatcher.InvokeAsync(() =>
                {
                    GeneratedReports.Add(generatedReport);
                });
                
                StatusMessage = $"Report generated successfully: {generatedReport.Name}";
            }
            catch (Exception ex)
            {
                _log?.LogError(ex, "Failed to generate report");
                ErrorMessage = $"Report generation failed: {ex.Message}";
            }
            finally
            {
                IsGenerating = false;
                GenerationProgress = string.Empty;
            }
        }

        private async Task ExecuteReportingModuleAsync()
        {
            try
            {
                var processInfo = new ProcessStartInfo
                {
                    FileName = "powershell.exe",
                    Arguments = $"-NoProfile -ExecutionPolicy Bypass -Command \"" +
                               $"Set-Location '{_enterpriseDiscoveryPath}'; " +
                               $"Import-Module '.\\Modules\\Reporting\\ReportingEngine.psm1' -Force; " +
                               $"Invoke-ReportGeneration -ReportName '{CurrentReport.Name}' -CompanyName 'ljpops'\"",
                    UseShellExecute = true,
                    CreateNoWindow = false,
                    WorkingDirectory = _enterpriseDiscoveryPath
                };
                
                GenerationProgress = "Executing PowerShell reporting module...";
                
                using var process = Process.Start(processInfo);
                if (process != null)
                {
                    await process.WaitForExitAsync();
                    _log?.LogInformation("ReportingEngine module executed with exit code: {ExitCode}", process.ExitCode);
                }
            }
            catch (Exception ex)
            {
                _log?.LogError(ex, "Failed to execute ReportingEngine module");
                throw;
            }
        }

        private async Task ExportReportAsync(ReportOutputFormat format)
        {
            // TODO: Implement export functionality
            await Task.Delay(1000);
            StatusMessage = $"Report exported in {format} format";
        }

        #endregion

        #region Utility Methods

        private void CreateNewReport()
        {
            CurrentReport = new ReportDefinition
            {
                Name = "New Report",
                Description = "Custom report",
                ReportType = ReportType.Table,
                CreatedBy = Environment.UserName
            };
            
            SelectedTemplate = null;
            PreviewData.Clear();
            IsPreviewMode = false;
            
            StatusMessage = "New report created";
        }

        private async Task SaveCurrentAsTemplateAsync()
        {
            if (CurrentReport == null) return;
            
            try
            {
                var template = new ReportTemplate
                {
                    Name = $"{CurrentReport.Name} Template",
                    Description = CurrentReport.Description,
                    Category = "Custom",
                    Definition = CloneReportDefinition(CurrentReport),
                    IsBuiltIn = false
                };
                
                template.Definition.IsTemplate = true;
                
                await Application.Current.Dispatcher.InvokeAsync(() =>
                {
                    ReportTemplates.Add(template);
                });
                
                StatusMessage = $"Template saved: {template.Name}";
            }
            catch (Exception ex)
            {
                _log?.LogError(ex, "Failed to save template");
                ErrorMessage = $"Failed to save template: {ex.Message}";
            }
        }

        private async Task DeleteSelectedTemplateAsync()
        {
            if (SelectedTemplate?.IsBuiltIn == false)
            {
                await Application.Current.Dispatcher.InvokeAsync(() =>
                {
                    ReportTemplates.Remove(SelectedTemplate);
                });
                StatusMessage = "Template deleted";
            }
        }

        private async Task ScheduleCurrentReportAsync()
        {
            // TODO: Implement scheduling functionality
            await Task.Delay(100);
            StatusMessage = "Report scheduling not yet implemented";
        }

        private void OpenGeneratedReport(GeneratedReport report)
        {
            if (report?.FilePath != null && File.Exists(report.FilePath))
            {
                Process.Start(new ProcessStartInfo(report.FilePath) { UseShellExecute = true });
            }
        }

        private void DeleteGeneratedReport(GeneratedReport report)
        {
            if (report != null)
            {
                GeneratedReports.Remove(report);
                if (report.FilePath != null && File.Exists(report.FilePath))
                {
                    try
                    {
                        File.Delete(report.FilePath);
                    }
                    catch (Exception ex)
                    {
                        _log?.LogWarning(ex, "Failed to delete report file: {FilePath}", report.FilePath);
                    }
                }
            }
        }

        private ReportDefinition CloneReportDefinition(ReportDefinition source)
        {
            // Simple clone - in production, use proper deep cloning
            return new ReportDefinition
            {
                Name = source.Name,
                Description = source.Description,
                ReportType = source.ReportType,
                Category = source.Category
            };
        }

        private System.Collections.Generic.List<ReportTemplate> CreateBuiltInTemplates()
        {
            return new System.Collections.Generic.List<ReportTemplate>
            {
                new ReportTemplate
                {
                    Name = "User Summary Report",
                    Description = "Overview of all discovered users",
                    Category = "User Reports",
                    IsBuiltIn = true,
                    Definition = new ReportDefinition
                    {
                        Name = "User Summary Report",
                        ReportType = ReportType.Summary,
                        DataSources = { new ReportDataSource { Type = DataSourceType.Users } }
                    }
                },
                new ReportTemplate
                {
                    Name = "Application Inventory",
                    Description = "Complete inventory of applications",
                    Category = "System Reports",
                    IsBuiltIn = true,
                    Definition = new ReportDefinition
                    {
                        Name = "Application Inventory",
                        ReportType = ReportType.Table,
                        DataSources = { new ReportDataSource { Type = DataSourceType.Applications } }
                    }
                },
                new ReportTemplate
                {
                    Name = "Migration Wave Status",
                    Description = "Status of migration waves",
                    Category = "Migration",
                    IsBuiltIn = true,
                    Definition = new ReportDefinition
                    {
                        Name = "Migration Wave Status",
                        ReportType = ReportType.Dashboard,
                        DataSources = { new ReportDataSource { Type = DataSourceType.MigrationWaves } }
                    }
                }
            };
        }

        #endregion

        #region Unified Loading Pipeline

        public override async Task LoadAsync()
        {
            IsLoading = true;
            HasData = false;
            LastError = null;
            HeaderWarnings.Clear();

            try
            {
                _log?.LogDebug($"[{GetType().Name}] Load start");
                
                // Load templates and data sources
                await LoadTemplatesAsync();
                await RefreshDataSourcesAsync();
                
                HasData = ReportTemplates.Any() || AvailableDataSources.Any();
                
                _log?.LogInformation($"[{GetType().Name}] Load ok templates={ReportTemplates.Count} datasources={AvailableDataSources.Count}");
            }
            catch (Exception ex)
            {
                LastError = $"Failed to load reports: {ex.Message}";
                _log?.LogError($"[{GetType().Name}] Load fail ex={ex}");
            }
            finally
            {
                IsLoading = false;
            }
        }

        #endregion

        #region CSV Loading Helper

        private async Task<List<dynamic>> LoadCsvPreviewAsync(string filePath)
        {
            var result = new List<dynamic>();
            try
            {
                if (!File.Exists(filePath)) return result;
                
                var lines = await File.ReadAllLinesAsync(filePath);
                if (lines.Length == 0) return result;
                
                // Parse header row
                var headers = lines[0].Split(',').Select(h => h.Trim().Trim('"')).ToArray();
                
                // Parse data rows (limit to first 100 for preview)
                for (int i = 1; i < Math.Min(lines.Length, 101); i++)
                {
                    var values = lines[i].Split(',').Select(v => v.Trim().Trim('"')).ToArray();
                    
                    // Create dynamic object
                    var row = new System.Dynamic.ExpandoObject() as IDictionary<string, object>;
                    for (int j = 0; j < Math.Min(headers.Length, values.Length); j++)
                    {
                        row[headers[j]] = values[j];
                    }
                    result.Add(row);
                }
            }
            catch (Exception ex)
            {
                _log?.LogError(ex, "Failed to load CSV preview from {FilePath}", filePath);
            }
            return result;
        }

        #endregion

        protected override void OnDisposing()
        {
            ReportTemplates?.Clear();
            AvailableDataSources?.Clear();
            PreviewData?.Clear();
            GeneratedReports?.Clear();
            ReportSchedules?.Clear();
            
            base.OnDisposing();
        }
    }

    // Helper classes for the ReportsViewModel
    public class DataSourceInfo
    {
        public string Name { get; set; }
        public DataSourceType Type { get; set; }
        public string FilePath { get; set; }
        public DateTime LastUpdated { get; set; }
        public int RecordCount { get; set; }
        public string DisplayName => $"{Name} ({RecordCount:N0} records)";
    }

    public class GeneratedReport
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();
        public string ReportId { get; set; }
        public string Name { get; set; }
        public DateTime GeneratedDate { get; set; }
        public ReportStatus Status { get; set; }
        public string FilePath { get; set; }
        public int RecordCount { get; set; }
        public string GeneratedBy { get; set; }
        public string DisplayName => $"{Name} - {GeneratedDate:yyyy-MM-dd HH:mm}";
    }

    public enum ReportStatus
    {
        Pending,
        Running,
        Completed,
        Failed
    }
}