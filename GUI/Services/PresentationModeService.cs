using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Input;
using System.Windows.Media;
using System.Windows.Media.Animation;
using MandADiscoverySuite.ViewModels;

namespace MandADiscoverySuite.Services
{
    /// <summary>
    /// Service for managing presentation mode functionality
    /// </summary>
    public class PresentationModeService
    {
        private static PresentationModeService _instance;
        private readonly List<IPresentationModeAware> _presentationAwareControls;
        private readonly Dictionary<FrameworkElement, PresentationModeState> _elementStates;
        
        private bool _isPresentationMode;
        private Window _presentationWindow;
        private FrameworkElement _originalContent;
        private Window _originalWindow;

        private PresentationModeService()
        {
            _presentationAwareControls = new List<IPresentationModeAware>();
            _elementStates = new Dictionary<FrameworkElement, PresentationModeState>();
        }

        public static PresentationModeService Instance => _instance ??= new PresentationModeService();

        #region Events

        /// <summary>
        /// Raised when presentation mode is entered
        /// </summary>
        public event EventHandler PresentationModeEntered;

        /// <summary>
        /// Raised when presentation mode is exited
        /// </summary>
        public event EventHandler PresentationModeExited;

        /// <summary>
        /// Raised when presentation mode state changes
        /// </summary>
        public event EventHandler<PresentationModeChangedEventArgs> PresentationModeChanged;

        #endregion

        #region Properties

        /// <summary>
        /// Gets whether presentation mode is currently active
        /// </summary>
        public bool IsPresentationMode
        {
            get => _isPresentationMode;
            private set
            {
                if (_isPresentationMode != value)
                {
                    _isPresentationMode = value;
                    PresentationModeChanged?.Invoke(this, new PresentationModeChangedEventArgs(value));
                    
                    if (value)
                        PresentationModeEntered?.Invoke(this, EventArgs.Empty);
                    else
                        PresentationModeExited?.Invoke(this, EventArgs.Empty);
                }
            }
        }

        /// <summary>
        /// Gets the current presentation settings
        /// </summary>
        public PresentationModeSettings Settings { get; private set; } = new PresentationModeSettings();

        #endregion

        #region Public Methods

        /// <summary>
        /// Enters presentation mode with the specified content
        /// </summary>
        public async Task EnterPresentationModeAsync(FrameworkElement content, PresentationModeSettings settings = null)
        {
            if (IsPresentationMode) return;

            Settings = settings ?? new PresentationModeSettings();
            _originalContent = content;
            _originalWindow = Window.GetWindow(content);

            // Store original states
            StoreOriginalStates();

            // Create presentation window
            await CreatePresentationWindow();

            // Apply presentation styles
            ApplyPresentationStyles();

            // Notify controls
            NotifyPresentationModeControls(true);

            IsPresentationMode = true;
        }

        /// <summary>
        /// Exits presentation mode and restores original state
        /// </summary>
        public async Task ExitPresentationModeAsync()
        {
            if (!IsPresentationMode) return;

            // Animate out
            if (_presentationWindow != null)
            {
                await AnimatePresentationWindowOut();
                _presentationWindow.Close();
                _presentationWindow = null;
            }

            // Restore original states
            RestoreOriginalStates();

            // Notify controls
            NotifyPresentationModeControls(false);

            IsPresentationMode = false;
        }

        /// <summary>
        /// Toggles presentation mode
        /// </summary>
        public async Task TogglePresentationModeAsync(FrameworkElement content = null, PresentationModeSettings settings = null)
        {
            if (IsPresentationMode)
            {
                await ExitPresentationModeAsync();
            }
            else if (content != null)
            {
                await EnterPresentationModeAsync(content, settings);
            }
        }

        /// <summary>
        /// Registers a control that should be notified of presentation mode changes
        /// </summary>
        public void RegisterPresentationAwareControl(IPresentationModeAware control)
        {
            if (!_presentationAwareControls.Contains(control))
            {
                _presentationAwareControls.Add(control);
            }
        }

        /// <summary>
        /// Unregisters a presentation-aware control
        /// </summary>
        public void UnregisterPresentationAwareControl(IPresentationModeAware control)
        {
            _presentationAwareControls.Remove(control);
        }

