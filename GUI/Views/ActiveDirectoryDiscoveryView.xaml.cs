using System;
using System.Windows.Controls;
using MandADiscoverySuite.ViewModels;
using Microsoft.Extensions.Logging;
using MandADiscoverySuite.Services;

namespace MandADiscoverySuite.Views
{
    /// <summary>
    /// Interaction logic for ActiveDirectoryDiscoveryView.xaml
    /// </summary>
    public partial class ActiveDirectoryDiscoveryView : UserControl
    {
        public ActiveDirectoryDiscoveryView()
        {
            InitializeComponent();
        }

        // Factory method for ViewRegistry
        public static UserControl CreateView()
        {
            return new ActiveDirectoryDiscoveryView();
        }
    }
}