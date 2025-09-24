using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using Moq;
using Xunit;
using MandADiscoverySuite.Models;
using MandADiscoverySuite.Services;

namespace MandADiscoverySuite.Tests.Services
{
    /// <summary>
    /// Comprehensive test suite for LogicEngineService implementation
    /// Tests CSV parsing, inference rules, projections, and performance scenarios
    /// </summary>
    public class LogicEngineServiceTests : IDisposable
    {
        private readonly Mock<ILogger<LogicEngineService>> _mockLogger;
        private readonly string _testDataPath;
        private readonly LogicEngineService _logicEngine;

        public LogicEngineServiceTests()
        {
            _mockLogger = new Mock<ILogger<LogicEngineService>>();
            _testDataPath = Path.Combine(Path.GetTempPath(), "LogicEngineTests", Guid.NewGuid().ToString());
            Directory.CreateDirectory(_testDataPath);
            
            _logicEngine = new LogicEngineService(_mockLogger.Object, _testDataPath);
            
            // Set up test data
            SetupTestData();
        }

        #region Setup and Teardown

        private void SetupTestData()
        {
            // Create Users.csv
            var usersData = @"UPN,Sam,Sid,Mail,DisplayName,Enabled,OU,ManagerSid,Dept,AzureObjectId,Groups,DiscoveryTimestamp,DiscoveryModule,SessionId
jdoe@contoso.com,jdoe,S-1-5-21-1234567890-1234567890-1234567890-1001,jdoe@contoso.com,John Doe,True,OU=Users,S-1-5-21-1234567890-1234567890-1234567890-2001,IT,12345678-1234-1234-1234-123456789abc,Domain Users;IT Users,2024-01-15T10:30:00Z,ActiveDirectoryDiscovery,session-001
asmith@contoso.com,asmith,S-1-5-21-1234567890-1234567890-1234567890-1002,asmith@contoso.com,Alice Smith,True,OU=Users,S-1-5-21-1234567890-1234567890-1234567890-2001,HR,12345678-1234-1234-1234-123456789def,Domain Users;HR Users,2024-01-15T10:31:00Z,ActiveDirectoryDiscovery,session-001
bwilson@contoso.com,bwilson,S-1-5-21-1234567890-1234567890-1234567890-1003,bwilson@contoso.com,Bob Wilson,False,OU=Users,,Sales,,Domain Users;Sales Users,2024-01-15T10:32:00Z,ActiveDirectoryDiscovery,session-001";

            // Create Groups.csv
            var groupsData = @"Sid,Name,Type,Members,DiscoveryTimestamp,DiscoveryModule,SessionId,NestedGroups
S-1-5-21-1234567890-1234567890-1234567890-3001,IT Users,Security,S-1-5-21-1234567890-1234567890-1234567890-1001,2024-01-15T10:30:00Z,ActiveDirectoryDiscovery,session-001,IT Admins
S-1-5-21-1234567890-1234567890-1234567890-3002,HR Users,Security,S-1-5-21-1234567890-1234567890-1234567890-1002,2024-01-15T10:30:00Z,ActiveDirectoryDiscovery,session-001,
S-1-5-21-1234567890-1234567890-1234567890-3003,Sales Users,Security,S-1-5-21-1234567890-1234567890-1234567890-1003,2024-01-15T10:30:00Z,ActiveDirectoryDiscovery,session-001,
S-1-5-21-1234567890-1234567890-1234567890-3004,IT Admins,Security,S-1-5-21-1234567890-1234567890-1234567890-1001,2024-01-15T10:30:00Z,ActiveDirectoryDiscovery,session-001,";

            // Create Devices.csv
            var devicesData = @"Name,DNS,OU,OS,PrimaryUserSid,InstalledApps,DiscoveryTimestamp,DiscoveryModule,SessionId
WS001,WS001.contoso.com,OU=Computers,Windows 10,S-1-5-21-1234567890-1234567890-1234567890-1001,Microsoft Office 365;Google Chrome,2024-01-15T11:00:00Z,ComputerDiscovery,session-001
WS002,WS002.contoso.com,OU=Computers,Windows 11,S-1-5-21-1234567890-1234567890-1234567890-1002,Microsoft Office 365;Mozilla Firefox,2024-01-15T11:01:00Z,ComputerDiscovery,session-001
SRV001,SRV001.contoso.com,OU=Servers,Windows Server 2019,,SQL Server 2019;IIS,2024-01-15T11:02:00Z,ComputerDiscovery,session-001";

            // Create Applications.csv
            var appsData = @"Id,Name,Source,InstallCounts,Executables,Publishers,DiscoveryTimestamp,DiscoveryModule,SessionId
app-001,Microsoft Office 365,Registry,2,outlook.exe;winword.exe;excel.exe,Microsoft Corporation,2024-01-15T12:00:00Z,ApplicationDiscovery,session-001
app-002,Google Chrome,Registry,1,chrome.exe,Google LLC,2024-01-15T12:01:00Z,ApplicationDiscovery,session-001
app-003,Mozilla Firefox,Registry,1,firefox.exe,Mozilla Corporation,2024-01-15T12:02:00Z,ApplicationDiscovery,session-001";

            // Create GPOs.csv
            var gposData = @"Guid,Name,Links,SecurityFilter,WmiFilter,Enabled,DiscoveryTimestamp,DiscoveryModule,SessionId
{12345678-1234-1234-1234-123456789abc},Default Domain Policy,OU=Domain,Authenticated Users,,True,2024-01-15T13:00:00Z,GroupPolicyDiscovery,session-001
{12345678-1234-1234-1234-123456789def},IT Security Policy,OU=IT,S-1-5-21-1234567890-1234567890-1234567890-3001,Windows 10,True,2024-01-15T13:01:00Z,GroupPolicyDiscovery,session-001";

            // Create NTFS_ACL.csv
            var aclsData = @"Path,IdentitySid,Rights,Inherited,IsShare,IsNTFS,DiscoveryTimestamp,DiscoveryModule,SessionId
C:\Shares\IT,S-1-5-21-1234567890-1234567890-1234567890-3001,FullControl,False,True,True,2024-01-15T14:00:00Z,FileSystemDiscovery,session-001
C:\Shares\HR,S-1-5-21-1234567890-1234567890-1234567890-3002,Modify,False,True,True,2024-01-15T14:01:00Z,FileSystemDiscovery,session-001
C:\Shares\Sales,S-1-5-21-1234567890-1234567890-1234567890-3003,Read,False,True,True,2024-01-15T14:02:00Z,FileSystemDiscovery,session-001";

            // Create Mailboxes.csv
            var mailboxesData = @"UPN,DisplayName,PrimarySmtpAddress,TotalSize,ProhibitSendQuota,MailboxType,DiscoveryTimestamp,DiscoveryModule,SessionId
jdoe@contoso.com,John Doe,jdoe@contoso.com,2048,10240,Regular,2024-01-15T15:00:00Z,ExchangeDiscovery,session-001
asmith@contoso.com,Alice Smith,asmith@contoso.com,1024,10240,Regular,2024-01-15T15:01:00Z,ExchangeDiscovery,session-001";

            // Write test CSV files
            File.WriteAllText(Path.Combine(_testDataPath, "Users.csv"), usersData);
            File.WriteAllText(Path.Combine(_testDataPath, "Groups.csv"), groupsData);
            File.WriteAllText(Path.Combine(_testDataPath, "Devices.csv"), devicesData);
            File.WriteAllText(Path.Combine(_testDataPath, "Applications.csv"), appsData);
            File.WriteAllText(Path.Combine(_testDataPath, "GPOs.csv"), gposData);
            File.WriteAllText(Path.Combine(_testDataPath, "NTFS_ACL.csv"), aclsData);
            File.WriteAllText(Path.Combine(_testDataPath, "Mailboxes.csv"), mailboxesData);

            // Create empty files for other modules to test missing data handling
            File.WriteAllText(Path.Combine(_testDataPath, "AzureRoles.csv"), "");
            File.WriteAllText(Path.Combine(_testDataPath, "SQL.csv"), "");
            File.WriteAllText(Path.Combine(_testDataPath, "MappedDrives.csv"), "");
        }

