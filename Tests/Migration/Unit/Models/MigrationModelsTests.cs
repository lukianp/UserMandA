using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Linq;
using FluentAssertions;
using MandADiscoverySuite.Models;
using Microsoft.VisualStudio.TestTools.UnitTesting;

namespace MigrationTestSuite.Unit.Models
{
    [TestClass]
    public class MigrationModelsTests
    {
        [TestClass]
        public class MigrationMetricsTests
        {
            [TestMethod]
            public void MigrationMetrics_PropertyChanged_ShouldFireWhenPropertyUpdated()
            {
                // Arrange
                var metrics = new MigrationMetrics();
                var propertyChangedEvents = new List<string>();
                
                metrics.PropertyChanged += (sender, e) => propertyChangedEvents.Add(e.PropertyName);

                // Act
                metrics.TotalProjects = 10;
                metrics.ActiveMigrations = 5;
                metrics.CompletedMigrations = 3;
                metrics.OverallCompletionPercentage = 75.5;

                // Assert
                propertyChangedEvents.Should().Contain("TotalProjects");
                propertyChangedEvents.Should().Contain("ActiveMigrations");
                propertyChangedEvents.Should().Contain("CompletedMigrations");
                propertyChangedEvents.Should().Contain("OverallCompletionPercentage");
            }

            [TestMethod]
            public void MigrationMetrics_SetSameValue_ShouldNotFirePropertyChanged()
            {
                // Arrange
                var metrics = new MigrationMetrics();
                metrics.TotalProjects = 10;
                var propertyChangedCount = 0;
                
                metrics.PropertyChanged += (sender, e) => propertyChangedCount++;

                // Act
                metrics.TotalProjects = 10; // Same value

                // Assert
                propertyChangedCount.Should().Be(0);
            }

            [TestMethod]
            public void MigrationMetrics_DefaultValues_ShouldBeZero()
            {
                // Arrange & Act
                var metrics = new MigrationMetrics();

                // Assert
                metrics.TotalProjects.Should().Be(0);
                metrics.ActiveMigrations.Should().Be(0);
                metrics.CompletedMigrations.Should().Be(0);
                metrics.OverallCompletionPercentage.Should().Be(0);
            }
        }

        [TestClass]
        public class MigrationOrchestratorProjectTests
        {
            [TestMethod]
            public void MigrationOrchestratorProject_Constructor_ShouldInitializeWithDefaults()
            {
                // Arrange & Act
                var project = new MigrationOrchestratorProject();

                // Assert
                project.Id.Should().NotBeNullOrEmpty();
                project.CreatedDate.Should().BeCloseTo(DateTime.Now, TimeSpan.FromSeconds(1));
                project.Status.Should().Be(MigrationStatus.NotStarted);
                project.Waves.Should().NotBeNull().And.BeEmpty();
                project.Settings.Should().NotBeNull();
                project.Tags.Should().NotBeNull().And.BeEmpty();
            }

            [TestMethod]
            public void MigrationOrchestratorProject_SetProperties_ShouldUpdateCorrectly()
            {
                // Arrange
                var project = new MigrationOrchestratorProject();
                var sourceEnv = new MigrationEnvironment { Name = "Source", Type = "OnPremises" };
                var targetEnv = new MigrationEnvironment { Name = "Target", Type = "Azure" };

                // Act
                project.Name = "Test Migration";
                project.Description = "Test migration project";
                project.Status = MigrationStatus.Planning;
                project.SourceEnvironment = sourceEnv;
                project.TargetEnvironment = targetEnv;

                // Assert
                project.Name.Should().Be("Test Migration");
                project.Description.Should().Be("Test migration project");
                project.Status.Should().Be(MigrationStatus.Planning);
                project.SourceEnvironment.Should().Be(sourceEnv);
                project.TargetEnvironment.Should().Be(targetEnv);
            }

            [TestMethod]
            public void MigrationOrchestratorProject_AddWave_ShouldUpdateWavesList()
            {
                // Arrange
                var project = new MigrationOrchestratorProject();
                var wave = new MigrationOrchestratorWave { Name = "Wave 1", Order = 1 };

                // Act
                project.Waves.Add(wave);

                // Assert
                project.Waves.Should().HaveCount(1);
                project.Waves.First().Name.Should().Be("Wave 1");
            }
        }

        [TestClass]
        public class MigrationBatchTests
        {
            [TestMethod]
            public void MigrationBatch_ProgressPercentage_ShouldCalculateCorrectly()
            {
                // Arrange
                var batch = new MigrationBatch();
                batch.Items.Add(new MigrationItem { Status = MigrationStatus.Completed });
                batch.Items.Add(new MigrationItem { Status = MigrationStatus.Completed });
                batch.Items.Add(new MigrationItem { Status = MigrationStatus.InProgress });
                batch.Items.Add(new MigrationItem { Status = MigrationStatus.NotStarted });

                // Act
                var progressPercentage = batch.ProgressPercentage;

                // Assert
                progressPercentage.Should().Be(50.0); // 2 out of 4 completed
            }

