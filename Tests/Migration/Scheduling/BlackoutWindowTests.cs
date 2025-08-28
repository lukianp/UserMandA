using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using Moq;
using MandADiscoverySuite.Services;
using MandADiscoverySuite.Models;

namespace MandADiscoverySuite.Tests.Migration.Scheduling
{
    /// <summary>
    /// Comprehensive test suite for blackout window enforcement in T-033 Migration Scheduling System
    /// Tests various blackout scenarios, recurring patterns, and edge cases
    /// </summary>
    [TestClass]
    public class BlackoutWindowTests
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

        #region Basic Blackout Window Tests

        [TestMethod]
        public async Task BlackoutWindow_ExactStartTime_IsDetected()
        {
            // Arrange
            var blackoutStart = new DateTime(2024, 3, 15, 14, 0, 0);
            var blackoutEnd = new DateTime(2024, 3, 15, 16, 0, 0);
            var testTime = blackoutStart; // Exact start time

            AddBlackoutPeriod(blackoutStart, blackoutEnd, "Exact start test");

            // Act
            var result = IsInBlackoutPeriod(testTime);

            // Assert
            Assert.IsTrue(result, "Exact blackout start time should be detected");
        }

        [TestMethod]
        public async Task BlackoutWindow_ExactEndTime_IsDetected()
        {
            // Arrange
            var blackoutStart = new DateTime(2024, 3, 15, 14, 0, 0);
            var blackoutEnd = new DateTime(2024, 3, 15, 16, 0, 0);
            var testTime = blackoutEnd; // Exact end time

            AddBlackoutPeriod(blackoutStart, blackoutEnd, "Exact end test");

            // Act
            var result = IsInBlackoutPeriod(testTime);

            // Assert
            Assert.IsTrue(result, "Exact blackout end time should be detected");
        }

        [TestMethod]
        public async Task BlackoutWindow_MiddleOfPeriod_IsDetected()
        {
            // Arrange
            var blackoutStart = new DateTime(2024, 3, 15, 14, 0, 0);
            var blackoutEnd = new DateTime(2024, 3, 15, 16, 0, 0);
            var testTime = new DateTime(2024, 3, 15, 15, 0, 0); // Middle

            AddBlackoutPeriod(blackoutStart, blackoutEnd, "Middle period test");

            // Act
            var result = IsInBlackoutPeriod(testTime);

            // Assert
            Assert.IsTrue(result, "Middle of blackout period should be detected");
        }

        [TestMethod]
        public async Task BlackoutWindow_OneMinuteBefore_IsNotDetected()
        {
            // Arrange
            var blackoutStart = new DateTime(2024, 3, 15, 14, 0, 0);
            var blackoutEnd = new DateTime(2024, 3, 15, 16, 0, 0);
            var testTime = blackoutStart.AddMinutes(-1); // One minute before

            AddBlackoutPeriod(blackoutStart, blackoutEnd, "One minute before test");

            // Act
            var result = IsInBlackoutPeriod(testTime);

            // Assert
            Assert.IsFalse(result, "One minute before blackout should not be detected");
        }

        [TestMethod]
        public async Task BlackoutWindow_OneMinuteAfter_IsNotDetected()
        {
            // Arrange
            var blackoutStart = new DateTime(2024, 3, 15, 14, 0, 0);
            var blackoutEnd = new DateTime(2024, 3, 15, 16, 0, 0);
            var testTime = blackoutEnd.AddMinutes(1); // One minute after

            AddBlackoutPeriod(blackoutStart, blackoutEnd, "One minute after test");

            // Act
            var result = IsInBlackoutPeriod(testTime);

            // Assert
            Assert.IsFalse(result, "One minute after blackout should not be detected");
        }

        #endregion

        #region Multiple Blackout Windows Tests

