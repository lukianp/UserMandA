using System.Windows.Controls;
using MandADiscoverySuite.ViewModels;

namespace MandADiscoverySuite.Views
{
    /// <summary>
    /// Interaction logic for MigrationExecutionView.xaml
    /// </summary>
    public partial class MigrationExecutionView : UserControl
    {
        public MigrationExecutionView()
        {
            InitializeComponent();
            DataContext = new MigrationExecutionViewModel();
        }
    }
}