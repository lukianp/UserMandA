using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using System.Windows;
using System.Windows.Threading;
using Newtonsoft.Json;
using MandADiscoverySuite.Models;

namespace MandADiscoverySuite.Services
{
    /// <summary>
    /// Implementation of detail window management service
    /// </summary>
    public class DetailWindowService : IDetailWindowService, IDisposable
    {
        private readonly ConcurrentDictionary<string, Window> _openWindows;
        private readonly Dictionary<string, DetailWindowConfiguration> _defaultConfigurations;
        private readonly Dictionary<string, Type> _registeredTemplates;
        private readonly Dictionary<string, Type> _registeredViewModels;
        private DetailWindowServiceSettings _settings;
        private readonly string _settingsPath;
        private readonly string _configurationsPath;
        private DispatcherTimer _autoRefreshTimer;
        private bool _disposed = false;

        // Events
        public event EventHandler<DetailWindowEventArgs> WindowOpened;
        public event EventHandler<DetailWindowEventArgs> WindowClosed;
        public event EventHandler<DetailWindowEventArgs> WindowActivated;
        public event EventHandler<DetailWindowDataUpdatedEventArgs> WindowDataUpdated;

        public DetailWindowService()
        {
            _openWindows = new ConcurrentDictionary<string, Window>();
            _defaultConfigurations = new Dictionary<string, DetailWindowConfiguration>();
            _registeredTemplates = new Dictionary<string, Type>();
            _registeredViewModels = new Dictionary<string, Type>();

            var appData = Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData);
            var appFolder = Path.Combine(appData, "MandADiscoverySuite", "DetailWindows");
            Directory.CreateDirectory(appFolder);

            _settingsPath = Path.Combine(appFolder, "detail_window_settings.json");
            _configurationsPath = Path.Combine(appFolder, "window_configurations.json");

            _autoRefreshTimer = new DispatcherTimer();
            _autoRefreshTimer.Tick += AutoRefreshTimer_Tick;

            _ = InitializeAsync();
        }

        #region Initialization

        private async Task InitializeAsync()
        {
            await LoadSettingsAsync();
            await LoadConfigurationsAsync();
            RegisterDefaultTemplates();
            SetupAutoRefresh();
        }

        private void RegisterDefaultTemplates()
        {
            try
            {
                // Register default templates for built-in types
                RegisterTemplate("UserDetail", typeof(MandADiscoverySuite.Views.UserDetailWindow), typeof(MandADiscoverySuite.ViewModels.UserDetailViewModel));
                // Note: ComputerDetail and GroupDetail templates are not implemented yet
                // RegisterTemplate("ComputerDetail", typeof(MandADiscoverySuite.Views.ComputerDetailWindow), typeof(MandADiscoverySuite.ViewModels.ComputerDetailViewModel));
                // RegisterTemplate("GroupDetail", typeof(MandADiscoverySuite.Views.GroupDetailWindow), typeof(MandADiscoverySuite.ViewModels.GroupDetailViewModel));
                
                SetupDefaultConfigurations();
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Error registering default templates: {ex.Message}");
            }
        }

