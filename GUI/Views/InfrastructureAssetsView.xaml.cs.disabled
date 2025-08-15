using System.Windows;
using System.Windows.Controls;
using MandADiscoverySuite.ViewModels;

namespace MandADiscoverySuite.Views
{
    /// <summary>
    /// Interaction logic for InfrastructureAssetsView.xaml
    /// </summary>
    public partial class InfrastructureAssetsView : UserControl
    {
        public InfrastructureAssetsView()
        {
            InitializeComponent();
            
            // Set DataContext to InfrastructureAssetsViewModel
            var mainWindow = Application.Current.MainWindow;
            var mainViewModel = mainWindow?.DataContext as MainViewModel;
            DataContext = new InfrastructureAssetsViewModel(mainViewModel: mainViewModel);
        }
    }
}