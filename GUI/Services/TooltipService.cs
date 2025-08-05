using System;
using System.Collections.Generic;
using System.Linq;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Controls.Primitives;
using System.Windows.Media;
using System.Windows.Threading;
using Microsoft.Extensions.Logging;

namespace MandADiscoverySuite.Services
{
    /// <summary>
    /// Service for managing enhanced tooltips throughout the application
    /// </summary>
    public class TooltipService : IDisposable
    {
        private readonly ILogger<TooltipService> _logger;
        private readonly Dictionary<FrameworkElement, EnhancedTooltip> _tooltips;
        private readonly DispatcherTimer _showTimer;
        private readonly DispatcherTimer _hideTimer;
        
        private FrameworkElement _currentElement;
        private Popup _currentPopup;
        private bool _isShowPending;
        private bool _isHidePending;

        // Configuration
        private int _showDelay = 800; // milliseconds
        private int _hideDelay = 200; // milliseconds
        private bool _isEnabled = true;

        public TooltipService(ILogger<TooltipService> logger)
        {
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
            _tooltips = new Dictionary<FrameworkElement, EnhancedTooltip>();
            
            _showTimer = new DispatcherTimer { Interval = TimeSpan.FromMilliseconds(_showDelay) };
            _showTimer.Tick += ShowTimer_Tick;
            
            _hideTimer = new DispatcherTimer { Interval = TimeSpan.FromMilliseconds(_hideDelay) };
            _hideTimer.Tick += HideTimer_Tick;
        }

        #region Properties

        /// <summary>
        /// Gets or sets whether tooltips are enabled
        /// </summary>
        public bool IsEnabled
        {
            get => _isEnabled;
            set => _isEnabled = value;
        }

        /// <summary>
        /// Gets or sets the delay before showing tooltips (in milliseconds)
        /// </summary>
        public int ShowDelay
        {
            get => _showDelay;
            set
            {
                _showDelay = Math.Max(0, value);
                _showTimer.Interval = TimeSpan.FromMilliseconds(_showDelay);
            }
        }

        /// <summary>
        /// Gets or sets the delay before hiding tooltips (in milliseconds)
        /// </summary>
        public int HideDelay
        {
            get => _hideDelay;
            set
            {
                _hideDelay = Math.Max(0, value);
                _hideTimer.Interval = TimeSpan.FromMilliseconds(_hideDelay);
            }
        }

        #endregion

        #region Public Methods

        /// <summary>
        /// Registers an enhanced tooltip for an element
        /// </summary>
        public void RegisterTooltip(FrameworkElement element, EnhancedTooltip tooltip)
        {
            try
            {
                if (element == null || tooltip == null) return;

                // Remove existing tooltip if present
                UnregisterTooltip(element);

                // Store the tooltip
                _tooltips[element] = tooltip;

                // Attach event handlers
                element.MouseEnter += Element_MouseEnter;
                element.MouseLeave += Element_MouseLeave;
                element.MouseMove += Element_MouseMove;
                element.Unloaded += Element_Unloaded;

                _logger.LogDebug("Registered tooltip for element: {ElementType}", element.GetType().Name);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error registering tooltip for element");
            }
        }

        /// <summary>
        /// Registers a simple text tooltip for an element
        /// </summary>
        public void RegisterTooltip(FrameworkElement element, string text, string title = null)
        {
            var tooltip = new EnhancedTooltip
            {
                Title = title,
                Content = text,
                TooltipType = TooltipType.Simple
            };
            
            RegisterTooltip(element, tooltip);
        }

        /// <summary>
        /// Registers a rich tooltip with multiple sections for an element
        /// </summary>
        public void RegisterRichTooltip(FrameworkElement element, string title, 
            Dictionary<string, string> sections, string footer = null, string icon = null)
        {
            var tooltip = new EnhancedTooltip
            {
                Title = title,
                Icon = icon,
                Sections = sections,
                Footer = footer,
                TooltipType = TooltipType.Rich
            };
            
            RegisterTooltip(element, tooltip);
        }

