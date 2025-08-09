using System;
using System.Threading.Tasks;
using System.Windows.Input;
using MandADiscoverySuite.Models;
using MandADiscoverySuite.Services;

namespace MandADiscoverySuite.ViewModels
{
    public class CreateProfileDialogViewModel : BaseViewModel
    {
        private readonly CompanyProfile _originalProfile;
        private string _profileName = "";
        private bool _isEditMode;
        private bool _isValidationVisible;
        private string _validationMessage = "";
        private string _validationLevel = "Error"; // Error, Warning, Success

        public string ProfileName
        {
            get => _profileName;
            set => SetProperty(ref _profileName, value);
        }

        public bool IsEditMode
        {
            get => _isEditMode;
            set => SetProperty(ref _isEditMode, value);
        }

        public string DialogTitle => IsEditMode ? "Edit Company Profile" : "Create Company Profile";
        public string ActionButtonText => IsEditMode ? "Update" : "Create";

        public bool IsValidationVisible
        {
            get => _isValidationVisible;
            set => SetProperty(ref _isValidationVisible, value);
        }

        public string ValidationMessage
        {
            get => _validationMessage;
            set => SetProperty(ref _validationMessage, value);
        }

        public string ValidationLevel
        {
            get => _validationLevel;
            set => SetProperty(ref _validationLevel, value);
        }

        #region Commands

        public ICommand CreateCommand { get; private set; }
        public ICommand CancelCommand { get; private set; }

        #endregion

        public event EventHandler<CompanyProfile> ProfileCreated;
        public event EventHandler DialogClosed;

        public CreateProfileDialogViewModel(CompanyProfile existingProfile = null)
        {
            _originalProfile = existingProfile;
            IsEditMode = existingProfile != null;
            
            if (IsEditMode)
            {
                ProfileName = existingProfile.CompanyName;
            }

            InitializeCommands();
        }

        private void InitializeCommands()
        {
            CreateCommand = new AsyncRelayCommand(CreateProfileAsync, CanCreateProfile);
            CancelCommand = new RelayCommand(Cancel);
        }

        private bool CanCreateProfile()
        {
            return !string.IsNullOrWhiteSpace(ProfileName) && !IsLoading;
        }

        private async Task CreateProfileAsync()
        {
            try
            {
                IsLoading = true;
                LoadingMessage = IsEditMode ? "Updating profile..." : "Creating profile...";

                var validationResult = InputValidationService.Instance.ValidateCompanyName(ProfileName);
                if (!validationResult.IsValid)
                {
                    ErrorMessage = validationResult.GetSummaryMessage();
                    HasErrors = true;
                    return;
                }

                CompanyProfile profile;

                if (IsEditMode)
                {
                    // Update existing profile
                    profile = new CompanyProfile
                    {
                        CompanyName = ProfileName.Trim(),
                        Description = _originalProfile.Description,
                        DomainController = _originalProfile.DomainController,
                        TenantId = _originalProfile.TenantId,
                        IsActive = _originalProfile.IsActive,
                        Id = _originalProfile.Id,
                        Path = _originalProfile.Path,
                        Industry = _originalProfile.Industry,
                        IsHybrid = _originalProfile.IsHybrid
                    };

                    StatusMessage = $"Profile '{ProfileName}' updated successfully";
                }
                else
                {
                    // Create new profile
                    profile = new CompanyProfile
                    {
                        CompanyName = ProfileName.Trim(),
                        Description = "",
                        DomainController = "",
                        TenantId = "",
                        IsActive = true,
                        Path = System.IO.Path.Combine(@"C:\discoverydata", ProfileName.Trim()),
                        Industry = "",
                        IsHybrid = false
                    };

                    // Create directory structure
                    System.IO.Directory.CreateDirectory(profile.Path);

                    StatusMessage = $"Profile '{ProfileName}' created successfully";
                }

                // Simulate some processing time
                await Task.Delay(500);

                ProfileCreated?.Invoke(this, profile);
            }
            catch (Exception ex)
            {
                ErrorMessage = $"Failed to {(IsEditMode ? "update" : "create")} profile: {ex.Message}";
                HasErrors = true;
            }
            finally
            {
                IsLoading = false;
                LoadingMessage = "Ready";
            }
        }

        private void Cancel()
        {
            DialogClosed?.Invoke(this, EventArgs.Empty);
        }

        public void ValidateProfileName()
        {
            try
            {
                var validationResult = InputValidationService.Instance.ValidateCompanyName(ProfileName);
                
                if (!validationResult.IsValid)
                {
                    ShowValidationError(validationResult.GetSummaryMessage());
                }
                else
                {
                    ShowValidationSuccess("Valid company name");
                }
            }
            catch (Exception ex)
            {
                ShowValidationError($"Validation error: {ex.Message}");
            }
        }

        private void ShowValidationError(string message)
        {
            ValidationMessage = $"❌ {message}";
            ValidationLevel = "Error";
            IsValidationVisible = true;
        }

        private void ShowValidationWarning(string message)
        {
            ValidationMessage = $"⚠️ {message}";
            ValidationLevel = "Warning"; 
            IsValidationVisible = true;
        }

        private void ShowValidationSuccess(string message)
        {
            ValidationMessage = $"✅ {message}";
            ValidationLevel = "Success";
            IsValidationVisible = true;
        }
    }
}