using System;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using Moq;
using Xunit;
using MandADiscoverySuite.Models;
using MandADiscoverySuite.Services;
using MandADiscoverySuite.Tests.TestData;

namespace MandADiscoverySuite.Tests.Services
{
    /// <summary>
    /// Performance and load testing for LogicEngineService
    /// Tests enterprise-scale scenarios with 10k+ users and complex relationships
    /// </summary>
    [Collection("Performance Tests")]
    public class LogicEngineServicePerformanceTests : IDisposable
    {
        private readonly Mock<ILogger<LogicEngineService>> _mockLogger;
        private readonly string _testDataPath;
        private readonly LogicEngineService _logicEngine;

        public LogicEngineServicePerformanceTests()
        {
            _mockLogger = new Mock<ILogger<LogicEngineService>>();
            _testDataPath = Path.Combine(Path.GetTempPath(), "LogicEnginePerformanceTests", Guid.NewGuid().ToString());
            Directory.CreateDirectory(_testDataPath);
            
            _logicEngine = new LogicEngineService(_mockLogger.Object, _testDataPath);
        }

        public void Dispose()
        {
            if (Directory.Exists(_testDataPath))
            {
                Directory.Delete(_testDataPath, true);
            }
        }

        #region Load Performance Tests

        [Fact]
        public async Task LoadAllAsync_ShouldCompleteWithin10Seconds_For10KUsers()
        {
            // Arrange
            EnterpriseTestDataGenerator.GenerateEnterpriseDataSet(_testDataPath, userCount: 10000, deviceCount: 8000, applicationCount: 100);
            
            var stopwatch = Stopwatch.StartNew();

            // Act
            var result = await _logicEngine.LoadAllAsync();
            stopwatch.Stop();

            // Assert
            Assert.True(result, "Load should succeed");
            Assert.True(stopwatch.Elapsed.TotalSeconds < 10, $"Load took {stopwatch.Elapsed.TotalSeconds} seconds, should be less than 10");
            
            var stats = _logicEngine.GetLoadStatistics();
            Assert.Equal(10000, stats.UserCount);
            Assert.Equal(8000, stats.DeviceCount);
            Assert.True(stats.InferenceRulesApplied > 0);
        }

        [Fact]
        public async Task LoadAllAsync_ShouldHandleLargeEnterpriseScale_50KUsers()
        {
            // Arrange - This test may be slow, so we'll use a smaller sample for CI
            var userCount = 50000;
            var deviceCount = 40000;
            
            // Generate large dataset
            EnterpriseTestDataGenerator.GenerateEnterpriseDataSet(_testDataPath, userCount, deviceCount, 200);
            
            var stopwatch = Stopwatch.StartNew();

            // Act
            var result = await _logicEngine.LoadAllAsync();
            stopwatch.Stop();

            // Assert
            Assert.True(result, "Large scale load should succeed");
            Assert.True(stopwatch.Elapsed.TotalSeconds < 30, $"Large scale load took {stopwatch.Elapsed.TotalSeconds} seconds, should be reasonable");
            
            var stats = _logicEngine.GetLoadStatistics();
            Assert.Equal(userCount, stats.UserCount);
            Assert.Equal(deviceCount, stats.DeviceCount);
            
            // Memory usage should be reasonable (less than 2GB for 50k users)
            var process = Process.GetCurrentProcess();
            var memoryMB = process.WorkingSet64 / (1024 * 1024);
            Assert.True(memoryMB < 2048, $"Memory usage {memoryMB}MB should be less than 2GB for large dataset");
        }

