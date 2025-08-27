#nullable enable
using System;

namespace MandADiscoverySuite.Models
{
    /// <summary>
    /// Immutable record representing security infrastructure data from discovery modules
    /// </summary>
    public record SecurityInfrastructureItem(
        string? Component,
        string? Type,
        string? Status,
        string? Version,
        string? Location,
        string? RiskLevel,
        DateTimeOffset? LastSeen,
        string? Description,
        string? Vendor,
        string? ProductState,
        string? Configuration
    )
    {
        // Compatibility properties
        public bool IsSelected { get; set; } = false;
        public string? Id => Component;
        
        // Computed properties for UI
        public string StatusIcon => Status?.ToLower() switch
        {
            "active" => "✅",
            "inactive" => "❌",
            "degraded" => "⚠️",
            "unknown" => "❓",
            _ => "⚪"
        };
        
        public string RiskIcon => RiskLevel?.ToLower() switch
        {
            "critical" => "🔴",
            "high" => "🟠",
            "medium" => "🟡",
            "low" => "🟢",
            "info" => "🔵",
            _ => "⚪"
        };
        
        public string TypeIcon => Type?.ToLower() switch
        {
            "antivirus" => "🛡️",
            "firewall" => "🧱",
            "vpn" => "🔐",
            "siem" => "👁️",
            "backup" => "💾",
            "monitoring" => "📊",
            _ => "🔧"
        };
    };
}