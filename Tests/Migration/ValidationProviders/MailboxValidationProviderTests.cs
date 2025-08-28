using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Graph;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using Moq;
using MandADiscoverySuite.Migration;

namespace MandADiscoverySuite.Tests.Migration.ValidationProviders
{
    /// <summary>
    /// Comprehensive tests for MailboxValidationProvider - validates mailbox migrations including item counts, folder structure, and rollback operations
    /// </summary>
    [TestClass]
    public class MailboxValidationProviderTests
    {
        private MailboxValidationProvider _mailboxValidator;
        private Mock<GraphServiceClient> _mockGraphClient;
        private Mock<IPowerShellService> _mockPowerShellService;
        private TargetContext _testTargetContext;
        private MailboxDto _testMailbox;
        private List<string> _auditRecords;

        [TestInitialize]
        public void Setup()
        {
            _mockGraphClient = new Mock<GraphServiceClient>();
            _mockPowerShellService = new Mock<IPowerShellService>();
            _auditRecords = new List<string>();

            _mailboxValidator = new MailboxValidationProvider(_mockGraphClient.Object, _mockPowerShellService.Object);

            _testTargetContext = new TargetContext
            {
                TenantId = "test-tenant-123",
                Environment = "Test"
            };

            _testMailbox = new MailboxDto
            {
                PrimarySmtpAddress = "john.doe@contoso.com",
                DisplayName = "John Doe",
                Database = "DB01",
                TotalItemSize = 1024 * 1024 * 500, // 500 MB
                ItemCount = 2500,
                FolderCount = 25
            };
        }

        #region Mailbox Existence Tests

        [TestMethod]
        public async Task ValidateMailboxAsync_MailboxExists_ReturnsSuccess()
        {
            // Arrange
            var mockMailboxStats = new MailboxStatistics
            {
                ItemCount = _testMailbox.ItemCount,
                TotalItemSize = _testMailbox.TotalItemSize,
                FolderCount = _testMailbox.FolderCount
            };

            SetupGraphMailboxMock(true);
            SetupPowerShellMailboxStatsMock(mockMailboxStats);
            SetupPowerShellFolderStructureMock(CreateTestFolderStructure());

            // Act
            var result = await _mailboxValidator.ValidateMailboxAsync(_testMailbox, _testTargetContext);

            // Assert
            Assert.AreEqual(ValidationSeverity.Success, result.Severity);
            Assert.AreEqual(_testMailbox.PrimarySmtpAddress, result.ObjectName);
            Assert.AreEqual(0, result.Issues.Count);
            RecordAuditEvent("Mailbox validation passed", _testMailbox.PrimarySmtpAddress);
        }

        [TestMethod]
        public async Task ValidateMailboxAsync_MailboxNotFound_ReturnsError()
        {
            // Arrange
            SetupGraphMailboxMock(false);

            // Act
            var result = await _mailboxValidator.ValidateMailboxAsync(_testMailbox, _testTargetContext);

            // Assert
            Assert.AreEqual(ValidationSeverity.Error, result.Severity);
            Assert.IsTrue(result.HasIssueWithCategory("Mailbox Existence"));
            Assert.IsTrue(result.GetIssueByCategory("Mailbox Existence").Description.Contains("not found"));
            RecordAuditEvent("Mailbox validation failed - not found", _testMailbox.PrimarySmtpAddress);
        }

        #endregion

        #region Item Count Validation Tests

        [TestMethod]
        public async Task ValidateMailboxAsync_ItemCountMatch_ReturnsSuccess()
        {
            // Arrange
            var mockMailboxStats = new MailboxStatistics
            {
                ItemCount = _testMailbox.ItemCount, // Exact match
                TotalItemSize = _testMailbox.TotalItemSize,
                FolderCount = _testMailbox.FolderCount
            };

            SetupGraphMailboxMock(true);
            SetupPowerShellMailboxStatsMock(mockMailboxStats);

            // Act
            var result = await _mailboxValidator.ValidateMailboxAsync(_testMailbox, _testTargetContext);

            // Assert
            Assert.IsFalse(result.HasIssueWithCategory("Item Count"));
            RecordAuditEvent("Mailbox validation - item count matches", _testMailbox.PrimarySmtpAddress);
        }

