using System;
using System.Globalization;
using System.Windows.Data;
using System.Windows.Media;
using MandADiscoverySuite.Models;

namespace MandADiscoverySuite.Converters
{
    /// <summary>
    /// Converts various status enums to appropriate color brushes
    /// </summary>
    public class StatusToColorConverter : IValueConverter
    {
        public object Convert(object value, Type targetType, object parameter, CultureInfo culture)
        {
            // Handle string status values for Discovery modules
            if (value is string statusString)
            {
                switch (statusString.ToLower())
                {
                    case "ready":
                        return new SolidColorBrush((Color)ColorConverter.ConvertFromString("#FF6B7280")); // Gray
                    case "running":
                        return new SolidColorBrush((Color)ColorConverter.ConvertFromString("#FFF59E0B")); // Yellow
                    case "completed":
                        return new SolidColorBrush((Color)ColorConverter.ConvertFromString("#FF10B981")); // Green
                    case "failed":
                        return new SolidColorBrush((Color)ColorConverter.ConvertFromString("#FFEF4444")); // Red
                    default:
                        return new SolidColorBrush((Color)ColorConverter.ConvertFromString("#FF6B7280")); // Gray default
                }
            }
            
            switch (value)
            {
                // PhaseStatus
                case PhaseStatus.NotStarted:
                    return new SolidColorBrush((Color)ColorConverter.ConvertFromString("#FF6B7280")); // Gray
                case PhaseStatus.InProgress:
                    return new SolidColorBrush((Color)ColorConverter.ConvertFromString("#FFF59E0B")); // Yellow
                case PhaseStatus.Completed:
                    return new SolidColorBrush((Color)ColorConverter.ConvertFromString("#FF10B981")); // Green
                case PhaseStatus.OnHold:
                    return new SolidColorBrush((Color)ColorConverter.ConvertFromString("#FFEF4444")); // Red

                // TaskStatus
                case Models.TaskStatus.NotStarted:
                    return new SolidColorBrush((Color)ColorConverter.ConvertFromString("#FF6B7280")); // Gray
                case Models.TaskStatus.InProgress:
                    return new SolidColorBrush((Color)ColorConverter.ConvertFromString("#FFF59E0B")); // Yellow
                case Models.TaskStatus.Completed:
                    return new SolidColorBrush((Color)ColorConverter.ConvertFromString("#FF10B981")); // Green
                case Models.TaskStatus.Blocked:
                    return new SolidColorBrush((Color)ColorConverter.ConvertFromString("#FFEF4444")); // Red

                // ComponentStatus
                case ComponentStatus.NotStarted:
                    return new SolidColorBrush((Color)ColorConverter.ConvertFromString("#FF6B7280")); // Gray
                case ComponentStatus.InProgress:
                    return new SolidColorBrush((Color)ColorConverter.ConvertFromString("#FFF59E0B")); // Yellow
                case ComponentStatus.Completed:
                    return new SolidColorBrush((Color)ColorConverter.ConvertFromString("#FF10B981")); // Green
                case ComponentStatus.Blocked:
                    return new SolidColorBrush((Color)ColorConverter.ConvertFromString("#FFEF4444")); // Red

                // MilestoneStatus
                case MilestoneStatus.NotStarted:
                    return new SolidColorBrush((Color)ColorConverter.ConvertFromString("#FF6B7280")); // Gray
                case MilestoneStatus.InProgress:
                    return new SolidColorBrush((Color)ColorConverter.ConvertFromString("#FFF59E0B")); // Yellow
                case MilestoneStatus.Achieved:
                    return new SolidColorBrush((Color)ColorConverter.ConvertFromString("#FF10B981")); // Green
                case MilestoneStatus.AtRisk:
                    return new SolidColorBrush((Color)ColorConverter.ConvertFromString("#FFEF4444")); // Red

                // ProjectStatus
                case ProjectStatus.Planning:
                    return new SolidColorBrush((Color)ColorConverter.ConvertFromString("#FF6B7280")); // Gray
                case ProjectStatus.Active:
                    return new SolidColorBrush((Color)ColorConverter.ConvertFromString("#FF10B981")); // Green
                case ProjectStatus.OnHold:
                    return new SolidColorBrush((Color)ColorConverter.ConvertFromString("#FFF59E0B")); // Yellow
                case ProjectStatus.Completed:
                    return new SolidColorBrush((Color)ColorConverter.ConvertFromString("#FF059669")); // Dark Green
                case ProjectStatus.Cancelled:
                    return new SolidColorBrush((Color)ColorConverter.ConvertFromString("#FFEF4444")); // Red

                default:
                    return new SolidColorBrush((Color)ColorConverter.ConvertFromString("#FF6B7280")); // Gray default
            }
        }

        public object ConvertBack(object value, Type targetType, object parameter, CultureInfo culture)
        {
            // ConvertBack is typically not needed for status color converters
            return Binding.DoNothing;
        }
    }
}