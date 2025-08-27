using System;
using System.Threading.Tasks;
using MandADiscoverySuite.Migration;

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

        public async Task<MigrationResult> MigrateDatabaseAsync(DatabaseDto database, MigrationSettings settings, TargetContext target, IProgress<MigrationProgress>? progress = null)
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
    }
}
