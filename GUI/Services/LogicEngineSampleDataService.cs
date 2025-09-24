using System;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;

namespace MandADiscoverySuite.Services
{
    /// <summary>
    /// Production service for loading and managing sample data for LogicEngineService
    /// Provides functionality to load test datasets, validate data integrity, and manage sample scenarios
    /// </summary>
    public class LogicEngineSampleDataService
    {
        private readonly ILogger<LogicEngineSampleDataService> _logger;
        private readonly string _sampleDataRoot;

        public LogicEngineSampleDataService(ILogger<LogicEngineSampleDataService> logger, string? sampleDataRoot = null)
        {
            _logger = logger;
            _sampleDataRoot = sampleDataRoot ?? Path.Combine(AppContext.BaseDirectory, "SampleData", "LogicEngine");
        }

        /// <summary>
        /// Loads sample data into the LogicEngineService
        /// </summary>
        public async Task<bool> LoadSampleDataAsync(ILogicEngineService logicEngine)
        {
            try
            {
                _logger.LogInformation("Loading sample data from {DataRoot}", _sampleDataRoot);

                // Ensure sample data directory exists
                if (!Directory.Exists(_sampleDataRoot))
                {
                    await CreateSampleDataAsync().ConfigureAwait(false);
                }

                // Load the data using LogicEngineService
                var success = await logicEngine.LoadAllAsync().ConfigureAwait(false);

                if (success)
                {
                    var stats = logicEngine.GetLoadStatistics();
                    _logger.LogInformation("Sample data loaded successfully. Users: {UserCount}, Groups: {GroupCount}, Devices: {DeviceCount}",
                        stats.UserCount, stats.GroupCount, stats.DeviceCount);
                }

                return success;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to load sample data");
                return false;
            }
        }

