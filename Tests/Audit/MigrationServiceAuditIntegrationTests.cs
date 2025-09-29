using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using Moq;
using MandADiscoverySuite.Services.Audit;
using MandADiscoverySuite.Models;
using MandADiscoverySuite.Models.Migration;
using MandADiscoverySuite.Migration;

namespace MandADiscoverySuite.Tests.Audit
{
    /// <summary>
    /// Integration tests for MigrationService audit functionality.
    /// Tests the audit trail creation during migration operations.
    /// </summary>
    [TestClass]
    public class MigrationServiceAuditIntegrationTests
    {
        private Mock<ILogger<AuditService>> _mockAuditLogger;
        private string _testDatabasePath;
        private AuditService _auditService;

        [TestInitialize]
        public void Setup()
        {
            // Initialize mocks
            _mockAuditLogger = new Mock<ILogger<AuditService>>();

            // Setup test database path
            _testDatabasePath = Path.Combine(Path.GetTempPath(), $"test-migration-audit-{Guid.NewGuid():N}.db");

            // Create audit service
            _auditService = new AuditService(_mockAuditLogger.Object, _testDatabasePath);
        }

        [TestCleanup]
        public void Cleanup()
        {
            _auditService?.Dispose();
            if (File.Exists(_testDatabasePath))
            {
                try
                {
                    File.Delete(_testDatabasePath);
                }
                catch
                {
                    // Ignore cleanup errors
                }
            }
        }

        [TestMethod]
        public async Task AuditService_ShouldLogMigrationEvents()
        {
            // Arrange
            var testEvent = new AuditEvent
            {
                AuditId = Guid.NewGuid(),
                Timestamp = DateTime.UtcNow,
                SessionId = "test-session",
                UserPrincipalName = "admin@test.com",
                Action = AuditAction.Started,
                ObjectType = ObjectType.User,
                SourceObjectName = "testuser@domain.com",
                Status = AuditStatus.Success,
                StatusMessage = "Test migration event"
            };

            // Act
            await _auditService.LogAuditEventAsync(testEvent);

            // Assert
            var auditEvents = await _auditService.GetAuditEventsAsync();
            var eventsList = auditEvents.ToList();

            Assert.AreEqual(1, eventsList.Count);
            var loggedEvent = eventsList[0];
            Assert.AreEqual("test-session", loggedEvent.SessionId);
            Assert.AreEqual("admin@test.com", loggedEvent.UserPrincipalName);
            Assert.AreEqual(AuditAction.Started, loggedEvent.Action);
            Assert.AreEqual(ObjectType.User, loggedEvent.ObjectType);
            Assert.AreEqual("testuser@domain.com", loggedEvent.SourceObjectName);
            Assert.AreEqual(AuditStatus.Success, loggedEvent.Status);
        }

        [TestMethod]
        public async Task AuditService_ShouldLogFailureEvents()
        {
            // Arrange
            var failureEvent = new AuditEvent
            {
                AuditId = Guid.NewGuid(),
                Timestamp = DateTime.UtcNow,
                SessionId = "test-session",
                UserPrincipalName = "admin@test.com",
                Action = AuditAction.Failed,
                ObjectType = ObjectType.User,
                SourceObjectName = "failinguser@domain.com",
                Status = AuditStatus.Error,
                StatusMessage = "Migration failed",
                ErrorMessage = "Authentication error occurred"
            };

            // Act
            await _auditService.LogAuditEventAsync(failureEvent);

            // Assert
            var auditEvents = await _auditService.GetAuditEventsAsync();
            var eventsList = auditEvents.ToList();

            Assert.AreEqual(1, eventsList.Count);
            var loggedEvent = eventsList[0];
            Assert.AreEqual(AuditAction.Failed, loggedEvent.Action);
            Assert.AreEqual(AuditStatus.Error, loggedEvent.Status);
            Assert.AreEqual("Authentication error occurred", loggedEvent.ErrorMessage);
        }

