#nullable enable

using System;
using System.Windows;
using System.Windows.Controls;
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
            Loaded += OnLoaded;
            LoadCurrentSettings();
        }

        private void OnLoaded(object sender, RoutedEventArgs e)
        {
            var fontSizeSlider = this.FindName("FontSizeSlider") as Slider;
            if (fontSizeSlider != null)
            {
                fontSizeSlider.ValueChanged += FontSizeSlider_ValueChanged;
            }
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
                        var lightThemeRadio = this.FindName("LightThemeRadio") as RadioButton;
                        if (lightThemeRadio != null) lightThemeRadio.IsChecked = true;
                        SelectedTheme = ThemeType.Light;
                        break;
                    case "highcontrast":
                        var highContrastThemeRadio = this.FindName("HighContrastThemeRadio") as RadioButton;
                        if (highContrastThemeRadio != null) highContrastThemeRadio.IsChecked = true;
                        SelectedTheme = ThemeType.HighContrast;
                        break;
                    default:
                        var darkThemeRadio = this.FindName("DarkThemeRadio") as RadioButton;
                        if (darkThemeRadio != null) darkThemeRadio.IsChecked = true;
                        SelectedTheme = ThemeType.Dark;
                        break;
                }

                // Load other settings
                var useSystemThemeCheckBox = this.FindName("UseSystemThemeCheckBox") as CheckBox;
                if (useSystemThemeCheckBox != null) useSystemThemeCheckBox.IsChecked = configService.Settings.UseSystemTheme;

                var reducedMotionCheckBox = this.FindName("ReducedMotionCheckBox") as CheckBox;
                if (reducedMotionCheckBox != null) reducedMotionCheckBox.IsChecked = configService.Settings.ReduceMotion;

                var fontSizeSlider = this.FindName("FontSizeSlider") as Slider;
                if (fontSizeSlider != null) fontSizeSlider.Value = configService.Settings.FontSize;

                UpdateFontSizeLabel();
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Error loading theme settings: {ex.Message}");
                // Use defaults if loading fails
                var darkThemeRadio = this.FindName("DarkThemeRadio") as RadioButton;
                if (darkThemeRadio != null) darkThemeRadio.IsChecked = true;
                SelectedTheme = ThemeType.Dark;
            }
        }

        private void FontSizeSlider_ValueChanged(object sender, RoutedPropertyChangedEventArgs<double> e)
        {
            UpdateFontSizeLabel();
        }

        private void UpdateFontSizeLabel()
        {
            var fontSizeLabel = this.FindName("FontSizeLabel") as TextBlock;
            var fontSizeSlider = this.FindName("FontSizeSlider") as Slider;
            if (fontSizeLabel != null && fontSizeSlider != null)
            {
                var percentage = (int)(fontSizeSlider.Value * 100);
                fontSizeLabel.Text = $"{percentage}%";
            }
        }

        private void ApplyButton_Click(object sender, RoutedEventArgs e)
        {
            try
            {
                // Determine selected theme
                var lightThemeRadio = this.FindName("LightThemeRadio") as RadioButton;
                var highContrastThemeRadio = this.FindName("HighContrastThemeRadio") as RadioButton;

                if (lightThemeRadio?.IsChecked == true)
                {
                    SelectedTheme = ThemeType.Light;
                }
                else if (highContrastThemeRadio?.IsChecked == true)
                {
                    SelectedTheme = ThemeType.HighContrast;
                }
                else
                {
                    SelectedTheme = ThemeType.Dark;
                }

                // Get additional settings
                var useSystemThemeCheckBox = this.FindName("UseSystemThemeCheckBox") as CheckBox;
                var reducedMotionCheckBox = this.FindName("ReducedMotionCheckBox") as CheckBox;
                var fontSizeSlider = this.FindName("FontSizeSlider") as Slider;

                UseSystemTheme = useSystemThemeCheckBox?.IsChecked == true;
                ReducedMotion = reducedMotionCheckBox?.IsChecked == true;
                FontScale = fontSizeSlider?.Value ?? 1.0;

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