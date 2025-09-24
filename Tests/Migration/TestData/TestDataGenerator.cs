using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Text.Json;
using MandADiscoverySuite.Models;

namespace MigrationTestSuite.TestData
{
    /// <summary>
    /// Generates realistic test data for migration platform testing
    /// </summary>
    public class TestDataGenerator
    {
        private readonly Random _random;
        private readonly string[] _departments = { "IT", "Finance", "HR", "Sales", "Marketing", "Operations", "Legal", "R&D" };
        private readonly string[] _locations = { "New York", "London", "Tokyo", "Sydney", "Toronto", "Berlin", "Paris", "Singapore" };
        private readonly string[] _jobTitles = { "Manager", "Director", "Analyst", "Specialist", "Coordinator", "Assistant", "Senior", "Junior" };
        private readonly string[] _domains = { "contoso.com", "fabrikam.com", "northwind.com", "adventure-works.com" };

        public TestDataGenerator(int? seed = null)
        {
            _random = seed.HasValue ? new Random(seed.Value) : new Random();
        }

        #region User Data Generation

        public List<TestUserDto> GenerateUsers(int count, string domain = "contoso.com")
        {
            var users = new List<TestUserDto>();
            var usedEmails = new HashSet<string>();

            for (int i = 0; i < count; i++)
            {
                var user = GenerateUser(domain, i, usedEmails);
                users.Add(user);
            }

            // Assign some users as managers to others
            AssignManagers(users);

            return users;
        }

        private TestUserDto GenerateUser(string domain, int index, HashSet<string> usedEmails)
        {
            var firstName = GenerateFirstName();
            var lastName = GenerateLastName();
            var email = GenerateUniqueEmail(firstName, lastName, domain, usedEmails);

            return new TestUserDto
            {
                UserPrincipalName = email,
                DisplayName = $"{firstName} {lastName}",
                FirstName = firstName,
                LastName = lastName,
                Department = _departments[_random.Next(_departments.Length)],
                JobTitle = GenerateJobTitle(),
                OfficeLocation = _locations[_random.Next(_locations.Length)],
                PhoneNumber = GeneratePhoneNumber(),
                MobilePhone = GeneratePhoneNumber(),
                EmployeeId = $"EMP{(index + 1):D6}",
                IsEnabled = _random.NextDouble() > 0.05, // 95% enabled
                LastLogonDate = DateTime.Now.AddDays(-_random.Next(0, 90)),
                CreatedDate = DateTime.Now.AddDays(-_random.Next(1, 1825)) // Created within last 5 years
            };
        }

        private void AssignManagers(List<TestUserDto> users)
        {
            var managers = users.Where(u => u.JobTitle.Contains("Manager") || u.JobTitle.Contains("Director")).ToList();

            foreach (var user in users)
            {
                if (!user.JobTitle.Contains("Manager") && !user.JobTitle.Contains("Director") && _random.NextDouble() > 0.3)
                {
                    var manager = managers.Where(m => m.Department == user.Department).FirstOrDefault()
                                  ?? managers.FirstOrDefault();

                    if (manager != null)
                    {
                        user.ManagerDisplayName = manager.DisplayName;
                        user.Manager = manager.UserPrincipalName;
                    }
                }
            }
        }

        #endregion

        #region Group Data Generation

