using System;
using System.Collections.Generic;
using MandADiscoverySuite.Services.Migration;

namespace MandADiscoverySuite.Models.Migration
{
    /// <summary>
    /// DTO models for migration operations - complementary to Services.Migration results
    /// </summary>

    // Additional DTOs that are needed but not duplicates
    public class GroupDto
    {
        public string Id { get; set; }
        public string Name { get; set; }
        public string DisplayName { get; set; }
        public string Description { get; set; }
        public string GroupType { get; set; }
        public string DistinguishedName { get; set; }
        public List<string> Members { get; set; } = new List<string>();
        public List<string> MemberOf { get; set; } = new List<string>();
        public DateTime Created { get; set; }
        public DateTime Modified { get; set; }
        public Dictionary<string, object> Properties { get; set; } = new Dictionary<string, object>();
    }

    // GpoBackupResult moved to Services.Migration.MigrationResultTypes
}