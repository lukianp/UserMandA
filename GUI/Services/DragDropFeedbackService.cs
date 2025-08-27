using System;
using System.Collections.Generic;
using System.Media;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Controls.Primitives;
using System.Windows.Documents;
using System.Windows.Input;
using System.Windows.Media;
using System.Windows.Media.Animation;
using System.Windows.Media.Effects;
using System.Windows.Shapes;

namespace MandADiscoverySuite.Services
{
    /// <summary>
    /// Service for providing visual feedback during drag and drop operations
    /// </summary>
    public class DragDropFeedbackService
    {
        private static DragDropFeedbackService _instance;
        private readonly Dictionary<FrameworkElement, DragDropState> _dragStates;
        private DragGhostAdorner _currentGhostAdorner;
        private DropZoneIndicator _dropZoneIndicator;
        private Popup _dragPreviewPopup;

        private DragDropFeedbackService()
        {
            _dragStates = new Dictionary<FrameworkElement, DragDropState>();
        }

        public static DragDropFeedbackService Instance => _instance ??= new DragDropFeedbackService();

        #region Public Methods

        /// <summary>
        /// Enables drag-drop feedback for an element
        /// </summary>
        public void EnableDragDropFeedback(FrameworkElement element, DragDropOptions options = null)
        {
            options ??= new DragDropOptions();

            if (_dragStates.ContainsKey(element))
            {
                DisableDragDropFeedback(element);
            }

            var state = new DragDropState
            {
                Element = element,
                Options = options,
                OriginalBackground = GetElementBackground(element),
                OriginalBorderBrush = GetElementBorderBrush(element),
                OriginalEffect = element.Effect
            };

            _dragStates[element] = state;

            // Attach event handlers
            element.MouseEnter += OnDragElementMouseEnter;
            element.MouseLeave += OnDragElementMouseLeave;
            element.PreviewMouseLeftButtonDown += OnDragElementMouseDown;
            element.PreviewMouseMove += OnDragElementMouseMove;
            element.PreviewMouseLeftButtonUp += OnDragElementMouseUp;

            if (options.ShowHoverEffect)
            {
                element.MouseEnter += OnDragElementHover;
                element.MouseLeave += OnDragElementUnhover;
            }
        }

        /// <summary>
        /// Disables drag-drop feedback for an element
        /// </summary>
        public void DisableDragDropFeedback(FrameworkElement element)
        {
            if (!_dragStates.ContainsKey(element))
                return;

            // Remove event handlers
            element.MouseEnter -= OnDragElementMouseEnter;
            element.MouseLeave -= OnDragElementMouseLeave;
            element.PreviewMouseLeftButtonDown -= OnDragElementMouseDown;
            element.PreviewMouseMove -= OnDragElementMouseMove;
            element.PreviewMouseLeftButtonUp -= OnDragElementMouseUp;
            element.MouseEnter -= OnDragElementHover;
            element.MouseLeave -= OnDragElementUnhover;

            // Restore original state
            var state = _dragStates[element];
            RestoreOriginalState(element, state);

            _dragStates.Remove(element);
        }

        /// <summary>
        /// Sets up a drop zone with visual feedback
        /// </summary>
        public void SetupDropZone(FrameworkElement element, DropZoneOptions options = null)
        {
            options ??= new DropZoneOptions();

            element.AllowDrop = true;
            element.DragEnter += (s, e) => OnDropZoneEnter(element, e, options);
            element.DragLeave += (s, e) => OnDropZoneLeave(element, e, options);
            element.DragOver += (s, e) => OnDropZoneOver(element, e, options);
            element.Drop += (s, e) => OnDropZoneDrop(element, e, options);
        }

        /// <summary>
        /// Shows a drag ghost for the specified element
        /// </summary>
        public void ShowDragGhost(FrameworkElement element, Point mousePosition)
        {
            HideDragGhost();

            if (_dragStates.TryGetValue(element, out var state))
            {
                _currentGhostAdorner = new DragGhostAdorner(element, state.Options.GhostOpacity);
                
                var adornerLayer = AdornerLayer.GetAdornerLayer(element);
                adornerLayer?.Add(_currentGhostAdorner);

                // Update ghost position
                _currentGhostAdorner.UpdatePosition(mousePosition);
            }
        }

