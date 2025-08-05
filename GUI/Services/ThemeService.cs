using System;
using System.Collections.Generic;
using System.IO;
using System.Windows;
using System.Windows.Media;
using Microsoft.Extensions.Logging;
using CommunityToolkit.Mvvm.Messaging;
using MandADiscoverySuite.Messages;
using Newtonsoft.Json;

namespace MandADiscoverySuite.Services
{
    /// <summary>
    /// Service for managing application themes and appearance
    /// </summary>
    public class ThemeService
    {
        private readonly ILogger<ThemeService> _logger;
        private readonly IMessenger _messenger;
        private readonly string _settingsPath;
        
        private ThemeSettings _currentSettings;
        private bool _isInitialized = false;

        public ThemeService(ILogger<ThemeService> logger, IMessenger messenger)
        {
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
            _messenger = messenger ?? throw new ArgumentNullException(nameof(messenger));
            
            _settingsPath = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData), 
                "MandADiscoverySuite", "theme-settings.json");
            
            LoadSettings();
        }

        #region Properties

        public ThemeMode CurrentTheme => _currentSettings?.Theme ?? ThemeMode.Dark;
        public AccentColor CurrentAccentColor => _currentSettings?.AccentColor ?? AccentColor.Blue;
        public bool UseSystemTheme => _currentSettings?.UseSystemTheme ?? false;
        public double FontSize => _currentSettings?.FontSize ?? 1.0;
        public bool ReducedMotion => _currentSettings?.ReducedMotion ?? false;
        public bool HighContrast => _currentSettings?.HighContrast ?? false;

        #endregion

        #region Public Methods

        /// <summary>
        /// Initializes the theme service and applies the saved theme
        /// </summary>
        public void Initialize()
        {
            if (_isInitialized) return;

            try
            {
                LoadSettings();
                ApplyTheme();
                _isInitialized = true;
                
                _logger.LogInformation("Theme service initialized with theme: {Theme}", CurrentTheme);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error initializing theme service");
                ApplyDefaultTheme();
            }
        }

        /// <summary>
        /// Toggles between dark and light themes
        /// </summary>
        public void ToggleTheme()
        {
            var newTheme = CurrentTheme == ThemeMode.Dark ? ThemeMode.Light : ThemeMode.Dark;
            SetTheme(newTheme);
        }

        /// <summary>
        /// Sets a specific theme
        /// </summary>
        public void SetTheme(ThemeMode theme, bool saveSettings = true)
        {
            _currentSettings.Theme = theme;
            _currentSettings.UseSystemTheme = false;
            
            ApplyTheme();
            
            if (saveSettings)
            {
                SaveSettings();
            }
            
            _messenger.Send(new ThemeChangedMessage(theme, CurrentAccentColor));
            _logger.LogInformation("Theme changed to: {Theme}", theme);
        }

        /// <summary>
        /// Sets the accent color
        /// </summary>
        public void SetAccentColor(AccentColor accentColor, bool saveSettings = true)
        {
            _currentSettings.AccentColor = accentColor;
            
            ApplyAccentColor();
            
            if (saveSettings)
            {
                SaveSettings();
            }
            
            _messenger.Send(new AccentColorChangedMessage(accentColor));
            _logger.LogInformation("Accent color changed to: {AccentColor}", accentColor);
        }

        /// <summary>
        /// Enables or disables system theme following
        /// </summary>
        public void SetUseSystemTheme(bool useSystemTheme, bool saveSettings = true)
        {
            _currentSettings.UseSystemTheme = useSystemTheme;
            
            if (useSystemTheme)
            {
                var systemTheme = GetSystemTheme();
                _currentSettings.Theme = systemTheme;
                ApplyTheme();
            }
            
            if (saveSettings)
            {
                SaveSettings();
            }
            
            _logger.LogInformation("Use system theme set to: {UseSystemTheme}", useSystemTheme);
        }

        /// <summary>
        /// Sets the font size multiplier
        /// </summary>
        public void SetFontSize(double fontSize, bool saveSettings = true)
        {
            _currentSettings.FontSize = Math.Max(0.8, Math.Min(2.0, fontSize));
            
            ApplyFontSize();
            
            if (saveSettings)
            {
                SaveSettings();
            }
            
            _messenger.Send(new FontSizeChangedMessage(_currentSettings.FontSize));
            _logger.LogInformation("Font size changed to: {FontSize}", _currentSettings.FontSize);
        }

        /// <summary>
        /// Enables or disables reduced motion
        /// </summary>
        public void SetReducedMotion(bool reducedMotion, bool saveSettings = true)
        {
            _currentSettings.ReducedMotion = reducedMotion;
            
            ApplyMotionSettings();
            
            if (saveSettings)
            {
                SaveSettings();
            }
            
            _messenger.Send(new MotionSettingsChangedMessage(reducedMotion));
            _logger.LogInformation("Reduced motion set to: {ReducedMotion}", reducedMotion);
        }

        /// <summary>
        /// Enables or disables high contrast mode
        /// </summary>
        public void SetHighContrast(bool highContrast, bool saveSettings = true)
        {
            _currentSettings.HighContrast = highContrast;
            
            ApplyTheme(); // High contrast affects the entire theme
            
            if (saveSettings)
            {
                SaveSettings();
            }
            
            _messenger.Send(new HighContrastChangedMessage(highContrast));
            _logger.LogInformation("High contrast set to: {HighContrast}", highContrast);
        }

        /// <summary>
        /// Gets the current theme settings
        /// </summary>
        public ThemeSettings GetCurrentSettings()
        {
            return new ThemeSettings
            {
                Theme = CurrentTheme,
                AccentColor = CurrentAccentColor,
                UseSystemTheme = UseSystemTheme,
                FontSize = FontSize,
                ReducedMotion = ReducedMotion,
                HighContrast = HighContrast
            };
        }

        /// <summary>
        /// Applies a complete theme configuration
        /// </summary>
        public void ApplyThemeSettings(ThemeSettings settings, bool saveSettings = true)
        {
            _currentSettings = settings ?? throw new ArgumentNullException(nameof(settings));
            
            ApplyTheme();
            ApplyAccentColor();
            ApplyFontSize();
            ApplyMotionSettings();
            
            if (saveSettings)
            {
                SaveSettings();
            }
            
            _messenger.Send(new ThemeChangedMessage(CurrentTheme, CurrentAccentColor));
            _logger.LogInformation("Applied theme settings: {Theme}, {AccentColor}", CurrentTheme, CurrentAccentColor);
        }

        #endregion

        #region Private Methods

        private void LoadSettings()
        {
            try
            {
                if (File.Exists(_settingsPath))
                {
                    var json = File.ReadAllText(_settingsPath);
                    _currentSettings = JsonConvert.DeserializeObject<ThemeSettings>(json);
                }
                
                _currentSettings ??= GetDefaultSettings();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error loading theme settings, using defaults");
                _currentSettings = GetDefaultSettings();
            }
        }

        private void SaveSettings()
        {
            try
            {
                var directory = Path.GetDirectoryName(_settingsPath);
                if (!Directory.Exists(directory))
                {
                    Directory.CreateDirectory(directory);
                }
                
                var json = JsonConvert.SerializeObject(_currentSettings, Formatting.Indented);
                File.WriteAllText(_settingsPath, json);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error saving theme settings");
            }
        }

        private ThemeSettings GetDefaultSettings()
        {
            return new ThemeSettings
            {
                Theme = ThemeMode.Dark,
                AccentColor = AccentColor.Blue,
                UseSystemTheme = false,
                FontSize = 1.0,
                ReducedMotion = false,
                HighContrast = false
            };
        }

        private void ApplyDefaultTheme()
        {
            _currentSettings = GetDefaultSettings();
            ApplyTheme();
        }

        private void ApplyTheme()
        {
            try
            {
                // Clear existing theme resources
                var app = Application.Current;
                if (app == null) return;

                // Remove existing theme dictionaries
                for (int i = app.Resources.MergedDictionaries.Count - 1; i >= 0; i--)
                {
                    var dict = app.Resources.MergedDictionaries[i];
                    if (dict.Source?.OriginalString?.Contains("Theme") == true)
                    {
                        app.Resources.MergedDictionaries.RemoveAt(i);
                    }
                }

                // Apply new theme
                var themeUri = GetThemeResourceUri();
                var themeDict = new ResourceDictionary { Source = themeUri };
                app.Resources.MergedDictionaries.Add(themeDict);

                // Apply high contrast if enabled
                if (HighContrast)
                {
                    ApplyHighContrastOverrides();
                }

                _logger.LogDebug("Applied theme: {Theme}", CurrentTheme);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error applying theme");
            }
        }

        private void ApplyAccentColor()
        {
            try
            {
                var app = Application.Current;
                if (app == null) return;

                var colors = GetAccentColorBrushes();
                
                // Update accent color resources
                app.Resources["AccentBrush"] = colors.Primary;
                app.Resources["AccentLightBrush"] = colors.Light;
                app.Resources["AccentDarkBrush"] = colors.Dark;
                app.Resources["AccentHoverBrush"] = colors.Hover;
                app.Resources["AccentPressedBrush"] = colors.Pressed;

                _logger.LogDebug("Applied accent color: {AccentColor}", CurrentAccentColor);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error applying accent color");
            }
        }

        private void ApplyFontSize()
        {
            try
            {
                var app = Application.Current;
                if (app == null) return;

                // Apply font size multiplier to standard font sizes
                app.Resources["StandardFontSize"] = 12 * FontSize;
                app.Resources["SmallFontSize"] = 10 * FontSize;
                app.Resources["LargeFontSize"] = 16 * FontSize;
                app.Resources["HeaderFontSize"] = 20 * FontSize;
                app.Resources["TitleFontSize"] = 24 * FontSize;

                _logger.LogDebug("Applied font size multiplier: {FontSize}", FontSize);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error applying font size");
            }
        }

        private void ApplyMotionSettings()
        {
            try
            {
                var app = Application.Current;
                if (app == null) return;

                // Apply motion settings
                app.Resources["AnimationDuration"] = ReducedMotion ? TimeSpan.Zero : TimeSpan.FromMilliseconds(300);
                app.Resources["TransitionDuration"] = ReducedMotion ? TimeSpan.Zero : TimeSpan.FromMilliseconds(200);

                _logger.LogDebug("Applied motion settings: ReducedMotion={ReducedMotion}", ReducedMotion);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error applying motion settings");
            }
        }

        private void ApplyHighContrastOverrides()
        {
            try
            {
                var app = Application.Current;
                if (app == null) return;

                // Apply high contrast color overrides
                var highContrastColors = GetHighContrastColors();
                
                foreach (var colorPair in highContrastColors)
                {
                    app.Resources[colorPair.Key] = colorPair.Value;
                }

                _logger.LogDebug("Applied high contrast overrides");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error applying high contrast overrides");
            }
        }

        private Uri GetThemeResourceUri()
        {
            var themeName = CurrentTheme == ThemeMode.Dark ? "DarkTheme" : "LightTheme";
            return new Uri($"pack://application:,,,/MandADiscoverySuite;component/Themes/{themeName}.xaml");
        }

        private AccentColorBrushes GetAccentColorBrushes()
        {
            return CurrentAccentColor switch
            {
                AccentColor.Blue => new AccentColorBrushes
                {
                    Primary = new SolidColorBrush(Color.FromRgb(79, 70, 229)),
                    Light = new SolidColorBrush(Color.FromRgb(129, 140, 248)),
                    Dark = new SolidColorBrush(Color.FromRgb(55, 48, 163)),
                    Hover = new SolidColorBrush(Color.FromRgb(99, 102, 241)),
                    Pressed = new SolidColorBrush(Color.FromRgb(67, 56, 202))
                },
                AccentColor.Green => new AccentColorBrushes
                {
                    Primary = new SolidColorBrush(Color.FromRgb(5, 150, 105)),
                    Light = new SolidColorBrush(Color.FromRgb(52, 211, 153)),
                    Dark = new SolidColorBrush(Color.FromRgb(4, 120, 87)),
                    Hover = new SolidColorBrush(Color.FromRgb(16, 185, 129)),
                    Pressed = new SolidColorBrush(Color.FromRgb(6, 95, 70))
                },
                AccentColor.Purple => new AccentColorBrushes
                {
                    Primary = new SolidColorBrush(Color.FromRgb(124, 58, 237)),
                    Light = new SolidColorBrush(Color.FromRgb(167, 139, 250)),
                    Dark = new SolidColorBrush(Color.FromRgb(109, 40, 217)),
                    Hover = new SolidColorBrush(Color.FromRgb(139, 92, 246)),
                    Pressed = new SolidColorBrush(Color.FromRgb(91, 33, 182))
                },
                AccentColor.Orange => new AccentColorBrushes
                {
                    Primary = new SolidColorBrush(Color.FromRgb(234, 88, 12)),
                    Light = new SolidColorBrush(Color.FromRgb(251, 146, 60)),
                    Dark = new SolidColorBrush(Color.FromRgb(194, 65, 12)),
                    Hover = new SolidColorBrush(Color.FromRgb(249, 115, 22)),
                    Pressed = new SolidColorBrush(Color.FromRgb(154, 52, 18))
                },
                AccentColor.Red => new AccentColorBrushes
                {
                    Primary = new SolidColorBrush(Color.FromRgb(220, 38, 38)),
                    Light = new SolidColorBrush(Color.FromRgb(248, 113, 113)),
                    Dark = new SolidColorBrush(Color.FromRgb(185, 28, 28)),
                    Hover = new SolidColorBrush(Color.FromRgb(239, 68, 68)),
                    Pressed = new SolidColorBrush(Color.FromRgb(153, 27, 27))
                },
                _ => new AccentColorBrushes
                {
                    Primary = new SolidColorBrush(Color.FromRgb(79, 70, 229)),
                    Light = new SolidColorBrush(Color.FromRgb(129, 140, 248)),
                    Dark = new SolidColorBrush(Color.FromRgb(55, 48, 163)),
                    Hover = new SolidColorBrush(Color.FromRgb(99, 102, 241)),
                    Pressed = new SolidColorBrush(Color.FromRgb(67, 56, 202))
                }
            };
        }

        private Dictionary<string, SolidColorBrush> GetHighContrastColors()
        {
            if (CurrentTheme == ThemeMode.Dark)
            {
                return new Dictionary<string, SolidColorBrush>
                {
                    ["ForegroundBrush"] = new SolidColorBrush(Colors.White),
                    ["BackgroundBrush"] = new SolidColorBrush(Colors.Black),
                    ["BorderBrush"] = new SolidColorBrush(Colors.White),
                    ["SurfaceBrush"] = new SolidColorBrush(Color.FromRgb(32, 32, 32))
                };
            }
            else
            {
                return new Dictionary<string, SolidColorBrush>
                {
                    ["ForegroundBrush"] = new SolidColorBrush(Colors.Black),
                    ["BackgroundBrush"] = new SolidColorBrush(Colors.White),
                    ["BorderBrush"] = new SolidColorBrush(Colors.Black),
                    ["SurfaceBrush"] = new SolidColorBrush(Color.FromRgb(248, 248, 248))
                };
            }
        }

        private ThemeMode GetSystemTheme()
        {
            try
            {
                // Check Windows system theme preference
                var key = Microsoft.Win32.Registry.CurrentUser.OpenSubKey(@"Software\Microsoft\Windows\CurrentVersion\Themes\Personalize");
                var value = key?.GetValue("AppsUseLightTheme");
                key?.Dispose();
                
                return value is int intValue && intValue == 1 ? ThemeMode.Light : ThemeMode.Dark;
            }
            catch
            {
                return ThemeMode.Dark; // Default fallback
            }
        }

        #endregion
    }

    #region Supporting Classes and Enums

    public enum ThemeMode
    {
        Light,
        Dark
    }

    public enum AccentColor
    {
        Blue,
        Green,
        Purple,
        Orange,
        Red
    }

    public class ThemeSettings
    {
        public ThemeMode Theme { get; set; } = ThemeMode.Dark;
        public AccentColor AccentColor { get; set; } = AccentColor.Blue;
        public bool UseSystemTheme { get; set; } = false;
        public double FontSize { get; set; } = 1.0;
        public bool ReducedMotion { get; set; } = false;
        public bool HighContrast { get; set; } = false;
    }

    public class AccentColorBrushes
    {
        public SolidColorBrush Primary { get; set; }
        public SolidColorBrush Light { get; set; }
        public SolidColorBrush Dark { get; set; }
        public SolidColorBrush Hover { get; set; }
        public SolidColorBrush Pressed { get; set; }
    }

    #endregion
}