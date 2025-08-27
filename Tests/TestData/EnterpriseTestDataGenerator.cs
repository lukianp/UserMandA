using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;

namespace MandADiscoverySuite.Tests.TestData
{
    /// <summary>
    /// Generates realistic enterprise test data for LogicEngine testing
    /// Creates representative CSV data sets with proper relationships and edge cases
    /// </summary>
    public static class EnterpriseTestDataGenerator
    {
        private static readonly Random _random = new Random(12345); // Fixed seed for reproducible tests
        
        public static void GenerateEnterpriseDataSet(string outputPath, int userCount = 1000, int deviceCount = 800, int applicationCount = 50)
        {
            Directory.CreateDirectory(outputPath);
            
            // Generate hierarchical organizational structure
            var departments = new[] { "IT", "HR", "Finance", "Sales", "Marketing", "Operations", "Legal", "R&D" };
            var managers = GenerateManagers(departments);
            
            // Generate users with realistic distribution
            var users = GenerateUsers(userCount, departments, managers);
            
            // Generate groups with nested structures
            var groups = GenerateGroups(departments, users);
            
            // Generate devices with realistic user assignments
            var devices = GenerateDevices(deviceCount, users);
            
            // Generate applications with realistic usage patterns
            var applications = GenerateApplications(applicationCount);
            
            // Generate GPOs with realistic targeting
            var gpos = GenerateGPOs(departments, groups);
            
            // Generate ACLs with complex permission structures
            var acls = GenerateACLs(users, groups);
            
            // Generate mailboxes for active users
            var mailboxes = GenerateMailboxes(users);
            
            // Generate mapped drives
            var mappedDrives = GenerateMappedDrives(users, departments);
            
            // Generate Azure roles
            var azureRoles = GenerateAzureRoles(users);
            
            // Generate SQL databases
            var sqlDatabases = GenerateSqlDatabases(departments, users);
            
            // Generate T-029 expanded module data
            var threats = GenerateThreats(devices, users);
            var governance = GenerateGovernance(devices, users);
            var lineage = GenerateLineage();
            var externalIdentities = GenerateExternalIdentities(users);
            
            // Write all CSV files
            WriteCSV(Path.Combine(outputPath, "Users.csv"), users, GetUserHeaders());
            WriteCSV(Path.Combine(outputPath, "Groups.csv"), groups, GetGroupHeaders());
            WriteCSV(Path.Combine(outputPath, "Devices.csv"), devices, GetDeviceHeaders());
            WriteCSV(Path.Combine(outputPath, "Applications.csv"), applications, GetApplicationHeaders());
            WriteCSV(Path.Combine(outputPath, "GPOs.csv"), gpos, GetGPOHeaders());
            WriteCSV(Path.Combine(outputPath, "NTFS_ACL.csv"), acls, GetACLHeaders());
            WriteCSV(Path.Combine(outputPath, "Mailboxes.csv"), mailboxes, GetMailboxHeaders());
            WriteCSV(Path.Combine(outputPath, "MappedDrives.csv"), mappedDrives, GetMappedDriveHeaders());
            WriteCSV(Path.Combine(outputPath, "AzureRoles.csv"), azureRoles, GetAzureRoleHeaders());
            WriteCSV(Path.Combine(outputPath, "SQL.csv"), sqlDatabases, GetSqlHeaders());
            WriteCSV(Path.Combine(outputPath, "ThreatDetection.csv"), threats, GetThreatHeaders());
            WriteCSV(Path.Combine(outputPath, "DataGovernance.csv"), governance, GetGovernanceHeaders());
            WriteCSV(Path.Combine(outputPath, "DataLineage.csv"), lineage, GetLineageHeaders());
            WriteCSV(Path.Combine(outputPath, "ExternalIdentities.csv"), externalIdentities, GetExternalIdentityHeaders());
        }
        