        /// <summary>
        /// Hides the current drag ghost
        /// </summary>
        public void HideDragGhost()
        {
            if (_currentGhostAdorner != null)
            {
                var adornerLayer = AdornerLayer.GetAdornerLayer(_currentGhostAdorner.AdornedElement);
                adornerLayer?.Remove(_currentGhostAdorner);
                _currentGhostAdorner = null;
            }
        }

        /// <summary>
        /// Updates the ghost position during drag
        /// </summary>
        public void UpdateGhostPosition(Point mousePosition)
        {
            _currentGhostAdorner?.UpdatePosition(mousePosition);
        }

        /// <summary>
        /// Shows drop zone indicators
        /// </summary>
        public void ShowDropZoneIndicators(IEnumerable<FrameworkElement> dropZones)
        {
            foreach (var zone in dropZones)
            {
                HighlightDropZone(zone, true);
            }
        }

        /// <summary>
        /// Hides all drop zone indicators
        /// </summary>
        public void HideDropZoneIndicators()
        {
            foreach (var state in _dragStates.Values)
            {
                if (state.IsDropZoneHighlighted)
                {
                    HighlightDropZone(state.Element, false);
                    state.IsDropZoneHighlighted = false;
                }
            }
        }

        /// <summary>
        /// Provides haptic feedback for drag operations
        /// </summary>
        public void ProvideHapticFeedback(HapticFeedbackType feedbackType)
        {
            switch (feedbackType)
            {
                case HapticFeedbackType.DragStart:
                    SystemSounds.Asterisk.Play();
                    break;
                case HapticFeedbackType.ValidDrop:
                    SystemSounds.Exclamation.Play();
                    break;
                case HapticFeedbackType.InvalidDrop:
                    SystemSounds.Beep.Play();
                    break;
                case HapticFeedbackType.DropComplete:
                    SystemSounds.Question.Play();
                    break;
            }
        }

        #endregion

        #region Private Methods

        private void OnDragElementMouseEnter(object sender, MouseEventArgs e)
        {
            if (sender is FrameworkElement element && _dragStates.TryGetValue(element, out var state))
            {
                if (state.Options.ShowHoverEffect)
                {
                    ApplyHoverEffect(element, state);
                }
            }
        }

        private void OnDragElementMouseLeave(object sender, MouseEventArgs e)
        {
            if (sender is FrameworkElement element && _dragStates.TryGetValue(element, out var state))
            {
                if (!state.IsDragging)
                {
                    RemoveHoverEffect(element, state);
                }
            }
        }

        private void OnDragElementHover(object sender, MouseEventArgs e)
        {
            if (sender is FrameworkElement element && _dragStates.TryGetValue(element, out var state))
            {
                ApplyHoverEffect(element, state);
            }
        }

        private void OnDragElementUnhover(object sender, MouseEventArgs e)
        {
            if (sender is FrameworkElement element && _dragStates.TryGetValue(element, out var state))
            {
                if (!state.IsDragging)
                {
                    RemoveHoverEffect(element, state);
                }
            }
        }

        private void OnDragElementMouseDown(object sender, MouseButtonEventArgs e)
        {
            if (sender is FrameworkElement element && _dragStates.TryGetValue(element, out var state))
            {
                state.DragStartPoint = e.GetPosition(element);
                state.IsMouseDown = true;
                element.CaptureMouse();
            }
        }

