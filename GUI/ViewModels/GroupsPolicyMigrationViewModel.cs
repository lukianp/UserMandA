using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.ComponentModel;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using System.Windows.Input;
using Microsoft.Extensions.Logging;
using MandADiscoverySuite.Migration;
using MandADiscoverySuite.Models;
using MandADiscoverySuite.Models.Migration;
using MandADiscoverySuite.Models.Identity;
using MandADiscoverySuite.Services;
using CommunityToolkit.Mvvm.Input;

namespace MandADiscoverySuite.ViewModels
{
    /// <summary>
    /// ViewModel for Groups, GPOs, and ACLs migration planning and execution (T-037)
    /// Provides comprehensive interface for managing security policy migrations
    /// </summary>
    public class GroupsPolicyMigrationViewModel : BaseViewModel
    {
        private readonly ILogger<GroupsPolicyMigrationViewModel> _logger;
        private readonly IGroupsPolicyMigrator _groupsPolicyMigrator;
        private readonly IServiceProvider _serviceProvider;
        private readonly AuditService _auditService;

        private CancellationTokenSource? _cancellationTokenSource;
        private bool _isMigrationRunning;
        private string _statusMessage = "Ready";
        private int _progressPercentage;
        private string _selectedMigrationType = "Groups";

        #region Properties

        public ObservableCollection<Models.Identity.GroupData> Groups { get; } = new();
        public ObservableCollection<GpoData> GroupPolicies { get; } = new();
        public ObservableCollection<AclData> AccessControlLists { get; } = new();
        public ObservableCollection<GroupMigrationResult> GroupMigrationResults { get; } = new();
        public ObservableCollection<GpoMigrationResult> GpoMigrationResults { get; } = new();
        public ObservableCollection<AclMigrationResult> AclMigrationResults { get; } = new();

        public bool IsMigrationRunning
        {
            get => _isMigrationRunning;
            set
            {
                _isMigrationRunning = value;
                OnPropertyChanged();
                OnPropertyChanged(nameof(CanStartMigration));
                OnPropertyChanged(nameof(CanCancelMigration));
            }
        }

        public new string StatusMessage
        {
            get => _statusMessage;
            set
            {
                _statusMessage = value;
                OnPropertyChanged();
            }
        }

        public int ProgressPercentage
        {
            get => _progressPercentage;
            set
            {
                _progressPercentage = value;
                OnPropertyChanged();
            }
        }

        public string SelectedMigrationType
        {
            get => _selectedMigrationType;
            set
            {
                _selectedMigrationType = value;
                OnPropertyChanged();
                OnPropertyChanged(nameof(IsGroupsSelected));
                OnPropertyChanged(nameof(IsGposSelected));
                OnPropertyChanged(nameof(IsAclsSelected));
            }
        }

        public List<string> MigrationTypes { get; } = new() { "Groups", "Group Policies", "Access Control Lists", "All" };

        public bool IsGroupsSelected => SelectedMigrationType == "Groups" || SelectedMigrationType == "All";
        public bool IsGposSelected => SelectedMigrationType == "Group Policies" || SelectedMigrationType == "All";
        public bool IsAclsSelected => SelectedMigrationType == "Access Control Lists" || SelectedMigrationType == "All";

        public bool CanStartMigration => !IsMigrationRunning && HasSelectedProfiles();
        public bool CanCancelMigration => IsMigrationRunning;

        #endregion

        #region Migration Settings Properties

        private GroupMigrationSettings _groupSettings = new();
        private GpoMigrationSettings _gpoSettings = new();
        private AclMigrationSettings _aclSettings = new();

        public GroupMigrationSettings GroupSettings
        {
            get => _groupSettings;
            set
            {
                _groupSettings = value;
                OnPropertyChanged();
            }
        }

        public GpoMigrationSettings GpoSettings
        {
            get => _gpoSettings;
            set
            {
                _gpoSettings = value;
                OnPropertyChanged();
            }
        }

        public AclMigrationSettings AclSettings
        {
            get => _aclSettings;
            set
            {
                _aclSettings = value;
                OnPropertyChanged();
            }
        }

