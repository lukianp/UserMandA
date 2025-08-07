using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Media;
using System.Windows.Media.Animation;

namespace MandADiscoverySuite.Services
{
    /// <summary>
    /// Service for animating dashboard metric changes with smooth transitions
    /// </summary>
    public class MetricAnimationService
    {
        private readonly Dictionary<string, MetricAnimationState> _animationStates;
        private readonly Timer _animationTimer;
        private readonly object _lock = new object();

        public MetricAnimationService()
        {
            _animationStates = new Dictionary<string, MetricAnimationState>();
            _animationTimer = new Timer(UpdateAnimations, null, TimeSpan.FromMilliseconds(16), TimeSpan.FromMilliseconds(16));
        }

        #region Public Methods

        /// <summary>
        /// Animates a metric value change in a TextBlock
        /// </summary>
        public void AnimateMetricChange(TextBlock target, double fromValue, double toValue, 
            MetricAnimationType animationType = MetricAnimationType.CountUp,
            TimeSpan? duration = null, string format = "N0", Action onComplete = null)
        {
            if (target == null) return;

            var actualDuration = duration ?? TimeSpan.FromMilliseconds(1500);
            var key = target.GetHashCode().ToString();

            lock (_lock)
            {
                if (_animationStates.ContainsKey(key))
                {
                    _animationStates[key].IsActive = false;
                }

                _animationStates[key] = new MetricAnimationState
                {
                    Target = target,
                    FromValue = fromValue,
                    ToValue = toValue,
                    CurrentValue = fromValue,
                    AnimationType = animationType,
                    Duration = actualDuration,
                    StartTime = DateTime.Now,
                    Format = format,
                    OnComplete = onComplete,
                    IsActive = true
                };
            }

            // Add visual feedback
            AddVisualFeedback(target, toValue > fromValue);
        }

        /// <summary>
        /// Animates a percentage metric with a progress bar
        /// </summary>
        public void AnimatePercentageMetric(ProgressBar progressBar, TextBlock textBlock, 
            double fromValue, double toValue, TimeSpan? duration = null, Action onComplete = null)
        {
            if (progressBar == null) return;

            var actualDuration = duration ?? TimeSpan.FromMilliseconds(1200);

            // Animate progress bar
            var progressAnimation = new DoubleAnimation
            {
                From = fromValue,
                To = toValue,
                Duration = actualDuration,
                EasingFunction = new QuadraticEase { EasingMode = EasingMode.EaseOut }
            };

            progressAnimation.Completed += (s, e) => onComplete?.Invoke();
            progressBar.BeginAnimation(ProgressBar.ValueProperty, progressAnimation);

            // Animate text if provided
            if (textBlock != null)
            {
                AnimateMetricChange(textBlock, fromValue, toValue, 
                    MetricAnimationType.CountUp, actualDuration, "P1");
            }
        }

        /// <summary>
        /// Animates a currency value with appropriate formatting
        /// </summary>
        public void AnimateCurrencyMetric(TextBlock target, double fromValue, double toValue, 
            string currencySymbol = "$", TimeSpan? duration = null, Action onComplete = null)
        {
            AnimateMetricChange(target, fromValue, toValue, MetricAnimationType.CountUp, 
                duration, $"{currencySymbol}#,##0", onComplete);
        }

        /// <summary>
        /// Creates a pulsing effect for important metrics
        /// </summary>
        public void PulseMetric(FrameworkElement target, int pulseCount = 3, TimeSpan? duration = null)
        {
            if (target == null) return;

            var actualDuration = duration ?? TimeSpan.FromMilliseconds(600);
            var pulseAnimation = new DoubleAnimationUsingKeyFrames();

            for (int i = 0; i < pulseCount; i++)
            {
                var offset = i * (actualDuration.TotalMilliseconds / pulseCount);
                
                pulseAnimation.KeyFrames.Add(new LinearDoubleKeyFrame(1.0, 
                    KeyTime.FromTimeSpan(TimeSpan.FromMilliseconds(offset))));
                pulseAnimation.KeyFrames.Add(new LinearDoubleKeyFrame(1.2, 
                    KeyTime.FromTimeSpan(TimeSpan.FromMilliseconds(offset + 150))));
                pulseAnimation.KeyFrames.Add(new LinearDoubleKeyFrame(1.0, 
                    KeyTime.FromTimeSpan(TimeSpan.FromMilliseconds(offset + 300))));
            }

            var scaleTransform = new ScaleTransform(1, 1);
            target.RenderTransform = scaleTransform;
            target.RenderTransformOrigin = new Point(0.5, 0.5);

            scaleTransform.BeginAnimation(ScaleTransform.ScaleXProperty, pulseAnimation);
            scaleTransform.BeginAnimation(ScaleTransform.ScaleYProperty, pulseAnimation);
        }

