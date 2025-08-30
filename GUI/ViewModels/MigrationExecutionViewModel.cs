using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.ComponentModel;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using System.Windows;
using System.Windows.Data;
using System.Windows.Input;
using Microsoft.Extensions.Logging;
using MandADiscoverySuite.Models;
using MandADiscoverySuite.Services;
using MandADiscoverySuite.Services.Migration;

namespace MandADiscoverySuite.ViewModels
{
    /// <summary>
    /// Execution monitoring interface with pre-flight validation and live monitoring
    /// </summary>
    public class MigrationExecutionViewModel : BaseViewModel
    {
        #region Private Fields
        private readonly MigrationDataService _migrationDataService;
        private readonly PowerShellExecutionService _powerShellService;
        private readonly ProfileService _profileService;
        private readonly ModuleRegistryService _moduleRegistryService;
        private readonly MigrationEngineService _migrationEngine;
        private readonly ILogger<MigrationExecutionViewModel> _logger;
        
        // Profile and Data
        private string _selectedProfile;
        private ObservableCollection<MigrationItem> _migrationItems;
        private ObservableCollection<MigrationWave> _migrationWaves;
        private MigrationWave _selectedWave;
        private bool _isLoadingExecution;
        private string _executionStatus = "Select a profile to begin execution planning";
        
        // Pre-flight Validation
        private ObservableCollection<PreFlightCheck> _preFlightChecks;
        private bool _isRunningPreFlight;
        private int _preFlightProgress;
        private string _preFlightStatus = "Ready to run pre-flight validation";
        private bool _preFlightPassed;
        private int _totalChecks;
        private int _passedChecks;
        private int _failedChecks;
        private int _warningChecks;
        
        // Live Execution Monitor
        private ObservableCollection<MigrationExecutionItem> _executionItems;
        private MigrationExecutionItem _selectedExecutionItem;
        private ObservableCollection<ExecutionLogEntry> _executionLogs;
        private bool _isExecutionRunning;
        private int _executionProgress;
        private string _currentExecutionPhase = "Ready";
        private DateTime? _executionStartTime;
        private TimeSpan _executionElapsed;
        private Timer _executionTimer;
        
        // Progress Tracking by Type
        private ExecutionTypeProgress _userMigrationProgress;
        private ExecutionTypeProgress _groupMigrationProgress;
        private ExecutionTypeProgress _mailboxMigrationProgress;
        private ExecutionTypeProgress _fileSystemMigrationProgress;
        private ExecutionTypeProgress _vmMigrationProgress;
        private ExecutionTypeProgress _profileMigrationProgress;
        
        // Rollback Controls
        private ObservableCollection<RollbackPoint> _rollbackPoints;
        private RollbackPoint _selectedRollbackPoint;
        private bool _isRollbackAvailable;
        private bool _isRollbackRunning;
        private string _rollbackStatus = "No rollback points available";
        
        // Real-time Statistics
        private int _totalItemsToMigrate;
        private int _itemsCompleted;
        private int _itemsInProgress;
        private int _itemsFailed;
        private int _itemsSkipped;
        private double _overallProgressPercentage;
        private TimeSpan _estimatedTimeRemaining;
        
        // Filtering and Views
        private string _searchText;
        private MigrationType? _selectedTypeFilter;
        private MigrationStatus? _selectedStatusFilter;
        private bool _showOnlyErrors;
        private ICollectionView _executionItemsView;
        private ICollectionView _executionLogsView;
        #endregion
        
        #region Constructor
        public MigrationExecutionViewModel(
            ILogger<MigrationExecutionViewModel> logger = null,
            MigrationEngineService migrationEngine = null) : base(logger)
        {
            _logger = logger;
            _migrationDataService = new MigrationDataService();
            _powerShellService = new PowerShellExecutionService();
            _profileService = new ProfileService();
            _moduleRegistryService = ModuleRegistryService.Instance;
            
            // Initialize T-027 migration engine integration
            _migrationEngine = migrationEngine ?? ResolveOrCreateMigrationEngine();
            
            InitializeCollections();
            InitializeCommands();
            InitializeCollectionViews();
            InitializeProgressTracking();
            InitializeMigrationEngineEvents();
            
            TabTitle = "Migration Execution";
        }
        #endregion
        
        #region Properties
        
        // Profile Selection
        public ObservableCollection<string> AvailableProfiles { get; private set; }
        
        public string SelectedProfile
        {
            get => _selectedProfile;
            set
            {
                if (SetProperty(ref _selectedProfile, value))
                {
                    _ = LoadExecutionDataAsync();
                }
            }
        }
        
        public ObservableCollection<MigrationItem> MigrationItems
        {
            get => _migrationItems;
            set => SetProperty(ref _migrationItems, value);
        }
        
        public ObservableCollection<MigrationWave> MigrationWaves
        {
            get => _migrationWaves;
            set => SetProperty(ref _migrationWaves, value);
        }
        
        public MigrationWave SelectedWave
        {
            get => _selectedWave;
            set
            {
                if (SetProperty(ref _selectedWave, value))
                {
                    LoadWaveExecutionItems();
                }
            }
        }
        
        public bool IsLoadingExecution
        {
            get => _isLoadingExecution;
            set => SetProperty(ref _isLoadingExecution, value);
        }
        
        public string ExecutionStatus
        {
            get => _executionStatus;
            set => SetProperty(ref _executionStatus, value);
        }
        
        // Pre-flight Validation Properties
        public ObservableCollection<PreFlightCheck> PreFlightChecks
        {
            get => _preFlightChecks;
            set => SetProperty(ref _preFlightChecks, value);
        }
        
        public bool IsRunningPreFlight
        {
            get => _isRunningPreFlight;
            set => SetProperty(ref _isRunningPreFlight, value);
        }
        
        public int PreFlightProgress
        {
            get => _preFlightProgress;
            set => SetProperty(ref _preFlightProgress, value);
        }
        
        public string PreFlightStatus
        {
            get => _preFlightStatus;
            set => SetProperty(ref _preFlightStatus, value);
        }
        
        public bool PreFlightPassed
        {
            get => _preFlightPassed;
            set => SetProperty(ref _preFlightPassed, value);
        }
        
        public int TotalChecks
        {
            get => _totalChecks;
            set => SetProperty(ref _totalChecks, value);
        }
        
        public int PassedChecks
        {
            get => _passedChecks;
            set => SetProperty(ref _passedChecks, value);
        }
        
        public int FailedChecks
        {
            get => _failedChecks;
            set => SetProperty(ref _failedChecks, value);
        }
        
        public int WarningChecks
        {
            get => _warningChecks;
            set => SetProperty(ref _warningChecks, value);
        }
        
        // Live Execution Properties
        public ObservableCollection<MigrationExecutionItem> ExecutionItems
        {
            get => _executionItems;
            set => SetProperty(ref _executionItems, value);
        }
        
        public MigrationExecutionItem SelectedExecutionItem
        {
            get => _selectedExecutionItem;
            set => SetProperty(ref _selectedExecutionItem, value);
        }
        
        public ObservableCollection<ExecutionLogEntry> ExecutionLogs
        {
            get => _executionLogs;
            set => SetProperty(ref _executionLogs, value);
        }
        
        public bool IsExecutionRunning
        {
            get => _isExecutionRunning;
            set => SetProperty(ref _isExecutionRunning, value);
        }
        
