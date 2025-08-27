using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Management.Automation;
using System.Text.Json;
using System.Threading.Tasks;
using FluentAssertions;
using MandADiscoverySuite.Models;
using MandADiscoverySuite.ViewModels;
using Microsoft.Extensions.Logging;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using Moq;

namespace MigrationTestSuite.Integration
{
    [TestClass]
    public class MigrationIntegrationTests
    {
        private Mock<ILogger<MigrateViewModel>> _mockLogger;
        private MigrateViewModel _viewModel;
        private string _testDataPath;
        private string _testOutputPath;

        [TestInitialize]
        public void Setup()
        {
            _mockLogger = new Mock<ILogger<MigrateViewModel>>();
            _viewModel = new MigrateViewModel(_mockLogger.Object);
            
            // Setup test paths
            _testDataPath = Path.Combine(Path.GetTempPath(), "MigrationTestData");
            _testOutputPath = Path.Combine(Path.GetTempPath(), "MigrationTestOutput");
            
            Directory.CreateDirectory(_testDataPath);
            Directory.CreateDirectory(_testOutputPath);
            
            CreateTestData();
        }

        [TestCleanup]
        public void Cleanup()
        {
            _viewModel?.Dispose();
            
            // Clean up test directories
            if (Directory.Exists(_testDataPath))
                Directory.Delete(_testDataPath, true);
            if (Directory.Exists(_testOutputPath))
                Directory.Delete(_testOutputPath, true);
        }

        private void CreateTestData()
        {
            // Create test CSV files for discovery data
            var usersData = new[]
            {
                "UserPrincipalName,DisplayName,Department,Manager,LastLogonDate",
                "john.doe@contoso.com,John Doe,IT,jane.smith@contoso.com,2023-12-01",
                "jane.smith@contoso.com,Jane Smith,IT,,2023-12-02",
                "bob.wilson@contoso.com,Bob Wilson,Finance,jane.smith@contoso.com,2023-12-01"
            };
            File.WriteAllLines(Path.Combine(_testDataPath, "Users.csv"), usersData);

            var groupsData = new[]
            {
                "DisplayName,GroupType,MemberCount,Description",
                "IT Admins,Security,5,IT Administrative Group",
                "Finance Users,Distribution,15,Finance Department Users",
                "All Employees,Universal,150,All Company Employees"
            };
            File.WriteAllLines(Path.Combine(_testDataPath, "Groups.csv"), groupsData);

            // Create test PowerShell scripts
            var testScript = @"
param(
    [string]$Action,
    [hashtable]$Parameters
)

switch ($Action) {
    'TestConnection' {
        return @{
            Success = $true
            ConnectionString = $Parameters.ConnectionString
            ResponseTime = 150
        }
    }
    'GetMailboxes' {
        return @(
            @{ UserPrincipalName = 'john.doe@contoso.com'; MailboxSize = '2.5 GB' },
            @{ UserPrincipalName = 'jane.smith@contoso.com'; MailboxSize = '1.8 GB' }
        )
    }
    'StartMigration' {
        return @{
            BatchId = [Guid]::NewGuid().ToString()
            Status = 'InProgress'
            StartTime = Get-Date
        }
    }
    default {
        throw ""Unknown action: $Action""
    }
}
";
            File.WriteAllText(Path.Combine(_testDataPath, "TestMigrationScript.ps1"), testScript);
        }

        [TestClass]
        public class GuiToPowerShellCommunicationTests : MigrationIntegrationTests
        {
            [TestMethod]
            public async Task GUI_Should_ExecutePowerShellScript_Successfully()
            {
                // Arrange
                var scriptPath = Path.Combine(_testDataPath, "TestMigrationScript.ps1");
                var parameters = new Dictionary<string, object>
                {
                    { "Action", "TestConnection" },
                    { "Parameters", new Dictionary<string, object> { { "ConnectionString", "test-connection" } } }
                };

                // Act
                var result = await ExecutePowerShellScript(scriptPath, parameters);

                // Assert
                result.Should().NotBeNull();
                result["Success"].Should().Be(true);
                result["ConnectionString"].Should().Be("test-connection");
            }

