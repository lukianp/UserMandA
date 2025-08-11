using System.Windows;
using System.Windows.Controls;
using MandADiscoverySuite.ViewModels;
using MandADiscoverySuite.Services;

namespace MandADiscoverySuite.Views
{
    /// <summary>
    /// Interaction logic for UsersView.xaml
    /// </summary>
    public partial class UsersView : UserControl
    {
        public UsersView()
        {
            InitializeComponent();
            
            // DataContext will be set by the DataTemplate binding in MainWindow
            // Don't create our own UsersViewModel here as it conflicts with the MainViewModel's tab system
        }
    }
}