        public void Dispose()
        {
            if (Directory.Exists(_testDataPath))
            {
                Directory.Delete(_testDataPath, true);
            }
        }

        #endregion

        #region Basic Loading Tests

        [Fact]
        public async Task LoadAllAsync_ShouldSucceed_WithValidData()
        {
            // Act
            var result = await _logicEngine.LoadAllAsync();

            // Assert
            Assert.True(result, "LoadAllAsync should return true for successful load");
            Assert.NotNull(_logicEngine.LastLoadTime);
            Assert.False(_logicEngine.IsLoading);
        }

        [Fact]
        public async Task LoadAllAsync_ShouldPreventConcurrentLoads()
        {
            // Arrange - Start first load
            var firstLoad = _logicEngine.LoadAllAsync();
            
            // Act - Attempt second load while first is running
            var secondLoad = _logicEngine.LoadAllAsync();
            
            // Wait for both
            var firstResult = await firstLoad;
            var secondResult = await secondLoad;

            // Assert
            Assert.True(firstResult, "First load should succeed");
            Assert.False(secondResult, "Second concurrent load should be rejected");
        }

        [Fact]
        public async Task GetLoadStatistics_ShouldReturnValidCounts()
        {
            // Arrange
            await _logicEngine.LoadAllAsync();

            // Act
            var stats = _logicEngine.GetLoadStatistics();

            // Assert
            Assert.Equal(3, stats.UserCount);
            Assert.Equal(4, stats.GroupCount);
            Assert.Equal(3, stats.DeviceCount);
            Assert.Equal(3, stats.AppCount);
            Assert.Equal(2, stats.GpoCount);
            Assert.Equal(3, stats.AclEntryCount);
            Assert.Equal(2, stats.MailboxCount);
            Assert.True(stats.LoadDuration.TotalMilliseconds > 0);
        }

