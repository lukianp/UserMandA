using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Media;
using System.Windows.Media.Animation;
using System.Windows.Media.Media3D;

namespace MandADiscoverySuite.Services
{
    /// <summary>
    /// Service for managing smooth view transitions with various animation effects
    /// </summary>
    public class ViewTransitionService
    {
        private readonly Dictionary<string, FrameworkElement> _views;
        private readonly Dictionary<TransitionType, Func<FrameworkElement, FrameworkElement, Task>> _transitionAnimations;
        private ContentControl _transitionHost;
        private bool _isTransitioning;

        public ViewTransitionService()
        {
            _views = new Dictionary<string, FrameworkElement>();
            _transitionAnimations = InitializeTransitionAnimations();
        }

        /// <summary>
        /// Sets the host control that will contain the transitioning views
        /// </summary>
        public void SetTransitionHost(ContentControl host)
        {
            _transitionHost = host;
        }

        /// <summary>
        /// Registers a view for transitions
        /// </summary>
        public void RegisterView(string viewName, FrameworkElement view)
        {
            _views[viewName] = view;
        }

        /// <summary>
        /// Transitions to a specified view with animation
        /// </summary>
        public async Task TransitionToViewAsync(string viewName, TransitionType transitionType = TransitionType.FadeInOut, TimeSpan? duration = null)
        {
            if (_isTransitioning || _transitionHost == null || !_views.ContainsKey(viewName))
                return;

            _isTransitioning = true;
            
            try
            {
                var newView = _views[viewName];
                var currentView = _transitionHost.Content as FrameworkElement;

                // Set transition duration
                var transitionDuration = duration ?? TimeSpan.FromMilliseconds(300);
                
                if (currentView != null && currentView != newView)
                {
                    // Perform the transition animation
                    await _transitionAnimations[transitionType](currentView, newView);
                }
                else
                {
                    // No current view, just fade in the new view
                    _transitionHost.Content = newView;
                    await FadeInAsync(newView, transitionDuration);
                }
            }
            finally
            {
                _isTransitioning = false;
            }
        }

        /// <summary>
        /// Creates a slide transition between views
        /// </summary>
        private async Task SlideTransitionAsync(FrameworkElement currentView, FrameworkElement newView, ViewSlideDirection direction = ViewSlideDirection.Left)
        {
            var duration = TimeSpan.FromMilliseconds(400);
            var easing = new CubicEase { EasingMode = EasingMode.EaseInOut };

            // Prepare transforms
            var currentTransform = new TranslateTransform();
            var newTransform = new TranslateTransform();
            
            currentView.RenderTransform = currentTransform;
            newView.RenderTransform = newTransform;

            // Set initial positions
            var slideDistance = _transitionHost.ActualWidth;
            if (slideDistance == 0) slideDistance = 800; // fallback

            switch (direction)
            {
                case ViewSlideDirection.Left:
                    newTransform.X = slideDistance;
                    break;
                case ViewSlideDirection.Right:
                    newTransform.X = -slideDistance;
                    break;
                case ViewSlideDirection.Up:
                    newTransform.Y = _transitionHost.ActualHeight > 0 ? _transitionHost.ActualHeight : 600;
                    break;
                case ViewSlideDirection.Down:
                    newTransform.Y = -(_transitionHost.ActualHeight > 0 ? _transitionHost.ActualHeight : 600);
                    break;
            }

            // Add new view to host
            var grid = new Grid();
            grid.Children.Add(currentView);
            grid.Children.Add(newView);
            _transitionHost.Content = grid;

            // Create animations
            var currentAnimation = direction == ViewSlideDirection.Up || direction == ViewSlideDirection.Down
                ? new DoubleAnimation(0, -newTransform.Y, duration) { EasingFunction = easing }
                : new DoubleAnimation(0, -newTransform.X, duration) { EasingFunction = easing };

            var newAnimation = direction == ViewSlideDirection.Up || direction == ViewSlideDirection.Down
                ? new DoubleAnimation(newTransform.Y, 0, duration) { EasingFunction = easing }
                : new DoubleAnimation(newTransform.X, 0, duration) { EasingFunction = easing };

            // Set animation targets
            var currentProperty = direction == ViewSlideDirection.Up || direction == ViewSlideDirection.Down
                ? TranslateTransform.YProperty : TranslateTransform.XProperty;
            
            currentTransform.BeginAnimation(currentProperty, currentAnimation);
            newTransform.BeginAnimation(currentProperty, newAnimation);

            // Wait for animation to complete
            await Task.Delay(duration);

            // Clean up
            _transitionHost.Content = newView;
            newView.RenderTransform = null;
        }