        [TestMethod]
        public async Task MultipleBlackouts_NonOverlapping_DetectsCorrectly()
        {
            // Arrange
            var morning = (start: new DateTime(2024, 3, 15, 9, 0, 0), end: new DateTime(2024, 3, 15, 12, 0, 0));
            var afternoon = (start: new DateTime(2024, 3, 15, 14, 0, 0), end: new DateTime(2024, 3, 15, 16, 0, 0));
            var evening = (start: new DateTime(2024, 3, 15, 20, 0, 0), end: new DateTime(2024, 3, 15, 22, 0, 0));

            AddBlackoutPeriod(morning.start, morning.end, "Morning maintenance");
            AddBlackoutPeriod(afternoon.start, afternoon.end, "Afternoon maintenance");
            AddBlackoutPeriod(evening.start, evening.end, "Evening maintenance");

            var testTimes = new[]
            {
                (time: new DateTime(2024, 3, 15, 8, 0, 0), expected: false, desc: "Before morning"),
                (time: new DateTime(2024, 3, 15, 10, 0, 0), expected: true, desc: "During morning"),
                (time: new DateTime(2024, 3, 15, 13, 0, 0), expected: false, desc: "Between morning and afternoon"),
                (time: new DateTime(2024, 3, 15, 15, 0, 0), expected: true, desc: "During afternoon"),
                (time: new DateTime(2024, 3, 15, 18, 0, 0), expected: false, desc: "Between afternoon and evening"),
                (time: new DateTime(2024, 3, 15, 21, 0, 0), expected: true, desc: "During evening"),
                (time: new DateTime(2024, 3, 15, 23, 0, 0), expected: false, desc: "After evening")
            };

            // Act & Assert
            foreach (var testCase in testTimes)
            {
                var result = IsInBlackoutPeriod(testCase.time);
                Assert.AreEqual(testCase.expected, result, 
                    $"Test case '{testCase.desc}' at {testCase.time} failed");
            }
        }

        [TestMethod]
        public async Task MultipleBlackouts_Overlapping_DetectsCorrectly()
        {
            // Arrange - Create overlapping blackout periods
            var blackout1 = (start: new DateTime(2024, 3, 15, 14, 0, 0), end: new DateTime(2024, 3, 15, 16, 0, 0));
            var blackout2 = (start: new DateTime(2024, 3, 15, 15, 0, 0), end: new DateTime(2024, 3, 15, 17, 0, 0));

            AddBlackoutPeriod(blackout1.start, blackout1.end, "First maintenance");
            AddBlackoutPeriod(blackout2.start, blackout2.end, "Second maintenance");

            var testTimes = new[]
            {
                (time: new DateTime(2024, 3, 15, 13, 30, 0), expected: false, desc: "Before both blackouts"),
                (time: new DateTime(2024, 3, 15, 14, 30, 0), expected: true, desc: "During first blackout only"),
                (time: new DateTime(2024, 3, 15, 15, 30, 0), expected: true, desc: "During both blackouts"),
                (time: new DateTime(2024, 3, 15, 16, 30, 0), expected: true, desc: "During second blackout only"),
                (time: new DateTime(2024, 3, 15, 17, 30, 0), expected: false, desc: "After both blackouts")
            };

            // Act & Assert
            foreach (var testCase in testTimes)
            {
                var result = IsInBlackoutPeriod(testCase.time);
                Assert.AreEqual(testCase.expected, result, 
                    $"Test case '{testCase.desc}' at {testCase.time} failed");
            }
        }

        #endregion

        #region Blackout Types Tests

        [TestMethod]
        public async Task BlackoutTypes_DifferentTypes_AllDetected()
        {
            // Arrange
            var maintenanceWindow = new BlackoutPeriod
            {
                Id = "maintenance-1",
                StartTime = new DateTime(2024, 3, 15, 2, 0, 0),
                EndTime = new DateTime(2024, 3, 15, 6, 0, 0),
                Type = BlackoutType.MaintenanceWindow,
                Description = "System maintenance"
            };

            var businessHours = new BlackoutPeriod
            {
                Id = "business-hours-1",
                StartTime = new DateTime(2024, 3, 15, 9, 0, 0),
                EndTime = new DateTime(2024, 3, 15, 17, 0, 0),
                Type = BlackoutType.BusinessHours,
                Description = "No migrations during business hours"
            };

            var holiday = new BlackoutPeriod
            {
                Id = "holiday-1",
                StartTime = new DateTime(2024, 12, 25, 0, 0, 0),
                EndTime = new DateTime(2024, 12, 25, 23, 59, 59),
                Type = BlackoutType.Holiday,
                Description = "Christmas Day"
            };

            var custom = new BlackoutPeriod
            {
                Id = "custom-1",
                StartTime = new DateTime(2024, 3, 15, 12, 0, 0),
                EndTime = new DateTime(2024, 3, 15, 14, 0, 0),
                Type = BlackoutType.Custom,
                Description = "Custom blackout period"
            };

            _schedulerService.AddBlackoutPeriod(maintenanceWindow);
            _schedulerService.AddBlackoutPeriod(businessHours);
            _schedulerService.AddBlackoutPeriod(holiday);
            _schedulerService.AddBlackoutPeriod(custom);

            // Act & Assert
            Assert.IsTrue(IsInBlackoutPeriod(new DateTime(2024, 3, 15, 4, 0, 0)), "Maintenance window not detected");
            Assert.IsTrue(IsInBlackoutPeriod(new DateTime(2024, 3, 15, 13, 0, 0)), "Business hours/Custom not detected");
            Assert.IsTrue(IsInBlackoutPeriod(new DateTime(2024, 12, 25, 12, 0, 0)), "Holiday not detected");
        }

