using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.ComponentModel;
using System.Linq;
using System.Runtime.CompilerServices;
using System.Windows;
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
            if (_wave == null) return;

            try
            {
                // Create comprehensive wave details
                var details = $"Migration Wave Details\n\n" +
                    $"Wave: {_wave.Name} (Order {_wave.Order})\n" +
                    $"ID: {_wave.Id}\n" +
                    $"Status: {_wave.Status}\n\n" +
                    $"TIMING:\n" +
                    $"Planned Start: {PlannedStartDate:g}\n" +
                    $"Actual Start: {ActualStartDisplayText}\n" +
                    $"Actual End: {ActualEndDisplayText}\n" +
                    $"Duration: {DurationDisplayText}\n" +
                    $"Time Remaining: {TimeRemainingDisplayText}\n\n" +
                    $"PROGRESS:\n" +
                    $"Batches: {BatchesProgressText}\n" +
                    $"Items: {ItemsProgressText}\n" +
                    $"Wave Progress: {WaveProgressPercentage:F1}%\n" +
                    $"Items Progress: {ItemsProgressPercentage:F1}%\n" +
                    $"Success Rate: {SuccessRate:F1}%\n\n" +
                    $"STATISTICS:\n" +
                    $"Total Batches: {TotalBatches}\n" +
                    $"Completed Batches: {CompletedBatches}\n" +
                    $"Failed Batches: {FailedBatches}\n" +
                    $"In Progress Batches: {InProgressBatches}\n" +
                    $"Pending Batches: {PendingBatches}\n\n" +
                    $"Total Items: {TotalItems}\n" +
                    $"Completed Items: {CompletedItems}\n" +
                    $"Failed Items: {FailedItems}\n" +
                    $"In Progress Items: {InProgressItems}\n" +
                    $"Pending Items: {PendingItems}\n\n" +
                    $"DATA TRANSFER:\n" +
                    $"Total Size: {SizeDisplayText}\n" +
                    $"Transferred: {FormatBytes(TransferredBytes)}\n" +
                    $"Average Rate: {TransferRateDisplayText}\n\n";

                if (!string.IsNullOrWhiteSpace(_wave.Notes))
                {
                    details += $"NOTES:\n{_wave.Notes}\n\n";
                }

                if (Prerequisites.Any())
                {
                    details += $"PREREQUISITES:\n" + string.Join("\n", Prerequisites) + "\n\n";
                }

                if (AllTags.Any())
                {
                    details += $"TAGS:\n" + string.Join(", ", AllTags) + "\n";
                }

                MessageBox.Show(details, $"Wave Details - {_wave.Name}",
                    MessageBoxButton.OK, MessageBoxImage.Information);

                _logger?.LogInformation($"Viewed details for wave: {_wave.Name}");
            }
            catch (Exception ex)
            {
                MessageBox.Show($"Failed to display wave details: {ex.Message}", "Error",
                    MessageBoxButton.OK, MessageBoxImage.Error);
                _logger?.LogError(ex, $"Failed to view details for wave {_wave?.Name}");
            }
        }

        private void ViewErrors()
        {
            if (_wave == null || !HasErrors) return;

            try
            {
                var errorDetails = $"Migration Wave Errors\n\n" +
                    $"Wave: {_wave.Name}\n" +
                    $"Total Errors: {AllErrors.Count} across {FailedBatches} batches\n\n";

                // Group errors by batch
                var errorsByBatch = new Dictionary<string, List<string>>();
                foreach (var batch in _batches.Where(b => b.HasErrors))
                {
                    errorsByBatch[batch.Name] = batch.Errors;
                }

                foreach (var batchErrors in errorsByBatch)
                {
                    errorDetails += $"BATCH: {batchErrors.Key}\n";
                    for (int i = 0; i < batchErrors.Value.Count; i++)
                    {
                        errorDetails += $"{i + 1}. {batchErrors.Value[i]}\n";
                    }
                    errorDetails += "\n";
                }

                if (HasWarnings)
                {
                    errorDetails += $"WARNINGS ({AllWarnings.Count}):\n";
                    foreach (var warning in AllWarnings.Take(10)) // Limit to first 10 warnings
                    {
                        errorDetails += $"• {warning}\n";
                    }
                    if (AllWarnings.Count > 10)
                    {
                        errorDetails += $"• ... and {AllWarnings.Count - 10} more warnings\n";
                    }
                }

                MessageBox.Show(errorDetails, $"Wave Errors - {_wave.Name}",
                    MessageBoxButton.OK, MessageBoxImage.Error);

                _logger?.LogInformation($"Viewed {AllErrors.Count} errors for wave: {_wave.Name}");
            }
            catch (Exception ex)
            {
                MessageBox.Show($"Failed to display wave errors: {ex.Message}", "Error",
                    MessageBoxButton.OK, MessageBoxImage.Error);
                _logger?.LogError(ex, $"Failed to view errors for wave {_wave?.Name}");
            }
        }

        private void ViewLogs()
        {
            if (_wave == null) return;

            try
            {
                // Simulate gathering logs from all batches
                var logDetails = $"Migration Wave Logs\n\n" +
                    $"Wave: {_wave.Name}\n" +
                    $"Generated: {DateTime.Now:yyyy-MM-dd HH:mm:ss}\n\n" +
                    $"Note: This is a summary of wave-level logs.\n" +
                    $"For detailed logs, view individual batch logs.\n\n";

                // Add wave-level status logs
                logDetails += $"WAVE STATUS LOGS:\n";
                logDetails += $"{DateTime.Now:yyyy-MM-dd HH:mm:ss} - Wave '{_wave.Name}' status: {_wave.Status}\n";

                if (_wave.ActualStartDate.HasValue)
                {
                    logDetails += $"{_wave.ActualStartDate.Value:yyyy-MM-dd HH:mm:ss} - Wave execution started\n";
                }

                if (_wave.ActualEndDate.HasValue)
                {
                    logDetails += $"{_wave.ActualEndDate.Value:yyyy-MM-dd HH:mm:ss} - Wave execution completed\n";
                }

                logDetails += "\nBATCH SUMMARY:\n";
                foreach (var batch in _batches)
                {
                    logDetails += $"- {batch.Name}: {batch.Status} ({batch.CompletedItems}/{batch.TotalItems} items)\n";
                }

                if (AllErrors.Any())
                {
                    logDetails += $"\nRECENT ERRORS ({AllErrors.Count}):\n";
                    foreach (var error in AllErrors.Take(5))
                    {
                        logDetails += $"- {error}\n";
                    }
                    if (AllErrors.Count > 5)
                    {
                        logDetails += $"- ... and {AllErrors.Count - 5} more errors\n";
                    }
                }

                MessageBox.Show(logDetails, $"Wave Logs - {_wave.Name}",
                    MessageBoxButton.OK, MessageBoxImage.Information);

                _logger?.LogInformation($"Viewed logs for wave: {_wave.Name}");
            }
            catch (Exception ex)
            {
                MessageBox.Show($"Failed to display wave logs: {ex.Message}", "Error",
                    MessageBoxButton.OK, MessageBoxImage.Error);
                _logger?.LogError(ex, $"Failed to view logs for wave {_wave?.Name}");
            }
        }

        private void ExportReport()
        {
            if (_wave == null) return;

            try
            {
                // Create export path with timestamp
                var timestamp = DateTime.Now.ToString("yyyyMMdd_HHmmss");
                var exportPath = System.IO.Path.Combine(
                    Environment.GetFolderPath(Environment.SpecialFolder.MyDocuments),
                    $"MigrationWaveReport_{_wave.Name}_{timestamp}.csv"
                );

                // Prepare CSV content
                var csvLines = new List<string>();

                // Header
                csvLines.Add("Migration Wave Report");
                csvLines.Add($"Wave: {_wave.Name}");
                csvLines.Add($"Order: {_wave.Order}");
                csvLines.Add($"Generated: {DateTime.Now:yyyy-MM-dd HH:mm:ss}");
                csvLines.Add($"Status: {_wave.Status}");
                csvLines.Add("");

                // Wave Summary
                csvLines.Add("WAVE SUMMARY");
                csvLines.Add($"Planned Start Date,{PlannedStartDate:yyyy-MM-dd HH:mm:ss}");
                csvLines.Add($"Actual Start Date,{ActualStartDate?.ToString("yyyy-MM-dd HH:mm:ss") ?? "N/A"}");
                csvLines.Add($"Actual End Date,{ActualEndDate?.ToString("yyyy-MM-dd HH:mm:ss") ?? "N/A"}");
                csvLines.Add($"Duration,{DurationDisplayText}");
                csvLines.Add($"Total Batches,{TotalBatches}");
                csvLines.Add($"Completed Batches,{CompletedBatches}");
                csvLines.Add($"Failed Batches,{FailedBatches}");
                csvLines.Add($"Total Items,{TotalItems}");
                csvLines.Add($"Completed Items,{CompletedItems}");
                csvLines.Add($"Failed Items,{FailedItems}");
                csvLines.Add($"Success Rate,{SuccessRate:F2}%");
                csvLines.Add($"Total Size,{SizeDisplayText}");
                csvLines.Add($"Average Transfer Rate,{TransferRateDisplayText}");
                csvLines.Add("");

                // Batch Details
                csvLines.Add("BATCH DETAILS");
                csvLines.Add("Batch Name,Status,Total Items,Completed Items,Failed Items,Progress %");
                foreach (var batch in _batches)
                {
                    var progress = batch.TotalItems > 0 ? (double)batch.CompletedItems / batch.TotalItems * 100 : 0;
                    csvLines.Add($"{batch.Name},{batch.Status},{batch.TotalItems},{batch.CompletedItems},{batch.FailedItems},{progress:F1}");
                }
                csvLines.Add("");

                // Errors and Warnings
                if (AllErrors.Any())
                {
                    csvLines.Add("ERRORS");
                    csvLines.Add("Error Message");
                    foreach (var error in AllErrors)
                    {
                        csvLines.Add(EscapeCsv(error));
                    }
                    csvLines.Add("");
                }

                if (AllWarnings.Any())
                {
                    csvLines.Add("WARNINGS");
                    csvLines.Add("Warning Message");
                    foreach (var warning in AllWarnings)
                    {
                        csvLines.Add(EscapeCsv(warning));
                    }
                    csvLines.Add("");
                }

                // Prerequisites
                if (Prerequisites.Any())
                {
                    csvLines.Add("PREREQUISITES");
                    csvLines.Add("Prerequisite");
                    foreach (var prereq in Prerequisites)
                    {
                        csvLines.Add(prereq);
                    }
                    csvLines.Add("");
                }

                // Notes
                if (!string.IsNullOrWhiteSpace(_wave.Notes))
                {
                    csvLines.Add("NOTES");
                    csvLines.Add(_wave.Notes);
                }

                // Write to file
                System.IO.File.WriteAllLines(exportPath, csvLines);

                MessageBox.Show($"Wave report exported successfully to: {exportPath}",
                    "Export Complete", MessageBoxButton.OK, MessageBoxImage.Information);

                _logger?.LogInformation($"Exported wave report to: {exportPath}");
            }
            catch (Exception ex)
            {
                MessageBox.Show($"Failed to export wave report: {ex.Message}", "Export Error",
                    MessageBoxButton.OK, MessageBoxImage.Error);
                _logger?.LogError(ex, $"Failed to export report for wave {_wave?.Name}");
            }
        }

        /// <summary>
        /// Escapes CSV values that contain commas, quotes, or newlines
        /// </summary>
        private string EscapeCsv(string value)
        {
            if (string.IsNullOrEmpty(value))
                return "";

            // If value contains comma, quote, or newline, wrap in quotes and escape internal quotes
            if (value.Contains(",") || value.Contains("\"") || value.Contains("\n") || value.Contains("\r"))
            {
                return "\"" + value.Replace("\"", "\"\"") + "\"";
            }

            return value;
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
            if (_wave == null) return;

            try
            {
                // Show input dialog for batch name
                var batchName = Microsoft.VisualBasic.Interaction.InputBox(
                    "Enter name for the new batch:",
                    "Add Batch to Wave",
                    $"Batch {_batches.Count + 1}");

                if (!string.IsNullOrWhiteSpace(batchName))
                {
                    // Create a new batch with default settings
                    var newBatch = new MigrationBatch
                    {
                        Id = Guid.NewGuid().ToString(),
                        Name = batchName,
                        Description = $"Batch added to wave {_wave.Name}",
                        PlannedStartDate = DateTime.Now.AddDays(1),
                        PlannedEndDate = DateTime.Now.AddDays(2),
                        Status = MigrationStatus.NotStarted,
                        Priority = MigrationPriority.Normal,
                        Items = new List<MigrationItem>() // Empty batch initially
                    };

                    // Add to wave
                    _wave.Batches.Add(newBatch);

                    // Create ViewModel and add to collection
                    var batchViewModel = new MigrationBatchViewModel(newBatch);
                    _batches.Add(batchViewModel);

                    // Refresh properties
                    RefreshProperties();

                    MessageBox.Show($"Batch '{batchName}' added successfully to wave '{_wave.Name}'",
                        "Batch Added", MessageBoxButton.OK, MessageBoxImage.Information);

                    _logger?.LogInformation($"Added batch '{batchName}' to wave: {_wave.Name}");
                }
            }
            catch (Exception ex)
            {
                MessageBox.Show($"Failed to add batch: {ex.Message}", "Error",
                    MessageBoxButton.OK, MessageBoxImage.Error);
                _logger?.LogError(ex, $"Failed to add batch to wave {_wave?.Name}");
            }
        }

        private void RemoveBatch()
        {
            if (_wave == null || _batches.Count == 0) return;

            try
            {
                // Show batch selection (simplified - in real implementation would use selected item)
                var batchNames = _batches.Select(b => b.Name).ToArray();

                var selectedBatchName = Microsoft.VisualBasic.Interaction.InputBox(
                    $"Select batch to remove:\n\n{string.Join("\n", batchNames)}",
                    "Remove Batch from Wave",
                    batchNames.FirstOrDefault() ?? "");

                if (!string.IsNullOrWhiteSpace(selectedBatchName))
                {
                    var batchToRemove = _batches.FirstOrDefault(b => b.Name == selectedBatchName);
                    if (batchToRemove != null)
                    {
                        // Confirm removal
                        var result = MessageBox.Show(
                            $"Are you sure you want to remove batch '{selectedBatchName}' from wave '{_wave.Name}'?\n\nThis will permanently remove the batch and all its items.",
                            "Confirm Batch Removal",
                            MessageBoxButton.YesNo,
                            MessageBoxImage.Warning);

                        if (result == MessageBoxResult.Yes)
                        {
                            // Remove from wave
                            _wave.Batches.Remove(batchToRemove.Batch);

                            // Remove from ViewModel collection
                            _batches.Remove(batchToRemove);

                            // Refresh properties
                            RefreshProperties();

                            MessageBox.Show($"Batch '{selectedBatchName}' removed successfully from wave '{_wave.Name}'",
                                "Batch Removed", MessageBoxButton.OK, MessageBoxImage.Information);

                            _logger?.LogInformation($"Removed batch '{selectedBatchName}' from wave: {_wave.Name}");
                        }
                    }
                    else
                    {
                        MessageBox.Show($"Batch '{selectedBatchName}' not found.", "Batch Not Found",
                            MessageBoxButton.OK, MessageBoxImage.Warning);
                    }
                }
            }
            catch (Exception ex)
            {
                MessageBox.Show($"Failed to remove batch: {ex.Message}", "Error",
                    MessageBoxButton.OK, MessageBoxImage.Error);
                _logger?.LogError(ex, $"Failed to remove batch from wave {_wave?.Name}");
            }
        }

        private void ReorderBatches()
        {
            if (_wave == null || _batches.Count < 2) return;

            try
            {
                // Show current batch order
                var currentOrder = string.Join("\n", _batches.Select((b, i) => $"{i + 1}. {b.Name}"));

                var newOrderInput = Microsoft.VisualBasic.Interaction.InputBox(
                    $"Current batch order:\n\n{currentOrder}\n\n" +
                    "Enter new order as comma-separated list (e.g., 2,1,3):\n" +
                    "Note: Numbers represent current positions (1-based)",
                    "Reorder Batches",
                    string.Join(",", Enumerable.Range(1, _batches.Count)));

                if (!string.IsNullOrWhiteSpace(newOrderInput))
                {
                    // Parse the new order
                    var orderParts = newOrderInput.Split(',').Select(p => p.Trim()).ToArray();
                    var newIndices = new List<int>();

                    foreach (var part in orderParts)
                    {
                        if (int.TryParse(part, out var index) && index >= 1 && index <= _batches.Count)
                        {
                            newIndices.Add(index - 1); // Convert to 0-based
                        }
                        else
                        {
                            MessageBox.Show($"Invalid order format. Use comma-separated numbers 1-{_batches.Count}",
                                "Invalid Format", MessageBoxButton.OK, MessageBoxImage.Warning);
                            return;
                        }
                    }

                    if (newIndices.Count != _batches.Count || newIndices.Distinct().Count() != _batches.Count)
                    {
                        MessageBox.Show("Order must contain each position exactly once.",
                            "Invalid Order", MessageBoxButton.OK, MessageBoxImage.Warning);
                        return;
                    }

                    // Reorder the batches
                    var reorderedBatches = newIndices.Select(i => _batches[i]).ToList();
                    var reorderedWaveBatches = newIndices.Select(i => _wave.Batches[i]).ToList();

                    // Update collections
                    _batches.Clear();
                    foreach (var batch in reorderedBatches)
                    {
                        _batches.Add(batch);
                    }

                    _wave.Batches.Clear();
                    _wave.Batches.AddRange(reorderedWaveBatches);

                    // Refresh properties
                    RefreshProperties();

                    var newOrderDisplay = string.Join("\n", _batches.Select((b, i) => $"{i + 1}. {b.Name}"));
                    MessageBox.Show($"Batches reordered successfully!\n\nNew order:\n{newOrderDisplay}",
                        "Batches Reordered", MessageBoxButton.OK, MessageBoxImage.Information);

                    _logger?.LogInformation($"Reordered batches for wave: {_wave.Name}");
                }
            }
            catch (Exception ex)
            {
                MessageBox.Show($"Failed to reorder batches: {ex.Message}", "Error",
                    MessageBoxButton.OK, MessageBoxImage.Error);
                _logger?.LogError(ex, $"Failed to reorder batches for wave {_wave?.Name}");
            }
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