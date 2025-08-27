using System;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using System.Windows;
using System.Windows.Input;
using System.Diagnostics;
using System.Windows.Data;
using MandADiscoverySuite.Models;
using MandADiscoverySuite.Services;
using MandADiscoverySuite.ViewModels;
using MandADiscoverySuite.Helpers;
using MandADiscoverySuite.Navigation;
using MandADiscoverySuite.Views;
using CommunityToolkit.Mvvm.Messaging;
using MandADiscoverySuite.Messages;

namespace MandADiscoverySuite
{
    public partial class App : Application
    {
        // Disabled for unified pipeline build
        // private StartupOptimizationService _startupService;
        // private KeyboardShortcutManager _shortcutManager;

        protected override void OnStartup(StartupEventArgs e)
        {
            var startTime = DateTime.Now;
            Action<string> logAction = null;
            
            try
            {
                // Set up global exception handling first
                SetupGlobalExceptionHandling();
                logAction = Current.Properties["LogAction"] as Action<string>;
                
                logAction?.Invoke("=== OnStartup BEGIN ===");
                logAction?.Invoke("Global exception handling setup completed");

                // Initialize enhanced logging and audit services early
                logAction?.Invoke("Initializing logging and audit services...");
                var loggingService = EnhancedLoggingService.Instance;
                var auditService = AuditService.Instance;
                _ = Task.Run(async () => await loggingService.LogAsync(Services.LogLevel.Debug, "Debug logging enabled"));
                logAction?.Invoke("Logging and audit services initialized");

                // Initialize SimpleServiceLocator early (moved before UI logging service)
                logAction?.Invoke("Initializing SimpleServiceLocator...");
                SimpleServiceLocator.Initialize();
                logAction?.Invoke("SimpleServiceLocator initialized successfully");

                // Initialize discovery data root path (will use MANDA_DISCOVERY_PATH if set)
                var discoveryPath = ConfigurationService.Instance.DiscoveryDataRootPath;
                logAction?.Invoke($"DiscoveryDataRootPath initialized: {discoveryPath}");

                // Initialize UI interaction logging service for comprehensive click tracking
                logAction?.Invoke("Initializing UI interaction logging service...");
                var uiLoggingService = SimpleServiceLocator.Instance.GetService<UIInteractionLoggingService>();
                uiLoggingService?.Initialize();
                logAction?.Invoke("UI interaction logging service initialized successfully");

                // Store start time for uptime calculation
                Current.Properties["StartTime"] = startTime;
                
                // Log application startup
                var version = System.Reflection.Assembly.GetExecutingAssembly().GetName().Version?.ToString() ?? "Unknown";
                _ = Task.Run(async () => await loggingService.LogApplicationEventAsync("Application Starting", 
                    $"M&A Discovery Suite v{version} is starting up", 
                    new { Version = version, CommandLineArgs = e.Args, StartTime = startTime }));
                
                // SimpleServiceLocator already initialized above
                
                logAction?.Invoke("Getting ThemeService...");
                var themeService = SimpleServiceLocator.Instance.GetService<ThemeService>();
                logAction?.Invoke($"ThemeService retrieved: {(themeService != null ? "Success" : "NULL")}");
                
                if (themeService != null)
                {
                    logAction?.Invoke("Initializing ThemeService...");
                    themeService.Initialize();
                    logAction?.Invoke("ThemeService initialized successfully");

                    // Register for theme change messages to reload theme resources
                    var messenger = SimpleServiceLocator.Instance.GetService<IMessenger>();
                    messenger?.Register<App, ThemeChangedMessage>(this, (r, m) =>
                    {
                        r.ApplyThemeDictionary(m.IsDarkTheme);
                    });
                }
                
                // Freeze static gradient brushes for performance
                logAction?.Invoke("Freezing static gradient brushes...");
                FreezeStaticBrushes();
                logAction?.Invoke("Static brushes frozen successfully");
                
                // Initialize startup optimization service - DISABLED for unified pipeline
                logAction?.Invoke("Skipping startup optimization service (disabled for unified pipeline)...");
                // _startupService = SimpleServiceLocator.Instance.GetService<StartupOptimizationService>();
                logAction?.Invoke("Startup optimization service skipped");
                
                // Initialize keyboard shortcuts - DISABLED for unified pipeline
                logAction?.Invoke("Skipping keyboard shortcuts (disabled for unified pipeline)...");
                // InitializeKeyboardShortcuts();
                logAction?.Invoke("Keyboard shortcuts skipped");
                
                // Initialize ViewRegistry for navigation
                logAction?.Invoke("Initializing ViewRegistry...");
                InitializeViewRegistry();
                logAction?.Invoke("ViewRegistry initialized successfully");
                
                // Initialize CSV file watcher for real-time data ingestion
                logAction?.Invoke("Initializing CSV file watcher...");
                InitializeCsvFileWatcher();
                logAction?.Invoke("CSV file watcher initialized successfully");
                
                // Initialize LogicEngineService for data fabric and inference
                logAction?.Invoke("Initializing LogicEngineService...");
                InitializeLogicEngineService();
                logAction?.Invoke("LogicEngineService initialized successfully");
                
                // Enable WPF binding tracing for debugging
                logAction?.Invoke("Enabling WPF binding tracing...");
                EnableBindingTracing();
                logAction?.Invoke("WPF binding tracing enabled");
                
                logAction?.Invoke("Calling base.OnStartup...");
                base.OnStartup(e);
                logAction?.Invoke("base.OnStartup completed successfully");

                // Log startup completion
                var startupDuration = DateTime.Now - startTime;
                _ = Task.Run(async () => await loggingService.LogStartupAsync(version, startupDuration));
                _ = Task.Run(async () => await auditService.LogSystemStartupAsync(version, startupDuration));
                
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
                
                // Complete startup optimization - DISABLED for unified pipeline
                // await _startupService?.CompleteStartupAsync();
                
                // Startup service completion skipped
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
                var animationService = SimpleServiceLocator.Instance.GetService<AnimationOptimizationService>();
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

        private void InitializeKeyboardShortcuts()
        {
            try
            {
                var shortcutService = SimpleServiceLocator.Instance.GetService<IKeyboardShortcutService>();
                if (shortcutService != null)
                {
                    // _shortcutManager = new KeyboardShortcutManager(shortcutService);
                    
                    // Register application-wide shortcuts
                    // _shortcutManager.RegisterApplicationShortcuts();
                    
                    // Register common application shortcuts
                    RegisterApplicationShortcuts(shortcutService);
                    
                    System.Diagnostics.Debug.WriteLine("Keyboard shortcuts initialized successfully");
                }
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Failed to initialize keyboard shortcuts: {ex.Message}");
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

        private void SetupGlobalExceptionHandling()
        {
            // Create detailed log file using ConfigurationService for path
            var logPath = Path.Combine(ConfigurationService.Instance.DiscoveryDataRootPath, "ljpops", "Logs");
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

        private void FreezeStaticBrushes()
        {
            try
            {
                // Get static gradient brushes from resources and freeze them for performance
                var staticBrushKeys = new[]
                {
                    "PrimaryGradient", "AccentGradient", "SuccessGradient", "DangerGradient",
                    "GlassmorphismBrush", "NeonCyanGradient", "NeonPinkGradient", "HolographicGradient"
                };

                foreach (var key in staticBrushKeys)
                {
                    if (Resources[key] is Freezable freezable && !freezable.IsFrozen)
                    {
                        freezable.Freeze();
                        System.Diagnostics.Debug.WriteLine($"Frozen brush: {key}");
                    }
                }
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Error freezing brushes: {ex.Message}");
            }
        }

        protected override void OnExit(ExitEventArgs e)
        {
            try
            {
                // Clean up keyboard shortcuts
                // KeyboardShortcutIntegration.CleanupAll();
                // _shortcutManager?.Dispose();
                
                // Clean up startup optimization service
                // _startupService?.Dispose();
                
                // Clean up service container
                // SimpleServiceLocator.Clear();
            }
            catch
            {
                // Ignore cleanup errors during shutdown
            }
            
            base.OnExit(e);
        }

        /// <summary>
        /// Initialize the ViewRegistry with all navigation mappings
        /// </summary>
        private void InitializeViewRegistry()
        {
            try
            {
                // ViewRegistry is now self-contained with all mappings in its constructor
                // No need to register additional views here - all are handled in ViewRegistry.cs
                // This prevents conflicts and double-registration issues
                
                var registeredKeys = ViewRegistry.Instance.GetRegisteredKeys().ToList();
                System.Diagnostics.Debug.WriteLine($"ViewRegistry initialized with {registeredKeys.Count} view registrations: {string.Join(", ", registeredKeys.Take(10))}");
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Failed to initialize ViewRegistry: {ex.Message}");
            }
        }

        /// <summary>
        /// Initialize CSV file watcher for real-time data ingestion
        /// </summary>
        private void InitializeCsvFileWatcher()
        {
            try
            {
                var csvWatcher = SimpleServiceLocator.Instance.GetService<CsvFileWatcherService>();
                if (csvWatcher != null)
                {
                    csvWatcher.StartWatching();
                    System.Diagnostics.Debug.WriteLine("CSV file watcher started successfully");
                }
                else
                {
                    System.Diagnostics.Debug.WriteLine("Failed to get CsvFileWatcherService from SimpleServiceLocator");
                }
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Failed to initialize CSV file watcher: {ex.Message}");
            }
        }

        /// <summary>
        /// Initialize LogicEngineService for unified data access and inference
        /// </summary>
        private void InitializeLogicEngineService()
        {
            try
            {
                var logicEngine = SimpleServiceLocator.Instance.GetService<ILogicEngineService>();
                if (logicEngine != null)
                {
                    // Set up event handlers for data loading
                    logicEngine.DataLoaded += (sender, e) =>
                    {
                        System.Diagnostics.Debug.WriteLine($"LogicEngine data loaded successfully: {e.Statistics.UserCount} users, {e.Statistics.DeviceCount} devices in {e.Statistics.LoadDuration.TotalSeconds:F1}s");
                    };
                    
                    logicEngine.DataLoadError += (sender, e) =>
                    {
                        System.Diagnostics.Debug.WriteLine($"LogicEngine data load error: {e.ErrorMessage}");
                    };
                    
                    // Start initial data load in background
                    Task.Run(async () =>
                    {
                        try
                        {
                            var success = await logicEngine.LoadAllAsync();
                            System.Diagnostics.Debug.WriteLine($"LogicEngine initial load result: {success}");
                        }
                        catch (Exception ex)
                        {
                            System.Diagnostics.Debug.WriteLine($"LogicEngine initial load failed: {ex.Message}");
                        }
                    });
                    
                    System.Diagnostics.Debug.WriteLine("LogicEngineService initialized successfully");
                }
                else
                {
                    System.Diagnostics.Debug.WriteLine("Failed to get LogicEngineService from SimpleServiceLocator");
                }
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Failed to initialize LogicEngineService: {ex.Message}");
            }
        }

        private void ApplyThemeDictionary(bool isDarkTheme)
        {
            try
            {
                var themeName = isDarkTheme ? "DarkTheme" : "LightTheme";
                var app = Application.Current;
                if (app == null) return;

                for (int i = app.Resources.MergedDictionaries.Count - 1; i >= 0; i--)
                {
                    var dict = app.Resources.MergedDictionaries[i];
                    if (dict.Source?.OriginalString?.Contains("Theme") == true)
                    {
                        app.Resources.MergedDictionaries.RemoveAt(i);
                    }
                }

                var themeUri = new Uri($"pack://application:,,,/MandADiscoverySuite;component/Themes/{themeName}.xaml");
                var themeDict = new ResourceDictionary { Source = themeUri };
                app.Resources.MergedDictionaries.Add(themeDict);
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Failed to apply theme dictionary: {ex.Message}");
            }
        }

        /// <summary>
        /// Enable WPF binding error tracing for debugging
        /// </summary>
        private void EnableBindingTracing()
        {
            try
            {
                // Ensure logs directory exists using ConfigurationService
                var logsDirectory = Path.Combine(ConfigurationService.Instance.DiscoveryDataRootPath, "ljpops", "Logs");
                Directory.CreateDirectory(logsDirectory);
                
                // Set up WPF binding trace listener
                PresentationTraceSources.DataBindingSource.Switch.Level = SourceLevels.Warning | SourceLevels.Error;
                PresentationTraceSources.DataBindingSource.Listeners.Add(
                    new TextWriterTraceListener(Path.Combine(logsDirectory, "gui-binding.log"))
                );
                Trace.AutoFlush = true;

                System.Diagnostics.Debug.WriteLine("WPF binding tracing enabled");
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Failed to enable binding tracing: {ex.Message}");
            }
        }
    }
}