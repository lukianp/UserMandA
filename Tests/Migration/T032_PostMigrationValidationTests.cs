using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Graph;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using Moq;
using MandADiscoverySuite.Migration;

namespace MandADiscoverySuite.Tests.Migration
{
    /// <summary>
    /// Comprehensive tests for T-032: Post-Migration Validation and Rollback Implementation
    /// </summary>
    [TestClass]
    public class T032_PostMigrationValidationTests
    {
        private PostMigrationValidationService _validationService;
        private Mock<IUserValidationProvider> _mockUserValidator;
        private Mock<IMailboxValidationProvider> _mockMailboxValidator;
        private Mock<IFileValidationProvider> _mockFileValidator;
        private Mock<ISqlValidationProvider> _mockSqlValidator;
        private TargetContext _testTargetContext;
        private List<string> _auditRecords;

        [TestInitialize]
        public void Setup()
        {
            _mockUserValidator = new Mock<IUserValidationProvider>();
            _mockMailboxValidator = new Mock<IMailboxValidationProvider>();
            _mockFileValidator = new Mock<IFileValidationProvider>();
            _mockSqlValidator = new Mock<ISqlValidationProvider>();
            _auditRecords = new List<string>();

            _validationService = new PostMigrationValidationService(
                _mockUserValidator.Object,
                _mockMailboxValidator.Object,
                _mockFileValidator.Object,
                _mockSqlValidator.Object);

            _testTargetContext = new TargetContext
            {
                TenantId = "test-tenant-123",
                Environment = "Test"
            };
        }

        #region User Validation Tests

        [TestMethod]
        public async Task ValidateUserAsync_Success_ReturnsSuccessResult()
        {
            // Arrange
            var testUser = CreateTestUser();
            var expectedResult = ValidationResult.Success(testUser, "User", testUser.DisplayName);
            
            _mockUserValidator
                .Setup(x => x.ValidateUserAsync(testUser, _testTargetContext, It.IsAny<IProgress<ValidationProgress>>()))
                .ReturnsAsync(expectedResult);

            // Act
            var result = await _validationService.ValidateUserAsync(testUser, _testTargetContext);

            // Assert
            Assert.AreEqual(ValidationSeverity.Success, result.Severity);
            Assert.AreEqual("User", result.ObjectType);
            Assert.AreEqual(testUser.DisplayName, result.ObjectName);
            Assert.AreEqual(0, result.Issues.Count);
            RecordAuditEvent("User validation passed", testUser.UserPrincipalName);
        }

        [TestMethod]
        public async Task ValidateUserAsync_WithValidationIssues_ReturnsFailureResult()
        {
            // Arrange
            var testUser = CreateTestUser();
            var issues = new List<ValidationIssue>
            {
                new ValidationIssue
                {
                    Severity = ValidationSeverity.Error,
                    Category = "Account Existence",
                    Description = "Target account not found",
                    RecommendedAction = "Verify migration completed"
                }
            };
            var expectedResult = ValidationResult.Failed(testUser, "User", testUser.DisplayName, "Validation failed", issues);

            _mockUserValidator
                .Setup(x => x.ValidateUserAsync(testUser, _testTargetContext, It.IsAny<IProgress<ValidationProgress>>()))
                .ReturnsAsync(expectedResult);

            // Act
            var result = await _validationService.ValidateUserAsync(testUser, _testTargetContext);

            // Assert
            Assert.AreEqual(ValidationSeverity.Error, result.Severity);
            Assert.AreEqual(1, result.Issues.Count);
            Assert.AreEqual("Account Existence", result.Issues[0].Category);
            RecordAuditEvent("User validation failed", testUser.UserPrincipalName, result.Issues);
        }

