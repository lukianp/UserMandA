#nullable enable
using System;
using System.Collections.Generic;
using System.Linq;

namespace MandADiscoverySuite.Models
{
    /// <summary>
    /// Core DTOs for the Logic Engine data fabric
    /// These represent unified in-memory models from CSV ingestion
    /// </summary>

    public record UserDto(
        string UPN,
        string Sam,
        string Sid,
        string? Mail,
        string? DisplayName,
        bool Enabled,
        string? OU,
        string? ManagerSid,
        string? Dept,
        string? AzureObjectId,
        List<string> Groups,
        DateTime DiscoveryTimestamp,
        string DiscoveryModule,
        string SessionId
    )
    {
        // Migration Engine compatibility properties (T-027)
        public string? Manager => ManagerSid; // Manager DN for compatibility
        public string? Dn => Sid; // Distinguished Name for compatibility
    };

    public record GroupDto(
        string Sid,
        string Name,
        string Type,
        List<string> Members,
        DateTime DiscoveryTimestamp,
        string DiscoveryModule,
        string SessionId,
        List<string>? NestedGroups = null
    )
    {
        // Migration Engine compatibility properties (T-027)
        public string? Dn => Sid; // Distinguished Name for compatibility
        public string? ManagedBy => null; // Manager DN - to be populated from discovery data
    };

    public record DeviceDto(
        string Name,
        string? DNS,
        string? OU,
        string? OS,
        string? PrimaryUserSid,
        List<string> InstalledApps,
        DateTime DiscoveryTimestamp,
        string DiscoveryModule,
        string SessionId
    );

    public record AppDto(
        string Id,
        string Name,
        string? Source,
        int InstallCounts,
        List<string> Executables,
        List<string> Publishers,
        DateTime DiscoveryTimestamp,
        string DiscoveryModule,
        string SessionId
    );

    public record GpoDto(
        string Guid,
        string Name,
        List<string> Links,
        List<string> SecurityFilter,
        string? WmiFilter,
        bool Enabled,
        DateTime DiscoveryTimestamp,
        string DiscoveryModule,
        string SessionId
    );

    public record AclEntryDto(
        string Path,
        string IdentitySid,
        string Rights,
        bool Inherited,
        bool IsShare,
        bool IsNTFS,
        DateTime DiscoveryTimestamp,
        string DiscoveryModule,
        string SessionId
    );

    public record MappedDriveDto(
        string UserSid,
        string Letter,
        string UNC,
        string? Label,
        DateTime DiscoveryTimestamp,
        string DiscoveryModule,
        string SessionId
    );

    public record MailboxDto(
        string UPN,
        string? MailboxGuid,
        decimal SizeMB,
        string Type,
        DateTime DiscoveryTimestamp,
        string DiscoveryModule,
        string SessionId,
        List<string>? Permissions = null,
        string? UserPrincipalName = null
    )
    {
        // Migration Engine compatibility - use UPN as primary identifier
        public string EffectiveUPN => UserPrincipalName ?? UPN;
    };

    public record AzureRoleAssignment(
        string PrincipalObjectId,
        string RoleName,
        string Scope,
        DateTime DiscoveryTimestamp,
        string DiscoveryModule,
        string SessionId
    );

    public record SqlDbDto(
        string Server,
        string? Instance,
        string Database,
        List<string> Owners,
        List<string> AppHints,
        DateTime DiscoveryTimestamp,
        string DiscoveryModule,
        string SessionId
    )
    {
        public string Name => Database;
    }

    public record FileShareDto(
        string Name,
        string Path,
        string? Description,
        string? Server,
        List<string> Permissions,
        DateTime DiscoveryTimestamp,
        string DiscoveryModule,
        string SessionId,
        List<AclEntry>? AclEntries = null
    );

    /// <summary>
    /// Graph node types for the logic engine network
    /// </summary>
    public enum NodeType
    {
        User,
        Group,
        Device,
        App,
        Share,
        Path,
        Gpo,
        Mailbox,
        Role,
        Db,
        Threat,
        DataAsset,
        LineageFlow,
        ExternalIdentity
    }

    /// <summary>
    /// Edge types for the logic engine graph
    /// </summary>
    public enum EdgeType
    {
        MemberOf,
        PrimaryUser,
        HasApp,
        AclOn,
        MapsTo,
        LinkedByGpo,
        HasMailbox,
        AssignedRole,
        OwnsDb,
        DependsOn,
        Threatens,
        HasGovernanceIssue,
        DataFlowTo,
        ExternalMapping,
        Correlates,
        Violates
    }

