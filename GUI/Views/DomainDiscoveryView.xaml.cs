using System.Windows;
using System.Windows.Controls;
using MandADiscoverySuite.ViewModels;
using MandADiscoverySuite.Services;

namespace MandADiscoverySuite.Views
{
    /// <summary>
    /// Interaction logic for DomainDiscoveryView.xaml
    /// </summary>
    public partial class DomainDiscoveryView : UserControl
    {
        public DomainDiscoveryView()
        {
            InitializeComponent();
            
            try
            {
                // Get MainViewModel from Application
                var mainVM = (MainViewModel)Application.Current.MainWindow.DataContext;
                DataContext = new DomainDiscoveryViewModel(mainVM);
                
                _ = EnhancedLoggingService.Instance.LogInformationAsync("DomainDiscoveryView: DataContext set successfully");
            }
            catch (System.Exception ex)
            {
                _ = EnhancedLoggingService.Instance.LogErrorAsync($"DomainDiscoveryView constructor failed: {ex.Message}");
                
                // Create a minimal DataContext to prevent binding errors
                DataContext = new DomainDiscoveryViewModel(null);
            }
        }

        private async void UserControl_Loaded(object sender, RoutedEventArgs e)
        {
            try
            {
                if (DataContext is DomainDiscoveryViewModel viewModel)
                {
                    _ = EnhancedLoggingService.Instance.LogInformationAsync("DomainDiscoveryView: Loading data asynchronously");
                    await viewModel.LoadAsync();
                }
            }
            catch (System.Exception ex)
            {
                _ = EnhancedLoggingService.Instance.LogErrorAsync($"DomainDiscoveryView.UserControl_Loaded failed: {ex.Message}");
            }
        }
    }
}