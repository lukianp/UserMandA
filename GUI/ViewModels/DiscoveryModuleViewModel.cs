using System;
using System.Threading.Tasks;
using System.Windows.Input;
using MandADiscoverySuite.Models;

namespace MandADiscoverySuite.ViewModels
{
    /// <summary>
    /// View model for discovery module configuration and status
    /// </summary>
    public class DiscoveryModuleViewModel : BaseViewModel
    {
        #region Private Fields

        private bool _isEnabled;
        private DiscoveryModuleStatus _status;
        private double _progress;
        private string _lastMessage;
        private DateTime? _lastRunTime;
        private TimeSpan? _lastRunDuration;
        private int _lastRunItemCount;
        private bool _hasConfiguration;
        private string _configurationSummary;

        #endregion

        #region Properties

        /// <summary>
        /// Unique identifier for the module
        /// </summary>
        public string ModuleName { get; }

        /// <summary>
        /// Display name for the module
        /// </summary>
        public string DisplayName { get; }

        /// <summary>
        /// Description of what the module discovers
        /// </summary>
        public string Description { get; }

        /// <summary>
        /// Icon or emoji representing the module
        /// </summary>
        public string Icon { get; }

        /// <summary>
        /// Category of the module (Identity, Infrastructure, Applications, etc.)
        /// </summary>
        public string Category { get; set; }

        /// <summary>
        /// Whether the module is enabled for discovery
        /// </summary>
        public bool IsEnabled
        {
            get => _isEnabled;
            set => SetProperty(ref _isEnabled, value, OnEnabledChanged);
        }

        /// <summary>
        /// Current status of the module
        /// </summary>
        public DiscoveryModuleStatus Status
        {
            get => _status;
            set => SetProperty(ref _status, value, () => OnPropertiesChanged(nameof(StatusText), nameof(StatusColor), nameof(IsRunning), nameof(CanToggle), nameof(CanConfigure), nameof(CanRun)));
        }

        /// <summary>
        /// Progress of current operation (0-100)
        /// </summary>
        public double Progress
        {
            get => _progress;
            set => SetProperty(ref _progress, value);
        }

        /// <summary>
        /// Last status message from the module
        /// </summary>
        public string LastMessage
        {
            get => _lastMessage;
            set => SetProperty(ref _lastMessage, value);
        }

        /// <summary>
        /// Time of last successful run
        /// </summary>
        public DateTime? LastRunTime
        {
            get => _lastRunTime;
            set => SetProperty(ref _lastRunTime, value, () => OnPropertiesChanged(nameof(LastRunTimeText), nameof(HasLastRun)));
        }

        /// <summary>
        /// Duration of last run
        /// </summary>
        public TimeSpan? LastRunDuration
        {
            get => _lastRunDuration;
            set => SetProperty(ref _lastRunDuration, value, () => OnPropertyChanged(nameof(LastRunDurationText)));
        }

        /// <summary>
        /// Number of items discovered in last run
        /// </summary>
        public int LastRunItemCount
        {
            get => _lastRunItemCount;
            set => SetProperty(ref _lastRunItemCount, value, () => OnPropertyChanged(nameof(LastRunItemCountText)));
        }

        /// <summary>
        /// Whether the module has configurable options
        /// </summary>
        public bool HasConfiguration
        {
            get => _hasConfiguration;
            set => SetProperty(ref _hasConfiguration, value);
        }

        /// <summary>
        /// Summary of current configuration
        /// </summary>
        public string ConfigurationSummary
        {
            get => _configurationSummary;
            set => SetProperty(ref _configurationSummary, value);
        }

        /// <summary>
        /// Text representation of current status
        /// </summary>
        public string StatusText
        {
            get
            {
                return Status switch
                {
                    DiscoveryModuleStatus.Ready => "Ready",
                    DiscoveryModuleStatus.Running => "Running",
                    DiscoveryModuleStatus.Completed => "Completed",
                    DiscoveryModuleStatus.Failed => "Failed",
                    DiscoveryModuleStatus.Cancelled => "Cancelled",
                    DiscoveryModuleStatus.Disabled => "Disabled",
                    _ => "Unknown"
                };
            }
        }

