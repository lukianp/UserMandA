using System;
using System.Threading.Tasks;
using System.Windows;
using MandADiscoverySuite.Services;

namespace MandADiscoverySuite
{
    public partial class App : Application
    {
        protected override void OnStartup(StartupEventArgs e)
        {
            try
            {
                // Set up global exception handling
                SetupGlobalExceptionHandling();
                
                // Initialize dependency injection container
                ServiceLocator.Initialize();
                
                // Initialize theme service and apply saved theme
                var themeService = ServiceLocator.GetService<ThemeService>();
                themeService?.Initialize();
                
                base.OnStartup(e);
            }
            catch (Exception ex)
            {
                MessageBox.Show($"Failed to initialize application: {ex.Message}\n\nStack trace:\n{ex.StackTrace}", 
                              "Startup Error", MessageBoxButton.OK, MessageBoxImage.Error);
                Shutdown(1);
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