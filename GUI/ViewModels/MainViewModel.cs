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
        private readonly ILogger<MainViewModel>? _logger;
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
            
            // Initialize collections
            _companyProfiles = new ObservableCollection<CompanyProfile>();
            
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
            RefreshDataCommand = new ParameterizedAsyncCommand<object>(async _ => await ReloadDataAsync());
            ExportResultsCommand = new ParameterizedAsyncCommand<object>(async _ => await StubCommandAsync("ExportResults"));
            ShowRefreshSettingsCommand = new ParameterizedAsyncCommand<object>(async _ => await StubCommandAsync("ShowRefreshSettings"));
            
            // Company profile commands
            CreateProfileCommand = new AsyncRelayCommand(CreateProfileAsync);
            SelectProfileCommand = new AsyncRelayCommand(SelectProfileAsync);
            DeleteProfileCommand = new ParameterizedAsyncCommand<object>(DeleteProfileAsync);
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
            
            // Open Dashboard tab by default on startup
            Task.Run(async () =>
            {
                try
                {
                    await Task.Delay(500); // Small delay to ensure UI is ready
                    await OpenTabAsync("dashboard");
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
                _logger?.LogInformation($"Loading company profiles from C:\\DiscoveryData, CurrentProfileName='{_currentProfileName}'");
                
                var discoveryDataPath = @"C:\DiscoveryData";
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
                    
                    // TODO: Implement actual CSV loading logic using proper service
                    _logger?.LogInformation($"[MainViewModel] Data loading from: {dataPath}");
                    
                    // Count CSV files for progress indication
                    var csvFiles = Directory.GetFiles(dataPath, "*.csv");
                    _logger?.LogInformation($"[MainViewModel] Found {csvFiles.Length} CSV files for processing");
                    
                    // Trigger UI update
                    OnPropertyChanged(nameof(Users));
                    OnPropertyChanged(nameof(Computers));
                    OnPropertyChanged(nameof(Applications));
                    OnPropertyChanged(nameof(Groups));
                    OnPropertyChanged(nameof(Databases));
                    OnPropertyChanged(nameof(Mailboxes));
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
                    var startInfo = new System.Diagnostics.ProcessStartInfo
                    {
                        FileName = "powershell.exe",
                        Arguments = $"-NoProfile -ExecutionPolicy Bypass -File \"{scriptPath}\"",
                        UseShellExecute = true,
                        WorkingDirectory = Path.GetDirectoryName(scriptPath)
                    };
                    
                    var process = System.Diagnostics.Process.Start(startInfo);
                    _logger?.LogInformation($"[MainViewModel] Started App Registration script: {scriptPath}");
                    
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
                
                var themeService = SimpleServiceLocator.GetService<ThemeService>();
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
                    var profilePath = System.IO.Path.Combine(@"C:\DiscoveryData", companyName.Trim());
                    
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
                var result = MessageBox.Show($"Are you sure you want to delete the profile '{profileToDelete.CompanyName}'?\n\nThis will permanently delete all data in:\nC:\\DiscoveryData\\{profileToDelete.CompanyName}", 
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