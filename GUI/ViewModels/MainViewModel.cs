using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.ComponentModel;
using System.IO;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using System.Windows;
using System.Windows.Data;
using System.Windows.Input;
using System.Windows.Threading;
using MandADiscoverySuite.Behaviors;
using MandADiscoverySuite.Models;
using MandADiscoverySuite.Services;

namespace MandADiscoverySuite.ViewModels
{
    /// <summary>
    /// Main application view model implementing MVVM pattern
    /// </summary>
    public class MainViewModel : BaseViewModel
    {
        #region Private Fields

        private readonly DiscoveryService _discoveryService;
        private readonly ProfileService _profileService;
        private readonly DispatcherTimer _dashboardTimer;
        private readonly DispatcherTimer _progressTimer;
        private CancellationTokenSource _cancellationTokenSource;
        
        private string _currentView = "Dashboard";
        private CompanyProfile _selectedProfile;
        private bool _isDiscoveryRunning;
        private double _overallProgress;
        private string _currentOperation = "Ready";
        private DateTime _operationStartTime;
        private bool _isDarkTheme = true;
        private string _statusMessage = "Application ready";
        private string _searchText = string.Empty;

        #endregion

        #region Properties

        /// <summary>
        /// Collection of company profiles available for discovery
        /// </summary>
        public ObservableCollection<CompanyProfile> CompanyProfiles { get; }

        /// <summary>
        /// Collection of discovery modules with their status and configuration
        /// </summary>
        public ObservableCollection<DiscoveryModuleViewModel> DiscoveryModules { get; }

        /// <summary>
        /// Collection of filtered discovery modules based on search criteria
        /// </summary>
        public ICollectionView FilteredDiscoveryModules { get; }

        /// <summary>
        /// Collection of filtered discovery results based on search criteria
        /// </summary>
        public ICollectionView FilteredDiscoveryResults { get; }

        /// <summary>
        /// Search and filter view model for advanced filtering
        /// </summary>
        public SearchFilterViewModel SearchFilter { get; }

        /// <summary>
        /// Data visualization view model for charts and analytics
        /// </summary>
        public DataVisualizationViewModel DataVisualization { get; }

        /// <summary>
        /// Collection of dashboard metrics for real-time monitoring
        /// </summary>
        public ObservableCollection<DashboardMetric> DashboardMetrics { get; }

        /// <summary>
        /// Collection of discovery results
        /// </summary>
        public ObservableCollection<DiscoveryResult> DiscoveryResults { get; }

        /// <summary>
        /// Currently selected company profile
        /// </summary>
        public CompanyProfile SelectedProfile
        {
            get => _selectedProfile;
            set => SetProperty(ref _selectedProfile, value, OnSelectedProfileChanged);
        }

        /// <summary>
        /// Current view being displayed (Dashboard, Discovery, Results, etc.)
        /// </summary>
        public string CurrentView
        {
            get => _currentView;
            set => SetProperty(ref _currentView, value, OnCurrentViewChanged);
        }

        /// <summary>
        /// Indicates whether discovery operation is currently running
        /// </summary>
        public bool IsDiscoveryRunning
        {
            get => _isDiscoveryRunning;
            set => SetProperty(ref _isDiscoveryRunning, value, () => OnPropertiesChanged(nameof(CanStartDiscovery), nameof(CanStopDiscovery)));
        }

        /// <summary>
        /// Overall progress of current discovery operation (0-100)
        /// </summary>
        public double OverallProgress
        {
            get => _overallProgress;
            set => SetProperty(ref _overallProgress, value);
        }

        /// <summary>
        /// Description of current operation being performed
        /// </summary>
        public string CurrentOperation
        {
            get => _currentOperation;
            set => SetProperty(ref _currentOperation, value);
        }

        /// <summary>
        /// Start time of current operation
        /// </summary>
        public DateTime OperationStartTime
        {
            get => _operationStartTime;
            set => SetProperty(ref _operationStartTime, value, () => OnPropertyChanged(nameof(ElapsedTime)));
        }

