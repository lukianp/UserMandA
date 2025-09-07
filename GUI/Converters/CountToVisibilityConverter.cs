using System;
using System.Globalization;
using System.Windows;
using System.Windows.Data;

namespace MandADiscoverySuite.Converters
{
    /// <summary>
    /// Converts integer values to visibility (0 = Collapsed, > 0 = Visible)
    /// </summary>
    public class CountToVisibilityConverter : IValueConverter
    {
        public object Convert(object value, Type targetType, object parameter, CultureInfo culture)
        {
            if (value is int intValue)
            {
                return intValue > 0 ? Visibility.Visible : Visibility.Collapsed;
            }
            
            return Visibility.Collapsed;
        }

        public object ConvertBack(object value, Type targetType, object parameter, CultureInfo culture)
        {
            // ConvertBack not supported for this converter
            return Binding.DoNothing;
        }
    }
}