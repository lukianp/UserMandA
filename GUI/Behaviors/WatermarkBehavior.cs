using System.Windows;
using System.Windows.Controls;
using System.Windows.Media;

namespace MandADiscoverySuite.Behaviors
{
    public static class WatermarkBehavior
    {
        public static readonly DependencyProperty WatermarkProperty =
            DependencyProperty.RegisterAttached(
                "Watermark",
                typeof(string),
                typeof(WatermarkBehavior),
                new PropertyMetadata(null, OnWatermarkChanged));

        public static string GetWatermark(DependencyObject obj)
        {
            return (string)obj.GetValue(WatermarkProperty);
        }

        public static void SetWatermark(DependencyObject obj, string value)
        {
            obj.SetValue(WatermarkProperty, value);
        }

        private static void OnWatermarkChanged(DependencyObject d, DependencyPropertyChangedEventArgs e)
        {
            if (d is TextBox textBox)
            {
                textBox.Loaded += TextBox_Loaded;
                textBox.GotFocus += TextBox_GotFocus;
                textBox.LostFocus += TextBox_LostFocus;
                textBox.TextChanged += TextBox_TextChanged;
            }
        }

        private static void TextBox_Loaded(object sender, RoutedEventArgs e)
        {
            var textBox = (TextBox)sender;
            UpdateWatermark(textBox);
        }

        private static void TextBox_GotFocus(object sender, RoutedEventArgs e)
        {
            var textBox = (TextBox)sender;
            var watermark = GetWatermark(textBox);

            if (textBox.Text! == watermark)
            {
                textBox.Text = string.Empty;
                textBox.Foreground = (Brush)Application.Current.Resources["PrimaryTextBrush"] ?? Brushes.White;
            }
        }

        private static void TextBox_LostFocus(object sender, RoutedEventArgs e)
        {
            var textBox = (TextBox)sender;
            UpdateWatermark(textBox);
        }

        private static void TextBox_TextChanged(object sender, TextChangedEventArgs e)
        {
            var textBox = (TextBox)sender;
            UpdateWatermark(textBox);
        }

        private static void UpdateWatermark(TextBox textBox)
        {
            var watermark = GetWatermark(textBox);

            if (string.IsNullOrEmpty(textBox.Text!) && !textBox.IsFocused)
            {
                textBox.Text = watermark!;
                textBox.Foreground = new SolidColorBrush(Color.FromRgb(160, 174, 192)); // #FFA0AEC0
            }
            else if (textBox.Text! != watermark)
            {
                textBox.Foreground = (Brush)Application.Current.Resources["PrimaryTextBrush"] ?? Brushes.White;
            }
        }
    }
}