        /// <summary>
        /// Creates a slide-in effect for new metrics
        /// </summary>
        public void SlideInMetric(FrameworkElement target, SlideDirection direction = SlideDirection.FromBottom, 
            TimeSpan? duration = null, Action onComplete = null)
        {
            if (target == null) return;

            var actualDuration = duration ?? TimeSpan.FromMilliseconds(800);
            var translateTransform = new TranslateTransform();
            target.RenderTransform = translateTransform;

            // Set initial position based on direction
            double initialX = 0, initialY = 0;
            switch (direction)
            {
                case SlideDirection.FromLeft:
                    initialX = -target.ActualWidth;
                    break;
                case SlideDirection.FromRight:
                    initialX = target.ActualWidth;
                    break;
                case SlideDirection.FromTop:
                    initialY = -target.ActualHeight;
                    break;
                case SlideDirection.FromBottom:
                    initialY = target.ActualHeight;
                    break;
            }

            translateTransform.X = initialX;
            translateTransform.Y = initialY;
            target.Opacity = 0;

            // Animate to final position
            var moveX = new DoubleAnimation
            {
                To = 0,
                Duration = actualDuration,
                EasingFunction = new BackEase { EasingMode = EasingMode.EaseOut, Amplitude = 0.3 }
            };

            var moveY = new DoubleAnimation
            {
                To = 0,
                Duration = actualDuration,
                EasingFunction = new BackEase { EasingMode = EasingMode.EaseOut, Amplitude = 0.3 }
            };

            var fadeIn = new DoubleAnimation
            {
                To = 1,
                Duration = TimeSpan.FromMilliseconds(actualDuration.TotalMilliseconds * 0.7),
                EasingFunction = new QuadraticEase { EasingMode = EasingMode.EaseOut }
            };

            fadeIn.Completed += (s, e) => onComplete?.Invoke();

            translateTransform.BeginAnimation(TranslateTransform.XProperty, moveX);
            translateTransform.BeginAnimation(TranslateTransform.YProperty, moveY);
            target.BeginAnimation(UIElement.OpacityProperty, fadeIn);
        }

        /// <summary>
        /// Creates a highlighting effect when a metric changes significantly
        /// </summary>
        public void HighlightMetricChange(FrameworkElement target, bool isIncrease, TimeSpan? duration = null)
        {
            if (target == null) return;

            var actualDuration = duration ?? TimeSpan.FromMilliseconds(1000);
            var highlightColor = isIncrease ? Colors.LightGreen : Colors.LightCoral;
            
            // Create background highlight
            var colorAnimation = new ColorAnimation
            {
                From = highlightColor,
                To = Colors.Transparent,
                Duration = actualDuration,
                EasingFunction = new QuadraticEase { EasingMode = EasingMode.EaseOut }
            };

            // Apply to background if it's a control that supports it
            if (target is Control control)
            {
                var brush = new SolidColorBrush(Colors.Transparent);
                control.Background = brush;
                brush.BeginAnimation(SolidColorBrush.ColorProperty, colorAnimation);
            }
            else if (target is Panel panel)
            {
                var brush = new SolidColorBrush(Colors.Transparent);
                panel.Background = brush;
                brush.BeginAnimation(SolidColorBrush.ColorProperty, colorAnimation);
            }
        }

        /// <summary>
        /// Stops all animations for a target
        /// </summary>
        public void StopAnimations(string targetKey)
        {
            lock (_lock)
            {
                if (_animationStates.ContainsKey(targetKey))
                {
                    _animationStates[targetKey].IsActive = false;
                    _animationStates.Remove(targetKey);
                }
            }
        }

        /// <summary>
        /// Stops all active animations
        /// </summary>
        public void StopAllAnimations()
        {
            lock (_lock)
            {
                foreach (var state in _animationStates.Values)
                {
                    state.IsActive = false;
                }
                _animationStates.Clear();
            }
        }

        #endregion

        #region Private Methods

        private void UpdateAnimations(object state)
        {
            var completedAnimations = new List<string>();

            lock (_lock)
            {
                foreach (var kvp in _animationStates.ToArray())
                {
                    var animationState = kvp.Value;
                    if (!animationState.IsActive) continue;

                    var elapsed = DateTime.Now - animationState.StartTime;
                    var progress = Math.Min(1.0, elapsed.TotalMilliseconds / animationState.Duration.TotalMilliseconds);

                    if (progress >= 1.0)
                    {
                        // Animation complete
                        animationState.CurrentValue = animationState.ToValue;
                        completedAnimations.Add(kvp.Key);
                        
                        Application.Current?.Dispatcher.BeginInvoke(new Action(() =>
                        {
                            UpdateTargetValue(animationState);
                            animationState.OnComplete?.Invoke();
                        }));
                    }
                    else
                    {
                        // Calculate current value based on animation type
                        var easedProgress = ApplyEasing(progress, animationState.AnimationType);
                        animationState.CurrentValue = animationState.FromValue + 
                            (animationState.ToValue - animationState.FromValue) * easedProgress;

                        Application.Current?.Dispatcher.BeginInvoke(new Action(() =>
                        {
                            UpdateTargetValue(animationState);
                        }));
                    }
                }

                // Remove completed animations
                foreach (var key in completedAnimations)
                {
                    _animationStates.Remove(key);
                }
            }
        }

