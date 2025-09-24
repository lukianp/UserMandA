using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;

namespace MandADiscoverySuite.Services.Migration
{
    /// <summary>
    /// Interface for pre-migration validation service
    /// </summary>
    public interface IPreMigrationValidationService
    {
        /// <summary>
        /// Event raised when validation progress changes
        /// </summary>
        event EventHandler<ValidationProgressEventArgs> ValidationProgress;

        /// <summary>
        /// Performs comprehensive pre-migration eligibility checks and returns detailed report
        /// </summary>
        Task<PreMigrationValidationResult> ValidateMigrationEligibilityAsync(CancellationToken cancellationToken = default);

        /// <summary>
        /// Validates users for migration eligibility
        /// </summary>
        Task<List<UserValidationItem>> ValidateUsersAsync(CancellationToken cancellationToken = default);

        /// <summary>
        /// Validates mailboxes for migration eligibility
        /// </summary>
        Task<List<MailboxValidationItem>> ValidateMailboxesAsync(CancellationToken cancellationToken = default);

        /// <summary>
        /// Validates file shares for migration eligibility
        /// </summary>
        Task<List<FileShareValidationItem>> ValidateFileSharesAsync(CancellationToken cancellationToken = default);

        /// <summary>
        /// Validates databases for migration eligibility
        /// </summary>
        Task<List<DatabaseValidationItem>> ValidateDatabasesAsync(CancellationToken cancellationToken = default);

        /// <summary>
        /// Performs fuzzy matching between source and target objects
        /// </summary>
        Task<List<ObjectMapping>> PerformObjectMappingAsync(List<ValidationItemBase> items, CancellationToken cancellationToken = default);

        /// <summary>
        /// Saves manual object mappings
        /// </summary>
        Task SaveManualMappingsAsync(List<ObjectMapping> mappings, CancellationToken cancellationToken = default);

        /// <summary>
        /// Loads manual object mappings
        /// </summary>
        Task<List<ObjectMapping>> LoadManualMappingsAsync(CancellationToken cancellationToken = default);
    }

    /// <summary>
    /// Base class for validation items
    /// </summary>
    public abstract class ValidationItemBase
    {
        public string Id { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty;
        public bool IsEligible { get; set; }
        public List<string> Issues { get; set; } = new List<string>();
        public object SourceObject { get; set; } = null!;
        public ObjectMapping? TargetMapping { get; set; }
        public string MappingStatus { get; set; } = "Not Processed";
        public string IssuesSummary => string.Join("; ", Issues);
        public string EligibilityStatus => IsEligible ? "Eligible" : "Blocked";
    }

    /// <summary>
    /// User validation item
    /// </summary>
    public class UserValidationItem : ValidationItemBase
    {
        public MandADiscoverySuite.Models.UserDto? User { get; set; }
    }

    /// <summary>
    /// Mailbox validation item
    /// </summary>
    public class MailboxValidationItem : ValidationItemBase
    {
        public MandADiscoverySuite.Models.MailboxDto? Mailbox { get; set; }
    }

    /// <summary>
    /// File share validation item
    /// </summary>
    public class FileShareValidationItem : ValidationItemBase
    {
        public MandADiscoverySuite.Models.FileShareDto? FileShare { get; set; }
    }

    /// <summary>
    /// Database validation item
    /// </summary>
    public class DatabaseValidationItem : ValidationItemBase
    {
        public MandADiscoverySuite.Models.SqlDbDto? Database { get; set; }
    }

    /// <summary>
    /// Pre-migration validation result
    /// </summary>
    public class PreMigrationValidationResult
    {
        public DateTime GeneratedAt { get; set; }
        public List<UserValidationItem> Users { get; set; } = new List<UserValidationItem>();
        public List<MailboxValidationItem> Mailboxes { get; set; } = new List<MailboxValidationItem>();
        public List<FileShareValidationItem> FileShares { get; set; } = new List<FileShareValidationItem>();
        public List<DatabaseValidationItem> Databases { get; set; } = new List<DatabaseValidationItem>();

        public int TotalEligible => Users.Count(u => u.IsEligible) + Mailboxes.Count(m => m.IsEligible) +
                                   FileShares.Count(f => f.IsEligible) + Databases.Count(d => d.IsEligible);

        public int TotalBlocked => Users.Count(u => !u.IsEligible) + Mailboxes.Count(m => !m.IsEligible) +
                                  FileShares.Count(f => !f.IsEligible) + Databases.Count(d => !d.IsEligible);

        public int TotalUnmapped => Users.Count(u => u.IsEligible && u.MappingStatus == "Unmapped") +
                                   Mailboxes.Count(m => m.IsEligible && m.MappingStatus == "Unmapped") +
                                   FileShares.Count(f => f.IsEligible && f.MappingStatus == "Unmapped") +
                                   Databases.Count(d => d.IsEligible && d.MappingStatus == "Unmapped");
    }


    /// <summary>
    /// Validation progress event arguments
    /// </summary>
    public class ValidationProgressEventArgs : EventArgs
    {
        public string Operation { get; set; } = string.Empty;
        public string CurrentItem { get; set; } = string.Empty;
        public int CurrentCount { get; set; }
        public int TotalCount { get; set; }
        public double ProgressPercentage => TotalCount > 0 ? (double)CurrentCount / TotalCount * 100 : 0;
        public TimeSpan? EstimatedTimeRemaining { get; set; }
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    }
}