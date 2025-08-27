using System;
using System.Collections.Generic;

namespace MandADiscoverySuite.Models
{
    /// <summary>
    /// Model for security risk and posture data from CSV files
    /// </summary>
    public class SecurityRiskData
    {
        public string ResourceName { get; set; } = string.Empty;
        public string ResourceType { get; set; } = string.Empty;
        public string RiskType { get; set; } = string.Empty;
        public string RiskLevel { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Recommendation { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public string Severity { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public string Owner { get; set; } = string.Empty;
        public string Domain { get; set; } = string.Empty;
        public string Location { get; set; } = string.Empty;
        public DateTime? DetectedDate { get; set; }
        public DateTime? LastSeen { get; set; }
        public DateTime? DueDate { get; set; }
        public bool IsResolved { get; set; }
        public string ResolutionNotes { get; set; } = string.Empty;
        
        // Computed properties
        public string RiskIcon => RiskLevel?.ToLower() switch
        {
            "critical" => "🔴",
            "high" => "🟠",
            "medium" => "🟡",
            "low" => "🟢",
            "info" => "🔵",
            _ => "❓"
        };
        
        public string StatusIcon => Status?.ToLower() switch
        {
            "active" => "⚠️",
            "investigating" => "🔍",
            "resolved" => "✅",
            "mitigated" => "🛡️",
            "accepted" => "📋",
            _ => "❓"
        };
        
        public string CategoryIcon => Category?.ToLower() switch
        {
            "access" => "🔐",
            "network" => "🌐",
            "data" => "📊",
            "compliance" => "📜",
            "configuration" => "⚙️",
            "vulnerability" => "🐛",
            _ => "🛡️"
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
        
        public bool IsOverdue => DueDate.HasValue && DueDate.Value < DateTime.Now && !IsResolved;
        
        public string TimeToResolution
        {
            get
            {
                if (!DueDate.HasValue) return "No deadline";
                if (IsResolved) return "Resolved";
                
                var timeSpan = DueDate.Value - DateTime.Now;
                if (timeSpan.TotalDays < 0) return "Overdue";
                if (timeSpan.TotalDays < 1) return $"{(int)timeSpan.TotalHours}h";
                return $"{(int)timeSpan.TotalDays}d";
            }
        }
    }
}