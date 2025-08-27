using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using MandADiscoverySuite.ViewModels;
using MandADiscoverySuite.Models;
using System.Collections.ObjectModel;
using System.Windows.Data;

namespace MandADiscoverySuite.Tests.Teams
{
    /// <summary>
    /// Comprehensive unit tests for TeamsMigrationPlanningViewModel
    /// Tests Teams discovery functionality, channel analysis, migration batch generation, and validation
    /// </summary>
    [TestClass]
    public class TeamsMigrationPlanningViewModelTests
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

        #region Constructor and Initialization Tests

        [TestMethod]
        public void Constructor_ShouldInitializeAllCollections()
        {
            // Act & Assert
            Assert.IsNotNull(_viewModel.TeamsData, "TeamsData should be initialized");
            Assert.IsNotNull(_viewModel.ChannelsData, "ChannelsData should be initialized");
            Assert.IsNotNull(_viewModel.MigrationBatches, "MigrationBatches should be initialized");
            Assert.IsNotNull(_viewModel.ContentIssues, "ContentIssues should be initialized");
        }

        [TestMethod]
        public void Constructor_ShouldInitializeDefaultValues()
        {
            // Assert
            Assert.AreEqual("Teams Migration Project", _viewModel.ProjectName);
            Assert.AreEqual("contoso.onmicrosoft.com", _viewModel.SourceTenant);
            Assert.AreEqual("fabrikam.onmicrosoft.com", _viewModel.TargetTenant);
            Assert.AreEqual(50, _viewModel.BatchSize);
            Assert.AreEqual(3, _viewModel.MaxConcurrentMigrations);
            Assert.IsTrue(_viewModel.PreserveTeamSettings);
            Assert.IsTrue(_viewModel.PreserveChannelSettings);
            Assert.IsTrue(_viewModel.PreserveConversations);
            Assert.IsTrue(_viewModel.PreserveFiles);
            Assert.IsTrue(_viewModel.PreserveTabs);
            Assert.IsFalse(_viewModel.PreserveApps);
        }

        [TestMethod]
        public void Constructor_ShouldInitializeCommands()
        {
            // Assert
            Assert.IsNotNull(_viewModel.DiscoverTeamsCommand, "DiscoverTeamsCommand should be initialized");
            Assert.IsNotNull(_viewModel.AnalyzeContentCommand, "AnalyzeContentCommand should be initialized");
            Assert.IsNotNull(_viewModel.ValidatePermissionsCommand, "ValidatePermissionsCommand should be initialized");
            Assert.IsNotNull(_viewModel.GenerateBatchesCommand, "GenerateBatchesCommand should be initialized");
            Assert.IsNotNull(_viewModel.ExportPlanCommand, "ExportPlanCommand should be initialized");
            Assert.IsNotNull(_viewModel.RefreshCommand, "RefreshCommand should be initialized");
            Assert.IsNotNull(_viewModel.ClearFiltersCommand, "ClearFiltersCommand should be initialized");
        }

        [TestMethod]
        public void Constructor_ShouldInitializeFilterCollections()
        {
            // Assert
            Assert.IsNotNull(_viewModel.TeamTypeFilters, "TeamTypeFilters should be initialized");
            Assert.IsNotNull(_viewModel.ChannelTypeFilters, "ChannelTypeFilters should be initialized");
            Assert.IsTrue(_viewModel.TeamTypeFilters.Contains("All"));
            Assert.IsTrue(_viewModel.TeamTypeFilters.Contains("Public"));
            Assert.IsTrue(_viewModel.TeamTypeFilters.Contains("Private"));
            Assert.IsTrue(_viewModel.ChannelTypeFilters.Contains("All"));
            Assert.IsTrue(_viewModel.ChannelTypeFilters.Contains("Standard"));
            Assert.IsTrue(_viewModel.ChannelTypeFilters.Contains("Private"));
        }

        #endregion

        #region Property Tests

        [TestMethod]
        public void ProjectName_SetAndGet_ShouldUpdateCorrectly()
        {
            // Arrange
            var newProjectName = "Updated Teams Migration";
            
            // Act
            _viewModel.ProjectName = newProjectName;
            
            // Assert
            Assert.AreEqual(newProjectName, _viewModel.ProjectName);
        }

        [TestMethod]
        public void BatchSize_SetValidValue_ShouldUpdate()
        {
            // Arrange & Act
            _viewModel.BatchSize = 25;
            
            // Assert
            Assert.AreEqual(25, _viewModel.BatchSize);
        }