        [TestMethod]
        public async Task ValidateUserAsync_ServiceException_ReturnsCriticalError()
        {
            // Arrange
            var testUser = CreateTestUser();
            _mockUserValidator
                .Setup(x => x.ValidateUserAsync(testUser, _testTargetContext, It.IsAny<IProgress<ValidationProgress>>()))
                .ThrowsAsync(new InvalidOperationException("Graph API connection failed"));

            // Act
            var result = await _validationService.ValidateUserAsync(testUser, _testTargetContext);

            // Assert
            Assert.AreEqual(ValidationSeverity.Critical, result.Severity);
            Assert.AreEqual(1, result.Issues.Count);
            Assert.AreEqual("Service Error", result.Issues[0].Category);
            Assert.IsTrue(result.Issues[0].Description.Contains("Graph API connection failed"));
            RecordAuditEvent("User validation service error", testUser.UserPrincipalName, result.Issues);
        }

        #endregion

        #region Mailbox Validation Tests

        [TestMethod]
        public async Task ValidateMailboxAsync_Success_ReturnsSuccessResult()
        {
            // Arrange
            var testMailbox = CreateTestMailbox();
            var expectedResult = ValidationResult.Success(testMailbox, "Mailbox", testMailbox.PrimarySmtpAddress);

            _mockMailboxValidator
                .Setup(x => x.ValidateMailboxAsync(testMailbox, _testTargetContext, It.IsAny<IProgress<ValidationProgress>>()))
                .ReturnsAsync(expectedResult);

            // Act
            var result = await _validationService.ValidateMailboxAsync(testMailbox, _testTargetContext);

            // Assert
            Assert.AreEqual(ValidationSeverity.Success, result.Severity);
            Assert.AreEqual("Mailbox", result.ObjectType);
            RecordAuditEvent("Mailbox validation passed", testMailbox.PrimarySmtpAddress);
        }

        [TestMethod]
        public async Task ValidateMailboxAsync_ItemCountMismatch_ReturnsErrorResult()
        {
            // Arrange
            var testMailbox = CreateTestMailbox();
            var issues = new List<ValidationIssue>
            {
                new ValidationIssue
                {
                    Severity = ValidationSeverity.Error,
                    Category = "Item Count",
                    Description = "Source: 1500 items, Target: 1450 items (50 items missing)",
                    RecommendedAction = "Re-run migration for missing items"
                }
            };
            var expectedResult = ValidationResult.Failed(testMailbox, "Mailbox", testMailbox.PrimarySmtpAddress, "Item count mismatch", issues);

            _mockMailboxValidator
                .Setup(x => x.ValidateMailboxAsync(testMailbox, _testTargetContext, It.IsAny<IProgress<ValidationProgress>>()))
                .ReturnsAsync(expectedResult);

            // Act
            var result = await _validationService.ValidateMailboxAsync(testMailbox, _testTargetContext);

            // Assert
            Assert.AreEqual(ValidationSeverity.Error, result.Severity);
            Assert.IsTrue(result.Issues[0].Description.Contains("50 items missing"));
            RecordAuditEvent("Mailbox validation failed", testMailbox.PrimarySmtpAddress, result.Issues);
        }

        #endregion

        #region File Validation Tests

        [TestMethod]
        public async Task ValidateFilesAsync_ChecksumMismatch_ReturnsErrorResult()
        {
            // Arrange
            var testFileItem = CreateTestFileItem();
            var issues = new List<ValidationIssue>
            {
                new ValidationIssue
                {
                    Severity = ValidationSeverity.Error,
                    Category = "File Integrity",
                    Description = "Checksum mismatch for file: important-document.docx",
                    RecommendedAction = "Re-copy the file and verify integrity"
                }
            };
            var expectedResult = ValidationResult.Failed(testFileItem, "File", testFileItem.SourcePath, "Checksum validation failed", issues);

            _mockFileValidator
                .Setup(x => x.ValidateFilesAsync(testFileItem, _testTargetContext, It.IsAny<IProgress<ValidationProgress>>()))
                .ReturnsAsync(expectedResult);

            // Act
            var result = await _validationService.ValidateFilesAsync(testFileItem, _testTargetContext);

            // Assert
            Assert.AreEqual(ValidationSeverity.Error, result.Severity);
            Assert.IsTrue(result.Issues[0].Description.Contains("Checksum mismatch"));
            RecordAuditEvent("File validation failed", testFileItem.SourcePath, result.Issues);
        }

