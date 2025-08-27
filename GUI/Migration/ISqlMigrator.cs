using System;
using System.Threading.Tasks;

namespace MandADiscoverySuite.Migration
{
    /// <summary>
    /// Performs SQL database migrations.
    /// </summary>
    public interface ISqlMigrator
    {
        Task<MigrationResult> MigrateDatabaseAsync(DatabaseDto database, MigrationSettings settings, TargetContext target, IProgress<MigrationProgress>? progress = null);
    }
}
