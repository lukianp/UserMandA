using System;
using System.Collections.ObjectModel;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using System.Windows.Input;
using MandADiscoverySuite.Services;

namespace MandADiscoverySuite.ViewModels
{
    public class CompanyProfileSelectionViewModel : BaseViewModel
    {
        private string _selectedProfileName = "";
        private string _newProfileName = "";
        private bool _isNewProfile = false;
        private ObservableCollection<string> _existingProfiles = new ObservableCollection<string>();
        private bool _isValidationVisible = false;
        private string _validationMessage = "";
        private string _validationLevel = "Info";

        public string SelectedProfileName
        {
            get => _selectedProfileName;
            set => SetProperty(ref _selectedProfileName, value);
        }

        public string NewProfileName
        {
            get => _newProfileName;
            set 
            { 
                SetProperty(ref _newProfileName, value);
                ValidateProfileName();
            }
        }

        public bool IsNewProfile
        {
            get => _isNewProfile;
            set => SetProperty(ref _isNewProfile, value);
        }

        public ObservableCollection<string> ExistingProfiles
        {
            get => _existingProfiles;
            set => SetProperty(ref _existingProfiles, value);
        }

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

        public string FinalProfileName => IsNewProfile ? NewProfileName : SelectedProfileName;

        public ICommand SelectCommand { get; private set; }
        public ICommand CancelCommand { get; private set; }

        public event EventHandler<string> ProfileSelected;
        public event EventHandler DialogClosed;

        public CompanyProfileSelectionViewModel()
        {
            InitializeCommands();
            LoadExistingProfiles();
        }

        protected override void InitializeCommands()
        {
            SelectCommand = new AsyncRelayCommand(SelectProfileAsync, CanSelectProfile);
            CancelCommand = new RelayCommand(Cancel);
        }

        private bool CanSelectProfile()
        {
            if (IsNewProfile)
                return !string.IsNullOrWhiteSpace(NewProfileName) && !IsLoading;
            else
                return !string.IsNullOrWhiteSpace(SelectedProfileName) && !IsLoading;
        }

        private async Task SelectProfileAsync()
        {
            try
            {
                IsLoading = true;
                LoadingMessage = IsNewProfile ? "Creating profile..." : "Selecting profile...";

                var profileName = FinalProfileName.Trim();

                if (IsNewProfile)
                {
                    // Validate the new profile name
                    var validationResult = InputValidationService.Instance.ValidateCompanyName(profileName);
                    if (!validationResult.IsValid)
                    {
                        ErrorMessage = validationResult.GetSummaryMessage();
                        HasErrors = true;
                        return;
                    }

                    // Check if profile already exists
                    if (ExistingProfiles.Any(p => string.Equals(p, profileName, StringComparison.OrdinalIgnoreCase)))
                    {
                        ErrorMessage = $"A profile named '{profileName}' already exists. Please choose a different name.";
                        HasErrors = true;
                        return;
                    }

                    // Create the new profile using PowerShell
                    await CreateNewProfileAsync(profileName);
                }

                // Simulate some processing time
                await Task.Delay(300);

                StatusMessage = $"Selected profile: {profileName}";
                ProfileSelected?.Invoke(this, profileName);
            }
            catch (Exception ex)
            {
                var errorMessage = ErrorHandlingService.Instance.HandleException(ex, 
                    $"{(IsNewProfile ? "Creating" : "Selecting")} profile '{FinalProfileName}'");
                ErrorMessage = errorMessage;
                HasErrors = true;
            }
            finally
            {
                IsLoading = false;
                LoadingMessage = "Ready";
            }
        }

