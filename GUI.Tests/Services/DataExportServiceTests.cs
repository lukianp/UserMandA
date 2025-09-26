using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using Moq;
using Microsoft.VisualStudio.TestTools.UnitTesting;

namespace GUI.Tests
{
    [TestClass]
    public class DataExportServiceTests
    {
        private Mock<ILogger<DataExportService>> _mockLogger;
        private DataExportService _service;
        private string _testOutputDirectory;

        [TestInitialize]
        public void Setup()
        {
            _mockLogger = new Mock<ILogger<MockDataExportService>>();
            _service = new MockDataExportService();
            _testOutputDirectory = Path.Combine(Path.GetTempPath(), "DataExportTests");
            Directory.CreateDirectory(_testOutputDirectory);
        }

        [TestCleanup]
        public void Cleanup()
        {
            // Clean up test files
            if (Directory.Exists(_testOutputDirectory))
            {
                Directory.Delete(_testOutputDirectory, true);
            }
        }

        [TestMethod]
        public async Task ExportToCsvAsync_WithValidData_CreatesFile()
        {
            // Arrange
            var testData = new List<TestDataObject>
            {
                new TestDataObject { Id = 1, Name = "Test1", Value = 100 },
                new TestDataObject { Id = 2, Name = "Test2", Value = 200 }
            };
            var fileName = "test_export";
            var expectedFilePath = Path.Combine(_testOutputDirectory, $"{fileName}.csv");

            // Act
            var result = await _service.ExportToCsvAsync(testData, fileName, _testOutputDirectory);

            // Assert
            Assert.IsTrue(result);
            Assert.IsTrue(File.Exists(expectedFilePath));

            // Verify content
            var content = File.ReadAllLines(expectedFilePath);
            Assert.AreEqual(3, content.Length); // Header + 2 data rows
            Assert.IsTrue(content[0].Contains("Id,Name,Value"));
            Assert.IsTrue(content[1].Contains("1,Test1,100"));
            Assert.IsTrue(content[2].Contains("2,Test2,200"));
        }

        [TestMethod]
        public async Task ExportToCsvAsync_WithEmptyData_CreatesEmptyFile()
        {
            // Arrange
            var testData = new List<TestDataObject>();
            var fileName = "empty_export";
            var expectedFilePath = Path.Combine(_testOutputDirectory, $"{fileName}.csv");

            // Act
            var result = await _service.ExportToCsvAsync(testData, fileName, _testOutputDirectory);

            // Assert
            Assert.IsTrue(result);
            Assert.IsTrue(File.Exists(expectedFilePath));

            // Verify content
            var content = File.ReadAllLines(expectedFilePath);
            Assert.AreEqual(1, content.Length); // Only header
            Assert.IsTrue(content[0].Contains("Id,Name,Value"));
        }

        [TestMethod]
        public async Task ExportToCsvAsync_WithSpecialCharacters_EscapesProperly()
        {
            // Arrange
            var testData = new List<TestDataObject>
            {
                new TestDataObject { Id = 1, Name = "Test,With,Commas", Value = 100 },
                new TestDataObject { Id = 2, Name = "Test\"With\"Quotes", Value = 200 }
            };
            var fileName = "special_chars_export";
            var expectedFilePath = Path.Combine(_testOutputDirectory, $"{fileName}.csv");

            // Act
            var result = await _service.ExportToCsvAsync(testData, fileName, _testOutputDirectory);

            // Assert
            Assert.IsTrue(result);
            Assert.IsTrue(File.Exists(expectedFilePath));

            // Verify content
            var content = File.ReadAllLines(expectedFilePath);
            Assert.IsTrue(content[1].Contains("\"Test,With,Commas\""));
            Assert.IsTrue(content[2].Contains("\"Test\"\"With\"\"Quotes\""));
        }

        [TestMethod]
        public async Task ExportToCsvAsync_WithNullOutputDirectory_UsesDefault()
        {
            // Arrange
            var testData = new List<TestDataObject>
            {
                new TestDataObject { Id = 1, Name = "Test", Value = 100 }
            };
            var fileName = "default_dir_export";

            // Act
            var result = await _service.ExportToCsvAsync(testData, fileName);

            // Assert
            Assert.IsTrue(result);
            // File should be created in current directory or temp
            var files = Directory.GetFiles(Directory.GetCurrentDirectory(), $"{fileName}.csv");
            Assert.IsTrue(files.Length > 0 || File.Exists(Path.Combine(Path.GetTempPath(), $"{fileName}.csv")));
        }

        [TestMethod]
        public async Task ExportToExcelAsync_WithValidData_CreatesFile()
        {
            // Arrange
            var testData = new List<TestDataObject>
            {
                new TestDataObject { Id = 1, Name = "Test1", Value = 100 },
                new TestDataObject { Id = 2, Name = "Test2", Value = 200 }
            };
            var fileName = "test_excel_export";
            var expectedFilePath = Path.Combine(_testOutputDirectory, $"{fileName}.xlsx");

            // Act
            var result = await _service.ExportToExcelAsync(testData, fileName, _testOutputDirectory);

            // Assert
            Assert.IsTrue(result);
            Assert.IsTrue(File.Exists(expectedFilePath));
            Assert.IsTrue(new FileInfo(expectedFilePath).Length > 0); // File should have content
        }

