using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using MandADiscoverySuite.Models;
using System.Timers;
using Timer = System.Timers.Timer;

namespace MandADiscoverySuite.Services
{
    /// <summary>
    /// Enterprise migration scheduler service with timer-based wave execution, dependency resolution,
    /// and comprehensive scheduling capabilities including blackout windows and concurrency control.
    /// Implements T-033 Migration Scheduling and Notification System requirements.
    /// </summary>
    public class MigrationSchedulerService : IDisposable
    {
        #region Private Fields
        
        private readonly ILogger<MigrationSchedulerService> _logger;
        private readonly MigrationScheduler _baseScheduler;
        private readonly Timer _schedulerTimer;
        private readonly ConcurrentDictionary<string, ScheduledWave> _scheduledWaves;
        private readonly ConcurrentDictionary<string, Timer> _waveTimers;
        private readonly SemaphoreSlim _concurrencySemaphore;
        private readonly object _scheduleLock = new object();
        
        private SchedulerConfiguration _configuration;
        private bool _isRunning;
        private bool _disposed;

        #endregion

        #region Events

        public event EventHandler<WaveScheduledEventArgs> WaveScheduled;
        public event EventHandler<WaveStartedEventArgs> WaveStarted;
        public event EventHandler<WaveCompletedEventArgs> WaveCompleted;
        public event EventHandler<WaveFailedEventArgs> WaveFailed;
        public event EventHandler<BlackoutPeriodActiveEventArgs> BlackoutPeriodActive;
        public event EventHandler<SchedulerStatusChangedEventArgs> SchedulerStatusChanged;

        #endregion

        #region Constructor

        public MigrationSchedulerService(
            MigrationScheduler baseScheduler = null,
            ILogger<MigrationSchedulerService> logger = null)
        {
            _logger = logger;
            _baseScheduler = baseScheduler ?? new MigrationScheduler(_logger);
            _scheduledWaves = new ConcurrentDictionary<string, ScheduledWave>();
            _waveTimers = new ConcurrentDictionary<string, Timer>();
            
            // Initialize configuration with defaults
            _configuration = new SchedulerConfiguration();
            _concurrencySemaphore = new SemaphoreSlim(_configuration.MaxConcurrentWaves);
            
            // Initialize main scheduler timer (checks every minute)
            _schedulerTimer = new Timer(60000); // 60 seconds
            _schedulerTimer.Elapsed += OnSchedulerTimerElapsed;
            _schedulerTimer.AutoReset = true;
            
            _logger?.LogInformation("MigrationSchedulerService initialized with max concurrent waves: {MaxConcurrentWaves}", 
                _configuration.MaxConcurrentWaves);
        }

        #endregion

        #region Public Properties

        public SchedulerConfiguration Configuration 
        { 
            get => _configuration; 
            set 
            { 
                _configuration = value ?? throw new ArgumentNullException(nameof(value));
                UpdateConcurrencyLimit();
            } 
        }

        public bool IsRunning => _isRunning;
        
        public int ActiveWaveCount => _scheduledWaves.Values.Count(w => w.Status == ScheduledWaveStatus.InProgress);
        
        public int ScheduledWaveCount => _scheduledWaves.Values.Count(w => w.Status == ScheduledWaveStatus.Scheduled);
        
        public int TotalScheduledWaves => _scheduledWaves.Count;

        public IReadOnlyCollection<ScheduledWave> GetScheduledWaves() => _scheduledWaves.Values.ToList().AsReadOnly();

        #endregion

        #region Public Methods

        /// <summary>
        /// Starts the scheduler service
        /// </summary>
        public async Task StartAsync()
        {
            if (_isRunning)
            {
                _logger?.LogWarning("Scheduler is already running");
                return;
            }

            try
            {
                _isRunning = true;
                _schedulerTimer.Start();
                
                _logger?.LogInformation("Migration scheduler service started");
                OnSchedulerStatusChanged(new SchedulerStatusChangedEventArgs { IsRunning = true, Message = "Scheduler started" });
                
                // Check for any waves that should have already started
                await CheckPendingWaves();
            }
            catch (Exception ex)
            {
                _isRunning = false;
                _logger?.LogError(ex, "Failed to start migration scheduler service");
                throw;
            }
        }