        #endregion

        #region CSV Parsing Tests

        [Fact]
        public async Task ParseUsers_ShouldHandleAllFields()
        {
            // Arrange
            await _logicEngine.LoadAllAsync();

            // Act
            var users = await _logicEngine.GetUsersAsync();

            // Assert
            Assert.Equal(3, users.Count);
            
            var john = users.First(u => u.Sam == "jdoe");
            Assert.Equal("jdoe@contoso.com", john.UPN);
            Assert.Equal("S-1-5-21-1234567890-1234567890-1234567890-1001", john.Sid);
            Assert.True(john.Enabled);
            Assert.Equal("IT", john.Dept);
            Assert.Equal("12345678-1234-1234-1234-123456789abc", john.AzureObjectId);
        }

        [Fact]
        public async Task ParseGroups_ShouldHandleNestedGroups()
        {
            // Arrange
            await _logicEngine.LoadAllAsync();

            // Act
            var group = await _logicEngine.GetGroupDetailAsync("IT Users");

            // Assert
            Assert.NotNull(group);
            Assert.Equal("IT Users", group.Name);
            Assert.Equal("Security", group.Type);
            Assert.Contains("S-1-5-21-1234567890-1234567890-1234567890-1001", group.Members);
        }

        [Fact]
        public async Task ParseDevices_ShouldLinkPrimaryUsers()
        {
            // Arrange
            await _logicEngine.LoadAllAsync();

            // Act
            var devices = await _logicEngine.GetDevicesAsync();
            var ws001 = devices.First(d => d.Name == "WS001");

            // Assert
            Assert.Equal("S-1-5-21-1234567890-1234567890-1234567890-1001", ws001.PrimaryUserSid);
            Assert.Contains("Microsoft Office 365", ws001.InstalledApps);
            Assert.Contains("Google Chrome", ws001.InstalledApps);
        }

        #endregion

        #region Date and Boolean Parsing Tests

