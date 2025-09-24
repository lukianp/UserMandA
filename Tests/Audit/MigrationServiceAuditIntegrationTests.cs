using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using Moq;
using MandADiscoverySuite.Migration;
using MandADiscoverySuite.Services.Audit;
using MandADiscoverySuite.Models.Migration;
using MandADiscoverySuite.Models;
using MandADiscoverySuite.Services.Migration;

namespace MandADiscoverySuite.Tests.Audit
{
    [TestClass]
    public class MigrationServiceAuditIntegrationTests
    {
        private Mock<ILogger<AuditService>> _mockAuditLogger;
        private Mock<ILogger<MigrationService>> _mockMigrationLogger;
        private Mock<MandADiscoverySuite.Migration.IIdentityMigrator> _mockIdentityMigrator;
        private Mock<MandADiscoverySuite.Migration.IMailMigrator> _mockMailMigrator;
        private Mock<MandADiscoverySuite.Migration.IFileMigrator> _mockFileMigrator;
        private Mock<MandADiscoverySuite.Migration.ISqlMigrator> _mockSqlMigrator;
        private string _testDatabasePath;
        private AuditService _auditService;
        private MigrationService _migrationService;

        [TestInitialize]
        public void Setup()
        {
            _mockAuditLogger = new Mock<ILogger<AuditService>>();
            _mockMigrationLogger = new Mock<ILogger<MigrationService>>();
            _mockIdentityMigrator = new Mock<IIdentityMigrator>();
            _mockMailMigrator = new Mock<IMailMigrator>();
            _mockFileMigrator = new Mock<IFileMigrator>();
            _mockSqlMigrator = new Mock<ISqlMigrator>();

            _testDatabasePath = Path.Combine(Path.GetTempPath(), $"test-migration-audit-{Guid.NewGuid():N}.db");
            _auditService = new AuditService(_mockAuditLogger.Object, _testDatabasePath);

            _migrationService = new MigrationService(
                _mockIdentityMigrator.Object,
                _mockMailMigrator.Object,
                _mockFileMigrator.Object,
                _mockSqlMigrator.Object,
                new Mock<IGroupMigrator>().Object,
                new Mock<IGroupPolicyMigrator>().Object,
                new Mock<IAclMigrator>().Object,
                _auditService,
                new Mock<ILicenseAssignmentService>().Object,
                _mockMigrationLogger.Object);

            // Set audit context
            _migrationService.SetAuditContext(
                "session-123", 
                "admin@test.com", 
                "SourceCompany", 
                "TargetCompany");
        }

        [TestCleanup]
        public void Cleanup()
        {
            _auditService?.Dispose();
            if (File.Exists(_testDatabasePath))
            {
                File.Delete(_testDatabasePath);
            }
        }

        [TestMethod]
        public async Task MigrateWaveAsync_WithSuccessfulUserMigration_ShouldLogAuditEvents()
        {
            // Arrange
            var user = new UserData("John Doe", "john.doe@test.com", "john.doe@test.com", null, null, true, null, null, null, null);
            var wave = new MigrationWave();
            wave.Users.Add(user);

            var settings = new MigrationSettings();
            var target = new TargetContext { TenantId = "test-tenant" };

            _mockIdentityMigrator
                .Setup(m => m.MigrateUserAsync(It.IsAny<UserDto>(), It.IsAny<MigrationSettings>(), It.IsAny<TargetContext>(), It.IsAny<IProgress<MigrationProgress>>()))
                .ReturnsAsync(MigrationResult.Succeeded());

            // Act
            var results = await _migrationService.MigrateWaveAsync(wave, settings, target);

            // Assert
            Assert.AreEqual(1, results.Count);
            Assert.IsTrue(results[0].Success);

            // Verify audit events were logged
            var auditEvents = await _auditService.GetAuditEventsAsync();
            var eventsList = auditEvents.ToList();

            // Should have wave start, user start, user complete, and wave complete events
            Assert.IsTrue(eventsList.Count >= 4);

            var waveStartEvent = eventsList.FirstOrDefault(e => e.Action == AuditAction.Started && e.ObjectType == ObjectType.Other);
            Assert.IsNotNull(waveStartEvent);
            Assert.AreEqual("Migration wave started", waveStartEvent.StatusMessage);

            var userStartEvent = eventsList.FirstOrDefault(e => e.Action == AuditAction.Started && e.ObjectType == ObjectType.User);
            Assert.IsNotNull(userStartEvent);
            Assert.AreEqual("john.doe@test.com", userStartEvent.SourceObjectName);

            var userCompleteEvent = eventsList.FirstOrDefault(e => e.Action == AuditAction.Completed && e.ObjectType == ObjectType.User);
            Assert.IsNotNull(userCompleteEvent);
            Assert.AreEqual(AuditStatus.Success, userCompleteEvent.Status);

            var waveCompleteEvent = eventsList.FirstOrDefault(e => e.Action == AuditAction.Completed && e.ObjectType == ObjectType.Other);
            Assert.IsNotNull(waveCompleteEvent);
            Assert.AreEqual(AuditStatus.Success, waveCompleteEvent.Status);
        }