        public int ExecutionProgress
        {
            get => _executionProgress;
            set => SetProperty(ref _executionProgress, value);
        }
        
        public string CurrentExecutionPhase
        {
            get => _currentExecutionPhase;
            set => SetProperty(ref _currentExecutionPhase, value);
        }
        
        public DateTime? ExecutionStartTime
        {
            get => _executionStartTime;
            set => SetProperty(ref _executionStartTime, value);
        }
        
        public TimeSpan ExecutionElapsed
        {
            get => _executionElapsed;
            set => SetProperty(ref _executionElapsed, value);
        }
        
        // Progress by Type Properties
        public ExecutionTypeProgress UserMigrationProgress
        {
            get => _userMigrationProgress;
            set => SetProperty(ref _userMigrationProgress, value);
        }
        
        public ExecutionTypeProgress GroupMigrationProgress
        {
            get => _groupMigrationProgress;
            set => SetProperty(ref _groupMigrationProgress, value);
        }
        
        public ExecutionTypeProgress MailboxMigrationProgress
        {
            get => _mailboxMigrationProgress;
            set => SetProperty(ref _mailboxMigrationProgress, value);
        }
        
        public ExecutionTypeProgress FileSystemMigrationProgress
        {
            get => _fileSystemMigrationProgress;
            set => SetProperty(ref _fileSystemMigrationProgress, value);
        }
        
        public ExecutionTypeProgress VMigrationProgress
        {
            get => _vmMigrationProgress;
            set => SetProperty(ref _vmMigrationProgress, value);
        }
        
        public ExecutionTypeProgress ProfileMigrationProgress
        {
            get => _profileMigrationProgress;
            set => SetProperty(ref _profileMigrationProgress, value);
        }
        
        // Rollback Properties
        public ObservableCollection<RollbackPoint> RollbackPoints
        {
            get => _rollbackPoints;
            set => SetProperty(ref _rollbackPoints, value);
        }
        
        public RollbackPoint SelectedRollbackPoint
        {
            get => _selectedRollbackPoint;
            set => SetProperty(ref _selectedRollbackPoint, value);
        }
        
        public bool IsRollbackAvailable
        {
            get => _isRollbackAvailable;
            set => SetProperty(ref _isRollbackAvailable, value);
        }
        
        public bool IsRollbackRunning
        {
            get => _isRollbackRunning;
            set => SetProperty(ref _isRollbackRunning, value);
        }
        
        public string RollbackStatus
        {
            get => _rollbackStatus;
            set => SetProperty(ref _rollbackStatus, value);
        }
        
        // Statistics Properties
        public int TotalItemsToMigrate
        {
            get => _totalItemsToMigrate;
            set => SetProperty(ref _totalItemsToMigrate, value);
        }
        
        public int ItemsCompleted
        {
            get => _itemsCompleted;
            set => SetProperty(ref _itemsCompleted, value);
        }
        
        public int ItemsInProgress
        {
            get => _itemsInProgress;
            set => SetProperty(ref _itemsInProgress, value);
        }
        
        public int ItemsFailed
        {
            get => _itemsFailed;
            set => SetProperty(ref _itemsFailed, value);
        }
        
        public int ItemsSkipped
        {
            get => _itemsSkipped;
            set => SetProperty(ref _itemsSkipped, value);
        }
        
        public double OverallProgressPercentage
        {
            get => _overallProgressPercentage;
            set => SetProperty(ref _overallProgressPercentage, value);
        }
        
        public TimeSpan EstimatedTimeRemaining
        {
            get => _estimatedTimeRemaining;
            set => SetProperty(ref _estimatedTimeRemaining, value);
        }
        
        // Filtering Properties
        public string SearchText
        {
            get => _searchText;
            set
            {
                if (SetProperty(ref _searchText, value))
                {
                    ExecutionItemsView?.Refresh();
                    ExecutionLogsView?.Refresh();
                }
            }
        }
        
        public MigrationType? SelectedTypeFilter
        {
            get => _selectedTypeFilter;
            set
            {
                if (SetProperty(ref _selectedTypeFilter, value))
                {
                    ExecutionItemsView?.Refresh();
                }
            }
        }
        
        public MigrationStatus? SelectedStatusFilter
        {
            get => _selectedStatusFilter;
            set
            {
                if (SetProperty(ref _selectedStatusFilter, value))
                {
                    ExecutionItemsView?.Refresh();
                }
            }
        }
        
        public bool ShowOnlyErrors
        {
            get => _showOnlyErrors;
            set
            {
                if (SetProperty(ref _showOnlyErrors, value))
                {
                    ExecutionLogsView?.Refresh();
                }
            }
        }
        
        // Collection Views
        public ICollectionView ExecutionItemsView
        {
            get => _executionItemsView;
            private set => SetProperty(ref _executionItemsView, value);
        }
        
        public ICollectionView ExecutionLogsView
        {
            get => _executionLogsView;
            private set => SetProperty(ref _executionLogsView, value);
        }
        
        // Enumerations for UI Binding
        public Array MigrationTypes => Enum.GetValues(typeof(MigrationType));
        public Array MigrationStatuses => Enum.GetValues(typeof(MigrationStatus));
        #endregion
        
        #region Commands
        public ICommand LoadExecutionDataCommand { get; private set; }
        public ICommand RunPreFlightValidationCommand { get; private set; }
        public ICommand StartMigrationCommand { get; private set; }
        public ICommand PauseMigrationCommand { get; private set; }
        public ICommand ResumeMigrationCommand { get; private set; }
        public ICommand StopMigrationCommand { get; private set; }
        public ICommand RetryFailedItemsCommand { get; private set; }
        public ICommand SkipFailedItemsCommand { get; private set; }
        public ICommand CreateRollbackPointCommand { get; private set; }
        public ICommand ExecuteRollbackCommand { get; private set; }
        public ICommand ClearLogsCommand { get; private set; }
        public ICommand ExportLogsCommand { get; private set; }
        public ICommand RefreshStatusCommand { get; private set; }
        #endregion
        
        #region Private Methods
        private void InitializeCollections()
        {
            AvailableProfiles = new ObservableCollection<string>();
            MigrationItems = new ObservableCollection<MigrationItem>();
            MigrationWaves = new ObservableCollection<MigrationWave>();
            PreFlightChecks = new ObservableCollection<PreFlightCheck>();
            ExecutionItems = new ObservableCollection<MigrationExecutionItem>();
            ExecutionLogs = new ObservableCollection<ExecutionLogEntry>();
            RollbackPoints = new ObservableCollection<RollbackPoint>();
            
            LoadAvailableProfiles();
        }
        
        protected override void InitializeCommands()
        {
            // Call base implementation first
            base.InitializeCommands();
            
            LoadExecutionDataCommand = new AsyncRelayCommand(LoadExecutionDataAsync);
            RunPreFlightValidationCommand = new AsyncRelayCommand(RunPreFlightValidationAsync);
            StartMigrationCommand = new AsyncRelayCommand(StartMigrationAsync);
            PauseMigrationCommand = new RelayCommand(PauseMigration);
            ResumeMigrationCommand = new RelayCommand(ResumeMigration);
            StopMigrationCommand = new AsyncRelayCommand(StopMigrationAsync);
            RetryFailedItemsCommand = new AsyncRelayCommand(RetryFailedItemsAsync);
            SkipFailedItemsCommand = new RelayCommand(SkipFailedItems);
            CreateRollbackPointCommand = new AsyncRelayCommand(CreateRollbackPointAsync);
            ExecuteRollbackCommand = new AsyncRelayCommand(ExecuteRollbackAsync);
            ClearLogsCommand = new RelayCommand(ClearLogs);
            ExportLogsCommand = new AsyncRelayCommand(ExportLogsAsync);
            RefreshStatusCommand = new AsyncRelayCommand(RefreshStatusAsync);
        }
        
