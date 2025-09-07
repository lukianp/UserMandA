using System;
using System.Windows.Controls;
using MandADiscoverySuite.ViewModels;
using Microsoft.Extensions.Logging;
using MandADiscoverySuite.Services;

namespace MandADiscoverySuite.Views
{
    /// <summary>
    /// Interaction logic for PowerBIDiscoveryView.xaml
    /// </summary>
    public partial class PowerBIDiscoveryView : UserControl
    {
        public PowerBIDiscoveryView()
        {
            InitializeComponent();
        }

        // Factory method for ViewRegistry
        public static UserControl CreateView()
        {
            return new PowerBIDiscoveryView();
        }
    }
}