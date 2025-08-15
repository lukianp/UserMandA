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
                ViewModel = new MainViewModel();
                DataContext = ViewModel;
                
                // Initialize TabControl with the MainViewModel for proper navigation
                ViewModel.InitializeTabControl(MainTabControl);
            }
            catch (Exception ex)
            {
                MessageBox.Show($"Failed to initialize MainWindow: {ex.Message}", "Error", MessageBoxButton.OK, MessageBoxImage.Error);
                Application.Current?.Shutdown(1);
            }
        }

        // XAML event handler stubs for compilation
        private void HelpButton_Click(object sender, RoutedEventArgs e) { }
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
        private void MainWindow_KeyDown(object sender, KeyEventArgs e) { }
        private void Window_Closing(object sender, System.ComponentModel.CancelEventArgs e) { }
        private void WavesDataGrid_Drop(object sender, DragEventArgs e) { }
        private void WavesDataGrid_DragOver(object sender, DragEventArgs e) { }
        private void WavesDataGrid_MouseMove(object sender, MouseEventArgs e) { }
        private void WavesDataGrid_PreviewMouseLeftButtonDown(object sender, MouseButtonEventArgs e) { }
    }
}