        /// <summary>
        /// Elapsed time since operation started
        /// </summary>
        public TimeSpan ElapsedTime => IsDiscoveryRunning ? DateTime.Now - OperationStartTime : TimeSpan.Zero;

        /// <summary>
        /// Indicates whether dark theme is currently active
        /// </summary>
        public bool IsDarkTheme
        {
            get => _isDarkTheme;
            set => SetProperty(ref _isDarkTheme, value, OnThemeChanged);
        }

        /// <summary>
        /// Current status message
        /// </summary>
        public string StatusMessage
        {
            get => _statusMessage;
            set => SetProperty(ref _statusMessage, value);
        }

        /// <summary>
        /// Search text for filtering modules and results
        /// </summary>
        public string SearchText
        {
            get => _searchText;
            set => SetProperty(ref _searchText, value, OnSearchTextChanged);
        }

        /// <summary>
        /// Can start discovery operation
        /// </summary>
        public bool CanStartDiscovery => !IsDiscoveryRunning && SelectedProfile != null;

        /// <summary>
        /// Can stop discovery operation
        /// </summary>
        public bool CanStopDiscovery => IsDiscoveryRunning;

        /// <summary>
        /// Total number of enabled modules
        /// </summary>
        public int EnabledModulesCount => DiscoveryModules.Count(m => m.IsEnabled);

        /// <summary>
        /// Total number of discovered items
        /// </summary>
        public int TotalDiscoveredItems => DiscoveryResults.Sum(r => r.ItemCount);

        #endregion

        #region Commands

        public ICommand StartDiscoveryCommand { get; }
        public ICommand StopDiscoveryCommand { get; }
        public ICommand RefreshProfilesCommand { get; }
        public ICommand CreateProfileCommand { get; }
        public ICommand EditProfileCommand { get; }
        public ICommand DeleteProfileCommand { get; }
        public ICommand NavigateCommand { get; }
        public ICommand ToggleModuleCommand { get; }
        public ICommand ConfigureModuleCommand { get; }
        public ICommand ExportResultsCommand { get; }
        public ICommand ImportProfileCommand { get; }
        public ICommand ToggleThemeCommand { get; }
        public ICommand ClearSearchCommand { get; }
        public ICommand SelectAllModulesCommand { get; }
        public ICommand SelectNoneModulesCommand { get; }
        public ICommand DropFilesCommand { get; }

        #endregion

        #region Constructor

        public MainViewModel()
        {
            // Initialize collections
            CompanyProfiles = new ObservableCollection<CompanyProfile>();
            DiscoveryModules = new ObservableCollection<DiscoveryModuleViewModel>();
            DashboardMetrics = new ObservableCollection<DashboardMetric>();
            DiscoveryResults = new ObservableCollection<DiscoveryResult>();

            // Initialize services
            _discoveryService = new DiscoveryService();
            _profileService = new ProfileService();

            // Initialize search filter
            SearchFilter = new SearchFilterViewModel();
            SearchFilter.FiltersChanged += (s, e) => FilteredDiscoveryResults.Refresh();

            // Initialize data visualization
            DataVisualization = new DataVisualizationViewModel();
            DataVisualization.DataSource = DiscoveryResults;

            // Initialize filtered views
            FilteredDiscoveryModules = CollectionViewSource.GetDefaultView(DiscoveryModules);
            FilteredDiscoveryModules.Filter = FilterModules;

            FilteredDiscoveryResults = CollectionViewSource.GetDefaultView(DiscoveryResults);
            FilteredDiscoveryResults.Filter = FilterResults;

            // Initialize commands
            StartDiscoveryCommand = new AsyncRelayCommand(StartDiscoveryAsync, () => CanStartDiscovery);
            StopDiscoveryCommand = new RelayCommand(StopDiscovery, () => CanStopDiscovery);
            RefreshProfilesCommand = new AsyncRelayCommand(RefreshProfilesAsync);
            CreateProfileCommand = new AsyncRelayCommand(CreateProfileAsync);
            EditProfileCommand = new RelayCommand<CompanyProfile>(EditProfile);
            DeleteProfileCommand = new RelayCommand<CompanyProfile>(DeleteProfile);
            NavigateCommand = new RelayCommand<string>(Navigate);
            ToggleModuleCommand = new RelayCommand<DiscoveryModuleViewModel>(ToggleModule);
            ConfigureModuleCommand = new RelayCommand<DiscoveryModuleViewModel>(ConfigureModule);
            ExportResultsCommand = new AsyncRelayCommand(ExportResultsAsync);
            ImportProfileCommand = new AsyncRelayCommand(ImportProfileAsync);
            ToggleThemeCommand = new RelayCommand(ToggleTheme);
            ClearSearchCommand = new RelayCommand(() => SearchText = string.Empty);
            SelectAllModulesCommand = new RelayCommand(() => SetAllModulesEnabled(true));
            SelectNoneModulesCommand = new RelayCommand(() => SetAllModulesEnabled(false));
            DropFilesCommand = new AsyncDropCommand(HandleDropAsync);

            // Initialize timers
            _dashboardTimer = new DispatcherTimer { Interval = TimeSpan.FromSeconds(5) };
            _dashboardTimer.Tick += DashboardTimer_Tick;

            _progressTimer = new DispatcherTimer { Interval = TimeSpan.FromSeconds(1) };
            _progressTimer.Tick += ProgressTimer_Tick;

            // Load initial data
            _ = InitializeAsync();
        }

