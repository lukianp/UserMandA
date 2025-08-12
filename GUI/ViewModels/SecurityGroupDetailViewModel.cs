using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using System.Windows.Input;
using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using MandADiscoverySuite.Collections;
using MandADiscoverySuite.Models;
using MandADiscoverySuite.Services;
using Newtonsoft.Json;

namespace MandADiscoverySuite.ViewModels
{
    /// <summary>
    /// ViewModel for detailed security group information with relationship loading
    /// </summary>
    public partial class SecurityGroupDetailViewModel : BaseViewModel
    {
        private readonly CsvDataService _csvDataService;
        private readonly MainViewModel _mainViewModel;

        #region Private Fields

        private GroupData _group;
        private OptimizedObservableCollection<UserData> _members;
        private OptimizedObservableCollection<UserData> _owners;
        private OptimizedObservableCollection<ApplicationData> _linkedApplications;
        private OptimizedObservableCollection<InfrastructureData> _linkedAssets;
        private OptimizedObservableCollection<GroupData> _nestedGroups;
        private OptimizedObservableCollection<PolicyData> _accessControls;
        private OptimizedObservableCollection<RelationshipNote> _migrationNotes;

        #endregion

        #region Properties

        /// <summary>
        /// The selected security group
        /// </summary>
        public GroupData Group
        {
            get => _group;
            set => SetProperty(ref _group, value);
        }

        /// <summary>
        /// Members of this security group
        /// </summary>
        public OptimizedObservableCollection<UserData> Members
        {
            get => _members ??= new OptimizedObservableCollection<UserData>();
            set => SetProperty(ref _members, value);
        }

        /// <summary>
        /// Owners of this security group
        /// </summary>
        public OptimizedObservableCollection<UserData> Owners
        {
            get => _owners ??= new OptimizedObservableCollection<UserData>();
            set => SetProperty(ref _owners, value);
        }

        /// <summary>
        /// Applications linked to this security group
        /// </summary>
        public OptimizedObservableCollection<ApplicationData> LinkedApplications
        {
            get => _linkedApplications ??= new OptimizedObservableCollection<ApplicationData>();
            set => SetProperty(ref _linkedApplications, value);
        }

        /// <summary>
        /// Infrastructure assets linked to this security group
        /// </summary>
        public OptimizedObservableCollection<InfrastructureData> LinkedAssets
        {
            get => _linkedAssets ??= new OptimizedObservableCollection<InfrastructureData>();
            set => SetProperty(ref _linkedAssets, value);
        }

        /// <summary>
        /// Nested groups (parent/child relationships)
        /// </summary>
        public OptimizedObservableCollection<GroupData> NestedGroups
        {
            get => _nestedGroups ??= new OptimizedObservableCollection<GroupData>();
            set => SetProperty(ref _nestedGroups, value);
        }

        /// <summary>
        /// Access controls and permissions for this group
        /// </summary>
        public OptimizedObservableCollection<PolicyData> AccessControls
        {
            get => _accessControls ??= new OptimizedObservableCollection<PolicyData>();
            set => SetProperty(ref _accessControls, value);
        }

        /// <summary>
        /// Migration planning notes for this group
        /// </summary>
        public OptimizedObservableCollection<RelationshipNote> MigrationNotes
        {
            get => _migrationNotes ??= new OptimizedObservableCollection<RelationshipNote>();
            set => SetProperty(ref _migrationNotes, value);
        }

        private bool _isLoading;
        private string _loadingMessage = "Ready";
        private bool _hasErrors;
        private string? _errorMessage;
        private string _newMigrationNote = string.Empty;

        public bool IsLoading
        {
            get => _isLoading;
            set => SetProperty(ref _isLoading, value);
        }

        public string LoadingMessage
        {
            get => _loadingMessage;
            set => SetProperty(ref _loadingMessage, value);
        }

        public bool HasErrors
        {
            get => _hasErrors;
            set => SetProperty(ref _hasErrors, value);
        }

        public string? ErrorMessage
        {
            get => _errorMessage;
            set => SetProperty(ref _errorMessage, value);
        }

