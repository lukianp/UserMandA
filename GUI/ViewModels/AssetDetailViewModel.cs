using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using System.Windows.Input;
using CommunityToolkit.Mvvm.Input;
using MandADiscoverySuite.Collections;
using MandADiscoverySuite.Models;
using MandADiscoverySuite.Services;
using Newtonsoft.Json;

namespace MandADiscoverySuite.ViewModels
{
    /// <summary>
    /// ViewModel for detailed asset information and relationships
    /// </summary>
    public class AssetDetailViewModel : BaseViewModel
    {
        private readonly CsvDataService _csvDataService;
        private readonly MainViewModel _mainViewModel;

        #region Private Fields

        private InfrastructureData _asset;
        private OptimizedObservableCollection<UserData> _relatedUsers;
        private OptimizedObservableCollection<ApplicationData> _installedOrLinkedApplications;
        private OptimizedObservableCollection<GroupData> _linkedSecurityGroups;
        private OptimizedObservableCollection<InfrastructureData> _childAssets;
        private OptimizedObservableCollection<PolicyData> _accessControls;
        private OptimizedObservableCollection<RelationshipNote> _migrationNotes;
        private bool _isLoading;
        private string _loadingMessage = "Ready";
        private bool _hasErrors;
        private string _errorMessage;
        private string _newMigrationNote;

        #endregion

        #region Properties

        /// <summary>
        /// The asset being viewed in detail
        /// </summary>
        public InfrastructureData Asset
        {
            get => _asset;
            set => SetProperty(ref _asset, value);
        }

        /// <summary>
        /// Users related to this asset (owners, primary users, administrators)
        /// </summary>
        public OptimizedObservableCollection<UserData> RelatedUsers
        {
            get => _relatedUsers;
            set => SetProperty(ref _relatedUsers, value);
        }

        /// <summary>
        /// Applications installed on or linked to this asset
        /// </summary>
        public OptimizedObservableCollection<ApplicationData> InstalledOrLinkedApplications
        {
            get => _installedOrLinkedApplications;
            set => SetProperty(ref _installedOrLinkedApplications, value);
        }

        /// <summary>
        /// Security groups linked to this asset
        /// </summary>
        public OptimizedObservableCollection<GroupData> LinkedSecurityGroups
        {
            get => _linkedSecurityGroups;
            set => SetProperty(ref _linkedSecurityGroups, value);
        }

        /// <summary>
        /// Child assets (e.g., VMs on a host, certificates on a server)
        /// </summary>
        public OptimizedObservableCollection<InfrastructureData> ChildAssets
        {
            get => _childAssets;
            set => SetProperty(ref _childAssets, value);
        }

        /// <summary>
        /// Access controls and policies for this asset
        /// </summary>
        public OptimizedObservableCollection<PolicyData> AccessControls
        {
            get => _accessControls;
            set => SetProperty(ref _accessControls, value);
        }

        /// <summary>
        /// Migration planning notes for this asset
        /// </summary>
        public OptimizedObservableCollection<RelationshipNote> MigrationNotes
        {
            get => _migrationNotes;
            set => SetProperty(ref _migrationNotes, value);
        }

        /// <summary>
        /// Whether data is currently loading
        /// </summary>
        public new bool IsLoading
        {
            get => _isLoading;
            set => SetProperty(ref _isLoading, value);
        }

        /// <summary>
        /// Loading progress message
        /// </summary>
        public new string LoadingMessage
        {
            get => _loadingMessage;
            set => SetProperty(ref _loadingMessage, value);
        }

        /// <summary>
        /// Whether there are errors
        /// </summary>
        public new bool HasErrors
        {
            get => _hasErrors;
            set => SetProperty(ref _hasErrors, value);
        }

        /// <summary>
        /// Error message if any
        /// </summary>
        public new string ErrorMessage
        {
            get => _errorMessage;
            set => SetProperty(ref _errorMessage, value);
        }

        /// <summary>
        /// New migration note text input
        /// </summary>
        public string NewMigrationNote
        {
            get => _newMigrationNote;
            set => SetProperty(ref _newMigrationNote, value);
        }

        /// <summary>
        /// Summary information about relationships
        /// </summary>
        public string RelationshipsSummary =>
            $"Users: {RelatedUsers?.Count ?? 0} | " +
            $"Applications: {InstalledOrLinkedApplications?.Count ?? 0} | " +
            $"Groups: {LinkedSecurityGroups?.Count ?? 0} | " +
            $"Child Assets: {ChildAssets?.Count ?? 0} | " +
            $"Access Controls: {AccessControls?.Count ?? 0}";

