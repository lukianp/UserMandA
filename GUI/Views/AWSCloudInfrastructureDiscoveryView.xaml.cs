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
            InitializeComponent();
        }

        // Factory method for ViewRegistry
        public static UserControl CreateView()
        {
            return new AWSCloudInfrastructureDiscoveryView();
        }
    }
}