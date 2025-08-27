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
    /// ViewModel for AssetDetailView implementing the 7-tab detailed asset information interface
    /// Integrates with LogicEngineService for comprehensive asset data projection
    /// </summary>
    public class AssetDetailViewModel : BaseViewModel
    {
        private readonly ILogicEngineService _logicEngineService;
        private readonly IMigrationWaveService _migrationWaveService;
        private readonly IDataExportService _dataExportService;

        private string? _selectedDeviceName;
        private AssetDetailProjection? _assetDetail;

        // Tab collections
        private ObservableCollection<UserDto> _users = new();
        private ObservableCollection<AppDto> _apps = new();
        private ObservableCollection<AclEntry> _fileAccess = new();
        private ObservableCollection<GpoDto> _gpoLinks = new();
        private ObservableCollection<GroupDto> _groups = new();
        private ObservableCollection<SqlDbDto> _sqlDatabases = new();
        private ObservableCollection<RiskAssessment> _risks = new();

        // Asset basic info
        private string? _deviceName;
        private string? _dnsName;
        private string? _operatingSystem;
        private string? _organizationalUnit;
        private string? _primaryUserSid;
        private string? _primaryUserName;
        private bool _isOnline;
        private DateTime? _lastSeen;
        private DateTime? _createdDate;

        // Commands
        public ICommand AddToMigrationWaveCommand { get; private set; }
        public ICommand ExportSnapshotCommand { get; private set; }
        public ICommand RefreshDataCommand { get; private set; }
        public ICommand CloseCommand { get; private set; }

        public AssetDetailViewModel(
            ILogicEngineService logicEngineService,
            ILogger<AssetDetailViewModel> logger,
            IMigrationWaveService? migrationWaveService = null,
            IDataExportService? dataExportService = null)
            : base(logger)
        {
            _logicEngineService = logicEngineService ?? throw new ArgumentNullException(nameof(logicEngineService));
            _migrationWaveService = migrationWaveService ?? new StubMigrationWaveService(logger);
            _dataExportService = dataExportService ?? new StubDataExportService(logger);

            TabTitle = "Asset Details";
        }

        #region Properties

        /// <summary>
        /// Currently selected device name for loading details
        /// </summary>
        public string? SelectedDeviceName
        {
            get => _selectedDeviceName;
            set
            {
                if (value != _selectedDeviceName)
                {
                    _selectedDeviceName = value;
                    OnPropertyChanged();
                    _ = Task.Run(LoadAssetDetailAsync);
                }
            }
        }

        public AssetDetailProjection? AssetDetail
        {
            get => _assetDetail;
            private set => SetProperty(ref _assetDetail, value);
        }

        // Basic asset info properties
        public string? DeviceName
        {
            get => _deviceName;
            private set => SetProperty(ref _deviceName, value);
        }

        public string? DnsName
        {
            get => _dnsName;
            private set => SetProperty(ref _dnsName, value);
        }

        public string? OperatingSystem
        {
            get => _operatingSystem;
            private set => SetProperty(ref _operatingSystem, value);
        }

        public string? OrganizationalUnit
        {
            get => _organizationalUnit;
            private set => SetProperty(ref _organizationalUnit, value);
        }

        public string? PrimaryUserSid
        {
            get => _primaryUserSid;
            private set => SetProperty(ref _primaryUserSid, value);
        }

        public string? PrimaryUserName
        {
            get => _primaryUserName;
            private set => SetProperty(ref _primaryUserName, value);
        }

        public bool IsOnline
        {
            get => _isOnline;
            private set => SetProperty(ref _isOnline, value);
        }

        public DateTime? LastSeen
        {
            get => _lastSeen;
            private set => SetProperty(ref _lastSeen, value);
        }

        public DateTime? CreatedDate
        {
            get => _createdDate;
            private set => SetProperty(ref _createdDate, value);
        }

        // Tab collections
        public ObservableCollection<UserDto> Users
        {
            get => _users;
            private set => SetProperty(ref _users, value);
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

        public ObservableCollection<GpoDto> GpoLinks
        {
            get => _gpoLinks;
            private set => SetProperty(ref _gpoLinks, value);
        }

        public ObservableCollection<GroupDto> Groups
        {
            get => _groups;
            private set => SetProperty(ref _groups, value);
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

        public override bool HasData => AssetDetail != null;

        #endregion

        #region Methods

        protected override void InitializeCommands()
        {
            base.InitializeCommands();

            AddToMigrationWaveCommand = new AsyncRelayCommand(AddToMigrationWaveAsync, () => AssetDetail != null);
            ExportSnapshotCommand = new AsyncRelayCommand(ExportSnapshotAsync, () => AssetDetail != null);
            RefreshDataCommand = new AsyncRelayCommand(LoadAssetDetailAsync);
            CloseCommand = new RelayCommand(CloseAssetDetail);
        }

        /// <summary>
        /// Load asset detail data from LogicEngineService
        /// </summary>
        private async Task LoadAssetDetailAsync()
        {
            if (string.IsNullOrEmpty(SelectedDeviceName))
            {
                ClearAssetDetail();
                return;
            }

            await ExecuteAsync(async () =>
            {
                StructuredLogger?.LogDebug(LogSourceName, 
                    new { action = "load_asset_detail_start", device_name = SelectedDeviceName }, 
                    "Loading asset detail projection");

                var detail = await _logicEngineService.GetAssetDetailAsync(SelectedDeviceName);
                
                if (detail != null)
                {
                    AssetDetail = detail;
                    UpdateAssetBasicInfo(detail.Device);
                    UpdateTabCollections(detail);
                    
                    TabTitle = $"Asset Details - {detail.Device.Name ?? SelectedDeviceName}";
                    
                    StructuredLogger?.LogInfo(LogSourceName, 
                        new { 
                            action = "load_asset_detail_complete", 
                            device_name = SelectedDeviceName,
                            primary_user = detail.PrimaryUser?.DisplayName,
                            apps_count = detail.InstalledApps.Count,
                            risks_count = detail.Risks.Count
                        }, 
                        "Asset detail projection loaded successfully");
                }
                else
                {
                    ClearAssetDetail();
                    StatusMessage = "Asset not found";
                    
                    StructuredLogger?.LogWarning(LogSourceName, 
                        new { action = "load_asset_detail_notfound", device_name = SelectedDeviceName }, 
                        "Asset not found in LogicEngine data");
                }

            }, "Loading asset details");
        }

        /// <summary>
        /// Update basic asset information properties
        /// </summary>
        private void UpdateAssetBasicInfo(DeviceDto device)
        {
            DeviceName = device.Name;
            DnsName = device.DNS;
            OperatingSystem = device.OS;
            OrganizationalUnit = device.OU;
            PrimaryUserSid = device.PrimaryUserSid;
            // TODO: Resolve primary user name from SID
            PrimaryUserName = device.PrimaryUserSid; 
            IsOnline = true; // TODO: Add IsOnline to DeviceDto
            LastSeen = device.DiscoveryTimestamp;
            CreatedDate = device.DiscoveryTimestamp; // TODO: Add proper CreatedDate to DeviceDto
        }

        /// <summary>
        /// Update all tab collections from asset detail projection
        /// </summary>
        private void UpdateTabCollections(AssetDetailProjection detail)
        {
            // Update Users tab - only primary user for now
            Users.Clear();
            if (detail.PrimaryUser != null)
                Users.Add(detail.PrimaryUser);

            // Update Apps tab
            Apps.Clear();
            foreach (var app in detail.InstalledApps)
                Apps.Add(app);

            // Update File Access tab
            FileAccess.Clear();
            foreach (var acl in detail.SharesUsed)
                FileAccess.Add(acl);

            // Update GPO Links tab
            GpoLinks.Clear();
            foreach (var gpo in detail.GposApplied)
                GpoLinks.Add(gpo);

            // Update Groups tab - would need to be added to AssetDetailProjection
            Groups.Clear();
            // TODO: Add groups information to AssetDetailProjection

            // Update SQL Databases tab - would need to be added to AssetDetailProjection
            SqlDatabases.Clear();
            // TODO: Add SQL databases information to AssetDetailProjection

            // Update Risks tab
            Risks.Clear();
            foreach (var risk in detail.Risks)
                Risks.Add(ConvertToRiskAssessment(risk));
        }

        /// <summary>
        /// Clear all asset detail data
        /// </summary>
        private void ClearAssetDetail()
        {
            AssetDetail = null;
            
            // Clear basic info
            DeviceName = null;
            DnsName = null;
            OperatingSystem = null;
            OrganizationalUnit = null;
            PrimaryUserSid = null;
            PrimaryUserName = null;
            IsOnline = false;
            LastSeen = null;
            CreatedDate = null;

            // Clear tab collections
            Users.Clear();
            Apps.Clear();
            FileAccess.Clear();
            GpoLinks.Clear();
            Groups.Clear();
            SqlDatabases.Clear();
            Risks.Clear();

            TabTitle = "Asset Details";
        }

        /// <summary>
        /// Add current asset to a migration wave
        /// </summary>
        private async Task AddToMigrationWaveAsync()
        {
            if (AssetDetail == null) return;

            await ExecuteAsync(async () =>
            {
                // Use stub service for now - proper implementation will be added later
                if (_migrationWaveService is StubMigrationWaveService stub)
                {
                    await stub.AddAssetToWaveAsync(AssetDetail.Device);
                }
                
                StatusMessage = $"Asset {AssetDetail.Device.Name} added to migration wave";
                
                StructuredLogger?.LogInfo(LogSourceName, 
                    new { action = "add_to_migration_wave", device_name = AssetDetail.Device.Name }, 
                    "Asset added to migration wave");

            }, "Adding to migration wave");
        }

        /// <summary>
        /// Export asset detail snapshot
        /// </summary>
        private async Task ExportSnapshotAsync()
        {
            if (AssetDetail == null) return;

            await ExecuteAsync(async () =>
            {
                // Use stub service for now - proper implementation will be added later
                var exportPath = "";
                if (_dataExportService is StubDataExportService stub)
                {
                    exportPath = await stub.ExportAssetDetailAsync(AssetDetail);
                }
                
                StatusMessage = $"Asset details exported to {exportPath}";
                
                StructuredLogger?.LogInfo(LogSourceName, 
                    new { action = "export_snapshot", device_name = AssetDetail.Device.Name, export_path = exportPath }, 
                    "Asset detail snapshot exported");

            }, "Exporting asset details");
        }

        /// <summary>
        /// Close asset detail view
        /// </summary>
        private void CloseAssetDetail()
        {
            // Send close message via messenger
            SendMessage(new CloseAssetDetailMessage());
        }

        public override async Task LoadAsync()
        {
            await LoadAssetDetailAsync();
        }

        #endregion

        #region Dispose

        protected override void OnDisposing()
        {
            base.OnDisposing();
            
            // Clear collections to prevent memory leaks
            Users?.Clear();
            Apps?.Clear();
            FileAccess?.Clear();
            GpoLinks?.Clear();
            Groups?.Clear();
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
    /// Message to request closing asset detail view
    /// </summary>
    public class CloseAssetDetailMessage
    {
    }

    #endregion
}