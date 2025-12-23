using System.Windows;
using MandADiscoverySuite.ViewModels;

namespace MandADiscoverySuite.Views
{
    /// <summary>
    /// Interaction logic for AddTargetProfileDialog.xaml
    /// </summary>
    public partial class AddTargetProfileDialog : Window
    {
        public AddTargetProfileDialog()
        {
            InitializeComponent();
            DataContext = new AddTargetProfileViewModel();
        }

        public AddTargetProfileDialog(AddTargetProfileViewModel viewModel)
        {
            InitializeComponent();
            DataContext = viewModel;
        }

        private void Window_Loaded(object sender, RoutedEventArgs e)
        {
            CompanyNameTextBox.Focus();
            CompanyNameTextBox.SelectAll();
        }
    }
}