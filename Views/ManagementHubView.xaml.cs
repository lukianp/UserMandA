using System.Windows.Controls;
using MandADiscoverySuite.ViewModels;
using Microsoft.Extensions.Logging;

namespace MandADiscoverySuite.Views
{
    /// <summary>
    /// Interaction logic for ManagementHubView.xaml
    /// A unified management interface that integrates Dashboard, Gantt Chart, and Project Management
    /// </summary>
    public partial class ManagementHubView : UserControl
    {
        public ManagementHubView()
        {
            InitializeComponent();
            
            // Create dependencies using the unified pattern
            var loggerFactory = LoggerFactory.Create(builder => builder.AddDebug());
            var vmLogger = loggerFactory.CreateLogger<ManagementHubViewModel>();
            
            // Set DataContext and wire up the Loaded event for LoadAsync
            var viewModel = new ManagementHubViewModel(vmLogger);
            DataContext = viewModel;
            Loaded += async (_, __) => await viewModel.LoadAsync();
        }
    }
}