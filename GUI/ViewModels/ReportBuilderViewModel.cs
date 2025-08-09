using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.ComponentModel;
using System.IO;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using System.Windows.Data;
using System.Windows.Input;
using Microsoft.Extensions.Logging;
using CommunityToolkit.Mvvm.Messaging;
using MandADiscoverySuite.Models;
using MandADiscoverySuite.Services;
using MandADiscoverySuite.Messages;

namespace MandADiscoverySuite.ViewModels
{
    public class ReportBuilderViewModel : BaseViewModel
    {
        private readonly IReportBuilderService _reportService;
        private ReportDefinition _currentReport;
        private ReportTemplate _selectedTemplate;
        private string _reportName;
        private string _reportDescription;
        private ReportType _selectedReportType;
        private string _selectedCategory;
        private bool _isDesignMode = true;
        private bool _isPreviewMode;
        private bool _isExecuting;
        private string _previewContent;
        private ReportExecution _currentExecution;
        private CancellationTokenSource _executionCancellation;

        public ReportBuilderViewModel(
            ILogger<ReportBuilderViewModel> logger = null,
            IMessenger messenger = null,
            IReportBuilderService reportService = null) 
            : base(logger, messenger)
        {
            _reportService = reportService ?? SimpleServiceLocator.GetService<IReportBuilderService>();

            // Initialize collections
            Reports = new ObservableCollection<ReportDefinition>();
            Templates = new ObservableCollection<ReportTemplate>();
            AvailableDataSources = new ObservableCollection<ReportDataSource>();
            SelectedDataSources = new ObservableCollection<ReportDataSource>();
            AvailableColumns = new ObservableCollection<ReportColumn>();
            SelectedColumns = new ObservableCollection<ReportColumn>();
            ReportFilters = new ObservableCollection<ReportFilter>();
            ReportGroupings = new ObservableCollection<ReportGrouping>();
            ReportSorting = new ObservableCollection<ReportSorting>();
            ExecutionHistory = new ObservableCollection<ReportExecution>();
            Categories = new ObservableCollection<string>();

            // Initialize collection views
            ReportsView = CollectionViewSource.GetDefaultView(Reports);
            TemplatesView = CollectionViewSource.GetDefaultView(Templates);

            InitializeCommands();
            InitializeNewReport();
            _ = LoadDataAsync();
        }

        #region Properties

        public ObservableCollection<ReportDefinition> Reports { get; }
        public ObservableCollection<ReportTemplate> Templates { get; }
        public ObservableCollection<ReportDataSource> AvailableDataSources { get; }
        public ObservableCollection<ReportDataSource> SelectedDataSources { get; }
        public ObservableCollection<ReportColumn> AvailableColumns { get; }
        public ObservableCollection<ReportColumn> SelectedColumns { get; }
        public ObservableCollection<ReportFilter> ReportFilters { get; }
        public ObservableCollection<ReportGrouping> ReportGroupings { get; }
        public ObservableCollection<ReportSorting> ReportSorting { get; }
        public ObservableCollection<ReportExecution> ExecutionHistory { get; }
        public ObservableCollection<string> Categories { get; }

        public ICollectionView ReportsView { get; }
        public ICollectionView TemplatesView { get; }

        public ReportDefinition CurrentReport
        {
            get => _currentReport;
            set => SetProperty(ref _currentReport, value);
        }

        public ReportTemplate SelectedTemplate
        {
            get => _selectedTemplate;
            set
            {
                if (SetProperty(ref _selectedTemplate, value))
                {
                    _ = ApplyTemplateAsync();
                }
            }
        }

        public string ReportName
        {
            get => _reportName;
            set
            {
                if (SetProperty(ref _reportName, value) && CurrentReport != null)
                {
                    CurrentReport.Name = value;
                }
            }
        }

