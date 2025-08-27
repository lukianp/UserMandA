using System.Windows.Controls;
using MandADiscoverySuite.ViewModels;

namespace MandADiscoverySuite.Views
{
    /// <summary>
    /// Interaction logic for ManagementDashboardView.xaml
    /// </summary>
    public partial class ManagementDashboardView : UserControl
    {
        public ManagementDashboardView()
        {
            InitializeComponent();
        }

        private void UserControl_Loaded(object sender, System.Windows.RoutedEventArgs e)
        {
            // Update KPIs when the view is loaded
            if (DataContext is ManagementDashboardViewModel viewModel)
            {
                viewModel.UpdateKPIs();
            }
        }
    }
}