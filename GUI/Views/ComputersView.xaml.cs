using System.Windows;
using System.Windows.Controls;
using MandADiscoverySuite.ViewModels;

namespace MandADiscoverySuite.Views
{
    /// <summary>
    /// Interaction logic for ComputersView.xaml
    /// </summary>
    public partial class ComputersView : UserControl
    {
        public ComputersView()
        {
            InitializeComponent();
            
            // Set DataContext to ComputersViewModel as per original instructions
            // Get the MainViewModel from the main window if available
            var mainWindow = Application.Current.MainWindow;
            var mainViewModel = mainWindow?.DataContext as MainViewModel;
            
            DataContext = new ComputersViewModel(mainViewModel: mainViewModel);
        }
    }
}