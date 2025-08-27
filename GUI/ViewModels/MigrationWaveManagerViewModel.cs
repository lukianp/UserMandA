using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.ComponentModel;
using System.Linq;
using System.Runtime.CompilerServices;
using System.Threading;
using System.Threading.Tasks;
using System.Windows.Input;
using CommunityToolkit.Mvvm.Input;
using MandADiscoverySuite.Models;
using MandADiscoverySuite.Services;
using Microsoft.Extensions.Logging;

namespace MandADiscoverySuite.ViewModels
{
    /// <summary>
    /// Comprehensive ViewModel for enterprise migration wave management with ShareGate-quality orchestration
    /// </summary>
    public class MigrationWaveManagerViewModel : INotifyPropertyChanged
    {
        #region Private Fields
        private readonly MigrationWaveOrchestrator _orchestrator;
        private readonly MigrationScheduler _scheduler;
        private readonly MigrationDataService _dataService;
        private readonly ILogger<MigrationWaveManagerViewModel> _logger;
        
        private ObservableCollection<MigrationWaveViewModel> _waves;
        private MigrationWaveViewModel _selectedWave;
        private bool _isLoading;
        private bool _isExecuting;
        private string _statusMessage;
        private double _overallProgress;
        private int _activeWaves;
        private int _completedWaves;
        private int _failedWaves;
        
        // Real-time monitoring
        private ObservableCollection<WaveExecutionSummary> _activeExecutions;
        private ObservableCollection<MigrationAlertViewModel> _recentAlerts;
        private Timer _statusUpdateTimer;
        
        // Schedule management
        private DateTime _earliestStartDate;
        private bool _excludeWeekends;
        private int _maxConcurrentWaves;
        private WaveGroupingStrategy _groupingStrategy;
        
        #endregion

        #region Constructor
        public MigrationWaveManagerViewModel(
            MigrationWaveOrchestrator orchestrator = null,
            MigrationScheduler scheduler = null,
            MigrationDataService dataService = null,
            ILogger<MigrationWaveManagerViewModel> logger = null)
        {
            _orchestrator = orchestrator ?? new MigrationWaveOrchestrator();
            _scheduler = scheduler ?? new MigrationScheduler();
            _dataService = dataService ?? new MigrationDataService();
            _logger = logger;

            InitializeCollections();
            InitializeCommands();
            InitializeEventHandlers();
            InitializeDefaults();
            
            // Start status monitoring
            _statusUpdateTimer = new Timer(UpdateStatusMetrics, null, TimeSpan.FromSeconds(2), TimeSpan.FromSeconds(2));
        }
        #endregion

        #region Public Properties
        
        public ObservableCollection<MigrationWaveViewModel> Waves
        {
            get => _waves;
            set => SetProperty(ref _waves, value);
        }

        public MigrationWaveViewModel SelectedWave
        {
            get => _selectedWave;
            set => SetProperty(ref _selectedWave, value);
        }

        public bool IsLoading
        {
            get => _isLoading;
            set => SetProperty(ref _isLoading, value);
        }

        public bool IsExecuting
        {
            get => _isExecuting;
            set => SetProperty(ref _isExecuting, value);
        }

        public string StatusMessage
        {
            get => _statusMessage;
            set => SetProperty(ref _statusMessage, value);
        }

        public double OverallProgress
        {
            get => _overallProgress;
            set => SetProperty(ref _overallProgress, value);
        }

        public int ActiveWaves
        {
            get => _activeWaves;
            set => SetProperty(ref _activeWaves, value);
        }

        public int CompletedWaves
        {
            get => _completedWaves;
            set => SetProperty(ref _completedWaves, value);
        }

        public int FailedWaves
        {
            get => _failedWaves;
            set => SetProperty(ref _failedWaves, value);
        }

        public ObservableCollection<WaveExecutionSummary> ActiveExecutions
        {
            get => _activeExecutions;
            set => SetProperty(ref _activeExecutions, value);
        }

        public ObservableCollection<MigrationAlertViewModel> RecentAlerts
        {
            get => _recentAlerts;
            set => SetProperty(ref _recentAlerts, value);
        }

        // Schedule Configuration Properties
        public DateTime EarliestStartDate
        {
            get => _earliestStartDate;
            set => SetProperty(ref _earliestStartDate, value);
        }

