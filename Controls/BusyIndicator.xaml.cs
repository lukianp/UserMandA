using System;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Media;
using System.Windows.Media.Animation;

// Suppress false positive warnings from XAML-generated code
#pragma warning disable CS0103 // The name 'InitializeComponent' does not exist in the current context
#pragma warning disable CS1061 // Type does not contain a definition for member

namespace MandADiscoverySuite.Controls
{
    /// <summary>
    /// Versatile busy indicator with multiple animation styles
    /// </summary>
    public partial class BusyIndicator : UserControl
    {
        private Storyboard? _currentAnimation;

        // Helper method to safely access XAML-generated fields
        private T? GetXamlField<T>(string fieldName) where T : class
        {
            try
            {
                var field = GetType().GetField(fieldName, System.Reflection.BindingFlags.NonPublic | System.Reflection.BindingFlags.Instance);
                return field?.GetValue(this) as T;
            }
            catch
            {
                return null;
            }
        }

        public BusyIndicator()
        {
            // Initialize XAML components - IDE may show false error here but this works at runtime
            InitializeComponent();
        }

        #region Dependency Properties

        public static readonly DependencyProperty IndicatorStyleProperty =
            DependencyProperty.Register("IndicatorStyle", typeof(BusyIndicatorStyle), typeof(BusyIndicator),
                new PropertyMetadata(BusyIndicatorStyle.SpinningDots, OnIndicatorStyleChanged));

        public static readonly DependencyProperty IsActiveProperty =
            DependencyProperty.Register("IsActive", typeof(bool), typeof(BusyIndicator),
                new PropertyMetadata(false, OnIsActiveChanged));

        public static readonly DependencyProperty TextProperty =
            DependencyProperty.Register("Text", typeof(string), typeof(BusyIndicator),
                new PropertyMetadata("Loading...", OnTextChanged));

        public static readonly DependencyProperty ShowTextProperty =
            DependencyProperty.Register("ShowText", typeof(bool), typeof(BusyIndicator),
                new PropertyMetadata(false, OnShowTextChanged));

        public static readonly DependencyProperty ScaleProperty =
            DependencyProperty.Register("Scale", typeof(double), typeof(BusyIndicator),
                new PropertyMetadata(1.0, OnScaleChanged));

        #endregion

        #region Properties

        /// <summary>
        /// Gets or sets the indicator animation style
        /// </summary>
        public BusyIndicatorStyle IndicatorStyle
        {
            get { return (BusyIndicatorStyle)GetValue(IndicatorStyleProperty); }
            set { SetValue(IndicatorStyleProperty, value); }
        }

        /// <summary>
        /// Gets or sets whether the indicator is active
        /// </summary>
        public bool IsActive
        {
            get { return (bool)GetValue(IsActiveProperty); }
            set { SetValue(IsActiveProperty, value); }
        }

        /// <summary>
        /// Gets or sets the text to display
        /// </summary>
        public string Text
        {
            get { return (string)GetValue(TextProperty); }
            set { SetValue(TextProperty, value); }
        }

        /// <summary>
        /// Gets or sets whether to show text below the indicator
        /// </summary>
        public bool ShowText
        {
            get { return (bool)GetValue(ShowTextProperty); }
            set { SetValue(ShowTextProperty, value); }
        }

        /// <summary>
        /// Gets or sets the scale of the indicator
        /// </summary>
        public double Scale
        {
            get { return (double)GetValue(ScaleProperty); }
            set { SetValue(ScaleProperty, value); }
        }

        #endregion

        #region Event Handlers

        private static void OnIndicatorStyleChanged(DependencyObject d, DependencyPropertyChangedEventArgs e)
        {
            if (d is BusyIndicator indicator)
            {
                indicator.UpdateIndicatorStyle();
            }
        }

        private static void OnIsActiveChanged(DependencyObject d, DependencyPropertyChangedEventArgs e)
        {
            if (d is BusyIndicator indicator)
            {
                indicator.UpdateActiveState();
            }
        }

