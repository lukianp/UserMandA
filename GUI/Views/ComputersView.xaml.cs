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
            
            // DataContext will be set by the tab navigation system when ComputersViewModel is created
            // Don't create ComputersViewModel here to avoid overriding the tab system's DataContext
        }
    }
}