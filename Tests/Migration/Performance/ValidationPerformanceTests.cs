using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using Moq;
using MandADiscoverySuite.Migration;
using MandADiscoverySuite.Models.Migration;
using MandADiscoverySuite.Services.Migration;

namespace MandADiscoverySuite.Tests.Migration.Performance
{
    /// <summary>
    /// Comprehensive performance tests for T-032 Post-Migration Validation with large datasets
    /// Tests scalability, memory usage, and performance under load
    /// </summary>
    [TestClass]
    public class ValidationPerformanceTests
    {
        private PostMigrationValidationService _validationService;
        private Mock<IUserValidationProvider> _mockUserValidator;
        private Mock<IMailboxValidationProvider> _mockMailboxValidator;
        private Mock<IFileValidationProvider> _mockFileValidator;
        private Mock<ISqlValidationProvider> _mockSqlValidator;
        private Mock<IPerformanceMonitor> _mockPerformanceMonitor;
        private MandADiscoverySuite.Migration.TargetContext _testTargetContext;
        private PerformanceMetrics _performanceMetrics;

        [TestInitialize]
        public void Setup()
        {
            _mockUserValidator = new Mock<IUserValidationProvider>();
            _mockMailboxValidator = new Mock<IMailboxValidationProvider>();
            _mockFileValidator = new Mock<IFileValidationProvider>();
            _mockSqlValidator = new Mock<ISqlValidationProvider>();
            _mockPerformanceMonitor = new Mock<IPerformanceMonitor>();
            _performanceMetrics = new PerformanceMetrics();

            _validationService = new PostMigrationValidationService(
                _mockUserValidator.Object,
                _mockMailboxValidator.Object,
                _mockFileValidator.Object,
                _mockSqlValidator.Object);

            _testTargetContext = new MandADiscoverySuite.Migration.TargetContext
            {
                TenantId = "test-tenant-123",
                Environment = "Performance Test"
            };

            SetupPerformanceMocks();
        }

        #region Large Dataset Validation Tests

        [TestMethod]
        public async Task ValidateWaveAsync_1000Users_CompletesWithinTimeLimit()
        {
            // Arrange
            var largeWave = CreateLargeWave(userCount: 1000, mailboxCount: 0, fileCount: 0, databaseCount: 0);
            var maxExecutionTime = TimeSpan.FromMinutes(10); // 10 minutes max for 1000 users
            
            SetupMockValidatorsForPerformance();
            var stopwatch = Stopwatch.StartNew();

            // Act
            var results = await _validationService.ValidateWaveAsync(largeWave, _testTargetContext);

            // Assert
            stopwatch.Stop();
            Assert.IsTrue(stopwatch.Elapsed < maxExecutionTime, 
                $"Validation of 1000 users took {stopwatch.Elapsed.TotalMinutes:F2} minutes, exceeding limit of {maxExecutionTime.TotalMinutes} minutes");
            Assert.AreEqual(1000, results.Count, "Should have results for all 1000 users");
            Assert.IsTrue(results.All(r => r.ObjectType == "User"), "All results should be user type");
            
            RecordPerformanceMetric("1000_Users_Validation", stopwatch.Elapsed, 1000, GetMemoryUsage());
        }

        [TestMethod]
        public async Task ValidateWaveAsync_500Mailboxes_CompletesWithinTimeLimit()
        {
            // Arrange
            var largeWave = CreateLargeWave(userCount: 0, mailboxCount: 500, fileCount: 0, databaseCount: 0);
            var maxExecutionTime = TimeSpan.FromMinutes(15); // 15 minutes max for 500 mailboxes (mailbox validation is slower)
            
            SetupMockValidatorsForPerformance();
            var stopwatch = Stopwatch.StartNew();

            // Act
            var results = await _validationService.ValidateWaveAsync(largeWave, _testTargetContext);

            // Assert
            stopwatch.Stop();
            Assert.IsTrue(stopwatch.Elapsed < maxExecutionTime, 
                $"Validation of 500 mailboxes took {stopwatch.Elapsed.TotalMinutes:F2} minutes, exceeding limit of {maxExecutionTime.TotalMinutes} minutes");
            Assert.AreEqual(500, results.Count, "Should have results for all 500 mailboxes");
            
            RecordPerformanceMetric("500_Mailboxes_Validation", stopwatch.Elapsed, 500, GetMemoryUsage());
        }

