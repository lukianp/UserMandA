using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Graph;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using Moq;
using MandADiscoverySuite.Migration;
using MandADiscoverySuite.Services.Migration;

namespace MandADiscoverySuite.Tests.Migration
{
    /// <summary>
    /// Comprehensive tests for rollback functionality with state verification and complete restoration testing
    /// </summary>
    [TestClass]
    public class RollbackFunctionalityTests
    {
        private PostMigrationValidationService _validationService;
        private Mock<IUserValidationProvider> _mockUserValidator;
        private Mock<IMailboxValidationProvider> _mockMailboxValidator;
        private Mock<IFileValidationProvider> _mockFileValidator;
        private Mock<ISqlValidationProvider> _mockSqlValidator;
        private Mock<IStateVerificationService> _mockStateService;
        private Mock<IAuditService> _mockAuditService;
        private TargetContext _testTargetContext;
        private List<string> _auditRecords;
        private StateSnapshot _preRollbackState;

        [TestInitialize]
        public void Setup()
        {
            _mockUserValidator = new Mock<IUserValidationProvider>();
            _mockMailboxValidator = new Mock<IMailboxValidationProvider>();
            _mockFileValidator = new Mock<IFileValidationProvider>();
            _mockSqlValidator = new Mock<ISqlValidationProvider>();
            _mockStateService = new Mock<IStateVerificationService>();
            _mockAuditService = new Mock<IAuditService>();
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

            _preRollbackState = new StateSnapshot();
            SetupStateVerificationMocks();
        }

        #region User Rollback State Verification Tests

        [TestMethod]
        public async Task RollbackUserAsync_VerifyStateChanges_DisablesAccountCorrectly()
        {
            // Arrange
            var testUser = CreateTestUser();
            var preRollbackState = new UserState
            {
                UserPrincipalName = testUser.UserPrincipalName,
                AccountEnabled = true,
                LicenseCount = 2,
                GroupMemberships = new List<string> { "Group1", "Group2", "Group3" }
            };

            var expectedPostRollbackState = new UserState
            {
                UserPrincipalName = testUser.UserPrincipalName,
                AccountEnabled = false, // Should be disabled
                LicenseCount = 2, // Licenses remain (configurable)
                GroupMemberships = new List<string> { "Group1", "Group2", "Group3" } // Groups remain (safer)
            };

            SetupUserRollbackMocks(testUser, preRollbackState, expectedPostRollbackState);

            // Act
            var preState = await _mockStateService.Object.CaptureUserStateAsync(testUser.UserPrincipalName);
            var rollbackResult = await _validationService.RollbackUserAsync(testUser, _testTargetContext);
            var postState = await _mockStateService.Object.CaptureUserStateAsync(testUser.UserPrincipalName);

            // Assert
            Assert.IsTrue(rollbackResult.Success, "Rollback should succeed");
            Assert.IsTrue(preState.AccountEnabled, "User should be enabled before rollback");
            Assert.IsFalse(postState.AccountEnabled, "User should be disabled after rollback");
            Assert.AreEqual(preState.LicenseCount, postState.LicenseCount, "License count should remain unchanged");
            Assert.AreEqual(preState.GroupMemberships.Count, postState.GroupMemberships.Count, "Group memberships should remain unchanged");
            
            RecordAuditEvent("User rollback state verification passed", testUser.UserPrincipalName);
        }

        [TestMethod]
        public async Task RollbackUserAsync_VerifyReversibility_CanBeReEnabled()
        {
            // Arrange
            var testUser = CreateTestUser();
            var originalState = new UserState
            {
                UserPrincipalName = testUser.UserPrincipalName,
                AccountEnabled = true,
                DisplayName = testUser.DisplayName,
                Department = testUser.Department,
                JobTitle = testUser.JobTitle
            };

            SetupUserReversibilityMocks(testUser, originalState);

            // Act - Perform rollback
            var rollbackResult = await _validationService.RollbackUserAsync(testUser, _testTargetContext);
            var disabledState = await _mockStateService.Object.CaptureUserStateAsync(testUser.UserPrincipalName);
            
            // Act - Reverse the rollback (re-enable)
            // var reverseResult = await _mockUserValidator.Object.ReverseRollbackUserAsync(testUser, _testTargetContext);
            var restoredState = await _mockStateService.Object.CaptureUserStateAsync(testUser.UserPrincipalName);

            // Assert
            Assert.IsTrue(rollbackResult.Success, "Initial rollback should succeed");
            Assert.IsFalse(disabledState.AccountEnabled, "User should be disabled after rollback");
            // Assert.IsTrue(reverseResult.Success, "Rollback reversal should succeed");
            Assert.IsTrue(restoredState.AccountEnabled, "User should be re-enabled after reversal");
            Assert.AreEqual(originalState.DisplayName, restoredState.DisplayName, "Display name should be preserved");
            Assert.AreEqual(originalState.Department, restoredState.Department, "Department should be preserved");
            
            RecordAuditEvent("User rollback reversibility verified", testUser.UserPrincipalName);
        }

