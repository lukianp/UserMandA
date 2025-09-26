using System;
using System.Collections.ObjectModel;
using System.Linq;
using System.Threading.Tasks;
using System.Windows.Input;
using Microsoft.Extensions.Logging;
using MandADiscoverySuite.Services;
using CommunityToolkit.Mvvm.Input;

namespace MandADiscoverySuite.ViewModels
{
    /// <summary>
    /// ViewModel for empty state validation GUI integration
    /// </summary>
    public class EmptyStateValidationViewModel : BaseViewModel
    {
        private readonly IEmptyStateValidationService _validationService;
        private readonly ILogger<EmptyStateValidationViewModel> _logger;

        public EmptyStateValidationViewModel(
            IEmptyStateValidationService validationService,
            ILogger<EmptyStateValidationViewModel> logger)
        {
            _validationService = validationService ?? throw new ArgumentNullException(nameof(validationService));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));

            // Initialize commands
            InitializeCommands();
        }

        private new void InitializeCommands()
        {
            RunValidationCommand = new AsyncRelayCommand(RunValidationAsync);
            ClearResultsCommand = new RelayCommand(ClearResults);
        }

        #region Properties

        private bool _isValidating;
        public bool IsValidating
        {
            get => _isValidating;
            set => SetProperty(ref _isValidating, value);
        }

        private string _validationStatus = "Ready to validate";
        public string ValidationStatus
        {
            get => _validationStatus;
            set => SetProperty(ref _validationStatus, value);
        }

        private ObservableCollection<ValidationResultItem> _validationResults = new();
        public ObservableCollection<ValidationResultItem> ValidationResults
        {
            get => _validationResults;
            set => SetProperty(ref _validationResults, value);
        }

        private TimeSpan _lastValidationTime;
        public TimeSpan LastValidationTime
        {
            get => _lastValidationTime;
            set => SetProperty(ref _lastValidationTime, value);
        }

        private int _totalTests;
        public int TotalTests
        {
            get => _totalTests;
            set => SetProperty(ref _totalTests, value);
        }

        private int _passedTests;
        public int PassedTests
        {
            get => _passedTests;
            set => SetProperty(ref _passedTests, value);
        }

        private int _failedTests;
        public int FailedTests
        {
            get => _failedTests;
            set => SetProperty(ref _failedTests, value);
        }

        #endregion

        #region Commands

        public ICommand RunValidationCommand { get; private set; }
        public ICommand ClearResultsCommand { get; private set; }

        #endregion

        #region Methods

        private async Task RunValidationAsync()
        {
            if (IsValidating)
                return;

            try
            {
                IsValidating = true;
                ValidationStatus = "Running empty state validation...";
                ValidationResults.Clear();

                _logger.LogInformation("Starting empty state validation from GUI");

                var result = await _validationService.ValidateAllEmptyStatesAsync();

                LastValidationTime = result.TotalValidationTime;
                TotalTests = result.TotalViewModels;
                PassedTests = result.SuccessfulValidations;
                FailedTests = result.FailedValidations;

                // Update status
                if (result.OverallSuccess)
                {
                    ValidationStatus = $"✅ Validation completed successfully in {result.TotalValidationTime.TotalSeconds:F2}s";
                }
                else
                {
                    ValidationStatus = $"❌ Validation completed with {result.FailedValidations} failures in {result.TotalValidationTime.TotalSeconds:F2}s";
                }

                // Add results to collection
                foreach (var vmResult in result.ViewModelResults)
                {
                    ValidationResults.Add(new ValidationResultItem
                    {
                        ViewModelName = vmResult.ViewModelName,
                        IsSuccessful = vmResult.IsSuccessful,
                        ValidationTime = vmResult.ValidationTime,
                        Issues = string.Join("; ", vmResult.Issues),
                        IssuesCount = vmResult.Issues.Count
                    });
                }

                _logger.LogInformation(
                    "Empty state validation completed. Success: {Success}/{Total} in {Time}",
                    result.SuccessfulValidations,
                    result.TotalViewModels,
                    result.TotalValidationTime);

                if (!result.OverallSuccess)
                {
                    _logger.LogWarning("Some empty state validations failed");
                }
            }
            catch (Exception ex)
            {
                ValidationStatus = $"❌ Validation failed: {ex.Message}";
                _logger.LogError(ex, "Empty state validation failed");
            }
            finally
            {
                IsValidating = false;
            }
        }

        private void ClearResults()
        {
            ValidationResults.Clear();
            ValidationStatus = "Results cleared";
            LastValidationTime = TimeSpan.Zero;
            TotalTests = 0;
            PassedTests = 0;
            FailedTests = 0;

            _logger.LogDebug("Validation results cleared");
        }

        #endregion
    }

    #region Supporting Classes

    public class ValidationResultItem
    {
        public string ViewModelName { get; set; } = string.Empty;
        public bool IsSuccessful { get; set; }
        public TimeSpan ValidationTime { get; set; }
        public string Issues { get; set; } = string.Empty;
        public int IssuesCount { get; set; }
        public string StatusIcon => IsSuccessful ? "✅" : "❌";
        public string StatusText => IsSuccessful ? "PASS" : "FAIL";
    }

    #endregion
}