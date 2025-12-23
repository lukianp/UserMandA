using System;
using System.Windows.Controls;
using MandADiscoverySuite.Services;
using MandADiscoverySuite.ViewModels;
using Microsoft.Extensions.Logging;

namespace MandADiscoverySuite.Views
{
    /// <summary>
    /// Interaction logic for InfrastructureViewNew.xaml
    /// </summary>
    public partial class InfrastructureViewNew : UserControl
    {
        public InfrastructureViewNew()
        {
            InitializeComponent();
            
            try
            {
                // Create dependencies using the unified pattern
                var loggerFactory = LoggerFactory.Create(builder => builder.AddDebug());
                var csvLogger = loggerFactory.CreateLogger<CsvDataServiceNew>();
                var vmLogger = loggerFactory.CreateLogger<InfrastructureViewModel>();
                
                var csvService = new CsvDataServiceNew(csvLogger);
                var profileService = ProfileService.Instance;
                
                // Create and set ViewModel
                var vm = new InfrastructureViewModel(csvService, vmLogger, profileService);
                DataContext = vm;
                
                // Load data when view loads
                Loaded += async (_, __) => await vm.LoadAsync();
            }
            catch (Exception ex)
            {
                // More detailed error logging
                System.Diagnostics.Debug.WriteLine($"InfrastructureViewNew: Error setting DataContext: {ex.Message}");
                System.Diagnostics.Debug.WriteLine($"InfrastructureViewNew: Exception type: {ex.GetType().Name}");
                System.Diagnostics.Debug.WriteLine($"InfrastructureViewNew: Stack trace: {ex.StackTrace}");
                if (ex.InnerException != null)
                {
                    System.Diagnostics.Debug.WriteLine($"InfrastructureViewNew: Inner exception: {ex.InnerException.Message}");
                }
                
                // Create a simple fallback DataContext so view isn't completely broken
                try
                {
                    DataContext = new { IsLoading = false, LastError = $"ViewNew constructor failed: {ex.Message}" };
                }
                catch
                {
                    // If even that fails, leave DataContext null
                }
            }
        }
    }
}