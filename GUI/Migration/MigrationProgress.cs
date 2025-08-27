namespace MandADiscoverySuite.Migration
{
    /// <summary>
    /// Represents progress information for a migration operation.
    /// </summary>
    public class MigrationProgress
    {
        /// <summary>
        /// Percentage completion of the migration step.
        /// </summary>
        public int Percentage { get; set; }

        /// <summary>
        /// Optional message describing the current migration step.
        /// </summary>
        public string? Message { get; set; }
    }
}
