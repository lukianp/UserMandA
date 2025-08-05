using System.Windows.Controls;
using MandADiscoverySuite.ViewModels;

namespace MandADiscoverySuite.Controls
{
    /// <summary>
    /// Interaction logic for DockingPanelContainer.xaml
    /// </summary>
    public partial class DockingPanelContainer : UserControl
    {
        public DockingPanelContainer()
        {
            InitializeComponent();
            DataContext = new DockingPanelViewModel();
        }
    }
}