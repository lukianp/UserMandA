using System;

namespace MandADiscoverySuite.Models
{
    /// <summary>
    /// Immutable record representing mailbox data
    /// </summary>
    public record MailboxData(
        string? DisplayName,
        string? EmailAddress,
        long TotalSize,
        int ItemCount,
        DateTimeOffset? LastLogonTime,
        string? StorageQuota,
        string? MailboxType,
        string? DatabaseName
    )
    {
        public string? Id => EmailAddress;
        public bool IsSelected { get; set; } = false;
        public string? UserPrincipalName => EmailAddress;
    }
}