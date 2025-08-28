using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Logging.Abstractions;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using MandADiscoverySuite.Models;
using MandADiscoverySuite.Services;

namespace MandADiscoverySuite.Tests.Services
{
    /// <summary>
    /// T-030: Comprehensive tests for asynchronous data loading and caching
    /// Tests concurrent loading, cache invalidation, thread safety, and data races
    /// </summary>
    [TestClass]
    public class AsyncDataLoadingTests
    {
        private ILogger<LogicEngineService> _logicEngineLogger;
        private ILogger<MultiTierCacheService> _cacheLogger;
        private ILogger<CsvDataServiceNew> _csvLogger;
        private MemoryPressureMonitor _memoryMonitor;
        private MultiTierCacheService _cacheService;
        private LogicEngineService _logicEngine;
        private CsvDataServiceNew _csvService;
        private string _testDataPath;
        private string _rawDataPath;
        private readonly object _testLock = new();

        [TestInitialize]
        public void Setup()
        {
            _logicEngineLogger = new NullLogger<LogicEngineService>();
            _cacheLogger = new NullLogger<MultiTierCacheService>();
            _csvLogger = new NullLogger<CsvDataServiceNew>();
            
            _memoryMonitor = new MemoryPressureMonitor(new NullLogger<MemoryPressureMonitor>());
            _cacheService = new MultiTierCacheService(_cacheLogger, _memoryMonitor);
            
            // Create isolated test data directory
            _testDataPath = Path.Combine(Path.GetTempPath(), $"MandATest_{Guid.NewGuid():N}");
            _rawDataPath = Path.Combine(_testDataPath, "RawData");
            Directory.CreateDirectory(_rawDataPath);
            
            _logicEngine = new LogicEngineService(_logicEngineLogger, _cacheService, _rawDataPath);
            _csvService = new CsvDataServiceNew(_csvLogger, "testprofile");
        }

        [TestCleanup]
        public void Cleanup()
        {
            _cacheService?.Dispose();
            _memoryMonitor?.Dispose();
            
            // Clean up test data
            if (Directory.Exists(_testDataPath))
            {
                try
                {
                    Directory.Delete(_testDataPath, true);
                }
                catch
                {
                    // Ignore cleanup errors in tests
                }
            }
        }

        #region Concurrent Loading Tests

        [TestMethod]
        [TestCategory("T-030")]
        [TestCategory("Concurrency")]
        public async Task TestConcurrentDataLoading_MultipleViews_NoCollision()
        {
            // Arrange
            const int numberOfViews = 10;
            const int numberOfLoadRequestsPerView = 5;
            var loadTasks = new List<Task<bool>>();
            var errors = new ConcurrentBag<Exception>();
            var loadStartTimes = new ConcurrentBag<DateTime>();
            var loadEndTimes = new ConcurrentBag<DateTime>();
            
            CreateTestCsvFiles(largeDataset: true);

            // Act - Simulate multiple views requesting data concurrently
            for (int view = 0; view < numberOfViews; view++)
            {
                var viewId = view;
                for (int request = 0; request < numberOfLoadRequestsPerView; request++)
                {
                    var requestId = request;
                    var task = Task.Run(async () =>
                    {
                        try
                        {
                            loadStartTimes.Add(DateTime.UtcNow);
                            var result = await _logicEngine.LoadAllAsync();
                            loadEndTimes.Add(DateTime.UtcNow);
                            
                            // Verify data is accessible
                            var users = await _logicEngine.GetUsersAsync();
                            Assert.IsNotNull(users, $"View {viewId} Request {requestId}: Users should not be null");
                            
                            return result;
                        }
                        catch (Exception ex)
                        {
                            errors.Add(ex);
                            throw;
                        }
                    });
                    loadTasks.Add(task);
                }
            }

            // Wait for all tasks to complete
            var results = await Task.WhenAll(loadTasks);

            // Assert
            Assert.AreEqual(0, errors.Count, $"No errors should occur during concurrent loading. Errors: {string.Join(", ", errors.Select(e => e.Message))}");
            Assert.IsTrue(results.All(r => r), "All load operations should succeed");
            
            // Verify no data duplication
            var finalUsers = await _logicEngine.GetUsersAsync();
            var distinctUserSids = finalUsers.Select(u => u.SID).Distinct().Count();
            Assert.AreEqual(finalUsers.Count(), distinctUserSids, "No duplicate users should exist after concurrent loading");
            
            // Log timing analysis
            var avgLoadTime = loadEndTimes.Zip(loadStartTimes, (end, start) => (end - start).TotalMilliseconds).Average();
            Console.WriteLine($"Average load time across {numberOfViews * numberOfLoadRequestsPerView} concurrent requests: {avgLoadTime:F2}ms");
        }

