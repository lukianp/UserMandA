using System;
using System.Globalization;
using System.Windows.Data;
using System.Windows.Media;

namespace MandADiscoverySuite.Converters
{
    public class BoolToColorConverter : IValueConverter
    {
        public object Convert(object value, Type targetType, object parameter, CultureInfo culture)
        {
            if (value is bool boolValue && parameter is string colorParam)
            {
                var colors = colorParam.Split('|');
                if (colors.Length == 2)
                {
                    var trueColor = colors[0];
                    var falseColor = colors[1];
                    
                    var selectedColor = boolValue ? trueColor : falseColor;
                    
                    try
                    {
                        return new SolidColorBrush((Color)ColorConverter.ConvertFromString(selectedColor));
                    }
                    catch
                    {
                        return new SolidColorBrush(Colors.Transparent);
                    }
                }
            }
            
            return new SolidColorBrush(Colors.Transparent);
        }

        public object ConvertBack(object value, Type targetType, object parameter, CultureInfo culture)
        {
            // ConvertBack is typically not needed for color converters
            return Binding.DoNothing;
        }
    }
}