        /// <summary>
        /// Color associated with current status
        /// </summary>
        public string StatusColor
        {
            get
            {
                return Status switch
                {
                    DiscoveryModuleStatus.Ready => "#4CAF50",      // Green
                    DiscoveryModuleStatus.Running => "#2196F3",    // Blue
                    DiscoveryModuleStatus.Completed => "#4CAF50",  // Green
                    DiscoveryModuleStatus.Failed => "#F44336",     // Red
                    DiscoveryModuleStatus.Cancelled => "#FF9800",  // Orange
                    DiscoveryModuleStatus.Disabled => "#9E9E9E",   // Gray
                    _ => "#9E9E9E"                                  // Gray
                };
            }
        }

        /// <summary>
        /// Formatted last run time text
        /// </summary>
        public string LastRunTimeText
        {
            get
            {
                if (!LastRunTime.HasValue)
                    return "Never run";

                var timeAgo = DateTime.Now - LastRunTime.Value;
                if (timeAgo.TotalMinutes < 1)
                    return "Just now";
                if (timeAgo.TotalHours < 1)
                    return $"{(int)timeAgo.TotalMinutes} minutes ago";
                if (timeAgo.TotalDays < 1)
                    return $"{(int)timeAgo.TotalHours} hours ago";
                if (timeAgo.TotalDays < 7)
                    return $"{(int)timeAgo.TotalDays} days ago";
                
                return LastRunTime.Value.ToString("yyyy-MM-dd HH:mm");
            }
        }

        /// <summary>
        /// Formatted last run duration text
        /// </summary>
        public string LastRunDurationText
        {
            get
            {
                if (!LastRunDuration.HasValue)
                    return "N/A";

                var duration = LastRunDuration.Value;
                if (duration.TotalSeconds < 60)
                    return $"{(int)duration.TotalSeconds}s";
                if (duration.TotalMinutes < 60)
                    return $"{(int)duration.TotalMinutes}m {duration.Seconds}s";
                return $"{(int)duration.TotalHours}h {duration.Minutes}m";
            }
        }

        /// <summary>
        /// Formatted last run item count text
        /// </summary>
        public string LastRunItemCountText
        {
            get
            {
                if (LastRunItemCount == 0)
                    return "No items";
                if (LastRunItemCount == 1)
                    return "1 item";
                return $"{LastRunItemCount:N0} items";
            }
        }

        /// <summary>
        /// Whether the module has been run before
        /// </summary>
        public bool HasLastRun => LastRunTime.HasValue;

        /// <summary>
        /// Whether the module is currently running
        /// </summary>
        public bool IsRunning => Status == DiscoveryModuleStatus.Running;

        /// <summary>
        /// Whether the module can be configured
        /// </summary>
        public bool CanConfigure => HasConfiguration && !IsRunning;

        /// <summary>
        /// Whether the module can be toggled
        /// </summary>
        public bool CanToggle => !IsRunning;

        /// <summary>
        /// Whether the module can be run
        /// </summary>
        public bool CanRun => IsEnabled && !IsRunning;

        #endregion

        #region Commands

        public ICommand ToggleEnabledCommand { get; }
        public ICommand ConfigureCommand { get; }
        public ICommand ViewResultsCommand { get; }
        public ICommand ViewLogsCommand { get; }
        public ICommand RunDiscoveryCommand { get; }

        #endregion

        #region Constructor

        public DiscoveryModuleViewModel(string moduleName, string displayName, string description, bool isEnabled = false)
        {
            ModuleName = moduleName ?? throw new ArgumentNullException(nameof(moduleName));
            DisplayName = displayName ?? throw new ArgumentNullException(nameof(displayName));
            Description = description ?? throw new ArgumentNullException(nameof(description));
            
            _isEnabled = isEnabled;
            _status = isEnabled ? DiscoveryModuleStatus.Ready : DiscoveryModuleStatus.Disabled;
            _progress = 0;
            _lastMessage = "Module initialized";

            // Set icon and category based on module name
            (Icon, Category) = GetModuleIconAndCategory(moduleName);

            // Initialize commands
            ToggleEnabledCommand = new RelayCommand(() => IsEnabled = !IsEnabled, () => CanToggle);
            ConfigureCommand = new RelayCommand(OnConfigure, () => CanConfigure);
            ViewResultsCommand = new RelayCommand(OnViewResults, () => HasLastRun);
            ViewLogsCommand = new RelayCommand(OnViewLogs);
            RunDiscoveryCommand = new AsyncRelayCommand(OnRunDiscoveryAsync, () => IsEnabled && !IsRunning);

            // Set default configuration
            _hasConfiguration = true;
            _configurationSummary = "Default configuration";
        }

