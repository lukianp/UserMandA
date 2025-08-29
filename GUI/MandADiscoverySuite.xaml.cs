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
                // EMERGENCY SIMPLIFIED CONSTRUCTOR - NO COMPLEX INITIALIZATION
                InitializeComponent();
                
                // Defer ViewModel initialization to prevent any BeginInit conflicts
                Loaded += MainWindow_Loaded;
                
                // Set window properties directly to avoid binding issues
                Title = "M&A Discovery Suite - EMERGENCY SIMPLIFIED VERSION";
            }
            catch (Exception ex)
            {
                MessageBox.Show($"CRITICAL: Failed to initialize MainWindow: {ex.Message}\n\nStack Trace:\n{ex.StackTrace}", 
                    "Emergency Simplified Mode - Initialization Error", MessageBoxButton.OK, MessageBoxImage.Error);
                Application.Current?.Shutdown(1);
            }
        }

        private void MainWindow_Loaded(object sender, RoutedEventArgs e)
        {
            try
            {
                // EMERGENCY SIMPLIFIED LOADED EVENT - MINIMAL INITIALIZATION ONLY
                
                // Create ViewModel safely after full window load
                ViewModel = new MainViewModel();
                DataContext = ViewModel;
                
                // Set Dashboard tab as default - TabControl is now completely static
                if (MainTabControl?.Items?.Count > 0)
                {
                    MainTabControl.SelectedIndex = 0;
                }
                
                // Log successful initialization
                System.Diagnostics.Debug.WriteLine($"[EMERGENCY MODE] MainWindow loaded successfully at {DateTime.Now}");
                
                // Update window title to show success
                Title = "M&A Discovery Suite - EMERGENCY SIMPLIFIED VERSION ✅ LOADED SUCCESSFULLY";
            }
            catch (Exception ex)
            {
                MessageBox.Show($"CRITICAL: Failed to initialize MainWindow after loading: {ex.Message}\n\nStack Trace:\n{ex.StackTrace}", 
                    "Emergency Simplified Mode - Post-Load Error", MessageBoxButton.OK, MessageBoxImage.Error);
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
