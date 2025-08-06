using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using System.Windows;
using System.Windows.Controls;

namespace MandADiscoverySuite.Services
{
    /// <summary>
    /// Service for deferring view loading until they become visible
    /// </summary>
    public class LazyViewLoadingService
    {
        private readonly Dictionary<string, bool> _viewInitialized = new();
        private readonly Dictionary<string, Func<Task>> _viewInitializers = new();
        private readonly Dictionary<string, WeakReference<FrameworkElement>> _viewElements = new();

        /// <summary>
        /// Registers a view for lazy loading
        /// </summary>
        /// <param name="viewName">Name of the view</param>
        /// <param name="viewElement">The view element</param>
        /// <param name="initializer">Function to initialize the view when first shown</param>
        public void RegisterView(string viewName, FrameworkElement viewElement, Func<Task> initializer = null)
        {
            _viewInitialized[viewName] = false;
            _viewElements[viewName] = new WeakReference<FrameworkElement>(viewElement);
            
            if (initializer != null)
            {
                _viewInitializers[viewName] = initializer;
            }

            // Subscribe to visibility changes
            viewElement.IsVisibleChanged += async (s, e) =>
            {
                if ((bool)e.NewValue && !_viewInitialized[viewName])
                {
                    await InitializeViewAsync(viewName);
                }
            };
        }

        /// <summary>
        /// Checks if a view has been initialized
        /// </summary>
        public bool IsViewInitialized(string viewName)
        {
            return _viewInitialized.TryGetValue(viewName, out var initialized) && initialized;
        }

        /// <summary>
        /// Forces initialization of a view
        /// </summary>
        public async Task InitializeViewAsync(string viewName)
        {
            if (_viewInitialized.TryGetValue(viewName, out var initialized) && initialized)
                return;

            try
            {
                // Run the initializer if one exists
                if (_viewInitializers.TryGetValue(viewName, out var initializer))
                {
                    await initializer();
                }

                // Mark as initialized
                _viewInitialized[viewName] = true;

                // Enable hit testing on the view element
                if (_viewElements.TryGetValue(viewName, out var weakRef) && 
                    weakRef.TryGetTarget(out var element))
                {
                    element.IsHitTestVisible = true;
                }
            }
            catch (Exception ex)
            {
                // Log error but don't let it crash the app
                System.Diagnostics.Debug.WriteLine($"Failed to initialize view '{viewName}': {ex.Message}");
            }
        }

        /// <summary>
        /// Sets up a view for deferred loading by initially disabling hit testing
        /// </summary>
        public void SetupDeferredView(string viewName, FrameworkElement viewElement)
        {
            // Disable hit testing initially to save resources
            viewElement.IsHitTestVisible = false;
            
            // Register for lazy loading
            RegisterView(viewName, viewElement);
        }

        /// <summary>
        /// Pre-initializes critical views during idle time
        /// </summary>
        public async Task PreInitializeCriticalViewsAsync(params string[] criticalViews)
        {
            await Task.Run(async () =>
            {
                foreach (var viewName in criticalViews)
                {
                    if (!IsViewInitialized(viewName))
                    {
                        await Application.Current.Dispatcher.InvokeAsync(async () =>
                        {
                            await InitializeViewAsync(viewName);
                        });
                        
                        // Small delay between initializations to avoid blocking UI
                        await Task.Delay(50);
                    }
                }
            });
        }

        /// <summary>
        /// Gets memory usage statistics for loaded views
        /// </summary>
        public ViewLoadingStats GetStats()
        {
            int totalViews = _viewInitialized.Count;
            int loadedViews = 0;
            int activeViews = 0;

            foreach (var kvp in _viewInitialized)
            {
                if (kvp.Value)
                {
                    loadedViews++;
                    
                    // Check if view element is still alive and visible
                    if (_viewElements.TryGetValue(kvp.Key, out var weakRef) &&
                        weakRef.TryGetTarget(out var element) &&
                        element.IsVisible)
                    {
                        activeViews++;
                    }
                }
            }

            return new ViewLoadingStats
            {
                TotalViews = totalViews,
                LoadedViews = loadedViews,
                ActiveViews = activeViews,
                MemorySavingPercentage = totalViews > 0 ? (double)(totalViews - loadedViews) / totalViews * 100 : 0
            };
        }

        /// <summary>
        /// Clears initialization cache to free memory
        /// </summary>
        public void ClearCache()
        {
            _viewInitialized.Clear();
            _viewInitializers.Clear();
            _viewElements.Clear();
        }
    }

    /// <summary>
    /// Statistics about view loading performance
    /// </summary>
    public class ViewLoadingStats
    {
        public int TotalViews { get; set; }
        public int LoadedViews { get; set; }
        public int ActiveViews { get; set; }
        public double MemorySavingPercentage { get; set; }

        public override string ToString()
        {
            return $"Views: {LoadedViews}/{TotalViews} loaded, {ActiveViews} active, {MemorySavingPercentage:F1}% memory saved";
        }
    }
}