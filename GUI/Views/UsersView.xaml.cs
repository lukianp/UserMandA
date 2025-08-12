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
            
            // TEMPORARY FIX: Set DataContext directly since MainWindow template system is not working
            var csvDataService = SimpleServiceLocator.GetService<CsvDataService>();
            var dataService = SimpleServiceLocator.GetService<IDataService>();
            _ = EnhancedLoggingService.Instance.LogInformationAsync($"UsersView: Services - csvDataService={csvDataService != null}, dataService={dataService != null}");
            if (csvDataService != null)
            {
                var viewModel = new UsersViewModel(dataService, csvDataService, null);
                DataContext = viewModel;
                _ = EnhancedLoggingService.Instance.LogInformationAsync("UsersView: ViewModel created and DataContext set");
                
                // Load data when the view is loaded
                Loaded += (s, e) => 
                {
                    _ = EnhancedLoggingService.Instance.LogInformationAsync("UsersView: Loaded event triggered");
                    if (viewModel.RefreshUsersCommand.CanExecute(null))
                    {
                        _ = EnhancedLoggingService.Instance.LogInformationAsync("UsersView: Executing RefreshUsersCommand");
                        viewModel.RefreshUsersCommand.Execute(null);
                    }
                    else
                    {
                        _ = EnhancedLoggingService.Instance.LogWarningAsync("UsersView: RefreshUsersCommand cannot execute");
                    }
                };
            }
            else
            {
                _ = EnhancedLoggingService.Instance.LogErrorAsync("UsersView: csvDataService is null - cannot create ViewModel");
            }
            _ = EnhancedLoggingService.Instance.LogInformationAsync("UsersView: Constructor completed");
        }
    }
}