using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Input;
using System.Windows.Media;
using System.Windows.Media.Animation;
using System.Windows.Media.Effects;
using System.Windows.Shapes;

namespace MandADiscoverySuite.Services
{
    /// <summary>
    /// Service for managing subtle micro-interactions that enhance user experience
    /// </summary>
    public class MicroInteractionService
    {
        private readonly Dictionary<FrameworkElement, List<InteractionHandler>> _registeredInteractions;
        private readonly AnimationOptimizationService _animationService;
        private bool _microInteractionsEnabled;

        public MicroInteractionService()
        {
            _registeredInteractions = new Dictionary<FrameworkElement, List<InteractionHandler>>();
            _animationService = new AnimationOptimizationService();
            _microInteractionsEnabled = true;
        }

        /// <summary>
        /// Gets or sets whether micro-interactions are enabled globally
        /// </summary>
        public bool MicroInteractionsEnabled
        {
            get => _microInteractionsEnabled;
            set => _microInteractionsEnabled = value;
        }

        /// <summary>
        /// Adds button press micro-interaction (scale down on press)
        /// </summary>
        public void AddButtonPressInteraction(Button button, double scaleAmount = 0.95)
        {
            if (button == null || !_microInteractionsEnabled) return;

            var handler = new InteractionHandler
            {
                Element = button,
                InteractionType = InteractionType.ButtonPress
            };

            button.PreviewMouseLeftButtonDown += (s, e) =>
            {
                if (_microInteractionsEnabled)
                {
                    ScaleElement(button, scaleAmount, TimeSpan.FromMilliseconds(100));
                }
            };

            button.PreviewMouseLeftButtonUp += (s, e) =>
            {
                if (_microInteractionsEnabled)
                {
                    ScaleElement(button, 1.0, TimeSpan.FromMilliseconds(100));
                }
            };

            button.MouseLeave += (s, e) =>
            {
                if (_microInteractionsEnabled)
                {
                    ScaleElement(button, 1.0, TimeSpan.FromMilliseconds(100));
                }
            };

            RegisterInteraction(button, handler);
        }

        /// <summary>
        /// Adds hover glow effect to an element
        /// </summary>
        public void AddHoverGlowInteraction(FrameworkElement element, Color glowColor, double intensity = 0.3)
        {
            if (element == null || !_microInteractionsEnabled) return;

            var handler = new InteractionHandler
            {
                Element = element,
                InteractionType = InteractionType.HoverGlow
            };

            var originalEffect = element.Effect;
            var glowEffect = new DropShadowEffect
            {
                Color = glowColor,
                BlurRadius = 15,
                ShadowDepth = 0,
                Opacity = 0
            };

            element.MouseEnter += async (s, e) =>
            {
                if (_microInteractionsEnabled)
                {
                    element.Effect = glowEffect;
                    await AnimateGlowOpacity(glowEffect, 0, intensity, TimeSpan.FromMilliseconds(200));
                }
            };

            element.MouseLeave += async (s, e) =>
            {
                if (_microInteractionsEnabled)
                {
                    await AnimateGlowOpacity(glowEffect, intensity, 0, TimeSpan.FromMilliseconds(200));
                    Application.Current.Dispatcher.Invoke(() =>
                    {
                        element.Effect = originalEffect;
                    });
                }
            };

            RegisterInteraction(element, handler);
        }

        /// <summary>
        /// Adds ripple effect on click
        /// </summary>
        public void AddRippleInteraction(FrameworkElement element, Color rippleColor)
        {
            if (element == null || !_microInteractionsEnabled) return;

            var handler = new InteractionHandler
            {
                Element = element,
                InteractionType = InteractionType.Ripple
            };

            element.PreviewMouseLeftButtonDown += (s, e) =>
            {
                if (_microInteractionsEnabled)
                {
                    CreateRippleEffect(element, e.GetPosition(element), rippleColor);
                }
            };

            RegisterInteraction(element, handler);
        }

        /// <summary>
        /// Adds floating animation to an element
        /// </summary>
        public void AddFloatingInteraction(FrameworkElement element, double amplitude = 2.0)
        {
            if (element == null || !_microInteractionsEnabled) return;

            var handler = new InteractionHandler
            {
                Element = element,
                InteractionType = InteractionType.Floating
            };

            var transform = new TranslateTransform();
            element.RenderTransform = transform;

            var floatAnimation = new DoubleAnimation
            {
                From = -amplitude,
                To = amplitude,
                Duration = TimeSpan.FromSeconds(3),
                AutoReverse = true,
                RepeatBehavior = RepeatBehavior.Forever,
                EasingFunction = new SineEase { EasingMode = EasingMode.EaseInOut }
            };

            if (_microInteractionsEnabled)
            {
                transform.BeginAnimation(TranslateTransform.YProperty, floatAnimation);
            }

            RegisterInteraction(element, handler);
        }

