using System;
using System.Globalization;
using System.Windows;
using System.Windows.Data;
using MandADiscoverySuite.Models;

namespace MandADiscoverySuite.Converters
{
    /// <summary>
    /// Converts TaskStatus to text decoration (strikethrough for completed tasks)
    /// </summary>
    public class TaskStatusToTextDecorationConverter : IValueConverter
    {
        public object Convert(object value, Type targetType, object parameter, CultureInfo culture)
        {
            if (value is TaskStatus status && status == TaskStatus.Completed)
            {
                return TextDecorations.Strikethrough;
            }
            return null;
        }

        public object ConvertBack(object value, Type targetType, object parameter, CultureInfo culture)
        {
            throw new NotImplementedException();
        }
    }
}