        [TestMethod]
        public async Task ValidateFilesAsync_AclPreservation_ValidatesPermissions()
        {
            // Arrange
            var testFileItem = CreateTestFileItem();
            var issues = new List<ValidationIssue>
            {
                new ValidationIssue
                {
                    Severity = ValidationSeverity.Warning,
                    Category = "ACL Preservation",
                    Description = "Some ACL entries could not be preserved due to target domain differences",
                    RecommendedAction = "Manually review and adjust permissions"
                }
            };
            var expectedResult = new ValidationResult
            {
                ValidatedObject = testFileItem,
                ObjectType = "File",
                ObjectName = testFileItem.SourcePath,
                Severity = ValidationSeverity.Warning,
                Message = "File copied with permission warnings",
                Issues = issues
            };

            _mockFileValidator
                .Setup(x => x.ValidateFilesAsync(testFileItem, _testTargetContext, It.IsAny<IProgress<ValidationProgress>>()))
                .ReturnsAsync(expectedResult);

            // Act
            var result = await _validationService.ValidateFilesAsync(testFileItem, _testTargetContext);

            // Assert
            Assert.AreEqual(ValidationSeverity.Warning, result.Severity);
            Assert.AreEqual("ACL Preservation", result.Issues[0].Category);
            RecordAuditEvent("File validation completed with warnings", testFileItem.SourcePath, result.Issues);
        }

        #endregion

        #region SQL Database Validation Tests

        [TestMethod]
        public async Task ValidateSqlAsync_DbccCheckDbSuccess_ReturnsSuccessResult()
        {
            // Arrange
            var testDatabase = CreateTestDatabase();
            var expectedResult = ValidationResult.Success(testDatabase, "Database", testDatabase.Name, "DBCC CHECKDB completed without errors");

            _mockSqlValidator
                .Setup(x => x.ValidateSqlAsync(testDatabase, _testTargetContext, It.IsAny<IProgress<ValidationProgress>>()))
                .ReturnsAsync(expectedResult);

            // Act
            var result = await _validationService.ValidateSqlAsync(testDatabase, _testTargetContext);

            // Assert
            Assert.AreEqual(ValidationSeverity.Success, result.Severity);
            Assert.AreEqual("Database", result.ObjectType);
            Assert.IsTrue(result.Message.Contains("DBCC CHECKDB"));
            RecordAuditEvent("Database validation passed", testDatabase.Name);
        }

        [TestMethod]
        public async Task ValidateSqlAsync_DataConsistencyErrors_ReturnsErrorResult()
        {
            // Arrange
            var testDatabase = CreateTestDatabase();
            var issues = new List<ValidationIssue>
            {
                new ValidationIssue
                {
                    Severity = ValidationSeverity.Error,
                    Category = "Data Consistency",
                    Description = "DBCC CHECKDB found 3 consistency errors in table Customer",
                    RecommendedAction = "Run DBCC CHECKDB with REPAIR_ALLOW_DATA_LOSS or restore from backup"
                }
            };
            var expectedResult = ValidationResult.Failed(testDatabase, "Database", testDatabase.Name, "Database consistency errors found", issues);

            _mockSqlValidator
                .Setup(x => x.ValidateSqlAsync(testDatabase, _testTargetContext, It.IsAny<IProgress<ValidationProgress>>()))
                .ReturnsAsync(expectedResult);

            // Act
            var result = await _validationService.ValidateSqlAsync(testDatabase, _testTargetContext);

            // Assert
            Assert.AreEqual(ValidationSeverity.Error, result.Severity);
            Assert.IsTrue(result.Issues[0].Description.Contains("consistency errors"));
            RecordAuditEvent("Database validation failed", testDatabase.Name, result.Issues);
        }

        #endregion

        #region Wave Validation Tests

