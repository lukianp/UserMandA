#nullable enable

using System;
using System.Collections.ObjectModel;
using System.Linq;
using System.Threading.Tasks;
using System.Windows.Controls;
using Microsoft.Extensions.Logging;
using MandADiscoverySuite.ViewModels;

namespace MandADiscoverySuite.Services
{
    /// <summary>
    /// Service for managing tabs with reuse and lifecycle management
    /// </summary>
    public class TabsService
    {
        private readonly ObservableCollection<TabItem> _tabs;
        private readonly ILogger<TabsService>? _logger;
        private readonly ViewRegistry _viewRegistry;
        private TabControl? _tabControl;

        public ObservableCollection<TabItem> Tabs => _tabs;

        public TabsService(ILogger<TabsService>? logger = null)
        {
            _logger = logger;
            _viewRegistry = ViewRegistry.Instance;
            _tabs = new ObservableCollection<TabItem>();
        }

        /// <summary>
        /// Initialize with the TabControl reference
        /// </summary>
        public void Initialize(TabControl tabControl)
        {
            _tabControl = tabControl;
            // Don't set ItemsSource here - let XAML binding handle it via {Binding OpenTabs}
        }

        /// <summary>
        /// Open or activate a tab by key
        /// </summary>
        public async Task<bool> OpenTabAsync(string key, string? title = null)
        {
            // Ensure we're on the UI thread since we're manipulating UI elements
            if (!System.Windows.Application.Current.Dispatcher.CheckAccess())
            {
                return await System.Windows.Application.Current.Dispatcher.InvokeAsync(() =>
                {
                    return OpenTabAsync(key, title);
                }).Task.Unwrap();
            }

            try
            {
                if (string.IsNullOrWhiteSpace(key))
                    return false;

                // Check if tab already exists
                var existingTab = _tabs.FirstOrDefault(t =>
                    t.Tag?.ToString()?.Equals(key, StringComparison.OrdinalIgnoreCase) == true);

                if (existingTab != null)
                {
                    // Activate existing tab
                    if (_tabControl != null)
                    {
                        _tabControl.SelectedItem = existingTab;
                    }

                    _logger?.LogInformation($"[TabsService] Activated existing tab: {key}");
                    LogClickToFile("Tab", key, "Reactivated");
                    return true;
                }

                // Create new view
                var view = _viewRegistry.CreateView(key);
                if (view == null)
                {
                    _logger?.LogWarning($"[TabsService] Failed to create view for key: {key}");
                    return false;
                }

                // Initialize view if it has a ViewModel with LoadAsync - MUST happen before adding tab
                if (view.DataContext is BaseViewModel viewModel)
                {
                    // Start loading asynchronously but marshal back to UI thread for safety
                    // This prevents cross-thread issues during data binding
                    _ = Task.Run(async () =>
                    {
                        try
                        {
                            await viewModel.LoadAsync();
                            _logger?.LogInformation($"[TabsService] Loaded data for view: {key}");
                        }
                        catch (Exception ex)
                        {
                            _logger?.LogError(ex, $"[TabsService] Failed to load data for view: {key}");
                        }
                    });
                }

                // Create tab
                var tab = new TabItem
                {
                    Header = title ?? key,
                    Content = view,
                    Tag = key
                };

                // Add to collection
                _tabs.Add(tab);

                // Select the new tab
                if (_tabControl != null)
                {
                    _tabControl.SelectedItem = tab;
                }

                _logger?.LogInformation($"[TabsService] Opened new tab: {key} with title: {title ?? key}");
                LogClickToFile("Tab", key, "Opened");

                return true;
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, $"[TabsService] Error opening tab for key: {key}");
                return false;
            }
        }

        /// <summary>
        /// Close a tab by key
        /// </summary>
        public bool CloseTab(string key)
        {
            var tab = _tabs.FirstOrDefault(t => 
                t.Tag?.ToString()?.Equals(key, StringComparison.OrdinalIgnoreCase) == true);

            if (tab != null)
            {
                return CloseTab(tab);
            }

            return false;
        }
        
