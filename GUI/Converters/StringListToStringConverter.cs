using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Windows.Data;

namespace MandADiscoverySuite.Converters
{
    /// <summary>
    /// Converts a list of strings to a comma-separated string
    /// </summary>
    public class StringListToStringConverter : IValueConverter
    {
        public object Convert(object value, Type targetType, object parameter, CultureInfo culture)
        {
            if (value is IEnumerable<string> stringList)
            {
                return string.Join(", ", stringList);
            }
            
            return string.Empty;
        }

        public object ConvertBack(object value, Type targetType, object parameter, CultureInfo culture)
        {
            if (value is string str)
            {
                return str.Split(new[] { ", " }, StringSplitOptions.RemoveEmptyEntries).ToList();
            }
            
            return new List<string>();
        }
    }
}