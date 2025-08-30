using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.ComponentModel;
using System.Linq;
using System.Threading.Tasks;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Data;
using System.Windows.Input;
using Microsoft.Extensions.Logging;
using MandADiscoverySuite.Models;
using MandADiscoverySuite.Services;
using MandADiscoverySuite.Extensions;

namespace MandADiscoverySuite.ViewModels
{
    /// <summary>
    /// Detailed mapping interface with user and group mapping capabilities
    /// </summary>
    public class MigrationMappingViewModel : BaseViewModel
    {
        #region Private Fields
        private readonly ILogger<MigrationMappingViewModel> _logger;
        private readonly MigrationDataService _migrationDataService;
        private readonly DiscoveryService _discoveryService;
        private readonly ProfileService _profileService;
        
        // Profile and Data
        private string _selectedProfile;
        private ComprehensiveDataLoadResult _discoveryData;
        private bool _isLoadingMappings;
        private string _mappingStatus = "Select a profile to begin mapping";
        
        // User Mapping
        private ObservableCollection<UserMapping> _userMappings;
        private UserMapping _selectedUserMapping;
        private ObservableCollection<UserMapping> _conflictingUserMappings;
        private string _userSearchText;
        private bool _showOnlyConflicts;
        private bool _showOnlyUnmapped;
        
        // Group Remapping
        private ObservableCollection<GroupMapping> _groupMappings;
        private GroupMapping _selectedGroupMapping;
        private ObservableCollection<GroupMapping> _conflictingGroupMappings;
        private string _groupSearchText;
        private ObservableCollection<GroupRemappingRule> _namingConventionRules;
        private string _newConventionName;
        private string _conventionPattern;
        private NamingConventionType _selectedConventionType = NamingConventionType.Prefix;
        
        // Resource Mapping
        private ObservableCollection<ResourceMapping> _resourceMappings;
        private ResourceMapping _selectedResourceMapping;
        private string _resourceSearchText;
        private ResourceMappingType? _selectedResourceTypeFilter;
        
        // Conflict Resolution
        private ObservableCollection<MappingConflict> _mappingConflicts;
        private MappingConflict _selectedConflict;
        private ConflictResolutionStrategy _selectedResolutionStrategy = ConflictResolutionStrategy.SkipConflict;
        private string _customResolutionValue;
        
        // Validation and Preview
        private ObservableCollection<MappingValidationResult> _validationResults;
        private bool _isValidationRunning;
        private int _totalMappings;
        private int _validMappings;
        private int _conflictedMappings;
        private int _unmappedItems;
        
        // Collection Views
        private ICollectionView _userMappingsView;
        private ICollectionView _groupMappingsView;
        private ICollectionView _resourceMappingsView;
        private ICollectionView _conflictsView;
        #endregion
        
        #region Constructor
        public MigrationMappingViewModel(ILogger<MigrationMappingViewModel> logger = null) : base(logger)
        {
            _logger = logger;
            _migrationDataService = new MigrationDataService();
            _discoveryService = new DiscoveryService();
            _profileService = new ProfileService();
            
            InitializeCollections();
            InitializeCommands();
            InitializeCollectionViews();
            
            TabTitle = "Migration Mapping";
        }
        #endregion
        
        #region Properties
        
        // Profile Selection
        public ObservableCollection<string> AvailableProfiles { get; private set; }
        
        public string SelectedProfile
        {
            get => _selectedProfile;
            set
            {
                if (SetProperty(ref _selectedProfile, value))
                {
                    _ = LoadMappingDataAsync();
                }
            }
        }
        
        public bool IsLoadingMappings
        {
            get => _isLoadingMappings;
            set => SetProperty(ref _isLoadingMappings, value);
        }
        
        public string MappingStatusMessage
        {
            get => _mappingStatus;
            set => SetProperty(ref _mappingStatus, value);
        }
        
        // User Mapping Properties
        public ObservableCollection<UserMapping> UserMappings
        {
            get => _userMappings;
            set => SetProperty(ref _userMappings, value);
        }
        
        public UserMapping SelectedUserMapping
        {
            get => _selectedUserMapping;
            set => SetProperty(ref _selectedUserMapping, value);
        }
        
        public ObservableCollection<UserMapping> ConflictingUserMappings
        {
            get => _conflictingUserMappings;
            set => SetProperty(ref _conflictingUserMappings, value);
        }
        
        public string UserSearchText
        {
            get => _userSearchText;
            set
            {
                if (SetProperty(ref _userSearchText, value))
                {
                    UserMappingsView?.Refresh();
                }
            }
        }
        
        public bool ShowOnlyConflicts
        {
            get => _showOnlyConflicts;
            set
            {
                if (SetProperty(ref _showOnlyConflicts, value))
                {
                    UserMappingsView?.Refresh();
                    GroupMappingsView?.Refresh();
                }
            }
        }
        
        public bool ShowOnlyUnmapped
        {
            get => _showOnlyUnmapped;
            set
            {
                if (SetProperty(ref _showOnlyUnmapped, value))
                {
                    UserMappingsView?.Refresh();
                    GroupMappingsView?.Refresh();
                }
            }
        }
        
        // Group Mapping Properties
        public ObservableCollection<GroupMapping> GroupMappings
        {
            get => _groupMappings;
            set => SetProperty(ref _groupMappings, value);
        }
        
        public GroupMapping SelectedGroupMapping
        {
            get => _selectedGroupMapping;
            set => SetProperty(ref _selectedGroupMapping, value);
        }
        
        public ObservableCollection<GroupMapping> ConflictingGroupMappings
        {
            get => _conflictingGroupMappings;
            set => SetProperty(ref _conflictingGroupMappings, value);
        }
        
        public string GroupSearchText
        {
            get => _groupSearchText;
            set
            {
                if (SetProperty(ref _groupSearchText, value))
                {
                    GroupMappingsView?.Refresh();
                }
            }
        }
        
        public ObservableCollection<GroupRemappingRule> NamingConventionRules
        {
            get => _namingConventionRules;
            set => SetProperty(ref _namingConventionRules, value);
        }
        
        public string NewConventionName
        {
            get => _newConventionName;
            set => SetProperty(ref _newConventionName, value);
        }
        
        public string ConventionPattern
        {
            get => _conventionPattern;
            set => SetProperty(ref _conventionPattern, value);
        }
        
        public NamingConventionType SelectedConventionType
        {
            get => _selectedConventionType;
            set => SetProperty(ref _selectedConventionType, value);
        }
        
        // Resource Mapping Properties
        public ObservableCollection<ResourceMapping> ResourceMappings
        {
            get => _resourceMappings;
            set => SetProperty(ref _resourceMappings, value);
        }
        
        public ResourceMapping SelectedResourceMapping
        {
            get => _selectedResourceMapping;
            set => SetProperty(ref _selectedResourceMapping, value);
        }
        
        public string ResourceSearchText
        {
            get => _resourceSearchText;
            set
            {
                if (SetProperty(ref _resourceSearchText, value))
                {
                    ResourceMappingsView?.Refresh();
                }
            }
        }
        
