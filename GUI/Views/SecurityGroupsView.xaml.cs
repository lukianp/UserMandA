using System.Windows.Controls;
using MandADiscoverySuite.ViewModels;
using MandADiscoverySuite.Services;
using System.Windows;

namespace MandADiscoverySuite.Views
{
    /// <summary>
    /// Interaction logic for SecurityGroupsView.xaml
    /// </summary>
    public partial class SecurityGroupsView : UserControl
    {
        public SecurityGroupsView()
        {
            InitializeComponent();
            var csvDataService = SimpleServiceLocator.GetService<CsvDataService>();
            var mainViewModel = (MainViewModel)Application.Current.MainWindow?.DataContext;
            DataContext = new SecurityGroupsViewModel(csvDataService, mainViewModel);
        }
    }
}