using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Runtime.CompilerServices;

namespace MandADiscoverySuite.Models
{
    /// <summary>
    /// Base class for detail window data models
    /// </summary>
    public abstract class DetailWindowDataBase : INotifyPropertyChanged
    {
        private string _title;
        private string _subtitle;
        private bool _isLoading;
        private DateTime _lastUpdated;

        public string Id { get; set; }
        
        public string Title
        {
            get => _title;
            set => SetProperty(ref _title, value);
        }

        public string Subtitle
        {
            get => _subtitle;
            set => SetProperty(ref _subtitle, value);
        }

        public bool IsLoading
        {
            get => _isLoading;
            set => SetProperty(ref _isLoading, value);
        }

        public DateTime LastUpdated
        {
            get => _lastUpdated;
            set => SetProperty(ref _lastUpdated, value);
        }

        public abstract string WindowType { get; }
        public abstract Dictionary<string, object> GetDetailData();

        #region INotifyPropertyChanged Implementation

        public event PropertyChangedEventHandler PropertyChanged;

        protected virtual void OnPropertyChanged([CallerMemberName] string propertyName = null)
        {
            PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(propertyName));
        }

        protected bool SetProperty<T>(ref T storage, T value, [CallerMemberName] string propertyName = null)
        {
            if (object.Equals(storage, value)) return false;
            storage = value;
            OnPropertyChanged(propertyName);
            return true;
        }

