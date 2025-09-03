using System;
using System.Collections.Generic;

namespace MandADiscoverySuite.Models.Migration
{
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
    /// License settings for migration waves
    /// </summary>
    public class WaveLicenseSettings
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();
        public string WaveId { get; set; } = string.Empty;
        
        // Default license assignments
        public List<string> DefaultLicenseSkus { get; set; } = new List<string>();
        public Dictionary<string, List<string>> UserSpecificLicenses { get; set; } = new Dictionary<string, List<string>>();
        public Dictionary<string, List<string>> RoleBasedLicenses { get; set; } = new Dictionary<string, List<string>>();
        
        // License management settings
        public bool RemoveSourceLicenses { get; set; } = false;
        public bool ValidateLicenseAvailability { get; set; } = true;
        public bool AssignLicensesBeforeMigration { get; set; } = true;
        public bool WaitForLicenseProvisioning { get; set; } = true;
        
        // Licensing rules
        public bool PreferE3OverE1 { get; set; } = true;
        public bool AutoUpgradeToE5 { get; set; } = false;
        public bool AssignAzureP1ByDefault { get; set; } = true;
        public bool RequireIntuneLicense { get; set; } = false;
        
        // Custom settings
        public Dictionary<string, object> CustomLicenseRules { get; set; } = new Dictionary<string, object>();
        
        public DateTime CreatedDate { get; set; } = DateTime.Now;
        public string CreatedBy { get; set; } = string.Empty;
    }
}