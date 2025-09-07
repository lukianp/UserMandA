using System.Windows.Controls;
using MandADiscoverySuite.ViewModels;

namespace MandADiscoverySuite.Views
{
    /// <summary>
    /// Interaction logic for GroupsPolicyMigrationView.xaml
    /// T-037: Groups, GPOs, and ACLs Migration View
    /// </summary>
    public partial class GroupsPolicyMigrationView : UserControl
    {
        public GroupsPolicyMigrationView()
        {
            InitializeComponent();
        }

        public GroupsPolicyMigrationView(GroupsPolicyMigrationViewModel viewModel)
        {
            InitializeComponent();
            DataContext = viewModel;
        }
    }
}