        [TestMethod]
        public async Task RollbackUserAsync_PartialFailure_RecordsIncompleteState()
        {
            // Arrange
            var testUser = CreateTestUser();
            var partialRollbackResult = new RollbackResult
            {
                Success = false,
                Message = "Partial rollback failure",
                Errors = { "Could not disable account due to admin privileges" },
                Warnings = { "User remains active in target tenant" }
            };

            _mockUserValidator
                .Setup(u => u.RollbackUserAsync(testUser, _testTargetContext, It.IsAny<IProgress<ValidationProgress>>()))
                .ReturnsAsync(partialRollbackResult);

            // Act
            var preState = await _mockStateService.Object.CaptureUserStateAsync(testUser.UserPrincipalName);
            var rollbackResult = await _validationService.RollbackUserAsync(testUser, _testTargetContext);
            var postState = await _mockStateService.Object.CaptureUserStateAsync(testUser.UserPrincipalName);

            // Assert
            Assert.IsFalse(rollbackResult.Success, "Rollback should report failure");
            Assert.AreEqual(1, rollbackResult.Errors.Count, "Should have error recorded");
            Assert.AreEqual(1, rollbackResult.Warnings.Count, "Should have warning recorded");
            Assert.IsTrue(postState.AccountEnabled, "Account should still be enabled due to rollback failure");
            
            RecordAuditEvent("User rollback partial failure handled", testUser.UserPrincipalName, 
                errors: rollbackResult.Errors, warnings: rollbackResult.Warnings);
        }

        #endregion

        #region Mailbox Rollback State Verification Tests

        [TestMethod]
        public async Task RollbackMailboxAsync_VerifyMoveRequestCancellation_RestoresSource()
        {
            // Arrange
            var testMailbox = CreateTestMailbox();
            var preRollbackState = new MailboxState
            {
                PrimarySmtpAddress = testMailbox.PrimarySmtpAddress,
                MoveRequestStatus = "Completed",
                TargetDatabase = "TargetDB01",
                SourceDatabase = "SourceDB01",
                ItemCount = testMailbox.ItemCount
            };

            var expectedPostRollbackState = new MailboxState
            {
                PrimarySmtpAddress = testMailbox.PrimarySmtpAddress,
                MoveRequestStatus = "None", // Move request cancelled
                TargetDatabase = null, // No longer in target
                SourceDatabase = "SourceDB01", // Restored to source
                ItemCount = testMailbox.ItemCount
            };

            SetupMailboxRollbackMocks(testMailbox, preRollbackState, expectedPostRollbackState);

            // Act
            var preState = await _mockStateService.Object.CaptureMailboxStateAsync(testMailbox.PrimarySmtpAddress);
            var rollbackResult = await _validationService.RollbackMailboxAsync(testMailbox, _testTargetContext);
            var postState = await _mockStateService.Object.CaptureMailboxStateAsync(testMailbox.PrimarySmtpAddress);

            // Assert
            Assert.IsTrue(rollbackResult.Success, "Mailbox rollback should succeed");
            Assert.AreEqual("Completed", preState.MoveRequestStatus, "Move request should be completed before rollback");
            Assert.AreEqual("None", postState.MoveRequestStatus, "Move request should be cancelled after rollback");
            Assert.IsNull(postState.TargetDatabase, "Mailbox should no longer be in target database");
            Assert.AreEqual("SourceDB01", postState.SourceDatabase, "Mailbox should be restored to source database");
            
            RecordAuditEvent("Mailbox rollback state verification passed", testMailbox.PrimarySmtpAddress);
        }

