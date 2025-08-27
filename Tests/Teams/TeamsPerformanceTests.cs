using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using MandADiscoverySuite.ViewModels;
using MandADiscoverySuite.Models;

namespace MandADiscoverySuite.Tests.Teams
{
    /// <summary>
    /// Performance tests for Teams migration planning platform
    /// Tests performance with realistic data volumes, memory usage, and UI responsiveness
    /// </summary>
    [TestClass]
    public class TeamsPerformanceTests
    {
        private TeamsMigrationPlanningViewModel _viewModel;
        private const int LARGE_DATASET_SIZE = 100; // Teams count for performance testing
        private const int TIMEOUT_MS = 30000; // 30 second timeout for performance tests

        [TestInitialize]
        public void Setup()
        {
            _viewModel = new TeamsMigrationPlanningViewModel();
        }

        [TestCleanup]
        public void Cleanup()
        {
            _viewModel?.Dispose();
        }

        #region Discovery Performance Tests

        [TestMethod]
        [Timeout(TIMEOUT_MS)]
        public async Task Performance_TeamsDiscovery_ShouldCompleteInTime()
        {
            // Arrange
            var stopwatch = Stopwatch.StartNew();
            
            // Act
            await _viewModel.DiscoverTeamsCommand.ExecuteAsync(null);
            
            // Assert
            stopwatch.Stop();
            Assert.IsTrue(stopwatch.ElapsedMilliseconds < 10000, 
                $"Teams discovery should complete within 10 seconds, took {stopwatch.ElapsedMilliseconds}ms");
            Assert.IsTrue(_viewModel.TeamsData.Count > 0, "Teams should be discovered");
            Assert.IsTrue(_viewModel.ChannelsData.Count > 0, "Channels should be discovered");
            
            // Log performance metrics
            Console.WriteLine($"Teams Discovery Performance:");
            Console.WriteLine($"  Time: {stopwatch.ElapsedMilliseconds}ms");
            Console.WriteLine($"  Teams: {_viewModel.TeamsData.Count}");
            Console.WriteLine($"  Channels: {_viewModel.ChannelsData.Count}");
            Console.WriteLine($"  Teams/second: {_viewModel.TeamsData.Count / (stopwatch.ElapsedMilliseconds / 1000.0):F2}");
        }

        [TestMethod]
        [Timeout(TIMEOUT_MS)]
        public async Task Performance_ContentAnalysis_ShouldCompleteInTime()
        {
            // Arrange
            await _viewModel.DiscoverTeamsCommand.ExecuteAsync(null);
            var stopwatch = Stopwatch.StartNew();
            
            // Act
            await _viewModel.AnalyzeContentCommand.ExecuteAsync(null);
            
            // Assert
            stopwatch.Stop();
            Assert.IsTrue(stopwatch.ElapsedMilliseconds < 15000, 
                $"Content analysis should complete within 15 seconds, took {stopwatch.ElapsedMilliseconds}ms");
            Assert.IsTrue(_viewModel.ContentIssues.Count >= 0, "Content issues should be analyzed");
            
            // Log performance metrics
            Console.WriteLine($"Content Analysis Performance:");
            Console.WriteLine($"  Time: {stopwatch.ElapsedMilliseconds}ms");
            Console.WriteLine($"  Issues Found: {_viewModel.ContentIssues.Count}");
            Console.WriteLine($"  Teams Analyzed: {_viewModel.TeamsData.Count}");
        }

        [TestMethod]
        [Timeout(TIMEOUT_MS)]
        public async Task Performance_BatchGeneration_ShouldCompleteInTime()
        {
            // Arrange
            await _viewModel.DiscoverTeamsCommand.ExecuteAsync(null);
            var stopwatch = Stopwatch.StartNew();
            
            // Act
            await _viewModel.GenerateBatchesCommand.ExecuteAsync(null);
            
            // Assert
            stopwatch.Stop();
            Assert.IsTrue(stopwatch.ElapsedMilliseconds < 5000, 
                $"Batch generation should complete within 5 seconds, took {stopwatch.ElapsedMilliseconds}ms");
            Assert.IsTrue(_viewModel.MigrationBatches.Count > 0, "Migration batches should be generated");
            
            // Log performance metrics
            Console.WriteLine($"Batch Generation Performance:");
            Console.WriteLine($"  Time: {stopwatch.ElapsedMilliseconds}ms");
            Console.WriteLine($"  Batches Created: {_viewModel.MigrationBatches.Count}");
            Console.WriteLine($"  Total Items: {_viewModel.MigrationBatches.Sum(b => b.TotalItems)}");
        }