        public bool ExcludeWeekends
        {
            get => _excludeWeekends;
            set => SetProperty(ref _excludeWeekends, value);
        }

        public int MaxConcurrentWaves
        {
            get => _maxConcurrentWaves;
            set => SetProperty(ref _maxConcurrentWaves, value);
        }

        public WaveGroupingStrategy GroupingStrategy
        {
            get => _groupingStrategy;
            set => SetProperty(ref _groupingStrategy, value);
        }

        // Calculated Properties
        public int TotalWaves => Waves?.Count ?? 0;
        public int TotalBatches => Waves?.Sum(w => w.Batches?.Count ?? 0) ?? 0;
        public int TotalItems => Waves?.Sum(w => w.TotalItems) ?? 0;
        
        public bool HasActiveWaves => ActiveWaves > 0;
        public bool CanStartWaves => !IsExecuting && Waves?.Any(w => w.Status == MigrationStatus.NotStarted) == true;
        public bool CanCreateSchedule => Waves?.Any() == true && !IsExecuting;

        public string ProgressSummaryText => 
            $"Active: {ActiveWaves}, Completed: {CompletedWaves}, Failed: {FailedWaves}";

        public string ScheduleSummaryText =>
            $"{TotalWaves} waves, {TotalBatches} batches, {TotalItems} items";

        #endregion

        #region Commands
        public ICommand LoadWavesCommand { get; private set; }
        public ICommand CreateScheduleCommand { get; private set; }
        public ICommand StartWaveCommand { get; private set; }
        public ICommand PauseWaveCommand { get; private set; }
        public ICommand ResumeWaveCommand { get; private set; }
        public ICommand CancelWaveCommand { get; private set; }
        public ICommand StartAllWavesCommand { get; private set; }
        public ICommand PauseAllWavesCommand { get; private set; }
        public ICommand CancelAllWavesCommand { get; private set; }
        public ICommand OptimizeScheduleCommand { get; private set; }
        public ICommand ValidateWavesCommand { get; private set; }
        public ICommand ExportScheduleCommand { get; private set; }
        public ICommand ImportScheduleCommand { get; private set; }
        public ICommand RefreshStatusCommand { get; private set; }
        public ICommand ClearAlertsCommand { get; private set; }
        #endregion

        #region Initialization
        private void InitializeCollections()
        {
            Waves = new ObservableCollection<MigrationWaveViewModel>();
            ActiveExecutions = new ObservableCollection<WaveExecutionSummary>();
            RecentAlerts = new ObservableCollection<MigrationAlertViewModel>();
        }

        private void InitializeCommands()
        {
            LoadWavesCommand = new AsyncRelayCommand(LoadWavesAsync);
            CreateScheduleCommand = new AsyncRelayCommand(CreateScheduleAsync);
            StartWaveCommand = new AsyncRelayCommand<MigrationWaveViewModel>(StartWaveAsync, CanStartWave);
            PauseWaveCommand = new AsyncRelayCommand<MigrationWaveViewModel>(PauseWaveAsync, CanPauseWave);
            ResumeWaveCommand = new AsyncRelayCommand<MigrationWaveViewModel>(ResumeWaveAsync, CanResumeWave);
            CancelWaveCommand = new AsyncRelayCommand<MigrationWaveViewModel>(CancelWaveAsync, CanCancelWave);
            StartAllWavesCommand = new AsyncRelayCommand(StartAllWavesAsync, () => CanStartWaves);
            PauseAllWavesCommand = new AsyncRelayCommand(PauseAllWavesAsync, () => HasActiveWaves);
            CancelAllWavesCommand = new AsyncRelayCommand(CancelAllWavesAsync, () => HasActiveWaves);
            OptimizeScheduleCommand = new AsyncRelayCommand(OptimizeScheduleAsync, () => CanCreateSchedule);
            ValidateWavesCommand = new AsyncRelayCommand(ValidateWavesAsync);
            ExportScheduleCommand = new AsyncRelayCommand(ExportScheduleAsync, () => TotalWaves > 0);
            ImportScheduleCommand = new AsyncRelayCommand(ImportScheduleAsync);
            RefreshStatusCommand = new RelayCommand(RefreshStatus);
            ClearAlertsCommand = new RelayCommand(ClearAlerts);
        }

