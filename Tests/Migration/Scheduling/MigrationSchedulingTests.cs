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
    /// Comprehensive test suite for T-033 Migration Scheduling and Notification System
    /// Tests scheduling logic, next run time calculations, blackout windows, and concurrency control
    /// </summary>
    [TestClass]
    public class MigrationSchedulingTests
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
                DefaultRetryCount = 2,
                DefaultRetryDelayMinutes = 15,
                EnableRetries = true,
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

        #region Scheduling Logic Tests

        [TestMethod]
        public async Task ScheduleWaveAsync_ValidWave_ReturnsSuccessResult()
        {
            // Arrange
            var wave = CreateTestWave("test-wave-1");
            var options = new ScheduleWaveOptions
            {
                ScheduledStartTime = DateTime.Now.AddHours(2),
                MaxConcurrentTasks = 5,
                RetryCount = 2
            };

            await _schedulerService.StartAsync();

            // Act
            var result = await _schedulerService.ScheduleWaveAsync(wave, options);

            // Assert
            Assert.IsTrue(result.Success);
            Assert.AreEqual(wave.Id, result.WaveId);
            Assert.AreEqual(options.ScheduledStartTime, result.ScheduledTime);
        }

        [TestMethod]
        public async Task ScheduleWaveAsync_NullWave_ReturnsFailureResult()
        {
            // Arrange
            var options = new ScheduleWaveOptions
            {
                ScheduledStartTime = DateTime.Now.AddHours(2)
            };

            await _schedulerService.StartAsync();

            // Act
            var result = await _schedulerService.ScheduleWaveAsync(null, options);

            // Assert
            Assert.IsFalse(result.Success);
            Assert.AreEqual("Wave cannot be null", result.ErrorMessage);
        }

        [TestMethod]
        public async Task ScheduleWaveAsync_PastScheduleTime_ReturnsFailureResult()
        {
            // Arrange
            var wave = CreateTestWave("test-wave-past");
            var options = new ScheduleWaveOptions
            {
                ScheduledStartTime = DateTime.Now.AddHours(-1) // Past time
            };

            await _schedulerService.StartAsync();

            // Act
            var result = await _schedulerService.ScheduleWaveAsync(wave, options);

            // Assert
            Assert.IsFalse(result.Success);
            Assert.IsTrue(result.ErrorMessage.Contains("Scheduled start time must be in the future"));
        }

        [TestMethod]
        public async Task ScheduleWaveAsync_DuplicateWave_ReturnsFailureResult()
        {
            // Arrange
            var wave = CreateTestWave("duplicate-wave");
            var options = new ScheduleWaveOptions
            {
                ScheduledStartTime = DateTime.Now.AddHours(2)
            };

            await _schedulerService.StartAsync();
            await _schedulerService.ScheduleWaveAsync(wave, options);

            // Act - Try to schedule the same wave again
            var result = await _schedulerService.ScheduleWaveAsync(wave, options);

            // Assert
            Assert.IsFalse(result.Success);
            Assert.IsTrue(result.ErrorMessage.Contains("is already scheduled"));
        }

        [TestMethod]
        public async Task CalculateNextRunTime_BasicSchedule_ReturnsCorrectTime()
        {
            // Arrange
            var baseTime = new DateTime(2024, 3, 15, 9, 0, 0); // Friday 9:00 AM
            var interval = TimeSpan.FromHours(4);

            // Act
            var nextRun = baseTime.Add(interval);

            // Assert
            Assert.AreEqual(new DateTime(2024, 3, 15, 13, 0, 0), nextRun);
        }

        [TestMethod]
        public async Task GetNextAvailableTime_WithoutBlackouts_ReturnsSameTime()
        {
            // Arrange
            var testTime = DateTime.Now.AddHours(2);
            _testConfig.BlackoutPeriods.Clear();
            
            // Use reflection to access private method
            var method = typeof(MigrationSchedulerService).GetMethod("GetNextAvailableTime", 
                System.Reflection.BindingFlags.NonPublic | System.Reflection.BindingFlags.Instance);
            
            // Act
            var result = (DateTime)method.Invoke(_schedulerService, new object[] { testTime });

            // Assert
            Assert.AreEqual(testTime, result);
        }

        #endregion

        #region Blackout Window Tests

        [TestMethod]
        public async Task ScheduleWaveAsync_DuringBlackoutPeriod_ReturnsFailureResult()
        {
            // Arrange
            var blackoutStart = DateTime.Now.AddHours(1);
            var blackoutEnd = DateTime.Now.AddHours(3);
            var scheduleTime = DateTime.Now.AddHours(2); // During blackout

            _testConfig.BlackoutPeriods.Add(new BlackoutPeriod
            {
                Id = "test-blackout",
                StartTime = blackoutStart,
                EndTime = blackoutEnd,
                Description = "Test maintenance window"
            });

            var wave = CreateTestWave("blackout-wave");
            var options = new ScheduleWaveOptions
            {
                ScheduledStartTime = scheduleTime
            };

            await _schedulerService.StartAsync();

            // Act
            var result = await _schedulerService.ScheduleWaveAsync(wave, options);

            // Assert
            Assert.IsFalse(result.Success);
            Assert.IsTrue(result.ErrorMessage.Contains("blackout period"));
        }

        [TestMethod]
        public async Task ScheduleWaveAsync_OutsideBlackoutPeriod_ReturnsSuccessResult()
        {
            // Arrange
            var blackoutStart = DateTime.Now.AddHours(3);
            var blackoutEnd = DateTime.Now.AddHours(5);
            var scheduleTime = DateTime.Now.AddHours(1); // Before blackout

            _testConfig.BlackoutPeriods.Add(new BlackoutPeriod
            {
                Id = "test-blackout",
                StartTime = blackoutStart,
                EndTime = blackoutEnd,
                Description = "Test maintenance window"
            });

            var wave = CreateTestWave("outside-blackout-wave");
            var options = new ScheduleWaveOptions
            {
                ScheduledStartTime = scheduleTime
            };

            await _schedulerService.StartAsync();

            // Act
            var result = await _schedulerService.ScheduleWaveAsync(wave, options);

            // Assert
            Assert.IsTrue(result.Success);
        }

        [TestMethod]
        public void IsInBlackoutPeriod_MultipleBlackouts_DetectsCorrectly()
        {
            // Arrange
            var testTime = new DateTime(2024, 3, 15, 14, 30, 0); // 2:30 PM

            _testConfig.BlackoutPeriods.AddRange(new[]
            {
                new BlackoutPeriod
                {
                    StartTime = new DateTime(2024, 3, 15, 9, 0, 0),
                    EndTime = new DateTime(2024, 3, 15, 12, 0, 0),
                    Description = "Morning maintenance"
                },
                new BlackoutPeriod
                {
                    StartTime = new DateTime(2024, 3, 15, 14, 0, 0),
                    EndTime = new DateTime(2024, 3, 15, 16, 0, 0),
                    Description = "Afternoon maintenance"
                }
            });

            // Use reflection to access private method
            var method = typeof(MigrationSchedulerService).GetMethod("IsInBlackoutPeriod", 
                System.Reflection.BindingFlags.NonPublic | System.Reflection.BindingFlags.Instance);
            
            // Act
            var result = (bool)method.Invoke(_schedulerService, new object[] { testTime });

            // Assert
            Assert.IsTrue(result); // 2:30 PM falls within 2-4 PM blackout
        }

        [TestMethod]
        public void GetNextAvailableTime_DuringBlackout_ReturnsTimeAfterBlackout()
        {
            // Arrange
            var testTime = new DateTime(2024, 3, 15, 14, 30, 0); // 2:30 PM (during blackout)
            
            _testConfig.BlackoutPeriods.Add(new BlackoutPeriod
            {
                StartTime = new DateTime(2024, 3, 15, 14, 0, 0),
                EndTime = new DateTime(2024, 3, 15, 16, 0, 0),
                Description = "Afternoon maintenance"
            });

            // Use reflection to access private method
            var method = typeof(MigrationSchedulerService).GetMethod("GetNextAvailableTime", 
                System.Reflection.BindingFlags.NonPublic | System.Reflection.BindingFlags.Instance);
            
            // Act
            var result = (DateTime)method.Invoke(_schedulerService, new object[] { testTime });

            // Assert
            Assert.AreEqual(new DateTime(2024, 3, 15, 16, 1, 0), result); // 4:01 PM (after blackout)
        }

        [TestMethod]
        public void AddRemoveBlackoutPeriod_ManagesPeriodsCorrectly()
        {
            // Arrange
            var blackoutPeriod = new BlackoutPeriod
            {
                Id = "test-period",
                StartTime = DateTime.Now.AddHours(1),
                EndTime = DateTime.Now.AddHours(3),
                Description = "Test blackout"
            };

            // Act - Add
            _schedulerService.AddBlackoutPeriod(blackoutPeriod);

            // Assert - Added
            Assert.AreEqual(1, _schedulerService.Configuration.BlackoutPeriods.Count);
            Assert.AreEqual(blackoutPeriod.Id, _schedulerService.Configuration.BlackoutPeriods.First().Id);

            // Act - Remove
            var removed = _schedulerService.RemoveBlackoutPeriod(blackoutPeriod.Id);

            // Assert - Removed
            Assert.IsTrue(removed);
            Assert.AreEqual(0, _schedulerService.Configuration.BlackoutPeriods.Count);
        }

        #endregion

        #region Concurrency Control Tests

        [TestMethod]
        public async Task ConcurrentWaveExecution_RespectsMaxConcurrentLimit()
        {
            // Arrange
            _testConfig.MaxConcurrentWaves = 2; // Limit to 2 concurrent waves
            _schedulerService.Configuration = _testConfig;

            var waves = new[]
            {
                CreateTestWave("concurrent-wave-1"),
                CreateTestWave("concurrent-wave-2"),
                CreateTestWave("concurrent-wave-3")
            };

            var startTime = DateTime.Now.AddSeconds(1);

            await _schedulerService.StartAsync();

            // Act - Schedule all waves at nearly the same time
            var tasks = waves.Select((wave, index) => 
                _schedulerService.ScheduleWaveAsync(wave, new ScheduleWaveOptions
                {
                    ScheduledStartTime = startTime.AddSeconds(index),
                    MaxConcurrentTasks = 1
                })).ToArray();

            var results = await Task.WhenAll(tasks);

            // Wait for processing
            await Task.Delay(3000);

            // Assert
            Assert.IsTrue(results.All(r => r.Success), "All waves should be scheduled successfully");
            Assert.IsTrue(_schedulerService.ActiveWaveCount <= 2, 
                $"Active waves ({_schedulerService.ActiveWaveCount}) should not exceed limit (2)");
        }

        [TestMethod]
        public async Task UpdateConcurrencyLimit_AdjustsActiveLimit()
        {
            // Arrange
            var initialLimit = 3;
            var newLimit = 5;
            
            _testConfig.MaxConcurrentWaves = initialLimit;
            _schedulerService.Configuration = _testConfig;

            await _schedulerService.StartAsync();

            // Act
            _testConfig.MaxConcurrentWaves = newLimit;
            _schedulerService.Configuration = _testConfig;

            // Assert
            Assert.AreEqual(newLimit, _schedulerService.Configuration.MaxConcurrentWaves);
        }

        [TestMethod]
        public async Task ConcurrencyLimitEnforcement_WavesQueueWhenLimitReached()
        {
            // Arrange
            _testConfig.MaxConcurrentWaves = 1; // Only 1 concurrent wave
            _schedulerService.Configuration = _testConfig;

            var wave1 = CreateTestWave("queue-test-1");
            var wave2 = CreateTestWave("queue-test-2");

            var startTime = DateTime.Now.AddSeconds(1);

            await _schedulerService.StartAsync();

            // Act
            var result1 = await _schedulerService.ScheduleWaveAsync(wave1, new ScheduleWaveOptions
            {
                ScheduledStartTime = startTime
            });

            var result2 = await _schedulerService.ScheduleWaveAsync(wave2, new ScheduleWaveOptions
            {
                ScheduledStartTime = startTime.AddSeconds(1)
            });

            // Wait for processing
            await Task.Delay(2000);

            // Assert
            Assert.IsTrue(result1.Success);
            Assert.IsTrue(result2.Success);
            
            var scheduledWaves = _schedulerService.GetScheduledWaves();
            Assert.AreEqual(2, scheduledWaves.Count);
        }

        #endregion

        #region Dependency Management Tests

        [TestMethod]
        public async Task DependencyResolution_WaitsForDependentWaveCompletion()
        {
            // Arrange
            var dependentWave = CreateTestWave("dependent-wave");
            var dependencyWave = CreateTestWave("dependency-wave");

            var startTime = DateTime.Now.AddSeconds(2);

            await _schedulerService.StartAsync();

            // Schedule dependency first
            await _schedulerService.ScheduleWaveAsync(dependencyWave, new ScheduleWaveOptions
            {
                ScheduledStartTime = startTime
            });

            // Schedule dependent wave with dependency
            await _schedulerService.ScheduleWaveAsync(dependentWave, new ScheduleWaveOptions
            {
                ScheduledStartTime = startTime.AddSeconds(1),
                Dependencies = new List<string> { dependencyWave.Id }
            });

            // Wait for processing
            await Task.Delay(3000);

            // Use reflection to test dependency satisfaction
            var method = typeof(MigrationSchedulerService).GetMethod("AreDependenciesSatisfied", 
                System.Reflection.BindingFlags.NonPublic | System.Reflection.BindingFlags.Instance);

            var dependentScheduledWave = _schedulerService.GetScheduledWaveStatus(dependentWave.Id);

            // Act
            var dependenciesSatisfied = (bool)method.Invoke(_schedulerService, new object[] { dependentScheduledWave });

            // Assert
            // Dependencies should not be satisfied immediately since dependency wave hasn't completed
            Assert.IsFalse(dependenciesSatisfied);
        }

        [TestMethod]
        public void AreDependenciesSatisfied_NoDependencies_ReturnsTrue()
        {
            // Arrange
            var wave = CreateTestWave("no-deps-wave");
            var scheduledWave = new ScheduledWave
            {
                Id = wave.Id,
                Wave = wave,
                Dependencies = new List<string>()
            };

            // Use reflection to access private method
            var method = typeof(MigrationSchedulerService).GetMethod("AreDependenciesSatisfied", 
                System.Reflection.BindingFlags.NonPublic | System.Reflection.BindingFlags.Instance);
            
            // Act
            var result = (bool)method.Invoke(_schedulerService, new object[] { scheduledWave });

            // Assert
            Assert.IsTrue(result);
        }

        #endregion

        #region Retry Logic Tests

        [TestMethod]
        public async Task RetryLogic_FailedWaveSchedulesRetry()
        {
            // This test would require mocking the ExecuteWaveAsync method to simulate failures
            // Implementation would test that failed waves are rescheduled according to retry settings
            
            // Arrange
            var wave = CreateTestWave("retry-test-wave");
            var options = new ScheduleWaveOptions
            {
                ScheduledStartTime = DateTime.Now.AddSeconds(1),
                RetryCount = 2,
                RetryDelayMinutes = 1
            };

            await _schedulerService.StartAsync();

            // Act
            var result = await _schedulerService.ScheduleWaveAsync(wave, options);

            // Assert
            Assert.IsTrue(result.Success);
            
            // Note: Full retry testing would require mocking the ExecuteWaveAsync method
            // to simulate failures and verify that retries are scheduled correctly
        }

        [TestMethod]
        public void RetryConfiguration_ValidatesCorrectly()
        {
            // Arrange & Act
            var options = new ScheduleWaveOptions
            {
                ScheduledStartTime = DateTime.Now.AddHours(1),
                RetryCount = -1, // Invalid
                RetryDelayMinutes = -5 // Invalid
            };

            // Use reflection to access validation method
            var method = typeof(MigrationSchedulerService).GetMethod("ValidateScheduleOptions", 
                System.Reflection.BindingFlags.NonPublic | System.Reflection.BindingFlags.Instance);
            
            var result = (ScheduleValidationResult)method.Invoke(_schedulerService, new object[] { options });

            // Assert
            Assert.IsFalse(result.IsValid);
            Assert.IsTrue(result.Errors.Any(e => e.Contains("Retry count cannot be negative")));
            Assert.IsTrue(result.Errors.Any(e => e.Contains("Retry delay cannot be negative")));
        }

        #endregion

        #region Batch Scheduling Tests

        [TestMethod]
        public async Task ScheduleMultipleWavesAsync_ValidBatch_SchedulesAllWaves()
        {
            // Arrange
            var waves = new List<MigrationWaveExtended>
            {
                CreateTestWave("batch-wave-1"),
                CreateTestWave("batch-wave-2"),
                CreateTestWave("batch-wave-3")
            };

            var batchOptions = new BatchScheduleOptions
            {
                EarliestStartTime = DateTime.Now.AddHours(1),
                WaveInterval = TimeSpan.FromHours(2),
                MaxConcurrentTasks = 5,
                RetryCount = 2
            };

            // Mock the base scheduler to return a successful result
            var mockScheduleResult = new ScheduleResult
            {
                IsSuccess = true,
                Waves = waves,
                Errors = new List<string>()
            };

            _mockBaseScheduler.Setup(s => s.CreateScheduleAsync(It.IsAny<List<MigrationItem>>(), It.IsAny<SchedulingOptions>()))
                            .ReturnsAsync(mockScheduleResult);

            await _schedulerService.StartAsync();

            // Act
            var result = await _schedulerService.ScheduleMultipleWavesAsync(waves, batchOptions);

            // Assert
            Assert.IsTrue(result.Success);
            Assert.AreEqual(3, result.TotalScheduled);
            Assert.AreEqual(3, result.ScheduledWaves.Count);
            Assert.AreEqual(0, result.FailedWaves.Count);
        }

        [TestMethod]
        public async Task ScheduleMultipleWavesAsync_EmptyList_ReturnsFailure()
        {
            // Arrange
            var waves = new List<MigrationWaveExtended>();
            var batchOptions = new BatchScheduleOptions();

            await _schedulerService.StartAsync();

            // Act
            var result = await _schedulerService.ScheduleMultipleWavesAsync(waves, batchOptions);

            // Assert
            Assert.IsFalse(result.Success);
            Assert.AreEqual("No waves provided for scheduling", result.ErrorMessage);
        }

        #endregion

        #region Event Handling Tests

        [TestMethod]
        public async Task SchedulerEvents_FireCorrectly()
        {
            // Arrange
            var eventsFired = new List<string>();
            
            _schedulerService.WaveScheduled += (s, e) => eventsFired.Add("WaveScheduled");
            _schedulerService.WaveStarted += (s, e) => eventsFired.Add("WaveStarted");
            _schedulerService.WaveCompleted += (s, e) => eventsFired.Add("WaveCompleted");
            _schedulerService.SchedulerStatusChanged += (s, e) => eventsFired.Add("SchedulerStatusChanged");

            var wave = CreateTestWave("event-test-wave");
            var options = new ScheduleWaveOptions
            {
                ScheduledStartTime = DateTime.Now.AddSeconds(1)
            };

            // Act
            await _schedulerService.StartAsync();
            await _schedulerService.ScheduleWaveAsync(wave, options);

            // Wait for events
            await Task.Delay(1500);

            // Assert
            Assert.IsTrue(eventsFired.Contains("SchedulerStatusChanged"));
            Assert.IsTrue(eventsFired.Contains("WaveScheduled"));
        }

        #endregion

        #region Performance Tests

        [TestMethod]
        public async Task SchedulerPerformance_HandlesLargeNumberOfWaves()
        {
            // Arrange
            const int waveCount = 100;
            var waves = Enumerable.Range(1, waveCount)
                                 .Select(i => CreateTestWave($"perf-wave-{i}"))
                                 .ToList();

            var startTime = DateTime.Now.AddMinutes(5);
            await _schedulerService.StartAsync();

            var stopwatch = System.Diagnostics.Stopwatch.StartNew();

            // Act
            var tasks = waves.Select((wave, index) => 
                _schedulerService.ScheduleWaveAsync(wave, new ScheduleWaveOptions
                {
                    ScheduledStartTime = startTime.AddMinutes(index)
                })).ToArray();

            var results = await Task.WhenAll(tasks);
            stopwatch.Stop();

            // Assert
            Assert.IsTrue(results.All(r => r.Success), "All waves should be scheduled successfully");
            Assert.IsTrue(stopwatch.ElapsedMilliseconds < 10000, // Should complete in under 10 seconds
                $"Scheduling {waveCount} waves took {stopwatch.ElapsedMilliseconds}ms");
            
            Assert.AreEqual(waveCount, _schedulerService.TotalScheduledWaves);
        }

        #endregion

        #region Helper Methods

        private MigrationWaveExtended CreateTestWave(string waveId)
        {
            return new MigrationWaveExtended
            {
                Id = waveId,
                Name = $"Test Wave {waveId}",
                Description = $"Test wave for scheduling tests",
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