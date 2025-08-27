#nullable enable
using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Linq;

namespace MandADiscoverySuite.Models
{
    #region Group Policy Models

    /// <summary>
    /// Enhanced Group Policy Object data model with risk analysis
    /// </summary>
    public record GroupPolicyObject(
        string? Name,
        string? DisplayName,
        string? Path,
        string? Domain,
        string? LinkedOUs,
        bool Enabled,
        bool ComputerSettingsEnabled,
        bool UserSettingsEnabled,
        bool HasWMIFilter,
        string? WMIFilter,
        string? SecurityFiltering,
        string? PolicySettings,
        DateTimeOffset? CreatedTime,
        DateTimeOffset? ModifiedTime,
        string? Description,
        string? Owner,
        string? LastModifiedBy,
        int Version,
        string? Status
    )
    {
        public string RiskLevel => CalculateRiskLevel();
        public string RiskIcon => RiskLevel switch
        {
            "Critical" => "🔴",
            "High" => "🟠", 
            "Medium" => "🟡",
            "Low" => "🟢",
            _ => "❓"
        };
        
        public string StatusIcon => Status?.ToLower() switch
        {
            "active" => "✅",
            "disabled" => "❌",
            "warning" => "⚠️",
            "error" => "🔴",
            _ => "❓"
        };

        private string CalculateRiskLevel()
        {
            var riskFactors = 0;
            
            // High-risk indicators
            if (!Enabled) riskFactors += 1;
            if (string.IsNullOrEmpty(SecurityFiltering)) riskFactors += 2;
            if (PolicySettings?.Contains("Admin") == true || PolicySettings?.Contains("Privilege") == true) riskFactors += 3;
            if (string.IsNullOrEmpty(Owner)) riskFactors += 1;
            if (ModifiedTime.HasValue && ModifiedTime.Value > DateTimeOffset.Now.AddDays(-7)) riskFactors += 1;
            
            return riskFactors switch
            {
                >= 5 => "Critical",
                >= 3 => "High",
                >= 2 => "Medium",
                _ => "Low"
            };
        }
    };

    #endregion

    #region Security Group Models

    /// <summary>
    /// Enhanced Security Group model with risk analysis and member details
    /// </summary>
    public record SecurityGroup(
        string? DisplayName,
        string? GroupType,
        string? Domain,
        bool MailEnabled,
        bool SecurityEnabled,
        string? Mail,
        string? Description,
        string? ManagedBy,
        DateTimeOffset? CreatedDateTime,
        DateTimeOffset? LastModified,
        int MemberCount,
        int OwnerCount,
        string? Visibility,
        bool IsPrivileged,
        string? NestedGroups,
        string? Permissions,
        string? RiskFactors
    )
    {
        public string RiskLevel => CalculateRiskLevel();
        public string RiskScore => CalculateRiskScore().ToString();
        public string RiskIcon => RiskLevel switch
        {
            "Critical" => "🔴",
            "High" => "🟠",
            "Medium" => "🟡", 
            "Low" => "🟢",
            _ => "❓"
        };

        public string GroupTypeIcon => GroupType?.ToLower() switch
        {
            "security" => "🛡️",
            "distribution" => "📧",
            "mail-enabled security" => "🔐",
            _ => "👥"
        };

        public string StatusColor => RiskLevel switch
        {
            "Critical" => "#DC2626",
            "High" => "#EA580C", 
            "Medium" => "#D97706",
            "Low" => "#059669",
            _ => "#6B7280"
        };

        private string CalculateRiskLevel()
        {
            var score = CalculateRiskScore();
            return score switch
            {
                >= 80 => "Critical",
                >= 60 => "High", 
                >= 40 => "Medium",
                _ => "Low"
            };
        }

        private int CalculateRiskScore()
        {
            var score = 0;
            
            // Privileged group indicators
            if (IsPrivileged) score += 30;
            if (DisplayName?.Contains("Admin") == true) score += 25;
            if (DisplayName?.Contains("Domain") == true) score += 20;
            if (DisplayName?.Contains("Enterprise") == true) score += 20;
            
            // Membership risk factors
            if (MemberCount > 100) score += 15;
            else if (MemberCount > 50) score += 10;
            else if (MemberCount > 20) score += 5;
            
            // Configuration risks
            if (string.IsNullOrEmpty(ManagedBy)) score += 10;
            if (!string.IsNullOrEmpty(NestedGroups)) score += 15;
            if (Visibility == "Public") score += 10;
            
            return Math.Min(score, 100);
        }
    };

    #endregion

    #region Infrastructure Security Models

