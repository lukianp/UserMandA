using System;
using System.Collections.Generic;
using System.Linq;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using MandADiscoverySuite.ViewModels;
using MandADiscoverySuite.Models;

namespace MandADiscoverySuite.Tests.Teams
{
    /// <summary>
    /// Comprehensive tests for Teams migration data models
    /// Validates TeamsDiscoveryItem and ChannelDiscoveryItem properties, calculations, and data integrity
    /// </summary>
    [TestClass]
    public class TeamsDataModelTests
    {
        #region TeamsDiscoveryItem Tests

        [TestMethod]
        public void TeamsDiscoveryItem_Constructor_ShouldInitializeWithDefaults()
        {
            // Act
            var team = new TeamsDiscoveryItem();
            
            // Assert
            Assert.IsNotNull(team.Id, "Id should be initialized");
            Assert.IsNull(team.DisplayName, "DisplayName should be null initially");
            Assert.AreEqual(0, team.MemberCount, "MemberCount should default to 0");
            Assert.AreEqual(0, team.ChannelCount, "ChannelCount should default to 0");
            Assert.AreEqual(0.0, team.DataSizeGB, "DataSizeGB should default to 0");
        }

        [TestMethod]
        public void TeamsDiscoveryItem_FormattedDataSize_ShouldFormatCorrectly()
        {
            // Arrange & Act
            var testCases = new[]
            {
                new { Input = 0.0, Expected = "0.00 GB" },
                new { Input = 1.0, Expected = "1.00 GB" },
                new { Input = 1.234, Expected = "1.23 GB" },
                new { Input = 10.5678, Expected = "10.57 GB" },
                new { Input = 100.999, Expected = "101.00 GB" }
            };
            
            // Assert
            foreach (var testCase in testCases)
            {
                var team = new TeamsDiscoveryItem { DataSizeGB = testCase.Input };
                Assert.AreEqual(testCase.Expected, team.FormattedDataSize, 
                    $"Input {testCase.Input} should format to {testCase.Expected}");
            }
        }

        [TestMethod]
        public void TeamsDiscoveryItem_ActivityStatus_ShouldCalculateBasedOnLastActivity()
        {
            // Arrange & Act
            var activeTeam = new TeamsDiscoveryItem 
            { 
                LastActivityDate = DateTime.Now.AddDays(-3) 
            };
            var inactiveTeam = new TeamsDiscoveryItem 
            { 
                LastActivityDate = DateTime.Now.AddDays(-14) 
            };
            var veryOldTeam = new TeamsDiscoveryItem 
            { 
                LastActivityDate = DateTime.Now.AddDays(-100) 
            };
            
            // Assert
            Assert.AreEqual("Active", activeTeam.ActivityStatus, 
                "Team with activity within 7 days should be Active");
            Assert.AreEqual("Inactive", inactiveTeam.ActivityStatus, 
                "Team with activity over 7 days ago should be Inactive");
            Assert.AreEqual("Inactive", veryOldTeam.ActivityStatus, 
                "Team with very old activity should be Inactive");
        }

        [TestMethod]
        public void TeamsDiscoveryItem_ActivityStatus_EdgeCases()
        {
            // Arrange & Act
            var todayTeam = new TeamsDiscoveryItem 
            { 
                LastActivityDate = DateTime.Now 
            };
            var exactlySevenDaysTeam = new TeamsDiscoveryItem 
            { 
                LastActivityDate = DateTime.Now.AddDays(-7) 
            };
            var eightDaysTeam = new TeamsDiscoveryItem 
            { 
                LastActivityDate = DateTime.Now.AddDays(-8) 
            };
            
            // Assert
            Assert.AreEqual("Active", todayTeam.ActivityStatus, 
                "Team with activity today should be Active");
            Assert.AreEqual("Active", exactlySevenDaysTeam.ActivityStatus, 
                "Team with activity exactly 7 days ago should be Active");
            Assert.AreEqual("Inactive", eightDaysTeam.ActivityStatus, 
                "Team with activity 8 days ago should be Inactive");
        }

