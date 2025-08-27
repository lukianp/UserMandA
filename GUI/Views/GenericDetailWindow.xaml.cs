using System.Windows;

namespace MandADiscoverySuite.Views
{
    public partial class GenericDetailWindow : Window
    {
        public GenericDetailWindow()
        {
            InitializeComponent();
        }

        private void CloseButton_Click(object sender, RoutedEventArgs e)
        {
            this.Close();
        }
    }
}