using System.Windows.Controls;

namespace MandADiscoverySuite.Views
{
    /// <summary>
    /// Interaction logic for TeamsDiscoveryView.xaml
    /// </summary>
    public partial class TeamsDiscoveryView : UserControl
    {
        public TeamsDiscoveryView()
        {
            InitializeComponent();
        }

        // Factory method for ViewRegistry
        public static UserControl CreateView()
        {
            return new TeamsDiscoveryView();
        }
    }
}