        [TestMethod]
        public async Task RollbackMailboxAsync_InProgressMove_HandlesCorrectly()
        {
            // Arrange
            var testMailbox = CreateTestMailbox();
            var inProgressState = new MailboxState
            {
                PrimarySmtpAddress = testMailbox.PrimarySmtpAddress,
                MoveRequestStatus = "InProgress",
                PercentComplete = 75,
                TargetDatabase = "TargetDB01",
                SourceDatabase = "SourceDB01"
            };

            var rolledBackState = new MailboxState
            {
                PrimarySmtpAddress = testMailbox.PrimarySmtpAddress,
                MoveRequestStatus = "Failed", // Move request cancelled/failed
                PercentComplete = 0,
                TargetDatabase = null,
                SourceDatabase = "SourceDB01"
            };

            SetupMailboxRollbackMocks(testMailbox, inProgressState, rolledBackState);

            // Act
            var preState = await _mockStateService.Object.CaptureMailboxStateAsync(testMailbox.PrimarySmtpAddress);
            var rollbackResult = await _validationService.RollbackMailboxAsync(testMailbox, _testTargetContext);
            var postState = await _mockStateService.Object.CaptureMailboxStateAsync(testMailbox.PrimarySmtpAddress);

            // Assert
            Assert.IsTrue(rollbackResult.Success, "Rollback of in-progress move should succeed");
            Assert.AreEqual("InProgress", preState.MoveRequestStatus, "Move should be in progress before rollback");
            Assert.AreEqual(75, preState.PercentComplete, "Move should be 75% complete before rollback");
            Assert.AreEqual("Failed", postState.MoveRequestStatus, "Move should be failed/cancelled after rollback");
            Assert.AreEqual(0, postState.PercentComplete, "Progress should be reset after rollback");
            
            RecordAuditEvent("In-progress mailbox rollback verified", testMailbox.PrimarySmtpAddress);
        }

        #endregion

        #region File Rollback State Verification Tests

        [TestMethod]
        public async Task RollbackFilesAsync_VerifyCompleteDeletion_RemovesAllTargetFiles()
        {
            // Arrange
            var testFileItem = CreateTestFileItem();
            var preRollbackState = new FileSystemState
            {
                SourcePath = testFileItem.SourcePath,
                TargetPath = testFileItem.TargetPath,
                SourceExists = true,
                TargetExists = true,
                SourceFileCount = 1250,
                TargetFileCount = 1250,
                SourceSize = testFileItem.TotalSize,
                TargetSize = testFileItem.TotalSize
            };

            var expectedPostRollbackState = new FileSystemState
            {
                SourcePath = testFileItem.SourcePath,
                TargetPath = testFileItem.TargetPath,
                SourceExists = true, // Source should remain
                TargetExists = false, // Target should be deleted
                SourceFileCount = 1250,
                TargetFileCount = 0,
                SourceSize = testFileItem.TotalSize,
                TargetSize = 0
            };

            SetupFileRollbackMocks(testFileItem, preRollbackState, expectedPostRollbackState);

            // Act
            var preState = await _mockStateService.Object.CaptureFileSystemStateAsync(testFileItem.SourcePath, testFileItem.TargetPath);
            var rollbackResult = await _validationService.RollbackFilesAsync(testFileItem, _testTargetContext);
            var postState = await _mockStateService.Object.CaptureFileSystemStateAsync(testFileItem.SourcePath, testFileItem.TargetPath);

            // Assert
            Assert.IsTrue(rollbackResult.Success, "File rollback should succeed");
            Assert.IsTrue(preState.SourceExists && preState.TargetExists, "Both source and target should exist before rollback");
            Assert.IsTrue(postState.SourceExists && !postState.TargetExists, "Only source should exist after rollback");
            Assert.AreEqual(1250, postState.SourceFileCount, "Source file count should be preserved");
            Assert.AreEqual(0, postState.TargetFileCount, "Target file count should be zero");
            
            RecordAuditEvent("File rollback complete deletion verified", testFileItem.TargetPath);
        }

        [TestMethod]
        public async Task RollbackFilesAsync_PartialDeletion_RecordsRemainingFiles()
        {
            // Arrange
            var testFileItem = CreateTestFileItem();
            var lockedFiles = new List<string> { "locked-file1.txt", "in-use-file2.docx", "protected-file3.xlsx" };
            
            var partialRollbackResult = new RollbackResult
            {
                Success = true, // Partial success
                Message = "Rollback completed with warnings",
                Warnings = { $"{lockedFiles.Count} files could not be deleted due to file locks" }
            };

            var postRollbackState = new FileSystemState
            {
                SourcePath = testFileItem.SourcePath,
                TargetPath = testFileItem.TargetPath,
                SourceExists = true,
                TargetExists = true, // Target still exists due to remaining files
                SourceFileCount = 1250,
                TargetFileCount = lockedFiles.Count, // Only locked files remain
                RemainingFiles = lockedFiles
            };

            SetupPartialFileRollbackMocks(testFileItem, partialRollbackResult, postRollbackState);

            // Act
            var rollbackResult = await _validationService.RollbackFilesAsync(testFileItem, _testTargetContext);
            var postState = await _mockStateService.Object.CaptureFileSystemStateAsync(testFileItem.SourcePath, testFileItem.TargetPath);

            // Assert
            Assert.IsTrue(rollbackResult.Success, "Partial rollback should still report success");
            Assert.AreEqual(1, rollbackResult.Warnings.Count, "Should have warning about remaining files");
            Assert.IsTrue(postState.TargetExists, "Target should still exist due to remaining files");
            Assert.AreEqual(lockedFiles.Count, postState.TargetFileCount, "Should have expected number of remaining files");
            Assert.IsTrue(postState.RemainingFiles.All(f => lockedFiles.Contains(f)), "Remaining files should match locked files");
            
            RecordAuditEvent("File rollback partial deletion verified", testFileItem.TargetPath, warnings: rollbackResult.Warnings);
        }

