using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Logging.Abstractions;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using MandADiscoverySuite.Models;
using MandADiscoverySuite.Services;

namespace MandADiscoverySuite.Tests.Services
{
    /// <summary>
    /// T-030: Functional simulation tests for real-world cache scenarios
    /// Simulates actual UI interaction patterns and discovery module integration
    /// </summary>
    [TestClass]
    public class CachingFunctionalSimulationTests
    {
        private ILogger<LogicEngineService> _logicEngineLogger;
        private ILogger<MultiTierCacheService> _cacheLogger;
        private MemoryPressureMonitor _memoryMonitor;
        private MultiTierCacheService _cacheService;
        private LogicEngineService _logicEngine;
        private string _testDataPath;
        private string _logsPath;

        [TestInitialize]
        public void Setup()
        {
            _logicEngineLogger = new NullLogger<LogicEngineService>();
            _cacheLogger = new NullLogger<MultiTierCacheService>();
            _memoryMonitor = new MemoryPressureMonitor(new NullLogger<MemoryPressureMonitor>());
            _cacheService = new MultiTierCacheService(_cacheLogger, _memoryMonitor);
            
            _testDataPath = Path.Combine(Path.GetTempPath(), $"MandASimulation_{Guid.NewGuid():N}");
            Directory.CreateDirectory(_testDataPath);
            Directory.CreateDirectory(Path.Combine(_testDataPath, "RawData"));
            _logsPath = Path.Combine(_testDataPath, "Logs");
            Directory.CreateDirectory(_logsPath);
            
            _logicEngine = new LogicEngineService(_logicEngineLogger, null, Path.Combine(_testDataPath, "RawData"));
        }

        [TestCleanup]
        public void Cleanup()
        {
            _cacheService?.Dispose();
            _memoryMonitor?.Dispose();
            
            if (Directory.Exists(_testDataPath))
            {
                try
                {
                    Directory.Delete(_testDataPath, true);
                }
                catch { }
            }
        }

