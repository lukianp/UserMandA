using System;
using System.Collections.Generic;

namespace MandADiscoverySuite.Services.Migration
{
    // Base result classes for migration operations
    
    public class GroupMigrationResult : MigrationResultBase
    {
        public string GroupId { get; set; }
        public string GroupName { get; set; }
        public string TargetGroupName { get; set; } = string.Empty;
        public string TargetGroupId { get; set; } = string.Empty;
        public string TargetGroupSid { get; set; } = string.Empty;
        public string TargetDistinguishedName { get; set; } = string.Empty;
        public bool GroupCreated { get; set; }
        public bool MembershipsReplicatedFromSource { get; set; }
        public int MembersAdded { get; set; }
        public int MembersFailed { get; set; }
        public List<string> MemberErrors { get; set; } = new List<string>();
        public List<string> MigratedMembers { get; set; } = new List<string>();
        public List<string> UnmappedMembers { get; set; } = new List<string>();
        public Dictionary<string, string> MemberSidMappings { get; set; } = new Dictionary<string, string>();
        public bool NestedGroupsProcessed { get; set; }
        public Dictionary<string, object> GroupAttributes { get; set; } = new Dictionary<string, object>();
        public string SourceGroupSid { get; set; } = string.Empty;
        public string ExecutedBy { get; set; } = string.Empty;

        // Additional fields for comprehensive migration tracking
        public Dictionary<string, string> GroupSidMappings { get; set; } = new Dictionary<string, string>();
        public bool ConflictsResolved { get; set; }
        public List<string> SkippedGroupSids { get; set; } = new List<string>();
        public Dictionary<string, string> ResolutionDetails { get; set; } = new Dictionary<string, string>();
        public Dictionary<string, string> ConflictResolutionMappings { get; set; } = new Dictionary<string, string>();
        public int TotalConflicts { get; set; }
        public int ResolvedConflicts { get; set; }
    }

    public class IdentityMigrationResult : MigrationResultBase
    {
        public string UserId { get; set; }
        public string UserPrincipalName { get; set; }
        public bool AccountCreated { get; set; }
        public bool AttributesSynced { get; set; }
        public List<string> AssignedLicenses { get; set; } = new List<string>();
        
        // Additional properties required by build errors
        public string TargetUserUpn { get; set; } = string.Empty;
        public string SourceUserSid { get; set; } = string.Empty;
        public string TargetUserSid { get; set; } = string.Empty;
        public Dictionary<string, string> AttributeMappings { get; set; } = new Dictionary<string, string>();
        public List<string> MigratedGroups { get; set; } = new List<string>();
        public List<string> UnmappedGroups { get; set; } = new List<string>();
        public bool SidHistoryCreated { get; set; }
        public Dictionary<string, object> CustomProperties { get; set; } = new Dictionary<string, object>();
        public List<string> UnrestoredItems { get; set; } = new List<string>();
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
        public string TargetGpoId { get; set; } = string.Empty;
        public string TargetGpoName { get; set; } = string.Empty;
        public int SettingsMigrated { get; set; }
        public bool LinkedToOu { get; set; }

        // Additional properties required by build errors
        public List<string> UnrestoredItems { get; set; } = new List<string>();
        public string SourceGpoGuid { get; set; } = string.Empty;
        public string SourceGpoId { get; set; } = string.Empty;
        public string TargetGpoGuid { get; set; } = string.Empty;
        public List<string> MigratedSettings { get; set; } = new List<string>();
        public List<string> SkippedSettings { get; set; } = new List<string>();
        public new List<string> Warnings { get; set; } = new List<string>();
        public DateTime MigrationDate { get; set; } = DateTime.Now;
        public string ExecutedBy { get; set; } = string.Empty;
        public bool GpoCreated { get; set; }
        public bool SettingsReplicated { get; set; }
        public GpoReplicationResult ReplicatedSettings { get; set; }
        public List<string> UnsupportedSettings { get; set; } = new List<string>();
        public bool OuLinksConfigured { get; set; }
        public List<string> LinkedOUs { get; set; } = new List<string>();
        public bool SecurityFilteringApplied { get; set; }
        public bool WmiFiltersApplied { get; set; }
        public TimeSpan MigrationDuration { get; set; }
        public Dictionary<string, object> MigrationDetails { get; set; } = new Dictionary<string, object>();
    }
    