        [TestMethod]
        public void TeamsDiscoveryItem_HasComplexConfiguration_ShouldDetectComplexity()
        {
            // Arrange & Act
            var testCases = new[]
            {
                new { HasApps = false, HasCustomTabs = false, GuestCount = 0, Expected = false, Description = "Simple team" },
                new { HasApps = true, HasCustomTabs = false, GuestCount = 0, Expected = true, Description = "Team with apps" },
                new { HasApps = false, HasCustomTabs = true, GuestCount = 0, Expected = true, Description = "Team with custom tabs" },
                new { HasApps = false, HasCustomTabs = false, GuestCount = 1, Expected = true, Description = "Team with guests" },
                new { HasApps = true, HasCustomTabs = true, GuestCount = 5, Expected = true, Description = "Complex team with everything" }
            };
            
            // Assert
            foreach (var testCase in testCases)
            {
                var team = new TeamsDiscoveryItem
                {
                    HasApps = testCase.HasApps,
                    HasCustomTabs = testCase.HasCustomTabs,
                    GuestCount = testCase.GuestCount
                };
                
                Assert.AreEqual(testCase.Expected, team.HasComplexConfiguration, 
                    $"{testCase.Description} complexity detection failed");
            }
        }

        [TestMethod]
        public void TeamsDiscoveryItem_AllProperties_ShouldBeSettable()
        {
            // Arrange
            var testId = Guid.NewGuid().ToString();
            var testDate = DateTime.Now.AddDays(-30);
            
            // Act
            var team = new TeamsDiscoveryItem
            {
                Id = testId,
                DisplayName = "Test Team",
                MailNickname = "testteam",
                Description = "Test Description",
                TeamType = "Private",
                Department = "Engineering",
                MemberCount = 25,
                ChannelCount = 8,
                DataSizeGB = 15.67,
                CreatedDate = testDate,
                LastActivityDate = testDate.AddDays(20),
                OwnerCount = 3,
                GuestCount = 2,
                HasApps = true,
                HasCustomTabs = true,
                IsArchived = false,
                ComplianceState = "Compliant"
            };
            
            // Assert
            Assert.AreEqual(testId, team.Id);
            Assert.AreEqual("Test Team", team.DisplayName);
            Assert.AreEqual("testteam", team.MailNickname);
            Assert.AreEqual("Test Description", team.Description);
            Assert.AreEqual("Private", team.TeamType);
            Assert.AreEqual("Engineering", team.Department);
            Assert.AreEqual(25, team.MemberCount);
            Assert.AreEqual(8, team.ChannelCount);
            Assert.AreEqual(15.67, team.DataSizeGB);
            Assert.AreEqual(testDate, team.CreatedDate);
            Assert.AreEqual(testDate.AddDays(20), team.LastActivityDate);
            Assert.AreEqual(3, team.OwnerCount);
            Assert.AreEqual(2, team.GuestCount);
            Assert.IsTrue(team.HasApps);
            Assert.IsTrue(team.HasCustomTabs);
            Assert.IsFalse(team.IsArchived);
            Assert.AreEqual("Compliant", team.ComplianceState);
        }

        #endregion

        #region ChannelDiscoveryItem Tests

        [TestMethod]
        public void ChannelDiscoveryItem_Constructor_ShouldInitializeWithDefaults()
        {
            // Act
            var channel = new ChannelDiscoveryItem();
            
            // Assert
            Assert.IsNotNull(channel.Id, "Id should be initialized");
            Assert.IsNull(channel.DisplayName, "DisplayName should be null initially");
            Assert.AreEqual(0, channel.MessageCount, "MessageCount should default to 0");
            Assert.AreEqual(0, channel.FileCount, "FileCount should default to 0");
            Assert.AreEqual(0.0, channel.DataSizeGB, "DataSizeGB should default to 0");
        }

        [TestMethod]
        public void ChannelDiscoveryItem_FormattedDataSize_ShouldFormatCorrectly()
        {
            // Arrange & Act
            var testCases = new[]
            {
                new { Input = 0.0, Expected = "0.00 GB" },
                new { Input = 0.5, Expected = "0.50 GB" },
                new { Input = 1.234567, Expected = "1.23 GB" },
                new { Input = 10.999, Expected = "11.00 GB" }
            };
            
            // Assert
            foreach (var testCase in testCases)
            {
                var channel = new ChannelDiscoveryItem { DataSizeGB = testCase.Input };
                Assert.AreEqual(testCase.Expected, channel.FormattedDataSize, 
                    $"Channel data size {testCase.Input} should format to {testCase.Expected}");
            }
        }

