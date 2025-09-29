using System;
using System.Collections.Generic;
using System.Collections.Concurrent;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using System.Timers;
using Microsoft.Extensions.Logging;
using Microsoft.Graph;
using MandADiscoverySuite.Models;
using MandADiscoverySuite.Models.Identity;
using MandADiscoverySuite.Migration;
using MandADiscoverySuite.Services.Audit;
using Timer = System.Timers.Timer;

namespace MandADiscoverySuite.Services
{
    /// <summary>
    /// User Synchronization Service for T-041: Ongoing synchronization of user accounts
    /// between source and target environments. Handles periodic sync, delta sync,
    /// conflict resolution, and bidirectional synchronization.
    /// </summary>
    public class UserSyncService : IDisposable
    {
        #region Fields and Properties

        private readonly ILogger<UserSyncService> _logger;
        private readonly IIdentityMigrator _identityMigrator;
        private readonly MandADiscoverySuite.Services.Audit.IAuditService _auditService;
        private readonly ConcurrentDictionary<string, SyncJobInfo> _activeSyncJobs;
        private readonly ConcurrentDictionary<string, UserSyncStatus> _userSyncStatuses;
        private readonly ConcurrentDictionary<string, Timer> _syncTimers;
        private readonly SemaphoreSlim _syncSemaphore;
        private bool _disposed = false;

        #endregion

        #region Constructor

        public UserSyncService(
            ILogger<UserSyncService> logger = null!,
            IIdentityMigrator identityMigrator = null!,
            MandADiscoverySuite.Services.Audit.IAuditService auditService = null!)
        {
            _logger = logger ?? Microsoft.Extensions.Logging.Abstractions.NullLogger<UserSyncService>.Instance;
            _identityMigrator = identityMigrator ?? throw new ArgumentNullException(nameof(identityMigrator));
            _auditService = auditService ?? throw new ArgumentNullException(nameof(auditService));

            _activeSyncJobs = new ConcurrentDictionary<string, SyncJobInfo>();
            _userSyncStatuses = new ConcurrentDictionary<string, UserSyncStatus>();
            _syncTimers = new ConcurrentDictionary<string, Timer>();
            _syncSemaphore = new SemaphoreSlim(5, 5); // Limit concurrent sync operations

            // Initialize events to prevent CS8618 warnings
            SyncJobStatusChanged = delegate { };
            UserSyncStatusChanged = delegate { };
            SyncProgressUpdated = delegate { };
        }

        #endregion

        #region Events

        /// <summary>
        /// Event raised when sync job status changes
        /// </summary>
        public event EventHandler<SyncJobStatusEventArgs> SyncJobStatusChanged;

        /// <summary>
        /// Event raised when user sync status changes
        /// </summary>
        public event EventHandler<UserSyncStatusEventArgs> UserSyncStatusChanged;

        /// <summary>
        /// Event raised when sync progress is updated
        /// </summary>
        public event EventHandler<SyncProgressEventArgs> SyncProgressUpdated;

        private void OnSyncJobStatusChanged(SyncJobStatusEventArgs args) => SyncJobStatusChanged?.Invoke(this, args);
        private void OnUserSyncStatusChanged(UserSyncStatusEventArgs args) => UserSyncStatusChanged?.Invoke(this, args);
        private void OnSyncProgressUpdated(SyncProgressEventArgs args) => SyncProgressUpdated?.Invoke(this, args);

        #endregion

        #region Periodic Synchronization

