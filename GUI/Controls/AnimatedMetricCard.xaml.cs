using System;
using System.ComponentModel;
using System.Globalization;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Media;
using MandADiscoverySuite.Services;

namespace MandADiscoverySuite.Controls
{
    /// <summary>
    /// Animated metric card for displaying dashboard metrics with smooth transitions
    /// </summary>
    public partial class AnimatedMetricCard : UserControl, INotifyPropertyChanged
    {
        private readonly MetricAnimationService _animationService;
        private double _currentValue;
        private double _previousValue;

        public AnimatedMetricCard()
        {
            InitializeComponent();
            _animationService = new MetricAnimationService();
            DataContext = this;
        }

        #region Dependency Properties

        public static readonly DependencyProperty TitleProperty =
            DependencyProperty.Register("Title", typeof(string), typeof(AnimatedMetricCard),
                new PropertyMetadata("Metric", OnTitleChanged));

        public static readonly DependencyProperty ValueProperty =
            DependencyProperty.Register("Value", typeof(double), typeof(AnimatedMetricCard),
                new PropertyMetadata(0.0, OnValueChanged));

        public static readonly DependencyProperty IconProperty =
            DependencyProperty.Register("Icon", typeof(string), typeof(AnimatedMetricCard),
                new PropertyMetadata("📊", OnIconChanged));

        public static readonly DependencyProperty FormatProperty =
            DependencyProperty.Register("Format", typeof(string), typeof(AnimatedMetricCard),
                new PropertyMetadata("N0", OnFormatChanged));

        public static readonly DependencyProperty ShowProgressProperty =
            DependencyProperty.Register("ShowProgress", typeof(bool), typeof(AnimatedMetricCard),
                new PropertyMetadata(false, OnShowProgressChanged));

        public static readonly DependencyProperty ProgressValueProperty =
            DependencyProperty.Register("ProgressValue", typeof(double), typeof(AnimatedMetricCard),
                new PropertyMetadata(0.0, OnProgressValueChanged));

        public static readonly DependencyProperty ShowTrendProperty =
            DependencyProperty.Register("ShowTrend", typeof(bool), typeof(AnimatedMetricCard),
                new PropertyMetadata(false, OnShowTrendChanged));

        public static readonly DependencyProperty TrendPercentageProperty =
            DependencyProperty.Register("TrendPercentage", typeof(double), typeof(AnimatedMetricCard),
                new PropertyMetadata(0.0, OnTrendPercentageChanged));

        public static readonly DependencyProperty AnimationTypeProperty =
            DependencyProperty.Register("AnimationType", typeof(MetricAnimationType), typeof(AnimatedMetricCard),
                new PropertyMetadata(MetricAnimationType.CountUp));

        public static readonly DependencyProperty IsLoadingProperty =
            DependencyProperty.Register("IsLoading", typeof(bool), typeof(AnimatedMetricCard),
                new PropertyMetadata(false, OnIsLoadingChanged));

        public static readonly DependencyProperty SubtitleProperty =
            DependencyProperty.Register("Subtitle", typeof(string), typeof(AnimatedMetricCard),
                new PropertyMetadata("", OnSubtitleChanged));

        public static readonly DependencyProperty AccentColorProperty =
            DependencyProperty.Register("AccentColor", typeof(Brush), typeof(AnimatedMetricCard),
                new PropertyMetadata(null, OnAccentColorChanged));

        #endregion

        #region Properties

        /// <summary>
        /// Gets or sets the metric title
        /// </summary>
        public string Title
        {
            get { return (string)GetValue(TitleProperty); }
            set { SetValue(TitleProperty, value); }
        }

        /// <summary>
        /// Gets or sets the metric value
        /// </summary>
        public double Value
        {
            get { return (double)GetValue(ValueProperty); }
            set { SetValue(ValueProperty, value); }
        }

        /// <summary>
        /// Gets or sets the metric icon
        /// </summary>
        public string Icon
        {
            get { return (string)GetValue(IconProperty); }
            set { SetValue(IconProperty, value); }
        }

