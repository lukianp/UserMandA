using System;
using System.Windows.Controls;
using MandADiscoverySuite.ViewModels;
using Microsoft.Extensions.Logging;
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
                InitializeComponent();

                // Create and set ViewModel
                var loggerFactory = LoggerFactory.Create(builder => builder.AddConsole());
                var csvLogger = loggerFactory.CreateLogger<CsvDataServiceNew>();
                var vmLogger = loggerFactory.CreateLogger<TeamsDiscoveryViewModel>();

                var csvService = new CsvDataServiceNew(csvLogger);

                // For simplicity, we'll use the existing pattern used by other views
                // and let the ViewModel handle the data loading
                var viewModel = new TeamsDiscoveryViewModel(null, null, vmLogger);

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