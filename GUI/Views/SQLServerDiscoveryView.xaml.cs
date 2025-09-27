using System;
using System.Windows.Controls;
using MandADiscoverySuite.ViewModels;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.DependencyInjection;
using MandADiscoverySuite.Services;

namespace MandADiscoverySuite.Views
{
    /// <summary>
    /// Interaction logic for SQLServerDiscoveryView.xaml
    /// </summary>
    public partial class SQLServerDiscoveryView : UserControl
    {
        public SQLServerDiscoveryView()
        {
            try
            {
                // InitializeComponent(); // Temporarily commented out to avoid initialization issues

                // Create and set ViewModel
                var loggerFactory = LoggerFactory.Create(builder => builder.AddConsole());
                var vmLogger = loggerFactory.CreateLogger<SQLServerDiscoveryViewModel>();

                // Create proper ModuleInfo for SQL Server Discovery
                var moduleInfo = new MandADiscoverySuite.Services.ModuleInfo
                {
                    Icon = "ðŸ—„ï¸",
                    DisplayName = "SQL Server Discovery",
                    Description = "Discovery and analysis of SQL Server instances and databases",
                    Category = "Databases",
                    Priority = 1,
                    Timeout = 300,
                    FilePath = "Data/SQLServerDiscovery.csv",
                    Enabled = true
                };

                // Get MainViewModel instance from DI container
                var mainViewModel = App.ServiceProvider.GetRequiredService<MandADiscoverySuite.ViewModels.MainViewModel>();

                // Create ViewModel with proper arguments
                var viewModel = new SQLServerDiscoveryViewModel(moduleInfo, mainViewModel, vmLogger);

                DataContext = viewModel;

                // Load data when view loads
                Loaded += async (s, e) => await viewModel.LoadAsync();
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Exception initializing SQLServerDiscoveryView: {ex.Message}");
                throw;
            }

            // Log successful loading
            Loaded += (s, e) =>
            {
                System.Diagnostics.Debug.WriteLine("SQLServerDiscoveryView loaded successfully");
            };
        }

        // Factory method for ViewRegistry
        public static UserControl CreateView()
        {
            return new SQLServerDiscoveryView();
        }
    }
}
