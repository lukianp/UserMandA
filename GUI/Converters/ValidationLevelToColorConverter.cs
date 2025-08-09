using System;
using System.Globalization;
using System.Windows.Data;
using System.Windows;

namespace MandADiscoverySuite.Converters
{
    public class ValidationLevelToColorConverter : IValueConverter
    {
        public object Convert(object value, Type targetType, object parameter, CultureInfo culture)
        {
            if (value is string level)
            {
                switch (level.ToLower())
                {
                    case "success":
                        return Application.Current.FindResource("SuccessBrush");
                    case "warning":
                        return Application.Current.FindResource("WarningBrush");
                    case "error":
                    default:
                        return Application.Current.FindResource("ErrorBrush");
                }
            }
            
            return Application.Current.FindResource("ErrorBrush");
        }

        public object ConvertBack(object value, Type targetType, object parameter, CultureInfo culture)
        {
            return Binding.DoNothing;
        }
    }
}