        public ResourceMappingType? SelectedResourceTypeFilter
        {
            get => _selectedResourceTypeFilter;
            set
            {
                if (SetProperty(ref _selectedResourceTypeFilter, value))
                {
                    ResourceMappingsView?.Refresh();
                }
            }
        }
        
        // Conflict Resolution Properties
        public ObservableCollection<MappingConflict> MappingConflicts
        {
            get => _mappingConflicts;
            set => SetProperty(ref _mappingConflicts, value);
        }
        
        public MappingConflict SelectedConflict
        {
            get => _selectedConflict;
            set => SetProperty(ref _selectedConflict, value);
        }
        
        public ConflictResolutionStrategy SelectedResolutionStrategy
        {
            get => _selectedResolutionStrategy;
            set => SetProperty(ref _selectedResolutionStrategy, value);
        }
        
        public string CustomResolutionValue
        {
            get => _customResolutionValue;
            set => SetProperty(ref _customResolutionValue, value);
        }
        
        // Validation Properties
        public ObservableCollection<MappingValidationResult> ValidationResults
        {
            get => _validationResults;
            set => SetProperty(ref _validationResults, value);
        }
        
        public bool IsValidationRunning
        {
            get => _isValidationRunning;
            set => SetProperty(ref _isValidationRunning, value);
        }
        
        public int TotalMappings
        {
            get => _totalMappings;
            set => SetProperty(ref _totalMappings, value);
        }
        
        public int ValidMappings
        {
            get => _validMappings;
            set => SetProperty(ref _validMappings, value);
        }
        
        public int ConflictedMappings
        {
            get => _conflictedMappings;
            set => SetProperty(ref _conflictedMappings, value);
        }
        
        public int UnmappedItems
        {
            get => _unmappedItems;
            set => SetProperty(ref _unmappedItems, value);
        }
        
        // Collection Views
        public ICollectionView UserMappingsView
        {
            get => _userMappingsView;
            private set => SetProperty(ref _userMappingsView, value);
        }
        
        public ICollectionView GroupMappingsView
        {
            get => _groupMappingsView;
            private set => SetProperty(ref _groupMappingsView, value);
        }
        
        public ICollectionView ResourceMappingsView
        {
            get => _resourceMappingsView;
            private set => SetProperty(ref _resourceMappingsView, value);
        }
        
        public ICollectionView ConflictsView
        {
            get => _conflictsView;
            private set => SetProperty(ref _conflictsView, value);
        }
        
        // Enumerations for UI Binding
        public Array NamingConventionTypes => Enum.GetValues(typeof(NamingConventionType));
        public Array ResourceMappingTypes => Enum.GetValues(typeof(ResourceMappingType));
        public Array ConflictResolutionStrategies => Enum.GetValues(typeof(ConflictResolutionStrategy));
        #endregion
        
        #region Commands
        public ICommand LoadMappingDataCommand { get; private set; }
        public ICommand AutoMapUsersCommand { get; private set; }
        public ICommand AutoMapGroupsCommand { get; private set; }
        public ICommand ClearUserMappingCommand { get; private set; }
        public ICommand ClearGroupMappingCommand { get; private set; }
        public ICommand AddNamingConventionCommand { get; private set; }
        public ICommand DeleteNamingConventionCommand { get; private set; }
        public ICommand ApplyNamingConventionsCommand { get; private set; }
        public ICommand ValidateMappingsCommand { get; private set; }
        public ICommand ResolveConflictCommand { get; private set; }
        public ICommand ResolveAllConflictsCommand { get; private set; }
        public ICommand ExportMappingsCommand { get; private set; }
        public ICommand ImportMappingsCommand { get; private set; }
        public ICommand PreviewMappingsCommand { get; private set; }
        #endregion
        
        #region Private Methods
        private void InitializeCollections()
        {
            AvailableProfiles = new ObservableCollection<string>();
            UserMappings = new ObservableCollection<UserMapping>();
            ConflictingUserMappings = new ObservableCollection<UserMapping>();
            GroupMappings = new ObservableCollection<GroupMapping>();
            ConflictingGroupMappings = new ObservableCollection<GroupMapping>();
            ResourceMappings = new ObservableCollection<ResourceMapping>();
            MappingConflicts = new ObservableCollection<MappingConflict>();
            ValidationResults = new ObservableCollection<MappingValidationResult>();
            NamingConventionRules = new ObservableCollection<GroupRemappingRule>();
            
            LoadAvailableProfiles();
        }
        
        private new void InitializeCommands()
        {
            LoadMappingDataCommand = new AsyncRelayCommand(LoadMappingDataAsync);
            AutoMapUsersCommand = new AsyncRelayCommand(AutoMapUsersAsync);
            AutoMapGroupsCommand = new AsyncRelayCommand(AutoMapGroupsAsync);
            ClearUserMappingCommand = new RelayCommand<UserMapping>(ClearUserMapping);
            ClearGroupMappingCommand = new RelayCommand<GroupMapping>(ClearGroupMapping);
            AddNamingConventionCommand = new RelayCommand(AddNamingConvention);
            DeleteNamingConventionCommand = new RelayCommand<GroupRemappingRule>(DeleteNamingConvention);
            ApplyNamingConventionsCommand = new AsyncRelayCommand(ApplyNamingConventionsAsync);
            ValidateMappingsCommand = new AsyncRelayCommand(ValidateMappingsAsync);
            ResolveConflictCommand = new RelayCommand<MappingConflict>(ResolveConflict);
            ResolveAllConflictsCommand = new AsyncRelayCommand(ResolveAllConflictsAsync);
            ExportMappingsCommand = new AsyncRelayCommand(ExportMappingsAsync);
            ImportMappingsCommand = new AsyncRelayCommand(ImportMappingsAsync);
            PreviewMappingsCommand = new AsyncRelayCommand(PreviewMappingsAsync);
        }
        
        private void InitializeCollectionViews()
        {
            UserMappingsView = CollectionViewSource.GetDefaultView(UserMappings);
            UserMappingsView.Filter = FilterUserMappings;
            
            GroupMappingsView = CollectionViewSource.GetDefaultView(GroupMappings);
            GroupMappingsView.Filter = FilterGroupMappings;
            
            ResourceMappingsView = CollectionViewSource.GetDefaultView(ResourceMappings);
            ResourceMappingsView.Filter = FilterResourceMappings;
            
            ConflictsView = CollectionViewSource.GetDefaultView(MappingConflicts);
        }
        
        private async void LoadAvailableProfiles()
        {
            try
            {
                var profiles = await _profileService.GetAvailableProfilesAsync();
                AvailableProfiles.Clear();
                
                foreach (var profile in profiles)
                {
                    AvailableProfiles.Add(profile);
                }
                
                if (AvailableProfiles.Any())
                {
                    SelectedProfile = AvailableProfiles.First();
                }
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error loading available profiles");
                HasErrors = true;
                ErrorMessage = $"Failed to load profiles: {ex.Message}";
            }
        }
        