        /// <summary>
        /// Creates sample data files for demonstration purposes
        /// </summary>
        public async Task CreateSampleDataAsync()
        {
            try
            {
                Directory.CreateDirectory(_sampleDataRoot);

                // Create sample Users.csv
                var usersCsv = Path.Combine(_sampleDataRoot, "Users.csv");
                await File.WriteAllTextAsync(usersCsv, @"UPN,Sam,Sid,Mail,DisplayName,Enabled,OU,ManagerSid,Dept,AzureObjectId,Groups,DiscoveryTimestamp,DiscoveryModule,SessionId
user1@contoso.com,user1,S-1-5-21-1-1-1-1001,user1@contoso.com,User One,True,OU=Users,,IT,11111111-1111-1111-1111-111111111111,GroupA,2024-01-01T00:00:00Z,ActiveDirectoryDiscovery,session-001
user2@contoso.com,user2,S-1-5-21-1-1-1-1002,user2@contoso.com,User Two,True,OU=Users,,IT,22222222-2222-2222-2222-222222222222,GroupA,2024-01-01T00:00:00Z,ActiveDirectoryDiscovery,session-001
admin@contoso.com,admin,S-1-5-21-1-1-1-500,admin@contoso.com,Administrator,True,OU=Domain Controllers,,IT,33333333-3333-3333-3333-333333333333,Domain Admins,2024-01-01T00:00:00Z,ActiveDirectoryDiscovery,session-001").ConfigureAwait(false);

                // Create sample Groups.csv
                var groupsCsv = Path.Combine(_sampleDataRoot, "Groups.csv");
                await File.WriteAllTextAsync(groupsCsv, @"Sid,Name,Type,Members,DiscoveryTimestamp,DiscoveryModule,SessionId,NestedGroups
S-1-5-21-1-1-1-1003,GroupA,Security,S-1-5-21-1-1-1-1001;S-1-5-21-1-1-1-1002,2024-01-01T00:00:00Z,ActiveDirectoryDiscovery,session-001,
S-1-5-21-1-1-1-1004,Domain Admins,Security,S-1-5-21-1-1-1-500,2024-01-01T00:00:00Z,ActiveDirectoryDiscovery,session-001,").ConfigureAwait(false);

                // Create sample Devices.csv
                var devicesCsv = Path.Combine(_sampleDataRoot, "Devices.csv");
                await File.WriteAllTextAsync(devicesCsv, @"Name,DNS,OU,OS,PrimaryUserSid,InstalledApps,DiscoveryTimestamp,DiscoveryModule,SessionId
WORKSTATION1,workstation1.contoso.com,OU=Workstations,Windows 10,S-1-5-21-1-1-1-1001,Microsoft Office;Chrome,2024-01-01T00:00:00Z,ComputerInventory,session-001
SERVER1,server1.contoso.com,OU=Servers,Windows Server 2019,S-1-5-21-1-1-1-500,SQL Server;Exchange,2024-01-01T00:00:00Z,ComputerInventory,session-001").ConfigureAwait(false);

                // Create sample Applications.csv
                var appsCsv = Path.Combine(_sampleDataRoot, "Applications.csv");
                await File.WriteAllTextAsync(appsCsv, @"Id,Name,Source,InstallCounts,Executables,Publishers,DiscoveryTimestamp,DiscoveryModule,SessionId
APP001,Microsoft Office,Microsoft,50,WINWORD.EXE;EXCEL.EXE;POWERPNT.EXE,Microsoft Corporation,2024-01-01T00:00:00Z,AppInventory,session-001
APP002,Google Chrome,Google,45,CHROME.EXE,Google LLC,2024-01-01T00:00:00Z,AppInventory,session-001
APP003,SQL Server,Microsoft,2,SQLSERVR.EXE,Microsoft Corporation,2024-01-01T00:00:00Z,AppInventory,session-001").ConfigureAwait(false);

                // Create sample NTFS_ACL.csv
                var aclCsv = Path.Combine(_sampleDataRoot, "NTFS_ACL.csv");
                await File.WriteAllTextAsync(aclCsv, @"Path,IdentitySid,Rights,Inherited,IsShare,IsNTFS,DiscoveryTimestamp,DiscoveryModule,SessionId
C:\Share,S-1-5-21-1-1-1-1003,Read,False,False,True,2024-01-01T00:00:00Z,NTFS_ACL,session-001
C:\Share\Sensitive,S-1-5-21-1-1-1-1004,FullControl,False,False,True,2024-01-01T00:00:00Z,NTFS_ACL,session-001").ConfigureAwait(false);

                _logger.LogInformation("Sample data created successfully in {DataRoot}", _sampleDataRoot);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to create sample data");
                throw;
            }
        }

        /// <summary>
        /// Validates the integrity of loaded sample data
        /// </summary>
        public async Task<SampleDataValidationResult> ValidateSampleDataAsync(ILogicEngineService logicEngine)
        {
            var result = new SampleDataValidationResult();

            try
            {
                var stats = logicEngine.GetLoadStatistics();

                // Validate basic data loading
                result.UsersLoaded = stats.UserCount > 0;
                result.GroupsLoaded = stats.GroupCount > 0;
                result.DevicesLoaded = stats.DeviceCount > 0;
                result.ApplicationsLoaded = stats.AppCount > 0;

                // Validate inference rules
                result.InferenceRulesApplied = stats.InferenceRulesApplied > 0;

                // Validate specific sample data
                var user1 = await logicEngine.GetUserDetailAsync("S-1-5-21-1-1-1-1001").ConfigureAwait(false);
                result.User1Found = user1 != null;

                if (user1 != null)
                {
                    result.User1HasGroups = user1.Groups.Count > 0;
                    result.User1HasDevices = user1.Devices.Count > 0;
                }

                // Validate ACL inference
                var user2 = await logicEngine.GetUserDetailAsync("S-1-5-21-1-1-1-1002").ConfigureAwait(false);
                result.User2Found = user2 != null;

                if (user2 != null)
                {
                    result.AclInferenceWorking = user2.Shares.Count > 0;
                }

                // Calculate overall validation score
                var validItems = new[] {
                    result.UsersLoaded, result.GroupsLoaded, result.DevicesLoaded,
                    result.ApplicationsLoaded, result.User1Found, result.User2Found
                }.Count(x => x);

                result.OverallScore = (double)validItems / 6.0;
                result.IsValid = result.OverallScore >= 0.8; // 80% success rate

                _logger.LogInformation("Sample data validation completed. Score: {Score:P1}, Valid: {Valid}",
                    result.OverallScore, result.IsValid);

            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Sample data validation failed");
                result.IsValid = false;
                result.ValidationError = ex.Message;
            }

            return result;
        }

        /// <summary>
        /// Creates a test scenario with duplicate users to test deduplication logic
        /// </summary>
        public async Task CreateDuplicateUserScenarioAsync()
        {
            var usersCsv = Path.Combine(_sampleDataRoot, "Users_DuplicateTest.csv");
            await File.WriteAllTextAsync(usersCsv, @"UPN,Sam,Sid,Mail,DisplayName,Enabled,OU,ManagerSid,Dept,AzureObjectId,Groups,DiscoveryTimestamp,DiscoveryModule,SessionId
user1@contoso.com,user1,S-1-5-21-1-1-1-1001,user1@contoso.com,User One,True,OU=Users,,IT,11111111-1111-1111-1111-111111111111,GroupA,2024-01-01T00:00:00Z,ActiveDirectoryDiscovery,session-001
user1@contoso.com,user1,S-1-5-21-1-1-1-1001,user1@contoso.com,User One,True,OU=Users,,IT,11111111-1111-1111-1111-111111111111,GroupA,2024-01-01T00:00:00Z,ActiveDirectoryDiscovery,session-001").ConfigureAwait(false);

            _logger.LogInformation("Created duplicate user scenario at {FilePath}", usersCsv);
        }

        /// <summary>
        /// Creates a test scenario with invalid timestamp data
        /// </summary>
        public async Task CreateInvalidTimestampScenarioAsync()
        {
            var usersCsv = Path.Combine(_sampleDataRoot, "Users_InvalidTimestamp.csv");
            await File.WriteAllTextAsync(usersCsv, @"UPN,Sam,Sid,Mail,DisplayName,Enabled,OU,ManagerSid,Dept,AzureObjectId,Groups,DiscoveryTimestamp,DiscoveryModule,SessionId
user1@contoso.com,user1,S-1-5-21-1-1-1-1001,user1@contoso.com,User One,True,OU=Users,,IT,11111111-1111-1111-1111-111111111111,GroupA,not-a-date,ActiveDirectoryDiscovery,session-001
user2@contoso.com,user2,S-1-5-21-1-1-1-1002,user2@contoso.com,User Two,True,OU=Users,,IT,22222222-2222-2222-2222-222222222222,GroupA,2024-01-01T00:00:00Z,ActiveDirectoryDiscovery,session-001").ConfigureAwait(false);

            _logger.LogInformation("Created invalid timestamp scenario at {FilePath}", usersCsv);
        }

        /// <summary>
        /// Creates a test scenario with missing headers
        /// </summary>
        public async Task CreateMissingHeadersScenarioAsync()
        {
            var usersCsv = Path.Combine(_sampleDataRoot, "Users_MissingHeaders.csv");
            await File.WriteAllTextAsync(usersCsv, @"user1@contoso.com,user1,S-1-5-21-1-1-1-1001,user1@contoso.com,User One,True,OU=Users,,IT,11111111-1111-1111-1111-111111111111,GroupA,2024-01-01T00:00:00Z,ActiveDirectoryDiscovery,session-001
user2@contoso.com,user2,S-1-5-21-1-1-1-1002,user2@contoso.com,User Two,True,OU=Users,,IT,22222222-2222-2222-2222-222222222222,GroupA,2024-01-01T00:00:00Z,ActiveDirectoryDiscovery,session-001").ConfigureAwait(false);

            _logger.LogInformation("Created missing headers scenario at {FilePath}", usersCsv);
        }
    }

    /// <summary>
    /// Result of sample data validation
    /// </summary>
    public class SampleDataValidationResult
    {
        public bool UsersLoaded { get; set; }
        public bool GroupsLoaded { get; set; }
        public bool DevicesLoaded { get; set; }
        public bool ApplicationsLoaded { get; set; }
        public bool InferenceRulesApplied { get; set; }
        public bool User1Found { get; set; }
        public bool User1HasGroups { get; set; }
        public bool User1HasDevices { get; set; }
        public bool User2Found { get; set; }
        public bool AclInferenceWorking { get; set; }
        public double OverallScore { get; set; }
        public bool IsValid { get; set; }
        public string? ValidationError { get; set; }
    }
}