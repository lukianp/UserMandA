using System;
using System.Globalization;
using System.Windows.Data;
using System.Windows.Media;

namespace MandADiscoverySuite.Converters
{
    /// <summary>
    /// Converts boolean to error brush (red) or default brush
    /// </summary>
    public class BooleanToErrorBrushConverter : IValueConverter
    {
        public object Convert(object value, Type targetType, object parameter, CultureInfo culture)
        {
            if (value is bool isError && isError)
            {
                return new SolidColorBrush((Color)ColorConverter.ConvertFromString("#FFEF4444")); // Red
            }
            return new SolidColorBrush((Color)ColorConverter.ConvertFromString("#FF6B7280")); // Gray
        }

        public object ConvertBack(object value, Type targetType, object parameter, CultureInfo culture)
        {
            throw new NotImplementedException();
        }
    }
}