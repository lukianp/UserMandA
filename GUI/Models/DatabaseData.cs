#nullable enable
using System;

namespace MandADiscoverySuite.Models
{
    /// <summary>
    /// Immutable record representing SQL instance data from CSV files
    /// </summary>
    public record SqlInstanceData(
        string? Server,
        string? Instance,
        string? Version,
        string? Edition,
        int DatabaseCount,
        double TotalSizeGB,
        DateTimeOffset? LastSeen,
        string? Engine
    );

    /// <summary>
    /// Immutable record representing database data from CSV files
    /// </summary>
    public record DatabaseData(
        string? DatabaseName,
        string? Owner,
        double SizeGB,
        string? CompatLevel,
        string? Status,
        DateTimeOffset? LastBackup
    );
}