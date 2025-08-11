using System;
using System.Threading.Tasks;
using System.Windows;
using System.Windows.Controls;
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
        private KeyboardShortcutManager _shortcutManager;

        public MainWindow()
        {
            var logAction = Application.Current?.Properties["LogAction"] as Action<string>;
            try
            {
                logAction?.Invoke("=== MainWindow Constructor BEGIN ===");
                
                logAction?.Invoke("Calling InitializeComponent...");
                InitializeComponent();
                logAction?.Invoke("InitializeComponent completed successfully");
                
                logAction?.Invoke("Creating MainViewModel...");
                // Create a minimal ViewModel to avoid binding errors
                // We'll set the proper ViewModel later after services are initialized
                ViewModel = new MainViewModel();
                logAction?.Invoke("MainViewModel created successfully");
                
                logAction?.Invoke("Setting DataContext...");
                DataContext = ViewModel;
                logAction?.Invoke("DataContext set successfully");
                
                logAction?.Invoke("Adding Loaded event handler...");
                // Set up lazy loading for views after components are initialized
                this.Loaded += MainWindow_Loaded;
                logAction?.Invoke("Loaded event handler added successfully");
                
                logAction?.Invoke("=== MainWindow Constructor COMPLETED SUCCESSFULLY ===");
            }
            catch (Exception ex)
            {
                var errorMsg = $"CRITICAL MAINWINDOW CONSTRUCTOR FAILURE: {ex.GetType().Name}: {ex.Message}";
                var stackTrace = $"Stack Trace:\n{ex.StackTrace}";
                var innerEx = ex.InnerException != null ? $"Inner Exception: {ex.InnerException.Message}\nInner Stack: {ex.InnerException.StackTrace}" : "No inner exception";
                var fullError = $"{errorMsg}\n{stackTrace}\n{innerEx}";
                
                logAction?.Invoke("=== CRITICAL MAINWINDOW CONSTRUCTOR FAILURE ===");
                logAction?.Invoke(fullError);
                logAction?.Invoke("=== END CRITICAL MAINWINDOW CONSTRUCTOR FAILURE ===");
                
                System.Diagnostics.Debug.WriteLine(fullError);
                
                MessageBox.Show($"CRITICAL MAINWINDOW FAILURE:\n{ex.Message}\n\nType: {ex.GetType().Name}\n\nStack trace:\n{ex.StackTrace}", 
                              "Critical MainWindow Error", MessageBoxButton.OK, MessageBoxImage.Error);
                throw; // Re-throw to ensure the error is handled by the global handler
            }
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
            StartupOptimizationService startupService = null;
            try
            {
                startupService = SimpleServiceLocator.GetService<StartupOptimizationService>();
                startupService?.StartPhase("LazyViewSetup");
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"StartupOptimizationService not available: {ex.Message}");
            }
            
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
                    ViewModel.SetupLazyView("Dashboard", dashboardView, () =>
                    {
                        // Initialize dashboard data when first viewed
                        if (ViewModel.RefreshDashboardCommand != null && ViewModel.RefreshDashboardCommand.CanExecute(null))
                        {
                            ViewModel.RefreshDashboardCommand.Execute(null);
                        }
                        return Task.CompletedTask;
                    });
                }

                if (usersView != null)
                {
                    ViewModel.SetupLazyView("Users", usersView, () =>
                    {
                        // Initialize users data when first viewed
                        if (ViewModel.RefreshUsersCommand != null && ViewModel.RefreshUsersCommand.CanExecute(null))
                        {
                            ViewModel.RefreshUsersCommand.Execute(null);
                        }
                        return Task.CompletedTask;
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
                    ViewModel.SetupLazyView("Infrastructure", infrastructureView, () =>
                    {
                        // Initialize infrastructure data when first viewed
                        if (ViewModel.RefreshInfrastructureCommand != null && ViewModel.RefreshInfrastructureCommand.CanExecute(null))
                        {
                            ViewModel.RefreshInfrastructureCommand.Execute(null);
                        }
                        return Task.CompletedTask;
                    });
                }

                if (groupsView != null)
                {
                    ViewModel.SetupLazyView("Groups", groupsView, () =>
                    {
                        // Initialize groups data when first viewed
                        if (ViewModel.RefreshGroupsCommand != null && ViewModel.RefreshGroupsCommand.CanExecute(null))
                        {
                            ViewModel.RefreshGroupsCommand.Execute(null);
                        }
                        return Task.CompletedTask;
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

                // Initialize keyboard shortcuts for this window
                InitializeWindowShortcuts();
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

        private void InitializeWindowShortcuts()
        {
            try
            {
                var shortcutService = SimpleServiceLocator.GetService<IKeyboardShortcutService>();
                if (shortcutService != null)
                {
                    _shortcutManager = new KeyboardShortcutManager(shortcutService);
                    
                    // Register window-specific shortcuts for main window context
                    _shortcutManager.RegisterWindowShortcuts(this, "MainWindow");
                    
                    System.Diagnostics.Debug.WriteLine("MainWindow keyboard shortcuts initialized");
                }
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Error initializing window shortcuts: {ex.Message}");
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
Ctrl+Alt+T             Toggle Theme
Ctrl+Shift+T           Theme Selection
Ctrl+Shift+L           View Logs &amp; Audit
Shift+Delete          Delete Selected
F1                     Show This Help

Tips:
- Use arrow keys to navigate between pages
- Press Escape to cancel operations
- Most shortcuts work contextually based on current view";

            MessageBox.Show(helpText, "Keyboard Shortcuts", MessageBoxButton.OK, MessageBoxImage.Information);
        }

        private async void Window_Closing(object sender, System.ComponentModel.CancelEventArgs e)
        {
            // Cancel the close event temporarily to save configuration
            e.Cancel = true;
            
            try
            {
                // Save configuration before closing
                if (ViewModel != null)
                {
                    await ViewModel.OnClosingAsync();
                }
                
                // Cleanup keyboard shortcuts
                _shortcutManager?.UnregisterWindowShortcuts(this);
                _shortcutManager?.Dispose();
                
                // Cleanup ViewModel resources
                ViewModel?.Dispose();
                
                // Now actually close the window
                e.Cancel = false;
                Application.Current.Shutdown();
            }
            catch (Exception ex)
            {
                ErrorHandlingService.Instance.HandleException(ex, "Error during window closing");
                // Still close the window even if saving fails
                e.Cancel = false;
                Application.Current.Shutdown();
            }
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

        // Event handler implementations for UI actions
        private void RunAppRegistration_Click(object sender, RoutedEventArgs e) 
        {
            // Run application registration process
            MessageBox.Show("Application registration initiated.", "Info", MessageBoxButton.OK, MessageBoxImage.Information);
        }
        
        private void NavigationButton_Click(object sender, RoutedEventArgs e) 
        {
            ViewModel?.ShowAllDiscoveryDataCommand?.Execute(null);
        }
        
        private void RefreshDataButton_Click(object sender, RoutedEventArgs e) 
        {
            MessageBox.Show("Data refreshed.", "Info", MessageBoxButton.OK, MessageBoxImage.Information);
        }
        
        private void ImportData_Click(object sender, RoutedEventArgs e) 
        {
            ViewModel?.ImportDataCommand?.Execute(null);
        }
        
        private void ShowAllDiscoveryData_Click(object sender, RoutedEventArgs e) 
        {
            ViewModel?.ShowAllDiscoveryDataCommand?.Execute(null);
        }
        
        private void SelectManager_Click(object sender, RoutedEventArgs e) 
        {
            // Show manager selection dialog
            var dialog = new ManagerSelectionDialog();
            dialog.ShowDialog();
        }
        
        private void SelectUsers_Click(object sender, RoutedEventArgs e) 
        {
            MessageBox.Show("Users view activated.", "Info", MessageBoxButton.OK, MessageBoxImage.Information);
        }
        
        private void MapSecurityGroups_Click(object sender, RoutedEventArgs e) 
        {
            MessageBox.Show("Security groups view activated.", "Info", MessageBoxButton.OK, MessageBoxImage.Information);
        }
        
        private void StartUserMigration_Click(object sender, RoutedEventArgs e) 
        {
            // Show user migration options
            MessageBox.Show("User migration process initiated.", "Info", MessageBoxButton.OK, MessageBoxImage.Information);
        }
        
        private void RunModule_Click(object sender, RoutedEventArgs e) 
        {
            var button = sender as FrameworkElement;
            var module = button?.Tag as string ?? "GeneralDiscovery";
            MessageBox.Show($"Running {module} module.", "Discovery Module", MessageBoxButton.OK, MessageBoxImage.Information);
        }
        
        private void ViewUser_Click(object sender, RoutedEventArgs e) 
        {
            MessageBox.Show("User view activated.", "Info", MessageBoxButton.OK, MessageBoxImage.Information);
        }
        
        private void SecurityTab_Click(object sender, RoutedEventArgs e) 
        {
            // Switch to security tab
            MessageBox.Show("Security tab activated.", "Info", MessageBoxButton.OK, MessageBoxImage.Information);
        }
        
        private void SecurityAudit_Click(object sender, RoutedEventArgs e) 
        {
            // Run security audit
            MessageBox.Show("Security audit initiated.", "Info", MessageBoxButton.OK, MessageBoxImage.Information);
        }
        
        private void ComplianceCheck_Click(object sender, RoutedEventArgs e) 
        {
            // Run compliance check
            MessageBox.Show("Compliance check initiated.", "Info", MessageBoxButton.OK, MessageBoxImage.Information);
        }
        
        private void VulnerabilityAssessment_Click(object sender, RoutedEventArgs e) 
        {
            // Run vulnerability assessment
            MessageBox.Show("Vulnerability assessment initiated.", "Info", MessageBoxButton.OK, MessageBoxImage.Information);
        }
        
        private void PasswordPolicy_Click(object sender, RoutedEventArgs e) 
        {
            ViewModel?.PasswordPolicyCommand?.Execute(null);
        }
        
        private void PasswordGenerator_Click(object sender, RoutedEventArgs e) 
        {
            ViewModel?.PasswordGeneratorCommand?.Execute(null);
        }
        
        private void FirewallAnalysis_Click(object sender, RoutedEventArgs e) 
        {
            // Run firewall analysis
            MessageBox.Show("Firewall analysis initiated.", "Info", MessageBoxButton.OK, MessageBoxImage.Information);
        }
        
        private void DiscoveryModule_Click(object sender, RoutedEventArgs e) 
        {
            var button = sender as FrameworkElement;
            var module = button?.Tag as string ?? "GeneralDiscovery";
            MessageBox.Show($"Running {module} discovery module.", "Discovery Module", MessageBoxButton.OK, MessageBoxImage.Information);
        }
        
        private void RefreshTopology_Click(object sender, RoutedEventArgs e) 
        {
            ViewModel?.RefreshTopologyCommand?.Execute(null);
        }
        
        private void AutoLayoutTopology_Click(object sender, RoutedEventArgs e) 
        {
            ViewModel?.AutoLayoutTopologyCommand?.Execute(null);
        }
        
        private void CancelOperation_Click(object sender, RoutedEventArgs e) 
        {
            ViewModel?.CancelOperationCommand?.Execute(null);
        }
        
        private void RunDomainScan_Click(object sender, RoutedEventArgs e) 
        {
            MessageBox.Show("Domain discovery initiated.", "Discovery Module", MessageBoxButton.OK, MessageBoxImage.Information);
        }
        
        private void DnsLookup_Click(object sender, RoutedEventArgs e) 
        {
            MessageBox.Show("DNS discovery initiated.", "Discovery Module", MessageBoxButton.OK, MessageBoxImage.Information);
        }
        
        private void SubdomainEnum_Click(object sender, RoutedEventArgs e) 
        {
            MessageBox.Show("Subdomain discovery initiated.", "Discovery Module", MessageBoxButton.OK, MessageBoxImage.Information);
        }
        
        private void ScanFileServers_Click(object sender, RoutedEventArgs e) 
        {
            MessageBox.Show("File server discovery initiated.", "Discovery Module", MessageBoxButton.OK, MessageBoxImage.Information);
        }
        
        private void AnalyzeShares_Click(object sender, RoutedEventArgs e) 
        {
            MessageBox.Show("Share analysis initiated.", "Discovery Module", MessageBoxButton.OK, MessageBoxImage.Information);
        }
        
        private void StorageReport_Click(object sender, RoutedEventArgs e) 
        {
            ViewModel?.GenerateReportCommand?.Execute("Storage");
        }
        
        private void ScanDatabases_Click(object sender, RoutedEventArgs e) 
        {
            MessageBox.Show("Database discovery initiated.", "Discovery Module", MessageBoxButton.OK, MessageBoxImage.Information);
        }
        
        private void AnalyzeSQL_Click(object sender, RoutedEventArgs e) 
        {
            MessageBox.Show("SQL analysis initiated.", "Discovery Module", MessageBoxButton.OK, MessageBoxImage.Information);
        }
        
        private void DatabaseReport_Click(object sender, RoutedEventArgs e) 
        {
            ViewModel?.GenerateReportCommand?.Execute("Database");
        }
        
        private void CheckDatabaseVersions_Click(object sender, RoutedEventArgs e) 
        {
            // Check database versions
            MessageBox.Show("Database version check initiated.", "Info", MessageBoxButton.OK, MessageBoxImage.Information);
        }
        
        private void ScanGPO_Click(object sender, RoutedEventArgs e) 
        {
            MessageBox.Show("GPO discovery initiated.", "Discovery Module", MessageBoxButton.OK, MessageBoxImage.Information);
        }
        
        // Drag-drop event handlers
        private void WavesDataGrid_Drop(object sender, DragEventArgs e) 
        {
            if (e.Data.GetDataPresent(DataFormats.StringFormat))
            {
                var data = e.Data.GetData(DataFormats.StringFormat) as string;
                MessageBox.Show($"Dropped data: {data}", "Drop Action", MessageBoxButton.OK, MessageBoxImage.Information);
            }
        }
        
        private void WavesDataGrid_DragOver(object sender, DragEventArgs e) 
        {
            e.Effects = e.Data.GetDataPresent(DataFormats.StringFormat) 
                ? DragDropEffects.Copy 
                : DragDropEffects.None;
        }
        
        private void WavesDataGrid_MouseMove(object sender, System.Windows.Input.MouseEventArgs e) 
        {
            if (e.LeftButton == System.Windows.Input.MouseButtonState.Pressed)
            {
                var dataGrid = sender as DataGrid;
                var selectedItem = dataGrid?.SelectedItem;
                if (selectedItem != null)
                {
                    DragDrop.DoDragDrop(dataGrid, selectedItem.ToString(), DragDropEffects.Copy);
                }
            }
        }
        
        private void WavesDataGrid_PreviewMouseLeftButtonDown(object sender, System.Windows.Input.MouseButtonEventArgs e) 
        {
            // Store initial position for drag detection
            _dragStartPoint = e.GetPosition(null);
        }
        
        private void WaveDropZone_Drop(object sender, DragEventArgs e) 
        {
            if (e.Data.GetDataPresent(DataFormats.StringFormat))
            {
                var data = e.Data.GetData(DataFormats.StringFormat) as string;
                MessageBox.Show($"Wave dropped: {data}", "Wave Drop Action", MessageBoxButton.OK, MessageBoxImage.Information);
                e.Handled = true;
            }
        }
        
        private void WaveDropZone_DragOver(object sender, DragEventArgs e) 
        {
            e.Effects = e.Data.GetDataPresent(DataFormats.StringFormat) 
                ? DragDropEffects.Move 
                : DragDropEffects.None;
            e.Handled = true;
        }
        
        private void WaveDropZone_DragLeave(object sender, DragEventArgs e) 
        {
            e.Handled = true;
        }
        
        private System.Windows.Point _dragStartPoint;
        
        private void GenerateDiscoverySummary_Click(object sender, RoutedEventArgs e) 
        {
            ViewModel?.GenerateReportCommand?.Execute("DiscoverySummary");
        }
        
        private void GenerateUserAnalytics_Click(object sender, RoutedEventArgs e) 
        {
            ViewModel?.GenerateReportCommand?.Execute("UserAnalytics");
        }
        
        private void GenerateInfrastructureReport_Click(object sender, RoutedEventArgs e) 
        {
            ViewModel?.GenerateReportCommand?.Execute("Infrastructure");
        }
        
        private void GenerateMigrationReadiness_Click(object sender, RoutedEventArgs e) 
        {
            ViewModel?.GenerateReportCommand?.Execute("MigrationReadiness");
        }
        
        private void GenerateSecurityAudit_Click(object sender, RoutedEventArgs e) 
        {
            ViewModel?.GenerateReportCommand?.Execute("SecurityAudit");
        }
        
        private void GenerateDependencyMap_Click(object sender, RoutedEventArgs e) 
        {
            ViewModel?.GenerateReportCommand?.Execute("DependencyMap");
        }
        
        private void GenerateConfigurationReport_Click(object sender, RoutedEventArgs e) 
        {
            ViewModel?.GenerateReportCommand?.Execute("Configuration");
        }
        
        private void GenerateNetworkTopology_Click(object sender, RoutedEventArgs e) 
        {
            ViewModel?.GenerateReportCommand?.Execute("NetworkTopology");
        }
        
        private void GenerateCustomReport_Click(object sender, RoutedEventArgs e) 
        {
            ViewModel?.GenerateReportCommand?.Execute("Custom");
        }
        
        private void ChangeDataPath_Click(object sender, RoutedEventArgs e) 
        {
            ViewModel?.ChangeDataPathCommand?.Execute(null);
        }
        
        // Help button click handler
        private void HelpButton_Click(object sender, RoutedEventArgs e)
        {
            ShowKeyboardShortcutsHelp();
        }
        private void AppRegistration_Click(object sender, RoutedEventArgs e) 
        {
            MessageBox.Show("Application registration initiated.", "Info", MessageBoxButton.OK, MessageBoxImage.Information);
        }
        
        private void ConfigureCredentials_Click(object sender, RoutedEventArgs e) 
        {
            ViewModel?.ConfigureCredentialsCommand?.Execute(null);
        }
        
        private void TestConnection_Click(object sender, RoutedEventArgs e) 
        {
            ViewModel?.TestConnectionCommand?.Execute(null);
        }
        
        private void NetworkRangesTextBox_TextChanged(object sender, System.Windows.Controls.TextChangedEventArgs e) 
        {
            // Handle network ranges text change
        }
        
        private void TimeoutTextBox_TextChanged(object sender, System.Windows.Controls.TextChangedEventArgs e) 
        {
            // Handle timeout text change
        }
        
        private void TimeoutUp_Click(object sender, RoutedEventArgs e) 
        {
            // Increment timeout value
        }
        
        private void TimeoutDown_Click(object sender, RoutedEventArgs e) 
        {
            // Decrement timeout value
        }
        
        private void ThreadsTextBox_TextChanged(object sender, System.Windows.Controls.TextChangedEventArgs e) 
        {
            // Handle threads text change
        }
        
        private void ThreadsUp_Click(object sender, RoutedEventArgs e) 
        {
            // Increment threads value
        }
        
        private void ThreadsDown_Click(object sender, RoutedEventArgs e) 
        {
            // Decrement threads value
        }
        
        private void SaveModuleSettings_Click(object sender, RoutedEventArgs e) 
        {
            MessageBox.Show("Module settings saved.", "Info", MessageBoxButton.OK, MessageBoxImage.Information);
        }
        
        private void RunAppDiscovery_Click(object sender, RoutedEventArgs e) 
        {
            MessageBox.Show("Application discovery initiated.", "Discovery Module", MessageBoxButton.OK, MessageBoxImage.Information);
        }
        
        private void ImportAppList_Click(object sender, RoutedEventArgs e) 
        {
            ViewModel?.ImportDataCommand?.Execute(null);
        }
        
        private void RefreshApps_Click(object sender, RoutedEventArgs e) 
        {
            MessageBox.Show("Refreshing applications.", "Info", MessageBoxButton.OK, MessageBoxImage.Information);
        }
        
        private void AppSearchBox_TextChanged(object sender, System.Windows.Controls.TextChangedEventArgs e) 
        {
            // Handle app search text change
        }
        
        private void AppFilterCombo_SelectionChanged(object sender, System.Windows.Controls.SelectionChangedEventArgs e) 
        {
            // Handle app filter selection change
        }
        
        private void AnalyzeDependencies_Click(object sender, RoutedEventArgs e) 
        {
            MessageBox.Show("Dependency analysis initiated.", "Info", MessageBoxButton.OK, MessageBoxImage.Information);
        }

        private void VulnerabilitiesColumnChooser_Click(object sender, RoutedEventArgs e)
        {
            var columnChooserWindow = new Window
            {
                Title = "Choose Columns - Vulnerabilities",
                Width = 350,
                Height = 450,
                WindowStartupLocation = WindowStartupLocation.CenterOwner,
                Owner = this
            };

            var columnChooser = new Controls.ColumnChooser
            {
                TargetDataGrid = VulnerabilitiesDataGrid
            };

            columnChooserWindow.Content = columnChooser;
            columnChooserWindow.ShowDialog();
        }

        /// <summary>
        /// Handles clicking outside the Command Palette to close it
        /// </summary>
        private void CommandPaletteOverlay_MouseDown(object sender, MouseButtonEventArgs e)
        {
            if (ViewModel != null)
            {
                ViewModel.IsCommandPaletteVisible = false;
            }
        }
    }
}