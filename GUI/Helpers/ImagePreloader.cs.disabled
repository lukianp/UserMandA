using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using System.Windows;
using System.Windows.Threading;
using MandADiscoverySuite.Services;

namespace MandADiscoverySuite.Helpers
{
    /// <summary>
    /// Helper class for preloading images to improve application performance
    /// </summary>
    public static class ImagePreloader
    {
        private static readonly ImageOptimizationService _imageService;
        private static readonly HashSet<string> _preloadedImages = new();
        private static readonly object _preloadLock = new();

        static ImagePreloader()
        {
            _imageService = ServiceLocator.GetService<ImageOptimizationService>() ?? new ImageOptimizationService();
        }

        /// <summary>
        /// Preloads common application images during startup
        /// </summary>
        public static async Task PreloadApplicationImagesAsync()
        {
            var commonImages = GetCommonApplicationImages();
            
            await Application.Current.Dispatcher.InvokeAsync(async () =>
            {
                await _imageService.PreloadImagesAsync(commonImages, 32, 32);
            }, DispatcherPriority.ApplicationIdle);

            lock (_preloadLock)
            {
                foreach (var image in commonImages)
                {
                    _preloadedImages.Add(image);
                }
            }
        }

        /// <summary>
        /// Preloads images from a specific directory
        /// </summary>
        public static async Task PreloadDirectoryAsync(string directoryPath, 
            string searchPattern = "*.*", int? maxWidth = null, int? maxHeight = null)
        {
            if (!Directory.Exists(directoryPath))
                return;

            try
            {
                var imageExtensions = new[] { ".png", ".jpg", ".jpeg", ".gif", ".bmp", ".ico" };
                var files = Directory.GetFiles(directoryPath, searchPattern)
                    .Where(f => imageExtensions.Contains(Path.GetExtension(f).ToLowerInvariant()))
                    .ToList();

                await _imageService.PreloadImagesAsync(files, maxWidth, maxHeight);

                lock (_preloadLock)
                {
                    foreach (var file in files)
                    {
                        _preloadedImages.Add(file);
                    }
                }
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Failed to preload directory {directoryPath}: {ex.Message}");
            }
        }

        /// <summary>
        /// Preloads resource images from the application assembly
        /// </summary>
        public static async Task PreloadResourceImagesAsync(string resourceFolder = "Assets", 
            int? maxWidth = null, int? maxHeight = null)
        {
            var resourceImages = GetResourceImages(resourceFolder);
            
            await Application.Current.Dispatcher.InvokeAsync(async () =>
            {
                await _imageService.PreloadImagesAsync(resourceImages, maxWidth, maxHeight);
            }, DispatcherPriority.ApplicationIdle);

            lock (_preloadLock)
            {
                foreach (var image in resourceImages)
                {
                    _preloadedImages.Add(image);
                }
            }
        }

        /// <summary>
        /// Preloads thumbnails for a list of image paths
        /// </summary>
        public static async Task PreloadThumbnailsAsync(IEnumerable<string> imagePaths, 
            int thumbnailSize = 64)
        {
            var tasks = imagePaths.Select(path => 
                _imageService.LoadOptimizedImageAsync(path, thumbnailSize, thumbnailSize, true));

            await Task.WhenAll(tasks);

            lock (_preloadLock)
            {
                foreach (var path in imagePaths)
                {
                    _preloadedImages.Add(path);
                }
            }
        }

        /// <summary>
        /// Preloads status and UI icons
        /// </summary>
        public static async Task PreloadUIIconsAsync()
        {
            var uiIcons = GetUIIcons();
            
            await Application.Current.Dispatcher.InvokeAsync(async () =>
            {
                await _imageService.PreloadImagesAsync(uiIcons, 16, 16);
            }, DispatcherPriority.ApplicationIdle);

            lock (_preloadLock)
            {
                foreach (var icon in uiIcons)
                {
                    _preloadedImages.Add(icon);
                }
            }
        }

        /// <summary>
        /// Preloads images based on view context
        /// </summary>
        public static async Task PreloadViewImagesAsync(string viewName)
        {
            var viewImages = GetViewSpecificImages(viewName);
            
            if (viewImages.Any())
            {
                await _imageService.PreloadImagesAsync(viewImages, 64, 64);

                lock (_preloadLock)
                {
                    foreach (var image in viewImages)
                    {
                        _preloadedImages.Add(image);
                    }
                }
            }
        }