        private void SetupDefaultConfigurations()
        {
            _defaultConfigurations["UserDetail"] = new DetailWindowConfiguration
            {
                WindowTitle = "User Details",
                Width = 900,
                Height = 700,
                IsResizable = true,
                AllowMultipleInstances = true,
                Tabs = new List<DetailTab>
                {
                    new DetailTab { Header = "General", ContentType = "UserGeneral", Order = 1, IsVisible = true },
                    new DetailTab { Header = "Groups", ContentType = "UserGroups", Order = 2, IsVisible = true },
                    new DetailTab { Header = "Attributes", ContentType = "UserAttributes", Order = 3, IsVisible = true },
                    new DetailTab { Header = "Activity", ContentType = "UserActivity", Order = 4, IsVisible = true }
                }
            };

            _defaultConfigurations["ComputerDetail"] = new DetailWindowConfiguration
            {
                WindowTitle = "Computer Details",
                Width = 850,
                Height = 650,
                IsResizable = true,
                AllowMultipleInstances = true,
                Tabs = new List<DetailTab>
                {
                    new DetailTab { Header = "General", ContentType = "ComputerGeneral", Order = 1, IsVisible = true },
                    new DetailTab { Header = "Hardware", ContentType = "ComputerHardware", Order = 2, IsVisible = true },
                    new DetailTab { Header = "Software", ContentType = "ComputerSoftware", Order = 3, IsVisible = true },
                    new DetailTab { Header = "Network", ContentType = "ComputerNetwork", Order = 4, IsVisible = true }
                }
            };

            _defaultConfigurations["GroupDetail"] = new DetailWindowConfiguration
            {
                WindowTitle = "Group Details",
                Width = 800,
                Height = 600,
                IsResizable = true,
                AllowMultipleInstances = true,
                Tabs = new List<DetailTab>
                {
                    new DetailTab { Header = "General", ContentType = "GroupGeneral", Order = 1, IsVisible = true },
                    new DetailTab { Header = "Members", ContentType = "GroupMembers", Order = 2, IsVisible = true },
                    new DetailTab { Header = "Membership", ContentType = "GroupMembership", Order = 3, IsVisible = true },
                    new DetailTab { Header = "Properties", ContentType = "GroupProperties", Order = 4, IsVisible = true }
                }
            };
        }

        private void SetupAutoRefresh()
        {
            if (_settings.AutoRefreshData && _settings.AutoRefreshIntervalSeconds > 0)
            {
                _autoRefreshTimer.Interval = TimeSpan.FromSeconds(_settings.AutoRefreshIntervalSeconds);
                _autoRefreshTimer.Start();
            }
        }

        #endregion

        #region Window Management

        public async Task<Window> ShowDetailWindowAsync<T>(T data, DetailWindowConfiguration config = null) where T : DetailWindowDataBase
        {
            if (data == null) throw new ArgumentNullException(nameof(data));

            try
            {
                // Check if we should allow multiple instances
                if (!_settings.AllowMultipleInstances || (config?.AllowMultipleInstances == false))
                {
                    var existingWindow = _openWindows.Values.FirstOrDefault(w => 
                        w.Tag?.ToString() == $"{data.WindowType}:{data.Id}");
                    if (existingWindow != null)
                    {
                        existingWindow.Activate();
                        return existingWindow;
                    }
                }

                // Check maximum open windows limit
                if (_openWindows.Count >= _settings.MaximumOpenWindows)
                {
                    if (_settings.WarnBeforeClosingMultiple)
                    {
                        var result = MessageBox.Show(
                            $"Maximum number of detail windows ({_settings.MaximumOpenWindows}) reached. Close oldest window?",
                            "Maximum Windows Reached",
                            MessageBoxButton.YesNo,
                            MessageBoxImage.Question);
                        
                        if (result == MessageBoxResult.Yes)
                        {
                            CloseOldestWindow();
                        }
                        else
                        {
                            return null;
                        }
                    }
                    else
                    {
                        CloseOldestWindow();
                    }
                }

                // Get configuration
                var effectiveConfig = config ?? await GetUserConfigurationAsync(data.WindowType) 
                                           ?? GetDefaultConfiguration(data.WindowType);

                // Create window
                var window = await CreateDetailWindowAsync(data, effectiveConfig);
                if (window != null)
                {
                    var windowId = Guid.NewGuid().ToString();
                    window.Tag = $"{data.WindowType}:{data.Id}";
                    window.SetValue(FrameworkElement.NameProperty, windowId);

                    // Set up window events
                    SetupWindowEvents(window, windowId, data);

                    // Position window
                    PositionWindow(window, effectiveConfig);

                    // Store window reference
                    _openWindows[windowId] = window;

                    // Show window
                    window.Show();

                    // Fire event
                    WindowOpened?.Invoke(this, new DetailWindowEventArgs
                    {
                        WindowId = windowId,
                        WindowType = data.WindowType,
                        Window = window,
                        Data = data
                    });

                    return window;
                }
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Error showing detail window: {ex.Message}");
                MessageBox.Show($"Error opening detail window: {ex.Message}", "Error", 
                               MessageBoxButton.OK, MessageBoxImage.Error);
            }

            return null;
        }