        [TestMethod]
        public async Task ValidateMailboxAsync_ItemCountMismatch_ReturnsError()
        {
            // Arrange
            var mockMailboxStats = new MailboxStatistics
            {
                ItemCount = _testMailbox.ItemCount - 50, // Missing 50 items
                TotalItemSize = _testMailbox.TotalItemSize - (1024 * 50), // Proportional size difference
                FolderCount = _testMailbox.FolderCount
            };

            SetupGraphMailboxMock(true);
            SetupPowerShellMailboxStatsMock(mockMailboxStats);

            // Act
            var result = await _mailboxValidator.ValidateMailboxAsync(_testMailbox, _testTargetContext);

            // Assert
            Assert.AreEqual(ValidationSeverity.Error, result.Severity);
            Assert.IsTrue(result.HasIssueWithCategory("Item Count"));
            var issue = result.GetIssueByCategory("Item Count");
            Assert.IsTrue(issue.Description.Contains("50 items missing"));
            RecordAuditEvent("Mailbox validation failed - item count mismatch", _testMailbox.PrimarySmtpAddress);
        }

        [TestMethod]
        public async Task ValidateMailboxAsync_ItemCountWithinTolerance_ReturnsWarning()
        {
            // Arrange
            var mockMailboxStats = new MailboxStatistics
            {
                ItemCount = _testMailbox.ItemCount - 2, // Within 1% tolerance
                TotalItemSize = _testMailbox.TotalItemSize,
                FolderCount = _testMailbox.FolderCount
            };

            SetupGraphMailboxMock(true);
            SetupPowerShellMailboxStatsMock(mockMailboxStats);

            // Act
            var result = await _mailboxValidator.ValidateMailboxAsync(_testMailbox, _testTargetContext);

            // Assert
            Assert.IsTrue(result.HasIssueWithSeverity(ValidationSeverity.Warning));
            Assert.IsTrue(result.HasIssueWithCategory("Item Count"));
            RecordAuditEvent("Mailbox validation - minor item count difference", _testMailbox.PrimarySmtpAddress);
        }

        #endregion

        #region Size Validation Tests

        [TestMethod]
        public async Task ValidateMailboxAsync_SizeMismatch_ReturnsError()
        {
            // Arrange
            var mockMailboxStats = new MailboxStatistics
            {
                ItemCount = _testMailbox.ItemCount,
                TotalItemSize = _testMailbox.TotalItemSize / 2, // Half the expected size
                FolderCount = _testMailbox.FolderCount
            };

            SetupGraphMailboxMock(true);
            SetupPowerShellMailboxStatsMock(mockMailboxStats);

            // Act
            var result = await _mailboxValidator.ValidateMailboxAsync(_testMailbox, _testTargetContext);

            // Assert
            Assert.AreEqual(ValidationSeverity.Error, result.Severity);
            Assert.IsTrue(result.HasIssueWithCategory("Size Validation"));
            var issue = result.GetIssueByCategory("Size Validation");
            Assert.IsTrue(issue.Description.Contains("size mismatch"));
            RecordAuditEvent("Mailbox validation failed - size mismatch", _testMailbox.PrimarySmtpAddress);
        }

        #endregion

        #region Folder Structure Validation Tests

        [TestMethod]
        public async Task ValidateMailboxAsync_FolderStructure_ValidatesCorrectly()
        {
            // Arrange
            var expectedFolders = CreateTestFolderStructure();
            var mockMailboxStats = new MailboxStatistics
            {
                ItemCount = _testMailbox.ItemCount,
                TotalItemSize = _testMailbox.TotalItemSize,
                FolderCount = expectedFolders.Count
            };

            SetupGraphMailboxMock(true);
            SetupPowerShellMailboxStatsMock(mockMailboxStats);
            SetupPowerShellFolderStructureMock(expectedFolders);

            // Act
            var result = await _mailboxValidator.ValidateMailboxAsync(_testMailbox, _testTargetContext);

            // Assert
            Assert.IsFalse(result.HasIssueWithCategory("Folder Structure"));
            RecordAuditEvent("Mailbox validation - folder structure correct", _testMailbox.PrimarySmtpAddress);
        }