        [TestMethod]
        [TestCategory("T-030")]
        [TestCategory("FunctionalSimulation")]
        public async Task SimulateRealWorldUserSession()
        {
            // Arrange - Setup realistic data
            await SetupRealisticDataEnvironment();
            var sessionLog = new List<string>();
            var performanceMetrics = new Dictionary<string, List<double>>();

            // Act - Simulate a typical user session
            sessionLog.Add($"[{DateTime.Now:HH:mm:ss}] Session started");

            // 1. Initial application load
            var loadSw = Stopwatch.StartNew();
            await _logicEngine.LoadAllAsync();
            loadSw.Stop();
            RecordMetric(performanceMetrics, "InitialLoad", loadSw.ElapsedMilliseconds);
            sessionLog.Add($"[{DateTime.Now:HH:mm:ss}] Initial load completed in {loadSw.ElapsedMilliseconds}ms");

            // 2. User navigates to Users view
            var userViewSw = Stopwatch.StartNew();
            var users = await _logicEngine.GetUsersAsync();
            userViewSw.Stop();
            RecordMetric(performanceMetrics, "UsersViewLoad", userViewSw.ElapsedMilliseconds);
            sessionLog.Add($"[{DateTime.Now:HH:mm:ss}] Users view loaded {users.Count()} users in {userViewSw.ElapsedMilliseconds}ms");

            // 3. User searches for specific users (multiple searches)
            for (int i = 0; i < 5; i++)
            {
                var searchSw = Stopwatch.StartNew();
                var searchResult = await _logicEngine.SearchUsersAsync($"User_{i * 100}");
                searchSw.Stop();
                RecordMetric(performanceMetrics, "UserSearch", searchSw.ElapsedMilliseconds);
                sessionLog.Add($"[{DateTime.Now:HH:mm:ss}] Search {i + 1} completed in {searchSw.ElapsedMilliseconds}ms");
                await Task.Delay(500); // User thinking time
            }

            // 4. User opens user details (triggers projection load)
            var projectionSw = Stopwatch.StartNew();
            var projection = await _logicEngine.GetUserProjectionAsync("S-1-5-21-100");
            projectionSw.Stop();
            RecordMetric(performanceMetrics, "UserProjection", projectionSw.ElapsedMilliseconds);
            sessionLog.Add($"[{DateTime.Now:HH:mm:ss}] User projection loaded in {projectionSw.ElapsedMilliseconds}ms");

            // 5. User switches to Groups view
            var groupViewSw = Stopwatch.StartNew();
            var groups = await _logicEngine.GetGroupsAsync();
            groupViewSw.Stop();
            RecordMetric(performanceMetrics, "GroupsViewLoad", groupViewSw.ElapsedMilliseconds);
            sessionLog.Add($"[{DateTime.Now:HH:mm:ss}] Groups view loaded {groups.Count()} groups in {groupViewSw.ElapsedMilliseconds}ms");

            // 6. Background discovery runs and updates data
            sessionLog.Add($"[{DateTime.Now:HH:mm:ss}] Discovery module triggered");
            await SimulateDiscoveryModuleRun();
            
            // 7. User returns to Users view (should use cache if still valid)
            var cachedUserViewSw = Stopwatch.StartNew();
            var cachedUsers = await _logicEngine.GetUsersAsync();
            cachedUserViewSw.Stop();
            RecordMetric(performanceMetrics, "CachedUsersView", cachedUserViewSw.ElapsedMilliseconds);
            sessionLog.Add($"[{DateTime.Now:HH:mm:ss}] Cached users view loaded in {cachedUserViewSw.ElapsedMilliseconds}ms");

            // 8. User opens migration planning (complex operation)
            var migrationSw = Stopwatch.StartNew();
            var migrationData = await SimulateMigrationPlanning();
            migrationSw.Stop();
            RecordMetric(performanceMetrics, "MigrationPlanning", migrationSw.ElapsedMilliseconds);
            sessionLog.Add($"[{DateTime.Now:HH:mm:ss}] Migration planning completed in {migrationSw.ElapsedMilliseconds}ms");

            // Assert and Report
            WriteSessionReport(sessionLog, performanceMetrics);
            
            // Performance assertions
            Assert.IsTrue(performanceMetrics["InitialLoad"].Average() < 5000, 
                $"Initial load should complete within 5 seconds, actual: {performanceMetrics["InitialLoad"].Average()}ms");
            
            Assert.IsTrue(performanceMetrics["CachedUsersView"].Average() < performanceMetrics["UsersViewLoad"].Average(), 
                "Cached view should load faster than initial load");
            
            var cacheStats = _cacheService.GetStatistics();
            Assert.IsTrue(cacheStats.HitRate > 0.5, $"Cache hit rate should be > 50%, actual: {cacheStats.HitRate:P}");
        }

        [TestMethod]
        [TestCategory("T-030")]
        [TestCategory("MultiViewSimulation")]
        public async Task SimulateMultipleViewsConcurrentAccess()
        {
            // Arrange
            await SetupRealisticDataEnvironment();
            var viewSimulationResults = new List<ViewSimulationResult>();
            
            // Act - Simulate 5 different views accessing data concurrently
            var viewTasks = new[]
            {
                SimulateUserManagementView("View1"),
                SimulateDeviceInventoryView("View2"),
                SimulateGroupMembershipView("View3"),
                SimulateApplicationDeploymentView("View4"),
                SimulateMigrationDashboardView("View5")
            };
            
            var results = await Task.WhenAll(viewTasks);
            viewSimulationResults.AddRange(results);

            // Assert
            foreach (var result in viewSimulationResults)
            {
                Assert.IsTrue(result.Success, $"{result.ViewName} failed: {result.ErrorMessage}");
                Assert.IsTrue(result.LoadTimeMs < 3000, $"{result.ViewName} took too long: {result.LoadTimeMs}ms");
                Console.WriteLine($"{result.ViewName}: {result.LoadTimeMs}ms, Items: {result.ItemsLoaded}");
            }
            
            // Check for data consistency across views
            var userCounts = viewSimulationResults.Where(r => r.UserCount > 0).Select(r => r.UserCount).Distinct();
            Assert.AreEqual(1, userCounts.Count(), "All views should report the same user count");
        }

