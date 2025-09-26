using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using MandADiscoverySuite.Models.Migration;
using MandADiscoverySuite.Services.Migration;
using MandADiscoverySuite.Migration;

namespace MandADiscoverySuite.Services
{
    /// <summary>
    /// Interface for audit record validation service
    /// </summary>
    public interface IAuditRecordValidationService
    {
        /// <summary>
        /// Validates user migration and creates comprehensive audit records
        /// </summary>
        Task<AuditValidationResult> ValidateUserAsync(UserDto user, TargetContext target, IProgress<AuditValidationProgress>? progress = null, CancellationToken cancellationToken = default);

        /// <summary>
        /// Validates mailbox migration and creates comprehensive audit records
        /// </summary>
        Task<AuditValidationResult> ValidateMailboxAsync(MailboxDto mailbox, TargetContext target, IProgress<AuditValidationProgress>? progress = null, CancellationToken cancellationToken = default);

        /// <summary>
        /// Validates file migration and creates comprehensive audit records
        /// </summary>
        Task<AuditValidationResult> ValidateFilesAsync(FileItemDto fileItem, TargetContext target, IProgress<AuditValidationProgress>? progress = null, CancellationToken cancellationToken = default);

        /// <summary>
        /// Validates database migration and creates comprehensive audit records
        /// </summary>
        Task<AuditValidationResult> ValidateDatabaseAsync(DatabaseDto database, TargetContext target, IProgress<AuditValidationProgress>? progress = null, CancellationToken cancellationToken = default);

        /// <summary>
        /// Validates entire migration wave and creates consolidated audit records
        /// </summary>
        Task<WaveAuditValidationResult> ValidateWaveAsync(MigrationWave wave, TargetContext target, IProgress<AuditValidationProgress>? progress = null, CancellationToken cancellationToken = default);

        /// <summary>
        /// Rolls back user migration with comprehensive audit tracking
        /// </summary>
        Task<RollbackResult> RollbackUserAsync(UserDto user, TargetContext target, IProgress<AuditValidationProgress>? progress = null, CancellationToken cancellationToken = default);

        /// <summary>
        /// Rolls back mailbox migration with comprehensive audit tracking
        /// </summary>
        Task<RollbackResult> RollbackMailboxAsync(MailboxDto mailbox, TargetContext target, IProgress<AuditValidationProgress>? progress = null, CancellationToken cancellationToken = default);

        /// <summary>
        /// Rolls back file migration with comprehensive audit tracking
        /// </summary>
        Task<RollbackResult> RollbackFilesAsync(FileItemDto fileItem, TargetContext target, IProgress<AuditValidationProgress>? progress = null, CancellationToken cancellationToken = default);

        /// <summary>
        /// Rolls back database migration with comprehensive audit tracking
        /// </summary>
        Task<RollbackResult> RollbackDatabaseAsync(DatabaseDto database, TargetContext target, IProgress<AuditValidationProgress>? progress = null, CancellationToken cancellationToken = default);

        /// <summary>
        /// Retrieves audit records with filtering and sorting capabilities
        /// </summary>
        Task<List<AuditRecord>> GetAuditRecordsAsync(DateTime startDate, DateTime endDate, string? objectType = null, string? status = null, string? waveId = null, CancellationToken cancellationToken = default);

        /// <summary>
        /// Exports audit records to CSV format
        /// </summary>
        Task ExportAuditRecordsToCsvAsync(List<AuditRecord> records, string filePath, CancellationToken cancellationToken = default);

        /// <summary>
        /// Exports audit records to PDF format
        /// </summary>
        Task ExportAuditRecordsToPdfAsync(List<AuditRecord> records, string filePath, CancellationToken cancellationToken = default);
    }

    /// <summary>
    /// Result object for audit validation operations
    /// </summary>
    public class AuditValidationResult
    {
        public bool IsValid { get; set; }
        public string ObjectType { get; set; } = string.Empty;
        public string ObjectIdentifier { get; set; } = string.Empty;
        public List<AuditValidationIssue> Issues { get; set; } = new List<AuditValidationIssue>();
        public int IssueCount => Issues.Count;
        public int ErrorCount => Issues.Count(i => i.Severity == AuditValidationSeverity.Error);
        public int WarningCount => Issues.Count(i => i.Severity == AuditValidationSeverity.Warning);
        public AuditRecord AuditRecord { get; set; } = new();
        public TimeSpan Duration { get; set; }
        public DateTime StartedAt { get; set; }
        public DateTime CompletedAt { get; set; }

