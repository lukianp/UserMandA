using System.Windows;
using MandADiscoverySuite.ViewModels;

namespace MandADiscoverySuite.Windows
{
    /// <summary>
    /// Interaction logic for ComputerDetailWindow.xaml
    /// </summary>
    public partial class ComputerDetailWindow : Window
    {
        public ComputerDetailWindow()
        {
            InitializeComponent();
            
            // Subscribe to the ViewModel's CloseRequested event if available
            DataContextChanged += ComputerDetailWindow_DataContextChanged;
        }

        private void ComputerDetailWindow_DataContextChanged(object sender, DependencyPropertyChangedEventArgs e)
        {
            if (e.NewValue is ComputerDetailViewModel viewModel)
            {
                // Subscribe to close event from ViewModel
                viewModel.CloseRequested += () => Close();
            }
        }

        private void CloseButton_Click(object sender, RoutedEventArgs e)
        {
            Close();
        }
    }
}