        #endregion

        #region Commands

        public ICommand LoadAssetDetailCommand { get; }
        public ICommand SaveNotesCommand { get; }
        public ICommand AddMigrationNoteCommand { get; }
        public ICommand RemoveMigrationNoteCommand { get; }
        public ICommand CloseDetailCommand { get; }
        public ICommand OpenUserDetailCommand { get; }
        public ICommand OpenApplicationDetailCommand { get; }
        public ICommand OpenGroupDetailCommand { get; }
        public ICommand OpenChildAssetDetailCommand { get; }

        #endregion

        #region Constructor

        public AssetDetailViewModel(InfrastructureData asset, CsvDataService csvDataService, MainViewModel mainViewModel)
        {
            Asset = asset ?? throw new ArgumentNullException(nameof(asset));
            _csvDataService = csvDataService ?? throw new ArgumentNullException(nameof(csvDataService));
            _mainViewModel = mainViewModel ?? throw new ArgumentNullException(nameof(mainViewModel));

            // Initialize collections
            RelatedUsers = new OptimizedObservableCollection<UserData>();
            InstalledOrLinkedApplications = new OptimizedObservableCollection<ApplicationData>();
            LinkedSecurityGroups = new OptimizedObservableCollection<GroupData>();
            ChildAssets = new OptimizedObservableCollection<InfrastructureData>();
            AccessControls = new OptimizedObservableCollection<PolicyData>();
            MigrationNotes = new OptimizedObservableCollection<RelationshipNote>();

            // Initialize commands
            LoadAssetDetailCommand = new AsyncRelayCommand(LoadAsync);
            SaveNotesCommand = new AsyncRelayCommand(SaveNotesAsync);
            AddMigrationNoteCommand = new RelayCommand(AddMigrationNote, () => !string.IsNullOrWhiteSpace(NewMigrationNote));
            RemoveMigrationNoteCommand = new RelayCommand<RelationshipNote>(RemoveMigrationNote, note => note != null);
            CloseDetailCommand = new RelayCommand(CloseDetail);
            OpenUserDetailCommand = new RelayCommand<UserData>(OpenUserDetail, user => user != null);
            OpenApplicationDetailCommand = new RelayCommand<ApplicationData>(OpenApplicationDetail, app => app != null);
            OpenGroupDetailCommand = new RelayCommand<GroupData>(OpenGroupDetail, group => group != null);
            OpenChildAssetDetailCommand = new RelayCommand<InfrastructureData>(OpenChildAssetDetail, childAsset => childAsset != null);

            // Auto-load data
            _ = LoadAsync();

            _ = EnhancedLoggingService.Instance.LogInformationAsync($"AssetDetailViewModel created for asset: {Asset.Name}");
        }

        #endregion

        #region Methods

        /// <summary>
        /// Loads detailed asset information and relationships
        /// </summary>
        public async Task LoadAsync()
        {
            try
            {
                IsLoading = true;
                HasErrors = false;
                ErrorMessage = null;
                LoadingMessage = "Loading asset relationships...";

                // Get current profile
                var profileService = SimpleServiceLocator.GetService<IProfileService>();
                var currentProfile = await profileService?.GetCurrentProfileAsync();
                var profileName = currentProfile?.CompanyName ?? "ljpops";

                _ = EnhancedLoggingService.Instance.LogInformationAsync($"AssetDetailViewModel.LoadAsync: Loading relationships for asset '{Asset.Name}' in profile '{profileName}'");

                // Load all relationship data in parallel
                await Task.Run(async () =>
                {
                    var tasks = new List<Task>
                    {
                        FindRelatedUsersAsync(profileName),
                        FindLinkedApplicationsAsync(profileName),
                        FindLinkedSecurityGroupsAsync(profileName),
                        FindChildAssetsAsync(profileName),
                        FindAccessControlsAsync(profileName),
                        LoadMigrationNotesAsync(profileName)
                    };

                    await Task.WhenAll(tasks);
                });

                LoadingMessage = "Asset relationships loaded successfully";
                
                // Notify UI of relationship summary changes
                OnPropertyChanged(nameof(RelationshipsSummary));

                _ = EnhancedLoggingService.Instance.LogInformationAsync($"AssetDetailViewModel.LoadAsync: Successfully loaded relationships for asset '{Asset.Name}'");
            }
            catch (Exception ex)
            {
                _ = EnhancedLoggingService.Instance.LogErrorAsync($"AssetDetailViewModel.LoadAsync: Error loading asset '{Asset?.Name}' relationships", ex);
                ErrorMessage = $"Failed to load asset relationships: {ex.Message}";
                HasErrors = true;
                LoadingMessage = "Failed to load relationships";
            }
            finally
            {
                IsLoading = false;
            }
        }