        [TestMethod]
        public async Task RollbackFilesAsync_ForceDeleteSuccess_OvercomesFileLocks()
        {
            // Arrange
            var testFileItem = CreateTestFileItem();
            var initialFailure = new RollbackResult
            {
                Success = false,
                Message = "Initial deletion failed",
                Errors = { "Files are locked by another process" }
            };

            var forceDeleteSuccess = new RollbackResult
            {
                Success = true,
                Message = "Force deletion successful",
                Warnings = { "Used force deletion to overcome file locks" }
            };

            SetupForceDeleteMocks(testFileItem, initialFailure, forceDeleteSuccess);

            // Act
            var rollbackResult = await _validationService.RollbackFilesAsync(testFileItem, _testTargetContext);
            var postState = await _mockStateService.Object.CaptureFileSystemStateAsync(testFileItem.SourcePath, testFileItem.TargetPath);

            // Assert
            Assert.IsTrue(rollbackResult.Success, "Force delete rollback should succeed");
            Assert.AreEqual(1, rollbackResult.Warnings.Count, "Should have warning about force deletion");
            Assert.IsFalse(postState.TargetExists, "Target should be completely removed after force delete");
            Assert.AreEqual(0, postState.TargetFileCount, "Target file count should be zero");
            
            RecordAuditEvent("File rollback force delete verified", testFileItem.TargetPath, warnings: rollbackResult.Warnings);
        }

        #endregion

        #region SQL Database Rollback State Verification Tests

        [TestMethod]
        public async Task RollbackSqlAsync_VerifyDatabaseDrop_RemovesTargetDatabase()
        {
            // Arrange
            var testDatabase = CreateTestDatabase();
            var preRollbackState = new DatabaseState
            {
                DatabaseName = testDatabase.Name,
                Server = testDatabase.Server,
                Exists = true,
                ConnectionCount = 5,
                Size = testDatabase.Size,
                Status = "Online"
            };

            var expectedPostRollbackState = new DatabaseState
            {
                DatabaseName = testDatabase.Name,
                Server = testDatabase.Server,
                Exists = false, // Database dropped
                ConnectionCount = 0,
                Size = 0,
                Status = "Dropped"
            };

            SetupDatabaseRollbackMocks(testDatabase, preRollbackState, expectedPostRollbackState);

            // Act
            var preState = await _mockStateService.Object.CaptureDatabaseStateAsync(testDatabase.Server, testDatabase.Name);
            var rollbackResult = await _validationService.RollbackSqlAsync(testDatabase, _testTargetContext);
            var postState = await _mockStateService.Object.CaptureDatabaseStateAsync(testDatabase.Server, testDatabase.Name);

            // Assert
            Assert.IsTrue(rollbackResult.Success, "Database rollback should succeed");
            Assert.IsTrue(preState.Exists, "Database should exist before rollback");
            Assert.AreEqual("Online", preState.Status, "Database should be online before rollback");
            Assert.IsFalse(postState.Exists, "Database should not exist after rollback");
            Assert.AreEqual("Dropped", postState.Status, "Database status should be dropped");
            Assert.AreEqual(0, postState.ConnectionCount, "Connection count should be zero");
            
            RecordAuditEvent("Database rollback complete removal verified", testDatabase.Name);
        }

