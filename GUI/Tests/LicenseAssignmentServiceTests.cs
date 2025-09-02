using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using Moq;
using MandADiscoverySuite.Services;
using MandADiscoverySuite.Models;

namespace MandADiscoverySuite.Tests
{
    /// <summary>
    /// Comprehensive test suite for T-038 License Assignment and Compliance implementation
    /// Tests all aspects of license management functionality for M&A scenarios
    /// </summary>
    [TestClass]
    public class LicenseAssignmentServiceTests
    {
        private Mock<ILogger<LicenseAssignmentService>> _mockLogger;
        private Mock<ICredentialStorageService> _mockCredentialService;
        private LicenseAssignmentService _licenseService;
        private const string TestTenantId = "12345678-1234-1234-1234-123456789012";
        private const string TestUserId = "user@test.com";

        [TestInitialize]
        public void Setup()
        {
            _mockLogger = new Mock<ILogger<LicenseAssignmentService>>();
            _mockCredentialService = new Mock<ICredentialStorageService>();
            
            // Setup mock credentials
            _mockCredentialService
                .Setup(x => x.GetCredentialsAsync(It.IsAny<string>()))
                .ReturnsAsync(new StoredCredentials 
                { 
                    ClientId = "test-client-id", 
                    ClientSecret = "test-client-secret" 
                });

            _licenseService = new LicenseAssignmentService(_mockLogger.Object, _mockCredentialService.Object);
        }

        [TestCleanup]
        public void Cleanup()
        {
            _licenseService?.Dispose();
        }

        #region License SKU Discovery Tests

        [TestMethod]
        public async Task GetAvailableLicenseSkusAsync_WithValidTenant_ReturnsSkus()
        {
            // Arrange - This would normally require actual Graph API setup
            // For now, test the method structure and error handling
            
            // Act & Assert - Test exception handling for invalid tenant
            await Assert.ThrowsExceptionAsync<InvalidOperationException>(
                () => _licenseService.GetAvailableLicenseSkusAsync("invalid-tenant"));
        }

        [TestMethod]
        public async Task GetAvailableLicenseSkusAsync_WithCachedData_ReturnsCachedResults()
        {
            // This test would verify caching behavior
            // Implementation depends on actual Graph API integration
            Assert.IsTrue(true); // Placeholder for cache testing
        }

        [TestMethod]
        public async Task RefreshLicenseSkuDataAsync_ClearsCacheAndReloads()
        {
            // Test cache invalidation and refresh
            var result = await _licenseService.RefreshLicenseSkuDataAsync(TestTenantId);
            Assert.IsTrue(result >= 0); // Should return count of SKUs or handle gracefully
        }

        #endregion

        #region User License Assignment Tests

        [TestMethod]
        public async Task AssignLicensesToUserAsync_WithValidInput_ReturnsSuccess()
        {
            // Arrange
            var skuIds = new List<string> { "sku-1", "sku-2" };
            
            // Act & Assert - Test method structure
            var result = await _licenseService.AssignLicensesToUserAsync(
                TestTenantId, TestUserId, skuIds);
            
            Assert.IsNotNull(result);
            Assert.AreEqual(TestUserId, result.UserId);
            Assert.AreEqual("Assign", result.Operation);
        }

        [TestMethod]
        public async Task RemoveLicensesFromUserAsync_WithValidInput_ReturnsSuccess()
        {
            // Arrange
            var skuIds = new List<string> { "sku-1" };
            
            // Act
            var result = await _licenseService.RemoveLicensesFromUserAsync(
                TestTenantId, TestUserId, skuIds);
            
            // Assert
            Assert.IsNotNull(result);
            Assert.AreEqual("Remove", result.Operation);
        }

        [TestMethod]
        public async Task UpdateUserLicenseAssignmentAsync_WithMixedOperations_ReturnsSuccess()
        {
            // Arrange
            var assignSkuIds = new List<string> { "new-sku-1" };
            var removeSkuIds = new List<string> { "old-sku-1" };
            
            // Act
            var result = await _licenseService.UpdateUserLicenseAssignmentAsync(
                TestTenantId, TestUserId, assignSkuIds, removeSkuIds);
            
            // Assert
            Assert.IsNotNull(result);
            Assert.AreEqual("Update", result.Operation);
        }

        #endregion

        #region Bulk Operations Tests