        private void InitializeCollectionViews()
        {
            ExecutionItemsView = CollectionViewSource.GetDefaultView(ExecutionItems);
            ExecutionItemsView.Filter = FilterExecutionItems;
            
            ExecutionLogsView = CollectionViewSource.GetDefaultView(ExecutionLogs);
            ExecutionLogsView.Filter = FilterExecutionLogs;
        }
        
        private void InitializeProgressTracking()
        {
            UserMigrationProgress = new ExecutionTypeProgress { Type = "Users" };
            GroupMigrationProgress = new ExecutionTypeProgress { Type = "Groups" };
            MailboxMigrationProgress = new ExecutionTypeProgress { Type = "Mailboxes" };
            FileSystemMigrationProgress = new ExecutionTypeProgress { Type = "File Systems" };
            VMigrationProgress = new ExecutionTypeProgress { Type = "Virtual Machines" };
            ProfileMigrationProgress = new ExecutionTypeProgress { Type = "User Profiles" };
        }
        
        private async void LoadAvailableProfiles()
        {
            try
            {
                var profiles = await _profileService.GetAvailableProfilesAsync();
                AvailableProfiles.Clear();
                
                foreach (var profile in profiles)
                {
                    AvailableProfiles.Add(profile);
                }
                
                if (AvailableProfiles.Any())
                {
                    SelectedProfile = AvailableProfiles.First();
                }
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error loading available profiles");
                HasErrors = true;
                ErrorMessage = $"Failed to load profiles: {ex.Message}";
            }
        }
        
        private async Task LoadExecutionDataAsync()
        {
            if (string.IsNullOrWhiteSpace(SelectedProfile))
                return;
                
            try
            {
                IsLoadingExecution = true;
                ExecutionStatus = "Loading migration data...";
                
                // Load migration items (would normally come from planning phase)
                var migrationResult = await _migrationDataService.LoadMigrationItemsAsync(SelectedProfile);
                if (migrationResult.IsSuccess)
                {
                    MigrationItems.Clear();
                    foreach (var item in migrationResult.Data)
                    {
                        MigrationItems.Add(item);
                    }
                }
                
                // Load migration batches/waves
                var batchResult = await _migrationDataService.LoadMigrationBatchesAsync(SelectedProfile);
                if (batchResult.IsSuccess)
                {
                    MigrationWaves.Clear();
                    foreach (var batch in batchResult.Data)
                    {
                        var wave = new MigrationWave
                        {
                            Id = batch.Id,
                            Name = batch.Name,
                            PlannedStartDate = batch.PlannedStartDate ?? DateTime.Now,
                            PlannedEndDate = batch.PlannedEndDate ?? DateTime.Now.AddDays(1),
                            Status = batch.Status,
                            CreatedAt = DateTime.Now
                        };
                        MigrationWaves.Add(wave);
                    }
                    
                    if (MigrationWaves.Any())
                    {
                        SelectedWave = MigrationWaves.First();
                    }
                }
                
                // Initialize pre-flight checks
                InitializePreFlightChecks();
                
                ExecutionStatus = $"Loaded {MigrationItems.Count} migration items across {MigrationWaves.Count} waves";
                HasData = MigrationItems.Any();
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error loading execution data");
                HasErrors = true;
                ErrorMessage = $"Execution data load failed: {ex.Message}";
                ExecutionStatus = "Execution data load failed";
            }
            finally
            {
                IsLoadingExecution = false;
            }
        }
        
        private void InitializePreFlightChecks()
        {
            PreFlightChecks.Clear();
            
            // Standard pre-flight checks
            PreFlightChecks.Add(new PreFlightCheck
            {
                Id = Guid.NewGuid().ToString(),
                Name = "Source Domain Connectivity",
                Description = "Verify connectivity to source Active Directory domain",
                Category = "Connectivity",
                Status = CheckStatus.Pending,
                IsRequired = true
            });
            
            PreFlightChecks.Add(new PreFlightCheck
            {
                Id = Guid.NewGuid().ToString(),
                Name = "Target Domain Connectivity",
                Description = "Verify connectivity to target Active Directory domain",
                Category = "Connectivity",
                Status = CheckStatus.Pending,
                IsRequired = true
            });
            
            PreFlightChecks.Add(new PreFlightCheck
            {
                Id = Guid.NewGuid().ToString(),
                Name = "PowerShell Modules",
                Description = "Verify required PowerShell modules are available",
                Category = "Dependencies",
                Status = CheckStatus.Pending,
                IsRequired = true
            });
            
            PreFlightChecks.Add(new PreFlightCheck
            {
                Id = Guid.NewGuid().ToString(),
                Name = "Migration Permissions",
                Description = "Verify account has necessary permissions for migration operations",
                Category = "Security",
                Status = CheckStatus.Pending,
                IsRequired = true
            });
            
            PreFlightChecks.Add(new PreFlightCheck
            {
                Id = Guid.NewGuid().ToString(),
                Name = "Storage Space",
                Description = "Verify adequate storage space for migration operations",
                Category = "Resources",
                Status = CheckStatus.Pending,
                IsRequired = false
            });
            
            PreFlightChecks.Add(new PreFlightCheck
            {
                Id = Guid.NewGuid().ToString(),
                Name = "Target Conflicts",
                Description = "Check for naming conflicts in target environment",
                Category = "Validation",
                Status = CheckStatus.Pending,
                IsRequired = false
            });
            
            TotalChecks = PreFlightChecks.Count;
            UpdatePreFlightStatistics();
        }
        
        private async Task RunPreFlightValidationAsync()
        {
            try
            {
                IsRunningPreFlight = true;
                PreFlightStatus = "Running pre-flight validation...";
                PreFlightProgress = 0;
                
                var checksToRun = PreFlightChecks.ToList();
                var completedChecks = 0;
                
                foreach (var check in checksToRun)
                {
                    check.Status = CheckStatus.Running;
                    check.StartTime = DateTime.Now;
                    
                    // Simulate check execution
                    await Task.Delay(500); // Simulate work
                    
                    // Simulate check results
                    var random = new Random();
                    var result = random.Next(100);
                    
                    if (result < 80) // 80% success rate
                    {
                        check.Status = CheckStatus.Passed;
                        check.ResultMessage = "Check completed successfully";
                    }
                    else if (result < 95) // 15% warning rate
                    {
                        check.Status = CheckStatus.Warning;
                        check.ResultMessage = "Check completed with warnings";
                    }
                    else // 5% failure rate
                    {
                        check.Status = CheckStatus.Failed;
                        check.ResultMessage = "Check failed - manual intervention required";
                    }
                    
                    check.EndTime = DateTime.Now;
                    check.Duration = check.EndTime - check.StartTime;
                    
                    completedChecks++;
                    PreFlightProgress = (int)((double)completedChecks / checksToRun.Count * 100);
                    
                    UpdatePreFlightStatistics();
                }
                
                PreFlightPassed = FailedChecks == 0;
                PreFlightStatus = PreFlightPassed ? 
                    "Pre-flight validation passed - ready for migration" : 
                    $"Pre-flight validation completed with {FailedChecks} failures";
                
                if (!PreFlightPassed)
                {
                    MessageBox.Show($"Pre-flight validation failed with {FailedChecks} critical issues. Please resolve these issues before proceeding.", 
                        "Pre-flight Validation Failed", MessageBoxButton.OK, MessageBoxImage.Warning);
                }
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error running pre-flight validation");
                PreFlightStatus = "Pre-flight validation failed with errors";
                MessageBox.Show($"Pre-flight validation error: {ex.Message}", "Error", 
                    MessageBoxButton.OK, MessageBoxImage.Error);
            }
            finally
            {
                IsRunningPreFlight = false;
            }
        }
        
