using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Runtime.CompilerServices;

namespace MandADiscoverySuite.Models
{
    /// <summary>
    /// Main application settings model
    /// </summary>
    public class AppConfiguration : INotifyPropertyChanged
    {
        private string _theme = "Dark";
        private bool _autoSaveEnabled = true;
        private int _autoSaveIntervalMinutes = 5;
        private bool _highContrastMode = false;
        private double _fontSize = 14.0;
        private string _defaultCompany = "";
        private bool _rememberLastSession = true;
        private bool _useSystemTheme = false;
        private bool _reduceMotion = false;
        private WindowSettings _windowSettings = new WindowSettings();
        private DataGridSettings _dataGridSettings = new DataGridSettings();
        private DiscoverySettings _discoverySettings = new DiscoverySettings();
        
        public string Theme
        {
            get => _theme;
            set => SetProperty(ref _theme, value);
        }

        public bool AutoSaveEnabled
        {
            get => _autoSaveEnabled;
            set => SetProperty(ref _autoSaveEnabled, value);
        }

        public int AutoSaveIntervalMinutes
        {
            get => _autoSaveIntervalMinutes;
            set => SetProperty(ref _autoSaveIntervalMinutes, Math.Max(1, Math.Min(60, value)));
        }

        public bool HighContrastMode
        {
            get => _highContrastMode;
            set => SetProperty(ref _highContrastMode, value);
        }

        public double FontSize
        {
            get => _fontSize;
            set => SetProperty(ref _fontSize, Math.Max(10.0, Math.Min(24.0, value)));
        }

        public string DefaultCompany
        {
            get => _defaultCompany;
            set => SetProperty(ref _defaultCompany, value);
        }

        public bool RememberLastSession
        {
            get => _rememberLastSession;
            set => SetProperty(ref _rememberLastSession, value);
        }

        public WindowSettings WindowSettings
        {
            get => _windowSettings;
            set => SetProperty(ref _windowSettings, value);
        }

        public DataGridSettings DataGridSettings
        {
            get => _dataGridSettings;
            set => SetProperty(ref _dataGridSettings, value);
        }

        public DiscoverySettings DiscoverySettings
        {
            get => _discoverySettings;
            set => SetProperty(ref _discoverySettings, value);
        }

        public bool UseSystemTheme
        {
            get => _useSystemTheme;
            set => SetProperty(ref _useSystemTheme, value);
        }

        public bool ReduceMotion
        {
            get => _reduceMotion;
            set => SetProperty(ref _reduceMotion, value);
        }

        public DateTime LastSaved { get; set; } = DateTime.Now;
        public string Version { get; set; } = "1.0.0";

        public event PropertyChangedEventHandler PropertyChanged;

        protected bool SetProperty<T>(ref T backingStore, T value, [CallerMemberName] string propertyName = "")
        {
            if (EqualityComparer<T>.Default.Equals(backingStore, value))
                return false;

            backingStore = value;
            OnPropertyChanged(propertyName);
            return true;
        }

