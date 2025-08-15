using System.Windows;
using System.Windows.Controls;
using System.Windows.Input;

namespace MandADiscoverySuite.Controls
{
    public partial class ZoomPanControl : UserControl
    {
        public ZoomPanControl()
        {
            InitializeComponent();
        }

        private void MainScrollViewer_ScrollChanged(object sender, ScrollChangedEventArgs e) { }
        private void MainScrollViewer_PreviewMouseWheel(object sender, MouseWheelEventArgs e) { }
        private void Canvas_MouseMove(object sender, MouseEventArgs e) { }
        private void Canvas_MouseLeftButtonDown(object sender, MouseButtonEventArgs e) { }
        private void Canvas_MouseLeftButtonUp(object sender, MouseButtonEventArgs e) { }
    }
}