using System;
using System.ComponentModel;
using System.Threading.Tasks;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Media;
using System.Windows.Media.Animation;
using System.Windows.Threading;

namespace MandADiscoverySuite.Controls
{
    /// <summary>
    /// Improved progress overlay with multiple display modes and smooth animations
    /// </summary>
    public partial class ImprovedProgressOverlay : UserControl
    {
        private Storyboard _currentAnimation;
        private DispatcherTimer _progressTimer;
        private Action _cancelAction;

        public ImprovedProgressOverlay()
        {
            InitializeComponent();
            _progressTimer = new DispatcherTimer { Interval = TimeSpan.FromMilliseconds(100) };
            _progressTimer.Tick += OnProgressTimerTick;
        }

        #region Dependency Properties

        public static readonly DependencyProperty ProgressModeProperty =
            DependencyProperty.Register("ProgressMode", typeof(ProgressMode), typeof(ImprovedProgressOverlay),
                new PropertyMetadata(ProgressMode.Indeterminate, OnProgressModeChanged));

        public static readonly DependencyProperty ProgressValueProperty =
            DependencyProperty.Register("ProgressValue", typeof(double), typeof(ImprovedProgressOverlay),
                new PropertyMetadata(0.0, OnProgressValueChanged));

        public static readonly DependencyProperty TitleProperty =
            DependencyProperty.Register("Title", typeof(string), typeof(ImprovedProgressOverlay),
                new PropertyMetadata("Processing...", OnTitleChanged));

        public static readonly DependencyProperty MessageProperty =
            DependencyProperty.Register("Message", typeof(string), typeof(ImprovedProgressOverlay),
                new PropertyMetadata("Please wait while we complete your request", OnMessageChanged));

        public static readonly DependencyProperty SubMessageProperty =
            DependencyProperty.Register("SubMessage", typeof(string), typeof(ImprovedProgressOverlay),
                new PropertyMetadata("", OnSubMessageChanged));

        public static readonly DependencyProperty IsCancellableProperty =
            DependencyProperty.Register("IsCancellable", typeof(bool), typeof(ImprovedProgressOverlay),
                new PropertyMetadata(false, OnIsCancellableChanged));

        public static readonly DependencyProperty ShowLinearProgressProperty =
            DependencyProperty.Register("ShowLinearProgress", typeof(bool), typeof(ImprovedProgressOverlay),
                new PropertyMetadata(false, OnShowLinearProgressChanged));

        #endregion

        #region Properties

        public ProgressMode ProgressMode
        {
            get { return (ProgressMode)GetValue(ProgressModeProperty); }
            set { SetValue(ProgressModeProperty, value); }
        }

        public double ProgressValue
        {
            get { return (double)GetValue(ProgressValueProperty); }
            set { SetValue(ProgressValueProperty, Math.Max(0, Math.Min(100, value))); }
        }

        public string Title
        {
            get { return (string)GetValue(TitleProperty); }
            set { SetValue(TitleProperty, value); }
        }

        public string Message
        {
            get { return (string)GetValue(MessageProperty); }
            set { SetValue(MessageProperty, value); }
        }

        public string SubMessage
        {
            get { return (string)GetValue(SubMessageProperty); }
            set { SetValue(SubMessageProperty, value); }
        }

        public bool IsCancellable
        {
            get { return (bool)GetValue(IsCancellableProperty); }
            set { SetValue(IsCancellableProperty, value); }
        }

        public bool ShowLinearProgress
        {
            get { return (bool)GetValue(ShowLinearProgressProperty); }
            set { SetValue(ShowLinearProgressProperty, value); }
        }

        #endregion

        #region Public Methods

        /// <summary>
        /// Shows the progress overlay
        /// </summary>
        public async Task ShowAsync()
        {
            OverlayRoot.Visibility = Visibility.Visible;
            UpdateProgressMode();
            StartAnimations();
            
            // Animate in
            var fadeIn = new DoubleAnimation(0, 1, TimeSpan.FromMilliseconds(300))
            {
                EasingFunction = new QuadraticEase { EasingMode = EasingMode.EaseOut }
            };
            
            var scaleX = new DoubleAnimation(0.8, 1, TimeSpan.FromMilliseconds(400))
            {
                EasingFunction = new BackEase { EasingMode = EasingMode.EaseOut, Amplitude = 0.3 }
            };
            
            var scaleY = new DoubleAnimation(0.8, 1, TimeSpan.FromMilliseconds(400))
            {
                EasingFunction = new BackEase { EasingMode = EasingMode.EaseOut, Amplitude = 0.3 }
            };

            OverlayRoot.BeginAnimation(OpacityProperty, fadeIn);
            ContainerScale.BeginAnimation(ScaleTransform.ScaleXProperty, scaleX);
            ContainerScale.BeginAnimation(ScaleTransform.ScaleYProperty, scaleY);
            
            await Task.Delay(400);
        }