        private async Task LoadMappingDataAsync()
        {
            if (string.IsNullOrWhiteSpace(SelectedProfile))
                return;
                
            try
            {
                IsLoadingMappings = true;
                MappingStatusMessage = "Loading discovery data...";
                
                _discoveryData = await _migrationDataService.LoadDiscoveryDataAsync(
                    SelectedProfile,
                    loadUsers: true,
                    loadGroups: true,
                    loadInfrastructure: true,
                    loadApplications: true);
                
                if (_discoveryData.IsSuccess)
                {
                    MappingStatusMessage = "Generating mappings...";
                    GenerateMappings(_discoveryData);
                    
                    MappingStatusMessage = $"Loaded {TotalMappings} mappings";
                    HasData = true;
                }
                else
                {
                    MappingStatusMessage = "Failed to load discovery data";
                    HasErrors = true;
                    ErrorMessage = "Discovery data could not be loaded";
                }
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error loading mapping data");
                HasErrors = true;
                ErrorMessage = $"Mapping data load failed: {ex.Message}";
                MappingStatusMessage = "Mapping data load failed";
            }
            finally
            {
                IsLoadingMappings = false;
            }
        }
        
        private void GenerateMappings(ComprehensiveDataLoadResult data)
        {
            // Clear existing mappings
            UserMappings.Clear();
            GroupMappings.Clear();
            ResourceMappings.Clear();
            MappingConflicts.Clear();
            
            var mappingCount = 0;
            
            // Generate user mappings
            if (data.Users?.Any() == true)
            {
                foreach (var user in data.Users)
                {
                    var mapping = new UserMapping
                    {
                        Id = Guid.NewGuid().ToString(),
                        SourceIdentity = user.UserPrincipalName ?? user.SamAccountName,
                        SourceDisplayName = user.DisplayName,
                        SourceDomain = ExtractDomain(user.UserPrincipalName),
                        TargetIdentity = GenerateTargetUserIdentity(user),
                        TargetDomain = "target.contoso.com", // Default target domain
                        MappingStatus = MappingStatus.Pending,
                        ConflictType = DetectUserConflictType(user),
                        LastModified = DateTime.Now
                    };
                    
                    UserMappings.Add(mapping);
                    mappingCount++;
                }
            }
            
            // Generate group mappings
            if (data.Groups?.Any() == true)
            {
                foreach (var group in data.Groups)
                {
                    var mapping = new GroupMapping
                    {
                        Id = Guid.NewGuid().ToString(),
                        SourceIdentity = group.DisplayName,
                        SourceDisplayName = group.DisplayName,
                        SourceType = group.MailEnabled == true ? "Distribution List" : "Security Group",
                        TargetIdentity = GenerateTargetGroupIdentity(group),
                        TargetDisplayName = GenerateTargetGroupDisplayName(group),
                        MappingStatus = MappingStatus.Pending,
                        ConflictType = DetectGroupConflictType(group),
                        LastModified = DateTime.Now
                    };
                    
                    GroupMappings.Add(mapping);
                    mappingCount++;
                }
            }
            
            // Generate resource mappings
            if (data.Infrastructure?.Any() == true)
            {
                foreach (var infra in data.Infrastructure)
                {
                    var mapping = new ResourceMapping
                    {
                        Id = Guid.NewGuid().ToString(),
                        SourceResource = infra.Name,
                        SourceType = ResourceMappingType.Server,
                        TargetResource = GenerateTargetServerName(infra.Name),
                        MappingStatus = MappingStatus.Pending,
                        ConflictType = ConflictType.None,
                        LastModified = DateTime.Now
                    };
                    
                    ResourceMappings.Add(mapping);
                    mappingCount++;
                }
            }
            
            TotalMappings = mappingCount;
            UpdateMappingStatistics();
        }
        
        private string GenerateTargetUserIdentity(UserData user)
        {
            // Simple domain replacement logic
            if (!string.IsNullOrWhiteSpace(user.UserPrincipalName) && user.UserPrincipalName.Contains("@"))
            {
                var localPart = user.UserPrincipalName.Split('@')[0];
                return $"{localPart}@target.contoso.com";
            }
            
            return user.UserPrincipalName ?? user.SamAccountName;
        }
        
        private string GenerateTargetGroupIdentity(GroupData group)
        {
            // Apply basic naming convention
            return $"MIGRATED_{group.DisplayName}";
        }
        
        private string GenerateTargetGroupDisplayName(GroupData group)
        {
            return GenerateTargetGroupIdentity(group);
        }
        
        private string GenerateTargetServerName(string serverName)
        {
            return $"TGT-{serverName}";
        }
        
        private string ExtractDomain(string userPrincipalName)
        {
            if (string.IsNullOrWhiteSpace(userPrincipalName) || !userPrincipalName.Contains("@"))
                return string.Empty;
                
            return userPrincipalName.Split('@')[1];
        }
        
        private ConflictType DetectUserConflictType(UserData user)
        {
            // Simple conflict detection logic
            if (string.IsNullOrWhiteSpace(user.UserPrincipalName))
                return ConflictType.MissingRequiredField;
                
            if (!user.AccountEnabled)
                return ConflictType.DisabledAccount;
                
            return ConflictType.None;
        }
        
        private ConflictType DetectGroupConflictType(GroupData group)
        {
            if (string.IsNullOrWhiteSpace(group.DisplayName))
                return ConflictType.MissingRequiredField;
                
            return ConflictType.None;
        }
        
        private async Task AutoMapUsersAsync()
        {
            try
            {
                IsLoading = true;
                LoadingMessage = "Auto-mapping users...";
                
                foreach (var userMapping in UserMappings)
                {
                    if (userMapping.MappingStatus == MappingStatus.Pending)
                    {
                        // Auto-generate target identity if not already set
                        if (string.IsNullOrWhiteSpace(userMapping.TargetIdentity))
                        {
                            userMapping.TargetIdentity = GenerateAutoTargetIdentity(userMapping.SourceIdentity);
                        }
                        
                        userMapping.MappingStatus = MappingStatus.Mapped;
                        userMapping.LastModified = DateTime.Now;
                    }
                }
                
                UpdateMappingStatistics();
                UserMappingsView?.Refresh();
                
                MessageBox.Show($"Auto-mapped {UserMappings.Count(u => u.MappingStatus == MappingStatus.Mapped)} users", 
                    "Auto-mapping Complete", MessageBoxButton.OK, MessageBoxImage.Information);
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error auto-mapping users");
                MessageBox.Show($"Auto-mapping failed: {ex.Message}", "Error", 
                    MessageBoxButton.OK, MessageBoxImage.Error);
            }
            finally
            {
                IsLoading = false;
            }
        }
        
