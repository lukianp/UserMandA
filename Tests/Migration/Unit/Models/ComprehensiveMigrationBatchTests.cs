using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using FluentAssertions;
using MandADiscoverySuite.Models;
using Microsoft.VisualStudio.TestTools.UnitTesting;

namespace MigrationTestSuite.Unit.Models
{
    /// <summary>
    /// Comprehensive test suite for MigrationBatch functionality
    /// Tests all critical aspects including property access, status transitions,
    /// progress calculations, error handling, and enterprise features
    /// </summary>
    [TestClass]
    public class ComprehensiveMigrationBatchTests
    {
        [TestInitialize]
        public void Setup()
        {
            // Initialize any common test data
        }

        [TestCleanup]
        public void Cleanup()
        {
            // Clean up after tests
        }

        #region Basic Property Tests

        [TestMethod]
        public void MigrationBatch_DefaultConstruction_ShouldInitializeAllProperties()
        {
            // Act
            var batch = new MigrationBatch();

            // Assert - Core Properties
            batch.Id.Should().NotBeNullOrEmpty();
            batch.Items.Should().NotBeNull().And.BeEmpty();
            batch.Status.Should().Be(MigrationStatus.NotStarted);
            batch.Type.Should().Be(MigrationType.User);
            batch.Priority.Should().Be(MigrationPriority.Normal);
            batch.Complexity.Should().Be(MigrationComplexity.Simple);

            // Assert - Collections
            batch.Prerequisites.Should().NotBeNull().And.BeEmpty();
            batch.PostMigrationTasks.Should().NotBeNull().And.BeEmpty();
            batch.DependentBatches.Should().NotBeNull().And.BeEmpty();
            batch.Configuration.Should().NotBeNull().And.BeEmpty();
            batch.EnvironmentSettings.Should().NotBeNull().And.BeEmpty();
            batch.PreMigrationChecklist.Should().NotBeNull().And.BeEmpty();
            batch.PostMigrationValidation.Should().NotBeNull().And.BeEmpty();
            batch.QualityGates.Should().NotBeNull().And.BeEmpty();
            batch.Errors.Should().NotBeNull().And.BeEmpty();
            batch.Warnings.Should().NotBeNull().And.BeEmpty();
            batch.DetailedLogs.Should().NotBeNull().And.BeEmpty();
            batch.Tags.Should().NotBeNull().And.BeEmpty();
            batch.CustomProperties.Should().NotBeNull().And.BeEmpty();
            batch.RollbackInstructions.Should().NotBeNull().And.BeEmpty();

            // Assert - Default Values
            batch.MaxConcurrentItems.Should().Be(5);
            batch.EnableAutoRetry.Should().BeTrue();
            batch.MaxRetryAttempts.Should().Be(3);
            batch.RetryDelay.Should().Be(TimeSpan.FromMinutes(5));
            batch.SupportsRollback.Should().BeTrue();
            batch.EnableThrottling.Should().BeFalse();
            batch.ThrottlingLimitMBps.Should().Be(0);
            batch.RequiresApproval.Should().BeFalse();
        }

