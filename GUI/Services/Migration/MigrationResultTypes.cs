using System;
using System.Collections.Generic;

namespace MandADiscoverySuite.Services.Migration
{
    // Base result classes for migration operations
    
    public class GroupMigrationResult : MigrationResultBase
    {
        public string GroupId { get; set; }
        public string GroupName { get; set; }
        public int MembersAdded { get; set; }
        public int MembersFailed { get; set; }
        public List<string> MemberErrors { get; set; } = new List<string>();
    }

    public class IdentityMigrationResult : MigrationResultBase
    {
        public string UserId { get; set; }
        public string UserPrincipalName { get; set; }
        public bool AccountCreated { get; set; }
        public bool AttributesSynced { get; set; }
        public List<string> AssignedLicenses { get; set; } = new List<string>();
    }

    public class MailMigrationResult : MigrationResultBase
    {
        public string MailboxId { get; set; }
        public long ItemsMigrated { get; set; }
        public long BytesMigrated { get; set; }
        public bool ArchiveMigrated { get; set; }
    }

    public class FileMigrationResult : MigrationResultBase
    {
        public string SourcePath { get; set; }
        public string TargetPath { get; set; }
        public long FilesMigrated { get; set; }
        public long BytesMigrated { get; set; }
        public bool PermissionsPreserved { get; set; }
    }

    public class SqlMigrationResult : MigrationResultBase
    {
        public string DatabaseName { get; set; }
        public string SourceServer { get; set; }
        public string TargetServer { get; set; }
        public long RecordsMigrated { get; set; }
        public bool SchemaUpdated { get; set; }
    }

    public class GpoMigrationResult : MigrationResultBase
    {
        public string GpoId { get; set; }
        public string GpoName { get; set; }
        public int SettingsMigrated { get; set; }
        public bool LinkedToOu { get; set; }
    }

    public class AclMigrationResult : MigrationResultBase
    {
        public string ResourcePath { get; set; }
        public int AcesProcessed { get; set; }
        public int SidsTranslated { get; set; }
        public bool InheritancePreserved { get; set; }
    }

    // Validation and support result classes

    public class ValidationResult : MigrationResultBase
    {
        public bool IsValid { get; set; }
        public List<string> ValidationErrors { get; set; } = new List<string>();
        public List<string> ValidationWarnings { get; set; } = new List<string>();
    }

    public class RollbackResult : MigrationResultBase
    {
        public bool CanRollback { get; set; }
        public bool RollbackCompleted { get; set; }
        public string RollbackMethod { get; set; }
        public List<string> RemainingArtifacts { get; set; } = new List<string>();
    }

    // Specific migration result classes for detailed operations

    public class SidMappingResult : MigrationResultBase
    {
        public string SourceSid { get; set; }
        public string TargetSid { get; set; }
        public bool MappingSuccessful { get; set; }
        public string MappingMethod { get; set; }
    }

    public class GroupMembershipResult : MigrationResultBase
    {
        public string UserId { get; set; }
        public List<string> AddedGroups { get; set; } = new List<string>();
        public List<string> FailedGroups { get; set; } = new List<string>();
    }

    public class SimpleAttributeMappingResult : MigrationResultBase
    {
        public string AttributeName { get; set; }
        public string SourceValue { get; set; }
        public string TargetValue { get; set; }
        public bool MappingApplied { get; set; }
    }

    public class DependencyValidationResult : MigrationResultBase
    {
        public List<string> Dependencies { get; set; } = new List<string>();
        public List<string> MissingDependencies { get; set; } = new List<string>();
        public bool AllDependenciesMet { get; set; }
    }

    // Exchange/Mail specific results

    public class ForwardingResult : MigrationResultBase
    {
        public string SourceMailbox { get; set; }
        public string TargetMailbox { get; set; }
        public bool ForwardingEnabled { get; set; }
        public string ForwardingRule { get; set; }
    }

    public class ArchiveMigrationResult : MigrationResultBase
    {
        public string MailboxId { get; set; }
        public long ArchiveItemsMigrated { get; set; }
        public long ArchiveBytesMigrated { get; set; }
        public bool OnlineArchiveEnabled { get; set; }
    }

    public class RetentionPolicyResult : MigrationResultBase
    {
        public string PolicyName { get; set; }
        public string MailboxId { get; set; }
        public bool PolicyApplied { get; set; }
        public List<string> RetentionTags { get; set; } = new List<string>();
    }

    public class MailboxValidationResult : MigrationResultBase
    {
        public string MailboxId { get; set; }
        public bool MailboxExists { get; set; }
        public bool PermissionsValid { get; set; }
        public long MailboxSize { get; set; }
        public string MailboxType { get; set; }
    }