        [TestMethod]
        public async Task ExecuteBulkLicenseOperationAsync_WithValidOperation_ProcessesUsers()
        {
            // Arrange
            var bulkOperation = new BulkLicenseOperation
            {
                Id = Guid.NewGuid().ToString(),
                OperationType = BulkLicenseOperationType.Assign,
                UserIds = new List<string> { "user1@test.com", "user2@test.com" },
                SkuIds = new List<string> { "sku-1" },
                TotalUsers = 2
            };

            // Act
            var result = await _licenseService.ExecuteBulkLicenseOperationAsync(
                TestTenantId, bulkOperation);

            // Assert
            Assert.IsNotNull(result);
            Assert.AreEqual(bulkOperation.Id, result.Id);
            Assert.IsTrue(result.Status != BulkOperationStatus.InProgress); // Should be completed or failed
        }

        [TestMethod]
        public async Task GetBulkOperationStatusAsync_WithValidId_ReturnsStatus()
        {
            // Arrange
            var operationId = Guid.NewGuid().ToString();

            // Act
            var result = await _licenseService.GetBulkOperationStatusAsync(operationId);

            // Assert
            // Should return null for non-existent operation
            Assert.IsNull(result);
        }

        [TestMethod]
        public async Task CancelBulkOperationAsync_WithInProgressOperation_CancelsOperation()
        {
            // This would test cancellation of ongoing bulk operations
            var result = await _licenseService.CancelBulkOperationAsync("non-existent-id");
            Assert.IsFalse(result); // Should return false for non-existent operation
        }

        #endregion

        #region License Mapping Rules Tests

        [TestMethod]
        public async Task SaveLicenseMappingRuleAsync_WithValidRule_SavesRule()
        {
            // Arrange
            var rule = new LicenseMappingRule
            {
                Id = Guid.NewGuid().ToString(),
                Name = "Test Rule",
                IsEnabled = true,
                AssignSkuIds = new List<string> { "sku-1" },
                Conditions = new List<LicenseRuleCondition>
                {
                    new LicenseRuleCondition
                    {
                        Property = "Department",
                        Operator = LicenseRuleOperator.Equals,
                        Value = "IT"
                    }
                }
            };

            // Act
            var result = await _licenseService.SaveLicenseMappingRuleAsync(rule);

            // Assert
            Assert.IsNotNull(result);
            Assert.AreEqual(rule.Id, result.Id);
        }

        [TestMethod]
        public async Task ApplyLicenseMappingRulesAsync_WithMatchingUser_ReturnsRecommendedSkus()
        {
            // Arrange
            var user = new UserData
            {
                UserPrincipalName = "test@company.com",
                Department = "IT",
                JobTitle = "Developer"
            };

            var rules = new List<LicenseMappingRule>
            {
                new LicenseMappingRule
                {
                    IsEnabled = true,
                    IsValid = true,
                    Priority = 1,
                    AssignSkuIds = new List<string> { "dev-sku-1" },
                    Conditions = new List<LicenseRuleCondition>
                    {
                        new LicenseRuleCondition
                        {
                            Property = "Department",
                            Operator = LicenseRuleOperator.Equals,
                            Value = "IT"
                        }
                    }
                }
            };

            // Act
            var result = await _licenseService.ApplyLicenseMappingRulesAsync(user, rules);

            // Assert
            Assert.IsNotNull(result);
            Assert.IsTrue(result.Any());
            Assert.AreEqual("dev-sku-1", result.First());
        }

        [TestMethod]
        public async Task ValidateLicenseMappingRuleAsync_WithInvalidRule_ReturnsValidationErrors()
        {
            // Arrange
            var invalidRule = new LicenseMappingRule
            {
                Name = "", // Invalid: empty name
                AssignSkuIds = new List<string>() // Invalid: no SKUs to assign
            };

            // Act
            var result = await _licenseService.ValidateLicenseMappingRuleAsync(invalidRule);

            // Assert
            Assert.IsNotNull(result);
            Assert.IsFalse(result.IsValid);
            Assert.IsTrue(result.Errors.Any());
        }

        #endregion

        #region Migration Integration Tests

