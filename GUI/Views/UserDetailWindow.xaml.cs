using System.Windows;

namespace MandADiscoverySuite.Views
{
    public partial class UserDetailWindow : Window
    {
        public UserDetailWindow()
        {
            InitializeComponent();
        }

        public UserDetailWindow(object userData) : this()
        {
            var viewModel = new ViewModels.UserDetailViewModel(userData);
            UserDetailViewControl.DataContext = viewModel;
        }

        private void CloseButton_Click(object sender, RoutedEventArgs e)
        {
            this.Close();
        }
    }
}