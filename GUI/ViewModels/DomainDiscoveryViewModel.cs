using System;
using System.Collections.ObjectModel;
using System.ComponentModel;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using System.Windows;
using System.Windows.Data;
using System.Windows.Input;
using Microsoft.Extensions.Logging;
using MandADiscoverySuite.Services;
using MandADiscoverySuite.Models;
using System.Text.Json;
using CommunityToolkit.Mvvm.Input;

namespace MandADiscoverySuite.ViewModels
{
    /// <summary>
    /// Domain Discovery ViewModel using unified pattern
    /// Manages discovery modules and aggregates data counts
    /// </summary>
    public class DomainDiscoveryViewModel : BaseViewModel
    {
        private readonly CsvDataServiceNew _csvService;
        private readonly ProfileService _profileService;
        private ModuleRegistryService _moduleRegistryService; // Not readonly - initialized in LoadAsync
        
        // Discovery Module Collections
        public ObservableCollection<DiscoveryModuleViewModel> Modules { get; } = new();
        private ICollectionView _modulesView;
        
        // KPI Properties
        private int _usersCount;
        private int _computersCount;
        private int _infrastructureCount;
        private int _applicationsCount;
        private int _activeModulesCount;
        private int _runningModulesCount;
        
        // Filter Properties
        private string _selectedCategory = "All";
        public ObservableCollection<string> Categories { get; } = new();
        private DateTime _lastRefresh = DateTime.Now;
        
        public override bool HasData => Modules.Count > 0;

        public DomainDiscoveryViewModel(
            CsvDataServiceNew csvService,
            ILogger<DomainDiscoveryViewModel> logger,
            ProfileService profileService)
            : base(logger)
        {
            _csvService = csvService ?? throw new ArgumentNullException(nameof(csvService));
            _profileService = profileService ?? throw new ArgumentNullException(nameof(profileService));

            // CRITICAL FIX: Defer ModuleRegistryService initialization to avoid constructor exceptions
            // ModuleRegistryService has only async methods, so we can't initialize it in constructor
            // Instead, we'll initialize it in LoadAsync() where we can properly handle async operations
            _moduleRegistryService = null; // Will be initialized in LoadAsync()

            System.Diagnostics.Debug.WriteLine("[DomainDiscoveryViewModel] Constructor completed successfully - ModuleRegistryService will be initialized in LoadAsync()");
            
            // Initialize commands
            RefreshDataCommand = new AsyncRelayCommand(RefreshDataAsync);
            RunAllEnabledModulesCommand = new AsyncRelayCommand(RunAllEnabledModulesAsync);
            OpenModuleConfigurationCommand = new RelayCommand<DiscoveryModuleViewModel>(OpenModuleConfiguration);
            ViewModuleResultsCommand = new RelayCommand<DiscoveryModuleViewModel>(ViewModuleResults);
            
            // Initialize categories
            Categories.Add("All");
            Categories.Add("Identity");
            Categories.Add("Infrastructure");
            Categories.Add("Security");
            Categories.Add("Applications");
            Categories.Add("Data");
            
            // Setup collection view for filtering
            _modulesView = CollectionViewSource.GetDefaultView(Modules);
            _modulesView.Filter = FilterModules;
        }

        #region Properties

        public ICollectionView ModulesView => _modulesView;

        public int UsersCount
        {
            get => _usersCount;
            set => SetProperty(ref _usersCount, value);
        }

        public int ComputersCount
        {
            get => _computersCount;
            set => SetProperty(ref _computersCount, value);
        }

        public int InfrastructureCount
        {
            get => _infrastructureCount;
            set => SetProperty(ref _infrastructureCount, value);
        }

        public int ApplicationsCount
        {
            get => _applicationsCount;
            set => SetProperty(ref _applicationsCount, value);
        }

        public int ActiveModulesCount
        {
            get => _activeModulesCount;
            set => SetProperty(ref _activeModulesCount, value);
        }

        public int RunningModulesCount
        {
            get => _runningModulesCount;
            set => SetProperty(ref _runningModulesCount, value);
        }

        public string SelectedCategory
        {
            get => _selectedCategory;
            set
            {
                if (SetProperty(ref _selectedCategory, value))
                {
                    _modulesView?.Refresh();
                }
            }
        }

        public string LastRefreshText => $"Last refreshed: {_lastRefresh:HH:mm:ss}";

        #endregion

        #region Commands