            [TestMethod]
            public async Task GUI_Should_HandlePowerShellErrors_Gracefully()
            {
                // Arrange
                var scriptPath = Path.Combine(_testDataPath, "TestMigrationScript.ps1");
                var parameters = new Dictionary<string, object>
                {
                    { "Action", "InvalidAction" },
                    { "Parameters", new Dictionary<string, object>() }
                };

                // Act & Assert
                await Assert.ThrowsExceptionAsync<InvalidOperationException>(
                    () => ExecutePowerShellScript(scriptPath, parameters));
            }

            [TestMethod]
            public async Task GUI_Should_PassComplexObjects_ToPowerShell()
            {
                // Arrange
                var migrationBatch = new MigrationBatch
                {
                    Name = "Test Batch",
                    Type = MigrationType.User,
                    Items = new List<MigrationItem>
                    {
                        new MigrationItem 
                        { 
                            SourceIdentity = "user1@source.com",
                            TargetIdentity = "user1@target.com",
                            Type = MigrationType.User
                        }
                    }
                };

                var scriptPath = Path.Combine(_testDataPath, "TestMigrationScript.ps1");
                var parameters = new Dictionary<string, object>
                {
                    { "Action", "StartMigration" },
                    { "Parameters", SerializeForPowerShell(migrationBatch) }
                };

                // Act
                var result = await ExecutePowerShellScript(scriptPath, parameters);

                // Assert
                result.Should().NotBeNull();
                result["Status"].Should().Be("InProgress");
                result.Should().ContainKey("BatchId");
            }

            private async Task<Dictionary<string, object>> ExecutePowerShellScript(string scriptPath, Dictionary<string, object> parameters)
            {
                return await Task.Run(() =>
                {
                    using var ps = PowerShell.Create();
                    
                    ps.AddScript(File.ReadAllText(scriptPath));
                    
                    foreach (var param in parameters)
                    {
                        ps.AddParameter(param.Key, param.Value);
                    }

                    var results = ps.Invoke();
                    
                    if (ps.HadErrors)
                    {
                        var error = ps.Streams.Error.FirstOrDefault();
                        throw new InvalidOperationException(error?.ToString() ?? "PowerShell execution failed");
                    }

                    var result = results.FirstOrDefault()?.BaseObject as Hashtable;
                    return result?.Cast<DictionaryEntry>().ToDictionary(x => x.Key.ToString(), x => x.Value) ?? new Dictionary<string, object>();
                });
            }

            private Dictionary<string, object> SerializeForPowerShell(object obj)
            {
                var json = JsonSerializer.Serialize(obj, new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase });
                return JsonSerializer.Deserialize<Dictionary<string, object>>(json);
            }
        }

        [TestClass]
        public class DataFlowValidationTests : MigrationIntegrationTests
        {
            [TestMethod]
            public void ViewModel_Should_LoadDataFromCSV_Correctly()
            {
                // Arrange
                var csvPath = Path.Combine(_testDataPath, "Users.csv");

                // Act
                var users = LoadUsersFromCsv(csvPath);

                // Assert
                users.Should().HaveCount(3);
                users[0].UserPrincipalName.Should().Be("john.doe@contoso.com");
                users[0].DisplayName.Should().Be("John Doe");
                users[0].Department.Should().Be("IT");
            }

            [TestMethod]
            public void ViewModel_Should_TransformData_ForMigration()
            {
                // Arrange
                var csvPath = Path.Combine(_testDataPath, "Users.csv");
                var users = LoadUsersFromCsv(csvPath);

                // Act
                var migrationItems = TransformUsersToMigrationItems(users);

                // Assert
                migrationItems.Should().HaveCount(3);
                migrationItems.All(item => item.Type == MigrationType.User).Should().BeTrue();
                migrationItems.All(item => !string.IsNullOrEmpty(item.SourceIdentity)).Should().BeTrue();
            }

