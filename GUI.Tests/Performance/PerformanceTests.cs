using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using Moq;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using MandADiscoverySuite.Services;
using MandADiscoverySuite.ViewModels;

namespace GUI.Tests.Performance
{
    [TestClass]
    public class PerformanceTests
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
            _testOutputDirectory = Path.Combine(Path.GetTempPath(), "PerformanceTests");
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
        [Timeout(30000)] // 30 second timeout
        public async Task LargeDatasetExport_PerformanceTest()
        {
            // Arrange
            var largeDataset = new List<PerformanceTestData>();
            for (int i = 0; i < 10000; i++)
            {
                largeDataset.Add(new PerformanceTestData
                {
                    Id = i,
                    Name = $"Performance Test Item {i}",
                    Description = $"This is a description for item {i} with some additional text to make it more realistic",
                    Value = i * 1.5,
                    Category = $"Category_{i % 10}",
                    CreatedDate = DateTime.Now.AddDays(-i),
                    Tags = new List<string> { $"tag{i % 5}", $"tag{(i + 1) % 5}" }
                });
            }

            var fileName = "large_dataset_performance_test";
            var expectedFilePath = Path.Combine(_testOutputDirectory, $"{fileName}.csv");

            // Act
            var stopwatch = Stopwatch.StartNew();
            var result = await _dataExportService.ExportToCsvAsync(largeDataset, fileName, _testOutputDirectory);
            stopwatch.Stop();

            // Assert
            Assert.IsTrue(result);
            Assert.IsTrue(File.Exists(expectedFilePath));

            // Performance assertions
            var elapsedMs = stopwatch.ElapsedMilliseconds;
            Assert.IsTrue(elapsedMs < 10000, $"Export took too long: {elapsedMs}ms"); // Should complete in < 10 seconds

            var fileInfo = new FileInfo(expectedFilePath);
            var expectedMinSize = 1000000; // At least 1MB for 10k records
            Assert.IsTrue(fileInfo.Length > expectedMinSize, $"File size too small: {fileInfo.Length} bytes");

            // Verify record count
            var lines = File.ReadAllLines(expectedFilePath);
            Assert.AreEqual(10001, lines.Length); // Header + 10k data rows

            Console.WriteLine($"Large dataset export completed in {elapsedMs}ms for {largeDataset.Count} records");
        }

        [TestMethod]
        [Timeout(10000)] // 10 second timeout
        public async Task BaseViewModel_PropertyChangeNotifications_PerformanceTest()
        {
            // Arrange
            var viewModel = new PerformanceTestViewModel(_mockLogger.Object);
            var notificationsReceived = 0;
            var stopwatch = new Stopwatch();

            viewModel.PropertyChanged += (sender, args) =>
            {
                notificationsReceived++;
            };

            // Act
            stopwatch.Start();

            // Rapid property changes
            for (int i = 0; i < 1000; i++)
            {
                viewModel.IsLoading = i % 2 == 0;
                viewModel.LoadingProgress = i % 100;
                viewModel.StatusMessage = $"Status {i}";
                viewModel.HasErrors = i % 10 == 0;
            }

            stopwatch.Stop();

            // Assert
            var elapsedMs = stopwatch.ElapsedMilliseconds;
            Assert.IsTrue(elapsedMs < 5000, $"Property notifications took too long: {elapsedMs}ms");
            Assert.IsTrue(notificationsReceived > 3000, $"Expected > 3000 notifications, got {notificationsReceived}");

            Console.WriteLine($"Property change notifications: {notificationsReceived} in {elapsedMs}ms");
        }

