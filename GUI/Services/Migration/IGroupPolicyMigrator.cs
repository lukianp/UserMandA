using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using MandADiscoverySuite.Models;

namespace MandADiscoverySuite.Services.Migration
{
    /// <summary>
    /// Group Policy Object (GPO) migration service for T-037 implementation
    /// Handles GPO replication, OU linking, and security filtering in target domain
    /// </summary>
    public interface IGroupPolicyMigrator : IMigrationProvider<GroupPolicyItem, GpoMigrationResult>
    {
        /// <summary>
        /// Migrate GPO with settings, links, and security filtering
        /// </summary>
        Task<GpoMigrationResult> MigrateGpoAsync(GroupPolicyItem gpo, MigrationContext context, CancellationToken cancellationToken = default);

        /// <summary>
        /// Create OU links in target domain with proper scope and inheritance
        /// </summary>
        Task<OuLinkingResult> CreateOuLinksAsync(string gpoId, List<string> targetOus, MigrationContext context, CancellationToken cancellationToken = default);

        /// <summary>
        /// Apply security filtering to GPO using SID mapping
        /// </summary>
        Task<SecurityFilteringResult> ApplySecurityFilteringAsync(string gpoId, List<string> filteredUsers, List<string> filteredGroups, MigrationContext context, CancellationToken cancellationToken = default);

        /// <summary>
        /// Migrate WMI filters with validation and error handling
        /// </summary>
        Task<WmiFilterResult> MigrateWmiFiltersAsync(List<WmiFilterItem> wmiFilters, MigrationContext context, CancellationToken cancellationToken = default);

        /// <summary>
        /// Validate GPO compatibility between source and target domains
        /// </summary>
        Task<GpoCompatibilityResult> ValidateGpoCompatibilityAsync(GroupPolicyItem gpo, MigrationContext context, CancellationToken cancellationToken = default);

        /// <summary>
        /// Handle GPO conflicts and provide resolution options
        /// </summary>
        Task<GroupPolicyConflictResolutionResult> ResolveGpoConflictsAsync(List<GpoConflict> conflicts, ConflictResolutionStrategy strategy, MigrationContext context, CancellationToken cancellationToken = default);

        /// <summary>
        /// Bulk migrate multiple GPOs with dependency management
        /// </summary>
        Task<BulkGpoMigrationResult> BulkMigrateGposAsync(List<GroupPolicyItem> gpos, MigrationContext context, CancellationToken cancellationToken = default);

        /// <summary>
        /// Generate GPO migration report with before/after comparison
        /// </summary>
        Task<GpoMigrationReport> GenerateMigrationReportAsync(List<string> migratedGpoIds, MigrationContext context, CancellationToken cancellationToken = default);
    }

    /// <summary>
    /// Active Directory Group migration service for T-037 implementation
    /// Handles security groups, distribution groups, and nested membership
    /// </summary>
    public interface IGroupMigrator : IMigrationProvider<SecurityGroupItem, GroupMigrationResult>
    {
        /// <summary>
        /// Migrate security group with members and nested groups
        /// </summary>
        Task<GroupMigrationResult> MigrateGroupAsync(SecurityGroupItem group, MigrationContext context, CancellationToken cancellationToken = default);

        /// <summary>
        /// Replicate group hierarchy with proper nesting and dependencies
        /// </summary>
        Task<GroupHierarchyResult> ReplicateGroupHierarchyAsync(List<SecurityGroupItem> groups, MigrationContext context, CancellationToken cancellationToken = default);

        /// <summary>
        /// Add group members using SID mapping and user translation
        /// </summary>
        Task<MembershipResult> AddGroupMembersAsync(string targetGroupId, List<string> memberSids, MigrationContext context, CancellationToken cancellationToken = default);

        /// <summary>
        /// Handle group name conflicts with resolution strategies
        /// </summary>
        Task<GroupPolicyConflictResolutionResult> ResolveGroupConflictsAsync(List<GroupConflict> conflicts, ConflictResolutionStrategy strategy, MigrationContext context, CancellationToken cancellationToken = default);

        /// <summary>
        /// Validate group dependencies and circular references
        /// </summary>
        Task<GroupDependencyResult> ValidateGroupDependenciesAsync(List<SecurityGroupItem> groups, MigrationContext context, CancellationToken cancellationToken = default);