    // Rollback result class for migration operations
    public class RollbackResult : MigrationResultBase
    {
        public string OperationId { get; set; } = string.Empty;
        public bool RollbackSuccessful { get; set; }
        public List<string> RolledBackItems { get; set; } = new List<string>();
        public List<string> FailedRollbacks { get; set; } = new List<string>();
        public string RollbackReason { get; set; } = string.Empty;
        public DateTime RollbackStarted { get; set; } = DateTime.Now;
        public DateTime RollbackCompleted { get; set; }
        public DateTime RolledBackAt { get; set; } = DateTime.Now;
        public DateTime RollbackDate => RolledBackAt;

        // Additional properties required by build errors
        public List<string> UnrestoredItems { get; set; } = new List<string>();
        public string RollbackAction { get; set; } = string.Empty;
        public new List<string> Warnings { get; set; } = new List<string>();
        public List<string> RestoredItems { get; set; } = new List<string>();
        public bool DataRestored { get; set; }
        public string ExecutedBy { get; set; } = string.Empty;
        
        // Factory methods required by build errors
        public static RollbackResult Succeeded(string operationId, string reason = "")
        {
            return new RollbackResult
            {
                OperationId = operationId,
                RollbackSuccessful = true,
                IsSuccess = true,
                RollbackReason = reason,
                RollbackCompleted = DateTime.Now
            };
        }
        
        public static RollbackResult Failed(string operationId, string reason = "")
        {
            return new RollbackResult
            {
                OperationId = operationId,
                RollbackSuccessful = false,
                IsSuccess = false,
                RollbackReason = reason,
                RollbackCompleted = DateTime.Now
            };
        }
        
        public static RollbackResult Failed(string reason, List<string> errors)
        {
            return new RollbackResult
            {
                RollbackSuccessful = false,
                IsSuccess = false,
                RollbackReason = reason,
                Errors = errors,
                RollbackCompleted = DateTime.Now
            };
        }
    }

    public class AclMigrationResult : MigrationResultBase
    {
        public string ResourcePath { get; set; }
        public string SourcePath { get; set; }  // Alias for ResourcePath
        public string TargetPath { get; set; } = string.Empty;
        public int AcesProcessed { get; set; }
        public int SidsTranslated { get; set; }
        public bool InheritancePreserved { get; set; }
    }

    // Validation and support result classes are now in Services.Migration namespace

    // GPO-related result types
    public class GpoReplicationResult : MigrationResultBase
    {
        public Dictionary<string, object> PolicySettings { get; set; } = new Dictionary<string, object>();
        public List<string> SkippedSettings { get; set; } = new List<string>();
        public int ReplicatedSettingCount { get; set; }
        public string SourceGpoId { get; set; }
        public string TargetOuPath { get; set; }
        public TimeSpan MigrationDuration { get; set; }
        public Dictionary<string, object> MigrationDetails { get; set; } = new Dictionary<string, object>();
        public bool SettingsReplicated { get; set; }
    }

    public class GpoSecurityFilterResult : MigrationResultBase
    {
        public string GpoId { get; set; }
        public List<string> SourceSecurityPrincipals { get; set; } = new List<string>();
        public List<string> MigratedSecurityPrincipals { get; set; } = new List<string>();
        public List<string> UnmappedPrincipals { get; set; } = new List<string>();
        public bool SecurityFilteringEnabled { get; set; }
        public Dictionary<string, string> PrincipalSidMappings { get; set; } = new Dictionary<string, string>();
    }

