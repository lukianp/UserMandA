using System;
using System.Globalization;
using System.Windows.Data;

namespace MandADiscoverySuite.Converters
{
    /// <summary>
    /// Stub converter for OptimizedImages.xaml compatibility
    /// </summary>
    public class OptimizedImageConverter : IValueConverter
    {
        public bool UseCache { get; set; } = true;
        public int MaxWidth { get; set; } = 32;
        public int MaxHeight { get; set; } = 32;

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