        /// <summary>
        /// Migrate group managed by and ownership relationships
        /// </summary>
        Task<GroupOwnershipResult> MigrateGroupOwnershipAsync(string groupId, List<string> owners, List<string> managers, MigrationContext context, CancellationToken cancellationToken = default);

        /// <summary>
        /// Bulk migrate multiple groups with efficient batch processing
        /// </summary>
        Task<BulkGroupMigrationResult> BulkMigrateGroupsAsync(List<SecurityGroupItem> groups, MigrationContext context, CancellationToken cancellationToken = default);
    }

    /// <summary>
    /// ACL migration service for file system permissions (T-037)
    /// Handles NTFS permissions, share permissions, and SID translation
    /// </summary>
    public interface IAclMigrator : IMigrationProvider<AclMigrationItem, AclMigrationResult>
    {
        /// <summary>
        /// Recreate ACLs on target path with SID mapping
        /// </summary>
        Task<AclMigrationResult> RecreateAclsAsync(string targetPath, List<AclEntry> sourceAcls, Dictionary<string, string> sidMapping, MigrationContext context, CancellationToken cancellationToken = default);

        /// <summary>
        /// Apply NTFS permissions with inheritance and propagation
        /// </summary>
        Task<NtfsPermissionResult> ApplyNtfsPermissionsAsync(string path, List<NtfsPermission> permissions, MigrationContext context, CancellationToken cancellationToken = default);

        /// <summary>
        /// Apply share permissions for network access
        /// </summary>
        Task<SharePermissionResult> ApplySharePermissionsAsync(string shareName, List<SharePermission> permissions, MigrationContext context, CancellationToken cancellationToken = default);

        /// <summary>
        /// Translate SIDs using domain mapping and SID history
        /// </summary>
        Task<GpoSidTranslationResult> TranslateSidsAsync(List<string> sourceSids, MigrationContext context, CancellationToken cancellationToken = default);

        /// <summary>
        /// Validate ACL compatibility and identify unsupported rights
        /// </summary>
        Task<AclValidationResult> ValidateAclCompatibilityAsync(List<AclEntry> acls, string targetFileSystem, MigrationContext context, CancellationToken cancellationToken = default);

        /// <summary>
        /// Handle ACL conflicts and provide resolution options
        /// </summary>
        Task<GroupPolicyConflictResolutionResult> ResolveAclConflictsAsync(List<AclConflict> conflicts, ConflictResolutionStrategy strategy, MigrationContext context, CancellationToken cancellationToken = default);

        /// <summary>
        /// Bulk apply ACLs to multiple paths efficiently
        /// </summary>
        Task<BulkAclMigrationResult> BulkApplyAclsAsync(Dictionary<string, List<AclEntry>> pathAclMap, Dictionary<string, string> sidMapping, MigrationContext context, CancellationToken cancellationToken = default);

        /// <summary>
        /// Configure permission inheritance settings
        /// </summary>
        Task<PermissionInheritanceResult> SetPermissionInheritanceAsync(string targetPath, bool enableInheritance, bool propagateToChildren, MigrationContext context, CancellationToken cancellationToken = default);
    }

    // Supporting Models for T-037 Implementation