    public class DistributionListResult : MigrationResultBase
    {
        public string ListId { get; set; }
        public string ListName { get; set; }
        public int MembersCount { get; set; }
        public bool ExternalSendingEnabled { get; set; }
    }

    // File migration specific results

    public class ContentValidationResult : MigrationResultBase
    {
        public string FilePath { get; set; }
        public bool ContentMatches { get; set; }
        public string HashAlgorithm { get; set; }
        public string SourceHash { get; set; }
        public string TargetHash { get; set; }
    }

    public class PermissionInheritanceResult : MigrationResultBase
    {
        public string ResourcePath { get; set; }
        public bool InheritanceEnabled { get; set; }
        public bool InheritancePreserved { get; set; }
        public List<string> InheritedPermissions { get; set; } = new List<string>();
    }

    public class ShareConfigurationResult : MigrationResultBase
    {
        public string ShareName { get; set; }
        public string SharePath { get; set; }
        public string ShareType { get; set; }
        public bool ShareRecreated { get; set; }
        public List<string> SharePermissions { get; set; } = new List<string>();
    }

    public class FileSystemValidationResult : MigrationResultBase
    {
        public string Path { get; set; }
        public bool PathExists { get; set; }
        public bool AccessPermissionValid { get; set; }
        public long AvailableSpace { get; set; }
        public long RequiredSpace { get; set; }
    }

    // SQL migration specific results

    public class SchemaCompatibilityResult : MigrationResultBase
    {
        public string DatabaseName { get; set; }
        public string SourceVersion { get; set; }
        public string TargetVersion { get; set; }
        public bool CompatibilityValid { get; set; }
        public List<string> IncompatibleFeatures { get; set; } = new List<string>();
    }

    public class LoginMigrationResult : MigrationResultBase
    {
        public string LoginName { get; set; }
        public string DatabaseName { get; set; }
        public bool LoginRecreated { get; set; }
        public bool PermissionsMapped { get; set; }
    }

    public class DataValidationResult : MigrationResultBase
    {
        public string TableName { get; set; }
        public long SourceRecordCount { get; set; }
        public long TargetRecordCount { get; set; }
        public bool RecordCountMatches { get; set; }
        public List<string> DataInconsistencies { get; set; } = new List<string>();
    }

    public class LinkedServerResult : MigrationResultBase
    {
        public string ServerName { get; set; }
        public string DataSource { get; set; }
        public bool ServerRecreated { get; set; }
        public bool ConnectionValid { get; set; }
    }

    public class SqlAgentJobResult : MigrationResultBase
    {
        public string JobName { get; set; }
        public bool JobRecreated { get; set; }
        public bool SchedulesMigrated { get; set; }
        public List<string> JobSteps { get; set; } = new List<string>();
    }

    // Group migration specific results

    public class GroupMembershipMigrationResult : MigrationResultBase
    {
        public string GroupId { get; set; }
        public List<string> MembersAdded { get; set; } = new List<string>();
        public List<string> MembersFailed { get; set; } = new List<string>();
        public bool NestedGroupsProcessed { get; set; }
    }

    public class GroupConflictResolutionResult : MigrationResultBase
    {
        public string ConflictingGroupName { get; set; }
        public string ResolutionMethod { get; set; }
        public string NewGroupName { get; set; }
        public bool ConflictResolved { get; set; }
    }

    public class GroupDependencyValidationResult : MigrationResultBase
    {
        public string GroupId { get; set; }
        public List<string> DependentGroups { get; set; } = new List<string>();
        public List<string> MissingDependencies { get; set; } = new List<string>();
        public bool DependenciesValid { get; set; }
    }

    public class ServiceAccountMigrationResult : MigrationResultBase
    {
        public string ServiceAccountName { get; set; }
        public bool AccountMigrated { get; set; }
        public bool ServiceUpdated { get; set; }
        public List<string> AffectedServices { get; set; } = new List<string>();
    }

    // Migration context progress tracking

    public class MigrationProgress
    {
        public int TotalItems { get; set; }
        public int ProcessedItems { get; set; }
        public int FailedItems { get; set; }
        public double PercentComplete => TotalItems > 0 ? (double)ProcessedItems / TotalItems * 100 : 0;
        public string CurrentOperation { get; set; }
        public DateTime StartTime { get; set; }
        public TimeSpan ElapsedTime { get; set; }
        public TimeSpan EstimatedTimeRemaining { get; set; }
        public List<string> RecentMessages { get; set; } = new List<string>();
    }
}