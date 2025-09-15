using System;
using System.Windows.Controls;
using MandADiscoverySuite.Services;
using MandADiscoverySuite.ViewModels;
using Microsoft.Extensions.Logging;

#pragma warning disable CS0618 // SimpleServiceLocator is obsolete

namespace MandADiscoverySuite.Views
{
    /// <summary>
    /// Interaction logic for AssetInventoryView.xaml - converted to new architecture
    /// </summary>
    public partial class AssetInventoryView : UserControl
    {
        public AssetInventoryView()
        {
            InitializeComponent();
            
            // Create dependencies using the unified pattern
            var loggerFactory = LoggerFactory.Create(builder => builder.AddDebug());
            var csvLogger = loggerFactory.CreateLogger<CsvDataServiceNew>();
            var vmLogger = loggerFactory.CreateLogger<InfrastructureViewModel>();
            
            var csvService = new CsvDataServiceNew(csvLogger);
            var profileService = ProfileService.Instance;
            
            // Create and set ViewModel - use InfrastructureViewModel for asset inventory
            var vm = new InfrastructureViewModel(csvService, vmLogger, profileService);
            DataContext = vm;
            
            // Load data when view loads
            Loaded += async (_, __) => await vm.LoadAsync();
        }
        
        // XAML event handler for asset detail view
        private void AssetGrid_MouseDoubleClick(object sender, System.Windows.Input.MouseButtonEventArgs e)
        {
            try
            {
                if (sender is DataGrid grid && grid.SelectedItem != null)
                {
                    var selectedAsset = grid.SelectedItem;
                    
                    // Get the TabsService to open the detail view
                    var tabsService = SimpleServiceLocator.Instance.GetService<TabsService>();
                    if (tabsService != null)
                    {
                        // Open asset detail in a new tab
                        _ = tabsService.OpenTabAsync("asset-detail", "Asset Details");
                    }
                    else
                    {
                        // Fallback: Show in a message box for now
                        System.Windows.MessageBox.Show($"Asset Detail: {selectedAsset}", "Asset Information", 
                            System.Windows.MessageBoxButton.OK, System.Windows.MessageBoxImage.Information);
                    }
                }
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Error opening asset detail: {ex.Message}");
            }
        }
    }
}