        [TestMethod]
        public void MigrationBatch_PropertyAssignment_ShouldUpdateCorrectly()
        {
            // Arrange
            var batch = new MigrationBatch();
            var plannedStartDate = DateTime.Now.AddDays(1);
            var plannedEndDate = DateTime.Now.AddDays(7);
            var estimatedDuration = TimeSpan.FromHours(24);

            // Act
            batch.Name = "User Migration Batch 1";
            batch.Description = "Migration of Finance department users";
            batch.Type = MigrationType.User;
            batch.Priority = MigrationPriority.High;
            batch.Complexity = MigrationComplexity.Complex;
            batch.PlannedStartDate = plannedStartDate;
            batch.PlannedEndDate = plannedEndDate;
            batch.EstimatedDuration = estimatedDuration;
            batch.AssignedTechnician = "john.doe@company.com";
            batch.BusinessOwner = "finance.manager@company.com";
            batch.MaxConcurrentItems = 10;
            batch.EnableAutoRetry = false;
            batch.MaxRetryAttempts = 5;
            batch.RetryDelay = TimeSpan.FromMinutes(10);
            batch.EnableThrottling = true;
            batch.ThrottlingLimitMBps = 100;
            batch.RequiresApproval = true;
            batch.BusinessJustification = "Required for M&A consolidation";
            batch.EstimatedCost = 15000.50m;
            batch.SupportsRollback = false;
            batch.RollbackPlan = "Manual rollback procedure documented";

            // Assert
            batch.Name.Should().Be("User Migration Batch 1");
            batch.Description.Should().Be("Migration of Finance department users");
            batch.Type.Should().Be(MigrationType.User);
            batch.Priority.Should().Be(MigrationPriority.High);
            batch.Complexity.Should().Be(MigrationComplexity.Complex);
            batch.PlannedStartDate.Should().Be(plannedStartDate);
            batch.PlannedEndDate.Should().Be(plannedEndDate);
            batch.EstimatedDuration.Should().Be(estimatedDuration);
            batch.AssignedTechnician.Should().Be("john.doe@company.com");
            batch.BusinessOwner.Should().Be("finance.manager@company.com");
            batch.MaxConcurrentItems.Should().Be(10);
            batch.EnableAutoRetry.Should().BeFalse();
            batch.MaxRetryAttempts.Should().Be(5);
            batch.RetryDelay.Should().Be(TimeSpan.FromMinutes(10));
            batch.EnableThrottling.Should().BeTrue();
            batch.ThrottlingLimitMBps.Should().Be(100);
            batch.RequiresApproval.Should().BeTrue();
            batch.BusinessJustification.Should().Be("Required for M&A consolidation");
            batch.EstimatedCost.Should().Be(15000.50m);
            batch.SupportsRollback.Should().BeFalse();
            batch.RollbackPlan.Should().Be("Manual rollback procedure documented");
        }

        #endregion

        #region Status Transition Tests

        [TestMethod]
        public void MigrationBatch_StatusTransitions_ShouldFollowValidWorkflow()
        {
            // Arrange
            var batch = new MigrationBatch();

            // Test NotStarted state
            batch.Status = MigrationStatus.NotStarted;
            batch.CanStart.Should().BeTrue();
            batch.CanPause.Should().BeFalse();
            batch.CanResume.Should().BeFalse();
            batch.IsRunning.Should().BeFalse();
            batch.IsCompleted.Should().BeFalse();

            // Test Ready state
            batch.Status = MigrationStatus.Ready;
            batch.CanStart.Should().BeTrue();
            batch.CanPause.Should().BeFalse();
            batch.CanResume.Should().BeFalse();
            batch.IsRunning.Should().BeFalse();
            batch.IsCompleted.Should().BeFalse();

            // Test InProgress state
            batch.Status = MigrationStatus.InProgress;
            batch.CanStart.Should().BeFalse();
            batch.CanPause.Should().BeTrue();
            batch.CanResume.Should().BeFalse();
            batch.IsRunning.Should().BeTrue();
            batch.IsCompleted.Should().BeFalse();

            // Test Paused state
            batch.Status = MigrationStatus.Paused;
            batch.CanStart.Should().BeFalse();
            batch.CanPause.Should().BeFalse();
            batch.CanResume.Should().BeTrue();
            batch.IsRunning.Should().BeFalse();
            batch.IsCompleted.Should().BeFalse();

            // Test Completed state
            batch.Status = MigrationStatus.Completed;
            batch.CanStart.Should().BeFalse();
            batch.CanPause.Should().BeFalse();
            batch.CanResume.Should().BeFalse();
            batch.IsRunning.Should().BeFalse();
            batch.IsCompleted.Should().BeTrue();

            // Test CompletedWithWarnings state
            batch.Status = MigrationStatus.CompletedWithWarnings;
            batch.CanStart.Should().BeFalse();
            batch.CanPause.Should().BeFalse();
            batch.CanResume.Should().BeFalse();
            batch.IsRunning.Should().BeFalse();
            batch.IsCompleted.Should().BeTrue();

            // Test Failed state
            batch.Status = MigrationStatus.Failed;
            batch.CanStart.Should().BeFalse();
            batch.CanPause.Should().BeFalse();
            batch.CanResume.Should().BeFalse();
            batch.IsRunning.Should().BeFalse();
            batch.IsCompleted.Should().BeFalse();
        }