        /// <summary>
        /// Stops the scheduler service
        /// </summary>
        public async Task StopAsync()
        {
            if (!_isRunning)
            {
                _logger?.LogWarning("Scheduler is not running");
                return;
            }

            try
            {
                _isRunning = false;
                _schedulerTimer.Stop();
                
                // Stop all wave timers
                var timerTasks = _waveTimers.Values.Select(timer => Task.Run(() => timer.Stop())).ToArray();
                await Task.WhenAll(timerTasks);
                
                _logger?.LogInformation("Migration scheduler service stopped");
                OnSchedulerStatusChanged(new SchedulerStatusChangedEventArgs { IsRunning = false, Message = "Scheduler stopped" });
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error stopping migration scheduler service");
                throw;
            }
        }

        /// <summary>
        /// Schedules a migration wave for execution at a specific time
        /// </summary>
        public async Task<ScheduleWaveResult> ScheduleWaveAsync(
            MigrationWaveExtended wave, 
            ScheduleWaveOptions options)
        {
            var result = new ScheduleWaveResult { WaveId = wave.Id };
            
            try
            {
                if (wave == null)
                {
                    result.Success = false;
                    result.ErrorMessage = "Wave cannot be null";
                    return result;
                }

                // Validate scheduling options
                var validationResult = ValidateScheduleOptions(options);
                if (!validationResult.IsValid)
                {
                    result.Success = false;
                    result.ErrorMessage = string.Join("; ", validationResult.Errors);
                    return result;
                }

                // Check for blackout periods
                if (IsInBlackoutPeriod(options.ScheduledStartTime))
                {
                    result.Success = false;
                    result.ErrorMessage = $"Scheduled time {options.ScheduledStartTime} falls within a blackout period";
                    return result;
                }

                lock (_scheduleLock)
                {
                    // Check if wave is already scheduled
                    if (_scheduledWaves.ContainsKey(wave.Id))
                    {
                        result.Success = false;
                        result.ErrorMessage = $"Wave {wave.Id} is already scheduled";
                        return result;
                    }

                    // Create scheduled wave
                    var scheduledWave = new ScheduledWave
                    {
                        Id = wave.Id,
                        Wave = wave,
                        Options = options,
                        Status = ScheduledWaveStatus.Scheduled,
                        ScheduledTime = options.ScheduledStartTime,
                        CreatedAt = DateTime.Now,
                        Dependencies = options.Dependencies?.ToList() ?? new List<string>()
                    };

                    // Add to scheduled waves
                    _scheduledWaves.TryAdd(wave.Id, scheduledWave);

                    // Setup timer for this wave
                    SetupWaveTimer(scheduledWave);

                    result.Success = true;
                    result.ScheduledTime = options.ScheduledStartTime;
                    
                    _logger?.LogInformation("Scheduled wave {WaveId} for execution at {ScheduledTime}", 
                        wave.Id, options.ScheduledStartTime);
                    
                    OnWaveScheduled(new WaveScheduledEventArgs { Wave = scheduledWave });
                }

                return result;
            }
            catch (Exception ex)
            {
                result.Success = false;
                result.ErrorMessage = ex.Message;
                _logger?.LogError(ex, "Error scheduling wave {WaveId}", wave?.Id);
                return result;
            }
        }

        /// <summary>
        /// Cancels a scheduled wave
        /// </summary>
        public async Task<bool> CancelScheduledWaveAsync(string waveId)
        {
            try
            {
                if (_scheduledWaves.TryRemove(waveId, out var scheduledWave))
                {
                    // Stop the associated timer
                    if (_waveTimers.TryRemove(waveId, out var timer))
                    {
                        timer.Stop();
                        timer.Dispose();
                    }

                    scheduledWave.Status = ScheduledWaveStatus.Cancelled;
                    scheduledWave.CompletedAt = DateTime.Now;
                    
                    _logger?.LogInformation("Cancelled scheduled wave {WaveId}", waveId);
                    return true;
                }

                _logger?.LogWarning("Attempted to cancel non-existent wave {WaveId}", waveId);
                return false;
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error cancelling scheduled wave {WaveId}", waveId);
                return false;
            }
        }