        [Fact]
        public async Task LoadAllAsync_ShouldShowLinearScaling()
        {
            // Test with different dataset sizes to verify performance scaling
            var testSizes = new[] { 1000, 2000, 5000 };
            var loadTimes = new double[testSizes.Length];
            
            for (int i = 0; i < testSizes.Length; i++)
            {
                // Clean up previous test
                if (Directory.Exists(_testDataPath))
                {
                    Directory.Delete(_testDataPath, true);
                    Directory.CreateDirectory(_testDataPath);
                }
                
                // Generate dataset
                EnterpriseTestDataGenerator.GenerateEnterpriseDataSet(_testDataPath, testSizes[i], testSizes[i] * 4 / 5, 50);
                
                var engine = new LogicEngineService(_mockLogger.Object, _testDataPath);
                var stopwatch = Stopwatch.StartNew();
                
                // Act
                await engine.LoadAllAsync();
                stopwatch.Stop();
                
                loadTimes[i] = stopwatch.Elapsed.TotalSeconds;
            }
            
            // Assert - Load time should scale reasonably (not exponentially)
            // Time for 5000 users should be less than 10x time for 1000 users
            var ratio = loadTimes[2] / loadTimes[0]; // 5000 users / 1000 users
            Assert.True(ratio < 10, $"Load time ratio {ratio} indicates poor scaling");
            
            // All loads should complete within reasonable time
            Assert.All(loadTimes, time => Assert.True(time < 15, $"Load time {time}s should be reasonable"));
        }

        #endregion

        #region Memory Usage Tests

        [Fact]
        public async Task LoadAllAsync_ShouldNotCauseMemoryLeak()
        {
            // Arrange
            EnterpriseTestDataGenerator.GenerateEnterpriseDataSet(_testDataPath, 5000, 4000, 50);
            
            var process = Process.GetCurrentProcess();
            var initialMemory = process.WorkingSet64;

            // Act - Load multiple times to check for memory leaks
            for (int i = 0; i < 5; i++)
            {
                await _logicEngine.LoadAllAsync();
                
                // Force garbage collection to ensure memory is released
                GC.Collect();
                GC.WaitForPendingFinalizers();
                GC.Collect();
            }

            var finalMemory = process.WorkingSet64;
            var memoryIncreaseMB = (finalMemory - initialMemory) / (1024 * 1024);

            // Assert - Memory increase should be minimal (less than 100MB for 5 loads)
            Assert.True(memoryIncreaseMB < 100, 
                $"Memory increased by {memoryIncreaseMB}MB after 5 loads, indicating potential memory leak");
        }

        [Fact]
        public async Task GetUserDetailAsync_ShouldHaveConstantTimeComplexity()
        {
            // Arrange
            EnterpriseTestDataGenerator.GenerateEnterpriseDataSet(_testDataPath, 10000, 8000, 50);
            await _logicEngine.LoadAllAsync();
            
            var users = await _logicEngine.GetUsersAsync(take: 100);
            var lookupTimes = new double[users.Count];
            
            // Act - Test lookup time for multiple users
            for (int i = 0; i < users.Count; i++)
            {
                var stopwatch = Stopwatch.StartNew();
                await _logicEngine.GetUserDetailAsync(users[i].Sid);
                stopwatch.Stop();
                lookupTimes[i] = stopwatch.Elapsed.TotalMilliseconds;
            }
            
            // Assert - All lookups should be fast and consistent
            var averageLookupTime = lookupTimes.Average();
            var maxLookupTime = lookupTimes.Max();
            
            Assert.True(averageLookupTime < 50, $"Average lookup time {averageLookupTime}ms should be less than 50ms");
            Assert.True(maxLookupTime < 200, $"Max lookup time {maxLookupTime}ms should be less than 200ms");
            
            // Standard deviation should be low (consistent performance)
            var stdDev = Math.Sqrt(lookupTimes.Sum(t => Math.Pow(t - averageLookupTime, 2)) / lookupTimes.Length);
            Assert.True(stdDev < averageLookupTime * 0.5, "Lookup times should be consistent");
        }

        #endregion

        #region Concurrency Performance Tests

