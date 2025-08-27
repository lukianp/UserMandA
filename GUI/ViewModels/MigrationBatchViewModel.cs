using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.ComponentModel;
using System.Linq;
using System.Runtime.CompilerServices;
using System.Windows.Input;
using CommunityToolkit.Mvvm.Input;
using MandADiscoverySuite.Models;
using Microsoft.Extensions.Logging;

namespace MandADiscoverySuite.ViewModels
{
    /// <summary>
    /// ViewModel for migration batch management and tracking
    /// </summary>
    public class MigrationBatchViewModel : INotifyPropertyChanged
    {
        #region Private Fields
        private MigrationBatch _batch;
        private ObservableCollection<MigrationItemViewModel> _items;
        private bool _isSelected;
        private bool _isExpanded;
        private string _statusDisplayText;
        private readonly ILogger<MigrationBatchViewModel> _logger;
        #endregion

        #region Constructor
        public MigrationBatchViewModel(MigrationBatch batch, ILogger<MigrationBatchViewModel> logger = null)
        {
            _batch = batch ?? throw new ArgumentNullException(nameof(batch));
            _logger = logger;
            
            InitializeItems();
            InitializeCommands();
            UpdateStatusDisplay();
        }
        #endregion

        #region Public Properties
        public MigrationBatch Batch
        {
            get => _batch;
            set => SetProperty(ref _batch, value);
        }

        public ObservableCollection<MigrationItemViewModel> Items
        {
            get => _items;
            set => SetProperty(ref _items, value);
        }

        public bool IsSelected
        {
            get => _isSelected;
            set => SetProperty(ref _isSelected, value);
        }

        public bool IsExpanded
        {
            get => _isExpanded;
            set => SetProperty(ref _isExpanded, value);
        }

        public string StatusDisplayText
        {
            get => _statusDisplayText;
            set => SetProperty(ref _statusDisplayText, value);
        }

        // Batch properties with UI bindings
        public string Name => _batch?.Name;
        public string Description => _batch?.Description;
        public MigrationType Type => _batch?.Type ?? MigrationType.User;
        public MigrationStatus Status => _batch?.Status ?? MigrationStatus.NotStarted;
        public MigrationPriority Priority => _batch?.Priority ?? MigrationPriority.Normal;
        public MigrationComplexity Complexity => _batch?.Complexity ?? MigrationComplexity.Simple;
        public DateTime? StartTime => _batch?.StartTime;
        public DateTime? EndTime => _batch?.EndTime;
        public DateTime? PlannedStartDate => _batch?.PlannedStartDate;
        public DateTime? PlannedEndDate => _batch?.PlannedEndDate;
        public TimeSpan? EstimatedDuration => _batch?.EstimatedDuration;
        public TimeSpan? ActualDuration => _batch?.ActualDuration;
        public string AssignedTechnician => _batch?.AssignedTechnician;
        public string BusinessOwner => _batch?.BusinessOwner;

        // Statistics and progress
        public int TotalItems => _batch?.TotalItems ?? 0;
        public int CompletedItems => _batch?.CompletedItems ?? 0;
        public int FailedItems => _batch?.FailedItems ?? 0;
        public int ItemsWithWarnings => _batch?.ItemsWithWarnings ?? 0;
        public int InProgressItems => _batch?.InProgressItems ?? 0;
        public int PendingItems => _batch?.PendingItems ?? 0;
        public double ProgressPercentage => _batch?.ProgressPercentage ?? 0;
        public double SuccessRate => _batch?.SuccessRate ?? 0;

        // Size and transfer data
        public long TotalSizeBytes => _batch?.TotalSizeBytes ?? 0;
        public long TransferredBytes => _batch?.TransferredBytes ?? 0;
        public double AverageTransferRateMBps => _batch?.AverageTransferRateMBps ?? 0;
        public string FormattedTotalSize => _batch?.FormattedTotalSize ?? "Unknown";

        // State properties
        public bool IsCompleted => _batch?.IsCompleted ?? false;
        public bool HasErrors => _batch?.HasErrors ?? false;
        public bool HasWarnings => _batch?.HasWarnings ?? false;
        public bool IsHighRisk => _batch?.IsHighRisk ?? false;
        public bool CanStart => _batch?.CanStart ?? false;
        public bool CanPause => _batch?.CanPause ?? false;
        public bool CanResume => _batch?.CanResume ?? false;
        public bool IsRunning => _batch?.IsRunning ?? false;

