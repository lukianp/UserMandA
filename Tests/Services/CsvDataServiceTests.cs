using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using Moq;
using Xunit;
using MandADiscoverySuite.Services;
using MandADiscoverySuite.Models;

namespace MandADiscoverySuite.Tests.Services
{
    /// <summary>
    /// Unit tests for CsvDataService
    /// </summary>
    public class CsvDataServiceTests
    {
        private readonly Mock<ILogger<CsvDataService>> _mockLogger;
        private readonly Mock<IntelligentCacheService> _mockCacheService;
        private readonly CsvDataService _service;

        public CsvDataServiceTests()
        {
            _mockLogger = new Mock<ILogger<CsvDataService>>();
            _mockCacheService = new Mock<IntelligentCacheService>();
            _service = new CsvDataService(_mockLogger.Object, _mockCacheService.Object);
        }

        [Fact]
        public async Task GetDataSummaryAsync_ValidProfile_ReturnsSummary()
        {
            // Arrange
            var profileName = "TestProfile";

            // Act
            var result = await _service.GetDataSummaryAsync(profileName);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(profileName, result.ProfileName);
            Assert.True(result.LastUpdated <= DateTime.UtcNow);
        }

        [Fact]
        public async Task SearchAsync_EmptySearchTerm_ReturnsEmptyResults()
        {
            // Arrange
            var profileName = "TestProfile";
            var searchTerm = "";

            // Act
            var result = await _service.SearchAsync(profileName, searchTerm);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(searchTerm, result.SearchTerm);
            Assert.Equal(0, result.TotalResults);
        }

        [Fact]
        public async Task ClearCacheAsync_ValidProfile_ClearsCache()
        {
            // Arrange
            var profileName = "TestProfile";
            _mockCacheService.Setup(x => x.RemoveAsync(It.IsAny<string>()))
                .Returns(Task.CompletedTask);

            // Act
            await _service.ClearCacheAsync(profileName);

            // Assert
            _mockCacheService.Verify(x => x.RemoveAsync($"Users_{profileName}"), Times.Once);
            _mockCacheService.Verify(x => x.RemoveAsync($"Infrastructure_{profileName}"), Times.Once);
            _mockCacheService.Verify(x => x.RemoveAsync($"Groups_{profileName}"), Times.Once);
            _mockCacheService.Verify(x => x.RemoveAsync($"Applications_{profileName}"), Times.Once);
        }

        [Fact]
        public async Task GetCacheStatisticsAsync_ReturnsValidStatistics()
        {
            // Act
            var result = await _service.GetCacheStatisticsAsync();

            // Assert
            Assert.NotNull(result);
            Assert.True(result.HitRatio >= 0 && result.HitRatio <= 1);
        }
    }
}