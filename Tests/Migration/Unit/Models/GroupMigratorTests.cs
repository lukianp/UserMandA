using System;
using System.Collections.Generic;
using Xunit;
using MandADiscoverySuite.Services.Migration;

namespace MandADiscoverySuiteTests.Migration.Unit.Models
{
    /// <summary>
    /// Unit tests for enhanced GroupMigrationResult class and migration result functionality
    /// </summary>
    public class GroupMigratorTests
    {
        [Fact]
        public void GroupMigrationResult_Should_Initialize_Enhanced_Fields()
        {
            // Arrange & Act
            var result = new GroupMigrationResult
            {
                SourceGroupSid = "S-1-5-21-1000",
                TargetGroupName = "TestGroup",
                TargetGroupSid = "S-1-5-21-2000",
                GroupCreated = true,
                ConflictsResolved = false
            };

            // Test new enhanced fields
            var testMappings = new Dictionary<string, string> { { "source1", "target1" } };
            var testResolutionDetails = new Dictionary<string, string> { { "conflict1", "renamed to target1" } };

            result.GroupSidMappings = testMappings;
            result.SkippedGroupSids = new List<string> { "skipped1" };
            result.ResolutionDetails = testResolutionDetails;
            result.ConflictResolutionMappings = new Dictionary<string, string> { { "conflict1", "resolution1" } };

            // Assert
            Assert.NotNull(result.GroupSidMappings);
            Assert.Equal(testMappings, result.GroupSidMappings);
            Assert.NotEmpty(result.SkippedGroupSids);
            Assert.Equal("skipped1", result.SkippedGroupSids[0]);
            Assert.NotNull(result.ResolutionDetails);
            Assert.Equal(testResolutionDetails, result.ResolutionDetails);
            Assert.NotNull(result.ConflictResolutionMappings);

            // Test existing fields still work
            Assert.Equal("S-1-5-21-1000", result.SourceGroupSid);
            Assert.Equal("TestGroup", result.TargetGroupName);
            Assert.Equal("S-1-5-21-2000", result.TargetGroupSid);
            Assert.True(result.GroupCreated);
            Assert.False(result.ConflictsResolved);
        }

        [Fact]
        public void GroupMigrationResult_Inherits_From_MigrationResultBase()
        {
            // Arrange & Act
            var result = new GroupMigrationResult();

            // Assert
            // This test will pass only if GroupMigrationResult properly inherits from MigrationResultBase
            Assert.IsAssignableFrom<MigrationResultBase>(result);

            // Test base class properties are initialized
            Assert.NotNull(result.Id); // From MigrationResultBase
            Assert.Null(result.Operation); // Default initialization
            Assert.False(result.IsSuccess); // Default initialization
        }

        [Fact]
        public void GroupMigrationResult_Should_Track_Conflict_Resolution()
        {
            // Arrange & Act
            var result = new GroupMigrationResult();

            // Simulate conflict resolution tracking
            result.ConflictsResolved = true;
            result.TotalConflicts = 3;
            result.ResolvedConflicts = 2;
            result.SkippedGroupSids.Add("S-1-5-21-9999");
            result.ResolutionDetails["S-1-5-21-8888"] = "Renamed to Renamed_Group_20240903";
            result.ConflictResolutionMappings["S-1-5-21-7777"] = "S-1-5-21-8888";

            // Assert
            Assert.True(result.ConflictsResolved);
            Assert.Equal(3, result.TotalConflicts);
            Assert.Equal(2, result.ResolvedConflicts);
            Assert.Contains("S-1-5-21-9999", result.SkippedGroupSids);
            Assert.True(result.ResolutionDetails.ContainsKey("S-1-5-21-8888"));
            Assert.Equal("Renamed to Renamed_Group_20240903", result.ResolutionDetails["S-1-5-21-8888"]);
            Assert.Equal("S-1-5-21-8888", result.ConflictResolutionMappings["S-1-5-21-7777"]);
        }

        [Fact]
        public void MigrationResultBase_Standard_Fields_Available()
        {
            // Arrange & Act
            var result = new GroupMigrationResult();

            // Test standard MigrationResultBase fields are available
            result.StartTime = DateTime.UtcNow.AddMinutes(-5);
            result.EndTime = DateTime.UtcNow;
            result.IsSuccess = true;
            result.Message = "Migration completed successfully";
            result.Errors.Add("Test error");
            result.Warnings.Add("Test warning");

            // Assert
            Assert.True(result.IsSuccess);
            Assert.Equal("Migration completed successfully", result.Message);
            Assert.Equal("Test error", result.Errors[0]);
            Assert.Equal("Test warning", result.Warnings[0]);
            Assert.True(result.Duration.TotalMinutes >= 5); // Should be calculated automatically
            Assert.True(result.Success); // Should match IsSuccess
        }

        [Fact]
        public void Enhanced_Result_Classes_Support_Group_Tracking()
        {
            // Test that enhanced result classes can track comprehensive group migration details
            var hierarchyResult = new GroupHierarchyResult();
            var membershipResult = new GroupMembershipMigrationResult();
            var dependencyResult = new GroupDependencyValidationResult();

            // Hierarchy tracking
            hierarchyResult.GroupSidMappings["S-1-5-21-1000"] = "S-1-5-21-2000";
            hierarchyResult.SkippedGroupSids.Add("S-1-5-21-3000");

            // Membership tracking
            membershipResult.GroupSid = "S-1-5-21-2000";
            membershipResult.MemberSidMappings["S-1-5-21-4000"] = "S-1-5-21-5000";
            membershipResult.NestedGroupsIncluded = true;

            // Dependency tracking
            dependencyResult.MigrationSafetyConfirmed = true;
            dependencyResult.CircularDependencies.Add("S-1-5-21-1000 -> S-1-5-21-2000 -> S-1-5-21-1000");

            // Assert comprehensive tracking capabilities
            Assert.True(hierarchyResult.GroupSidMappings.ContainsKey("S-1-5-21-1000"));
            Assert.Contains("S-1-5-21-3000", hierarchyResult.SkippedGroupSids);

            Assert.Equal("S-1-5-21-2000", membershipResult.GroupSid);
            Assert.True(membershipResult.NestedGroupsIncluded);

            Assert.True(dependencyResult.MigrationSafetyConfirmed);
            Assert.Contains("S-1-5-21-1000 -> S-1-5-21-2000 -> S-1-5-21-1000", dependencyResult.CircularDependencies);
        }

        [Fact]
        public void All_Result_Classes_Inherit_From_MigrationResultBase()
        {
            // Test that all result classes properly inherit from MigrationResultBase
            var coreResults = new List<MigrationResultBase>
            {
                new GroupMigrationResult(),
                new IdentityMigrationResult(),
                new MailMigrationResult(),
                new FileMigrationResult(),
                new SqlMigrationResult(),
                new GpoMigrationResult(),
                new AclMigrationResult(),
                new GroupHierarchyResult(),
                new MembershipResult(),
                new GroupDependencyResult(),
                new BulkGroupMigrationResult()
            };

            // Assert each result class properly inherits from MigrationResultBase
            foreach (var result in coreResults)
            {
                Assert.NotNull(result);
                Assert.IsAssignableFrom<MigrationResultBase>(result);
                Assert.NotNull(result.Id);
                Assert.False(result.IsSuccess); // Default should be false
            }
        }
    }
}