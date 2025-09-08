using System.Windows.Controls;
using System;

namespace MandADiscoverySuite.Views
{
    /// <summary>
    /// Interaction logic for WebServerConfigurationDiscoveryView.xaml
    /// </summary>
    public partial class WebServerConfigurationDiscoveryView : UserControl
    {
        public WebServerConfigurationDiscoveryView()
        {
            try
            {
                InitializeComponent();
            }
            catch (System.Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Exception initializing WebServerConfigurationDiscoveryView: {ex.Message}");
                throw;
            }

            // Log successful loading
            Loaded += (s, e) =>
            {
                System.Diagnostics.Debug.WriteLine("WebServerConfigurationDiscoveryView loaded successfully");
            };
        }

        // Factory method for ViewRegistry
        public static UserControl CreateView()
        {
            return new WebServerConfigurationDiscoveryView();
        }
    }
}