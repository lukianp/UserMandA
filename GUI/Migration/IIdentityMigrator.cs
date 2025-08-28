using System;
using System.Threading.Tasks;

namespace MandADiscoverySuite.Migration
{
    /// <summary>
    /// Migrates user objects to the target environment and supports rollback operations.
    /// </summary>
    public interface IIdentityMigrator
    {
        Task<MigrationResult> MigrateUserAsync(UserDto user, MigrationSettings settings, TargetContext target, IProgress<MigrationProgress>? progress = null);
        
        /// <summary>
        /// Rolls back a user migration by disabling/deleting the target account and restoring source state.
        /// </summary>
        Task<RollbackResult> RollbackUserAsync(UserDto user, TargetContext target, IProgress<MigrationProgress>? progress = null);
    }
}
