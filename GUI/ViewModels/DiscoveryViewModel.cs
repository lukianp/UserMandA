using System;
using System.Collections.ObjectModel;
using System.ComponentModel;
using System.Linq;
using System.Runtime.CompilerServices;
using System.Threading.Tasks;
using System.Windows.Input;
using CommunityToolkit.Mvvm.Input;
using MandADiscoverySuite.Services;
using Microsoft.Extensions.Logging;

namespace MandADiscoverySuite.ViewModels
{
    /// <summary>
    /// ViewModel for the Discovery modules view
    /// </summary>
    public class DiscoveryViewModel : BaseViewModel
    {
        private readonly ILogger<DiscoveryViewModel>? _logger;
        private readonly DiscoveryService _discoveryService;
        private readonly ModuleRegistryService _moduleRegistryService;
        private ObservableCollection<DiscoveryModuleViewModel> _discoveryModules;
        private bool _isLoading;

        public DiscoveryViewModel()
        {
            _logger = null; // Will be set by dependency injection in the future
            _discoveryService = new DiscoveryService();
            _moduleRegistryService = ModuleRegistryService.Instance;
            _discoveryModules = new ObservableCollection<DiscoveryModuleViewModel>();
            
            // Initialize commands
            StartDiscoveryCommand = new CommunityToolkit.Mvvm.Input.AsyncRelayCommand(StartDiscoveryAsync, CanStartDiscovery);
            RefreshDataCommand = new CommunityToolkit.Mvvm.Input.AsyncRelayCommand(RefreshDataAsync);
            
            // Load discovery modules
            _ = LoadAsync();
        }

        public ObservableCollection<DiscoveryModuleViewModel> DiscoveryModules
        {
            get => _discoveryModules;
            set => SetProperty(ref _discoveryModules, value);
        }

        public new bool IsLoading
        {
            get => _isLoading;
            set
            {
                if (SetProperty(ref _isLoading, value))
                {
                    OnPropertyChanged(nameof(HasNoModules));
                    // Note: Command state will be re-evaluated automatically
                }
            }
        }

        public bool HasNoModules => !IsLoading && !DiscoveryModules.Any();

        public IAsyncRelayCommand StartDiscoveryCommand { get; }
        public IAsyncRelayCommand RefreshDataCommand { get; }

        /// <summary>
        /// Load discovery modules from the registry
        /// </summary>
        public override async Task LoadAsync()
        {
            try
            {
                IsLoading = true;
                _logger?.LogInformation("[DiscoveryViewModel] Loading discovery modules...");

                // Create a placeholder for MainViewModel since it's complex to instantiate
                MainViewModel? mainViewModel = null;

                // Clear existing modules
                DiscoveryModules.Clear();

                // Load modules from registry
                var modules = await _moduleRegistryService.GetAvailableModulesAsync();
                
                _logger?.LogInformation($"[DiscoveryViewModel] Found {modules.Count} modules in registry");

                foreach (var module in modules)
                {
                    var moduleViewModel = new DiscoveryModuleViewModel(mainViewModel)
                    {
                        ModuleId = module.DisplayName ?? "Unknown",
                        DisplayName = module.DisplayName,
                        Description = module.Description,
                        Icon = !string.IsNullOrEmpty(module.Icon) ? module.Icon : GetModuleIcon(module.Category),
                        Category = module.Category,
                        Enabled = module.Enabled,
                        Status = "Ready"
                    };

                    DiscoveryModules.Add(moduleViewModel);
                }

                _logger?.LogInformation($"[DiscoveryViewModel] Loaded {DiscoveryModules.Count} discovery modules");
                OnPropertyChanged(nameof(HasNoModules));
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "[DiscoveryViewModel] Failed to load discovery modules");
            }
            finally
            {
                IsLoading = false;
            }
        }

        /// <summary>
        /// Start discovery for all enabled modules
        /// </summary>
        private async Task StartDiscoveryAsync()
        {
            try
            {
                _logger?.LogInformation("[DiscoveryViewModel] Starting discovery for all enabled modules");

                var enabledModules = DiscoveryModules.Where(m => m.Enabled).ToList();
                if (!enabledModules.Any())
                {
                    _logger?.LogWarning("[DiscoveryViewModel] No modules enabled for discovery");
                    return;
                }

                var moduleNames = enabledModules.Select(m => m.ModuleId).ToArray();
                var currentProfile = "ljpops"; // Default profile name

                _logger?.LogInformation($"[DiscoveryViewModel] Running discovery for profile '{currentProfile}' with modules: {string.Join(", ", moduleNames)}");

                // Start discovery
                var success = await _discoveryService.StartDiscoveryAsync(currentProfile, moduleNames);

                if (success)
                {
                    _logger?.LogInformation("[DiscoveryViewModel] Discovery started successfully");
                    
                    // Refresh data after discovery
                    await Task.Delay(2000); // Wait for processes to complete
                    await RefreshDataAsync();
                }
                else
                {
                    _logger?.LogWarning("[DiscoveryViewModel] Discovery failed to start");
                }
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "[DiscoveryViewModel] Error starting discovery");
            }
        }

        /// <summary>
        /// Check if discovery can be started
        /// </summary>
        private bool CanStartDiscovery()
        {
            return !IsLoading && DiscoveryModules.Any(m => m.Enabled && m.Status != "Running");
        }

        /// <summary>
        /// Refresh discovery data and module status
        /// </summary>
        private async Task RefreshDataAsync()
        {
            try
            {
                _logger?.LogInformation("[DiscoveryViewModel] Refreshing discovery data");

                // Reload modules to get updated status
                await LoadAsync();

                // Note: Main view model refresh would be handled by the main application

                _logger?.LogInformation("[DiscoveryViewModel] Data refresh completed");
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "[DiscoveryViewModel] Error refreshing data");
            }
        }

        /// <summary>
        /// Get appropriate icon for module category
        /// </summary>
        private string GetModuleIcon(string category)
        {
            return category?.ToLower() switch
            {
                "identity" => "👥",
                "collaboration" => "📧",
                "infrastructure" => "🖥️",
                "security" => "🔒",
                "data" => "🗄️",
                "storage" => "💾",
                "virtualization" => "💻",
                "applications" => "📱",
                "cloud" => "☁️",
                "operations" => "⚡",
                "device management" => "📱",
                "compliance" => "📋",
                "risk assessment" => "⚖️",
                "data governance" => "📊",
                _ => "🔍"
            };
        }

        protected override void OnPropertyChanged([CallerMemberName] string? propertyName = null)
        {
            base.OnPropertyChanged(propertyName);

            // Command states will be re-evaluated automatically by the framework
        }
    }
}