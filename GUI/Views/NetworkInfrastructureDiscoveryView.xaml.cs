using System;
using System.Windows.Controls;
using MandADiscoverySuite.ViewModels;
using Microsoft.Extensions.Logging;
using MandADiscoverySuite.Services;

namespace MandADiscoverySuite.Views
{
    /// <summary>
    /// Interaction logic for NetworkInfrastructureDiscoveryView.xaml
    /// </summary>
    public partial class NetworkInfrastructureDiscoveryView : UserControl
    {
        public NetworkInfrastructureDiscoveryView()
        {
            InitializeComponent();
        }

        // Factory method for ViewRegistry
        public static UserControl CreateView()
        {
            return new NetworkInfrastructureDiscoveryView();
        }
    }
}