        public List<TestGroupDto> GenerateGroups(int count, List<TestUserDto> users = null)
        {
            var groups = new List<TestGroupDto>();

            // Generate department groups
            foreach (var dept in _departments)
            {
                groups.Add(new TestGroupDto
                {
                    DisplayName = $"{dept} Department",
                    Description = $"All users in the {dept} department",
                    GroupType = "Security",
                    MemberCount = users?.Count(u => u.Department == dept) ?? _random.Next(5, 50),
                    OwnerCount = 1,
                    CreatedDate = DateTime.Now.AddDays(-_random.Next(30, 365)),
                    MailEnabled = false,
                    SecurityEnabled = true
                });
            }

            // Generate additional functional groups
            var functionalGroups = new[]
            {
                "All Employees", "Managers", "Remote Workers", "Contractors",
                "IT Admins", "Power Users", "VPN Users", "External Partners"
            };

            foreach (var groupName in functionalGroups.Take(count - groups.Count))
            {
                groups.Add(new TestGroupDto
                {
                    DisplayName = groupName,
                    Description = $"Functional group for {groupName}",
                    GroupType = _random.NextDouble() > 0.5 ? "Security" : "Distribution",
                    MemberCount = _random.Next(10, 200),
                    OwnerCount = _random.Next(1, 3),
                    CreatedDate = DateTime.Now.AddDays(-_random.Next(30, 730)),
                    MailEnabled = _random.NextDouble() > 0.5,
                    SecurityEnabled = true
                });
            }

            return groups.Take(count).ToList();
        }

        #endregion

        #region Migration Data Generation

        public TestMigrationProject GenerateMigrationProject(string name = "Test Migration Project")
        {
            var project = new TestMigrationProject
            {
                Name = name,
                Description = $"Generated test migration project for {name}",
                CreatedDate = DateTime.Now.AddDays(-_random.Next(1, 30)),
                Status = (TestMigrationStatus)_random.Next(0, 5),
                SourceEnvironment = GenerateSourceEnvironment(),
                TargetEnvironment = GenerateTargetEnvironment(),
                Settings = GenerateMigrationSettings()
            };

            // Generate waves
            var waveCount = _random.Next(2, 6);
            for (int i = 0; i < waveCount; i++)
            {
                project.Waves.Add(GenerateMigrationWave(i + 1));
            }

            return project;
        }

        public TestMigrationWave GenerateMigrationWave(int order)
        {
            var wave = new TestMigrationWave
            {
                Name = $"Wave {order}",
                Order = order,
                PlannedStartDate = DateTime.Now.AddDays(order * 7),
                Status = order == 1 ? TestMigrationStatus.InProgress : TestMigrationStatus.NotStarted,
                Notes = $"Migration wave {order} containing various migration types"
            };

            // Generate batches for the wave
            var batchCount = _random.Next(2, 5);
            var migrationTypes = Enum.GetValues<TestMigrationType>();

            for (int i = 0; i < batchCount; i++)
            {
                var migrationType = migrationTypes[_random.Next(migrationTypes.Length)];
                wave.Batches.Add(GenerateMigrationBatch($"Batch {i + 1} - {migrationType}", migrationType));
            }

            return wave;
        }

        public TestMigrationBatch GenerateMigrationBatch(string name, TestMigrationType type)
        {
            var batch = new TestMigrationBatch
            {
                Name = name,
                Type = type,
                Status = TestMigrationStatus.NotStarted
            };

            // Generate migration items based on type
            var itemCount = _random.Next(10, 100);
            for (int i = 0; i < itemCount; i++)
            {
                batch.Items.Add(GenerateMigrationItem(type, i));
            }

            return batch;
        }