        /// <summary>
        /// Hides the progress overlay
        /// </summary>
        public async Task HideAsync()
        {
            StopAnimations();
            
            // Animate out
            var fadeOut = new DoubleAnimation(1, 0, TimeSpan.FromMilliseconds(200))
            {
                EasingFunction = new QuadraticEase { EasingMode = EasingMode.EaseIn }
            };
            
            var scaleX = new DoubleAnimation(1, 0.8, TimeSpan.FromMilliseconds(200))
            {
                EasingFunction = new QuadraticEase { EasingMode = EasingMode.EaseIn }
            };
            
            var scaleY = new DoubleAnimation(1, 0.8, TimeSpan.FromMilliseconds(200))
            {
                EasingFunction = new QuadraticEase { EasingMode = EasingMode.EaseIn }
            };

            OverlayRoot.BeginAnimation(OpacityProperty, fadeOut);
            ContainerScale.BeginAnimation(ScaleTransform.ScaleXProperty, scaleX);
            ContainerScale.BeginAnimation(ScaleTransform.ScaleYProperty, scaleY);
            
            await Task.Delay(200);
            OverlayRoot.Visibility = Visibility.Collapsed;
        }

        /// <summary>
        /// Updates the progress value
        /// </summary>
        public void UpdateProgress(double value, string message = null)
        {
            ProgressValue = value;
            if (!string.IsNullOrEmpty(message))
            {
                Message = message;
            }
        }

        /// <summary>
        /// Sets the cancel action
        /// </summary>
        public void SetCancelAction(Action cancelAction)
        {
            _cancelAction = cancelAction;
            IsCancellable = cancelAction != null;
        }

        /// <summary>
        /// Shows a quick progress for a specific duration
        /// </summary>
        public static async Task ShowQuickProgressAsync(string title, string message, int durationMs = 2000)
        {
            var overlay = new ImprovedProgressOverlay
            {
                Title = title,
                Message = message,
                ProgressMode = ProgressMode.Indeterminate
            };

            if (Application.Current.MainWindow != null)
            {
                var grid = Application.Current.MainWindow.Content as Grid;
                if (grid != null)
                {
                    grid.Children.Add(overlay);
                    await overlay.ShowAsync();
                    await Task.Delay(durationMs);
                    await overlay.HideAsync();
                    grid.Children.Remove(overlay);
                }
            }
        }

        #endregion

        #region Private Methods

        private static void OnProgressModeChanged(DependencyObject d, DependencyPropertyChangedEventArgs e)
        {
            if (d is ImprovedProgressOverlay overlay)
            {
                overlay.UpdateProgressMode();
            }
        }

        private static void OnProgressValueChanged(DependencyObject d, DependencyPropertyChangedEventArgs e)
        {
            if (d is ImprovedProgressOverlay overlay)
            {
                overlay.UpdateProgressValue();
            }
        }

        private static void OnTitleChanged(DependencyObject d, DependencyPropertyChangedEventArgs e)
        {
            if (d is ImprovedProgressOverlay overlay)
            {
                overlay.TitleText.Text = (string)e.NewValue;
            }
        }

        private static void OnMessageChanged(DependencyObject d, DependencyPropertyChangedEventArgs e)
        {
            if (d is ImprovedProgressOverlay overlay)
            {
                overlay.MessageText.Text = (string)e.NewValue;
            }
        }

        private static void OnSubMessageChanged(DependencyObject d, DependencyPropertyChangedEventArgs e)
        {
            if (d is ImprovedProgressOverlay overlay)
            {
                overlay.SubMessageText.Text = (string)e.NewValue;
            }
        }

        private static void OnIsCancellableChanged(DependencyObject d, DependencyPropertyChangedEventArgs e)
        {
            if (d is ImprovedProgressOverlay overlay)
            {
                overlay.CancelButton.Visibility = (bool)e.NewValue ? Visibility.Visible : Visibility.Collapsed;
            }
        }

        private static void OnShowLinearProgressChanged(DependencyObject d, DependencyPropertyChangedEventArgs e)
        {
            if (d is ImprovedProgressOverlay overlay)
            {
                overlay.LinearProgressBar.Visibility = (bool)e.NewValue ? Visibility.Visible : Visibility.Collapsed;
            }
        }

