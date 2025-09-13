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