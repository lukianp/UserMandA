using System;
using System.Windows.Controls;
using MandADiscoverySuite.ViewModels;
using Microsoft.Extensions.Logging;
using MandADiscoverySuite.Services;

namespace MandADiscoverySuite.Views
{
    /// <summary>
    /// Interaction logic for AWSCloudInfrastructureDiscoveryView.xaml
    /// </summary>
    public partial class AWSCloudInfrastructureDiscoveryView : UserControl
    {
        public AWSCloudInfrastructureDiscoveryView()
        {
            try
            {
                InitializeComponent();
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Exception initializing AWSCloudInfrastructureDiscoveryView: {ex.Message}");
                throw;
            }

            // Log successful loading
            Loaded += (s, e) =>
            {
                System.Diagnostics.Debug.WriteLine("AWSCloudInfrastructureDiscoveryView loaded successfully");
            };
        }

        // Factory method for ViewRegistry
        public static UserControl CreateView()
        {
            return new AWSCloudInfrastructureDiscoveryView();
        }
    }
}