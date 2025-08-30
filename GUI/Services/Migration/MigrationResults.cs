using System;
using System.Collections.Generic;
using System.Linq;
using MandADiscoverySuite.Models;
using MandADiscoverySuite.Migration;

namespace MandADiscoverySuite.Services.Migration
{
    /// <summary>
    /// Base migration result with common properties
    /// </summary>
    public class MigrationResultBase : IMigrationResult
    {
        public bool IsSuccess { get; set; }
        
        /// <summary>
        /// Implements IMigrationResult.Success property for compatibility with generic interfaces
        /// </summary>
        public bool Success => IsSuccess;
        
        public string ErrorMessage { get; set; }
        public List<string> Warnings { get; set; } = new List<string>();
        public List<string> Errors { get; set; } = new List<string>();
        public DateTime StartTime { get; set; }
        public DateTime? EndTime { get; set; }
        public TimeSpan Duration => EndTime?.Subtract(StartTime) ?? TimeSpan.Zero;
        public Dictionary<string, object> Metadata { get; set; } = new Dictionary<string, object>();
        public string SessionId { get; set; }
        public string ExecutedBy { get; set; }
    }

    /// <summary>
    /// Generic migration result with typed result data
    /// </summary>
    public class MigrationResult<T> : MigrationResultBase
    {
        public T Result { get; set; }
        public string SourceId { get; set; }
        public string TargetId { get; set; }
        public Dictionary<string, string> MappingData { get; set; } = new Dictionary<string, string>();
    }

    /// <summary>
    /// Identity migration result
    /// </summary>
    public class IdentityMigrationResult
    {
        public string SourceUserSid { get; set; }
        public string TargetUserSid { get; set; }
        public string TargetUserUpn { get; set; }
        public Dictionary<string, string> AttributeMappings { get; set; } = new Dictionary<string, string>();
        public List<string> MigratedGroups { get; set; } = new List<string>();
        public bool SidHistoryCreated { get; set; }
        public List<string> UnmappedGroups { get; set; } = new List<string>();
        public Dictionary<string, object> CustomProperties { get; set; } = new Dictionary<string, object>();
    }

    /// <summary>
    /// Mail migration result
    /// </summary>
    public class MailMigrationResult
    {
        public string SourceMailboxId { get; set; }
        public string TargetMailboxId { get; set; }
        public string TargetEmailAddress { get; set; }
        public long MigratedItemCount { get; set; }
        public long MigratedSizeBytes { get; set; }
        public bool ForwardingConfigured { get; set; }
        public bool ArchiveMigrated { get; set; }
        public List<string> MigratedFolders { get; set; } = new List<string>();
        public List<string> SkippedFolders { get; set; } = new List<string>();
        public Dictionary<string, object> RetentionPolicies { get; set; } = new Dictionary<string, object>();
    }

    /// <summary>
    /// File migration result
    /// </summary>
    public class FileMigrationResult
    {
        public string SourcePath { get; set; }
        public string TargetPath { get; set; }
        public long MigratedFileCount { get; set; }
        public long MigratedSizeBytes { get; set; }
        public bool AclsMigrated { get; set; }
        public bool PermissionInheritanceConfigured { get; set; }
        public List<string> MigratedFiles { get; set; } = new List<string>();
        public List<string> SkippedFiles { get; set; } = new List<string>();
        public Dictionary<string, string> AclMappings { get; set; } = new Dictionary<string, string>();
        public string ShareName { get; set; }
        public Dictionary<string, object> ShareConfiguration { get; set; } = new Dictionary<string, object>();
    }

    /// <summary>
    /// SQL migration result
    /// </summary>
    public class SqlMigrationResult
    {
        public string SourceDatabaseId { get; set; }
        public string TargetDatabaseId { get; set; }
        public string TargetConnectionString { get; set; }
        public bool SchemaMigrated { get; set; }
        public bool DataMigrated { get; set; }
        public bool LoginsMigrated { get; set; }
        public long MigratedTableCount { get; set; }
        public long MigratedRowCount { get; set; }
        public List<string> MigratedTables { get; set; } = new List<string>();
        public List<string> SkippedTables { get; set; } = new List<string>();
        public Dictionary<string, string> UserMappings { get; set; } = new Dictionary<string, string>();
        public List<string> MigratedJobs { get; set; } = new List<string>();
    }

