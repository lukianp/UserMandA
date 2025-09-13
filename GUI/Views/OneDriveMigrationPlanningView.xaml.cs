using System.Windows;
using System.Windows.Controls;
using MandADiscoverySuite.ViewModels;
using MandADiscoverySuite.Models;

namespace MandADiscoverySuite.Views
{
    public partial class OneDriveMigrationPlanningView : UserControl
    {
        public OneDriveMigrationPlanningView()
        {
            InitializeComponent();
            DataContext = new OneDriveMigrationPlanningViewModel();

            // Handle initialization asynchronously
            this.Loaded += OnLoaded;
        }

        private async void OnLoaded(object sender, RoutedEventArgs e)
        {
            if (DataContext is OneDriveMigrationPlanningViewModel viewModel)
            {
                try
                {
                    await viewModel.InitializeTask;
                }
                catch (Exception ex)
                {
                    // Handle initialization errors appropriately
                    System.Diagnostics.Debug.WriteLine($"Failed to initialize OneDrive Migration Planning: {ex.Message}");
                }
            }
        }

        private void UsersDataGrid_SelectionChanged(object sender, SelectionChangedEventArgs e)
        {
            if (DataContext is OneDriveMigrationPlanningViewModel viewModel && sender is DataGrid dataGrid)
            {
                viewModel.SelectedUser = dataGrid.SelectedItem as dynamic;
            }
        }

        private void FileSharesDataGrid_SelectionChanged(object sender, SelectionChangedEventArgs e)
        {
            if (DataContext is OneDriveMigrationPlanningViewModel viewModel && sender is DataGrid dataGrid)
            {
                viewModel.SelectedFileShare = dataGrid.SelectedItem as dynamic;
            }
        }

        private void BatchesDataGrid_SelectionChanged(object sender, SelectionChangedEventArgs e)
        {
            if (DataContext is OneDriveMigrationPlanningViewModel viewModel && sender is DataGrid dataGrid)
            {
                viewModel.SelectedBatch = dataGrid.SelectedItem as MigrationBatch;
            }
        }
    }
}