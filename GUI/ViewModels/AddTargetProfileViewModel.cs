#nullable enable

using System;
using System.ComponentModel;
using System.IO;
using System.Runtime.CompilerServices;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using System.Windows.Input;
using CommunityToolkit.Mvvm.Input;
using MandADiscoverySuite.Models;
using MandADiscoverySuite.Services;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Logging.Debug;

namespace MandADiscoverySuite.ViewModels
{
    /// <summary>
    /// ViewModel for adding new target profiles through app registration
    /// </summary>
    public class AddTargetProfileViewModel : INotifyPropertyChanged
    {
        private readonly ILogger<AddTargetProfileViewModel>? _logger;
        private string _companyName = string.Empty;
        private string _validationMessage = string.Empty;
        private string _statusMessage = string.Empty;
        private string _progressDetails = string.Empty;
        private bool _isBusy = false;
        private bool _showProgress = false;
        private bool _showProgressDetails = false;
        private bool _canCreateProfile = false;

        public event PropertyChangedEventHandler? PropertyChanged;

        public string CompanyName
        {
            get => _companyName;
            set
            {
                if (SetProperty(ref _companyName, value))
                {
                    ValidateCompanyName();
                }
            }
        }

        public string ValidationMessage
        {
            get => _validationMessage;
            set => SetProperty(ref _validationMessage, value);
        }

        public bool HasValidationMessage => !string.IsNullOrWhiteSpace(ValidationMessage);

        public string StatusMessage
        {
            get => _statusMessage;
            set => SetProperty(ref _statusMessage, value);
        }

        public string ProgressDetails
        {
            get => _progressDetails;
            set => SetProperty(ref _progressDetails, value);
        }

        public bool IsBusy
        {
            get => _isBusy;
            set => SetProperty(ref _isBusy, value);
        }

        public bool IsNotBusy => !IsBusy;

        public bool ShowProgress
        {
            get => _showProgress;
            set => SetProperty(ref _showProgress, value);
        }

        public bool ShowProgressDetails
        {
            get => _showProgressDetails;
            set => SetProperty(ref _showProgressDetails, value);
        }

        public bool CanCreateProfile
        {
            get => _canCreateProfile;
            set => SetProperty(ref _canCreateProfile, value);
        }

        public ICommand CreateProfileCommand { get; }
        public ICommand CancelCommand { get; }

        public TargetProfile? CreatedProfile { get; private set; }
        public bool DialogResult { get; private set; }

        public AddTargetProfileViewModel()
        {
            try
            {
                var loggerFactory = LoggerFactory.Create(builder => builder.AddDebug());
                _logger = loggerFactory.CreateLogger<AddTargetProfileViewModel>();
            }
            catch
            {
                // Continue without logging if service unavailable
            }

            CreateProfileCommand = new AsyncRelayCommand(CreateProfileAsync, () => CanCreateProfile && !IsBusy);
            CancelCommand = new RelayCommand(Cancel);
        }

        private void ValidateCompanyName()
        {
            ValidationMessage = string.Empty;
            CanCreateProfile = false;

            if (string.IsNullOrWhiteSpace(CompanyName))
            {
                ValidationMessage = "Company name is required";
                return;
            }

            // Validate company name format - allow letters, numbers, spaces, hyphens, underscores
            if (!Regex.IsMatch(CompanyName.Trim(), @"^[a-zA-Z0-9\s\-_]+$"))
            {
                ValidationMessage = "Company name can only contain letters, numbers, spaces, hyphens, and underscores";
                return;
            }

            if (CompanyName.Trim().Length < 2)
            {
                ValidationMessage = "Company name must be at least 2 characters long";
                return;
            }

            if (CompanyName.Trim().Length > 50)
            {
                ValidationMessage = "Company name must be 50 characters or less";
                return;
            }

            CanCreateProfile = true;
        }