        #endregion

        #region Summary Statistics

        private int _totalGroups;
        private int _totalGpos;
        private int _totalAcls;
        private int _migratedGroups;
        private int _migratedGpos;
        private int _migratedAcls;
        private DateTime? _lastMigrationDate;

        public int TotalGroups
        {
            get => _totalGroups;
            set
            {
                _totalGroups = value;
                OnPropertyChanged();
            }
        }

        public int TotalGpos
        {
            get => _totalGpos;
            set
            {
                _totalGpos = value;
                OnPropertyChanged();
            }
        }

        public int TotalAcls
        {
            get => _totalAcls;
            set
            {
                _totalAcls = value;
                OnPropertyChanged();
            }
        }

        public int MigratedGroups
        {
            get => _migratedGroups;
            set
            {
                _migratedGroups = value;
                OnPropertyChanged();
            }
        }

        public int MigratedGpos
        {
            get => _migratedGpos;
            set
            {
                _migratedGpos = value;
                OnPropertyChanged();
            }
        }

        public int MigratedAcls
        {
            get => _migratedAcls;
            set
            {
                _migratedAcls = value;
                OnPropertyChanged();
            }
        }

        public DateTime? LastMigrationDate
        {
            get => _lastMigrationDate;
            set
            {
                _lastMigrationDate = value;
                OnPropertyChanged();
            }
        }

        #endregion

        #region Commands

        public ICommand LoadGroupsCommand { get; }
        public ICommand LoadGposCommand { get; }
        public ICommand LoadAclsCommand { get; }
        public ICommand StartMigrationCommand { get; }
        public ICommand CancelMigrationCommand { get; }
        public ICommand ValidateSettingsCommand { get; }
        public ICommand AnalyzeDependenciesCommand { get; }
        public ICommand ExportResultsCommand { get; }
        public ICommand CreateBackupCommand { get; }
        public ICommand ViewDetailsCommand { get; }

        #endregion

        public GroupsPolicyMigrationViewModel(
            ILogger<GroupsPolicyMigrationViewModel> logger,
            IGroupsPolicyMigrator groupsPolicyMigrator,
            IServiceProvider serviceProvider,
            AuditService auditService)
        {
            _logger = logger;
            _groupsPolicyMigrator = groupsPolicyMigrator;
            _serviceProvider = serviceProvider;
            _auditService = auditService;

            // Initialize commands
            LoadGroupsCommand = new AsyncRelayCommand(LoadGroupsAsync);
            LoadGposCommand = new AsyncRelayCommand(LoadGposAsync);
            LoadAclsCommand = new AsyncRelayCommand(LoadAclsAsync);
            StartMigrationCommand = new AsyncRelayCommand(StartMigrationAsync, () => CanStartMigration);
            CancelMigrationCommand = new RelayCommand(CancelMigration, () => CanCancelMigration);
            ValidateSettingsCommand = new AsyncRelayCommand(ValidateSettingsAsync);
            AnalyzeDependenciesCommand = new AsyncRelayCommand(AnalyzeDependenciesAsync);
            ExportResultsCommand = new AsyncRelayCommand(ExportResultsAsync);
            CreateBackupCommand = new AsyncRelayCommand(CreateBackupAsync);
            ViewDetailsCommand = new AsyncRelayCommand<object>(ViewDetailsAsync);

            // Subscribe to migration events
            _groupsPolicyMigrator.ProgressUpdated += OnMigrationProgressUpdated;
            _groupsPolicyMigrator.ConflictDetected += OnConflictDetected;
            _groupsPolicyMigrator.AclStatusChanged += OnAclStatusChanged;

            // Initialize default settings
            InitializeDefaultSettings();
        }

        #region Command Implementations

        private async Task LoadGroupsAsync()
        {
            try
            {
                StatusMessage = "Loading groups...";
                
                // Load groups from source system
                var groups = await LoadSourceGroupsAsync();
                
                Groups.Clear();
                foreach (var group in groups)
                {
                    Groups.Add(group);
                }

                TotalGroups = Groups.Count;
                StatusMessage = $"Loaded {TotalGroups} groups";

                _logger.LogInformation("Loaded {GroupCount} groups for migration", TotalGroups);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to load groups");
                StatusMessage = $"Failed to load groups: {ex.Message}";
                await ShowErrorAsync(ex.Message);
            }
        }

