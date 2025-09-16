#pragma warning disable CA1416 // Platform compatibility
using System;
using System.Collections.Generic;
using System.Drawing;
using System.Drawing.Imaging;
using System.IO;
using System.Windows;
using System.Windows.Interop;
using System.Windows.Media;
using System.Windows.Media.Imaging;

namespace MandADiscoverySuite.Services
{
    /// <summary>
    /// Service for managing themed application icons
    /// </summary>
    public class IconThemeService
    {
        private readonly Dictionary<IconTheme, string> _iconResourceKeys;
        private readonly Dictionary<IconSize, int> _iconSizes;
        private IconTheme _currentTheme;
        private ResourceDictionary _iconResources;

        public IconThemeService()
        {
            _iconResourceKeys = new Dictionary<IconTheme, string>
            {
                [IconTheme.Light] = "AppIcon_Light",
                [IconTheme.Dark] = "AppIcon_Dark",
                [IconTheme.Discovery] = "AppIcon_Discovery",
                [IconTheme.HighContrast] = "AppIcon_HighContrast",
                [IconTheme.Auto] = "AppIcon_Discovery" // default
            };

            _iconSizes = new Dictionary<IconSize, int>
            {
                [IconSize.Small] = 16,
                [IconSize.Medium] = 32,
                [IconSize.Large] = 48,
                [IconSize.ExtraLarge] = 64,
                [IconSize.Jumbo] = 128
            };

            LoadIconResources();
            _currentTheme = IconTheme.Auto;
        }

        /// <summary>
        /// Gets or sets the current icon theme
        /// </summary>
        public IconTheme CurrentTheme
        {
            get => _currentTheme;
            set
            {
                if (_currentTheme != value)
                {
                    _currentTheme = value;
                    OnThemeChanged();
                }
            }
        }

        /// <summary>
        /// Event raised when the icon theme changes
        /// </summary>
        public event EventHandler<IconThemeChangedEventArgs> ThemeChanged;

        /// <summary>
        /// Gets the current application icon
        /// </summary>
        public ImageSource GetApplicationIcon()
        {
            var themeKey = GetIconKeyForTheme(_currentTheme);
            return GetIconFromResources(themeKey);
        }

        /// <summary>
        /// Gets an icon for a specific theme
        /// </summary>
        public ImageSource GetIconForTheme(IconTheme theme)
        {
            var themeKey = GetIconKeyForTheme(theme);
            return GetIconFromResources(themeKey);
        }

        /// <summary>
        /// Creates a notification icon with badge
        /// </summary>
        public ImageSource CreateNotificationIcon(int badgeCount = 0)
        {
            var baseIcon = GetIconFromResources("AppIcon_Notification");
            
            if (badgeCount == 0)
                return baseIcon;

            return CreateBadgedIcon(baseIcon, badgeCount.ToString());
        }

        /// <summary>
        /// Sets the application icon for the main window
        /// </summary>
        public void SetApplicationIcon(Window window)
        {
            if (window == null) return;

            try
            {
                var iconSource = GetApplicationIcon();
                if (iconSource != null)
                {
                    window.Icon = iconSource;
                }
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Failed to set application icon: {ex.Message}");
            }
        }

        /// <summary>
        /// Creates an ICO file from the current theme icon
        /// </summary>
        public void SaveIconToFile(string filePath, IconSize size = IconSize.Medium)
        {
            try
            {
                var iconSource = GetApplicationIcon();
                var iconSize = GetIconSize(size);
                
                var bitmap = CreateBitmapFromImageSource(iconSource, iconSize);
                SaveBitmapAsIco(bitmap, filePath);
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Failed to save icon to file: {ex.Message}");
            }
        }

