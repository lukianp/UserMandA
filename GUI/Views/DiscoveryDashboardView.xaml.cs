using System;
using System.Windows;
using System.Windows.Controls;
using MandADiscoverySuite.ViewModels;

namespace MandADiscoverySuite.Views
{
    /// <summary>
    /// Interaction logic for DiscoveryDashboardView.xaml
    /// </summary>
    public partial class DiscoveryDashboardView : UserControl
    {
        public DiscoveryDashboardView()
        {
            InitializeComponent();
            
            // Wire up the DataContext to DiscoveryDashboardViewModel
            try
            {
                var mainWindow = Application.Current?.MainWindow;
                if (mainWindow?.DataContext is MainViewModel mainVM)
                {
                    DataContext = new DiscoveryDashboardViewModel(mainVM);
                }
                else
                {
                    System.Diagnostics.Debug.WriteLine("DiscoveryDashboardView: MainViewModel not found in MainWindow.DataContext");
                }
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"DiscoveryDashboardView: Error setting DataContext: {ex.Message}");
            }
        }
    }
}