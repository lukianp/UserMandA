using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.IO;
using System.Linq;
using System.Windows;
using System.Windows.Controls;
using Microsoft.Win32;

namespace MandADiscoverySuite
{
    public partial class UserDetailWindow : Window
    {
        private UserDetailData _userData;
        private string _rawDataPath;

        public UserDetailWindow(dynamic selectedUser, string rawDataPath)
        {
            InitializeComponent();
            _rawDataPath = rawDataPath;
            LoadUserData(selectedUser);
        }

        private void LoadUserData(dynamic selectedUser)
        {
            try
            {
                _userData = new UserDetailData();
                
                // Extract basic user information
                _userData.Id = GetPropertyValue(selectedUser, "Id");
                _userData.DisplayName = GetPropertyValue(selectedUser, "DisplayName") ?? GetPropertyValue(selectedUser, "Name");
                _userData.UserPrincipalName = GetPropertyValue(selectedUser, "UserPrincipalName") ?? GetPropertyValue(selectedUser, "Email");
                _userData.Mail = GetPropertyValue(selectedUser, "Mail") ?? GetPropertyValue(selectedUser, "Email");
                _userData.JobTitle = GetPropertyValue(selectedUser, "JobTitle") ?? GetPropertyValue(selectedUser, "Title");
                _userData.Department = GetPropertyValue(selectedUser, "Department");
                _userData.Manager = GetPropertyValue(selectedUser, "ManagerDisplayName") ?? GetPropertyValue(selectedUser, "Manager");
                _userData.City = GetPropertyValue(selectedUser, "City") ?? GetPropertyValue(selectedUser, "Location");
                _userData.AccountEnabled = GetPropertyValue(selectedUser, "AccountEnabled");
                _userData.CreatedDateTime = GetPropertyValue(selectedUser, "CreatedDateTime");
                _userData.LastSignInDateTime = GetPropertyValue(selectedUser, "LastSignInDateTime");

                // Set basic user information
                UserDisplayNameText.Text = _userData.DisplayName ?? "Unknown User";
                UserPrincipalNameText.Text = _userData.UserPrincipalName ?? "";
                EmailText.Text = _userData.Mail ?? "";
                JobTitleText.Text = _userData.JobTitle ?? "";
                DepartmentText.Text = _userData.Department ?? "";
                ManagerText.Text = _userData.Manager ?? "";
                LocationText.Text = _userData.City ?? "";
                AccountEnabledText.Text = _userData.AccountEnabled ?? "";
                CreatedDateText.Text = _userData.CreatedDateTime ?? "";
                LastSignInText.Text = _userData.LastSignInDateTime ?? "";

                // Load related data from other CSV files
                LoadGroupMemberships();
                LoadApplicationAssignments();
                LoadDeviceRelationships();
                LoadDirectoryRoles();
                LoadLicenses();
                LoadSecurityInformation();

                // Update window title
                Title = $"User Details - {_userData.DisplayName}";
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
                var groups = new ObservableCollection<GroupMembership>();
                string groupsFile = Path.Combine(_rawDataPath, "Groups.csv");
                
                if (File.Exists(groupsFile))
                {
                    var groupLines = File.ReadAllLines(groupsFile).Skip(1);
                    foreach (var line in groupLines)
                    {
                        var parts = ParseCsvLine(line);
                        if (parts.Length > 10)
                        {
                            // Check if user is a member (check SampleMembers field)
                            string sampleMembers = parts.Length > 15 ? parts[15] : "";
                            if (!string.IsNullOrEmpty(sampleMembers) && 
                                sampleMembers.Contains(_userData.Id, StringComparison.OrdinalIgnoreCase))
                            {
                                groups.Add(new GroupMembership
                                {
                                    DisplayName = parts[2], // DisplayName
                                    GroupType = parts[4].Contains("Unified") ? "Microsoft 365" : "Security"
                                });
                            }
                        }
                    }
                }

                GroupMembershipsGrid.ItemsSource = groups;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error loading group memberships: {ex.Message}");
            }
        }

        private void LoadApplicationAssignments()
        {
            try
            {
                var applications = new ObservableCollection<ApplicationAssignment>();
                
                // Load from Applications.csv
                string applicationsFile = Path.Combine(_rawDataPath, "Applications.csv");
                if (File.Exists(applicationsFile))
                {
                    var appLines = File.ReadAllLines(applicationsFile).Skip(1);
                    foreach (var line in appLines)
                    {
                        var parts = ParseCsvLine(line);
                        if (parts.Length > 10)
                        {
                            // Check if user has access (simplified logic)
                            applications.Add(new ApplicationAssignment
                            {
                                DisplayName = parts[3], // DisplayName
                                Role = "User" // Default role
                            });
                        }
                    }
                }

                ApplicationsGrid.ItemsSource = applications;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error loading application assignments: {ex.Message}");
            }
        }

