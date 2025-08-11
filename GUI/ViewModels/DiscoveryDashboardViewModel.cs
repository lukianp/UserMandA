using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Collections.Specialized;
using System.ComponentModel;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using System.Windows.Data;
using System.Windows.Input;
using CommunityToolkit.Mvvm.Input;
using MandADiscoverySuite.Models;
using MandADiscoverySuite.Services;
using System.Text.Json;

namespace MandADiscoverySuite.ViewModels
{
    /// <summary>
    /// ViewModel for the Discovery Dashboard that automatically shows one tile per discovery module
    /// </summary>
    public class DiscoveryDashboardViewModel : BaseViewModel
    {
        private readonly MainViewModel _mainViewModel;
        private int _usersCount;
        private int _infrastructureCount;
        private int _applicationsCount;
        private int _groupsCount;
        private int _databasesCount;
        private int _mailboxCount;
        private string _statusMessage;

        public DiscoveryDashboardViewModel(MainViewModel mainViewModel)
        {
            _mainViewModel = mainViewModel ?? throw new ArgumentNullException(nameof(mainViewModel));
            
            Modules = new ObservableCollection<DiscoveryModuleViewModel>();
            
            // Load modules from registry
            _ = LoadModulesFromRegistryAsync();
            
            // Subscribe to collection changes to update counts
            if (_mainViewModel != null)
            {
                SubscribeToCollectionChanges();
                UpdateCounts();
            }
        }

        /// <summary>
        /// Collection of discovery modules loaded from ModuleRegistry.json
        /// </summary>
        public ObservableCollection<DiscoveryModuleViewModel> Modules { get; }

        /// <summary>
        /// Count of discovered users
        /// </summary>
        public int UsersCount
        {
            get => _usersCount;
            set => SetProperty(ref _usersCount, value);
        }

        /// <summary>
        /// Count of discovered infrastructure items
        /// </summary>
        public int InfrastructureCount
        {
            get => _infrastructureCount;
            set => SetProperty(ref _infrastructureCount, value);
        }

        /// <summary>
        /// Count of discovered applications
        /// </summary>
        public int ApplicationsCount
        {
            get => _applicationsCount;
            set => SetProperty(ref _applicationsCount, value);
        }

        /// <summary>
        /// Count of discovered groups
        /// </summary>
        public int GroupsCount
        {
            get => _groupsCount;
            set => SetProperty(ref _groupsCount, value);
        }

        /// <summary>
        /// Count of discovered databases
        /// </summary>
        public int DatabasesCount
        {
            get => _databasesCount;
            set => SetProperty(ref _databasesCount, value);
        }

        /// <summary>
        /// Count of discovered mailboxes
        /// </summary>
        public int MailboxCount
        {
            get => _mailboxCount;
            set => SetProperty(ref _mailboxCount, value);
        }

        /// <summary>
        /// Current status message
        /// </summary>
        public new string StatusMessage
        {
            get => _statusMessage;
            set => SetProperty(ref _statusMessage, value);
        }

        /// <summary>
        /// Gets the current company profile name
        /// </summary>
        private string CurrentProfileName => _mainViewModel?.SelectedProfile?.CompanyName ?? "ljpops";