        // Business data
        public string BusinessJustification => _batch?.BusinessJustification;
        public decimal? EstimatedCost => _batch?.EstimatedCost;
        public decimal? ActualCost => _batch?.ActualCost;
        public bool RequiresApproval => _batch?.RequiresApproval ?? false;
        public string ApprovedBy => _batch?.ApprovedBy;
        public DateTime? ApprovalDate => _batch?.ApprovalDate;

        // Collections for UI display
        public List<string> Errors => _batch?.Errors ?? new List<string>();
        public List<string> Warnings => _batch?.Warnings ?? new List<string>();
        public List<string> Tags => _batch?.Tags ?? new List<string>();
        public List<string> Prerequisites => _batch?.Prerequisites ?? new List<string>();
        public List<string> PostMigrationTasks => _batch?.PostMigrationTasks ?? new List<string>();

        // Formatting for display
        public string TypeDisplayName => Type.ToString().Replace("", " ");
        public string StatusDisplayName => Status.ToString().Replace("", " ");
        public string PriorityDisplayName => Priority.ToString();
        public string ComplexityDisplayName => Complexity.ToString();
        
        public string DurationDisplayText => ActualDuration?.ToString(@"hh\:mm\:ss") ?? 
                                          EstimatedDuration?.ToString(@"hh\:mm\:ss") ?? "Unknown";
        
        public string ProgressDisplayText => $"{CompletedItems}/{TotalItems} ({ProgressPercentage:F1}%)";
        
        public string ErrorsDisplayText => HasErrors ? $"{Errors.Count} errors" : "No errors";
        public string WarningsDisplayText => HasWarnings ? $"{Warnings.Count} warnings" : "No warnings";
        
        public TimeSpan? EstimatedTimeRemaining => _batch?.GetEstimatedTimeRemaining();
        public string TimeRemainingDisplayText => EstimatedTimeRemaining?.ToString(@"hh\:mm\:ss") ?? "Unknown";
        #endregion

        #region Commands
        public ICommand StartBatchCommand { get; private set; }
        public ICommand PauseBatchCommand { get; private set; }
        public ICommand ResumeBatchCommand { get; private set; }
        public ICommand CancelBatchCommand { get; private set; }
        public ICommand ViewDetailsCommand { get; private set; }
        public ICommand ViewErrorsCommand { get; private set; }
        public ICommand ViewLogsCommand { get; private set; }
        public ICommand ExportReportCommand { get; private set; }
        public ICommand RefreshCommand { get; private set; }
        #endregion

        #region Initialization
        private void InitializeItems()
        {
            _items = new ObservableCollection<MigrationItemViewModel>();
            
            if (_batch?.Items != null)
            {
                foreach (var item in _batch.Items)
                {
                    var itemViewModel = new MigrationItemViewModel(item);
                    _items.Add(itemViewModel);
                }
            }
        }

        private void InitializeCommands()
        {
            StartBatchCommand = new RelayCommand(StartBatch, () => CanStart);
            PauseBatchCommand = new RelayCommand(PauseBatch, () => CanPause);
            ResumeBatchCommand = new RelayCommand(ResumeBatch, () => CanResume);
            CancelBatchCommand = new RelayCommand(CancelBatch, () => IsRunning);
            ViewDetailsCommand = new RelayCommand(ViewDetails);
            ViewErrorsCommand = new RelayCommand(ViewErrors, () => HasErrors);
            ViewLogsCommand = new RelayCommand(ViewLogs);
            ExportReportCommand = new RelayCommand(ExportReport);
            RefreshCommand = new RelayCommand(RefreshBatch);
        }
        #endregion

        #region Command Implementations
        private void StartBatch()
        {
            try
            {
                if (_batch == null || !CanStart) return;

                _batch.Status = MigrationStatus.InProgress;
                _batch.StartTime = DateTime.Now;
                
                UpdateStatusDisplay();
                RefreshProperties();
                
                _logger?.LogInformation($"Started migration batch: {_batch.Name}");
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, $"Failed to start batch {_batch?.Name}");
            }
        }