    /// <summary>
    /// Validation result for pre-migration checks
    /// </summary>
    public class ValidationResult : MigrationResultBase
    {
        public bool IsValid => IsSuccess && !Errors.Any();
        public string ValidationType { get; set; }
        public List<Models.ValidationIssue> Issues { get; set; } = new List<Models.ValidationIssue>();
        public Dictionary<string, object> ValidationData { get; set; } = new Dictionary<string, object>();
        public List<string> ValidationMessages { get; set; } = new List<string>();
    }

    /// <summary>
    /// Rollback result for migration reversal
    /// </summary>
    public class RollbackResult : MigrationResultBase
    {
        public string RollbackAction { get; set; }
        public List<string> RestoredItems { get; set; } = new List<string>();
        public List<string> UnrestoredItems { get; set; } = new List<string>();
        public bool DataRestored { get; set; }
        public bool PermissionsRestored { get; set; }
    }

    /// <summary>
    /// SID mapping result for identity operations
    /// </summary>
    public class SidMappingResult : MigrationResultBase
    {
        public string SourceSid { get; set; }
        public string TargetSid { get; set; }
        public bool HistoryCreated { get; set; }
        public Dictionary<string, string> RelatedMappings { get; set; } = new Dictionary<string, string>();
    }

    /// <summary>
    /// Group membership migration result
    /// </summary>
    public class GroupMembershipResult : MigrationResultBase
    {
        public string UserSid { get; set; }
        public List<string> SourceGroups { get; set; } = new List<string>();
        public List<string> MigratedGroups { get; set; } = new List<string>();
        public List<string> UnmappedGroups { get; set; } = new List<string>();
        public Dictionary<string, string> GroupMappings { get; set; } = new Dictionary<string, string>();
    }

    /// <summary>
    /// Attribute mapping result for user properties
    /// </summary>
    public class AttributeMappingResult : MigrationResultBase
    {
        public string UserUpn { get; set; }
        public Dictionary<string, string> SourceAttributes { get; set; } = new Dictionary<string, string>();
        public Dictionary<string, string> TargetAttributes { get; set; } = new Dictionary<string, string>();
        public List<string> UnmappedAttributes { get; set; } = new List<string>();
    }

    /// <summary>
    /// Dependency validation result
    /// </summary>
    public class DependencyValidationResult : MigrationResultBase
    {
        public string ItemId { get; set; }
        public List<string> Dependencies { get; set; } = new List<string>();
        public List<string> MissingDependencies { get; set; } = new List<string>();
        public List<string> CircularDependencies { get; set; } = new List<string>();
        public bool CanProceed { get; set; }
    }

    /// <summary>
    /// Mail forwarding configuration result
    /// </summary>
    public class ForwardingResult : MigrationResultBase
    {
        public string SourceEmailAddress { get; set; }
        public string TargetEmailAddress { get; set; }
        public string ForwardingType { get; set; } // Internal, External, Both
        public bool PreserveOriginalMail { get; set; }
        public DateTime ExpirationDate { get; set; }
    }

    /// <summary>
    /// Archive migration result
    /// </summary>
    public class ArchiveMigrationResult : MigrationResultBase
    {
        public string MailboxId { get; set; }
        public long ArchiveItemCount { get; set; }
        public long ArchiveSizeBytes { get; set; }
        public List<string> MigratedArchiveFolders { get; set; } = new List<string>();
        public bool RetentionPoliciesApplied { get; set; }
    }

    /// <summary>
    /// Retention policy application result
    /// </summary>
    public class RetentionPolicyResult : MigrationResultBase
    {
        public string MailboxId { get; set; }
        public Dictionary<string, object> AppliedPolicies { get; set; } = new Dictionary<string, object>();
        public List<string> PolicyConflicts { get; set; } = new List<string>();
    }

    /// <summary>
    /// Mailbox validation result
    /// </summary>
    public class MailboxValidationResult : MigrationResultBase
    {
        public string MailboxId { get; set; }
        public long MailboxSizeBytes { get; set; }
        public long MaxAllowedSizeBytes { get; set; }
        public bool LicensingValid { get; set; }
        public List<string> MissingLicenses { get; set; } = new List<string>();
        public bool QuotaValid { get; set; }
    }

    /// <summary>
    /// Distribution list migration result
    /// </summary>
    public class DistributionListResult : MigrationResultBase
    {
        public List<string> MigratedLists { get; set; } = new List<string>();
        public List<string> SkippedLists { get; set; } = new List<string>();
        public Dictionary<string, List<string>> MembershipMappings { get; set; } = new Dictionary<string, List<string>>();
    }