    /// <summary>
    /// Graph node representing an entity in the discovery system
    /// </summary>
    public record GraphNode(
        string Id,
        NodeType Type,
        Dictionary<string, object> Properties
    );

    /// <summary>
    /// Graph edge representing a relationship between entities
    /// </summary>
    public record GraphEdge(
        string SourceId,
        string TargetId,
        EdgeType Type,
        Dictionary<string, object>? Properties = null
    );

    /// <summary>
    /// Risk assessment for entities with missing mappings or orphaned references
    /// </summary>
    public record LogicEngineRisk(
        string EntityId,
        string EntityType,
        List<string> MissingMappings,
        List<string> OrphanedAcls,
        List<string> UnresolvableSidRefs,
        string Severity
    )
    {
        // Additional properties for UI binding
        public string Type => EntityType;
        public string Description => $"Risk assessment for {EntityType} {EntityId}";
        public string Recommendation => Severity switch
        {
            "High" => "Requires immediate attention before migration",
            "Medium" => "Should be reviewed and resolved during migration planning",
            "Low" => "Monitor during migration process",
            _ => "Review as needed"
        };
    };

    /// <summary>
    /// Migration hint for entitlements that need to be recreated in target
    /// </summary>
    public record MigrationHint(
        string EntityId,
        string EntityType,
        string HintType,
        string Description,
        Dictionary<string, string> RequiredActions
    );

    /// <summary>
    /// Projection models consumed by UI ViewModels
    /// </summary>
    public record UserDetailProjection(
        UserDto User,
        List<GroupDto> Groups,
        List<DeviceDto> Devices,
        List<AppDto> Apps,
        List<MappedDriveDto> Drives,
        List<AclEntry> Shares,
        List<GpoDto> GpoLinks,
        List<GpoDto> GpoFilters,
        MailboxDto? Mailbox,
        List<AzureRoleAssignment> AzureRoles,
        List<SqlDbDto> SqlDatabases,
        List<LogicEngineRisk> Risks,
        List<MigrationHint> MigrationHints
    )
    {
        // T-027 Migration Engine required properties (computed)
        public List<string> MemberOfGroups => Groups?.Select(g => g.Name ?? g.Dn).Where(n => !string.IsNullOrEmpty(n)).ToList() ?? new List<string>();
        public List<string> ManagedGroups => Groups?.Where(g => g.ManagedBy == User.Dn).Select(g => g.Name ?? g.Dn).Where(n => !string.IsNullOrEmpty(n)).ToList() ?? new List<string>();
        public string ManagerUpn => User.Manager ?? string.Empty;
        public List<string> OwnedGroups => Groups?.Where(g => g.ManagedBy == User.Dn).Select(g => g.Name ?? g.Dn).Where(n => !string.IsNullOrEmpty(n)).ToList() ?? new List<string>();
    };

    public record AssetDetailProjection(
        DeviceDto Device,
        UserDto? PrimaryUser,
        List<AppDto> InstalledApps,
        List<AclEntry> SharesUsed,
        List<GpoDto> GposApplied,
        List<string> Backups,
        List<string> VulnFindings,
        List<LogicEngineRisk> Risks
    );

    /// <summary>
    /// Configuration for fuzzy matching thresholds
    /// </summary>
    public record FuzzyMatchingConfig(
        double LevenshteinThreshold = 0.8,
        double JaroWinklerThreshold = 0.85,
        bool EnableFuzzyUserMatching = true,
        bool EnableFuzzyAppMatching = true
    );

    /// <summary>
    /// New DTOs for T-029 Logic Engine Expansion
    /// </summary>

    /// <summary>
    /// Threat detection data from security discovery modules
    /// </summary>
    public record ThreatDetectionDTO(
        string ThreatId,
        string ThreatName,
        string Category,
        string Severity,
        double Confidence,
        string MitreAttackId,
        string MitreTactic,
        string MitreTechnique,
        List<string> AffectedAssets,
        List<string> IndicatorsOfCompromise,
        Dictionary<string, string> ThreatDetails,
        DateTime DetectionTimestamp,
        string DetectionSource,
        string SessionId,
        string DiscoveryModule
    )
    {
        // Risk calculation based on severity and confidence
        public double ThreatScore => (Severity switch
        {
            "Critical" => 1.0,
            "High" => 0.8,
            "Medium" => 0.6,
            "Low" => 0.4,
            _ => 0.2
        }) * Confidence;

        public string RiskLevel => ThreatScore switch
        {
            >= 0.8 => "Critical",
            >= 0.6 => "High", 
            >= 0.4 => "Medium",
            >= 0.2 => "Low",
            _ => "Negligible"
        };
    };

