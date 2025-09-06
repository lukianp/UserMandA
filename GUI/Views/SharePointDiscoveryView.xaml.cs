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
            InitializeComponent();
        }

        // Factory method for ViewRegistry
        public static UserControl CreateView()
        {
            return new SharePointDiscoveryView();
        }
    }
}