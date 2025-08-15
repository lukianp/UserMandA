using System;
using System.Collections.ObjectModel;
using System.ComponentModel;
using System.Runtime.CompilerServices;
using System.Threading.Tasks;
using System.Windows.Controls;
using System.Windows.Input;
using MandADiscoverySuite.Services;
using Microsoft.Extensions.Logging;

namespace MandADiscoverySuite.ViewModels
{
    /// <summary>
    /// Main ViewModel for navigation and tab management using new architecture
    /// </summary>
    public class MainViewModel : INotifyPropertyChanged
    {
        private readonly TabsService _tabsService;
        private readonly ILogger<MainViewModel>? _logger;
        private TabItem? _selectedTab;
        
        public event PropertyChangedEventHandler? PropertyChanged;
        
        public ObservableCollection<TabItem> OpenTabs => _tabsService.Tabs;
        public ICommand OpenTabCommand { get; }
        public ICommand CloseTabCommand { get; }
        public bool IsCommandPaletteVisible { get; set; }
        
        // Common commands for main window buttons
        public ICommand RefreshDashboardCommand { get; }
        public ICommand StartDiscoveryCommand { get; }
        public ICommand ImportDataCommand { get; }
        public ICommand ToggleModuleCommand { get; }
        public ICommand ShowAllDiscoveryDataCommand { get; }
        public ICommand SelectManagerCommand { get; }
        public ICommand RefreshDataCommand { get; }
        public ICommand ExportResultsCommand { get; }
        public ICommand ShowRefreshSettingsCommand { get; }
        
        // Company profile commands
        public ICommand CreateProfileCommand { get; }
        
        public TabItem? SelectedTab
        {
            get => _selectedTab;
            set
            {
                _selectedTab = value;
                OnPropertyChanged();
            }
        }
        
        public MainViewModel()
        {
            // Create logger
            var loggerFactory = LoggerFactory.Create(builder => builder.AddDebug());
            _logger = loggerFactory.CreateLogger<MainViewModel>();
            var tabsLogger = loggerFactory.CreateLogger<TabsService>();
            
            // Initialize services
            _tabsService = new TabsService(tabsLogger);
            
            // Initialize commands
            OpenTabCommand = new ParameterizedAsyncCommand<string>(OpenTabAsync);
            CloseTabCommand = new ParameterizedAsyncCommand<object>(CloseTabAsync);
            
            // Initialize common main window commands with stub implementations
            RefreshDashboardCommand = new ParameterizedAsyncCommand<object>(async _ => await StubCommandAsync("RefreshDashboard"));
            StartDiscoveryCommand = new ParameterizedAsyncCommand<object>(async _ => await StubCommandAsync("StartDiscovery"));
            ImportDataCommand = new ParameterizedAsyncCommand<object>(async _ => await StubCommandAsync("ImportData"));
            ToggleModuleCommand = new ParameterizedAsyncCommand<object>(async param => await StubCommandAsync($"ToggleModule({param})"));
            ShowAllDiscoveryDataCommand = new ParameterizedAsyncCommand<object>(async _ => await StubCommandAsync("ShowAllDiscoveryData"));
            SelectManagerCommand = new ParameterizedAsyncCommand<object>(async _ => await StubCommandAsync("SelectManager"));
            RefreshDataCommand = new ParameterizedAsyncCommand<object>(async _ => await StubCommandAsync("RefreshData"));
            ExportResultsCommand = new ParameterizedAsyncCommand<object>(async _ => await StubCommandAsync("ExportResults"));
            ShowRefreshSettingsCommand = new ParameterizedAsyncCommand<object>(async _ => await StubCommandAsync("ShowRefreshSettings"));
            
            // Company profile commands
            CreateProfileCommand = new ParameterizedAsyncCommand<object>(async _ => await CreateProfileAsync());
            
            _logger?.LogInformation("MainViewModel initialized with new architecture");
            
            // Open Dashboard tab by default on startup
            _ = Task.Run(async () =>
            {
                await Task.Delay(500); // Small delay to ensure UI is ready
                await OpenTabAsync("dashboard");
            });
        }
        
        /// <summary>
        /// Initialize with TabControl reference
        /// </summary>
        public void InitializeTabControl(TabControl tabControl)
        {
            _tabsService.Initialize(tabControl);
            _logger?.LogInformation("TabControl initialized");
        }
        
        private async Task OpenTabAsync(string? tabKey)
        {
            if (string.IsNullOrWhiteSpace(tabKey))
                return;
                
            try
            {
                _logger?.LogInformation($"[MainViewModel] OpenTabAsync called with key: {tabKey}");
                System.Diagnostics.Debug.WriteLine($"[MainViewModel] OpenTabAsync called with key: {tabKey}");
                
                var success = await _tabsService.OpenTabAsync(tabKey, GetTabTitle(tabKey));
                if (!success)
                {
                    _logger?.LogWarning($"Failed to open tab: {tabKey}");
                }
                else
                {
                    _logger?.LogInformation($"Successfully opened tab: {tabKey}");
                }
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, $"Error opening tab: {tabKey}");
            }
        }
        