            [TestMethod]
            public void MigrationBatch_EmptyItems_ProgressPercentageShouldBeZero()
            {
                // Arrange
                var batch = new MigrationBatch();

                // Act
                var progressPercentage = batch.ProgressPercentage;

                // Assert
                progressPercentage.Should().Be(0.0);
            }

            [TestMethod]
            public void MigrationBatch_TotalAndCompletedItems_ShouldCalculateCorrectly()
            {
                // Arrange
                var batch = new MigrationBatch();
                batch.Items.Add(new MigrationItem { Status = MigrationStatus.Completed });
                batch.Items.Add(new MigrationItem { Status = MigrationStatus.Failed });
                batch.Items.Add(new MigrationItem { Status = MigrationStatus.Completed });

                // Act & Assert
                batch.TotalItems.Should().Be(3);
                batch.CompletedItems.Should().Be(2);
            }

            [TestMethod]
            public void MigrationBatch_Constructor_ShouldInitializeCollections()
            {
                // Arrange & Act
                var batch = new MigrationBatch();

                // Assert
                batch.Id.Should().NotBeNullOrEmpty();
                batch.Items.Should().NotBeNull().And.BeEmpty();
                batch.Prerequisites.Should().NotBeNull().And.BeEmpty();
                batch.Configuration.Should().NotBeNull().And.BeEmpty();
                batch.Errors.Should().NotBeNull().And.BeEmpty();
                batch.Warnings.Should().NotBeNull().And.BeEmpty();
                batch.Status.Should().Be(MigrationStatus.NotStarted);
            }

            [TestMethod]
            public void MigrationBatch_StatusTransitions_ShouldAllowValidTransitions()
            {
                // Arrange
                var batch = new MigrationBatch();

                // Act & Assert - Test valid status transitions
                batch.Status = MigrationStatus.NotStarted;
                batch.CanStart.Should().BeTrue();
                batch.CanPause.Should().BeFalse();
                batch.CanResume.Should().BeFalse();
                batch.IsRunning.Should().BeFalse();

                batch.Status = MigrationStatus.Ready;
                batch.CanStart.Should().BeTrue();

                batch.Status = MigrationStatus.InProgress;
                batch.CanStart.Should().BeFalse();
                batch.CanPause.Should().BeTrue();
                batch.CanResume.Should().BeFalse();
                batch.IsRunning.Should().BeTrue();

                batch.Status = MigrationStatus.Paused;
                batch.CanStart.Should().BeFalse();
                batch.CanPause.Should().BeFalse();
                batch.CanResume.Should().BeTrue();
                batch.IsRunning.Should().BeFalse();

                batch.Status = MigrationStatus.Completed;
                batch.IsCompleted.Should().BeTrue();
            }

            [TestMethod]
            public void MigrationBatch_FailedItems_ShouldCalculateCorrectly()
            {
                // Arrange
                var batch = new MigrationBatch();
                batch.Items.Add(new MigrationItem { Status = MigrationStatus.Completed });
                batch.Items.Add(new MigrationItem { Status = MigrationStatus.Failed });
                batch.Items.Add(new MigrationItem { Status = MigrationStatus.Failed });
                batch.Items.Add(new MigrationItem { Status = MigrationStatus.InProgress });

                // Act
                var failedItems = batch.FailedItems;

                // Assert
                failedItems.Should().Be(2);
            }

            [TestMethod]
            public void MigrationBatch_ItemsWithWarnings_ShouldCalculateCorrectly()
            {
                // Arrange
                var batch = new MigrationBatch();
                var item1 = new MigrationItem();
                item1.Warnings.Add("Warning 1");
                var item2 = new MigrationItem();
                var item3 = new MigrationItem();
                item3.Warnings.Add("Warning 2");
                item3.Warnings.Add("Warning 3");

                batch.Items.Add(item1);
                batch.Items.Add(item2);
                batch.Items.Add(item3);

                // Act
                var itemsWithWarnings = batch.ItemsWithWarnings;

                // Assert
                itemsWithWarnings.Should().Be(2);
            }

            [TestMethod]
            public void MigrationBatch_InProgressItems_ShouldCalculateCorrectly()
            {
                // Arrange
                var batch = new MigrationBatch();
                batch.Items.Add(new MigrationItem { Status = MigrationStatus.InProgress });
                batch.Items.Add(new MigrationItem { Status = MigrationStatus.InProgress });
                batch.Items.Add(new MigrationItem { Status = MigrationStatus.Completed });
                batch.Items.Add(new MigrationItem { Status = MigrationStatus.NotStarted });

                // Act
                var inProgressItems = batch.InProgressItems;

                // Assert
                inProgressItems.Should().Be(2);
            }

