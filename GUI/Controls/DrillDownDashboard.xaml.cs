using System.Windows;
using System.Windows.Controls;
using System.Windows.Input;
using MandADiscoverySuite.ViewModels;

namespace MandADiscoverySuite.Controls
{
    /// <summary>
    /// Interaction logic for DrillDownDashboard.xaml
    /// </summary>
    public partial class DrillDownDashboard : UserControl
    {
        private DrillDownDashboardViewModel _viewModel;

        public DrillDownDashboard()
        {
            InitializeComponent();
            Loaded += OnLoaded;
        }

        private void OnLoaded(object sender, RoutedEventArgs e)
        {
            _viewModel = DataContext as DrillDownDashboardViewModel;
        }

        private void MetricCard_Click(object sender, MouseButtonEventArgs e)
        {
            if (sender is FrameworkElement element && 
                element.DataContext is MetricCard metricCard)
            {
                _viewModel?.DrillDownIntoMetric(metricCard);
                e.Handled = true;
            }
        }
    }
}