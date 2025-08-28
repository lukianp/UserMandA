using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using Microsoft.Graph;
using Microsoft.Graph.Auth;
using Microsoft.Identity.Client;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using Moq;
using MandADiscoverySuite.Services;
using MandADiscoverySuite.Models;

namespace MandADiscoverySuite.Tests.Migration.Notifications
{
    /// <summary>
    /// Comprehensive test suite for T-033 Graph Notification Service
    /// Tests Graph API integration, notification sending, error handling, and user data retrieval with mocks
    /// </summary>
    [TestClass]
    public class GraphNotificationServiceTests
    {
        #region Test Setup

        private Mock<ILogger<GraphNotificationService>> _mockLogger;
        private Mock<NotificationTemplateService> _mockTemplateService;
        private Mock<ILogicEngineService> _mockLogicEngineService;
        private Mock<GraphServiceClient> _mockGraphServiceClient;
        private Mock<IUsersCollectionRequestBuilder> _mockUsersRequestBuilder;
        private Mock<IUserRequestBuilder> _mockUserRequestBuilder;
        private Mock<IUserRequest> _mockUserRequest;
        private Mock<IUsersCollectionRequest> _mockUsersCollectionRequest;
        private Mock<IMeRequestBuilder> _mockMeRequestBuilder;
        private Mock<IUserRequest> _mockMeRequest;
        private GraphNotificationService _notificationService;
        private GraphNotificationConfiguration _testConfig;

        [TestInitialize]
        public void TestInitialize()
        {
            _mockLogger = new Mock<ILogger<GraphNotificationService>>();
            _mockTemplateService = new Mock<NotificationTemplateService>();
            _mockLogicEngineService = new Mock<ILogicEngineService>();
            
            // Set up Graph API mocks
            SetupGraphServiceClientMocks();
            
            _testConfig = new GraphNotificationConfiguration
            {
                TenantId = "test-tenant-id",
                ClientId = "test-client-id",
                ClientSecret = "test-client-secret",
                Authority = "https://login.microsoftonline.com/test-tenant-id",
                SenderEmail = "notifications@company.com",
                DefaultCompanyName = "Test Company",
                MaxBatchSize = 10,
                BatchDelayMs = 100
            };

            _notificationService = new GraphNotificationService(
                _mockTemplateService.Object, 
                _mockLogicEngineService.Object, 
                _mockLogger.Object);
        }

        [TestCleanup]
        public void TestCleanup()
        {
            _notificationService?.Dispose();
        }

        private void SetupGraphServiceClientMocks()
        {
            _mockGraphServiceClient = new Mock<GraphServiceClient>();
            _mockUsersRequestBuilder = new Mock<IUsersCollectionRequestBuilder>();
            _mockUserRequestBuilder = new Mock<IUserRequestBuilder>();
            _mockUserRequest = new Mock<IUserRequest>();
            _mockUsersCollectionRequest = new Mock<IUsersCollectionRequest>();
            _mockMeRequestBuilder = new Mock<IMeRequestBuilder>();
            _mockMeRequest = new Mock<IUserRequest>();

            // Setup Graph service client property chain
            _mockGraphServiceClient.Setup(g => g.Users).Returns(_mockUsersRequestBuilder.Object);
            _mockGraphServiceClient.Setup(g => g.Me).Returns(_mockMeRequestBuilder.Object);
            
            _mockUsersRequestBuilder.Setup(u => u[It.IsAny<string>()]).Returns(_mockUserRequestBuilder.Object);
            _mockUsersRequestBuilder.Setup(u => u.Request()).Returns(_mockUsersCollectionRequest.Object);
            
            _mockUserRequestBuilder.Setup(u => u.Request()).Returns(_mockUserRequest.Object);
            _mockMeRequestBuilder.Setup(m => m.Request()).Returns(_mockMeRequest.Object);
        }

        #endregion

        #region Configuration Tests

        [TestMethod]
        public async Task ConfigureAsync_ValidConfiguration_ReturnsTrue()
        {
            // Arrange
            var testUser = new User
            {
                DisplayName = "Test User",
                UserPrincipalName = "test@company.com"
            };

            _mockMeRequest.Setup(m => m.GetAsync())
                         .ReturnsAsync(testUser);

            var usersCollection = new Mock<ICollectionPage<User>>();
            usersCollection.Setup(u => u.Count).Returns(1);
            _mockUsersCollectionRequest.Setup(u => u.GetAsync())
                                     .ReturnsAsync(usersCollection.Object);

            // Act
            var result = await _notificationService.ConfigureAsync(_testConfig);

            // Assert
            Assert.IsTrue(result, "Configuration should succeed with valid settings");
            Assert.IsTrue(_notificationService.IsConfigured);
        }

        [TestMethod]
        public async Task ConfigureAsync_NullConfiguration_ReturnsFalse()
        {
            // Arrange & Act
            var result = await _notificationService.ConfigureAsync(null);

            // Assert
            Assert.IsFalse(result, "Configuration should fail with null configuration");
            Assert.IsFalse(_notificationService.IsConfigured);
        }

