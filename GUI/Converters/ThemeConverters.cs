using System;
using System.Globalization;
using System.Windows.Data;

namespace MandADiscoverySuite.Converters
{
    public class BoolToThemeIconConverter : IValueConverter
    {
        public static BoolToThemeIconConverter Instance { get; } = new BoolToThemeIconConverter();

        public object Convert(object value, Type targetType, object parameter, CultureInfo culture)
        {
            if (value is bool isDarkTheme)
            {
                return isDarkTheme ? "🌙" : "☀️";
            }
            return "🌙";
        }

        public object ConvertBack(object value, Type targetType, object parameter, CultureInfo culture)
        {
            // ConvertBack is typically not needed for theme converters
            return Binding.DoNothing;
        }
    }

    public class BoolToThemeTextConverter : IValueConverter
    {
        public static BoolToThemeTextConverter Instance { get; } = new BoolToThemeTextConverter();

        public object Convert(object value, Type targetType, object parameter, CultureInfo culture)
        {
            if (value is bool isDarkTheme)
            {
                return isDarkTheme ? "Dark Mode" : "Light Mode";
            }
            return "Dark Mode";
        }

        public object ConvertBack(object value, Type targetType, object parameter, CultureInfo culture)
        {
            // ConvertBack is typically not needed for theme converters
            return Binding.DoNothing;
        }
    }
}