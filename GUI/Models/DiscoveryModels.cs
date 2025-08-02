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
}