using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using MandADiscoverySuite.Models;

namespace MandADiscoverySuite.Services.Migration
{
    /// <summary>
    /// Core migration provider interface for type-safe migration operations
    /// </summary>
    public interface IMigrationProvider<TItem, TResult>
    {
        /// <summary>
        /// Migrate an item from source to target environment
        /// </summary>
        Task<MigrationResult<TResult>> MigrateAsync(TItem item, MigrationContext context, CancellationToken cancellationToken = default);

        /// <summary>
        /// Validate an item before migration
        /// </summary>
        Task<ValidationResult> ValidateAsync(TItem item, MigrationContext context, CancellationToken cancellationToken = default);

        /// <summary>
        /// Rollback a completed migration
        /// </summary>
        Task<RollbackResult> RollbackAsync(TResult result, MigrationContext context, CancellationToken cancellationToken = default);

        /// <summary>
        /// Check if this provider supports the migration type and context
        /// </summary>
        Task<bool> SupportsAsync(MigrationType type, MigrationContext context, CancellationToken cancellationToken = default);

        /// <summary>
        /// Get estimated duration for migration
        /// </summary>
        Task<TimeSpan> EstimateDurationAsync(TItem item, MigrationContext context, CancellationToken cancellationToken = default);
    }

    /// <summary>
    /// Identity migration provider for user accounts, groups, and attributes
    /// </summary>
    public interface IIdentityMigrator : IMigrationProvider<UserProfileItem, IdentityMigrationResult>
    {
        /// <summary>
        /// Create SID history for seamless access during transition
        /// </summary>
        Task<SidMappingResult> CreateSidHistoryAsync(string sourceUserSid, string targetUserSid, MigrationContext context, CancellationToken cancellationToken = default);

        /// <summary>
        /// Migrate user group memberships to target domain
        /// </summary>
        Task<GroupMembershipResult> MigrateGroupMembershipsAsync(List<string> sourceGroups, string targetUserSid, MigrationContext context, CancellationToken cancellationToken = default);

        /// <summary>
        /// Migrate user attributes and properties
        /// </summary>
        Task<SimpleAttributeMappingResult> MigrateUserAttributesAsync(Dictionary<string, string> sourceAttributes, string targetUserUpn, MigrationContext context, CancellationToken cancellationToken = default);

        /// <summary>
        /// Validate user dependencies (managers, reports, group ownership)
        /// </summary>
        Task<DependencyValidationResult> ValidateUserDependenciesAsync(UserProfileItem user, MigrationContext context, CancellationToken cancellationToken = default);
    }

    /// <summary>
    /// Mail migration provider for Exchange mailboxes and archives
    /// </summary>
    public interface IMailMigrator : IMigrationProvider<MailboxItem, MailMigrationResult>
    {
        /// <summary>
        /// Setup mail forwarding from source to target during transition
        /// </summary>
        Task<ForwardingResult> SetupMailForwardingAsync(string sourceEmailAddress, string targetEmailAddress, MigrationContext context, CancellationToken cancellationToken = default);

        /// <summary>
        /// Migrate mailbox archive data
        /// </summary>
        Task<ArchiveMigrationResult> MigrateArchiveAsync(string mailboxId, MigrationContext context, CancellationToken cancellationToken = default);

        /// <summary>
        /// Apply retention policies to target mailbox
        /// </summary>
        Task<RetentionPolicyResult> ApplyRetentionPoliciesAsync(string targetMailboxId, Dictionary<string, object> policies, MigrationContext context, CancellationToken cancellationToken = default);

        /// <summary>
        /// Validate mailbox size and licensing requirements
        /// </summary>
        Task<MailboxValidationResult> ValidateMailboxRequirementsAsync(MailboxItem mailbox, MigrationContext context, CancellationToken cancellationToken = default);

        /// <summary>
        /// Migrate distribution lists and mail-enabled security groups
        /// </summary>
        Task<DistributionListResult> MigrateDistributionListsAsync(List<string> distributionListIds, MigrationContext context, CancellationToken cancellationToken = default);
    }

    /// <summary>
    /// File migration provider for file shares and documents
    /// </summary>
    public interface IFileMigrator : IMigrationProvider<FileShareItem, FileMigrationResult>
    {
        /// <summary>
        /// Recreate ACLs on target file system with SID mapping
        /// </summary>
        Task<AclMigrationResult> RecreateAclsAsync(string targetPath, List<AclEntry> sourceAcls, Dictionary<string, string> sidMapping, MigrationContext context, CancellationToken cancellationToken = default);

        /// <summary>
        /// Validate content integrity after migration
        /// </summary>
        Task<ContentValidationResult> ValidateContentIntegrityAsync(string sourcePath, string targetPath, MigrationContext context, CancellationToken cancellationToken = default);

        /// <summary>
        /// Configure permission inheritance on target directories
        /// </summary>
        Task<PermissionInheritanceResult> SetPermissionInheritanceAsync(string targetPath, bool enableInheritance, MigrationContext context, CancellationToken cancellationToken = default);

        /// <summary>
        /// Migrate file server share configurations
        /// </summary>
        Task<ShareConfigurationResult> MigrateShareConfigurationAsync(string sourceShareName, string targetShareName, MigrationContext context, CancellationToken cancellationToken = default);

        /// <summary>
        /// Validate file system compatibility and constraints
        /// </summary>
        Task<FileSystemValidationResult> ValidateFileSystemCompatibilityAsync(FileShareItem fileShare, MigrationContext context, CancellationToken cancellationToken = default);
    }

    /// <summary>
    /// SQL migration provider for databases and applications
    /// </summary>
    public interface ISqlMigrator : IMigrationProvider<DatabaseItem, SqlMigrationResult>
    {
        /// <summary>
        /// Validate schema compatibility between source and target
        /// </summary>
        Task<SchemaCompatibilityResult> ValidateSchemaCompatibilityAsync(string sourceDatabaseId, string targetConnectionString, MigrationContext context, CancellationToken cancellationToken = default);

        /// <summary>
        /// Migrate database logins and user mappings
        /// </summary>
        Task<LoginMigrationResult> MigrateLoginsAndUsersAsync(string sourceDatabaseId, string targetDatabaseId, Dictionary<string, string> userMapping, MigrationContext context, CancellationToken cancellationToken = default);

        /// <summary>
        /// Validate data integrity after migration
        /// </summary>
        Task<DataValidationResult> ValidateDataIntegrityAsync(string sourceDatabaseId, string targetDatabaseId, MigrationContext context, CancellationToken cancellationToken = default);

        /// <summary>
        /// Migrate database-linked server configurations
        /// </summary>
        Task<LinkedServerResult> MigrateLinkedServersAsync(string sourceDatabaseId, string targetDatabaseId, MigrationContext context, CancellationToken cancellationToken = default);

        /// <summary>
        /// Migrate SQL Agent jobs and schedules
        /// </summary>
        Task<SqlAgentJobResult> MigrateSqlAgentJobsAsync(List<string> jobIds, string targetInstanceId, MigrationContext context, CancellationToken cancellationToken = default);
    }

}