        [TestMethod]
        public async Task ValidateWaveAsync_100FileSets_CompletesWithinTimeLimit()
        {
            // Arrange
            var largeWave = CreateLargeWave(userCount: 0, mailboxCount: 0, fileCount: 100, databaseCount: 0);
            var maxExecutionTime = TimeSpan.FromMinutes(20); // 20 minutes max for 100 file sets (file validation can be slow)
            
            SetupMockValidatorsForPerformance();
            var stopwatch = Stopwatch.StartNew();

            // Act
            var results = await _validationService.ValidateWaveAsync(largeWave, _testTargetContext);

            // Assert
            stopwatch.Stop();
            Assert.IsTrue(stopwatch.Elapsed < maxExecutionTime, 
                $"Validation of 100 file sets took {stopwatch.Elapsed.TotalMinutes:F2} minutes, exceeding limit of {maxExecutionTime.TotalMinutes} minutes");
            Assert.AreEqual(100, results.Count, "Should have results for all 100 file sets");
            
            RecordPerformanceMetric("100_FileSets_Validation", stopwatch.Elapsed, 100, GetMemoryUsage());
        }

        [TestMethod]
        public async Task ValidateWaveAsync_50Databases_CompletesWithinTimeLimit()
        {
            // Arrange
            var largeWave = CreateLargeWave(userCount: 0, mailboxCount: 0, fileCount: 0, databaseCount: 50);
            var maxExecutionTime = TimeSpan.FromMinutes(25); // 25 minutes max for 50 databases (DBCC checks are slow)
            
            SetupMockValidatorsForPerformance();
            var stopwatch = Stopwatch.StartNew();

            // Act
            var results = await _validationService.ValidateWaveAsync(largeWave, _testTargetContext);

            // Assert
            stopwatch.Stop();
            Assert.IsTrue(stopwatch.Elapsed < maxExecutionTime, 
                $"Validation of 50 databases took {stopwatch.Elapsed.TotalMinutes:F2} minutes, exceeding limit of {maxExecutionTime.TotalMinutes} minutes");
            Assert.AreEqual(50, results.Count, "Should have results for all 50 databases");
            
            RecordPerformanceMetric("50_Databases_Validation", stopwatch.Elapsed, 50, GetMemoryUsage());
        }

        [TestMethod]
        public async Task ValidateWaveAsync_MixedLargeWave_CompletesWithinTimeLimit()
        {
            // Arrange
            var largeWave = CreateLargeWave(userCount: 500, mailboxCount: 250, fileCount: 50, databaseCount: 25);
            var totalObjects = 500 + 250 + 50 + 25;
            var maxExecutionTime = TimeSpan.FromMinutes(30); // 30 minutes max for mixed large wave
            
            SetupMockValidatorsForPerformance();
            var stopwatch = Stopwatch.StartNew();

            // Act
            var results = await _validationService.ValidateWaveAsync(largeWave, _testTargetContext);

            // Assert
            stopwatch.Stop();
            Assert.IsTrue(stopwatch.Elapsed < maxExecutionTime, 
                $"Validation of mixed large wave ({totalObjects} objects) took {stopwatch.Elapsed.TotalMinutes:F2} minutes, exceeding limit of {maxExecutionTime.TotalMinutes} minutes");
            Assert.AreEqual(totalObjects, results.Count, $"Should have results for all {totalObjects} objects");
            
            RecordPerformanceMetric("Mixed_Large_Wave_Validation", stopwatch.Elapsed, totalObjects, GetMemoryUsage());
        }

        #endregion

        #region Memory Usage Tests

        [TestMethod]
        public async Task ValidateWaveAsync_LargeDataset_MemoryUsageWithinLimits()
        {
            // Arrange
            var largeWave = CreateLargeWave(userCount: 2000, mailboxCount: 0, fileCount: 0, databaseCount: 0);
            var maxMemoryIncreaseMB = 500; // 500 MB max increase
            
            SetupMockValidatorsForPerformance();
            
            // Measure baseline memory
            GC.Collect();
            GC.WaitForPendingFinalizers();
            GC.Collect();
            var baselineMemory = GC.GetTotalMemory(false);

            // Act
            var results = await _validationService.ValidateWaveAsync(largeWave, _testTargetContext);

            // Measure final memory
            var finalMemory = GC.GetTotalMemory(false);
            var memoryIncreaseMB = (finalMemory - baselineMemory) / (1024 * 1024);

            // Assert
            Assert.IsTrue(memoryIncreaseMB < maxMemoryIncreaseMB, 
                $"Memory usage increased by {memoryIncreaseMB} MB, exceeding limit of {maxMemoryIncreaseMB} MB");
            Assert.AreEqual(2000, results.Count, "Should have results for all 2000 users");
            
            RecordPerformanceMetric("2000_Users_Memory_Test", TimeSpan.Zero, 2000, memoryIncreaseMB);
        }

