using System;
using System.Collections.ObjectModel;
using System.ComponentModel;
using System.Linq;
using System.Threading.Tasks;
using System.Windows.Input;
using FluentAssertions;
using MandADiscoverySuite.Models;
using MandADiscoverySuite.ViewModels;
using Microsoft.Extensions.Logging;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using Moq;

namespace MigrationTestSuite.Unit.ViewModels
{
    [TestClass]
    public class MigrateViewModelTests
    {
        private Mock<ILogger<MigrateViewModel>> _mockLogger;
        private MigrateViewModel _viewModel;

        [TestInitialize]
        public void Setup()
        {
            _mockLogger = new Mock<ILogger<MigrateViewModel>>();
            _viewModel = new MigrateViewModel(_mockLogger.Object);
        }

        [TestCleanup]
        public void Cleanup()
        {
            _viewModel?.Dispose();
        }

        [TestClass]
        public class ConstructorTests : MigrateViewModelTests
        {
            [TestMethod]
            public void Constructor_ShouldInitializeAllCommands()
            {
                // Assert - All commands should be initialized
                _viewModel.SwitchTabCommand.Should().NotBeNull();
                _viewModel.NewProjectCommand.Should().NotBeNull();
                _viewModel.LoadProjectCommand.Should().NotBeNull();
                _viewModel.StartNextWaveCommand.Should().NotBeNull();
                _viewModel.PauseAllCommand.Should().NotBeNull();
                _viewModel.GenerateReportCommand.Should().NotBeNull();
                
                // Discovery Commands
                _viewModel.StartDiscoveryCommand.Should().NotBeNull();
                _viewModel.TestSourceConnectionCommand.Should().NotBeNull();
                _viewModel.TestTargetConnectionCommand.Should().NotBeNull();
                
                // Planning Commands
                _viewModel.GenerateWavesCommand.Should().NotBeNull();
                _viewModel.SavePlanCommand.Should().NotBeNull();
                _viewModel.AddWaveCommand.Should().NotBeNull();
                _viewModel.EditWaveCommand.Should().NotBeNull();
                _viewModel.DeleteWaveCommand.Should().NotBeNull();
                _viewModel.OpenBatchGeneratorCommand.Should().NotBeNull();
                
                // Execution Commands
                _viewModel.StartAllExecutionCommand.Should().NotBeNull();
                _viewModel.PauseAllExecutionCommand.Should().NotBeNull();
                _viewModel.RefreshExecutionCommand.Should().NotBeNull();
                _viewModel.PauseStreamCommand.Should().NotBeNull();
                _viewModel.ViewStreamDetailsCommand.Should().NotBeNull();
                
                // Validation Commands
                _viewModel.RunPreValidationCommand.Should().NotBeNull();
                _viewModel.RunPostValidationCommand.Should().NotBeNull();
                _viewModel.RunSingleTestCommand.Should().NotBeNull();
                _viewModel.ViewTestDetailsCommand.Should().NotBeNull();
                _viewModel.FixIssueCommand.Should().NotBeNull();
                
                _viewModel.DismissErrorCommand.Should().NotBeNull();
                _viewModel.RefreshCommand.Should().NotBeNull();
            }

            [TestMethod]
            public void Constructor_ShouldInitializeCollections()
            {
                // Assert - All collections should be initialized
                _viewModel.ActiveMigrations.Should().NotBeNull();
                _viewModel.DiscoveredDependencies.Should().NotBeNull();
                _viewModel.SourceEnvironmentTypes.Should().NotBeNull();
                _viewModel.TargetEnvironmentTypes.Should().NotBeNull();
                _viewModel.MigrationWaves.Should().NotBeNull();
                _viewModel.ActiveMigrationStreams.Should().NotBeNull();
                _viewModel.RecentExecutionEvents.Should().NotBeNull();
                _viewModel.ValidationTests.Should().NotBeNull();
                _viewModel.ValidationIssues.Should().NotBeNull();
                _viewModel.PreMigrationChecklist.Should().NotBeNull();
            }

