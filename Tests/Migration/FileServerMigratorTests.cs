using System;
using System.Threading.Tasks;
using MandADiscoverySuite.Migration;
using MandADiscoverySuite.Models.Migration;
using MandADiscoverySuite.MigrationProviders;
using Moq;
using Xunit;

namespace MandADiscoverySuite.Tests.Migration
{
    public class FileServerMigratorTests
    {
        [Fact]
        public async Task MigrateFileAsync_ReturnsSuccess()
        {
            var client = new Mock<IFileTransferClient>();
            client.Setup(c => c.CopyAsync(It.IsAny<MandADiscoverySuite.Models.Migration.FileItemDto>())).Returns(Task.CompletedTask);

            var migrator = new FileServerMigrator(client.Object);
            var result = await migrator.MigrateFileAsync(new MandADiscoverySuite.Models.Migration.FileItemDto { SourcePath = "a", TargetPath = "b" }, new MandADiscoverySuite.Models.Migration.MigrationSettings(), new MandADiscoverySuite.Migration.TargetContext());

            Assert.True(result.Success);
            client.Verify(c => c.CopyAsync(It.IsAny<MandADiscoverySuite.Models.Migration.FileItemDto>()), Times.Once);
        }

        [Fact]
        public async Task MigrateFileAsync_ReturnsFailure_OnError()
        {
            var client = new Mock<IFileTransferClient>();
            client.Setup(c => c.CopyAsync(It.IsAny<MandADiscoverySuite.Models.Migration.FileItemDto>())).ThrowsAsync(new Exception("copy error"));

            var migrator = new FileServerMigrator(client.Object);
            var result = await migrator.MigrateFileAsync(new MandADiscoverySuite.Models.Migration.FileItemDto(), new MandADiscoverySuite.Models.Migration.MigrationSettings(), new MandADiscoverySuite.Migration.TargetContext());

            Assert.False(result.Success);
            Assert.Contains("copy error", result.Errors[0]);
        }
    }
}