        [TestMethod]
        public async Task MigrateWaveAsync_WithFailedUserMigration_ShouldLogFailureAuditEvents()
        {
            // Arrange
            var user = new UserDto { UserPrincipalName = "failing.user@test.com", DisplayName = "Failing User" };
            var wave = new MigrationWave();
            wave.Users.Add(user);

            var settings = new MigrationSettings();
            var target = new TargetContext { TenantId = "test-tenant" };

            _mockIdentityMigrator
                .Setup(m => m.MigrateUserAsync(It.IsAny<UserDto>(), It.IsAny<MigrationSettings>(), It.IsAny<TargetContext>(), It.IsAny<IProgress<MigrationProgress>>()))
                .ReturnsAsync(MigrationResult.Failed("User migration failed due to authentication error"));

            // Act
            var results = await _migrationService.MigrateWaveAsync(wave, settings, target);

            // Assert
            Assert.AreEqual(1, results.Count);
            Assert.IsFalse(results[0].Success);

            // Verify audit events were logged
            var auditEvents = await _auditService.GetAuditEventsAsync();
            var eventsList = auditEvents.ToList();

            var userFailEvent = eventsList.FirstOrDefault(e => e.Action == AuditAction.Failed && e.ObjectType == ObjectType.User);
            Assert.IsNotNull(userFailEvent);
            Assert.AreEqual(AuditStatus.Error, userFailEvent.Status);
            Assert.IsTrue(userFailEvent.ErrorMessage.Contains("authentication error"));

            var waveCompleteEvent = eventsList.FirstOrDefault(e => e.Action == AuditAction.Completed && e.ObjectType == ObjectType.Other);
            Assert.IsNotNull(waveCompleteEvent);
            Assert.AreEqual(AuditStatus.Warning, waveCompleteEvent.Status); // Warning because there were failures
        }

        [TestMethod]
        public async Task MigrateWaveAsync_WithMigrationException_ShouldLogExceptionAuditEvents()
        {
            // Arrange
            var user = new UserDto { UserPrincipalName = "exception.user@test.com", DisplayName = "Exception User" };
            var wave = new MigrationWave();
            wave.Users.Add(user);

            var settings = new MigrationSettings();
            var target = new TargetContext { TenantId = "test-tenant" };

            _mockIdentityMigrator
                .Setup(m => m.MigrateUserAsync(It.IsAny<UserDto>(), It.IsAny<MigrationSettings>(), It.IsAny<TargetContext>(), It.IsAny<IProgress<MigrationProgress>>()))
                .ThrowsAsync(new InvalidOperationException("Network connection lost"));

            // Act
            var results = await _migrationService.MigrateWaveAsync(wave, settings, target);

            // Assert
            Assert.AreEqual(1, results.Count);
            Assert.IsFalse(results[0].Success);

            // Verify audit events were logged
            var auditEvents = await _auditService.GetAuditEventsAsync();
            var eventsList = auditEvents.ToList();

            var userFailEvent = eventsList.FirstOrDefault(e => e.Action == AuditAction.Failed && e.ObjectType == ObjectType.User);
            Assert.IsNotNull(userFailEvent);
            Assert.AreEqual(AuditStatus.Error, userFailEvent.Status);
            Assert.IsTrue(userFailEvent.ErrorMessage.Contains("Network connection lost"));
            Assert.AreEqual("InvalidOperationException", userFailEvent.ErrorCode);
        }

