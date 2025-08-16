using System;
using System.Globalization;
using System.Windows.Data;

namespace MandADiscoverySuite.Converters
{
    /// <summary>
    /// Stub converter for OptimizedImages.xaml compatibility
    /// </summary>
    public class ResourceImageConverter : IValueConverter
    {
        public string ResourceAssembly { get; set; } = string.Empty;
        public string ResourceFolder { get; set; } = "Images";

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