        /// <summary>
        /// Adds pulse animation on hover
        /// </summary>
        public void AddPulseInteraction(FrameworkElement element, double pulseScale = 1.05)
        {
            if (element == null || !_microInteractionsEnabled) return;

            var handler = new InteractionHandler
            {
                Element = element,
                InteractionType = InteractionType.Pulse
            };

            element.MouseEnter += (s, e) =>
            {
                if (_microInteractionsEnabled)
                {
                    PulseElement(element, pulseScale);
                }
            };

            element.MouseLeave += (s, e) =>
            {
                if (_microInteractionsEnabled)
                {
                    ScaleElement(element, 1.0, TimeSpan.FromMilliseconds(200));
                }
            };

            RegisterInteraction(element, handler);
        }

        /// <summary>
        /// Adds shake animation for invalid input
        /// </summary>
        public void TriggerShakeInteraction(FrameworkElement element)
        {
            if (element == null || !_microInteractionsEnabled) return;

            var transform = element.RenderTransform as TranslateTransform ?? new TranslateTransform();
            element.RenderTransform = transform;

            var shakeAnimation = new DoubleAnimationUsingKeyFrames
            {
                Duration = TimeSpan.FromMilliseconds(500)
            };

            shakeAnimation.KeyFrames.Add(new LinearDoubleKeyFrame(0, KeyTime.FromTimeSpan(TimeSpan.FromMilliseconds(0))));
            shakeAnimation.KeyFrames.Add(new LinearDoubleKeyFrame(-10, KeyTime.FromTimeSpan(TimeSpan.FromMilliseconds(50))));
            shakeAnimation.KeyFrames.Add(new LinearDoubleKeyFrame(10, KeyTime.FromTimeSpan(TimeSpan.FromMilliseconds(150))));
            shakeAnimation.KeyFrames.Add(new LinearDoubleKeyFrame(-8, KeyTime.FromTimeSpan(TimeSpan.FromMilliseconds(250))));
            shakeAnimation.KeyFrames.Add(new LinearDoubleKeyFrame(8, KeyTime.FromTimeSpan(TimeSpan.FromMilliseconds(350))));
            shakeAnimation.KeyFrames.Add(new LinearDoubleKeyFrame(-5, KeyTime.FromTimeSpan(TimeSpan.FromMilliseconds(400))));
            shakeAnimation.KeyFrames.Add(new LinearDoubleKeyFrame(5, KeyTime.FromTimeSpan(TimeSpan.FromMilliseconds(450))));
            shakeAnimation.KeyFrames.Add(new LinearDoubleKeyFrame(0, KeyTime.FromTimeSpan(TimeSpan.FromMilliseconds(500))));

            transform.BeginAnimation(TranslateTransform.XProperty, shakeAnimation);
        }

        /// <summary>
        /// Adds highlight flash effect
        /// </summary>
        public void TriggerFlashInteraction(FrameworkElement element, Color flashColor)
        {
            if (element == null || !_microInteractionsEnabled) return;

            var originalBrush = element.GetValue(Control.BackgroundProperty) as Brush;
            var flashBrush = new SolidColorBrush(flashColor);

            element.SetValue(Control.BackgroundProperty, flashBrush);

            var colorAnimation = new ColorAnimation
            {
                From = flashColor,
                To = Colors.Transparent,
                Duration = TimeSpan.FromMilliseconds(300),
                EasingFunction = new QuadraticEase { EasingMode = EasingMode.EaseOut }
            };

            colorAnimation.Completed += (s, e) =>
            {
                element.SetValue(Control.BackgroundProperty, originalBrush);
            };

            flashBrush.BeginAnimation(SolidColorBrush.ColorProperty, colorAnimation);
        }

        /// <summary>
        /// Adds smooth opacity fade for loading states
        /// </summary>
        public async Task FadeElementAsync(FrameworkElement element, double targetOpacity, TimeSpan duration)
        {
            if (element == null || !_microInteractionsEnabled) return;

            var fadeAnimation = new DoubleAnimation
            {
                To = targetOpacity,
                Duration = duration,
                EasingFunction = new QuadraticEase { EasingMode = EasingMode.EaseInOut }
            };

            element.BeginAnimation(FrameworkElement.OpacityProperty, fadeAnimation);
            await Task.Delay(duration);
        }