        [TestMethod]
        public async Task MigrateWaveAsync_WithMixedObjectTypes_ShouldLogAllObjectTypeAuditEvents()
        {
            // Arrange
            var wave = new MigrationWave();
            wave.Users.Add(new UserDto { UserPrincipalName = "user@test.com" });
            wave.Mailboxes.Add(new MailboxDto { PrimarySmtpAddress = "mailbox@test.com" });
            wave.Files.Add(new FileItemDto { SourcePath = "\\\\server\\share\\file.txt" });
            wave.Databases.Add(new DatabaseDto { Name = "TestDatabase" });

            var settings = new MigrationSettings();
            var target = new TargetContext { TenantId = "test-tenant" };

            // Setup all migrators to succeed
            _mockIdentityMigrator
                .Setup(m => m.MigrateUserAsync(It.IsAny<UserData>(), It.IsAny<MandADiscoverySuite.Models.Migration.MigrationSettings>(), It.IsAny<TargetContext>(), It.IsAny<IProgress<MandADiscoverySuite.Migration.MigrationProgress>>()))
                .ReturnsAsync(MandADiscoverySuite.Migration.MigrationResult.Succeeded());

            _mockMailMigrator
                .Setup(m => m.MigrateMailboxAsync(It.IsAny<MailboxDto>(), It.IsAny<MigrationSettings>(), It.IsAny<TargetContext>(), It.IsAny<IProgress<MigrationProgress>>()))
                .ReturnsAsync(MigrationResult.Succeeded());

            _mockFileMigrator
                .Setup(m => m.MigrateFileAsync(It.IsAny<FileItemDto>(), It.IsAny<MigrationSettings>(), It.IsAny<TargetContext>(), It.IsAny<IProgress<MigrationProgress>>()))
                .ReturnsAsync(MigrationResult.Succeeded());

            _mockSqlMigrator
                .Setup(m => m.MigrateDatabaseAsync(It.IsAny<DatabaseDto>(), It.IsAny<MigrationSettings>(), It.IsAny<TargetContext>(), It.IsAny<IProgress<MigrationProgress>>()))
                .ReturnsAsync(MigrationResult.Succeeded());

            // Act
            var results = await _migrationService.MigrateWaveAsync(wave, settings, target);

            // Assert
            Assert.AreEqual(4, results.Count);
            Assert.IsTrue(results.All(r => r.Success));

            // Verify audit events for all object types
            var auditEvents = await _auditService.GetAuditEventsAsync();
            var eventsList = auditEvents.ToList();

            var userEvents = eventsList.Where(e => e.ObjectType == ObjectType.User).ToList();
            var mailboxEvents = eventsList.Where(e => e.ObjectType == ObjectType.Mailbox).ToList();
            var fileEvents = eventsList.Where(e => e.ObjectType == ObjectType.File).ToList();
            var databaseEvents = eventsList.Where(e => e.ObjectType == ObjectType.Database).ToList();

            Assert.IsTrue(userEvents.Count >= 2); // Start and complete
            Assert.IsTrue(mailboxEvents.Count >= 2); // Start and complete
            Assert.IsTrue(fileEvents.Count >= 2); // Start and complete
            Assert.IsTrue(databaseEvents.Count >= 2); // Start and complete

            // Verify object names are logged correctly
            Assert.AreEqual("user@test.com", userEvents.First(e => e.Action == AuditAction.Started).SourceObjectName);
            Assert.AreEqual("mailbox@test.com", mailboxEvents.First(e => e.Action == AuditAction.Started).SourceObjectName);
            Assert.AreEqual("\\\\server\\share\\file.txt", fileEvents.First(e => e.Action == AuditAction.Started).SourceObjectName);
            Assert.AreEqual("TestDatabase", databaseEvents.First(e => e.Action == AuditAction.Started).SourceObjectName);
        }

        [TestMethod]
        public async Task MigrateWaveAsync_ShouldLogAuditContextInformation()
        {
            // Arrange
            var user = new UserDto { UserPrincipalName = "context.user@test.com", DisplayName = "Context User" };
            var wave = new MigrationWave();
            wave.Users.Add(user);

            var settings = new MigrationSettings();
            var target = new TargetContext { TenantId = "test-tenant" };

            _mockIdentityMigrator
                .Setup(m => m.MigrateUserAsync(It.IsAny<UserDto>(), It.IsAny<MigrationSettings>(), It.IsAny<TargetContext>(), It.IsAny<IProgress<MigrationProgress>>()))
                .ReturnsAsync(MigrationResult.Succeeded());

            // Act
            var results = await _migrationService.MigrateWaveAsync(wave, settings, target);

            // Assert
            var auditEvents = await _auditService.GetAuditEventsAsync();
            var eventsList = auditEvents.ToList();

            // Verify all events have the correct audit context
            foreach (var auditEvent in eventsList)
            {
                Assert.AreEqual("session-123", auditEvent.SessionId);
                Assert.AreEqual("admin@test.com", auditEvent.UserPrincipalName);
                Assert.AreEqual("SourceCompany", auditEvent.SourceProfile);
                Assert.AreEqual("TargetCompany", auditEvent.TargetProfile);
                Assert.IsNotNull(auditEvent.WaveId);
                Assert.IsNotNull(auditEvent.WaveName);
                Assert.IsNotNull(auditEvent.CorrelationId);
            }

            // Verify wave composition metadata
            var waveStartEvent = eventsList.FirstOrDefault(e => e.Action == AuditAction.Started && e.ObjectType == ObjectType.Other);
            Assert.IsNotNull(waveStartEvent);
            Assert.IsTrue(waveStartEvent.Metadata.ContainsKey("WaveComposition"));
        }