        /// <summary>
        /// Gets or sets the value format string
        /// </summary>
        public string Format
        {
            get { return (string)GetValue(FormatProperty); }
            set { SetValue(FormatProperty, value); }
        }

        /// <summary>
        /// Gets or sets whether to show the progress bar
        /// </summary>
        public bool ShowProgress
        {
            get { return (bool)GetValue(ShowProgressProperty); }
            set { SetValue(ShowProgressProperty, value); }
        }

        /// <summary>
        /// Gets or sets the progress value (0-100)
        /// </summary>
        public double ProgressValue
        {
            get { return (double)GetValue(ProgressValueProperty); }
            set { SetValue(ProgressValueProperty, value); }
        }

        /// <summary>
        /// Gets or sets whether to show trend indicator
        /// </summary>
        public bool ShowTrend
        {
            get { return (bool)GetValue(ShowTrendProperty); }
            set { SetValue(ShowTrendProperty, value); }
        }

        /// <summary>
        /// Gets or sets the trend percentage
        /// </summary>
        public double TrendPercentage
        {
            get { return (double)GetValue(TrendPercentageProperty); }
            set { SetValue(TrendPercentageProperty, value); }
        }

        /// <summary>
        /// Gets or sets the animation type
        /// </summary>
        public MetricAnimationType AnimationType
        {
            get { return (MetricAnimationType)GetValue(AnimationTypeProperty); }
            set { SetValue(AnimationTypeProperty, value); }
        }

        /// <summary>
        /// Gets or sets whether the metric is loading
        /// </summary>
        public bool IsLoading
        {
            get { return (bool)GetValue(IsLoadingProperty); }
            set { SetValue(IsLoadingProperty, value); }
        }

        /// <summary>
        /// Gets or sets the subtitle text
        /// </summary>
        public string Subtitle
        {
            get { return (string)GetValue(SubtitleProperty); }
            set { SetValue(SubtitleProperty, value); }
        }

        /// <summary>
        /// Gets or sets the accent color
        /// </summary>
        public Brush AccentColor
        {
            get { return (Brush)GetValue(AccentColorProperty); }
            set { SetValue(AccentColorProperty, value); }
        }

        #endregion

        #region Public Methods

        /// <summary>
        /// Updates the metric value with animation
        /// </summary>
        public void UpdateValue(double newValue, bool animate = true)
        {
            if (animate && Math.Abs(newValue - _currentValue) > 0.01)
            {
                _previousValue = _currentValue;
                _currentValue = newValue;

                _animationService.AnimateMetricChange(ValueText, _previousValue, newValue, 
                    AnimationType, TimeSpan.FromMilliseconds(1500), Format, OnAnimationComplete);

                // Add visual feedback for significant changes
                if (Math.Abs(newValue - _previousValue) > _previousValue * 0.1) // 10% change
                {
                    _animationService.HighlightMetricChange(this, newValue > _previousValue);
                    this.Pulse(2);
                }
            }
            else
            {
                _currentValue = newValue;
                ValueText.Text = newValue.ToString(Format, CultureInfo.CurrentCulture);
            }

            Value = newValue;
        }

        /// <summary>
        /// Updates the progress value with animation
        /// </summary>
        public void UpdateProgress(double newProgress, bool animate = true)
        {
            if (animate)
            {
                _animationService.AnimatePercentageMetric(ProgressBar, null, 
                    ProgressValue, newProgress, TimeSpan.FromMilliseconds(1000));
            }
            else
            {
                ProgressBar.Value = newProgress;
            }

            ProgressValue = newProgress;
        }

        /// <summary>
        /// Shows the loading state
        /// </summary>
        public void ShowLoading()
        {
            IsLoading = true;
        }

        /// <summary>
        /// Hides the loading state
        /// </summary>
        public void HideLoading()
        {
            IsLoading = false;
        }

        /// <summary>
        /// Pulses the card to draw attention
        /// </summary>
        public void Pulse(int count = 3)
        {
            _animationService.PulseMetric(this, count);
        }

        #endregion

        #region Event Handlers

