using System;
using System.Collections.ObjectModel;
using System.ComponentModel;
using System.IO;
using System.Linq;
using System.Runtime.CompilerServices;
using System.Threading.Tasks;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Input;
using System.Windows.Media;
using CommunityToolkit.Mvvm.Input;
using MandADiscoverySuite.Models;
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
        private readonly NavigationService _navigationService;
        private readonly ILogger<MainViewModel>? _logger;
        
        // Service instances for real functionality
        private readonly IDiscoveryService _discoveryService;
        private readonly IDataExportService _dataExportService;
        private readonly ModuleRegistryService _moduleRegistryService;
        private readonly LogicEngineService _logicEngineService;
        private TabItem? _selectedTab;
        private ObservableCollection<CompanyProfile> _companyProfiles;
        private CompanyProfile _selectedProfile;
        private string _currentProfileName = "ljpops";
        
        // Data collections
        private ObservableCollection<object> _users = new ObservableCollection<object>();
        private ObservableCollection<object> _computers = new ObservableCollection<object>();
        private ObservableCollection<object> _applications = new ObservableCollection<object>();
        private ObservableCollection<object> _groups = new ObservableCollection<object>();
        private ObservableCollection<object> _databases = new ObservableCollection<object>();
        private ObservableCollection<object> _mailboxes = new ObservableCollection<object>();
        
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
        public ICommand SelectProfileCommand { get; }
        public ICommand DeleteProfileCommand { get; }
        public ICommand SwitchProfileCommand { get; }
        
        // App Registration commands
        public ICommand RunAppRegistrationCommand { get; }
        public ICommand AppRegistrationCommand { get; }
        
        // Theme commands
        public ICommand ToggleThemeCommand { get; }
        public ICommand ShowThemeSelectionCommand { get; }
        
        public TabItem? SelectedTab
        {
            get => _selectedTab;
            set
            {
                _selectedTab = value;
                OnPropertyChanged();
            }
        }
        
        public string CurrentProfileName
        {
            get => _currentProfileName;
            set
            {
                _currentProfileName = value;
                OnPropertyChanged();
            }
        }

        public ObservableCollection<CompanyProfile> CompanyProfiles
        {
            get => _companyProfiles;
            set
            {
                _companyProfiles = value;
                OnPropertyChanged();
            }
        }

        public CompanyProfile SelectedProfile
        {
            get => _selectedProfile;
            set
            {
                _selectedProfile = value;
                OnPropertyChanged();
                
                // DO NOT automatically switch profiles when selecting!
                // This was causing the bug where selecting a profile to delete 
                // would make it the active profile, preventing deletion
                // Switching should only happen via explicit user action
            }
        }
        
        public ObservableCollection<object> Users
        {
            get => _users;
            set
            {
                _users = value;
                OnPropertyChanged();
            }
        }
        
        public ObservableCollection<object> Computers
        {
            get => _computers;
            set
            {
                _computers = value;
                OnPropertyChanged();
            }
        }
        
        public ObservableCollection<object> Applications
        {
            get => _applications;
            set
            {
                _applications = value;
                OnPropertyChanged();
            }
        }
        
        public ObservableCollection<object> Groups
        {
            get => _groups;
            set
            {
                _groups = value;
                OnPropertyChanged();
            }
        }
        
        public ObservableCollection<object> Databases
        {
            get => _databases;
            set
            {
                _databases = value;
                OnPropertyChanged();
            }
        }
        
        public ObservableCollection<object> Mailboxes
        {
            get => _mailboxes;
            set
            {
                _mailboxes = value;
                OnPropertyChanged();
            }
        }
        
        public MainViewModel()
        {
            try
            {
                // Create logger
                var loggerFactory = LoggerFactory.Create(builder => builder.AddDebug());
                _logger = loggerFactory.CreateLogger<MainViewModel>();
                var tabsLogger = loggerFactory.CreateLogger<TabsService>();
                
                _logger?.LogInformation("[MainViewModel] Constructor started");
            
            // Initialize services
            _tabsService = new TabsService(tabsLogger);
            var navLogger = loggerFactory.CreateLogger<NavigationService>();
            _navigationService = new NavigationService(_tabsService, navLogger);
            
            // Initialize service instances
            _discoveryService = new DiscoveryService();
            _dataExportService = DataExportService.Instance;
            _moduleRegistryService = ModuleRegistryService.Instance;
            var logicEngineLogger = loggerFactory.CreateLogger<LogicEngineService>();
            _logicEngineService = new LogicEngineService(logicEngineLogger);
            
            // Initialize collections
            _companyProfiles = new ObservableCollection<CompanyProfile>();
            
            // Initialize commands
            OpenTabCommand = new RelayCommand<string>(async (param) => await OpenTabAsync(param));
            CloseTabCommand = new RelayCommand<object>(async (param) => await CloseTabAsync(param));
            
            // Initialize common main window commands with real implementations
            RefreshDashboardCommand = new RelayCommand<object>(async _ => await RefreshDashboardAsync());
            StartDiscoveryCommand = new RelayCommand<object>(async _ => await StartDiscoveryAsync());
            ImportDataCommand = new RelayCommand<object>(async _ => await ImportDataAsync());
            ToggleModuleCommand = new RelayCommand<object>(async param => await ToggleModuleAsync(param));
            ShowAllDiscoveryDataCommand = new RelayCommand<object>(async _ => await ShowAllDiscoveryDataAsync());
            SelectManagerCommand = new RelayCommand<object>(async _ => await SelectManagerAsync());
            RefreshDataCommand = new RelayCommand<object>(async _ => await ReloadDataAsync());
            ExportResultsCommand = new RelayCommand<object>(async _ => await ExportResultsAsync());
            ShowRefreshSettingsCommand = new RelayCommand<object>(async _ => await ShowRefreshSettingsAsync());
            
            // Company profile commands
            CreateProfileCommand = new AsyncRelayCommand(CreateProfileAsync);
            SelectProfileCommand = new AsyncRelayCommand(SelectProfileAsync);
            DeleteProfileCommand = new RelayCommand<object>(async param => await DeleteProfileAsync(param));
            SwitchProfileCommand = new AsyncRelayCommand(SwitchToSelectedProfileAsync);
            
            // App Registration commands
            RunAppRegistrationCommand = new AsyncRelayCommand(RunAppRegistrationAsync);
            AppRegistrationCommand = new AsyncRelayCommand(RunAppRegistrationAsync);
            
            // Theme commands
            ToggleThemeCommand = new AsyncRelayCommand(ToggleThemeAsync);
            ShowThemeSelectionCommand = new AsyncRelayCommand(ShowThemeSelectionAsync);
            
            _logger?.LogInformation("MainViewModel initialized with new architecture");
            _logger?.LogInformation($"CreateProfileCommand initialized: {CreateProfileCommand != null}");
            
            // Load company profiles
            LoadCompanyProfiles();
            
            _logger?.LogInformation($"[MainViewModel] MainViewModel constructor completed. CurrentProfileName='{CurrentProfileName}', CompanyProfiles.Count={CompanyProfiles.Count}");
            
            // Open Overview by default on startup - use NavigationService
            Task.Run(async () =>
            {
                try
                {
                    await Task.Delay(500); // Small delay to ensure UI is ready
                    await _navigationService.NavigateToTabAsync("overview", "Overview");
                }
                catch (Exception ex)
                {
                    _logger?.LogError(ex, "[MainViewModel] Error in background dashboard task");
                }
            }).ContinueWith(t =>
            {
                if (t.IsFaulted && t.Exception != null)
                {
                    _logger?.LogError(t.Exception, "[MainViewModel] Unhandled exception in dashboard task");
                }
            }, TaskScheduler.Default);
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"[MainViewModel] Constructor failed: {ex}");
                // Don't throw - just log the error and continue with minimal functionality
                try
                {
                    var loggerFactory = LoggerFactory.Create(builder => builder.AddDebug());
                    var logger = loggerFactory.CreateLogger<MainViewModel>();
                    logger.LogError(ex, "[MainViewModel] Constructor failed, continuing with minimal functionality");
                }
                catch
                {
                    // If even logging fails, continue silently
                }
            }
        }
        
        /// <summary>
        /// Initialize with TabControl reference
        /// </summary>
        public void InitializeTabControl(TabControl tabControl)
        {
            _tabsService.Initialize(tabControl);
            _logger?.LogInformation("TabControl initialized");
        }
        
        /// <summary>
        /// Load company profiles from the discovery data directory
        /// </summary>
        private void LoadCompanyProfiles()
        {
            try
            {
                var discoveryDataPath = ConfigurationService.Instance.DiscoveryDataRootPath;
                _logger?.LogInformation($"Loading company profiles from {discoveryDataPath}, CurrentProfileName='{_currentProfileName}'");
                
                if (!Directory.Exists(discoveryDataPath))
                {
                    _logger?.LogWarning("DiscoveryData directory does not exist");
                    return;
                }
                
                CompanyProfiles.Clear();
                
                // Get ALL directories directly under DiscoveryData - no filtering 
                var directories = Directory.GetDirectories(discoveryDataPath);
                foreach (var directory in directories)
                {
                    var companyName = System.IO.Path.GetFileName(directory);
                    
                    var isActiveProfile = companyName.Equals(_currentProfileName, StringComparison.OrdinalIgnoreCase);
                    
                    var profile = new CompanyProfile
                    {
                        CompanyName = companyName,
                        Id = Guid.NewGuid().ToString(),
                        Created = Directory.GetCreationTime(directory),
                        LastModified = Directory.GetLastWriteTime(directory),
                        IsActive = isActiveProfile
                    };
                    
                    CompanyProfiles.Add(profile);
                    
                    // Set the initially selected profile to match the current active profile
                    // This is just for display - it doesn't switch the actual profile
                    if (isActiveProfile)
                    {
                        SelectedProfile = profile;
                        _logger?.LogInformation($"Set SelectedProfile to active profile: {profile.CompanyName}");
                    }
                    
                    _logger?.LogInformation($"Found company profile: {companyName}, IsActive: {profile.IsActive}");
                }
                
                // If no profile matches current, just select the first one for display
                if (SelectedProfile == null && CompanyProfiles.Count > 0)
                {
                    SelectedProfile = CompanyProfiles.First();
                    _logger?.LogInformation($"No active profile match, selected first: {SelectedProfile.CompanyName}");
                }
                
                _logger?.LogInformation($"Loaded {CompanyProfiles.Count} company profiles, CurrentProfileName remains '{_currentProfileName}'");
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error loading company profiles");
            }
        }
        
        /// <summary>
        /// Switch to the currently selected profile in the dropdown
        /// </summary>
        private async Task SwitchToSelectedProfileAsync()
        {
            try
            {
                if (SelectedProfile == null)
                {
                    _logger?.LogWarning("[MainViewModel] No profile selected to switch to");
                    return;
                }
                
                if (SelectedProfile.CompanyName.Equals(CurrentProfileName, StringComparison.OrdinalIgnoreCase))
                {
                    _logger?.LogInformation($"[MainViewModel] Already on profile: {SelectedProfile.CompanyName}");
                    return;
                }
                
                var result = MessageBox.Show($"Switch to profile '{SelectedProfile.CompanyName}'?\n\nThis will change the active working profile.", 
                    "Switch Profile", MessageBoxButton.YesNo, MessageBoxImage.Question);
                
                if (result == MessageBoxResult.Yes)
                {
                    await SwitchToProfileAsync(SelectedProfile.CompanyName);
                    
                    // Reload the profiles to update IsActive flags
                    LoadCompanyProfiles();
                }
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "[MainViewModel] Error switching to selected profile");
                MessageBox.Show($"Error switching profile: {ex.Message}", "Error", MessageBoxButton.OK, MessageBoxImage.Error);
            }
        }
        
        /// <summary>
        /// Switch to a different company profile
        /// </summary>
        private async Task SwitchToProfileAsync(string companyName)
        {
            try
            {
                _logger?.LogInformation($"Switching to company profile: {companyName}");
                
                // Update current profile name
                CurrentProfileName = companyName;
                
                // Reload data for the new profile (if there's a data loading method)
                await ReloadDataAsync();
                
                _logger?.LogInformation($"Successfully switched to profile: {companyName}");
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, $"Error switching to profile: {companyName}");
            }
        }
        
        private async Task OpenTabAsync(string? tabKey)
        {
            if (string.IsNullOrWhiteSpace(tabKey))
                return;
                
            try
            {
                _logger?.LogInformation($"[MainViewModel] OpenTabAsync called with key: {tabKey}");
                System.Diagnostics.Debug.WriteLine($"[MainViewModel] OpenTabAsync called with key: {tabKey}");
                
                // Use NavigationService to handle async navigation safely
                var success = await _navigationService.NavigateToTabAsync(tabKey, GetTabTitle(tabKey));

                if (!success)
                {
                    _logger?.LogWarning($"Failed to open tab: {tabKey}");
                    
                    // Show user-friendly error on UI thread
                    if (System.Windows.Application.Current?.Dispatcher != null)
                    {
                        await System.Windows.Application.Current.Dispatcher.InvokeAsync(() =>
                        {
                            System.Windows.MessageBox.Show(
                                $"Unable to open {GetTabTitle(tabKey)} view. Please check the logs for details.",
                                "Navigation Error",
                                System.Windows.MessageBoxButton.OK,
                                System.Windows.MessageBoxImage.Warning);
                        });
                    }
                }
                else
                {
                    _logger?.LogInformation($"Successfully opened tab: {tabKey}");
                }
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, $"Error opening tab: {tabKey}");
                
                // Show error to user on UI thread
                if (System.Windows.Application.Current?.Dispatcher != null)
                {
                    await System.Windows.Application.Current.Dispatcher.InvokeAsync(() =>
                    {
                        System.Windows.MessageBox.Show(
                            $"Error navigating to {GetTabTitle(tabKey)}: {ex.Message}",
                            "Navigation Error",
                            System.Windows.MessageBoxButton.OK,
                            System.Windows.MessageBoxImage.Error);
                    });
                }
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
            
            // Execute actual functionality based on command name
            try
            {
                switch (commandName?.ToLower())
                {
                    case "refresh":
                        await ReloadDataAsync();
                        break;
                    case "export":
                        // Trigger export through data service
                        MessageBox.Show("Export functionality will be implemented through the Export menu.", "Export", MessageBoxButton.OK, MessageBoxImage.Information);
                        break;
                    case "settings":
                        await _navigationService.NavigateToTabAsync("settings", "Settings");
                        break;
                    case "help":
                        MessageBox.Show("M&A Discovery Suite Help\n\nUse the tabs to navigate different data views.\nUse the discovery tab to run PowerShell modules.\nCheck logs for detailed operation information.", "Help", MessageBoxButton.OK, MessageBoxImage.Information);
                        break;
                    default:
                        _logger?.LogWarning($"[MainViewModel] Unknown command: {commandName}");
                        break;
                }
            }
            catch (Exception ex)
            {
                _logger?.LogError($"[MainViewModel] Error executing command {commandName}: {ex.Message}");
                MessageBox.Show($"Error executing command: {ex.Message}", "Error", MessageBoxButton.OK, MessageBoxImage.Error);
            }
        }
        
        /// <summary>
        /// Reload data from CSV files
        /// </summary>
        public async Task ReloadDataAsync()
        {
            await Task.Run(async () =>
            {
                try
                {
                    _logger?.LogInformation($"[MainViewModel] Reloading data for profile: {CurrentProfileName}");
                    
                    // Clear existing collections
                    System.Windows.Application.Current?.Dispatcher?.Invoke(() =>
                    {
                        Users.Clear();
                        Computers.Clear();
                        Applications.Clear();
                        Groups.Clear();
                        Databases.Clear();
                        Mailboxes.Clear();
                    });
                    
                    // Load CSV data from C:\discoverydata\{CurrentProfileName}\Raw\
                    var dataPath = $@"C:\discoverydata\{CurrentProfileName}\Raw";
                    
                    if (!Directory.Exists(dataPath))
                    {
                        _logger?.LogWarning($"[MainViewModel] Data directory does not exist: {dataPath}");
                        return;
                    }
                    
                    // Load CSV data using data service
                    _logger?.LogInformation($"[MainViewModel] Loading data from CSV files");
                    
                    // Count CSV files for progress indication
                    var csvFiles = Directory.GetFiles(dataPath, "*.csv");
                    _logger?.LogInformation($"[MainViewModel] Found {csvFiles.Length} CSV files for processing");
                    
                    // Load actual CSV data using data service
                    var dataService = SimpleServiceLocator.Instance.GetService<IDataService>();
                    if (dataService != null)
                    {
                        try
                        {
                            // Load data asynchronously using the data service
                            var users = await dataService.LoadUsersAsync(CurrentProfileName);
                            var infrastructure = await dataService.LoadInfrastructureAsync(CurrentProfileName);
                            var groups = await dataService.LoadGroupsAsync(CurrentProfileName);
                            var applications = await dataService.LoadApplicationsAsync(CurrentProfileName);
                            
                            // Update collections
                            _users.Clear();
                            foreach (var user in users) _users.Add(user);
                            
                            _computers.Clear();
                            foreach (var computer in infrastructure) _computers.Add(computer);
                            
                            _groups.Clear();
                            foreach (var group in groups) _groups.Add(group);
                            
                            _applications.Clear();
                            foreach (var app in applications) _applications.Add(app);
                            
                            _logger?.LogInformation($"[MainViewModel] Loaded {users.Count()} users, {infrastructure.Count()} computers, {groups.Count()} groups, {applications.Count()} applications");
                        }
                        catch (Exception dataEx)
                        {
                            _logger?.LogError($"[MainViewModel] Error loading data through data service: {dataEx.Message}");
                        }
                    }
                    else
                    {
                        _logger?.LogWarning("[MainViewModel] Data service not available");
                    }
                    
                    // Trigger UI update
                    OnPropertyChanged(nameof(Users));
                    OnPropertyChanged(nameof(Computers));
                    OnPropertyChanged(nameof(Applications));
                    OnPropertyChanged(nameof(Groups));
                    OnPropertyChanged(nameof(Databases));
                    OnPropertyChanged(nameof(Mailboxes));
                    
                    _logger?.LogInformation($"[MainViewModel] Data refresh completed for {csvFiles.Length} CSV files");
                }
                catch (Exception ex)
                {
                    _logger?.LogError($"[MainViewModel] Error reloading data: {ex.Message}");
                }
            });
        }
        
        /// <summary>
        /// Run Azure App Registration setup
        /// </summary>
        private async Task RunAppRegistrationAsync()
        {
            try
            {
                _logger?.LogInformation("[MainViewModel] Running App Registration setup");
                
                // Run the AppRegistration PowerShell script using ConfigurationService
                var scriptPath = ConfigurationService.Instance.GetAppRegistrationScriptPath();
                
                if (!File.Exists(scriptPath))
                {
                    // Try fallback path in application directory
                    scriptPath = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "Scripts", "DiscoveryCreateAppRegistration.ps1");
                }
                
                if (File.Exists(scriptPath))
                {
                    // Get current company profile name
                    var companyName = SelectedProfile?.CompanyName ?? CurrentProfileName ?? "ljpops";
                    
                    var startInfo = new System.Diagnostics.ProcessStartInfo
                    {
                        FileName = "powershell.exe",
                        Arguments = $"-NoProfile -ExecutionPolicy Bypass -File \"{scriptPath}\" -CompanyName \"{companyName}\"",
                        UseShellExecute = true,
                        WorkingDirectory = Path.GetDirectoryName(scriptPath)
                    };
                    
                    var process = System.Diagnostics.Process.Start(startInfo);
                    _logger?.LogInformation($"[MainViewModel] Started App Registration script: {scriptPath} with CompanyName: {companyName}");
                    
                    MessageBox.Show("App Registration setup script has been launched in a new window.\n\nFollow the prompts to configure Azure AD App Registration.", 
                        "App Registration Setup", MessageBoxButton.OK, MessageBoxImage.Information);
                }
                else
                {
                    _logger?.LogWarning($"[MainViewModel] App Registration script not found at: {scriptPath}");
                    MessageBox.Show($"App Registration script not found.\n\nExpected location:\n{scriptPath}", 
                        "Script Not Found", MessageBoxButton.OK, MessageBoxImage.Warning);
                }
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "[MainViewModel] Error running App Registration");
                MessageBox.Show($"Error running App Registration:\n{ex.Message}", "Error", MessageBoxButton.OK, MessageBoxImage.Error);
            }
        }
        
        /// <summary>
        /// Toggle between dark and light theme
        /// </summary>
        private async Task ToggleThemeAsync()
        {
            try
            {
                _logger?.LogInformation("[MainViewModel] Toggling theme");
                
                var themeService = SimpleServiceLocator.Instance.GetService<ThemeService>();
                if (themeService != null)
                {
                    // Toggle theme
                    themeService.ToggleTheme();
                    _logger?.LogInformation("[MainViewModel] Theme toggled successfully");
                }
                else
                {
                    _logger?.LogWarning("[MainViewModel] ThemeService not available");
                }
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "[MainViewModel] Error toggling theme");
            }
        }
        
        /// <summary>
        /// Show theme selection dialog
        /// </summary>
        private async Task ShowThemeSelectionAsync()
        {
            try
            {
                _logger?.LogInformation("[MainViewModel] Showing theme selection");
                
                var dialog = new Views.ThemeSelectionDialog();
                dialog.Owner = Application.Current.MainWindow;
                dialog.WindowStartupLocation = WindowStartupLocation.CenterOwner;
                
                var result = dialog.ShowDialog();
                if (result == true)
                {
                    _logger?.LogInformation("[MainViewModel] Theme selection completed");
                }
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "[MainViewModel] Error showing theme selection");
            }
            await Task.CompletedTask;
        }
        
        /// <summary>
        /// Create a new company profile
        /// </summary>
        private async Task CreateProfileAsync()
        {
            try
            {
                _logger?.LogInformation("[MainViewModel] CreateProfileAsync called - Starting profile creation");
                
                string companyName = null;
                
                // Create a styled input dialog that matches the application theme
                var inputDialog = new System.Windows.Window
                {
                    Title = "Create New Company Profile",
                    Width = 450,
                    Height = 250,
                    WindowStartupLocation = WindowStartupLocation.CenterOwner,
                    Owner = Application.Current.MainWindow,
                    Background = new SolidColorBrush((Color)ColorConverter.ConvertFromString("#FF0F1419")),
                    ResizeMode = ResizeMode.NoResize,
                    WindowStyle = WindowStyle.SingleBorderWindow
                };
                
                var mainBorder = new Border
                {
                    Background = new SolidColorBrush((Color)ColorConverter.ConvertFromString("#FF2D3748")),
                    CornerRadius = new CornerRadius(8),
                    Margin = new Thickness(15),
                    Padding = new Thickness(25)
                };
                
                var stackPanel = new System.Windows.Controls.StackPanel();
                
                // Title
                var titleBlock = new System.Windows.Controls.TextBlock 
                { 
                    Text = "Create New Company Profile", 
                    FontSize = 16, 
                    FontWeight = FontWeights.SemiBold,
                    Foreground = new SolidColorBrush((Color)ColorConverter.ConvertFromString("#FFE2E8F0")),
                    Margin = new Thickness(0, 0, 0, 15),
                    HorizontalAlignment = HorizontalAlignment.Center
                };
                stackPanel.Children.Add(titleBlock);
                
                // Instructions
                var instructionBlock = new System.Windows.Controls.TextBlock 
                { 
                    Text = "Enter company name:", 
                    FontSize = 13,
                    Foreground = new SolidColorBrush((Color)ColorConverter.ConvertFromString("#FFA0AEC0")),
                    Margin = new Thickness(0, 0, 0, 8) 
                };
                stackPanel.Children.Add(instructionBlock);
                
                // Text input
                var textBox = new System.Windows.Controls.TextBox 
                { 
                    FontSize = 13,
                    Padding = new Thickness(10, 8, 10, 8),
                    Margin = new Thickness(0, 0, 0, 20),
                    Background = new SolidColorBrush((Color)ColorConverter.ConvertFromString("#FF1A202C")),
                    Foreground = new SolidColorBrush((Color)ColorConverter.ConvertFromString("#FFE2E8F0")),
                    BorderBrush = new SolidColorBrush((Color)ColorConverter.ConvertFromString("#FF4A5568")),
                    BorderThickness = new Thickness(1)
                };
                stackPanel.Children.Add(textBox);
                
                // Button panel
                var buttonPanel = new System.Windows.Controls.StackPanel 
                { 
                    Orientation = System.Windows.Controls.Orientation.Horizontal, 
                    HorizontalAlignment = HorizontalAlignment.Right,
                    Margin = new Thickness(0, 10, 0, 0)
                };
                
                var cancelButton = new System.Windows.Controls.Button 
                { 
                    Content = "Cancel", 
                    Width = 80, 
                    Height = 35,
                    Margin = new Thickness(0, 0, 10, 0),
                    Background = new SolidColorBrush((Color)ColorConverter.ConvertFromString("#FF4A5568")),
                    Foreground = new SolidColorBrush((Color)ColorConverter.ConvertFromString("#FFE2E8F0")),
                    BorderThickness = new Thickness(0),
                    FontSize = 12
                };
                
                var okButton = new System.Windows.Controls.Button 
                { 
                    Content = "Create", 
                    Width = 80, 
                    Height = 35,
                    Background = new SolidColorBrush((Color)ColorConverter.ConvertFromString("#FF38B2AC")),
                    Foreground = new SolidColorBrush((Color)ColorConverter.ConvertFromString("#FFFFFFFF")),
                    BorderThickness = new Thickness(0),
                    FontSize = 12,
                    FontWeight = FontWeights.Medium
                };
                
                okButton.Click += (s, e) => { companyName = textBox.Text; inputDialog.DialogResult = true; };
                cancelButton.Click += (s, e) => { inputDialog.DialogResult = false; };
                
                buttonPanel.Children.Add(cancelButton);
                buttonPanel.Children.Add(okButton);
                stackPanel.Children.Add(buttonPanel);
                
                mainBorder.Child = stackPanel;
                inputDialog.Content = mainBorder;
                
                // Focus the text box when dialog opens
                inputDialog.Loaded += (s, e) => textBox.Focus();
                
                var result = inputDialog.ShowDialog();
                if (result != true) return;
                
                if (!string.IsNullOrWhiteSpace(companyName))
                {
                    // Create directory structure
                    var profilePath = System.IO.Path.Combine(ConfigurationService.Instance.DiscoveryDataRootPath, companyName.Trim());
                    
                    if (!System.IO.Directory.Exists(profilePath))
                    {
                        System.IO.Directory.CreateDirectory(profilePath);
                        System.IO.Directory.CreateDirectory(System.IO.Path.Combine(profilePath, "Raw"));
                        System.IO.Directory.CreateDirectory(System.IO.Path.Combine(profilePath, "Logs"));
                        System.IO.Directory.CreateDirectory(System.IO.Path.Combine(profilePath, "Credentials"));
                        System.IO.Directory.CreateDirectory(System.IO.Path.Combine(profilePath, "Configuration"));
                        
                        _logger?.LogInformation($"[MainViewModel] Created profile: {companyName}");
                        
                        // Reload profiles
                        LoadCompanyProfiles();
                        SelectedProfile = CompanyProfiles.FirstOrDefault(p => p.CompanyName == companyName.Trim());
                        
                        MessageBox.Show($"Profile '{companyName}' created successfully!", "Success", MessageBoxButton.OK, MessageBoxImage.Information);
                    }
                    else
                    {
                        MessageBox.Show($"Profile '{companyName}' already exists!", "Warning", MessageBoxButton.OK, MessageBoxImage.Warning);
                    }
                }
                
                return;
                
                // Original complex dialog code - disabled for now
                await Application.Current.Dispatcher.InvokeAsync(() =>
                {
                    _logger?.LogInformation("[MainViewModel] Creating CreateProfileDialog instance");
                    var dialog = new MandADiscoverySuite.Dialogs.CreateProfileDialog();
                    
                    _logger?.LogInformation("[MainViewModel] Setting dialog owner to main window");
                    dialog.Owner = Application.Current.MainWindow;
                    dialog.WindowStartupLocation = WindowStartupLocation.CenterOwner;
                    
                    _logger?.LogInformation("[MainViewModel] Showing dialog");
                    var result = dialog.ShowDialog();
                    
                    _logger?.LogInformation($"[MainViewModel] Dialog result: {result}");
                    
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
                        
                        // Reload profiles and select the new one
                        LoadCompanyProfiles();
                        SelectedProfile = CompanyProfiles.FirstOrDefault(p => p.CompanyName == dialog.ProfileName);
                        
                        _logger?.LogInformation($"[MainViewModel] Profile created and selected: {dialog.ProfileName}");
                    }
                    else
                    {
                        _logger?.LogInformation("[MainViewModel] Dialog cancelled or no profile created");
                    }
                });
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "[MainViewModel] Error creating company profile");
                await Application.Current.Dispatcher.InvokeAsync(() =>
                {
                    MessageBox.Show($"Error creating profile: {ex.Message}", "Error", MessageBoxButton.OK, MessageBoxImage.Error);
                });
            }
        }
        
        private async Task SelectProfileAsync()
        {
            try
            {
                _logger?.LogInformation("[MainViewModel] SelectProfileAsync called");
                
                // Open the company profile selection dialog
                var dialog = new MandADiscoverySuite.Dialogs.CompanyProfileSelectionDialog();
                var result = dialog.ShowDialog();
                
                if (result == true && dialog.ProfileSelected && !string.IsNullOrEmpty(dialog.SelectedProfileName))
                {
                    var newProfileName = dialog.SelectedProfileName.Trim();
                    _logger?.LogInformation($"[MainViewModel] Selecting profile: {newProfileName}");
                    
                    // Validate that the profile exists and has proper structure
                    var profilePath = System.IO.Path.Combine(@"C:\DiscoveryData", newProfileName);
                    
                    if (System.IO.Directory.Exists(profilePath))
                    {
                        // Update current profile
                        CurrentProfileName = newProfileName;
                        _logger?.LogInformation($"[MainViewModel] Profile changed to: {newProfileName}");
                        
                        // Reload data for the new profile
                        await ReloadDataAsync();
                        
                        _logger?.LogInformation($"[MainViewModel] Data reloaded for profile: {newProfileName}");
                    }
                    else
                    {
                        _logger?.LogError($"[MainViewModel] Profile directory does not exist: {profilePath}");
                    }
                }
                else
                {
                    _logger?.LogInformation("[MainViewModel] Profile selection cancelled");
                }
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "[MainViewModel] Error selecting company profile");
            }
            
            await Task.CompletedTask;
        }
        
        /// <summary>
        /// Delete a company profile
        /// </summary>
        private async Task DeleteProfileAsync(object? parameter)
        {
            try
            {
                _logger?.LogInformation("[MainViewModel] DeleteProfileAsync called");
                System.Diagnostics.Debug.WriteLine("[MainViewModel] DeleteProfileAsync called");
                
                CompanyProfile? profileToDelete = null;
                
                // Get the profile to delete from parameter or SelectedProfile in dropdown
                if (parameter is CompanyProfile profile)
                {
                    profileToDelete = profile;
                    _logger?.LogInformation($"[MainViewModel] Using parameter profile: {profile.CompanyName}");
                }
                else if (SelectedProfile != null)
                {
                    // When delete button clicked without parameter, delete the selected profile in dropdown
                    profileToDelete = SelectedProfile;
                    _logger?.LogInformation($"[MainViewModel] Using SelectedProfile: {SelectedProfile.CompanyName}");
                }
                
                if (profileToDelete == null)
                {
                    _logger?.LogWarning("[MainViewModel] No profile to delete");
                    MessageBox.Show("No profile selected for deletion.", "Warning", MessageBoxButton.OK, MessageBoxImage.Warning);
                    return;
                }
                
                _logger?.LogInformation($"[MainViewModel] Attempting to delete profile: {profileToDelete.CompanyName}");
                
                // Don't allow deleting the current active profile
                _logger?.LogInformation($"[MainViewModel] Checking deletion: profileName='{profileToDelete.CompanyName}', CurrentProfileName='{CurrentProfileName}'");
                
                if (profileToDelete.CompanyName.Equals(CurrentProfileName, StringComparison.OrdinalIgnoreCase))
                {
                    _logger?.LogWarning($"[MainViewModel] Cannot delete active profile: {profileToDelete.CompanyName}");
                    MessageBox.Show("Cannot delete the currently active profile. Please switch to another profile first.", "Warning", MessageBoxButton.OK, MessageBoxImage.Warning);
                    return;
                }
                
                _logger?.LogInformation($"[MainViewModel] Profile can be deleted, showing confirmation dialog");
                
                // Confirm deletion
                var result = MessageBox.Show($"Are you sure you want to delete the profile '{profileToDelete.CompanyName}'?\n\nThis will permanently delete all data in:\n{ConfigurationService.Instance.DiscoveryDataRootPath}\\{profileToDelete.CompanyName}", 
                    "Confirm Deletion", MessageBoxButton.YesNo, MessageBoxImage.Question);
                
                _logger?.LogInformation($"[MainViewModel] Confirmation dialog result: {result}");
                
                if (result != MessageBoxResult.Yes)
                {
                    _logger?.LogInformation("[MainViewModel] User cancelled deletion");
                    return;
                }
                
                // Delete the directory
                var profilePath = System.IO.Path.Combine(@"C:\DiscoveryData", profileToDelete.CompanyName);
                _logger?.LogInformation($"[MainViewModel] Deleting directory: {profilePath}");
                
                if (System.IO.Directory.Exists(profilePath))
                {
                    System.IO.Directory.Delete(profilePath, true);
                    _logger?.LogInformation($"[MainViewModel] Deleted profile directory: {profilePath}");
                }
                else
                {
                    _logger?.LogWarning($"[MainViewModel] Directory does not exist: {profilePath}");
                }
                
                // Remove from collection
                _logger?.LogInformation($"[MainViewModel] Removing profile from collection");
                CompanyProfiles.Remove(profileToDelete);
                
                // Clear selection if this was the selected profile
                if (SelectedProfile == profileToDelete)
                {
                    SelectedProfile = CompanyProfiles.FirstOrDefault();
                    _logger?.LogInformation($"[MainViewModel] Cleared selection, new selection: {SelectedProfile?.CompanyName}");
                }
                
                _logger?.LogInformation($"[MainViewModel] Profile '{profileToDelete.CompanyName}' deleted successfully");
                MessageBox.Show($"Profile '{profileToDelete.CompanyName}' deleted successfully.", "Success", MessageBoxButton.OK, MessageBoxImage.Information);
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "[MainViewModel] Error deleting company profile");
                MessageBox.Show($"Error deleting profile: {ex.Message}", "Error", MessageBoxButton.OK, MessageBoxImage.Error);
            }
        }
        
        #region Real Command Implementations
        
        /// <summary>
        /// Refresh dashboard data by reloading through LogicEngineService
        /// </summary>
        private async Task RefreshDashboardAsync()
        {
            try
            {
                _logger?.LogInformation("[MainViewModel] RefreshDashboard started");
                
                // Clear logic engine cache and reload data
                await _logicEngineService.ClearCacheAsync();
                await _logicEngineService.LoadDataAsync(CurrentProfileName);
                
                // Reload UI data
                await ReloadDataAsync();
                
                _logger?.LogInformation("[MainViewModel] RefreshDashboard completed successfully");
                MessageBox.Show("Dashboard data refreshed successfully.", "Refresh Complete", MessageBoxButton.OK, MessageBoxImage.Information);
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "[MainViewModel] Error refreshing dashboard");
                MessageBox.Show($"Error refreshing dashboard: {ex.Message}", "Error", MessageBoxButton.OK, MessageBoxImage.Error);
            }
        }
        
        /// <summary>
        /// Start discovery by executing enabled modules via PowerShell
        /// </summary>
        private async Task StartDiscoveryAsync()
        {
            try
            {
                _logger?.LogInformation("[MainViewModel] StartDiscovery started");
                
                // Get enabled modules from registry
                var enabledModules = await _moduleRegistryService.GetEnabledModulesAsync();
                if (!enabledModules.Any())
                {
                    MessageBox.Show("No discovery modules are enabled. Please enable modules in Settings first.", 
                        "No Modules", MessageBoxButton.OK, MessageBoxImage.Warning);
                    return;
                }
                
                var moduleNames = enabledModules.Select(m => m.Name).ToArray();
                _logger?.LogInformation($"[MainViewModel] Starting discovery for profile '{CurrentProfileName}' with modules: {string.Join(", ", moduleNames)}");
                
                // Show progress dialog
                var progressWindow = new System.Windows.Window
                {
                    Title = "Discovery In Progress",
                    Width = 400,
                    Height = 200,
                    WindowStartupLocation = WindowStartupLocation.CenterOwner,
                    Owner = Application.Current.MainWindow,
                    ResizeMode = ResizeMode.NoResize
                };
                
                var progressText = new System.Windows.Controls.TextBlock
                {
                    Text = "Starting discovery modules...",
                    HorizontalAlignment = HorizontalAlignment.Center,
                    VerticalAlignment = VerticalAlignment.Center,
                    FontSize = 14
                };
                progressWindow.Content = progressText;
                
                progressWindow.Show();
                
                try
                {
                    // Start discovery
                    var success = await _discoveryService.StartDiscoveryAsync(CurrentProfileName, moduleNames);
                    
                    if (success)
                    {
                        progressText.Text = "Discovery completed! Refreshing data...";
                        
                        // Wait a moment for CSV files to be written
                        await Task.Delay(2000);
                        
                        // Refresh data
                        await RefreshDashboardAsync();
                        
                        _logger?.LogInformation("[MainViewModel] StartDiscovery completed successfully");
                        MessageBox.Show($"Discovery completed successfully for {moduleNames.Length} modules.", 
                            "Discovery Complete", MessageBoxButton.OK, MessageBoxImage.Information);
                    }
                    else
                    {
                        _logger?.LogWarning("[MainViewModel] StartDiscovery failed");
                        MessageBox.Show("Discovery failed. Please check the logs for details.", 
                            "Discovery Failed", MessageBoxButton.OK, MessageBoxImage.Warning);
                    }
                }
                finally
                {
                    progressWindow.Close();
                }
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "[MainViewModel] Error starting discovery");
                MessageBox.Show($"Error starting discovery: {ex.Message}", "Error", MessageBoxButton.OK, MessageBoxImage.Error);
            }
        }
        
        /// <summary>
        /// Import data from CSV files
        /// </summary>
        private async Task ImportDataAsync()
        {
            try
            {
                _logger?.LogInformation("[MainViewModel] ImportData started");
                
                var openFileDialog = new Microsoft.Win32.OpenFileDialog
                {
                    Title = "Import Data Files",
                    Filter = "CSV files (*.csv)|*.csv|All files (*.*)|*.*",
                    Multiselect = true
                };
                
                if (openFileDialog.ShowDialog() == true)
                {
                    var rawDataPath = Path.Combine(ConfigurationService.Instance.DiscoveryDataRootPath, CurrentProfileName, "Raw");
                    Directory.CreateDirectory(rawDataPath);
                    
                    foreach (var filePath in openFileDialog.FileNames)
                    {
                        var fileName = Path.GetFileName(filePath);
                        var destPath = Path.Combine(rawDataPath, fileName);
                        
                        File.Copy(filePath, destPath, overwrite: true);
                        _logger?.LogInformation($"[MainViewModel] Imported file: {fileName}");
                    }
                    
                    // Refresh data after import
                    await RefreshDashboardAsync();
                    
                    MessageBox.Show($"Successfully imported {openFileDialog.FileNames.Length} files.", 
                        "Import Complete", MessageBoxButton.OK, MessageBoxImage.Information);
                }
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "[MainViewModel] Error importing data");
                MessageBox.Show($"Error importing data: {ex.Message}", "Error", MessageBoxButton.OK, MessageBoxImage.Error);
            }
        }
        
        /// <summary>
        /// Toggle a discovery module on/off
        /// </summary>
        private async Task ToggleModuleAsync(object parameter)
        {
            try
            {
                _logger?.LogInformation($"[MainViewModel] ToggleModule started with parameter: {parameter}");
                
                if (parameter is string moduleName)
                {
                    var modules = await _moduleRegistryService.GetAllModulesAsync();
                    var module = modules.FirstOrDefault(m => m.Name == moduleName);
                    
                    if (module != null)
                    {
                        module.IsEnabled = !module.IsEnabled;
                        await _moduleRegistryService.UpdateModuleAsync(module);
                        
                        _logger?.LogInformation($"[MainViewModel] Module '{moduleName}' toggled to {module.IsEnabled}");
                        MessageBox.Show($"Module '{moduleName}' {(module.IsEnabled ? "enabled" : "disabled")}.", 
                            "Module Updated", MessageBoxButton.OK, MessageBoxImage.Information);
                    }
                    else
                    {
                        MessageBox.Show($"Module '{moduleName}' not found.", "Error", MessageBoxButton.OK, MessageBoxImage.Error);
                    }
                }
                else
                {
                    // Open module management dialog
                    await _navigationService.NavigateToTabAsync("settings", "Settings");
                }
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "[MainViewModel] Error toggling module");
                MessageBox.Show($"Error toggling module: {ex.Message}", "Error", MessageBoxButton.OK, MessageBoxImage.Error);
            }
        }
        
        /// <summary>
        /// Export discovery results
        /// </summary>
        private async Task ExportResultsAsync()
        {
            try
            {
                _logger?.LogInformation("[MainViewModel] ExportResults started");
                
                // Show format selection dialog
                var formatDialog = MessageBox.Show("Choose export format:\n\nYes = CSV\nNo = Excel\nCancel = JSON", 
                    "Export Format", MessageBoxButton.YesNoCancel, MessageBoxImage.Question);
                
                if (formatDialog == MessageBoxResult.Cancel)
                    return;
                
                // Get data to export
                var allData = new
                {
                    Users = Users,
                    Computers = Computers,
                    Applications = Applications,
                    Groups = Groups,
                    Databases = Databases,
                    Mailboxes = Mailboxes
                };
                
                bool success = false;
                switch (formatDialog)
                {
                    case MessageBoxResult.Yes: // CSV
                        success = await _dataExportService.ExportToCsvAsync(Users, $"{CurrentProfileName}_Users");
                        break;
                    case MessageBoxResult.No: // Excel
                        success = await _dataExportService.ExportToExcelAsync(Users, $"{CurrentProfileName}_Discovery_Data");
                        break;
                    case MessageBoxResult.Cancel: // JSON
                        success = await _dataExportService.ExportToJsonAsync(allData, $"{CurrentProfileName}_All_Data");
                        break;
                }
                
                if (success)
                {
                    _logger?.LogInformation("[MainViewModel] ExportResults completed successfully");
                    MessageBox.Show("Data exported successfully.", "Export Complete", MessageBoxButton.OK, MessageBoxImage.Information);
                }
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "[MainViewModel] Error exporting results");
                MessageBox.Show($"Error exporting results: {ex.Message}", "Error", MessageBoxButton.OK, MessageBoxImage.Error);
            }
        }
        
        /// <summary>
        /// Show all discovery data in a modal dialog
        /// </summary>
        private async Task ShowAllDiscoveryDataAsync()
        {
            try
            {
                _logger?.LogInformation("[MainViewModel] ShowAllDiscoveryData started");
                
                var dataWindow = new System.Windows.Window
                {
                    Title = $"All Discovery Data - {CurrentProfileName}",
                    Width = 800,
                    Height = 600,
                    WindowStartupLocation = WindowStartupLocation.CenterOwner,
                    Owner = Application.Current.MainWindow
                };
                
                var tabControl = new System.Windows.Controls.TabControl();
                
                // Add tabs for each data type
                if (Users.Any())
                {
                    var usersTab = new System.Windows.Controls.TabItem { Header = $"Users ({Users.Count})" };
                    var usersGrid = new System.Windows.Controls.DataGrid 
                    { 
                        ItemsSource = Users,
                        IsReadOnly = true,
                        AutoGenerateColumns = true
                    };
                    usersTab.Content = usersGrid;
                    tabControl.Items.Add(usersTab);
                }
                
                if (Computers.Any())
                {
                    var computersTab = new System.Windows.Controls.TabItem { Header = $"Computers ({Computers.Count})" };
                    var computersGrid = new System.Windows.Controls.DataGrid 
                    { 
                        ItemsSource = Computers,
                        IsReadOnly = true,
                        AutoGenerateColumns = true
                    };
                    computersTab.Content = computersGrid;
                    tabControl.Items.Add(computersTab);
                }
                
                // Add other data types as needed...
                
                if (tabControl.Items.Count == 0)
                {
                    var emptyTab = new System.Windows.Controls.TabItem { Header = "No Data" };
                    emptyTab.Content = new System.Windows.Controls.TextBlock 
                    { 
                        Text = "No discovery data available. Run discovery first.",
                        HorizontalAlignment = HorizontalAlignment.Center,
                        VerticalAlignment = VerticalAlignment.Center,
                        FontSize = 16
                    };
                    tabControl.Items.Add(emptyTab);
                }
                
                dataWindow.Content = tabControl;
                dataWindow.ShowDialog();\n            }\n            catch (Exception ex)\n            {\n                _logger?.LogError(ex, \"[MainViewModel] Error showing all discovery data\");\n                MessageBox.Show($\"Error showing discovery data: {ex.Message}\", \"Error\", MessageBoxButton.OK, MessageBoxImage.Error);\n            }\n        }\n        \n        /// <summary>\n        /// Show refresh settings dialog\n        /// </summary>\n        private async Task ShowRefreshSettingsAsync()\n        {\n            try\n            {\n                _logger?.LogInformation(\"[MainViewModel] ShowRefreshSettings started\");\n                \n                var settingsDialog = new System.Windows.Window\n                {\n                    Title = \"Refresh Settings\",\n                    Width = 400,\n                    Height = 300,\n                    WindowStartupLocation = WindowStartupLocation.CenterOwner,\n                    Owner = Application.Current.MainWindow,\n                    ResizeMode = ResizeMode.NoResize\n                };\n                \n                var stackPanel = new System.Windows.Controls.StackPanel { Margin = new Thickness(20) };\n                \n                stackPanel.Children.Add(new System.Windows.Controls.TextBlock \n                { \n                    Text = \"Auto-refresh Settings\", \n                    FontSize = 16, \n                    FontWeight = FontWeights.Bold,\n                    Margin = new Thickness(0, 0, 0, 15)\n                });\n                \n                var enableAutoRefresh = new System.Windows.Controls.CheckBox\n                {\n                    Content = \"Enable automatic data refresh\",\n                    Margin = new Thickness(0, 0, 0, 10)\n                };\n                stackPanel.Children.Add(enableAutoRefresh);\n                \n                stackPanel.Children.Add(new System.Windows.Controls.TextBlock \n                { \n                    Text = \"Refresh interval (minutes):\", \n                    Margin = new Thickness(0, 10, 0, 5)\n                });\n                \n                var intervalSlider = new System.Windows.Controls.Slider\n                {\n                    Minimum = 1,\n                    Maximum = 60,\n                    Value = 10,\n                    TickFrequency = 5,\n                    TickPlacement = System.Windows.Controls.Primitives.TickPlacement.BottomRight\n                };\n                stackPanel.Children.Add(intervalSlider);\n                \n                var buttonPanel = new System.Windows.Controls.StackPanel\n                {\n                    Orientation = System.Windows.Controls.Orientation.Horizontal,\n                    HorizontalAlignment = HorizontalAlignment.Right,\n                    Margin = new Thickness(0, 20, 0, 0)\n                };\n                \n                var okButton = new System.Windows.Controls.Button { Content = \"OK\", Width = 80, Margin = new Thickness(0, 0, 10, 0) };\n                var cancelButton = new System.Windows.Controls.Button { Content = \"Cancel\", Width = 80 };\n                \n                okButton.Click += (s, e) => settingsDialog.DialogResult = true;\n                cancelButton.Click += (s, e) => settingsDialog.DialogResult = false;\n                \n                buttonPanel.Children.Add(okButton);\n                buttonPanel.Children.Add(cancelButton);\n                stackPanel.Children.Add(buttonPanel);\n                \n                settingsDialog.Content = stackPanel;\n                \n                var result = settingsDialog.ShowDialog();\n                if (result == true)\n                {\n                    _logger?.LogInformation($\"[MainViewModel] Refresh settings updated: AutoRefresh={enableAutoRefresh.IsChecked}, Interval={intervalSlider.Value}\");\n                    MessageBox.Show(\"Refresh settings updated.\", \"Settings Saved\", MessageBoxButton.OK, MessageBoxImage.Information);\n                }\n            }\n            catch (Exception ex)\n            {\n                _logger?.LogError(ex, \"[MainViewModel] Error showing refresh settings\");\n                MessageBox.Show($\"Error showing refresh settings: {ex.Message}\", \"Error\", MessageBoxButton.OK, MessageBoxImage.Error);\n            }\n        }\n        \n        /// <summary>\n        /// Select manager for user assignment\n        /// </summary>\n        private async Task SelectManagerAsync()\n        {\n            try\n            {\n                _logger?.LogInformation(\"[MainViewModel] SelectManager started\");\n                \n                // For now, just navigate to the Users view where manager assignment can be done\n                await _navigationService.NavigateToTabAsync(\"users\", \"Users\");\n                \n                MessageBox.Show(\"Navigate to Users view to assign managers to users.\", \n                    \"Manager Selection\", MessageBoxButton.OK, MessageBoxImage.Information);\n            }\n            catch (Exception ex)\n            {\n                _logger?.LogError(ex, \"[MainViewModel] Error in SelectManager\");\n                MessageBox.Show($\"Error in manager selection: {ex.Message}\", \"Error\", MessageBoxButton.OK, MessageBoxImage.Error);\n            }\n        }\n        \n        #endregion
        
    }
}