#nullable enable
using System;
using System.Collections.Generic;

namespace MandADiscoverySuite.Models
{
    /// <summary>
    /// Immutable record representing analytics and KPI data from CSV files and computed metrics
    /// </summary>
    public record AnalyticsData(
        string MetricName,
        string Category,
        double Value,
        double? PreviousValue,
        string Unit,
        DateTime? CollectedDate,
        string Source,
        string Description,
        string Target,
        double? TargetValue,
        string Threshold,
        string Status
    )
    {
        // Aggregate metrics (init-only properties)
        public int TotalUsers { get; init; }
        public int TotalComputers { get; init; }
        public int TotalGroups { get; init; }
        public int TotalApplications { get; init; }
        public int StaleDevices { get; init; }
        public int UsersWithoutMfa { get; init; }
        public Dictionary<string, int> TopGroupsByMembership { get; init; } = new();
        
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
    /// Immutable record for KPI summary for dashboard display
    /// </summary>
    public record KpiSummary(
        string Name,
        string Value,
        string Change,
        string Icon,
        string Color,
        string Status
    );
}