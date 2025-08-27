using System.Windows.Controls;
using MandADiscoverySuite.Services;
using MandADiscoverySuite.ViewModels;
using Microsoft.Extensions.Logging;

namespace MandADiscoverySuite.Views
{
    /// <summary>
    /// Interaction logic for SettingsView.xaml
    /// </summary>
    public partial class SettingsView : UserControl
    {
        public SettingsView()
        {
            InitializeComponent();
            
            // Create dependencies using the unified pattern
            var loggerFactory = LoggerFactory.Create(builder => builder.AddDebug());
            var vmLogger = loggerFactory.CreateLogger<SettingsViewModel>();
            
            // Create and set ViewModel
            var vm = new SettingsViewModel(vmLogger);
            DataContext = vm;
            
            // Load data when view loads
            Loaded += async (_, __) => await vm.LoadAsync();
        }
    }
}