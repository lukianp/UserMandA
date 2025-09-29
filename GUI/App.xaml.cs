// Version: 1.0.0
// Author: Lukian Poleschtschuk
// Date Modified: 2025-09-16
using System;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using System.Windows;
using System.Windows.Input;
using System.Diagnostics;
using System.Windows.Data;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using MandADiscoverySuite.Models;
using MandADiscoverySuite.Services;
using MandADiscoverySuite.Services.Audit;
using MandADiscoverySuite.Interfaces;
using MandADiscoverySuite.ViewModels;
using MandADiscoverySuite.Helpers;
using MandADiscoverySuite.Navigation;
using MandADiscoverySuite.Views;
using CommunityToolkit.Mvvm.Messaging;
using MandADiscoverySuite.Messages;
using Serilog;
using Serilog.Events;

namespace MandADiscoverySuite
{
    public partial class App : Application
    {
        // IServiceProvider for dependency injection
        public static IServiceProvider ServiceProvider { get; private set; }

        // Static logging action that can be used throughout the class
        private static Action<string> _staticLogAction;

        // Disabled for unified pipeline build
        // private StartupOptimizationService _startupService;
        // private KeyboardShortcutManager _shortcutManager;

        /// <summary>
        /// Configure services for dependency injection
        /// </summary>
        private void ConfigureServices()
        {
            var services = new ServiceCollection();

            try
            {
                // Add basic logging for diagnostic version
                services.AddLogging(builder =>
                {
                    builder.AddConsole();
                    builder.AddDebug();
                    builder.SetMinimumLevel(Microsoft.Extensions.Logging.LogLevel.Information);
                });

                // Add messenger for MVVM
                services.AddSingleton<IMessenger>(WeakReferenceMessenger.Default);

                // Register only essential services for diagnostic version
                services.AddSingleton<ConfigurationService>();
                services.AddSingleton<MandADiscoverySuite.Services.AuditService>();

                // Register other services from the merged section
                services.AddSingleton<CsvDataValidationService>(sp =>
                {
                    var logger = sp.GetRequiredService<ILogger<CsvDataValidationService>>();
                    return new CsvDataValidationService(logger);
                });
                services.AddSingleton<ILogManagementService, LogManagementService>();
                services.AddSingleton<ThemeService>();
                services.AddSingleton<UIInteractionLoggingService>();
                services.AddSingleton<CsvFileWatcherService>();
                services.AddSingleton<ICsvDataLoader>(sp =>
                {
                    var logger = sp.GetRequiredService<ILogger<CsvDataServiceNew>>();
                    return (ICsvDataLoader)new CsvDataServiceNew(logger, "ljpops"); // Use default profile
                });
                services.AddSingleton<NavigationService>();
                services.AddSingleton<DiscoveryService>();
                services.AddSingleton<IDiscoveryService>(provider => provider.GetRequiredService<DiscoveryService>());
                services.AddSingleton<ModuleRegistryService>(provider => ModuleRegistryService.Instance);
                services.AddSingleton<MandADiscoverySuite.Services.TabsService>();
                services.AddSingleton<IEnvironmentDetectionService, EnvironmentDetectionService>();
                services.AddSingleton<IConnectionTestService, ConnectionTestService>();
                services.AddTransient<DiscoveryViewModel>();
                services.AddSingleton<MainViewModel>();
                services.AddSingleton<ProfileService>();
                services.AddSingleton<IKeyboardShortcutService, KeyboardShortcutService>();
                services.AddSingleton<AnimationOptimizationService>();


                // Build the service provider
                ServiceProvider = services.BuildServiceProvider();
            }
            catch (Exception ex)
            {
                _staticLogAction?.Invoke($"ERROR in ConfigureServices: {ex.Message}");
                throw; // Re-throw to ensure the error is handled by the global handler
            }
        }

