using System.Windows;
using System.Windows.Controls;

namespace MandADiscoverySuite.Controls
{
    public partial class QuickActionsBar : UserControl
    {
        public QuickActionsBar()
        {
            InitializeComponent();
        }

        private void CollapsedIndicator_Click(object sender, RoutedEventArgs e) { }
        private void FloatingActionButton_Click(object sender, RoutedEventArgs e) { }
    }
}