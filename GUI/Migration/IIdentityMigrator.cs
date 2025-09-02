using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using MandADiscoverySuite.Models;
using MandADiscoverySuite.Models.Migration;
using MandADiscoverySuite.Models.Identity;

namespace MandADiscoverySuite.Migration
{
    /// <summary>
    /// Interface for comprehensive user account migration and synchronization operations for T-041.
    /// Provides enterprise-grade identity management for M&A scenarios with support for 
    /// account creation, invitation, hybrid scenarios, conflict resolution, and ongoing synchronization.
    /// </summary>
    public interface IIdentityMigrator
    {
        #region Events
        
        /// <summary>
        /// Event raised when user migration progress is updated
        /// </summary>
        event EventHandler<UserMigrationProgressEventArgs> ProgressUpdated;
        
        /// <summary>
        /// Event raised when a conflict is detected during migration
        /// </summary>
        event EventHandler<UserMigrationConflictEventArgs> ConflictDetected;
        
        /// <summary>
        /// Event raised when synchronization status changes
        /// </summary>
        event EventHandler<UserSyncStatusEventArgs> SyncStatusChanged;

        #endregion

        #region User Migration

        /// <summary>
        /// Migrates a single user account to the target tenant with comprehensive attribute mapping
        /// </summary>
        /// <param name="user">Source user data</param>
        /// <param name="settings">Migration settings and configuration</param>
        /// <param name="target">Target tenant context</param>
        /// <param name="progress">Progress reporting callback</param>
        /// <returns>Detailed migration result with success status and metadata</returns>
        Task<MigrationResult> MigrateUserAsync(
            UserData user,
            Models.Migration.MigrationSettings settings,
            TargetContext target,
            IProgress<MigrationProgress>? progress = null);

        /// <summary>
        /// Rolls back a user migration by disabling/deleting the target account and restoring source state.
        /// </summary>
        Task<RollbackResult> RollbackUserAsync(UserData user, TargetContext target, IProgress<MigrationProgress>? progress = null);

        /// <summary>
        /// Migrates multiple users in batch with optimized processing
        /// </summary>
        /// <param name="users">Collection of users to migrate</param>
        /// <param name="settings">Migration settings</param>
        /// <param name="target">Target tenant context</param>
        /// <param name="batchSize">Maximum concurrent operations</param>
        /// <param name="progress">Progress reporting callback</param>
        /// <param name="cancellationToken">Cancellation token</param>
        /// <returns>Collection of migration results</returns>
        Task<IList<UserMigrationResult>> MigrateBatchAsync(
            IEnumerable<UserData> users,
            UserMigrationSettings settings,
            TargetContext target,
            int batchSize = 10,
            IProgress<BatchMigrationProgress>? progress = null,
            CancellationToken cancellationToken = default);

        /// <summary>
        /// Performs delta migration for users that have changed since last migration
        /// </summary>
        /// <param name="users">Users to check for changes</param>
        /// <param name="lastSyncTime">Timestamp of last successful migration</param>
        /// <param name="settings">Migration settings</param>
        /// <param name="target">Target tenant context</param>
        /// <param name="cancellationToken">Cancellation token</param>
        /// <returns>Results of delta migration</returns>
        Task<IList<UserMigrationResult>> MigrateDeltaAsync(
            IEnumerable<UserData> users,
            DateTime lastSyncTime,
            UserMigrationSettings settings,
            TargetContext target,
            CancellationToken cancellationToken = default);

        #endregion

        #region User Account Management

        /// <summary>
        /// Creates a new user account in the target tenant
        /// </summary>
        /// <param name="userData">Source user data</param>
        /// <param name="settings">Account creation settings</param>
        /// <param name="target">Target tenant context</param>
        /// <param name="cancellationToken">Cancellation token</param>
        /// <returns>Account creation result with target user ID</returns>
        Task<UserAccountCreationResult> CreateUserAccountAsync(
            UserData userData,
            UserAccountCreationSettings settings,
            TargetContext target,
            CancellationToken cancellationToken = default);

        /// <summary>
        /// Invites a user to the target tenant via B2B collaboration
        /// </summary>
        /// <param name="userData">Source user data</param>
        /// <param name="invitationSettings">Invitation configuration</param>
        /// <param name="target">Target tenant context</param>
        /// <param name="cancellationToken">Cancellation token</param>
        /// <returns>Invitation result with invitation details</returns>
        Task<UserInvitationResult> InviteUserAsync(
            UserData userData,
            UserInvitationSettings invitationSettings,
            TargetContext target,
            CancellationToken cancellationToken = default);

        /// <summary>
        /// Updates an existing user account with new attribute values
        /// </summary>
        /// <param name="targetUserId">Target user ID to update</param>
        /// <param name="userData">Updated user data</param>
        /// <param name="settings">Update settings</param>
        /// <param name="target">Target tenant context</param>
        /// <param name="cancellationToken">Cancellation token</param>
        /// <returns>Update result</returns>
        Task<UserUpdateResult> UpdateUserAccountAsync(
            string targetUserId,
            UserData userData,
            UserUpdateSettings settings,
            TargetContext target,
            CancellationToken cancellationToken = default);

        #endregion

        #region Conflict Resolution

        /// <summary>
        /// Detects potential conflicts before migration (duplicate UPNs, existing accounts)
        /// </summary>
        /// <param name="users">Users to check for conflicts</param>
        /// <param name="target">Target tenant context</param>
        /// <param name="cancellationToken">Cancellation token</param>
        /// <returns>Collection of detected conflicts</returns>
        Task<IList<UserMigrationConflict>> DetectConflictsAsync(
            IEnumerable<UserData> users,
            TargetContext target,
            CancellationToken cancellationToken = default);

