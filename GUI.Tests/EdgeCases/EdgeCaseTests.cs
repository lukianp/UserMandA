using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using Moq;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using MandADiscoverySuite.Services;
using MandADiscoverySuite.ViewModels;

namespace GUI.Tests.EdgeCases
{
    [TestClass]
    public class EdgeCaseTests
    {
        private Mock<ILogger<BaseViewModel>> _mockLogger;
        private DataExportService _dataExportService;
        private string _testOutputDirectory;

        [TestInitialize]
        public void Setup()
        {
            _mockLogger = new Mock<ILogger<BaseViewModel>>();
            var exportLogger = new Mock<ILogger<DataExportService>>();
            _dataExportService = new DataExportService(exportLogger.Object);
            _testOutputDirectory = Path.Combine(Path.GetTempPath(), "EdgeCaseTests");
            Directory.CreateDirectory(_testOutputDirectory);
        }

        [TestCleanup]
        public void Cleanup()
        {
            if (Directory.Exists(_testOutputDirectory))
            {
                Directory.Delete(_testOutputDirectory, true);
            }
        }

        [TestMethod]
        public async Task ExportService_WithNullOrEmptyValues_HandlesGracefully()
        {
            // Arrange
            var testData = new List<EdgeCaseTestData>
            {
                new EdgeCaseTestData { Id = 1, Name = null, Description = string.Empty, Value = 0 },
                new EdgeCaseTestData { Id = 2, Name = "", Description = "   ", Value = double.NaN },
                new EdgeCaseTestData { Id = 3, Name = "Valid", Description = "Valid", Value = double.PositiveInfinity }
            };

            var fileName = "null_empty_test";
            var expectedFilePath = Path.Combine(_testOutputDirectory, $"{fileName}.csv");

            // Act
            var result = await _dataExportService.ExportToCsvAsync(testData, fileName, _testOutputDirectory);

            // Assert
            Assert.IsTrue(result);
            Assert.IsTrue(File.Exists(expectedFilePath));

            // Verify content handles nulls/empties correctly
            var lines = File.ReadAllLines(expectedFilePath);
            Assert.AreEqual(4, lines.Length); // Header + 3 data rows
            Assert.IsTrue(lines[1].Contains("1,,0")); // null becomes empty, NaN becomes 0
            Assert.IsTrue(lines[2].Contains("2, ,0")); // whitespace preserved, NaN becomes 0
            Assert.IsTrue(lines[3].Contains("3,Valid,Valid")); // Valid data preserved
        }

        [TestMethod]
        public async Task ExportService_WithVeryLongStrings_HandlesCorrectly()
        {
            // Arrange
            var longString = new string('A', 10000); // 10KB string
            var testData = new List<EdgeCaseTestData>
            {
                new EdgeCaseTestData { Id = 1, Name = longString, Description = longString, Value = 1.0 }
            };

            var fileName = "long_strings_test";
            var expectedFilePath = Path.Combine(_testOutputDirectory, $"{fileName}.csv");

            // Act
            var result = await _dataExportService.ExportToCsvAsync(testData, fileName, _testOutputDirectory);

            // Assert
            Assert.IsTrue(result);
            Assert.IsTrue(File.Exists(expectedFilePath));

            // Verify content
            var lines = File.ReadAllLines(expectedFilePath);
            Assert.AreEqual(2, lines.Length); // Header + 1 data row
            Assert.IsTrue(lines[1].Contains($"1,{longString},{longString}"));
        }