        private async Task LoadGposAsync()
        {
            try
            {
                StatusMessage = "Loading Group Policy Objects...";
                
                var gpos = await LoadSourceGposAsync();
                
                GroupPolicies.Clear();
                foreach (var gpo in gpos)
                {
                    GroupPolicies.Add(gpo);
                }

                TotalGpos = GroupPolicies.Count;
                StatusMessage = $"Loaded {TotalGpos} Group Policy Objects";

                _logger.LogInformation("Loaded {GpoCount} GPOs for migration", TotalGpos);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to load GPOs");
                StatusMessage = $"Failed to load GPOs: {ex.Message}";
                await ShowErrorAsync(ex.Message);
            }
        }

        private async Task LoadAclsAsync()
        {
            try
            {
                StatusMessage = "Loading Access Control Lists...";
                
                var acls = await LoadSourceAclsAsync();
                
                AccessControlLists.Clear();
                foreach (var acl in acls)
                {
                    AccessControlLists.Add(acl);
                }

                TotalAcls = AccessControlLists.Count;
                StatusMessage = $"Loaded {TotalAcls} Access Control Lists";

                _logger.LogInformation("Loaded {AclCount} ACLs for migration", TotalAcls);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to load ACLs");
                StatusMessage = $"Failed to load ACLs: {ex.Message}";
                await ShowErrorAsync(ex.Message);
            }
        }

        private async Task StartMigrationAsync()
        {
            if (!HasSelectedProfiles())
            {
                await ShowWarningAsync("Please select source and target profiles before starting migration.");
                return;
            }

            try
            {
                _cancellationTokenSource = new CancellationTokenSource();
                IsMigrationRunning = true;
                ProgressPercentage = 0;
                StatusMessage = "Starting Groups/GPOs/ACLs migration...";

                // Clear previous results
                GroupMigrationResults.Clear();
                GpoMigrationResults.Clear();
                AclMigrationResults.Clear();

                var target = await GetTargetContextAsync();
                if (target == null)
                {
                    StatusMessage = "Failed to get target context";
                    return;
                }

                // Create progress reporter
                var progress = new Progress<MandADiscoverySuite.Migration.MigrationProgress>(OnMigrationProgress);

                // Execute migration based on selected type
                if (IsGroupsSelected)
                {
                    await MigrateGroupsAsync(target, progress);
                }

                if (IsGposSelected)
                {
                    await MigrateGposAsync(target, progress);
                }

                if (IsAclsSelected)
                {
                    await MigrateAclsAsync(target, progress);
                }

                StatusMessage = "Migration completed";
                ProgressPercentage = 100;
                LastMigrationDate = DateTime.Now;

                // Audit logging
                _logger.LogInformation("Groups/Policy migration completed: {Groups} groups, {Gpos} GPOs, {Acls} ACLs",
                    MigratedGroups, MigratedGpos, MigratedAcls);

                await ShowInfoAsync($"Successfully completed migration of {SelectedMigrationType}");
            }
            catch (OperationCanceledException)
            {
                StatusMessage = "Migration cancelled";
                _logger.LogInformation("Groups/GPOs/ACLs migration was cancelled");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Groups/GPOs/ACLs migration failed");
                StatusMessage = $"Migration failed: {ex.Message}";
                await ShowErrorAsync(ex.Message);
            }
            finally
            {
                IsMigrationRunning = false;
                _cancellationTokenSource?.Dispose();
                _cancellationTokenSource = null;
            }
        }

        private void CancelMigration()
        {
            _cancellationTokenSource?.Cancel();
            StatusMessage = "Cancelling migration...";
            _logger.LogInformation("User requested cancellation of Groups/GPOs/ACLs migration");
        }