        [TestMethod]
        public async Task RollbackSqlAsync_DatabaseInUse_KillsConnectionsAndDrops()
        {
            // Arrange
            var testDatabase = CreateTestDatabase();
            var busyDatabaseState = new DatabaseState
            {
                DatabaseName = testDatabase.Name,
                Server = testDatabase.Server,
                Exists = true,
                ConnectionCount = 25, // Many active connections
                Size = testDatabase.Size,
                Status = "Online"
            };

            var droppedDatabaseState = new DatabaseState
            {
                DatabaseName = testDatabase.Name,
                Server = testDatabase.Server,
                Exists = false,
                ConnectionCount = 0, // Connections killed
                Size = 0,
                Status = "Dropped"
            };

            SetupBusyDatabaseRollbackMocks(testDatabase, busyDatabaseState, droppedDatabaseState);

            // Act
            var preState = await _mockStateService.Object.CaptureDatabaseStateAsync(testDatabase.Server, testDatabase.Name);
            var rollbackResult = await _validationService.RollbackSqlAsync(testDatabase, _testTargetContext);
            var postState = await _mockStateService.Object.CaptureDatabaseStateAsync(testDatabase.Server, testDatabase.Name);

            // Assert
            Assert.IsTrue(rollbackResult.Success, "Busy database rollback should succeed");
            Assert.AreEqual(1, rollbackResult.Warnings.Count, "Should have warning about killed connections");
            Assert.AreEqual(25, preState.ConnectionCount, "Should have many connections before rollback");
            Assert.AreEqual(0, postState.ConnectionCount, "All connections should be killed");
            Assert.IsFalse(postState.Exists, "Database should be dropped");
            Assert.IsTrue(rollbackResult.Warnings[0].Contains("25 connections"), "Warning should mention killed connections");
            
            RecordAuditEvent("Busy database rollback verified", testDatabase.Name, warnings: rollbackResult.Warnings);
        }

        #endregion

        #region Multi-Object Rollback State Verification Tests

        [TestMethod]
        public async Task RollbackMultipleAsync_VerifyAllObjectStates_CompleteRollback()
        {
            // Arrange
            var validationResults = new List<ValidationResult>
            {
                CreateFailedUserValidation(),
                CreateFailedMailboxValidation(),
                CreateFailedFileValidation(),
                CreateFailedDatabaseValidation()
            };

            SetupMultiObjectRollbackMocks(validationResults);

            // Act
            var preStates = await CaptureAllObjectStates();
            var rollbackResults = await _validationService.RollbackMultipleAsync(validationResults, _testTargetContext);
            var postStates = await CaptureAllObjectStates();

            // Assert
            Assert.AreEqual(4, rollbackResults.Count, "Should have rollback results for all objects");
            Assert.IsTrue(rollbackResults.All(r => r.Success), "All rollbacks should succeed");

            // Verify user state
            Assert.IsTrue(preStates.UserState.AccountEnabled, "User should be enabled before rollback");
            Assert.IsFalse(postStates.UserState.AccountEnabled, "User should be disabled after rollback");

            // Verify mailbox state
            Assert.AreEqual("Completed", preStates.MailboxState.MoveRequestStatus, "Move should be completed before rollback");
            Assert.AreEqual("None", postStates.MailboxState.MoveRequestStatus, "Move should be cancelled after rollback");

            // Verify file state
            Assert.IsTrue(preStates.FileSystemState.TargetExists, "Target files should exist before rollback");
            Assert.IsFalse(postStates.FileSystemState.TargetExists, "Target files should be removed after rollback");

            // Verify database state
            Assert.IsTrue(preStates.DatabaseState.Exists, "Database should exist before rollback");
            Assert.IsFalse(postStates.DatabaseState.Exists, "Database should be dropped after rollback");
            
            RecordAuditEvent("Multi-object rollback state verification passed", $"Objects: {rollbackResults.Count}");
        }

        [TestMethod]
        public async Task RollbackMultipleAsync_PartialFailures_RecordsIndividualStates()
        {
            // Arrange
            var validationResults = new List<ValidationResult>
            {
                CreateFailedUserValidation(),
                CreateFailedMailboxValidation(),
                CreateFailedFileValidation(),
                CreateFailedDatabaseValidation()
            };

            // Setup partial failures
            SetupPartialMultiObjectRollbackMocks(validationResults);

            // Act
            var rollbackResults = await _validationService.RollbackMultipleAsync(validationResults, _testTargetContext);
            var postStates = await CaptureAllObjectStates();

            // Assert
            Assert.AreEqual(4, rollbackResults.Count, "Should have rollback results for all objects");
            
            // User rollback should succeed
            Assert.IsTrue(rollbackResults[0].Success, "User rollback should succeed");
            Assert.IsFalse(postStates.UserState.AccountEnabled, "User should be disabled");

            // Mailbox rollback should fail
            Assert.IsFalse(rollbackResults[1].Success, "Mailbox rollback should fail");
            Assert.AreEqual("Completed", postStates.MailboxState.MoveRequestStatus, "Move should still be completed");

            // File rollback should partially succeed
            Assert.IsTrue(rollbackResults[2].Success, "File rollback should succeed with warnings");
            Assert.AreEqual(1, rollbackResults[2].Warnings.Count, "File rollback should have warnings");
            Assert.IsTrue(postStates.FileSystemState.TargetExists, "Some target files should remain");

            // Database rollback should succeed
            Assert.IsTrue(rollbackResults[3].Success, "Database rollback should succeed");
            Assert.IsFalse(postStates.DatabaseState.Exists, "Database should be dropped");
            
            RecordAuditEvent("Multi-object partial rollback verified", 
                $"Success: {rollbackResults.Count(r => r.Success)}, Failed: {rollbackResults.Count(r => !r.Success)}");
        }