        /// <summary>
        /// Updates the schedule for an existing wave
        /// </summary>
        public async Task<ScheduleWaveResult> RescheduleWaveAsync(
            string waveId, 
            DateTime newScheduledTime, 
            ScheduleWaveOptions newOptions = null)
        {
            var result = new ScheduleWaveResult { WaveId = waveId };

            try
            {
                if (!_scheduledWaves.TryGetValue(waveId, out var scheduledWave))
                {
                    result.Success = false;
                    result.ErrorMessage = $"Wave {waveId} not found";
                    return result;
                }

                if (scheduledWave.Status != ScheduledWaveStatus.Scheduled)
                {
                    result.Success = false;
                    result.ErrorMessage = $"Wave {waveId} cannot be rescheduled (status: {scheduledWave.Status})";
                    return result;
                }

                // Check for blackout periods
                if (IsInBlackoutPeriod(newScheduledTime))
                {
                    result.Success = false;
                    result.ErrorMessage = $"New scheduled time {newScheduledTime} falls within a blackout period";
                    return result;
                }

                lock (_scheduleLock)
                {
                    // Update scheduled time and options
                    scheduledWave.ScheduledTime = newScheduledTime;
                    if (newOptions != null)
                    {
                        scheduledWave.Options = newOptions;
                    }
                    scheduledWave.UpdatedAt = DateTime.Now;

                    // Update timer
                    if (_waveTimers.TryGetValue(waveId, out var existingTimer))
                    {
                        existingTimer.Stop();
                        existingTimer.Dispose();
                        _waveTimers.TryRemove(waveId, out _);
                    }

                    SetupWaveTimer(scheduledWave);

                    result.Success = true;
                    result.ScheduledTime = newScheduledTime;
                    
                    _logger?.LogInformation("Rescheduled wave {WaveId} to {NewScheduledTime}", 
                        waveId, newScheduledTime);
                }

                return result;
            }
            catch (Exception ex)
            {
                result.Success = false;
                result.ErrorMessage = ex.Message;
                _logger?.LogError(ex, "Error rescheduling wave {WaveId}", waveId);
                return result;
            }
        }

        /// <summary>
        /// Gets the status of a scheduled wave
        /// </summary>
        public ScheduledWave GetScheduledWaveStatus(string waveId)
        {
            _scheduledWaves.TryGetValue(waveId, out var scheduledWave);
            return scheduledWave;
        }

        /// <summary>
        /// Adds a blackout period during which no waves will be started
        /// </summary>
        public void AddBlackoutPeriod(BlackoutPeriod period)
        {
            if (period == null)
                throw new ArgumentNullException(nameof(period));

            _configuration.BlackoutPeriods.Add(period);
            _logger?.LogInformation("Added blackout period: {StartTime} to {EndTime} - {Description}", 
                period.StartTime, period.EndTime, period.Description);
        }

        /// <summary>
        /// Removes a blackout period
        /// </summary>
        public bool RemoveBlackoutPeriod(string periodId)
        {
            var period = _configuration.BlackoutPeriods.FirstOrDefault(p => p.Id == periodId);
            if (period != null)
            {
                _configuration.BlackoutPeriods.Remove(period);
                _logger?.LogInformation("Removed blackout period: {PeriodId}", periodId);
                return true;
            }
            return false;
        }

