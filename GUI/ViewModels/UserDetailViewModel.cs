using System;
using System.Collections.ObjectModel;
using System.IO;
using System.Windows.Input;
using System.Linq;
using Microsoft.Win32;
using System.Collections.Generic;
using System.Threading.Tasks;
using System.Windows;
using MandADiscoverySuite.Models;
using MandADiscoverySuite.Services;
using MandADiscoverySuite.Repository;

namespace MandADiscoverySuite.ViewModels
{
    public class UserDetailViewModel : BaseViewModel
    {
        private readonly string _rawDataPath;
        private readonly IUnitOfWork _unitOfWork;
        private UserDetailData _userData;

        public UserDetailViewModel(dynamic selectedUser, string rawDataPath, IUnitOfWork unitOfWork = null)
        {
            if (selectedUser == null)
                throw new ArgumentNullException(nameof(selectedUser));
            if (string.IsNullOrWhiteSpace(rawDataPath))
                throw new ArgumentException("Raw data path cannot be null or empty", nameof(rawDataPath));

            _rawDataPath = rawDataPath;
            _unitOfWork = unitOfWork ?? new UnitOfWork();
            GroupMemberships = new ObservableCollection<GroupMembership>();
            ApplicationAssignments = new ObservableCollection<ApplicationAssignment>();
            DeviceRelationships = new ObservableCollection<DeviceRelationship>();
            DirectoryRoles = new ObservableCollection<DirectoryRole>();
            LicenseAssignments = new ObservableCollection<LicenseAssignment>();
            MigrationWaves = new ObservableCollection<MigrationWave>();
            
            CloseCommand = new RelayCommand(() => CloseRequested?.Invoke());
            ExportProfileCommand = new RelayCommand(ExportProfile);

            LoadUserData(selectedUser);
            LoadMigrationWaves();
        }
        
        public event Action CloseRequested;
        
        public ObservableCollection<GroupMembership> GroupMemberships { get; }
        public ObservableCollection<ApplicationAssignment> ApplicationAssignments { get; }
        public ObservableCollection<DeviceRelationship> DeviceRelationships { get; }
        public ObservableCollection<DirectoryRole> DirectoryRoles { get; }
        public ObservableCollection<LicenseAssignment> LicenseAssignments { get; }
        public ObservableCollection<MigrationWave> MigrationWaves { get; }
        
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

        private MigrationWave _selectedMigrationWave;
        public MigrationWave SelectedMigrationWave
        {
            get => _selectedMigrationWave;
            set
            {
                if (SetProperty(ref _selectedMigrationWave, value))
                {
                    _ = UpdateWaveAssignmentAsync(value);
                }
            }
        }
        
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
                    DeviceType = "N/A"
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

        private async void LoadMigrationWaves()
        {
            try
            {
                MigrationWaves.Clear();
                var waveRepo = _unitOfWork.GetRepository<MigrationWave, string>();
                var assignmentRepo = _unitOfWork.GetRepository<WaveAssignment, string>();
                var waves = await waveRepo.GetAllAsync();
                var assignments = await assignmentRepo.GetAllAsync();

                foreach (var wave in waves)
                {
                    wave.Assignments = new ObservableCollection<WaveAssignment>(assignments.Where(a => a.WaveId == wave.Id));
                    MigrationWaves.Add(wave);
                }

                var existing = assignments.FirstOrDefault(a => a.UserId == _userData.Id);
                if (existing != null)
                {
                    SelectedMigrationWave = MigrationWaves.FirstOrDefault(w => w.Id == existing.WaveId);
                }
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Error loading migration waves: {ex.Message}");
            }
        }

        private async Task UpdateWaveAssignmentAsync(MigrationWave wave)
        {
            try
            {
                var assignmentRepo = _unitOfWork.GetRepository<WaveAssignment, string>();
                var existing = await assignmentRepo.FirstOrDefaultAsync(a => a.UserId == _userData.Id);

                if (wave != null)
                {
                    if (existing == null)
                    {
                        existing = new WaveAssignment { UserId = _userData.Id, DisplayName = DisplayName, WaveId = wave.Id };
                        await assignmentRepo.AddAsync(existing);
                        wave.Assignments.Add(existing);
                    }
                    else
                    {
                        var oldWave = MigrationWaves.FirstOrDefault(w => w.Id == existing.WaveId);
                        oldWave?.Assignments.Remove(existing);
                        existing.WaveId = wave.Id;
                        await assignmentRepo.UpdateAsync(existing);
                        wave.Assignments.Add(existing);
                    }
                }
                else if (existing != null)
                {
                    await assignmentRepo.RemoveAsync(existing.Id);
                    var oldWave = MigrationWaves.FirstOrDefault(w => w.Id == existing.WaveId);
                    oldWave?.Assignments.Remove(existing);
                }

                await _unitOfWork.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Error updating wave assignment: {ex.Message}");
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
    }
}