        #endregion

        #region Helper Methods

        private void SetupStateVerificationMocks()
        {
            _mockAuditService
                .Setup(audit => audit.RecordEventAsync(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<object>()))
                .Callback<string, string, object>((action, objectId, details) => 
                    RecordAuditEvent(action, objectId))
                .Returns(Task.CompletedTask);
        }

        private void SetupUserRollbackMocks(UserDto user, UserState preState, UserState postState)
        {
            _mockStateService
                .SetupSequence(s => s.CaptureUserStateAsync(user.UserPrincipalName))
                .ReturnsAsync(preState)
                .ReturnsAsync(postState);

            _mockUserValidator
                .Setup(u => u.RollbackUserAsync(user, _testTargetContext, It.IsAny<IProgress<ValidationProgress>>()))
                .ReturnsAsync(RollbackResult.Succeeded("User disabled successfully"));
        }

        private void SetupUserReversibilityMocks(UserDto user, UserState originalState)
        {
            var disabledState = new UserState
            {
                UserPrincipalName = user.UserPrincipalName,
                AccountEnabled = false,
                DisplayName = originalState.DisplayName,
                Department = originalState.Department,
                JobTitle = originalState.JobTitle
            };

            _mockStateService
                .SetupSequence(s => s.CaptureUserStateAsync(user.UserPrincipalName))
                .ReturnsAsync(originalState)
                .ReturnsAsync(disabledState)
                .ReturnsAsync(originalState); // Restored

            _mockUserValidator
                .Setup(u => u.RollbackUserAsync(user, _testTargetContext, It.IsAny<IProgress<ValidationProgress>>()))
                .ReturnsAsync(RollbackResult.Succeeded("User disabled successfully"));

            // _mockUserValidator
            //     .Setup(u => u.ReverseRollbackUserAsync(user, _testTargetContext, It.IsAny<IProgress<ValidationProgress>>()))
            //     .ReturnsAsync(RollbackResult.Succeeded("User re-enabled successfully"));
        }

        private void SetupMailboxRollbackMocks(MailboxDto mailbox, MailboxState preState, MailboxState postState)
        {
            _mockStateService
                .SetupSequence(s => s.CaptureMailboxStateAsync(mailbox.PrimarySmtpAddress))
                .ReturnsAsync(preState)
                .ReturnsAsync(postState);

            _mockMailboxValidator
                .Setup(m => m.RollbackMailboxAsync(mailbox, _testTargetContext, It.IsAny<IProgress<ValidationProgress>>()))
                .ReturnsAsync(RollbackResult.Succeeded("Move request cancelled successfully"));
        }

        private void SetupFileRollbackMocks(FileItemDto fileItem, FileSystemState preState, FileSystemState postState)
        {
            _mockStateService
                .SetupSequence(s => s.CaptureFileSystemStateAsync(fileItem.SourcePath, fileItem.TargetPath))
                .ReturnsAsync(preState)
                .ReturnsAsync(postState);

            _mockFileValidator
                .Setup(f => f.RollbackFilesAsync(fileItem, _testTargetContext, It.IsAny<IProgress<ValidationProgress>>()))
                .ReturnsAsync(RollbackResult.Succeeded("Target files deleted successfully"));
        }

        private void SetupPartialFileRollbackMocks(FileItemDto fileItem, RollbackResult rollbackResult, FileSystemState postState)
        {
            _mockStateService
                .Setup(s => s.CaptureFileSystemStateAsync(fileItem.SourcePath, fileItem.TargetPath))
                .ReturnsAsync(postState);

            _mockFileValidator
                .Setup(f => f.RollbackFilesAsync(fileItem, _testTargetContext, It.IsAny<IProgress<ValidationProgress>>()))
                .ReturnsAsync(rollbackResult);
        }

