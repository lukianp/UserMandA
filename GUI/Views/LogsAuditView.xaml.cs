using System.Windows.Controls;
using MandADiscoverySuite.ViewModels;
using Microsoft.Extensions.DependencyInjection;
using MandADiscoverySuite.Services;
using Microsoft.Extensions.Logging;

namespace MandADiscoverySuite.Views
{
    /// <summary>
    /// Interaction logic for LogsAuditView.xaml
    /// </summary>
    public partial class LogsAuditView : UserControl
    {
        public LogsAuditView()
        {
            InitializeComponent();
            
            // Initialize with dependency injection or service locator
            InitializeViewModel();
        }

        private void InitializeViewModel()
        {
            try
            {
                // Try to get services from DI container
                var serviceProvider = SimpleServiceLocator.Instance;
                if (serviceProvider != null)
                {
                    var logManagementService = serviceProvider.GetService<ILogManagementService>();
                    var logger = serviceProvider.GetService<ILogger<LogsAuditViewModel>>();
                    
                    if (logManagementService != null && logger != null)
                    {
                        var viewModel = new LogsAuditViewModel(logManagementService, logger);
                        DataContext = viewModel;
                        
                        // Initialize the view model asynchronously
                        Loaded += async (s, e) => await viewModel.InitializeAsync();
                    }
                }
            }
            catch (System.Exception ex)
            {
                // Fallback: create a minimal view model for design-time
                System.Diagnostics.Debug.WriteLine($"Error initializing LogsAuditView: {ex.Message}");
            }
        }
    }
}