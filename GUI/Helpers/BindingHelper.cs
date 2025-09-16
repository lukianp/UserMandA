using System;
using System.Windows;
using System.Windows.Data;
using System.Windows.Markup;
using MandADiscoverySuite.Services;

namespace MandADiscoverySuite.Helpers
{
    /// <summary>
    /// Helper class for creating optimized bindings with reduced verbosity
    /// </summary>
    public static class BindingHelper
    {
        private static BindingOptimizationService _bindingService;

        /// <summary>
        /// Initializes the binding helper with the optimization service
        /// </summary>
        public static void Initialize(BindingOptimizationService bindingService)
        {
            _bindingService = bindingService;
        }

        /// <summary>
        /// Creates a simple one-way binding
        /// </summary>
        public static Binding OneWay(string path, IValueConverter? converter = null, string? format = null)
        {
            return _bindingService?.CreateOneWayBinding(path, converter, null, format) 
                ?? new Binding(path) { Mode = BindingMode.OneWay };
        }

        /// <summary>
        /// Creates a one-time binding for static data
        /// </summary>
        public static Binding OneTime(string path, IValueConverter? converter = null)
        {
            return _bindingService?.CreateOneTimeBinding(path, converter) 
                ?? new Binding(path) { Mode = BindingMode.OneTime };
        }

        /// <summary>
        /// Creates a two-way binding for user input
        /// </summary>
        public static Binding TwoWay(string path, UpdateSourceTrigger trigger = UpdateSourceTrigger.PropertyChanged)
        {
            return _bindingService?.CreateTwoWayBinding(path, null, null, trigger) 
                ?? new Binding(path) { Mode = BindingMode.TwoWay, UpdateSourceTrigger = trigger };
        }

        /// <summary>
        /// Creates a visibility binding with boolean converter
        /// </summary>
        public static Binding ToVisibility(string path, bool invert = false)
        {
            var binding = OneWay(path, new System.Windows.Controls.BooleanToVisibilityConverter());
            if (invert)
                binding.ConverterParameter = invert;
            return binding;
        }

        /// <summary>
        /// Creates a command binding
        /// </summary>
        public static Binding Command(string path)
        {
            return OneTime(path);
        }

        /// <summary>
        /// Creates a text binding with fallback value
        /// </summary>
        public static Binding Text(string path, string fallback = "")
        {
            var binding = OneWay(path);
            binding.FallbackValue = fallback;
            binding.TargetNullValue = fallback;
            return binding;
        }

        /// <summary>
        /// Creates a formatted text binding
        /// </summary>
        public static Binding Formatted(string path, string format)
        {
            return OneWay(path, null, format);
        }

        /// <summary>
        /// Creates a collection binding with async loading
        /// </summary>
        public static Binding Collection(string path, bool async = true)
        {
            var binding = OneWay(path);
            binding.IsAsync = async;
            return binding;
        }

        /// <summary>
        /// Creates a numeric binding for user input
        /// </summary>
        public static Binding Numeric(string path, UpdateSourceTrigger trigger = UpdateSourceTrigger.LostFocus)
        {
            return TwoWay(path, trigger);
        }

        /// <summary>
        /// Creates bindings for common DataGrid scenarios
        /// </summary>
        public static class DataGrid
        {
            /// <summary>
            /// Creates optimized column binding
            /// </summary>
            public static Binding Column(string path, string? format = null)
            {
                return format != null ? Formatted(path, format) : OneWay(path);
            }

            /// <summary>
            /// Creates selected item binding
            /// </summary>
            public static Binding SelectedItem(string path)
            {
                return TwoWay(path, UpdateSourceTrigger.PropertyChanged);
            }

            /// <summary>
            /// Creates items source binding with async
            /// </summary>
            public static Binding ItemsSource(string path)
            {
                return Collection(path, true);
            }
        }

        /// <summary>
        /// Creates bindings for common UI scenarios
        /// </summary>
        public static class UI
        {
            /// <summary>
            /// Creates an enabled binding
            /// </summary>
            public static Binding IsEnabled(string path, bool invert = false)
            {
                var binding = OneWay(path);
                if (invert)
                {
                    // Add an invert converter if needed
                    binding.ConverterParameter = "Invert";
                }
                return binding;
            }

            /// <summary>
            /// Creates a progress binding
            /// </summary>
            public static Binding Progress(string path)
            {
                return OneWay(path);
            }

            /// <summary>
            /// Creates a status text binding
            /// </summary>
            public static Binding StatusText(string path)
            {
                return Text(path, "Ready");
            }

            /// <summary>
            /// Creates a count binding with formatting
            /// </summary>
            public static Binding Count(string path, string format = "{0} items")
            {
                return Formatted(path, format);
            }
        }

        /// <summary>
        /// Applies optimized bindings to a FrameworkElement
        /// </summary>
        public static void OptimizeElement(FrameworkElement element)
        {
            _bindingService?.OptimizeElementBindings(element);
        }

        /// <summary>
        /// Gets binding performance statistics
        /// </summary>
        public static BindingStats GetStats()
        {
            return _bindingService?.GetStats() ?? new BindingStats();
        }
    }

    /// <summary>
    /// Markup extension for creating optimized bindings in XAML
    /// </summary>
    public class OptimizedBindingExtension : MarkupExtension
    {
        public string Path { get; set; }
        public BindingMode Mode { get; set; } = BindingMode.OneWay;
        public string? Format { get; set; }
        public string? Fallback { get; set; }
        public bool Async { get; set; } = false;

        public OptimizedBindingExtension() { }

        public OptimizedBindingExtension(string path)
        {
            Path = path;
        }

        public override object ProvideValue(IServiceProvider serviceProvider)
        {
            var binding = new Binding(Path)
            {
                Mode = Mode,
                IsAsync = Async
            };

            if (!string.IsNullOrEmpty(Format))
                binding.StringFormat = Format;

            if (!string.IsNullOrEmpty(Fallback))
                binding.FallbackValue = Fallback;

            // Performance optimizations
            binding.ValidatesOnDataErrors = false;
            binding.ValidatesOnExceptions = false;
            binding.NotifyOnValidationError = false;

            return binding;
        }
    }
}