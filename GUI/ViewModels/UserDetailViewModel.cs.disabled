using System;
using System.Collections.ObjectModel;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Windows.Input;
using System.Windows;
using System.IO;
using Microsoft.Win32;
using MandADiscoverySuite.Models;
using MandADiscoverySuite.Services;

namespace MandADiscoverySuite.ViewModels
{
    public class UserDetailViewModel : BaseViewModel
    {
        private readonly string _rawDataPath;
        private UserDetailData _userData;
        private readonly CsvDataService _csvDataService;
        private readonly UserData _user;
        
        public UserDetailViewModel(dynamic selectedUser, string rawDataPath)
        {
            if (selectedUser == null)
                throw new ArgumentNullException(nameof(selectedUser));
            if (string.IsNullOrWhiteSpace(rawDataPath))
                throw new ArgumentException("Raw data path cannot be null or empty", nameof(rawDataPath));

            _rawDataPath = rawDataPath;
            GroupMemberships = new ObservableCollection<GroupMembership>();
            ApplicationAssignments = new ObservableCollection<ApplicationAssignment>();
            DeviceRelationships = new ObservableCollection<DeviceRelationship>();
            DirectoryRoles = new ObservableCollection<DirectoryRole>();
            LicenseAssignments = new ObservableCollection<LicenseAssignment>();
            Assets = new ObservableCollection<AssetData>();
            
            CloseCommand = new RelayCommand(() => CloseRequested?.Invoke());
            ExportProfileCommand = new RelayCommand(ExportProfile);
            
            LoadUserData(selectedUser);
        }
        
        // New constructor that accepts UserData and CsvDataService for enhanced functionality
        public UserDetailViewModel(UserData user, CsvDataService csvDataService)
        {
            if (user == null)
                throw new ArgumentNullException(nameof(user));
            
            _csvDataService = csvDataService ?? throw new ArgumentNullException(nameof(csvDataService));
            _user = user;
            
            TabTitle = $"User Details - {user.DisplayName}";
            
            GroupMemberships = new ObservableCollection<GroupMembership>();
            ApplicationAssignments = new ObservableCollection<ApplicationAssignment>();
            DeviceRelationships = new ObservableCollection<DeviceRelationship>();
            DirectoryRoles = new ObservableCollection<DirectoryRole>();
            LicenseAssignments = new ObservableCollection<LicenseAssignment>();
            Assets = new ObservableCollection<AssetData>();
            
            // Initialize additional collections for enhanced functionality
            SecurityGroups = new ObservableCollection<GroupData>();
            Applications = new ObservableCollection<ApplicationData>();
            InfrastructureAssets = new ObservableCollection<InfrastructureData>();
            Policies = new ObservableCollection<PolicyData>();
            
            CloseCommand = new RelayCommand(() => CloseRequested?.Invoke());
            ExportProfileCommand = new RelayCommand(ExportProfile);
            RefreshDataCommand = new AsyncRelayCommand(LoadRelatedDataAsync);
            
            // Set user properties
            DisplayName = user.DisplayName;
            UserPrincipalName = user.UserPrincipalName;
            Email = user.Email ?? user.Mail;
            JobTitle = user.Title;
            Department = user.Department;
            Manager = user.ManagerDisplayName;
            Location = user.City;
            AccountEnabled = user.AccountEnabled ? "Enabled" : "Disabled";
            CreatedDate = user.CreatedDate?.ToString("yyyy-MM-dd") ?? "N/A";
            LastSignIn = user.LastSignInDateTime ?? "Never";
            
            // Load related data asynchronously
            _ = LoadRelatedDataAsync();
        }
        
        public event Action CloseRequested;
        
        public ObservableCollection<GroupMembership> GroupMemberships { get; }
        public ObservableCollection<ApplicationAssignment> ApplicationAssignments { get; }
        public ObservableCollection<DeviceRelationship> DeviceRelationships { get; }
        public ObservableCollection<DirectoryRole> DirectoryRoles { get; }
        public ObservableCollection<LicenseAssignment> LicenseAssignments { get; }
        public ObservableCollection<AssetData> Assets { get; }
        