        private static List<Dictionary<string, string>> GenerateManagers(string[] departments)
        {
            var managers = new List<Dictionary<string, string>>();
            var managerIndex = 2000; // Start manager SIDs at 2000
            
            foreach (var dept in departments)
            {
                managers.Add(new Dictionary<string, string>
                {
                    ["UPN"] = $"{dept.ToLower()}.manager@contoso.com",
                    ["Sam"] = $"{dept.ToLower()}mgr",
                    ["Sid"] = $"S-1-5-21-1234567890-1234567890-1234567890-{managerIndex++}",
                    ["Mail"] = $"{dept.ToLower()}.manager@contoso.com",
                    ["DisplayName"] = $"{dept} Manager",
                    ["Enabled"] = "True",
                    ["OU"] = $"OU={dept},OU=Users",
                    ["ManagerSid"] = "", // Top-level managers have no manager
                    ["Dept"] = dept,
                    ["AzureObjectId"] = Guid.NewGuid().ToString(),
                    ["Groups"] = $"Domain Users;{dept} Managers",
                    ["DiscoveryTimestamp"] = "2024-01-15T10:00:00Z",
                    ["DiscoveryModule"] = "ActiveDirectoryDiscovery",
                    ["SessionId"] = "session-enterprise"
                });
            }
            
            return managers;
        }
        
        private static List<Dictionary<string, string>> GenerateUsers(int count, string[] departments, List<Dictionary<string, string>> managers)
        {
            var users = new List<Dictionary<string, string>>(managers); // Include managers
            var userIndex = 1000;
            
            var firstNames = new[] { "John", "Jane", "Alice", "Bob", "Carol", "David", "Eve", "Frank", "Grace", "Henry", "Ivy", "Jack", "Kate", "Liam", "Mia", "Noah", "Olivia", "Paul", "Quinn", "Ruby" };
            var lastNames = new[] { "Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson", "Thomas", "Taylor", "Moore", "Jackson", "Martin" };
            
            for (int i = 0; i < count - managers.Count; i++)
            {
                var dept = departments[_random.Next(departments.Length)];
                var firstName = firstNames[_random.Next(firstNames.Length)];
                var lastName = lastNames[_random.Next(lastNames.Length)];
                var sam = $"{firstName.ToLower()}.{lastName.ToLower()}{(i % 100):D2}";
                var upn = $"{sam}@contoso.com";
                
                var manager = managers.FirstOrDefault(m => m["Dept"] == dept);
                
                users.Add(new Dictionary<string, string>
                {
                    ["UPN"] = upn,
                    ["Sam"] = sam,
                    ["Sid"] = $"S-1-5-21-1234567890-1234567890-1234567890-{userIndex++}",
                    ["Mail"] = upn,
                    ["DisplayName"] = $"{firstName} {lastName}",
                    ["Enabled"] = _random.NextDouble() > 0.05 ? "True" : "False", // 5% disabled
                    ["OU"] = $"OU={dept},OU=Users",
                    ["ManagerSid"] = manager?["Sid"] ?? "",
                    ["Dept"] = dept,
                    ["AzureObjectId"] = _random.NextDouble() > 0.1 ? Guid.NewGuid().ToString() : "", // 10% no Azure
                    ["Groups"] = $"Domain Users;{dept} Users" + (_random.NextDouble() > 0.8 ? $";{dept} Admins" : ""), // 20% are dept admins
                    ["DiscoveryTimestamp"] = GetRandomTimestamp(),
                    ["DiscoveryModule"] = "ActiveDirectoryDiscovery",
                    ["SessionId"] = "session-enterprise"
                });
            }
            
            return users;
        }
        
