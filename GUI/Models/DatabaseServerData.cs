using System;
using System.Collections.Generic;

namespace MandADiscoverySuite.Models
{
    /// <summary>
    /// Model for database server data from CSV files
    /// </summary>
    public class DatabaseServerData
    {
        public string ServerName { get; set; } = string.Empty;
        public string InstanceName { get; set; } = string.Empty;
        public string DatabaseName { get; set; } = string.Empty;
        public string Version { get; set; } = string.Empty;
        public string Edition { get; set; } = string.Empty;
        public string ServicePack { get; set; } = string.Empty;
        public string CollationName { get; set; } = string.Empty;
        public string Owner { get; set; } = string.Empty;
        public string CreatedDate { get; set; } = string.Empty;
        public string LastBackup { get; set; } = string.Empty;
        public long SizeBytes { get; set; }
        public string RecoveryModel { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public string Port { get; set; } = string.Empty;
        public string IPAddress { get; set; } = string.Empty;
        public string Domain { get; set; } = string.Empty;
        public string Location { get; set; } = string.Empty;
        public DateTime? LastScan { get; set; }
        public DateTime? LastSeen { get; set; }
        
        // Computed properties
        public string SizeFormatted => FormatBytes(SizeBytes);
        public string StatusIcon => Status?.ToLower() switch
        {
            "online" => "🟢",
            "offline" => "🔴",
            "warning" => "🟡",
            "suspect" => "🟠",
            _ => "❓"
        };
        
        public string TypeIcon => InstanceName?.ToLower() switch
        {
            var name when name.Contains("sql") => "🗄️",
            var name when name.Contains("oracle") => "🔶",
            var name when name.Contains("mysql") => "🐬",
            var name when name.Contains("postgres") => "🐘",
            _ => "💾"
        };

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
    }
}