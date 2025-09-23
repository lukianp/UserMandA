using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Reflection;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Data;
using System.Windows.Media;
using System.Windows.Threading;

namespace MandADiscoverySuite.Helpers
{
    /// <summary>
    /// Helper class for optimizing data binding performance
    /// </summary>
    public static class BindingOptimizationHelper
    {
        private static readonly Dictionary<Type, PropertyInfo[]> _propertyCache = new Dictionary<Type, PropertyInfo[]>();
        private static readonly Dictionary<string, WeakReference> _bindingCache = new Dictionary<string, WeakReference>();

        /// <summary>
        /// Creates an optimized binding with performance enhancements
        /// </summary>
        /// <param name="source">Source object</param>
        /// <param name="sourcePath">Source property path</param>
        /// <param name="target">Target dependency object</param>
        /// <param name="targetProperty">Target dependency property</param>
        /// <param name="mode">Binding mode</param>
        /// <param name="converter">Value converter</param>
        /// <param name="updateSourceTrigger">Update source trigger</param>
        public static void CreateOptimizedBinding(
            object source,
            string sourcePath,
            DependencyObject target,
            DependencyProperty targetProperty,
            BindingMode mode = BindingMode.OneWay,
            IValueConverter? converter = null,
            UpdateSourceTrigger updateSourceTrigger = UpdateSourceTrigger.PropertyChanged)
        {
            var binding = new Binding(sourcePath)
            {
                Source = source,
                Mode = mode,
                UpdateSourceTrigger = updateSourceTrigger,
                NotifyOnSourceUpdated = false,
                NotifyOnTargetUpdated = false
            };

            if (converter != null)
            {
                binding.Converter = converter;
            }

            // Performance optimizations
            binding.IsAsync = false; // Synchronous binding for better performance
            binding.ValidatesOnDataErrors = false; // Disable validation if not needed
            binding.ValidatesOnExceptions = false;

            BindingOperations.SetBinding(target, targetProperty, binding);
        }

        /// <summary>
        /// Creates a cached binding that reuses binding objects
        /// </summary>
        /// <param name="cacheKey">Unique cache key</param>
        /// <param name="bindingFactory">Factory function to create binding</param>
        /// <param name="target">Target dependency object</param>
        /// <param name="targetProperty">Target dependency property</param>
        public static void CreateCachedBinding(
            string cacheKey,
            Func<Binding> bindingFactory,
            DependencyObject target,
            DependencyProperty targetProperty)
        {
            Binding binding = null;

            if (_bindingCache.TryGetValue(cacheKey, out var weakRef) && weakRef.IsAlive)
            {
                binding = weakRef.Target as Binding;
            }

            if (binding == null)
            {
                binding = bindingFactory();
                _bindingCache[cacheKey] = new WeakReference(binding);
            }

            BindingOperations.SetBinding(target, targetProperty, binding);
        }

        /// <summary>
        /// Gets cached property information for a type
        /// </summary>
        /// <param name="type">Type to get properties for</param>
        /// <returns>Array of property info</returns>
        public static PropertyInfo[] GetCachedProperties(Type type)
        {
            if (!_propertyCache.TryGetValue(type, out var properties))
            {
                properties = type.GetProperties(BindingFlags.Public | BindingFlags.Instance);
                _propertyCache[type] = properties;
            }

            return properties;
        }

        /// <summary>
        /// Creates a high-performance one-way binding for display purposes
        /// </summary>
        /// <param name="source">Source object</param>
        /// <param name="sourcePath">Source property path</param>
        /// <param name="target">Target dependency object</param>
        /// <param name="targetProperty">Target dependency property</param>
        /// <param name="converter">Optional value converter</param>
        public static void CreateDisplayBinding(
            object source,
            string sourcePath,
            DependencyObject target,
            DependencyProperty targetProperty,
            IValueConverter? converter = null)
        {
            var binding = new Binding(sourcePath)
            {
                Source = source,
                Mode = BindingMode.OneWay,
                UpdateSourceTrigger = UpdateSourceTrigger.PropertyChanged,
                NotifyOnSourceUpdated = false,
                NotifyOnTargetUpdated = false,
                IsAsync = false,
                ValidatesOnDataErrors = false,
                ValidatesOnExceptions = false
            };

            if (converter != null)
            {
                binding.Converter = converter;
            }

            BindingOperations.SetBinding(target, targetProperty, binding);
        }

        /// <summary>
        /// Creates a debounced binding that reduces update frequency
        /// </summary>
        /// <param name="source">Source object</param>
        /// <param name="sourcePath">Source property path</param>
        /// <param name="target">Target dependency object</param>
        /// <param name="targetProperty">Target dependency property</param>
        /// <param name="debounceDelay">Debounce delay in milliseconds</param>
        public static void CreateDebouncedBinding(
            object source,
            string sourcePath,
            DependencyObject target,
            DependencyProperty targetProperty,
            int debounceDelay = 300)
        {
            var debouncedConverter = new DebouncedValueConverter(debounceDelay);
            
            var binding = new Binding(sourcePath)
            {
                Source = source,
                Mode = BindingMode.TwoWay,
                UpdateSourceTrigger = UpdateSourceTrigger.PropertyChanged,
                Converter = debouncedConverter
            };

            BindingOperations.SetBinding(target, targetProperty, binding);
        }

        /// <summary>
        /// Clears binding caches to free memory
        /// </summary>
        public static void ClearCaches()
        {
            _propertyCache.Clear();
            
            // Clean up weak references
            var keysToRemove = new List<string>();
            foreach (var kvp in _bindingCache)
            {
                if (!kvp.Value.IsAlive)
                {
                    keysToRemove.Add(kvp.Key);
                }
            }

            foreach (var key in keysToRemove)
            {
                _bindingCache.Remove(key);
            }
        }

        /// <summary>
        /// Optimizes bindings for a container and its children
        /// </summary>
        /// <param name="container">Container to optimize</param>
        public static void OptimizeContainerBindings(DependencyObject container)
        {
            if (container == null) return;

            // Disable binding validation for better performance
            Validation.SetErrorTemplate(container, null);

            // Recursively optimize child elements
            var childCount = VisualTreeHelper.GetChildrenCount(container);
            for (int i = 0; i < childCount; i++)
            {
                var child = VisualTreeHelper.GetChild(container, i);
                OptimizeContainerBindings(child);
            }
        }
    }

    /// <summary>
    /// Value converter that debounces value changes
    /// </summary>
    internal class DebouncedValueConverter : IValueConverter
    {
        private readonly int _debounceDelay;
        private readonly DispatcherTimer _timer;
        private object _pendingValue;
        private Action<object> _updateAction;

        public DebouncedValueConverter(int debounceDelay)
        {
            _debounceDelay = debounceDelay;
            _timer = new DispatcherTimer
            {
                Interval = TimeSpan.FromMilliseconds(debounceDelay)
            };
            _timer.Tick += Timer_Tick;
        }

        public object Convert(object value, Type targetType, object parameter, System.Globalization.CultureInfo culture)
        {
            return value; // Pass through for display
        }

        public object ConvertBack(object value, Type targetType, object parameter, System.Globalization.CultureInfo culture)
        {
            // Debounce the conversion back
            _pendingValue = value;
            _timer.Stop();
            _timer.Start();
            
            return Binding.DoNothing; // Don't update immediately
        }

        private void Timer_Tick(object sender, EventArgs e)
        {
            _timer.Stop();
            _updateAction?.Invoke(_pendingValue);
        }

        public void SetUpdateAction(Action<object> updateAction)
        {
            _updateAction = updateAction;
        }
    }
}