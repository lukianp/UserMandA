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
            
            // TEMPORARY FIX: Set DataContext directly since tab system is not working
            var csvDataService = SimpleServiceLocator.GetService<CsvDataService>();
            var dataService = SimpleServiceLocator.GetService<IDataService>();
            _ = EnhancedLoggingService.Instance.LogInformationAsync($"ComputersView: Services - csvDataService={csvDataService != null}, dataService={dataService != null}");
            if (csvDataService != null)
            {
                var viewModel = new ComputersViewModel(dataService, csvDataService, null);
                DataContext = viewModel;
                _ = EnhancedLoggingService.Instance.LogInformationAsync("ComputersView: ViewModel created and DataContext set");
                
                // Load data when the view is loaded
                Loaded += (s, e) => 
                {
                    _ = EnhancedLoggingService.Instance.LogInformationAsync("ComputersView: Loaded event triggered");
                    if (viewModel.RefreshComputersCommand.CanExecute(null))
                    {
                        _ = EnhancedLoggingService.Instance.LogInformationAsync("ComputersView: Executing RefreshComputersCommand");
                        viewModel.RefreshComputersCommand.Execute(null);
                    }
                    else
                    {
                        _ = EnhancedLoggingService.Instance.LogWarningAsync("ComputersView: RefreshComputersCommand cannot execute");
                    }
                };
            }
            else
            {
                _ = EnhancedLoggingService.Instance.LogErrorAsync("ComputersView: csvDataService is null - cannot create ViewModel");
            }
            _ = EnhancedLoggingService.Instance.LogInformationAsync("ComputersView: Constructor completed");
        }
    }
}