        [TestMethod]
        public async Task ConfigureAsync_InvalidConfiguration_ReturnsFalse()
        {
            // Arrange
            var invalidConfig = new GraphNotificationConfiguration
            {
                TenantId = null, // Missing required field
                ClientId = "test-client-id",
                ClientSecret = "test-client-secret"
            };

            // Act
            var result = await _notificationService.ConfigureAsync(invalidConfig);

            // Assert
            Assert.IsFalse(result, "Configuration should fail with invalid settings");
            Assert.IsFalse(_notificationService.IsConfigured);
        }

        [TestMethod]
        public void Configuration_IsValid_ValidatesCorrectly()
        {
            // Arrange & Act
            var validConfig = _testConfig;
            var invalidConfig1 = new GraphNotificationConfiguration(); // All nulls
            var invalidConfig2 = new GraphNotificationConfiguration
            {
                TenantId = "valid",
                ClientId = "valid",
                ClientSecret = "valid",
                SenderEmail = null // Missing sender email
            };

            // Assert
            Assert.IsTrue(validConfig.IsValid, "Valid configuration should be valid");
            Assert.IsFalse(invalidConfig1.IsValid, "Empty configuration should be invalid");
            Assert.IsFalse(invalidConfig2.IsValid, "Configuration without sender email should be invalid");
        }

        #endregion

        #region Connection Testing Tests

        [TestMethod]
        public async Task TestConnectionAsync_ValidConnection_ReturnsSuccess()
        {
            // Arrange
            await SetupValidGraphConfiguration();

            var testUser = new User
            {
                DisplayName = "Test User",
                UserPrincipalName = "test@company.com"
            };

            _mockMeRequest.Setup(m => m.GetAsync()).ReturnsAsync(testUser);

            var usersCollection = new Mock<ICollectionPage<User>>();
            usersCollection.Setup(u => u.Count).Returns(1);
            _mockUsersCollectionRequest.Setup(u => u.GetAsync()).ReturnsAsync(usersCollection.Object);

            // Act
            var result = await _notificationService.TestConnectionAsync();

            // Assert
            Assert.IsTrue(result.Success, "Connection test should succeed");
            Assert.IsTrue(result.AuthenticationTest, "Authentication test should pass");
            Assert.IsTrue(result.UserReadPermission, "User read permission should be available");
            Assert.IsTrue(result.MailSendPermission, "Mail send permission should be available");
            Assert.AreEqual("Test User", result.AuthenticatedUser);
        }

        [TestMethod]
        public async Task TestConnectionAsync_AuthenticationFailure_ReturnsFailure()
        {
            // Arrange
            await SetupValidGraphConfiguration();

            _mockMeRequest.Setup(m => m.GetAsync())
                         .ThrowsAsync(new ServiceException(new Error { Code = "Unauthorized", Message = "Authentication failed" }));

            // Act
            var result = await _notificationService.TestConnectionAsync();

            // Assert
            Assert.IsFalse(result.Success, "Connection test should fail");
            Assert.IsFalse(result.AuthenticationTest, "Authentication test should fail");
            Assert.IsTrue(result.TestResults.Any(r => r.Contains("Authentication failed")));
        }

        [TestMethod]
        public async Task TestConnectionAsync_UserPermissionFailure_ReturnsPartialSuccess()
        {
            // Arrange
            await SetupValidGraphConfiguration();

            var testUser = new User { DisplayName = "Test User" };
            _mockMeRequest.Setup(m => m.GetAsync()).ReturnsAsync(testUser);

            _mockUsersCollectionRequest.Setup(u => u.GetAsync())
                                     .ThrowsAsync(new ServiceException(new Error { Code = "Forbidden", Message = "Insufficient privileges" }));

            // Act
            var result = await _notificationService.TestConnectionAsync();

            // Assert
            Assert.IsFalse(result.Success, "Connection test should fail due to missing permissions");
            Assert.IsTrue(result.AuthenticationTest, "Authentication should succeed");
            Assert.IsFalse(result.UserReadPermission, "User read permission should fail");
            Assert.IsTrue(result.TestResults.Any(r => r.Contains("User read permission failed")));
        }

        [TestMethod]
        public async Task TestConnectionAsync_NotConfigured_ReturnsFailure()
        {
            // Arrange - Don't configure the service

            // Act
            var result = await _notificationService.TestConnectionAsync();

            // Assert
            Assert.IsFalse(result.Success, "Connection test should fail when not configured");
            Assert.AreEqual("Graph service client is not initialized", result.ErrorMessage);
        }

        #endregion

        #region User Data Retrieval Tests