        [TestMethod]
        public async Task ValidateMailboxAsync_MissingFolders_ReturnsError()
        {
            // Arrange
            var incompleteFolders = CreateTestFolderStructure().Take(10).ToList(); // Missing folders
            var mockMailboxStats = new MailboxStatistics
            {
                ItemCount = _testMailbox.ItemCount,
                TotalItemSize = _testMailbox.TotalItemSize,
                FolderCount = incompleteFolders.Count
            };

            SetupGraphMailboxMock(true);
            SetupPowerShellMailboxStatsMock(mockMailboxStats);
            SetupPowerShellFolderStructureMock(incompleteFolders);

            // Act
            var result = await _mailboxValidator.ValidateMailboxAsync(_testMailbox, _testTargetContext);

            // Assert
            Assert.IsTrue(result.HasIssueWithCategory("Folder Structure"));
            var issue = result.GetIssueByCategory("Folder Structure");
            Assert.IsTrue(issue.Description.Contains("folder count mismatch"));
            RecordAuditEvent("Mailbox validation failed - missing folders", _testMailbox.PrimarySmtpAddress);
        }

        #endregion

        #region Exchange Online Specific Tests

        [TestMethod]
        public async Task ValidateMailboxAsync_MoveRequestStatus_ValidatesInProgress()
        {
            // Arrange
            var moveRequest = new MoveRequestStatus
            {
                Status = "InProgress",
                PercentComplete = 85,
                BadItemsEncountered = 0
            };

            SetupGraphMailboxMock(true);
            SetupPowerShellMoveRequestMock(moveRequest);

            // Act
            var result = await _mailboxValidator.ValidateMailboxAsync(_testMailbox, _testTargetContext);

            // Assert
            Assert.IsTrue(result.HasIssueWithCategory("Move Request"));
            Assert.IsTrue(result.HasIssueWithSeverity(ValidationSeverity.Warning));
            RecordAuditEvent("Mailbox validation - move request in progress", _testMailbox.PrimarySmtpAddress);
        }

        [TestMethod]
        public async Task ValidateMailboxAsync_MoveRequestCompleted_ReturnsSuccess()
        {
            // Arrange
            var moveRequest = new MoveRequestStatus
            {
                Status = "Completed",
                PercentComplete = 100,
                BadItemsEncountered = 0
            };

            SetupGraphMailboxMock(true);
            SetupPowerShellMoveRequestMock(moveRequest);
            SetupPowerShellMailboxStatsMock(new MailboxStatistics
            {
                ItemCount = _testMailbox.ItemCount,
                TotalItemSize = _testMailbox.TotalItemSize,
                FolderCount = _testMailbox.FolderCount
            });

            // Act
            var result = await _mailboxValidator.ValidateMailboxAsync(_testMailbox, _testTargetContext);

            // Assert
            Assert.IsFalse(result.HasIssueWithCategory("Move Request"));
            RecordAuditEvent("Mailbox validation - move request completed", _testMailbox.PrimarySmtpAddress);
        }

        [TestMethod]
        public async Task ValidateMailboxAsync_BadItemsEncountered_ReturnsWarning()
        {
            // Arrange
            var moveRequest = new MoveRequestStatus
            {
                Status = "Completed",
                PercentComplete = 100,
                BadItemsEncountered = 5 // Some items couldn't be migrated
            };

            SetupGraphMailboxMock(true);
            SetupPowerShellMoveRequestMock(moveRequest);

            // Act
            var result = await _mailboxValidator.ValidateMailboxAsync(_testMailbox, _testTargetContext);

            // Assert
            Assert.IsTrue(result.HasIssueWithCategory("Move Request"));
            Assert.IsTrue(result.HasIssueWithSeverity(ValidationSeverity.Warning));
            var issue = result.GetIssueByCategory("Move Request");
            Assert.IsTrue(issue.Description.Contains("5 bad items"));
            RecordAuditEvent("Mailbox validation - bad items encountered", _testMailbox.PrimarySmtpAddress);
        }