        private void OnDragElementMouseMove(object sender, MouseEventArgs e)
        {
            if (sender is FrameworkElement element && _dragStates.TryGetValue(element, out var state))
            {
                if (state.IsMouseDown && !state.IsDragging && e.LeftButton == MouseButtonState.Pressed)
                {
                    var currentPosition = e.GetPosition(element);
                    var distance = (currentPosition - state.DragStartPoint).Length;

                    if (distance > state.Options.DragThreshold)
                    {
                        StartDrag(element, state);
                    }
                }
                else if (state.IsDragging)
                {
                    var mousePos = e.GetPosition(Application.Current.MainWindow);
                    UpdateGhostPosition(mousePos);
                }
            }
        }

        private void OnDragElementMouseUp(object sender, MouseButtonEventArgs e)
        {
            if (sender is FrameworkElement element && _dragStates.TryGetValue(element, out var state))
            {
                if (state.IsDragging)
                {
                    EndDrag(element, state);
                }

                state.IsMouseDown = false;
                element.ReleaseMouseCapture();
            }
        }

        private void StartDrag(FrameworkElement element, DragDropState state)
        {
            state.IsDragging = true;
            
            // Apply drag visual feedback
            ApplyDragEffect(element, state);
            
            // Show drag ghost
            if (state.Options.ShowGhost)
            {
                var mousePos = Mouse.GetPosition(Application.Current.MainWindow);
                ShowDragGhost(element, mousePos);
            }

            // Provide haptic feedback
            if (state.Options.EnableHapticFeedback)
            {
                ProvideHapticFeedback(HapticFeedbackType.DragStart);
            }

            // Start actual drag-drop operation
            var data = new DataObject();
            data.SetData(typeof(FrameworkElement), element);

            try
            {
                DragDrop.DoDragDrop(element, data, DragDropEffects.Move);
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Drag drop error: {ex.Message}");
            }
        }

        private void EndDrag(FrameworkElement element, DragDropState state)
        {
            state.IsDragging = false;
            
            // Hide drag ghost
            HideDragGhost();
            
            // Remove drag effects
            RemoveDragEffect(element, state);
            
            // Hide drop zone indicators
            HideDropZoneIndicators();

            // Provide completion feedback
            if (state.Options.EnableHapticFeedback)
            {
                ProvideHapticFeedback(HapticFeedbackType.DropComplete);
            }
        }

        private void ApplyHoverEffect(FrameworkElement element, DragDropState state)
        {
            if (state.Options.HoverEffect == HoverEffectType.Highlight)
            {
                SetElementBackground(element, state.Options.HoverBrush);
            }
            else if (state.Options.HoverEffect == HoverEffectType.Glow)
            {
                element.Effect = new DropShadowEffect
                {
                    Color = state.Options.GlowColor,
                    BlurRadius = 10,
                    ShadowDepth = 0,
                    Opacity = 0.8
                };
            }
            else if (state.Options.HoverEffect == HoverEffectType.Scale)
            {
                var scaleTransform = new ScaleTransform(1.05, 1.05);
                element.RenderTransform = scaleTransform;
                element.RenderTransformOrigin = new Point(0.5, 0.5);
            }
        }

        private void RemoveHoverEffect(FrameworkElement element, DragDropState state)
        {
            SetElementBackground(element, state.OriginalBackground);
            element.Effect = state.OriginalEffect;
            element.RenderTransform = null;
        }

        private void ApplyDragEffect(FrameworkElement element, DragDropState state)
        {
            // Reduce opacity during drag
            element.Opacity = state.Options.DragOpacity;
            
            // Add drag effect
            if (state.Options.DragEffect == DragEffectType.Blur)
            {
                element.Effect = new BlurEffect { Radius = 3 };
            }
            else if (state.Options.DragEffect == DragEffectType.Glow)
            {
                element.Effect = new DropShadowEffect
                {
                    Color = state.Options.DragGlowColor,
                    BlurRadius = 15,
                    ShadowDepth = 0,
                    Opacity = 1.0
                };
            }
        }

        private void RemoveDragEffect(FrameworkElement element, DragDropState state)
        {
            element.Opacity = 1.0;
            element.Effect = state.OriginalEffect;
        }