        [TestMethod]
        [Timeout(15000)] // 15 second timeout
        public async Task ObservableCollectionOperations_PerformanceTest()
        {
            // Arrange
            var collection = new ObservableCollection<PerformanceTestData>();
            var stopwatch = new Stopwatch();
            var operationsCompleted = 0;

            collection.CollectionChanged += (sender, args) =>
            {
                operationsCompleted++;
            };

            // Act
            stopwatch.Start();

            // Large number of collection operations
            for (int i = 0; i < 5000; i++)
            {
                collection.Add(new PerformanceTestData
                {
                    Id = i,
                    Name = $"Item {i}",
                    Description = $"Description {i}",
                    Value = i,
                    Category = $"Category_{i % 10}",
                    CreatedDate = DateTime.Now.AddDays(-i),
                    Tags = new List<string> { "tag1", "tag2" }
                });

                if (i % 100 == 0 && i > 0)
                {
                    collection.RemoveAt(collection.Count - 1);
                }
            }

            stopwatch.Stop();

            // Assert
            var elapsedMs = stopwatch.ElapsedMilliseconds;
            Assert.IsTrue(elapsedMs < 10000, $"Collection operations took too long: {elapsedMs}ms");
            Assert.IsTrue(operationsCompleted > 4900, $"Expected > 4900 operations, got {operationsCompleted}");

            Console.WriteLine($"Collection operations: {operationsCompleted} in {elapsedMs}ms");
        }

        [TestMethod]
        [Timeout(5000)] // 5 second timeout
        public async Task AsyncCommandExecution_PerformanceTest()
        {
            // Arrange
            var viewModel = new PerformanceTestViewModel(_mockLogger.Object);
            var command = new BaseViewModel.AsyncRelayCommand(async () =>
            {
                await Task.Delay(10); // Small delay to simulate work
            });

            var stopwatch = new Stopwatch();
            var executionsCompleted = 0;

            // Act
            stopwatch.Start();

            // Execute many async commands concurrently
            var tasks = new List<Task>();
            for (int i = 0; i < 100; i++)
            {
                tasks.Add(Task.Run(async () =>
                {
                    for (int j = 0; j < 10; j++)
                    {
                        await viewModel.ExecuteSmallAsyncOperation();
                        System.Threading.Interlocked.Increment(ref executionsCompleted);
                    }
                }));
            }

            await Task.WhenAll(tasks);
            stopwatch.Stop();

            // Assert
            var elapsedMs = stopwatch.ElapsedMilliseconds;
            Assert.IsTrue(elapsedMs < 3000, $"Async operations took too long: {elapsedMs}ms");
            Assert.AreEqual(1000, executionsCompleted);

            Console.WriteLine($"Async operations: {executionsCompleted} in {elapsedMs}ms");
        }

        [TestMethod]
        [Timeout(20000)] // 20 second timeout
        public async Task MemoryUsage_PerformanceTest()
        {
            // Arrange
            var viewModels = new List<PerformanceTestViewModel>();
            var initialMemory = GC.GetTotalMemory(true);

            // Act
            for (int i = 0; i < 100; i++)
            {
                var vm = new PerformanceTestViewModel(_mockLogger.Object);
                vm.TestData = new ObservableCollection<PerformanceTestData>();

                // Add data to each view model
                for (int j = 0; j < 100; j++)
                {
                    vm.TestData.Add(new PerformanceTestData
                    {
                        Id = j,
                        Name = $"Item {j}",
                        Description = $"Description {j}",
                        Value = j,
                        Category = $"Category_{j % 10}",
                        CreatedDate = DateTime.Now.AddDays(-j),
                        Tags = new List<string> { "tag1", "tag2" }
                    });
                }

                viewModels.Add(vm);
            }

            // Force garbage collection
            GC.Collect();
            GC.WaitForPendingFinalizers();
            var finalMemory = GC.GetTotalMemory(false);

            // Assert
            var memoryIncrease = finalMemory - initialMemory;
            var memoryPerViewModel = memoryIncrease / viewModels.Count;

            // Each view model should use reasonable memory (< 50KB per VM with 100 items)
            Assert.IsTrue(memoryPerViewModel < 51200, $"Memory per view model too high: {memoryPerViewModel} bytes");

            Console.WriteLine($"Memory usage: {memoryIncrease} bytes total, {memoryPerViewModel} bytes per view model");

            // Cleanup
            viewModels.Clear();
            GC.Collect();
        }