        #endregion

        #region Rollback Tests

        [TestMethod]
        public async Task RollbackMailboxAsync_Success_CancelsMoveRequest()
        {
            // Arrange
            SetupPowerShellCancelMoveRequestMock(true);

            // Act
            var result = await _mailboxValidator.RollbackMailboxAsync(_testMailbox, _testTargetContext);

            // Assert
            Assert.IsTrue(result.Success);
            Assert.IsTrue(result.Message.Contains("successfully"));
            _mockPowerShellService.Verify(ps => ps.ExecuteAsync(It.Is<string>(cmd => cmd.Contains("Remove-MoveRequest"))), Times.Once);
            RecordAuditEvent("Mailbox rollback successful", _testMailbox.PrimarySmtpAddress);
        }

        [TestMethod]
        public async Task RollbackMailboxAsync_MoveRequestNotFound_ReturnsPartialSuccess()
        {
            // Arrange
            SetupPowerShellCancelMoveRequestMock(false, "Move request not found");

            // Act
            var result = await _mailboxValidator.RollbackMailboxAsync(_testMailbox, _testTargetContext);

            // Assert
            Assert.IsTrue(result.Success);
            Assert.AreEqual(1, result.Warnings.Count);
            Assert.IsTrue(result.Warnings[0].Contains("Move request not found"));
            RecordAuditEvent("Mailbox rollback - move request not found", _testMailbox.PrimarySmtpAddress);
        }

        [TestMethod]
        public async Task RollbackMailboxAsync_PowerShellError_ReturnsFailure()
        {
            // Arrange
            _mockPowerShellService
                .Setup(ps => ps.ExecuteAsync(It.IsAny<string>()))
                .ThrowsAsync(new InvalidOperationException("PowerShell connection failed"));

            // Act
            var result = await _mailboxValidator.RollbackMailboxAsync(_testMailbox, _testTargetContext);

            // Assert
            Assert.IsFalse(result.Success);
            Assert.IsTrue(result.Message.Contains("PowerShell connection failed"));
            Assert.AreEqual(1, result.Errors.Count);
            RecordAuditEvent("Mailbox rollback failed", _testMailbox.PrimarySmtpAddress, errors: result.Errors);
        }

        #endregion

        #region Performance Tests

        [TestMethod]
        public async Task ValidateMailboxAsync_LargeMailbox_HandlesPerformantly()
        {
            // Arrange
            var largeMailbox = new MailboxDto
            {
                PrimarySmtpAddress = "large.mailbox@contoso.com",
                ItemCount = 100000, // Large mailbox
                TotalItemSize = 1024L * 1024L * 1024L * 10, // 10 GB
                FolderCount = 500
            };

            var mockStats = new MailboxStatistics
            {
                ItemCount = largeMailbox.ItemCount,
                TotalItemSize = largeMailbox.TotalItemSize,
                FolderCount = largeMailbox.FolderCount
            };

            SetupGraphMailboxMock(true);
            SetupPowerShellMailboxStatsMock(mockStats);

            var stopwatch = System.Diagnostics.Stopwatch.StartNew();

            // Act
            var result = await _mailboxValidator.ValidateMailboxAsync(largeMailbox, _testTargetContext);

            // Assert
            stopwatch.Stop();
            Assert.IsTrue(stopwatch.ElapsedMilliseconds < 30000, "Large mailbox validation should complete within 30 seconds");
            Assert.AreEqual(ValidationSeverity.Success, result.Severity);
            RecordAuditEvent("Large mailbox validation completed", largeMailbox.PrimarySmtpAddress, additionalInfo: $"Duration: {stopwatch.ElapsedMilliseconds}ms");
        }

        #endregion

        #region Helper Methods

