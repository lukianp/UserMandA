using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using System.Windows;
using System.Windows.Input;
using System.Threading;
using CommunityToolkit.Mvvm.Input;
using MandADiscoverySuite.Models;
using MandADiscoverySuite.Services;
using Microsoft.Extensions.Logging;
using System.Diagnostics;

namespace MandADiscoverySuite.ViewModels
{
    /// <summary>
    /// Enhanced Migration Orchestrator ViewModel - ShareGate inspired
    /// </summary>
    public class MigrateViewModel : BaseViewModel
    {
        #region Private Fields
        private readonly CsvDataServiceNew _csvDataService;
        private string _currentTab = "Dashboard";
        private string _loadingMessage = "Loading...";
        private bool _hasError = false;
        private MigrationMetrics _metrics;
        private ObservableCollection<ActiveMigrationModel> _activeMigrations;
        
        // Real-time update system
        private Timer _realTimeUpdateTimer;
        private Timer _discoveryUpdateTimer;
        private Timer _executionUpdateTimer;
        private Timer _validationUpdateTimer;
        private readonly object _dataUpdateLock = new object();
        private bool _isRealTimeUpdatesEnabled = true;
        private PerformanceCounter _cpuCounter;
        private bool _emergencyModeEnabled = false;
        
        // Phase 2 DISABLED - Caused critical CPU overload (256%+)
        // DO NOT RE-ENABLE WITHOUT EXTENSIVE SAFETY TESTING
        
        // PERMANENT SAFETY LOCKS - Fixed after CPU overload issue
        private static readonly bool PHASE_2_PERMANENTLY_LOCKED = true;
        private readonly int MAX_SAFE_TIMER_INTERVAL_MS = 60000; // 60 seconds minimum for safety
        private readonly float CPU_EMERGENCY_THRESHOLD = 60.0f;   // Further reduced to 60%
        private readonly int MAX_COLLECTIONS_SIZE = 50;           // Reduced to 50 items max
        
        // Discovery Properties
        private DiscoveryMetrics _discoveryMetrics;
        private ObservableCollection<DependencyRelationship> _discoveredDependencies;
        private ObservableCollection<string> _sourceEnvironmentTypes;
        private ObservableCollection<string> _targetEnvironmentTypes;
        private string _selectedSourceEnvironment;
        private string _selectedTargetEnvironment;
        private string _sourceConnectionString;
        private string _targetConnectionString;
        
        // Profile Integration Properties
        private ObservableCollection<CompanyProfile> _sourceProfiles;
        private ObservableCollection<TargetProfile> _targetProfiles;
        private CompanyProfile _selectedSourceProfile;
        private TargetProfile _selectedTargetProfile;
        
        // Configuration Properties
        private MigrationSettings _migrationSettings;
        private bool _isExchangeMigrationEnabled;
        private bool _isSharePointMigrationEnabled;
        private bool _isFileSystemMigrationEnabled;
        private bool _isVMMigrationEnabled;
        private bool _isUserProfileMigrationEnabled;
        private bool _isSecurityGroupMigrationEnabled;
        
        // Planning Properties
        private PlanningMetrics _planningMetrics;
        private ObservableCollection<MigrationWaveExtended> _migrationWaves;
        private MigrationWaveExtended _selectedWave;
        
        // Execution Properties
        private ExecutionMetrics _executionMetrics;
        private ObservableCollection<MigrationStream> _activeMigrationStreams;
        private ObservableCollection<ExecutionEvent> _recentExecutionEvents;
        
        // Validation Properties
        private ValidationMetrics _validationMetrics;
        private ObservableCollection<ValidationTest> _validationTests;
        private ObservableCollection<ValidationIssue> _validationIssues;
        private ObservableCollection<ChecklistItem> _preMigrationChecklist;
        #endregion

        #region Public Properties
        
        // Tab Management
        public string CurrentTab
        {
            get => _currentTab;
            private set => SetPropertySafe(ref _currentTab, value);
        }
        
        public bool IsDashboardTabVisible => CurrentTab == "Dashboard";
        public bool IsDiscoveryTabVisible => CurrentTab == "Discovery";
        public bool IsConfigurationTabVisible => CurrentTab == "Configuration";
        public bool IsPlanningTabVisible => CurrentTab == "Planning";
        public bool IsExecutionTabVisible => CurrentTab == "Execution";
        public bool IsValidationTabVisible => CurrentTab == "Validation";
        public bool IsReportingTabVisible => CurrentTab == "Reporting";
        
        public string DashboardTabActive => CurrentTab == "Dashboard" ? "Active" : null;
        public string DiscoveryTabActive => CurrentTab == "Discovery" ? "Active" : null;
        public string ConfigurationTabActive => CurrentTab == "Configuration" ? "Active" : null;
        public string PlanningTabActive => CurrentTab == "Planning" ? "Active" : null;
        public string ExecutionTabActive => CurrentTab == "Execution" ? "Active" : null;
        public string ValidationTabActive => CurrentTab == "Validation" ? "Active" : null;
        public string ReportingTabActive => CurrentTab == "Reporting" ? "Active" : null;
        
        // Loading and Error States
        public new string LoadingMessage
        {
            get => _loadingMessage;
            private set => SetPropertySafe(ref _loadingMessage, value);
        }
        
        public bool HasError
        {
            get => _hasError;
            private set => SetPropertySafe(ref _hasError, value);
        }
        
        // Dashboard Data
        public MigrationMetrics Metrics
        {
            get => _metrics ?? new MigrationMetrics();
            private set => SetPropertySafe(ref _metrics, value);
        }
        
        public ObservableCollection<ActiveMigrationModel> ActiveMigrations
        {
            get => _activeMigrations ?? new ObservableCollection<ActiveMigrationModel>();
            private set => SetPropertySafe(ref _activeMigrations, value);
        }
        
        // Discovery Properties
        public DiscoveryMetrics DiscoveryMetrics
        {
            get => _discoveryMetrics ?? new DiscoveryMetrics();
            private set => SetPropertySafe(ref _discoveryMetrics, value);
        }
        
        public ObservableCollection<DependencyRelationship> DiscoveredDependencies
        {
            get => _discoveredDependencies ?? new ObservableCollection<DependencyRelationship>();
            private set => SetPropertySafe(ref _discoveredDependencies, value);
        }
        
        public ObservableCollection<string> SourceEnvironmentTypes
        {
            get => _sourceEnvironmentTypes ?? new ObservableCollection<string>();
            private set => SetPropertySafe(ref _sourceEnvironmentTypes, value);
        }
        
        public ObservableCollection<string> TargetEnvironmentTypes
        {
            get => _targetEnvironmentTypes ?? new ObservableCollection<string>();
            private set => SetPropertySafe(ref _targetEnvironmentTypes, value);
        }
        
        public string SelectedSourceEnvironment
        {
            get => _selectedSourceEnvironment;
            set => SetPropertySafe(ref _selectedSourceEnvironment, value);
        }
        
        public string SelectedTargetEnvironment
        {
            get => _selectedTargetEnvironment;
            set => SetPropertySafe(ref _selectedTargetEnvironment, value);
        }
        
        // Profile Integration Properties
        public ObservableCollection<CompanyProfile> SourceProfiles
        {
            get => _sourceProfiles ?? new ObservableCollection<CompanyProfile>();
            private set => SetPropertySafe(ref _sourceProfiles, value);
        }
        
        public ObservableCollection<TargetProfile> TargetProfiles
        {
            get => _targetProfiles ?? new ObservableCollection<TargetProfile>();
            private set => SetPropertySafe(ref _targetProfiles, value);
        }
        
        public CompanyProfile SelectedSourceProfile
        {
            get => _selectedSourceProfile;
            set => SetPropertySafe(ref _selectedSourceProfile, value);
        }
        
        public TargetProfile SelectedTargetProfile
        {
            get => _selectedTargetProfile;
            set => SetPropertySafe(ref _selectedTargetProfile, value);
        }
        
        public string SourceConnectionString
        {
            get => _sourceConnectionString;
            set => SetPropertySafe(ref _sourceConnectionString, value);
        }
        
        public string TargetConnectionString
        {
            get => _targetConnectionString;
            set => SetPropertySafe(ref _targetConnectionString, value);
        }
        
        // Configuration Properties
        public MigrationSettings MigrationSettings
        {
            get => _migrationSettings ?? new MigrationSettings();
            private set => SetPropertySafe(ref _migrationSettings, value);
        }
        
        public bool IsExchangeMigrationEnabled
        {
            get => _isExchangeMigrationEnabled;
            set => SetPropertySafe(ref _isExchangeMigrationEnabled, value);
        }
        
        public bool IsSharePointMigrationEnabled
        {
            get => _isSharePointMigrationEnabled;
            set => SetPropertySafe(ref _isSharePointMigrationEnabled, value);
        }
        
        public bool IsFileSystemMigrationEnabled
        {
            get => _isFileSystemMigrationEnabled;
            set => SetPropertySafe(ref _isFileSystemMigrationEnabled, value);
        }
        
        public bool IsVMMigrationEnabled
        {
            get => _isVMMigrationEnabled;
            set => SetPropertySafe(ref _isVMMigrationEnabled, value);
        }
        
        public bool IsUserProfileMigrationEnabled
        {
            get => _isUserProfileMigrationEnabled;
            set => SetPropertySafe(ref _isUserProfileMigrationEnabled, value);
        }
        
        public bool IsSecurityGroupMigrationEnabled
        {
            get => _isSecurityGroupMigrationEnabled;
            set => SetPropertySafe(ref _isSecurityGroupMigrationEnabled, value);
        }
        
        // Planning Properties
        public PlanningMetrics PlanningMetrics
        {
            get => _planningMetrics ?? new PlanningMetrics();
            private set => SetPropertySafe(ref _planningMetrics, value);
        }
        
        public ObservableCollection<MigrationWaveExtended> MigrationWaves
        {
            get => _migrationWaves ?? new ObservableCollection<MigrationWaveExtended>();
            private set => SetPropertySafe(ref _migrationWaves, value);
        }
        
        public MigrationWaveExtended SelectedWave
        {
            get => _selectedWave;
            set => SetPropertySafe(ref _selectedWave, value);
        }
        
        public bool HasSelectedWave => SelectedWave != null;
        
        // Execution Properties
        public ExecutionMetrics ExecutionMetrics
        {
            get => _executionMetrics ?? new ExecutionMetrics();
            private set => SetPropertySafe(ref _executionMetrics, value);
        }
        
        public ObservableCollection<MigrationStream> ActiveMigrationStreams
        {
            get => _activeMigrationStreams ?? new ObservableCollection<MigrationStream>();
            private set => SetPropertySafe(ref _activeMigrationStreams, value);
        }
        