        // Enhanced collections for the new constructor
        public ObservableCollection<GroupData> SecurityGroups { get; private set; }
        public ObservableCollection<ApplicationData> Applications { get; private set; }
        public ObservableCollection<InfrastructureData> InfrastructureAssets { get; private set; }
        public ObservableCollection<PolicyData> Policies { get; private set; }
        
        public ICommand CloseCommand { get; }
        public ICommand ExportProfileCommand { get; }
        public ICommand RefreshDataCommand { get; private set; }
        
        private string _displayName;
        public string DisplayName
        {
            get => _displayName;
            set => SetProperty(ref _displayName, value);
        }
        
        private string _userPrincipalName;
        public string UserPrincipalName
        {
            get => _userPrincipalName;
            set => SetProperty(ref _userPrincipalName, value);
        }
        
        private string _email;
        public string Email
        {
            get => _email;
            set => SetProperty(ref _email, value);
        }
        
        private string _jobTitle;
        public string JobTitle
        {
            get => _jobTitle;
            set => SetProperty(ref _jobTitle, value);
        }
        
        private string _department;
        public string Department
        {
            get => _department;
            set => SetProperty(ref _department, value);
        }
        
        private string _manager;
        public string Manager
        {
            get => _manager;
            set => SetProperty(ref _manager, value);
        }
        
        private string _location;
        public string Location
        {
            get => _location;
            set => SetProperty(ref _location, value);
        }
        
        private string _accountEnabled;
        public string AccountEnabled
        {
            get => _accountEnabled;
            set => SetProperty(ref _accountEnabled, value);
        }
        
        private string _createdDate;
        public string CreatedDate
        {
            get => _createdDate;
            set => SetProperty(ref _createdDate, value);
        }
        
        private string _lastSignIn;
        public string LastSignIn
        {
            get => _lastSignIn;
            set => SetProperty(ref _lastSignIn, value);
        }
        
        private string _mfaStatus = "Unknown";
        public string MfaStatus
        {
            get => _mfaStatus;
            set => SetProperty(ref _mfaStatus, value);
        }
        
        private string _riskLevel = "Low";
        public string RiskLevel
        {
            get => _riskLevel;
            set => SetProperty(ref _riskLevel, value);
        }
        
        private string _authMethods = "Password";
        public string AuthMethods
        {
            get => _authMethods;
            set => SetProperty(ref _authMethods, value);
        }
        
        private string _passwordChange = "Unknown";
        public string PasswordChange
        {
            get => _passwordChange;
            set => SetProperty(ref _passwordChange, value);
        }
        
        public string WindowTitle => $"User Details - {DisplayName}";
        
        private void LoadUserData(dynamic selectedUser)
        {
            if (selectedUser == null)
            {
                DisplayName = "Unknown User";
                return;
            }

            try
            {
                _userData = new UserDetailData
                {
                    Id = GetPropertyValue(selectedUser, "Id"),
                    DisplayName = GetPropertyValue(selectedUser, "DisplayName") ?? GetPropertyValue(selectedUser, "Name"),
                    Email = GetPropertyValue(selectedUser, "Mail") ?? GetPropertyValue(selectedUser, "Email"),
                    Title = GetPropertyValue(selectedUser, "JobTitle") ?? GetPropertyValue(selectedUser, "Title"),
                    Department = GetPropertyValue(selectedUser, "Department"),
                    Manager = GetPropertyValue(selectedUser, "ManagerDisplayName") ?? GetPropertyValue(selectedUser, "Manager"),
                    IsEnabled = GetPropertyValue(selectedUser, "AccountEnabled") == "True" || GetPropertyValue(selectedUser, "AccountEnabled") == "true",
                    LastLogon = DateTime.TryParse(GetPropertyValue(selectedUser, "LastSignInDateTime"), out DateTime lastLogon) ? lastLogon : DateTime.MinValue
                };
                
                DisplayName = _userData.DisplayName ?? "Unknown User";
                UserPrincipalName = "N/A"; // UserPrincipalName not available in UserDetailData
                Email = _userData.Email ?? "";
                JobTitle = _userData.Title ?? "";
                Department = _userData.Department ?? "";
                Manager = _userData.Manager ?? "";
                Location = "N/A"; // City not available in UserDetailData
                AccountEnabled = _userData.IsEnabled ? "Enabled" : "Disabled";
                CreatedDate = "N/A"; // CreatedDateTime not available in UserDetailData
                LastSignIn = _userData.LastLogon.ToString("yyyy-MM-dd HH:mm:ss");
                
                LoadGroupMemberships();
                LoadApplicationAssignments();
                LoadDeviceRelationships();
                LoadAssets();
                LoadDirectoryRoles();
                LoadLicenses();
                
                OnPropertyChanged(nameof(WindowTitle));
            }
            catch (Exception ex)
            {
                ErrorHandlingService.Instance.HandleException(ex, "Loading user data", true);
            }
        }
        
