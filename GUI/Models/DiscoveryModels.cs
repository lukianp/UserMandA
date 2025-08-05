using System;
using System.Collections.Generic;
using System.ComponentModel;

namespace MandADiscoverySuite.Models
{
    /// <summary>
    /// Status of a discovery module
    /// </summary>
    public enum DiscoveryModuleStatus
    {
        Ready,
        Running,
        Completed,
        Failed,
        Cancelled,
        Disabled
    }

    /// <summary>
    /// Company profile for discovery operations
    /// </summary>
    public class CompanyProfile : INotifyPropertyChanged
    {
        private string _companyName;
        private string _description;
        private string _domainController;
        private string _tenantId;
        private bool _isActive;
        private DateTime _created;
        private DateTime _lastModified;

        public string Id { get; set; } = Guid.NewGuid().ToString();

        public string CompanyName
        {
            get => _companyName;
            set
            {
                _companyName = value;
                OnPropertyChanged(nameof(CompanyName));
            }
        }

        public string Description
        {
            get => _description;
            set
            {
                _description = value;
                OnPropertyChanged(nameof(Description));
            }
        }

        public string DomainController
        {
            get => _domainController;
            set
            {
                _domainController = value;
                OnPropertyChanged(nameof(DomainController));
            }
        }

        public string TenantId
        {
            get => _tenantId;
            set
            {
                _tenantId = value;
                OnPropertyChanged(nameof(TenantId));
            }
        }

        public bool IsActive
        {
            get => _isActive;
            set
            {
                _isActive = value;
                OnPropertyChanged(nameof(IsActive));
            }
        }

        public DateTime Created
        {
            get => _created;
            set
            {
                _created = value;
                OnPropertyChanged(nameof(Created));
            }
        }

        public DateTime LastModified
        {
            get => _lastModified;
            set
            {
                _lastModified = value;
                OnPropertyChanged(nameof(LastModified));
            }
        }

        public int RecordCount { get; set; } = 0;
        public DateTime? LastDiscovery { get; set; }

        // Legacy properties for backward compatibility
        public string Name => CompanyName;
        public string Path { get; set; } = "";
        public string Industry { get; set; } = "";
        public bool IsHybrid { get; set; } = false;
        public bool HasDatabases { get; set; } = false;
        public int EstimatedUserCount { get; set; } = 0;
        public int EstimatedDeviceCount { get; set; } = 0;
        public long EstimatedDataSize { get; set; } = 0;
        public List<string> Locations { get; set; } = new List<string>();

        public Dictionary<string, object> Configuration { get; set; } = new Dictionary<string, object>();
        
        public override string ToString()
        {
            return CompanyName;
        }

        public event PropertyChangedEventHandler PropertyChanged;

        protected virtual void OnPropertyChanged(string propertyName)
        {
            PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(propertyName));
        }

