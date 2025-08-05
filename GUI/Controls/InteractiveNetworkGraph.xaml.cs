using System.Windows;
using System.Windows.Controls;
using System.Windows.Input;
using MandADiscoverySuite.ViewModels;

namespace MandADiscoverySuite.Controls
{
    /// <summary>
    /// Interaction logic for InteractiveNetworkGraph.xaml
    /// </summary>
    public partial class InteractiveNetworkGraph : UserControl
    {
        private bool _isDragging = false;
        private Point _dragStartPoint;
        private GraphNodeViewModel _draggedNode;

        public InteractiveNetworkGraph()
        {
            InitializeComponent();
        }

        private void GraphCanvas_MouseLeftButtonDown(object sender, MouseButtonEventArgs e)
        {
            var canvas = sender as Canvas;
            if (canvas != null)
            {
                _isDragging = true;
                _dragStartPoint = e.GetPosition(canvas);
                canvas.CaptureMouse();
            }
        }

        private void GraphCanvas_MouseMove(object sender, MouseEventArgs e)
        {
            if (_isDragging && e.LeftButton == MouseButtonState.Pressed)
            {
                var canvas = sender as Canvas;
                if (canvas != null)
                {
                    var currentPoint = e.GetPosition(canvas);
                    var offset = currentPoint - _dragStartPoint;
                    
                    // Pan the view by adjusting scroll viewer
                    GraphScrollViewer.ScrollToHorizontalOffset(GraphScrollViewer.HorizontalOffset - offset.X);
                    GraphScrollViewer.ScrollToVerticalOffset(GraphScrollViewer.VerticalOffset - offset.Y);
                }
            }
        }

        private void GraphCanvas_MouseLeftButtonUp(object sender, MouseButtonEventArgs e)
        {
            if (_isDragging)
            {
                var canvas = sender as Canvas;
                canvas?.ReleaseMouseCapture();
                _isDragging = false;
            }
        }

        private void Node_MouseLeftButtonDown(object sender, MouseButtonEventArgs e)
        {
            var element = sender as FrameworkElement;
            if (element?.DataContext is GraphNodeViewModel node)
            {
                _draggedNode = node;
                _dragStartPoint = e.GetPosition(GraphCanvas);
                element.CaptureMouse();
                e.Handled = true;

                // Notify ViewModel of node selection
                if (DataContext is NetworkGraphViewModel viewModel)
                {
                    viewModel.SelectNode(node);
                }
            }
        }

        private void Node_MouseMove(object sender, MouseEventArgs e)
        {
            if (_draggedNode != null && e.LeftButton == MouseButtonState.Pressed)
            {
                var currentPoint = e.GetPosition(GraphCanvas);
                var offset = currentPoint - _dragStartPoint;
                
                // Update node position
                _draggedNode.X += offset.X;
                _draggedNode.Y += offset.Y;
                
                _dragStartPoint = currentPoint;
                
                // Update connected edges
                if (DataContext is NetworkGraphViewModel viewModel)
                {
                    viewModel.UpdateNodeConnections(_draggedNode);
                }
                
                e.Handled = true;
            }
        }

        private void Node_MouseLeftButtonUp(object sender, MouseButtonEventArgs e)
        {
            if (_draggedNode != null)
            {
                var element = sender as FrameworkElement;
                element?.ReleaseMouseCapture();
                _draggedNode = null;
                e.Handled = true;
            }
        }

        private void Node_MouseEnter(object sender, MouseEventArgs e)
        {
            var element = sender as FrameworkElement;
            if (element?.DataContext is GraphNodeViewModel node)
            {
                // Highlight connected nodes and edges
                if (DataContext is NetworkGraphViewModel viewModel)
                {
                    viewModel.HighlightConnections(node, true);
                }
            }
        }

        private void Node_MouseLeave(object sender, MouseEventArgs e)
        {
            var element = sender as FrameworkElement;
            if (element?.DataContext is GraphNodeViewModel node)
            {
                // Remove highlight from connected nodes and edges
                if (DataContext is NetworkGraphViewModel viewModel)
                {
                    viewModel.HighlightConnections(node, false);
                }
            }
        }
    }
}