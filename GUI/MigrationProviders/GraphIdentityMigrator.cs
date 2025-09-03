using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MandADiscoverySuite.Migration;
using MandADiscoverySuite.Models;
using MandADiscoverySuite.Models.Migration;
using MandADiscoverySuite.Models.Identity;
using MandADiscoverySuite.Services.Migration;
using Microsoft.Extensions.Logging;
// Microsoft Graph SDK types
using Microsoft.Graph;
using Microsoft.Graph.Models;

namespace MandADiscoverySuite.MigrationProviders
{
    /// <summary>
    /// Uses Microsoft Graph to create users in the target tenant.
    /// </summary>
    public interface IGraphUserClient
    {
        Task<Microsoft.Graph.Models.User> CreateUserAsync(Microsoft.Graph.Models.User user);
        Task UpdateUserAsync(string userId, Microsoft.Graph.Models.User user);
        Task DeleteUserAsync(string userId);
        Task<Microsoft.Graph.Models.User> GetUserAsync(string userIdOrUpn);
        Task<IEnumerable<Microsoft.Graph.Models.User>> GetUsersAsync();
    }

    /// <summary>
    /// Implements user migration via Microsoft Graph.
    /// </summary>
    public class GraphIdentityMigrator : Migration.IIdentityMigrator
    {
        private readonly IdentityMigrator _identityMigrator;
        #region Events

        /// <summary>
        /// Event raised when user migration progress is updated
        /// </summary>
        public event EventHandler<UserMigrationProgressEventArgs>? ProgressUpdated;

        /// <summary>
        /// Event raised when a conflict is detected during migration
        /// </summary>
        public event EventHandler<UserMigrationConflictEventArgs>? ConflictDetected;

        /// <summary>
        /// Event raised when synchronization status changes
        /// </summary>
        public event EventHandler<UserSyncStatusEventArgs>? SyncStatusChanged;

        #endregion

        private readonly IGraphUserClient _client;
        private readonly ILogger _logger;

        public GraphIdentityMigrator(IGraphUserClient client, ILogger logger)
        {
            _client = client;
            _logger = logger;

            // Initialize the existing IdentityMigrator as the backend implementation
            _identityMigrator = new IdentityMigrator(null, null, null, null);

            // Forward events from the backend IdentityMigrator
            _identityMigrator.ProgressUpdated += (sender, args) => ProgressUpdated?.Invoke(this, args);
            _identityMigrator.ConflictDetected += (sender, args) => ConflictDetected?.Invoke(this, args);
            _identityMigrator.SyncStatusChanged += (sender, args) => SyncStatusChanged?.Invoke(this, args);
        }

        public async Task<Migration.MigrationResult> MigrateUserAsync(Models.UserData user, Models.Migration.MigrationSettings settings, TargetContext target, IProgress<Migration.MigrationProgress>? progress = null)
        {
            return await _identityMigrator.MigrateUserAsync(user, settings, target, progress);
        }

        public async Task<RollbackResult> RollbackUserAsync(Models.UserData user, TargetContext target, IProgress<Migration.MigrationProgress>? progress = null)
        {
            return await _identityMigrator.RollbackUserAsync(user, target, progress);
        }

        // Note: GenerateSecurePassword method removed - forwarding to IdentityMigrator's implementation

        public async Task<IList<Models.Identity.UserMigrationResult>> MigrateBatchAsync(
            IEnumerable<Models.UserData> users,
            Models.Identity.UserMigrationSettings settings,
            TargetContext target,
            int batchSize = 10,
            IProgress<Models.Identity.BatchMigrationProgress>? progress = null,
            CancellationToken cancellationToken = default)
        {
            return await _identityMigrator.MigrateBatchAsync(users, settings, target, batchSize, progress, cancellationToken);
        }

        public async Task<IList<Models.Identity.UserMigrationResult>> MigrateDeltaAsync(
            IEnumerable<Models.UserData> users,
            DateTime lastSyncTime,
            Models.Identity.UserMigrationSettings settings,
            TargetContext target,
            CancellationToken cancellationToken = default)
        {
            return await _identityMigrator.MigrateDeltaAsync(users, lastSyncTime, settings, target, cancellationToken);
        }

        public async Task<Models.Identity.UserAccountCreationResult> CreateUserAccountAsync(
            Models.UserData userData,
            Models.Identity.UserAccountCreationSettings settings,
            TargetContext target,
            CancellationToken cancellationToken = default)
        {
            return await _identityMigrator.CreateUserAccountAsync(userData, settings, target, cancellationToken);
        }

