using System;
using System.Collections.Generic;
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
        }

        private void InitializeThemes()
        {
            // Light Theme
            var lightTheme = new ResourceDictionary();
            lightTheme.Add("BackgroundBrush", new SolidColorBrush(Color.FromRgb(248, 250, 252)));
            lightTheme.Add("SurfaceBrush", new SolidColorBrush(Color.FromRgb(255, 255, 255)));
            lightTheme.Add("CardBrush", new SolidColorBrush(Color.FromRgb(255, 255, 255)));
            lightTheme.Add("PrimaryTextBrush", new SolidColorBrush(Color.FromRgb(26, 32, 44)));
            lightTheme.Add("SecondaryTextBrush", new SolidColorBrush(Color.FromRgb(74, 85, 104)));
            lightTheme.Add("AccentBrush", new SolidColorBrush(Color.FromRgb(66, 153, 225)));
            lightTheme.Add("SuccessBrush", new SolidColorBrush(Color.FromRgb(72, 187, 120)));
            lightTheme.Add("ErrorBrush", new SolidColorBrush(Color.FromRgb(229, 62, 62)));
            lightTheme.Add("WarningBrush", new SolidColorBrush(Color.FromRgb(237, 137, 54)));
            lightTheme.Add("BorderBrush", new SolidColorBrush(Color.FromRgb(226, 232, 240)));
            lightTheme.Add("ValidBorderBrush", new SolidColorBrush(Color.FromRgb(72, 187, 120)));
            lightTheme.Add("InvalidBorderBrush", new SolidColorBrush(Color.FromRgb(229, 62, 62)));
            lightTheme.Add("InputBackgroundBrush", new SolidColorBrush(Color.FromRgb(255, 255, 255)));
            lightTheme.Add("ButtonHoverBrush", new SolidColorBrush(Color.FromRgb(43, 108, 176)));
            _themes[ThemeType.Light] = lightTheme;

            // Dark Theme
            var darkTheme = new ResourceDictionary();
            darkTheme.Add("BackgroundBrush", new SolidColorBrush(Color.FromRgb(15, 20, 25)));
            darkTheme.Add("SurfaceBrush", new SolidColorBrush(Color.FromRgb(26, 32, 44)));
            darkTheme.Add("CardBrush", new SolidColorBrush(Color.FromRgb(45, 55, 72)));
            darkTheme.Add("PrimaryTextBrush", new SolidColorBrush(Color.FromRgb(247, 250, 252)));
            darkTheme.Add("SecondaryTextBrush", new SolidColorBrush(Color.FromRgb(160, 174, 192)));
            darkTheme.Add("AccentBrush", new SolidColorBrush(Color.FromRgb(66, 153, 225)));
            darkTheme.Add("SuccessBrush", new SolidColorBrush(Color.FromRgb(72, 187, 120)));
            darkTheme.Add("ErrorBrush", new SolidColorBrush(Color.FromRgb(229, 62, 62)));
            darkTheme.Add("WarningBrush", new SolidColorBrush(Color.FromRgb(237, 137, 54)));
            darkTheme.Add("BorderBrush", new SolidColorBrush(Color.FromRgb(74, 85, 104)));
            darkTheme.Add("ValidBorderBrush", new SolidColorBrush(Color.FromRgb(72, 187, 120)));
            darkTheme.Add("InvalidBorderBrush", new SolidColorBrush(Color.FromRgb(229, 62, 62)));
            darkTheme.Add("InputBackgroundBrush", new SolidColorBrush(Color.FromRgb(45, 55, 72)));
            darkTheme.Add("ButtonHoverBrush", new SolidColorBrush(Color.FromRgb(43, 108, 176)));
            _themes[ThemeType.Dark] = darkTheme;

            // High Contrast Theme
            var highContrastTheme = new ResourceDictionary();
            highContrastTheme.Add("BackgroundBrush", new SolidColorBrush(Color.FromRgb(0, 0, 0)));
            highContrastTheme.Add("SurfaceBrush", new SolidColorBrush(Color.FromRgb(0, 0, 0)));
            highContrastTheme.Add("CardBrush", new SolidColorBrush(Color.FromRgb(16, 16, 16)));
            highContrastTheme.Add("PrimaryTextBrush", new SolidColorBrush(Color.FromRgb(255, 255, 255)));
            highContrastTheme.Add("SecondaryTextBrush", new SolidColorBrush(Color.FromRgb(192, 192, 192)));
            highContrastTheme.Add("AccentBrush", new SolidColorBrush(Color.FromRgb(255, 255, 0)));
            highContrastTheme.Add("SuccessBrush", new SolidColorBrush(Color.FromRgb(0, 255, 0)));
            highContrastTheme.Add("ErrorBrush", new SolidColorBrush(Color.FromRgb(255, 0, 0)));
            highContrastTheme.Add("WarningBrush", new SolidColorBrush(Color.FromRgb(255, 165, 0)));
            highContrastTheme.Add("BorderBrush", new SolidColorBrush(Color.FromRgb(255, 255, 255)));
            highContrastTheme.Add("ValidBorderBrush", new SolidColorBrush(Color.FromRgb(0, 255, 0)));
            highContrastTheme.Add("InvalidBorderBrush", new SolidColorBrush(Color.FromRgb(255, 0, 0)));
            highContrastTheme.Add("InputBackgroundBrush", new SolidColorBrush(Color.FromRgb(16, 16, 16)));
            highContrastTheme.Add("ButtonHoverBrush", new SolidColorBrush(Color.FromRgb(255, 255, 128)));
            _themes[ThemeType.HighContrast] = highContrastTheme;
        }

        public void ApplyTheme(ThemeType theme)
        {
            if (_currentTheme == theme) return;

            _currentTheme = theme;
            var themeResources = _themes[theme];

            // Apply to application resources
            Application.Current.Resources.MergedDictionaries.Clear();
            Application.Current.Resources.MergedDictionaries.Add(themeResources);

            // Apply to all open windows
            foreach (Window window in Application.Current.Windows)
            {
                ApplyThemeToWindow(window, themeResources);
            }

            // Notify theme changed
            ThemeChanged?.Invoke(this, new ThemeChangedEventArgs(theme));
        }

        public void ApplyThemeToWindow(Window window, ResourceDictionary themeResources = null)
        {
            if (themeResources == null)
                themeResources = _themes[_currentTheme];

            window.Resources.MergedDictionaries.Clear();
            window.Resources.MergedDictionaries.Add(themeResources);

            // Update window background
            if (themeResources.Contains("BackgroundBrush"))
            {
                window.Background = (Brush)themeResources["BackgroundBrush"];
            }
        }

        public ThemeType CurrentTheme => _currentTheme;

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