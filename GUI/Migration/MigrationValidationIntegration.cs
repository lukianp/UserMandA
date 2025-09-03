using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Threading.Tasks;
using System.Windows.Input;
using MandADiscoverySuite.ViewModels;
using MandADiscoverySuite.Models.Migration;
using CommunityToolkit.Mvvm.Input;

namespace MandADiscoverySuite.Migration
{
    /// <summary>
    /// Helper service to integrate post-migration validation capabilities into existing migration ViewModels.
    /// Provides a consistent interface for adding validation features to migration workflows.
    /// </summary>
    public class MigrationValidationIntegration : INotifyPropertyChanged
    {
        private readonly PostMigrationValidationService _validationService;
        private readonly BaseViewModel _parentViewModel;
        
        private bool _isValidationEnabled = true;
        private bool _autoValidateAfterMigration = true;
        private bool _showValidationResults = false;
        private MigrationValidationViewModel? _validationViewModel;

        public event PropertyChangedEventHandler? PropertyChanged;

        #region Properties

        /// <summary>
        /// Whether validation is enabled for migrations.
        /// </summary>
        public bool IsValidationEnabled
        {
            get => _isValidationEnabled;
            set
            {
                _isValidationEnabled = value;
                OnPropertyChanged();
            }
        }

        /// <summary>
        /// Whether to automatically validate after migration completes.
        /// </summary>
        public bool AutoValidateAfterMigration
        {
            get => _autoValidateAfterMigration;
            set
            {
                _autoValidateAfterMigration = value;
                OnPropertyChanged();
            }
        }

        /// <summary>
        /// Whether validation results are currently being shown.
        /// </summary>
        public bool ShowValidationResults
        {
            get => _showValidationResults;
            set
            {
                _showValidationResults = value;
                OnPropertyChanged();
            }
        }

        /// <summary>
        /// The validation ViewModel for displaying results.
        /// </summary>
        public MigrationValidationViewModel? ValidationViewModel
        {
            get => _validationViewModel;
            private set
            {
                _validationViewModel = value;
                OnPropertyChanged();
            }
        }

        #endregion

        #region Commands

        public ICommand ShowValidationCommand { get; }
        public ICommand HideValidationCommand { get; }
        public ICommand ValidateNowCommand { get; }

        #endregion

        #region Constructor

        public MigrationValidationIntegration(PostMigrationValidationService validationService, BaseViewModel parentViewModel)
        {
            _validationService = validationService;
            _parentViewModel = parentViewModel;

            // Initialize commands
            ShowValidationCommand = new CommunityToolkit.Mvvm.Input.RelayCommand(ShowValidation);
            HideValidationCommand = new CommunityToolkit.Mvvm.Input.RelayCommand(HideValidation);
            ValidateNowCommand = new CommunityToolkit.Mvvm.Input.AsyncRelayCommand(ValidateNowAsync);
        }

        #endregion

        #region Public Methods

        /// <summary>
        /// Called after a migration completes to perform automatic validation if enabled.
        /// </summary>
        public async Task OnMigrationCompletedAsync(MigrationWave wave, TargetContext target, IList<MigrationResult> migrationResults)
        {
            if (!IsValidationEnabled || !AutoValidateAfterMigration)
                return;

            try
            {
                _parentViewModel.StatusMessage = "Starting post-migration validation...";

                // Initialize validation ViewModel if needed
                if (ValidationViewModel == null)
                {
                    ValidationViewModel = new MigrationValidationViewModel(_validationService);
                }

                // Load validation results
                await ValidationViewModel.LoadValidationResultsAsync(wave, target);

                // Auto-show validation results if there are errors
                var hasErrors = ValidationViewModel.Summary.HasErrors;
                if (hasErrors)
                {
                    ShowValidationResults = true;
                    _parentViewModel.StatusMessage = $"Migration validation completed with {ValidationViewModel.Summary.ErrorObjects + ValidationViewModel.Summary.CriticalObjects} errors";
                }
                else
                {
                    _parentViewModel.StatusMessage = "Migration validation completed successfully";
                }
            }
            catch (Exception ex)
            {
                _parentViewModel.StatusMessage = $"Validation failed: {ex.Message}";
            }
        }

