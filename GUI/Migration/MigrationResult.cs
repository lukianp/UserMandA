using System.Collections.Generic;

namespace MandADiscoverySuite.Migration
{
    /// <summary>
    /// Represents the result of a migration operation.
    /// </summary>
    public class MigrationResult
    {
        /// <summary>
        /// Indicates whether the migration completed successfully.
        /// </summary>
        public bool Success { get; set; }

        /// <summary>
        /// Start time of the migration operation.
        /// </summary>
        public System.DateTime StartTime { get; set; } = System.DateTime.Now;

        /// <summary>
        /// Main error message if migration failed.
        /// </summary>
        public string ErrorMessage { get; set; } = string.Empty;

        /// <summary>
        /// Target user ID for identity migrations.
        /// </summary>
        public string TargetUserId { get; set; } = string.Empty;

        /// <summary>
        /// Target user principal name for identity migrations.
        /// </summary>
        public string TargetUserPrincipalName { get; set; } = string.Empty;

        /// <summary>
        /// Optional warnings produced during migration.
        /// </summary>
        public List<string> Warnings { get; } = new();

        /// <summary>
        /// Optional errors produced during migration.
        /// </summary>
        public List<string> Errors { get; } = new();

        /// <summary>
        /// Creates a successful migration result.
        /// </summary>
        public static MigrationResult Succeeded() => new() { Success = true };

        /// <summary>
        /// Creates a failed migration result with the provided error message.
        /// </summary>
        public static MigrationResult Failed(string error)
        {
            var result = new MigrationResult { Success = false };
            result.Errors.Add(error);
            return result;
        }
    }
}
