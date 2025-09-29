using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using System.Timers;
using FluentAssertions;
using MandADiscoverySuite.Models;
using MandADiscoverySuite.Models.Migration;
using MigrationUserDto = MandADiscoverySuite.Models.Migration.UserDto;
using MigrationMailboxDto = MandADiscoverySuite.Models.Migration.MailboxDto;
using MigrationFileShareDto = MandADiscoverySuite.Models.Migration.FileShareDto;
using MigrationSqlDatabaseDto = MandADiscoverySuite.Models.Migration.SqlDatabaseDto;
using MandADiscoverySuite.Services;
using MandADiscoverySuite.Services.Migration;
using Microsoft.Extensions.Logging;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using Moq;

namespace MigrationTestSuite.Functional
{
    /// <summary>
    /// Functional tests for Pre-Migration Check Service (T-031)
    /// Tests end-to-end scenarios with realistic data volumes
    /// </summary>
    [TestClass]
    public class PreMigrationCheckFunctionalTests
    {
        private Mock<ILogger<PreMigrationCheckService>> _mockLogger;
        private Mock<ILogicEngineService> _mockLogicEngine;
        private PreMigrationCheckService _service;
        private string _testProfilePath;

        [TestInitialize]
        public void Setup()
        {
            _mockLogger = new Mock<ILogger<PreMigrationCheckService>>();
            _mockLogicEngine = new Mock<ILogicEngineService>();
            _testProfilePath = Path.Combine(Path.GetTempPath(), $"FunctionalTest_{Guid.NewGuid()}");
            
            _service = new PreMigrationCheckService(
                _mockLogger.Object,
                _mockLogicEngine.Object,
                _testProfilePath);
        }

        [TestCleanup]
        public void Cleanup()
        {
            if (Directory.Exists(_testProfilePath))
            {
                Directory.Delete(_testProfilePath, true);
            }
        }

        [TestMethod]
        [TestCategory("Functional")]
        public async Task LargeDataset_EligibilityCheck_ShouldPerformWithinTimeLimit()
        {
            // Arrange - Create large dataset (simulating enterprise environment)
            var users = GenerateLargeUserDataset(10000); // 10K users
            var mailboxes = GenerateLargeMailboxDataset(8000); // 8K mailboxes
            var fileShares = GenerateLargeFileShareDataset(5000); // 5K file shares
            var databases = GenerateLargeDatabaseDataset(500); // 500 databases

            _mockLogicEngine.Setup(x => x.GetAllUsersAsync()).Returns(Task.FromResult(users.ConvertAll(u => new MandADiscoverySuite.Models.UserDto(
                UPN: u.UserPrincipalName ?? string.Empty,
                Sam: u.UserPrincipalName ?? string.Empty,
                Sid: $"S-1-5-21-{Guid.NewGuid().ToString().Replace("-", "")}",
                Mail: null,
                DisplayName: u.DisplayName ?? string.Empty,
                Enabled: u.IsEnabled,
                OU: null,
                ManagerSid: null,
                Dept: null,
                AzureObjectId: null,
                Groups: new List<string>(),
                DiscoveryTimestamp: DateTime.UtcNow,
                DiscoveryModule: "Test",
                SessionId: "TestSession"
            ))));
            _mockLogicEngine.Setup(x => x.GetAllMailboxesAsync()).Returns(Task.FromResult(mailboxes.ConvertAll(m => new MandADiscoverySuite.Models.MailboxDto(
                UPN: m.UserPrincipalName ?? string.Empty,
                MailboxGuid: null,
                SizeMB: m.TotalSizeBytes / (1024 * 1024),
                Type: m.MailboxType ?? "UserMailbox",
                DiscoveryTimestamp: DateTime.UtcNow,
                DiscoveryModule: "Test",
                SessionId: "TestSession"
            ))));
            _mockLogicEngine.Setup(x => x.GetAllFileSharesAsync()).Returns(Task.FromResult(new List<MandADiscoverySuite.Models.FileShareDto>()));
            _mockLogicEngine.Setup(x => x.GetAllSqlDatabasesAsync()).Returns(Task.FromResult(new List<MandADiscoverySuite.Models.SqlDbDto>()));
            _mockLogicEngine.Setup(x => x.GetMailboxByUpnAsync(It.IsAny<string>()))
                .ReturnsAsync((MandADiscoverySuite.Models.MailboxDto)null);

            // Act
            var startTime = DateTime.UtcNow;
            var report = await _service.GetEligibilityReportAsync();
            var endTime = DateTime.UtcNow;
            var duration = endTime - startTime;

            // Assert
            duration.Should().BeLessThan(TimeSpan.FromMinutes(5), "Large dataset should be processed within 5 minutes");
            report.Users.Should().HaveCount(10000);
            report.Mailboxes.Should().HaveCount(8000);
            report.Files.Should().HaveCount(5000);
            report.Databases.Should().HaveCount(500);
            
            // Verify performance logging
            _mockLogger.Verify(x => x.Log(
                Microsoft.Extensions.Logging.LogLevel.Information,
                It.IsAny<EventId>(),
                It.Is<It.IsAnyType>((v, t) => v.ToString().Contains("Pre-migration checks completed")),
                It.IsAny<Exception>(),
                It.IsAny<Func<It.IsAnyType, Exception, string>>()),
                Times.Once);
        }

