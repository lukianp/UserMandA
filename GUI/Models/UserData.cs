#nullable enable
using System;

namespace MandADiscoverySuite.Models
{
    /// <summary>
    /// Immutable record representing user data from CSV files
    /// </summary>
    public record UserData(
        string? DisplayName,
        string? UserPrincipalName,
        string? Mail,
        string? Department,
        string? JobTitle,
        bool AccountEnabled,
        string? SamAccountName,
        string? CompanyName,
        string? ManagerDisplayName,
        DateTimeOffset? CreatedDateTime,
        string? UserSource = null
    )
    {
        // Compatibility properties for old ViewModels
        public string? Name => DisplayName;
        public string? Email => Mail;
        public bool IsSelected { get; set; } = false; // Mutable property for UI selection
        public string? Id => UserPrincipalName; // Use UPN as unique identifier
        public string? Domain { get; init; } = null; // Can be extracted from UPN
    };
}