            [TestMethod]
            public void Constructor_ShouldSetDefaultValues()
            {
                // Assert
                _viewModel.CurrentTab.Should().Be("Dashboard");
                _viewModel.LoadingMessage.Should().NotBeNullOrEmpty();
                _viewModel.HasError.Should().BeFalse();
                _viewModel.Metrics.Should().NotBeNull();
                _viewModel.DiscoveryMetrics.Should().NotBeNull();
                _viewModel.PlanningMetrics.Should().NotBeNull();
                _viewModel.ExecutionMetrics.Should().NotBeNull();
                _viewModel.ValidationMetrics.Should().NotBeNull();
            }

            [TestMethod]
            public void Constructor_ShouldPopulateEnvironmentTypes()
            {
                // Assert
                _viewModel.SourceEnvironmentTypes.Should().NotBeEmpty();
                _viewModel.TargetEnvironmentTypes.Should().NotBeEmpty();
                
                _viewModel.SourceEnvironmentTypes.Should().Contain("Active Directory (On-Premises)");
                _viewModel.SourceEnvironmentTypes.Should().Contain("Azure Active Directory");
                _viewModel.TargetEnvironmentTypes.Should().Contain("Microsoft 365");
                _viewModel.TargetEnvironmentTypes.Should().Contain("Azure Storage");
            }
        }

        [TestClass]
        public class TabNavigationTests : MigrateViewModelTests
        {
            [TestMethod]
            public void SwitchTab_ValidTab_ShouldUpdateCurrentTab()
            {
                // Act
                _viewModel.SwitchTabCommand.Execute("Discovery");

                // Assert
                _viewModel.CurrentTab.Should().Be("Discovery");
            }

            [TestMethod]
            public void SwitchTab_ShouldUpdateTabVisibilityProperties()
            {
                // Act
                _viewModel.SwitchTabCommand.Execute("Planning");

                // Assert
                _viewModel.IsDashboardTabVisible.Should().BeFalse();
                _viewModel.IsPlanningTabVisible.Should().BeTrue();
                _viewModel.IsDiscoveryTabVisible.Should().BeFalse();
                _viewModel.IsConfigurationTabVisible.Should().BeFalse();
                _viewModel.IsExecutionTabVisible.Should().BeFalse();
                _viewModel.IsValidationTabVisible.Should().BeFalse();
                _viewModel.IsReportingTabVisible.Should().BeFalse();
            }

            [TestMethod]
            public void SwitchTab_ShouldUpdateTabActiveProperties()
            {
                // Act
                _viewModel.SwitchTabCommand.Execute("Execution");

                // Assert
                _viewModel.DashboardTabActive.Should().BeNull();
                _viewModel.ExecutionTabActive.Should().Be("Active");
                _viewModel.DiscoveryTabActive.Should().BeNull();
                _viewModel.ConfigurationTabActive.Should().BeNull();
                _viewModel.PlanningTabActive.Should().BeNull();
                _viewModel.ValidationTabActive.Should().BeNull();
                _viewModel.ReportingTabActive.Should().BeNull();
            }

            [TestMethod]
            public void SwitchTab_NullOrEmptyTab_ShouldNotChangeCurrentTab()
            {
                // Arrange
                var originalTab = _viewModel.CurrentTab;

                // Act
                _viewModel.SwitchTabCommand.Execute(null);
                _viewModel.SwitchTabCommand.Execute("");

                // Assert
                _viewModel.CurrentTab.Should().Be(originalTab);
            }
        }

        [TestClass]
        public class PropertyChangedTests : MigrateViewModelTests
        {
            [TestMethod]
            public void PropertyChanged_ShouldFireForCurrentTab()
            {
                // Arrange
                var propertyChangedEvents = new List<string>();
                _viewModel.PropertyChanged += (sender, e) => propertyChangedEvents.Add(e.PropertyName);

                // Act
                _viewModel.SwitchTabCommand.Execute("Discovery");

                // Assert
                propertyChangedEvents.Should().Contain("CurrentTab");
                propertyChangedEvents.Should().Contain("IsDashboardTabVisible");
                propertyChangedEvents.Should().Contain("IsDiscoveryTabVisible");
            }

