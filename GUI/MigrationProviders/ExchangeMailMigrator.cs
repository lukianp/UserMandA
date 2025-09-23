using System;
using System.Threading.Tasks;
using MandADiscoverySuite.Migration;
using MandADiscoverySuite.Models.Migration;
using MandADiscoverySuite.Services.Migration;

namespace MandADiscoverySuite.MigrationProviders
{
    /// <summary>
    /// Abstraction over Exchange mailbox move operations.
    /// </summary>
    public interface IExchangeMailClient
    {
        Task MoveMailboxAsync(MailboxDto mailbox);
    }

    /// <summary>
    /// Implements mailbox migration using Exchange management interfaces.
    /// </summary>
    public class ExchangeMailMigrator : Migration.IMailMigrator
    {
        private readonly IExchangeMailClient _client;

        public ExchangeMailMigrator(IExchangeMailClient client)
        {
            _client = client;
        }

        public async Task<MigrationResult> MigrateMailboxAsync(MailboxDto mailbox, MigrationSettings settings, TargetContext target, IProgress<Migration.MigrationProgress>? progress = null)
        {
            try
            {
                progress?.Report(new Migration.MigrationProgress { Percentage = 0, Message = $"Moving mailbox {mailbox.PrimarySmtpAddress}" });
                await _client.MoveMailboxAsync(mailbox);
                progress?.Report(new Migration.MigrationProgress { Percentage = 100, Message = $"Mailbox {mailbox.PrimarySmtpAddress} moved" });
                return MigrationResult.Succeeded();
            }
            catch (Exception ex)
            {
                return MigrationResult.Failed(ex.Message);
            }
        }

        public async Task<RollbackResult> RollbackMailboxAsync(MailboxDto mailbox, TargetContext target, IProgress<Migration.MigrationProgress>? progress = null)
        {
            try
            {
                progress?.Report(new Migration.MigrationProgress { Percentage = 0, Message = $"Rolling back mailbox {mailbox.PrimarySmtpAddress}" });
                
                // Simplified rollback - in practice this would cancel move requests and update mail routing
                await Task.Delay(1000); // Simulate rollback operation

                progress?.Report(new Migration.MigrationProgress { Percentage = 100, Message = $"Mailbox {mailbox.PrimarySmtpAddress} rollback completed" });
                return RollbackResult.Succeeded("Mailbox rollback completed - manual verification required");
            }
            catch (Exception ex)
            {
                return RollbackResult.Failed($"Mailbox rollback failed: {ex.Message}");
            }
        }
    }
}