    public class WmiFilterMigrationResult : MigrationResultBase
    {
        public List<string> MigratedFilters { get; set; } = new List<string>();
        public List<string> SkippedFilters { get; set; } = new List<string>();
        public Dictionary<string, string> FilterSidMappings { get; set; } = new Dictionary<string, string>();
        public bool AllFiltersCompatible { get; set; }
        public Dictionary<string, List<string>> WmiQueries { get; set; } = new Dictionary<string, List<string>>();
    }

    // GroupConflictResolutionResult defined below with full implementation

    public class GpoBackupResult
    {
        public bool Success { get; set; }
        public bool IsSuccess => Success;
        public string BackupPath { get; set; } = string.Empty;
        public string BackupLocation { get; set; } = string.Empty;
        public string ErrorMessage { get; set; } = string.Empty;
        public List<string> FailedBackups { get; set; } = new List<string>();
        public List<string> Warnings { get; set; } = new List<string>();
        public long BackupSizeBytes { get; set; }
        public List<string> BackedUpGpoIds { get; set; } = new List<string>();
        public DateTime EndTime { get; set; } = DateTime.Now;
        public List<string> Errors { get; set; } = new List<string>();
    }

    // Specific migration result classes for detailed operations

    public class SidMappingResult : MigrationResultBase
    {
        public string SourceSid { get; set; }
        public string TargetSid { get; set; }
        public bool MappingSuccessful { get; set; }
        public string MappingMethod { get; set; }
        
        // Additional properties required by build errors
        public string SessionId { get; set; } = string.Empty;
        public new List<string> Warnings { get; set; } = new List<string>();
        public bool HistoryCreated { get; set; }
    }

    public class GroupMembershipResult : MigrationResultBase
    {
        public string UserId { get; set; }
        public List<string> AddedGroups { get; set; } = new List<string>();
        public List<string> FailedGroups { get; set; } = new List<string>();

        // Additional properties required by build errors
        public string UserSid { get; set; } = string.Empty;
        public List<string> SourceGroups { get; set; } = new List<string>();
        public string SessionId { get; set; } = string.Empty;
        public List<string> MigratedGroups { get; set; } = new List<string>();
        public List<string> UnmappedGroups { get; set; } = new List<string>();
        public Dictionary<string, string> GroupMappings { get; set; } = new Dictionary<string, string>();
        public new List<string> Warnings { get; set; } = new List<string>();
    }

    public class SimpleAttributeMappingResult : MigrationResultBase
    {
        public string AttributeName { get; set; }
        public string SourceValue { get; set; }
        public string TargetValue { get; set; }
        public bool MappingApplied { get; set; }
        
        // Additional properties required by build errors
        public string UserUpn { get; set; } = string.Empty;
        public Dictionary<string, string> SourceAttributes { get; set; } = new Dictionary<string, string>();
        public string SessionId { get; set; } = string.Empty;
        public Dictionary<string, string> TargetAttributes { get; set; } = new Dictionary<string, string>();
        public List<string> UnmappedAttributes { get; set; } = new List<string>();
    }

    public class DependencyValidationResult : MigrationResultBase
    {
        public List<string> Dependencies { get; set; } = new List<string>();
        public List<string> MissingDependencies { get; set; } = new List<string>();
        public bool AllDependenciesMet { get; set; }
        
        // Additional properties required by build errors
        public string ItemId { get; set; } = string.Empty;
        public string SessionId { get; set; } = string.Empty;
        public bool CanProceed { get; set; }
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
        public string GroupSid { get; set; } = string.Empty;
        public List<string> MembersAdded { get; set; } = new List<string>();
        public List<string> MembersFailed { get; set; } = new List<string>();
        public List<string> SourceMemberSids { get; set; } = new List<string>();
        public List<string> MigratedMemberSids { get; set; } = new List<string>();
        public List<string> UnmappedMemberSids { get; set; } = new List<string>();
        public Dictionary<string, string> MemberSidMappings { get; set; } = new Dictionary<string, string>();
        public bool NestedGroupsProcessed { get; set; }
        public bool NestedGroupsIncluded { get; set; }
        public string ExecutedBy { get; set; }
    }

