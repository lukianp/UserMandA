using System;
using System.Collections.Generic;

namespace MandADiscoverySuite.Models.Migration
{
    /// <summary>
    /// Data Transfer Object for file items in migration operations
    /// </summary>
    public class FileItemDto
    {
        public string FilePath { get; set; }
        public string FileName { get; set; }
        public string Directory { get; set; }
        public long FileSize { get; set; }
        public DateTime LastModified { get; set; }
        public DateTime Created { get; set; }
        public string FileExtension { get; set; }
        public string MimeType { get; set; }
        public string Hash { get; set; }
        public string Owner { get; set; }
        public List<string> Permissions { get; set; } = new List<string>();
        public bool IsEncrypted { get; set; }
        public string Source { get; set; }
        public string Target { get; set; }
        public Dictionary<string, object> Metadata { get; set; } = new Dictionary<string, object>();
    }

    /// <summary>
    /// Data Transfer Object for mailbox items in migration operations
    /// </summary>
    public class MailboxDto
    {
        public string UserPrincipalName { get; set; }
        public string DisplayName { get; set; }
        public string PrimarySmtpAddress { get; set; }
        public long TotalSizeBytes { get; set; }
        public string MailboxType { get; set; }
        public DateTime DiscoveryTimestamp { get; set; }
        public string DiscoveryModule { get; set; }
        public string SessionId { get; set; }
        public int ItemCount { get; set; }
        public string ProhibitSendQuota { get; set; }
        public string ProhibitSendReceiveQuota { get; set; }
        public string IssueWarningQuota { get; set; }
        public bool IsArchiveEnabled { get; set; }
        public long ArchiveSizeBytes { get; set; }
        public List<string> EmailAddresses { get; set; } = new List<string>();
        public Dictionary<string, object> Properties { get; set; } = new Dictionary<string, object>();
    }

    /// <summary>
    /// Data Transfer Object for user data in migration operations
    /// </summary>
    public class UserDto
    {
        public string UserPrincipalName { get; set; }
        public string DisplayName { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string Email { get; set; }
        public string Department { get; set; }
        public string JobTitle { get; set; }
        public string Manager { get; set; }
        public string OfficeLocation { get; set; }
        public string PhoneNumber { get; set; }
        public string EmployeeId { get; set; }
        public bool IsEnabled { get; set; }
        public DateTime LastLogon { get; set; }
        public DateTime Created { get; set; }
        public DateTime Modified { get; set; }
        public List<string> GroupMemberships { get; set; } = new List<string>();
        public List<string> Licenses { get; set; } = new List<string>();
        public Dictionary<string, object> CustomAttributes { get; set; } = new Dictionary<string, object>();
    }

    /// <summary>
    /// Data Transfer Object for database items in migration operations
    /// </summary>
    public class DatabaseDto
    {
        public string DatabaseName { get; set; }
        public string ServerName { get; set; }
        public string InstanceName { get; set; }
        public long SizeMB { get; set; }
        public string CompatibilityLevel { get; set; }
        public string CollationName { get; set; }
        public DateTime LastBackup { get; set; }
        public string RecoveryModel { get; set; }
        public string Owner { get; set; }
        public List<string> Users { get; set; } = new List<string>();
        public List<string> Schemas { get; set; } = new List<string>();
        public int TableCount { get; set; }
        public int ViewCount { get; set; }
        public int StoredProcedureCount { get; set; }
        public Dictionary<string, object> Properties { get; set; } = new Dictionary<string, object>();
    }

    /// <summary>
    /// Data Transfer Object for Group Policy items in migration operations
    /// </summary>
    public class GroupPolicyDto
    {
        public string GpoGuid { get; set; }
        public string GpoName { get; set; }
        public string DisplayName { get; set; }
        public string Description { get; set; }
        public string Domain { get; set; }
        public string Owner { get; set; }
        public DateTime CreatedDate { get; set; }
        public DateTime ModifiedDate { get; set; }
        public List<string> LinkedOUs { get; set; } = new List<string>();
        public List<string> SecurityFiltering { get; set; } = new List<string>();
        public List<string> WmiFilters { get; set; } = new List<string>();
        public bool IsEnabled { get; set; }
        public int Version { get; set; }
        public Dictionary<string, object> Settings { get; set; } = new Dictionary<string, object>();
        public Dictionary<string, object> CustomProperties { get; set; } = new Dictionary<string, object>();
    }

    /// <summary>
    /// Data Transfer Object for ACL items in migration operations
    /// </summary>
    public class AclDto
    {
        public string Path { get; set; }
        public string ObjectType { get; set; } // File, Directory, Registry, Share
        public string Owner { get; set; }
        public string PrimaryGroup { get; set; }
        public bool InheritanceEnabled { get; set; }
        public List<AclEntryDto> AccessControlEntries { get; set; } = new List<AclEntryDto>();
        public Dictionary<string, object> ExtendedAttributes { get; set; } = new Dictionary<string, object>();
    }

    /// <summary>
    /// Data Transfer Object for ACL entries
    /// </summary>
    public class AclEntryDto
    {
        public string Sid { get; set; }
        public string IdentityReference { get; set; }
        public string AccessMask { get; set; }
        public string AccessControlType { get; set; } // Allow, Deny
        public string InheritanceFlags { get; set; }
        public string PropagationFlags { get; set; }
        public bool IsInherited { get; set; }
    }

}