        /// <summary>
        /// Starts a periodic synchronization job for the specified users
        /// </summary>
        public Task<string> StartPeriodicSyncAsync(
            IEnumerable<UserData> users,
            PeriodicSyncSettings settings,
            TargetContext target,
            CancellationToken cancellationToken = default)
        {
            var syncJobId = Guid.NewGuid().ToString();
            
            try
            {
                _logger.LogInformation($"Starting periodic sync job {syncJobId} for {users.Count()} users");

                var syncJob = new SyncJobInfo
                {
                    JobId = syncJobId,
                    Users = users.ToList(),
                    Settings = settings,
                    Target = target,
                    Status = SyncJobStatus.Starting,
                    CreatedAt = DateTime.UtcNow,
                    NextSyncTime = settings.FirstSyncTime
                };

                _activeSyncJobs.TryAdd(syncJobId, syncJob);

                // Initialize user sync statuses
                foreach (var user in users)
                {
                    var userSyncKey = $"{syncJobId}_{user.UserPrincipalName}";
                    var userStatus = new UserSyncStatus
                    {
                        SourceUserPrincipalName = user.UserPrincipalName,
                        Status = "Pending",
                        SyncJobId = syncJobId,
                        IsActive = true,
                        NextSyncTime = settings.FirstSyncTime
                    };
                    
                    _userSyncStatuses.TryAdd(userSyncKey, userStatus);
                }

                // Create and start the sync timer
                if (settings.EnableScheduler)
                {
                    var timer = new Timer(settings.SyncInterval.TotalMilliseconds);
                    timer.Elapsed += async (sender, e) => await ExecuteSyncJobAsync(syncJobId);
                    timer.AutoReset = true;
                    timer.Start();
                    
                    _syncTimers.TryAdd(syncJobId, timer);
                }

                syncJob.Status = SyncJobStatus.Active;
                
                OnSyncJobStatusChanged(new SyncJobStatusEventArgs
                {
                    JobId = syncJobId,
                    Status = SyncJobStatus.Active,
                    Message = "Periodic sync job started successfully"
                });

                // Schedule the first sync if configured
                if (settings.FirstSyncTime <= DateTime.UtcNow.AddMinutes(1))
                {
                    _ = Task.Run(async () => await ExecuteSyncJobAsync(syncJobId));
                }

                _logger.LogInformation($"Periodic sync job {syncJobId} started successfully");

                return Task.FromResult(syncJobId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Failed to start periodic sync job {syncJobId}");
                
                if (_activeSyncJobs.TryGetValue(syncJobId, out var failedJob))
                {
                    failedJob.Status = SyncJobStatus.Failed;
                    failedJob.ErrorMessage = ex.Message;
                }

                throw;
            }
        }

        /// <summary>
        /// Stops a periodic synchronization job
        /// </summary>
        public Task<bool> StopPeriodicSyncAsync(string syncJobId, CancellationToken cancellationToken = default)
        {
            try
            {
                _logger.LogInformation($"Stopping periodic sync job {syncJobId}");

                if (!_activeSyncJobs.TryGetValue(syncJobId, out var syncJob))
                {
                    _logger.LogWarning($"Sync job {syncJobId} not found");
                    return Task.FromResult(false);
                }

                // Stop the timer
                if (_syncTimers.TryRemove(syncJobId, out var timer))
                {
                    timer.Stop();
                    timer.Dispose();
                }

                // Update job status
                syncJob.Status = SyncJobStatus.Stopped;
                syncJob.StoppedAt = DateTime.UtcNow;

                // Update user sync statuses
                var userKeys = _userSyncStatuses.Keys.Where(k => k.StartsWith($"{syncJobId}_")).ToList();
                foreach (var userKey in userKeys)
                {
                    if (_userSyncStatuses.TryGetValue(userKey, out var userStatus))
                    {
                        userStatus.Status = "Stopped";
                        userStatus.IsActive = false;
                    }
                }

                OnSyncJobStatusChanged(new SyncJobStatusEventArgs
                {
                    JobId = syncJobId,
                    Status = SyncJobStatus.Stopped,
                    Message = "Sync job stopped by user request"
                });

                _logger.LogInformation($"Periodic sync job {syncJobId} stopped successfully");

                return Task.FromResult(true);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Failed to stop sync job {syncJobId}");
                return Task.FromResult(false);
            }
        }

        /// <summary>
        /// Gets the status of all active sync jobs
        /// </summary>
        public async Task<IList<SyncJobInfo>> GetActiveSyncJobsAsync()
        {
            return await Task.FromResult(_activeSyncJobs.Values.Where(j => j.Status == SyncJobStatus.Active).ToList());
        }

        /// <summary>
        /// Gets the sync status for a specific user
        /// </summary>
        public async Task<UserSyncStatus> GetUserSyncStatusAsync(string syncJobId, string userPrincipalName)
        {
            var userKey = $"{syncJobId}_{userPrincipalName}";
            _userSyncStatuses.TryGetValue(userKey, out var status);
            return await Task.FromResult(status);
        }

        #endregion

        #region Synchronization Execution

        /// <summary>
        /// Executes a synchronization job
        /// </summary>
        private async Task ExecuteSyncJobAsync(string syncJobId)
        {
            if (!_activeSyncJobs.TryGetValue(syncJobId, out var syncJob))
            {
                _logger.LogWarning($"Sync job {syncJobId} not found during execution");
                return;
            }

            if (syncJob.Status != SyncJobStatus.Active)
            {
                _logger.LogDebug($"Sync job {syncJobId} is not active, skipping execution");
                return;
            }

            await _syncSemaphore.WaitAsync();
            try
            {
                _logger.LogInformation($"Executing sync job {syncJobId} with {syncJob.Users.Count} users");

                syncJob.Status = SyncJobStatus.Running;
                syncJob.LastSyncStartTime = DateTime.UtcNow;

                OnSyncJobStatusChanged(new SyncJobStatusEventArgs
                {
                    JobId = syncJobId,
                    Status = SyncJobStatus.Running,
                    Message = "Sync job execution started"
                });

                var syncResults = new List<UserSyncResult>();
                var processedUsers = 0;
                var successfulUsers = 0;
                var failedUsers = 0;

                foreach (var user in syncJob.Users)
                {
                    try
                    {
                        var userSyncKey = $"{syncJobId}_{user.UserPrincipalName}";
                        var userStatus = _userSyncStatuses.GetValueOrDefault(userSyncKey);

                        if (userStatus != null)
                        {
                            userStatus.Status = "Syncing";
                            userStatus.LastSyncTime = DateTime.UtcNow;
                            
                            OnUserSyncStatusChanged(new UserSyncStatusEventArgs
                            {
                                SyncStatus = userStatus,
                                EventType = "Started"
                            });
                        }

                        // Determine sync type (full or delta)
                        var lastSyncTime = userStatus?.LastSyncTime ?? DateTime.MinValue;
                        var syncType = syncJob.Settings.SyncSettings.EnableDeltaSync && lastSyncTime > DateTime.MinValue
                            ? "Delta" : "Full";

                        // Perform the synchronization
                        UserSyncResult syncResult;
                        if (syncType == "Delta" && syncJob.Settings.SyncSettings.EnableDeltaSync)
                        {
                            syncResult = await PerformDeltaSyncAsync(user, lastSyncTime, syncJob.Settings.SyncSettings, syncJob.Target);
                        }
                        else
                        {
                            syncResult = await PerformFullSyncAsync(user, syncJob.Settings.SyncSettings, syncJob.Target);
                        }

                        syncResults.Add(syncResult);

                        // Update user status
                        if (userStatus != null)
                        {
                            userStatus.Status = syncResult.IsSuccess ? "Synchronized" : "Failed";
                            userStatus.LastSyncTime = DateTime.UtcNow;
                            userStatus.NextSyncTime = DateTime.UtcNow.Add(syncJob.Settings.SyncInterval);
                            userStatus.SyncedAttributes = syncResult.SyncedAttributes;
                            userStatus.SyncErrors = syncResult.FailedAttributes;

                            OnUserSyncStatusChanged(new UserSyncStatusEventArgs
                            {
                                SyncStatus = userStatus,
                                EventType = syncResult.IsSuccess ? "Completed" : "Failed",
                                Details = syncResult.IsSuccess ? "Sync completed successfully" : syncResult.ErrorMessage
                            });
                        }

                        processedUsers++;
                        if (syncResult.IsSuccess)
                            successfulUsers++;
                        else
                            failedUsers++;

                        // Report progress
                        OnSyncProgressUpdated(new SyncProgressEventArgs
                        {
                            JobId = syncJobId,
                            TotalUsers = syncJob.Users.Count,
                            ProcessedUsers = processedUsers,
                            SuccessfulUsers = successfulUsers,
                            FailedUsers = failedUsers,
                            CurrentUser = user.UserPrincipalName
                        });
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, $"Failed to sync user {user.UserPrincipalName} in job {syncJobId}");
                        failedUsers++;
                        processedUsers++;

                        var userSyncKey = $"{syncJobId}_{user.UserPrincipalName}";
                        if (_userSyncStatuses.TryGetValue(userSyncKey, out var userStatus))
                        {
                            userStatus.Status = "Failed";
                            userStatus.SyncErrors = new List<string> { ex.Message };
                        }
                    }
                }

                // Update sync job with results
                syncJob.Status = SyncJobStatus.Active;
                syncJob.LastSyncEndTime = DateTime.UtcNow;
                syncJob.NextSyncTime = DateTime.UtcNow.Add(syncJob.Settings.SyncInterval);
                syncJob.LastSyncResults = new UserSynchronizationResult
                {
                    TotalUsers = syncJob.Users.Count,
                    SuccessfulUsers = successfulUsers,
                    FailedUsers = failedUsers,
                    UserResults = syncResults,
                    SyncStartTime = syncJob.LastSyncStartTime.Value,
                    SyncEndTime = DateTime.UtcNow,
                    IsSuccess = failedUsers == 0
                };

                OnSyncJobStatusChanged(new SyncJobStatusEventArgs
                {
                    JobId = syncJobId,
                    Status = SyncJobStatus.Active,
                    Message = $"Sync completed: {successfulUsers} successful, {failedUsers} failed"
                });

                // Log audit event
                await LogSyncAuditAsync(syncJob);

                _logger.LogInformation($"Sync job {syncJobId} completed: {successfulUsers} successful, {failedUsers} failed");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Sync job {syncJobId} execution failed");
                
                syncJob.Status = SyncJobStatus.Failed;
                syncJob.ErrorMessage = ex.Message;
                syncJob.LastSyncEndTime = DateTime.UtcNow;

                OnSyncJobStatusChanged(new SyncJobStatusEventArgs
                {
                    JobId = syncJobId,
                    Status = SyncJobStatus.Failed,
                    Message = $"Sync job failed: {ex.Message}"
                });
            }
            finally
            {
                _syncSemaphore.Release();
            }
        }

