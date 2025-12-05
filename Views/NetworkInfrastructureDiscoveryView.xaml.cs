using System;
using System.Windows.Controls;
using MandADiscoverySuite.ViewModels;
using MandADiscoverySuite.Services;
using Microsoft.Extensions.Logging;

namespace MandADiscoverySuite.Views
{
    /// <summary>
    /// Interaction logic for NetworkInfrastructureDiscoveryView.xaml
    /// </summary>
    public partial class NetworkInfrastructureDiscoveryView : UserControl
    {
        public NetworkInfrastructureDiscoveryView()
        {
            try
            {
                InitializeComponent();
    
                try
                {
                    // Create dependencies
                    var loggerFactory = Microsoft.Extensions.Logging.LoggerFactory.Create(builder => builder.AddDebug());
                    var vmLogger = loggerFactory.CreateLogger<NetworkInfrastructureDiscoveryViewModel>();
                    var csvLogger = loggerFactory.CreateLogger<CsvDataServiceNew>();
                    var profileService = ProfileService.Instance;
                    var csvService = new CsvDataServiceNew(csvLogger);
    
                    // Create basic ModuleInfo for infrastructure
                    var moduleInfo = new ModuleInfo
                    {
                        DisplayName = "NetworkInfrastructureDiscovery",
                        Description = "Network Infrastructure Discovery Module",
                        Category = "Discovery",
                        Enabled = true,
                        Priority = 5
                    };
    
                    // Create mock MainViewModel (could be improved by dependency injection)
                    // This is a placeholder for now - in production, this should come from DI or be injected
                    var mainViewModel = CreateMockMainViewModel();
    
                    // Create and set ViewModel
                    var vm = new NetworkInfrastructureDiscoveryViewModel(moduleInfo, mainViewModel, vmLogger);
                    DataContext = vm;
    
                    // Load data when view loads
                    Loaded += async (s, e) => await vm.LoadAsync();
                }
                catch (Exception ex)
                {
                    System.Diagnostics.Debug.WriteLine($"NetworkInfrastructureDiscoveryView: Error setting DataContext: {ex.Message}");
                    // Set fallback DataContext
                    DataContext = new { IsLoading = false, LastError = $"ViewModel construction failed: {ex.Message}" };
                }
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Exception initializing NetworkInfrastructureDiscoveryView: {ex.Message}");
                throw;
            }
    
            // Log successful loading
            Loaded += (s, e) =>
            {
                System.Diagnostics.Debug.WriteLine("NetworkInfrastructureDiscoveryView loaded successfully");
            };
        }
    
        /// <summary>
        /// Create a mock MainViewModel for basic functionality when DI is not available
        /// </summary>
        private MainViewModel CreateMockMainViewModel()
        {
            // For now, use null - the ViewModel will work with null MainViewModel as it may not use it extensively
            return null;
        }

        // Factory method for ViewRegistry
        public static UserControl CreateView()
        {
            return new NetworkInfrastructureDiscoveryView();
        }
    }
}