        #endregion

        #region Event Handlers

        private void OnEnabledChanged()
        {
            Status = IsEnabled ? DiscoveryModuleStatus.Ready : DiscoveryModuleStatus.Disabled;
            LastMessage = IsEnabled ? "Module enabled" : "Module disabled";
            
            OnPropertiesChanged(nameof(CanToggle), nameof(CanConfigure), nameof(CanRun));
        }

        private void OnConfigure()
        {
            try
            {
                // Create a simple configuration dialog
                var configDialog = new System.Windows.Window
                {
                    Title = $"Configure {DisplayName}",
                    Width = 400,
                    Height = 300,
                    WindowStartupLocation = System.Windows.WindowStartupLocation.CenterOwner,
                    Owner = System.Windows.Application.Current.MainWindow
                };
                
                var textBlock = new System.Windows.Controls.TextBlock
                {
                    Text = $"Configuration options for {DisplayName} module:\n\n" +
                           "• Module is currently using default settings\n" +
                           "• Advanced configuration will be available in future versions\n" +
                           "• Contact your administrator for custom settings",
                    Margin = new System.Windows.Thickness(20),
                    TextWrapping = System.Windows.TextWrapping.Wrap
                };
                
                configDialog.Content = textBlock;
                configDialog.ShowDialog();
                
                LastMessage = "Configuration dialog displayed";
            }
            catch (Exception ex)
            {
                LastMessage = $"Failed to show configuration: {ex.Message}";
            }
        }

        private void OnViewResults()
        {
            try
            {
                // Get the results path for this module
                var rootPath = GetRootPath();
                var resultsPath = System.IO.Path.Combine(rootPath, "Results", ModuleName);
                
                if (System.IO.Directory.Exists(resultsPath))
                {
                    // Open results folder in Windows Explorer
                    System.Diagnostics.Process.Start("explorer.exe", resultsPath);
                    LastMessage = "Results folder opened in Explorer";
                }
                else
                {
                    var message = $"No results found for {DisplayName}.\n\n" +
                                  $"Expected location: {resultsPath}\n\n" +
                                  "Run a discovery to generate results.";
                    
                    System.Windows.MessageBox.Show(message, "No Results Found", 
                                                  System.Windows.MessageBoxButton.OK, 
                                                  System.Windows.MessageBoxImage.Information);
                    LastMessage = "No results found";
                }
            }
            catch (Exception ex)
            {
                LastMessage = $"Failed to view results: {ex.Message}";
            }
        }

        private void OnViewLogs()
        {
            try
            {
                // Get the logs path for this module
                var rootPath = GetRootPath();
                var logsPath = System.IO.Path.Combine(rootPath, "Logs", $"{ModuleName}.log");
                
                if (System.IO.File.Exists(logsPath))
                {
                    // Open log file with default text editor
                    System.Diagnostics.Process.Start(new System.Diagnostics.ProcessStartInfo
                    {
                        FileName = logsPath,
                        UseShellExecute = true
                    });
                    LastMessage = "Log file opened";
                }
                else
                {
                    // Check for general log directory
                    var logDir = System.IO.Path.GetDirectoryName(logsPath);
                    if (System.IO.Directory.Exists(logDir))
                    {
                        System.Diagnostics.Process.Start("explorer.exe", logDir);
                        LastMessage = "Logs directory opened";
                    }
                    else
                    {
                        var message = $"No logs found for {DisplayName}.\n\n" +
                                      $"Expected location: {logsPath}\n\n" +
                                      "Run a discovery to generate logs.";
                        
                        System.Windows.MessageBox.Show(message, "No Logs Found", 
                                                      System.Windows.MessageBoxButton.OK, 
                                                      System.Windows.MessageBoxImage.Information);
                        LastMessage = "No logs found";
                    }
                }
            }
            catch (Exception ex)
            {
                LastMessage = $"Failed to view logs: {ex.Message}";
            }
        }

