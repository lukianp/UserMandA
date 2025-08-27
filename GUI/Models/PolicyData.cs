#nullable enable
using System;

namespace MandADiscoverySuite.Models
{
    /// <summary>
    /// Immutable record representing Group Policy Object data from CSV files
    /// </summary>
    public record PolicyData(
        string? Name,
        string? Path,
        string? Scope,
        string? LinkedOUs,
        bool Enabled,
        bool ComputerSettingsEnabled,
        bool UserSettingsEnabled,
        DateTimeOffset? CreatedTime,
        DateTimeOffset? ModifiedTime,
        string? Description
    );
}