        /// <summary>
        /// Close a specific tab
        /// </summary>
        public bool CloseTab(TabItem tab)
        {
            if (tab != null && _tabs.Contains(tab))
            {
                // Dispose ViewModel if necessary
                if (tab.Content is UserControl view && view.DataContext is IDisposable disposable)
                {
                    disposable.Dispose();
                }

                _tabs.Remove(tab);
                _logger?.LogInformation($"[TabsService] Closed tab: {tab.Tag}");
                LogClickToFile("Tab", tab.Tag?.ToString() ?? "Unknown", "Closed");
                return true;
            }

            return false;
        }

        /// <summary>
        /// Close all tabs
        /// </summary>
        public void CloseAllTabs()
        {
            foreach (var tab in _tabs.ToList())
            {
                if (tab.Content is UserControl view && view.DataContext is IDisposable disposable)
                {
                    disposable.Dispose();
                }
            }

            _tabs.Clear();
            _logger?.LogInformation("[TabsService] Closed all tabs");
        }

        /// <summary>
        /// Get the currently selected tab key
        /// </summary>
        public string? GetSelectedTabKey()
        {
            return _tabControl?.SelectedItem is TabItem tab 
                ? tab.Tag?.ToString() 
                : null;
        }

        /// <summary>
        /// Check if a tab is open
        /// </summary>
        public bool IsTabOpen(string key)
        {
            return _tabs.Any(t => 
                t.Tag?.ToString()?.Equals(key, StringComparison.OrdinalIgnoreCase) == true);
        }

        /// <summary>
        /// Refresh data in a specific tab
        /// </summary>
        public async Task<bool> RefreshTabAsync(string key)
        {
            var tab = _tabs.FirstOrDefault(t => 
                t.Tag?.ToString()?.Equals(key, StringComparison.OrdinalIgnoreCase) == true);

            if (tab?.Content is UserControl view && view.DataContext is BaseViewModel viewModel)
            {
                await viewModel.LoadAsync();
                _logger?.LogInformation($"[TabsService] Refreshed tab: {key}");
                return true;
            }

            return false;
        }

        /// <summary>
        /// Open a user detail tab with specific user identifier
        /// </summary>
        public async Task<bool> OpenUserDetailTabAsync(string userIdentifier, string displayName)
        {
            return await Task.Run(() =>
            {
                if (string.IsNullOrWhiteSpace(userIdentifier))
                    return false;

                try
                {
                    var tabKey = $"userdetail_{userIdentifier}";
                    var tabTitle = $"User Details - {displayName}";

                    // Check if tab already exists
                    var existingTab = _tabs.FirstOrDefault(t =>
                        t.Tag?.ToString()?.Equals(tabKey, StringComparison.OrdinalIgnoreCase) == true);

                    if (existingTab != null)
                    {
                        // Activate existing tab
                        if (_tabControl != null)
                        {
                            _tabControl.SelectedItem = existingTab;
                        }

                        _logger?.LogInformation($"[TabsService] Activated existing user detail tab: {userIdentifier}");
                        LogClickToFile("Tab", tabKey, "Reactivated");
                        return true;
                    }

                    // Create new UserDetailView
                    var userDetailView = new MandADiscoverySuite.Views.UserDetailView();

                    // Create ViewModel with LogicEngineService
                    var logicEngineService = new MandADiscoverySuite.Services.LogicEngineService(
                        Microsoft.Extensions.Logging.Abstractions.NullLogger<MandADiscoverySuite.Services.LogicEngineService>.Instance);

                    var userDetailViewModel = new MandADiscoverySuite.ViewModels.UserDetailViewModel(
                        logicEngineService,
                        Microsoft.Extensions.Logging.Abstractions.NullLogger<MandADiscoverySuite.ViewModels.UserDetailViewModel>.Instance)
                    {
                        SelectedUserIdentifier = userIdentifier
                    };

                    userDetailView.DataContext = userDetailViewModel;

                    // Load data asynchronously
                    _ = Task.Run(async () =>
                    {
                        try
                        {
                            await userDetailViewModel.LoadAsync();
                            _logger?.LogInformation($"[TabsService] Loaded user detail data for: {userIdentifier}");
                        }
                        catch (Exception ex)
                        {
                            _logger?.LogError(ex, $"[TabsService] Failed to load user detail data for: {userIdentifier}");
                        }
                    });

                    // Create tab
                    var tab = new TabItem
                    {
                        Header = tabTitle,
                        Content = userDetailView,
                        Tag = tabKey
                    };

                    _tabs.Add(tab);

                    // Select the new tab
                    if (_tabControl != null)
                    {
                        _tabControl.SelectedItem = tab;
                    }

                    _logger?.LogInformation($"[TabsService] Created user detail tab: {tabKey}");
                    LogClickToFile("Tab", tabKey, "Created");
                    return true;
                }
                catch (Exception ex)
                {
                    _logger?.LogError(ex, $"[TabsService] Failed to open user detail tab for: {userIdentifier}");
                    return false;
                }
            });
        }