        /// <summary>
        /// Creates an optimized schedule for multiple waves with dependencies
        /// </summary>
        public async Task<BatchScheduleResult> ScheduleMultipleWavesAsync(
            List<MigrationWaveExtended> waves,
            BatchScheduleOptions options)
        {
            var result = new BatchScheduleResult();
            
            try
            {
                if (!waves?.Any() == true)
                {
                    result.Success = false;
                    result.ErrorMessage = "No waves provided for scheduling";
                    return result;
                }

                // Create schedule using base scheduler
                var items = ExtractItemsFromWaves(waves);
                var scheduleOptions = CreateSchedulingOptions(options);
                var scheduleResult = await _baseScheduler.CreateScheduleAsync(items, scheduleOptions);

                if (!scheduleResult.IsSuccess)
                {
                    result.Success = false;
                    result.ErrorMessage = string.Join("; ", scheduleResult.Errors);
                    return result;
                }

                // Schedule each wave individually
                var scheduledWaves = new List<ScheduledWave>();
                var currentTime = options.EarliestStartTime;

                foreach (var wave in scheduleResult.Waves)
                {
                    // Ensure scheduling respects blackout periods
                    while (IsInBlackoutPeriod(currentTime))
                    {
                        currentTime = GetNextAvailableTime(currentTime);
                    }

                    var waveOptions = new ScheduleWaveOptions
                    {
                        ScheduledStartTime = currentTime,
                        MaxConcurrentTasks = options.MaxConcurrentTasks,
                        RetryCount = options.RetryCount,
                        RetryDelayMinutes = options.RetryDelayMinutes,
                        Dependencies = ExtractDependencies(wave)
                    };

                    var scheduleWaveResult = await ScheduleWaveAsync(wave, waveOptions);
                    if (scheduleWaveResult.Success)
                    {
                        scheduledWaves.Add(_scheduledWaves[wave.Id]);
                        currentTime = currentTime.Add(options.WaveInterval);
                    }
                    else
                    {
                        result.FailedWaves.Add(new FailedWaveSchedule 
                        { 
                            WaveId = wave.Id, 
                            ErrorMessage = scheduleWaveResult.ErrorMessage 
                        });
                    }
                }

                result.Success = true;
                result.ScheduledWaves = scheduledWaves;
                result.TotalScheduled = scheduledWaves.Count;
                result.EstimatedCompletionTime = currentTime;

                _logger?.LogInformation("Batch scheduled {ScheduledCount} of {TotalCount} waves", 
                    scheduledWaves.Count, waves.Count);

                return result;
            }
            catch (Exception ex)
            {
                result.Success = false;
                result.ErrorMessage = ex.Message;
                _logger?.LogError(ex, "Error in batch wave scheduling");
                return result;
            }
        }

        #endregion

        #region Private Methods

        private void OnSchedulerTimerElapsed(object sender, ElapsedEventArgs e)
        {
            if (!_isRunning)
                return;

            try
            {
                _ = Task.Run(async () => await CheckPendingWaves());
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error in scheduler timer elapsed handler");
            }
        }

        private async Task CheckPendingWaves()
        {
            try
            {
                var now = DateTime.Now;
                var wavesToStart = new List<ScheduledWave>();

                // Find waves that should start now
                foreach (var kvp in _scheduledWaves)
                {
                    var scheduledWave = kvp.Value;
                    if (scheduledWave.Status == ScheduledWaveStatus.Scheduled && 
                        scheduledWave.ScheduledTime <= now)
                    {
                        // Check if dependencies are satisfied
                        if (AreDependenciesSatisfied(scheduledWave))
                        {
                            // Check if we're in a blackout period
                            if (!IsInBlackoutPeriod(now))
                            {
                                wavesToStart.Add(scheduledWave);
                            }
                            else
                            {
                                OnBlackoutPeriodActive(new BlackoutPeriodActiveEventArgs 
                                { 
                                    WaveId = scheduledWave.Id,
                                    ScheduledTime = scheduledWave.ScheduledTime,
                                    Message = "Wave start delayed due to blackout period"
                                });
                            }
                        }
                    }
                }

                // Start waves (respecting concurrency limits)
                foreach (var wave in wavesToStart)
                {
                    if (ActiveWaveCount >= _configuration.MaxConcurrentWaves)
                    {
                        _logger?.LogInformation("Concurrency limit reached, wave {WaveId} will wait", wave.Id);
                        break;
                    }

                    await StartWaveAsync(wave);
                }
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error checking pending waves");
            }
        }