        [TestMethod]
        public async Task GetUserDataAsync_ByEmail_ReturnsUserData()
        {
            // Arrange
            await SetupValidGraphConfiguration();

            var testUser = new User
            {
                UserPrincipalName = "john.smith@company.com",
                DisplayName = "John Smith",
                Mail = "john.smith@company.com",
                GivenName = "John",
                Surname = "Smith",
                JobTitle = "Software Engineer",
                Department = "IT",
                OfficeLocation = "Building A",
                MobilePhone = "+1234567890",
                BusinessPhones = new List<string> { "+1234567891" }
            };

            _mockUserRequest.Setup(u => u.GetAsync()).ReturnsAsync(testUser);

            // Act
            var result = await _notificationService.GetUserDataAsync("john.smith@company.com");

            // Assert
            Assert.IsNotNull(result);
            Assert.AreEqual("john.smith@company.com", result.UserPrincipalName);
            Assert.AreEqual("John Smith", result.DisplayName);
            Assert.AreEqual("john.smith@company.com", result.Email);
            Assert.AreEqual("John", result.FirstName);
            Assert.AreEqual("Smith", result.LastName);
            Assert.AreEqual("Software Engineer", result.JobTitle);
            Assert.AreEqual("IT", result.Department);
        }

        [TestMethod]
        public async Task GetUserDataAsync_ByDisplayName_ReturnsUserData()
        {
            // Arrange
            await SetupValidGraphConfiguration();

            var testUser = new User
            {
                UserPrincipalName = "john.smith@company.com",
                DisplayName = "John Smith",
                Mail = "john.smith@company.com"
            };

            // First call (by ID) fails, second call (search by display name) succeeds
            _mockUserRequest.SetupSequence(u => u.GetAsync())
                           .ThrowsAsync(new ServiceException(new Error { Code = "NotFound" }))
                           .ReturnsAsync(testUser);

            var usersCollection = new Mock<ICollectionPage<User>>();
            var userList = new List<User> { testUser };
            usersCollection.Setup(u => u.GetEnumerator()).Returns(userList.GetEnumerator());
            usersCollection.Setup(u => u.FirstOrDefault()).Returns(testUser);

            _mockUsersCollectionRequest.Setup(u => u.GetAsync()).ReturnsAsync(usersCollection.Object);

            // Act
            var result = await _notificationService.GetUserDataAsync("John Smith");

            // Assert
            Assert.IsNotNull(result);
            Assert.AreEqual("John Smith", result.DisplayName);
        }

        [TestMethod]
        public async Task GetUserDataAsync_UserNotFound_ReturnsNull()
        {
            // Arrange
            await SetupValidGraphConfiguration();

            _mockUserRequest.Setup(u => u.GetAsync())
                           .ThrowsAsync(new ServiceException(new Error { Code = "NotFound", Message = "User not found" }));

            var emptyUsersCollection = new Mock<ICollectionPage<User>>();
            var emptyUserList = new List<User>();
            emptyUsersCollection.Setup(u => u.GetEnumerator()).Returns(emptyUserList.GetEnumerator());
            emptyUsersCollection.Setup(u => u.FirstOrDefault()).Returns((User)null);

            _mockUsersCollectionRequest.Setup(u => u.GetAsync()).ReturnsAsync(emptyUsersCollection.Object);

            // Act
            var result = await _notificationService.GetUserDataAsync("nonexistent@company.com");

            // Assert
            Assert.IsNull(result);
        }

        [TestMethod]
        public async Task GetUserDataAsync_LogicEngineFirst_PrefersLogicEngine()
        {
            // Arrange
            var logicEngineUser = new UserNotificationData
            {
                UserPrincipalName = "john.smith@company.com",
                DisplayName = "John Smith (Logic Engine)",
                Email = "john.smith@company.com"
            };

            _mockLogicEngineService.Setup(s => s.GetUserDataAsync(It.IsAny<string>()))
                                  .ReturnsAsync(logicEngineUser);

            // Act
            var result = await _notificationService.GetUserDataAsync("john.smith@company.com");

            // Assert
            Assert.IsNotNull(result);
            Assert.AreEqual("John Smith (Logic Engine)", result.DisplayName);
            
            // Verify Graph API was not called
            _mockUserRequest.Verify(u => u.GetAsync(), Times.Never);
        }

        [TestMethod]
        public async Task GetUserDataAsync_GraphAPIException_ReturnsNull()
        {
            // Arrange
            await SetupValidGraphConfiguration();

            _mockUserRequest.Setup(u => u.GetAsync())
                           .ThrowsAsync(new Exception("Graph API error"));

            // Act
            var result = await _notificationService.GetUserDataAsync("john.smith@company.com");

            // Assert
            Assert.IsNull(result);
        }

        #endregion

        #region Notification Sending Tests

