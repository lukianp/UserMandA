using System;
using System.Threading.Tasks;
using MandADiscoverySuite.Models.Migration;
using MandADiscoverySuite.Services.Migration;

namespace MandADiscoverySuite.Migration
{
    /// <summary>
    /// Handles mailbox migration operations and rollback functionality.
    /// </summary>
    public interface IMailMigrator
    {
        Task<MigrationResult> MigrateMailboxAsync(MailboxDto mailbox, MigrationSettings settings, TargetContext target, IProgress<MigrationProgress>? progress = null);
        
        /// <summary>
        /// Rolls back a mailbox migration by canceling move requests and restoring mail flow to source.
        /// </summary>
        Task<RollbackResult> RollbackMailboxAsync(MailboxDto mailbox, TargetContext target, IProgress<MigrationProgress>? progress = null);
    }
}