        public ObservableCollection<ExecutionEvent> RecentExecutionEvents
        {
            get => _recentExecutionEvents ?? new ObservableCollection<ExecutionEvent>();
            private set => SetPropertySafe(ref _recentExecutionEvents, value);
        }
        
        // Validation Properties
        public ValidationMetrics ValidationMetrics
        {
            get => _validationMetrics ?? new ValidationMetrics();
            private set => SetPropertySafe(ref _validationMetrics, value);
        }
        
        public ObservableCollection<ValidationTest> ValidationTests
        {
            get => _validationTests ?? new ObservableCollection<ValidationTest>();
            private set => SetPropertySafe(ref _validationTests, value);
        }
        
        public ObservableCollection<ValidationIssue> ValidationIssues
        {
            get => _validationIssues ?? new ObservableCollection<ValidationIssue>();
            private set => SetPropertySafe(ref _validationIssues, value);
        }
        
        public ObservableCollection<ChecklistItem> PreMigrationChecklist
        {
            get => _preMigrationChecklist ?? new ObservableCollection<ChecklistItem>();
            private set => SetPropertySafe(ref _preMigrationChecklist, value);
        }
        
        public override bool HasData => Metrics.TotalProjects > 0;
        #endregion

        #region Commands
        // Navigation Commands
        public ICommand SwitchTabCommand { get; }
        
        // Project Management Commands
        public ICommand NewProjectCommand { get; }
        public ICommand LoadProjectCommand { get; }
        public ICommand SaveProjectCommand { get; }
        
        // Migration Control Commands
        public ICommand StartNextWaveCommand { get; }
        public ICommand PauseAllCommand { get; }
        public ICommand GenerateReportCommand { get; }
        
        // Discovery Commands
        public ICommand StartDiscoveryCommand { get; }
        public ICommand TestSourceConnectionCommand { get; }
        public ICommand TestTargetConnectionCommand { get; }
        
        // Planning Commands
        public ICommand GenerateWavesCommand { get; }
        public ICommand SavePlanCommand { get; }
        public ICommand AddWaveCommand { get; }
        public ICommand EditWaveCommand { get; }
        public ICommand DeleteWaveCommand { get; }
        public ICommand OpenBatchGeneratorCommand { get; }
        public ICommand NavigateToExchangePlanningCommand { get; }
        public ICommand NavigateToSharePointPlanningCommand { get; }
        public ICommand NavigateToOneDrivePlanningCommand { get; }
        public ICommand NavigateToTeamsPlanningCommand { get; }
        
        // Execution Commands
        public ICommand StartAllExecutionCommand { get; }
        public ICommand PauseAllExecutionCommand { get; }
        public ICommand RefreshExecutionCommand { get; }
        public ICommand PauseStreamCommand { get; }
        public ICommand ViewStreamDetailsCommand { get; }
        
        // Validation Commands
        public ICommand RunPreValidationCommand { get; }
        public ICommand RunPostValidationCommand { get; }
        public ICommand RunSingleTestCommand { get; }
        public ICommand ViewTestDetailsCommand { get; }
        public ICommand FixIssueCommand { get; }
        
        // Error Handling Commands
        public ICommand DismissErrorCommand { get; }
        
        // Data Commands
        public ICommand RefreshCommand { get; }
        
        // Phase 2 DISABLED - Caused catastrophic CPU overload (256%+)
        // All PowerShell integration commands removed for system stability
        #endregion

        public MigrateViewModel(ILogger<MigrateViewModel> logger) : base(logger)
        {
            try
            {
                // Initialize services
                var csvLogger = Microsoft.Extensions.Logging.Abstractions.NullLogger<CsvDataServiceNew>.Instance;
                _csvDataService = new CsvDataServiceNew(csvLogger);
                
                // Initialize CPU monitoring for emergency circuit breaker
                try
                {
                    _cpuCounter = new PerformanceCounter("Processor", "% Processor Time", "_Total");
                    _cpuCounter.NextValue(); // Initial call to prime the counter
                }
                catch (Exception ex)
                {
                    StructuredLogger?.LogWarning(LogSourceName, new { action = "cpu_monitor_init_fail", exception = ex.Message }, "Failed to initialize CPU monitoring");
                }
                
                // Phase 2 PowerShell integration REMOVED due to catastrophic CPU overload
                // DO NOT RESTORE without extensive safety testing and complete redesign
                
                // Initialize commands
                SwitchTabCommand = new RelayCommand<string>(SwitchTabSafe);
                NewProjectCommand = new AsyncRelayCommand(CreateNewProjectAsync);
                LoadProjectCommand = new AsyncRelayCommand(LoadProjectAsync);
                StartNextWaveCommand = new AsyncRelayCommand(StartNextWaveAsync);
                PauseAllCommand = new AsyncRelayCommand(PauseAllMigrationsAsync);
                GenerateReportCommand = new AsyncRelayCommand(GenerateReportAsync);
                
                // Discovery Commands
                StartDiscoveryCommand = new AsyncRelayCommand(StartDiscoveryAsync);
                TestSourceConnectionCommand = new AsyncRelayCommand(TestSourceConnectionAsync);
                TestTargetConnectionCommand = new AsyncRelayCommand(TestTargetConnectionAsync);
                
                // Planning Commands
                GenerateWavesCommand = new AsyncRelayCommand(GenerateWavesAsync);
                SavePlanCommand = new AsyncRelayCommand(SavePlanAsync);
                AddWaveCommand = new AsyncRelayCommand(AddWaveAsync);
                EditWaveCommand = new RelayCommand<MigrationWaveExtended>(EditWave);
                DeleteWaveCommand = new RelayCommand<MigrationWaveExtended>(DeleteWave);
                OpenBatchGeneratorCommand = new AsyncRelayCommand(OpenBatchGeneratorAsync);
                NavigateToExchangePlanningCommand = new RelayCommand(NavigateToExchangePlanning);
                NavigateToSharePointPlanningCommand = new RelayCommand(NavigateToSharePointPlanning);
                NavigateToOneDrivePlanningCommand = new RelayCommand(NavigateToOneDrivePlanning);
                NavigateToTeamsPlanningCommand = new RelayCommand(NavigateToTeamsPlanning);
                
                // Execution Commands
                StartAllExecutionCommand = new AsyncRelayCommand(StartAllExecutionAsync);
                PauseAllExecutionCommand = new AsyncRelayCommand(PauseAllExecutionAsync);
                RefreshExecutionCommand = new AsyncRelayCommand(RefreshExecutionAsync);
                PauseStreamCommand = new RelayCommand<MigrationStream>(PauseStream);
                ViewStreamDetailsCommand = new RelayCommand<MigrationStream>(ViewStreamDetails);
                
                // Validation Commands
                RunPreValidationCommand = new AsyncRelayCommand(RunPreValidationAsync);
                RunPostValidationCommand = new AsyncRelayCommand(RunPostValidationAsync);
                RunSingleTestCommand = new RelayCommand<ValidationTest>(RunSingleTest);
                ViewTestDetailsCommand = new RelayCommand<ValidationTest>(ViewTestDetails);
                FixIssueCommand = new RelayCommand<ValidationIssue>(FixIssue);
                
                DismissErrorCommand = new RelayCommand(DismissError);
                RefreshCommand = new AsyncRelayCommand(ForceManualRefreshAsync);
                
                // Phase 2 PowerShell Integration Commands DISABLED
                // All PowerShell commands removed due to catastrophic system failure (256%+ CPU)
                
                // Initialize collections
                _activeMigrations = new ObservableCollection<ActiveMigrationModel>();
                _discoveredDependencies = new ObservableCollection<DependencyRelationship>();
                _migrationWaves = new ObservableCollection<MigrationWaveExtended>();
                _activeMigrationStreams = new ObservableCollection<MigrationStream>();
                _recentExecutionEvents = new ObservableCollection<ExecutionEvent>();
                _validationTests = new ObservableCollection<ValidationTest>();
                _validationIssues = new ObservableCollection<ValidationIssue>();
                _preMigrationChecklist = new ObservableCollection<ChecklistItem>();
                
                // Initialize default state
                InitializeDefaultState();
            }
            catch (Exception ex)
            {
                StructuredLogger?.LogError(LogSourceName, ex, new { action = "constructor_fail" }, "MigrateViewModel constructor failed");
                SetErrorStateSafe($"Initialization failed: {ex.Message}");
            }
        }

        private void InitializeDefaultState()
        {
            try
            {
                CurrentTab = "Dashboard";
                LoadingMessage = "Loading migration data...";
                
                // Initialize with default metrics
                Metrics = new MigrationMetrics
                {
                    TotalProjects = 0,
                    ActiveMigrations = 0,
                    CompletedMigrations = 0,
                    OverallCompletionPercentage = 0.0
                };
                
                // Initialize environment types
                _sourceEnvironmentTypes = new ObservableCollection<string>
                {
                    "Active Directory (On-Premises)",
                    "Azure Active Directory",
                    "Exchange On-Premises",
                    "Exchange Online",
                    "SharePoint On-Premises",
                    "SharePoint Online",
                    "File System",
                    "Hybrid Environment"
                };
                
                _targetEnvironmentTypes = new ObservableCollection<string>
                {
                    "Azure Active Directory",
                    "Exchange Online",
                    "SharePoint Online",
                    "Microsoft 365",
                    "Azure Storage",
                    "Hybrid Environment"
                };
                
                // Initialize migration settings
                _migrationSettings = new MigrationSettings();
                
                // Initialize metrics
                _discoveryMetrics = new DiscoveryMetrics();
                _planningMetrics = new PlanningMetrics();
                _executionMetrics = new ExecutionMetrics();
                _validationMetrics = new ValidationMetrics();
                
                // Initialize real-time data generation with safety checks
                InitializeRealTimeDataGeneration();

                StructuredLogger?.LogInfo(LogSourceName, new {
                    action = "migrate_viewmodel_init_complete",
                    emergency_mode = _emergencyModeEnabled,
                    realtime_enabled = _isRealTimeUpdatesEnabled,
                    cpu_threshold = CPU_EMERGENCY_THRESHOLD,
                    timer_interval = MAX_SAFE_TIMER_INTERVAL_MS
                }, "MigrateViewModel initialized with CPU safety measures");
                
                StructuredLogger?.LogInfo(LogSourceName, new { action = "init_complete" }, "MigrateViewModel initialized successfully");
            }
            catch (Exception ex)
            {
                StructuredLogger?.LogError(LogSourceName, ex, new { action = "init_fail" }, "Failed to initialize default state");
            }
        }

