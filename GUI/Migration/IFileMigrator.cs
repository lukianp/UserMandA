using System;
using System.Threading.Tasks;

namespace MandADiscoverySuite.Migration
{
    /// <summary>
    /// Copies files and preserves metadata during migration.
    /// </summary>
    public interface IFileMigrator
    {
        Task<MigrationResult> MigrateFileAsync(FileItemDto file, MigrationSettings settings, TargetContext target, IProgress<MigrationProgress>? progress = null);
    }
}