        private string GetPropertyValue(dynamic obj, string propertyName)
        {
            if (obj == null || string.IsNullOrWhiteSpace(propertyName))
                return null;

            try
            {
                var prop = obj.GetType().GetProperty(propertyName);
                return prop?.GetValue(obj)?.ToString();
            }
            catch
            {
                return null;
            }
        }
        
        private void LoadGroupMemberships()
        {
            // Execute on background thread to avoid blocking UI
            Task.Run(async () =>
            {
                try
                {
                    await LoadGroupMembershipsAsync();
                }
                catch (Exception ex)
                {
                    ErrorHandlingService.Instance.HandleException(ex, "Loading group memberships");
                }
            });
        }

        private async Task LoadGroupMembershipsAsync()
        {
            var tempMemberships = new List<GroupMembership>();
            string groupsFile = Path.Combine(_rawDataPath, "Groups.csv");
            
            if (File.Exists(groupsFile))
            {
                var allLines = await File.ReadAllLinesAsync(groupsFile);
                var groupLines = allLines.Skip(1);
                foreach (var line in groupLines)
                {
                    var parts = ParseCsvLine(line);
                    if (parts.Length > 10)
                    {
                        string sampleMembers = parts.Length > 15 ? parts[15] : "";
                        if (!string.IsNullOrEmpty(sampleMembers) && 
                            !string.IsNullOrEmpty(_userData?.Id) &&
                            sampleMembers.Contains(_userData.Id, StringComparison.OrdinalIgnoreCase))
                        {
                            tempMemberships.Add(new GroupMembership
                            {
                                DisplayName = parts[2],
                                GroupType = parts[4].Contains("Unified") ? "Microsoft 365" : "Security"
                            });
                        }
                    }
                }
            }
            
            // Update UI on main thread
            Application.Current.Dispatcher.Invoke(() =>
            {
                GroupMemberships.Clear();
                foreach (var membership in tempMemberships)
                {
                    GroupMemberships.Add(membership);
                }
            });
        }
        
