using System;
using System.Windows;
using System.Windows.Controls;
using MandADiscoverySuite.ViewModels;
using MandADiscoverySuite.Services;

namespace MandADiscoverySuite.Views
{
    /// <summary>
    /// Interaction logic for ComputersView.xaml
    /// </summary>
    public partial class ComputersView : UserControl
    {
        public ComputersView()
        {
            _ = EnhancedLoggingService.Instance.LogInformationAsync("ComputersView: Constructor started");
            InitializeComponent();
            
            // Wire up the DataContext to ComputersViewModel
            try
            {
                var mainWindow = Application.Current?.MainWindow;
                _ = EnhancedLoggingService.Instance.LogInformationAsync($"ComputersView: MainWindow found = {mainWindow != null}");
                
                if (mainWindow?.DataContext is MainViewModel mainVM)
                {
                    _ = EnhancedLoggingService.Instance.LogInformationAsync("ComputersView: MainViewModel found, creating ComputersViewModel");
                    var viewModel = new ComputersViewModel(mainViewModel: mainVM);
                    DataContext = viewModel;
                    _ = EnhancedLoggingService.Instance.LogInformationAsync("ComputersView: ViewModel created and DataContext set");
                }
                else
                {
                    _ = EnhancedLoggingService.Instance.LogErrorAsync("ComputersView: MainViewModel not found in MainWindow.DataContext");
                    System.Diagnostics.Debug.WriteLine("ComputersView: MainViewModel not found in MainWindow.DataContext");
                }
            }
            catch (Exception ex)
            {
                _ = EnhancedLoggingService.Instance.LogErrorAsync($"ComputersView: Error setting DataContext: {ex.Message}");
                System.Diagnostics.Debug.WriteLine($"ComputersView: Error setting DataContext: {ex.Message}");
            }
            _ = EnhancedLoggingService.Instance.LogInformationAsync("ComputersView: Constructor completed");
        }
    }
}