        private static void OnTitleChanged(DependencyObject d, DependencyPropertyChangedEventArgs e)
        {
            if (d is AnimatedMetricCard card)
            {
                card.TitleText.Text = (string)e.NewValue;
            }
        }

        private static void OnValueChanged(DependencyObject d, DependencyPropertyChangedEventArgs e)
        {
            if (d is AnimatedMetricCard card)
            {
                card.UpdateValue((double)e.NewValue);
            }
        }

        private static void OnIconChanged(DependencyObject d, DependencyPropertyChangedEventArgs e)
        {
            if (d is AnimatedMetricCard card)
            {
                card.IconText.Text = (string)e.NewValue;
            }
        }

        private static void OnFormatChanged(DependencyObject d, DependencyPropertyChangedEventArgs e)
        {
            if (d is AnimatedMetricCard card)
            {
                card.ValueText.Text = card._currentValue.ToString((string)e.NewValue, CultureInfo.CurrentCulture);
            }
        }

        private static void OnShowProgressChanged(DependencyObject d, DependencyPropertyChangedEventArgs e)
        {
            if (d is AnimatedMetricCard card)
            {
                card.ProgressBar.Visibility = (bool)e.NewValue ? Visibility.Visible : Visibility.Collapsed;
            }
        }

        private static void OnProgressValueChanged(DependencyObject d, DependencyPropertyChangedEventArgs e)
        {
            if (d is AnimatedMetricCard card)
            {
                card.UpdateProgress((double)e.NewValue);
            }
        }

        private static void OnShowTrendChanged(DependencyObject d, DependencyPropertyChangedEventArgs e)
        {
            if (d is AnimatedMetricCard card)
            {
                card.TrendIndicator.Visibility = (bool)e.NewValue ? Visibility.Visible : Visibility.Collapsed;
            }
        }

        private static void OnTrendPercentageChanged(DependencyObject d, DependencyPropertyChangedEventArgs e)
        {
            if (d is AnimatedMetricCard card)
            {
                var percentage = (double)e.NewValue;
                var isPositive = percentage >= 0;
                
                card.TrendArrow.Text = isPositive ? "↗" : "↘";
                card.TrendText.Text = $"{(isPositive ? "+" : "")}{percentage:F1}%";
                
                var color = isPositive ? 
                    Application.Current.FindResource("SuccessBrush") as Brush ?? Brushes.Green :
                    Application.Current.FindResource("ErrorBrush") as Brush ?? Brushes.Red;
                
                card.TrendArrow.Foreground = color;
                card.TrendText.Foreground = color;
            }
        }

        private static void OnIsLoadingChanged(DependencyObject d, DependencyPropertyChangedEventArgs e)
        {
            if (d is AnimatedMetricCard card)
            {
                card.LoadingIndicator.Visibility = (bool)e.NewValue ? Visibility.Visible : Visibility.Collapsed;
            }
        }

        private static void OnSubtitleChanged(DependencyObject d, DependencyPropertyChangedEventArgs e)
        {
            if (d is AnimatedMetricCard card)
            {
                var subtitle = (string)e.NewValue;
                card.SubtitleText.Text = subtitle;
                card.SubtitleText.Visibility = string.IsNullOrEmpty(subtitle) ? Visibility.Collapsed : Visibility.Visible;
            }
        }

        private static void OnAccentColorChanged(DependencyObject d, DependencyPropertyChangedEventArgs e)
        {
            if (d is AnimatedMetricCard card && e.NewValue is Brush brush)
            {
                card.IconContainer.Background = brush;
                card.ProgressBar.Foreground = brush;
            }
        }

        private void OnAnimationComplete()
        {
            // Animation completed - could trigger additional effects here
            PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(nameof(Value)));
        }

        #endregion

        #region INotifyPropertyChanged

        public event PropertyChangedEventHandler PropertyChanged;

        #endregion

        #region Cleanup

        private void UserControl_Unloaded(object sender, RoutedEventArgs e)
        {
            _animationService?.Dispose();
        }

        #endregion
    }
}