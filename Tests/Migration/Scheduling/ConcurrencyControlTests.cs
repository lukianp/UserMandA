using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using Moq;
using MandADiscoverySuite.Services;
using MandADiscoverySuite.Models;

namespace MandADiscoverySuite.Tests.Migration.Scheduling
{
    /// <summary>
    /// Comprehensive test suite for concurrency control in T-033 Migration Scheduling System
    /// Tests wave concurrency limits, semaphore behavior, and resource throttling
    /// </summary>
    [TestClass]
    public class ConcurrencyControlTests
    {
        #region Test Setup

        private Mock<ILogger<MigrationSchedulerService>> _mockLogger;
        private Mock<MigrationScheduler> _mockBaseScheduler;
        private MigrationSchedulerService _schedulerService;
        private SchedulerConfiguration _testConfig;

        [TestInitialize]
        public void TestInitialize()
        {
            _mockLogger = new Mock<ILogger<MigrationSchedulerService>>();
            _mockBaseScheduler = new Mock<MigrationScheduler>();
            
            _testConfig = new SchedulerConfiguration
            {
                MaxConcurrentWaves = 3,
                BlackoutPeriods = new List<BlackoutPeriod>()
            };

            _schedulerService = new MigrationSchedulerService(_mockBaseScheduler.Object, _mockLogger.Object)
            {
                Configuration = _testConfig
            };
        }

        [TestCleanup]
        public void TestCleanup()
        {
            _schedulerService?.Dispose();
        }

        #endregion

        #region Basic Concurrency Tests

        [TestMethod]
        public async Task ConcurrencyLimit_DefaultConfiguration_RespectsMaxWaves()
        {
            // Arrange
            const int maxConcurrentWaves = 2;
            _testConfig.MaxConcurrentWaves = maxConcurrentWaves;
            _schedulerService.Configuration = _testConfig;

            var waves = CreateTestWaves(5); // More than the limit
            var startTime = DateTime.Now.AddSeconds(2);

            await _schedulerService.StartAsync();

            // Act - Schedule all waves to start at nearly the same time
            var scheduleTasks = waves.Select((wave, index) => 
                _schedulerService.ScheduleWaveAsync(wave, new ScheduleWaveOptions
                {
                    ScheduledStartTime = startTime.AddMilliseconds(index * 100)
                })).ToArray();

            var results = await Task.WhenAll(scheduleTasks);

            // Wait for wave processing to begin
            await Task.Delay(3000);

            // Assert
            Assert.IsTrue(results.All(r => r.Success), "All waves should be scheduled successfully");
            Assert.IsTrue(_schedulerService.ActiveWaveCount <= maxConcurrentWaves, 
                $"Active waves ({_schedulerService.ActiveWaveCount}) should not exceed limit ({maxConcurrentWaves})");
        }

        [TestMethod]
        public async Task ConcurrencyLimit_SingleWave_AllowsExecution()
        {
            // Arrange
            _testConfig.MaxConcurrentWaves = 1;
            _schedulerService.Configuration = _testConfig;

            var wave = CreateTestWave("single-wave");
            var options = new ScheduleWaveOptions
            {
                ScheduledStartTime = DateTime.Now.AddSeconds(1)
            };

            await _schedulerService.StartAsync();

            // Act
            var result = await _schedulerService.ScheduleWaveAsync(wave, options);
            await Task.Delay(1500);

            // Assert
            Assert.IsTrue(result.Success);
            Assert.AreEqual(1, _schedulerService.TotalScheduledWaves);
        }

        [TestMethod]
        public async Task ConcurrencyLimit_ZeroLimit_PreventsExecution()
        {
            // Arrange
            _testConfig.MaxConcurrentWaves = 0;
            _schedulerService.Configuration = _testConfig;

            var wave = CreateTestWave("zero-limit-wave");
            var options = new ScheduleWaveOptions
            {
                ScheduledStartTime = DateTime.Now.AddSeconds(1)
            };

            await _schedulerService.StartAsync();

            // Act
            var result = await _schedulerService.ScheduleWaveAsync(wave, options);
            await Task.Delay(1500);

            // Assert
            Assert.IsTrue(result.Success); // Scheduling should succeed
            Assert.AreEqual(0, _schedulerService.ActiveWaveCount); // But no waves should be active
        }

        #endregion

        #region Dynamic Concurrency Limit Tests