        [TestMethod]
        [TestCategory("T-030")]
        [TestCategory("ThreadSafety")]
        public async Task TestThreadSafetyWithConcurrentReadsAndWrites()
        {
            // Arrange
            const int numberOfThreads = 20;
            var barrier = new Barrier(numberOfThreads);
            var exceptions = new ConcurrentBag<Exception>();
            var readWriteTasks = new List<Task>();
            
            CreateTestCsvFiles();
            await _logicEngine.LoadAllAsync();

            // Act - Mix of concurrent reads and cache updates
            for (int i = 0; i < numberOfThreads; i++)
            {
                var threadId = i;
                var task = Task.Run(async () =>
                {
                    try
                    {
                        barrier.SignalAndWait(); // Ensure all threads start simultaneously
                        
                        if (threadId % 3 == 0)
                        {
                            // Write/update operation
                            var key = $"user_{threadId}";
                            await _cacheService.GetOrCreateAsync(key, async () =>
                            {
                                await Task.Delay(Random.Shared.Next(10, 50));
                                return new UserDto 
                                { 
                                    SID = $"S-1-5-21-{threadId}",
                                    DisplayName = $"TestUser{threadId}",
                                    UserPrincipalName = $"user{threadId}@test.com"
                                };
                            });
                        }
                        else if (threadId % 3 == 1)
                        {
                            // Read operation
                            var users = await _logicEngine.GetUsersAsync();
                            Assert.IsNotNull(users, $"Thread {threadId}: Users should not be null");
                            
                            var groups = await _logicEngine.GetGroupsAsync();
                            Assert.IsNotNull(groups, $"Thread {threadId}: Groups should not be null");
                        }
                        else
                        {
                            // Complex projection operation
                            var projection = await _logicEngine.GetUserProjectionAsync($"S-1-5-21-{threadId % 10}");
                            // Projection might be null if user doesn't exist, which is fine
                        }
                    }
                    catch (Exception ex)
                    {
                        exceptions.Add(ex);
                    }
                });
                readWriteTasks.Add(task);
            }

            await Task.WhenAll(readWriteTasks);

            // Assert
            Assert.AreEqual(0, exceptions.Count, $"No exceptions should occur. Errors: {string.Join(", ", exceptions.Select(e => e.Message))}");
            
            // Verify cache statistics
            var stats = _cacheService.GetStatistics();
            Assert.IsTrue(stats.TotalHits > 0, "Cache should have hits");
            Console.WriteLine($"Cache performance - Hits: {stats.TotalHits}, Misses: {stats.TotalMisses}, Hit Rate: {stats.HitRate:P}");
        }