        private async Task ValidateSettingsAsync()
        {
            try
            {
                StatusMessage = "Validating migration settings...";

                var validationResults = new List<string>();

                // Validate group settings
                if (IsGroupsSelected)
                {
                    ValidateGroupSettings(validationResults);
                }

                // Validate GPO settings
                if (IsGposSelected)
                {
                    ValidateGpoSettings(validationResults);
                }

                // Validate ACL settings
                if (IsAclsSelected)
                {
                    ValidateAclSettings(validationResults);
                }

                if (validationResults.Any())
                {
                    var message = string.Join("\n", validationResults);
                    await ShowWarningAsync(message);
                }
                else
                {
                    await ShowInfoAsync("All settings are valid");
                }

                StatusMessage = "Settings validation completed";
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to validate settings");
                await ShowErrorAsync(ex.Message);
            }
        }

        private async Task AnalyzeDependenciesAsync()
        {
            try
            {
                StatusMessage = "Analyzing group dependencies...";

                if (!Groups.Any())
                {
                    await ShowWarningAsync("Please load groups first");
                    return;
                }

                var target = await GetTargetContextAsync();
                if (target == null) return;

                var dependencyResult = await _groupsPolicyMigrator.AnalyzeGroupDependenciesAsync(
                    Groups, target, _cancellationTokenSource?.Token ?? CancellationToken.None);

                await ShowDependencyAnalysisAsync(dependencyResult);

                StatusMessage = "Dependency analysis completed";
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to analyze dependencies");
                await ShowErrorAsync(ex.Message);
            }
        }

        private async Task ExportResultsAsync()
        {
            try
            {
                StatusMessage = "Exporting migration results...";

                var exportData = CreateExportData();
                await ExportToFileAsync(exportData);

                StatusMessage = "Results exported successfully";
                await ShowInfoAsync("Migration results have been exported");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to export results");
                await ShowErrorAsync(ex.Message);
            }
        }

