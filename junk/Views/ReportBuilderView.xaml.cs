using System.Windows.Controls;
using MandADiscoverySuite.Services;
using MandADiscoverySuite.ViewModels;
using Microsoft.Extensions.Logging;

namespace MandADiscoverySuite.Views
{
    /// <summary>
    /// Interaction logic for ReportBuilderView.xaml
    /// </summary>
    public partial class ReportBuilderView : UserControl
    {
        public ReportBuilderView()
        {
            InitializeComponent();
            
            // Create dependencies using the unified pattern
            var loggerFactory = LoggerFactory.Create(builder => builder.AddDebug());
            var vmLogger = loggerFactory.CreateLogger<ReportBuilderViewModel>();
            
            // Create and set ViewModel
            var vm = new ReportBuilderViewModel(vmLogger);
            DataContext = vm;
            
            // Load data when view loads
            Loaded += async (_, __) => await vm.LoadAsync();
        }

        private void UserControl_Loaded(object sender, System.Windows.RoutedEventArgs e)
        {
            // Set up WebBrowser for preview if needed
            if (DataContext is ReportBuilderViewModel viewModel)
            {
                viewModel.PropertyChanged += ViewModel_PropertyChanged;
            }
        }

        private void ViewModel_PropertyChanged(object sender, System.ComponentModel.PropertyChangedEventArgs e)
        {
            if (e.PropertyName == nameof(ReportBuilderViewModel.PreviewContent))
            {
                if (DataContext is ReportBuilderViewModel viewModel && !string.IsNullOrEmpty(viewModel.PreviewContent))
                {
                    // Only access PreviewBrowser if it exists in XAML
                    if (PreviewBrowser != null)
                    {
                        PreviewBrowser.NavigateToString(viewModel.PreviewContent);
                    }
                }
            }
        }
    }
}