using System;
using System.Windows;
using System.Windows.Controls;
using MandADiscoverySuite.ViewModels;
using MandADiscoverySuite.Services;

namespace MandADiscoverySuite.Views
{
    /// <summary>
    /// Interaction logic for UsersView.xaml
    /// </summary>
    public partial class UsersView : UserControl
    {
        public UsersView()
        {
            _ = EnhancedLoggingService.Instance.LogInformationAsync("UsersView: Constructor started");
            InitializeComponent();
            
            // Wire up the DataContext to UsersViewModel
            try
            {
                var mainWindow = Application.Current?.MainWindow;
                _ = EnhancedLoggingService.Instance.LogInformationAsync($"UsersView: MainWindow found = {mainWindow != null}");
                
                if (mainWindow?.DataContext is MainViewModel mainVM)
                {
                    _ = EnhancedLoggingService.Instance.LogInformationAsync("UsersView: MainViewModel found, creating UsersViewModel");
                    var viewModel = new UsersViewModel(mainViewModel: mainVM);
                    DataContext = viewModel;
                    _ = EnhancedLoggingService.Instance.LogInformationAsync("UsersView: ViewModel created and DataContext set");
                }
                else
                {
                    _ = EnhancedLoggingService.Instance.LogErrorAsync("UsersView: MainViewModel not found in MainWindow.DataContext");
                    System.Diagnostics.Debug.WriteLine("UsersView: MainViewModel not found in MainWindow.DataContext");
                }
            }
            catch (Exception ex)
            {
                _ = EnhancedLoggingService.Instance.LogErrorAsync($"UsersView: Error setting DataContext: {ex.Message}");
                System.Diagnostics.Debug.WriteLine($"UsersView: Error setting DataContext: {ex.Message}");
            }
            _ = EnhancedLoggingService.Instance.LogInformationAsync("UsersView: Constructor completed");
        }
    }
}