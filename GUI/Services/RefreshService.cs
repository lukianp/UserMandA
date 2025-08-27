using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.IO;
using System.Text.Json;
using System.Threading.Tasks;
using System.Windows.Threading;

namespace MandADiscoverySuite.Services
{
    public enum RefreshInterval
    {
        Disabled = 0,
        Seconds30 = 30,
        Minute1 = 60,
        Minutes2 = 120,
        Minutes5 = 300,
        Minutes10 = 600,
        Minutes15 = 900,
        Minutes30 = 1800,
        Hour1 = 3600
    }

    public class RefreshSettings : INotifyPropertyChanged
    {
        private RefreshInterval _globalInterval = RefreshInterval.Minutes5;
        private bool _usersEnabled = true;
        private bool _infrastructureEnabled = true;
        private bool _groupsEnabled = true;
        private bool _dashboardEnabled = true;
        private bool _refreshOnlyWhenVisible = true;
        private bool _pauseWhenDiscoveryRunning = true;

        public RefreshInterval GlobalInterval
        {
            get => _globalInterval;
            set { _globalInterval = value; OnPropertyChanged(nameof(GlobalInterval)); }
        }

        public bool UsersEnabled
        {
            get => _usersEnabled;
            set { _usersEnabled = value; OnPropertyChanged(nameof(UsersEnabled)); }
        }

        public bool InfrastructureEnabled
        {
            get => _infrastructureEnabled;
            set { _infrastructureEnabled = value; OnPropertyChanged(nameof(InfrastructureEnabled)); }
        }

        public bool GroupsEnabled
        {
            get => _groupsEnabled;
            set { _groupsEnabled = value; OnPropertyChanged(nameof(GroupsEnabled)); }
        }

        public bool DashboardEnabled
        {
            get => _dashboardEnabled;
            set { _dashboardEnabled = value; OnPropertyChanged(nameof(DashboardEnabled)); }
        }

        public bool RefreshOnlyWhenVisible
        {
            get => _refreshOnlyWhenVisible;
            set { _refreshOnlyWhenVisible = value; OnPropertyChanged(nameof(RefreshOnlyWhenVisible)); }
        }

        public bool PauseWhenDiscoveryRunning
        {
            get => _pauseWhenDiscoveryRunning;
            set { _pauseWhenDiscoveryRunning = value; OnPropertyChanged(nameof(PauseWhenDiscoveryRunning)); }
        }

        public event PropertyChangedEventHandler PropertyChanged;
        
