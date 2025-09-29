using System;
using System.IO;
using System.Threading.Tasks;
using Xunit;
using FluentAssertions;
using Moq;
using MandADiscoverySuite.Services;
using Microsoft.Extensions.Logging;

namespace MandADiscoverySuite.Tests.Services
{
    public class CsvDataServiceTests : IDisposable
    {
        private readonly string _testDataPath;
        private readonly string _testProfileName = "testprofile";
        private readonly Mock<ILogger<CsvDataServiceNew>> _mockLogger;

        public CsvDataServiceTests()
        {
            _mockLogger = new Mock<ILogger<CsvDataServiceNew>>();
            _testDataPath = Path.Combine(Path.GetTempPath(), "MandATestData", Guid.NewGuid().ToString());
            Directory.CreateDirectory(_testDataPath);
            Directory.CreateDirectory(Path.Combine(_testDataPath, _testProfileName, "Raw"));
        }

        public void Dispose()
        {
            try
            {
                if (Directory.Exists(_testDataPath))
                {
                    Directory.Delete(_testDataPath, true);
                }
            }
            catch { }
        }

        [Fact]
        public async Task LoadCsvDataAsync_WithValidFile_ReturnsData()
        {
            var testFilePath = CreateTestCsvFile("users.csv", "Name,Email\nJohn,john@test.com\nJane,jane@test.com");
            var service = new CsvDataServiceNew(_mockLogger.Object, _testProfileName);

            var result = await service.LoadCsvDataAsync(testFilePath);

            result.Should().NotBeNull();
            result.Count.Should().Be(2);
        }

        [Fact]
        public async Task LoadCsvDataAsync_WithMissingFile_ThrowsFileNotFoundException()
        {
            var nonExistentFile = Path.Combine(_testDataPath, "nonexistent.csv");
            var service = new CsvDataServiceNew(_mockLogger.Object, _testProfileName);

            Func<Task> act = async () => await service.LoadCsvDataAsync(nonExistentFile);

            await act.Should().ThrowAsync<FileNotFoundException>();
        }

        [Fact]
        public async Task LoadCsvDataAsync_WithEmptyFile_ReturnsEmptyCollection()
        {
            var testFilePath = CreateTestCsvFile("empty.csv", string.Empty);
            var service = new CsvDataServiceNew(_mockLogger.Object, _testProfileName);

            var result = await service.LoadCsvDataAsync(testFilePath);

            result.Should().NotBeNull();
            result.Count.Should().Be(0);
        }

        private string CreateTestCsvFile(string fileName, string content)
        {
            var filePath = Path.Combine(_testDataPath, _testProfileName, "Raw", fileName);
            File.WriteAllText(filePath, content);
            return filePath;
        }
    }
}
