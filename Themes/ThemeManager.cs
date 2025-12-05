using System;
using System.Collections.Generic;
using System.Linq;
using System.Windows;
using System.Windows.Media;

namespace MandADiscoverySuite.Themes
{
    public enum ThemeType
    {
        Light,
        Dark,
        HighContrast
    }

    /// <summary>
    /// App theme enum for compatibility
    /// </summary>
    public enum AppTheme
    {
        Light = ThemeType.Light,
        Dark = ThemeType.Dark,
        HighContrast = ThemeType.HighContrast
    }

    public class ThemeManager
    {
        private static ThemeManager _instance;
        private static readonly object _lock = new object();
        private ThemeType _currentTheme = ThemeType.Dark;
        private readonly Dictionary<ThemeType, ResourceDictionary> _themes;

        public static ThemeManager Instance
        {
            get
            {
                if (_instance == null)
                {
                    lock (_lock)
                    {
                        if (_instance == null)
                            _instance = new ThemeManager();
                    }
                }
                return _instance;
            }
        }

        public event EventHandler<ThemeChangedEventArgs> ThemeChanged;

        private ThemeManager()
        {
            _themes = new Dictionary<ThemeType, ResourceDictionary>();
            InitializeThemes();

            // Initialize events to prevent CS8618 warnings
            ThemeChanged = delegate { };
        }