        [Fact]
        public async Task ConcurrentUserLookups_ShouldScaleLinearlyWithThreads()
        {
            // Arrange
            EnterpriseTestDataGenerator.GenerateEnterpriseDataSet(_testDataPath, 10000, 8000, 50);
            await _logicEngine.LoadAllAsync();
            
            var users = await _logicEngine.GetUsersAsync(take: 100);
            var threadCounts = new[] { 1, 5, 10, 20 };
            var throughputs = new double[threadCounts.Length];
            
            // Act - Test with different levels of concurrency
            for (int i = 0; i < threadCounts.Length; i++)
            {
                var threadCount = threadCounts[i];
                var stopwatch = Stopwatch.StartNew();
                
                var tasks = Enumerable.Range(0, threadCount * 10) // 10 lookups per thread
                    .Select(j => _logicEngine.GetUserDetailAsync(users[j % users.Count].Sid))
                    .ToArray();
                
                await Task.WhenAll(tasks);
                stopwatch.Stop();
                
                throughputs[i] = (threadCount * 10) / stopwatch.Elapsed.TotalSeconds;
            }
            
            // Assert - Throughput should scale reasonably with thread count
            Assert.True(throughputs[1] > throughputs[0] * 2, "5 threads should be significantly faster than 1 thread");
            Assert.True(throughputs[3] > throughputs[0] * 5, "20 threads should show good scaling");
        }

        [Fact]
        public async Task ConcurrentLoadAndQuery_ShouldNotCauseDeadlocks()
        {
            // Arrange
            EnterpriseTestDataGenerator.GenerateEnterpriseDataSet(_testDataPath, 5000, 4000, 50);
            
            var loadCompletedCount = 0;
            var queryCompletedCount = 0;
            var exceptions = new List<Exception>();
            
            // Act - Perform concurrent loads and queries
            var tasks = new List<Task>();
            
            // Add load tasks
            for (int i = 0; i < 3; i++)
            {
                tasks.Add(Task.Run(async () =>
                {
                    try
                    {
                        await _logicEngine.LoadAllAsync();
                        Interlocked.Increment(ref loadCompletedCount);
                    }
                    catch (Exception ex)
                    {
                        lock (exceptions) exceptions.Add(ex);
                    }
                }));
            }
            
            // Add query tasks (start after small delay)
            await Task.Delay(100);
            for (int i = 0; i < 10; i++)
            {
                tasks.Add(Task.Run(async () =>
                {
                    try
                    {
                        await Task.Delay(200); // Wait for load to start
                        var users = await _logicEngine.GetUsersAsync(take: 10);
                        if (users.Any())
                        {
                            await _logicEngine.GetUserDetailAsync(users.First().Sid);
                        }
                        Interlocked.Increment(ref queryCompletedCount);
                    }
                    catch (Exception ex)
                    {
                        lock (exceptions) exceptions.Add(ex);
                    }
                }));
            }
            
            // Wait for all tasks to complete (with timeout)
            var allTasksCompleted = await Task.WhenAll(tasks.Select(async t =>
            {
                try
                {
                    await t.WaitAsync(TimeSpan.FromMinutes(2));
                    return true;
                }
                catch
                {
                    return false;
                }
            }));
            
            // Assert
            Assert.True(allTasksCompleted.All(completed => completed), "All tasks should complete without deadlocks");
            Assert.Empty(exceptions.Where(ex => !(ex is InvalidOperationException))); // Allow load conflicts
            Assert.True(loadCompletedCount >= 1, "At least one load should complete");
        }

        #endregion

        #region Index Performance Tests

        [Fact]
        public async Task ComplexGroupHierarchy_ShouldResolveEfficiently()
        {
            // Arrange - Create dataset with complex nested group structure
            EnterpriseTestDataGenerator.GenerateEnterpriseDataSet(_testDataPath, 5000, 4000, 50);
            
            var stopwatch = Stopwatch.StartNew();
            
            // Act
            await _logicEngine.LoadAllAsync();
            stopwatch.Stop();
            
            var indexBuildTime = stopwatch.Elapsed.TotalSeconds;
            
            // Test group resolution performance
            stopwatch.Restart();
            var users = await _logicEngine.GetUsersAsync(take: 100);
            foreach (var user in users)
            {
                var userDetail = await _logicEngine.GetUserDetailAsync(user.Sid);
                // Access groups to trigger relationship resolution
                var groupCount = userDetail?.Groups.Count ?? 0;
            }
            stopwatch.Stop();
            
            var resolutionTime = stopwatch.Elapsed.TotalSeconds;
            
            // Assert
            Assert.True(indexBuildTime < 10, $"Index building took {indexBuildTime}s, should be less than 10s");
            Assert.True(resolutionTime < 5, $"Group resolution took {resolutionTime}s, should be less than 5s");
        }

