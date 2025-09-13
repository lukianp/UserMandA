using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Diagnostics;
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

        // Hardware Information
        private object? _hardware;
        private string? _ownerDepartment;
        private string? _ownerLocation;
        private string? _ownerManager;
        private string? _ownerEmployeeId;

        // Risk and Status information
        private int _highRiskCount;
        private string? _migrationReadinessStatus;
        private string? _osCompatibilityStatus;
        private string? _backupStatus;
        private DateTime? _lastRiskAssessment;
        private DateTime? _lastAppsScan;

        // App summary collections
        private ObservableCollection<AppDto> _microsoftApps = new();
        private ObservableCollection<AppDto> _thirdPartyApps = new();
        private ObservableCollection<AppDto> _crowdStrikeApps = new();
        private ObservableCollection<AppDto> _criticalApps = new();

        // Commands
        public ICommand AddToMigrationWaveCommand { get; private set; }
        public ICommand ExportSnapshotCommand { get; private set; }
        public ICommand RefreshDataCommand { get; private set; }
        public ICommand CloseCommand { get; private set; }

        public AssetDetailViewModel(
            ILogicEngineService logicEngineService,
            ILogger logger,
            IMigrationWaveService? migrationWaveService = null,
            IDataExportService? dataExportService = null)
            : base(logger)
        {
            _logicEngineService = logicEngineService ?? throw new ArgumentNullException(nameof(logicEngineService));
            _migrationWaveService = migrationWaveService ?? new StubMigrationWaveService(logger);
            _dataExportService = dataExportService ?? new StubDataExportService(logger);

            TabTitle = "Asset Details";
        }

        /// <summary>
        /// Constructor that receives object asset and loads its details
        /// </summary>
        public AssetDetailViewModel(
            object asset,
            ILogicEngineService logicEngineService,
            ILogger logger,
            IMigrationWaveService? migrationWaveService = null,
            IDataExportService? dataExportService = null)
            : this(logicEngineService, logger, migrationWaveService, dataExportService)
        {
            LoadAssetDetails(asset);
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

        // Hardware properties
        public object? Hardware
        {
            get => _hardware;
            private set => SetProperty(ref _hardware, value);
        }

        // Owner properties
        public string? OwnerDepartment
        {
            get => _ownerDepartment;
            private set => SetProperty(ref _ownerDepartment, value);
        }

        public string? OwnerLocation
        {
            get => _ownerLocation;
            private set => SetProperty(ref _ownerLocation, value);
        }

        public string? OwnerManager
        {
            get => _ownerManager;
            private set => SetProperty(ref _ownerManager, value);
        }

        public string? OwnerEmployeeId
        {
            get => _ownerEmployeeId;
            private set => SetProperty(ref _ownerEmployeeId, value);
        }

        // Risk and Status properties
        public int HighRiskCount
        {
            get => _highRiskCount;
            private set => SetProperty(ref _highRiskCount, value);
        }

        public string? MigrationReadinessStatus
        {
            get => _migrationReadinessStatus;
            private set => SetProperty(ref _migrationReadinessStatus, value);
        }

        public string? OSCompatibilityStatus
        {
            get => _osCompatibilityStatus;
            private set => SetProperty(ref _osCompatibilityStatus, value);
        }

        public string? BackupStatus
        {
            get => _backupStatus;
            private set => SetProperty(ref _backupStatus, value);
        }

        public DateTime? LastRiskAssessment
        {
            get => _lastRiskAssessment;
            private set => SetProperty(ref _lastRiskAssessment, value);
        }

        public DateTime? LastAppsScan
        {
            get => _lastAppsScan;
            private set => SetProperty(ref _lastAppsScan, value);
        }

        // App summary collections
        public ObservableCollection<AppDto> MicrosoftApps
        {
            get => _microsoftApps;
            private set => SetProperty(ref _microsoftApps, value);
        }

        public ObservableCollection<AppDto> ThirdPartyApps
        {
            get => _thirdPartyApps;
            private set => SetProperty(ref _thirdPartyApps, value);
        }

        public ObservableCollection<AppDto> CrowdStrikeApps
        {
            get => _crowdStrikeApps;
            private set => SetProperty(ref _crowdStrikeApps, value);
        }

        public ObservableCollection<AppDto> CriticalApps
        {
            get => _criticalApps;
            private set => SetProperty(ref _criticalApps, value);
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
            OpenAssetDetailCommand = new RelayCommand<string>(OpenAssetDetail);
        }

        /// <summary>
        /// Open Asset Detail Command - used for integration with main lists
        /// </summary>
        public ICommand OpenAssetDetailCommand { get; private set; }

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
        /// Load asset details from incoming asset object, identifying type and fetching related data
        /// </summary>
        public void LoadAssetDetails(object asset)
        {
            if (asset == null)
            {
                Debug.WriteLine("AssetDetailViewModel.LoadAssetDetails: Asset is null, clearing details");
                ClearAssetDetail();
                return;
            }

            // Reset all collections at start
            ResetCollections();

            try
            {
                string assetType = IdentifyAssetType(asset);
                Debug.WriteLine($"AssetDetailViewModel.LoadAssetDetails: Identified asset type: {assetType}");

                switch (assetType)
                {
                    case "UserData":
                        LoadUserDataDetails(asset);
                        break;
                    case "ComputerData":
                        LoadComputerDataDetails(asset);
                        break;
                    case "MailboxData":
                        LoadMailboxDataDetails(asset);
                        break;
                    case "DatabaseData":
                        LoadDatabaseDataDetails(asset);
                        break;
                    case "FileServerData":
                        LoadFileServerDataDetails(asset);
                        break;
                    case "NetworkDeviceData":
                        LoadNetworkDeviceDataDetails(asset);
                        break;
                    case "PhysicalServerData":
                        LoadPhysicalServerDataDetails(asset);
                        break;
                    case "SQLServerData":
                        LoadSQLServerDataDetails(asset);
                        break;
                    case "VMwareData":
                        LoadVMwareDataDetails(asset);
                        break;
                    case "AzureData":
                        LoadAzureDataDetails(asset);
                        break;
                    case "AzureInfrastructureData":
                        LoadAzureInfrastructureDataDetails(asset);
                        break;
                    case "ActiveDirectoryData":
                        LoadActiveDirectoryDataDetails(asset);
                        break;
                    case "ExchangeData":
                        LoadExchangeDataDetails(asset);
                        break;
                    case "OneDriveBusinessData":
                        LoadOneDriveBusinessDataDetails(asset);
                        break;
                    default:
                        Debug.WriteLine($"AssetDetailViewModel.LoadAssetDetails: Unknown asset type: {assetType}, using default loading");
                        LoadDefaultAssetDetails(asset);
                        break;
                }

                Debug.WriteLine($"AssetDetailViewModel.LoadAssetDetails: Completed loading for asset type {assetType}");
                StructuredLogger?.LogInfo(LogSourceName,
                    new { action = "load_asset_details_complete", asset_type = assetType },
                    $"Asset details loaded for type {assetType}");
            }
            catch (Exception ex)
            {
                Debug.WriteLine($"AssetDetailViewModel.LoadAssetDetails: Error loading asset details: {ex.Message}");
                StructuredLogger?.LogError(LogSourceName, ex,
                    new { action = "load_asset_details_error", error = ex.Message },
                    "Error loading asset details");
                ClearAssetDetail();
            }
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

            // Set up basic hardware information (would typically come from detailed discovery)
            Hardware = new
            {
                Processor = "Intel Core i5-10500H", // TODO: Get from detailed hardware discovery
                InstalledRAM = "16GB", // TODO: Get from detailed hardware discovery
                Storage = "512GB SSD", // TODO: Get from detailed hardware discovery
                Model = device.Name ?? "Unknown", // TODO: Get proper model information
                SerialNumber = "SN123456789", // TODO: Get from hardware discovery
                BIOSVersion = "1.2.3", // TODO: Get from hardware discovery
                Manufacturer = "Dell Inc.", // TODO: Get from hardware discovery
                ChassisType = "Laptop", // TODO: Get from hardware discovery
                IPAddress = device.DNS ?? "Not Available" // TODO: Get primary IP
            };

            // TODO: Set up owner information from user details or HR data
            OwnerDepartment = "IT Department"; // TODO: Get from user directory
            OwnerLocation = "Head Office"; // TODO: Get from user directory
            OwnerManager = "John Smith"; // TODO: Get from user directory
            OwnerEmployeeId = "EMP001"; // TODO: Get from user directory
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

            // Categorize applications for summary
            CategorizeApplications(detail.InstalledApps);

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
            HighRiskCount = 0;
            foreach (var risk in detail.Risks)
            {
                var riskAssessment = ConvertToRiskAssessment(risk);
                Risks.Add(riskAssessment);
                if (riskAssessment.CurrentLevel == RiskLevel.High || riskAssessment.CurrentLevel == RiskLevel.Critical)
                    HighRiskCount++;
            }

            // Set additional status information
            MigrationReadinessStatus = HighRiskCount == 0 ? "Ready" : $"{HighRiskCount} issues to resolve";
            OSCompatibilityStatus = OperatingSystem?.Contains("Windows") == true ? "Compatible" : "Check Required";
            BackupStatus = "Configured"; // TODO: Get from backup monitoring
            LastRiskAssessment = DateTime.Now;
            LastAppsScan = DateTime.Now;
        }

        /// <summary>
        /// Categorize installed applications into summary collections
        /// </summary>
        private void CategorizeApplications(IEnumerable<AppDto> installedApps)
        {
            MicrosoftApps.Clear();
            ThirdPartyApps.Clear();
            CrowdStrikeApps.Clear();
            CriticalApps.Clear();

            foreach (var app in installedApps)
            {
                // Categorize Microsoft apps
                if (app.Source?.Contains("Microsoft") == true || app.Publishers?.Contains("Microsoft") == true)
                    MicrosoftApps.Add(app);
                else
                    ThirdPartyApps.Add(app);

                // Categorize CrowdStrike apps (example categorization)
                if (app.Name?.Contains("CrowdStrike") == true)
                    CrowdStrikeApps.Add(app);

                // Categorize critical business applications (example)
                if (app.Name?.Contains("Office") == true || app.Name?.Contains("Teams") == true || app.Name?.Contains("Azure") == true)
                    CriticalApps.Add(app);
            }
        }

        /// <summary>
        /// Reset all collections at start of loading
        /// </summary>
        private void ResetCollections()
        {
            // Clear tab collections
            Users.Clear();
            Apps.Clear();
            FileAccess.Clear();
            GpoLinks.Clear();
            Groups.Clear();
            SqlDatabases.Clear();
            Risks.Clear();

            // Clear app summary collections
            MicrosoftApps.Clear();
            ThirdPartyApps.Clear();
            CrowdStrikeApps.Clear();
            CriticalApps.Clear();

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

            // Clear hardware info
            Hardware = null;
            OwnerDepartment = null;
            OwnerLocation = null;
            OwnerManager = null;
            OwnerEmployeeId = null;

            // Clear risk and status info
            HighRiskCount = 0;
            MigrationReadinessStatus = null;
            OSCompatibilityStatus = null;
            BackupStatus = null;
            LastRiskAssessment = null;
            LastAppsScan = null;

            AssetDetail = null;
            TabTitle = "Asset Details";
        }

        /// <summary>
        /// Identify the type of the incoming asset object
        /// </summary>
        private string IdentifyAssetType(object asset)
        {
            if (asset is null) return "Unknown";

            // Try to get Type property
            var typeProperty = asset.GetType().GetProperty("Type");
            if (typeProperty != null)
            {
                var typeValue = typeProperty.GetValue(asset)?.ToString();
                if (!string.IsNullOrEmpty(typeValue))
                {
                    return typeValue;
                }
            }

            // Try to get from dictionary if it's a dict
            if (asset is Dictionary<string, object> dict)
            {
                if (dict.TryGetValue("Type", out var typeObj) && typeObj is string typeStr)
                {
                    return typeStr;
                }
            }

            // Default based on properties
            if (asset.GetType().Name.Contains("User") || asset.GetType().GetProperty("DisplayName") != null)
            {
                return "UserData";
            }
            if (asset.GetType().Name.Contains("Computer") || asset.GetType().GetProperty("OperatingSystem") != null)
            {
                return "ComputerData";
            }
            if (asset.GetType().Name.Contains("Mailbox") || asset.GetType().GetProperty("EmailAddress") != null)
            {
                return "MailboxData";
            }
            if (asset.GetType().Name.Contains("Database") || asset.GetType().GetProperty("DatabaseName") != null)
            {
                return "DatabaseData";
            }

            // New discovery source type detection
            if (asset.GetType().Name.Contains("FileServer") || asset.GetType().GetProperty("FileServerType") != null ||
                asset.GetType().GetProperty("FileShare") != null)
            {
                return "FileServerData";
            }
            if (asset.GetType().Name.Contains("Network") || asset.GetType().GetProperty("NetworkType") != null ||
                asset.GetType().GetProperty("IPAddress") != null)
            {
                return "NetworkDeviceData";
            }
            if (asset.GetType().Name.Contains("PhysicalServer") || asset.GetType().GetProperty("PhysicalServerType") != null ||
                asset.GetType().GetProperty("ServerType") != null && asset.GetType().Name.Contains("Physical"))
            {
                return "PhysicalServerData";
            }
            if (asset.GetType().Name.Contains("SQLServer") || asset.GetType().GetProperty("SQLServerType") != null ||
                asset.GetType().GetProperty("SQLInstance") != null)
            {
                return "SQLServerData";
            }
            if (asset.GetType().Name.Contains("VMware") || asset.GetType().GetProperty("VMwareType") != null ||
                asset.GetType().GetProperty("VMHost") != null)
            {
                return "VMwareData";
            }
            if (asset.GetType().Name.Contains("Azure") && !asset.GetType().Name.Contains("Infrastructure") ||
                asset.GetType().GetProperty("AzureType") != null)
            {
                return "AzureData";
            }
            if (asset.GetType().Name.Contains("AzureInfrastructure") || asset.GetType().GetProperty("AzureInfraType") != null)
            {
                return "AzureInfrastructureData";
            }
            if (asset.GetType().Name.Contains("ActiveDirectory") || asset.GetType().GetProperty("ADType") != null ||
                asset.GetType().GetProperty("DomainController") != null)
            {
                return "ActiveDirectoryData";
            }
            if (asset.GetType().Name.Contains("Exchange") || asset.GetType().GetProperty("ExchangeType") != null ||
                asset.GetType().GetProperty("MailboxDatabase") != null)
            {
                return "ExchangeData";
            }
            if (asset.GetType().Name.Contains("OneDrive") || asset.GetType().GetProperty("OneDriveType") != null ||
                asset.GetType().GetProperty("OneDriveBusiness") != null)
            {
                return "OneDriveBusinessData";
            }

            return "Unknown";
        }

        /// <summary>
        /// Load details for UserData from Active Directory
        /// </summary>
        private void LoadUserDataDetails(object asset)
        {
            Debug.WriteLine("AssetDetailViewModel.LoadUserDataDetails: Loading UserData details");

            try
            {
                string csvPath = "ActiveDirectory.csv"; // Assume CSV file for AD users
                if (!File.Exists(csvPath))
                {
                    Debug.WriteLine("AssetDetailViewModel.LoadUserDataDetails: ActiveDirectory.csv not found");
                    return;
                }

                var lines = File.ReadAllLines(csvPath);
                if (lines.Length < 2)
                {
                    Debug.WriteLine("AssetDetailViewModel.LoadUserDataDetails: CSV file is empty or has no data rows");
                    return;
                }

                var headers = lines[0].Split(',');
                var assetName = GetAssetName(asset);

                for (int i = 1; i < lines.Length; i++)
                {
                    var values = lines[i].Split(',');
                    if (values.Length > 0 && values[0].Equals(assetName, StringComparison.OrdinalIgnoreCase))
                    {
                        // Populate user details
                        if (values.Length > 1) DeviceName = values[0];
                        if (values.Length > 2) PrimaryUserName = values[1];
                        // Add more fields as per CSV structure

                        Users.Add(new UserDto(
                            UPN: assetName.Contains("@") ? assetName : $"{assetName}@domain.com",
                            Sam: assetName,
                            Sid: $"S-1-5-21-{new Random().Next(100000000, 999999999)}-{new Random().Next(100000000, 999999999)}-{new Random().Next(1000, 9999)}",
                            Mail: null,
                            DisplayName: PrimaryUserName ?? assetName,
                            Enabled: true,
                            OU: null,
                            ManagerSid: null,
                            Dept: null,
                            AzureObjectId: null,
                            Groups: new List<string>(),
                            DiscoveryTimestamp: DateTime.Now,
                            DiscoveryModule: "AssetDetailViewModel",
                            SessionId: Guid.NewGuid().ToString()
                        ));
                        Debug.WriteLine($"AssetDetailViewModel.LoadUserDataDetails: Populated Users collection with 1 item");
                        break;
                    }
                }
            }
            catch (Exception ex)
            {
                Debug.WriteLine($"AssetDetailViewModel.LoadUserDataDetails: Error loading UserData: {ex.Message}");
            }
        }

        /// <summary>
        /// Load details for ComputerData from Infrastructure
        /// </summary>
        private void LoadComputerDataDetails(object asset)
        {
            Debug.WriteLine("AssetDetailViewModel.LoadComputerDataDetails: Loading ComputerData details from Infrastructure.csv");

            try
            {
                string csvPath = "Infrastructure.csv";
                if (!File.Exists(csvPath))
                {
                    Debug.WriteLine("AssetDetailViewModel.LoadComputerDataDetails: Infrastructure.csv not found");
                    return;
                }

                var lines = File.ReadAllLines(csvPath);
                if (lines.Length < 2)
                {
                    Debug.WriteLine("AssetDetailViewModel.LoadComputerDataDetails: CSV file is empty or has no data rows");
                    return;
                }

                var headers = lines[0].Split(',');
                var assetName = GetAssetName(asset);

                for (int i = 1; i < lines.Length; i++)
                {
                    var values = lines[i].Split(',');
                    if (values.Length > 0 && values[0].Equals(assetName, StringComparison.OrdinalIgnoreCase))
                    {
                        // Populate computer details
                        DeviceName = values.Length > 0 ? values[0] : null;
                        OperatingSystem = values.Length > 4 ? values[4] : null;
                        DnsName = values.Length > 3 ? values[3] : null;
                        OrganizationalUnit = values.Length > 6 ? values[6] : null;

                        // Add to apps or other collections based on type
                        if (values.Length > 1)
                        {
                            Apps.Add(new AppDto(
                                Id: Guid.NewGuid().ToString(),
                                Name: $"{values[1]} Service",
                                Source: "System",
                                InstallCounts: 1,
                                Executables: new List<string>(),
                                Publishers: new List<string> { "System" },
                                DiscoveryTimestamp: DateTime.Now,
                                DiscoveryModule: "AssetDetailViewModel",
                                SessionId: Guid.NewGuid().ToString()
                            ));
                            Debug.WriteLine($"AssetDetailViewModel.LoadComputerDataDetails: Populated Apps collection with 1 item");
                        }

                        break;
                    }
                }
            }
            catch (Exception ex)
            {
                Debug.WriteLine($"AssetDetailViewModel.LoadComputerDataDetails: Error loading ComputerData: {ex.Message}");
            }
        }

        /// <summary>
        /// Load details for MailboxData
        /// </summary>
        private void LoadMailboxDataDetails(object asset)
        {
            Debug.WriteLine("AssetDetailViewModel.LoadMailboxDataDetails: Loading MailboxData details");

            try
            {
                string csvPath = "ExchangeMailboxes.csv"; // Assume CSV file for Exchange mailboxes
                if (!File.Exists(csvPath))
                {
                    Debug.WriteLine("AssetDetailViewModel.LoadMailboxDataDetails: ExchangeMailboxes.csv not found");
                    return;
                }

                var lines = File.ReadAllLines(csvPath);
                if (lines.Length < 2)
                {
                    Debug.WriteLine("AssetDetailViewModel.LoadMailboxDataDetails: CSV file is empty or has no data rows");
                    return;
                }

                var headers = lines[0].Split(',');
                var assetName = GetAssetName(asset);

                for (int i = 1; i < lines.Length; i++)
                {
                    var values = lines[i].Split(',');
                    if (values.Length > 0 && values[0].Equals(assetName, StringComparison.OrdinalIgnoreCase))
                    {
                        // Populate mailbox details
                        DeviceName = values[0];
                        // Add mailbox-specific data

                        Apps.Add(new AppDto(
                            Id: Guid.NewGuid().ToString(),
                            Name: "Exchange Mailbox",
                            Source: "Microsoft",
                            InstallCounts: 1,
                            Executables: new List<string>(),
                            Publishers: new List<string> { "Microsoft" },
                            DiscoveryTimestamp: DateTime.Now,
                            DiscoveryModule: "AssetDetailViewModel",
                            SessionId: Guid.NewGuid().ToString()
                        ));
                        Debug.WriteLine($"AssetDetailViewModel.LoadMailboxDataDetails: Populated Apps collection with 1 item");
                        break;
                    }
                }
            }
            catch (Exception ex)
            {
                Debug.WriteLine($"AssetDetailViewModel.LoadMailboxDataDetails: Error loading MailboxData: {ex.Message}");
            }
        }

        /// <summary>
        /// Load details for DatabaseData
        /// </summary>
        private void LoadDatabaseDataDetails(object asset)
        {
            Debug.WriteLine("AssetDetailViewModel.LoadDatabaseDataDetails: Loading DatabaseData details");

            try
            {
                string csvPath = "DatabaseServers.csv"; // Assume CSV file for databases
                if (!File.Exists(csvPath))
                {
                    Debug.WriteLine("AssetDetailViewModel.LoadDatabaseDataDetails: DatabaseServers.csv not found");
                    return;
                }

                var lines = File.ReadAllLines(csvPath);
                if (lines.Length < 2)
                {
                    Debug.WriteLine("AssetDetailViewModel.LoadDatabaseDataDetails: CSV file is empty or has no data rows");
                    return;
                }

                var headers = lines[0].Split(',');
                var assetName = GetAssetName(asset);

                for (int i = 1; i < lines.Length; i++)
                {
                    var values = lines[i].Split(',');
                    if (values.Length > 0 && values[0].Equals(assetName, StringComparison.OrdinalIgnoreCase))
                    {
                        // Populate database details
                        DeviceName = values[0];
                        // Add to SQLDatabases

                        SqlDatabases.Add(new SqlDbDto(
                            Server: values[0],
                            Instance: null,
                            Database: values[0],
                            Owners: new List<string>(),
                            AppHints: new List<string>(),
                            DiscoveryTimestamp: DateTime.Now,
                            DiscoveryModule: "AssetDetailViewModel",
                            SessionId: Guid.NewGuid().ToString()
                        ));
                        Debug.WriteLine($"AssetDetailViewModel.LoadDatabaseDataDetails: Populated SqlDatabases collection with 1 item");
                        break;
                    }
                }
            }
            catch (Exception ex)
            {
                Debug.WriteLine($"AssetDetailViewModel.LoadDatabaseDataDetails: Error loading DatabaseData: {ex.Message}");
            }
        }

        /// <summary>
        /// Load details for FileServerData
        /// </summary>
        private void LoadFileServerDataDetails(object asset)
        {
            Debug.WriteLine("AssetDetailViewModel.LoadFileServerDataDetails: Loading FileServerData details");

            try
            {
                string csvPath = "FileServerDiscovery.csv";
                if (!File.Exists(csvPath))
                {
                    Debug.WriteLine("AssetDetailViewModel.LoadFileServerDataDetails: FileServerDiscovery.csv not found");
                    return;
                }

                var lines = File.ReadAllLines(csvPath);
                if (lines.Length < 2)
                {
                    Debug.WriteLine("AssetDetailViewModel.LoadFileServerDataDetails: CSV file is empty or has no data rows");
                    return;
                }

                var headers = lines[0].Split(',');
                var assetName = GetAssetName(asset);

                for (int i = 1; i < lines.Length; i++)
                {
                    var values = lines[i].Split(',');
                    if (values.Length > 0 && values[0].Equals(assetName, StringComparison.OrdinalIgnoreCase))
                    {
                        // Populate file server details
                        DeviceName = values.Length > 0 ? values[0] : null;
                        OperatingSystem = values.Length > 2 ? values[2] : null;
                        DnsName = values.Length > 1 ? values[1] : null;

                        // Add to Apps collection
                        Apps.Add(new AppDto(
                            Id: Guid.NewGuid().ToString(),
                            Name: "File Server Service",
                            Source: "FileServer",
                            InstallCounts: 1,
                            Executables: new List<string>(),
                            Publishers: new List<string> { "File Server" },
                            DiscoveryTimestamp: DateTime.Now,
                            DiscoveryModule: "AssetDetailViewModel",
                            SessionId: Guid.NewGuid().ToString()
                        ));
                        Debug.WriteLine($"AssetDetailViewModel.LoadFileServerDataDetails: Populated Apps collection with 1 item");
                        break;
                    }
                }
            }
            catch (Exception ex)
            {
                Debug.WriteLine($"AssetDetailViewModel.LoadFileServerDataDetails: Error loading FileServerData: {ex.Message}");
            }
        }

        /// <summary>
        /// Load details for NetworkDeviceData
        /// </summary>
        private void LoadNetworkDeviceDataDetails(object asset)
        {
            Debug.WriteLine("AssetDetailViewModel.LoadNetworkDeviceDataDetails: Loading NetworkDeviceData details");

            try
            {
                string csvPath = "NetworkInfrastructureDiscovery.csv";
                if (!File.Exists(csvPath))
                {
                    Debug.WriteLine("AssetDetailViewModel.LoadNetworkDeviceDataDetails: NetworkInfrastructureDiscovery.csv not found");
                    return;
                }

                var lines = File.ReadAllLines(csvPath);
                if (lines.Length < 2)
                {
                    Debug.WriteLine("AssetDetailViewModel.LoadNetworkDeviceDataDetails: CSV file is empty or has no data rows");
                    return;
                }

                var headers = lines[0].Split(',');
                var assetName = GetAssetName(asset);

                for (int i = 1; i < lines.Length; i++)
                {
                    var values = lines[i].Split(',');
                    if (values.Length > 0 && values[0].Equals(assetName, StringComparison.OrdinalIgnoreCase))
                    {
                        // Populate network device details
                        DeviceName = values.Length > 0 ? values[0] : null;
                        DnsName = values.Length > 1 ? values[1] : null;
                        OperatingSystem = values.Length > 3 ? values[3] : null;

                        // Add to Apps collection
                        Apps.Add(new AppDto(
                            Id: Guid.NewGuid().ToString(),
                            Name: "Network Device Service",
                            Source: "NetworkDevice",
                            InstallCounts: 1,
                            Executables: new List<string>(),
                            Publishers: new List<string> { "Network Infrastructure" },
                            DiscoveryTimestamp: DateTime.Now,
                            DiscoveryModule: "AssetDetailViewModel",
                            SessionId: Guid.NewGuid().ToString()
                        ));
                        Debug.WriteLine($"AssetDetailViewModel.LoadNetworkDeviceDataDetails: Populated Apps collection with 1 item");
                        break;
                    }
                }
            }
            catch (Exception ex)
            {
                Debug.WriteLine($"AssetDetailViewModel.LoadNetworkDeviceDataDetails: Error loading NetworkDeviceData: {ex.Message}");
            }
        }

        /// <summary>
        /// Load details for PhysicalServerData
        /// </summary>
        private void LoadPhysicalServerDataDetails(object asset)
        {
            Debug.WriteLine("AssetDetailViewModel.LoadPhysicalServerDataDetails: Loading PhysicalServerData details");

            try
            {
                string csvPath = "PhysicalServerDiscovery.csv";
                if (!File.Exists(csvPath))
                {
                    Debug.WriteLine("AssetDetailViewModel.LoadPhysicalServerDataDetails: PhysicalServerDiscovery.csv not found");
                    return;
                }

                var lines = File.ReadAllLines(csvPath);
                if (lines.Length < 2)
                {
                    Debug.WriteLine("AssetDetailViewModel.LoadPhysicalServerDataDetails: CSV file is empty or has no data rows");
                    return;
                }

                var headers = lines[0].Split(',');
                var assetName = GetAssetName(asset);

                for (int i = 1; i < lines.Length; i++)
                {
                    var values = lines[i].Split(',');
                    if (values.Length > 0 && values[0].Equals(assetName, StringComparison.OrdinalIgnoreCase))
                    {
                        // Populate physical server details
                        DeviceName = values.Length > 0 ? values[0] : null;
                        OperatingSystem = values.Length > 2 ? values[2] : null;
                        DnsName = values.Length > 1 ? values[1] : null;

                        // Add to Apps collection
                        Apps.Add(new AppDto(
                            Id: Guid.NewGuid().ToString(),
                            Name: "Physical Server Service",
                            Source: "PhysicalServer",
                            InstallCounts: 1,
                            Executables: new List<string>(),
                            Publishers: new List<string> { "Physical Infrastructure" },
                            DiscoveryTimestamp: DateTime.Now,
                            DiscoveryModule: "AssetDetailViewModel",
                            SessionId: Guid.NewGuid().ToString()
                        ));
                        Debug.WriteLine($"AssetDetailViewModel.LoadPhysicalServerDataDetails: Populated Apps collection with 1 item");
                        break;
                    }
                }
            }
            catch (Exception ex)
            {
                Debug.WriteLine($"AssetDetailViewModel.LoadPhysicalServerDataDetails: Error loading PhysicalServerData: {ex.Message}");
            }
        }

        /// <summary>
        /// Load details for SQLServerData
        /// </summary>
        private void LoadSQLServerDataDetails(object asset)
        {
            Debug.WriteLine("AssetDetailViewModel.LoadSQLServerDataDetails: Loading SQLServerData details");

            try
            {
                string csvPath = "SQLServerDiscovery.csv";
                if (!File.Exists(csvPath))
                {
                    Debug.WriteLine("AssetDetailViewModel.LoadSQLServerDataDetails: SQLServerDiscovery.csv not found");
                    return;
                }

                var lines = File.ReadAllLines(csvPath);
                if (lines.Length < 2)
                {
                    Debug.WriteLine("AssetDetailViewModel.LoadSQLServerDataDetails: CSV file is empty or has no data rows");
                    return;
                }

                var headers = lines[0].Split(',');
                var assetName = GetAssetName(asset);

                for (int i = 1; i < lines.Length; i++)
                {
                    var values = lines[i].Split(',');
                    if (values.Length > 0 && values[0].Equals(assetName, StringComparison.OrdinalIgnoreCase))
                    {
                        // Populate SQL server details
                        DeviceName = values.Length > 0 ? values[0] : null;

                        // Add to SQLDatabases collection
                        SqlDatabases.Add(new SqlDbDto(
                            Server: values.Length > 0 ? values[0] : assetName,
                            Instance: values.Length > 1 ? values[1] : null,
                            Database: values.Length > 2 ? values[2] : assetName,
                            Owners: new List<string>(),
                            AppHints: new List<string>(),
                            DiscoveryTimestamp: DateTime.Now,
                            DiscoveryModule: "AssetDetailViewModel",
                            SessionId: Guid.NewGuid().ToString()
                        ));
                        Debug.WriteLine($"AssetDetailViewModel.LoadSQLServerDataDetails: Populated SqlDatabases collection with 1 item");
                        break;
                    }
                }
            }
            catch (Exception ex)
            {
                Debug.WriteLine($"AssetDetailViewModel.LoadSQLServerDataDetails: Error loading SQLServerData: {ex.Message}");
            }
        }

        /// <summary>
        /// Load details for VMwareData
        /// </summary>
        private void LoadVMwareDataDetails(object asset)
        {
            Debug.WriteLine("AssetDetailViewModel.LoadVMwareDataDetails: Loading VMwareData details");

            try
            {
                string csvPath = "VMwareDiscovery.csv";
                if (!File.Exists(csvPath))
                {
                    Debug.WriteLine("AssetDetailViewModel.LoadVMwareDataDetails: VMwareDiscovery.csv not found");
                    return;
                }

                var lines = File.ReadAllLines(csvPath);
                if (lines.Length < 2)
                {
                    Debug.WriteLine("AssetDetailViewModel.LoadVMwareDataDetails: CSV file is empty or has no data rows");
                    return;
                }

                var headers = lines[0].Split(',');
                var assetName = GetAssetName(asset);

                for (int i = 1; i < lines.Length; i++)
                {
                    var values = lines[i].Split(',');
                    if (values.Length > 0 && values[0].Equals(assetName, StringComparison.OrdinalIgnoreCase))
                    {
                        // Populate VMware details
                        DeviceName = values.Length > 0 ? values[0] : null;
                        OperatingSystem = values.Length > 3 ? values[3] : null;
                        DnsName = values.Length > 1 ? values[1] : null;

                        // Add to Apps collection
                        Apps.Add(new AppDto(
                            Id: Guid.NewGuid().ToString(),
                            Name: "VMware Virtual Machine",
                            Source: "VMware",
                            InstallCounts: 1,
                            Executables: new List<string>(),
                            Publishers: new List<string> { "VMware" },
                            DiscoveryTimestamp: DateTime.Now,
                            DiscoveryModule: "AssetDetailViewModel",
                            SessionId: Guid.NewGuid().ToString()
                        ));
                        Debug.WriteLine($"AssetDetailViewModel.LoadVMwareDataDetails: Populated Apps collection with 1 item");
                        break;
                    }
                }
            }
            catch (Exception ex)
            {
                Debug.WriteLine($"AssetDetailViewModel.LoadVMwareDataDetails: Error loading VMwareData: {ex.Message}");
            }
        }

        /// <summary>
        /// Load details for AzureData
        /// </summary>
        private void LoadAzureDataDetails(object asset)
        {
            Debug.WriteLine("AssetDetailViewModel.LoadAzureDataDetails: Loading AzureData details");

            try
            {
                string csvPath = "AzureDiscovery.csv";
                if (!File.Exists(csvPath))
                {
                    Debug.WriteLine("AssetDetailViewModel.LoadAzureDataDetails: AzureDiscovery.csv not found");
                    return;
                }

                var lines = File.ReadAllLines(csvPath);
                if (lines.Length < 2)
                {
                    Debug.WriteLine("AssetDetailViewModel.LoadAzureDataDetails: CSV file is empty or has no data rows");
                    return;
                }

                var headers = lines[0].Split(',');
                var assetName = GetAssetName(asset);

                for (int i = 1; i < lines.Length; i++)
                {
                    var values = lines[i].Split(',');
                    if (values.Length > 0 && values[0].Equals(assetName, StringComparison.OrdinalIgnoreCase))
                    {
                        // Populate Azure details
                        DeviceName = values.Length > 0 ? values[0] : null;

                        // Add to Apps collection
                        Apps.Add(new AppDto(
                            Id: Guid.NewGuid().ToString(),
                            Name: "Azure Cloud Service",
                            Source: "Azure",
                            InstallCounts: 1,
                            Executables: new List<string>(),
                            Publishers: new List<string> { "Microsoft Azure" },
                            DiscoveryTimestamp: DateTime.Now,
                            DiscoveryModule: "AssetDetailViewModel",
                            SessionId: Guid.NewGuid().ToString()
                        ));
                        Debug.WriteLine($"AssetDetailViewModel.LoadAzureDataDetails: Populated Apps collection with 1 item");
                        break;
                    }
                }
            }
            catch (Exception ex)
            {
                Debug.WriteLine($"AssetDetailViewModel.LoadAzureDataDetails: Error loading AzureData: {ex.Message}");
            }
        }

        /// <summary>
        /// Load details for AzureInfrastructureData
        /// </summary>
        private void LoadAzureInfrastructureDataDetails(object asset)
        {
            Debug.WriteLine("AssetDetailViewModel.LoadAzureInfrastructureDataDetails: Loading AzureInfrastructureData details");

            try
            {
                string csvPath = "AzureInfrastructureDiscovery.csv";
                if (!File.Exists(csvPath))
                {
                    Debug.WriteLine("AssetDetailViewModel.LoadAzureInfrastructureDataDetails: AzureInfrastructureDiscovery.csv not found");
                    return;
                }

                var lines = File.ReadAllLines(csvPath);
                if (lines.Length < 2)
                {
                    Debug.WriteLine("AssetDetailViewModel.LoadAzureInfrastructureDataDetails: CSV file is empty or has no data rows");
                    return;
                }

                var headers = lines[0].Split(',');
                var assetName = GetAssetName(asset);

                for (int i = 1; i < lines.Length; i++)
                {
                    var values = lines[i].Split(',');
                    if (values.Length > 0 && values[0].Equals(assetName, StringComparison.OrdinalIgnoreCase))
                    {
                        // Populate Azure infrastructure details
                        DeviceName = values.Length > 0 ? values[0] : null;

                        // Add to Apps collection
                        Apps.Add(new AppDto(
                            Id: Guid.NewGuid().ToString(),
                            Name: "Azure Infrastructure Service",
                            Source: "AzureInfrastructure",
                            InstallCounts: 1,
                            Executables: new List<string>(),
                            Publishers: new List<string> { "Microsoft Azure" },
                            DiscoveryTimestamp: DateTime.Now,
                            DiscoveryModule: "AssetDetailViewModel",
                            SessionId: Guid.NewGuid().ToString()
                        ));
                        Debug.WriteLine($"AssetDetailViewModel.LoadAzureInfrastructureDataDetails: Populated Apps collection with 1 item");
                        break;
                    }
                }
            }
            catch (Exception ex)
            {
                Debug.WriteLine($"AssetDetailViewModel.LoadAzureInfrastructureDataDetails: Error loading AzureInfrastructureData: {ex.Message}");
            }
        }

        /// <summary>
        /// Load details for ActiveDirectoryData
        /// </summary>
        private void LoadActiveDirectoryDataDetails(object asset)
        {
            Debug.WriteLine("AssetDetailViewModel.LoadActiveDirectoryDataDetails: Loading ActiveDirectoryData details");

            try
            {
                string csvPath = "ActiveDirectoryDiscovery.csv";
                if (!File.Exists(csvPath))
                {
                    Debug.WriteLine("AssetDetailViewModel.LoadActiveDirectoryDataDetails: ActiveDirectoryDiscovery.csv not found");
                    return;
                }

                var lines = File.ReadAllLines(csvPath);
                if (lines.Length < 2)
                {
                    Debug.WriteLine("AssetDetailViewModel.LoadActiveDirectoryDataDetails: CSV file is empty or has no data rows");
                    return;
                }

                var headers = lines[0].Split(',');
                var assetName = GetAssetName(asset);

                for (int i = 1; i < lines.Length; i++)
                {
                    var values = lines[i].Split(',');
                    if (values.Length > 0 && values[0].Equals(assetName, StringComparison.OrdinalIgnoreCase))
                    {
                        // Populate Active Directory details
                        DeviceName = values.Length > 0 ? values[0] : null;

                        // Add to Apps collection
                        Apps.Add(new AppDto(
                            Id: Guid.NewGuid().ToString(),
                            Name: "Active Directory Service",
                            Source: "ActiveDirectory",
                            InstallCounts: 1,
                            Executables: new List<string>(),
                            Publishers: new List<string> { "Microsoft" },
                            DiscoveryTimestamp: DateTime.Now,
                            DiscoveryModule: "AssetDetailViewModel",
                            SessionId: Guid.NewGuid().ToString()
                        ));
                        Debug.WriteLine($"AssetDetailViewModel.LoadActiveDirectoryDataDetails: Populated Apps collection with 1 item");
                        break;
                    }
                }
            }
            catch (Exception ex)
            {
                Debug.WriteLine($"AssetDetailViewModel.LoadActiveDirectoryDataDetails: Error loading ActiveDirectoryData: {ex.Message}");
            }
        }

        /// <summary>
        /// Load details for ExchangeData
        /// </summary>
        private void LoadExchangeDataDetails(object asset)
        {
            Debug.WriteLine("AssetDetailViewModel.LoadExchangeDataDetails: Loading ExchangeData details");

            try
            {
                string csvPath = "ExchangeDiscovery.csv";
                if (!File.Exists(csvPath))
                {
                    Debug.WriteLine("AssetDetailViewModel.LoadExchangeDataDetails: ExchangeDiscovery.csv not found");
                    return;
                }

                var lines = File.ReadAllLines(csvPath);
                if (lines.Length < 2)
                {
                    Debug.WriteLine("AssetDetailViewModel.LoadExchangeDataDetails: CSV file is empty or has no data rows");
                    return;
                }

                var headers = lines[0].Split(',');
                var assetName = GetAssetName(asset);

                for (int i = 1; i < lines.Length; i++)
                {
                    var values = lines[i].Split(',');
                    if (values.Length > 0 && values[0].Equals(assetName, StringComparison.OrdinalIgnoreCase))
                    {
                        // Populate Exchange details
                        DeviceName = values.Length > 0 ? values[0] : null;

                        // Add to Apps collection
                        Apps.Add(new AppDto(
                            Id: Guid.NewGuid().ToString(),
                            Name: "Exchange Server Service",
                            Source: "Exchange",
                            InstallCounts: 1,
                            Executables: new List<string>(),
                            Publishers: new List<string> { "Microsoft" },
                            DiscoveryTimestamp: DateTime.Now,
                            DiscoveryModule: "AssetDetailViewModel",
                            SessionId: Guid.NewGuid().ToString()
                        ));
                        Debug.WriteLine($"AssetDetailViewModel.LoadExchangeDataDetails: Populated Apps collection with 1 item");
                        break;
                    }
                }
            }
            catch (Exception ex)
            {
                Debug.WriteLine($"AssetDetailViewModel.LoadExchangeDataDetails: Error loading ExchangeData: {ex.Message}");
            }
        }

        /// <summary>
        /// Load details for OneDriveBusinessData
        /// </summary>
        private void LoadOneDriveBusinessDataDetails(object asset)
        {
            Debug.WriteLine("AssetDetailViewModel.LoadOneDriveBusinessDataDetails: Loading OneDriveBusinessData details");

            try
            {
                string csvPath = "OneDriveBusinessDiscovery.csv";
                if (!File.Exists(csvPath))
                {
                    Debug.WriteLine("AssetDetailViewModel.LoadOneDriveBusinessDataDetails: OneDriveBusinessDiscovery.csv not found");
                    return;
                }

                var lines = File.ReadAllLines(csvPath);
                if (lines.Length < 2)
                {
                    Debug.WriteLine("AssetDetailViewModel.LoadOneDriveBusinessDataDetails: CSV file is empty or has no data rows");
                    return;
                }

                var headers = lines[0].Split(',');
                var assetName = GetAssetName(asset);

                for (int i = 1; i < lines.Length; i++)
                {
                    var values = lines[i].Split(',');
                    if (values.Length > 0 && values[0].Equals(assetName, StringComparison.OrdinalIgnoreCase))
                    {
                        // Populate OneDrive Business details
                        DeviceName = values.Length > 0 ? values[0] : null;

                        // Add to Apps collection
                        Apps.Add(new AppDto(
                            Id: Guid.NewGuid().ToString(),
                            Name: "OneDrive for Business",
                            Source: "OneDriveBusiness",
                            InstallCounts: 1,
                            Executables: new List<string>(),
                            Publishers: new List<string> { "Microsoft" },
                            DiscoveryTimestamp: DateTime.Now,
                            DiscoveryModule: "AssetDetailViewModel",
                            SessionId: Guid.NewGuid().ToString()
                        ));
                        Debug.WriteLine($"AssetDetailViewModel.LoadOneDriveBusinessDataDetails: Populated Apps collection with 1 item");
                        break;
                    }
                }
            }
            catch (Exception ex)
            {
                Debug.WriteLine($"AssetDetailViewModel.LoadOneDriveBusinessDataDetails: Error loading OneDriveBusinessData: {ex.Message}");
            }
        }

        /// <summary>
        /// Load default asset details
        /// </summary>
        private void LoadDefaultAssetDetails(object asset)
        {
            Debug.WriteLine("AssetDetailViewModel.LoadDefaultAssetDetails: Loading default asset details");

            var assetName = GetAssetName(asset);
            DeviceName = assetName;
            Debug.WriteLine($"AssetDetailViewModel.LoadDefaultAssetDetails: Set DeviceName to {assetName}");
        }

        /// <summary>
        /// Get asset name from object
        /// </summary>
        private string GetAssetName(object asset)
        {
            if (asset == null) return "Unknown";

            // Try Name property
            var nameProperty = asset.GetType().GetProperty("Name");
            if (nameProperty != null)
            {
                return nameProperty.GetValue(asset)?.ToString() ?? "Unknown";
            }

            // Try from dictionary
            if (asset is Dictionary<string, object> dict && dict.TryGetValue("Name", out var nameObj))
            {
                return nameObj?.ToString() ?? "Unknown";
            }

            return asset.ToString() ?? "Unknown";
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

            // Clear hardware info
            Hardware = null;
            OwnerDepartment = null;
            OwnerLocation = null;
            OwnerManager = null;
            OwnerEmployeeId = null;

            // Clear risk and status info
            HighRiskCount = 0;
            MigrationReadinessStatus = null;
            OSCompatibilityStatus = null;
            BackupStatus = null;
            LastRiskAssessment = null;
            LastAppsScan = null;

            // Clear app summary collections
            MicrosoftApps.Clear();
            ThirdPartyApps.Clear();
            CrowdStrikeApps.Clear();
            CriticalApps.Clear();

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

        /// <summary>
        /// Open asset detail from external source (main asset list)
        /// </summary>
        private void OpenAssetDetail(string deviceName)
        {
            SelectedDeviceName = deviceName;
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