        public async Task<Window> ShowCustomDetailWindowAsync(string title, object content, DetailWindowConfiguration config = null)
        {
            try
            {
                var customConfig = config ?? new DetailWindowConfiguration
                {
                    WindowTitle = title,
                    Width = _settings.DefaultWindowWidth,
                    Height = _settings.DefaultWindowHeight
                };

                var window = new Window
                {
                    Title = title,
                    Width = customConfig.Width,
                    Height = customConfig.Height,
                    Content = content,
                    WindowStartupLocation = WindowStartupLocation.CenterOwner,
                    Owner = Application.Current.MainWindow,
                    ShowInTaskbar = _settings.ShowInTaskbar
                };

                var windowId = Guid.NewGuid().ToString();
                window.SetValue(FrameworkElement.NameProperty, windowId);

                SetupWindowEvents(window, windowId, content);
                _openWindows[windowId] = window;

                window.Show();

                WindowOpened?.Invoke(this, new DetailWindowEventArgs
                {
                    WindowId = windowId,
                    WindowType = "Custom",
                    Window = window,
                    Data = content
                });

                return window;
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Error showing custom detail window: {ex.Message}");
                return null;
            }
        }

        public bool CloseDetailWindow(string windowId)
        {
            if (_openWindows.TryGetValue(windowId, out var window))
            {
                window.Close();
                return true;
            }
            return false;
        }

        public int CloseDetailWindowsByType(string windowType)
        {
            var windowsToClose = _openWindows.Values.Where(w => 
                w.Tag?.ToString().StartsWith($"{windowType}:") == true).ToList();
            
            foreach (var window in windowsToClose)
            {
                window.Close();
            }
            
            return windowsToClose.Count;
        }

        public void CloseAllDetailWindows()
        {
            var windows = _openWindows.Values.ToList();
            foreach (var window in windows)
            {
                window.Close();
            }
        }

        public List<Window> GetOpenDetailWindows()
        {
            return _openWindows.Values.ToList();
        }

        public List<Window> GetDetailWindowsByType(string windowType)
        {
            return _openWindows.Values.Where(w => 
                w.Tag?.ToString().StartsWith($"{windowType}:") == true).ToList();
        }

        public bool IsDetailWindowOpen(string dataId, string windowType)
        {
            return _openWindows.Values.Any(w => w.Tag?.ToString() == $"{windowType}:{dataId}");
        }

        #endregion

        #region Window Creation and Setup

        private async Task<Window> CreateDetailWindowAsync<T>(T data, DetailWindowConfiguration config) where T : DetailWindowDataBase
        {
            try
            {
                var templateName = $"{data.WindowType.Replace(" ", "")}";
                
                if (_registeredTemplates.TryGetValue(templateName, out var viewType))
                {
                    var window = Activator.CreateInstance(viewType) as Window;
                    if (window != null)
                    {
                        // Set window properties
                        window.Title = config.WindowTitle ?? data.Title ?? data.WindowType;
                        window.Width = config.Width;
                        window.Height = config.Height;
                        window.ResizeMode = config.IsResizable ? ResizeMode.CanResize : ResizeMode.NoResize;
                        window.WindowStartupLocation = WindowStartupLocation.CenterOwner;
                        window.Owner = Application.Current.MainWindow;
                        window.ShowInTaskbar = _settings.ShowInTaskbar;

                        // Create and set ViewModel if registered
                        if (_registeredViewModels.TryGetValue(templateName, out var viewModelType))
                        {
                            var viewModel = Activator.CreateInstance(viewModelType, data);
                            window.DataContext = viewModel;
                        }
                        else
                        {
                            window.DataContext = data;
                        }

                        return window;
                    }
                }
                else
                {
                    // Create generic detail window
                    return CreateGenericDetailWindow(data, config);
                }
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Error creating detail window: {ex.Message}");
            }

            return null;
        }