        #endregion

        #region Initialization

        private async Task InitializeAsync()
        {
            try
            {
                StatusMessage = "Initializing application...";
                
                // Load company profiles
                await LoadCompanyProfilesAsync();
                
                // Initialize discovery modules
                InitializeDiscoveryModules();
                
                // Initialize dashboard metrics
                InitializeDashboardMetrics();
                
                // Start dashboard timer
                _dashboardTimer.Start();
                
                StatusMessage = "Application ready";
            }
            catch (Exception ex)
            {
                StatusMessage = $"Initialization error: {ex.Message}";
                // TODO: Log error
            }
        }

        private async Task LoadCompanyProfilesAsync()
        {
            var profiles = await _profileService.GetProfilesAsync();
            
            Application.Current.Dispatcher.Invoke(() =>
            {
                CompanyProfiles.Clear();
                foreach (var profile in profiles)
                {
                    CompanyProfiles.Add(profile);
                }

                if (CompanyProfiles.Count > 0 && SelectedProfile == null)
                {
                    SelectedProfile = CompanyProfiles.First();
                }
            });
        }

        private void InitializeDiscoveryModules()
        {
            var modules = new[]
            {
                new DiscoveryModuleViewModel("ActiveDirectory", "Active Directory Discovery", "Discover AD users, groups, computers, and organizational structure", true),
                new DiscoveryModuleViewModel("AzureAD", "Azure AD Discovery", "Discover Azure AD users, groups, and applications", true),
                new DiscoveryModuleViewModel("Exchange", "Exchange Discovery", "Discover Exchange mailboxes, databases, and configuration", true),
                new DiscoveryModuleViewModel("SharePoint", "SharePoint Discovery", "Discover SharePoint sites, lists, and permissions", false),
                new DiscoveryModuleViewModel("Teams", "Microsoft Teams Discovery", "Discover Teams, channels, and membership", false),
                new DiscoveryModuleViewModel("Intune", "Intune Discovery", "Discover managed devices and policies", false),
                new DiscoveryModuleViewModel("NetworkInfrastructure", "Network Infrastructure", "Discover network devices, switches, and routers", false),
                new DiscoveryModuleViewModel("SQLServer", "SQL Server Discovery", "Discover SQL Server instances and databases", false),
                new DiscoveryModuleViewModel("FileServers", "File Server Discovery", "Discover file shares and permissions", false),
                new DiscoveryModuleViewModel("Applications", "Application Discovery", "Discover installed applications and services", false),
                new DiscoveryModuleViewModel("Certificates", "Certificate Discovery", "Discover digital certificates and PKI", false),
                new DiscoveryModuleViewModel("Printers", "Printer Discovery", "Discover network and local printers", false),
                new DiscoveryModuleViewModel("VMware", "VMware Discovery", "Discover VMware virtual infrastructure", false),
                new DiscoveryModuleViewModel("DataClassification", "Data Classification", "Classify and assess data sensitivity", false),
                new DiscoveryModuleViewModel("SecurityGroups", "Security Group Analysis", "Analyze security group membership and permissions", false)
            };

            Application.Current.Dispatcher.Invoke(() =>
            {
                DiscoveryModules.Clear();
                foreach (var module in modules)
                {
                    DiscoveryModules.Add(module);
                }
            });
        }