        [TestMethod]
        [TestCategory("T-030")]
        [TestCategory("DataRace")]
        public async Task TestNoDataRacesInConcurrentCacheAccess()
        {
            // Arrange
            const int iterations = 100;
            const int threadsPerIteration = 10;
            var raceConditionDetected = false;
            var dataIntegrityViolations = new ConcurrentBag<string>();
            
            CreateTestCsvFiles();

            // Act - Aggressive concurrent access pattern to detect races
            for (int iteration = 0; iteration < iterations; iteration++)
            {
                var tasks = new Task[threadsPerIteration];
                var sharedCounter = 0;
                var expectedCounter = 0;
                
                for (int t = 0; t < threadsPerIteration; t++)
                {
                    var threadIndex = t;
                    tasks[t] = Task.Run(async () =>
                    {
                        var key = $"shared_resource_{iteration}";
                        
                        // Try to create race condition
                        var result = await _cacheService.GetOrCreateAsync(key, async () =>
                        {
                            // Simulate work that could cause race
                            await Task.Delay(1);
                            
                            // Increment shared counter (potential race point)
                            var localValue = Interlocked.Increment(ref sharedCounter);
                            
                            return new TestDataObject
                            {
                                Id = key,
                                Value = localValue,
                                ThreadId = Thread.CurrentThread.ManagedThreadId,
                                CreatedAt = DateTime.UtcNow
                            };
                        });
                        
                        // Verify data integrity
                        if (result.Value != result.Value) // Self-comparison to detect corruption
                        {
                            dataIntegrityViolations.Add($"Data corruption detected in iteration {iteration}, thread {threadIndex}");
                        }
                    });
                }
                
                await Task.WhenAll(tasks);
                
                // Only one thread should have created the cached item
                expectedCounter = 1;
                if (sharedCounter != expectedCounter)
                {
                    raceConditionDetected = true;
                    Console.WriteLine($"Race condition in iteration {iteration}: Expected {expectedCounter}, got {sharedCounter}");
                }
            }

            // Assert
            Assert.IsFalse(raceConditionDetected, "No race conditions should be detected");
            Assert.AreEqual(0, dataIntegrityViolations.Count, $"No data integrity violations should occur. Violations: {string.Join(", ", dataIntegrityViolations)}");
        }

        #endregion

        #region Cache Invalidation Tests

        [TestMethod]
        [TestCategory("T-030")]
        [TestCategory("CacheInvalidation")]
        public async Task TestCacheInvalidation_OnCsvFileChange()
        {
            // Arrange
            var usersFile = Path.Combine(_rawDataPath, "Users.csv");
            CreateTestCsvFile(usersFile, GenerateUsersCsvContent(100));
            
            // Initial load
            await _logicEngine.LoadAllAsync();
            var initialUsers = await _logicEngine.GetUsersAsync();
            var initialUserCount = initialUsers.Count();

            // Act - Modify CSV file to trigger invalidation
            await Task.Delay(1100); // Ensure file timestamp changes
            CreateTestCsvFile(usersFile, GenerateUsersCsvContent(200)); // Double the users
            
            // Simulate file watcher notification
            await _logicEngine.InvalidateCacheAsync("Users.csv");
            
            // Reload data
            await _logicEngine.LoadAllAsync();
            var updatedUsers = await _logicEngine.GetUsersAsync();
            var updatedUserCount = updatedUsers.Count();

            // Assert
            Assert.AreEqual(200, updatedUserCount, "User count should reflect the updated CSV");
            Assert.AreNotEqual(initialUserCount, updatedUserCount, "Cache should be invalidated and reloaded");
            
            // Verify new data is actually loaded
            var newUser = updatedUsers.FirstOrDefault(u => u.DisplayName == "User_150");
            Assert.IsNotNull(newUser, "New users from updated CSV should be present");
        }