        [TestMethod]
        public async Task ValidateWaveAsync_MixedResults_ReturnsCompleteResults()
        {
            // Arrange
            var wave = CreateTestWave();
            var progressReports = new List<ValidationProgress>();

            SetupMockValidators(wave);

            // Act
            var results = await _validationService.ValidateWaveAsync(wave, _testTargetContext, 
                new Progress<ValidationProgress>(p => progressReports.Add(p)));

            // Assert
            Assert.AreEqual(4, results.Count); // 1 user + 1 mailbox + 1 file + 1 database
            Assert.IsTrue(progressReports.Any(p => p.PercentageComplete == 100));
            Assert.IsTrue(results.Any(r => r.Severity == ValidationSeverity.Success));
            Assert.IsTrue(results.Any(r => r.Severity == ValidationSeverity.Error));
            
            // Verify audit records for wave validation
            RecordAuditEvent("Wave validation completed", $"Total objects: {results.Count}");
        }

        [TestMethod]
        public async Task ValidateWaveAsync_WaveValidationException_ReturnsErrorResult()
        {
            // Arrange
            var wave = CreateTestWave();
            _mockUserValidator
                .Setup(x => x.ValidateUserAsync(It.IsAny<UserDto>(), It.IsAny<TargetContext>(), It.IsAny<IProgress<ValidationProgress>>()))
                .ThrowsAsync(new InvalidOperationException("Critical system failure"));

            // Act
            var results = await _validationService.ValidateWaveAsync(wave, _testTargetContext);

            // Assert
            Assert.IsTrue(results.Any(r => r.Severity == ValidationSeverity.Critical));
            Assert.IsTrue(results.Any(r => r.ObjectType == "Wave"));
            RecordAuditEvent("Wave validation system error", wave.ToString());
        }

        #endregion

        #region Rollback Tests

        [TestMethod]
        public async Task RollbackUserAsync_Success_ReturnsSuccessResult()
        {
            // Arrange
            var testUser = CreateTestUser();
            var expectedResult = RollbackResult.Succeeded("User rollback completed");

            _mockUserValidator
                .Setup(x => x.RollbackUserAsync(testUser, _testTargetContext, It.IsAny<IProgress<ValidationProgress>>()))
                .ReturnsAsync(expectedResult);

            // Act
            var result = await _validationService.RollbackUserAsync(testUser, _testTargetContext);

            // Assert
            Assert.IsTrue(result.Success);
            Assert.AreEqual("User rollback completed", result.Message);
            RecordAuditEvent("User rollback successful", testUser.UserPrincipalName);
        }

        [TestMethod]
        public async Task RollbackUserAsync_PartialSuccess_ReturnsResultWithWarnings()
        {
            // Arrange
            var testUser = CreateTestUser();
            var expectedResult = new RollbackResult
            {
                Success = true,
                Message = "Rollback completed with warnings",
                Warnings = { "Could not remove from some groups due to permissions" }
            };

            _mockUserValidator
                .Setup(x => x.RollbackUserAsync(testUser, _testTargetContext, It.IsAny<IProgress<ValidationProgress>>()))
                .ReturnsAsync(expectedResult);

            // Act
            var result = await _validationService.RollbackUserAsync(testUser, _testTargetContext);

            // Assert
            Assert.IsTrue(result.Success);
            Assert.AreEqual(1, result.Warnings.Count);
            Assert.IsTrue(result.Warnings[0].Contains("permissions"));
            RecordAuditEvent("User rollback completed with warnings", testUser.UserPrincipalName, warnings: result.Warnings);
        }

        [TestMethod]
        public async Task RollbackUserAsync_Failed_ReturnsFailureResult()
        {
            // Arrange
            var testUser = CreateTestUser();
            var expectedResult = RollbackResult.Failed("Graph API permission denied", new[] { "Insufficient privileges" });

            _mockUserValidator
                .Setup(x => x.RollbackUserAsync(testUser, _testTargetContext, It.IsAny<IProgress<ValidationProgress>>()))
                .ReturnsAsync(expectedResult);

            // Act
            var result = await _validationService.RollbackUserAsync(testUser, _testTargetContext);

            // Assert
            Assert.IsFalse(result.Success);
            Assert.IsTrue(result.Message.Contains("permission denied"));
            Assert.AreEqual(1, result.Errors.Count);
            RecordAuditEvent("User rollback failed", testUser.UserPrincipalName, errors: result.Errors);
        }

