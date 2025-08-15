using System.Windows;

namespace MandADiscoverySuite.Behaviors
{
    /// <summary>
    /// Stub behavior for ProfileDropZone.xaml compatibility
    /// </summary>
    public static class DragDropBehavior
    {
        public static readonly DependencyProperty IsEnabledProperty =
            DependencyProperty.RegisterAttached(
                "IsEnabled",
                typeof(bool),
                typeof(DragDropBehavior),
                new PropertyMetadata(false));

        public static readonly DependencyProperty DropCommandProperty =
            DependencyProperty.RegisterAttached(
                "DropCommand",
                typeof(object),
                typeof(DragDropBehavior),
                new PropertyMetadata(null));

        public static bool GetIsEnabled(DependencyObject obj)
        {
            return (bool)obj.GetValue(IsEnabledProperty);
        }

        public static void SetIsEnabled(DependencyObject obj, bool value)
        {
            obj.SetValue(IsEnabledProperty, value);
        }

        public static object GetDropCommand(DependencyObject obj)
        {
            return obj.GetValue(DropCommandProperty);
        }

        public static void SetDropCommand(DependencyObject obj, object value)
        {
            obj.SetValue(DropCommandProperty, value);
        }

        public static readonly DependencyProperty AllowedExtensionsProperty =
            DependencyProperty.RegisterAttached(
                "AllowedExtensions",
                typeof(string),
                typeof(DragDropBehavior),
                new PropertyMetadata(string.Empty));

        public static string GetAllowedExtensions(DependencyObject obj)
        {
            return (string)obj.GetValue(AllowedExtensionsProperty);
        }

        public static void SetAllowedExtensions(DependencyObject obj, string value)
        {
            obj.SetValue(AllowedExtensionsProperty, value);
        }

        public static readonly DependencyProperty DropZoneTextProperty =
            DependencyProperty.RegisterAttached(
                "DropZoneText",
                typeof(string),
                typeof(DragDropBehavior),
                new PropertyMetadata("Drop files here"));

        public static string GetDropZoneText(DependencyObject obj)
        {
            return (string)obj.GetValue(DropZoneTextProperty);
        }

        public static void SetDropZoneText(DependencyObject obj, string value)
        {
            obj.SetValue(DropZoneTextProperty, value);
        }

        public static readonly DependencyProperty ShowVisualFeedbackProperty =
            DependencyProperty.RegisterAttached(
                "ShowVisualFeedback",
                typeof(bool),
                typeof(DragDropBehavior),
                new PropertyMetadata(true));

        public static bool GetShowVisualFeedback(DependencyObject obj)
        {
            return (bool)obj.GetValue(ShowVisualFeedbackProperty);
        }

        public static void SetShowVisualFeedback(DependencyObject obj, bool value)
        {
            obj.SetValue(ShowVisualFeedbackProperty, value);
        }
    }
}