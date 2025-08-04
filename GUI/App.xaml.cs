using System;
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
                // Initialize simple service container
                SimpleServiceLocator.Initialize();
                
                base.OnStartup(e);
            }
            catch (Exception ex)
            {
                MessageBox.Show($"Failed to initialize application: {ex.Message}", 
                              "Startup Error", MessageBoxButton.OK, MessageBoxImage.Error);
                Shutdown(1);
            }
        }

        protected override void OnExit(ExitEventArgs e)
        {
            try
            {
                // Clean up service container
                SimpleServiceLocator.Clear();
            }
            catch
            {
                // Ignore cleanup errors during shutdown
            }
            
            base.OnExit(e);
        }
    }
}