using System;
using System.Threading.Tasks;
using System.Windows.Controls;
using MandADiscoverySuite.Services;
using MandADiscoverySuite.ViewModels;
using Microsoft.Extensions.Logging;

namespace MandADiscoverySuite.Views
{
    /// <summary>
    /// Dashboard View using new unified architecture
    /// Provides overview and statistics for the discovery suite
    /// </summary>
    public partial class DashboardView : UserControl
    {
        public DashboardView()
        {
            try
            {
                InitializeComponent();
                
                // Initialize the proper ViewModel with project countdown functionality
                var csvService = new CsvDataServiceNew(LoggerFactory.Create(b => b.AddDebug()).CreateLogger<CsvDataServiceNew>());
                var logger = LoggerFactory.Create(b => b.AddDebug()).CreateLogger<DashboardViewModel>();
                var profileService = ProfileService.Instance;
                
                var viewModel = new DashboardViewModel(csvService, logger, profileService);
                DataContext = viewModel;
                
                // Load data asynchronously without blocking UI
                _ = Task.Run(() => viewModel.LoadAsync());
                
                System.Diagnostics.Debug.WriteLine("[DashboardView] Successfully initialized with DashboardViewModel");
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"[DashboardView] Constructor error: {ex.Message}");
                System.Diagnostics.Debug.WriteLine($"[DashboardView] Stack trace: {ex.StackTrace}");
                throw; // Re-throw to let ViewRegistry handle it
            }
        }
    }
}