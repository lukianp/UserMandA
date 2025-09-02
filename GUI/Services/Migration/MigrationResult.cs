using System;
using System.Collections.Generic;

namespace MandADiscoverySuite.Services.Migration
{
    /// <summary>
    /// Generic migration result wrapper
    /// </summary>
    public class MigrationResult<T> where T : MigrationResultBase
    {
        public bool IsSuccess { get; set; }
        public T Result { get; set; }
        public List<string> Errors { get; set; } = new List<string>();
        public List<string> Warnings { get; set; } = new List<string>();
        public DateTime CompletedAt { get; set; } = DateTime.Now;
        public TimeSpan Duration { get; set; }
        public string SessionId { get; set; } = string.Empty;
        public Dictionary<string, object> Metadata { get; set; } = new Dictionary<string, object>();
    }

    /// <summary>
    /// Base class for all migration results
    /// </summary>
    public abstract class MigrationResultBase : MandADiscoverySuite.Migration.IMigrationResult
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();
        public DateTime CreatedAt { get; set; } = DateTime.Now;
        public string Operation { get; set; } = string.Empty;
        public bool IsSuccess { get; set; }
        public bool Success => IsSuccess; // Implementing IMigrationResult
        public string Message { get; set; } = string.Empty;
        public Dictionary<string, object> Properties { get; set; } = new Dictionary<string, object>();
    }

    /// <summary>
    /// Migration context for Services.Migration namespace
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
        public Dictionary<string, object> Properties { get; set; } = new Dictionary<string, object>();
        public Dictionary<string, string> Settings { get; set; } = new Dictionary<string, string>();
    }

    /// <summary>
    /// Validation result for Services.Migration namespace
    /// </summary>
    public class ValidationResult
    {
        public bool IsValid { get; set; }
        public string Message { get; set; } = string.Empty;
        public List<string> Issues { get; set; } = new List<string>();
        public DateTime ValidatedAt { get; set; } = DateTime.Now;
        public Dictionary<string, object> Details { get; set; } = new Dictionary<string, object>();
    }

    /// <summary>
    /// Rollback result for Services.Migration namespace
    /// </summary>
    public class RollbackResult
    {
        public bool IsSuccess { get; set; }
        public string Message { get; set; } = string.Empty;
        public List<string> Errors { get; set; } = new List<string>();
        public DateTime RolledBackAt { get; set; } = DateTime.Now;
        public Dictionary<string, object> Details { get; set; } = new Dictionary<string, object>();
    }

    /// <summary>
    /// Migration types enumeration
    /// </summary>
    public enum MigrationType
    {
        User,
        Group,
        GroupPolicy,
        Acl,
        Mailbox,
        File,
        Database,
        SharePoint
    }
}