        /// <summary>
        /// Finds users related to this asset
        /// </summary>
        private async Task FindRelatedUsersAsync(string profileName)
        {
            try
            {
                LoadingMessage = "Finding related users...";
                var users = await _csvDataService.LoadUsersAsync(profileName);
                
                var relatedUsers = users.Where(user => 
                    IsUserRelatedToAsset(user, Asset)).ToList();

                await System.Windows.Application.Current.Dispatcher.InvokeAsync(() =>
                {
                    RelatedUsers.Clear();
                    foreach (var user in relatedUsers)
                    {
                        RelatedUsers.Add(user);
                    }
                });

                _ = EnhancedLoggingService.Instance.LogInformationAsync($"AssetDetailViewModel.FindRelatedUsersAsync: Found {relatedUsers.Count} related users for asset '{Asset.Name}'");
            }
            catch (Exception ex)
            {
                _ = EnhancedLoggingService.Instance.LogErrorAsync($"AssetDetailViewModel.FindRelatedUsersAsync: Error finding users for asset '{Asset.Name}'", ex);
            }
        }

        /// <summary>
        /// Finds applications linked to this asset
        /// </summary>
        private async Task FindLinkedApplicationsAsync(string profileName)
        {
            try
            {
                LoadingMessage = "Finding linked applications...";
                var applications = await _csvDataService.LoadApplicationsAsync(profileName);
                
                var linkedApps = applications.Where(app => 
                    IsApplicationLinkedToAsset(app, Asset)).ToList();

                await System.Windows.Application.Current.Dispatcher.InvokeAsync(() =>
                {
                    InstalledOrLinkedApplications.Clear();
                    foreach (var app in linkedApps)
                    {
                        InstalledOrLinkedApplications.Add(app);
                    }
                });

                _ = EnhancedLoggingService.Instance.LogInformationAsync($"AssetDetailViewModel.FindLinkedApplicationsAsync: Found {linkedApps.Count} linked applications for asset '{Asset.Name}'");
            }
            catch (Exception ex)
            {
                _ = EnhancedLoggingService.Instance.LogErrorAsync($"AssetDetailViewModel.FindLinkedApplicationsAsync: Error finding applications for asset '{Asset.Name}'", ex);
            }
        }

        /// <summary>
        /// Finds security groups linked to this asset
        /// </summary>
        private async Task FindLinkedSecurityGroupsAsync(string profileName)
        {
            try
            {
                LoadingMessage = "Finding linked security groups...";
                var groups = await _csvDataService.LoadGroupsAsync(profileName);
                
                var linkedGroups = groups.Where(group => 
                    IsGroupLinkedToAsset(group, Asset)).ToList();

                await System.Windows.Application.Current.Dispatcher.InvokeAsync(() =>
                {
                    LinkedSecurityGroups.Clear();
                    foreach (var group in linkedGroups)
                    {
                        LinkedSecurityGroups.Add(group);
                    }
                });

                _ = EnhancedLoggingService.Instance.LogInformationAsync($"AssetDetailViewModel.FindLinkedSecurityGroupsAsync: Found {linkedGroups.Count} linked groups for asset '{Asset.Name}'");
            }
            catch (Exception ex)
            {
                _ = EnhancedLoggingService.Instance.LogErrorAsync($"AssetDetailViewModel.FindLinkedSecurityGroupsAsync: Error finding groups for asset '{Asset.Name}'", ex);
            }
        }