        private async Task OnRunDiscoveryAsync()
        {
            try
            {
                // Set status immediately to prevent multiple concurrent launches
                if (Status == DiscoveryModuleStatus.Running)
                {
                    LastMessage = "Discovery already running";
                    return;
                }

                Status = DiscoveryModuleStatus.Running;
                LastMessage = "Initializing discovery...";

                // Perform path validation asynchronously, but create window on UI thread
                string launcherScriptPath = null;
                string companyName = "ljpops";

                await Task.Run(() =>
                {
                    try
                    {
                        // Get the root path for scripts
                        var rootPath = GetRootPath();
                        launcherScriptPath = System.IO.Path.Combine(rootPath, "Scripts", "DiscoveryModuleLauncher.ps1");
                        
                        if (!System.IO.File.Exists(launcherScriptPath))
                        {
                            System.Windows.Application.Current.Dispatcher.Invoke(() =>
                            {
                                LastMessage = "Discovery launcher script not found";
                                Status = DiscoveryModuleStatus.Failed;
                            });
                            launcherScriptPath = null;
                            return;
                        }

                        // Get selected profile from MainWindow
                        System.Windows.Application.Current.Dispatcher.Invoke(() =>
                        {
                            try
                            {
                                var mainWindow = System.Windows.Application.Current.MainWindow as MainWindow;
                                if (mainWindow?.ViewModel?.SelectedProfile != null)
                                {
                                    companyName = mainWindow.ViewModel.SelectedProfile.CompanyName;
                                }
                            }
                            catch
                            {
                                // Fallback to default if we can't access the main window
                            }
                        });
                    }
                    catch (Exception ex)
                    {
                        System.Windows.Application.Current.Dispatcher.Invoke(() =>
                        {
                            LastMessage = $"Failed to validate script path: {ex.Message}";
                            Status = DiscoveryModuleStatus.Failed;
                        });
                        launcherScriptPath = null;
                    }
                });

                // If validation failed, exit early
                if (string.IsNullOrEmpty(launcherScriptPath))
                {
                    return;
                }

                // Create and show PowerShell window on UI thread
                try
                {
                    LastMessage = $"Creating PowerShell window for script: {launcherScriptPath}";
                    
                    var powerShellWindow = new PowerShellWindow(
                        launcherScriptPath,
                        $"{DisplayName}",
                        $"{Description} for {companyName}",
                        "-ModuleName", ModuleName,
                        "-CompanyName", companyName
                    );
                    
                    LastMessage = "PowerShell window created, attempting to show...";
                    powerShellWindow.Show();
                    LastMessage = "Discovery window launched successfully";
                }
                catch (Exception showEx)
                {
                    LastMessage = $"Failed to show window: {showEx.Message} | Stack: {showEx.StackTrace}";
                    Status = DiscoveryModuleStatus.Failed;
                }
            }
            catch (Exception ex)
            {
                LastMessage = $"Failed to launch discovery: {ex.Message}";
                Status = DiscoveryModuleStatus.Failed;
            }
        }

        #endregion

        #region Helper Methods

        private static string GetRootPath()
        {
            // Priority order for application path resolution:
            // 1. Environment variable MANDA_APP_PATH
            // 2. Registry setting (for enterprise deployment)
            // 3. Executable directory (portable mode)
            // 4. Default system location
            
            string appPath = null;
            
            // Try environment variable first
            appPath = Environment.GetEnvironmentVariable("MANDA_APP_PATH");
            if (!string.IsNullOrEmpty(appPath) && System.IO.Directory.Exists(appPath))
            {
                return appPath;
            }
            
            // Try registry setting (for enterprise installations)
            try
            {
                using (var key = Microsoft.Win32.Registry.LocalMachine.OpenSubKey(@"SOFTWARE\MandADiscoverySuite"))
                {
                    appPath = key?.GetValue("InstallPath") as string;
                    if (!string.IsNullOrEmpty(appPath) && System.IO.Directory.Exists(appPath))
                    {
                        return appPath;
                    }
                }
            }
            catch { /* Registry access may fail in restricted environments */ }
            
            // Try portable mode (executable directory)
            var exeDir = System.IO.Path.GetDirectoryName(System.Reflection.Assembly.GetExecutingAssembly().Location);
            var modulesPath = System.IO.Path.Combine(exeDir, "Modules");
            if (System.IO.Directory.Exists(modulesPath))
            {
                return exeDir;
            }
            
            // Try current working directory
            var currentDir = System.IO.Directory.GetCurrentDirectory();
            modulesPath = System.IO.Path.Combine(currentDir, "Modules");
            if (System.IO.Directory.Exists(modulesPath))
            {
                return currentDir;
            }
            
            // Default to system location
            return @"C:\enterprisediscovery";
        }

