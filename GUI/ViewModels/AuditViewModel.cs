using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.ComponentModel;
using System.Linq;
using System.Runtime.CompilerServices;
using System.Threading.Tasks;
using System.Windows.Input;
using Microsoft.Extensions.Logging;
using MandADiscoverySuite.Services.Audit;
using System.IO;
using Microsoft.Win32;
using System.Windows;
using CommunityToolkit.Mvvm.Input;

namespace MandADiscoverySuite.ViewModels
{
    /// <summary>
    /// ViewModel for the audit and reporting view with filtering, export, and statistics
    /// </summary>
    public class AuditViewModel : INotifyPropertyChanged
    {
        private readonly IAuditService _auditService;
        private readonly ILogger<AuditViewModel> _logger;

        private ObservableCollection<AuditEventViewModel> _auditEvents;
        private AuditEventViewModel _selectedAuditEvent;
        private AuditStatistics _statistics;
        private bool _isLoading;
        private string _statusMessage;

        // Filter properties
        private DateTime? _filterStartDate;
        private DateTime? _filterEndDate;
        private string _filterUserName;
        private ObjectType? _filterObjectType;
        private AuditAction? _filterAction;
        private AuditStatus? _filterStatus;
        private string _filterWave;
        private string _filterSearchText;
        private int _maxRecords = 1000;

        public AuditViewModel(IAuditService auditService, ILogger<AuditViewModel> logger)
        {
            _auditService = auditService ?? throw new ArgumentNullException(nameof(auditService));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));

            AuditEvents = new ObservableCollection<AuditEventViewModel>();
            
            // Initialize commands
            LoadAuditEventsCommand = new AsyncRelayCommand(LoadAuditEventsAsync);
            RefreshCommand = new AsyncRelayCommand(RefreshDataAsync);
            ClearFiltersCommand = new RelayCommand(ClearFilters);
            ExportToCsvCommand = new AsyncRelayCommand(ExportToCsvAsync);
            ExportToPdfCommand = new AsyncRelayCommand(ExportToPdfAsync);
            ArchiveOldRecordsCommand = new AsyncRelayCommand(ArchiveOldRecordsAsync);
            ValidateIntegrityCommand = new AsyncRelayCommand(ValidateIntegrityAsync);

            // Initialize with default date range (last 30 days)
            FilterStartDate = DateTime.Now.AddDays(-30);
            FilterEndDate = DateTime.Now;

