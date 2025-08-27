using System.Windows;
using System.Windows.Input;
using MandADiscoverySuite.ViewModels;

namespace MandADiscoverySuite.Views
{
    /// <summary>
    /// Interaction logic for ColumnChooserDialog.xaml
    /// </summary>
    public partial class ColumnChooserDialog : Window
    {
        public ColumnChooserDialog()
        {
            InitializeComponent();
            Loaded += OnLoaded;
        }

        private void OnLoaded(object sender, RoutedEventArgs e)
        {
            if (DataContext is ColumnChooserViewModel viewModel)
            {
                viewModel.CloseRequested += OnCloseRequested;
                
                // Enable double-click to show/hide columns
                AvailableColumnsListBox.MouseDoubleClick += AvailableColumnsListBox_MouseDoubleClick;
                VisibleColumnsListBox.MouseDoubleClick += VisibleColumnsListBox_MouseDoubleClick;
            }
        }

        private void OnCloseRequested(object sender, bool result)
        {
            DialogResult = result;
            Close();
        }

        private void AvailableColumnsListBox_MouseDoubleClick(object sender, MouseButtonEventArgs e)
        {
            if (DataContext is ColumnChooserViewModel viewModel && viewModel.ShowColumnCommand.CanExecute(null))
            {
                viewModel.ShowColumnCommand.Execute(null);
            }
        }

        private void VisibleColumnsListBox_MouseDoubleClick(object sender, MouseButtonEventArgs e)
        {
            if (DataContext is ColumnChooserViewModel viewModel && viewModel.HideColumnCommand.CanExecute(null))
            {
                viewModel.HideColumnCommand.Execute(null);
            }
        }

        protected override void OnClosed(System.EventArgs e)
        {
            if (DataContext is ColumnChooserViewModel viewModel)
            {
                viewModel.CloseRequested -= OnCloseRequested;
            }
            
            base.OnClosed(e);
        }
    }
}