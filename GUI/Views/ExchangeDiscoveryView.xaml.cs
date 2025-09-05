using System;
using System.Windows.Controls;
using MandADiscoverySuite.ViewModels;
using Microsoft.Extensions.Logging;
using MandADiscoverySuite.Services;

namespace MandADiscoverySuite.Views
{
    /// <summary>
    /// Interaction logic for ExchangeDiscoveryView.xaml
    /// </summary>
    public partial class ExchangeDiscoveryView : UserControl
    {
        public ExchangeDiscoveryView()
        {
            InitializeComponent();
        }

        // Factory method for ViewRegistry
        public static UserControl CreateView()
        {
            return new ExchangeDiscoveryView();
        }
    }
}