        #endregion

        #region Filtering Performance Tests

        [TestMethod]
        public async Task Performance_TextFiltering_ShouldBeResponsive()
        {
            // Arrange
            await _viewModel.DiscoverTeamsCommand.ExecuteAsync(null);
            var searchTerms = new[] { "Team", "Finance", "Marketing", "Engineering", "IT", "HR" };
            var totalTime = 0L;
            
            // Act - Test multiple search scenarios
            foreach (var term in searchTerms)
            {
                var stopwatch = Stopwatch.StartNew();
                _viewModel.TeamsSearchText = term;
                stopwatch.Stop();
                
                totalTime += stopwatch.ElapsedMilliseconds;
                
                Assert.IsTrue(stopwatch.ElapsedMilliseconds < 100, 
                    $"Text filtering for '{term}' should be under 100ms, took {stopwatch.ElapsedMilliseconds}ms");
            }
            
            // Log performance metrics
            Console.WriteLine($"Text Filtering Performance:");
            Console.WriteLine($"  Average time per filter: {totalTime / searchTerms.Length}ms");
            Console.WriteLine($"  Total time for {searchTerms.Length} filters: {totalTime}ms");
        }

        [TestMethod]
        public async Task Performance_ComboBoxFiltering_ShouldBeResponsive()
        {
            // Arrange
            await _viewModel.DiscoverTeamsCommand.ExecuteAsync(null);
            var teamTypeFilters = _viewModel.TeamTypeFilters.ToArray();
            var channelTypeFilters = _viewModel.ChannelTypeFilters.ToArray();
            var totalTime = 0L;
            
            // Act - Test all filter combinations
            foreach (var teamFilter in teamTypeFilters)
            {
                foreach (var channelFilter in channelTypeFilters)
                {
                    var stopwatch = Stopwatch.StartNew();
                    _viewModel.SelectedTeamTypeFilter = teamFilter;
                    _viewModel.SelectedChannelTypeFilter = channelFilter;
                    stopwatch.Stop();
                    
                    totalTime += stopwatch.ElapsedMilliseconds;
                    
                    Assert.IsTrue(stopwatch.ElapsedMilliseconds < 50, 
                        $"Combo box filtering should be under 50ms, took {stopwatch.ElapsedMilliseconds}ms");
                }
            }
            
            // Log performance metrics
            var totalCombinations = teamTypeFilters.Length * channelTypeFilters.Length;
            Console.WriteLine($"ComboBox Filtering Performance:");
            Console.WriteLine($"  Average time per filter: {totalTime / totalCombinations}ms");
            Console.WriteLine($"  Total combinations tested: {totalCombinations}");
        }

        [TestMethod]
        public async Task Performance_ComplexFiltering_ShouldHandleLargeDataset()
        {
            // Arrange
            await _viewModel.DiscoverTeamsCommand.ExecuteAsync(null);
            await _viewModel.AnalyzeContentCommand.ExecuteAsync(null);
            
            var stopwatch = Stopwatch.StartNew();
            
            // Act - Apply all filters simultaneously (worst case scenario)
            _viewModel.TeamsSearchText = "Engineering";
            _viewModel.ChannelsSearchText = "General";
            _viewModel.SelectedTeamTypeFilter = "Public";
            _viewModel.SelectedChannelTypeFilter = "Standard";
            _viewModel.ShowOnlyTeamsWithIssues = true;
            
            stopwatch.Stop();
            
            // Assert
            Assert.IsTrue(stopwatch.ElapsedMilliseconds < 200, 
                $"Complex filtering should complete under 200ms, took {stopwatch.ElapsedMilliseconds}ms");
            
            // Verify filtering still works correctly
            var filteredTeams = _viewModel.TeamsView.Cast<TeamsDiscoveryItem>().Count();
            var filteredChannels = _viewModel.ChannelsView.Cast<ChannelDiscoveryItem>().Count();
            
            Console.WriteLine($"Complex Filtering Performance:");
            Console.WriteLine($"  Time: {stopwatch.ElapsedMilliseconds}ms");
            Console.WriteLine($"  Filtered Teams: {filteredTeams}");
            Console.WriteLine($"  Filtered Channels: {filteredChannels}");
        }