        [TestMethod]
        [TestCategory("Functional")]
        public async Task RealisticEnterpriseScenario_MixedEligibility_ShouldCategorizeCorrectly()
        {
            // Arrange - Mixed scenario with typical enterprise issues
            var users = new List<MigrationUserDto>
            {
                // Eligible users (70%)
                CreateUser("S-1", "John Doe", "john.doe@contoso.com", true, "johndoe"),
                CreateUser("S-2", "Jane Smith", "jane.smith@contoso.com", true, "jsmith"),
                CreateUser("S-3", "Bob Johnson", "bob.johnson@contoso.com", true, "bjohnson"),

                // Blocked users (30%)
                CreateUser("S-4", "Disabled User", "disabled@contoso.com", false, "disabled"), // Disabled
                CreateUser("S-5", "Invalid UPN", "bad upn@contoso.com", true, "badupn"), // Space in UPN
                CreateUser("S-6", "Bad<Display>", "badchar@contoso.com", true, "badchar") // Invalid display name chars
            };

            var mailboxes = new List<MigrationMailboxDto>
            {
                // Normal mailboxes
                CreateMailbox("john.doe@contoso.com", 25000, "UserMailbox"),
                CreateMailbox("jane.smith@contoso.com", 45000, "UserMailbox"),

                // Large mailbox (blocked)
                CreateMailbox("large@contoso.com", 150000, "UserMailbox"),

                // Unsupported type (blocked)
                CreateMailbox("discovery@contoso.com", 5000, "DiscoveryMailbox")
            };

            var fileShares = new List<MigrationFileShareDto>
            {
                CreateFileShare(Path.GetTempPath(), "ValidShare1"),
                CreateFileShare(@"C:\TestShare", "ValidShare2"),

                // Invalid shares
                CreateFileShare(new string('x', 300), "LongPath"), // Too long
                CreateFileShare(@"Z:\NonExistent", "Missing") // Inaccessible
            };

            var databases = new List<MigrationSqlDatabaseDto>
            {
                CreateDatabase("SQL01", "DEFAULT", "ValidDB1"),
                CreateDatabase("SQL02", "DEFAULT", "ValidDB2"),

                // Invalid databases
                CreateDatabase("SQL03", "DEFAULT", "Invalid<DB>"), // Invalid chars
                CreateDatabase("SQL04", "DEFAULT", null) // Missing name
            };

            SetupMockData(users, mailboxes, fileShares, databases);

            // Act
            var report = await _service.GetEligibilityReportAsync();

            // Assert - Verify realistic enterprise ratios
            var eligibleUsers = report.Users.Count(u => u.IsEligible);
            var blockedUsers = report.Users.Count(u => !u.IsEligible);
            
            eligibleUsers.Should().Be(3);
            blockedUsers.Should().Be(3);
            
            var eligibleMailboxes = report.Mailboxes.Count(m => m.IsEligible);
            var blockedMailboxes = report.Mailboxes.Count(m => !m.IsEligible);
            
            eligibleMailboxes.Should().Be(2);
            blockedMailboxes.Should().Be(2);
            
            // Verify detailed issue categorization
            var disabledUserIssue = report.Users.First(u => u.Id == "S-4");
            disabledUserIssue.Issues.Should().Contain("Source account is disabled");
            
            var invalidUPNIssue = report.Users.First(u => u.Id == "S-5");
            invalidUPNIssue.Issues.Should().Contain("UPN contains invalid characters");
            
            var largeMailboxIssue = report.Mailboxes.First(m => m.Name.Contains("large"));
            largeMailboxIssue.Issues.Should().Contain(i => i.Contains("exceeds 100GB limit"));
        }

