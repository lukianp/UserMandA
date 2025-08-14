using System;
using System.Windows;
using System.Windows.Controls;
using MandADiscoverySuite.ViewModels;
using MandADiscoverySuite.Services;

namespace MandADiscoverySuite.Views
{
    /// <summary>
    /// Interaction logic for SettingsView.xaml
    /// </summary>
    public partial class SettingsView : UserControl
    {
        public SettingsView()
        {
            _ = EnhancedLoggingService.Instance.LogInformationAsync("SettingsView: Constructor started");
            InitializeComponent();
            
            try
            {
                var viewModel = new SettingsViewModel();
                DataContext = viewModel;
                _ = EnhancedLoggingService.Instance.LogInformationAsync("SettingsView: ViewModel created and DataContext set");
                
                Loaded += async (s, e) =>
                {
                    _ = EnhancedLoggingService.Instance.LogInformationAsync("SettingsView: Loaded event fired, calling LoadAsync");
                    await viewModel.LoadAsync();
                };
            }
            catch (Exception ex)
            {
                _ = EnhancedLoggingService.Instance.LogErrorAsync($"SettingsView: Error setting DataContext: {ex.Message}");
                System.Diagnostics.Debug.WriteLine($"SettingsView: Error setting DataContext: {ex.Message}");
            }
            _ = EnhancedLoggingService.Instance.LogInformationAsync("SettingsView: Constructor completed");
        }
    }
}