using System;
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
        private bool _isDataLoaded = false;
        
        public UsersViewNew()
        {
            InitializeComponent();
            
            try
            {
                // Create dependencies
                var loggerFactory = LoggerFactory.Create(builder => builder.AddDebug());
                var csvLogger = loggerFactory.CreateLogger<CsvDataServiceNew>();
                var vmLogger = loggerFactory.CreateLogger<UsersViewModel>();
                
                var csvService = new CsvDataServiceNew(csvLogger);
                var profileService = ProfileService.Instance;
                
                // Create and set ViewModel
                var vm = new UsersViewModel(csvService, vmLogger, profileService);
                DataContext = vm;
                
                // Load data on view load (only once)
                Loaded += async (_, __) => 
                {
                    if (!_isDataLoaded)
                    {
                        _isDataLoaded = true;
                        await vm.LoadAsync();
                    }
                };
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"UsersViewNew: Error setting DataContext: {ex.Message}");
                System.Diagnostics.Debug.WriteLine($"UsersViewNew: Stack trace: {ex.StackTrace}");
            }
        }
    }
}