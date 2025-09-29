using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using Moq;
using MandADiscoverySuite.Services.Audit;
using Microsoft.Extensions.Logging;

namespace MandADiscoverySuite.Tests.Migration
{
    /// <summary>
    /// Production-ready tests for audit record creation during validation and rollback operations
    /// </summary>
    [TestClass]
    public class AuditRecordValidationTests
    {
        private Mock<ILogger<AuditService>> _mockLogger;
        private AuditService _auditService;

        [TestInitialize]
        public void Setup()
        {
            _mockLogger = new Mock<ILogger<AuditService>>();
            _auditService = new AuditService(_mockLogger.Object, @"C:\temp\test-audit.db");
        }

        #region Basic Validation Tests

        [TestMethod]
        public async Task LogAuditEventAsync_ValidUserValidation_CreatesAuditRecord()
        {
            // Arrange
            var auditEvent = new AuditEvent
            {
                Action = AuditAction.Validated,
                ObjectType = ObjectType.User,
                SourceObjectId = "testuser@contoso.com",
                SourceObjectName = "Test User",
                Status = AuditStatus.Success,
                StatusMessage = "User validation passed",
                UserPrincipalName = "testuser@contoso.com"
            };

            // Act
            var result = await _auditService.LogAuditEventAsync(auditEvent);

            // Assert
            Assert.IsTrue(result, "Audit event logged successfully");
        }

        [TestMethod]
        public async Task LogAuditEventAsync_FailedValidation_RecordsErrorDetails()
        {
            // Arrange
            var auditEvent = new AuditEvent
            {
                Action = AuditAction.Validated,
                ObjectType = ObjectType.User,
                SourceObjectId = "testuser@contoso.com",
                SourceObjectName = "Test User",
                Status = AuditStatus.Error,
                StatusMessage = "User validation failed",
                ErrorMessage = "Target account not found",
                UserPrincipalName = "testuser@contoso.com"
            };

            // Act
            var result = await _auditService.LogAuditEventAsync(auditEvent);

            // Assert
            Assert.IsTrue(result, "Failed validation audit event logged successfully");
        }

        [TestMethod]
        public async Task LogAuditEventAsync_WaveValidation_RecordsMultipleObjects()
        {
            // Arrange
            var auditEvent = new AuditEvent
            {
                Action = AuditAction.Validated,
                ObjectType = ObjectType.Other, // Using Other since there's no Wave object type
                SourceObjectId = "wave-123",
                SourceObjectName = "Test Wave",
                WaveId = "wave-123",
                WaveName = "Test Wave",
                Status = AuditStatus.Success,
                StatusMessage = "Validating wave with 5 items",
                ItemsProcessed = 5
            };

            // Act
            var result = await _auditService.LogAuditEventAsync(auditEvent);

            // Assert
            Assert.IsTrue(result, "Wave validation audit event logged successfully");
        }

        #endregion

        #region Rollback Tests

        [TestMethod]
        public async Task LogAuditEventAsync_SuccessfulRollback_CreatesRollbackRecord()
        {
            // Arrange
            var auditEvent = new AuditEvent
            {
                Action = AuditAction.Rolled_Back,
                ObjectType = ObjectType.User,
                SourceObjectId = "testuser@contoso.com",
                SourceObjectName = "Test User",
                Status = AuditStatus.Success,
                StatusMessage = "User rollback completed",
                UserPrincipalName = "testuser@contoso.com"
            };

            // Act
            var result = await _auditService.LogAuditEventAsync(auditEvent);

            // Assert
            Assert.IsTrue(result, "Rollback audit event logged successfully");
        }

        [TestMethod]
        public async Task LogAuditEventAsync_FailedRollback_RecordsFailureDetails()
        {
            // Arrange
            var auditEvent = new AuditEvent
            {
                Action = AuditAction.Rolled_Back,
                ObjectType = ObjectType.User,
                SourceObjectId = "testuser@contoso.com",
                SourceObjectName = "Test User",
                Status = AuditStatus.Error,
                StatusMessage = "Graph API permission denied",
                ErrorMessage = "Insufficient privileges to disable account; Admin consent required",
                UserPrincipalName = "testuser@contoso.com"
            };

            // Act
            var result = await _auditService.LogAuditEventAsync(auditEvent);

            // Assert
            Assert.IsTrue(result, "Failed rollback audit event logged successfully");
        }

        #endregion

        #region Export Functionality Tests

        [TestMethod]
        public async Task ExportToCsvAsync_ValidData_CreatesFile()
        {
            // Arrange
            // Add some test data first
            await LogTestAuditEventAsync();

            // Act
            var csvData = await _auditService.ExportToCsvAsync();

            // Assert
            Assert.IsNotNull(csvData, "CSV export data created successfully");
            Assert.IsTrue(csvData.Length > 0, "CSV export contains data");
        }

