using System;
using System.Threading.Tasks;
using MandADiscoverySuite.Migration;
using MandADiscoverySuite.MigrationProviders;
using Moq;
using Xunit;

namespace MandADiscoverySuite.Tests.Migration
{
    public class ExchangeMailMigratorTests
    {
        [Fact]
        public async Task MigrateMailboxAsync_ReturnsSuccess()
        {
            var client = new Mock<IExchangeMailClient>();
            client.Setup(c => c.MoveMailboxAsync(It.IsAny<MailboxDto>())).Returns(Task.CompletedTask);

            var migrator = new ExchangeMailMigrator(client.Object);
            var result = await migrator.MigrateMailboxAsync(new MailboxDto { PrimarySmtpAddress = "test@example.com" }, new MigrationSettings(), new TargetContext());

            Assert.True(result.Success);
            client.Verify(c => c.MoveMailboxAsync(It.IsAny<MailboxDto>()), Times.Once);
        }

        [Fact]
        public async Task MigrateMailboxAsync_ReturnsFailure_OnError()
        {
            var client = new Mock<IExchangeMailClient>();
            client.Setup(c => c.MoveMailboxAsync(It.IsAny<MailboxDto>())).ThrowsAsync(new Exception("failed"));

            var migrator = new ExchangeMailMigrator(client.Object);
            var result = await migrator.MigrateMailboxAsync(new MailboxDto(), new MigrationSettings(), new TargetContext());

            Assert.False(result.Success);
            Assert.Contains("failed", result.Errors[0]);
        }
    }
}