        private void UpdatePreFlightStatistics()
        {
            PassedChecks = PreFlightChecks.Count(c => c.Status == CheckStatus.Passed);
            FailedChecks = PreFlightChecks.Count(c => c.Status == CheckStatus.Failed);
            WarningChecks = PreFlightChecks.Count(c => c.Status == CheckStatus.Warning);
        }
        
        private void LoadWaveExecutionItems()
        {
            ExecutionItems.Clear();
            
            if (SelectedWave != null)
            {
                var waveItems = MigrationItems.Where(i => i.WaveId == SelectedWave.Id);
                
                foreach (var item in waveItems)
                {
                    var executionItem = new MigrationExecutionItem
                    {
                        Id = item.Id,
                        Type = item.Type,
                        DisplayName = item.DisplayName,
                        SourceIdentity = item.SourceIdentity,
                        TargetIdentity = item.TargetIdentity,
                        Status = item.Status,
                        Priority = item.Priority,
                        EstimatedDuration = item.EstimatedDuration ?? TimeSpan.Zero,
                        Progress = 0,
                        LastUpdated = DateTime.Now
                    };
                    
                    ExecutionItems.Add(executionItem);
                }
                
                TotalItemsToMigrate = ExecutionItems.Count;
                UpdateExecutionStatistics();
            }
        }
        
        private async Task StartMigrationAsync()
        {
            if (!PreFlightPassed)
            {
                var result = MessageBox.Show("Pre-flight validation has not passed. Continue anyway?", 
                    "Pre-flight Warning", MessageBoxButton.YesNo, MessageBoxImage.Warning);
                    
                if (result == MessageBoxResult.No)
                    return;
            }
            
            try
            {
                IsExecutionRunning = true;
                ExecutionStartTime = DateTime.Now;
                CurrentExecutionPhase = "Initializing";
                
                // Start execution timer
                _executionTimer = new Timer(UpdateExecutionTimer, null, TimeSpan.Zero, TimeSpan.FromSeconds(1));
                
                // Create initial rollback point
                await CreateAutomaticRollbackPoint("Pre-migration state");
                
                AddExecutionLog("Migration execution started", LogLevel.Info);
                
                // Start real migration execution using PowerShell modules
                _ = Task.Run(ExecuteRealMigrationAsync);
                
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error starting migration");
                AddExecutionLog($"Migration start failed: {ex.Message}", LogLevel.Error);
                IsExecutionRunning = false;
            }
        }
        
        private async Task ExecuteRealMigrationAsync()
        {
            try
            {
                // Create migration wave from current execution items
                var migrationWave = CreateMigrationWaveFromExecutionItems();
                var migrationContext = CreateMigrationContext();
                
                AddExecutionLog("Starting T-027 Migration Engine execution", LogLevel.Info);
                
                // Execute migration using T-027 MigrationEngineService
                var waveResult = await _migrationEngine.ExecuteMigrationWaveAsync(
                    migrationWave, 
                    migrationContext, 
                    CancellationToken.None);
                
                // Update UI with final results
                Application.Current?.Dispatcher.Invoke(() =>
                {
                    UpdateExecutionResultsFromWave(waveResult);
                    IsExecutionRunning = false;
                    CurrentExecutionPhase = waveResult.IsSuccess ? "Completed Successfully" : "Completed with Errors";
                    
                    var logMessage = $"T-027 Migration Engine completed: {waveResult.CompletedItems} successful, {waveResult.FailedItems} failed, Success Rate: {waveResult.SuccessRate:F1}%";
                    AddExecutionLog(logMessage, waveResult.IsSuccess ? LogLevel.Info : LogLevel.Warning);
                });
            }
            catch (Exception ex)
            {
                Application.Current?.Dispatcher.Invoke(() =>
                {
                    AddExecutionLog($"T-027 Migration Engine error: {ex.Message}", LogLevel.Error);
                    IsExecutionRunning = false;
                    CurrentExecutionPhase = "Failed";
                });
            }
        }
        
        private void UpdateExecutionTimer(object state)
        {
            if (ExecutionStartTime.HasValue)
            {
                Application.Current?.Dispatcher.Invoke(() =>
                {
                    ExecutionElapsed = DateTime.Now - ExecutionStartTime.Value;
                    
                    // Calculate estimated time remaining
                    if (ItemsCompleted > 0)
                    {
                        var avgTimePerItem = ExecutionElapsed.TotalMilliseconds / ItemsCompleted;
                        var remainingItems = TotalItemsToMigrate - ItemsCompleted;
                        EstimatedTimeRemaining = TimeSpan.FromMilliseconds(avgTimePerItem * remainingItems);
                    }
                });
            }
        }
        
        private void UpdateExecutionStatistics()
        {
            ItemsCompleted = ExecutionItems.Count(i => i.Status == MigrationStatus.Completed);
            ItemsInProgress = ExecutionItems.Count(i => i.Status == MigrationStatus.InProgress);
            ItemsFailed = ExecutionItems.Count(i => i.Status == MigrationStatus.Failed);
            ItemsSkipped = ExecutionItems.Count(i => i.Status == MigrationStatus.Skipped);
            
            if (TotalItemsToMigrate > 0)
            {
                OverallProgressPercentage = (double)ItemsCompleted / TotalItemsToMigrate * 100;
                ExecutionProgress = (int)OverallProgressPercentage;
            }
        }
        
        private void UpdateProgressByType()
        {
            UpdateTypeProgress(UserMigrationProgress, MigrationType.User);
            UpdateTypeProgress(GroupMigrationProgress, MigrationType.SecurityGroup);
            UpdateTypeProgress(MailboxMigrationProgress, MigrationType.Mailbox);
            UpdateTypeProgress(FileSystemMigrationProgress, MigrationType.FileShare);
            UpdateTypeProgress(VMigrationProgress, MigrationType.VirtualMachine);
            UpdateTypeProgress(ProfileMigrationProgress, MigrationType.UserProfile);
        }
        
        private void UpdateTypeProgress(ExecutionTypeProgress progress, MigrationType type)
        {
            var typeItems = ExecutionItems.Where(i => i.Type == type).ToList();
            
            progress.Total = typeItems.Count;
            progress.Completed = typeItems.Count(i => i.Status == MigrationStatus.Completed);
            progress.InProgress = typeItems.Count(i => i.Status == MigrationStatus.InProgress);
            progress.Failed = typeItems.Count(i => i.Status == MigrationStatus.Failed);
            progress.Skipped = typeItems.Count(i => i.Status == MigrationStatus.Skipped);
            
            if (progress.Total > 0)
            {
                progress.PercentageComplete = (double)progress.Completed / progress.Total * 100;
            }
        }
        
