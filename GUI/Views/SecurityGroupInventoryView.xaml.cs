using System.Windows.Controls;
using MandADiscoverySuite.ViewModels;

namespace MandADiscoverySuite.Views
{
    public partial class SecurityGroupInventoryView : UserControl
    {
        public SecurityGroupInventoryView()
        {
            InitializeComponent();
            DataContext = new SecurityGroupInventoryViewModel();
        }
    }
}
