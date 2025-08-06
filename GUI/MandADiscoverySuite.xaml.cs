using System;
using System.Threading.Tasks;
using System.Windows;
using System.Windows.Input;
using MandADiscoverySuite.ViewModels;
using MandADiscoverySuite.Themes;
using MandADiscoverySuite.Services;

namespace MandADiscoverySuite
{
    /// <summary>
    /// MainWindow following MVVM pattern with minimal code-behind
    /// </summary>
    public partial class MainWindow : Window
    {
        public MainViewModel ViewModel { get; private set; }

        public MainWindow()
        {
            // Track MainWindow construction time
            var startupService = ServiceLocator.GetService<StartupOptimizationService>();
            startupService?.StartPhase("MainWindowInitialization");
            
            InitializeComponent();
            
            startupService?.StartPhase("ViewModelCreation");
            // Initialize ViewModel using dependency injection and set as DataContext
            try
            {
                ViewModel = ServiceLocator.GetService<MainViewModel>();
            }
            catch (Exception)
            {
                // Fallback to direct instantiation if DI fails
                ViewModel = new MainViewModel();
            }
            startupService?.EndPhase("ViewModelCreation");
            
            startupService?.StartPhase("DataContextBinding");
            DataContext = ViewModel;
            startupService?.EndPhase("DataContextBinding");
            
            startupService?.StartPhase("ThemeApplication");
            // Apply initial theme
            ApplyTheme();
            startupService?.EndPhase("ThemeApplication");
            
            // Set up lazy loading for views after components are initialized
            this.Loaded += MainWindow_Loaded;
            
            startupService?.EndPhase("MainWindowInitialization");
        }

        private void ApplyTheme()
        {
            try
            {
                var themeManager = ThemeManager.Instance;
                themeManager.ApplyTheme(ViewModel.IsDarkTheme ? ThemeType.Dark : ThemeType.Light);
            }
            catch (Exception ex)
            {
                // Log theme application error but don't fail startup
                System.Diagnostics.Debug.WriteLine($"Theme application failed: {ex.Message}");
            }
        }