        [Fact]
        public async Task ParseUsers_ShouldHandleBooleanVariations()
        {
            // Arrange - Create test data with different boolean representations
            var boolTestData = @"UPN,Sam,Sid,Mail,DisplayName,Enabled,OU,ManagerSid,Dept,AzureObjectId,Groups,DiscoveryTimestamp,DiscoveryModule,SessionId
test1@test.com,test1,S-1-5-21-1-1001,test1@test.com,Test User 1,TRUE,OU=Test,,Test,,Domain Users,2024-01-15T10:30:00Z,Test,session-test
test2@test.com,test2,S-1-5-21-1-1002,test2@test.com,Test User 2,true,OU=Test,,Test,,Domain Users,2024-01-15T10:30:00Z,Test,session-test
test3@test.com,test3,S-1-5-21-1-1003,test3@test.com,Test User 3,1,OU=Test,,Test,,Domain Users,2024-01-15T10:30:00Z,Test,session-test
test4@test.com,test4,S-1-5-21-1-1004,test4@test.com,Test User 4,FALSE,OU=Test,,Test,,Domain Users,2024-01-15T10:30:00Z,Test,session-test
test5@test.com,test5,S-1-5-21-1-1005,test5@test.com,Test User 5,false,OU=Test,,Test,,Domain Users,2024-01-15T10:30:00Z,Test,session-test
test6@test.com,test6,S-1-5-21-1-1006,test6@test.com,Test User 6,0,OU=Test,,Test,,Domain Users,2024-01-15T10:30:00Z,Test,session-test";

            var boolTestPath = Path.Combine(_testDataPath, "BoolTest_Users.csv");
            File.WriteAllText(boolTestPath, boolTestData);
            
            var boolTestEngine = new LogicEngineService(_mockLogger.Object, _mockCache.Object, _testDataPath);
            File.Move(Path.Combine(_testDataPath, "Users.csv"), Path.Combine(_testDataPath, "Users_backup.csv"));
            File.Move(boolTestPath, Path.Combine(_testDataPath, "Users.csv"));

            // Act
            await boolTestEngine.LoadAllAsync();
            var users = await boolTestEngine.GetUsersAsync();

            // Assert
            Assert.True(users.First(u => u.Sam == "test1").Enabled); // TRUE
            Assert.True(users.First(u => u.Sam == "test2").Enabled); // true
            Assert.True(users.First(u => u.Sam == "test3").Enabled); // 1
            Assert.False(users.First(u => u.Sam == "test4").Enabled); // FALSE
            Assert.False(users.First(u => u.Sam == "test5").Enabled); // false
            Assert.False(users.First(u => u.Sam == "test6").Enabled); // 0

            // Cleanup
            File.Move(Path.Combine(_testDataPath, "Users_backup.csv"), Path.Combine(_testDataPath, "Users.csv"));
        }

        [Fact]
        public async Task ParseCSV_ShouldHandleDateTimeFormats()
        {
            // Arrange - The test data already contains ISO format dates
            await _logicEngine.LoadAllAsync();

            // Act
            var users = await _logicEngine.GetUsersAsync();
            var john = users.First(u => u.Sam == "jdoe");

            // Assert
            Assert.Equal(new DateTime(2024, 1, 15, 10, 30, 0, DateTimeKind.Utc), john.DiscoveryTimestamp);
        }

        #endregion

        #region Missing Data and Error Handling Tests

        [Fact]
        public async Task LoadAllAsync_ShouldHandleMissingFiles()
        {
            // Arrange - Create engine with non-existent path
            var missingDataEngine = new LogicEngineService(_mockLogger.Object, _mockCache.Object, Path.Combine(_testDataPath, "NonExistent"));

            // Act & Assert - Should not throw, should handle gracefully
            var result = await missingDataEngine.LoadAllAsync();
            Assert.True(result); // Should still succeed even with missing files
        }

        [Fact]
        public async Task LoadAllAsync_ShouldHandleEmptyFiles()
        {
            // Arrange - Already set up empty files for AzureRoles, SQL, MappedDrives
            await _logicEngine.LoadAllAsync();

            // Act
            var stats = _logicEngine.GetLoadStatistics();

            // Assert - Should handle empty files without errors
            Assert.Equal(0, stats.AzureRoleCount);
            Assert.Equal(0, stats.SqlDbCount);
            Assert.Equal(0, stats.MappedDriveCount);
        }