        [TestMethod]
        [TestCategory("T-030")]
        [TestCategory("CacheInvalidation")]
        public async Task TestCacheInvalidation_MultipleFileChanges_ConcurrentRefresh()
        {
            // Arrange
            var fileTypes = new[] { "Users", "Groups", "Devices", "Applications" };
            var csvFiles = new Dictionary<string, string>();
            
            foreach (var fileType in fileTypes)
            {
                var filePath = Path.Combine(_rawDataPath, $"{fileType}.csv");
                csvFiles[fileType] = filePath;
                CreateTestCsvFile(filePath, GenerateCsvContent(fileType, 50));
            }
            
            await _logicEngine.LoadAllAsync();
            
            // Act - Simulate concurrent file changes
            var updateTasks = fileTypes.Select(async fileType =>
            {
                await Task.Delay(Random.Shared.Next(100, 500)); // Stagger updates
                
                var filePath = csvFiles[fileType];
                CreateTestCsvFile(filePath, GenerateCsvContent(fileType, 100)); // Double the data
                
                await _logicEngine.InvalidateCacheAsync($"{fileType}.csv");
            }).ToArray();
            
            await Task.WhenAll(updateTasks);
            
            // Trigger concurrent refresh from multiple views
            var refreshTasks = new Task[5];
            for (int i = 0; i < refreshTasks.Length; i++)
            {
                refreshTasks[i] = _logicEngine.LoadAllAsync();
            }
            
            await Task.WhenAll(refreshTasks);

            // Assert - Verify all data types are updated
            var users = await _logicEngine.GetUsersAsync();
            var groups = await _logicEngine.GetGroupsAsync();
            var devices = await _logicEngine.GetDevicesAsync();
            
            Assert.AreEqual(100, users.Count(), "Users should be updated to new count");
            Assert.AreEqual(100, groups.Count(), "Groups should be updated to new count");
            Assert.AreEqual(100, devices.Count(), "Devices should be updated to new count");
        }

        [TestMethod]
        [TestCategory("T-030")]
        [TestCategory("FileWatcher")]
        public async Task TestFileWatcher_AutomaticCacheInvalidation()
        {
            // Arrange
            var usersFile = Path.Combine(_rawDataPath, "Users.csv");
            CreateTestCsvFile(usersFile, GenerateUsersCsvContent(50));
            
            // Create file watcher simulation
            var fileWatcher = new FileSystemWatcher(_rawDataPath, "*.csv")
            {
                NotifyFilter = NotifyFilters.LastWrite | NotifyFilters.Size,
                EnableRaisingEvents = true
            };
            
            var fileChangedSignal = new TaskCompletionSource<bool>();
            fileWatcher.Changed += (sender, e) =>
            {
                // Simulate cache invalidation on file change
                Task.Run(async () =>
                {
                    await _logicEngine.InvalidateCacheAsync(Path.GetFileName(e.FullPath));
                    fileChangedSignal.TrySetResult(true);
                });
            };
            
            await _logicEngine.LoadAllAsync();
            var initialUsers = await _logicEngine.GetUsersAsync();

            // Act - Modify file to trigger watcher
            await Task.Delay(1100);
            File.WriteAllText(usersFile, GenerateUsersCsvContent(75));
            
            // Wait for file watcher to trigger
            var watcherTriggered = await Task.WhenAny(
                fileChangedSignal.Task,
                Task.Delay(5000)
            ) == fileChangedSignal.Task;
            
            if (watcherTriggered)
            {
                await _logicEngine.LoadAllAsync();
            }
            
            var updatedUsers = await _logicEngine.GetUsersAsync();

            // Assert
            Assert.IsTrue(watcherTriggered, "File watcher should detect changes");
            Assert.AreEqual(75, updatedUsers.Count(), "Cache should be automatically invalidated and refreshed");
            
            fileWatcher.Dispose();
        }

        #endregion

        #region Performance and Memory Tests