        [TestMethod]
        public async Task ValidateWaveAsync_RepeatedLargeValidations_NoMemoryLeaks()
        {
            // Arrange
            var wave = CreateLargeWave(userCount: 100, mailboxCount: 100, fileCount: 10, databaseCount: 5);
            SetupMockValidatorsForPerformance();
            
            var memoryMeasurements = new List<long>();

            // Act - Run validation multiple times
            for (int i = 0; i < 10; i++)
            {
                await _validationService.ValidateWaveAsync(wave, _testTargetContext);
                
                // Force garbage collection and measure memory
                GC.Collect();
                GC.WaitForPendingFinalizers();
                GC.Collect();
                
                memoryMeasurements.Add(GC.GetTotalMemory(false));
                
                // Small delay between iterations
                await Task.Delay(100);
            }

            // Assert - Memory should not continuously increase
            var firstMeasurement = memoryMeasurements[2]; // Skip first 2 to allow for warmup
            var lastMeasurement = memoryMeasurements.Last();
            var memoryIncreaseMB = (lastMeasurement - firstMeasurement) / (1024 * 1024);
            
            Assert.IsTrue(memoryIncreaseMB < 100, 
                $"Memory increased by {memoryIncreaseMB} MB over 10 iterations, indicating potential memory leak");
            
            RecordPerformanceMetric("Repeated_Validation_Memory_Leak_Test", TimeSpan.Zero, 10, memoryIncreaseMB);
        }

        #endregion

        #region Concurrent Validation Tests

        [TestMethod]
        public async Task ValidateWaveAsync_ConcurrentWaves_HandlesParallelExecution()
        {
            // Arrange
            var numberOfWaves = 5;
            var waves = new List<MandADiscoverySuite.Models.Migration.MigrationWave>();
            
            for (int i = 0; i < numberOfWaves; i++)
            {
                waves.Add(CreateLargeWave(userCount: 200, mailboxCount: 0, fileCount: 0, databaseCount: 0));
            }
            
            SetupMockValidatorsForPerformance();
            var stopwatch = Stopwatch.StartNew();

            // Act - Run waves concurrently
            var tasks = waves.Select(wave => _validationService.ValidateWaveAsync(wave, _testTargetContext));
            var results = await Task.WhenAll(tasks);

            // Assert
            stopwatch.Stop();
            Assert.AreEqual(numberOfWaves, results.Length, "Should have results for all concurrent waves");
            Assert.IsTrue(results.All(r => r.Count == 200), "Each wave should have 200 results");
            
            var totalValidations = results.Sum(r => r.Count);
            Assert.AreEqual(1000, totalValidations, "Should have validated 1000 objects total");
            
            // Concurrent execution should be faster than sequential
            var maxExpectedTime = TimeSpan.FromMinutes(8); // Should be faster than 5 * (time for 200 users)
            Assert.IsTrue(stopwatch.Elapsed < maxExpectedTime, 
                $"Concurrent validation took {stopwatch.Elapsed.TotalMinutes:F2} minutes, expected less than {maxExpectedTime.TotalMinutes}");
            
            RecordPerformanceMetric("Concurrent_Wave_Validation", stopwatch.Elapsed, totalValidations, GetMemoryUsage());
        }

        [TestMethod]
        public async Task ValidateWaveAsync_HighConcurrency_MaintainsPerformance()
        {
            // Arrange
            var numberOfConcurrentTasks = 10;
            var tasksPerType = numberOfConcurrentTasks / 4;
            var tasks = new List<Task<ValidationResult>>();
            
            SetupMockValidatorsForPerformance();

            // Create concurrent validation tasks of different types
            for (int i = 0; i < tasksPerType; i++)
            {
                tasks.Add(_validationService.ValidateUserAsync(CreateTestUser($"user{i}"), _testTargetContext));
                tasks.Add(_validationService.ValidateMailboxAsync(CreateTestMailbox($"mailbox{i}"), _testTargetContext));
                tasks.Add(_validationService.ValidateFilesAsync(CreateTestFileItem($"files{i}"), _testTargetContext));
                tasks.Add(_validationService.ValidateSqlAsync(CreateTestDatabase($"db{i}"), _testTargetContext));
            }

            var stopwatch = Stopwatch.StartNew();

            // Act
            var results = await Task.WhenAll(tasks);

            // Assert
            stopwatch.Stop();
            Assert.AreEqual(numberOfConcurrentTasks, results.Length, "Should complete all concurrent validations");
            Assert.IsTrue(results.All(r => r.Severity == ValidationSeverity.Success), "All validations should succeed");

            var maxTimePerValidation = TimeSpan.FromSeconds(30); // Each validation should complete within 30 seconds on average
            var averageTime = TimeSpan.FromMilliseconds(stopwatch.Elapsed.TotalMilliseconds / numberOfConcurrentTasks);
            Assert.IsTrue(averageTime < maxTimePerValidation,
                $"Average validation time was {averageTime.TotalSeconds:F2} seconds, exceeding limit of {maxTimePerValidation.TotalSeconds}");

            RecordPerformanceMetric("High_Concurrency_Validation", stopwatch.Elapsed, numberOfConcurrentTasks, GetMemoryUsage());
        }