        private static List<Dictionary<string, string>> GenerateGroups(string[] departments, List<Dictionary<string, string>> users)
        {
            var groups = new List<Dictionary<string, string>>();
            var groupIndex = 3000;
            
            // Domain groups
            groups.Add(new Dictionary<string, string>
            {
                ["Sid"] = $"S-1-5-21-1234567890-1234567890-1234567890-{groupIndex++}",
                ["Name"] = "Domain Users",
                ["Type"] = "Security",
                ["Members"] = string.Join(";", users.Select(u => u["Sid"])),
                ["DiscoveryTimestamp"] = "2024-01-15T10:00:00Z",
                ["DiscoveryModule"] = "ActiveDirectoryDiscovery",
                ["SessionId"] = "session-enterprise",
                ["NestedGroups"] = ""
            });
            
            // Department groups
            foreach (var dept in departments)
            {
                var deptUsers = users.Where(u => u["Dept"] == dept).Select(u => u["Sid"]).ToList();
                var deptAdmins = users.Where(u => u["Dept"] == dept && u["Groups"].Contains($"{dept} Admins")).Select(u => u["Sid"]).ToList();
                var deptManagers = users.Where(u => u["Groups"].Contains($"{dept} Managers")).Select(u => u["Sid"]).ToList();
                
                // Regular department users group
                groups.Add(new Dictionary<string, string>
                {
                    ["Sid"] = $"S-1-5-21-1234567890-1234567890-1234567890-{groupIndex++}",
                    ["Name"] = $"{dept} Users",
                    ["Type"] = "Security",
                    ["Members"] = string.Join(";", deptUsers),
                    ["DiscoveryTimestamp"] = GetRandomTimestamp(),
                    ["DiscoveryModule"] = "ActiveDirectoryDiscovery",
                    ["SessionId"] = "session-enterprise",
                    ["NestedGroups"] = $"{dept} Admins"
                });
                
                // Department admins group
                if (deptAdmins.Any())
                {
                    groups.Add(new Dictionary<string, string>
                    {
                        ["Sid"] = $"S-1-5-21-1234567890-1234567890-1234567890-{groupIndex++}",
                        ["Name"] = $"{dept} Admins",
                        ["Type"] = "Security",
                        ["Members"] = string.Join(";", deptAdmins),
                        ["DiscoveryTimestamp"] = GetRandomTimestamp(),
                        ["DiscoveryModule"] = "ActiveDirectoryDiscovery",
                        ["SessionId"] = "session-enterprise",
                        ["NestedGroups"] = ""
                    });
                }
                
                // Department managers group
                if (deptManagers.Any())
                {
                    groups.Add(new Dictionary<string, string>
                    {
                        ["Sid"] = $"S-1-5-21-1234567890-1234567890-1234567890-{groupIndex++}",
                        ["Name"] = $"{dept} Managers",
                        ["Type"] = "Security",
                        ["Members"] = string.Join(";", deptManagers),
                        ["DiscoveryTimestamp"] = GetRandomTimestamp(),
                        ["DiscoveryModule"] = "ActiveDirectoryDiscovery",
                        ["SessionId"] = "session-enterprise",
                        ["NestedGroups"] = ""
                    });
                }
            }
            
            return groups;
        }
        
        private static List<Dictionary<string, string>> GenerateDevices(int count, List<Dictionary<string, string>> users)
        {
            var devices = new List<Dictionary<string, string>>();
            var enabledUsers = users.Where(u => u["Enabled"] == "True").ToList();
            var osVersions = new[] { "Windows 10", "Windows 11", "Windows Server 2019", "Windows Server 2022", "macOS" };
            var applications = new[] { "Microsoft Office 365", "Google Chrome", "Mozilla Firefox", "Adobe Acrobat", "Zoom", "Teams", "Visual Studio", "SQL Server Management Studio" };
            
            for (int i = 0; i < count; i++)
            {
                var isServer = _random.NextDouble() < 0.1; // 10% servers
                var deviceType = isServer ? "SRV" : "WS";
                var deviceName = $"{deviceType}{(i + 1):D3}";
                var os = isServer ? osVersions[_random.Next(2, 4)] : osVersions[_random.Next(0, 2)]; // Servers use server OS
                
                var primaryUser = _random.NextDouble() < 0.9 && enabledUsers.Any() ? // 90% of workstations have primary users
                    enabledUsers[_random.Next(enabledUsers.Count)] : null;
                
                var installedApps = new List<string>();
                var appCount = _random.Next(2, 6);
                for (int j = 0; j < appCount; j++)
                {
                    var app = applications[_random.Next(applications.Length)];
                    if (!installedApps.Contains(app))
                        installedApps.Add(app);
                }
                
                devices.Add(new Dictionary<string, string>
                {
                    ["Name"] = deviceName,
                    ["DNS"] = $"{deviceName.ToLower()}.contoso.com",
                    ["OU"] = isServer ? "OU=Servers,OU=Computers" : "OU=Workstations,OU=Computers",
                    ["OS"] = os,
                    ["PrimaryUserSid"] = primaryUser?["Sid"] ?? "",
                    ["InstalledApps"] = string.Join(";", installedApps),
                    ["DiscoveryTimestamp"] = GetRandomTimestamp(),
                    ["DiscoveryModule"] = "ComputerDiscovery",
                    ["SessionId"] = "session-enterprise"
                });
            }
            
            return devices;
        }
        