        /// <summary>
        /// Resolves a migration conflict using the specified resolution strategy
        /// </summary>
        /// <param name="conflict">Conflict to resolve</param>
        /// <param name="resolution">Resolution strategy and parameters</param>
        /// <param name="target">Target tenant context</param>
        /// <param name="cancellationToken">Cancellation token</param>
        /// <returns>Conflict resolution result</returns>
        Task<ConflictResolutionResult> ResolveConflictAsync(
            UserMigrationConflict conflict,
            ConflictResolution resolution,
            TargetContext target,
            CancellationToken cancellationToken = default);

        #endregion

        #region Synchronization

        /// <summary>
        /// Synchronizes user accounts from source to target, updating changed attributes
        /// </summary>
        /// <param name="sourceUsers">Source user data</param>
        /// <param name="settings">Synchronization settings</param>
        /// <param name="target">Target tenant context</param>
        /// <param name="cancellationToken">Cancellation token</param>
        /// <returns>Synchronization results</returns>
        Task<UserSynchronizationResult> SynchronizeUsersAsync(
            IEnumerable<UserData> sourceUsers,
            UserSynchronizationSettings settings,
            TargetContext target,
            CancellationToken cancellationToken = default);

        /// <summary>
        /// Gets the synchronization status for a specific user
        /// </summary>
        /// <param name="sourceUserId">Source user identifier</param>
        /// <param name="target">Target tenant context</param>
        /// <param name="cancellationToken">Cancellation token</param>
        /// <returns>User synchronization status</returns>
        Task<UserSyncStatus> GetSyncStatusAsync(
            string sourceUserId,
            TargetContext target,
            CancellationToken cancellationToken = default);

        /// <summary>
        /// Starts periodic synchronization for the specified users
        /// </summary>
        /// <param name="users">Users to include in periodic sync</param>
        /// <param name="settings">Sync settings including schedule</param>
        /// <param name="target">Target tenant context</param>
        /// <param name="cancellationToken">Cancellation token</param>
        /// <returns>Sync job identifier</returns>
        Task<string> StartPeriodicSyncAsync(
            IEnumerable<UserData> users,
            PeriodicSyncSettings settings,
            TargetContext target,
            CancellationToken cancellationToken = default);

        /// <summary>
        /// Stops periodic synchronization for a sync job
        /// </summary>
        /// <param name="syncJobId">Sync job identifier</param>
        /// <param name="cancellationToken">Cancellation token</param>
        /// <returns>True if successfully stopped</returns>
        Task<bool> StopPeriodicSyncAsync(string syncJobId, CancellationToken cancellationToken = default);

        #endregion

        #region Attribute Mapping

        /// <summary>
        /// Gets the attribute mapping configuration for user migration
        /// </summary>
        /// <returns>Current attribute mapping rules</returns>
        Task<UserAttributeMapping> GetAttributeMappingAsync();

        /// <summary>
        /// Updates the attribute mapping configuration
        /// </summary>
        /// <param name="mapping">New attribute mapping rules</param>
        /// <param name="cancellationToken">Cancellation token</param>
        /// <returns>True if successfully updated</returns>
        Task<bool> UpdateAttributeMappingAsync(
            UserAttributeMapping mapping,
            CancellationToken cancellationToken = default);

        /// <summary>
        /// Validates that the attribute mapping is complete and valid
        /// </summary>
        /// <param name="mapping">Mapping to validate</param>
        /// <returns>Validation result with any issues</returns>
        Task<AttributeMappingValidationResult> ValidateAttributeMappingAsync(UserAttributeMapping mapping);

        #endregion

        #region Password Management

        /// <summary>
        /// Generates secure temporary passwords for migrated users
        /// </summary>
        /// <param name="count">Number of passwords to generate</param>
        /// <param name="requirements">Password complexity requirements</param>
        /// <returns>Collection of secure temporary passwords</returns>
        Task<IList<string>> GenerateTemporaryPasswordsAsync(
            int count,
            PasswordRequirements requirements);

        /// <summary>
        /// Configures MFA settings for migrated users
        /// </summary>
        /// <param name="userIds">Target user IDs to configure</param>
        /// <param name="mfaSettings">MFA configuration</param>
        /// <param name="target">Target tenant context</param>
        /// <param name="cancellationToken">Cancellation token</param>
        /// <returns>MFA configuration results</returns>
        Task<IList<MfaConfigurationResult>> ConfigureMfaAsync(
            IEnumerable<string> userIds,
            MfaSettings mfaSettings,
            TargetContext target,
            CancellationToken cancellationToken = default);

        #endregion

        #region Validation and Testing

        /// <summary>
        /// Tests connectivity to source and target identity systems
        /// </summary>
        /// <param name="sourceContext">Source system context</param>
        /// <param name="target">Target tenant context</param>
        /// <param name="cancellationToken">Cancellation token</param>
        /// <returns>Connectivity test results</returns>
        Task<IdentityConnectivityResult> TestConnectivityAsync(
            SourceContext sourceContext,
            TargetContext target,
            CancellationToken cancellationToken = default);

        /// <summary>
        /// Validates that migrated users can authenticate and access resources
        /// </summary>
        /// <param name="userIds">Target user IDs to validate</param>
        /// <param name="target">Target tenant context</param>
        /// <param name="cancellationToken">Cancellation token</param>
        /// <returns>Validation results for each user</returns>
        Task<IList<UserValidationResult>> ValidateMigratedUsersAsync(
            IEnumerable<string> userIds,
            TargetContext target,
            CancellationToken cancellationToken = default);

        #endregion
    }
}
