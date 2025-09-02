using System;
using System.Collections.Generic;

namespace MandADiscoverySuite.Migration
{
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
        public Dictionary<string, object> Properties { get; set; } = new Dictionary<string, object>();
        public Dictionary<string, string> Settings { get; set; } = new Dictionary<string, string>();
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
        public string Environment { get; set; } = string.Empty; // Azure, OnPremises, Hybrid
        public string ConnectionString { get; set; } = string.Empty;
        public Dictionary<string, string> Credentials { get; set; } = new Dictionary<string, string>();
        public Dictionary<string, object> Configuration { get; set; } = new Dictionary<string, object>();
        public bool IsConnected { get; set; }
        public DateTime LastHealthCheck { get; set; } = DateTime.Now;
        public List<string> Capabilities { get; set; } = new List<string>();
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