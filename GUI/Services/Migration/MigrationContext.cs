using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using Microsoft.Extensions.Logging;
using MandADiscoverySuite.Models;

namespace MandADiscoverySuite.Services.Migration
{
    /// <summary>
    /// Migration context providing environment bridging and execution state
    /// </summary>
    public class MigrationContext
    {
        public string SessionId { get; set; } = Guid.NewGuid().ToString();
        public string ExecutionId { get; set; } = Guid.NewGuid().ToString();
        public string InitiatedBy { get; set; }
        public DateTime StartTime { get; set; } = DateTime.Now;
        
        // Source and Target Environment Configuration
        public SourceEnvironment Source { get; set; }
        public TargetEnvironment Target { get; set; }
        
        // Identity and Security Mappings
        public Dictionary<string, string> SidMapping { get; set; } = new Dictionary<string, string>();
        public Dictionary<string, string> GroupMapping { get; set; } = new Dictionary<string, string>();
        public Dictionary<string, string> UserMapping { get; set; } = new Dictionary<string, string>();
        public Dictionary<string, string> DomainMapping { get; set; } = new Dictionary<string, string>();
        
        // Migration Configuration
        public Dictionary<string, object> Configuration { get; set; } = new Dictionary<string, object>();
        public MigrationSettings Settings { get; set; } = new MigrationSettings();
        public string MigrationMode { get; set; } = "Standard"; // Standard, Test, Rollback
        
        // Progress and Logging Infrastructure
        public IProgress<MigrationProgress> ProgressReporter { get; set; }
        public ILogger Logger { get; set; }
        public CancellationToken CancellationToken { get; set; } = CancellationToken.None;
        
        // Audit and Compliance
        public AuditLogger AuditLogger { get; set; }
        public string ComplianceLevel { get; set; } = "Standard"; // Standard, High, Enterprise
        public bool RequireApproval { get; set; }
        public string ApprovedBy { get; set; }
        public DateTime? ApprovalDate { get; set; }
        
        // State and Recovery
        public Dictionary<string, object> StateData { get; set; } = new Dictionary<string, object>();
        public string CheckpointId { get; set; }
        public bool EnableCheckpoints { get; set; } = true;
        public TimeSpan CheckpointInterval { get; set; } = TimeSpan.FromMinutes(5);
        
        // Performance and Throttling
        public int MaxConcurrentOperations { get; set; } = 5;
        public bool EnableThrottling { get; set; } = true;
        public TimeSpan OperationTimeout { get; set; } = TimeSpan.FromMinutes(30);
        public Dictionary<string, object> PerformanceMetrics { get; set; } = new Dictionary<string, object>();
        
        // Error Handling and Resilience
        public int MaxRetryAttempts { get; set; } = 3;
        public TimeSpan RetryDelay { get; set; } = TimeSpan.FromMinutes(1);
        public bool ContinueOnError { get; set; } = false;
        public List<string> CriticalErrors { get; set; } = new List<string>();
        
        // Dependency Management
        public DependencyGraph Dependencies { get; set; }
        public Dictionary<string, List<string>> ItemDependencies { get; set; } = new Dictionary<string, List<string>>();
        
        // Validation and Pre-checks
        public bool SkipValidation { get; set; } = false;
        public List<string> ValidationOverrides { get; set; } = new List<string>();
        public Dictionary<string, ValidationResult> ValidationResults { get; set; } = new Dictionary<string, ValidationResult>();
        
        // Rollback and Recovery
        public bool EnableRollback { get; set; } = true;
        public string RollbackStrategy { get; set; } = "Automatic"; // Manual, Automatic, None
        public Dictionary<string, object> RollbackData { get; set; } = new Dictionary<string, object>();
        
        // Environment-specific settings
        public Dictionary<string, object> EnvironmentVariables { get; set; } = new Dictionary<string, object>();
        public string WorkingDirectory { get; set; }
        public string TempDirectory { get; set; }
        public string LogDirectory { get; set; }
        
        // Notification and Communication
        public List<string> NotificationRecipients { get; set; } = new List<string>();
        public bool SendProgressUpdates { get; set; } = true;
        public bool SendCompletionNotification { get; set; } = true;
        
        // Custom Properties for Extension
        public Dictionary<string, object> CustomProperties { get; set; } = new Dictionary<string, object>();
        