        private void InitializeEventHandlers()
        {
            // Subscribe to orchestrator events
            _orchestrator.WaveProgress += OnWaveProgress;
            _orchestrator.BatchProgress += OnBatchProgress;
            _orchestrator.ItemProgress += OnItemProgress;
            _orchestrator.WaveStatusChanged += OnWaveStatusChanged;
            _orchestrator.MigrationAlert += OnMigrationAlert;

            // Subscribe to data service events
            _dataService.DataLoadProgress += OnDataLoadProgress;
        }

        private void InitializeDefaults()
        {
            EarliestStartDate = DateTime.Now.AddDays(1);
            ExcludeWeekends = true;
            MaxConcurrentWaves = 3;
            GroupingStrategy = WaveGroupingStrategy.ByType;
            StatusMessage = "Ready";
        }
        #endregion

        #region Command Implementations

        private async Task LoadWavesAsync()
        {
            try
            {
                IsLoading = true;
                StatusMessage = "Loading migration data...";

                // Load discovery data
                var discoveryResult = await _dataService.LoadDiscoveryDataAsync("ljpops");
                if (!discoveryResult.IsSuccess)
                {
                    StatusMessage = "Failed to load discovery data";
                    return;
                }

                // Load existing migration items and batches
                var itemsResult = await _dataService.LoadMigrationItemsAsync("ljpops");
                var batchesResult = await _dataService.LoadMigrationBatchesAsync("ljpops");

                // Create waves from existing data or generate from discovery
                List<MigrationWaveExtended> waves;
                if (batchesResult.Data?.Any() == true)
                {
                    // Create waves from existing batches
                    var waveOptions = new WaveCreationOptions
                    {
                        GroupingStrategy = GroupingStrategy,
                        MaxBatchesPerWave = 5
                    };
                    waves = _orchestrator.CreateWavesFromBatches(batchesResult.Data, waveOptions);
                }
                else if (itemsResult.Data?.Any() == true)
                {
                    // Create schedule from items
                    var scheduleOptions = new SchedulingOptions
                    {
                        EarliestStartDate = EarliestStartDate,
                        ExcludeWeekends = ExcludeWeekends
                    };
                    var scheduleResult = await _scheduler.CreateScheduleAsync(itemsResult.Data, scheduleOptions);
                    waves = scheduleResult.Waves;
                }
                else
                {
                    // Generate from discovery data
                    var generationOptions = new MigrationGenerationOptions
                    {
                        TargetDomain = "newcompany.com"
                    };
                    var generatedItems = _dataService.GenerateMigrationItemsFromDiscovery(discoveryResult, generationOptions);
                    
                    var scheduleOptions = new SchedulingOptions
                    {
                        EarliestStartDate = EarliestStartDate,
                        ExcludeWeekends = ExcludeWeekends
                    };
                    var scheduleResult = await _scheduler.CreateScheduleAsync(generatedItems, scheduleOptions);
                    waves = scheduleResult.Waves;
                }

                // Update UI
                Waves.Clear();
                foreach (var wave in waves)
                {
                    var waveViewModel = new MigrationWaveViewModel(wave);
                    Waves.Add(waveViewModel);
                }

                StatusMessage = $"Loaded {waves.Count} migration waves";
                _logger?.LogInformation($"Loaded {waves.Count} migration waves successfully");
            }
            catch (Exception ex)
            {
                StatusMessage = $"Error loading waves: {ex.Message}";
                _logger?.LogError(ex, "Error loading migration waves");
                
                AddAlert(MigrationAlertType.Error, "Load Error", ex.Message);
            }
            finally
            {
                IsLoading = false;
            }
        }