        private void InitializeThemes()
        {
            // Light Theme
            var lightTheme = new ResourceDictionary();

            // Core Brushes
            lightTheme.Add("BackgroundBrush", new SolidColorBrush(Color.FromRgb(248, 250, 252)));
            lightTheme.Add("SurfaceBrush", new SolidColorBrush(Color.FromRgb(255, 255, 255)));
            lightTheme.Add("CardBrush", new SolidColorBrush(Color.FromRgb(255, 255, 255)));
            lightTheme.Add("ElevatedBrush", new SolidColorBrush(Color.FromRgb(237, 237, 240)));

            // Text Brushes
            lightTheme.Add("ForegroundBrush", new SolidColorBrush(Color.FromRgb(31, 41, 55)));
            lightTheme.Add("PrimaryTextBrush", new SolidColorBrush(Color.FromRgb(31, 41, 55))); // Alias for ForegroundBrush
            lightTheme.Add("SecondaryForegroundBrush", new SolidColorBrush(Color.FromRgb(55, 65, 81)));
            lightTheme.Add("SecondaryTextBrush", new SolidColorBrush(Color.FromRgb(55, 65, 81))); // Alias
            lightTheme.Add("MutedForegroundBrush", new SolidColorBrush(Color.FromRgb(107, 114, 128)));
            lightTheme.Add("DisabledForegroundBrush", new SolidColorBrush(Color.FromRgb(156, 163, 175)));

            // Accent Brushes
            lightTheme.Add("AccentBrush", new SolidColorBrush(Color.FromRgb(59, 130, 246)));
            lightTheme.Add("AccentLightBrush", new SolidColorBrush(Color.FromRgb(219, 234, 254)));
            lightTheme.Add("AccentDarkBrush", new SolidColorBrush(Color.FromRgb(29, 78, 216)));
            lightTheme.Add("AccentHoverBrush", new SolidColorBrush(Color.FromRgb(96, 165, 250)));
            lightTheme.Add("AccentPressedBrush", new SolidColorBrush(Color.FromRgb(37, 99, 235)));
            lightTheme.Add("ButtonHoverBrush", new SolidColorBrush(Color.FromRgb(96, 165, 250))); // Alias for AccentHoverBrush

            // State Brushes
            lightTheme.Add("SuccessBrush", new SolidColorBrush(Color.FromRgb(5, 150, 105)));
            lightTheme.Add("ErrorBrush", new SolidColorBrush(Color.FromRgb(220, 38, 38)));
            lightTheme.Add("WarningBrush", new SolidColorBrush(Color.FromRgb(217, 119, 6)));
            lightTheme.Add("InfoBrush", new SolidColorBrush(Color.FromRgb(8, 145, 178)));

            // Border Brushes
            lightTheme.Add("BorderBrush", new SolidColorBrush(Color.FromRgb(209, 213, 219)));
            lightTheme.Add("FocusBorderBrush", new SolidColorBrush(Color.FromRgb(59, 130, 246)));
            lightTheme.Add("HoverBorderBrush", new SolidColorBrush(Color.FromRgb(147, 197, 253)));
            lightTheme.Add("ValidBorderBrush", new SolidColorBrush(Color.FromRgb(5, 150, 105)));
            lightTheme.Add("InvalidBorderBrush", new SolidColorBrush(Color.FromRgb(220, 38, 38)));

            // Input Brushes
            lightTheme.Add("InputBackgroundBrush", new SolidColorBrush(Color.FromRgb(255, 255, 255)));
            lightTheme.Add("InputBorderBrush", new SolidColorBrush(Color.FromRgb(209, 213, 219)));
            lightTheme.Add("InputFocusBrush", new SolidColorBrush(Color.FromRgb(59, 130, 246)));
            lightTheme.Add("InputDisabledBrush", new SolidColorBrush(Color.FromRgb(243, 244, 246)));

            // Interaction Brushes
            lightTheme.Add("HoverBrush", new SolidColorBrush(Color.FromRgb(243, 244, 246)));
            lightTheme.Add("PressedBrush", new SolidColorBrush(Color.FromRgb(229, 231, 235)));
            lightTheme.Add("SelectedBrush", new SolidColorBrush(Color.FromRgb(219, 234, 254)));
            lightTheme.Add("FocusBrush", new SolidColorBrush(Color.FromRgb(219, 234, 254)));

            _themes[ThemeType.Light] = lightTheme;

            // Dark Theme
            var darkTheme = new ResourceDictionary();

            // Core Brushes
            darkTheme.Add("BackgroundBrush", new SolidColorBrush(Color.FromRgb(31, 41, 55)));
            darkTheme.Add("SurfaceBrush", new SolidColorBrush(Color.FromRgb(55, 65, 81)));
            darkTheme.Add("CardBrush", new SolidColorBrush(Color.FromRgb(75, 85, 99)));
            darkTheme.Add("ElevatedBrush", new SolidColorBrush(Color.FromRgb(107, 114, 128)));

            // Text Brushes
            darkTheme.Add("ForegroundBrush", new SolidColorBrush(Color.FromRgb(249, 250, 251)));
            darkTheme.Add("PrimaryTextBrush", new SolidColorBrush(Color.FromRgb(249, 250, 251))); // Alias for ForegroundBrush
            darkTheme.Add("SecondaryForegroundBrush", new SolidColorBrush(Color.FromRgb(229, 231, 235)));
            darkTheme.Add("SecondaryTextBrush", new SolidColorBrush(Color.FromRgb(229, 231, 235))); // Alias
            darkTheme.Add("MutedForegroundBrush", new SolidColorBrush(Color.FromRgb(209, 213, 219)));
            darkTheme.Add("DisabledForegroundBrush", new SolidColorBrush(Color.FromRgb(156, 163, 175)));

            // Accent Brushes
            darkTheme.Add("AccentBrush", new SolidColorBrush(Color.FromRgb(59, 130, 246)));
            darkTheme.Add("AccentLightBrush", new SolidColorBrush(Color.FromRgb(147, 197, 253)));
            darkTheme.Add("AccentDarkBrush", new SolidColorBrush(Color.FromRgb(29, 78, 216)));
            darkTheme.Add("AccentHoverBrush", new SolidColorBrush(Color.FromRgb(96, 165, 250)));
            darkTheme.Add("AccentPressedBrush", new SolidColorBrush(Color.FromRgb(37, 99, 235)));
            darkTheme.Add("ButtonHoverBrush", new SolidColorBrush(Color.FromRgb(96, 165, 250))); // Alias for AccentHoverBrush

            // State Brushes
            darkTheme.Add("SuccessBrush", new SolidColorBrush(Color.FromRgb(16, 185, 129)));
            darkTheme.Add("ErrorBrush", new SolidColorBrush(Color.FromRgb(239, 68, 68)));
            darkTheme.Add("WarningBrush", new SolidColorBrush(Color.FromRgb(245, 158, 11)));
            darkTheme.Add("InfoBrush", new SolidColorBrush(Color.FromRgb(6, 182, 212)));

            // Border Brushes
            darkTheme.Add("BorderBrush", new SolidColorBrush(Color.FromRgb(107, 114, 128)));
            darkTheme.Add("FocusBorderBrush", new SolidColorBrush(Color.FromRgb(59, 130, 246)));
            darkTheme.Add("HoverBorderBrush", new SolidColorBrush(Color.FromRgb(147, 197, 253)));
            darkTheme.Add("ValidBorderBrush", new SolidColorBrush(Color.FromRgb(16, 185, 129)));
            darkTheme.Add("InvalidBorderBrush", new SolidColorBrush(Color.FromRgb(239, 68, 68)));

            // Input Brushes
            darkTheme.Add("InputBackgroundBrush", new SolidColorBrush(Color.FromRgb(55, 65, 81)));
            darkTheme.Add("InputBorderBrush", new SolidColorBrush(Color.FromRgb(107, 114, 128)));
            darkTheme.Add("InputFocusBrush", new SolidColorBrush(Color.FromRgb(59, 130, 246)));
            darkTheme.Add("InputDisabledBrush", new SolidColorBrush(Color.FromRgb(75, 85, 99)));

            // Interaction Brushes
            darkTheme.Add("HoverBrush", new SolidColorBrush(Color.FromRgb(107, 114, 128)));
            darkTheme.Add("PressedBrush", new SolidColorBrush(Color.FromRgb(156, 163, 175)));
            darkTheme.Add("SelectedBrush", new SolidColorBrush(Color.FromRgb(30, 58, 138)));
            darkTheme.Add("FocusBrush", new SolidColorBrush(Color.FromRgb(59, 130, 246)));

            _themes[ThemeType.Dark] = darkTheme;

            // High Contrast Theme
            var highContrastTheme = new ResourceDictionary();

            // Core Brushes - High contrast
            highContrastTheme.Add("BackgroundBrush", new SolidColorBrush(Color.FromRgb(0, 0, 0)));
            highContrastTheme.Add("SurfaceBrush", new SolidColorBrush(Color.FromRgb(0, 0, 0)));
            highContrastTheme.Add("CardBrush", new SolidColorBrush(Color.FromRgb(16, 16, 16)));
            highContrastTheme.Add("ElevatedBrush", new SolidColorBrush(Color.FromRgb(32, 32, 32)));

            // Text Brushes - Maximum contrast
            highContrastTheme.Add("ForegroundBrush", new SolidColorBrush(Color.FromRgb(255, 255, 255)));
            highContrastTheme.Add("PrimaryTextBrush", new SolidColorBrush(Color.FromRgb(255, 255, 255))); // Alias for ForegroundBrush
            highContrastTheme.Add("SecondaryForegroundBrush", new SolidColorBrush(Color.FromRgb(192, 192, 192)));
            highContrastTheme.Add("SecondaryTextBrush", new SolidColorBrush(Color.FromRgb(192, 192, 192))); // Alias
            highContrastTheme.Add("MutedForegroundBrush", new SolidColorBrush(Color.FromRgb(128, 128, 128)));
            highContrastTheme.Add("DisabledForegroundBrush", new SolidColorBrush(Color.FromRgb(64, 64, 64)));

            // Accent Brushes - High visibility
            highContrastTheme.Add("AccentBrush", new SolidColorBrush(Color.FromRgb(255, 255, 0))); // Yellow for accent
            highContrastTheme.Add("AccentLightBrush", new SolidColorBrush(Color.FromRgb(255, 255, 128)));
            highContrastTheme.Add("AccentDarkBrush", new SolidColorBrush(Color.FromRgb(192, 192, 0)));
            highContrastTheme.Add("AccentHoverBrush", new SolidColorBrush(Color.FromRgb(255, 255, 128)));
            highContrastTheme.Add("AccentPressedBrush", new SolidColorBrush(Color.FromRgb(192, 192, 0)));
            highContrastTheme.Add("ButtonHoverBrush", new SolidColorBrush(Color.FromRgb(255, 255, 128))); // Alias for AccentLightBrush

            // State Brushes - Distinct colors for accessibility
            highContrastTheme.Add("SuccessBrush", new SolidColorBrush(Color.FromRgb(0, 255, 0))); // Bright green
            highContrastTheme.Add("ErrorBrush", new SolidColorBrush(Color.FromRgb(255, 0, 0))); // Bright red
            highContrastTheme.Add("WarningBrush", new SolidColorBrush(Color.FromRgb(255, 165, 0))); // Bright orange
            highContrastTheme.Add("InfoBrush", new SolidColorBrush(Color.FromRgb(0, 191, 255))); // Bright cyan

            // Border Brushes - Maximum contrast
            highContrastTheme.Add("BorderBrush", new SolidColorBrush(Color.FromRgb(255, 255, 255))); // White borders
            highContrastTheme.Add("FocusBorderBrush", new SolidColorBrush(Color.FromRgb(255, 255, 0))); // Yellow focus
            highContrastTheme.Add("HoverBorderBrush", new SolidColorBrush(Color.FromRgb(255, 255, 128)));
            highContrastTheme.Add("ValidBorderBrush", new SolidColorBrush(Color.FromRgb(0, 255, 0)));
            highContrastTheme.Add("InvalidBorderBrush", new SolidColorBrush(Color.FromRgb(255, 0, 0)));

            // Input Brushes - Clear distinction
            highContrastTheme.Add("InputBackgroundBrush", new SolidColorBrush(Color.FromRgb(32, 32, 32)));
            highContrastTheme.Add("InputBorderBrush", new SolidColorBrush(Color.FromRgb(255, 255, 255)));
            highContrastTheme.Add("InputFocusBrush", new SolidColorBrush(Color.FromRgb(255, 255, 0)));
            highContrastTheme.Add("InputDisabledBrush", new SolidColorBrush(Color.FromRgb(64, 64, 64)));

            // Interaction Brushes - Clear states
            highContrastTheme.Add("HoverBrush", new SolidColorBrush(Color.FromRgb(32, 32, 32)));
            highContrastTheme.Add("PressedBrush", new SolidColorBrush(Color.FromRgb(64, 64, 64)));
            highContrastTheme.Add("SelectedBrush", new SolidColorBrush(Color.FromRgb(0, 0, 128))); // Bright blue selection
            highContrastTheme.Add("FocusBrush", new SolidColorBrush(Color.FromRgb(255, 255, 0)));

            _themes[ThemeType.HighContrast] = highContrastTheme;
        }