        [TestMethod]
        public async Task SendNotificationAsync_ValidInput_SendsSuccessfully()
        {
            // Arrange
            await SetupValidGraphConfiguration();
            
            var template = CreateTestTemplate("test-template", NotificationTemplateType.PreMigration);
            var userData = CreateTestUserData();

            _mockTemplateService.Setup(s => s.GetTemplateAsync("test-template"))
                              .ReturnsAsync(template);

            var preview = CreateTestPreview(template);
            _mockTemplateService.Setup(s => s.CreatePreview(It.IsAny<NotificationTemplate>(), It.IsAny<object>()))
                              .Returns(preview);

            // Mock successful email sending
            var mockMeSendMailRequestBuilder = new Mock<IUserSendMailRequestBuilder>();
            var mockMeSendMailRequest = new Mock<IUserSendMailRequest>();
            
            _mockMeRequestBuilder.Setup(m => m.SendMail(It.IsAny<Message>(), It.IsAny<bool>()))
                               .Returns(mockMeSendMailRequestBuilder.Object);
            mockMeSendMailRequestBuilder.Setup(r => r.Request())
                                      .Returns(mockMeSendMailRequest.Object);
            mockMeSendMailRequest.Setup(r => r.PostAsync())
                                .Returns(Task.CompletedTask);

            // Act
            var result = await _notificationService.SendNotificationAsync("test-template", "john.smith@company.com");

            // Assert
            Assert.IsTrue(result.Success, "Notification should send successfully");
            Assert.AreEqual("test-template", result.TemplateId);
            Assert.AreEqual("john.smith@company.com", result.UserIdentifier);
            Assert.IsNotNull(result.SentAt);
            Assert.IsTrue(result.Recipients.Contains("john.smith@company.com"));
        }

        [TestMethod]
        public async Task SendNotificationAsync_TemplateNotFound_ReturnsFailure()
        {
            // Arrange
            await SetupValidGraphConfiguration();
            
            _mockTemplateService.Setup(s => s.GetTemplateAsync("nonexistent-template"))
                              .ReturnsAsync((NotificationTemplate)null);

            // Act
            var result = await _notificationService.SendNotificationAsync("nonexistent-template", "john.smith@company.com");

            // Assert
            Assert.IsFalse(result.Success, "Should fail when template not found");
            Assert.IsTrue(result.ErrorMessage.Contains("Template nonexistent-template not found"));
        }

        [TestMethod]
        public async Task SendNotificationAsync_InactiveTemplate_ReturnsFailure()
        {
            // Arrange
            await SetupValidGraphConfiguration();
            
            var template = CreateTestTemplate("inactive-template", NotificationTemplateType.PreMigration);
            template.IsActive = false;

            _mockTemplateService.Setup(s => s.GetTemplateAsync("inactive-template"))
                              .ReturnsAsync(template);

            // Act
            var result = await _notificationService.SendNotificationAsync("inactive-template", "john.smith@company.com");

            // Assert
            Assert.IsFalse(result.Success, "Should fail when template is inactive");
            Assert.IsTrue(result.ErrorMessage.Contains("is not active"));
        }

        [TestMethod]
        public async Task SendNotificationAsync_UserNotFound_ReturnsFailure()
        {
            // Arrange
            await SetupValidGraphConfiguration();
            
            var template = CreateTestTemplate("test-template", NotificationTemplateType.PreMigration);
            _mockTemplateService.Setup(s => s.GetTemplateAsync("test-template"))
                              .ReturnsAsync(template);

            // Mock user not found scenario
            _mockLogicEngineService.Setup(s => s.GetUserDataAsync(It.IsAny<string>()))
                                  .ReturnsAsync((UserNotificationData)null);

            _mockUserRequest.Setup(u => u.GetAsync())
                           .ThrowsAsync(new ServiceException(new Error { Code = "NotFound" }));

            // Act
            var result = await _notificationService.SendNotificationAsync("test-template", "nonexistent@company.com");

            // Assert
            Assert.IsFalse(result.Success, "Should fail when user not found");
            Assert.IsTrue(result.ErrorMessage.Contains("User nonexistent@company.com not found"));
        }

        [TestMethod]
        public async Task SendNotificationAsync_NotConfigured_ReturnsFailure()
        {
            // Arrange - Don't configure the service
            var template = CreateTestTemplate("test-template", NotificationTemplateType.PreMigration);
            _mockTemplateService.Setup(s => s.GetTemplateAsync("test-template"))
                              .ReturnsAsync(template);

            // Act
            var result = await _notificationService.SendNotificationAsync("test-template", "john.smith@company.com");

            // Assert
            Assert.IsFalse(result.Success, "Should fail when not configured");
            Assert.IsTrue(result.ErrorMessage.Contains("not configured or authenticated"));
        }

