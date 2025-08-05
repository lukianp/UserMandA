using System;
using System.Windows;
using System.Windows.Input;
using CommunityToolkit.Mvvm.Input;
using Microsoft.Extensions.Logging;
using MandADiscoverySuite.Services;

namespace MandADiscoverySuite.ViewModels
{
    /// <summary>
    /// ViewModel for zoom and pan functionality
    /// </summary>
    public partial class ZoomPanViewModel : BaseViewModel
    {
        private readonly NotificationService _notificationService;
        
        // Zoom properties
        private double _zoomLevel = 1.0;
        private double _minZoom = 0.1;
        private double _maxZoom = 10.0;
        
        // Canvas properties
        private double _canvasWidth = 2000;
        private double _canvasHeight = 2000;
        private double _contentWidth = 800;
        private double _contentHeight = 600;
        
        // Viewport properties
        private double _viewportX;
        private double _viewportY;
        private double _viewportWidth = 800;
        private double _viewportHeight = 600;
        
        // Display properties
        private bool _showGrid = true;
        private bool _showMinimap = true;
        private Point _mousePosition;
        private object _zoomableContent;

        public ZoomPanViewModel() : base()
        {
            _notificationService = ServiceLocator.GetService<NotificationService>();
            InitializeCommands();
            UpdateCanvasSize();
        }

        #region Properties

        public double ZoomLevel
        {
            get => _zoomLevel;
            set
            {
                var clampedValue = Math.Max(_minZoom, Math.Min(_maxZoom, value));
                if (SetProperty(ref _zoomLevel, clampedValue))
                {
                    UpdateCanvasSize();
                    OnPropertyChanged(nameof(ZoomPercentage));
                }
            }
        }

        public double MinZoom
        {
            get => _minZoom;
            set => SetProperty(ref _minZoom, value);
        }

        public double MaxZoom
        {
            get => _maxZoom;
            set => SetProperty(ref _maxZoom, value);
        }

        public double CanvasWidth
        {
            get => _canvasWidth;
            set => SetProperty(ref _canvasWidth, value);
        }

        public double CanvasHeight
        {
            get => _canvasHeight;
            set => SetProperty(ref _canvasHeight, value);
        }

        public double ContentWidth
        {
            get => _contentWidth;
            set
            {
                if (SetProperty(ref _contentWidth, value))
                {
                    UpdateCanvasSize();
                }
            }
        }

        public double ContentHeight
        {
            get => _contentHeight;
            set
            {
                if (SetProperty(ref _contentHeight, value))
                {
                    UpdateCanvasSize();
                }
            }
        }

        public double ViewportX
        {
            get => _viewportX;
            set => SetProperty(ref _viewportX, value);
        }

        public double ViewportY
        {
            get => _viewportY;
            set => SetProperty(ref _viewportY, value);
        }

        public double ViewportWidth
        {
            get => _viewportWidth;
            set => SetProperty(ref _viewportWidth, value);
        }

        public double ViewportHeight
        {
            get => _viewportHeight;
            set => SetProperty(ref _viewportHeight, value);
        }

        public bool ShowGrid
        {
            get => _showGrid;
            set => SetProperty(ref _showGrid, value);
        }

        public bool ShowMinimap
        {
            get => _showMinimap;
            set => SetProperty(ref _showMinimap, value);
        }

        public Point MousePosition
        {
            get => _mousePosition;
            set => SetProperty(ref _mousePosition, value);
        }

        public object ZoomableContent
        {
            get => _zoomableContent;
            set => SetProperty(ref _zoomableContent, value);
        }

        // Computed properties
        public string ZoomPercentage => $"{ZoomLevel:P0}";
        public string CanvasSize => $"{ContentWidth:F0} × {ContentHeight:F0}";

        #endregion

        #region Commands

        public ICommand ZoomInCommand { get; private set; }
        public ICommand ZoomOutCommand { get; private set; }
        public ICommand FitToWindowCommand { get; private set; }
        public ICommand ActualSizeCommand { get; private set; }
        public ICommand CenterViewCommand { get; private set; }
        public ICommand PanCommand { get; private set; }
        public ICommand ToggleGridCommand { get; private set; }
        public ICommand ToggleMinimapCommand { get; private set; }
        public ICommand ShowZoomOptionsCommand { get; private set; }

        #endregion

        #region Private Methods

        private void InitializeCommands()
        {
            ZoomInCommand = new RelayCommand(ZoomIn);
            ZoomOutCommand = new RelayCommand(ZoomOut);
            FitToWindowCommand = new RelayCommand(FitToWindow);
            ActualSizeCommand = new RelayCommand(ActualSize);
            CenterViewCommand = new RelayCommand(CenterView);
            PanCommand = new RelayCommand<string>(Pan);
            ToggleGridCommand = new RelayCommand(ToggleGrid);
            ToggleMinimapCommand = new RelayCommand(ToggleMinimap);
            ShowZoomOptionsCommand = new RelayCommand(ShowZoomOptions);
        }