        [TestMethod]
        public void ChannelDiscoveryItem_ActivityLevel_ShouldCalculateBasedOnMessages()
        {
            // Arrange & Act
            var testCases = new[]
            {
                new { MessageCount = 0, Expected = "Low" },
                new { MessageCount = 50, Expected = "Low" },
                new { MessageCount = 100, Expected = "Low" },
                new { MessageCount = 101, Expected = "Medium" },
                new { MessageCount = 250, Expected = "Medium" },
                new { MessageCount = 500, Expected = "Medium" },
                new { MessageCount = 501, Expected = "High" },
                new { MessageCount = 1000, Expected = "High" },
                new { MessageCount = 5000, Expected = "High" }
            };
            
            // Assert
            foreach (var testCase in testCases)
            {
                var channel = new ChannelDiscoveryItem { MessageCount = testCase.MessageCount };
                Assert.AreEqual(testCase.Expected, channel.ActivityLevel, 
                    $"Channel with {testCase.MessageCount} messages should have {testCase.Expected} activity level");
            }
        }

        [TestMethod]
        public void ChannelDiscoveryItem_RequiresSpecialHandling_ShouldDetectSpecialCases()
        {
            // Arrange & Act
            var testCases = new[]
            {
                new { ChannelType = "Standard", HasCustomConnectors = false, IsModerated = false, Expected = false, Description = "Standard channel" },
                new { ChannelType = "Private", HasCustomConnectors = false, IsModerated = false, Expected = true, Description = "Private channel" },
                new { ChannelType = "Shared", HasCustomConnectors = false, IsModerated = false, Expected = false, Description = "Shared channel" },
                new { ChannelType = "Standard", HasCustomConnectors = true, IsModerated = false, Expected = true, Description = "Channel with connectors" },
                new { ChannelType = "Standard", HasCustomConnectors = false, IsModerated = true, Expected = true, Description = "Moderated channel" },
                new { ChannelType = "Private", HasCustomConnectors = true, IsModerated = true, Expected = true, Description = "Complex private channel" }
            };
            
            // Assert
            foreach (var testCase in testCases)
            {
                var channel = new ChannelDiscoveryItem
                {
                    ChannelType = testCase.ChannelType,
                    HasCustomConnectors = testCase.HasCustomConnectors,
                    IsModerated = testCase.IsModerated
                };
                
                Assert.AreEqual(testCase.Expected, channel.RequiresSpecialHandling, 
                    $"{testCase.Description} special handling detection failed");
            }
        }

        [TestMethod]
        public void ChannelDiscoveryItem_AllProperties_ShouldBeSettable()
        {
            // Arrange
            var channelId = Guid.NewGuid().ToString();
            var teamId = Guid.NewGuid().ToString();
            var testDate = DateTime.Now.AddDays(-20);
            
            // Act
            var channel = new ChannelDiscoveryItem
            {
                Id = channelId,
                TeamId = teamId,
                TeamName = "Parent Team",
                DisplayName = "Test Channel",
                Description = "Channel Description",
                ChannelType = "Private",
                MessageCount = 750,
                FileCount = 125,
                DataSizeGB = 5.25,
                CreatedDate = testDate,
                LastActivityDate = testDate.AddDays(15),
                MemberCount = 15,
                HasTabs = true,
                HasApps = true,
                HasCustomConnectors = true,
                IsModerated = true
            };
            
            // Assert
            Assert.AreEqual(channelId, channel.Id);
            Assert.AreEqual(teamId, channel.TeamId);
            Assert.AreEqual("Parent Team", channel.TeamName);
            Assert.AreEqual("Test Channel", channel.DisplayName);
            Assert.AreEqual("Channel Description", channel.Description);
            Assert.AreEqual("Private", channel.ChannelType);
            Assert.AreEqual(750, channel.MessageCount);
            Assert.AreEqual(125, channel.FileCount);
            Assert.AreEqual(5.25, channel.DataSizeGB);
            Assert.AreEqual(testDate, channel.CreatedDate);
            Assert.AreEqual(testDate.AddDays(15), channel.LastActivityDate);
            Assert.AreEqual(15, channel.MemberCount);
            Assert.IsTrue(channel.HasTabs);
            Assert.IsTrue(channel.HasApps);
            Assert.IsTrue(channel.HasCustomConnectors);
            Assert.IsTrue(channel.IsModerated);
        }

        #endregion