        /// <summary>
        /// Updates presentation mode settings
        /// </summary>
        public void UpdateSettings(PresentationModeSettings newSettings)
        {
            Settings = newSettings ?? new PresentationModeSettings();
            
            if (IsPresentationMode)
            {
                ApplyPresentationStyles();
            }
        }

        /// <summary>
        /// Navigates to the next slide (if applicable)
        /// </summary>
        public void NextSlide()
        {
            if (IsPresentationMode && _originalContent is IPresentationNavigable navigable)
            {
                navigable.GoToNextSlide();
            }
        }

        /// <summary>
        /// Navigates to the previous slide (if applicable)
        /// </summary>
        public void PreviousSlide()
        {
            if (IsPresentationMode && _originalContent is IPresentationNavigable navigable)
            {
                navigable.GoToPreviousSlide();
            }
        }

        #endregion

        #region Private Methods

        private void StoreOriginalStates()
        {
            _elementStates.Clear();
            
            if (_originalContent != null)
            {
                StoreElementState(_originalContent);
                StoreChildElementStates(_originalContent);
            }
        }

        private void StoreElementState(FrameworkElement element)
        {
            if (element == null) return;

            _elementStates[element] = new PresentationModeState
            {
                Margin = element.Margin,
                Padding = element is Control control ? control.Padding : new Thickness(0),
                Background = element is Control c ? c.Background : 
                            element is Panel p ? p.Background : null,
                FontSize = element is Control ctrl ? ctrl.FontSize : 
                          element is TextBlock tb ? tb.FontSize : 12,
                Visibility = element.Visibility,
                Opacity = element.Opacity
            };
        }

        private void StoreChildElementStates(DependencyObject parent)
        {
            for (int i = 0; i < VisualTreeHelper.GetChildrenCount(parent); i++)
            {
                var child = VisualTreeHelper.GetChild(parent, i);
                if (child is FrameworkElement element)
                {
                    StoreElementState(element);
                    StoreChildElementStates(child);
                }
            }
        }

        private void RestoreOriginalStates()
        {
            foreach (var kvp in _elementStates)
            {
                var element = kvp.Key;
                var state = kvp.Value;

                element.Margin = state.Margin;
                element.Visibility = state.Visibility;
                element.Opacity = state.Opacity;

                if (element is Control control)
                {
                    control.Padding = state.Padding;
                    control.Background = state.Background;
                    control.FontSize = state.FontSize;
                }
                else if (element is Panel panel)
                {
                    panel.Background = state.Background;
                }
                else if (element is TextBlock textBlock)
                {
                    textBlock.FontSize = state.FontSize;
                }
            }
        }

        private async Task CreatePresentationWindow()
        {
            _presentationWindow = new Window
            {
                Title = "Presentation Mode - M&A Discovery Suite",
                WindowStyle = WindowStyle.None,
                WindowState = Settings.FullScreen ? WindowState.Maximized : WindowState.Normal,
                Background = new SolidColorBrush(Settings.BackgroundColor),
                Content = _originalContent,
                Topmost = Settings.AlwaysOnTop,
                ShowInTaskbar = false,
                ResizeMode = ResizeMode.NoResize
            };

            // Set window size if not fullscreen
            if (!Settings.FullScreen)
            {
                _presentationWindow.Width = Settings.WindowWidth;
                _presentationWindow.Height = Settings.WindowHeight;
                _presentationWindow.WindowStartupLocation = WindowStartupLocation.CenterScreen;
            }

            // Add key bindings
            AddPresentationKeyBindings();

            // Remove content from original window
            if (_originalContent.Parent is Panel parentPanel)
            {
                parentPanel.Children.Remove(_originalContent);
            }
            else if (_originalContent.Parent is ContentControl contentControl)
            {
                contentControl.Content = null;
            }

            // Show with animation
            _presentationWindow.Opacity = 0;
            _presentationWindow.Show();
            await AnimatePresentationWindowIn();
        }