        [TestMethod]
        [TestCategory("T-030")]
        [TestCategory("DiscoveryIntegration")]
        public async Task SimulateDiscoveryModuleIntegration()
        {
            // Arrange
            await SetupRealisticDataEnvironment();
            await _logicEngine.LoadAllAsync();
            var initialUsers = await _logicEngine.GetUsersAsync();
            var discoveryLog = new List<string>();

            // Act - Simulate multiple discovery module runs
            for (int run = 0; run < 3; run++)
            {
                discoveryLog.Add($"Discovery Run {run + 1} started at {DateTime.Now:HH:mm:ss}");
                
                // Simulate different discovery modules updating different files
                var tasks = new List<Task>();
                
                if (run % 2 == 0)
                {
                    tasks.Add(SimulateADDiscoveryModule(run * 100));
                    tasks.Add(SimulateAzureDiscoveryModule(run * 50));
                }
                else
                {
                    tasks.Add(SimulateExchangeDiscoveryModule(run * 75));
                    tasks.Add(SimulateTeamsDiscoveryModule(run * 25));
                }
                
                await Task.WhenAll(tasks);
                
                // Cache invalidation should trigger
                await _logicEngine.LoadAllAsync();
                
                var currentUsers = await _logicEngine.GetUsersAsync();
                discoveryLog.Add($"Discovery Run {run + 1}: Users before={initialUsers.Count()}, after={currentUsers.Count()}");
                
                // Simulate UI refresh
                await Task.Delay(1000);
            }

            // Generate discovery report
            WriteDiscoveryReport(discoveryLog);
            
            // Assert
            var finalUsers = await _logicEngine.GetUsersAsync();
            Assert.IsTrue(finalUsers.Count() >= initialUsers.Count(), "Discovery should not lose data");
            
            var cacheStats = _cacheService.GetStatistics();
            Assert.IsTrue(cacheStats.ItemsEvicted > 0 || cacheStats.TotalMisses > 0, "Cache should show invalidation activity");
        }

        [TestMethod]
        [TestCategory("T-030")]
        [TestCategory("StressTest")]
        public async Task SimulateHighLoadScenario()
        {
            // Arrange
            await SetupLargeDataEnvironment();
            var stressTestMetrics = new StressTestMetrics();
            var cancellationToken = new CancellationTokenSource(TimeSpan.FromSeconds(30));
            
            // Act - Simulate high load for 30 seconds
            var tasks = new List<Task>();
            
            // Continuous readers
            for (int i = 0; i < 10; i++)
            {
                tasks.Add(ContinuousDataReader(i, stressTestMetrics, cancellationToken.Token));
            }
            
            // Periodic writers
            for (int i = 0; i < 3; i++)
            {
                tasks.Add(PeriodicDataWriter(i, stressTestMetrics, cancellationToken.Token));
            }
            
            // Cache invalidators
            tasks.Add(RandomCacheInvalidator(stressTestMetrics, cancellationToken.Token));
            
            try
            {
                await Task.WhenAll(tasks);
            }
            catch (OperationCanceledException)
            {
                // Expected when timeout occurs
            }

            // Assert and Report
            GenerateStressTestReport(stressTestMetrics);
            
            Assert.AreEqual(0, stressTestMetrics.Errors, "No errors should occur during stress test");
            Assert.IsTrue(stressTestMetrics.AverageResponseTime < 1000, 
                $"Average response time should be under 1 second, actual: {stressTestMetrics.AverageResponseTime}ms");
            Assert.IsTrue(stressTestMetrics.CacheHitRate > 0.3, 
                $"Cache hit rate should be > 30% even under stress, actual: {stressTestMetrics.CacheHitRate:P}");
        }

        #region Helper Methods

        private async Task SetupRealisticDataEnvironment()
        {
            var rawDataPath = Path.Combine(_testDataPath, "RawData");
            
            // Create realistic dataset
            await File.WriteAllTextAsync(Path.Combine(rawDataPath, "Users.csv"), GenerateRealisticUsersCsv(500));
            await File.WriteAllTextAsync(Path.Combine(rawDataPath, "Groups.csv"), GenerateRealisticGroupsCsv(100));
            await File.WriteAllTextAsync(Path.Combine(rawDataPath, "Devices.csv"), GenerateRealisticDevicesCsv(300));
            await File.WriteAllTextAsync(Path.Combine(rawDataPath, "Applications.csv"), GenerateRealisticApplicationsCsv(150));
            await File.WriteAllTextAsync(Path.Combine(rawDataPath, "Mailboxes.csv"), GenerateRealisticMailboxesCsv(400));
        }

