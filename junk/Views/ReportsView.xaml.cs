using System.Windows.Controls;
using MandADiscoverySuite.ViewModels;
using MandADiscoverySuite.Services;
using Microsoft.Extensions.Logging;

namespace MandADiscoverySuite.Views
{
    /// <summary>
    /// Interaction logic for ReportsView.xaml
    /// </summary>
    public partial class ReportsView : UserControl
    {
        public ReportsView()
        {
            InitializeComponent();
            
            // Initialize ViewModel using service locator pattern with proper logger creation
            var loggerFactory = LoggerFactory.Create(builder => builder.AddDebug());
            var logger = loggerFactory.CreateLogger<ReportsViewModel>();
            var csvDataService = SimpleServiceLocator.Instance.GetService<CsvDataServiceNew>();
            
            DataContext = new ReportsViewModel(logger, csvDataService);
            
            // Trigger initial load
            if (DataContext is ReportsViewModel viewModel)
            {
                _ = viewModel.LoadAsync();
            }
        }
    }
}