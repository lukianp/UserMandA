using System;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Input;
using System.Windows.Media;
using MandADiscoverySuite.ViewModels;

namespace MandADiscoverySuite.Controls
{
    /// <summary>
    /// Interaction logic for ZoomPanControl.xaml
    /// </summary>
    public partial class ZoomPanControl : UserControl
    {
        private ZoomPanViewModel _viewModel;
        private bool _isPanning;
        private Point _lastPanPoint;
        private bool _isZoomRectangle;
        private Point _zoomRectStartPoint;

        public ZoomPanControl()
        {
            InitializeComponent();
            _viewModel = new ZoomPanViewModel();
            DataContext = _viewModel;
            
            // Set up keyboard shortcuts
            this.KeyDown += ZoomPanControl_KeyDown;
            this.Focusable = true;
        }

        #region Event Handlers

        private void MainScrollViewer_ScrollChanged(object sender, ScrollChangedEventArgs e)
        {
            _viewModel?.UpdateViewport(
                e.HorizontalOffset, 
                e.VerticalOffset, 
                e.ViewportWidth, 
                e.ViewportHeight);
        }

        private void MainScrollViewer_PreviewMouseWheel(object sender, MouseWheelEventArgs e)
        {
            if (Keyboard.Modifiers == ModifierKeys.Control)
            {
                // Zoom with Ctrl+Mouse Wheel
                var delta = e.Delta > 0 ? 1.1 : 0.9;
                var mousePosition = e.GetPosition(MainCanvas);
                
                _viewModel?.ZoomAt(mousePosition, delta);
                e.Handled = true;
            }
        }

        private void Canvas_MouseLeftButtonDown(object sender, MouseButtonEventArgs e)
        {
            var canvas = sender as Canvas;
            if (canvas == null) return;

            canvas.CaptureMouse();
            _lastPanPoint = e.GetPosition(canvas);

            if (Keyboard.Modifiers == ModifierKeys.Control)
            {
                // Start zoom rectangle
                _isZoomRectangle = true;
                _zoomRectStartPoint = _lastPanPoint;
                ZoomRectangle.Visibility = Visibility.Visible;
            }
            else
            {
                // Start panning
                _isPanning = true;
                canvas.Cursor = Cursors.Hand;
            }
        }

        private void Canvas_MouseMove(object sender, MouseEventArgs e)
        {
            var canvas = sender as Canvas;
            if (canvas == null) return;

            var currentPoint = e.GetPosition(canvas);
            
            // Update mouse position in view model
            _viewModel?.UpdateMousePosition(currentPoint);

            if (_isZoomRectangle && e.LeftButton == MouseButtonState.Pressed)
            {
                // Update zoom rectangle
                UpdateZoomRectangle(_zoomRectStartPoint, currentPoint);
            }
            else if (_isPanning && e.LeftButton == MouseButtonState.Pressed)
            {
                // Pan the view
                var deltaX = currentPoint.X - _lastPanPoint.X;
                var deltaY = currentPoint.Y - _lastPanPoint.Y;
                
                _viewModel?.Pan(-deltaX, -deltaY);
                _lastPanPoint = currentPoint;
            }
        }

        private void Canvas_MouseLeftButtonUp(object sender, MouseButtonEventArgs e)
        {
            var canvas = sender as Canvas;
            if (canvas == null) return;

            canvas.ReleaseMouseCapture();
            canvas.Cursor = Cursors.Arrow;

            if (_isZoomRectangle)
            {
                // Zoom to rectangle
                var endPoint = e.GetPosition(canvas);
                _viewModel?.ZoomToRectangle(_zoomRectStartPoint, endPoint);
                
                ZoomRectangle.Visibility = Visibility.Collapsed;
                _isZoomRectangle = false;
            }

            _isPanning = false;
        }

        private void ZoomPanControl_KeyDown(object sender, KeyEventArgs e)
        {
            switch (e.Key)
            {
                case Key.Add:
                case Key.OemPlus:
                    if (Keyboard.Modifiers == ModifierKeys.Control)
                    {
                        _viewModel?.ZoomIn();
                        e.Handled = true;
                    }
                    break;

                case Key.Subtract:
                case Key.OemMinus:
                    if (Keyboard.Modifiers == ModifierKeys.Control)
                    {
                        _viewModel?.ZoomOut();
                        e.Handled = true;
                    }
                    break;

                case Key.D0:
                    if (Keyboard.Modifiers == ModifierKeys.Control)
                    {
                        _viewModel?.ActualSize();
                        e.Handled = true;
                    }
                    break;

                case Key.F:
                    if (Keyboard.Modifiers == ModifierKeys.Control)
                    {
                        _viewModel?.FitToWindow();
                        e.Handled = true;
                    }
                    break;

                case Key.Home:
                    _viewModel?.CenterView();
                    e.Handled = true;
                    break;

                case Key.Up:
                    _viewModel?.Pan(0, -50);
                    e.Handled = true;
                    break;

                case Key.Down:
                    _viewModel?.Pan(0, 50);
                    e.Handled = true;
                    break;

                case Key.Left:
                    _viewModel?.Pan(-50, 0);
                    e.Handled = true;
                    break;

                case Key.Right:
                    _viewModel?.Pan(50, 0);
                    e.Handled = true;
                    break;
            }
        }

        #endregion

        #region Private Methods

        private void UpdateZoomRectangle(Point startPoint, Point endPoint)
        {
            var left = Math.Min(startPoint.X, endPoint.X);
            var top = Math.Min(startPoint.Y, endPoint.Y);
            var width = Math.Abs(endPoint.X - startPoint.X);
            var height = Math.Abs(endPoint.Y - startPoint.Y);

            Canvas.SetLeft(ZoomRectangle, left);
            Canvas.SetTop(ZoomRectangle, top);
            ZoomRectangle.Width = width;
            ZoomRectangle.Height = height;
        }

        #endregion

        #region Public Methods

        /// <summary>
        /// Sets the zoomable content
        /// </summary>
        public void SetContent(UIElement content)
        {
            _viewModel?.SetContent(content);
        }

        /// <summary>
        /// Gets the current zoom level
        /// </summary>
        public double GetZoomLevel()
        {
            return _viewModel?.ZoomLevel ?? 1.0;
        }

        /// <summary>
        /// Sets the zoom level
        /// </summary>
        public void SetZoomLevel(double zoomLevel)
        {
            if (_viewModel != null)
            {
                _viewModel.ZoomLevel = zoomLevel;
            }
        }

        /// <summary>
        /// Zooms to fit the content in the available space
        /// </summary>
        public void ZoomToFit()
        {
            _viewModel?.FitToWindow();
        }

        /// <summary>
        /// Centers the view on the content
        /// </summary>
        public void CenterView()
        {
            _viewModel?.CenterView();
        }

        #endregion
    }
}