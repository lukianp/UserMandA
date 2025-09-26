using System;
using System.Windows;

namespace MandADiscoverySuite
{
    /// <summary>
    /// Minimal diagnostic version of MainWindow to test basic functionality
    /// </summary>
    public partial class MainWindowSimple : Window
    {
        public MainWindowSimple()
        {
            InitializeComponent();
            StatusText.Text = "Window loaded successfully!";
        }

        private void Button_Click(object sender, RoutedEventArgs e)
        {
            StatusText.Text = $"Button clicked at {DateTime.Now:HH:mm:ss}!";
            MessageBox.Show("Basic WPF functionality is working!", "Test Success", MessageBoxButton.OK, MessageBoxImage.Information);
        }
    }
}