        [TestMethod]
        public void PlannedDates_SetValidDates_ShouldUpdate()
        {
            // Arrange
            var startDate = DateTime.Now.AddDays(10);
            var endDate = DateTime.Now.AddDays(40);
            
            // Act
            _viewModel.PlannedStartDate = startDate;
            _viewModel.PlannedEndDate = endDate;
            
            // Assert
            Assert.AreEqual(startDate, _viewModel.PlannedStartDate);
            Assert.AreEqual(endDate, _viewModel.PlannedEndDate);
        }

        #endregion

        #region Teams Discovery Tests

        [TestMethod]
        public async Task DiscoverTeamsAsync_ShouldPopulateTeamsAndChannels()
        {
            // Act
            await _viewModel.DiscoverTeamsCommand.ExecuteAsync(null);
            
            // Assert
            Assert.IsTrue(_viewModel.TeamsData.Count > 0, "Teams should be discovered");
            Assert.IsTrue(_viewModel.ChannelsData.Count > 0, "Channels should be discovered");
            Assert.IsFalse(_viewModel.IsDiscoveryRunning, "Discovery should be completed");
        }

        [TestMethod]
        public async Task DiscoverTeamsAsync_ShouldUpdateStatistics()
        {
            // Act
            await _viewModel.DiscoverTeamsCommand.ExecuteAsync(null);
            
            // Assert
            Assert.AreEqual(_viewModel.TeamsData.Count, _viewModel.TotalTeams);
            Assert.AreEqual(_viewModel.ChannelsData.Count, _viewModel.TotalChannels);
            Assert.IsTrue(_viewModel.TotalMembers > 0, "Total members should be calculated");
            Assert.IsTrue(_viewModel.TotalDataSizeGB > 0, "Total data size should be calculated");
            Assert.IsTrue(_viewModel.EstimatedMigrationHours > 0, "Estimated hours should be calculated");
            Assert.IsTrue(_viewModel.EstimatedCost > 0, "Estimated cost should be calculated");
        }

        [TestMethod]
        public async Task DiscoverTeamsAsync_ShouldSetProgressIndicators()
        {
            // Arrange
            bool progressStarted = false;
            bool progressCompleted = false;
            
            _viewModel.PropertyChanged += (s, e) =>
            {
                if (e.PropertyName == nameof(_viewModel.IsDiscoveryRunning))
                {
                    if (_viewModel.IsDiscoveryRunning) progressStarted = true;
                    else if (progressStarted) progressCompleted = true;
                }
            };
            
            // Act
            await _viewModel.DiscoverTeamsCommand.ExecuteAsync(null);
            
            // Assert
            Assert.IsTrue(progressStarted, "Progress should have started");
            Assert.IsTrue(progressCompleted, "Progress should have completed");
        }

        #endregion

        #region Content Analysis Tests

        [TestMethod]
        public async Task AnalyzeContentAsync_ShouldGenerateContentIssues()
        {
            // Arrange
            await _viewModel.DiscoverTeamsCommand.ExecuteAsync(null);
            
            // Act
            await _viewModel.AnalyzeContentCommand.ExecuteAsync(null);
            
            // Assert
            Assert.IsTrue(_viewModel.ContentIssues.Count > 0, "Content issues should be generated");
            Assert.IsFalse(_viewModel.IsAnalysisRunning, "Analysis should be completed");
        }

        [TestMethod]
        public async Task AnalyzeContentAsync_ShouldUpdateIssuesStatistics()
        {
            // Arrange
            await _viewModel.DiscoverTeamsCommand.ExecuteAsync(null);
            
            // Act
            await _viewModel.AnalyzeContentCommand.ExecuteAsync(null);
            
            // Assert
            var highSeverityIssues = _viewModel.ContentIssues.Count(i => i.Severity == "High");
            Assert.AreEqual(highSeverityIssues, _viewModel.TeamsWithIssues);
        }

        #endregion

        #region Migration Batch Generation Tests

        [TestMethod]
        public async Task GenerateBatchesAsync_ShouldCreateBatches()
        {
            // Arrange
            await _viewModel.DiscoverTeamsCommand.ExecuteAsync(null);
            
            // Act
            await _viewModel.GenerateBatchesCommand.ExecuteAsync(null);
            
            // Assert
            Assert.IsTrue(_viewModel.MigrationBatches.Count > 0, "Migration batches should be created");
        }

        [TestMethod]
        public async Task GenerateBatchesAsync_ShouldRespectBatchSize()
        {
            // Arrange
            _viewModel.BatchSize = 10;
            await _viewModel.DiscoverTeamsCommand.ExecuteAsync(null);
            
            // Act
            await _viewModel.GenerateBatchesCommand.ExecuteAsync(null);
            
            // Assert
            foreach (var batch in _viewModel.MigrationBatches)
            {
                Assert.IsTrue(batch.Items.Count <= 10, "Batch size should not exceed configured limit");
            }
        }