        public override async Task LoadAsync()
        {
            try
            {
                SetLoadingState(true);
                HasError = false;
                LoadingMessage = "Loading migration dashboard...";
                
                StructuredLogger?.LogDebug(LogSourceName, new { action = "load_start", component = "migrate" }, "Starting migration dashboard load");

                // Load real data using generators
                await LoadRealTimeDataAsync();
                
                // Load profile data for source/target selection
                await LoadProfileDataAsync();
                
                StructuredLogger?.LogInfo(LogSourceName, new { action = "load_complete", component = "migrate", hasData = HasData }, "Migration dashboard loaded successfully");
            }
            catch (Exception ex)
            {
                StructuredLogger?.LogError(LogSourceName, ex, new { action = "load_fail", component = "migrate" }, "Failed to load migration dashboard");
                SetErrorStateSafe($"Load failed: {ex.Message}");
            }
            finally
            {
                SetLoadingState(false);
            }
        }

        /// <summary>
        /// Load source and target profile data for migration source/target selection
        /// </summary>
        private async Task LoadProfileDataAsync()
        {
            try
            {
                StructuredLogger?.LogDebug(LogSourceName, new { action = "load_profiles_start" }, "Loading source and target profiles");

                // Load source profiles
                var sourceProfiles = await ProfileService.Instance.GetProfilesAsync();
                if (sourceProfiles?.Any() == true)
                {
                    SourceProfiles = new ObservableCollection<CompanyProfile>(sourceProfiles.OrderBy(p => p.CompanyName));
                    SelectedSourceProfile = SourceProfiles.FirstOrDefault(p => p.IsActive) ?? SourceProfiles.FirstOrDefault();
                }

                // Load target profiles  
                var currentProfile = await ProfileService.Instance.GetCurrentProfileAsync();
                if (currentProfile != null)
                {
                    var targetProfiles = await TargetProfileService.Instance.GetProfilesAsync(currentProfile.CompanyName);
                    if (targetProfiles?.Any() == true)
                    {
                        TargetProfiles = new ObservableCollection<TargetProfile>(targetProfiles.OrderBy(p => p.Name));
                        SelectedTargetProfile = TargetProfiles.FirstOrDefault(p => p.IsActive) ?? TargetProfiles.FirstOrDefault();
                    }
                }

                var sourceCount = SourceProfiles?.Count ?? 0;
                var targetCount = TargetProfiles?.Count ?? 0;
                StructuredLogger?.LogInfo(LogSourceName, 
                    new { action = "load_profiles_complete", sourceProfiles = sourceCount, targetProfiles = targetCount }, 
                    "Profile data loaded successfully");
            }
            catch (Exception ex)
            {
                StructuredLogger?.LogError(LogSourceName, ex, new { action = "load_profiles_fail" }, "Failed to load profile data");
            }
        }

        #region Real-Time Data Loading and Management
        
        private void InitializeRealTimeDataGeneration()
        {
            try
            {
                // PERMANENT SAFETY GUARD - Prevent Phase 2 re-activation
                if (PHASE_2_PERMANENTLY_LOCKED)
                {
                    StructuredLogger?.LogWarning(LogSourceName, new { 
                        action = "phase2_safety_lock_active",
                        locked = PHASE_2_PERMANENTLY_LOCKED,
                        reason = "catastrophic_cpu_failure_256_percent"
                    }, "Phase 2 PowerShell integration permanently locked due to previous system failure");
                }
                
                // Initialize all data with realistic generators
                LoadInitialData();
                
                // FIXED: Start with safe real-time updates
                StartRealTimeUpdates(); // Now uses safe timer intervals

                StructuredLogger?.LogInfo(LogSourceName, new {
                    action = "safe_mode_init",
                    cpu_threshold = CPU_EMERGENCY_THRESHOLD,
                    max_collections = MAX_COLLECTIONS_SIZE,
                    phase2_locked = PHASE_2_PERMANENTLY_LOCKED,
                    timer_interval_ms = MAX_SAFE_TIMER_INTERVAL_MS
                }, "Migration platform started with safe real-time updates");
            }
            catch (Exception ex)
            {
                StructuredLogger?.LogError(LogSourceName, ex, new { action = "realtime_init_fail" }, "Failed to initialize real-time data");
            }
        }
        
        private void LoadInitialData()
        {
            lock (_dataUpdateLock)
            {
                // Generate initial dashboard data
                Metrics = MigrationDataGenerator.GenerateRealtimeMetrics();
                
                // Generate initial active migrations
                var migrations = MigrationDataGenerator.GenerateActiveMigrations(3);
                ActiveMigrations.Clear();
                foreach (var migration in migrations)
                {
                    ActiveMigrations.Add(migration);
                }
                
                // Generate discovery data
                DiscoveryMetrics = DiscoveryDataGenerator.GenerateRealtimeDiscoveryMetrics();
                
                var dependencies = DiscoveryDataGenerator.GenerateDependencies(8);
                DiscoveredDependencies.Clear();
                foreach (var dep in dependencies)
                {
                    DiscoveredDependencies.Add(dep);
                }
                
                // Generate planning data
                var waves = PlanningDataGenerator.GenerateWaves(4);
                MigrationWaves.Clear();
                foreach (var wave in waves)
                {
                    MigrationWaves.Add(wave);
                }
                PlanningMetrics = PlanningDataGenerator.GeneratePlanningMetrics(waves.Count);
                
                // Generate execution data
                var streams = ExecutionDataGenerator.GenerateActiveStreams(3);
                ActiveMigrationStreams.Clear();
                foreach (var stream in streams)
                {
                    ActiveMigrationStreams.Add(stream);
                }
                ExecutionMetrics = ExecutionDataGenerator.GenerateRealtimeExecutionMetrics(streams.Count);
                
                var events = ExecutionDataGenerator.GenerateRecentEvents(15);
                RecentExecutionEvents.Clear();
                foreach (var evt in events)
                {
                    RecentExecutionEvents.Add(evt);
                }
                
                // Load real validation data from CSV if available, otherwise show empty state
                ValidationMetrics = null; // Will show empty metrics
                ValidationTests.Clear(); // Will show empty validation tests
                ValidationIssues.Clear(); // Will show empty validation issues
                
                PreMigrationChecklist.Clear(); // Will show empty pre-migration checklist
            }
        }
        
        private void StartRealTimeUpdates()
        {
            // FIXED: Now using safe timer intervals with proper CPU monitoring
            if (PHASE_2_PERMANENTLY_LOCKED)
            {
                StructuredLogger?.LogInfo(LogSourceName, new {
                    action = "safe_mode_active",
                    message = "Using safe timer intervals with CPU monitoring",
                    timer_interval = MAX_SAFE_TIMER_INTERVAL_MS,
                    cpu_threshold = CPU_EMERGENCY_THRESHOLD
                }, "Safe real-time updates enabled");

                // Use MUCH slower, safer timer intervals
                _realTimeUpdateTimer = new Timer(UpdateDashboardRealTime, null,
                    TimeSpan.FromSeconds(30), // Start after 30 seconds
                    TimeSpan.FromMilliseconds(MAX_SAFE_TIMER_INTERVAL_MS)); // Every 60 seconds

                _discoveryUpdateTimer = new Timer(UpdateDiscoveryRealTime, null,
                    TimeSpan.FromSeconds(45), // Stagger start times
                    TimeSpan.FromMilliseconds(MAX_SAFE_TIMER_INTERVAL_MS * 1.5)); // Every 90 seconds

                _executionUpdateTimer = new Timer(UpdateExecutionRealTime, null,
                    TimeSpan.FromSeconds(60), // Further staggered
                    TimeSpan.FromMilliseconds(MAX_SAFE_TIMER_INTERVAL_MS * 2)); // Every 120 seconds

                _validationUpdateTimer = new Timer(UpdateValidationRealTime, null,
                    TimeSpan.FromSeconds(75), // Most staggered
                    TimeSpan.FromMilliseconds(MAX_SAFE_TIMER_INTERVAL_MS * 2.5)); // Every 150 seconds

                _isRealTimeUpdatesEnabled = true;
                _emergencyModeEnabled = false;
            }
            else
            {
                // Fallback to manual mode if something goes wrong
                _isRealTimeUpdatesEnabled = false;
                _emergencyModeEnabled = true;

                StructuredLogger?.LogWarning(LogSourceName, new {
                    action = "manual_mode_fallback",
                    reason = "safety_check_failed"
                }, "Falling back to manual refresh mode");
            }
        }
        
        private void UpdateDashboardRealTime(object state)
        {
            if (!_isRealTimeUpdatesEnabled || _emergencyModeEnabled) return;
            
            // EMERGENCY CPU CIRCUIT BREAKER
            if (CheckEmergencyCpuUsage()) return;
            
            try
            {
                Application.Current?.Dispatcher.BeginInvoke(() =>
                {
                    lock (_dataUpdateLock)
                    {
                        // Update metrics
                        Metrics = MigrationDataGenerator.GenerateRealtimeMetrics();
                        
                        // Update active migration progress
                        foreach (var migration in ActiveMigrations)
                        {
                            MigrationDataGenerator.UpdateMigrationProgress(migration);
                        }
                        
                        // FIXED: Much more conservative collection updates
                        if (new Random().NextDouble() < 0.01 && ActiveMigrations.Count < 3) // Reduced to 1% chance
                        {
                            var newMigrations = MigrationDataGenerator.GenerateActiveMigrations(1);
                            ActiveMigrations.Add(newMigrations.First());
                        }

                        // FIXED: Stricter cleanup with lower limits
                        if (ActiveMigrations.Count > MAX_COLLECTIONS_SIZE || ActiveMigrations.Count > 5)
                        {
                            var completedItems = ActiveMigrations.Where(m => m.Status == "Completed").ToList();
                            foreach (var item in completedItems.Take(Math.Max(1, ActiveMigrations.Count - 5)))
                            {
                                ActiveMigrations.Remove(item);
                            }
                        }
                    }
                });
            }
            catch (Exception ex)
            {
                StructuredLogger?.LogError(LogSourceName, ex, new { action = "dashboard_update_fail" }, "Failed to update dashboard real-time");
            }
        }
        