        private async Task SetupLargeDataEnvironment()
        {
            var rawDataPath = Path.Combine(_testDataPath, "RawData");
            
            // Create large dataset for stress testing
            await File.WriteAllTextAsync(Path.Combine(rawDataPath, "Users.csv"), GenerateRealisticUsersCsv(10000));
            await File.WriteAllTextAsync(Path.Combine(rawDataPath, "Groups.csv"), GenerateRealisticGroupsCsv(2000));
            await File.WriteAllTextAsync(Path.Combine(rawDataPath, "Devices.csv"), GenerateRealisticDevicesCsv(5000));
            await File.WriteAllTextAsync(Path.Combine(rawDataPath, "Applications.csv"), GenerateRealisticApplicationsCsv(1000));
            await File.WriteAllTextAsync(Path.Combine(rawDataPath, "Mailboxes.csv"), GenerateRealisticMailboxesCsv(8000));
        }

        private string GenerateRealisticUsersCsv(int count)
        {
            var departments = new[] { "IT", "HR", "Finance", "Sales", "Marketing", "Engineering", "Support", "Operations" };
            var csv = "DisplayName,UserPrincipalName,Mail,Department,JobTitle,AccountEnabled,SID,SamAccountName,ManagerDisplayName,CreatedDateTime\n";
            
            for (int i = 0; i < count; i++)
            {
                var dept = departments[i % departments.Length];
                var firstName = $"First{i}";
                var lastName = $"Last{i}";
                var displayName = $"{firstName} {lastName}";
                var upn = $"{firstName.ToLower()}.{lastName.ToLower()}@contoso.com";
                var manager = i > 10 ? $"First{i / 10} Last{i / 10}" : "";
                var created = DateTime.Now.AddDays(-Random.Shared.Next(1, 1000)).ToString("yyyy-MM-dd");
                
                csv += $"{displayName},{upn},{upn},{dept},{dept} Specialist,TRUE,S-1-5-21-{i},{firstName.ToLower()}{i},{manager},{created}\n";
            }
            return csv;
        }

        private string GenerateRealisticGroupsCsv(int count)
        {
            var groupTypes = new[] { "Security", "Distribution", "Microsoft365" };
            var csv = "GroupName,Description,SID,GroupType,Members,ManagedBy,CreatedDateTime\n";
            
            for (int i = 0; i < count; i++)
            {
                var groupType = groupTypes[i % groupTypes.Length];
                var members = string.Join(";", Enumerable.Range(0, Random.Shared.Next(5, 20))
                    .Select(x => $"S-1-5-21-{Random.Shared.Next(1, 500)}"));
                var created = DateTime.Now.AddDays(-Random.Shared.Next(1, 500)).ToString("yyyy-MM-dd");
                
                csv += $"Group_{groupType}_{i},Description for {groupType} group {i},S-1-5-32-{i},{groupType},\"{members}\",admin@contoso.com,{created}\n";
            }
            return csv;
        }

        private string GenerateRealisticDevicesCsv(int count)
        {
            var osTypes = new[] { "Windows 10", "Windows 11", "macOS", "iOS", "Android" };
            var csv = "DeviceName,OperatingSystem,LastSeen,PrimaryUser,DeviceType,ComplianceState\n";
            
            for (int i = 0; i < count; i++)
            {
                var os = osTypes[i % osTypes.Length];
                var deviceType = os.Contains("Windows") ? "Desktop" : os.Contains("mac") ? "Laptop" : "Mobile";
                var compliance = Random.Shared.Next(100) > 10 ? "Compliant" : "NonCompliant";
                var lastSeen = DateTime.Now.AddHours(-Random.Shared.Next(1, 720)).ToString("yyyy-MM-dd HH:mm:ss");
                
                csv += $"DEVICE{i:D4},{os},{lastSeen},first{i % 500}.last{i % 500}@contoso.com,{deviceType},{compliance}\n";
            }
            return csv;
        }

