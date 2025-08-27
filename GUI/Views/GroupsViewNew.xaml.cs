using System;
using System.Windows.Controls;
using MandADiscoverySuite.Services;
using MandADiscoverySuite.ViewModels;
using Microsoft.Extensions.Logging;

namespace MandADiscoverySuite.Views
{
    /// <summary>
    /// Interaction logic for GroupsViewNew.xaml
    /// </summary>
    public partial class GroupsViewNew : UserControl
    {
        private bool _isDataLoaded = false;
        
        public GroupsViewNew()
        {
            InitializeComponent();
            
            try
            {
                // Create dependencies using the unified pattern
                var loggerFactory = LoggerFactory.Create(builder => builder.AddDebug());
                var csvLogger = loggerFactory.CreateLogger<CsvDataServiceNew>();
                var vmLogger = loggerFactory.CreateLogger<GroupsViewModel>();
                
                var csvService = new CsvDataServiceNew(csvLogger);
                var profileService = ProfileService.Instance;
                
                // Create and set ViewModel
                var vm = new GroupsViewModel(csvService, vmLogger, profileService);
                DataContext = vm;
                
                // Load data when view loads (only once)
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
                System.Diagnostics.Debug.WriteLine($"GroupsViewNew: Error setting DataContext: {ex.Message}");
                System.Diagnostics.Debug.WriteLine($"GroupsViewNew: Stack trace: {ex.StackTrace}");
            }
        }
    }
}