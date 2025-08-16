using System;
using System.Collections.ObjectModel;
using System.ComponentModel;
using System.IO;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using System.Windows.Input;
using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using MandADiscoverySuite.Models;
using MandADiscoverySuite.Services;

namespace MandADiscoverySuite.ViewModels
{
    public class DiscoveryDashboardViewModel : ObservableObject, IDisposable
    {
        private readonly MainViewModel _mainViewModel;
        private readonly EnhancedLoggingService _logger;
        private ObservableCollection<DiscoveryModuleViewModel> _modules;
        private ObservableCollection<DiscoveryModuleViewModel> _filteredModules;
        private ObservableCollection<string> _categories;
        private string _selectedCategory = "All";
        private string _searchText = "";
        private int _usersCount;
        private int _infrastructureCount;
        private int _applicationsCount;
        private int _groupsCount;
        private int _databasesCount;
        private int _mailboxCount;
        private string _statusMessage;
        private int _runningModulesCount;
        private int _completedModulesCount;
        private int _failedModulesCount;

        public DiscoveryDashboardViewModel(MainViewModel mainViewModel)
        {
            _mainViewModel = mainViewModel;
            _logger = EnhancedLoggingService.Instance;
            _modules = new ObservableCollection<DiscoveryModuleViewModel>();
            _filteredModules = new ObservableCollection<DiscoveryModuleViewModel>();
            _categories = new ObservableCollection<string>();
            StatusMessage = "Click Run Discovery on any module tile above to start discovery for that specific module.";
            
            // Initialize commands
            RunAllEnabledCommand = new AsyncRelayCommand(RunAllEnabledAsync, () => FilteredModules.Any(m => m.Enabled && m.Status != "Running"));
            RunByCategoryCommand = new AsyncRelayCommand(RunByCategoryAsync, () => !string.IsNullOrEmpty(SelectedCategory) && SelectedCategory != "All");
            StopAllRunningCommand = new RelayCommand(StopAllRunning, () => FilteredModules.Any(m => m.Status == "Running"));
            
            LoadModules();
            SubscribeToDataChanges();
            UpdateCounts();
            UpdateModuleStatistics();
        }

        public ObservableCollection<DiscoveryModuleViewModel> Modules
        {
            get => _modules;
            set => SetProperty(ref _modules, value);
        }

        public ObservableCollection<DiscoveryModuleViewModel> FilteredModules
        {
            get => _filteredModules;
            set => SetProperty(ref _filteredModules, value);
        }

        public ObservableCollection<string> Categories
        {
            get => _categories;
            set => SetProperty(ref _categories, value);
        }

        public string SelectedCategory
        {
            get => _selectedCategory;
            set
            {
                if (SetProperty(ref _selectedCategory, value))
                {
                    ApplyFilters();
                }
            }
        }

        public string SearchText
        {
            get => _searchText;
            set
            {
                if (SetProperty(ref _searchText, value))
                {
                    ApplyFilters();
                }
            }
        }

        public int UsersCount
        {
            get => _usersCount;
            set => SetProperty(ref _usersCount, value);
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

        public int GroupsCount
        {
            get => _groupsCount;
            set => SetProperty(ref _groupsCount, value);
        }

        public int DatabasesCount
        {
            get => _databasesCount;
            set => SetProperty(ref _databasesCount, value);
        }

        public int MailboxCount
        {
            get => _mailboxCount;
            set => SetProperty(ref _mailboxCount, value);
        }

        public string StatusMessage
        {
            get => _statusMessage;
            set => SetProperty(ref _statusMessage, value);
        }

        public int RunningModulesCount
        {
            get => _runningModulesCount;
            set => SetProperty(ref _runningModulesCount, value);
        }

        public int CompletedModulesCount
        {
            get => _completedModulesCount;
            set => SetProperty(ref _completedModulesCount, value);
        }

        public int FailedModulesCount
        {
            get => _failedModulesCount;
            set => SetProperty(ref _failedModulesCount, value);
        }

        public ICommand RunAllEnabledCommand { get; }
        public ICommand RunByCategoryCommand { get; }
        public ICommand StopAllRunningCommand { get; }

        private void LoadModules()
        {
            try
            {
                var registryPath = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "Configuration", "ModuleRegistry.json");
                
                if (!File.Exists(registryPath))
                {
                    // Try alternate location
                    registryPath = @"D:\Scripts\UserMandA\GUI\Configuration\ModuleRegistry.json";
                }

                if (!File.Exists(registryPath))
                {
                    _ = _logger.LogErrorAsync($"ModuleRegistry.json not found at {registryPath}");
                    return;
                }

                var json = File.ReadAllText(registryPath);
                using var document = JsonDocument.Parse(json);
                var root = document.RootElement;
                
                if (!root.TryGetProperty("modules", out var modulesElement))
                {
                    _ = _logger.LogErrorAsync("ModuleRegistry.json does not contain 'modules' property");
                    return;
                }

                foreach (var moduleEntry in modulesElement.EnumerateObject())
                {
                    var moduleId = moduleEntry.Name;
                    var moduleData = moduleEntry.Value;
                    
                    // Filter for Discovery modules only
                    if (moduleData.TryGetProperty("filePath", out var filePathElement))
                    {
                        var filePath = filePathElement.GetString();
                        if (filePath != null && filePath.StartsWith("Discovery/"))
                        {
                            var module = new DiscoveryModuleViewModel(_mainViewModel)
                            {
                                ModuleId = moduleId,
                                DisplayName = moduleData.TryGetProperty("displayName", out var displayName) ? displayName.GetString() : moduleId,
                                Description = moduleData.TryGetProperty("description", out var description) ? description.GetString() : "",
                                Icon = moduleData.TryGetProperty("icon", out var icon) ? icon.GetString() : "🔍",
                                Category = moduleData.TryGetProperty("category", out var category) ? category.GetString() : "Unknown",
                                Enabled = moduleData.TryGetProperty("enabled", out var enabled) ? enabled.GetBoolean() : true
                            };
                            
                            // Subscribe to status changes for statistics updates
                            module.PropertyChanged += (s, e) =>
                            {
                                if (e.PropertyName == nameof(DiscoveryModuleViewModel.Status))
                                {
                                    UpdateModuleStatistics();
                                }
                            };
                            
                            Modules.Add(module);
                            _ = _logger.LogInformationAsync($"Loaded discovery module: {moduleId}");
                        }
                    }
                }
                
                BuildCategoriesList();
                ApplyFilters();
                _ = _logger.LogInformationAsync($"Loaded {Modules.Count} discovery modules");
            }
            catch (Exception ex)
            {
                _ = _logger.LogErrorAsync($"Error loading modules: {ex.Message}");
            }
        }