    public class GroupConflictResolutionResult : MigrationResultBase
    {
        public string ConflictingGroupName { get; set; }
        public string ResolutionMethod { get; set; }
        public string NewGroupName { get; set; }
        public bool ConflictResolved { get; set; }
        public Dictionary<string, string> RenamedGroups { get; set; } = new Dictionary<string, string>();
        public Dictionary<string, string> ResolutionActions { get; set; } = new Dictionary<string, string>();
        public List<string> ResolvedGroups { get; set; } = new List<string>();
        public List<string> UnresolvedConflicts { get; set; } = new List<string>();
        public int ConflictsIdentified { get; set; }
        public int ConflictsResolved { get; set; }
        public string ExecutedBy { get; set; }
    }

    public class GroupDependencyValidationResult : MigrationResultBase
    {
        public string GroupId { get; set; }
        public List<string> DependentGroups { get; set; } = new List<string>();
        public List<string> MissingDependencies { get; set; } = new List<string>();
        public bool DependenciesValid { get; set; }

        // Additional properties required by build errors
        public int TotalGroupsAnalyzed { get; set; }
        public string ExecutedBy { get; set; }
        public Dictionary<string, List<string>> DependencyMap { get; set; } = new Dictionary<string, List<string>>();
        public List<string> CircularDependencies { get; set; } = new List<string>();
        public List<string> OrphanedGroups { get; set; } = new List<string>();
        public List<string> ValidatedGroups { get; set; } = new List<string>();
        public bool MigrationSafetyConfirmed { get; set; }
    }

    public class ServiceAccountMigrationResult : MigrationResultBase
    {
        public string ServiceAccountName { get; set; }
        public bool AccountMigrated { get; set; }
        public bool ServiceUpdated { get; set; }
        public List<string> AffectedServices { get; set; } = new List<string>();

        // Additional properties required by build errors
        public string ExecutedBy { get; set; }
        public List<string> MigratedServiceAccounts { get; set; } = new List<string>();
        public Dictionary<string, string> ServiceAccountMappings { get; set; } = new Dictionary<string, string>();
        public Dictionary<string, List<string>> ServicePrincipalNames { get; set; } = new Dictionary<string, List<string>>();
        public List<string> SkippedServiceAccounts { get; set; } = new List<string>();
        public bool ManagedServiceAccountsProcessed { get; set; }
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
        
        // Additional properties required by build errors
        public string CurrentItem { get; set; } = string.Empty;
        public int Percentage { get; set; } = 0;
        public string Message { get; set; } = string.Empty;
    }

    // T-037 specific result types
    public class OuLinkingResult : MigrationResultBase
    {
        public string GpoGuid { get; set; }
        public List<string> LinkedOus { get; set; } = new List<string>();
        public List<string> FailedLinks { get; set; } = new List<string>();
        public Dictionary<string, object> LinkingDetails { get; set; } = new Dictionary<string, object>();
    }

    public class SecurityFilteringResult : MigrationResultBase
    {
        public string GpoGuid { get; set; }
        public List<string> AppliedFilters { get; set; } = new List<string>();
        public List<string> FailedFilters { get; set; } = new List<string>();
    }

    public class WmiFilterResult : MigrationResultBase
    {
        public List<string> MigratedFilters { get; set; } = new List<string>();
        public List<string> FailedFilters { get; set; } = new List<string>();
    }

    public class GpoCompatibilityResult : MigrationResultBase
    {
        public string GpoGuid { get; set; }
        public bool IsCompatible { get; set; }
        public List<string> CompatibilityIssues { get; set; } = new List<string>();
        public List<string> UnsupportedSettings { get; set; } = new List<string>();
        public List<string> Recommendations { get; set; } = new List<string>();
    }

    public class GroupPolicyConflictResolutionResult : MigrationResultBase
    {
        public string ConflictType { get; set; }
        public int TotalConflicts { get; set; }
        public int ResolvedConflicts { get; set; }
        public int UnresolvedConflicts { get; set; }
        public ConflictResolutionStrategy StrategyUsed { get; set; }
        public List<string> ResolutionActions { get; set; } = new List<string>();
    }