        private void SetupGraphMailboxMock(bool exists)
        {
            if (exists)
            {
                var mockUser = new User
                {
                    Id = "user-123",
                    Mail = _testMailbox.PrimarySmtpAddress,
                    DisplayName = _testMailbox.DisplayName
                };

                var mockUsersRequest = new Mock<IUsersCollectionRequestBuilder>();
                var mockUserRequest = new Mock<IUserRequestBuilder>();
                var mockUserGetRequest = new Mock<IUserRequest>();

                _mockGraphClient.Setup(g => g.Users).Returns(mockUsersRequest.Object);
                mockUsersRequest.Setup(u => u[_testMailbox.PrimarySmtpAddress]).Returns(mockUserRequest.Object);
                mockUserRequest.Setup(u => u.Request()).Returns(mockUserGetRequest.Object);
                mockUserGetRequest.Setup(r => r.GetAsync()).ReturnsAsync(mockUser);
            }
            else
            {
                var mockUsersRequest = new Mock<IUsersCollectionRequestBuilder>();
                var mockUserRequest = new Mock<IUserRequestBuilder>();
                var mockUserGetRequest = new Mock<IUserRequest>();

                _mockGraphClient.Setup(g => g.Users).Returns(mockUsersRequest.Object);
                mockUsersRequest.Setup(u => u[_testMailbox.PrimarySmtpAddress]).Returns(mockUserRequest.Object);
                mockUserRequest.Setup(u => u.Request()).Returns(mockUserGetRequest.Object);
                mockUserGetRequest.Setup(r => r.GetAsync()).ThrowsAsync(new ServiceException(new Error { Code = "Request_ResourceNotFound" }));
            }
        }

        private void SetupPowerShellMailboxStatsMock(MailboxStatistics stats)
        {
            var command = $"Get-MailboxStatistics -Identity '{_testMailbox.PrimarySmtpAddress}'";
            _mockPowerShellService
                .Setup(ps => ps.ExecuteAsync(It.Is<string>(cmd => cmd.Contains("Get-MailboxStatistics"))))
                .ReturnsAsync(new PowerShellResult
                {
                    Success = true,
                    Output = SerializeMailboxStats(stats)
                });
        }

        private void SetupPowerShellFolderStructureMock(List<MailboxFolder> folders)
        {
            var command = $"Get-MailboxFolderStatistics -Identity '{_testMailbox.PrimarySmtpAddress}'";
            _mockPowerShellService
                .Setup(ps => ps.ExecuteAsync(It.Is<string>(cmd => cmd.Contains("Get-MailboxFolderStatistics"))))
                .ReturnsAsync(new PowerShellResult
                {
                    Success = true,
                    Output = SerializeFolderStats(folders)
                });
        }

        private void SetupPowerShellMoveRequestMock(MoveRequestStatus moveRequest)
        {
            var command = $"Get-MoveRequest -Identity '{_testMailbox.PrimarySmtpAddress}'";
            _mockPowerShellService
                .Setup(ps => ps.ExecuteAsync(It.Is<string>(cmd => cmd.Contains("Get-MoveRequest"))))
                .ReturnsAsync(new PowerShellResult
                {
                    Success = true,
                    Output = SerializeMoveRequest(moveRequest)
                });
        }

        private void SetupPowerShellCancelMoveRequestMock(bool success, string errorMessage = null)
        {
            _mockPowerShellService
                .Setup(ps => ps.ExecuteAsync(It.Is<string>(cmd => cmd.Contains("Remove-MoveRequest"))))
                .ReturnsAsync(new PowerShellResult
                {
                    Success = success,
                    Output = success ? "Move request cancelled successfully" : null,
                    ErrorMessage = errorMessage
                });
        }