        #endregion

        #region Rollback Performance Tests

        [TestMethod]
        public async Task RollbackMultipleAsync_LargeBatch_CompletesWithinTimeLimit()
        {
            // Arrange
            var batchSize = 500;
            var validationResults = CreateLargeValidationResultSet(batchSize);
            var maxExecutionTime = TimeSpan.FromMinutes(15); // 15 minutes max for 500 rollbacks
            
            SetupMockRollbackProvidersForPerformance();
            var stopwatch = Stopwatch.StartNew();

            // Act
            var rollbackResults = await _validationService.RollbackMultipleAsync(validationResults, _testTargetContext);

            // Assert
            stopwatch.Stop();
            Assert.IsTrue(stopwatch.Elapsed < maxExecutionTime, 
                $"Rollback of {batchSize} objects took {stopwatch.Elapsed.TotalMinutes:F2} minutes, exceeding limit of {maxExecutionTime.TotalMinutes} minutes");
            Assert.AreEqual(batchSize, rollbackResults.Count, $"Should have rollback results for all {batchSize} objects");
            
            RecordPerformanceMetric("500_Object_Batch_Rollback", stopwatch.Elapsed, batchSize, GetMemoryUsage());
        }

        [TestMethod]
        public async Task RollbackMultipleAsync_ConcurrentBatches_HandlesParallelRollbacks()
        {
            // Arrange
            var numberOfBatches = 4;
            var objectsPerBatch = 100;
            var batches = new List<List<ValidationResult>>();
            
            for (int i = 0; i < numberOfBatches; i++)
            {
                batches.Add(CreateLargeValidationResultSet(objectsPerBatch));
            }
            
            SetupMockRollbackProvidersForPerformance();
            var stopwatch = Stopwatch.StartNew();

            // Act - Run rollbacks concurrently
            var tasks = batches.Select(batch => _validationService.RollbackMultipleAsync(batch, _testTargetContext));
            var results = await Task.WhenAll(tasks);

            // Assert
            stopwatch.Stop();
            Assert.AreEqual(numberOfBatches, results.Length, "Should have results for all concurrent rollback batches");
            
            var totalRollbacks = results.Sum(r => r.Count);
            Assert.AreEqual(400, totalRollbacks, "Should have rolled back 400 objects total");
            
            var maxExpectedTime = TimeSpan.FromMinutes(10); // Should be faster than sequential execution
            Assert.IsTrue(stopwatch.Elapsed < maxExpectedTime, 
                $"Concurrent rollback took {stopwatch.Elapsed.TotalMinutes:F2} minutes, expected less than {maxExpectedTime.TotalMinutes}");
            
            RecordPerformanceMetric("Concurrent_Batch_Rollback", stopwatch.Elapsed, totalRollbacks, GetMemoryUsage());
        }

        #endregion

        #region Scalability Tests

        [TestMethod]
        public async Task ValidateWaveAsync_ScalabilityTest_LinearPerformanceDegradation()
        {
            // Arrange - Test different wave sizes to check scalability
            var waveSizes = new[] { 100, 250, 500, 750, 1000 };
            var performanceResults = new List<(int size, TimeSpan duration, double throughput)>();
            
            SetupMockValidatorsForPerformance();

            foreach (var size in waveSizes)
            {
                // Act
                var wave = CreateLargeWave(userCount: size, mailboxCount: 0, fileCount: 0, databaseCount: 0);
                var stopwatch = Stopwatch.StartNew();
                
                var results = await _validationService.ValidateWaveAsync(wave, _testTargetContext);
                
                stopwatch.Stop();
                var throughput = size / stopwatch.Elapsed.TotalSeconds;
                performanceResults.Add((size, stopwatch.Elapsed, throughput));
                
                RecordPerformanceMetric($"Scalability_Test_{size}_Users", stopwatch.Elapsed, size, GetMemoryUsage());
                
                // Small delay between tests
                await Task.Delay(1000);
            }

            // Assert - Performance should degrade roughly linearly
            for (int i = 1; i < performanceResults.Count; i++)
            {
                var previous = performanceResults[i - 1];
                var current = performanceResults[i];
                
                // Current should take longer than previous (allow some variance)
                var scaleFactor = (double)current.size / previous.size;
                var expectedMaxDuration = previous.duration.TotalMilliseconds * scaleFactor * 1.2; // 20% tolerance
                
                Assert.IsTrue(current.duration.TotalMilliseconds <= expectedMaxDuration,
                    $"Validation of {current.size} objects took {current.duration.TotalSeconds:F2}s, " +
                    $"expected max {expectedMaxDuration / 1000:F2}s based on {previous.size} objects taking {previous.duration.TotalSeconds:F2}s");
            }
        }