            [TestMethod]
            public void MigrationBatch_PendingItems_ShouldCalculateCorrectly()
            {
                // Arrange
                var batch = new MigrationBatch();
                batch.Items.Add(new MigrationItem { Status = MigrationStatus.NotStarted });
                batch.Items.Add(new MigrationItem { Status = MigrationStatus.NotStarted });
                batch.Items.Add(new MigrationItem { Status = MigrationStatus.NotStarted });
                batch.Items.Add(new MigrationItem { Status = MigrationStatus.Completed });

                // Act
                var pendingItems = batch.PendingItems;

                // Assert
                pendingItems.Should().Be(3);
            }

            [TestMethod]
            public void MigrationBatch_SuccessRate_ShouldCalculateCorrectly()
            {
                // Arrange
                var batch = new MigrationBatch();
                batch.Items.Add(new MigrationItem { Status = MigrationStatus.Completed });
                batch.Items.Add(new MigrationItem { Status = MigrationStatus.Completed });
                batch.Items.Add(new MigrationItem { Status = MigrationStatus.Completed });
                batch.Items.Add(new MigrationItem { Status = MigrationStatus.Failed });

                // Act
                var successRate = batch.SuccessRate;

                // Assert
                successRate.Should().Be(50.0); // 3 completed, 1 failed out of 4 total = (3-1)/4 * 100 = 50%
            }

            [TestMethod]
            public void MigrationBatch_TotalSizeBytes_ShouldSumCorrectly()
            {
                // Arrange
                var batch = new MigrationBatch();
                batch.Items.Add(new MigrationItem { SizeBytes = 1024 });
                batch.Items.Add(new MigrationItem { SizeBytes = 2048 });
                batch.Items.Add(new MigrationItem { SizeBytes = null });
                batch.Items.Add(new MigrationItem { SizeBytes = 4096 });

                // Act
                var totalSize = batch.TotalSizeBytes;

                // Assert
                totalSize.Should().Be(7168); // 1024 + 2048 + 0 + 4096
            }

            [TestMethod]
            public void MigrationBatch_TransferredBytes_ShouldSumCorrectly()
            {
                // Arrange
                var batch = new MigrationBatch();
                batch.Items.Add(new MigrationItem { TransferredBytes = 512 });
                batch.Items.Add(new MigrationItem { TransferredBytes = 1024 });
                batch.Items.Add(new MigrationItem { TransferredBytes = null });
                batch.Items.Add(new MigrationItem { TransferredBytes = 2048 });

                // Act
                var transferredBytes = batch.TransferredBytes;

                // Assert
                transferredBytes.Should().Be(3584); // 512 + 1024 + 0 + 2048
            }

            [TestMethod]
            public void MigrationBatch_AverageTransferRateMBps_ShouldCalculateCorrectly()
            {
                // Arrange
                var batch = new MigrationBatch();
                batch.Items.Add(new MigrationItem { TransferRateMBps = 10.5 });
                batch.Items.Add(new MigrationItem { TransferRateMBps = 15.0 });
                batch.Items.Add(new MigrationItem { TransferRateMBps = 0 }); // Should be excluded
                batch.Items.Add(new MigrationItem { TransferRateMBps = 8.5 });

                // Act
                var averageRate = batch.AverageTransferRateMBps;

                // Assert
                averageRate.Should().BeApproximately(11.33, 0.01); // (10.5 + 15.0 + 8.5) / 3
            }

            [TestMethod]
            public void MigrationBatch_FormattedTotalSize_ShouldFormatCorrectly()
            {
                // Arrange
                var batch = new MigrationBatch();
                batch.Items.Add(new MigrationItem { SizeBytes = 1024 * 1024 }); // 1 MB
                batch.Items.Add(new MigrationItem { SizeBytes = 2 * 1024 * 1024 }); // 2 MB

                // Act
                var formattedSize = batch.FormattedTotalSize;

                // Assert
                formattedSize.Should().Be("3 MB");
            }

            [TestMethod]
            public void MigrationBatch_ActualDuration_ShouldCalculateCorrectly()
            {
                // Arrange
                var batch = new MigrationBatch();
                var startTime = new DateTime(2023, 1, 1, 10, 0, 0);
                var endTime = new DateTime(2023, 1, 1, 12, 30, 0);

                // Act
                batch.StartTime = startTime;
                batch.EndTime = endTime;

                // Assert
                batch.ActualDuration.Should().Be(TimeSpan.FromHours(2.5));
            }