        protected override void OnStartup(StartupEventArgs e)
        {
            var startTime = DateTime.Now;
            Action<string> logAction = null;

            try
            {
                // Simplified exception handling for diagnostic version
                SetupBasicExceptionHandling();
                logAction = Current.Properties["LogAction"] as Action<string>;

                logAction?.Invoke("=== OnStartup BEGIN (Diagnostic Mode) ===");
                logAction?.Invoke("Basic exception handling setup completed");

                // Simplified initialization for diagnostic version
                logAction?.Invoke("Initializing basic services...");

                // Configure dependency injection services
                logAction?.Invoke("Configuring dependency injection services...");
                ConfigureServices();
                logAction?.Invoke("Dependency injection services configured successfully");

                // Store start time for uptime calculation
                Current.Properties["StartTime"] = startTime;

                // Log basic application startup
                var version = System.Reflection.Assembly.GetExecutingAssembly().GetName().Version?.ToString() ?? "Unknown";
                logAction?.Invoke($"Application v{version} starting up in diagnostic mode");

                // Add resource loading diagnostics
                logAction?.Invoke("Checking resource dictionaries...");
                try {
                    var appResources = this.Resources;
                    logAction?.Invoke($"Application resources loaded: {appResources.Count} items");
                    foreach (var key in appResources.Keys) {
                        logAction?.Invoke($"  Resource key: {key}");
                    }
                } catch (Exception resEx) {
                    logAction?.Invoke($"ERROR loading application resources: {resEx.Message}");
                }

                // Check current working directory and expected paths
                var cwd = Environment.CurrentDirectory;
                logAction?.Invoke($"Current working directory: {cwd}");
                var expectedPath = @"C:\enterprisediscovery";
                var altPath = @"C:\EnterpriseDiscovery";
                logAction?.Invoke($"Expected path exists ({expectedPath}): {System.IO.Directory.Exists(expectedPath)}");
                logAction?.Invoke($"Alternative path exists ({altPath}): {System.IO.Directory.Exists(altPath)}");

                logAction?.Invoke("Calling base.OnStartup...");
                base.OnStartup(e);
                logAction?.Invoke("base.OnStartup completed successfully");
                logAction?.Invoke("StartupUri will handle main window creation automatically");

                // Log startup completion
                var startupDuration = DateTime.Now - startTime;
                logAction?.Invoke($"Startup completed in {startupDuration.TotalSeconds:F1} seconds");

                logAction?.Invoke("=== OnStartup COMPLETED SUCCESSFULLY (Diagnostic Mode) ===");
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
                
                var logFilePath = Current.Properties["LogFilePath"] as string;
                var userMessage = "The application failed to start.\n\n" +
                                  (string.IsNullOrEmpty(logFilePath)
                                      ? "A detailed error log has been created."
                                      : $"A detailed error log has been saved to:\n{logFilePath}") +
                                  "\n\nPlease review the log file or share it with support.";
                MessageBox.Show(userMessage, "Startup Error", MessageBoxButton.OK, MessageBoxImage.Error);
                Shutdown(1);
            }
        }





        private void RegisterApplicationShortcuts(IKeyboardShortcutService shortcutService)
        {
            try
            {
                // Register common application shortcuts
                var shortcuts = new[]
                {
                    new { Id = "app.exit", Name = "Exit Application", Modifiers = ModifierKeys.Alt, Key = Key.F4, Action = new Action(() => Shutdown()) },
                    new { Id = "app.settings", Name = "Open Settings", Modifiers = ModifierKeys.Control, Key = Key.OemComma, Action = new Action(() => ShowSettings()) },
                    new { Id = "help.shortcuts", Name = "Show Keyboard Shortcuts", Modifiers = ModifierKeys.Control, Key = Key.OemQuestion, Action = new Action(() => ShowKeyboardShortcuts()) },
                    new { Id = "app.minimize", Name = "Minimize Window", Modifiers = ModifierKeys.Windows, Key = Key.Down, Action = new Action(() => MinimizeCurrentWindow()) },
                    new { Id = "app.maximize", Name = "Maximize Window", Modifiers = ModifierKeys.Windows, Key = Key.Up, Action = new Action(() => MaximizeCurrentWindow()) }
                };

                foreach (var shortcut in shortcuts)
                {
                    var keyboardShortcut = new KeyboardShortcut(shortcut.Id, shortcut.Name, shortcut.Modifiers, shortcut.Key)
                    {
                        Category = KeyboardShortcutCategory.General,
                        Context = "Application",
                        IsGlobal = false
                    };

                    var command = new RelayCommand(shortcut.Action);
                    shortcutService.RegisterShortcut(keyboardShortcut, command);
                }

                // Register common shortcuts for different contexts
                // KeyboardShortcutIntegration.RegisterDataGridShortcuts(shortcutService);
                // KeyboardShortcutIntegration.RegisterDialogShortcuts(shortcutService);
                // KeyboardShortcutIntegration.RegisterNavigationShortcuts(shortcutService);
                // KeyboardShortcutIntegration.RegisterSearchShortcuts(shortcutService);
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Error registering application shortcuts: {ex.Message}");
            }
        }

        private void ShowSettings()
        {
            // Implementation would show settings dialog
            System.Diagnostics.Debug.WriteLine("Settings shortcut executed");
        }

        private void ShowKeyboardShortcuts()
        {
            try
            {
                var shortcutsWindow = new Window
                {
                    Title = "Keyboard Shortcuts",
                    Content = new MandADiscoverySuite.Views.KeyboardShortcutsView(),
                    Width = 900,
                    Height = 700,
                    WindowStartupLocation = WindowStartupLocation.CenterScreen
                };
                shortcutsWindow.Show();
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Error showing keyboard shortcuts: {ex.Message}");
            }
        }