        private async Task AutoMapGroupsAsync()
        {
            try
            {
                IsLoading = true;
                LoadingMessage = "Auto-mapping groups...";
                
                foreach (var groupMapping in GroupMappings)
                {
                    if (groupMapping.MappingStatus == MappingStatus.Pending)
                    {
                        // Auto-generate target identity if not already set
                        if (string.IsNullOrWhiteSpace(groupMapping.TargetIdentity))
                        {
                            groupMapping.TargetIdentity = GenerateAutoTargetIdentity(groupMapping.SourceIdentity);
                        }
                        
                        groupMapping.MappingStatus = MappingStatus.Mapped;
                        groupMapping.LastModified = DateTime.Now;
                    }
                }
                
                UpdateMappingStatistics();
                GroupMappingsView?.Refresh();
                
                MessageBox.Show($"Auto-mapped {GroupMappings.Count(g => g.MappingStatus == MappingStatus.Mapped)} groups", 
                    "Auto-mapping Complete", MessageBoxButton.OK, MessageBoxImage.Information);
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error auto-mapping groups");
                MessageBox.Show($"Auto-mapping failed: {ex.Message}", "Error", 
                    MessageBoxButton.OK, MessageBoxImage.Error);
            }
            finally
            {
                IsLoading = false;
            }
        }
        
        private string GenerateAutoTargetIdentity(string sourceIdentity)
        {
            if (string.IsNullOrWhiteSpace(sourceIdentity))
                return string.Empty;
                
            // Simple auto-mapping logic
            if (sourceIdentity.Contains("@"))
            {
                var localPart = sourceIdentity.Split('@')[0];
                return $"{localPart}@target.contoso.com";
            }
            
            return $"TGT_{sourceIdentity}";
        }
        
        private void ClearUserMapping(UserMapping mapping)
        {
            if (mapping != null)
            {
                mapping.TargetIdentity = string.Empty;
                mapping.TargetDomain = string.Empty;
                mapping.MappingStatus = MappingStatus.Pending;
                mapping.LastModified = DateTime.Now;
                
                UpdateMappingStatistics();
                UserMappingsView?.Refresh();
            }
        }
        
        private void ClearGroupMapping(GroupMapping mapping)
        {
            if (mapping != null)
            {
                mapping.TargetIdentity = string.Empty;
                mapping.TargetDisplayName = string.Empty;
                mapping.MappingStatus = MappingStatus.Pending;
                mapping.LastModified = DateTime.Now;
                
                UpdateMappingStatistics();
                GroupMappingsView?.Refresh();
            }
        }
        
        private void AddNamingConvention()
        {
            if (string.IsNullOrWhiteSpace(NewConventionName) || string.IsNullOrWhiteSpace(ConventionPattern))
            {
                MessageBox.Show("Please provide a convention name and pattern.", "Invalid Input", 
                    MessageBoxButton.OK, MessageBoxImage.Warning);
                return;
            }
            
            var rule = new GroupRemappingRule
            {
                Id = Guid.NewGuid().ToString(),
                Name = NewConventionName,
                SourcePattern = "*", // Apply to all
                TargetPattern = ConventionPattern,
                Strategy = MapConventionTypeToStrategy(SelectedConventionType),
                IsEnabled = true
            };
            
            NamingConventionRules.Add(rule);
            
            // Reset form
            NewConventionName = string.Empty;
            ConventionPattern = string.Empty;
        }
        
        private RemappingStrategy MapConventionTypeToStrategy(NamingConventionType type)
        {
            return type switch
            {
                NamingConventionType.Prefix => RemappingStrategy.AddPrefix,
                NamingConventionType.Suffix => RemappingStrategy.AddSuffix,
                NamingConventionType.Replace => RemappingStrategy.Replace,
                _ => RemappingStrategy.Custom
            };
        }
        
        private void DeleteNamingConvention(GroupRemappingRule rule)
        {
            if (rule != null)
            {
                NamingConventionRules.Remove(rule);
            }
        }
        
        private async Task ApplyNamingConventionsAsync()
        {
            try
            {
                IsLoading = true;
                LoadingMessage = "Applying naming conventions...";
                
                var appliedRules = 0;
                var previewChanges = new List<string>();
                
                // Show preview of changes first
                foreach (var rule in NamingConventionRules.Where(r => r.IsEnabled))
                {
                    foreach (var groupMapping in GroupMappings)
                    {
                        if (rule.SourcePattern == "*" || 
                            groupMapping.SourceIdentity?.Contains(rule.SourcePattern) == true)
                        {
                            var newTarget = ApplyNamingRule(groupMapping.SourceIdentity, rule);
                            if (newTarget != groupMapping.TargetIdentity)
                            {
                                previewChanges.Add($"{groupMapping.SourceIdentity} → {newTarget}");
                            }
                        }
                    }
                }
                
                // Show preview dialog
                if (previewChanges.Any())
                {
                    var preview = string.Join("\n", previewChanges.Take(10));
                    if (previewChanges.Count > 10)
                    {
                        preview += $"\n... and {previewChanges.Count - 10} more changes";
                    }
                    
                    var result = MessageBox.Show(
                        $"This will apply naming conventions to {previewChanges.Count} groups:\n\n{preview}\n\nContinue?", 
                        "Preview Naming Convention Changes", 
                        MessageBoxButton.YesNo, 
                        MessageBoxImage.Question);
                        
                    if (result == MessageBoxResult.No)
                        return;
                }
                
                // Apply the changes
                foreach (var rule in NamingConventionRules.Where(r => r.IsEnabled))
                {
                    foreach (var groupMapping in GroupMappings)
                    {
                        if (rule.SourcePattern == "*" || 
                            groupMapping.SourceIdentity?.Contains(rule.SourcePattern) == true)
                        {
                            var oldTarget = groupMapping.TargetIdentity;
                            groupMapping.TargetIdentity = ApplyNamingRule(groupMapping.SourceIdentity, rule);
                            groupMapping.TargetDisplayName = groupMapping.TargetIdentity;
                            
                            if (oldTarget != groupMapping.TargetIdentity)
                            {
                                groupMapping.MappingStatus = MappingStatus.Mapped;
                                groupMapping.LastModified = DateTime.Now;
                                appliedRules++;
                            }
                        }
                    }
                }
                
                // Check for duplicate targets after applying rules
                await DetectDuplicateTargetsAsync();
                
                UpdateMappingStatistics();
                GroupMappingsView?.Refresh();
                
                MessageBox.Show($"Applied naming conventions to {appliedRules} groups", 
                    "Conventions Applied", MessageBoxButton.OK, MessageBoxImage.Information);
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error applying naming conventions");
                MessageBox.Show($"Failed to apply naming conventions: {ex.Message}", "Error", 
                    MessageBoxButton.OK, MessageBoxImage.Error);
            }
            finally
            {
                IsLoading = false;
            }
        }
        
        private string ApplyNamingRule(string sourceIdentity, GroupRemappingRule rule)
        {
            return rule.Strategy switch
            {
                RemappingStrategy.AddPrefix => $"{rule.TargetPattern}{sourceIdentity}",
                RemappingStrategy.AddSuffix => $"{sourceIdentity}{rule.TargetPattern}",
                RemappingStrategy.Replace when rule.SourcePattern != "*" => 
                    sourceIdentity.Replace(rule.SourcePattern, rule.TargetPattern),
                _ => rule.TargetPattern
            };
        }
        
