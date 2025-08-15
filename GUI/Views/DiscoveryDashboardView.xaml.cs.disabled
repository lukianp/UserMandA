using System;
using System.Windows;
using System.Windows.Controls;
using MandADiscoverySuite.ViewModels;
using MandADiscoverySuite.Services;

namespace MandADiscoverySuite.Views
{
    /// <summary>
    /// Interaction logic for DiscoveryDashboardView.xaml
    /// </summary>
    public partial class DiscoveryDashboardView : UserControl
    {
        public DiscoveryDashboardView()
        {
            _ = EnhancedLoggingService.Instance.LogInformationAsync("DiscoveryDashboardView: Constructor started");
            InitializeComponent();
            
            // Wire up the DataContext to DiscoveryDashboardViewModel
            try
            {
                var mainWindow = Application.Current?.MainWindow;
                _ = EnhancedLoggingService.Instance.LogInformationAsync($"DiscoveryDashboardView: MainWindow found = {mainWindow != null}");
                
                if (mainWindow?.DataContext is MainViewModel mainVM)
                {
                    _ = EnhancedLoggingService.Instance.LogInformationAsync("DiscoveryDashboardView: MainViewModel found, creating DiscoveryDashboardViewModel");
                    var viewModel = new DiscoveryDashboardViewModel(mainVM);
                    DataContext = viewModel;
                    _ = EnhancedLoggingService.Instance.LogInformationAsync("DiscoveryDashboardView: ViewModel created and DataContext set");
                }
                else
                {
                    _ = EnhancedLoggingService.Instance.LogErrorAsync("DiscoveryDashboardView: MainViewModel not found in MainWindow.DataContext");
                    System.Diagnostics.Debug.WriteLine("DiscoveryDashboardView: MainViewModel not found in MainWindow.DataContext");
                }
            }
            catch (Exception ex)
            {
                _ = EnhancedLoggingService.Instance.LogErrorAsync($"DiscoveryDashboardView: Error setting DataContext: {ex.Message}");
                System.Diagnostics.Debug.WriteLine($"DiscoveryDashboardView: Error setting DataContext: {ex.Message}");
            }
            _ = EnhancedLoggingService.Instance.LogInformationAsync("DiscoveryDashboardView: Constructor completed");
        }
    }
}