            [TestMethod]
            public void MigrationBatch_ActualDuration_WithoutEndTime_ShouldBeNull()
            {
                // Arrange
                var batch = new MigrationBatch();
                batch.StartTime = DateTime.Now;

                // Act & Assert
                batch.ActualDuration.Should().BeNull();
            }

            [TestMethod]
            public void MigrationBatch_HasErrors_ShouldDetectErrorsCorrectly()
            {
                // Arrange
                var batch = new MigrationBatch();

                // Initially no errors
                batch.HasErrors.Should().BeFalse();

                // Add batch-level error
                batch.Errors.Add("Batch error");
                batch.HasErrors.Should().BeTrue();

                // Clear batch errors and add item with error
                batch.Errors.Clear();
                var item = new MigrationItem();
                item.Errors.Add("Item error");
                batch.Items.Add(item);

                // Should still detect errors at item level
                batch.HasErrors.Should().BeTrue();
            }

            [TestMethod]
            public void MigrationBatch_HasWarnings_ShouldDetectWarningsCorrectly()
            {
                // Arrange
                var batch = new MigrationBatch();

                // Initially no warnings
                batch.HasWarnings.Should().BeFalse();

                // Add batch-level warning
                batch.Warnings.Add("Batch warning");
                batch.HasWarnings.Should().BeTrue();

                // Clear batch warnings and add item with warning
                batch.Warnings.Clear();
                var item = new MigrationItem();
                item.Warnings.Add("Item warning");
                batch.Items.Add(item);

                // Should still detect warnings at item level
                batch.HasWarnings.Should().BeTrue();
            }

            [TestMethod]
            public void MigrationBatch_IsHighRisk_ShouldDetectRiskCorrectly()
            {
                // Arrange
                var batch = new MigrationBatch();

                // Initially not high risk
                batch.IsHighRisk.Should().BeFalse();

                // Set high risk complexity
                batch.Complexity = MigrationComplexity.HighRisk;
                batch.IsHighRisk.Should().BeTrue();

                // Reset and set critical priority
                batch.Complexity = MigrationComplexity.Simple;
                batch.Priority = MigrationPriority.Critical;
                batch.IsHighRisk.Should().BeTrue();

                // Reset and add high-risk item
                batch.Priority = MigrationPriority.Normal;
                var item = new MigrationItem { Complexity = MigrationComplexity.HighRisk };
                batch.Items.Add(item);
                batch.IsHighRisk.Should().BeTrue();
            }

            [TestMethod]
            public void MigrationBatch_GetHighRiskItems_ShouldReturnCorrectItems()
            {
                // Arrange
                var batch = new MigrationBatch();
                var lowRiskItem = new MigrationItem { Complexity = MigrationComplexity.Simple };
                var highRiskItem1 = new MigrationItem { Complexity = MigrationComplexity.HighRisk };
                var highRiskItem2 = new MigrationItem { Priority = MigrationPriority.Critical };
                var normalItem = new MigrationItem { Complexity = MigrationComplexity.Moderate };

                batch.Items.AddRange(new[] { lowRiskItem, highRiskItem1, highRiskItem2, normalItem });

                // Act
                var highRiskItems = batch.GetHighRiskItems();

                // Assert
                highRiskItems.Should().HaveCount(2);
                highRiskItems.Should().Contain(highRiskItem1);
                highRiskItems.Should().Contain(highRiskItem2);
            }

            [TestMethod]
            public void MigrationBatch_GetItemsByStatus_ShouldFilterCorrectly()
            {
                // Arrange
                var batch = new MigrationBatch();
                batch.Items.Add(new MigrationItem { Status = MigrationStatus.Completed });
                batch.Items.Add(new MigrationItem { Status = MigrationStatus.InProgress });
                batch.Items.Add(new MigrationItem { Status = MigrationStatus.Completed });
                batch.Items.Add(new MigrationItem { Status = MigrationStatus.Failed });

                // Act
                var completedItems = batch.GetItemsByStatus(MigrationStatus.Completed);
                var inProgressItems = batch.GetItemsByStatus(MigrationStatus.InProgress);
                var failedItems = batch.GetItemsByStatus(MigrationStatus.Failed);

                // Assert
                completedItems.Should().HaveCount(2);
                inProgressItems.Should().HaveCount(1);
                failedItems.Should().HaveCount(1);
            }