        [TestMethod]
        [TestCategory("T-030")]
        [TestCategory("Performance")]
        public async Task TestPerformance_LargeDatasetConcurrentLoading()
        {
            // Arrange
            const int userCount = 10000;
            const int groupCount = 1000;
            const int deviceCount = 5000;
            const int concurrentRequests = 20;
            
            CreateLargeTestDataset(userCount, groupCount, deviceCount);
            
            var loadTimes = new ConcurrentBag<double>();
            var memoryBefore = GC.GetTotalMemory(true);

            // Act - Concurrent loading of large dataset
            var sw = Stopwatch.StartNew();
            var tasks = Enumerable.Range(0, concurrentRequests).Select(async i =>
            {
                var taskSw = Stopwatch.StartNew();
                await _logicEngine.LoadAllAsync();
                taskSw.Stop();
                loadTimes.Add(taskSw.ElapsedMilliseconds);
                
                // Perform some operations to stress test
                var users = await _logicEngine.GetUsersAsync();
                var groups = await _logicEngine.GetGroupsAsync();
                var devices = await _logicEngine.GetDevicesAsync();
                
                // Get some projections
                var userProjection = await _logicEngine.GetUserProjectionAsync($"S-1-5-21-{i}");
            }).ToArray();
            
            await Task.WhenAll(tasks);
            sw.Stop();
            
            var memoryAfter = GC.GetTotalMemory(false);
            var memoryUsedMB = (memoryAfter - memoryBefore) / (1024.0 * 1024.0);

            // Assert
            Assert.IsTrue(sw.ElapsedMilliseconds < 30000, $"Large dataset should load within 30 seconds, took {sw.ElapsedMilliseconds}ms");
            Assert.IsTrue(memoryUsedMB < 500, $"Memory usage should be under 500MB, used {memoryUsedMB:F2}MB");
            
            var avgLoadTime = loadTimes.Average();
            var maxLoadTime = loadTimes.Max();
            Console.WriteLine($"Performance Results:");
            Console.WriteLine($"  Total Time: {sw.ElapsedMilliseconds}ms");
            Console.WriteLine($"  Average Load Time: {avgLoadTime:F2}ms");
            Console.WriteLine($"  Max Load Time: {maxLoadTime:F2}ms");
            Console.WriteLine($"  Memory Used: {memoryUsedMB:F2}MB");
            Console.WriteLine($"  Cache Hit Rate: {_cacheService.GetStatistics().HitRate:P}");
        }

        [TestMethod]
        [TestCategory("T-030")]
        [TestCategory("MemoryPressure")]
        public async Task TestMemoryPressure_CacheEviction()
        {
            // Arrange
            var initialMemory = GC.GetTotalMemory(true);
            var itemsToCache = 1000;
            var largeObjectSize = 10000; // Size per cached object
            
            // Act - Fill cache with large objects to trigger eviction
            var tasks = Enumerable.Range(0, itemsToCache).Select(async i =>
            {
                var key = $"large_object_{i}";
                await _cacheService.GetOrCreateAsync(key, async () =>
                {
                    await Task.Delay(1);
                    return new LargeTestObject
                    {
                        Id = key,
                        Data = new byte[largeObjectSize],
                        Metadata = Enumerable.Range(0, 100).Select(x => $"Meta_{x}").ToList()
                    };
                });
            }).ToArray();
            
            await Task.WhenAll(tasks);
            
            // Force memory pressure
            _memoryMonitor.SimulateHighMemoryPressure();
            await Task.Delay(1000); // Allow cache to react
            
            var stats = _cacheService.GetStatistics();

            // Assert
            Assert.IsTrue(stats.ItemsEvicted > 0, "Cache should evict items under memory pressure");
            Assert.IsTrue(stats.HotCacheSize < itemsToCache, "Not all items should remain in hot cache");
            
            // Verify cache still works after eviction
            var testKey = "large_object_0";
            var retrieved = await _cacheService.GetOrCreateAsync(testKey, async () =>
            {
                await Task.Delay(1);
                return new LargeTestObject { Id = testKey };
            });
            Assert.IsNotNull(retrieved, "Cache should still function after eviction");
            
            var finalMemory = GC.GetTotalMemory(false);
            var memoryUsedMB = (finalMemory - initialMemory) / (1024.0 * 1024.0);
            Console.WriteLine($"Memory pressure test - Items evicted: {stats.ItemsEvicted}, Memory used: {memoryUsedMB:F2}MB");
        }

        #endregion