        private void MainWindow_Loaded(object sender, RoutedEventArgs e)
        {
            var startupService = ServiceLocator.GetService<StartupOptimizationService>();
            startupService?.StartPhase("LazyViewSetup");
            
            try
            {
                // Set up lazy loading for each view
                var dashboardView = FindName("DashboardView") as FrameworkElement;
                var usersView = FindName("UsersView") as FrameworkElement;
                var discoveryView = FindName("DiscoveryView") as FrameworkElement;
                var computersView = FindName("ComputersView") as FrameworkElement;
                var infrastructureView = FindName("InfrastructureView") as FrameworkElement;
                var groupsView = FindName("GroupsView") as FrameworkElement;
                var wavesView = FindName("WavesView") as FrameworkElement;
                var migrateView = FindName("MigrateView") as FrameworkElement;
                var reportsView = FindName("ReportsView") as FrameworkElement;
                var analyticsView = FindName("AnalyticsView") as FrameworkElement;
                var settingsView = FindName("SettingsView") as FrameworkElement;
                var applicationsView = FindName("ApplicationsView") as FrameworkElement;
                var domainDiscoveryView = FindName("DomainDiscoveryView") as FrameworkElement;
                var fileServersView = FindName("FileServersView") as FrameworkElement;
                var databasesView = FindName("DatabasesView") as FrameworkElement;
                var securityView = FindName("SecurityView") as FrameworkElement;

                // Register views with lazy loading service
                if (dashboardView != null)
                {
                    ViewModel.SetupLazyView("Dashboard", dashboardView, async () =>
                    {
                        // Initialize dashboard data when first viewed
                        if (ViewModel.RefreshDashboardCommand != null && ViewModel.RefreshDashboardCommand.CanExecute(null))
                        {
                            ViewModel.RefreshDashboardCommand.Execute(null);
                        }
                    });
                }

                if (usersView != null)
                {
                    ViewModel.SetupLazyView("Users", usersView, async () =>
                    {
                        // Initialize users data when first viewed
                        if (ViewModel.RefreshUsersCommand != null && ViewModel.RefreshUsersCommand.CanExecute(null))
                        {
                            ViewModel.RefreshUsersCommand.Execute(null);
                        }
                    });
                }

                if (discoveryView != null)
                {
                    ViewModel.SetupLazyView("Discovery", discoveryView);
                }

                if (computersView != null)
                {
                    ViewModel.SetupLazyView("Computers", computersView);
                }

                if (infrastructureView != null)
                {
                    ViewModel.SetupLazyView("Infrastructure", infrastructureView, async () =>
                    {
                        // Initialize infrastructure data when first viewed
                        if (ViewModel.RefreshInfrastructureCommand != null && ViewModel.RefreshInfrastructureCommand.CanExecute(null))
                        {
                            ViewModel.RefreshInfrastructureCommand.Execute(null);
                        }
                    });
                }

                if (groupsView != null)
                {
                    ViewModel.SetupLazyView("Groups", groupsView, async () =>
                    {
                        // Initialize groups data when first viewed
                        if (ViewModel.RefreshGroupsCommand != null && ViewModel.RefreshGroupsCommand.CanExecute(null))
                        {
                            ViewModel.RefreshGroupsCommand.Execute(null);
                        }
                    });
                }

                if (wavesView != null)
                {
                    ViewModel.SetupLazyView("Waves", wavesView);
                }

                if (migrateView != null)
                {
                    ViewModel.SetupLazyView("Migrate", migrateView);
                }

                if (reportsView != null)
                {
                    ViewModel.SetupLazyView("Reports", reportsView);
                }

                if (analyticsView != null)
                {
                    ViewModel.SetupLazyView("Analytics", analyticsView);
                }

                if (settingsView != null)
                {
                    ViewModel.SetupLazyView("Settings", settingsView);
                }

                if (applicationsView != null)
                {
                    ViewModel.SetupLazyView("Applications", applicationsView);
                }

                if (domainDiscoveryView != null)
                {
                    ViewModel.SetupLazyView("DomainDiscovery", domainDiscoveryView);
                }

                if (fileServersView != null)
                {
                    ViewModel.SetupLazyView("FileServers", fileServersView);
                }

                if (databasesView != null)
                {
                    ViewModel.SetupLazyView("Databases", databasesView);
                }

                if (securityView != null)
                {
                    ViewModel.SetupLazyView("Security", securityView);
                }

                // Pre-initialize critical views during idle time
                _ = Task.Run(async () =>
                {
                    await Task.Delay(2000); // Wait 2 seconds after startup
                    await ViewModel.PreInitializeCriticalViewsAsync();
                });
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Error setting up lazy loading: {ex.Message}");
            }
            finally
            {
                startupService?.EndPhase("LazyViewSetup");
            }
        }