        private static List<Dictionary<string, string>> GenerateApplications(int count)
        {
            var applications = new List<Dictionary<string, string>>();
            var appNames = new[]
            {
                "Microsoft Office 365", "Google Chrome", "Mozilla Firefox", "Adobe Acrobat Reader", "Zoom",
                "Microsoft Teams", "Visual Studio", "SQL Server Management Studio", "NotePad++", "WinRAR",
                "VLC Media Player", "Skype for Business", "AutoCAD", "Photoshop", "PowerBI Desktop",
                "Tableau", "Slack", "Discord", "Steam", "Spotify"
            };
            
            var publishers = new Dictionary<string, string[]>
            {
                ["Microsoft"] = new[] { "Microsoft Office 365", "Microsoft Teams", "Visual Studio", "SQL Server Management Studio", "PowerBI Desktop" },
                ["Google"] = new[] { "Google Chrome" },
                ["Mozilla"] = new[] { "Mozilla Firefox" },
                ["Adobe"] = new[] { "Adobe Acrobat Reader", "Photoshop" },
                ["Zoom"] = new[] { "Zoom" },
                ["Autodesk"] = new[] { "AutoCAD" },
                ["Tableau"] = new[] { "Tableau" },
                ["Various"] = new[] { "NotePad++", "WinRAR", "VLC Media Player", "Slack", "Discord", "Steam", "Spotify" }
            };
            
            for (int i = 0; i < Math.Min(count, appNames.Length); i++)
            {
                var appName = appNames[i];
                var publisher = publishers.FirstOrDefault(kvp => kvp.Value.Contains(appName)).Key ?? "Unknown";
                var installCount = _random.Next(10, 500);
                
                applications.Add(new Dictionary<string, string>
                {
                    ["Id"] = $"app-{(i + 1):D3}",
                    ["Name"] = appName,
                    ["Source"] = "Registry",
                    ["InstallCounts"] = installCount.ToString(),
                    ["Executables"] = GetExecutableNames(appName),
                    ["Publishers"] = publisher,
                    ["DiscoveryTimestamp"] = GetRandomTimestamp(),
                    ["DiscoveryModule"] = "ApplicationDiscovery",
                    ["SessionId"] = "session-enterprise"
                });
            }
            
            return applications;
        }
        
        private static List<Dictionary<string, string>> GenerateThreats(List<Dictionary<string, string>> devices, List<Dictionary<string, string>> users)
        {
            var threats = new List<Dictionary<string, string>>();
            var threatIndex = 1;
            var categories = new[] { "Malware", "Vulnerability", "DataBreach", "PolicyViolation", "Phishing", "Insider", "DDoS" };
            var severities = new[] { "Critical", "High", "Medium", "Low" };
            var statuses = new[] { "Active", "Investigating", "Resolved", "False Positive" };
            
            // Generate threats for random subset of devices
            var threatenedDevices = devices.OrderBy(x => _random.Next()).Take(devices.Count / 10).ToList(); // 10% of devices have threats
            
            foreach (var device in threatenedDevices)
            {
                var threatCount = _random.Next(1, 4); // 1-3 threats per affected device
                for (int i = 0; i < threatCount; i++)
                {
                    var category = categories[_random.Next(categories.Length)];
                    var severity = severities[_random.Next(severities.Length)];
                    var status = statuses[_random.Next(statuses.Length)];
                    
                    threats.Add(new Dictionary<string, string>
                    {
                        ["ThreatId"] = $"THR-{threatIndex++:D3}",
                        ["AssetId"] = device["Name"],
                        ["AssetType"] = device["Name"].StartsWith("SRV") ? "Server" : "Workstation",
                        ["ThreatCategory"] = category,
                        ["ThreatType"] = GetThreatType(category),
                        ["Severity"] = severity,
                        ["Status"] = status,
                        ["Description"] = GetThreatDescription(category),
                        ["DetectionTime"] = GetRandomTimestamp(daysAgo: _random.Next(0, 30)),
                        ["Remediation"] = GetRemediationAction(category),
                        ["AffectedUsers"] = device["PrimaryUserSid"],
                        ["DiscoveryTimestamp"] = GetRandomTimestamp(),
                        ["DiscoveryModule"] = "ThreatDetectionEngine",
                        ["SessionId"] = "session-enterprise"
                    });
                }
            }
            
            return threats;
        }
        
