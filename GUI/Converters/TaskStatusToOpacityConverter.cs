using System;
using System.Globalization;
using System.Windows.Data;
using MandADiscoverySuite.Models;

namespace MandADiscoverySuite.Converters
{
    /// <summary>
    /// Converts TaskStatus to opacity (reduced opacity for completed tasks)
    /// </summary>
    public class TaskStatusToOpacityConverter : IValueConverter
    {
        public object Convert(object value, Type targetType, object parameter, CultureInfo culture)
        {
            if (value is TaskStatus status && status == TaskStatus.Completed)
            {
                return 0.6;
            }
            return 1.0;
        }

        public object ConvertBack(object value, Type targetType, object parameter, CultureInfo culture)
        {
            // ConvertBack is typically not needed for opacity converters
            return Binding.DoNothing;
        }
    }
}