        private async Task StartWaveAsync(ScheduledWave scheduledWave)
        {
            try
            {
                // Acquire concurrency semaphore
                await _concurrencySemaphore.WaitAsync();

                try
                {
                    scheduledWave.Status = ScheduledWaveStatus.InProgress;
                    scheduledWave.ActualStartTime = DateTime.Now;

                    _logger?.LogInformation("Starting wave {WaveId} (scheduled: {ScheduledTime}, actual: {ActualTime})",
                        scheduledWave.Id, scheduledWave.ScheduledTime, scheduledWave.ActualStartTime);

                    OnWaveStarted(new WaveStartedEventArgs 
                    { 
                        Wave = scheduledWave,
                        ScheduledTime = scheduledWave.ScheduledTime,
                        ActualStartTime = scheduledWave.ActualStartTime.Value
                    });

                    // Execute the wave (this would integrate with the actual migration service)
                    var waveResult = await ExecuteWaveAsync(scheduledWave);

                    // Update status based on result
                    if (waveResult.Success)
                    {
                        scheduledWave.Status = ScheduledWaveStatus.Completed;
                        scheduledWave.CompletedAt = DateTime.Now;
                        OnWaveCompleted(new WaveCompletedEventArgs 
                        { 
                            Wave = scheduledWave,
                            Result = waveResult
                        });
                    }
                    else
                    {
                        scheduledWave.Status = ScheduledWaveStatus.Failed;
                        scheduledWave.CompletedAt = DateTime.Now;
                        scheduledWave.ErrorMessage = waveResult.ErrorMessage;
                        OnWaveFailed(new WaveFailedEventArgs 
                        { 
                            Wave = scheduledWave,
                            Error = waveResult.ErrorMessage
                        });

                        // Handle retries
                        if (scheduledWave.RetryCount < scheduledWave.Options.RetryCount)
                        {
                            await ScheduleRetryAsync(scheduledWave);
                        }
                    }
                }
                finally
                {
                    _concurrencySemaphore.Release();
                }
            }
            catch (Exception ex)
            {
                scheduledWave.Status = ScheduledWaveStatus.Failed;
                scheduledWave.CompletedAt = DateTime.Now;
                scheduledWave.ErrorMessage = ex.Message;
                
                _logger?.LogError(ex, "Error starting wave {WaveId}", scheduledWave.Id);
                
                OnWaveFailed(new WaveFailedEventArgs 
                { 
                    Wave = scheduledWave,
                    Error = ex.Message
                });

                _concurrencySemaphore.Release();
            }
        }

        private async Task<WaveExecutionResult> ExecuteWaveAsync(ScheduledWave scheduledWave)
        {
            // This is a placeholder for the actual wave execution logic
            // In a real implementation, this would integrate with MigrationService
            // and handle the actual migration operations
            
            try
            {
                await Task.Delay(1000); // Simulate execution time
                
                return new WaveExecutionResult 
                { 
                    Success = true,
                    Message = "Wave executed successfully"
                };
            }
            catch (Exception ex)
            {
                return new WaveExecutionResult 
                { 
                    Success = false,
                    ErrorMessage = ex.Message
                };
            }
        }

        private async Task ScheduleRetryAsync(ScheduledWave scheduledWave)
        {
            try
            {
                scheduledWave.RetryCount++;
                var retryTime = DateTime.Now.AddMinutes(scheduledWave.Options.RetryDelayMinutes);
                
                // Reschedule the wave
                scheduledWave.ScheduledTime = retryTime;
                scheduledWave.Status = ScheduledWaveStatus.Scheduled;
                scheduledWave.ErrorMessage = null;
                
                SetupWaveTimer(scheduledWave);
                
                _logger?.LogInformation("Scheduled retry #{RetryCount} for wave {WaveId} at {RetryTime}", 
                    scheduledWave.RetryCount, scheduledWave.Id, retryTime);
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error scheduling retry for wave {WaveId}", scheduledWave.Id);
            }
        }

