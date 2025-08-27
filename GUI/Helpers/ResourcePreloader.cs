using System;
using System.Collections.Generic;
using System.Windows;
using System.Windows.Threading;
using System.Diagnostics;

namespace MandADiscoverySuite.Helpers
{
    /// <summary>
    /// Helper class for optimized resource preloading during startup
    /// </summary>
    public static class ResourcePreloader
    {
        private static readonly HashSet<string> _preloadedResources = new();
        private static bool _isPreloading = false;

        /// <summary>
        /// Preloads critical resource dictionaries during startup
        /// </summary>
        public static void PreloadCriticalResources()
        {
            if (_isPreloading) return;
            _isPreloading = true;

            try
            {
                // List of critical resource dictionaries to preload
                var criticalResources = new[]
                {
                    "/Themes/SpacingSystem.xaml",
                    "/Themes/CustomTooltips.xaml"
                };

                Application.Current.Dispatcher.BeginInvoke(DispatcherPriority.Background, new Action(() =>
                {
                    foreach (var resourcePath in criticalResources)
                    {
                        PreloadResourceDictionary(resourcePath);
                    }
                }));
            }
            catch (Exception ex)
            {
                Debug.WriteLine($"Resource preloading error: {ex.Message}");
            }
            finally
            {
                _isPreloading = false;
            }
        }

        /// <summary>
        /// Preloads a specific resource dictionary
        /// </summary>
        public static void PreloadResourceDictionary(string resourcePath)
        {
            try
            {
                if (_preloadedResources.Contains(resourcePath))
                    return;

                var uri = new Uri(resourcePath, UriKind.Relative);
                var resourceDictionary = Application.LoadComponent(uri) as ResourceDictionary;
                
                if (resourceDictionary != null)
                {
                    // Add to application resources if not already present
                    if (!Application.Current.Resources.MergedDictionaries.Contains(resourceDictionary))
                    {
                        Application.Current.Resources.MergedDictionaries.Add(resourceDictionary);
                    }
                    
                    _preloadedResources.Add(resourcePath);
                    Debug.WriteLine($"Preloaded resource: {resourcePath}");
                }
            }
            catch (Exception ex)
            {
                Debug.WriteLine($"Failed to preload resource {resourcePath}: {ex.Message}");
            }
        }

        /// <summary>
        /// Optimizes resource loading by forcing JIT compilation of resource-related code
        /// </summary>
        public static void WarmupResourceSystem()
        {
            try
            {
                Application.Current.Dispatcher.BeginInvoke(DispatcherPriority.Background, new Action(() =>
                {
                    // Create dummy resources to warm up the resource system
                    var dummyDict = new ResourceDictionary();
                    
                    // Add some dummy resources to trigger JIT compilation
                    dummyDict["DummyBrush"] = System.Windows.Media.Brushes.Transparent;
                    dummyDict["DummyStyle"] = new Style();
                    
                    // Access the resources to trigger loading
                    var _ = dummyDict["DummyBrush"];
                    var __ = dummyDict["DummyStyle"];
                    
                    // Clean up
                    dummyDict.Clear();
                }));
            }
            catch (Exception ex)
            {
                Debug.WriteLine($"Resource warmup error: {ex.Message}");
            }
        }

        /// <summary>
        /// Gets the count of preloaded resources
        /// </summary>
        public static int GetPreloadedResourceCount()
        {
            return _preloadedResources.Count;
        }

        /// <summary>
        /// Clears the preloaded resource cache
        /// </summary>
        public static void ClearCache()
        {
            _preloadedResources.Clear();
            _isPreloading = false;
        }
    }
}