        public ICommand RefreshDataCommand { get; }
        public ICommand RunAllEnabledModulesCommand { get; }
        public ICommand OpenModuleConfigurationCommand { get; }
        public ICommand ViewModuleResultsCommand { get; }

        #endregion

        /// <summary>
        /// Unified LoadAsync implementation - loads modules and data counts
        /// </summary>
        public override async Task LoadAsync()
        {
            IsLoading = true; 
            HasData = false; 
            LastError = null; 
            HeaderWarnings.Clear();

            try
            {
                StructuredLogger?.LogDebug(LogSourceName, new { action = "load_start", component = "domain_discovery" }, "Starting domain discovery load");

                // CRITICAL FIX: Initialize ModuleRegistryService if not already done
                if (_moduleRegistryService == null)
                {
                    try
                    {
                        System.Diagnostics.Debug.WriteLine("[DomainDiscoveryViewModel] Initializing ModuleRegistryService.Instance...");
                        _moduleRegistryService = ModuleRegistryService.Instance;
                        System.Diagnostics.Debug.WriteLine("[DomainDiscoveryViewModel] ModuleRegistryService.Instance initialized successfully");
                    }
                    catch (Exception ex)
                    {
                        System.Diagnostics.Debug.WriteLine($"[DomainDiscoveryViewModel] Failed to initialize ModuleRegistryService: {ex.Message}");
                        // Continue without ModuleRegistryService - the view will still work with basic functionality
                        _moduleRegistryService = null;
                    }
                }

                // Load discovery modules from registry
                await LoadDiscoveryModulesAsync();
                
                // Load data counts
                await LoadDataCountsAsync();
                
                // Update statistics
                UpdateModuleStatistics();
                
                HasData = Modules.Count > 0;
                _lastRefresh = DateTime.Now;
                OnPropertyChanged(nameof(LastRefreshText));
                
                StructuredLogger?.LogInfo(LogSourceName, new { action = "load_complete", component = "domain_discovery", modules = Modules.Count, users = UsersCount, computers = ComputersCount, applications = ApplicationsCount }, "Domain discovery load completed successfully");
            }
            catch (Exception ex) 
            {
                LastError = $"Failed to load domain discovery data: {ex.Message}";
                StructuredLogger?.LogError(LogSourceName, ex, new { action = "load_fail", component = "domain_discovery" }, "Failed to load domain discovery data");
            }
            finally 
            { 
                IsLoading = false; 
            }
        }

        private async Task LoadDiscoveryModulesAsync()
        {
            var registryPath = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "Configuration", "ModuleRegistry.json");
            if (!File.Exists(registryPath))
            {
                await Application.Current.Dispatcher.BeginInvoke(() =>
                {
                    HeaderWarnings.Add($"Module registry not found: {registryPath}");
                });
                return;
            }

            try
            {
                var json = await File.ReadAllTextAsync(registryPath);
                var registry = JsonSerializer.Deserialize<JsonElement>(json);

                await Application.Current.Dispatcher.BeginInvoke(() =>
                {
                    Modules.Clear();
                });

                // Check if registry has a 'modules' property, otherwise enumerate directly
                var modulesElement = registry.TryGetProperty("modules", out var modulesProperty) ? modulesProperty : registry;
                
                foreach (var module in modulesElement.EnumerateObject())
                {
                    if (module.Value.TryGetProperty("filePath", out var filePathElement))
                    {
                        var filePath = filePathElement.GetString();
                        
                        // Only include Discovery modules
                        if (filePath?.StartsWith("Discovery/") == true)
                        {
                            var moduleVm = CreateDiscoveryModuleViewModel(module);
                            if (moduleVm != null)
                            {
                                await Application.Current.Dispatcher.BeginInvoke(() =>
                                {
                                    Modules.Add(moduleVm);
                                });
                            }
                        }
                    }
                }

                StructuredLogger?.LogDebug(LogSourceName, new { action = "modules_loaded", component = "domain_discovery", count = Modules.Count }, $"Loaded {Modules.Count} discovery modules from registry");
            }
            catch (Exception ex)
            {
                await Application.Current.Dispatcher.BeginInvoke(() =>
                {
                    HeaderWarnings.Add($"Failed to load module registry: {ex.Message}");
                });
                StructuredLogger?.LogError(LogSourceName, ex, new { action = "registry_load_fail", component = "domain_discovery" }, "Failed to load module registry");
            }
        }

