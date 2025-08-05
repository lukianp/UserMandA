using System.Linq;
using System.Windows;
using System.Windows.Input;
using MandADiscoverySuite.Themes;
using MandADiscoverySuite.Services;
using MandADiscoverySuite.Models;

namespace MandADiscoverySuite
{
    public partial class CreateProfileDialog : Window
    {
        public string ProfileName { get; private set; } = "";
        public Models.CompanyProfile Profile { get; private set; }

        private bool _isEditMode = false;

        public CreateProfileDialog()
        {
            InitializeComponent();
            
            // Apply current theme
            ThemeManager.Instance.ApplyThemeToWindow(this);
            
            ProfileNameTextBox.Focus();
        }

        public CreateProfileDialog(CompanyProfile existingProfile) : this()
        {
            if (existingProfile != null)
            {
                _isEditMode = true;
                Profile = existingProfile;
                ProfileName = existingProfile.CompanyName;
                ProfileNameTextBox.Text = existingProfile.CompanyName;
                Title = "Edit Company Profile";
                CreateButton.Content = "Update";
            }
        }

        private void Create_Click(object sender, RoutedEventArgs e)
        {
            CreateButton.IsEnabled = false;
            
            var validationResult = InputValidationService.Instance.ValidateCompanyName(ProfileNameTextBox.Text);
            if (!validationResult.IsValid)
            {
                ShowValidationError(validationResult.GetSummaryMessage());
                CreateButton.IsEnabled = true;
                return;
            }

            ProfileName = ProfileNameTextBox.Text.Trim();
            
            if (_isEditMode)
            {
                // Update existing profile
                Profile.CompanyName = ProfileName;
                Profile.LastModified = System.DateTime.Now;
            }
            else
            {
                // Create new profile
                Profile = new CompanyProfile
                {
                    Id = System.Guid.NewGuid().ToString(),
                    CompanyName = ProfileName,
                    Created = System.DateTime.Now,
                    LastModified = System.DateTime.Now,
                    IsActive = true
                };
            }
            
            DialogResult = true;
            CreateButton.IsEnabled = true;
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
                var input = ProfileNameTextBox.Text;
                var validationResult = InputValidationService.Instance.ValidateCompanyName(input);
                
                if (!validationResult.IsValid)
                {
                    ShowValidationError(validationResult.GetSummaryMessage());
                }
                else if (validationResult.HasWarnings)
                {
                    ShowValidationWarning(validationResult.GetSummaryMessage());
                }
                else
                {
                    ShowValidationSuccess(validationResult.GetSummaryMessage());
                }
            }
            catch (System.Exception ex)
            {
                var errorMessage = ErrorHandlingService.Instance.HandleException(ex, "Profile name validation");
                ShowValidationError(errorMessage);
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

        private void ShowValidationWarning(string message)
        {
            Dispatcher.Invoke(() =>
            {
                ProfileNameTextBox.BorderBrush = new System.Windows.Media.SolidColorBrush(System.Windows.Media.Color.FromRgb(237, 137, 54));
                ProfileNameTextBox.BorderThickness = new Thickness(2);
                ProfileNameTextBox.Background = new System.Windows.Media.SolidColorBrush(System.Windows.Media.Color.FromRgb(45, 55, 72));
                ProfileNameValidationText.Foreground = new System.Windows.Media.SolidColorBrush(System.Windows.Media.Color.FromRgb(237, 137, 54));
                ProfileNameValidationText.Text = $"⚠️ {message}";
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