using System;

namespace MandADiscoverySuite.Models
{
    /// <summary>
    /// Immutable record representing Microsoft Teams data
    /// </summary>
    public record TeamsData(
        string? TeamId,
        string? DisplayName,
        string? Description,
        DateTimeOffset? CreatedDateTime,
        string? Owner,
        int MemberCount,
        int ChannelCount,
        bool IsArchived,
        string? Visibility
    )
    {
        public string? Id => TeamId;
        public bool IsSelected { get; set; } = false;
        public string? TeamName => DisplayName;
    }
}