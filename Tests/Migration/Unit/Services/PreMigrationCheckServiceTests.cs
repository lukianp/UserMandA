using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using FluentAssertions;
using MandADiscoverySuite.Models;
using MandADiscoverySuite.Services;
using MandADiscoverySuite.Services.Migration;
using Microsoft.Extensions.Logging;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using Moq;
using SqlDatabaseDto = MandADiscoverySuite.Models.Migration.SqlDatabaseDto;

namespace MigrationTestSuite.Unit.Services
{
    /// <summary>
    /// Comprehensive unit tests for PreMigrationCheckService (T-031)
    /// Tests all eligibility rules, fuzzy matching, and persistence mechanisms
    /// </summary>
    [TestClass]
    public class PreMigrationCheckServiceTests
    {
        private Mock<ILogger<PreMigrationCheckService>> _mockLogger;
        private Mock<ILogicEngineService> _mockLogicEngine;
        private PreMigrationCheckService _service;
        private string _testProfilePath;
        private string _testMappingsPath;

        [TestInitialize]
        public void Setup()
        {
            _mockLogger = new Mock<ILogger<PreMigrationCheckService>>();
            _mockLogicEngine = new Mock<ILogicEngineService>();
            _testProfilePath = Path.Combine(Path.GetTempPath(), $"TestProfile_{Guid.NewGuid()}");
            _testMappingsPath = Path.Combine(_testProfilePath, "Mappings");

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

        #region User Eligibility Tests

        [TestMethod]
        public async Task CheckUserEligibility_DisabledAccount_ShouldBeBlocked()
        {
            // Arrange
            var disabledUser = new UserDto("john.doe@contoso.com", null, null, null, null, false, "Disabled", null, "johndoe", null, new List<string>(), DateTime.UtcNow, "contoso.com", "User");

            _mockLogicEngine.Setup(x => x.GetAllUsersAsync())
                .ReturnsAsync(new List<UserDto> { disabledUser });
            _mockLogicEngine.Setup(x => x.GetMailboxByUpnAsync(It.IsAny<string>()))
                .ReturnsAsync((MailboxDto)null);

            // Act
            var report = await _service.GetEligibilityReportAsync();

            // Assert
            report.Users.Should().HaveCount(1);
            var userItem = report.Users.First();
            userItem.IsEligible.Should().BeFalse();
            userItem.Issues.Should().Contain("Source account is disabled");
            report.TotalBlocked.Should().Be(1);
        }

        [TestMethod]
        public async Task CheckUserEligibility_MissingUPN_ShouldBeBlocked()
        {
            // Arrange
            var userWithoutUPN = new UserDto(null, null, null, null, // DisplayName
                "janedoe", // Department
                null, // Title
                true, // Enabled
                null, // UPN - missing
                "S-1-5-21-12345-2", null, // Phone
                new List<string>(), // Groups
                DateTime.UtcNow, // Created
                "contoso.com", // Domain
                "User" // Type
            );

            _mockLogicEngine.Setup(x => x.GetAllUsersAsync())
                .ReturnsAsync(new List<UserDto> { userWithoutUPN });
            _mockLogicEngine.Setup(x => x.GetMailboxByUpnAsync(It.IsAny<string>()))
                .ReturnsAsync((MailboxDto)null);

            // Act
            var report = await _service.GetEligibilityReportAsync();

            // Assert
            report.Users.Should().HaveCount(1);
            var userItem = report.Users.First();
            userItem.IsEligible.Should().BeFalse();
            userItem.Issues.Should().Contain("User Principal Name is missing");
        }

        [TestMethod]
        public async Task CheckUserEligibility_InvalidUPNCharacters_ShouldBeBlocked()
        {
            // Arrange
            var invalidCharTests = new[]
            {
                "user name@contoso.com",  // Space
                "user'name@contoso.com",  // Single quote
                "user\"name@contoso.com"  // Double quote
            };

            foreach (var invalidUPN in invalidCharTests)
            {
                var user = new UserDto(invalidUPN, null, null, null, // DisplayName
                    "testuser", // Department
                    null, // Title
                    true, // Enabled
                    null, // UPN
                    $"S-1-5-21-12345-{Guid.NewGuid()}", null, // Phone
                    new List<string>(), // Groups
                    DateTime.UtcNow, // Created
                    "contoso.com", // Domain
                    "User" // Type
                );

                _mockLogicEngine.Setup(x => x.GetAllUsersAsync())
                    .ReturnsAsync(new List<UserDto> { user });
                _mockLogicEngine.Setup(x => x.GetMailboxByUpnAsync(It.IsAny<string>()))
                    .ReturnsAsync((MailboxDto)null);

                // Act
                var report = await _service.GetEligibilityReportAsync();

                // Assert
                report.Users.Should().HaveCount(1);
                var userItem = report.Users.First();
                userItem.IsEligible.Should().BeFalse();
                userItem.Issues.Should().Contain("UPN contains invalid characters");
            }
        }

        [TestMethod]
        public async Task CheckUserEligibility_LargeMailbox_ShouldBeBlocked()
        {
            // Arrange
            var user = new UserDto("large.user@contoso.com", null, null, null, // DisplayName
                "largeuser", // Department
                null, // Title
                true, // Enabled
                null, // UPN
                "S-1-5-21-12345-3", null, // Phone
                new List<string>(), // Groups
                DateTime.UtcNow, // Created
                "contoso.com", // Domain
                "User" // Type
            );

            var largeMailbox = new MailboxDto(
                "large.user@contoso.com", // UPN
                "Large User", // DisplayName
                150000.0m, // SizeMB - 150GB
                "UserMailbox", // Type
                DateTime.UtcNow, // Created
                "contoso.com", // Domain
                "LargeUser", // Alias
                new List<string>(), // Permissions
                null // ArchiveStatus
            );

            _mockLogicEngine.Setup(x => x.GetAllUsersAsync())
                .ReturnsAsync(new List<UserDto> { user });
            _mockLogicEngine.Setup(x => x.GetMailboxByUpnAsync("large.user@contoso.com"))
                .ReturnsAsync(largeMailbox);

            // Act
            var report = await _service.GetEligibilityReportAsync();

            // Assert
            report.Users.Should().HaveCount(1);
            var userItem = report.Users.First();
            userItem.IsEligible.Should().BeFalse();
            userItem.Issues.Should().Contain(i => i.Contains("exceeds 100GB limit"));
        }

        [TestMethod]
        public async Task CheckUserEligibility_BlockedDisplayNameCharacters_ShouldBeBlocked()
        {
            // Arrange
            var blockedChars = new[] { '<', '>', '"', '|', '\0', '\n', '\r', '\t' };
            var users = new List<UserDto>();

            foreach (var blockedChar in blockedChars)
            {
                users.Add(new UserDto($"user{Guid.NewGuid()}@contoso.com", null, null, null, // DisplayName
                    $"user{Guid.NewGuid()}", // Department
                    null, // Title
                    true, // Enabled
                    null, // UPN
                    $"S-1-5-21-12345-{Guid.NewGuid()}", null, // Phone
                    new List<string>(), // Groups
                    DateTime.UtcNow, // Created
                    "contoso.com", // Domain
                    "User" // Type
                ));
            }

            _mockLogicEngine.Setup(x => x.GetAllUsersAsync())
                .ReturnsAsync(users);
            _mockLogicEngine.Setup(x => x.GetMailboxByUpnAsync(It.IsAny<string>()))
                .ReturnsAsync((MailboxDto)null);

            // Act
            var report = await _service.GetEligibilityReportAsync();

            // Assert
            report.Users.Should().HaveCount(blockedChars.Length);
            report.Users.All(u => !u.IsEligible).Should().BeTrue();
            report.Users.All(u => u.Issues.Contains("Display name contains blocked characters"))
                .Should().BeTrue();
        }

        [TestMethod]
        public async Task CheckUserEligibility_ValidUser_ShouldBeEligible()
        {
            // Arrange
            var validUser = new UserDto("valid.user@contoso.com", null, null, null, // DisplayName
                "validuser", // Department
                null, // Title
                true, // Enabled
                null, // UPN
                "S-1-5-21-12345-4", null, // Phone
                new List<string>(), // Groups
                DateTime.UtcNow, // Created
                "contoso.com", // Domain
                "User" // Type
            );

            var normalMailbox = new MailboxDto(
                "valid.user@contoso.com", // UPN
                "Valid User", // DisplayName
                50000.0m, // SizeMB - 50GB
                "UserMailbox", // Type
                DateTime.UtcNow, // Created
                "contoso.com", // Domain
                "ValidUser", // Alias
                new List<string>(), // Permissions
                null // ArchiveStatus
            );

            _mockLogicEngine.Setup(x => x.GetAllUsersAsync())
                .ReturnsAsync(new List<UserDto> { validUser });
            _mockLogicEngine.Setup(x => x.GetMailboxByUpnAsync("valid.user@contoso.com"))
                .ReturnsAsync(normalMailbox);

            // Act
            var report = await _service.GetEligibilityReportAsync();

            // Assert
            report.Users.Should().HaveCount(1);
            var userItem = report.Users.First();
            userItem.IsEligible.Should().BeTrue();
            userItem.Issues.Should().BeEmpty();
            report.TotalEligible.Should().Be(1);
        }

        #endregion

        #region Mailbox Eligibility Tests

        [TestMethod]
        public async Task CheckMailboxEligibility_ExceedsSizeLimit_ShouldBeBlocked()
        {
            // Arrange
            var oversizedMailbox = new MailboxDto(
                "oversized@contoso.com", // UPN
                "Oversized User", // DisplayName
                120000.0m, // SizeMB - 120GB
                "UserMailbox", // Type
                DateTime.UtcNow, // Created
                "contoso.com", // Domain
                "Oversized", // Alias
                new List<string>(), // Permissions
                null // ArchiveStatus
            );

            _mockLogicEngine.Setup(x => x.GetAllMailboxesAsync())
                .ReturnsAsync(new List<MailboxDto> { oversizedMailbox });

            // Act
            var report = await _service.GetEligibilityReportAsync();

            // Assert
            report.Mailboxes.Should().HaveCount(1);
            var mailboxItem = report.Mailboxes.First();
            mailboxItem.IsEligible.Should().BeFalse();
            mailboxItem.Issues.Should().Contain(i => i.Contains("exceeds 100GB limit"));
        }

        [TestMethod]
        public async Task CheckMailboxEligibility_UnsupportedType_ShouldBeBlocked()
        {
            // Arrange
            var unsupportedTypes = new[] { "DiscoveryMailbox", "ArbitrationMailbox", "SystemMailbox" };
            var mailboxes = unsupportedTypes.Select(type => new MailboxDto(
                $"{type.ToLower()}@contoso.com", // UPN
                $"{type} User", // DisplayName
                5000.0m, // SizeMB
                type, // Type
                DateTime.UtcNow, // Created
                "contoso.com", // Domain
                type.ToLower(), // Alias
                new List<string>(), // Permissions
                null // ArchiveStatus
            )).ToList();

            _mockLogicEngine.Setup(x => x.GetAllMailboxesAsync())
                .ReturnsAsync(mailboxes);

            // Act
            var report = await _service.GetEligibilityReportAsync();

            // Assert
            report.Mailboxes.Should().HaveCount(unsupportedTypes.Length);
            report.Mailboxes.All(m => !m.IsEligible).Should().BeTrue();
            report.Mailboxes.All(m => m.Issues.Any(i => i.Contains("Unsupported mailbox type")))
                .Should().BeTrue();
        }

        [TestMethod]
        public async Task CheckMailboxEligibility_InvalidUPN_ShouldBeBlocked()
        {
            // Arrange
            var invalidMailboxes = new List<MailboxDto>
            {
                new MailboxDto(null, "User1", 5000.0m, "UserMailbox", DateTime.UtcNow, "contoso.com", "user1", new List<string>(), null),
                new MailboxDto("", "User2", 5000.0m, "UserMailbox", DateTime.UtcNow, "contoso.com", "user2", new List<string>(), null),
                new MailboxDto("noatsign", "User3", 5000.0m, "UserMailbox", DateTime.UtcNow, "contoso.com", "user3", new List<string>(), null)
            };

            _mockLogicEngine.Setup(x => x.GetAllMailboxesAsync())
                .ReturnsAsync(invalidMailboxes);

            // Act
            var report = await _service.GetEligibilityReportAsync();

            // Assert
            report.Mailboxes.Should().HaveCount(3);
            report.Mailboxes.All(m => !m.IsEligible).Should().BeTrue();
            report.Mailboxes.All(m => m.Issues.Contains("Invalid or missing UPN"))
                .Should().BeTrue();
        }

        [TestMethod]
        public async Task CheckMailboxEligibility_SupportedTypes_ShouldBeEligible()
        {
            // Arrange
            var supportedTypes = new[] { "UserMailbox", "SharedMailbox", "RoomMailbox", "EquipmentMailbox" };
            var mailboxes = supportedTypes.Select(type => new MailboxDto(
                $"{type.ToLower()}@contoso.com", // UPN
                $"{type} User", // DisplayName
                5000.0m, // SizeMB
                type, // Type
                DateTime.UtcNow, // Created
                "contoso.com", // Domain
                type.ToLower(), // Alias
                new List<string>(), // Permissions
                null // ArchiveStatus
            )).ToList();

            _mockLogicEngine.Setup(x => x.GetAllMailboxesAsync())
                .ReturnsAsync(mailboxes);

            // Act
            var report = await _service.GetEligibilityReportAsync();

            // Assert
            report.Mailboxes.Should().HaveCount(supportedTypes.Length);
            report.Mailboxes.All(m => m.IsEligible).Should().BeTrue();
            report.Mailboxes.All(m => m.Issues.Count == 0).Should().BeTrue();
        }

        #endregion

        #region File Eligibility Tests

        [TestMethod]
        public async Task CheckFileEligibility_PathTooLong_ShouldBeBlocked()
        {
            // Arrange
            var longPath = @"C:\Very\Long\Path\That\Exceeds\The\Maximum\Allowed\Length\" +
                           new string('a', 250);
            var fileShare = new FileShareDto(
                "LongPathShare", // Name
                longPath, // Path
                null, // Description
                null, // Owner
                new List<string>(), // Permissions
                DateTime.UtcNow, // Created
                "contoso.com", // Domain
                "FileShare", // Type
                null // AclEntries
            );

            _mockLogicEngine.Setup(x => x.GetAllFileSharesAsync())
                .ReturnsAsync(new List<FileShareDto> { fileShare });

            // Act
            var report = await _service.GetEligibilityReportAsync();

            // Assert
            report.Files.Should().HaveCount(1);
            var fileItem = report.Files.First();
            fileItem.IsEligible.Should().BeFalse();
            fileItem.Issues.Should().Contain(i => i.Contains("exceeds 260 character limit"));
        }

        [TestMethod]
        public async Task CheckFileEligibility_InvalidPathCharacters_ShouldBeBlocked()
        {
            // Arrange
            var invalidChars = Path.GetInvalidPathChars().Where(c => c != ':' && c != '\\').Take(5);
            var fileShares = new List<FileShareDto>();

            foreach (var invalidChar in invalidChars)
            {
                fileShares.Add(new FileShareDto(
                    $"InvalidShare{(int)invalidChar}", // Name
                    $@"C:\Share{invalidChar}Path", // Path
                    null, // Description
                    null, // Owner
                    new List<string>(), // Permissions
                    DateTime.UtcNow, // Created
                    "contoso.com", // Domain
                    "FileShare", // Type
                    null // AclEntries
                ));
            }

            _mockLogicEngine.Setup(x => x.GetAllFileSharesAsync())
                .ReturnsAsync(fileShares);

            // Act
            var report = await _service.GetEligibilityReportAsync();

            // Assert
            report.Files.Should().HaveCount(fileShares.Count);
            report.Files.All(f => !f.IsEligible).Should().BeTrue();
            report.Files.All(f => f.Issues.Contains("Path contains invalid characters"))
                .Should().BeTrue();
        }

        [TestMethod]
        public async Task CheckFileEligibility_InaccessiblePath_ShouldBeBlocked()
        {
            // Arrange
            var inaccessibleShare = new FileShareDto(
                "InaccessibleShare", // Name
                @"Z:\NonExistent\Share\Path", // Path
                null, // Description
                null, // Owner
                new List<string>(), // Permissions
                DateTime.UtcNow, // Created
                "contoso.com", // Domain
                "FileShare", // Type
                null // AclEntries
            );

            _mockLogicEngine.Setup(x => x.GetAllFileSharesAsync())
                .ReturnsAsync(new List<FileShareDto> { inaccessibleShare });

            // Act
            var report = await _service.GetEligibilityReportAsync();

            // Assert
            report.Files.Should().HaveCount(1);
            var fileItem = report.Files.First();
            fileItem.IsEligible.Should().BeFalse();
            fileItem.Issues.Should().Contain("Share path is not accessible");
        }

        [TestMethod]
        public async Task CheckFileEligibility_ValidPath_ShouldBeEligible()
        {
            // Arrange
            var tempPath = Path.GetTempPath();
            var validShare = new FileShareDto(
                "ValidShare", // Name
                tempPath, // Path
                null, // Description
                null, // Owner
                new List<string>(), // Permissions
                DateTime.UtcNow, // Created
                "contoso.com", // Domain
                "FileShare", // Type
                null // AclEntries
            );

            _mockLogicEngine.Setup(x => x.GetAllFileSharesAsync())
                .ReturnsAsync(new List<FileShareDto> { validShare });

            // Act
            var report = await _service.GetEligibilityReportAsync();

            // Assert
            report.Files.Should().HaveCount(1);
            var fileItem = report.Files.First();
            fileItem.IsEligible.Should().BeTrue();
            fileItem.Issues.Should().BeEmpty();
        }

        #endregion

        #region Database Eligibility Tests

        [TestMethod]
        public async Task CheckDatabaseEligibility_MissingName_ShouldBeBlocked()
        {
            // Arrange
            var databases = new List<SqlDatabaseDto>
            {
                new SqlDatabaseDto { Server = "SQL01", Instance = "DEFAULT", Database = null },
                new SqlDatabaseDto { Server = "SQL02", Instance = "DEFAULT", Database = "" }
            };

            _mockLogicEngine.Setup(x => x.GetAllSqlDatabasesAsync())
                .ReturnsAsync(databases);

            // Act
            var report = await _service.GetEligibilityReportAsync();

            // Assert
            report.Databases.Should().HaveCount(2);
            report.Databases.All(d => !d.IsEligible).Should().BeTrue();
            report.Databases.All(d => d.Issues.Contains("Database name is missing"))
                .Should().BeTrue();
        }

        [TestMethod]
        public async Task CheckDatabaseEligibility_InvalidCharacters_ShouldBeBlocked()
        {
            // Arrange
            var invalidChars = new[] { '<', '>', '"', '|', '\0', '\n', '\r', '\t' };
            var databases = invalidChars.Select(c => new SqlDatabaseDto
            {
                Server = "SQL01",
                Instance = "DEFAULT",
                Database = $"Database{c}Name"
            }).ToList();

            _mockLogicEngine.Setup(x => x.GetAllSqlDatabasesAsync())
                .ReturnsAsync(databases);

            // Act
            var report = await _service.GetEligibilityReportAsync();

            // Assert
            report.Databases.Should().HaveCount(invalidChars.Length);
            report.Databases.All(d => !d.IsEligible).Should().BeTrue();
            report.Databases.All(d => d.Issues.Contains("Database name contains invalid characters"))
                .Should().BeTrue();
        }

        [TestMethod]
        public async Task CheckDatabaseEligibility_ValidDatabase_ShouldBeEligible()
        {
            // Arrange
            var validDatabase = new SqlDatabaseDto
            {
                Server = "SQL01",
                Instance = "DEFAULT",
                Database = "ValidDatabase"
            };

            _mockLogicEngine.Setup(x => x.GetAllSqlDatabasesAsync())
                .ReturnsAsync(new List<SqlDatabaseDto> { validDatabase });

            // Act
            var report = await _service.GetEligibilityReportAsync();

            // Assert
            report.Databases.Should().HaveCount(1);
            var dbItem = report.Databases.First();
            dbItem.IsEligible.Should().BeTrue();
            dbItem.Issues.Should().BeEmpty();
        }

        #endregion

        #region Fuzzy Matching Tests

        [TestMethod]
        public void FuzzyMatching_ExactMatch_ShouldReturn100Percent()
        {
            // Arrange
            var fuzzyMatcher = new FuzzyMatchingAlgorithm();

            // Act
            var similarity = fuzzyMatcher.CalculateJaroWinklerSimilarity("John Smith", "John Smith");

            // Assert
            similarity.Should().Be(1.0);
        }

        [TestMethod]
        public void FuzzyMatching_CaseInsensitive_ShouldMatchRegardlessOfCase()
        {
            // Arrange
            var fuzzyMatcher = new FuzzyMatchingAlgorithm();

            // Act
            var similarity = fuzzyMatcher.CalculateJaroWinklerSimilarity("JOHN SMITH", "john smith");

            // Assert
            similarity.Should().Be(1.0);
        }

        [TestMethod]
        public void FuzzyMatching_SimilarNames_ShouldHaveHighSimilarity()
        {
            // Arrange
            var fuzzyMatcher = new FuzzyMatchingAlgorithm();
            var testCases = new[]
            {
                ("John Smith", "Jon Smith", 0.9),
                ("Michael Johnson", "Mike Johnson", 0.85),
                ("Robert Williams", "Bob Williams", 0.7),
                ("Catherine Jones", "Cathy Jones", 0.85)
            };

            foreach (var (name1, name2, minExpected) in testCases)
            {
                // Act
                var similarity = fuzzyMatcher.CalculateJaroWinklerSimilarity(name1, name2);

                // Assert
                similarity.Should().BeGreaterThan(minExpected, $"'{name1}' and '{name2}' should have similarity > {minExpected}");
            }
        }

        [TestMethod]
        public void FuzzyMatching_CompletelyDifferent_ShouldHaveLowSimilarity()
        {
            // Arrange
            var fuzzyMatcher = new FuzzyMatchingAlgorithm();

            // Act
            var similarity = fuzzyMatcher.CalculateJaroWinklerSimilarity("John Smith", "Alice Cooper");

            // Assert
            similarity.Should().BeLessThan(0.5);
        }

        [TestMethod]
        public void FuzzyMatching_EmptyStrings_ShouldHandleGracefully()
        {
            // Arrange
            var fuzzyMatcher = new FuzzyMatchingAlgorithm();

            // Act & Assert
            fuzzyMatcher.CalculateJaroWinklerSimilarity("", "").Should().Be(1.0);
            fuzzyMatcher.CalculateJaroWinklerSimilarity("John", "").Should().Be(0.0);
            fuzzyMatcher.CalculateJaroWinklerSimilarity("", "Smith").Should().Be(0.0);
            fuzzyMatcher.CalculateJaroWinklerSimilarity(null, null).Should().Be(1.0);
            fuzzyMatcher.CalculateJaroWinklerSimilarity("John", null).Should().Be(0.0);
        }

        [TestMethod]
        public void FuzzyMatching_PrefixBonus_ShouldBoostSimilarityForCommonPrefix()
        {
            // Arrange
            var fuzzyMatcher = new FuzzyMatchingAlgorithm();

            // Act
            var similarityWithPrefix = fuzzyMatcher.CalculateJaroWinklerSimilarity("DWAYNE", "DUANE");
            var similarityWithoutPrefix = fuzzyMatcher.CalculateJaroWinklerSimilarity("WAYNE", "DUANE");

            // Assert
            similarityWithPrefix.Should().BeGreaterThan(similarityWithoutPrefix,
                "Strings with common prefix should have higher Jaro-Winkler similarity");
        }

        #endregion

        #region Mapping Persistence Tests

        [TestMethod]
        public async Task SaveManualMappings_ShouldPersistToJSON()
        {
            // Arrange
            var mappings = new List<ObjectMapping>
            {
                new ObjectMapping
                {
                    SourceId = "S-1-5-21-source-1",
                    TargetId = "S-1-5-21-target-1",
                    TargetName = "Target User 1",
                    MappingType = "Manual",
                    Confidence = 1.0,
                    Notes = "Manually mapped by administrator"
                },
                new ObjectMapping
                {
                    SourceId = "S-1-5-21-source-2",
                    TargetId = "S-1-5-21-target-2",
                    TargetName = "Target User 2",
                    MappingType = "Manual",
                    Confidence = 1.0,
                    Notes = "Verified by IT team"
                }
            };

            // Act
            await _service.SaveManualmappingsAsync(mappings);

            // Assert
            var mappingsFile = Path.Combine(_testMappingsPath, "manual-mappings.json");
            File.Exists(mappingsFile).Should().BeTrue();

            var json = await File.ReadAllTextAsync(mappingsFile);
            var savedMappings = JsonSerializer.Deserialize<Dictionary<string, ObjectMapping>>(json);

            savedMappings.Should().NotBeNull();
            savedMappings.Should().HaveCount(2);
            savedMappings.Should().ContainKey("S-1-5-21-source-1");
            savedMappings.Should().ContainKey("S-1-5-21-source-2");
            savedMappings["S-1-5-21-source-1"].TargetName.Should().Be("Target User 1");
            savedMappings["S-1-5-21-source-2"].Notes.Should().Be("Verified by IT team");
        }

        [TestMethod]
        public async Task LoadManualMappings_ShouldRestoreFromJSON()
        {
            // Arrange
            var originalMappings = new Dictionary<string, ObjectMapping>
            {
                ["S-1-5-21-source-1"] = new ObjectMapping
                {
                    SourceId = "S-1-5-21-source-1",
                    TargetId = "S-1-5-21-target-1",
                    TargetName = "Restored User 1",
                    MappingType = "Manual",
                    Confidence = 1.0,
                    CreatedAt = DateTime.UtcNow.AddDays(-1),
                    CreatedBy = "admin@contoso.com"
                }
            };

            var mappingsFile = Path.Combine(_testMappingsPath, "manual-mappings.json");
            Directory.CreateDirectory(_testMappingsPath);
            var json = JsonSerializer.Serialize(originalMappings, new JsonSerializerOptions { WriteIndented = true });
            await File.WriteAllTextAsync(mappingsFile, json);

            // Create a new service instance to test loading
            var newService = new PreMigrationCheckService(
                _mockLogger.Object,
                _mockLogicEngine.Object,
                _testProfilePath);

            // Setup mock data
            var user = new UserDto("test@contoso.com", null, null, null, // DisplayName
                "testuser", // Department
                null, // Title
                true, // Enabled
                null, // UPN
                "S-1-5-21-source-1", null, // Phone
                new List<string>(), // Groups
                DateTime.UtcNow, // Created
                "contoso.com", // Domain
                "User" // Type
            );

            _mockLogicEngine.Setup(x => x.GetAllUsersAsync())
                .ReturnsAsync(new List<UserDto> { user });
            _mockLogicEngine.Setup(x => x.GetMailboxByUpnAsync(It.IsAny<string>()))
                .ReturnsAsync((MailboxDto)null);
            _mockLogicEngine.Setup(x => x.GetAllMailboxesAsync())
                .ReturnsAsync(new List<MailboxDto>());
            _mockLogicEngine.Setup(x => x.GetAllFileSharesAsync())
                .ReturnsAsync(new List<FileShareDto>());
            _mockLogicEngine.Setup(x => x.GetAllSqlDatabasesAsync())
                .ReturnsAsync(new List<SqlDatabaseDto>());

            // Act
            var report = await newService.GetEligibilityReportAsync();

            // Assert
            report.Users.Should().HaveCount(1);
            var userItem = report.Users.First();
            userItem.MappingStatus.Should().Be("Manually Mapped");
            userItem.TargetMapping.Should().NotBeNull();
            userItem.TargetMapping.TargetName.Should().Be("Restored User 1");
            userItem.TargetMapping.CreatedBy.Should().Be("admin@contoso.com");
        }

        [TestMethod]
        public async Task LoadManualMappings_MissingFile_ShouldReturnEmpty()
        {
            // Arrange
            // Ensure no mappings file exists
            var mappingsFile = Path.Combine(_testMappingsPath, "manual-mappings.json");
            if (File.Exists(mappingsFile))
            {
                File.Delete(mappingsFile);
            }

            _mockLogicEngine.Setup(x => x.GetAllUsersAsync())
                .ReturnsAsync(new List<UserDto>());
            _mockLogicEngine.Setup(x => x.GetAllMailboxesAsync())
                .ReturnsAsync(new List<MailboxDto>());
            _mockLogicEngine.Setup(x => x.GetAllFileSharesAsync())
                .ReturnsAsync(new List<FileShareDto>());
            _mockLogicEngine.Setup(x => x.GetAllSqlDatabasesAsync())
                .ReturnsAsync(new List<SqlDatabaseDto>());

            // Act
            var report = await _service.GetEligibilityReportAsync();

            // Assert
            report.Should().NotBeNull();
            // No exception should be thrown
        }

        [TestMethod]
        public async Task LoadManualMappings_CorruptedFile_ShouldHandleGracefully()
        {
            // Arrange
            var mappingsFile = Path.Combine(_testMappingsPath, "manual-mappings.json");
            Directory.CreateDirectory(_testMappingsPath);
            await File.WriteAllTextAsync(mappingsFile, "{ invalid json content ]");

            _mockLogicEngine.Setup(x => x.GetAllUsersAsync())
                .ReturnsAsync(new List<UserDto>());
            _mockLogicEngine.Setup(x => x.GetAllMailboxesAsync())
                .ReturnsAsync(new List<MailboxDto>());
            _mockLogicEngine.Setup(x => x.GetAllFileSharesAsync())
                .ReturnsAsync(new List<FileShareDto>());
            _mockLogicEngine.Setup(x => x.GetAllSqlDatabasesAsync())
                .ReturnsAsync(new List<SqlDatabaseDto>());

            // Act
            var report = await _service.GetEligibilityReportAsync();

            // Assert
            report.Should().NotBeNull();
            _mockLogger.Verify(x => x.Log(
                Microsoft.Extensions.Logging.LogLevel.Warning,
                It.IsAny<EventId>(),
                It.Is<It.IsAnyType>((v, t) => v.ToString().Contains("Error loading manual mappings")),
                It.IsAny<Exception>(),
                It.IsAny<Func<It.IsAnyType, Exception, string>>()),
                Times.Once);
        }

        #endregion

        #region Manual Mapping Override Tests

        [TestMethod]
        public async Task ManualMapping_ShouldOverrideFuzzyMatch()
        {
            // Arrange
            var sourceUser = new UserDto("john.smith@contoso.com", null, null, null, // DisplayName
                "jsmith", // Department
                null, // Title
                true, // Enabled
                null, // UPN
                "S-1-5-21-source-1", null, // Phone
                new List<string>(), // Groups
                DateTime.UtcNow, // Created
                "contoso.com", // Domain
                "User" // Type
            );

            // Create manual mapping that overrides fuzzy match
            var manualMapping = new Dictionary<string, ObjectMapping>
            {
                ["S-1-5-21-source-1"] = new ObjectMapping
                {
                    SourceId = "S-1-5-21-source-1",
                    TargetId = "S-1-5-21-manual-target",
                    TargetName = "Manually Mapped Target",
                    MappingType = "Manual",
                    Confidence = 1.0,
                    Notes = "Administrator override"
                }
            };

            var mappingsFile = Path.Combine(_testMappingsPath, "manual-mappings.json");
            Directory.CreateDirectory(_testMappingsPath);
            var json = JsonSerializer.Serialize(manualMapping, new JsonSerializerOptions { WriteIndented = true });
            await File.WriteAllTextAsync(mappingsFile, json);

            _mockLogicEngine.Setup(x => x.GetAllUsersAsync())
                .ReturnsAsync(new List<UserDto> { sourceUser });
            _mockLogicEngine.Setup(x => x.GetMailboxByUpnAsync(It.IsAny<string>()))
                .ReturnsAsync((MailboxDto)null);
            _mockLogicEngine.Setup(x => x.GetAllMailboxesAsync())
                .ReturnsAsync(new List<MailboxDto>());
            _mockLogicEngine.Setup(x => x.GetAllFileSharesAsync())
                .ReturnsAsync(new List<FileShareDto>());
            _mockLogicEngine.Setup(x => x.GetAllSqlDatabasesAsync())
                .ReturnsAsync(new List<SqlDatabaseDto>());

            // Act
            var report = await _service.GetEligibilityReportAsync();

            // Assert
            var userItem = report.Users.First();
            userItem.MappingStatus.Should().Be("Manually Mapped");
            userItem.TargetMapping.Should().NotBeNull();
            userItem.TargetMapping.TargetId.Should().Be("S-1-5-21-manual-target");
            userItem.TargetMapping.TargetName.Should().Be("Manually Mapped Target");
            userItem.TargetMapping.Notes.Should().Be("Administrator override");
        }

        #endregion

        #region Comprehensive Report Tests

        [TestMethod]
        public async Task EligibilityReport_ShouldAggregateAllObjectTypes()
        {
            // Arrange
            var users = new List<UserDto>
            {
                new UserDto("user1@contoso.com", null, null, null, "user1", null, true, null, "S-1", null, new List<string>(), DateTime.UtcNow, "contoso.com", "User"),
                new UserDto("user2@contoso.com", null, null, null, "user2", null, false, null, "S-2", null, new List<string>(), DateTime.UtcNow, "contoso.com", "User")
            };

            var mailboxes = new List<MailboxDto>
            {
                new MailboxDto("mailbox1@contoso.com", "Mailbox1", 50000.0m, "UserMailbox", DateTime.UtcNow, "contoso.com", "mailbox1", new List<string>(), null),
                new MailboxDto("mailbox2@contoso.com", "Mailbox2", 150000.0m, "UserMailbox", DateTime.UtcNow, "contoso.com", "mailbox2", new List<string>(), null)
            };

            var fileShares = new List<FileShareDto>
            {
                new FileShareDto("Share1", Path.GetTempPath(), null, null, new List<string>(), DateTime.UtcNow, "contoso.com", "FileShare", null),
                new FileShareDto("Share2", new string('x', 300), null, null, new List<string>(), DateTime.UtcNow, "contoso.com", "FileShare", null)
            };

            var databases = new List<SqlDatabaseDto>
            {
                new SqlDatabaseDto { Server = "SQL01", Instance = "DEFAULT", Database = "DB1" },
                new SqlDatabaseDto { Server = "SQL02", Instance = "DEFAULT", Database = "" }
            };

            _mockLogicEngine.Setup(x => x.GetAllUsersAsync()).ReturnsAsync(users);
            _mockLogicEngine.Setup(x => x.GetAllMailboxesAsync()).ReturnsAsync(mailboxes);
            _mockLogicEngine.Setup(x => x.GetAllFileSharesAsync()).ReturnsAsync(fileShares);
            _mockLogicEngine.Setup(x => x.GetAllSqlDatabasesAsync())
                .ReturnsAsync(databases);
            _mockLogicEngine.Setup(x => x.GetMailboxByUpnAsync(It.IsAny<string>()))
                .ReturnsAsync((MailboxDto)null);

            // Act
            var report = await _service.GetEligibilityReportAsync();

            // Assert
            report.Users.Should().HaveCount(2);
            report.Mailboxes.Should().HaveCount(2);
            report.Files.Should().HaveCount(2);
            report.Databases.Should().HaveCount(2);

            report.TotalEligible.Should().Be(4); // 1 user + 1 mailbox + 1 file + 1 database
            report.TotalBlocked.Should().Be(4);  // 1 user + 1 mailbox + 1 file + 1 database
            report.GeneratedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(10));
        }

