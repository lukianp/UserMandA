using System.Collections.Generic;

namespace MandADiscoverySuite.Migration
{
    /// <summary>
    /// Basic user transfer object for migrations.
    /// </summary>
    public class UserDto
    {
        public string DisplayName { get; set; } = string.Empty;
        public string UserPrincipalName { get; set; } = string.Empty;
    }

    /// <summary>
    /// Mailbox object used during mailbox migrations.
    /// </summary>
    public class MailboxDto
    {
        public string PrimarySmtpAddress { get; set; } = string.Empty;
    }

    /// <summary>
    /// File item definition for file migrations.
    /// </summary>
    public class FileItemDto
    {
        public string SourcePath { get; set; } = string.Empty;
        public string TargetPath { get; set; } = string.Empty;
    }

    /// <summary>
    /// Database object for SQL migrations.
    /// </summary>
    public class DatabaseDto
    {
        public string Name { get; set; } = string.Empty;
    }

    /// <summary>
    /// Global migration settings.
    /// </summary>
    public class MigrationSettings
    {
        public bool OverwriteExisting { get; set; }
    }

    /// <summary>
    /// Target environment context information.
    /// </summary>
    public class TargetContext
    {
        public string TenantId { get; set; } = string.Empty;
        public string ClientId { get; set; } = string.Empty;
        public string[] AccessScopes { get; set; } = System.Array.Empty<string>();
    }

    /// <summary>
    /// Represents a collection of items to migrate in a single wave.
    /// </summary>
    public class MigrationWave
    {
        public IList<UserDto> Users { get; } = new List<UserDto>();
        public IList<MailboxDto> Mailboxes { get; } = new List<MailboxDto>();
        public IList<FileItemDto> Files { get; } = new List<FileItemDto>();
        public IList<DatabaseDto> Databases { get; } = new List<DatabaseDto>();
    }
}
