using System;
using System.Threading.Tasks;
using MandADiscoverySuite.Models.Migration;

namespace MandADiscoverySuite.Migration
{
    /// <summary>
    /// Performs SQL database migrations and supports rollback operations.
    /// </summary>
    public interface ISqlMigrator
    {
        Task<MigrationResult> MigrateDatabaseAsync(DatabaseDto database, MigrationSettings settings, TargetContext target, IProgress<MigrationProgress>? progress = null);
        
        /// <summary>
        /// Rolls back a database migration by dropping the target database and cleaning up resources.
        /// </summary>
        Task<RollbackResult> RollbackDatabaseAsync(DatabaseDto database, TargetContext target, IProgress<MigrationProgress>? progress = null);
    }
}