        public void ApplyTheme(ThemeType theme)
        {
            if (_currentTheme == theme) return;

            _currentTheme = theme;
            var themeResources = _themes[theme];

            // Step 1: Clear existing theme resources from application
            ClearExistingThemeDictionaries(Application.Current.Resources);

            // Step 2: Apply theme to application resources
            Application.Current.Resources.MergedDictionaries.Add(themeResources);

            // Step 4: Apply to all currently open windows
            foreach (Window window in Application.Current.Windows)
            {
                ApplyThemeToWindow(window, themeResources);
            }

            // Step 5: Notify theme changed
            ThemeChanged?.Invoke(this, new ThemeChangedEventArgs(theme));
        }

        private void ClearExistingThemeDictionaries(ResourceDictionary resources)
        {
            if (resources?.MergedDictionaries == null) return;

            // Remove any existing theme resource dictionaries
            // We identify theme dictionaries by their content (they have "BackgroundBrush")
            for (int i = resources.MergedDictionaries.Count - 1; i >= 0; i--)
            {
                var dict = resources.MergedDictionaries[i];
                if (dict.Contains("BackgroundBrush"))
                {
                    resources.MergedDictionaries.RemoveAt(i);
                }
            }
        }

        /// <summary>
        /// Set theme using AppTheme enum for compatibility
        /// </summary>
        public void SetTheme(AppTheme theme)
        {
            ApplyTheme((ThemeType)theme);
        }

