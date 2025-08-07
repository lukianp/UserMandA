using System;
using System.IO;
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
            Action<string> logAction = null;
            try
            {
                // Set up global exception handling first
                SetupGlobalExceptionHandling();
                logAction = Current.Properties["LogAction"] as Action<string>;
                
                logAction?.Invoke("=== OnStartup BEGIN ===");
                logAction?.Invoke("Global exception handling setup completed");
                
                // Initialize ServiceLocator and core services
                logAction?.Invoke("Initializing ServiceLocator...");
                ServiceLocator.Initialize();
                logAction?.Invoke("ServiceLocator initialized successfully");
                
                logAction?.Invoke("Getting ThemeService...");
                var themeService = ServiceLocator.GetService<ThemeService>();
                logAction?.Invoke($"ThemeService retrieved: {(themeService != null ? "Success" : "NULL")}");
                
                if (themeService != null)
                {
                    logAction?.Invoke("Initializing ThemeService...");
                    themeService.Initialize();
                    logAction?.Invoke("ThemeService initialized successfully");
                }
                
                logAction?.Invoke("Calling base.OnStartup...");
                base.OnStartup(e);
                logAction?.Invoke("base.OnStartup completed successfully");
                logAction?.Invoke("=== OnStartup COMPLETED SUCCESSFULLY ===");
            }
            catch (Exception ex)
            {
                var errorMsg = $"CRITICAL STARTUP FAILURE: {ex.GetType().Name}: {ex.Message}";
                var stackTrace = $"Stack Trace:\n{ex.StackTrace}";
                var innerEx = ex.InnerException != null ? $"Inner Exception: {ex.InnerException.Message}\nInner Stack: {ex.InnerException.StackTrace}" : "No inner exception";
                var fullError = $"{errorMsg}\n{stackTrace}\n{innerEx}";
                
                logAction?.Invoke("=== CRITICAL STARTUP FAILURE ===");
                logAction?.Invoke(fullError);
                logAction?.Invoke("=== END CRITICAL STARTUP FAILURE ===");
                
                System.Diagnostics.Debug.WriteLine(fullError);
                
                MessageBox.Show($"CRITICAL STARTUP FAILURE:\n{ex.Message}\n\nType: {ex.GetType().Name}\n\nFull details logged.\n\nStack trace:\n{ex.StackTrace}", 
                              "Critical Startup Error", MessageBoxButton.OK, MessageBoxImage.Error);
                Shutdown(1);
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

        private void InitializeAnimationOptimization()
        {
            try
            {
                var animationService = ServiceLocator.GetService<AnimationOptimizationService>();
                if (animationService != null)
                {
                    // Set performance level based on system capabilities
                    var performanceLevel = DetermineOptimalPerformanceLevel();
                    animationService.SetPerformanceLevel(performanceLevel);
                    
                    // Disable performance-heavy animations by default
                    animationService.DisableAnimationType(AnimationType.LoadingAnimations);
                    animationService.DisableAnimationType(AnimationType.SelectionAnimations);
                    animationService.DisableAnimationType(AnimationType.ScrollingAnimations);
                    animationService.DisableAnimationType(AnimationType.ResizeAnimations);
                    animationService.DisableAnimationType(AnimationType.SortAnimations);
                    
                    System.Diagnostics.Debug.WriteLine($"Animation optimization initialized with {performanceLevel} performance level");
                }
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Failed to initialize animation optimization: {ex.Message}");
            }
        }
        
        private AnimationPerformanceLevel DetermineOptimalPerformanceLevel()
        {
            try
            {
                // Check system performance indicators
                var totalMemory = GC.GetTotalMemory(false);
                var isLowMemory = totalMemory > 500 * 1024 * 1024; // Over 500MB used
                
                // Check if on battery power (simplified check)
                var isOnBattery = false; // Simplified - could implement battery detection if needed
                
                // Check processor count
                var processorCount = Environment.ProcessorCount;
                
                if (isOnBattery || processorCount < 4)
                {
                    return AnimationPerformanceLevel.Minimal;
                }
                else if (isLowMemory || processorCount < 8)
                {
                    return AnimationPerformanceLevel.Balanced;
                }
                else
                {
                    return AnimationPerformanceLevel.Smooth;
                }
            }
            catch
            {
                // Default to balanced if we can't determine system capabilities
                return AnimationPerformanceLevel.Balanced;
            }
        }

        private void SetupGlobalExceptionHandling()
        {
            // Create detailed log file
            var logPath = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData), "MandADiscoverySuite", "Logs");
            Directory.CreateDirectory(logPath);
            var logFile = Path.Combine(logPath, $"MandADiscovery_{DateTime.Now:yyyyMMdd_HHmmss}.log");
            
            var logAction = new Action<string>(message =>
            {
                try
                {
                    var timestamp = DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss.fff");
                    var logEntry = $"[{timestamp}] {message}{Environment.NewLine}";
                    File.AppendAllText(logFile, logEntry);
                    System.Diagnostics.Debug.WriteLine(logEntry);
                    Console.WriteLine(logEntry);
                }
                catch { /* Ignore logging errors */ }
            });

            logAction("=== APPLICATION STARTUP LOGGING INITIALIZED ===");
            logAction($"Application Starting at {DateTime.Now}");
            logAction($"Log file: {logFile}");
            logAction($"Working directory: {Environment.CurrentDirectory}");
            logAction($"Application executable: {System.Reflection.Assembly.GetExecutingAssembly().Location}");

            // Catch all unhandled exceptions in the UI thread
            DispatcherUnhandledException += (sender, e) =>
            {
                var errorMessage = $"CRITICAL UI EXCEPTION: {e.Exception.GetType().Name}: {e.Exception.Message}";
                var stackTrace = $"Stack Trace:\n{e.Exception.StackTrace}";
                var innerException = e.Exception.InnerException != null ? $"Inner Exception: {e.Exception.InnerException.Message}\nInner Stack: {e.Exception.InnerException.StackTrace}" : "No inner exception";
                
                var fullError = $"{errorMessage}\n{stackTrace}\n{innerException}";
                
                logAction("=== CRITICAL UI EXCEPTION ===");
                logAction(fullError);
                logAction("=== END CRITICAL UI EXCEPTION ===");
                
                System.Diagnostics.Debug.WriteLine(fullError);
                
                MessageBox.Show($"{errorMessage}\n\nFull details logged to:\n{logFile}\n\nStack trace:\n{e.Exception.StackTrace}", "Critical UI Error", MessageBoxButton.OK, MessageBoxImage.Error);
                
                // Mark as handled to prevent the application from crashing
                e.Handled = true;
            };

            // Catch unhandled exceptions in background threads
            AppDomain.CurrentDomain.UnhandledException += (sender, e) =>
            {
                var exception = e.ExceptionObject as Exception;
                var errorMessage = $"CRITICAL BACKGROUND EXCEPTION: {exception?.GetType().Name}: {exception?.Message}";
                var stackTrace = $"Stack Trace:\n{exception?.StackTrace}";
                var fullError = $"{errorMessage}\n{stackTrace}";
                
                logAction("=== CRITICAL BACKGROUND EXCEPTION ===");
                logAction(fullError);
                logAction("=== END CRITICAL BACKGROUND EXCEPTION ===");
                
                System.Diagnostics.Debug.WriteLine(fullError);
                
                MessageBox.Show($"{errorMessage}\n\nFull details logged to:\n{logFile}", "Critical Background Error", MessageBoxButton.OK, MessageBoxImage.Error);
            };

            // Catch unhandled Task exceptions
            TaskScheduler.UnobservedTaskException += (sender, e) =>
            {
                var errorMessage = $"UNHANDLED TASK EXCEPTION: {e.Exception.GetType().Name}: {e.Exception.Message}";
                var stackTrace = $"Stack Trace:\n{e.Exception.StackTrace}";
                var fullError = $"{errorMessage}\n{stackTrace}";
                
                logAction("=== UNHANDLED TASK EXCEPTION ===");
                logAction(fullError);
                logAction("=== END UNHANDLED TASK EXCEPTION ===");
                
                System.Diagnostics.Debug.WriteLine(fullError);
                
                MessageBox.Show($"{errorMessage}\n\nFull details logged to:\n{logFile}", "Task Error", MessageBoxButton.OK, MessageBoxImage.Error);
                
                // Mark as observed to prevent the application from crashing
                e.SetObserved();
            };
            
            // Store log action for later use
            Current.Properties["LogAction"] = logAction;
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