        /// <summary>
        /// Performs a full synchronization for a user
        /// </summary>
        private async Task<UserSyncResult> PerformFullSyncAsync(
            UserData user,
            UserSynchronizationSettings settings,
            TargetContext target)
        {
            var result = new UserSyncResult
            {
                UserPrincipalName = user.UserPrincipalName,
                IsSuccess = false,
                StartTime = DateTime.UtcNow
            };

            try
            {
                // Use the identity migrator to perform synchronization
                var syncResults = await _identityMigrator.SynchronizeUsersAsync(
                    new[] { user },
                    settings,
                    target);

                var userSyncResult = syncResults.UserResults.FirstOrDefault();
                if (userSyncResult != null)
                {
                    result.AttributesSynced = userSyncResult.AttributesSynced;
                    result.AttributesFailed = userSyncResult.AttributesFailed;
                    result.SyncedAttributes = userSyncResult.SyncedAttributes;
                    result.FailedAttributes = userSyncResult.FailedAttributes;
                    result.SyncConflicts = userSyncResult.SyncConflicts;
                    result.IsSuccess = userSyncResult.IsSuccess;
                    result.ErrorMessage = userSyncResult.ErrorMessage;
                }
                else
                {
                    result.IsSuccess = true;
                    result.AttributesSynced = 0;
                    result.AttributesFailed = 0;
                }

                result.EndTime = DateTime.UtcNow;
                result.NextSyncTime = DateTime.UtcNow.Add(settings.SyncInterval);
            }
            catch (Exception ex)
            {
                result.IsSuccess = false;
                result.ErrorMessage = ex.Message;
                result.EndTime = DateTime.UtcNow;
                result.FailedAttributes = new List<string> { "All attributes - sync failed" };
            }

            return result;
        }