        [TestMethod]
        public async Task SendNotificationAsync_GraphAPIError_ReturnsFailure()
        {
            // Arrange
            await SetupValidGraphConfiguration();
            
            var template = CreateTestTemplate("test-template", NotificationTemplateType.PreMigration);
            var userData = CreateTestUserData();

            _mockTemplateService.Setup(s => s.GetTemplateAsync("test-template"))
                              .ReturnsAsync(template);

            var preview = CreateTestPreview(template);
            _mockTemplateService.Setup(s => s.CreatePreview(It.IsAny<NotificationTemplate>(), It.IsAny<object>()))
                              .Returns(preview);

            // Mock Graph API error
            var mockMeSendMailRequestBuilder = new Mock<IUserSendMailRequestBuilder>();
            var mockMeSendMailRequest = new Mock<IUserSendMailRequest>();
            
            _mockMeRequestBuilder.Setup(m => m.SendMail(It.IsAny<Message>(), It.IsAny<bool>()))
                               .Returns(mockMeSendMailRequestBuilder.Object);
            mockMeSendMailRequestBuilder.Setup(r => r.Request())
                                      .Returns(mockMeSendMailRequest.Object);
            mockMeSendMailRequest.Setup(r => r.PostAsync())
                                .ThrowsAsync(new ServiceException(new Error 
                                { 
                                    Code = "Throttled", 
                                    Message = "Request was throttled" 
                                }));

            // Act
            var result = await _notificationService.SendNotificationAsync("test-template", "john.smith@company.com");

            // Assert
            Assert.IsFalse(result.Success, "Should fail when Graph API throws error");
            Assert.IsTrue(result.ErrorMessage.Contains("Request was throttled"));
        }

        #endregion

        #region Bulk Notification Tests

        [TestMethod]
        public async Task SendBulkNotificationAsync_ValidInput_SendsToAllUsers()
        {
            // Arrange
            await SetupValidGraphConfiguration();
            
            var template = CreateTestTemplate("bulk-template", NotificationTemplateType.PreMigration);
            var userIdentifiers = new List<string> { "user1@company.com", "user2@company.com", "user3@company.com" };

            _mockTemplateService.Setup(s => s.GetTemplateAsync("bulk-template"))
                              .ReturnsAsync(template);

            var preview = CreateTestPreview(template);
            _mockTemplateService.Setup(s => s.CreatePreview(It.IsAny<NotificationTemplate>(), It.IsAny<object>()))
                              .Returns(preview);

            // Mock successful email sending for all users
            var mockMeSendMailRequestBuilder = new Mock<IUserSendMailRequestBuilder>();
            var mockMeSendMailRequest = new Mock<IUserSendMailRequest>();
            
            _mockMeRequestBuilder.Setup(m => m.SendMail(It.IsAny<Message>(), It.IsAny<bool>()))
                               .Returns(mockMeSendMailRequestBuilder.Object);
            mockMeSendMailRequestBuilder.Setup(r => r.Request())
                                      .Returns(mockMeSendMailRequest.Object);
            mockMeSendMailRequest.Setup(r => r.PostAsync())
                                .Returns(Task.CompletedTask);

            // Act
            var result = await _notificationService.SendBulkNotificationAsync("bulk-template", userIdentifiers);

            // Assert
            Assert.IsTrue(result.Success, "Bulk notification should succeed");
            Assert.AreEqual(userIdentifiers.Count, result.TotalUsers);
            Assert.AreEqual(userIdentifiers.Count, result.SuccessCount);
            Assert.AreEqual(0, result.FailureCount);
            Assert.AreEqual(userIdentifiers.Count, result.SuccessfulNotifications.Count);
        }

        [TestMethod]
        public async Task SendBulkNotificationAsync_PartialFailure_ReturnsPartialSuccess()
        {
            // Arrange
            await SetupValidGraphConfiguration();
            
            var template = CreateTestTemplate("bulk-template", NotificationTemplateType.PreMigration);
            var userIdentifiers = new List<string> { "user1@company.com", "user2@company.com", "user3@company.com" };

            _mockTemplateService.Setup(s => s.GetTemplateAsync("bulk-template"))
                              .ReturnsAsync(template);

            var preview = CreateTestPreview(template);
            _mockTemplateService.Setup(s => s.CreatePreview(It.IsAny<NotificationTemplate>(), It.IsAny<object>()))
                              .Returns(preview);

            // Mock mixed success/failure scenario
            var callCount = 0;
            var mockMeSendMailRequestBuilder = new Mock<IUserSendMailRequestBuilder>();
            var mockMeSendMailRequest = new Mock<IUserSendMailRequest>();
            
            _mockMeRequestBuilder.Setup(m => m.SendMail(It.IsAny<Message>(), It.IsAny<bool>()))
                               .Returns(mockMeSendMailRequestBuilder.Object);
            mockMeSendMailRequestBuilder.Setup(r => r.Request())
                                      .Returns(mockMeSendMailRequest.Object);
            mockMeSendMailRequest.Setup(r => r.PostAsync())
                                .Returns(() =>
                                {
                                    callCount++;
                                    if (callCount == 2) // Second call fails
                                        throw new ServiceException(new Error { Code = "InvalidRecipient", Message = "Invalid recipient" });
                                    return Task.CompletedTask;
                                });

            // Act
            var result = await _notificationService.SendBulkNotificationAsync("bulk-template", userIdentifiers);

            // Assert
            Assert.IsFalse(result.Success, "Should not be completely successful with failures");
            Assert.AreEqual(userIdentifiers.Count, result.TotalUsers);
            Assert.AreEqual(2, result.SuccessCount); // 2 successes, 1 failure
            Assert.AreEqual(1, result.FailureCount);
            Assert.AreEqual(2, result.SuccessfulNotifications.Count);
            Assert.AreEqual(1, result.FailedNotifications.Count);
        }