        private static (string Icon, string Category) GetModuleIconAndCategory(string moduleName)
        {
            return moduleName.ToLowerInvariant() switch
            {
                // Core Infrastructure
                "activedirectory" => ("👥", "Identity"),
                "physicalserverdiscovery" => ("🖥️", "Infrastructure"),
                "networkinfrastructurediscovery" => ("🌐", "Infrastructure"),
                "sqlserverdiscovery" => ("🗄️", "Data"),
                "fileserverdiscovery" => ("📁", "Storage"),
                "vmwarediscovery" => ("💻", "Virtualization"),
                "storagearraydiscovery" => ("💾", "Storage"),
                
                // Microsoft 365 & Cloud Services
                "azuread" => ("☁️", "Identity"),
                "azureresourcediscovery" => ("🔷", "Cloud"),
                "exchangediscovery" => ("📧", "Collaboration"),
                "sharepointdiscovery" => ("📚", "Collaboration"),
                "teamsdiscovery" => ("💬", "Collaboration"),
                "intunediscovery" => ("📱", "Device Management"),
                "powerplatformdiscovery" => ("⚡", "Collaboration"),
                
                // Applications & Dependencies
                "applicationdiscovery" => ("📦", "Applications"),
                "applicationdependencymapping" => ("🔗", "Applications"),
                "databaseschemadiscovery" => ("🗂️", "Data"),
                
                // Security & Compliance
                "securityinfrastructurediscovery" => ("🛡️", "Security"),
                "securitygroupanalysis" => ("🔒", "Security"),
                "certificatediscovery" => ("🔐", "Security"),
                "threatdetectionengine" => ("🚨", "Security"),
                "complianceassessmentframework" => ("📋", "Compliance"),
                
                // Data Governance & Classification
                "dataclassification" => ("🏷️", "Data"),
                "datagovernancemetadatamanagement" => ("📊", "Data Governance"),
                "datalineagedependencyengine" => ("🔄", "Data Governance"),
                
                // External Systems & Identity
                "externalidentitydiscovery" => ("🔑", "Identity"),
                "paloaltodiscovery" => ("🔥", "Security"),
                
                // Infrastructure & Operations
                "backuprecoverydiscovery" => ("💿", "Infrastructure"),
                "containerorchestration" => ("📦", "Cloud"),
                "printerdiscovery" => ("🖨️", "Infrastructure"),
                "scheduledtaskdiscovery" => ("⏰", "Operations"),
                
                // Cloud & Multi-Platform
                "multiclouddiscoveryengine" => ("☁️", "Cloud"),
                "graphdiscovery" => ("📈", "Identity"),
                
                // Phase 1 High-Value Modules
                "environmentriskscoring" => ("⚖️", "Risk Assessment"),
                "entraidappdiscovery" => ("🔷", "Identity"),
                "licensingdiscovery" => ("📄", "Compliance"),
                "multidomainforestdiscovery" => ("🌳", "Identity"),
                "gpodiscovery" => ("📋", "Security"),
                
                _ => ("⚙️", "Other")
            };
        }

        /// <summary>
        /// Updates the module with results from a discovery run
        /// </summary>
        /// <param name="itemCount">Number of items discovered</param>
        /// <param name="duration">Duration of the run</param>
        /// <param name="message">Final status message</param>
        public void UpdateRunResults(int itemCount, TimeSpan duration, string message = null)
        {
            LastRunTime = DateTime.Now;
            LastRunDuration = duration;
            LastRunItemCount = itemCount;
            
            if (!string.IsNullOrWhiteSpace(message))
                LastMessage = message;
            
            Progress = 100;
            Status = DiscoveryModuleStatus.Completed;
        }

        /// <summary>
        /// Marks the module as failed with an error message
        /// </summary>
        /// <param name="errorMessage">Error message</param>
        public void MarkAsFailed(string errorMessage)
        {
            Status = DiscoveryModuleStatus.Failed;
            LastMessage = errorMessage;
            Progress = 0;
        }

        /// <summary>
        /// Resets the module to ready state
        /// </summary>
        public void Reset()
        {
            Status = IsEnabled ? DiscoveryModuleStatus.Ready : DiscoveryModuleStatus.Disabled;
            Progress = 0;
            LastMessage = "Module reset";
        }

        #endregion
    }
}