        public TestMigrationItem GenerateMigrationItem(TestMigrationType type, int index)
        {
            var item = new TestMigrationItem
            {
                Type = type,
                Status = TestMigrationStatus.NotStarted,
                ProgressPercentage = 0,
                RetryCount = 0
            };

            switch (type)
            {
                case TestMigrationType.User:
                    item.SourceIdentity = $"user{index}@source.contoso.com";
                    item.TargetIdentity = $"user{index}@target.contoso.com";
                    item.DisplayName = $"User {index}";
                    item.SizeBytes = _random.Next(100_000_000, int.MaxValue); // 100MB to 2GB
                    break;

                case TestMigrationType.Mailbox:
                    item.SourceIdentity = $"mailbox{index}@source.contoso.com";
                    item.TargetIdentity = $"mailbox{index}@target.contoso.com";
                    item.DisplayName = $"Mailbox {index}";
                    item.SizeBytes = _random.Next(500_000_000, int.MaxValue); // 500MB to 2GB
                    break;

                case TestMigrationType.SharePoint:
                    item.SourceIdentity = $"https://source.contoso.com/sites/site{index}";
                    item.TargetIdentity = $"https://target.sharepoint.com/sites/site{index}";
                    item.DisplayName = $"SharePoint Site {index}";
                    item.SizeBytes = _random.Next(1_000_000_000, int.MaxValue); // 1GB to 2GB
                    break;

                case TestMigrationType.FileShare:
                    item.SourceIdentity = $"\\\\sourceserver\\share{index}";
                    item.TargetIdentity = $"https://target.sharepoint.com/sites/migrated-shares/share{index}";
                    item.DisplayName = $"File Share {index}";
                    item.SizeBytes = _random.Next(500_000_000, int.MaxValue); // 500MB to 2GB
                    break;

                default:
                    item.SourceIdentity = $"source-{type.ToString().ToLower()}-{index}";
                    item.TargetIdentity = $"target-{type.ToString().ToLower()}-{index}";
                    item.DisplayName = $"{type} Item {index}";
                    item.SizeBytes = _random.Next(10_000_000, 1_000_000_000); // 10MB to 1GB
                    break;
            }

            return item;
        }

        #endregion

        #region CSV Export Methods

        public void ExportUsersToCsv(List<TestUserDto> users, string filePath)
        {
            var csvContent = new StringBuilder();
            csvContent.AppendLine("UserPrincipalName,DisplayName,FirstName,LastName,Department,JobTitle,OfficeLocation,PhoneNumber,MobilePhone,EmployeeId,Manager,LastLogonDate,IsEnabled");

            foreach (var user in users)
            {
                csvContent.AppendLine($"{user.UserPrincipalName},{user.DisplayName},{user.FirstName},{user.LastName},{user.Department},{user.JobTitle},{user.OfficeLocation},{user.PhoneNumber},{user.MobilePhone},{user.EmployeeId},{user.Manager},{user.LastLogonDate:yyyy-MM-dd},{user.IsEnabled}");
            }

            File.WriteAllText(filePath, csvContent.ToString());
        }

        public void ExportGroupsToCsv(List<TestGroupDto> groups, string filePath)
        {
            var csvContent = new StringBuilder();
            csvContent.AppendLine("DisplayName,Description,GroupType,MemberCount,OwnerCount,CreatedDate,MailEnabled,SecurityEnabled");

            foreach (var group in groups)
            {
                csvContent.AppendLine($"{group.DisplayName},{group.Description},{group.GroupType},{group.MemberCount},{group.OwnerCount},{group.CreatedDate:yyyy-MM-dd},{group.MailEnabled},{group.SecurityEnabled}");
            }

            File.WriteAllText(filePath, csvContent.ToString());
        }

        public void ExportMigrationProjectToJson(TestMigrationProject project, string filePath)
        {
            var json = JsonSerializer.Serialize(project, new JsonSerializerOptions
            {
                WriteIndented = true,
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase
            });
            File.WriteAllText(filePath, json);
        }

        #endregion

        #region Helper Methods

        private string GenerateFirstName()
        {
            var firstNames = new[] { "John", "Jane", "Michael", "Sarah", "David", "Lisa", "Robert", "Jennifer", "William", "Mary", "James", "Patricia", "Christopher", "Linda", "Matthew", "Elizabeth", "Anthony", "Barbara", "Mark", "Susan" };
            return firstNames[_random.Next(firstNames.Length)];
        }

        private string GenerateLastName()
        {
            var lastNames = new[] { "Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson", "Thomas", "Taylor", "Moore", "Jackson", "Martin" };
            return lastNames[_random.Next(lastNames.Length)];
        }

