using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Graph;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using Moq;
using MandADiscoverySuite.Migration;

namespace MandADiscoverySuite.Tests.Migration.ValidationProviders
{
    /// <summary>
    /// Comprehensive tests for UserValidationProvider - validates user accounts, licensing, and rollback operations
    ///
    /// Note: This test class is currently disabled due to Microsoft Graph v5 API changes.
    /// The old v4 interfaces are not compatible with v5. This will need to be updated to use the new API patterns.
    /// </summary>
    /*
    [TestClass]
    public class UserValidationProviderTests
    {
        private UserValidationProvider _userValidator;
        private Mock<GraphServiceClient> _mockGraphClient;
        private Mock<IUsersCollectionRequestBuilder> _mockUsersRequest;
        private Mock<IUserRequestBuilder> _mockUserRequest;
        private Mock<IUserRequest> _mockUserGetRequest;
        private Mock<IUserRequest> _mockUserUpdateRequest;
        private TargetContext _testTargetContext;
        private UserDto _testUser;
        private List<string> _auditRecords;

        [TestInitialize]
        public void Setup()
        {
            _mockGraphClient = new Mock<GraphServiceClient>();
            _mockUsersRequest = new Mock<IUsersCollectionRequestBuilder>();
            _mockUserRequest = new Mock<IUserRequestBuilder>();
            _mockUserGetRequest = new Mock<IUserRequest>();
            _mockUserUpdateRequest = new Mock<IUserRequest>();
            _auditRecords = new List<string>();

            // Setup Graph client mock chain
            _mockGraphClient.Setup(g => g.Users).Returns(_mockUsersRequest.Object);
            _mockUsersRequest.Setup(u => u[It.IsAny<string>()]).Returns(_mockUserRequest.Object);
            _mockUserRequest.Setup(u => u.Request()).Returns(_mockUserGetRequest.Object);

            _userValidator = new UserValidationProvider(_mockGraphClient.Object);

            _testTargetContext = new TargetContext
            {
                TenantId = "test-tenant-123",
                Environment = "Test"
            };

            _testUser = new UserDto
            {
                DisplayName = "John Doe",
                UserPrincipalName = "john.doe@contoso.com",
                SamAccountName = "jdoe",
                Department = "Finance",
                JobTitle = "Senior Analyst"
            };
        }

        #region Account Existence Tests

        [TestMethod]
        public async Task ValidateUserAsync_AccountExists_ReturnsSuccess()
        {
            // Arrange
            var mockUser = new User
            {
                Id = "user-123",
                DisplayName = _testUser.DisplayName,
                UserPrincipalName = _testUser.UserPrincipalName,
                AccountEnabled = true,
                AssignedLicenses = new List<AssignedLicense> { new AssignedLicense { SkuId = Guid.NewGuid() } }
            };

            SetupGraphUserMock(mockUser);
            SetupGraphUserDetailsMock(mockUser);
            SetupGraphMemberOfMock(new List<DirectoryObject> { CreateTestGroup("Test Group") });

            // Act
            var result = await _userValidator.ValidateUserAsync(_testUser, _testTargetContext);

            // Assert
            Assert.AreEqual(ValidationSeverity.Success, result.Severity);
            Assert.AreEqual(_testUser.DisplayName, result.ObjectName);
            Assert.AreEqual(0, result.Issues.Count);
            RecordAuditEvent("User validation passed", _testUser.UserPrincipalName);
        }

        [TestMethod]
        public async Task ValidateUserAsync_AccountNotFound_ReturnsError()
        {
            // Arrange
            _mockUserGetRequest
                .Setup(r => r.GetAsync())
                .ThrowsAsync(new ServiceException(new Error { Code = "Request_ResourceNotFound" }));

            // Act
            var result = await _userValidator.ValidateUserAsync(_testUser, _testTargetContext);

            // Assert
            Assert.AreEqual(ValidationSeverity.Error, result.Severity);
            Assert.AreEqual(1, result.Issues.Count);
            Assert.AreEqual("Account Existence", result.Issues[0].Category);
            Assert.IsTrue(result.Issues[0].Description.Contains("not found"));
            RecordAuditEvent("User validation failed - account not found", _testUser.UserPrincipalName);
        }

        [TestMethod]
        public async Task ValidateUserAsync_AccountDisabled_ReturnsError()
        {
            // Arrange
            var mockUser = new User
            {
                Id = "user-123",
                DisplayName = _testUser.DisplayName,
                UserPrincipalName = _testUser.UserPrincipalName,
                AccountEnabled = false // Account is disabled
            };

            SetupGraphUserMock(mockUser);

            // Act
            var result = await _userValidator.ValidateUserAsync(_testUser, _testTargetContext);

            // Assert
            Assert.AreEqual(ValidationSeverity.Error, result.Severity);
            Assert.IsTrue(result.Issues.Any(i => i.Category == "Account Status"));
            Assert.IsTrue(result.Issues.Any(i => i.Description.Contains("disabled")));
            RecordAuditEvent("User validation failed - account disabled", _testUser.UserPrincipalName);
        }

        #endregion

        #region Licensing Tests

        [TestMethod]
        public async Task ValidateUserAsync_NoLicenses_ReturnsWarning()
        {
            // Arrange
            var mockUser = new User
            {
                Id = "user-123",
                DisplayName = _testUser.DisplayName,
                UserPrincipalName = _testUser.UserPrincipalName,
                AccountEnabled = true,
                AssignedLicenses = new List<AssignedLicense>() // No licenses
            };

            SetupGraphUserMock(mockUser);
            SetupGraphLicensingMock(mockUser);

            // Act
            var result = await _userValidator.ValidateUserAsync(_testUser, _testTargetContext);

            // Assert
            Assert.IsTrue(result.Issues.Any(i => i.Category == "Licensing"));
            Assert.IsTrue(result.Issues.Any(i => i.Severity == ValidationSeverity.Warning));
            Assert.IsTrue(result.Issues.Any(i => i.Description.Contains("no assigned licenses")));
            RecordAuditEvent("User validation - no licenses assigned", _testUser.UserPrincipalName);
        }

        [TestMethod]
        public async Task ValidateUserAsync_LicenseAssignmentError_ReturnsError()
        {
            // Arrange
            var mockUser = new User
            {
                Id = "user-123",
                DisplayName = _testUser.DisplayName,
                UserPrincipalName = _testUser.UserPrincipalName,
                AccountEnabled = true,
                AssignedLicenses = new List<AssignedLicense> { new AssignedLicense { SkuId = Guid.NewGuid() } },
                LicenseAssignmentStates = new List<LicenseAssignmentState>
                {
                    new LicenseAssignmentState
                    {
                        SkuId = Guid.NewGuid().ToString(),
                        Error = "InsufficientLicenses"
                    }
                }
            };

            SetupGraphUserMock(mockUser);
            SetupGraphLicensingMock(mockUser);

            // Act
            var result = await _userValidator.ValidateUserAsync(_testUser, _testTargetContext);

            // Assert
            Assert.IsTrue(result.Issues.Any(i => i.Category == "Licensing"));
            Assert.IsTrue(result.Issues.Any(i => i.Severity == ValidationSeverity.Error));
            Assert.IsTrue(result.Issues.Any(i => i.Description.Contains("InsufficientLicenses")));
            RecordAuditEvent("User validation - license assignment error", _testUser.UserPrincipalName);
        }

        #endregion

        #region Attribute Validation Tests

        [TestMethod]
        public async Task ValidateUserAsync_AttributeMismatch_ReturnsWarning()
        {
            // Arrange
            var mockUser = new User
            {
                Id = "user-123",
                DisplayName = "Different Name", // Mismatch
                UserPrincipalName = _testUser.UserPrincipalName,
                AccountEnabled = true,
                Mail = "john.doe@contoso.com",
                JobTitle = "Different Title", // Mismatch
                Department = _testUser.Department
            };

            SetupGraphUserMock(mockUser);
            SetupGraphAttributesMock(mockUser);

            // Act
            var result = await _userValidator.ValidateUserAsync(_testUser, _testTargetContext);

            // Assert
            Assert.IsTrue(result.Issues.Any(i => i.Category == "Attributes"));
            Assert.IsTrue(result.Issues.Any(i => i.Description.Contains("Display name mismatch")));
            RecordAuditEvent("User validation - attribute mismatch", _testUser.UserPrincipalName);
        }

        [TestMethod]
        public async Task ValidateUserAsync_UpnMismatch_ReturnsError()
        {
            // Arrange
            var mockUser = new User
            {
                Id = "user-123",
                DisplayName = _testUser.DisplayName,
                UserPrincipalName = "different.user@contoso.com", // Critical mismatch
                AccountEnabled = true
            };

            SetupGraphUserMock(mockUser);
            SetupGraphAttributesMock(mockUser);

            // Act
            var result = await _userValidator.ValidateUserAsync(_testUser, _testTargetContext);

            // Assert
            Assert.IsTrue(result.Issues.Any(i => i.Category == "Attributes"));
            Assert.IsTrue(result.Issues.Any(i => i.Severity == ValidationSeverity.Error));
            Assert.IsTrue(result.Issues.Any(i => i.Description.Contains("UPN mismatch")));
            RecordAuditEvent("User validation - UPN mismatch", _testUser.UserPrincipalName);
        }

        #endregion

        #region Group Membership Tests

        [TestMethod]
        public async Task ValidateUserAsync_NoGroupMemberships_ReturnsWarning()
        {
            // Arrange
            var mockUser = new User
            {
                Id = "user-123",
                DisplayName = _testUser.DisplayName,
                UserPrincipalName = _testUser.UserPrincipalName,
                AccountEnabled = true,
                AssignedLicenses = new List<AssignedLicense> { new AssignedLicense { SkuId = Guid.NewGuid() } }
            };

            SetupGraphUserMock(mockUser);
            SetupGraphMemberOfMock(new List<DirectoryObject>()); // Empty group list

            // Act
            var result = await _userValidator.ValidateUserAsync(_testUser, _testTargetContext);

            // Assert
            Assert.IsTrue(result.Issues.Any(i => i.Category == "Group Memberships"));
            Assert.IsTrue(result.Issues.Any(i => i.Description.Contains("not a member of any groups")));
            RecordAuditEvent("User validation - no group memberships", _testUser.UserPrincipalName);
        }

        #endregion

        #region Rollback Tests

        [TestMethod]
        public async Task RollbackUserAsync_Success_DisablesAccount()
        {
            // Arrange
            _mockUserUpdateRequest
                .Setup(r => r.UpdateAsync(It.Is<User>(u => u.AccountEnabled == false)))
                .ReturnsAsync(new User { AccountEnabled = false });

            _mockUserRequest.Setup(u => u.Request()).Returns(_mockUserUpdateRequest.Object);

            // Act
            var result = await _userValidator.RollbackUserAsync(_testUser, _testTargetContext);

            // Assert
            Assert.IsTrue(result.Success);
            Assert.IsTrue(result.Message.Contains("successfully"));
            Assert.AreEqual(0, result.Errors.Count);
            _mockUserUpdateRequest.Verify(r => r.UpdateAsync(It.Is<User>(u => u.AccountEnabled == false)), Times.Once);
            RecordAuditEvent("User rollback successful", _testUser.UserPrincipalName);
        }

        [TestMethod]
        public async Task RollbackUserAsync_GraphApiError_ReturnsFailure()
        {
            // Arrange
            _mockUserUpdateRequest
                .Setup(r => r.UpdateAsync(It.IsAny<User>()))
                .ThrowsAsync(new ServiceException(new Error { Code = "Forbidden", Message = "Insufficient privileges" }));

            _mockUserRequest.Setup(u => u.Request()).Returns(_mockUserUpdateRequest.Object);

            // Act
            var result = await _userValidator.RollbackUserAsync(_testUser, _testTargetContext);

            // Assert
            Assert.IsFalse(result.Success);
            Assert.IsTrue(result.Message.Contains("Insufficient privileges"));
            Assert.AreEqual(1, result.Errors.Count);
            RecordAuditEvent("User rollback failed", _testUser.UserPrincipalName, errors: result.Errors);
        }

        [TestMethod]
        public async Task RollbackUserAsync_NoGraphClient_ReturnsFailure()
        {
            // Arrange
            var validatorWithoutGraph = new UserValidationProvider(null);

            // Act
            var result = await validatorWithoutGraph.RollbackUserAsync(_testUser, _testTargetContext);

            // Assert
            Assert.IsFalse(result.Success);
            Assert.IsTrue(result.Message.Contains("missing Graph client"));
            Assert.IsTrue(result.Errors.Any(e => e.Contains("Graph client not configured")));
            RecordAuditEvent("User rollback failed - no Graph client", _testUser.UserPrincipalName);
        }

        #endregion

        #region State Verification Tests

        [TestMethod]
        public async Task ValidateUserAsync_WithProgressReporting_ReportsCorrectSteps()
        {
            // Arrange
            var mockUser = CreateCompleteValidUser();
            SetupCompleteGraphMocks(mockUser);
            
            var progressReports = new List<ValidationProgress>();
            var progress = new Progress<ValidationProgress>(p => progressReports.Add(p));

            // Act
            var result = await _userValidator.ValidateUserAsync(_testUser, _testTargetContext, progress);

            // Assert
            Assert.IsTrue(progressReports.Count >= 2); // Start and completion reports
            Assert.IsTrue(progressReports.Any(p => p.CurrentStep.Contains("Validating user")));
            Assert.IsTrue(progressReports.Any(p => p.PercentageComplete == 100));
            RecordAuditEvent("User validation with progress tracking", _testUser.UserPrincipalName);
        }

        [TestMethod]
        public async Task RollbackUserAsync_WithProgressReporting_ReportsRollbackSteps()
        {
            // Arrange
            _mockUserUpdateRequest
                .Setup(r => r.UpdateAsync(It.IsAny<User>()))
                .ReturnsAsync(new User { AccountEnabled = false });
            _mockUserRequest.Setup(u => u.Request()).Returns(_mockUserUpdateRequest.Object);

            var progressReports = new List<ValidationProgress>();
            var progress = new Progress<ValidationProgress>(p => progressReports.Add(p));

            // Act
            var result = await _userValidator.RollbackUserAsync(_testUser, _testTargetContext, progress);

            // Assert
            Assert.IsTrue(result.Success);
            Assert.IsTrue(progressReports.Count >= 2);
            Assert.IsTrue(progressReports.Any(p => p.CurrentStep.Contains("Rolling back user")));
            Assert.IsTrue(progressReports.Any(p => p.CurrentStep.Contains("Rollback complete")));
            RecordAuditEvent("User rollback with progress tracking", _testUser.UserPrincipalName);
        }

        #endregion

        #region Performance and Load Tests

        [TestMethod]
        public async Task ValidateUserAsync_ConcurrentValidations_HandlesMultipleUsers()
        {
            // Arrange
            var users = new List<UserDto>();
            for (int i = 0; i < 10; i++)
            {
                users.Add(new UserDto
                {
                    DisplayName = $"Test User {i}",
                    UserPrincipalName = $"testuser{i}@contoso.com",
                    SamAccountName = $"testuser{i}"
                });
            }

            var mockUser = CreateCompleteValidUser();
            SetupCompleteGraphMocks(mockUser);

            // Act
            var tasks = users.Select(user => _userValidator.ValidateUserAsync(user, _testTargetContext));
            var results = await Task.WhenAll(tasks);

            // Assert
            Assert.AreEqual(10, results.Length);
            Assert.IsTrue(results.All(r => r.ObjectType == "User"));
            RecordAuditEvent("Concurrent user validations completed", $"Count: {results.Length}");
        }

        #endregion

        #region Helper Methods

        private void SetupGraphUserMock(User mockUser)
        {
            _mockUserGetRequest
                .Setup(r => r.GetAsync())
                .ReturnsAsync(mockUser);
        }

        private void SetupGraphUserDetailsMock(User mockUser)
        {
            _mockUserGetRequest
                .Setup(r => r.Select(It.IsAny<string>()).GetAsync())
                .ReturnsAsync(mockUser);
        }

        private void SetupGraphLicensingMock(User mockUser)
        {
            _mockUserGetRequest
                .Setup(r => r.Select("assignedLicenses,licenseAssignmentStates").GetAsync())
                .ReturnsAsync(mockUser);
        }

        private void SetupGraphAttributesMock(User mockUser)
        {
            _mockUserGetRequest
                .Setup(r => r.Select("displayName,mail,userPrincipalName,jobTitle,department,officeLocation").GetAsync())
                .ReturnsAsync(mockUser);
        }

        private void SetupGraphMemberOfMock(List<DirectoryObject> groups)
        {
            var mockMemberOfRequest = new Mock<IUserMemberOfCollectionWithReferencesRequestBuilder>();
            var mockMemberOfGetRequest = new Mock<IUserMemberOfCollectionWithReferencesRequest>();

            _mockUserRequest.Setup(u => u.MemberOf).Returns(mockMemberOfRequest.Object);
            mockMemberOfRequest.Setup(m => m.Request()).Returns(mockMemberOfGetRequest.Object);
            mockMemberOfGetRequest.Setup(r => r.GetAsync()).ReturnsAsync(groups);
        }

        private void SetupCompleteGraphMocks(User mockUser)
        {
            SetupGraphUserMock(mockUser);
            SetupGraphUserDetailsMock(mockUser);
            SetupGraphLicensingMock(mockUser);
            SetupGraphAttributesMock(mockUser);
            SetupGraphMemberOfMock(new List<DirectoryObject> { CreateTestGroup("Test Group") });
        }

        private User CreateCompleteValidUser()
        {
            return new User
            {
                Id = "user-123",
                DisplayName = _testUser.DisplayName,
                UserPrincipalName = _testUser.UserPrincipalName,
                AccountEnabled = true,
                AssignedLicenses = new List<AssignedLicense> { new AssignedLicense { SkuId = Guid.NewGuid() } },
                Mail = _testUser.UserPrincipalName,
                JobTitle = _testUser.JobTitle,
                Department = _testUser.Department
            };
        }

        private DirectoryObject CreateTestGroup(string name)
        {
            return new Group
            {
                Id = Guid.NewGuid().ToString(),
                DisplayName = name
            };
        }

        private void RecordAuditEvent(string action, string objectIdentifier, List<string> errors = null)
        {
            var timestamp = DateTime.Now;
            var auditRecord = $"{timestamp:yyyy-MM-dd HH:mm:ss} - {action} - Object: {objectIdentifier}";
            
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
            // Verify audit records were created
            Assert.IsTrue(_auditRecords.Count > 0, "Audit records should be created for validation operations");

            // Log audit records for verification
            foreach (var record in _auditRecords)
            {
                System.Diagnostics.Debug.WriteLine($"USER_VALIDATION_AUDIT: {record}");
            }
        }
    }
    */

    #region Extension Methods for Better Testing

    public static class ValidationTestExtensions
    {
        public static bool HasIssueWithCategory(this ValidationResult result, string category)
        {
            return result.Issues.Any(i => i.Category.Equals(category, StringComparison.OrdinalIgnoreCase));
        }

        public static bool HasIssueWithSeverity(this ValidationResult result, ValidationSeverity severity)
        {
            return result.Issues.Any(i => i.Severity == severity);
        }

        public static ValidationIssue GetIssueByCategory(this ValidationResult result, string category)
        {
            return result.Issues.FirstOrDefault(i => i.Category.Equals(category, StringComparison.OrdinalIgnoreCase));
        }
    }

    #endregion
}