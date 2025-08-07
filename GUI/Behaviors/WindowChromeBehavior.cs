using System;
using System.Windows;
using System.Windows.Input;
using System.Windows.Interop;
using System.Runtime.InteropServices;

namespace MandADiscoverySuite.Behaviors
{
    /// <summary>
    /// Behavior for handling custom window chrome functionality
    /// </summary>
    public static class WindowChromeBehavior
    {
        #region Win32 APIs

        [DllImport("user32.dll")]
        private static extern IntPtr SendMessage(IntPtr hWnd, int Msg, IntPtr wParam, IntPtr lParam);

        private const int WM_SYSCOMMAND = 0x0112;
        private const int SC_MINIMIZE = 0xF020;
        private const int SC_MAXIMIZE = 0xF030;
        private const int SC_RESTORE = 0xF120;
        private const int SC_CLOSE = 0xF060;

        #endregion

        #region Attached Properties

        /// <summary>
        /// Attached property to enable custom window chrome behavior
        /// </summary>
        public static readonly DependencyProperty EnableCustomChromeProperty =
            DependencyProperty.RegisterAttached(
                "EnableCustomChrome",
                typeof(bool),
                typeof(WindowChromeBehavior),
                new PropertyMetadata(false, OnEnableCustomChromeChanged));

        public static bool GetEnableCustomChrome(DependencyObject obj)
        {
            return (bool)obj.GetValue(EnableCustomChromeProperty);
        }

        public static void SetEnableCustomChrome(DependencyObject obj, bool value)
        {
            obj.SetValue(EnableCustomChromeProperty, value);
        }

        #endregion

        #region Event Handlers

        private static void OnEnableCustomChromeChanged(DependencyObject d, DependencyPropertyChangedEventArgs e)
        {
            if (d is Window window)
            {
                if ((bool)e.NewValue)
                {
                    AttachCustomChrome(window);
                }
                else
                {
                    DetachCustomChrome(window);
                }
            }
        }

        private static void AttachCustomChrome(Window window)
        {
            // Set up event handlers for window chrome buttons
            window.Loaded += OnWindowLoaded;
            window.SourceInitialized += OnWindowSourceInitialized;
        }

        private static void DetachCustomChrome(Window window)
        {
            window.Loaded -= OnWindowLoaded;
            window.SourceInitialized -= OnWindowSourceInitialized;
        }

        private static void OnWindowLoaded(object sender, RoutedEventArgs e)
        {
            if (sender is Window window)
            {
                SetupWindowChromeHandlers(window);
            }
        }

        private static void OnWindowSourceInitialized(object sender, EventArgs e)
        {
            if (sender is Window window)
            {
                // Add window procedure hook for handling system commands
                var source = PresentationSource.FromVisual(window) as HwndSource;
                source?.AddHook(WindowProc);
            }
        }

        private static void SetupWindowChromeHandlers(Window window)
        {
            // Find window control buttons in the template
            if (window.Template != null)
            {
                window.ApplyTemplate();

                // Minimize Button
                if (window.Template.FindName("MinimizeButton", window) is System.Windows.Controls.Button minimizeBtn)
                {
                    minimizeBtn.Click -= MinimizeButton_Click;
                    minimizeBtn.Click += MinimizeButton_Click;
                }

                // Maximize/Restore Button
                if (window.Template.FindName("MaximizeRestoreButton", window) is System.Windows.Controls.Button maximizeBtn)
                {
                    maximizeBtn.Click -= MaximizeRestoreButton_Click;
                    maximizeBtn.Click += MaximizeRestoreButton_Click;
                }

                // Close Button
                if (window.Template.FindName("CloseButton", window) is System.Windows.Controls.Button closeBtn)
                {
                    closeBtn.Click -= CloseButton_Click;
                    closeBtn.Click += CloseButton_Click;
                }

                // Title Bar Double-Click Handler
                if (window.Template.FindName("TitleBar", window) is FrameworkElement titleBar)
                {
                    titleBar.MouseLeftButtonDown -= TitleBar_MouseLeftButtonDown;
                    titleBar.MouseLeftButtonDown += TitleBar_MouseLeftButtonDown;
                }
            }
        }

