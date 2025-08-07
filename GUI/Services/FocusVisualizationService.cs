using System;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Input;
using System.Windows.Media;
using System.Windows.Media.Animation;

namespace MandADiscoverySuite.Services
{
    /// <summary>
    /// Service for enhancing focus visualization and accessibility
    /// </summary>
    public class FocusVisualizationService
    {
        private bool _highContrastMode;
        private bool _animatedFocusEnabled;
        private readonly ResourceDictionary _focusResources;

        public FocusVisualizationService()
        {
            _focusResources = new ResourceDictionary
            {
                Source = new Uri("pack://application:,,,/GUI/Styles/FocusVisualStyles.xaml")
            };
            
            _animatedFocusEnabled = true;
            DetectHighContrastMode();
        }

        /// <summary>
        /// Gets or sets whether high contrast mode is enabled
        /// </summary>
        public bool HighContrastMode
        {
            get => _highContrastMode;
            set
            {
                _highContrastMode = value;
                UpdateGlobalFocusStyles();
            }
        }

        /// <summary>
        /// Gets or sets whether animated focus is enabled
        /// </summary>
        public bool AnimatedFocusEnabled
        {
            get => _animatedFocusEnabled;
            set
            {
                _animatedFocusEnabled = value;
                UpdateGlobalFocusStyles();
            }
        }

        /// <summary>
        /// Applies focus enhancement to a control
        /// </summary>
        public void EnhanceFocus(Control control)
        {
            if (control == null) return;

            var focusStyle = GetFocusStyle();
            control.FocusVisualStyle = focusStyle;

            // Add keyboard navigation enhancement
            control.PreviewKeyDown += OnControlPreviewKeyDown;
            control.GotFocus += OnControlGotFocus;
            control.LostFocus += OnControlLostFocus;
        }

        /// <summary>
        /// Applies focus enhancement to multiple controls
        /// </summary>
        public void EnhanceFocusForContainer(DependencyObject container)
        {
            if (container == null) return;

            // Apply to the container if it's a control
            if (container is Control control)
            {
                EnhanceFocus(control);
            }

            // Apply to all child controls
            var childrenCount = VisualTreeHelper.GetChildrenCount(container);
            for (int i = 0; i < childrenCount; i++)
            {
                var child = VisualTreeHelper.GetChild(container, i);
                EnhanceFocusForContainer(child);
            }
        }

        /// <summary>
        /// Creates a focus indicator for custom elements
        /// </summary>
        public FrameworkElement CreateFocusIndicator(FrameworkElement targetElement)
        {
            var indicator = new Border
            {
                IsHitTestVisible = false,
                BorderBrush = new SolidColorBrush(Color.FromRgb(0, 122, 204)),
                BorderThickness = new Thickness(2),
                CornerRadius = new CornerRadius(4),
                Width = targetElement.ActualWidth + 4,
                Height = targetElement.ActualHeight + 4
            };

            if (_animatedFocusEnabled)
            {
                var scaleTransform = new ScaleTransform(0.9, 0.9, 0.5, 0.5);
                indicator.RenderTransform = scaleTransform;

                var animation = new DoubleAnimation(0.9, 1.0, TimeSpan.FromMilliseconds(200))
                {
                    EasingFunction = new QuadraticEase { EasingMode = EasingMode.EaseOut }
                };

                scaleTransform.BeginAnimation(ScaleTransform.ScaleXProperty, animation);
                scaleTransform.BeginAnimation(ScaleTransform.ScaleYProperty, animation);
            }

            return indicator;
        }

        /// <summary>
        /// Sets keyboard navigation mode for a container
        /// </summary>
        public void SetKeyboardNavigationMode(Control container, KeyboardNavigationMode mode)
        {
            KeyboardNavigation.SetDirectionalNavigation(container, mode);
            KeyboardNavigation.SetTabNavigation(container, mode);
        }

        /// <summary>
        /// Enables focus trapping within a container (useful for modals)
        /// </summary>
        public void EnableFocusTrapping(FrameworkElement container)
        {
            container.PreviewKeyDown += (sender, e) =>
            {
                if (e.Key == Key.Tab)
                {
                    var focusableElements = GetFocusableElements(container);
                    if (focusableElements.Count == 0) return;

                    var currentElement = Keyboard.FocusedElement as FrameworkElement;
                    var currentIndex = focusableElements.IndexOf(currentElement);

                    if (Keyboard.Modifiers.HasFlag(ModifierKeys.Shift))
                    {
                        // Shift+Tab (backwards)
                        var previousIndex = currentIndex <= 0 ? focusableElements.Count - 1 : currentIndex - 1;
                        focusableElements[previousIndex].Focus();
                    }
                    else
                    {
                        // Tab (forwards)
                        var nextIndex = currentIndex >= focusableElements.Count - 1 ? 0 : currentIndex + 1;
                        focusableElements[nextIndex].Focus();
                    }

                    e.Handled = true;
                }
            };
        }