        private void MainWindow_KeyDown(object sender, KeyEventArgs e)
        {
            // Handle global keyboard shortcuts
            var ctrl = Keyboard.Modifiers.HasFlag(ModifierKeys.Control);
            var shift = Keyboard.Modifiers.HasFlag(ModifierKeys.Shift);
            var alt = Keyboard.Modifiers.HasFlag(ModifierKeys.Alt);

            switch (e.Key)
            {
                // Discovery Operations
                case Key.F5:
                    if (ViewModel.StartDiscoveryCommand.CanExecute(null))
                        ViewModel.StartDiscoveryCommand.Execute(null);
                    e.Handled = true;
                    break;
                    
                case Key.Escape:
                    if (ViewModel.StopDiscoveryCommand.CanExecute(null))
                        ViewModel.StopDiscoveryCommand.Execute(null);
                    e.Handled = true;
                    break;

                // Navigation Shortcuts
                case Key.D1:
                    if (ctrl)
                    {
                        ViewModel.NavigateCommand.Execute("Dashboard");
                        e.Handled = true;
                    }
                    break;
                    
                case Key.D2:
                    if (ctrl)
                    {
                        ViewModel.NavigateCommand.Execute("Discovery");
                        e.Handled = true;
                    }
                    break;
                    
                case Key.D3:
                    if (ctrl)
                    {
                        ViewModel.NavigateCommand.Execute("Users");
                        e.Handled = true;
                    }
                    break;
                    
                case Key.D4:
                    if (ctrl)
                    {
                        ViewModel.NavigateCommand.Execute("Infrastructure");
                        e.Handled = true;
                    }
                    break;
                    
                case Key.D5:
                    if (ctrl)
                    {
                        ViewModel.NavigateCommand.Execute("Groups");
                        e.Handled = true;
                    }
                    break;
                    
                case Key.D6:
                    if (ctrl)
                    {
                        ViewModel.NavigateCommand.Execute("Analytics");
                        e.Handled = true;
                    }
                    break;

                // Data Operations
                case Key.R:
                    if (ctrl && !shift)
                    {
                        // Refresh current view
                        ViewModel.RefreshCurrentViewCommand?.Execute(null);
                        e.Handled = true;
                    }
                    else if (ctrl && shift)
                    {
                        // Show refresh settings
                        ViewModel.ShowRefreshSettingsCommand?.Execute(null);
                        e.Handled = true;
                    }
                    break;

                case Key.E:
                    if (ctrl)
                    {
                        // Export current view data
                        switch (ViewModel.CurrentView)
                        {
                            case "Users":
                                ViewModel.ExportUsersCommand?.Execute(null);
                                break;
                            case "Infrastructure":
                                ViewModel.ExportInfrastructureCommand?.Execute(null);
                                break;
                            case "Groups":
                                ViewModel.ExportGroupsCommand?.Execute(null);
                                break;
                            default:
                                ViewModel.ExportResultsCommand?.Execute(null);
                                break;
                        }
                        e.Handled = true;
                    }
                    break;

                case Key.A:
                    if (ctrl)
                    {
                        // Select All in current view
                        switch (ViewModel.CurrentView)
                        {
                            case "Users":
                                ViewModel.SelectAllUsersCommand?.Execute(null);
                                break;
                            case "Infrastructure":
                                ViewModel.SelectAllInfrastructureCommand?.Execute(null);
                                break;
                            case "Groups":
                                ViewModel.SelectAllGroupsCommand?.Execute(null);
                                break;
                        }
                        e.Handled = true;
                    }
                    break;

                case Key.C:
                    if (ctrl)
                    {
                        // Copy selected items
                        switch (ViewModel.CurrentView)
                        {
                            case "Users":
                                ViewModel.CopySelectedUsersCommand?.Execute(null);
                                break;
                            case "Infrastructure":
                                ViewModel.CopySelectedInfrastructureCommand?.Execute(null);
                                break;
                            case "Groups":
                                ViewModel.CopySelectedGroupsCommand?.Execute(null);
                                break;
                        }
                        e.Handled = true;
                    }
                    break;

                // Search Operations
                case Key.F:
                    if (ctrl)
                    {
                        // Focus search box in current view
                        FocusSearchBox();
                        e.Handled = true;
                    }
                    else if (ctrl && shift)
                    {
                        // Advanced search
                        switch (ViewModel.CurrentView)
                        {
                            case "Users":
                                ViewModel.ShowUsersAdvancedSearchCommand?.Execute(null);
                                break;
                            case "Infrastructure":
                                ViewModel.ShowInfrastructureAdvancedSearchCommand?.Execute(null);
                                break;
                            case "Groups":
                                ViewModel.ShowGroupsAdvancedSearchCommand?.Execute(null);
                                break;
                        }
                        e.Handled = true;
                    }
                    break;

                // Theme Toggle
                case Key.T:
                    if (ctrl)
                    {
                        ViewModel.ToggleThemeCommand.Execute(null);
                        ApplyTheme();
                        e.Handled = true;
                    }
                    break;

                // Column Visibility
                case Key.H:
                    if (ctrl)
                    {
                        ViewModel.ShowColumnVisibilityCommand?.Execute(ViewModel.CurrentView);
                        e.Handled = true;
                    }
                    break;

                // Pagination
                case Key.PageUp:
                    if (ctrl)
                    {
                        // Previous page
                        switch (ViewModel.CurrentView)
                        {
                            case "Users":
                                ViewModel.PreviousPageCommand?.Execute(null);
                                break;
                            case "Infrastructure":
                                ViewModel.PreviousInfrastructurePageCommand?.Execute(null);
                                break;
                            case "Groups":
                                ViewModel.PreviousGroupPageCommand?.Execute(null);
                                break;
                        }
                        e.Handled = true;
                    }
                    break;

                case Key.PageDown:
                    if (ctrl)
                    {
                        // Next page
                        switch (ViewModel.CurrentView)
                        {
                            case "Users":
                                ViewModel.NextPageCommand?.Execute(null);
                                break;
                            case "Infrastructure":
                                ViewModel.NextInfrastructurePageCommand?.Execute(null);
                                break;
                            case "Groups":
                                ViewModel.NextGroupPageCommand?.Execute(null);
                                break;
                        }
                        e.Handled = true;
                    }
                    break;

                case Key.Home:
                    if (ctrl)
                    {
                        // First page
                        switch (ViewModel.CurrentView)
                        {
                            case "Users":
                                ViewModel.FirstPageCommand?.Execute(null);
                                break;
                            case "Infrastructure":
                                ViewModel.FirstInfrastructurePageCommand?.Execute(null);
                                break;
                            case "Groups":
                                ViewModel.FirstGroupPageCommand?.Execute(null);
                                break;
                        }
                        e.Handled = true;
                    }
                    break;

                case Key.End:
                    if (ctrl)
                    {
                        // Last page
                        switch (ViewModel.CurrentView)
                        {
                            case "Users":
                                ViewModel.LastPageCommand?.Execute(null);
                                break;
                            case "Infrastructure":
                                ViewModel.LastInfrastructurePageCommand?.Execute(null);
                                break;
                            case "Groups":
                                ViewModel.LastGroupPageCommand?.Execute(null);
                                break;
                        }
                        e.Handled = true;
                    }
                    break;

                // Help
                case Key.F1:
                    ShowKeyboardShortcutsHelp();
                    e.Handled = true;
                    break;

                // Quick Actions
                case Key.N:
                    if (ctrl)
                    {
                        ViewModel.CreateProfileCommand?.Execute(null);
                        e.Handled = true;
                    }
                    break;

                case Key.Delete:
                    if (shift)
                    {
                        // Delete selected items
                        switch (ViewModel.CurrentView)
                        {
                            case "Users":
                                ViewModel.DeleteSelectedUsersCommand?.Execute(null);
                                break;
                            case "Groups":
                                ViewModel.DeleteSelectedGroupsCommand?.Execute(null);
                                break;
                        }
                        e.Handled = true;
                    }
                    break;
            }
        }

