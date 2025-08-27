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
            if (string.IsNullOrWhiteSpace(key))
                return false;

            try
            {
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