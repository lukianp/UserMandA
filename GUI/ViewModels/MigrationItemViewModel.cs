using System;
using System.Collections.Generic;
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
    /// ViewModel for individual migration item management and tracking
    /// </summary>
    public class MigrationItemViewModel : INotifyPropertyChanged
    {
        #region Private Fields
        private MigrationItem _item;
        private bool _isSelected;
        private string _statusDisplayText;
        private readonly ILogger<MigrationItemViewModel> _logger;
        #endregion

        #region Constructor
        public MigrationItemViewModel(MigrationItem item, ILogger<MigrationItemViewModel> logger = null)
        {
            _item = item ?? throw new ArgumentNullException(nameof(item));
            _logger = logger;
            
            InitializeCommands();
            UpdateStatusDisplay();
        }
        #endregion

        #region Public Properties
        public MigrationItem Item
        {
            get => _item;
            set => SetProperty(ref _item, value);
        }

        public bool IsSelected
        {
            get => _isSelected;
            set => SetProperty(ref _isSelected, value);
        }

        public string StatusDisplayText
        {
            get => _statusDisplayText;
            set => SetProperty(ref _statusDisplayText, value);
        }

        // Item properties with UI bindings
        public string Id => _item?.Id;
        public string SourceIdentity => _item?.SourceIdentity;
        public string TargetIdentity => _item?.TargetIdentity;
        public string SourcePath => _item?.SourcePath;
        public string TargetPath => _item?.TargetPath;
        public MigrationType Type => _item?.Type ?? MigrationType.User;
        public MigrationStatus Status => _item?.Status ?? MigrationStatus.NotStarted;
        public MigrationPriority Priority => _item?.Priority ?? MigrationPriority.Normal;
        public MigrationComplexity Complexity => _item?.Complexity ?? MigrationComplexity.Simple;
        public DateTime? StartTime => _item?.StartTime;
        public DateTime? EndTime => _item?.EndTime;
        public DateTime? ValidationTime => _item?.ValidationTime;
        public TimeSpan? EstimatedDuration => _item?.EstimatedDuration;
        public TimeSpan? ActualDuration => _item?.ActualDuration;
        public double ProgressPercentage => _item?.ProgressPercentage ?? 0;
        public string DisplayName => _item?.DisplayName;
        public string Description => _item?.Description;
        public string AssignedTechnician => _item?.AssignedTechnician;
        public string BusinessJustification => _item?.BusinessJustification;

        // Size and transfer properties
        public long? SizeBytes => _item?.SizeBytes;
        public long? TransferredBytes => _item?.TransferredBytes;
        public double TransferRateMBps => _item?.TransferRateMBps ?? 0;
        public string FormattedSize => _item?.FormattedSize ?? "Unknown";

        // State properties
        public bool IsCompleted => _item?.IsCompleted ?? false;
        public bool HasErrors => _item?.HasErrors ?? false;
        public bool HasWarnings => _item?.HasWarnings ?? false;
        public bool IsHighRisk => _item?.IsHighRisk ?? false;
        public bool RequiresUserInteraction => _item?.RequiresUserInteraction ?? false;
        public bool AllowConcurrentMigration => _item?.AllowConcurrentMigration ?? true;
        public bool SupportsRollback => _item?.SupportsRollback ?? false;
        public bool IsValidationRequired => _item?.IsValidationRequired ?? false;
        public bool IsValidationPassed => _item?.IsValidationPassed ?? false;
        public bool EnableThrottling => _item?.EnableThrottling ?? false;

        // Retry and configuration
        public int RetryCount => _item?.RetryCount ?? 0;
        public int MaxRetryAttempts => _item?.MaxRetryAttempts ?? 3;
        public DateTime? LastRetryTime => _item?.LastRetryTime;
        public int MaxConcurrentStreams => _item?.MaxConcurrentStreams ?? 4;

        // Collections for UI display
        public List<string> Errors => _item?.Errors ?? new List<string>();
        public List<string> Warnings => _item?.Warnings ?? new List<string>();
        public List<string> ValidationResults => _item?.ValidationResults ?? new List<string>();
        public List<string> Dependencies => _item?.Dependencies ?? new List<string>();
        public List<string> DependentItems => _item?.DependentItems ?? new List<string>();
        public List<string> Tags => _item?.Tags ?? new List<string>();
        public List<string> PreMigrationChecklist => _item?.PreMigrationChecklist ?? new List<string>();
        public List<string> PostMigrationValidation => _item?.PostMigrationValidation ?? new List<string>();
        public List<string> QualityChecks => _item?.QualityChecks ?? new List<string>();
        public List<string> RollbackInstructions => _item?.RollbackInstructions ?? new List<string>();

        // Formatting for display
        public string TypeDisplayName => Type.ToString().Replace("", " ");
        public string StatusDisplayName => Status.ToString().Replace("", " ");
        public string PriorityDisplayName => Priority.ToString();
        public string ComplexityDisplayName => Complexity.ToString();
        
        public string DurationDisplayText => ActualDuration?.ToString(@"hh\:mm\:ss") ?? 
                                          EstimatedDuration?.ToString(@"hh\:mm\:ss") ?? "Unknown";
        
        public string ProgressDisplayText => $"{ProgressPercentage:F1}%";
        
        public string ErrorsDisplayText => HasErrors ? $"{Errors.Count} errors" : "No errors";
        public string WarningsDisplayText => HasWarnings ? $"{Warnings.Count} warnings" : "No warnings";
        
        public string TransferRateDisplayText => TransferRateMBps > 0 ? $"{TransferRateMBps:F2} MB/s" : "N/A";
        
        public string TransferProgressText => SizeBytes.HasValue && TransferredBytes.HasValue ?
            $"{FormatBytes(TransferredBytes.Value)} / {FormatBytes(SizeBytes.Value)}" : "Unknown";

        public string RetryDisplayText => RetryCount > 0 ? $"Retry {RetryCount}/{MaxRetryAttempts}" : "No retries";

        public string DependenciesDisplayText => Dependencies.Count > 0 ? 
            $"{Dependencies.Count} dependencies" : "No dependencies";

        public string ValidationDisplayText => IsValidationRequired ? 
            (IsValidationPassed ? "Validation passed" : "Validation pending") : "No validation";

        // Risk assessment display
        public string RiskAssessmentText
        {
            get
            {
                var risks = new List<string>();
                if (Complexity == MigrationComplexity.HighRisk) risks.Add("High complexity");
                if (Priority == MigrationPriority.Critical) risks.Add("Critical priority");
                if (Dependencies.Count > 0) risks.Add($"{Dependencies.Count} dependencies");
                if (RequiresUserInteraction) risks.Add("User interaction required");
                if (!SupportsRollback) risks.Add("No rollback support");
                
                return risks.Count > 0 ? string.Join(", ", risks) : "Low risk";
            }
        }
        #endregion

        #region Commands
        public ICommand StartItemCommand { get; private set; }
        public ICommand PauseItemCommand { get; private set; }
        public ICommand CancelItemCommand { get; private set; }
        public ICommand RetryItemCommand { get; private set; }
        public ICommand ValidateItemCommand { get; private set; }
        public ICommand ViewDetailsCommand { get; private set; }
        public ICommand ViewErrorsCommand { get; private set; }
        public ICommand ViewDependenciesCommand { get; private set; }
        public ICommand RollbackCommand { get; private set; }
        public ICommand RefreshCommand { get; private set; }
        #endregion

        #region Initialization
        private void InitializeCommands()
        {
            StartItemCommand = new RelayCommand(StartItem, CanStartItem);
            PauseItemCommand = new RelayCommand(PauseItem, CanPauseItem);
            CancelItemCommand = new RelayCommand(CancelItem, CanCancelItem);
            RetryItemCommand = new RelayCommand(RetryItem, CanRetryItem);
            ValidateItemCommand = new RelayCommand(ValidateItem, () => IsValidationRequired);
            ViewDetailsCommand = new RelayCommand(ViewDetails);
            ViewErrorsCommand = new RelayCommand(ViewErrors, () => HasErrors);
            ViewDependenciesCommand = new RelayCommand(ViewDependencies, () => Dependencies.Count > 0);
            RollbackCommand = new RelayCommand(RollbackItem, () => SupportsRollback && IsCompleted);
            RefreshCommand = new RelayCommand(RefreshItem);
        }
        #endregion

        #region Command Can Execute Methods
        private bool CanStartItem() => Status == MigrationStatus.NotStarted || Status == MigrationStatus.Ready;
        private bool CanPauseItem() => Status == MigrationStatus.InProgress;
        private bool CanCancelItem() => Status == MigrationStatus.InProgress || Status == MigrationStatus.Paused;
        private bool CanRetryItem() => Status == MigrationStatus.Failed && RetryCount < MaxRetryAttempts;
        #endregion

        #region Command Implementations
        private void StartItem()
        {
            try
            {
                if (_item == null || !CanStartItem()) return;

                _item.Status = MigrationStatus.InProgress;
                _item.StartTime = DateTime.Now;
                
                UpdateStatusDisplay();
                RefreshProperties();
                
                _logger?.LogInformation($"Started migration item: {_item.DisplayName ?? _item.SourceIdentity}");
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, $"Failed to start item {_item?.DisplayName ?? _item?.SourceIdentity}");
            }
        }

        private void PauseItem()
        {
            try
            {
                if (_item == null || !CanPauseItem()) return;

                _item.Status = MigrationStatus.Paused;
                UpdateStatusDisplay();
                RefreshProperties();
                
                _logger?.LogInformation($"Paused migration item: {_item.DisplayName ?? _item.SourceIdentity}");
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, $"Failed to pause item {_item?.DisplayName ?? _item?.SourceIdentity}");
            }
        }

        private void CancelItem()
        {
            try
            {
                if (_item == null || !CanCancelItem()) return;

                _item.Status = MigrationStatus.Cancelled;
                _item.EndTime = DateTime.Now;
                
                UpdateStatusDisplay();
                RefreshProperties();
                
                _logger?.LogInformation($"Cancelled migration item: {_item.DisplayName ?? _item.SourceIdentity}");
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, $"Failed to cancel item {_item?.DisplayName ?? _item?.SourceIdentity}");
            }
        }

        private void RetryItem()
        {
            try
            {
                if (_item == null || !CanRetryItem()) return;

                _item.RetryCount++;
                _item.LastRetryTime = DateTime.Now;
                _item.Status = MigrationStatus.NotStarted; // Reset to allow restart
                
                UpdateStatusDisplay();
                RefreshProperties();
                
                _logger?.LogInformation($"Retrying migration item: {_item.DisplayName ?? _item.SourceIdentity} (Attempt {_item.RetryCount})");
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, $"Failed to retry item {_item?.DisplayName ?? _item?.SourceIdentity}");
            }
        }

        private void ValidateItem()
        {
            try
            {
                if (_item == null) return;

                _item.ValidationTime = DateTime.Now;
                _item.Status = MigrationStatus.Validating;
                _item.ValidationResults.Clear();

                // Implement actual validation logic
                var validationErrors = new List<string>();
                var validationWarnings = new List<string>();

                // Validate source identity
                if (string.IsNullOrWhiteSpace(_item.SourceIdentity))
                {
                    validationErrors.Add("Source identity is required");
                }

                // Validate target identity
                if (string.IsNullOrWhiteSpace(_item.TargetIdentity))
                {
                    validationErrors.Add("Target identity is required");
                }

                // Validate paths if applicable
                if (_item.Type == MigrationType.FileShare || _item.Type == MigrationType.UserProfile)
                {
                    if (string.IsNullOrWhiteSpace(_item.SourcePath))
                    {
                        validationErrors.Add("Source path is required for file system migrations");
                    }
                    if (string.IsNullOrWhiteSpace(_item.TargetPath))
                    {
                        validationErrors.Add("Target path is required for file system migrations");
                    }
                }

                // Validate dependencies
                if (_item.Dependencies.Any())
                {
                    validationWarnings.Add($"Item has {Dependencies.Count} dependencies that should be migrated first");
                }

                // Validate size limits
                if (_item.SizeBytes.HasValue && _item.SizeBytes.Value > 100L * 1024 * 1024 * 1024) // 100GB
                {
                    validationWarnings.Add("Large item detected - may require special handling");
                }

                // Validate complexity
                if (_item.Complexity == MigrationComplexity.HighRisk)
                {
                    validationWarnings.Add("High-risk item requires additional review");
                }

                // Set validation results
                _item.ValidationResults.AddRange(validationErrors);
                _item.ValidationResults.AddRange(validationWarnings);

                // Determine if validation passed
                _item.IsValidationPassed = !validationErrors.Any();

                // Update status based on validation result
                if (_item.IsValidationPassed)
                {
                    _item.Status = MigrationStatus.Ready;
                }
                else
                {
                    _item.Status = MigrationStatus.Failed;
                    _item.Errors.AddRange(validationErrors);
                }

                // Add warnings to item warnings list
                if (validationWarnings.Any())
                {
                    _item.Warnings.AddRange(validationWarnings);
                }

                UpdateStatusDisplay();
                RefreshProperties();

                var resultMessage = _item.IsValidationPassed ? "passed" : $"failed with {validationErrors.Count} errors";
                _logger?.LogInformation($"Validated migration item: {_item.DisplayName ?? _item.SourceIdentity} - {resultMessage}");
            }
            catch (Exception ex)
            {
                _item.IsValidationPassed = false;
                _item.Status = MigrationStatus.Failed;
                _item.Errors.Add($"Validation error: {ex.Message}");

                UpdateStatusDisplay();
                RefreshProperties();

                _logger?.LogError(ex, $"Failed to validate item {_item?.DisplayName ?? _item?.SourceIdentity}");
            }
        }

        private void ViewDetails()
        {
            if (_item == null) return;

            try
            {
                // Create detailed information string
                var details = $"Migration Item Details\n\n" +
                    $"Name: {_item.DisplayName ?? "N/A"}\n" +
                    $"Source: {_item.SourceIdentity ?? "N/A"}\n" +
                    $"Target: {_item.TargetIdentity ?? "N/A"}\n" +
                    $"Type: {_item.Type}\n" +
                    $"Status: {_item.Status}\n" +
                    $"Priority: {_item.Priority}\n" +
                    $"Complexity: {_item.Complexity}\n" +
                    $"Size: {_item.FormattedSize ?? "Unknown"}\n" +
                    $"Progress: {_item.ProgressPercentage:F1}%\n" +
                    $"Start Time: {_item.StartTime?.ToString() ?? "Not started"}\n" +
                    $"Duration: {_item.ActualDuration?.ToString(@"hh\:mm\:ss") ?? _item.EstimatedDuration?.ToString(@"hh\:mm\:ss") ?? "Unknown"}\n" +
                    $"Assigned Technician: {_item.AssignedTechnician ?? "Unassigned"}\n" +
                    $"Business Justification: {_item.BusinessJustification ?? "Not specified"}";

                if (_item.Errors.Any())
                {
                    details += $"\n\nErrors ({_item.Errors.Count}):\n" + string.Join("\n", _item.Errors);
                }

                if (_item.Warnings.Any())
                {
                    details += $"\n\nWarnings ({_item.Warnings.Count}):\n" + string.Join("\n", _item.Warnings);
                }

                if (_item.Dependencies.Any())
                {
                    details += $"\n\nDependencies ({_item.Dependencies.Count}):\n" + string.Join("\n", _item.Dependencies);
                }

                MessageBox.Show(details, $"Migration Item Details - {_item.DisplayName ?? _item.SourceIdentity}",
                    MessageBoxButton.OK, MessageBoxImage.Information);

                _logger?.LogInformation($"Viewed details for item: {_item.DisplayName ?? _item.SourceIdentity}");
            }
            catch (Exception ex)
            {
                MessageBox.Show($"Failed to display item details: {ex.Message}", "Error",
                    MessageBoxButton.OK, MessageBoxImage.Error);
                _logger?.LogError(ex, $"Failed to view details for item {_item?.DisplayName ?? _item?.SourceIdentity}");
            }
        }

        private void ViewErrors()
        {
            if (_item == null || !_item.Errors.Any()) return;

            try
            {
                var errorDetails = $"Migration Item Errors\n\n" +
                    $"Item: {_item.DisplayName ?? _item.SourceIdentity}\n" +
                    $"Status: {_item.Status}\n" +
                    $"Total Errors: {_item.Errors.Count}\n\n" +
                    "Error Details:\n" +
                    string.Join("\n\n", _item.Errors.Select((error, index) => $"{index + 1}. {error}"));

                MessageBox.Show(errorDetails, $"Errors - {_item.DisplayName ?? _item.SourceIdentity}",
                    MessageBoxButton.OK, MessageBoxImage.Error);

                _logger?.LogInformation($"Viewed {_item.Errors.Count} errors for item: {_item.DisplayName ?? _item.SourceIdentity}");
            }
            catch (Exception ex)
            {
                MessageBox.Show($"Failed to display errors: {ex.Message}", "Error",
                    MessageBoxButton.OK, MessageBoxImage.Error);
                _logger?.LogError(ex, $"Failed to view errors for item {_item?.DisplayName ?? _item?.SourceIdentity}");
            }
        }

        private void ViewDependencies()
        {
            if (_item == null || !_item.Dependencies.Any()) return;

            try
            {
                var dependencyDetails = $"Migration Item Dependencies\n\n" +
                    $"Item: {_item.DisplayName ?? _item.SourceIdentity}\n" +
                    $"Total Dependencies: {_item.Dependencies.Count}\n" +
                    $"Dependent Items: {_item.DependentItems.Count}\n\n" +
                    "Dependencies (must be migrated first):\n" +
                    string.Join("\n", _item.Dependencies.Select((dep, index) => $"{index + 1}. {dep}"));

                if (_item.DependentItems.Any())
                {
                    dependencyDetails += "\n\nDependent Items (migrate after this item):\n" +
                        string.Join("\n", _item.DependentItems.Select((dep, index) => $"{index + 1}. {dep}"));
                }

                // Add migration order warning if applicable
                if (_item.Dependencies.Any())
                {
                    dependencyDetails += "\n\n⚠️ Warning: Ensure all dependencies are migrated before starting this item.";
                }

                MessageBox.Show(dependencyDetails, $"Dependencies - {_item.DisplayName ?? _item.SourceIdentity}",
                    MessageBoxButton.OK, MessageBoxImage.Information);

                _logger?.LogInformation($"Viewed {_item.Dependencies.Count} dependencies for item: {_item.DisplayName ?? _item.SourceIdentity}");
            }
            catch (Exception ex)
            {
                MessageBox.Show($"Failed to display dependencies: {ex.Message}", "Error",
                    MessageBoxButton.OK, MessageBoxImage.Error);
                _logger?.LogError(ex, $"Failed to view dependencies for item {_item?.DisplayName ?? _item?.SourceIdentity}");
            }
        }

        private void RollbackItem()
        {
            try
            {
                if (_item == null || !SupportsRollback || !IsCompleted) return;

                _item.Status = MigrationStatus.RolledBack;
                
                UpdateStatusDisplay();
                RefreshProperties();
                
                _logger?.LogInformation($"Rolled back migration item: {_item.DisplayName ?? _item.SourceIdentity}");
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, $"Failed to rollback item {_item?.DisplayName ?? _item?.SourceIdentity}");
            }
        }

        public void RefreshItem()
        {
            try
            {
                UpdateStatusDisplay();
                RefreshProperties();
                
                _logger?.LogDebug($"Refreshed item: {_item?.DisplayName ?? _item?.SourceIdentity}");
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, $"Failed to refresh item {_item?.DisplayName ?? _item?.SourceIdentity}");
            }
        }
        #endregion

        #region Helper Methods
        private void UpdateStatusDisplay()
        {
            if (_item == null) return;

            StatusDisplayText = Status switch
            {
                MigrationStatus.NotStarted => "Ready to Start",
                MigrationStatus.Planning => "Planning",
                MigrationStatus.Validating => "Validating",
                MigrationStatus.Ready => "Ready",
                MigrationStatus.InProgress => $"In Progress ({ProgressPercentage:F1}%)",
                MigrationStatus.Paused => $"Paused ({ProgressPercentage:F1}%)",
                MigrationStatus.Completed => "Completed",
                MigrationStatus.CompletedWithWarnings => $"Completed ({Warnings.Count} warnings)",
                MigrationStatus.Failed => $"Failed ({Errors.Count} errors)",
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
            OnPropertyChanged(nameof(HasErrors));
            OnPropertyChanged(nameof(HasWarnings));
            OnPropertyChanged(nameof(ErrorsDisplayText));
            OnPropertyChanged(nameof(WarningsDisplayText));
            OnPropertyChanged(nameof(IsCompleted));
            OnPropertyChanged(nameof(ActualDuration));
            OnPropertyChanged(nameof(DurationDisplayText));
            OnPropertyChanged(nameof(RetryCount));
            OnPropertyChanged(nameof(RetryDisplayText));
            OnPropertyChanged(nameof(TransferredBytes));
            OnPropertyChanged(nameof(TransferProgressText));
            OnPropertyChanged(nameof(TransferRateMBps));
            OnPropertyChanged(nameof(TransferRateDisplayText));
            OnPropertyChanged(nameof(IsValidationPassed));
            OnPropertyChanged(nameof(ValidationDisplayText));
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