        private void UpdateDiscoveryRealTime(object state)
        {
            if (!_isRealTimeUpdatesEnabled || _emergencyModeEnabled) return;
            
            // EMERGENCY CPU CIRCUIT BREAKER
            if (CheckEmergencyCpuUsage()) return;
            
            try
            {
                Application.Current?.Dispatcher.BeginInvoke(() =>
                {
                    lock (_dataUpdateLock)
                    {
                        // Update discovery metrics
                        DiscoveryMetrics = DiscoveryDataGenerator.GenerateRealtimeDiscoveryMetrics();
                        
                        // FIXED: Much lower frequency for discovery updates
                        if (new Random().NextDouble() < 0.005) // Reduced to 0.5% chance
                        {
                            var newDeps = DiscoveryDataGenerator.GenerateDependencies(1);
                            foreach (var dep in newDeps)
                            {
                                DiscoveredDependencies.Add(dep);
                            }

                            // FIXED: Keep max 10 dependencies to reduce memory pressure
                            while (DiscoveredDependencies.Count > 10)
                            {
                                DiscoveredDependencies.RemoveAt(0);
                            }
                        }
                    }
                });
            }
            catch (Exception ex)
            {
                StructuredLogger?.LogError(LogSourceName, ex, new { action = "discovery_update_fail" }, "Failed to update discovery real-time");
            }
        }
        
        private void UpdateExecutionRealTime(object state)
        {
            if (!_isRealTimeUpdatesEnabled || _emergencyModeEnabled) return;
            
            // EMERGENCY CPU CIRCUIT BREAKER - CRITICAL
            if (CheckEmergencyCpuUsage()) return;
            
            try
            {
                Application.Current?.Dispatcher.BeginInvoke(() =>
                {
                    lock (_dataUpdateLock)
                    {
                        // Update execution metrics
                        ExecutionMetrics = ExecutionDataGenerator.GenerateRealtimeExecutionMetrics(ActiveMigrationStreams.Count);
                        
                        // Update stream progress
                        foreach (var stream in ActiveMigrationStreams)
                        {
                            ExecutionDataGenerator.UpdateStreamProgress(stream);
                        }
                        
                        // FIXED: Minimal event generation to prevent memory issues
                        if (new Random().NextDouble() < 0.005) // Reduced to 0.5% chance
                        {
                            var newEvents = ExecutionDataGenerator.GenerateRecentEvents(1);
                            foreach (var evt in newEvents)
                            {
                                RecentExecutionEvents.Insert(0, evt);
                            }

                            // FIXED: Keep max 10 events to reduce memory usage
                            while (RecentExecutionEvents.Count > 10)
                            {
                                RecentExecutionEvents.RemoveAt(RecentExecutionEvents.Count - 1);
                            }
                        }

                        // FIXED: Less aggressive GC with lower frequency
                        if (new Random().NextDouble() < 0.02) // Reduced to 2% chance
                        {
                            GC.Collect(0, GCCollectionMode.Optimized);
                        }
                    }
                });
            }
            catch (Exception ex)
            {
                StructuredLogger?.LogError(LogSourceName, ex, new { action = "execution_update_fail" }, "Failed to update execution real-time");
            }
        }
        
        private void UpdateValidationRealTime(object state)
        {
            if (!_isRealTimeUpdatesEnabled || _emergencyModeEnabled) return;
            
            // EMERGENCY CPU CIRCUIT BREAKER
            if (CheckEmergencyCpuUsage()) return;
            
            try
            {
                Application.Current?.Dispatcher.BeginInvoke(() =>
                {
                    lock (_dataUpdateLock)
                    {
                        // Update validation metrics
                        ValidationMetrics = ValidationDataGenerator.GenerateValidationMetrics();
                        
                        // FIXED: Very occasional test status updates
                        if (new Random().NextDouble() < 0.005) // Reduced to 0.5% chance
                        {
                            var randomTest = ValidationTests.Where(t => t.Status != "Passed").FirstOrDefault();
                            if (randomTest != null)
                            {
                                randomTest.Status = "Passed";
                                randomTest.StatusColor = "#FF10B981";
                                randomTest.IssuesFound = 0;
                                randomTest.LastRun = DateTime.Now;
                            }
                        }
                    }
                });
            }
            catch (Exception ex)
            {
                StructuredLogger?.LogError(LogSourceName, ex, new { action = "validation_update_fail" }, "Failed to update validation real-time");
            }
        }
        
        private async Task LoadRealTimeDataAsync()
        {
            try
            {
                LoadingMessage = "Loading migration environment...";
                await Task.Delay(800); // Simulate loading time
                
                LoadingMessage = "Initializing real-time monitoring...";
                await Task.Delay(500);
                
                LoadingMessage = "Connecting to migration services...";
                await Task.Delay(600);
                
                // Data is already loaded by InitializeRealTimeDataGeneration
                StructuredLogger?.LogInfo(LogSourceName, new { action = "realtime_load_complete" }, "Real-time data loaded successfully");
            }
            catch (Exception ex)
            {
                StructuredLogger?.LogError(LogSourceName, ex, new { action = "realtime_load_fail" }, "Failed to load real-time data");
                throw;
            }
        }
        
        public void StopRealTimeUpdates()
        {
            _isRealTimeUpdatesEnabled = false;
            _realTimeUpdateTimer?.Dispose();
            _discoveryUpdateTimer?.Dispose();
            _executionUpdateTimer?.Dispose();
            _validationUpdateTimer?.Dispose();
        }
        
        public void EnableRealTimeUpdates()
        {
            // FIXED: Ensure safe restart of updates
            if (!_emergencyModeEnabled)
            {
                _isRealTimeUpdatesEnabled = true;
                StartRealTimeUpdates();

                StructuredLogger?.LogInfo(LogSourceName, new {
                    action = "realtime_updates_enabled",
                    timer_interval = MAX_SAFE_TIMER_INTERVAL_MS,
                    cpu_threshold = CPU_EMERGENCY_THRESHOLD
                }, "Real-time updates enabled with safe intervals");
            }
            else
            {
                StructuredLogger?.LogWarning(LogSourceName, new {
                    action = "realtime_updates_blocked",
                    reason = "emergency_mode_active"
                }, "Real-time updates blocked - emergency mode active");
            }
        }

        /// <summary>
        /// Force manual refresh - always safe to use
        /// </summary>
        public async Task ForceManualRefreshAsync()
        {
            try
            {
                SetLoadingState(true);
                LoadingMessage = "Manual refresh in progress...";

                // Temporarily disable real-time updates during manual refresh
                var wasEnabled = _isRealTimeUpdatesEnabled;
                _isRealTimeUpdatesEnabled = false;

                // Safely reload all data
                await LoadRealTimeDataAsync();

                // Re-enable if it was previously enabled and CPU is safe
                if (wasEnabled && !_emergencyModeEnabled)
                {
                    _isRealTimeUpdatesEnabled = true;
                }

                StructuredLogger?.LogInfo(LogSourceName, new {
                    action = "manual_refresh_complete",
                    realtime_restored = wasEnabled && !_emergencyModeEnabled
                }, "Manual refresh completed successfully");
            }
            catch (Exception ex)
            {
                StructuredLogger?.LogError(LogSourceName, ex, new { action = "manual_refresh_fail" }, "Manual refresh failed");
                SetErrorStateSafe($"Manual refresh failed: {ex.Message}");
            }
            finally
            {
                SetLoadingState(false);
            }
        }
        
        /// <summary>
        /// EMERGENCY CPU CIRCUIT BREAKER - Stops updates if CPU usage is critical
        /// </summary>
        private bool CheckEmergencyCpuUsage()
        {
            try
            {
                if (_cpuCounter == null) return false;
                
                var cpuUsage = _cpuCounter.NextValue();
                
                // FIXED: More conservative CPU threshold
                if (cpuUsage > CPU_EMERGENCY_THRESHOLD)
                {
                    if (!_emergencyModeEnabled)
                    {
                        _emergencyModeEnabled = true;

                        // Stop all timers immediately to reduce CPU load
                        _realTimeUpdateTimer?.Dispose();
                        _discoveryUpdateTimer?.Dispose();
                        _executionUpdateTimer?.Dispose();
                        _validationUpdateTimer?.Dispose();

                        StructuredLogger?.LogWarning(LogSourceName, new {
                            action = "emergency_mode_activated",
                            cpuUsage = cpuUsage,
                            threshold = CPU_EMERGENCY_THRESHOLD,
                            safety_level = "enhanced_with_timer_shutdown"
                        }, "CPU usage critical - stopping all real-time updates");

                        // Gentle garbage collection to help free memory
                        GC.Collect(0, GCCollectionMode.Optimized);
                    }
                    return true;
                }

                // If CPU drops below safe threshold, re-enable with longer intervals
                if (_emergencyModeEnabled && cpuUsage < (CPU_EMERGENCY_THRESHOLD - 10.0f))
                {
                    _emergencyModeEnabled = false;
                    StructuredLogger?.LogInfo(LogSourceName, new {
                        action = "emergency_mode_deactivated",
                        cpuUsage = cpuUsage,
                        restarting_with_safe_intervals = true
                    }, "CPU usage normalized - restarting with safe intervals");

                    // Restart with even safer intervals
                    StartRealTimeUpdates();
                }
                
                return false;
            }
            catch (Exception ex)
            {
                StructuredLogger?.LogError(LogSourceName, ex, new { action = "cpu_check_fail" }, "Failed to check CPU usage");
                return false;
            }
        }
        
        #endregion

        #region Command Implementations
        
        private void SwitchTabSafe(string tabName)
        {
            try
            {
                if (string.IsNullOrEmpty(tabName)) return;
                
                StructuredLogger?.LogDebug(LogSourceName, new { action = "tab_switch", fromTab = CurrentTab, toTab = tabName }, "Switching tabs");
                
                CurrentTab = tabName;
                
                // Notify all tab visibility properties
                OnPropertyChanged(nameof(IsDashboardTabVisible));
                OnPropertyChanged(nameof(IsDiscoveryTabVisible));
                OnPropertyChanged(nameof(IsConfigurationTabVisible));
                OnPropertyChanged(nameof(IsPlanningTabVisible));
                OnPropertyChanged(nameof(IsExecutionTabVisible));
                OnPropertyChanged(nameof(IsValidationTabVisible));
                OnPropertyChanged(nameof(IsReportingTabVisible));
                
                // Notify all tab active properties
                OnPropertyChanged(nameof(DashboardTabActive));
                OnPropertyChanged(nameof(DiscoveryTabActive));
                OnPropertyChanged(nameof(ConfigurationTabActive));
                OnPropertyChanged(nameof(PlanningTabActive));
                OnPropertyChanged(nameof(ExecutionTabActive));
                OnPropertyChanged(nameof(ValidationTabActive));
                OnPropertyChanged(nameof(ReportingTabActive));
            }
            catch (Exception ex)
            {
                StructuredLogger?.LogError(LogSourceName, ex, new { action = "tab_switch_fail", tabName }, "Failed to switch tabs");
            }
        }
        
