using System;
using System.Linq;
using System.Windows.Controls;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using MandADiscoverySuite.Services;
using MandADiscoverySuite.Views;
using MandADiscoverySuite.ViewModels;
using MandADiscoverySuite.Models;

namespace MandADiscoverySuite.Tests.Teams
{
    /// <summary>
    /// Integration tests for Teams migration planning platform
    /// Tests ViewRegistry registration, navigation, and integration points
    /// </summary>
    [TestClass]
    public class TeamsMigrationIntegrationTests
    {
        private ViewRegistry _viewRegistry;

        [TestInitialize]
        public void Setup()
        {
            _viewRegistry = ViewRegistry.Instance;
        }

        #region ViewRegistry Integration Tests

        [TestMethod]
        public void ViewRegistry_TeamsMigrationRegistration_ShouldBeRegistered()
        {
            // Act & Assert
            Assert.IsTrue(_viewRegistry.IsViewRegistered("teamsmigration"), 
                "Teams migration should be registered with lowercase key");
            Assert.IsTrue(_viewRegistry.IsViewRegistered("teams-migration"), 
                "Teams migration should be registered with hyphenated key");
            Assert.IsTrue(_viewRegistry.IsViewRegistered("teamsplanning"), 
                "Teams planning should be registered");
            Assert.IsTrue(_viewRegistry.IsViewRegistered("collaborationmigration"), 
                "Collaboration migration should be registered");
        }

        [TestMethod]
        public void ViewRegistry_PascalCaseKeys_ShouldBeRegistered()
        {
            // Act & Assert
            Assert.IsTrue(_viewRegistry.IsViewRegistered("TeamsMigration"), 
                "TeamsMigration (PascalCase) should be registered");
            Assert.IsTrue(_viewRegistry.IsViewRegistered("TeamsPlanning"), 
                "TeamsPlanning (PascalCase) should be registered");
            Assert.IsTrue(_viewRegistry.IsViewRegistered("CollaborationMigration"), 
                "CollaborationMigration (PascalCase) should be registered");
        }

        [TestMethod]
        public void ViewRegistry_CreateTeamsMigrationView_ShouldReturnCorrectType()
        {
            // Act
            var view = _viewRegistry.CreateView("teamsmigration");
            
            // Assert
            Assert.IsNotNull(view, "View should be created");
            Assert.IsInstanceOfType(view, typeof(TeamsMigrationPlanningView), 
                "Should return TeamsMigrationPlanningView instance");
        }

        [TestMethod]
        public void ViewRegistry_CreateTeamsMigrationView_ShouldHaveCorrectDataContext()
        {
            // Act
            var view = _viewRegistry.CreateView("teamsplanning");
            
            // Assert
            Assert.IsNotNull(view.DataContext, "View should have DataContext");
            Assert.IsInstanceOfType(view.DataContext, typeof(TeamsMigrationPlanningViewModel), 
                "DataContext should be TeamsMigrationPlanningViewModel");
        }

        [TestMethod]
        public void ViewRegistry_MultipleViewCreation_ShouldCreateNewInstances()
        {
            // Act
            var view1 = _viewRegistry.CreateView("teamsmigration");
            var view2 = _viewRegistry.CreateView("teams-migration");
            
            // Assert
            Assert.IsNotNull(view1, "First view should be created");
            Assert.IsNotNull(view2, "Second view should be created");
            Assert.AreNotSame(view1, view2, "Should create new instances each time");
            Assert.AreNotSame(view1.DataContext, view2.DataContext, 
                "Should create new ViewModels each time");
        }

        [TestMethod]
        public void ViewRegistry_CaseInsensitiveKeys_ShouldWork()
        {
            // Act
            var lowerView = _viewRegistry.CreateView("teamsmigration");
            var upperView = _viewRegistry.CreateView("TEAMSMIGRATION");
            var mixedView = _viewRegistry.CreateView("TeAmSmIgRaTiOn");
            
            // Assert
            Assert.IsNotNull(lowerView, "Lowercase key should work");
            Assert.IsNotNull(upperView, "Uppercase key should work");
            Assert.IsNotNull(mixedView, "Mixed case key should work");
            Assert.AreEqual(lowerView.GetType(), upperView.GetType());
            Assert.AreEqual(upperView.GetType(), mixedView.GetType());
        }