        [TestMethod]
        public async Task MigrateWaveAsync_WithWarningsInMigrationResult_ShouldLogWarnings()
        {
            // Arrange
            var user = new UserDto { UserPrincipalName = "warning.user@test.com", DisplayName = "Warning User" };
            var wave = new MigrationWave();
            wave.Users.Add(user);

            var settings = new MigrationSettings();
            var target = new TargetContext { TenantId = "test-tenant" };

            var migrationResult = MigrationResult.Succeeded();
            migrationResult.Warnings.Add("Some permissions could not be migrated");
            migrationResult.Warnings.Add("Custom attributes were modified");

            _mockIdentityMigrator
                .Setup(m => m.MigrateUserAsync(It.IsAny<UserDto>(), It.IsAny<MigrationSettings>(), It.IsAny<TargetContext>(), It.IsAny<IProgress<MigrationProgress>>()))
                .ReturnsAsync(migrationResult);

            // Act
            var results = await _migrationService.MigrateWaveAsync(wave, settings, target);

            // Assert
            var auditEvents = await _auditService.GetAuditEventsAsync();
            var eventsList = auditEvents.ToList();

            var userCompleteEvent = eventsList.FirstOrDefault(e => e.Action == AuditAction.Completed && e.ObjectType == ObjectType.User);
            Assert.IsNotNull(userCompleteEvent);
            Assert.IsNotNull(userCompleteEvent.Warnings);
            Assert.AreEqual(2, userCompleteEvent.Warnings.Count);
            Assert.IsTrue(userCompleteEvent.Warnings.Contains("Some permissions could not be migrated"));
            Assert.IsTrue(userCompleteEvent.Warnings.Contains("Custom attributes were modified"));
        }

        [TestMethod]
        public async Task GetAuditStatisticsAsync_AfterMigrations_ShouldReflectCorrectStatistics()
        {
            // Arrange
            var wave = new MigrationWave();
            wave.Users.Add(new UserDto { UserPrincipalName = "user1@test.com" });
            wave.Users.Add(new UserDto { UserPrincipalName = "user2@test.com" });
            wave.Files.Add(new FileItemDto { SourcePath = "file1.txt" });

            var settings = new MigrationSettings();
            var target = new TargetContext();

            // Setup first user to succeed, second to fail, file to succeed
            _mockIdentityMigrator
                .SetupSequence(m => m.MigrateUserAsync(It.IsAny<UserDto>(), It.IsAny<MigrationSettings>(), It.IsAny<TargetContext>(), It.IsAny<IProgress<MigrationProgress>>()))
                .ReturnsAsync(MigrationResult.Succeeded())
                .ReturnsAsync(MigrationResult.Failed("Second user failed"));

            _mockFileMigrator
                .Setup(m => m.MigrateFileAsync(It.IsAny<FileItemDto>(), It.IsAny<MigrationSettings>(), It.IsAny<TargetContext>(), It.IsAny<IProgress<MigrationProgress>>()))
                .ReturnsAsync(MigrationResult.Succeeded());

            // Act
            await _migrationService.MigrateWaveAsync(wave, settings, target);
            var statistics = await _auditService.GetAuditStatisticsAsync();

            // Assert
            Assert.IsTrue(statistics.TotalEvents > 0);
            Assert.IsTrue(statistics.SuccessfulOperations > 0);
            Assert.IsTrue(statistics.FailedOperations > 0);
            Assert.IsTrue(statistics.OperationsByObjectType.ContainsKey(ObjectType.User));
            Assert.IsTrue(statistics.OperationsByObjectType.ContainsKey(ObjectType.File));
        }
    }
}