        [TestMethod]
        public async Task GenerateBatchesAsync_ShouldGroupByDepartment()
        {
            // Arrange
            await _viewModel.DiscoverTeamsCommand.ExecuteAsync(null);
            
            // Act
            await _viewModel.GenerateBatchesCommand.ExecuteAsync(null);
            
            // Assert
            var departmentBatches = _viewModel.MigrationBatches
                .Where(b => b.Name.Contains("Finance") || b.Name.Contains("Marketing") || b.Name.Contains("Engineering"))
                .ToList();
            Assert.IsTrue(departmentBatches.Count > 0, "Batches should be grouped by department");
        }

        [TestMethod]
        public async Task GenerateBatchesAsync_ShouldSetTeamsMigrationType()
        {
            // Arrange
            await _viewModel.DiscoverTeamsCommand.ExecuteAsync(null);
            
            // Act
            await _viewModel.GenerateBatchesCommand.ExecuteAsync(null);
            
            // Assert
            foreach (var batch in _viewModel.MigrationBatches)
            {
                Assert.AreEqual(MigrationType.Teams, batch.Type);
                foreach (var item in batch.Items)
                {
                    Assert.AreEqual(MigrationType.Teams, item.Type);
                }
            }
        }

        #endregion

        #region Filtering and Search Tests

        [TestMethod]
        public async Task TeamsSearchText_SetValue_ShouldFilterTeams()
        {
            // Arrange
            await _viewModel.DiscoverTeamsCommand.ExecuteAsync(null);
            var initialCount = _viewModel.TeamsView.Cast<TeamsDiscoveryItem>().Count();
            
            // Act
            _viewModel.TeamsSearchText = "Finance";
            
            // Assert
            var filteredCount = _viewModel.TeamsView.Cast<TeamsDiscoveryItem>().Count();
            Assert.IsTrue(filteredCount < initialCount, "Search should filter results");
        }

        [TestMethod]
        public async Task SelectedTeamTypeFilter_SetValue_ShouldFilterTeams()
        {
            // Arrange
            await _viewModel.DiscoverTeamsCommand.ExecuteAsync(null);
            
            // Act
            _viewModel.SelectedTeamTypeFilter = "Public";
            
            // Assert
            var filteredTeams = _viewModel.TeamsView.Cast<TeamsDiscoveryItem>().ToList();
            Assert.IsTrue(filteredTeams.All(t => t.TeamType == "Public"), "Filter should show only Public teams");
        }

        [TestMethod]
        public async Task ShowOnlyTeamsWithIssues_SetTrue_ShouldFilterToIssuesOnly()
        {
            // Arrange
            await _viewModel.DiscoverTeamsCommand.ExecuteAsync(null);
            await _viewModel.AnalyzeContentCommand.ExecuteAsync(null);
            
            // Act
            _viewModel.ShowOnlyTeamsWithIssues = true;
            
            // Assert
            var filteredTeams = _viewModel.TeamsView.Cast<TeamsDiscoveryItem>().ToList();
            foreach (var team in filteredTeams)
            {
                var hasHighSeverityIssue = _viewModel.ContentIssues.Any(i => i.ItemName == team.DisplayName && i.Severity == "High");
                Assert.IsTrue(hasHighSeverityIssue, "Only teams with high severity issues should be shown");
            }
        }

        [TestMethod]
        public async Task ChannelsSearchText_SetValue_ShouldFilterChannels()
        {
            // Arrange
            await _viewModel.DiscoverTeamsCommand.ExecuteAsync(null);
            var initialCount = _viewModel.ChannelsView.Cast<ChannelDiscoveryItem>().Count();
            
            // Act
            _viewModel.ChannelsSearchText = "General";
            
            // Assert
            var filteredCount = _viewModel.ChannelsView.Cast<ChannelDiscoveryItem>().Count();
            Assert.IsTrue(filteredCount < initialCount, "Search should filter channel results");
        }

