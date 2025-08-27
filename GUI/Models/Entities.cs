using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using MandADiscoverySuite.Repository;

namespace MandADiscoverySuite.Models
{
    /// <summary>
    /// Base entity class with audit fields
    /// </summary>
    public abstract class BaseEntity<TKey> : IAuditableEntity<TKey> where TKey : IEquatable<TKey>
    {
        public TKey Id { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }
        public string CreatedBy { get; set; }
        public string UpdatedBy { get; set; }
        public bool IsDeleted { get; set; }
        public DateTime? DeletedAt { get; set; }
        public string DeletedBy { get; set; }
    }

    /// <summary>
    /// Discovery profile entity
    /// </summary>
    public class DiscoveryProfile : BaseEntity<string>
    {
        [Required]
        [StringLength(100)]
        public string Name { get; set; }

        [StringLength(500)]
        public string Description { get; set; }

        [Required]
        public string ConnectionString { get; set; }

        public string TenantId { get; set; }
        public string ClientId { get; set; }
        public string ClientSecret { get; set; }
        public bool IsActive { get; set; } = true;
        public DateTime? LastUsed { get; set; }

        // Navigation properties
        public virtual ICollection<DiscoveryResultEntity> DiscoveryResults { get; set; } = new List<DiscoveryResultEntity>();
    }

    /// <summary>
    /// Discovery result entity
    /// </summary>
    public class DiscoveryResultEntity : BaseEntity<string>
    {
        [Required]
        public string ProfileId { get; set; }

        [Required]
        [StringLength(50)]
        public string DiscoveryType { get; set; }

        [Required]
        public string ResultData { get; set; } // JSON data

        public DateTime StartTime { get; set; }
        public DateTime? EndTime { get; set; }
        public string Status { get; set; } // Running, Completed, Failed
        public string ErrorMessage { get; set; }
        public int ItemCount { get; set; }
        public long DataSize { get; set; }

        // Navigation properties
        public virtual DiscoveryProfile Profile { get; set; }
        public virtual ICollection<DiscoveryItem> Items { get; set; } = new List<DiscoveryItem>();
    }

    /// <summary>
    /// Individual discovery item entity
    /// </summary>
    public class DiscoveryItem : BaseEntity<string>
    {
        [Required]
        public string ResultId { get; set; }

        [Required]
        [StringLength(100)]
        public string ItemType { get; set; }

        [Required]
        [StringLength(200)]
        public string Name { get; set; }

        public string DisplayName { get; set; }
        public string Properties { get; set; } // JSON properties
        public string Metadata { get; set; } // JSON metadata
        public bool IsActive { get; set; } = true;
        public double? HealthScore { get; set; }
        public string Tags { get; set; } // Comma-separated tags

        // Navigation properties
        public virtual DiscoveryResult Result { get; set; }
        public virtual ICollection<ItemRelationship> ParentRelationships { get; set; } = new List<ItemRelationship>();
        public virtual ICollection<ItemRelationship> ChildRelationships { get; set; } = new List<ItemRelationship>();
    }

    /// <summary>
    /// Relationship between discovery items
    /// </summary>
    public class ItemRelationship : BaseEntity<string>
    {
        [Required]
        public string ParentItemId { get; set; }

        [Required]
        public string ChildItemId { get; set; }

        [Required]
        [StringLength(50)]
        public string RelationshipType { get; set; }

        public string Properties { get; set; } // JSON properties
        public int Weight { get; set; } = 1;

        // Navigation properties
        public virtual DiscoveryItem ParentItem { get; set; }
        public virtual DiscoveryItem ChildItem { get; set; }
    }

    /// <summary>
    /// User settings entity
    /// </summary>
    public class UserSettings : BaseEntity<string>
    {
        [Required]
        [StringLength(100)]
        public string Username { get; set; }

        public string Theme { get; set; } = "Light";
        public string Language { get; set; } = "en-US";
        public string TimeZone { get; set; }
        public string Preferences { get; set; } // JSON preferences
        public string DashboardLayout { get; set; } // JSON layout
        public DateTime LastLoginAt { get; set; }
        public string LastVersion { get; set; }
    }

    /// <summary>
    /// Application log entry entity
    /// </summary>
    public class LogEntry : BaseEntity<string>
    {
        [Required]
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;

        [Required]
        [StringLength(20)]
        public string Level { get; set; } // Debug, Info, Warning, Error, Critical

        [StringLength(100)]
        public string Category { get; set; }

        [Required]
        public string Message { get; set; }

        public string Exception { get; set; }
        public string Properties { get; set; } // JSON properties
        public string Username { get; set; }
        public string SessionId { get; set; }
        public string Source { get; set; }
    }

    /// <summary>
    /// Migration wave entity for planning - Using alias to avoid duplicate class
    /// </summary>
    public class MigrationWaveEntity : BaseEntity<string>
    {
        [Required]
        [StringLength(100)]
        public string Name { get; set; }

        [StringLength(500)]
        public string Description { get; set; }

        public DateTime PlannedStartDate { get; set; }
        public DateTime PlannedEndDate { get; set; }
        public DateTime? ActualStartDate { get; set; }
        public DateTime? ActualEndDate { get; set; }
        
        [StringLength(20)]
        public string Status { get; set; } = "Planned"; // Planned, InProgress, Completed, OnHold

        public int Priority { get; set; } = 1;
        public decimal EstimatedCost { get; set; }
        public decimal? ActualCost { get; set; }
        public string Dependencies { get; set; } // JSON array of dependent wave IDs
        public string AssignedTo { get; set; }

        // Navigation properties
        public virtual ICollection<MigrationTask> Tasks { get; set; } = new List<MigrationTask>();
    }