        private async Task CreateProfileAsync()
        {
            if (IsBusy || !CanCreateProfile)
                return;

            IsBusy = true;
            ShowProgress = true;
            StatusMessage = "Initializing app registration process...";
            ProgressDetails = string.Empty;
            ShowProgressDetails = false;

            try
            {
                _logger?.LogInformation($"Starting app registration for target company: {CompanyName}");

                // Step 1: Execute the PowerShell script
                StatusMessage = "Creating Azure AD app registration...";
                ShowProgressDetails = true;

                var scriptPath = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "Scripts", "DiscoveryCreateTargetAppRegistration.ps1");
                if (!File.Exists(scriptPath))
                {
                    throw new FileNotFoundException($"App registration script not found: {scriptPath}");
                }

                var ps = new PowerShellExecutionService();
                
                // Build the PowerShell command
                var command = $"& '{scriptPath}' -CompanyName '{CompanyName.Trim().Replace("'", "''")}' -AutoInstallModules";

                ProgressDetails = $"Executing: {command}\n\n";

                // Subscribe to progress events for real-time updates
                ps.ProgressReported += (sender, args) =>
                {
                    if (!string.IsNullOrWhiteSpace(args.StatusDescription))
                    {
                        ProgressDetails += $"{DateTime.Now:HH:mm:ss} {args.StatusDescription}\n";
                    }
                };

                ps.OutputReceived += (sender, args) =>
                {
                    if (!string.IsNullOrWhiteSpace(args.Output))
                    {
                        ProgressDetails += $"{DateTime.Now:HH:mm:ss} {args.Output}\n";
                    }
                };

                ps.ErrorOccurred += (sender, args) =>
                {
                    if (!string.IsNullOrWhiteSpace(args.Error))
                    {
                        ProgressDetails += $"{DateTime.Now:HH:mm:ss} ERROR: {args.Error}\n";
                    }
                };

                // Execute the script
                var result = await ps.ExecuteScriptAsync(command);

                if (!result.IsSuccess)
                {
                    throw new InvalidOperationException($"App registration failed: {result.ErrorMessage}");
                }

                // Step 2: Find and load the created credentials
                StatusMessage = "Loading created credentials...";
                
                var credentialsPath = Path.Combine($"C:\\discoverydata\\{CompanyName.Trim()}\\Credentials");
                var profile = await TargetProfile.FromAppRegistrationAsync(CompanyName.Trim(), credentialsPath);

                if (profile == null)
                {
                    throw new InvalidOperationException("App registration completed but credentials could not be loaded. Please check the output for errors.");
                }

                // Step 3: Success
                StatusMessage = "Target profile created successfully!";
                ProgressDetails += $"\n{DateTime.Now:HH:mm:ss} Target profile created successfully!\n";
                ProgressDetails += $"{DateTime.Now:HH:mm:ss} Company: {profile.Name}\n";
                ProgressDetails += $"{DateTime.Now:HH:mm:ss} Tenant ID: {profile.TenantId}\n";
                ProgressDetails += $"{DateTime.Now:HH:mm:ss} Client ID: {profile.ClientId}\n";
                
                CreatedProfile = profile;
                DialogResult = true;

                _logger?.LogInformation($"Successfully created target profile for {CompanyName}");

                // Auto-close after a brief delay to show success
                await Task.Delay(2000);
                
                // The dialog will be closed by the calling code checking DialogResult
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, $"Failed to create target profile for {CompanyName}");
                
                StatusMessage = "Error creating target profile";
                ProgressDetails += $"\n{DateTime.Now:HH:mm:ss} ERROR: {ex.Message}\n";
                
                if (ex.InnerException != null)
                {
                    ProgressDetails += $"{DateTime.Now:HH:mm:ss} Inner Exception: {ex.InnerException.Message}\n";
                }

                DialogResult = false;
            }
            finally
            {
                IsBusy = false;
            }
        }

        private void Cancel()
        {
            if (IsBusy)
                return;

            DialogResult = false;
        }

        protected virtual void OnPropertyChanged([CallerMemberName] string? propertyName = null)
        {
            PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(propertyName));
            
            // Update dependent properties
            if (propertyName == nameof(ValidationMessage))
            {
                OnPropertyChanged(nameof(HasValidationMessage));
            }
            else if (propertyName == nameof(IsBusy))
            {
                OnPropertyChanged(nameof(IsNotBusy));
                ((AsyncRelayCommand)CreateProfileCommand).NotifyCanExecuteChanged();
            }
        }

        protected bool SetProperty<T>(ref T field, T value, [CallerMemberName] string? propertyName = null)
        {
            if (Equals(field, value))
                return false;

            field = value;
            OnPropertyChanged(propertyName);
            return true;
        }
    }
}