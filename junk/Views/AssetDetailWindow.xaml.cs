using System.Windows;
using System.Windows.Controls;

namespace MandADiscoverySuite.Views
{
    public partial class AssetDetailWindow : Window
    {
        public AssetDetailWindow()
        {
            InitializeComponent();
            this.Loaded += AssetDetailWindow_Loaded;
        }

        private void CloseButton_Click(object sender, RoutedEventArgs e)
        {
            this.Close();
        }

        // XAML-generated InitializeComponent is used; no manual implementation here.

        private void AssetDetailWindow_Loaded(object sender, RoutedEventArgs e)
        {
            // Add any initialization logic here if needed
        }
    }
}