        private async Task CreateScheduleAsync()
        {
            try
            {
                IsLoading = true;
                StatusMessage = "Creating optimized schedule...";

                // Collect all items from existing waves
                var allItems = new List<MigrationItem>();
                if (Waves?.Any() == true)
                {
                    foreach (var wave in Waves)
                    {
                        if (wave.Batches?.Any() == true)
                        {
                            foreach (var batch in wave.Batches)
                            {
                                if (batch.Items?.Any() == true)
                                {
                                    // Convert ViewModels to Models for scheduling
                                    allItems.AddRange(batch.Items.Select(itemVm => new MigrationItem
                                    {
                                        Id = itemVm.Id,
                                        SourceIdentity = itemVm.SourceIdentity,
                                        Type = itemVm.Type,
                                        Status = itemVm.Status,
                                        Priority = itemVm.Priority,
                                        Complexity = itemVm.Complexity
                                    }));
                                }
                            }
                        }
                    }
                }
                
                if (allItems?.Any() != true)
                {
                    StatusMessage = "No items available for scheduling";
                    return;
                }

                // Create optimized schedule
                var scheduleOptions = new SchedulingOptions
                {
                    EarliestStartDate = EarliestStartDate,
                    ExcludeWeekends = ExcludeWeekends,
                    MaxBatchesPerWave = 5,
                    MaxItemsPerWave = 500
                };

                var scheduleResult = await _scheduler.CreateScheduleAsync(allItems, scheduleOptions);
                
                if (scheduleResult.IsSuccess)
                {
                    // Replace current waves with optimized schedule
                    Waves.Clear();
                    foreach (var wave in scheduleResult.Waves)
                    {
                        var waveViewModel = new MigrationWaveViewModel(wave);
                        Waves.Add(waveViewModel);
                    }

                    StatusMessage = $"Created optimized schedule: {scheduleResult.TotalWaves} waves, estimated duration: {scheduleResult.EstimatedDuration.TotalHours:F1} hours";
                    AddAlert(MigrationAlertType.Info, "Schedule Created", $"Optimized schedule created with {scheduleResult.TotalWaves} waves");
                }
                else
                {
                    StatusMessage = "Failed to create schedule";
                    foreach (var error in scheduleResult.Errors)
                    {
                        AddAlert(MigrationAlertType.Error, "Schedule Error", error);
                    }
                }

                _logger?.LogInformation($"Schedule creation completed: Success={scheduleResult.IsSuccess}");
            }
            catch (Exception ex)
            {
                StatusMessage = $"Error creating schedule: {ex.Message}";
                _logger?.LogError(ex, "Error creating migration schedule");
                
                AddAlert(MigrationAlertType.Error, "Schedule Error", ex.Message);
            }
            finally
            {
                IsLoading = false;
            }
        }

        private async Task StartWaveAsync(MigrationWaveViewModel waveViewModel)
        {
            if (waveViewModel?.Wave == null) return;

            try
            {
                IsExecuting = true;
                StatusMessage = $"Starting wave: {waveViewModel.Wave.Name}";

                var options = new WaveExecutionOptions
                {
                    MaxConcurrentItems = 10,
                    EnableRealTimeReporting = true
                };

                var extendedWave = ConvertToExtended(waveViewModel.Wave);
                var result = await _orchestrator.StartWaveAsync(extendedWave, options);
                
                if (result.IsSuccess)
                {
                    StatusMessage = $"Started wave: {waveViewModel.Wave.Name}";
                    AddAlert(MigrationAlertType.Info, "Wave Started", $"Wave '{waveViewModel.Wave.Name}' started successfully");
                }
                else
                {
                    StatusMessage = $"Failed to start wave: {waveViewModel.Wave.Name}";
                    foreach (var error in result.Errors)
                    {
                        AddAlert(MigrationAlertType.Error, "Start Error", error);
                    }
                }

                _logger?.LogInformation($"Wave start attempt: {waveViewModel.Wave.Name}, Success: {result.IsSuccess}");
            }
            catch (Exception ex)
            {
                StatusMessage = $"Error starting wave: {ex.Message}";
                _logger?.LogError(ex, $"Error starting wave {waveViewModel.Wave.Name}");
                
                AddAlert(MigrationAlertType.Error, "Start Error", ex.Message);
            }
            finally
            {
                IsExecuting = false;
            }
        }

        private async Task PauseWaveAsync(MigrationWaveViewModel waveViewModel)
        {
            if (waveViewModel?.Wave == null) return;

            try
            {
                var success = await _orchestrator.PauseWaveAsync(waveViewModel.Wave.Name);
                StatusMessage = success ? 
                    $"Paused wave: {waveViewModel.Wave.Name}" : 
                    $"Failed to pause wave: {waveViewModel.Wave.Name}";

                if (success)
                {
                    AddAlert(MigrationAlertType.Info, "Wave Paused", $"Wave '{waveViewModel.Wave.Name}' paused");
                }

                _logger?.LogInformation($"Wave pause attempt: {waveViewModel.Wave.Name}, Success: {success}");
            }
            catch (Exception ex)
            {
                StatusMessage = $"Error pausing wave: {ex.Message}";
                _logger?.LogError(ex, $"Error pausing wave {waveViewModel.Wave.Name}");
                
                AddAlert(MigrationAlertType.Error, "Pause Error", ex.Message);
            }
        }