        [TestMethod]
        public async Task ValidateWaveAsync_ThroughputTest_MaintainsMinimumRate()
        {
            // Arrange
            var wave = CreateLargeWave(userCount: 1000, mailboxCount: 0, fileCount: 0, databaseCount: 0);
            var minimumThroughputPerSecond = 5; // Minimum 5 validations per second
            
            SetupMockValidatorsForPerformance();
            var stopwatch = Stopwatch.StartNew();

            // Act
            var results = await _validationService.ValidateWaveAsync(wave, _testTargetContext);

            // Assert
            stopwatch.Stop();
            var actualThroughput = results.Count / stopwatch.Elapsed.TotalSeconds;
            
            Assert.IsTrue(actualThroughput >= minimumThroughputPerSecond,
                $"Actual throughput was {actualThroughput:F2} validations/second, below minimum of {minimumThroughputPerSecond}");
            
            RecordPerformanceMetric("Throughput_Test_1000_Users", stopwatch.Elapsed, results.Count, GetMemoryUsage(), actualThroughput);
        }

        #endregion

        #region Performance Under Load Tests

        [TestMethod]
        public async Task ValidateWaveAsync_UnderSystemLoad_MaintainsPerformance()
        {
            // Arrange - Simulate system load with CPU and memory pressure
            var wave = CreateLargeWave(userCount: 500, mailboxCount: 0, fileCount: 0, databaseCount: 0);
            SetupMockValidatorsForPerformance();
            
            // Create background load
            var loadTasks = CreateSystemLoad();
            
            try
            {
                var stopwatch = Stopwatch.StartNew();

                // Act - Validate under load
                var results = await _validationService.ValidateWaveAsync(wave, _testTargetContext);

                // Assert
                stopwatch.Stop();
                Assert.AreEqual(500, results.Count, "Should complete all validations despite system load");
                
                var maxTimeUnderLoad = TimeSpan.FromMinutes(12); // Allow extra time due to load
                Assert.IsTrue(stopwatch.Elapsed < maxTimeUnderLoad,
                    $"Validation under load took {stopwatch.Elapsed.TotalMinutes:F2} minutes, exceeding limit of {maxTimeUnderLoad.TotalMinutes} minutes");
                
                RecordPerformanceMetric("Under_System_Load_Validation", stopwatch.Elapsed, 500, GetMemoryUsage());
            }
            finally
            {
                // Cleanup background load
                loadTasks.ForEach(t => t.Item2.Cancel());
            }
        }

        #endregion

        #region Helper Methods

        private void SetupPerformanceMocks()
        {
            _mockPerformanceMonitor
                .Setup(pm => pm.StartMonitoring(It.IsAny<string>()))
                .Callback<string>(operation => RecordOperationStart(operation));
            
            _mockPerformanceMonitor
                .Setup(pm => pm.StopMonitoring(It.IsAny<string>()))
                .Callback<string>(operation => RecordOperationEnd(operation));
        }