        /// <summary>
        /// Performs a delta synchronization for a user
        /// </summary>
        private async Task<UserSyncResult> PerformDeltaSyncAsync(
            UserData user,
            DateTime lastSyncTime,
            UserSynchronizationSettings settings,
            TargetContext target)
        {
            var result = new UserSyncResult
            {
                UserPrincipalName = user.UserPrincipalName,
                IsSuccess = false,
                StartTime = DateTime.UtcNow
            };

            try
            {
                // For delta sync, we would compare current user state with last known state
                // and only sync changed attributes. This is a simplified implementation.
                
                var userMigrationSettings = new UserMigrationSettings
                {
                    AttributeMapping = UserAttributeMapping.CreateDefaultMapping(),
                    EnableAttributeMapping = true
                };

                var deltaResults = await _identityMigrator.MigrateDeltaAsync(
                    new[] { user },
                    lastSyncTime,
                    userMigrationSettings,
                    target);

                var deltaResult = deltaResults.FirstOrDefault();
                if (deltaResult != null)
                {
                    result.AttributesSynced = deltaResult.AttributeMapping?.MappedAttributes?.Count ?? 0;
                    result.AttributesFailed = deltaResult.AttributeMapping?.MappingIssues?.Count ?? 0;
                    result.IsSuccess = deltaResult.IsSuccess;
                    result.ErrorMessage = deltaResult.ErrorMessage;
                    
                    if (deltaResult.AttributeMapping?.MappedAttributes != null)
                    {
                        result.SyncedAttributes = deltaResult.AttributeMapping.MappedAttributes;
                    }
                }

                result.EndTime = DateTime.UtcNow;
                result.NextSyncTime = DateTime.UtcNow.Add(settings.SyncInterval);
            }
            catch (Exception ex)
            {
                result.IsSuccess = false;
                result.ErrorMessage = ex.Message;
                result.EndTime = DateTime.UtcNow;
                result.FailedAttributes = new List<string> { "Delta sync failed" };
            }

            return result;
        }

