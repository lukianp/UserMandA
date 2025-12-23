using System.Windows;
using System.Windows.Controls;
using System.Windows.Input;
using MandADiscoverySuite.ViewModels;

namespace MandADiscoverySuite.Controls
{
    /// <summary>
    /// Interaction logic for StatusIndicator.xaml
    /// </summary>
    public partial class StatusIndicator : UserControl
    {
        public StatusIndicator()
        {
            InitializeComponent();
        }

        private void StatusIndicator_Click(object sender, MouseButtonEventArgs e)
        {
            if (DataContext is StatusIndicatorViewModel viewModel && viewModel.ClickCommand?.CanExecute(null) == true)
            {
                viewModel.ClickCommand.Execute(null);
            }
        }
    }
}