        [TestMethod]
        public void ClearFiltersCommand_Execute_ShouldResetAllFilters()
        {
            // Arrange
            _viewModel.TeamsSearchText = "Test";
            _viewModel.ChannelsSearchText = "Test";
            _viewModel.SelectedTeamTypeFilter = "Public";
            _viewModel.SelectedChannelTypeFilter = "Private";
            _viewModel.ShowOnlyTeamsWithIssues = true;
            
            // Act
            _viewModel.ClearFiltersCommand.Execute(null);
            
            // Assert
            Assert.AreEqual(string.Empty, _viewModel.TeamsSearchText);
            Assert.AreEqual(string.Empty, _viewModel.ChannelsSearchText);
            Assert.AreEqual("All", _viewModel.SelectedTeamTypeFilter);
            Assert.AreEqual("All", _viewModel.SelectedChannelTypeFilter);
            Assert.IsFalse(_viewModel.ShowOnlyTeamsWithIssues);
        }

        #endregion

        #region Data Model Tests

        [TestMethod]
        public void TeamsDiscoveryItem_FormattedDataSize_ShouldFormatCorrectly()
        {
            // Arrange
            var team = new TeamsDiscoveryItem { DataSizeGB = 15.5678 };
            
            // Act & Assert
            Assert.AreEqual("15.57 GB", team.FormattedDataSize);
        }

        [TestMethod]
        public void TeamsDiscoveryItem_ActivityStatus_ShouldCalculateCorrectly()
        {
            // Arrange
            var activeTeam = new TeamsDiscoveryItem { LastActivityDate = DateTime.Now.AddDays(-3) };
            var inactiveTeam = new TeamsDiscoveryItem { LastActivityDate = DateTime.Now.AddDays(-30) };
            
            // Act & Assert
            Assert.AreEqual("Active", activeTeam.ActivityStatus);
            Assert.AreEqual("Inactive", inactiveTeam.ActivityStatus);
        }

        [TestMethod]
        public void TeamsDiscoveryItem_HasComplexConfiguration_ShouldDetectComplexity()
        {
            // Arrange
            var simpleTeam = new TeamsDiscoveryItem { HasApps = false, HasCustomTabs = false, GuestCount = 0 };
            var complexTeam = new TeamsDiscoveryItem { HasApps = true, HasCustomTabs = true, GuestCount = 5 };
            
            // Act & Assert
            Assert.IsFalse(simpleTeam.HasComplexConfiguration, "Simple team should not be marked as complex");
            Assert.IsTrue(complexTeam.HasComplexConfiguration, "Team with apps, tabs, and guests should be complex");
        }

        [TestMethod]
        public void ChannelDiscoveryItem_ActivityLevel_ShouldCalculateCorrectly()
        {
            // Arrange
            var lowChannel = new ChannelDiscoveryItem { MessageCount = 50 };
            var mediumChannel = new ChannelDiscoveryItem { MessageCount = 250 };
            var highChannel = new ChannelDiscoveryItem { MessageCount = 750 };
            
            // Act & Assert
            Assert.AreEqual("Low", lowChannel.ActivityLevel);
            Assert.AreEqual("Medium", mediumChannel.ActivityLevel);
            Assert.AreEqual("High", highChannel.ActivityLevel);
        }

        [TestMethod]
        public void ChannelDiscoveryItem_RequiresSpecialHandling_ShouldDetectSpecialCases()
        {
            // Arrange
            var standardChannel = new ChannelDiscoveryItem 
            { 
                ChannelType = "Standard", 
                HasCustomConnectors = false, 
                IsModerated = false 
            };
            var specialChannel = new ChannelDiscoveryItem 
            { 
                ChannelType = "Private", 
                HasCustomConnectors = true, 
                IsModerated = true 
            };
            
            // Act & Assert
            Assert.IsFalse(standardChannel.RequiresSpecialHandling);
            Assert.IsTrue(specialChannel.RequiresSpecialHandling);
        }

        #endregion

        #region Validation Tests

        [TestMethod]
        public async Task ValidatePermissionsAsync_ShouldCompleteSuccessfully()
        {
            // Act
            await _viewModel.ValidatePermissionsCommand.ExecuteAsync(null);
            
            // Assert
            Assert.IsFalse(_viewModel.IsLoading, "Validation should complete");
            Assert.IsTrue(_viewModel.StatusMessage.Contains("validation completed"), 
                "Status should indicate validation completion");
        }

        #endregion

        #region Export Tests

        [TestMethod]
        public async Task ExportPlanAsync_ShouldCompleteSuccessfully()
        {
            // Arrange
            await _viewModel.DiscoverTeamsCommand.ExecuteAsync(null);
            await _viewModel.GenerateBatchesCommand.ExecuteAsync(null);
            
            // Act
            await _viewModel.ExportPlanCommand.ExecuteAsync(null);
            
            // Assert
            Assert.IsFalse(_viewModel.IsLoading, "Export should complete");
            Assert.IsTrue(_viewModel.StatusMessage.Contains("exported"), 
                "Status should indicate export completion");
        }