            [TestMethod]
            public void PropertyChanged_ShouldFireForEnvironmentSelection()
            {
                // Arrange
                var propertyChangedEvents = new List<string>();
                _viewModel.PropertyChanged += (sender, e) => propertyChangedEvents.Add(e.PropertyName);

                // Act
                _viewModel.SelectedSourceEnvironment = "Azure Active Directory";
                _viewModel.SelectedTargetEnvironment = "Microsoft 365";

                // Assert
                propertyChangedEvents.Should().Contain("SelectedSourceEnvironment");
                propertyChangedEvents.Should().Contain("SelectedTargetEnvironment");
            }

            [TestMethod]
            public void PropertyChanged_ShouldFireForConnectionStrings()
            {
                // Arrange
                var propertyChangedEvents = new List<string>();
                _viewModel.PropertyChanged += (sender, e) => propertyChangedEvents.Add(e.PropertyName);

                // Act
                _viewModel.SourceConnectionString = "source-connection";
                _viewModel.TargetConnectionString = "target-connection";

                // Assert
                propertyChangedEvents.Should().Contain("SourceConnectionString");
                propertyChangedEvents.Should().Contain("TargetConnectionString");
            }

            [TestMethod]
            public void PropertyChanged_ShouldFireForMigrationSettings()
            {
                // Arrange
                var propertyChangedEvents = new List<string>();
                _viewModel.PropertyChanged += (sender, e) => propertyChangedEvents.Add(e.PropertyName);

                // Act
                _viewModel.IsExchangeMigrationEnabled = true;
                _viewModel.IsSharePointMigrationEnabled = true;
                _viewModel.IsFileSystemMigrationEnabled = true;
                _viewModel.IsVMMigrationEnabled = true;
                _viewModel.IsUserProfileMigrationEnabled = true;
                _viewModel.IsSecurityGroupMigrationEnabled = true;

                // Assert
                propertyChangedEvents.Should().Contain("IsExchangeMigrationEnabled");
                propertyChangedEvents.Should().Contain("IsSharePointMigrationEnabled");
                propertyChangedEvents.Should().Contain("IsFileSystemMigrationEnabled");
                propertyChangedEvents.Should().Contain("IsVMMigrationEnabled");
                propertyChangedEvents.Should().Contain("IsUserProfileMigrationEnabled");
                propertyChangedEvents.Should().Contain("IsSecurityGroupMigrationEnabled");
            }
        }

        [TestClass]
        public class WaveManagementTests : MigrateViewModelTests
        {
            [TestMethod]
            public void SelectedWave_WhenSet_ShouldUpdateHasSelectedWave()
            {
                // Arrange
                var wave = new MigrationWaveExtended { Name = "Test Wave" };

                // Act
                _viewModel.SelectedWave = wave;

                // Assert
                _viewModel.HasSelectedWave.Should().BeTrue();
                _viewModel.SelectedWave.Should().Be(wave);
            }

            [TestMethod]
            public void SelectedWave_WhenSetToNull_ShouldUpdateHasSelectedWave()
            {
                // Arrange
                _viewModel.SelectedWave = new MigrationWaveExtended { Name = "Test Wave" };

                // Act
                _viewModel.SelectedWave = null;

                // Assert
                _viewModel.HasSelectedWave.Should().BeFalse();
            }

            [TestMethod]
            public void MigrationWaves_AddWave_ShouldUpdateCollection()
            {
                // Arrange
                var wave = new MigrationWaveExtended { Name = "Wave 1", Order = 1 };

                // Act
                _viewModel.MigrationWaves.Add(wave);

                // Assert
                _viewModel.MigrationWaves.Should().HaveCount(1);
                _viewModel.MigrationWaves.First().Name.Should().Be("Wave 1");
            }
        }

