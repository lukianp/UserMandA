using System;
using System.Collections.ObjectModel;
using System.IO;
using System.Threading.Tasks;
using System.Windows.Input;
using Microsoft.Extensions.Logging;
using MandADiscoverySuite.Models;
using MandADiscoverySuite.Services;
using CommunityToolkit.Mvvm.Messaging;

namespace MandADiscoverySuite.ViewModels
{
    /// <summary>
    /// ViewModel for UserDetailView implementing the 9-tab detailed user information interface
    /// Integrates with LogicEngineService for comprehensive user data projection
    /// </summary>
    public class UserDetailViewModel : BaseViewModel
    {
        private readonly ILogicEngineService _logicEngineService;
        private readonly IMigrationWaveService _migrationWaveService;
        private readonly IDataExportService _dataExportService;

        private string? _selectedUserSid;
        private string? _selectedUserUpn;
        private UserDetailProjection? _userDetail;

        // Tab collections
        private ObservableCollection<GroupDto> _groups = new();
        private ObservableCollection<DeviceDto> _devices = new();
        private ObservableCollection<AppDto> _apps = new();
        private ObservableCollection<AclEntry> _fileAccess = new();
        private ObservableCollection<MappedDriveDto> _mappedDrives = new();
        private ObservableCollection<GpoDto> _gpoLinks = new();
        private ObservableCollection<GpoDto> _gpoFilters = new();
        private MailboxDto? _mailbox;
        private ObservableCollection<AzureRoleAssignment> _azureRoles = new();
        private ObservableCollection<SqlDbDto> _sqlDatabases = new();
        private ObservableCollection<RiskAssessment> _risks = new();

        // User basic info
        private string? _displayName;
        private string? _userPrincipalName;
        private string? _email;
        private string? _department;
        private string? _jobTitle;
        private string? _manager;
        private bool _accountEnabled;
        private DateTime? _createdDate;
        private DateTime? _lastSignIn;

        // Commands
        public ICommand AddToMigrationWaveCommand { get; private set; }
        public ICommand ExportSnapshotCommand { get; private set; }
        public ICommand RefreshDataCommand { get; private set; }
        public ICommand CloseCommand { get; private set; }

        public UserDetailViewModel(
            ILogicEngineService logicEngineService,
            ILogger<UserDetailViewModel> logger,
            IMigrationWaveService? migrationWaveService = null,
            IDataExportService? dataExportService = null)
            : base(logger)
        {
            _logicEngineService = logicEngineService ?? throw new ArgumentNullException(nameof(logicEngineService));
            _migrationWaveService = migrationWaveService ?? new StubMigrationWaveService(logger);
            _dataExportService = dataExportService ?? new StubDataExportService(logger);

            TabTitle = "User Details";
        }

        #region Properties

        /// <summary>
        /// Currently selected user SID or UPN for loading details
        /// </summary>
        public string? SelectedUserIdentifier
        {
            get => _selectedUserSid ?? _selectedUserUpn;
            set
            {
                if (value != _selectedUserSid && value != _selectedUserUpn)
                {
                    // Determine if it's a SID or UPN
                    if (value?.StartsWith("S-", StringComparison.OrdinalIgnoreCase) == true)
                    {
                        _selectedUserSid = value;
                        _selectedUserUpn = null;
                    }
                    else
                    {
                        _selectedUserUpn = value;
                        _selectedUserSid = null;
                    }
                    
                    OnPropertyChanged();
                    _ = Task.Run(LoadUserDetailAsync);
                }
            }
        }

        public UserDetailProjection? UserDetail
        {
            get => _userDetail;
            private set => SetProperty(ref _userDetail, value);
        }

        // Basic user info properties
        public string? DisplayName
        {
            get => _displayName;
            private set => SetProperty(ref _displayName, value);
        }

        public string? UserPrincipalName
        {
            get => _userPrincipalName;
            private set => SetProperty(ref _userPrincipalName, value);
        }

        public string? Email
        {
            get => _email;
            private set => SetProperty(ref _email, value);
        }

        public string? Department
        {
            get => _department;
            private set => SetProperty(ref _department, value);
        }

