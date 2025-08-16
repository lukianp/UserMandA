using System;
using System.Globalization;
using System.Windows.Data;
using System.Windows.Media;

namespace MandADiscoverySuite.Converters
{
    /// <summary>
    /// Converts boolean values to brushes
    /// </summary>
    public class BoolToBrushConverter : IValueConverter
    {
        public object Convert(object value, Type targetType, object parameter, CultureInfo culture)
        {
            if (value is bool boolValue)
            {
                // Parameter format: "TrueBrush|FalseBrush"
                if (parameter is string brushSpec && brushSpec.Contains("|"))
                {
                    var brushes = brushSpec.Split('|');
                    var colorString = boolValue ? brushes[0] : brushes[1];
                    try
                    {
                        var color = (Color)ColorConverter.ConvertFromString(colorString);
                        return new SolidColorBrush(color);
                    }
                    catch
                    {
                        return new SolidColorBrush(Colors.Transparent);
                    }
                }
                
                // Default colors
                return boolValue 
                    ? new SolidColorBrush(Colors.Green)
                    : new SolidColorBrush(Colors.Red);
            }
            
            return new SolidColorBrush(Colors.Transparent);
        }

        public object ConvertBack(object value, Type targetType, object parameter, CultureInfo culture)
        {
            // ConvertBack not supported for brush to boolean conversion
            return Binding.DoNothing;
        }
    }
}