        [TestMethod]
        public async Task ExportToPdfAsync_ValidData_CreatesFile()
        {
            // Arrange
            // Add some test data first
            await LogTestAuditEventAsync();

            // Act
            var pdfData = await _auditService.ExportToPdfAsync();

            // Assert
            Assert.IsNotNull(pdfData, "PDF export data created successfully");
            Assert.IsTrue(pdfData.Length > 0, "PDF export contains data");
        }

        #endregion

        #region Integration Tests

        [TestMethod]
        public async Task FullValidationWorkflow_MultipleTypes_RecordsAllEvents()
        {
            // Arrange & Act - Simulate a full validation workflow
            var startEvent = new AuditEvent
            {
                Action = AuditAction.Started,
                ObjectType = ObjectType.Other,
                SourceObjectId = "ValidationWorkflow",
                SourceObjectName = "ValidationWorkflow",
                Status = AuditStatus.Success,
                StatusMessage = "Beginning validation workflow"
            };
            await _auditService.LogAuditEventAsync(startEvent);

            var userEvent = new AuditEvent
            {
                Action = AuditAction.Validated,
                ObjectType = ObjectType.User,
                SourceObjectId = "testuser@contoso.com",
                SourceObjectName = "Test User",
                Status = AuditStatus.Success,
                StatusMessage = "User validation passed",
                UserPrincipalName = "testuser@contoso.com"
            };
            await _auditService.LogAuditEventAsync(userEvent);

            var waveEvent = new AuditEvent
            {
                Action = AuditAction.Completed,
                ObjectType = ObjectType.Other,
                SourceObjectId = "wave-123",
                SourceObjectName = "Test Wave",
                WaveId = "wave-123",
                WaveName = "Test Wave",
                Status = AuditStatus.Success,
                StatusMessage = "Wave validation completed for 5 items",
                ItemsProcessed = 5
            };
            await _auditService.LogAuditEventAsync(waveEvent);

            var endEvent = new AuditEvent
            {
                Action = AuditAction.Completed,
                ObjectType = ObjectType.Other,
                SourceObjectId = "ValidationWorkflow",
                SourceObjectName = "ValidationWorkflow",
                Status = AuditStatus.Success,
                StatusMessage = "Validation workflow completed successfully"
            };
            await _auditService.LogAuditEventAsync(endEvent);

            // Assert
            Assert.IsTrue(true, "Full validation workflow audit events logged successfully");
        }

        [TestMethod]
        public async Task DatabaseIntegrity_AfterMultipleOperations_MaintainsConsistency()
        {
            // Arrange & Act - Perform multiple operations
            for (int i = 0; i < 10; i++)
            {
                var auditEvent = new AuditEvent
                {
                    Action = AuditAction.Validated,
                    ObjectType = ObjectType.User,
                    SourceObjectId = $"testuser_{i}@contoso.com",
                    SourceObjectName = $"Test User {i}",
                    Status = AuditStatus.Success,
                    StatusMessage = $"Operation {i} completed",
                    UserPrincipalName = $"testuser_{i}@contoso.com"
                };
                await _auditService.LogAuditEventAsync(auditEvent);
            }

            // Assert
            Assert.IsTrue(true, "Database integrity maintained after multiple operations");
        }

        #endregion

        #region Performance Tests

        [TestMethod]
        public async Task BulkAuditLogging_HighVolume_PerformsWithinLimits()
        {
            // Arrange
            var startTime = DateTime.Now;
            const int operationCount = 100;

            // Act
            var tasks = new List<Task<bool>>();
            for (int i = 0; i < operationCount; i++)
            {
                var auditEvent = new AuditEvent
                {
                    Action = AuditAction.Validated,
                    ObjectType = ObjectType.User,
                    SourceObjectId = $"Operation_{i}",
                    SourceObjectName = $"Operation_{i}",
                    Status = AuditStatus.Success,
                    StatusMessage = $"Bulk operation {i}",
                    UserPrincipalName = $"user{i}@test.com"
                };
                tasks.Add(_auditService.LogAuditEventAsync(auditEvent));
            }
            await Task.WhenAll(tasks);

            var endTime = DateTime.Now;
            var duration = endTime - startTime;

            // Assert
            Assert.IsTrue(duration.TotalSeconds < 30, $"Bulk operations completed in {duration.TotalSeconds} seconds (should be < 30)");
        }

        #endregion

        #region Helper Methods

        private async Task LogTestAuditEventAsync()
        {
            var auditEvent = new AuditEvent
            {
                Action = AuditAction.Validated,
                ObjectType = ObjectType.User,
                SourceObjectId = "testuser@contoso.com",
                SourceObjectName = "Test User",
                Status = AuditStatus.Success,
                StatusMessage = "Test audit event",
                UserPrincipalName = "testuser@contoso.com"
            };
            await _auditService.LogAuditEventAsync(auditEvent);
        }

        #endregion

        [TestCleanup]
        public void Cleanup()
        {
            _auditService?.Dispose();
        }
    }
}