        private void InitializeDashboardMetrics()
        {
            var metrics = new[]
            {
                new DashboardMetric("Total Users", 0, "👥", "Primary"),
                new DashboardMetric("Total Devices", 0, "💻", "Success"),
                new DashboardMetric("Security Groups", 0, "🔒", "Warning"),
                new DashboardMetric("Applications", 0, "📱", "Info")
            };

            Application.Current.Dispatcher.Invoke(() =>
            {
                DashboardMetrics.Clear();
                foreach (var metric in metrics)
                {
                    DashboardMetrics.Add(metric);
                }
            });
        }

        #endregion

        #region Discovery Operations

        private async Task StartDiscoveryAsync()
        {
            if (SelectedProfile == null)
            {
                StatusMessage = "Please select a company profile first";
                return;
            }

            try
            {
                IsDiscoveryRunning = true;
                OperationStartTime = DateTime.Now;
                OverallProgress = 0;
                CurrentOperation = "Initializing discovery...";
                StatusMessage = "Discovery started";

                _cancellationTokenSource = new CancellationTokenSource();
                _progressTimer.Start();

                // Clear previous results
                DiscoveryResults.Clear();

                // Get enabled modules
                var enabledModules = DiscoveryModules.Where(m => m.IsEnabled).ToList();
                
                if (!enabledModules.Any())
                {
                    StatusMessage = "No modules enabled for discovery";
                    IsDiscoveryRunning = false;
                    return;
                }

                var progress = new Progress<DiscoveryProgress>(UpdateDiscoveryProgress);
                
                await _discoveryService.StartDiscoveryAsync(
                    SelectedProfile, 
                    enabledModules.Select(m => m.ModuleName).ToList(),
                    progress,
                    _cancellationTokenSource.Token);

                if (!_cancellationTokenSource.Token.IsCancellationRequested)
                {
                    CurrentOperation = "Discovery completed successfully";
                    OverallProgress = 100;
                    StatusMessage = "Discovery completed";
                    
                    // Load results
                    await LoadDiscoveryResultsAsync();
                }
            }
            catch (OperationCanceledException)
            {
                CurrentOperation = "Discovery cancelled";
                StatusMessage = "Discovery was cancelled";
            }
            catch (Exception ex)
            {
                CurrentOperation = $"Discovery failed: {ex.Message}";
                StatusMessage = $"Discovery error: {ex.Message}";
                // TODO: Log error
            }
            finally
            {
                IsDiscoveryRunning = false;
                _progressTimer.Stop();
                _cancellationTokenSource?.Dispose();
                _cancellationTokenSource = null;
            }
        }

        private void StopDiscovery()
        {
            _cancellationTokenSource?.Cancel();
            CurrentOperation = "Stopping discovery...";
            StatusMessage = "Discovery stop requested";
        }

        private void UpdateDiscoveryProgress(DiscoveryProgress progress)
        {
            Application.Current.Dispatcher.Invoke(() =>
            {
                OverallProgress = progress.OverallProgress;
                CurrentOperation = progress.CurrentOperation;
                
                // Update module status
                var module = DiscoveryModules.FirstOrDefault(m => m.ModuleName == progress.ModuleName);
                if (module != null)
                {
                    module.Status = progress.Status;
                    module.Progress = progress.ModuleProgress;
                    module.LastMessage = progress.Message;
                }
            });
        }