        /// <summary>
        /// Open an asset detail tab with specific device name
        /// </summary>
        public async Task<bool> OpenAssetDetailTabAsync(string deviceName, string displayName)
        {
            return await Task.Run(() =>
            {
                if (string.IsNullOrWhiteSpace(deviceName))
                    return false;

                try
                {
                    var tabKey = $"assetdetail_{deviceName}";
                    var tabTitle = $"Asset Details - {displayName}";

                    // Check if tab already exists
                    var existingTab = _tabs.FirstOrDefault(t =>
                        t.Tag?.ToString()?.Equals(tabKey, StringComparison.OrdinalIgnoreCase) == true);

                    if (existingTab != null)
                    {
                        // Activate existing tab
                        if (_tabControl != null)
                        {
                            _tabControl.SelectedItem = existingTab;
                        }

                        _logger?.LogInformation($"[TabsService] Activated existing asset detail tab: {deviceName}");
                        LogClickToFile("Tab", tabKey, "Reactivated");
                        return true;
                    }

                    // Create new AssetDetailView
                    var assetDetailView = new MandADiscoverySuite.Views.AssetDetailView();

                    // Create ViewModel with LogicEngineService (will be implemented next)
                    var logicEngineService = new MandADiscoverySuite.Services.LogicEngineService(
                        Microsoft.Extensions.Logging.Abstractions.NullLogger<MandADiscoverySuite.Services.LogicEngineService>.Instance);

                    // Create AssetDetailViewModel with LogicEngineService
                    var assetDetailViewModel = new MandADiscoverySuite.ViewModels.AssetDetailViewModel(
                        logicEngineService,
                        Microsoft.Extensions.Logging.Abstractions.NullLogger<MandADiscoverySuite.ViewModels.AssetDetailViewModel>.Instance)
                    {
                        SelectedDeviceName = deviceName
                    };

                    assetDetailView.DataContext = assetDetailViewModel;

                    // Load data asynchronously
                    _ = Task.Run(async () =>
                    {
                        try
                        {
                            await assetDetailViewModel.LoadAsync();
                            _logger?.LogInformation($"[TabsService] Loaded asset detail data for: {deviceName}");
                        }
                        catch (Exception ex)
                        {
                            _logger?.LogError(ex, $"[TabsService] Failed to load asset detail data for: {deviceName}");
                        }
                    });

                    // Create tab
                    var tab = new TabItem
                    {
                        Header = tabTitle,
                        Content = assetDetailView,
                        Tag = tabKey
                    };

                    _tabs.Add(tab);

                    // Select the new tab
                    if (_tabControl != null)
                    {
                        _tabControl.SelectedItem = tab;
                    }

                    _logger?.LogInformation($"[TabsService] Created asset detail tab: {tabKey}");
                    LogClickToFile("Tab", tabKey, "Created");
                    return true;
                }
                catch (Exception ex)
                {
                    _logger?.LogError(ex, $"[TabsService] Failed to open asset detail tab for: {deviceName}");
                    return false;
                }
            });
        }

        /// <summary>
        /// Log click events to gui-clicks.log
        /// </summary>
        private void LogClickToFile(string controlType, string name, string action)
        {
            try
            {
                var logPath = @"C:\discoverydata\ljpops\Logs\gui-clicks.log";
                var logDir = System.IO.Path.GetDirectoryName(logPath);
                
                if (!string.IsNullOrEmpty(logDir) && !System.IO.Directory.Exists(logDir))
                {
                    System.IO.Directory.CreateDirectory(logDir);
                }

                var timestamp = DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss.fff");
                var logEntry = $"[{timestamp}] [{controlType}] [{name}] {action}{Environment.NewLine}";
                
                System.IO.File.AppendAllText(logPath, logEntry);
            }
            catch
            {
                // Silent fail for logging
            }
        }
    }
}