        /// <summary>
        /// Creates a fade transition between views
        /// </summary>
        private async Task FadeTransitionAsync(FrameworkElement currentView, FrameworkElement newView)
        {
            var duration = TimeSpan.FromMilliseconds(300);
            var easing = new QuadraticEase { EasingMode = EasingMode.EaseInOut };

            // Set initial opacity
            newView.Opacity = 0;

            // Add new view to host
            var grid = new Grid();
            grid.Children.Add(currentView);
            grid.Children.Add(newView);
            _transitionHost.Content = grid;

            // Create animations
            var fadeOutAnimation = new DoubleAnimation(1, 0, duration) { EasingFunction = easing };
            var fadeInAnimation = new DoubleAnimation(0, 1, duration) { EasingFunction = easing };

            currentView.BeginAnimation(FrameworkElement.OpacityProperty, fadeOutAnimation);
            newView.BeginAnimation(FrameworkElement.OpacityProperty, fadeInAnimation);

            // Wait for animation to complete
            await Task.Delay(duration);

            // Clean up
            _transitionHost.Content = newView;
            newView.Opacity = 1;
        }

        /// <summary>
        /// Creates a scale transition between views
        /// </summary>
        private async Task ScaleTransitionAsync(FrameworkElement currentView, FrameworkElement newView)
        {
            var duration = TimeSpan.FromMilliseconds(350);
            var easing = new BackEase { EasingMode = EasingMode.EaseOut, Amplitude = 0.3 };

            // Prepare transforms
            var currentTransform = new ScaleTransform { CenterX = 0.5, CenterY = 0.5 };
            var newTransform = new ScaleTransform { ScaleX = 0.8, ScaleY = 0.8, CenterX = 0.5, CenterY = 0.5 };
            
            currentView.RenderTransform = currentTransform;
            newView.RenderTransform = newTransform;
            currentView.RenderTransformOrigin = new Point(0.5, 0.5);
            newView.RenderTransformOrigin = new Point(0.5, 0.5);
            newView.Opacity = 0;

            // Add new view to host
            var grid = new Grid();
            grid.Children.Add(currentView);
            grid.Children.Add(newView);
            _transitionHost.Content = grid;

            // Create animations
            var scaleOutX = new DoubleAnimation(1, 1.1, duration) { EasingFunction = easing };
            var scaleOutY = new DoubleAnimation(1, 1.1, duration) { EasingFunction = easing };
            var fadeOut = new DoubleAnimation(1, 0, duration) { EasingFunction = easing };

            var scaleInX = new DoubleAnimation(0.8, 1, duration) { EasingFunction = easing };
            var scaleInY = new DoubleAnimation(0.8, 1, duration) { EasingFunction = easing };
            var fadeIn = new DoubleAnimation(0, 1, duration) { EasingFunction = easing };

            currentTransform.BeginAnimation(ScaleTransform.ScaleXProperty, scaleOutX);
            currentTransform.BeginAnimation(ScaleTransform.ScaleYProperty, scaleOutY);
            currentView.BeginAnimation(FrameworkElement.OpacityProperty, fadeOut);

            newTransform.BeginAnimation(ScaleTransform.ScaleXProperty, scaleInX);
            newTransform.BeginAnimation(ScaleTransform.ScaleYProperty, scaleInY);
            newView.BeginAnimation(FrameworkElement.OpacityProperty, fadeIn);

            // Wait for animation to complete
            await Task.Delay(duration);

            // Clean up
            _transitionHost.Content = newView;
            newView.RenderTransform = null;
            newView.Opacity = 1;
        }

