using System.Windows.Controls;

namespace MandADiscoverySuite.Views
{
    /// <summary>
    /// Interaction logic for WebServerConfigurationDiscoveryView.xaml
    /// </summary>
    public partial class WebServerConfigurationDiscoveryView : UserControl
    {
        public WebServerConfigurationDiscoveryView()
        {
            InitializeComponent();
        }

        // Factory method for ViewRegistry
        public static UserControl CreateView()
        {
            return new WebServerConfigurationDiscoveryView();
        }
    }
}