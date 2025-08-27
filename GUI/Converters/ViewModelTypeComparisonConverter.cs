using System;
using System.Globalization;
using System.Windows.Data;

namespace MandADiscoverySuite.Converters
{
    /// <summary>
    /// Converter to compare if two view models are the same instance
    /// </summary>
    public class ViewModelTypeComparisonConverter : IMultiValueConverter
    {
        public object Convert(object[] values, Type targetType, object parameter, CultureInfo culture)
        {
            if (values == null || values.Length != 2)
                return false;

            return ReferenceEquals(values[0], values[1]);
        }

        public object[] ConvertBack(object value, Type[] targetTypes, object parameter, CultureInfo culture)
        {
            // ConvertBack not supported for this converter
            return null;
        }
    }
}