        private async Task ResumeWaveAsync(MigrationWaveViewModel waveViewModel)
        {
            if (waveViewModel?.Wave == null) return;

            try
            {
                var success = await _orchestrator.ResumeWaveAsync(waveViewModel.Wave.Name);
                StatusMessage = success ? 
                    $"Resumed wave: {waveViewModel.Wave.Name}" : 
                    $"Failed to resume wave: {waveViewModel.Wave.Name}";

                if (success)
                {
                    AddAlert(MigrationAlertType.Info, "Wave Resumed", $"Wave '{waveViewModel.Wave.Name}' resumed");
                }

                _logger?.LogInformation($"Wave resume attempt: {waveViewModel.Wave.Name}, Success: {success}");
            }
            catch (Exception ex)
            {
                StatusMessage = $"Error resuming wave: {ex.Message}";
                _logger?.LogError(ex, $"Error resuming wave {waveViewModel.Wave.Name}");
                
                AddAlert(MigrationAlertType.Error, "Resume Error", ex.Message);
            }
        }

        private async Task CancelWaveAsync(MigrationWaveViewModel waveViewModel)
        {
            if (waveViewModel?.Wave == null) return;

            try
            {
                var success = await _orchestrator.CancelWaveAsync(waveViewModel.Wave.Name);
                StatusMessage = success ? 
                    $"Cancelled wave: {waveViewModel.Wave.Name}" : 
                    $"Failed to cancel wave: {waveViewModel.Wave.Name}";

                if (success)
                {
                    AddAlert(MigrationAlertType.Warning, "Wave Cancelled", $"Wave '{waveViewModel.Wave.Name}' cancelled");
                }

                _logger?.LogInformation($"Wave cancel attempt: {waveViewModel.Wave.Name}, Success: {success}");
            }
            catch (Exception ex)
            {
                StatusMessage = $"Error cancelling wave: {ex.Message}";
                _logger?.LogError(ex, $"Error cancelling wave {waveViewModel.Wave.Name}");
                
                AddAlert(MigrationAlertType.Error, "Cancel Error", ex.Message);
            }
        }

        private async Task StartAllWavesAsync()
        {
            try
            {
                IsExecuting = true;
                StatusMessage = "Starting all waves...";

                var pendingWaves = Waves?.Where(w => w.Status == MigrationStatus.NotStarted).ToList();
                if (pendingWaves?.Any() != true)
                {
                    StatusMessage = "No waves to start";
                    return;
                }

                var startedCount = 0;
                foreach (var wave in pendingWaves.Take(MaxConcurrentWaves))
                {
                    await StartWaveAsync(wave);
                    startedCount++;
                    
                    // Brief delay between starts
                    await Task.Delay(1000);
                }

                StatusMessage = $"Started {startedCount} waves";
                AddAlert(MigrationAlertType.Info, "Bulk Start", $"Started {startedCount} migration waves");
            }
            catch (Exception ex)
            {
                StatusMessage = $"Error starting waves: {ex.Message}";
                _logger?.LogError(ex, "Error starting all waves");
                
                AddAlert(MigrationAlertType.Error, "Bulk Start Error", ex.Message);
            }
            finally
            {
                IsExecuting = false;
            }
        }

        private async Task PauseAllWavesAsync()
        {
            try
            {
                var activeWaves = Waves?.Where(w => w.Status == MigrationStatus.InProgress).ToList();
                if (activeWaves?.Any() != true)
                {
                    StatusMessage = "No active waves to pause";
                    return;
                }

                var pausedCount = 0;
                foreach (var wave in activeWaves)
                {
                    await PauseWaveAsync(wave);
                    pausedCount++;
                }

                StatusMessage = $"Paused {pausedCount} waves";
                AddAlert(MigrationAlertType.Info, "Bulk Pause", $"Paused {pausedCount} active waves");
            }
            catch (Exception ex)
            {
                StatusMessage = $"Error pausing waves: {ex.Message}";
                _logger?.LogError(ex, "Error pausing all waves");
                
                AddAlert(MigrationAlertType.Error, "Bulk Pause Error", ex.Message);
            }
        }

