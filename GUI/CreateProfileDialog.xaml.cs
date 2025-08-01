using System.Windows;

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
    }
}