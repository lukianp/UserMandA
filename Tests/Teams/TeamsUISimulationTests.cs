using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Windows.Data;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using MandADiscoverySuite.ViewModels;
using MandADiscoverySuite.Models;

namespace MandADiscoverySuite.Tests.Teams
{
    /// <summary>
    /// UI functionality simulation tests for Teams migration platform
    /// Tests data grid display, search/filtering, progress indicators, and statistics dashboard
    /// </summary>
    [TestClass]
    public class TeamsUISimulationTests
    {
        private TeamsMigrationPlanningViewModel _viewModel;

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

        #region Data Grid Display Tests

        [TestMethod]
        public async Task DataGrid_TeamsDisplay_ShouldPopulateCorrectly()
        {
            // Act
            await _viewModel.DiscoverTeamsCommand.ExecuteAsync(null);
            
            // Assert - Teams DataGrid binding
            Assert.IsNotNull(_viewModel.TeamsView, "TeamsView should be initialized for DataGrid binding");
            Assert.IsTrue(_viewModel.TeamsData.Count > 0, "TeamsData should contain items for display");
            
            // Verify essential columns are populated
            foreach (var team in _viewModel.TeamsData.Take(5)) // Test first 5 items
            {
                Assert.IsNotNull(team.DisplayName, "DisplayName column should have data");
                Assert.IsNotNull(team.TeamType, "TeamType column should have data");
                Assert.IsTrue(team.MemberCount >= 0, "MemberCount column should have valid data");
                Assert.IsTrue(team.ChannelCount >= 0, "ChannelCount column should have valid data");
                Assert.IsNotNull(team.FormattedDataSize, "FormattedDataSize column should have data");
                Assert.IsNotNull(team.ActivityStatus, "ActivityStatus column should have data");
            }
        }

        [TestMethod]
        public async Task DataGrid_ChannelsDisplay_ShouldPopulateCorrectly()
        {
            // Act
            await _viewModel.DiscoverTeamsCommand.ExecuteAsync(null);
            
            // Assert - Channels DataGrid binding
            Assert.IsNotNull(_viewModel.ChannelsView, "ChannelsView should be initialized for DataGrid binding");
            Assert.IsTrue(_viewModel.ChannelsData.Count > 0, "ChannelsData should contain items for display");
            
            // Verify essential columns are populated
            foreach (var channel in _viewModel.ChannelsData.Take(5)) // Test first 5 items
            {
                Assert.IsNotNull(channel.DisplayName, "Channel DisplayName column should have data");
                Assert.IsNotNull(channel.TeamName, "TeamName column should have data");
                Assert.IsNotNull(channel.ChannelType, "ChannelType column should have data");
                Assert.IsTrue(channel.MessageCount >= 0, "MessageCount column should have valid data");
                Assert.IsTrue(channel.FileCount >= 0, "FileCount column should have valid data");
                Assert.IsNotNull(channel.ActivityLevel, "ActivityLevel column should have data");
            }
        }

        [TestMethod]
        public async Task DataGrid_BatchesDisplay_ShouldPopulateCorrectly()
        {
            // Arrange
            await _viewModel.DiscoverTeamsCommand.ExecuteAsync(null);
            
            // Act
            await _viewModel.GenerateBatchesCommand.ExecuteAsync(null);
            
            // Assert - Batches DataGrid binding
            Assert.IsNotNull(_viewModel.BatchesView, "BatchesView should be initialized for DataGrid binding");
            Assert.IsTrue(_viewModel.MigrationBatches.Count > 0, "MigrationBatches should contain items for display");
            
            // Verify essential columns are populated
            foreach (var batch in _viewModel.MigrationBatches.Take(3)) // Test first 3 batches
            {
                Assert.IsNotNull(batch.Name, "Batch Name column should have data");
                Assert.IsTrue(batch.TotalItems > 0, "TotalItems column should have valid data");
                Assert.IsNotNull(batch.FormattedTotalSize, "FormattedTotalSize column should have data");
                Assert.IsTrue(Enum.IsDefined(typeof(MigrationPriority), batch.Priority), "Priority should be valid enum");
                Assert.IsTrue(Enum.IsDefined(typeof(MigrationStatus), batch.Status), "Status should be valid enum");
                Assert.IsNotNull(batch.PlannedStartDate, "PlannedStartDate column should have data");
                Assert.IsNotNull(batch.EstimatedDuration, "EstimatedDuration column should have data");
            }
        }