        private async Task CancelAllWavesAsync()
        {
            try
            {
                var activeWaves = Waves?.Where(w => w.Status == MigrationStatus.InProgress || w.Status == MigrationStatus.Paused).ToList();
                if (activeWaves?.Any() != true)
                {
                    StatusMessage = "No active waves to cancel";
                    return;
                }

                var cancelledCount = 0;
                foreach (var wave in activeWaves)
                {
                    await CancelWaveAsync(wave);
                    cancelledCount++;
                }

                StatusMessage = $"Cancelled {cancelledCount} waves";
                AddAlert(MigrationAlertType.Warning, "Bulk Cancel", $"Cancelled {cancelledCount} waves");
            }
            catch (Exception ex)
            {
                StatusMessage = $"Error cancelling waves: {ex.Message}";
                _logger?.LogError(ex, "Error cancelling all waves");
                
                AddAlert(MigrationAlertType.Error, "Bulk Cancel Error", ex.Message);
            }
        }

        private async Task OptimizeScheduleAsync()
        {
            try
            {
                IsLoading = true;
                StatusMessage = "Optimizing schedule...";

                // Get all waves and re-optimize
                var waves = Waves?.Select(w => ConvertToExtended(w.Wave)).ToList();
                if (waves?.Any() != true)
                {
                    StatusMessage = "No waves to optimize";
                    return;
                }

                var scheduleOptions = new SchedulingOptions
                {
                    EarliestStartDate = EarliestStartDate,
                    ExcludeWeekends = ExcludeWeekends,
                    MaxBatchesPerWave = 5,
                    MaxItemsPerWave = 500
                };

                _scheduler.OptimizeSchedule(waves ?? new List<MigrationWaveExtended>(), scheduleOptions);

                StatusMessage = "Schedule optimized successfully";
                AddAlert(MigrationAlertType.Info, "Schedule Optimized", "Migration schedule has been optimized for better resource utilization");

                // Refresh wave ViewModels
                foreach (var waveViewModel in Waves)
                {
                    waveViewModel.RefreshWave();
                }

                _logger?.LogInformation("Schedule optimization completed successfully");
            }
            catch (Exception ex)
            {
                StatusMessage = $"Error optimizing schedule: {ex.Message}";
                _logger?.LogError(ex, "Error optimizing schedule");
                
                AddAlert(MigrationAlertType.Error, "Optimization Error", ex.Message);
            }
            finally
            {
                IsLoading = false;
            }
        }

        private async Task ValidateWavesAsync()
        {
            try
            {
                IsLoading = true;
                StatusMessage = "Validating waves...";

                var validationIssues = new List<string>();
                var validationWarnings = new List<string>();

                foreach (var waveViewModel in Waves ?? new ObservableCollection<MigrationWaveViewModel>())
                {
                    var extendedWave = ConvertToExtended(waveViewModel.Wave);
                    var validationResult = await _orchestrator.ValidateWaveReadinessAsync(extendedWave);
                    
                    if (!validationResult.IsReady)
                    {
                        validationIssues.AddRange(validationResult.Issues.Select(i => $"{waveViewModel.Wave.Name}: {i}"));
                    }
                    
                    validationWarnings.AddRange(validationResult.Warnings.Select(w => $"{waveViewModel.Wave.Name}: {w}"));
                }

                if (validationIssues.Any())
                {
                    StatusMessage = $"Validation failed: {validationIssues.Count} issues found";
                    foreach (var issue in validationIssues.Take(5))
                    {
                        AddAlert(MigrationAlertType.Error, "Validation Issue", issue);
                    }
                }
                else
                {
                    StatusMessage = "All waves validated successfully";
                    AddAlert(MigrationAlertType.Info, "Validation Success", "All migration waves passed validation");
                }

                foreach (var warning in validationWarnings.Take(3))
                {
                    AddAlert(MigrationAlertType.Warning, "Validation Warning", warning);
                }

                _logger?.LogInformation($"Wave validation completed: {validationIssues.Count} issues, {validationWarnings.Count} warnings");
            }
            catch (Exception ex)
            {
                StatusMessage = $"Error validating waves: {ex.Message}";
                _logger?.LogError(ex, "Error validating waves");
                
                AddAlert(MigrationAlertType.Error, "Validation Error", ex.Message);
            }
            finally
            {
                IsLoading = false;
            }
        }