        protected virtual void OnPropertyChanged(string propertyName)
        {
            PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(propertyName));
        }
    }

    public class RefreshStatus : INotifyPropertyChanged
    {
        private bool _isRefreshing;
        private DateTime? _lastRefresh;
        private string _lastRefreshText = "Never";
        private string _nextRefreshText = "Unknown";
        private double _refreshProgress;

        public bool IsRefreshing
        {
            get => _isRefreshing;
            set { _isRefreshing = value; OnPropertyChanged(nameof(IsRefreshing)); }
        }

        public DateTime? LastRefresh
        {
            get => _lastRefresh;
            set 
            { 
                _lastRefresh = value; 
                OnPropertyChanged(nameof(LastRefresh));
                UpdateLastRefreshText();
            }
        }

        public string LastRefreshText
        {
            get => _lastRefreshText;
            set { _lastRefreshText = value; OnPropertyChanged(nameof(LastRefreshText)); }
        }

        public string NextRefreshText
        {
            get => _nextRefreshText;
            set { _nextRefreshText = value; OnPropertyChanged(nameof(NextRefreshText)); }
        }

        public double RefreshProgress
        {
            get => _refreshProgress;
            set { _refreshProgress = value; OnPropertyChanged(nameof(RefreshProgress)); }
        }

        private void UpdateLastRefreshText()
        {
            if (_lastRefresh.HasValue)
            {
                var elapsed = DateTime.Now - _lastRefresh.Value;
                if (elapsed.TotalMinutes < 1)
                    LastRefreshText = "Just now";
                else if (elapsed.TotalMinutes < 60)
                    LastRefreshText = $"{(int)elapsed.TotalMinutes}m ago";
                else if (elapsed.TotalHours < 24)
                    LastRefreshText = $"{(int)elapsed.TotalHours}h ago";
                else
                    LastRefreshText = _lastRefresh.Value.ToString("MMM dd, HH:mm");
            }
            else
            {
                LastRefreshText = "Never";
            }
        }

        public event PropertyChangedEventHandler PropertyChanged;
        
        protected virtual void OnPropertyChanged(string propertyName)
        {
            PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(propertyName));
        }
    }

    public class RefreshService : INotifyPropertyChanged, IDisposable
    {
        private static RefreshService _instance;
        private readonly DispatcherTimer _refreshTimer;
        private readonly DispatcherTimer _statusUpdateTimer;
        private readonly Dictionary<string, RefreshStatus> _viewStatuses;
        private readonly string _settingsPath;
        private RefreshSettings _settings;
        private DateTime _nextRefreshTime;

        public static RefreshService Instance => _instance ??= new RefreshService();

        public RefreshSettings Settings
        {
            get => _settings;
            private set { _settings = value; OnPropertyChanged(nameof(Settings)); }
        }

        public Dictionary<string, RefreshStatus> ViewStatuses => _viewStatuses;

        public event EventHandler<string> RefreshRequested;
        public event PropertyChangedEventHandler PropertyChanged;

        private RefreshService()
        {
            _settingsPath = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData), "MandADiscoverySuite", "RefreshSettings.json");
            _viewStatuses = new Dictionary<string, RefreshStatus>
            {
                ["Dashboard"] = new RefreshStatus(),
                ["Users"] = new RefreshStatus(),
                ["Infrastructure"] = new RefreshStatus(),
                ["Groups"] = new RefreshStatus()
            };

            LoadSettings();

            _refreshTimer = new DispatcherTimer();
            _refreshTimer.Tick += RefreshTimer_Tick;

            _statusUpdateTimer = new DispatcherTimer { Interval = TimeSpan.FromSeconds(10) };
            _statusUpdateTimer.Tick += StatusUpdateTimer_Tick;
            _statusUpdateTimer.Start();

            Settings.PropertyChanged += Settings_PropertyChanged;
            UpdateRefreshTimer();
        }

        private void Settings_PropertyChanged(object sender, PropertyChangedEventArgs e)
        {
            UpdateRefreshTimer();
            SaveSettings();
        }

        private void UpdateRefreshTimer()
        {
            _refreshTimer.Stop();
            
            if (Settings.GlobalInterval == RefreshInterval.Disabled)
                return;

            _refreshTimer.Interval = TimeSpan.FromSeconds((int)Settings.GlobalInterval);
            _refreshTimer.Start();
            _nextRefreshTime = DateTime.Now + _refreshTimer.Interval;
        }

        private void RefreshTimer_Tick(object sender, EventArgs e)
        {
            _nextRefreshTime = DateTime.Now + _refreshTimer.Interval;
            RefreshRequested?.Invoke(this, "Auto");
        }

        private void StatusUpdateTimer_Tick(object sender, EventArgs e)
        {
            // Update last refresh text for all views
            foreach (var status in _viewStatuses.Values)
            {
                if (status.LastRefresh.HasValue)
                {
                    var elapsed = DateTime.Now - status.LastRefresh.Value;
                    if (elapsed.TotalMinutes < 1)
                        status.LastRefreshText = "Just now";
                    else if (elapsed.TotalMinutes < 60)
                        status.LastRefreshText = $"{(int)elapsed.TotalMinutes}m ago";
                    else if (elapsed.TotalHours < 24)
                        status.LastRefreshText = $"{(int)elapsed.TotalHours}h ago";
                    else
                        status.LastRefreshText = status.LastRefresh.Value.ToString("MMM dd, HH:mm");
                }
            }

            // Update next refresh time
            if (Settings.GlobalInterval != RefreshInterval.Disabled)
            {
                var remaining = _nextRefreshTime - DateTime.Now;
                if (remaining.TotalSeconds > 0)
                {
                    foreach (var status in _viewStatuses.Values)
                    {
                        if (remaining.TotalMinutes < 1)
                            status.NextRefreshText = $"{(int)remaining.TotalSeconds}s";
                        else
                            status.NextRefreshText = $"{(int)remaining.TotalMinutes}m {(int)remaining.Seconds}s";
                    }
                }
            }
            else
            {
                foreach (var status in _viewStatuses.Values)
                {
                    status.NextRefreshText = "Disabled";
                }
            }
        }

        public void StartRefresh(string viewName)
        {
            if (_viewStatuses.TryGetValue(viewName, out var status))
            {
                status.IsRefreshing = true;
                status.RefreshProgress = 0;
            }
        }

        public void UpdateRefreshProgress(string viewName, double progress)
        {
            if (_viewStatuses.TryGetValue(viewName, out var status))
            {
                status.RefreshProgress = Math.Max(0, Math.Min(100, progress));
            }
        }

        public void CompleteRefresh(string viewName, bool success = true)
        {
            if (_viewStatuses.TryGetValue(viewName, out var status))
            {
                status.IsRefreshing = false;
                status.RefreshProgress = 0;
                if (success)
                {
                    status.LastRefresh = DateTime.Now;
                }
            }
        }

        public bool ShouldRefreshView(string viewName, string currentView, bool isDiscoveryRunning)
        {
            if (Settings.GlobalInterval == RefreshInterval.Disabled)
                return false;

            if (Settings.PauseWhenDiscoveryRunning && isDiscoveryRunning)
                return false;

            if (Settings.RefreshOnlyWhenVisible && currentView != viewName)
                return false;

            return viewName switch
            {
                "Dashboard" => Settings.DashboardEnabled,
                "Users" => Settings.UsersEnabled,
                "Infrastructure" => Settings.InfrastructureEnabled,
                "Groups" => Settings.GroupsEnabled,
                _ => false
            };
        }

        public void RequestManualRefresh(string viewName)
        {
            RefreshRequested?.Invoke(this, viewName);
        }

        private void LoadSettings()
        {
            try
            {
                if (File.Exists(_settingsPath))
                {
                    var json = File.ReadAllText(_settingsPath);
                    Settings = JsonSerializer.Deserialize<RefreshSettings>(json) ?? new RefreshSettings();
                }
                else
                {
                    Settings = new RefreshSettings();
                }
            }
            catch
            {
                Settings = new RefreshSettings();
            }
        }

        private void SaveSettings()
        {
            try
            {
                var directory = Path.GetDirectoryName(_settingsPath);
                if (!Directory.Exists(directory))
                {
                    Directory.CreateDirectory(directory);
                }

                var json = JsonSerializer.Serialize(Settings, new JsonSerializerOptions { WriteIndented = true });
                File.WriteAllText(_settingsPath, json);
            }
            catch
            {
                // Ignore save errors
            }
        }

        protected virtual void OnPropertyChanged(string propertyName)
        {
            PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(propertyName));
        }

        #region IDisposable

        private bool _disposed = false;

        public void Dispose()
        {
            Dispose(true);
            GC.SuppressFinalize(this);
        }

        protected virtual void Dispose(bool disposing)
        {
            if (!_disposed)
            {
                if (disposing)
                {
                    // Stop and dispose timers to prevent memory leaks
                    if (_refreshTimer != null)
                    {
                        _refreshTimer.Stop();
                        _refreshTimer.Tick -= RefreshTimer_Tick;
                    }

                    if (_statusUpdateTimer != null)
                    {
                        _statusUpdateTimer.Stop();
                        _statusUpdateTimer.Tick -= StatusUpdateTimer_Tick;
                    }

                    // Unregister event handlers
                    if (Settings != null)
                    {
                        Settings.PropertyChanged -= Settings_PropertyChanged;
                    }

                    // Clear collections
                    _viewStatuses?.Clear();
                }

                _disposed = true;
            }
        }

        ~RefreshService()
        {
            Dispose(false);
        }

        #endregion
    }
}