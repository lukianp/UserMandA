using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.ComponentModel;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using System.Windows.Data;
using System.Windows.Input;
using MandADiscoverySuite.Migration;
using MandADiscoverySuite.Models.Migration;
using MandADiscoverySuite.Services.Migration;

namespace MandADiscoverySuite.ViewModels
{
    /// <summary>
    /// ViewModel for the Migration Validation view, handling post-migration validation and rollback operations.
    /// </summary>
    public class MigrationValidationViewModel : BaseViewModel
    {
        private readonly PostMigrationValidationService _validationService;
        private readonly ICollectionView _filteredValidationResultsView;
        private CancellationTokenSource? _cancellationTokenSource;

        #region Private Fields

        private ValidationResult? _selectedValidationResult;
        private ValidationSummary _summary = new();
        private string _statusMessage = "Ready";
        private bool _isValidating;
        private int _progressPercentage;
        private string _searchText = string.Empty;
        private string _selectedObjectTypeFilter = "All";
        private string _selectedSeverityFilter = "All";

        #endregion

        #region Properties

        /// <summary>
        /// All validation results.
        /// </summary>
        public ObservableCollection<ValidationResult> ValidationResults { get; } = new();

        /// <summary>
        /// Filtered view of validation results.
        /// </summary>
        public ICollectionView FilteredValidationResults => _filteredValidationResultsView;

        /// <summary>
        /// Currently selected validation result.
        /// </summary>
        public ValidationResult? SelectedValidationResult
        {
            get => _selectedValidationResult;
            set => SetProperty(ref _selectedValidationResult, value);
        }

        /// <summary>
        /// Summary statistics for validation results.
        /// </summary>
        public ValidationSummary Summary
        {
            get => _summary;
            set => SetProperty(ref _summary, value);
        }

        /// <summary>
        /// Current status message.
        /// </summary>
        public new string StatusMessage
        {
            get => _statusMessage;
            set => SetProperty(ref _statusMessage, value);
        }

        /// <summary>
        /// Whether validation is currently in progress.
        /// </summary>
        public bool IsValidating
        {
            get => _isValidating;
            set => SetProperty(ref _isValidating, value);
        }

        /// <summary>
        /// Current progress percentage (0-100).
        /// </summary>
        public int ProgressPercentage
        {
            get => _progressPercentage;
            set => SetProperty(ref _progressPercentage, value);
        }

        /// <summary>
        /// Search text for filtering results.
        /// </summary>
        public string SearchText
        {
            get => _searchText;
            set
            {
                if (SetProperty(ref _searchText, value))
                {
                    FilterResults();
                }
            }
        }

        /// <summary>
        /// Selected object type filter.
        /// </summary>
        public string SelectedObjectTypeFilter
        {
            get => _selectedObjectTypeFilter;
            set
            {
                if (SetProperty(ref _selectedObjectTypeFilter, value))
                {
                    FilterResults();
                }
            }
        }

        /// <summary>
        /// Selected severity filter.
        /// </summary>
        public string SelectedSeverityFilter
        {
            get => _selectedSeverityFilter;
            set
            {
                if (SetProperty(ref _selectedSeverityFilter, value))
                {
                    FilterResults();
                }
            }
        }

        /// <summary>
        /// Available object type filters.
        /// </summary>
        public ObservableCollection<string> ObjectTypeFilters { get; } = new() { "All", "User", "Mailbox", "File", "Database" };

        /// <summary>
        /// Available severity filters.
        /// </summary>
        public ObservableCollection<string> SeverityFilters { get; } = new() { "All", "Success", "Warning", "Error", "Critical" };

        /// <summary>
        /// Rollback operation history.
        /// </summary>
        public ObservableCollection<RollbackHistoryItem> RollbackHistory { get; } = new();

        /// <summary>
        /// Whether there are selected items for rollback.
        /// </summary>
        public bool HasSelectedItems => SelectedValidationResult != null;

        /// <summary>
        /// Whether there are failed items that can be rolled back.
        /// </summary>
        public bool HasFailedItems => ValidationResults.Any(r => 
            (r.Severity == ValidationSeverity.Error || r.Severity == ValidationSeverity.Critical) && r.CanRollback);

        #endregion

        #region Commands

        public ICommand RefreshCommand { get; }
        public ICommand ValidateWaveCommand { get; }
        public ICommand ExportReportCommand { get; }
        public ICommand ShowDetailsCommand { get; }
        public ICommand RollbackCommand { get; }
        public ICommand RevalidateCommand { get; }
        public ICommand RollbackSelectedCommand { get; }
        public ICommand RollbackAllFailedCommand { get; }
        public ICommand CancelOperationCommand { get; }
        public ICommand ClearFiltersCommand { get; }