        private async Task ValidateMappingsAsync()
        {
            try
            {
                IsValidationRunning = true;
                LoadingMessage = "Validating mappings...";
                
                ValidationResults.Clear();
                MappingConflicts.Clear();
                
                // Validate user mappings
                foreach (var userMapping in UserMappings)
                {
                    var result = ValidateUserMapping(userMapping);
                    ValidationResults.Add(result);
                    
                    if (result.HasConflict)
                    {
                        MappingConflicts.Add(new MappingConflict
                        {
                            Id = Guid.NewGuid().ToString(),
                            MappingId = userMapping.Id,
                            MappingType = "User",
                            ConflictType = userMapping.ConflictType,
                            Description = result.ErrorMessage,
                            SuggestedResolution = result.SuggestedResolution
                        });
                    }
                }
                
                // Validate group mappings
                foreach (var groupMapping in GroupMappings)
                {
                    var result = ValidateGroupMapping(groupMapping);
                    ValidationResults.Add(result);
                    
                    if (result.HasConflict)
                    {
                        MappingConflicts.Add(new MappingConflict
                        {
                            Id = Guid.NewGuid().ToString(),
                            MappingId = groupMapping.Id,
                            MappingType = "Group",
                            ConflictType = groupMapping.ConflictType,
                            Description = result.ErrorMessage,
                            SuggestedResolution = result.SuggestedResolution
                        });
                    }
                }
                
                UpdateMappingStatistics();
                
                MessageBox.Show($"Validation complete. Found {MappingConflicts.Count} conflicts.", 
                    "Validation Results", MessageBoxButton.OK, MessageBoxImage.Information);
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error validating mappings");
                MessageBox.Show($"Validation failed: {ex.Message}", "Error", 
                    MessageBoxButton.OK, MessageBoxImage.Error);
            }
            finally
            {
                IsValidationRunning = false;
                IsLoading = false;
            }
        }
        
        private MappingValidationResult ValidateUserMapping(UserMapping mapping)
        {
            var result = new MappingValidationResult
            {
                MappingId = mapping.Id,
                MappingType = "User",
                IsValid = true
            };
            
            if (string.IsNullOrWhiteSpace(mapping.TargetIdentity))
            {
                result.IsValid = false;
                result.HasConflict = true;
                result.ErrorMessage = "Target identity is required";
                result.SuggestedResolution = "Generate target identity automatically";
            }
            else if (!IsValidEmailFormat(mapping.TargetIdentity))
            {
                result.IsValid = false;
                result.HasConflict = true;
                result.ErrorMessage = "Target identity is not a valid email format";
                result.SuggestedResolution = "Use format: user@domain.com";
            }
            
            return result;
        }
        
        private MappingValidationResult ValidateGroupMapping(GroupMapping mapping)
        {
            var result = new MappingValidationResult
            {
                MappingId = mapping.Id,
                MappingType = "Group",
                IsValid = true
            };
            
            if (string.IsNullOrWhiteSpace(mapping.TargetIdentity))
            {
                result.IsValid = false;
                result.HasConflict = true;
                result.ErrorMessage = "Target identity is required";
                result.SuggestedResolution = "Generate target identity automatically";
            }
            
            return result;
        }
        
        private bool IsValidEmailFormat(string email)
        {
            return !string.IsNullOrWhiteSpace(email) && 
                   email.Contains("@") && 
                   email.Contains(".");
        }
        
        private void ResolveConflict(MappingConflict conflict)
        {
            if (conflict == null)
                return;
                
            // Apply resolution based on selected strategy
            switch (SelectedResolutionStrategy)
            {
                case ConflictResolutionStrategy.UseCustomValue:
                    ApplyCustomResolution(conflict, CustomResolutionValue);
                    break;
                case ConflictResolutionStrategy.AutoGenerate:
                    ApplyAutoResolution(conflict);
                    break;
                case ConflictResolutionStrategy.SkipConflict:
                    MarkConflictAsSkipped(conflict);
                    break;
            }
            
            MappingConflicts.Remove(conflict);
            UpdateMappingStatistics();
        }
        
        private async Task ResolveAllConflictsAsync()
        {
            try
            {
                IsLoading = true;
                LoadingMessage = "Resolving conflicts...";
                
                var conflictsToResolve = MappingConflicts.ToList();
                
                foreach (var conflict in conflictsToResolve)
                {
                    ResolveConflict(conflict);
                }
                
                MessageBox.Show($"Resolved {conflictsToResolve.Count} conflicts", 
                    "Conflicts Resolved", MessageBoxButton.OK, MessageBoxImage.Information);
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error resolving conflicts");
                MessageBox.Show($"Failed to resolve conflicts: {ex.Message}", "Error", 
                    MessageBoxButton.OK, MessageBoxImage.Error);
            }
            finally
            {
                IsLoading = false;
            }
        }
        
        private void ApplyCustomResolution(MappingConflict conflict, string customValue)
        {
            // Find and update the corresponding mapping
            if (conflict.MappingType == "User")
            {
                var userMapping = UserMappings.FirstOrDefault(u => u.Id == conflict.MappingId);
                if (userMapping != null)
                {
                    userMapping.TargetIdentity = customValue;
                    userMapping.MappingStatus = MappingStatus.Mapped;
                    userMapping.ConflictType = ConflictType.None;
                }
            }
            else if (conflict.MappingType == "Group")
            {
                var groupMapping = GroupMappings.FirstOrDefault(g => g.Id == conflict.MappingId);
                if (groupMapping != null)
                {
                    groupMapping.TargetIdentity = customValue;
                    groupMapping.MappingStatus = MappingStatus.Mapped;
                    groupMapping.ConflictType = ConflictType.None;
                }
            }
        }
        
        private void ApplyAutoResolution(MappingConflict conflict)
        {
            // Auto-generate resolution based on conflict type
            string autoValue = $"AUTO_{Guid.NewGuid().ToString("N")[..8]}";
            ApplyCustomResolution(conflict, autoValue);
        }
        
        private void MarkConflictAsSkipped(MappingConflict conflict)
        {
            // Mark as skipped - no changes to mapping
            if (conflict.MappingType == "User")
            {
                var userMapping = UserMappings.FirstOrDefault(u => u.Id == conflict.MappingId);
                if (userMapping != null)
                {
                    userMapping.MappingStatus = MappingStatus.Skipped;
                }
            }
            else if (conflict.MappingType == "Group")
            {
                var groupMapping = GroupMappings.FirstOrDefault(g => g.Id == conflict.MappingId);
                if (groupMapping != null)
                {
                    groupMapping.MappingStatus = MappingStatus.Skipped;
                }
            }
        }
        