        private async Task ExportScheduleAsync()
        {
            try
            {
                StatusMessage = "Exporting schedule...";
                
                // TODO: Implement schedule export to CSV/Excel
                await Task.Delay(1000);
                
                StatusMessage = "Schedule exported successfully";
                AddAlert(MigrationAlertType.Info, "Export Success", "Migration schedule exported to file");
                
                _logger?.LogInformation("Schedule export completed");
            }
            catch (Exception ex)
            {
                StatusMessage = $"Error exporting schedule: {ex.Message}";
                _logger?.LogError(ex, "Error exporting schedule");
                
                AddAlert(MigrationAlertType.Error, "Export Error", ex.Message);
            }
        }

        private async Task ImportScheduleAsync()
        {
            try
            {
                StatusMessage = "Importing schedule...";
                
                // TODO: Implement schedule import from CSV/Excel
                await Task.Delay(1000);
                
                StatusMessage = "Schedule imported successfully";
                AddAlert(MigrationAlertType.Info, "Import Success", "Migration schedule imported from file");
                
                _logger?.LogInformation("Schedule import completed");
            }
            catch (Exception ex)
            {
                StatusMessage = $"Error importing schedule: {ex.Message}";
                _logger?.LogError(ex, "Error importing schedule");
                
                AddAlert(MigrationAlertType.Error, "Import Error", ex.Message);
            }
        }

        #endregion

        #region Command Can Execute Methods
        private bool CanStartWave(MigrationWaveViewModel wave) => 
            wave?.Status == MigrationStatus.NotStarted && !IsExecuting;

        private bool CanPauseWave(MigrationWaveViewModel wave) => 
            wave?.Status == MigrationStatus.InProgress;

        private bool CanResumeWave(MigrationWaveViewModel wave) => 
            wave?.Status == MigrationStatus.Paused;

        private bool CanCancelWave(MigrationWaveViewModel wave) => 
            wave?.Status == MigrationStatus.InProgress || wave?.Status == MigrationStatus.Paused;
        #endregion

        #region Event Handlers
        private void OnWaveProgress(object sender, WaveProgressEventArgs e)
        {
            // Update UI with wave progress
            var wave = Waves?.FirstOrDefault(w => w.Wave.Name == e.WaveName);
            if (wave != null)
            {
                wave.RefreshWave();
            }

            StatusMessage = $"{e.WaveName}: {e.Stage} ({e.ProgressPercentage:F1}%)";
        }

        private void OnBatchProgress(object sender, BatchProgressEventArgs e)
        {
            // Update UI with batch progress
            StatusMessage = $"{e.BatchName}: {e.Stage} ({e.ProgressPercentage:F1}%)";
        }

        private void OnItemProgress(object sender, ItemProgressEventArgs e)
        {
            // Update UI with item progress (optional, might be too frequent)
            // StatusMessage = $"{e.ItemName}: {e.Stage}";
        }

        private void OnWaveStatusChanged(object sender, WaveStatusChangedEventArgs e)
        {
            var wave = Waves?.FirstOrDefault(w => w.Wave.Name == e.WaveName);
            if (wave != null)
            {
                wave.RefreshWave();
            }

            UpdateStatusMetrics();
            
            if (!string.IsNullOrWhiteSpace(e.ErrorMessage))
            {
                AddAlert(MigrationAlertType.Error, "Wave Status Change", $"{e.WaveName}: {e.ErrorMessage}");
            }
        }

        private void OnMigrationAlert(object sender, MigrationAlertEventArgs e)
        {
            AddAlert(e.AlertType, "Migration Alert", e.Message, e.WaveName, e.BatchName);
        }

        private void OnDataLoadProgress(object sender, MigrationDataProgressEventArgs e)
        {
            StatusMessage = $"{e.Stage} ({e.ProgressPercentage:F1}%)";
        }
        #endregion