        public void ApplyThemeToWindow(Window window, ResourceDictionary themeResources = null)
        {
            if (themeResources == null)
                themeResources = _themes[_currentTheme];

            // Clear existing theme resources and add new ones
            window.Resources.MergedDictionaries.Clear();
            window.Resources.MergedDictionaries.Add(themeResources);

            // Update window background if possible
            if (themeResources.Contains("BackgroundBrush"))
            {
                window.Background = (Brush)themeResources["BackgroundBrush"];
            }

            // Recursively update all visual children
            UpdateControlResourcesRecursive(window, themeResources);

            // Force update of the entire visual tree
            var contentPresenter = window.Content as FrameworkElement;
            if (contentPresenter != null)
            {
                contentPresenter.InvalidateVisual();
                contentPresenter.UpdateLayout();
            }
        }

        private void UpdateControlResourcesRecursive(DependencyObject parent, ResourceDictionary themeResources)
        {
            // Update resources on this element
            if (parent is FrameworkElement element && element.Resources != null)
            {
                // Find existing theme resource dictionary index
                int existingThemeIndex = -1;
                for (int i = 0; i < element.Resources.MergedDictionaries.Count; i++)
                {
                    if (element.Resources.MergedDictionaries[i].Contains("BackgroundBrush"))
                    {
                        existingThemeIndex = i;
                        break;
                    }
                }

                if (existingThemeIndex >= 0)
                {
                    // Replace existing theme dictionary
                    element.Resources.MergedDictionaries[existingThemeIndex] = themeResources;
                }
                else
                {
                    // Add theme resources if not present
                    element.Resources.MergedDictionaries.Add(themeResources);
                }

                // Invalidate visual to force resource update
                element.InvalidateVisual();
            }

            // Recurse through children
            for (int i = 0; i < VisualTreeHelper.GetChildrenCount(parent); i++)
            {
                var child = VisualTreeHelper.GetChild(parent, i);
                if (child != null)
                {
                    UpdateControlResourcesRecursive(child, themeResources);
                }
            }
        }