        private double ApplyEasing(double progress, MetricAnimationType animationType)
        {
            return animationType switch
            {
                MetricAnimationType.CountUp => EaseOutQuad(progress),
                MetricAnimationType.Bounce => EaseBounce(progress),
                MetricAnimationType.Smooth => EaseInOutCubic(progress),
                MetricAnimationType.Quick => EaseOutExpo(progress),
                _ => progress
            };
        }

        private double EaseOutQuad(double t) => 1 - (1 - t) * (1 - t);
        private double EaseInOutCubic(double t) => t < 0.5 ? 4 * t * t * t : 1 - Math.Pow(-2 * t + 2, 3) / 2;
        private double EaseOutExpo(double t) => t == 1 ? 1 : 1 - Math.Pow(2, -10 * t);
        private double EaseBounce(double t)
        {
            const double n1 = 7.5625;
            const double d1 = 2.75;

            if (t < 1 / d1)
                return n1 * t * t;
            else if (t < 2 / d1)
                return n1 * (t -= 1.5 / d1) * t + 0.75;
            else if (t < 2.5 / d1)
                return n1 * (t -= 2.25 / d1) * t + 0.9375;
            else
                return n1 * (t -= 2.625 / d1) * t + 0.984375;
        }

        private void UpdateTargetValue(MetricAnimationState state)
        {
            if (state.Target != null && state.Target.IsLoaded)
            {
                var formattedValue = state.CurrentValue.ToString(state.Format, CultureInfo.CurrentCulture);
                state.Target.Text = formattedValue;
            }
        }

        private void AddVisualFeedback(FrameworkElement target, bool isIncrease)
        {
            // Add subtle glow effect
            var glowColor = isIncrease ? Colors.Green : Colors.Red;
            var glowAnimation = new ColorAnimation
            {
                From = glowColor,
                To = Colors.Transparent,
                Duration = TimeSpan.FromMilliseconds(800),
                EasingFunction = new QuadraticEase { EasingMode = EasingMode.EaseOut }
            };

            // Create and apply glow effect
            if (target is TextBlock textBlock)
            {
                var brush = new SolidColorBrush(Colors.Transparent);
                textBlock.Foreground = brush;
                brush.BeginAnimation(SolidColorBrush.ColorProperty, glowAnimation);
            }
        }

        #endregion

        #region Cleanup

        public void Dispose()
        {
            _animationTimer?.Dispose();
            StopAllAnimations();
        }

        #endregion
    }

    /// <summary>
    /// Represents the state of a metric animation
    /// </summary>
    internal class MetricAnimationState
    {
        public TextBlock Target { get; set; }
        public double FromValue { get; set; }
        public double ToValue { get; set; }
        public double CurrentValue { get; set; }
        public MetricAnimationType AnimationType { get; set; }
        public TimeSpan Duration { get; set; }
        public DateTime StartTime { get; set; }
        public string Format { get; set; }
        public Action OnComplete { get; set; }
        public bool IsActive { get; set; }
    }

    /// <summary>
    /// Types of metric animations
    /// </summary>
    public enum MetricAnimationType
    {
        /// <summary>
        /// Smooth count-up animation
        /// </summary>
        CountUp,

        /// <summary>
        /// Bouncy animation with spring effect
        /// </summary>
        Bounce,

        /// <summary>
        /// Smooth ease-in-out animation
        /// </summary>
        Smooth,

        /// <summary>
        /// Quick exponential animation
        /// </summary>
        Quick
    }

    /// <summary>
    /// Directions for slide animations
    /// </summary>
    public enum SlideDirection
    {
        FromLeft,
        FromRight,
        FromTop,
        FromBottom
    }

    /// <summary>
    /// Extension methods for metric animation
    /// </summary>
    public static class MetricAnimationExtensions
    {
        private static MetricAnimationService _service;
        
        public static MetricAnimationService GetMetricAnimationService(this FrameworkElement element)
        {
            return _service ??= new MetricAnimationService();
        }

        /// <summary>
        /// Animates this TextBlock's numeric value
        /// </summary>
        public static void AnimateValue(this TextBlock textBlock, double fromValue, double toValue,
            MetricAnimationType animationType = MetricAnimationType.CountUp, TimeSpan? duration = null)
        {
            var service = textBlock.GetMetricAnimationService();
            service.AnimateMetricChange(textBlock, fromValue, toValue, animationType, duration);
        }

        /// <summary>
        /// Pulses this element to draw attention
        /// </summary>
        public static void Pulse(this FrameworkElement element, int count = 3)
        {
            var service = element.GetMetricAnimationService();
            service.PulseMetric(element, count);
        }

        /// <summary>
        /// Slides this element in from the specified direction
        /// </summary>
        public static void SlideIn(this FrameworkElement element, SlideDirection direction = SlideDirection.FromBottom)
        {
            var service = element.GetMetricAnimationService();
            service.SlideInMetric(element, direction);
        }
    }
}