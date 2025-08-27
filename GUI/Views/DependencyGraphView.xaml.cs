using System;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Input;
using System.Windows.Media;
using System.Windows.Shapes;
using MandADiscoverySuite.ViewModels;

namespace MandADiscoverySuite.Views
{
    /// <summary>
    /// Interaction logic for DependencyGraphView.xaml
    /// </summary>
    public partial class DependencyGraphView : UserControl
    {
        private Point _lastMousePosition;
        private bool _isPanning;
        private bool _isDraggingNode;
        private FrameworkElement _draggedNode;
        private Point _clickOffset;

        public DependencyGraphView()
        {
            InitializeComponent();
            
            // Set up mouse event handlers for canvas interaction
            if (GraphCanvas != null)
            {
                GraphCanvas.MouseLeftButtonDown += OnCanvasMouseLeftButtonDown;
                GraphCanvas.MouseLeftButtonUp += OnCanvasMouseLeftButtonUp;
                GraphCanvas.MouseMove += OnCanvasMouseMove;
                GraphCanvas.MouseWheel += OnCanvasMouseWheel;
                GraphCanvas.MouseRightButtonDown += OnCanvasMouseRightButtonDown;
            }
        }

        private void OnCanvasMouseLeftButtonDown(object sender, MouseButtonEventArgs e)
        {
            var canvas = sender as Canvas;
            if (canvas == null) return;

            _lastMousePosition = e.GetPosition(canvas);
            
            // Check if we clicked on a node
            var hitTest = VisualTreeHelper.HitTest(canvas, _lastMousePosition);
            if (hitTest != null)
            {
                var element = GetNodeElement(hitTest.VisualHit);
                if (element != null)
                {
                    // Start dragging node
                    _isDraggingNode = true;
                    _draggedNode = element;
                    _clickOffset = e.GetPosition(element);
                    canvas.CaptureMouse();
                    e.Handled = true;
                    return;
                }
            }

            // Otherwise start panning
            if (Keyboard.Modifiers == ModifierKeys.Control)
            {
                _isPanning = true;
                canvas.CaptureMouse();
                canvas.Cursor = Cursors.Hand;
                e.Handled = true;
            }
        }

        private void OnCanvasMouseLeftButtonUp(object sender, MouseButtonEventArgs e)
        {
            var canvas = sender as Canvas;
            if (canvas == null) return;

            if (_isDraggingNode)
            {
                _isDraggingNode = false;
                _draggedNode = null;
            }

            if (_isPanning)
            {
                _isPanning = false;
                canvas.Cursor = Cursors.Arrow;
            }

            canvas.ReleaseMouseCapture();
        }

        private void OnCanvasMouseMove(object sender, MouseEventArgs e)
        {
            var canvas = sender as Canvas;
            if (canvas == null) return;

            var currentPosition = e.GetPosition(canvas);

            if (_isDraggingNode && _draggedNode != null)
            {
                // Update node position
                var newX = currentPosition.X - _clickOffset.X;
                var newY = currentPosition.Y - _clickOffset.Y;
                
                Canvas.SetLeft(_draggedNode, newX);
                Canvas.SetTop(_draggedNode, newY);
                
                // Update the data model if needed
                var viewModel = DataContext as DependencyGraphViewModel;
                if (viewModel?.SelectedNode != null)
                {
                    viewModel.SelectedNode.Position = new Point(newX, newY);
                }
                
                e.Handled = true;
            }
            else if (_isPanning && e.LeftButton == MouseButtonState.Pressed)
            {
                // Pan the view
                var deltaX = currentPosition.X - _lastMousePosition.X;
                var deltaY = currentPosition.Y - _lastMousePosition.Y;
                
                var viewModel = DataContext as DependencyGraphViewModel;
                if (viewModel != null)
                {
                    var newOffset = new Point(
                        viewModel.PanOffset.X + deltaX,
                        viewModel.PanOffset.Y + deltaY
                    );
                    viewModel.PanOffset = newOffset;
                }
                
                _lastMousePosition = currentPosition;
                e.Handled = true;
            }
        }

        private void OnCanvasMouseWheel(object sender, MouseWheelEventArgs e)
        {
            if (Keyboard.Modifiers == ModifierKeys.Control)
            {
                var viewModel = DataContext as DependencyGraphViewModel;
                if (viewModel != null)
                {
                    var scaleFactor = e.Delta > 0 ? 1.1 : 0.9;
                    viewModel.ZoomLevel *= scaleFactor;
                }
                e.Handled = true;
            }
        }

        private void OnCanvasMouseRightButtonDown(object sender, MouseButtonEventArgs e)
        {
            // Context menu for adding nodes/edges
            var canvas = sender as Canvas;
            if (canvas == null) return;

            var position = e.GetPosition(canvas);
            var contextMenu = new ContextMenu();

            var addNodeItem = new MenuItem { Header = "Add Node Here" };
            addNodeItem.Click += (s, args) =>
            {
                var viewModel = DataContext as DependencyGraphViewModel;
                if (viewModel?.AddNodeCommand?.CanExecute(null) == true)
                {
                    // Would need to extend the command to accept position parameter
                    viewModel.AddNodeCommand.Execute(null);
                }
            };
            contextMenu.Items.Add(addNodeItem);

            if (DataContext is DependencyGraphViewModel vm && vm.SelectedNode != null)
            {
                var deleteNodeItem = new MenuItem { Header = "Delete Selected Node" };
                deleteNodeItem.Click += (s, args) =>
                {
                    if (vm.DeleteNodeCommand?.CanExecute(null) == true)
                    {
                        vm.DeleteNodeCommand.Execute(null);
                    }
                };
                contextMenu.Items.Add(deleteNodeItem);
            }

            contextMenu.IsOpen = true;
            e.Handled = true;
        }

        private FrameworkElement GetNodeElement(DependencyObject obj)
        {
            while (obj != null)
            {
                if (obj is FrameworkElement element && element.DataContext != null)
                {
                    var dataContextType = element.DataContext.GetType();
                    if (dataContextType.Name == "DependencyNode")
                    {
                        return element;
                    }
                }
                obj = VisualTreeHelper.GetParent(obj);
            }
            return null;
        }

        /// <summary>
        /// Draw edge between two nodes
        /// </summary>
        private Line DrawEdge(Point start, Point end, Brush stroke = null, double thickness = 2)
        {
            var line = new Line
            {
                X1 = start.X,
                Y1 = start.Y,
                X2 = end.X,
                Y2 = end.Y,
                Stroke = stroke ?? Brushes.Gray,
                StrokeThickness = thickness
            };
            
            return line;
        }

        /// <summary>
        /// Calculate edge position based on node centers
        /// </summary>
        private Point GetNodeCenter(FrameworkElement nodeElement)
        {
            if (nodeElement == null) return new Point(0, 0);
            
            var x = Canvas.GetLeft(nodeElement) + nodeElement.ActualWidth / 2;
            var y = Canvas.GetTop(nodeElement) + nodeElement.ActualHeight / 2;
            
            return new Point(x, y);
        }
    }
}