        private static void OnTextChanged(DependencyObject d, DependencyPropertyChangedEventArgs e)
        {
            if (d is BusyIndicator indicator)
            {
                // Defensive approach to handle XAML-generated fields
                var busyTextField = indicator.GetType().GetField("BusyText", System.Reflection.BindingFlags.NonPublic | System.Reflection.BindingFlags.Instance);
                if (busyTextField?.GetValue(indicator) is TextBlock busyText)
                {
                    busyText.Text = (string)e.NewValue;
                }
            }
        }

        private static void OnShowTextChanged(DependencyObject d, DependencyPropertyChangedEventArgs e)
        {
            if (d is BusyIndicator indicator)
            {
                var busyText = indicator.GetXamlField<TextBlock>("BusyText");
                if (busyText != null)
                {
                    busyText.Visibility = (bool)e.NewValue ? Visibility.Visible : Visibility.Collapsed;
                }
            }
        }

        private static void OnScaleChanged(DependencyObject d, DependencyPropertyChangedEventArgs e)
        {
            if (d is BusyIndicator indicator)
            {
                var scale = (double)e.NewValue;
                var indicatorRoot = indicator.GetXamlField<Grid>("IndicatorRoot");
                if (indicatorRoot != null)
                {
                    indicatorRoot.LayoutTransform = new System.Windows.Media.ScaleTransform(scale, scale);
                }
            }
        }

        #endregion

        #region Private Methods

        private void UpdateIndicatorStyle()
        {
            // Hide all indicators using helper method
            SetElementVisibility("SpinningDots", Visibility.Collapsed);
            SetElementVisibility("WaveBars", Visibility.Collapsed);
            SetElementVisibility("PulseRings", Visibility.Collapsed);
            SetElementVisibility("BouncingDots", Visibility.Collapsed);
            SetElementVisibility("ModernRing", Visibility.Collapsed);

            // Stop current animation
            StopCurrentAnimation();

            // Show selected indicator and start animation
            switch (IndicatorStyle)
            {
                case BusyIndicatorStyle.SpinningDots:
                    SetElementVisibility("SpinningDots", Visibility.Visible);
                    if (IsActive)
                        StartAnimation("SpinningDotsAnimation");
                    break;

                case BusyIndicatorStyle.WaveBars:
                    SetElementVisibility("WaveBars", Visibility.Visible);
                    if (IsActive)
                        StartAnimation("WaveAnimation");
                    break;

                case BusyIndicatorStyle.PulseRings:
                    SetElementVisibility("PulseRings", Visibility.Visible);
                    if (IsActive)
                        StartAnimation("PulseRingAnimation");
                    break;

                case BusyIndicatorStyle.BouncingDots:
                    SetElementVisibility("BouncingDots", Visibility.Visible);
                    if (IsActive)
                        StartAnimation("BouncingDotsAnimation");
                    break;

                case BusyIndicatorStyle.ModernRing:
                    SetElementVisibility("ModernRing", Visibility.Visible);
                    if (IsActive)
                        StartModernRingAnimation();
                    break;
            }
        }

        // Helper method to set visibility of XAML elements
        private void SetElementVisibility(string elementName, Visibility visibility)
        {
            var element = GetXamlField<UIElement>(elementName);
            if (element != null)
            {
                element.Visibility = visibility;
            }
        }

        private void UpdateActiveState()
        {
            if (IsActive)
            {
                Visibility = Visibility.Visible;
                UpdateIndicatorStyle();
            }
            else
            {
                StopCurrentAnimation();
                Visibility = Visibility.Collapsed;
            }
        }

        private void StartAnimation(string animationName)
        {
            if (Resources[animationName] is Storyboard animation)
            {
                _currentAnimation = animation;
                animation.Begin();
            }
        }

        private void StartModernRingAnimation()
        {
            var rotation = new DoubleAnimation
            {
                From = 0,
                To = 360,
                Duration = TimeSpan.FromSeconds(1.2),
                RepeatBehavior = RepeatBehavior.Forever
            };

            var modernRingRotation = GetXamlField<RotateTransform>("ModernRingRotation");
            if (modernRingRotation != null)
            {
                Storyboard.SetTarget(rotation, modernRingRotation);
                Storyboard.SetTargetProperty(rotation, new PropertyPath("Angle"));

                var storyboard = new Storyboard();
                storyboard.Children.Add(rotation);

                _currentAnimation = storyboard;
                storyboard.Begin();
            }
        }