        private async Task LoadDiscoveryResultsAsync()
        {
            try
            {
                var results = await _discoveryService.GetResultsAsync(SelectedProfile);
                
                Application.Current.Dispatcher.Invoke(() =>
                {
                    DiscoveryResults.Clear();
                    foreach (var result in results)
                    {
                        DiscoveryResults.Add(result);
                    }
                    
                    // Update dashboard metrics
                    UpdateDashboardMetrics();
                });
            }
            catch (Exception ex)
            {
                StatusMessage = $"Failed to load results: {ex.Message}";
                // TODO: Log error
            }
        }

        #endregion

        #region Event Handlers

        private void OnSelectedProfileChanged()
        {
            StatusMessage = SelectedProfile != null ? $"Selected profile: {SelectedProfile.CompanyName}" : "No profile selected";
            OnPropertyChanged(nameof(CanStartDiscovery));
        }

        private void OnCurrentViewChanged()
        {
            StatusMessage = $"Switched to {CurrentView} view";
        }

        private void OnThemeChanged()
        {
            // TODO: Apply theme changes
            StatusMessage = IsDarkTheme ? "Switched to dark theme" : "Switched to light theme";
        }

        private void OnSearchTextChanged()
        {
            FilteredDiscoveryModules.Refresh();
        }

        private void DashboardTimer_Tick(object sender, EventArgs e)
        {
            if (!IsDiscoveryRunning)
            {
                UpdateDashboardMetrics();
            }
        }

        private void ProgressTimer_Tick(object sender, EventArgs e)
        {
            OnPropertyChanged(nameof(ElapsedTime));
        }

        #endregion

        #region Helper Methods

        private bool FilterModules(object item)
        {
            if (string.IsNullOrWhiteSpace(SearchText))
                return true;

            var module = item as DiscoveryModuleViewModel;
            return module?.DisplayName.Contains(SearchText, StringComparison.OrdinalIgnoreCase) == true ||
                   module?.Description.Contains(SearchText, StringComparison.OrdinalIgnoreCase) == true;
        }

        private bool FilterResults(object item)
        {
            return SearchFilter.FilterPredicate(item);
        }

        private void UpdateDashboardMetrics()
        {
            // Update metrics based on current results
            var totalUsers = DiscoveryResults.Where(r => r.ModuleName == "ActiveDirectory" || r.ModuleName == "AzureAD")
                                           .Sum(r => r.ItemCount);
            var totalDevices = DiscoveryResults.Where(r => r.ModuleName == "Intune" || r.ModuleName == "ActiveDirectory")
                                             .Sum(r => r.ItemCount);
            var securityGroups = DiscoveryResults.Where(r => r.ModuleName == "SecurityGroups")
                                               .Sum(r => r.ItemCount);
            var applications = DiscoveryResults.Where(r => r.ModuleName == "Applications")
                                            .Sum(r => r.ItemCount);

            Application.Current.Dispatcher.Invoke(() =>
            {
                DashboardMetrics[0].Value = totalUsers;
                DashboardMetrics[1].Value = totalDevices;
                DashboardMetrics[2].Value = securityGroups;
                DashboardMetrics[3].Value = applications;
            });
        }

        private async Task RefreshProfilesAsync()
        {
            await LoadCompanyProfilesAsync();
            StatusMessage = "Company profiles refreshed";
        }

        private async Task CreateProfileAsync()
        {
            // TODO: Show create profile dialog
            StatusMessage = "Create profile functionality coming soon";
        }

        private void EditProfile(CompanyProfile profile)
        {
            if (profile != null)
            {
                // TODO: Show edit profile dialog
                StatusMessage = $"Edit profile: {profile.CompanyName}";
            }
        }

        private void DeleteProfile(CompanyProfile profile)
        {
            if (profile != null)
            {
                // TODO: Show confirmation dialog and delete
                StatusMessage = $"Delete profile: {profile.CompanyName}";
            }
        }

        private void Navigate(string view)
        {
            CurrentView = view;
        }

        private void ToggleModule(DiscoveryModuleViewModel module)
        {
            if (module != null)
            {
                module.IsEnabled = !module.IsEnabled;
                OnPropertyChanged(nameof(EnabledModulesCount));
                StatusMessage = $"{module.DisplayName} {(module.IsEnabled ? "enabled" : "disabled")}";
            }
        }