        /// <summary>
        /// Loads discovery modules from ModuleRegistry.json
        /// </summary>
        private async Task LoadModulesFromRegistryAsync()
        {
            try
            {
                StatusMessage = "Loading discovery modules from registry...";
                
                // Try to use ModuleRegistryService first
                try
                {
                    var registry = await ModuleRegistryService.Instance.LoadRegistryAsync();
                    if (registry?.Modules != null)
                    {
                        LoadModulesFromRegistry(registry);
                        return;
                    }
                }
                catch (Exception ex)
                {
                    System.Diagnostics.Debug.WriteLine($"ModuleRegistryService failed: {ex.Message}, falling back to direct file load");
                }
                
                // Fallback to direct file loading
                var registryPath = Path.Combine(
                    ConfigurationService.Instance.EnterpriseDiscoveryRootPath,
                    "Configuration",
                    "ModuleRegistry.json"
                );
                
                if (!File.Exists(registryPath))
                {
                    // Try from application directory
                    registryPath = Path.Combine(
                        Path.GetDirectoryName(System.Reflection.Assembly.GetExecutingAssembly().Location) ?? "",
                        "Configuration",
                        "ModuleRegistry.json"
                    );
                }
                
                if (File.Exists(registryPath))
                {
                    var json = await File.ReadAllTextAsync(registryPath);
                    var registry = JsonSerializer.Deserialize<ModuleRegistry>(json, new JsonSerializerOptions
                    {
                        PropertyNameCaseInsensitive = true
                    });
                    
                    if (registry != null)
                    {
                        LoadModulesFromRegistry(registry);
                    }
                }
                else
                {
                    System.Diagnostics.Debug.WriteLine($"ModuleRegistry.json not found at {registryPath}");
                    LoadFallbackModules();
                }
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Error loading modules from registry: {ex.Message}");
                StatusMessage = "Error loading modules, using fallback";
                LoadFallbackModules();
            }
        }

        /// <summary>
        /// Loads modules from the registry object
        /// </summary>
        private void LoadModulesFromRegistry(ModuleRegistry registry)
        {
            var discoveryModules = new List<DiscoveryModuleViewModel>();
            
            foreach (var kvp in registry.Modules)
            {
                var moduleId = kvp.Key;
                var moduleInfo = kvp.Value;
                
                // Filter to only include Discovery modules
                if (moduleInfo.FilePath?.StartsWith("Discovery/", StringComparison.OrdinalIgnoreCase) == true)
                {
                    var module = new DiscoveryModuleViewModel(
                        moduleId,
                        moduleInfo.DisplayName ?? moduleId,
                        moduleInfo.Description ?? "Discovery module",
                        moduleInfo.Enabled
                    );
                    
                    // Set additional properties
                    module.Category = moduleInfo.Category ?? "Discovery";
                    
                    discoveryModules.Add(module);
                }
            }
            
            // Update UI on dispatcher thread
            System.Windows.Application.Current.Dispatcher.Invoke(() =>
            {
                Modules.Clear();
                foreach (var module in discoveryModules.OrderBy(m => m.Category).ThenBy(m => m.DisplayName))
                {
                    Modules.Add(module);
                }
            });
            
            StatusMessage = $"Loaded {discoveryModules.Count} discovery modules";
            System.Diagnostics.Debug.WriteLine($"DiscoveryDashboardViewModel: Loaded {discoveryModules.Count} discovery modules from registry");
        }

        /// <summary>
        /// Loads fallback modules if registry loading fails
        /// </summary>
        private void LoadFallbackModules()
        {
            var fallbackModules = new[]
            {
                new DiscoveryModuleViewModel("ActiveDirectoryDiscovery", "Active Directory Discovery", "Discover AD users, groups, computers, and organizational structure", true),
                new DiscoveryModuleViewModel("AzureDiscovery", "Azure AD Discovery", "Discover Azure AD users, groups, and applications", true),
                new DiscoveryModuleViewModel("AzureResourceDiscovery", "Azure Resource Discovery", "Discover Azure infrastructure, resources, and configurations", true),
                new DiscoveryModuleViewModel("ExchangeDiscovery", "Exchange Discovery", "Discover Exchange mailboxes, databases, and configuration", true),
                new DiscoveryModuleViewModel("TeamsDiscovery", "Microsoft Teams Discovery", "Discover Teams, channels, and membership", true),
                new DiscoveryModuleViewModel("SharePointDiscovery", "SharePoint Discovery", "Discover SharePoint sites, lists, and permissions", true),
                new DiscoveryModuleViewModel("IntuneDiscovery", "Intune Discovery", "Discover managed devices and policies", true),
                new DiscoveryModuleViewModel("NetworkInfrastructureDiscovery", "Network Infrastructure", "Discover network devices, switches, and routers", true),
                new DiscoveryModuleViewModel("SQLServerDiscovery", "SQL Server Discovery", "Discover SQL Server instances and databases", true),
                new DiscoveryModuleViewModel("FileServerDiscovery", "File Server Discovery", "Discover file servers and shares", true)
            };
            
            System.Windows.Application.Current.Dispatcher.Invoke(() =>
            {
                Modules.Clear();
                foreach (var module in fallbackModules)
                {
                    Modules.Add(module);
                }
            });
            
            StatusMessage = $"Loaded {fallbackModules.Length} fallback discovery modules";
        }


