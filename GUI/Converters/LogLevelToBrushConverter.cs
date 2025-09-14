using System;
using System.Globalization;
using System.Windows.Data;
using System.Windows.Media;
using LogLevel = Microsoft.Extensions.Logging.LogLevel;

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
            if (value is SolidColorBrush brush)
            {
                Color color = brush.Color;
                return color switch
                {
                    { R: 220, G: 38, B: 38 } => LogLevel.Critical,
                    { R: 239, G: 68, B: 68 } => LogLevel.Error,
                    { R: 245, G: 158, B: 11 } => LogLevel.Warning,
                    { R: 59, G: 130, B: 246 } => LogLevel.Information,
                    { R: 107, G: 114, B: 128 } => LogLevel.Debug,
                    { R: 156, G: 163, B: 175 } => LogLevel.Trace,
                    _ => LogLevel.None
                };
            }

            return LogLevel.None;
        }
    }
}