using System;
using System.Collections.Generic;
using System.Threading;

namespace MandADiscoverySuite.Migration
{
    /// <summary>
    /// Interface for audit logging during migration operations
    /// </summary>
    public interface IAuditLogger
    {
        void LogOperation(string operationType, string details, bool success = true);
        void LogError(string operationType, string error, Exception exception = null);
        void LogProgress(string operationType, int completed, int total);
        void LogMigrationComplete(object migrationResult);
        void LogMigrationComplete(string sessionId, string migrationType, string itemName, bool success, string errorMessage = null);
        void LogMigrationStart(string sessionId, string migrationType, string itemName, string initiatedBy);
        void LogRollback(string sessionId, string migrationType, string itemName, bool success, string errorMessage = null);
    }
    
    /// <summary>
    /// Basic audit logger implementation
    /// </summary>
    public class BasicAuditLogger : IAuditLogger
    {
        public void LogOperation(string operationType, string details, bool success = true)
        {
            // Basic implementation - can be enhanced later
            System.Diagnostics.Debug.WriteLine($"[{DateTime.Now}] {operationType}: {details} (Success: {success})");
        }

        public void LogError(string operationType, string error, Exception exception = null)
        {
            System.Diagnostics.Debug.WriteLine($"[{DateTime.Now}] ERROR {operationType}: {error} {exception?.Message}");
        }

        public void LogProgress(string operationType, int completed, int total)
        {
            System.Diagnostics.Debug.WriteLine($"[{DateTime.Now}] PROGRESS {operationType}: {completed}/{total}");
        }

        public void LogMigrationComplete(object migrationResult)
        {
            System.Diagnostics.Debug.WriteLine($"[{DateTime.Now}] MIGRATION COMPLETE: {migrationResult}");
        }

        public void LogMigrationComplete(string sessionId, string migrationType, string itemName, bool success, string errorMessage = null)
        {
            var status = success ? "SUCCESS" : "FAILED";
            var message = $"[{DateTime.Now}] MIGRATION COMPLETE: {migrationType} '{itemName}' - {status}";
            if (!string.IsNullOrEmpty(errorMessage))
                message += $" - Error: {errorMessage}";
            System.Diagnostics.Debug.WriteLine(message);
        }

        public void LogMigrationStart(string sessionId, string migrationType, string itemName, string initiatedBy)
        {
            System.Diagnostics.Debug.WriteLine($"[{DateTime.Now}] MIGRATION START: {migrationType} '{itemName}' initiated by {initiatedBy}");
        }

        public void LogRollback(string sessionId, string migrationType, string itemName, bool success, string errorMessage = null)
        {
            var status = success ? "SUCCESS" : "FAILED";
            var message = $"[{DateTime.Now}] ROLLBACK: {migrationType} '{itemName}' - {status}";
            if (!string.IsNullOrEmpty(errorMessage))
                message += $" - Error: {errorMessage}";
            System.Diagnostics.Debug.WriteLine(message);
        }
    }
    /// <summary>
    /// Configuration for licensing operations
    /// </summary>
    public class LicensingConfiguration
    {
        public List<string> AvailableLicenses { get; set; } = new List<string>();
        public Dictionary<string, string> LicenseMappings { get; set; } = new Dictionary<string, string>();
        public bool AutoAssign { get; set; } = true;
        public string DefaultLicenseBundle { get; set; } = string.Empty;
    }
    /// <summary>
    /// Context information for migration operations
    /// </summary>
    public class MigrationContext
    {
        public string SessionId { get; set; } = Guid.NewGuid().ToString();
        public string UserPrincipalName { get; set; } = string.Empty;
        public string SourceDomain { get; set; } = string.Empty;
        public string TargetDomain { get; set; } = string.Empty;
        public string SourceProfile { get; set; } = string.Empty;
        public string TargetProfile { get; set; } = string.Empty;
        public string CorrelationId { get; set; } = Guid.NewGuid().ToString();
        public DateTime StartedAt { get; set; } = DateTime.Now;
        public string WorkingDirectory { get; set; } = string.Empty;
        public TargetContext Target { get; set; } = new TargetContext();
        public SourceContext Source { get; set; } = new SourceContext();
        public Dictionary<string, object> Properties { get; set; } = new Dictionary<string, object>();
        public Dictionary<string, string> Settings { get; set; } = new Dictionary<string, string>();
        public string ComplianceLevel { get; set; } = "Standard"; // Standard, Enhanced, Strict
        public TimeSpan OperationTimeout { get; set; } = TimeSpan.FromMinutes(30);
        public int MaxConcurrentOperations { get; set; } = 5;
        public Action<MigrationProgress> ReportProgress { get; set; }
        
