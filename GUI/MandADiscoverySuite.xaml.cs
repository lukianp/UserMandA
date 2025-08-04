using System;
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
            InitializeComponent();
            
            // Initialize ViewModel using dependency injection and set as DataContext
            try
            {
                ViewModel = SimpleServiceLocator.GetService<MainViewModel>();
            }
            catch (Exception)
            {
                // Fallback to direct instantiation if DI fails
                ViewModel = new MainViewModel();
            }
            
            DataContext = ViewModel;
            
            // Apply initial theme
            ApplyTheme();
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

        private void MainWindow_KeyDown(object sender, KeyEventArgs e)
        {
            // Handle global keyboard shortcuts
            switch (e.Key)
            {
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
                    
                case Key.T:
                    if (Keyboard.Modifiers == ModifierKeys.Control)
                    {
                        ViewModel.ToggleThemeCommand.Execute(null);
                        ApplyTheme();
                        e.Handled = true;
                    }
                    break;
            }
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
        private void UserSearchBox_TextChanged(object sender, System.Windows.Controls.TextChangedEventArgs e) { }
        private void ComputerSearchBox_TextChanged(object sender, System.Windows.Controls.TextChangedEventArgs e) { }
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