        [Fact]
        public async Task ParseCSV_ShouldHandleMalformedData()
        {
            // Arrange - Create malformed CSV
            var malformedData = @"UPN,Sam,Sid,Mail,DisplayName,Enabled,OU,ManagerSid,Dept,AzureObjectId,Groups,DiscoveryTimestamp,DiscoveryModule,SessionId
test@test.com,test,INVALID-SID,test@test.com,Test User,INVALID-BOOL,OU=Test,,Test,,Domain Users,INVALID-DATE,Test,session-test";

            File.WriteAllText(Path.Combine(_testDataPath, "Malformed_Users.csv"), malformedData);
            File.Move(Path.Combine(_testDataPath, "Users.csv"), Path.Combine(_testDataPath, "Users_backup.csv"));
            File.Move(Path.Combine(_testDataPath, "Malformed_Users.csv"), Path.Combine(_testDataPath, "Users.csv"));

            var malformedEngine = new LogicEngineService(_mockLogger.Object, _mockCache.Object, _testDataPath);

            // Act & Assert - Should handle malformed data gracefully
            var result = await malformedEngine.LoadAllAsync();
            Assert.True(result); // Should still succeed, handling errors gracefully

            // Cleanup
            File.Move(Path.Combine(_testDataPath, "Users_backup.csv"), Path.Combine(_testDataPath, "Users.csv"));
        }

        #endregion

        #region Index Building and Relationship Tests

        [Fact]
        public async Task BuildIndices_ShouldCreateBidirectionalUserGroupRelationships()
        {
            // Arrange
            await _logicEngine.LoadAllAsync();

            // Act
            var john = await _logicEngine.GetUserDetailAsync("S-1-5-21-1234567890-1234567890-1234567890-1001");
            var itGroup = await _logicEngine.GetGroupDetailAsync("IT Users");

            // Assert
            Assert.NotNull(john);
            Assert.NotNull(itGroup);
            
            // User should be linked to group
            Assert.Contains(john.Groups.Select(g => g.Name), name => name == "IT Users");
            
            // Group should contain user
            Assert.Contains("S-1-5-21-1234567890-1234567890-1234567890-1001", itGroup.Members);
        }

        [Fact]
        public async Task BuildIndices_ShouldLinkDevicesToPrimaryUsers()
        {
            // Arrange
            await _logicEngine.LoadAllAsync();

            // Act
            var john = await _logicEngine.GetUserDetailAsync("S-1-5-21-1234567890-1234567890-1234567890-1001");
            var ws001 = await _logicEngine.GetAssetDetailAsync("WS001");

            // Assert
            Assert.NotNull(john);
            Assert.NotNull(ws001);
            
            // User should have device listed
            Assert.Contains(john.Devices, d => d.Name == "WS001");
            
            // Device should reference user
            Assert.Equal("S-1-5-21-1234567890-1234567890-1234567890-1001", ws001.PrimaryUserSid);
        }

        [Fact]
        public async Task BuildIndices_ShouldHandleCircularGroupReferences()
        {
            // Arrange - Create circular group reference test data
            var circularGroupData = @"Sid,Name,Type,Members,DiscoveryTimestamp,DiscoveryModule,SessionId,NestedGroups
S-1-5-21-1234567890-1234567890-1234567890-4001,Group A,Security,,2024-01-15T10:30:00Z,ActiveDirectoryDiscovery,session-001,S-1-5-21-1234567890-1234567890-1234567890-4002
S-1-5-21-1234567890-1234567890-1234567890-4002,Group B,Security,,2024-01-15T10:30:00Z,ActiveDirectoryDiscovery,session-001,S-1-5-21-1234567890-1234567890-1234567890-4001";

            File.WriteAllText(Path.Combine(_testDataPath, "Circular_Groups.csv"), circularGroupData);
            File.Move(Path.Combine(_testDataPath, "Groups.csv"), Path.Combine(_testDataPath, "Groups_backup.csv"));
            File.Move(Path.Combine(_testDataPath, "Circular_Groups.csv"), Path.Combine(_testDataPath, "Groups.csv"));

            var circularEngine = new LogicEngineService(_mockLogger.Object, _testDataPath);

            // Act & Assert - Should detect and handle circular references without infinite loops
            var result = await circularEngine.LoadAllAsync();
            Assert.True(result);

            // Should complete within reasonable time (not infinite loop)
            var groupA = await circularEngine.GetGroupDetailAsync("Group A");
            Assert.NotNull(groupA);

            // Cleanup
            File.Move(Path.Combine(_testDataPath, "Groups_backup.csv"), Path.Combine(_testDataPath, "Groups.csv"));
        }