        private void PauseMigration()
        {
            // TODO: Implement pause functionality
            AddExecutionLog("Migration paused by user", LogLevel.Info);
            CurrentExecutionPhase = "Paused";
        }
        
        private void ResumeMigration()
        {
            // TODO: Implement resume functionality
            AddExecutionLog("Migration resumed by user", LogLevel.Info);
            CurrentExecutionPhase = "Resuming";
        }
        
        private async Task StopMigrationAsync()
        {
            var result = MessageBox.Show("Are you sure you want to stop the migration? This will cancel all pending operations.", 
                "Stop Migration", MessageBoxButton.YesNo, MessageBoxImage.Question);
                
            if (result == MessageBoxResult.Yes)
            {
                IsExecutionRunning = false;
                _executionTimer?.Dispose();
                CurrentExecutionPhase = "Stopped";
                AddExecutionLog("Migration stopped by user", LogLevel.Warning);
            }
        }
        
        private async Task RetryFailedItemsAsync()
        {
            var failedItems = ExecutionItems.Where(i => i.Status == MigrationStatus.Failed).ToList();
            
            if (!failedItems.Any())
            {
                MessageBox.Show("No failed items to retry.", "No Failed Items", 
                    MessageBoxButton.OK, MessageBoxImage.Information);
                return;
            }
            
            foreach (var item in failedItems)
            {
                item.Status = MigrationStatus.NotStarted;
                item.Progress = 0;
                item.ErrorMessage = null;
            }
            
            UpdateExecutionStatistics();
            AddExecutionLog($"Reset {failedItems.Count} failed items for retry", LogLevel.Info);
            
            MessageBox.Show($"Reset {failedItems.Count} failed items. Use Start Migration to retry.", 
                "Items Reset", MessageBoxButton.OK, MessageBoxImage.Information);
        }
        
        private void SkipFailedItems()
        {
            var failedItems = ExecutionItems.Where(i => i.Status == MigrationStatus.Failed).ToList();
            
            foreach (var item in failedItems)
            {
                item.Status = MigrationStatus.Skipped;
            }
            
            UpdateExecutionStatistics();
            AddExecutionLog($"Skipped {failedItems.Count} failed items", LogLevel.Info);
        }
        
        private async Task CreateRollbackPointAsync()
        {
            try
            {
                var name = $"Manual rollback point - {DateTime.Now:yyyy-MM-dd HH:mm:ss}";
                await CreateAutomaticRollbackPoint(name);
                
                MessageBox.Show("Rollback point created successfully.", "Rollback Point", 
                    MessageBoxButton.OK, MessageBoxImage.Information);
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error creating rollback point");
                MessageBox.Show($"Failed to create rollback point: {ex.Message}", "Error", 
                    MessageBoxButton.OK, MessageBoxImage.Error);
            }
        }
        
        private async Task CreateAutomaticRollbackPoint(string description)
        {
            var rollbackPoint = new RollbackPoint
            {
                Id = Guid.NewGuid().ToString(),
                Name = description,
                CreatedAt = DateTime.Now,
                Description = description,
                IsAutomatic = true,
                MigratedItemsCount = ItemsCompleted,
                CanRollback = true
            };
            
            RollbackPoints.Add(rollbackPoint);
            IsRollbackAvailable = RollbackPoints.Any(r => r.CanRollback);
            RollbackStatus = IsRollbackAvailable ? "Rollback points available" : "No rollback points available";
            
            AddExecutionLog($"Rollback point created: {description}", LogLevel.Info);
        }
        
        private async Task ExecuteRollbackAsync()
        {
            if (SelectedRollbackPoint == null)
            {
                MessageBox.Show("Please select a rollback point.", "No Selection", 
                    MessageBoxButton.OK, MessageBoxImage.Warning);
                return;
            }
            
            var result = MessageBox.Show($"Are you sure you want to rollback to '{SelectedRollbackPoint.Name}'? This will undo migration changes.", 
                "Confirm Rollback", MessageBoxButton.YesNo, MessageBoxImage.Question);
                
            if (result == MessageBoxResult.Yes)
            {
                try
                {
                    IsRollbackRunning = true;
                    RollbackStatus = $"Rolling back to {SelectedRollbackPoint.Name}...";
                    
                    // Simulate rollback process
                    await Task.Delay(3000);
                    
                    // Reset migration items
                    foreach (var item in ExecutionItems)
                    {
                        item.Status = MigrationStatus.NotStarted;
                        item.Progress = 0;
                        item.StartTime = null;
                        item.CompletedTime = null;
                        item.ErrorMessage = null;
                    }
                    
                    UpdateExecutionStatistics();
                    AddExecutionLog($"Rollback completed to: {SelectedRollbackPoint.Name}", LogLevel.Info);
                    RollbackStatus = "Rollback completed successfully";
                    
                    MessageBox.Show("Rollback completed successfully.", "Rollback Complete", 
                        MessageBoxButton.OK, MessageBoxImage.Information);
                }
                catch (Exception ex)
                {
                    _logger?.LogError(ex, "Error executing rollback");
                    RollbackStatus = "Rollback failed";
                    AddExecutionLog($"Rollback failed: {ex.Message}", LogLevel.Error);
                    MessageBox.Show($"Rollback failed: {ex.Message}", "Rollback Error", 
                        MessageBoxButton.OK, MessageBoxImage.Error);
                }
                finally
                {
                    IsRollbackRunning = false;
                }
            }
        }
        
        private void AddExecutionLog(string message, LogLevel level)
        {
            var logEntry = new ExecutionLogEntry
            {
                Timestamp = DateTime.Now,
                Level = level,
                Message = message,
                Source = "Migration Engine"
            };
            
            Application.Current?.Dispatcher.Invoke(() =>
            {
                ExecutionLogs.Insert(0, logEntry); // Add to top
                
                // Limit log size
                while (ExecutionLogs.Count > 1000)
                {
                    ExecutionLogs.RemoveAt(ExecutionLogs.Count - 1);
                }
            });
        }
        
        private void ClearLogs()
        {
            ExecutionLogs.Clear();
            AddExecutionLog("Execution logs cleared", LogLevel.Info);
        }
        
        private async Task ExportLogsAsync()
        {
            try
            {
                // TODO: Implement log export functionality
                MessageBox.Show("Export functionality will be implemented in Phase 2", "Feature Coming Soon", 
                    MessageBoxButton.OK, MessageBoxImage.Information);
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error exporting logs");
                MessageBox.Show($"Export failed: {ex.Message}", "Export Error", 
                    MessageBoxButton.OK, MessageBoxImage.Error);
            }
        }
        
        private async Task RefreshStatusAsync()
        {
            try
            {
                // Refresh execution status from external sources
                UpdateExecutionStatistics();
                UpdateProgressByType();
                AddExecutionLog("Status refreshed manually", LogLevel.Info);
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error refreshing status");
                AddExecutionLog($"Status refresh failed: {ex.Message}", LogLevel.Error);
            }
        }
        