        private async Task CloseTabAsync(object? parameter)
        {
            if (parameter is TabItem tabItem)
            {
                try
                {
                    _tabsService.CloseTab(tabItem);
                    _logger?.LogInformation($"Closed tab: {tabItem.Header}");
                }
                catch (Exception ex)
                {
                    _logger?.LogError(ex, $"Error closing tab: {tabItem.Header}");
                }
            }
            else if (parameter is string tabKey)
            {
                try
                {
                    _tabsService.CloseTab(tabKey);
                    _logger?.LogInformation($"Closed tab: {tabKey}");
                }
                catch (Exception ex)
                {
                    _logger?.LogError(ex, $"Error closing tab: {tabKey}");
                }
            }
            await Task.CompletedTask;
        }
        
        private string GetTabTitle(string tabKey)
        {
            return tabKey.ToLowerInvariant() switch
            {
                "users" => "Users",
                "groups" => "Groups", 
                "applications" => "Applications",
                "fileservers" => "File Servers",
                "databases" => "Databases",
                "grouppolicies" => "Group Policies",
                "computers" => "Computers",
                "infrastructure" => "Infrastructure",
                "domaindiscovery" => "Domain Discovery",
                "security" => "Security",
                "waves" => "Migration Waves",
                "migrate" => "Migration",
                "management" => "Management",
                "reports" => "Reports",
                "analytics" => "Analytics",
                "settings" => "Settings",
                "dashboard" => "Dashboard",
                "discovery" => "Discovery",
                _ => tabKey
            };
        }
        
        protected virtual void OnPropertyChanged([CallerMemberName] string? propertyName = null)
        {
            PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(propertyName));
        }
        
        /// <summary>
        /// Stub implementation for commands that need to be implemented later
        /// </summary>
        private async Task StubCommandAsync(string commandName)
        {
            _logger?.LogInformation($"[MainViewModel] Stub command executed: {commandName}");
            System.Diagnostics.Debug.WriteLine($"[MainViewModel] Stub command executed: {commandName}");
            
            // For now, just log the command execution
            // TODO: Implement actual functionality for each command
            await Task.CompletedTask;
        }
        
        /// <summary>
        /// Create a new company profile
        /// </summary>
        private async Task CreateProfileAsync()
        {
            try
            {
                _logger?.LogInformation("[MainViewModel] CreateProfileAsync called");
                
                // Import the dialog namespace
                var dialog = new MandADiscoverySuite.Dialogs.CreateProfileDialog();
                var result = dialog.ShowDialog();
                
                if (result == true && dialog.CreatedProfile != null && !string.IsNullOrEmpty(dialog.ProfileName))
                {
                    _logger?.LogInformation($"[MainViewModel] Creating profile for: {dialog.ProfileName}");
                    
                    // Create the profile directory structure in C:\DiscoveryData\{ProfileName}
                    var profilePath = System.IO.Path.Combine(@"C:\DiscoveryData", dialog.ProfileName);
                    
                    if (!System.IO.Directory.Exists(profilePath))
                    {
                        System.IO.Directory.CreateDirectory(profilePath);
                        System.IO.Directory.CreateDirectory(System.IO.Path.Combine(profilePath, "Raw"));
                        System.IO.Directory.CreateDirectory(System.IO.Path.Combine(profilePath, "Logs"));
                        System.IO.Directory.CreateDirectory(System.IO.Path.Combine(profilePath, "Credentials"));
                        System.IO.Directory.CreateDirectory(System.IO.Path.Combine(profilePath, "Configuration"));
                        
                        _logger?.LogInformation($"[MainViewModel] Created profile directory structure at: {profilePath}");
                    }
                    else
                    {
                        _logger?.LogWarning($"[MainViewModel] Profile directory already exists: {profilePath}");
                    }
                }
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "[MainViewModel] Error creating company profile");
            }
            
            await Task.CompletedTask;
        }
        
        /// <summary>
        /// Simple async command wrapper for parameterized commands
        /// </summary>
        private class ParameterizedAsyncCommand<T> : ICommand
        {
            private readonly Func<T?, Task> _execute;
            private bool _isExecuting;

            public ParameterizedAsyncCommand(Func<T?, Task> execute)
            {
                _execute = execute ?? throw new ArgumentNullException(nameof(execute));
            }

            public event EventHandler? CanExecuteChanged
            {
                add { CommandManager.RequerySuggested += value; }
                remove { CommandManager.RequerySuggested -= value; }
            }

            public bool CanExecute(object? parameter) => !_isExecuting;

            public async void Execute(object? parameter)
            {
                if (_isExecuting) return;
                
                System.Diagnostics.Debug.WriteLine($"[ParameterizedAsyncCommand] Execute called with parameter: {parameter}");
                
                _isExecuting = true;
                try
                {
                    await _execute((T?)parameter);
                }
                finally
                {
                    _isExecuting = false;
                    CommandManager.InvalidateRequerySuggested();
                }
            }
        }
    }
}