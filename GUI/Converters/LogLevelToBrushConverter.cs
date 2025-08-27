using System;
using System.Globalization;
using System.Windows.Data;
using System.Windows.Media;
using Microsoft.Extensions.Logging;

namespace MandADiscoverySuite.Converters
{
    public class LogLevelToBrushConverter : IValueConverter
    {
        public object Convert(object value, Type targetType, object parameter, CultureInfo culture)
        {
            if (value is LogLevel logLevel)
            {
                return logLevel switch
                {
                    LogLevel.Critical => new SolidColorBrush(Color.FromRgb(220, 38, 38)),   // Red-600
                    LogLevel.Error => new SolidColorBrush(Color.FromRgb(239, 68, 68)),      // Red-500
                    LogLevel.Warning => new SolidColorBrush(Color.FromRgb(245, 158, 11)),   // Amber-500
                    LogLevel.Information => new SolidColorBrush(Color.FromRgb(59, 130, 246)), // Blue-500
                    LogLevel.Debug => new SolidColorBrush(Color.FromRgb(107, 114, 128)),     // Gray-500
                    LogLevel.Trace => new SolidColorBrush(Color.FromRgb(156, 163, 175)),     // Gray-400
                    _ => new SolidColorBrush(Color.FromRgb(107, 114, 128))                   // Default gray
                };
            }

            return new SolidColorBrush(Color.FromRgb(107, 114, 128)); // Default gray
        }

        public object ConvertBack(object value, Type targetType, object parameter, CultureInfo culture)
        {
            throw new NotImplementedException();
        }
    }
}