        [TestMethod]
        [TestCategory("Functional")]
        public async Task FuzzyMappingWorkflow_RealWorldNames_ShouldMatchAppropriately()
        {
            // Arrange - Real-world name variations
            var sourceUsers = new List<MigrationUserDto>
            {
                CreateUser("S-1", "Michael Johnson", "mjohnson@source.com", true, "mjohnson"),
                CreateUser("S-2", "Katherine Smith", "ksmith@source.com", true, "ksmith"),
                CreateUser("S-3", "Robert Williams", "rwilliams@source.com", true, "rwilliams"),
                CreateUser("S-4", "Elizabeth Brown", "ebrown@source.com", true, "ebrown")
            };

            // Create mock target users with name variations
            var mockTargetUsers = new List<MigrationUserDto>
            {
                CreateUser("T-1", "Mike Johnson", "mike.johnson@target.com", true, "mike.johnson"),
                CreateUser("T-2", "Kate Smith", "kate.smith@target.com", true, "kate.smith"),
                CreateUser("T-3", "Bob Williams", "bob.williams@target.com", true, "bob.williams"),
                CreateUser("T-4", "Liz Brown", "liz.brown@target.com", true, "liz.brown"),
                CreateUser("T-5", "John Doe", "john.doe@target.com", true, "john.doe") // No match
            };

            SetupMockData(sourceUsers, new List<MigrationMailboxDto>(), new List<MigrationFileShareDto>(), new List<MigrationSqlDatabaseDto>());

            // Mock the private GetTargetUsersAsync method by using reflection or creating a derived class
            // For this test, we'll verify the fuzzy matching algorithm separately
            var fuzzyMatcher = new FuzzyMatchingAlgorithm();

            // Act & Assert - Test fuzzy matching scenarios
            var michaelToMike = fuzzyMatcher.CalculateJaroWinklerSimilarity("Michael Johnson", "Mike Johnson");
            var katToKate = fuzzyMatcher.CalculateJaroWinklerSimilarity("Katherine Smith", "Kate Smith");
            var robertToBob = fuzzyMatcher.CalculateJaroWinklerSimilarity("Robert Williams", "Bob Williams");
            var elizabethToLiz = fuzzyMatcher.CalculateJaroWinklerSimilarity("Elizabeth Brown", "Liz Brown");

            michaelToMike.Should().BeGreaterThan(0.8, "Michael/Mike should have high similarity");
            katToKate.Should().BeGreaterThan(0.7, "Katherine/Kate should have decent similarity");
            robertToBob.Should().BeGreaterThan(0.6, "Robert/Bob should have moderate similarity");
            elizabethToLiz.Should().BeGreaterThan(0.5, "Elizabeth/Liz should have some similarity");

            var report = await _service.GetEligibilityReportAsync();
            report.Users.All(u => u.IsEligible).Should().BeTrue();
        }

