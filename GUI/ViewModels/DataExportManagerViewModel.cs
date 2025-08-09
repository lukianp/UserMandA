using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using System.Windows.Input;
using CommunityToolkit.Mvvm.Input;
using MandADiscoverySuite.Models;
using MandADiscoverySuite.Services;

namespace MandADiscoverySuite.ViewModels
{
    /// <summary>
    /// ViewModel for unified data export management
    /// </summary>
    public class DataExportManagerViewModel : BaseViewModel
    {
        private readonly INotesTaggingService _notesTaggingService;
        private readonly IRiskAnalysisService _riskAnalysisService;
        private readonly IWhatIfSimulationService _whatIfService;
        private readonly IReportBuilderService _reportBuilderService;
        private readonly CsvDataService _csvDataService;
        
        // Export configuration
        private ObservableCollection<ExportItem> _availableExports;
        private ObservableCollection<ExportItem> _selectedExports;
        private string _exportPath;
        private DataExportFormat _selectedFormat;
        private bool _includeMetadata;
        private bool _compressOutput;
        
        // Export status
        private bool _isExporting;
        private double _exportProgress;
        private string _exportStatus;
        private ObservableCollection<ExportResult> _exportHistory;
        
        // UI state
        private bool _showAdvancedOptions;
        private DateTime? _dateFrom;
        private DateTime? _dateTo;
        private string _exportDescription;

        public DataExportManagerViewModel(
            INotesTaggingService notesTaggingService = null,
            IRiskAnalysisService riskAnalysisService = null,
            IWhatIfSimulationService whatIfService = null,
            IReportBuilderService reportBuilderService = null,
            CsvDataService csvDataService = null) : base()
        {
            // Services are optional - we'll use SimpleServiceLocator if not provided
            _notesTaggingService = notesTaggingService ?? SimpleServiceLocator.GetService<INotesTaggingService>();
            _riskAnalysisService = riskAnalysisService ?? SimpleServiceLocator.GetService<IRiskAnalysisService>();
            _whatIfService = whatIfService ?? SimpleServiceLocator.GetService<IWhatIfSimulationService>();
            _reportBuilderService = reportBuilderService ?? SimpleServiceLocator.GetService<IReportBuilderService>();
            _csvDataService = csvDataService ?? SimpleServiceLocator.GetService<CsvDataService>();
            
            InitializeCollections();
            InitializeCommands();
            InitializeAvailableExports();
        }

        #region Properties

        public ObservableCollection<ExportItem> AvailableExports
        {
            get => _availableExports;
            set => SetProperty(ref _availableExports, value);
        }

        public ObservableCollection<ExportItem> SelectedExports
        {
            get => _selectedExports;
            set => SetProperty(ref _selectedExports, value);
        }

        public string ExportPath
        {
            get => _exportPath;
            set => SetProperty(ref _exportPath, value);
        }

        public DataExportFormat SelectedFormat
        {
            get => _selectedFormat;
            set => SetProperty(ref _selectedFormat, value);
        }

        public bool IncludeMetadata
        {
            get => _includeMetadata;
            set => SetProperty(ref _includeMetadata, value);
        }

        public bool CompressOutput
        {
            get => _compressOutput;
            set => SetProperty(ref _compressOutput, value);
        }

        public bool IsExporting
        {
            get => _isExporting;
            set => SetProperty(ref _isExporting, value);
        }

        public double ExportProgress
        {
            get => _exportProgress;
            set => SetProperty(ref _exportProgress, value);
        }

        public string ExportStatus
        {
            get => _exportStatus;
            set => SetProperty(ref _exportStatus, value);
        }

        public ObservableCollection<ExportResult> ExportHistory
        {
            get => _exportHistory;
            set => SetProperty(ref _exportHistory, value);
        }

        public bool ShowAdvancedOptions
        {
            get => _showAdvancedOptions;
            set => SetProperty(ref _showAdvancedOptions, value);
        }