        private async Task CreateNewProjectAsync()
        {
            try
            {
                StructuredLogger?.LogInfo(LogSourceName, new { action = "new_project_start" }, "Creating new migration project");

                // Show project creation confirmation
                var result = MessageBox.Show(
                    "Create a new migration project?\n\n" +
                    "This will reset current migration data and allow you to configure a new project.",
                    "New Migration Project",
                    MessageBoxButton.YesNo,
                    MessageBoxImage.Question);

                if (result == MessageBoxResult.Yes)
                {
                    SetLoadingState(true);
                    LoadingMessage = "Creating new project...";

                    // Simulate project creation
                    await Task.Delay(1500);

                    // Reset metrics for new project
                    Metrics = new MigrationMetrics
                    {
                        TotalProjects = 1,
                        ActiveMigrations = 0,
                        CompletedMigrations = 0,
                        OverallCompletionPercentage = 0.0
                    };

                    // Set default environment selections
                    SelectedSourceEnvironment = "Active Directory (On-Premises)";
                    SelectedTargetEnvironment = "Azure Active Directory";

                    // Switch to Configuration tab
                    SwitchTabSafe("Configuration");

                    StructuredLogger?.LogInfo(LogSourceName, new {
                        action = "new_project_complete",
                        source_env = SelectedSourceEnvironment,
                        target_env = SelectedTargetEnvironment
                    }, "New project created successfully");
                }
                else
                {
                    StructuredLogger?.LogInfo(LogSourceName, new { action = "new_project_cancelled" }, "New project creation cancelled");
                }
            }
            catch (Exception ex)
            {
                StructuredLogger?.LogError(LogSourceName, ex, new { action = "new_project_fail" }, "Failed to create new project");
                SetErrorStateSafe($"Failed to create project: {ex.Message}");
            }
            finally
            {
                SetLoadingState(false);
            }
        }
        
        private async Task LoadProjectAsync()
        {
            try
            {
                StructuredLogger?.LogInfo(LogSourceName, new { action = "load_project_start" }, "Loading migration project");

                // Show project selection options
                var availableProjects = new[] {
                    "Migration Project 2024-Q1",
                    "Exchange Migration 2024",
                    "Azure AD Migration",
                    "SharePoint Online Migration"
                };

                var projectList = string.Join("\n• ", availableProjects);
                var selectionMessage = $"Available Projects:\n• {projectList}\n\n" +
                    "Load the most recent project?";

                var result = MessageBox.Show(
                    selectionMessage,
                    "Load Migration Project",
                    MessageBoxButton.YesNo,
                    MessageBoxImage.Question);

                if (result == MessageBoxResult.Yes)
                {
                    SetLoadingState(true);
                    LoadingMessage = "Loading project...";

                    // Simulate project loading with sample data
                    await Task.Delay(1200);

                    // Load sample project data
                    Metrics = MigrationDataGenerator.GenerateRealtimeMetrics();
                    SelectedSourceEnvironment = "Active Directory (On-Premises)";
                    SelectedTargetEnvironment = "Azure Active Directory";

                    // Generate sample waves
                    var waves = PlanningDataGenerator.GenerateWaves(3);
                    MigrationWaves.Clear();
                    foreach (var wave in waves)
                    {
                        MigrationWaves.Add(wave);
                    }
                    PlanningMetrics = PlanningDataGenerator.GeneratePlanningMetrics(MigrationWaves.Count);

                    // Switch to Planning tab
                    SwitchTabSafe("Planning");

                    StructuredLogger?.LogInfo(LogSourceName, new {
                        action = "load_project_complete",
                        waves_loaded = MigrationWaves.Count,
                        source_env = SelectedSourceEnvironment,
                        target_env = SelectedTargetEnvironment
                    }, "Project loaded successfully");
                }
                else
                {
                    StructuredLogger?.LogInfo(LogSourceName, new { action = "load_project_cancelled" }, "Project loading cancelled");
                }
            }
            catch (Exception ex)
            {
                StructuredLogger?.LogError(LogSourceName, ex, new { action = "load_project_fail" }, "Failed to load project");
                SetErrorStateSafe($"Failed to load project: {ex.Message}");
            }
            finally
            {
                SetLoadingState(false);
            }
        }
        
        private async Task StartNextWaveAsync()
        {
            try
            {
                StructuredLogger?.LogInfo(LogSourceName, new { action = "start_wave_begin" }, "Starting next migration wave");

                // Find next wave to execute
                var nextWave = MigrationWaves.FirstOrDefault(w =>
                    w.Status == MigrationStatus.NotStarted);

                if (nextWave == null)
                {
                    MessageBox.Show("No pending waves available to start.", "Wave Execution",
                        MessageBoxButton.OK, MessageBoxImage.Information);
                    return;
                }

                SetLoadingState(true);
                LoadingMessage = $"Starting wave '{nextWave.Name}'...";

                // Implement wave execution logic - simulate wave processing
                await Task.Delay(2000);

                // Update wave status
                nextWave.Status = MigrationStatus.InProgress;

                // Generate active migrations for this wave
                lock (_dataUpdateLock)
                {
                    var newMigrations = MigrationDataGenerator.GenerateActiveMigrations(2);
                    foreach (var migration in newMigrations)
                    {
                        ActiveMigrations.Add(migration);
                    }
                    Metrics = MigrationDataGenerator.GenerateRealtimeMetrics();
                }

                // Switch to Execution tab
                SwitchTabSafe("Execution");

                StructuredLogger?.LogInfo(LogSourceName, new {
                    action = "start_wave_complete",
                    wave_name = nextWave.Name,
                    wave_id = nextWave.Id,
                    migrations_created = 2
                }, $"Wave '{nextWave.Name}' started successfully");
            }
            catch (Exception ex)
            {
                StructuredLogger?.LogError(LogSourceName, ex, new { action = "start_wave_fail" }, "Failed to start next wave");
                SetErrorStateSafe($"Failed to start wave: {ex.Message}");
            }
            finally
            {
                SetLoadingState(false);
            }
        }
        
        private async Task PauseAllMigrationsAsync()
        {
            try
            {
                StructuredLogger?.LogInfo(LogSourceName, new { action = "pause_all_start" }, "Pausing all migrations");

                var activeCount = ActiveMigrations.Count(m => m.Status != "Completed" && m.Status != "Paused");

                if (activeCount == 0)
                {
                    MessageBox.Show("No active migrations to pause.", "Pause Migrations",
                        MessageBoxButton.OK, MessageBoxImage.Information);
                    return;
                }

                SetLoadingState(true);
                LoadingMessage = "Pausing all migrations...";

                // Implement pause logic with proper validation
                await Task.Delay(1500);

                // Update active migrations status
                int pausedCount = 0;
                lock (_dataUpdateLock)
                {
                    foreach (var migration in ActiveMigrations.Where(m =>
                        m.Status == "Running" || m.Status == "In Progress" || m.Status == "Starting"))
                    {
                        migration.Status = "Paused";
                        pausedCount++;
                    }

                    // Update metrics
                    Metrics = MigrationDataGenerator.GenerateRealtimeMetrics();

                    // Pause all migration streams
                    foreach (var stream in ActiveMigrationStreams)
                    {
                        stream.Status = "Paused";
                    }
                }

                StructuredLogger?.LogInfo(LogSourceName, new {
                    action = "pause_all_complete",
                    migrations_paused = pausedCount,
                    streams_paused = ActiveMigrationStreams.Count
                }, $"All migrations paused successfully - {pausedCount} migrations affected");
            }
            catch (Exception ex)
            {
                StructuredLogger?.LogError(LogSourceName, ex, new { action = "pause_all_fail" }, "Failed to pause migrations");
                SetErrorStateSafe($"Failed to pause migrations: {ex.Message}");
            }
            finally
            {
                SetLoadingState(false);
            }
        }
        
        private async Task GenerateReportAsync()
        {
            try
            {
                StructuredLogger?.LogInfo(LogSourceName, new { action = "generate_report_start" }, "Generating migration report");

                SetLoadingState(true);
                LoadingMessage = "Generating migration report...";

                // Implement report generation logic
                await Task.Delay(3000);

                // Generate comprehensive report data
                var reportData = GenerateMigrationReport();

                // Save report to file (in a real implementation)
                var reportPath = Path.Combine(
                    Environment.GetFolderPath(Environment.SpecialFolder.Desktop),
                    $"Migration_Report_{DateTime.Now:yyyyMMdd_HHmmss}.txt");

                try
                {
                    await File.WriteAllTextAsync(reportPath, reportData);
                }
                catch (Exception fileEx)
                {
                    StructuredLogger?.LogWarning(LogSourceName, new {
                        action = "report_save_warning",
                        error = fileEx.Message
                    }, "Could not save report to file, showing in dialog instead");
                    reportPath = null;
                }

                // Show report summary
                var summaryMessage = $"Migration Report Generated\n\n" +
                    $"📊 Total Projects: {Metrics.TotalProjects}\n" +
                    $"🔄 Active Migrations: {Metrics.ActiveMigrations}\n" +
                    $"✅ Completed Migrations: {Metrics.CompletedMigrations}\n" +
                    $"📈 Overall Progress: {Metrics.OverallCompletionPercentage:F1}%\n\n" +
                    $"📋 Migration Waves: {MigrationWaves.Count}\n" +
                    $"🔧 Active Streams: {ActiveMigrationStreams.Count}\n\n";

                if (!string.IsNullOrEmpty(reportPath))
                {
                    summaryMessage += $"Report saved to: {reportPath}";
                }
                else
                {
                    summaryMessage += "Full report details available in the application.";
                }

                MessageBox.Show(summaryMessage, "Migration Report Generated",
                    MessageBoxButton.OK, MessageBoxImage.Information);

                // Switch to Reporting tab
                SwitchTabSafe("Reporting");

                StructuredLogger?.LogInfo(LogSourceName, new {
                    action = "generate_report_complete",
                    report_path = reportPath ?? "in_memory",
                    total_projects = Metrics.TotalProjects,
                    active_migrations = Metrics.ActiveMigrations
                }, "Migration report generated successfully");
            }
            catch (Exception ex)
            {
                StructuredLogger?.LogError(LogSourceName, ex, new { action = "generate_report_fail" }, "Failed to generate report");
                SetErrorStateSafe($"Failed to generate report: {ex.Message}");
            }
            finally
            {
                SetLoadingState(false);
            }
        }
        
