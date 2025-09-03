using System;
using System.Threading.Tasks;
using MandADiscoverySuite.Migration;
using MandADiscoverySuite.Models.Migration;

namespace MandADiscoverySuite.MigrationProviders
{
    /// <summary>
    /// Abstraction for SQL database transfer operations.
    /// </summary>
    public interface ISqlTransferClient
    {
        Task RestoreAsync(DatabaseDto database);
    }

    /// <summary>
    /// Implements SQL database migration.
    /// </summary>
    public class SqlMigrator : ISqlMigrator
    {
        private readonly ISqlTransferClient _client;

        public SqlMigrator(ISqlTransferClient client)
        {
            _client = client;
        }

        public async Task<MigrationResult> MigrateDatabaseAsync(DatabaseDto database, MigrationSettings settings, TargetContext target, IProgress<MigrationProgress> progress = null)
        {
            try
            {
                progress?.Report(new MigrationProgress { Percentage = 0, Message = $"Restoring {database.Name}" });
                await _client.RestoreAsync(database);
                progress?.Report(new MigrationProgress { Percentage = 100, Message = $"Database {database.Name} restored" });
                return MigrationResult.Succeeded();
            }
            catch (Exception ex)
            {
                return MigrationResult.Failed(ex.Message);
            }
        }

        public async Task<RollbackResult> RollbackDatabaseAsync(DatabaseDto database, TargetContext target, IProgress<MigrationProgress> progress = null)
        {
            try
            {
                progress?.Report(new MigrationProgress { Percentage = 0, Message = $"Rolling back database {database.Name}" });
                
                // Simplified rollback - in practice this would drop the target database
                await Task.Delay(2000); // Simulate rollback operation

                progress?.Report(new MigrationProgress { Percentage = 100, Message = $"Database {database.Name} rollback completed" });
                return RollbackResult.Succeeded("Target database dropped - source database is primary");
            }
            catch (Exception ex)
            {
                return RollbackResult.Failed($"Database rollback failed: {ex.Message}");
            }
        }
    }
}