        private Window CreateGenericDetailWindow<T>(T data, DetailWindowConfiguration config) where T : DetailWindowDataBase
        {
            var window = new MandADiscoverySuite.Views.GenericDetailWindow();
            window.Title = config.WindowTitle ?? data.Title ?? data.WindowType;
            window.Width = config.Width;
            window.Height = config.Height;
            window.ResizeMode = config.IsResizable ? ResizeMode.CanResize : ResizeMode.NoResize;
            window.WindowStartupLocation = WindowStartupLocation.CenterOwner;
            window.Owner = Application.Current.MainWindow;
            window.ShowInTaskbar = _settings.ShowInTaskbar;
            window.DataContext = data;
            
            return window;
        }

        private void SetupWindowEvents(Window window, string windowId, object data)
        {
            window.Activated += (s, e) =>
            {
                WindowActivated?.Invoke(this, new DetailWindowEventArgs
                {
                    WindowId = windowId,
                    Window = window,
                    Data = data
                });
            };

            window.Closed += (s, e) =>
            {
                _openWindows.TryRemove(windowId, out _);
                WindowClosed?.Invoke(this, new DetailWindowEventArgs
                {
                    WindowId = windowId,
                    Window = window,
                    Data = data
                });
            };
        }

        private void PositionWindow(Window window, DetailWindowConfiguration config)
        {
            if (_settings.RememberWindowPositions)
            {
                // Implementation for remembering window positions
                // Would load from saved positions
            }
            else
            {
                // Cascade windows
                var openWindowsCount = _openWindows.Count;
                var offset = openWindowsCount * 30;
                window.Left = Application.Current.MainWindow.Left + offset;
                window.Top = Application.Current.MainWindow.Top + offset;
            }
        }

        private void CloseOldestWindow()
        {
            var oldestWindow = _openWindows.Values.FirstOrDefault();
            oldestWindow?.Close();
        }

        #endregion

        #region Configuration Management

        public DetailWindowConfiguration GetDefaultConfiguration(string windowType)
        {
            return _defaultConfigurations.TryGetValue(windowType, out var config) 
                ? config 
                : new DetailWindowConfiguration { WindowTitle = windowType };
        }

        public void SetDefaultConfiguration(string windowType, DetailWindowConfiguration config)
        {
            _defaultConfigurations[windowType] = config;
            _ = SaveConfigurationsAsync();
        }

        public async Task<DetailWindowConfiguration> GetUserConfigurationAsync(string windowType)
        {
            // Implementation would load user-specific configurations
            return await Task.FromResult(GetDefaultConfiguration(windowType));
        }

        public async Task SaveUserConfigurationAsync(string windowType, DetailWindowConfiguration config)
        {
            _defaultConfigurations[windowType] = config;
            await SaveConfigurationsAsync();
        }

        public void ResetConfigurationToDefaults(string windowType)
        {
            if (_defaultConfigurations.ContainsKey(windowType))
            {
                SetupDefaultConfigurations();
            }
        }

        #endregion

        #region Template Management

        public void RegisterTemplate(string templateName, Type viewType, Type viewModelType = null)
        {
            _registeredTemplates[templateName] = viewType;
            if (viewModelType != null)
            {
                _registeredViewModels[templateName] = viewModelType;
            }
        }

        public bool UnregisterTemplate(string templateName)
        {
            var removed = _registeredTemplates.Remove(templateName);
            _registeredViewModels.Remove(templateName);
            return removed;
        }

