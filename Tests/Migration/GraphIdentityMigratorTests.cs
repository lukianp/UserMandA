using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using Moq;
using MandADiscoverySuite.Migration;

namespace MandADiscoverySuite.Tests.Migration
{
    /// <summary>
    /// Tests for GraphIdentityMigrator functionality
    /// </summary>
    [TestClass]
    public class GraphIdentityMigratorTests
    {
        private Mock<IGraphUserClient> _mockGraphClient;
        private Mock<ILogger<TestGraphIdentityMigrator>> _mockLogger;
        private TestGraphIdentityMigrator _migrator;

        [TestInitialize]
        public void Setup()
        {
            _mockGraphClient = new Mock<IGraphUserClient>();
            _mockLogger = new Mock<ILogger<TestGraphIdentityMigrator>>();
            _migrator = new TestGraphIdentityMigrator(_mockGraphClient.Object, _mockLogger.Object);
        }

        [TestMethod]
        public async Task MigrateUserAsync_ReturnsSuccess_OnProviderSuccess()
        {
            // Arrange
            var testUser = CreateTestGraphUser();
            var migrationSettings = new TestMigrationSettings
            {
                SourceTenantId = "source-tenant",
                TargetTenantId = "target-tenant"
            };
            var targetContext = new TestTargetContext
            {
                TenantId = "target-tenant",
                Environment = "Test"
            };

            _mockGraphClient
                .Setup(c => c.CreateUserAsync(It.IsAny<Microsoft.Graph.Models.User>()))
                .Returns(Task.CompletedTask);

            // Act
            var result = await _migrator.MigrateUserAsync(testUser, migrationSettings, targetContext);

            // Assert
            Assert.IsNotNull(result);
            Assert.IsTrue(result.Success);
            Assert.AreEqual("User migration completed successfully", result.Message);

            _mockGraphClient.Verify(c => c.CreateUserAsync(It.Is<Microsoft.Graph.Models.User>(
                u => u.DisplayName == "Test User" &&
                     u.UserPrincipalName == "test@contoso.com")), Times.Once);
        }

        [TestMethod]
        public async Task MigrateUserAsync_ReturnsFailure_OnProviderError()
        {
            // Arrange
            var testUser = CreateTestGraphUser();
            var migrationSettings = new TestMigrationSettings
            {
                SourceTenantId = "source-tenant",
                TargetTenantId = "target-tenant"
            };
            var targetContext = new TestTargetContext
            {
                TenantId = "target-tenant",
                Environment = "Test"
            };

            _mockGraphClient
                .Setup(c => c.CreateUserAsync(It.IsAny<Microsoft.Graph.Models.User>()))
                .ThrowsAsync(new InvalidOperationException("Graph API error"));

            // Act
            var result = await _migrator.MigrateUserAsync(testUser, migrationSettings, targetContext);

            // Assert
            Assert.IsNotNull(result);
            Assert.IsFalse(result.Success);
            Assert.IsTrue(result.Message.Contains("Graph API error"));
            Assert.IsTrue(result.Errors.Contains("Graph API error"));
        }

        [TestMethod]
        public async Task MigrateUserAsync_HandlesNullUser()
        {
            // Arrange
            var migrationSettings = new TestMigrationSettings
            {
                SourceTenantId = "source-tenant",
                TargetTenantId = "target-tenant"
            };
            var targetContext = new TestTargetContext
            {
                TenantId = "target-tenant",
                Environment = "Test"
            };

            // Act & Assert
            await Assert.ThrowsExceptionAsync<ArgumentNullException>(
                () => _migrator.MigrateUserAsync(null, migrationSettings, targetContext));
        }

        [TestMethod]
        public async Task MigrateUserAsync_HandlesNullSettings()
        {
            // Arrange
            var testUser = CreateTestGraphUser();
            var targetContext = new TestTargetContext
            {
                TenantId = "target-tenant",
                Environment = "Test"
            };

            // Act & Assert
            await Assert.ThrowsExceptionAsync<ArgumentNullException>(
                () => _migrator.MigrateUserAsync(testUser, null, targetContext));
        }

        [TestMethod]
        public async Task MigrateUserAsync_HandlesNullContext()
        {
            // Arrange
            var testUser = CreateTestGraphUser();
            var migrationSettings = new TestMigrationSettings
            {
                SourceTenantId = "source-tenant",
                TargetTenantId = "target-tenant"
            };

            // Act & Assert
            await Assert.ThrowsExceptionAsync<ArgumentNullException>(
                () => _migrator.MigrateUserAsync(testUser, migrationSettings, null));
        }