        public string NewMigrationNote
        {
            get => _newMigrationNote;
            set => SetProperty(ref _newMigrationNote, value);
        }

        #endregion

        #region Commands

        public ICommand LoadAssetDetailCommand { get; }
        public ICommand SaveNotesCommand { get; }
        public ICommand AddMigrationNoteCommand { get; }
        public ICommand RemoveMigrationNoteCommand { get; }
        public ICommand CloseDetailCommand { get; }
        public ICommand OpenUserDetailCommand { get; }
        public ICommand OpenApplicationDetailCommand { get; }
        public ICommand OpenAssetDetailCommand { get; }
        public ICommand OpenNestedGroupDetailCommand { get; }

        #endregion

        #region Constructor

        public SecurityGroupDetailViewModel(GroupData group, CsvDataService csvDataService, MainViewModel mainViewModel)
        {
            _group = group ?? throw new ArgumentNullException(nameof(group));
            _csvDataService = csvDataService ?? throw new ArgumentNullException(nameof(csvDataService));
            _mainViewModel = mainViewModel ?? throw new ArgumentNullException(nameof(mainViewModel));

            // Initialize commands
            LoadAssetDetailCommand = new AsyncRelayCommand(LoadAsync);
            SaveNotesCommand = new AsyncRelayCommand(SaveNotesAsync);
            AddMigrationNoteCommand = new RelayCommand(AddMigrationNote, () => !string.IsNullOrWhiteSpace(NewMigrationNote));
            RemoveMigrationNoteCommand = new RelayCommand<RelationshipNote>(RemoveMigrationNote, note => note != null);
            CloseDetailCommand = new RelayCommand(CloseDetail);
            OpenUserDetailCommand = new RelayCommand<UserData>(OpenUserDetail, user => user != null);
            OpenApplicationDetailCommand = new RelayCommand<ApplicationData>(OpenApplicationDetail, app => app != null);
            OpenAssetDetailCommand = new RelayCommand<InfrastructureData>(OpenAssetDetail, asset => asset != null);
            OpenNestedGroupDetailCommand = new RelayCommand<GroupData>(OpenNestedGroupDetail, nestedGroup => nestedGroup != null);

            // Auto-load data
            _ = LoadAsync();

            _ = EnhancedLoggingService.Instance.LogInformationAsync($"SecurityGroupDetailViewModel created for group: {Group.DisplayName}");
        }

        #endregion

        #region Methods

        /// <summary>
        /// Loads detailed group information and relationships
        /// </summary>
        public async Task LoadAsync()
        {
            try
            {
                IsLoading = true;
                HasErrors = false;
                ErrorMessage = null;
                LoadingMessage = "Loading group details...";

                var profileService = SimpleServiceLocator.GetService<IProfileService>();
                var currentProfile = await profileService?.GetCurrentProfileAsync();
                var profileName = currentProfile?.CompanyName ?? "ljpops";

                await Task.WhenAll(
                    LoadGroupMembersAsync(profileName),
                    LoadGroupOwnersAsync(profileName),
                    LoadLinkedApplicationsAsync(profileName),
                    LoadLinkedAssetsAsync(profileName),
                    LoadNestedGroupsAsync(profileName),
                    LoadAccessControlsAsync(profileName),
                    LoadMigrationNotesAsync(profileName)
                );

                LoadingMessage = "Group relationships loaded successfully";
                
                // Notify UI of relationship summary changes
                OnPropertyChanged(nameof(RelationshipsSummary));

                _ = EnhancedLoggingService.Instance.LogInformationAsync($"SecurityGroupDetailViewModel.LoadAsync: Successfully loaded relationships for group '{Group.DisplayName}'");
            }
            catch (Exception ex)
            {
                _ = EnhancedLoggingService.Instance.LogErrorAsync($"SecurityGroupDetailViewModel.LoadAsync: Error loading group '{Group?.DisplayName}' relationships", ex);
                ErrorMessage = $"Failed to load group relationships: {ex.Message}";
                HasErrors = true;
                LoadingMessage = "Failed to load relationships";
            }
            finally
            {
                IsLoading = false;
            }
        }

