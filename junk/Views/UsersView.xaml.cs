using System.Windows.Controls;
using MandADiscoverySuite.Services;
using MandADiscoverySuite.ViewModels;
using Microsoft.Extensions.Logging;

namespace MandADiscoverySuite.Views
{
    /// <summary>
    /// Interaction logic for UsersView.xaml - converted to new architecture
    /// </summary>
    public partial class UsersView : UserControl
    {
        public UsersView()
        {
            InitializeComponent();
            
            // Create dependencies using the unified pattern
            var loggerFactory = LoggerFactory.Create(builder => builder.AddDebug());
            var csvLogger = loggerFactory.CreateLogger<CsvDataServiceNew>();
            var vmLogger = loggerFactory.CreateLogger<UsersViewModel>();
            
            var csvService = new CsvDataServiceNew(csvLogger);
            var profileService = ProfileService.Instance;
            
            // Create and set ViewModel
            var vm = new UsersViewModel(csvService, vmLogger, profileService);
            DataContext = vm;
            
            // Load data when view loads
            Loaded += async (_, __) => await vm.LoadAsync();
        }
    }
}