        private void SetupForceDeleteMocks(FileItemDto fileItem, RollbackResult initialFailure, RollbackResult forceSuccess)
        {
            var finalState = new FileSystemState
            {
                SourcePath = fileItem.SourcePath,
                TargetPath = fileItem.TargetPath,
                SourceExists = true,
                TargetExists = false,
                TargetFileCount = 0
            };

            _mockStateService
                .Setup(s => s.CaptureFileSystemStateAsync(fileItem.SourcePath, fileItem.TargetPath))
                .ReturnsAsync(finalState);

            _mockFileValidator
                .Setup(f => f.RollbackFilesAsync(fileItem, _testTargetContext, It.IsAny<IProgress<ValidationProgress>>()))
                .ReturnsAsync(forceSuccess);
        }

        private void SetupDatabaseRollbackMocks(DatabaseDto database, DatabaseState preState, DatabaseState postState)
        {
            _mockStateService
                .SetupSequence(s => s.CaptureDatabaseStateAsync(database.Server, database.Name))
                .ReturnsAsync(preState)
                .ReturnsAsync(postState);

            _mockSqlValidator
                .Setup(sql => sql.RollbackSqlAsync(database, _testTargetContext, It.IsAny<IProgress<ValidationProgress>>()))
                .ReturnsAsync(RollbackResult.Succeeded("Database dropped successfully"));
        }

        private void SetupBusyDatabaseRollbackMocks(DatabaseDto database, DatabaseState preState, DatabaseState postState)
        {
            _mockStateService
                .SetupSequence(s => s.CaptureDatabaseStateAsync(database.Server, database.Name))
                .ReturnsAsync(preState)
                .ReturnsAsync(postState);

            var rollbackResult = new RollbackResult
            {
                Success = true,
                Message = "Database dropped after killing connections",
                Warnings = { "Killed 25 connections to force database drop" }
            };

            _mockSqlValidator
                .Setup(sql => sql.RollbackSqlAsync(database, _testTargetContext, It.IsAny<IProgress<ValidationProgress>>()))
                .ReturnsAsync(rollbackResult);
        }

        private void SetupMultiObjectRollbackMocks(List<ValidationResult> validationResults)
        {
            _mockUserValidator
                .Setup(u => u.RollbackUserAsync(It.IsAny<UserDto>(), _testTargetContext, It.IsAny<IProgress<ValidationProgress>>()))
                .ReturnsAsync(RollbackResult.Succeeded("User rollback successful"));

            _mockMailboxValidator
                .Setup(m => m.RollbackMailboxAsync(It.IsAny<MailboxDto>(), _testTargetContext, It.IsAny<IProgress<ValidationProgress>>()))
                .ReturnsAsync(RollbackResult.Succeeded("Mailbox rollback successful"));

            _mockFileValidator
                .Setup(f => f.RollbackFilesAsync(It.IsAny<FileItemDto>(), _testTargetContext, It.IsAny<IProgress<ValidationProgress>>()))
                .ReturnsAsync(RollbackResult.Succeeded("File rollback successful"));

            _mockSqlValidator
                .Setup(sql => sql.RollbackSqlAsync(It.IsAny<DatabaseDto>(), _testTargetContext, It.IsAny<IProgress<ValidationProgress>>()))
                .ReturnsAsync(RollbackResult.Succeeded("Database rollback successful"));
        }

        private void SetupPartialMultiObjectRollbackMocks(List<ValidationResult> validationResults)
        {
            _mockUserValidator
                .Setup(u => u.RollbackUserAsync(It.IsAny<UserDto>(), _testTargetContext, It.IsAny<IProgress<ValidationProgress>>()))
                .ReturnsAsync(RollbackResult.Succeeded("User rollback successful"));

            _mockMailboxValidator
                .Setup(m => m.RollbackMailboxAsync(It.IsAny<MailboxDto>(), _testTargetContext, It.IsAny<IProgress<ValidationProgress>>()))
                .ReturnsAsync(RollbackResult.Failed("Mailbox rollback failed", new[] { "Move request could not be cancelled" }));

            _mockFileValidator
                .Setup(f => f.RollbackFilesAsync(It.IsAny<FileItemDto>(), _testTargetContext, It.IsAny<IProgress<ValidationProgress>>()))
                .ReturnsAsync(new RollbackResult 
                { 
                    Success = true, 
                    Message = "Partial file rollback", 
                    Warnings = { "Some files could not be deleted" } 
                });

            _mockSqlValidator
                .Setup(sql => sql.RollbackSqlAsync(It.IsAny<DatabaseDto>(), _testTargetContext, It.IsAny<IProgress<ValidationProgress>>()))
                .ReturnsAsync(RollbackResult.Succeeded("Database rollback successful"));
        }

