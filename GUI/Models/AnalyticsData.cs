using System;
using System.Collections.Generic;

namespace MandADiscoverySuite.Models
{
    /// <summary>
    /// Model for analytics and KPI data from CSV files and computed metrics
    /// </summary>
    public class AnalyticsData
    {
        public string MetricName { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public double Value { get; set; }
        public double? PreviousValue { get; set; }
        public string Unit { get; set; } = string.Empty;
        public DateTime? CollectedDate { get; set; }
        public string Source { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Target { get; set; } = string.Empty;
        public double? TargetValue { get; set; }
        public string Threshold { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;

        // Aggregate metrics
        public int TotalUsers { get; set; }
        public int TotalComputers { get; set; }
        public int TotalGroups { get; set; }
        public int TotalApplications { get; set; }
        public int StaleDevices { get; set; }
        public int UsersWithoutMfa { get; set; }
        public Dictionary<string, int> TopGroupsByMembership { get; set; } = new();
        
        // Computed properties
        public double? PercentChange
        {
            get
            {
                if (!PreviousValue.HasValue || PreviousValue.Value == 0) return null;
                return ((Value - PreviousValue.Value) / PreviousValue.Value) * 100;
            }
        }
        
        public string PercentChangeFormatted
        {
            get
            {
                var change = PercentChange;
                if (!change.HasValue) return "N/A";
                var sign = change.Value >= 0 ? "+" : "";
                return $"{sign}{change.Value:0.1}%";
            }
        }
        
        public string TrendIcon
        {
            get
            {
                var change = PercentChange;
                if (!change.HasValue) return "➖";
                return change.Value switch
                {
                    > 5 => "📈",
                    > 0 => "🔼",
                    0 => "➖",
                    > -5 => "🔽",
                    _ => "📉"
                };
            }
        }
        
        public string CategoryIcon => Category?.ToLower() switch
        {
            "users" => "👥",
            "computers" => "💻",
            "infrastructure" => "🏗️",
            "security" => "🔒",
            "applications" => "📱",
            "storage" => "💾",
            "network" => "🌐",
            "performance" => "⚡",
            "compliance" => "📜",
            "migration" => "🔄",
            _ => "📊"
        };
        
        public string StatusIcon => Status?.ToLower() switch
        {
            "good" or "healthy" => "🟢",
            "warning" or "attention" => "🟡",
            "critical" or "error" => "🔴",
            "unknown" => "❓",
            _ => "⚫"
        };
        
        public string FormattedValue
        {
            get
            {
                return Unit?.ToLower() switch
                {
                    "bytes" => FormatBytes((long)Value),
                    "percentage" or "%" => $"{Value:0.1}%",
                    "count" => Value.ToString("N0"),
                    "currency" => $"${Value:N2}",
                    "time" => FormatTime(Value),
                    _ => Value.ToString("N2")
                };
            }
        }
        
        public bool IsTargetMet => TargetValue.HasValue && Value >= TargetValue.Value;
        
        private static string FormatBytes(long bytes)
        {
            if (bytes == 0) return "0 B";
            string[] sizes = { "B", "KB", "MB", "GB", "TB" };
            int order = 0;
            double size = bytes;
            while (size >= 1024 && order < sizes.Length - 1)
            {
                order++;
                size /= 1024;
            }
            return $"{size:0.##} {sizes[order]}";
        }
        
        private static string FormatTime(double hours)
        {
            if (hours < 1) return $"{hours * 60:0}m";
            if (hours < 24) return $"{hours:0.1}h";
            return $"{hours / 24:0.1}d";
        }
    }
    
    /// <summary>
    /// KPI summary for dashboard display
    /// </summary>
    public class KpiSummary
    {
        public string Name { get; set; } = string.Empty;
        public string Value { get; set; } = string.Empty;
        public string Change { get; set; } = string.Empty;
        public string Icon { get; set; } = string.Empty;
        public string Color { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
    }
}