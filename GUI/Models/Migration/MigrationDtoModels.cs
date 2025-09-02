using System;
using System.Collections.Generic;
using MandADiscoverySuite.Services.Migration;

namespace MandADiscoverySuite.Models.Migration
{
    /// <summary>
    /// Temporary stub models for compilation - these are referenced but not yet fully implemented
    /// </summary>

    // File-related DTOs
    public class FileItemDto
    {
        public string Id { get; set; }
        public string Name { get; set; }
        public string Path { get; set; }
        public string SourcePath { get; set; }
        public long Size { get; set; }
        public DateTime CreatedDate { get; set; }
        public DateTime ModifiedDate { get; set; }
        public string MimeType { get; set; }
        public Dictionary<string, object> Metadata { get; set; } = new Dictionary<string, object>();
    }

    // Validation result stubs
    public class ContentValidationResult : MigrationResultBase
    {
        public bool IsContentValid { get; set; }
        public List<string> ValidationIssues { get; set; } = new List<string>();
    }

    public class MailboxValidationResult : MigrationResultBase
    {
        public bool IsMailboxValid { get; set; }
        public List<string> ValidationIssues { get; set; } = new List<string>();
    }

    public class DistributionListResult : MigrationResultBase
    {
        public string DistributionListId { get; set; }
        public int MembersAdded { get; set; }
    }

    public class PermissionInheritanceResult : MigrationResultBase
    {
        public bool InheritanceEnabled { get; set; }
        public List<string> InheritedPermissions { get; set; } = new List<string>();
    }

    public class ShareConfigurationResult : MigrationResultBase
    {
        public string ShareName { get; set; }
        public List<string> ConfiguredUsers { get; set; } = new List<string>();
    }

    public class FileSystemValidationResult : MigrationResultBase
    {
        public bool IsFileSystemValid { get; set; }
        public List<string> ValidationIssues { get; set; } = new List<string>();
    }

    // SQL Migration results
    public class SqlMigrationResult : MigrationResultBase
    {
        public string DatabaseName { get; set; }
        public int TablesCreated { get; set; }
        public int RecordsTransferred { get; set; }
    }

    public class SchemaCompatibilityResult : MigrationResultBase
    {
        public bool IsSchemaCompatible { get; set; }
        public List<string> CompatibilityIssues { get; set; } = new List<string>();
    }

    public class LoginMigrationResult : MigrationResultBase
    {
        public string LoginName { get; set; }
        public bool LoginMigrated { get; set; }
    }

    public class DataValidationResult : MigrationResultBase
    {
        public bool IsDataValid { get; set; }
        public List<string> ValidationIssues { get; set; } = new List<string>();
    }

    public class LinkedServerResult : MigrationResultBase
    {
        public string LinkedServerName { get; set; }
        public bool ConnectionEstablished { get; set; }
    }

    public class SqlAgentJobResult : MigrationResultBase
    {
        public string JobName { get; set; }
        public bool JobCreated { get; set; }
    }

    // ACL Migration result stub
    public class AclMigrationResult : MigrationResultBase
    {
        public string ObjectPath { get; set; }
        public int PermissionsSet { get; set; }
        public List<string> PermissionIssues { get; set; } = new List<string>();
    }
}