        private void UpdateCanvasSize()
        {
            CanvasWidth = ContentWidth * ZoomLevel;
            CanvasHeight = ContentHeight * ZoomLevel;
        }

        #endregion

        #region Public Methods

        public void ZoomIn()
        {
            try
            {
                var newZoom = ZoomLevel * 1.2;
                ZoomLevel = newZoom;
                
                Logger?.LogDebug("Zoomed in to {ZoomLevel:P0}", ZoomLevel);
            }
            catch (Exception ex)
            {
                Logger?.LogError(ex, "Error zooming in");
            }
        }

        public void ZoomOut()
        {
            try
            {
                var newZoom = ZoomLevel / 1.2;
                ZoomLevel = newZoom;
                
                Logger?.LogDebug("Zoomed out to {ZoomLevel:P0}", ZoomLevel);
            }
            catch (Exception ex)
            {
                Logger?.LogError(ex, "Error zooming out");
            }
        }

        public void FitToWindow()
        {
            try
            {
                if (ViewportWidth > 0 && ViewportHeight > 0)
                {
                    var scaleX = ViewportWidth / ContentWidth;
                    var scaleY = ViewportHeight / ContentHeight;
                    var scale = Math.Min(scaleX, scaleY) * 0.9; // 90% to leave some margin
                    
                    ZoomLevel = Math.Max(MinZoom, Math.Min(MaxZoom, scale));
                    
                    _notificationService?.AddInfo(
                        "Fit to Window", 
                        $"Zoomed to {ZoomLevel:P0} to fit content");
                }
                
                Logger?.LogDebug("Fit to window: {ZoomLevel:P0}", ZoomLevel);
            }
            catch (Exception ex)
            {
                Logger?.LogError(ex, "Error fitting to window");
                _notificationService?.AddError(
                    "Zoom Error", 
                    "Unable to fit content to window");
            }
        }

        public void ActualSize()
        {
            try
            {
                ZoomLevel = 1.0;
                
                _notificationService?.AddInfo(
                    "Actual Size", 
                    "Zoomed to 100% (actual size)");
                
                Logger?.LogDebug("Set to actual size (100%)");
            }
            catch (Exception ex)
            {
                Logger?.LogError(ex, "Error setting actual size");
            }
        }

        public void CenterView()
        {
            try
            {
                // This would typically interact with the ScrollViewer to center the view
                _notificationService?.AddInfo(
                    "Centered", 
                    "View centered on content");
                
                Logger?.LogDebug("Centered view");
            }
            catch (Exception ex)
            {
                Logger?.LogError(ex, "Error centering view");
            }
        }

        public void Pan(string direction)
        {
            try
            {
                var panDistance = 50.0;
                
                switch (direction?.ToLower())
                {
                    case "up":
                        Pan(0, -panDistance);
                        break;
                    case "down":
                        Pan(0, panDistance);
                        break;
                    case "left":
                        Pan(-panDistance, 0);
                        break;
                    case "right":
                        Pan(panDistance, 0);
                        break;
                }
            }
            catch (Exception ex)
            {
                Logger?.LogError(ex, "Error panning in direction: {Direction}", direction);
            }
        }

        public void Pan(double deltaX, double deltaY)
        {
            try
            {
                // This would typically interact with the ScrollViewer to pan the view
                ViewportX = Math.Max(0, Math.Min(CanvasWidth - ViewportWidth, ViewportX + deltaX));
                ViewportY = Math.Max(0, Math.Min(CanvasHeight - ViewportHeight, ViewportY + deltaY));
                
                Logger?.LogDebug("Panned by ({DeltaX}, {DeltaY})", deltaX, deltaY);
            }
            catch (Exception ex)
            {
                Logger?.LogError(ex, "Error panning by delta ({DeltaX}, {DeltaY})", deltaX, deltaY);
            }
        }

        public void ZoomAt(Point point, double factor)
        {
            try
            {
                var oldZoom = ZoomLevel;
                var newZoom = ZoomLevel * factor;
                ZoomLevel = newZoom;
                
                // Adjust pan position to zoom at the specified point
                if (ZoomLevel != oldZoom)
                {
                    var zoomFactor = ZoomLevel / oldZoom;
                    var deltaX = point.X * (zoomFactor - 1);
                    var deltaY = point.Y * (zoomFactor - 1);
                    
                    Pan(deltaX, deltaY);
                }
                
                Logger?.LogDebug("Zoomed at point ({X}, {Y}) to {ZoomLevel:P0}", point.X, point.Y, ZoomLevel);
            }
            catch (Exception ex)
            {
                Logger?.LogError(ex, "Error zooming at point ({X}, {Y})", point.X, point.Y);
            }
        }

