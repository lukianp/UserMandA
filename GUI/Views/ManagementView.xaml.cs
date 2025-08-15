using System.Windows.Controls;
using MandADiscoverySuite.ViewModels;

namespace MandADiscoverySuite.Views
{
    /// <summary>
    /// Interaction logic for ManagementView.xaml
    /// </summary>
    public partial class ManagementView : UserControl
    {
        public ManagementView()
        {
            InitializeComponent();
            
            // Set DataContext and wire up the Loaded event for LoadAsync
            var viewModel = new ManagementViewModel();
            DataContext = viewModel;
            Loaded += async (_, __) => await viewModel.LoadAsync();
        }
    }
}