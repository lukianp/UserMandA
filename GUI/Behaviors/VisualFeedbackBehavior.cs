using System;
using System.Linq;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Input;
using System.Windows.Media;
using System.Windows.Media.Animation;

namespace MandADiscoverySuite.Behaviors
{
    /// <summary>
    /// Behavior that adds visual feedback and micro-interactions to UI elements
    /// </summary>
    public static class VisualFeedbackBehavior
    {
        #region EnableHoverEffect Attached Property

        public static readonly DependencyProperty EnableHoverEffectProperty =
            DependencyProperty.RegisterAttached(
                "EnableHoverEffect",
                typeof(bool),
                typeof(VisualFeedbackBehavior),
                new PropertyMetadata(false, OnEnableHoverEffectChanged));

        public static bool GetEnableHoverEffect(DependencyObject obj)
        {
            return (bool)obj.GetValue(EnableHoverEffectProperty);
        }

        public static void SetEnableHoverEffect(DependencyObject obj, bool value)
        {
            obj.SetValue(EnableHoverEffectProperty, value);
        }

        private static void OnEnableHoverEffectChanged(DependencyObject d, DependencyPropertyChangedEventArgs e)
        {
            if (d is FrameworkElement element)
            {
                if ((bool)e.NewValue)
                {
                    AttachHoverEffect(element);
                }
                else
                {
                    DetachHoverEffect(element);
                }
            }
        }

        #endregion

        #region EnableClickEffect Attached Property

        public static readonly DependencyProperty EnableClickEffectProperty =
            DependencyProperty.RegisterAttached(
                "EnableClickEffect",
                typeof(bool),
                typeof(VisualFeedbackBehavior),
                new PropertyMetadata(false, OnEnableClickEffectChanged));

        public static bool GetEnableClickEffect(DependencyObject obj)
        {
            return (bool)obj.GetValue(EnableClickEffectProperty);
        }

        public static void SetEnableClickEffect(DependencyObject obj, bool value)
        {
            obj.SetValue(EnableClickEffectProperty, value);
        }

        private static void OnEnableClickEffectChanged(DependencyObject d, DependencyPropertyChangedEventArgs e)
        {
            if (d is FrameworkElement element)
            {
                if ((bool)e.NewValue)
                {
                    AttachClickEffect(element);
                }
                else
                {
                    DetachClickEffect(element);
                }
            }
        }

        #endregion

        #region EnableLoadingState Attached Property

        public static readonly DependencyProperty EnableLoadingStateProperty =
            DependencyProperty.RegisterAttached(
                "EnableLoadingState",
                typeof(bool),
                typeof(VisualFeedbackBehavior),
                new PropertyMetadata(false, OnEnableLoadingStateChanged));

        public static bool GetEnableLoadingState(DependencyObject obj)
        {
            return (bool)obj.GetValue(EnableLoadingStateProperty);
        }

        public static void SetEnableLoadingState(DependencyObject obj, bool value)
        {
            obj.SetValue(EnableLoadingStateProperty, value);
        }

        private static void OnEnableLoadingStateChanged(DependencyObject d, DependencyPropertyChangedEventArgs e)
        {
            if (d is FrameworkElement element && (bool)e.NewValue)
            {
                AttachLoadingState(element);
            }
        }

        #endregion

        #region IsLoading Attached Property

        public static readonly DependencyProperty IsLoadingProperty =
            DependencyProperty.RegisterAttached(
                "IsLoading",
                typeof(bool),
                typeof(VisualFeedbackBehavior),
                new PropertyMetadata(false, OnIsLoadingChanged));

        public static bool GetIsLoading(DependencyObject obj)
        {
            return (bool)obj.GetValue(IsLoadingProperty);
        }

        public static void SetIsLoading(DependencyObject obj, bool value)
        {
            obj.SetValue(IsLoadingProperty, value);
        }

        private static void OnIsLoadingChanged(DependencyObject d, DependencyPropertyChangedEventArgs e)
        {
            if (d is FrameworkElement element)
            {
                UpdateLoadingState(element, (bool)e.NewValue);
            }
        }

        #endregion

        #region HoverScale Attached Property

        public static readonly DependencyProperty HoverScaleProperty =
            DependencyProperty.RegisterAttached(
                "HoverScale",
                typeof(double),
                typeof(VisualFeedbackBehavior),
                new PropertyMetadata(1.05));

        public static double GetHoverScale(DependencyObject obj)
        {
            return (double)obj.GetValue(HoverScaleProperty);
        }

        public static void SetHoverScale(DependencyObject obj, double value)
        {
            obj.SetValue(HoverScaleProperty, value);
        }

        #endregion

        #region Private Methods

        private static void AttachHoverEffect(FrameworkElement element)
        {
            element.MouseEnter += OnMouseEnter;
            element.MouseLeave += OnMouseLeave;
        }

        private static void DetachHoverEffect(FrameworkElement element)
        {
            element.MouseEnter -= OnMouseEnter;
            element.MouseLeave -= OnMouseLeave;
        }

        private static void AttachClickEffect(FrameworkElement element)
        {
            element.MouseLeftButtonDown += OnMouseDown;
            element.MouseLeftButtonUp += OnMouseUp;
            element.MouseLeave += OnMouseLeave; // Reset on mouse leave
        }