        private void SetupMockValidatorsForPerformance()
        {
            // Setup user validator with realistic delay
            _mockUserValidator
                .Setup(u => u.ValidateUserAsync(It.IsAny<MandADiscoverySuite.Models.Migration.UserDto>(), It.IsAny<MandADiscoverySuite.Migration.TargetContext>(), It.IsAny<IProgress<ValidationProgress>>()))
                .Returns(async (MandADiscoverySuite.Models.Migration.UserDto user, MandADiscoverySuite.Migration.TargetContext ctx, IProgress<ValidationProgress> progress) =>
                {
                    await Task.Delay(Random.Shared.Next(50, 200)); // 50-200ms per user validation
                    return ValidationResult.Success(user, "User", user.DisplayName);
                });

            // Setup mailbox validator with longer delay (mailbox operations are slower)
            _mockMailboxValidator
                .Setup(m => m.ValidateMailboxAsync(It.IsAny<MandADiscoverySuite.Models.Migration.MailboxDto>(), It.IsAny<MandADiscoverySuite.Migration.TargetContext>(), It.IsAny<IProgress<ValidationProgress>>()))
                .Returns(async (MandADiscoverySuite.Models.Migration.MailboxDto mailbox, MandADiscoverySuite.Migration.TargetContext ctx, IProgress<ValidationProgress> progress) =>
                {
                    await Task.Delay(Random.Shared.Next(200, 800)); // 200-800ms per mailbox validation
                    return ValidationResult.Success(mailbox, "Mailbox", mailbox.PrimarySmtpAddress);
                });

            // Setup file validator with variable delay based on file size
            _mockFileValidator
                .Setup(f => f.ValidateFilesAsync(It.IsAny<MandADiscoverySuite.Models.Migration.FileItemDto>(), It.IsAny<MandADiscoverySuite.Migration.TargetContext>(), It.IsAny<IProgress<ValidationProgress>>()))
                .Returns(async (MandADiscoverySuite.Models.Migration.FileItemDto fileItem, MandADiscoverySuite.Migration.TargetContext ctx, IProgress<ValidationProgress> progress) =>
                {
                    await Task.Delay(Random.Shared.Next(500, 2000)); // 500-2000ms per file set validation
                    return ValidationResult.Success(fileItem, "File", fileItem.SourcePath);
                });

            // Setup SQL validator with long delay (DBCC operations are slow)
            _mockSqlValidator
                .Setup(s => s.ValidateSqlAsync(It.IsAny<MandADiscoverySuite.Models.Migration.DatabaseDto>(), It.IsAny<MandADiscoverySuite.Migration.TargetContext>(), It.IsAny<IProgress<ValidationProgress>>()))
                .Returns(async (MandADiscoverySuite.Models.Migration.DatabaseDto database, MandADiscoverySuite.Migration.TargetContext ctx, IProgress<ValidationProgress> progress) =>
                {
                    await Task.Delay(Random.Shared.Next(1000, 5000)); // 1-5 seconds per database validation
                    return ValidationResult.Success(database, "Database", database.Name);
                });
        }

        private void SetupMockRollbackProvidersForPerformance()
        {
            _mockUserValidator
                .Setup(u => u.RollbackUserAsync(It.IsAny<MandADiscoverySuite.Models.Migration.UserDto>(), It.IsAny<MandADiscoverySuite.Migration.TargetContext>(), It.IsAny<IProgress<ValidationProgress>>()))
                .Returns(async (MandADiscoverySuite.Models.Migration.UserDto user, MandADiscoverySuite.Migration.TargetContext ctx, IProgress<ValidationProgress> progress) =>
                {
                    await Task.Delay(Random.Shared.Next(100, 300)); // 100-300ms per user rollback
                    return RollbackResult.Succeeded("User rollback completed");
                });

            _mockMailboxValidator
                .Setup(m => m.RollbackMailboxAsync(It.IsAny<MandADiscoverySuite.Models.Migration.MailboxDto>(), It.IsAny<MandADiscoverySuite.Migration.TargetContext>(), It.IsAny<IProgress<ValidationProgress>>()))
                .Returns(async (MandADiscoverySuite.Models.Migration.MailboxDto mailbox, MandADiscoverySuite.Migration.TargetContext ctx, IProgress<ValidationProgress> progress) =>
                {
                    await Task.Delay(Random.Shared.Next(300, 1000)); // 300-1000ms per mailbox rollback
                    return RollbackResult.Succeeded("Mailbox rollback completed");
                });

            _mockFileValidator
                .Setup(f => f.RollbackFilesAsync(It.IsAny<MandADiscoverySuite.Models.Migration.FileItemDto>(), It.IsAny<MandADiscoverySuite.Migration.TargetContext>(), It.IsAny<IProgress<ValidationProgress>>()))
                .Returns(async (MandADiscoverySuite.Models.Migration.FileItemDto fileItem, MandADiscoverySuite.Migration.TargetContext ctx, IProgress<ValidationProgress> progress) =>
                {
                    await Task.Delay(Random.Shared.Next(500, 1500)); // 500-1500ms per file rollback
                    return RollbackResult.Succeeded("File rollback completed");
                });

            _mockSqlValidator
                .Setup(s => s.RollbackSqlAsync(It.IsAny<MandADiscoverySuite.Models.Migration.DatabaseDto>(), It.IsAny<MandADiscoverySuite.Migration.TargetContext>(), It.IsAny<IProgress<ValidationProgress>>()))
                .Returns(async (MandADiscoverySuite.Models.Migration.DatabaseDto database, MandADiscoverySuite.Migration.TargetContext ctx, IProgress<ValidationProgress> progress) =>
                {
                    await Task.Delay(Random.Shared.Next(1000, 3000)); // 1-3 seconds per database rollback
                    return RollbackResult.Succeeded("Database rollback completed");
                });
        }