    public class BulkGpoMigrationResult : MigrationResultBase
    {
        public string OperationId { get; set; } = Guid.NewGuid().ToString();
        public int TotalGpos { get; set; }
        public int SuccessfulMigrations { get; set; }
        public int FailedMigrations { get; set; }
        public double SuccessRate => TotalGpos > 0 ? (double)SuccessfulMigrations / TotalGpos * 100 : 0;
        public List<GpoMigrationResult> Results { get; set; } = new List<GpoMigrationResult>();
        public TimeSpan TotalDuration { get; set; }
        public Dictionary<string, object> OperationDetails { get; set; } = new Dictionary<string, object>();
    }

    public class GpoMigrationReport : MigrationResultBase
    {
        public string ReportId { get; set; } = Guid.NewGuid().ToString();
        public int TotalGposMigrated { get; set; }
        public int SuccessfulMigrations { get; set; }
        public int FailedMigrations { get; set; }
        public double SuccessRate => TotalGposMigrated > 0 ? (double)SuccessfulMigrations / TotalGposMigrated * 100 : 0;
        public Dictionary<string, int> SettingsMigrationSummary { get; set; } = new Dictionary<string, int>();
        public List<string> UnsupportedSettings { get; set; } = new List<string>();
        public List<string> MigrationWarnings { get; set; } = new List<string>();
        public Dictionary<string, object> ReportDetails { get; set; } = new Dictionary<string, object>();
        public DateTime GeneratedDate { get; set; } = DateTime.Now;
    }

    // Group migration results
    public class GroupHierarchyResult : MigrationResultBase
    {
        public int TotalGroups { get; set; }
        public int TotalGroupsProcessed { get; set; }
        public int SuccessfullyMigrated { get; set; }
        public int ReplicatedGroups { get; set; }
        public int FailedGroups { get; set; }
        public List<string> CircularDependencies { get; set; } = new List<string>();
        public List<string> SkippedGroupSids { get; set; } = new List<string>();
        public Dictionary<string, List<string>> HierarchyMap { get; set; } = new Dictionary<string, List<string>>();
        public Dictionary<string, string> GroupSidMappings { get; set; } = new Dictionary<string, string>();
        public string ExecutedBy { get; set; }
        public List<string> MigratedGroupSids { get; set; } = new List<string>();
    }

    public class MembershipResult : MigrationResultBase
    {
        public string GroupId { get; set; }
        public int AddedMembers { get; set; }
        public int FailedMembers { get; set; }
        public List<string> UnresolvedMembers { get; set; } = new List<string>();
    }

    public class GroupDependencyResult : MigrationResultBase
    {
        public bool HasCircularDependencies { get; set; }
        public List<string> CircularChains { get; set; } = new List<string>();
        public Dictionary<string, List<string>> DependencyMap { get; set; } = new Dictionary<string, List<string>>();
        public List<string> OptimalMigrationOrder { get; set; } = new List<string>();
        public bool IsValid { get; set; }
        public List<string> ValidationErrors { get; set; } = new List<string>();
    }

    public class GroupOwnershipResult : MigrationResultBase
    {
        public string GroupId { get; set; }
        public List<string> AssignedOwners { get; set; } = new List<string>();
        public List<string> AssignedManagers { get; set; } = new List<string>();
        public List<string> FailedAssignments { get; set; } = new List<string>();
    }

    public class BulkGroupMigrationResult : MigrationResultBase
    {
        public string OperationId { get; set; } = Guid.NewGuid().ToString();
        public int TotalGroups { get; set; }
        public int SuccessfulMigrations { get; set; }
        public int FailedMigrations { get; set; }
        public double SuccessRate => TotalGroups > 0 ? (double)SuccessfulMigrations / TotalGroups * 100 : 0;
        public List<GroupMigrationResult> Results { get; set; } = new List<GroupMigrationResult>();
        public TimeSpan TotalDuration { get; set; }
    }

