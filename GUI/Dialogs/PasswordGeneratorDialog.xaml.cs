using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using System.Windows;
using System.Windows.Controls;
using MandADiscoverySuite.Themes;
using MandADiscoverySuite.Services;

namespace MandADiscoverySuite.Dialogs
{
    public partial class PasswordGeneratorDialog : Window
    {
        public string GeneratedPassword { get; private set; } = "";
        
        private readonly char[] UppercaseChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".ToCharArray();
        private readonly char[] LowercaseChars = "abcdefghijklmnopqrstuvwxyz".ToCharArray();
        private readonly char[] NumberChars = "0123456789".ToCharArray();
        private readonly char[] SymbolChars = "!@#$%^&*()_+-=[]{}|;:,.<>?".ToCharArray();
        private readonly char[] AmbiguousChars = "0oO1lI".ToCharArray();

        public PasswordGeneratorDialog()
        {
            InitializeComponent();
            
            // Apply current theme
            ThemeManager.Instance.ApplyThemeToWindow(this);
            
            GeneratePassword();
        }

        private void LengthSlider_ValueChanged(object sender, RoutedPropertyChangedEventArgs<double> e)
        {
            if (LengthDisplay != null)
            {
                LengthDisplay.Text = ((int)e.NewValue).ToString();
                GeneratePassword();
            }
        }

        private void UpdatePassword(object sender, RoutedEventArgs e)
        {
            GeneratePassword();
        }

        private void GenerateNew_Click(object sender, RoutedEventArgs e)
        {
            GeneratePassword();
        }

        private void GenerateMultiple_Click(object sender, RoutedEventArgs e)
        {
            var passwords = new List<string>();
            for (int i = 0; i < 10; i++)
            {
                passwords.Add(GenerateNewPassword());
            }
            
            MultiplePasswordsList.ItemsSource = passwords;
            MultiplePasswordsPanel.Visibility = Visibility.Visible;
        }

        private void CopyPassword_Click(object sender, RoutedEventArgs e)
        {
            try
            {
                Clipboard.SetText(GeneratedPasswordTextBox.Text);
                UpdateStatus("Password copied to clipboard!");
            }
            catch (Exception ex)
            {
                ErrorHandlingService.Instance.HandleException(ex, "Copying password to clipboard", true);
            }
        }

        private void CopyIndividualPassword_Click(object sender, RoutedEventArgs e)
        {
            if (sender is Button button && button.Tag is string password)
            {
                try
                {
                    Clipboard.SetText(password);
                    UpdateStatus($"Password copied to clipboard!");
                }
                catch (Exception ex)
                {
                    ErrorHandlingService.Instance.HandleException(ex, "Copying individual password to clipboard", true);
                }
            }
        }

        private void SaveToFile_Click(object sender, RoutedEventArgs e)
        {
            try
            {
                var saveDialog = new Microsoft.Win32.SaveFileDialog()
                {
                    Filter = "Text files (*.txt)|*.txt|All files (*.*)|*.*",
                    FileName = $"Generated_Passwords_{DateTime.Now:yyyyMMdd_HHmmss}.txt"
                };

                if (saveDialog.ShowDialog() == true)
                {
                    var passwords = new List<string>();
                    
                    if (MultiplePasswordsList.ItemsSource is List<string> multiplePasswords)
                    {
                        passwords.AddRange(multiplePasswords);
                    }
                    else
                    {
                        passwords.Add(GeneratedPasswordTextBox.Text);
                    }

                    var content = new StringBuilder();
                    content.AppendLine("Generated Passwords");
                    content.AppendLine($"Created: {DateTime.Now}");
                    content.AppendLine($"Length: {(int)LengthSlider.Value}");
                    content.AppendLine($"Uppercase: {UppercaseCheckBox.IsChecked}");
                    content.AppendLine($"Lowercase: {LowercaseCheckBox.IsChecked}");
                    content.AppendLine($"Numbers: {NumbersCheckBox.IsChecked}");
                    content.AppendLine($"Symbols: {SymbolsCheckBox.IsChecked}");
                    content.AppendLine($"Exclude Ambiguous: {ExcludeAmbiguousCheckBox.IsChecked}");
                    content.AppendLine();
                    content.AppendLine("Passwords:");
                    
                    foreach (var password in passwords)
                    {
                        content.AppendLine(password);
                    }

                    File.WriteAllText(saveDialog.FileName, content.ToString());
                    UpdateStatus($"Passwords saved to {Path.GetFileName(saveDialog.FileName)}");
                }
            }
            catch (Exception ex)
            {
                ErrorHandlingService.Instance.HandleException(ex, "Saving passwords to file", true);
            }
        }

        private void UsePassword_Click(object sender, RoutedEventArgs e)
        {
            GeneratedPassword = GeneratedPasswordTextBox.Text;
            DialogResult = true;
            Close();
        }

        private void Close_Click(object sender, RoutedEventArgs e)
        {
            DialogResult = false;
            Close();
        }

        private void GeneratePassword()
        {
            var newPassword = GenerateNewPassword();
            GeneratedPasswordTextBox.Text = newPassword;
            EvaluatePasswordStrength(newPassword);
        }

