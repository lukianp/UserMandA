using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using MandADiscoverySuite.Models;

namespace MandADiscoverySuite.Services
{
    /// <summary>
    /// Master orchestration engine for coordinating multiple concurrent migrations
    /// </summary>
    public class MigrationOrchestrationEngine : IDisposable
    {
        private readonly ILogger<MigrationOrchestrationEngine> _logger;
        private readonly MigrationWaveOrchestrator _waveOrchestrator;
        private readonly MigrationStateService _stateService;
        private readonly MigrationErrorHandler _errorHandler;
        private readonly PowerShellExecutionService _powerShellService;
        private readonly CredentialStorageService _credentialService;
        
        private readonly ConcurrentDictionary<string, OrchestrationSession> _activeSessions;
        private readonly SemaphoreSlim _orchestrationLock;
        private readonly Timer _coordinationTimer;
        private readonly CancellationTokenSource _globalCancellation;
        private bool _disposed = false;

        public event EventHandler<SessionStartedEventArgs> SessionStarted;
        public event EventHandler<SessionProgressEventArgs> SessionProgress;
        public event EventHandler<SessionCompletedEventArgs> SessionCompleted;
        public event EventHandler<ResourceAllocationEventArgs> ResourceAllocated;
        public event EventHandler<ConflictDetectedEventArgs> ConflictDetected;

        public MigrationOrchestrationEngine(
            ILogger<MigrationOrchestrationEngine> logger = null,
            MigrationWaveOrchestrator waveOrchestrator = null,
            MigrationStateService stateService = null,
            MigrationErrorHandler errorHandler = null,
            PowerShellExecutionService powerShellService = null,
            CredentialStorageService credentialService = null)
        {
            _logger = logger;
            _waveOrchestrator = waveOrchestrator ?? new MigrationWaveOrchestrator(null);
            _stateService = stateService ?? new MigrationStateService(null);
            _errorHandler = errorHandler ?? new MigrationErrorHandler(null);
            _powerShellService = powerShellService ?? new PowerShellExecutionService(logger: null);
            _credentialService = credentialService ?? new CredentialStorageService(null);
            
            _activeSessions = new ConcurrentDictionary<string, OrchestrationSession>();
            _orchestrationLock = new SemaphoreSlim(1, 1);
            _globalCancellation = new CancellationTokenSource();
            
            // Coordination timer for managing cross-session dependencies and resource allocation
            _coordinationTimer = new Timer(
                CoordinateActiveSessions, 
                null, 
                TimeSpan.FromSeconds(10), 
                TimeSpan.FromSeconds(10));
            
            _logger?.LogInformation("Migration orchestration engine initialized");
        }

        /// <summary>
        /// Start orchestrated migration session for multiple companies/domains
        /// </summary>
        public async Task<string> StartOrchestrationSessionAsync(
            OrchestrationRequest request,
            CancellationToken cancellationToken = default)
        {
            var sessionId = Guid.NewGuid().ToString();
            
            try
            {
                await _orchestrationLock.WaitAsync(cancellationToken);

                // Validate orchestration request
                var validationResult = await ValidateOrchestrationRequestAsync(request);
                if (!validationResult.IsValid)
                {
                    throw new InvalidOperationException($"Invalid orchestration request: {string.Join(", ", validationResult.Errors)}");
                }

                // Create orchestration session
                var session = new OrchestrationSession
                {
                    SessionId = sessionId,
                    Request = request,
                    Status = OrchestrationStatus.Initializing,
                    StartedAt = DateTime.Now,
                    MigrationStates = new ConcurrentDictionary<string, string>(),
                    ResourceAllocations = new Dictionary<string, ResourceAllocation>(),
                    DependencyMap = BuildDependencyMap(request),
                    ExecutionPlan = await CreateExecutionPlanAsync(request)
                };

                _activeSessions[sessionId] = session;

                // Initialize state management for each migration
                foreach (var migration in request.Migrations)
                {
                    var stateId = await _stateService.CreateMigrationStateAsync(
                        migration.ProfileName,
                        migration.Wave,
                        migration.ExecutionOptions);
                    
                    session.MigrationStates[migration.Id] = stateId;
                }

                // Allocate resources based on execution plan
                await AllocateResourcesAsync(session);

                // Start execution according to plan
                session.Status = OrchestrationStatus.Running;
                _ = Task.Run(async () => await ExecuteOrchestrationSessionAsync(session), _globalCancellation.Token);

                OnSessionStarted(new SessionStartedEventArgs
                {
                    SessionId = sessionId,
                    TotalMigrations = request.Migrations.Count,
                    EstimatedDuration = session.ExecutionPlan.EstimatedTotalDuration,
                    StartedAt = DateTime.Now
                });

                _logger?.LogInformation($"Started orchestration session {sessionId} with {request.Migrations.Count} migrations");
                
                return sessionId;
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, $"Failed to start orchestration session");
                throw;
            }
            finally
            {
                _orchestrationLock.Release();
            }
        }