        private static List<Dictionary<string, string>> GenerateGovernance(List<Dictionary<string, string>> devices, List<Dictionary<string, string>> users)
        {
            var governance = new List<Dictionary<string, string>>();
            var classifications = new[] { "Public", "Internal", "Confidential", "Restricted" };
            var criticalities = new[] { "Low", "Medium", "High", "Critical" };
            var compliance = new[] { "Compliant", "NonCompliant", "Unknown" };
            var retentions = new[] { "1 Year", "3 Years", "5 Years", "7 Years", "10 Years", "Indefinite" };
            
            var assetIndex = 1;
            
            // Generate governance for servers (databases, file shares)
            var servers = devices.Where(d => d["Name"].StartsWith("SRV")).ToList();
            foreach (var server in servers)
            {
                var owner = users[_random.Next(users.Count)];
                var steward = users[_random.Next(users.Count)];
                var classification = classifications[_random.Next(classifications.Length)];
                var criticality = criticalities[_random.Next(criticalities.Length)];
                var complianceStatus = compliance[_random.Next(compliance.Length)];
                
                governance.Add(new Dictionary<string, string>
                {
                    ["AssetId"] = $"DB{assetIndex:D3}",
                    ["AssetName"] = $"Database on {server["Name"]}",
                    ["AssetType"] = "Database",
                    ["DataClassification"] = classification,
                    ["Owner"] = owner["UPN"],
                    ["DataSteward"] = steward["UPN"],
                    ["ComplianceStatus"] = complianceStatus,
                    ["RetentionPolicy"] = retentions[_random.Next(retentions.Length)],
                    ["LastReviewDate"] = GetRandomTimestamp(daysAgo: _random.Next(0, 365)),
                    ["NextReviewDate"] = GetRandomTimestamp(daysAgo: -_random.Next(30, 365)),
                    ["DataSources"] = "Database;Application",
                    ["BusinessCriticality"] = criticality,
                    ["DiscoveryTimestamp"] = GetRandomTimestamp(),
                    ["DiscoveryModule"] = "DataGovernanceMetadataManagement",
                    ["SessionId"] = "session-enterprise"
                });
                assetIndex++;
            }
            
            return governance;
        }
        
        private static List<Dictionary<string, string>> GenerateLineage()
        {
            var lineage = new List<Dictionary<string, string>>();
            var flowTypes = new[] { "ETL", "Replication", "API", "Manual Import", "Batch Processing" };
            var transformations = new[] { "Transform", "Aggregate", "Filter", "Join", "Load", "Extract" };
            var frequencies = new[] { "Real-time", "Hourly", "Daily", "Weekly", "Monthly" };
            
            // Define a realistic data flow topology
            var flows = new[]
            {
                new { Source = "SourceDB001", Target = "StagingDB001", Type = "ETL", Freq = "Daily" },
                new { Source = "StagingDB001", Target = "DataWarehouse", Type = "Transform", Freq = "Daily" },
                new { Source = "DataWarehouse", Target = "ReportingDB", Type = "Replication", Freq = "Hourly" },
                new { Source = "ReportingDB", Target = "PowerBI", Type = "API", Freq = "Real-time" },
                new { Source = "FileShare001", Target = "StagingDB001", Type = "Manual Import", Freq = "Weekly" }
            };
            
            for (int i = 0; i < flows.Length; i++)
            {
                var flow = flows[i];
                lineage.Add(new Dictionary<string, string>
                {
                    ["LineageId"] = $"LIN-{(i + 1):D3}",
                    ["SourceAsset"] = flow.Source,
                    ["SourceType"] = flow.Source.Contains("DB") ? "Database" : flow.Source.Contains("Share") ? "FileShare" : "Analytics",
                    ["TargetAsset"] = flow.Target,
                    ["TargetType"] = flow.Target.Contains("DB") || flow.Target.Contains("Warehouse") ? "Database" : "Analytics",
                    ["FlowType"] = flow.Type,
                    ["DataElements"] = "CustomerData;TransactionData;Metadata",
                    ["TransformationType"] = transformations[_random.Next(transformations.Length)],
                    ["LastFlowTime"] = GetRandomTimestamp(daysAgo: _random.Next(0, 7)),
                    ["FlowFrequency"] = flow.Freq,
                    ["DataVolume"] = $"{_random.Next(1, 1000)} GB",
                    ["BusinessProcess"] = GetBusinessProcess(flow.Type),
                    ["DiscoveryTimestamp"] = GetRandomTimestamp(),
                    ["DiscoveryModule"] = "DataLineageDependencyEngine",
                    ["SessionId"] = "session-enterprise"
                });
            }
            
            return lineage;
        }
        