        [TestMethod]
        public async Task SendBulkNotificationAsync_EmptyUserList_ReturnsError()
        {
            // Arrange
            await SetupValidGraphConfiguration();
            var emptyUserList = new List<string>();

            // Act
            var result = await _notificationService.SendBulkNotificationAsync("bulk-template", emptyUserList);

            // Assert
            Assert.IsFalse(result.Success, "Should fail with empty user list");
            Assert.AreEqual("No user identifiers provided", result.ErrorMessage);
        }

        [TestMethod]
        public async Task SendBulkNotificationAsync_LargeBatch_RespectsRateLimits()
        {
            // Arrange
            await SetupValidGraphConfiguration();
            
            var template = CreateTestTemplate("large-batch-template", NotificationTemplateType.PreMigration);
            var largeUserList = Enumerable.Range(1, 25) // More than batch size (10)
                                        .Select(i => $"user{i}@company.com")
                                        .ToList();

            _mockTemplateService.Setup(s => s.GetTemplateAsync("large-batch-template"))
                              .ReturnsAsync(template);

            var preview = CreateTestPreview(template);
            _mockTemplateService.Setup(s => s.CreatePreview(It.IsAny<NotificationTemplate>(), It.IsAny<object>()))
                              .Returns(preview);

            // Mock successful email sending
            var mockMeSendMailRequestBuilder = new Mock<IUserSendMailRequestBuilder>();
            var mockMeSendMailRequest = new Mock<IUserSendMailRequest>();
            
            _mockMeRequestBuilder.Setup(m => m.SendMail(It.IsAny<Message>(), It.IsAny<bool>()))
                               .Returns(mockMeSendMailRequestBuilder.Object);
            mockMeSendMailRequestBuilder.Setup(r => r.Request())
                                      .Returns(mockMeSendMailRequest.Object);
            mockMeSendMailRequest.Setup(r => r.PostAsync())
                                .Returns(Task.CompletedTask);

            var stopwatch = System.Diagnostics.Stopwatch.StartNew();

            // Act
            var result = await _notificationService.SendBulkNotificationAsync("large-batch-template", largeUserList);

            stopwatch.Stop();

            // Assert
            Assert.IsTrue(result.Success, "Large batch should succeed");
            Assert.AreEqual(largeUserList.Count, result.SuccessCount);
            
            // Verify that batching introduced delays (should take at least 200ms for 3 batches with 100ms delay)
            Assert.IsTrue(stopwatch.ElapsedMilliseconds >= 200, 
                $"Bulk operation should respect batch delays. Took {stopwatch.ElapsedMilliseconds}ms");
        }

        #endregion

        #region Preview and Test Notification Tests

        [TestMethod]
        public async Task SendPreviewAsync_ValidInput_SendsPreviewEmail()
        {
            // Arrange
            await SetupValidGraphConfiguration();
            
            var template = CreateTestTemplate("preview-template", NotificationTemplateType.PreMigration);
            var testRecipients = new List<string> { "admin@company.com" };
            var sampleData = new { UserDisplayName = "Sample User", MigrationDate = "2024-03-15" };

            _mockTemplateService.Setup(s => s.GetTemplateAsync("preview-template"))
                              .ReturnsAsync(template);

            var preview = CreateTestPreview(template);
            _mockTemplateService.Setup(s => s.CreatePreview(It.IsAny<NotificationTemplate>(), It.IsAny<object>()))
                              .Returns(preview);

            // Mock successful email sending
            var mockMeSendMailRequestBuilder = new Mock<IUserSendMailRequestBuilder>();
            var mockMeSendMailRequest = new Mock<IUserSendMailRequest>();
            
            _mockMeRequestBuilder.Setup(m => m.SendMail(It.IsAny<Message>(), It.IsAny<bool>()))
                               .Returns(mockMeSendMailRequestBuilder.Object);
            mockMeSendMailRequestBuilder.Setup(r => r.Request())
                                      .Returns(mockMeSendMailRequest.Object);
            mockMeSendMailRequest.Setup(r => r.PostAsync())
                                .Returns(Task.CompletedTask);

            // Act
            var result = await _notificationService.SendPreviewAsync("preview-template", testRecipients, sampleData);

            // Assert
            Assert.IsTrue(result.Success, "Preview should send successfully");
            Assert.AreEqual("preview-template", result.TemplateId);
            Assert.IsTrue(result.Recipients.Contains("admin@company.com"));
        }

