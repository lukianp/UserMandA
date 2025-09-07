using System;
using System.Windows.Controls;
using MandADiscoverySuite.ViewModels;
using Microsoft.Extensions.Logging;
using MandADiscoverySuite.Services;

namespace MandADiscoverySuite.Views
{
    /// <summary>
    /// Interaction logic for EnvironmentDetectionView.xaml
    /// </summary>
    public partial class EnvironmentDetectionView : UserControl
    {
        public EnvironmentDetectionView()
        {
            InitializeComponent();
        }

        // Factory method for ViewRegistry
        public static UserControl CreateView()
        {
            return new EnvironmentDetectionView();
        }
    }
}