        /// <summary>
        /// Creates a morphing transition between two states
        /// </summary>
        public void AddMorphInteraction(FrameworkElement element, double fromWidth, double fromHeight, 
            double toWidth, double toHeight, TimeSpan duration)
        {
            if (element == null || !_microInteractionsEnabled) return;

            var widthAnimation = new DoubleAnimation
            {
                From = fromWidth,
                To = toWidth,
                Duration = duration,
                EasingFunction = new CubicEase { EasingMode = EasingMode.EaseInOut }
            };

            var heightAnimation = new DoubleAnimation
            {
                From = fromHeight,
                To = toHeight,
                Duration = duration,
                EasingFunction = new CubicEase { EasingMode = EasingMode.EaseInOut }
            };

            element.BeginAnimation(FrameworkElement.WidthProperty, widthAnimation);
            element.BeginAnimation(FrameworkElement.HeightProperty, heightAnimation);
        }

        /// <summary>
        /// Removes all interactions from an element
        /// </summary>
        public void RemoveInteractions(FrameworkElement element)
        {
            if (element != null && _registeredInteractions.ContainsKey(element))
            {
                _registeredInteractions.Remove(element);
            }
        }

        /// <summary>
        /// Gets statistics about registered interactions
        /// </summary>
        public MicroInteractionStats GetStatistics()
        {
            var stats = new MicroInteractionStats
            {
                RegisteredElementsCount = _registeredInteractions.Count,
                MicroInteractionsEnabled = _microInteractionsEnabled
            };

            foreach (var kvp in _registeredInteractions)
            {
                foreach (var handler in kvp.Value)
                {
                    stats.InteractionTypeCount[handler.InteractionType] = 
                        stats.InteractionTypeCount.GetValueOrDefault(handler.InteractionType, 0) + 1;
                }
            }

            return stats;
        }

        #region Private Methods

        private void RegisterInteraction(FrameworkElement element, InteractionHandler handler)
        {
            if (!_registeredInteractions.ContainsKey(element))
            {
                _registeredInteractions[element] = new List<InteractionHandler>();
            }
            
            _registeredInteractions[element].Add(handler);
        }

        private void ScaleElement(FrameworkElement element, double scale, TimeSpan duration)
        {
            var transform = element.RenderTransform as ScaleTransform ?? new ScaleTransform();
            element.RenderTransform = transform;
            element.RenderTransformOrigin = new Point(0.5, 0.5);

            var scaleAnimation = new DoubleAnimation
            {
                To = scale,
                Duration = duration,
                EasingFunction = new QuadraticEase { EasingMode = EasingMode.EaseOut }
            };

            transform.BeginAnimation(ScaleTransform.ScaleXProperty, scaleAnimation);
            transform.BeginAnimation(ScaleTransform.ScaleYProperty, scaleAnimation);
        }

        private void PulseElement(FrameworkElement element, double pulseScale)
        {
            var transform = element.RenderTransform as ScaleTransform ?? new ScaleTransform();
            element.RenderTransform = transform;
            element.RenderTransformOrigin = new Point(0.5, 0.5);

            var pulseAnimation = new DoubleAnimation
            {
                From = 1.0,
                To = pulseScale,
                Duration = TimeSpan.FromMilliseconds(600),
                AutoReverse = true,
                RepeatBehavior = RepeatBehavior.Forever,
                EasingFunction = new SineEase { EasingMode = EasingMode.EaseInOut }
            };

            transform.BeginAnimation(ScaleTransform.ScaleXProperty, pulseAnimation);
            transform.BeginAnimation(ScaleTransform.ScaleYProperty, pulseAnimation);
        }

        private async Task AnimateGlowOpacity(DropShadowEffect effect, double from, double to, TimeSpan duration)
        {
            var animation = new DoubleAnimation
            {
                From = from,
                To = to,
                Duration = duration,
                EasingFunction = new QuadraticEase { EasingMode = EasingMode.EaseInOut }
            };

            effect.BeginAnimation(DropShadowEffect.OpacityProperty, animation);
            await Task.Delay(duration);
        }