        private void ConfigureModule(DiscoveryModuleViewModel module)
        {
            if (module != null)
            {
                // TODO: Show module configuration dialog
                StatusMessage = $"Configure {module.DisplayName}";
            }
        }

        private async Task ExportResultsAsync()
        {
            try
            {
                if (!DiscoveryResults.Any())
                {
                    StatusMessage = "No results to export";
                    return;
                }

                await _discoveryService.ExportResultsAsync(SelectedProfile, DiscoveryResults.ToList());
                StatusMessage = "Results exported successfully";
            }
            catch (Exception ex)
            {
                StatusMessage = $"Export failed: {ex.Message}";
                // TODO: Log error
            }
        }

        private async Task ImportProfileAsync()
        {
            try
            {
                var openFileDialog = new Microsoft.Win32.OpenFileDialog
                {
                    Title = "Import Company Profile",
                    Filter = "JSON Files (*.json)|*.json|All Files (*.*)|*.*",
                    DefaultExt = "json"
                };

                if (openFileDialog.ShowDialog() == true)
                {
                    await ImportProfileFromFileAsync(openFileDialog.FileName);
                }
            }
            catch (Exception ex)
            {
                StatusMessage = $"Import failed: {ex.Message}";
                // TODO: Log error
            }
        }

        /// <summary>
        /// Imports a profile from a file path (used for both dialog and drag-drop)
        /// </summary>
        public async Task ImportProfileFromFileAsync(string filePath)
        {
            try
            {
                StatusMessage = "Importing profile...";
                
                var importedProfile = await _profileService.ImportProfileAsync(filePath);
                
                Application.Current.Dispatcher.Invoke(() =>
                {
                    CompanyProfiles.Add(importedProfile);
                    SelectedProfile = importedProfile;
                });

                StatusMessage = $"Profile '{importedProfile.CompanyName}' imported successfully";
            }
            catch (Exception ex)
            {
                StatusMessage = $"Import failed: {ex.Message}";
                throw;
            }
        }

        /// <summary>
        /// Handles drag-drop operations for profile import
        /// </summary>
        public async Task HandleDropAsync(string[] droppedFiles)
        {
            try
            {
                var profileFiles = droppedFiles.Where(f => 
                    Path.GetExtension(f).Equals(".json", StringComparison.OrdinalIgnoreCase))
                    .ToList();

                if (!profileFiles.Any())
                {
                    StatusMessage = "No valid profile files found in dropped items";
                    return;
                }

                var importedCount = 0;
                var errors = new List<string>();

                foreach (var file in profileFiles)
                {
                    try
                    {
                        await ImportProfileFromFileAsync(file);
                        importedCount++;
                    }
                    catch (Exception ex)
                    {
                        errors.Add($"{Path.GetFileName(file)}: {ex.Message}");
                    }
                }

                if (importedCount > 0)
                {
                    StatusMessage = $"Successfully imported {importedCount} profile(s)";
                    if (errors.Any())
                    {
                        StatusMessage += $" ({errors.Count} failed)";
                    }
                }
                else if (errors.Any())
                {
                    StatusMessage = $"Import failed: {string.Join("; ", errors)}";
                }
            }
            catch (Exception ex)
            {
                StatusMessage = $"Drag-drop import failed: {ex.Message}";
            }
        }

        private void ToggleTheme()
        {
            IsDarkTheme = !IsDarkTheme;
        }

        private void SetAllModulesEnabled(bool enabled)
        {
            foreach (var module in DiscoveryModules)
            {
                module.IsEnabled = enabled;
            }
            OnPropertyChanged(nameof(EnabledModulesCount));
            StatusMessage = enabled ? "All modules enabled" : "All modules disabled";
        }

        #endregion

        #region IDisposable

        public void Dispose()
        {
            _dashboardTimer?.Stop();
            _progressTimer?.Stop();
            _cancellationTokenSource?.Cancel();
            _cancellationTokenSource?.Dispose();
        }

        #endregion
    }
}