        /// <summary>
        /// Registers a help tooltip with detailed information
        /// </summary>
        public void RegisterHelpTooltip(FrameworkElement element, string title, 
            string description, string[] keyboardShortcuts = null, string[] tips = null)
        {
            var tooltip = new EnhancedTooltip
            {
                Title = title,
                Content = description,
                KeyboardShortcuts = keyboardShortcuts?.ToList(),
                Tips = tips?.ToList(),
                TooltipType = TooltipType.Help
            };
            
            RegisterTooltip(element, tooltip);
        }

        /// <summary>
        /// Unregisters a tooltip from an element
        /// </summary>
        public void UnregisterTooltip(FrameworkElement element)
        {
            try
            {
                if (element == null) return;

                if (_tooltips.ContainsKey(element))
                {
                    // Remove event handlers
                    element.MouseEnter -= Element_MouseEnter;
                    element.MouseLeave -= Element_MouseLeave;
                    element.MouseMove -= Element_MouseMove;
                    element.Unloaded -= Element_Unloaded;

                    // Remove from dictionary
                    _tooltips.Remove(element);

                    // Hide tooltip if it's currently showing for this element
                    if (_currentElement == element)
                    {
                        HideTooltip();
                    }

                    _logger.LogDebug("Unregistered tooltip for element: {ElementType}", element.GetType().Name);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error unregistering tooltip for element");
            }
        }

        /// <summary>
        /// Shows a tooltip immediately at the specified position
        /// </summary>
        public void ShowTooltipAt(EnhancedTooltip tooltip, Point position)
        {
            try
            {
                if (!IsEnabled || tooltip == null) return;

                HideTooltip();
                CreateAndShowPopup(tooltip, position);

                _logger.LogDebug("Showed tooltip at position ({X}, {Y})", position.X, position.Y);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error showing tooltip at position");
            }
        }

        /// <summary>
        /// Hides the currently visible tooltip
        /// </summary>
        public void HideTooltip()
        {
            try
            {
                _showTimer.Stop();
                _hideTimer.Stop();
                _isShowPending = false;
                _isHidePending = false;

                if (_currentPopup != null)
                {
                    _currentPopup.IsOpen = false;
                    _currentPopup = null;
                }

                _currentElement = null;

                _logger.LogDebug("Hid current tooltip");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error hiding tooltip");
            }
        }

        /// <summary>
        /// Updates the content of an existing tooltip
        /// </summary>
        public void UpdateTooltip(FrameworkElement element, EnhancedTooltip newTooltip)
        {
            try
            {
                if (element == null || newTooltip == null) return;

                if (_tooltips.ContainsKey(element))
                {
                    _tooltips[element] = newTooltip;

                    // If this tooltip is currently showing, update it
                    if (_currentElement == element && _currentPopup != null)
                    {
                        var position = Mouse.GetPosition(Application.Current.MainWindow);
                        HideTooltip();
                        CreateAndShowPopup(newTooltip, position);
                    }

                    _logger.LogDebug("Updated tooltip for element: {ElementType}", element.GetType().Name);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating tooltip for element");
            }
        }

        #endregion

        #region Event Handlers

        private void Element_MouseEnter(object sender, System.Windows.Input.MouseEventArgs e)
        {
            try
            {
                if (!IsEnabled) return;

                var element = sender as FrameworkElement;
                if (element == null || !_tooltips.ContainsKey(element)) return;

                _currentElement = element;
                _isShowPending = true;
                _isHidePending = false;

                _hideTimer.Stop();
                _showTimer.Start();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error handling mouse enter for tooltip");
            }
        }

        private void Element_MouseLeave(object sender, System.Windows.Input.MouseEventArgs e)
        {
            try
            {
                _isShowPending = false;
                _isHidePending = true;

                _showTimer.Stop();
                _hideTimer.Start();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error handling mouse leave for tooltip");
            }
        }

        private void Element_MouseMove(object sender, System.Windows.Input.MouseEventArgs e)
        {
            try
            {
                if (!IsEnabled || _currentPopup == null) return;

                // Update tooltip position if it's currently showing
                var position = e.GetPosition(Application.Current.MainWindow);
                UpdateTooltipPosition(position);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error handling mouse move for tooltip");
            }
        }

        private void Element_Unloaded(object sender, RoutedEventArgs e)
        {
            var element = sender as FrameworkElement;
            if (element != null)
            {
                UnregisterTooltip(element);
            }
        }

        private void ShowTimer_Tick(object sender, EventArgs e)
        {
            try
            {
                _showTimer.Stop();

                if (_isShowPending && _currentElement != null && _tooltips.ContainsKey(_currentElement))
                {
                    var tooltip = _tooltips[_currentElement];
                    var position = Mouse.GetPosition(Application.Current.MainWindow);
                    CreateAndShowPopup(tooltip, position);
                }

                _isShowPending = false;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in show timer tick");
            }
        }

        private void HideTimer_Tick(object sender, EventArgs e)
        {
            try
            {
                _hideTimer.Stop();

                if (_isHidePending)
                {
                    HideTooltip();
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in hide timer tick");
            }
        }

        #endregion

        #region Private Methods

        private void CreateAndShowPopup(EnhancedTooltip tooltip, Point position)
        {
            try
            {
                var tooltipControl = new Controls.EnhancedTooltipControl
                {
                    DataContext = tooltip
                };

                _currentPopup = new Popup
                {
                    Child = tooltipControl,
                    Placement = PlacementMode.Absolute,
                    AllowsTransparency = true,
                    PopupAnimation = PopupAnimation.Fade,
                    StaysOpen = false
                };

                UpdateTooltipPosition(position);
                _currentPopup.IsOpen = true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating and showing popup");
            }
        }

        private void UpdateTooltipPosition(Point mousePosition)
        {
            try
            {
                if (_currentPopup == null) return;

                var offset = new Point(15, 15); // Offset from mouse cursor
                var screenBounds = SystemParameters.WorkArea;
                
                var x = mousePosition.X + offset.X;
                var y = mousePosition.Y + offset.Y;

                // Ensure tooltip stays within screen bounds
                if (_currentPopup.Child is FrameworkElement element)
                {
                    element.Measure(new Size(double.PositiveInfinity, double.PositiveInfinity));
                    var tooltipSize = element.DesiredSize;

                    if (x + tooltipSize.Width > screenBounds.Right)
                        x = mousePosition.X - tooltipSize.Width - offset.X;

                    if (y + tooltipSize.Height > screenBounds.Bottom)
                        y = mousePosition.Y - tooltipSize.Height - offset.Y;
                }

                _currentPopup.HorizontalOffset = Math.Max(0, x);
                _currentPopup.VerticalOffset = Math.Max(0, y);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating tooltip position");
            }
        }

        #endregion

        #region IDisposable

        public void Dispose()
        {
            try
            {
                HideTooltip();
                
                _showTimer?.Stop();
                _hideTimer?.Stop();
                
                // Unregister all tooltips
                var elements = _tooltips.Keys.ToList();
                foreach (var element in elements)
                {
                    UnregisterTooltip(element);
                }
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Error disposing TooltipService");
            }
        }

        #endregion
    }

    /// <summary>
    /// Enhanced tooltip data model
    /// </summary>
    public class EnhancedTooltip
    {
        public string Title { get; set; }
        public string Content { get; set; }
        public string Icon { get; set; }
        public string Footer { get; set; }
        public Dictionary<string, string> Sections { get; set; }
        public List<string> KeyboardShortcuts { get; set; }
        public List<string> Tips { get; set; }
        public TooltipType TooltipType { get; set; } = TooltipType.Simple;
        public TooltipTheme Theme { get; set; } = TooltipTheme.Default;
        public TimeSpan? AutoHideDelay { get; set; }
        public bool IsInteractive { get; set; }
    }

    /// <summary>
    /// Types of tooltips
    /// </summary>
    public enum TooltipType
    {
        Simple,
        Rich,
        Help,
        Warning,
        Error,
        Success,
        Info
    }

    /// <summary>
    /// Tooltip theme options
    /// </summary>
    public enum TooltipTheme
    {
        Default,
        Dark,
        Light,
        Accent,
        Warning,
        Error,
        Success
    }
}