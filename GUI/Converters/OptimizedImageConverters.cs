using System;
using System.Globalization;
using System.IO;
using System.Windows;
using System.Windows.Data;
using System.Windows.Media;
using System.Windows.Media.Imaging;
using MandADiscoverySuite.Services;

namespace MandADiscoverySuite.Converters
{
    /// <summary>
    /// Converts file paths to optimized BitmapImage instances with caching
    /// </summary>
    public class OptimizedImageConverter : IValueConverter
    {
        private readonly ImageOptimizationService _imageService;

        public OptimizedImageConverter()
        {
            _imageService = ServiceLocator.GetService<ImageOptimizationService>() ?? new ImageOptimizationService();
        }

        public int? MaxWidth { get; set; }
        public int? MaxHeight { get; set; }
        public bool UseCache { get; set; } = true;

        public object Convert(object value, Type targetType, object parameter, CultureInfo culture)
        {
            if (value == null) return null;

            var imagePath = value.ToString();
            if (string.IsNullOrEmpty(imagePath))
                return null;

            try
            {
                // Parse parameter for dimensions if provided (e.g., "100,100")
                var maxWidth = MaxWidth;
                var maxHeight = MaxHeight;

                if (parameter is string paramStr && !string.IsNullOrEmpty(paramStr))
                {
                    var parts = paramStr.Split(',');
                    if (parts.Length >= 1 && int.TryParse(parts[0], out var w))
                        maxWidth = w;
                    if (parts.Length >= 2 && int.TryParse(parts[1], out var h))
                        maxHeight = h;
                }

                return _imageService.LoadOptimizedImage(imagePath, maxWidth, maxHeight, UseCache);
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Image conversion failed for {imagePath}: {ex.Message}");
                return null;
            }
        }

        public object ConvertBack(object value, Type targetType, object parameter, CultureInfo culture)
        {
            throw new NotImplementedException("ConvertBack is not supported for OptimizedImageConverter");
        }
    }

    /// <summary>
    /// Converts resource paths to optimized ImageSource instances
    /// </summary>
    public class ResourceImageConverter : IValueConverter
    {
        private readonly ImageOptimizationService _imageService;

        public ResourceImageConverter()
        {
            _imageService = ServiceLocator.GetService<ImageOptimizationService>() ?? new ImageOptimizationService();
        }

        public string ResourceAssembly { get; set; } = "MandADiscoverySuite";
        public string ResourceFolder { get; set; } = "Assets";
        public int? MaxWidth { get; set; }
        public int? MaxHeight { get; set; }

        public object Convert(object value, Type targetType, object parameter, CultureInfo culture)
        {
            if (value == null) return null;

            var resourceName = value.ToString();
            if (string.IsNullOrEmpty(resourceName))
                return null;

            try
            {
                // Build pack URI
                var packUri = $"pack://application:,,,/{ResourceAssembly};component/{ResourceFolder}/{resourceName}";
                
                return _imageService.CreateOptimizedImageSource(packUri, MaxWidth, MaxHeight);
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Resource image conversion failed for {resourceName}: {ex.Message}");
                return null;
            }
        }

        public object ConvertBack(object value, Type targetType, object parameter, CultureInfo culture)
        {
            throw new NotImplementedException("ConvertBack is not supported for ResourceImageConverter");
        }
    }

    /// <summary>
    /// Creates thumbnail images with specified dimensions
    /// </summary>
    public class ThumbnailImageConverter : IValueConverter
    {
        private readonly ImageOptimizationService _imageService;

        public ThumbnailImageConverter()
        {
            _imageService = ServiceLocator.GetService<ImageOptimizationService>() ?? new ImageOptimizationService();
        }

        public int ThumbnailSize { get; set; } = 64;
        public bool MaintainAspectRatio { get; set; } = true;

        public object Convert(object value, Type targetType, object parameter, CultureInfo culture)
        {
            if (value == null) return null;

            var imagePath = value.ToString();
            if (string.IsNullOrEmpty(imagePath))
                return null;

            try
            {
                // Parse parameter for thumbnail size if provided
                var size = ThumbnailSize;
                if (parameter is string paramStr && int.TryParse(paramStr, out var parsedSize))
                {
                    size = parsedSize;
                }

                // Create thumbnail with appropriate dimensions
                var maxWidth = size;
                var maxHeight = MaintainAspectRatio ? (int?)null : size;

                return _imageService.LoadOptimizedImage(imagePath, maxWidth, maxHeight, true);
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Thumbnail conversion failed for {imagePath}: {ex.Message}");
                return null;
            }
        }

        public object ConvertBack(object value, Type targetType, object parameter, CultureInfo culture)
        {
            throw new NotImplementedException("ConvertBack is not supported for ThumbnailImageConverter");
        }
    }

    /// <summary>
    /// Converts file extensions to appropriate icon images
    /// </summary>
    public class FileIconConverter : IValueConverter
    {
        private static readonly System.Collections.Generic.Dictionary<string, string> IconMap = 
            new System.Collections.Generic.Dictionary<string, string>(StringComparer.OrdinalIgnoreCase)
            {
                { ".pdf", "pdf-icon.png" },
                { ".doc", "word-icon.png" },
                { ".docx", "word-icon.png" },
                { ".xls", "excel-icon.png" },
                { ".xlsx", "excel-icon.png" },
                { ".ppt", "powerpoint-icon.png" },
                { ".pptx", "powerpoint-icon.png" },
                { ".txt", "text-icon.png" },
                { ".csv", "csv-icon.png" },
                { ".xml", "xml-icon.png" },
                { ".json", "json-icon.png" },
                { ".zip", "archive-icon.png" },
                { ".rar", "archive-icon.png" },
                { ".7z", "archive-icon.png" },
                { ".png", "image-icon.png" },
                { ".jpg", "image-icon.png" },
                { ".jpeg", "image-icon.png" },
                { ".gif", "image-icon.png" },
                { ".bmp", "image-icon.png" }
            };

