using System;
using System.Threading.Tasks;
using MandADiscoverySuite.Migration;
using MandADiscoverySuite.Models.Migration;
using Moq;
using Xunit;

namespace MandADiscoverySuite.Tests.Migration
{
    public class MigrationServiceTests
    {
        [Fact]
        public async Task MigrateWaveAsync_InvokesAllMigrators()
        {
            var identity = new Mock<IIdentityMigrator>();
            identity.Setup(m => m.MigrateUserAsync(It.IsAny<UserDto>(), It.IsAny<MigrationSettings>(), It.IsAny<TargetContext>(), It.IsAny<IProgress<MigrationProgress>>()))
                .ReturnsAsync(MigrationResult.Succeeded());

            var mail = new Mock<IMailMigrator>();
            mail.Setup(m => m.MigrateMailboxAsync(It.IsAny<MailboxDto>(), It.IsAny<MigrationSettings>(), It.IsAny<TargetContext>(), It.IsAny<IProgress<MigrationProgress>>()))
                .ReturnsAsync(MigrationResult.Succeeded());

            var file = new Mock<IFileMigrator>();
            file.Setup(m => m.MigrateFileAsync(It.IsAny<FileItemDto>(), It.IsAny<MigrationSettings>(), It.IsAny<TargetContext>(), It.IsAny<IProgress<MigrationProgress>>()))
                .ReturnsAsync(MigrationResult.Succeeded());

            var sql = new Mock<ISqlMigrator>();
            sql.Setup(m => m.MigrateDatabaseAsync(It.IsAny<DatabaseDto>(), It.IsAny<MigrationSettings>(), It.IsAny<TargetContext>(), It.IsAny<IProgress<MigrationProgress>>()))
                .ReturnsAsync(MigrationResult.Succeeded());

            var service = new MigrationService(identity.Object, mail.Object, file.Object, sql.Object);

            var wave = new MigrationWave();
            wave.Users.Add(new UserDto());
            wave.Mailboxes.Add(new MailboxDto());
            wave.Files.Add(new FileItemDto());
            wave.Databases.Add(new DatabaseDto());

            var results = await service.MigrateWaveAsync(wave, new MigrationSettings(), new TargetContext());

            Assert.Equal(4, results.Count);
            identity.Verify(m => m.MigrateUserAsync(It.IsAny<UserDto>(), It.IsAny<MigrationSettings>(), It.IsAny<TargetContext>(), It.IsAny<IProgress<MigrationProgress>>()), Times.Once);
            mail.Verify(m => m.MigrateMailboxAsync(It.IsAny<MailboxDto>(), It.IsAny<MigrationSettings>(), It.IsAny<TargetContext>(), It.IsAny<IProgress<MigrationProgress>>()), Times.Once);
            file.Verify(m => m.MigrateFileAsync(It.IsAny<FileItemDto>(), It.IsAny<MigrationSettings>(), It.IsAny<TargetContext>(), It.IsAny<IProgress<MigrationProgress>>()), Times.Once);
            sql.Verify(m => m.MigrateDatabaseAsync(It.IsAny<DatabaseDto>(), It.IsAny<MigrationSettings>(), It.IsAny<TargetContext>(), It.IsAny<IProgress<MigrationProgress>>()), Times.Once);
        }
    }
}