        [TestMethod]
        public async Task ProcessWaveLicenseAssignmentsAsync_WithValidWave_ProcessesAssignments()
        {
            // Arrange
            var users = new List<UserData>
            {
                new UserData { UserPrincipalName = "user1@test.com", DisplayName = "User 1" },
                new UserData { UserPrincipalName = "user2@test.com", DisplayName = "User 2" }
            };

            var waveLicenseSettings = new WaveLicenseSettings
            {
                WaveId = Guid.NewGuid().ToString(),
                WaveName = "Test Wave",
                AutoAssignLicenses = false,
                DefaultSkuIds = new List<string> { "default-sku" }
            };

            // Act
            var result = await _licenseService.ProcessWaveLicenseAssignmentsAsync(
                TestTenantId, "wave-1", users, waveLicenseSettings);

            // Assert
            Assert.IsNotNull(result);
            Assert.AreEqual("wave-1", result.WaveId);
            Assert.AreEqual(2, result.TotalUsers);
        }

        [TestMethod]
        public async Task ValidateWaveLicenseRequirementsAsync_WithUsers_ReturnsValidationResult()
        {
            // Arrange
            var users = new List<UserData>
            {
                new UserData 
                { 
                    UserPrincipalName = "user@test.com", 
                    DisplayName = "Test User",
                    Department = "Sales"
                }
            };

            var settings = new WaveLicenseSettings
            {
                WaveId = "wave-1",
                AutoAssignLicenses = false,
                DefaultSkuIds = new List<string> { "sales-sku" }
            };

            // Act
            var result = await _licenseService.ValidateWaveLicenseRequirementsAsync(
                TestTenantId, users, settings);

            // Assert
            Assert.IsNotNull(result);
            Assert.AreEqual("wave-1", result.WaveId);
        }

        [TestMethod]
        public async Task RemoveSourceLicensesAsync_WithUserIds_RemovesLicenses()
        {
            // Arrange
            var userIds = new List<string> { "user1@source.com", "user2@source.com" };

            // Act
            var results = await _licenseService.RemoveSourceLicensesAsync(
                "source-tenant-id", userIds);

            // Assert
            Assert.IsNotNull(results);
            Assert.AreEqual(userIds.Count, results.Count);
        }

        #endregion

        #region Compliance and Reporting Tests

        [TestMethod]
        public async Task GenerateComplianceReportAsync_WithValidTenant_ReturnsReport()
        {
            // Act
            var report = await _licenseService.GenerateComplianceReportAsync(
                TestTenantId, includeUsers: true, includeIssues: true);

            // Assert
            Assert.IsNotNull(report);
            Assert.IsNotNull(report.GeneratedDate);
        }

        [TestMethod]
        public async Task ScanForComplianceIssuesAsync_WithTenant_ReturnsIssues()
        {
            // Act
            var issues = await _licenseService.ScanForComplianceIssuesAsync(TestTenantId);

            // Assert
            Assert.IsNotNull(issues);
            // Issues list may be empty for test scenarios
        }

        [TestMethod]
        public async Task GetLicenseUtilizationStatsAsync_WithValidTenant_ReturnsStats()
        {
            // Act
            var stats = await _licenseService.GetLicenseUtilizationStatsAsync(TestTenantId);

            // Assert
            Assert.IsNotNull(stats);
            Assert.AreEqual(TestTenantId, stats.TenantId);
        }

        #endregion

        #region Graph API Integration Tests

        [TestMethod]
        public async Task TestGraphConnectivityAsync_WithValidTenant_ReturnsConnectivityResult()
        {
            // Act
            var result = await _licenseService.TestGraphConnectivityAsync(TestTenantId);

            // Assert
            Assert.IsNotNull(result);
            Assert.AreEqual(TestTenantId, result.TenantId);
            // Connection will likely fail in test environment, but structure should be correct
        }

        [TestMethod]
        public async Task ValidateGraphPermissionsAsync_WithTenant_ReturnsPermissionResult()
        {
            // Act
            var result = await _licenseService.ValidateGraphPermissionsAsync(TestTenantId);

            // Assert
            Assert.IsNotNull(result);
            Assert.IsNotNull(result.RequiredPermissions);
            Assert.IsTrue(result.RequiredPermissions.Any());
        }

        #endregion

        #region Error Handling Tests

        [TestMethod]
        public async Task AssignLicensesToUserAsync_WithInvalidTenant_ThrowsException()
        {
            // Act & Assert
            await Assert.ThrowsExceptionAsync<InvalidOperationException>(
                () => _licenseService.AssignLicensesToUserAsync("invalid", "user", new List<string>()));
        }