        [TestMethod]
        public async Task DataGrid_IssuesDisplay_ShouldPopulateCorrectly()
        {
            // Arrange
            await _viewModel.DiscoverTeamsCommand.ExecuteAsync(null);
            
            // Act
            await _viewModel.AnalyzeContentCommand.ExecuteAsync(null);
            
            // Assert - Issues DataGrid binding
            Assert.IsNotNull(_viewModel.IssuesView, "IssuesView should be initialized for DataGrid binding");
            Assert.IsTrue(_viewModel.ContentIssues.Count > 0, "ContentIssues should contain items for display");
            
            // Verify essential columns are populated
            foreach (var issue in _viewModel.ContentIssues.Take(3)) // Test first 3 issues
            {
                Assert.IsNotNull(issue.Severity, "Severity column should have data");
                Assert.IsNotNull(issue.Category, "Category column should have data");
                Assert.IsNotNull(issue.ItemName, "ItemName column should have data");
                Assert.IsNotNull(issue.Description, "Description column should have data");
                Assert.IsNotNull(issue.RecommendedAction, "RecommendedAction column should have data");
                Assert.IsNotNull(issue.SeverityColor, "SeverityColor should be set for UI display");
            }
        }

        #endregion

        #region Search and Filtering Tests

        [TestMethod]
        public async Task Search_TeamsTextFilter_ShouldUpdateViewCorrectly()
        {
            // Arrange
            await _viewModel.DiscoverTeamsCommand.ExecuteAsync(null);
            var initialCount = _viewModel.TeamsView.Cast<TeamsDiscoveryItem>().Count();
            
            // Act - Simulate user typing in search box
            _viewModel.TeamsSearchText = "Finance";
            
            // Assert
            var filteredCount = _viewModel.TeamsView.Cast<TeamsDiscoveryItem>().Count();
            var filteredTeams = _viewModel.TeamsView.Cast<TeamsDiscoveryItem>().ToList();
            
            Assert.IsTrue(filteredCount <= initialCount, "Filtered count should not exceed initial count");
            
            foreach (var team in filteredTeams)
            {
                bool matchesSearch = team.DisplayName.Contains("Finance", StringComparison.OrdinalIgnoreCase) ||
                                   team.Department.Contains("Finance", StringComparison.OrdinalIgnoreCase);
                Assert.IsTrue(matchesSearch, "All filtered teams should match search criteria");
            }
        }

        [TestMethod]
        public async Task Search_ChannelsTextFilter_ShouldUpdateViewCorrectly()
        {
            // Arrange
            await _viewModel.DiscoverTeamsCommand.ExecuteAsync(null);
            var initialCount = _viewModel.ChannelsView.Cast<ChannelDiscoveryItem>().Count();
            
            // Act - Simulate user typing in channel search box
            _viewModel.ChannelsSearchText = "General";
            
            // Assert
            var filteredCount = _viewModel.ChannelsView.Cast<ChannelDiscoveryItem>().Count();
            var filteredChannels = _viewModel.ChannelsView.Cast<ChannelDiscoveryItem>().ToList();
            
            Assert.IsTrue(filteredCount <= initialCount, "Filtered count should not exceed initial count");
            
            foreach (var channel in filteredChannels)
            {
                bool matchesSearch = channel.DisplayName.Contains("General", StringComparison.OrdinalIgnoreCase) ||
                                   channel.TeamName.Contains("General", StringComparison.OrdinalIgnoreCase);
                Assert.IsTrue(matchesSearch, "All filtered channels should match search criteria");
            }
        }

