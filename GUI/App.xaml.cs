using System;
using System.Threading.Tasks;
using System.Windows;
using MandADiscoverySuite.Services;
using MandADiscoverySuite.Helpers;

namespace MandADiscoverySuite
{
    public partial class App : Application
    {
        private StartupOptimizationService _startupService;

        protected override void OnStartup(StartupEventArgs e)
        {
            try
            {
                // Start startup performance monitoring
                _startupService = new StartupOptimizationService();
                _startupService.StartPhase("ApplicationStartup");
                
                // Optimize startup performance
                _startupService.OptimizeStartup();
                
                _startupService.StartPhase("ExceptionHandling");
                // Set up global exception handling
                SetupGlobalExceptionHandling();
                _startupService.EndPhase("ExceptionHandling");
                
                _startupService.StartPhase("DependencyInjection");
                // Initialize dependency injection container
                ServiceLocator.Initialize();
                _startupService.EndPhase("DependencyInjection");
                
                _startupService.StartPhase("ThemeInitialization");
                // Initialize theme service and apply saved theme
                var themeService = ServiceLocator.GetService<ThemeService>();
                themeService?.Initialize();
                _startupService.EndPhase("ThemeInitialization");
                
                _startupService.StartPhase("ResourceOptimization");
                // Freeze all brushes for improved performance
                BrushOptimizer.FreezeApplicationBrushes(this);
                _startupService.EndPhase("ResourceOptimization");
                
                base.OnStartup(e);
                
                // Complete startup optimization asynchronously
                _ = CompleteStartupOptimizationAsync();
            }
            catch (Exception ex)
            {
                _startupService?.EndPhase("ApplicationStartup");
                MessageBox.Show($"Failed to initialize application: {ex.Message}\n\nStack trace:\n{ex.StackTrace}", 
                              "Startup Error", MessageBoxButton.OK, MessageBoxImage.Error);
                Shutdown(1);
            }
            finally
            {
                _startupService?.EndPhase("ApplicationStartup");
            }
        }

        private async Task CompleteStartupOptimizationAsync()
        {
            try
            {
                // Wait a moment for the main window to finish loading
                await Task.Delay(1000);
                
                // Complete startup optimization
                await _startupService?.CompleteStartupAsync();
                
                // Register the service with the service locator for later use
                ServiceLocator.RegisterInstance(_startupService);
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Startup completion error: {ex.Message}");
            }
        }

        private void SetupGlobalExceptionHandling()
        {
            // Catch all unhandled exceptions in the UI thread
            DispatcherUnhandledException += (sender, e) =>
            {
                var errorMessage = $"Unhandled UI Exception: {e.Exception.Message}\n\nStack trace:\n{e.Exception.StackTrace}";
                System.Diagnostics.Debug.WriteLine(errorMessage);
                
                MessageBox.Show(errorMessage, "Application Error", MessageBoxButton.OK, MessageBoxImage.Error);
                
                // Mark as handled to prevent the application from crashing
                e.Handled = true;
            };

            // Catch unhandled exceptions in background threads
            AppDomain.CurrentDomain.UnhandledException += (sender, e) =>
            {
                var exception = e.ExceptionObject as Exception;
                var errorMessage = $"Unhandled Background Exception: {exception?.Message}\n\nStack trace:\n{exception?.StackTrace}";
                System.Diagnostics.Debug.WriteLine(errorMessage);
                
                MessageBox.Show(errorMessage, "Critical Application Error", MessageBoxButton.OK, MessageBoxImage.Error);
            };

            // Catch unhandled Task exceptions
            TaskScheduler.UnobservedTaskException += (sender, e) =>
            {
                var errorMessage = $"Unhandled Task Exception: {e.Exception.Message}\n\nStack trace:\n{e.Exception.StackTrace}";
                System.Diagnostics.Debug.WriteLine(errorMessage);
                
                MessageBox.Show(errorMessage, "Task Error", MessageBoxButton.OK, MessageBoxImage.Error);
                
                // Mark as observed to prevent the application from crashing
                e.SetObserved();
            };
        }

        protected override void OnExit(ExitEventArgs e)
        {
            try
            {
                // Clean up startup optimization service
                _startupService?.Dispose();
                
                // Clean up service container
                ServiceLocator.Dispose();
            }
            catch
            {
                // Ignore cleanup errors during shutdown
            }
            
            base.OnExit(e);
        }
    }
}