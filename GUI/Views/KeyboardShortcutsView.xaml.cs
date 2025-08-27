using System.Windows;
using System.Windows.Controls;
using MandADiscoverySuite.ViewModels;

namespace MandADiscoverySuite.Views
{
    /// <summary>
    /// Interaction logic for KeyboardShortcutsView.xaml
    /// </summary>
    public partial class KeyboardShortcutsView : UserControl
    {
        public KeyboardShortcutsView()
        {
            InitializeComponent();
            DataContext = new KeyboardShortcutsViewModel();
        }

        private void CloseButton_Click(object sender, RoutedEventArgs e)
        {
            // Find the parent window and close it, or navigate back
            var window = Window.GetWindow(this);
            window?.Close();
        }
    }
}