        [TestMethod]
        public async Task SendTestNotificationAsync_WithSampleData_SendsTestEmail()
        {
            // Arrange
            await SetupValidGraphConfiguration();
            
            var template = CreateTestTemplate("test-template", NotificationTemplateType.PreMigration);
            var testRecipients = new List<string> { "admin@company.com" };

            _mockTemplateService.Setup(s => s.GetTemplateAsync("test-template"))
                              .ReturnsAsync(template);

            var mockSampleData = new { UserDisplayName = "Sample User" };
            var mockNotificationService = new Mock<GraphNotificationService>();
            mockNotificationService.Setup(s => s.GetSampleTokenData(It.IsAny<NotificationTemplateType>()))
                                  .Returns(mockSampleData);

            // Mock successful email sending
            var mockMeSendMailRequestBuilder = new Mock<IUserSendMailRequestBuilder>();
            var mockMeSendMailRequest = new Mock<IUserSendMailRequest>();
            
            _mockMeRequestBuilder.Setup(m => m.SendMail(It.IsAny<Message>(), It.IsAny<bool>()))
                               .Returns(mockMeSendMailRequestBuilder.Object);
            mockMeSendMailRequestBuilder.Setup(r => r.Request())
                                      .Returns(mockMeSendMailRequest.Object);
            mockMeSendMailRequest.Setup(r => r.PostAsync())
                                .Returns(Task.CompletedTask);

            var preview = CreateTestPreview(template);
            _mockTemplateService.Setup(s => s.CreatePreview(It.IsAny<NotificationTemplate>(), It.IsAny<object>()))
                              .Returns(preview);

            // Act
            var result = await _notificationService.SendTestNotificationAsync("test-wave", "test-template", testRecipients);

            // Assert
            Assert.IsTrue(result.Success, "Test notification should send successfully");
            Assert.AreEqual("test-template", result.TemplateId);
        }

        #endregion

        #region Sample Token Data Tests

        [TestMethod]
        public void GetSampleTokenData_PreMigration_ReturnsCorrectData()
        {
            // Arrange & Act
            var sampleData = _notificationService.GetSampleTokenData(NotificationTemplateType.PreMigration);

            // Assert
            Assert.IsNotNull(sampleData);
            var dataDict = GetPropertiesAsDictionary(sampleData);
            
            Assert.IsTrue(dataDict.ContainsKey("UserDisplayName"));
            Assert.IsTrue(dataDict.ContainsKey("MigrationDate"));
            Assert.IsTrue(dataDict.ContainsKey("MigrationTime"));
            Assert.IsTrue(dataDict.ContainsKey("WaveName"));
            Assert.IsTrue(dataDict.ContainsKey("EstimatedDuration"));
            Assert.IsTrue(dataDict.ContainsKey("ItemsToMigrate"));
        }

        [TestMethod]
        public void GetSampleTokenData_PostMigration_ReturnsCorrectData()
        {
            // Arrange & Act
            var sampleData = _notificationService.GetSampleTokenData(NotificationTemplateType.PostMigration);

            // Assert
            Assert.IsNotNull(sampleData);
            var dataDict = GetPropertiesAsDictionary(sampleData);
            
            Assert.IsTrue(dataDict.ContainsKey("UserDisplayName"));
            Assert.IsTrue(dataDict.ContainsKey("MigrationStatus"));
            Assert.IsTrue(dataDict.ContainsKey("ItemsMigrated"));
            Assert.IsTrue(dataDict.ContainsKey("ItemsFailed"));
            Assert.IsTrue(dataDict.ContainsKey("NextSteps"));
        }

        [TestMethod]
        public void GetSampleTokenData_Alert_ReturnsCorrectData()
        {
            // Arrange & Act
            var sampleData = _notificationService.GetSampleTokenData(NotificationTemplateType.Alert);

            // Assert
            Assert.IsNotNull(sampleData);
            var dataDict = GetPropertiesAsDictionary(sampleData);
            
            Assert.IsTrue(dataDict.ContainsKey("UserDisplayName"));
            Assert.IsTrue(dataDict.ContainsKey("AlertType"));
            Assert.IsTrue(dataDict.ContainsKey("AlertMessage"));
            Assert.IsTrue(dataDict.ContainsKey("AffectedItems"));
            Assert.IsTrue(dataDict.ContainsKey("RecommendedAction"));
        }

        #endregion

        #region Error Handling Tests

        [TestMethod]
        public async Task GraphAPIOperations_ServiceException_HandlesGracefully()
        {
            // Arrange
            await SetupValidGraphConfiguration();
            
            var serviceExceptions = new[]
            {
                new ServiceException(new Error { Code = "Throttled", Message = "Request was throttled" }),
                new ServiceException(new Error { Code = "Unauthorized", Message = "Access denied" }),
                new ServiceException(new Error { Code = "TooManyRequests", Message = "Rate limit exceeded" }),
                new ServiceException(new Error { Code = "InvalidRequest", Message = "Invalid request" })
            };

            foreach (var exception in serviceExceptions)
            {
                _mockUserRequest.Setup(u => u.GetAsync()).ThrowsAsync(exception);

                // Act
                var result = await _notificationService.GetUserDataAsync("test@company.com");

                // Assert
                Assert.IsNull(result, $"Should handle {exception.Error.Code} gracefully");
            }
        }