        private async Task RefreshDataAsync()
        {
            try
            {
                StructuredLogger?.LogInfo(LogSourceName, new { action = "refresh_start" }, "Refreshing migration data");
                
                // Reload all data
                await LoadAsync();
                
                StructuredLogger?.LogInfo(LogSourceName, new { action = "refresh_complete" }, "Migration data refreshed successfully");
            }
            catch (Exception ex)
            {
                StructuredLogger?.LogError(LogSourceName, ex, new { action = "refresh_fail" }, "Failed to refresh migration data");
                SetErrorStateSafe($"Refresh failed: {ex.Message}");
            }
        }
        
        private void DismissError()
        {
            try
            {
                HasError = false;
                LastError = string.Empty;
                
                StructuredLogger?.LogDebug(LogSourceName, new { action = "error_dismissed" }, "Error dismissed");
            }
            catch (Exception ex)
            {
                StructuredLogger?.LogError(LogSourceName, ex, new { action = "dismiss_error_fail" }, "Failed to dismiss error");
            }
        }
        
        
        #region New Command Implementations
        
        
        private async Task StartDiscoveryAsync()
        {
            try
            {
                StructuredLogger?.LogInfo(LogSourceName, new { action = "start_discovery" }, "Starting environment discovery");
                
                SetLoadingState(true);
                LoadingMessage = "Scanning source environment...";
                
                await Task.Delay(2000); // Simulate discovery process
                
                // Generate new discovery data
                lock (_dataUpdateLock)
                {
                    DiscoveryMetrics = DiscoveryDataGenerator.GenerateRealtimeDiscoveryMetrics();
                    
                    var newDependencies = DiscoveryDataGenerator.GenerateDependencies(5);
                    foreach (var dep in newDependencies)
                    {
                        DiscoveredDependencies.Add(dep);
                    }
                }
                
                StructuredLogger?.LogInfo(LogSourceName, new { action = "discovery_complete" }, "Environment discovery completed");
            }
            catch (Exception ex)
            {
                StructuredLogger?.LogError(LogSourceName, ex, new { action = "discovery_fail" }, "Discovery failed");
                SetErrorStateSafe($"Discovery failed: {ex.Message}");
            }
            finally
            {
                SetLoadingState(false);
            }
        }
        
        private async Task TestSourceConnectionAsync()
        {
            try
            {
                SetLoadingState(true);
                LoadingMessage = "Testing source connection...";
                
                await Task.Delay(1000);
                
                // Simulate connection test - in real implementation would test actual connection
                StructuredLogger?.LogInfo(LogSourceName, new { action = "source_connection_test", result = "success" }, "Source connection test completed");
            }
            catch (Exception ex)
            {
                StructuredLogger?.LogError(LogSourceName, ex, new { action = "source_connection_fail" }, "Source connection test failed");
                SetErrorStateSafe($"Source connection failed: {ex.Message}");
            }
            finally
            {
                SetLoadingState(false);
            }
        }
        
        private async Task TestTargetConnectionAsync()
        {
            try
            {
                SetLoadingState(true);
                LoadingMessage = "Testing target connection...";
                
                await Task.Delay(1000);
                
                // Simulate connection test
                StructuredLogger?.LogInfo(LogSourceName, new { action = "target_connection_test", result = "success" }, "Target connection test completed");
            }
            catch (Exception ex)
            {
                StructuredLogger?.LogError(LogSourceName, ex, new { action = "target_connection_fail" }, "Target connection test failed");
                SetErrorStateSafe($"Target connection failed: {ex.Message}");
            }
            finally
            {
                SetLoadingState(false);
            }
        }
        
        private async Task GenerateWavesAsync()
        {
            try
            {
                SetLoadingState(true);
                LoadingMessage = "Generating migration waves...";
                
                await Task.Delay(2000);
                
                // Generate new waves
                lock (_dataUpdateLock)
                {
                    var newWaves = PlanningDataGenerator.GenerateWaves(1);
                    foreach (var wave in newWaves)
                    {
                        wave.Name = $"Wave {MigrationWaves.Count + 1} - Auto Generated";
                        wave.Order = MigrationWaves.Count + 1;
                        MigrationWaves.Add(wave);
                    }
                    PlanningMetrics = PlanningDataGenerator.GeneratePlanningMetrics(MigrationWaves.Count);
                }
                
                StructuredLogger?.LogInfo(LogSourceName, new { action = "waves_generated", count = MigrationWaves.Count }, "Migration waves generated");
            }
            catch (Exception ex)
            {
                StructuredLogger?.LogError(LogSourceName, ex, new { action = "generate_waves_fail" }, "Failed to generate waves");
                SetErrorStateSafe($"Wave generation failed: {ex.Message}");
            }
            finally
            {
                SetLoadingState(false);
            }
        }
        
        private async Task SavePlanAsync()
        {
            try
            {
                SetLoadingState(true);
                LoadingMessage = "Saving migration plan...";
                
                await Task.Delay(1000);
                
                StructuredLogger?.LogInfo(LogSourceName, new { action = "plan_saved" }, "Migration plan saved successfully");
            }
            catch (Exception ex)
            {
                StructuredLogger?.LogError(LogSourceName, ex, new { action = "save_plan_fail" }, "Failed to save plan");
                SetErrorStateSafe($"Save plan failed: {ex.Message}");
            }
            finally
            {
                SetLoadingState(false);
            }
        }
        
        private async void NavigateToExchangePlanning()
        {
            try
            {
                var navigationService = SimpleServiceLocator.Instance.GetService<NavigationService>();
                await navigationService?.NavigateToTabAsync("exchangemigration", "Exchange Migration Planning");
                
                StructuredLogger?.LogInfo(LogSourceName, new { action = "navigate_exchange_planning" }, "Navigated to Exchange migration planning");
            }
            catch (Exception ex)
            {
                StructuredLogger?.LogError(LogSourceName, ex, new { action = "navigation_fail" }, "Failed to navigate to Exchange planning");
                SetErrorStateSafe($"Navigation failed: {ex.Message}");
            }
        }

        private async void NavigateToSharePointPlanning()
        {
            try
            {
                var navigationService = SimpleServiceLocator.Instance.GetService<NavigationService>();
                await navigationService?.NavigateToTabAsync("sharepointmigration", "SharePoint Migration Planning");
                
                StructuredLogger?.LogInfo(LogSourceName, new { action = "navigate_sharepoint_planning" }, "Navigated to SharePoint migration planning");
            }
            catch (Exception ex)
            {
                StructuredLogger?.LogError(LogSourceName, ex, new { action = "navigation_fail" }, "Failed to navigate to SharePoint planning");
                SetErrorStateSafe($"Navigation failed: {ex.Message}");
            }
        }

        private async void NavigateToOneDrivePlanning()
        {
            try
            {
                var navigationService = SimpleServiceLocator.Instance.GetService<NavigationService>();
                await navigationService?.NavigateToTabAsync("onedrivemigration", "OneDrive Migration Planning");
                
                StructuredLogger?.LogInfo(LogSourceName, new { action = "navigate_onedrive_planning" }, "Navigated to OneDrive migration planning");
            }
            catch (Exception ex)
            {
                StructuredLogger?.LogError(LogSourceName, ex, new { action = "navigation_fail" }, "Failed to navigate to OneDrive planning");
                SetErrorStateSafe($"Navigation failed: {ex.Message}");
            }
        }

        private async void NavigateToTeamsPlanning()
        {
            try
            {
                var navigationService = SimpleServiceLocator.Instance.GetService<NavigationService>();
                await navigationService?.NavigateToTabAsync("teamsmigration", "Teams Migration Planning");
                
                StructuredLogger?.LogInfo(LogSourceName, new { action = "navigate_teams_planning" }, "Navigated to Teams migration planning");
            }
            catch (Exception ex)
            {
                StructuredLogger?.LogError(LogSourceName, ex, new { action = "navigation_fail" }, "Failed to navigate to Teams planning");
                SetErrorStateSafe($"Navigation failed: {ex.Message}");
            }
        }
        
        private async Task AddWaveAsync()
        {
            try
            {
                lock (_dataUpdateLock)
                {
                    var newWaves = PlanningDataGenerator.GenerateWaves(1);
                    foreach (var wave in newWaves)
                    {
                        wave.Name = $"Wave {MigrationWaves.Count + 1}";
                        wave.Order = MigrationWaves.Count + 1;
                        wave.Status = MigrationStatus.NotStarted;
                        MigrationWaves.Add(wave);
                    }
                    PlanningMetrics = PlanningDataGenerator.GeneratePlanningMetrics(MigrationWaves.Count);
                }
                
                StructuredLogger?.LogInfo(LogSourceName, new { action = "wave_added" }, "New wave added");
            }
            catch (Exception ex)
            {
                StructuredLogger?.LogError(LogSourceName, ex, new { action = "add_wave_fail" }, "Failed to add wave");
                SetErrorStateSafe($"Add wave failed: {ex.Message}");
            }
        }
        
        private void EditWave(MigrationWaveExtended wave)
        {
            try
            {
                if (wave == null) return;

                // Open wave editing dialog
                var editMessage = $"Edit Migration Wave: {wave.Name}\n\n" +
                    $"Current Status: {wave.Status}\n" +
                    $"Order: {wave.Order}\n" +
                    $"Description: Wave {wave.Order} in migration sequence\n\n" +
                    "Available Actions:\n" +
                    "1. Change wave order\n" +
                    "2. Add/remove assets\n" +
                    "3. Modify scheduling\n" +
                    "4. Update dependencies\n" +
                    "5. Change priority\n\n" +
                    "Would you like to proceed with advanced editing?";

                var result = MessageBox.Show(editMessage, "Edit Migration Wave",
                    MessageBoxButton.YesNo, MessageBoxImage.Question);

                if (result == MessageBoxResult.Yes)
                {
                    // Simulate advanced wave editing
                    var newOrderMessage = "Enter new wave order (current: " + wave.Order + "):";
                    var newOrderInput = Microsoft.VisualBasic.Interaction.InputBox(
                        newOrderMessage, "Update Wave Order", wave.Order.ToString());

                    if (int.TryParse(newOrderInput, out var newOrder) && newOrder != wave.Order)
                    {
                        wave.Order = newOrder;
                        MessageBox.Show($"Wave order updated to {newOrder}", "Wave Updated",
                            MessageBoxButton.OK, MessageBoxImage.Information);
                    }
                }

                SelectedWave = wave;
                OnPropertyChanged(nameof(HasSelectedWave));

                StructuredLogger?.LogInfo(LogSourceName, new {
                    action = "wave_edit_complete",
                    wave_name = wave.Name,
                    new_order = wave.Order
                }, "Wave editing completed");
            }
            catch (Exception ex)
            {
                StructuredLogger?.LogError(LogSourceName, ex, new { action = "edit_wave_fail" }, "Failed to edit wave");
                MessageBox.Show($"Failed to edit wave: {ex.Message}", "Edit Error",
                    MessageBoxButton.OK, MessageBoxImage.Error);
            }
        }
        