        public string? JobTitle
        {
            get => _jobTitle;
            private set => SetProperty(ref _jobTitle, value);
        }

        public string? Manager
        {
            get => _manager;
            private set => SetProperty(ref _manager, value);
        }

        public bool AccountEnabled
        {
            get => _accountEnabled;
            private set => SetProperty(ref _accountEnabled, value);
        }

        public DateTime? CreatedDate
        {
            get => _createdDate;
            private set => SetProperty(ref _createdDate, value);
        }

        public DateTime? LastSignIn
        {
            get => _lastSignIn;
            private set => SetProperty(ref _lastSignIn, value);
        }

        // Tab collections
        public ObservableCollection<GroupDto> Groups
        {
            get => _groups;
            private set => SetProperty(ref _groups, value);
        }

        public ObservableCollection<DeviceDto> Devices
        {
            get => _devices;
            private set => SetProperty(ref _devices, value);
        }

        public ObservableCollection<AppDto> Apps
        {
            get => _apps;
            private set => SetProperty(ref _apps, value);
        }

        public ObservableCollection<AclEntry> FileAccess
        {
            get => _fileAccess;
            private set => SetProperty(ref _fileAccess, value);
        }

        public ObservableCollection<MappedDriveDto> MappedDrives
        {
            get => _mappedDrives;
            private set => SetProperty(ref _mappedDrives, value);
        }

        public ObservableCollection<GpoDto> GpoLinks
        {
            get => _gpoLinks;
            private set => SetProperty(ref _gpoLinks, value);
        }

        public ObservableCollection<GpoDto> GpoFilters
        {
            get => _gpoFilters;
            private set => SetProperty(ref _gpoFilters, value);
        }

        public MailboxDto? Mailbox
        {
            get => _mailbox;
            private set => SetProperty(ref _mailbox, value);
        }

        public ObservableCollection<AzureRoleAssignment> AzureRoles
        {
            get => _azureRoles;
            private set => SetProperty(ref _azureRoles, value);
        }

        public ObservableCollection<SqlDbDto> SqlDatabases
        {
            get => _sqlDatabases;
            private set => SetProperty(ref _sqlDatabases, value);
        }

        public ObservableCollection<RiskAssessment> Risks
        {
            get => _risks;
            private set => SetProperty(ref _risks, value);
        }

        public override bool HasData => UserDetail != null;

        #endregion

        #region Methods

        protected override void InitializeCommands()
        {
            base.InitializeCommands();

            AddToMigrationWaveCommand = new AsyncRelayCommand(AddToMigrationWaveAsync, () => UserDetail != null);
            ExportSnapshotCommand = new AsyncRelayCommand(ExportSnapshotAsync, () => UserDetail != null);
            RefreshDataCommand = new AsyncRelayCommand(LoadUserDetailAsync);
            CloseCommand = new RelayCommand(CloseUserDetail);
        }

        /// <summary>
        /// Load user detail data from LogicEngineService
        /// </summary>
        private async Task LoadUserDetailAsync()
        {
            if (string.IsNullOrEmpty(SelectedUserIdentifier))
            {
                ClearUserDetail();
                return;
            }

            await ExecuteAsync(async () =>
            {
                StructuredLogger?.LogDebug(LogSourceName, 
                    new { action = "load_user_detail_start", user_id = SelectedUserIdentifier }, 
                    "Loading user detail projection");

                var detail = await _logicEngineService.GetUserDetailAsync(SelectedUserIdentifier);
                
                if (detail != null)
                {
                    UserDetail = detail;
                    UpdateUserBasicInfo(detail.User);
                    UpdateTabCollections(detail);
                    
                    TabTitle = $"User Details - {detail.User.DisplayName ?? detail.User.UPN}";
                    
                    StructuredLogger?.LogInfo(LogSourceName, 
                        new { 
                            action = "load_user_detail_complete", 
                            user_id = SelectedUserIdentifier,
                            groups_count = detail.Groups.Count,
                            devices_count = detail.Devices.Count,
                            apps_count = detail.Apps.Count,
                            risks_count = detail.Risks.Count
                        }, 
                        "User detail projection loaded successfully");
                }
                else
                {
                    ClearUserDetail();
                    StatusMessage = "User not found";
                    
                    StructuredLogger?.LogWarning(LogSourceName, 
                        new { action = "load_user_detail_notfound", user_id = SelectedUserIdentifier }, 
                        "User not found in LogicEngine data");
                }

            }, "Loading user details");
        }

