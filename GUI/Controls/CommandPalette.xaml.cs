using System.Windows;
using System.Windows.Controls;
using System.Windows.Input;
using MandADiscoverySuite.ViewModels;

namespace MandADiscoverySuite.Controls
{
    /// <summary>
    /// Interaction logic for CommandPalette.xaml
    /// </summary>
    public partial class CommandPalette : UserControl
    {
        public CommandPalette()
        {
            InitializeComponent();
        }

        private void SearchTextBox_KeyDown(object sender, KeyEventArgs e)
        {
            var viewModel = DataContext as CommandPaletteViewModel;
            if (viewModel == null) return;

            switch (e.Key)
            {
                case Key.Down:
                    viewModel.MoveSelectionDown();
                    e.Handled = true;
                    break;
                case Key.Up:
                    viewModel.MoveSelectionUp();
                    e.Handled = true;
                    break;
                case Key.Enter:
                    viewModel.ExecuteSelectedCommand();
                    e.Handled = true;
                    break;
                case Key.Escape:
                    viewModel.Close();
                    e.Handled = true;
                    break;
            }
        }

        public void FocusSearchBox()
        {
            SearchTextBox.Focus();
            SearchTextBox.SelectAll();
        }
    }
}