        /// <summary>
        /// Checks if an image has been preloaded
        /// </summary>
        public static bool IsPreloaded(string imagePath)
        {
            lock (_preloadLock)
            {
                return _preloadedImages.Contains(imagePath);
            }
        }

        /// <summary>
        /// Gets preload statistics
        /// </summary>
        public static PreloadStats GetPreloadStats()
        {
            lock (_preloadLock)
            {
                return new PreloadStats
                {
                    PreloadedImageCount = _preloadedImages.Count,
                    CacheStats = _imageService.Stats
                };
            }
        }

        /// <summary>
        /// Clears preload tracking (not the actual cache)
        /// </summary>
        public static void ClearPreloadTracking()
        {
            lock (_preloadLock)
            {
                _preloadedImages.Clear();
            }
        }

        #region Private Helper Methods

        private static List<string> GetCommonApplicationImages()
        {
            // Return pack URIs for common application images
            return new List<string>
            {
                "pack://application:,,,/MandADiscoverySuite;component/Assets/Icons/app-icon.png",
                "pack://application:,,,/MandADiscoverySuite;component/Assets/Icons/menu-icon.png",
                "pack://application:,,,/MandADiscoverySuite;component/Assets/Icons/settings-icon.png",
                "pack://application:,,,/MandADiscoverySuite;component/Assets/Icons/help-icon.png",
                "pack://application:,,,/MandADiscoverySuite;component/Assets/Icons/close-icon.png",
                "pack://application:,,,/MandADiscoverySuite;component/Assets/Icons/minimize-icon.png",
                "pack://application:,,,/MandADiscoverySuite;component/Assets/Icons/maximize-icon.png"
            };
        }

        private static List<string> GetUIIcons()
        {
            // Return pack URIs for UI status and action icons
            return new List<string>
            {
                // Status icons
                "pack://application:,,,/MandADiscoverySuite;component/Assets/StatusIcons/status-active.png",
                "pack://application:,,,/MandADiscoverySuite;component/Assets/StatusIcons/status-inactive.png",
                "pack://application:,,,/MandADiscoverySuite;component/Assets/StatusIcons/status-online.png",
                "pack://application:,,,/MandADiscoverySuite;component/Assets/StatusIcons/status-offline.png",
                "pack://application:,,,/MandADiscoverySuite;component/Assets/StatusIcons/status-running.png",
                "pack://application:,,,/MandADiscoverySuite;component/Assets/StatusIcons/status-stopped.png",
                "pack://application:,,,/MandADiscoverySuite;component/Assets/StatusIcons/status-success.png",
                "pack://application:,,,/MandADiscoverySuite;component/Assets/StatusIcons/status-warning.png",
                "pack://application:,,,/MandADiscoverySuite;component/Assets/StatusIcons/status-error.png",
                "pack://application:,,,/MandADiscoverySuite;component/Assets/StatusIcons/status-pending.png",
                
                // Action icons
                "pack://application:,,,/MandADiscoverySuite;component/Assets/Icons/check-icon.png",
                "pack://application:,,,/MandADiscoverySuite;component/Assets/Icons/x-icon.png",
                "pack://application:,,,/MandADiscoverySuite;component/Assets/Icons/question-icon.png",
                "pack://application:,,,/MandADiscoverySuite;component/Assets/Icons/info-icon.png",
                "pack://application:,,,/MandADiscoverySuite;component/Assets/Icons/warning-icon.png",
                "pack://application:,,,/MandADiscoverySuite;component/Assets/Icons/error-icon.png",
                
                // File type icons
                "pack://application:,,,/MandADiscoverySuite;component/Assets/Icons/file-icon.png",
                "pack://application:,,,/MandADiscoverySuite;component/Assets/Icons/folder-icon.png",
                "pack://application:,,,/MandADiscoverySuite;component/Assets/Icons/pdf-icon.png",
                "pack://application:,,,/MandADiscoverySuite;component/Assets/Icons/word-icon.png",
                "pack://application:,,,/MandADiscoverySuite;component/Assets/Icons/excel-icon.png",
                "pack://application:,,,/MandADiscoverySuite;component/Assets/Icons/powerpoint-icon.png",
                "pack://application:,,,/MandADiscoverySuite;component/Assets/Icons/text-icon.png",
                "pack://application:,,,/MandADiscoverySuite;component/Assets/Icons/csv-icon.png",
                "pack://application:,,,/MandADiscoverySuite;component/Assets/Icons/image-icon.png",
                "pack://application:,,,/MandADiscoverySuite;component/Assets/Icons/archive-icon.png"
            };
        }