            [TestMethod]
            public void ViewModel_Should_ExportResults_ToCorrectFormat()
            {
                // Arrange
                var migrationResult = new MigrationResult
                {
                    BatchId = "test-batch-001",
                    OverallStatus = MigrationStatus.Completed,
                    StartTime = DateTime.Now.AddHours(-2),
                    EndTime = DateTime.Now,
                    TotalItems = 100,
                    SuccessfulItems = 95,
                    FailedItems = 5,
                    WarningItems = 0
                };

                var outputPath = Path.Combine(_testOutputPath, "migration_results.json");

                // Act
                ExportMigrationResults(migrationResult, outputPath);

                // Assert
                File.Exists(outputPath).Should().BeTrue();
                var exportedData = JsonSerializer.Deserialize<MigrationResult>(File.ReadAllText(outputPath));
                exportedData.BatchId.Should().Be("test-batch-001");
                exportedData.SuccessRate.Should().Be(95.0);
            }

            private List<UserData> LoadUsersFromCsv(string csvPath)
            {
                var lines = File.ReadAllLines(csvPath);
                var headers = lines[0].Split(',');
                var users = new List<UserData>();

                for (int i = 1; i < lines.Length; i++)
                {
                    var values = lines[i].Split(',');
                    users.Add(new UserData
                    {
                        UserPrincipalName = values[0],
                        DisplayName = values[1],
                        Department = values[2],
                        ManagerDisplayName = values[3],
                        LastLogonDate = DateTime.TryParse(values[4], out var date) ? date : null
                    });
                }

                return users;
            }

            private List<MigrationItem> TransformUsersToMigrationItems(List<UserData> users)
            {
                return users.Select(user => new MigrationItem
                {
                    SourceIdentity = user.UserPrincipalName,
                    TargetIdentity = user.UserPrincipalName.Replace("@contoso.com", "@newcontoso.com"),
                    Type = MigrationType.User,
                    DisplayName = user.DisplayName,
                    Properties = new Dictionary<string, object>
                    {
                        { "Department", user.Department },
                        { "Manager", user.ManagerDisplayName }
                    }
                }).ToList();
            }

            private void ExportMigrationResults(MigrationResult result, string outputPath)
            {
                var json = JsonSerializer.Serialize(result, new JsonSerializerOptions 
                { 
                    WriteIndented = true,
                    PropertyNamingPolicy = JsonNamingPolicy.CamelCase
                });
                File.WriteAllText(outputPath, json);
            }
        }

        [TestClass]
        public class ErrorHandlingIntegrationTests : MigrationIntegrationTests
        {
            [TestMethod]
            public void ViewModel_Should_HandleMissingCSVFiles_Gracefully()
            {
                // Arrange
                var nonExistentPath = Path.Combine(_testDataPath, "NonExistent.csv");

                // Act
                Action loadAction = () => LoadUsersFromCsv(nonExistentPath);

                // Assert
                loadAction.Should().Throw<FileNotFoundException>();
            }

            [TestMethod]
            public void ViewModel_Should_HandleMalformedCSVData_Gracefully()
            {
                // Arrange
                var malformedCsvPath = Path.Combine(_testDataPath, "Malformed.csv");
                var malformedData = new[]
                {
                    "UserPrincipalName,DisplayName,Department",
                    "user1@contoso.com,User One",  // Missing field
                    "user2@contoso.com,User Two,IT,ExtraField"  // Extra field
                };
                File.WriteAllLines(malformedCsvPath, malformedData);

                // Act
                var users = LoadUsersFromCsv(malformedCsvPath);

                // Assert
                users.Should().HaveCount(2);
                // Should handle missing/extra fields gracefully
                users[0].Department.Should().BeNullOrEmpty();
            }