        [TestClass]
        public class DataValidationTests : MigrateViewModelTests
        {
            [TestMethod]
            public void HasData_NoMigrationProjects_ShouldReturnFalse()
            {
                // Arrange
                _viewModel.Metrics.TotalProjects = 0;

                // Act & Assert
                _viewModel.HasData.Should().BeFalse();
            }

            [TestMethod]
            public void HasData_WithMigrationProjects_ShouldReturnTrue()
            {
                // Arrange
                _viewModel.Metrics.TotalProjects = 5;

                // Act & Assert
                _viewModel.HasData.Should().BeTrue();
            }

            [TestMethod]
            public void Metrics_DefaultValues_ShouldBeCorrect()
            {
                // Assert
                _viewModel.Metrics.TotalProjects.Should().Be(0);
                _viewModel.Metrics.ActiveMigrations.Should().Be(0);
                _viewModel.Metrics.CompletedMigrations.Should().Be(0);
                _viewModel.Metrics.OverallCompletionPercentage.Should().Be(0.0);
            }
        }

        [TestClass]
        public class CommandValidationTests : MigrateViewModelTests
        {
            [TestMethod]
            public void Commands_ShouldImplementICommand()
            {
                // Assert - All commands should implement ICommand
                _viewModel.SwitchTabCommand.Should().BeAssignableTo<ICommand>();
                _viewModel.NewProjectCommand.Should().BeAssignableTo<ICommand>();
                _viewModel.LoadProjectCommand.Should().BeAssignableTo<ICommand>();
                _viewModel.StartNextWaveCommand.Should().BeAssignableTo<ICommand>();
                _viewModel.PauseAllCommand.Should().BeAssignableTo<ICommand>();
                _viewModel.GenerateReportCommand.Should().BeAssignableTo<ICommand>();
                _viewModel.StartDiscoveryCommand.Should().BeAssignableTo<ICommand>();
                _viewModel.RefreshCommand.Should().BeAssignableTo<ICommand>();
            }

            [TestMethod]
            public void SwitchTabCommand_CanExecute_ShouldReturnTrueForValidTab()
            {
                // Act & Assert
                _viewModel.SwitchTabCommand.CanExecute("Dashboard").Should().BeTrue();
                _viewModel.SwitchTabCommand.CanExecute("Discovery").Should().BeTrue();
                _viewModel.SwitchTabCommand.CanExecute("Planning").Should().BeTrue();
                _viewModel.SwitchTabCommand.CanExecute("Execution").Should().BeTrue();
                _viewModel.SwitchTabCommand.CanExecute("Validation").Should().BeTrue();
                _viewModel.SwitchTabCommand.CanExecute("Reporting").Should().BeTrue();
            }

            [TestMethod]
            public void SwitchTabCommand_CanExecute_ShouldReturnFalseForInvalidTab()
            {
                // Act & Assert
                _viewModel.SwitchTabCommand.CanExecute(null).Should().BeFalse();
                _viewModel.SwitchTabCommand.CanExecute("").Should().BeFalse();
                _viewModel.SwitchTabCommand.CanExecute("InvalidTab").Should().BeFalse();
            }
        }

        [TestClass]
        public class CollectionInitializationTests : MigrateViewModelTests
        {
            [TestMethod]
            public void ActiveMigrations_ShouldReturnEmptyCollectionWhenNull()
            {
                // Arrange
                var viewModel = new MigrateViewModel(_mockLogger.Object);

                // Act & Assert
                viewModel.ActiveMigrations.Should().NotBeNull();
                viewModel.ActiveMigrations.Should().BeEmpty();
            }

            [TestMethod]
            public void DiscoveredDependencies_ShouldReturnEmptyCollectionWhenNull()
            {
                // Arrange
                var viewModel = new MigrateViewModel(_mockLogger.Object);

                // Act & Assert
                viewModel.DiscoveredDependencies.Should().NotBeNull();
                viewModel.DiscoveredDependencies.Should().BeEmpty();
            }