        private void UpdateProgressMode()
        {
            StopAnimations();

            switch (ProgressMode)
            {
                case ProgressMode.Determinate:
                    CircularProgress.Visibility = Visibility.Visible;
                    IndeterminateSpinner.Visibility = Visibility.Collapsed;
                    PulseEllipse.Visibility = Visibility.Collapsed;
                    PercentageText.Visibility = Visibility.Visible;
                    break;

                case ProgressMode.Indeterminate:
                    CircularProgress.Visibility = Visibility.Collapsed;
                    IndeterminateSpinner.Visibility = Visibility.Visible;
                    PulseEllipse.Visibility = Visibility.Collapsed;
                    PercentageText.Visibility = Visibility.Collapsed;
                    StartIndeterminateAnimation();
                    break;

                case ProgressMode.Pulse:
                    CircularProgress.Visibility = Visibility.Collapsed;
                    IndeterminateSpinner.Visibility = Visibility.Collapsed;
                    PulseEllipse.Visibility = Visibility.Visible;
                    PercentageText.Visibility = Visibility.Collapsed;
                    StartPulseAnimation();
                    break;
            }
        }

        private void UpdateProgressValue()
        {
            if (ProgressMode == ProgressMode.Determinate)
            {
                PercentageText.Text = $"{(int)ProgressValue}%";
                
                // Update circular progress arc
                var angle = (ProgressValue / 100) * 360;
                var radians = (angle - 90) * Math.PI / 180;
                var radius = 36;
                var centerX = 40;
                var centerY = 40;
                
                var x = centerX + radius * Math.Cos(radians);
                var y = centerY + radius * Math.Sin(radians);
                
                var largeArc = angle > 180 ? 1 : 0;
                
                var pathData = $"M 40,4 A 36,36 0 {largeArc} 1 {x},{y}";
                ProgressArc.Data = Geometry.Parse(pathData);
            }

            if (ShowLinearProgress)
            {
                LinearProgressBar.Value = ProgressValue;
            }
        }

        private void StartAnimations()
        {
            if (!string.IsNullOrEmpty(SubMessage))
            {
                var dotsAnimation = Resources["DotsAnimation"] as Storyboard;
                dotsAnimation?.Begin();
            }
        }

        private void StopAnimations()
        {
            _currentAnimation?.Stop();
            _currentAnimation = null;
        }

        private void StartIndeterminateAnimation()
        {
            var animation = Resources["ProgressRingAnimation"] as Storyboard;
            if (animation != null)
            {
                _currentAnimation = animation;
                animation.Begin();
            }
        }

        private void StartPulseAnimation()
        {
            var animation = Resources["PulseAnimation"] as Storyboard;
            if (animation != null)
            {
                _currentAnimation = animation;
                animation.Begin();
            }
        }

        private void OnProgressTimerTick(object sender, EventArgs e)
        {
            // Simulated progress for demo
            if (ProgressMode == ProgressMode.Determinate && ProgressValue < 100)
            {
                ProgressValue += 2;
            }
        }

        private void CancelButton_Click(object sender, RoutedEventArgs e)
        {
            _cancelAction?.Invoke();
            _ = HideAsync();
        }

        #endregion
    }

    /// <summary>
    /// Progress display modes
    /// </summary>
    public enum ProgressMode
    {
        /// <summary>
        /// Shows exact progress percentage
        /// </summary>
        Determinate,

        /// <summary>
        /// Shows spinning animation for unknown progress
        /// </summary>
        Indeterminate,

        /// <summary>
        /// Shows pulsing animation
        /// </summary>
        Pulse
    }

    /// <summary>
    /// Helper class for progress operations
    /// </summary>
    public class ProgressOperation : INotifyPropertyChanged
    {
        private double _progress;
        private string _status;
        private bool _isCompleted;

        public double Progress
        {
            get => _progress;
            set
            {
                _progress = value;
                PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(nameof(Progress)));
            }
        }

        public string Status
        {
            get => _status;
            set
            {
                _status = value;
                PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(nameof(Status)));
            }
        }

        public bool IsCompleted
        {
            get => _isCompleted;
            set
            {
                _isCompleted = value;
                PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(nameof(IsCompleted)));
            }
        }

        public event PropertyChangedEventHandler PropertyChanged;

        public void ReportProgress(double progress, string status = null)
        {
            Progress = progress;
            if (!string.IsNullOrEmpty(status))
            {
                Status = status;
            }
        }

        public void Complete()
        {
            Progress = 100;
            IsCompleted = true;
        }
    }
}