        private string GenerateRealisticApplicationsCsv(int count)
        {
            var publishers = new[] { "Microsoft", "Adobe", "Google", "Autodesk", "Slack", "Zoom", "Internal" };
            var csv = "AppId,AppName,Publisher,Version,InstallCount,Category,RequiresLicense\n";
            
            for (int i = 0; i < count; i++)
            {
                var publisher = publishers[i % publishers.Length];
                var category = publisher == "Microsoft" ? "Productivity" : "Business";
                var requiresLicense = publisher != "Internal" ? "TRUE" : "FALSE";
                var installCount = Random.Shared.Next(10, 1000);
                
                csv += $"APP{i:D4},{publisher} App {i},{publisher},2024.{i % 12 + 1}.{i % 30},{installCount},{category},{requiresLicense}\n";
            }
            return csv;
        }

        private string GenerateRealisticMailboxesCsv(int count)
        {
            var csv = "UserPrincipalName,MailboxSize,ItemCount,LastLogon,MailboxType,ArchiveStatus\n";
            
            for (int i = 0; i < count; i++)
            {
                var size = Random.Shared.Next(100, 50000);
                var items = Random.Shared.Next(100, 100000);
                var mailboxType = i % 10 == 0 ? "Shared" : "UserMailbox";
                var archiveStatus = size > 30000 ? "Enabled" : "Disabled";
                var lastLogon = DateTime.Now.AddHours(-Random.Shared.Next(1, 168)).ToString("yyyy-MM-dd HH:mm:ss");
                
                csv += $"first{i}.last{i}@contoso.com,{size},{items},{lastLogon},{mailboxType},{archiveStatus}\n";
            }
            return csv;
        }

        private async Task SimulateDiscoveryModuleRun()
        {
            var rawDataPath = Path.Combine(_testDataPath, "RawData");
            
            // Simulate discovery updating Users.csv
            await Task.Delay(500);
            var currentUsers = await File.ReadAllLinesAsync(Path.Combine(rawDataPath, "Users.csv"));
            var newUserLine = "NewUser,newuser@contoso.com,newuser@contoso.com,IT,Engineer,TRUE,S-1-5-21-9999,newuser,,2024-01-01";
            var updatedUsers = currentUsers.Concat(new[] { newUserLine }).ToArray();
            await File.WriteAllLinesAsync(Path.Combine(rawDataPath, "Users.csv"), updatedUsers);
            
            // Trigger cache invalidation
            await _logicEngine.InvalidateCacheAsync("Users.csv");
        }

        private async Task<MigrationPlanningData> SimulateMigrationPlanning()
        {
            var users = await _logicEngine.GetUsersAsync();
            var groups = await _logicEngine.GetGroupsAsync();
            var devices = await _logicEngine.GetDevicesAsync();
            
            // Simulate complex migration planning calculations
            await Task.Delay(100);
            
            return new MigrationPlanningData
            {
                TotalUsers = users.Count(),
                TotalGroups = groups.Count(),
                TotalDevices = devices.Count(),
                EstimatedDuration = TimeSpan.FromHours(users.Count() * 0.1)
            };
        }

        private async Task<ViewSimulationResult> SimulateUserManagementView(string viewName)
        {
            var sw = Stopwatch.StartNew();
            try
            {
                var users = await _logicEngine.GetUsersAsync();
                await Task.Delay(Random.Shared.Next(50, 200)); // Simulate UI rendering
                
                return new ViewSimulationResult
                {
                    ViewName = viewName,
                    Success = true,
                    LoadTimeMs = sw.ElapsedMilliseconds,
                    ItemsLoaded = users.Count(),
                    UserCount = users.Count()
                };
            }
            catch (Exception ex)
            {
                return new ViewSimulationResult
                {
                    ViewName = viewName,
                    Success = false,
                    ErrorMessage = ex.Message,
                    LoadTimeMs = sw.ElapsedMilliseconds
                };
            }
        }

        private async Task<ViewSimulationResult> SimulateDeviceInventoryView(string viewName)
        {
            var sw = Stopwatch.StartNew();
            try
            {
                var devices = await _logicEngine.GetDevicesAsync();
                await Task.Delay(Random.Shared.Next(50, 200));
                
                return new ViewSimulationResult
                {
                    ViewName = viewName,
                    Success = true,
                    LoadTimeMs = sw.ElapsedMilliseconds,
                    ItemsLoaded = devices.Count()
                };
            }
            catch (Exception ex)
            {
                return new ViewSimulationResult
                {
                    ViewName = viewName,
                    Success = false,
                    ErrorMessage = ex.Message,
                    LoadTimeMs = sw.ElapsedMilliseconds
                };
            }
        }