            [TestMethod]
            public void MigrationBatch_GetEstimatedTimeRemaining_ShouldCalculateCorrectly()
            {
                // Arrange
                var batch = new MigrationBatch();
                var startTime = DateTime.Now.AddMinutes(-30); // Started 30 minutes ago
                batch.StartTime = startTime;
                batch.Items.Add(new MigrationItem { Status = MigrationStatus.Completed });
                batch.Items.Add(new MigrationItem { Status = MigrationStatus.Completed });
                batch.Items.Add(new MigrationItem { Status = MigrationStatus.InProgress });
                batch.Items.Add(new MigrationItem { Status = MigrationStatus.NotStarted });

                // Act - 50% complete, so should estimate another 30 minutes
                var estimatedTimeRemaining = batch.GetEstimatedTimeRemaining();

                // Assert
                estimatedTimeRemaining.Should().NotBeNull();
                estimatedTimeRemaining.Value.TotalMinutes.Should().BeApproximately(30, 1);
            }

            [TestMethod]
            public void MigrationBatch_GetEstimatedTimeRemaining_WithoutStartTime_ShouldReturnNull()
            {
                // Arrange
                var batch = new MigrationBatch();
                batch.Items.Add(new MigrationItem { Status = MigrationStatus.Completed });

                // Act
                var estimatedTimeRemaining = batch.GetEstimatedTimeRemaining();

                // Assert
                estimatedTimeRemaining.Should().BeNull();
            }

            [TestMethod]
            public void MigrationBatch_UpdateProgress_ShouldNotThrow()
            {
                // Arrange
                var batch = new MigrationBatch();
                batch.Items.Add(new MigrationItem { Status = MigrationStatus.Completed });
                batch.Items.Add(new MigrationItem { Status = MigrationStatus.InProgress });

                // Act & Assert
                Action updateAction = () => batch.UpdateProgress();
                updateAction.Should().NotThrow();
            }

            [TestMethod]
            public void MigrationBatch_DefaultSettings_ShouldBeConfiguredCorrectly()
            {
                // Arrange & Act
                var batch = new MigrationBatch();

                // Assert
                batch.MaxConcurrentItems.Should().Be(5);
                batch.EnableAutoRetry.Should().BeTrue();
                batch.MaxRetryAttempts.Should().Be(3);
                batch.RetryDelay.Should().Be(TimeSpan.FromMinutes(5));
                batch.SupportsRollback.Should().BeTrue();
                batch.Priority.Should().Be(MigrationPriority.Normal);
                batch.Complexity.Should().Be(MigrationComplexity.Simple);
            }

            [TestMethod]
            public void MigrationBatch_ConfigurationDictionary_ShouldAllowCustomSettings()
            {
                // Arrange
                var batch = new MigrationBatch();

                // Act
                batch.Configuration["CustomSetting1"] = "Value1";
                batch.Configuration["CustomSetting2"] = 42;
                batch.Configuration["CustomSetting3"] = true;

                // Assert
                batch.Configuration.Should().HaveCount(3);
                batch.Configuration["CustomSetting1"].Should().Be("Value1");
                batch.Configuration["CustomSetting2"].Should().Be(42);
                batch.Configuration["CustomSetting3"].Should().Be(true);
            }

            [TestMethod]
            public void MigrationBatch_ErrorHandling_ShouldManageErrorsCorrectly()
            {
                // Arrange
                var batch = new MigrationBatch();

                // Act
                batch.Errors.Add("Configuration error");
                batch.Errors.Add("Network connectivity issue");
                batch.Warnings.Add("Performance warning");

                // Assert
                batch.Errors.Should().HaveCount(2);
                batch.Warnings.Should().HaveCount(1);
                batch.HasErrors.Should().BeTrue();
                batch.HasWarnings.Should().BeTrue();
            }
        }

        [TestClass]
        public class MigrationItemTests
        {
            [TestMethod]
            public void MigrationItem_Constructor_ShouldInitializeWithDefaults()
            {
                // Arrange & Act
                var item = new MigrationItem();

                // Assert
                item.Id.Should().NotBeNullOrEmpty();
                item.Status.Should().Be(MigrationStatus.NotStarted);
                item.Errors.Should().NotBeNull().And.BeEmpty();
                item.Warnings.Should().NotBeNull().And.BeEmpty();
                item.Properties.Should().NotBeNull().And.BeEmpty();
                item.Dependencies.Should().NotBeNull().And.BeEmpty();
                item.ProgressPercentage.Should().Be(0);
                item.RetryCount.Should().Be(0);
            }

