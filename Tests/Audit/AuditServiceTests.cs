using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using Moq;
using MandADiscoverySuite.Services.Audit;

namespace MandADiscoverySuite.Tests.Audit
{
    [TestClass]
    public class AuditServiceTests
    {
        private Mock<ILogger<AuditService>> _mockLogger;
        private string _testDatabasePath;
        private AuditService _auditService;

        [TestInitialize]
        public void Setup()
        {
            _mockLogger = new Mock<ILogger<AuditService>>();
            _testDatabasePath = Path.Combine(Path.GetTempPath(), $"test-audit-{Guid.NewGuid():N}.db");
            _auditService = new AuditService(_mockLogger.Object, _testDatabasePath);
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
        public async Task LogAuditEventAsync_WithValidEvent_ShouldReturnTrue()
        {
            // Arrange
            var auditEvent = CreateTestAuditEvent();

            // Act
            var result = await _auditService.LogAuditEventAsync(auditEvent);

            // Assert
            Assert.IsTrue(result);
        }

        [TestMethod]
        public async Task LogAuditEventAsync_WithNullEvent_ShouldThrowArgumentNullException()
        {
            // Act & Assert
            await Assert.ThrowsExceptionAsync<ArgumentNullException>(
                () => _auditService.LogAuditEventAsync(null));
        }

        [TestMethod]
        public async Task GetAuditEventsAsync_WithNoFilter_ShouldReturnAllEvents()
        {
            // Arrange
            var events = new List<AuditEvent>
            {
                CreateTestAuditEvent(ObjectType.User, "user1@test.com"),
                CreateTestAuditEvent(ObjectType.Mailbox, "user2@test.com"),
                CreateTestAuditEvent(ObjectType.File, "test-file.txt")
            };

            foreach (var evt in events)
            {
                await _auditService.LogAuditEventAsync(evt);
            }

            // Act
            var retrievedEvents = await _auditService.GetAuditEventsAsync();

            // Assert
            Assert.AreEqual(3, retrievedEvents.Count());
        }

        [TestMethod]
        public async Task GetAuditEventsAsync_WithObjectTypeFilter_ShouldReturnFilteredEvents()
        {
            // Arrange
            var userEvent = CreateTestAuditEvent(ObjectType.User, "user1@test.com");
            var fileEvent = CreateTestAuditEvent(ObjectType.File, "test-file.txt");

            await _auditService.LogAuditEventAsync(userEvent);
            await _auditService.LogAuditEventAsync(fileEvent);

            var filter = new AuditFilter { ObjectType = ObjectType.User };

            // Act
            var retrievedEvents = await _auditService.GetAuditEventsAsync(filter);

            // Assert
            Assert.AreEqual(1, retrievedEvents.Count());
            Assert.AreEqual(ObjectType.User, retrievedEvents.First().ObjectType);
        }

        [TestMethod]
        public async Task GetAuditEventsAsync_WithDateFilter_ShouldReturnFilteredEvents()
        {
            // Arrange
            var oldEvent = CreateTestAuditEvent(ObjectType.User, "user1@test.com");
            oldEvent.Timestamp = DateTime.UtcNow.AddDays(-5);
            
            var recentEvent = CreateTestAuditEvent(ObjectType.User, "user2@test.com");
            recentEvent.Timestamp = DateTime.UtcNow.AddHours(-1);

            await _auditService.LogAuditEventAsync(oldEvent);
            await _auditService.LogAuditEventAsync(recentEvent);

            var filter = new AuditFilter 
            { 
                StartDate = DateTime.UtcNow.AddDays(-2),
                EndDate = DateTime.UtcNow 
            };

            // Act
            var retrievedEvents = await _auditService.GetAuditEventsAsync(filter);

            // Assert
            Assert.AreEqual(1, retrievedEvents.Count());
            Assert.AreEqual("user2@test.com", retrievedEvents.First().SourceObjectName);
        }

        [TestMethod]
        public async Task GetAuditEventsAsync_WithStatusFilter_ShouldReturnFilteredEvents()
        {
            // Arrange
            var successEvent = CreateTestAuditEvent(ObjectType.User, "user1@test.com");
            successEvent.Status = AuditStatus.Success;
            
            var errorEvent = CreateTestAuditEvent(ObjectType.User, "user2@test.com");
            errorEvent.Status = AuditStatus.Error;

            await _auditService.LogAuditEventAsync(successEvent);
            await _auditService.LogAuditEventAsync(errorEvent);

            var filter = new AuditFilter { Status = AuditStatus.Error };

            // Act
            var retrievedEvents = await _auditService.GetAuditEventsAsync(filter);

            // Assert
            Assert.AreEqual(1, retrievedEvents.Count());
            Assert.AreEqual(AuditStatus.Error, retrievedEvents.First().Status);
        }

        [TestMethod]
        public async Task GetAuditEventsAsync_WithSearchText_ShouldReturnFilteredEvents()
        {
            // Arrange
            var event1 = CreateTestAuditEvent(ObjectType.User, "john.doe@test.com");
            var event2 = CreateTestAuditEvent(ObjectType.User, "jane.smith@test.com");

            await _auditService.LogAuditEventAsync(event1);
            await _auditService.LogAuditEventAsync(event2);

            var filter = new AuditFilter { SearchText = "john.doe" };

            // Act
            var retrievedEvents = await _auditService.GetAuditEventsAsync(filter);

            // Assert
            Assert.AreEqual(1, retrievedEvents.Count());
            Assert.IsTrue(retrievedEvents.First().SourceObjectName.Contains("john.doe"));
        }

        [TestMethod]
        public async Task GetAuditEventsAsync_WithMaxRecords_ShouldLimitResults()
        {
            // Arrange
            for (int i = 0; i < 10; i++)
            {
                var evt = CreateTestAuditEvent(ObjectType.User, $"user{i}@test.com");
                await _auditService.LogAuditEventAsync(evt);
            }

            var filter = new AuditFilter { MaxRecords = 5 };

            // Act
            var retrievedEvents = await _auditService.GetAuditEventsAsync(filter);

            // Assert
            Assert.AreEqual(5, retrievedEvents.Count());
        }

        [TestMethod]
        public async Task GetAuditStatisticsAsync_WithEvents_ShouldReturnCorrectStatistics()
        {
            // Arrange
            var successEvent = CreateTestAuditEvent(ObjectType.User, "user1@test.com");
            successEvent.Status = AuditStatus.Success;
            successEvent.Duration = TimeSpan.FromSeconds(30);
            successEvent.DataSizeBytes = 1024;

            var errorEvent = CreateTestAuditEvent(ObjectType.Mailbox, "user2@test.com");
            errorEvent.Status = AuditStatus.Error;
            errorEvent.Duration = TimeSpan.FromSeconds(60);
            errorEvent.DataSizeBytes = 2048;

            var warningEvent = CreateTestAuditEvent(ObjectType.File, "test-file.txt");
            warningEvent.Status = AuditStatus.Warning;
            warningEvent.Duration = TimeSpan.FromSeconds(45);
            warningEvent.DataSizeBytes = 512;

            await _auditService.LogAuditEventAsync(successEvent);
            await _auditService.LogAuditEventAsync(errorEvent);
            await _auditService.LogAuditEventAsync(warningEvent);

            // Act
            var statistics = await _auditService.GetAuditStatisticsAsync();

            // Assert
            Assert.AreEqual(3, statistics.TotalEvents);
            Assert.AreEqual(1, statistics.SuccessfulOperations);
            Assert.AreEqual(1, statistics.FailedOperations);
            Assert.AreEqual(1, statistics.WarningOperations);
            Assert.AreEqual(33.3, statistics.SuccessRate, 0.1);
            Assert.AreEqual(3584, statistics.TotalDataProcessed); // 1024 + 2048 + 512
            Assert.IsTrue(statistics.AverageOperationDuration.HasValue);
            Assert.AreEqual(3, statistics.OperationsByObjectType.Count);
        }

        [TestMethod]
        public async Task ExportToCsvAsync_WithEvents_ShouldReturnCsvData()
        {
            // Arrange
            var auditEvent = CreateTestAuditEvent();
            await _auditService.LogAuditEventAsync(auditEvent);

            // Act
            var csvData = await _auditService.ExportToCsvAsync();

            // Assert
            Assert.IsNotNull(csvData);
            Assert.IsTrue(csvData.Length > 0);
            
            var csvContent = System.Text.Encoding.UTF8.GetString(csvData);
            Assert.IsTrue(csvContent.Contains("AuditId"));
            Assert.IsTrue(csvContent.Contains("Timestamp"));
            Assert.IsTrue(csvContent.Contains(auditEvent.AuditId.ToString()));
        }

        [TestMethod]
        public async Task ExportToPdfAsync_WithEvents_ShouldReturnPdfData()
        {
            // Arrange
            var auditEvent = CreateTestAuditEvent();
            await _auditService.LogAuditEventAsync(auditEvent);

            // Act
            var pdfData = await _auditService.ExportToPdfAsync();

            // Assert
            Assert.IsNotNull(pdfData);
            Assert.IsTrue(pdfData.Length > 0);
            
            var pdfContent = System.Text.Encoding.UTF8.GetString(pdfData);
            Assert.IsTrue(pdfContent.Contains("MIGRATION AUDIT REPORT"));
        }

        [TestMethod]
        public async Task ArchiveOldRecordsAsync_WithOldRecords_ShouldArchiveAndDelete()
        {
            // Arrange
            var oldEvent = CreateTestAuditEvent(ObjectType.User, "old-user@test.com");
            oldEvent.Timestamp = DateTime.UtcNow.AddDays(-95); // Older than 90 days

            var recentEvent = CreateTestAuditEvent(ObjectType.User, "recent-user@test.com");
            recentEvent.Timestamp = DateTime.UtcNow.AddDays(-30); // Within 90 days

            await _auditService.LogAuditEventAsync(oldEvent);
            await _auditService.LogAuditEventAsync(recentEvent);

            // Act
            var archivedCount = await _auditService.ArchiveOldRecordsAsync(TimeSpan.FromDays(90));

            // Assert
            Assert.AreEqual(1, archivedCount);

            // Verify only recent record remains
            var remainingEvents = await _auditService.GetAuditEventsAsync();
            Assert.AreEqual(1, remainingEvents.Count());
            Assert.AreEqual("recent-user@test.com", remainingEvents.First().SourceObjectName);
        }

        [TestMethod]
        public async Task ValidateAuditIntegrityAsync_WithValidDatabase_ShouldReturnTrue()
        {
            // Arrange
            var auditEvent = CreateTestAuditEvent();
            await _auditService.LogAuditEventAsync(auditEvent);

            // Act
            var isValid = await _auditService.ValidateAuditIntegrityAsync();

            // Assert
            Assert.IsTrue(isValid);
        }

        [TestMethod]
        public async Task LogAuditEventAsync_WithComplexEvent_ShouldPersistAllFields()
        {
            // Arrange
            var complexEvent = new AuditEvent
            {
                AuditId = Guid.NewGuid(),
                Timestamp = DateTime.UtcNow,
                UserPrincipalName = "admin@test.com",
                SessionId = "session-123",
                SourceProfile = "SourceCompany",
                TargetProfile = "TargetCompany",
                Action = AuditAction.Completed,
                ObjectType = ObjectType.User,
                SourceObjectId = "user-id-123",
                SourceObjectName = "john.doe@test.com",
                TargetObjectId = "target-user-id-456",
                TargetObjectName = "john.doe@target.com",
                WaveId = "wave-abc-123",
                WaveName = "Initial Migration Wave",
                BatchId = "batch-def-456",
                Duration = TimeSpan.FromMinutes(5),
                SourceEnvironment = "On-Premises",
                TargetEnvironment = "Azure",
                MachineName = "TEST-MACHINE",
                MachineIpAddress = "192.168.1.100",
                Status = AuditStatus.Success,
                StatusMessage = "User migration completed successfully",
                ErrorCode = null,
                ErrorMessage = null,
                Warnings = new List<string> { "Minor warning during migration" },
                RetryAttempts = 1,
                ItemsProcessed = 1,
                DataSizeBytes = 1024000,
                TransferRate = 2048.5,
                Metadata = new Dictionary<string, string>
                {
                    ["CustomProperty1"] = "Value1",
                    ["CustomProperty2"] = "Value2"
                },
                ParentAuditId = Guid.NewGuid(),
                CorrelationId = "correlation-xyz-789",
                MigrationResultData = "{\"Success\":true,\"Details\":\"Migration completed\"}"
            };

            // Act
            var result = await _auditService.LogAuditEventAsync(complexEvent);
            var retrievedEvents = await _auditService.GetAuditEventsAsync();

            // Assert
            Assert.IsTrue(result);
            Assert.AreEqual(1, retrievedEvents.Count());
            
            var retrieved = retrievedEvents.First();
            Assert.AreEqual(complexEvent.AuditId, retrieved.AuditId);
            Assert.AreEqual(complexEvent.UserPrincipalName, retrieved.UserPrincipalName);
            Assert.AreEqual(complexEvent.SessionId, retrieved.SessionId);
            Assert.AreEqual(complexEvent.SourceProfile, retrieved.SourceProfile);
            Assert.AreEqual(complexEvent.TargetProfile, retrieved.TargetProfile);
            Assert.AreEqual(complexEvent.Action, retrieved.Action);
            Assert.AreEqual(complexEvent.ObjectType, retrieved.ObjectType);
            Assert.AreEqual(complexEvent.SourceObjectId, retrieved.SourceObjectId);
            Assert.AreEqual(complexEvent.SourceObjectName, retrieved.SourceObjectName);
            Assert.AreEqual(complexEvent.TargetObjectId, retrieved.TargetObjectId);
            Assert.AreEqual(complexEvent.TargetObjectName, retrieved.TargetObjectName);
            Assert.AreEqual(complexEvent.WaveId, retrieved.WaveId);
            Assert.AreEqual(complexEvent.WaveName, retrieved.WaveName);
            Assert.AreEqual(complexEvent.BatchId, retrieved.BatchId);
            Assert.AreEqual(complexEvent.Duration, retrieved.Duration);
            Assert.AreEqual(complexEvent.SourceEnvironment, retrieved.SourceEnvironment);
            Assert.AreEqual(complexEvent.TargetEnvironment, retrieved.TargetEnvironment);
            Assert.AreEqual(complexEvent.MachineName, retrieved.MachineName);
            Assert.AreEqual(complexEvent.MachineIpAddress, retrieved.MachineIpAddress);
            Assert.AreEqual(complexEvent.Status, retrieved.Status);
            Assert.AreEqual(complexEvent.StatusMessage, retrieved.StatusMessage);
            Assert.AreEqual(complexEvent.RetryAttempts, retrieved.RetryAttempts);
            Assert.AreEqual(complexEvent.ItemsProcessed, retrieved.ItemsProcessed);
            Assert.AreEqual(complexEvent.DataSizeBytes, retrieved.DataSizeBytes);
            Assert.AreEqual(complexEvent.TransferRate, retrieved.TransferRate);
            Assert.AreEqual(complexEvent.ParentAuditId, retrieved.ParentAuditId);
            Assert.AreEqual(complexEvent.CorrelationId, retrieved.CorrelationId);
            Assert.AreEqual(complexEvent.MigrationResultData, retrieved.MigrationResultData);
            
            // Verify collections
            Assert.AreEqual(1, retrieved.Warnings.Count);
            Assert.AreEqual("Minor warning during migration", retrieved.Warnings[0]);
            Assert.AreEqual(2, retrieved.Metadata.Count);
            Assert.AreEqual("Value1", retrieved.Metadata["CustomProperty1"]);
            Assert.AreEqual("Value2", retrieved.Metadata["CustomProperty2"]);
        }

        private static AuditEvent CreateTestAuditEvent(ObjectType objectType = ObjectType.User, string objectName = "test-user@test.com")
        {
            return new AuditEvent
            {
                Action = AuditAction.Started,
                ObjectType = objectType,
                SourceObjectName = objectName,
                Status = AuditStatus.InProgress,
                StatusMessage = $"Test {objectType} migration",
                UserPrincipalName = "admin@test.com",
                WaveId = "test-wave-123",
                WaveName = "Test Wave"
            };
        }
    }
}