        private static void DetachClickEffect(FrameworkElement element)
        {
            element.MouseLeftButtonDown -= OnMouseDown;
            element.MouseLeftButtonUp -= OnMouseUp;
        }

        private static void AttachLoadingState(FrameworkElement element)
        {
            // Loading state is handled via property change
        }

        private static void OnMouseEnter(object sender, MouseEventArgs e)
        {
            if (sender is FrameworkElement element)
            {
                var scale = GetHoverScale(element);
                AnimateScale(element, scale, TimeSpan.FromMilliseconds(150));
                AnimateOpacity(element, 0.9, TimeSpan.FromMilliseconds(150));
            }
        }

        private static void OnMouseLeave(object sender, MouseEventArgs e)
        {
            if (sender is FrameworkElement element)
            {
                AnimateScale(element, 1.0, TimeSpan.FromMilliseconds(150));
                AnimateOpacity(element, 1.0, TimeSpan.FromMilliseconds(150));
            }
        }

        private static void OnMouseDown(object sender, MouseButtonEventArgs e)
        {
            if (sender is FrameworkElement element)
            {
                AnimateScale(element, 0.95, TimeSpan.FromMilliseconds(100));
            }
        }

        private static void OnMouseUp(object sender, MouseButtonEventArgs e)
        {
            if (sender is FrameworkElement element)
            {
                var scale = GetHoverScale(element);
                AnimateScale(element, scale, TimeSpan.FromMilliseconds(150));
            }
        }

        private static void UpdateLoadingState(FrameworkElement element, bool isLoading)
        {
            if (isLoading)
            {
                // Add loading visual effects
                AnimateOpacity(element, 0.6, TimeSpan.FromMilliseconds(200));
                
                // Add subtle rotation animation for visual feedback
                if (element.RenderTransform == null || element.RenderTransform == Transform.Identity)
                {
                    element.RenderTransform = new RotateTransform();
                    element.RenderTransformOrigin = new Point(0.5, 0.5);
                }

                if (element.RenderTransform is RotateTransform rotateTransform)
                {
                    var animation = new DoubleAnimation
                    {
                        From = 0,
                        To = 360,
                        Duration = TimeSpan.FromSeconds(2),
                        RepeatBehavior = RepeatBehavior.Forever
                    };
                    rotateTransform.BeginAnimation(RotateTransform.AngleProperty, animation);
                }
            }
            else
            {
                // Remove loading effects
                AnimateOpacity(element, 1.0, TimeSpan.FromMilliseconds(200));
                
                if (element.RenderTransform is RotateTransform rotateTransform)
                {
                    rotateTransform.BeginAnimation(RotateTransform.AngleProperty, null);
                    rotateTransform.Angle = 0;
                }
            }
        }

        private static void AnimateScale(FrameworkElement element, double targetScale, TimeSpan duration)
        {
            if (element.RenderTransform == null || element.RenderTransform == Transform.Identity)
            {
                element.RenderTransform = new ScaleTransform();
                element.RenderTransformOrigin = new Point(0.5, 0.5);
            }

            if (element.RenderTransform is TransformGroup transformGroup)
            {
                var scaleTransform = transformGroup.Children.OfType<ScaleTransform>().FirstOrDefault();
                if (scaleTransform == null)
                {
                    scaleTransform = new ScaleTransform();
                    transformGroup.Children.Add(scaleTransform);
                }
                AnimateScaleTransform(scaleTransform, targetScale, duration);
            }
            else if (element.RenderTransform is ScaleTransform scaleTransform)
            {
                AnimateScaleTransform(scaleTransform, targetScale, duration);
            }
            else
            {
                // Create a new transform group
                var newTransformGroup = new TransformGroup();
                newTransformGroup.Children.Add(element.RenderTransform);
                var newScaleTransform = new ScaleTransform();
                newTransformGroup.Children.Add(newScaleTransform);
                element.RenderTransform = newTransformGroup;
                AnimateScaleTransform(newScaleTransform, targetScale, duration);
            }
        }

        private static void AnimateScaleTransform(ScaleTransform scaleTransform, double targetScale, TimeSpan duration)
        {
            var scaleXAnimation = new DoubleAnimation
            {
                To = targetScale,
                Duration = duration,
                EasingFunction = new CubicEase { EasingMode = EasingMode.EaseOut }
            };

            var scaleYAnimation = new DoubleAnimation
            {
                To = targetScale,
                Duration = duration,
                EasingFunction = new CubicEase { EasingMode = EasingMode.EaseOut }
            };

            scaleTransform.BeginAnimation(ScaleTransform.ScaleXProperty, scaleXAnimation);
            scaleTransform.BeginAnimation(ScaleTransform.ScaleYProperty, scaleYAnimation);
        }

        private static void AnimateOpacity(FrameworkElement element, double targetOpacity, TimeSpan duration)
        {
            var animation = new DoubleAnimation
            {
                To = targetOpacity,
                Duration = duration,
                EasingFunction = new CubicEase { EasingMode = EasingMode.EaseOut }
            };

            element.BeginAnimation(FrameworkElement.OpacityProperty, animation);
        }

        #endregion
    }
}