        private string GenerateUniqueEmail(string firstName, string lastName, string domain, HashSet<string> usedEmails)
        {
            var baseEmail = $"{firstName.ToLower()}.{lastName.ToLower()}@{domain}";

            if (!usedEmails.Contains(baseEmail))
            {
                usedEmails.Add(baseEmail);
                return baseEmail;
            }

            // Generate variations if base email exists
            for (int i = 1; i <= 100; i++)
            {
                var email = $"{firstName.ToLower()}.{lastName.ToLower()}{i}@{domain}";
                if (!usedEmails.Contains(email))
                {
                    usedEmails.Add(email);
                    return email;
                }
            }

            // Fallback
            var guid = Guid.NewGuid().ToString("N")[..8];
            var fallbackEmail = $"{firstName.ToLower()}.{lastName.ToLower()}.{guid}@{domain}";
            usedEmails.Add(fallbackEmail);
            return fallbackEmail;
        }

        private string GenerateJobTitle()
        {
            var prefix = _jobTitles[_random.Next(_jobTitles.Length)];
            var role = new[] { "Developer", "Administrator", "Consultant", "Engineer", "Architect", "Technician", "Representative", "Executive" };
            return $"{prefix} {role[_random.Next(role.Length)]}";
        }

        private string GeneratePhoneNumber()
        {
            return $"+1-{_random.Next(200, 999)}-{_random.Next(200, 999)}-{_random.Next(1000, 9999)}";
        }

        private TestMigrationEnvironment GenerateSourceEnvironment()
        {
            return new TestMigrationEnvironment
            {
                Name = "Source Environment",
                Type = "OnPremises",
                IsConnected = true,
                HealthStatus = "Healthy",
                LastHealthCheck = DateTime.Now.AddMinutes(-_random.Next(5, 60)),
                Capabilities = new List<string> { "Active Directory", "Exchange Server", "SharePoint Server", "File Shares" }
            };
        }

        private TestMigrationEnvironment GenerateTargetEnvironment()
        {
            return new TestMigrationEnvironment
            {
                Name = "Target Environment",
                Type = "Azure",
                IsConnected = true,
                HealthStatus = "Healthy",
                LastHealthCheck = DateTime.Now.AddMinutes(-_random.Next(5, 60)),
                Capabilities = new List<string> { "Azure AD", "Exchange Online", "SharePoint Online", "OneDrive", "Microsoft Teams" }
            };
        }

        private TestMigrationSettings GenerateMigrationSettings()
        {
            return new TestMigrationSettings
            {
                EnableRollback = true,
                ValidateBeforeMigration = true,
                MaxConcurrentMigrations = _random.Next(3, 10),
                RetryAttempts = _random.Next(2, 5),
                RetryDelay = TimeSpan.FromMinutes(_random.Next(5, 15)),
                PreservePermissions = true,
                CreateMissingTargetContainers = true,
                NotificationEmail = "admin@contoso.com",
                PauseOnError = _random.NextDouble() > 0.5,
                GenerateDetailedLogs = true
            };
        }

        #endregion

        #region Bulk Data Generation

        public TestDataSet GenerateCompleteTestDataSet(int userCount = 1000, int groupCount = 50)
        {
            var users = GenerateUsers(userCount);
            var groups = GenerateGroups(groupCount, users);
            var project = GenerateMigrationProject("Complete Test Migration");

            return new TestDataSet
            {
                Users = users,
                Groups = groups,
                MigrationProject = project,
                GeneratedDate = DateTime.Now,
                Metadata = new Dictionary<string, object>
                {
                    { "UserCount", userCount },
                    { "GroupCount", groupCount },
                    { "WaveCount", project.Waves.Count },
                    { "TotalMigrationItems", project.Waves.SelectMany(w => w.Batches).SelectMany(b => b.Items).Count() }
                }
            };
        }

        #endregion
    }