        private void OnDropZoneEnter(FrameworkElement dropZone, DragEventArgs e, DropZoneOptions options)
        {
            HighlightDropZone(dropZone, true);
            
            if (options.ShowDropIndicator)
            {
                ShowDropIndicator(dropZone);
            }

            e.Effects = DragDropEffects.Move;
            e.Handled = true;
        }

        private void OnDropZoneLeave(FrameworkElement dropZone, DragEventArgs e, DropZoneOptions options)
        {
            HighlightDropZone(dropZone, false);
            HideDropIndicator();
            e.Handled = true;
        }

        private void OnDropZoneOver(FrameworkElement dropZone, DragEventArgs e, DropZoneOptions options)
        {
            e.Effects = DragDropEffects.Move;
            e.Handled = true;
        }

        private void OnDropZoneDrop(FrameworkElement dropZone, DragEventArgs e, DropZoneOptions options)
        {
            HighlightDropZone(dropZone, false);
            HideDropIndicator();

            if (options.EnableHapticFeedback)
            {
                ProvideHapticFeedback(HapticFeedbackType.ValidDrop);
            }

            // Add drop animation
            AnimateDropSuccess(dropZone);

            e.Handled = true;
        }

        private void HighlightDropZone(FrameworkElement element, bool highlight)
        {
            if (highlight)
            {
                SetElementBorderBrush(element, Brushes.Blue);
                SetElementBackground(element, new SolidColorBrush(Color.FromArgb(50, 0, 120, 215)));
            }
            else
            {
                if (_dragStates.TryGetValue(element, out var state))
                {
                    SetElementBorderBrush(element, state.OriginalBorderBrush);
                    SetElementBackground(element, state.OriginalBackground);
                }
            }
        }

        private void ShowDropIndicator(FrameworkElement dropZone)
        {
            _dropZoneIndicator = new DropZoneIndicator(dropZone);
            
            var adornerLayer = AdornerLayer.GetAdornerLayer(dropZone);
            if (adornerLayer != null)
            {
                adornerLayer.Add(_dropZoneIndicator);
            }
        }

        private void HideDropIndicator()
        {
            if (_dropZoneIndicator != null)
            {
                var adornerLayer = AdornerLayer.GetAdornerLayer(_dropZoneIndicator.AdornedElement);
                adornerLayer?.Remove(_dropZoneIndicator);
                _dropZoneIndicator = null;
            }
        }

        private void AnimateDropSuccess(FrameworkElement element)
        {
            var scaleX = new DoubleAnimation(1.0, 1.1, TimeSpan.FromMilliseconds(150))
            {
                AutoReverse = true
            };
            
            var scaleY = new DoubleAnimation(1.0, 1.1, TimeSpan.FromMilliseconds(150))
            {
                AutoReverse = true
            };

            var transform = new ScaleTransform();
            element.RenderTransform = transform;
            element.RenderTransformOrigin = new Point(0.5, 0.5);

            transform.BeginAnimation(ScaleTransform.ScaleXProperty, scaleX);
            transform.BeginAnimation(ScaleTransform.ScaleYProperty, scaleY);
        }

        private Brush GetElementBackground(FrameworkElement element)
        {
            return element switch
            {
                Control control => control.Background,
                Panel panel => panel.Background,
                _ => null
            };
        }

        private void SetElementBackground(FrameworkElement element, Brush brush)
        {
            switch (element)
            {
                case Control control:
                    control.Background = brush;
                    break;
                case Panel panel:
                    panel.Background = brush;
                    break;
            }
        }

        private Brush GetElementBorderBrush(FrameworkElement element)
        {
            return element switch
            {
                Control control => control.BorderBrush,
                _ => null
            };
        }

        private void SetElementBorderBrush(FrameworkElement element, Brush brush)
        {
            if (element is Control control)
            {
                control.BorderBrush = brush;
            }
        }

        private void RestoreOriginalState(FrameworkElement element, DragDropState state)
        {
            SetElementBackground(element, state.OriginalBackground);
            SetElementBorderBrush(element, state.OriginalBorderBrush);
            element.Effect = state.OriginalEffect;
            element.Opacity = 1.0;
            element.RenderTransform = null;
        }

