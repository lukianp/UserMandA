using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using MandADiscoverySuite.Models.Migration;
using MandADiscoverySuite.Services.Migration;

namespace MandADiscoverySuite.Models.Identity
{
    /// <summary>
    /// Data models for T-037 Groups, GPOs, and ACLs migration operations
    /// </summary>

    #region Group Data Models

    public class GroupData
    {
        public string Id { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string DisplayName { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public GroupType GroupType { get; set; }
        public GroupScope Scope { get; set; }
        public string Domain { get; set; } = string.Empty;
        public string DistinguishedName { get; set; } = string.Empty;
        public DateTime CreatedDate { get; set; }
        public DateTime? ModifiedDate { get; set; }
        public List<string> MemberIds { get; set; } = new();
        public List<string> NestedGroupIds { get; set; } = new();
        public Dictionary<string, object> CustomAttributes { get; set; } = new();
        public bool IsCriticalGroup { get; set; }
        public List<string> AssignedGpoIds { get; set; } = new();
    }

    public enum GroupType
    {
        Security,
        Distribution,
        Universal,
        DomainLocal,
        Global
    }

    public enum GroupScope
    {
        DomainLocal,
        Global,
        Universal
    }

    #endregion

    #region Group Policy Objects (GPO) Models

    public class GpoData
    {
        public string Id { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string DisplayName { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Domain { get; set; } = string.Empty;
        public DateTime CreatedDate { get; set; }
        public DateTime? ModifiedDate { get; set; }
        public List<GpoSetting> Settings { get; set; } = new();
        public List<string> LinkedOUs { get; set; } = new();
        public List<string> LinkedSites { get; set; } = new();
        public GpoStatus Status { get; set; }
        public List<GpoPermission> Permissions { get; set; } = new();
        public bool HasUserSettings { get; set; }
        public bool HasComputerSettings { get; set; }
        public GpoComplexity Complexity { get; set; }
    }

    public class GpoSetting
    {
        public string Category { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string Value { get; set; } = string.Empty;
        public GpoSettingType Type { get; set; }
        public bool IsCloudSupported { get; set; }
        public string? CloudEquivalent { get; set; }
        public GpoMigrationStrategy MigrationStrategy { get; set; }
    }

    public enum GpoStatus
    {
        Enabled,
        Disabled,
        UserSettingsDisabled,
        ComputerSettingsDisabled
    }

    public enum GpoSettingType
    {
        Registry,
        SecurityPolicy,
        AuditPolicy,
        UserRights,
        FileSystem,
        Services,
        Software,
        Administrative,
        Other
    }

    public enum GpoComplexity
    {
        Simple,
        Medium,
        Complex,
        Critical
    }

    public enum GpoMigrationStrategy
    {
        DirectMapping,
        Conditional,
        Intune,
        CompliancePolicy,
        PowerShell,
        Manual,
        NotSupported
    }

    public class GpoPermission
    {
        public string Principal { get; set; } = string.Empty;
        public List<string> Permissions { get; set; } = new();
        public bool IsInherited { get; set; }
    }

    #endregion

    #region Access Control Lists (ACL) Models

    public class AclData
    {
        public string ResourcePath { get; set; } = string.Empty;
        public string ResourceType { get; set; } = string.Empty;
        public List<AclEntry> Entries { get; set; } = new();
        public string Owner { get; set; } = string.Empty;
        public string Group { get; set; } = string.Empty;
        public bool InheritanceEnabled { get; set; }
        public DateTime LastModified { get; set; }
        public string SourceSystem { get; set; } = string.Empty;
        public AclMigrationComplexity Complexity { get; set; }
    }

    public class AclEntry
    {
        public string Principal { get; set; } = string.Empty;
        public PrincipalType PrincipalType { get; set; }
        public List<string> Permissions { get; set; } = new();
        public AclEntryType EntryType { get; set; }
        public bool IsInherited { get; set; }
        public bool PropagateToChildren { get; set; }
        public string SourceSid { get; set; } = string.Empty;
        public string? TargetPrincipalId { get; set; }
    }

    public enum PrincipalType
    {
        User,
        Group,
        ServiceAccount,
        System,
        Other
    }

    public enum AclEntryType
    {
        Allow,
        Deny,
        Audit
    }

    public enum AclMigrationComplexity
    {
        Simple,
        Moderate,
        Complex,
        Critical
    }

    #endregion

    #region Migration Settings Models

    public class GroupMigrationSettings
    {
        public bool PreserveMembership { get; set; } = true;
        public bool MigrateNestedGroups { get; set; } = true;
        public bool ConvertToCloudGroups { get; set; } = true;
        public Services.Migration.ConflictResolutionStrategy ConflictResolution { get; set; } = Services.Migration.ConflictResolutionStrategy.Prompt;
        public int MaxConcurrentOperations { get; set; } = 10;
        public TimeSpan OperationTimeout { get; set; } = TimeSpan.FromMinutes(30);
        public bool ValidateAfterMigration { get; set; } = true;
        public bool CreateBackup { get; set; } = true;
        public List<string> ExcludedGroupIds { get; set; } = new();
        public Dictionary<string, object> CustomMappings { get; set; } = new();
    }

    public class GpoMigrationSettings
    {
        public bool ConvertToIntuneProfiles { get; set; } = true;
        public bool ConvertToCompliancePolicies { get; set; } = true;
        public bool GenerateReportForUnsupported { get; set; } = true;
        public GpoMigrationMode Mode { get; set; } = GpoMigrationMode.Automatic;
        public int MaxComplexityLevel { get; set; } = 3;
        public bool ValidateCloudCapabilities { get; set; } = true;
        public List<string> ExcludedGpoIds { get; set; } = new();
        public Dictionary<string, string> CustomPolicyMappings { get; set; } = new();
    }

    public enum GpoMigrationMode
    {
        Automatic,
        SemiAutomatic,
        Manual,
        ReportOnly
    }

    public class AclMigrationSettings
    {
        public bool PreserveOwnership { get; set; } = true;
        public bool MapToSharePointPermissions { get; set; } = true;
        public bool CreatePermissionGroups { get; set; } = true;
        public AclMappingStrategy MappingStrategy { get; set; } = AclMappingStrategy.BestMatch;
        public bool ValidatePermissions { get; set; } = true;
        public int MaxPermissionEntries { get; set; } = 1000;
        public List<string> ExcludedPaths { get; set; } = new();
        public Dictionary<string, string> PermissionMappings { get; set; } = new();
    }

    public enum AclMappingStrategy
    {
        DirectMapping,
        BestMatch,
        Simplified,
        GroupBased
    }

    #endregion

    #region Cross-Domain and Dependency Models

    public class CrossDomainGroupRef
    {
        public string SourceGroupId { get; set; } = string.Empty;
        public string ReferencedGroupId { get; set; } = string.Empty;
        public string ReferencedDomain { get; set; } = string.Empty;
        public CrossDomainRefType RefType { get; set; }
        public bool IsResolvable { get; set; }
        public string? ResolutionStrategy { get; set; }
    }

    public enum CrossDomainRefType
    {
        Membership,
        Permission,
        Delegation,
        Trust
    }

    public class GroupDependencyResult
    {
        public List<GroupData> Groups { get; set; } = new();
        public List<GroupDependency> Dependencies { get; set; } = new();
        public List<string> MigrationOrder { get; set; } = new();
        public List<string> CircularDependencies { get; set; } = new();
        public int TotalLevels { get; set; }
        public bool HasConflicts { get; set; }
    }

    public class GroupDependency
    {
        public string GroupId { get; set; } = string.Empty;
        public string DependsOnGroupId { get; set; } = string.Empty;
        public DependencyType Type { get; set; }
        public int Level { get; set; }
        public bool IsCritical { get; set; }
    }

    public enum DependencyType
    {
        Membership,
        NestedGroup,
        Permission,
        Policy,
        Other
    }

    #endregion

    #region Migration Result Models

    public class GroupMigrationResult : MigrationResult
    {
        public string SourceGroupId { get; set; } = string.Empty;
        public string? TargetGroupId { get; set; }
        public string GroupName { get; set; } = string.Empty;
        public int MigratedMembers { get; set; }
        public int TotalMembers { get; set; }
        public List<string> FailedMembers { get; set; } = new();
        public GroupMigrationStatus Status { get; set; }
        public new List<string> Warnings { get; set; } = new();
        public Dictionary<string, object> AdditionalData { get; set; } = new();
        
        // Additional properties for compatibility
        public bool Success { get; set; }
        public string ErrorMessage { get; set; } = string.Empty;
        public new DateTime? EndTime { get; set; }
        public TimeSpan MigrationDuration => EndTime?.Subtract(StartTime) ?? TimeSpan.Zero;
    }

    public enum GroupMigrationStatus
    {
        Success,
        PartialSuccess,
        Failed,
        Skipped,
        Rollback
    }

    public class GpoMigrationResult : MigrationResult
    {
        public string SourceGpoId { get; set; } = string.Empty;
        public string GpoName { get; set; } = string.Empty;
        public List<string> CreatedPolicyIds { get; set; } = new();
        public int MigratedSettings { get; set; }
        public int TotalSettings { get; set; }
        public int UnsupportedSettings { get; set; }
        public List<GpoSettingMigration> SettingResults { get; set; } = new();
        public GpoMigrationStatus Status { get; set; }
        public List<string> RecommendedActions { get; set; } = new();
        
        // Additional properties for compatibility
        public bool Success { get; set; }
        public string ErrorMessage { get; set; } = string.Empty;
        public new DateTime? EndTime { get; set; }
        public TimeSpan MigrationDuration => EndTime?.Subtract(StartTime) ?? TimeSpan.Zero;
    }

    public enum GpoMigrationStatus
    {
        FullyMigrated,
        PartiallyMigrated,
        NotSupported,
        Failed,
        ManualRequired
    }

    public class GpoSettingMigration
    {
        public string SettingName { get; set; } = string.Empty;
        public string SourceValue { get; set; } = string.Empty;
        public string? TargetValue { get; set; }
        public string? TargetPolicyId { get; set; }
        public GpoMigrationStrategy Strategy { get; set; }
        public bool Success { get; set; }
        public string? ErrorMessage { get; set; }
    }

    public class AclMigrationResult : MigrationResult
    {
        public string SourcePath { get; set; } = string.Empty;
        public string? TargetPath { get; set; }
        public int MigratedEntries { get; set; }
        public int TotalEntries { get; set; }
        public List<AclEntryMigration> EntryResults { get; set; } = new();
        public AclMigrationStatus Status { get; set; }
        public bool OwnershipPreserved { get; set; }
        public List<string> CreatedPermissionGroups { get; set; } = new();
        
        // Additional properties for compatibility
        public bool Success { get; set; }
        public string ErrorMessage { get; set; } = string.Empty;
        public new DateTime? EndTime { get; set; }
        public TimeSpan MigrationDuration => EndTime?.Subtract(StartTime) ?? TimeSpan.Zero;
    }

    public enum AclMigrationStatus
    {
        Success,
        PartialSuccess,
        Failed,
        Simplified,
        Skipped
    }

    public class AclEntryMigration
    {
        public string SourcePrincipal { get; set; } = string.Empty;
        public string? TargetPrincipal { get; set; }
        public List<string> SourcePermissions { get; set; } = new();
        public List<string> TargetPermissions { get; set; } = new();
        public bool Success { get; set; }
        public string? MappingStrategy { get; set; }
        public string? ErrorMessage { get; set; }
    }

    #endregion

    #region Validation and Compliance Models

    public class SecurityComplianceResult
    {
        public bool IsCompliant { get; set; }
        public List<ComplianceIssue> Issues { get; set; } = new();
        public List<SecurityRecommendation> Recommendations { get; set; } = new();
        public ComplianceLevel Level { get; set; }
        public DateTime ValidationDate { get; set; }
        public string ValidationContext { get; set; } = string.Empty;
    }

    public class ComplianceIssue
    {
        public string Category { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public ComplianceSeverity Severity { get; set; }
        public string? Resolution { get; set; }
        public bool IsBlocking { get; set; }
    }

    public class SecurityRecommendation
    {
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public RecommendationPriority Priority { get; set; }
        public List<string> Actions { get; set; } = new();
    }

    public enum ComplianceLevel
    {
        Full,
        Partial,
        Minimal,
        NonCompliant
    }

    public enum ComplianceSeverity
    {
        Low,
        Medium,
        High,
        Critical
    }

    public enum RecommendationPriority
    {
        Low,
        Medium,
        High,
        Critical
    }

    #endregion

    #region Event Args Models

    public class GroupMigrationProgressEventArgs : EventArgs
    {
        public string GroupId { get; set; } = string.Empty;
        public string GroupName { get; set; } = string.Empty;
        public int CurrentStep { get; set; }
        public int TotalSteps { get; set; }
        public string StatusMessage { get; set; } = string.Empty;
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    }

    public class PolicyMigrationConflictEventArgs : EventArgs
    {
        public string ConflictId { get; set; } = string.Empty;
        public string ConflictType { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public List<string> PossibleResolutions { get; set; } = new();
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    }

    public class AclValidationStatusEventArgs : EventArgs
    {
        public string ResourcePath { get; set; } = string.Empty;
        public string ValidationStatus { get; set; } = string.Empty;
        public List<string> Issues { get; set; } = new();
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    }

    #endregion

    #region Settings Models

    public class CrossDomainResolutionSettings
    {
        public bool AutoResolveWhenPossible { get; set; } = true;
        public bool CreatePlaceholderGroups { get; set; } = false;
        public bool LogUnresolvableReferences { get; set; } = true;
        public TimeSpan ResolutionTimeout { get; set; } = TimeSpan.FromMinutes(10);
        public int MaxResolutionDepth { get; set; } = 5;
    }

    public class SecurityComplianceSettings
    {
        public List<string> RequiredComplianceChecks { get; set; } = new();
        public bool ValidatePermissionBoundaries { get; set; } = true;
        public bool CheckPrivilegeEscalation { get; set; } = true;
        public bool ValidateGroupMembership { get; set; } = true;
        public ComplianceLevel MinimumLevel { get; set; } = ComplianceLevel.Partial;
    }

    public class SecurityAuditSettings
    {
        public bool IncludePermissionChanges { get; set; } = true;
        public bool IncludeGroupChanges { get; set; } = true;
        public bool IncludePolicyChanges { get; set; } = true;
        public string AuditLogPath { get; set; } = string.Empty;
        public AuditFormat Format { get; set; } = AuditFormat.Json;
        public bool CompressAuditLogs { get; set; } = true;
    }

    public enum AuditFormat
    {
        Json,
        Xml,
        Csv,
        EventLog
    }

    public class SecurityBackupSettings
    {
        public string BackupLocation { get; set; } = string.Empty;
        public bool CompressBackups { get; set; } = true;
        public bool EncryptBackups { get; set; } = true;
        public TimeSpan RetentionPeriod { get; set; } = TimeSpan.FromDays(30);
        public bool ValidateBackupIntegrity { get; set; } = true;
    }

    #endregion

    #region Additional Result Models

    public class CrossDomainResolutionResult
    {
        public List<CrossDomainGroupRef> ResolvedReferences { get; set; } = new();
        public List<CrossDomainGroupRef> UnresolvedReferences { get; set; } = new();
        public int TotalReferences { get; set; }
        public int ResolvedCount { get; set; }
        public List<string> CreatedPlaceholders { get; set; } = new();
        public bool Success { get; set; }
        public string? ErrorMessage { get; set; }
    }

    public class GpoValidationResult
    {
        public List<GpoData> ValidatedGpos { get; set; } = new();
        public List<GpoValidationIssue> Issues { get; set; } = new();
        public int SupportedSettings { get; set; }
        public int UnsupportedSettings { get; set; }
        public int ConditionalSettings { get; set; }
        public GpoMigrationFeasibility Feasibility { get; set; }
    }

    public class GpoValidationIssue
    {
        public string GpoId { get; set; } = string.Empty;
        public string SettingName { get; set; } = string.Empty;
        public string IssueType { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string? Recommendation { get; set; }
    }

    public enum GpoMigrationFeasibility
    {
        FullySupported,
        MostlySupported,
        PartiallySupported,
        NotSupported
    }

    public class AclValidationResult
    {
        public List<AclData> ValidatedAcls { get; set; } = new();
        public List<AclValidationIssue> Issues { get; set; } = new();
        public int PreservedEntries { get; set; }
        public int SimplifiedEntries { get; set; }
        public int LostEntries { get; set; }
        public bool SecurityIntegrityMaintained { get; set; }
    }

    public class AclValidationIssue
    {
        public string ResourcePath { get; set; } = string.Empty;
        public string Principal { get; set; } = string.Empty;
        public string IssueType { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public ComplianceSeverity Severity { get; set; }
    }

    public class SecurityConnectivityResult
    {
        public bool SourceConnectivity { get; set; }
        public bool TargetConnectivity { get; set; }
        public List<string> TestedEndpoints { get; set; } = new();
        public List<ConnectivityIssue> Issues { get; set; } = new();
        public DateTime TestDate { get; set; }
        public TimeSpan TestDuration { get; set; }
    }

    public class ConnectivityIssue
    {
        public string Endpoint { get; set; } = string.Empty;
        public string IssueType { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public bool IsBlocking { get; set; }
    }

    public class GroupValidationResult
    {
        public string GroupId { get; set; } = string.Empty;
        public string GroupName { get; set; } = string.Empty;
        public bool IsValid { get; set; }
        public List<string> ValidationIssues { get; set; } = new();
        public bool MembershipIntact { get; set; }
        public bool PermissionsValid { get; set; }
        public DateTime ValidationDate { get; set; }
    }

    public class GroupRollbackResult
    {
        public string GroupId { get; set; } = string.Empty;
        public string GroupName { get; set; } = string.Empty;
        public bool Success { get; set; }
        public string? ErrorMessage { get; set; }
        public List<string> ActionsPerformed { get; set; } = new();
        public DateTime RollbackDate { get; set; }
    }

    public class AuditTrailResult
    {
        public string AuditTrailId { get; set; } = string.Empty;
        public string FilePath { get; set; } = string.Empty;
        public int EntriesCreated { get; set; }
        public bool Success { get; set; }
        public string? ErrorMessage { get; set; }
        public DateTime CreationDate { get; set; }
    }

    public class SecurityBackupResult
    {
        public string BackupId { get; set; } = string.Empty;
        public string BackupPath { get; set; } = string.Empty;
        public int GroupsBackedUp { get; set; }
        public int GposBackedUp { get; set; }
        public bool Success { get; set; }
        public string? ErrorMessage { get; set; }
        public DateTime BackupDate { get; set; }
        public long BackupSizeBytes { get; set; }
    }

    #endregion
}