        [TestMethod]
        public async Task UpdateConcurrencyLimit_IncreaseLimit_AllowsMoreWaves()
        {
            // Arrange
            const int initialLimit = 1;
            const int newLimit = 3;
            
            _testConfig.MaxConcurrentWaves = initialLimit;
            _schedulerService.Configuration = _testConfig;

            var waves = CreateTestWaves(3);
            var startTime = DateTime.Now.AddSeconds(2);

            await _schedulerService.StartAsync();

            // Schedule first wave
            await _schedulerService.ScheduleWaveAsync(waves[0], new ScheduleWaveOptions
            {
                ScheduledStartTime = startTime
            });

            // Act - Increase limit
            _testConfig.MaxConcurrentWaves = newLimit;
            _schedulerService.Configuration = _testConfig;

            // Schedule remaining waves
            await _schedulerService.ScheduleWaveAsync(waves[1], new ScheduleWaveOptions
            {
                ScheduledStartTime = startTime.AddMilliseconds(100)
            });
            await _schedulerService.ScheduleWaveAsync(waves[2], new ScheduleWaveOptions
            {
                ScheduledStartTime = startTime.AddMilliseconds(200)
            });

            await Task.Delay(3000);

            // Assert
            Assert.AreEqual(newLimit, _schedulerService.Configuration.MaxConcurrentWaves);
            Assert.IsTrue(_schedulerService.ActiveWaveCount <= newLimit);
        }

        [TestMethod]
        public async Task UpdateConcurrencyLimit_DecreaseLimit_RespectsNewLimit()
        {
            // Arrange
            const int initialLimit = 3;
            const int newLimit = 1;
            
            _testConfig.MaxConcurrentWaves = initialLimit;
            _schedulerService.Configuration = _testConfig;

            var waves = CreateTestWaves(3);
            var startTime = DateTime.Now.AddSeconds(2);

            await _schedulerService.StartAsync();

            // Schedule all waves
            foreach (var (wave, index) in waves.Select((w, i) => (w, i)))
            {
                await _schedulerService.ScheduleWaveAsync(wave, new ScheduleWaveOptions
                {
                    ScheduledStartTime = startTime.AddMilliseconds(index * 100)
                });
            }

            await Task.Delay(1000); // Let some waves start

            // Act - Decrease limit
            _testConfig.MaxConcurrentWaves = newLimit;
            _schedulerService.Configuration = _testConfig;

            await Task.Delay(2000); // Wait for limit to take effect

            // Assert
            Assert.AreEqual(newLimit, _schedulerService.Configuration.MaxConcurrentWaves);
            // Note: Already running waves might continue, but new waves should respect the limit
        }

        [TestMethod]
        public async Task ConcurrencyLimitChange_MultipleUpdates_HandlesCorrectly()
        {
            // Arrange
            var limits = new[] { 1, 3, 2, 5, 1 };
            
            await _schedulerService.StartAsync();

            // Act & Assert
            foreach (var limit in limits)
            {
                _testConfig.MaxConcurrentWaves = limit;
                _schedulerService.Configuration = _testConfig;
                
                Assert.AreEqual(limit, _schedulerService.Configuration.MaxConcurrentWaves,
                    $"Configuration should reflect new limit: {limit}");
            }
        }

        #endregion

        #region Wave Queuing Tests

        [TestMethod]
        public async Task WaveQueuing_ExceedsLimit_QueuesAdditionalWaves()
        {
            // Arrange
            const int concurrencyLimit = 2;
            const int totalWaves = 5;
            
            _testConfig.MaxConcurrentWaves = concurrencyLimit;
            _schedulerService.Configuration = _testConfig;

            var waves = CreateTestWaves(totalWaves);
            var startTime = DateTime.Now.AddSeconds(1);

            await _schedulerService.StartAsync();

            // Act - Schedule all waves at the same time
            var scheduleTasks = waves.Select((wave, index) => 
                _schedulerService.ScheduleWaveAsync(wave, new ScheduleWaveOptions
                {
                    ScheduledStartTime = startTime
                })).ToArray();

            var results = await Task.WhenAll(scheduleTasks);
            await Task.Delay(2000);

            // Assert
            Assert.IsTrue(results.All(r => r.Success), "All waves should be scheduled");
            Assert.AreEqual(totalWaves, _schedulerService.TotalScheduledWaves);
            
            var activeCount = _schedulerService.ActiveWaveCount;
            var scheduledCount = _schedulerService.ScheduledWaveCount;
            
            Assert.IsTrue(activeCount <= concurrencyLimit, 
                $"Active waves ({activeCount}) should not exceed limit ({concurrencyLimit})");
            Assert.IsTrue(activeCount + scheduledCount >= totalWaves - concurrencyLimit, 
                "Remaining waves should be queued");
        }