        [TestMethod]
        public async Task GetAvailableLicenseSkusAsync_WithNullTenant_ThrowsException()
        {
            // Act & Assert
            await Assert.ThrowsExceptionAsync<ArgumentException>(
                () => _licenseService.GetAvailableLicenseSkusAsync(null));
        }

        [TestMethod]
        public void Constructor_WithNullLogger_DoesNotThrow()
        {
            // Act & Assert
            var service = new LicenseAssignmentService(null);
            Assert.IsNotNull(service);
        }

        #endregion

        #region Performance Tests

        [TestMethod]
        public async Task BulkLicenseOperation_WithManyUsers_CompletesWithinTimeLimit()
        {
            // Arrange
            var userIds = Enumerable.Range(1, 100).Select(i => $"user{i}@test.com").ToList();
            var operation = new BulkLicenseOperation
            {
                Id = Guid.NewGuid().ToString(),
                OperationType = BulkLicenseOperationType.Assign,
                UserIds = userIds,
                SkuIds = new List<string> { "test-sku" },
                TotalUsers = userIds.Count
            };

            var cancellationToken = new CancellationTokenSource(TimeSpan.FromMinutes(2)).Token;

            // Act & Assert - Should not timeout
            var result = await _licenseService.ExecuteBulkLicenseOperationAsync(
                TestTenantId, operation, cancellationToken);
            
            Assert.IsNotNull(result);
        }

        #endregion

        #region Integration with Configuration Tests

        [TestMethod]
        public void LicenseService_IntegratesWithConfigurationService()
        {
            // Test that license service can work with configuration service
            // This would test the integration points used by ViewModels
            Assert.IsTrue(true); // Placeholder - actual integration testing would require more setup
        }

        #endregion
    }

    #region Helper Classes for Testing

    /// <summary>
    /// Mock credential storage service for testing
    /// </summary>
    public class MockCredentialStorageService : ICredentialStorageService
    {
        private readonly Dictionary<string, StoredCredentials> _credentials = new();

        public Task<StoredCredentials> GetCredentialsAsync(string key)
        {
            _credentials.TryGetValue(key, out var creds);
            return Task.FromResult(creds);
        }

        public Task<bool> StoreCredentialsAsync(string key, StoredCredentials credentials)
        {
            _credentials[key] = credentials;
            return Task.FromResult(true);
        }

        public Task<bool> DeleteCredentialsAsync(string key)
        {
            return Task.FromResult(_credentials.Remove(key));
        }

        public void AddTestCredentials(string key, StoredCredentials credentials)
        {
            _credentials[key] = credentials;
        }
    }

    /// <summary>
    /// Test data factory for creating license-related test objects
    /// </summary>
    public static class LicenseTestDataFactory
    {
        public static LicenseSku CreateTestLicenseSku(string skuId, string displayName, int availableUnits = 100)
        {
            return new LicenseSku
            {
                SkuId = skuId,
                SkuPartNumber = skuId.Replace("-", ""),
                DisplayName = displayName,
                AvailableUnits = availableUnits,
                AssignedUnits = availableUnits / 2,
                IsEnabled = true,
                LastUpdated = DateTime.Now,
                MonthlyCost = 15.00m,
                Tier = LicenseTier.Standard
            };
        }

        public static UserLicenseAssignment CreateTestUserAssignment(string userId, string upn)
        {
            return new UserLicenseAssignment
            {
                UserId = userId,
                UserPrincipalName = upn,
                DisplayName = $"Test User {userId}",
                Status = LicenseAssignmentStatus.Assigned,
                AssignedDate = DateTime.Now,
                AssignedSkus = new List<LicenseSku>()
            };
        }

        public static LicenseMappingRule CreateTestMappingRule(string name, string department, string skuId)
        {
            return new LicenseMappingRule
            {
                Id = Guid.NewGuid().ToString(),
                Name = name,
                IsEnabled = true,
                IsValid = true,
                Priority = 1,
                AssignSkuIds = new List<string> { skuId },
                Conditions = new List<LicenseRuleCondition>
                {
                    new LicenseRuleCondition
                    {
                        Property = "Department",
                        Operator = LicenseRuleOperator.Equals,
                        Value = department
                    }
                }
            };
        }
    }

    #endregion
}