using System;
using System.Windows.Controls;
using MandADiscoverySuite.ViewModels;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.DependencyInjection;
using MandADiscoverySuite.Services;

namespace MandADiscoverySuite.Views
{
    /// <summary>
    /// Interaction logic for MicrosoftTeamsDiscoveryView.xaml
    /// </summary>
    public partial class MicrosoftTeamsDiscoveryView : UserControl
    {
        public MicrosoftTeamsDiscoveryView()
        {
            try
            {
                // InitializeComponent(); // Temporarily commented out to isolate SolidColorBrush.Color parsing error

                // Create and set ViewModel
                var loggerFactory = LoggerFactory.Create(builder => builder.AddConsole());
                var csvLogger = loggerFactory.CreateLogger<CsvDataServiceNew>();
                var vmLogger = loggerFactory.CreateLogger<MicrosoftTeamsDiscoveryViewModel>();

                var csvService = new CsvDataServiceNew(csvLogger);

                // Create proper ModuleInfo for Teams Discovery
                var moduleInfo = new MandADiscoverySuite.Services.ModuleInfo
                {
                    Icon = "ðŸ‘¥",
                    DisplayName = "Microsoft Teams Discovery",
                    Description = "Discovery and analysis of Microsoft Teams environments",
                    Category = "Collaboration",
                    Priority = 2,
                    Timeout = 300,
                    FilePath = "Data/TeamsDiscovery.csv",
                    Enabled = true
                };

                // Get MainViewModel instance from DI container
                var mainViewModel = App.ServiceProvider.GetRequiredService<MandADiscoverySuite.ViewModels.MainViewModel>();

                // Create ViewModel with proper arguments
                var viewModel = new MicrosoftTeamsDiscoveryViewModel(moduleInfo, mainViewModel, vmLogger);

                DataContext = viewModel;

                // Load data when view loads
                Loaded += async (s, e) => await viewModel.LoadAsync();
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Exception initializing MicrosoftTeamsDiscoveryView: {ex.Message}");
                throw;
            }

            // Log successful loading
            Loaded += (s, e) =>
            {
                System.Diagnostics.Debug.WriteLine("MicrosoftTeamsDiscoveryView loaded successfully");
            };
        }

        // Factory method for ViewRegistry
        public static UserControl CreateView()
        {
            return new MicrosoftTeamsDiscoveryView();
        }
    }
}