        #endregion

        #region Window Control Handlers

        private static void MinimizeButton_Click(object sender, RoutedEventArgs e)
        {
            if (sender is FrameworkElement element)
            {
                var window = Window.GetWindow(element);
                if (window != null)
                {
                    window.WindowState = WindowState.Minimized;
                }
            }
        }

        private static void MaximizeRestoreButton_Click(object sender, RoutedEventArgs e)
        {
            if (sender is FrameworkElement element)
            {
                var window = Window.GetWindow(element);
                if (window != null)
                {
                    window.WindowState = window.WindowState == WindowState.Maximized
                        ? WindowState.Normal
                        : WindowState.Maximized;
                }
            }
        }

        private static void CloseButton_Click(object sender, RoutedEventArgs e)
        {
            if (sender is FrameworkElement element)
            {
                var window = Window.GetWindow(element);
                window?.Close();
            }
        }

        private static void TitleBar_MouseLeftButtonDown(object sender, MouseButtonEventArgs e)
        {
            if (sender is FrameworkElement element)
            {
                var window = Window.GetWindow(element);
                if (window != null)
                {
                    if (e.ClickCount == 2)
                    {
                        // Double-click to maximize/restore
                        window.WindowState = window.WindowState == WindowState.Maximized
                            ? WindowState.Normal
                            : WindowState.Maximized;
                    }
                    else if (e.ClickCount == 1)
                    {
                        // Single click to drag
                        if (window.WindowState == WindowState.Maximized)
                        {
                            // If maximized, restore and move to mouse position
                            var mousePos = e.GetPosition(window);
                            window.WindowState = WindowState.Normal;
                            
                            // Calculate new position based on mouse position
                            var screenPos = window.PointToScreen(mousePos);
                            window.Left = screenPos.X - (window.Width * mousePos.X / window.ActualWidth);
                            window.Top = screenPos.Y - mousePos.Y;
                        }
                        
                        window.DragMove();
                    }
                }
            }
        }

        #endregion

        #region Window Procedure Hook

        private static IntPtr WindowProc(IntPtr hwnd, int msg, IntPtr wParam, IntPtr lParam, ref bool handled)
        {
            switch (msg)
            {
                case WM_SYSCOMMAND:
                    var command = wParam.ToInt32() & 0xfff0;
                    switch (command)
                    {
                        case SC_MINIMIZE:
                        case SC_MAXIMIZE:
                        case SC_RESTORE:
                        case SC_CLOSE:
                            // Let these commands through normally
                            handled = false;
                            break;
                    }
                    break;
            }

            return IntPtr.Zero;
        }

        #endregion

        #region Public Extension Methods

        /// <summary>
        /// Enables custom window chrome on the specified window
        /// </summary>
        public static void EnableCustomWindowChrome(this Window window)
        {
            SetEnableCustomChrome(window, true);
        }

        /// <summary>
        /// Disables custom window chrome on the specified window
        /// </summary>
        public static void DisableCustomWindowChrome(this Window window)
        {
            SetEnableCustomChrome(window, false);
        }

        /// <summary>
        /// Sets the window chrome style
        /// </summary>
        public static void SetWindowChromeStyle(this Window window, WindowChromeStyle style)
        {
            var styleResource = style switch
            {
                WindowChromeStyle.Custom => "CustomWindowStyle",
                WindowChromeStyle.Dialog => "CustomDialogWindowStyle",
                WindowChromeStyle.Borderless => "BorderlessWindowStyle",
                WindowChromeStyle.Acrylic => "AcrylicWindowStyle",
                _ => "CustomWindowStyle"
            };

            if (Application.Current.Resources.Contains(styleResource))
            {
                window.Style = (Style)Application.Current.Resources[styleResource];
                window.EnableCustomWindowChrome();
            }
        }