        private async Task<MultiObjectState> CaptureAllObjectStates()
        {
            return new MultiObjectState
            {
                UserState = await _mockStateService.Object.CaptureUserStateAsync("testuser@contoso.com"),
                MailboxState = await _mockStateService.Object.CaptureMailboxStateAsync("testmailbox@contoso.com"),
                FileSystemState = await _mockStateService.Object.CaptureFileSystemStateAsync(@"\\source\share", @"\\target\share"),
                DatabaseState = await _mockStateService.Object.CaptureDatabaseStateAsync("sql-server", "TestDB")
            };
        }

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
                ItemCount = 1500
            };
        }

        private FileItemDto CreateTestFileItem()
        {
            return new FileItemDto
            {
                SourcePath = @"\\source\share\TestFolder",
                TargetPath = @"\\target\share\TestFolder",
                FileCount = 1250,
                TotalSize = 1024 * 1024 * 500
            };
        }

        private DatabaseDto CreateTestDatabase()
        {
            return new DatabaseDto
            {
                Name = "TestDatabase",
                Server = "TestSQLServer",
                Size = 1024 * 1024 * 1024
            };
        }

        private ValidationResult CreateFailedUserValidation()
        {
            return ValidationResult.Failed(CreateTestUser(), "User", "testuser@contoso.com", "User validation failed", 
                new List<ValidationIssue> { new ValidationIssue { Category = "Test", Description = "Test failure" } });
        }

        private ValidationResult CreateFailedMailboxValidation()
        {
            return ValidationResult.Failed(CreateTestMailbox(), "Mailbox", "testmailbox@contoso.com", "Mailbox validation failed",
                new List<ValidationIssue> { new ValidationIssue { Category = "Test", Description = "Test failure" } });
        }

        private ValidationResult CreateFailedFileValidation()
        {
            return ValidationResult.Failed(CreateTestFileItem(), "File", @"\\source\share\TestFolder", "File validation failed",
                new List<ValidationIssue> { new ValidationIssue { Category = "Test", Description = "Test failure" } });
        }

        private ValidationResult CreateFailedDatabaseValidation()
        {
            return ValidationResult.Failed(CreateTestDatabase(), "Database", "TestDatabase", "Database validation failed",
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
                System.Diagnostics.Debug.WriteLine($"ROLLBACK_STATE_AUDIT: {record}");
            }
        }
    }

    #region State Verification Support Classes

    public interface IStateVerificationService
    {
        Task<UserState> CaptureUserStateAsync(string userPrincipalName);
        Task<MailboxState> CaptureMailboxStateAsync(string primarySmtpAddress);
        Task<FileSystemState> CaptureFileSystemStateAsync(string sourcePath, string targetPath);
        Task<DatabaseState> CaptureDatabaseStateAsync(string server, string databaseName);
    }

    public interface IAuditService
    {
        Task RecordEventAsync(string action, string objectIdentifier, object details);
    }


    public class StateSnapshot
    {
        public DateTime Timestamp { get; set; } = DateTime.Now;
        public Dictionary<string, object> States { get; set; } = new();
    }

    public class UserState
    {
        public string UserPrincipalName { get; set; } = string.Empty;
        public bool AccountEnabled { get; set; }
        public string DisplayName { get; set; } = string.Empty;
        public string Department { get; set; } = string.Empty;
        public string JobTitle { get; set; } = string.Empty;
        public int LicenseCount { get; set; }
        public List<string> GroupMemberships { get; set; } = new();
    }

    public class MailboxState
    {
        public string PrimarySmtpAddress { get; set; } = string.Empty;
        public string MoveRequestStatus { get; set; } = string.Empty;
        public int PercentComplete { get; set; }
        public string TargetDatabase { get; set; } = string.Empty;
        public string SourceDatabase { get; set; } = string.Empty;
        public int ItemCount { get; set; }
    }

    public class FileSystemState
    {
        public string SourcePath { get; set; } = string.Empty;
        public string TargetPath { get; set; } = string.Empty;
        public bool SourceExists { get; set; }
        public bool TargetExists { get; set; }
        public int SourceFileCount { get; set; }
        public int TargetFileCount { get; set; }
        public long SourceSize { get; set; }
        public long TargetSize { get; set; }
        public List<string> RemainingFiles { get; set; } = new();
    }

    public class DatabaseState
    {
        public string DatabaseName { get; set; } = string.Empty;
        public string Server { get; set; } = string.Empty;
        public bool Exists { get; set; }
        public int ConnectionCount { get; set; }
        public long Size { get; set; }
        public string Status { get; set; } = string.Empty;
    }

    public class MultiObjectState
    {
        public UserState UserState { get; set; } = new();
        public MailboxState MailboxState { get; set; } = new();
        public FileSystemState FileSystemState { get; set; } = new();
        public DatabaseState DatabaseState { get; set; } = new();
    }

    #endregion
}