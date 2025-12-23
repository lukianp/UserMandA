using System;
using System.Windows.Controls;
using MandADiscoverySuite.ViewModels;
using Microsoft.Extensions.Logging;
using MandADiscoverySuite.Services;

namespace MandADiscoverySuite.Views
{
    /// <summary>
    /// Interaction logic for SharePointDiscoveryView.xaml
    /// </summary>
    public partial class SharePointDiscoveryView : UserControl
    {
        public SharePointDiscoveryView()
        {
            try
            {
                InitializeComponent();
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Exception initializing SharePointDiscoveryView: {ex.Message}");
                throw;
            }

            // Log successful loading
            Loaded += (s, e) =>
            {
                System.Diagnostics.Debug.WriteLine("SharePointDiscoveryView loaded successfully");
            };
        }

        // Factory method for ViewRegistry
        public static UserControl CreateView()
        {
            return new SharePointDiscoveryView();
        }
    }
}