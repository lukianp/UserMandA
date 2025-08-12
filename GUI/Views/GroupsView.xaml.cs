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
            
            // TEMPORARY FIX: Set DataContext directly since tab system is not working
            var csvDataService = SimpleServiceLocator.GetService<CsvDataService>();
            var dataService = SimpleServiceLocator.GetService<IDataService>();
            _ = EnhancedLoggingService.Instance.LogInformationAsync($"GroupsView: Services - csvDataService={csvDataService != null}, dataService={dataService != null}");
            if (csvDataService != null)
            {
                var viewModel = new GroupsViewModel(dataService, csvDataService);
                DataContext = viewModel;
                _ = EnhancedLoggingService.Instance.LogInformationAsync("GroupsView: ViewModel created and DataContext set");
                
                // Load data when the view is loaded
                Loaded += (s, e) => 
                {
                    _ = EnhancedLoggingService.Instance.LogInformationAsync("GroupsView: Loaded event triggered");
                    if (viewModel.RefreshGroupsCommand.CanExecute(null))
                    {
                        _ = EnhancedLoggingService.Instance.LogInformationAsync("GroupsView: Executing RefreshGroupsCommand");
                        viewModel.RefreshGroupsCommand.Execute(null);
                    }
                    else
                    {
                        _ = EnhancedLoggingService.Instance.LogWarningAsync("GroupsView: RefreshGroupsCommand cannot execute");
                    }
                };
            }
            else
            {
                _ = EnhancedLoggingService.Instance.LogErrorAsync("GroupsView: csvDataService is null - cannot create ViewModel");
            }
            _ = EnhancedLoggingService.Instance.LogInformationAsync("GroupsView: Constructor completed");
        }
    }
}