        #endregion

        #region Inference Rule Tests

        [Fact]
        public async Task InferenceRules_ShouldDetectAclToGroupToUserChain()
        {
            // Arrange
            await _logicEngine.LoadAllAsync();

            // Act
            var john = await _logicEngine.GetUserDetailAsync("S-1-5-21-1234567890-1234567890-1234567890-1001");

            // Assert
            Assert.NotNull(john);
            
            // John should have access to IT share through IT Users group membership
            var itGroupAccess = john.Shares.Any(s => s.Path.Contains("IT") && s.Rights.Contains("FullControl"));
            Assert.True(itGroupAccess, "User should have IT share access through group membership");
        }

        [Fact]
        public async Task InferenceRules_ShouldDetectGpoSecurityFiltering()
        {
            // Arrange
            await _logicEngine.LoadAllAsync();

            // Act
            var john = await _logicEngine.GetUserDetailAsync("S-1-5-21-1234567890-1234567890-1234567890-1001");

            // Assert
            Assert.NotNull(john);
            
            // John should have IT Security Policy applied through IT Users group
            var itSecurityPolicy = john.GpoLinks.Any(g => g.Name == "IT Security Policy");
            Assert.True(itSecurityPolicy, "User should have IT Security Policy applied through group filtering");
        }

        [Fact]
        public async Task InferenceRules_ShouldAssignPrimaryDevice()
        {
            // Arrange
            await _logicEngine.LoadAllAsync();

            // Act
            var john = await _logicEngine.GetUserDetailAsync("S-1-5-21-1234567890-1234567890-1234567890-1001");

            // Assert
            Assert.NotNull(john);
            Assert.Single(john.Devices.Where(d => d.Name == "WS001"));
            
            var ws001 = john.Devices.First(d => d.Name == "WS001");
            Assert.Equal("S-1-5-21-1234567890-1234567890-1234567890-1001", ws001.PrimaryUserSid);
        }

        [Fact]
        public async Task InferenceRules_ShouldInferApplicationUsage()
        {
            // Arrange
            await _logicEngine.LoadAllAsync();

            // Act
            var john = await _logicEngine.GetUserDetailAsync("S-1-5-21-1234567890-1234567890-1234567890-1001");

            // Assert
            Assert.NotNull(john);
            
            // John should have applications inferred from his primary device
            Assert.Contains(john.Applications, app => app.Name == "Microsoft Office 365");
            Assert.Contains(john.Applications, app => app.Name == "Google Chrome");
        }

        #endregion

        #region UserDetailProjection Tests

        [Fact]
        public async Task GetUserDetailAsync_ShouldReturnCompleteProjection()
        {
            // Arrange
            await _logicEngine.LoadAllAsync();

            // Act
            var projection = await _logicEngine.GetUserDetailAsync("S-1-5-21-1234567890-1234567890-1234567890-1001");

            // Assert
            Assert.NotNull(projection);
            Assert.Equal("jdoe@contoso.com", projection.UPN);
            Assert.Equal("John Doe", projection.DisplayName);
            Assert.True(projection.Enabled);
            
            // Should have related entities
            Assert.NotEmpty(projection.Groups);
            Assert.NotEmpty(projection.Devices);
            Assert.NotEmpty(projection.Applications);
            Assert.NotEmpty(projection.GpoLinks);
            Assert.NotEmpty(projection.Shares);
            Assert.NotNull(projection.Mailbox);
            
            // Should have risk assessments
            Assert.NotNull(projection.Risks);
            Assert.NotNull(projection.MigrationHints);
        }

        [Fact]
        public async Task GetUserDetailAsync_ShouldHandleNonExistentUser()
        {
            // Arrange
            await _logicEngine.LoadAllAsync();

            // Act
            var projection = await _logicEngine.GetUserDetailAsync("NonExistent");

            // Assert
            Assert.Null(projection);
        }