    // ACL migration results
    public class NtfsPermissionResult : MigrationResultBase
    {
        public string Path { get; set; }
        public int AppliedPermissions { get; set; }
        public int FailedPermissions { get; set; }
    }

    public class SharePermissionResult : MigrationResultBase
    {
        public string ShareName { get; set; }
        public int AppliedPermissions { get; set; }
        public int FailedPermissions { get; set; }
    }

    public class GpoSidTranslationResult : MigrationResultBase
    {
        public Dictionary<string, string> TranslatedSids { get; set; } = new Dictionary<string, string>();
        public List<string> UnresolvedSids { get; set; } = new List<string>();
        public DateTime TranslationDate { get; set; } = DateTime.Now;
    }

    public class AclValidationResult : MigrationResultBase
    {
        public List<string> ValidAcls { get; set; } = new List<string>();
        public List<string> InvalidAcls { get; set; } = new List<string>();
        public List<string> UnsupportedRights { get; set; } = new List<string>();
        public bool IsValid { get; set; }
        public List<string> ValidationErrors { get; set; } = new List<string>();
    }

    public class BulkAclMigrationResult : MigrationResultBase
    {
        public string OperationId { get; set; } = Guid.NewGuid().ToString();
        public int TotalPaths { get; set; }
        public int SuccessfulMigrations { get; set; }
        public int FailedMigrations { get; set; }
        public double SuccessRate => TotalPaths > 0 ? (double)SuccessfulMigrations / TotalPaths * 100 : 0;
        public List<AclMigrationResult> Results { get; set; } = new List<AclMigrationResult>();
        public TimeSpan TotalDuration { get; set; }
    }

    // Support classes
    public class GpoConflict
    {
        public string ConflictType { get; set; }
        public string SourceGpoGuid { get; set; }
        public string ConflictingGpoGuid { get; set; }
        public string ConflictDescription { get; set; }
        public string RecommendedAction { get; set; }
        public Dictionary<string, object> ConflictDetails { get; set; } = new Dictionary<string, object>();
    }

    public class GroupConflict
    {
        public string ConflictType { get; set; }
        public string SourceGroupSid { get; set; }
        public string ConflictingGroupSid { get; set; }
        public string ConflictDescription { get; set; }
        public string RecommendedAction { get; set; }
        public Dictionary<string, object> ConflictDetails { get; set; } = new Dictionary<string, object>();

        // Additional properties required by build errors
        public string GroupName => SourceGroupSid; // Alias for compatibility
        public string SourceSid => SourceGroupSid; // Alias for compatibility
    }

    public class AclConflict
    {
        public string ConflictType { get; set; }
        public string Path { get; set; }
        public string ConflictingTrustee { get; set; }
        public string ConflictDescription { get; set; }
        public string RecommendedAction { get; set; }
        public Dictionary<string, object> ConflictDetails { get; set; } = new Dictionary<string, object>();
    }

    public class NtfsPermission
    {
        public string Trustee { get; set; }
        public string TrusteeSid { get; set; }
        public string AccessType { get; set; }
        public string Rights { get; set; }
        public string Inheritance { get; set; }
        public string Propagation { get; set; }
    }

    public class SharePermission
    {
        public string Trustee { get; set; }
        public string TrusteeSid { get; set; }
        public string AccessMask { get; set; }
        public string AccessType { get; set; }
    }

    public enum ConflictResolutionStrategy
    {
        Skip,
        Rename,
        Merge,
        Overwrite,
        Prompt
    }

    // Missing result types for ACL Migrator
    public class AclInheritanceValidationResult : MigrationResultBase
    {
        public bool InheritanceSupported { get; set; }
        public List<string> InheritanceIssues { get; set; } = new List<string>();
    }

    public class RegistryPermissionResult : MigrationResultBase
    {
        public string RegistryPath { get; set; }
        public int AppliedPermissions { get; set; }
        public int FailedPermissions { get; set; }
    }
}