        [TestMethod]
        public async Task ExportService_WithSpecialCharacters_HandlesCorrectly()
        {
            // Arrange
            var testData = new List<EdgeCaseTestData>
            {
                new EdgeCaseTestData { Id = 1, Name = "Normal", Description = "Normal", Value = 1.0 },
                new EdgeCaseTestData { Id = 2, Name = "With,Comma", Description = "With;Semi;Colons", Value = 2.0 },
                new EdgeCaseTestData { Id = 3, Name = "With\nNewline", Description = "With\tTab", Value = 3.0 },
                new EdgeCaseTestData { Id = 4, Name = "With\"Quotes\"", Description = "With'Single'", Value = 4.0 }
            };

            var fileName = "special_chars_test";
            var expectedFilePath = Path.Combine(_testOutputDirectory, $"{fileName}.csv");

            // Act
            var result = await _dataExportService.ExportToCsvAsync(testData, fileName, _testOutputDirectory);

            // Assert
            Assert.IsTrue(result);
            Assert.IsTrue(File.Exists(expectedFilePath));

            // Verify content
            var lines = File.ReadAllLines(expectedFilePath);
            Assert.AreEqual(5, lines.Length); // Header + 4 data rows
            Assert.IsTrue(lines[1].Contains("1,Normal,Normal"));
            Assert.IsTrue(lines[2].Contains("\"With,Comma\"")); // Should be quoted
            Assert.IsTrue(lines[3].Contains("With\nNewline,With\tTab")); // Newlines and tabs should be preserved
            Assert.IsTrue(lines[4].Contains("\"With\"\"Quotes\"\"\"")); // Quotes should be escaped
        }

        [TestMethod]
        public async Task ExportService_WithExtremeNumericValues_HandlesCorrectly()
        {
            // Arrange
            var testData = new List<EdgeCaseTestData>
            {
                new EdgeCaseTestData { Id = 1, Name = "Min", Description = "Min", Value = double.MinValue },
                new EdgeCaseTestData { Id = 2, Name = "Max", Description = "Max", Value = double.MaxValue },
                new EdgeCaseTestData { Id = 3, Name = "Negative", Description = "Negative", Value = -999999.999999 },
                new EdgeCaseTestData { Id = 4, Name = "Scientific", Description = "Scientific", Value = 1.23E-10 }
            };

            var fileName = "extreme_numbers_test";
            var expectedFilePath = Path.Combine(_testOutputDirectory, $"{fileName}.csv");

            // Act
            var result = await _dataExportService.ExportToCsvAsync(testData, fileName, _testOutputDirectory);

            // Assert
            Assert.IsTrue(result);
            Assert.IsTrue(File.Exists(expectedFilePath));

            // Verify content
            var lines = File.ReadAllLines(expectedFilePath);
            Assert.AreEqual(5, lines.Length); // Header + 4 data rows
            Assert.IsTrue(lines[1].Contains(double.MinValue.ToString()));
            Assert.IsTrue(lines[2].Contains(double.MaxValue.ToString()));
            Assert.IsTrue(lines[3].Contains("-999999.999999"));
            Assert.IsTrue(lines[4].Contains("1.23E-10"));
        }

        [TestMethod]
        public async Task ExportService_WithUnicodeCharacters_HandlesCorrectly()
        {
            // Arrange
            var testData = new List<EdgeCaseTestData>
            {
                new EdgeCaseTestData { Id = 1, Name = "English", Description = "English", Value = 1.0 },
                new EdgeCaseTestData { Id = 2, Name = "中文", Description = "描述", Value = 2.0 },
                new EdgeCaseTestData { Id = 3, Name = "日本語", Description = "説明", Value = 3.0 },
                new EdgeCaseTestData { Id = 4, Name = "Русский", Description = "Описание", Value = 4.0 },
                new EdgeCaseTestData { Id = 5, Name = "🌟⭐🎯", Description = "Emojis", Value = 5.0 }
            };

            var fileName = "unicode_test";
            var expectedFilePath = Path.Combine(_testOutputDirectory, $"{fileName}.csv");

            // Act
            var result = await _dataExportService.ExportToCsvAsync(testData, fileName, _testOutputDirectory);

            // Assert
            Assert.IsTrue(result);
            Assert.IsTrue(File.Exists(expectedFilePath));

            // Verify content
            var content = File.ReadAllText(expectedFilePath, System.Text.Encoding.UTF8);
            Assert.IsTrue(content.Contains("中文"));
            Assert.IsTrue(content.Contains("日本語"));
            Assert.IsTrue(content.Contains("Русский"));
            Assert.IsTrue(content.Contains("🌟⭐🎯"));
        }