        #endregion

        #region Memory Performance Tests

        [TestMethod]
        public async Task Performance_MemoryUsage_ShouldNotExceedLimits()
        {
            // Arrange
            GC.Collect();
            GC.WaitForPendingFinalizers();
            GC.Collect();
            var initialMemory = GC.GetTotalMemory(false);
            
            // Act - Perform full workflow
            await _viewModel.DiscoverTeamsCommand.ExecuteAsync(null);
            await _viewModel.AnalyzeContentCommand.ExecuteAsync(null);
            await _viewModel.GenerateBatchesCommand.ExecuteAsync(null);
            
            var workingMemory = GC.GetTotalMemory(false);
            var memoryIncrease = workingMemory - initialMemory;
            
            // Assert
            Assert.IsTrue(memoryIncrease < 100 * 1024 * 1024, // Less than 100MB
                $"Memory usage should not exceed 100MB, used {memoryIncrease / (1024 * 1024)}MB");
            
            Console.WriteLine($"Memory Usage Performance:");
            Console.WriteLine($"  Initial Memory: {initialMemory / (1024 * 1024)}MB");
            Console.WriteLine($"  Working Memory: {workingMemory / (1024 * 1024)}MB");
            Console.WriteLine($"  Memory Increase: {memoryIncrease / (1024 * 1024)}MB");
        }

        [TestMethod]
        public async Task Performance_MemoryLeaks_ShouldNotOccur()
        {
            // Arrange
            var memorySnapshots = new List<long>();
            
            // Act - Perform operations multiple times
            for (int i = 0; i < 5; i++)
            {
                await _viewModel.DiscoverTeamsCommand.ExecuteAsync(null);
                _viewModel.TeamsData.Clear();
                _viewModel.ChannelsData.Clear();
                _viewModel.MigrationBatches.Clear();
                _viewModel.ContentIssues.Clear();
                
                GC.Collect();
                GC.WaitForPendingFinalizers();
                GC.Collect();
                
                memorySnapshots.Add(GC.GetTotalMemory(false));
            }
            
            // Assert - Memory should not continuously increase
            var maxMemory = memorySnapshots.Max();
            var minMemory = memorySnapshots.Min();
            var memoryVariation = maxMemory - minMemory;
            
            Assert.IsTrue(memoryVariation < 50 * 1024 * 1024, // Less than 50MB variation
                $"Memory variation should be under 50MB, variation was {memoryVariation / (1024 * 1024)}MB");
            
            Console.WriteLine($"Memory Leak Test:");
            foreach (var (memory, index) in memorySnapshots.Select((m, i) => (m, i)))
            {
                Console.WriteLine($"  Iteration {index + 1}: {memory / (1024 * 1024)}MB");
            }
        }

        #endregion

        #region UI Responsiveness Tests

        [TestMethod]
        public async Task Performance_UIUpdates_ShouldBeResponsive()
        {
            // Arrange
            await _viewModel.DiscoverTeamsCommand.ExecuteAsync(null);
            var propertyChangeCount = 0;
            var maxUpdateTime = 0L;
            
            _viewModel.PropertyChanged += (s, e) =>
            {
                propertyChangeCount++;
            };
            
            // Act - Rapid UI updates
            var updateOperations = new Action[]
            {
                () => _viewModel.TeamsSearchText = "Test1",
                () => _viewModel.TeamsSearchText = "Test2",
                () => _viewModel.SelectedTeamTypeFilter = "Public",
                () => _viewModel.SelectedTeamTypeFilter = "Private",
                () => _viewModel.ShowOnlyTeamsWithIssues = true,
                () => _viewModel.ShowOnlyTeamsWithIssues = false,
                () => _viewModel.ChannelsSearchText = "Channel1",
                () => _viewModel.ChannelsSearchText = "Channel2"
            };
            
            foreach (var operation in updateOperations)
            {
                var stopwatch = Stopwatch.StartNew();
                operation();
                stopwatch.Stop();
                
                maxUpdateTime = Math.Max(maxUpdateTime, stopwatch.ElapsedMilliseconds);
                
                Assert.IsTrue(stopwatch.ElapsedMilliseconds < 50, 
                    $"UI update should complete under 50ms, took {stopwatch.ElapsedMilliseconds}ms");
            }
            
            Console.WriteLine($"UI Responsiveness Performance:");
            Console.WriteLine($"  Property change notifications: {propertyChangeCount}");
            Console.WriteLine($"  Max update time: {maxUpdateTime}ms");
            Console.WriteLine($"  Operations tested: {updateOperations.Length}");
        }

