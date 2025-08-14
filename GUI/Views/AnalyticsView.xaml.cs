using System;
using System.Windows;
using System.Windows.Controls;
using MandADiscoverySuite.ViewModels;
using MandADiscoverySuite.Services;

namespace MandADiscoverySuite.Views
{
    /// <summary>
    /// Interaction logic for AnalyticsView.xaml
    /// </summary>
    public partial class AnalyticsView : UserControl
    {
        public AnalyticsView()
        {
            _ = EnhancedLoggingService.Instance.LogInformationAsync("AnalyticsView: Constructor started");
            InitializeComponent();
            
            try
            {
                var viewModel = new AnalyticsViewModel();
                DataContext = viewModel;
                _ = EnhancedLoggingService.Instance.LogInformationAsync("AnalyticsView: ViewModel created and DataContext set");
                
                Loaded += async (s, e) =>
                {
                    _ = EnhancedLoggingService.Instance.LogInformationAsync("AnalyticsView: Loaded event fired, calling LoadAsync");
                    await viewModel.LoadAsync();
                };
            }
            catch (Exception ex)
            {
                _ = EnhancedLoggingService.Instance.LogErrorAsync($"AnalyticsView: Error setting DataContext: {ex.Message}");
                System.Diagnostics.Debug.WriteLine($"AnalyticsView: Error setting DataContext: {ex.Message}");
            }
            _ = EnhancedLoggingService.Instance.LogInformationAsync("AnalyticsView: Constructor completed");
        }
    }
}