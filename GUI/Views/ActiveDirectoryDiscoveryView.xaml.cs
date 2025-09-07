using System;
using System.Windows.Controls;
using MandADiscoverySuite.ViewModels;
using Microsoft.Extensions.Logging;
using MandADiscoverySuite.Services;

namespace MandADiscoverySuite.Views
{
    /// <summary>
    /// Interaction logic for ActiveDirectoryDiscoveryView.xaml
    /// </summary>
    public partial class ActiveDirectoryDiscoveryView : UserControl
    {
        public ActiveDirectoryDiscoveryView(MainViewModel? mainViewModel = null, ModuleInfo? moduleInfo = null)
        {
            try
            {
                InitializeComponent();

                // Set DataContext to ActiveDirectoryDiscoveryViewModel
                var loggerFactory = Microsoft.Extensions.Logging.LoggerFactory.Create(builder => builder.AddConsole());
                var logger = loggerFactory.CreateLogger<ActiveDirectoryDiscoveryViewModel>();

                // If no moduleInfo provided, create a default one
                if (moduleInfo == null)
                {
                    moduleInfo = new ModuleInfo
                    {
                        DisplayName = "Active Directory Discovery",
                        Id = "activedirectorydiscovery",
                        Description = "Discover and manage Active Directory objects",
                        Icon = "🔍",
                        Category = "Discovery"
                    };
                }

                // If no mainViewModel provided, we can still create ViewModel but some navigation features may be missing
                this.DataContext = new ActiveDirectoryDiscoveryViewModel(moduleInfo, mainViewModel, logger);
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Exception initializing ActiveDirectoryDiscoveryView: {ex.Message}");
                throw;
            }

            // Log successful loading
            Loaded += (s, e) =>
            {
                System.Diagnostics.Debug.WriteLine("ActiveDirectoryDiscoveryView loaded successfully");
            };
        }

        // Factory method for ViewRegistry - parameters can be injected at runtime if available
        public static UserControl CreateView(MainViewModel? mainViewModel = null, ModuleInfo? moduleInfo = null)
        {
            return new ActiveDirectoryDiscoveryView(mainViewModel, moduleInfo);
        }
    }
}