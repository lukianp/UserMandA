using System;
using System.Threading.Tasks;
using MandADiscoverySuite.Migration;
using MandADiscoverySuite.MigrationProviders;
using Moq;
using Xunit;

namespace MandADiscoverySuite.Tests.Migration
{
    public class GraphIdentityMigratorTests
    {
        [Fact]
        public async Task MigrateUserAsync_ReturnsSuccess_OnProviderSuccess()
        {
            var client = new Mock<IGraphUserClient>();
            client.Setup(c => c.CreateUserAsync(It.IsAny<UserDto>())).Returns(Task.CompletedTask);

            var migrator = new GraphIdentityMigrator(client.Object);
            var result = await migrator.MigrateUserAsync(new UserDto { DisplayName = "Test" }, new MigrationSettings(), new TargetContext());

            Assert.True(result.Success);
            client.Verify(c => c.CreateUserAsync(It.IsAny<UserDto>()), Times.Once);
        }

        [Fact]
        public async Task MigrateUserAsync_ReturnsFailure_OnProviderError()
        {
            var client = new Mock<IGraphUserClient>();
            client.Setup(c => c.CreateUserAsync(It.IsAny<UserDto>())).ThrowsAsync(new Exception("error"));

            var migrator = new GraphIdentityMigrator(client.Object);
            var result = await migrator.MigrateUserAsync(new UserDto(), new MigrationSettings(), new TargetContext());

            Assert.False(result.Success);
            Assert.Contains("error", result.Errors[0]);
        }

        [Fact]
        public async Task MigrateUserAsync_SupportsConcurrency()
        {
            var client = new Mock<IGraphUserClient>();
            client.Setup(c => c.CreateUserAsync(It.IsAny<UserDto>())).Returns(async () => await Task.Delay(10));

            var migrator = new GraphIdentityMigrator(client.Object);
            var user1 = new UserDto { DisplayName = "A" };
            var user2 = new UserDto { DisplayName = "B" };

            await Task.WhenAll(
                migrator.MigrateUserAsync(user1, new MigrationSettings(), new TargetContext()),
                migrator.MigrateUserAsync(user2, new MigrationSettings(), new TargetContext()));

            client.Verify(c => c.CreateUserAsync(It.IsAny<UserDto>()), Times.Exactly(2));
        }
    }
}