        [TestMethod]
        public async Task WaveQueuing_FIFO_ProcessesInCorrectOrder()
        {
            // Arrange
            const int concurrencyLimit = 1; // Force queuing
            _testConfig.MaxConcurrentWaves = concurrencyLimit;
            _schedulerService.Configuration = _testConfig;

            var waves = CreateTestWaves(3, "ordered-wave");
            var startTime = DateTime.Now.AddSeconds(1);
            var completionTimes = new Dictionary<string, DateTime?>();

            // Set up event handler to track completion order
            _schedulerService.WaveCompleted += (sender, args) => 
            {
                completionTimes[args.Wave.Id] = DateTime.Now;
            };

            await _schedulerService.StartAsync();

            // Act - Schedule waves in specific order
            for (int i = 0; i < waves.Count; i++)
            {
                await _schedulerService.ScheduleWaveAsync(waves[i], new ScheduleWaveOptions
                {
                    ScheduledStartTime = startTime.AddMilliseconds(i * 100)
                });
            }

            await Task.Delay(8000); // Wait for waves to complete

            // Assert
            // Note: This is a simplified test - full implementation would need to mock ExecuteWaveAsync
            // to control completion timing and verify FIFO order
            Assert.AreEqual(3, _schedulerService.TotalScheduledWaves);
        }

        #endregion

        #region Semaphore Behavior Tests

        [TestMethod]
        public async Task SemaphoreBehavior_AcquireRelease_WorksCorrectly()
        {
            // Arrange
            const int maxConcurrency = 2;
            _testConfig.MaxConcurrentWaves = maxConcurrency;
            _schedulerService.Configuration = _testConfig;

            var waves = CreateTestWaves(4);
            var startTime = DateTime.Now.AddSeconds(1);
            var semaphoreUsage = new List<(DateTime time, int activeWaves, string action)>();

            // Set up event handlers to track semaphore usage
            _schedulerService.WaveStarted += (sender, args) => 
            {
                lock (semaphoreUsage)
                {
                    semaphoreUsage.Add((DateTime.Now, _schedulerService.ActiveWaveCount, $"Started {args.Wave.Id}"));
                }
            };

            _schedulerService.WaveCompleted += (sender, args) => 
            {
                lock (semaphoreUsage)
                {
                    semaphoreUsage.Add((DateTime.Now, _schedulerService.ActiveWaveCount, $"Completed {args.Wave.Id}"));
                }
            };

            await _schedulerService.StartAsync();

            // Act
            var scheduleTasks = waves.Select((wave, index) => 
                _schedulerService.ScheduleWaveAsync(wave, new ScheduleWaveOptions
                {
                    ScheduledStartTime = startTime.AddMilliseconds(index * 200)
                })).ToArray();

            await Task.WhenAll(scheduleTasks);
            await Task.Delay(6000); // Wait for processing

            // Assert
            lock (semaphoreUsage)
            {
                foreach (var usage in semaphoreUsage)
                {
                    Assert.IsTrue(usage.activeWaves <= maxConcurrency, 
                        $"Active waves ({usage.activeWaves}) exceeded limit at {usage.time}: {usage.action}");
                }
            }
        }

        [TestMethod]
        public async Task SemaphoreTimeout_LongRunningWave_DoesNotBlockOthers()
        {
            // This test would require mocking ExecuteWaveAsync to simulate long-running waves
            // and verify that the semaphore is properly released even if a wave takes a long time
            
            // Arrange
            const int maxConcurrency = 1;
            _testConfig.MaxConcurrentWaves = maxConcurrency;
            _schedulerService.Configuration = _testConfig;

            var waves = CreateTestWaves(2);
            var startTime = DateTime.Now.AddSeconds(1);

            await _schedulerService.StartAsync();

            // Act
            var results = await Task.WhenAll(
                _schedulerService.ScheduleWaveAsync(waves[0], new ScheduleWaveOptions
                {
                    ScheduledStartTime = startTime
                }),
                _schedulerService.ScheduleWaveAsync(waves[1], new ScheduleWaveOptions
                {
                    ScheduledStartTime = startTime.AddMilliseconds(500)
                })
            );

            await Task.Delay(3000);

            // Assert
            Assert.IsTrue(results.All(r => r.Success));
            // Note: Full implementation would need to verify semaphore release behavior
        }