        private void SubscribeToDataChanges()
        {
            if (_mainViewModel != null)
            {
                // Subscribe to collection changes
                if (_mainViewModel.Users != null)
                    _mainViewModel.Users.CollectionChanged += OnUsersCollectionChanged;
                
                if (_mainViewModel.Computers != null)
                    _mainViewModel.Computers.CollectionChanged += OnComputersCollectionChanged;
                
                if (_mainViewModel.Applications != null)
                    _mainViewModel.Applications.CollectionChanged += OnApplicationsCollectionChanged;
                
                if (_mainViewModel.Groups != null)
                    _mainViewModel.Groups.CollectionChanged += OnGroupsCollectionChanged;
                
                if (_mainViewModel.Databases != null)
                    _mainViewModel.Databases.CollectionChanged += OnDatabasesCollectionChanged;
                
                if (_mainViewModel.Mailboxes != null)
                    _mainViewModel.Mailboxes.CollectionChanged += OnMailboxesCollectionChanged;
            }
        }

        private void UnsubscribeFromDataChanges()
        {
            if (_mainViewModel != null)
            {
                // Unsubscribe from collection changes
                if (_mainViewModel.Users != null)
                    _mainViewModel.Users.CollectionChanged -= OnUsersCollectionChanged;
                
                if (_mainViewModel.Computers != null)
                    _mainViewModel.Computers.CollectionChanged -= OnComputersCollectionChanged;
                
                if (_mainViewModel.Applications != null)
                    _mainViewModel.Applications.CollectionChanged -= OnApplicationsCollectionChanged;
                
                if (_mainViewModel.Groups != null)
                    _mainViewModel.Groups.CollectionChanged -= OnGroupsCollectionChanged;
                
                if (_mainViewModel.Databases != null)
                    _mainViewModel.Databases.CollectionChanged -= OnDatabasesCollectionChanged;
                
                if (_mainViewModel.Mailboxes != null)
                    _mainViewModel.Mailboxes.CollectionChanged -= OnMailboxesCollectionChanged;
            }
        }

        private void OnUsersCollectionChanged(object sender, System.Collections.Specialized.NotifyCollectionChangedEventArgs e) => UpdateCounts();
        private void OnComputersCollectionChanged(object sender, System.Collections.Specialized.NotifyCollectionChangedEventArgs e) => UpdateCounts();
        private void OnApplicationsCollectionChanged(object sender, System.Collections.Specialized.NotifyCollectionChangedEventArgs e) => UpdateCounts();
        private void OnGroupsCollectionChanged(object sender, System.Collections.Specialized.NotifyCollectionChangedEventArgs e) => UpdateCounts();
        private void OnDatabasesCollectionChanged(object sender, System.Collections.Specialized.NotifyCollectionChangedEventArgs e) => UpdateCounts();
        private void OnMailboxesCollectionChanged(object sender, System.Collections.Specialized.NotifyCollectionChangedEventArgs e) => UpdateCounts();

        private void UpdateCounts()
        {
            if (_mainViewModel != null)
            {
                UsersCount = _mainViewModel.Users?.Count ?? 0;
                InfrastructureCount = _mainViewModel.Computers?.Count ?? 0;
                ApplicationsCount = _mainViewModel.Applications?.Count ?? 0;
                GroupsCount = _mainViewModel.Groups?.Count ?? 0;
                DatabasesCount = _mainViewModel.Databases?.Count ?? 0;
                MailboxCount = _mainViewModel.Mailboxes?.Count ?? 0;
                
                _ = _logger.LogDebugAsync($"Updated counts - Users: {UsersCount}, Infrastructure: {InfrastructureCount}, Applications: {ApplicationsCount}");
            }
        }

