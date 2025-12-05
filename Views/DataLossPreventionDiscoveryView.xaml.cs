using System.Windows.Controls;
using System;

namespace MandADiscoverySuite.Views
{
    /// <summary>
    /// Interaction logic for DataLossPreventionDiscoveryView.xaml
    /// </summary>
    public partial class DataLossPreventionDiscoveryView : UserControl
    {
        public DataLossPreventionDiscoveryView()
        {
            try
            {
                InitializeComponent();
            }
            catch (System.Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Exception initializing DataLossPreventionDiscoveryView: {ex.Message}");
                throw;
            }

            // Log successful loading
            Loaded += (s, e) =>
            {
                System.Diagnostics.Debug.WriteLine("DataLossPreventionDiscoveryView loaded successfully");
            };
        }

        // Factory method for ViewRegistry
        public static UserControl CreateView()
        {
            return new DataLossPreventionDiscoveryView();
        }
    }
}