        #endregion

        #region Next Available Time Tests

        [TestMethod]
        public async Task GetNextAvailableTime_SingleBlackout_ReturnsCorrectTime()
        {
            // Arrange
            var blackoutStart = new DateTime(2024, 3, 15, 14, 0, 0);
            var blackoutEnd = new DateTime(2024, 3, 15, 16, 0, 0);
            var requestTime = new DateTime(2024, 3, 15, 15, 0, 0); // During blackout

            AddBlackoutPeriod(blackoutStart, blackoutEnd, "Single blackout test");

            // Act
            var result = GetNextAvailableTime(requestTime);

            // Assert
            var expected = blackoutEnd.AddMinutes(1); // Should be 4:01 PM
            Assert.AreEqual(expected, result, "Next available time should be 1 minute after blackout end");
        }

        [TestMethod]
        public async Task GetNextAvailableTime_ConsecutiveBlackouts_SkipsAllBlackouts()
        {
            // Arrange
            var blackout1 = (start: new DateTime(2024, 3, 15, 14, 0, 0), end: new DateTime(2024, 3, 15, 16, 0, 0));
            var blackout2 = (start: new DateTime(2024, 3, 15, 16, 1, 0), end: new DateTime(2024, 3, 15, 18, 0, 0));
            var blackout3 = (start: new DateTime(2024, 3, 15, 18, 1, 0), end: new DateTime(2024, 3, 15, 20, 0, 0));

            AddBlackoutPeriod(blackout1.start, blackout1.end, "First consecutive blackout");
            AddBlackoutPeriod(blackout2.start, blackout2.end, "Second consecutive blackout");
            AddBlackoutPeriod(blackout3.start, blackout3.end, "Third consecutive blackout");

            var requestTime = new DateTime(2024, 3, 15, 15, 0, 0); // During first blackout

            // Act
            var result = GetNextAvailableTime(requestTime);

            // Assert
            var expected = blackout3.end.AddMinutes(1); // Should be 8:01 PM (after all blackouts)
            Assert.AreEqual(expected, result, "Should skip all consecutive blackouts");
        }

        [TestMethod]
        public async Task GetNextAvailableTime_NoBlackout_ReturnsSameTime()
        {
            // Arrange
            var requestTime = new DateTime(2024, 3, 15, 10, 0, 0);
            // No blackout periods added

            // Act
            var result = GetNextAvailableTime(requestTime);

            // Assert
            Assert.AreEqual(requestTime, result, "Should return same time when no blackouts");
        }

        [TestMethod]
        public async Task GetNextAvailableTime_BeforeBlackout_ReturnsSameTime()
        {
            // Arrange
            var blackoutStart = new DateTime(2024, 3, 15, 14, 0, 0);
            var blackoutEnd = new DateTime(2024, 3, 15, 16, 0, 0);
            var requestTime = new DateTime(2024, 3, 15, 10, 0, 0); // Before blackout

            AddBlackoutPeriod(blackoutStart, blackoutEnd, "Before blackout test");

            // Act
            var result = GetNextAvailableTime(requestTime);

            // Assert
            Assert.AreEqual(requestTime, result, "Should return same time when before blackout");
        }

        [TestMethod]
        public async Task GetNextAvailableTime_AfterBlackout_ReturnsSameTime()
        {
            // Arrange
            var blackoutStart = new DateTime(2024, 3, 15, 14, 0, 0);
            var blackoutEnd = new DateTime(2024, 3, 15, 16, 0, 0);
            var requestTime = new DateTime(2024, 3, 15, 18, 0, 0); // After blackout

            AddBlackoutPeriod(blackoutStart, blackoutEnd, "After blackout test");

            // Act
            var result = GetNextAvailableTime(requestTime);

            // Assert
            Assert.AreEqual(requestTime, result, "Should return same time when after blackout");
        }

        #endregion

        #region Edge Cases and Error Conditions

