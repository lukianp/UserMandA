using System;
using System.Threading.Tasks;

namespace MandADiscoverySuite.Migration
{
    /// <summary>
    /// Migrates user objects to the target environment.
    /// </summary>
    public interface IIdentityMigrator
    {
        Task<MigrationResult> MigrateUserAsync(UserDto user, MigrationSettings settings, TargetContext target, IProgress<MigrationProgress>? progress = null);
    }
}
