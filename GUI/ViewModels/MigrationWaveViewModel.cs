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
    /// ViewModel for migration wave management and orchestration
    /// </summary>
    public class MigrationWaveViewModel : INotifyPropertyChanged
    {
        #region Private Fields
        private MigrationOrchestratorWave _wave;
        private ObservableCollection<MigrationBatchViewModel> _batches;
        private bool _isSelected;
        private bool _isExpanded;
        private string _statusDisplayText;
        private readonly ILogger<MigrationWaveViewModel> _logger;
        #endregion

        #region Constructor
        public MigrationWaveViewModel(MigrationOrchestratorWave wave, ILogger<MigrationWaveViewModel> logger = null)
        {
            _wave = wave ?? throw new ArgumentNullException(nameof(wave));
            _logger = logger;
            
            InitializeBatches();
            InitializeCommands();
            UpdateStatusDisplay();
        }
        #endregion

        #region Public Properties
        public MigrationOrchestratorWave Wave
        {
            get => _wave;
            set => SetProperty(ref _wave, value);
        }

        public ObservableCollection<MigrationBatchViewModel> Batches
        {
            get => _batches;
            set => SetProperty(ref _batches, value);
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

        // Wave properties with UI bindings
        public string Id => _wave?.Id;
        public string Name => _wave?.Name;
        public int Order => _wave?.Order ?? 0;
        public DateTime PlannedStartDate => _wave?.PlannedStartDate ?? DateTime.Now;
        public DateTime? ActualStartDate => _wave?.ActualStartDate;
        public DateTime? ActualEndDate => _wave?.ActualEndDate;
        public MigrationStatus Status => _wave?.Status ?? MigrationStatus.NotStarted;
        public string Notes => _wave?.Notes;
        public List<string> Prerequisites => _wave?.Prerequisites ?? new List<string>();
        public Dictionary<string, object> Metadata => _wave?.Metadata ?? new Dictionary<string, object>();

        // Statistics and progress (calculated from batches)
        public int TotalBatches => _batches?.Count ?? 0;
        public int CompletedBatches => _batches?.Count(b => b.IsCompleted) ?? 0;
        public int FailedBatches => _batches?.Count(b => b.HasErrors) ?? 0;
        public int InProgressBatches => _batches?.Count(b => b.IsRunning) ?? 0;
        public int PendingBatches => _batches?.Count(b => b.Status == MigrationStatus.NotStarted) ?? 0;

        public int TotalItems => _batches?.Sum(b => b.TotalItems) ?? 0;
        public int CompletedItems => _batches?.Sum(b => b.CompletedItems) ?? 0;
        public int FailedItems => _batches?.Sum(b => b.FailedItems) ?? 0;
        public int InProgressItems => _batches?.Sum(b => b.InProgressItems) ?? 0;
        public int PendingItems => _batches?.Sum(b => b.PendingItems) ?? 0;

        public double WaveProgressPercentage => TotalBatches > 0 ? (double)CompletedBatches / TotalBatches * 100 : 0;
        public double ItemsProgressPercentage => TotalItems > 0 ? (double)CompletedItems / TotalItems * 100 : 0;
        public double SuccessRate => TotalItems > 0 ? (double)(CompletedItems - FailedItems) / TotalItems * 100 : 0;

        // Size and transfer data (calculated from batches)
        public long TotalSizeBytes => _batches?.Sum(b => b.TotalSizeBytes) ?? 0;
        public long TransferredBytes => _batches?.Sum(b => b.TransferredBytes) ?? 0;
        public double AverageTransferRateMBps => _batches?.Where(b => b.AverageTransferRateMBps > 0)
                                                          .DefaultIfEmpty()
                                                          .Average(b => b?.AverageTransferRateMBps ?? 0) ?? 0;

        // Duration tracking
        public TimeSpan? ActualDuration => ActualStartDate.HasValue && ActualEndDate.HasValue ? 
            ActualEndDate.Value - ActualStartDate.Value : null;

        public TimeSpan? EstimatedDuration
        {
            get
            {
                var totalEstimatedMinutes = _batches?.Sum(b => b.EstimatedDuration?.TotalMinutes ?? 30) ?? 0;
                return TimeSpan.FromMinutes(totalEstimatedMinutes);
            }
        }

        // State properties
        public bool IsCompleted => Status == MigrationStatus.Completed || Status == MigrationStatus.CompletedWithWarnings;
        public bool HasErrors => _batches?.Any(b => b.HasErrors) == true;
        public bool HasWarnings => _batches?.Any(b => b.HasWarnings) == true;
        public bool IsHighRisk => _batches?.Any(b => b.IsHighRisk) == true;
        public bool CanStart => Status == MigrationStatus.NotStarted || Status == MigrationStatus.Ready;
        public bool CanPause => Status == MigrationStatus.InProgress;
        public bool CanResume => Status == MigrationStatus.Paused;
        public bool IsRunning => Status == MigrationStatus.InProgress;

        // Collections for display
        public List<string> AllErrors => _batches?.SelectMany(b => b.Errors).ToList() ?? new List<string>();
        public List<string> AllWarnings => _batches?.SelectMany(b => b.Warnings).ToList() ?? new List<string>();
        public List<string> AllTags => _batches?.SelectMany(b => b.Tags).Distinct().ToList() ?? new List<string>();

        // Formatting for display
        public string StatusDisplayName => Status.ToString().Replace("", " ");
        public string OrderDisplayText => $"Wave {Order}";
        public string DurationDisplayText => ActualDuration?.ToString(@"hh\:mm\:ss") ?? 
                                           EstimatedDuration?.ToString(@"hh\:mm\:ss") ?? "Unknown";
        public string BatchesProgressText => $"{CompletedBatches}/{TotalBatches} batches";
        public string ItemsProgressText => $"{CompletedItems}/{TotalItems} items ({ItemsProgressPercentage:F1}%)";
        public string ErrorsDisplayText => HasErrors ? $"{AllErrors.Count} errors across {FailedBatches} batches" : "No errors";
        public string WarningsDisplayText => HasWarnings ? $"{AllWarnings.Count} warnings" : "No warnings";
        public string SizeDisplayText => FormatBytes(TotalSizeBytes);
        public string TransferRateDisplayText => AverageTransferRateMBps > 0 ? $"{AverageTransferRateMBps:F2} MB/s avg" : "N/A";

        public string PlannedDateDisplayText => PlannedStartDate.ToString("MMM dd, yyyy HH:mm");
        public string ActualStartDisplayText => ActualStartDate?.ToString("MMM dd, yyyy HH:mm") ?? "Not started";
        public string ActualEndDisplayText => ActualEndDate?.ToString("MMM dd, yyyy HH:mm") ?? (IsCompleted ? "Recently completed" : "Not completed");

        public string PrerequisitesDisplayText => Prerequisites.Count > 0 ? 
            $"{Prerequisites.Count} prerequisites" : "No prerequisites";

        public TimeSpan? EstimatedTimeRemaining
        {
            get
            {
                if (!ActualStartDate.HasValue || ItemsProgressPercentage <= 0) return null;
                
                var elapsed = DateTime.Now - ActualStartDate.Value;
                var totalEstimated = TimeSpan.FromTicks((long)(elapsed.Ticks / (ItemsProgressPercentage / 100.0)));
                return totalEstimated - elapsed;
            }
        }

        public string TimeRemainingDisplayText => EstimatedTimeRemaining?.ToString(@"hh\:mm\:ss") ?? "Unknown";
        #endregion

        #region Commands
        public ICommand StartWaveCommand { get; private set; }
        public ICommand PauseWaveCommand { get; private set; }
        public ICommand ResumeWaveCommand { get; private set; }
        public ICommand CancelWaveCommand { get; private set; }
        public ICommand ViewDetailsCommand { get; private set; }
        public ICommand ViewErrorsCommand { get; private set; }
        public ICommand ViewLogsCommand { get; private set; }
        public ICommand ExportReportCommand { get; private set; }
        public ICommand RefreshCommand { get; private set; }
        public ICommand AddBatchCommand { get; private set; }
        public ICommand RemoveBatchCommand { get; private set; }
        public ICommand ReorderBatchesCommand { get; private set; }
        #endregion

        #region Initialization
        private void InitializeBatches()
        {
            _batches = new ObservableCollection<MigrationBatchViewModel>();
            
            if (_wave?.Batches != null)
            {
                foreach (var batch in _wave.Batches)
                {
                    var batchViewModel = new MigrationBatchViewModel(batch);
                    _batches.Add(batchViewModel);
                }
            }
        }

        private void InitializeCommands()
        {
            StartWaveCommand = new RelayCommand(StartWave, () => CanStart);
            PauseWaveCommand = new RelayCommand(PauseWave, () => CanPause);
            ResumeWaveCommand = new RelayCommand(ResumeWave, () => CanResume);
            CancelWaveCommand = new RelayCommand(CancelWave, () => IsRunning);
            ViewDetailsCommand = new RelayCommand(ViewDetails);
            ViewErrorsCommand = new RelayCommand(ViewErrors, () => HasErrors);
            ViewLogsCommand = new RelayCommand(ViewLogs);
            ExportReportCommand = new RelayCommand(ExportReport);
            RefreshCommand = new RelayCommand(RefreshWave);
            AddBatchCommand = new RelayCommand(AddBatch);
            RemoveBatchCommand = new RelayCommand(RemoveBatch);
            ReorderBatchesCommand = new RelayCommand(ReorderBatches);
        }
        #endregion

        #region Command Implementations
        private void StartWave()
        {
            try
            {
                if (_wave == null || !CanStart) return;

                _wave.Status = MigrationStatus.InProgress;
                _wave.ActualStartDate = DateTime.Now;
                
                UpdateStatusDisplay();
                RefreshProperties();
                
                _logger?.LogInformation($"Started migration wave: {_wave.Name} (Order {_wave.Order})");
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, $"Failed to start wave {_wave?.Name}");
            }
        }

        private void PauseWave()
        {
            try
            {
                if (_wave == null || !CanPause) return;

                _wave.Status = MigrationStatus.Paused;
                
                // Pause all running batches
                foreach (var batch in _batches.Where(b => b.IsRunning))
                {
                    batch.PauseBatchCommand.Execute(null);
                }
                
                UpdateStatusDisplay();
                RefreshProperties();
                
                _logger?.LogInformation($"Paused migration wave: {_wave.Name}");
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, $"Failed to pause wave {_wave?.Name}");
            }
        }

        private void ResumeWave()
        {
            try
            {
                if (_wave == null || !CanResume) return;

                _wave.Status = MigrationStatus.InProgress;
                
                // Resume paused batches
                foreach (var batch in _batches.Where(b => b.Status == MigrationStatus.Paused))
                {
                    batch.ResumeBatchCommand.Execute(null);
                }
                
                UpdateStatusDisplay();
                RefreshProperties();
                
                _logger?.LogInformation($"Resumed migration wave: {_wave.Name}");
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, $"Failed to resume wave {_wave?.Name}");
            }
        }

        private void CancelWave()
        {
            try
            {
                if (_wave == null) return;

                _wave.Status = MigrationStatus.Cancelled;
                _wave.ActualEndDate = DateTime.Now;
                
                // Cancel all running batches
                foreach (var batch in _batches.Where(b => b.IsRunning))
                {
                    batch.CancelBatchCommand.Execute(null);
                }
                
                UpdateStatusDisplay();
                RefreshProperties();
                
                _logger?.LogInformation($"Cancelled migration wave: {_wave.Name}");
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, $"Failed to cancel wave {_wave?.Name}");
            }
        }

        private void ViewDetails()
        {
            // TODO: Open detailed wave view window
            _logger?.LogInformation($"Viewing details for wave: {_wave?.Name}");
        }

        private void ViewErrors()
        {
            // TODO: Open errors dialog showing all wave errors
            _logger?.LogInformation($"Viewing errors for wave: {_wave?.Name}");
        }

        private void ViewLogs()
        {
            // TODO: Open log viewer for wave
            _logger?.LogInformation($"Viewing logs for wave: {_wave?.Name}");
        }

        private void ExportReport()
        {
            // TODO: Export comprehensive wave report
            _logger?.LogInformation($"Exporting report for wave: {_wave?.Name}");
        }

        public void RefreshWave()
        {
            try
            {
                UpdateStatusDisplay();
                RefreshProperties();
                
                // Refresh all batches
                foreach (var batch in _batches)
                {
                    batch.RefreshBatch();
                }
                
                _logger?.LogDebug($"Refreshed wave: {_wave?.Name}");
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, $"Failed to refresh wave {_wave?.Name}");
            }
        }

        private void AddBatch()
        {
            // TODO: Open dialog to add new batch to wave
            _logger?.LogInformation($"Adding batch to wave: {_wave?.Name}");
        }

        private void RemoveBatch()
        {
            // TODO: Remove selected batch from wave
            _logger?.LogInformation($"Removing batch from wave: {_wave?.Name}");
        }

        private void ReorderBatches()
        {
            // TODO: Open dialog to reorder batches
            _logger?.LogInformation($"Reordering batches for wave: {_wave?.Name}");
        }
        #endregion

        #region Helper Methods
        private void UpdateStatusDisplay()
        {
            if (_wave == null) return;

            StatusDisplayText = Status switch
            {
                MigrationStatus.NotStarted => "Ready to Start",
                MigrationStatus.Planning => "Planning Wave",
                MigrationStatus.Validating => "Validating Batches",
                MigrationStatus.Ready => "Ready to Execute",
                MigrationStatus.InProgress => $"In Progress ({CompletedBatches}/{TotalBatches} batches)",
                MigrationStatus.Paused => $"Paused ({ItemsProgressPercentage:F1}%)",
                MigrationStatus.Completed => "Completed Successfully",
                MigrationStatus.CompletedWithWarnings => $"Completed with {AllWarnings.Count} warnings",
                MigrationStatus.Failed => $"Failed with {AllErrors.Count} errors",
                MigrationStatus.Cancelled => "Cancelled",
                MigrationStatus.RolledBack => "Rolled Back",
                _ => Status.ToString()
            };
        }

        private void RefreshProperties()
        {
            // Refresh all calculated properties
            OnPropertyChanged(nameof(Status));
            OnPropertyChanged(nameof(StatusDisplayText));
            OnPropertyChanged(nameof(TotalBatches));
            OnPropertyChanged(nameof(CompletedBatches));
            OnPropertyChanged(nameof(FailedBatches));
            OnPropertyChanged(nameof(InProgressBatches));
            OnPropertyChanged(nameof(PendingBatches));
            OnPropertyChanged(nameof(TotalItems));
            OnPropertyChanged(nameof(CompletedItems));
            OnPropertyChanged(nameof(FailedItems));
            OnPropertyChanged(nameof(InProgressItems));
            OnPropertyChanged(nameof(PendingItems));
            OnPropertyChanged(nameof(WaveProgressPercentage));
            OnPropertyChanged(nameof(ItemsProgressPercentage));
            OnPropertyChanged(nameof(SuccessRate));
            OnPropertyChanged(nameof(BatchesProgressText));
            OnPropertyChanged(nameof(ItemsProgressText));
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
            OnPropertyChanged(nameof(TotalSizeBytes));
            OnPropertyChanged(nameof(TransferredBytes));
            OnPropertyChanged(nameof(SizeDisplayText));
            OnPropertyChanged(nameof(TransferRateDisplayText));
        }

        public void UpdateProgress()
        {
            // Update all batch progress
            foreach (var batch in _batches)
            {
                batch.UpdateProgress();
            }
            
            // Check if wave is complete
            if (Status == MigrationStatus.InProgress && CompletedBatches == TotalBatches && TotalBatches > 0)
            {
                _wave.Status = HasErrors ? MigrationStatus.CompletedWithWarnings : MigrationStatus.Completed;
                _wave.ActualEndDate = DateTime.Now;
            }
            
            RefreshProperties();
        }

        public List<MigrationBatchViewModel> GetHighRiskBatches()
        {
            return _batches?.Where(b => b.IsHighRisk).ToList() ?? new List<MigrationBatchViewModel>();
        }

        public List<MigrationBatchViewModel> GetBatchesByStatus(MigrationStatus status)
        {
            return _batches?.Where(b => b.Status == status).ToList() ?? new List<MigrationBatchViewModel>();
        }

        private static string FormatBytes(long bytes)
        {
            string[] sizes = { "B", "KB", "MB", "GB", "TB" };
            double len = bytes;
            int order = 0;
            while (len >= 1024 && order < sizes.Length - 1)
            {
                order++;
                len = len / 1024;
            }
            return $"{len:0.##} {sizes[order]}";
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