        #endregion
    }

    /// <summary>
    /// Options for drag-drop behavior
    /// </summary>
    public class DragDropOptions
    {
        public bool ShowHoverEffect { get; set; } = true;
        public bool ShowGhost { get; set; } = true;
        public bool EnableHapticFeedback { get; set; } = true;
        public double DragThreshold { get; set; } = 5.0;
        public double DragOpacity { get; set; } = 0.7;
        public double GhostOpacity { get; set; } = 0.6;
        public HoverEffectType HoverEffect { get; set; } = HoverEffectType.Highlight;
        public DragEffectType DragEffect { get; set; } = DragEffectType.Blur;
        public Brush HoverBrush { get; set; } = new SolidColorBrush(Color.FromArgb(50, 0, 120, 215));
        public Color GlowColor { get; set; } = Colors.LightBlue;
        public Color DragGlowColor { get; set; } = Colors.Orange;
    }

    /// <summary>
    /// Options for drop zones
    /// </summary>
    public class DropZoneOptions
    {
        public bool ShowDropIndicator { get; set; } = true;
        public bool EnableHapticFeedback { get; set; } = true;
        public Brush DropHighlightBrush { get; set; } = new SolidColorBrush(Color.FromArgb(100, 0, 255, 0));
        public Brush DropBorderBrush { get; set; } = Brushes.Green;
    }

    /// <summary>
    /// State information for drag-drop operations
    /// </summary>
    internal class DragDropState
    {
        public FrameworkElement Element { get; set; }
        public DragDropOptions Options { get; set; }
        public Point DragStartPoint { get; set; }
        public bool IsMouseDown { get; set; }
        public bool IsDragging { get; set; }
        public bool IsDropZoneHighlighted { get; set; }
        public Brush OriginalBackground { get; set; }
        public Brush OriginalBorderBrush { get; set; }
        public Effect OriginalEffect { get; set; }
    }

    /// <summary>
    /// Types of hover effects
    /// </summary>
    public enum HoverEffectType
    {
        None,
        Highlight,
        Glow,
        Scale
    }

    /// <summary>
    /// Types of drag effects
    /// </summary>
    public enum DragEffectType
    {
        None,
        Blur,
        Glow,
        Fade
    }

    /// <summary>
    /// Types of haptic feedback
    /// </summary>
    public enum HapticFeedbackType
    {
        DragStart,
        ValidDrop,
        InvalidDrop,
        DropComplete
    }

    /// <summary>
    /// Adorner for drag ghost visualization
    /// </summary>
    internal class DragGhostAdorner : Adorner
    {
        private readonly VisualBrush _visualBrush;
        private Point _position;

        public DragGhostAdorner(UIElement adornedElement, double opacity) : base(adornedElement)
        {
            _visualBrush = new VisualBrush(adornedElement) { Opacity = opacity };
            IsHitTestVisible = false;
        }

        public void UpdatePosition(Point position)
        {
            _position = position;
            InvalidateVisual();
        }

        protected override void OnRender(DrawingContext drawingContext)
        {
            var adornedElementRect = new Rect(AdornedElement.RenderSize);
            drawingContext.DrawRectangle(_visualBrush, null, new Rect(_position, adornedElementRect.Size));
        }
    }

    /// <summary>
    /// Adorner for drop zone indicators
    /// </summary>
    internal class DropZoneIndicator : Adorner
    {
        public DropZoneIndicator(UIElement adornedElement) : base(adornedElement)
        {
            IsHitTestVisible = false;
        }

        protected override void OnRender(DrawingContext drawingContext)
        {
            var adornedElementRect = new Rect(AdornedElement.RenderSize);
            var pen = new Pen(Brushes.Blue, 2) { DashStyle = DashStyles.Dash };
            
            drawingContext.DrawRectangle(
                new SolidColorBrush(Color.FromArgb(30, 0, 0, 255)), 
                pen, 
                adornedElementRect);
        }
    }
}