        private void CreateRippleEffect(FrameworkElement element, Point clickPosition, Color rippleColor)
        {
            var canvas = new Canvas
            {
                IsHitTestVisible = false,
                ClipToBounds = true
            };

            var ripple = new Ellipse
            {
                Fill = new SolidColorBrush(rippleColor),
                Width = 0,
                Height = 0,
                Opacity = 0.3
            };

            Canvas.SetLeft(ripple, clickPosition.X);
            Canvas.SetTop(ripple, clickPosition.Y);
            canvas.Children.Add(ripple);

            // Add canvas to element (assumes element is a Panel)
            if (element is Panel panel)
            {
                panel.Children.Add(canvas);
            }

            // Calculate ripple size
            var maxSize = Math.Max(element.ActualWidth, element.ActualHeight) * 2;

            // Animate ripple expansion
            var sizeAnimation = new DoubleAnimation
            {
                From = 0,
                To = maxSize,
                Duration = TimeSpan.FromMilliseconds(600),
                EasingFunction = new QuadraticEase { EasingMode = EasingMode.EaseOut }
            };

            var opacityAnimation = new DoubleAnimation
            {
                From = 0.3,
                To = 0,
                Duration = TimeSpan.FromMilliseconds(600),
                EasingFunction = new QuadraticEase { EasingMode = EasingMode.EaseOut }
            };

            // Position ripple to expand from center
            var positionXAnimation = new DoubleAnimation
            {
                From = clickPosition.X,
                To = clickPosition.X - (maxSize / 2),
                Duration = TimeSpan.FromMilliseconds(600),
                EasingFunction = new QuadraticEase { EasingMode = EasingMode.EaseOut }
            };

            var positionYAnimation = new DoubleAnimation
            {
                From = clickPosition.Y,
                To = clickPosition.Y - (maxSize / 2),
                Duration = TimeSpan.FromMilliseconds(600),
                EasingFunction = new QuadraticEase { EasingMode = EasingMode.EaseOut }
            };

            opacityAnimation.Completed += (s, e) =>
            {
                if (element is Panel parentPanel && parentPanel.Children.Contains(canvas))
                {
                    parentPanel.Children.Remove(canvas);
                }
            };

            ripple.BeginAnimation(Ellipse.WidthProperty, sizeAnimation);
            ripple.BeginAnimation(Ellipse.HeightProperty, sizeAnimation);
            ripple.BeginAnimation(Ellipse.OpacityProperty, opacityAnimation);
            Canvas.SetLeft(ripple, clickPosition.X);
            Canvas.SetTop(ripple, clickPosition.Y);
        }

        #endregion
    }

    /// <summary>
    /// Types of micro-interactions available
    /// </summary>
    public enum InteractionType
    {
        ButtonPress,
        HoverGlow,
        Ripple,
        Floating,
        Pulse,
        Shake,
        Flash,
        Morph
    }

    /// <summary>
    /// Handler for a specific interaction
    /// </summary>
    public class InteractionHandler
    {
        public FrameworkElement Element { get; set; }
        public InteractionType InteractionType { get; set; }
    }

    /// <summary>
    /// Statistics about micro-interactions
    /// </summary>
    public class MicroInteractionStats
    {
        public int RegisteredElementsCount { get; set; }
        public bool MicroInteractionsEnabled { get; set; }
        public Dictionary<InteractionType, int> InteractionTypeCount { get; set; } = new();

        public override string ToString()
        {
            var totalInteractions = 0;
            foreach (var count in InteractionTypeCount.Values)
                totalInteractions += count;

            return $"Elements: {RegisteredElementsCount}, Total Interactions: {totalInteractions}, " +
                   $"Enabled: {MicroInteractionsEnabled}";
        }
    }

    /// <summary>
    /// Extension methods for easy micro-interaction setup
    /// </summary>
    public static class MicroInteractionExtensions
    {
        private static readonly MicroInteractionService _service = new MicroInteractionService();

        public static void EnableButtonPress(this Button button) =>
            _service.AddButtonPressInteraction(button);

        public static void EnableHoverGlow(this FrameworkElement element, Color glowColor) =>
            _service.AddHoverGlowInteraction(element, glowColor);

        public static void EnableRipple(this FrameworkElement element, Color rippleColor) =>
            _service.AddRippleInteraction(element, rippleColor);

        public static void EnablePulse(this FrameworkElement element) =>
            _service.AddPulseInteraction(element);

        public static void TriggerShake(this FrameworkElement element) =>
            _service.TriggerShakeInteraction(element);

        public static void TriggerFlash(this FrameworkElement element, Color flashColor) =>
            _service.TriggerFlashInteraction(element, flashColor);
    }
}