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
            DataContext = new ProjectManagementViewModel();
        }
    }
}