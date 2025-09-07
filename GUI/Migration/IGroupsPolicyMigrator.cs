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
    /// Interface for comprehensive Groups, GPOs, and ACLs migration operations for T-037.
    /// Provides enterprise-grade security policy management for M&A scenarios with support for 
    /// group replication, GPO migration, ACL preservation, and cross-domain trust management.
    /// </summary>
    public interface IGroupsPolicyMigrator
    {
        #region Events
        
        /// <summary>
        /// Event raised when group migration progress is updated
        /// </summary>
        event EventHandler<GroupMigrationProgressEventArgs> ProgressUpdated;
        
        /// <summary>
        /// Event raised when a policy conflict is detected during migration
        /// </summary>
        event EventHandler<PolicyMigrationConflictEventArgs> ConflictDetected;
        
        /// <summary>
        /// Event raised when ACL validation status changes
        /// </summary>
        event EventHandler<AclValidationStatusEventArgs> AclStatusChanged;

        #endregion

        #region Group Migration

        /// <summary>
        /// Migrates a single security/distribution group to the target tenant with member preservation
        /// </summary>
        /// <param name="group">Source group data</param>
        /// <param name="settings">Migration settings and configuration</param>
        /// <param name="target">Target tenant context</param>
        /// <param name="progress">Progress reporting callback</param>
        /// <returns>Detailed migration result with success status and metadata</returns>
        Task<Models.Identity.GroupMigrationResult> MigrateGroupAsync(
            Models.Identity.GroupData group,
            GroupMigrationSettings settings,
            TargetContext target,
            IProgress<MigrationProgress>? progress = null);

        /// <summary>
        /// Migrates multiple groups in batch with optimized processing and dependency resolution
        /// </summary>
        /// <param name="groups">Collection of groups to migrate</param>
        /// <param name="settings">Migration settings</param>
        /// <param name="target">Target tenant context</param>
        /// <param name="batchSize">Maximum concurrent operations</param>
        /// <param name="progress">Progress reporting callback</param>
        /// <param name="cancellationToken">Cancellation token</param>
        /// <returns>Collection of migration results</returns>
        Task<IList<Models.Identity.GroupMigrationResult>> MigrateBatchAsync(
            IEnumerable<Models.Identity.GroupData> groups,
            GroupMigrationSettings settings,
            TargetContext target,
            int batchSize = 10,
            IProgress<BatchMigrationProgress>? progress = null,
            CancellationToken cancellationToken = default);

        /// <summary>
        /// Performs delta migration for groups that have changed since last migration
        /// </summary>
        /// <param name="groups">Groups to check for changes</param>
        /// <param name="lastSyncTime">Timestamp of last successful migration</param>
        /// <param name="settings">Migration settings</param>
        /// <param name="target">Target tenant context</param>
        /// <param name="cancellationToken">Cancellation token</param>
        /// <returns>Results of delta migration</returns>
        Task<IList<Models.Identity.GroupMigrationResult>> MigrateGroupDeltaAsync(
            IEnumerable<Models.Identity.GroupData> groups,
            DateTime lastSyncTime,
            GroupMigrationSettings settings,
            TargetContext target,
            CancellationToken cancellationToken = default);

        #endregion

        #region Group Policy Objects (GPO) Migration

        /// <summary>
        /// Migrates Group Policy Objects to equivalent cloud-based policies
        /// </summary>
        /// <param name="gpos">Source GPO data</param>
        /// <param name="settings">GPO migration settings</param>
        /// <param name="target">Target tenant context</param>
        /// <param name="progress">Progress reporting callback</param>
        /// <param name="cancellationToken">Cancellation token</param>
        /// <returns>GPO migration results with cloud policy mappings</returns>
        Task<IList<GpoMigrationResult>> MigrateGposAsync(
            IEnumerable<GpoData> gpos,
            GpoMigrationSettings settings,
            TargetContext target,
            IProgress<MigrationProgress>? progress = null,
            CancellationToken cancellationToken = default);

        /// <summary>
        /// Validates GPO cloud policy equivalents and reports gaps
        /// </summary>
        /// <param name="gpos">Source GPOs to validate</param>
        /// <param name="target">Target tenant context</param>
        /// <param name="cancellationToken">Cancellation token</param>
        /// <returns>Validation results with unsupported policies identified</returns>
        Task<GpoValidationResult> ValidateGpoMigrationAsync(
            IEnumerable<GpoData> gpos,
            TargetContext target,
            CancellationToken cancellationToken = default);

        #endregion

        #region Access Control Lists (ACL) Migration

        /// <summary>
        /// Migrates file/folder ACLs to SharePoint Online/OneDrive permissions
        /// </summary>
        /// <param name="acls">Source ACL data</param>
        /// <param name="settings">ACL migration settings</param>
        /// <param name="target">Target tenant context</param>
        /// <param name="progress">Progress reporting callback</param>
        /// <param name="cancellationToken">Cancellation token</param>
        /// <returns>ACL migration results with permission mappings</returns>
        Task<IList<AclMigrationResult>> MigrateAclsAsync(
            IEnumerable<AclData> acls,
            AclMigrationSettings settings,
            TargetContext target,
            IProgress<MigrationProgress>? progress = null,
            CancellationToken cancellationToken = default);

        /// <summary>
        /// Validates ACL permissions after migration to ensure security preservation
        /// </summary>
        /// <param name="sourceAcls">Original ACLs</param>
        /// <param name="targetAcls">Migrated permissions</param>
        /// <param name="target">Target tenant context</param>
        /// <param name="cancellationToken">Cancellation token</param>
        /// <returns>Validation results with permission discrepancies</returns>
        Task<AclValidationResult> ValidateAclMigrationAsync(
            IEnumerable<AclData> sourceAcls,
            IEnumerable<object> targetAcls,
            TargetContext target,
            CancellationToken cancellationToken = default);

        #endregion

        #region Dependency Resolution

        /// <summary>
        /// Analyzes group membership dependencies and creates migration plan
        /// </summary>
        /// <param name="groups">Groups to analyze</param>
        /// <param name="target">Target tenant context</param>
        /// <param name="cancellationToken">Cancellation token</param>
        /// <returns>Dependency graph and migration order</returns>
        Task<GroupDependencyResult> AnalyzeGroupDependenciesAsync(
            IEnumerable<Models.Identity.GroupData> groups,
            TargetContext target,
            CancellationToken cancellationToken = default);

        /// <summary>
        /// Resolves cross-domain group references and creates mapping strategies
        /// </summary>
        /// <param name="crossDomainRefs">Cross-domain group references</param>
        /// <param name="settings">Resolution settings</param>
        /// <param name="target">Target tenant context</param>
        /// <param name="cancellationToken">Cancellation token</param>
        /// <returns>Cross-domain resolution results</returns>
        Task<CrossDomainResolutionResult> ResolveCrossDomainReferencesAsync(
            IEnumerable<CrossDomainGroupRef> crossDomainRefs,
            CrossDomainResolutionSettings settings,
            TargetContext target,
            CancellationToken cancellationToken = default);

        #endregion

        #region Security and Compliance

        /// <summary>
        /// Performs security compliance validation for migrated groups and policies
        /// </summary>
        /// <param name="migrationResults">Results from group/policy migrations</param>
        /// <param name="complianceSettings">Compliance validation settings</param>
        /// <param name="target">Target tenant context</param>
        /// <param name="cancellationToken">Cancellation token</param>
        /// <returns>Compliance validation results</returns>
        Task<SecurityComplianceResult> ValidateSecurityComplianceAsync(
            IEnumerable<object> migrationResults,
            SecurityComplianceSettings complianceSettings,
            TargetContext target,
            CancellationToken cancellationToken = default);

        /// <summary>
        /// Creates audit trail for all groups/policy changes during migration
        /// </summary>
        /// <param name="migrationResults">Migration operation results</param>
        /// <param name="auditSettings">Audit configuration</param>
        /// <param name="cancellationToken">Cancellation token</param>
        /// <returns>Audit trail creation result</returns>
        Task<AuditTrailResult> CreateSecurityAuditTrailAsync(
            IEnumerable<object> migrationResults,
            SecurityAuditSettings auditSettings,
            CancellationToken cancellationToken = default);

        #endregion

        #region Rollback and Recovery

        /// <summary>
        /// Rolls back group migration by removing target groups and restoring source state
        /// </summary>
        /// <param name="groupIds">Groups to rollback</param>
        /// <param name="target">Target tenant context</param>
        /// <param name="progress">Progress reporting callback</param>
        /// <param name="cancellationToken">Cancellation token</param>
        /// <returns>Rollback operation results</returns>
        Task<IList<GroupRollbackResult>> RollbackGroupMigrationAsync(
            IEnumerable<string> groupIds,
            TargetContext target,
            IProgress<MigrationProgress>? progress = null,
            CancellationToken cancellationToken = default);

        /// <summary>
        /// Creates backup of current group/policy state before migration
        /// </summary>
        /// <param name="groups">Groups to backup</param>
        /// <param name="gpos">GPOs to backup</param>
        /// <param name="backupSettings">Backup configuration</param>
        /// <param name="cancellationToken">Cancellation token</param>
        /// <returns>Backup operation result</returns>
        Task<SecurityBackupResult> CreateSecurityBackupAsync(
            IEnumerable<Models.Identity.GroupData> groups,
            IEnumerable<GpoData> gpos,
            SecurityBackupSettings backupSettings,
            CancellationToken cancellationToken = default);

        #endregion

        #region Testing and Validation

        /// <summary>
        /// Tests connectivity to source AD and target Azure AD systems
        /// </summary>
        /// <param name="sourceContext">Source system context</param>
        /// <param name="target">Target tenant context</param>
        /// <param name="cancellationToken">Cancellation token</param>
        /// <returns>Connectivity test results</returns>
        Task<SecurityConnectivityResult> TestConnectivityAsync(
            SourceContext sourceContext,
            TargetContext target,
            CancellationToken cancellationToken = default);

        /// <summary>
        /// Validates that migrated groups function correctly with proper permissions
        /// </summary>
        /// <param name="groupIds">Target group IDs to validate</param>
        /// <param name="target">Target tenant context</param>
        /// <param name="cancellationToken">Cancellation token</param>
        /// <returns>Validation results for each group</returns>
        Task<IList<GroupValidationResult>> ValidateMigratedGroupsAsync(
            IEnumerable<string> groupIds,
            TargetContext target,
            CancellationToken cancellationToken = default);

        #endregion
    }
}