        private string GenerateNewPassword()
        {
            var availableChars = new List<char>();
            var requiredChars = new List<char>();

            // Build character set and ensure at least one from each selected category
            if (UppercaseCheckBox?.IsChecked == true)
            {
                var upperChars = ExcludeAmbiguousCheckBox?.IsChecked == true 
                    ? UppercaseChars.Except(AmbiguousChars).ToArray() 
                    : UppercaseChars;
                availableChars.AddRange(upperChars);
                requiredChars.Add(upperChars[GetSecureRandomNumber(upperChars.Length)]);
            }

            if (LowercaseCheckBox?.IsChecked == true)
            {
                var lowerChars = ExcludeAmbiguousCheckBox?.IsChecked == true 
                    ? LowercaseChars.Except(AmbiguousChars).ToArray() 
                    : LowercaseChars;
                availableChars.AddRange(lowerChars);
                requiredChars.Add(lowerChars[GetSecureRandomNumber(lowerChars.Length)]);
            }

            if (NumbersCheckBox?.IsChecked == true)
            {
                var numberChars = ExcludeAmbiguousCheckBox?.IsChecked == true 
                    ? NumberChars.Except(AmbiguousChars).ToArray() 
                    : NumberChars;
                availableChars.AddRange(numberChars);
                requiredChars.Add(numberChars[GetSecureRandomNumber(numberChars.Length)]);
            }

            if (SymbolsCheckBox?.IsChecked == true)
            {
                availableChars.AddRange(SymbolChars);
                requiredChars.Add(SymbolChars[GetSecureRandomNumber(SymbolChars.Length)]);
            }

            if (availableChars.Count == 0)
            {
                return "Error: No character types selected";
            }

            var length = (int)(LengthSlider?.Value ?? 12);
            var password = new char[length];
            
            // Place required characters first
            for (int i = 0; i < requiredChars.Count && i < length; i++)
            {
                password[i] = requiredChars[i];
            }

            // Fill remaining positions
            for (int i = requiredChars.Count; i < length; i++)
            {
                password[i] = availableChars[GetSecureRandomNumber(availableChars.Count)];
            }

            // Shuffle the password
            for (int i = password.Length - 1; i > 0; i--)
            {
                int j = GetSecureRandomNumber(i + 1);
                (password[i], password[j]) = (password[j], password[i]);
            }

            return new string(password);
        }

        private int GetSecureRandomNumber(int maxValue)
        {
            using (var rng = RandomNumberGenerator.Create())
            {
                var bytes = new byte[4];
                rng.GetBytes(bytes);
                return Math.Abs(BitConverter.ToInt32(bytes, 0)) % maxValue;
            }
        }

        private void EvaluatePasswordStrength(string password)
        {
            var score = 0;
            var feedback = new List<string>();

            // Length scoring
            if (password.Length >= 12) { score += 25; feedback.Add("✅ Good length"); }
            else if (password.Length >= 8) { score += 15; feedback.Add("⚠️ Adequate length"); }
            else { feedback.Add("❌ Too short"); }

            // Character variety scoring
            if (password.Any(char.IsUpper)) { score += 15; feedback.Add("✅ Contains uppercase"); }
            if (password.Any(char.IsLower)) { score += 15; feedback.Add("✅ Contains lowercase"); }
            if (password.Any(char.IsDigit)) { score += 15; feedback.Add("✅ Contains numbers"); }
            if (password.Any(c => SymbolChars.Contains(c))) { score += 20; feedback.Add("✅ Contains symbols"); }

            // Complexity bonus
            if (password.Length >= 16) score += 10;

            // Update UI
            StrengthProgressBar.Value = Math.Min(100, score);
            
            string strengthLabel;
            string strengthColor;
            
            if (score >= 80) { strengthLabel = "Very Strong"; strengthColor = "#48BB78"; }
            else if (score >= 60) { strengthLabel = "Strong"; strengthColor = "#48BB78"; }
            else if (score >= 40) { strengthLabel = "Medium"; strengthColor = "#ED8936"; }
            else if (score >= 20) { strengthLabel = "Weak"; strengthColor = "#FF6B6B"; }
            else { strengthLabel = "Very Weak"; strengthColor = "#E53E3E"; }

            StrengthLabel.Text = strengthLabel;
            StrengthLabel.Foreground = new System.Windows.Media.SolidColorBrush(
                (System.Windows.Media.Color)System.Windows.Media.ColorConverter.ConvertFromString(strengthColor));
            
            StrengthProgressBar.Foreground = new System.Windows.Media.SolidColorBrush(
                (System.Windows.Media.Color)System.Windows.Media.ColorConverter.ConvertFromString(strengthColor));

            StrengthDetails.Text = string.Join(", ", feedback);
        }

        private void UpdateStatus(string message)
        {
            // This could update a status bar or show a temporary notification
            // For now, we'll just update the title briefly
            var originalTitle = Title;
            Title = message;
            
            var timer = new System.Windows.Threading.DispatcherTimer();
            timer.Interval = TimeSpan.FromSeconds(3);
            timer.Tick += (s, e) =>
            {
                Title = originalTitle;
                timer.Stop();
            };
            timer.Start();
        }
    }
}