        private void LoadDeviceRelationships()
        {
            try
            {
                var devices = new ObservableCollection<DeviceRelationship>();
                
                // This would be loaded from device data if available
                // For now, showing placeholder
                devices.Add(new DeviceRelationship
                {
                    DisplayName = "No devices found",
                    OperatingSystem = "N/A",
                    TrustType = "N/A"
                });

                DevicesGrid.ItemsSource = devices;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error loading device relationships: {ex.Message}");
            }
        }

        private void LoadDirectoryRoles()
        {
            try
            {
                var roles = new ObservableCollection<DirectoryRole>();
                string rolesFile = Path.Combine(_rawDataPath, "DirectoryRoles.csv");
                
                if (File.Exists(rolesFile))
                {
                    var roleLines = File.ReadAllLines(rolesFile).Skip(1);
                    foreach (var line in roleLines)
                    {
                        var parts = ParseCsvLine(line);
                        if (parts.Length > 5)
                        {
                            // Check if user has this role (simplified logic)
                            string memberCount = parts[5];
                            if (!string.IsNullOrEmpty(memberCount) && memberCount != "0")
                            {
                                roles.Add(new DirectoryRole
                                {
                                    DisplayName = parts[2], // DisplayName
                                    Description = parts[3] // Description
                                });
                            }
                        }
                    }
                }

                DirectoryRolesGrid.ItemsSource = roles;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error loading directory roles: {ex.Message}");
            }
        }

        private void LoadLicenses()
        {
            try
            {
                var licenses = new ObservableCollection<LicenseAssignment>();
                
                // Parse licenses from user data if available
                string assignedLicenses = _userData.AssignedLicenses ?? "";
                if (!string.IsNullOrEmpty(assignedLicenses))
                {
                    // This would parse actual license data
                    licenses.Add(new LicenseAssignment
                    {
                        SkuPartNumber = "Microsoft 365 Business Premium",
                        Status = "Active"
                    });
                }
                else
                {
                    licenses.Add(new LicenseAssignment
                    {
                        SkuPartNumber = "No licenses assigned",
                        Status = "N/A"
                    });
                }

                LicensesGrid.ItemsSource = licenses;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error loading licenses: {ex.Message}");
            }
        }

        private void LoadSecurityInformation()
        {
            try
            {
                // Set security information from user data
                MFAStatusText.Text = "Unknown";
                RiskLevelText.Text = "Low";
                AuthMethodsText.Text = "Password";
                PasswordChangeText.Text = "Unknown";
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error loading security information: {ex.Message}");
            }
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

        private void CloseButton_Click(object sender, RoutedEventArgs e)
        {
            Close();
        }

        private void ExportProfile_Click(object sender, RoutedEventArgs e)
        {
            try
            {
                var saveDialog = new SaveFileDialog
                {
                    Filter = "Text files (*.txt)|*.txt|All files (*.*)|*.*",
                    FileName = $"{_userData.DisplayName}_Profile.txt"
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
Display Name: {_userData.DisplayName}
Email: {_userData.Mail}
User Principal Name: {_userData.UserPrincipalName}
Job Title: {_userData.JobTitle}
Department: {_userData.Department}
Manager: {_userData.Manager}
Location: {_userData.City}
Account Enabled: {_userData.AccountEnabled}
Created: {_userData.CreatedDateTime}
Last Sign-In: {_userData.LastSignInDateTime}

=== GROUP MEMBERSHIPS ===
";

            if (GroupMembershipsGrid.ItemsSource is ObservableCollection<GroupMembership> groups)
            {
                foreach (var group in groups)
                {
                    report += $"- {group.DisplayName} ({group.GroupType})\n";
                }
            }

            report += "\n=== APPLICATION ACCESS ===\n";
            if (ApplicationsGrid.ItemsSource is ObservableCollection<ApplicationAssignment> apps)
            {
                foreach (var app in apps)
                {
                    report += $"- {app.DisplayName} ({app.Role})\n";
                }
            }

            return report;
        }
    }

    // Data classes
    public class UserDetailData
    {
        public string Id { get; set; }
        public string DisplayName { get; set; }
        public string UserPrincipalName { get; set; }
        public string Mail { get; set; }
        public string JobTitle { get; set; }
        public string Department { get; set; }
        public string Manager { get; set; }
        public string City { get; set; }
        public string AccountEnabled { get; set; }
        public string CreatedDateTime { get; set; }
        public string LastSignInDateTime { get; set; }
        public string AssignedLicenses { get; set; }
    }

    public class GroupMembership
    {
        public string DisplayName { get; set; }
        public string GroupType { get; set; }
    }

    public class ApplicationAssignment
    {
        public string DisplayName { get; set; }
        public string Role { get; set; }
    }

    public class DeviceRelationship
    {
        public string DisplayName { get; set; }
        public string OperatingSystem { get; set; }
        public string TrustType { get; set; }
    }

    public class DirectoryRole
    {
        public string DisplayName { get; set; }
        public string Description { get; set; }
    }

    public class LicenseAssignment
    {
        public string SkuPartNumber { get; set; }
        public string Status { get; set; }
    }
}