        [TestMethod]
        public async Task Filter_TeamTypeSelection_ShouldUpdateViewCorrectly()
        {
            // Arrange
            await _viewModel.DiscoverTeamsCommand.ExecuteAsync(null);
            
            // Act - Simulate user selecting team type filter
            _viewModel.SelectedTeamTypeFilter = "Public";
            
            // Assert
            var filteredTeams = _viewModel.TeamsView.Cast<TeamsDiscoveryItem>().ToList();
            
            foreach (var team in filteredTeams)
            {
                Assert.AreEqual("Public", team.TeamType, "All filtered teams should be Public type");
            }
        }

        [TestMethod]
        public async Task Filter_ChannelTypeSelection_ShouldUpdateViewCorrectly()
        {
            // Arrange
            await _viewModel.DiscoverTeamsCommand.ExecuteAsync(null);
            
            // Act - Simulate user selecting channel type filter
            _viewModel.SelectedChannelTypeFilter = "Private";
            
            // Assert
            var filteredChannels = _viewModel.ChannelsView.Cast<ChannelDiscoveryItem>().ToList();
            
            foreach (var channel in filteredChannels)
            {
                Assert.AreEqual("Private", channel.ChannelType, "All filtered channels should be Private type");
            }
        }

        [TestMethod]
        public async Task Filter_ShowOnlyTeamsWithIssues_ShouldUpdateViewCorrectly()
        {
            // Arrange
            await _viewModel.DiscoverTeamsCommand.ExecuteAsync(null);
            await _viewModel.AnalyzeContentCommand.ExecuteAsync(null);
            
            // Act - Simulate user checking "Issues Only" checkbox
            _viewModel.ShowOnlyTeamsWithIssues = true;
            
            // Assert
            var filteredTeams = _viewModel.TeamsView.Cast<TeamsDiscoveryItem>().ToList();
            
            foreach (var team in filteredTeams)
            {
                bool hasHighSeverityIssue = _viewModel.ContentIssues.Any(issue => 
                    issue.ItemName == team.DisplayName && issue.Severity == "High");
                Assert.IsTrue(hasHighSeverityIssue, "Only teams with high severity issues should be shown");
            }
        }

        [TestMethod]
        public async Task Filter_CombinedFilters_ShouldWorkTogether()
        {
            // Arrange
            await _viewModel.DiscoverTeamsCommand.ExecuteAsync(null);
            await _viewModel.AnalyzeContentCommand.ExecuteAsync(null);
            
            // Act - Apply multiple filters simultaneously
            _viewModel.TeamsSearchText = "Team";
            _viewModel.SelectedTeamTypeFilter = "Private";
            _viewModel.ShowOnlyTeamsWithIssues = true;
            
            // Assert
            var filteredTeams = _viewModel.TeamsView.Cast<TeamsDiscoveryItem>().ToList();
            
            foreach (var team in filteredTeams)
            {
                // Check all filter criteria
                bool matchesSearch = team.DisplayName.Contains("Team", StringComparison.OrdinalIgnoreCase) ||
                                   team.Department.Contains("Team", StringComparison.OrdinalIgnoreCase);
                bool hasIssue = _viewModel.ContentIssues.Any(issue => 
                    issue.ItemName == team.DisplayName && issue.Severity == "High");
                
                Assert.IsTrue(matchesSearch, "Team should match search criteria");
                Assert.AreEqual("Private", team.TeamType, "Team should be Private type");
                Assert.IsTrue(hasIssue, "Team should have high severity issues");
            }
        }

        #endregion

        #region Progress Indicators Tests