        /// <summary>
        /// Creates a flip transition between views
        /// </summary>
        private async Task FlipTransitionAsync(FrameworkElement currentView, FrameworkElement newView)
        {
            var duration = TimeSpan.FromMilliseconds(600);
            var easing = new CubicEase { EasingMode = EasingMode.EaseInOut };

            // Create 3D transforms
            var currentTransform = new RotateTransform3D();
            var newTransform = new RotateTransform3D();
            
            var currentTransform3D = new Transform3DGroup();
            var newTransform3D = new Transform3DGroup();
            
            currentTransform3D.Children.Add(currentTransform);
            newTransform3D.Children.Add(newTransform);

            // Set transform origins to center
            currentView.RenderTransformOrigin = new Point(0.5, 0.5);
            newView.RenderTransformOrigin = new Point(0.5, 0.5);

            // Initial setup
            newView.Opacity = 0;
            
            // Add both views to container
            var grid = new Grid();
            grid.Children.Add(currentView);
            grid.Children.Add(newView);
            _transitionHost.Content = grid;

            // Phase 1: Rotate current view to 90 degrees (half flip)
            var rotateOut = new DoubleAnimation(0, 90, TimeSpan.FromMilliseconds(duration.TotalMilliseconds / 2))
            {
                EasingFunction = easing
            };

            // Use a simple RotateTransform for 2D effect (more compatible)
            var currentRotate = new RotateTransform();
            var newRotate = new RotateTransform();
            
            currentView.RenderTransform = currentRotate;
            newView.RenderTransform = newRotate;

            // Scale effect to simulate 3D flip
            var currentScale = new ScaleTransform { CenterX = 0.5, CenterY = 0.5 };
            var newScale = new ScaleTransform { ScaleX = 0, CenterX = 0.5, CenterY = 0.5 };
            
            var currentGroup = new TransformGroup();
            currentGroup.Children.Add(currentScale);
            currentGroup.Children.Add(currentRotate);
            
            var newGroup = new TransformGroup();
            newGroup.Children.Add(newScale);
            newGroup.Children.Add(newRotate);
            
            currentView.RenderTransform = currentGroup;
            newView.RenderTransform = newGroup;

            // Phase 1: Scale down current view
            var scaleDown = new DoubleAnimation(1, 0, TimeSpan.FromMilliseconds(duration.TotalMilliseconds / 2))
            {
                EasingFunction = easing
            };

            currentScale.BeginAnimation(ScaleTransform.ScaleXProperty, scaleDown);

            await Task.Delay((int)(duration.TotalMilliseconds / 2));

            // Phase 2: Scale up new view
            newView.Opacity = 1;
            var scaleUp = new DoubleAnimation(0, 1, TimeSpan.FromMilliseconds(duration.TotalMilliseconds / 2))
            {
                EasingFunction = easing
            };

            newScale.BeginAnimation(ScaleTransform.ScaleXProperty, scaleUp);

            await Task.Delay((int)(duration.TotalMilliseconds / 2));

            // Clean up
            _transitionHost.Content = newView;
            newView.RenderTransform = null;
            newView.Opacity = 1;
        }

        /// <summary>
        /// Simple fade in animation
        /// </summary>
        private async Task FadeInAsync(FrameworkElement view, TimeSpan duration)
        {
            view.Opacity = 0;
            var fadeIn = new DoubleAnimation(0, 1, duration)
            {
                EasingFunction = new QuadraticEase { EasingMode = EasingMode.EaseOut }
            };

            view.BeginAnimation(FrameworkElement.OpacityProperty, fadeIn);
            await Task.Delay(duration);
            view.Opacity = 1;
        }

        /// <summary>
        /// Initializes the transition animation dictionary
        /// </summary>
        private Dictionary<TransitionType, Func<FrameworkElement, FrameworkElement, Task>> InitializeTransitionAnimations()
        {
            return new Dictionary<TransitionType, Func<FrameworkElement, FrameworkElement, Task>>
            {
                { TransitionType.FadeInOut, FadeTransitionAsync },
                { TransitionType.SlideLeft, (current, next) => SlideTransitionAsync(current, next, ViewSlideDirection.Left) },
                { TransitionType.SlideRight, (current, next) => SlideTransitionAsync(current, next, ViewSlideDirection.Right) },
                { TransitionType.SlideUp, (current, next) => SlideTransitionAsync(current, next, ViewSlideDirection.Up) },
                { TransitionType.SlideDown, (current, next) => SlideTransitionAsync(current, next, ViewSlideDirection.Down) },
                { TransitionType.Scale, ScaleTransitionAsync },
                { TransitionType.Flip, FlipTransitionAsync }
            };
        }

        /// <summary>
        /// Gets information about registered views
        /// </summary>
        public ViewTransitionInfo GetTransitionInfo()
        {
            return new ViewTransitionInfo
            {
                RegisteredViewCount = _views.Count,
                IsTransitioning = _isTransitioning,
                HasTransitionHost = _transitionHost != null,
                CurrentView = (_transitionHost?.Content as FrameworkElement)?.GetType().Name
            };
        }
    }

    /// <summary>
    /// Types of view transitions available
    /// </summary>
    public enum TransitionType
    {
        FadeInOut,
        SlideLeft,
        SlideRight,
        SlideUp,
        SlideDown,
        Scale,
        Flip
    }

    /// <summary>
    /// Direction for view slide transitions
    /// </summary>
    public enum ViewSlideDirection
    {
        Left,
        Right,
        Up,
        Down
    }

