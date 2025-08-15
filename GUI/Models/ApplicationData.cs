using System;

namespace MandADiscoverySuite.Models
{
    /// <summary>
    /// Immutable record representing application data from CSV files
    /// </summary>
    public record ApplicationData(
        string? Name,
        string? Version,
        string? Publisher,
        string? Type,
        int UserCount,
        int GroupCount,
        int DeviceCount,
        DateTimeOffset? LastSeen
    )
    {
        // Compatibility properties for old ViewModels
        public string? Id => Name; // Use Name as unique identifier
        public DateTimeOffset? InstallDate { get; init; } = LastSeen; // Map to LastSeen
    };
}