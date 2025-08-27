using System.Windows.Controls;
using MandADiscoverySuite.ViewModels;

namespace MandADiscoverySuite.Views
{
    /// <summary>
    /// Interaction logic for MigrationPlanningView.xaml
    /// </summary>
    public partial class MigrationPlanningView : UserControl
    {
        public MigrationPlanningView()
        {
            InitializeComponent();
            DataContext = new MigrationPlanningViewModel();
        }
    }
}