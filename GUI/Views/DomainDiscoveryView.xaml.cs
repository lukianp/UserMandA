using System;
using System.Windows.Controls;
using MandADiscoverySuite.Services;
using MandADiscoverySuite.ViewModels;
using Microsoft.Extensions.Logging;

namespace MandADiscoverySuite.Views
{
    /// <summary>
    /// Interaction logic for DomainDiscoveryView.xaml
    /// </summary>
    public partial class DomainDiscoveryView : UserControl
    {
        public DomainDiscoveryView()
        {
            InitializeComponent();

            try
            {
                // Create dependencies using the unified pattern
                var loggerFactory = LoggerFactory.Create(builder => builder.AddDebug());
                var csvLogger = loggerFactory.CreateLogger<CsvDataServiceNew>();
                var vmLogger = loggerFactory.CreateLogger<DomainDiscoveryViewModel>();

                System.Diagnostics.Debug.WriteLine("DomainDiscoveryView: Creating CsvDataServiceNew...");
                var csvService = new CsvDataServiceNew(csvLogger);

                System.Diagnostics.Debug.WriteLine("DomainDiscoveryView: Getting ProfileService.Instance...");
                var profileService = ProfileService.Instance;

                System.Diagnostics.Debug.WriteLine("DomainDiscoveryView: Creating DomainDiscoveryViewModel...");
                // Create and set proper ViewModel
                var vm = new DomainDiscoveryViewModel(csvService, vmLogger, profileService);
                System.Diagnostics.Debug.WriteLine("DomainDiscoveryView: DomainDiscoveryViewModel created successfully");

                System.Diagnostics.Debug.WriteLine("DomainDiscoveryView: Setting DataContext...");
                DataContext = vm;

                // Load data when view loads
                Loaded += async (_, __) =>
                {
                    try
                    {
                        await vm.LoadAsync();
                    }
                    catch (Exception ex)
                    {
                        System.Diagnostics.Debug.WriteLine($"Error loading DomainDiscoveryViewModel: {ex.Message}");
                        vmLogger.LogError(ex, "Failed to load domain discovery data");
                    }
                };
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Error creating DomainDiscoveryView: {ex}");
                System.Diagnostics.Debug.WriteLine($"Exception Type: {ex.GetType().Name}");
                System.Diagnostics.Debug.WriteLine($"Stack Trace: {ex.StackTrace}");

                // Create a simple TextBlock showing the error
                var errorText = new System.Windows.Controls.TextBlock
                {
                    Text = $"Error loading Domain Discovery: {ex.Message}\n\nType: {ex.GetType().Name}\n\nStack: {ex.StackTrace}",
                    Margin = new System.Windows.Thickness(20),
                    TextWrapping = System.Windows.TextWrapping.Wrap
                };
                Content = errorText;
            }
        }
    }
}