        private List<MailboxFolder> CreateTestFolderStructure()
        {
            return new List<MailboxFolder>
            {
                new MailboxFolder { Name = "Inbox", ItemCount = 1500 },
                new MailboxFolder { Name = "Sent Items", ItemCount = 800 },
                new MailboxFolder { Name = "Deleted Items", ItemCount = 200 },
                new MailboxFolder { Name = "Drafts", ItemCount = 0 },
                new MailboxFolder { Name = "Calendar", ItemCount = 0 },
                new MailboxFolder { Name = "Contacts", ItemCount = 0 },
                new MailboxFolder { Name = "Tasks", ItemCount = 0 },
                new MailboxFolder { Name = "Notes", ItemCount = 0 },
                new MailboxFolder { Name = "Journal", ItemCount = 0 },
                new MailboxFolder { Name = "Junk Email", ItemCount = 0 },
                new MailboxFolder { Name = "Archive", ItemCount = 0 },
                new MailboxFolder { Name = "Projects", ItemCount = 0 },
                new MailboxFolder { Name = "Personal", ItemCount = 0 },
                new MailboxFolder { Name = "Finance", ItemCount = 0 },
                new MailboxFolder { Name = "HR", ItemCount = 0 },
                new MailboxFolder { Name = "IT", ItemCount = 0 },
                new MailboxFolder { Name = "Marketing", ItemCount = 0 },
                new MailboxFolder { Name = "Sales", ItemCount = 0 },
                new MailboxFolder { Name = "Support", ItemCount = 0 },
                new MailboxFolder { Name = "Legal", ItemCount = 0 },
                new MailboxFolder { Name = "Compliance", ItemCount = 0 },
                new MailboxFolder { Name = "Executive", ItemCount = 0 },
                new MailboxFolder { Name = "Reports", ItemCount = 0 },
                new MailboxFolder { Name = "Meetings", ItemCount = 0 },
                new MailboxFolder { Name = "Travel", ItemCount = 0 }
            };
        }

        private string SerializeMailboxStats(MailboxStatistics stats)
        {
            return $"{{\"ItemCount\":{stats.ItemCount},\"TotalItemSize\":{stats.TotalItemSize},\"FolderCount\":{stats.FolderCount}}}";
        }

        private string SerializeFolderStats(List<MailboxFolder> folders)
        {
            var folderData = string.Join(",", folders.Select(f => $"{{\"Name\":\"{f.Name}\",\"ItemCount\":{f.ItemCount}}}"));
            return $"[{folderData}]";
        }

        private string SerializeMoveRequest(MoveRequestStatus moveRequest)
        {
            return $"{{\"Status\":\"{moveRequest.Status}\",\"PercentComplete\":{moveRequest.PercentComplete},\"BadItemsEncountered\":{moveRequest.BadItemsEncountered}}}";
        }

        private void RecordAuditEvent(string action, string objectIdentifier, List<string> errors = null, string additionalInfo = null)
        {
            var timestamp = DateTime.Now;
            var auditRecord = $"{timestamp:yyyy-MM-dd HH:mm:ss} - {action} - Object: {objectIdentifier}";
            
            if (errors?.Count > 0)
            {
                auditRecord += $" - Errors: {errors.Count}";
            }

            if (!string.IsNullOrEmpty(additionalInfo))
            {
                auditRecord += $" - Info: {additionalInfo}";
            }

            _auditRecords.Add(auditRecord);
        }

        #endregion

        [TestCleanup]
        public void Cleanup()
        {
            Assert.IsTrue(_auditRecords.Count > 0, "Audit records should be created for mailbox validation operations");
            
            foreach (var record in _auditRecords)
            {
                System.Diagnostics.Debug.WriteLine($"MAILBOX_VALIDATION_AUDIT: {record}");
            }
        }
    }

    #region Test Support Classes

    public class MailboxStatistics
    {
        public int ItemCount { get; set; }
        public long TotalItemSize { get; set; }
        public int FolderCount { get; set; }
    }

    public class MailboxFolder
    {
        public string Name { get; set; } = string.Empty;
        public int ItemCount { get; set; }
    }

    public class MoveRequestStatus
    {
        public string Status { get; set; } = string.Empty;
        public int PercentComplete { get; set; }
        public int BadItemsEncountered { get; set; }
    }

    public interface IPowerShellService
    {
        Task<PowerShellResult> ExecuteAsync(string command);
    }

    public class PowerShellResult
    {
        public bool Success { get; set; }
        public string Output { get; set; } = string.Empty;
        public string ErrorMessage { get; set; } = string.Empty;
    }

    #endregion
}