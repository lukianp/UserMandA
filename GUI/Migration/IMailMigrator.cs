using System;
using System.Threading.Tasks;

namespace MandADiscoverySuite.Migration
{
    /// <summary>
    /// Handles mailbox migration operations.
    /// </summary>
    public interface IMailMigrator
    {
        Task<MigrationResult> MigrateMailboxAsync(MailboxDto mailbox, MigrationSettings settings, TargetContext target, IProgress<MigrationProgress>? progress = null);
    }
}