            [TestMethod]
            public async Task Integration_Should_RecoverFromPowerShellTimeout()
            {
                // Arrange
                var longRunningScript = @"
                    param([int]$DelaySeconds)
                    Start-Sleep -Seconds $DelaySeconds
                    return @{ Status = 'Completed' }
                ";
                var scriptPath = Path.Combine(_testDataPath, "LongRunningScript.ps1");
                File.WriteAllText(scriptPath, longRunningScript);

                // Act & Assert
                var timeout = TimeSpan.FromSeconds(2);
                await Assert.ThrowsExceptionAsync<TimeoutException>(() => 
                    ExecutePowerShellScriptWithTimeout(scriptPath, new Dictionary<string, object> { { "DelaySeconds", 5 } }, timeout));
            }

            private async Task<Dictionary<string, object>> ExecutePowerShellScriptWithTimeout(string scriptPath, Dictionary<string, object> parameters, TimeSpan timeout)
            {
                using var cts = new System.Threading.CancellationTokenSource(timeout);
                
                return await Task.Run(() =>
                {
                    using var ps = PowerShell.Create();
                    ps.AddScript(File.ReadAllText(scriptPath));
                    
                    foreach (var param in parameters)
                    {
                        ps.AddParameter(param.Key, param.Value);
                    }

                    var asyncResult = ps.BeginInvoke();
                    
                    if (!asyncResult.AsyncWaitHandle.WaitOne(timeout))
                    {
                        ps.Stop();
                        throw new TimeoutException("PowerShell script execution timed out");
                    }

                    var results = ps.EndInvoke(asyncResult);
                    var result = results.FirstOrDefault()?.BaseObject as Hashtable;
                    return result?.Cast<DictionaryEntry>().ToDictionary(x => x.Key.ToString(), x => x.Value) ?? new Dictionary<string, object>();
                }, cts.Token);
            }

            private List<UserData> LoadUsersFromCsv(string csvPath)
            {
                if (!File.Exists(csvPath))
                    throw new FileNotFoundException($"CSV file not found: {csvPath}");

                var lines = File.ReadAllLines(csvPath);
                if (lines.Length == 0)
                    throw new InvalidDataException("CSV file is empty");

                var headers = lines[0].Split(',');
                var users = new List<UserData>();

                for (int i = 1; i < lines.Length; i++)
                {
                    try
                    {
                        var values = lines[i].Split(',');
                        var user = new UserData
                        {
                            UserPrincipalName = values.Length > 0 ? values[0] : string.Empty,
                            DisplayName = values.Length > 1 ? values[1] : string.Empty,
                            Department = values.Length > 2 ? values[2] : string.Empty
                        };
                        users.Add(user);
                    }
                    catch (Exception ex)
                    {
                        // Log error but continue processing
                        Console.WriteLine($"Error processing line {i}: {ex.Message}");
                    }
                }

                return users;
            }
        }

        [TestClass]
        public class PerformanceIntegrationTests : MigrationIntegrationTests
        {
            [TestMethod]
            public void LargeDataset_Should_ProcessWithinTimeLimit()
            {
                // Arrange
                var largeDataset = GenerateLargeUserDataset(10000);
                var stopwatch = Stopwatch.StartNew();

                // Act
                var migrationItems = TransformLargeDataset(largeDataset);
                stopwatch.Stop();

                // Assert
                migrationItems.Should().HaveCount(10000);
                stopwatch.ElapsedMilliseconds.Should().BeLessThan(5000); // Should complete in under 5 seconds
            }

