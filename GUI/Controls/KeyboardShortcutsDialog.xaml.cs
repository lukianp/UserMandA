using System.Windows;
using MandADiscoverySuite.ViewModels;

namespace MandADiscoverySuite.Controls
{
    /// <summary>
    /// Interaction logic for KeyboardShortcutsDialog.xaml
    /// </summary>
    public partial class KeyboardShortcutsDialog : Window
    {
        public KeyboardShortcutsDialog()
        {
            InitializeComponent();
            DataContext = new KeyboardShortcutsDialogViewModel();
        }

        private void CloseButton_Click(object sender, RoutedEventArgs e)
        {
            Close();
        }
    }
}