using System.Windows;
using System.Windows.Input;

namespace MandADiscoverySuite
{
    public partial class CreateProfileDialog : Window
    {
        public string ProfileName { get; private set; } = "";

        public CreateProfileDialog()
        {
            InitializeComponent();
            ProfileNameTextBox.Focus();
        }

        private void Create_Click(object sender, RoutedEventArgs e)
        {
            if (string.IsNullOrWhiteSpace(ProfileNameTextBox.Text))
            {
                MessageBox.Show("Please enter a company name.", "Validation Error", 
                    MessageBoxButton.OK, MessageBoxImage.Warning);
                return;
            }

            ProfileName = ProfileNameTextBox.Text.Trim();
            DialogResult = true;
            Close();
        }

        private void Cancel_Click(object sender, RoutedEventArgs e)
        {
            DialogResult = false;
            Close();
        }

        private void ProfileNameTextBox_KeyDown(object sender, KeyEventArgs e)
        {
            if (e.Key == Key.Enter)
            {
                Create_Click(sender, new RoutedEventArgs());
            }
            else if (e.Key == Key.Escape)
            {
                Cancel_Click(sender, new RoutedEventArgs());
            }
        }
    }
}