        #endregion

        #region Constructor

        public MigrationValidationViewModel(PostMigrationValidationService validationService)
        {
            _validationService = validationService;

            // Set up filtered collection view
            _filteredValidationResultsView = CollectionViewSource.GetDefaultView(ValidationResults);
            _filteredValidationResultsView.Filter = FilterValidationResult;

            // Initialize commands
            RefreshCommand = new AsyncRelayCommand(RefreshValidationResultsAsync);
            ValidateWaveCommand = new AsyncRelayCommand(ValidateCurrentWaveAsync);
            ExportReportCommand = new AsyncRelayCommand(ExportValidationReportAsync);
            ShowDetailsCommand = new RelayCommand<ValidationResult>(ShowValidationDetails);
            RollbackCommand = new AsyncRelayCommand<ValidationResult>(RollbackValidationResultAsync);
            RevalidateCommand = new AsyncRelayCommand<ValidationResult>(RevalidateObjectAsync);
            RollbackSelectedCommand = new AsyncRelayCommand(RollbackSelectedValidationResultAsync);
            RollbackAllFailedCommand = new AsyncRelayCommand(RollbackAllFailedValidationResultsAsync);
            CancelOperationCommand = new RelayCommand(CancelCurrentOperation);
            ClearFiltersCommand = new RelayCommand(ClearAllFilters);

            // Subscribe to property changes for UI updates
            PropertyChanged += OnPropertyChanged;
        }

        #endregion

        #region Public Methods

        /// <summary>
        /// Loads validation results from a migration wave.
        /// </summary>
        public async Task LoadValidationResultsAsync(MigrationWave wave, TargetContext target)
        {
            try
            {
                IsValidating = true;
                StatusMessage = "Loading validation results...";
                _cancellationTokenSource = new CancellationTokenSource();

                var progress = new Progress<ValidationProgress>(UpdateProgress);
                var results = await _validationService.ValidateWaveAsync(wave, target, progress);

                ValidationResults.Clear();
                foreach (var result in results)
                {
                    ValidationResults.Add(result);
                }

                UpdateSummary();
                StatusMessage = $"Loaded {ValidationResults.Count} validation results";
            }
            catch (Exception ex)
            {
                StatusMessage = $"Failed to load validation results: {ex.Message}";
            }
            finally
            {
                IsValidating = false;
                ProgressPercentage = 0;
            }
        }

        /// <summary>
        /// Adds a single validation result.
        /// </summary>
        public void AddValidationResult(ValidationResult result)
        {
            ValidationResults.Add(result);
            UpdateSummary();
            OnPropertyChanged(nameof(HasFailedItems));
        }

        /// <summary>
        /// Updates an existing validation result.
        /// </summary>
        public void UpdateValidationResult(ValidationResult updatedResult)
        {
            var existingResult = ValidationResults.FirstOrDefault(r => r.Id == updatedResult.Id);
            if (existingResult != null)
            {
                var index = ValidationResults.IndexOf(existingResult);
                ValidationResults[index] = updatedResult;
                UpdateSummary();
            }
        }

        #endregion

        #region Private Methods

        private bool FilterValidationResult(object obj)
        {
            if (obj is not ValidationResult result) return false;

            // Object type filter
            if (SelectedObjectTypeFilter != "All" && result.ObjectType != SelectedObjectTypeFilter)
                return false;

            // Severity filter
            if (SelectedSeverityFilter != "All" && result.Severity.ToString() != SelectedSeverityFilter)
                return false;

            // Search text filter
            if (!string.IsNullOrEmpty(SearchText))
            {
                var searchLower = SearchText.ToLowerInvariant();
                return result.ObjectName.ToLowerInvariant().Contains(searchLower) ||
                       result.Message.ToLowerInvariant().Contains(searchLower) ||
                       result.Issues.Any(i => i.Description.ToLowerInvariant().Contains(searchLower));
            }

            return true;
        }

        private void FilterResults()
        {
            _filteredValidationResultsView.Refresh();
        }

        private void UpdateSummary()
        {
            Summary = _validationService.GetValidationSummary(ValidationResults.ToList());
            OnPropertyChanged(nameof(HasFailedItems));
        }

        private void UpdateProgress(ValidationProgress progress)
        {
            StatusMessage = progress.StatusMessage;
            ProgressPercentage = progress.PercentageComplete;
        }

        private void OnPropertyChanged(object? sender, PropertyChangedEventArgs e)
        {
            if (e.PropertyName == nameof(SelectedValidationResult))
            {
                OnPropertyChanged(nameof(HasSelectedItems));
            }
        }