        private void AddPresentationKeyBindings()
        {
            if (_presentationWindow == null) return;

            // Exit on Escape
            var exitBinding = new KeyBinding(new RelayCommand(async () => await ExitPresentationModeAsync()), 
                Key.Escape, ModifierKeys.None);
            _presentationWindow.InputBindings.Add(exitBinding);

            // Navigation keys
            var nextBinding = new KeyBinding(new RelayCommand(NextSlide), 
                Key.Right, ModifierKeys.None);
            _presentationWindow.InputBindings.Add(nextBinding);

            var prevBinding = new KeyBinding(new RelayCommand(PreviousSlide), 
                Key.Left, ModifierKeys.None);
            _presentationWindow.InputBindings.Add(prevBinding);

            // Alternative navigation
            var spaceNextBinding = new KeyBinding(new RelayCommand(NextSlide), 
                Key.Space, ModifierKeys.None);
            _presentationWindow.InputBindings.Add(spaceNextBinding);

            var backspaceBinding = new KeyBinding(new RelayCommand(PreviousSlide), 
                Key.Back, ModifierKeys.None);
            _presentationWindow.InputBindings.Add(backspaceBinding);
        }

        private async Task AnimatePresentationWindowIn()
        {
            if (_presentationWindow == null) return;

            var fadeIn = new DoubleAnimation
            {
                From = 0,
                To = 1,
                Duration = TimeSpan.FromMilliseconds(500),
                EasingFunction = new QuadraticEase { EasingMode = EasingMode.EaseOut }
            };

            var taskCompletionSource = new TaskCompletionSource<bool>();
            fadeIn.Completed += (s, e) => taskCompletionSource.SetResult(true);

            _presentationWindow.BeginAnimation(Window.OpacityProperty, fadeIn);
            await taskCompletionSource.Task;
        }

        private async Task AnimatePresentationWindowOut()
        {
            if (_presentationWindow == null) return;

            var fadeOut = new DoubleAnimation
            {
                From = 1,
                To = 0,
                Duration = TimeSpan.FromMilliseconds(300),
                EasingFunction = new QuadraticEase { EasingMode = EasingMode.EaseIn }
            };

            var taskCompletionSource = new TaskCompletionSource<bool>();
            fadeOut.Completed += (s, e) => taskCompletionSource.SetResult(true);

            _presentationWindow.BeginAnimation(Window.OpacityProperty, fadeOut);
            await taskCompletionSource.Task;
        }

        private void ApplyPresentationStyles()
        {
            if (_originalContent == null) return;

            // Apply enhanced font sizes
            ApplyEnhancedFontSizes(_originalContent);

            // Hide distracting elements
            HideDistractingElements(_originalContent);

            // Apply presentation background
            if (_originalContent is Control control)
            {
                control.Background = new SolidColorBrush(Settings.ContentBackgroundColor);
            }
            else if (_originalContent is Panel panel)
            {
                panel.Background = new SolidColorBrush(Settings.ContentBackgroundColor);
            }

            // Increase margins for better spacing
            _originalContent.Margin = new Thickness(Settings.ContentMargin);
        }

        private void ApplyEnhancedFontSizes(DependencyObject parent)
        {
            for (int i = 0; i < VisualTreeHelper.GetChildrenCount(parent); i++)
            {
                var child = VisualTreeHelper.GetChild(parent, i);

                if (child is Control control)
                {
                    control.FontSize *= Settings.FontSizeMultiplier;
                }
                else if (child is TextBlock textBlock)
                {
                    textBlock.FontSize *= Settings.FontSizeMultiplier;
                }

                ApplyEnhancedFontSizes(child);
            }
        }

        private void HideDistractingElements(DependencyObject parent)
        {
            for (int i = 0; i < VisualTreeHelper.GetChildrenCount(parent); i++)
            {
                var child = VisualTreeHelper.GetChild(parent, i);

                if (child is FrameworkElement element)
                {
                    // Hide elements marked for hiding in presentation mode
                    if (GetHideInPresentationMode(element))
                    {
                        element.Visibility = Visibility.Collapsed;
                    }

                    // Hide scrollbars if requested
                    if (Settings.HideScrollBars && element is ScrollViewer scrollViewer)
                    {
                        scrollViewer.VerticalScrollBarVisibility = ScrollBarVisibility.Hidden;
                        scrollViewer.HorizontalScrollBarVisibility = ScrollBarVisibility.Hidden;
                    }
                }

                HideDistractingElements(child);
            }
        }