        private MandADiscoverySuite.Models.Migration.MigrationWave CreateLargeWave(int userCount, int mailboxCount, int fileCount, int databaseCount)
        {
            var wave = new MandADiscoverySuite.Models.Migration.MigrationWave();

            for (int i = 0; i < userCount; i++)
            {
                wave.Users.Add(CreateTestUserItem($"testuser{i:D6}"));
            }

            for (int i = 0; i < mailboxCount; i++)
            {
                wave.Mailboxes.Add(CreateTestMailboxItem($"testmailbox{i:D6}"));
            }

            for (int i = 0; i < fileCount; i++)
            {
                wave.Files.Add(CreateTestFileShareItem($"testfiles{i:D6}"));
            }

            for (int i = 0; i < databaseCount; i++)
            {
                wave.Databases.Add(CreateTestDatabaseItem($"testdb{i:D6}"));
            }

            return wave;
        }

        private List<ValidationResult> CreateLargeValidationResultSet(int count)
        {
            var results = new List<ValidationResult>();
            var objectTypes = new[] { "User", "Mailbox", "File", "Database" };

            for (int i = 0; i < count; i++)
            {
                var objectType = objectTypes[i % objectTypes.Length];
                var issues = new List<ValidationIssue>
                {
                    new ValidationIssue { Category = "Test", Description = "Test failure", Severity = ValidationSeverity.Error }
                };

                results.Add(ValidationResult.Failed(new object(), objectType, $"object{i}", "Validation failed", issues));
            }

            return results;
        }

        private MandADiscoverySuite.Models.Migration.UserDto CreateTestUser(string identifier)
        {
            return new MandADiscoverySuite.Models.Migration.UserDto
            {
                DisplayName = $"Test User {identifier}",
                UserPrincipalName = $"{identifier}@contoso.com",
                CustomAttributes = new Dictionary<string, object> { { "SamAccountName", identifier } }
            };
        }

        private MandADiscoverySuite.Models.Migration.MailboxDto CreateTestMailbox(string identifier)
        {
            return new MandADiscoverySuite.Models.Migration.MailboxDto
            {
                PrimarySmtpAddress = $"{identifier}@contoso.com",
                DisplayName = $"Test Mailbox {identifier}",
                ItemCount = Random.Shared.Next(100, 10000)
            };
        }

        private MandADiscoverySuite.Models.Migration.FileItemDto CreateTestFileItem(string identifier)
        {
            return new MandADiscoverySuite.Models.Migration.FileItemDto
            {
                SourcePath = $@"\\source\share\{identifier}",
                TargetPath = $@"\\target\share\{identifier}",
                FileSize = Random.Shared.Next(1024 * 1024, 1024 * 1024 * 100), // 1MB to 100MB
                Metadata = new Dictionary<string, object> { { "FileCount", Random.Shared.Next(10, 1000) } }
            };
        }

        private MandADiscoverySuite.Models.Migration.DatabaseDto CreateTestDatabase(string identifier)
        {
            return new MandADiscoverySuite.Models.Migration.DatabaseDto
            {
                Name = identifier,
                ServerName = "sql-server",
                SizeMB = Random.Shared.Next(100, 1024) // 100MB to 1GB
            };
        }

        private UserItem CreateTestUserItem(string identifier)
        {
            return new UserItem
            {
                UserPrincipalName = $"{identifier}@contoso.com",
                DisplayName = $"Test User {identifier}",
                Properties = new Dictionary<string, object> { { "SamAccountName", identifier } }
            };
        }

        private MailboxItem CreateTestMailboxItem(string identifier)
        {
            return new MailboxItem
            {
                UserPrincipalName = $"{identifier}@contoso.com",
                PrimarySmtpAddress = $"{identifier}@contoso.com",
                SizeBytes = Random.Shared.Next(1024 * 1024, 1024 * 1024 * 100), // 1MB to 100MB
                Properties = new Dictionary<string, object> { { "ItemCount", Random.Shared.Next(100, 10000) } }
            };
        }

        private FileShareItem CreateTestFileShareItem(string identifier)
        {
            return new FileShareItem
            {
                SourcePath = $@"\\source\share\{identifier}",
                TargetPath = $@"\\target\share\{identifier}",
                SizeBytes = Random.Shared.Next(1024 * 1024, 1024 * 1024 * 100), // 1MB to 100MB
                Properties = new Dictionary<string, object> { { "FileCount", Random.Shared.Next(10, 1000) } }
            };
        }

        private DatabaseItem CreateTestDatabaseItem(string identifier)
        {
            return new DatabaseItem
            {
                Name = identifier,
                SourceServer = "source-sql-server",
                TargetServer = "target-sql-server",
                SizeMB = Random.Shared.Next(100, 1024), // 100MB to 1GB
                Properties = new Dictionary<string, object> { { "CompatibilityLevel", 150 } }
            };
        }