        public string ReportDescription
        {
            get => _reportDescription;
            set
            {
                if (SetProperty(ref _reportDescription, value) && CurrentReport != null)
                {
                    CurrentReport.Description = value;
                }
            }
        }

        public ReportType SelectedReportType
        {
            get => _selectedReportType;
            set
            {
                if (SetProperty(ref _selectedReportType, value) && CurrentReport != null)
                {
                    CurrentReport.ReportType = value;
                }
            }
        }

        public string SelectedCategory
        {
            get => _selectedCategory;
            set
            {
                if (SetProperty(ref _selectedCategory, value) && CurrentReport != null)
                {
                    CurrentReport.Category = value;
                }
            }
        }

        public bool IsDesignMode
        {
            get => _isDesignMode;
            set => SetProperty(ref _isDesignMode, value);
        }

        public bool IsPreviewMode
        {
            get => _isPreviewMode;
            set => SetProperty(ref _isPreviewMode, value);
        }

        public bool IsExecuting
        {
            get => _isExecuting;
            set => SetProperty(ref _isExecuting, value);
        }

        public string PreviewContent
        {
            get => _previewContent;
            set => SetProperty(ref _previewContent, value);
        }

        public ReportExecution CurrentExecution
        {
            get => _currentExecution;
            set => SetProperty(ref _currentExecution, value);
        }

        // Computed properties
        public bool CanSaveReport => CurrentReport != null && !string.IsNullOrWhiteSpace(ReportName);
        public bool CanExecuteReport => CurrentReport != null && SelectedDataSources.Any() && SelectedColumns.Any();
        public bool CanPreviewReport => CanExecuteReport && !IsExecuting;
        public bool HasSelectedColumns => SelectedColumns.Any();
        public bool HasFilters => ReportFilters.Any();
        public int TotalColumns => SelectedColumns.Count;
        public int VisibleColumns => SelectedColumns.Count(c => c.IsVisible);

        #endregion

        #region Commands

        public ICommand NewReportCommand { get; private set; }
        public ICommand LoadReportCommand { get; private set; }
        public ICommand SaveReportCommand { get; private set; }
        public ICommand SaveAsReportCommand { get; private set; }
        public ICommand DeleteReportCommand { get; private set; }
        public ICommand CloneReportCommand { get; private set; }

        public ICommand AddDataSourceCommand { get; private set; }
        public ICommand RemoveDataSourceCommand { get; private set; }
        public ICommand RefreshDataSourcesCommand { get; private set; }

        public ICommand AddColumnCommand { get; private set; }
        public ICommand RemoveColumnCommand { get; private set; }
        public ICommand MoveColumnUpCommand { get; private set; }
        public ICommand MoveColumnDownCommand { get; private set; }
        public ICommand AddCalculatedColumnCommand { get; private set; }

        public ICommand AddFilterCommand { get; private set; }
        public ICommand RemoveFilterCommand { get; private set; }
        public ICommand EditFilterCommand { get; private set; }

        public ICommand AddGroupingCommand { get; private set; }
        public ICommand RemoveGroupingCommand { get; private set; }

        public ICommand AddSortingCommand { get; private set; }
        public ICommand RemoveSortingCommand { get; private set; }

        public ICommand PreviewReportCommand { get; private set; }
        public ICommand ExecuteReportCommand { get; private set; }
        public ICommand CancelExecutionCommand { get; private set; }
        public ICommand ExportReportCommand { get; private set; }

        public ICommand SwitchToDesignModeCommand { get; private set; }
        public ICommand SwitchToPreviewModeCommand { get; private set; }

        public ICommand CreateTemplateCommand { get; private set; }
        public ICommand ApplyTemplateCommand { get; private set; }

