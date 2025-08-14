using System;
using System.Collections.Generic;

namespace MandADiscoverySuite.Models
{
    /// <summary>
    /// Model for file server data from CSV files
    /// </summary>
    public class FileServerData
    {
        public string Name { get; set; } = string.Empty;
        public string ServerName { get; set; } = string.Empty;
        public string OperatingSystem { get; set; } = string.Empty;
        public string Version { get; set; } = string.Empty;
        public string Location { get; set; } = string.Empty;
        public string Domain { get; set; } = string.Empty;
        public string IPAddress { get; set; } = string.Empty;
        public int ShareCount { get; set; }
        public long TotalSizeBytes { get; set; }
        public DateTime? LastScan { get; set; }
        public DateTime? LastSeen { get; set; }
        public string Status { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty;
        
        // Computed properties
        public string TotalSizeFormatted => FormatBytes(TotalSizeBytes);
        public string StatusIcon => Status?.ToLower() switch
        {
            "online" => "🟢",
            "offline" => "🔴",
            "warning" => "🟡",
            _ => "❓"
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
        
        // Share-related properties (when loading from Shares.csv)
        public string ShareName { get; set; } = string.Empty;
        public string SharePath { get; set; } = string.Empty;
        public string ShareDescription { get; set; } = string.Empty;
        public long ShareSizeBytes { get; set; }
        public int FileCount { get; set; }
        public DateTime? LastAccessed { get; set; }
        public string Permissions { get; set; } = string.Empty;
        public bool IsHidden { get; set; }
        public bool IsEncrypted { get; set; }
    }
    
    /// <summary>
    /// Model for NTFS ACL data
    /// </summary>
    public class NtfsAclData
    {
        public string Path { get; set; } = string.Empty;
        public string Owner { get; set; } = string.Empty;
        public string Group { get; set; } = string.Empty;
        public string Permissions { get; set; } = string.Empty;
        public bool IsInherited { get; set; }
        public string AccessType { get; set; } = string.Empty; // Allow/Deny
        public string Principal { get; set; } = string.Empty;
        public string Rights { get; set; } = string.Empty;
        public DateTime? LastModified { get; set; }
    }
}