        private static List<Dictionary<string, string>> GenerateExternalIdentities(List<Dictionary<string, string>> users)
        {
            var externalIdentities = new List<Dictionary<string, string>>();
            var providers = new[] { "PartnerAD", "VendorAzureAD", "SupplierLDAP", "ContractorAD", "CustomerAD" };
            var providerTypes = new[] { "ActiveDirectory", "AzureActiveDirectory", "LDAP", "SAML", "OAuth" };
            var mappingStatuses = new[] { "Mapped", "PotentialMatch", "Unmapped", "Blocked", "ReviewRequired" };
            var trustLevels = new[] { "Trusted", "Review Required", "Untrusted", "Blocked" };
            
            // Create external identities for subset of users (representing partners, contractors, etc.)
            var externalUserCount = users.Count / 10; // 10% of users have external identities
            var selectedUsers = users.OrderBy(x => _random.Next()).Take(externalUserCount).ToList();
            
            var externalIndex = 1;
            foreach (var user in selectedUsers)
            {
                var provider = providers[_random.Next(providers.Length)];
                var providerType = providerTypes[_random.Next(providerTypes.Length)];
                var mappingStatus = mappingStatuses[_random.Next(mappingStatuses.Length)];
                var trustLevel = trustLevels[_random.Next(trustLevels.Length)];
                
                var externalUpn = $"{user["Sam"]}@{provider.ToLower().Replace("ad", "").Replace("ldap", "")}.com";
                
                externalIdentities.Add(new Dictionary<string, string>
                {
                    ["ExternalId"] = $"EXT-{externalIndex++:D3}",
                    ["ExternalUPN"] = externalUpn,
                    ["Provider"] = provider,
                    ["ProviderType"] = providerType,
                    ["InternalUserSid"] = mappingStatus == "Mapped" ? user["Sid"] : "",
                    ["InternalUPN"] = mappingStatus == "Mapped" || mappingStatus == "PotentialMatch" ? user["UPN"] : "",
                    ["MappingStatus"] = mappingStatus,
                    ["MappingAccuracy"] = GetMappingAccuracy(mappingStatus),
                    ["LastSyncTime"] = mappingStatus != "Unmapped" ? GetRandomTimestamp(daysAgo: _random.Next(0, 30)) : "",
                    ["Attributes"] = "Name;Email;Department",
                    ["Roles"] = GetExternalRoles(provider),
                    ["TrustLevel"] = trustLevel,
                    ["DiscoveryTimestamp"] = GetRandomTimestamp(),
                    ["DiscoveryModule"] = "ExternalIdentityDiscovery",
                    ["SessionId"] = "session-enterprise"
                });
            }
            
            return externalIdentities;
        }
        
        // Helper methods for data generation
        private static string GetRandomTimestamp(int daysAgo = 0)
        {
            var baseTime = DateTime.UtcNow.AddDays(-daysAgo);
            var randomOffset = TimeSpan.FromMinutes(_random.Next(-1440, 1440)); // ±24 hours
            return baseTime.Add(randomOffset).ToString("yyyy-MM-ddTHH:mm:ssZ");
        }
        