        private void FocusSearchBox()
        {
            try
            {
                // Focus the appropriate search box based on current view
                switch (ViewModel.CurrentView)
                {
                    case "Users":
                        var userSearchBox = FindName("UserSearchBox") as System.Windows.Controls.TextBox;
                        userSearchBox?.Focus();
                        break;
                    case "Infrastructure":
                        var infraSearchBox = FindName("ComputerSearchBox") as System.Windows.Controls.TextBox;
                        infraSearchBox?.Focus();
                        break;
                    case "Groups":
                        var groupSearchBox = FindName("GroupSearchBox") as System.Windows.Controls.TextBox;
                        groupSearchBox?.Focus();
                        break;
                }
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Error focusing search box: {ex.Message}");
            }
        }

        private void ShowKeyboardShortcutsHelp()
        {
            var helpText = @"Keyboard Shortcuts Help

DISCOVERY OPERATIONS:
F5                     Start Discovery
Escape                 Stop Discovery

NAVIGATION:
Ctrl+1                 Dashboard
Ctrl+2                 Discovery
Ctrl+3                 Users  
Ctrl+4                 Infrastructure
Ctrl+5                 Groups
Ctrl+6                 Analytics

DATA OPERATIONS:
Ctrl+R                 Refresh Current View
Ctrl+Shift+R          Refresh Settings
Ctrl+E                 Export Current View
Ctrl+A                 Select All Items
Ctrl+C                 Copy Selected Items
Ctrl+N                 Create New Profile

SEARCH:
Ctrl+F                 Focus Search Box
Ctrl+Shift+F          Advanced Search
Ctrl+H                 Column Visibility

PAGINATION:
Ctrl+PageUp           Previous Page
Ctrl+PageDown         Next Page  
Ctrl+Home             First Page
Ctrl+End              Last Page

OTHER:
Ctrl+T                 Toggle Theme
Shift+Delete          Delete Selected
F1                     Show This Help

Tips:
- Use arrow keys to navigate between pages
- Press Escape to cancel operations
- Most shortcuts work contextually based on current view";

            MessageBox.Show(helpText, "Keyboard Shortcuts", MessageBoxButton.OK, MessageBoxImage.Information);
        }