        private static List<string> GetResourceImages(string resourceFolder)
        {
            // In a real implementation, you might enumerate resources from the assembly
            // For now, return expected resource paths
            return new List<string>
            {
                $"pack://application:,,,/MandADiscoverySuite;component/{resourceFolder}/logo.png",
                $"pack://application:,,,/MandADiscoverySuite;component/{resourceFolder}/banner.png",
                $"pack://application:,,,/MandADiscoverySuite;component/{resourceFolder}/background.png"
            };
        }

        private static List<string> GetViewSpecificImages(string viewName)
        {
            // Return view-specific images based on view name
            return viewName.ToLowerInvariant() switch
            {
                "dashboard" => new List<string>
                {
                    "pack://application:,,,/MandADiscoverySuite;component/Assets/Dashboard/chart-icon.png",
                    "pack://application:,,,/MandADiscoverySuite;component/Assets/Dashboard/metric-icon.png",
                    "pack://application:,,,/MandADiscoverySuite;component/Assets/Dashboard/gauge-icon.png"
                },
                "users" => new List<string>
                {
                    "pack://application:,,,/MandADiscoverySuite;component/Assets/Users/user-icon.png",
                    "pack://application:,,,/MandADiscoverySuite;component/Assets/Users/group-icon.png",
                    "pack://application:,,,/MandADiscoverySuite;component/Assets/Users/profile-icon.png"
                },
                "infrastructure" => new List<string>
                {
                    "pack://application:,,,/MandADiscoverySuite;component/Assets/Infrastructure/server-icon.png",
                    "pack://application:,,,/MandADiscoverySuite;component/Assets/Infrastructure/network-icon.png",
                    "pack://application:,,,/MandADiscoverySuite;component/Assets/Infrastructure/database-icon.png"
                },
                "reports" => new List<string>
                {
                    "pack://application:,,,/MandADiscoverySuite;component/Assets/Reports/report-icon.png",
                    "pack://application:,,,/MandADiscoverySuite;component/Assets/Reports/export-icon.png",
                    "pack://application:,,,/MandADiscoverySuite;component/Assets/Reports/print-icon.png"
                },
                _ => new List<string>()
            };
        }

        #endregion
    }

    /// <summary>
    /// Statistics about image preloading
    /// </summary>
    public class PreloadStats
    {
        public int PreloadedImageCount { get; set; }
        public ImageCacheStats CacheStats { get; set; }

        public override string ToString()
        {
            return $"Preloaded: {PreloadedImageCount} images, Cache: {CacheStats}";
        }
    }

    /// <summary>
    /// Extension methods for image preloading
    /// </summary>
    public static class ImagePreloaderExtensions
    {
        /// <summary>
        /// Preloads images for a specific view during navigation
        /// </summary>
        public static async Task PreloadViewImages(this FrameworkElement view, string viewName = null)
        {
            viewName ??= view.GetType().Name.Replace("View", "").Replace("Page", "");
            await ImagePreloader.PreloadViewImagesAsync(viewName);
        }

        /// <summary>
        /// Preloads images from data context if it contains image paths
        /// </summary>
        public static async Task PreloadDataContextImages(this FrameworkElement element)
        {
            if (element.DataContext == null)
                return;

            var imagePaths = ExtractImagePathsFromDataContext(element.DataContext);
            if (imagePaths.Any())
            {
                await ImagePreloader.PreloadThumbnailsAsync(imagePaths);
            }
        }

        private static List<string> ExtractImagePathsFromDataContext(object dataContext)
        {
            var imagePaths = new List<string>();

            try
            {
                // Use reflection to find properties that might contain image paths
                var properties = dataContext.GetType().GetProperties();
                
                foreach (var prop in properties)
                {
                    if (prop.PropertyType == typeof(string))
                    {
                        var propName = prop.Name.ToLowerInvariant();
                        if (propName.Contains("image") || propName.Contains("icon") || propName.Contains("photo") ||
                            propName.Contains("avatar") || propName.Contains("thumbnail"))
                        {
                            var value = prop.GetValue(dataContext) as string;
                            if (!string.IsNullOrEmpty(value))
                            {
                                imagePaths.Add(value);
                            }
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Failed to extract image paths from data context: {ex.Message}");
            }

            return imagePaths;
        }
    }
}