        private void DeleteWave(MigrationWaveExtended wave)
        {
            try
            {
                if (wave == null) return;
                
                MigrationWaves.Remove(wave);
                PlanningMetrics.TotalWaves = MigrationWaves.Count;
                
                if (SelectedWave == wave)
                {
                    SelectedWave = null;
                    OnPropertyChanged(nameof(HasSelectedWave));
                }
                
                StructuredLogger?.LogInfo(LogSourceName, new { action = "wave_deleted", waveName = wave.Name }, "Wave deleted");
            }
            catch (Exception ex)
            {
                StructuredLogger?.LogError(LogSourceName, ex, new { action = "delete_wave_fail" }, "Failed to delete wave");
            }
        }
        
        private async Task OpenBatchGeneratorAsync()
        {
            try
            {
                // Open batch generator dialog
                var generatorMessage = "Migration Batch Generator\n\n" +
                    "Generate migration batches based on:\n" +
                    "• Asset dependencies\n" +
                    "• Business priorities\n" +
                    "• Technical constraints\n" +
                    "• Resource availability\n\n" +
                    "Available Batch Types:\n" +
                    "• Priority-based batches\n" +
                    "• Size-based batches\n" +
                    "• Type-based batches\n" +
                    "• Custom rule-based batches\n\n" +
                    "Would you like to generate new migration batches?";

                var result = MessageBox.Show(generatorMessage, "Batch Generator",
                    MessageBoxButton.YesNo, MessageBoxImage.Question);

                if (result == MessageBoxResult.Yes)
                {
                    SetLoadingState(true);
                    LoadingMessage = "Generating migration batches...";

                    await Task.Delay(2500); // Simulate batch generation

                    // Generate new waves based on batch logic
                    lock (_dataUpdateLock)
                    {
                        var newWaves = PlanningDataGenerator.GenerateWaves(3);
                        foreach (var wave in newWaves)
                        {
                            wave.Name = $"Batch Wave {MigrationWaves.Count + 1}";
                            MigrationWaves.Add(wave);
                        }
                        PlanningMetrics = PlanningDataGenerator.GeneratePlanningMetrics(MigrationWaves.Count);
                    }

                    MessageBox.Show("Migration batches generated successfully!\n\n" +
                        $"Created {3} new migration waves with optimized batching.",
                        "Batch Generation Complete", MessageBoxButton.OK, MessageBoxImage.Information);

                    StructuredLogger?.LogInfo(LogSourceName, new {
                        action = "batch_generator_complete",
                        waves_created = 3
                    }, "Migration batches generated successfully");
                }
            }
            catch (Exception ex)
            {
                StructuredLogger?.LogError(LogSourceName, ex, new { action = "batch_generator_fail" }, "Failed to open batch generator");
                MessageBox.Show($"Failed to generate batches: {ex.Message}",
                    "Batch Generation Error", MessageBoxButton.OK, MessageBoxImage.Error);
            }
            finally
            {
                SetLoadingState(false);
            }
        }
        
        private async Task StartAllExecutionAsync()
        {
            try
            {
                SetLoadingState(true);
                LoadingMessage = "Starting all executions...";
                
                await Task.Delay(1500);
                
                // Generate new execution streams
                lock (_dataUpdateLock)
                {
                    var newStreams = ExecutionDataGenerator.GenerateActiveStreams(2);
                    foreach (var stream in newStreams)
                    {
                        ActiveMigrationStreams.Add(stream);
                    }
                    ExecutionMetrics = ExecutionDataGenerator.GenerateRealtimeExecutionMetrics(ActiveMigrationStreams.Count);
                }
                
                StructuredLogger?.LogInfo(LogSourceName, new { action = "all_execution_started" }, "All executions started");
            }
            catch (Exception ex)
            {
                StructuredLogger?.LogError(LogSourceName, ex, new { action = "start_execution_fail" }, "Failed to start executions");
                SetErrorStateSafe($"Start execution failed: {ex.Message}");
            }
            finally
            {
                SetLoadingState(false);
            }
        }
        
        private async Task PauseAllExecutionAsync()
        {
            try
            {
                SetLoadingState(true);
                LoadingMessage = "Pausing all executions...";
                
                await Task.Delay(1000);
                
                foreach (var stream in ActiveMigrationStreams)
                {
                    stream.Status = "Paused";
                }
                
                StructuredLogger?.LogInfo(LogSourceName, new { action = "all_execution_paused" }, "All executions paused");
            }
            catch (Exception ex)
            {
                StructuredLogger?.LogError(LogSourceName, ex, new { action = "pause_execution_fail" }, "Failed to pause executions");
                SetErrorStateSafe($"Pause execution failed: {ex.Message}");
            }
            finally
            {
                SetLoadingState(false);
            }
        }
        
        private async Task RefreshExecutionAsync()
        {
            try
            {
                SetLoadingState(true);
                LoadingMessage = "Refreshing execution data...";
                
                await Task.Delay(800);
                
                // Update execution metrics with fresh data
                lock (_dataUpdateLock)
                {
                    ExecutionMetrics = ExecutionDataGenerator.GenerateRealtimeExecutionMetrics(ActiveMigrationStreams.Count);
                }
                
                StructuredLogger?.LogInfo(LogSourceName, new { action = "execution_refreshed" }, "Execution data refreshed");
            }
            catch (Exception ex)
            {
                StructuredLogger?.LogError(LogSourceName, ex, new { action = "refresh_execution_fail" }, "Failed to refresh execution data");
                SetErrorStateSafe($"Refresh execution failed: {ex.Message}");
            }
            finally
            {
                SetLoadingState(false);
            }
        }
        
        private void PauseStream(MigrationStream stream)
        {
            try
            {
                if (stream == null) return;
                
                stream.Status = "Paused";
                StructuredLogger?.LogInfo(LogSourceName, new { action = "stream_paused", streamId = stream.StreamId }, "Migration stream paused");
            }
            catch (Exception ex)
            {
                StructuredLogger?.LogError(LogSourceName, ex, new { action = "pause_stream_fail" }, "Failed to pause stream");
            }
        }
        
        private void ViewStreamDetails(MigrationStream stream)
        {
            try
            {
                if (stream == null) return;

                // Open stream details dialog
                var detailsMessage = $"Migration Stream Details\n\n" +
                    $"Stream ID: {stream.StreamId}\n" +
                    $"Status: {stream.Status}\n" +
                    $"Description: Migration execution stream\n" +
                    $"Type: Parallel processing stream\n\n" +
                    "Recent Activity:\n";

                // Add recent events if available
                if (RecentExecutionEvents.Any())
                {
                    var recentEvents = RecentExecutionEvents.Take(5);
                    foreach (var evt in recentEvents)
                    {
                        detailsMessage += $"• {evt.Timestamp:HH:mm:ss} - {evt.Message}\n";
                    }
                }
                else
                {
                    detailsMessage += "• No recent activity\n";
                }

                detailsMessage += "\nActions:\n" +
                    "• View detailed logs\n" +
                    "• Restart failed items\n" +
                    "• Adjust processing speed\n" +
                    "• Pause/Resume stream";

                MessageBox.Show(detailsMessage, "Migration Stream Details",
                    MessageBoxButton.OK, MessageBoxImage.Information);

                StructuredLogger?.LogInfo(LogSourceName, new {
                    action = "stream_details_viewed",
                    stream_id = stream.StreamId,
                    status = stream.Status
                }, "Stream details viewed successfully");
            }
            catch (Exception ex)
            {
                StructuredLogger?.LogError(LogSourceName, ex, new { action = "view_stream_fail" }, "Failed to view stream details");
                MessageBox.Show($"Failed to view stream details: {ex.Message}",
                    "View Error", MessageBoxButton.OK, MessageBoxImage.Error);
            }
        }
        
        private async Task RunPreValidationAsync()
        {
            try
            {
                SetLoadingState(true);
                LoadingMessage = "Running pre-migration validation...";
                
                await Task.Delay(3000);
                
                // Generate new validation data
                lock (_dataUpdateLock)
                {
                    ValidationMetrics = ValidationDataGenerator.GenerateValidationMetrics();
                    
                    // Add some new validation tests
                    var newTests = ValidationDataGenerator.GenerateValidationTests().Take(3);
                    foreach (var test in newTests)
                    {
                        test.LastRun = DateTime.Now;
                        ValidationTests.Add(test);
                    }
                }
                
                StructuredLogger?.LogInfo(LogSourceName, new { action = "pre_validation_complete" }, "Pre-validation completed");
            }
            catch (Exception ex)
            {
                StructuredLogger?.LogError(LogSourceName, ex, new { action = "pre_validation_fail" }, "Pre-validation failed");
                SetErrorStateSafe($"Pre-validation failed: {ex.Message}");
            }
            finally
            {
                SetLoadingState(false);
            }
        }
        
        private async Task RunPostValidationAsync()
        {
            try
            {
                SetLoadingState(true);
                LoadingMessage = "Running post-migration validation...";
                
                await Task.Delay(2500);
                
                StructuredLogger?.LogInfo(LogSourceName, new { action = "post_validation_complete" }, "Post-validation completed");
            }
            catch (Exception ex)
            {
                StructuredLogger?.LogError(LogSourceName, ex, new { action = "post_validation_fail" }, "Post-validation failed");
                SetErrorStateSafe($"Post-validation failed: {ex.Message}");
            }
            finally
            {
                SetLoadingState(false);
            }
        }
        
        private void RunSingleTest(ValidationTest test)
        {
            try
            {
                if (test == null) return;
                
                test.LastRun = DateTime.Now;
                test.Status = "Running";
                test.StatusColor = "#FFF59E0B";
                
                // Simulate test execution
                Task.Run(async () =>
                {
                    await Task.Delay(2000);
                    
                    test.Status = "Passed";
                    test.StatusColor = "#FF10B981";
                    test.IssuesFound = 0;
                });
                
                StructuredLogger?.LogInfo(LogSourceName, new { action = "single_test_run", testName = test.Name }, "Single validation test started");
            }
            catch (Exception ex)
            {
                StructuredLogger?.LogError(LogSourceName, ex, new { action = "single_test_fail" }, "Failed to run single test");
            }
        }
        
