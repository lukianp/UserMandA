using System.Windows.Controls;
using Microsoft.Extensions.Logging;
using MandADiscoverySuite.ViewModels;
using MandADiscoverySuite.Services;

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
            
            // Use the unified Groups ViewModel for security groups data
            var csvService = SimpleServiceLocator.Instance.GetService<CsvDataServiceNew>();
            var logger = SimpleServiceLocator.Instance.GetService<ILogger<GroupsViewModel>>();
            var profileService = SimpleServiceLocator.Instance.GetService<ProfileService>();
            
            var viewModel = new GroupsViewModel(csvService, logger, profileService);
            DataContext = viewModel;
            
            // Load data when view is loaded
            Loaded += async (s, e) => await viewModel.LoadAsync();
        }
    }
}