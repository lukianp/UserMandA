using System;
using System.Threading.Tasks;
using MandADiscoverySuite.Migration;
using MandADiscoverySuite.MigrationProviders;
using Moq;
using Xunit;

namespace MandADiscoverySuite.Tests.Migration
{
    public class SqlMigratorTests
    {
        [Fact]
        public async Task MigrateDatabaseAsync_ReturnsSuccess()
        {
            var client = new Mock<ISqlTransferClient>();
            client.Setup(c => c.RestoreAsync(It.IsAny<DatabaseDto>())).Returns(Task.CompletedTask);

            var migrator = new SqlMigrator(client.Object);
            var result = await migrator.MigrateDatabaseAsync(new DatabaseDto { Name = "db" }, new MigrationSettings(), new TargetContext());

            Assert.True(result.Success);
            client.Verify(c => c.RestoreAsync(It.IsAny<DatabaseDto>()), Times.Once);
        }

        [Fact]
        public async Task MigrateDatabaseAsync_ReturnsFailure_OnError()
        {
            var client = new Mock<ISqlTransferClient>();
            client.Setup(c => c.RestoreAsync(It.IsAny<DatabaseDto>())).ThrowsAsync(new Exception("restore error"));

            var migrator = new SqlMigrator(client.Object);
            var result = await migrator.MigrateDatabaseAsync(new DatabaseDto(), new MigrationSettings(), new TargetContext());

            Assert.False(result.Success);
            Assert.Contains("restore error", result.Errors[0]);
        }
    }
}