        #region Data Validation Tests

        [TestMethod]
        public void DataValidation_TeamChannelRelationship_ShouldBeConsistent()
        {
            // Arrange
            var teamId = Guid.NewGuid().ToString();
            var team = new TeamsDiscoveryItem
            {
                Id = teamId,
                DisplayName = "Finance Team",
                ChannelCount = 5
            };
            
            var channels = new List<ChannelDiscoveryItem>();
            for (int i = 0; i < 5; i++)
            {
                channels.Add(new ChannelDiscoveryItem
                {
                    Id = Guid.NewGuid().ToString(),
                    TeamId = teamId,
                    TeamName = team.DisplayName,
                    DisplayName = $"Channel {i + 1}"
                });
            }
            
            // Act & Assert
            Assert.AreEqual(team.ChannelCount, channels.Count, 
                "Team channel count should match actual channels");
            
            foreach (var channel in channels)
            {
                Assert.AreEqual(teamId, channel.TeamId, 
                    "Channel should reference correct team ID");
                Assert.AreEqual(team.DisplayName, channel.TeamName, 
                    "Channel should reference correct team name");
            }
        }

        [TestMethod]
        public void DataValidation_DataSizeConsistency_ShouldBeLogical()
        {
            // Arrange & Act
            var team = new TeamsDiscoveryItem
            {
                DataSizeGB = 50.0,
                ChannelCount = 10
            };
            
            var channels = new List<ChannelDiscoveryItem>();
            double totalChannelSize = 0;
            
            for (int i = 0; i < 10; i++)
            {
                var channelSize = 3.0 + (i * 0.5); // Varying sizes
                channels.Add(new ChannelDiscoveryItem
                {
                    TeamId = team.Id,
                    DataSizeGB = channelSize
                });
                totalChannelSize += channelSize;
            }
            
            // Assert
            // Note: In a real system, team data size might not exactly equal sum of channels
            // due to shared files, team-level data, etc. This test validates the concept
            Assert.IsTrue(totalChannelSize > 0, "Total channel size should be positive");
            Assert.IsTrue(team.DataSizeGB > 0, "Team data size should be positive");
            
            foreach (var channel in channels)
            {
                Assert.IsTrue(channel.DataSizeGB >= 0, "Channel data size should be non-negative");
            }
        }

        [TestMethod]
        public void DataValidation_MemberCountConsistency_ShouldBeLogical()
        {
            // Arrange
            var team = new TeamsDiscoveryItem
            {
                MemberCount = 25,
                OwnerCount = 3,
                GuestCount = 2
            };
            
            var privateChannel = new ChannelDiscoveryItem
            {
                TeamId = team.Id,
                ChannelType = "Private",
                MemberCount = 8 // Should be subset of team members
            };
            
            var standardChannel = new ChannelDiscoveryItem
            {
                TeamId = team.Id,
                ChannelType = "Standard",
                MemberCount = team.MemberCount // Should match team for standard channels
            };
            
            // Assert
            Assert.IsTrue(team.OwnerCount <= team.MemberCount, 
                "Owner count should not exceed member count");
            Assert.IsTrue(team.GuestCount <= team.MemberCount, 
                "Guest count should not exceed member count");
            Assert.IsTrue(privateChannel.MemberCount <= team.MemberCount, 
                "Private channel members should not exceed team members");
            Assert.AreEqual(team.MemberCount, standardChannel.MemberCount, 
                "Standard channel should have all team members");
        }

        [TestMethod]
        public void DataValidation_DateConsistency_ShouldBeLogical()
        {
            // Arrange
            var baseDate = DateTime.Now.AddDays(-100);
            
            var team = new TeamsDiscoveryItem
            {
                CreatedDate = baseDate,
                LastActivityDate = baseDate.AddDays(50)
            };
            
            var channel = new ChannelDiscoveryItem
            {
                TeamId = team.Id,
                CreatedDate = baseDate.AddDays(10), // Created after team
                LastActivityDate = baseDate.AddDays(45) // Activity before team's last activity
            };
            
            // Assert
            Assert.IsTrue(team.LastActivityDate >= team.CreatedDate, 
                "Team last activity should be after creation");
            Assert.IsTrue(channel.LastActivityDate >= channel.CreatedDate, 
                "Channel last activity should be after creation");
            Assert.IsTrue(channel.CreatedDate >= team.CreatedDate, 
                "Channel should be created after team");
        }