        /// <summary>
        /// Finds child assets (e.g., VMs on a host, certificates on a server)
        /// </summary>
        private async Task FindChildAssetsAsync(string profileName)
        {
            try
            {
                LoadingMessage = "Finding child assets...";
                var allAssets = await _csvDataService.LoadInfrastructureAsync(profileName);
                
                var childAssets = allAssets.Where(asset => 
                    IsChildAsset(asset, Asset)).ToList();

                await System.Windows.Application.Current.Dispatcher.InvokeAsync(() =>
                {
                    ChildAssets.Clear();
                    foreach (var child in childAssets)
                    {
                        ChildAssets.Add(child);
                    }
                });

                _ = EnhancedLoggingService.Instance.LogInformationAsync($"AssetDetailViewModel.FindChildAssetsAsync: Found {childAssets.Count} child assets for asset '{Asset.Name}'");
            }
            catch (Exception ex)
            {
                _ = EnhancedLoggingService.Instance.LogErrorAsync($"AssetDetailViewModel.FindChildAssetsAsync: Error finding child assets for asset '{Asset.Name}'", ex);
            }
        }

        /// <summary>
        /// Finds access controls and policies for this asset
        /// </summary>
        private async Task FindAccessControlsAsync(string profileName)
        {
            try
            {
                LoadingMessage = "Finding access controls...";
                
                // Create PolicyData objects for access controls found in various CSV files
                var accessControls = new List<PolicyData>();

                // This would typically scan ServicePrincipals.csv, DirectoryRoles.csv, etc.
                // For now, create sample data to demonstrate the concept
                
                await System.Windows.Application.Current.Dispatcher.InvokeAsync(() =>
                {
                    AccessControls.Clear();
                    foreach (var policy in accessControls)
                    {
                        AccessControls.Add(policy);
                    }
                });

                _ = EnhancedLoggingService.Instance.LogInformationAsync($"AssetDetailViewModel.FindAccessControlsAsync: Found {accessControls.Count} access controls for asset '{Asset.Name}'");
            }
            catch (Exception ex)
            {
                _ = EnhancedLoggingService.Instance.LogErrorAsync($"AssetDetailViewModel.FindAccessControlsAsync: Error finding access controls for asset '{Asset.Name}'", ex);
            }
        }

        /// <summary>
        /// Loads migration notes for this asset
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
                
                var assetKey = $"Asset_{Asset.Id}_{Asset.Name}";
                var assetNotes = allNotes.ContainsKey(assetKey) ? allNotes[assetKey] : new List<RelationshipNote>();

                await System.Windows.Application.Current.Dispatcher.InvokeAsync(() =>
                {
                    MigrationNotes.Clear();
                    foreach (var note in assetNotes)
                    {
                        MigrationNotes.Add(note);
                    }
                });

                _ = EnhancedLoggingService.Instance.LogInformationAsync($"AssetDetailViewModel.LoadMigrationNotesAsync: Loaded {assetNotes.Count} migration notes for asset '{Asset.Name}'");
            }
            catch (Exception ex)
            {
                _ = EnhancedLoggingService.Instance.LogErrorAsync($"AssetDetailViewModel.LoadMigrationNotesAsync: Error loading migration notes for asset '{Asset.Name}'", ex);
            }
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

                // Update notes for this asset
                var assetKey = $"Asset_{Asset.Id}_{Asset.Name}";
                allNotes[assetKey] = MigrationNotes.ToList();

                // Save back to disk
                var notesJson = JsonConvert.SerializeObject(allNotes, Formatting.Indented);
                await File.WriteAllTextAsync(notesPath, notesJson);