            [TestMethod]
            public void MigrationItem_SetProperties_ShouldUpdateCorrectly()
            {
                // Arrange
                var item = new MigrationItem();
                var startTime = DateTime.Now;
                var endTime = startTime.AddMinutes(30);

                // Act
                item.SourceIdentity = "user@source.com";
                item.TargetIdentity = "user@target.com";
                item.Type = MigrationType.User;
                item.Status = MigrationStatus.Completed;
                item.StartTime = startTime;
                item.EndTime = endTime;
                item.DisplayName = "Test User";
                item.SizeBytes = 1024000;
                item.ProgressPercentage = 100;

                // Assert
                item.SourceIdentity.Should().Be("user@source.com");
                item.TargetIdentity.Should().Be("user@target.com");
                item.Type.Should().Be(MigrationType.User);
                item.Status.Should().Be(MigrationStatus.Completed);
                item.StartTime.Should().Be(startTime);
                item.EndTime.Should().Be(endTime);
                item.DisplayName.Should().Be("Test User");
                item.SizeBytes.Should().Be(1024000);
                item.ProgressPercentage.Should().Be(100);
            }

            [TestMethod]
            public void MigrationItem_AddErrorsAndWarnings_ShouldUpdateCollections()
            {
                // Arrange
                var item = new MigrationItem();

                // Act
                item.Errors.Add("Error 1");
                item.Errors.Add("Error 2");
                item.Warnings.Add("Warning 1");

                // Assert
                item.Errors.Should().HaveCount(2);
                item.Warnings.Should().HaveCount(1);
            }
        }

        [TestClass]
        public class MigrationEnvironmentTests
        {
            [TestMethod]
            public void MigrationEnvironment_Constructor_ShouldInitializeCollections()
            {
                // Arrange & Act
                var environment = new MigrationEnvironment();

                // Assert
                environment.ConnectionStrings.Should().NotBeNull().And.BeEmpty();
                environment.Configuration.Should().NotBeNull().And.BeEmpty();
                environment.Capabilities.Should().NotBeNull().And.BeEmpty();
                environment.Credentials.Should().NotBeNull().And.BeEmpty();
            }

            [TestMethod]
            public void MigrationEnvironment_SetProperties_ShouldUpdateCorrectly()
            {
                // Arrange
                var environment = new MigrationEnvironment();
                var lastHealthCheck = DateTime.Now;

                // Act
                environment.Name = "Production Azure";
                environment.Type = "Azure";
                environment.IsConnected = true;
                environment.HealthStatus = "Healthy";
                environment.LastHealthCheck = lastHealthCheck;

                // Assert
                environment.Name.Should().Be("Production Azure");
                environment.Type.Should().Be("Azure");
                environment.IsConnected.Should().BeTrue();
                environment.HealthStatus.Should().Be("Healthy");
                environment.LastHealthCheck.Should().Be(lastHealthCheck);
            }

            [TestMethod]
            public void MigrationEnvironment_AddCapabilities_ShouldUpdateCollection()
            {
                // Arrange
                var environment = new MigrationEnvironment();

                // Act
                environment.Capabilities.Add("Exchange Online");
                environment.Capabilities.Add("SharePoint Online");
                environment.Capabilities.Add("OneDrive");

                // Assert
                environment.Capabilities.Should().HaveCount(3);
                environment.Capabilities.Should().Contain("Exchange Online");
            }
        }

        [TestClass]
        public class MigrationSettingsTests
        {
            [TestMethod]
            public void MigrationSettings_Constructor_ShouldSetDefaults()
            {
                // Arrange & Act
                var settings = new MigrationSettings();

                // Assert
                settings.EnableRollback.Should().BeTrue();
                settings.ValidateBeforeMigration.Should().BeTrue();
                settings.MaxConcurrentMigrations.Should().Be(5);
                settings.RetryAttempts.Should().Be(3);
                settings.RetryDelay.Should().Be(TimeSpan.FromMinutes(5));
                settings.PreservePermissions.Should().BeTrue();
                settings.CreateMissingTargetContainers.Should().BeTrue();
                settings.PauseOnError.Should().BeFalse();
                settings.GenerateDetailedLogs.Should().BeTrue();
                settings.TypeSpecificSettings.Should().NotBeNull().And.BeEmpty();
                settings.ExcludedItems.Should().NotBeNull().And.BeEmpty();
            }

            [TestMethod]
            public void MigrationSettings_UpdateSettings_ShouldModifyCorrectly()
            {
                // Arrange
                var settings = new MigrationSettings();

                // Act
                settings.MaxConcurrentMigrations = 10;
                settings.RetryAttempts = 5;
                settings.RetryDelay = TimeSpan.FromMinutes(10);
                settings.PauseOnError = true;
                settings.NotificationEmail = "admin@company.com";

                // Assert
                settings.MaxConcurrentMigrations.Should().Be(10);
                settings.RetryAttempts.Should().Be(5);
                settings.RetryDelay.Should().Be(TimeSpan.FromMinutes(10));
                settings.PauseOnError.Should().BeTrue();
                settings.NotificationEmail.Should().Be("admin@company.com");
            }
        }