        private readonly ResourceImageConverter _resourceConverter;

        public FileIconConverter()
        {
            _resourceConverter = new ResourceImageConverter 
            { 
                ResourceFolder = "Assets/Icons",
                MaxWidth = 32,
                MaxHeight = 32
            };
        }

        public string DefaultIcon { get; set; } = "file-icon.png";
        public int IconSize { get; set; } = 32;

        public object Convert(object value, Type targetType, object parameter, CultureInfo culture)
        {
            if (value == null) return null;

            var filePath = value.ToString();
            if (string.IsNullOrEmpty(filePath))
                return null;

            try
            {
                var extension = Path.GetExtension(filePath);
                var iconName = IconMap.ContainsKey(extension) ? IconMap[extension] : DefaultIcon;

                _resourceConverter.MaxWidth = IconSize;
                _resourceConverter.MaxHeight = IconSize;

                return _resourceConverter.Convert(iconName, targetType, parameter, culture);
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"File icon conversion failed for {filePath}: {ex.Message}");
                return null;
            }
        }

        public object ConvertBack(object value, Type targetType, object parameter, CultureInfo culture)
        {
            throw new NotImplementedException("ConvertBack is not supported for FileIconConverter");
        }
    }

    /// <summary>
    /// Converts status values to status icon images
    /// </summary>
    public class StatusIconConverter : IValueConverter
    {
        private static readonly System.Collections.Generic.Dictionary<string, string> StatusIconMap = 
            new System.Collections.Generic.Dictionary<string, string>(StringComparer.OrdinalIgnoreCase)
            {
                { "Active", "status-active.png" },
                { "Inactive", "status-inactive.png" },
                { "Online", "status-online.png" },
                { "Offline", "status-offline.png" },
                { "Running", "status-running.png" },
                { "Stopped", "status-stopped.png" },
                { "Success", "status-success.png" },
                { "Warning", "status-warning.png" },
                { "Error", "status-error.png" },
                { "Pending", "status-pending.png" },
                { "Processing", "status-processing.png" },
                { "Completed", "status-completed.png" }
            };

        private readonly ResourceImageConverter _resourceConverter;

        public StatusIconConverter()
        {
            _resourceConverter = new ResourceImageConverter 
            { 
                ResourceFolder = "Assets/StatusIcons",
                MaxWidth = 16,
                MaxHeight = 16
            };
        }

        public string DefaultIcon { get; set; } = "status-unknown.png";
        public int IconSize { get; set; } = 16;

        public object Convert(object value, Type targetType, object parameter, CultureInfo culture)
        {
            if (value == null) return null;

            var status = value.ToString();
            if (string.IsNullOrEmpty(status))
                return null;

            try
            {
                var iconName = StatusIconMap.ContainsKey(status) ? StatusIconMap[status] : DefaultIcon;

                _resourceConverter.MaxWidth = IconSize;
                _resourceConverter.MaxHeight = IconSize;

                return _resourceConverter.Convert(iconName, targetType, parameter, culture);
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Status icon conversion failed for {status}: {ex.Message}");
                return null;
            }
        }

        public object ConvertBack(object value, Type targetType, object parameter, CultureInfo culture)
        {
            throw new NotImplementedException("ConvertBack is not supported for StatusIconConverter");
        }
    }

    /// <summary>
    /// Converts boolean values to icon images (e.g., checkmarks, X marks)
    /// </summary>
    public class BooleanIconConverter : IValueConverter
    {
        private readonly ResourceImageConverter _resourceConverter;

        public BooleanIconConverter()
        {
            _resourceConverter = new ResourceImageConverter 
            { 
                ResourceFolder = "Assets/Icons",
                MaxWidth = 16,
                MaxHeight = 16
            };
        }

        public string TrueIcon { get; set; } = "check-icon.png";
        public string FalseIcon { get; set; } = "x-icon.png";
        public string NullIcon { get; set; } = "question-icon.png";
        public int IconSize { get; set; } = 16;

        public object Convert(object value, Type targetType, object parameter, CultureInfo culture)
        {
            try
            {
                string iconName;
                
                if (value == null)
                {
                    iconName = NullIcon;
                }
                else if (value is bool boolValue)
                {
                    iconName = boolValue ? TrueIcon : FalseIcon;
                }
                else if (bool.TryParse(value.ToString(), out var parsedBool))
                {
                    iconName = parsedBool ? TrueIcon : FalseIcon;
                }
                else
                {
                    iconName = NullIcon;
                }

                _resourceConverter.MaxWidth = IconSize;
                _resourceConverter.MaxHeight = IconSize;

                return _resourceConverter.Convert(iconName, targetType, parameter, culture);
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Boolean icon conversion failed for {value}: {ex.Message}");
                return null;
            }
        }

        public object ConvertBack(object value, Type targetType, object parameter, CultureInfo culture)
        {
            throw new NotImplementedException("ConvertBack is not supported for BooleanIconConverter");
        }
    }
}