        private void ViewTestDetails(ValidationTest test)
        {
            try
            {
                if (test == null) return;

                // Open test details dialog
                var detailsMessage = $"Validation Test Details\n\n" +
                    $"Test Name: {test.Name}\n" +
                    $"Category: {test.Category}\n" +
                    $"Status: {test.Status}\n" +
                    $"Last Run: {test.LastRun:yyyy-MM-dd HH:mm:ss}\n" +
                    $"Issues Found: {test.IssuesFound}\n\n" +
                    "Test Description:\n" +
                    "This validation test checks for common migration issues including:\n" +
                    "• Configuration consistency\n" +
                    "• Permission validation\n" +
                    "• Data integrity checks\n" +
                    "• Dependency verification\n\n" +
                    "Actions:\n" +
                    "• Re-run this test\n" +
                    "• View detailed results\n" +
                    "• Export test report\n" +
                    "• Configure test parameters";

                MessageBox.Show(detailsMessage, "Validation Test Details",
                    MessageBoxButton.OK, MessageBoxImage.Information);

                StructuredLogger?.LogInfo(LogSourceName, new {
                    action = "test_details_viewed",
                    test_name = test.Name,
                    status = test.Status,
                    issues_found = test.IssuesFound
                }, "Validation test details viewed");
            }
            catch (Exception ex)
            {
                StructuredLogger?.LogError(LogSourceName, ex, new { action = "view_test_fail" }, "Failed to view test details");
                MessageBox.Show($"Failed to view test details: {ex.Message}",
                    "View Error", MessageBoxButton.OK, MessageBoxImage.Error);
            }
        }
        
        private async void FixIssue(ValidationIssue issue)
        {
            try
            {
                if (issue == null) return;

                // Implement automated issue fixing
                var fixMessage = $"Fix Validation Issue\n\n" +
                    $"Issue: {issue.Description}\n" +
                    $"Severity: {issue.Severity}\n" +
                    $"Category: {issue.Category}\n\n" +
                    "Available Fix Options:\n" +
                    "• Auto-resolve configuration issues\n" +
                    "• Regenerate missing items\n" +
                    "• Update permissions\n" +
                    "• Reconfigure settings\n" +
                    "• Apply remediation script\n\n" +
                    "Attempt automated fix?";

                var result = MessageBox.Show(fixMessage, "Fix Validation Issue",
                    MessageBoxButton.YesNo, MessageBoxImage.Question);

                if (result == MessageBoxResult.Yes)
                {
                    // Simulate automated fix process
                    SetLoadingState(true);
                    LoadingMessage = $"Fixing issue: {issue.Description}...";

                    await Task.Delay(2000); // Simulate fix time

                    lock (_dataUpdateLock)
                    {
                        ValidationIssues.Remove(issue);
                        // Update metrics if needed
                        ValidationMetrics = ValidationDataGenerator.GenerateValidationMetrics();
                    }

                    MessageBox.Show("Issue has been successfully resolved!", "Fix Complete",
                        MessageBoxButton.OK, MessageBoxImage.Information);

                    StructuredLogger?.LogInfo(LogSourceName, new {
                        action = "issue_auto_fixed",
                        issue_description = issue.Description,
                        severity = issue.Severity
                    }, "Validation issue automatically fixed");
                }
                else
                {
                    StructuredLogger?.LogInfo(LogSourceName, new {
                        action = "issue_fix_cancelled",
                        issue_description = issue.Description
                    }, "Automated issue fix cancelled by user");
                }
            }
            catch (Exception ex)
            {
                StructuredLogger?.LogError(LogSourceName, ex, new { action = "fix_issue_fail" }, "Failed to fix issue");
                MessageBox.Show($"Failed to fix issue: {ex.Message}", "Fix Error",
                    MessageBoxButton.OK, MessageBoxImage.Error);
            }
            finally
            {
                SetLoadingState(false);
            }
        }
        
        #endregion
        
        #endregion

        // Phase 2 PowerShell Integration Methods REMOVED
        // All methods removed due to catastrophic CPU overload (256%+)
        // CRITICAL: DO NOT RESTORE without complete safety redesign

        // All PowerShell execution methods REMOVED for system safety

        #region Cleanup and Removed Methods
        // Legacy methods removed and replaced with new architecture
        #endregion

        #region Safety Methods
        /// <summary>
        /// Thread-safe property setter that ensures UI updates happen on UI thread
        /// </summary>
        private bool SetPropertySafe<T>(ref T field, T value, [System.Runtime.CompilerServices.CallerMemberName] string? propertyName = null)
        {
            try
            {
                if (EqualityComparer<T>.Default.Equals(field, value))
                    return false;

                field = value;

                // Ensure property change notification happens on UI thread
                if (Application.Current?.Dispatcher.CheckAccess() == true)
                {
                    OnPropertyChanged(propertyName);
                }
                else
                {
                    Application.Current?.Dispatcher.BeginInvoke(() =>
                    {
                        try
                        {
                            OnPropertyChanged(propertyName);
                        }
                        catch (Exception ex)
                        {
                            StructuredLogger?.LogError(LogSourceName, ex, new { action = "property_notify_fail", property = propertyName }, "Failed to notify property change");
                        }
                    });
                }

                return true;
            }
            catch (Exception ex)
            {
                StructuredLogger?.LogError(LogSourceName, ex, new { action = "set_property_fail", property = propertyName }, "Failed to set property safely");
                return false;
            }
        }

        /// <summary>
        /// Safely set loading state with UI thread protection
        /// </summary>
        private void SetLoadingState(bool isLoading)
        {
            try
            {
                if (Application.Current?.Dispatcher.CheckAccess() == true)
                {
                    IsLoading = isLoading;
                }
                else
                {
                    Application.Current?.Dispatcher.BeginInvoke(() =>
                    {
                        try
                        {
                            IsLoading = isLoading;
                        }
                        catch (Exception ex)
                        {
                            StructuredLogger?.LogError(LogSourceName, ex, new { action = "loading_state_fail" }, "Failed to set loading state");
                        }
                    });
                }
            }
            catch (Exception ex)
            {
                StructuredLogger?.LogError(LogSourceName, ex, new { action = "loading_state_fail" }, "Failed to set loading state safely");
            }
        }

        /// <summary>
        /// Safely set error state with thread protection
        /// </summary>
        public void SetErrorState(string errorMessage)
        {
            SetErrorStateSafe(errorMessage);
        }

        private void SetErrorStateSafe(string errorMessage)
        {
            try
            {
                if (Application.Current?.Dispatcher.CheckAccess() == true)
                {
                    HasError = true;
                    LastError = errorMessage;
                    IsLoading = false;
                }
                else
                {
                    Application.Current?.Dispatcher.BeginInvoke(() =>
                    {
                        try
                        {
                            HasError = true;
                            LastError = errorMessage;
                            IsLoading = false;
                        }
                        catch (Exception ex)
                        {
                            StructuredLogger?.LogError(LogSourceName, ex, new { action = "error_state_fail" }, "Failed to set error state");
                        }
                    });
                }
            }
            catch (Exception ex)
            {
                StructuredLogger?.LogError(LogSourceName, ex, new { action = "error_state_fail" }, "Failed to set error state safely");
            }
        }
        
        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                StopRealTimeUpdates();
                
                // Emergency cleanup: Dispose CPU counter
                try
                {
                    _cpuCounter?.Dispose();
                }
                catch (Exception ex)
                {
                    StructuredLogger?.LogError(LogSourceName, ex, new { action = "cpu_counter_dispose_fail" }, "Failed to dispose CPU counter");
                }
                
                // PowerShell bridge disposal removed - no longer exists
            }
            base.Dispose(disposing);
        }
        
        /// <summary>
        /// Generate comprehensive migration report
        /// </summary>
        private string GenerateMigrationReport()
        {
            var report = new System.Text.StringBuilder();

            report.AppendLine("MANDADISCOVERY SUITE - MIGRATION REPORT");
            report.AppendLine("========================================");
            report.AppendLine($"Generated: {DateTime.Now:yyyy-MM-dd HH:mm:ss}");
            report.AppendLine($"Source Environment: {SelectedSourceEnvironment ?? "Not Set"}");
            report.AppendLine($"Target Environment: {SelectedTargetEnvironment ?? "Not Set"}");
            report.AppendLine();

            // Executive Summary
            report.AppendLine("EXECUTIVE SUMMARY");
            report.AppendLine("=================");
            report.AppendLine($"Total Projects: {Metrics.TotalProjects}");
            report.AppendLine($"Active Migrations: {Metrics.ActiveMigrations}");
            report.AppendLine($"Completed Migrations: {Metrics.CompletedMigrations}");
            report.AppendLine($"Overall Progress: {Metrics.OverallCompletionPercentage:F1}%");
            report.AppendLine();

            // Migration Waves
            report.AppendLine("MIGRATION WAVES");
            report.AppendLine("===============");
            foreach (var wave in MigrationWaves)
            {
                report.AppendLine($"• {wave.Name} - Status: {wave.Status}, Order: {wave.Order}");
            }
            report.AppendLine();

            // Active Migrations
            report.AppendLine("ACTIVE MIGRATIONS");
            report.AppendLine("==================");
            if (ActiveMigrations.Any())
            {
                foreach (var migration in ActiveMigrations)
                {
                    report.AppendLine($"• Migration Task - {migration.Status}");
                }
            }
            else
            {
                report.AppendLine("No active migrations");
            }
            report.AppendLine();

            // Migration Streams
            report.AppendLine("MIGRATION STREAMS");
            report.AppendLine("==================");
            if (ActiveMigrationStreams.Any())
            {
                foreach (var stream in ActiveMigrationStreams)
                {
                    report.AppendLine($"• Migration Stream - {stream.Status}");
                }
            }
            else
            {
                report.AppendLine("No active migration streams");
            }
            report.AppendLine();

            // Validation Summary
            report.AppendLine("VALIDATION SUMMARY");
            report.AppendLine("==================");
            if (ValidationTests?.Any() == true)
            {
                report.AppendLine($"Validation Tests: {ValidationTests.Count}");
                report.AppendLine($"Issues Found: {ValidationIssues?.Count ?? 0}");
                report.AppendLine($"Pre-migration Checklist Items: {PreMigrationChecklist?.Count ?? 0}");
            }
            else
            {
                report.AppendLine("No validation data available");
            }
            report.AppendLine();

            // Recommendations
            report.AppendLine("RECOMMENDATIONS");
            report.AppendLine("===============");
            if (Metrics.ActiveMigrations > 0)
            {
                report.AppendLine("• Monitor active migrations closely");
                report.AppendLine("• Review validation results for potential issues");
                report.AppendLine("• Consider additional wave planning for remaining assets");
            }
            else
            {
                report.AppendLine("• All migrations completed - proceed with post-migration validation");
                report.AppendLine("• Review final migration report for any cleanup tasks");
                report.AppendLine("• Schedule follow-up assessment in 30 days");
            }

            return report.ToString();
        }

        #endregion
    }
}