        /// <summary>
        /// Loads group members from available CSV sources
        /// </summary>
        private async Task LoadGroupMembersAsync(string profileName)
        {
            try
            {
                LoadingMessage = "Loading group members...";

                // Try to load all users and find those that are members of this group
                var allUsers = await _csvDataService.LoadUsersAsync(profileName);
                var memberUsers = new List<UserData>();

                // Check if group has member information in UserIds
                if (Group.UserIds != null && Group.UserIds.Any())
                {
                    var memberIds = Group.UserIds.ToHashSet(StringComparer.OrdinalIgnoreCase);
                    memberUsers.AddRange(allUsers.Where(user => 
                        memberIds.Contains(user.Id) || 
                        memberIds.Contains(user.UserPrincipalName) ||
                        memberIds.Contains(user.SamAccountName)));
                }

                // Also search for membership files (e.g., GroupMembers.csv, GroupMembership.csv)
                // This is a simplified implementation - in reality, you'd need to check actual CSV structures
                await System.Windows.Application.Current.Dispatcher.InvokeAsync(() =>
                {
                    Members.Clear();
                    foreach (var member in memberUsers.Take(100)) // Limit to prevent UI performance issues
                    {
                        Members.Add(member);
                    }
                });

                _ = EnhancedLoggingService.Instance.LogInformationAsync($"SecurityGroupDetailViewModel.LoadGroupMembersAsync: Loaded {memberUsers.Count} members for group '{Group.DisplayName}'");
            }
            catch (Exception ex)
            {
                _ = EnhancedLoggingService.Instance.LogErrorAsync($"SecurityGroupDetailViewModel.LoadGroupMembersAsync: Error loading members for group '{Group.DisplayName}'", ex);
            }
        }

        /// <summary>
        /// Loads group owners
        /// </summary>
        private async Task LoadGroupOwnersAsync(string profileName)
        {
            try
            {
                LoadingMessage = "Loading group owners...";

                // In a real implementation, you would search for owner information in CSV files
                // For now, we'll leave this empty as owner data structure varies
                await System.Windows.Application.Current.Dispatcher.InvokeAsync(() =>
                {
                    Owners.Clear();
                    // TODO: Implement owner loading based on actual CSV structure
                });

                _ = EnhancedLoggingService.Instance.LogInformationAsync($"SecurityGroupDetailViewModel.LoadGroupOwnersAsync: Loaded owners for group '{Group.DisplayName}'");
            }
            catch (Exception ex)
            {
                _ = EnhancedLoggingService.Instance.LogErrorAsync($"SecurityGroupDetailViewModel.LoadGroupOwnersAsync: Error loading owners for group '{Group.DisplayName}'", ex);
            }
        }

        /// <summary>
        /// Loads applications linked to this group
        /// </summary>
        private async Task LoadLinkedApplicationsAsync(string profileName)
        {
            try
            {
                LoadingMessage = "Loading linked applications...";

                var allApplications = await _csvDataService.LoadApplicationsAsync(profileName);
                var linkedApps = allApplications.Where(app => IsApplicationLinkedToGroup(app, Group)).ToList();

                await System.Windows.Application.Current.Dispatcher.InvokeAsync(() =>
                {
                    LinkedApplications.Clear();
                    foreach (var app in linkedApps)
                    {
                        LinkedApplications.Add(app);
                    }
                });

                _ = EnhancedLoggingService.Instance.LogInformationAsync($"SecurityGroupDetailViewModel.LoadLinkedApplicationsAsync: Found {linkedApps.Count} linked applications for group '{Group.DisplayName}'");
            }
            catch (Exception ex)
            {
                _ = EnhancedLoggingService.Instance.LogErrorAsync($"SecurityGroupDetailViewModel.LoadLinkedApplicationsAsync: Error loading linked applications for group '{Group.DisplayName}'", ex);
            }
        }

