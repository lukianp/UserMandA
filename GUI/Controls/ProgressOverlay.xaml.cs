using System.Windows.Controls;
using MandADiscoverySuite.ViewModels;

namespace MandADiscoverySuite.Controls
{
    /// <summary>
    /// Interaction logic for ProgressOverlay.xaml
    /// </summary>
    public partial class ProgressOverlay : UserControl
    {
        public ProgressOverlay()
        {
            InitializeComponent();
            DataContext = new ProgressOverlayViewModel();
        }

        /// <summary>
        /// Gets the progress overlay view model
        /// </summary>
        public ProgressOverlayViewModel ViewModel => DataContext as ProgressOverlayViewModel;
    }
}