        #endregion
    }

    /// <summary>
    /// User detail window data model
    /// </summary>
    public class UserDetailData : DetailWindowDataBase
    {
        private string _displayName;
        private string _email;
        private string _department;
        private string _title;
        private string _manager;
        private bool _isEnabled;
        private DateTime _lastLogon;
        private List<string> _groups;
        private Dictionary<string, string> _attributes;

        public UserDetailData()
        {
            Groups = new List<string>();
            Attributes = new Dictionary<string, string>();
        }

        public override string WindowType => "User Details";

        public string DisplayName
        {
            get => _displayName;
            set => SetProperty(ref _displayName, value);
        }

        public string Email
        {
            get => _email;
            set => SetProperty(ref _email, value);
        }

        public string Department
        {
            get => _department;
            set => SetProperty(ref _department, value);
        }

        public new string Title
        {
            get => _title;
            set => SetProperty(ref _title, value);
        }

        public string Manager
        {
            get => _manager;
            set => SetProperty(ref _manager, value);
        }

        public bool IsEnabled
        {
            get => _isEnabled;
            set => SetProperty(ref _isEnabled, value);
        }

        public DateTime LastLogon
        {
            get => _lastLogon;
            set => SetProperty(ref _lastLogon, value);
        }

        public List<string> Groups
        {
            get => _groups;
            set => SetProperty(ref _groups, value);
        }

        public Dictionary<string, string> Attributes
        {
            get => _attributes;
            set => SetProperty(ref _attributes, value);
        }

        public override Dictionary<string, object> GetDetailData()
        {
            return new Dictionary<string, object>
            {
                { "Display Name", DisplayName },
                { "Email", Email },
                { "Department", Department },
                { "Title", Title },
                { "Manager", Manager },
                { "Enabled", IsEnabled },
                { "Last Logon", LastLogon },
                { "Groups", string.Join(", ", Groups ?? new List<string>()) },
                { "Attributes Count", Attributes?.Count ?? 0 }
            };
        }
    }

    /// <summary>
    /// Computer detail window data model
    /// </summary>
    public class ComputerDetailData : DetailWindowDataBase
    {
        private string _computerName;
        private string _operatingSystem;
        private string _ipAddress;
        private string _macAddress;
        private string _domain;
        private bool _isOnline;
        private DateTime _lastSeen;
        private string _hardwareInfo;
        private List<string> _installedSoftware;

        public ComputerDetailData()
        {
            InstalledSoftware = new List<string>();
        }

        public override string WindowType => "Computer Details";

        public string ComputerName
        {
            get => _computerName;
            set => SetProperty(ref _computerName, value);
        }

        public string OperatingSystem
        {
            get => _operatingSystem;
            set => SetProperty(ref _operatingSystem, value);
        }

        public string IPAddress
        {
            get => _ipAddress;
            set => SetProperty(ref _ipAddress, value);
        }

        public string MacAddress
        {
            get => _macAddress;
            set => SetProperty(ref _macAddress, value);
        }

        public string Domain
        {
            get => _domain;
            set => SetProperty(ref _domain, value);
        }

        public bool IsOnline
        {
            get => _isOnline;
            set => SetProperty(ref _isOnline, value);
        }

        public DateTime LastSeen
        {
            get => _lastSeen;
            set => SetProperty(ref _lastSeen, value);
        }

        public string HardwareInfo
        {
            get => _hardwareInfo;
            set => SetProperty(ref _hardwareInfo, value);
        }

        public List<string> InstalledSoftware
        {
            get => _installedSoftware;
            set => SetProperty(ref _installedSoftware, value);
        }

        public override Dictionary<string, object> GetDetailData()
        {
            return new Dictionary<string, object>
            {
                { "Computer Name", ComputerName },
                { "Operating System", OperatingSystem },
                { "IP Address", IPAddress },
                { "MAC Address", MacAddress },
                { "Domain", Domain },
                { "Online", IsOnline },
                { "Last Seen", LastSeen },
                { "Hardware", HardwareInfo },
                { "Installed Software Count", InstalledSoftware?.Count ?? 0 }
            };
        }
    }

    /// <summary>
    /// Group detail window data model
    /// </summary>
    public class GroupDetailData : DetailWindowDataBase
    {
        private string _groupName;
        private string _description;
        private string _groupType;
        private string _scope;
        private List<string> _members;
        private List<string> _memberOf;
        private Dictionary<string, string> _properties;

        public GroupDetailData()
        {
            Members = new List<string>();
            MemberOf = new List<string>();
            Properties = new Dictionary<string, string>();
        }

        public override string WindowType => "Group Details";

        public string GroupName
        {
            get => _groupName;
            set => SetProperty(ref _groupName, value);
        }

        public string Description
        {
            get => _description;
            set => SetProperty(ref _description, value);
        }

        public string GroupType
        {
            get => _groupType;
            set => SetProperty(ref _groupType, value);
        }

        public string Scope
        {
            get => _scope;
            set => SetProperty(ref _scope, value);
        }

        public List<string> Members
        {
            get => _members;
            set => SetProperty(ref _members, value);
        }

        public List<string> MemberOf
        {
            get => _memberOf;
            set => SetProperty(ref _memberOf, value);
        }

        public Dictionary<string, string> Properties
        {
            get => _properties;
            set => SetProperty(ref _properties, value);
        }

        public override Dictionary<string, object> GetDetailData()
        {
            return new Dictionary<string, object>
            {
                { "Group Name", GroupName },
                { "Description", Description },
                { "Type", GroupType },
                { "Scope", Scope },
                { "Members Count", Members?.Count ?? 0 },
                { "Member Of Count", MemberOf?.Count ?? 0 },
                { "Properties Count", Properties?.Count ?? 0 }
            };
        }
    }

    /// <summary>
    /// Configuration for detail window display
    /// </summary>
    public class DetailWindowConfiguration
    {
        public string WindowTitle { get; set; }
        public double Width { get; set; } = 800;
        public double Height { get; set; } = 600;
        public bool IsResizable { get; set; } = true;
        public bool AllowMultipleInstances { get; set; } = true;
        public List<DetailTab> Tabs { get; set; }
        public DetailWindowTheme Theme { get; set; } = DetailWindowTheme.Default;

        public DetailWindowConfiguration()
        {
            Tabs = new List<DetailTab>();
        }
    }

    /// <summary>
    /// Detail window tab configuration
    /// </summary>
    public class DetailTab
    {
        public string Header { get; set; }
        public string ContentType { get; set; }
        public bool IsVisible { get; set; } = true;
        public int Order { get; set; }
        public string IconSource { get; set; }
    }

    /// <summary>
    /// Detail window themes
    /// </summary>
    public enum DetailWindowTheme
    {
        Default,
        Dark,
        Light,
        HighContrast,
        Custom
    }

    /// <summary>
    /// Group membership model for detail windows
    /// </summary>
    public class GroupMembership
    {
        public string DisplayName { get; set; }
        public string GroupType { get; set; }
        public string Description { get; set; }
        public DateTime? MemberSince { get; set; }
    }

    /// <summary>
    /// Application assignment model for detail windows
    /// </summary>
    public class ApplicationAssignment
    {
        public string DisplayName { get; set; }
        public string Role { get; set; }
        public string AppType { get; set; }
        public DateTime? AssignedDate { get; set; }
        public string Status { get; set; }
    }

    /// <summary>
    /// Device relationship model for detail windows
    /// </summary>
    public class DeviceRelationship
    {
        public string DisplayName { get; set; }
        public string OperatingSystem { get; set; }
        public string DeviceType { get; set; }
        public string Status { get; set; }
        public DateTime? LastSeen { get; set; }
    }

    /// <summary>
    /// Directory role model for detail windows
    /// </summary>
    public class DirectoryRole
    {
        public string DisplayName { get; set; }
        public string RoleType { get; set; }
        public string Description { get; set; }
        public DateTime? AssignedDate { get; set; }
        public string Scope { get; set; }
    }

    /// <summary>
    /// License assignment model for detail windows
    /// </summary>
    public class LicenseAssignment
    {
        public string LicenseName { get; set; }
        public string SkuId { get; set; }
        public string Status { get; set; }
        public DateTime? AssignedDate { get; set; }
        public DateTime? ExpirationDate { get; set; }
        public string AssignmentType { get; set; }
    }
}