using System.Windows.Controls;
using MandADiscoverySuite.ViewModels;

namespace MandADiscoverySuite.Views
{
    /// <summary>
    /// Interaction logic for PreMigrationCheckView.xaml
    /// </summary>
    public partial class PreMigrationCheckView : UserControl
    {
        public PreMigrationCheckView()
        {
            InitializeComponent();
        }

        /// <summary>
        /// Sets the ViewModel for this view
        /// </summary>
        public void SetViewModel(PreMigrationCheckViewModel viewModel)
        {
            DataContext = viewModel;
        }
    }
}