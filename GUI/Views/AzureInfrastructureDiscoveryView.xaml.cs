using System;
using System.Windows.Controls;
using MandADiscoverySuite.ViewModels;
using Microsoft.Extensions.Logging;
using MandADiscoverySuite.Services;

namespace MandADiscoverySuite.Views
{
    /// <summary>
    /// Interaction logic for AzureInfrastructureDiscoveryView.xaml
    /// </summary>
    public partial class AzureInfrastructureDiscoveryView : UserControl
    {
        public AzureInfrastructureDiscoveryView()
        {
            InitializeComponent();
        }

        // Factory method for ViewRegistry
        public static UserControl CreateView()
        {
            return new AzureInfrastructureDiscoveryView();
        }
    }
}