    /// <summary>
    /// Data governance and metadata management information
    /// </summary>
    public record DataGovernanceDTO(
        string AssetId,
        string AssetName,
        string AssetType,
        string Classification,
        string Owner,
        string Custodian,
        List<string> RetentionPolicies,
        List<string> ComplianceFrameworks,
        Dictionary<string, string> Metadata,
        bool HasPersonalData,
        bool HasSensitiveData,
        DateTime LastAuditDate,
        string ComplianceStatus,
        List<string> ViolationsFound,
        DateTime DiscoveryTimestamp,
        string DiscoveryModule,
        string SessionId
    )
    {
        // Compliance risk scoring
        public double ComplianceScore => ComplianceStatus switch
        {
            "Compliant" => 1.0,
            "Minor Issues" => 0.8,
            "Major Issues" => 0.6,
            "Non-Compliant" => 0.4,
            "Unknown" => 0.2,
            _ => 0.0
        };

        public double GovernanceRisk => ViolationsFound.Count switch
        {
            0 => 0.1,
            1 => 0.3,
            2 => 0.5,
            >= 3 => 0.8,
            _ => 1.0
        };

        public string RiskLevel => GovernanceRisk switch
        {
            >= 0.8 => "Critical",
            >= 0.6 => "High",
            >= 0.4 => "Medium", 
            >= 0.2 => "Low",
            _ => "Negligible"
        };
    };

    /// <summary>
    /// Data lineage and dependency tracking information
    /// </summary>
    public record DataLineageDTO(
        string LineageId,
        string SourceAssetId,
        string SourceAssetName,
        string SourceAssetType,
        string TargetAssetId,
        string TargetAssetName,
        string TargetAssetType,
        string TransformationType,
        List<string> TransformationSteps,
        string DataFlow,
        Dictionary<string, string> FlowMetadata,
        List<string> Dependencies,
        bool IsOrphaned,
        bool HasBrokenLinks,
        DateTime LastValidated,
        DateTime DiscoveryTimestamp,
        string DiscoveryModule,
        string SessionId
    )
    {
        // Lineage risk calculation
        public double LineageRisk => (IsOrphaned ? 0.5 : 0.0) + 
                                   (HasBrokenLinks ? 0.4 : 0.0) + 
                                   (Dependencies.Count == 0 ? 0.3 : 0.0) +
                                   ((DateTime.UtcNow - LastValidated).Days > 30 ? 0.2 : 0.0);

        public string RiskLevel => LineageRisk switch
        {
            >= 0.8 => "Critical",
            >= 0.6 => "High",
            >= 0.4 => "Medium",
            >= 0.2 => "Low", 
            _ => "Negligible"
        };

        public List<string> Issues
        {
            get
            {
                var issues = new List<string>();
                if (IsOrphaned) issues.Add("Orphaned data source");
                if (HasBrokenLinks) issues.Add("Broken lineage links");
                if (Dependencies.Count == 0) issues.Add("No dependencies mapped");
                if ((DateTime.UtcNow - LastValidated).Days > 30) issues.Add("Stale lineage data");
                return issues;
            }
        }
    };

