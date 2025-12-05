using System.Windows.Controls;
using Microsoft.Extensions.DependencyInjection;
using MandADiscoverySuite.ViewModels;

namespace MandADiscoverySuite.Views
{
    /// <summary>
    /// Interaction logic for DiscoveryView.xaml
    /// </summary>
    public partial class DiscoveryView : UserControl
    {
        public DiscoveryView()
        {
            InitializeComponent();

            // Use dependency injection to get DiscoveryViewModel
            if (App.ServiceProvider != null)
            {
                DataContext = App.ServiceProvider.GetRequiredService<DiscoveryViewModel>();
            }
            else
            {
                // Fallback for design-time or if DI not available
                DataContext = new DiscoveryViewModel();
            }
        }
    }
}