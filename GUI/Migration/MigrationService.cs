using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace MandADiscoverySuite.Migration
{
    /// <summary>
    /// Orchestrates migration waves by delegating to specific migrators.
    /// </summary>
    public class MigrationService
    {
        private readonly IIdentityMigrator _identityMigrator;
        private readonly IMailMigrator _mailMigrator;
        private readonly IFileMigrator _fileMigrator;
        private readonly ISqlMigrator _sqlMigrator;

        public MigrationService(IIdentityMigrator identityMigrator, IMailMigrator mailMigrator, IFileMigrator fileMigrator, ISqlMigrator sqlMigrator)
        {
            _identityMigrator = identityMigrator;
            _mailMigrator = mailMigrator;
            _fileMigrator = fileMigrator;
            _sqlMigrator = sqlMigrator;
        }

        /// <summary>
        /// Migrates all items in the provided wave using the injected migrators.
        /// </summary>
        public async Task<IList<MigrationResult>> MigrateWaveAsync(MigrationWave wave, MigrationSettings settings, TargetContext target, IProgress<MigrationProgress>? progress = null)
        {
            var results = new List<MigrationResult>();

            var userTasks = wave.Users.Select(u => _identityMigrator.MigrateUserAsync(u, settings, target, progress)).ToList();
            results.AddRange(await Task.WhenAll(userTasks));

            var mailboxTasks = wave.Mailboxes.Select(m => _mailMigrator.MigrateMailboxAsync(m, settings, target, progress)).ToList();
            results.AddRange(await Task.WhenAll(mailboxTasks));

            var fileTasks = wave.Files.Select(f => _fileMigrator.MigrateFileAsync(f, settings, target, progress)).ToList();
            results.AddRange(await Task.WhenAll(fileTasks));

            var dbTasks = wave.Databases.Select(d => _sqlMigrator.MigrateDatabaseAsync(d, settings, target, progress)).ToList();
            results.AddRange(await Task.WhenAll(dbTasks));

            return results;
        }
    }
}
