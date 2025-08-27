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

        public List<UserData> GenerateUsers(int count, string domain = "contoso.com")
        {
            var users = new List<UserData>();
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

        private UserData GenerateUser(string domain, int index, HashSet<string> usedEmails)
        {
            var firstName = GenerateFirstName();
            var lastName = GenerateLastName();
            var email = GenerateUniqueEmail(firstName, lastName, domain, usedEmails);
            
            return new UserData
            {
                UserPrincipalName = email,
                DisplayName = $"{firstName} {lastName}",
                GivenName = firstName,
                Surname = lastName,
                Department = _departments[_random.Next(_departments.Length)],
                Title = GenerateJobTitle(),
                Office = _locations[_random.Next(_locations.Length)],
                PhoneNumber = GeneratePhoneNumber(),
                MobilePhone = GeneratePhoneNumber(),
                EmployeeId = $"EMP{(index + 1):D6}",
                CompanyName = "Contoso Corporation",
                Country = "United States",
                UsageLocation = "US",
                LastLogonDate = GenerateLastLogonDate(),
                AccountEnabled = _random.NextDouble() > 0.05, // 95% enabled
                CreatedDate = DateTime.Now.AddDays(-_random.Next(1, 1825)), // Created within last 5 years
                LicenseAssigned = GenerateLicenseAssignment()
            };
        }

        private void AssignManagers(List<UserData> users)
        {
            var managers = users.Where(u => u.Title.Contains("Manager") || u.Title.Contains("Director")).ToList();
            
            foreach (var user in users)
            {
                if (!user.Title.Contains("Manager") && !user.Title.Contains("Director") && _random.NextDouble() > 0.3)
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

        public List<GroupData> GenerateGroups(int count, List<UserData> users = null)
        {
            var groups = new List<GroupData>();
            
            // Generate department groups
            foreach (var dept in _departments)
            {
                groups.Add(new GroupData
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
                groups.Add(new GroupData
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

        public MigrationOrchestratorProject GenerateMigrationProject(string name = "Test Migration Project")
        {
            var project = new MigrationOrchestratorProject
            {
                Name = name,
                Description = $"Generated test migration project for {name}",
                CreatedDate = DateTime.Now.AddDays(-_random.Next(1, 30)),
                Status = (MigrationStatus)_random.Next(0, 5),
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

        public MigrationOrchestratorWave GenerateMigrationWave(int order)
        {
            var wave = new MigrationOrchestratorWave
            {
                Name = $"Wave {order}",
                Order = order,
                PlannedStartDate = DateTime.Now.AddDays(order * 7),
                Status = order == 1 ? MigrationStatus.InProgress : MigrationStatus.NotStarted,
                Notes = $"Migration wave {order} containing various migration types"
            };

            // Generate batches for the wave
            var batchCount = _random.Next(2, 5);
            var migrationTypes = Enum.GetValues<MigrationType>();
            
            for (int i = 0; i < batchCount; i++)
            {
                var migrationType = migrationTypes[_random.Next(migrationTypes.Length)];
                wave.Batches.Add(GenerateMigrationBatch($"Batch {i + 1} - {migrationType}", migrationType));
            }

            return wave;
        }

        public MigrationBatch GenerateMigrationBatch(string name, MigrationType type)
        {
            var batch = new MigrationBatch
            {
                Name = name,
                Type = type,
                Status = MigrationStatus.NotStarted
            };

            // Generate migration items based on type
            var itemCount = _random.Next(10, 100);
            for (int i = 0; i < itemCount; i++)
            {
                batch.Items.Add(GenerateMigrationItem(type, i));
            }

            return batch;
        }

        public MigrationItem GenerateMigrationItem(MigrationType type, int index)
        {
            var item = new MigrationItem
            {
                Type = type,
                Status = MigrationStatus.NotStarted,
                ProgressPercentage = 0,
                RetryCount = 0
            };

            switch (type)
            {
                case MigrationType.User:
                    item.SourceIdentity = $"user{index}@source.contoso.com";
                    item.TargetIdentity = $"user{index}@target.contoso.com";
                    item.DisplayName = $"User {index}";
                    item.SizeBytes = _random.Next(100_000_000, 5_000_000_000); // 100MB to 5GB
                    break;

                case MigrationType.Mailbox:
                    item.SourceIdentity = $"mailbox{index}@source.contoso.com";
                    item.TargetIdentity = $"mailbox{index}@target.contoso.com";
                    item.DisplayName = $"Mailbox {index}";
                    item.SizeBytes = _random.Next(500_000_000, 50_000_000_000); // 500MB to 50GB
                    break;

                case MigrationType.SharePoint:
                    item.SourceIdentity = $"https://source.contoso.com/sites/site{index}";
                    item.TargetIdentity = $"https://target.sharepoint.com/sites/site{index}";
                    item.DisplayName = $"SharePoint Site {index}";
                    item.SizeBytes = _random.Next(1_000_000_000, 100_000_000_000); // 1GB to 100GB
                    break;

                case MigrationType.FileShare:
                    item.SourceIdentity = $"\\\\sourceserver\\share{index}";
                    item.TargetIdentity = $"https://target.sharepoint.com/sites/migrated-shares/share{index}";
                    item.DisplayName = $"File Share {index}";
                    item.SizeBytes = _random.Next(500_000_000, 10_000_000_000); // 500MB to 10GB
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

        public void ExportUsersToCsv(List<UserData> users, string filePath)
        {
            var csvContent = new StringBuilder();
            csvContent.AppendLine("UserPrincipalName,DisplayName,GivenName,Surname,Department,Title,Office,PhoneNumber,MobilePhone,EmployeeId,Manager,LastLogonDate,AccountEnabled");

            foreach (var user in users)
            {
                csvContent.AppendLine($"{user.UserPrincipalName},{user.DisplayName},{user.GivenName},{user.Surname},{user.Department},{user.Title},{user.Office},{user.PhoneNumber},{user.MobilePhone},{user.EmployeeId},{user.Manager},{user.LastLogonDate:yyyy-MM-dd},{user.AccountEnabled}");
            }

            File.WriteAllText(filePath, csvContent.ToString());
        }

        public void ExportGroupsToCsv(List<GroupData> groups, string filePath)
        {
            var csvContent = new StringBuilder();
            csvContent.AppendLine("DisplayName,Description,GroupType,MemberCount,OwnerCount,CreatedDate,MailEnabled,SecurityEnabled");

            foreach (var group in groups)
            {
                csvContent.AppendLine($"{group.DisplayName},{group.Description},{group.GroupType},{group.MemberCount},{group.OwnerCount},{group.CreatedDate:yyyy-MM-dd},{group.MailEnabled},{group.SecurityEnabled}");
            }

            File.WriteAllText(filePath, csvContent.ToString());
        }

        public void ExportMigrationProjectToJson(MigrationOrchestratorProject project, string filePath)
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

        private DateTime? GenerateLastLogonDate()
        {
            if (_random.NextDouble() > 0.1) // 90% have recent logon
            {
                return DateTime.Now.AddDays(-_random.Next(0, 90));
            }
            return null; // 10% never logged on or very old
        }

        private string GenerateLicenseAssignment()
        {
            var licenses = new[] { "Microsoft 365 E3", "Microsoft 365 E5", "Microsoft 365 Business Premium", "Office 365 E1", "Office 365 E3" };
            return licenses[_random.Next(licenses.Length)];
        }

        private MigrationEnvironment GenerateSourceEnvironment()
        {
            return new MigrationEnvironment
            {
                Name = "Source Environment",
                Type = "OnPremises",
                IsConnected = true,
                HealthStatus = "Healthy",
                LastHealthCheck = DateTime.Now.AddMinutes(-_random.Next(5, 60)),
                Capabilities = new List<string> { "Active Directory", "Exchange Server", "SharePoint Server", "File Shares" }
            };
        }

        private MigrationEnvironment GenerateTargetEnvironment()
        {
            return new MigrationEnvironment
            {
                Name = "Target Environment",
                Type = "Azure",
                IsConnected = true,
                HealthStatus = "Healthy",
                LastHealthCheck = DateTime.Now.AddMinutes(-_random.Next(5, 60)),
                Capabilities = new List<string> { "Azure AD", "Exchange Online", "SharePoint Online", "OneDrive", "Microsoft Teams" }
            };
        }

        private MigrationSettings GenerateMigrationSettings()
        {
            return new MigrationSettings
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
        public List<UserData> Users { get; set; } = new List<UserData>();
        public List<GroupData> Groups { get; set; } = new List<GroupData>();
        public MigrationOrchestratorProject MigrationProject { get; set; }
        public DateTime GeneratedDate { get; set; }
        public Dictionary<string, object> Metadata { get; set; } = new Dictionary<string, object>();
    }
}