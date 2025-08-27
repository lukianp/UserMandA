using System;
using System.Threading.Tasks;
using MandADiscoverySuite.Migration;
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
            client.Setup(c => c.CopyAsync(It.IsAny<FileItemDto>())).Returns(Task.CompletedTask);

            var migrator = new FileServerMigrator(client.Object);
            var result = await migrator.MigrateFileAsync(new FileItemDto { SourcePath = "a", TargetPath = "b" }, new MigrationSettings(), new TargetContext());

            Assert.True(result.Success);
            client.Verify(c => c.CopyAsync(It.IsAny<FileItemDto>()), Times.Once);
        }

        [Fact]
        public async Task MigrateFileAsync_ReturnsFailure_OnError()
        {
            var client = new Mock<IFileTransferClient>();
            client.Setup(c => c.CopyAsync(It.IsAny<FileItemDto>())).ThrowsAsync(new Exception("copy error"));

            var migrator = new FileServerMigrator(client.Object);
            var result = await migrator.MigrateFileAsync(new FileItemDto(), new MigrationSettings(), new TargetContext());

            Assert.False(result.Success);
            Assert.Contains("copy error", result.Errors[0]);
        }
    }
}
