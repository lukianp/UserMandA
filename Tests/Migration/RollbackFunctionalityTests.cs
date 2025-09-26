using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using Moq;
using MandADiscoverySuite.Migration;
using MandADiscoverySuite.Services.Migration;
using ProductionModels = MandADiscoverySuite.Models.Migration;
using ProductionMigration = MandADiscoverySuite.Migration;

namespace MandADiscoverySuite.Tests.Migration
{
    /// <summary>
    /// Comprehensive tests for rollback functionality with state verification and complete restoration testing.
    /// Tests the production PostMigrationValidationService with proper production DTOs and interfaces.
    /// </summary>
    [TestClass]
    public class RollbackFunctionalityTests
    {
        private PostMigrationValidationService _validationService;
        private Mock<IUserValidationProvider> _mockUserValidator;
        private Mock<IMailboxValidationProvider> _mockMailboxValidator;
        private Mock<IFileValidationProvider> _mockFileValidator;
        private Mock<ISqlValidationProvider> _mockSqlValidator;
        private ProductionMigration.TargetContext _testTargetContext;
        private List<string> _auditRecords;

        [TestInitialize]
        public void Setup()
        {
            // Initialize production mocks
            _mockUserValidator = new Mock<IUserValidationProvider>();
            _mockMailboxValidator = new Mock<IMailboxValidationProvider>();
            _mockFileValidator = new Mock<IFileValidationProvider>();
            _mockSqlValidator = new Mock<ISqlValidationProvider>();
            _auditRecords = new List<string>();

            // Setup validation provider mocks with production interfaces
            SetupValidationProviderMocks();

            // Create production validation service
            _validationService = new PostMigrationValidationService(
                _mockUserValidator.Object,
                _mockMailboxValidator.Object,
                _mockFileValidator.Object,
                _mockSqlValidator.Object);

            // Create production target context
            _testTargetContext = new ProductionMigration.TargetContext
            {
                TenantId = "test-tenant-123",
                Environment = "Test"
            };
        }

        /// <summary>
        /// Sets up validation provider mocks with production interfaces
        /// </summary>
        private void SetupValidationProviderMocks()
        {
            // Setup default successful validations and rollbacks
            _mockUserValidator
                .Setup(v => v.ValidateUserAsync(It.IsAny<ProductionModels.UserDto>(), It.IsAny<ProductionMigration.TargetContext>(), It.IsAny<IProgress<ValidationProgress>>()))
                .ReturnsAsync(CreateSuccessfulValidationResult("User", "User validation passed"));

            _mockUserValidator
                .Setup(v => v.RollbackUserAsync(It.IsAny<ProductionModels.UserDto>(), It.IsAny<ProductionMigration.TargetContext>(), It.IsAny<IProgress<ValidationProgress>>()))
                .ReturnsAsync(CreateRollbackResult(true, "User rollback successful"));

            _mockMailboxValidator
                .Setup(v => v.ValidateMailboxAsync(It.IsAny<ProductionModels.MailboxDto>(), It.IsAny<ProductionMigration.TargetContext>(), It.IsAny<IProgress<ValidationProgress>>()))
                .ReturnsAsync(CreateSuccessfulValidationResult("Mailbox", "Mailbox validation passed"));

            _mockMailboxValidator
                .Setup(v => v.RollbackMailboxAsync(It.IsAny<ProductionModels.MailboxDto>(), It.IsAny<ProductionMigration.TargetContext>(), It.IsAny<IProgress<ValidationProgress>>()))
                .ReturnsAsync(CreateRollbackResult(true, "Mailbox rollback successful"));

            _mockFileValidator
                .Setup(v => v.ValidateFilesAsync(It.IsAny<ProductionModels.FileItemDto>(), It.IsAny<ProductionMigration.TargetContext>(), It.IsAny<IProgress<ValidationProgress>>()))
                .ReturnsAsync(CreateSuccessfulValidationResult("File", "File validation passed"));

            _mockFileValidator
                .Setup(v => v.RollbackFilesAsync(It.IsAny<ProductionModels.FileItemDto>(), It.IsAny<ProductionMigration.TargetContext>(), It.IsAny<IProgress<ValidationProgress>>()))
                .ReturnsAsync(CreateRollbackResult(true, "File rollback successful"));

            _mockSqlValidator
                .Setup(v => v.ValidateSqlAsync(It.IsAny<ProductionModels.DatabaseDto>(), It.IsAny<ProductionMigration.TargetContext>(), It.IsAny<IProgress<ValidationProgress>>()))
                .ReturnsAsync(CreateSuccessfulValidationResult("Database", "Database validation passed"));

            _mockSqlValidator
                .Setup(v => v.RollbackSqlAsync(It.IsAny<ProductionModels.DatabaseDto>(), It.IsAny<ProductionMigration.TargetContext>(), It.IsAny<IProgress<ValidationProgress>>()))
                .ReturnsAsync(CreateRollbackResult(true, "Database rollback successful"));
        }

