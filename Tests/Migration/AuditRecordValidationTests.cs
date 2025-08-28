using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using Moq;
using MandADiscoverySuite.Migration;
using System.Data;
using System.IO;

namespace MandADiscoverySuite.Tests.Migration
{
    /// <summary>
    /// Comprehensive tests for audit record creation during validation and rollback operations
    /// </summary>
    [TestClass]
    public class AuditRecordValidationTests
    {
        private Mock<IAuditRepository> _mockAuditRepository;
        private Mock<IAuditQueryService> _mockAuditQueryService;
        private AuditService _auditService;
        private PostMigrationValidationService _validationService;
        private Mock<IUserValidationProvider> _mockUserValidator;
        private Mock<IMailboxValidationProvider> _mockMailboxValidator;
        private Mock<IFileValidationProvider> _mockFileValidator;
        private Mock<ISqlValidationProvider> _mockSqlValidator;
        private List<AuditRecord> _capturedAuditRecords;
        private TargetContext _testTargetContext;

        [TestInitialize]
        public void Setup()
        {
            _mockAuditRepository = new Mock<IAuditRepository>();
            _mockAuditQueryService = new Mock<IAuditQueryService>();
            _mockUserValidator = new Mock<IUserValidationProvider>();
            _mockMailboxValidator = new Mock<IMailboxValidationProvider>();
            _mockFileValidator = new Mock<IFileValidationProvider>();
            _mockSqlValidator = new Mock<ISqlValidationProvider>();
            _capturedAuditRecords = new List<AuditRecord>();

            _auditService = new AuditService(_mockAuditRepository.Object, _mockAuditQueryService.Object);

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

            SetupAuditCapture();
        }

        #region Validation Audit Record Tests

        [TestMethod]
        public async Task ValidateUserAsync_Success_CreatesCompleteAuditRecord()
        {
            // Arrange
            var testUser = CreateTestUser();
            var validationResult = ValidationResult.Success(testUser, "User", testUser.DisplayName, "Validation passed");

            _mockUserValidator
                .Setup(u => u.ValidateUserAsync(testUser, _testTargetContext, It.IsAny<IProgress<ValidationProgress>>()))
                .ReturnsAsync(validationResult);

            // Act
            var result = await _validationService.ValidateUserAsync(testUser, _testTargetContext);

            // Assert
            var auditRecord = GetLastAuditRecord();
            Assert.IsNotNull(auditRecord, "Audit record should be created");
            Assert.AreEqual("Validation", auditRecord.Action, "Action should be 'Validation'");
            Assert.AreEqual("User", auditRecord.ObjectType, "Object type should be 'User'");
            Assert.AreEqual(testUser.UserPrincipalName, auditRecord.ObjectIdentifier, "Object identifier should be UPN");
            Assert.AreEqual("Success", auditRecord.Status, "Status should be 'Success'");
            Assert.AreEqual(0, auditRecord.IssueCount, "Issue count should be 0");
            Assert.IsNotNull(auditRecord.StartTime, "Start time should be recorded");
            Assert.IsNotNull(auditRecord.EndTime, "End time should be recorded");
            Assert.IsTrue(auditRecord.Duration > TimeSpan.Zero, "Duration should be positive");
            Assert.AreEqual(Environment.UserName, auditRecord.InitiatedBy, "Should record initiating user");
        }