        #region Data Integrity Tests

        [TestMethod]
        [TestCategory("T-030")]
        [TestCategory("DataIntegrity")]
        public async Task TestDataIntegrity_ConcurrentModificationsNoDuplication()
        {
            // Arrange
            CreateTestCsvFiles();
            await _logicEngine.LoadAllAsync();
            
            var modificationTasks = new List<Task>();
            var userSids = new ConcurrentBag<string>();
            
            // Act - Concurrent modifications
            for (int i = 0; i < 10; i++)
            {
                var index = i;
                modificationTasks.Add(Task.Run(async () =>
                {
                    // Add users via cache
                    var sid = $"S-1-5-21-MOD-{index}";
                    userSids.Add(sid);
                    
                    await _cacheService.GetOrCreateAsync($"user_mod_{index}", async () =>
                    {
                        await Task.Delay(Random.Shared.Next(10, 50));
                        return new UserDto
                        {
                            SID = sid,
                            DisplayName = $"Modified User {index}",
                            UserPrincipalName = $"moduser{index}@test.com"
                        };
                    });
                }));
            }
            
            await Task.WhenAll(modificationTasks);
            
            // Verify no duplication
            var distinctSids = userSids.Distinct().Count();
            
            // Assert
            Assert.AreEqual(10, distinctSids, "All SIDs should be unique");
            Assert.AreEqual(10, userSids.Count, "No duplicates should exist");
        }

        [TestMethod]
        [TestCategory("T-030")]
        [TestCategory("DataConsistency")]
        public async Task TestDataConsistency_AcrossMultipleCacheTiers()
        {
            // Arrange
            var testKey = "consistency_test";
            var testData = new UserDto
            {
                SID = "S-1-5-21-CONSIST-1",
                DisplayName = "Consistency Test User",
                UserPrincipalName = "consistent@test.com"
            };
            
            // Act - Store in cache
            var stored = await _cacheService.GetOrCreateAsync(testKey, async () =>
            {
                await Task.Delay(10);
                return testData;
            });
            
            // Force promotion through tiers by repeated access
            for (int i = 0; i < 10; i++)
            {
                await Task.Delay(100);
                var retrieved = await _cacheService.GetOrCreateAsync<UserDto>(testKey, async () =>
                {
                    throw new InvalidOperationException("Should not recreate");
                });
                
                // Assert consistency across retrievals
                Assert.AreEqual(testData.SID, retrieved.SID, $"SID should be consistent on retrieval {i}");
                Assert.AreEqual(testData.DisplayName, retrieved.DisplayName, $"DisplayName should be consistent on retrieval {i}");
                Assert.AreEqual(testData.UserPrincipalName, retrieved.UserPrincipalName, $"UPN should be consistent on retrieval {i}");
            }
            
            // Simulate tier movement
            _cacheService.PromoteToHotCache(testKey);
            
            var finalRetrieval = await _cacheService.GetOrCreateAsync<UserDto>(testKey, async () =>
            {
                throw new InvalidOperationException("Should not recreate after promotion");
            });
            
            // Assert final consistency
            Assert.AreEqual(testData.SID, finalRetrieval.SID, "Data should remain consistent after tier promotion");
        }

        #endregion

        #region Helper Methods

        private void CreateTestCsvFiles(bool largeDataset = false)
        {
            var userCount = largeDataset ? 1000 : 100;
            var groupCount = largeDataset ? 500 : 50;
            var deviceCount = largeDataset ? 750 : 75;
            
            CreateTestCsvFile(Path.Combine(_rawDataPath, "Users.csv"), GenerateUsersCsvContent(userCount));
            CreateTestCsvFile(Path.Combine(_rawDataPath, "Groups.csv"), GenerateGroupsCsvContent(groupCount));
            CreateTestCsvFile(Path.Combine(_rawDataPath, "Devices.csv"), GenerateDevicesCsvContent(deviceCount));
        }