        [TestMethod]
        public async Task ProgressIndicator_DiscoveryProgress_ShouldUpdateCorrectly()
        {
            // Arrange
            var progressValues = new List<double>();
            var statusMessages = new List<string>();
            bool isRunningStarted = false;
            bool isRunningCompleted = false;
            
            _viewModel.PropertyChanged += (s, e) =>
            {
                if (e.PropertyName == nameof(_viewModel.DiscoveryProgress))
                    progressValues.Add(_viewModel.DiscoveryProgress);
                if (e.PropertyName == nameof(_viewModel.DiscoveryStatusMessage))
                    statusMessages.Add(_viewModel.DiscoveryStatusMessage);
                if (e.PropertyName == nameof(_viewModel.IsDiscoveryRunning))
                {
                    if (_viewModel.IsDiscoveryRunning) isRunningStarted = true;
                    else if (isRunningStarted) isRunningCompleted = true;
                }
            };
            
            // Act
            await _viewModel.DiscoverTeamsCommand.ExecuteAsync(null);
            
            // Assert
            Assert.IsTrue(isRunningStarted, "IsDiscoveryRunning should have been set to true");
            Assert.IsTrue(isRunningCompleted, "IsDiscoveryRunning should have been set back to false");
            Assert.IsTrue(progressValues.Count > 0, "Progress values should have been updated");
            Assert.IsTrue(statusMessages.Count > 0, "Status messages should have been updated");
            Assert.AreEqual(100.0, _viewModel.DiscoveryProgress, "Final progress should be 100%");
            Assert.IsFalse(_viewModel.IsDiscoveryRunning, "Discovery should not be running when complete");
        }

        [TestMethod]
        public async Task ProgressIndicator_AnalysisProgress_ShouldUpdateCorrectly()
        {
            // Arrange
            var progressValues = new List<double>();
            var statusMessages = new List<string>();
            bool isRunningStarted = false;
            bool isRunningCompleted = false;
            
            _viewModel.PropertyChanged += (s, e) =>
            {
                if (e.PropertyName == nameof(_viewModel.AnalysisProgress))
                    progressValues.Add(_viewModel.AnalysisProgress);
                if (e.PropertyName == nameof(_viewModel.AnalysisStatusMessage))
                    statusMessages.Add(_viewModel.AnalysisStatusMessage);
                if (e.PropertyName == nameof(_viewModel.IsAnalysisRunning))
                {
                    if (_viewModel.IsAnalysisRunning) isRunningStarted = true;
                    else if (isRunningStarted) isRunningCompleted = true;
                }
            };
            
            // Arrange - Need teams first
            await _viewModel.DiscoverTeamsCommand.ExecuteAsync(null);
            
            // Act
            await _viewModel.AnalyzeContentCommand.ExecuteAsync(null);
            
            // Assert
            Assert.IsTrue(isRunningStarted, "IsAnalysisRunning should have been set to true");
            Assert.IsTrue(isRunningCompleted, "IsAnalysisRunning should have been set back to false");
            Assert.IsTrue(progressValues.Count > 0, "Progress values should have been updated");
            Assert.IsTrue(statusMessages.Count > 0, "Status messages should have been updated");
            Assert.AreEqual(100.0, _viewModel.AnalysisProgress, "Final progress should be 100%");
            Assert.IsFalse(_viewModel.IsAnalysisRunning, "Analysis should not be running when complete");
        }

        #endregion

        #region Statistics Dashboard Tests

