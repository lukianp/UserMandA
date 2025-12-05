using System.Windows;
using System.Windows.Controls;
using MandADiscoverySuite.ViewModels;

namespace MandADiscoverySuite.Controls
{
    /// <summary>
    /// Interaction logic for BreadcrumbNavigation.xaml
    /// </summary>
    public partial class BreadcrumbNavigation : UserControl
    {
        public BreadcrumbNavigation()
        {
#pragma warning disable CS0103 // The name 'InitializeComponent' does not exist in the current context
            InitializeComponent();
#pragma warning restore CS0103
            DataContext = new BreadcrumbNavigationViewModel();
        }

        private void OverflowButton_Click(object sender, RoutedEventArgs e)
        {
            if (sender is Button button && button.ContextMenu != null)
            {
                button.ContextMenu.PlacementTarget = button;
                button.ContextMenu.Placement = System.Windows.Controls.Primitives.PlacementMode.Bottom;
                button.ContextMenu.IsOpen = true;
            }
        }
    }
}