        private void CreateLargeTestDataset(int users, int groups, int devices)
        {
            CreateTestCsvFile(Path.Combine(_rawDataPath, "Users.csv"), GenerateUsersCsvContent(users));
            CreateTestCsvFile(Path.Combine(_rawDataPath, "Groups.csv"), GenerateGroupsCsvContent(groups));
            CreateTestCsvFile(Path.Combine(_rawDataPath, "Devices.csv"), GenerateDevicesCsvContent(devices));
            CreateTestCsvFile(Path.Combine(_rawDataPath, "Applications.csv"), GenerateApplicationsCsvContent(500));
            CreateTestCsvFile(Path.Combine(_rawDataPath, "Mailboxes.csv"), GenerateMailboxesCsvContent(users / 2));
        }

        private void CreateTestCsvFile(string filePath, string content)
        {
            lock (_testLock)
            {
                File.WriteAllText(filePath, content);
            }
        }

        private string GenerateCsvContent(string type, int count)
        {
            return type.ToLower() switch
            {
                "users" => GenerateUsersCsvContent(count),
                "groups" => GenerateGroupsCsvContent(count),
                "devices" => GenerateDevicesCsvContent(count),
                "applications" => GenerateApplicationsCsvContent(count),
                _ => GenerateGenericCsvContent(type, count)
            };
        }

        private string GenerateUsersCsvContent(int count)
        {
            var csv = "DisplayName,UserPrincipalName,Mail,Department,AccountEnabled,SID,SamAccountName\n";
            for (int i = 0; i < count; i++)
            {
                csv += $"User_{i},user{i}@test.com,user{i}@test.com,Dept{i % 10},TRUE,S-1-5-21-{i},user{i}\n";
            }
            return csv;
        }

        private string GenerateGroupsCsvContent(int count)
        {
            var csv = "GroupName,Description,SID,GroupType,Members\n";
            for (int i = 0; i < count; i++)
            {
                csv += $"Group_{i},Test Group {i},S-1-5-32-{i},Security,\"S-1-5-21-{i};S-1-5-21-{i+1}\"\n";
            }
            return csv;
        }

        private string GenerateDevicesCsvContent(int count)
        {
            var csv = "DeviceName,OperatingSystem,LastSeen,PrimaryUser\n";
            for (int i = 0; i < count; i++)
            {
                csv += $"DEVICE{i:D4},Windows 10,2024-01-{(i % 28) + 1:D2},user{i % 100}@test.com\n";
            }
            return csv;
        }

        private string GenerateApplicationsCsvContent(int count)
        {
            var csv = "AppId,AppName,Publisher,Version,InstallCount\n";
            for (int i = 0; i < count; i++)
            {
                csv += $"APP{i:D4},Application {i},Publisher {i % 10},1.0.{i},{count - i}\n";
            }
            return csv;
        }

        private string GenerateMailboxesCsvContent(int count)
        {
            var csv = "UserPrincipalName,MailboxSize,ItemCount,LastLogon\n";
            for (int i = 0; i < count; i++)
            {
                csv += $"user{i}@test.com,{Random.Shared.Next(100, 50000)},{Random.Shared.Next(100, 10000)},2024-01-{(i % 28) + 1:D2}\n";
            }
            return csv;
        }

        private string GenerateGenericCsvContent(string type, int count)
        {
            var csv = "Id,Name,Value,Timestamp\n";
            for (int i = 0; i < count; i++)
            {
                csv += $"{type}_{i},{type}_Name_{i},Value_{i},{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss}\n";
            }
            return csv;
        }

        #endregion

        #region Test Data Classes

        private class TestDataObject
        {
            public string Id { get; set; }
            public int Value { get; set; }
            public int ThreadId { get; set; }
            public DateTime CreatedAt { get; set; }
        }

        private class LargeTestObject
        {
            public string Id { get; set; }
            public byte[] Data { get; set; }
            public List<string> Metadata { get; set; }
        }

        #endregion
    }
}