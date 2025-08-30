using System;
using System.Threading.Tasks;
using System.Collections.Generic;
using System.Linq;
using MandADiscoverySuite.Services.Migration;

namespace MandADiscoverySuite.Migration
{
    /// <summary>
    /// Base interface for migration results to provide common properties.
    /// </summary>
    public interface IMigrationResult
    {
        bool Success { get; }
    }

    /// <summary>
    /// Core interface for delta migration operations - capturing and migrating only changes since the last run.
    /// Supports zero-downtime M&A scenarios with cutover finalization.
    /// </summary>
    public interface IDeltaMigrator<TItem, TResult> where TResult : class, IMigrationResult
    {
        /// <summary>
        /// Performs delta migration for items changed since the specified timestamp.
        /// Only migrates new or modified items to minimize migration time and impact.
        /// </summary>
        /// <param name="lastRunTimestamp">Timestamp of last successful migration run</param>
        /// <param name="settings">Migration settings including cutover options</param>
        /// <param name="target">Target environment context</param>
        /// <param name="progress">Progress reporting callback</param>
        /// <returns>Delta migration result with change statistics</returns>
        Task<DeltaMigrationResult<TResult>> MigrateDeltaAsync(
            DateTime lastRunTimestamp, 
            DeltaMigrationSettings settings, 
            TargetContext target, 
            IProgress<MigrationProgress>? progress = null);

        /// <summary>
        /// Detects changes in the source environment since the specified timestamp.
        /// Used for pre-migration analysis and change impact assessment.
        /// </summary>
        /// <param name="lastRunTimestamp">Timestamp to check changes since</param>
        /// <param name="settings">Detection settings and filters</param>
        /// <returns>Collection of changed items with metadata</returns>
        Task<IEnumerable<ChangeDetectionResult<TItem>>> DetectChangesAsync(
            DateTime lastRunTimestamp,
            DeltaMigrationSettings settings);

        /// <summary>
        /// Performs final cutover operations to switch from source to target environment.
        /// This includes disabling source objects, updating DNS/service endpoints, and final verification.
        /// </summary>
        /// <param name="migrationResults">Results from previous migration runs to finalize</param>
        /// <param name="cutoverSettings">Cutover-specific configuration</param>
        /// <param name="target">Target environment context</param>
        /// <param name="progress">Progress reporting callback</param>
        /// <returns>Cutover result with detailed status</returns>
        Task<CutoverResult> PerformCutoverAsync(
            IEnumerable<TResult> migrationResults,
            CutoverSettings cutoverSettings,
            TargetContext target,
            IProgress<MigrationProgress>? progress = null);

        /// <summary>
        /// Validates readiness for cutover by checking prerequisites and potential issues.
        /// Should be called before PerformCutoverAsync to prevent failed cutovers.
        /// </summary>
        /// <param name="migrationResults">Migration results to validate for cutover</param>
        /// <param name="target">Target environment context</param>
        /// <returns>Validation result indicating cutover readiness</returns>
        Task<CutoverValidationResult> ValidateCutoverReadinessAsync(
            IEnumerable<TResult> migrationResults,
            TargetContext target);
    }

    /// <summary>
    /// Settings for delta migration operations with change detection and cutover configuration.
    /// </summary>
    public class DeltaMigrationSettings : MigrationSettings
    {
        /// <summary>
        /// Maximum number of changes to process in a single delta run.
        /// Prevents overwhelming the system with large change sets.
        /// </summary>
        public int MaxChangesToProcess { get; set; } = 10000;

        /// <summary>
        /// Types of changes to include in delta migration.
        /// </summary>
        public ChangeType IncludedChangeTypes { get; set; } = ChangeType.All;

        /// <summary>
        /// Whether to perform automatic cutover after successful delta migration.
        /// </summary>
        public bool AutoCutover { get; set; } = false;

        /// <summary>
        /// Buffer time to wait after detecting changes before processing.
        /// Helps ensure changes are complete and not part of ongoing operations.
        /// </summary>
        public TimeSpan ChangeDetectionBuffer { get; set; } = TimeSpan.FromMinutes(5);

        /// <summary>
        /// Whether to use incremental sync for mailbox operations (Exchange Move Requests).
        /// </summary>
        public bool UseIncrementalSync { get; set; } = true;

