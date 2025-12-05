using System.Windows.Controls;
using Microsoft.Extensions.Logging;
using MandADiscoverySuite.ViewModels;
using MandADiscoverySuite.Services;

namespace MandADiscoverySuite.Views
{
    /// <summary>
    /// Interaction logic for InfrastructureAssetsView.xaml
    /// NOTE: Assets functionality has been deprecated and merged into ComputersView
    /// This view is kept for backwards compatibility but should redirect users to ComputersView
    /// </summary>
    public partial class InfrastructureAssetsView : UserControl
    {
        public InfrastructureAssetsView()
        {
            InitializeComponent();
            
            // Create services directly instead of using SimpleServiceLocator
            var loggerFactory = LoggerFactory.Create(builder => builder.AddDebug());
            var csvLogger = loggerFactory.CreateLogger<CsvDataServiceNew>();
            var vmLogger = loggerFactory.CreateLogger<InfrastructureViewModel>();
            
            var csvService = new CsvDataServiceNew(csvLogger);
            var profileService = ProfileService.Instance;
            
            var viewModel = new InfrastructureViewModel(csvService, vmLogger, profileService);
            DataContext = viewModel;
            
            // Load data when view is loaded
            Loaded += async (s, e) => await viewModel.LoadAsync();
        }
    }
}