        [TestMethod]
        public async Task RollbackValidationResultAsync_UnknownObjectType_ReturnsFailure()
        {
            // Arrange
            var unknownResult = new ValidationResult
            {
                ValidatedObject = new { Name = "Unknown" },
                ObjectType = "UnknownType",
                ObjectName = "TestObject"
            };

            // Act
            var result = await _validationService.RollbackValidationResultAsync(unknownResult, _testTargetContext);

            // Assert
            Assert.IsFalse(result.Success);
            Assert.IsTrue(result.Message.Contains("Unknown object type"));
            RecordAuditEvent("Rollback failed - unknown object type", "UnknownType");
        }

        [TestMethod]
        public async Task RollbackMultipleAsync_MixedResults_ReturnsAllResults()
        {
            // Arrange
            var validationResults = new List<ValidationResult>
            {
                CreateUserValidationResult(),
                CreateMailboxValidationResult()
            };

            SetupMockRollbackProviders();

            var progressReports = new List<ValidationProgress>();

            // Act
            var results = await _validationService.RollbackMultipleAsync(validationResults, _testTargetContext,
                new Progress<ValidationProgress>(p => progressReports.Add(p)));

            // Assert
            Assert.AreEqual(2, results.Count);
            Assert.IsTrue(progressReports.Any(p => p.PercentageComplete == 100));
            Assert.IsTrue(results.Any(r => r.Success));
            RecordAuditEvent("Multiple rollback operations completed", $"Total: {results.Count}");
        }

        #endregion

        #region Validation Summary Tests

        [TestMethod]
        public void GetValidationSummary_MixedResults_ReturnsAccurateSummary()
        {
            // Arrange
            var results = new List<ValidationResult>
            {
                CreateSuccessValidationResult("User", "user1@test.com"),
                CreateWarningValidationResult("Mailbox", "mailbox1@test.com"),
                CreateErrorValidationResult("File", @"\\server\share\file1.txt"),
                CreateCriticalValidationResult("Database", "TestDB")
            };

            // Act
            var summary = _validationService.GetValidationSummary(results);

            // Assert
            Assert.AreEqual(4, summary.TotalObjects);
            Assert.AreEqual(1, summary.SuccessfulObjects);
            Assert.AreEqual(1, summary.WarningObjects);
            Assert.AreEqual(1, summary.ErrorObjects);
            Assert.AreEqual(1, summary.CriticalObjects);
            Assert.AreEqual(25.0, summary.SuccessRate); // 1 out of 4 successful
            Assert.IsTrue(summary.HasErrors);
            Assert.IsTrue(summary.HasWarnings);

            // Verify object type counts
            Assert.AreEqual(1, summary.ObjectTypes["User"]);
            Assert.AreEqual(1, summary.ObjectTypes["Mailbox"]);
            Assert.AreEqual(1, summary.ObjectTypes["File"]);
            Assert.AreEqual(1, summary.ObjectTypes["Database"]);
        }

        [TestMethod]
        public void GetValidationSummary_AllSuccessful_Returns100PercentSuccessRate()
        {
            // Arrange
            var results = new List<ValidationResult>
            {
                CreateSuccessValidationResult("User", "user1@test.com"),
                CreateSuccessValidationResult("User", "user2@test.com"),
                CreateSuccessValidationResult("Mailbox", "mailbox1@test.com")
            };

            // Act
            var summary = _validationService.GetValidationSummary(results);

            // Assert
            Assert.AreEqual(3, summary.TotalObjects);
            Assert.AreEqual(3, summary.SuccessfulObjects);
            Assert.AreEqual(100.0, summary.SuccessRate);
            Assert.IsFalse(summary.HasErrors);
            Assert.IsFalse(summary.HasWarnings);
        }

        [TestMethod]
        public void GetValidationSummary_EmptyResults_ReturnsEmptySummary()
        {
            // Arrange
            var results = new List<ValidationResult>();

            // Act
            var summary = _validationService.GetValidationSummary(results);

            // Assert
            Assert.AreEqual(0, summary.TotalObjects);
            Assert.AreEqual(100.0, summary.SuccessRate); // Default to 100% for empty set
            Assert.IsFalse(summary.HasErrors);
            Assert.IsFalse(summary.HasWarnings);
        }

