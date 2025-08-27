using System.Windows.Controls;
using MandADiscoverySuite.Services;
using MandADiscoverySuite.ViewModels;
using Microsoft.Extensions.Logging;

namespace MandADiscoverySuite.Views
{
    /// <summary>
    /// Interaction logic for DomainDiscoveryView.xaml
    /// </summary>
    public partial class DomainDiscoveryView : UserControl
    {
        public DomainDiscoveryView()
        {
            InitializeComponent();
            
            // Create dependencies using the unified pattern
            var loggerFactory = LoggerFactory.Create(builder => builder.AddDebug());
            var csvLogger = loggerFactory.CreateLogger<CsvDataServiceNew>();
            var vmLogger = loggerFactory.CreateLogger<DomainDiscoveryViewModel>();
            
            var csvService = new CsvDataServiceNew(csvLogger);
            var profileService = ProfileService.Instance;
            
            // Create and set proper ViewModel
            var vm = new DomainDiscoveryViewModel(csvService, vmLogger, profileService);
            DataContext = vm;
            
            // Load data when view loads
            Loaded += async (_, __) => await vm.LoadAsync();
        }
    }
}