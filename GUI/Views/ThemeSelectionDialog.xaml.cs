using System;
using System.Windows;
using MandADiscoverySuite.Services;
using MandADiscoverySuite.Themes;

namespace MandADiscoverySuite.Views
{
    /// <summary>
    /// Dialog for selecting and configuring application theme
    /// </summary>
    public partial class ThemeSelectionDialog : Window
    {
        public ThemeSelectionDialog()
        {
            InitializeComponent();
            LoadCurrentSettings();
            
            // Wire up font size slider event
            FontSizeSlider.ValueChanged += FontSizeSlider_ValueChanged;
        }

        public ThemeType SelectedTheme { get; private set; } = ThemeType.Dark;
        public bool UseSystemTheme { get; private set; } = false;
        public bool ReducedMotion { get; private set; } = false;
        public double FontScale { get; private set; } = 1.0;

        private void LoadCurrentSettings()
        {
            try
            {
                // Load current theme from configuration
                var configService = ConfigurationService.Instance;
                var currentTheme = configService.Settings.Theme;
                
                // Set current theme selection
                switch (currentTheme?.ToLower())
                {
                    case "light":
                        LightThemeRadio.IsChecked = true;
                        SelectedTheme = ThemeType.Light;
                        break;
                    case "highcontrast":
                        HighContrastThemeRadio.IsChecked = true;
                        SelectedTheme = ThemeType.HighContrast;
                        break;
                    default:
                        DarkThemeRadio.IsChecked = true;
                        SelectedTheme = ThemeType.Dark;
                        break;
                }

                // Load other settings
                UseSystemThemeCheckBox.IsChecked = configService.Settings.UseSystemTheme;
                ReducedMotionCheckBox.IsChecked = configService.Settings.ReduceMotion;
                FontSizeSlider.Value = configService.Settings.FontSize;
                UpdateFontSizeLabel();
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Error loading theme settings: {ex.Message}");
                // Use defaults if loading fails
                DarkThemeRadio.IsChecked = true;
                SelectedTheme = ThemeType.Dark;
            }
        }

        private void FontSizeSlider_ValueChanged(object sender, RoutedPropertyChangedEventArgs<double> e)
        {
            UpdateFontSizeLabel();
        }

        private void UpdateFontSizeLabel()
        {
            if (FontSizeLabel != null)
            {
                var percentage = (int)(FontSizeSlider.Value * 100);
                FontSizeLabel.Text = $"{percentage}%";
            }
        }

        private void ApplyButton_Click(object sender, RoutedEventArgs e)
        {
            try
            {
                // Determine selected theme
                if (LightThemeRadio.IsChecked == true)
                {
                    SelectedTheme = ThemeType.Light;
                }
                else if (HighContrastThemeRadio.IsChecked == true)
                {
                    SelectedTheme = ThemeType.HighContrast;
                }
                else
                {
                    SelectedTheme = ThemeType.Dark;
                }

                // Get additional settings
                UseSystemTheme = UseSystemThemeCheckBox.IsChecked == true;
                ReducedMotion = ReducedMotionCheckBox.IsChecked == true;
                FontScale = FontSizeSlider.Value;

                // Apply theme immediately
                var themeManager = ThemeManager.Instance;
                themeManager.ApplyTheme(SelectedTheme);

                // Save settings
                var configService = ConfigurationService.Instance;
                configService.Settings.Theme = SelectedTheme.ToString();
                configService.Settings.UseSystemTheme = UseSystemTheme;
                configService.Settings.ReduceMotion = ReducedMotion;
                configService.Settings.FontSize = FontScale;
                
                // Save settings asynchronously
                _ = configService.SaveSettingsAsync();

                DialogResult = true;
                Close();
            }
            catch (Exception ex)
            {
                MessageBox.Show($"Error applying theme: {ex.Message}", "Theme Error", 
                    MessageBoxButton.OK, MessageBoxImage.Warning);
            }
        }

        private void CancelButton_Click(object sender, RoutedEventArgs e)
        {
            DialogResult = false;
            Close();
        }
    }
}