        [TestMethod]
        public async Task ExportToExcelAsync_WithEmptyData_CreatesEmptyFile()
        {
            // Arrange
            var testData = new List<TestDataObject>();
            var fileName = "empty_excel_export";
            var expectedFilePath = Path.Combine(_testOutputDirectory, $"{fileName}.xlsx");

            // Act
            var result = await _service.ExportToExcelAsync(testData, fileName, _testOutputDirectory);

            // Assert
            Assert.IsTrue(result);
            Assert.IsTrue(File.Exists(expectedFilePath));
        }

        [TestMethod]
        public async Task ExportToJsonAsync_WithValidData_CreatesFile()
        {
            // Arrange
            var testData = new List<TestDataObject>
            {
                new TestDataObject { Id = 1, Name = "Test1", Value = 100 },
                new TestDataObject { Id = 2, Name = "Test2", Value = 200 }
            };
            var fileName = "test_json_export";
            var expectedFilePath = Path.Combine(_testOutputDirectory, $"{fileName}.json");

            // Act
            var result = await _service.ExportToJsonAsync(testData, fileName, _testOutputDirectory);

            // Assert
            Assert.IsTrue(result);
            Assert.IsTrue(File.Exists(expectedFilePath));

            // Verify content
            var content = File.ReadAllText(expectedFilePath);
            Assert.IsTrue(content.Contains("\"Id\":1"));
            Assert.IsTrue(content.Contains("\"Name\":\"Test1\""));
            Assert.IsTrue(content.Contains("\"Value\":100"));
            Assert.IsTrue(content.Contains("\"Id\":2"));
        }

        [TestMethod]
        public async Task ExportToJsonAsync_WithComplexObjects_SerializesCorrectly()
        {
            // Arrange
            var testData = new List<ComplexTestObject>
            {
                new ComplexTestObject
                {
                    Id = 1,
                    Name = "Complex",
                    CreatedDate = new DateTime(2023, 1, 1),
                    Tags = new List<string> { "tag1", "tag2" }
                }
            };
            var fileName = "complex_json_export";
            var expectedFilePath = Path.Combine(_testOutputDirectory, $"{fileName}.json");

            // Act
            var result = await _service.ExportToJsonAsync(testData, fileName, _testOutputDirectory);

            // Assert
            Assert.IsTrue(result);
            Assert.IsTrue(File.Exists(expectedFilePath));

            // Verify content
            var content = File.ReadAllText(expectedFilePath);
            Assert.IsTrue(content.Contains("\"CreatedDate\":\"2023-01-01T00:00:00\""));
            Assert.IsTrue(content.Contains("\"Tags\":[\"tag1\",\"tag2\"]"));
        }

        [TestMethod]
        public async Task ExportToCsvAsync_WithLargeDataset_HandlesMemoryEfficiently()
        {
            // Arrange
            var testData = new List<TestDataObject>();
            for (int i = 0; i < 10000; i++)
            {
                testData.Add(new TestDataObject { Id = i, Name = $"Test{i}", Value = i * 10 });
            }
            var fileName = "large_dataset_export";
            var expectedFilePath = Path.Combine(_testOutputDirectory, $"{fileName}.csv");

            // Act
            var result = await _service.ExportToCsvAsync(testData, fileName, _testOutputDirectory);

            // Assert
            Assert.IsTrue(result);
            Assert.IsTrue(File.Exists(expectedFilePath));

            // Verify file size is reasonable
            var fileInfo = new FileInfo(expectedFilePath);
            Assert.IsTrue(fileInfo.Length > 100000); // Should be > 100KB for 10k records

            // Verify record count
            var lines = File.ReadAllLines(expectedFilePath);
            Assert.AreEqual(10001, lines.Length); // Header + 10k data rows
        }

        [TestMethod]
        public async Task ExportToCsvAsync_WithInvalidFileName_HandlesGracefully()
        {
            // Arrange
            var testData = new List<TestDataObject>
            {
                new TestDataObject { Id = 1, Name = "Test", Value = 100 }
            };
            var invalidFileName = "test<>|export"; // Invalid filename characters

            // Act & Assert
            try
            {
                var result = await _service.ExportToCsvAsync(testData, invalidFileName, _testOutputDirectory);
                Assert.IsTrue(result); // Should still succeed with sanitized filename
            }
            catch (Exception ex)
            {
                Assert.IsTrue(ex is ArgumentException || ex is IOException,
                    "Should handle invalid filename gracefully");
            }
        }

        [TestMethod]
        public async Task ExportToCsvAsync_WithNullData_ReturnsFalse()
        {
            // Act
            var result = await _service.ExportToCsvAsync(null, "null_test", _testOutputDirectory);

            // Assert
            Assert.IsFalse(result);
        }

        [TestMethod]
        public async Task ExportToExcelAsync_WithNullData_ReturnsFalse()
        {
            // Act
            var result = await _service.ExportToExcelAsync(null, "null_test", _testOutputDirectory);

            // Assert
            Assert.IsFalse(result);
        }

        [TestMethod]
        public async Task ExportToJsonAsync_WithNullData_ReturnsFalse()
        {
            // Act
            var result = await _service.ExportToJsonAsync(null, "null_test", _testOutputDirectory);

            // Assert
            Assert.IsFalse(result);
        }

        // Test helper classes
        private class TestDataObject
        {
            public int Id { get; set; }
            public string Name { get; set; }
            public int Value { get; set; }
        }

        private class ComplexTestObject
        {
            public int Id { get; set; }
            public string Name { get; set; }
            public DateTime CreatedDate { get; set; }
            public List<string> Tags { get; set; }
        }
    }
}