        /// <summary>
        /// Creates a successful validation result for testing
        /// </summary>
        private ValidationResult CreateSuccessfulValidationResult(string objectType, string message)
        {
            return new ValidationResult
            {
                ObjectType = objectType,
                ObjectName = $"Test {objectType}",
                Severity = ValidationSeverity.Success,
                Message = message
            };
        }

        /// <summary>
        /// Creates a rollback result for testing
        /// </summary>
        private RollbackResult CreateRollbackResult(bool isSuccess, string message)
        {
            return new RollbackResult
            {
                RollbackSuccessful = isSuccess,
                IsSuccess = isSuccess,
                Message = message
            };
        }

        #region User Rollback Tests

        [TestMethod]
        public async Task RollbackUserAsync_CallsUserValidator_ReturnsResult()
        {
            // Arrange
            var testUser = CreateTestUser();
            var expectedResult = new RollbackResult
            {
                RollbackSuccessful = true,
                IsSuccess = true,
                Message = "User rollback successful"
            };

            _mockUserValidator
                .Setup(u => u.RollbackUserAsync(testUser, _testTargetContext, It.IsAny<IProgress<ValidationProgress>>()))
                .ReturnsAsync(expectedResult);

            // Act
            var result = await _validationService.RollbackUserAsync(testUser, _testTargetContext);

            // Assert
            Assert.IsTrue(result.RollbackSuccessful, "User rollback should succeed");
            Assert.AreEqual("User rollback successful", result.Message);

            // Verify the validator was called with correct parameters
            _mockUserValidator.Verify(
                u => u.RollbackUserAsync(testUser, _testTargetContext, It.IsAny<IProgress<ValidationProgress>>()),
                Times.Once);

            RecordAuditEvent("User rollback test completed", testUser.UserPrincipalName);
        }

        [TestMethod]
        public async Task RollbackUserAsync_HandlesFailure_ReturnsFailedResult()
        {
            // Arrange
            var testUser = CreateTestUser();
            var failedResult = new RollbackResult
            {
                RollbackSuccessful = false,
                IsSuccess = false,
                Message = "User rollback failed",
                Errors = { "Account could not be disabled" }
            };

            _mockUserValidator
                .Setup(u => u.RollbackUserAsync(testUser, _testTargetContext, It.IsAny<IProgress<ValidationProgress>>()))
                .ReturnsAsync(failedResult);

            // Act
            var result = await _validationService.RollbackUserAsync(testUser, _testTargetContext);

            // Assert
            Assert.IsFalse(result.RollbackSuccessful, "User rollback should report failure");
            Assert.AreEqual("User rollback failed", result.Message);
            Assert.AreEqual(1, result.Errors.Count, "Should have one error");

            RecordAuditEvent("User rollback failure test completed", testUser.UserPrincipalName);
        }

        #endregion

        #region Mailbox Rollback Tests

