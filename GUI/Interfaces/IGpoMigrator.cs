using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using MandADiscoverySuite.Services.Migration; // Added for GpoCompatibilityResult
using MandADiscoverySuite.Models.Migration;
using MandADiscoverySuite.Migration;

namespace MandADiscoverySuite.Interfaces
{
    /// <summary>
    /// Interface for Group Policy Object migration operations
    /// </summary>
    public interface IGpoMigrator
    {
        /// <summary>
        /// Migrate a Group Policy Object from source to target domain
        /// </summary>
        Task<MigrationResult<GpoMigrationResult>> MigrateAsync(
            GroupPolicyItem gpo,
            MigrationContext context,
            IProgress<Migration.MigrationProgress> progress = null);

        /// <summary>
        /// Validate that a GPO can be migrated
        /// </summary>
        Task<ValidationResult> ValidateAsync(
            GroupPolicyItem gpo,
            MigrationContext context);

        /// <summary>
        /// Rollback a GPO migration
        /// </summary>
        Task<Services.Migration.RollbackResult> RollbackAsync(
            GroupPolicyItem gpo,
            MigrationContext context,
            IProgress<MandADiscoverySuite.Migration.MigrationProgress> progress = null);

        /// <summary>
        /// Check if the migrator supports the given GPO type
        /// </summary>
        Task<bool> SupportsAsync(GroupPolicyItem gpo);

        /// <summary>
        /// Estimate migration duration for the given GPO
        /// </summary>
        Task<TimeSpan> EstimateDurationAsync(GroupPolicyItem gpo);

        /// <summary>
        /// Replicate GPO settings from source to target
        /// </summary>
        Task<GpoReplicationResult> ReplicateGpoSettingsAsync(
            GroupPolicyItem sourceGpo,
            string targetDomain,
            MigrationContext context,
            IProgress<MandADiscoverySuite.Migration.MigrationProgress> progress = null);

        /// <summary>
        /// Migrate WMI filters associated with GPOs
        /// </summary>
        Task<WmiFilterMigrationResult> MigrateWmiFiltersAsync(
            List<WmiFilterItem> wmiFilters,
            MigrationContext context,
            IProgress<MandADiscoverySuite.Migration.MigrationProgress> progress = null);

        /// <summary>
        /// Validate GPO compatibility with target domain
        /// </summary>
        Task<Services.Migration.GpoCompatibilityResult> ValidateGpoCompatibilityAsync(
            GroupPolicyItem gpo,
            string targetDomain);

        /// <summary>
        /// Migrate security filtering for GPO
        /// </summary>
        Task<GpoSecurityFilterResult> MigrateSecurityFilteringAsync(
            GroupPolicyItem gpo,
            MigrationContext context,
            IProgress<MandADiscoverySuite.Migration.MigrationProgress> progress = null);

        /// <summary>
        /// Create backup of GPO before migration
        /// </summary>
        Task<GpoBackupResult> CreateGpoBackupAsync(
            GroupPolicyItem gpo,
            string backupPath,
            MigrationContext context);
    }

    // Result types moved to Services.Migration.MigrationResultTypes
}