        protected override void InitializeCommands()
        {
            base.InitializeCommands();

            // Report management
            NewReportCommand = new RelayCommand(CreateNewReport);
            LoadReportCommand = new RelayCommand<ReportDefinition>(LoadReport);
            SaveReportCommand = new AsyncRelayCommand(SaveReportAsync, () => CanSaveReport);
            SaveAsReportCommand = new AsyncRelayCommand(SaveAsReportAsync);
            DeleteReportCommand = new RelayCommand<ReportDefinition>(report => DeleteReportAsync(report));
            CloneReportCommand = new RelayCommand<ReportDefinition>(report => CloneReportAsync(report));

            // Data sources
            AddDataSourceCommand = new RelayCommand<ReportDataSource>(AddDataSource);
            RemoveDataSourceCommand = new RelayCommand<ReportDataSource>(RemoveDataSource);
            RefreshDataSourcesCommand = new AsyncRelayCommand(RefreshDataSourcesAsync);

            // Columns
            AddColumnCommand = new RelayCommand<ReportColumn>(AddColumn);
            RemoveColumnCommand = new RelayCommand<ReportColumn>(RemoveColumn);
            MoveColumnUpCommand = new RelayCommand<ReportColumn>(MoveColumnUp);
            MoveColumnDownCommand = new RelayCommand<ReportColumn>(MoveColumnDown);
            AddCalculatedColumnCommand = new AsyncRelayCommand(AddCalculatedColumnAsync);

            // Filters
            AddFilterCommand = new AsyncRelayCommand(AddFilterAsync);
            RemoveFilterCommand = new RelayCommand<ReportFilter>(RemoveFilter);
            EditFilterCommand = new RelayCommand<ReportFilter>(EditFilter);

            // Grouping
            AddGroupingCommand = new AsyncRelayCommand(AddGroupingAsync);
            RemoveGroupingCommand = new RelayCommand<ReportGrouping>(RemoveGrouping);

            // Sorting
            AddSortingCommand = new AsyncRelayCommand(AddSortingAsync);
            RemoveSortingCommand = new RelayCommand<ReportSorting>(RemoveSorting);

            // Execution
            PreviewReportCommand = new AsyncRelayCommand(PreviewReportAsync, () => CanPreviewReport);
            ExecuteReportCommand = new AsyncRelayCommand(ExecuteReportAsync, () => CanExecuteReport);
            CancelExecutionCommand = new RelayCommand(CancelExecution, () => IsExecuting);
            ExportReportCommand = new AsyncRelayCommand(ExportReportAsync);

            // Mode switching
            SwitchToDesignModeCommand = new RelayCommand(() => { IsDesignMode = true; IsPreviewMode = false; });
            SwitchToPreviewModeCommand = new RelayCommand(() => { IsDesignMode = false; IsPreviewMode = true; });

            // Templates
            CreateTemplateCommand = new AsyncRelayCommand(CreateTemplateAsync);
            ApplyTemplateCommand = new AsyncRelayCommand(ApplyTemplateAsync);
        }

        #endregion

        #region Report Management

        private void CreateNewReport()
        {
            InitializeNewReport();
            IsDesignMode = true;
            IsPreviewMode = false;
            Logger?.LogInformation("Created new report");
        }

        private void LoadReport(ReportDefinition report)
        {
            if (report == null) return;

            CurrentReport = report;
            ReportName = report.Name;
            ReportDescription = report.Description;
            SelectedReportType = report.ReportType;
            SelectedCategory = report.Category;

            // Load report components
            LoadReportDataSources();
            LoadReportColumns();
            LoadReportFilters();
            LoadReportGroupings();
            LoadReportSorting();

            Logger?.LogInformation("Loaded report: {ReportName} ({ReportId})", report.Name, report.Id);
        }