        #endregion

        #region Thread Safety Tests

        [TestMethod]
        public async Task ConcurrentEligibilityChecks_ShouldBeThreadSafe()
        {
            // Arrange
            var users = Enumerable.Range(1, 100).Select(i => new UserDto($"user{i}@contoso.com", null, null, null, // DisplayName
                $"user{i}", // Department
                null, // Title
                i % 2 == 0, // Enabled - alternate true/false
                null, // UPN
                $"S-{i}", null, // Phone
                new List<string>(), // Groups
                DateTime.UtcNow, // Created
                "contoso.com", // Domain
                "User" // Type
            )).ToList();

            _mockLogicEngine.Setup(x => x.GetAllUsersAsync()).ReturnsAsync(users);
            _mockLogicEngine.Setup(x => x.GetAllMailboxesAsync()).ReturnsAsync(new List<MailboxDto>());
            _mockLogicEngine.Setup(x => x.GetAllFileSharesAsync()).ReturnsAsync(new List<FileShareDto>());
            _mockLogicEngine.Setup(x => x.GetAllSqlDatabasesAsync())
                .ReturnsAsync(new List<SqlDatabaseDto>());
            _mockLogicEngine.Setup(x => x.GetMailboxByUpnAsync(It.IsAny<string>()))
                .ReturnsAsync((MailboxDto)null);

            // Act
            var tasks = Enumerable.Range(1, 10).Select(_ =>
                _service.GetEligibilityReportAsync()).ToList();

            var reports = await Task.WhenAll(tasks);

            // Assert
            reports.Should().HaveCount(10);
            reports.All(r => r.Users.Count == 100).Should().BeTrue();
            reports.All(r => r.TotalEligible == 50).Should().BeTrue();
            reports.All(r => r.TotalBlocked == 50).Should().BeTrue();
        }

        [TestMethod]
        public async Task ConcurrentMappingPersistence_ShouldBeThreadSafe()
        {
            // Arrange
            var mappingTasks = new List<Task>();

            for (int i = 0; i < 10; i++)
            {
                var threadId = i;
                var mappings = new List<ObjectMapping>
                {
                    new ObjectMapping
                    {
                        SourceId = $"S-{threadId}-1",
                        TargetId = $"T-{threadId}-1",
                        TargetName = $"Target {threadId}",
                        MappingType = "Manual",
                        Confidence = 1.0
                    }
                };

                mappingTasks.Add(_service.SaveManualmappingsAsync(mappings));
            }

            // Act
            await Task.WhenAll(mappingTasks);

            // Assert
            var mappingsFile = Path.Combine(_testMappingsPath, "manual-mappings.json");
            File.Exists(mappingsFile).Should().BeTrue();

            // The last write should win, but no corruption should occur
            var json = await File.ReadAllTextAsync(mappingsFile);
            var action = () => JsonSerializer.Deserialize<Dictionary<string, ObjectMapping>>(json);
            action.Should().NotThrow();
        }

        #endregion
    }
}