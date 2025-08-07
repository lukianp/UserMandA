using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Threading.Tasks;
using System.Windows;
using System.Windows.Media;
using System.Windows.Media.Imaging;
using System.Windows.Threading;

namespace MandADiscoverySuite.Services
{
    /// <summary>
    /// Service for optimizing image loading, caching, and memory usage in WPF applications
    /// </summary>
    public class ImageOptimizationService
    {
        private readonly ConcurrentDictionary<string, WeakReference<BitmapImage>> _imageCache;
        private readonly ConcurrentDictionary<string, Task<BitmapImage>> _loadingTasks;
        private readonly object _cacheLock = new object();
        private readonly DispatcherTimer _cleanupTimer;
        private long _totalMemoryUsage = 0;
        private const long MAX_CACHE_SIZE_MB = 50; // 50MB cache limit
        private const int CLEANUP_INTERVAL_MINUTES = 5;

        /// <summary>
        /// Gets the current cache statistics
        /// </summary>
        public ImageCacheStats Stats => GetCacheStats();

        public ImageOptimizationService()
        {
            _imageCache = new ConcurrentDictionary<string, WeakReference<BitmapImage>>();
            _loadingTasks = new ConcurrentDictionary<string, Task<BitmapImage>>();

            // Setup periodic cache cleanup
            _cleanupTimer = new DispatcherTimer
            {
                Interval = TimeSpan.FromMinutes(CLEANUP_INTERVAL_MINUTES)
            };
            _cleanupTimer.Tick += (s, e) => CleanupCache();
            _cleanupTimer.Start();
        }

        /// <summary>
        /// Loads an image with optimization and caching
        /// </summary>
        public async Task<BitmapImage> LoadOptimizedImageAsync(string imagePath, int? maxWidth = null, int? maxHeight = null, bool useCache = true)
        {
            if (string.IsNullOrEmpty(imagePath))
                return null;

            var cacheKey = GenerateCacheKey(imagePath, maxWidth, maxHeight);

            // Try to get from cache first
            if (useCache && TryGetFromCache(cacheKey, out var cachedImage))
            {
                return cachedImage;
            }

            // Check if already loading
            if (_loadingTasks.TryGetValue(cacheKey, out var existingTask))
            {
                return await existingTask;
            }

            // Create new loading task
            var loadingTask = LoadImageInternalAsync(imagePath, maxWidth, maxHeight, cacheKey, useCache);
            _loadingTasks.TryAdd(cacheKey, loadingTask);

            try
            {
                var result = await loadingTask;
                return result;
            }
            finally
            {
                _loadingTasks.TryRemove(cacheKey, out _);
            }
        }

        /// <summary>
        /// Loads an image synchronously with optimization
        /// </summary>
        public BitmapImage LoadOptimizedImage(string imagePath, int? maxWidth = null, int? maxHeight = null, bool useCache = true)
        {
            if (string.IsNullOrEmpty(imagePath))
                return null;

            var cacheKey = GenerateCacheKey(imagePath, maxWidth, maxHeight);

            // Try to get from cache first
            if (useCache && TryGetFromCache(cacheKey, out var cachedImage))
            {
                return cachedImage;
            }

            try
            {
                var image = CreateOptimizedBitmapImage(imagePath, maxWidth, maxHeight);
                
                if (useCache && image != null)
                {
                    CacheImage(cacheKey, image);
                }

                return image;
            }
            catch (Exception ex)
            {
                Debug.WriteLine($"Failed to load image {imagePath}: {ex.Message}");
                return null;
            }
        }

        /// <summary>
        /// Preloads images for better performance
        /// </summary>
        public async Task PreloadImagesAsync(IEnumerable<string> imagePaths, int? maxWidth = null, int? maxHeight = null)
        {
            var tasks = new List<Task>();
            
            foreach (var path in imagePaths)
            {
                tasks.Add(LoadOptimizedImageAsync(path, maxWidth, maxHeight, true));
            }

            await Task.WhenAll(tasks);
        }

        /// <summary>
        /// Creates an optimized ImageSource for binding
        /// </summary>
        public ImageSource CreateOptimizedImageSource(string imagePath, int? maxWidth = null, int? maxHeight = null)
        {
            try
            {
                var image = LoadOptimizedImage(imagePath, maxWidth, maxHeight);
                return image;
            }
            catch (Exception ex)
            {
                Debug.WriteLine($"Failed to create image source for {imagePath}: {ex.Message}");
                return null;
            }
        }

