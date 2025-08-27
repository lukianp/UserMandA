using System;
using System.Globalization;
using System.Windows.Data;
using System.Windows.Media;

namespace MandADiscoverySuite.Converters
{
    public class RiskLevelToBrushConverter : IValueConverter
    {
        public object Convert(object value, Type targetType, object parameter, CultureInfo culture)
        {
            if (value is string riskLevel)
            {
                switch (riskLevel.ToLower())
                {
                    case "critical":
                        return new SolidColorBrush(Color.FromRgb(245, 101, 101)); // #F56565
                    case "high":
                        return new SolidColorBrush(Color.FromRgb(251, 146, 60));  // #FB923C
                    case "medium":
                        return new SolidColorBrush(Color.FromRgb(250, 204, 21));  // #FACC15
                    case "low":
                        return new SolidColorBrush(Color.FromRgb(72, 187, 120));  // #48BB78
                    default:
                        return new SolidColorBrush(Color.FromRgb(160, 174, 192)); // #A0AEC0
                }
            }

            return new SolidColorBrush(Color.FromRgb(160, 174, 192)); // Default gray
        }

        public object ConvertBack(object value, Type targetType, object parameter, CultureInfo culture)
        {
            // ConvertBack is typically not needed for color converters
            return Binding.DoNothing;
        }
    }
}