        [TestClass]
        public class SecurityGroupMappingTests
        {
            [TestMethod]
            public void SecurityGroupMapping_Constructor_ShouldInitializeCollections()
            {
                // Arrange & Act
                var mapping = new SecurityGroupMapping();

                // Assert
                mapping.ConflictingGroups.Should().NotBeNull().And.BeEmpty();
                mapping.Properties.Should().NotBeNull().And.BeEmpty();
                mapping.IsConfirmed.Should().BeFalse();
            }

            [TestMethod]
            public void SecurityGroupMapping_SetProperties_ShouldUpdateCorrectly()
            {
                // Arrange
                var mapping = new SecurityGroupMapping();

                // Act
                mapping.SourceGroupName = "Domain Users";
                mapping.TargetGroupName = "Azure AD Users";
                mapping.MappingType = "Manual";
                mapping.IsConfirmed = true;
                mapping.Description = "Standard user group mapping";

                // Assert
                mapping.SourceGroupName.Should().Be("Domain Users");
                mapping.TargetGroupName.Should().Be("Azure AD Users");
                mapping.MappingType.Should().Be("Manual");
                mapping.IsConfirmed.Should().BeTrue();
                mapping.Description.Should().Be("Standard user group mapping");
            }

            [TestMethod]
            public void SecurityGroupMapping_AddConflicts_ShouldUpdateCollection()
            {
                // Arrange
                var mapping = new SecurityGroupMapping();

                // Act
                mapping.ConflictingGroups.Add("Existing Group 1");
                mapping.ConflictingGroups.Add("Existing Group 2");

                // Assert
                mapping.ConflictingGroups.Should().HaveCount(2);
            }
        }

        [TestClass]
        public class MigrationResultTests
        {
            [TestMethod]
            public void MigrationResult_Constructor_ShouldInitializeCollections()
            {
                // Arrange & Act
                var result = new MigrationResult();

                // Assert
                result.Errors.Should().NotBeNull().And.BeEmpty();
                result.Warnings.Should().NotBeNull().And.BeEmpty();
                result.Metrics.Should().NotBeNull().And.BeEmpty();
            }

            [TestMethod]
            public void MigrationResult_Duration_ShouldCalculateCorrectly()
            {
                // Arrange
                var result = new MigrationResult();
                var startTime = new DateTime(2023, 1, 1, 10, 0, 0);
                var endTime = new DateTime(2023, 1, 1, 12, 30, 0);

                // Act
                result.StartTime = startTime;
                result.EndTime = endTime;

                // Assert
                result.Duration.Should().Be(TimeSpan.FromHours(2.5));
            }

            [TestMethod]
            public void MigrationResult_SuccessRate_ShouldCalculateCorrectly()
            {
                // Arrange
                var result = new MigrationResult();

                // Act
                result.TotalItems = 100;
                result.SuccessfulItems = 85;
                result.FailedItems = 10;
                result.WarningItems = 5;

                // Assert
                result.SuccessRate.Should().Be(85.0);
            }

            [TestMethod]
            public void MigrationResult_SuccessRateWithZeroTotal_ShouldBeZero()
            {
                // Arrange
                var result = new MigrationResult();

                // Act
                result.TotalItems = 0;
                result.SuccessfulItems = 0;

                // Assert
                result.SuccessRate.Should().Be(0.0);
            }
        }

        [TestClass]
        public class ValidationMetricsTests
        {
            private ValidationMetrics _metrics;
            private List<string> _propertyChangedEvents;

            [TestInitialize]
            public void Setup()
            {
                _metrics = new ValidationMetrics();
                _propertyChangedEvents = new List<string>();
                _metrics.PropertyChanged += (sender, e) => _propertyChangedEvents.Add(e.PropertyName);
            }

            [TestMethod]
            public void ValidationMetrics_PropertyChanged_ShouldFireForAllProperties()
            {
                // Act
                _metrics.TotalChecks = 50;
                _metrics.PassedChecks = 45;
                _metrics.FailedChecks = 5;
                _metrics.SuccessRate = 90.0;

                // Assert
                _propertyChangedEvents.Should().Contain("TotalChecks");
                _propertyChangedEvents.Should().Contain("PassedChecks");
                _propertyChangedEvents.Should().Contain("FailedChecks");
                _propertyChangedEvents.Should().Contain("SuccessRate");
            }

            [TestMethod]
            public void ValidationMetrics_SameValueSet_ShouldNotFirePropertyChanged()
            {
                // Arrange
                _metrics.TotalChecks = 10;
                _propertyChangedEvents.Clear();

                // Act
                _metrics.TotalChecks = 10; // Same value

                // Assert
                _propertyChangedEvents.Should().BeEmpty();
            }
        }