        [TestMethod]
        public async Task BlackoutWindow_MidnightCrossing_HandlesCorrectly()
        {
            // Arrange - Blackout crosses midnight
            var blackoutStart = new DateTime(2024, 3, 15, 23, 0, 0);
            var blackoutEnd = new DateTime(2024, 3, 16, 2, 0, 0);

            AddBlackoutPeriod(blackoutStart, blackoutEnd, "Midnight crossing");

            var testTimes = new[]
            {
                (time: new DateTime(2024, 3, 15, 22, 30, 0), expected: false, desc: "Before midnight blackout"),
                (time: new DateTime(2024, 3, 15, 23, 30, 0), expected: true, desc: "During midnight blackout (before midnight)"),
                (time: new DateTime(2024, 3, 16, 1, 0, 0), expected: true, desc: "During midnight blackout (after midnight)"),
                (time: new DateTime(2024, 3, 16, 2, 30, 0), expected: false, desc: "After midnight blackout")
            };

            // Act & Assert
            foreach (var testCase in testTimes)
            {
                var result = IsInBlackoutPeriod(testCase.time);
                Assert.AreEqual(testCase.expected, result, 
                    $"Midnight crossing test '{testCase.desc}' at {testCase.time} failed");
            }
        }

        [TestMethod]
        public async Task BlackoutWindow_SameStartEndTime_HandlesCorrectly()
        {
            // Arrange - Zero-duration blackout (edge case)
            var blackoutTime = new DateTime(2024, 3, 15, 14, 0, 0);

            AddBlackoutPeriod(blackoutTime, blackoutTime, "Zero duration blackout");

            // Act & Assert
            Assert.IsTrue(IsInBlackoutPeriod(blackoutTime), "Zero duration blackout should be detected at exact time");
            Assert.IsFalse(IsInBlackoutPeriod(blackoutTime.AddMinutes(1)), "Should not detect after zero duration blackout");
            Assert.IsFalse(IsInBlackoutPeriod(blackoutTime.AddMinutes(-1)), "Should not detect before zero duration blackout");
        }

        [TestMethod]
        public async Task BlackoutWindow_VeryLongDuration_HandlesCorrectly()
        {
            // Arrange - Multi-day blackout
            var blackoutStart = new DateTime(2024, 3, 15, 0, 0, 0);
            var blackoutEnd = new DateTime(2024, 3, 20, 23, 59, 59); // 5+ days

            AddBlackoutPeriod(blackoutStart, blackoutEnd, "Multi-day blackout");

            var testTimes = new[]
            {
                (time: new DateTime(2024, 3, 14, 23, 59, 0), expected: false, desc: "Before long blackout"),
                (time: new DateTime(2024, 3, 15, 12, 0, 0), expected: true, desc: "During long blackout day 1"),
                (time: new DateTime(2024, 3, 17, 12, 0, 0), expected: true, desc: "During long blackout day 3"),
                (time: new DateTime(2024, 3, 20, 23, 59, 59), expected: true, desc: "At end of long blackout"),
                (time: new DateTime(2024, 3, 21, 0, 0, 0), expected: false, desc: "After long blackout")
            };

            // Act & Assert
            foreach (var testCase in testTimes)
            {
                var result = IsInBlackoutPeriod(testCase.time);
                Assert.AreEqual(testCase.expected, result, 
                    $"Long duration test '{testCase.desc}' at {testCase.time} failed");
            }
        }

        #endregion

        #region Integration with Scheduling Tests