        /// <summary>
        /// Loads infrastructure assets linked to this group
        /// </summary>
        private async Task LoadLinkedAssetsAsync(string profileName)
        {
            try
            {
                LoadingMessage = "Loading linked assets...";

                var allAssets = await _csvDataService.LoadInfrastructureAsync(profileName);
                var linkedAssets = allAssets.Where(asset => IsAssetLinkedToGroup(asset, Group)).ToList();

                await System.Windows.Application.Current.Dispatcher.InvokeAsync(() =>
                {
                    LinkedAssets.Clear();
                    foreach (var asset in linkedAssets)
                    {
                        LinkedAssets.Add(asset);
                    }
                });

                _ = EnhancedLoggingService.Instance.LogInformationAsync($"SecurityGroupDetailViewModel.LoadLinkedAssetsAsync: Found {linkedAssets.Count} linked assets for group '{Group.DisplayName}'");
            }
            catch (Exception ex)
            {
                _ = EnhancedLoggingService.Instance.LogErrorAsync($"SecurityGroupDetailViewModel.LoadLinkedAssetsAsync: Error loading linked assets for group '{Group.DisplayName}'", ex);
            }
        }

        /// <summary>
        /// Loads nested groups (parent/child relationships)
        /// </summary>
        private async Task LoadNestedGroupsAsync(string profileName)
        {
            try
            {
                LoadingMessage = "Loading nested groups...";

                var allGroups = await _csvDataService.LoadGroupsAsync(profileName);
                var nestedGroups = new List<GroupData>();

                // Look for parent/child relationships
                // This is a simplified implementation - actual structure depends on CSV format
                foreach (var otherGroup in allGroups.Where(g => g.Id != Group.Id))
                {
                    if (IsNestedGroup(otherGroup, Group))
                    {
                        nestedGroups.Add(otherGroup);
                    }
                }

                await System.Windows.Application.Current.Dispatcher.InvokeAsync(() =>
                {
                    NestedGroups.Clear();
                    foreach (var nestedGroup in nestedGroups)
                    {
                        NestedGroups.Add(nestedGroup);
                    }
                });

                _ = EnhancedLoggingService.Instance.LogInformationAsync($"SecurityGroupDetailViewModel.LoadNestedGroupsAsync: Found {nestedGroups.Count} nested groups for group '{Group.DisplayName}'");
            }
            catch (Exception ex)
            {
                _ = EnhancedLoggingService.Instance.LogErrorAsync($"SecurityGroupDetailViewModel.LoadNestedGroupsAsync: Error loading nested groups for group '{Group.DisplayName}'", ex);
            }
        }

        /// <summary>
        /// Loads access controls and permissions for this group
        /// </summary>
        private async Task LoadAccessControlsAsync(string profileName)
        {
            try
            {
                LoadingMessage = "Loading access controls...";

                // In a real implementation, you would load from DirectoryRoles.csv, ServicePrincipals.csv, etc.
                // For now, create placeholder data
                await System.Windows.Application.Current.Dispatcher.InvokeAsync(() =>
                {
                    AccessControls.Clear();
                    // TODO: Implement access control loading based on actual CSV structure
                });

                _ = EnhancedLoggingService.Instance.LogInformationAsync($"SecurityGroupDetailViewModel.LoadAccessControlsAsync: Loaded access controls for group '{Group.DisplayName}'");
            }
            catch (Exception ex)
            {
                _ = EnhancedLoggingService.Instance.LogErrorAsync($"SecurityGroupDetailViewModel.LoadAccessControlsAsync: Error loading access controls for group '{Group.DisplayName}'", ex);
            }
        }