        #endregion

        #region Manual Synchronization

        /// <summary>
        /// Performs an immediate synchronization for specific users
        /// </summary>
        public async Task<UserSynchronizationResult> SynchronizeUsersNowAsync(
            IEnumerable<UserData> users,
            UserSynchronizationSettings settings,
            TargetContext target,
            CancellationToken cancellationToken = default)
        {
            var result = new UserSynchronizationResult
            {
                TotalUsers = users.Count(),
                SyncStartTime = DateTime.UtcNow,
                IsSuccess = false
            };

            try
            {
                _logger.LogInformation($"Starting manual synchronization for {result.TotalUsers} users");

                var syncResults = new List<UserSyncResult>();
                var processedUsers = 0;
                var successfulUsers = 0;
                var failedUsers = 0;

                await _syncSemaphore.WaitAsync(cancellationToken);
                try
                {
                    foreach (var user in users)
                    {
                        if (cancellationToken.IsCancellationRequested)
                            break;

                        var userResult = await PerformFullSyncAsync(user, settings, target);
                        syncResults.Add(userResult);

                        processedUsers++;
                        if (userResult.IsSuccess)
                            successfulUsers++;
                        else
                            failedUsers++;
                    }
                }
                finally
                {
                    _syncSemaphore.Release();
                }

                result.SuccessfulUsers = successfulUsers;
                result.FailedUsers = failedUsers;
                result.UserResults = syncResults;
                result.SyncEndTime = DateTime.UtcNow;
                result.IsSuccess = failedUsers == 0;

                _logger.LogInformation($"Manual synchronization completed: {successfulUsers} successful, {failedUsers} failed");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Manual synchronization failed");
                result.IsSuccess = false;
                result.ErrorMessage = ex.Message;
                result.SyncEndTime = DateTime.UtcNow;
            }

            return result;
        }

        #endregion

        #region Audit and Logging

