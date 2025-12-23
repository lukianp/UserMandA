using System.Windows.Controls;
using MandADiscoverySuite.Services;
using MandADiscoverySuite.ViewModels;
using Microsoft.Extensions.Logging;

namespace MandADiscoverySuite.Views
{
    /// <summary>
    /// Interaction logic for AnalyticsView.xaml
    /// </summary>
    public partial class AnalyticsView : UserControl
    {
        public AnalyticsView()
        {
            InitializeComponent();
            
            // Create dependencies using the unified pattern
            var loggerFactory = LoggerFactory.Create(builder => builder.AddDebug());
            var vmLogger = loggerFactory.CreateLogger<AnalyticsViewModel>();
            var csvServiceLogger = loggerFactory.CreateLogger<CsvDataServiceNew>();
            
            // Create services
            var csvService = new CsvDataServiceNew(csvServiceLogger);
            var profileService = new ProfileService();
            
            // Create and set ViewModel
            var vm = new AnalyticsViewModel(csvService, vmLogger, profileService);
            DataContext = vm;
            
            // Load data when view loads
            Loaded += async (_, __) => await vm.LoadAsync();
        }
    }
}