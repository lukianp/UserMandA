using System;
using System.Globalization;
using System.Windows.Data;
using System.Windows.Media;

namespace MandADiscoverySuite.Converters
{
    /// <summary>
    /// Converts health score to appropriate color brush
    /// </summary>
    public class HealthScoreToColorConverter : IValueConverter
    {
        public object Convert(object value, Type targetType, object parameter, CultureInfo culture)
        {
            if (value is double healthScore)
            {
                if (healthScore >= 80)
                    return new SolidColorBrush((Color)ColorConverter.ConvertFromString("#FF10B981")); // Green
                else if (healthScore >= 60)
                    return new SolidColorBrush((Color)ColorConverter.ConvertFromString("#FFF59E0B")); // Yellow
                else
                    return new SolidColorBrush((Color)ColorConverter.ConvertFromString("#FFEF4444")); // Red
            }

            return new SolidColorBrush((Color)ColorConverter.ConvertFromString("#FF6B7280")); // Gray default
        }

        public object ConvertBack(object value, Type targetType, object parameter, CultureInfo culture)
        {
            // ConvertBack is typically not needed for health score color converters
            return Binding.DoNothing;
        }
    }
}