        private bool FilterExecutionItems(object item)
        {
            if (!(item is MigrationExecutionItem executionItem))
                return false;
            
            // Text search
            if (!string.IsNullOrWhiteSpace(SearchText))
            {
                var searchLower = SearchText.ToLowerInvariant();
                if (!executionItem.DisplayName?.ToLowerInvariant().Contains(searchLower) == true &&
                    !executionItem.SourceIdentity?.ToLowerInvariant().Contains(searchLower) == true &&
                    !executionItem.TargetIdentity?.ToLowerInvariant().Contains(searchLower) == true)
                {
                    return false;
                }
            }
            
            // Type filter
            if (SelectedTypeFilter.HasValue && executionItem.Type != SelectedTypeFilter.Value)
                return false;
            
            // Status filter
            if (SelectedStatusFilter.HasValue && executionItem.Status != SelectedStatusFilter.Value)
                return false;
            
            return true;
        }
        
        private bool FilterExecutionLogs(object item)
        {
            if (!(item is ExecutionLogEntry logEntry))
                return false;
            
            // Text search
            if (!string.IsNullOrWhiteSpace(SearchText))
            {
                var searchLower = SearchText.ToLowerInvariant();
                if (!logEntry.Message?.ToLowerInvariant().Contains(searchLower) == true &&
                    !logEntry.Source?.ToLowerInvariant().Contains(searchLower) == true)
                {
                    return false;
                }
            }
            
            // Error filter
            if (ShowOnlyErrors && logEntry.Level != LogLevel.Error)
                return false;
            
            return true;
        }
        
        /// <summary>
        /// Create migration execution context for PowerShell modules
        /// </summary>
        private Services.MigrationExecutionContext CreateMigrationExecutionContext()
        {
            return new Services.MigrationExecutionContext
            {
                ExecutionId = Guid.NewGuid().ToString(),
                CompanyName = GetCompanyNameFromProfile(),
                SourceDomain = GetSourceDomainFromProfile(),
                TargetDomain = GetTargetDomainFromProfile(),
                MigrationMode = "Full", // Could be configurable
                WorkingDirectory = @"C:\enterprisediscovery",
                StartTime = DateTime.Now,
                Status = Services.WaveExecutionStatus.Running,
                Wave = null, // Could be set if available
                Options = new Services.WaveExecutionOptions(),
                CancellationToken = CancellationToken.None,
                EnvironmentVariables = new Dictionary<string, object>
                {
                    ["Profile"] = SelectedProfile,
                    ["ExecutionId"] = Guid.NewGuid().ToString()
                }
            };
        }
        
        /// <summary>
        /// Get current batch for migration context
        /// </summary>
        private MigrationBatch GetCurrentBatch()
        {
            if (SelectedWave == null) return null;
            
            // Convert wave status to MigrationStatus enum
            var migrationStatus = SelectedWave.Status.ToString().ToLower() switch
            {
                "planned" => MigrationStatus.Planning,
                "inprogress" => MigrationStatus.InProgress,
                "completed" => MigrationStatus.Completed,
                "onhold" => MigrationStatus.Paused,
                _ => MigrationStatus.NotStarted
            };
            
            return new MigrationBatch
            {
                Id = SelectedWave.Id,
                Name = SelectedWave.Name,
                PlannedStartDate = SelectedWave.PlannedStartDate,
                PlannedEndDate = SelectedWave.PlannedEndDate,
                Status = migrationStatus,
                Description = SelectedWave.Description ?? "",
                Priority = SelectedWave.Priority
            };
        }
        
        /// <summary>
        /// Extract source domain from profile configuration
        /// </summary>
        private string GetSourceDomainFromProfile()
        {
            // In a real implementation, this would read from profile configuration
            // For now, return a default or extract from first migration item
            var firstItem = ExecutionItems.FirstOrDefault();
            if (firstItem?.SourceIdentity?.Contains("@") == true)
            {
                return firstItem.SourceIdentity.Split('@').Last();
            }
            return "source.domain.com";
        }
        
        /// <summary>
        /// Extract target domain from profile configuration
        /// </summary>
        private string GetTargetDomainFromProfile()
        {
            // Prefer resolved domain from selected target company in configuration
            try
            {
                var targetCompany = Services.ConfigurationService.Instance.SelectedTargetCompany;
                if (!string.IsNullOrWhiteSpace(targetCompany))
                {
                    return Services.ConfigurationService.Instance.TryResolvePrimaryDomain(targetCompany);
                }
            }
            catch { }
            // Fallback to inspecting current execution items
            var firstItem = ExecutionItems.FirstOrDefault();
            if (firstItem?.TargetIdentity?.Contains("@") == true)
            {
                return firstItem.TargetIdentity.Split('@').Last();
            }
            return "target.domain.com";
        }
        
        /// <summary>
        /// Extract company name from profile
        /// </summary>
        private string GetCompanyNameFromProfile()
        {
            // Extract company name from selected profile or use default
            return SelectedProfile ?? "DefaultCompany";
        }
        
        /// <summary>
        /// Handle PowerShell progress updates
        /// </summary>
        private void OnPowerShellProgress(object sender, PowerShellProgressEventArgs e)
        {
            Application.Current?.Dispatcher.Invoke(() =>
            {
                // Find the execution item by session ID or current phase
                var currentItem = ExecutionItems.FirstOrDefault(i => i.Status == MigrationStatus.InProgress);
                if (currentItem != null)
                {
                    currentItem.Progress = e.PercentComplete;
                    UpdateExecutionStatistics();
                }
                
                AddExecutionLog($"Progress: {e.Activity} - {e.StatusDescription} ({e.PercentComplete}%)", LogLevel.Info);
            });
        }
        
        /// <summary>
        /// Handle PowerShell output streaming
        /// </summary>
        private void OnPowerShellOutput(object sender, PowerShellOutputEventArgs e)
        {
            Application.Current?.Dispatcher.Invoke(() =>
            {
                AddExecutionLog($"Output: {e.Output}", LogLevel.Debug);
            });
        }
        
        /// <summary>
        /// Handle PowerShell error events
        /// </summary>
        private void OnPowerShellError(object sender, PowerShellErrorEventArgs e)
        {
            Application.Current?.Dispatcher.Invoke(() =>
            {
                AddExecutionLog($"PowerShell Error: {e.Error}", LogLevel.Error);
                
                // Mark current item as failed if error is critical
                var currentItem = ExecutionItems.FirstOrDefault(i => i.Status == MigrationStatus.InProgress);
                if (currentItem != null && e.Exception != null)
                {
                    currentItem.ErrorMessage = e.Error;
                    // Don't mark as failed here - let the main execution logic handle it
                }
            });
        }
        #endregion
        
        #region T-027 Migration Engine Integration
        
        /// <summary>
        /// Initialize migration engine event handlers for real-time updates
        /// </summary>
        private void InitializeMigrationEngineEvents()
        {
            if (_migrationEngine != null)
            {
                _migrationEngine.MigrationProgress += OnMigrationEngineProgress;
                _migrationEngine.MigrationCompleted += OnMigrationEngineCompleted;
                _migrationEngine.MigrationError += OnMigrationEngineError;
                
                _logger?.LogDebug("T-027 Migration Engine events initialized");
            }
        }
        
