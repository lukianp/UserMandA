using System;
using System.Windows;
using System.Windows.Controls;
using MandADiscoverySuite.ViewModels;
using MandADiscoverySuite.Services;

namespace MandADiscoverySuite.Views
{
    /// <summary>
    /// Interaction logic for GroupsView.xaml
    /// </summary>
    public partial class GroupsView : UserControl
    {
        public GroupsView()
        {
            _ = EnhancedLoggingService.Instance.LogInformationAsync("GroupsView: Constructor started");
            InitializeComponent();
            
            // Wire up the DataContext to GroupsViewModel
            try
            {
                var mainWindow = Application.Current?.MainWindow;
                _ = EnhancedLoggingService.Instance.LogInformationAsync($"GroupsView: MainWindow found = {mainWindow != null}");
                
                if (mainWindow?.DataContext is MainViewModel mainVM)
                {
                    _ = EnhancedLoggingService.Instance.LogInformationAsync("GroupsView: MainViewModel found, creating GroupsViewModel");
                    var viewModel = new GroupsViewModel();
                    DataContext = viewModel;
                    _ = EnhancedLoggingService.Instance.LogInformationAsync("GroupsView: ViewModel created and DataContext set");
                }
                else
                {
                    _ = EnhancedLoggingService.Instance.LogErrorAsync("GroupsView: MainViewModel not found in MainWindow.DataContext");
                    System.Diagnostics.Debug.WriteLine("GroupsView: MainViewModel not found in MainWindow.DataContext");
                }
            }
            catch (Exception ex)
            {
                _ = EnhancedLoggingService.Instance.LogErrorAsync($"GroupsView: Error setting DataContext: {ex.Message}");
                System.Diagnostics.Debug.WriteLine($"GroupsView: Error setting DataContext: {ex.Message}");
            }
            _ = EnhancedLoggingService.Instance.LogInformationAsync("GroupsView: Constructor completed");
        }
    }
}