        [TestMethod]
        public void BaseViewModel_WithRapidPropertyChanges_HandlesCorrectly()
        {
            // Arrange
            var viewModel = new EdgeCaseTestViewModel(_mockLogger.Object);
            var notificationsReceived = 0;
            var notificationProperties = new List<string>();

            viewModel.PropertyChanged += (sender, args) =>
            {
                notificationsReceived++;
                notificationProperties.Add(args.PropertyName);
            };

            // Act - Rapid property changes
            for (int i = 0; i < 100; i++)
            {
                viewModel.IsLoading = i % 2 == 0;
                viewModel.HasErrors = i % 3 == 0;
                viewModel.StatusMessage = $"Status {i}";
                viewModel.LoadingProgress = i;
            }

            // Assert
            Assert.IsTrue(notificationsReceived > 300); // Should have many notifications
            Assert.IsTrue(notificationProperties.Distinct().Count() >= 4); // Multiple different properties
        }

        [TestMethod]
        public void BaseViewModel_WithConcurrentPropertyChanges_HandlesCorrectly()
        {
            // Arrange
            var viewModel = new EdgeCaseTestViewModel(_mockLogger.Object);
            var tasks = new List<Task>();
            var finalNotificationCount = 0;

            viewModel.PropertyChanged += (sender, args) =>
            {
                System.Threading.Interlocked.Increment(ref finalNotificationCount);
            };

            // Act - Concurrent property changes
            for (int i = 0; i < 10; i++)
            {
                tasks.Add(Task.Run(() =>
                {
                    for (int j = 0; j < 50; j++)
                    {
                        viewModel.IsLoading = j % 2 == 0;
                        viewModel.StatusMessage = $"Task {i}, Iteration {j}";
                        viewModel.HasErrors = j % 5 == 0;
                    }
                }));
            }

            Task.WaitAll(tasks.ToArray());

            // Assert
            Assert.IsTrue(finalNotificationCount > 1000); // Should handle concurrent changes
        }

        [TestMethod]
        public void BaseViewModel_WithPropertyChangeDuringAsyncOperation_HandlesCorrectly()
        {
            // Arrange
            var viewModel = new EdgeCaseTestViewModel(_mockLogger.Object);
            var notificationsDuringOperation = 0;

            viewModel.PropertyChanged += (sender, args) =>
            {
                if (viewModel.IsLoading)
                {
                    notificationsDuringOperation++;
                }
            };

            // Act - Change properties during async operation
            var task = viewModel.ExecuteAsyncOperationWithPropertyChanges();

            // Wait for completion
            Task.WaitAll(task);

            // Assert
            Assert.IsTrue(notificationsDuringOperation > 0);
            Assert.IsFalse(viewModel.IsLoading);
            Assert.IsTrue(viewModel.HasData);
        }

        [TestMethod]
        public void BaseViewModel_WithCircularPropertyDependencies_HandlesCorrectly()
        {
            // Arrange
            var viewModel = new EdgeCaseTestViewModel(_mockLogger.Object);

            // Act & Assert - Should not cause stack overflow
            try
            {
                viewModel.TestCircularDependency1 = true;
                viewModel.TestCircularDependency2 = true;
                Assert.IsTrue(viewModel.TestCircularDependency1);
                Assert.IsTrue(viewModel.TestCircularDependency2);
            }
            catch (StackOverflowException)
            {
                Assert.Fail("Circular property dependencies caused stack overflow");
            }
        }

