using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Markup;
using System.Xml;
using System.Windows.Threading;
using System.Xaml;

namespace MandADiscoverySuite.Services
{
    /// <summary>
    /// Service for optimizing XAML parsing and reducing load times
    /// </summary>
    public class XamlOptimizationService
    {
        private readonly Dictionary<string, object> _precompiledXamlCache;
        private readonly Dictionary<Type, ControlTemplate> _templateCache;
        private readonly Dictionary<string, ResourceDictionary> _resourceCache;

        public XamlOptimizationService()
        {
            _precompiledXamlCache = new Dictionary<string, object>();
            _templateCache = new Dictionary<Type, ControlTemplate>();
            _resourceCache = new Dictionary<string, ResourceDictionary>();
            InitializePrecompiledResources();
        }

        /// <summary>
        /// Loads and caches a ResourceDictionary with optimization
        /// </summary>
        public ResourceDictionary LoadOptimizedResourceDictionary(string resourcePath)
        {
            if (_resourceCache.TryGetValue(resourcePath, out var cached))
                return cached;

            try
            {
                // Load with optimized settings
                var uri = new Uri(resourcePath, UriKind.RelativeOrAbsolute);
                var resourceDict = new ResourceDictionary { Source = uri };
                
                // Optimize the resource dictionary
                OptimizeResourceDictionary(resourceDict);
                
                _resourceCache[resourcePath] = resourceDict;
                return resourceDict;
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Failed to load resource dictionary {resourcePath}: {ex.Message}");
                return new ResourceDictionary();
            }
        }

        /// <summary>
        /// Pre-loads critical resources to reduce startup time
        /// </summary>
        public void PreloadCriticalResources()
        {
            // Load resources in background thread
            Application.Current.Dispatcher.InvokeAsync(() =>
            {
                var criticalResources = new[]
                {
                    "pack://application:,,,/GUI/Themes/Light.xaml",
                    "pack://application:,,,/GUI/Themes/Dark.xaml",
                    "pack://application:,,,/GUI/Styles/ButtonStyles.xaml",
                    "pack://application:,,,/GUI/Styles/TextBoxStyles.xaml",
                    "pack://application:,,,/GUI/Templates/LightweightControlTemplates.xaml"
                };

                foreach (var resource in criticalResources)
                {
                    try
                    {
                        LoadOptimizedResourceDictionary(resource);
                    }
                    catch (Exception ex)
                    {
                        System.Diagnostics.Debug.WriteLine($"Failed to preload resource {resource}: {ex.Message}");
                    }
                }
            }, DispatcherPriority.ApplicationIdle);
        }

        /// <summary>
        /// Optimizes a FrameworkElement by caching its template
        /// </summary>
        public void OptimizeElementTemplate<T>(T element) where T : FrameworkElement
        {
            if (element == null) return;

            var elementType = typeof(T);
            
            // Cache control templates for reuse
            if (element is Control control && control.Template != null)
            {
                if (!_templateCache.ContainsKey(elementType))
                {
                    _templateCache[elementType] = control.Template;
                }
                else
                {
                    // Reuse cached template
                    control.Template = _templateCache[elementType];
                }
            }
        }

        /// <summary>
        /// Reduces resource dictionary overhead by freezing unchanging resources
        /// </summary>
        public void OptimizeResourceDictionary(ResourceDictionary resourceDict)
        {
            if (resourceDict == null) return;

            var resourcesToFreeze = new List<object>();
            
            foreach (var key in resourceDict.Keys)
            {
                var resource = resourceDict[key];
                
                // Freeze brushes and other Freezable objects
                if (resource is Freezable freezable && freezable.CanFreeze && !freezable.IsFrozen)
                {
                    resourcesToFreeze.Add(freezable);
                }
            }
            
            // Freeze resources to improve performance
            foreach (Freezable resource in resourcesToFreeze)
            {
                try
                {
                    resource.Freeze();
                }
                catch (Exception ex)
                {
                    System.Diagnostics.Debug.WriteLine($"Failed to freeze resource: {ex.Message}");
                }
            }
        }