        public Dictionary<string, Type> GetRegisteredTemplates()
        {
            return new Dictionary<string, Type>(_registeredTemplates);
        }

        public bool IsTemplateRegistered(string templateName)
        {
            return _registeredTemplates.ContainsKey(templateName);
        }

        #endregion

        #region Window Arrangement

        public void ArrangeWindowsCascade()
        {
            var windows = _openWindows.Values.ToList();
            for (int i = 0; i < windows.Count; i++)
            {
                var window = windows[i];
                var offset = i * 30;
                window.Left = Application.Current.MainWindow.Left + offset;
                window.Top = Application.Current.MainWindow.Top + offset;
            }
        }

        public void ArrangeWindowsTile()
        {
            var windows = _openWindows.Values.ToList();
            if (!windows.Any()) return;

            var screenWidth = SystemParameters.PrimaryScreenWidth;
            var screenHeight = SystemParameters.PrimaryScreenHeight;
            var columns = (int)Math.Ceiling(Math.Sqrt(windows.Count));
            var rows = (int)Math.Ceiling((double)windows.Count / columns);

            var windowWidth = screenWidth / columns;
            var windowHeight = screenHeight / rows;

            for (int i = 0; i < windows.Count; i++)
            {
                var window = windows[i];
                var row = i / columns;
                var col = i % columns;

                window.Left = col * windowWidth;
                window.Top = row * windowHeight;
                window.Width = windowWidth;
                window.Height = windowHeight;
            }
        }

        public void MinimizeAllWindows()
        {
            foreach (var window in _openWindows.Values)
            {
                window.WindowState = WindowState.Minimized;
            }
        }

        public void RestoreAllWindows()
        {
            foreach (var window in _openWindows.Values)
            {
                if (window.WindowState == WindowState.Minimized)
                {
                    window.WindowState = WindowState.Normal;
                }
            }
        }

        public void BringWindowToFront(string windowId)
        {
            if (_openWindows.TryGetValue(windowId, out var window))
            {
                window.Activate();
                window.Topmost = true;
                window.Topmost = false;
            }
        }

        #endregion

        #region Data Integration

        public async Task RefreshWindowsByTypeAsync(string windowType)
        {
            var windows = GetDetailWindowsByType(windowType);
            foreach (var window in windows)
            {
                await RefreshWindowDataAsync(window);
            }
        }

        public async Task RefreshWindowAsync(string windowId)
        {
            if (_openWindows.TryGetValue(windowId, out var window))
            {
                await RefreshWindowDataAsync(window);
            }
        }

        private async Task RefreshWindowDataAsync(Window window)
        {
            try
            {
                if (window.DataContext is DetailWindowDataBase data)
                {
                    data.IsLoading = true;
                    
                    // Simulate data refresh - in real implementation, this would call appropriate services
                    await Task.Delay(500);
                    
                    data.LastUpdated = DateTime.Now;
                    data.IsLoading = false;

                    WindowDataUpdated?.Invoke(this, new DetailWindowDataUpdatedEventArgs
                    {
                        WindowId = window.GetValue(FrameworkElement.NameProperty)?.ToString(),
                        DataId = data.Id,
                        NewData = data
                    });
                }
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Error refreshing window data: {ex.Message}");
            }
        }

        public async Task UpdateWindowDataAsync(string dataId, object updatedData)
        {
            var matchingWindows = _openWindows.Values.Where(w => 
                w.DataContext is DetailWindowDataBase data && data.Id == dataId).ToList();

            foreach (var window in matchingWindows)
            {
                if (window.DataContext is DetailWindowDataBase oldData)
                {
                    window.DataContext = updatedData;
                    
                    WindowDataUpdated?.Invoke(this, new DetailWindowDataUpdatedEventArgs
                    {
                        WindowId = window.GetValue(FrameworkElement.NameProperty)?.ToString(),
                        DataId = dataId,
                        OldData = oldData,
                        NewData = updatedData
                    });
                }
            }

            await Task.CompletedTask;
        }