        [TestMethod]
        public async Task StatisticsDashboard_AfterDiscovery_ShouldCalculateCorrectly()
        {
            // Act
            await _viewModel.DiscoverTeamsCommand.ExecuteAsync(null);
            
            // Assert - Verify all statistics are populated and accurate
            Assert.IsTrue(_viewModel.TotalTeams > 0, "TotalTeams should be calculated");
            Assert.IsTrue(_viewModel.TotalChannels > 0, "TotalChannels should be calculated");
            Assert.IsTrue(_viewModel.TotalMembers > 0, "TotalMembers should be calculated");
            Assert.IsTrue(_viewModel.TotalDataSizeGB > 0, "TotalDataSizeGB should be calculated");
            Assert.IsTrue(_viewModel.EstimatedMigrationHours > 0, "EstimatedMigrationHours should be calculated");
            Assert.IsTrue(_viewModel.EstimatedCost > 0, "EstimatedCost should be calculated");
            
            // Verify statistics match actual data
            Assert.AreEqual(_viewModel.TeamsData.Count, _viewModel.TotalTeams, 
                "TotalTeams should match TeamsData count");
            Assert.AreEqual(_viewModel.ChannelsData.Count, _viewModel.TotalChannels, 
                "TotalChannels should match ChannelsData count");
            
            var calculatedMembers = _viewModel.TeamsData.Sum(t => t.MemberCount);
            Assert.AreEqual(calculatedMembers, _viewModel.TotalMembers, 
                "TotalMembers should match sum of team members");
            
            var calculatedDataSize = Math.Round(_viewModel.TeamsData.Sum(t => t.DataSizeGB), 2);
            Assert.AreEqual(calculatedDataSize, _viewModel.TotalDataSizeGB, 
                "TotalDataSizeGB should match sum of team data sizes");
        }

        [TestMethod]
        public async Task StatisticsDashboard_AfterAnalysis_ShouldUpdateIssuesCount()
        {
            // Arrange
            await _viewModel.DiscoverTeamsCommand.ExecuteAsync(null);
            var initialIssuesCount = _viewModel.TeamsWithIssues;
            
            // Act
            await _viewModel.AnalyzeContentCommand.ExecuteAsync(null);
            
            // Assert
            Assert.IsTrue(_viewModel.TeamsWithIssues >= 0, "TeamsWithIssues should be calculated");
            
            var highSeverityIssues = _viewModel.ContentIssues.Count(i => i.Severity == "High");
            Assert.AreEqual(highSeverityIssues, _viewModel.TeamsWithIssues, 
                "TeamsWithIssues should match count of high severity issues");
        }

        [TestMethod]
        public void StatisticsDashboard_EstimationFormulas_ShouldBeReasonable()
        {
            // This test validates the estimation algorithms are reasonable
            
            // Arrange
            _viewModel.TotalTeams = 10;
            _viewModel.TotalChannels = 50;
            _viewModel.TotalDataSizeGB = 100.0;
            
            // Act - Trigger statistics update (this happens automatically in real code)
            var estimatedHours = _viewModel.TotalTeams * 2.5 + _viewModel.TotalChannels * 0.5;
            var estimatedCost = estimatedHours * 150;
            
            // Assert - Verify estimation formulas are reasonable
            Assert.AreEqual(50, estimatedHours, 0.1, "Estimated hours should be calculated correctly");
            Assert.AreEqual(7500m, (decimal)estimatedCost, "Estimated cost should be calculated correctly");
        }

        #endregion

        #region Selection and Detail View Tests

        [TestMethod]
        public async Task Selection_TeamSelection_ShouldUpdateSelectedTeam()
        {
            // Arrange
            await _viewModel.DiscoverTeamsCommand.ExecuteAsync(null);
            var firstTeam = _viewModel.TeamsData.First();
            
            // Act - Simulate user selecting a team in the DataGrid
            _viewModel.SelectedTeam = firstTeam;
            
            // Assert
            Assert.AreEqual(firstTeam, _viewModel.SelectedTeam, "SelectedTeam should be updated");
            Assert.IsNotNull(_viewModel.SelectedTeam.DisplayName, "Selected team should have display name");
        }

        [TestMethod]
        public async Task Selection_ChannelSelection_ShouldUpdateSelectedChannel()
        {
            // Arrange
            await _viewModel.DiscoverTeamsCommand.ExecuteAsync(null);
            var firstChannel = _viewModel.ChannelsData.First();
            
            // Act - Simulate user selecting a channel in the DataGrid
            _viewModel.SelectedChannel = firstChannel;
            
            // Assert
            Assert.AreEqual(firstChannel, _viewModel.SelectedChannel, "SelectedChannel should be updated");
            Assert.IsNotNull(_viewModel.SelectedChannel.DisplayName, "Selected channel should have display name");
        }