        private void NotifyPresentationModeControls(bool isEntering)
        {
            foreach (var control in _presentationAwareControls.ToList())
            {
                try
                {
                    if (isEntering)
                        control.OnPresentationModeEntered();
                    else
                        control.OnPresentationModeExited();
                }
                catch (Exception ex)
                {
                    // Log error but continue with other controls
                    System.Diagnostics.Debug.WriteLine($"Error notifying presentation aware control: {ex.Message}");
                }
            }
        }

        #endregion

        #region Attached Properties

        public static readonly DependencyProperty HideInPresentationModeProperty =
            DependencyProperty.RegisterAttached("HideInPresentationMode", typeof(bool), 
                typeof(PresentationModeService), new PropertyMetadata(false));

        public static void SetHideInPresentationMode(DependencyObject element, bool value)
        {
            element.SetValue(HideInPresentationModeProperty, value);
        }

        public static bool GetHideInPresentationMode(DependencyObject element)
        {
            return (bool)element.GetValue(HideInPresentationModeProperty);
        }

        #endregion
    }

    /// <summary>
    /// Settings for presentation mode
    /// </summary>
    public class PresentationModeSettings
    {
        /// <summary>
        /// Whether to use fullscreen mode
        /// </summary>
        public bool FullScreen { get; set; } = true;

        /// <summary>
        /// Window width (when not fullscreen)
        /// </summary>
        public double WindowWidth { get; set; } = 1200;

        /// <summary>
        /// Window height (when not fullscreen)
        /// </summary>
        public double WindowHeight { get; set; } = 800;

        /// <summary>
        /// Background color for the presentation window
        /// </summary>
        public Color BackgroundColor { get; set; } = Colors.Black;

        /// <summary>
        /// Background color for the content area
        /// </summary>
        public Color ContentBackgroundColor { get; set; } = Colors.White;

        /// <summary>
        /// Font size multiplier for better readability
        /// </summary>
        public double FontSizeMultiplier { get; set; } = 1.3;

        /// <summary>
        /// Content margin in presentation mode
        /// </summary>
        public double ContentMargin { get; set; } = 40;

        /// <summary>
        /// Whether to hide scroll bars
        /// </summary>
        public bool HideScrollBars { get; set; } = true;

        /// <summary>
        /// Whether the presentation window should stay on top
        /// </summary>
        public bool AlwaysOnTop { get; set; } = true;

        /// <summary>
        /// Whether to hide navigation elements
        /// </summary>
        public bool HideNavigation { get; set; } = true;

        /// <summary>
        /// Whether to hide toolbar elements
        /// </summary>
        public bool HideToolbars { get; set; } = true;
    }

    /// <summary>
    /// State information for elements in presentation mode
    /// </summary>
    internal class PresentationModeState
    {
        public Thickness Margin { get; set; }
        public Thickness Padding { get; set; }
        public Brush Background { get; set; }
        public double FontSize { get; set; }
        public Visibility Visibility { get; set; }
        public double Opacity { get; set; }
    }

    /// <summary>
    /// Event args for presentation mode changes
    /// </summary>
    public class PresentationModeChangedEventArgs : EventArgs
    {
        public bool IsPresentationMode { get; }

        public PresentationModeChangedEventArgs(bool isPresentationMode)
        {
            IsPresentationMode = isPresentationMode;
        }
    }

    /// <summary>
    /// Interface for controls that need to be notified of presentation mode changes
    /// </summary>
    public interface IPresentationModeAware
    {
        void OnPresentationModeEntered();
        void OnPresentationModeExited();
    }

    /// <summary>
    /// Interface for controls that support presentation navigation
    /// </summary>
    public interface IPresentationNavigable
    {
        void GoToNextSlide();
        void GoToPreviousSlide();
        bool CanGoToNextSlide { get; }
        bool CanGoToPreviousSlide { get; }
    }

}