        private async Task<ViewSimulationResult> SimulateGroupMembershipView(string viewName)
        {
            var sw = Stopwatch.StartNew();
            try
            {
                var groups = await _logicEngine.GetGroupsAsync();
                var users = await _logicEngine.GetUsersAsync();
                await Task.Delay(Random.Shared.Next(50, 200));
                
                return new ViewSimulationResult
                {
                    ViewName = viewName,
                    Success = true,
                    LoadTimeMs = sw.ElapsedMilliseconds,
                    ItemsLoaded = groups.Count(),
                    UserCount = users.Count()
                };
            }
            catch (Exception ex)
            {
                return new ViewSimulationResult
                {
                    ViewName = viewName,
                    Success = false,
                    ErrorMessage = ex.Message,
                    LoadTimeMs = sw.ElapsedMilliseconds
                };
            }
        }

        private async Task<ViewSimulationResult> SimulateApplicationDeploymentView(string viewName)
        {
            var sw = Stopwatch.StartNew();
            try
            {
                // Simulate loading applications and their deployment status
                await _logicEngine.LoadAllAsync();
                await Task.Delay(Random.Shared.Next(100, 300));
                
                return new ViewSimulationResult
                {
                    ViewName = viewName,
                    Success = true,
                    LoadTimeMs = sw.ElapsedMilliseconds,
                    ItemsLoaded = 150 // Simulated app count
                };
            }
            catch (Exception ex)
            {
                return new ViewSimulationResult
                {
                    ViewName = viewName,
                    Success = false,
                    ErrorMessage = ex.Message,
                    LoadTimeMs = sw.ElapsedMilliseconds
                };
            }
        }

        private async Task<ViewSimulationResult> SimulateMigrationDashboardView(string viewName)
        {
            var sw = Stopwatch.StartNew();
            try
            {
                var migrationData = await SimulateMigrationPlanning();
                await Task.Delay(Random.Shared.Next(100, 300));
                
                return new ViewSimulationResult
                {
                    ViewName = viewName,
                    Success = true,
                    LoadTimeMs = sw.ElapsedMilliseconds,
                    ItemsLoaded = migrationData.TotalUsers + migrationData.TotalGroups
                };
            }
            catch (Exception ex)
            {
                return new ViewSimulationResult
                {
                    ViewName = viewName,
                    Success = false,
                    ErrorMessage = ex.Message,
                    LoadTimeMs = sw.ElapsedMilliseconds
                };
            }
        }

        private async Task SimulateADDiscoveryModule(int offset)
        {
            var rawDataPath = Path.Combine(_testDataPath, "RawData");
            var filePath = Path.Combine(rawDataPath, "Users.csv");
            
            await Task.Delay(Random.Shared.Next(100, 500));
            
            // Add new discovered users
            var lines = await File.ReadAllLinesAsync(filePath);
            var newLines = new List<string>();
            for (int i = 0; i < 10; i++)
            {
                newLines.Add($"ADUser{offset + i},aduser{offset + i}@contoso.com,aduser{offset + i}@contoso.com,IT,Specialist,TRUE,S-1-5-21-{offset + i},aduser{offset + i},,2024-01-01");
            }
            
            await File.WriteAllLinesAsync(filePath, lines.Concat(newLines));
            await _logicEngine.InvalidateCacheAsync("Users.csv");
        }

        private async Task SimulateAzureDiscoveryModule(int offset)
        {
            var rawDataPath = Path.Combine(_testDataPath, "RawData");
            var filePath = Path.Combine(rawDataPath, "AzureUsers.csv");
            
            await Task.Delay(Random.Shared.Next(100, 500));
            
            // Create Azure users file
            var csv = "DisplayName,UserPrincipalName,Mail,Department,AccountEnabled,ObjectId\n";
            for (int i = 0; i < 20; i++)
            {
                csv += $"AzureUser{offset + i},azureuser{offset + i}@contoso.com,azureuser{offset + i}@contoso.com,Cloud,TRUE,{Guid.NewGuid()}\n";
            }
            
            await File.WriteAllTextAsync(filePath, csv);
            await _logicEngine.InvalidateCacheAsync("AzureUsers.csv");
        }