        #endregion

        #region Helper Methods

        private UserDto CreateTestUser()
        {
            return new UserDto
            {
                DisplayName = "Test User",
                UserPrincipalName = "testuser@contoso.com",
                SamAccountName = "testuser",
                Department = "IT",
                JobTitle = "Test Engineer"
            };
        }

        private MailboxDto CreateTestMailbox()
        {
            return new MailboxDto
            {
                PrimarySmtpAddress = "testmailbox@contoso.com",
                DisplayName = "Test Mailbox",
                Database = "TestDB01",
                TotalItemSize = 1024 * 1024 * 100, // 100 MB
                ItemCount = 1500
            };
        }

        private FileItemDto CreateTestFileItem()
        {
            return new FileItemDto
            {
                SourcePath = @"\\source\share\TestFolder",
                TargetPath = @"\\target\share\TestFolder",
                FileCount = 250,
                TotalSize = 1024 * 1024 * 500 // 500 MB
            };
        }

        private DatabaseDto CreateTestDatabase()
        {
            return new DatabaseDto
            {
                Name = "TestDatabase",
                Server = "TestSQLServer",
                Size = 1024 * 1024 * 1024, // 1 GB
                CompatibilityLevel = 150
            };
        }

        private MigrationWave CreateTestWave()
        {
            return new MigrationWave
            {
                Users = { CreateTestUser() },
                Mailboxes = { CreateTestMailbox() },
                Files = { CreateTestFileItem() },
                Databases = { CreateTestDatabase() }
            };
        }

        private void SetupMockValidators(MigrationWave wave)
        {
            _mockUserValidator
                .Setup(x => x.ValidateUserAsync(It.IsAny<UserDto>(), It.IsAny<TargetContext>(), It.IsAny<IProgress<ValidationProgress>>()))
                .ReturnsAsync(ValidationResult.Success(wave.Users[0], "User", wave.Users[0].DisplayName));

            _mockMailboxValidator
                .Setup(x => x.ValidateMailboxAsync(It.IsAny<MailboxDto>(), It.IsAny<TargetContext>(), It.IsAny<IProgress<ValidationProgress>>()))
                .ReturnsAsync(ValidationResult.Failed(wave.Mailboxes[0], "Mailbox", wave.Mailboxes[0].PrimarySmtpAddress, "Test failure", new List<ValidationIssue>()));

            _mockFileValidator
                .Setup(x => x.ValidateFilesAsync(It.IsAny<FileItemDto>(), It.IsAny<TargetContext>(), It.IsAny<IProgress<ValidationProgress>>()))
                .ReturnsAsync(ValidationResult.Success(wave.Files[0], "File", wave.Files[0].SourcePath));

            _mockSqlValidator
                .Setup(x => x.ValidateSqlAsync(It.IsAny<DatabaseDto>(), It.IsAny<TargetContext>(), It.IsAny<IProgress<ValidationProgress>>()))
                .ReturnsAsync(ValidationResult.Success(wave.Databases[0], "Database", wave.Databases[0].Name));
        }

        private void SetupMockRollbackProviders()
        {
            _mockUserValidator
                .Setup(x => x.RollbackUserAsync(It.IsAny<UserDto>(), It.IsAny<TargetContext>(), It.IsAny<IProgress<ValidationProgress>>()))
                .ReturnsAsync(RollbackResult.Succeeded("User rollback successful"));

            _mockMailboxValidator
                .Setup(x => x.RollbackMailboxAsync(It.IsAny<MailboxDto>(), It.IsAny<TargetContext>(), It.IsAny<IProgress<ValidationProgress>>()))
                .ReturnsAsync(RollbackResult.Succeeded("Mailbox rollback successful"));
        }

        private ValidationResult CreateUserValidationResult()
        {
            return ValidationResult.Success(CreateTestUser(), "User", "testuser@contoso.com");
        }

        private ValidationResult CreateMailboxValidationResult()
        {
            return ValidationResult.Success(CreateTestMailbox(), "Mailbox", "testmailbox@contoso.com");
        }