        /// <summary>
        /// Reloads data from CSV files and updates counts
        /// </summary>
        private async Task ReloadDataAsync()
        {
            try
            {
                // Trigger data refresh in MainViewModel
                if (_mainViewModel?.RefreshDataCommand?.CanExecute(null) == true)
                {
                    _mainViewModel.RefreshDataCommand.Execute(null);
                }
                
                // Update counts after a short delay to allow data to load
                await Task.Delay(1000);
                UpdateCounts();
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Error reloading data: {ex.Message}");
            }
        }

        /// <summary>
        /// Subscribes to collection changes in MainViewModel
        /// </summary>
        private void SubscribeToCollectionChanges()
        {
            if (_mainViewModel.Users is INotifyCollectionChanged usersCollection)
            {
                usersCollection.CollectionChanged += (s, e) => UpdateCounts();
            }
            
            if (_mainViewModel.Infrastructure is INotifyCollectionChanged infrastructureCollection)
            {
                infrastructureCollection.CollectionChanged += (s, e) => UpdateCounts();
            }
            
            if (_mainViewModel.Applications is INotifyCollectionChanged applicationsCollection)
            {
                applicationsCollection.CollectionChanged += (s, e) => UpdateCounts();
            }
            
            if (_mainViewModel.Groups is INotifyCollectionChanged groupsCollection)
            {
                groupsCollection.CollectionChanged += (s, e) => UpdateCounts();
            }
        }

        /// <summary>
        /// Updates the summary counts from MainViewModel collections
        /// </summary>
        private void UpdateCounts()
        {
            try
            {
                UsersCount = _mainViewModel?.Users?.Count ?? 0;
                InfrastructureCount = _mainViewModel?.Infrastructure?.Count ?? 0;
                ApplicationsCount = _mainViewModel?.Applications?.Count ?? 0;
                GroupsCount = _mainViewModel?.Groups?.Count ?? 0;
                
                // For databases and mailboxes, we might need to count from specific collections or CSV files
                DatabasesCount = CountDatabasesFromCsv();
                MailboxCount = CountMailboxesFromCsv();
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Error updating counts: {ex.Message}");
            }
        }

        /// <summary>
        /// Counts databases from CSV files
        /// </summary>
        private int CountDatabasesFromCsv()
        {
            try
            {
                var csvPath = Path.Combine(
                    ConfigurationService.Instance.DiscoveryDataRootPath,
                    CurrentProfileName,
                    "Raw",
                    "Databases.csv"
                );
                
                if (File.Exists(csvPath))
                {
                    var lines = File.ReadAllLines(csvPath);
                    return Math.Max(0, lines.Length - 1); // Subtract header row
                }
            }
            catch { }
            
            return 0;
        }

        /// <summary>
        /// Counts mailboxes from CSV files
        /// </summary>
        private int CountMailboxesFromCsv()
        {
            try
            {
                var csvPath = Path.Combine(
                    ConfigurationService.Instance.DiscoveryDataRootPath,
                    CurrentProfileName,
                    "Raw",
                    "Mailboxes.csv"
                );
                
                if (File.Exists(csvPath))
                {
                    var lines = File.ReadAllLines(csvPath);
                    return Math.Max(0, lines.Length - 1); // Subtract header row
                }
            }
            catch { }
            
            return 0;
        }
    }
}