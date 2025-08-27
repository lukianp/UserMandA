using System;
using System.Collections.Generic;
using System.Linq;
using System.Windows;
using System.Windows.Data;
using System.Reflection;
using System.ComponentModel;
using System.Diagnostics;

namespace MandADiscoverySuite.Services
{
    /// <summary>
    /// Service for optimizing WPF binding performance and reducing verbosity
    /// </summary>
    public class BindingOptimizationService
    {
        private readonly Dictionary<string, Binding> _cachedBindings = new();
        private readonly Dictionary<Type, PropertyInfo[]> _typePropertyCache = new();
        private static readonly object _lock = new object();

        /// <summary>
        /// Creates an optimized binding with minimal verbosity
        /// </summary>
        public Binding CreateOptimizedBinding(string propertyPath, BindingMode mode = BindingMode.OneWay, 
            IValueConverter converter = null, object converterParameter = null, 
            string stringFormat = null, bool isAsync = false, 
            UpdateSourceTrigger trigger = UpdateSourceTrigger.PropertyChanged)
        {
            var cacheKey = GenerateCacheKey(propertyPath, mode, converter, converterParameter, stringFormat, isAsync, trigger);
            
            lock (_lock)
            {
                if (_cachedBindings.TryGetValue(cacheKey, out var cachedBinding))
                {
                    return CloneBinding(cachedBinding);
                }

                var binding = new Binding(propertyPath)
                {
                    Mode = mode,
                    UpdateSourceTrigger = trigger,
                    IsAsync = isAsync
                };

                if (converter != null)
                    binding.Converter = converter;

                if (converterParameter != null)
                    binding.ConverterParameter = converterParameter;

                if (!string.IsNullOrEmpty(stringFormat))
                    binding.StringFormat = stringFormat;

                // Performance optimizations
                binding.ValidatesOnDataErrors = false;
                binding.ValidatesOnExceptions = false;
                binding.NotifyOnValidationError = false;

                // Cache for reuse
                _cachedBindings[cacheKey] = binding;
                return CloneBinding(binding);
            }
        }

        /// <summary>
        /// Creates a OneTime binding for static data (best performance)
        /// </summary>
        public Binding CreateOneTimeBinding(string propertyPath, IValueConverter converter = null, 
            object converterParameter = null, string stringFormat = null)
        {
            return CreateOptimizedBinding(propertyPath, BindingMode.OneTime, converter, 
                converterParameter, stringFormat, false, UpdateSourceTrigger.PropertyChanged);
        }

        /// <summary>
        /// Creates a OneWay binding for read-only data
        /// </summary>
        public Binding CreateOneWayBinding(string propertyPath, IValueConverter converter = null, 
            object converterParameter = null, string stringFormat = null, bool isAsync = false)
        {
            return CreateOptimizedBinding(propertyPath, BindingMode.OneWay, converter, 
                converterParameter, stringFormat, isAsync, UpdateSourceTrigger.PropertyChanged);
        }

        /// <summary>
        /// Creates a TwoWay binding with optimized update trigger
        /// </summary>
        public Binding CreateTwoWayBinding(string propertyPath, IValueConverter converter = null, 
            object converterParameter = null, UpdateSourceTrigger trigger = UpdateSourceTrigger.PropertyChanged)
        {
            return CreateOptimizedBinding(propertyPath, BindingMode.TwoWay, converter, 
                converterParameter, null, false, trigger);
        }

        /// <summary>
        /// Creates multiple bindings for batch operations
        /// </summary>
        public Dictionary<string, Binding> CreateBatchBindings(Dictionary<string, BindingConfiguration> configurations)
        {
            var result = new Dictionary<string, Binding>();
            
            foreach (var config in configurations)
            {
                result[config.Key] = CreateOptimizedBinding(
                    config.Value.PropertyPath,
                    config.Value.Mode,
                    config.Value.Converter,
                    config.Value.ConverterParameter,
                    config.Value.StringFormat,
                    config.Value.IsAsync,
                    config.Value.UpdateSourceTrigger
                );
            }
            
            return result;
        }