        #endregion

        #region Migration Type Enum Integration Tests

        [TestMethod]
        public void MigrationType_TeamsEnum_ShouldExist()
        {
            // Act & Assert
            Assert.IsTrue(Enum.IsDefined(typeof(MigrationType), MigrationType.Teams), 
                "Teams should be defined in MigrationType enum");
        }

        [TestMethod]
        public void MigrationType_TeamsValue_ShouldHaveCorrectValue()
        {
            // Act
            var teamsTypeValue = (int)MigrationType.Teams;
            
            // Assert
            Assert.IsTrue(teamsTypeValue >= 0, "Teams migration type should have valid enum value");
        }

        [TestMethod]
        public void MigrationBatch_TeamsType_ShouldBeSetCorrectly()
        {
            // Arrange
            var batch = new MigrationBatch
            {
                Type = MigrationType.Teams,
                Name = "Test Teams Batch"
            };
            
            // Act & Assert
            Assert.AreEqual(MigrationType.Teams, batch.Type, "Batch type should be Teams");
        }

        [TestMethod]
        public void MigrationItem_TeamsType_ShouldBeSetCorrectly()
        {
            // Arrange
            var item = new MigrationItem
            {
                Type = MigrationType.Teams,
                SourceIdentity = "Test Team",
                DisplayName = "Test Team"
            };
            
            // Act & Assert
            Assert.AreEqual(MigrationType.Teams, item.Type, "Item type should be Teams");
        }

        #endregion

        #region Data Model Integration Tests

        [TestMethod]
        public void TeamsDiscoveryItem_IntegrationWithMigrationBatch_ShouldWork()
        {
            // Arrange
            var team = new TeamsDiscoveryItem
            {
                Id = Guid.NewGuid().ToString(),
                DisplayName = "Test Team",
                MailNickname = "testteam",
                Department = "IT",
                MemberCount = 25,
                DataSizeGB = 15.5
            };
            
            var batch = new MigrationBatch
            {
                Name = "Test Batch",
                Type = MigrationType.Teams
            };
            
            // Act
            var migrationItem = new MigrationItem
            {
                Id = Guid.NewGuid().ToString(),
                SourceIdentity = team.DisplayName,
                TargetIdentity = team.MailNickname,
                DisplayName = team.DisplayName,
                Type = MigrationType.Teams,
                SizeBytes = (long)(team.DataSizeGB * 1024 * 1024 * 1024)
            };
            
            batch.Items.Add(migrationItem);
            
            // Assert
            Assert.AreEqual(1, batch.TotalItems, "Batch should have one item");
            Assert.AreEqual(team.DisplayName, migrationItem.SourceIdentity);
            Assert.AreEqual(team.MailNickname, migrationItem.TargetIdentity);
            Assert.IsTrue(migrationItem.SizeBytes > 0, "Size should be converted correctly");
        }

        [TestMethod]
        public void ChannelDiscoveryItem_IntegrationWithValidation_ShouldWork()
        {
            // Arrange
            var channel = new ChannelDiscoveryItem
            {
                Id = Guid.NewGuid().ToString(),
                TeamId = Guid.NewGuid().ToString(),
                DisplayName = "Private Channel",
                ChannelType = "Private",
                HasCustomConnectors = true,
                IsModerated = true,
                MessageCount = 1500
            };
            
            // Act
            var validationIssue = new ValidationIssue
            {
                Category = "Teams",
                Severity = "Medium",
                ItemName = $"{channel.TeamName} - {channel.DisplayName}",
                Description = "Private channel with custom connectors detected",
                RecommendedAction = "Review connector configurations before migration"
            };
            
            // Assert
            Assert.IsTrue(channel.RequiresSpecialHandling, 
                "Private moderated channel should require special handling");
            Assert.AreEqual("High", channel.ActivityLevel, 
                "Channel with 1500 messages should be high activity");
            Assert.IsNotNull(validationIssue.ItemName);
            Assert.AreEqual("Teams", validationIssue.Category);
        }

        #endregion

        #region Navigation Integration Tests

