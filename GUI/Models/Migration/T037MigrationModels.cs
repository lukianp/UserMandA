using System;
using System.Collections.Generic;

namespace MandADiscoverySuite.Models.Migration
{
    /// <summary>
    /// Group item for migration operations (T-037)
    /// </summary>
    public class GroupItem
    {   
        public string Id { get; set; } = Guid.NewGuid().ToString();
        public string Name { get; set; } = string.Empty;
        public string DistinguishedName { get; set; } = string.Empty;
        public string Sid { get; set; } = string.Empty;
        public string GroupScope { get; set; } = string.Empty; // Universal, Global, DomainLocal
        public string GroupType { get; set; } = string.Empty; // Security, Distribution
        public string Description { get; set; } = string.Empty;
        public List<string> MemberSids { get; set; } = new List<string>();
        public List<string> MemberOfSids { get; set; } = new List<string>();
        public string ManagedBy { get; set; } = string.Empty;
        public Dictionary<string, object> CustomAttributes { get; set; } = new Dictionary<string, object>();
    }

    /// <summary>
    /// Group Policy Object item for migration operations (T-037)
    /// </summary>
    public class GroupPolicyItem
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();
        public string GpoGuid { get; set; } = string.Empty;
        public string GpoName { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string DisplayName { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Domain { get; set; } = string.Empty;
        public string Owner { get; set; } = string.Empty;
        public DateTime CreatedDate { get; set; } = DateTime.Now;
        public DateTime ModifiedDate { get; set; } = DateTime.Now;
        public string CreatedBy { get; set; } = string.Empty;
        public string ModifiedBy { get; set; } = string.Empty;
        public List<string> LinkedOUs { get; set; } = new List<string>();
        public List<string> SecurityFiltering { get; set; } = new List<string>();
        public List<string> WmiFilters { get; set; } = new List<string>();
        public Dictionary<string, object> Settings { get; set; } = new Dictionary<string, object>();
        public DateTime CreationTime { get; set; } = DateTime.Now;
        public DateTime ModificationTime { get; set; } = DateTime.Now;
        public int Version { get; set; } = 1;
        public bool Enabled { get; set; } = true;
        public bool IsEnabled { get; set; } = true;
        public string Status { get; set; } = "Active";
        public Dictionary<string, object> CustomProperties { get; set; } = new Dictionary<string, object>();
    }

    /// <summary>
    /// ACL item for migration operations (T-037)
    /// </summary>
    public class AclItem
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();
        public string Path { get; set; } = string.Empty;
        public string ObjectType { get; set; } = string.Empty; // File, Directory, Registry, Share
        public List<AclEntry> AccessControlEntries { get; set; } = new List<AclEntry>();
        public string Owner { get; set; } = string.Empty;
        public string PrimaryGroup { get; set; } = string.Empty;
        public bool InheritanceEnabled { get; set; } = true;
        public Dictionary<string, object> ExtendedAttributes { get; set; } = new Dictionary<string, object>();
    }

    /// <summary>
    /// ACL migration item for T-037
    /// </summary>
    public class AclMigrationItem
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();
        public string Path { get; set; } = string.Empty;
        public string ResourceType { get; set; } = string.Empty; // File, Directory, Share
        public List<AclEntry> AclEntries { get; set; } = new List<AclEntry>();
        public bool InheritanceEnabled { get; set; } = true;
        public string Owner { get; set; } = string.Empty;
        public string Group { get; set; } = string.Empty;
        public DateTime LastModified { get; set; } = DateTime.Now;
        public Dictionary<string, object> Metadata { get; set; } = new Dictionary<string, object>();
    }

    /// <summary>
    /// Access Control Entry for ACL migration (T-037)
    /// </summary>
    public class AclEntry
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();
        public string Sid { get; set; } = string.Empty;
        public string IdentityReference { get; set; } = string.Empty;
        public string AccessMask { get; set; } = string.Empty;
        public string AccessControlType { get; set; } = string.Empty; // Allow, Deny
        public string InheritanceFlags { get; set; } = string.Empty;
        public string PropagationFlags { get; set; } = string.Empty;
        public bool IsInherited { get; set; }
    }

    /// <summary>
    /// Share ACL Entry for share permission migration (T-037)
    /// </summary>
    public class ShareAclEntry
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();
        public string Sid { get; set; } = string.Empty;
        public string IdentityReference { get; set; } = string.Empty;
        public string SharePermission { get; set; } = string.Empty; // FullControl, Change, Read
        public string AccessControlType { get; set; } = string.Empty; // Allow, Deny
    }

    /// <summary>
    /// Registry ACL Entry for registry permission migration (T-037)
    /// </summary>
    public class RegistryAclEntry
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();
        public string Sid { get; set; } = string.Empty;
        public string IdentityReference { get; set; } = string.Empty;
        public string RegistryRights { get; set; } = string.Empty;
        public string AccessControlType { get; set; } = string.Empty; // Allow, Deny
        public string InheritanceFlags { get; set; } = string.Empty;
        public string PropagationFlags { get; set; } = string.Empty;
    }

    /// <summary>
    /// Security group item for T-037 migration
    /// </summary>
    public class SecurityGroupItem
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();
        public string GroupSid { get; set; } = string.Empty;
        public string GroupName { get; set; } = string.Empty;
        public string DisplayName { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Domain { get; set; } = string.Empty;
        public string DistinguishedName { get; set; } = string.Empty;
        public string GroupType { get; set; } = "Security";
        public string GroupScope { get; set; } = "Global";
        public List<string> Members { get; set; } = new List<string>();
        public List<string> MemberOf { get; set; } = new List<string>();
        public List<string> ManagedBy { get; set; } = new List<string>();
        public DateTime CreatedDate { get; set; } = DateTime.Now;
        public DateTime ModifiedDate { get; set; } = DateTime.Now;
        public string CreatedBy { get; set; } = string.Empty;
        public string ModifiedBy { get; set; } = string.Empty;
        public Dictionary<string, object> Attributes { get; set; } = new Dictionary<string, object>();
        public bool IsBuiltIn { get; set; }
        public Dictionary<string, object> CustomProperties { get; set; } = new Dictionary<string, object>();
    }

    /// <summary>
    /// WMI filter for GPO targeting (T-037)
    /// </summary>
    public class WmiFilterItem
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public List<string> Queries { get; set; } = new List<string>();
        public DateTime CreatedDate { get; set; } = DateTime.Now;
        public string CreatedBy { get; set; } = string.Empty;
        public bool IsActive { get; set; } = true;
    }
}