        /// <summary>
        /// File checksum validation level for detecting file changes.
        /// </summary>
        public ChecksumValidationLevel ChecksumLevel { get; set; } = ChecksumValidationLevel.SHA256;

        /// <summary>
        /// SQL change tracking method (LogShipping, DifferentialBackup, ChangeTracking).
        /// </summary>
        public SqlChangeTrackingMethod SqlChangeMethod { get; set; } = SqlChangeTrackingMethod.ChangeTracking;
    }

    /// <summary>
    /// Settings for cutover operations including safety checks and rollback options.
    /// </summary>
    public class CutoverSettings
    {
        /// <summary>
        /// Whether to disable source objects during cutover (recommended for production).
        /// </summary>
        public bool DisableSourceObjects { get; set; } = true;

        /// <summary>
        /// DNS and service endpoint updates to perform during cutover.
        /// </summary>
        public IList<ServiceEndpointUpdate> ServiceUpdates { get; set; } = new List<ServiceEndpointUpdate>();

        /// <summary>
        /// Maximum time to wait for cutover operations to complete.
        /// </summary>
        public TimeSpan CutoverTimeout { get; set; } = TimeSpan.FromHours(2);

        /// <summary>
        /// Whether to perform final validation checks after cutover.
        /// </summary>
        public bool ValidateAfterCutover { get; set; } = true;

        /// <summary>
        /// Rollback strategy if cutover fails.
        /// </summary>
        public CutoverRollbackStrategy RollbackStrategy { get; set; } = CutoverRollbackStrategy.AutomaticRollback;

        /// <summary>
        /// Notification settings for cutover events.
        /// </summary>
        public CutoverNotificationSettings NotificationSettings { get; set; } = new();
    }

    /// <summary>
    /// Result of delta migration operation with change statistics.
    /// </summary>
    public class DeltaMigrationResult<TResult> where TResult : class, IMigrationResult
    {
        public IList<TResult> MigrationResults { get; set; } = new List<TResult>();
        public int ChangesDetected { get; set; }
        public int ChangesProcessed { get; set; }
        public int ChangesSkipped { get; set; }
        public DateTime DeltaRunTimestamp { get; set; }
        public TimeSpan Duration { get; set; }
        public bool Success => MigrationResults.All(r => r.Success);
        public string? ErrorMessage { get; set; }
        public DeltaRunType RunType { get; set; }
    }

    /// <summary>
    /// Result of change detection analysis.
    /// </summary>
    public class ChangeDetectionResult<TItem>
    {
        public TItem Item { get; set; } = default!;
        public ChangeType ChangeType { get; set; }
        public DateTime ChangeTimestamp { get; set; }
        public string? ChangeDetails { get; set; }
        public ChangeSource ChangeSource { get; set; }
        public Dictionary<string, object> Metadata { get; set; } = new();
    }

    /// <summary>
    /// Result of cutover operation with detailed status and rollback information.
    /// </summary>
    public class CutoverResult
    {
        public bool Success { get; set; }
        public DateTime CutoverTimestamp { get; set; }
        public TimeSpan Duration { get; set; }
        public IList<CutoverStep> CompletedSteps { get; set; } = new List<CutoverStep>();
        public IList<CutoverStep> FailedSteps { get; set; } = new List<CutoverStep>();
        public string? ErrorMessage { get; set; }
        public CutoverRollbackInfo? RollbackInfo { get; set; }
        public bool RollbackPerformed { get; set; }
    }

    /// <summary>
    /// Validation result for cutover readiness assessment.
    /// </summary>
    public class CutoverValidationResult
    {
        public bool IsReady { get; set; }
        public IList<CutoverValidationIssue> Issues { get; set; } = new List<CutoverValidationIssue>();
        public IList<CutoverPrerequisite> Prerequisites { get; set; } = new List<CutoverPrerequisite>();
        public DateTime ValidationTimestamp { get; set; }
        public CutoverRiskLevel RiskLevel { get; set; }
    }

    // Supporting Types and Enums

    [Flags]
    public enum ChangeType
    {
        Create = 1,
        Update = 2,
        Delete = 4,
        Move = 8,
        Rename = 16,
        PermissionChange = 32,
        All = Create | Update | Delete | Move | Rename | PermissionChange
    }

    public enum ChangeSource
    {
        FileSystem,
        ExchangeOnline,
        ActiveDirectory,
        SharePoint,
        SqlServer,
        AzureAD,
        OneDrive
    }