        [TestMethod]
        public async Task ValidateUserAsync_WithIssues_RecordsDetailedAuditInfo()
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
                },
                new ValidationIssue
                {
                    Severity = ValidationSeverity.Warning,
                    Category = "Licensing",
                    Description = "No licenses assigned",
                    RecommendedAction = "Assign appropriate licenses"
                }
            };
            var validationResult = ValidationResult.Failed(testUser, "User", testUser.DisplayName, "Validation failed", issues);

            _mockUserValidator
                .Setup(u => u.ValidateUserAsync(testUser, _testTargetContext, It.IsAny<IProgress<ValidationProgress>>()))
                .ReturnsAsync(validationResult);

            // Act
            var result = await _validationService.ValidateUserAsync(testUser, _testTargetContext);

            // Assert
            var auditRecord = GetLastAuditRecord();
            Assert.AreEqual("Error", auditRecord.Status, "Status should reflect highest severity");
            Assert.AreEqual(2, auditRecord.IssueCount, "Should record correct issue count");
            Assert.IsNotNull(auditRecord.IssueDetails, "Issue details should be recorded");
            Assert.IsTrue(auditRecord.IssueDetails.Contains("Account Existence"), "Should contain issue categories");
            Assert.IsTrue(auditRecord.IssueDetails.Contains("Licensing"), "Should contain all issue categories");
            Assert.AreEqual(1, auditRecord.ErrorCount, "Should count errors correctly");
            Assert.AreEqual(1, auditRecord.WarningCount, "Should count warnings correctly");
        }

        [TestMethod]
        public async Task ValidateWaveAsync_MultipleObjects_CreatesAuditRecordsForAll()
        {
            // Arrange
            var wave = CreateTestWave();
            SetupMockValidatorsForWave(wave);

            // Act
            var results = await _validationService.ValidateWaveAsync(wave, _testTargetContext);

            // Assert
            var auditRecords = GetAllAuditRecords();
            Assert.IsTrue(auditRecords.Count >= 5, "Should have audit records for wave and individual objects");
            
            // Check wave-level audit record
            var waveAudit = auditRecords.FirstOrDefault(r => r.Action == "WaveValidation");
            Assert.IsNotNull(waveAudit, "Should have wave-level audit record");
            Assert.AreEqual(4, waveAudit.ObjectCount, "Should record total object count");
            
            // Check individual object audit records
            Assert.IsTrue(auditRecords.Any(r => r.ObjectType == "User"), "Should have user audit record");
            Assert.IsTrue(auditRecords.Any(r => r.ObjectType == "Mailbox"), "Should have mailbox audit record");
            Assert.IsTrue(auditRecords.Any(r => r.ObjectType == "File"), "Should have file audit record");
            Assert.IsTrue(auditRecords.Any(r => r.ObjectType == "Database"), "Should have database audit record");
        }

        #endregion

        #region Rollback Audit Record Tests

        [TestMethod]
        public async Task RollbackUserAsync_Success_CreatesCompleteRollbackAudit()
        {
            // Arrange
            var testUser = CreateTestUser();
            var rollbackResult = RollbackResult.Succeeded("User rollback completed");

            _mockUserValidator
                .Setup(u => u.RollbackUserAsync(testUser, _testTargetContext, It.IsAny<IProgress<ValidationProgress>>()))
                .ReturnsAsync(rollbackResult);

            // Act
            var result = await _validationService.RollbackUserAsync(testUser, _testTargetContext);

            // Assert
            var auditRecord = GetLastAuditRecord();
            Assert.AreEqual("Rollback", auditRecord.Action, "Action should be 'Rollback'");
            Assert.AreEqual("User", auditRecord.ObjectType, "Object type should be 'User'");
            Assert.AreEqual(testUser.UserPrincipalName, auditRecord.ObjectIdentifier, "Object identifier should be UPN");
            Assert.AreEqual("Success", auditRecord.Status, "Status should be 'Success'");
            Assert.IsNotNull(auditRecord.RollbackDetails, "Rollback details should be recorded");
            Assert.AreEqual("User disabled successfully", auditRecord.RollbackDetails.Action, "Rollback action should be recorded");
            Assert.IsTrue(auditRecord.RollbackDetails.StateRestored, "State restoration should be marked");
        }

        [TestMethod]
        public async Task RollbackUserAsync_WithWarnings_RecordsWarningDetails()
        {
            // Arrange
            var testUser = CreateTestUser();
            var rollbackResult = new RollbackResult
            {
                Success = true,
                Message = "Rollback completed with warnings",
                Warnings = { "Could not remove from some groups", "Licenses retained as configured" }
            };

            _mockUserValidator
                .Setup(u => u.RollbackUserAsync(testUser, _testTargetContext, It.IsAny<IProgress<ValidationProgress>>()))
                .ReturnsAsync(rollbackResult);

            // Act
            var result = await _validationService.RollbackUserAsync(testUser, _testTargetContext);

            // Assert
            var auditRecord = GetLastAuditRecord();
            Assert.AreEqual("Success", auditRecord.Status, "Status should still be success");
            Assert.AreEqual(2, auditRecord.WarningCount, "Should record warning count");
            Assert.IsNotNull(auditRecord.RollbackDetails, "Rollback details should be present");
            Assert.AreEqual(2, auditRecord.RollbackDetails.Warnings.Count, "Should record all warnings");
            Assert.IsTrue(auditRecord.RollbackDetails.Warnings.Any(w => w.Contains("groups")), "Should contain group warning");
            Assert.IsTrue(auditRecord.RollbackDetails.Warnings.Any(w => w.Contains("Licenses")), "Should contain license warning");
        }

        [TestMethod]
        public async Task RollbackUserAsync_Failure_RecordsFailureReason()
        {
            // Arrange
            var testUser = CreateTestUser();
            var rollbackResult = RollbackResult.Failed("Graph API permission denied", 
                new[] { "Insufficient privileges to disable account", "Admin consent required" });

            _mockUserValidator
                .Setup(u => u.RollbackUserAsync(testUser, _testTargetContext, It.IsAny<IProgress<ValidationProgress>>()))
                .ReturnsAsync(rollbackResult);

            // Act
            var result = await _validationService.RollbackUserAsync(testUser, _testTargetContext);

            // Assert
            var auditRecord = GetLastAuditRecord();
            Assert.AreEqual("Failed", auditRecord.Status, "Status should be 'Failed'");
            Assert.AreEqual(2, auditRecord.ErrorCount, "Should record error count");
            Assert.IsNotNull(auditRecord.RollbackDetails, "Rollback details should be present");
            Assert.IsFalse(auditRecord.RollbackDetails.StateRestored, "State should not be marked as restored");
            Assert.AreEqual(2, auditRecord.RollbackDetails.Errors.Count, "Should record all errors");
            Assert.IsTrue(auditRecord.RollbackDetails.Errors.Any(e => e.Contains("privileges")), "Should contain privilege error");
        }

        [TestMethod]
        public async Task RollbackMultipleAsync_BatchOperation_CreatesConsolidatedAudit()
        {
            // Arrange
            var validationResults = new List<ValidationResult>
            {
                CreateFailedValidationResult("User", "user1@test.com"),
                CreateFailedValidationResult("Mailbox", "mailbox1@test.com"),
                CreateFailedValidationResult("File", @"\\server\share\file1"),
                CreateFailedValidationResult("Database", "TestDB")
            };

            SetupMockRollbackProviders();

            // Act
            var results = await _validationService.RollbackMultipleAsync(validationResults, _testTargetContext);

            // Assert
            var auditRecords = GetAllAuditRecords();
            
            // Check batch rollback audit record
            var batchAudit = auditRecords.FirstOrDefault(r => r.Action == "BatchRollback");
            Assert.IsNotNull(batchAudit, "Should have batch rollback audit record");
            Assert.AreEqual(4, batchAudit.ObjectCount, "Should record total object count");
            Assert.IsTrue(batchAudit.BatchDetails.TotalObjects == 4, "Batch details should be recorded");
            
            // Check individual rollback audit records
            Assert.AreEqual(4, auditRecords.Count(r => r.Action == "Rollback"), "Should have 4 individual rollback records");
        }

        #endregion

        #region Audit Query and Filtering Tests

        [TestMethod]
        public async Task FilterAuditRecords_ByDateRange_ReturnsCorrectRecords()
        {
            // Arrange
            var startDate = DateTime.Now.Date.AddDays(-7);
            var endDate = DateTime.Now.Date;
            var expectedRecords = CreateTestAuditRecords(10, startDate, endDate);
            
            _mockAuditQueryService
                .Setup(q => q.GetAuditRecordsAsync(startDate, endDate, null, null, null))
                .ReturnsAsync(expectedRecords.Where(r => r.StartTime >= startDate && r.StartTime <= endDate).ToList());

            // Act
            var filteredRecords = await _auditService.GetAuditRecordsAsync(startDate, endDate);

            // Assert
            Assert.IsTrue(filteredRecords.All(r => r.StartTime >= startDate && r.StartTime <= endDate), 
                "All records should be within date range");
            Assert.AreEqual(10, filteredRecords.Count, "Should return expected number of records");
        }

        [TestMethod]
        public async Task FilterAuditRecords_ByObjectType_ReturnsOnlySpecifiedType()
        {
            // Arrange
            var objectType = "User";
            var expectedRecords = CreateTestAuditRecords(15);
            var userRecords = expectedRecords.Where(r => r.ObjectType == objectType).ToList();
            
            _mockAuditQueryService
                .Setup(q => q.GetAuditRecordsAsync(It.IsAny<DateTime>(), It.IsAny<DateTime>(), objectType, null, null))
                .ReturnsAsync(userRecords);

            // Act
            var filteredRecords = await _auditService.GetAuditRecordsAsync(DateTime.MinValue, DateTime.MaxValue, objectType);

            // Assert
            Assert.IsTrue(filteredRecords.All(r => r.ObjectType == objectType), 
                "All records should be of specified object type");
        }

        [TestMethod]
        public async Task FilterAuditRecords_ByStatus_ReturnsOnlyMatchingStatus()
        {
            // Arrange
            var status = "Failed";
            var expectedRecords = CreateTestAuditRecords(20);
            var failedRecords = expectedRecords.Where(r => r.Status == status).ToList();
            
            _mockAuditQueryService
                .Setup(q => q.GetAuditRecordsAsync(It.IsAny<DateTime>(), It.IsAny<DateTime>(), null, status, null))
                .ReturnsAsync(failedRecords);

            // Act
            var filteredRecords = await _auditService.GetAuditRecordsAsync(DateTime.MinValue, DateTime.MaxValue, null, status);

            // Assert
            Assert.IsTrue(filteredRecords.All(r => r.Status == status), 
                "All records should have specified status");
        }

        [TestMethod]
        public async Task FilterAuditRecords_ByWave_ReturnsWaveSpecificRecords()
        {
            // Arrange
            var waveId = "wave-123";
            var expectedRecords = CreateTestAuditRecords(12);
            var waveRecords = expectedRecords.Where(r => r.WaveId == waveId).ToList();
            
            _mockAuditQueryService
                .Setup(q => q.GetAuditRecordsAsync(It.IsAny<DateTime>(), It.IsAny<DateTime>(), null, null, waveId))
                .ReturnsAsync(waveRecords);

            // Act
            var filteredRecords = await _auditService.GetAuditRecordsAsync(DateTime.MinValue, DateTime.MaxValue, null, null, waveId);

            // Assert
            Assert.IsTrue(filteredRecords.All(r => r.WaveId == waveId), 
                "All records should belong to specified wave");
        }

        #endregion

        #region Audit Record Sorting Tests

        [TestMethod]
        public async Task SortAuditRecords_ByTimestamp_ReturnsChronologicalOrder()
        {
            // Arrange
            var unsortedRecords = CreateTestAuditRecords(8);
            var sortedRecords = unsortedRecords.OrderBy(r => r.StartTime).ToList();
            
            _mockAuditQueryService
                .Setup(q => q.GetSortedAuditRecordsAsync(It.IsAny<DateTime>(), It.IsAny<DateTime>(), "StartTime", "ASC"))
                .ReturnsAsync(sortedRecords);

            // Act
            var result = await _auditService.GetSortedAuditRecordsAsync(DateTime.MinValue, DateTime.MaxValue, "StartTime", "ASC");

            // Assert
            var previousTime = DateTime.MinValue;
            foreach (var record in result)
            {
                Assert.IsTrue(record.StartTime >= previousTime, "Records should be in chronological order");
                previousTime = record.StartTime;
            }
        }

        [TestMethod]
        public async Task SortAuditRecords_ByDuration_ReturnsCorrectOrder()
        {
            // Arrange
            var records = CreateTestAuditRecords(6);
            var sortedRecords = records.OrderByDescending(r => r.Duration).ToList();
            
            _mockAuditQueryService
                .Setup(q => q.GetSortedAuditRecordsAsync(It.IsAny<DateTime>(), It.IsAny<DateTime>(), "Duration", "DESC"))
                .ReturnsAsync(sortedRecords);

            // Act
            var result = await _auditService.GetSortedAuditRecordsAsync(DateTime.MinValue, DateTime.MaxValue, "Duration", "DESC");

            // Assert
            var previousDuration = TimeSpan.MaxValue;
            foreach (var record in result)
            {
                Assert.IsTrue(record.Duration <= previousDuration, "Records should be sorted by duration descending");
                previousDuration = record.Duration;
            }
        }

        [TestMethod]
        public async Task SortAuditRecords_ByObjectType_ReturnsAlphabeticalOrder()
        {
            // Arrange
            var records = CreateTestAuditRecords(10);
            var sortedRecords = records.OrderBy(r => r.ObjectType).ToList();
            
            _mockAuditQueryService
                .Setup(q => q.GetSortedAuditRecordsAsync(It.IsAny<DateTime>(), It.IsAny<DateTime>(), "ObjectType", "ASC"))
                .ReturnsAsync(sortedRecords);

            // Act
            var result = await _auditService.GetSortedAuditRecordsAsync(DateTime.MinValue, DateTime.MaxValue, "ObjectType", "ASC");

            // Assert
            var previousObjectType = string.Empty;
            foreach (var record in result)
            {
                Assert.IsTrue(string.Compare(record.ObjectType, previousObjectType, StringComparison.OrdinalIgnoreCase) >= 0, 
                    "Records should be sorted alphabetically by object type");
                previousObjectType = record.ObjectType;
            }
        }

        #endregion

        #region Export Functionality Tests

        [TestMethod]
        public async Task ExportAuditRecords_ToCsv_CreatesValidCsvFile()
        {
            // Arrange
            var records = CreateTestAuditRecords(25);
            var exportPath = Path.Combine(Path.GetTempPath(), $"audit_export_{Guid.NewGuid()}.csv");
            
            _mockAuditQueryService
                .Setup(q => q.ExportToCsvAsync(records, exportPath))
                .Returns(Task.CompletedTask);

            // Act
            await _auditService.ExportToCsvAsync(records, exportPath);

            // Assert
            _mockAuditQueryService.Verify(q => q.ExportToCsvAsync(records, exportPath), Times.Once);
            
            // Simulate CSV validation
            var csvContent = GenerateExpectedCsvContent(records);
            Assert.IsTrue(csvContent.Contains("Action,ObjectType,ObjectIdentifier"), "CSV should have proper headers");
            Assert.AreEqual(26, csvContent.Split('\n').Length, "CSV should have header + 25 records");
        }

        [TestMethod]
        public async Task ExportAuditRecords_ToPdf_CreatesValidPdfFile()
        {
            // Arrange
            var records = CreateTestAuditRecords(15);
            var exportPath = Path.Combine(Path.GetTempPath(), $"audit_export_{Guid.NewGuid()}.pdf");
            
            _mockAuditQueryService
                .Setup(q => q.ExportToPdfAsync(records, exportPath))
                .Returns(Task.CompletedTask);

            // Act
            await _auditService.ExportToPdfAsync(records, exportPath);

            // Assert
            _mockAuditQueryService.Verify(q => q.ExportToPdfAsync(records, exportPath), Times.Once);
        }

        [TestMethod]
        public async Task ExportAuditRecords_WithFiltering_ExportsOnlyFilteredData()
        {
            // Arrange
            var allRecords = CreateTestAuditRecords(50);
            var filteredRecords = allRecords.Where(r => r.Status == "Failed").ToList();
            var exportPath = Path.Combine(Path.GetTempPath(), $"filtered_audit_export_{Guid.NewGuid()}.csv");
            
            _mockAuditQueryService
                .Setup(q => q.GetAuditRecordsAsync(It.IsAny<DateTime>(), It.IsAny<DateTime>(), null, "Failed", null))
                .ReturnsAsync(filteredRecords);
            
            _mockAuditQueryService
                .Setup(q => q.ExportToCsvAsync(filteredRecords, exportPath))
                .Returns(Task.CompletedTask);

            // Act
            var recordsToExport = await _auditService.GetAuditRecordsAsync(DateTime.MinValue, DateTime.MaxValue, null, "Failed");
            await _auditService.ExportToCsvAsync(recordsToExport, exportPath);

            // Assert
            _mockAuditQueryService.Verify(q => q.ExportToCsvAsync(
                It.Is<List<AuditRecord>>(r => r.All(rec => rec.Status == "Failed")), 
                exportPath), Times.Once);
        }

        #endregion

        #region Helper Methods

        private void SetupAuditCapture()
        {
            _mockAuditRepository
                .Setup(repo => repo.InsertAuditRecordAsync(It.IsAny<AuditRecord>()))
                .Callback<AuditRecord>(record => _capturedAuditRecords.Add(record))
                .Returns(Task.CompletedTask);
        }

        private AuditRecord GetLastAuditRecord()
        {
            return _capturedAuditRecords.LastOrDefault();
        }

        private List<AuditRecord> GetAllAuditRecords()
        {
            return _capturedAuditRecords.ToList();
        }

        private List<AuditRecord> CreateTestAuditRecords(int count, DateTime? startDate = null, DateTime? endDate = null)
        {
            var records = new List<AuditRecord>();
            var objectTypes = new[] { "User", "Mailbox", "File", "Database" };
            var statuses = new[] { "Success", "Warning", "Error", "Failed" };
            var actions = new[] { "Validation", "Rollback" };

            var random = new Random();
            var baseDate = startDate ?? DateTime.Now.AddDays(-30);
            var dateRange = (endDate ?? DateTime.Now) - baseDate;

            for (int i = 0; i < count; i++)
            {
                var timestamp = baseDate.AddMilliseconds(random.NextDouble() * dateRange.TotalMilliseconds);
                var duration = TimeSpan.FromMilliseconds(random.Next(100, 30000));

                records.Add(new AuditRecord
                {
                    Id = Guid.NewGuid().ToString(),
                    Action = actions[random.Next(actions.Length)],
                    ObjectType = objectTypes[random.Next(objectTypes.Length)],
                    ObjectIdentifier = $"test-object-{i}@contoso.com",
                    Status = statuses[random.Next(statuses.Length)],
                    StartTime = timestamp,
                    EndTime = timestamp.Add(duration),
                    Duration = duration,
                    InitiatedBy = $"testuser{i % 5}@contoso.com",
                    IssueCount = random.Next(0, 5),
                    ErrorCount = random.Next(0, 3),
                    WarningCount = random.Next(0, 4),
                    WaveId = $"wave-{random.Next(1, 6)}",
                    ObjectCount = random.Next(1, 10)
                });
            }

            return records;
        }

        private UserDto CreateTestUser()
        {
            return new UserDto
            {
                DisplayName = "Test User",
                UserPrincipalName = "testuser@contoso.com",
                SamAccountName = "testuser"
            };
        }

        private MigrationWave CreateTestWave()
        {
            return new MigrationWave
            {
                Users = { CreateTestUser() },
                Mailboxes = { new MailboxDto { PrimarySmtpAddress = "testmailbox@contoso.com", DisplayName = "Test Mailbox" } },
                Files = { new FileItemDto { SourcePath = @"\\source\share", TargetPath = @"\\target\share" } },
                Databases = { new DatabaseDto { Name = "TestDB", Server = "sql-server" } }
            };
        }

        private void SetupMockValidatorsForWave(MigrationWave wave)
        {
            _mockUserValidator
                .Setup(u => u.ValidateUserAsync(It.IsAny<UserDto>(), It.IsAny<TargetContext>(), It.IsAny<IProgress<ValidationProgress>>()))
                .ReturnsAsync(ValidationResult.Success(wave.Users[0], "User", wave.Users[0].DisplayName));

            _mockMailboxValidator
                .Setup(m => m.ValidateMailboxAsync(It.IsAny<MailboxDto>(), It.IsAny<TargetContext>(), It.IsAny<IProgress<ValidationProgress>>()))
                .ReturnsAsync(ValidationResult.Success(wave.Mailboxes[0], "Mailbox", wave.Mailboxes[0].PrimarySmtpAddress));

            _mockFileValidator
                .Setup(f => f.ValidateFilesAsync(It.IsAny<FileItemDto>(), It.IsAny<TargetContext>(), It.IsAny<IProgress<ValidationProgress>>()))
                .ReturnsAsync(ValidationResult.Success(wave.Files[0], "File", wave.Files[0].SourcePath));

            _mockSqlValidator
                .Setup(s => s.ValidateSqlAsync(It.IsAny<DatabaseDto>(), It.IsAny<TargetContext>(), It.IsAny<IProgress<ValidationProgress>>()))
                .ReturnsAsync(ValidationResult.Success(wave.Databases[0], "Database", wave.Databases[0].Name));
        }

        private ValidationResult CreateFailedValidationResult(string objectType, string objectName)
        {
            var issues = new List<ValidationIssue>
            {
                new ValidationIssue { Category = "Test", Description = "Test failure", Severity = ValidationSeverity.Error }
            };
            return ValidationResult.Failed(new object(), objectType, objectName, "Test failure", issues);
        }

        private void SetupMockRollbackProviders()
        {
            _mockUserValidator
                .Setup(u => u.RollbackUserAsync(It.IsAny<UserDto>(), It.IsAny<TargetContext>(), It.IsAny<IProgress<ValidationProgress>>()))
                .ReturnsAsync(RollbackResult.Succeeded("User rollback successful"));

            _mockMailboxValidator
                .Setup(m => m.RollbackMailboxAsync(It.IsAny<MailboxDto>(), It.IsAny<TargetContext>(), It.IsAny<IProgress<ValidationProgress>>()))
                .ReturnsAsync(RollbackResult.Succeeded("Mailbox rollback successful"));

            _mockFileValidator
                .Setup(f => f.RollbackFilesAsync(It.IsAny<FileItemDto>(), It.IsAny<TargetContext>(), It.IsAny<IProgress<ValidationProgress>>()))
                .ReturnsAsync(RollbackResult.Succeeded("File rollback successful"));

            _mockSqlValidator
                .Setup(s => s.RollbackSqlAsync(It.IsAny<DatabaseDto>(), It.IsAny<TargetContext>(), It.IsAny<IProgress<ValidationProgress>>()))
                .ReturnsAsync(RollbackResult.Succeeded("Database rollback successful"));
        }

        private string GenerateExpectedCsvContent(List<AuditRecord> records)
        {
            var header = "Action,ObjectType,ObjectIdentifier,Status,StartTime,Duration,InitiatedBy,IssueCount";
            var rows = records.Select(r => $"{r.Action},{r.ObjectType},{r.ObjectIdentifier},{r.Status},{r.StartTime:yyyy-MM-dd HH:mm:ss},{r.Duration.TotalMilliseconds},{r.InitiatedBy},{r.IssueCount}");
            return string.Join("\n", new[] { header }.Concat(rows));
        }

        #endregion

        [TestCleanup]
        public void Cleanup()
        {
            Assert.IsTrue(_capturedAuditRecords.Count > 0, "Audit records should be captured during tests");
            
            foreach (var record in _capturedAuditRecords)
            {
                System.Diagnostics.Debug.WriteLine($"AUDIT_RECORD: {record.Action} - {record.ObjectType} - {record.Status}");
            }
        }
    }

    #region Audit Support Classes

    public interface IAuditRepository
    {
        Task InsertAuditRecordAsync(AuditRecord record);
        Task<List<AuditRecord>> GetAuditRecordsAsync(DateTime startDate, DateTime endDate, string objectType = null, string status = null, string waveId = null);
    }

    public interface IAuditQueryService
    {
        Task<List<AuditRecord>> GetAuditRecordsAsync(DateTime startDate, DateTime endDate, string objectType = null, string status = null, string waveId = null);
        Task<List<AuditRecord>> GetSortedAuditRecordsAsync(DateTime startDate, DateTime endDate, string sortBy, string sortDirection);
        Task ExportToCsvAsync(List<AuditRecord> records, string filePath);
        Task ExportToPdfAsync(List<AuditRecord> records, string filePath);
    }

    public class AuditService
    {
        private readonly IAuditRepository _repository;
        private readonly IAuditQueryService _queryService;

        public AuditService(IAuditRepository repository, IAuditQueryService queryService)
        {
            _repository = repository;
            _queryService = queryService;
        }

        public async Task<List<AuditRecord>> GetAuditRecordsAsync(DateTime startDate, DateTime endDate, string objectType = null, string status = null, string waveId = null)
        {
            return await _queryService.GetAuditRecordsAsync(startDate, endDate, objectType, status, waveId);
        }

        public async Task<List<AuditRecord>> GetSortedAuditRecordsAsync(DateTime startDate, DateTime endDate, string sortBy, string sortDirection)
        {
            return await _queryService.GetSortedAuditRecordsAsync(startDate, endDate, sortBy, sortDirection);
        }

        public async Task ExportToCsvAsync(List<AuditRecord> records, string filePath)
        {
            await _queryService.ExportToCsvAsync(records, filePath);
        }

        public async Task ExportToPdfAsync(List<AuditRecord> records, string filePath)
        {
            await _queryService.ExportToPdfAsync(records, filePath);
        }
    }

    public class AuditRecord
    {
        public string Id { get; set; } = string.Empty;
        public string Action { get; set; } = string.Empty;
        public string ObjectType { get; set; } = string.Empty;
        public string ObjectIdentifier { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }
        public TimeSpan Duration { get; set; }
        public string InitiatedBy { get; set; } = string.Empty;
        public int IssueCount { get; set; }
        public int ErrorCount { get; set; }
        public int WarningCount { get; set; }
        public string IssueDetails { get; set; } = string.Empty;
        public string WaveId { get; set; } = string.Empty;
        public int ObjectCount { get; set; }
        public RollbackAuditDetails RollbackDetails { get; set; } = new();
        public BatchAuditDetails BatchDetails { get; set; } = new();
    }

    public class RollbackAuditDetails
    {
        public string Action { get; set; } = string.Empty;
        public bool StateRestored { get; set; }
        public List<string> Warnings { get; set; } = new();
        public List<string> Errors { get; set; } = new();
    }

    public class BatchAuditDetails
    {
        public int TotalObjects { get; set; }
        public int SuccessfulObjects { get; set; }
        public int FailedObjects { get; set; }
    }

    #endregion
}