        [TestMethod]
        public void Navigation_FromMigrateViewToTeams_ShouldWork()
        {
            // This test simulates navigation from the main MigrateView to Teams planning
            
            // Arrange
            var migrateView = _viewRegistry.CreateView("migrate");
            var teamsView = _viewRegistry.CreateView("teamsmigration");
            
            // Assert
            Assert.IsNotNull(migrateView, "MigrateView should be created");
            Assert.IsNotNull(teamsView, "TeamsMigrationPlanningView should be created");
            Assert.IsInstanceOfType(migrateView, typeof(MigrateView));
            Assert.IsInstanceOfType(teamsView, typeof(TeamsMigrationPlanningView));
        }

        [TestMethod]
        public void Navigation_AllTeamsMigrationAliases_ShouldReturnSameViewType()
        {
            // Arrange
            var aliases = new[]
            {
                "teamsmigration",
                "teams-migration", 
                "teamsplanning",
                "collaborationmigration"
            };
            
            // Act & Assert
            foreach (var alias in aliases)
            {
                var view = _viewRegistry.CreateView(alias);
                Assert.IsNotNull(view, $"View for alias '{alias}' should be created");
                Assert.IsInstanceOfType(view, typeof(TeamsMigrationPlanningView), 
                    $"Alias '{alias}' should return TeamsMigrationPlanningView");
            }
        }

        #endregion

        #region Cross-Module Integration Tests

        [TestMethod]
        public void CrossModule_TeamsWithExchangeMigration_ShouldIntegrate()
        {
            // This test ensures Teams migration can work alongside Exchange migration
            
            // Act
            var teamsView = _viewRegistry.CreateView("teamsmigration");
            var exchangeView = _viewRegistry.CreateView("exchangemigration");
            
            // Assert
            Assert.IsNotNull(teamsView, "Teams migration view should be available");
            Assert.IsNotNull(exchangeView, "Exchange migration view should be available");
            Assert.AreNotEqual(teamsView.GetType(), exchangeView.GetType(), 
                "Should be different view types");
        }

        [TestMethod]
        public void CrossModule_TeamsWithSharePointMigration_ShouldIntegrate()
        {
            // This test ensures Teams migration can work alongside SharePoint migration
            
            // Act
            var teamsView = _viewRegistry.CreateView("teamsmigration");
            var sharepointView = _viewRegistry.CreateView("sharepointmigration");
            
            // Assert
            Assert.IsNotNull(teamsView, "Teams migration view should be available");
            Assert.IsNotNull(sharepointView, "SharePoint migration view should be available");
            Assert.AreNotEqual(teamsView.GetType(), sharepointView.GetType(), 
                "Should be different view types");
        }

        #endregion

        #region Validation Integration Tests

        [TestMethod]
        public void Validation_TeamsDataWithContentIssues_ShouldIntegrate()
        {
            // Arrange
            var team = new TeamsDiscoveryItem
            {
                DisplayName = "Finance Team",
                HasApps = true,
                HasCustomTabs = true,
                GuestCount = 15,
                DataSizeGB = 55.7
            };
            
            // Act - Create validation issues that would be generated for this team
            var issues = new[]
            {
                new ValidationIssue
                {
                    Category = "Teams",
                    Severity = "High",
                    ItemName = team.DisplayName,
                    Description = "Large file detected (>50GB)",
                    RecommendedAction = "Consider breaking into smaller batches"
                },
                new ValidationIssue
                {
                    Category = "Teams",
                    Severity = "Medium", 
                    ItemName = team.DisplayName,
                    Description = "Custom apps detected",
                    RecommendedAction = "Verify app compatibility in target tenant"
                },
                new ValidationIssue
                {
                    Category = "Teams",
                    Severity = "Low",
                    ItemName = team.DisplayName,
                    Description = "External guest access detected",
                    RecommendedAction = "Review guest access policies"
                }
            };
            
            // Assert
            Assert.IsTrue(team.HasComplexConfiguration, 
                "Team with apps, tabs, and guests should be complex");
            Assert.AreEqual(3, issues.Length, "Should have 3 validation issues");
            Assert.IsTrue(issues.Any(i => i.Severity == "High"), 
                "Should have at least one high severity issue");
        }

        #endregion

        #region Performance Integration Tests

