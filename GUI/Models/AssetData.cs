#nullable enable
using System;

namespace MandADiscoverySuite.Models
{
    /// <summary>
    /// Immutable record representing asset data (merged into InfrastructureData)
    /// This model is deprecated - use InfrastructureData instead
    /// </summary>
    public record AssetData(
        string? Name,
        string? Type,
        string? Owner,
        string? Status,
        string? Location,
        string? Description
    )
    {
        // Compatibility properties for UI selection
        public bool IsSelected { get; set; } = false;
        public string? Id => Name;
    };
}