        [TestMethod]
        public async Task ExportService_WithFileSystemErrors_HandlesGracefully()
        {
            // Arrange
            var testData = new List<EdgeCaseTestData>
            {
                new EdgeCaseTestData { Id = 1, Name = "Test", Description = "Test", Value = 1.0 }
            };

            // Act & Assert - Try to export to invalid paths
            var result1 = await _dataExportService.ExportToCsvAsync(testData, "test", "");
            Assert.IsFalse(result1);

            var result2 = await _dataExportService.ExportToCsvAsync(testData, "test", null);
            Assert.IsFalse(result2);

            // Try to export to a read-only directory
            var readOnlyDir = Path.Combine(Path.GetTempPath(), "readonly_test");
            Directory.CreateDirectory(readOnlyDir);
            try
            {
                var di = new DirectoryInfo(readOnlyDir);
                di.Attributes |= FileAttributes.ReadOnly;

                var result3 = await _dataExportService.ExportToCsvAsync(testData, "test", readOnlyDir);
                // Should handle gracefully even if it fails
            }
            catch (Exception ex)
            {
                Assert.IsTrue(ex is IOException || ex is UnauthorizedAccessException,
                    "Should handle file system errors appropriately");
            }
            finally
            {
                var di = new DirectoryInfo(readOnlyDir);
                di.Attributes &= ~FileAttributes.ReadOnly;
                Directory.Delete(readOnlyDir, true);
            }
        }

        [TestMethod]
        public void BaseViewModel_Dispose_HandlesMultipleCalls()
        {
            // Arrange
            var viewModel = new EdgeCaseTestViewModel(_mockLogger.Object);

            // Act & Assert - Multiple dispose calls should not throw
            viewModel.Dispose();
            viewModel.Dispose(); // Should not throw
            viewModel.Dispose(); // Should not throw

            Assert.IsTrue(viewModel.IsDisposed);
        }

        [TestMethod]
        public void BaseViewModel_Dispose_HandlesPropertyChangesAfterDispose()
        {
            // Arrange
            var viewModel = new EdgeCaseTestViewModel(_mockLogger.Object);
            var notificationsAfterDispose = 0;

            viewModel.PropertyChanged += (sender, args) =>
            {
                if (viewModel.IsDisposed)
                {
                    notificationsAfterDispose++;
                }
            };

            // Act
            viewModel.Dispose();

            // Try to change properties after dispose
            viewModel.IsLoading = true;
            viewModel.StatusMessage = "After dispose";
            viewModel.HasErrors = true;

            // Assert
            Assert.IsTrue(viewModel.IsDisposed);
            Assert.IsTrue(notificationsAfterDispose == 0); // Should not raise notifications after dispose
        }

        // Test helper classes
        private class EdgeCaseTestViewModel : BaseViewModel
        {
            public EdgeCaseTestViewModel(ILogger logger) : base(logger) { }

            private bool _testCircularDependency1;
            private bool _testCircularDependency2;

            public bool TestCircularDependency1
            {
                get => _testCircularDependency1;
                set
                {
                    if (SetProperty(ref _testCircularDependency1, value))
                    {
                        // Simulate circular dependency without actually causing one
                        TestCircularDependency2 = value;
                    }
                }
            }

            public bool TestCircularDependency2
            {
                get => _testCircularDependency2;
                set => SetProperty(ref _testCircularDependency2, value);
            }

            public async Task ExecuteAsyncOperationWithPropertyChanges()
            {
                await ExecuteAsync(async () =>
                {
                    for (int i = 0; i < 10; i++)
                    {
                        IsLoading = true;
                        StatusMessage = $"Processing {i}";
                        LoadingProgress = i * 10;
                        await Task.Delay(10);
                    }
                    HasData = true;
                }, "Async Operation with Changes");
            }

            public bool IsDisposed { get; private set; }

            protected override void Dispose(bool disposing)
            {
                IsDisposed = true;
                base.Dispose(disposing);
            }
        }

        private class EdgeCaseTestData
        {
            public int Id { get; set; }
            public string Name { get; set; }
            public string Description { get; set; }
            public double Value { get; set; }
        }
    }
}