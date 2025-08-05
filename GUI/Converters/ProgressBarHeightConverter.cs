using System;
using System.Globalization;
using System.Windows.Data;

namespace MandADiscoverySuite.Converters
{
    /// <summary>
    /// Converts progress value to appropriate progress bar height for visual emphasis
    /// </summary>
    public class ProgressBarHeightConverter : IValueConverter
    {
        public object Convert(object value, Type targetType, object parameter, CultureInfo culture)
        {
            if (value is double progress)
            {
                // Base height of 6, with emphasis for higher progress
                return Math.Max(6, Math.Min(12, 6 + (progress / 100.0) * 6));
            }

            return 6.0; // Default height
        }

        public object ConvertBack(object value, Type targetType, object parameter, CultureInfo culture)
        {
            throw new NotImplementedException();
        }
    }
}