        public void ZoomToRectangle(Point startPoint, Point endPoint)
        {
            try
            {
                var rectWidth = Math.Abs(endPoint.X - startPoint.X);
                var rectHeight = Math.Abs(endPoint.Y - startPoint.Y);
                
                if (rectWidth > 10 && rectHeight > 10) // Minimum size for zoom rectangle
                {
                    var scaleX = ViewportWidth / rectWidth;
                    var scaleY = ViewportHeight / rectHeight;
                    var scale = Math.Min(scaleX, scaleY);
                    
                    ZoomLevel = Math.Max(MinZoom, Math.Min(MaxZoom, scale));
                    
                    // Pan to center the rectangle
                    var centerX = (startPoint.X + endPoint.X) / 2;
                    var centerY = (startPoint.Y + endPoint.Y) / 2;
                    
                    ViewportX = centerX - ViewportWidth / 2;
                    ViewportY = centerY - ViewportHeight / 2;
                    
                    _notificationService?.AddInfo(
                        "Zoom to Rectangle", 
                        $"Zoomed to {ZoomLevel:P0}");
                }
                
                Logger?.LogDebug("Zoomed to rectangle from ({X1}, {Y1}) to ({X2}, {Y2})", 
                    startPoint.X, startPoint.Y, endPoint.X, endPoint.Y);
            }
            catch (Exception ex)
            {
                Logger?.LogError(ex, "Error zooming to rectangle");
            }
        }

        public void UpdateViewport(double horizontalOffset, double verticalOffset, 
            double viewportWidth, double viewportHeight)
        {
            try
            {
                ViewportX = horizontalOffset;
                ViewportY = verticalOffset;
                ViewportWidth = viewportWidth;
                ViewportHeight = viewportHeight;
            }
            catch (Exception ex)
            {
                Logger?.LogError(ex, "Error updating viewport");
            }
        }

        public void UpdateMousePosition(Point position)
        {
            try
            {
                MousePosition = position;
            }
            catch (Exception ex)
            {
                Logger?.LogError(ex, "Error updating mouse position");
            }
        }

        public void SetContent(object content)
        {
            try
            {
                ZoomableContent = content;
                
                // If content has specific dimensions, update them
                if (content is FrameworkElement element)
                {
                    if (!double.IsNaN(element.Width) && element.Width > 0)
                        ContentWidth = element.Width;
                    if (!double.IsNaN(element.Height) && element.Height > 0)
                        ContentHeight = element.Height;
                }
                
                Logger?.LogDebug("Set zoomable content");
            }
            catch (Exception ex)
            {
                Logger?.LogError(ex, "Error setting content");
            }
        }

        private void ToggleGrid()
        {
            try
            {
                ShowGrid = !ShowGrid;
                
                _notificationService?.AddInfo(
                    "Grid Toggle", 
                    ShowGrid ? "Grid enabled" : "Grid disabled");
                
                Logger?.LogDebug("Toggled grid: {ShowGrid}", ShowGrid);
            }
            catch (Exception ex)
            {
                Logger?.LogError(ex, "Error toggling grid");
            }
        }

        private void ToggleMinimap()
        {
            try
            {
                ShowMinimap = !ShowMinimap;
                
                _notificationService?.AddInfo(
                    "Minimap Toggle", 
                    ShowMinimap ? "Minimap enabled" : "Minimap disabled");
                
                Logger?.LogDebug("Toggled minimap: {ShowMinimap}", ShowMinimap);
            }
            catch (Exception ex)
            {
                Logger?.LogError(ex, "Error toggling minimap");
            }
        }

        private void ShowZoomOptions()
        {
            try
            {
                var options = $"Zoom Level: {ZoomLevel:P0}\n" +
                             $"Range: {MinZoom:P0} - {MaxZoom:P0}\n" +
                             $"Content Size: {ContentWidth:F0} × {ContentHeight:F0}\n" +
                             $"Canvas Size: {CanvasWidth:F0} × {CanvasHeight:F0}\n" +
                             $"Viewport: {ViewportWidth:F0} × {ViewportHeight:F0}";
                
                _notificationService?.AddInfo(
                    "Zoom Information", 
                    options);
                
                Logger?.LogDebug("Showed zoom options");
            }
            catch (Exception ex)
            {
                Logger?.LogError(ex, "Error showing zoom options");
            }
        }

        #endregion
    }
}