        #endregion

        #region Auto Refresh

        private async void AutoRefreshTimer_Tick(object sender, EventArgs e)
        {
            if (_settings.AutoRefreshData && _openWindows.Any())
            {
                try
                {
                    var refreshTasks = _openWindows.Values.Select(RefreshWindowDataAsync);
                    await Task.WhenAll(refreshTasks);
                }
                catch (Exception ex)
                {
                    System.Diagnostics.Debug.WriteLine($"Error during auto refresh: {ex.Message}");
                }
            }
        }

        #endregion

        #region Settings Management

        public DetailWindowServiceSettings GetSettings()
        {
            return _settings;
        }

        public async Task UpdateSettingsAsync(DetailWindowServiceSettings settings)
        {
            _settings = settings;
            await SaveSettingsAsync();
            SetupAutoRefresh();
        }

        public async Task<string> ExportSettingsAsync()
        {
            var exportData = new
            {
                Settings = _settings,
                Configurations = _defaultConfigurations
            };
            return JsonConvert.SerializeObject(exportData, Formatting.Indented);
        }

        public async Task ImportSettingsAsync(string settingsJson)
        {
            try
            {
                dynamic importData = JsonConvert.DeserializeObject(settingsJson);
                if (importData.Settings != null)
                {
                    _settings = JsonConvert.DeserializeObject<DetailWindowServiceSettings>(importData.Settings.ToString());
                }
                if (importData.Configurations != null)
                {
                    var configs = JsonConvert.DeserializeObject<Dictionary<string, DetailWindowConfiguration>>(importData.Configurations.ToString());
                    foreach (var kvp in configs)
                    {
                        _defaultConfigurations[kvp.Key] = kvp.Value;
                    }
                }
                await SaveSettingsAsync();
                await SaveConfigurationsAsync();
            }
            catch (Exception ex)
            {
                throw new InvalidOperationException($"Failed to import settings: {ex.Message}", ex);
            }
        }

        private async Task LoadSettingsAsync()
        {
            try
            {
                if (File.Exists(_settingsPath))
                {
                    var json = await File.ReadAllTextAsync(_settingsPath);
                    _settings = JsonConvert.DeserializeObject<DetailWindowServiceSettings>(json);
                }
                
                _settings ??= new DetailWindowServiceSettings();
            }
            catch
            {
                _settings = new DetailWindowServiceSettings();
            }
        }

        private async Task SaveSettingsAsync()
        {
            try
            {
                var json = JsonConvert.SerializeObject(_settings, Formatting.Indented);
                await File.WriteAllTextAsync(_settingsPath, json);
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Error saving settings: {ex.Message}");
            }
        }

        private async Task LoadConfigurationsAsync()
        {
            try
            {
                if (File.Exists(_configurationsPath))
                {
                    var json = await File.ReadAllTextAsync(_configurationsPath);
                    var configs = JsonConvert.DeserializeObject<Dictionary<string, DetailWindowConfiguration>>(json);
                    if (configs != null)
                    {
                        foreach (var kvp in configs)
                        {
                            _defaultConfigurations[kvp.Key] = kvp.Value;
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Error loading configurations: {ex.Message}");
            }
        }

        private async Task SaveConfigurationsAsync()
        {
            try
            {
                var json = JsonConvert.SerializeObject(_defaultConfigurations, Formatting.Indented);
                await File.WriteAllTextAsync(_configurationsPath, json);
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Error saving configurations: {ex.Message}");
            }
        }

        #endregion

        #region IDisposable Implementation

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
                    _autoRefreshTimer?.Stop();
                    _autoRefreshTimer = null;
                    CloseAllDetailWindows();
                }
                _disposed = true;
            }
        }

        ~DetailWindowService()
        {
            Dispose(false);
        }

        #endregion
    }
}