        // Additional properties required by build errors
        public Dictionary<string, string> SidMapping { get; set; } = new Dictionary<string, string>();
        public IAuditLogger AuditLogger { get; set; }
        public string InitiatedBy { get; set; } = string.Empty;
        public bool ContinueOnError { get; set; } = true;
        public Dictionary<string, string> GroupMapping { get; set; } = new Dictionary<string, string>();
        public Dictionary<string, string> UserMapping { get; set; } = new Dictionary<string, string>();
        public Dictionary<string, string> DomainMapping { get; set; } = new Dictionary<string, string>();
        public CancellationToken CancellationToken { get; set; } = CancellationToken.None;

        /// <summary>
        /// Default constructor initializes basic services
        /// </summary>
        public MigrationContext()
        {
            AuditLogger = new BasicAuditLogger();
        }

        /// <summary>
        /// Gets a configuration value from the context
        /// </summary>
        public T GetConfiguration<T>(string key, T defaultValue = default)
        {
            if (Properties.TryGetValue(key, out var value))
            {
                if (value is T typedValue)
                    return typedValue;
                
                try
                {
                    return (T)Convert.ChangeType(value, typeof(T));
                }
                catch
                {
                    return defaultValue;
                }
            }
            return defaultValue;
        }

        /// <summary>
        /// Gets a configuration value from the context (non-generic version)
        /// </summary>
        public object GetConfiguration(string key)
        {
            return Properties.TryGetValue(key, out var value) ? value : null;
        }

        /// <summary>
        /// Adds a SID mapping for migration
        /// </summary>
        public void AddSidMapping(string sourceSid, string targetSid)
        {
            if (!Properties.ContainsKey("SidMappings"))
            {
                Properties["SidMappings"] = new Dictionary<string, string>();
            }
            
            if (Properties["SidMappings"] is Dictionary<string, string> mappings)
            {
                mappings[sourceSid] = targetSid;
            }
        }

        /// <summary>
        /// Helper method to report progress with multiple parameters
        /// </summary>
        public void ReportProgressUpdate(string currentItem, int percentage, string message)
        {
            ReportProgress?.Invoke(new MigrationProgress
            {
                CurrentItem = currentItem,
                Percentage = percentage,
                Message = message,
                LastUpdate = DateTime.Now
            });
        }
    }

    /// <summary>
    /// Source environment context for migrations
    /// </summary>
    public class SourceContext
    {
        public string DomainName { get; set; } = string.Empty;
        public string Environment { get; set; } = string.Empty; // OnPremises, Azure, Hybrid
        public string ConnectionString { get; set; } = string.Empty;
        public Dictionary<string, string> Credentials { get; set; } = new Dictionary<string, string>();
        public Dictionary<string, object> Configuration { get; set; } = new Dictionary<string, object>();
        public bool IsConnected { get; set; }
        public DateTime LastHealthCheck { get; set; } = DateTime.Now;
        public List<string> Capabilities { get; set; } = new List<string>();
        public string CompanyProfilePath { get; set; } = string.Empty;
    }

    /// <summary>
    /// Target environment context for migrations
    /// </summary>
    public class TargetContext
    {
        public string TenantId { get; set; } = string.Empty;
        public string TenantName { get; set; } = string.Empty;
        public string DomainName { get; set; } = string.Empty; // Added for build error fix
        public string Environment { get; set; } = string.Empty; // Azure, OnPremises, Hybrid
        public string Type { get; set; } = "Production"; // Production, Test, Development
        public string ConnectionString { get; set; } = string.Empty;
        public Dictionary<string, string> Credentials { get; set; } = new Dictionary<string, string>();
        public Dictionary<string, object> Configuration { get; set; } = new Dictionary<string, object>();
        public bool IsConnected { get; set; }
        public DateTime LastHealthCheck { get; set; } = DateTime.Now;
        public List<string> Capabilities { get; set; } = new List<string>();
        public LicensingConfiguration Licensing { get; set; } = new LicensingConfiguration();
    }

    /// <summary>
    /// Progress information for migration operations
    /// </summary>
    public class MigrationProgress
    {
        public string Message { get; set; } = string.Empty;
        public string CurrentItem { get; set; } = string.Empty;
        public int Percentage { get; set; }
        public int CompletedItems { get; set; }
        public int TotalItems { get; set; }
        public TimeSpan Elapsed { get; set; }
        public TimeSpan EstimatedTimeRemaining { get; set; }
        public DateTime LastUpdate { get; set; } = DateTime.Now;
        public Dictionary<string, object> Details { get; set; } = new Dictionary<string, object>();
    }
}