using System;
using System.Collections.ObjectModel;
using System.IO;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using Moq;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using MandADiscoverySuite.Services;
using MandADiscoverySuite.ViewModels;

namespace GUI.Tests.Integration
{
    [TestClass]
    public class ViewModelServiceIntegrationTests
    {
        private Mock<ILogger<BaseViewModel>> _mockLogger;
        private DataExportService _dataExportService;
        private TestIntegrationViewModel _viewModel;
        private string _testOutputDirectory;

        [TestInitialize]
        public void Setup()
        {
            _mockLogger = new Mock<ILogger<BaseViewModel>>();
            var exportLogger = new Mock<ILogger<DataExportService>>();

            _dataExportService = new DataExportService(exportLogger.Object);
            _viewModel = new TestIntegrationViewModel(_mockLogger.Object);
            _testOutputDirectory = Path.Combine(Path.GetTempPath(), "IntegrationTests");
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
        public async Task ExportCommand_WithValidData_CreatesFileAndUpdatesStatus()
        {
            // Arrange
            var testData = new ObservableCollection<TestDataItem>
            {
                new TestDataItem { Id = 1, Name = "Test Item 1", Description = "Description 1" },
                new TestDataItem { Id = 2, Name = "Test Item 2", Description = "Description 2" }
            };

            _viewModel.TestData = testData;
            var expectedFilePath = Path.Combine(_testOutputDirectory, "integration_export.csv");

            // Act
            await _viewModel.ExecuteExportCommandAsync(_testOutputDirectory);

            // Assert
            Assert.IsTrue(File.Exists(expectedFilePath));

            // Verify content
            var lines = File.ReadAllLines(expectedFilePath);
            Assert.AreEqual(3, lines.Length); // Header + 2 data rows
            Assert.IsTrue(lines[0].Contains("Id,Name,Description"));
            Assert.IsTrue(lines[1].Contains("1,Test Item 1,Description 1"));
            Assert.IsTrue(lines[2].Contains("2,Test Item 2,Description 2"));
        }

        [TestMethod]
        public async Task ExportCommand_WithEmptyData_HandlesGracefully()
        {
            // Arrange
            var testData = new ObservableCollection<TestDataItem>();
            _viewModel.TestData = testData;

            // Act
            await _viewModel.ExecuteExportCommandAsync(_testOutputDirectory);

            // Assert
            var expectedFilePath = Path.Combine(_testOutputDirectory, "integration_export.csv");
            Assert.IsTrue(File.Exists(expectedFilePath));

            // Verify only header exists
            var lines = File.ReadAllLines(expectedFilePath);
            Assert.AreEqual(1, lines.Length);
            Assert.IsTrue(lines[0].Contains("Id,Name,Description"));
        }

        [TestMethod]
        public async Task ExportCommand_WithError_UpdatesErrorState()
        {
            // Arrange
            var testData = new ObservableCollection<TestDataItem>
            {
                new TestDataItem { Id = 1, Name = "Test", Description = "Test" }
            };

            _viewModel.TestData = testData;

            // Act - Try to export to a read-only directory
            var readOnlyPath = Path.Combine(Path.GetTempPath(), "readonly");
            Directory.CreateDirectory(readOnlyPath);
            try
            {
                var di = new DirectoryInfo(readOnlyPath);
                di.Attributes |= FileAttributes.ReadOnly;

                await _viewModel.ExecuteExportCommandAsync(readOnlyPath);

                // Assert
                Assert.IsTrue(_viewModel.HasErrors);
                Assert.IsFalse(string.IsNullOrEmpty(_viewModel.ErrorMessage));
            }
            finally
            {
                // Cleanup
                var di = new DirectoryInfo(readOnlyPath);
                di.Attributes &= ~FileAttributes.ReadOnly;
                Directory.Delete(readOnlyPath, true);
            }
        }

        [TestMethod]
        public async Task LoadDataCommand_UpdatesCollectionsAndProperties()
        {
            // Arrange
            var testData = new ObservableCollection<TestDataItem>
            {
                new TestDataItem { Id = 1, Name = "Item 1", Description = "Desc 1" }
            };

            // Act
            await _viewModel.ExecuteLoadDataCommandAsync(testData);

            // Assert
            Assert.IsTrue(_viewModel.HasData);
            Assert.IsFalse(_viewModel.HasNoData);
            Assert.AreEqual(1, _viewModel.TestData.Count);
            Assert.AreEqual("Item 1", _viewModel.TestData[0].Name);
        }

        [TestMethod]
        public async Task ClearDataCommand_ResetsState()
        {
            // Arrange
            var testData = new ObservableCollection<TestDataItem>
            {
                new TestDataItem { Id = 1, Name = "Item 1", Description = "Desc 1" }
            };

            await _viewModel.ExecuteLoadDataCommandAsync(testData);
            Assert.IsTrue(_viewModel.HasData);

            // Act
            await _viewModel.ExecuteClearDataCommandAsync();

            // Assert
            Assert.IsFalse(_viewModel.HasData);
            Assert.IsTrue(_viewModel.HasNoData);
            Assert.AreEqual(0, _viewModel.TestData.Count);
        }

        [TestMethod]
        public async Task AsyncOperation_WithProgressTracking_UpdatesProgress()
        {
            // Arrange
            int progressCallbackCount = 0;
            int lastProgressValue = 0;

            _viewModel.ProgressCallback = (progress, message) =>
            {
                progressCallbackCount++;
                lastProgressValue = progress;
                _viewModel.LoadingMessage = message;
            };

            // Act
            await _viewModel.ExecuteLongRunningOperationAsync();

            // Assert
            Assert.IsTrue(progressCallbackCount > 0);
            Assert.AreEqual(100, lastProgressValue); // Should end at 100%
            Assert.IsFalse(_viewModel.IsLoading);
            Assert.IsTrue(_viewModel.HasData);
        }

        [TestMethod]
        public async Task AsyncOperation_WithError_HandlesException()
        {
            // Act
            await _viewModel.ExecuteFailingOperationAsync();

            // Assert
            Assert.IsTrue(_viewModel.HasErrors);
            Assert.IsFalse(string.IsNullOrEmpty(_viewModel.ErrorMessage));
            Assert.IsFalse(_viewModel.IsLoading);
        }

        [TestMethod]
        public void PropertyChanges_WithNotifications_TriggerEvents()
        {
            // Arrange
            var propertyChangedCount = 0;
            string lastPropertyName = null;

            _viewModel.PropertyChanged += (sender, args) =>
            {
                propertyChangedCount++;
                lastPropertyName = args.PropertyName;
            };

            // Act - Multiple property changes
            _viewModel.TestData = new ObservableCollection<TestDataItem>();
            _viewModel.IsLoading = true;
            _viewModel.StatusMessage = "Test Status";
            _viewModel.HasErrors = true;

            // Assert
            Assert.IsTrue(propertyChangedCount >= 4); // Should have multiple notifications
            Assert.AreEqual("HasErrors", lastPropertyName);
        }

        [TestMethod]
        public async Task MultipleConcurrentOperations_HandlesCorrectly()
        {
            // Arrange
            var tasks = new List<Task>
            {
                _viewModel.ExecuteLoadDataCommandAsync(new ObservableCollection<TestDataItem>
                {
                    new TestDataItem { Id = 1, Name = "Item 1", Description = "Desc 1" }
                }),
                _viewModel.ExecuteLoadDataCommandAsync(new ObservableCollection<TestDataItem>
                {
                    new TestDataItem { Id = 2, Name = "Item 2", Description = "Desc 2" }
                })
            };

            // Act
            await Task.WhenAll(tasks);

            // Assert - Should handle concurrent operations
            Assert.IsTrue(_viewModel.HasData);
            Assert.AreEqual(2, _viewModel.TestData.Count); // Both should be added
        }

        [TestMethod]
        public void TabTitle_PropertyChanges_UpdatesCorrectly()
        {
            // Arrange
            var originalTitle = _viewModel.TabTitle;

            // Act
            _viewModel.TabTitle = "New Tab Title";

            // Assert
            Assert.AreEqual("New Tab Title", _viewModel.TabTitle);
            Assert.AreNotEqual(originalTitle, _viewModel.TabTitle);
        }

        [TestMethod]
        public void CanClose_PropertyChanges_UpdatesCorrectly()
        {
            // Arrange
            _viewModel.CanClose = true;

            // Act
            _viewModel.CanClose = false;

            // Assert
            Assert.IsFalse(_viewModel.CanClose);
        }

        // Test helper classes
        private class TestIntegrationViewModel : BaseViewModel
        {
            public TestIntegrationViewModel(ILogger logger) : base(logger) { }

            public ObservableCollection<TestDataItem> TestData { get; set; } = new ObservableCollection<TestDataItem>();
            public Action<int, string> ProgressCallback { get; set; }

            public async Task ExecuteExportCommandAsync(string outputDirectory)
            {
                await ExecuteAsync(async () =>
                {
                    var dataExportService = new DataExportService(Mock.Of<ILogger<DataExportService>>());
                    await dataExportService.ExportToCsvAsync(TestData, "integration_export", outputDirectory);
                }, "Export Data");
            }

            public async Task ExecuteLoadDataCommandAsync(ObservableCollection<TestDataItem> data)
            {
                await ExecuteAsync(async () =>
                {
                    TestData.Clear();
                    foreach (var item in data)
                    {
                        TestData.Add(item);
                    }
                    await Task.Delay(10); // Simulate async work
                }, "Load Data");
            }

            public async Task ExecuteClearDataCommandAsync()
            {
                await ExecuteAsync(async () =>
                {
                    TestData.Clear();
                    await Task.Delay(10); // Simulate async work
                }, "Clear Data");
            }

            public async Task ExecuteLongRunningOperationAsync()
            {
                await ExecuteAsync(async () =>
                {
                    for (int i = 0; i <= 100; i += 10)
                    {
                        LoadingProgress = i;
                        if (ProgressCallback != null)
                        {
                            ProgressCallback(i, $"Processing {i}%");
                        }
                        await Task.Delay(20); // Simulate work
                    }
                    HasData = true;
                }, "Long Running Operation");
            }

            public async Task ExecuteFailingOperationAsync()
            {
                await ExecuteAsync(async () =>
                {
                    await Task.Delay(10);
                    throw new InvalidOperationException("Simulated operation failure");
                }, "Failing Operation");
            }
        }

        private class TestDataItem
        {
            public int Id { get; set; }
            public string Name { get; set; }
            public string Description { get; set; }
        }
    }
}