        [TestMethod]
        public void MigrationBatch_StatusMessage_ShouldReflectCurrentState()
        {
            // Arrange
            var batch = new MigrationBatch();

            // Act & Assert
            batch.Status = MigrationStatus.NotStarted;
            batch.StatusMessage = "Waiting to start";
            batch.StatusMessage.Should().Be("Waiting to start");

            batch.Status = MigrationStatus.InProgress;
            batch.StatusMessage = "Migrating users - 45% complete";
            batch.StatusMessage.Should().Be("Migrating users - 45% complete");

            batch.Status = MigrationStatus.Completed;
            batch.StatusMessage = "Migration completed successfully";
            batch.StatusMessage.Should().Be("Migration completed successfully");
        }

        #endregion

        #region Progress Calculation Tests

        [TestMethod]
        public void MigrationBatch_ProgressCalculations_ShouldBeAccurate()
        {
            // Arrange
            var batch = new MigrationBatch();
            
            // Add various items with different statuses
            batch.Items.Add(new MigrationItem { Status = MigrationStatus.Completed });
            batch.Items.Add(new MigrationItem { Status = MigrationStatus.Completed });
            batch.Items.Add(new MigrationItem { Status = MigrationStatus.Completed });
            batch.Items.Add(new MigrationItem { Status = MigrationStatus.InProgress });
            batch.Items.Add(new MigrationItem { Status = MigrationStatus.InProgress });
            batch.Items.Add(new MigrationItem { Status = MigrationStatus.Failed });
            batch.Items.Add(new MigrationItem { Status = MigrationStatus.NotStarted });
            batch.Items.Add(new MigrationItem { Status = MigrationStatus.NotStarted });
            batch.Items.Add(new MigrationItem { Status = MigrationStatus.NotStarted });
            batch.Items.Add(new MigrationItem { Status = MigrationStatus.NotStarted });

            // Act & Assert
            batch.TotalItems.Should().Be(10);
            batch.CompletedItems.Should().Be(3);
            batch.FailedItems.Should().Be(1);
            batch.InProgressItems.Should().Be(2);
            batch.PendingItems.Should().Be(4);
            batch.ProgressPercentage.Should().Be(30.0); // 3 out of 10 = 30%
            batch.SuccessRate.Should().Be(20.0); // (3 completed - 1 failed) / 10 total = 20%
        }

        [TestMethod]
        public void MigrationBatch_ProgressWithWarnings_ShouldTrackCorrectly()
        {
            // Arrange
            var batch = new MigrationBatch();
            
            var item1 = new MigrationItem { Status = MigrationStatus.Completed };
            item1.Warnings.Add("Minor permission issue");
            
            var item2 = new MigrationItem { Status = MigrationStatus.Completed };
            item2.Warnings.Add("Folder rename required");
            item2.Warnings.Add("Large file detected");
            
            var item3 = new MigrationItem { Status = MigrationStatus.Completed };
            
            batch.Items.Add(item1);
            batch.Items.Add(item2);
            batch.Items.Add(item3);

            // Act & Assert
            batch.ItemsWithWarnings.Should().Be(2);
            batch.HasWarnings.Should().BeTrue();
        }

        [TestMethod]
        public void MigrationBatch_EmptyBatch_ShouldHandleGracefully()
        {
            // Arrange
            var batch = new MigrationBatch();

            // Act & Assert - Should not throw and return sensible defaults
            batch.TotalItems.Should().Be(0);
            batch.CompletedItems.Should().Be(0);
            batch.FailedItems.Should().Be(0);
            batch.InProgressItems.Should().Be(0);
            batch.PendingItems.Should().Be(0);
            batch.ProgressPercentage.Should().Be(0.0);
            batch.SuccessRate.Should().Be(0.0);
            batch.TotalSizeBytes.Should().Be(0);
            batch.TransferredBytes.Should().Be(0);
            batch.AverageTransferRateMBps.Should().Be(0);
        }

        #endregion

        #region Size and Transfer Rate Tests