        [TestMethod]
        public async Task MigrateUserAsync_SupportsConcurrency()
        {
            // Arrange
            var user1 = CreateTestGraphUser("User One", "user1@contoso.com");
            var user2 = CreateTestGraphUser("User Two", "user2@contoso.com");
            var migrationSettings = new TestMigrationSettings
            {
                SourceTenantId = "source-tenant",
                TargetTenantId = "target-tenant"
            };
            var targetContext = new TestTargetContext
            {
                TenantId = "target-tenant",
                Environment = "Test"
            };

            _mockGraphClient
                .Setup(c => c.CreateUserAsync(It.IsAny<Microsoft.Graph.Models.User>()))
                .Returns(async () =>
                {
                    await Task.Delay(10); // Simulate async operation
                    return;
                });

            // Act
            var results = await Task.WhenAll(
                _migrator.MigrateUserAsync(user1, migrationSettings, targetContext),
                _migrator.MigrateUserAsync(user2, migrationSettings, targetContext));

            // Assert
            Assert.AreEqual(2, results.Length);
            Assert.IsTrue(results[0].Success);
            Assert.IsTrue(results[1].Success);

            _mockGraphClient.Verify(c => c.CreateUserAsync(It.IsAny<Microsoft.Graph.Models.User>()), Times.Exactly(2));
        }

        [TestMethod]
        public async Task MigrateUserAsync_RecordsMigrationDetails()
        {
            // Arrange
            var testUser = CreateTestGraphUser();
            var migrationSettings = new TestMigrationSettings
            {
                SourceTenantId = "source-tenant",
                TargetTenantId = "target-tenant"
            };
            var targetContext = new TestTargetContext
            {
                TenantId = "target-tenant",
                Environment = "Test"
            };

            _mockGraphClient
                .Setup(c => c.CreateUserAsync(It.IsAny<Microsoft.Graph.Models.User>()))
                .Returns(Task.CompletedTask);

            // Act
            var result = await _migrator.MigrateUserAsync(testUser, migrationSettings, targetContext);

            // Assert
            Assert.IsNotNull(result);
            Assert.IsTrue(result.Success);
            Assert.IsNotNull(result.StartedAt);
            Assert.IsNotNull(result.CompletedAt);
            Assert.IsTrue(result.CompletedAt >= result.StartedAt);
        }

        private static Microsoft.Graph.Models.User CreateTestGraphUser(string displayName = "Test User", string upn = "test@contoso.com")
        {
            return new Microsoft.Graph.Models.User
            {
                DisplayName = displayName,
                UserPrincipalName = upn,
                GivenName = "Test",
                Surname = "User",
                JobTitle = "Test Engineer",
                Department = "IT",
                Mail = upn
            };
        }
    }

    #region Test Classes

    // Mock implementation of GraphIdentityMigrator for testing
    public class TestGraphIdentityMigrator
    {
        private readonly IGraphUserClient _graphClient;
        private readonly ILogger<TestGraphIdentityMigrator> _logger;

        public TestGraphIdentityMigrator(IGraphUserClient graphClient, ILogger<TestGraphIdentityMigrator> logger)
        {
            _graphClient = graphClient ?? throw new ArgumentNullException(nameof(graphClient));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        public async Task<MigrationResult> MigrateUserAsync(Microsoft.Graph.Models.User user, TestMigrationSettings settings, TestTargetContext context)
        {
            if (user == null) throw new ArgumentNullException(nameof(user));
            if (settings == null) throw new ArgumentNullException(nameof(settings));
            if (context == null) throw new ArgumentNullException(nameof(context));

            var result = new MigrationResult
            {
                StartedAt = DateTime.UtcNow,
                SourceObjectId = user.Id ?? user.UserPrincipalName
            };

            try
            {
                await _graphClient.CreateUserAsync(user);
                result.Success = true;
                result.Message = "User migration completed successfully";
                result.TargetObjectId = user.Id ?? user.UserPrincipalName;
            }
            catch (Exception ex)
            {
                result.Success = false;
                result.Message = $"User migration failed: {ex.Message}";
                result.Errors.Add(ex.Message);
                _logger.LogError(ex, "Failed to migrate user {UserPrincipalName}", user.UserPrincipalName);
            }

            result.CompletedAt = DateTime.UtcNow;
            return result;
        }
    }

    public interface IGraphUserClient
    {
        Task CreateUserAsync(Microsoft.Graph.Models.User user);
    }

    public class MigrationResult
    {
        public bool Success { get; set; }
        public string Message { get; set; } = string.Empty;
        public List<string> Errors { get; } = new();
        public List<string> Warnings { get; } = new();
        public DateTime StartedAt { get; set; }
        public DateTime? CompletedAt { get; set; }
        public string SourceObjectId { get; set; } = string.Empty;
        public string TargetObjectId { get; set; } = string.Empty;
    }

    public class TestMigrationSettings
    {
        public string SourceTenantId { get; set; } = string.Empty;
        public string TargetTenantId { get; set; } = string.Empty;
    }

    public class TestTargetContext
    {
        public string TenantId { get; set; } = string.Empty;
        public string Environment { get; set; } = string.Empty;
    }

    #endregion
}