            [TestMethod]
            public void ValidationTests_ShouldSupportAddingItems()
            {
                // Arrange
                var validationTest = new ValidationTest
                {
                    Name = "Test Connection",
                    Category = "Connectivity",
                    Status = "Passed"
                };

                // Act
                _viewModel.ValidationTests.Add(validationTest);

                // Assert
                _viewModel.ValidationTests.Should().HaveCount(1);
                _viewModel.ValidationTests.First().Name.Should().Be("Test Connection");
            }

            [TestMethod]
            public void ValidationIssues_ShouldSupportAddingItems()
            {
                // Arrange
                var validationIssue = new ValidationIssue
                {
                    Severity = "High",
                    Category = "Security",
                    ItemName = "Test Item",
                    Description = "Test description"
                };

                // Act
                _viewModel.ValidationIssues.Add(validationIssue);

                // Assert
                _viewModel.ValidationIssues.Should().HaveCount(1);
                _viewModel.ValidationIssues.First().Severity.Should().Be("High");
            }

            [TestMethod]
            public void PreMigrationChecklist_ShouldSupportAddingItems()
            {
                // Arrange
                var checklistItem = new ChecklistItem
                {
                    Title = "Backup Source Data",
                    Description = "Create a backup of all source data",
                    Priority = "High",
                    IsCompleted = false
                };

                // Act
                _viewModel.PreMigrationChecklist.Add(checklistItem);

                // Assert
                _viewModel.PreMigrationChecklist.Should().HaveCount(1);
                _viewModel.PreMigrationChecklist.First().Title.Should().Be("Backup Source Data");
            }
        }

        [TestClass]
        public class ErrorHandlingTests : MigrateViewModelTests
        {
            [TestMethod]
            public void HasError_InitialState_ShouldBeFalse()
            {
                // Assert
                _viewModel.HasError.Should().BeFalse();
            }

            [TestMethod]
            public void LoadingMessage_InitialState_ShouldNotBeEmpty()
            {
                // Assert
                _viewModel.LoadingMessage.Should().NotBeNullOrEmpty();
            }

            [TestMethod]
            public void DismissErrorCommand_CanExecute_ShouldReturnTrue()
            {
                // Act & Assert
                _viewModel.DismissErrorCommand.CanExecute(null).Should().BeTrue();
            }
        }

        [TestClass]
        public class ExecutionMetricsTests : MigrateViewModelTests
        {
            [TestMethod]
            public void ExecutionMetrics_ShouldInitializeWithDefaults()
            {
                // Assert
                _viewModel.ExecutionMetrics.Should().NotBeNull();
                _viewModel.ExecutionMetrics.ActiveStreams.Should().Be(0);
                _viewModel.ExecutionMetrics.ItemsPerMinute.Should().Be(0);
                _viewModel.ExecutionMetrics.DataThroughputMBps.Should().Be(0);
                _viewModel.ExecutionMetrics.ErrorCount.Should().Be(0);
                _viewModel.ExecutionMetrics.EtaMinutes.Should().Be(0);
            }

            [TestMethod]
            public void ActiveMigrationStreams_AddStream_ShouldUpdateCollection()
            {
                // Arrange
                var stream = new MigrationStream
                {
                    StreamId = "stream-001",
                    WaveName = "Wave 1",
                    BatchName = "Batch 1",
                    MigrationType = "User",
                    Status = "Running"
                };

                // Act
                _viewModel.ActiveMigrationStreams.Add(stream);

                // Assert
                _viewModel.ActiveMigrationStreams.Should().HaveCount(1);
                _viewModel.ActiveMigrationStreams.First().StreamId.Should().Be("stream-001");
            }