    /// <summary>
    /// Antivirus product information
    /// </summary>
    public record AntivirusProduct(
        string? ProductName,
        string? Version,
        string? Vendor,
        string? ComputerName,
        string? Domain,
        bool IsEnabled,
        bool IsUpToDate,
        DateTimeOffset? LastUpdate,
        DateTimeOffset? LastScan,
        string? ScanType,
        int ThreatsDetected,
        string? Status,
        string? ConfigurationStatus
    )
    {
        public string StatusIcon => Status?.ToLower() switch
        {
            "protected" => "✅",
            "at_risk" => "⚠️",
            "critical" => "🔴",
            "disabled" => "❌",
            _ => "❓"
        };

        public string HealthColor => Status?.ToLower() switch
        {
            "protected" => "#059669",
            "at_risk" => "#D97706",
            "critical" => "#DC2626",
            "disabled" => "#6B7280",
            _ => "#6B7280"
        };

        public string LastScanText => LastScan.HasValue 
            ? $"{(DateTime.Now - LastScan.Value.DateTime).Days}d ago"
            : "Never";
    };

    /// <summary>
    /// Firewall profile configuration
    /// </summary>
    public record FirewallProfile(
        string? ComputerName,
        string? Domain,
        string? ProfileName,
        bool IsEnabled,
        string? InboundAction,
        string? OutboundAction,
        bool AllowInboundRules,
        bool AllowLocalFirewallRules,
        bool AllowLocalConSecRules,
        bool NotifyOnListen,
        bool EnableStealthMode,
        DateTimeOffset? LastModified,
        string? Status
    )
    {
        public string ProfileIcon => ProfileName?.ToLower() switch
        {
            "domain" => "🏢",
            "private" => "🏠",
            "public" => "🌐",
            _ => "🔥"
        };

        public string StatusColor => IsEnabled switch
        {
            true => "#059669",
            false => "#DC2626"
        };
    };

    /// <summary>
    /// Security appliance information
    /// </summary>
    public record SecurityAppliance(
        string? Name,
        string? Type,
        string? Vendor,
        string? Model,
        string? Version,
        string? IPAddress,
        string? Location,
        string? Status,
        DateTimeOffset? LastSeen,
        string? ConfigurationStatus,
        bool IsManaged,
        string? ManagementServer,
        string? Policies,
        int AlertCount,
        string? Health
    )
    {
        public string TypeIcon => Type?.ToLower() switch
        {
            "firewall" => "🔥",
            "ids" => "🛡️",
            "ips" => "🚫",
            "proxy" => "🔄",
            "vpn" => "🔒",
            _ => "⚙️"
        };

        public string HealthColor => Health?.ToLower() switch
        {
            "healthy" => "#059669",
            "warning" => "#D97706",
            "critical" => "#DC2626",
            "offline" => "#6B7280",
            _ => "#6B7280"
        };
    };

    #endregion

    #region Threat Detection Models

    /// <summary>
    /// Enhanced threat indicator model with additional properties for security policy view
    /// Extends the existing ThreatIndicator with MITRE ATT&CK integration
    /// </summary>
    public class SecurityThreatIndicator
    {
        public string? IndicatorType { get; set; }
        public string? Value { get; set; }
        public string? ThreatType { get; set; }
        public string? Severity { get; set; }
        public string? Source { get; set; }
        public string? Campaign { get; set; }
        public string? MitreTactic { get; set; }
        public string? MitreTechnique { get; set; }
        public string? Description { get; set; }
        public DateTimeOffset? FirstSeen { get; set; }
        public DateTimeOffset? LastSeen { get; set; }
        public int ConfidenceScore { get; set; }
        public string? IOCs { get; set; }
        public string? RecommendedActions { get; set; }
        public string? Status { get; set; }
        public bool IsActive { get; set; }

        public string SeverityIcon => Severity?.ToLower() switch
        {
            "critical" => "🔴",
            "high" => "🟠",
            "medium" => "🟡",
            "low" => "🟢",
            "info" => "🔵",
            _ => "❓"
        };

        public string TypeIcon => IndicatorType?.ToLower() switch
        {
            "ip" => "🌐",
            "domain" => "🌍",
            "url" => "🔗",
            "hash" => "#️⃣",
            "email" => "📧",
            "file" => "📄",
            _ => "⚠️"
        };

        public string SeverityColor => Severity?.ToLower() switch
        {
            "critical" => "#DC2626",
            "high" => "#EA580C",
            "medium" => "#D97706", 
            "low" => "#059669",
            "info" => "#0EA5E9",
            _ => "#6B7280"
        };

        public string ConfidenceText => ConfidenceScore switch
        {
            >= 90 => "Very High",
            >= 70 => "High",
            >= 50 => "Medium",
            >= 30 => "Low",
            _ => "Very Low"
        };
    }

    #endregion

    #region Compliance Models