        private static string GetExecutableNames(string appName)
        {
            var executables = new Dictionary<string, string>
            {
                ["Microsoft Office 365"] = "outlook.exe;winword.exe;excel.exe;powerpnt.exe",
                ["Google Chrome"] = "chrome.exe",
                ["Mozilla Firefox"] = "firefox.exe",
                ["Visual Studio"] = "devenv.exe;code.exe",
                ["SQL Server Management Studio"] = "ssms.exe",
                ["Adobe Acrobat Reader"] = "acrord32.exe",
                ["Microsoft Teams"] = "teams.exe",
                ["Zoom"] = "zoom.exe"
            };
            
            return executables.GetValueOrDefault(appName, $"{appName.Replace(" ", "").ToLower()}.exe");
        }
        
        private static string GetThreatType(string category)
        {
            return category switch
            {
                "Malware" => "Trojan",
                "Vulnerability" => "CVE-2024-0001",
                "DataBreach" => "UnauthorizedAccess",
                "PolicyViolation" => "SoftwareViolation",
                "Phishing" => "EmailPhishing",
                "Insider" => "DataExfiltration",
                "DDoS" => "NetworkDDoS",
                _ => "Unknown"
            };
        }
        
        private static string GetThreatDescription(string category)
        {
            return category switch
            {
                "Malware" => "Suspicious executable detected on system",
                "Vulnerability" => "Critical security vulnerability identified",
                "DataBreach" => "Unusual data access patterns detected",
                "PolicyViolation" => "Unauthorized software installation detected",
                "Phishing" => "Suspicious email links accessed",
                "Insider" => "Unusual data download activity detected",
                "DDoS" => "Network traffic anomaly detected",
                _ => "Security event detected"
            };
        }
        
        private static string GetRemediationAction(string category)
        {
            return category switch
            {
                "Malware" => "Quarantine file and run full scan",
                "Vulnerability" => "Apply security patch immediately",
                "DataBreach" => "Review access logs and user permissions",
                "PolicyViolation" => "Remove unauthorized software",
                "Phishing" => "Block suspicious URLs and educate user",
                "Insider" => "Review user activity and restrict access",
                "DDoS" => "Implement traffic filtering rules",
                _ => "Investigate and remediate"
            };
        }
        
        private static string GetBusinessProcess(string flowType)
        {
            return flowType switch
            {
                "ETL" => "Data Integration",
                "Replication" => "Data Synchronization",
                "API" => "Real-time Analytics",
                "Manual Import" => "Document Processing",
                "Batch Processing" => "Batch Analytics",
                _ => "Data Processing"
            };
        }
        
        private static string GetMappingAccuracy(string status)
        {
            return status switch
            {
                "Mapped" => "High",
                "PotentialMatch" => "Medium",
                "ReviewRequired" => "Low",
                "Unmapped" => "Unknown",
                "Blocked" => "N/A",
                _ => "Unknown"
            };
        }
        
        private static string GetExternalRoles(string provider)
        {
            return provider switch
            {
                "PartnerAD" => "Partner Access",
                "VendorAzureAD" => "Vendor Support",
                "SupplierLDAP" => "Supplier Portal",
                "ContractorAD" => "Contractor",
                "CustomerAD" => "Customer Portal",
                _ => "External User"
            };
        }
        
        // CSV generation helper methods
        private static void WriteCSV<T>(string filePath, List<T> data, string[] headers) where T : Dictionary<string, string>
        {
            using var writer = new StreamWriter(filePath);
            writer.WriteLine(string.Join(",", headers));
            
            foreach (var item in data)
            {
                var values = headers.Select(header => EscapeCsvValue(item.GetValueOrDefault(header, "")));
                writer.WriteLine(string.Join(",", values));
            }
        }
        
        private static string EscapeCsvValue(string value)
        {
            if (string.IsNullOrEmpty(value)) return "";
            if (value.Contains(",") || value.Contains("\"") || value.Contains("\n"))
            {
                return "\"" + value.Replace("\"", "\"\"") + "\"";
            }
            return value;
        }
        
