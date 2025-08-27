#nullable enable
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
        
        // Additional properties for UI binding
        public int InstallCount => DeviceCount; // Map DeviceCount to InstallCount for UI
        public string? Status => DetermineStatus(); // Derive status from available data
        public string? Category => Type; // Map Type to Category for UI
        
        private string? DetermineStatus()
        {
            // Simple heuristic to determine status
            if (LastSeen.HasValue)
            {
                var daysSinceLastSeen = (DateTimeOffset.Now - LastSeen.Value).Days;
                return daysSinceLastSeen switch
                {
                    <= 30 => "Active",
                    <= 90 => "Inactive", 
                    _ => "Obsolete"
                };
            }
            return "Unknown";
        }
    };
}