        [TestMethod]
        public async Task ScheduleWave_DuringBlackout_BlocksScheduling()
        {
            // Arrange
            var blackoutStart = DateTime.Now.AddMinutes(30);
            var blackoutEnd = DateTime.Now.AddMinutes(90);
            var scheduleTime = DateTime.Now.AddMinutes(60); // During blackout

            AddBlackoutPeriod(blackoutStart, blackoutEnd, "Schedule blocking test");

            var wave = CreateTestWave("blackout-blocked-wave");
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
        public async Task RescheduleWave_DuringBlackout_BlocksRescheduling()
        {
            // Arrange
            var initialScheduleTime = DateTime.Now.AddMinutes(120);
            var blackoutStart = DateTime.Now.AddMinutes(30);
            var blackoutEnd = DateTime.Now.AddMinutes(90);
            var newScheduleTime = DateTime.Now.AddMinutes(60); // During blackout

            var wave = CreateTestWave("reschedule-blackout-wave");
            var options = new ScheduleWaveOptions
            {
                ScheduledStartTime = initialScheduleTime
            };

            await _schedulerService.StartAsync();
            var scheduleResult = await _schedulerService.ScheduleWaveAsync(wave, options);
            Assert.IsTrue(scheduleResult.Success);

            // Add blackout after initial scheduling
            AddBlackoutPeriod(blackoutStart, blackoutEnd, "Reschedule blocking test");

            // Act
            var rescheduleResult = await _schedulerService.RescheduleWaveAsync(wave.Id, newScheduleTime);

            // Assert
            Assert.IsFalse(rescheduleResult.Success);
            Assert.IsTrue(rescheduleResult.ErrorMessage.Contains("blackout period"));
        }

        [TestMethod]
        public async Task BatchSchedule_WithBlackouts_AvoidsBlackoutPeriods()
        {
            // Arrange
            var waves = new List<MigrationWaveExtended>
            {
                CreateTestWave("batch-wave-1"),
                CreateTestWave("batch-wave-2"),
                CreateTestWave("batch-wave-3")
            };

            // Create blackout that would interfere with normal scheduling
            var blackoutStart = DateTime.Now.AddHours(2);
            var blackoutEnd = DateTime.Now.AddHours(4);
            AddBlackoutPeriod(blackoutStart, blackoutEnd, "Batch schedule interference");

            var batchOptions = new BatchScheduleOptions
            {
                EarliestStartTime = DateTime.Now.AddHours(1),
                WaveInterval = TimeSpan.FromHours(1), // Would normally put wave 2 in blackout
                MaxConcurrentTasks = 5
            };

            // Mock successful schedule result
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
            Assert.AreEqual(3, result.ScheduledWaves.Count);
            
            // Verify that no waves are scheduled during blackout period
            foreach (var scheduledWave in result.ScheduledWaves)
            {
                Assert.IsFalse(IsInBlackoutPeriod(scheduledWave.ScheduledTime), 
                    $"Wave {scheduledWave.Id} scheduled during blackout period at {scheduledWave.ScheduledTime}");
            }
        }

        #endregion

        #region Performance Tests

        [TestMethod]
        public async Task BlackoutDetection_ManyBlackouts_PerformsWell()
        {
            // Arrange
            var baseTime = new DateTime(2024, 1, 1);
            const int blackoutCount = 1000;

            // Add many blackout periods
            for (int i = 0; i < blackoutCount; i++)
            {
                var start = baseTime.AddHours(i * 24); // One per day
                var end = start.AddHours(2);
                AddBlackoutPeriod(start, end, $"Daily blackout {i}");
            }

            var testTimes = Enumerable.Range(0, 100)
                                    .Select(i => baseTime.AddHours(i * 24 + 1)) // During each blackout
                                    .ToList();

            var stopwatch = System.Diagnostics.Stopwatch.StartNew();

            // Act
            var results = testTimes.Select(IsInBlackoutPeriod).ToList();

            stopwatch.Stop();

            // Assert
            Assert.IsTrue(results.All(r => r), "All test times should be in blackout periods");
            Assert.IsTrue(stopwatch.ElapsedMilliseconds < 1000, // Should complete in under 1 second
                $"Blackout detection with {blackoutCount} periods took {stopwatch.ElapsedMilliseconds}ms");
        }

        #endregion

        #region Helper Methods

        private void AddBlackoutPeriod(DateTime start, DateTime end, string description)
        {
            _schedulerService.AddBlackoutPeriod(new BlackoutPeriod
            {
                Id = Guid.NewGuid().ToString(),
                StartTime = start,
                EndTime = end,
                Description = description,
                Type = BlackoutType.Custom
            });
        }

        private bool IsInBlackoutPeriod(DateTime dateTime)
        {
            // Use reflection to access private method
            var method = typeof(MigrationSchedulerService).GetMethod("IsInBlackoutPeriod", 
                System.Reflection.BindingFlags.NonPublic | System.Reflection.BindingFlags.Instance);
            
            return (bool)method.Invoke(_schedulerService, new object[] { dateTime });
        }

        private DateTime GetNextAvailableTime(DateTime fromTime)
        {
            // Use reflection to access private method
            var method = typeof(MigrationSchedulerService).GetMethod("GetNextAvailableTime", 
                System.Reflection.BindingFlags.NonPublic | System.Reflection.BindingFlags.Instance);
            
            return (DateTime)method.Invoke(_schedulerService, new object[] { fromTime });
        }

        private MigrationWaveExtended CreateTestWave(string waveId)
        {
            return new MigrationWaveExtended
            {
                Id = waveId,
                Name = $"Test Wave {waveId}",
                Description = $"Test wave for blackout testing",
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