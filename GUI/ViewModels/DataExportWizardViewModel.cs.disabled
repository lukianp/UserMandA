using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using System.Windows.Input;
using CommunityToolkit.Mvvm.Input;
using Microsoft.Extensions.Logging;
using Microsoft.Win32;
using MandADiscoverySuite.Services;

namespace MandADiscoverySuite.ViewModels
{
    /// <summary>
    /// ViewModel for the comprehensive data export wizard
    /// </summary>
    public partial class DataExportWizardViewModel : BaseViewModel
    {
        #region Private Fields

        private readonly DataExportService _exportService;
        private readonly IDataService _dataService;
        
        private int _currentStep = 1;
        private bool _isExporting = false;
        private double _exportProgress = 0;
        private string _exportStatus = "Ready to export";
        private string _exportPath = Environment.GetFolderPath(Environment.SpecialFolder.Desktop);

        // Step 1: Data Selection
        private bool _includeUsers = true;
        private bool _includeComputers = true;
        private bool _includeGroups = false;
        private bool _includeApplications = false;
        private bool _includeNetwork = false;
        private bool _includePolicies = false;
        private string _dataPreview = "";

        // Step 2: Format & Options
        private bool _isExcelFormat = true;
        private bool _isCsvFormat = false;
        private bool _isJsonFormat = false;
        private bool _isXmlFormat = false;
        private bool _isPdfFormat = false;
        private bool _includeHeaders = true;
        private bool _includeMetadata = true;
        private bool _compressOutput = false;
        private bool _splitLargeFiles = false;
        private string _maxRowsPerFile = "50000";

        // Step 3: Schedule & Filters
        private bool _isOneTimeExport = true;
        private bool _isRecurringExport = false;
        private string _scheduleFrequency = "Daily";
        private string _scheduleTime = "09:00";
        private DateTime? _filterDateFrom;
        private DateTime? _filterDateTo;
        private string _departmentFilter = "";
        private string _locationFilter = "";
        private bool _activeAccountsOnly = true;

        #endregion

        #region Properties

        public ObservableCollection<WizardStep> Steps { get; set; }