        private void MinimizeCurrentWindow()
        {
            var activeWindow = Windows.OfType<Window>().FirstOrDefault(w => w.IsActive);
            if (activeWindow != null)
            {
                activeWindow.WindowState = WindowState.Minimized;
            }
        }

        private void MaximizeCurrentWindow()
        {
            var activeWindow = Windows.OfType<Window>().FirstOrDefault(w => w.IsActive);
            if (activeWindow != null)
            {
                activeWindow.WindowState = activeWindow.WindowState == WindowState.Maximized 
                    ? WindowState.Normal 
                    : WindowState.Maximized;
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

        private void SetupBasicExceptionHandling()
        {
            // Setup Serilog structured logging
            var logPath = @"C:\discoverydata\ljpops\Logs";
            Directory.CreateDirectory(logPath);
            var logFile = Path.Combine(logPath, $"MandADiscoverySuite_{DateTime.Now:yyyyMMdd}.log");

            // Configure Serilog with file and console sinks
            Log.Logger = new LoggerConfiguration()
                .MinimumLevel.Information()
                .MinimumLevel.Override("Microsoft", LogEventLevel.Warning)
                .Enrich.FromLogContext()
                .Enrich.WithProperty("Application", "M&A Discovery Suite")
                .WriteTo.File(
                    logFile,
                    rollingInterval: RollingInterval.Day,
                    outputTemplate: "[{Timestamp:yyyy-MM-dd HH:mm:ss.fff} {Level:u3}] {Message:lj}{NewLine}{Exception}",
                    shared: true,
                    flushToDiskInterval: TimeSpan.FromSeconds(1))
                .WriteTo.Console(
                    outputTemplate: "[{Timestamp:HH:mm:ss} {Level:u3}] {Message:lj}{NewLine}{Exception}")
                .CreateLogger();

            // Create async-safe logging action that uses Serilog
            var logAction = new Action<string>(message =>
            {
                try
                {
                    Log.Information(message);
                }
                catch { /* Ignore logging errors */ }
            });

            logAction("=== APPLICATION STARTUP LOGGING INITIALIZED (Serilog) ===");
            logAction($"Application Starting at {DateTime.Now}");
            logAction($"Log file: {logFile}");
            logAction($"Working directory: {Environment.CurrentDirectory}");
            logAction($"Application executable: {System.Reflection.Assembly.GetExecutingAssembly().Location}");

            // Catch all unhandled exceptions in the UI thread
            DispatcherUnhandledException += (sender, e) =>
            {
                Log.Fatal(e.Exception, "CRITICAL UI EXCEPTION: {ExceptionType}", e.Exception.GetType().Name);

                MessageBox.Show($"A critical error occurred: {e.Exception.Message}\n\nDetails have been logged.",
                    "Critical UI Error", MessageBoxButton.OK, MessageBoxImage.Error);

                // Mark as handled to prevent the application from crashing
                e.Handled = true;
            };

            // Catch unhandled exceptions in background threads
            AppDomain.CurrentDomain.UnhandledException += (sender, e) =>
            {
                var exception = e.ExceptionObject as Exception;
                Log.Fatal(exception, "CRITICAL BACKGROUND EXCEPTION: {ExceptionType}, IsTerminating: {IsTerminating}",
                    exception?.GetType().Name ?? "Unknown", e.IsTerminating);

                MessageBox.Show($"A critical background error occurred: {exception?.Message}\n\nDetails have been logged.",
                    "Critical Background Error", MessageBoxButton.OK, MessageBoxImage.Error);
            };

            // Catch unhandled Task exceptions
            TaskScheduler.UnobservedTaskException += (sender, e) =>
            {
                try
                {
                    var exception = e.Exception?.GetBaseException() ?? e.Exception;
                    Log.Error(exception, "UNHANDLED TASK EXCEPTION: {ExceptionType}", exception?.GetType().Name ?? "Unknown");

                    // Mark as observed to prevent application crash - don't show MessageBox for background tasks
                    e.SetObserved();
                }
                catch (Exception handlerEx)
                {
                    Log.Error(handlerEx, "Exception handler itself failed");
                    e.SetObserved();
                }
            };
            
            // Store log action and path for later use
            Current.Properties["LogAction"] = logAction;
            Current.Properties["LogFilePath"] = logFile;

            // Set static log action for use in other methods
            _staticLogAction = logAction;
        }


        protected override void OnExit(ExitEventArgs e)
        {
            try
            {
                // Log shutdown and flush Serilog
                Log.Information("Application shutting down...");
                Log.CloseAndFlush();
            }
            catch
            {
                // Ignore cleanup errors during shutdown
            }

            base.OnExit(e);
        }





        /// <summary>
        /// Enable WPF binding error tracing for debugging
        /// </summary>
    }
}