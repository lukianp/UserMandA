using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using MandADiscoverySuite.Migration;

namespace MandADiscoverySuite.Services.Audit
{
    /// <summary>
    /// Interface for migration audit logging and reporting services
    /// </summary>
    public interface IAuditService
    {
        /// <summary>
        /// Records an audit event for migration operations
        /// </summary>
        Task<bool> LogAuditEventAsync(AuditEvent auditEvent);

        /// <summary>
        /// Retrieves audit events with filtering options
        /// </summary>
        Task<IEnumerable<AuditEvent>> GetAuditEventsAsync(AuditFilter filter = null);

        /// <summary>
        /// Retrieves audit statistics for reporting
        /// </summary>
        Task<AuditStatistics> GetAuditStatisticsAsync(AuditFilter filter = null);

        /// <summary>
        /// Exports audit events to CSV format
        /// </summary>
        Task<byte[]> ExportToCsvAsync(AuditFilter filter = null);

        /// <summary>
        /// Exports audit events to PDF format
        /// </summary>
        Task<byte[]> ExportToPdfAsync(AuditFilter filter = null);

        /// <summary>
        /// Archives old audit records based on retention policy
        /// </summary>
        Task<int> ArchiveOldRecordsAsync(TimeSpan retentionPeriod);

        /// <summary>
        /// Validates audit log integrity
        /// </summary>
        Task<bool> ValidateAuditIntegrityAsync();
    }

    /// <summary>
    /// Comprehensive audit event model capturing who/what/when/where of migration actions
    /// </summary>
    public class AuditEvent
    {
        /// <summary>
        /// Unique identifier for the audit event
        /// </summary>
        public Guid AuditId { get; set; } = Guid.NewGuid();

        /// <summary>
        /// Event timestamp (UTC)
        /// </summary>
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;

        // WHO - User/Identity Context
        /// <summary>
        /// User principal name who initiated the action
        /// </summary>
        public string UserPrincipalName { get; set; }

        /// <summary>
        /// Authentication session ID for correlation
        /// </summary>
        public string SessionId { get; set; }

        /// <summary>
        /// Source company profile being used
        /// </summary>
        public string SourceProfile { get; set; }

        /// <summary>
        /// Target company profile being used
        /// </summary>
        public string TargetProfile { get; set; }

        // WHAT - Action/Object Context
        /// <summary>
        /// Type of migration action (Start, Complete, Fail, Retry, Rollback, Validate)
        /// </summary>
        public AuditAction Action { get; set; }

        /// <summary>
        /// Type of object being migrated (User, Mailbox, File, Database, Group, GPO, etc.)
        /// </summary>
        public ObjectType ObjectType { get; set; }

        /// <summary>
        /// Unique identifier of the source object
        /// </summary>
        public string SourceObjectId { get; set; }

        /// <summary>
        /// Display name of the source object
        /// </summary>
        public string SourceObjectName { get; set; }

        /// <summary>
        /// Unique identifier of the target object (if created)
        /// </summary>
        public string TargetObjectId { get; set; }

        /// <summary>
        /// Display name of the target object
        /// </summary>
        public string TargetObjectName { get; set; }

        // WHEN - Timing Context
        /// <summary>
        /// Migration wave identifier
        /// </summary>
        public string WaveId { get; set; }

        /// <summary>
        /// Migration wave name
        /// </summary>
        public string WaveName { get; set; }

        /// <summary>
        /// Migration batch identifier
        /// </summary>
        public string BatchId { get; set; }

        /// <summary>
        /// Duration of the operation (for completed operations)
        /// </summary>
        public TimeSpan? Duration { get; set; }

        // WHERE - Environment/Location Context
        /// <summary>
        /// Source environment (On-Premises, Azure, Hybrid)
        /// </summary>
        public string SourceEnvironment { get; set; }

        /// <summary>
        /// Target environment (On-Premises, Azure, Hybrid)
        /// </summary>
        public string TargetEnvironment { get; set; }

        /// <summary>
        /// Machine/Computer where the action was initiated
        /// </summary>
        public string MachineName { get; set; } = Environment.MachineName;

        /// <summary>
        /// IP address of the machine (if available)
        /// </summary>
        public string MachineIpAddress { get; set; }

        // STATUS - Outcome Context
        /// <summary>
        /// Overall status of the operation
        /// </summary>
        public AuditStatus Status { get; set; }

        /// <summary>
        /// Detailed status message
        /// </summary>
        public string StatusMessage { get; set; }

        /// <summary>
        /// Error code (if operation failed)
        /// </summary>
        public string ErrorCode { get; set; }

        /// <summary>
        /// Detailed error message (if operation failed)
        /// </summary>
        public string ErrorMessage { get; set; }

        /// <summary>
        /// Warning messages (if any)
        /// </summary>
        public List<string> Warnings { get; set; } = new();

        /// <summary>
        /// Number of retry attempts (if applicable)
        /// </summary>
        public int RetryAttempts { get; set; }