                _ = EnhancedLoggingService.Instance.LogInformationAsync($"AssetDetailViewModel.SaveNotesAsync: Saved {MigrationNotes.Count} migration notes for asset '{Asset.Name}'");
            }
            catch (Exception ex)
            {
                _ = EnhancedLoggingService.Instance.LogErrorAsync($"AssetDetailViewModel.SaveNotesAsync: Error saving migration notes for asset '{Asset.Name}'", ex);
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
            _ = EnhancedLoggingService.Instance.LogInformationAsync($"AssetDetailViewModel.OpenUserDetail: Opening detail for user '{user.DisplayName}'");
        }

        /// <summary>
        /// Opens application detail view
        /// </summary>
        private void OpenApplicationDetail(ApplicationData app)
        {
            // Implementation would open application detail view
            _ = EnhancedLoggingService.Instance.LogInformationAsync($"AssetDetailViewModel.OpenApplicationDetail: Opening detail for application '{app.Name}'");
        }

        /// <summary>
        /// Opens group detail view
        /// </summary>
        private void OpenGroupDetail(GroupData group)
        {
            // Implementation would open group detail view
            _ = EnhancedLoggingService.Instance.LogInformationAsync($"AssetDetailViewModel.OpenGroupDetail: Opening detail for group '{group.Name}'");
        }

        /// <summary>
        /// Opens child asset detail view
        /// </summary>
        private void OpenChildAssetDetail(InfrastructureData childAsset)
        {
            var detailViewModel = new AssetDetailViewModel(childAsset, _csvDataService, _mainViewModel);
            detailViewModel.TabTitle = $"Asset: {childAsset.Name}";
            
            _mainViewModel.OpenTabs.Add(detailViewModel);
            _mainViewModel.SelectedTab = detailViewModel;
        }

        #endregion

        #region Helper Methods

        /// <summary>
        /// Determines if a user is related to an asset
        /// </summary>
        private bool IsUserRelatedToAsset(UserData user, InfrastructureData asset)
        {
            if (user == null || asset == null)
                return false;

            // For now, use a simple heuristic - in real scenarios, this would
            // be based on actual CSV data relationships or a separate mapping file
            // Check if user's SAM account name or UPN contains any part of the asset name
            var assetNameParts = asset.Name?.Split(new[] { '.', '-', '_' }, StringSplitOptions.RemoveEmptyEntries) ?? new string[0];
            
            return assetNameParts.Any(part => 
                user.SamAccountName?.Contains(part, StringComparison.OrdinalIgnoreCase) == true ||
                user.UserPrincipalName?.Contains(part, StringComparison.OrdinalIgnoreCase) == true);
        }

        /// <summary>
        /// Determines if an application is linked to an asset
        /// </summary>
        private bool IsApplicationLinkedToAsset(ApplicationData app, InfrastructureData asset)
        {
            if (app == null || asset == null)
                return false;

            // Check if application's install location contains asset identifiers
            var assetIdentifiers = new[] { asset.Name, asset.IPAddress, asset.Id }.Where(id => !string.IsNullOrEmpty(id));
            
            return assetIdentifiers.Any(id => 
                app.InstallLocation?.Contains(id, StringComparison.OrdinalIgnoreCase) == true);
        }

        /// <summary>
        /// Determines if a group is linked to an asset
        /// </summary>
        private bool IsGroupLinkedToAsset(GroupData group, InfrastructureData asset)
        {
            if (group == null || asset == null)
                return false;

            // For now, link computer/device-related groups to assets
            // In real scenarios, this would be based on actual membership data
            var assetType = asset.Type?.ToLower() ?? "";
            var groupName = group.Name?.ToLower() ?? "";
            
            return (assetType.Contains("server") && groupName.Contains("server")) ||
                   (assetType.Contains("computer") && groupName.Contains("computer")) ||
                   (assetType.Contains("device") && groupName.Contains("device"));
        }

        /// <summary>
        /// Determines if an asset is a child of another asset
        /// </summary>
        private bool IsChildAsset(InfrastructureData potentialChild, InfrastructureData parent)
        {
            if (potentialChild == null || parent == null || potentialChild.Id == parent.Id)
                return false;

            // Check if the location contains parent's name (simplified check)
            var parentName = parent.Name?.ToLower() ?? "";
            var childLocation = potentialChild.Location?.ToLower() ?? "";
            
            // Check type relationships and location containment
            if (!string.IsNullOrEmpty(parentName) && childLocation.Contains(parentName))
            {
                // Also check type relationships
                if ((parent.Type == "Physical Server" && potentialChild.Type == "Virtual Machine") ||
                    (parent.Type == "VMware" && potentialChild.Type == "Virtual Machine") ||
                    (parent.Type?.Contains("Server") == true && potentialChild.Type == "Certificate"))
                {
                    return true;
                }
            }
            
            return false;
        }

        /// <summary>
        /// Gets the file path for migration notes
        /// </summary>
        private string GetNotesFilePath(string profileName)
        {
            var rootPath = ConfigurationService.Instance.DiscoveryDataRootPath;
            return Path.Combine(rootPath, profileName, "Notes.json");
        }

        #endregion
    }

    /// <summary>
    /// Represents a migration planning note
    /// </summary>
    public class RelationshipNote
    {
        public string Id { get; set; }
        public string Note { get; set; }
        public DateTime CreatedDate { get; set; }
        public string CreatedBy { get; set; }
        public string Category { get; set; } = "Migration";
        public string Priority { get; set; } = "Medium";
    }

}