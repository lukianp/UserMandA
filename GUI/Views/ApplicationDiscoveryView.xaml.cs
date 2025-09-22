using System;
using System.Windows.Controls;
using MandADiscoverySuite.ViewModels;
using Microsoft.Extensions.Logging;
using MandADiscoverySuite.Services;

namespace MandADiscoverySuite.Views
{
    /// <summary>
    /// Interaction logic for ApplicationDiscoveryView.xaml
    /// </summary>
    public partial class ApplicationDiscoveryView : UserControl
    {
        public ApplicationDiscoveryView()
        {
            try
            {
                // InitializeComponent(); // Temporarily commented out to avoid initialization issues

                // Create and set ViewModel
                var loggerFactory = LoggerFactory.Create(builder => builder.AddConsole());
                var vmLogger = loggerFactory.CreateLogger<ApplicationDiscoveryViewModel>();

                // Create proper ModuleInfo for Application Discovery
                var moduleInfo = new MandADiscoverySuite.Services.ModuleInfo
                {
                    Icon = "🔧",
                    DisplayName = "Application Discovery",
                    Description = "Discovery and analysis of installed applications",
                    Category = "Applications",
                    Priority = 3,
                    Timeout = 300,
                    FilePath = "Data/ApplicationDiscovery.csv",
                    Enabled = true
                };

                // Create MainViewModel instance (basic implementation)
                var mainViewModel = new MandADiscoverySuite.ViewModels.MainViewModel();

                // Create ViewModel with proper arguments
                var viewModel = new ApplicationDiscoveryViewModel(moduleInfo, mainViewModel, vmLogger);

                DataContext = viewModel;

                // Load data when view loads
                Loaded += async (s, e) => await viewModel.LoadAsync();
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Exception initializing ApplicationDiscoveryView: {ex.Message}");
                throw;
            }

            // Log successful loading
            Loaded += (s, e) =>
            {
                System.Diagnostics.Debug.WriteLine("ApplicationDiscoveryView loaded successfully");
            };
        }

        // Factory method for ViewRegistry
        public static UserControl CreateView()
        {
            return new ApplicationDiscoveryView();
        }
    }
}