        public async Task RefreshDataAsync()
        {
            await _mainViewModel?.ReloadDataAsync();
            UpdateCounts();
        }

        private void BuildCategoriesList()
        {
            Categories.Clear();
            Categories.Add("All");
            
            var categories = Modules.Select(m => m.Category).Distinct().OrderBy(c => c);
            foreach (var category in categories)
            {
                Categories.Add(category);
            }
        }

        private void ApplyFilters()
        {
            FilteredModules.Clear();
            
            var filtered = Modules.Where(m =>
            {
                // Category filter
                if (SelectedCategory != "All" && m.Category != SelectedCategory)
                    return false;
                
                // Search filter
                if (!string.IsNullOrWhiteSpace(SearchText))
                {
                    var searchLower = SearchText.ToLower();
                    return m.DisplayName.ToLower().Contains(searchLower) ||
                           m.Description.ToLower().Contains(searchLower) ||
                           m.ModuleId.ToLower().Contains(searchLower);
                }
                
                return true;
            });
            
            foreach (var module in filtered)
            {
                FilteredModules.Add(module);
            }
            
            _ = _logger.LogInformationAsync($"Applied filters - Category: {SelectedCategory}, Search: '{SearchText}', Results: {FilteredModules.Count}/{Modules.Count}");
        }

        private void UpdateModuleStatistics()
        {
            RunningModulesCount = Modules.Count(m => m.Status == "Running");
            CompletedModulesCount = Modules.Count(m => m.Status == "Completed");
            FailedModulesCount = Modules.Count(m => m.Status == "Failed");
            
            // Update command states
            if (RunAllEnabledCommand is CommunityToolkit.Mvvm.Input.IRelayCommand allCmd) allCmd.NotifyCanExecuteChanged();
            if (RunByCategoryCommand is CommunityToolkit.Mvvm.Input.IRelayCommand catCmd) catCmd.NotifyCanExecuteChanged();
            if (StopAllRunningCommand is CommunityToolkit.Mvvm.Input.IRelayCommand stopCmd) stopCmd.NotifyCanExecuteChanged();
            
            _ = _logger.LogDebugAsync($"Module statistics - Running: {RunningModulesCount}, Completed: {CompletedModulesCount}, Failed: {FailedModulesCount}");
        }

        private async Task RunAllEnabledAsync()
        {
            var enabledModules = FilteredModules.Where(m => m.Enabled && m.Status != "Running").ToList();
            _ = _logger.LogInformationAsync($"Starting bulk execution of {enabledModules.Count} enabled modules");
            
            StatusMessage = $"Running {enabledModules.Count} enabled modules...";
            
            foreach (var module in enabledModules)
            {
                if (module.RunDiscoveryCommand.CanExecute(null))
                {
                    await module.RunDiscoveryCommand.ExecuteAsync(null);
                    // Add small delay between module starts to prevent overwhelming the system
                    await Task.Delay(2000);
                }
            }
            
            StatusMessage = "Bulk execution initiated for all enabled modules.";
        }

        private async Task RunByCategoryAsync()
        {
            if (string.IsNullOrEmpty(SelectedCategory) || SelectedCategory == "All")
                return;
                
            var categoryModules = FilteredModules.Where(m => m.Category == SelectedCategory && m.Enabled && m.Status != "Running").ToList();
            _ = _logger.LogInformationAsync($"Starting bulk execution of {categoryModules.Count} modules in category: {SelectedCategory}");
            
            StatusMessage = $"Running {categoryModules.Count} modules in {SelectedCategory} category...";
            
            foreach (var module in categoryModules)
            {
                if (module.RunDiscoveryCommand.CanExecute(null))
                {
                    await module.RunDiscoveryCommand.ExecuteAsync(null);
                    await Task.Delay(2000);
                }
            }
            
            StatusMessage = $"Bulk execution initiated for {SelectedCategory} category modules.";
        }

        private void StopAllRunning()
        {
            var runningModules = FilteredModules.Where(m => m.Status == "Running").ToList();
            _ = _logger.LogInformationAsync($"Attempting to stop {runningModules.Count} running modules");
            
            foreach (var module in runningModules)
            {
                // Set status to indicate stop requested
                module.Status = "Stopping";
            }
            
            StatusMessage = $"Stop requested for {runningModules.Count} running modules.";
        }

        #region IDisposable

        private bool _disposed = false;

        public void Dispose()
        {
            Dispose(true);
            GC.SuppressFinalize(this);
        }

        protected virtual void Dispose(bool disposing)
        {
            if (!_disposed && disposing)
            {
                UnsubscribeFromDataChanges();
                
                // Dispose modules if they implement IDisposable
                if (_modules != null)
                {
                    foreach (var module in _modules)
                    {
                        if (module is IDisposable disposable)
                            disposable.Dispose();
                    }
                    _modules.Clear();
                }

                _disposed = true;
            }
        }

        #endregion
    }
}