        [Fact]
        public async Task InferenceRules_ShouldExecuteEfficiently()
        {
            // Arrange
            EnterpriseTestDataGenerator.GenerateEnterpriseDataSet(_testDataPath, 10000, 8000, 50);
            
            var stopwatch = Stopwatch.StartNew();
            
            // Act
            await _logicEngine.LoadAllAsync();
            stopwatch.Stop();
            
            var loadTime = stopwatch.Elapsed.TotalSeconds;
            var stats = _logicEngine.GetLoadStatistics();
            var appliedRules = _logicEngine.GetAppliedInferenceRules();
            
            // Assert
            Assert.True(loadTime < 15, $"Load with inference rules took {loadTime}s, should be less than 15s");
            Assert.True(appliedRules.Count > 0, "Should have applied inference rules");
            Assert.True(stats.InferenceRulesApplied > 0, "Should report inference rules in statistics");
        }

        #endregion

        #region Risk Analysis Performance Tests

        [Fact]
        public async Task RiskDashboardGeneration_ShouldCompleteQuickly()
        {
            // Arrange
            EnterpriseTestDataGenerator.GenerateEnterpriseDataSet(_testDataPath, 10000, 8000, 50);
            await _logicEngine.LoadAllAsync();
            
            var stopwatch = Stopwatch.StartNew();
            
            // Act
            var riskDashboard = await _logicEngine.GenerateRiskDashboardProjectionAsync();
            stopwatch.Stop();
            
            // Assert
            Assert.True(stopwatch.Elapsed.TotalSeconds < 10, 
                $"Risk dashboard generation took {stopwatch.Elapsed.TotalSeconds}s, should be less than 10s");
            Assert.NotNull(riskDashboard);
            Assert.True(riskDashboard.TotalThreats >= 0);
            Assert.NotNull(riskDashboard.TopRiskAssets);
        }

        [Fact]
        public async Task ThreatAnalysisProjection_ShouldHandleLargeDataset()
        {
            // Arrange
            EnterpriseTestDataGenerator.GenerateEnterpriseDataSet(_testDataPath, 5000, 4000, 50);
            await _logicEngine.LoadAllAsync();
            
            var stopwatch = Stopwatch.StartNew();
            
            // Act
            var threatAnalysis = await _logicEngine.GenerateThreatAnalysisProjectionAsync();
            stopwatch.Stop();
            
            // Assert
            Assert.True(stopwatch.Elapsed.TotalSeconds < 5, 
                $"Threat analysis took {stopwatch.Elapsed.TotalSeconds}s, should be less than 5s");
            Assert.NotNull(threatAnalysis);
            Assert.True(threatAnalysis.TotalThreats >= 0);
        }

        #endregion

        #region Stress Tests

        [Fact]
        public async Task RepeatedLoads_ShouldMaintainPerformance()
        {
            // Arrange
            EnterpriseTestDataGenerator.GenerateEnterpriseDataSet(_testDataPath, 5000, 4000, 50);
            
            var loadTimes = new double[10];
            
            // Act - Perform multiple loads
            for (int i = 0; i < loadTimes.Length; i++)
            {
                var stopwatch = Stopwatch.StartNew();
                await _logicEngine.LoadAllAsync();
                stopwatch.Stop();
                loadTimes[i] = stopwatch.Elapsed.TotalSeconds;
            }
            
            // Assert - Performance should remain consistent
            var firstLoadTime = loadTimes[0];
            var lastLoadTime = loadTimes[^1];
            var averageLoadTime = loadTimes.Average();
            
            Assert.True(averageLoadTime < 15, $"Average load time {averageLoadTime}s should be reasonable");
            
            // Last load shouldn't be significantly slower than first (no degradation)
            var degradationRatio = lastLoadTime / firstLoadTime;
            Assert.True(degradationRatio < 2.0, 
                $"Performance degradation ratio {degradationRatio} indicates performance issues over time");
        }

