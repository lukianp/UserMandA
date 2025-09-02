using System.Windows.Controls;
using MandADiscoverySuite.ViewModels;

namespace MandADiscoverySuite.Views
{
    /// <summary>
    /// Interaction logic for AuditView.xaml
    /// </summary>
    public partial class AuditView : UserControl
    {
        public AuditView()
        {
            InitializeComponent();
        }

        public AuditView(AuditViewModel viewModel)
        {
            InitializeComponent();
            DataContext = viewModel;
        }
    }
}