    /// <summary>
    /// ACL migration result for file operations
    /// </summary>
    public class AclMigrationResult : MigrationResultBase
    {
        public string TargetPath { get; set; }
        public int MigratedAclCount { get; set; }
        public int UnmappedAclCount { get; set; }
        public Dictionary<string, string> SidMappings { get; set; } = new Dictionary<string, string>();
        public List<string> ConflictingPermissions { get; set; } = new List<string>();
    }

    /// <summary>
    /// Content validation result for file integrity
    /// </summary>
    public class ContentValidationResult : MigrationResultBase
    {
        public string SourcePath { get; set; }
        public string TargetPath { get; set; }
        public long SourceFileCount { get; set; }
        public long TargetFileCount { get; set; }
        public long SourceSizeBytes { get; set; }
        public long TargetSizeBytes { get; set; }
        public List<string> MismatchedFiles { get; set; } = new List<string>();
        public string ChecksumValidation { get; set; }
    }

    /// <summary>
    /// Permission inheritance configuration result
    /// </summary>
    public class PermissionInheritanceResult : MigrationResultBase
    {
        public string TargetPath { get; set; }
        public bool InheritanceEnabled { get; set; }
        public List<string> AffectedSubItems { get; set; } = new List<string>();
    }

    /// <summary>
    /// Share configuration migration result
    /// </summary>
    public class ShareConfigurationResult : MigrationResultBase
    {
        public string SourceShareName { get; set; }
        public string TargetShareName { get; set; }
        public Dictionary<string, object> ShareProperties { get; set; } = new Dictionary<string, object>();
        public bool PermissionsMigrated { get; set; }
    }

    /// <summary>
    /// File system validation result
    /// </summary>
    public class FileSystemValidationResult : MigrationResultBase
    {
        public string FileSystemType { get; set; }
        public bool CompatibilityValid { get; set; }
        public List<string> UnsupportedFeatures { get; set; } = new List<string>();
        public long AvailableSpaceBytes { get; set; }
        public long RequiredSpaceBytes { get; set; }
    }

    /// <summary>
    /// Schema compatibility validation result
    /// </summary>
    public class SchemaCompatibilityResult : MigrationResultBase
    {
        public string SourceDatabaseId { get; set; }
        public string TargetConnectionString { get; set; }
        public string SourceVersion { get; set; }
        public string TargetVersion { get; set; }
        public bool VersionCompatible { get; set; }
        public List<string> IncompatibleFeatures { get; set; } = new List<string>();
        public List<string> RequiredConversions { get; set; } = new List<string>();
    }

    /// <summary>
    /// Login migration result for SQL operations
    /// </summary>
    public class LoginMigrationResult : MigrationResultBase
    {
        public string SourceDatabaseId { get; set; }
        public string TargetDatabaseId { get; set; }
        public List<string> MigratedLogins { get; set; } = new List<string>();
        public List<string> SkippedLogins { get; set; } = new List<string>();
        public Dictionary<string, string> UserMappings { get; set; } = new Dictionary<string, string>();
    }

    /// <summary>
    /// Data validation result for SQL integrity
    /// </summary>
    public class DataValidationResult : MigrationResultBase
    {
        public string SourceDatabaseId { get; set; }
        public string TargetDatabaseId { get; set; }
        public long SourceRowCount { get; set; }
        public long TargetRowCount { get; set; }
        public List<string> ValidatedTables { get; set; } = new List<string>();
        public List<string> MismatchedTables { get; set; } = new List<string>();
        public string IntegrityCheckResult { get; set; }
    }

    /// <summary>
    /// Linked server migration result
    /// </summary>
    public class LinkedServerResult : MigrationResultBase
    {
        public List<string> MigratedServers { get; set; } = new List<string>();
        public List<string> SkippedServers { get; set; } = new List<string>();
        public Dictionary<string, string> ConnectionMappings { get; set; } = new Dictionary<string, string>();
    }

    /// <summary>
    /// SQL Agent job migration result
    /// </summary>
    public class SqlAgentJobResult : MigrationResultBase
    {
        public List<string> MigratedJobs { get; set; } = new List<string>();
        public List<string> SkippedJobs { get; set; } = new List<string>();
        public Dictionary<string, List<string>> JobScheduleMappings { get; set; } = new Dictionary<string, List<string>>();
        public List<string> JobDependencies { get; set; } = new List<string>();
    }
}