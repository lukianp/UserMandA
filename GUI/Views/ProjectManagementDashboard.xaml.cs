using System.Windows;
using System.Windows.Controls;
using MandADiscoverySuite.ViewModels;

namespace MandADiscoverySuite.Views
{
    /// <summary>
    /// Interaction logic for ProjectManagementDashboard.xaml
    /// </summary>
    public partial class ProjectManagementDashboard : UserControl
    {
        private readonly ProjectManagementDashboardViewModel _viewModel;

        public ProjectManagementDashboard()
        {
            InitializeComponent();
            _viewModel = new ProjectManagementDashboardViewModel();
            DataContext = _viewModel;
            Loaded += OnLoaded;
        }

        private void OnLoaded(object sender, RoutedEventArgs e)
        {
            _viewModel.RefreshMetricsCommand.Execute(null);
        }
    }
}