using System;
using System.ComponentModel;
using System.Threading.Tasks;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Media.Animation;
using MandADiscoverySuite.Services;

namespace MandADiscoverySuite.Controls
{
    /// <summary>
    /// Button control for entering/exiting presentation mode
    /// </summary>
    public partial class PresentationModeButton : UserControl, INotifyPropertyChanged, IPresentationModeAware
    {
        private FrameworkElement _targetContent;
        private PresentationModeSettings _presentationSettings;

        public PresentationModeButton()
        {
            InitializeComponent();
            DataContext = this;
            
            // Register with presentation service
            PresentationModeService.Instance.RegisterPresentationAwareControl(this);
            PresentationModeService.Instance.PresentationModeChanged += OnPresentationModeChanged;
            
            UpdateButtonState(PresentationModeService.Instance.IsPresentationMode);
        }

        #region Dependency Properties

        public static readonly DependencyProperty TargetContentProperty =
            DependencyProperty.Register("TargetContent", typeof(FrameworkElement), typeof(PresentationModeButton),
                new PropertyMetadata(null, OnTargetContentChanged));

        public static readonly DependencyProperty PresentationSettingsProperty =
            DependencyProperty.Register("PresentationSettings", typeof(PresentationModeSettings), typeof(PresentationModeButton),
                new PropertyMetadata(null, OnPresentationSettingsChanged));

        public static readonly DependencyProperty ShowTextProperty =
            DependencyProperty.Register("ShowText", typeof(bool), typeof(PresentationModeButton),
                new PropertyMetadata(true, OnShowTextChanged));

        public static readonly DependencyProperty TextProperty =
            DependencyProperty.Register("Text", typeof(string), typeof(PresentationModeButton),
                new PropertyMetadata("Present", OnTextChanged));

        public static readonly DependencyProperty ExitTextProperty =
            DependencyProperty.Register("ExitText", typeof(string), typeof(PresentationModeButton),
                new PropertyMetadata("Exit", OnExitTextChanged));

        #endregion

        #region Properties

        /// <summary>
        /// Gets or sets the content to present
        /// </summary>
        public FrameworkElement TargetContent
        {
            get { return (FrameworkElement)GetValue(TargetContentProperty); }
            set { SetValue(TargetContentProperty, value); }
        }

        /// <summary>
        /// Gets or sets the presentation mode settings
        /// </summary>
        public PresentationModeSettings PresentationSettings
        {
            get { return (PresentationModeSettings)GetValue(PresentationSettingsProperty); }
            set { SetValue(PresentationSettingsProperty, value); }
        }

        /// <summary>
        /// Gets or sets whether to show the button text
        /// </summary>
        public bool ShowText
        {
            get { return (bool)GetValue(ShowTextProperty); }
            set { SetValue(ShowTextProperty, value); }
        }

        /// <summary>
        /// Gets or sets the button text for entering presentation mode
        /// </summary>
        public string Text
        {
            get { return (string)GetValue(TextProperty); }
            set { SetValue(TextProperty, value); }
        }

        /// <summary>
        /// Gets or sets the button text for exiting presentation mode
        /// </summary>
        public string ExitText
        {
            get { return (string)GetValue(ExitTextProperty); }
            set { SetValue(ExitTextProperty, value); }
        }

        /// <summary>
        /// Gets whether presentation mode is currently active
        /// </summary>
        public bool IsPresentationMode => PresentationModeService.Instance.IsPresentationMode;

        #endregion

        #region Public Methods

        /// <summary>
        /// Sets the target content for presentation
        /// </summary>
        public void SetTargetContent(FrameworkElement content, PresentationModeSettings settings = null)
        {
            TargetContent = content;
            PresentationSettings = settings;
        }

        /// <summary>
        /// Manually triggers presentation mode toggle
        /// </summary>
        public async Task TogglePresentationModeAsync()
        {
            await HandlePresentationToggle();
        }

        #endregion

        #region Private Methods

        private async Task HandlePresentationToggle()
        {
            try
            {
                MainButton.IsEnabled = false;
                
                if (PresentationModeService.Instance.IsPresentationMode)
                {
                    await PresentationModeService.Instance.ExitPresentationModeAsync();
                }
                else
                {
                    var content = _targetContent ?? TargetContent ?? FindTargetContent();
                    if (content != null)
                    {
                        var settings = _presentationSettings ?? PresentationSettings ?? new PresentationModeSettings();
                        await PresentationModeService.Instance.EnterPresentationModeAsync(content, settings);
                    }
                    else
                    {
                        MessageBox.Show("No content specified for presentation mode.", "Presentation Mode",
                            MessageBoxButton.OK, MessageBoxImage.Information);
                    }
                }
            }
            catch (Exception ex)
            {
                MessageBox.Show($"Error toggling presentation mode: {ex.Message}", "Error",
                    MessageBoxButton.OK, MessageBoxImage.Error);
            }
            finally
            {
                MainButton.IsEnabled = true;
            }
        }