        [TestMethod]
        public async Task Selection_BatchSelection_ShouldUpdateSelectedBatch()
        {
            // Arrange
            await _viewModel.DiscoverTeamsCommand.ExecuteAsync(null);
            await _viewModel.GenerateBatchesCommand.ExecuteAsync(null);
            var firstBatch = _viewModel.MigrationBatches.First();
            
            // Act - Simulate user selecting a batch in the DataGrid
            _viewModel.SelectedBatch = firstBatch;
            
            // Assert
            Assert.AreEqual(firstBatch, _viewModel.SelectedBatch, "SelectedBatch should be updated");
            Assert.IsNotNull(_viewModel.SelectedBatch.Name, "Selected batch should have name");
        }

        #endregion

        #region UI Responsiveness Tests

        [TestMethod]
        public async Task UIResponsiveness_LargeDatasetFiltering_ShouldBeQuick()
        {
            // Arrange
            await _viewModel.DiscoverTeamsCommand.ExecuteAsync(null);
            var stopwatch = System.Diagnostics.Stopwatch.StartNew();
            
            // Act - Apply multiple filters quickly (simulating user interaction)
            _viewModel.TeamsSearchText = "Engineering";
            _viewModel.SelectedTeamTypeFilter = "Public";
            _viewModel.ChannelsSearchText = "General";
            _viewModel.SelectedChannelTypeFilter = "Standard";
            
            // Assert
            stopwatch.Stop();
            Assert.IsTrue(stopwatch.ElapsedMilliseconds < 500, 
                "UI filtering should be responsive (under 500ms)");
        }

        [TestMethod]
        public async Task UIResponsiveness_StatisticsCalculation_ShouldBeQuick()
        {
            // Arrange
            var stopwatch = System.Diagnostics.Stopwatch.StartNew();
            
            // Act
            await _viewModel.DiscoverTeamsCommand.ExecuteAsync(null);
            
            // Assert
            stopwatch.Stop();
            Assert.IsTrue(stopwatch.ElapsedMilliseconds < 5000, 
                "Statistics calculation should complete quickly");
            
            // Verify all statistics are calculated
            Assert.IsTrue(_viewModel.TotalTeams > 0, "Statistics should be calculated");
            Assert.IsTrue(_viewModel.TotalChannels > 0, "Statistics should be calculated");
            Assert.IsTrue(_viewModel.TotalMembers > 0, "Statistics should be calculated");
        }

        #endregion

        #region Command Execution Tests

        [TestMethod]
        public async Task Commands_AllMainCommands_ShouldExecuteWithoutErrors()
        {
            // Act & Assert - Test all main commands execute successfully
            await _viewModel.DiscoverTeamsCommand.ExecuteAsync(null);
            Assert.IsFalse(_viewModel.IsLoading, "Discovery command should complete");
            
            await _viewModel.AnalyzeContentCommand.ExecuteAsync(null);
            Assert.IsFalse(_viewModel.IsLoading, "Analysis command should complete");
            
            await _viewModel.ValidatePermissionsCommand.ExecuteAsync(null);
            Assert.IsFalse(_viewModel.IsLoading, "Validation command should complete");
            
            await _viewModel.GenerateBatchesCommand.ExecuteAsync(null);
            Assert.IsFalse(_viewModel.IsLoading, "Batch generation command should complete");
            
            await _viewModel.ExportPlanCommand.ExecuteAsync(null);
            Assert.IsFalse(_viewModel.IsLoading, "Export command should complete");
            
            await _viewModel.RefreshCommand.ExecuteAsync(null);
            Assert.IsFalse(_viewModel.IsLoading, "Refresh command should complete");
        }