        private void PauseBatch()
        {
            try
            {
                if (_batch == null || !CanPause) return;

                _batch.Status = MigrationStatus.Paused;
                UpdateStatusDisplay();
                RefreshProperties();
                
                _logger?.LogInformation($"Paused migration batch: {_batch.Name}");
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, $"Failed to pause batch {_batch?.Name}");
            }
        }

        private void ResumeBatch()
        {
            try
            {
                if (_batch == null || !CanResume) return;

                _batch.Status = MigrationStatus.InProgress;
                UpdateStatusDisplay();
                RefreshProperties();
                
                _logger?.LogInformation($"Resumed migration batch: {_batch.Name}");
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, $"Failed to resume batch {_batch?.Name}");
            }
        }

        private void CancelBatch()
        {
            try
            {
                if (_batch == null) return;

                _batch.Status = MigrationStatus.Cancelled;
                _batch.EndTime = DateTime.Now;
                
                UpdateStatusDisplay();
                RefreshProperties();
                
                _logger?.LogInformation($"Cancelled migration batch: {_batch.Name}");
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, $"Failed to cancel batch {_batch?.Name}");
            }
        }

        private void ViewDetails()
        {
            // TODO: Open detailed batch view window
            _logger?.LogInformation($"Viewing details for batch: {_batch?.Name}");
        }

        private void ViewErrors()
        {
            // TODO: Open errors dialog
            _logger?.LogInformation($"Viewing errors for batch: {_batch?.Name}");
        }

        private void ViewLogs()
        {
            // TODO: Open log viewer
            _logger?.LogInformation($"Viewing logs for batch: {_batch?.Name}");
        }

        private void ExportReport()
        {
            // TODO: Export batch report
            _logger?.LogInformation($"Exporting report for batch: {_batch?.Name}");
        }

        public void RefreshBatch()
        {
            try
            {
                UpdateStatusDisplay();
                RefreshProperties();
                
                // Refresh items
                foreach (var item in _items)
                {
                    item.RefreshItem();
                }
                
                _logger?.LogDebug($"Refreshed batch: {_batch?.Name}");
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, $"Failed to refresh batch {_batch?.Name}");
            }
        }
        #endregion

        #region Helper Methods
        private void UpdateStatusDisplay()
        {
            if (_batch == null) return;

            StatusDisplayText = Status switch
            {
                MigrationStatus.NotStarted => "Ready to Start",
                MigrationStatus.Planning => "Planning Migration",
                MigrationStatus.Validating => "Validating Items",
                MigrationStatus.Ready => "Ready to Migrate",
                MigrationStatus.InProgress => $"In Progress ({ProgressPercentage:F1}%)",
                MigrationStatus.Paused => $"Paused ({ProgressPercentage:F1}%)",
                MigrationStatus.Completed => "Completed Successfully",
                MigrationStatus.CompletedWithWarnings => $"Completed with {Warnings.Count} warnings",
                MigrationStatus.Failed => $"Failed with {Errors.Count} errors",
                MigrationStatus.Cancelled => "Cancelled",
                MigrationStatus.RolledBack => "Rolled Back",
                _ => Status.ToString()
            };
        }

        private void RefreshProperties()
        {
            OnPropertyChanged(nameof(Status));
            OnPropertyChanged(nameof(StatusDisplayText));
            OnPropertyChanged(nameof(ProgressPercentage));
            OnPropertyChanged(nameof(ProgressDisplayText));
            OnPropertyChanged(nameof(CompletedItems));
            OnPropertyChanged(nameof(FailedItems));
            OnPropertyChanged(nameof(HasErrors));
            OnPropertyChanged(nameof(HasWarnings));
            OnPropertyChanged(nameof(ErrorsDisplayText));
            OnPropertyChanged(nameof(WarningsDisplayText));
            OnPropertyChanged(nameof(CanStart));
            OnPropertyChanged(nameof(CanPause));
            OnPropertyChanged(nameof(CanResume));
            OnPropertyChanged(nameof(IsRunning));
            OnPropertyChanged(nameof(IsCompleted));
            OnPropertyChanged(nameof(ActualDuration));
            OnPropertyChanged(nameof(DurationDisplayText));
            OnPropertyChanged(nameof(EstimatedTimeRemaining));
            OnPropertyChanged(nameof(TimeRemainingDisplayText));
        }

        public void UpdateProgress()
        {
            _batch?.UpdateProgress();
            RefreshProperties();
        }

        public List<MigrationItemViewModel> GetHighRiskItems()
        {
            return Items?.Where(i => i.IsHighRisk).ToList() ?? new List<MigrationItemViewModel>();
        }

        public List<MigrationItemViewModel> GetItemsByStatus(MigrationStatus status)
        {
            return Items?.Where(i => i.Status == status).ToList() ?? new List<MigrationItemViewModel>();
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
}