        private void SetupWaveTimer(ScheduledWave scheduledWave)
        {
            try
            {
                var timeUntilStart = scheduledWave.ScheduledTime - DateTime.Now;
                if (timeUntilStart.TotalMilliseconds <= 0)
                {
                    // Wave should start immediately, don't create a timer
                    return;
                }

                var timer = new Timer(timeUntilStart.TotalMilliseconds);
                timer.AutoReset = false;
                timer.Elapsed += async (sender, e) =>
                {
                    try
                    {
                        await StartWaveAsync(scheduledWave);
                        
                        // Clean up timer
                        if (_waveTimers.TryRemove(scheduledWave.Id, out var timerToDispose))
                        {
                            timerToDispose.Dispose();
                        }
                    }
                    catch (Exception ex)
                    {
                        _logger?.LogError(ex, "Error in wave timer callback for {WaveId}", scheduledWave.Id);
                    }
                };

                _waveTimers.AddOrUpdate(scheduledWave.Id, timer, (key, oldTimer) =>
                {
                    oldTimer?.Stop();
                    oldTimer?.Dispose();
                    return timer;
                });

                timer.Start();
                
                _logger?.LogDebug("Set up timer for wave {WaveId} to start in {TimeUntilStart}", 
                    scheduledWave.Id, timeUntilStart);
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error setting up wave timer for {WaveId}", scheduledWave.Id);
            }
        }

        private ScheduleValidationResult ValidateScheduleOptions(ScheduleWaveOptions options)
        {
            var result = new ScheduleValidationResult { IsValid = true };

            if (options == null)
            {
                result.IsValid = false;
                result.Errors.Add("Schedule options cannot be null");
                return result;
            }

            if (options.ScheduledStartTime <= DateTime.Now)
            {
                result.IsValid = false;
                result.Errors.Add("Scheduled start time must be in the future");
            }

            if (options.MaxConcurrentTasks <= 0)
            {
                result.IsValid = false;
                result.Errors.Add("Max concurrent tasks must be greater than 0");
            }

            if (options.RetryCount < 0)
            {
                result.IsValid = false;
                result.Errors.Add("Retry count cannot be negative");
            }

            if (options.RetryDelayMinutes < 0)
            {
                result.IsValid = false;
                result.Errors.Add("Retry delay cannot be negative");
            }

            return result;
        }

        private bool IsInBlackoutPeriod(DateTime dateTime)
        {
            return _configuration.BlackoutPeriods.Any(period => 
                dateTime >= period.StartTime && dateTime <= period.EndTime);
        }

        private DateTime GetNextAvailableTime(DateTime fromTime)
        {
            var nextTime = fromTime;
            
            // Check each blackout period and move past it
            while (IsInBlackoutPeriod(nextTime))
            {
                var blockingPeriod = _configuration.BlackoutPeriods
                    .Where(p => nextTime >= p.StartTime && nextTime <= p.EndTime)
                    .OrderBy(p => p.EndTime)
                    .FirstOrDefault();
                
                if (blockingPeriod != null)
                {
                    nextTime = blockingPeriod.EndTime.AddMinutes(1);
                }
                else
                {
                    nextTime = nextTime.AddHours(1); // Fallback
                }
            }

            return nextTime;
        }

        private bool AreDependenciesSatisfied(ScheduledWave scheduledWave)
        {
            if (scheduledWave.Dependencies?.Any() != true)
                return true;

            return scheduledWave.Dependencies.All(depId =>
            {
                if (_scheduledWaves.TryGetValue(depId, out var dependency))
                {
                    return dependency.Status == ScheduledWaveStatus.Completed;
                }
                return false; // Dependency not found means not satisfied
            });
        }

        private void UpdateConcurrencyLimit()
        {
            var newLimit = _configuration.MaxConcurrentWaves;
            var currentLimit = _concurrencySemaphore.CurrentCount + (ActiveWaveCount);
            
            if (newLimit != currentLimit)
            {
                _concurrencySemaphore?.Dispose();
                _concurrencySemaphore = new SemaphoreSlim(newLimit);
                
                _logger?.LogInformation("Updated concurrency limit from {OldLimit} to {NewLimit}", 
                    currentLimit, newLimit);
            }
        }

        private List<MigrationItem> ExtractItemsFromWaves(List<MigrationWaveExtended> waves)
        {
            var items = new List<MigrationItem>();
            
            foreach (var wave in waves)
            {
                if (wave.Batches?.Any() == true)
                {
                    foreach (var batch in wave.Batches)
                    {
                        if (batch.Items?.Any() == true)
                        {
                            items.AddRange(batch.Items);
                        }
                    }
                }
            }

            return items;
        }

