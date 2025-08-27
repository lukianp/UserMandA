using System;
using System.Windows;
using System.Windows.Controls;
using MandADiscoverySuite.ViewModels;
using Microsoft.Extensions.Logging;

namespace MandADiscoverySuite.Views
{
    /// <summary>
    /// Crash-proof interaction logic for MigrateView.xaml
    /// </summary>
    public partial class MigrateView : UserControl
    {
        private MigrateViewModel? _viewModel;
        private ILogger<MigrateView>? _logger;

        public MigrateView()
        {
            try
            {
                InitializeComponent();
                InitializeViewModelSafely();
            }
            catch (Exception ex)
            {
                // Last resort error handling
                System.Diagnostics.Debug.WriteLine($"MigrateView constructor error: {ex.Message}");
                
                // Set a minimal safe DataContext to prevent crashes
                DataContext = new
                {
                    IsLoading = false,
                    HasData = false,
                    HasError = true,
                    LastError = $"View initialization failed: {ex.Message}",
                    SourceUserCount = 0,
                    SourceGroupCount = 0,
                    SourceStatus = "Error",
                    TargetReadyCount = 0,
                    TargetStatus = "Error",
                    TargetHealthScore = "Unknown",
                    MigrationStatus = "Error",
                    LastUpdated = DateTime.Now.ToString("yyyy-MM-dd HH:mm")
                };
            }
        }

        private void InitializeViewModelSafely()
        {
            try
            {
                // Create logger with minimal configuration to avoid dependency issues
                var loggerFactory = LoggerFactory.Create(builder => 
                {
                    builder.AddDebug();
                    builder.SetMinimumLevel(Microsoft.Extensions.Logging.LogLevel.Warning);
                });
                
                _logger = loggerFactory.CreateLogger<MigrateView>();
                var vmLogger = loggerFactory.CreateLogger<MigrateViewModel>();
                
                // Create ViewModel with defensive error handling
                _viewModel = new MigrateViewModel(vmLogger);
                
                // Set DataContext on UI thread with safety check
                if (Application.Current?.Dispatcher.CheckAccess() == true)
                {
                    DataContext = _viewModel;
                }
                else
                {
                    Application.Current?.Dispatcher.BeginInvoke(() =>
                    {
                        try
                        {
                            DataContext = _viewModel;
                        }
                        catch (Exception ex)
                        {
                            _logger?.LogError(ex, "Failed to set DataContext on UI thread");
                        }
                    });
                }
                
                // Load data when view loads, with error handling
                Loaded += OnViewLoadedSafely;
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Failed to initialize MigrateView safely");
                throw; // Re-throw to be caught by main constructor
            }
        }

        private async void OnViewLoadedSafely(object sender, RoutedEventArgs e)
        {
            if (_viewModel == null) return;
            
            try
            {
                await _viewModel.LoadAsync();
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Failed to load MigrateView data");
                
                // Update ViewModel to show error state instead of crashing
                try
                {
                    if (Application.Current?.Dispatcher.CheckAccess() == true)
                    {
                        _viewModel.SetErrorState($"Load failed: {ex.Message}");
                    }
                    else
                    {
                        Application.Current?.Dispatcher.BeginInvoke(() =>
                        {
                            _viewModel.SetErrorState($"Load failed: {ex.Message}");
                        });
                    }
                }
                catch
                {
                    // If even error state setting fails, ignore to prevent cascading crashes
                }
            }
        }
    }
}