        [Fact]
        public async Task GetUserDetailAsync_ShouldWorkWithUpnOrSid()
        {
            // Arrange
            await _logicEngine.LoadAllAsync();

            // Act
            var projectionBySid = await _logicEngine.GetUserDetailAsync("S-1-5-21-1234567890-1234567890-1234567890-1001");
            var projectionByUpn = await _logicEngine.GetUserDetailAsync("jdoe@contoso.com");

            // Assert
            Assert.NotNull(projectionBySid);
            Assert.NotNull(projectionByUpn);
            Assert.Equal(projectionBySid.UPN, projectionByUpn.UPN);
            Assert.Equal(projectionBySid.Sid, projectionByUpn.Sid);
        }

        #endregion

        #region AssetDetailProjection Tests

        [Fact]
        public async Task GetAssetDetailAsync_ShouldReturnCompleteProjection()
        {
            // Arrange
            await _logicEngine.LoadAllAsync();

            // Act
            var projection = await _logicEngine.GetAssetDetailAsync("WS001");

            // Assert
            Assert.NotNull(projection);
            Assert.Equal("WS001", projection.Name);
            Assert.Equal("Windows 10", projection.OS);
            Assert.Equal("S-1-5-21-1234567890-1234567890-1234567890-1001", projection.PrimaryUserSid);
            
            // Should have related entities
            Assert.NotEmpty(projection.InstalledApps);
            Assert.NotNull(projection.PrimaryUser);
            
            // Should have risk assessments
            Assert.NotNull(projection.Risks);
            Assert.NotNull(projection.MigrationHints);
        }

        #endregion

        #region Performance and Load Tests

        [Fact]
        public async Task LoadAllAsync_ShouldCompleteWithin10Seconds()
        {
            // Arrange
            var startTime = DateTime.UtcNow;

            // Act
            await _logicEngine.LoadAllAsync();
            var endTime = DateTime.UtcNow;

            // Assert
            var duration = endTime - startTime;
            Assert.True(duration.TotalSeconds < 10, $"Load took {duration.TotalSeconds} seconds, should be less than 10");
        }

        [Fact]
        public async Task LoadAllAsync_ShouldHandleLargeDatasets()
        {
            // Arrange - Create larger test dataset
            var largeUsersData = new System.Text.StringBuilder(@"UPN,Sam,Sid,Mail,DisplayName,Enabled,OU,ManagerSid,Dept,AzureObjectId,Groups,DiscoveryTimestamp,DiscoveryModule,SessionId");
            
            for (int i = 1; i <= 1000; i++)
            {
                largeUsersData.AppendLine($"user{i:D4}@test.com,user{i:D4},S-1-5-21-1234567890-1234567890-1234567890-{i:D4},user{i:D4}@test.com,User {i:D4},True,OU=Users,,IT,,Domain Users,2024-01-15T10:30:00Z,ActiveDirectoryDiscovery,session-001");
            }

            File.WriteAllText(Path.Combine(_testDataPath, "Large_Users.csv"), largeUsersData.ToString());
            File.Move(Path.Combine(_testDataPath, "Users.csv"), Path.Combine(_testDataPath, "Users_backup.csv"));
            File.Move(Path.Combine(_testDataPath, "Large_Users.csv"), Path.Combine(_testDataPath, "Users.csv"));

            var largeDataEngine = new LogicEngineService(_mockLogger.Object, _testDataPath);

            // Act
            var startTime = DateTime.UtcNow;
            var result = await largeDataEngine.LoadAllAsync();
            var endTime = DateTime.UtcNow;

            // Assert
            Assert.True(result);
            var stats = largeDataEngine.GetLoadStatistics();
            Assert.Equal(1000, stats.UserCount);
            
            var duration = endTime - startTime;
            Assert.True(duration.TotalSeconds < 30, $"Large dataset load took {duration.TotalSeconds} seconds, should be reasonable");

            // Cleanup
            File.Move(Path.Combine(_testDataPath, "Users_backup.csv"), Path.Combine(_testDataPath, "Users.csv"));
        }