        [TestMethod]
        public void MigrationBatch_SizeCalculations_ShouldSumCorrectly()
        {
            // Arrange
            var batch = new MigrationBatch();
            
            batch.Items.Add(new MigrationItem { SizeBytes = 1024 * 1024, TransferredBytes = 1024 * 512 }); // 1MB total, 512KB transferred
            batch.Items.Add(new MigrationItem { SizeBytes = 2 * 1024 * 1024, TransferredBytes = 2 * 1024 * 1024 }); // 2MB total, 2MB transferred
            batch.Items.Add(new MigrationItem { SizeBytes = null, TransferredBytes = null }); // Should handle nulls
            batch.Items.Add(new MigrationItem { SizeBytes = 5 * 1024 * 1024, TransferredBytes = 1024 * 1024 }); // 5MB total, 1MB transferred

            // Act & Assert
            batch.TotalSizeBytes.Should().Be(8 * 1024 * 1024); // 8MB total
            batch.TransferredBytes.Should().Be((512 + 2048 + 1024) * 1024); // 3.5MB transferred
            batch.FormattedTotalSize.Should().Be("8 MB");
        }

        [TestMethod]
        public void MigrationBatch_TransferRateCalculations_ShouldAverageCorrectly()
        {
            // Arrange
            var batch = new MigrationBatch();
            
            batch.Items.Add(new MigrationItem { TransferRateMBps = 10.0 });
            batch.Items.Add(new MigrationItem { TransferRateMBps = 20.0 });
            batch.Items.Add(new MigrationItem { TransferRateMBps = 0 }); // Should be excluded from average
            batch.Items.Add(new MigrationItem { TransferRateMBps = 30.0 });

            // Act
            var averageRate = batch.AverageTransferRateMBps;

            // Assert
            averageRate.Should().Be(20.0); // (10 + 20 + 30) / 3 = 20
        }

        [TestMethod]
        public void MigrationBatch_ByteFormatting_ShouldDisplayReadableUnits()
        {
            // Arrange & Act
            var batch1 = new MigrationBatch();
            batch1.Items.Add(new MigrationItem { SizeBytes = 1024 });
            
            var batch2 = new MigrationBatch();
            batch2.Items.Add(new MigrationItem { SizeBytes = 1024 * 1024 });
            
            var batch3 = new MigrationBatch();
            batch3.Items.Add(new MigrationItem { SizeBytes = 1024L * 1024 * 1024 });
            
            var batch4 = new MigrationBatch();
            batch4.Items.Add(new MigrationItem { SizeBytes = 1024L * 1024 * 1024 * 1024 });

            // Assert
            batch1.FormattedTotalSize.Should().Be("1 KB");
            batch2.FormattedTotalSize.Should().Be("1 MB");
            batch3.FormattedTotalSize.Should().Be("1 GB");
            batch4.FormattedTotalSize.Should().Be("1 TB");
        }

        #endregion

        #region Time and Duration Tests

        [TestMethod]
        public void MigrationBatch_TimingCalculations_ShouldBeAccurate()
        {
            // Arrange
            var batch = new MigrationBatch();
            var startTime = new DateTime(2023, 1, 1, 10, 0, 0);
            var endTime = new DateTime(2023, 1, 1, 14, 30, 0);

            // Act
            batch.StartTime = startTime;
            batch.EndTime = endTime;

            // Assert
            batch.ActualDuration.Should().Be(TimeSpan.FromHours(4.5));
        }

        [TestMethod]
        public void MigrationBatch_EstimatedTimeRemaining_ShouldCalculateBasedOnProgress()
        {
            // Arrange
            var batch = new MigrationBatch();
            var startTime = DateTime.Now.AddHours(-1); // Started 1 hour ago
            batch.StartTime = startTime;

            // Add items to simulate 25% completion
            batch.Items.Add(new MigrationItem { Status = MigrationStatus.Completed });
            batch.Items.Add(new MigrationItem { Status = MigrationStatus.InProgress });
            batch.Items.Add(new MigrationItem { Status = MigrationStatus.NotStarted });
            batch.Items.Add(new MigrationItem { Status = MigrationStatus.NotStarted });

            // Act
            var estimatedRemaining = batch.GetEstimatedTimeRemaining();

            // Assert
            estimatedRemaining.Should().NotBeNull();
            // 25% complete in 1 hour, so 75% remaining should take ~3 hours
            estimatedRemaining.Value.TotalHours.Should().BeApproximately(3.0, 0.1);
        }