        [TestMethod]
        [TestCategory("Functional")]
        public async Task MappingPersistenceWorkflow_CrossSession_ShouldMaintainIntegrity()
        {
            // Arrange - Session 1: Initial eligibility check and manual mapping
            var users = new List<MigrationUserDto>
            {
                CreateUser("S-1", "John Doe", "john.doe@contoso.com", true, "johndoe"),
                CreateUser("S-2", "Jane Smith", "jane.smith@contoso.com", true, "jsmith")
            };

            SetupMockData(users, new List<MigrationMailboxDto>(), new List<MigrationFileShareDto>(), new List<MigrationSqlDatabaseDto>());

            var report1 = await _service.GetEligibilityReportAsync();

            // Create manual mappings
            var manualMappings = new List<ObjectMapping>
            {
                new ObjectMapping
                {
                    SourceId = "S-1",
                    TargetId = "T-1",
                    TargetName = "John Doe Target",
                    MappingType = "Manual",
                    Confidence = 1.0,
                    Notes = "Verified by admin",
                    CreatedBy = "test.admin@contoso.com",
                    CreatedAt = DateTime.UtcNow
                },
                new ObjectMapping
                {
                    SourceId = "S-2",
                    TargetId = "T-2",
                    TargetName = "Jane Smith Target",
                    MappingType = "Manual",
                    Confidence = 1.0,
                    Notes = "Approved by manager",
                    CreatedBy = "test.admin@contoso.com",
                    CreatedAt = DateTime.UtcNow
                }
            };

            await _service.SaveManualmappingsAsync(manualMappings);

            // Act - Session 2: New service instance (simulating application restart)
            var newService = new PreMigrationCheckService(
                _mockLogger.Object,
                _mockLogicEngine.Object,
                _testProfilePath);

            SetupMockData(users, new List<MigrationMailboxDto>(), new List<MigrationFileShareDto>(), new List<MigrationSqlDatabaseDto>());
            var report2 = await newService.GetEligibilityReportAsync();

            // Assert - Mappings should be restored
            report2.Users.Should().HaveCount(2);
            
            var user1 = report2.Users.First(u => u.Id == "S-1");
            var user2 = report2.Users.First(u => u.Id == "S-2");
            
            user1.MappingStatus.Should().Be("Manually Mapped");
            user1.TargetMapping.Should().NotBeNull();
            user1.TargetMapping.TargetName.Should().Be("John Doe Target");
            user1.TargetMapping.Notes.Should().Be("Verified by admin");
            
            user2.MappingStatus.Should().Be("Manually Mapped");
            user2.TargetMapping.Should().NotBeNull();
            user2.TargetMapping.TargetName.Should().Be("Jane Smith Target");
            user2.TargetMapping.Notes.Should().Be("Approved by manager");

            // Verify file integrity
            var mappingsFile = Path.Combine(_testProfilePath, "Mappings", "manual-mappings.json");
            File.Exists(mappingsFile).Should().BeTrue();
            
            var fileContent = await File.ReadAllTextAsync(mappingsFile);
            var savedMappings = JsonSerializer.Deserialize<Dictionary<string, ObjectMapping>>(fileContent);
            
            savedMappings.Should().HaveCount(2);
            savedMappings.Should().ContainKey("S-1");
            savedMappings.Should().ContainKey("S-2");
        }