        /// <summary>
        /// Updates the taskbar icon
        /// </summary>
        public void UpdateTaskbarIcon(Window window, bool showProgress = false, double progressValue = 0)
        {
            if (window == null) return;

            try
            {
                var taskbarIcon = GetIconFromResources("AppIcon_Taskbar");
                
                if (showProgress && progressValue > 0)
                {
                    taskbarIcon = CreateProgressIcon(taskbarIcon, progressValue);
                }

                window.Icon = taskbarIcon;
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Failed to update taskbar icon: {ex.Message}");
            }
        }

        /// <summary>
        /// Detects the appropriate theme based on system settings
        /// </summary>
        public IconTheme DetectSystemTheme()
        {
            try
            {
                // Check for high contrast mode
                if (SystemParameters.HighContrast)
                    return IconTheme.HighContrast;

                // Check system theme preference
                var isDarkMode = IsSystemInDarkMode();
                return isDarkMode ? IconTheme.Dark : IconTheme.Light;
            }
            catch
            {
                return IconTheme.Light; // fallback
            }
        }

        /// <summary>
        /// Gets icon theme statistics
        /// </summary>
        public IconThemeStats GetStats()
        {
            return new IconThemeStats
            {
                CurrentTheme = _currentTheme,
                AvailableThemes = _iconResourceKeys.Count,
                IconSizes = _iconSizes.Count,
                ResourcesLoaded = _iconResources != null
            };
        }

        #region Private Methods


        private void LoadIconResources()
        {
            try
            {
                _iconResources = new ResourceDictionary
                {
                    Source = new Uri("pack://application:,,,/GUI/Resources/AppIcons.xaml")
                };
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Failed to load icon resources: {ex.Message}");
                _iconResources = new ResourceDictionary();
            }
        }

        private string GetIconKeyForTheme(IconTheme theme)
        {
            if (theme == IconTheme.Auto)
            {
                var detectedTheme = DetectSystemTheme();
                return _iconResourceKeys[detectedTheme];
            }

            return _iconResourceKeys.ContainsKey(theme) 
                ? _iconResourceKeys[theme] 
                : _iconResourceKeys[IconTheme.Discovery];
        }

        private ImageSource GetIconFromResources(string resourceKey)
        {
            if (_iconResources?.Contains(resourceKey) == true)
            {
                return _iconResources[resourceKey] as ImageSource;
            }

            // Fallback to default icon
            return CreateFallbackIcon();
        }

        private ImageSource CreateFallbackIcon()
        {
            // Create a simple fallback icon programmatically
            var drawingGroup = new DrawingGroup();
            var backgroundDrawing = new GeometryDrawing
            {
                Brush = new SolidColorBrush(System.Windows.Media.Color.FromRgb(33, 150, 243)),
                Geometry = new EllipseGeometry(new System.Windows.Point(16, 16), 14, 14)
            };

            var textDrawing = new GeometryDrawing
            {
                Brush = System.Windows.Media.Brushes.White,
                Geometry = new RectangleGeometry(new Rect(8, 12, 16, 8))
            };

            drawingGroup.Children.Add(backgroundDrawing);
            drawingGroup.Children.Add(textDrawing);

            return new DrawingImage(drawingGroup);
        }

        private ImageSource CreateBadgedIcon(ImageSource baseIcon, string badgeText)
        {
            try
            {
                var visual = new DrawingVisual();
                using (var context = visual.RenderOpen())
                {
                    // Draw base icon
                    context.DrawImage(baseIcon, new Rect(0, 0, 32, 32));

                    // Draw badge background
                    var badgeBrush = new SolidColorBrush(System.Windows.Media.Color.FromRgb(255, 68, 68));
                    context.DrawEllipse(badgeBrush, null, new System.Windows.Point(24, 8), 8, 8);

                    // Draw badge text
                    var formattedText = new FormattedText(
                        badgeText,
                        System.Globalization.CultureInfo.InvariantCulture,
                        FlowDirection.LeftToRight,
                        new Typeface("Segoe UI"),
                        8,
                        System.Windows.Media.Brushes.White,
                        1.0);

                    context.DrawText(formattedText, new System.Windows.Point(20, 4));
                }

                var renderBitmap = new RenderTargetBitmap(32, 32, 96, 96, PixelFormats.Pbgra32);
                renderBitmap.Render(visual);
                renderBitmap.Freeze();

                return renderBitmap;
            }
            catch
            {
                return baseIcon; // fallback to original icon
            }
        }

