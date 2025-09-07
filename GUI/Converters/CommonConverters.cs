using System;
using System.Globalization;
using System.Windows;
using System.Windows.Data;

namespace MandADiscoverySuite.Converters
{
    /// <summary>
    /// Converts null to Boolean (null = false, not null = true)
    /// </summary>
    public class NullToBoolConverter : IValueConverter
    {
        public object Convert(object value, Type targetType, object parameter, CultureInfo culture)
        {
            return value != null;
        }

        public object ConvertBack(object value, Type targetType, object parameter, CultureInfo culture)
        {
            // ConvertBack not supported for this converter
            return Binding.DoNothing;
        }
    }

    /// <summary>
    /// Converts null to Visibility
    /// </summary>
    public class NullToVisibilityConverter : IValueConverter
    {
        public object Convert(object value, Type targetType, object parameter, CultureInfo culture)
        {
            bool invert = parameter?.ToString()?.ToLower() == "invert";
            bool isNull = value == null;
            
            if (invert)
                return isNull ? Visibility.Visible : Visibility.Collapsed;
            else
                return isNull ? Visibility.Collapsed : Visibility.Visible;
        }

        public object ConvertBack(object value, Type targetType, object parameter, CultureInfo culture)
        {
            // ConvertBack not supported for this converter
            return Binding.DoNothing;
        }
    }


    /// <summary>
    /// Converts boolean to visibility
    /// </summary>
    public class BoolToVisibilityConverter : IValueConverter
    {
        public object Convert(object value, Type targetType, object parameter, CultureInfo culture)
        {
            if (value is bool boolValue)
            {
                return boolValue ? Visibility.Visible : Visibility.Collapsed;
            }
            return Visibility.Collapsed;
        }

        public object ConvertBack(object value, Type targetType, object parameter, CultureInfo culture)
        {
            if (value is Visibility visibility)
            {
                return visibility == Visibility.Visible;
            }
            return false;
        }
    }

    /// <summary>
    /// Inverts boolean to visibility
    /// </summary>
    public class InverseBooleanToVisibilityConverter : IValueConverter
    {
        public object Convert(object value, Type targetType, object parameter, CultureInfo culture)
        {
            if (value is bool boolValue)
            {
                return boolValue ? Visibility.Collapsed : Visibility.Visible;
            }
            return Visibility.Visible;
        }

        public object ConvertBack(object value, Type targetType, object parameter, CultureInfo culture)
        {
            if (value is Visibility visibility)
            {
                return visibility == Visibility.Collapsed;
            }
            return false;
        }
    }

    /// <summary>
    /// Inverts boolean value
    /// </summary>
    public class InverseBooleanConverter : IValueConverter
    {
        public object Convert(object value, Type targetType, object parameter, CultureInfo culture)
        {
            if (value is bool boolValue)
            {
                return !boolValue;
            }
            return true;
        }

        public object ConvertBack(object value, Type targetType, object parameter, CultureInfo culture)
        {
            if (value is bool boolValue)
            {
                return !boolValue;
            }
            return false;
        }
    }

    /// <summary>
    /// Converts empty string to visibility
    /// </summary>
    public class EmptyStringToVisibilityConverter : IValueConverter
    {
        public object Convert(object value, Type targetType, object parameter, CultureInfo culture)
        {
            bool invert = parameter?.ToString()?.ToLower() == "invert";
            bool isEmpty = string.IsNullOrWhiteSpace(value?.ToString());
            
            if (invert)
                return isEmpty ? Visibility.Visible : Visibility.Collapsed;
            else
                return isEmpty ? Visibility.Collapsed : Visibility.Visible;
        }

        public object ConvertBack(object value, Type targetType, object parameter, CultureInfo culture)
        {
            // ConvertBack not supported for this converter
            return Binding.DoNothing;
        }
    }

    /// <summary>
    /// Formats dates with optional format parameter
    /// </summary>
    public class DateFormatConverter : IValueConverter
    {
        public object Convert(object value, Type targetType, object parameter, CultureInfo culture)
        {
            if (value == null) return string.Empty;
            
            string format = parameter?.ToString() ?? "yyyy-MM-dd HH:mm";
            
            if (value is DateTime dateTime)
                return dateTime.ToString(format);
            
            if (value is DateTimeOffset dateTimeOffset)
                return dateTimeOffset.ToString(format);
            
            if (DateTime.TryParse(value.ToString(), out DateTime parsed))
                return parsed.ToString(format);
            
            return value.ToString();
        }

        public object ConvertBack(object value, Type targetType, object parameter, CultureInfo culture)
        {
            if (DateTime.TryParse(value?.ToString(), out DateTime result))
                return result;
            
            return null;
        }
    }

    /// <summary>
    /// Converts file size in bytes to human-readable format
    /// </summary>
    public class FileSizeConverter : IValueConverter
    {
        private static readonly string[] SizeSuffixes = { "B", "KB", "MB", "GB", "TB", "PB" };

        public object Convert(object value, Type targetType, object parameter, CultureInfo culture)
        {
            if (value == null) return "0 B";
            
            double size = 0;
            if (value is long longValue)
                size = longValue;
            else if (value is int intValue)
                size = intValue;
            else if (value is double doubleValue)
                size = doubleValue;
            else if (double.TryParse(value.ToString(), out double parsed))
                size = parsed;
            else
                return "0 B";
            
            if (size <= 0) return "0 B";
            
            int order = 0;
            while (size >= 1024 && order < SizeSuffixes.Length - 1)
            {
                order++;
                size /= 1024;
            }
            
            return $"{size:0.##} {SizeSuffixes[order]}";
        }

        public object ConvertBack(object value, Type targetType, object parameter, CultureInfo culture)
        {
            // ConvertBack not supported for this converter
            return Binding.DoNothing;
        }
    }

    /// <summary>
    /// Alias for EmptyStringToVisibilityConverter to match XAML binding expectations
    /// </summary>
    public class StringEmptyToVisibilityConverter : EmptyStringToVisibilityConverter
    {
    }

    /// <summary>
    /// Converts equality comparison to visibility
    /// </summary>
    public class EqualityToVisibilityConverter : IValueConverter
    {
        public object Convert(object value, Type targetType, object parameter, CultureInfo culture)
        {
            if (value == null && parameter == null)
                return Visibility.Visible;
                
            if (value == null || parameter == null)
                return Visibility.Collapsed;
                
            return value.ToString().Equals(parameter.ToString(), StringComparison.OrdinalIgnoreCase) 
                ? Visibility.Visible 
                : Visibility.Collapsed;
        }

        public object ConvertBack(object value, Type targetType, object parameter, CultureInfo culture)
        {
            // ConvertBack not supported for this converter
            return Binding.DoNothing;
        }
    }
}