        protected void OnPropertyChanged([CallerMemberName] string propertyName = "")
        {
            PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(propertyName));
        }
    }

    /// <summary>
    /// Window-related settings
    /// </summary>
    public class WindowSettings : INotifyPropertyChanged
    {
        private double _width = 1600;
        private double _height = 1000;
        private double _left = 100;
        private double _top = 100;
        private bool _isMaximized = true;
        private List<string> _openTabs = new List<string>();
        private string _activeTab = "";

        public double Width
        {
            get => _width;
            set => SetProperty(ref _width, Math.Max(800, value));
        }

        public double Height
        {
            get => _height;
            set => SetProperty(ref _height, Math.Max(600, value));
        }

        public double Left
        {
            get => _left;
            set => SetProperty(ref _left, value);
        }

        public double Top
        {
            get => _top;
            set => SetProperty(ref _top, value);
        }

        public bool IsMaximized
        {
            get => _isMaximized;
            set => SetProperty(ref _isMaximized, value);
        }

        public List<string> OpenTabs
        {
            get => _openTabs;
            set => SetProperty(ref _openTabs, value ?? new List<string>());
        }

        public string ActiveTab
        {
            get => _activeTab;
            set => SetProperty(ref _activeTab, value);
        }

        public event PropertyChangedEventHandler PropertyChanged;

        protected bool SetProperty<T>(ref T backingStore, T value, [CallerMemberName] string propertyName = "")
        {
            if (EqualityComparer<T>.Default.Equals(backingStore, value))
                return false;

            backingStore = value;
            OnPropertyChanged(propertyName);
            return true;
        }

        protected void OnPropertyChanged([CallerMemberName] string propertyName = "")
        {
            PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(propertyName));
        }
    }

    /// <summary>
    /// DataGrid-related settings
    /// </summary>
    public class DataGridSettings : INotifyPropertyChanged
    {
        private Dictionary<string, List<string>> _columnVisibility = new Dictionary<string, List<string>>();
        private Dictionary<string, List<ColumnSettings>> _columnSettings = new Dictionary<string, List<ColumnSettings>>();
        private int _pageSize = 100;
        private bool _enableVirtualization = true;
        private bool _autoResizeColumns = false;

        public Dictionary<string, List<string>> ColumnVisibility
        {
            get => _columnVisibility;
            set => SetProperty(ref _columnVisibility, value ?? new Dictionary<string, List<string>>());
        }

        public Dictionary<string, List<ColumnSettings>> ColumnSettings
        {
            get => _columnSettings;
            set => SetProperty(ref _columnSettings, value ?? new Dictionary<string, List<ColumnSettings>>());
        }

        public int PageSize
        {
            get => _pageSize;
            set => SetProperty(ref _pageSize, Math.Max(10, Math.Min(1000, value)));
        }

        public bool EnableVirtualization
        {
            get => _enableVirtualization;
            set => SetProperty(ref _enableVirtualization, value);
        }

        public bool AutoResizeColumns
        {
            get => _autoResizeColumns;
            set => SetProperty(ref _autoResizeColumns, value);
        }

        public event PropertyChangedEventHandler PropertyChanged;

        protected bool SetProperty<T>(ref T backingStore, T value, [CallerMemberName] string propertyName = "")
        {
            if (EqualityComparer<T>.Default.Equals(backingStore, value))
                return false;

            backingStore = value;
            OnPropertyChanged(propertyName);
            return true;
        }

        protected void OnPropertyChanged([CallerMemberName] string propertyName = "")
        {
            PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(propertyName));
        }
    }

    /// <summary>
    /// Column-specific settings
    /// </summary>
    public class ColumnSettings
    {
        public string Name { get; set; }
        public double Width { get; set; } = 100;
        public int DisplayIndex { get; set; } = 0;
        public bool IsVisible { get; set; } = true;
        public string SortDirection { get; set; } = "None"; // None, Ascending, Descending
    }

    /// <summary>
    /// Discovery-related settings
    /// </summary>
    public class DiscoverySettings : INotifyPropertyChanged
    {
        private int _defaultTimeout = 300;
        private int _defaultThreads = 5;
        private bool _enableLogging = true;
        private bool _enableProgressTracking = true;
        private List<string> _recentCompanies = new List<string>();
        private Dictionary<string, bool> _moduleStates = new Dictionary<string, bool>();

        public int DefaultTimeout
        {
            get => _defaultTimeout;
            set => SetProperty(ref _defaultTimeout, Math.Max(30, Math.Min(3600, value)));
        }

        public int DefaultThreads
        {
            get => _defaultThreads;
            set => SetProperty(ref _defaultThreads, Math.Max(1, Math.Min(20, value)));
        }

        public bool EnableLogging
        {
            get => _enableLogging;
            set => SetProperty(ref _enableLogging, value);
        }

        public bool EnableProgressTracking
        {
            get => _enableProgressTracking;
            set => SetProperty(ref _enableProgressTracking, value);
        }

        public List<string> RecentCompanies
        {
            get => _recentCompanies;
            set => SetProperty(ref _recentCompanies, value ?? new List<string>());
        }

        public Dictionary<string, bool> ModuleStates
        {
            get => _moduleStates;
            set => SetProperty(ref _moduleStates, value ?? new Dictionary<string, bool>());
        }

        public event PropertyChangedEventHandler PropertyChanged;

        protected bool SetProperty<T>(ref T backingStore, T value, [CallerMemberName] string propertyName = "")
        {
            if (EqualityComparer<T>.Default.Equals(backingStore, value))
                return false;

            backingStore = value;
            OnPropertyChanged(propertyName);
            return true;
        }

        protected void OnPropertyChanged([CallerMemberName] string propertyName = "")
        {
            PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(propertyName));
        }
    }

    /// <summary>
    /// User preferences for the application
    /// </summary>
    public class UserPreferences : INotifyPropertyChanged
    {
        private bool _showWelcomeScreen = true;
        private bool _enableNotifications = true;
        private bool _confirmOnExit = true;
        private string _dateFormat = "MM/dd/yyyy";
        private string _timeFormat = "HH:mm:ss";
        private Dictionary<string, object> _customSettings = new Dictionary<string, object>();

        public bool ShowWelcomeScreen
        {
            get => _showWelcomeScreen;
            set => SetProperty(ref _showWelcomeScreen, value);
        }

        public bool EnableNotifications
        {
            get => _enableNotifications;
            set => SetProperty(ref _enableNotifications, value);
        }

        public bool ConfirmOnExit
        {
            get => _confirmOnExit;
            set => SetProperty(ref _confirmOnExit, value);
        }

        public string DateFormat
        {
            get => _dateFormat;
            set => SetProperty(ref _dateFormat, value);
        }

        public string TimeFormat
        {
            get => _timeFormat;
            set => SetProperty(ref _timeFormat, value);
        }

        public Dictionary<string, object> CustomSettings
        {
            get => _customSettings;
            set => SetProperty(ref _customSettings, value ?? new Dictionary<string, object>());
        }

        public event PropertyChangedEventHandler PropertyChanged;

        protected bool SetProperty<T>(ref T backingStore, T value, [CallerMemberName] string propertyName = "")
        {
            if (EqualityComparer<T>.Default.Equals(backingStore, value))
                return false;

            backingStore = value;
            OnPropertyChanged(propertyName);
            return true;
        }

        protected void OnPropertyChanged([CallerMemberName] string propertyName = "")
        {
            PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(propertyName));
        }
    }

    /// <summary>
    /// Session state information
    /// </summary>
    public class SessionState
    {
        public string CurrentCompany { get; set; } = "";
        public List<string> OpenTabs { get; set; } = new List<string>();
        public string ActiveTab { get; set; } = "";
        public Dictionary<string, object> ViewStates { get; set; } = new Dictionary<string, object>();
        public DateTime LastActivity { get; set; } = DateTime.Now;
        public string Version { get; set; } = "1.0.0";
    }

    /// <summary>
    /// Configuration validation results
    /// </summary>
    public class ConfigurationValidationResult
    {
        public bool IsValid { get; set; } = true;
        public List<string> Errors { get; set; } = new List<string>();
        public List<string> Warnings { get; set; } = new List<string>();
        
        public void AddError(string error)
        {
            IsValid = false;
            Errors.Add(error);
        }
        
        public void AddWarning(string warning)
        {
            Warnings.Add(warning);
        }
    }
}