        public ThemeType CurrentTheme => _currentTheme;

        [System.Diagnostics.CodeAnalysis.SuppressMessage("Interoperability", "CA1416:Validate platform compatibility", Justification = "Registry access is Windows-specific but used in context where Windows is expected")]
        public bool IsSystemDarkModeEnabled()
        {
            try
            {
                using (var key = Microsoft.Win32.Registry.CurrentUser.OpenSubKey(@"Software\Microsoft\Windows\CurrentVersion\Themes\Personalize"))
                {
                    var value = key?.GetValue("AppsUseLightTheme");
                    return value is int intValue && intValue == 0;
                }
            }
            catch
            {
                return false;
            }
        }

        public void ApplySystemTheme()
        {
            var systemTheme = IsSystemDarkModeEnabled() ? ThemeType.Dark : ThemeType.Light;
            ApplyTheme(systemTheme);
        }

        /// <summary>
        /// Apply current theme to a newly opened window
        /// Call this method when opening new windows to ensure theme consistency
        /// </summary>
        public void ApplyThemeToOpenedWindow(Window window)
        {
            if (window != null)
            {
                ApplyThemeToWindow(window, _themes[_currentTheme]);
            }
        }

        /// <summary>
        /// Force refresh of all dynamic resources in the application
        /// Use this when theme changes don't fully propagate
        /// </summary>
        public void RefreshAllDynamicResources()
        {
            try
            {
                // Force refresh on all open windows
                foreach (Window window in Application.Current.Windows)
                {
                    ForceRefreshDynamicResources(window);
                }
            }
            catch
            {
                // Silently ignore errors (window might be closed)
            }
        }

        private void ForceRefreshDynamicResources(FrameworkElement element)
        {
            // Refresh this element's resources by invalidating various properties
            element.InvalidateVisual();
            element.InvalidateMeasure();
            element.InvalidateArrange();
            element.UpdateLayout();

            // Recurse through children
            for (int i = 0; i < VisualTreeHelper.GetChildrenCount(element); i++)
            {
                var child = VisualTreeHelper.GetChild(element, i);
                if (child is FrameworkElement childElement)
                {
                    ForceRefreshDynamicResources(childElement);
                }
            }
        }

        /// <summary>
        /// Verify that the current theme has all necessary resources for consistent styling
        /// </summary>
        public bool VerifyThemeConsistency(ThemeType theme, out List<string> missingResources)
        {
            missingResources = new List<string>();
            var themeResources = _themes[theme];

            // List of critical resources that should be present in all themes
            var requiredKeys = new string[]
            {
                "BackgroundBrush", "ForegroundBrush", "SurfaceBrush", "CardBrush",
                "PrimaryTextBrush", "SecondaryTextBrush", "AccentBrush", "SuccessBrush",
                "ErrorBrush", "WarningBrush", "BorderBrush", "ValidBorderBrush", "InvalidBorderBrush"
            };

            foreach (var key in requiredKeys)
            {
                if (!themeResources.Contains(key))
                {
                    missingResources.Add(key);
                }
            }

            return missingResources.Count == 0;
        }

        /// <summary>
        /// Get diagnostic information about theme resources
        /// </summary>
        public string GetThemeDiagnostics(ThemeType theme)
        {
            var themeResources = _themes[theme];
            var diagnostics = new System.Text.StringBuilder();
            diagnostics.AppendLine($"Theme {theme} Diagnostics:");
            diagnostics.AppendLine($"Resource count: {themeResources.Count}");

            foreach (var key in themeResources.Keys)
            {
                diagnostics.AppendLine($"- {key}: {(themeResources[key] is Brush ? "Brush" : "Other")}");
            }

            return diagnostics.ToString();
        }

        public ResourceDictionary GetCurrentThemeResources()
        {
            return _themes[_currentTheme];
        }
    }

    public class ThemeChangedEventArgs : EventArgs
    {
        public ThemeType Theme { get; }

        public ThemeChangedEventArgs(ThemeType theme)
        {
            Theme = theme;
        }
    }
}