        /// <summary>
        /// Creates a minimal XAML loader for faster parsing
        /// </summary>
        public T LoadXamlOptimized<T>(string xamlContent) where T : class
        {
            try
            {
                using (var stream = new System.IO.MemoryStream(System.Text.Encoding.UTF8.GetBytes(xamlContent)))
                {
                    return System.Windows.Markup.XamlReader.Load(stream) as T;
                }
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Failed to load XAML: {ex.Message}");
                return null;
            }
        }

        /// <summary>
        /// Creates optimized UserControls with minimal XAML
        /// </summary>
        public UserControl CreateOptimizedUserControl(string controlName)
        {
            // Check cache first
            if (_precompiledXamlCache.TryGetValue(controlName, out var cached))
            {
                if (cached is UserControl cachedControl)
                    return cachedControl;
            }

            // Create minimal UserControl programmatically
            var userControl = new UserControl
            {
                Background = null, // Use inherited background
                BorderThickness = new Thickness(0),
                Focusable = false,
                IsHitTestVisible = true,
                SnapsToDevicePixels = true
            };

            _precompiledXamlCache[controlName] = userControl;
            return userControl;
        }

        /// <summary>
        /// Optimizes data templates by reducing visual tree complexity
        /// </summary>
        public DataTemplate CreateOptimizedDataTemplate<TDataType>()
        {
            var template = new DataTemplate(typeof(TDataType));
            
            // Create simplified visual tree
            var factory = new FrameworkElementFactory(typeof(Border));
            factory.SetValue(Border.BackgroundProperty, System.Windows.Media.Brushes.Transparent);
            factory.SetValue(Border.BorderThicknessProperty, new Thickness(0));
            factory.SetValue(Border.SnapsToDevicePixelsProperty, true);
            
            // Add content presenter
            var contentFactory = new FrameworkElementFactory(typeof(ContentPresenter));
            contentFactory.SetValue(ContentPresenter.HorizontalAlignmentProperty, HorizontalAlignment.Stretch);
            contentFactory.SetValue(ContentPresenter.VerticalAlignmentProperty, VerticalAlignment.Center);
            
            factory.AppendChild(contentFactory);
            template.VisualTree = factory;
            
            return template;
        }

        /// <summary>
        /// Creates batch resource loading operations
        /// </summary>
        public void LoadResourcesBatch(IEnumerable<string> resourcePaths)
        {
            var loadTasks = resourcePaths.Select(path => 
                Application.Current.Dispatcher.InvokeAsync(() => 
                    LoadOptimizedResourceDictionary(path), 
                    DispatcherPriority.Background));
            
            // Wait for all resources to load (non-blocking)
            Application.Current.Dispatcher.InvokeAsync(async () =>
            {
                await System.Threading.Tasks.Task.WhenAll(loadTasks.Select(t => t.Task));
                OnBatchResourcesLoaded();
            }, DispatcherPriority.ApplicationIdle);
        }

        /// <summary>
        /// Clears cached resources to free memory
        /// </summary>
        public void ClearResourceCache()
        {
            _precompiledXamlCache.Clear();
            _templateCache.Clear();
            
            // Clear resource cache but keep critical resources
            var criticalKeys = _resourceCache.Keys.Where(k => 
                k.Contains("Light.xaml") || 
                k.Contains("Dark.xaml") || 
                k.Contains("ButtonStyles.xaml")).ToList();
            
            var criticalResources = criticalKeys.ToDictionary(k => k, k => _resourceCache[k]);
            
            _resourceCache.Clear();
            
            foreach (var kvp in criticalResources)
            {
                _resourceCache[kvp.Key] = kvp.Value;
            }
        }

        /// <summary>
        /// Gets optimization statistics
        /// </summary>
        public XamlOptimizationStats GetOptimizationStats()
        {
            return new XamlOptimizationStats
            {
                CachedXamlCount = _precompiledXamlCache.Count,
                CachedTemplateCount = _templateCache.Count,
                CachedResourceDictionaries = _resourceCache.Count,
                MemoryUsageEstimate = EstimateMemoryUsage()
            };
        }