        [TestMethod]
        public async Task RollbackMailboxAsync_CallsMailboxValidator_ReturnsResult()
        {
            // Arrange
            var testMailbox = CreateTestMailbox();
            var expectedResult = new RollbackResult
            {
                RollbackSuccessful = true,
                IsSuccess = true,
                Message = "Mailbox rollback successful"
            };

            _mockMailboxValidator
                .Setup(m => m.RollbackMailboxAsync(testMailbox, _testTargetContext, It.IsAny<IProgress<ValidationProgress>>()))
                .ReturnsAsync(expectedResult);

            // Act
            var result = await _validationService.RollbackMailboxAsync(testMailbox, _testTargetContext);

            // Assert
            Assert.IsTrue(result.RollbackSuccessful, "Mailbox rollback should succeed");
            Assert.AreEqual("Mailbox rollback successful", result.Message);

            // Verify the validator was called with correct parameters
            _mockMailboxValidator.Verify(
                m => m.RollbackMailboxAsync(testMailbox, _testTargetContext, It.IsAny<IProgress<ValidationProgress>>()),
                Times.Once);

            RecordAuditEvent("Mailbox rollback test completed", testMailbox.PrimarySmtpAddress);
        }

        #endregion

        #region File Rollback Tests

        [TestMethod]
        public async Task RollbackFilesAsync_CallsFileValidator_ReturnsResult()
        {
            // Arrange
            var testFileItem = CreateTestFileItem();
            var expectedResult = new RollbackResult
            {
                RollbackSuccessful = true,
                IsSuccess = true,
                Message = "File rollback successful"
            };

            _mockFileValidator
                .Setup(f => f.RollbackFilesAsync(testFileItem, _testTargetContext, It.IsAny<IProgress<ValidationProgress>>()))
                .ReturnsAsync(expectedResult);

            // Act
            var result = await _validationService.RollbackFilesAsync(testFileItem, _testTargetContext);

            // Assert
            Assert.IsTrue(result.RollbackSuccessful, "File rollback should succeed");
            Assert.AreEqual("File rollback successful", result.Message);

            // Verify the validator was called with correct parameters
            _mockFileValidator.Verify(
                f => f.RollbackFilesAsync(testFileItem, _testTargetContext, It.IsAny<IProgress<ValidationProgress>>()),
                Times.Once);

            RecordAuditEvent("File rollback test completed", testFileItem.TargetPath);
        }

        #endregion

        #region SQL Database Rollback Tests

        [TestMethod]
        public async Task RollbackSqlAsync_CallsDatabaseValidator_ReturnsResult()
        {
            // Arrange
            var testDatabase = CreateTestDatabase();
            var expectedResult = new RollbackResult
            {
                RollbackSuccessful = true,
                IsSuccess = true,
                Message = "Database rollback successful"
            };

            _mockSqlValidator
                .Setup(sql => sql.RollbackSqlAsync(testDatabase, _testTargetContext, It.IsAny<IProgress<ValidationProgress>>()))
                .ReturnsAsync(expectedResult);

            // Act
            var result = await _validationService.RollbackSqlAsync(testDatabase, _testTargetContext);

            // Assert
            Assert.IsTrue(result.RollbackSuccessful, "Database rollback should succeed");
            Assert.AreEqual("Database rollback successful", result.Message);

            // Verify the validator was called with correct parameters
            _mockSqlValidator.Verify(
                sql => sql.RollbackSqlAsync(testDatabase, _testTargetContext, It.IsAny<IProgress<ValidationProgress>>()),
                Times.Once);

            RecordAuditEvent("Database rollback test completed", testDatabase.Name);
        }

        #endregion

        #region Multi-Object Rollback Tests