    /// <summary>
    /// Information about the view transition service state
    /// </summary>
    public class ViewTransitionInfo
    {
        public int RegisteredViewCount { get; set; }
        public bool IsTransitioning { get; set; }
        public bool HasTransitionHost { get; set; }
        public string CurrentView { get; set; }

        public override string ToString()
        {
            return $"Views: {RegisteredViewCount}, Transitioning: {IsTransitioning}, " +
                   $"Host: {HasTransitionHost}, Current: {CurrentView ?? "None"}";
        }
    }

    /// <summary>
    /// Extension methods for easy view transitions
    /// </summary>
    public static class ViewTransitionExtensions
    {
        /// <summary>
        /// Creates a smooth transition effect for any FrameworkElement
        /// </summary>
        public static async Task TransitionInAsync(this FrameworkElement element, TransitionType transitionType = TransitionType.FadeInOut)
        {
            switch (transitionType)
            {
                case TransitionType.FadeInOut:
                    await element.FadeInAsync();
                    break;
                case TransitionType.Scale:
                    await element.ScaleInAsync();
                    break;
                case TransitionType.SlideUp:
                    await element.SlideInAsync(ViewSlideDirection.Up);
                    break;
                case TransitionType.SlideDown:
                    await element.SlideInAsync(ViewSlideDirection.Down);
                    break;
                case TransitionType.SlideLeft:
                    await element.SlideInAsync(ViewSlideDirection.Left);
                    break;
                case TransitionType.SlideRight:
                    await element.SlideInAsync(ViewSlideDirection.Right);
                    break;
            }
        }

        private static async Task FadeInAsync(this FrameworkElement element)
        {
            element.Opacity = 0;
            var animation = new DoubleAnimation(0, 1, TimeSpan.FromMilliseconds(300))
            {
                EasingFunction = new QuadraticEase { EasingMode = EasingMode.EaseOut }
            };
            element.BeginAnimation(FrameworkElement.OpacityProperty, animation);
            await Task.Delay(300);
        }

        private static async Task ScaleInAsync(this FrameworkElement element)
        {
            var transform = new ScaleTransform(0.8, 0.8, 0.5, 0.5);
            element.RenderTransform = transform;
            element.Opacity = 0;

            var scaleX = new DoubleAnimation(0.8, 1, TimeSpan.FromMilliseconds(300))
            {
                EasingFunction = new BackEase { EasingMode = EasingMode.EaseOut }
            };
            var scaleY = new DoubleAnimation(0.8, 1, TimeSpan.FromMilliseconds(300))
            {
                EasingFunction = new BackEase { EasingMode = EasingMode.EaseOut }
            };
            var opacity = new DoubleAnimation(0, 1, TimeSpan.FromMilliseconds(300))
            {
                EasingFunction = new QuadraticEase { EasingMode = EasingMode.EaseOut }
            };

            transform.BeginAnimation(ScaleTransform.ScaleXProperty, scaleX);
            transform.BeginAnimation(ScaleTransform.ScaleYProperty, scaleY);
            element.BeginAnimation(FrameworkElement.OpacityProperty, opacity);
            
            await Task.Delay(300);
        }

        private static async Task SlideInAsync(this FrameworkElement element, ViewSlideDirection direction)
        {
            var transform = new TranslateTransform();
            element.RenderTransform = transform;

            double startX = 0, startY = 0;
            switch (direction)
            {
                case ViewSlideDirection.Left:
                    startX = -50;
                    break;
                case ViewSlideDirection.Right:
                    startX = 50;
                    break;
                case ViewSlideDirection.Up:
                    startY = 50;
                    break;
                case ViewSlideDirection.Down:
                    startY = -50;
                    break;
            }

            transform.X = startX;
            transform.Y = startY;
            element.Opacity = 0;

            var slideX = new DoubleAnimation(startX, 0, TimeSpan.FromMilliseconds(400))
            {
                EasingFunction = new CubicEase { EasingMode = EasingMode.EaseOut }
            };
            var slideY = new DoubleAnimation(startY, 0, TimeSpan.FromMilliseconds(400))
            {
                EasingFunction = new CubicEase { EasingMode = EasingMode.EaseOut }
            };
            var opacity = new DoubleAnimation(0, 1, TimeSpan.FromMilliseconds(400))
            {
                EasingFunction = new QuadraticEase { EasingMode = EasingMode.EaseOut }
            };

            transform.BeginAnimation(TranslateTransform.XProperty, slideX);
            transform.BeginAnimation(TranslateTransform.YProperty, slideY);
            element.BeginAnimation(FrameworkElement.OpacityProperty, opacity);

            await Task.Delay(400);
        }
    }
}