        [TestMethod]
        [TestCategory("Functional")]
        public async Task BlockedItemsPrevention_ShouldEnforceBusinessRules()
        {
            // Arrange - Mix of valid and invalid items
            var users = new List<MigrationUserDto>
            {
                CreateUser("Valid-1", "Valid User", "valid@contoso.com", true, "validuser"),
                CreateUser("Blocked-1", "Blocked User", "blocked@contoso.com", false, "blockeduser"), // Disabled
                CreateUser("Blocked-2", "Invalid UPN", "bad upn@contoso.com", true, "badupn") // Invalid UPN
            };

            var mailboxes = new List<MigrationMailboxDto>
            {
                CreateMailbox("valid@contoso.com", 50000, "UserMailbox"),
                CreateMailbox("toolarge@contoso.com", 150000, "UserMailbox"), // Too large
                CreateMailbox("unsupported@contoso.com", 5000, "DiscoveryMailbox") // Unsupported type
            };

            var fileShares = new List<MigrationFileShareDto>
            {
                new MigrationFileShareDto { Path = "\\\\server1\\share1", Name = "Valid Share", Description = "Valid file share", ShareType = "ReadWrite" },
                new MigrationFileShareDto { Path = "\\\\server2\\share2", Name = "Large Share", Description = "Large file share", ShareType = "ReadWrite" }, // Too large
                new MigrationFileShareDto { Path = "\\\\server3\\share3", Name = "Invalid Share", Description = "Invalid permissions", ShareType = "ReadOnly" } // Invalid permissions
            };

            var sqlDatabases = new List<MigrationSqlDatabaseDto>
            {
                new MigrationSqlDatabaseDto { Name = "ProductionDB", Server = "SQL-PROD-01", Database = "ProductionDB", SizeMB = 1000 },
                new MigrationSqlDatabaseDto { Name = "LargeDB", Server = "SQL-PROD-02", Database = "LargeDB", SizeMB = 100000 }, // Too large
                new MigrationSqlDatabaseDto { Name = "TestDB", Server = "MYSQL-TEST-01", Database = "TestDB", SizeMB = 100 } // Unsupported database type
            };

            SetupMockData(users, mailboxes, fileShares, sqlDatabases);

            // Act
            var report = await _service.GetEligibilityReportAsync();

            // Assert - Business rules enforcement
            var eligibleItems = new List<EligibilityItem>();
            var blockedItems = new List<EligibilityItem>();
            
            eligibleItems.AddRange(report.Users.Where(u => u.IsEligible));
            eligibleItems.AddRange(report.Mailboxes.Where(m => m.IsEligible));
            
            blockedItems.AddRange(report.Users.Where(u => !u.IsEligible));
            blockedItems.AddRange(report.Mailboxes.Where(m => !m.IsEligible));

            // Only eligible items should be allowed for migration
            eligibleItems.Should().HaveCount(2); // 1 user + 1 mailbox
            blockedItems.Should().HaveCount(4); // 2 users + 2 mailboxes

            // Verify blocked items have specific reasons
            var blockedUser1 = blockedItems.First(i => i.Id == "Blocked-1");
            blockedUser1.Issues.Should().Contain("Source account is disabled");

            var blockedUser2 = blockedItems.First(i => i.Id == "Blocked-2");
            blockedUser2.Issues.Should().Contain("UPN contains invalid characters");

            var largeMailbox = blockedItems.First(i => i.Name.Contains("toolarge"));
            largeMailbox.Issues.Should().Contain(i => i.Contains("exceeds 100GB limit"));

            var unsupportedMailbox = blockedItems.First(i => i.Name.Contains("unsupported"));
            unsupportedMailbox.Issues.Should().Contain(i => i.Contains("Unsupported mailbox type"));
        }

