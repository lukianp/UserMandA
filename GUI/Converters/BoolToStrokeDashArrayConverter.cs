using System;
using System.Globalization;
using System.Windows.Data;
using System.Windows.Media;

namespace MandADiscoverySuite.Converters
{
    /// <summary>
    /// Converts boolean values to stroke dash arrays for directional edges
    /// </summary>
    public class BoolToStrokeDashArrayConverter : IValueConverter
    {
        public object Convert(object value, Type targetType, object parameter, CultureInfo culture)
        {
            if (value is bool boolValue)
            {
                // If directional, return dashed array; otherwise solid
                return boolValue ? new DoubleCollection(new[] { 4.0, 2.0 }) : new DoubleCollection();
            }

            return new DoubleCollection();
        }

        public object ConvertBack(object value, Type targetType, object parameter, CultureInfo culture)
        {
            // ConvertBack not supported
            return Binding.DoNothing;
        }
    }
}