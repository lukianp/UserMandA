#nullable enable
using System;

namespace MandADiscoverySuite.Models
{
    /// <summary>
    /// Immutable record representing compliance assessment data
    /// </summary>
    public record ComplianceItem(
        string? ControlId,
        string? Framework,
        string? Title,
        string? Status,
        string? RiskLevel,
        string? Owner,
        DateTimeOffset? DueDate,
        string? Description,
        string? Evidence,
        string? Remediation,
        double Score,
        string? Category
    )
    {
        // Compatibility properties
        public bool IsSelected { get; set; } = false;
        public string? Id => ControlId;
        
        // Computed properties for UI
        public string StatusIcon => Status?.ToLower() switch
        {
            "passed" => "✅",
            "failed" => "❌",
            "partial" => "⚠️",
            "not_applicable" => "➖",
            "pending" => "⏳",
            _ => "❓"
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
        
        public string FrameworkIcon => Framework?.ToLower() switch
        {
            "iso27001" => "🏛️",
            "nist" => "🇺🇸",
            "gdpr" => "🇪🇺",
            "sox" => "💼",
            "pci" => "💳",
            "hipaa" => "🏥",
            _ => "📋"
        };
        
        public string StatusColor => Status?.ToLower() switch
        {
            "passed" => "#10B981",
            "failed" => "#EF4444",
            "partial" => "#F59E0B",
            "not_applicable" => "#6B7280",
            "pending" => "#3B82F6",
            _ => "#6B7280"
        };
        
        public bool IsOverdue => DueDate.HasValue && DueDate.Value < DateTimeOffset.Now && 
                                Status?.ToLower() != "passed";
        
        public string TimeToDeadline
        {
            get
            {
                if (!DueDate.HasValue) return "No deadline";
                if (Status?.ToLower() == "passed") return "Completed";
                
                var timeSpan = DueDate.Value - DateTimeOffset.Now;
                if (timeSpan.TotalDays < 0) return "Overdue";
                if (timeSpan.TotalDays < 1) return $"{(int)timeSpan.TotalHours}h";
                return $"{(int)timeSpan.TotalDays}d";
            }
        }
    };
}