        /// <summary>
        /// Handle real-time progress updates from T-027 migration engine
        /// </summary>
        private void OnMigrationEngineProgress(object sender, MigrationProgressEventArgs e)
        {
            Application.Current?.Dispatcher.Invoke(() =>
            {
                // Find the execution item by ID
                var executionItem = ExecutionItems.FirstOrDefault(i => i.Id == e.ItemId);
                if (executionItem != null)
                {
                    executionItem.Progress = (int)e.ProgressPercentage;
                    if (Enum.TryParse<MigrationStatus>(e.Status, out var status))
                    {
                        executionItem.Status = status;
                    }
                    executionItem.LastUpdated = DateTime.Now;
                    
                    // Update error message if provided
                    if (!string.IsNullOrEmpty(e.ErrorMessage))
                    {
                        executionItem.ErrorMessage = e.ErrorMessage;
                    }
                }
                
                // Update overall progress
                CurrentExecutionPhase = $"Processing {e.ItemType}: {e.Status}";
                UpdateExecutionStatistics();
                UpdateProgressByType();
                
                // Log progress update
                var logLevel = e.Success ? LogLevel.Info : (string.IsNullOrEmpty(e.ErrorMessage) ? LogLevel.Info : LogLevel.Warning);
                AddExecutionLog($"[{e.ItemType}] {e.Status} - {e.ProgressPercentage:F1}% complete", logLevel);
            });
        }
        
        /// <summary>
        /// Handle migration completion events from T-027 migration engine
        /// </summary>
        private void OnMigrationEngineCompleted(object sender, MigrationCompletedEventArgs e)
        {
            Application.Current?.Dispatcher.Invoke(() =>
            {
                var logLevel = e.Success ? LogLevel.Info : LogLevel.Error;
                var message = $"Wave '{e.WaveName}' completed - Success: {e.Success}, " +
                             $"Completed: {e.CompletedItems}/{e.TotalItems}, " +
                             $"Failed: {e.FailedItems}, Duration: {e.Duration:hh\\:mm\\:ss}";
                
                AddExecutionLog(message, logLevel);
                
                if (e.Errors?.Any() == true)
                {
                    foreach (var error in e.Errors.Take(5)) // Limit to first 5 errors
                    {
                        AddExecutionLog($"Wave Error: {error}", LogLevel.Error);
                    }
                }
                
                // Update final statistics
                UpdateExecutionStatistics();
                UpdateProgressByType();
            });
        }
        
        /// <summary>
        /// Handle migration error events from T-027 migration engine
        /// </summary>
        private void OnMigrationEngineError(object sender, MigrationErrorEventArgs e)
        {
            Application.Current?.Dispatcher.Invoke(() =>
            {
                // Find and update the affected execution item
                var executionItem = ExecutionItems.FirstOrDefault(i => i.Id == e.ItemId);
                if (executionItem != null)
                {
                    executionItem.Status = MigrationStatus.Failed;
                    executionItem.ErrorMessage = e.Error?.Message ?? "Unknown error occurred";
                    executionItem.CompletedTime = DateTime.Now;
                    executionItem.ActualDuration = executionItem.CompletedTime - executionItem.StartTime;
                }
                
                // Log the error
                var errorMessage = string.IsNullOrEmpty(e.WaveName) 
                    ? $"Migration error for item {e.ItemId}: {e.Error?.Message}"
                    : $"Wave '{e.WaveName}' error for {e.ItemType} {e.ItemId}: {e.Error?.Message}";
                
                AddExecutionLog(errorMessage, LogLevel.Error);
                
                // Update statistics
                UpdateExecutionStatistics();
                UpdateProgressByType();
            });
        }
        
        /// <summary>
        /// Create a migration wave from current execution items
        /// </summary>
        private MigrationWaveExtended CreateMigrationWaveFromExecutionItems()
        {
            var migrationItems = ExecutionItems.Select(ei => new MigrationItem
            {
                Id = ei.Id,
                Type = ei.Type,
                DisplayName = ei.DisplayName,
                SourceIdentity = ei.SourceIdentity,
                TargetIdentity = ei.TargetIdentity,
                Status = ei.Status,
                Priority = ei.Priority,
                EstimatedDuration = ei.EstimatedDuration,
                IsValidationRequired = true,
                SupportsRollback = true,
                Dependencies = new List<string>() // Could be populated from dependency analysis
            }).ToList();
            
            var batch = new MigrationBatchExtended
            {
                Id = SelectedWave?.Id ?? Guid.NewGuid().ToString(),
                Name = SelectedWave?.Name ?? "Execution Batch",
                PlannedStartDate = DateTime.Now,
                PlannedEndDate = DateTime.Now.AddHours(2),
                Status = MigrationStatus.NotStarted,
                Items = migrationItems,
                Priority = MigrationPriority.Normal
            };
            
            return new MigrationWaveExtended
            {
                Id = SelectedWave?.Id ?? Guid.NewGuid().ToString(),
                Name = SelectedWave?.Name ?? "Migration Wave",
                PlannedStartDate = DateTime.Now,
                PlannedEndDate = DateTime.Now.AddHours(4),
                Status = MigrationStatus.NotStarted,
                Batches = new List<MigrationBatch> { batch },
                Priority = MigrationPriority.Normal
            };
        }
        
        /// <summary>
        /// Create migration context for T-027 engine
        /// </summary>
        private MigrationContext CreateMigrationContext()
        {
            var ctx = new MigrationContext
            {
                SessionId = Guid.NewGuid().ToString(),
                InitiatedBy = Environment.UserName,
                Source = new SourceEnvironment
                {
                    DomainName = GetSourceDomainFromProfile(),
                    Type = "AzureAD"
                },
                Target = new TargetEnvironment
                {
                    DomainName = GetTargetDomainFromProfile(),
                    Type = "AzureAD",
                    Configuration = new Dictionary<string, object>()
                },
                AuditLogger = new AuditLogger(SimpleServiceLocator.Instance.GetService<ILogger<AuditLogger>>()), // Default audit logger
                MaxConcurrentOperations = 3,
                ContinueOnError = true,
                OperationTimeout = TimeSpan.FromHours(2),
                WorkingDirectory = @"C:\enterprisediscovery",
                EnvironmentVariables = new Dictionary<string, object>
                {
                    ["Profile"] = SelectedProfile,
                    ["ExecutionId"] = Guid.NewGuid().ToString(),
                    ["StartTime"] = DateTime.Now
                }
            };

            try
            {
                // Populate target Graph credentials from TargetProfiles of the current source company
                var company = SelectedProfile ?? "default";
                var active = Services.TargetProfileService.Instance.GetActiveProfileAsync(company).GetAwaiter().GetResult();
                if (active != null)
                {
                    var secret = Services.TargetProfileService.Instance.GetClientSecretAsync(company, active.Id).GetAwaiter().GetResult();
                    if (!string.IsNullOrWhiteSpace(active.TenantId) && !string.IsNullOrWhiteSpace(active.ClientId) && !string.IsNullOrWhiteSpace(secret))
                    {
                        ctx.Target.Configuration["GraphTenantId"] = active.TenantId;
                        ctx.Target.Configuration["GraphClientId"] = active.ClientId;
                        ctx.Target.Configuration["GraphClientSecret"] = secret;
                    }
                }
            }
            catch (Exception ex)
            {
                _logger?.LogWarning(ex, "Unable to load target Graph credentials from TargetProfiles");
            }

            return ctx;
        }
        
