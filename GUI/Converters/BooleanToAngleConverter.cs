using System;
using System.Globalization;
using System.Windows.Data;

namespace MandADiscoverySuite.Converters
{
    /// <summary>
    /// Converts boolean to rotation angle for expand/collapse arrows
    /// </summary>
    public class BooleanToAngleConverter : IValueConverter
    {
        public object Convert(object value, Type targetType, object parameter, CultureInfo culture)
        {
            if (value is bool isExpanded)
            {
                return isExpanded ? 180.0 : 0.0;
            }
            return 0.0;
        }

        public object ConvertBack(object value, Type targetType, object parameter, CultureInfo culture)
        {
            // ConvertBack is typically not needed for angle converters
            return Binding.DoNothing;
        }
    }
}