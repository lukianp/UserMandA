using System.Windows.Controls;
using Microsoft.Extensions.Logging;
using MandADiscoverySuite.ViewModels;
using MandADiscoverySuite.Services;

namespace MandADiscoverySuite.Views
{
    /// <summary>
    /// Interaction logic for ApplicationInventoryView.xaml
    /// </summary>
    public partial class ApplicationInventoryView : UserControl
    {
        public ApplicationInventoryView()
        {
            // Create ViewModel with proper DI - following unified pattern
            var csvService = SimpleServiceLocator.Instance.GetService<CsvDataServiceNew>();
            var logger = SimpleServiceLocator.Instance.GetService<ILogger<ApplicationInventoryViewModel>>();
            var profileService = SimpleServiceLocator.Instance.GetService<ProfileService>();
            
            var viewModel = new ApplicationInventoryViewModel(csvService, logger, profileService);
            DataContext = viewModel;
            
            // Load data when view is loaded
            Loaded += async (s, e) => await viewModel.LoadAsync();
        }
    }
}