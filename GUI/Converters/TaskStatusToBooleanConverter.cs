using System;
using System.Globalization;
using System.Windows.Data;
using MandADiscoverySuite.Models;

namespace MandADiscoverySuite.Converters
{
    /// <summary>
    /// Converts TaskStatus to boolean for checkbox binding
    /// </summary>
    public class TaskStatusToBooleanConverter : IValueConverter
    {
        public object Convert(object value, Type targetType, object parameter, CultureInfo culture)
        {
            if (value is TaskStatus status)
            {
                return status == TaskStatus.Completed;
            }
            return false;
        }

        public object ConvertBack(object value, Type targetType, object parameter, CultureInfo culture)
        {
            if (value is bool isChecked)
            {
                return isChecked ? TaskStatus.Completed : TaskStatus.NotStarted;
            }
            return TaskStatus.NotStarted;
        }
    }
}