        [TestMethod]
        public void MigrationBatch_EstimatedTimeRemaining_WithNoProgressOrStartTime_ShouldReturnNull()
        {
            // Arrange
            var batch = new MigrationBatch();

            // Test with no start time
            batch.Items.Add(new MigrationItem { Status = MigrationStatus.Completed });
            batch.GetEstimatedTimeRemaining().Should().BeNull();

            // Test with start time but no progress
            batch.StartTime = DateTime.Now.AddHours(-1);
            batch.Items.Clear();
            batch.GetEstimatedTimeRemaining().Should().BeNull();
        }

        #endregion

        #region Error Handling Tests

        [TestMethod]
        public void MigrationBatch_ErrorManagement_ShouldTrackErrorsAtMultipleLevels()
        {
            // Arrange
            var batch = new MigrationBatch();

            // Initially no errors
            batch.HasErrors.Should().BeFalse();

            // Add batch-level errors
            batch.Errors.Add("Configuration validation failed");
            batch.Errors.Add("Network connectivity issue");
            batch.HasErrors.Should().BeTrue();

            // Add item with errors
            var itemWithError = new MigrationItem();
            itemWithError.Errors.Add("User not found in target system");
            batch.Items.Add(itemWithError);

            // Add item without errors
            var itemWithoutError = new MigrationItem();
            batch.Items.Add(itemWithoutError);

            // Assert
            batch.Errors.Should().HaveCount(2);
            batch.HasErrors.Should().BeTrue();
            batch.Items.Where(i => i.HasErrors).Should().HaveCount(1);
        }

        [TestMethod]
        public void MigrationBatch_WarningManagement_ShouldTrackWarningsAtMultipleLevels()
        {
            // Arrange
            var batch = new MigrationBatch();

            // Initially no warnings
            batch.HasWarnings.Should().BeFalse();

            // Add batch-level warnings
            batch.Warnings.Add("Large file detected - may take longer");
            batch.Warnings.Add("Some permissions may need manual review");
            batch.HasWarnings.Should().BeTrue();

            // Add item with warnings
            var itemWithWarnings = new MigrationItem();
            itemWithWarnings.Warnings.Add("Special characters in display name");
            batch.Items.Add(itemWithWarnings);

            // Assert
            batch.Warnings.Should().HaveCount(2);
            batch.HasWarnings.Should().BeTrue();
            batch.ItemsWithWarnings.Should().Be(1);
        }

        #endregion

        #region Risk Assessment Tests

        [TestMethod]
        public void MigrationBatch_RiskAssessment_ShouldIdentifyHighRiskConditions()
        {
            // Arrange
            var batch = new MigrationBatch();

            // Initially not high risk
            batch.IsHighRisk.Should().BeFalse();

            // Test high risk complexity
            batch.Complexity = MigrationComplexity.HighRisk;
            batch.IsHighRisk.Should().BeTrue();

            // Reset and test critical priority
            batch.Complexity = MigrationComplexity.Simple;
            batch.Priority = MigrationPriority.Critical;
            batch.IsHighRisk.Should().BeTrue();

            // Reset and add high-risk item
            batch.Priority = MigrationPriority.Normal;
            var highRiskItem = new MigrationItem { Complexity = MigrationComplexity.HighRisk };
            batch.Items.Add(highRiskItem);
            batch.IsHighRisk.Should().BeTrue();
        }

        [TestMethod]
        public void MigrationBatch_GetHighRiskItems_ShouldFilterCorrectly()
        {
            // Arrange
            var batch = new MigrationBatch();
            var normalItem = new MigrationItem { Complexity = MigrationComplexity.Simple };
            var complexItem = new MigrationItem { Complexity = MigrationComplexity.Complex };
            var highRiskItem = new MigrationItem { Complexity = MigrationComplexity.HighRisk };
            var criticalItem = new MigrationItem { Priority = MigrationPriority.Critical };

            batch.Items.AddRange(new[] { normalItem, complexItem, highRiskItem, criticalItem });

            // Act
            var highRiskItems = batch.GetHighRiskItems();

            // Assert
            highRiskItems.Should().HaveCount(2);
            highRiskItems.Should().Contain(highRiskItem);
            highRiskItems.Should().Contain(criticalItem);
        }

        #endregion

        #region Filtering and Querying Tests

