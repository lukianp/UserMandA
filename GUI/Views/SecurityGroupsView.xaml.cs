using System.Windows.Controls;
using MandADiscoverySuite.ViewModels;
using MandADiscoverySuite.Services;
using System.Windows;

namespace MandADiscoverySuite.Views
{
    /// <summary>
    /// Interaction logic for SecurityGroupsView.xaml
    /// </summary>
    public partial class SecurityGroupsView : UserControl
    {
        public SecurityGroupsView()
        {
            _ = EnhancedLoggingService.Instance.LogInformationAsync("SecurityGroupsView: Constructor started");
            InitializeComponent();
            
            // TEMPORARY FIX: Set DataContext directly since tab system may not work properly
            var csvDataService = SimpleServiceLocator.GetService<CsvDataService>();
            var mainViewModel = (MainViewModel)Application.Current.MainWindow?.DataContext;
            _ = EnhancedLoggingService.Instance.LogInformationAsync($"SecurityGroupsView: Services - csvDataService={csvDataService != null}, mainViewModel={mainViewModel != null}");
            
            if (csvDataService != null && mainViewModel != null)
            {
                var viewModel = new SecurityGroupsViewModel(csvDataService, mainViewModel);
                DataContext = viewModel;
                _ = EnhancedLoggingService.Instance.LogInformationAsync("SecurityGroupsView: ViewModel created and DataContext set");
                
                // Trigger load when view is loaded
                Loaded += (s, e) => 
                {
                    _ = EnhancedLoggingService.Instance.LogInformationAsync("SecurityGroupsView: Loaded event triggered");
                    if (viewModel.RefreshGroupsCommand.CanExecute(null))
                    {
                        _ = EnhancedLoggingService.Instance.LogInformationAsync("SecurityGroupsView: Executing RefreshGroupsCommand");
                        viewModel.RefreshGroupsCommand.Execute(null);
                    }
                    else
                    {
                        _ = EnhancedLoggingService.Instance.LogWarningAsync("SecurityGroupsView: RefreshGroupsCommand cannot execute");
                    }
                };
            }
            else
            {
                _ = EnhancedLoggingService.Instance.LogErrorAsync("SecurityGroupsView: Required services are null - cannot create ViewModel");
            }
            _ = EnhancedLoggingService.Instance.LogInformationAsync("SecurityGroupsView: Constructor completed");
        }
    }
}