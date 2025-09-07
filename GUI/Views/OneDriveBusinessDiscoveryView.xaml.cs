using System;
using System.Windows.Controls;
using MandADiscoverySuite.ViewModels;
using Microsoft.Extensions.Logging;
using MandADiscoverySuite.Services;

namespace MandADiscoverySuite.Views
{
    /// <summary>
    /// Interaction logic for OneDriveBusinessDiscoveryView.xaml
    /// </summary>
    public partial class OneDriveBusinessDiscoveryView : UserControl
    {
        public OneDriveBusinessDiscoveryView()
        {
            InitializeComponent();
        }

        // Factory method for ViewRegistry
        public static UserControl CreateView()
        {
            return new OneDriveBusinessDiscoveryView();
        }
    }
}