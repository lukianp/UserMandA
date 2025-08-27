#nullable enable
using System;

namespace MandADiscoverySuite.Models
{
    /// <summary>
    /// Immutable record representing threat detection data from security modules
    /// </summary>
    public record ThreatIndicator(
        string? ThreatType,
        string? Severity,
        string? Source,
        string? Target,
        string? Status,
        DateTimeOffset? DetectedDate,
        DateTimeOffset? LastActivity,
        string? Description,
        string? IOC,
        string? MITRE_ID,
        string? Response,
        bool IsActive
    )
    {
        // Compatibility properties
        public bool IsSelected { get; set; } = false;
        public string? Id => $"{ThreatType}_{Source}_{DetectedDate:yyyyMMdd}";
        
        // Computed properties for UI
        public string SeverityIcon => Severity?.ToLower() switch
        {
            "critical" => "🔥",
            "high" => "🚨",
            "medium" => "⚠️",
            "low" => "ℹ️",
            "info" => "💡",
            _ => "❓"
        };
        
        public string StatusIcon => Status?.ToLower() switch
        {
            "active" => "🔴",
            "investigating" => "🔍",
            "mitigated" => "🛡️",
            "resolved" => "✅",
            "false_positive" => "❌",
            _ => "❓"
        };
        
        public string ThreatIcon => ThreatType?.ToLower() switch
        {
            "malware" => "🦠",
            "phishing" => "🎣",
            "ransomware" => "🔒",
            "apt" => "👤",
            "ddos" => "💥",
            "data_exfiltration" => "📤",
            "privilege_escalation" => "⬆️",
            "lateral_movement" => "↔️",
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
        
        public bool IsOverdue => IsActive && LastActivity.HasValue && 
                                LastActivity.Value.AddDays(7) < DateTimeOffset.Now;
    };
}