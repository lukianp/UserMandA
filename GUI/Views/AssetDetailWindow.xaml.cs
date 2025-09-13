using System.Windows;
using System.Windows.Controls;

namespace MandADiscoverySuite.Views
{
    public partial class AssetDetailWindow : Window
    {
        public AssetDetailWindow()
        {
            InitializeComponent();
        }

        private void CloseButton_Click(object sender, RoutedEventArgs e)
        {
            this.Close();
        }


        private void AssetDetailWindow_Loaded(object sender, RoutedEventArgs e)
        {
            // Add any initialization logic here if needed
        }
    }
}