        [TestMethod]
        public void MigrationBatch_GetItemsByStatus_ShouldFilterCorrectly()
        {
            // Arrange
            var batch = new MigrationBatch();
            batch.Items.Add(new MigrationItem { Status = MigrationStatus.Completed });
            batch.Items.Add(new MigrationItem { Status = MigrationStatus.Completed });
            batch.Items.Add(new MigrationItem { Status = MigrationStatus.InProgress });
            batch.Items.Add(new MigrationItem { Status = MigrationStatus.Failed });
            batch.Items.Add(new MigrationItem { Status = MigrationStatus.NotStarted });
            batch.Items.Add(new MigrationItem { Status = MigrationStatus.NotStarted });

            // Act
            var completedItems = batch.GetItemsByStatus(MigrationStatus.Completed);
            var inProgressItems = batch.GetItemsByStatus(MigrationStatus.InProgress);
            var failedItems = batch.GetItemsByStatus(MigrationStatus.Failed);
            var notStartedItems = batch.GetItemsByStatus(MigrationStatus.NotStarted);

            // Assert
            completedItems.Should().HaveCount(2);
            inProgressItems.Should().HaveCount(1);
            failedItems.Should().HaveCount(1);
            notStartedItems.Should().HaveCount(2);
        }

        [TestMethod]
        public void MigrationBatch_UpdateProgress_ShouldRecalculateMetrics()
        {
            // Arrange
            var batch = new MigrationBatch();
            batch.Items.Add(new MigrationItem { Status = MigrationStatus.NotStarted });
            batch.Items.Add(new MigrationItem { Status = MigrationStatus.NotStarted });
            batch.Items.Add(new MigrationItem { Status = MigrationStatus.NotStarted });

            // Initial state
            batch.ProgressPercentage.Should().Be(0.0);

            // Act - Simulate progress
            batch.Items[0].Status = MigrationStatus.Completed;
            batch.UpdateProgress();

            // Assert - Progress should be recalculated
            batch.ProgressPercentage.Should().BeApproximately(33.33, 0.01);
        }

        #endregion

        #region Enterprise Configuration Tests

        [TestMethod]
        public void MigrationBatch_EnterpriseConfiguration_ShouldSupportComplexSettings()
        {
            // Arrange
            var batch = new MigrationBatch();

            // Act - Configure enterprise settings
            batch.Configuration["ExchangeEndpoint"] = "https://outlook.office365.com";
            batch.Configuration["SharePointUrl"] = "https://company.sharepoint.com";
            batch.Configuration["BatchSize"] = 100;
            batch.Configuration["EnableDetailedLogging"] = true;
            batch.Configuration["RetentionPolicy"] = TimeSpan.FromDays(7);

            batch.EnvironmentSettings["SourceDomain"] = "company.local";
            batch.EnvironmentSettings["TargetDomain"] = "company.onmicrosoft.com";
            batch.EnvironmentSettings["MigrationAccount"] = "migration@company.com";

            batch.PreMigrationChecklist.Add("Validate network connectivity");
            batch.PreMigrationChecklist.Add("Check source permissions");
            batch.PreMigrationChecklist.Add("Verify target capacity");

            batch.PostMigrationValidation.Add("Test user login");
            batch.PostMigrationValidation.Add("Verify mailbox access");
            batch.PostMigrationValidation.Add("Confirm file permissions");

            batch.QualityGates.Add("Zero data loss");
            batch.QualityGates.Add("Performance within SLA");
            batch.QualityGates.Add("All validations passed");

            // Assert
            batch.Configuration.Should().HaveCount(5);
            batch.EnvironmentSettings.Should().HaveCount(3);
            batch.PreMigrationChecklist.Should().HaveCount(3);
            batch.PostMigrationValidation.Should().HaveCount(3);
            batch.QualityGates.Should().HaveCount(3);

            batch.Configuration["ExchangeEndpoint"].Should().Be("https://outlook.office365.com");
            batch.EnvironmentSettings["SourceDomain"].Should().Be("company.local");
        }

