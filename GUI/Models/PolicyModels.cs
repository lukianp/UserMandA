using System.Collections.Generic;

namespace MandADiscoverySuite.Models
{
    /// <summary>
    /// Represents a Group Policy Object and its linked organizational units.
    /// </summary>
    public class GroupPolicyData
    {
        public string Name { get; set; }
        public List<string> LinkedOUs { get; set; } = new();

        /// <summary>
        /// Convenience property for displaying linked OUs in a DataGrid.
        /// </summary>
        public string LinkedOUsString => string.Join(", ", LinkedOUs ?? new());
    }

    /// <summary>
    /// Mapping of a user to an applied group policy.
    /// </summary>
    public class GroupPolicyAssignment
    {
        public string PolicyName { get; set; }
        public string LinkedOu { get; set; }
    }
}