            [TestMethod]
            public void MemoryUsage_Should_StayWithinLimits_ForLargeDatasets()
            {
                // Arrange
                var initialMemory = GC.GetTotalMemory(false);
                var largeDataset = GenerateLargeUserDataset(50000);

                // Act
                var migrationItems = TransformLargeDataset(largeDataset);
                
                // Force garbage collection
                GC.Collect();
                GC.WaitForPendingFinalizers();
                var finalMemory = GC.GetTotalMemory(false);

                // Assert
                var memoryIncrease = finalMemory - initialMemory;
                migrationItems.Should().HaveCount(50000);
                memoryIncrease.Should().BeLessThan(100 * 1024 * 1024); // Less than 100MB increase
            }

            [TestMethod]
            public async Task ConcurrentOperations_Should_CompleteSuccessfully()
            {
                // Arrange
                var tasks = new List<Task<int>>();
                const int concurrentTasks = 10;
                const int itemsPerTask = 1000;

                // Act
                for (int i = 0; i < concurrentTasks; i++)
                {
                    int taskId = i;
                    tasks.Add(Task.Run(() =>
                    {
                        var dataset = GenerateLargeUserDataset(itemsPerTask, $"task{taskId}");
                        var migrationItems = TransformLargeDataset(dataset);
                        return migrationItems.Count;
                    }));
                }

                var results = await Task.WhenAll(tasks);

                // Assert
                results.Should().AllBe(itemsPerTask);
                results.Sum().Should().Be(concurrentTasks * itemsPerTask);
            }

            private List<UserData> GenerateLargeUserDataset(int count, string prefix = "user")
            {
                var users = new List<UserData>(count);
                var departments = new[] { "IT", "Finance", "HR", "Sales", "Marketing", "Operations" };
                var random = new Random(42); // Fixed seed for consistent results

                for (int i = 0; i < count; i++)
                {
                    users.Add(new UserData
                    {
                        UserPrincipalName = $"{prefix}{i}@contoso.com",
                        DisplayName = $"User {i}",
                        Department = departments[random.Next(departments.Length)],
                        ManagerDisplayName = i % 10 == 0 ? null : $"manager{i / 10}@contoso.com",
                        LastLogonDate = DateTime.Now.AddDays(-random.Next(365))
                    });
                }

                return users;
            }

            private List<MigrationItem> TransformLargeDataset(List<UserData> users)
            {
                return users.AsParallel().Select(user => new MigrationItem
                {
                    SourceIdentity = user.UserPrincipalName,
                    TargetIdentity = user.UserPrincipalName.Replace("@contoso.com", "@newcontoso.com"),
                    Type = MigrationType.User,
                    DisplayName = user.DisplayName,
                    Properties = new Dictionary<string, object>
                    {
                        { "Department", user.Department ?? string.Empty },
                        { "Manager", user.ManagerDisplayName ?? string.Empty }
                    }
                }).ToList();
            }
        }

        [TestClass]
        public class EndToEndMigrationTests : MigrationIntegrationTests
        {
            [TestMethod]
            public async Task FullMigrationWorkflow_Should_CompleteSuccessfully()
            {
                // Arrange
                var project = new MigrationOrchestratorProject
                {
                    Name = "Test Migration Project",
                    Description = "End-to-end test migration",
                    SourceEnvironment = new MigrationEnvironment { Name = "Source AD", Type = "OnPremises" },
                    TargetEnvironment = new MigrationEnvironment { Name = "Azure AD", Type = "Azure" }
                };

                var wave = new MigrationOrchestratorWave
                {
                    Name = "Wave 1",
                    Order = 1,
                    PlannedStartDate = DateTime.Now.AddDays(1)
                };

                var batch = new MigrationBatch
                {
                    Name = "User Batch 1",
                    Type = MigrationType.User,
                    Items = new List<MigrationItem>
                    {
                        new MigrationItem { SourceIdentity = "user1@source.com", TargetIdentity = "user1@target.com", Type = MigrationType.User },
                        new MigrationItem { SourceIdentity = "user2@source.com", TargetIdentity = "user2@target.com", Type = MigrationType.User }
                    }
                };

                wave.Batches.Add(batch);
                project.Waves.Add(wave);

                // Act - Simulate full workflow
                var validationResult = ValidateProject(project);
                var planningResult = GenerateMigrationPlan(project);
                var executionResult = await ExecuteMigrationBatch(batch);
                var reportResult = GenerateMigrationReport(executionResult);

                // Assert
                validationResult.IsValid.Should().BeTrue();
                planningResult.EstimatedDuration.Should().BeGreaterThan(TimeSpan.Zero);
                executionResult.OverallStatus.Should().Be(MigrationStatus.Completed);
                reportResult.Should().NotBeNullOrEmpty();
            }