        [TestMethod]
        public async Task NotificationOperations_NetworkFailure_HandlesGracefully()
        {
            // Arrange
            await SetupValidGraphConfiguration();
            
            var networkException = new HttpRequestException("Network error");
            _mockUserRequest.Setup(u => u.GetAsync()).ThrowsAsync(networkException);

            // Act
            var result = await _notificationService.GetUserDataAsync("test@company.com");

            // Assert
            Assert.IsNull(result, "Should handle network failures gracefully");
        }

        #endregion

        #region Performance Tests

        [TestMethod]
        public async Task BulkNotifications_LargeVolume_PerformsWithinLimits()
        {
            // Arrange
            await SetupValidGraphConfiguration();
            
            const int userCount = 100;
            var template = CreateTestTemplate("perf-template", NotificationTemplateType.PreMigration);
            var userIdentifiers = Enumerable.Range(1, userCount)
                                          .Select(i => $"user{i}@company.com")
                                          .ToList();

            _mockTemplateService.Setup(s => s.GetTemplateAsync("perf-template"))
                              .ReturnsAsync(template);

            var preview = CreateTestPreview(template);
            _mockTemplateService.Setup(s => s.CreatePreview(It.IsAny<NotificationTemplate>(), It.IsAny<object>()))
                              .Returns(preview);

            // Mock fast email sending (no actual network)
            var mockMeSendMailRequestBuilder = new Mock<IUserSendMailRequestBuilder>();
            var mockMeSendMailRequest = new Mock<IUserSendMailRequest>();
            
            _mockMeRequestBuilder.Setup(m => m.SendMail(It.IsAny<Message>(), It.IsAny<bool>()))
                               .Returns(mockMeSendMailRequestBuilder.Object);
            mockMeSendMailRequestBuilder.Setup(r => r.Request())
                                      .Returns(mockMeSendMailRequest.Object);
            mockMeSendMailRequest.Setup(r => r.PostAsync())
                                .Returns(Task.Delay(1)); // Minimal delay

            var stopwatch = System.Diagnostics.Stopwatch.StartNew();

            // Act
            var result = await _notificationService.SendBulkNotificationAsync("perf-template", userIdentifiers);

            stopwatch.Stop();

            // Assert
            Assert.IsTrue(result.Success, "Large volume notification should succeed");
            Assert.AreEqual(userCount, result.SuccessCount);
            Assert.IsTrue(stopwatch.ElapsedMilliseconds < 60000, // Should complete in under 1 minute
                $"Bulk notification of {userCount} users took {stopwatch.ElapsedMilliseconds}ms");
        }

        #endregion

        #region Helper Methods

        private async Task SetupValidGraphConfiguration()
        {
            // This would normally set up a real Graph client, but for testing we'll mock it
            var field = typeof(GraphNotificationService).GetField("_graphServiceClient", 
                System.Reflection.BindingFlags.NonPublic | System.Reflection.BindingFlags.Instance);
            field?.SetValue(_notificationService, _mockGraphServiceClient.Object);

            _notificationService.Configuration = _testConfig;
        }

        private NotificationTemplate CreateTestTemplate(string id, NotificationTemplateType type)
        {
            return new NotificationTemplate
            {
                Id = id,
                Name = $"Test Template {id}",
                Description = $"Test template for {type}",
                Type = type,
                Subject = "Test Subject: {UserDisplayName}",
                Body = "Dear {UserDisplayName}, this is a test notification.",
                Recipients = new List<string> { "test@company.com" },
                IsActive = true,
                CreatedAt = DateTime.Now,
                UpdatedAt = DateTime.Now,
                CreatedBy = "TestUser"
            };
        }

        private UserNotificationData CreateTestUserData()
        {
            return new UserNotificationData
            {
                UserPrincipalName = "john.smith@company.com",
                DisplayName = "John Smith",
                Email = "john.smith@company.com",
                FirstName = "John",
                LastName = "Smith",
                JobTitle = "Software Engineer",
                Department = "IT"
            };
        }

        private NotificationPreview CreateTestPreview(NotificationTemplate template)
        {
            return new NotificationPreview
            {
                TemplateId = template.Id,
                TemplateName = template.Name,
                Subject = "Test Subject: John Smith",
                Body = "Dear John Smith, this is a test notification.",
                Recipients = new List<string> { "john.smith@company.com" },
                ValidRecipients = new List<string> { "john.smith@company.com" },
                InvalidRecipients = new List<string>(),
                UsedTokens = new List<string> { "UserDisplayName" },
                CreatedAt = DateTime.Now,
                HasError = false
            };
        }

        private Dictionary<string, object> GetPropertiesAsDictionary(object obj)
        {
            return obj.GetType()
                     .GetProperties()
                     .ToDictionary(prop => prop.Name, prop => prop.GetValue(obj));
        }

        #endregion
    }
}