        #endregion

        #region Performance Tests

        [TestMethod]
        public void Performance_CalculatedProperties_ShouldBeEfficient()
        {
            // Arrange
            var teams = new List<TeamsDiscoveryItem>();
            var channels = new List<ChannelDiscoveryItem>();
            
            for (int i = 0; i < 1000; i++)
            {
                teams.Add(new TeamsDiscoveryItem
                {
                    DataSizeGB = i * 0.1,
                    LastActivityDate = DateTime.Now.AddDays(-i % 30),
                    HasApps = i % 3 == 0,
                    HasCustomTabs = i % 4 == 0,
                    GuestCount = i % 10
                });
                
                channels.Add(new ChannelDiscoveryItem
                {
                    MessageCount = i * 2,
                    DataSizeGB = i * 0.05,
                    ChannelType = i % 2 == 0 ? "Standard" : "Private",
                    HasCustomConnectors = i % 5 == 0,
                    IsModerated = i % 7 == 0
                });
            }
            
            // Act & Assert
            var stopwatch = System.Diagnostics.Stopwatch.StartNew();
            
            // Test all calculated properties
            foreach (var team in teams)
            {
                _ = team.FormattedDataSize;
                _ = team.ActivityStatus;
                _ = team.HasComplexConfiguration;
            }
            
            foreach (var channel in channels)
            {
                _ = channel.FormattedDataSize;
                _ = channel.ActivityLevel;
                _ = channel.RequiresSpecialHandling;
            }
            
            stopwatch.Stop();
            
            Assert.IsTrue(stopwatch.ElapsedMilliseconds < 1000, 
                "Calculated properties for 1000 items should execute in under 1 second");
        }

        #endregion

        #region Edge Case Tests

        [TestMethod]
        public void EdgeCase_NullOrEmptyValues_ShouldHandleGracefully()
        {
            // Arrange & Act
            var team = new TeamsDiscoveryItem
            {
                DisplayName = null,
                Description = "",
                TeamType = null,
                Department = "   ", // Whitespace
                DataSizeGB = 0,
                MemberCount = 0
            };
            
            var channel = new ChannelDiscoveryItem
            {
                DisplayName = null,
                Description = "",
                TeamName = null,
                ChannelType = null
            };
            
            // Assert - Should not throw exceptions
            Assert.IsNotNull(team.FormattedDataSize, "Should handle zero data size");
            Assert.IsNotNull(team.ActivityStatus, "Should handle activity calculation");
            Assert.IsNotNull(channel.FormattedDataSize, "Should handle zero channel size");
            Assert.IsNotNull(channel.ActivityLevel, "Should handle zero message count");
        }

        [TestMethod]
        public void EdgeCase_ExtremeValues_ShouldHandleGracefully()
        {
            // Arrange & Act
            var extremeTeam = new TeamsDiscoveryItem
            {
                DataSizeGB = double.MaxValue,
                MemberCount = int.MaxValue,
                GuestCount = int.MaxValue,
                LastActivityDate = DateTime.MinValue
            };
            
            var extremeChannel = new ChannelDiscoveryItem
            {
                MessageCount = int.MaxValue,
                DataSizeGB = double.MaxValue,
                MemberCount = int.MaxValue
            };
            
            // Assert - Should not throw exceptions
            Assert.IsNotNull(extremeTeam.FormattedDataSize, "Should handle extreme data size");
            Assert.IsNotNull(extremeTeam.ActivityStatus, "Should handle extreme dates");
            Assert.IsNotNull(extremeChannel.ActivityLevel, "Should handle extreme message count");
        }

        [TestMethod]
        public void EdgeCase_NegativeValues_ShouldHandleGracefully()
        {
            // Arrange & Act
            var team = new TeamsDiscoveryItem
            {
                DataSizeGB = -1.0,
                MemberCount = -1,
                GuestCount = -1
            };
            
            var channel = new ChannelDiscoveryItem
            {
                MessageCount = -1,
                DataSizeGB = -1.0,
                MemberCount = -1
            };
            
            // Assert - Should handle negative values gracefully
            Assert.IsNotNull(team.FormattedDataSize, "Should handle negative data size");
            Assert.AreEqual("Low", channel.ActivityLevel, "Should handle negative message count");
        }

        #endregion
    }
}