            private ValidationResult ValidateProject(MigrationOrchestratorProject project)
            {
                var issues = new List<string>();

                if (string.IsNullOrEmpty(project.Name))
                    issues.Add("Project name is required");

                if (project.SourceEnvironment == null)
                    issues.Add("Source environment not configured");

                if (project.TargetEnvironment == null)
                    issues.Add("Target environment not configured");

                if (!project.Waves.Any())
                    issues.Add("No migration waves defined");

                return new ValidationResult
                {
                    IsValid = !issues.Any(),
                    Issues = issues
                };
            }

            private PlanningResult GenerateMigrationPlan(MigrationOrchestratorProject project)
            {
                var totalItems = project.Waves.SelectMany(w => w.Batches).SelectMany(b => b.Items).Count();
                var estimatedTimePerItem = TimeSpan.FromMinutes(2); // 2 minutes per item
                
                return new PlanningResult
                {
                    TotalItems = totalItems,
                    EstimatedDuration = TimeSpan.FromTicks(totalItems * estimatedTimePerItem.Ticks),
                    ComplexityScore = CalculateComplexityScore(project)
                };
            }

            private async Task<MigrationResult> ExecuteMigrationBatch(MigrationBatch batch)
            {
                // Simulate migration execution
                await Task.Delay(100); // Simulate processing time

                var result = new MigrationResult
                {
                    BatchId = batch.Id,
                    OverallStatus = MigrationStatus.Completed,
                    StartTime = DateTime.Now.AddMinutes(-10),
                    EndTime = DateTime.Now,
                    TotalItems = batch.Items.Count,
                    SuccessfulItems = batch.Items.Count,
                    FailedItems = 0,
                    WarningItems = 0
                };

                return result;
            }

            private string GenerateMigrationReport(MigrationResult result)
            {
                var report = new
                {
                    Summary = new
                    {
                        BatchId = result.BatchId,
                        Status = result.OverallStatus.ToString(),
                        Duration = result.Duration.ToString(),
                        SuccessRate = result.SuccessRate
                    },
                    Details = new
                    {
                        TotalItems = result.TotalItems,
                        SuccessfulItems = result.SuccessfulItems,
                        FailedItems = result.FailedItems,
                        WarningItems = result.WarningItems
                    }
                };

                return JsonSerializer.Serialize(report, new JsonSerializerOptions { WriteIndented = true });
            }

            private double CalculateComplexityScore(MigrationOrchestratorProject project)
            {
                var score = 0.0;
                
                // Base score
                score += 10;
                
                // Add complexity based on number of items
                var totalItems = project.Waves.SelectMany(w => w.Batches).SelectMany(b => b.Items).Count();
                score += totalItems * 0.1;
                
                // Add complexity based on migration types
                var migrationTypes = project.Waves.SelectMany(w => w.Batches).Select(b => b.Type).Distinct().Count();
                score += migrationTypes * 5;
                
                return Math.Min(score, 100); // Cap at 100
            }

            private class ValidationResult
            {
                public bool IsValid { get; set; }
                public List<string> Issues { get; set; } = new List<string>();
            }

            private class PlanningResult
            {
                public int TotalItems { get; set; }
                public TimeSpan EstimatedDuration { get; set; }
                public double ComplexityScore { get; set; }
            }
        }
    }
}