    /// <summary>
    /// Migration task entity
    /// </summary>
    public class MigrationTask : BaseEntity<string>
    {
        [Required]
        public string WaveId { get; set; }

        [Required]
        [StringLength(200)]
        public string Name { get; set; }

        [StringLength(1000)]
        public string Description { get; set; }

        public string ItemId { get; set; } // Reference to DiscoveryItem
        public DateTime PlannedStartDate { get; set; }
        public DateTime PlannedEndDate { get; set; }
        public DateTime? ActualStartDate { get; set; }
        public DateTime? ActualEndDate { get; set; }
        
        [StringLength(20)]
        public string Status { get; set; } = "NotStarted"; // NotStarted, InProgress, Completed, Failed, Skipped

        public int EstimatedHours { get; set; }
        public int? ActualHours { get; set; }
        public string AssignedTo { get; set; }
        public string Notes { get; set; }
        public double? CompletionPercentage { get; set; }

        // Navigation properties
        public virtual MigrationWaveEntity Wave { get; set; }
        public virtual DiscoveryItem Item { get; set; }
    }

    /// <summary>
    /// Health check entity
    /// </summary>
    public class HealthCheck : BaseEntity<string>
    {
        [Required]
        public string ItemId { get; set; }

        [Required]
        public DateTime CheckTime { get; set; } = DateTime.UtcNow;

        [StringLength(50)]
        public string CheckType { get; set; }

        public double Score { get; set; }
        public string Details { get; set; } // JSON details
        public string Issues { get; set; } // JSON array of issues
        public string Recommendations { get; set; } // JSON array of recommendations
        public bool IsHealthy { get; set; }

        // Navigation properties
        public virtual DiscoveryItem Item { get; set; }
    }

    /// <summary>
    /// Export job entity
    /// </summary>
    public class ExportJob : BaseEntity<string>
    {
        [Required]
        [StringLength(100)]
        public string Name { get; set; }

        [StringLength(20)]
        public string ExportType { get; set; } // CSV, Excel, JSON, PDF

        public string FilterCriteria { get; set; } // JSON filter
        public string Columns { get; set; } // JSON array of columns
        public DateTime RequestedAt { get; set; } = DateTime.UtcNow;
        public DateTime? StartedAt { get; set; }
        public DateTime? CompletedAt { get; set; }
        
        [StringLength(20)]
        public string Status { get; set; } = "Pending"; // Pending, Running, Completed, Failed

        public string FilePath { get; set; }
        public long? FileSize { get; set; }
        public int? RecordCount { get; set; }
        public string ErrorMessage { get; set; }
        public string RequestedBy { get; set; }
    }

    /// <summary>
    /// Notification entity
    /// </summary>
    public class Notification : BaseEntity<string>
    {
        [Required]
        [StringLength(200)]
        public string Title { get; set; }

        [Required]
        public string Message { get; set; }

        [StringLength(20)]
        public string Type { get; set; } = "Info"; // Info, Success, Warning, Error

        public new DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public bool IsRead { get; set; }
        public DateTime? ReadAt { get; set; }
        public bool IsDismissed { get; set; }
        public DateTime? DismissedAt { get; set; }
        public string UserId { get; set; }
        public string ActionUrl { get; set; }
        public string ActionText { get; set; }
        public DateTime? ExpiresAt { get; set; }
    }

    /// <summary>
    /// Performance metric entity
    /// </summary>
    public class PerformanceMetric : BaseEntity<string>
    {
        [Required]
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;

        [Required]
        [StringLength(50)]
        public string MetricName { get; set; }

        public double Value { get; set; }
        public string Unit { get; set; }
        public string Category { get; set; }
        public string Source { get; set; }
        public string Properties { get; set; } // JSON properties
        public string Tags { get; set; } // Comma-separated tags
    }

    /// <summary>
    /// Dashboard configuration entity
    /// </summary>
    public class DashboardConfig : BaseEntity<string>
    {
        [Required]
        [StringLength(100)]
        public string Name { get; set; }

        [StringLength(500)]
        public string Description { get; set; }

        public string Layout { get; set; } // JSON layout configuration
        public string Widgets { get; set; } // JSON widget configuration
        public string Filters { get; set; } // JSON default filters
        public bool IsDefault { get; set; }
        public bool IsPublic { get; set; }
        public string OwnerId { get; set; }
        public string SharedWith { get; set; } // JSON array of user IDs
        public int ViewCount { get; set; }
        public DateTime? LastViewedAt { get; set; }
    }

    /// <summary>
    /// Saved search entity
    /// </summary>
    public class SavedSearch : BaseEntity<string>
    {
        [Required]
        [StringLength(100)]
        public string Name { get; set; }

        [StringLength(500)]
        public string Description { get; set; }

        [Required]
        public string SearchCriteria { get; set; } // JSON search criteria

        public string Columns { get; set; } // JSON column configuration
        public string Sorting { get; set; } // JSON sorting configuration
        public bool IsGlobal { get; set; }
        public string OwnerId { get; set; }
        public int UseCount { get; set; }
        public DateTime? LastUsedAt { get; set; }
    }

    /// <summary>
    /// ACL entry for file system permissions
    /// </summary>
    public class AclEntry : BaseEntity<string>
    {
        public string IdentityReference { get; set; }
        public string AccessMask { get; set; }
        public string AccessControlType { get; set; } // Allow, Deny
        public string InheritanceFlags { get; set; }
        public string PropagationFlags { get; set; }
        public bool IsInherited { get; set; }
        public string SourcePath { get; set; }
        public string TargetPath { get; set; }
        public MappingStatus MappingStatus { get; set; } = MappingStatus.Pending;
        public string MappedIdentity { get; set; }
        public Dictionary<string, object> Properties { get; set; } = new Dictionary<string, object>();
        public string IdentitySid { get; set; } // Added for dependency engine
    }
}