        private async Task SimulateExchangeDiscoveryModule(int offset)
        {
            var rawDataPath = Path.Combine(_testDataPath, "RawData");
            var filePath = Path.Combine(rawDataPath, "Mailboxes.csv");
            
            await Task.Delay(Random.Shared.Next(100, 500));
            
            // Update mailbox data
            var lines = await File.ReadAllLinesAsync(filePath);
            var updatedLines = lines.Take(1).Concat(
                lines.Skip(1).Select(line =>
                {
                    var parts = line.Split(',');
                    if (parts.Length >= 2)
                    {
                        // Update mailbox size
                        parts[1] = (int.Parse(parts[1]) + Random.Shared.Next(10, 100)).ToString();
                    }
                    return string.Join(",", parts);
                })
            );
            
            await File.WriteAllLinesAsync(filePath, updatedLines);
            await _logicEngine.InvalidateCacheAsync("Mailboxes.csv");
        }

        private async Task SimulateTeamsDiscoveryModule(int offset)
        {
            var rawDataPath = Path.Combine(_testDataPath, "RawData");
            var filePath = Path.Combine(rawDataPath, "TeamsData.csv");
            
            await Task.Delay(Random.Shared.Next(100, 500));
            
            // Create Teams data
            var csv = "TeamId,TeamName,Members,Channels,CreatedDate\n";
            for (int i = 0; i < 15; i++)
            {
                csv += $"TEAM{offset + i},Team {offset + i},10,5,2024-01-01\n";
            }
            
            await File.WriteAllTextAsync(filePath, csv);
            await _logicEngine.InvalidateCacheAsync("TeamsData.csv");
        }

        private async Task ContinuousDataReader(int readerId, StressTestMetrics metrics, CancellationToken cancellationToken)
        {
            while (!cancellationToken.IsCancellationRequested)
            {
                var sw = Stopwatch.StartNew();
                try
                {
                    var operation = Random.Shared.Next(4);
                    switch (operation)
                    {
                        case 0:
                            await _logicEngine.GetUsersAsync();
                            break;
                        case 1:
                            await _logicEngine.GetGroupsAsync();
                            break;
                        case 2:
                            await _logicEngine.GetDevicesAsync();
                            break;
                        case 3:
                            await _logicEngine.GetUserProjectionAsync($"S-1-5-21-{Random.Shared.Next(1000)}");
                            break;
                    }
                    
                    sw.Stop();
                    metrics.RecordOperation(sw.ElapsedMilliseconds);
                }
                catch
                {
                    metrics.RecordError();
                }
                
                await Task.Delay(Random.Shared.Next(10, 100), cancellationToken);
            }
        }

        private async Task PeriodicDataWriter(int writerId, StressTestMetrics metrics, CancellationToken cancellationToken)
        {
            while (!cancellationToken.IsCancellationRequested)
            {
                try
                {
                    await SimulateDiscoveryModuleRun();
                    metrics.RecordWrite();
                }
                catch
                {
                    metrics.RecordError();
                }
                
                await Task.Delay(Random.Shared.Next(2000, 5000), cancellationToken);
            }
        }

        private async Task RandomCacheInvalidator(StressTestMetrics metrics, CancellationToken cancellationToken)
        {
            var files = new[] { "Users.csv", "Groups.csv", "Devices.csv", "Mailboxes.csv" };
            
            while (!cancellationToken.IsCancellationRequested)
            {
                try
                {
                    var file = files[Random.Shared.Next(files.Length)];
                    await _logicEngine.InvalidateCacheAsync(file);
                    metrics.RecordInvalidation();
                }
                catch
                {
                    metrics.RecordError();
                }
                
                await Task.Delay(Random.Shared.Next(3000, 7000), cancellationToken);
            }
        }

        private void RecordMetric(Dictionary<string, List<double>> metrics, string operation, double value)
        {
            if (!metrics.ContainsKey(operation))
            {
                metrics[operation] = new List<double>();
            }
            metrics[operation].Add(value);
        }