        /// <summary>
        /// Get orchestration session status
        /// </summary>
        public OrchestrationSessionStatus GetSessionStatus(string sessionId)
        {
            if (!_activeSessions.TryGetValue(sessionId, out var session))
            {
                return null;
            }

            var migrationStatuses = new Dictionary<string, MigrationProgressSummary>();
            foreach (var migration in session.MigrationStates)
            {
                var state = _stateService.GetMigrationState(migration.Value);
                if (state != null)
                {
                    migrationStatuses[migration.Key] = new MigrationProgressSummary
                    {
                        MigrationId = migration.Key,
                        Status = MapStateStatus(state.Status),
                        ProgressPercentage = state.Progress?.ProgressPercentage ?? 0,
                        CurrentStage = state.Progress?.Stage ?? "Unknown",
                        ErrorCount = state.ExecutionLog?.Count(l => l.Level == LogLevel.Error) ?? 0
                    };
                }
            }

            return new OrchestrationSessionStatus
            {
                SessionId = sessionId,
                Status = session.Status,
                StartedAt = session.StartedAt,
                CompletedAt = session.CompletedAt,
                OverallProgress = CalculateOverallProgress(migrationStatuses.Values),
                MigrationStatuses = migrationStatuses,
                ResourceAllocations = session.ResourceAllocations,
                ActiveConflicts = session.ActiveConflicts?.ToList() ?? new List<string>(),
                LastUpdated = DateTime.Now
            };
        }