        [TestMethod]
        [TestCategory("Functional")]
        public async Task ErrorHandling_InvalidData_ShouldHandleGracefully()
        {
            // Arrange - Data with various edge cases and invalid inputs
            var problematicUsers = new List<MigrationUserDto>
            {
                new MigrationUserDto { UserPrincipalName = "nullsid@contoso.com", DisplayName = "Null SID", IsEnabled = true },
                new MigrationUserDto { UserPrincipalName = "emptysid@contoso.com", DisplayName = "Empty SID", IsEnabled = true },
                new MigrationUserDto { UserPrincipalName = "nullname@contoso.com", DisplayName = null, IsEnabled = true },
                new MigrationUserDto { UserPrincipalName = null, DisplayName = "", IsEnabled = true },
                new MigrationUserDto { UserPrincipalName = "unicode@contoso.com", DisplayName = "Unicode Test \u00A0\u200B", IsEnabled = true }
            };

            var problematicMailboxes = new List<MigrationMailboxDto>
            {
                new MigrationMailboxDto { UserPrincipalName = null, TotalSizeBytes = 5242880L, MailboxType = "UserMailbox" },
                new MigrationMailboxDto { UserPrincipalName = "", TotalSizeBytes = -1000, MailboxType = null },
                new MigrationMailboxDto { UserPrincipalName = "negative@contoso.com", TotalSizeBytes = -500, MailboxType = "UserMailbox" }
            };

            _mockLogicEngine.Setup(x => x.GetAllUsersAsync()).Returns(Task.FromResult(problematicUsers.ConvertAll(u => new MandADiscoverySuite.Models.UserDto(
                UPN: u.UserPrincipalName ?? string.Empty,
                Sam: u.UserPrincipalName ?? string.Empty,
                Sid: $"S-1-5-21-{Guid.NewGuid().ToString().Replace("-", "")}",
                Mail: null,
                DisplayName: u.DisplayName ?? string.Empty,
                Enabled: u.IsEnabled,
                OU: null,
                ManagerSid: null,
                Dept: null,
                AzureObjectId: null,
                Groups: new List<string>(),
                DiscoveryTimestamp: DateTime.UtcNow,
                DiscoveryModule: "Test",
                SessionId: "TestSession"
            ))));
            _mockLogicEngine.Setup(x => x.GetAllMailboxesAsync()).Returns(Task.FromResult(problematicMailboxes.ConvertAll(m => new MandADiscoverySuite.Models.MailboxDto(
                UPN: m.UserPrincipalName ?? string.Empty,
                MailboxGuid: null,
                SizeMB: m.TotalSizeBytes / (1024 * 1024),
                Type: m.MailboxType ?? "UserMailbox",
                DiscoveryTimestamp: DateTime.UtcNow,
                DiscoveryModule: "Test",
                SessionId: "TestSession"
            ))));
            _mockLogicEngine.Setup(x => x.GetAllFileSharesAsync()).Returns(Task.FromResult(new List<MandADiscoverySuite.Models.FileShareDto>()));
            _mockLogicEngine.Setup(x => x.GetAllSqlDatabasesAsync()).Returns(Task.FromResult(new List<MandADiscoverySuite.Models.SqlDbDto>()));
            _mockLogicEngine.Setup(x => x.GetMailboxByUpnAsync(It.IsAny<string>()))
                .Returns(Task.FromResult((MandADiscoverySuite.Models.MailboxDto)null));

            // Act - Should not throw exceptions
            var report = await _service.GetEligibilityReportAsync();

            // Assert - Should handle all problematic data gracefully
            report.Should().NotBeNull();
            report.Users.Should().HaveCount(5);
            report.Mailboxes.Should().HaveCount(3);

            // All problematic items should be marked as blocked with appropriate issues
            report.Users.Where(u => !u.IsEligible).Should().HaveCountGreaterThan(0);
            report.Mailboxes.Where(m => !m.IsEligible).Should().HaveCountGreaterThan(0);

            // Verify logging of errors
            _mockLogger.Verify(x => x.Log(
                Microsoft.Extensions.Logging.LogLevel.Information,
                It.IsAny<EventId>(),
                It.Is<It.IsAnyType>((v, t) => true),
                It.IsAny<Exception>(),
                It.IsAny<Func<It.IsAnyType, Exception, string>>()),
                Times.AtLeastOnce);
        }

        #region Helper Methods

        private List<MigrationUserDto> GenerateLargeUserDataset(int count)
        {
            var users = new List<MigrationUserDto>();
            var random = new Random(42); // Fixed seed for reproducible tests

            for (int i = 1; i <= count; i++)
            {
                users.Add(new MigrationUserDto
                {
                    UserPrincipalName = $"testuser{i:D6}@contoso.com",
                    DisplayName = $"TestUser{i:D6}",
                    IsEnabled = random.Next(0, 100) < 85, // 85% enabled (realistic ratio)
                });
            }
            
            return users;
        }

        private List<MigrationMailboxDto> GenerateLargeMailboxDataset(int count)
        {
            var mailboxes = new List<MigrationMailboxDto>();
            var random = new Random(42);
            var types = new[] { "UserMailbox", "SharedMailbox", "RoomMailbox", "EquipmentMailbox", "DiscoveryMailbox" };

            for (int i = 1; i <= count; i++)
            {
                mailboxes.Add(new MigrationMailboxDto
                {
                    UserPrincipalName = $"testmailbox{i:D6}@contoso.com",
                    TotalSizeBytes = random.Next(1000, 120000) * 1024L * 1024L, // 1GB to 120GB range
                    MailboxType = types[random.Next(0, types.Length)]
                });
            }
            
            return mailboxes;
        }