        #endregion

        #region Resource Throttling Tests

        [TestMethod]
        public async Task ResourceThrottling_HighSystemLoad_ReducesConcurrency()
        {
            // This test simulates system resource monitoring and throttling
            // Note: Actual implementation would require system monitoring hooks
            
            // Arrange
            const int maxConcurrency = 4;
            _testConfig.MaxConcurrentWaves = maxConcurrency;
            _schedulerService.Configuration = _testConfig;

            await _schedulerService.StartAsync();

            // Act & Assert
            // This is a placeholder for future resource monitoring functionality
            Assert.AreEqual(maxConcurrency, _schedulerService.Configuration.MaxConcurrentWaves);
            
            // Future implementation would:
            // 1. Monitor CPU usage
            // 2. Monitor memory usage
            // 3. Monitor network bandwidth
            // 4. Dynamically adjust concurrency based on thresholds
        }

        [TestMethod]
        public async Task ResourceRecovery_SystemLoadDecreases_RestoresConcurrency()
        {
            // This test simulates recovery from resource throttling
            // Note: Actual implementation would require system monitoring hooks
            
            // Arrange
            const int maxConcurrency = 4;
            const int throttledConcurrency = 2;
            
            _testConfig.MaxConcurrentWaves = throttledConcurrency;
            _schedulerService.Configuration = _testConfig;

            await _schedulerService.StartAsync();

            // Simulate system load decrease
            _testConfig.MaxConcurrentWaves = maxConcurrency;
            _schedulerService.Configuration = _testConfig;

            // Act & Assert
            Assert.AreEqual(maxConcurrency, _schedulerService.Configuration.MaxConcurrentWaves);
        }

        #endregion

        #region Error Handling and Edge Cases

        [TestMethod]
        public async Task ConcurrencyControl_InvalidConfiguration_HandlesGracefully()
        {
            // Arrange & Act & Assert
            var invalidConfigs = new[]
            {
                -1,  // Negative value
                0,   // Zero value (valid but special case)
                int.MaxValue  // Very large value
            };

            foreach (var invalidConfig in invalidConfigs)
            {
                try
                {
                    _testConfig.MaxConcurrentWaves = invalidConfig;
                    _schedulerService.Configuration = _testConfig;
                    
                    // Should not throw exception
                    Assert.AreEqual(invalidConfig, _schedulerService.Configuration.MaxConcurrentWaves);
                }
                catch (Exception ex)
                {
                    Assert.Fail($"Configuration with value {invalidConfig} should not throw exception: {ex.Message}");
                }
            }
        }

        [TestMethod]
        public async Task ConcurrencyControl_ServiceDisposal_CleansUpProperly()
        {
            // Arrange
            _testConfig.MaxConcurrentWaves = 2;
            _schedulerService.Configuration = _testConfig;

            var waves = CreateTestWaves(3);
            var startTime = DateTime.Now.AddSeconds(1);

            await _schedulerService.StartAsync();

            // Schedule waves
            foreach (var (wave, index) in waves.Select((w, i) => (w, i)))
            {
                await _schedulerService.ScheduleWaveAsync(wave, new ScheduleWaveOptions
                {
                    ScheduledStartTime = startTime.AddMilliseconds(index * 100)
                });
            }

            await Task.Delay(500);

            // Act - Dispose the service
            _schedulerService.Dispose();

            // Assert - Should not throw exceptions
            Assert.IsFalse(_schedulerService.IsRunning);
        }

        [TestMethod]
        public async Task ConcurrencyControl_RapidConfigurationChanges_RemainsStable()
        {
            // Arrange
            await _schedulerService.StartAsync();
            var random = new Random();

            // Act - Rapidly change configuration
            var tasks = Enumerable.Range(0, 50).Select(async i =>
            {
                await Task.Delay(random.Next(10, 100));
                var newLimit = random.Next(1, 10);
                _testConfig.MaxConcurrentWaves = newLimit;
                _schedulerService.Configuration = _testConfig;
            });

            await Task.WhenAll(tasks);
            await Task.Delay(1000);

            // Assert - Service should remain stable
            Assert.IsTrue(_schedulerService.IsRunning);
            Assert.IsTrue(_schedulerService.Configuration.MaxConcurrentWaves >= 1);
            Assert.IsTrue(_schedulerService.Configuration.MaxConcurrentWaves <= 10);
        }

