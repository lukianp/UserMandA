using System.Windows;

namespace MandADiscoverySuite.Views
{
    public partial class UserDetailWindow : Window
    {
        public UserDetailWindow()
        {
            InitializeComponent();
        }

        private void CloseButton_Click(object sender, RoutedEventArgs e)
        {
            this.Close();
        }
    }
}