        // Generate remaining data types with placeholder implementations
        private static List<Dictionary<string, string>> GenerateGPOs(string[] departments, List<Dictionary<string, string>> groups) => new();
        private static List<Dictionary<string, string>> GenerateACLs(List<Dictionary<string, string>> users, List<Dictionary<string, string>> groups) => new();
        private static List<Dictionary<string, string>> GenerateMailboxes(List<Dictionary<string, string>> users) => new();
        private static List<Dictionary<string, string>> GenerateMappedDrives(List<Dictionary<string, string>> users, string[] departments) => new();
        private static List<Dictionary<string, string>> GenerateAzureRoles(List<Dictionary<string, string>> users) => new();
        private static List<Dictionary<string, string>> GenerateSqlDatabases(string[] departments, List<Dictionary<string, string>> users) => new();
        
        // Header definitions
        private static string[] GetUserHeaders() => new[] { "UPN", "Sam", "Sid", "Mail", "DisplayName", "Enabled", "OU", "ManagerSid", "Dept", "AzureObjectId", "Groups", "DiscoveryTimestamp", "DiscoveryModule", "SessionId" };
        private static string[] GetGroupHeaders() => new[] { "Sid", "Name", "Type", "Members", "DiscoveryTimestamp", "DiscoveryModule", "SessionId", "NestedGroups" };
        private static string[] GetDeviceHeaders() => new[] { "Name", "DNS", "OU", "OS", "PrimaryUserSid", "InstalledApps", "DiscoveryTimestamp", "DiscoveryModule", "SessionId" };
        private static string[] GetApplicationHeaders() => new[] { "Id", "Name", "Source", "InstallCounts", "Executables", "Publishers", "DiscoveryTimestamp", "DiscoveryModule", "SessionId" };
        private static string[] GetGPOHeaders() => new[] { "Guid", "Name", "Links", "SecurityFilter", "WmiFilter", "Enabled", "DiscoveryTimestamp", "DiscoveryModule", "SessionId" };
        private static string[] GetACLHeaders() => new[] { "Path", "IdentitySid", "Rights", "Inherited", "IsShare", "IsNTFS", "DiscoveryTimestamp", "DiscoveryModule", "SessionId" };
        private static string[] GetMailboxHeaders() => new[] { "UPN", "DisplayName", "PrimarySmtpAddress", "TotalSize", "ProhibitSendQuota", "MailboxType", "DiscoveryTimestamp", "DiscoveryModule", "SessionId" };
        private static string[] GetMappedDriveHeaders() => new[] { "UserSid", "DriveLetter", "Path", "Persistent", "DiscoveryTimestamp", "DiscoveryModule", "SessionId" };
        private static string[] GetAzureRoleHeaders() => new[] { "PrincipalId", "RoleDefinitionId", "RoleName", "Scope", "AssignmentType", "DiscoveryTimestamp", "DiscoveryModule", "SessionId" };
        private static string[] GetSqlHeaders() => new[] { "DatabaseName", "ServerName", "Owner", "SizeMB", "LastBackup", "DiscoveryTimestamp", "DiscoveryModule", "SessionId" };
        private static string[] GetThreatHeaders() => new[] { "ThreatId", "AssetId", "AssetType", "ThreatCategory", "ThreatType", "Severity", "Status", "Description", "DetectionTime", "Remediation", "AffectedUsers", "DiscoveryTimestamp", "DiscoveryModule", "SessionId" };
        private static string[] GetGovernanceHeaders() => new[] { "AssetId", "AssetName", "AssetType", "DataClassification", "Owner", "DataSteward", "ComplianceStatus", "RetentionPolicy", "LastReviewDate", "NextReviewDate", "DataSources", "BusinessCriticality", "DiscoveryTimestamp", "DiscoveryModule", "SessionId" };
        private static string[] GetLineageHeaders() => new[] { "LineageId", "SourceAsset", "SourceType", "TargetAsset", "TargetType", "FlowType", "DataElements", "TransformationType", "LastFlowTime", "FlowFrequency", "DataVolume", "BusinessProcess", "DiscoveryTimestamp", "DiscoveryModule", "SessionId" };
        private static string[] GetExternalIdentityHeaders() => new[] { "ExternalId", "ExternalUPN", "Provider", "ProviderType", "InternalUserSid", "InternalUPN", "MappingStatus", "MappingAccuracy", "LastSyncTime", "Attributes", "Roles", "TrustLevel", "DiscoveryTimestamp", "DiscoveryModule", "SessionId" };
    }
}