        private async Task SaveReportAsync()
        {
            if (CurrentReport == null || string.IsNullOrWhiteSpace(ReportName))
                return;

            await ExecuteAsync(async () =>
            {
                UpdateCurrentReportFromUI();

                ReportDefinition savedReport;
                if (string.IsNullOrEmpty(CurrentReport.Id))
                {
                    savedReport = await _reportService.CreateReportAsync(CurrentReport);
                    Reports.Add(savedReport);
                }
                else
                {
                    savedReport = await _reportService.UpdateReportAsync(CurrentReport);
                    var existingIndex = Reports.ToList().FindIndex(r => r.Id == savedReport.Id);
                    if (existingIndex >= 0)
                        Reports[existingIndex] = savedReport;
                }

                CurrentReport = savedReport;
                Logger?.LogInformation("Saved report: {ReportName}", savedReport.Name);

            }, "Saving report");
        }

        private async Task SaveAsReportAsync()
        {
            if (CurrentReport == null) return;

            // Simple implementation: auto-generate copy name with timestamp
            var timestamp = DateTime.Now.ToString("yyyyMMdd_HHmmss");
            var newName = $"{ReportName} - Copy_{timestamp}";
            
            await ExecuteAsync(async () =>
            {
                var clonedReport = await _reportService.CloneReportAsync(CurrentReport.Id, newName);
                Reports.Add(clonedReport);
                LoadReport(clonedReport);
                
                Logger?.LogInformation("Saved report as: {ReportName}", newName);

            }, "Saving report as new");
        }

        private async Task DeleteReportAsync(ReportDefinition report)
        {
            if (report == null) return;

            await ExecuteAsync(async () =>
            {
                await _reportService.DeleteReportAsync(report.Id);
                Reports.Remove(report);
                
                if (CurrentReport?.Id == report.Id)
                    CreateNewReport();
                
                Logger?.LogInformation("Deleted report: {ReportName}", report.Name);

            }, "Deleting report");
        }

        private async Task CloneReportAsync(ReportDefinition report)
        {
            if (report == null) return;

            await ExecuteAsync(async () =>
            {
                var clonedReport = await _reportService.CloneReportAsync(report.Id);
                Reports.Add(clonedReport);
                LoadReport(clonedReport);
                
                Logger?.LogInformation("Cloned report: {ReportName}", clonedReport.Name);

            }, "Cloning report");
        }

        #endregion

        #region Data Source Management

        private void AddDataSource(ReportDataSource dataSource)
        {
            if (dataSource == null || SelectedDataSources.Contains(dataSource))
                return;

            SelectedDataSources.Add(dataSource);
            _ = RefreshAvailableColumnsAsync();
            
            OnPropertyChanged(nameof(CanExecuteReport));
            OnPropertyChanged(nameof(CanPreviewReport));
        }

        private void RemoveDataSource(ReportDataSource dataSource)
        {
            if (dataSource == null) return;

            SelectedDataSources.Remove(dataSource);
            
            // Remove columns from this data source
            var columnsToRemove = SelectedColumns.Where(c => c.FieldName.StartsWith($"{dataSource.Name}.")).ToList();
            foreach (var column in columnsToRemove)
            {
                SelectedColumns.Remove(column);
            }
            
            _ = RefreshAvailableColumnsAsync();
            
            OnPropertyChanged(nameof(CanExecuteReport));
            OnPropertyChanged(nameof(CanPreviewReport));
        }

        private async Task RefreshDataSourcesAsync()
        {
            await ExecuteAsync(async () =>
            {
                var dataSources = await _reportService.GetAvailableDataSourcesAsync();
                AvailableDataSources.Clear();
                foreach (var dataSource in dataSources)
                {
                    AvailableDataSources.Add(dataSource);
                }

            }, "Refreshing data sources");
        }

        #endregion

        #region Column Management

        private void AddColumn(ReportColumn column)
        {
            if (column == null || SelectedColumns.Contains(column))
                return;

            column.Order = SelectedColumns.Count + 1;
            SelectedColumns.Add(column);
            
            OnPropertyChanged(nameof(HasSelectedColumns));
            OnPropertyChanged(nameof(TotalColumns));
            OnPropertyChanged(nameof(VisibleColumns));
            OnPropertyChanged(nameof(CanExecuteReport));
            OnPropertyChanged(nameof(CanPreviewReport));
        }