        [TestMethod]
        public async Task BatchedPropertyNotifications_PerformanceTest()
        {
            // Arrange
            var viewModel = new PerformanceTestViewModel(_mockLogger.Object);
            var notificationsReceived = 0;
            var stopwatch = new Stopwatch();

            viewModel.PropertyChanged += (sender, args) =>
            {
                notificationsReceived++;
            };

            // Act
            stopwatch.Start();

            // Batch many property changes
            for (int i = 0; i < 100; i++)
            {
                viewModel.BatchUpdateProperties(i);
            }

            stopwatch.Stop();

            // Wait for batched notifications to process
            await Task.Delay(200);

            // Assert
            var elapsedMs = stopwatch.ElapsedMilliseconds;
            Assert.IsTrue(elapsedMs < 2000, $"Batched notifications took too long: {elapsedMs}ms");
            Assert.IsTrue(notificationsReceived > 0, "Should have received some notifications");

            Console.WriteLine($"Batched notifications: {notificationsReceived} in {elapsedMs}ms");
        }

        [TestMethod]
        [Timeout(10000)] // 10 second timeout
        public async Task ConcurrentDataLoading_PerformanceTest()
        {
            // Arrange
            var viewModel = new PerformanceTestViewModel(_mockLogger.Object);
            var tasks = new List<Task>();
            var stopwatch = new Stopwatch();

            // Act
            stopwatch.Start();

            // Load data concurrently from multiple sources
            for (int i = 0; i < 10; i++)
            {
                tasks.Add(viewModel.LoadDataBatchAsync(i * 100, 100));
            }

            await Task.WhenAll(tasks);
            stopwatch.Stop();

            // Assert
            var elapsedMs = stopwatch.ElapsedMilliseconds;
            Assert.IsTrue(elapsedMs < 8000, $"Concurrent loading took too long: {elapsedMs}ms");
            Assert.AreEqual(1000, viewModel.TestData.Count); // 10 batches * 100 items each

            Console.WriteLine($"Concurrent data loading: {viewModel.TestData.Count} items in {elapsedMs}ms");
        }

        // Test helper classes
        private class PerformanceTestViewModel : BaseViewModel
        {
            public PerformanceTestViewModel(ILogger logger) : base(logger) { }

            public ObservableCollection<PerformanceTestData> TestData { get; set; } = new ObservableCollection<PerformanceTestData>();

            public async Task ExecuteSmallAsyncOperation()
            {
                await ExecuteAsync(async () =>
                {
                    await Task.Delay(10);
                    IsLoading = false;
                }, "Small Operation");
            }

            public void BatchUpdateProperties(int iteration)
            {
                IsLoading = iteration % 2 == 0;
                LoadingProgress = iteration % 100;
                StatusMessage = $"Iteration {iteration}";
                HasErrors = iteration % 10 == 0;
                ErrorMessage = iteration % 10 == 0 ? $"Error at iteration {iteration}" : string.Empty;
                LoadingMessage = $"Processing {iteration}";
            }

            public async Task LoadDataBatchAsync(int startId, int count)
            {
                await ExecuteAsync(async () =>
                {
                    for (int i = 0; i < count; i++)
                    {
                        TestData.Add(new PerformanceTestData
                        {
                            Id = startId + i,
                            Name = $"Batch Item {startId + i}",
                            Description = $"Description {startId + i}",
                            Value = startId + i,
                            Category = $"Category_{(startId + i) % 10}",
                            CreatedDate = DateTime.Now.AddDays(-(startId + i)),
                            Tags = new List<string> { "tag1", "tag2" }
                        });
                    }
                    await Task.Delay(50); // Simulate I/O
                }, $"Load Batch {startId}-{startId + count - 1}");
            }
        }

        private class PerformanceTestData
        {
            public int Id { get; set; }
            public string Name { get; set; }
            public string Description { get; set; }
            public double Value { get; set; }
            public string Category { get; set; }
            public DateTime CreatedDate { get; set; }
            public List<string> Tags { get; set; }
        }
    }
}