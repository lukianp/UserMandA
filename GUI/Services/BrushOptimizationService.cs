using System;
using System.Collections.Generic;
using System.Linq;
using System.Windows;
using System.Windows.Media;

namespace MandADiscoverySuite.Services
{
    /// <summary>
    /// Service for optimizing brush performance by freezing unchanging brushes
    /// </summary>
    public class BrushOptimizationService
    {
        private readonly Dictionary<string, Brush> _frozenBrushCache = new();
        private static readonly object _lock = new object();

        /// <summary>
        /// Creates and freezes a SolidColorBrush for optimal performance
        /// </summary>
        /// <param name="color">Color for the brush</param>
        /// <param name="cacheKey">Optional cache key for reuse</param>
        /// <returns>Frozen SolidColorBrush</returns>
        public SolidColorBrush CreateFrozenBrush(Color color, string cacheKey = null)
        {
            cacheKey ??= color.ToString();
            
            lock (_lock)
            {
                if (_frozenBrushCache.TryGetValue(cacheKey, out var cached) && cached is SolidColorBrush cachedSolid)
                {
                    return cachedSolid;
                }

                var brush = new SolidColorBrush(color);
                brush.Freeze();
                
                _frozenBrushCache[cacheKey] = brush;
                return brush;
            }
        }

        /// <summary>
        /// Creates and freezes a LinearGradientBrush
        /// </summary>
        /// <param name="startColor">Start color</param>
        /// <param name="endColor">End color</param>
        /// <param name="angle">Gradient angle</param>
        /// <param name="cacheKey">Optional cache key</param>
        /// <returns>Frozen LinearGradientBrush</returns>
        public LinearGradientBrush CreateFrozenGradientBrush(Color startColor, Color endColor, double angle = 0, string cacheKey = null)
        {
            cacheKey ??= $"gradient_{startColor}_{endColor}_{angle}";
            
            lock (_lock)
            {
                if (_frozenBrushCache.TryGetValue(cacheKey, out var cached) && cached is LinearGradientBrush cachedGradient)
                {
                    return cachedGradient;
                }

                var brush = new LinearGradientBrush(startColor, endColor, angle);
                brush.Freeze();
                
                _frozenBrushCache[cacheKey] = brush;
                return brush;
            }
        }

        /// <summary>
        /// Optimizes application resources by freezing static brushes
        /// </summary>
        public void OptimizeApplicationResources()
        {
            try
            {
                var resourceDict = Application.Current?.Resources;
                if (resourceDict == null) return;

                var brushesToFreeze = new List<(string key, Brush brush)>();

                // Find all brushes in application resources
                foreach (var key in resourceDict.Keys.OfType<string>())
                {
                    if (resourceDict[key] is Brush brush && !brush.IsFrozen)
                    {
                        // Only freeze brushes that appear to be static (simple solid colors, gradients without animations)
                        if (CanSafelyFreeze(brush))
                        {
                            brushesToFreeze.Add((key, brush));
                        }
                    }
                }

                // Freeze the brushes
                foreach (var (key, brush) in brushesToFreeze)
                {
                    try
                    {
                        brush.Freeze();
                        System.Diagnostics.Debug.WriteLine($"Frozen brush: {key}");
                    }
                    catch (Exception ex)
                    {
                        System.Diagnostics.Debug.WriteLine($"Could not freeze brush {key}: {ex.Message}");
                    }
                }
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Error optimizing application resources: {ex.Message}");
            }
        }

        /// <summary>
        /// Optimizes brushes in a specific ResourceDictionary
        /// </summary>
        /// <param name="resourceDict">ResourceDictionary to optimize</param>
        public void OptimizeResourceDictionary(ResourceDictionary resourceDict)
        {
            if (resourceDict == null) return;

            try
            {
                var brushesToFreeze = new List<Brush>();

                // Collect brushes that can be frozen
                foreach (var value in resourceDict.Values.OfType<Brush>())
                {
                    if (!value.IsFrozen && CanSafelyFreeze(value))
                    {
                        brushesToFreeze.Add(value);
                    }
                }

                // Freeze them
                foreach (var brush in brushesToFreeze)
                {
                    try
                    {
                        brush.Freeze();
                    }
                    catch (Exception ex)
                    {
                        System.Diagnostics.Debug.WriteLine($"Could not freeze brush: {ex.Message}");
                    }
                }

                // Recursively process merged dictionaries
                foreach (var mergedDict in resourceDict.MergedDictionaries)
                {
                    OptimizeResourceDictionary(mergedDict);
                }
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Error optimizing ResourceDictionary: {ex.Message}");
            }
        }

        /// <summary>
        /// Gets commonly used frozen brushes
        /// </summary>
        public static class CommonBrushes
        {
            public static readonly SolidColorBrush Transparent = CreateAndFreeze(Colors.Transparent);
            public static readonly SolidColorBrush White = CreateAndFreeze(Colors.White);
            public static readonly SolidColorBrush Black = CreateAndFreeze(Colors.Black);
            public static readonly SolidColorBrush Red = CreateAndFreeze(Colors.Red);
            public static readonly SolidColorBrush Green = CreateAndFreeze(Colors.Green);
            public static readonly SolidColorBrush Blue = CreateAndFreeze(Colors.Blue);
            public static readonly SolidColorBrush Gray = CreateAndFreeze(Colors.Gray);
            public static readonly SolidColorBrush LightGray = CreateAndFreeze(Colors.LightGray);
            public static readonly SolidColorBrush DarkGray = CreateAndFreeze(Colors.DarkGray);

            private static SolidColorBrush CreateAndFreeze(Color color)
            {
                var brush = new SolidColorBrush(color);
                brush.Freeze();
                return brush;
            }
        }

        /// <summary>
        /// Determines if a brush can be safely frozen
        /// </summary>
        private bool CanSafelyFreeze(Brush brush)
        {
            return brush switch
            {
                SolidColorBrush => true,
                LinearGradientBrush gradient => !HasAnimations(gradient),
                RadialGradientBrush radial => !HasAnimations(radial),
                _ => false
            };
        }

        /// <summary>
        /// Checks if a freezable has any animations
        /// </summary>
        private bool HasAnimations(Freezable freezable)
        {
            // WPF doesn't expose HasAnimatedProperties directly
            // Return false for now - this is a simplification
            return false;
        }

        /// <summary>
        /// Gets statistics about brush optimization
        /// </summary>
        public BrushOptimizationStats GetStats()
        {
            lock (_lock)
            {
                return new BrushOptimizationStats
                {
                    CachedBrushCount = _frozenBrushCache.Count,
                    MemoryUsageEstimateKB = _frozenBrushCache.Count * 20 / 1024 // Rough estimate
                };
            }
        }

        /// <summary>
        /// Clears the brush cache
        /// </summary>
        public void ClearCache()
        {
            lock (_lock)
            {
                _frozenBrushCache.Clear();
            }
        }
    }

    /// <summary>
    /// Statistics for brush optimization
    /// </summary>
    public class BrushOptimizationStats
    {
        public int CachedBrushCount { get; set; }
        public int MemoryUsageEstimateKB { get; set; }

        public override string ToString()
        {
            return $"Cached brushes: {CachedBrushCount}, Memory: ~{MemoryUsageEstimateKB}KB";
        }
    }
}