        public CompanyProfile()
        {
            Created = DateTime.Now;
            LastModified = DateTime.Now;
            IsActive = true;
        }
    }

    /// <summary>
    /// Dashboard metric for real-time monitoring
    /// </summary>
    public class DashboardMetric : INotifyPropertyChanged
    {
        private string _title;
        private double _value;
        private string _icon;
        private string _color;
        private double _previousValue;
        private DateTime _lastUpdated;

        public string Title
        {
            get => _title;
            set
            {
                _title = value;
                OnPropertyChanged(nameof(Title));
            }
        }

        public double Value
        {
            get => _value;
            set
            {
                _previousValue = _value;
                _value = value;
                LastUpdated = DateTime.Now;
                OnPropertyChanged(nameof(Value));
                OnPropertyChanged(nameof(ValueText));
                OnPropertyChanged(nameof(ChangePercentage));
                OnPropertyChanged(nameof(ChangeDirection));
            }
        }

        public string Icon
        {
            get => _icon;
            set
            {
                _icon = value;
                OnPropertyChanged(nameof(Icon));
            }
        }

        public string Color
        {
            get => _color;
            set
            {
                _color = value;
                OnPropertyChanged(nameof(Color));
            }
        }

        public double PreviousValue => _previousValue;

        public DateTime LastUpdated
        {
            get => _lastUpdated;
            private set
            {
                _lastUpdated = value;
                OnPropertyChanged(nameof(LastUpdated));
                OnPropertyChanged(nameof(LastUpdatedText));
            }
        }

        public string ValueText
        {
            get
            {
                if (Value >= 1000000)
                    return $"{Value / 1000000:F1}M";
                if (Value >= 1000)
                    return $"{Value / 1000:F1}K";
                return Value.ToString("N0");
            }
        }

        public double ChangePercentage
        {
            get
            {
                if (PreviousValue == 0)
                    return 0;
                return ((Value - PreviousValue) / PreviousValue) * 100;
            }
        }

        public string ChangeDirection
        {
            get
            {
                var change = Value - PreviousValue;
                if (change > 0) return "up";
                if (change < 0) return "down";
                return "same";
            }
        }

        public string LastUpdatedText
        {
            get
            {
                var timeAgo = DateTime.Now - LastUpdated;
                if (timeAgo.TotalMinutes < 1)
                    return "Just now";
                if (timeAgo.TotalHours < 1)
                    return $"{(int)timeAgo.TotalMinutes}m ago";
                if (timeAgo.TotalDays < 1)
                    return $"{(int)timeAgo.TotalHours}h ago";
                return LastUpdated.ToString("MMM dd, HH:mm");
            }
        }

        public event PropertyChangedEventHandler PropertyChanged;

        protected virtual void OnPropertyChanged(string propertyName)
        {
            PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(propertyName));
        }

        public DashboardMetric(string title, double value, string icon, string color)
        {
            Title = title;
            Value = value;
            Icon = icon;
            Color = color;
            LastUpdated = DateTime.Now;
        }
    }

    /// <summary>
    /// Discovery result from a module
    /// </summary>
    public class DiscoveryResult : INotifyPropertyChanged
    {
        private string _moduleName;
        private string _displayName;
        private int _itemCount;
        private DateTime _discoveryTime;
        private TimeSpan _duration;
        private string _status;
        private string _filePath;

        public string ModuleName
        {
            get => _moduleName;
            set
            {
                _moduleName = value;
                OnPropertyChanged(nameof(ModuleName));
            }
        }

        public string DisplayName
        {
            get => _displayName;
            set
            {
                _displayName = value;
                OnPropertyChanged(nameof(DisplayName));
            }
        }

        public int ItemCount
        {
            get => _itemCount;
            set
            {
                _itemCount = value;
                OnPropertyChanged(nameof(ItemCount));
                OnPropertyChanged(nameof(ItemCountText));
            }
        }

        public DateTime DiscoveryTime
        {
            get => _discoveryTime;
            set
            {
                _discoveryTime = value;
                OnPropertyChanged(nameof(DiscoveryTime));
                OnPropertyChanged(nameof(DiscoveryTimeText));
            }
        }

        public TimeSpan Duration
        {
            get => _duration;
            set
            {
                _duration = value;
                OnPropertyChanged(nameof(Duration));
                OnPropertyChanged(nameof(DurationText));
            }
        }

        public string Status
        {
            get => _status;
            set
            {
                _status = value;
                OnPropertyChanged(nameof(Status));
            }
        }

        public string FilePath
        {
            get => _filePath;
            set
            {
                _filePath = value;
                OnPropertyChanged(nameof(FilePath));
            }
        }

        public string ItemCountText
        {
            get
            {
                if (ItemCount == 0) return "No items";
                if (ItemCount == 1) return "1 item";
                return $"{ItemCount:N0} items";
            }
        }

        public string DiscoveryTimeText => DiscoveryTime.ToString("yyyy-MM-dd HH:mm:ss");

        public string DurationText
        {
            get
            {
                if (Duration.TotalSeconds < 60)
                    return $"{(int)Duration.TotalSeconds}s";
                if (Duration.TotalMinutes < 60)
                    return $"{(int)Duration.TotalMinutes}m {Duration.Seconds}s";
                return $"{(int)Duration.TotalHours}h {Duration.Minutes}m";
            }
        }

        // Legacy properties for backward compatibility
        public bool Success { get; set; } = true;
        public string Summary { get; set; } = "";
        public string ErrorMessage { get; set; } = "";
        public int DataCount => ItemCount;
        public Dictionary<string, object> AdditionalData { get; set; } = new Dictionary<string, object>();
        
        // Repository compatibility
        public DateTime CreatedAt => DiscoveryTime;

        public event PropertyChangedEventHandler PropertyChanged;

        protected virtual void OnPropertyChanged(string propertyName)
        {
            PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(propertyName));
        }
    }

    /// <summary>
    /// Progress information for discovery operations
    /// </summary>
    public class DiscoveryProgress
    {
        public string ModuleName { get; set; }
        public string CurrentOperation { get; set; }
        public double OverallProgress { get; set; }
        public double ModuleProgress { get; set; }
        public DiscoveryModuleStatus Status { get; set; }
        public string Message { get; set; }
        public DateTime Timestamp { get; set; } = DateTime.Now;
    }

    /// <summary>
    /// Configuration for a discovery module
    /// </summary>
    public class ModuleConfiguration
    {
        public string ModuleName { get; set; }
        public bool IsEnabled { get; set; }
        public Dictionary<string, object> Settings { get; set; } = new Dictionary<string, object>();
        public int Priority { get; set; } = 1;
        public int Timeout { get; set; } = 300; // seconds
        public bool ParallelExecution { get; set; } = true;
    }

    /// <summary>
    /// Theme configuration
    /// </summary>
    public class ThemeConfiguration
    {
        public bool IsDarkTheme { get; set; } = true;
        public string AccentColor { get; set; } = "#4CAF50";
        public double FontSize { get; set; } = 14;
        public string FontFamily { get; set; } = "Segoe UI";
        public bool UseAnimations { get; set; } = true;
        public double WindowOpacity { get; set; } = 1.0;
    }

    /// <summary>
    /// Application settings
    /// </summary>
    public class ApplicationSettings : INotifyPropertyChanged
    {
        private ThemeConfiguration _theme;
        private bool _autoRefreshDashboard;
        private int _refreshInterval;
        private bool _enableNotifications;
        private string _defaultExportFormat;

        public ThemeConfiguration Theme
        {
            get => _theme;
            set
            {
                _theme = value;
                OnPropertyChanged(nameof(Theme));
            }
        }

        public bool AutoRefreshDashboard
        {
            get => _autoRefreshDashboard;
            set
            {
                _autoRefreshDashboard = value;
                OnPropertyChanged(nameof(AutoRefreshDashboard));
            }
        }

        public int RefreshInterval
        {
            get => _refreshInterval;
            set
            {
                _refreshInterval = value;
                OnPropertyChanged(nameof(RefreshInterval));
            }
        }

        public bool EnableNotifications
        {
            get => _enableNotifications;
            set
            {
                _enableNotifications = value;
                OnPropertyChanged(nameof(EnableNotifications));
            }
        }

        public string DefaultExportFormat
        {
            get => _defaultExportFormat;
            set
            {
                _defaultExportFormat = value;
                OnPropertyChanged(nameof(DefaultExportFormat));
            }
        }

        public event PropertyChangedEventHandler PropertyChanged;

        protected virtual void OnPropertyChanged(string propertyName)
        {
            PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(propertyName));
        }

        public ApplicationSettings()
        {
            Theme = new ThemeConfiguration();
            AutoRefreshDashboard = true;
            RefreshInterval = 30; // seconds
            EnableNotifications = true;
            DefaultExportFormat = "CSV";
        }
    }

    /// <summary>
    /// User information model for Active Directory users
    /// </summary>
    public class UserInfo : INotifyPropertyChanged
    {
        private string _displayName;
        private string _email;
        private string _department;
        private string _title;
        private string _officeLocation;
        private string _manager;
        private string _status;
        private string _source;
        private DateTime? _lastLogon;
        private string _groups;

        public string DisplayName
        {
            get => _displayName;
            set
            {
                _displayName = value;
                OnPropertyChanged(nameof(DisplayName));
            }
        }

        public string Email
        {
            get => _email;
            set
            {
                _email = value;
                OnPropertyChanged(nameof(Email));
            }
        }

        public string Department
        {
            get => _department;
            set
            {
                _department = value;
                OnPropertyChanged(nameof(Department));
            }
        }

        public string Title
        {
            get => _title;
            set
            {
                _title = value;
                OnPropertyChanged(nameof(Title));
            }
        }

        public string OfficeLocation
        {
            get => _officeLocation;
            set
            {
                _officeLocation = value;
                OnPropertyChanged(nameof(OfficeLocation));
            }
        }

        public string Manager
        {
            get => _manager;
            set
            {
                _manager = value;
                OnPropertyChanged(nameof(Manager));
            }
        }

        public string Status
        {
            get => _status;
            set
            {
                _status = value;
                OnPropertyChanged(nameof(Status));
            }
        }

        public string Source
        {
            get => _source;
            set
            {
                _source = value;
                OnPropertyChanged(nameof(Source));
            }
        }

        public DateTime? LastLogon
        {
            get => _lastLogon;
            set
            {
                _lastLogon = value;
                OnPropertyChanged(nameof(LastLogon));
            }
        }

        public string Groups
        {
            get => _groups;
            set
            {
                _groups = value;
                OnPropertyChanged(nameof(Groups));
            }
        }

        // Computed properties
        public bool CanDelete => !IsDefault;

        public event PropertyChangedEventHandler PropertyChanged;

        protected virtual void OnPropertyChanged(string propertyName)
        {
            PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(propertyName));
        }
    }

    // User Detail Models
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

    /// <summary>
    /// User data model for main views
    /// </summary>
    public class UserData : INotifyPropertyChanged
    {
        private string _displayName;
        private string _userPrincipalName;
        private string _mail;
        private string _department;
        private string _jobTitle;
        private bool _accountEnabled;
        private string _samAccountName;
        private bool _isSelected;

        public string Id { get; set; }
        public string ObjectType { get; set; }
        
        public bool IsSelected
        {
            get => _isSelected;
            set { _isSelected = value; OnPropertyChanged(); }
        }

        public string DisplayName
        {
            get => _displayName;
            set { _displayName = value; OnPropertyChanged(); }
        }

        public string UserPrincipalName
        {
            get => _userPrincipalName;
            set { _userPrincipalName = value; OnPropertyChanged(); }
        }

        public string Mail
        {
            get => _mail;
            set { _mail = value; OnPropertyChanged(); }
        }

        public string Department
        {
            get => _department;
            set { _department = value; OnPropertyChanged(); }
        }

        public string JobTitle
        {
            get => _jobTitle;
            set { _jobTitle = value; OnPropertyChanged(); }
        }

        public bool AccountEnabled
        {
            get => _accountEnabled;
            set { _accountEnabled = value; OnPropertyChanged(); OnPropertyChanged(nameof(Status)); }
        }

        public string SamAccountName
        {
            get => _samAccountName;
            set { _samAccountName = value; OnPropertyChanged(); }
        }

        // Additional properties from CSV
        public string GivenName { get; set; }
        public string Surname { get; set; }
        public string CompanyName { get; set; }
        public string City { get; set; }
        public string Country { get; set; }
        public string MobilePhone { get; set; }
        public string ManagerDisplayName { get; set; }
        public string CreatedDateTime { get; set; }
        public string LastSignInDateTime { get; set; }
        public string GroupMembershipCount { get; set; }
        public string AssignedLicenses { get; set; }
        public string Domain { get; set; }
        public bool Enabled => AccountEnabled;
        public string Title => JobTitle;
        public bool IsPrivileged { get; set; }
        public DateTime? PasswordExpiryDate { get; set; }
        public DateTime? LastLogonDate { get; set; }

        // Display properties
        public string Status => AccountEnabled ? "Active" : "Disabled";
        public string Name => DisplayName ?? UserPrincipalName ?? SamAccountName;
        public string Email => Mail ?? UserPrincipalName;

        public event PropertyChangedEventHandler PropertyChanged;
        protected virtual void OnPropertyChanged([System.Runtime.CompilerServices.CallerMemberName] string propertyName = null)
        {
            PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(propertyName));
        }
    }

    /// <summary>
    /// Infrastructure device data model
    /// </summary>
    public class InfrastructureData : INotifyPropertyChanged
    {
        private string _name;
        private string _type;
        private string _status;
        private string _location;
        private bool _isSelected;

        public string Id { get; set; }
        public string ObjectType { get; set; }

        public bool IsSelected
        {
            get => _isSelected;
            set { _isSelected = value; OnPropertyChanged(); }
        }

        public string Name
        {
            get => _name;
            set { _name = value; OnPropertyChanged(); }
        }

        public string Type
        {
            get => _type;
            set { _type = value; OnPropertyChanged(); }
        }

        public string Status
        {
            get => _status;
            set { _status = value; OnPropertyChanged(); }
        }

        public string Location
        {
            get => _location;
            set { _location = value; OnPropertyChanged(); }
        }

        // Additional properties
        public string IPAddress { get; set; }
        public string OperatingSystem { get; set; }
        public string Version { get; set; }
        public string LastSeen { get; set; }
        public string Description { get; set; }
        public string Manufacturer { get; set; }
        public string Model { get; set; }
        public string Domain { get; set; }
        public bool IsServer { get; set; }
        public DateTime? LastLogonDate { get; set; }
        public bool IsOnline { get; set; }
        public bool IsCritical { get; set; }
        public bool IsSupported { get; set; }
        public DateTime? LastUpdateDate { get; set; }

        public event PropertyChangedEventHandler PropertyChanged;
        protected virtual void OnPropertyChanged([System.Runtime.CompilerServices.CallerMemberName] string propertyName = null)
        {
            PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(propertyName));
        }
    }

    /// <summary>
    /// Group data model
    /// </summary>
    public class GroupData : INotifyPropertyChanged
    {
        private string _displayName;
        private string _description;
        private string _groupType;
        private bool _mailEnabled;
        private bool _securityEnabled;
        private bool _isSelected;

        public string Id { get; set; }
        public string ObjectType { get; set; }

        public bool IsSelected
        {
            get => _isSelected;
            set { _isSelected = value; OnPropertyChanged(); }
        }

        public string DisplayName
        {
            get => _displayName;
            set { _displayName = value; OnPropertyChanged(); }
        }

        public string Description
        {
            get => _description;
            set { _description = value; OnPropertyChanged(); }
        }

        public string GroupType
        {
            get => _groupType;
            set { _groupType = value; OnPropertyChanged(); }
        }

        public bool MailEnabled
        {
            get => _mailEnabled;
            set { _mailEnabled = value; OnPropertyChanged(); OnPropertyChanged(nameof(Type)); }
        }

        public bool SecurityEnabled
        {
            get => _securityEnabled;
            set { _securityEnabled = value; OnPropertyChanged(); OnPropertyChanged(nameof(Type)); }
        }

        // Additional properties
        public string Mail { get; set; }
        public string CreatedDateTime { get; set; }
        public string MemberCount { get; set; }
        public string OwnerCount { get; set; }
        public string Visibility { get; set; }
        public string Domain { get; set; }

        // Display properties
        public string Type
        {
            get
            {
                if (MailEnabled && SecurityEnabled) return "Mail-Enabled Security";
                if (MailEnabled) return "Distribution";
                if (SecurityEnabled) return "Security";
                return "Unknown";
            }
        }

        public string Name => DisplayName;

        public event PropertyChangedEventHandler PropertyChanged;
        protected virtual void OnPropertyChanged([System.Runtime.CompilerServices.CallerMemberName] string propertyName = null)
        {
            PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(propertyName));
        }
    }

    /// <summary>
    /// Application data model for discovered applications
    /// </summary>
    public class ApplicationData : INotifyPropertyChanged
    {
        private string _name;
        private string _version;
        private string _publisher;
        private string _installDate;
        private string _size;
        private bool _isSelected;

        public string Id { get; set; }
        public string ObjectType { get; set; }

        public bool IsSelected
        {
            get => _isSelected;
            set { _isSelected = value; OnPropertyChanged(); }
        }

        public string Name
        {
            get => _name;
            set { _name = value; OnPropertyChanged(); }
        }

        public string Version
        {
            get => _version;
            set { _version = value; OnPropertyChanged(); }
        }

        public string Publisher
        {
            get => _publisher;
            set { _publisher = value; OnPropertyChanged(); }
        }

        public string InstallDate
        {
            get => _installDate;
            set { _installDate = value; OnPropertyChanged(); }
        }

        public string Size
        {
            get => _size;
            set { _size = value; OnPropertyChanged(); }
        }

        // Additional properties
        public string InstallLocation { get; set; }
        public string UninstallString { get; set; }
        public string DisplayIcon { get; set; }
        public string Comments { get; set; }
        public string Contact { get; set; }
        public string DisplayVersion { get; set; }
        public string HelpLink { get; set; }
        public string URLInfoAbout { get; set; }
        public string URLUpdateInfo { get; set; }
        public string SystemComponent { get; set; }
        public string NoModify { get; set; }
        public string NoRepair { get; set; }
        public string NoRemove { get; set; }
        public bool IsOutdated { get; set; }
        public bool IsCompatible { get; set; }

        public event PropertyChangedEventHandler PropertyChanged;
        protected virtual void OnPropertyChanged([System.Runtime.CompilerServices.CallerMemberName] string propertyName = null)
        {
            PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(propertyName));
        }
    }

    /// <summary>
    /// Discovery module configuration and metadata
    /// </summary>
    public class DiscoveryModule : INotifyPropertyChanged
    {
        private string _name;
        private string _displayName;
        private string _description;
        private bool _isEnabled;
        private DiscoveryModuleStatus _status;
        private string _version;
        private DateTime? _lastRun;
        private TimeSpan? _lastDuration;
        private int _priority;

        public string Name
        {
            get => _name;
            set { _name = value; OnPropertyChanged(); }
        }

        public string DisplayName
        {
            get => _displayName;
            set { _displayName = value; OnPropertyChanged(); }
        }

        public string Description
        {
            get => _description;
            set { _description = value; OnPropertyChanged(); }
        }

        public bool IsEnabled
        {
            get => _isEnabled;
            set { _isEnabled = value; OnPropertyChanged(); }
        }

        public DiscoveryModuleStatus Status
        {
            get => _status;
            set { _status = value; OnPropertyChanged(); }
        }

        public string Version
        {
            get => _version;
            set { _version = value; OnPropertyChanged(); }
        }

        public DateTime? LastRun
        {
            get => _lastRun;
            set { _lastRun = value; OnPropertyChanged(); }
        }

        public TimeSpan? LastDuration
        {
            get => _lastDuration;
            set { _lastDuration = value; OnPropertyChanged(); }
        }

        public int Priority
        {
            get => _priority;
            set { _priority = value; OnPropertyChanged(); }
        }

        // Additional properties
        public string FilePath { get; set; }
        public string Author { get; set; }
        public string Category { get; set; }
        public Dictionary<string, object> Configuration { get; set; } = new Dictionary<string, object>();
        public string[] Dependencies { get; set; } = new string[0];
        public string[] Tags { get; set; } = new string[0];
        public bool RequiresElevation { get; set; }
        public int TimeoutMinutes { get; set; } = 30;
        
        // Computed properties
        public bool IsRunning => Status == DiscoveryModuleStatus.Running;

        public event PropertyChangedEventHandler PropertyChanged;
        protected virtual void OnPropertyChanged([System.Runtime.CompilerServices.CallerMemberName] string propertyName = null)
        {
            PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(propertyName));
        }

        public DiscoveryModule()
        {
            Status = DiscoveryModuleStatus.Ready;
            IsEnabled = true;
            Priority = 5;
        }
    }
}