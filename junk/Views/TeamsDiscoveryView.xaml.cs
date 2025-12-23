using System.Windows.Controls;
using System;

namespace MandADiscoverySuite.Views
{
    /// <summary>
    /// Interaction logic for TeamsDiscoveryView.xaml
    /// </summary>
    public partial class TeamsDiscoveryView : UserControl
    {
        public TeamsDiscoveryView()
        {
            try
            {
                InitializeComponent();
            }
            catch (System.Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Exception initializing TeamsDiscoveryView: {ex.Message}");
                throw;
            }

            // Log successful loading
            Loaded += (s, e) =>
            {
                System.Diagnostics.Debug.WriteLine("TeamsDiscoveryView loaded successfully");
            };
        }

        // Factory method for ViewRegistry
        public static UserControl CreateView()
        {
            return new TeamsDiscoveryView();
        }
    }
}