        private void Window_Closing(object sender, System.ComponentModel.CancelEventArgs e)
        {
            // Cleanup ViewModel resources
            ViewModel?.Dispose();
        }

        protected override void OnSourceInitialized(EventArgs e)
        {
            base.OnSourceInitialized(e);
            
            // Handle theme changes
            ViewModel.PropertyChanged += (s, args) =>
            {
                if (args.PropertyName == nameof(MainViewModel.IsDarkTheme))
                {
                    Dispatcher.BeginInvoke(new Action(ApplyTheme));
                }
            };
        }

        // Temporary stub methods for remaining XAML event handlers
        // These should be converted to Command bindings in future iterations
        private void RunAppRegistration_Click(object sender, RoutedEventArgs e) { }
        private void NavigationButton_Click(object sender, RoutedEventArgs e) { }
        private void RefreshDataButton_Click(object sender, RoutedEventArgs e) { }
        private void ImportData_Click(object sender, RoutedEventArgs e) { }
        private void ShowAllDiscoveryData_Click(object sender, RoutedEventArgs e) { }
        private void SelectManager_Click(object sender, RoutedEventArgs e) { }
        private void SelectUsers_Click(object sender, RoutedEventArgs e) { }
        private void MapSecurityGroups_Click(object sender, RoutedEventArgs e) { }
        private void StartUserMigration_Click(object sender, RoutedEventArgs e) { }
        private void RunModule_Click(object sender, RoutedEventArgs e) { }
        private void ViewUser_Click(object sender, RoutedEventArgs e) { }
        private void SecurityTab_Click(object sender, RoutedEventArgs e) { }
        private void SecurityAudit_Click(object sender, RoutedEventArgs e) { }
        private void ComplianceCheck_Click(object sender, RoutedEventArgs e) { }
        private void VulnerabilityAssessment_Click(object sender, RoutedEventArgs e) { }
        private void PasswordPolicy_Click(object sender, RoutedEventArgs e) { }
        private void PasswordGenerator_Click(object sender, RoutedEventArgs e) { }
        private void FirewallAnalysis_Click(object sender, RoutedEventArgs e) { }
        private void DiscoveryModule_Click(object sender, RoutedEventArgs e) { }
        // Search functionality is now handled through data binding in the MainViewModel
        private void RefreshTopology_Click(object sender, RoutedEventArgs e) { }
        private void AutoLayoutTopology_Click(object sender, RoutedEventArgs e) { }
        private void WavesDataGrid_Drop(object sender, DragEventArgs e) { }
        private void CancelOperation_Click(object sender, RoutedEventArgs e) { }
        private void RunDomainScan_Click(object sender, RoutedEventArgs e) { }
        private void DnsLookup_Click(object sender, RoutedEventArgs e) { }
        private void SubdomainEnum_Click(object sender, RoutedEventArgs e) { }
        private void ScanFileServers_Click(object sender, RoutedEventArgs e) { }
        private void AnalyzeShares_Click(object sender, RoutedEventArgs e) { }
        private void StorageReport_Click(object sender, RoutedEventArgs e) { }
        private void ScanDatabases_Click(object sender, RoutedEventArgs e) { }
        private void AnalyzeSQL_Click(object sender, RoutedEventArgs e) { }
        private void DatabaseReport_Click(object sender, RoutedEventArgs e) { }
        private void CheckDatabaseVersions_Click(object sender, RoutedEventArgs e) { }
        private void ScanGPO_Click(object sender, RoutedEventArgs e) { }
        