        /// <summary>
        /// Get configuration value with type safety
        /// </summary>
        public T GetConfiguration<T>(string key, T defaultValue = default)
        {
            if (Configuration.TryGetValue(key, out var value) && value is T)
            {
                return (T)value;
            }
            return defaultValue;
        }
        
        /// <summary>
        /// Set configuration value
        /// </summary>
        public void SetConfiguration<T>(string key, T value)
        {
            Configuration[key] = value;
        }
        
        /// <summary>
        /// Get SID mapping for identity
        /// </summary>
        public string GetMappedSid(string sourceSid)
        {
            return SidMapping.TryGetValue(sourceSid, out var targetSid) ? targetSid : sourceSid;
        }
        
        /// <summary>
        /// Add SID mapping
        /// </summary>
        public void AddSidMapping(string sourceSid, string targetSid)
        {
            SidMapping[sourceSid] = targetSid;
            AuditLogger?.LogMapping("SID", sourceSid, targetSid, SessionId);
        }
        
        /// <summary>
        /// Check if operation should be cancelled
        /// </summary>
        public void ThrowIfCancellationRequested()
        {
            CancellationToken.ThrowIfCancellationRequested();
        }
        
        /// <summary>
        /// Report progress with structured data
        /// </summary>
        public void ReportProgress(string operation, double percentage, string message = null, Dictionary<string, object> data = null)
        {
            var progress = new MigrationProgress
            {
                SessionId = SessionId,
                ExecutionId = ExecutionId,
                Operation = operation,
                ProgressPercentage = percentage,
                Message = message,
                Timestamp = DateTime.Now,
                Data = data ?? new Dictionary<string, object>()
            };
            
            ProgressReporter?.Report(progress);
            Logger?.LogInformation($"Migration Progress: {operation} - {percentage:F1}% - {message}");
        }
        
        /// <summary>
        /// Create checkpoint for recovery
        /// </summary>
        public void CreateCheckpoint(string checkpointName, Dictionary<string, object> checkpointData)
        {
            if (!EnableCheckpoints) return;
            
            CheckpointId = $"{SessionId}_{checkpointName}_{DateTime.Now:yyyyMMddHHmmss}";
            StateData["LastCheckpoint"] = CheckpointId;
            StateData["CheckpointData"] = checkpointData;
            StateData["CheckpointTime"] = DateTime.Now;
            
            Logger?.LogInformation($"Migration checkpoint created: {CheckpointId}");
            AuditLogger?.LogCheckpoint(CheckpointId, checkpointName, SessionId);
        }
        
        /// <summary>
        /// Validate context readiness for migration
        /// </summary>
        public ValidationResult ValidateContext()
        {
            var result = new ValidationResult { IsSuccess = true };
            
            if (Source == null)
            {
                result.Errors.Add("Source environment not configured");
                result.IsSuccess = false;
            }
            
            if (Target == null)
            {
                result.Errors.Add("Target environment not configured");
                result.IsSuccess = false;
            }
            
            if (Logger == null)
            {
                result.Warnings.Add("Logger not configured - limited diagnostics available");
            }
            
            if (AuditLogger == null && ComplianceLevel != "Standard")
            {
                result.Errors.Add("Audit logging required for compliance level: " + ComplianceLevel);
                result.IsSuccess = false;
            }
            
            return result;
        }
    }
    
    /// <summary>
    /// Source environment configuration
    /// </summary>
    public class SourceEnvironment
    {
        public string Name { get; set; }
        public string Type { get; set; } // OnPremises, AzureAD, Hybrid
        public string DomainName { get; set; }
        public string DomainController { get; set; }
        public Dictionary<string, string> ConnectionStrings { get; set; } = new Dictionary<string, string>();
        public Dictionary<string, object> Configuration { get; set; } = new Dictionary<string, object>();
        public CredentialInfo Credentials { get; set; }
        public bool IsConnected { get; set; }
        public DateTime LastHealthCheck { get; set; }
        public List<string> Capabilities { get; set; } = new List<string>();
    }
    
    /// <summary>
    /// Target environment configuration
    /// </summary>
    public class TargetEnvironment
    {
        public string Name { get; set; }
        public string Type { get; set; } // AzureAD, OnPremises, Hybrid
        public string TenantId { get; set; }
        public string DomainName { get; set; }
        public Dictionary<string, string> ConnectionStrings { get; set; } = new Dictionary<string, string>();
        public Dictionary<string, object> Configuration { get; set; } = new Dictionary<string, object>();
        public CredentialInfo Credentials { get; set; }
        public bool IsConnected { get; set; }
        public DateTime LastHealthCheck { get; set; }
        public List<string> Capabilities { get; set; } = new List<string>();
        public LicensingInfo Licensing { get; set; }
    }
    
