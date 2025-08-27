using System.Windows;
using System.Windows.Controls;
using MandADiscoverySuite.ViewModels;

namespace MandADiscoverySuite.Controls
{
    /// <summary>
    /// Interaction logic for ThemeToggleButton.xaml
    /// </summary>
    public partial class ThemeToggleButton : UserControl
    {
        public ThemeToggleButton()
        {
            InitializeComponent();
            DataContext = new ThemeToggleButtonViewModel();
        }

        private void ThemeToggleButton_Click(object sender, RoutedEventArgs e)
        {
            if (DataContext is ThemeToggleButtonViewModel viewModel)
            {
                viewModel.ToggleThemeCommand.Execute(null);
            }
        }
    }
}