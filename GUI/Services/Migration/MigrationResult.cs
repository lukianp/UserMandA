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
        public DateTime StartTime { get; set; } = DateTime.Now;
        public DateTime EndTime { get; set; } = DateTime.Now;
        public string ErrorMessage { get; set; } = string.Empty;
        public string TargetId { get; set; } = string.Empty;
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
        public DateTime StartTime { get; set; } = DateTime.Now;
        public DateTime EndTime { get; set; } = DateTime.Now;
        public string Operation { get; set; } = string.Empty;
        public bool IsSuccess { get; set; }
        public bool Success => IsSuccess; // Implementing IMigrationResult
        public string Message { get; set; } = string.Empty;
        public string ErrorMessage { get; set; } = string.Empty;
        public List<string> Errors { get; set; } = new List<string>();
        public Dictionary<string, object> Properties { get; set; } = new Dictionary<string, object>();
    }

    /// <summary>
    /// Concrete implementation for generic migration results
    /// </summary>
    public class GenericMigrationResult : MigrationResultBase
    {
        public Dictionary<string, object> Metadata { get; set; } = new Dictionary<string, object>();

        public GenericMigrationResult()
        {
        }

        public GenericMigrationResult(string operation)
        {
            Operation = operation;
        }
    }

}