        private SchedulingOptions CreateSchedulingOptions(BatchScheduleOptions batchOptions)
        {
            return new SchedulingOptions
            {
                EarliestStartDate = batchOptions.EarliestStartTime,
                MaxItemsPerBatch = batchOptions.MaxItemsPerBatch,
                MaxBatchesPerWave = batchOptions.MaxBatchesPerWave,
                MaxItemsPerWave = batchOptions.MaxItemsPerWave,
                ExcludeWeekends = batchOptions.ExcludeWeekends,
                WaveInterval = batchOptions.WaveInterval
            };
        }

        private List<string> ExtractDependencies(MigrationWaveExtended wave)
        {
            // Extract dependencies from wave metadata or prerequisites
            var dependencies = new List<string>();
            
            if (wave.Prerequisites?.Any() == true)
            {
                dependencies.AddRange(wave.Prerequisites);
            }

            return dependencies;
        }

        #endregion

        #region Event Handlers

        protected virtual void OnWaveScheduled(WaveScheduledEventArgs e)
        {
            WaveScheduled?.Invoke(this, e);
        }

        protected virtual void OnWaveStarted(WaveStartedEventArgs e)
        {
            WaveStarted?.Invoke(this, e);
        }

        protected virtual void OnWaveCompleted(WaveCompletedEventArgs e)
        {
            WaveCompleted?.Invoke(this, e);
        }

        protected virtual void OnWaveFailed(WaveFailedEventArgs e)
        {
            WaveFailed?.Invoke(this, e);
        }

        protected virtual void OnBlackoutPeriodActive(BlackoutPeriodActiveEventArgs e)
        {
            BlackoutPeriodActive?.Invoke(this, e);
        }

        protected virtual void OnSchedulerStatusChanged(SchedulerStatusChangedEventArgs e)
        {
            SchedulerStatusChanged?.Invoke(this, e);
        }

        #endregion

        #region IDisposable

        public void Dispose()
        {
            if (_disposed)
                return;

            try
            {
                _isRunning = false;
                _schedulerTimer?.Stop();
                _schedulerTimer?.Dispose();

                // Dispose all wave timers
                foreach (var timer in _waveTimers.Values)
                {
                    timer?.Stop();
                    timer?.Dispose();
                }
                _waveTimers.Clear();

                _concurrencySemaphore?.Dispose();
                
                _disposed = true;
                _logger?.LogInformation("MigrationSchedulerService disposed");
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error disposing MigrationSchedulerService");
            }
        }

        #endregion
    }

    #region Supporting Classes and Enums

    public class SchedulerConfiguration
    {
        public int MaxConcurrentWaves { get; set; } = 3;
        public List<BlackoutPeriod> BlackoutPeriods { get; set; } = new List<BlackoutPeriod>();
        public bool EnableRetries { get; set; } = true;
        public int DefaultRetryCount { get; set; } = 3;
        public int DefaultRetryDelayMinutes { get; set; } = 30;
    }