        private void LoadApplicationAssignments()
        {
            try
            {
                ApplicationAssignments.Clear();
                string applicationsFile = Path.Combine(_rawDataPath, "Applications.csv");

                if (File.Exists(applicationsFile) && !string.IsNullOrEmpty(_userData?.Id))
                {
                    var lines = File.ReadAllLines(applicationsFile);
                    if (lines.Length > 1)
                    {
                        var headers = ParseCsvLine(lines[0]);
                        int nameIndex = Array.FindIndex(headers, h => h.Equals("displayname", StringComparison.OrdinalIgnoreCase) || h.Equals("name", StringComparison.OrdinalIgnoreCase));
                        int userIdsIndex = Array.FindIndex(headers, h => h.Equals("userids", StringComparison.OrdinalIgnoreCase) || h.Equals("assigneduserids", StringComparison.OrdinalIgnoreCase) || h.Equals("users", StringComparison.OrdinalIgnoreCase));

                        for (int i = 1; i < lines.Length; i++)
                        {
                            var parts = ParseCsvLine(lines[i]);
                            if (parts.Length <= Math.Max(nameIndex, userIdsIndex))
                                continue;

                            var userIds = userIdsIndex >= 0 ? parts[userIdsIndex] : string.Empty;
                            if (!string.IsNullOrEmpty(userIds) && userIds.Split(new[] { ';', ',', '|' }, StringSplitOptions.RemoveEmptyEntries).Any(id => id.Trim().Equals(_userData.Id, StringComparison.OrdinalIgnoreCase)))
                            {
                                var displayName = nameIndex >= 0 ? parts[nameIndex] : "Unknown";
                                ApplicationAssignments.Add(new ApplicationAssignment
                                {
                                    DisplayName = displayName,
                                    Role = "User"
                                });
                            }
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Error loading application assignments: {ex.Message}");
            }
        }
        
        private void LoadDeviceRelationships()
        {
            try
            {
                DeviceRelationships.Clear();
                DeviceRelationships.Add(new DeviceRelationship
                {
                    DisplayName = "No devices found",
                    OperatingSystem = "N/A",
                    DeviceType = "N/A"
                });
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Error loading device relationships: {ex.Message}");
            }
        }

        private void LoadAssets()
        {
            try
            {
                Assets.Clear();
                foreach (var device in DeviceRelationships)
                {
                    Assets.Add(new AssetData
                    {
                        Name = device.DisplayName,
                        Type = device.DeviceType,
                        Owner = DisplayName,
                        Status = device.Status
                    });
                }
                if (Assets.Count == 0)
                {
                    Assets.Add(new AssetData
                    {
                        Name = "No assets found",
                        Type = string.Empty,
                        Owner = string.Empty,
                        Status = string.Empty
                    });
                }
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Error loading assets: {ex.Message}");
            }
        }
        
        private void LoadDirectoryRoles()
        {
            try
            {
                DirectoryRoles.Clear();
                string rolesFile = Path.Combine(_rawDataPath, "DirectoryRoles.csv");
                
                if (File.Exists(rolesFile))
                {
                    var roleLines = File.ReadAllLines(rolesFile).Skip(1);
                    foreach (var line in roleLines)
                    {
                        var parts = ParseCsvLine(line);
                        if (parts.Length > 5)
                        {
                            string memberCount = parts[5];
                            if (!string.IsNullOrEmpty(memberCount) && memberCount != "0")
                            {
                                DirectoryRoles.Add(new DirectoryRole
                                {
                                    DisplayName = parts[2],
                                    Description = parts[3]
                                });
                            }
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Error loading directory roles: {ex.Message}");
            }
        }
        
        private void LoadLicenses()
        {
            try
            {
                LicenseAssignments.Clear();
                // License assignment data not available in UserDetailData model
                LicenseAssignments.Add(new LicenseAssignment
                {
                    SkuId = "N/A",
                    Status = "Not Available"
                });
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Error loading licenses: {ex.Message}");
            }
        }
        
        private void ExportProfile()
        {
            try
            {
                var saveDialog = new SaveFileDialog
                {
                    Filter = "Text files (*.txt)|*.txt|All files (*.*)|*.*",
                    FileName = $"{DisplayName}_Profile.txt"
                };

                if (saveDialog.ShowDialog() == true)
                {
                    var profileText = GenerateUserProfileReport();
                    File.WriteAllText(saveDialog.FileName, profileText);
                    MessageBox.Show("User profile exported successfully!", "Export Complete", 
                                  MessageBoxButton.OK, MessageBoxImage.Information);
                }
            }
            catch (Exception ex)
            {
                ErrorHandlingService.Instance.HandleException(ex, "Exporting user profile", true);
            }
        }
        
        private string GenerateUserProfileReport()
        {
            var report = $@"USER PROFILE REPORT
Generated: {DateTime.Now:yyyy-MM-dd HH:mm:ss}

=== USER INFORMATION ===
Display Name: {DisplayName}
Email: {Email}
User Principal Name: {UserPrincipalName}
Job Title: {JobTitle}
Department: {Department}
Manager: {Manager}
Location: {Location}
Account Enabled: {AccountEnabled}
Created: {CreatedDate}
Last Sign-In: {LastSignIn}

=== GROUP MEMBERSHIPS ===
";

            foreach (var group in GroupMemberships)
            {
                report += $"- {group.DisplayName} ({group.GroupType})\n";
            }

            report += "\n=== APPLICATION ACCESS ===\n";
            foreach (var app in ApplicationAssignments)
            {
                report += $"- {app.DisplayName} ({app.Role})\n";
            }

            return report;
        }
        
        private string[] ParseCsvLine(string line)
        {
            if (string.IsNullOrEmpty(line))
                return new string[0];

            var result = new List<string>();
            bool inQuotes = false;
            string currentField = "";

            for (int i = 0; i < line.Length; i++)
            {
                char c = line[i];
                
                if (c == '"')
                {
                    inQuotes = !inQuotes;
                }
                else if (c == ',' && !inQuotes)
                {
                    result.Add(currentField.Trim('"'));
                    currentField = "";
                }
                else
                {
                    currentField += c;
                }
            }
            
            result.Add(currentField.Trim('"'));
            return result.ToArray();
        }

        protected override void OnDisposing()
        {
            try
            {
                // Clear collections
                GroupMemberships?.Clear();
                ApplicationAssignments?.Clear();
                DeviceRelationships?.Clear();
                DirectoryRoles?.Clear();
                LicenseAssignments?.Clear();
                
                // Clear user data
                _userData = null;
            }
            catch (Exception ex)
            {
                ErrorHandlingService.Instance.HandleException(ex, "UserDetailViewModel disposal");
            }
            
            base.OnDisposing();
        }
        
        /// <summary>
        /// Loads all related data for the user from CSV files (for enhanced constructor)
        /// </summary>
        private async Task LoadRelatedDataAsync()
        {
            if (_csvDataService == null || _user == null) return;
            
            await ExecuteAsync(async () =>
            {
                LoadingMessage = "Loading user related data...";
                LoadingProgress = 0;

                // Get current profile name for data path resolution
                var profileService = SimpleServiceLocator.GetService<IProfileService>();
                var currentProfile = await profileService?.GetCurrentProfileAsync();
                var profileName = currentProfile?.CompanyName ?? "ljpops";

                try
                {
                    // Load security groups
                    LoadingMessage = "Loading security groups...";
                    LoadingProgress = 20;
                    await LoadSecurityGroupsAsync(profileName);

                    // Load applications
                    LoadingMessage = "Loading applications...";
                    LoadingProgress = 50;
                    await LoadApplicationsAsync(profileName);

                    // Load infrastructure assets
                    LoadingMessage = "Loading infrastructure assets...";
                    LoadingProgress = 80;
                    await LoadInfrastructureAssetsAsync(profileName);

                    LoadingMessage = "Loading policies...";
                    LoadingProgress = 90;
                    await LoadPoliciesAsync(profileName);

                    LoadingProgress = 100;
                    LoadingMessage = "User data loaded successfully";
                    StatusMessage = $"Loaded related data for {_user.DisplayName}";
                }
                catch (Exception ex)
                {
                    StatusMessage = $"Error loading user data: {ex.Message}";
                    throw;
                }
            }, "Load User Details");
        }

        /// <summary>
        /// Loads security groups that the user belongs to
        /// </summary>
        private async Task LoadSecurityGroupsAsync(string profileName)
        {
            try
            {
                var allGroups = await _csvDataService.LoadGroupsAsync(profileName);
                
                System.Windows.Application.Current.Dispatcher.Invoke(() =>
                {
                    SecurityGroups.Clear();
                    
                    // Filter groups where user is a member
                    foreach (var group in allGroups)
                    {
                        // Check if user is in the group members list
                        if (IsUserInGroup(group, _user))
                        {
                            SecurityGroups.Add(group);
                        }
                    }
                });
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Error loading security groups: {ex.Message}");
            }
        }

        /// <summary>
        /// Loads applications owned or used by the user
        /// </summary>
        private async Task LoadApplicationsAsync(string profileName)
        {
            try
            {
                var allApplications = await _csvDataService.LoadApplicationsAsync(profileName);
                
                System.Windows.Application.Current.Dispatcher.Invoke(() =>
                {
                    Applications.Clear();
                    
                    // Filter applications where user is owner or assigned user
                    foreach (var app in allApplications)
                    {
                        if (IsUserAssignedToApplication(app, _user))
                        {
                            Applications.Add(app);
                        }
                    }
                });
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Error loading applications: {ex.Message}");
            }
        }

        /// <summary>
        /// Loads infrastructure assets owned or used by the user
        /// </summary>
        private async Task LoadInfrastructureAssetsAsync(string profileName)
        {
            try
            {
                var allInfrastructure = await _csvDataService.LoadInfrastructureAsync(profileName);
                
                System.Windows.Application.Current.Dispatcher.Invoke(() =>
                {
                    InfrastructureAssets.Clear();
                    
                    // Filter assets where user is owner or primary user
                    foreach (var asset in allInfrastructure)
                    {
                        if (IsUserAssignedToAsset(asset, _user))
                        {
                            InfrastructureAssets.Add(asset);
                        }
                    }
                });
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Error loading infrastructure assets: {ex.Message}");
            }
        }

        private async Task LoadPoliciesAsync(string profileName)
        {
            try
            {
                var policies = await _csvDataService.LoadGroupPoliciesAsync(profileName);
                Policies.Clear();
                var identifier = _user.Id ?? _user.UserPrincipalName;
                foreach (var policy in policies)
                {
                    if (!string.IsNullOrWhiteSpace(policy.SecurityFiltering) &&
                        policy.SecurityFiltering.Contains(identifier, StringComparison.OrdinalIgnoreCase))
                    {
                        Policies.Add(policy);
                        AssetRelationshipService.Instance.CreateRelationship("user", identifier, "policy", policy.Id ?? policy.Name, "affected_by");
                    }
                }
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Error loading policies for user: {ex.Message}");
            }
        }

        /// <summary>
        /// Checks if a user is a member of a group
        /// </summary>
        private bool IsUserInGroup(GroupData group, UserData user)
        {
            // Simple check using UserIds collection which exists in GroupData
            if (group.UserIds != null && !string.IsNullOrEmpty(user.Id))
            {
                return group.UserIds.Contains(user.Id, StringComparer.OrdinalIgnoreCase);
            }
            
            // Fallback to simple name matching (less reliable but better than nothing)
            if (!string.IsNullOrEmpty(group.DisplayName) && !string.IsNullOrEmpty(user.DisplayName))
            {
                // This is a very basic check - in real scenarios you'd want more sophisticated membership logic
                return false; // Disable this for now as it's not reliable
            }
            
            return false;
        }

        /// <summary>
        /// Checks if a user is assigned to an application
        /// </summary>
        private bool IsUserAssignedToApplication(ApplicationData app, UserData user)
        {
            // Check using UserIds collection which exists in ApplicationData
            if (app.UserIds != null && !string.IsNullOrEmpty(user.Id))
            {
                return app.UserIds.Contains(user.Id, StringComparer.OrdinalIgnoreCase);
            }
            
            return false;
        }

        /// <summary>
        /// Checks if a user is assigned to an infrastructure asset
        /// </summary>
        private bool IsUserAssignedToAsset(InfrastructureData asset, UserData user)
        {
            // Check using UserIds collection which exists in InfrastructureData
            if (asset.UserIds != null && !string.IsNullOrEmpty(user.Id))
            {
                return asset.UserIds.Contains(user.Id, StringComparer.OrdinalIgnoreCase);
            }
            
            return false;
        }
    }
}