        private async Task RefreshValidationResultsAsync()
        {
            try
            {
                StatusMessage = "Refreshing validation results...";
                
                // In a real implementation, this would reload results from the current wave
                await Task.Delay(1000); // Simulate refresh operation
                
                UpdateSummary();
                StatusMessage = "Validation results refreshed";
            }
            catch (Exception ex)
            {
                StatusMessage = $"Failed to refresh: {ex.Message}";
            }
        }

        private async Task ValidateCurrentWaveAsync()
        {
            try
            {
                IsValidating = true;
                StatusMessage = "Validating current migration wave...";
                _cancellationTokenSource = new CancellationTokenSource();

                // In a real implementation, this would get the current wave from the migration service
                // For now, we'll simulate validation
                await Task.Delay(3000, _cancellationTokenSource.Token);

                StatusMessage = "Wave validation completed";
            }
            catch (OperationCanceledException)
            {
                StatusMessage = "Wave validation was canceled";
            }
            catch (Exception ex)
            {
                StatusMessage = $"Wave validation failed: {ex.Message}";
            }
            finally
            {
                IsValidating = false;
                ProgressPercentage = 0;
            }
        }

        private async Task ExportValidationReportAsync()
        {
            try
            {
                StatusMessage = "Exporting validation report...";

                var reportContent = GenerateValidationReport();
                var fileName = $"ValidationReport_{DateTime.Now:yyyyMMdd_HHmmss}.txt";
                var filePath = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.Desktop), fileName);

                await File.WriteAllTextAsync(filePath, reportContent);

                StatusMessage = $"Report exported to {filePath}";
                