        /// <summary>
        /// Loads migration notes for this group
        /// </summary>
        private async Task LoadMigrationNotesAsync(string profileName)
        {
            try
            {
                LoadingMessage = "Loading migration notes...";

                var notesPath = GetNotesFilePath(profileName);
                if (!File.Exists(notesPath))
                {
                    return;
                }

                var notesJson = await File.ReadAllTextAsync(notesPath);
                var allNotes = JsonConvert.DeserializeObject<Dictionary<string, List<RelationshipNote>>>(notesJson) ?? new Dictionary<string, List<RelationshipNote>>();
                
                var groupKey = $"Group_{Group.Id}_{Group.DisplayName}";
                var groupNotes = allNotes.ContainsKey(groupKey) ? allNotes[groupKey] : new List<RelationshipNote>();

                await System.Windows.Application.Current.Dispatcher.InvokeAsync(() =>
                {
                    MigrationNotes.Clear();
                    foreach (var note in groupNotes)
                    {
                        MigrationNotes.Add(note);
                    }
                });

                _ = EnhancedLoggingService.Instance.LogInformationAsync($"SecurityGroupDetailViewModel.LoadMigrationNotesAsync: Loaded {groupNotes.Count} migration notes for group '{Group.DisplayName}'");
            }
            catch (Exception ex)
            {
                _ = EnhancedLoggingService.Instance.LogErrorAsync($"SecurityGroupDetailViewModel.LoadMigrationNotesAsync: Error loading migration notes for group '{Group.DisplayName}'", ex);
            }
        }

        /// <summary>
        /// Determines if an application is linked to a group
        /// </summary>
        private bool IsApplicationLinkedToGroup(ApplicationData app, GroupData group)
        {
            if (app == null || group == null)
                return false;

            // Check if the application has any reference to this group
            // This is a simplified check - actual implementation would depend on CSV structure
            // For now, check if app name contains group name or vice versa
            return !string.IsNullOrEmpty(app.Name) && !string.IsNullOrEmpty(group.DisplayName) &&
                   (app.Name.Contains(group.DisplayName, StringComparison.OrdinalIgnoreCase) ||
                    group.DisplayName.Contains(app.Name, StringComparison.OrdinalIgnoreCase));
        }

        /// <summary>
        /// Determines if an asset is linked to a group
        /// </summary>
        private bool IsAssetLinkedToGroup(InfrastructureData asset, GroupData group)
        {
            if (asset == null || group == null)
                return false;

            // Check if the asset has any reference to this group
            // This is a simplified check - actual implementation would depend on CSV structure
            return asset.Description?.Contains(group.DisplayName, StringComparison.OrdinalIgnoreCase) == true;
        }

        /// <summary>
        /// Determines if a group is nested within another group
        /// </summary>
        private bool IsNestedGroup(GroupData potentialNested, GroupData parent)
        {
            if (potentialNested == null || parent == null)
                return false;

            // This is a simplified check - actual implementation would depend on CSV structure
            // Look for parent/child relationships in the data
            return false; // Placeholder implementation
        }

        /// <summary>
        /// Saves migration notes to disk
        /// </summary>
        private async Task SaveNotesAsync()
        {
            try
            {
                var profileService = SimpleServiceLocator.GetService<IProfileService>();
                var currentProfile = await profileService?.GetCurrentProfileAsync();
                var profileName = currentProfile?.CompanyName ?? "ljpops";

                var notesPath = GetNotesFilePath(profileName);
                var directory = Path.GetDirectoryName(notesPath);
                if (!Directory.Exists(directory))
                {
                    Directory.CreateDirectory(directory);
                }

                // Load existing notes
                var allNotes = new Dictionary<string, List<RelationshipNote>>();
                if (File.Exists(notesPath))
                {
                    var existingJson = await File.ReadAllTextAsync(notesPath);
                    allNotes = JsonConvert.DeserializeObject<Dictionary<string, List<RelationshipNote>>>(existingJson) ?? new Dictionary<string, List<RelationshipNote>>();
                }

                // Update notes for this group
                var groupKey = $"Group_{Group.Id}_{Group.DisplayName}";
                allNotes[groupKey] = MigrationNotes.ToList();

                var notesJson = JsonConvert.SerializeObject(allNotes, Formatting.Indented);
                await File.WriteAllTextAsync(notesPath, notesJson);

                _ = EnhancedLoggingService.Instance.LogInformationAsync($"SecurityGroupDetailViewModel.SaveNotesAsync: Saved {MigrationNotes.Count} migration notes for group '{Group.DisplayName}'");
            }
            catch (Exception ex)
            {
                _ = EnhancedLoggingService.Instance.LogErrorAsync($"SecurityGroupDetailViewModel.SaveNotesAsync: Error saving migration notes for group '{Group.DisplayName}'", ex);
                ErrorMessage = $"Failed to save migration notes: {ex.Message}";
                HasErrors = true;
            }
        }

