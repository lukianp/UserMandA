using System.Windows;
using System.Windows.Controls;
using MandADiscoverySuite.ViewModels;

namespace MandADiscoverySuite.Views
{
    /// <summary>
    /// Interaction logic for VMwareDiscoveryView.xaml
    /// </summary>
    public partial class VMwareDiscoveryView : UserControl
    {
        public VMwareDiscoveryView()
        {
            InitializeComponent();
        }

        // Factory method for ViewRegistry
        public static UserControl CreateView()
        {
            return new VMwareDiscoveryView();
        }
    }
}