            // Load initial data
            Task.Run(async () => await LoadInitialDataAsync());
        }

        #region Properties

        public ObservableCollection<AuditEventViewModel> AuditEvents
        {
            get => _auditEvents;
            set => SetProperty(ref _auditEvents, value);
        }

        public AuditEventViewModel SelectedAuditEvent
        {
            get => _selectedAuditEvent;
            set => SetProperty(ref _selectedAuditEvent, value);
        }

        public AuditStatistics Statistics
        {
            get => _statistics;
            set => SetProperty(ref _statistics, value);
        }

        public bool IsLoading
        {
            get => _isLoading;
            set => SetProperty(ref _isLoading, value);
        }

        public string StatusMessage
        {
            get => _statusMessage;
            set => SetProperty(ref _statusMessage, value);
        }

        // Filter properties
        public DateTime? FilterStartDate
        {
            get => _filterStartDate;
            set => SetProperty(ref _filterStartDate, value);
        }

        public DateTime? FilterEndDate
        {
            get => _filterEndDate;
            set => SetProperty(ref _filterEndDate, value);
        }

        public string FilterUserName
        {
            get => _filterUserName;
            set => SetProperty(ref _filterUserName, value);
        }

        public ObjectType? FilterObjectType
        {
            get => _filterObjectType;
            set => SetProperty(ref _filterObjectType, value);
        }

        public AuditAction? FilterAction
        {
            get => _filterAction;
            set => SetProperty(ref _filterAction, value);
        }

        public AuditStatus? FilterStatus
        {
            get => _filterStatus;
            set => SetProperty(ref _filterStatus, value);
        }

        public string FilterWave
        {
            get => _filterWave;
            set => SetProperty(ref _filterWave, value);
        }

        public string FilterSearchText
        {
            get => _filterSearchText;
            set => SetProperty(ref _filterSearchText, value);
        }

        public int MaxRecords
        {
            get => _maxRecords;
            set => SetProperty(ref _maxRecords, value);
        }

        // Enum values for dropdowns
        public Array ObjectTypes => Enum.GetValues(typeof(ObjectType));
        public Array AuditActions => Enum.GetValues(typeof(AuditAction));
        public Array AuditStatuses => Enum.GetValues(typeof(AuditStatus));

        #endregion

        #region Commands

        public ICommand LoadAuditEventsCommand { get; }
        public ICommand RefreshCommand { get; }
        public ICommand ClearFiltersCommand { get; }
        public ICommand ExportToCsvCommand { get; }
        public ICommand ExportToPdfCommand { get; }
        public ICommand ArchiveOldRecordsCommand { get; }
        public ICommand ValidateIntegrityCommand { get; }

        #endregion

        #region Public Methods

        public async Task LoadInitialDataAsync()
        {
            await LoadAuditEventsAsync();
            await LoadStatisticsAsync();
        }

        public async Task RefreshDataAsync()
        {
            await LoadAuditEventsAsync();
            await LoadStatisticsAsync();
            StatusMessage = $"Data refreshed at {DateTime.Now:HH:mm:ss}";
        }

        #endregion

        #region Private Methods

        private async Task LoadAuditEventsAsync()
        {
            IsLoading = true;
            StatusMessage = "Loading audit events...";

            try
            {
                var filter = CreateFilterFromUI();
                var events = await _auditService.GetAuditEventsAsync(filter);
                
                var eventViewModels = events.Select(e => new AuditEventViewModel(e)).ToList();
                
                Application.Current.Dispatcher.Invoke(() =>
                {
                    AuditEvents.Clear();
                    foreach (var eventVm in eventViewModels)
                    {
                        AuditEvents.Add(eventVm);
                    }
                });

                StatusMessage = $"Loaded {AuditEvents.Count} audit events";
                _logger.LogInformation("Loaded {EventCount} audit events", AuditEvents.Count);
            }
            catch (Exception ex)
            {
                StatusMessage = $"Error loading audit events: {ex.Message}";
                _logger.LogError(ex, "Failed to load audit events");
            }
            finally
            {
                IsLoading = false;
            }
        }

        private async Task LoadStatisticsAsync()
        {
            try
            {
                var filter = CreateFilterFromUI();
                Statistics = await _auditService.GetAuditStatisticsAsync(filter);
                _logger.LogDebug("Loaded audit statistics: {TotalEvents} total events", Statistics.TotalEvents);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to load audit statistics");
            }
        }

        private AuditFilter CreateFilterFromUI()
        {
            return new AuditFilter
            {
                StartDate = FilterStartDate,
                EndDate = FilterEndDate,
                UserPrincipalName = !string.IsNullOrWhiteSpace(FilterUserName) ? FilterUserName : null,
                ObjectType = FilterObjectType,
                Action = FilterAction,
                Status = FilterStatus,
                WaveId = !string.IsNullOrWhiteSpace(FilterWave) ? FilterWave : null,
                SearchText = !string.IsNullOrWhiteSpace(FilterSearchText) ? FilterSearchText : null,
                MaxRecords = MaxRecords
            };
        }

        private void ClearFilters()
        {
            FilterStartDate = DateTime.Now.AddDays(-30);
            FilterEndDate = DateTime.Now;
            FilterUserName = null;
            FilterObjectType = null;
            FilterAction = null;
            FilterStatus = null;
            FilterWave = null;
            FilterSearchText = null;
            MaxRecords = 1000;
        }

        private async Task ExportToCsvAsync()
        {
            try
            {
                var saveFileDialog = new SaveFileDialog
                {
                    Filter = "CSV files (*.csv)|*.csv",
                    FileName = $"migration-audit-{DateTime.Now:yyyyMMdd-HHmmss}.csv"
                };

                if (saveFileDialog.ShowDialog() == true)
                {
                    IsLoading = true;
                    StatusMessage = "Exporting to CSV...";

                    var filter = CreateFilterFromUI();
                    var csvData = await _auditService.ExportToCsvAsync(filter);
                    await File.WriteAllBytesAsync(saveFileDialog.FileName, csvData);

                    StatusMessage = $"CSV exported to {saveFileDialog.FileName}";
                    _logger.LogInformation("Audit data exported to CSV: {FilePath}", saveFileDialog.FileName);
                }
            }
            catch (Exception ex)
            {
                StatusMessage = $"Error exporting CSV: {ex.Message}";
                _logger.LogError(ex, "Failed to export audit data to CSV");
            }
            finally
            {
                IsLoading = false;
            }
        }

        private async Task ExportToPdfAsync()
        {
            try
            {
                var saveFileDialog = new SaveFileDialog
                {
                    Filter = "PDF files (*.pdf)|*.pdf",
                    FileName = $"migration-audit-{DateTime.Now:yyyyMMdd-HHmmss}.pdf"
                };

                if (saveFileDialog.ShowDialog() == true)
                {
                    IsLoading = true;
                    StatusMessage = "Exporting to PDF...";

                    var filter = CreateFilterFromUI();
                    var pdfData = await _auditService.ExportToPdfAsync(filter);
                    await File.WriteAllBytesAsync(saveFileDialog.FileName, pdfData);

                    StatusMessage = $"PDF exported to {saveFileDialog.FileName}";
                    _logger.LogInformation("Audit data exported to PDF: {FilePath}", saveFileDialog.FileName);
                }
            }
            catch (Exception ex)
            {
                StatusMessage = $"Error exporting PDF: {ex.Message}";
                _logger.LogError(ex, "Failed to export audit data to PDF");
            }
            finally
            {
                IsLoading = false;
            }
        }

        private async Task ArchiveOldRecordsAsync()
        {
            try
            {
                var result = MessageBox.Show(
                    "This will archive audit records older than 90 days. Are you sure?",
                    "Archive Old Records",
                    MessageBoxButton.YesNo,
                    MessageBoxImage.Question);

                if (result == MessageBoxResult.Yes)
                {
                    IsLoading = true;
                    StatusMessage = "Archiving old records...";

                    var archivedCount = await _auditService.ArchiveOldRecordsAsync(TimeSpan.FromDays(90));
                    
                    StatusMessage = $"Archived {archivedCount} old records";
                    _logger.LogInformation("Archived {Count} old audit records", archivedCount);

                    // Refresh data after archiving
                    await RefreshDataAsync();
                }
            }
            catch (Exception ex)
            {
                StatusMessage = $"Error archiving records: {ex.Message}";
                _logger.LogError(ex, "Failed to archive old audit records");
            }
            finally
            {
                IsLoading = false;
            }
        }

        private async Task ValidateIntegrityAsync()
        {
            try
            {
                IsLoading = true;
                StatusMessage = "Validating audit database integrity...";

                var isValid = await _auditService.ValidateAuditIntegrityAsync();
                
                StatusMessage = isValid 
                    ? "Audit database integrity validation passed" 
                    : "Audit database integrity validation failed - check logs";
                
                _logger.LogInformation("Audit integrity validation result: {IsValid}", isValid);
            }
            catch (Exception ex)
            {
                StatusMessage = $"Error validating integrity: {ex.Message}";
                _logger.LogError(ex, "Failed to validate audit integrity");
            }
            finally
            {
                IsLoading = false;
            }
        }

        #endregion

        #region INotifyPropertyChanged

        public event PropertyChangedEventHandler PropertyChanged;

        protected virtual void OnPropertyChanged([CallerMemberName] string propertyName = null)
        {
            PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(propertyName));
        }

        protected bool SetProperty<T>(ref T field, T value, [CallerMemberName] string propertyName = null)
        {
            if (EqualityComparer<T>.Default.Equals(field, value)) return false;
            field = value;
            OnPropertyChanged(propertyName);
            return true;
        }

        #endregion
    }

    /// <summary>
    /// ViewModel wrapper for AuditEvent for UI binding
    /// </summary>
    public class AuditEventViewModel : INotifyPropertyChanged
    {
        private readonly AuditEvent _auditEvent;

        public AuditEventViewModel(AuditEvent auditEvent)
        {
            _auditEvent = auditEvent ?? throw new ArgumentNullException(nameof(auditEvent));
        }

        // Expose AuditEvent properties for UI binding
        public Guid AuditId => _auditEvent.AuditId;
        public DateTime Timestamp => _auditEvent.Timestamp;
        public string UserPrincipalName => _auditEvent.UserPrincipalName;
        public string SessionId => _auditEvent.SessionId;
        public string SourceProfile => _auditEvent.SourceProfile;
        public string TargetProfile => _auditEvent.TargetProfile;
        public AuditAction Action => _auditEvent.Action;
        public ObjectType ObjectType => _auditEvent.ObjectType;
        public string SourceObjectId => _auditEvent.SourceObjectId;
        public string SourceObjectName => _auditEvent.SourceObjectName;
        public string TargetObjectId => _auditEvent.TargetObjectId;
        public string TargetObjectName => _auditEvent.TargetObjectName;
        public string WaveId => _auditEvent.WaveId;
        public string WaveName => _auditEvent.WaveName;
        public string BatchId => _auditEvent.BatchId;
        public TimeSpan? Duration => _auditEvent.Duration;
        public string SourceEnvironment => _auditEvent.SourceEnvironment;
        public string TargetEnvironment => _auditEvent.TargetEnvironment;
        public string MachineName => _auditEvent.MachineName;
        public string MachineIpAddress => _auditEvent.MachineIpAddress;
        public AuditStatus Status => _auditEvent.Status;
        public string StatusMessage => _auditEvent.StatusMessage;
        public string ErrorCode => _auditEvent.ErrorCode;
        public string ErrorMessage => _auditEvent.ErrorMessage;
        public List<string> Warnings => _auditEvent.Warnings;
        public int RetryAttempts => _auditEvent.RetryAttempts;
        public int? ItemsProcessed => _auditEvent.ItemsProcessed;
        public long? DataSizeBytes => _auditEvent.DataSizeBytes;
        public double? TransferRate => _auditEvent.TransferRate;
        public Dictionary<string, string> Metadata => _auditEvent.Metadata;
        public Guid? ParentAuditId => _auditEvent.ParentAuditId;
        public string CorrelationId => _auditEvent.CorrelationId;
        public string MigrationResultData => _auditEvent.MigrationResultData;

        // Computed properties for UI
        public string DurationDisplay => Duration?.ToString(@"hh\:mm\:ss\.fff") ?? "N/A";
        public string DataSizeDisplay => DataSizeBytes.HasValue ? FormatBytes(DataSizeBytes.Value) : "N/A";
        public string StatusColor => Status switch
        {
            AuditStatus.Success => "Green",
            AuditStatus.Warning => "Orange",
            AuditStatus.Error => "Red",
            AuditStatus.InProgress => "Blue",
            AuditStatus.Cancelled => "Gray",
            AuditStatus.Skipped => "LightGray",
            _ => "Black"
        };

        private string FormatBytes(long bytes)
        {
            string[] suffixes = { "B", "KB", "MB", "GB", "TB" };
            int counter = 0;
            decimal number = bytes;
            while (Math.Round(number / 1024) >= 1)
            {
                number /= 1024;
                counter++;
            }
            return $"{number:n1} {suffixes[counter]}";
        }

        public event PropertyChangedEventHandler PropertyChanged;
    }
}