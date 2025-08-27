#nullable enable
using System;

namespace MandADiscoverySuite.Models
{
    /// <summary>
    /// Immutable record representing infrastructure/computer data from CSV files
    /// </summary>
    public record InfrastructureData(
        string? Name,
        string? Type,
        string? Description,
        string? IPAddress,
        string? OperatingSystem,
        string? Version,
        string? Location,
        string? Status,
        string? Manufacturer,
        string? Model,
        DateTimeOffset? LastSeen
    )
    {
        // Compatibility properties for old ViewModels
        public bool IsSelected { get; set; } = false; // Mutable property for UI selection
        public string? Id => Name; // Use Name as unique identifier
        public string? Domain { get; init; } = null; // Can be extracted from computer name
    };
}