        /// <summary>
        /// Creates a frozen DrawingImage for better performance
        /// </summary>
        public DrawingImage CreateFrozenDrawingImage(Drawing drawing)
        {
            if (drawing == null) return null;

            try
            {
                var drawingImage = new DrawingImage(drawing);
                
                // Freeze for better performance
                if (drawingImage.CanFreeze)
                {
                    drawingImage.Freeze();
                }

                return drawingImage;
            }
            catch (Exception ex)
            {
                Debug.WriteLine($"Failed to create frozen drawing image: {ex.Message}");
                return null;
            }
        }

        /// <summary>
        /// Optimizes existing BitmapImage for memory efficiency
        /// </summary>
        public BitmapImage OptimizeExistingImage(BitmapImage source, int? maxWidth = null, int? maxHeight = null)
        {
            if (source == null) return null;

            try
            {
                // Calculate optimal decode pixel dimensions
                var decodeWidth = maxWidth ?? source.PixelWidth;
                var decodeHeight = maxHeight ?? source.PixelHeight;

                // If no resizing needed and already optimized, return original
                if (!maxWidth.HasValue && !maxHeight.HasValue && source.IsFrozen)
                {
                    return source;
                }

                var optimized = new BitmapImage();
                optimized.BeginInit();
                optimized.UriSource = source.UriSource;
                optimized.DecodePixelWidth = decodeWidth;
                optimized.DecodePixelHeight = decodeHeight;
                optimized.CacheOption = BitmapCacheOption.OnLoad;
                optimized.CreateOptions = BitmapCreateOptions.IgnoreColorProfile;
                optimized.EndInit();

                if (optimized.CanFreeze)
                {
                    optimized.Freeze();
                }

                return optimized;
            }
            catch (Exception ex)
            {
                Debug.WriteLine($"Failed to optimize existing image: {ex.Message}");
                return source;
            }
        }

        /// <summary>
        /// Clears the image cache
        /// </summary>
        public void ClearCache()
        {
            lock (_cacheLock)
            {
                _imageCache.Clear();
                _totalMemoryUsage = 0;
                GC.Collect();
                GC.WaitForPendingFinalizers();
            }
        }

        /// <summary>
        /// Gets memory usage statistics for the cache
        /// </summary>
        public ImageCacheStats GetCacheStats()
        {
            lock (_cacheLock)
            {
                var aliveImages = 0;
                var totalSize = 0L;

                foreach (var kvp in _imageCache)
                {
                    if (kvp.Value.TryGetTarget(out var image))
                    {
                        aliveImages++;
                        totalSize += EstimateImageMemoryUsage(image);
                    }
                }

                return new ImageCacheStats
                {
                    TotalCachedImages = _imageCache.Count,
                    AliveImages = aliveImages,
                    EstimatedMemoryUsageMB = totalSize / (1024 * 1024),
                    MaxCacheSizeMB = MAX_CACHE_SIZE_MB,
                    CacheEfficiency = _imageCache.Count > 0 ? (double)aliveImages / _imageCache.Count * 100 : 0
                };
            }
        }


        #region Private Methods

        private async Task<BitmapImage> LoadImageInternalAsync(string imagePath, int? maxWidth, int? maxHeight, string cacheKey, bool useCache)
        {
            return await Task.Run(() =>
            {
                try
                {
                    var image = CreateOptimizedBitmapImage(imagePath, maxWidth, maxHeight);
                    
                    if (useCache && image != null)
                    {
                        CacheImage(cacheKey, image);
                    }

                    return image;
                }
                catch (Exception ex)
                {
                    Debug.WriteLine($"Failed to load image {imagePath}: {ex.Message}");
                    return null;
                }
            });
        }

        private BitmapImage CreateOptimizedBitmapImage(string imagePath, int? maxWidth, int? maxHeight)
        {
            var image = new BitmapImage();
            image.BeginInit();

            // Handle both file paths and pack URIs
            if (imagePath.StartsWith("pack://"))
            {
                image.UriSource = new Uri(imagePath, UriKind.Absolute);
            }
            else if (Uri.TryCreate(imagePath, UriKind.Absolute, out var uri))
            {
                image.UriSource = uri;
            }
            else if (File.Exists(imagePath))
            {
                image.UriSource = new Uri(Path.GetFullPath(imagePath), UriKind.Absolute);
            }
            else
            {
                throw new FileNotFoundException($"Image not found: {imagePath}");
            }

            // Apply optimizations
            if (maxWidth.HasValue)
                image.DecodePixelWidth = maxWidth.Value;

            if (maxHeight.HasValue)
                image.DecodePixelHeight = maxHeight.Value;

            // Performance optimizations
            image.CacheOption = BitmapCacheOption.OnLoad;
            image.CreateOptions = BitmapCreateOptions.IgnoreColorProfile;

            image.EndInit();

            // Freeze for better performance
            if (image.CanFreeze)
            {
                image.Freeze();
            }

            return image;
        }