        public static AuditValidationResult Success(string objectType, string objectIdentifier, string message = "")
        {
            return new AuditValidationResult
            {
                IsValid = true,
                ObjectType = objectType,
                ObjectIdentifier = objectIdentifier,
                Issues = new List<AuditValidationIssue>()
            };
        }

        public static AuditValidationResult Failed(string objectType, string objectIdentifier, string message, List<AuditValidationIssue> issues)
        {
            return new AuditValidationResult
            {
                IsValid = false,
                ObjectType = objectType,
                ObjectIdentifier = objectIdentifier,
                Issues = issues ?? new List<AuditValidationIssue>()
            };
        }
    }

    /// <summary>
    /// Result object for wave-level audit validation operations
    /// </summary>
    public class WaveAuditValidationResult
    {
        public bool IsValid { get; set; }
        public int TotalObjects { get; set; }
        public int SuccessfulValidations { get; set; }
        public int FailedValidations { get; set; }
        public List<AuditValidationResult> IndividualResults { get; set; } = new List<AuditValidationResult>();
        public AuditRecord WaveAuditRecord { get; set; } = new();
        public List<AuditRecord> IndividualAuditRecords { get; set; } = new List<AuditRecord>();
        public TimeSpan TotalDuration { get; set; }
        public Dictionary<string, int> ObjectTypeSummary { get; set; } = new Dictionary<string, int>();
    }

    /// <summary>
    /// Represents an individual validation issue
    /// </summary>
    public class AuditValidationIssue
    {
        public AuditValidationSeverity Severity { get; set; }
        public string Category { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string RecommendedAction { get; set; } = string.Empty;
        public Dictionary<string, object> AdditionalData { get; set; } = new Dictionary<string, object>();
    }

    /// <summary>
    /// Severity levels for validation issues
    /// </summary>
    public enum AuditValidationSeverity
    {
        Information,
        Warning,
        Error
    }

    /// <summary>
    /// Progress reporting for validation operations
    /// </summary>
    public class AuditValidationProgress
    {
        public int Percentage { get; set; }
        public string Message { get; set; } = string.Empty;
        public string CurrentOperation { get; set; } = string.Empty;
        public string CurrentObject { get; set; } = string.Empty;
        public int ObjectsProcessed { get; set; }
        public int TotalObjects { get; set; }
        public TimeSpan ElapsedTime { get; set; }
        public TimeSpan EstimatedTimeRemaining { get; set; }
    }

    /// <summary>
    /// Audit record for tracking validation and rollback operations
    /// </summary>
    public class AuditRecord
    {
        public string Id { get; set; } = string.Empty;
        public string Action { get; set; } = string.Empty;
        public string ObjectType { get; set; } = string.Empty;
        public string ObjectIdentifier { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }
        public TimeSpan Duration { get; set; }
        public string InitiatedBy { get; set; } = string.Empty;
        public int IssueCount { get; set; }
        public int ErrorCount { get; set; }
        public int WarningCount { get; set; }
        public string IssueDetails { get; set; } = string.Empty;
        public string WaveId { get; set; } = string.Empty;
        public int ObjectCount { get; set; }
        public RollbackAuditDetails RollbackDetails { get; set; } = new();
        public BatchAuditDetails BatchDetails { get; set; } = new();
    }

    /// <summary>
    /// Details for rollback audit records
    /// </summary>
    public class RollbackAuditDetails
    {
        public string Action { get; set; } = string.Empty;
        public bool StateRestored { get; set; }
        public List<string> Warnings { get; set; } = new();
        public List<string> Errors { get; set; } = new();
    }

    /// <summary>
    /// Details for batch audit records
    /// </summary>
    public class BatchAuditDetails
    {
        public int TotalObjects { get; set; }
        public int SuccessfulObjects { get; set; }
        public int FailedObjects { get; set; }
    }

    /// <summary>
    /// Interface for audit service operations
    /// </summary>
    public interface IAuditService
    {
        Task InsertAuditRecordAsync(AuditRecord record);
        Task<List<AuditRecord>> GetAuditRecordsAsync(DateTime startDate, DateTime endDate, string? objectType = null, string? status = null, string? waveId = null);
        Task<List<AuditRecord>> GetSortedAuditRecordsAsync(DateTime startDate, DateTime endDate, string sortBy, string sortDirection);
        Task ExportToCsvAsync(List<AuditRecord> records, string filePath);
        Task ExportToPdfAsync(List<AuditRecord> records, string filePath);
    }

    /// <summary>
    /// Event arguments for validation progress
    /// </summary>
    public class AuditValidationProgressEventArgs : EventArgs
    {
        public int Percentage { get; set; }
        public string Message { get; set; } = string.Empty;
        public string CurrentObject { get; set; } = string.Empty;
    }
}