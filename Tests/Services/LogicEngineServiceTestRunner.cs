using System;
using System.IO;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using Moq;
using Xunit;
using MandADiscoverySuite.Services;

namespace MandADiscoverySuite.Tests.Services
{
    /// <summary>
    /// Simple test runner to validate LogicEngineService test infrastructure
    /// This ensures our test setup and mocking framework works correctly
    /// </summary>
    public class LogicEngineServiceTestRunner : IDisposable
    {
        private readonly Mock<ILogger<LogicEngineService>> _mockLogger;
        private readonly string _testDataPath;
        private readonly LogicEngineService _logicEngine;

        public LogicEngineServiceTestRunner()
        {
            _mockLogger = new Mock<ILogger<LogicEngineService>>();
            _testDataPath = Path.Combine(Path.GetTempPath(), "LogicEngineTestRunner", Guid.NewGuid().ToString());
            Directory.CreateDirectory(_testDataPath);
            
            _logicEngine = new LogicEngineService(_mockLogger.Object, _testDataPath);
            
            // Create minimal test data
            SetupMinimalTestData();
        }

        private void SetupMinimalTestData()
        {
            // Create empty CSV files to avoid file not found errors
            var csvFiles = new[]
            {
                "Users.csv", "Groups.csv", "Devices.csv", "Applications.csv", "GPOs.csv",
                "NTFS_ACL.csv", "Mailboxes.csv", "MappedDrives.csv", "AzureRoles.csv", "SQL.csv",
                "ThreatDetection.csv", "DataGovernance.csv", "DataLineage.csv", "ExternalIdentities.csv"
            };

            foreach (var file in csvFiles)
            {
                File.WriteAllText(Path.Combine(_testDataPath, file), "");
            }
        }

        public void Dispose()
        {
            if (Directory.Exists(_testDataPath))
            {
                Directory.Delete(_testDataPath, true);
            }
        }

        [Fact]
        public void LogicEngineService_ShouldInstantiateCorrectly()
        {
            // Assert
            Assert.NotNull(_logicEngine);
            Assert.False(_logicEngine.IsLoading);
            Assert.Null(_logicEngine.LastLoadTime);
        }

        [Fact]
        public async Task LogicEngineService_ShouldLoadEmptyDataWithoutErrors()
        {
            // Act
            var result = await _logicEngine.LoadAllAsync();

            // Assert
            Assert.True(result, "LoadAllAsync should succeed even with empty data");
            Assert.NotNull(_logicEngine.LastLoadTime);
            Assert.False(_logicEngine.IsLoading);

            var stats = _logicEngine.GetLoadStatistics();
            Assert.NotNull(stats);
            Assert.Equal(0, stats.UserCount);
            Assert.Equal(0, stats.DeviceCount);
        }

        [Fact]
        public async Task LogicEngineService_ShouldReturnNullForNonExistentUser()
        {
            // Arrange
            await _logicEngine.LoadAllAsync();

            // Act
            var userDetail = await _logicEngine.GetUserDetailAsync("NonExistent");

            // Assert
            Assert.Null(userDetail);
        }

        [Fact]
        public async Task LogicEngineService_ShouldReturnNullForNonExistentAsset()
        {
            // Arrange
            await _logicEngine.LoadAllAsync();

            // Act
            var assetDetail = await _logicEngine.GetAssetDetailAsync("NonExistent");

            // Assert
            Assert.Null(assetDetail);
        }

        [Fact]
        public async Task LogicEngineService_ShouldReturnEmptyUsersListForEmptyData()
        {
            // Arrange
            await _logicEngine.LoadAllAsync();

            // Act
            var users = await _logicEngine.GetUsersAsync();

            // Assert
            Assert.NotNull(users);
            Assert.Empty(users);
        }

        [Fact]
        public async Task LogicEngineService_ShouldReturnEmptyDevicesListForEmptyData()
        {
            // Arrange
            await _logicEngine.LoadAllAsync();

            // Act
            var devices = await _logicEngine.GetDevicesAsync();

            // Assert
            Assert.NotNull(devices);
            Assert.Empty(devices);
        }

        [Fact]
        public void LogicEngineService_ShouldReturnEmptyAppliedRulesBeforeLoad()
        {
            // Act
            var rules = _logicEngine.GetAppliedInferenceRules();

            // Assert
            Assert.NotNull(rules);
            Assert.Empty(rules);
        }

        [Fact]
        public void LogicEngineService_ShouldThrowForGetLoadStatisticsBeforeLoad()
        {
            // Act & Assert
            Assert.Throws<InvalidOperationException>(() => _logicEngine.GetLoadStatistics());
        }

        [Fact]
        public async Task LogicEngineService_ShouldReturnEmptyMigrationHintsForNonExistentUser()
        {
            // Arrange
            await _logicEngine.LoadAllAsync();

            // Act
            var hints = await _logicEngine.SuggestEntitlementsForUserAsync("NonExistent");

            // Assert
            Assert.NotNull(hints);
            Assert.Empty(hints);
        }

        [Fact]
        public async Task LogicEngineService_ShouldGenerateRiskDashboardWithEmptyData()
        {
            // Arrange
            await _logicEngine.LoadAllAsync();

            // Act
            var dashboard = await _logicEngine.GenerateRiskDashboardProjectionAsync();

            // Assert
            Assert.NotNull(dashboard);
            Assert.Equal(0, dashboard.TotalThreats);
            Assert.Empty(dashboard.TopRiskAssets);
        }

        [Fact]
        public async Task LogicEngineService_ShouldGenerateThreatAnalysisWithEmptyData()
        {
            // Arrange
            await _logicEngine.LoadAllAsync();

            // Act
            var analysis = await _logicEngine.GenerateThreatAnalysisProjectionAsync();

            // Assert
            Assert.NotNull(analysis);
            Assert.Equal(0, analysis.TotalThreats);
            Assert.Empty(analysis.AssetRiskScores);
        }
    }
}