        public int CurrentStep
        {
            get => _currentStep;
            set
            {
                SetProperty(ref _currentStep, value);
                UpdateStepVisibility();
                UpdateStepProgress();
                UpdateNavigationButtons();
            }
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

        public string ExportPath
        {
            get => _exportPath;
            set => SetProperty(ref _exportPath, value);
        }

        // Step Visibility Properties
        public bool IsStep1Visible => CurrentStep == 1;
        public bool IsStep2Visible => CurrentStep == 2;
        public bool IsStep3Visible => CurrentStep == 3;
        public bool IsStep4Visible => CurrentStep == 4;

        // Step 1: Data Selection Properties
        public bool IncludeUsers
        {
            get => _includeUsers;
            set
            {
                SetProperty(ref _includeUsers, value);
                UpdateDataPreview();
            }
        }

        public bool IncludeComputers
        {
            get => _includeComputers;
            set
            {
                SetProperty(ref _includeComputers, value);
                UpdateDataPreview();
            }
        }

        public bool IncludeGroups
        {
            get => _includeGroups;
            set
            {
                SetProperty(ref _includeGroups, value);
                UpdateDataPreview();
            }
        }

        public bool IncludeApplications
        {
            get => _includeApplications;
            set
            {
                SetProperty(ref _includeApplications, value);
                UpdateDataPreview();
            }
        }

        public bool IncludeNetwork
        {
            get => _includeNetwork;
            set
            {
                SetProperty(ref _includeNetwork, value);
                UpdateDataPreview();
            }
        }

        public bool IncludePolicies
        {
            get => _includePolicies;
            set
            {
                SetProperty(ref _includePolicies, value);
                UpdateDataPreview();
            }
        }

        public string DataPreview
        {
            get => _dataPreview;
            set => SetProperty(ref _dataPreview, value);
        }

        // Step 2: Format & Options Properties
        public bool IsExcelFormat
        {
            get => _isExcelFormat;
            set => SetProperty(ref _isExcelFormat, value);
        }

        public bool IsCsvFormat
        {
            get => _isCsvFormat;
            set => SetProperty(ref _isCsvFormat, value);
        }

        public bool IsJsonFormat
        {
            get => _isJsonFormat;
            set => SetProperty(ref _isJsonFormat, value);
        }

        public bool IsXmlFormat
        {
            get => _isXmlFormat;
            set => SetProperty(ref _isXmlFormat, value);
        }

        public bool IsPdfFormat
        {
            get => _isPdfFormat;
            set => SetProperty(ref _isPdfFormat, value);
        }

        public bool IncludeHeaders
        {
            get => _includeHeaders;
            set => SetProperty(ref _includeHeaders, value);
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

        public bool SplitLargeFiles
        {
            get => _splitLargeFiles;
            set => SetProperty(ref _splitLargeFiles, value);
        }

        public string MaxRowsPerFile
        {
            get => _maxRowsPerFile;
            set => SetProperty(ref _maxRowsPerFile, value);
        }

        public string SelectedFormat
        {
            get
            {
                if (_isExcelFormat) return "Excel";
                if (_isCsvFormat) return "CSV";
                if (_isJsonFormat) return "JSON";
                if (_isXmlFormat) return "XML";
                if (_isPdfFormat) return "PDF";
                return "Excel";
            }
        }

        public string ExportFileName
        {
            get
            {
                var format = SelectedFormat.ToLower();
                var timestamp = DateTime.Now.ToString("yyyyMMdd_HHmmss");
                return $"export_{timestamp}.{format}";
            }
        }

        // Step 3: Schedule & Filters Properties
        public bool IsOneTimeExport
        {
            get => _isOneTimeExport;
            set => SetProperty(ref _isOneTimeExport, value);
        }

        public bool IsRecurringExport
        {
            get => _isRecurringExport;
            set => SetProperty(ref _isRecurringExport, value);
        }

        public string ScheduleFrequency
        {
            get => _scheduleFrequency;
            set => SetProperty(ref _scheduleFrequency, value);
        }

        public string ScheduleTime
        {
            get => _scheduleTime;
            set => SetProperty(ref _scheduleTime, value);
        }

        public DateTime? FilterDateFrom
        {
            get => _filterDateFrom;
            set => SetProperty(ref _filterDateFrom, value);
        }

        public DateTime? FilterDateTo
        {
            get => _filterDateTo;
            set => SetProperty(ref _filterDateTo, value);
        }

        public string DepartmentFilter
        {
            get => _departmentFilter;
            set => SetProperty(ref _departmentFilter, value);
        }

        public string LocationFilter
        {
            get => _locationFilter;
            set => SetProperty(ref _locationFilter, value);
        }

        public bool ActiveAccountsOnly
        {
            get => _activeAccountsOnly;
            set => SetProperty(ref _activeAccountsOnly, value);
        }

        // Navigation Properties
        public bool CanGoPrevious => CurrentStep > 1 && !IsExporting;
        public bool CanGoNext => CurrentStep < 4 && ValidateCurrentStep() && !IsExporting;
        public string NextButtonText => CurrentStep == 4 ? "Export" : "Next →";

        public string ExportSummary
        {
            get
            {
                var sources = new List<string>();
                if (IncludeUsers) sources.Add("User Accounts");
                if (IncludeComputers) sources.Add("Computer Inventory");
                if (IncludeGroups) sources.Add("Security Groups");
                if (IncludeApplications) sources.Add("Application Inventory");
                if (IncludeNetwork) sources.Add("Network Infrastructure");
                if (IncludePolicies) sources.Add("Security Policies");

                var format = GetSelectedFormat();
                var schedule = IsOneTimeExport ? "One-time export" : $"Recurring ({ScheduleFrequency})";

                return $"Data Sources: {string.Join(", ", sources)}\n" +
                       $"Export Format: {format}\n" +
                       $"Schedule: {schedule}\n" +
                       $"Export Location: {ExportPath}\n" +
                       $"Include Headers: {(IncludeHeaders ? "Yes" : "No")}\n" +
                       $"Compress Output: {(CompressOutput ? "Yes" : "No")}";
            }
        }

        #endregion

        #region Commands

        public ICommand NextStepCommand { get; }
        public ICommand PreviousStepCommand { get; }
        public ICommand CancelCommand { get; }
        public ICommand BrowseExportPathCommand { get; }

        #endregion

        #region Constructor

        public DataExportWizardViewModel() : base()
        {
            // Initialize services
            _exportService = ServiceLocator.GetService<DataExportService>();
            _dataService = ServiceLocator.GetService<IDataService>();

            // Initialize wizard steps
            InitializeSteps();

            // Initialize commands
            NextStepCommand = new AsyncRelayCommand(NextStepAsync);
            PreviousStepCommand = new RelayCommand(PreviousStep);
            CancelCommand = new RelayCommand(Cancel);
            BrowseExportPathCommand = new RelayCommand(BrowseExportPath);

            // Initialize data preview
            UpdateDataPreview();
        }

        #endregion

        #region Public Methods

        /// <summary>
        /// Resets the wizard to the first step
        /// </summary>
        public void Reset()
        {
            CurrentStep = 1;
            IsExporting = false;
            ExportProgress = 0;
            ExportStatus = "Ready to export";
        }

        #endregion

        #region Private Methods

        private void InitializeSteps()
        {
            Steps = new ObservableCollection<WizardStep>
            {
                new WizardStep { Number = 1, Title = "Data Selection", IsActive = true, IsCompleted = false },
                new WizardStep { Number = 2, Title = "Format & Options", IsActive = false, IsCompleted = false },
                new WizardStep { Number = 3, Title = "Schedule & Filters", IsActive = false, IsCompleted = false },
                new WizardStep { Number = 4, Title = "Export", IsActive = false, IsCompleted = false }
            };
        }

        private void UpdateStepVisibility()
        {
            OnPropertyChanged(nameof(IsStep1Visible));
            OnPropertyChanged(nameof(IsStep2Visible));
            OnPropertyChanged(nameof(IsStep3Visible));
            OnPropertyChanged(nameof(IsStep4Visible));
        }

        private void UpdateStepProgress()
        {
            for (int i = 0; i < Steps.Count; i++)
            {
                var step = Steps[i];
                step.IsActive = (i + 1) == CurrentStep;
                step.IsCompleted = (i + 1) < CurrentStep;
            }

            OnPropertyChanged(nameof(ExportSummary));
        }

        private void UpdateNavigationButtons()
        {
            OnPropertyChanged(nameof(CanGoPrevious));
            OnPropertyChanged(nameof(CanGoNext));
            OnPropertyChanged(nameof(NextButtonText));
        }

        private bool ValidateCurrentStep()
        {
            switch (CurrentStep)
            {
                case 1:
                    return IncludeUsers || IncludeComputers || IncludeGroups || 
                           IncludeApplications || IncludeNetwork || IncludePolicies;
                case 2:
                    return IsExcelFormat || IsCsvFormat || IsJsonFormat || IsXmlFormat || IsPdfFormat;
                case 3:
                    return true; // All filters are optional
                case 4:
                    return !string.IsNullOrWhiteSpace(ExportPath) && Directory.Exists(Path.GetDirectoryName(ExportPath));
                default:
                    return true;
            }
        }

        private async Task NextStepAsync()
        {
            try
            {
                if (CurrentStep == 4)
                {
                    await StartExportAsync();
                }
                else
                {
                    CurrentStep++;
                }
            }
            catch (Exception ex)
            {
                Logger?.LogError(ex, "Error navigating to next step");
                ExportStatus = $"Error: {ex.Message}";
            }
        }

        private void PreviousStep()
        {
            if (CanGoPrevious)
            {
                CurrentStep--;
            }
        }

        private void Cancel()
        {
            try
            {
                // Cancel any ongoing export
                if (IsExporting)
                {
                    _exportService?.CancelExport();
                    IsExporting = false;
                    ExportStatus = "Export cancelled";
                }

                // Reset wizard or close dialog
                Reset();
            }
            catch (Exception ex)
            {
                Logger?.LogError(ex, "Error cancelling export wizard");
            }
        }

        private void BrowseExportPath()
        {
            try
            {
                var dialog = new SaveFileDialog
                {
                    Title = "Select Export Location",
                    Filter = GetFileFilter(),
                    DefaultExt = GetDefaultExtension(),
                    InitialDirectory = Path.GetDirectoryName(ExportPath) ?? Environment.GetFolderPath(Environment.SpecialFolder.Desktop)
                };

                if (dialog.ShowDialog() == true)
                {
                    ExportPath = dialog.FileName;
                    UpdateNavigationButtons();
                }
            }
            catch (Exception ex)
            {
                Logger?.LogError(ex, "Error browsing export path");
            }
        }

        private string GetFileFilter()
        {
            if (IsExcelFormat) return "Excel Files (*.xlsx)|*.xlsx";
            if (IsCsvFormat) return "CSV Files (*.csv)|*.csv";
            if (IsJsonFormat) return "JSON Files (*.json)|*.json";
            if (IsXmlFormat) return "XML Files (*.xml)|*.xml";
            if (IsPdfFormat) return "PDF Files (*.pdf)|*.pdf";
            return "All Files (*.*)|*.*";
        }

        private string GetDefaultExtension()
        {
            if (IsExcelFormat) return ".xlsx";
            if (IsCsvFormat) return ".csv";
            if (IsJsonFormat) return ".json";
            if (IsXmlFormat) return ".xml";
            if (IsPdfFormat) return ".pdf";
            return ".csv";
        }

        private string GetSelectedFormat()
        {
            if (IsExcelFormat) return "Excel (.xlsx)";
            if (IsCsvFormat) return "CSV (.csv)";
            if (IsJsonFormat) return "JSON (.json)";
            if (IsXmlFormat) return "XML (.xml)";
            if (IsPdfFormat) return "PDF Report";
            return "Unknown";
        }

        private void UpdateDataPreview()
        {
            try
            {
                var preview = new List<string>();
                
                if (IncludeUsers)
                {
                    preview.Add("=== USER ACCOUNTS ===");
                    preview.Add("UserName | DisplayName | Department | LastLogin");
                    preview.Add("jsmith | John Smith | IT | 2024-01-15");
                    preview.Add("mjones | Mary Jones | Finance | 2024-01-14");
                    preview.Add("");
                }

                if (IncludeComputers)
                {
                    preview.Add("=== COMPUTER INVENTORY ===");
                    preview.Add("ComputerName | OS | LastSeen | Owner");
                    preview.Add("WS-001 | Windows 11 | 2024-01-15 | jsmith");
                    preview.Add("WS-002 | Windows 10 | 2024-01-14 | mjones");
                    preview.Add("");
                }

                if (IncludeGroups)
                {
                    preview.Add("=== SECURITY GROUPS ===");
                    preview.Add("GroupName | Description | MemberCount");
                    preview.Add("Domain Admins | Domain administrators | 3");
                    preview.Add("IT Support | IT support staff | 12");
                    preview.Add("");
                }

                if (IncludeApplications)
                {
                    preview.Add("=== APPLICATION INVENTORY ===");
                    preview.Add("AppName | Version | InstallCount | LastUsed");
                    preview.Add("Microsoft Office | 365 | 150 | 2024-01-15");
                    preview.Add("Adobe Acrobat | DC | 75 | 2024-01-14");
                    preview.Add("");
                }

                if (IncludeNetwork)
                {
                    preview.Add("=== NETWORK INFRASTRUCTURE ===");
                    preview.Add("DeviceName | Type | IPAddress | Status");
                    preview.Add("SW-CORE-01 | Switch | 192.168.1.1 | Online");
                    preview.Add("RT-MAIN-01 | Router | 192.168.1.254 | Online");
                    preview.Add("");
                }

                if (IncludePolicies)
                {
                    preview.Add("=== SECURITY POLICIES ===");
                    preview.Add("PolicyName | Type | Status | LastModified");
                    preview.Add("Password Policy | Security | Active | 2024-01-10");
                    preview.Add("Firewall Rules | Network | Active | 2024-01-12");
                    preview.Add("");
                }

                DataPreview = preview.Count > 0 ? string.Join("\n", preview) : "No data sources selected.";
            }
            catch (Exception ex)
            {
                Logger?.LogError(ex, "Error updating data preview");
                DataPreview = "Error generating preview.";
            }
        }

        private async Task StartExportAsync()
        {
            try
            {
                IsExporting = true;
                ExportProgress = 0;
                ExportStatus = "Initializing export...";

                // Create export configuration
                var config = new ExportConfiguration
                {
                    FilePath = ExportPath,
                    Format = GetExportFormat(),
                    IncludeUsers = IncludeUsers,
                    IncludeComputers = IncludeComputers,
                    IncludeGroups = IncludeGroups,
                    IncludeApplications = IncludeApplications,
                    IncludeNetwork = IncludeNetwork,
                    IncludePolicies = IncludePolicies,
                    IncludeHeaders = IncludeHeaders,
                    IncludeMetadata = IncludeMetadata,
                    CompressOutput = CompressOutput,
                    SplitLargeFiles = SplitLargeFiles,
                    MaxRowsPerFile = int.TryParse(MaxRowsPerFile, out int maxRows) ? maxRows : 50000,
                    DateFrom = FilterDateFrom,
                    DateTo = FilterDateTo,
                    DepartmentFilter = DepartmentFilter,
                    LocationFilter = LocationFilter,
                    ActiveAccountsOnly = ActiveAccountsOnly
                };

                // Start export with progress updates
                var progress = new Progress<ExportProgress>(OnExportProgress);
                var exportRequest = new ExportRequest
                {
                    Data = config,
                    Format = SelectedFormat,
                    FileName = ExportFileName
                };
                await _exportService.ExportDataAsync(exportRequest);

                ExportStatus = "Export completed successfully!";
                ExportProgress = 100;
            }
            catch (Exception ex)
            {
                Logger?.LogError(ex, "Error during data export");
                ExportStatus = $"Export failed: {ex.Message}";
            }
            finally
            {
                IsExporting = false;
                UpdateNavigationButtons();
            }
        }

        private ExportFormat GetExportFormat()
        {
            if (IsExcelFormat) return ExportFormat.Excel;
            if (IsCsvFormat) return ExportFormat.Csv;
            if (IsJsonFormat) return ExportFormat.Json;
            if (IsXmlFormat) return ExportFormat.Xml;
            if (IsPdfFormat) return ExportFormat.Pdf;
            return ExportFormat.Csv;
        }

        private void OnExportProgress(ExportProgress progress)
        {
            ExportProgress = progress.PercentComplete;
            ExportStatus = progress.StatusMessage;
        }

        #endregion

        #region Dispose

        protected override void Dispose(bool disposing)
        {
            if (disposing && IsExporting)
            {
                _exportService?.CancelExport();
            }
            base.Dispose(disposing);
        }

        #endregion
    }

    /// <summary>
    /// Represents a wizard step
    /// </summary>
    public class WizardStep
    {
        public int Number { get; set; }
        public string Title { get; set; }
        public bool IsActive { get; set; }
        public bool IsCompleted { get; set; }
    }

    /// <summary>
    /// Export configuration settings
    /// </summary>
    public class ExportConfiguration
    {
        public string FilePath { get; set; }
        public ExportFormat Format { get; set; }
        public bool IncludeUsers { get; set; }
        public bool IncludeComputers { get; set; }
        public bool IncludeGroups { get; set; }
        public bool IncludeApplications { get; set; }
        public bool IncludeNetwork { get; set; }
        public bool IncludePolicies { get; set; }
        public bool IncludeHeaders { get; set; }
        public bool IncludeMetadata { get; set; }
        public bool CompressOutput { get; set; }
        public bool SplitLargeFiles { get; set; }
        public int MaxRowsPerFile { get; set; }
        public DateTime? DateFrom { get; set; }
        public DateTime? DateTo { get; set; }
        public string DepartmentFilter { get; set; }
        public string LocationFilter { get; set; }
        public bool ActiveAccountsOnly { get; set; }
    }

    /// <summary>
    /// Export format enumeration
    /// </summary>
    public enum ExportFormat
    {
        Excel,
        Csv,
        Json,
        Xml,
        Pdf
    }

    /// <summary>
    /// Export progress information
    /// </summary>
    public class ExportProgress
    {
        public double PercentComplete { get; set; }
        public string StatusMessage { get; set; }
        public int RecordsProcessed { get; set; }
        public int TotalRecords { get; set; }
    }
}