        [TestMethod]
        public async Task AuditService_ShouldLogMultipleObjectTypes()
        {
            // Arrange
            var events = new[]
            {
                new AuditEvent
                {
                    AuditId = Guid.NewGuid(),
                    Timestamp = DateTime.UtcNow,
                    SessionId = "test-session",
                    UserPrincipalName = "admin@test.com",
                    Action = AuditAction.Started,
                    ObjectType = ObjectType.User,
                    SourceObjectName = "user@test.com",
                    Status = AuditStatus.Success,
                    StatusMessage = "User migration started"
                },
                new AuditEvent
                {
                    AuditId = Guid.NewGuid(),
                    Timestamp = DateTime.UtcNow,
                    SessionId = "test-session",
                    UserPrincipalName = "admin@test.com",
                    Action = AuditAction.Started,
                    ObjectType = ObjectType.Mailbox,
                    SourceObjectName = "mailbox@test.com",
                    Status = AuditStatus.Success,
                    StatusMessage = "Mailbox migration started"
                },
                new AuditEvent
                {
                    AuditId = Guid.NewGuid(),
                    Timestamp = DateTime.UtcNow,
                    SessionId = "test-session",
                    UserPrincipalName = "admin@test.com",
                    Action = AuditAction.Started,
                    ObjectType = ObjectType.File,
                    SourceObjectName = "test.txt",
                    Status = AuditStatus.Success,
                    StatusMessage = "File migration started"
                }
            };

            // Act
            foreach (var evt in events)
            {
                await _auditService.LogAuditEventAsync(evt);
            }

            // Assert
            var auditEvents = await _auditService.GetAuditEventsAsync();
            var eventsList = auditEvents.ToList();

            Assert.AreEqual(3, eventsList.Count);

            var userEvents = eventsList.Where(e => e.ObjectType == ObjectType.User).ToList();
            var mailboxEvents = eventsList.Where(e => e.ObjectType == ObjectType.Mailbox).ToList();
            var fileEvents = eventsList.Where(e => e.ObjectType == ObjectType.File).ToList();

            Assert.AreEqual(1, userEvents.Count);
            Assert.AreEqual(1, mailboxEvents.Count);
            Assert.AreEqual(1, fileEvents.Count);

            Assert.AreEqual("user@test.com", userEvents[0].SourceObjectName);
            Assert.AreEqual("mailbox@test.com", mailboxEvents[0].SourceObjectName);
            Assert.AreEqual("test.txt", fileEvents[0].SourceObjectName);
        }

        [TestMethod]
        public async Task GetAuditStatisticsAsync_ShouldReturnCorrectStatistics()
        {
            // Arrange - Create various audit events
            var events = new[]
            {
                new AuditEvent
                {
                    AuditId = Guid.NewGuid(),
                    Timestamp = DateTime.UtcNow,
                    SessionId = "test-session",
                    UserPrincipalName = "admin@test.com",
                    Action = AuditAction.Started,
                    ObjectType = ObjectType.User,
                    SourceObjectName = "user1@test.com",
                    Status = AuditStatus.Success,
                    StatusMessage = "User migration started"
                },
                new AuditEvent
                {
                    AuditId = Guid.NewGuid(),
                    Timestamp = DateTime.UtcNow,
                    SessionId = "test-session",
                    UserPrincipalName = "admin@test.com",
                    Action = AuditAction.Completed,
                    ObjectType = ObjectType.User,
                    SourceObjectName = "user1@test.com",
                    Status = AuditStatus.Success,
                    StatusMessage = "User migration completed"
                },
                new AuditEvent
                {
                    AuditId = Guid.NewGuid(),
                    Timestamp = DateTime.UtcNow,
                    SessionId = "test-session",
                    UserPrincipalName = "admin@test.com",
                    Action = AuditAction.Started,
                    ObjectType = ObjectType.Mailbox,
                    SourceObjectName = "mailbox1@test.com",
                    Status = AuditStatus.Success,
                    StatusMessage = "Mailbox migration started"
                },
                new AuditEvent
                {
                    AuditId = Guid.NewGuid(),
                    Timestamp = DateTime.UtcNow,
                    SessionId = "test-session",
                    UserPrincipalName = "admin@test.com",
                    Action = AuditAction.Failed,
                    ObjectType = ObjectType.User,
                    SourceObjectName = "user2@test.com",
                    Status = AuditStatus.Error,
                    StatusMessage = "User migration failed",
                    ErrorMessage = "Account already exists"
                }
            };

            // Act
            foreach (var evt in events)
            {
                await _auditService.LogAuditEventAsync(evt);
            }

            var statistics = await _auditService.GetAuditStatisticsAsync();

            // Assert
            Assert.IsTrue(statistics.TotalEvents >= 4, $"Expected at least 4 total events but got {statistics.TotalEvents}");
            Assert.IsTrue(statistics.SuccessfulOperations >= 3, $"Expected at least 3 successful operations but got {statistics.SuccessfulOperations}");
            Assert.IsTrue(statistics.FailedOperations >= 1, $"Expected at least 1 failed operation but got {statistics.FailedOperations}");
            Assert.IsTrue(statistics.OperationsByObjectType.ContainsKey(ObjectType.User), "Should have user operations");
            Assert.IsTrue(statistics.OperationsByObjectType.ContainsKey(ObjectType.Mailbox), "Should have mailbox operations");

            // Verify the counts match expectations
            Assert.AreEqual(2, statistics.OperationsByObjectType[ObjectType.User], "Should have 2 user operations");
            Assert.AreEqual(1, statistics.OperationsByObjectType[ObjectType.Mailbox], "Should have 1 mailbox operation");
        }