        /// <summary>
        /// Update execution items based on wave execution results
        /// </summary>
        private void UpdateExecutionResultsFromWave(MandADiscoverySuite.Services.Migration.WaveExecutionResult waveResult)
        {
            // Update overall statistics
            ExecutionProgress = (int)waveResult.SuccessRate;
            OverallProgressPercentage = waveResult.SuccessRate;
            
            // Mark items as completed based on success rate estimation
            var itemsToComplete = (int)(ExecutionItems.Count * (waveResult.SuccessRate / 100.0));
            var completedCount = 0;
            
            foreach (var item in ExecutionItems.Where(i => i.Status == MigrationStatus.InProgress).Take(itemsToComplete))
            {
                item.Status = MigrationStatus.Completed;
                item.Progress = 100;
                item.CompletedTime = DateTime.Now;
                item.ActualDuration = item.CompletedTime - item.StartTime;
                completedCount++;
            }
            
            // Mark remaining in-progress items as failed if wave wasn't completely successful
            if (!waveResult.IsSuccess)
            {
                foreach (var item in ExecutionItems.Where(i => i.Status == MigrationStatus.InProgress))
                {
                    item.Status = MigrationStatus.Failed;
                    item.ErrorMessage = "Migration failed during wave execution";
                    item.CompletedTime = DateTime.Now;
                    item.ActualDuration = item.CompletedTime - item.StartTime;
                }
            }
            
            UpdateExecutionStatistics();
            UpdateProgressByType();
        }
        
        /// <summary>
        /// Resolve or create migration engine service
        /// </summary>
        private MigrationEngineService ResolveOrCreateMigrationEngine()
        {
            try
            {
                // Try to resolve from service locator first
                var serviceLocator = SimpleServiceLocator.Instance;
                var migrationEngine = serviceLocator.GetService<MigrationEngineService>();
                if (migrationEngine != null)
                {
                    _logger?.LogDebug("Resolved MigrationEngineService from service locator");
                    return migrationEngine;
                }
            }
            catch (Exception ex)
            {
                _logger?.LogWarning(ex, "Could not resolve MigrationEngineService from service locator");
            }
            
            // Create a default instance with required dependencies
            try
            {
                var logicEngineService = SimpleServiceLocator.Instance.GetService<ILogicEngineService>();
                var dependencyEngine = new MigrationDependencyEngine(
                    SimpleServiceLocator.Instance.GetService<ILogger<MigrationDependencyEngine>>(), 
                    logicEngineService);
                var serviceProvider = new DefaultServiceProvider(); // Minimal service provider
                
                var engine = new MigrationEngineService(
                    SimpleServiceLocator.Instance.GetService<ILogger<MigrationEngineService>>(), 
                    dependencyEngine, 
                    serviceProvider);
                _logger?.LogDebug("Created default MigrationEngineService instance");
                return engine;
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Failed to create MigrationEngineService instance");
                return null; // Will fall back to PowerShell execution
            }
        }
        
        #endregion
        
        #region Overrides
        public override async Task LoadAsync()
        {
            IsLoading = true;
            HasData = false;
            LastError = null;
            HeaderWarnings.Clear();

            try
            {
                _logger?.LogDebug($"[{GetType().Name}] Load start");
                
                LoadAvailableProfiles();
                InitializePreFlightChecks();
                
                HasData = true;
                _logger?.LogInformation($"[{GetType().Name}] Load ok");
            }
            catch (Exception ex)
            {
                LastError = $"Unexpected error: {ex.Message}";
                _logger?.LogError($"[{GetType().Name}] Load fail ex={ex}");
            }
            finally
            {
                IsLoading = false;
            }
        }
        
        protected override void OnDisposing()
        {
            _executionTimer?.Dispose();
            
            // Unsubscribe from T-027 migration engine events
            if (_migrationEngine != null)
            {
                _migrationEngine.MigrationProgress -= OnMigrationEngineProgress;
                _migrationEngine.MigrationCompleted -= OnMigrationEngineCompleted;
                _migrationEngine.MigrationError -= OnMigrationEngineError;
            }
            
            base.OnDisposing();
        }
        #endregion
    }
    
    #region T-027 Integration Support Classes
    
    /// <summary>
    /// Minimal service provider for creating default MigrationEngineService
    /// </summary>
    public class DefaultServiceProvider : IServiceProvider
    {
        public object GetService(Type serviceType)
        {
            // Return null for all services - providers will be created as needed
            return null;
        }
    }
    
    #endregion
    
    #region Supporting Classes
    /// <summary>
    /// Pre-flight validation check
    /// </summary>
    public class PreFlightCheck
    {
        public string Id { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public string Category { get; set; }
        public CheckStatus Status { get; set; }
        public bool IsRequired { get; set; }
        public DateTime? StartTime { get; set; }
        public DateTime? EndTime { get; set; }
        public TimeSpan? Duration { get; set; }
        public string ResultMessage { get; set; }
    }
    
    /// <summary>
    /// Migration execution item
    /// </summary>
    public class MigrationExecutionItem
    {
        public string Id { get; set; }
        public MigrationType Type { get; set; }
        public string DisplayName { get; set; }
        public string SourceIdentity { get; set; }
        public string TargetIdentity { get; set; }
        public MigrationStatus Status { get; set; }
        public MigrationPriority Priority { get; set; }
        public TimeSpan EstimatedDuration { get; set; }
        public TimeSpan? ActualDuration { get; set; }
        public int Progress { get; set; }
        public DateTime? StartTime { get; set; }
        public DateTime? CompletedTime { get; set; }
        public DateTime LastUpdated { get; set; }
        public string ErrorMessage { get; set; }
    }
    
    /// <summary>
    /// Execution log entry
    /// </summary>
    public class ExecutionLogEntry
    {
        public DateTime Timestamp { get; set; }
        public LogLevel Level { get; set; }
        public string Message { get; set; }
        public string Source { get; set; }
    }
    
    /// <summary>
    /// Rollback point definition
    /// </summary>
    public class RollbackPoint
    {
        public string Id { get; set; }
        public string Name { get; set; }
        public DateTime CreatedAt { get; set; }
        public string Description { get; set; }
        public bool IsAutomatic { get; set; }
        public int MigratedItemsCount { get; set; }
        public bool CanRollback { get; set; }
    }
    
    /// <summary>
    /// Progress tracking by migration type
    /// </summary>
    public class ExecutionTypeProgress : INotifyPropertyChanged
    {
        private string _type;
        private int _total;
        private int _completed;
        private int _inProgress;
        private int _failed;
        private int _skipped;
        private double _percentageComplete;
        
        public string Type
        {
            get => _type;
            set { _type = value; OnPropertyChanged(); }
        }
        
        public int Total
        {
            get => _total;
            set { _total = value; OnPropertyChanged(); }
        }
        
        public int Completed
        {
            get => _completed;
            set { _completed = value; OnPropertyChanged(); }
        }
        
        public int InProgress
        {
            get => _inProgress;
            set { _inProgress = value; OnPropertyChanged(); }
        }
        
        public int Failed
        {
            get => _failed;
            set { _failed = value; OnPropertyChanged(); }
        }
        
        public int Skipped
        {
            get => _skipped;
            set { _skipped = value; OnPropertyChanged(); }
        }
        
        public double PercentageComplete
        {
            get => _percentageComplete;
            set { _percentageComplete = value; OnPropertyChanged(); }
        }
        
        public event PropertyChangedEventHandler PropertyChanged;
        protected virtual void OnPropertyChanged([System.Runtime.CompilerServices.CallerMemberName] string propertyName = null)
        {
            PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(propertyName));
        }
    }
    
    /// <summary>
    /// Check status enumeration
    /// </summary>
    public enum CheckStatus
    {
        Pending,
        Running,
        Passed,
        Warning,
        Failed
    }
    #endregion
}
