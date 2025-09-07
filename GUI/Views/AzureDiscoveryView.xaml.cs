using System.Windows.Controls;
using System;

namespace MandADiscoverySuite.Views
{
    /// <summary>
    /// Interaction logic for AzureDiscoveryView.xaml
    /// </summary>
    public partial class AzureDiscoveryView : UserControl
    {
        public AzureDiscoveryView()
        {
            try
            {
                InitializeComponent();
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Exception initializing AzureDiscoveryView: {ex.Message}");
                throw;
            }

            // Log successful loading
            Loaded += (s, e) =>
            {
                System.Diagnostics.Debug.WriteLine("AzureDiscoveryView loaded successfully");
            };
        }
    }
}