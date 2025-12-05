using System.Windows;
using System.Windows.Controls;
using MandADiscoverySuite.ViewModels;
using MandADiscoverySuite.Models;

namespace MandADiscoverySuite.Views
{
    public partial class SharePointMigrationPlanningView : UserControl
    {
        public SharePointMigrationPlanningView()
        {
            InitializeComponent();
            DataContext = new SharePointMigrationPlanningViewModel();
        }

        private void SitesDataGrid_SelectionChanged(object sender, SelectionChangedEventArgs e)
        {
            if (DataContext is SharePointMigrationPlanningViewModel viewModel && sender is DataGrid dataGrid)
            {
                viewModel.SelectedSite = dataGrid.SelectedItem as dynamic;
            }
        }

        private void LibrariesDataGrid_SelectionChanged(object sender, SelectionChangedEventArgs e)
        {
            if (DataContext is SharePointMigrationPlanningViewModel viewModel && sender is DataGrid dataGrid)
            {
                viewModel.SelectedLibrary = dataGrid.SelectedItem as dynamic;
            }
        }

        private void BatchesDataGrid_SelectionChanged(object sender, SelectionChangedEventArgs e)
        {
            if (DataContext is SharePointMigrationPlanningViewModel viewModel && sender is DataGrid dataGrid)
            {
                viewModel.SelectedBatch = dataGrid.SelectedItem as MigrationBatch;
            }
        }

        private void IssuesDataGrid_SelectionChanged(object sender, SelectionChangedEventArgs e)
        {
            if (DataContext is SharePointMigrationPlanningViewModel viewModel && sender is DataGrid dataGrid)
            {
                // Handle issue selection if needed - property may be added later
                // viewModel.SelectedIssue = dataGrid.SelectedItem as ValidationIssue;
            }
        }
    }
}