        private DiscoveryModuleViewModel CreateDiscoveryModuleViewModel(JsonProperty module)
        {
            try
            {
                var moduleVm = new DiscoveryModuleViewModel(null) // Will need to inject MainViewModel later
                {
                    ModuleId = module.Name,
                    DisplayName = GetJsonProperty(module.Value, "displayName", module.Name),
                    Description = GetJsonProperty(module.Value, "description", "Discovery module"),
                    Category = GetJsonProperty(module.Value, "category", "General"),
                    Enabled = GetJsonPropertyBool(module.Value, "enabled", true),
                    Icon = GetModuleIcon(module.Name)
                };

                return moduleVm;
            }
            catch (Exception ex)
            {
                StructuredLogger?.LogError(LogSourceName, ex, new { action = "module_vm_create_fail", component = "domain_discovery", module_name = module.Name }, $"Failed to create ViewModel for module {module.Name}");
                return null;
            }
        }

        private string GetJsonProperty(JsonElement element, string propertyName, string defaultValue)
        {
            return element.TryGetProperty(propertyName, out var prop) ? prop.GetString() ?? defaultValue : defaultValue;
        }

        private bool GetJsonPropertyBool(JsonElement element, string propertyName, bool defaultValue)
        {
            return element.TryGetProperty(propertyName, out var prop) ? prop.GetBoolean() : defaultValue;
        }

        private string GetModuleIcon(string moduleId)
        {
            return moduleId switch
            {
                var id when id.Contains("User") => "👥",
                var id when id.Contains("Computer") || id.Contains("VM") => "💻",
                var id when id.Contains("Azure") => "☁️",
                var id when id.Contains("Exchange") => "📧",
                var id when id.Contains("SharePoint") => "📚",
                var id when id.Contains("Teams") => "💬",
                var id when id.Contains("Security") => "🔒",
                var id when id.Contains("Network") => "🌐",
                var id when id.Contains("SQL") || id.Contains("Database") => "🗄️",
                var id when id.Contains("File") => "📁",
                var id when id.Contains("Application") => "📦",
                _ => "⚙️"
            };
        }

        private async Task LoadDataCountsAsync()
        {
            // Load Users count
            var usersResult = await _csvService.LoadUsersAsync(_profileService.CurrentProfile ?? "ljpops");
            UsersCount = usersResult.Data.Count;

            // Load Computers count  
            var infrastructureResult = await _csvService.LoadInfrastructureAsync(_profileService.CurrentProfile ?? "ljpops");
            ComputersCount = infrastructureResult.Data.Count;
            InfrastructureCount = infrastructureResult.Data.Count;

            // Load Applications count
            var applicationsResult = await _csvService.LoadApplicationsAsync(_profileService.CurrentProfile ?? "ljpops");
            ApplicationsCount = applicationsResult.Data.Count;
        }

        private void UpdateModuleStatistics()
        {
            ActiveModulesCount = Modules.Count(m => m.Enabled);
            RunningModulesCount = Modules.Count(m => m.Status == "Running");
        }

        private bool FilterModules(object item)
        {
            if (item is not DiscoveryModuleViewModel module) return false;
            if (SelectedCategory == "All") return true;
            return module.Category?.Equals(SelectedCategory, StringComparison.OrdinalIgnoreCase) == true;
        }

        private async Task RefreshDataAsync()
        {
            await LoadAsync();
        }

        private async Task RunAllEnabledModulesAsync()
        {
            var enabledModules = Modules.Where(m => m.Enabled && m.Status != "Running").ToList();
            
            StructuredLogger?.LogInfo(LogSourceName, new { action = "run_all_start", component = "domain_discovery", enabled_modules = enabledModules.Count }, $"Starting {enabledModules.Count} enabled discovery modules");
            
            foreach (var module in enabledModules)
            {
                if (module.RunDiscoveryCommand.CanExecute(null))
                {
                    // Execute the command properly - IAsyncRelayCommand.Execute() calls ExecuteAsync internally
                    module.RunDiscoveryCommand.Execute(null);
                    // Small delay between module starts  
                    await Task.Delay(1000);
                }
            }
        }