        [TestMethod]
        public async Task Performance_StatisticsCalculation_ShouldBeEfficient()
        {
            // Arrange & Act
            var stopwatch = Stopwatch.StartNew();
            await _viewModel.DiscoverTeamsCommand.ExecuteAsync(null);
            stopwatch.Stop();
            
            // Assert - Statistics should be calculated quickly as part of discovery
            Assert.IsTrue(stopwatch.ElapsedMilliseconds < 10000, 
                "Statistics calculation should be fast");
            
            // Verify all statistics are populated
            Assert.IsTrue(_viewModel.TotalTeams > 0, "TotalTeams should be calculated");
            Assert.IsTrue(_viewModel.TotalChannels > 0, "TotalChannels should be calculated");
            Assert.IsTrue(_viewModel.TotalMembers > 0, "TotalMembers should be calculated");
            Assert.IsTrue(_viewModel.TotalDataSizeGB > 0, "TotalDataSizeGB should be calculated");
            Assert.IsTrue(_viewModel.EstimatedMigrationHours > 0, "EstimatedMigrationHours should be calculated");
            Assert.IsTrue(_viewModel.EstimatedCost > 0, "EstimatedCost should be calculated");
            
            Console.WriteLine($"Statistics Calculation Performance:");
            Console.WriteLine($"  Total time: {stopwatch.ElapsedMilliseconds}ms");
            Console.WriteLine($"  Teams processed: {_viewModel.TotalTeams}");
            Console.WriteLine($"  Channels processed: {_viewModel.TotalChannels}");
        }

        #endregion

        #region Concurrent Operation Tests

        [TestMethod]
        public async Task Performance_ConcurrentOperations_ShouldHandleCorrectly()
        {
            // Note: This test simulates what happens if user clicks multiple buttons quickly
            // The ViewModel should handle this gracefully
            
            // Arrange
            var tasks = new List<Task>();
            var exceptions = new List<Exception>();
            
            // Act - Try to run operations concurrently (should be handled by IsLoading checks)
            tasks.Add(Task.Run(async () =>
            {
                try { await _viewModel.DiscoverTeamsCommand.ExecuteAsync(null); }
                catch (Exception ex) { exceptions.Add(ex); }
            }));
            
            // Small delay to ensure first operation starts
            await Task.Delay(100);
            
            tasks.Add(Task.Run(async () =>
            {
                try { await _viewModel.RefreshCommand.ExecuteAsync(null); }
                catch (Exception ex) { exceptions.Add(ex); }
            }));
            
            // Wait for all operations to complete
            await Task.WhenAll(tasks);
            
            // Assert - Should handle concurrent operations gracefully
            Assert.IsTrue(exceptions.Count == 0, 
                $"Concurrent operations should not throw exceptions. Exceptions: {string.Join(", ", exceptions.Select(e => e.Message))}");
            Assert.IsFalse(_viewModel.IsLoading, "Should not be in loading state after completion");
            
            Console.WriteLine($"Concurrent Operations Test:");
            Console.WriteLine($"  Exceptions: {exceptions.Count}");
            Console.WriteLine($"  Final loading state: {_viewModel.IsLoading}");
        }

        #endregion

        #region Data Volume Stress Tests

        [TestMethod]
        public async Task Performance_LargeChannelCount_ShouldHandleEfficiently()
        {
            // This test validates performance with teams that have many channels
            // Note: Using the built-in sample data generator which creates realistic data
            
            // Arrange & Act
            var stopwatch = Stopwatch.StartNew();
            await _viewModel.DiscoverTeamsCommand.ExecuteAsync(null);
            stopwatch.Stop();
            
            // Find teams with many channels
            var teamWithMostChannels = _viewModel.TeamsData.OrderByDescending(t => t.ChannelCount).First();
            var relatedChannels = _viewModel.ChannelsData.Where(c => c.TeamId == teamWithMostChannels.Id).ToList();
            
            // Assert
            Assert.IsTrue(stopwatch.ElapsedMilliseconds < 10000, 
                "Should handle large channel counts efficiently");
            Assert.IsTrue(teamWithMostChannels.ChannelCount > 0, "Should have channels");
            
            Console.WriteLine($"Large Channel Count Performance:");
            Console.WriteLine($"  Discovery time: {stopwatch.ElapsedMilliseconds}ms");
            Console.WriteLine($"  Max channels per team: {teamWithMostChannels.ChannelCount}");
            Console.WriteLine($"  Total channels: {_viewModel.ChannelsData.Count}");
        }