        /// <summary>
        /// Applies smooth window animations
        /// </summary>
        public static void EnableWindowAnimations(this Window window)
        {
            window.Loaded += (s, e) =>
            {
                // Fade in animation
                window.Opacity = 0;
                var fadeIn = new System.Windows.Media.Animation.DoubleAnimation(0, 1, 
                    TimeSpan.FromMilliseconds(300))
                {
                    EasingFunction = new System.Windows.Media.Animation.QuadraticEase 
                    { 
                        EasingMode = System.Windows.Media.Animation.EasingMode.EaseOut 
                    }
                };
                window.BeginAnimation(Window.OpacityProperty, fadeIn);

                // Scale animation
                var transform = new System.Windows.Media.ScaleTransform(0.95, 0.95, 
                    window.Width / 2, window.Height / 2);
                window.RenderTransform = transform;
                
                var scaleX = new System.Windows.Media.Animation.DoubleAnimation(0.95, 1, 
                    TimeSpan.FromMilliseconds(300))
                {
                    EasingFunction = new System.Windows.Media.Animation.BackEase 
                    { 
                        EasingMode = System.Windows.Media.Animation.EasingMode.EaseOut,
                        Amplitude = 0.3
                    }
                };
                var scaleY = new System.Windows.Media.Animation.DoubleAnimation(0.95, 1, 
                    TimeSpan.FromMilliseconds(300))
                {
                    EasingFunction = new System.Windows.Media.Animation.BackEase 
                    { 
                        EasingMode = System.Windows.Media.Animation.EasingMode.EaseOut,
                        Amplitude = 0.3
                    }
                };

                transform.BeginAnimation(System.Windows.Media.ScaleTransform.ScaleXProperty, scaleX);
                transform.BeginAnimation(System.Windows.Media.ScaleTransform.ScaleYProperty, scaleY);
            };

            window.Closing += (s, e) =>
            {
                // Only animate if not already animating
                if (window.Opacity > 0.5)
                {
                    e.Cancel = true;

                    // Fade out animation
                    var fadeOut = new System.Windows.Media.Animation.DoubleAnimation(1, 0, 
                        TimeSpan.FromMilliseconds(200))
                    {
                        EasingFunction = new System.Windows.Media.Animation.QuadraticEase 
                        { 
                            EasingMode = System.Windows.Media.Animation.EasingMode.EaseIn 
                        }
                    };

                    fadeOut.Completed += (sender, args) => window.Close();
                    window.BeginAnimation(Window.OpacityProperty, fadeOut);
                }
            };
        }

        #endregion
    }

    /// <summary>
    /// Available window chrome styles
    /// </summary>
    public enum WindowChromeStyle
    {
        Custom,
        Dialog,
        Borderless,
        Acrylic
    }

    /// <summary>
    /// Helper class for window chrome utilities
    /// </summary>
    public static class WindowChromeHelper
    {
        /// <summary>
        /// Creates a new window with custom chrome
        /// </summary>
        public static Window CreateCustomWindow(string title = "", WindowChromeStyle style = WindowChromeStyle.Custom)
        {
            var window = new Window
            {
                Title = title,
                Width = 800,
                Height = 600,
                WindowStartupLocation = WindowStartupLocation.CenterScreen
            };

            window.SetWindowChromeStyle(style);
            window.EnableWindowAnimations();

            return window;
        }

        /// <summary>
        /// Creates a new dialog window with custom chrome
        /// </summary>
        public static Window CreateCustomDialog(Window owner, string title = "", double width = 400, double height = 300)
        {
            var dialog = new Window
            {
                Title = title,
                Width = width,
                Height = height,
                Owner = owner,
                WindowStartupLocation = WindowStartupLocation.CenterOwner,
                ShowInTaskbar = false
            };

            dialog.SetWindowChromeStyle(WindowChromeStyle.Dialog);
            dialog.EnableWindowAnimations();

            return dialog;
        }

        /// <summary>
        /// Applies modern visual effects to a window
        /// </summary>
        public static void ApplyModernEffects(Window window)
        {
            // Add blur effect behind window (Windows 10+ only)
            try
            {
                var blur = new System.Windows.Media.Effects.BlurEffect
                {
                    Radius = 0
                };
                window.Effect = blur;
            }
            catch
            {
                // Fallback for older systems
            }

            // Add entrance animation
            window.EnableWindowAnimations();
        }
    }
}