    public enum ChecksumValidationLevel
    {
        None,
        ModificationTime,
        Size,
        MD5,
        SHA256,
        SHA512
    }

    public enum SqlChangeTrackingMethod
    {
        LogShipping,
        DifferentialBackup,
        ChangeTracking,
        AlwaysOnAvailabilityGroups,
        TransactionLogReplication
    }

    public enum DeltaRunType
    {
        Incremental,
        Final,
        Emergency,
        Verification
    }

    public enum CutoverRollbackStrategy
    {
        NoRollback,
        AutomaticRollback,
        ManualRollback,
        HybridRollback
    }

    public enum CutoverRiskLevel
    {
        Low,
        Medium,
        High,
        Critical
    }

    /// <summary>
    /// Represents a service endpoint update during cutover (DNS, load balancer, etc.).
    /// </summary>
    public class ServiceEndpointUpdate
    {
        public string ServiceName { get; set; } = string.Empty;
        public string CurrentEndpoint { get; set; } = string.Empty;
        public string TargetEndpoint { get; set; } = string.Empty;
        public ServiceUpdateType UpdateType { get; set; }
        public int Priority { get; set; } // Execution order
        public TimeSpan Timeout { get; set; } = TimeSpan.FromMinutes(10);
    }

    public enum ServiceUpdateType
    {
        DNSRecord,
        LoadBalancerPool,
        ApplicationConfiguration,
        NetworkRouting,
        CertificateBinding
    }

    /// <summary>
    /// Individual step in cutover process.
    /// </summary>
    public class CutoverStep
    {
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public CutoverStepType Type { get; set; }
        public bool Success { get; set; }
        public string? ErrorMessage { get; set; }
        public DateTime StartTime { get; set; }
        public DateTime? EndTime { get; set; }
        public TimeSpan Duration => EndTime?.Subtract(StartTime) ?? TimeSpan.Zero;
    }

    public enum CutoverStepType
    {
        DisableSource,
        EnableTarget,
        UpdateDNS,
        UpdateServiceEndpoints,
        ValidateConnectivity,
        NotifyUsers,
        FinalVerification
    }

    /// <summary>
    /// Information for rolling back a cutover operation.
    /// </summary>
    public class CutoverRollbackInfo
    {
        public IList<ServiceEndpointUpdate> RollbackUpdates { get; set; } = new List<ServiceEndpointUpdate>();
        public IList<string> ObjectsToReEnable { get; set; } = new List<string>();
        public string RollbackReason { get; set; } = string.Empty;
        public DateTime RollbackInitiated { get; set; }
    }

    /// <summary>
    /// Issue identified during cutover validation.
    /// </summary>
    public class CutoverValidationIssue
    {
        public string Description { get; set; } = string.Empty;
        public CutoverValidationSeverity Severity { get; set; }
        public string? Resolution { get; set; }
        public bool IsBlocker { get; set; }
    }

    public enum CutoverValidationSeverity
    {
        Information,
        Warning,
        Error,
        Critical
    }

    /// <summary>
    /// Prerequisite that must be met before cutover.
    /// </summary>
    public class CutoverPrerequisite
    {
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public bool IsMet { get; set; }
        public string? ValidationMessage { get; set; }
    }

    /// <summary>
    /// Notification configuration for cutover events.
    /// </summary>
    public class CutoverNotificationSettings
    {
        public bool NotifyOnStart { get; set; } = true;
        public bool NotifyOnCompletion { get; set; } = true;
        public bool NotifyOnFailure { get; set; } = true;
        public IList<string> NotificationRecipients { get; set; } = new List<string>();
        public NotificationMethod Method { get; set; } = NotificationMethod.Email;
    }

    public enum NotificationMethod
    {
        Email,
        Teams,
        Slack,
        Webhook
    }

    // Service-specific delta migrator interfaces
    public interface IIdentityDeltaMigrator : IDeltaMigrator<UserDto, MigrationResultBase> { }
    public interface IMailDeltaMigrator : IDeltaMigrator<MailboxDto, MigrationResultBase> { }  
    public interface IFileDeltaMigrator : IDeltaMigrator<FileItemDto, MigrationResultBase> { }
    public interface ISqlDeltaMigrator : IDeltaMigrator<DatabaseDto, MigrationResultBase> { }
    public interface ISharePointDeltaMigrator : IDeltaMigrator<object, MigrationResultBase> { }
}