        private ValidationResult CreateSuccessValidationResult(string objectType, string objectName)
        {
            return new ValidationResult
            {
                ObjectType = objectType,
                ObjectName = objectName,
                Severity = ValidationSeverity.Success,
                Message = "Validation passed"
            };
        }

        private ValidationResult CreateWarningValidationResult(string objectType, string objectName)
        {
            return new ValidationResult
            {
                ObjectType = objectType,
                ObjectName = objectName,
                Severity = ValidationSeverity.Warning,
                Message = "Validation passed with warnings",
                Issues = 
                { 
                    new ValidationIssue 
                    { 
                        Severity = ValidationSeverity.Warning, 
                        Category = "Test", 
                        Description = "Test warning" 
                    } 
                }
            };
        }

        private ValidationResult CreateErrorValidationResult(string objectType, string objectName)
        {
            return new ValidationResult
            {
                ObjectType = objectType,
                ObjectName = objectName,
                Severity = ValidationSeverity.Error,
                Message = "Validation failed",
                Issues = 
                { 
                    new ValidationIssue 
                    { 
                        Severity = ValidationSeverity.Error, 
                        Category = "Test", 
                        Description = "Test error" 
                    } 
                }
            };
        }

        private ValidationResult CreateCriticalValidationResult(string objectType, string objectName)
        {
            return new ValidationResult
            {
                ObjectType = objectType,
                ObjectName = objectName,
                Severity = ValidationSeverity.Critical,
                Message = "Critical validation failure",
                Issues = 
                { 
                    new ValidationIssue 
                    { 
                        Severity = ValidationSeverity.Critical, 
                        Category = "Test", 
                        Description = "Test critical error" 
                    } 
                }
            };
        }

        private void RecordAuditEvent(string action, string objectIdentifier, List<ValidationIssue> issues = null, List<string> warnings = null, List<string> errors = null)
        {
            var timestamp = DateTime.Now;
            var auditRecord = $"{timestamp:yyyy-MM-dd HH:mm:ss} - {action} - Object: {objectIdentifier}";
            
            if (issues?.Count > 0)
            {
                auditRecord += $" - Issues: {issues.Count}";
            }
            
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
            // Verify audit records were created for major operations
            Assert.IsTrue(_auditRecords.Count > 0, "Audit records should be created for test operations");
            
            // Log audit records for verification (in real implementation, these would go to audit database/file)
            foreach (var record in _auditRecords)
            {
                System.Diagnostics.Debug.WriteLine($"AUDIT: {record}");
            }
        }
    }

    #region Test DTOs (These would normally be in the main project)

    public class UserDto
    {
        public string DisplayName { get; set; } = string.Empty;
        public string UserPrincipalName { get; set; } = string.Empty;
        public string SamAccountName { get; set; } = string.Empty;
        public string Department { get; set; } = string.Empty;
        public string JobTitle { get; set; } = string.Empty;
    }

    public class MailboxDto
    {
        public string PrimarySmtpAddress { get; set; } = string.Empty;
        public string DisplayName { get; set; } = string.Empty;
        public string Database { get; set; } = string.Empty;
        public long TotalItemSize { get; set; }
        public int ItemCount { get; set; }
    }

    public class FileItemDto
    {
        public string SourcePath { get; set; } = string.Empty;
        public string TargetPath { get; set; } = string.Empty;
        public int FileCount { get; set; }
        public long TotalSize { get; set; }
    }

    public class DatabaseDto
    {
        public string Name { get; set; } = string.Empty;
        public string Server { get; set; } = string.Empty;
        public long Size { get; set; }
        public int CompatibilityLevel { get; set; }
    }

    public class MigrationWave
    {
        public List<UserDto> Users { get; } = new();
        public List<MailboxDto> Mailboxes { get; } = new();
        public List<FileItemDto> Files { get; } = new();
        public List<DatabaseDto> Databases { get; } = new();
    }

    public class TargetContext
    {
        public string TenantId { get; set; } = string.Empty;
        public string Environment { get; set; } = string.Empty;
    }

    #endregion
}