        [Fact]
        public async Task ConcurrentAccess_ShouldBeThreadSafe()
        {
            // Arrange
            await _logicEngine.LoadAllAsync();
            
            var tasks = new List<Task<UserDetailProjection?>>();
            
            // Act - Make multiple concurrent requests
            for (int i = 0; i < 10; i++)
            {
                tasks.Add(_logicEngine.GetUserDetailAsync("S-1-5-21-1234567890-1234567890-1234567890-1001"));
                tasks.Add(_logicEngine.GetUserDetailAsync("jdoe@contoso.com"));
            }

            var results = await Task.WhenAll(tasks);

            // Assert
            Assert.All(results, result => Assert.NotNull(result));
            Assert.All(results, result => Assert.Equal("jdoe@contoso.com", result.UPN));
        }

        #endregion

        #region Event and State Tests

        [Fact]
        public async Task LoadAllAsync_ShouldRaiseDataLoadedEvent()
        {
            // Arrange
            DataLoadedEventArgs? eventArgs = null;
            _logicEngine.DataLoaded += (sender, args) => eventArgs = args;

            // Act
            await _logicEngine.LoadAllAsync();

            // Assert
            Assert.NotNull(eventArgs);
            Assert.True(eventArgs.Statistics.UserCount > 0);
            Assert.NotEmpty(eventArgs.AppliedRules);
        }

        [Fact]
        public async Task GetAppliedInferenceRules_ShouldReturnRulesList()
        {
            // Arrange
            await _logicEngine.LoadAllAsync();

            // Act
            var rules = _logicEngine.GetAppliedInferenceRules();

            // Assert
            Assert.NotEmpty(rules);
            Assert.Contains(rules, rule => rule.Contains("ACL"));
            Assert.Contains(rules, rule => rule.Contains("Group"));
            Assert.Contains(rules, rule => rule.Contains("User"));
        }

        [Fact]
        public async Task SuggestEntitlementsForUserAsync_ShouldReturnMigrationHints()
        {
            // Arrange
            await _logicEngine.LoadAllAsync();

            // Act
            var hints = await _logicEngine.SuggestEntitlementsForUserAsync("S-1-5-21-1234567890-1234567890-1234567890-1001");

            // Assert
            Assert.NotEmpty(hints);
            Assert.Contains(hints, hint => hint.Type.Contains("Group"));
            Assert.Contains(hints, hint => hint.Type.Contains("Share"));
            Assert.Contains(hints, hint => hint.Type.Contains("GPO"));
        }

        #endregion

        #region Flexible Header Mapping Tests

        [Fact]
        public async Task ParseCSV_ShouldHandleVariableColumnNames()
        {
            // Arrange - Create CSV with alternative column names
            var altHeaderData = @"UserPrincipalName,SamAccountName,ObjectSID,EmailAddress,Name,AccountEnabled,OrganizationalUnit,Manager,Department,AADObjectId,MemberOf,DiscoveredOn,Module,Session
flexible@test.com,flexible,S-1-5-21-1234567890-1234567890-1234567890-9001,flexible@test.com,Flexible User,True,OU=Test,,Test,,Domain Users,2024-01-15T10:30:00Z,Test,session-test";

            File.WriteAllText(Path.Combine(_testDataPath, "AltHeader_Users.csv"), altHeaderData);
            File.Move(Path.Combine(_testDataPath, "Users.csv"), Path.Combine(_testDataPath, "Users_backup.csv"));
            File.Move(Path.Combine(_testDataPath, "AltHeader_Users.csv"), Path.Combine(_testDataPath, "Users.csv"));

            var altEngine = new LogicEngineService(_mockLogger.Object, _testDataPath);

            // Act
            await altEngine.LoadAllAsync();
            var users = await altEngine.GetUsersAsync();

            // Assert
            var flexibleUser = users.FirstOrDefault(u => u.Sam == "flexible");
            Assert.NotNull(flexibleUser);
            Assert.Equal("flexible@test.com", flexibleUser.UPN);
            Assert.Equal("Flexible User", flexibleUser.DisplayName);

            // Cleanup
            File.Move(Path.Combine(_testDataPath, "Users_backup.csv"), Path.Combine(_testDataPath, "Users.csv"));
        }

        #endregion
    }
}