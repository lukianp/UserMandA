using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace MandADiscoverySuite.Migration
{
    /// <summary>
    /// Orchestrates migration waves by delegating to specific migrators and integrates with post-migration validation.
    /// </summary>
    public class MigrationService
    {
        private readonly IIdentityMigrator _identityMigrator;
        private readonly IMailMigrator _mailMigrator;
        private readonly IFileMigrator _fileMigrator;
        private readonly ISqlMigrator _sqlMigrator;
        private readonly PostMigrationValidationService? _validationService;

        public MigrationService(
            IIdentityMigrator identityMigrator, 
            IMailMigrator mailMigrator, 
            IFileMigrator fileMigrator, 
            ISqlMigrator sqlMigrator,
            PostMigrationValidationService? validationService = null)
        {
            _identityMigrator = identityMigrator;
            _mailMigrator = mailMigrator;
            _fileMigrator = fileMigrator;
            _sqlMigrator = sqlMigrator;
            _validationService = validationService;
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

        /// <summary>
        /// Migrates all items in a wave and automatically validates the results.
        /// </summary>
        public async Task<MigrationWithValidationResult> MigrateAndValidateWaveAsync(MigrationWave wave, MigrationSettings settings, TargetContext target, IProgress<MigrationProgress>? progress = null)
        {
            // Perform migration
            var migrationResults = await MigrateWaveAsync(wave, settings, target, progress);

            // Perform validation if service is available
            IList<ValidationResult>? validationResults = null;
            if (_validationService != null)
            {
                validationResults = await _validationService.ValidateWaveAsync(wave, target, progress);
            }

            return new MigrationWithValidationResult
            {
                MigrationResults = migrationResults,
                ValidationResults = validationResults ?? new List<ValidationResult>(),
                Wave = wave,
                Target = target,
                CompletedAt = DateTime.Now
            };
        }

        /// <summary>
        /// Rolls back migration results using the appropriate migrators.
        /// </summary>
        public async Task<IList<RollbackResult>> RollbackMigrationResultsAsync(IList<MigrationResult> migrationResults, TargetContext target, IProgress<MigrationProgress>? progress = null)
        {
            var rollbackResults = new List<RollbackResult>();
            var totalItems = migrationResults.Count;
            var currentItem = 0;

            foreach (var result in migrationResults)
            {
                currentItem++;
                progress?.Report(new MigrationProgress
                {
                    CurrentStep = $"Rolling back {result.GetType().Name}",
                    PercentageComplete = (currentItem * 100) / totalItems
                });

                try
                {
                    RollbackResult rollbackResult = result switch
                    {
                        _ when result.GetType().Name.Contains("User") => 
                            await _identityMigrator.RollbackUserAsync(new UserDto(), target, progress),
                        _ when result.GetType().Name.Contains("Mailbox") => 
                            await _mailMigrator.RollbackMailboxAsync(new MailboxDto(), target, progress),
                        _ when result.GetType().Name.Contains("File") => 
                            await _fileMigrator.RollbackFileAsync(new FileItemDto(), target, progress),
                        _ when result.GetType().Name.Contains("Database") => 
                            await _sqlMigrator.RollbackDatabaseAsync(new DatabaseDto(), target, progress),
                        _ => RollbackResult.Failed($"Unknown migration result type: {result.GetType().Name}")
                    };

                    rollbackResults.Add(rollbackResult);
                }
                catch (Exception ex)
                {
                    rollbackResults.Add(RollbackResult.Failed($"Rollback failed: {ex.Message}"));
                }
            }

            return rollbackResults;
        }

        /// <summary>
        /// Gets the validation service if available.
        /// </summary>
        public PostMigrationValidationService? ValidationService => _validationService;
    }

    /// <summary>
    /// Combined result of migration and validation operations.
    /// </summary>
    public class MigrationWithValidationResult
    {
        public IList<MigrationResult> MigrationResults { get; set; } = new List<MigrationResult>();
        public IList<ValidationResult> ValidationResults { get; set; } = new List<ValidationResult>();
        public MigrationWave Wave { get; set; } = new();
        public TargetContext Target { get; set; } = new();
        public DateTime CompletedAt { get; set; }

        public bool HasMigrationErrors => MigrationResults.Any(r => !r.Success);
        public bool HasValidationErrors => ValidationResults.Any(r => r.Severity == ValidationSeverity.Error || r.Severity == ValidationSeverity.Critical);
        public bool IsFullySuccessful => !HasMigrationErrors && !HasValidationErrors;
    }
}
