using System;
using System.Collections.ObjectModel;
using System.IO;
using System.Windows.Input;
using System.Linq;
using Microsoft.Win32;
using System.Collections.Generic;
using System.Windows;
using MandADiscoverySuite.Models;

namespace MandADiscoverySuite.ViewModels
{
    public class UserDetailViewModel : BaseViewModel
    {
        private readonly string _rawDataPath;
        private UserDetailData _userData;
        
        public UserDetailViewModel(dynamic selectedUser, string rawDataPath)
        {
            _rawDataPath = rawDataPath;
            GroupMemberships = new ObservableCollection<GroupMembership>();
            ApplicationAssignments = new ObservableCollection<ApplicationAssignment>();
            DeviceRelationships = new ObservableCollection<DeviceRelationship>();
            DirectoryRoles = new ObservableCollection<DirectoryRole>();
            LicenseAssignments = new ObservableCollection<LicenseAssignment>();
            
            CloseCommand = new RelayCommand(() => CloseRequested?.Invoke());
            ExportProfileCommand = new RelayCommand(ExportProfile);
            
            LoadUserData(selectedUser);
        }
        
        public event Action CloseRequested;
        
        public ObservableCollection<GroupMembership> GroupMemberships { get; }
        public ObservableCollection<ApplicationAssignment> ApplicationAssignments { get; }
        public ObservableCollection<DeviceRelationship> DeviceRelationships { get; }
        public ObservableCollection<DirectoryRole> DirectoryRoles { get; }
        public ObservableCollection<LicenseAssignment> LicenseAssignments { get; }
        
        public ICommand CloseCommand { get; }
        public ICommand ExportProfileCommand { get; }
        
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
            try
            {
                _userData = new UserDetailData
                {
                    Id = GetPropertyValue(selectedUser, "Id"),
                    DisplayName = GetPropertyValue(selectedUser, "DisplayName") ?? GetPropertyValue(selectedUser, "Name"),
                    UserPrincipalName = GetPropertyValue(selectedUser, "UserPrincipalName") ?? GetPropertyValue(selectedUser, "Email"),
                    Mail = GetPropertyValue(selectedUser, "Mail") ?? GetPropertyValue(selectedUser, "Email"),
                    JobTitle = GetPropertyValue(selectedUser, "JobTitle") ?? GetPropertyValue(selectedUser, "Title"),
                    Department = GetPropertyValue(selectedUser, "Department"),
                    Manager = GetPropertyValue(selectedUser, "ManagerDisplayName") ?? GetPropertyValue(selectedUser, "Manager"),
                    City = GetPropertyValue(selectedUser, "City") ?? GetPropertyValue(selectedUser, "Location"),
                    AccountEnabled = GetPropertyValue(selectedUser, "AccountEnabled"),
                    CreatedDateTime = GetPropertyValue(selectedUser, "CreatedDateTime"),
                    LastSignInDateTime = GetPropertyValue(selectedUser, "LastSignInDateTime")
                };
                
                DisplayName = _userData.DisplayName ?? "Unknown User";
                UserPrincipalName = _userData.UserPrincipalName ?? "";
                Email = _userData.Mail ?? "";
                JobTitle = _userData.JobTitle ?? "";
                Department = _userData.Department ?? "";
                Manager = _userData.Manager ?? "";
                Location = _userData.City ?? "";
                AccountEnabled = _userData.AccountEnabled ?? "";
                CreatedDate = _userData.CreatedDateTime ?? "";
                LastSignIn = _userData.LastSignInDateTime ?? "";
                
                LoadGroupMemberships();
                LoadApplicationAssignments();
                LoadDeviceRelationships();
                LoadDirectoryRoles();
                LoadLicenses();
                
                OnPropertyChanged(nameof(WindowTitle));
            }
            catch (Exception ex)
            {
                MessageBox.Show($"Error loading user data: {ex.Message}", "Error", MessageBoxButton.OK, MessageBoxImage.Error);
            }
        }
        
        private string GetPropertyValue(dynamic obj, string propertyName)
        {
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
            try
            {
                GroupMemberships.Clear();
                string groupsFile = Path.Combine(_rawDataPath, "Groups.csv");
                
                if (File.Exists(groupsFile))
                {
                    var groupLines = File.ReadAllLines(groupsFile).Skip(1);
                    foreach (var line in groupLines)
                    {
                        var parts = ParseCsvLine(line);
                        if (parts.Length > 10)
                        {
                            string sampleMembers = parts.Length > 15 ? parts[15] : "";
                            if (!string.IsNullOrEmpty(sampleMembers) && 
                                sampleMembers.Contains(_userData.Id, StringComparison.OrdinalIgnoreCase))
                            {
                                GroupMemberships.Add(new GroupMembership
                                {
                                    DisplayName = parts[2],
                                    GroupType = parts[4].Contains("Unified") ? "Microsoft 365" : "Security"
                                });
                            }
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Error loading group memberships: {ex.Message}");
            }
        }
        
        private void LoadApplicationAssignments()
        {
            try
            {
                ApplicationAssignments.Clear();
                string applicationsFile = Path.Combine(_rawDataPath, "Applications.csv");
                
                if (File.Exists(applicationsFile))
                {
                    var appLines = File.ReadAllLines(applicationsFile).Skip(1);
                    foreach (var line in appLines)
                    {
                        var parts = ParseCsvLine(line);
                        if (parts.Length > 10)
                        {
                            ApplicationAssignments.Add(new ApplicationAssignment
                            {
                                DisplayName = parts[3],
                                Role = "User"
                            });
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
                    TrustType = "N/A"
                });
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Error loading device relationships: {ex.Message}");
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
                string assignedLicenses = _userData.AssignedLicenses ?? "";
                
                if (!string.IsNullOrEmpty(assignedLicenses))
                {
                    LicenseAssignments.Add(new LicenseAssignment
                    {
                        SkuPartNumber = "Microsoft 365 Business Premium",
                        Status = "Active"
                    });
                }
                else
                {
                    LicenseAssignments.Add(new LicenseAssignment
                    {
                        SkuPartNumber = "No licenses assigned",
                        Status = "N/A"
                    });
                }
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
                MessageBox.Show($"Error exporting profile: {ex.Message}", "Export Error", 
                              MessageBoxButton.OK, MessageBoxImage.Error);
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
    }
}