    public class BlackoutPeriod
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();
        public string Description { get; set; }
        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }
        public BlackoutType Type { get; set; }
        public bool IsRecurring { get; set; }
        public RecurrencePattern RecurrencePattern { get; set; }
    }

    public enum BlackoutType
    {
        MaintenanceWindow,
        BusinessHours,
        Holiday,
        Custom
    }

    public class RecurrencePattern
    {
        public RecurrenceType Type { get; set; }
        public int Interval { get; set; }
        public List<DayOfWeek> DaysOfWeek { get; set; } = new List<DayOfWeek>();
    }

    public enum RecurrenceType
    {
        None,
        Daily,
        Weekly,
        Monthly,
        Yearly
    }

    public class ScheduledWave
    {
        public string Id { get; set; }
        public MigrationWaveExtended Wave { get; set; }
        public ScheduleWaveOptions Options { get; set; }
        public ScheduledWaveStatus Status { get; set; }
        public DateTime ScheduledTime { get; set; }
        public DateTime? ActualStartTime { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public DateTime? CompletedAt { get; set; }
        public string ErrorMessage { get; set; }
        public int RetryCount { get; set; }
        public List<string> Dependencies { get; set; } = new List<string>();
    }

    public enum ScheduledWaveStatus
    {
        Scheduled,
        InProgress,
        Completed,
        Failed,
        Cancelled,
        WaitingForDependencies
    }

    public class ScheduleWaveOptions
    {
        public DateTime ScheduledStartTime { get; set; }
        public int MaxConcurrentTasks { get; set; } = 10;
        public int RetryCount { get; set; } = 3;
        public int RetryDelayMinutes { get; set; } = 30;
        public List<string> Dependencies { get; set; } = new List<string>();
        public bool SendNotifications { get; set; } = true;
        public NotificationSettings NotificationSettings { get; set; } = new NotificationSettings();
    }

    public class NotificationSettings
    {
        public bool SendPreMigrationNotifications { get; set; } = true;
        public bool SendPostMigrationNotifications { get; set; } = true;
        public int PreMigrationNotificationHours { get; set; } = 24;
        public List<string> NotificationRecipients { get; set; } = new List<string>();
    }

    public class BatchScheduleOptions
    {
        public DateTime EarliestStartTime { get; set; } = DateTime.Now.AddHours(1);
        public TimeSpan WaveInterval { get; set; } = TimeSpan.FromHours(4);
        public int MaxItemsPerBatch { get; set; } = 100;
        public int MaxBatchesPerWave { get; set; } = 5;
        public int MaxItemsPerWave { get; set; } = 500;
        public int MaxConcurrentTasks { get; set; } = 10;
        public int RetryCount { get; set; } = 3;
        public int RetryDelayMinutes { get; set; } = 30;
        public bool ExcludeWeekends { get; set; } = true;
    }

    public class ScheduleWaveResult
    {
        public string WaveId { get; set; }
        public bool Success { get; set; }
        public DateTime? ScheduledTime { get; set; }
        public string ErrorMessage { get; set; }
    }

    public class BatchScheduleResult
    {
        public bool Success { get; set; }
        public List<ScheduledWave> ScheduledWaves { get; set; } = new List<ScheduledWave>();
        public List<FailedWaveSchedule> FailedWaves { get; set; } = new List<FailedWaveSchedule>();
        public int TotalScheduled { get; set; }
        public DateTime? EstimatedCompletionTime { get; set; }
        public string ErrorMessage { get; set; }
    }

    public class FailedWaveSchedule
    {
        public string WaveId { get; set; }
        public string ErrorMessage { get; set; }
    }

    public class ScheduleValidationResult
    {
        public bool IsValid { get; set; }
        public List<string> Errors { get; set; } = new List<string>();
        public List<string> Warnings { get; set; } = new List<string>();
    }

    public class WaveExecutionResult
    {
        public bool Success { get; set; }
        public string Message { get; set; }
        public string ErrorMessage { get; set; }
        public DateTime ExecutionTime { get; set; } = DateTime.Now;
        public TimeSpan Duration { get; set; }
    }

    #region Event Args

    public class WaveScheduledEventArgs : EventArgs
    {
        public ScheduledWave Wave { get; set; }
    }

    public class WaveStartedEventArgs : EventArgs
    {
        public ScheduledWave Wave { get; set; }
        public DateTime ScheduledTime { get; set; }
        public DateTime ActualStartTime { get; set; }
    }

    public class WaveCompletedEventArgs : EventArgs
    {
        public ScheduledWave Wave { get; set; }
        public WaveExecutionResult Result { get; set; }
    }

    public class WaveFailedEventArgs : EventArgs
    {
        public ScheduledWave Wave { get; set; }
        public string Error { get; set; }
    }

    public class BlackoutPeriodActiveEventArgs : EventArgs
    {
        public string WaveId { get; set; }
        public DateTime ScheduledTime { get; set; }
        public string Message { get; set; }
    }

    public class SchedulerStatusChangedEventArgs : EventArgs
    {
        public bool IsRunning { get; set; }
        public string Message { get; set; }
    }

    #endregion

    #endregion
}