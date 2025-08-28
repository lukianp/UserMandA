using System;
using System.Threading.Tasks;

namespace MandADiscoverySuite.Migration
{
    /// <summary>
    /// Copies files and preserves metadata during migration, supports rollback functionality.
    /// </summary>
    public interface IFileMigrator
    {
        Task<MigrationResult> MigrateFileAsync(FileItemDto file, MigrationSettings settings, TargetContext target, IProgress<MigrationProgress>? progress = null);
        
        /// <summary>
        /// Rolls back a file migration by deleting the target copy and cleaning up resources.
        /// </summary>
        Task<RollbackResult> RollbackFileAsync(FileItemDto file, TargetContext target, IProgress<MigrationProgress>? progress = null);
    }
}