        #endregion

        #region Performance Tests

        [TestMethod]
        public async Task PerformanceTest_DiscoverLargeNumberOfTeams_ShouldComplete()
        {
            // Note: This test uses the sample data generator which creates 20 teams by default
            // In a real scenario, we would mock the service to return larger datasets
            
            // Arrange
            var stopwatch = System.Diagnostics.Stopwatch.StartNew();
            
            // Act
            await _viewModel.DiscoverTeamsCommand.ExecuteAsync(null);
            
            // Assert
            stopwatch.Stop();
            Assert.IsTrue(stopwatch.ElapsedMilliseconds < 10000, 
                "Discovery should complete within 10 seconds for test dataset");
            Assert.IsTrue(_viewModel.TeamsData.Count > 0, "Teams should be discovered");
            Assert.IsTrue(_viewModel.ChannelsData.Count > 0, "Channels should be discovered");
        }

        [TestMethod]
        public async Task PerformanceTest_FilteringLargeDataset_ShouldBeResponsive()
        {
            // Arrange
            await _viewModel.DiscoverTeamsCommand.ExecuteAsync(null);
            var stopwatch = System.Diagnostics.Stopwatch.StartNew();
            
            // Act
            _viewModel.TeamsSearchText = "Finance";
            _viewModel.SelectedTeamTypeFilter = "Public";
            _viewModel.ShowOnlyTeamsWithIssues = true;
            
            // Assert
            stopwatch.Stop();
            Assert.IsTrue(stopwatch.ElapsedMilliseconds < 1000, 
                "Filtering should be responsive (under 1 second)");
        }

        #endregion

        #region Error Handling Tests

        [TestMethod]
        public void PropertyChanged_Events_ShouldFireCorrectly()
        {
            // Arrange
            var propertyChangedEvents = new List<string>();
            _viewModel.PropertyChanged += (s, e) => propertyChangedEvents.Add(e.PropertyName);
            
            // Act
            _viewModel.ProjectName = "New Project Name";
            _viewModel.BatchSize = 75;
            _viewModel.PreserveApps = true;
            
            // Assert
            Assert.IsTrue(propertyChangedEvents.Contains(nameof(_viewModel.ProjectName)));
            Assert.IsTrue(propertyChangedEvents.Contains(nameof(_viewModel.BatchSize)));
            Assert.IsTrue(propertyChangedEvents.Contains(nameof(_viewModel.PreserveApps)));
        }

        #endregion

        #region Integration Tests

        [TestMethod]
        public async Task IntegrationTest_FullWorkflow_ShouldCompleteSuccessfully()
        {
            // Arrange & Act - Full workflow
            await _viewModel.DiscoverTeamsCommand.ExecuteAsync(null);
            await _viewModel.AnalyzeContentCommand.ExecuteAsync(null);
            await _viewModel.ValidatePermissionsCommand.ExecuteAsync(null);
            await _viewModel.GenerateBatchesCommand.ExecuteAsync(null);
            await _viewModel.ExportPlanCommand.ExecuteAsync(null);
            
            // Assert
            Assert.IsTrue(_viewModel.TeamsData.Count > 0, "Teams should be discovered");
            Assert.IsTrue(_viewModel.ChannelsData.Count > 0, "Channels should be discovered");
            Assert.IsTrue(_viewModel.ContentIssues.Count >= 0, "Content issues should be analyzed");
            Assert.IsTrue(_viewModel.MigrationBatches.Count > 0, "Migration batches should be generated");
            Assert.IsFalse(_viewModel.IsLoading, "All operations should be completed");
        }

        #endregion

        #region Memory and Resource Tests

        [TestMethod]
        public void MemoryTest_MultipleDiscoveryOperations_ShouldNotLeak()
        {
            // Note: This is a basic memory test. In production, we would use memory profiling tools
            
            // Arrange
            var initialMemory = GC.GetTotalMemory(true);
            
            // Act - Perform multiple operations
            for (int i = 0; i < 5; i++)
            {
                _viewModel.DiscoverTeamsCommand.ExecuteAsync(null).Wait();
                _viewModel.TeamsData.Clear();
                _viewModel.ChannelsData.Clear();
                GC.Collect();
                GC.WaitForPendingFinalizers();
            }
            
            // Assert
            var finalMemory = GC.GetTotalMemory(true);
            var memoryIncrease = finalMemory - initialMemory;
            Assert.IsTrue(memoryIncrease < 50 * 1024 * 1024, // Less than 50MB increase
                "Memory usage should not increase significantly after multiple operations");
        }

        #endregion
    }
}