        /// <summary>
        /// Called after individual object migration to add to validation queue.
        /// </summary>
        public async Task OnObjectMigratedAsync(object migratedObject, TargetContext target, MigrationResult migrationResult)
        {
            if (!IsValidationEnabled)
                return;

            try
            {
                // Initialize validation ViewModel if needed
                if (ValidationViewModel == null)
                {
                    ValidationViewModel = new MigrationValidationViewModel(_validationService);
                }

                // Validate the individual object
                ValidationResult validationResult = migratedObject switch
                {
                    UserDto user => await _validationService.ValidateUserAsync(user, target),
                    MailboxDto mailbox => await _validationService.ValidateMailboxAsync(mailbox, target),
                    FileItemDto file => await _validationService.ValidateFilesAsync(file, target),
                    DatabaseDto database => await _validationService.ValidateSqlAsync(database, target),
                    _ => throw new InvalidOperationException($"Unknown object type for validation: {migratedObject.GetType()}")
                };

                // Add to validation results
                ValidationViewModel.AddValidationResult(validationResult);

                // Show validation if there are errors
                if (validationResult.Severity == ValidationSeverity.Error || validationResult.Severity == ValidationSeverity.Critical)
                {
                    ShowValidationResults = true;
                }
            }
            catch (Exception ex)
            {
                _parentViewModel.StatusMessage = $"Object validation failed: {ex.Message}";
            }
        }

        /// <summary>
        /// Creates a validation-enabled migration service wrapper.
        /// TODO: Update this method to work with the new MigrationService constructor after T-034 integration
        /// </summary>
        public MigrationService CreateValidationEnabledMigrationService(MigrationService originalService)
        {
            // Temporarily disabled due to T-034 MigrationService constructor changes
            // This will be updated in a future iteration to work with the new audit-enabled constructor
            throw new NotImplementedException("This method needs to be updated for T-034 audit integration");
        }

        #endregion

        #region Private Methods

        private void ShowValidation()
        {
            ShowValidationResults = true;
            _parentViewModel.StatusMessage = "Showing validation results";
        }

        private void HideValidation()
        {
            ShowValidationResults = false;
            _parentViewModel.StatusMessage = "Validation results hidden";
        }

        private async Task ValidateNowAsync()
        {
            if (ValidationViewModel == null)
            {
                _parentViewModel.StatusMessage = "No migration data to validate";
                return;
            }

            try
            {
                _parentViewModel.StatusMessage = "Running validation...";
                ValidationViewModel.RefreshCommand.Execute(null);
                ShowValidationResults = true;
                _parentViewModel.StatusMessage = "Validation completed";
            }
            catch (Exception ex)
            {
                _parentViewModel.StatusMessage = $"Validation failed: {ex.Message}";
            }
        }

        private void OnPropertyChanged([System.Runtime.CompilerServices.CallerMemberName] string? propertyName = null)
        {
            PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(propertyName));
        }

        #endregion
    }

    /// <summary>
    /// Extension methods to add validation capabilities to existing migration ViewModels.
    /// </summary>
    public static class MigrationValidationExtensions
    {
        /// <summary>
        /// Adds validation integration to a migration ViewModel.
        /// </summary>
        public static void AddValidationSupport(this BaseViewModel viewModel, PostMigrationValidationService validationService)
        {
            var integration = new MigrationValidationIntegration(validationService, viewModel);
            
            // Store the integration as a property for access
            var integrationProperty = viewModel.GetType().GetProperty("ValidationIntegration");
            if (integrationProperty != null && integrationProperty.CanWrite)
            {
                integrationProperty.SetValue(viewModel, integration);
            }
        }

        /// <summary>
        /// Gets the validation integration from a ViewModel if it exists.
        /// </summary>
        public static MigrationValidationIntegration? GetValidationIntegration(this BaseViewModel viewModel)
        {
            var integrationProperty = viewModel.GetType().GetProperty("ValidationIntegration");
            return integrationProperty?.GetValue(viewModel) as MigrationValidationIntegration;
        }
    }
}