        #region Private Methods


        private XmlReaderSettings CreateOptimizedXmlReaderSettings()
        {
            return new XmlReaderSettings
            {
                CloseInput = true,
                IgnoreComments = true,
                IgnoreProcessingInstructions = true,
                IgnoreWhitespace = true,
                DtdProcessing = DtdProcessing.Prohibit,
                XmlResolver = null
            };
        }

        private void InitializePrecompiledResources()
        {
            // Pre-compile common simple controls
            var commonControls = new[]
            {
                "EmptyStateView",
                "LoadingIndicator", 
                "StatusIndicator",
                "ProgressBar"
            };

            foreach (var control in commonControls)
            {
                try
                {
                    CreateOptimizedUserControl(control);
                }
                catch (Exception ex)
                {
                    System.Diagnostics.Debug.WriteLine($"Failed to precompile {control}: {ex.Message}");
                }
            }
        }

        private void OnBatchResourcesLoaded()
        {
            // Optimize loaded resources
            foreach (var resourceDict in _resourceCache.Values)
            {
                OptimizeResourceDictionary(resourceDict);
            }
            
            System.Diagnostics.Debug.WriteLine($"Batch loaded {_resourceCache.Count} resource dictionaries");
        }

        private long EstimateMemoryUsage()
        {
            // Rough estimation of cache memory usage
            long estimate = 0;
            
            estimate += _precompiledXamlCache.Count * 1024; // ~1KB per cached XAML
            estimate += _templateCache.Count * 2048; // ~2KB per template
            estimate += _resourceCache.Count * 4096; // ~4KB per resource dictionary
            
            return estimate;
        }

        #endregion

        #region Static Helper Methods

        /// <summary>
        /// Creates a minimal style for a control type
        /// </summary>
        public static Style CreateMinimalStyle<T>() where T : Control
        {
            var style = new Style(typeof(T));
            
            // Set only essential properties
            style.Setters.Add(new Setter(Control.BackgroundProperty, System.Windows.Media.Brushes.Transparent));
            style.Setters.Add(new Setter(Control.BorderThicknessProperty, new Thickness(0)));
            style.Setters.Add(new Setter(Control.PaddingProperty, new Thickness(4)));
            style.Setters.Add(new Setter(Control.FocusVisualStyleProperty, null));
            style.Setters.Add(new Setter(Control.SnapsToDevicePixelsProperty, true));
            
            return style;
        }

        /// <summary>
        /// Reduces XAML complexity by removing unnecessary attributes
        /// </summary>
        public static string OptimizeXamlString(string xaml)
        {
            if (string.IsNullOrEmpty(xaml)) return xaml;
            
            // Remove common unnecessary attributes for performance
            var optimizations = new Dictionary<string, string>
            {
                { " mc:Ignorable=\"d\"", "" },
                { " d:DesignHeight=\"[^\"]*\"", "" },
                { " d:DesignWidth=\"[^\"]*\"", "" },
                { " xmlns:d=\"http://schemas.microsoft.com/expression/blend/2008\"", "" },
                { " xmlns:mc=\"http://schemas.openxmlformats.org/markup-compatibility/2006\"", "" },
                { "\\s+", " " } // Collapse whitespace
            };
            
            foreach (var optimization in optimizations)
            {
                xaml = System.Text.RegularExpressions.Regex.Replace(xaml, optimization.Key, optimization.Value);
            }
            
            return xaml.Trim();
        }

        #endregion
    }

    /// <summary>
    /// Statistics for XAML optimization performance
    /// </summary>
    public class XamlOptimizationStats
    {
        public int CachedXamlCount { get; set; }
        public int CachedTemplateCount { get; set; }
        public int CachedResourceDictionaries { get; set; }
        public long MemoryUsageEstimate { get; set; }

        public override string ToString()
        {
            return $"XAML Cache: {CachedXamlCount}, Templates: {CachedTemplateCount}, " +
                   $"Resources: {CachedResourceDictionaries}, Memory: {MemoryUsageEstimate / 1024}KB";
        }
    }
}