        private void StopCurrentAnimation()
        {
            _currentAnimation?.Stop();
            _currentAnimation = null;
        }

        #endregion

        #region Public Methods

        /// <summary>
        /// Shows the busy indicator with optional text
        /// </summary>
        public void Show(string text = null)
        {
            if (!string.IsNullOrEmpty(text))
            {
                Text = text;
                ShowText = true;
            }
            IsActive = true;
        }

        /// <summary>
        /// Hides the busy indicator
        /// </summary>
        public void Hide()
        {
            IsActive = false;
        }

        /// <summary>
        /// Updates the text while the indicator is active
        /// </summary>
        public void UpdateText(string text)
        {
            Text = text;
            if (!ShowText && !string.IsNullOrEmpty(text))
            {
                ShowText = true;
            }
        }

        #endregion

        #region Static Factory Methods

        /// <summary>
        /// Creates a minimal busy indicator
        /// </summary>
        public static BusyIndicator CreateMinimal()
        {
            return new BusyIndicator
            {
                IndicatorStyle = BusyIndicatorStyle.SpinningDots,
                ShowText = false,
                Scale = 0.8
            };
        }

        /// <summary>
        /// Creates a standard busy indicator with text
        /// </summary>
        public static BusyIndicator CreateStandard(string text = "Loading...")
        {
            return new BusyIndicator
            {
                IndicatorStyle = BusyIndicatorStyle.ModernRing,
                Text = text,
                ShowText = true,
                Scale = 1.0
            };
        }

        /// <summary>
        /// Creates a large busy indicator for full-screen overlays
        /// </summary>
        public static BusyIndicator CreateLarge(string text = "Processing...")
        {
            return new BusyIndicator
            {
                IndicatorStyle = BusyIndicatorStyle.PulseRings,
                Text = text,
                ShowText = true,
                Scale = 1.5
            };
        }

        #endregion
    }

    /// <summary>
    /// Available busy indicator styles
    /// </summary>
    public enum BusyIndicatorStyle
    {
        /// <summary>
        /// Classic spinning dots in a circle
        /// </summary>
        SpinningDots,

        /// <summary>
        /// Animated wave bars
        /// </summary>
        WaveBars,

        /// <summary>
        /// Pulsing rings expanding outward
        /// </summary>
        PulseRings,

        /// <summary>
        /// Three dots bouncing up and down
        /// </summary>
        BouncingDots,

        /// <summary>
        /// Modern circular progress ring
        /// </summary>
        ModernRing
    }

    /// <summary>
    /// Helper class for managing busy states
    /// </summary>
    public class BusyStateManager
    {
        private readonly BusyIndicator _indicator;
        private int _busyCount;

        public BusyStateManager(BusyIndicator indicator)
        {
            _indicator = indicator ?? throw new ArgumentNullException(nameof(indicator));
        }

        /// <summary>
        /// Increments the busy counter and shows the indicator
        /// </summary>
        public void EnterBusyState(string message = null!)
        {
            _busyCount++;
            if (_busyCount == 1)
            {
                _indicator.Show(message);
            }
            else if (!string.IsNullOrEmpty(message))
            {
                _indicator.UpdateText(message);
            }
        }

        /// <summary>
        /// Decrements the busy counter and hides the indicator when zero
        /// </summary>
        public void ExitBusyState()
        {
            if (_busyCount > 0)
            {
                _busyCount--;
                if (_busyCount == 0)
                {
                    _indicator.Hide();
                }
            }
        }

        /// <summary>
        /// Forces the indicator to hide regardless of counter
        /// </summary>
        public void ForceExit()
        {
            _busyCount = 0;
            _indicator.Hide();
        }

        /// <summary>
        /// Gets whether the indicator is currently busy
        /// </summary>
        public bool IsBusy => _busyCount > 0;
    }
}