        private ImageSource CreateProgressIcon(ImageSource baseIcon, double progress)
        {
            try
            {
                var visual = new DrawingVisual();
                using (var context = visual.RenderOpen())
                {
                    // Draw base icon
                    context.DrawImage(baseIcon, new Rect(0, 0, 32, 32));

                    // Draw progress overlay
                    var progressHeight = 4;
                    var progressWidth = 32 * (progress / 100.0);
                    
                    var progressBrush = new SolidColorBrush(System.Windows.Media.Color.FromRgb(76, 175, 80));
                    context.DrawRectangle(progressBrush, null, new Rect(0, 28, progressWidth, progressHeight));
                }

                var renderBitmap = new RenderTargetBitmap(32, 32, 96, 96, PixelFormats.Pbgra32);
                renderBitmap.Render(visual);
                renderBitmap.Freeze();

                return renderBitmap;
            }
            catch
            {
                return baseIcon; // fallback to original icon
            }
        }

        private bool IsSystemInDarkMode()
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

        private int GetIconSize(IconSize size)
        {
            return _iconSizes.ContainsKey(size) ? _iconSizes[size] : 32;
        }

        private Bitmap CreateBitmapFromImageSource(ImageSource imageSource, int size)
        {
            var drawingVisual = new DrawingVisual();
            using (var drawingContext = drawingVisual.RenderOpen())
            {
                drawingContext.DrawImage(imageSource, new Rect(0, 0, size, size));
            }

            var renderBitmap = new RenderTargetBitmap(size, size, 96, 96, PixelFormats.Pbgra32);
            renderBitmap.Render(drawingVisual);

            var bitmapEncoder = new PngBitmapEncoder();
            bitmapEncoder.Frames.Add(BitmapFrame.Create(renderBitmap));

            using (var stream = new MemoryStream())
            {
                bitmapEncoder.Save(stream);
                stream.Position = 0;
                return new Bitmap(stream);
            }
        }

        private void SaveBitmapAsIco(Bitmap bitmap, string filePath)
        {
            using (var fileStream = new FileStream(filePath, FileMode.Create))
            {
                bitmap.Save(fileStream, ImageFormat.Icon);
            }
        }

        private void OnThemeChanged()
        {
            ThemeChanged?.Invoke(this, new IconThemeChangedEventArgs(_currentTheme));
        }

        #endregion
    }

    /// <summary>
    /// Icon theme options
    /// </summary>
    public enum IconTheme
    {
        Auto,
        Light,
        Dark,
        Discovery,
        HighContrast
    }

    /// <summary>
    /// Icon size options
    /// </summary>
    public enum IconSize
    {
        Small,      // 16x16
        Medium,     // 32x32
        Large,      // 48x48
        ExtraLarge, // 64x64
        Jumbo       // 128x128
    }

    /// <summary>
    /// Event args for icon theme changes
    /// </summary>
    public class IconThemeChangedEventArgs : EventArgs
    {
        public IconTheme NewTheme { get; }

        public IconThemeChangedEventArgs(IconTheme newTheme)
        {
            NewTheme = newTheme;
        }
    }

    /// <summary>
    /// Statistics for icon theme service
    /// </summary>
    public class IconThemeStats
    {
        public IconTheme CurrentTheme { get; set; }
        public int AvailableThemes { get; set; }
        public int IconSizes { get; set; }
        public bool ResourcesLoaded { get; set; }

        public override string ToString()
        {
            return $"Icon Theme: {CurrentTheme}, Themes: {AvailableThemes}, Sizes: {IconSizes}, Loaded: {ResourcesLoaded}";
        }
    }
}