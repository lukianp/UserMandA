using System;
using System.Windows;
using System.Windows.Controls;
using MandADiscoverySuite.ViewModels;
using MandADiscoverySuite.Services;

namespace MandADiscoverySuite.Views
{
    /// <summary>
    /// Interaction logic for MigrateView.xaml
    /// </summary>
    public partial class MigrateView : UserControl
    {
        public MigrateView()
        {
            _ = EnhancedLoggingService.Instance.LogInformationAsync("MigrateView: Constructor started");
            InitializeComponent();
            
            try
            {
                var viewModel = new MigrateViewModel();
                DataContext = viewModel;
                _ = EnhancedLoggingService.Instance.LogInformationAsync("MigrateView: ViewModel created and DataContext set");
                
                Loaded += async (s, e) =>
                {
                    _ = EnhancedLoggingService.Instance.LogInformationAsync("MigrateView: Loaded event fired, calling LoadAsync");
                    await viewModel.LoadAsync();
                };
            }
            catch (Exception ex)
            {
                _ = EnhancedLoggingService.Instance.LogErrorAsync($"MigrateView: Error setting DataContext: {ex.Message}");
                System.Diagnostics.Debug.WriteLine($"MigrateView: Error setting DataContext: {ex.Message}");
            }
            _ = EnhancedLoggingService.Instance.LogInformationAsync("MigrateView: Constructor completed");
        }
    }
}