        /// <summary>
        /// Pause orchestration session
        /// </summary>
        public async Task<bool> PauseSessionAsync(string sessionId)
        {
            if (!_activeSessions.TryGetValue(sessionId, out var session))
            {
                return false;
            }

            try
            {
                session.Status = OrchestrationStatus.Pausing;
                
                // Pause all active migrations
                var pauseTasks = session.MigrationStates.Values
                    .Select(stateId => PauseMigrationAsync(stateId))
                    .ToArray();
                
                await Task.WhenAll(pauseTasks);
                
                session.Status = OrchestrationStatus.Paused;
                session.PausedAt = DateTime.Now;
                
                _logger?.LogInformation($"Paused orchestration session {sessionId}");
                return true;
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, $"Failed to pause orchestration session {sessionId}");
                return false;
            }
        }

        /// <summary>
        /// Resume orchestration session
        /// </summary>
        public async Task<bool> ResumeSessionAsync(string sessionId)
        {
            if (!_activeSessions.TryGetValue(sessionId, out var session) || 
                session.Status != OrchestrationStatus.Paused)
            {
                return false;
            }

            try
            {
                session.Status = OrchestrationStatus.Running;
                session.ResumedAt = DateTime.Now;
                
                // Resume all paused migrations
                var resumeTasks = session.MigrationStates.Values
                    .Select(stateId => ResumeMigrationAsync(stateId))
                    .ToArray();
                
                await Task.WhenAll(resumeTasks);
                
                _logger?.LogInformation($"Resumed orchestration session {sessionId}");
                return true;
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, $"Failed to resume orchestration session {sessionId}");
                return false;
            }
        }

        /// <summary>
        /// Cancel orchestration session
        /// </summary>
        public async Task<bool> CancelSessionAsync(string sessionId)
        {
            if (!_activeSessions.TryGetValue(sessionId, out var session))
            {
                return false;
            }

            try
            {
                session.Status = OrchestrationStatus.Cancelling;
                
                // Cancel all active migrations
                var cancelTasks = session.MigrationStates.Values
                    .Select(stateId => CancelMigrationAsync(stateId))
                    .ToArray();
                
                await Task.WhenAll(cancelTasks);
                
                session.Status = OrchestrationStatus.Cancelled;
                session.CompletedAt = DateTime.Now;
                
                _activeSessions.TryRemove(sessionId, out _);
                
                _logger?.LogInformation($"Cancelled orchestration session {sessionId}");
                return true;
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, $"Failed to cancel orchestration session {sessionId}");
                return false;
            }
        }

        /// <summary>
        /// Get all active orchestration sessions
        /// </summary>
        public List<OrchestrationSessionSummary> GetActiveSessions()
        {
            return _activeSessions.Values
                .Where(s => s.Status == OrchestrationStatus.Running || 
                           s.Status == OrchestrationStatus.Paused)
                .Select(s => new OrchestrationSessionSummary
                {
                    SessionId = s.SessionId,
                    Status = s.Status,
                    TotalMigrations = s.Request.Migrations.Count,
                    CompletedMigrations = CountCompletedMigrations(s),
                    StartedAt = s.StartedAt,
                    EstimatedCompletion = CalculateEstimatedCompletion(s)
                })
                .ToList();
        }

        /// <summary>
        /// Execute orchestration session
        /// </summary>
        private async Task ExecuteOrchestrationSessionAsync(OrchestrationSession session)
        {
            try
            {
                _logger?.LogInformation($"Executing orchestration session {session.SessionId}");

                // Execute migrations according to execution plan
                foreach (var stage in session.ExecutionPlan.ExecutionStages)
                {
                    if (_globalCancellation.IsCancellationRequested || 
                        session.Status == OrchestrationStatus.Cancelling)
                    {
                        break;
                    }

                    // Wait for dependencies to complete
                    await WaitForDependenciesAsync(session, stage);

                    // Execute migrations in this stage (potentially in parallel)
                    var stageTasks = stage.Migrations
                        .Select(migrationId => ExecuteMigrationAsync(session, migrationId))
                        .ToArray();

                    await Task.WhenAll(stageTasks);

                    // Check for errors and handle accordingly
                    await HandleStageCompletionAsync(session, stage);
                }

                // Complete session
                session.Status = OrchestrationStatus.Completed;
                session.CompletedAt = DateTime.Now;

                OnSessionCompleted(new SessionCompletedEventArgs
                {
                    SessionId = session.SessionId,
                    Status = session.Status,
                    CompletedAt = session.CompletedAt.Value,
                    TotalDuration = session.CompletedAt.Value - session.StartedAt,
                    SuccessfulMigrations = CountSuccessfulMigrations(session),
                    FailedMigrations = CountFailedMigrations(session)
                });

                _logger?.LogInformation($"Completed orchestration session {session.SessionId}");
            }
            catch (Exception ex)
            {
                session.Status = OrchestrationStatus.Failed;
                session.CompletedAt = DateTime.Now;
                
                _logger?.LogError(ex, $"Orchestration session {session.SessionId} failed");
            }
            finally
            {
                // Clean up session resources
                await CleanupSessionAsync(session);
            }
        }

        /// <summary>
        /// Execute individual migration within orchestration context
        /// </summary>
        private async Task ExecuteMigrationAsync(OrchestrationSession session, string migrationId)
        {
            try
            {
                var migration = session.Request.Migrations.First(m => m.Id == migrationId);
                var stateId = session.MigrationStates[migrationId];

                // Update state to running
                await _stateService.ChangeStateStatusAsync(stateId, MigrationStateStatus.Running);

                // Execute wave using wave orchestrator
                var waveOptions = new WaveExecutionOptions
                {
                    MaxConcurrentItems = migration.ExecutionOptions?.MaxConcurrentItems ?? 5,
                    StopOnFirstError = false, // Default to continue on error for M&A scenarios
                    MigrationMode = "Standard"
                };
                
                var result = await _waveOrchestrator.StartWaveAsync(
                    migration.Wave,
                    waveOptions,
                    _globalCancellation.Token);

                if (result.IsSuccess)
                {
                    await _stateService.ChangeStateStatusAsync(stateId, MigrationStateStatus.Completed);
                }
                else
                {
                    await _stateService.ChangeStateStatusAsync(stateId, MigrationStateStatus.Failed);
                }

                _logger?.LogInformation($"Migration {migrationId} completed with result: {result.IsSuccess}");
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, $"Migration {migrationId} failed");
                
                var stateId = session.MigrationStates[migrationId];
                await _stateService.ChangeStateStatusAsync(stateId, MigrationStateStatus.Failed, ex.Message);
            }
        }

        /// <summary>
        /// Coordinate active sessions for resource management and conflict resolution
        /// </summary>
        private async void CoordinateActiveSessions(object state)
        {
            try
            {
                await _orchestrationLock.WaitAsync();

                var activeSessions = _activeSessions.Values
                    .Where(s => s.Status == OrchestrationStatus.Running)
                    .ToList();

                if (!activeSessions.Any()) return;

                // Check for resource conflicts
                await DetectAndResolveResourceConflictsAsync(activeSessions);

                // Update progress tracking
                await UpdateSessionProgressAsync(activeSessions);

                // Optimize resource allocation
                await OptimizeResourceAllocationAsync(activeSessions);

                _logger?.LogDebug($"Coordinated {activeSessions.Count} active sessions");
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error during session coordination");
            }
            finally
            {
                _orchestrationLock.Release();
            }
        }

        // Supporting methods for orchestration
        private async Task<MandADiscoverySuite.Migration.ValidationResult> ValidateOrchestrationRequestAsync(OrchestrationRequest request)
        {
            var result = new MandADiscoverySuite.Migration.ValidationResult();
            result.IsSuccess = true;

            if (request.Migrations?.Any() != true)
            {
                result.Errors.Add("No migrations specified in orchestration request");
            }

            // Validate each migration
            foreach (var migration in request.Migrations ?? new List<MigrationRequest>())
            {
                if (string.IsNullOrEmpty(migration.ProfileName))
                {
                    result.Errors.Add($"Migration {migration.Id} missing profile name");
                }

                if (migration.Wave?.Batches?.Any() != true)
                {
                    result.Errors.Add($"Migration {migration.Id} has no batches");
                }
            }

            // IsValid property is read-only and calculated based on errors
            // If there are errors, IsValid will be false

            return result;
        }

        private DependencyMap BuildDependencyMap(OrchestrationRequest request)
        {
            var dependencyMap = new DependencyMap();
            
            // Build cross-migration dependencies
            foreach (var migration in request.Migrations)
            {
                var dependencies = new List<string>();
                
                // Add explicit dependencies
                if (migration.DependsOn?.Any() == true)
                {
                    dependencies.AddRange(migration.DependsOn);
                }

                // Add implicit dependencies (e.g., infrastructure before users)
                var implicitDeps = InferImplicitDependencies(migration, request.Migrations);
                dependencies.AddRange(implicitDeps);

                dependencyMap.Dependencies[migration.Id] = dependencies;
            }

            return dependencyMap;
        }

        private async Task<ExecutionPlan> CreateExecutionPlanAsync(OrchestrationRequest request)
        {
            var plan = new ExecutionPlan();
            var dependencyMap = BuildDependencyMap(request);
            
            // Use topological sort to create execution stages
            var stages = TopologicalSort(request.Migrations, dependencyMap);
            plan.ExecutionStages = stages;
            plan.EstimatedTotalDuration = CalculatePlanDuration(stages, request);

            return plan;
        }

        // Placeholder implementations for complex operations
        private List<string> InferImplicitDependencies(MigrationRequest migration, List<MigrationRequest> allMigrations) => new();
        private List<ExecutionStage> TopologicalSort(List<MigrationRequest> migrations, DependencyMap dependencyMap) => new();
        private TimeSpan CalculatePlanDuration(List<ExecutionStage> stages, OrchestrationRequest request) => TimeSpan.FromHours(1);
        private async Task AllocateResourcesAsync(OrchestrationSession session) { }
        private async Task WaitForDependenciesAsync(OrchestrationSession session, ExecutionStage stage) { }
        private async Task HandleStageCompletionAsync(OrchestrationSession session, ExecutionStage stage) { }
        private async Task DetectAndResolveResourceConflictsAsync(List<OrchestrationSession> sessions) { }
        private async Task UpdateSessionProgressAsync(List<OrchestrationSession> sessions) { }
        private async Task OptimizeResourceAllocationAsync(List<OrchestrationSession> sessions) { }
        private async Task PauseMigrationAsync(string stateId) { }
        private async Task ResumeMigrationAsync(string stateId) { }
        private async Task CancelMigrationAsync(string stateId) { }
        private async Task CleanupSessionAsync(OrchestrationSession session) { }
        
        private MigrationStatus MapStateStatus(MigrationStateStatus status) => MigrationStatus.NotStarted;
        private double CalculateOverallProgress(IEnumerable<MigrationProgressSummary> statuses) => 0.0;
        private int CountCompletedMigrations(OrchestrationSession session) => 0;
        private int CountSuccessfulMigrations(OrchestrationSession session) => 0;
        private int CountFailedMigrations(OrchestrationSession session) => 0;
        private DateTime? CalculateEstimatedCompletion(OrchestrationSession session) => null;

        protected virtual void OnSessionStarted(SessionStartedEventArgs e) => SessionStarted?.Invoke(this, e);
        protected virtual void OnSessionProgress(SessionProgressEventArgs e) => SessionProgress?.Invoke(this, e);
        protected virtual void OnSessionCompleted(SessionCompletedEventArgs e) => SessionCompleted?.Invoke(this, e);
        protected virtual void OnResourceAllocated(ResourceAllocationEventArgs e) => ResourceAllocated?.Invoke(this, e);
        protected virtual void OnConflictDetected(ConflictDetectedEventArgs e) => ConflictDetected?.Invoke(this, e);

        public void Dispose()
        {
            if (_disposed) return;

            _coordinationTimer?.Dispose();
            _orchestrationLock?.Dispose();
            _globalCancellation?.Cancel();
            _globalCancellation?.Dispose();
            
            _waveOrchestrator?.Dispose();
            _stateService?.Dispose();
            _errorHandler?.Dispose();
            _powerShellService?.Dispose();
            _credentialService?.Dispose();

            _disposed = true;
            _logger?.LogInformation("Migration orchestration engine disposed");
        }
    }

    #region Supporting Classes

    public class OrchestrationRequest
    {
        public string RequestId { get; set; } = Guid.NewGuid().ToString();
        public string Description { get; set; }
        public List<MigrationRequest> Migrations { get; set; } = new();
        public OrchestrationOptions Options { get; set; } = new();
        public DateTime RequestedAt { get; set; } = DateTime.Now;
    }

    public class MigrationRequest
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();
        public string ProfileName { get; set; }
        public MigrationWaveExtended Wave { get; set; }
        public MigrationExecutionOptions ExecutionOptions { get; set; }
        public List<string> DependsOn { get; set; } = new();
        public int Priority { get; set; } = 0;
    }

    public class OrchestrationOptions
    {
        public int MaxConcurrentMigrations { get; set; } = 5;
        public bool AllowCrossMigrationDependencies { get; set; } = true;
        public bool EnableResourceOptimization { get; set; } = true;
        public bool EnableConflictDetection { get; set; } = true;
        public TimeSpan SessionTimeout { get; set; } = TimeSpan.FromHours(24);
    }

    public class OrchestrationSession
    {
        public string SessionId { get; set; }
        public OrchestrationRequest Request { get; set; }
        public OrchestrationStatus Status { get; set; }
        public DateTime StartedAt { get; set; }
        public DateTime? PausedAt { get; set; }
        public DateTime? ResumedAt { get; set; }
        public DateTime? CompletedAt { get; set; }
        public ConcurrentDictionary<string, string> MigrationStates { get; set; } = new();
        public Dictionary<string, ResourceAllocation> ResourceAllocations { get; set; } = new();
        public DependencyMap DependencyMap { get; set; }
        public ExecutionPlan ExecutionPlan { get; set; }
        public ConcurrentBag<string> ActiveConflicts { get; set; } = new();
    }

    public class DependencyMap
    {
        public Dictionary<string, List<string>> Dependencies { get; set; } = new();
    }

    public class ExecutionPlan
    {
        public List<ExecutionStage> ExecutionStages { get; set; } = new();
        public TimeSpan EstimatedTotalDuration { get; set; }
    }

    public class ExecutionStage
    {
        public int StageNumber { get; set; }
        public List<string> Migrations { get; set; } = new();
        public bool AllowParallelExecution { get; set; } = true;
        public List<string> Dependencies { get; set; } = new();
    }


    public class OrchestrationSessionStatus
    {
        public string SessionId { get; set; }
        public OrchestrationStatus Status { get; set; }
        public DateTime StartedAt { get; set; }
        public DateTime? CompletedAt { get; set; }
        public double OverallProgress { get; set; }
        public Dictionary<string, MigrationProgressSummary> MigrationStatuses { get; set; } = new();
        public Dictionary<string, ResourceAllocation> ResourceAllocations { get; set; } = new();
        public List<string> ActiveConflicts { get; set; } = new();
        public DateTime LastUpdated { get; set; }
    }

    public class MigrationProgressSummary
    {
        public string MigrationId { get; set; }
        public MigrationStatus Status { get; set; }
        public double ProgressPercentage { get; set; }
        public string CurrentStage { get; set; }
        public int ErrorCount { get; set; }
    }

    public class OrchestrationSessionSummary
    {
        public string SessionId { get; set; }
        public OrchestrationStatus Status { get; set; }
        public int TotalMigrations { get; set; }
        public int CompletedMigrations { get; set; }
        public DateTime StartedAt { get; set; }
        public DateTime? EstimatedCompletion { get; set; }
    }


    public enum OrchestrationStatus
    {
        Pending,
        Initializing,
        Running,
        Pausing,
        Paused,
        Cancelling,
        Cancelled,
        Completed,
        Failed
    }

    #endregion

    #region Event Args

    public class SessionStartedEventArgs : EventArgs
    {
        public string SessionId { get; set; }
        public int TotalMigrations { get; set; }
        public TimeSpan EstimatedDuration { get; set; }
        public DateTime StartedAt { get; set; }
    }

    public class SessionProgressEventArgs : EventArgs
    {
        public string SessionId { get; set; }
        public double OverallProgress { get; set; }
        public string CurrentStage { get; set; }
        public DateTime UpdatedAt { get; set; }
    }

    public class SessionCompletedEventArgs : EventArgs
    {
        public string SessionId { get; set; }
        public OrchestrationStatus Status { get; set; }
        public DateTime CompletedAt { get; set; }
        public TimeSpan TotalDuration { get; set; }
        public int SuccessfulMigrations { get; set; }
        public int FailedMigrations { get; set; }
        
        // Additional properties for ViewModel compatibility
        public bool Success => Status == OrchestrationStatus.Completed;
        public string ErrorMessage { get; set; }
        public DateTime StartTime { get; set; }
        public DateTime EndTime => CompletedAt;
        public int TotalItems { get; set; }
        public int CompletedItems => SuccessfulMigrations;
        public int FailedItems => FailedMigrations;
        public List<string> Errors { get; set; } = new List<string>();
    }

    public class ResourceAllocationEventArgs : EventArgs
    {
        public string SessionId { get; set; }
        public string ResourceType { get; set; }
        public string ResourceId { get; set; }
        public string AllocatedTo { get; set; }
        public DateTime AllocatedAt { get; set; }
    }

    public class ConflictDetectedEventArgs : EventArgs
    {
        public string SessionId { get; set; }
        public string ConflictType { get; set; }
        public List<string> AffectedMigrations { get; set; } = new();
        public string Description { get; set; }
        public DateTime DetectedAt { get; set; }
    }

    #endregion
}