using System.Windows.Controls;
using MandADiscoverySuite.ViewModels;
using MandADiscoverySuite.Models;

namespace MandADiscoverySuite.Views
{
    /// <summary>
    /// Interaction logic for TeamsMigrationPlanningView.xaml
    /// Microsoft Teams migration planning with ShareGate-quality capabilities
    /// </summary>
    public partial class TeamsMigrationPlanningView : UserControl
    {
        public TeamsMigrationPlanningView()
        {
            InitializeComponent();
        }

        private void TeamsDataGrid_SelectionChanged(object sender, SelectionChangedEventArgs e)
        {
            if (DataContext is TeamsMigrationPlanningViewModel viewModel && sender is DataGrid dataGrid)
            {
                viewModel.SelectedTeam = dataGrid.SelectedItem as TeamsDiscoveryItem;
            }
        }

        private void ChannelsDataGrid_SelectionChanged(object sender, SelectionChangedEventArgs e)
        {
            if (DataContext is TeamsMigrationPlanningViewModel viewModel && sender is DataGrid dataGrid)
            {
                viewModel.SelectedChannel = dataGrid.SelectedItem as ChannelDiscoveryItem;
            }
        }

        private void BatchesDataGrid_SelectionChanged(object sender, SelectionChangedEventArgs e)
        {
            if (DataContext is TeamsMigrationPlanningViewModel viewModel && sender is DataGrid dataGrid)
            {
                viewModel.SelectedBatch = dataGrid.SelectedItem as MigrationBatch;
            }
        }
    }
}