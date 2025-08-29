using System;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Input;
using MandADiscoverySuite.ViewModels;

namespace MandADiscoverySuite
{
    /// <summary>
    /// Minimal MainWindow code-behind for build compatibility
    /// </summary>
    public partial class MainWindow : Window
    {
        public MainViewModel ViewModel { get; private set; }

        public MainWindow()
        {
            try
            {
                InitializeComponent();
                
                // Defer complex initialization to prevent BeginInit conflicts
                Loaded += MainWindow_Loaded;
            }
            catch (Exception ex)
            {
                MessageBox.Show($"Failed to initialize MainWindow: {ex.Message}", "Error", MessageBoxButton.OK, MessageBoxImage.Error);
                Application.Current?.Shutdown(1);
            }
        }

        private void MainWindow_Loaded(object sender, RoutedEventArgs e)
        {
            try
            {
                // Initialize ViewModel after the window is fully loaded to prevent BeginInit conflicts
                ViewModel = new MainViewModel();
                DataContext = ViewModel;
                
                // For now, skip TabControl initialization to prevent BeginInit crash
                // ViewModel.InitializeTabControl(MainTabControl);
                
                // Add a simple tab for testing
                var testTab = new TabItem
                {
                    Header = "Dashboard",
                    Content = new TextBlock
                    {
                        Text = "M&A Discovery Suite - BeginInit fix successful!",
                        HorizontalAlignment = HorizontalAlignment.Center,
                        VerticalAlignment = VerticalAlignment.Center,
                        FontSize = 16,
                        Foreground = System.Windows.Media.Brushes.White
                    }
                };
                MainTabControl.Items.Add(testTab);
                MainTabControl.SelectedItem = testTab;
            }
            catch (Exception ex)
            {
                MessageBox.Show($"Failed to initialize MainWindow after loading: {ex.Message}", "Error", MessageBoxButton.OK, MessageBoxImage.Error);
                Application.Current?.Shutdown(1);
            }
        }

        // XAML event handler stubs for compilation
        private void HelpButton_Click(object sender, RoutedEventArgs e) 
        { 
            ShowKeyboardShortcuts();
        }
        
        /// <summary>
        /// Show keyboard shortcuts dialog
        /// </summary>
        private void ShowKeyboardShortcuts()
        {
            var shortcuts = @"M&A Discovery Suite - Keyboard Shortcuts

Navigation:
F1 - Dashboard
F2 - Discovery
F3 - Users
F4 - Groups  
F5 - Infrastructure
F6 - Start Discovery
F9 - Settings
F10 - Reports

General:
Ctrl+T - New Tab
Ctrl+W - Close Tab
Ctrl+R - Refresh Data
Ctrl+F - Search/Filter
Ctrl+E - Export Results
Ctrl+P - Print Preview
Ctrl+S - Save/Export

Theme:
Ctrl+Alt+T - Toggle Theme

Window:
Ctrl+Shift+P - Command Palette
F11 - Full Screen
Esc - Close Dialog

Company Profiles:
Ctrl+N - New Profile
Ctrl+D - Delete Profile
Ctrl+Shift+S - Switch Profile

Discovery:
Ctrl+Shift+D - Start Discovery
Ctrl+Shift+R - Run Module
Ctrl+Shift+E - Export Discovery

Help:
F1 - This Help Dialog";

            MessageBox.Show(shortcuts, "Keyboard Shortcuts - M&A Discovery Suite", 
                MessageBoxButton.OK, MessageBoxImage.Information);
        }
        private void NetworkRangesTextBox_TextChanged(object sender, TextChangedEventArgs e) { }
        private void TimeoutTextBox_TextChanged(object sender, TextChangedEventArgs e) { }
        private void ThreadsTextBox_TextChanged(object sender, TextChangedEventArgs e) { }
        private void AppSearchBox_TextChanged(object sender, TextChangedEventArgs e) { }
        private void AppFilterCombo_SelectionChanged(object sender, SelectionChangedEventArgs e) { }
        private void VulnerabilitiesColumnChooser_Click(object sender, RoutedEventArgs e) { }
        private void CommandPaletteOverlay_MouseDown(object sender, MouseButtonEventArgs e) { }
        private void WaveDropZone_Drop(object sender, DragEventArgs e) { }
        private void WaveDropZone_DragOver(object sender, DragEventArgs e) { }
        private void WaveDropZone_DragLeave(object sender, DragEventArgs e) { }
        private void MainWindow_KeyDown(object sender, KeyEventArgs e)
        {
            try
            {
                if (e.Key == Key.F10)
                {
                    var win = new Windows.TargetProfilesWindow { Owner = this };
                    win.ShowDialog();
                }
            }
            catch (Exception ex)
            {
                MessageBox.Show($"Error opening Target Profiles: {ex.Message}");
            }
        }
        private void Window_Closing(object sender, System.ComponentModel.CancelEventArgs e) { }
        private void WavesDataGrid_Drop(object sender, DragEventArgs e) { }
        private void WavesDataGrid_DragOver(object sender, DragEventArgs e) { }
        private void WavesDataGrid_MouseMove(object sender, MouseEventArgs e) { }
        private void WavesDataGrid_PreviewMouseLeftButtonDown(object sender, MouseButtonEventArgs e) { }
    }
}