        private List<(Task task, CancellationTokenSource cts)> CreateSystemLoad()
        {
            var loadTasks = new List<(Task, CancellationTokenSource)>();

            // CPU load
            for (int i = 0; i < Environment.ProcessorCount / 2; i++)
            {
                var cts = new CancellationTokenSource();
                var task = Task.Run(async () =>
                {
                    while (!cts.Token.IsCancellationRequested)
                    {
                        // Consume CPU cycles
                        var dummy = 0;
                        for (int j = 0; j < 1000000; j++)
                        {
                            dummy += j;
                        }
                        await Task.Delay(10, cts.Token);
                    }
                }, cts.Token);
                loadTasks.Add((task, cts));
            }

            // Memory pressure
            var memoryLoadCts = new CancellationTokenSource();
            var memoryLoadTask = Task.Run(async () =>
            {
                var memoryList = new List<byte[]>();
                try
                {
                    while (!memoryLoadCts.Token.IsCancellationRequested)
                    {
                        memoryList.Add(new byte[1024 * 1024]); // 1MB allocations
                        await Task.Delay(100, memoryLoadCts.Token);
                        
                        // Keep memory usage reasonable
                        if (memoryList.Count > 100)
                        {
                            memoryList.RemoveAt(0);
                        }
                    }
                }
                finally
                {
                    memoryList.Clear();
                }
            }, memoryLoadCts.Token);
            loadTasks.Add((memoryLoadTask, memoryLoadCts));

            return loadTasks;
        }

        private long GetMemoryUsage()
        {
            return GC.GetTotalMemory(false) / (1024 * 1024); // Return in MB
        }

        private void RecordPerformanceMetric(string testName, TimeSpan duration, int objectCount, long memoryUsageMB, double throughput = 0)
        {
            var metric = new PerformanceResult
            {
                TestName = testName,
                Duration = duration,
                ObjectCount = objectCount,
                MemoryUsageMB = memoryUsageMB,
                Throughput = throughput > 0 ? throughput : objectCount / duration.TotalSeconds,
                Timestamp = DateTime.Now
            };

            _performanceMetrics.Results.Add(metric);
            
            // Log performance metric for analysis
            System.Diagnostics.Debug.WriteLine($"PERFORMANCE: {testName} - {duration.TotalSeconds:F2}s, {objectCount} objects, {throughput:F2} ops/sec, {memoryUsageMB}MB");
        }

        private void RecordOperationStart(string operation)
        {
            _performanceMetrics.OperationStarts[operation] = DateTime.Now;
        }

        private void RecordOperationEnd(string operation)
        {
            if (_performanceMetrics.OperationStarts.TryGetValue(operation, out var startTime))
            {
                var duration = DateTime.Now - startTime;
                _performanceMetrics.OperationDurations[operation] = duration;
            }
        }

        #endregion

        [TestCleanup]
        public void Cleanup()
        {
            // Generate performance summary
            GeneratePerformanceSummary();
            
            // Force cleanup
            GC.Collect();
            GC.WaitForPendingFinalizers();
            GC.Collect();
        }

        private void GeneratePerformanceSummary()
        {
            if (_performanceMetrics.Results.Any())
            {
                var totalTests = _performanceMetrics.Results.Count;
                var avgDuration = TimeSpan.FromMilliseconds(_performanceMetrics.Results.Average(r => r.Duration.TotalMilliseconds));
                var totalObjects = _performanceMetrics.Results.Sum(r => r.ObjectCount);
                var avgThroughput = _performanceMetrics.Results.Average(r => r.Throughput);
                var maxMemoryUsage = _performanceMetrics.Results.Max(r => r.MemoryUsageMB);

                System.Diagnostics.Debug.WriteLine($"PERFORMANCE_SUMMARY: {totalTests} tests, {totalObjects} objects total, avg {avgDuration.TotalSeconds:F2}s, avg {avgThroughput:F2} ops/sec, max {maxMemoryUsage}MB memory");
            }
        }
    }

    #region Performance Support Classes

    public interface IPerformanceMonitor
    {
        void StartMonitoring(string operation);
        void StopMonitoring(string operation);
    }

    public class PerformanceMetrics
    {
        public List<PerformanceResult> Results { get; } = new();
        public Dictionary<string, DateTime> OperationStarts { get; } = new();
        public Dictionary<string, TimeSpan> OperationDurations { get; } = new();
    }

    public class PerformanceResult
    {
        public string TestName { get; set; } = string.Empty;
        public TimeSpan Duration { get; set; }
        public int ObjectCount { get; set; }
        public long MemoryUsageMB { get; set; }
        public double Throughput { get; set; }
        public DateTime Timestamp { get; set; }
    }

    #endregion
}