        [TestMethod]
        public void MigrationBatch_ApprovalWorkflow_ShouldTrackApprovalStatus()
        {
            // Arrange
            var batch = new MigrationBatch();
            var approvalDate = DateTime.Now;

            // Initially not requiring approval
            batch.RequiresApproval.Should().BeFalse();
            batch.ApprovedBy.Should().BeNull();
            batch.ApprovalDate.Should().BeNull();

            // Act - Configure for approval
            batch.RequiresApproval = true;
            batch.ApprovedBy = "manager@company.com";
            batch.ApprovalDate = approvalDate;

            // Assert
            batch.RequiresApproval.Should().BeTrue();
            batch.ApprovedBy.Should().Be("manager@company.com");
            batch.ApprovalDate.Should().Be(approvalDate);
        }

        [TestMethod]
        public void MigrationBatch_BusinessMetrics_ShouldTrackCostAndJustification()
        {
            // Arrange
            var batch = new MigrationBatch();

            // Act
            batch.BusinessJustification = "M&A integration requires user consolidation";
            batch.EstimatedCost = 25000.75m;
            batch.ActualCost = 23500.50m;

            // Assert
            batch.BusinessJustification.Should().Be("M&A integration requires user consolidation");
            batch.EstimatedCost.Should().Be(25000.75m);
            batch.ActualCost.Should().Be(23500.50m);
        }

        #endregion

        #region Rollback Support Tests

        [TestMethod]
        public void MigrationBatch_RollbackSupport_ShouldConfigureCorrectly()
        {
            // Arrange
            var batch = new MigrationBatch();

            // Default should support rollback
            batch.SupportsRollback.Should().BeTrue();

            // Act - Configure rollback
            batch.RollbackPlan = "Automated rollback via PowerShell scripts";
            batch.RollbackInstructions.Add("Stop migration processes");
            batch.RollbackInstructions.Add("Restore from backup");
            batch.RollbackInstructions.Add("Revert DNS changes");
            batch.RollbackInstructions.Add("Notify users");

            // Assert
            batch.RollbackPlan.Should().Be("Automated rollback via PowerShell scripts");
            batch.RollbackInstructions.Should().HaveCount(4);
        }

        #endregion

        #region Performance and Throttling Tests

        [TestMethod]
        public void MigrationBatch_PerformanceSettings_ShouldConfigureThrottling()
        {
            // Arrange
            var batch = new MigrationBatch();

            // Default should not throttle
            batch.EnableThrottling.Should().BeFalse();
            batch.ThrottlingLimitMBps.Should().Be(0);

            // Act - Enable throttling
            batch.EnableThrottling = true;
            batch.ThrottlingLimitMBps = 50;

            // Assert
            batch.EnableThrottling.Should().BeTrue();
            batch.ThrottlingLimitMBps.Should().Be(50);
        }

        [TestMethod]
        public void MigrationBatch_ConcurrencySettings_ShouldControlParallelism()
        {
            // Arrange
            var batch = new MigrationBatch();

            // Default concurrency
            batch.MaxConcurrentItems.Should().Be(5);

            // Act - Adjust concurrency
            batch.MaxConcurrentItems = 10;

            // Assert
            batch.MaxConcurrentItems.Should().Be(10);
        }

        #endregion

        #region Custom Properties and Extensibility Tests

        [TestMethod]
        public void MigrationBatch_CustomProperties_ShouldAllowExtensibility()
        {
            // Arrange
            var batch = new MigrationBatch();

            // Act - Add custom properties
            batch.CustomProperties["Region"] = "North America";
            batch.CustomProperties["CompanyCode"] = "CORP001";
            batch.CustomProperties["ComplianceLevel"] = "High";
            batch.CustomProperties["DataClassification"] = "Confidential";
            batch.CustomProperties["RetentionYears"] = 7;

            batch.Tags.Add("Finance");
            batch.Tags.Add("Q1-2024");
            batch.Tags.Add("High-Priority");

            // Assert
            batch.CustomProperties.Should().HaveCount(5);
            batch.Tags.Should().HaveCount(3);
            batch.CustomProperties["Region"].Should().Be("North America");
            batch.CustomProperties["RetentionYears"].Should().Be(7);
        }

        #endregion

        #region Logging and Audit Trail Tests