        /// <summary>
        /// Gets focus visualization statistics
        /// </summary>
        public FocusVisualizationStats GetStats()
        {
            return new FocusVisualizationStats
            {
                HighContrastMode = _highContrastMode,
                AnimatedFocusEnabled = _animatedFocusEnabled,
                FocusStylesLoaded = _focusResources?.Keys.Count ?? 0
            };
        }

        #region Private Methods

        private void DetectHighContrastMode()
        {
            _highContrastMode = SystemParameters.HighContrast;
        }

        private Style GetFocusStyle()
        {
            if (_highContrastMode)
                return _focusResources["HighContrastFocusVisual"] as Style;

            if (_animatedFocusEnabled)
                return _focusResources["AnimatedFocusVisual"] as Style;

            return _focusResources["ModernFocusVisual"] as Style;
        }

        private void UpdateGlobalFocusStyles()
        {
            // Update application-wide focus styles
            Application.Current.Resources.MergedDictionaries.Remove(_focusResources);
            Application.Current.Resources.MergedDictionaries.Add(_focusResources);
        }

        private void OnControlPreviewKeyDown(object sender, KeyEventArgs e)
        {
            if (sender is Control control)
            {
                // Enhance keyboard navigation feedback
                if (e.Key == Key.Tab || e.Key == Key.Enter || e.Key == Key.Space)
                {
                    ProvideKeyboardFeedback(control);
                }
            }
        }

        private void OnControlGotFocus(object sender, RoutedEventArgs e)
        {
            if (sender is Control control && _animatedFocusEnabled)
            {
                // Add subtle focus animation
                var transform = new ScaleTransform(1.0, 1.0, 0.5, 0.5);
                control.RenderTransform = transform;

                var animation = new DoubleAnimation(1.0, 1.02, TimeSpan.FromMilliseconds(150))
                {
                    AutoReverse = true,
                    EasingFunction = new SineEase { EasingMode = EasingMode.EaseInOut }
                };

                transform.BeginAnimation(ScaleTransform.ScaleXProperty, animation);
                transform.BeginAnimation(ScaleTransform.ScaleYProperty, animation);
            }
        }

        private void OnControlLostFocus(object sender, RoutedEventArgs e)
        {
            if (sender is Control control)
            {
                control.RenderTransform = null;
            }
        }

        private void ProvideKeyboardFeedback(Control control)
        {
            if (_animatedFocusEnabled)
            {
                var originalBrush = control.BorderBrush;
                control.BorderBrush = new SolidColorBrush(Colors.LightBlue);

                var colorAnimation = new ColorAnimation
                {
                    From = Colors.LightBlue,
                    To = ((SolidColorBrush)originalBrush)?.Color ?? Colors.Transparent,
                    Duration = TimeSpan.FromMilliseconds(300)
                };

                colorAnimation.Completed += (s, e) => control.BorderBrush = originalBrush;
                
                if (control.BorderBrush is SolidColorBrush brush)
                {
                    brush.BeginAnimation(SolidColorBrush.ColorProperty, colorAnimation);
                }
            }
        }

        private System.Collections.Generic.List<FrameworkElement> GetFocusableElements(FrameworkElement container)
        {
            var focusableElements = new System.Collections.Generic.List<FrameworkElement>();
            GetFocusableElementsRecursive(container, focusableElements);
            return focusableElements;
        }

        private void GetFocusableElementsRecursive(DependencyObject parent, System.Collections.Generic.List<FrameworkElement> focusableElements)
        {
            var childrenCount = VisualTreeHelper.GetChildrenCount(parent);
            for (int i = 0; i < childrenCount; i++)
            {
                var child = VisualTreeHelper.GetChild(parent, i);
                if (child is FrameworkElement element && element.Focusable && element.IsVisible && element.IsEnabled)
                {
                    focusableElements.Add(element);
                }
                GetFocusableElementsRecursive(child, focusableElements);
            }
        }

        #endregion
    }

    /// <summary>
    /// Statistics for focus visualization
    /// </summary>
    public class FocusVisualizationStats
    {
        public bool HighContrastMode { get; set; }
        public bool AnimatedFocusEnabled { get; set; }
        public int FocusStylesLoaded { get; set; }

        public override string ToString()
        {
            return $"Focus: HighContrast={HighContrastMode}, Animated={AnimatedFocusEnabled}, Styles={FocusStylesLoaded}";
        }
    }
}