        private async Task CreateNewProfileAsync(string profileName)
        {
            try
            {
                // Use PowerShell to create the profile with proper structure
                var scriptPath = Path.Combine(ConfigurationService.Instance.ScriptsPath, "CreateCompanyProfile.ps1");
                
                if (!System.IO.File.Exists(scriptPath))
                {
                    // Create a simple PowerShell script to create the profile
                    var createScript = $@"
param([string]$CompanyName)

$profilePath = ""C:\DiscoveryData\$CompanyName""

if (Test-Path $profilePath) {{
    Write-Host ""Profile already exists: $profilePath"" -ForegroundColor Yellow
    exit 0
}}

Write-Host ""Creating company profile: $CompanyName"" -ForegroundColor Green

# Create directory structure
$directories = @(
    ""Archives"",
    ""Backups"", 
    ""Credentials"",
    ""Credentials\Backups"",
    ""Discovery"",
    ""Exports"",
    ""Logs"",
    ""Logs\Application"",
    ""Logs\Audit"", 
    ""Logs\Security"",
    ""Raw"",
    ""Reports"",
    ""Temp""
)

foreach ($dir in $directories) {{
    $dirPath = Join-Path $profilePath $dir
    if (!(Test-Path $dirPath)) {{
        New-Item -ItemType Directory -Path $dirPath -Force | Out-Null
        Write-Host ""Created: $dirPath"" -ForegroundColor Gray
    }}
}}

# Create README file
$readmePath = Join-Path $profilePath ""README.txt""
@""
M&A Discovery Profile: $CompanyName
Created: $(Get-Date)
Creator: $env:USERNAME

This directory contains discovery data for $CompanyName.

Directory Structure:
- Archives: Archived discovery data
- Backups: Backup files
- Credentials: Authentication credentials (secure)
- Discovery: Raw discovery output
- Exports: Exported reports and data
- Logs: Application and discovery logs  
- Raw: Processed CSV data files
- Reports: Generated reports
- Temp: Temporary working files

To configure credentials, edit the files in the Credentials directory.
""@ | Set-Content -Path $readmePath -Encoding UTF8

Write-Host ""Company profile created successfully at: $profilePath"" -ForegroundColor Green
";

                    var scriptsDir = ConfigurationService.Instance.ScriptsPath;
                    if (!System.IO.Directory.Exists(scriptsDir))
                        System.IO.Directory.CreateDirectory(scriptsDir);

                    await System.IO.File.WriteAllTextAsync(scriptPath, createScript);
                }

                // Execute the PowerShell script
                var startInfo = new System.Diagnostics.ProcessStartInfo
                {
                    FileName = "powershell.exe",
                    Arguments = $"-NoProfile -ExecutionPolicy Bypass -File \"{scriptPath}\" -CompanyName \"{profileName}\"",
                    UseShellExecute = false,
                    RedirectStandardOutput = true,
                    RedirectStandardError = true,
                    CreateNoWindow = true
                };

                using var process = new System.Diagnostics.Process { StartInfo = startInfo };
                process.Start();
                
                var output = await process.StandardOutput.ReadToEndAsync();
                var error = await process.StandardError.ReadToEndAsync();
                
                await process.WaitForExitAsync();

                if (process.ExitCode != 0)
                {
                    throw new Exception($"Failed to create profile: {error}");
                }

                // Refresh the existing profiles list
                LoadExistingProfiles();
            }
            catch (Exception ex)
            {
                throw new Exception($"Failed to create company profile: {ex.Message}", ex);
            }
        }

        private void LoadExistingProfiles()
        {
            try
            {
                ExistingProfiles.Clear();

                var discoveryDataPath = ConfigurationService.Instance.DiscoveryDataRootPath;
                if (!System.IO.Directory.Exists(discoveryDataPath))
                {
                    ShowValidationInfo("No existing profiles found. Create a new profile to get started.");
                    return;
                }

                var directories = System.IO.Directory.GetDirectories(discoveryDataPath)
                    .Select(d => System.IO.Path.GetFileName(d))
                    .Where(name => !string.IsNullOrEmpty(name))
                    .Where(name => IsValidCompanyProfile(System.IO.Path.Combine(discoveryDataPath, name)))
                    .OrderBy(name => name);

                foreach (var profile in directories)
                {
                    ExistingProfiles.Add(profile);
                }

                if (ExistingProfiles.Count > 0)
                {
                    SelectedProfileName = ExistingProfiles.First();
                    ShowValidationSuccess($"Found {ExistingProfiles.Count} existing profile(s)");
                }
                else
                {
                    ShowValidationInfo("No existing profiles found. Create a new profile to get started.");
                }
            }
            catch (Exception ex)
            {
                ShowValidationError($"Error loading profiles: {ex.Message}");
            }
        }

        private bool IsValidCompanyProfile(string profilePath)
        {
            // Check for expected directory structure
            return System.IO.Directory.Exists(System.IO.Path.Combine(profilePath, "Raw")) ||
                   System.IO.Directory.Exists(System.IO.Path.Combine(profilePath, "Credentials")) ||
                   System.IO.Directory.Exists(System.IO.Path.Combine(profilePath, "Logs"));
        }

        private void ValidateProfileName()
        {
            if (string.IsNullOrWhiteSpace(NewProfileName))
            {
                IsValidationVisible = false;
                return;
            }

            try
            {
                var validationResult = InputValidationService.Instance.ValidateCompanyName(NewProfileName);
                
                if (!validationResult.IsValid)
                {
                    ShowValidationError(validationResult.GetSummaryMessage());
                }
                else if (ExistingProfiles.Any(p => string.Equals(p, NewProfileName.Trim(), StringComparison.OrdinalIgnoreCase)))
                {
                    ShowValidationError("A profile with this name already exists");
                }
                else
                {
                    ShowValidationSuccess("Valid profile name");
                }
            }
            catch (Exception ex)
            {
                ShowValidationError($"Validation error: {ex.Message}");
            }
        }

        private void ShowValidationError(string message)
        {
            ValidationMessage = message;
            ValidationLevel = "Error";
            IsValidationVisible = true;
        }

        private void ShowValidationSuccess(string message)
        {
            ValidationMessage = message;
            ValidationLevel = "Success";
            IsValidationVisible = true;
        }

        private void ShowValidationInfo(string message)
        {
            ValidationMessage = message;
            ValidationLevel = "Info";
            IsValidationVisible = true;
        }

        private void Cancel()
        {
            DialogClosed?.Invoke(this, EventArgs.Empty);
        }
    }
}