using System;
using System.Globalization;
using System.Windows.Data;

namespace MandADiscoverySuite.Converters
{
    /// <summary>
    /// Stub converter for OptimizedImages.xaml compatibility
    /// </summary>
    public class ThumbnailImageConverter : IValueConverter
    {
        public int ThumbnailSize { get; set; } = 64;
        public bool MaintainAspectRatio { get; set; } = true;

        public object Convert(object value, Type targetType, object parameter, CultureInfo culture)
        {
            return value;
        }

        public object ConvertBack(object value, Type targetType, object parameter, CultureInfo culture)
        {
            // ConvertBack not supported for this converter
            return Binding.DoNothing;
        }
    }
}