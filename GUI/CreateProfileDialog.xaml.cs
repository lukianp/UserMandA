using System.Linq;
using System.Windows;
using System.Windows.Input;
using MandADiscoverySuite.Themes;

namespace MandADiscoverySuite
{
    public partial class CreateProfileDialog : Window
    {
        public string ProfileName { get; private set; } = "";

        public CreateProfileDialog()
        {
            InitializeComponent();
            
            // Apply current theme
            ThemeManager.Instance.ApplyThemeToWindow(this);
            
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

        private void ProfileNameTextBox_TextChanged(object sender, System.Windows.Controls.TextChangedEventArgs e)
        {
            ValidateProfileName();
        }

        private void ValidateProfileName()
        {
            try
            {
                var input = ProfileNameTextBox.Text.Trim();
                
                if (string.IsNullOrWhiteSpace(input))
                {
                    ShowValidationError("Company name cannot be empty");
                    return;
                }

                if (input.Length < 2)
                {
                    ShowValidationError("Company name must be at least 2 characters long");
                    return;
                }

                if (input.Length > 100)
                {
                    ShowValidationError("Company name cannot exceed 100 characters");
                    return;
                }

                // Check for invalid characters
                char[] invalidChars = { '<', '>', '"', '|', '?', '*', ':', '\\', '/', '\0' };
                if (input.Any(c => invalidChars.Contains(c)))
                {
                    ShowValidationError("Company name contains invalid characters");
                    return;
                }

                // Check for reserved names
                string[] reservedNames = { "CON", "PRN", "AUX", "NUL", "COM1", "COM2", "COM3", "COM4", "COM5", "COM6", "COM7", "COM8", "COM9", "LPT1", "LPT2", "LPT3", "LPT4", "LPT5", "LPT6", "LPT7", "LPT8", "LPT9" };
                if (reservedNames.Contains(input.ToUpper()))
                {
                    ShowValidationError("Company name cannot be a reserved system name");
                    return;
                }

                ShowValidationSuccess($"Valid company name ({input.Length} characters)");
            }
            catch (System.Exception ex)
            {
                ShowValidationError($"Validation error: {ex.Message}");
            }
        }

        private void ShowValidationError(string message)
        {
            Dispatcher.Invoke(() =>
            {
                ProfileNameTextBox.BorderBrush = new System.Windows.Media.SolidColorBrush(System.Windows.Media.Color.FromRgb(229, 62, 62));
                ProfileNameTextBox.BorderThickness = new Thickness(2);
                ProfileNameTextBox.Background = new System.Windows.Media.SolidColorBrush(System.Windows.Media.Color.FromRgb(60, 31, 31));
                ProfileNameValidationText.Foreground = new System.Windows.Media.SolidColorBrush(System.Windows.Media.Color.FromRgb(229, 62, 62));
                ProfileNameValidationText.Text = $"❌ {message}";
                ProfileNameValidationText.Visibility = Visibility.Visible;
            });
        }

        private void ShowValidationSuccess(string message)
        {
            Dispatcher.Invoke(() =>
            {
                ProfileNameTextBox.BorderBrush = new System.Windows.Media.SolidColorBrush(System.Windows.Media.Color.FromRgb(72, 187, 120));
                ProfileNameTextBox.BorderThickness = new Thickness(2);
                ProfileNameTextBox.Background = new System.Windows.Media.SolidColorBrush(System.Windows.Media.Color.FromRgb(45, 55, 72));
                ProfileNameValidationText.Foreground = new System.Windows.Media.SolidColorBrush(System.Windows.Media.Color.FromRgb(72, 187, 120));
                ProfileNameValidationText.Text = $"✅ {message}";
                ProfileNameValidationText.Visibility = Visibility.Visible;
            });
        }
    }
}