        private void UpdateMappingStatistics()
        {
            var totalUsers = UserMappings.Count;
            var totalGroups = GroupMappings.Count;
            var totalResources = ResourceMappings.Count;
            
            TotalMappings = totalUsers + totalGroups + totalResources;
            
            ValidMappings = UserMappings.Count(u => u.MappingStatus == MappingStatus.Mapped) +
                           GroupMappings.Count(g => g.MappingStatus == MappingStatus.Mapped) +
                           ResourceMappings.Count(r => r.MappingStatus == MappingStatus.Mapped);
            
            ConflictedMappings = UserMappings.Count(u => u.ConflictType != ConflictType.None) +
                                GroupMappings.Count(g => g.ConflictType != ConflictType.None);
            
            UnmappedItems = UserMappings.Count(u => u.MappingStatus == MappingStatus.Pending) +
                           GroupMappings.Count(g => g.MappingStatus == MappingStatus.Pending) +
                           ResourceMappings.Count(r => r.MappingStatus == MappingStatus.Pending);
        }
        
        private bool FilterUserMappings(object item)
        {
            if (!(item is UserMapping mapping))
                return false;
            
            // Text search
            if (!string.IsNullOrWhiteSpace(UserSearchText))
            {
                var searchLower = UserSearchText.ToLowerInvariant();
                if (!mapping.SourceDisplayName?.ToLowerInvariant().Contains(searchLower) == true &&
                    !mapping.SourceIdentity?.ToLowerInvariant().Contains(searchLower) == true &&
                    !mapping.TargetIdentity?.ToLowerInvariant().Contains(searchLower) == true)
                {
                    return false;
                }
            }
            
            // Conflict filter
            if (ShowOnlyConflicts && mapping.ConflictType == ConflictType.None)
                return false;
            
            // Unmapped filter
            if (ShowOnlyUnmapped && mapping.MappingStatus != MappingStatus.Pending)
                return false;
            
            return true;
        }
        
        private bool FilterGroupMappings(object item)
        {
            if (!(item is GroupMapping mapping))
                return false;
            
            // Text search
            if (!string.IsNullOrWhiteSpace(GroupSearchText))
            {
                var searchLower = GroupSearchText.ToLowerInvariant();
                if (!mapping.SourceDisplayName?.ToLowerInvariant().Contains(searchLower) == true &&
                    !mapping.SourceIdentity?.ToLowerInvariant().Contains(searchLower) == true &&
                    !mapping.TargetIdentity?.ToLowerInvariant().Contains(searchLower) == true)
                {
                    return false;
                }
            }
            
            // Conflict filter
            if (ShowOnlyConflicts && mapping.ConflictType == ConflictType.None)
                return false;
            
            // Unmapped filter
            if (ShowOnlyUnmapped && mapping.MappingStatus != MappingStatus.Pending)
                return false;
            
            return true;
        }
        
        private bool FilterResourceMappings(object item)
        {
            if (!(item is ResourceMapping mapping))
                return false;
            
            // Text search
            if (!string.IsNullOrWhiteSpace(ResourceSearchText))
            {
                var searchLower = ResourceSearchText.ToLowerInvariant();
                if (!mapping.SourceResource?.ToLowerInvariant().Contains(searchLower) == true &&
                    !mapping.TargetResource?.ToLowerInvariant().Contains(searchLower) == true)
                {
                    return false;
                }
            }
            
            // Type filter
            if (SelectedResourceTypeFilter.HasValue && mapping.SourceType != SelectedResourceTypeFilter.Value)
                return false;
            
            return true;
        }
        
        private async Task ExportMappingsAsync()
        {
            try
            {
                // TODO: Implement export functionality
                MessageBox.Show("Export functionality will be implemented in Phase 2", "Feature Coming Soon", 
                    MessageBoxButton.OK, MessageBoxImage.Information);
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error exporting mappings");
                MessageBox.Show($"Export failed: {ex.Message}", "Export Error", 
                    MessageBoxButton.OK, MessageBoxImage.Error);
            }
        }
        
        private async Task ImportMappingsAsync()
        {
            try
            {
                // TODO: Implement import functionality
                MessageBox.Show("Import functionality will be implemented in Phase 2", "Feature Coming Soon", 
                    MessageBoxButton.OK, MessageBoxImage.Information);
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error importing mappings");
                MessageBox.Show($"Import failed: {ex.Message}", "Import Error", 
                    MessageBoxButton.OK, MessageBoxImage.Error);
            }
        }
        
        private async Task PreviewMappingsAsync()
        {
            try
            {
                IsLoading = true;
                LoadingMessage = "Generating mapping preview...";
                
                var previewData = new List<string>();
                
                // Add header
                previewData.Add("=== MIGRATION MAPPING PREVIEW ===");
                previewData.Add($"Generated: {DateTime.Now:yyyy-MM-dd HH:mm:ss}");
                previewData.Add($"Profile: {SelectedProfile}");
                previewData.Add(string.Empty);
                
                // User mappings section
                previewData.Add("--- USER MAPPINGS ---");
                var mappedUsers = UserMappings.Where(u => u.MappingStatus == MappingStatus.Mapped).ToList();
                previewData.Add($"Total Users: {UserMappings.Count}, Mapped: {mappedUsers.Count}");
                previewData.Add(string.Empty);
                
                foreach (var user in mappedUsers.Take(10))
                {
                    previewData.Add($"{user.SourceIdentity} → {user.TargetIdentity}");
                }
                if (mappedUsers.Count > 10)
                {
                    previewData.Add($"... and {mappedUsers.Count - 10} more users");
                }
                previewData.Add(string.Empty);
                
                // Group mappings section
                previewData.Add("--- GROUP MAPPINGS ---");
                var mappedGroups = GroupMappings.Where(g => g.MappingStatus == MappingStatus.Mapped).ToList();
                previewData.Add($"Total Groups: {GroupMappings.Count}, Mapped: {mappedGroups.Count}");
                previewData.Add(string.Empty);
                
                foreach (var group in mappedGroups.Take(10))
                {
                    previewData.Add($"{group.SourceIdentity} [{group.SourceType}] → {group.TargetIdentity}");
                }
                if (mappedGroups.Count > 10)
                {
                    previewData.Add($"... and {mappedGroups.Count - 10} more groups");
                }
                previewData.Add(string.Empty);
                
                // Conflicts section
                if (MappingConflicts.Any())
                {
                    previewData.Add("--- CONFLICTS ---");
                    foreach (var conflict in MappingConflicts.Take(5))
                    {
                        previewData.Add($"⚠ {conflict.MappingType}: {conflict.Description}");
                    }
                    if (MappingConflicts.Count > 5)
                    {
                        previewData.Add($"... and {MappingConflicts.Count - 5} more conflicts");
                    }
                    previewData.Add(string.Empty);
                }
                
                // Statistics
                previewData.Add("--- SUMMARY ---");
                previewData.Add($"Total Mappings: {TotalMappings}");
                previewData.Add($"Valid Mappings: {ValidMappings}");
                previewData.Add($"Conflicted Mappings: {ConflictedMappings}");
                previewData.Add($"Unmapped Items: {UnmappedItems}");
                previewData.Add(string.Empty);
                previewData.Add("Ready for migration execution.");
                
                var previewText = string.Join("\n", previewData);
                
                // Show preview in a dialog
                var previewWindow = new Window
                {
                    Title = "Migration Mapping Preview",
                    Width = 600,
                    Height = 500,
                    WindowStartupLocation = WindowStartupLocation.CenterOwner,
                    Content = new ScrollViewer
                    {
                        Content = new TextBlock
                        {
                            Text = previewText,
                            FontFamily = new System.Windows.Media.FontFamily("Courier New"),
                            Padding = new Thickness(10),
                            TextWrapping = TextWrapping.Wrap
                        }
                    }
                };
                
                previewWindow.ShowDialog();
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error generating mapping preview");
                MessageBox.Show($"Preview failed: {ex.Message}", "Preview Error", 
                    MessageBoxButton.OK, MessageBoxImage.Error);
            }
            finally
            {
                IsLoading = false;
            }
        }
        #endregion
        
