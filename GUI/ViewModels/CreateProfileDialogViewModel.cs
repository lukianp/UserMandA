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

        protected override void InitializeCommands()
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

                // Sanitize input first
                var sanitizedName = DataSanitizationService.Instance.SanitizeFileName(ProfileName);
                
                var validationResult = InputValidationService.Instance.ValidateCompanyName(sanitizedName);
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
                        CompanyName = sanitizedName,
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
                    // Check if company already exists
                    var companyDataPath = System.IO.Path.Combine(GetDiscoveryDataRootPath(), sanitizedName);
                    
                    if (System.IO.Directory.Exists(companyDataPath))
                    {
                        // Company directory already exists - show that it exists and prompt user
                        ShowValidationWarning($"Company '{sanitizedName}' already exists. Select it from the profile list instead.");
                        ErrorMessage = $"Company profile for '{sanitizedName}' already exists in the discovery data directory.";
                        HasErrors = true;
                        return;
                    }

                    // Create new profile
                    profile = new CompanyProfile
                    {
                        CompanyName = sanitizedName,
                        Description = "",
                        DomainController = "",
                        TenantId = "",
                        IsActive = true,
                        Path = companyDataPath,
                        Industry = "",
                        IsHybrid = false
                    };

                    // Create full directory structure like ljpops
                    await CreateCompanyDirectoryStructure(profile.Path, sanitizedName);

                    StatusMessage = $"Profile '{sanitizedName}' created successfully with full directory structure";
                }

                // Simulate some processing time
                await Task.Delay(500);

                ProfileCreated?.Invoke(this, profile);
            }
            catch (Exception ex)
            {
                var errorMessage = ErrorHandlingService.Instance.HandleException(ex, 
                    $"{(IsEditMode ? "Updating" : "Creating")} profile '{ProfileName}'");
                ErrorMessage = errorMessage;
                HasErrors = true;
            }
            finally
            {
                IsLoading = false;
                LoadingMessage = "Ready";
            }
        }

        /// <summary>
        /// Gets the root path for discovery data, with fallback to default location
        /// </summary>
        private string GetDiscoveryDataRootPath()
        {
            try
            {
                // Try to get from configuration service
                var configService = SimpleServiceLocator.Instance.GetService<ConfigurationService>();
                if (configService != null)
                {
                    return configService.DiscoveryDataRootPath;
                }
            }
            catch (Exception ex)
            {
                ErrorHandlingService.Instance.LogWarning($"Could not get discovery data path from configuration: {ex.Message}");
            }

            // Fallback to default location
            return ConfigurationService.Instance.DiscoveryDataRootPath;
        }

        /// <summary>
        /// Creates the complete directory structure for a new company profile
        /// </summary>
        private async Task CreateCompanyDirectoryStructure(string companyPath, string companyName)
        {
            try
            {
                // Create main company directory
                System.IO.Directory.CreateDirectory(companyPath);

                // Create subdirectories following ljpops structure
                var directories = new[]
                {
                    "Archives",
                    "Backups", 
                    "Credentials",
                    "Credentials\\Backups",
                    "Discovery",
                    "Exports",
                    "Logs",
                    "Logs\\Application",
                    "Logs\\Audit",
                    "Logs\\Security",
                    "Raw",
                    "Reports",
                    "Temp"
                };

                foreach (var dir in directories)
                {
                    var fullPath = System.IO.Path.Combine(companyPath, dir);
                    System.IO.Directory.CreateDirectory(fullPath);
                }

                // Create README.txt file
                var readmeContent = $@"M&A Discovery Suite - Company Data Directory
Company: {companyName}
Created: {DateTime.Now:yyyy-MM-dd HH:mm:ss}

This directory contains discovery OUTPUT data for {companyName}:

- Reports\     : Generated reports and analysis documents
- Exports\     : Exported discovery data (CSV, JSON, XML files)
- Logs\        : Discovery operation logs and troubleshooting data
- Archives\    : Historical discovery data snapshots
- Temp\        : Temporary files during discovery processing
- Raw\         : Raw CSV discovery output data
- Credentials\ : Company-specific authentication credentials

NOTE: Discovery PowerShell modules (.psm1) are loaded from the application
build directory (C:\enterprisediscovery\Scripts\), NOT from this data directory.
This directory is strictly for storing discovery results and company data.
";

                var readmePath = System.IO.Path.Combine(companyPath, "README.txt");
                await System.IO.File.WriteAllTextAsync(readmePath, readmeContent);

                // Create placeholder credentials file structure
                var credentialsPath = System.IO.Path.Combine(companyPath, "Credentials", "discoverycredentials.config");
                var credentialsTemplate = @"{
    ""TenantId"": """",
    ""ApplicationObjectId"": """",
    ""ExpiryDate"": """",
    ""PermissionCount"": 0,
    ""SecretKeyId"": """",
    ""CreatedDate"": """ + DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss") + @""",
    ""ScriptVersion"": ""4.0.0"",
    ""ValidityYears"": 2,
    ""AzureRoles"": ""Reader"",
    ""AzureSubscriptionCount"": 0,
    ""DaysUntilExpiry"": 0,
    ""ApplicationName"": ""MandADiscovery"",
    ""AzureADRoles"": [],
    ""ClientSecret"": """",
    ""ComputerName"": """ + Environment.MachineName + @""",
    ""Domain"": """ + Environment.MachineName + @""",
    ""PowerShellVersion"": ""5.1"",
    ""ClientId"": """",
    ""CreatedBy"": """ + Environment.UserName + @""",
    ""CreatedOnComputer"": """ + Environment.MachineName + @""",
    ""RoleAssignmentSuccess"": false
}";

                await System.IO.File.WriteAllTextAsync(credentialsPath, credentialsTemplate);

                StatusMessage = $"Created complete directory structure for '{companyName}' at {companyPath}";
            }
            catch (Exception ex)
            {
                throw new Exception($"Failed to create directory structure for '{companyName}': {ex.Message}", ex);
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
                if (string.IsNullOrWhiteSpace(ProfileName))
                {
                    ShowValidationError("Company name is required");
                    return;
                }

                var sanitizedName = DataSanitizationService.Instance.SanitizeFileName(ProfileName.Trim());
                var validationResult = InputValidationService.Instance.ValidateCompanyName(sanitizedName);
                
                if (!validationResult.IsValid)
                {
                    ShowValidationError(validationResult.GetSummaryMessage());
                    return;
                }

                // Check if company directory already exists
                var companyDataPath = System.IO.Path.Combine(GetDiscoveryDataRootPath(), sanitizedName);
                if (System.IO.Directory.Exists(companyDataPath))
                {
                    ShowValidationWarning($"Company '{sanitizedName}' already exists. Select from profile list instead.");
                    return;
                }

                ShowValidationSuccess("Valid company name - ready to create");
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