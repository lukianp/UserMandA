using System;
using System.Windows.Controls;
using MandADiscoverySuite.Services;
using MandADiscoverySuite.ViewModels;
using Microsoft.Extensions.Logging;

namespace MandADiscoverySuite.Views
{
    /// <summary>
    /// Interaction logic for GroupPoliciesViewNew.xaml
    /// </summary>
    public partial class GroupPoliciesViewNew : UserControl
    {
        public GroupPoliciesViewNew()
        {
            InitializeComponent();
            
            try
            {
                // Create dependencies using the unified pattern
                var loggerFactory = LoggerFactory.Create(builder => builder.AddDebug());
                var csvLogger = loggerFactory.CreateLogger<CsvDataServiceNew>();
                var vmLogger = loggerFactory.CreateLogger<GroupPoliciesViewModel>();
                
                var csvService = new CsvDataServiceNew(csvLogger);
                var profileService = ProfileService.Instance;
                
                // Create and set ViewModel
                var vm = new GroupPoliciesViewModel(csvService, vmLogger, profileService);
                DataContext = vm;
                
                // Load data when view loads
                Loaded += async (_, __) => await vm.LoadAsync();
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"GroupPoliciesViewNew: Error setting DataContext: {ex.Message}");
                System.Diagnostics.Debug.WriteLine($"GroupPoliciesViewNew: Stack trace: {ex.StackTrace}");
            }
        }
    }
}