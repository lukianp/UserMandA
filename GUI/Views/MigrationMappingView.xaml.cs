using System.Windows.Controls;
using MandADiscoverySuite.ViewModels;

namespace MandADiscoverySuite.Views
{
    /// <summary>
    /// Interaction logic for MigrationMappingView.xaml
    /// </summary>
    public partial class MigrationMappingView : UserControl
    {
        public MigrationMappingView()
        {
            InitializeComponent();
            DataContext = new MigrationMappingViewModel();
        }
    }
}