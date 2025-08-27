#nullable enable
using System;

namespace MandADiscoverySuite.Models
{
    /// <summary>
    /// Immutable record representing file server data from CSV files
    /// </summary>
    public record FileServerData(
        string? ServerName,
        string? OS,
        string? Version,
        string? Location,
        int ShareCount,
        double TotalSizeGB,
        DateTimeOffset? LastScan
    )
    {
        // Compatibility properties for old ViewModels
        public string? OperatingSystem => OS;
        public string? Domain { get; init; } = null;
        public string? IPAddress { get; init; } = null;
        public double TotalSizeBytes => TotalSizeGB * 1024 * 1024 * 1024;
        public string? Status { get; init; } = "Active";
        public string? Type { get; init; } = "FileServer";
    };

    /// <summary>
    /// Immutable record representing file share data from CSV files
    /// </summary>
    public record ShareData(
        string? ShareName,
        string? Path,
        double SizeGB,
        int Files,
        DateTimeOffset? LastAccess
    );
}