    /// <summary>
    /// Group Policy Object item for migration
    /// </summary>
    public class GroupPolicyItem
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();
        public string GpoGuid { get; set; }
        public string GpoName { get; set; }
        public string DisplayName { get; set; }
        public string Description { get; set; }
        public string Domain { get; set; }
        public DateTime CreatedDate { get; set; }
        public DateTime ModifiedDate { get; set; }
        public string CreatedBy { get; set; }
        public string ModifiedBy { get; set; }
        public List<string> LinkedOus { get; set; } = new List<string>();
        public List<string> SecurityFiltering { get; set; } = new List<string>();
        public List<WmiFilterItem> WmiFilters { get; set; } = new List<WmiFilterItem>();
        public Dictionary<string, object> Settings { get; set; } = new Dictionary<string, object>();
        public bool IsEnabled { get; set; } = true;
        public GpoScope Scope { get; set; } = GpoScope.UserAndComputer;
        public int Version { get; set; }
        public string Status { get; set; }
        public Dictionary<string, object> CustomProperties { get; set; } = new Dictionary<string, object>();
    }

    /// <summary>
    /// Security group item for migration
    /// </summary>
    public class SecurityGroupItem
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();
        public string GroupSid { get; set; }
        public string GroupName { get; set; }
        public string DisplayName { get; set; }
        public string Description { get; set; }
        public string Domain { get; set; }
        public string DistinguishedName { get; set; }
        public GroupType GroupType { get; set; }
        public GroupScope GroupScope { get; set; }
        public List<string> Members { get; set; } = new List<string>();
        public List<string> MemberOf { get; set; } = new List<string>();
        public List<string> ManagedBy { get; set; } = new List<string>();
        public DateTime CreatedDate { get; set; }
        public DateTime ModifiedDate { get; set; }
        public string CreatedBy { get; set; }
        public string ModifiedBy { get; set; }
        public Dictionary<string, object> Attributes { get; set; } = new Dictionary<string, object>();
        public bool IsBuiltIn { get; set; }
        public Dictionary<string, object> CustomProperties { get; set; } = new Dictionary<string, object>();
    }

    /// <summary>
    /// ACL migration item for file system permissions
    /// </summary>
    public class AclMigrationItem
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();
        public string Path { get; set; }
        public string ResourceType { get; set; } // File, Directory, Share
        public List<AclEntry> AclEntries { get; set; } = new List<AclEntry>();
        public bool InheritanceEnabled { get; set; } = true;
        public string Owner { get; set; }
        public string Group { get; set; }
        public DateTime LastModified { get; set; }
        public Dictionary<string, object> Metadata { get; set; } = new Dictionary<string, object>();
    }

    /// <summary>
    /// WMI filter for GPO targeting
    /// </summary>
    public class WmiFilterItem
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();
        public string Name { get; set; }
        public string Description { get; set; }
        public List<string> Queries { get; set; } = new List<string>();
        public DateTime CreatedDate { get; set; }
        public string CreatedBy { get; set; }
        public bool IsActive { get; set; } = true;
    }

    /// <summary>
    /// NTFS permission entry
    /// </summary>
    public class NtfsPermission
    {
        public string Trustee { get; set; }
        public string TrusteeSid { get; set; }
        public AccessControlType AccessType { get; set; }
        public FileSystemRights Rights { get; set; }
        public InheritanceFlags Inheritance { get; set; }
        public PropagationFlags Propagation { get; set; }
    }

    /// <summary>
    /// Share permission entry
    /// </summary>
    public class SharePermission
    {
        public string Trustee { get; set; }
        public string TrusteeSid { get; set; }
        public ShareAccessMask AccessMask { get; set; }
        public AccessControlType AccessType { get; set; }
    }

    // Result Classes for T-037 Implementation

    /// <summary>
    /// GPO migration result with detailed tracking
    /// </summary>
    public class GpoMigrationResult
    {
        public string SourceGpoGuid { get; set; }
        public string TargetGpoGuid { get; set; }
        public string GpoName { get; set; }
        public bool IsSuccess { get; set; }
        public List<string> MigratedSettings { get; set; } = new List<string>();
        public List<string> SkippedSettings { get; set; } = new List<string>();
        public List<string> Errors { get; set; } = new List<string>();
        public List<string> Warnings { get; set; } = new List<string>();
        public DateTime MigrationDate { get; set; } = DateTime.Now;
        public TimeSpan MigrationDuration { get; set; }
        public Dictionary<string, object> MigrationDetails { get; set; } = new Dictionary<string, object>();
    }

    /// <summary>
    /// Group migration result with membership tracking
    /// </summary>
    public class GroupMigrationResult
    {
        public string SourceGroupSid { get; set; }
        public string TargetGroupSid { get; set; }
        public string GroupName { get; set; }
        public bool IsSuccess { get; set; }
        public int MigratedMembers { get; set; }
        public int FailedMembers { get; set; }
        public List<string> MembershipErrors { get; set; } = new List<string>();
        public List<string> Warnings { get; set; } = new List<string>();
        public DateTime MigrationDate { get; set; } = DateTime.Now;
        public Dictionary<string, object> MigrationDetails { get; set; } = new Dictionary<string, object>();
    }


    /// <summary>
    /// OU linking result for GPO scope management
    /// </summary>
    public class OuLinkingResult
    {
        public string GpoGuid { get; set; }
        public List<string> LinkedOus { get; set; } = new List<string>();
        public List<string> FailedLinks { get; set; } = new List<string>();
        public bool IsSuccess { get; set; }
        public List<string> Errors { get; set; } = new List<string>();
        public Dictionary<string, object> LinkingDetails { get; set; } = new Dictionary<string, object>();
    }

    /// <summary>
    /// Security filtering result for GPO targeting
    /// </summary>
    public class SecurityFilteringResult
    {
        public string GpoGuid { get; set; }
        public List<string> AppliedFilters { get; set; } = new List<string>();
        public List<string> FailedFilters { get; set; } = new List<string>();
        public bool IsSuccess { get; set; }
        public List<string> Errors { get; set; } = new List<string>();
        public Dictionary<string, object> FilteringDetails { get; set; } = new Dictionary<string, object>();
    }

    /// <summary>
    /// Conflict resolution result for all migration types
    /// </summary>
    public class GroupPolicyConflictResolutionResult
    {
        public string ConflictType { get; set; }
        public int TotalConflicts { get; set; }
        public int ResolvedConflicts { get; set; }
        public int UnresolvedConflicts { get; set; }
        public ConflictResolutionStrategy StrategyUsed { get; set; }
        public List<string> ResolutionActions { get; set; } = new List<string>();
        public List<string> Errors { get; set; } = new List<string>();
        public Dictionary<string, object> ResolutionDetails { get; set; } = new Dictionary<string, object>();
    }

    /// <summary>
    /// GPO-specific SID translation result for identity mapping
    /// </summary>
    public class GpoSidTranslationResult
    {
        public Dictionary<string, string> TranslatedSids { get; set; } = new Dictionary<string, string>();
        public List<string> UnresolvedSids { get; set; } = new List<string>();
        public bool IsSuccess { get; set; }
        public List<string> Errors { get; set; } = new List<string>();
        public DateTime TranslationDate { get; set; } = DateTime.Now;
        public Dictionary<string, object> TranslationDetails { get; set; } = new Dictionary<string, object>();
    }

    // Enumerations for T-037 Implementation

    /// <summary>
    /// GPO scope enumeration
    /// </summary>
    public enum GpoScope
    {
        User,
        Computer,
        UserAndComputer
    }

    /// <summary>
    /// Group type enumeration
    /// </summary>
    public enum GroupType
    {
        Security,
        Distribution
    }

    /// <summary>
    /// Group scope enumeration
    /// </summary>
    public enum GroupScope
    {
        DomainLocal,
        Global,
        Universal
    }

    /// <summary>
    /// Access control type enumeration
    /// </summary>
    public enum AccessControlType
    {
        Allow,
        Deny
    }

    /// <summary>
    /// File system rights enumeration
    /// </summary>
    [Flags]
    public enum FileSystemRights
    {
        ReadData = 0x1,
        WriteData = 0x2,
        AppendData = 0x4,
        ExecuteFile = 0x20,
        DeleteSubdirectoriesAndFiles = 0x40,
        ReadAttributes = 0x80,
        WriteAttributes = 0x100,
        Delete = 0x10000,
        ReadPermissions = 0x20000,
        ChangePermissions = 0x40000,
        TakeOwnership = 0x80000,
        FullControl = 0x1F01FF,
        Modify = 0x301BF,
        ReadAndExecute = 0x200A9,
        Write = 0x116,
        Read = 0x89
    }

    /// <summary>
    /// Inheritance flags enumeration
    /// </summary>
    [Flags]
    public enum InheritanceFlags
    {
        None = 0x0,
        ContainerInherit = 0x1,
        ObjectInherit = 0x2
    }

    /// <summary>
    /// Propagation flags enumeration
    /// </summary>
    [Flags]
    public enum PropagationFlags
    {
        None = 0x0,
        NoPropagateInherit = 0x1,
        InheritOnly = 0x2
    }

    /// <summary>
    /// Share access mask enumeration
    /// </summary>
    [Flags]
    public enum ShareAccessMask
    {
        Read = 0x1,
        Write = 0x2,
        FullControl = 0x1F01FF
    }

    /// <summary>
    /// Conflict resolution strategy enumeration
    /// </summary>
    public enum ConflictResolutionStrategy
    {
        Skip,
        Rename,
        Merge,
        Overwrite,
        Prompt
    }

    // Additional result classes for bulk operations

    /// <summary>
    /// Bulk GPO migration result
    /// </summary>
    public class BulkGpoMigrationResult
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

    /// <summary>
    /// Bulk group migration result
    /// </summary>
    public class BulkGroupMigrationResult
    {
        public string OperationId { get; set; } = Guid.NewGuid().ToString();
        public int TotalGroups { get; set; }
        public int SuccessfulMigrations { get; set; }
        public int FailedMigrations { get; set; }
        public double SuccessRate => TotalGroups > 0 ? (double)SuccessfulMigrations / TotalGroups * 100 : 0;
        public List<GroupMigrationResult> Results { get; set; } = new List<GroupMigrationResult>();
        public TimeSpan TotalDuration { get; set; }
        public Dictionary<string, object> OperationDetails { get; set; } = new Dictionary<string, object>();
    }

    /// <summary>
    /// Bulk ACL migration result
    /// </summary>
    public class BulkAclMigrationResult
    {
        public string OperationId { get; set; } = Guid.NewGuid().ToString();
        public int TotalPaths { get; set; }
        public int SuccessfulMigrations { get; set; }
        public int FailedMigrations { get; set; }
        public double SuccessRate => TotalPaths > 0 ? (double)SuccessfulMigrations / TotalPaths * 100 : 0;
        public List<AclMigrationResult> Results { get; set; } = new List<AclMigrationResult>();
        public TimeSpan TotalDuration { get; set; }
        public Dictionary<string, object> OperationDetails { get; set; } = new Dictionary<string, object>();
    }

    // Conflict and validation classes

    /// <summary>
    /// GPO conflict definition
    /// </summary>
    public class GpoConflict
    {
        public string ConflictType { get; set; }
        public string SourceGpoGuid { get; set; }
        public string ConflictingGpoGuid { get; set; }
        public string ConflictDescription { get; set; }
        public string RecommendedAction { get; set; }
        public Dictionary<string, object> ConflictDetails { get; set; } = new Dictionary<string, object>();
    }

    /// <summary>
    /// Group conflict definition
    /// </summary>
    public class GroupConflict
    {
        public string ConflictType { get; set; }
        public string SourceGroupSid { get; set; }
        public string ConflictingGroupSid { get; set; }
        public string ConflictDescription { get; set; }
        public string RecommendedAction { get; set; }
        public Dictionary<string, object> ConflictDetails { get; set; } = new Dictionary<string, object>();
    }

    /// <summary>
    /// ACL conflict definition
    /// </summary>
    public class AclConflict
    {
        public string ConflictType { get; set; }
        public string Path { get; set; }
        public string ConflictingTrustee { get; set; }
        public string ConflictDescription { get; set; }
        public string RecommendedAction { get; set; }
        public Dictionary<string, object> ConflictDetails { get; set; } = new Dictionary<string, object>();
    }

    // Additional result classes

    /// <summary>
    /// WMI filter migration result
    /// </summary>
    public class WmiFilterResult
    {
        public List<string> MigratedFilters { get; set; } = new List<string>();
        public List<string> FailedFilters { get; set; } = new List<string>();
        public bool IsSuccess { get; set; }
        public List<string> Errors { get; set; } = new List<string>();
        public Dictionary<string, object> FilterDetails { get; set; } = new Dictionary<string, object>();
    }

    /// <summary>
    /// GPO compatibility validation result
    /// </summary>
    public class GpoCompatibilityResult
    {
        public string GpoGuid { get; set; }
        public bool IsCompatible { get; set; }
        public List<string> CompatibilityIssues { get; set; } = new List<string>();
        public List<string> UnsupportedSettings { get; set; } = new List<string>();
        public List<string> Recommendations { get; set; } = new List<string>();
        public Dictionary<string, object> CompatibilityDetails { get; set; } = new Dictionary<string, object>();
    }

    /// <summary>
    /// Group hierarchy replication result
    /// </summary>
    public class GroupHierarchyResult
    {
        public int TotalGroups { get; set; }
        public int ReplicatedGroups { get; set; }
        public int FailedGroups { get; set; }
        public List<string> CircularDependencies { get; set; } = new List<string>();
        public Dictionary<string, List<string>> HierarchyMap { get; set; } = new Dictionary<string, List<string>>();
        public bool IsSuccess { get; set; }
        public List<string> Errors { get; set; } = new List<string>();
    }

    /// <summary>
    /// Group membership result
    /// </summary>
    public class MembershipResult
    {
        public string GroupId { get; set; }
        public int AddedMembers { get; set; }
        public int FailedMembers { get; set; }
        public List<string> UnresolvedMembers { get; set; } = new List<string>();
        public bool IsSuccess { get; set; }
        public List<string> Errors { get; set; } = new List<string>();
    }

    /// <summary>
    /// Group dependency validation result
    /// </summary>
    public class GroupDependencyResult
    {
        public bool HasCircularDependencies { get; set; }
        public List<string> CircularChains { get; set; } = new List<string>();
        public Dictionary<string, List<string>> DependencyMap { get; set; } = new Dictionary<string, List<string>>();
        public List<string> OptimalMigrationOrder { get; set; } = new List<string>();
        public bool IsValid { get; set; }
        public List<string> ValidationErrors { get; set; } = new List<string>();
    }

    /// <summary>
    /// Group ownership migration result
    /// </summary>
    public class GroupOwnershipResult
    {
        public string GroupId { get; set; }
        public List<string> AssignedOwners { get; set; } = new List<string>();
        public List<string> AssignedManagers { get; set; } = new List<string>();
        public List<string> FailedAssignments { get; set; } = new List<string>();
        public bool IsSuccess { get; set; }
        public List<string> Errors { get; set; } = new List<string>();
    }

    /// <summary>
    /// NTFS permission application result
    /// </summary>
    public class NtfsPermissionResult
    {
        public string Path { get; set; }
        public int AppliedPermissions { get; set; }
        public int FailedPermissions { get; set; }
        public bool IsSuccess { get; set; }
        public List<string> Errors { get; set; } = new List<string>();
        public Dictionary<string, object> PermissionDetails { get; set; } = new Dictionary<string, object>();
    }

    /// <summary>
    /// Share permission application result
    /// </summary>
    public class SharePermissionResult
    {
        public string ShareName { get; set; }
        public int AppliedPermissions { get; set; }
        public int FailedPermissions { get; set; }
        public bool IsSuccess { get; set; }
        public List<string> Errors { get; set; } = new List<string>();
        public Dictionary<string, object> PermissionDetails { get; set; } = new Dictionary<string, object>();
    }

    /// <summary>
    /// ACL validation result
    /// </summary>
    public class AclValidationResult
    {
        public List<string> ValidAcls { get; set; } = new List<string>();
        public List<string> InvalidAcls { get; set; } = new List<string>();
        public List<string> UnsupportedRights { get; set; } = new List<string>();
        public bool IsValid { get; set; }
        public List<string> ValidationErrors { get; set; } = new List<string>();
        public Dictionary<string, object> ValidationDetails { get; set; } = new Dictionary<string, object>();
    }


    /// <summary>
    /// GPO migration report for management visibility
    /// </summary>
    public class GpoMigrationReport
    {
        public string ReportId { get; set; } = Guid.NewGuid().ToString();
        public DateTime GeneratedDate { get; set; } = DateTime.Now;
        public int TotalGposMigrated { get; set; }
        public int SuccessfulMigrations { get; set; }
        public int FailedMigrations { get; set; }
        public double SuccessRate => TotalGposMigrated > 0 ? (double)SuccessfulMigrations / TotalGposMigrated * 100 : 0;
        public Dictionary<string, int> SettingsMigrationSummary { get; set; } = new Dictionary<string, int>();
        public List<string> UnsupportedSettings { get; set; } = new List<string>();
        public List<string> MigrationWarnings { get; set; } = new List<string>();
        public Dictionary<string, object> ReportDetails { get; set; } = new Dictionary<string, object>();
    }
}