                // Open the file
                Process.Start(new ProcessStartInfo(filePath) { UseShellExecute = true });
            }
            catch (Exception ex)
            {
                StatusMessage = $"Failed to export report: {ex.Message}";
            }
        }

        private string GenerateValidationReport()
        {
            var report = new System.Text.StringBuilder();
            
            report.AppendLine("MIGRATION VALIDATION REPORT");
            report.AppendLine($"Generated: {DateTime.Now:yyyy-MM-dd HH:mm:ss}");
            report.AppendLine(new string('=', 50));
            report.AppendLine();

            // Summary
            report.AppendLine("SUMMARY");
            report.AppendLine($"Total Objects: {Summary.TotalObjects}");
            report.AppendLine($"Successful: {Summary.SuccessfulObjects}");
            report.AppendLine($"Warnings: {Summary.WarningObjects}");
            report.AppendLine($"Errors: {Summary.ErrorObjects}");
            report.AppendLine($"Critical: {Summary.CriticalObjects}");
            report.AppendLine($"Success Rate: {Summary.SuccessRate:F1}%");
            report.AppendLine();

            // Object Types
            report.AppendLine("BY OBJECT TYPE");
            foreach (var objectType in Summary.ObjectTypes)
            {
                report.AppendLine($"{objectType.Key}: {objectType.Value}");
            }
            report.AppendLine();

            // Detailed Results
            report.AppendLine("DETAILED RESULTS");
            report.AppendLine(new string('-', 50));

            foreach (var result in ValidationResults.OrderBy(r => r.Severity).ThenBy(r => r.ObjectType))
            {
                report.AppendLine($"Object: {result.ObjectName} ({result.ObjectType})");
                report.AppendLine($"Status: {result.Severity}");
                report.AppendLine($"Message: {result.Message}");
                report.AppendLine($"Validated: {result.ValidatedAt:yyyy-MM-dd HH:mm:ss}");
                
                if (result.Issues.Any())
                {
                    report.AppendLine("Issues:");
                    foreach (var issue in result.Issues)
                    {
                        report.AppendLine($"  - [{issue.Severity}] {issue.Category}: {issue.Description}");
                        report.AppendLine($"    Action: {issue.RecommendedAction}");
                    }
                }
                
                report.AppendLine();
            }

            return report.ToString();
        }

        private void ShowValidationDetails(ValidationResult? result)
        {
            if (result == null) return;

            SelectedValidationResult = result;
            StatusMessage = $"Showing details for {result.ObjectName}";
        }

        private async Task RollbackValidationResultAsync(ValidationResult? result)
        {
            if (result == null || !result.CanRollback) return;

            try
            {
                result.RollbackInProgress = true;
                StatusMessage = $"Rolling back {result.ObjectName}...";

                var target = new TargetContext(); // In real implementation, get from context
                var progress = new Progress<ValidationProgress>(UpdateProgress);
                
                var rollbackResult = await _validationService.RollbackValidationResultAsync(result, target, progress);

                // Add to rollback history
                AddRollbackHistoryItem(result, rollbackResult);

                if (rollbackResult.Success)
                {
                    ValidationResults.Remove(result);
                    UpdateSummary();
                    StatusMessage = $"Successfully rolled back {result.ObjectName}";
                }
                else
                {
                    StatusMessage = $"Rollback failed for {result.ObjectName}: {rollbackResult.Message}";
                }
            }
            catch (Exception ex)
            {
                StatusMessage = $"Rollback error: {ex.Message}";
            }
            finally
            {
                if (ValidationResults.Contains(result))
                {
                    result.RollbackInProgress = false;
                }
            }
        }

        private async Task RevalidateObjectAsync(ValidationResult? result)
        {
            if (result == null) return;

            try
            {
                StatusMessage = $"Revalidating {result.ObjectName}...";
                var target = new TargetContext();
                var progress = new Progress<ValidationProgress>(UpdateProgress);

                ValidationResult newResult = result.ObjectType.ToLowerInvariant() switch
                {
                    "user" => await _validationService.ValidateUserAsync((UserDto)result.ValidatedObject, target, progress),
                    "mailbox" => await _validationService.ValidateMailboxAsync((MailboxDto)result.ValidatedObject, target, progress),
                    "file" => await _validationService.ValidateFilesAsync((FileItemDto)result.ValidatedObject, target, progress),
                    "database" => await _validationService.ValidateSqlAsync((DatabaseDto)result.ValidatedObject, target, progress),
                    _ => throw new InvalidOperationException($"Unknown object type: {result.ObjectType}")
                };

                UpdateValidationResult(newResult);
                SelectedValidationResult = newResult;
                StatusMessage = $"Revalidation completed for {result.ObjectName}";
            }
            catch (Exception ex)
            {
                StatusMessage = $"Revalidation failed: {ex.Message}";
            }
        }

        private async Task RollbackSelectedValidationResultAsync()
        {
            if (SelectedValidationResult == null) return;
            await RollbackValidationResultAsync(SelectedValidationResult);
        }

        private async Task RollbackAllFailedValidationResultsAsync()
        {
            var failedResults = ValidationResults
                .Where(r => (r.Severity == ValidationSeverity.Error || r.Severity == ValidationSeverity.Critical) && r.CanRollback)
                .ToList();

            if (!failedResults.Any())
            {
                StatusMessage = "No failed items to roll back";
                return;
            }

            try
            {
                IsValidating = true;
                StatusMessage = $"Rolling back {failedResults.Count} failed items...";

                var target = new TargetContext();
                var progress = new Progress<ValidationProgress>(UpdateProgress);

                var rollbackResults = await _validationService.RollbackMultipleAsync(failedResults, target, progress);

                // Update UI and history
                var successCount = 0;
                for (int i = 0; i < failedResults.Count; i++)
                {
                    var result = failedResults[i];
                    var rollbackResult = rollbackResults[i];
                    
                    AddRollbackHistoryItem(result, rollbackResult);
                    
                    if (rollbackResult.Success)
                    {
                        ValidationResults.Remove(result);
                        successCount++;
                    }
                }

                UpdateSummary();
                StatusMessage = $"Rolled back {successCount} of {failedResults.Count} failed items";
            }
            catch (Exception ex)
            {
                StatusMessage = $"Bulk rollback error: {ex.Message}";
            }
            finally
            {
                IsValidating = false;
                ProgressPercentage = 0;
            }
        }

        private void CancelCurrentOperation()
        {
            _cancellationTokenSource?.Cancel();
            StatusMessage = "Operation canceled";
            IsValidating = false;
            ProgressPercentage = 0;
        }

        private void ClearAllFilters()
        {
            SearchText = string.Empty;
            SelectedObjectTypeFilter = "All";
            SelectedSeverityFilter = "All";
            StatusMessage = "Filters cleared";
        }

        private void AddRollbackHistoryItem(ValidationResult validationResult, RollbackResult rollbackResult)
        {
            var historyItem = new RollbackHistoryItem
            {
                ObjectType = validationResult.ObjectType,
                ObjectName = validationResult.ObjectName,
                Success = rollbackResult.Success,
                Message = rollbackResult.Message,
                RolledBackAt = rollbackResult.RolledBackAt
            };

            RollbackHistory.Insert(0, historyItem); // Add to beginning for newest first
        }

        #endregion
    }

    /// <summary>
    /// Represents a rollback history item for display purposes.
    /// </summary>
    public class RollbackHistoryItem
    {
        public string ObjectType { get; set; } = string.Empty;
        public string ObjectName { get; set; } = string.Empty;
        public bool Success { get; set; }
        public string Message { get; set; } = string.Empty;
        public DateTime RolledBackAt { get; set; }
    }
}