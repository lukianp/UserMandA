using System;
using System.Globalization;
using System.Windows.Data;
using System.Windows.Media;
using MandADiscoverySuite.Models;

namespace MandADiscoverySuite.Converters
{
    /// <summary>
    /// Converts TaskPriority to appropriate color brush
    /// </summary>
    public class PriorityToColorConverter : IValueConverter
    {
        public object Convert(object value, Type targetType, object parameter, CultureInfo culture)
        {
            if (value is TaskPriority priority)
            {
                return priority switch
                {
                    TaskPriority.High => new SolidColorBrush((Color)ColorConverter.ConvertFromString("#FFEF4444")), // Red
                    TaskPriority.Medium => new SolidColorBrush((Color)ColorConverter.ConvertFromString("#FFF59E0B")), // Yellow
                    TaskPriority.Low => new SolidColorBrush((Color)ColorConverter.ConvertFromString("#FF10B981")), // Green
                    _ => new SolidColorBrush((Color)ColorConverter.ConvertFromString("#FF6B7280")) // Gray
                };
            }
            return new SolidColorBrush((Color)ColorConverter.ConvertFromString("#FF6B7280"));
        }

        public object ConvertBack(object value, Type targetType, object parameter, CultureInfo culture)
        {
            // ConvertBack is typically not needed for priority color converters
            return Binding.DoNothing;
        }
    }
}