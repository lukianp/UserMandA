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
        public string SourcePath { get; set; }  // Alias for FilePath
        public string TargetPath { get; set; }  // Migration target path
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
        public string Name { get; set; }  // Alias for DatabaseName
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
        
        // Additional properties for migration operations
        public string SourceServer { get; set; } = string.Empty;
        public string TargetServer { get; set; } = string.Empty;
        public Dictionary<string, object> CustomProperties { get; set; } = new Dictionary<string, object>();
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

    /// <summary>
    /// Data Transfer Object for SharePoint sites in migration operations
    /// </summary>
    public class SharePointSiteDto
    {
        public string Id { get; set; }
        public string Title { get; set; }
        public string Url { get; set; }
        public string Template { get; set; }
        public long StorageUsage { get; set; }
        public DateTime Created { get; set; }
        public DateTime LastModified { get; set; }
        public string SiteOwner { get; set; }
        public bool IsDeleted { get; set; }
        public List<string> Admins { get; set; } = new List<string>();
        public Dictionary<string, object> Properties { get; set; } = new Dictionary<string, object>();
    }

    /// <summary>
    /// Data Transfer Object for SQL database items in migration operations
    /// </summary>
    public class SqlDatabaseDto
    {
        public string Server { get; set; }
        public string Instance { get; set; }
        public string Database { get; set; }
        public string Name { get; set; }  // Alias for Database
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

        // Additional properties for migration operations
        public string SourceServer { get; set; } = string.Empty;
        public string TargetServer { get; set; } = string.Empty;
        public Dictionary<string, object> CustomProperties { get; set; } = new Dictionary<string, object>();
    }

    /// <summary>
    /// Data Transfer Object for file share items in migration operations
    /// </summary>
    public class FileShareDto
    {
        public string Name { get; set; }
        public string Path { get; set; }
        public string Description { get; set; }
        public string Server { get; set; }
        public int MaxUses { get; set; }
        public int CurrentUses { get; set; }
        public string ShareType { get; set; }
        public List<string> Users { get; set; } = new List<string>();
        public List<string> Groups { get; set; } = new List<string>();
        public Dictionary<string, object> Permissions { get; set; } = new Dictionary<string, object>();
        public Dictionary<string, object> Properties { get; set; } = new Dictionary<string, object>();
    }

    /// <summary>
    /// Migration settings and configuration
    /// </summary>
    public class MigrationSettings
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;

        // General migration settings
        public bool EnableDeltaMigration { get; set; } = true;
        public bool ValidateBeforeMigration { get; set; } = true;
        public bool ValidateAfterMigration { get; set; } = true;
        public bool EnableRollback { get; set; } = true;
        public bool CreateBackups { get; set; } = true;

        // Performance settings
        public int MaxConcurrentOperations { get; set; } = 4;
        public int BatchSize { get; set; } = 100;
        public TimeSpan RetryDelay { get; set; } = TimeSpan.FromSeconds(30);
        public int MaxRetryAttempts { get; set; } = 3;
        public TimeSpan OperationTimeout { get; set; } = TimeSpan.FromMinutes(30);

        // Data handling settings
        public bool PreservePermissions { get; set; } = true;
        public bool PreserveTimestamps { get; set; } = true;
        public bool PreserveOwnership { get; set; } = true;
        public bool MaintainVersionHistory { get; set; } = true;
        public bool CompressData { get; set; } = false;
        public bool EncryptInTransit { get; set; } = true;

        // Filtering settings
        public long MaxFileSizeBytes { get; set; } = 15L * 1024 * 1024 * 1024; // 15GB SharePoint limit
        public List<string> ExcludedFileExtensions { get; set; } = new List<string>();
        public List<string> ExcludedDirectories { get; set; } = new List<string>();
        public List<string> IncludedDirectories { get; set; } = new List<string>();
        public DateTime? CutoffDate { get; set; }

        // Notification settings
        public bool EnableProgressNotifications { get; set; } = true;
        public bool EnableErrorNotifications { get; set; } = true;
        public bool EnableCompletionNotifications { get; set; } = true;
        public List<string> NotificationRecipients { get; set; } = new List<string>();

        // Logging settings
        public bool EnableDetailedLogging { get; set; } = true;
        public string LogLevel { get; set; } = "Information";
        public string LogOutputPath { get; set; } = string.Empty;
        public bool LogToFile { get; set; } = true;
        public bool LogToEventLog { get; set; } = false;

        // Custom settings for specific migration types
        public Dictionary<string, object> CustomSettings { get; set; } = new Dictionary<string, object>();

        // Additional properties for IdentityMigrator compatibility
        public string ConflictResolution { get; set; } = "Prompt";
        public string MigrationStrategy { get; set; } = "Create";
        public bool EnablePasswordProvisioning { get; set; } = false;
        public string PasswordRequirements { get; set; } = "TempPassword";

        // Scheduling
        public DateTime? ScheduledStart { get; set; }
        public List<TimeSpan> BlackoutWindows { get; set; } = new List<TimeSpan>();
        public List<DayOfWeek> PreferredDays { get; set; } = new List<DayOfWeek>();

        // Metadata
        public string CreatedBy { get; set; } = string.Empty;
        public DateTime CreatedDate { get; set; } = DateTime.Now;
        public string LastModifiedBy { get; set; } = string.Empty;
        public DateTime LastModifiedDate { get; set; } = DateTime.Now;

        // Validation
        public List<string> ValidationErrors { get; set; } = new List<string>();

        public bool IsValid
        {
            get
            {
                Validate();
                return ValidationErrors.Count == 0;
            }
        }

        public void Validate()
        {
            ValidationErrors.Clear();

            if (string.IsNullOrWhiteSpace(Name))
                ValidationErrors.Add("Migration settings name is required");

            if (MaxConcurrentOperations <= 0)
                ValidationErrors.Add("Max concurrent operations must be greater than 0");

            if (BatchSize <= 0)
                ValidationErrors.Add("Batch size must be greater than 0");

            if (MaxRetryAttempts < 0)
                ValidationErrors.Add("Max retry attempts cannot be negative");

            if (MaxFileSizeBytes <= 0)
                ValidationErrors.Add("Max file size must be greater than 0");
        }

        /// <summary>
        /// Create default migration settings
        /// </summary>
        public static MigrationSettings CreateDefault()
        {
            return new MigrationSettings
            {
                Name = "Default Migration Settings",
                Description = "Default settings for migration operations"
            };
        }

        /// <summary>
        /// Create settings optimized for large file migrations
        /// </summary>
        public static MigrationSettings CreateForLargeFiles()
        {
            return new MigrationSettings
            {
                Name = "Large File Migration Settings",
                Description = "Optimized settings for large file migrations",
                MaxConcurrentOperations = 2,
                BatchSize = 10,
                CompressData = true,
                OperationTimeout = TimeSpan.FromHours(2)
            };
        }

        /// <summary>
        /// Create settings optimized for user migrations
        /// </summary>
        public static MigrationSettings CreateForUsers()
        {
            return new MigrationSettings
            {
                Name = "User Migration Settings",
                Description = "Optimized settings for user account migrations",
                MaxConcurrentOperations = 8,
                BatchSize = 50,
                ValidateBeforeMigration = true,
                ValidateAfterMigration = true
            };
        }
    }

    /// <summary>
    /// Represents a migration wave containing batched migration operations
    /// </summary>
    public class MigrationWave
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public MigrationWaveStatus Status { get; set; } = MigrationWaveStatus.Pending;
        public DateTime? ScheduledStart { get; set; }
        public DateTime? ActualStart { get; set; }
        public DateTime? ActualEnd { get; set; }
        public int Priority { get; set; } = 1;

        public TimeSpan? Duration => ActualEnd.HasValue && ActualStart.HasValue
            ? ActualEnd.Value - ActualStart.Value
            : null;

        // Migration items in this wave
        public List<UserItem> Users { get; set; } = new List<UserItem>();
        public List<MailboxItem> Mailboxes { get; set; } = new List<MailboxItem>();
        public List<GroupItem> Groups { get; set; } = new List<GroupItem>();
        public List<FileShareItem> FileShares { get; set; } = new List<FileShareItem>();
        public List<FileShareItem> Files { get; set; } = new List<FileShareItem>(); // Alias for FileShares
        public List<DatabaseItem> Databases { get; set; } = new List<DatabaseItem>();
        public List<GroupPolicyItem> GroupPolicies { get; set; } = new List<GroupPolicyItem>();
        public List<AclItem> AccessControlLists { get; set; } = new List<AclItem>();
        public List<object> CustomItems { get; set; } = new List<object>();

        // Wave configuration
        public Dictionary<string, object> Settings { get; set; } = new Dictionary<string, object>();
        public List<string> Dependencies { get; set; } = new List<string>(); // Other wave IDs this depends on
        public List<string> Tags { get; set; } = new List<string>();

        // Progress tracking
        public int TotalItems => Users.Count + Mailboxes.Count + Groups.Count + FileShares.Count + Databases.Count + GroupPolicies.Count + AccessControlLists.Count + CustomItems.Count;
        public int ProcessedItems { get; set; }
        public int SuccessfulItems { get; set; }
        public int FailedItems { get; set; }

        public double ProgressPercentage => TotalItems > 0 ? (double)ProcessedItems / TotalItems * 100 : 0;
        public double SuccessRate => ProcessedItems > 0 ? (double)SuccessfulItems / ProcessedItems * 100 : 0;

        // Metadata
        public string CreatedBy { get; set; } = string.Empty;
        public DateTime CreatedDate { get; set; } = DateTime.Now;
        public string LastModifiedBy { get; set; } = string.Empty;
        public DateTime LastModifiedDate { get; set; } = DateTime.Now;

        // Validation
        public bool IsValid => !string.IsNullOrEmpty(Name) && TotalItems > 0;
        public List<string> ValidationErrors { get; set; } = new List<string>();

        public void Validate()
        {
            ValidationErrors.Clear();

            if (string.IsNullOrWhiteSpace(Name))
                ValidationErrors.Add("Wave name is required");

            if (TotalItems == 0)
                ValidationErrors.Add("Wave must contain at least one migration item");

            if (ScheduledStart.HasValue && ScheduledStart.Value < DateTime.Now)
                ValidationErrors.Add("Scheduled start time cannot be in the past");

            foreach (var dependencyId in Dependencies)
            {
                if (dependencyId == Id)
                    ValidationErrors.Add("Wave cannot depend on itself");
            }
        }
    }

    /// <summary>
    /// Status enumeration for migration waves
    /// </summary>
    public enum MigrationWaveStatus
    {
        Pending,
        Scheduled,
        InProgress,
        Completed,
        Failed,
        Cancelled,
        Paused
    }

    // Item types for migration waves
    public class UserItem
    {
        public string UserPrincipalName { get; set; }
        public string DisplayName { get; set; }
        public Dictionary<string, object> Properties { get; set; } = new Dictionary<string, object>();
    }

    public class MailboxItem
    {
        public string UserPrincipalName { get; set; }
        public string PrimarySmtpAddress { get; set; }
        public long SizeBytes { get; set; }
        public Dictionary<string, object> Properties { get; set; } = new Dictionary<string, object>();
    }

    public class GroupItem
    {
        public string Name { get; set; }
        public string Description { get; set; }
        public string GroupType { get; set; }
        public string Sid { get; set; } = string.Empty;
        public string GroupScope { get; set; } = string.Empty;
        public List<string> Members { get; set; } = new List<string>();
        public List<string> MemberSids { get; set; } = new List<string>();
        public List<string> MemberOfSids { get; set; } = new List<string>();
        public Dictionary<string, object> Properties { get; set; } = new Dictionary<string, object>();
        public Dictionary<string, object> CustomAttributes { get; set; } = new Dictionary<string, object>();
    }

    public class FileShareItem
    {
        public string SourcePath { get; set; }
        public string TargetPath { get; set; }
        public long SizeBytes { get; set; }
        public Dictionary<string, object> Properties { get; set; } = new Dictionary<string, object>();
    }

    public class DatabaseItem
    {
        public string Name { get; set; }
        public string SourceServer { get; set; }
        public string TargetServer { get; set; }
        public long SizeMB { get; set; }
        public Dictionary<string, object> Properties { get; set; } = new Dictionary<string, object>();
    }
}