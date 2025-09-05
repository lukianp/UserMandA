using System.Windows.Controls;

namespace MandADiscoverySuite.Views
{
    /// <summary>
    /// Interaction logic for DataLossPreventionDiscoveryView.xaml
    /// </summary>
    public partial class DataLossPreventionDiscoveryView : UserControl
    {
        public DataLossPreventionDiscoveryView()
        {
            InitializeComponent();
        }

        // Factory method for ViewRegistry
        public static UserControl CreateView()
        {
            return new DataLossPreventionDiscoveryView();
        }
    }
}