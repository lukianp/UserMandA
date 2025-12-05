using System.Windows.Controls;
using MandADiscoverySuite.ViewModels;

namespace MandADiscoverySuite.Views
{
    /// <summary>
    /// Interaction logic for ProjectManagementView.xaml
    /// </summary>
    public partial class ProjectManagementView : UserControl
    {
        public ProjectManagementView()
        {
            InitializeComponent();
            
            // Create ViewModel - currently using existing implementation
            // Note: This ViewModel needs to be updated to follow unified LoadAsync pattern
            var viewModel = new ProjectManagementViewModel();
            DataContext = viewModel;
        }
    }
}