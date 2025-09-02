using System;
using System.Collections.Generic;

namespace MandADiscoverySuite.Models.Migration
{
    /// <summary>
    /// Represents a security group for migration operations
    /// </summary>
    public class SecurityGroupItem
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();
        public string Name { get; set; } = string.Empty;
        public string DisplayName { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string DistinguishedName { get; set; } = string.Empty;
        public string SamAccountName { get; set; } = string.Empty;
        public string Sid { get; set; } = string.Empty;
        public SecurityGroupScope Scope { get; set; } = SecurityGroupScope.DomainLocal;
        public SecurityGroupType GroupType { get; set; } = SecurityGroupType.Security;
        
        // Members
        public List<string> Members { get; set; } = new List<string>();
        public List<string> MemberOf { get; set; } = new List<string>();
        public List<SecurityGroupItem> NestedGroups { get; set; } = new List<SecurityGroupItem>();
        
        // Metadata
        public DateTime Created { get; set; }
        public DateTime Modified { get; set; }
        public string CreatedBy { get; set; } = string.Empty;
        public string ModifiedBy { get; set; } = string.Empty;
        
        // Migration specific properties
        public string SourceDomain { get; set; } = string.Empty;
        public string TargetDomain { get; set; } = string.Empty;
        public string MigrationStatus { get; set; } = "Pending";
        public Dictionary<string, object> CustomAttributes { get; set; } = new Dictionary<string, object>();
        
        // Validation
        public bool IsValid => !string.IsNullOrWhiteSpace(Name) && !string.IsNullOrWhiteSpace(Sid);
        
        public override string ToString()
        {
            return $"{DisplayName ?? Name} ({SamAccountName})";
        }
        
        public override bool Equals(object obj)
        {
            return obj is SecurityGroupItem other && Sid == other.Sid;
        }
        
        public override int GetHashCode()
        {
            return Sid?.GetHashCode() ?? 0;
        }
    }
    
    /// <summary>
    /// Security group scope enumeration
    /// </summary>
    public enum SecurityGroupScope
    {
        DomainLocal,
        Global,
        Universal
    }
    
    /// <summary>
    /// Security group type enumeration  
    /// </summary>
    public enum SecurityGroupType
    {
        Security,
        Distribution
    }
    
    /// <summary>
    /// Group conflict information for resolution
    /// </summary>
    public class GroupConflict
    {
        public string ConflictId { get; set; } = Guid.NewGuid().ToString();
        public SecurityGroupItem SourceGroup { get; set; }
        public SecurityGroupItem TargetGroup { get; set; }
        public GroupConflictType ConflictType { get; set; }
        public string Description { get; set; } = string.Empty;
        public ConflictResolutionStrategy RecommendedResolution { get; set; }
        public DateTime DetectedAt { get; set; } = DateTime.Now;
    }
    
    /// <summary>
    /// Types of group conflicts
    /// </summary>
    public enum GroupConflictType
    {
        NameCollision,
        SidCollision,
        MembershipConflict,
        PermissionConflict,
        DependencyConflict
    }
    
    /// <summary>
    /// Conflict resolution strategies
    /// </summary>
    public enum ConflictResolutionStrategy
    {
        Skip,
        Rename,
        Merge,
        Replace,
        Manual
    }
}