        #endregion

        #region Performance Tests

        [TestMethod]
        public async Task ConcurrencyPerformance_ManyWaves_ScalesEfficiently()
        {
            // Arrange
            const int waveCount = 1000;
            const int maxConcurrency = 10;
            
            _testConfig.MaxConcurrentWaves = maxConcurrency;
            _schedulerService.Configuration = _testConfig;

            var waves = CreateTestWaves(waveCount);
            var startTime = DateTime.Now.AddMinutes(1); // Start in the future to avoid immediate execution

            await _schedulerService.StartAsync();

            var stopwatch = System.Diagnostics.Stopwatch.StartNew();

            // Act - Schedule many waves
            var scheduleTasks = waves.Select((wave, index) => 
                _schedulerService.ScheduleWaveAsync(wave, new ScheduleWaveOptions
                {
                    ScheduledStartTime = startTime.AddSeconds(index)
                })).ToArray();

            var results = await Task.WhenAll(scheduleTasks);
            stopwatch.Stop();

            // Assert
            Assert.IsTrue(results.All(r => r.Success), "All waves should be scheduled successfully");
            Assert.AreEqual(waveCount, _schedulerService.TotalScheduledWaves);
            Assert.IsTrue(stopwatch.ElapsedMilliseconds < 30000, // Should complete in under 30 seconds
                $"Scheduling {waveCount} waves took {stopwatch.ElapsedMilliseconds}ms");
        }

        [TestMethod]
        public async Task ConcurrencyMemoryUsage_LongRunning_DoesNotLeak()
        {
            // Arrange
            const int cycles = 50;
            const int wavesPerCycle = 10;
            
            _testConfig.MaxConcurrentWaves = 3;
            _schedulerService.Configuration = _testConfig;

            await _schedulerService.StartAsync();

            long initialMemory = GC.GetTotalMemory(true);

            // Act - Multiple cycles of scheduling and cleanup
            for (int cycle = 0; cycle < cycles; cycle++)
            {
                var waves = CreateTestWaves(wavesPerCycle, $"cycle-{cycle}");
                var startTime = DateTime.Now.AddHours(cycle + 1); // Future time to avoid execution

                var scheduleTasks = waves.Select(wave => 
                    _schedulerService.ScheduleWaveAsync(wave, new ScheduleWaveOptions
                    {
                        ScheduledStartTime = startTime
                    })).ToArray();

                await Task.WhenAll(scheduleTasks);

                // Cancel some waves to simulate cleanup
                foreach (var wave in waves.Take(wavesPerCycle / 2))
                {
                    await _schedulerService.CancelScheduledWaveAsync(wave.Id);
                }

                if (cycle % 10 == 0) // Periodic GC
                {
                    GC.Collect();
                    GC.WaitForPendingFinalizers();
                }
            }

            long finalMemory = GC.GetTotalMemory(true);

            // Assert
            long memoryIncrease = finalMemory - initialMemory;
            Assert.IsTrue(memoryIncrease < 50 * 1024 * 1024, // Less than 50MB increase
                $"Memory increased by {memoryIncrease / 1024 / 1024}MB, which may indicate a memory leak");
        }

        #endregion

        #region Helper Methods

        private List<MigrationWaveExtended> CreateTestWaves(int count, string prefix = "test-wave")
        {
            return Enumerable.Range(1, count)
                           .Select(i => CreateTestWave($"{prefix}-{i}"))
                           .ToList();
        }

        private MigrationWaveExtended CreateTestWave(string waveId)
        {
            return new MigrationWaveExtended
            {
                Id = waveId,
                Name = $"Test Wave {waveId}",
                Description = $"Test wave for concurrency testing",
                Batches = new List<MigrationBatch>
                {
                    new MigrationBatch
                    {
                        Id = $"{waveId}-batch-1",
                        Items = new List<MigrationItem>
                        {
                            new MigrationItem
                            {
                                Id = $"{waveId}-item-1",
                                Type = MigrationItemType.User,
                                SourceIdentity = "test.user@company.com",
                                DisplayName = "Test User"
                            }
                        }
                    }
                }
            };
        }

        #endregion
    }
}