            [TestMethod]
            public void RecentExecutionEvents_AddEvent_ShouldUpdateCollection()
            {
                // Arrange
                var executionEvent = new ExecutionEvent
                {
                    EventType = "Info",
                    Message = "Migration started",
                    Timestamp = DateTime.Now,
                    EventColor = "Blue"
                };

                // Act
                _viewModel.RecentExecutionEvents.Add(executionEvent);

                // Assert
                _viewModel.RecentExecutionEvents.Should().HaveCount(1);
                _viewModel.RecentExecutionEvents.First().Message.Should().Be("Migration started");
            }
        }

        [TestClass]
        public class PlanningMetricsTests : MigrateViewModelTests
        {
            [TestMethod]
            public void PlanningMetrics_ShouldInitializeWithDefaults()
            {
                // Assert
                _viewModel.PlanningMetrics.Should().NotBeNull();
                _viewModel.PlanningMetrics.TotalWaves.Should().Be(0);
                _viewModel.PlanningMetrics.TotalItems.Should().Be(0);
                _viewModel.PlanningMetrics.EstimatedDuration.Should().Be(TimeSpan.Zero);
                _viewModel.PlanningMetrics.ComplexityScore.Should().Be(0);
            }

            [TestMethod]
            public void PlanningMetrics_PropertyChanged_ShouldWork()
            {
                // Arrange
                var propertyChangedEvents = new List<string>();
                _viewModel.PlanningMetrics.PropertyChanged += (sender, e) => propertyChangedEvents.Add(e.PropertyName);

                // Act
                _viewModel.PlanningMetrics.TotalWaves = 5;
                _viewModel.PlanningMetrics.TotalItems = 1000;
                _viewModel.PlanningMetrics.EstimatedDuration = TimeSpan.FromHours(24);
                _viewModel.PlanningMetrics.ComplexityScore = 75.5;

                // Assert
                propertyChangedEvents.Should().Contain("TotalWaves");
                propertyChangedEvents.Should().Contain("TotalItems");
                propertyChangedEvents.Should().Contain("EstimatedDuration");
                propertyChangedEvents.Should().Contain("ComplexityScore");
            }
        }

        [TestClass]
        public class DiscoveryMetricsTests : MigrateViewModelTests
        {
            [TestMethod]
            public void DiscoveryMetrics_ShouldInitializeWithDefaults()
            {
                // Assert
                _viewModel.DiscoveryMetrics.Should().NotBeNull();
                _viewModel.DiscoveryMetrics.UserCount.Should().Be(0);
                _viewModel.DiscoveryMetrics.MailboxCount.Should().Be(0);
                _viewModel.DiscoveryMetrics.FileShareCount.Should().Be(0);
                _viewModel.DiscoveryMetrics.DependencyCount.Should().Be(0);
                _viewModel.DiscoveryMetrics.ApplicationCount.Should().Be(0);
                _viewModel.DiscoveryMetrics.SecurityGroupCount.Should().Be(0);
            }

            [TestMethod]
            public void DiscoveryMetrics_PropertyChanged_ShouldWork()
            {
                // Arrange
                var propertyChangedEvents = new List<string>();
                _viewModel.DiscoveryMetrics.PropertyChanged += (sender, e) => propertyChangedEvents.Add(e.PropertyName);

                // Act
                _viewModel.DiscoveryMetrics.UserCount = 500;
                _viewModel.DiscoveryMetrics.MailboxCount = 450;
                _viewModel.DiscoveryMetrics.FileShareCount = 25;
                _viewModel.DiscoveryMetrics.DependencyCount = 150;
                _viewModel.DiscoveryMetrics.ApplicationCount = 75;
                _viewModel.DiscoveryMetrics.SecurityGroupCount = 200;

                // Assert
                propertyChangedEvents.Should().Contain("UserCount");
                propertyChangedEvents.Should().Contain("MailboxCount");
                propertyChangedEvents.Should().Contain("FileShareCount");
                propertyChangedEvents.Should().Contain("DependencyCount");
                propertyChangedEvents.Should().Contain("ApplicationCount");
                propertyChangedEvents.Should().Contain("SecurityGroupCount");
            }
        }
    }
}