        // Additional stub methods for drag-drop and other event handlers
        private void WavesDataGrid_DragOver(object sender, DragEventArgs e) { }
        private void WavesDataGrid_MouseMove(object sender, System.Windows.Input.MouseEventArgs e) { }
        private void WavesDataGrid_PreviewMouseLeftButtonDown(object sender, System.Windows.Input.MouseButtonEventArgs e) { }
        private void WaveDropZone_Drop(object sender, DragEventArgs e) { }
        private void WaveDropZone_DragOver(object sender, DragEventArgs e) { }
        private void WaveDropZone_DragLeave(object sender, DragEventArgs e) { }
        private void GenerateDiscoverySummary_Click(object sender, RoutedEventArgs e) { }
        private void GenerateUserAnalytics_Click(object sender, RoutedEventArgs e) { }
        private void GenerateInfrastructureReport_Click(object sender, RoutedEventArgs e) { }
        private void GenerateMigrationReadiness_Click(object sender, RoutedEventArgs e) { }
        private void GenerateSecurityAudit_Click(object sender, RoutedEventArgs e) { }
        private void GenerateDependencyMap_Click(object sender, RoutedEventArgs e) { }
        private void GenerateConfigurationReport_Click(object sender, RoutedEventArgs e) { }
        private void GenerateNetworkTopology_Click(object sender, RoutedEventArgs e) { }
        private void GenerateCustomReport_Click(object sender, RoutedEventArgs e) { }
        private void ChangeDataPath_Click(object sender, RoutedEventArgs e) { }
        
        // Help button click handler
        private void HelpButton_Click(object sender, RoutedEventArgs e)
        {
            ShowKeyboardShortcutsHelp();
        }
        private void AppRegistration_Click(object sender, RoutedEventArgs e) { }
        private void ConfigureCredentials_Click(object sender, RoutedEventArgs e) { }
        private void TestConnection_Click(object sender, RoutedEventArgs e) { }
        private void NetworkRangesTextBox_TextChanged(object sender, System.Windows.Controls.TextChangedEventArgs e) { }
        private void TimeoutTextBox_TextChanged(object sender, System.Windows.Controls.TextChangedEventArgs e) { }
        private void TimeoutUp_Click(object sender, RoutedEventArgs e) { }
        private void TimeoutDown_Click(object sender, RoutedEventArgs e) { }
        private void ThreadsTextBox_TextChanged(object sender, System.Windows.Controls.TextChangedEventArgs e) { }
        private void ThreadsUp_Click(object sender, RoutedEventArgs e) { }
        private void ThreadsDown_Click(object sender, RoutedEventArgs e) { }
        private void SaveModuleSettings_Click(object sender, RoutedEventArgs e) { }
        private void RunAppDiscovery_Click(object sender, RoutedEventArgs e) { }
        private void ImportAppList_Click(object sender, RoutedEventArgs e) { }
        private void RefreshApps_Click(object sender, RoutedEventArgs e) { }
        private void AppSearchBox_TextChanged(object sender, System.Windows.Controls.TextChangedEventArgs e) { }
        private void AppFilterCombo_SelectionChanged(object sender, System.Windows.Controls.SelectionChangedEventArgs e) { }
        private void AnalyzeDependencies_Click(object sender, RoutedEventArgs e) { }
    }
}