        /// <summary>
        /// Adds a new migration note
        /// </summary>
        private void AddMigrationNote()
        {
            if (string.IsNullOrWhiteSpace(NewMigrationNote))
                return;

            var note = new RelationshipNote
            {
                Id = Guid.NewGuid().ToString(),
                Note = NewMigrationNote.Trim(),
                CreatedDate = DateTime.Now,
                CreatedBy = Environment.UserName
            };

            MigrationNotes.Add(note);
            NewMigrationNote = string.Empty;

            _ = SaveNotesAsync(); // Auto-save
        }

        /// <summary>
        /// Removes a migration note
        /// </summary>
        private void RemoveMigrationNote(RelationshipNote note)
        {
            if (note == null)
                return;

            MigrationNotes.Remove(note);
            _ = SaveNotesAsync(); // Auto-save
        }

        /// <summary>
        /// Closes the detail view
        /// </summary>
        private void CloseDetail()
        {
            if (_mainViewModel?.OpenTabs != null && _mainViewModel.OpenTabs.Contains(this))
            {
                _mainViewModel.OpenTabs.Remove(this);
            }
        }

        /// <summary>
        /// Opens user detail view
        /// </summary>
        private void OpenUserDetail(UserData user)
        {
            // Implementation would open user detail view
            _ = EnhancedLoggingService.Instance.LogInformationAsync($"SecurityGroupDetailViewModel.OpenUserDetail: Opening detail for user '{user.DisplayName}'");
        }

        /// <summary>
        /// Opens application detail view
        /// </summary>
        private void OpenApplicationDetail(ApplicationData application)
        {
            // Implementation would open application detail view
            _ = EnhancedLoggingService.Instance.LogInformationAsync($"SecurityGroupDetailViewModel.OpenApplicationDetail: Opening detail for application '{application.Name}'");
        }

        /// <summary>
        /// Opens asset detail view
        /// </summary>
        private void OpenAssetDetail(InfrastructureData asset)
        {
            // Implementation would open asset detail view
            _ = EnhancedLoggingService.Instance.LogInformationAsync($"SecurityGroupDetailViewModel.OpenAssetDetail: Opening detail for asset '{asset.Name}'");
        }

        /// <summary>
        /// Opens nested group detail view
        /// </summary>
        private void OpenNestedGroupDetail(GroupData nestedGroup)
        {
            // Implementation would open nested group detail view
            _ = EnhancedLoggingService.Instance.LogInformationAsync($"SecurityGroupDetailViewModel.OpenNestedGroupDetail: Opening detail for group '{nestedGroup.DisplayName}'");
        }

        /// <summary>
        /// Gets the file path for migration notes
        /// </summary>
        private string GetNotesFilePath(string profileName)
        {
            return Path.Combine(@"C:\DiscoveryData", profileName, "Notes.json");
        }

        #endregion

        #region Computed Properties

        public string RelationshipsSummary
        {
            get
            {
                var parts = new List<string>();
                if (Members.Count > 0) parts.Add($"{Members.Count} members");
                if (Owners.Count > 0) parts.Add($"{Owners.Count} owners");
                if (LinkedApplications.Count > 0) parts.Add($"{LinkedApplications.Count} applications");
                if (LinkedAssets.Count > 0) parts.Add($"{LinkedAssets.Count} assets");
                if (NestedGroups.Count > 0) parts.Add($"{NestedGroups.Count} nested groups");
                if (AccessControls.Count > 0) parts.Add($"{AccessControls.Count} access controls");

                return parts.Count > 0 ? string.Join(" • ", parts) : "No relationships found";
            }
        }

        #endregion
    }
}