        public DateTime? DateFrom
        {
            get => _dateFrom;
            set => SetProperty(ref _dateFrom, value);
        }

        public DateTime? DateTo
        {
            get => _dateTo;
            set => SetProperty(ref _dateTo, value);
        }

        public string ExportDescription
        {
            get => _exportDescription;
            set => SetProperty(ref _exportDescription, value);
        }

        // Available enum values for UI binding
        public Array ExportFormats => Enum.GetValues(typeof(DataExportFormat));

        #endregion

        #region Commands

        public ICommand SelectAllExportsCommand { get; private set; }
        public ICommand ClearExportSelectionCommand { get; private set; }
        public ICommand BrowseExportPathCommand { get; private set; }
        public ICommand StartExportCommand { get; private set; }
        public ICommand CancelExportCommand { get; private set; }
        public ICommand ToggleAdvancedOptionsCommand { get; private set; }
        public ICommand ClearHistoryCommand { get; private set; }
        public ICommand ExportToClipboardCommand { get; private set; }
        public ICommand PreviewExportCommand { get; private set; }

        #endregion

        #region Initialization

        private void InitializeCollections()
        {
            AvailableExports = new ObservableCollection<ExportItem>();
            SelectedExports = new ObservableCollection<ExportItem>();
            ExportHistory = new ObservableCollection<ExportResult>();
            
            // Set defaults
            SelectedFormat = DataExportFormat.JSON;
            IncludeMetadata = true;
            ExportPath = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.MyDocuments), 
                                     "MandAExports");
            ExportDescription = "Data export";
        }

        protected override void InitializeCommands()
        {
            SelectAllExportsCommand = new RelayCommand(SelectAllExports);
            ClearExportSelectionCommand = new RelayCommand(ClearExportSelection);
            BrowseExportPathCommand = new RelayCommand(BrowseExportPath);
            StartExportCommand = new AsyncRelayCommand(StartExportAsync);
            CancelExportCommand = new RelayCommand(CancelExport);
            ToggleAdvancedOptionsCommand = new RelayCommand(() => ShowAdvancedOptions = !ShowAdvancedOptions);
            ClearHistoryCommand = new RelayCommand(ClearHistory);
            ExportToClipboardCommand = new AsyncRelayCommand(ExportToClipboardAsync);
            PreviewExportCommand = new AsyncRelayCommand(PreviewExportAsync);
        }

        private void InitializeAvailableExports()
        {
            AvailableExports.Add(new ExportItem
            {
                Id = "discovery-users",
                Name = "Discovery Users",
                Description = "Export all discovered user data",
                Category = "Discovery Data",
                EstimatedSize = "Medium",
                IsSelected = false
            });

            AvailableExports.Add(new ExportItem
            {
                Id = "discovery-groups",
                Name = "Discovery Groups",
                Description = "Export all discovered group data",
                Category = "Discovery Data",
                EstimatedSize = "Small",
                IsSelected = false
            });

            AvailableExports.Add(new ExportItem
            {
                Id = "discovery-infrastructure",
                Name = "Discovery Infrastructure",
                Description = "Export all discovered infrastructure data",
                Category = "Discovery Data",
                EstimatedSize = "Large",
                IsSelected = false
            });

            AvailableExports.Add(new ExportItem
            {
                Id = "discovery-applications",
                Name = "Discovery Applications",
                Description = "Export all discovered application data",
                Category = "Discovery Data",
                EstimatedSize = "Medium",
                IsSelected = false
            });

            AvailableExports.Add(new ExportItem
            {
                Id = "notes-tags",
                Name = "Notes and Tags",
                Description = "Export all notes and tagging data",
                Category = "Notes & Tags",
                EstimatedSize = "Small",
                IsSelected = false
            });

            AvailableExports.Add(new ExportItem
            {
                Id = "risk-assessments",
                Name = "Risk Assessments",
                Description = "Export all risk analysis data",
                Category = "Risk Analysis",
                EstimatedSize = "Medium",
                IsSelected = false
            });

            AvailableExports.Add(new ExportItem
            {
                Id = "simulations",
                Name = "What-If Simulations",
                Description = "Export all simulation data and results",
                Category = "Simulations",
                EstimatedSize = "Large",
                IsSelected = false
            });

            AvailableExports.Add(new ExportItem
            {
                Id = "reports",
                Name = "Generated Reports",
                Description = "Export all generated report templates and data",
                Category = "Reports",
                EstimatedSize = "Medium",
                IsSelected = false
            });

            AvailableExports.Add(new ExportItem
            {
                Id = "configurations",
                Name = "System Configurations",
                Description = "Export application settings and configurations",
                Category = "System",
                EstimatedSize = "Small",
                IsSelected = false
            });
        }

        #endregion

        #region Export Operations

        private void SelectAllExports()
        {
            foreach (var export in AvailableExports)
            {
                export.IsSelected = true;
            }
            UpdateSelectedExports();
        }

        private void ClearExportSelection()
        {
            foreach (var export in AvailableExports)
            {
                export.IsSelected = false;
            }
            UpdateSelectedExports();
        }

        private void UpdateSelectedExports()
        {
            SelectedExports.Clear();
            foreach (var export in AvailableExports.Where(e => e.IsSelected))
            {
                SelectedExports.Add(export);
            }
        }

        private void BrowseExportPath()
        {
            var dialog = new System.Windows.Forms.FolderBrowserDialog
            {
                Description = "Select export destination folder",
                SelectedPath = ExportPath
            };

            if (dialog.ShowDialog() == System.Windows.Forms.DialogResult.OK)
            {
                ExportPath = dialog.SelectedPath;
            }
        }

        private async Task StartExportAsync()
        {
            if (!SelectedExports.Any())
            {
                ErrorMessage = "Please select at least one export item.";
                return;
            }

            if (string.IsNullOrWhiteSpace(ExportPath))
            {
                ErrorMessage = "Please specify an export path.";
                return;
            }

            try
            {
                IsExporting = true;
                ExportProgress = 0;
                ExportStatus = "Starting export...";

                // Ensure export directory exists
                Directory.CreateDirectory(ExportPath);

                var exportResult = new ExportResult
                {
                    Id = Guid.NewGuid().ToString(),
                    Description = ExportDescription,
                    StartTime = DateTime.Now,
                    Format = SelectedFormat,
                    Status = "In Progress"
                };

                var exportedFiles = new List<string>();
                var totalItems = SelectedExports.Count;
                var completedItems = 0;

                foreach (var exportItem in SelectedExports)
                {
                    ExportStatus = $"Exporting {exportItem.Name}...";
                    
                    try
                    {
                        var fileName = await ExportItemAsync(exportItem);
                        if (!string.IsNullOrEmpty(fileName))
                        {
                            exportedFiles.Add(fileName);
                            exportItem.LastExported = DateTime.Now;
                        }
                    }
                    catch (Exception ex)
                    {
                        exportResult.Errors.Add($"Failed to export {exportItem.Name}: {ex.Message}");
                    }

                    completedItems++;
                    ExportProgress = (double)completedItems / totalItems * 100;
                }

                // Compress if requested
                if (CompressOutput && exportedFiles.Any())
                {
                    ExportStatus = "Compressing files...";
                    var zipFileName = Path.Combine(ExportPath, 
                        $"MandAExport_{DateTime.Now:yyyyMMdd_HHmmss}.zip");
                    
                    // Note: Would need to implement compression logic here
                    exportResult.OutputFile = zipFileName;
                }

                exportResult.EndTime = DateTime.Now;
                exportResult.Status = exportResult.Errors.Any() ? "Completed with errors" : "Completed";
                exportResult.ExportedFiles = exportedFiles;

                ExportHistory.Insert(0, exportResult);
                ExportStatus = $"Export completed. {exportedFiles.Count} files exported.";

                if (exportResult.Errors.Any())
                {
                    ErrorMessage = $"Export completed with {exportResult.Errors.Count} errors.";
                }
                else
                {
                    StatusMessage = "Export completed successfully.";
                }
            }
            catch (Exception ex)
            {
                ErrorMessage = $"Export failed: {ex.Message}";
                ExportStatus = "Export failed";
            }
            finally
            {
                IsExporting = false;
                ExportProgress = 0;
            }
        }

        private async Task<string> ExportItemAsync(ExportItem item)
        {
            var timestamp = DateTime.Now.ToString("yyyyMMdd_HHmmss");
            string fileName = null;

            switch (item.Id)
            {
                case "discovery-users":
                    fileName = Path.Combine(ExportPath, $"users_{timestamp}.{GetFileExtension()}");
                    if (_csvDataService != null)
                    {
                        // Export users via CSV service - placeholder implementation
                        await Task.Delay(100); // Simulate export
                        await File.WriteAllTextAsync(fileName, "User export data placeholder");
                    }
                    break;

                case "discovery-groups":
                    fileName = Path.Combine(ExportPath, $"groups_{timestamp}.{GetFileExtension()}");
                    if (_csvDataService != null)
                    {
                        // Export groups via CSV service - placeholder implementation
                        await Task.Delay(100); // Simulate export
                        await File.WriteAllTextAsync(fileName, "Groups export data placeholder");
                    }
                    break;

                case "discovery-infrastructure":
                    fileName = Path.Combine(ExportPath, $"infrastructure_{timestamp}.{GetFileExtension()}");
                    if (_csvDataService != null)
                    {
                        // Export infrastructure via CSV service - placeholder implementation
                        await Task.Delay(100); // Simulate export
                        await File.WriteAllTextAsync(fileName, "Infrastructure export data placeholder");
                    }
                    break;

                case "notes-tags":
                    fileName = Path.Combine(ExportPath, $"notes_tags_{timestamp}.{GetFileExtension()}");
                    if (_notesTaggingService != null)
                    {
                        await _notesTaggingService.ExportNotesAsync(fileName);
                    }
                    break;

                case "risk-assessments":
                    fileName = Path.Combine(ExportPath, $"risk_analysis_{timestamp}.{GetFileExtension()}");
                    if (_riskAnalysisService != null)
                    {
                        await _riskAnalysisService.ExportRiskAssessmentsAsync(fileName);
                    }
                    break;

                case "simulations":
                    fileName = Path.Combine(ExportPath, $"simulations_{timestamp}.{GetFileExtension()}");
                    if (_whatIfService != null)
                    {
                        var simulations = await _whatIfService.GetAllSimulationsAsync();
                        foreach (var sim in simulations)
                        {
                            var simFileName = Path.Combine(ExportPath, 
                                $"simulation_{sim.Name}_{timestamp}.{GetFileExtension()}");
                            await _whatIfService.ExportSimulationAsync(sim.Id);
                        }
                    }
                    break;

                case "configurations":
                    fileName = Path.Combine(ExportPath, $"configurations_{timestamp}.json");
                    // Export system configurations
                    var config = new
                    {
                        ExportDate = DateTime.Now,
                        ApplicationVersion = "1.0",
                        Settings = "Configuration data would go here"
                    };
                    var configJson = System.Text.Json.JsonSerializer.Serialize(config, 
                        new System.Text.Json.JsonSerializerOptions { WriteIndented = true });
                    await File.WriteAllTextAsync(fileName, configJson);
                    break;

                default:
                    throw new NotSupportedException($"Export type '{item.Id}' is not supported");
            }

            return fileName;
        }

        private string GetFileExtension()
        {
            return SelectedFormat switch
            {
                DataExportFormat.JSON => "json",
                DataExportFormat.CSV => "csv",
                DataExportFormat.XML => "xml",
                DataExportFormat.Excel => "xlsx",
                _ => "json"
            };
        }

        private void CancelExport()
        {
            // Implementation would cancel ongoing export operations
            IsExporting = false;
            ExportStatus = "Export cancelled";
            ExportProgress = 0;
        }

        private void ClearHistory()
        {
            ExportHistory.Clear();
            StatusMessage = "Export history cleared.";
        }

        private async Task ExportToClipboardAsync()
        {
            try
            {
                if (!SelectedExports.Any())
                {
                    ErrorMessage = "Please select at least one export item.";
                    return;
                }

                IsLoading = true;
                var clipboardData = new List<string>();

                foreach (var exportItem in SelectedExports.Take(3)) // Limit for clipboard
                {
                    var data = await GetExportPreviewDataAsync(exportItem);
                    clipboardData.Add($"=== {exportItem.Name} ===\n{data}\n");
                }

                var clipboardText = string.Join("\n", clipboardData);
                System.Windows.Clipboard.SetText(clipboardText);
                StatusMessage = "Export data copied to clipboard.";
            }
            catch (Exception ex)
            {
                ErrorMessage = $"Failed to copy to clipboard: {ex.Message}";
            }
            finally
            {
                IsLoading = false;
            }
        }

        private async Task PreviewExportAsync()
        {
            try
            {
                if (SelectedExports.Count != 1)
                {
                    ErrorMessage = "Please select exactly one export item for preview.";
                    return;
                }

                IsLoading = true;
                var exportItem = SelectedExports.First();
                var previewData = await GetExportPreviewDataAsync(exportItem);

                // Would show preview in a dialog or separate window
                StatusMessage = $"Preview generated for {exportItem.Name}";
            }
            catch (Exception ex)
            {
                ErrorMessage = $"Failed to generate preview: {ex.Message}";
            }
            finally
            {
                IsLoading = false;
            }
        }

        private async Task<string> GetExportPreviewDataAsync(ExportItem item)
        {
            switch (item.Id)
            {
                case "notes-tags":
                    if (_notesTaggingService != null)
                    {
                        var notes = await _notesTaggingService.GetAllNotesAsync();
                        return $"Notes: {notes.Count}\nSample: {notes.FirstOrDefault()?.Title ?? "None"}";
                    }
                    break;

                case "risk-assessments":
                    if (_riskAnalysisService != null)
                    {
                        var risks = await _riskAnalysisService.GetAllRiskAssessmentsAsync();
                        return $"Risks: {risks.Count}\nSample: {risks.FirstOrDefault()?.Title ?? "None"}";
                    }
                    break;

                case "simulations":
                    if (_whatIfService != null)
                    {
                        var sims = await _whatIfService.GetAllSimulationsAsync();
                        return $"Simulations: {sims.Count}\nSample: {sims.FirstOrDefault()?.Name ?? "None"}";
                    }
                    break;

                default:
                    return "Preview not available for this export type";
            }

            return "No data available";
        }

        #endregion
    }

    #region Supporting Classes

    public class ExportItem : BaseViewModel
    {
        private bool _isSelected;

        public string Id { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public string Category { get; set; }
        public string EstimatedSize { get; set; }
        public DateTime? LastExported { get; set; }

        public bool IsSelected
        {
            get => _isSelected;
            set => SetProperty(ref _isSelected, value);
        }
    }

    public class ExportResult
    {
        public string Id { get; set; }
        public string Description { get; set; }
        public DateTime StartTime { get; set; }
        public DateTime? EndTime { get; set; }
        public DataExportFormat Format { get; set; }
        public string Status { get; set; }
        public List<string> ExportedFiles { get; set; }
        public List<string> Errors { get; set; }
        public string OutputFile { get; set; }

        public ExportResult()
        {
            ExportedFiles = new List<string>();
            Errors = new List<string>();
        }

        public TimeSpan Duration => (EndTime ?? DateTime.Now) - StartTime;
    }

    public enum DataExportFormat
    {
        JSON,
        CSV,
        XML,
        Excel
    }

    #endregion
}