        private void RemoveColumn(ReportColumn column)
        {
            if (column == null) return;

            SelectedColumns.Remove(column);
            ReorderColumns();
            
            OnPropertyChanged(nameof(HasSelectedColumns));
            OnPropertyChanged(nameof(TotalColumns));
            OnPropertyChanged(nameof(VisibleColumns));
            OnPropertyChanged(nameof(CanExecuteReport));
            OnPropertyChanged(nameof(CanPreviewReport));
        }

        private void MoveColumnUp(ReportColumn column)
        {
            if (column == null) return;

            var index = SelectedColumns.IndexOf(column);
            if (index > 0)
            {
                SelectedColumns.Move(index, index - 1);
                ReorderColumns();
            }
        }

        private void MoveColumnDown(ReportColumn column)
        {
            if (column == null) return;

            var index = SelectedColumns.IndexOf(column);
            if (index < SelectedColumns.Count - 1)
            {
                SelectedColumns.Move(index, index + 1);
                ReorderColumns();
            }
        }

        private async Task AddCalculatedColumnAsync()
        {
            // Simple implementation: create default calculated column
            var columnCount = CurrentReport.Columns.Count(c => c.DisplayName.StartsWith("Calculated"));
            var expression = "[Field1] + [Field2]"; // Default expression
            var displayName = $"Calculated Column {columnCount + 1}";
            var dataType = "String";

            if (string.IsNullOrWhiteSpace(expression))
                return;

            await ExecuteAsync(async () =>
            {
                var column = await _reportService.CreateCalculatedColumnAsync(expression, displayName, dataType);
                AddColumn(column);
                
            }, "Adding calculated column");
        }

        private async Task RefreshAvailableColumnsAsync()
        {
            if (!SelectedDataSources.Any())
            {
                AvailableColumns.Clear();
                return;
            }

            await ExecuteAsync(async () =>
            {
                var dataSourceIds = SelectedDataSources.Select(ds => ds.Id).ToList();
                var columns = await _reportService.GetAvailableColumnsAsync(dataSourceIds);
                
                AvailableColumns.Clear();
                foreach (var column in columns)
                {
                    AvailableColumns.Add(column);
                }

            }, "Refreshing available columns");
        }

        private void ReorderColumns()
        {
            for (int i = 0; i < SelectedColumns.Count; i++)
            {
                SelectedColumns[i].Order = i + 1;
            }
        }

        #endregion

        #region Filter Management

        private async Task AddFilterAsync()
        {
            if (!SelectedDataSources.Any())
                return;

            // Simple implementation: use first available column if any exist
            var fieldName = SelectedColumns?.FirstOrDefault()?.FieldName;
            if (string.IsNullOrWhiteSpace(fieldName))
            {
                StatusMessage = "No fields available to filter on";
                return;
            }

            await ExecuteAsync(async () =>
            {
                var filter = new ReportFilter
                {
                    FieldName = fieldName,
                    DisplayName = FormatDisplayName(fieldName),
                    Operator = ReportFilterOperator.Equals,
                    FilterType = ReportFilterType.TextBox,
                    IsEnabled = true,
                    IsUserEditable = true
                };

                // Get distinct values for dropdown filters
                var dataSourceId = SelectedDataSources.First().Id;
                var distinctValues = await _reportService.GetDistinctValuesAsync(dataSourceId, fieldName);
                filter.AvailableValues.AddRange(distinctValues);

                ReportFilters.Add(filter);
                OnPropertyChanged(nameof(HasFilters));
                
            }, "Adding filter");
        }

        private void RemoveFilter(ReportFilter filter)
        {
            if (filter == null) return;

            ReportFilters.Remove(filter);
            OnPropertyChanged(nameof(HasFilters));
        }