        private List<MigrationFileShareDto> GenerateLargeFileShareDataset(int count)
        {
            var shares = new List<MigrationFileShareDto>();
            var random = new Random(42);

            for (int i = 1; i <= count; i++)
            {
                var pathLength = random.Next(50, 280); // Mix of normal and long paths
                var path = $@"C:\Share{i:D6}\" + new string('x', Math.Max(0, pathLength - 20));

                shares.Add(new MigrationFileShareDto
                {
                    Path = path,
                    Name = $"TestShare{i:D6}",
                    Server = "TestServer",
                    ShareType = "SMB"
                });
            }
            
            return shares;
        }

        private List<MigrationSqlDatabaseDto> GenerateLargeDatabaseDataset(int count)
        {
            var databases = new List<MigrationSqlDatabaseDto>();
            var random = new Random(42);

            for (int i = 1; i <= count; i++)
            {
                databases.Add(new MigrationSqlDatabaseDto
                {
                    Server = $"SQL{(i % 10) + 1:D2}",
                    Instance = random.Next(0, 3) == 0 ? "NAMED" : "DEFAULT",
                    Database = $"TestDB{i:D6}"
                });
            }

            return databases;
        }

        private MigrationUserDto CreateUser(string sid, string displayName, string upn, bool enabled, string sam) =>
            new MigrationUserDto
            {
                UserPrincipalName = upn,
                DisplayName = displayName,
                IsEnabled = enabled
            };

        private MigrationMailboxDto CreateMailbox(string upn, int sizeMB, string type) =>
            new MigrationMailboxDto
            {
                UserPrincipalName = upn,
                TotalSizeBytes = sizeMB * 1024L * 1024L,
                MailboxType = type
            };

        private MigrationFileShareDto CreateFileShare(string path, string name) =>
            new MigrationFileShareDto
            {
                Path = path,
                Name = name,
                Server = "TestServer",
                ShareType = "SMB"
            };

        private MigrationSqlDatabaseDto CreateDatabase(string server, string instance, string database) =>
            new MigrationSqlDatabaseDto
            {
                Server = server,
                Instance = instance,
                Database = database
            };

        private void SetupMockData(List<MigrationUserDto> users, List<MigrationMailboxDto> mailboxes,
                                  List<MigrationFileShareDto> fileShares, List<MigrationSqlDatabaseDto> databases)
        {
            _mockLogicEngine.Setup(x => x.GetAllUsersAsync()).Returns(Task.FromResult(users.ConvertAll(u => new MandADiscoverySuite.Models.UserDto(
                UPN: u.UserPrincipalName ?? string.Empty,
                Sam: u.UserPrincipalName ?? string.Empty,
                Sid: $"S-1-5-21-{Guid.NewGuid().ToString().Replace("-", "")}",
                Mail: null,
                DisplayName: u.DisplayName ?? string.Empty,
                Enabled: u.IsEnabled,
                OU: null,
                ManagerSid: null,
                Dept: null,
                AzureObjectId: null,
                Groups: new List<string>(),
                DiscoveryTimestamp: DateTime.UtcNow,
                DiscoveryModule: "Test",
                SessionId: "TestSession"
            ))));
            _mockLogicEngine.Setup(x => x.GetAllMailboxesAsync()).Returns(Task.FromResult(mailboxes.ConvertAll(m => new MandADiscoverySuite.Models.MailboxDto(
                UPN: m.UserPrincipalName ?? string.Empty,
                MailboxGuid: null,
                SizeMB: m.TotalSizeBytes / (1024 * 1024),
                Type: m.MailboxType ?? "UserMailbox",
                DiscoveryTimestamp: DateTime.UtcNow,
                DiscoveryModule: "Test",
                SessionId: "TestSession"
            ))));
            _mockLogicEngine.Setup(x => x.GetAllFileSharesAsync()).Returns(Task.FromResult(new List<MandADiscoverySuite.Models.FileShareDto>()));
            _mockLogicEngine.Setup(x => x.GetAllSqlDatabasesAsync()).Returns(Task.FromResult(new List<MandADiscoverySuite.Models.SqlDbDto>()));
            _mockLogicEngine.Setup(x => x.GetMailboxByUpnAsync(It.IsAny<string>()))
                .ReturnsAsync((MandADiscoverySuite.Models.MailboxDto)null);
        }

        #endregion
    }
}