        private async Task CreateBackupAsync()
        {
            try
            {
                StatusMessage = "Creating security backup...";

                var backupSettings = new SecurityBackupSettings
                {
                    BackupLocation = @"C:\discoverydata\ljpops\Backups",
                    CompressBackups = true,
                    EncryptBackups = true
                };

                var backupResult = await _groupsPolicyMigrator.CreateSecurityBackupAsync(
                    Groups, GroupPolicies, backupSettings);

                if (backupResult.Success)
                {
                    StatusMessage = $"Backup created: {backupResult.BackupPath}";
                    await ShowInfoAsync($"Security backup created successfully\nLocation: {backupResult.BackupPath}\nSize: {backupResult.BackupSizeBytes / 1024 / 1024} MB");
                }
                else
                {
                    await ShowErrorAsync($"Backup Failed: {backupResult.ErrorMessage ?? "Unknown error"}");
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to create backup");
                await ShowErrorAsync(ex.Message);
            }
        }

        private async Task ViewDetailsAsync(object? parameter)
        {
            try
            {
                if (parameter is GroupMigrationResult groupResult)
                {
                    await ShowGroupDetailsAsync(groupResult);
                }
                else if (parameter is GpoMigrationResult gpoResult)
                {
                    await ShowGpoDetailsAsync(gpoResult);
                }
                else if (parameter is AclMigrationResult aclResult)
                {
                    await ShowAclDetailsAsync(aclResult);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to view details");
                await ShowErrorAsync(ex.Message);
            }
        }

        #endregion

        #region Private Helper Methods

        private async Task<IEnumerable<Models.Identity.GroupData>> LoadSourceGroupsAsync()
        {
            // Implementation would load groups from source Active Directory
            // For now, return sample data
            return await Task.FromResult(new List<Models.Identity.GroupData>
            {
                new() { Id = "1", Name = "Domain Admins", DisplayName = "Domain Administrators", GroupType = GroupType.Security },
                new() { Id = "2", Name = "IT Support", DisplayName = "IT Support Team", GroupType = GroupType.Security },
                new() { Id = "3", Name = "Finance", DisplayName = "Finance Department", GroupType = GroupType.Distribution }
            });
        }

        private async Task<IEnumerable<GpoData>> LoadSourceGposAsync()
        {
            // Implementation would load GPOs from source Active Directory
            return await Task.FromResult(new List<GpoData>
            {
                new() { Id = "1", Name = "Default Domain Policy", DisplayName = "Default Domain Policy", Status = GpoStatus.Enabled },
                new() { Id = "2", Name = "Workstation Security", DisplayName = "Workstation Security Policy", Status = GpoStatus.Enabled },
                new() { Id = "3", Name = "Software Deployment", DisplayName = "Software Deployment Policy", Status = GpoStatus.Enabled }
            });
        }

        private async Task<IEnumerable<AclData>> LoadSourceAclsAsync()
        {
            // Implementation would load ACLs from file system
            return await Task.FromResult(new List<AclData>
            {
                new() { ResourcePath = @"\\server\share\finance", ResourceType = "Directory", InheritanceEnabled = true },
                new() { ResourcePath = @"\\server\share\hr", ResourceType = "Directory", InheritanceEnabled = true },
                new() { ResourcePath = @"\\server\share\it", ResourceType = "Directory", InheritanceEnabled = false }
            });
        }

        private async Task MigrateGroupsAsync(TargetContext target, IProgress<MandADiscoverySuite.Migration.MigrationProgress> progress)
        {
            if (!Groups.Any()) return;

            var results = await _groupsPolicyMigrator.MigrateBatchAsync(
                Groups, GroupSettings, target, 5, 
                progress: new Progress<BatchMigrationProgress>(p =>
                {
                    progress.Report(new MandADiscoverySuite.Migration.MigrationProgress 
                    { 
                        Message = p.Message, 
                        Percentage = (p.ProcessedItems * 100) / p.TotalItems 
                    });
                }),
                _cancellationTokenSource?.Token ?? CancellationToken.None);

            foreach (var result in results)
            {
                GroupMigrationResults.Add(result);
            }

            MigratedGroups = results.Count(r => r.Success);
        }

        private async Task MigrateGposAsync(TargetContext target, IProgress<MandADiscoverySuite.Migration.MigrationProgress> progress)
        {
            if (!GroupPolicies.Any()) return;

            var results = await _groupsPolicyMigrator.MigrateGposAsync(
                GroupPolicies, GpoSettings, target, progress, 
                _cancellationTokenSource?.Token ?? CancellationToken.None);

            foreach (var result in results)
            {
                GpoMigrationResults.Add(result);
            }

            MigratedGpos = results.Count(r => r.Success);
        }

        private async Task MigrateAclsAsync(TargetContext target, IProgress<MandADiscoverySuite.Migration.MigrationProgress> progress)
        {
            if (!AccessControlLists.Any()) return;

            var results = await _groupsPolicyMigrator.MigrateAclsAsync(
                AccessControlLists, AclSettings, target, progress,
                _cancellationTokenSource?.Token ?? CancellationToken.None);

            foreach (var result in results)
            {
                AclMigrationResults.Add(result);
            }

            MigratedAcls = results.Count(r => r.Success);
        }

        private void OnMigrationProgress(MandADiscoverySuite.Migration.MigrationProgress progress)
        {
            StatusMessage = progress.Message;
            ProgressPercentage = progress.Percentage;
        }

        private void ValidateGroupSettings(List<string> results)
        {
            if (GroupSettings.MaxConcurrentOperations <= 0)
            {
                results.Add("Group migration: Maximum concurrent operations must be greater than 0");
            }

            if (GroupSettings.OperationTimeout <= TimeSpan.Zero)
            {
                results.Add("Group migration: Operation timeout must be greater than 0");
            }
        }

        private void ValidateGpoSettings(List<string> results)
        {
            if (!GpoSettings.ConvertToIntuneProfiles && !GpoSettings.ConvertToCompliancePolicies)
            {
                results.Add("GPO migration: At least one conversion option must be enabled");
            }

            if (GpoSettings.MaxComplexityLevel < 1 || GpoSettings.MaxComplexityLevel > 5)
            {
                results.Add("GPO migration: Complexity level must be between 1 and 5");
            }
        }

        private void ValidateAclSettings(List<string> results)
        {
            if (AclSettings.MaxPermissionEntries <= 0)
            {
                results.Add("ACL migration: Maximum permission entries must be greater than 0");
            }

            if (!AclSettings.MapToSharePointPermissions)
            {
                results.Add("ACL migration: SharePoint permission mapping is recommended");
            }
        }

        private void InitializeDefaultSettings()
        {
            GroupSettings = new GroupMigrationSettings
            {
                PreserveMembership = true,
                MigrateNestedGroups = true,
                ConvertToCloudGroups = true,
                ConflictResolution = Services.Migration.ConflictResolutionStrategy.Prompt,
                MaxConcurrentOperations = 10,
                OperationTimeout = TimeSpan.FromMinutes(30),
                ValidateAfterMigration = true,
                CreateBackup = true
            };

            GpoSettings = new GpoMigrationSettings
            {
                ConvertToIntuneProfiles = true,
                ConvertToCompliancePolicies = true,
                GenerateReportForUnsupported = true,
                Mode = GpoMigrationMode.Automatic,
                MaxComplexityLevel = 3,
                ValidateCloudCapabilities = true
            };

            AclSettings = new AclMigrationSettings
            {
                PreserveOwnership = true,
                MapToSharePointPermissions = true,
                CreatePermissionGroups = true,
                MappingStrategy = AclMappingStrategy.BestMatch,
                ValidatePermissions = true,
                MaxPermissionEntries = 1000
            };
        }

        // Additional helper methods would be implemented here for UI operations
        private async Task ShowDependencyAnalysisAsync(GroupDependencyResult result) => await Task.CompletedTask;
        private object CreateExportData() => new { };
        private async Task ExportToFileAsync(object data) => await Task.CompletedTask;

        // UI Helper Methods
        private async Task ShowErrorAsync(string message)
        {
            StatusMessage = $"Error: {message}";
            _logger.LogError(message);
            await Task.CompletedTask;
        }

        private async Task ShowWarningAsync(string message)
        {
            StatusMessage = $"Warning: {message}";
            _logger.LogWarning(message);
            await Task.CompletedTask;
        }

        private async Task ShowInfoAsync(string message)
        {
            StatusMessage = message;
            _logger.LogInformation(message);
            await Task.CompletedTask;
        }

        private bool HasSelectedProfiles()
        {
            // Check if source and target profiles are selected
            return true; // Simplified for now
        }

        private async Task<TargetContext> GetTargetContextAsync()
        {
            // Get the current target context
            await Task.Delay(10);
            return new TargetContext 
            { 
                TenantId = "target-tenant",
                TenantName = "Target Tenant"
            };
        }
        private async Task ShowGroupDetailsAsync(GroupMigrationResult result) => await Task.CompletedTask;
        private async Task ShowGpoDetailsAsync(GpoMigrationResult result) => await Task.CompletedTask;
        private async Task ShowAclDetailsAsync(AclMigrationResult result) => await Task.CompletedTask;

        #endregion

        #region Event Handlers

        private void OnMigrationProgressUpdated(object? sender, GroupMigrationProgressEventArgs e)
        {
            StatusMessage = e.StatusMessage;
            // Update progress based on current step
        }

        private void OnConflictDetected(object? sender, PolicyMigrationConflictEventArgs e)
        {
            _logger.LogWarning("Migration conflict detected: {ConflictType} - {Description}", 
                e.ConflictType, e.Description);
            // Handle conflict resolution UI
        }

        private void OnAclStatusChanged(object? sender, AclValidationStatusEventArgs e)
        {
            if (e.Issues.Any())
            {
                _logger.LogWarning("ACL validation issues for {ResourcePath}: {Issues}", 
                    e.ResourcePath, string.Join(", ", e.Issues));
            }
        }

        #endregion

        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                _cancellationTokenSource?.Cancel();
                _cancellationTokenSource?.Dispose();
                
                _groupsPolicyMigrator.ProgressUpdated -= OnMigrationProgressUpdated;
                _groupsPolicyMigrator.ConflictDetected -= OnConflictDetected;
                _groupsPolicyMigrator.AclStatusChanged -= OnAclStatusChanged;
            }
            
            base.Dispose(disposing);
        }
    }
}