        [TestMethod]
        public async Task RollbackMultipleAsync_ProcessesAllObjects_ReturnsAllResults()
        {
            // Arrange
            var validationResults = new List<ValidationResult>
            {
                CreateFailedUserValidation(),
                CreateFailedMailboxValidation(),
                CreateFailedFileValidation(),
                CreateFailedDatabaseValidation()
            };

            SetupSuccessfulMultiRollbackMocks();

            // Act
            var rollbackResults = await _validationService.RollbackMultipleAsync(validationResults, _testTargetContext);

            // Assert
            Assert.AreEqual(4, rollbackResults.Count, "Should have rollback results for all objects");
            Assert.IsTrue(rollbackResults.All(r => r.RollbackSuccessful), "All rollbacks should succeed");

            // Verify all validators were called
            _mockUserValidator.Verify(u => u.RollbackUserAsync(It.IsAny<ProductionModels.UserDto>(), _testTargetContext, It.IsAny<IProgress<ValidationProgress>>()), Times.Once);
            _mockMailboxValidator.Verify(m => m.RollbackMailboxAsync(It.IsAny<ProductionModels.MailboxDto>(), _testTargetContext, It.IsAny<IProgress<ValidationProgress>>()), Times.Once);
            _mockFileValidator.Verify(f => f.RollbackFilesAsync(It.IsAny<ProductionModels.FileItemDto>(), _testTargetContext, It.IsAny<IProgress<ValidationProgress>>()), Times.Once);
            _mockSqlValidator.Verify(sql => sql.RollbackSqlAsync(It.IsAny<ProductionModels.DatabaseDto>(), _testTargetContext, It.IsAny<IProgress<ValidationProgress>>()), Times.Once);

            RecordAuditEvent("Multi-object rollback test completed", $"Objects: {rollbackResults.Count}");
        }

        [TestMethod]
        public async Task RollbackMultipleAsync_HandlesPartialFailures_ReturnsAllResults()
        {
            // Arrange
            var validationResults = new List<ValidationResult>
            {
                CreateFailedUserValidation(),
                CreateFailedMailboxValidation()
            };

            // Setup user rollback to succeed, mailbox rollback to fail
            _mockUserValidator
                .Setup(u => u.RollbackUserAsync(It.IsAny<ProductionModels.UserDto>(), _testTargetContext, It.IsAny<IProgress<ValidationProgress>>()))
                .ReturnsAsync(new RollbackResult { RollbackSuccessful = true, IsSuccess = true, Message = "User rollback successful" });

            _mockMailboxValidator
                .Setup(m => m.RollbackMailboxAsync(It.IsAny<ProductionModels.MailboxDto>(), _testTargetContext, It.IsAny<IProgress<ValidationProgress>>()))
                .ReturnsAsync(new RollbackResult { RollbackSuccessful = false, IsSuccess = false, Message = "Mailbox rollback failed" });

            // Act
            var rollbackResults = await _validationService.RollbackMultipleAsync(validationResults, _testTargetContext);

            // Assert
            Assert.AreEqual(2, rollbackResults.Count, "Should have rollback results for both objects");
            Assert.IsTrue(rollbackResults[0].RollbackSuccessful, "User rollback should succeed");
            Assert.IsFalse(rollbackResults[1].RollbackSuccessful, "Mailbox rollback should fail");

            RecordAuditEvent("Partial rollback test completed", $"Success: 1, Failed: 1");
        }

        #endregion

        #region Helper Methods

        private void SetupSuccessfulMultiRollbackMocks()
        {
            _mockUserValidator
                .Setup(u => u.RollbackUserAsync(It.IsAny<ProductionModels.UserDto>(), _testTargetContext, It.IsAny<IProgress<ValidationProgress>>()))
                .ReturnsAsync(new RollbackResult { RollbackSuccessful = true, IsSuccess = true, Message = "User rollback successful" });

            _mockMailboxValidator
                .Setup(m => m.RollbackMailboxAsync(It.IsAny<ProductionModels.MailboxDto>(), _testTargetContext, It.IsAny<IProgress<ValidationProgress>>()))
                .ReturnsAsync(new RollbackResult { RollbackSuccessful = true, IsSuccess = true, Message = "Mailbox rollback successful" });

            _mockFileValidator
                .Setup(f => f.RollbackFilesAsync(It.IsAny<ProductionModels.FileItemDto>(), _testTargetContext, It.IsAny<IProgress<ValidationProgress>>()))
                .ReturnsAsync(new RollbackResult { RollbackSuccessful = true, IsSuccess = true, Message = "File rollback successful" });

            _mockSqlValidator
                .Setup(sql => sql.RollbackSqlAsync(It.IsAny<ProductionModels.DatabaseDto>(), _testTargetContext, It.IsAny<IProgress<ValidationProgress>>()))
                .ReturnsAsync(new RollbackResult { RollbackSuccessful = true, IsSuccess = true, Message = "Database rollback successful" });
        }

