using System;
using System.Windows;
using System.Windows.Controls;
using MandADiscoverySuite.ViewModels;
using MandADiscoverySuite.Services;

namespace MandADiscoverySuite.Views
{
    /// <summary>
    /// Interaction logic for GroupPoliciesView.xaml
    /// </summary>
    public partial class GroupPoliciesView : UserControl
    {
        public GroupPoliciesView()
        {
            _ = EnhancedLoggingService.Instance.LogInformationAsync("GroupPoliciesView: Constructor started");
            InitializeComponent();
            
            // Wire up the DataContext to GroupPoliciesViewModel
            try
            {
                var mainWindow = Application.Current?.MainWindow;
                _ = EnhancedLoggingService.Instance.LogInformationAsync($"GroupPoliciesView: MainWindow found = {mainWindow != null}");
                
                if (mainWindow?.DataContext is MainViewModel mainVM)
                {
                    _ = EnhancedLoggingService.Instance.LogInformationAsync("GroupPoliciesView: MainViewModel found, creating GroupPoliciesViewModel");
                    var csvDataService = SimpleServiceLocator.GetService<CsvDataService>();
                    var viewModel = new GroupPoliciesViewModel(csvDataService, mainVM);
                    DataContext = viewModel;
                    _ = EnhancedLoggingService.Instance.LogInformationAsync("GroupPoliciesView: ViewModel created and DataContext set");
                }
                else
                {
                    _ = EnhancedLoggingService.Instance.LogErrorAsync("GroupPoliciesView: MainViewModel not found in MainWindow.DataContext");
                    System.Diagnostics.Debug.WriteLine("GroupPoliciesView: MainViewModel not found in MainWindow.DataContext");
                }
            }
            catch (Exception ex)
            {
                _ = EnhancedLoggingService.Instance.LogErrorAsync($"GroupPoliciesView: Error setting DataContext: {ex.Message}");
                System.Diagnostics.Debug.WriteLine($"GroupPoliciesView: Error setting DataContext: {ex.Message}");
            }
            _ = EnhancedLoggingService.Instance.LogInformationAsync("GroupPoliciesView: Constructor completed");
        }
    }
}