        public async Task<Models.Identity.UserInvitationResult> InviteUserAsync(
            Models.UserData userData,
            Models.Identity.UserInvitationSettings invitationSettings,
            TargetContext target,
            CancellationToken cancellationToken = default)
        {
            return await _identityMigrator.InviteUserAsync(userData, invitationSettings, target, cancellationToken);
        }

        public async Task<Models.Identity.UserUpdateResult> UpdateUserAccountAsync(
            string targetUserId,
            Models.UserData userData,
            Models.Identity.UserUpdateSettings settings,
            TargetContext target,
            CancellationToken cancellationToken = default)
        {
            return await _identityMigrator.UpdateUserAccountAsync(targetUserId, userData, settings, target, cancellationToken);
        }

        public async Task<IList<Models.Identity.UserMigrationConflict>> DetectConflictsAsync(
            IEnumerable<Models.UserData> users,
            TargetContext target,
            CancellationToken cancellationToken = default)
        {
            return await _identityMigrator.DetectConflictsAsync(users, target, cancellationToken);
        }

        public async Task<Models.Identity.ConflictResolutionResult> ResolveConflictAsync(
            Models.Identity.UserMigrationConflict conflict,
            Models.Identity.ConflictResolution resolution,
            TargetContext target,
            CancellationToken cancellationToken = default)
        {
            return await _identityMigrator.ResolveConflictAsync(conflict, resolution, target, cancellationToken);
        }

        public async Task<Models.Identity.UserSynchronizationResult> SynchronizeUsersAsync(
            IEnumerable<Models.UserData> sourceUsers,
            Models.Identity.UserSynchronizationSettings settings,
            TargetContext target,
            CancellationToken cancellationToken = default)
        {
            return await _identityMigrator.SynchronizeUsersAsync(sourceUsers, settings, target, cancellationToken);
        }

        public async Task<Models.Identity.UserSyncStatus> GetSyncStatusAsync(
            string sourceUserId,
            TargetContext target,
            CancellationToken cancellationToken = default)
        {
            return await _identityMigrator.GetSyncStatusAsync(sourceUserId, target, cancellationToken);
        }

        public async Task<string> StartPeriodicSyncAsync(
            IEnumerable<Models.UserData> users,
            Models.Identity.PeriodicSyncSettings settings,
            TargetContext target,
            CancellationToken cancellationToken = default)
        {
            return await _identityMigrator.StartPeriodicSyncAsync(users, settings, target, cancellationToken);
        }

        public async Task<bool> StopPeriodicSyncAsync(string syncJobId, CancellationToken cancellationToken = default)
        {
            return await _identityMigrator.StopPeriodicSyncAsync(syncJobId, cancellationToken);
        }

        public async Task<Models.Identity.UserAttributeMapping> GetAttributeMappingAsync()
        {
            return await _identityMigrator.GetAttributeMappingAsync();
        }

        public async Task<bool> UpdateAttributeMappingAsync(
            Models.Identity.UserAttributeMapping mapping,
            CancellationToken cancellationToken = default)
        {
            return await _identityMigrator.UpdateAttributeMappingAsync(mapping, cancellationToken);
        }

        public async Task<Models.Identity.AttributeMappingValidationResult> ValidateAttributeMappingAsync(Models.Identity.UserAttributeMapping mapping)
        {
            return await _identityMigrator.ValidateAttributeMappingAsync(mapping);
        }

        public async Task<IList<string>> GenerateTemporaryPasswordsAsync(
            int count,
            PasswordRequirements requirements)
        {
            return await _identityMigrator.GenerateTemporaryPasswordsAsync(count, requirements);
        }

        public async Task<IList<Models.Identity.MfaConfigurationResult>> ConfigureMfaAsync(
            IEnumerable<string> userIds,
            Models.Identity.MfaSettings mfaSettings,
            TargetContext target,
            CancellationToken cancellationToken = default)
        {
            return await _identityMigrator.ConfigureMfaAsync(userIds, mfaSettings, target, cancellationToken);
        }

        public async Task<Models.Identity.IdentityConnectivityResult> TestConnectivityAsync(
            SourceContext sourceContext,
            TargetContext target,
            CancellationToken cancellationToken = default)
        {
            return await _identityMigrator.TestConnectivityAsync(sourceContext, target, cancellationToken);
        }

        public async Task<IList<Models.Identity.UserValidationResult>> ValidateMigratedUsersAsync(
            IEnumerable<string> userIds,
            TargetContext target,
            CancellationToken cancellationToken = default)
        {
            return await _identityMigrator.ValidateMigratedUsersAsync(userIds, target, cancellationToken);
        }
    }
}