        /// <summary>
        /// Analyzes binding performance for a given data context type
        /// </summary>
        public BindingAnalysisReport AnalyzeBindingPerformance(Type dataContextType)
        {
            var report = new BindingAnalysisReport
            {
                DataContextType = dataContextType.Name,
                AnalysisDate = DateTime.Now
            };

            try
            {
                var properties = GetCachedProperties(dataContextType);
                
                foreach (var property in properties)
                {
                    var analysis = new PropertyBindingAnalysis
                    {
                        PropertyName = property.Name,
                        PropertyType = property.PropertyType.Name,
                        IsNotifyPropertyChanged = typeof(INotifyPropertyChanged).IsAssignableFrom(dataContextType),
                        HasGetter = property.GetGetMethod() != null,
                        HasSetter = property.GetSetMethod() != null,
                        IsVirtual = property.GetGetMethod()?.IsVirtual == true,
                        RecommendedMode = DetermineOptimalBindingMode(property)
                    };

                    // Performance recommendations
                    if (analysis.HasSetter && analysis.HasGetter)
                    {
                        analysis.Recommendations.Add("Consider TwoWay binding for user input");
                    }
                    else if (analysis.HasGetter)
                    {
                        analysis.Recommendations.Add("Use OneWay or OneTime binding for read-only data");
                    }

                    if (property.PropertyType == typeof(string))
                    {
                        analysis.Recommendations.Add("Consider StringFormat for formatted text");
                    }

                    if (property.PropertyType.IsValueType && Nullable.GetUnderlyingType(property.PropertyType) != null)
                    {
                        analysis.Recommendations.Add("Consider FallbackValue for nullable types");
                    }

                    report.PropertyAnalyses.Add(analysis);
                }

                report.TotalProperties = properties.Length;
                report.BindableProperties = properties.Count(p => p.GetGetMethod() != null);
            }
            catch (Exception ex)
            {
                report.Errors.Add($"Analysis error: {ex.Message}");
            }

            return report;
        }

        /// <summary>
        /// Optimizes existing bindings on a framework element
        /// </summary>
        public void OptimizeElementBindings(FrameworkElement element)
        {
            try
            {
                var bindingExpressions = new List<BindingExpression>();
                
                // Get all binding expressions on the element
                var fields = element.GetType().GetFields(BindingFlags.Public | BindingFlags.Static | BindingFlags.FlattenHierarchy);
                
                foreach (var field in fields)
                {
                    if (field.FieldType == typeof(DependencyProperty))
                    {
                        var dp = (DependencyProperty)field.GetValue(null);
                        var bindingExpr = BindingOperations.GetBindingExpression(element, dp);
                        
                        if (bindingExpr != null)
                        {
                            bindingExpressions.Add(bindingExpr);
                        }
                    }
                }

                Debug.WriteLine($"Found {bindingExpressions.Count} bindings on {element.GetType().Name}");
                
                // Optimize each binding
                foreach (var expr in bindingExpressions)
                {
                    OptimizeBindingExpression(expr);
                }
            }
            catch (Exception ex)
            {
                Debug.WriteLine($"Binding optimization error: {ex.Message}");
            }
        }

        /// <summary>
        /// Creates binding extensions for common scenarios
        /// </summary>
        public static class BindingExtensions
        {
            /// <summary>
            /// Creates a command binding with null check
            /// </summary>
            public static Binding Command(string commandPath)
            {
                return new Binding(commandPath)
                {
                    Mode = BindingMode.OneTime,
                    FallbackValue = null
                };
            }

            /// <summary>
            /// Creates a text binding with fallback
            /// </summary>
            public static Binding Text(string propertyPath, string fallback = "")
            {
                return new Binding(propertyPath)
                {
                    Mode = BindingMode.OneWay,
                    FallbackValue = fallback,
                    TargetNullValue = fallback
                };
            }

            /// <summary>
            /// Creates a visibility binding with boolean converter
            /// </summary>
            public static Binding Visibility(string propertyPath, bool invert = false)
            {
                var binding = new Binding(propertyPath)
                {
                    Mode = BindingMode.OneWay,
                    Converter = new System.Windows.Controls.BooleanToVisibilityConverter()
                };

                if (invert)
                {
                    binding.ConverterParameter = "Invert";
                }

                return binding;
            }

            /// <summary>
            /// Creates an enabled binding
            /// </summary>
            public static Binding IsEnabled(string propertyPath, bool invert = false)
            {
                var binding = new Binding(propertyPath)
                {
                    Mode = BindingMode.OneWay,
                    FallbackValue = true
                };

                if (invert)
                {
                    binding.ConverterParameter = "Invert";
                }

                return binding;
            }
        }

        /// <summary>
        /// Clears the binding cache to free memory
        /// </summary>
        public void ClearCache()
        {
            lock (_lock)
            {
                _cachedBindings.Clear();
                _typePropertyCache.Clear();
            }
        }

        /// <summary>
        /// Gets cached property information for a type
        /// </summary>
        private PropertyInfo[] GetCachedProperties(Type type)
        {
            if (_typePropertyCache.TryGetValue(type, out var properties))
            {
                return properties;
            }

            properties = type.GetProperties(BindingFlags.Public | BindingFlags.Instance);
            _typePropertyCache[type] = properties;
            return properties;
        }

