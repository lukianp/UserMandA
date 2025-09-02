using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using MandADiscoverySuite.Models;
using MandADiscoverySuite.Models.Migration;

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
        Task<GpoMigrationResult> MigrateGpoAsync(GroupPolicyItem gpo, Services.Migration.MigrationContext context, CancellationToken cancellationToken = default);

        /// <summary>
        /// Create OU links in target domain with proper scope and inheritance
        /// </summary>
        Task<OuLinkingResult> CreateOuLinksAsync(string gpoId, List<string> targetOus, Services.Migration.MigrationContext context, CancellationToken cancellationToken = default);

        /// <summary>
        /// Apply security filtering to GPO using SID mapping
        /// </summary>
        Task<SecurityFilteringResult> ApplySecurityFilteringAsync(string gpoId, List<string> filteredUsers, List<string> filteredGroups, Services.Migration.MigrationContext context, CancellationToken cancellationToken = default);

        /// <summary>
        /// Migrate WMI filters with validation and error handling
        /// </summary>
        Task<WmiFilterResult> MigrateWmiFiltersAsync(List<WmiFilterItem> wmiFilters, Services.Migration.MigrationContext context, CancellationToken cancellationToken = default);

        /// <summary>
        /// Validate GPO compatibility between source and target domains
        /// </summary>
        Task<GpoCompatibilityResult> ValidateGpoCompatibilityAsync(GroupPolicyItem gpo, Services.Migration.MigrationContext context, CancellationToken cancellationToken = default);

        /// <summary>
        /// Handle GPO conflicts and provide resolution options
        /// </summary>
        Task<GroupPolicyConflictResolutionResult> ResolveGpoConflictsAsync(List<GpoConflict> conflicts, ConflictResolutionStrategy strategy, Services.Migration.MigrationContext context, CancellationToken cancellationToken = default);

        /// <summary>
        /// Bulk migrate multiple GPOs with dependency management
        /// </summary>
        Task<BulkGpoMigrationResult> BulkMigrateGposAsync(List<GroupPolicyItem> gpos, Services.Migration.MigrationContext context, CancellationToken cancellationToken = default);

        /// <summary>
        /// Generate GPO migration report with before/after comparison
        /// </summary>
        Task<GpoMigrationReport> GenerateMigrationReportAsync(List<string> migratedGpoIds, Services.Migration.MigrationContext context, CancellationToken cancellationToken = default);
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
        Task<GroupMigrationResult> MigrateGroupAsync(SecurityGroupItem group, Services.Migration.MigrationContext context, CancellationToken cancellationToken = default);

        /// <summary>
        /// Replicate group hierarchy with proper nesting and dependencies
        /// </summary>
        Task<GroupHierarchyResult> ReplicateGroupHierarchyAsync(List<SecurityGroupItem> groups, Services.Migration.MigrationContext context, CancellationToken cancellationToken = default);

        /// <summary>
        /// Add group members using SID mapping and user translation
        /// </summary>
        Task<MembershipResult> AddGroupMembersAsync(string targetGroupId, List<string> memberSids, Services.Migration.MigrationContext context, CancellationToken cancellationToken = default);

        /// <summary>
        /// Handle group name conflicts with resolution strategies
        /// </summary>
        Task<GroupPolicyConflictResolutionResult> ResolveGroupConflictsAsync(List<GroupConflict> conflicts, ConflictResolutionStrategy strategy, Services.Migration.MigrationContext context, CancellationToken cancellationToken = default);

        /// <summary>
        /// Validate group dependencies and circular references
        /// </summary>
        Task<GroupDependencyResult> ValidateGroupDependenciesAsync(List<SecurityGroupItem> groups, Services.Migration.MigrationContext context, CancellationToken cancellationToken = default);

        /// <summary>
        /// Migrate group managed by and ownership relationships
        /// </summary>
        Task<GroupOwnershipResult> MigrateGroupOwnershipAsync(string groupId, List<string> owners, List<string> managers, Services.Migration.MigrationContext context, CancellationToken cancellationToken = default);

        /// <summary>
        /// Bulk migrate multiple groups with efficient batch processing
        /// </summary>
        Task<BulkGroupMigrationResult> BulkMigrateGroupsAsync(List<SecurityGroupItem> groups, Services.Migration.MigrationContext context, CancellationToken cancellationToken = default);
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
        Task<AclMigrationResult> RecreateAclsAsync(string targetPath, List<Models.Migration.AclEntry> sourceAcls, Dictionary<string, string> sidMapping, Services.Migration.MigrationContext context, CancellationToken cancellationToken = default);

        /// <summary>
        /// Apply NTFS permissions with inheritance and propagation
        /// </summary>
        Task<NtfsPermissionResult> ApplyNtfsPermissionsAsync(string path, List<NtfsPermission> permissions, Services.Migration.MigrationContext context, CancellationToken cancellationToken = default);

        /// <summary>
        /// Apply share permissions for network access
        /// </summary>
        Task<SharePermissionResult> ApplySharePermissionsAsync(string shareName, List<SharePermission> permissions, Services.Migration.MigrationContext context, CancellationToken cancellationToken = default);

        /// <summary>
        /// Translate SIDs using domain mapping and SID history
        /// </summary>
        Task<GpoSidTranslationResult> TranslateSidsAsync(List<string> sourceSids, Services.Migration.MigrationContext context, CancellationToken cancellationToken = default);

        /// <summary>
        /// Validate ACL compatibility and identify unsupported rights
        /// </summary>
        Task<AclValidationResult> ValidateAclCompatibilityAsync(List<Models.Migration.AclEntry> acls, string targetFileSystem, Services.Migration.MigrationContext context, CancellationToken cancellationToken = default);

        /// <summary>
        /// Handle ACL conflicts and provide resolution options
        /// </summary>
        Task<GroupPolicyConflictResolutionResult> ResolveAclConflictsAsync(List<AclConflict> conflicts, ConflictResolutionStrategy strategy, Services.Migration.MigrationContext context, CancellationToken cancellationToken = default);

        /// <summary>
        /// Bulk apply ACLs to multiple paths efficiently
        /// </summary>
        Task<BulkAclMigrationResult> BulkApplyAclsAsync(Dictionary<string, List<Models.Migration.AclEntry>> pathAclMap, Dictionary<string, string> sidMapping, Services.Migration.MigrationContext context, CancellationToken cancellationToken = default);

        /// <summary>
        /// Configure permission inheritance settings
        /// </summary>
        Task<PermissionInheritanceResult> SetPermissionInheritanceAsync(string targetPath, bool enableInheritance, bool propagateToChildren, Services.Migration.MigrationContext context, CancellationToken cancellationToken = default);
    }
}