    /// <summary>
    /// Credential information for secure storage
    /// </summary>
    public class CredentialInfo
    {
        public string Username { get; set; }
        public string Domain { get; set; }
        public string SecretId { get; set; } // Reference to secure credential storage
        public string AuthenticationType { get; set; } // Basic, OAuth, Certificate
        public Dictionary<string, string> Properties { get; set; } = new Dictionary<string, string>();
        public DateTime? ExpirationDate { get; set; }
    }
    
    /// <summary>
    /// Licensing information for target environment
    /// </summary>
    public class LicensingInfo
    {
        public int AvailableLicenses { get; set; }
        public Dictionary<string, int> LicenseTypes { get; set; } = new Dictionary<string, int>();
        public List<string> AssignedLicenses { get; set; } = new List<string>();
        public Dictionary<string, object> LicenseConstraints { get; set; } = new Dictionary<string, object>();
    }
    
    /// <summary>
    /// Migration progress reporting structure
    /// </summary>
    public class MigrationProgress
    {
        public string SessionId { get; set; }
        public string ExecutionId { get; set; }
        public string Operation { get; set; }
        public double ProgressPercentage { get; set; }
        public string Message { get; set; }
        public DateTime Timestamp { get; set; }
        public Dictionary<string, object> Data { get; set; } = new Dictionary<string, object>();
        public string CurrentItem { get; set; }
        public TimeSpan? EstimatedTimeRemaining { get; set; }
    }
    
    /// <summary>
    /// Dependency graph for migration ordering
    /// </summary>
    public class DependencyGraph
    {
        public Dictionary<string, List<string>> Dependencies { get; set; } = new Dictionary<string, List<string>>();
        public Dictionary<string, int> ProcessingOrder { get; set; } = new Dictionary<string, int>();
        public List<string> CircularDependencies { get; set; } = new List<string>();
        
        public List<string> GetExecutionOrder()
        {
            return ProcessingOrder
                .OrderBy(kvp => kvp.Value)
                .Select(kvp => kvp.Key)
                .ToList();
        }
    }
    
    /// <summary>
    /// Audit logger for compliance and tracking
    /// </summary>
    public class AuditLogger
    {
        private readonly ILogger _logger;
        
        public AuditLogger(ILogger logger)
        {
            _logger = logger;
        }
        
        public void LogMigrationStart(string sessionId, string itemType, string itemId, string initiatedBy)
        {
            _logger?.LogInformation($"[AUDIT] Migration started - Session: {sessionId}, Type: {itemType}, Item: {itemId}, By: {initiatedBy}");
        }
        
        public void LogMigrationComplete(string sessionId, string itemType, string itemId, bool success, string details = null)
        {
            var status = success ? "SUCCESS" : "FAILED";
            _logger?.LogInformation($"[AUDIT] Migration completed - Session: {sessionId}, Type: {itemType}, Item: {itemId}, Status: {status}, Details: {details}");
        }
        
        public void LogMapping(string mappingType, string sourceId, string targetId, string sessionId)
        {
            _logger?.LogInformation($"[AUDIT] Mapping created - Session: {sessionId}, Type: {mappingType}, Source: {sourceId}, Target: {targetId}");
        }
        
        public void LogCheckpoint(string checkpointId, string checkpointName, string sessionId)
        {
            _logger?.LogInformation($"[AUDIT] Checkpoint created - Session: {sessionId}, Checkpoint: {checkpointId}, Name: {checkpointName}");
        }
        
        public void LogRollback(string sessionId, string itemId, string reason, bool success)
        {
            var status = success ? "SUCCESS" : "FAILED";
            _logger?.LogWarning($"[AUDIT] Rollback executed - Session: {sessionId}, Item: {itemId}, Reason: {reason}, Status: {status}");
        }
        
        public void LogSecurityEvent(string sessionId, string eventType, string details, string severity = "INFO")
        {
            _logger?.LogInformation($"[AUDIT] Security event - Session: {sessionId}, Type: {eventType}, Severity: {severity}, Details: {details}");
        }
    }
}