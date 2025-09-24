using System;

namespace MandADiscoverySuite.Models
{
    /// <summary>
    /// Immutable record representing SharePoint site data
    /// </summary>
    public record SharePointData(
        string? SiteUrl,
        string? Title,
        long StorageUsed,
        DateTimeOffset? LastModified,
        string? Owner,
        int DocumentCount,
        int ListCount,
        string? Template,
        bool IsPublic
    )
    {
        public string? Id => SiteUrl;
        public bool IsSelected { get; set; } = false;
        public string? SiteName => Title;
    }
}