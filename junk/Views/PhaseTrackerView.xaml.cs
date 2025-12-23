using System.Windows.Controls;
using Microsoft.Extensions.Logging;
using MandADiscoverySuite.ViewModels;

namespace MandADiscoverySuite.Views
{
    /// <summary>
    /// Interaction logic for PhaseTrackerView.xaml
    /// </summary>
    public partial class PhaseTrackerView : UserControl
    {
        public PhaseTrackerView()
        {
            InitializeComponent();
            
            // Create logger for the ViewModel
            var loggerFactory = LoggerFactory.Create(builder => builder.AddDebug());
            var logger = loggerFactory.CreateLogger<PhaseTrackerViewModel>();
            
            // Set DataContext to the ViewModel with unified LoadAsync pattern
            var viewModel = new PhaseTrackerViewModel(logger);
            DataContext = viewModel;
            
            // Load data asynchronously
            _ = viewModel.LoadAsync();
        }
    }
}