        // METRICS - Performance Context
        /// <summary>
        /// Number of items processed (for batch operations)
        /// </summary>
        public int? ItemsProcessed { get; set; }

        /// <summary>
        /// Size of data processed (in bytes)
        /// </summary>
        public long? DataSizeBytes { get; set; }

        /// <summary>
        /// Transfer rate (items/second or bytes/second)
        /// </summary>
        public double? TransferRate { get; set; }

        /// <summary>
        /// Additional metadata as key-value pairs
        /// </summary>
        public Dictionary<string, string> Metadata { get; set; } = new();

        // CORRELATION - Relationship Context
        /// <summary>
        /// Parent audit event ID (for related operations)
        /// </summary>
        public Guid? ParentAuditId { get; set; }

        /// <summary>
        /// Correlation ID for grouping related operations
        /// </summary>
        public string CorrelationId { get; set; }

        /// <summary>
        /// Migration result details (serialized)
        /// </summary>
        public string MigrationResultData { get; set; }
    }

    /// <summary>
    /// Enumeration of audit actions
    /// </summary>
    public enum AuditAction
    {
        Started,
        InProgress,
        Completed,
        Failed,
        Retrying,
        Rolled_Back,
        Validated,
        Skipped,
        Cancelled
    }

    /// <summary>
    /// Enumeration of migration object types
    /// </summary>
    public enum ObjectType
    {
        User,
        Mailbox,
        File,
        Folder,
        Database,
        Group,
        GroupPolicy,
        ACL,
        SharePointSite,
        OneDriveLibrary,
        TeamsChannel,
        Contact,
        Calendar,
        Distribution_List,
        Security_Group,
        Application,
        License,
        Permission,
        Other
    }

    /// <summary>
    /// Enumeration of audit status values
    /// </summary>
    public enum AuditStatus
    {
        Success,
        Warning,
        Error,
        InProgress,
        Cancelled,
        Skipped
    }

    /// <summary>
    /// Filter criteria for audit queries
    /// </summary>
    public class AuditFilter
    {
        /// <summary>
        /// Start date for filtering (inclusive)
        /// </summary>
        public DateTime? StartDate { get; set; }

        /// <summary>
        /// End date for filtering (inclusive)
        /// </summary>
        public DateTime? EndDate { get; set; }

        /// <summary>
        /// Filter by user principal name
        /// </summary>
        public string UserPrincipalName { get; set; }

        /// <summary>
        /// Filter by object type
        /// </summary>
        public ObjectType? ObjectType { get; set; }

        /// <summary>
        /// Filter by audit action
        /// </summary>
        public AuditAction? Action { get; set; }

        /// <summary>
        /// Filter by audit status
        /// </summary>
        public AuditStatus? Status { get; set; }

        /// <summary>
        /// Filter by wave ID
        /// </summary>
        public string WaveId { get; set; }

        /// <summary>
        /// Filter by source profile
        /// </summary>
        public string SourceProfile { get; set; }

        /// <summary>
        /// Filter by target profile
        /// </summary>
        public string TargetProfile { get; set; }

        /// <summary>
        /// Maximum number of records to return
        /// </summary>
        public int? MaxRecords { get; set; } = 1000;

        /// <summary>
        /// Skip number of records (for paging)
        /// </summary>
        public int? Skip { get; set; }

        /// <summary>
        /// Search text in object names and messages
        /// </summary>
        public string SearchText { get; set; }
    }

    /// <summary>
    /// Audit statistics for reporting and dashboard
    /// </summary>
    public class AuditStatistics
    {
        /// <summary>
        /// Total number of audit events
        /// </summary>
        public int TotalEvents { get; set; }

        /// <summary>
        /// Total number of successful operations
        /// </summary>
        public int SuccessfulOperations { get; set; }

        /// <summary>
        /// Total number of failed operations
        /// </summary>
        public int FailedOperations { get; set; }

        /// <summary>
        /// Total number of operations with warnings
        /// </summary>
        public int WarningOperations { get; set; }

        /// <summary>
        /// Success rate percentage
        /// </summary>
        public double SuccessRate => TotalEvents > 0 ? (SuccessfulOperations * 100.0) / TotalEvents : 0;

        /// <summary>
        /// Average operation duration
        /// </summary>
        public TimeSpan? AverageOperationDuration { get; set; }

        /// <summary>
        /// Total data processed (bytes)
        /// </summary>
        public long TotalDataProcessed { get; set; }

        /// <summary>
        /// Operations by object type
        /// </summary>
        public Dictionary<ObjectType, int> OperationsByObjectType { get; set; } = new();

        /// <summary>
        /// Operations by day (for trending)
        /// </summary>
        public Dictionary<DateTime, int> OperationsByDay { get; set; } = new();

        /// <summary>
        /// Top error messages and their counts
        /// </summary>
        public Dictionary<string, int> TopErrors { get; set; } = new();

        /// <summary>
        /// Operations by wave
        /// </summary>
        public Dictionary<string, int> OperationsByWave { get; set; } = new();
    }
}