    /// <summary>
    /// Compliance control status
    /// </summary>
    public record ComplianceControl(
        string? ControlId,
        string? ControlName,
        string? Framework,
        string? Category,
        string? Description,
        string? Status,
        string? ImplementationStatus,
        string? Owner,
        string? Evidence,
        DateTimeOffset? LastAssessed,
        DateTimeOffset? NextReview,
        string? Findings,
        string? Remediation,
        int RiskRating,
        bool IsCompliant
    )
    {
        public string StatusIcon => Status?.ToLower() switch
        {
            "compliant" => "✅",
            "non-compliant" => "❌", 
            "partially_compliant" => "⚠️",
            "not_assessed" => "❓",
            "in_progress" => "🔄",
            _ => "❓"
        };

        public string StatusColor => Status?.ToLower() switch
        {
            "compliant" => "#059669",
            "non-compliant" => "#DC2626",
            "partially_compliant" => "#D97706",
            "not_assessed" => "#6B7280",
            "in_progress" => "#0EA5E9",
            _ => "#6B7280"
        };

        public string RiskLevel => RiskRating switch
        {
            >= 8 => "Critical",
            >= 6 => "High",
            >= 4 => "Medium",
            _ => "Low"
        };

        public string FrameworkIcon => Framework?.ToLower() switch
        {
            "iso27001" => "🔒",
            "nist" => "🏛️",
            "soc2" => "📋",
            "gdpr" => "🇪🇺",
            "hipaa" => "🏥",
            "pci" => "💳",
            _ => "📜"
        };
    };

    #endregion

    #region Critical Issues Models

    /// <summary>
    /// Critical security issue that requires immediate attention
    /// </summary>
    public record CriticalIssue(
        string? IssueId,
        string? Title,
        string? Description,
        string? Severity,
        string? Category,
        string? AffectedSystem,
        string? Owner,
        DateTimeOffset? DetectedDate,
        DateTimeOffset? DueDate,
        string? Status,
        string? Recommendation,
        string? BusinessImpact,
        int Priority,
        bool IsEscalated
    )
    {
        public string SeverityIcon => Severity?.ToLower() switch
        {
            "critical" => "🔴",
            "high" => "🟠",
            "medium" => "🟡",
            "low" => "🟢",
            _ => "❓"
        };

        public string CategoryIcon => Category?.ToLower() switch
        {
            "vulnerability" => "🐛",
            "configuration" => "⚙️",
            "access" => "🔐",
            "network" => "🌐",
            "data" => "📊",
            "compliance" => "📜",
            _ => "⚠️"
        };

        public bool IsOverdue => DueDate.HasValue && DueDate.Value < DateTimeOffset.Now;
        
        public string TimeToResolution
        {
            get
            {
                if (!DueDate.HasValue) return "No deadline";
                var timeSpan = DueDate.Value - DateTimeOffset.Now;
                if (timeSpan.TotalDays < 0) return "Overdue";
                if (timeSpan.TotalDays < 1) return $"{(int)timeSpan.TotalHours}h";
                return $"{(int)timeSpan.TotalDays}d";
            }
        }
    };

    #endregion

    #region Security Dashboard Models

    /// <summary>
    /// Security KPI metrics for dashboard
    /// </summary>
    public class SecurityKPI
    {
        public string Name { get; set; } = string.Empty;
        public string Value { get; set; } = string.Empty;
        public string Trend { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public string Icon { get; set; } = string.Empty;
        public string Color { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
    }

    /// <summary>
    /// Environment information for adaptive loading
    /// </summary>
    public class EnvironmentInfo
    {
        public string Type { get; set; } = "Hybrid"; // Azure, OnPrem, Hybrid
        public bool HasAzureAD { get; set; }
        public bool HasOnPremAD { get; set; }
        public bool HasExchange { get; set; }
        public bool HasOffice365 { get; set; }
        public List<string> DiscoveredModules { get; set; } = new();
        
        public string Icon => Type.ToLower() switch
        {
            "azure" => "☁️",
            "onprem" => "🏢",
            "hybrid" => "🔄",
            _ => "❓"
        };
    }

    #endregion

    #region Enums

    public enum SecurityFramework
    {
        ISO27001,
        NIST,
        SOC2,
        GDPR,
        HIPAA,
        PCI_DSS,
        CIS_Controls
    }

    public enum ThreatSeverity
    {
        Critical,
        High,
        Medium,
        Low,
        Info
    }

    public enum ComplianceStatus
    {
        Compliant,
        NonCompliant,
        PartiallyCompliant,
        NotAssessed,
        InProgress
    }

    // Note: RiskLevel enum already exists in WhatIfSimulationModels.cs - using that one

    #endregion
}