        [Fact]
        public async Task HighVolumeQueries_ShouldMaintainResponseTime()
        {
            // Arrange
            EnterpriseTestDataGenerator.GenerateEnterpriseDataSet(_testDataPath, 5000, 4000, 50);
            await _logicEngine.LoadAllAsync();
            
            var users = await _logicEngine.GetUsersAsync(take: 1000);
            var queryTimes = new List<double>();
            
            // Act - Perform high volume queries
            foreach (var user in users)
            {
                var stopwatch = Stopwatch.StartNew();
                await _logicEngine.GetUserDetailAsync(user.Sid);
                stopwatch.Stop();
                queryTimes.Add(stopwatch.Elapsed.TotalMilliseconds);
            }
            
            // Assert - Response times should remain consistent
            var averageQueryTime = queryTimes.Average();
            var percentile95 = queryTimes.OrderBy(t => t).Skip((int)(queryTimes.Count * 0.95)).First();
            
            Assert.True(averageQueryTime < 100, $"Average query time {averageQueryTime}ms should be fast");
            Assert.True(percentile95 < 500, $"95th percentile {percentile95}ms should be reasonable");
        }

        #endregion

        #region Edge Case Performance Tests

        [Fact]
        public async Task EmptyDataset_ShouldLoadQuickly()
        {
            // Arrange - Create empty CSV files
            var emptyFiles = new[]
            {
                "Users.csv", "Groups.csv", "Devices.csv", "Applications.csv", "GPOs.csv",
                "NTFS_ACL.csv", "Mailboxes.csv", "MappedDrives.csv", "AzureRoles.csv", "SQL.csv",
                "ThreatDetection.csv", "DataGovernance.csv", "DataLineage.csv", "ExternalIdentities.csv"
            };
            
            foreach (var file in emptyFiles)
            {
                File.WriteAllText(Path.Combine(_testDataPath, file), "");
            }
            
            var stopwatch = Stopwatch.StartNew();
            
            // Act
            var result = await _logicEngine.LoadAllAsync();
            stopwatch.Stop();
            
            // Assert
            Assert.True(result);
            Assert.True(stopwatch.Elapsed.TotalSeconds < 1, 
                $"Empty dataset load took {stopwatch.Elapsed.TotalSeconds}s, should be nearly instantaneous");
            
            var stats = _logicEngine.GetLoadStatistics();
            Assert.Equal(0, stats.UserCount);
            Assert.Equal(0, stats.DeviceCount);
        }

        [Fact]
        public async Task MalformedData_ShouldNotCausePerformanceDegradation()
        {
            // Arrange - Create dataset with some malformed entries
            EnterpriseTestDataGenerator.GenerateEnterpriseDataSet(_testDataPath, 5000, 4000, 50);
            
            // Add malformed entries to Users.csv
            var malformedData = @"
BAD-UPN,BAD-SAM,BAD-SID,BAD-MAIL,BAD USER,INVALID-BOOL,BAD-OU,,BAD-DEPT,,BAD-GROUPS,INVALID-DATE,BAD-MODULE,BAD-SESSION
,,,,,,,,,,,,,
INCOMPLETE,DATA,,,,,,,,,,,,";
            
            File.AppendAllText(Path.Combine(_testDataPath, "Users.csv"), malformedData);
            
            var stopwatch = Stopwatch.StartNew();
            
            // Act
            var result = await _logicEngine.LoadAllAsync();
            stopwatch.Stop();
            
            // Assert - Should still load in reasonable time despite malformed data
            Assert.True(result);
            Assert.True(stopwatch.Elapsed.TotalSeconds < 20, 
                $"Load with malformed data took {stopwatch.Elapsed.TotalSeconds}s, should handle errors gracefully");
        }

        #endregion
    }
}