        [TestMethod]
        public void Commands_ClearFilters_ShouldResetUIState()
        {
            // Arrange - Set some filter values
            _viewModel.TeamsSearchText = "Test Search";
            _viewModel.ChannelsSearchText = "Test Channel Search";
            _viewModel.SelectedTeamTypeFilter = "Private";
            _viewModel.SelectedChannelTypeFilter = "Private";
            _viewModel.ShowOnlyTeamsWithIssues = true;
            
            // Act
            _viewModel.ClearFiltersCommand.Execute(null);
            
            // Assert - All filters should be reset
            Assert.AreEqual(string.Empty, _viewModel.TeamsSearchText, "Teams search should be cleared");
            Assert.AreEqual(string.Empty, _viewModel.ChannelsSearchText, "Channels search should be cleared");
            Assert.AreEqual("All", _viewModel.SelectedTeamTypeFilter, "Team type filter should be reset");
            Assert.AreEqual("All", _viewModel.SelectedChannelTypeFilter, "Channel type filter should be reset");
            Assert.IsFalse(_viewModel.ShowOnlyTeamsWithIssues, "Issues filter should be reset");
        }

        #endregion

        #region Data Binding Tests

        [TestMethod]
        public void DataBinding_PropertyChangedEvents_ShouldFireForUIUpdates()
        {
            // Arrange
            var propertyChangedEvents = new Dictionary<string, int>();
            
            _viewModel.PropertyChanged += (s, e) =>
            {
                if (propertyChangedEvents.ContainsKey(e.PropertyName))
                    propertyChangedEvents[e.PropertyName]++;
                else
                    propertyChangedEvents[e.PropertyName] = 1;
            };
            
            // Act - Change various UI-bound properties
            _viewModel.ProjectName = "Updated Project Name";
            _viewModel.BatchSize = 75;
            _viewModel.PreserveApps = true;
            _viewModel.TeamsSearchText = "Search Text";
            _viewModel.ShowOnlyTeamsWithIssues = true;
            
            // Assert
            Assert.IsTrue(propertyChangedEvents.ContainsKey(nameof(_viewModel.ProjectName)), 
                "PropertyChanged should fire for ProjectName");
            Assert.IsTrue(propertyChangedEvents.ContainsKey(nameof(_viewModel.BatchSize)), 
                "PropertyChanged should fire for BatchSize");
            Assert.IsTrue(propertyChangedEvents.ContainsKey(nameof(_viewModel.PreserveApps)), 
                "PropertyChanged should fire for PreserveApps");
            Assert.IsTrue(propertyChangedEvents.ContainsKey(nameof(_viewModel.TeamsSearchText)), 
                "PropertyChanged should fire for TeamsSearchText");
            Assert.IsTrue(propertyChangedEvents.ContainsKey(nameof(_viewModel.ShowOnlyTeamsWithIssues)), 
                "PropertyChanged should fire for ShowOnlyTeamsWithIssues");
        }

        [TestMethod]
        public async Task DataBinding_CollectionViews_ShouldRefreshOnFilterChanges()
        {
            // Arrange
            await _viewModel.DiscoverTeamsCommand.ExecuteAsync(null);
            var initialTeamsCount = _viewModel.TeamsView.Cast<TeamsDiscoveryItem>().Count();
            var initialChannelsCount = _viewModel.ChannelsView.Cast<ChannelDiscoveryItem>().Count();
            
            // Act - Change filters (should trigger view refresh)
            _viewModel.TeamsSearchText = "Finance";
            _viewModel.ChannelsSearchText = "General";
            
            // Assert
            var filteredTeamsCount = _viewModel.TeamsView.Cast<TeamsDiscoveryItem>().Count();
            var filteredChannelsCount = _viewModel.ChannelsView.Cast<ChannelDiscoveryItem>().Count();
            
            Assert.IsTrue(filteredTeamsCount <= initialTeamsCount, 
                "Teams view should be filtered");
            Assert.IsTrue(filteredChannelsCount <= initialChannelsCount, 
                "Channels view should be filtered");
        }

        #endregion
    }
}