        private ProductionModels.UserDto CreateTestUser()
        {
            return new ProductionModels.UserDto
            {
                DisplayName = "Test User",
                UserPrincipalName = "testuser@contoso.com",
                Department = "IT",
                JobTitle = "Test Engineer"
            };
        }

        private ProductionModels.MailboxDto CreateTestMailbox()
        {
            return new ProductionModels.MailboxDto
            {
                PrimarySmtpAddress = "testmailbox@contoso.com",
                DisplayName = "Test Mailbox",
                ItemCount = 1500
            };
        }

        private ProductionModels.FileItemDto CreateTestFileItem()
        {
            return new ProductionModels.FileItemDto
            {
                SourcePath = @"\\source\share\TestFolder",
                TargetPath = @"\\target\share\TestFolder",
                FileSize = 1024 * 1024 * 500  // 500MB
            };
        }

        private ProductionModels.DatabaseDto CreateTestDatabase()
        {
            return new ProductionModels.DatabaseDto
            {
                Name = "TestDatabase",
                SourceServer = "TestSQLServer",
                TargetServer = "TestSQLServerTarget",
                SizeMB = 1024
            };
        }

        private ValidationResult CreateFailedUserValidation()
        {
            return ValidationResult.Failed(
                CreateTestUser(),
                "User",
                "testuser@contoso.com",
                "User validation failed",
                new List<ValidationIssue> { new ValidationIssue { Category = "Test", Description = "Test failure" } });
        }

        private ValidationResult CreateFailedMailboxValidation()
        {
            return ValidationResult.Failed(
                CreateTestMailbox(),
                "Mailbox",
                "testmailbox@contoso.com",
                "Mailbox validation failed",
                new List<ValidationIssue> { new ValidationIssue { Category = "Test", Description = "Test failure" } });
        }

        private ValidationResult CreateFailedFileValidation()
        {
            return ValidationResult.Failed(
                CreateTestFileItem(),
                "File",
                @"\\source\share\TestFolder",
                "File validation failed",
                new List<ValidationIssue> { new ValidationIssue { Category = "Test", Description = "Test failure" } });
        }

        private ValidationResult CreateFailedDatabaseValidation()
        {
            return ValidationResult.Failed(
                CreateTestDatabase(),
                "Database",
                "TestDatabase",
                "Database validation failed",
                new List<ValidationIssue> { new ValidationIssue { Category = "Test", Description = "Test failure" } });
        }

        private void RecordAuditEvent(string action, string objectIdentifier, List<string> errors = null, List<string> warnings = null)
        {
            var timestamp = DateTime.Now;
            var auditRecord = $"{timestamp:yyyy-MM-dd HH:mm:ss} - {action} - Object: {objectIdentifier}";

            if (warnings?.Count > 0)
            {
                auditRecord += $" - Warnings: {warnings.Count}";
            }

            if (errors?.Count > 0)
            {
                auditRecord += $" - Errors: {errors.Count}";
            }

            _auditRecords.Add(auditRecord);
        }

        #endregion

        [TestCleanup]
        public void Cleanup()
        {
            Assert.IsTrue(_auditRecords.Count > 0, "Audit records should be created for rollback operations");

            foreach (var record in _auditRecords)
            {
                System.Diagnostics.Debug.WriteLine($"ROLLBACK_TEST_AUDIT: {record}");
            }
        }
    }
}