        private FrameworkElement FindTargetContent()
        {
            // Try to find the main content area
            var window = Window.GetWindow(this);
            if (window?.Content is FrameworkElement content)
            {
                return content;
            }

            // Look for a parent that might be the main content
            var parent = Parent;
            while (parent != null)
            {
                if (parent is UserControl userControl)
                    return userControl;
                
                if (parent is FrameworkElement element && element.Name?.Contains("Content") == true)
                    return element;

                parent = parent is FrameworkElement fe ? fe.Parent : null;
            }

            return null;
        }

        private void UpdateButtonState(bool isPresentationMode)
        {
            if (isPresentationMode)
            {
                ButtonText.Text = ShowText ? ExitText : "";
                ToolTip = "Exit Presentation Mode (ESC)";
                
                var enterAnimation = FindResource("EnterPresentationAnimation") as Storyboard;
                enterAnimation?.Begin();
            }
            else
            {
                ButtonText.Text = ShowText ? Text : "";
                ToolTip = "Enter Presentation Mode";
                
                var exitAnimation = FindResource("ExitPresentationAnimation") as Storyboard;
                exitAnimation?.Begin();
            }

            PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(nameof(IsPresentationMode)));
        }

        #endregion

        #region Event Handlers

        private static void OnTargetContentChanged(DependencyObject d, DependencyPropertyChangedEventArgs e)
        {
            if (d is PresentationModeButton button)
            {
                button._targetContent = e.NewValue as FrameworkElement;
            }
        }

        private static void OnPresentationSettingsChanged(DependencyObject d, DependencyPropertyChangedEventArgs e)
        {
            if (d is PresentationModeButton button)
            {
                button._presentationSettings = e.NewValue as PresentationModeSettings;
            }
        }

        private static void OnShowTextChanged(DependencyObject d, DependencyPropertyChangedEventArgs e)
        {
            if (d is PresentationModeButton button)
            {
                button.ButtonText.Visibility = (bool)e.NewValue ? Visibility.Visible : Visibility.Collapsed;
            }
        }

        private static void OnTextChanged(DependencyObject d, DependencyPropertyChangedEventArgs e)
        {
            if (d is PresentationModeButton button && !button.IsPresentationMode)
            {
                button.ButtonText.Text = button.ShowText ? (string)e.NewValue : "";
            }
        }

        private static void OnExitTextChanged(DependencyObject d, DependencyPropertyChangedEventArgs e)
        {
            if (d is PresentationModeButton button && button.IsPresentationMode)
            {
                button.ButtonText.Text = button.ShowText ? (string)e.NewValue : "";
            }
        }

        private async void PresentationButton_Click(object sender, RoutedEventArgs e)
        {
            await HandlePresentationToggle();
        }

        private void OnPresentationModeChanged(object sender, PresentationModeChangedEventArgs e)
        {
            Dispatcher.BeginInvoke(new Action(() => UpdateButtonState(e.IsPresentationMode)));
        }

        #endregion

        #region IPresentationModeAware Implementation

        public void OnPresentationModeEntered()
        {
            // Button automatically updates via event handler
        }

        public void OnPresentationModeExited()
        {
            // Button automatically updates via event handler
        }

        #endregion

        #region INotifyPropertyChanged

        public event PropertyChangedEventHandler PropertyChanged;

        #endregion

        #region Cleanup

        private void UserControl_Unloaded(object sender, RoutedEventArgs e)
        {
            PresentationModeService.Instance.UnregisterPresentationAwareControl(this);
            PresentationModeService.Instance.PresentationModeChanged -= OnPresentationModeChanged;
        }

        #endregion
    }

    /// <summary>
    /// Extension methods for presentation mode functionality
    /// </summary>
    public static class PresentationModeExtensions
    {
        /// <summary>
        /// Marks an element to be hidden in presentation mode
        /// </summary>
        public static T HideInPresentationMode<T>(this T element, bool hide = true) where T : DependencyObject
        {
            PresentationModeService.SetHideInPresentationMode(element, hide);
            return element;
        }

        /// <summary>
        /// Adds a presentation mode button to the specified panel
        /// </summary>
        public static PresentationModeButton AddPresentationButton(this Panel panel, FrameworkElement targetContent = null)
        {
            var button = new PresentationModeButton
            {
                TargetContent = targetContent,
                HorizontalAlignment = HorizontalAlignment.Right,
                VerticalAlignment = VerticalAlignment.Top,
                Margin = new Thickness(0, 0, 10, 0)
            };

            panel.Children.Add(button);
            return button;
        }

        /// <summary>
        /// Enters presentation mode for this element
        /// </summary>
        public static async Task EnterPresentationModeAsync(this FrameworkElement element, 
            PresentationModeSettings settings = null)
        {
            await PresentationModeService.Instance.EnterPresentationModeAsync(element, settings);
        }

        /// <summary>
        /// Exits presentation mode
        /// </summary>
        public static async Task ExitPresentationModeAsync(this FrameworkElement element)
        {
            await PresentationModeService.Instance.ExitPresentationModeAsync();
        }
    }
}