        [TestClass]
        public class MigrationTypeEnumTests
        {
            [TestMethod]
            public void MigrationType_ShouldHaveExpectedValues()
            {
                // Assert
                Enum.IsDefined(typeof(MigrationType), "User").Should().BeTrue();
                Enum.IsDefined(typeof(MigrationType), "Mailbox").Should().BeTrue();
                Enum.IsDefined(typeof(MigrationType), "FileShare").Should().BeTrue();
                Enum.IsDefined(typeof(MigrationType), "SharePoint").Should().BeTrue();
                Enum.IsDefined(typeof(MigrationType), "VirtualMachine").Should().BeTrue();
                Enum.IsDefined(typeof(MigrationType), "Application").Should().BeTrue();
                Enum.IsDefined(typeof(MigrationType), "Database").Should().BeTrue();
                Enum.IsDefined(typeof(MigrationType), "SecurityGroup").Should().BeTrue();
                Enum.IsDefined(typeof(MigrationType), "OrganizationalUnit").Should().BeTrue();
                Enum.IsDefined(typeof(MigrationType), "Certificate").Should().BeTrue();
                Enum.IsDefined(typeof(MigrationType), "GPO").Should().BeTrue();
            }

            [TestMethod]
            public void MigrationType_ShouldHaveCorrectCount()
            {
                // Act
                var values = Enum.GetValues(typeof(MigrationType));

                // Assert
                values.Length.Should().Be(22); // Updated count for all migration types
            }
        }

        [TestClass]
        public class MigrationStatusEnumTests
        {
            [TestMethod]
            public void MigrationStatus_ShouldHaveExpectedValues()
            {
                // Assert
                Enum.IsDefined(typeof(MigrationStatus), "NotStarted").Should().BeTrue();
                Enum.IsDefined(typeof(MigrationStatus), "Planning").Should().BeTrue();
                Enum.IsDefined(typeof(MigrationStatus), "Validating").Should().BeTrue();
                Enum.IsDefined(typeof(MigrationStatus), "Ready").Should().BeTrue();
                Enum.IsDefined(typeof(MigrationStatus), "InProgress").Should().BeTrue();
                Enum.IsDefined(typeof(MigrationStatus), "Paused").Should().BeTrue();
                Enum.IsDefined(typeof(MigrationStatus), "Completed").Should().BeTrue();
                Enum.IsDefined(typeof(MigrationStatus), "CompletedWithWarnings").Should().BeTrue();
                Enum.IsDefined(typeof(MigrationStatus), "Failed").Should().BeTrue();
                Enum.IsDefined(typeof(MigrationStatus), "Cancelled").Should().BeTrue();
                Enum.IsDefined(typeof(MigrationStatus), "RolledBack").Should().BeTrue();
            }
        }

        [TestClass]
        public class MigrationWaveExtendedTests
        {
            [TestMethod]
            public void MigrationWaveExtended_TotalItems_ShouldCalculateFromBatches()
            {
                // Arrange
                var wave = new MigrationWaveExtended();
                var batch1 = new MigrationBatch();
                batch1.Items.Add(new MigrationItem());
                batch1.Items.Add(new MigrationItem());
                
                var batch2 = new MigrationBatch();
                batch2.Items.Add(new MigrationItem());
                batch2.Items.Add(new MigrationItem());
                batch2.Items.Add(new MigrationItem());

                wave.Batches.Add(batch1);
                wave.Batches.Add(batch2);

                // Act
                var totalItems = wave.TotalItems;

                // Assert
                totalItems.Should().Be(5);
            }

            [TestMethod]
            public void MigrationWaveExtended_ProgressPercentage_ShouldCalculateFromBatches()
            {
                // Arrange
                var wave = new MigrationWaveExtended();
                var batch1 = new MigrationBatch();
                batch1.Items.Add(new MigrationItem { Status = MigrationStatus.Completed });
                batch1.Items.Add(new MigrationItem { Status = MigrationStatus.Completed });
                
                var batch2 = new MigrationBatch();
                batch2.Items.Add(new MigrationItem { Status = MigrationStatus.Completed });
                batch2.Items.Add(new MigrationItem { Status = MigrationStatus.InProgress });

                wave.Batches.Add(batch1);
                wave.Batches.Add(batch2);

                // Act
                var progressPercentage = wave.ProgressPercentage;

                // Assert
                progressPercentage.Should().Be(75.0); // Average of 100% and 50%
            }

            [TestMethod]
            public void MigrationWaveExtended_EmptyBatches_ShouldReturnZero()
            {
                // Arrange
                var wave = new MigrationWaveExtended();

                // Act & Assert
                wave.TotalItems.Should().Be(0);
                wave.ProgressPercentage.Should().Be(0);
            }
        }
    }
}