    /// <summary>
    /// External identity provider and federation information
    /// </summary>
    public record ExternalIdentityDTO(
        string ExternalIdentityId,
        string ExternalProvider,
        string ExternalUserId,
        string ExternalUserPrincipalName,
        string InternalUserSid,
        string InternalUserPrincipalName,
        string MappingStatus,
        string TrustLevel,
        List<string> AssignedRoles,
        List<string> Permissions,
        Dictionary<string, string> ExternalAttributes,
        DateTime LastSynchronized,
        List<string> SyncErrors,
        bool IsActive,
        bool RequiresRevalidation,
        DateTime DiscoveryTimestamp,
        string DiscoveryModule,
        string SessionId
    )
    {
        // Identity risk calculation
        public double IdentityRisk => (MappingStatus switch
        {
            "Mapped" => 0.1,
            "Partial" => 0.4,
            "Unmapped" => 0.7,
            "Conflict" => 0.9,
            _ => 1.0
        }) + (TrustLevel switch
        {
            "High" => 0.0,
            "Medium" => 0.2,
            "Low" => 0.4,
            "Untrusted" => 0.6,
            _ => 0.3
        }) + (SyncErrors.Count > 0 ? 0.2 : 0.0) + (!IsActive ? 0.1 : 0.0);

        public string RiskLevel => IdentityRisk switch
        {
            >= 0.8 => "Critical",
            >= 0.6 => "High",
            >= 0.4 => "Medium",
            >= 0.2 => "Low",
            _ => "Negligible"
        };

        public List<string> Issues
        {
            get
            {
                var issues = new List<string>();
                if (MappingStatus == "Unmapped") issues.Add("No internal mapping");
                if (MappingStatus == "Conflict") issues.Add("Mapping conflict detected");
                if (TrustLevel == "Low" || TrustLevel == "Untrusted") issues.Add("Low trust level");
                if (SyncErrors.Count > 0) issues.Add($"{SyncErrors.Count} sync errors");
                if (!IsActive) issues.Add("Inactive external identity");
                if (RequiresRevalidation) issues.Add("Requires revalidation");
                return issues;
            }
        }
    };

    /// <summary>
    /// Enhanced projection models for Risk Dashboard (T-029)
    /// </summary>

    /// <summary>
    /// Comprehensive risk dashboard projection with cross-module insights
    /// </summary>
    public record RiskDashboardProjection(
        int TotalThreats,
        int CriticalThreats,
        int HighThreats,
        double AverageThreatScore,
        List<ThreatDetectionDTO> TopThreats,
        
        int TotalGovernanceIssues,
        int CriticalComplianceViolations,
        double AverageComplianceScore,
        List<DataGovernanceDTO> TopGovernanceRisks,
        
        int TotalLineageGaps,
        int OrphanedDataSources,
        int BrokenLineageLinks,
        List<DataLineageDTO> TopLineageIssues,
        
        int TotalExternalIdentities,
        int UnmappedIdentities,
        int ConflictedMappings,
        double AverageIdentityRisk,
        List<ExternalIdentityDTO> TopIdentityRisks,
        
        double OverallRiskScore,
        List<string> TopRecommendations,
        DateTime GeneratedAt
    )
    {
        public string OverallRiskLevel => OverallRiskScore switch
        {
            >= 0.8 => "Critical",
            >= 0.6 => "High", 
            >= 0.4 => "Medium",
            >= 0.2 => "Low",
            _ => "Negligible"
        };

        public Dictionary<string, double> RiskCategories => new()
        {
            ["Security Threats"] = TopThreats.Count > 0 ? TopThreats.Average(t => t.ThreatScore) : 0.0,
            ["Data Governance"] = TopGovernanceRisks.Count > 0 ? TopGovernanceRisks.Average(g => g.GovernanceRisk) : 0.0,
            ["Data Lineage"] = TopLineageIssues.Count > 0 ? TopLineageIssues.Average(l => l.LineageRisk) : 0.0,
            ["Identity Management"] = TopIdentityRisks.Count > 0 ? TopIdentityRisks.Average(i => i.IdentityRisk) : 0.0
        };
    };

    /// <summary>
    /// Detailed threat analysis projection
    /// </summary>
    public record ThreatAnalysisProjection(
        List<ThreatDetectionDTO> AllThreats,
        Dictionary<string, List<ThreatDetectionDTO>> ThreatsByCategory,
        Dictionary<string, List<ThreatDetectionDTO>> ThreatsBySeverity,
        Dictionary<string, List<ThreatDetectionDTO>> ThreatsByAsset,
        List<ThreatCorrelation> ThreatCorrelations,
        List<MitreTacticSummary> MitreTactics,
        DateTime GeneratedAt
    );

    /// <summary>
    /// Threat correlation between different assets/techniques
    /// </summary>
    public record ThreatCorrelation(
        string PrimaryThreatId,
        string RelatedThreatId,
        string CorrelationType,
        double CorrelationScore,
        List<string> CommonAssets,
        List<string> CommonIndicators,
        string Impact
    );

    /// <summary>
    /// MITRE ATT&CK tactic summary
    /// </summary>
    public record MitreTacticSummary(
        string TacticId,
        string TacticName,
        List<string> TechniquesFound,
        int ThreatCount,
        double AverageConfidence,
        List<string> AffectedAssets
    );
}