        #region Overrides
        public override async Task LoadAsync()
        {
            IsLoading = true;
            HasData = false;
            LastError = null;
            HeaderWarnings.Clear();

            try
            {
                _logger?.LogDebug($"[{GetType().Name}] Load start");
                
                LoadAvailableProfiles();
                
                // Initialize with sample naming conventions
                NamingConventionRules.Add(new GroupRemappingRule
                {
                    Id = Guid.NewGuid().ToString(),
                    Name = "Add CORP Prefix",
                    SourcePattern = "*",
                    TargetPattern = "CORP_",
                    Strategy = RemappingStrategy.AddPrefix,
                    IsEnabled = true
                });
                
                HasData = true;
                _logger?.LogInformation($"[{GetType().Name}] Load ok");
            }
            catch (Exception ex)
            {
                LastError = $"Unexpected error: {ex.Message}";
                _logger?.LogError($"[{GetType().Name}] Load fail ex={ex}");
            }
            finally
            {
                IsLoading = false;
            }
        }
        
        protected override void OnDisposing()
        {
            // Cleanup resources
            base.OnDisposing();
        }
        
        /// <summary>
        /// Detect duplicate target identities and mark as conflicts
        /// </summary>
        private async Task DetectDuplicateTargetsAsync()
        {
            try
            {
                // Check for duplicate user targets
                var userTargets = UserMappings
                    .Where(u => !string.IsNullOrWhiteSpace(u.TargetIdentity))
                    .GroupBy(u => u.TargetIdentity.ToLowerInvariant())
                    .Where(g => g.Count() > 1)
                    .ToList();
                
                foreach (var duplicateGroup in userTargets)
                {
                    foreach (var user in duplicateGroup.Skip(1)) // Keep first, mark rest as conflicts
                    {
                        user.ConflictType = ConflictType.DuplicateTarget;
                        user.MappingStatus = MappingStatus.Conflict;
                        
                        // Add to conflicts collection if not already there
                        if (!MappingConflicts.Any(c => c.MappingId == user.Id))
                        {
                            MappingConflicts.Add(new MappingConflict
                            {
                                Id = Guid.NewGuid().ToString(),
                                MappingId = user.Id,
                                MappingType = "User",
                                ConflictType = ConflictType.DuplicateTarget,
                                Description = $"Duplicate target identity: {user.TargetIdentity}",
                                SuggestedResolution = $"Use {user.TargetIdentity}_{Guid.NewGuid().ToString("N")[..4]}"
                            });
                        }
                    }
                }
                
                // Check for duplicate group targets
                var groupTargets = GroupMappings
                    .Where(g => !string.IsNullOrWhiteSpace(g.TargetIdentity))
                    .GroupBy(g => g.TargetIdentity.ToLowerInvariant())
                    .Where(g => g.Count() > 1)
                    .ToList();
                
                foreach (var duplicateGroup in groupTargets)
                {
                    foreach (var group in duplicateGroup.Skip(1)) // Keep first, mark rest as conflicts
                    {
                        group.ConflictType = ConflictType.DuplicateTarget;
                        group.MappingStatus = MappingStatus.Conflict;
                        
                        // Add to conflicts collection if not already there
                        if (!MappingConflicts.Any(c => c.MappingId == group.Id))
                        {
                            MappingConflicts.Add(new MappingConflict
                            {
                                Id = Guid.NewGuid().ToString(),
                                MappingId = group.Id,
                                MappingType = "Group",
                                ConflictType = ConflictType.DuplicateTarget,
                                Description = $"Duplicate target identity: {group.TargetIdentity}",
                                SuggestedResolution = $"Use {group.TargetIdentity}_{Guid.NewGuid().ToString("N")[..4]}"
                            });
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error detecting duplicate targets");
            }
        }
        
        /// <summary>
        /// Apply smart naming convention based on group type and size
        /// </summary>
        private string ApplySmartNamingConvention(GroupMapping groupMapping)
        {
            var sourceName = groupMapping.SourceIdentity;
            var groupType = groupMapping.SourceType;
            
            // Apply different conventions based on group type
            return groupType switch
            {
                "Security Group" => $"SG_{sourceName}",
                "Distribution List" => $"DL_{sourceName}", 
                _ => $"GRP_{sourceName}"
            };
        }
        
        /// <summary>
        /// Bulk update group mappings with pattern-based rules
        /// </summary>
        public async Task ApplyBulkMappingRulesAsync(string sourcePattern, string targetTemplate, bool isRegex = false)
        {
            try
            {
                IsLoading = true;
                LoadingMessage = "Applying bulk mapping rules...";
                
                var matchingGroups = GroupMappings.AsEnumerable();
                
                if (isRegex)
                {
                    var regex = new System.Text.RegularExpressions.Regex(sourcePattern, System.Text.RegularExpressions.RegexOptions.IgnoreCase);
                    matchingGroups = matchingGroups.Where(g => regex.IsMatch(g.SourceIdentity ?? ""));
                }
                else
                {
                    matchingGroups = matchingGroups.Where(g => g.SourceIdentity?.Contains(sourcePattern, StringComparison.OrdinalIgnoreCase) == true);
                }
                
                var updatedCount = 0;
                foreach (var group in matchingGroups)
                {
                    // Replace {SOURCE} placeholder in template
                    var newTarget = targetTemplate.Replace("{SOURCE}", group.SourceIdentity);
                    
                    // Replace {TYPE} placeholder
                    var typePrefix = group.SourceType == "Distribution List" ? "DL" : "SG";
                    newTarget = newTarget.Replace("{TYPE}", typePrefix);
                    
                    // Replace {GUID} placeholder with short GUID
                    newTarget = newTarget.Replace("{GUID}", Guid.NewGuid().ToString("N")[..8]);
                    
                    group.TargetIdentity = newTarget;
                    group.TargetDisplayName = newTarget;
                    group.MappingStatus = MappingStatus.Mapped;
                    group.LastModified = DateTime.Now;
                    updatedCount++;
                }
                
                // Check for duplicates after bulk update
                await DetectDuplicateTargetsAsync();
                
                UpdateMappingStatistics();
                GroupMappingsView?.Refresh();
                
                MessageBox.Show($"Applied bulk mapping rules to {updatedCount} groups", 
                    "Bulk Mapping Complete", MessageBoxButton.OK, MessageBoxImage.Information);
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error applying bulk mapping rules");
                MessageBox.Show($"Bulk mapping failed: {ex.Message}", "Error", 
                    MessageBoxButton.OK, MessageBoxImage.Error);
            }
            finally
            {
                IsLoading = false;
            }
        }
        
        /// <summary>
        /// Generate mapping statistics report
        /// </summary>
        public string GenerateMappingReport()
        {
            var report = new List<string>
            {
                "=== MIGRATION MAPPING REPORT ===",
                $"Generated: {DateTime.Now:yyyy-MM-dd HH:mm:ss}",
                $"Profile: {SelectedProfile}",
                string.Empty,
                
                "--- SUMMARY STATISTICS ---",
                $"Total Mappings: {TotalMappings}",
                $"Valid Mappings: {ValidMappings} ({(TotalMappings > 0 ? ValidMappings * 100.0 / TotalMappings : 0):F1}%)",
                $"Conflicted Mappings: {ConflictedMappings} ({(TotalMappings > 0 ? ConflictedMappings * 100.0 / TotalMappings : 0):F1}%)",
                $"Unmapped Items: {UnmappedItems} ({(TotalMappings > 0 ? UnmappedItems * 100.0 / TotalMappings : 0):F1}%)",
                string.Empty,
                
                "--- USER MAPPINGS ---",
                $"Total Users: {UserMappings.Count}",
                $"Mapped: {UserMappings.Count(u => u.MappingStatus == MappingStatus.Mapped)}",
                $"Pending: {UserMappings.Count(u => u.MappingStatus == MappingStatus.Pending)}",
                $"Conflicts: {UserMappings.Count(u => u.MappingStatus == MappingStatus.Conflict)}",
                string.Empty,
                
                "--- GROUP MAPPINGS ---",
                $"Total Groups: {GroupMappings.Count}",
                $"Security Groups: {GroupMappings.Count(g => g.SourceType == "Security Group")}",
                $"Distribution Lists: {GroupMappings.Count(g => g.SourceType == "Distribution List")}",
                $"Mapped: {GroupMappings.Count(g => g.MappingStatus == MappingStatus.Mapped)}",
                $"Pending: {GroupMappings.Count(g => g.MappingStatus == MappingStatus.Pending)}",
                $"Conflicts: {GroupMappings.Count(g => g.MappingStatus == MappingStatus.Conflict)}",
                string.Empty,
                
                "--- NAMING CONVENTIONS ---",
                $"Active Rules: {NamingConventionRules.Count(r => r.IsEnabled)}"
            };
            
            foreach (var rule in NamingConventionRules.Where(r => r.IsEnabled))
            {
                report.Add($"  - {rule.Name}: {rule.Strategy} '{rule.TargetPattern}'");
            }
            
            if (MappingConflicts.Any())
            {
                report.Add(string.Empty);
                report.Add("--- CONFLICTS REQUIRING RESOLUTION ---");
                foreach (var conflict in MappingConflicts.Take(10))
                {
                    report.Add($"  \u26a0 {conflict.MappingType}: {conflict.Description}");
                }
                if (MappingConflicts.Count > 10)
                {
                    report.Add($"  ... and {MappingConflicts.Count - 10} more conflicts");
                }
            }
            
            report.Add(string.Empty);
            report.Add("--- READINESS ASSESSMENT ---");
            
            var readinessScore = TotalMappings > 0 ? (ValidMappings * 100.0 / TotalMappings) : 0;
            var readinessLevel = readinessScore switch
            {
                >= 95 => "READY - Proceed with migration",
                >= 85 => "MOSTLY READY - Review conflicts before migration",
                >= 70 => "PARTIALLY READY - Resolve major conflicts first",
                _ => "NOT READY - Significant mapping work required"
            };
            
            report.Add($"Readiness Score: {readinessScore:F1}%");
            report.Add($"Assessment: {readinessLevel}");
            
            return string.Join("\n", report);
        }
        #endregion
    }
    
    #region Supporting Classes
    /// <summary>
    /// User mapping definition
    /// </summary>
    public class UserMapping
    {
        public string Id { get; set; }
        public string SourceIdentity { get; set; }
        public string SourceDisplayName { get; set; }
        public string SourceDomain { get; set; }
        public string TargetIdentity { get; set; }
        public string TargetDomain { get; set; }
        public MappingStatus MappingStatus { get; set; }
        public ConflictType ConflictType { get; set; }
        public DateTime LastModified { get; set; }
    }
    
    /// <summary>
    /// Group mapping definition
    /// </summary>
    public class GroupMapping
    {
        public string Id { get; set; }
        public string SourceIdentity { get; set; }
        public string SourceDisplayName { get; set; }
        public string SourceType { get; set; }
        public string TargetIdentity { get; set; }
        public string TargetDisplayName { get; set; }
        public MappingStatus MappingStatus { get; set; }
        public ConflictType ConflictType { get; set; }
        public DateTime LastModified { get; set; }
    }
    
    /// <summary>
    /// Resource mapping definition
    /// </summary>
    public class ResourceMapping
    {
        public string Id { get; set; }
        public string SourceResource { get; set; }
        public ResourceMappingType SourceType { get; set; }
        public string TargetResource { get; set; }
        public MappingStatus MappingStatus { get; set; }
        public ConflictType ConflictType { get; set; }
        public DateTime LastModified { get; set; }
    }
    
    /// <summary>
    /// Mapping conflict definition
    /// </summary>
    public class MappingConflict
    {
        public string Id { get; set; }
        public string MappingId { get; set; }
        public string MappingType { get; set; }
        public ConflictType ConflictType { get; set; }
        public string Description { get; set; }
        public string SuggestedResolution { get; set; }
    }
    
    /// <summary>
    /// Mapping validation result
    /// </summary>
    public class MappingValidationResult
    {
        public string MappingId { get; set; }
        public string MappingType { get; set; }
        public bool IsValid { get; set; }
        public bool HasConflict { get; set; }
        public string ErrorMessage { get; set; }
        public string SuggestedResolution { get; set; }
    }
    
    /// <summary>
    /// Mapping status enumeration
    /// </summary>
    public enum MappingStatus
    {
        Pending,
        Mapped,
        Conflict,
        Skipped
    }
    
    /// <summary>
    /// Conflict type enumeration
    /// </summary>
    public enum ConflictType
    {
        None,
        DuplicateTarget,
        MissingRequiredField,
        InvalidFormat,
        DisabledAccount,
        SecurityRestriction
    }
    
    /// <summary>
    /// Resource mapping type enumeration
    /// </summary>
    public enum ResourceMappingType
    {
        Server,
        Database,
        FileShare,
        Application,
        Service
    }
    
    /// <summary>
    /// Naming convention type enumeration
    /// </summary>
    public enum NamingConventionType
    {
        Prefix,
        Suffix,
        Replace,
        Custom
    }
    
    /// <summary>
    /// Conflict resolution strategy enumeration
    /// </summary>
    public enum ConflictResolutionStrategy
    {
        UseCustomValue,
        AutoGenerate,
        SkipConflict
    }
    #endregion
}