        [TestMethod]
        public async Task AuditEvents_ShouldSupportFilteringByObjectType()
        {
            // Arrange - Create events of different types
            var events = new[]
            {
                new AuditEvent
                {
                    AuditId = Guid.NewGuid(),
                    Timestamp = DateTime.UtcNow,
                    SessionId = "test-session",
                    UserPrincipalName = "admin@test.com",
                    Action = AuditAction.Started,
                    ObjectType = ObjectType.User,
                    SourceObjectName = "user1@test.com",
                    Status = AuditStatus.Success
                },
                new AuditEvent
                {
                    AuditId = Guid.NewGuid(),
                    Timestamp = DateTime.UtcNow,
                    SessionId = "test-session",
                    UserPrincipalName = "admin@test.com",
                    Action = AuditAction.Started,
                    ObjectType = ObjectType.File,
                    SourceObjectName = "file1.txt",
                    Status = AuditStatus.Success
                },
                new AuditEvent
                {
                    AuditId = Guid.NewGuid(),
                    Timestamp = DateTime.UtcNow,
                    SessionId = "test-session",
                    UserPrincipalName = "admin@test.com",
                    Action = AuditAction.Started,
                    ObjectType = ObjectType.User,
                    SourceObjectName = "user2@test.com",
                    Status = AuditStatus.Success
                }
            };

            // Act
            foreach (var evt in events)
            {
                await _auditService.LogAuditEventAsync(evt);
            }

            var userFilter = new AuditFilter { ObjectType = ObjectType.User };
            var userEvents = await _auditService.GetAuditEventsAsync(userFilter);

            var fileFilter = new AuditFilter { ObjectType = ObjectType.File };
            var fileEvents = await _auditService.GetAuditEventsAsync(fileFilter);

            // Assert
            Assert.AreEqual(2, userEvents.Count(), "Should have 2 user events");
            Assert.AreEqual(1, fileEvents.Count(), "Should have 1 file event");

            Assert.IsTrue(userEvents.All(e => e.ObjectType == ObjectType.User), "All filtered user events should be of type User");
            Assert.IsTrue(fileEvents.All(e => e.ObjectType == ObjectType.File), "All filtered file events should be of type File");
        }

        [TestMethod]
        public async Task AuditEvents_ShouldSupportFilteringByStatus()
        {
            // Arrange - Create events with different statuses
            var events = new[]
            {
                new AuditEvent
                {
                    AuditId = Guid.NewGuid(),
                    Timestamp = DateTime.UtcNow,
                    SessionId = "test-session",
                    Action = AuditAction.Completed,
                    ObjectType = ObjectType.User,
                    Status = AuditStatus.Success
                },
                new AuditEvent
                {
                    AuditId = Guid.NewGuid(),
                    Timestamp = DateTime.UtcNow,
                    SessionId = "test-session",
                    Action = AuditAction.Failed,
                    ObjectType = ObjectType.User,
                    Status = AuditStatus.Error
                },
                new AuditEvent
                {
                    AuditId = Guid.NewGuid(),
                    Timestamp = DateTime.UtcNow,
                    SessionId = "test-session",
                    Action = AuditAction.Started,
                    ObjectType = ObjectType.User,
                    Status = AuditStatus.InProgress
                }
            };

            // Act
            foreach (var evt in events)
            {
                await _auditService.LogAuditEventAsync(evt);
            }

            var successFilter = new AuditFilter { Status = AuditStatus.Success };
            var successEvents = await _auditService.GetAuditEventsAsync(successFilter);

            var errorFilter = new AuditFilter { Status = AuditStatus.Error };
            var errorEvents = await _auditService.GetAuditEventsAsync(errorFilter);

            // Assert
            Assert.AreEqual(1, successEvents.Count(), "Should have 1 success event");
            Assert.AreEqual(1, errorEvents.Count(), "Should have 1 error event");

            Assert.IsTrue(successEvents.All(e => e.Status == AuditStatus.Success), "All filtered success events should have Success status");
            Assert.IsTrue(errorEvents.All(e => e.Status == AuditStatus.Error), "All filtered error events should have Error status");
        }