        private void EditFilter(ReportFilter filter)
        {
            if (filter == null) return;

            // Simple implementation: toggle filter enabled state
            filter.IsEnabled = !filter.IsEnabled;
            Logger?.LogInformation("Toggled filter: {FilterName} to {State}", filter.DisplayName, filter.IsEnabled ? "enabled" : "disabled");
            StatusMessage = $"Filter '{filter.DisplayName}' {(filter.IsEnabled ? "enabled" : "disabled")}";
        }

        #endregion

        #region Grouping Management

        private async Task AddGroupingAsync()
        {
            if (!SelectedColumns.Any())
                return;

            // Simple implementation: use first selected column or first available column
            var fieldName = SelectedColumns?.FirstOrDefault()?.FieldName ?? AvailableColumns?.FirstOrDefault()?.FieldName;
            
            await Task.Delay(1);
            
            var grouping = new ReportGrouping
            {
                FieldName = fieldName,
                DisplayName = FormatDisplayName(fieldName),
                Level = ReportGroupings.Count + 1,
                SortDirection = ReportSortDirection.Ascending,
                ShowGroupHeader = true
            };

            ReportGroupings.Add(grouping);
        }

        private void RemoveGrouping(ReportGrouping grouping)
        {
            if (grouping == null) return;

            ReportGroupings.Remove(grouping);
            
            // Reorder levels
            for (int i = 0; i < ReportGroupings.Count; i++)
            {
                ReportGroupings[i].Level = i + 1;
            }
        }

        #endregion

        #region Sorting Management

        private async Task AddSortingAsync()
        {
            if (!SelectedColumns.Any())
                return;

            // Simple implementation: use first selected column or first available column
            var fieldName = SelectedColumns?.FirstOrDefault()?.FieldName ?? AvailableColumns?.FirstOrDefault()?.FieldName;
            
            await Task.Delay(1);
            
            var sorting = new ReportSorting
            {
                FieldName = fieldName,
                Direction = ReportSortDirection.Ascending,
                Priority = ReportSorting.Count + 1
            };

            ReportSorting.Add(sorting);
        }

        private void RemoveSorting(ReportSorting sorting)
        {
            if (sorting == null) return;

            ReportSorting.Remove(sorting);
            
            // Reorder priorities
            for (int i = 0; i < ReportSorting.Count; i++)
            {
                ReportSorting[i].Priority = i + 1;
            }
        }

        #endregion

        #region Report Execution

        private async Task PreviewReportAsync()
        {
            if (!CanPreviewReport)
                return;

            await ExecuteAsync(async () =>
            {
                UpdateCurrentReportFromUI();
                IsExecuting = true;
                _executionCancellation = new CancellationTokenSource();

                try
                {
                    var previewHtml = await _reportService.GenerateReportPreviewAsync(
                        CurrentReport.Id, 
                        null, 
                        _executionCancellation.Token);
                    
                    PreviewContent = previewHtml;
                    IsPreviewMode = true;
                    IsDesignMode = false;
                }
                finally
                {
                    IsExecuting = false;
                }

            }, "Generating preview");
        }

        private async Task ExecuteReportAsync()
        {
            if (!CanExecuteReport)
                return;

            await ExecuteAsync(async () =>
            {
                UpdateCurrentReportFromUI();
                IsExecuting = true;
                _executionCancellation = new CancellationTokenSource();

                try
                {
                    var execution = await _reportService.ExecuteReportAsync(
                        CurrentReport, 
                        null, 
                        _executionCancellation.Token);
                    
                    CurrentExecution = execution;
                    ExecutionHistory.Insert(0, execution);
                    
                    if (execution.Status == ReportExecutionStatus.Completed)
                    {
                        Logger?.LogInformation("Report execution completed: {RecordCount} records in {Duration}ms", 
                            execution.RecordCount, execution.Duration.TotalMilliseconds);
                        
                        // Generate preview after execution
                        await PreviewReportAsync();
                    }
                }
                finally
                {
                    IsExecuting = false;
                }

            }, "Executing report");
        }