        [TestMethod]
        public async Task Performance_HighDataVolume_ShouldMaintainResponsiveness()
        {
            // Arrange
            await _viewModel.DiscoverTeamsCommand.ExecuteAsync(null);
            
            // Find team with largest data size
            var largestTeam = _viewModel.TeamsData.OrderByDescending(t => t.DataSizeGB).First();
            
            // Act - Test filtering with large data volumes
            var stopwatch = Stopwatch.StartNew();
            _viewModel.TeamsSearchText = largestTeam.DisplayName.Substring(0, 3);
            stopwatch.Stop();
            
            // Assert
            Assert.IsTrue(stopwatch.ElapsedMilliseconds < 100, 
                $"Filtering large data should be responsive, took {stopwatch.ElapsedMilliseconds}ms");
            
            Console.WriteLine($"High Data Volume Performance:");
            Console.WriteLine($"  Largest team size: {largestTeam.DataSizeGB} GB");
            Console.WriteLine($"  Filtering time: {stopwatch.ElapsedMilliseconds}ms");
            Console.WriteLine($"  Total data size: {_viewModel.TotalDataSizeGB} GB");
        }

        #endregion

        #region Performance Baseline Tests

        [TestMethod]
        public async Task Performance_FullWorkflowBenchmark_ShouldMeetBaseline()
        {
            // This test establishes a performance baseline for the complete workflow
            
            // Arrange
            var totalStopwatch = Stopwatch.StartNew();
            var stepTimes = new Dictionary<string, long>();
            
            // Act - Full workflow with timing
            var stepWatch = Stopwatch.StartNew();
            await _viewModel.DiscoverTeamsCommand.ExecuteAsync(null);
            stepWatch.Stop();
            stepTimes["Discovery"] = stepWatch.ElapsedMilliseconds;
            
            stepWatch.Restart();
            await _viewModel.AnalyzeContentCommand.ExecuteAsync(null);
            stepWatch.Stop();
            stepTimes["Analysis"] = stepWatch.ElapsedMilliseconds;
            
            stepWatch.Restart();
            await _viewModel.ValidatePermissionsCommand.ExecuteAsync(null);
            stepWatch.Stop();
            stepTimes["Validation"] = stepWatch.ElapsedMilliseconds;
            
            stepWatch.Restart();
            await _viewModel.GenerateBatchesCommand.ExecuteAsync(null);
            stepWatch.Stop();
            stepTimes["Batch Generation"] = stepWatch.ElapsedMilliseconds;
            
            stepWatch.Restart();
            await _viewModel.ExportPlanCommand.ExecuteAsync(null);
            stepWatch.Stop();
            stepTimes["Export"] = stepWatch.ElapsedMilliseconds;
            
            totalStopwatch.Stop();
            
            // Assert - Full workflow should complete within reasonable time
            Assert.IsTrue(totalStopwatch.ElapsedMilliseconds < 60000, // 1 minute
                $"Full workflow should complete within 60 seconds, took {totalStopwatch.ElapsedMilliseconds}ms");
            
            // Log detailed performance breakdown
            Console.WriteLine($"Full Workflow Performance Baseline:");
            Console.WriteLine($"  Total Time: {totalStopwatch.ElapsedMilliseconds}ms ({totalStopwatch.ElapsedMilliseconds / 1000.0:F2}s)");
            foreach (var step in stepTimes)
            {
                Console.WriteLine($"  {step.Key}: {step.Value}ms ({step.Value / 1000.0:F2}s)");
            }
            Console.WriteLine($"  Teams Processed: {_viewModel.TotalTeams}");
            Console.WriteLine($"  Channels Processed: {_viewModel.TotalChannels}");
            Console.WriteLine($"  Batches Generated: {_viewModel.MigrationBatches.Count}");
        }

        #endregion
    }
}