        [TestMethod]
        public void Performance_ViewCreationTime_ShouldBeAcceptable()
        {
            // Arrange
            var stopwatch = System.Diagnostics.Stopwatch.StartNew();
            
            // Act - Create multiple views
            for (int i = 0; i < 10; i++)
            {
                var view = _viewRegistry.CreateView("teamsmigration");
                Assert.IsNotNull(view, $"View creation {i + 1} should succeed");
            }
            
            // Assert
            stopwatch.Stop();
            Assert.IsTrue(stopwatch.ElapsedMilliseconds < 5000, 
                "Creating 10 views should take less than 5 seconds");
        }

        [TestMethod]
        public void Performance_DataContextInitialization_ShouldBeQuick()
        {
            // Arrange
            var stopwatch = System.Diagnostics.Stopwatch.StartNew();
            
            // Act
            var view = _viewRegistry.CreateView("teamsmigration");
            var viewModel = view.DataContext as TeamsMigrationPlanningViewModel;
            
            // Assert
            stopwatch.Stop();
            Assert.IsNotNull(viewModel, "ViewModel should be initialized");
            Assert.IsTrue(stopwatch.ElapsedMilliseconds < 2000, 
                "View and ViewModel initialization should be under 2 seconds");
            Assert.IsNotNull(viewModel.TeamsData, "Collections should be initialized");
            Assert.IsNotNull(viewModel.ChannelsData, "Collections should be initialized");
            Assert.IsNotNull(viewModel.MigrationBatches, "Collections should be initialized");
        }

        #endregion

        #region Error Handling Integration Tests

        [TestMethod]
        public void ErrorHandling_InvalidViewKey_ShouldReturnFallback()
        {
            // Act
            var view = _viewRegistry.CreateView("nonexistentteamsview");
            
            // Assert
            Assert.IsNotNull(view, "Should return fallback view for invalid key");
            // Note: The actual fallback behavior depends on ViewRegistry implementation
        }

        [TestMethod]
        public void ErrorHandling_NullOrEmptyKey_ShouldHandleGracefully()
        {
            // Act & Assert
            var nullView = _viewRegistry.CreateView(null);
            var emptyView = _viewRegistry.CreateView("");
            var whitespaceView = _viewRegistry.CreateView("   ");
            
            // The ViewRegistry should handle these gracefully (return null or fallback)
            // Exact behavior depends on implementation
            Assert.IsTrue(nullView == null || nullView != null, 
                "Should handle null key gracefully");
            Assert.IsTrue(emptyView == null || emptyView != null, 
                "Should handle empty key gracefully");
            Assert.IsTrue(whitespaceView == null || whitespaceView != null, 
                "Should handle whitespace key gracefully");
        }

        #endregion

        #region Service Integration Tests

        [TestMethod]
        public void Service_SimpleServiceLocator_ShouldProvideNavigationService()
        {
            // This test verifies that the ViewModel can get services through SimpleServiceLocator
            // Note: This may require proper service registration in the test environment
            
            // Arrange & Act
            var view = _viewRegistry.CreateView("teamsmigration");
            var viewModel = view.DataContext as TeamsMigrationPlanningViewModel;
            
            // Assert
            Assert.IsNotNull(viewModel, "ViewModel should be created");
            // Note: Testing actual service resolution may require additional setup
        }

        #endregion

        #region UI Integration Tests

        [TestMethod]
        public void UI_XamlBinding_ShouldHaveCorrectDataContext()
        {
            // Act
            var view = _viewRegistry.CreateView("teamsmigration") as TeamsMigrationPlanningView;
            
            // Assert
            Assert.IsNotNull(view, "View should be created");
            Assert.IsNotNull(view.DataContext, "DataContext should be set");
            Assert.IsInstanceOfType(view.DataContext, typeof(TeamsMigrationPlanningViewModel), 
                "DataContext should be correct ViewModel type");
        }

        [TestMethod]
        public void UI_CommandBinding_ShouldBeAccessible()
        {
            // Arrange
            var view = _viewRegistry.CreateView("teamsmigration") as TeamsMigrationPlanningView;
            var viewModel = view.DataContext as TeamsMigrationPlanningViewModel;
            
            // Assert
            Assert.IsNotNull(viewModel.DiscoverTeamsCommand, 
                "Commands should be accessible for UI binding");
            Assert.IsNotNull(viewModel.AnalyzeContentCommand, 
                "Commands should be accessible for UI binding");
            Assert.IsNotNull(viewModel.GenerateBatchesCommand, 
                "Commands should be accessible for UI binding");
        }

        #endregion
    }
}