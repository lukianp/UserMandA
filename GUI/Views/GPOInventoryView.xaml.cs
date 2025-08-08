using System.Windows.Controls;
using MandADiscoverySuite.ViewModels;

namespace MandADiscoverySuite.Views
{
    /// <summary>
    /// Interaction logic for GPOInventoryView.xaml
    /// </summary>
    public partial class GPOInventoryView : UserControl
    {
        private readonly GPOInventoryViewModel _viewModel;

        public GPOInventoryView()
        {
            InitializeComponent();
            _viewModel = new GPOInventoryViewModel();
            DataContext = _viewModel;
            // Use a default company name for initialization; in real usage this should come from the selected profile
            _ = _viewModel.InitializeAsync("DefaultCompany");
        }
    }
}