    public class TestDataSet
    {
        public List<TestUserDto> Users { get; set; } = new List<TestUserDto>();
        public List<TestGroupDto> Groups { get; set; } = new List<TestGroupDto>();
        public TestMigrationProject MigrationProject { get; set; }
        public DateTime GeneratedDate { get; set; }
        public Dictionary<string, object> Metadata { get; set; } = new Dictionary<string, object>();
    }

    // Test DTOs that match the test project structure
    public class TestUserDto
    {
        public string UserPrincipalName { get; set; } = string.Empty;
        public string DisplayName { get; set; } = string.Empty;
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string Department { get; set; } = string.Empty;
        public string JobTitle { get; set; } = string.Empty;
        public string OfficeLocation { get; set; } = string.Empty;
        public string PhoneNumber { get; set; } = string.Empty;
        public string MobilePhone { get; set; } = string.Empty;
        public string EmployeeId { get; set; } = string.Empty;
        public string? Manager { get; set; }
        public string? ManagerDisplayName { get; set; }
        public DateTime? LastLogonDate { get; set; }
        public bool IsEnabled { get; set; }
        public DateTime? CreatedDate { get; set; }
    }

    public class TestGroupDto
    {
        public string DisplayName { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string GroupType { get; set; } = string.Empty;
        public int MemberCount { get; set; }
        public int OwnerCount { get; set; }
        public DateTime? CreatedDate { get; set; }
        public bool MailEnabled { get; set; }
        public bool SecurityEnabled { get; set; }
    }

    public class TestMigrationProject
    {
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public DateTime? CreatedDate { get; set; }
        public TestMigrationStatus Status { get; set; }
        public TestMigrationEnvironment SourceEnvironment { get; set; } = new();
        public TestMigrationEnvironment TargetEnvironment { get; set; } = new();
        public TestMigrationSettings Settings { get; set; } = new();
        public List<TestMigrationWave> Waves { get; set; } = new();
    }

    public class TestMigrationWave
    {
        public string Name { get; set; } = string.Empty;
        public int Order { get; set; }
        public DateTime? PlannedStartDate { get; set; }
        public TestMigrationStatus Status { get; set; }
        public string Notes { get; set; } = string.Empty;
        public List<TestMigrationBatch> Batches { get; set; } = new();
    }

    public class TestMigrationBatch
    {
        public string Name { get; set; } = string.Empty;
        public TestMigrationType Type { get; set; }
        public TestMigrationStatus Status { get; set; }
        public List<TestMigrationItem> Items { get; set; } = new();
    }

    public class TestMigrationItem
    {
        public TestMigrationType Type { get; set; }
        public TestMigrationStatus Status { get; set; }
        public string SourceIdentity { get; set; } = string.Empty;
        public string TargetIdentity { get; set; } = string.Empty;
        public string DisplayName { get; set; } = string.Empty;
        public long SizeBytes { get; set; }
        public int ProgressPercentage { get; set; }
        public int RetryCount { get; set; }
    }

    public class TestMigrationEnvironment
    {
        public string Name { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty;
        public bool IsConnected { get; set; }
        public string HealthStatus { get; set; } = string.Empty;
        public DateTime? LastHealthCheck { get; set; }
        public List<string> Capabilities { get; set; } = new();
    }

    public class TestMigrationSettings
    {
        public bool EnableRollback { get; set; }
        public bool ValidateBeforeMigration { get; set; }
        public int MaxConcurrentMigrations { get; set; }
        public int RetryAttempts { get; set; }
        public TimeSpan RetryDelay { get; set; }
        public bool PreservePermissions { get; set; }
        public bool CreateMissingTargetContainers { get; set; }
        public string NotificationEmail { get; set; } = string.Empty;
        public bool PauseOnError { get; set; }
        public bool GenerateDetailedLogs { get; set; }
    }

    public enum TestMigrationStatus
    {
        NotStarted,
        InProgress,
        Completed,
        Failed,
        Cancelled
    }

    public enum TestMigrationType
    {
        User,
        Mailbox,
        SharePoint,
        FileShare
    }
}