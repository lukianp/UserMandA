using System.Windows.Controls;
using MandADiscoverySuite.ViewModels;
using Microsoft.Extensions.Logging;

namespace MandADiscoverySuite.Views
{
    /// <summary>
    /// Interaction logic for ManagementView.xaml
    /// </summary>
    public partial class ManagementView : UserControl
    {
        public ManagementView()
        {
            InitializeComponent();
            
            // Create dependencies using the unified pattern
            var loggerFactory = LoggerFactory.Create(builder => builder.AddDebug());
            var vmLogger = loggerFactory.CreateLogger<ManagementViewModel>();
            
            // Set DataContext and wire up the Loaded event for LoadAsync
            var viewModel = new ManagementViewModel(vmLogger);
            DataContext = viewModel;
            Loaded += async (_, __) => await viewModel.LoadAsync();
        }
    }
}