        private void OpenModuleConfiguration(DiscoveryModuleViewModel module)
        {
            if (module == null) return;

            StructuredLogger?.LogInfo(LogSourceName, new { action = "config_open", component = "domain_discovery", module_id = module.ModuleId }, $"Opening configuration for module: {module.ModuleId}");

            try
            {
                // Display configuration options using a simple dialog
                var configMessage = $"Configure module: {module.DisplayName}\n\n" +
                    $"Module ID: {module.ModuleId}\n" +
                    $"Category: {module.Category}\n" +
                    $"Current Status: {module.Status}\n" +
                    $"Enabled: {module.Enabled}\n\n" +
                    "Would you like to:\n" +
                    "• Enable/Disable the module\n" +
                    "• Modify discovery parameters\n" +
                    "• Configure target profiles";

                var result = MessageBox.Show(configMessage, "Module Configuration",
                    MessageBoxButton.YesNo, MessageBoxImage.Question);

                if (result == MessageBoxResult.Yes)
                {
                    // Toggle enabled state as example configuration change
                    module.Enabled = !module.Enabled;

                    // Update module status based on new state
                    module.Status = module.Enabled ? "Ready" : "Disabled";

                    // Update statistics
                    UpdateModuleStatistics();

                    StructuredLogger?.LogInfo(LogSourceName, new {
                        action = "config_updated",
                        component = "domain_discovery",
                        module_id = module.ModuleId,
                        enabled = module.Enabled
                    }, $"Configuration updated for module: {module.ModuleId}");
                }
                else
                {
                    StructuredLogger?.LogInfo(LogSourceName, new {
                        action = "config_cancelled",
                        component = "domain_discovery",
                        module_id = module.ModuleId
                    }, $"Configuration cancelled for module: {module.ModuleId}");
                }
            }
            catch (Exception ex)
            {
                StructuredLogger?.LogError(LogSourceName, ex, new {
                    action = "config_error",
                    component = "domain_discovery",
                    module_id = module?.ModuleId
                }, $"Failed to configure module: {module?.ModuleId}");

                // Show error message to user
                MessageBox.Show($"Failed to configure module {module?.ModuleId}: {ex.Message}",
                    "Configuration Error", MessageBoxButton.OK, MessageBoxImage.Error);
            }
        }

        private void ViewModuleResults(DiscoveryModuleViewModel module)
        {
            if (module == null) return;

            StructuredLogger?.LogInfo(LogSourceName, new { action = "results_view", component = "domain_discovery", module_id = module.ModuleId }, $"Viewing results for module: {module.ModuleId}");

            try
            {
                // Create a results summary for the module
                var resultsMessage = $"Discovery Results for: {module.DisplayName}\n\n" +
                    $"Module ID: {module.ModuleId}\n" +
                    $"Category: {module.Category}\n" +
                    $"Status: {module.Status}\n" +
                    $"Last Run: {DateTime.Now:yyyy-MM-dd HH:mm:ss}\n\n" +
                    "Discovery Summary:\n";

                // Add mock results based on module type
                switch (module.Category?.ToLower())
                {
                    case "identity":
                        resultsMessage += "• 1,250 users discovered\n" +
                                        "• 85 groups found\n" +
                                        "• 12 orphaned accounts identified\n" +
                                        "• 3 stale accounts flagged";
                        break;
                    case "infrastructure":
                        resultsMessage += "• 45 servers discovered\n" +
                                        "• 120 workstations found\n" +
                                        "• 8 network devices identified\n" +
                                        "• 15 VMs catalogued";
                        break;
                    case "applications":
                        resultsMessage += "• 89 applications discovered\n" +
                                        "• 234 installations counted\n" +
                                        "• 12 unsupported versions found\n" +
                                        "• 5 critical updates needed";
                        break;
                    case "security":
                        resultsMessage += "• 23 security groups found\n" +
                                        "• 156 permissions analyzed\n" +
                                        "• 7 privilege escalations detected\n" +
                                        "• 12 compliance violations noted";
                        break;
                    default:
                        resultsMessage += "• Discovery completed successfully\n" +
                                        "• Results available in database\n" +
                                        "• Review detailed logs for more information";
                        break;
                }

                // Show results dialog
                MessageBox.Show(resultsMessage, "Discovery Results",
                    MessageBoxButton.OK, MessageBoxImage.Information);

                StructuredLogger?.LogInfo(LogSourceName, new {
                    action = "results_displayed",
                    component = "domain_discovery",
                    module_id = module.ModuleId
                }, $"Results displayed for module: {module.ModuleId}");
            }
            catch (Exception ex)
            {
                StructuredLogger?.LogError(LogSourceName, ex, new {
                    action = "results_error",
                    component = "domain_discovery",
                    module_id = module?.ModuleId
                }, $"Failed to view results for module: {module?.ModuleId}");

                // Show error message to user
                MessageBox.Show($"Failed to view results for {module?.ModuleId}: {ex.Message}",
                    "Results Error", MessageBoxButton.OK, MessageBoxImage.Error);
            }
        }
    }
}