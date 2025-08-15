using System.Windows.Controls;
using MandADiscoverySuite.Services;
using MandADiscoverySuite.ViewModels;
using Microsoft.Extensions.Logging;

namespace MandADiscoverySuite.Views
{
    /// <summary>
    /// Interaction logic for UsersViewNew.xaml
    /// </summary>
    public partial class UsersViewNew : UserControl
    {
        public UsersViewNew()
        {
            InitializeComponent();
            
            // Create dependencies
            var loggerFactory = LoggerFactory.Create(builder => builder.AddDebug());
            var csvLogger = loggerFactory.CreateLogger<CsvDataServiceNew>();
            var vmLogger = loggerFactory.CreateLogger<UsersViewModelNew>();
            
            var csvService = new CsvDataServiceNew(csvLogger);
            var profileService = ProfileService.Instance;
            
            // Create and set ViewModel
            var vm = new UsersViewModelNew(csvService, vmLogger, profileService);
            DataContext = vm;
            
            // Load data on view load
            Loaded += async (_, __) => await vm.LoadAsync();
        }
    }
}