        /// <summary>
        /// Update basic user information properties
        /// </summary>
        private void UpdateUserBasicInfo(UserDto user)
        {
            DisplayName = user.DisplayName;
            UserPrincipalName = user.UPN;
            Email = user.Mail;
            Department = user.Dept;
            JobTitle = null; // TODO: Add JobTitle to UserDto
            Manager = user.ManagerSid; // TODO: Resolve manager name from SID
            AccountEnabled = user.Enabled;
            CreatedDate = user.DiscoveryTimestamp; // TODO: Add proper CreatedDate to UserDto
            LastSignIn = null; // TODO: Add LastSignIn to UserDto
        }

        /// <summary>
        /// Update all tab collections from user detail projection
        /// </summary>
        private void UpdateTabCollections(UserDetailProjection detail)
        {
            // Update Groups tab
            Groups.Clear();
            foreach (var group in detail.Groups)
                Groups.Add(group);

            // Update Devices tab
            Devices.Clear();
            foreach (var device in detail.Devices)
                Devices.Add(device);

            // Update Apps tab
            Apps.Clear();
            foreach (var app in detail.Apps)
                Apps.Add(app);

            // Update File Access tab
            FileAccess.Clear();
            foreach (var acl in detail.Shares)
                FileAccess.Add(acl);

            // Update Mapped Drives tab
            MappedDrives.Clear();
            foreach (var drive in detail.Drives)
                MappedDrives.Add(drive);

            // Update GPO Links tab
            GpoLinks.Clear();
            foreach (var gpo in detail.GpoLinks)
                GpoLinks.Add(gpo);

            // Update GPO Filters tab
            GpoFilters.Clear();
            foreach (var gpo in detail.GpoFilters)
                GpoFilters.Add(gpo);

            // Update Mailbox
            Mailbox = detail.Mailbox;

            // Update Azure Roles tab
            AzureRoles.Clear();
            foreach (var role in detail.AzureRoles)
                AzureRoles.Add(role);

            // Update SQL Databases tab
            SqlDatabases.Clear();
            foreach (var db in detail.SqlDatabases)
                SqlDatabases.Add(db);

            // Update Risks tab
            Risks.Clear();
            foreach (var risk in detail.Risks)
                Risks.Add(ConvertToRiskAssessment(risk));
        }

        /// <summary>
        /// Clear all user detail data
        /// </summary>
        private void ClearUserDetail()
        {
            UserDetail = null;
            
            // Clear basic info
            DisplayName = null;
            UserPrincipalName = null;
            Email = null;
            Department = null;
            JobTitle = null;
            Manager = null;
            AccountEnabled = false;
            CreatedDate = null;
            LastSignIn = null;

            // Clear tab collections
            Groups.Clear();
            Devices.Clear();
            Apps.Clear();
            FileAccess.Clear();
            MappedDrives.Clear();
            GpoLinks.Clear();
            GpoFilters.Clear();
            Mailbox = null;
            AzureRoles.Clear();
            SqlDatabases.Clear();
            Risks.Clear();

            TabTitle = "User Details";
        }

        /// <summary>
        /// Add current user to a migration wave
        /// </summary>
        private async Task AddToMigrationWaveAsync()
        {
            if (UserDetail == null) return;

            await ExecuteAsync(async () =>
            {
                await _migrationWaveService.AddUserToWaveAsync(UserDetail.User);
                StatusMessage = $"User {UserDetail.User.DisplayName} added to migration wave";
                
                StructuredLogger?.LogInfo(LogSourceName, 
                    new { action = "add_to_migration_wave", user_id = UserDetail.User.Sid }, 
                    "User added to migration wave");

            }, "Adding to migration wave");
        }