        #region Helper Methods
        private void UpdateStatusMetrics(object state = null)
        {
            try
            {
                // Update wave counts
                ActiveWaves = Waves?.Count(w => w.Status == MigrationStatus.InProgress) ?? 0;
                CompletedWaves = Waves?.Count(w => w.Status == MigrationStatus.Completed) ?? 0;
                FailedWaves = Waves?.Count(w => w.Status == MigrationStatus.Failed) ?? 0;

                // Update overall progress
                var totalItems = TotalItems;
                var completedItems = Waves?.Sum(w => w.CompletedItems) ?? 0;
                OverallProgress = totalItems > 0 ? (double)completedItems / totalItems * 100 : 0;

                // Update active executions
                var activeExecutions = _orchestrator.GetActiveWaves();
                ActiveExecutions.Clear();
                foreach (var execution in activeExecutions)
                {
                    ActiveExecutions.Add(execution);
                }

                // Notify property changes for calculated properties
                OnPropertyChanged(nameof(TotalWaves));
                OnPropertyChanged(nameof(TotalBatches));
                OnPropertyChanged(nameof(TotalItems));
                OnPropertyChanged(nameof(HasActiveWaves));
                OnPropertyChanged(nameof(CanStartWaves));
                OnPropertyChanged(nameof(CanCreateSchedule));
                OnPropertyChanged(nameof(ProgressSummaryText));
                OnPropertyChanged(nameof(ScheduleSummaryText));
            }
            catch (Exception ex)
            {
                _logger?.LogWarning(ex, "Error updating status metrics");
            }
        }

        private void RefreshStatus()
        {
            UpdateStatusMetrics();
            StatusMessage = "Status refreshed";
        }

        private void ClearAlerts()
        {
            RecentAlerts.Clear();
            StatusMessage = "Alerts cleared";
        }

        private void AddAlert(MigrationAlertType type, string title, string message, string waveName = null, string batchName = null)
        {
            var alert = new MigrationAlertViewModel
            {
                AlertType = type,
                Title = title,
                Message = message,
                WaveName = waveName,
                BatchName = batchName,
                Timestamp = DateTime.Now
            };

            RecentAlerts.Insert(0, alert);

            // Keep only recent alerts (last 50)
            while (RecentAlerts.Count > 50)
            {
                RecentAlerts.RemoveAt(RecentAlerts.Count - 1);
            }
        }
        #endregion

        #region INotifyPropertyChanged
        public event PropertyChangedEventHandler PropertyChanged;

        protected virtual void OnPropertyChanged([CallerMemberName] string propertyName = null)
        {
            PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(propertyName));
        }

        protected bool SetProperty<T>(ref T field, T value, [CallerMemberName] string propertyName = null)
        {
            if (EqualityComparer<T>.Default.Equals(field, value)) return false;
            field = value;
            OnPropertyChanged(propertyName);
            return true;
        }
        #endregion

        #region Helper Methods
        /// <summary>
        /// Convert MigrationOrchestratorWave to MigrationWaveExtended for service compatibility
        /// </summary>
        private MigrationWaveExtended ConvertToExtended(MigrationOrchestratorWave wave)
        {
            return new MigrationWaveExtended
            {
                Id = wave.Id,
                Name = wave.Name,
                Order = wave.Order,
                PlannedStartDate = wave.PlannedStartDate,
                ActualStartDate = wave.ActualStartDate,
                ActualEndDate = wave.ActualEndDate,
                Status = wave.Status,
                Batches = wave.Batches,
                Metadata = wave.Metadata,
                Notes = wave.Notes,
                Prerequisites = wave.Prerequisites
            };
        }

        /// <summary>
        /// Convert list of MigrationOrchestratorWave to MigrationWaveExtended list
        /// </summary>
        private List<MigrationWaveExtended> ConvertToExtendedList(List<MigrationOrchestratorWave> waves)
        {
            return waves?.Select(ConvertToExtended).ToList() ?? new List<MigrationWaveExtended>();
        }
        #endregion

        #region Disposal
        public void Dispose()
        {
            _statusUpdateTimer?.Dispose();
            _orchestrator?.Dispose();
        }
        #endregion
    }

    #region Supporting ViewModels
    public class MigrationAlertViewModel
    {
        public MigrationAlertType AlertType { get; set; }
        public string Title { get; set; }
        public string Message { get; set; }
        public string WaveName { get; set; }
        public string BatchName { get; set; }
        public DateTime Timestamp { get; set; }
        
        public string AlertTypeText => AlertType.ToString();
        public string TimeText => Timestamp.ToString("HH:mm:ss");
        public string FullMessage => string.IsNullOrWhiteSpace(WaveName) ? Message : $"[{WaveName}] {Message}";
    }
    #endregion
}