        private bool TryGetFromCache(string cacheKey, out BitmapImage image)
        {
            image = null;
            
            if (!_imageCache.TryGetValue(cacheKey, out var weakRef))
                return false;

            return weakRef.TryGetTarget(out image);
        }

        private void CacheImage(string cacheKey, BitmapImage image)
        {
            if (image == null) return;

            lock (_cacheLock)
            {
                // Check cache size limit
                var imageSize = EstimateImageMemoryUsage(image);
                
                if (_totalMemoryUsage + imageSize > MAX_CACHE_SIZE_MB * 1024 * 1024)
                {
                    CleanupCache();
                    
                    // If still over limit after cleanup, don't cache
                    if (_totalMemoryUsage + imageSize > MAX_CACHE_SIZE_MB * 1024 * 1024)
                    {
                        return;
                    }
                }

                _imageCache[cacheKey] = new WeakReference<BitmapImage>(image);
                _totalMemoryUsage += imageSize;
            }
        }

        private void CleanupCache()
        {
            lock (_cacheLock)
            {
                var keysToRemove = new List<string>();
                var newTotalSize = 0L;

                foreach (var kvp in _imageCache)
                {
                    if (!kvp.Value.TryGetTarget(out var image))
                    {
                        keysToRemove.Add(kvp.Key);
                    }
                    else
                    {
                        newTotalSize += EstimateImageMemoryUsage(image);
                    }
                }

                foreach (var key in keysToRemove)
                {
                    _imageCache.TryRemove(key, out _);
                }

                _totalMemoryUsage = newTotalSize;

                Debug.WriteLine($"Image cache cleanup: Removed {keysToRemove.Count} dead references. " +
                               $"Active images: {_imageCache.Count}, Memory: {_totalMemoryUsage / (1024 * 1024)}MB");
            }
        }

        private static long EstimateImageMemoryUsage(BitmapImage image)
        {
            if (image?.PixelWidth > 0 && image?.PixelHeight > 0)
            {
                // Estimate 4 bytes per pixel (RGBA)
                return image.PixelWidth * image.PixelHeight * 4L;
            }
            return 1024; // Default estimate
        }

        private static string GenerateCacheKey(string imagePath, int? maxWidth, int? maxHeight)
        {
            return $"{imagePath}|{maxWidth}|{maxHeight}";
        }

        #endregion

        public void Dispose()
        {
            _cleanupTimer?.Stop();
            ClearCache();
        }
    }

    /// <summary>
    /// Statistics about the image cache performance
    /// </summary>
    public class ImageCacheStats
    {
        public int TotalCachedImages { get; set; }
        public int AliveImages { get; set; }
        public long EstimatedMemoryUsageMB { get; set; }
        public long MaxCacheSizeMB { get; set; }
        public double CacheEfficiency { get; set; }

        public override string ToString()
        {
            return $"Images: {AliveImages}/{TotalCachedImages}, Memory: {EstimatedMemoryUsageMB}MB/{MaxCacheSizeMB}MB, " +
                   $"Efficiency: {CacheEfficiency:F1}%";
        }
    }

    /// <summary>
    /// Extension methods for image optimization
    /// </summary>
    public static class ImageOptimizationExtensions
    {
        /// <summary>
        /// Optimizes a BitmapImage for better performance
        /// </summary>
        public static BitmapImage Optimize(this BitmapImage image, int? maxWidth = null, int? maxHeight = null)
        {
            var service = ServiceLocator.GetService<ImageOptimizationService>();
            return service?.OptimizeExistingImage(image, maxWidth, maxHeight) ?? image;
        }

        /// <summary>
        /// Freezes an image for better performance
        /// </summary>
        public static T FreezeIfPossible<T>(this T freezable) where T : Freezable
        {
            if (freezable?.CanFreeze == true)
            {
                freezable.Freeze();
            }
            return freezable;
        }
    }
}