#nullable enable
using System;

namespace MandADiscoverySuite.Models
{
    /// <summary>
    /// Immutable record representing group data from CSV files
    /// </summary>
    public record GroupData(
        string? DisplayName,
        string? GroupType,
        bool MailEnabled,
        bool SecurityEnabled,
        string? Mail,
        DateTimeOffset? CreatedDateTime,
        int MemberCount,
        int OwnerCount,
        string? Visibility,
        string? Description
    )
    {
        // Compatibility properties for old ViewModels
        public string? Name => DisplayName;
        public string? Type => GroupType;
        public bool IsSelected { get; set; } = false; // Mutable property for UI selection
        public string? Id => DisplayName; // Use DisplayName as unique identifier
    };
}