        [TestMethod]
        public async Task AuditService_ShouldHandleConcurrentLogging()
        {
            // Arrange - Create multiple events to log concurrently
            var tasks = new List<Task>();
            var eventsCreated = new List<AuditEvent>();

            for (int i = 0; i < 10; i++)
            {
                var auditEvent = new AuditEvent
                {
                    AuditId = Guid.NewGuid(),
                    Timestamp = DateTime.UtcNow,
                    SessionId = $"session-{i}",
                    UserPrincipalName = $"user{i}@test.com",
                    Action = AuditAction.Started,
                    ObjectType = ObjectType.User,
                    SourceObjectName = $"user{i}@domain.com",
                    Status = AuditStatus.Success,
                    StatusMessage = $"Concurrent test event {i}"
                };

                eventsCreated.Add(auditEvent);
                tasks.Add(_auditService.LogAuditEventAsync(auditEvent));
            }

            // Act - Log all events concurrently
            await Task.WhenAll(tasks);

            // Assert - All events should be logged
            var allEvents = await _auditService.GetAuditEventsAsync();
            var eventsList = allEvents.ToList();

            Assert.AreEqual(10, eventsList.Count, "All 10 events should be logged");

            // Verify each event was logged correctly
            foreach (var originalEvent in eventsCreated)
            {
                var loggedEvent = eventsList.FirstOrDefault(e => e.AuditId == originalEvent.AuditId);
                Assert.IsNotNull(loggedEvent, $"Event {originalEvent.AuditId} should be logged");
                Assert.AreEqual(originalEvent.SessionId, loggedEvent.SessionId);
                Assert.AreEqual(originalEvent.UserPrincipalName, loggedEvent.UserPrincipalName);
            }
        }

        [TestMethod]
        public async Task AuditService_ShouldPreserveEventMetadata()
        {
            // Arrange
            var auditEvent = new AuditEvent
            {
                AuditId = Guid.NewGuid(),
                Timestamp = DateTime.UtcNow,
                SessionId = "test-session",
                UserPrincipalName = "admin@test.com",
                Action = AuditAction.Started,
                ObjectType = ObjectType.User,
                SourceObjectName = "testuser@domain.com",
                TargetObjectName = "testuser@target.com",
                Status = AuditStatus.Success,
                StatusMessage = "Migration started",
                WaveId = "wave-001",
                WaveName = "Test Wave",
                BatchId = "batch-001",
                Duration = TimeSpan.FromMinutes(5),
                SourceEnvironment = "On-Premises",
                TargetEnvironment = "Azure",
                DataSizeBytes = 1024L * 1024 * 500, // 500MB
                TransferRate = 1024.0 * 1024 * 10, // 10MB/s
                Metadata = new Dictionary<string, string>
                {
                    ["MigrationType"] = "UserAccount",
                    ["Priority"] = "High"
                },
                Warnings = new List<string> { "Minor permission issue detected" },
                RetryAttempts = 1,
                ItemsProcessed = 100
            };

            // Act
            await _auditService.LogAuditEventAsync(auditEvent);

            // Assert
            var events = await _auditService.GetAuditEventsAsync();
            var loggedEvent = events.First();

            Assert.AreEqual(auditEvent.AuditId, loggedEvent.AuditId);
            Assert.AreEqual("test-session", loggedEvent.SessionId);
            Assert.AreEqual("admin@test.com", loggedEvent.UserPrincipalName);
            Assert.AreEqual(AuditAction.Started, loggedEvent.Action);
            Assert.AreEqual(ObjectType.User, loggedEvent.ObjectType);
            Assert.AreEqual("testuser@domain.com", loggedEvent.SourceObjectName);
            Assert.AreEqual("testuser@target.com", loggedEvent.TargetObjectName);
            Assert.AreEqual(AuditStatus.Success, loggedEvent.Status);
            Assert.AreEqual("Migration started", loggedEvent.StatusMessage);
            Assert.AreEqual("wave-001", loggedEvent.WaveId);
            Assert.AreEqual("Test Wave", loggedEvent.WaveName);
            Assert.AreEqual("batch-001", loggedEvent.BatchId);
            Assert.AreEqual("On-Premises", loggedEvent.SourceEnvironment);
            Assert.AreEqual("Azure", loggedEvent.TargetEnvironment);
            Assert.AreEqual(1024L * 1024 * 500, loggedEvent.DataSizeBytes);
            Assert.AreEqual(1, loggedEvent.RetryAttempts);
            Assert.AreEqual(100, loggedEvent.ItemsProcessed);

            Assert.IsTrue(loggedEvent.Metadata.ContainsKey("MigrationType"), "Should preserve metadata");
            Assert.AreEqual("UserAccount", loggedEvent.Metadata["MigrationType"]);

            Assert.IsTrue(loggedEvent.Warnings.Contains("Minor permission issue detected"), "Should preserve warnings");
        }
    }
}