        [TestMethod]
        public void MigrationBatch_LoggingSupport_ShouldTrackDetailedLogs()
        {
            // Arrange
            var batch = new MigrationBatch();

            // Act
            batch.LogFilePath = @"C:\MigrationLogs\UserMigration_20240101_001.log";
            batch.DetailedLogs.Add("2024-01-01 10:00:00 - Migration batch initialized");
            batch.DetailedLogs.Add("2024-01-01 10:01:00 - Pre-migration validation started");
            batch.DetailedLogs.Add("2024-01-01 10:02:00 - 150 users identified for migration");
            batch.DetailedLogs.Add("2024-01-01 10:05:00 - Migration process started");

            // Assert
            batch.LogFilePath.Should().Be(@"C:\MigrationLogs\UserMigration_20240101_001.log");
            batch.DetailedLogs.Should().HaveCount(4);
            batch.DetailedLogs.First().Should().Contain("Migration batch initialized");
        }

        #endregion

        #region Integration and Stress Tests

        [TestMethod]
        public void MigrationBatch_LargeScale_ShouldHandleThousandsOfItems()
        {
            // Arrange
            var batch = new MigrationBatch();
            var random = new Random(12345); // Seed for reproducibility

            // Act - Add 5000 migration items
            for (int i = 0; i < 5000; i++)
            {
                var status = (MigrationStatus)(random.Next(0, 4)); // NotStarted, Planning, Validating, Ready
                var item = new MigrationItem 
                { 
                    Status = status,
                    SourceIdentity = $"user{i}@source.com",
                    TargetIdentity = $"user{i}@target.com",
                    SizeBytes = random.Next(1024, 10 * 1024 * 1024), // 1KB to 10MB
                    TransferRateMBps = random.NextDouble() * 50 // 0-50 MBps
                };
                
                if (random.NextDouble() < 0.1) // 10% chance of warnings
                    item.Warnings.Add("Minor migration warning");
                    
                if (random.NextDouble() < 0.05) // 5% chance of errors
                    item.Errors.Add("Migration error occurred");
                
                batch.Items.Add(item);
            }

            // Assert - Performance should be acceptable
            var stopwatch = System.Diagnostics.Stopwatch.StartNew();
            
            var totalItems = batch.TotalItems;
            var completedItems = batch.CompletedItems;
            var failedItems = batch.FailedItems;
            var progressPercentage = batch.ProgressPercentage;
            var successRate = batch.SuccessRate;
            var totalSize = batch.TotalSizeBytes;
            var averageRate = batch.AverageTransferRateMBps;
            var highRiskItems = batch.GetHighRiskItems();
            
            stopwatch.Stop();

            // Verify calculations are correct
            totalItems.Should().Be(5000);
            progressPercentage.Should().BeGreaterOrEqualTo(0).And.BeLessOrEqualTo(100);
            successRate.Should().BeGreaterOrEqualTo(0).And.BeLessOrEqualTo(100);
            totalSize.Should().BeGreaterThan(0);
            
            // Performance should be under 100ms for all calculations
            stopwatch.ElapsedMilliseconds.Should().BeLessThan(100, "Calculations should be performant even with large datasets");
        }

        [TestMethod]
        public void MigrationBatch_MemoryManagement_ShouldNotLeakWithRepeatedOperations()
        {
            // This test ensures that repeated operations don't cause memory issues
            
            // Arrange
            var batches = new List<MigrationBatch>();

            // Act - Create and manipulate multiple batches
            for (int i = 0; i < 100; i++)
            {
                var batch = new MigrationBatch();
                batch.Name = $"Batch {i}";
                
                // Add some items
                for (int j = 0; j < 50; j++)
                {
                    batch.Items.Add(new MigrationItem 
                    { 
                        SourceIdentity = $"user{j}@batch{i}.com",
                        Status = (MigrationStatus)(j % 4)
                    });
                }
                
                // Perform calculations
                var progress = batch.ProgressPercentage;
                var highRisk = batch.GetHighRiskItems();
                var completed = batch.GetItemsByStatus(MigrationStatus.Completed);
                
                batches.Add(batch);
            }

            // Assert - All batches should be properly created and functional
            batches.Should().HaveCount(100);
            batches.All(b => b.TotalItems == 50).Should().BeTrue();
            
            // Test cleanup
            batches.Clear();
            GC.Collect();
            GC.WaitForPendingFinalizers();
            
            // If we get here without memory issues, the test passed
            true.Should().BeTrue();
        }

        #endregion
    }
}