        private void CancelExecution()
        {
            _executionCancellation?.Cancel();
            IsExecuting = false;
            Logger?.LogInformation("Cancelled report execution");
        }

        private async Task ExportReportAsync()
        {
            if (CurrentExecution?.Status != ReportExecutionStatus.Completed)
                return;

            await ExecuteAsync(async () =>
            {
                // Simple implementation: default to PDF format
                var format = ReportOutputFormat.PDF;
                
                var reportData = await _reportService.GenerateReportAsync(CurrentReport.Id, format);
                
                // Simple implementation: save to default location
                var defaultPath = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.MyDocuments), "Reports");
                Directory.CreateDirectory(defaultPath);
                var fileName = Path.Combine(defaultPath, $"{CurrentReport.Name}_{DateTime.Now:yyyyMMdd_HHmmss}.{format.ToString().ToLower()}");
                await File.WriteAllBytesAsync(fileName, reportData);
                Logger?.LogInformation("Exported report to {FileName} in {Format} format ({Size} bytes)", fileName, format, reportData.Length);
                StatusMessage = $"Report exported to {fileName}";

            }, "Exporting report");
        }

        #endregion

        #region Template Management

        private async Task CreateTemplateAsync()
        {
            if (CurrentReport == null)
                return;

            // Simple implementation: auto-generate template name with timestamp
            var timestamp = DateTime.Now.ToString("yyyyMMdd_HHmmss");
            var templateName = $"{ReportName} Template_{timestamp}";
            var description = $"Template based on {ReportName} created on {DateTime.Now:yyyy-MM-dd HH:mm}";

            await ExecuteAsync(async () =>
            {
                var template = await _reportService.CreateTemplateFromReportAsync(
                    CurrentReport.Id, 
                    templateName, 
                    description);
                
                Templates.Add(template);
                Logger?.LogInformation("Created template: {TemplateName}", templateName);

            }, "Creating template");
        }

        private async Task ApplyTemplateAsync()
        {
            if (SelectedTemplate == null)
                return;

            await ExecuteAsync(async () =>
            {
                var reportName = $"New Report from {SelectedTemplate.Name}";
                var report = await _reportService.CreateReportFromTemplateAsync(SelectedTemplate.Id, reportName);
                
                Reports.Add(report);
                LoadReport(report);
                
                Logger?.LogInformation("Applied template: {TemplateName}", SelectedTemplate.Name);

            }, "Applying template");
        }

        #endregion

        #region Private Helper Methods

        private void InitializeNewReport()
        {
            CurrentReport = new ReportDefinition
            {
                Name = "New Report",
                Description = "",
                ReportType = ReportType.Table,
                Formatting = new ReportFormatting(),
                Layout = new ReportLayout()
            };

            ReportName = CurrentReport.Name;
            ReportDescription = CurrentReport.Description;
            SelectedReportType = CurrentReport.ReportType;
            SelectedCategory = "";

            // Clear collections
            SelectedDataSources.Clear();
            SelectedColumns.Clear();
            ReportFilters.Clear();
            ReportGroupings.Clear();
            ReportSorting.Clear();
            AvailableColumns.Clear();
            ExecutionHistory.Clear();

            PreviewContent = "";
            CurrentExecution = null;

            OnPropertyChanged(nameof(CanSaveReport));
            OnPropertyChanged(nameof(CanExecuteReport));
            OnPropertyChanged(nameof(CanPreviewReport));
            OnPropertyChanged(nameof(HasSelectedColumns));
            OnPropertyChanged(nameof(HasFilters));
        }

        private async Task LoadDataAsync()
        {
            await ExecuteAsync(async () =>
            {
                // Load reports
                var reports = await _reportService.GetReportsAsync();
                Reports.Clear();
                foreach (var report in reports)
                {
                    Reports.Add(report);
                }

                // Load templates
                var templates = await _reportService.GetTemplatesAsync();
                Templates.Clear();
                foreach (var template in templates)
                {
                    Templates.Add(template);
                }

                // Load data sources
                await RefreshDataSourcesAsync();

                // Load categories
                var categories = await _reportService.GetCategoriesAsync();
                Categories.Clear();
                Categories.Add(""); // Empty option
                foreach (var category in categories)
                {
                    Categories.Add(category);
                }

            }, "Loading report builder data");
        }

        private void LoadReportDataSources()
        {
            SelectedDataSources.Clear();
            if (CurrentReport?.DataSources != null)
            {
                foreach (var dataSource in CurrentReport.DataSources)
                {
                    var availableSource = AvailableDataSources.FirstOrDefault(ds => ds.Type == dataSource.Type);
                    if (availableSource != null)
                    {
                        SelectedDataSources.Add(availableSource);
                    }
                }
            }
            _ = RefreshAvailableColumnsAsync();
        }

        private void LoadReportColumns()
        {
            SelectedColumns.Clear();
            if (CurrentReport?.Columns != null)
            {
                foreach (var column in CurrentReport.Columns.OrderBy(c => c.Order))
                {
                    SelectedColumns.Add(column);
                }
            }
        }

        private void LoadReportFilters()
        {
            ReportFilters.Clear();
            if (CurrentReport?.Filters != null)
            {
                foreach (var filter in CurrentReport.Filters)
                {
                    ReportFilters.Add(filter);
                }
            }
        }

        private void LoadReportGroupings()
        {
            ReportGroupings.Clear();
            if (CurrentReport?.Groupings != null)
            {
                foreach (var grouping in CurrentReport.Groupings.OrderBy(g => g.Level))
                {
                    ReportGroupings.Add(grouping);
                }
            }
        }

        private void LoadReportSorting()
        {
            ReportSorting.Clear();
            if (CurrentReport?.Sorting != null)
            {
                foreach (var sorting in CurrentReport.Sorting.OrderBy(s => s.Priority))
                {
                    ReportSorting.Add(sorting);
                }
            }
        }

        private void UpdateCurrentReportFromUI()
        {
            if (CurrentReport == null) return;

            CurrentReport.Name = ReportName;
            CurrentReport.Description = ReportDescription;
            CurrentReport.ReportType = SelectedReportType;
            CurrentReport.Category = SelectedCategory;
            CurrentReport.ModifiedDate = DateTime.Now;

            // Update data sources
            CurrentReport.DataSources.Clear();
            foreach (var dataSource in SelectedDataSources)
            {
                CurrentReport.DataSources.Add(dataSource);
            }

            // Update columns
            CurrentReport.Columns.Clear();
            foreach (var column in SelectedColumns)
            {
                CurrentReport.Columns.Add(column);
            }

            // Update filters
            CurrentReport.Filters.Clear();
            foreach (var filter in ReportFilters)
            {
                CurrentReport.Filters.Add(filter);
            }

            // Update groupings
            CurrentReport.Groupings.Clear();
            foreach (var grouping in ReportGroupings)
            {
                CurrentReport.Groupings.Add(grouping);
            }

            // Update sorting
            CurrentReport.Sorting.Clear();
            foreach (var sorting in ReportSorting)
            {
                CurrentReport.Sorting.Add(sorting);
            }
        }

        private string FormatDisplayName(string fieldName)
        {
            if (string.IsNullOrEmpty(fieldName))
                return fieldName;

            // Convert camelCase/PascalCase to readable format
            return System.Text.RegularExpressions.Regex.Replace(fieldName, "([A-Z])", " $1").Trim();
        }

        #endregion

        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                _executionCancellation?.Cancel();
                _executionCancellation?.Dispose();
            }
            base.Dispose(disposing);
        }
    }
}