        /// <summary>
        /// Export user detail snapshot
        /// </summary>
        private async Task ExportSnapshotAsync()
        {
            if (UserDetail == null) return;

            await ExecuteAsync(async () =>
            {
                var exportPath = await _dataExportService.ExportUserDetailAsync(UserDetail);
                StatusMessage = $"User details exported to {exportPath}";
                
                StructuredLogger?.LogInfo(LogSourceName, 
                    new { action = "export_snapshot", user_id = UserDetail.User.Sid, export_path = exportPath }, 
                    "User detail snapshot exported");

            }, "Exporting user details");
        }

        /// <summary>
        /// Close user detail view
        /// </summary>
        private void CloseUserDetail()
        {
            // Send close message via messenger
            SendMessage(new CloseUserDetailMessage());
        }

        public override async Task LoadAsync()
        {
            await LoadUserDetailAsync();
        }

        #endregion

        #region Dispose

        protected override void OnDisposing()
        {
            base.OnDisposing();
            
            // Clear collections to prevent memory leaks
            Groups?.Clear();
            Devices?.Clear();
            Apps?.Clear();
            FileAccess?.Clear();
            MappedDrives?.Clear();
            GpoLinks?.Clear();
            GpoFilters?.Clear();
            AzureRoles?.Clear();
            SqlDatabases?.Clear();
            Risks?.Clear();
        }

        /// <summary>
        /// Convert LogicEngineRisk to UI RiskAssessment
        /// </summary>
        private RiskAssessment ConvertToRiskAssessment(LogicEngineRisk logicRisk)
        {
            return new RiskAssessment
            {
                Title = $"{logicRisk.EntityType} Risk for {logicRisk.EntityId}",
                Description = $"Missing mappings: {string.Join(", ", logicRisk.MissingMappings)}\n" +
                             $"Orphaned ACLs: {string.Join(", ", logicRisk.OrphanedAcls)}\n" +
                             $"Unresolvable SID refs: {string.Join(", ", logicRisk.UnresolvableSidRefs)}",
                Category = RiskCategory.Technical,
                CurrentLevel = logicRisk.Severity switch
                {
                    "Critical" => RiskLevel.Critical,
                    "High" => RiskLevel.High,
                    "Medium" => RiskLevel.Medium,
                    "Low" => RiskLevel.Low,
                    _ => RiskLevel.Low
                },
                Status = RiskStatus.Open,
                LastAssessed = DateTime.Now
            };
        }

        #endregion
    }

    #region Messages

    /// <summary>
    /// Message to request closing user detail view
    /// </summary>
    public class CloseUserDetailMessage
    {
    }

    #endregion

    #region Stub Services

    /// <summary>
    /// Stub implementation for migration wave service until real implementation exists
    /// </summary>
    public class StubMigrationWaveService : IMigrationWaveService
    {
        private readonly ILogger _logger;

        public StubMigrationWaveService(ILogger logger)
        {
            _logger = logger;
        }

        public async Task AddUserToWaveAsync(UserDto user)
        {
            _logger.LogInformation("STUB: Adding user {UserName} ({UPN}) to migration wave", user.DisplayName, user.UPN);
            await Task.Delay(100); // Simulate work
        }
    }

    /// <summary>
    /// Stub implementation for data export service until real implementation exists
    /// </summary>
    public class StubDataExportService : IDataExportService
    {
        private readonly ILogger _logger;

        public StubDataExportService(ILogger logger)
        {
            _logger = logger;
        }

        public async Task<string> ExportUserDetailAsync(UserDetailProjection userDetail)
        {
            var filename = $"UserDetail_{userDetail.User.Sam}_{DateTime.UtcNow:yyyyMMdd_HHmmss}.json";
            var exportPath = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.MyDocuments), filename);
            
            _logger.LogInformation("STUB: Exporting user detail for {UserName} to {Path}", userDetail.User.DisplayName, exportPath);
            
            // Simulate export work
            await Task.Delay(200);
            
            return exportPath;
        }
    }

    #endregion

    #region Interfaces

    /// <summary>
    /// Interface for migration wave service
    /// </summary>
    public interface IMigrationWaveService
    {
        Task AddUserToWaveAsync(UserDto user);
    }

    /// <summary>
    /// Interface for data export service
    /// </summary>
    public interface IDataExportService
    {
        Task<string> ExportUserDetailAsync(UserDetailProjection userDetail);
    }

    #endregion
}