        private void WriteSessionReport(List<string> sessionLog, Dictionary<string, List<double>> metrics)
        {
            var reportPath = Path.Combine(_logsPath, $"session_report_{DateTime.Now:yyyyMMdd_HHmmss}.txt");
            var report = new List<string>();
            
            report.Add("=== User Session Simulation Report ===");
            report.Add($"Generated: {DateTime.Now}");
            report.Add("");
            report.Add("Session Log:");
            report.AddRange(sessionLog);
            report.Add("");
            report.Add("Performance Metrics:");
            foreach (var metric in metrics)
            {
                report.Add($"  {metric.Key}:");
                report.Add($"    Average: {metric.Value.Average():F2}ms");
                report.Add($"    Min: {metric.Value.Min():F2}ms");
                report.Add($"    Max: {metric.Value.Max():F2}ms");
            }
            report.Add("");
            report.Add($"Cache Statistics:");
            var stats = _cacheService.GetStatistics();
            report.Add($"  Hit Rate: {stats.HitRate:P}");
            report.Add($"  Total Hits: {stats.TotalHits}");
            report.Add($"  Total Misses: {stats.TotalMisses}");
            
            File.WriteAllLines(reportPath, report);
            Console.WriteLine($"Session report written to: {reportPath}");
        }

        private void WriteDiscoveryReport(List<string> discoveryLog)
        {
            var reportPath = Path.Combine(_logsPath, $"discovery_report_{DateTime.Now:yyyyMMdd_HHmmss}.txt");
            File.WriteAllLines(reportPath, discoveryLog);
            Console.WriteLine($"Discovery report written to: {reportPath}");
        }

        private void GenerateStressTestReport(StressTestMetrics metrics)
        {
            var reportPath = Path.Combine(_logsPath, $"stress_test_report_{DateTime.Now:yyyyMMdd_HHmmss}.txt");
            var report = new List<string>
            {
                "=== Stress Test Report ===",
                $"Generated: {DateTime.Now}",
                "",
                $"Total Operations: {metrics.TotalOperations}",
                $"Total Errors: {metrics.Errors}",
                $"Average Response Time: {metrics.AverageResponseTime:F2}ms",
                $"Cache Hit Rate: {metrics.CacheHitRate:P}",
                $"Total Writes: {metrics.TotalWrites}",
                $"Total Invalidations: {metrics.TotalInvalidations}",
                "",
                "Cache Statistics:",
                $"  Final Hit Rate: {_cacheService.GetStatistics().HitRate:P}",
                $"  Items Evicted: {_cacheService.GetStatistics().ItemsEvicted}"
            };
            
            File.WriteAllLines(reportPath, report);
            Console.WriteLine($"Stress test report written to: {reportPath}");
        }

        #endregion

        #region Helper Classes

        private class ViewSimulationResult
        {
            public string ViewName { get; set; }
            public bool Success { get; set; }
            public string ErrorMessage { get; set; }
            public long LoadTimeMs { get; set; }
            public int ItemsLoaded { get; set; }
            public int UserCount { get; set; }
        }

        private class MigrationPlanningData
        {
            public int TotalUsers { get; set; }
            public int TotalGroups { get; set; }
            public int TotalDevices { get; set; }
            public TimeSpan EstimatedDuration { get; set; }
        }

        private class StressTestMetrics
        {
            private readonly object _lock = new();
            private readonly List<double> _responseTimes = new();
            
            public int TotalOperations { get; private set; }
            public int Errors { get; private set; }
            public int TotalWrites { get; private set; }
            public int TotalInvalidations { get; private set; }
            
            public double AverageResponseTime
            {
                get
                {
                    lock (_lock)
                    {
                        return _responseTimes.Any() ? _responseTimes.Average() : 0;
                    }
                }
            }
            
            public double CacheHitRate { get; set; }
            
            public void RecordOperation(double responseTime)
            {
                lock (_lock)
                {
                    TotalOperations++;
                    _responseTimes.Add(responseTime);
                    if (_responseTimes.Count > 1000)
                    {
                        _responseTimes.RemoveAt(0);
                    }
                }
            }
            
            public void RecordError()
            {
                lock (_lock)
                {
                    Errors++;
                }
            }
            
            public void RecordWrite()
            {
                lock (_lock)
                {
                    TotalWrites++;
                }
            }
            
            public void RecordInvalidation()
            {
                lock (_lock)
                {
                    TotalInvalidations++;
                }
            }
        }

        #endregion
    }
}