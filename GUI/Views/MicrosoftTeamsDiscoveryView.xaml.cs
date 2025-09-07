using System;
using System.Windows.Controls;
using MandADiscoverySuite.ViewModels;
using Microsoft.Extensions.Logging;
using MandADiscoverySuite.Services;

namespace MandADiscoverySuite.Views
{
    /// <summary>
    /// Interaction logic for MicrosoftTeamsDiscoveryView.xaml
    /// </summary>
    public partial class MicrosoftTeamsDiscoveryView : UserControl
    {
        public MicrosoftTeamsDiscoveryView()
        {
            InitializeComponent();
        }

        // Factory method for ViewRegistry
        public static UserControl CreateView()
        {
            return new MicrosoftTeamsDiscoveryView();
        }
    }
}