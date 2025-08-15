using System.Windows.Controls;
using MandADiscoverySuite.ViewModels;

namespace MandADiscoverySuite.Controls
{
    /// <summary>
    /// Interaction logic for HealthScoreVisualization.xaml
    /// </summary>
    public partial class HealthScoreVisualization : UserControl
    {
        private HealthScoreVisualizationViewModel _viewModel;

        public HealthScoreVisualization()
        {
            InitializeComponent();
            Loaded += OnLoaded;
        }

        private void OnLoaded(object sender, System.Windows.RoutedEventArgs e)
        {
            _viewModel = DataContext as HealthScoreVisualizationViewModel;
        }
    }
}