        /// <summary>
        /// Logs sync job audit information
        /// </summary>
        private async Task LogSyncAuditAsync(SyncJobInfo syncJob)
        {
            try
            {
                // Cast to the correct interface that has LogAsync method
                var auditService = _auditService as MandADiscoverySuite.Services.Audit.IAuditService;
                if (auditService != null)
                {
                    await auditService.LogAsync(new AuditEvent
                    {
                        Action = AuditAction.UserSync,
                        ObjectType = ObjectType.User,
                        SourceObjectId = syncJob.JobId,
                        Status = syncJob.LastSyncResults?.IsSuccess == true ? AuditStatus.Success : AuditStatus.Failed,
                        StatusMessage = $"User sync job completed: {syncJob.LastSyncResults?.SuccessfulUsers} successful, {syncJob.LastSyncResults?.FailedUsers} failed",
                        SessionId = syncJob.JobId,
                        UserPrincipalName = Environment.UserName,
                        Timestamp = DateTime.UtcNow,
                        ItemsProcessed = syncJob.LastSyncResults?.TotalUsers ?? 0,
                        Metadata = new Dictionary<string, string>
                        {
                            ["SyncInterval"] = syncJob.Settings.SyncInterval.ToString(),
                            ["UserCount"] = syncJob.Users.Count.ToString(),
                            ["SyncType"] = syncJob.Settings.SyncSettings.EnableDeltaSync ? "Delta" : "Full",
                            ["Duration"] = syncJob.LastSyncResults?.TotalSyncTime.ToString() ?? "Unknown"
                        }
                    });
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Failed to log sync audit for job {syncJob.JobId}");
            }
        }

        #endregion

        #region IDisposable Implementation

        public void Dispose()
        {
            if (_disposed)
                return;

            _logger.LogInformation("Disposing UserSyncService and stopping all sync jobs");

            // Stop all timers
            foreach (var timer in _syncTimers.Values)
            {
                timer?.Stop();
                timer?.Dispose();
            }
            _syncTimers.Clear();

            // Update all active jobs to stopped
            foreach (var job in _activeSyncJobs.Values.Where(j => j.Status == SyncJobStatus.Active))
            {
                job.Status = SyncJobStatus.Stopped;
                job.StoppedAt = DateTime.UtcNow;
            }

            _syncSemaphore?.Dispose();
            _disposed = true;
        }

        #endregion
    }

    #region Supporting Classes

    /// <summary>
    /// Information about a synchronization job
    /// </summary>
    public class SyncJobInfo
    {
        public string JobId { get; set; }
        public List<UserData> Users { get; set; } = new List<UserData>();
        public PeriodicSyncSettings Settings { get; set; }
        public TargetContext Target { get; set; }
        public SyncJobStatus Status { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? StoppedAt { get; set; }
        public DateTime NextSyncTime { get; set; }
        public DateTime? LastSyncStartTime { get; set; }
        public DateTime? LastSyncEndTime { get; set; }
        public UserSynchronizationResult LastSyncResults { get; set; }
        public string ErrorMessage { get; set; }
    }

    /// <summary>
    /// Sync job status enumeration
    /// </summary>
    public enum SyncJobStatus
    {
        Starting,
        Active,
        Running,
        Stopped,
        Failed
    }

    /// <summary>
    /// Event args for sync job status changes
    /// </summary>
    public class SyncJobStatusEventArgs : EventArgs
    {
        public string JobId { get; set; }
        public SyncJobStatus Status { get; set; }
        public string Message { get; set; }
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    }

    /// <summary>
    /// Event args for sync progress updates
    /// </summary>
    public class SyncProgressEventArgs : EventArgs
    {
        public string JobId { get; set; }
        public int TotalUsers { get; set; }
        public int ProcessedUsers { get; set; }
        public int SuccessfulUsers { get; set; }
        public int FailedUsers { get; set; }
        public string CurrentUser { get; set; }
        public int ProgressPercentage => TotalUsers > 0 ? (ProcessedUsers * 100) / TotalUsers : 0;
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    }

    #endregion
}