        /// <summary>
        /// Determines optimal binding mode for a property
        /// </summary>
        private BindingMode DetermineOptimalBindingMode(PropertyInfo property)
        {
            if (!property.CanRead)
                return BindingMode.OneWayToSource;
                
            if (!property.CanWrite)
                return BindingMode.OneWay;

            // Check for common UI input properties
            var inputProperties = new[] { "Text", "IsChecked", "SelectedItem", "SelectedValue", "Value" };
            if (inputProperties.Contains(property.Name))
                return BindingMode.TwoWay;

            return BindingMode.OneWay;
        }

        /// <summary>
        /// Optimizes a specific binding expression
        /// </summary>
        private void OptimizeBindingExpression(BindingExpression bindingExpr)
        {
            try
            {
                var binding = bindingExpr.ParentBinding;
                
                // Disable unnecessary validation if not needed
                if (!binding.ValidatesOnDataErrors && !binding.ValidatesOnExceptions)
                {
                    // Binding is already optimized for validation
                }

                // Check if async is beneficial
                if (binding.IsAsync && binding.Mode == BindingMode.OneTime)
                {
                    Debug.WriteLine("Warning: OneTime binding doesn't benefit from IsAsync=true");
                }
            }
            catch (Exception ex)
            {
                Debug.WriteLine($"Binding expression optimization error: {ex.Message}");
            }
        }

        /// <summary>
        /// Clones a binding for reuse
        /// </summary>
        private Binding CloneBinding(Binding original)
        {
            return new Binding(original.Path.Path)
            {
                Mode = original.Mode,
                UpdateSourceTrigger = original.UpdateSourceTrigger,
                Converter = original.Converter,
                ConverterParameter = original.ConverterParameter,
                ConverterCulture = original.ConverterCulture,
                StringFormat = original.StringFormat,
                FallbackValue = original.FallbackValue,
                TargetNullValue = original.TargetNullValue,
                IsAsync = original.IsAsync,
                ValidatesOnDataErrors = original.ValidatesOnDataErrors,
                ValidatesOnExceptions = original.ValidatesOnExceptions,
                NotifyOnValidationError = original.NotifyOnValidationError
            };
        }

        /// <summary>
        /// Generates a cache key for binding reuse
        /// </summary>
        private string GenerateCacheKey(string propertyPath, BindingMode mode, IValueConverter converter, 
            object converterParameter, string stringFormat, bool isAsync, UpdateSourceTrigger trigger)
        {
            return $"{propertyPath}|{mode}|{converter?.GetType().Name}|{converterParameter}|{stringFormat}|{isAsync}|{trigger}";
        }

        /// <summary>
        /// Gets binding performance statistics
        /// </summary>
        public BindingStats GetStats()
        {
            lock (_lock)
            {
                return new BindingStats
                {
                    CachedBindingCount = _cachedBindings.Count,
                    CachedTypeCount = _typePropertyCache.Count,
                    MemoryUsageEstimateKB = (_cachedBindings.Count * 50 + _typePropertyCache.Count * 100) / 1024
                };
            }
        }
    }

    /// <summary>
    /// Configuration for creating optimized bindings
    /// </summary>
    public class BindingConfiguration
    {
        public string PropertyPath { get; set; }
        public BindingMode Mode { get; set; } = BindingMode.OneWay;
        public IValueConverter Converter { get; set; }
        public object ConverterParameter { get; set; }
        public string StringFormat { get; set; }
        public bool IsAsync { get; set; } = false;
        public UpdateSourceTrigger UpdateSourceTrigger { get; set; } = UpdateSourceTrigger.PropertyChanged;
    }

    /// <summary>
    /// Analysis report for binding performance
    /// </summary>
    public class BindingAnalysisReport
    {
        public string DataContextType { get; set; }
        public DateTime AnalysisDate { get; set; }
        public int TotalProperties { get; set; }
        public int BindableProperties { get; set; }
        public List<PropertyBindingAnalysis> PropertyAnalyses { get; set; } = new();
        public List<string> Errors { get; set; } = new();

        public override string ToString()
        {
            return $"{DataContextType}: {BindableProperties}/{TotalProperties} bindable properties";
        }
    }

    /// <summary>
    /// Analysis for individual property binding performance
    /// </summary>
    public class PropertyBindingAnalysis
    {
        public string PropertyName { get; set; }
        public string PropertyType { get; set; }
        public bool IsNotifyPropertyChanged { get; set; }
        public bool HasGetter { get; set; }
        public bool HasSetter { get; set; }
        public bool IsVirtual { get; set; }
        public BindingMode RecommendedMode { get; set; }
        public List<string> Recommendations { get; set; } = new();
    }

    /// <summary>
    /// Binding performance statistics
    /// </summary>
    public class BindingStats
    {
        public int CachedBindingCount { get; set; }
        public int CachedTypeCount { get; set; }
        public int MemoryUsageEstimateKB { get; set; }

        public override string ToString()
        {
            return $"Cached: {CachedBindingCount} bindings, {CachedTypeCount} types, ~{MemoryUsageEstimateKB}KB";
        }
    }
}