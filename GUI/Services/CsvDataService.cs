using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Runtime.CompilerServices;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using MandADiscoverySuite.Models;

namespace MandADiscoverySuite.Services
{
    /// <summary>
    /// Service for loading and parsing CSV discovery data
    /// </summary>
    public class CsvDataService : IDataService
    {
        /// <summary>
        /// Loads user data from CSV files as an asynchronous stream for incremental loading
        /// </summary>
        public async IAsyncEnumerable<UserData> LoadUsersAsyncEnumerable(string rawDataPath, [EnumeratorCancellation] CancellationToken cancellationToken = default)
        {
            var userFiles = new[]
            {
                Path.Combine(rawDataPath, "Users.csv"),
                Path.Combine(rawDataPath, "AzureUsers.csv"),
                Path.Combine(rawDataPath, "ActiveDirectoryUsers.csv"),
                Path.Combine(rawDataPath, "EntraIDUsers.csv"),
                Path.Combine(rawDataPath, "DirectoryUsers.csv")
            };

            var allCsvFiles = Directory.GetFiles(rawDataPath, "*.csv", SearchOption.TopDirectoryOnly);
            var additionalUserFiles = allCsvFiles.Where(f => 
            {
                var fileName = Path.GetFileNameWithoutExtension(f).ToLower();
                return fileName.Contains("user") || fileName.Equals("tenant");
            }).ToArray();
            
            userFiles = userFiles.Concat(additionalUserFiles).Distinct().ToArray();

            foreach (var filePath in userFiles)
            {
                if (File.Exists(filePath))
                {
                    await foreach (var user in LoadUsersFromCsvAsyncEnumerable(filePath, cancellationToken))
                    {
                        yield return user;
                    }
                }
            }
        }

        /// <summary>
        /// Loads users from a single CSV file as an asynchronous stream
        /// </summary>
        private async IAsyncEnumerable<UserData> LoadUsersFromCsvAsyncEnumerable(string filePath, [EnumeratorCancellation] CancellationToken cancellationToken = default)
        {
            using var reader = new StreamReader(filePath);
            var headerLine = await reader.ReadLineAsync();
            if (string.IsNullOrEmpty(headerLine)) yield break;

            var headers = ParseCsvLine(headerLine);

            while (!reader.EndOfStream && !cancellationToken.IsCancellationRequested)
            {
                var line = await reader.ReadLineAsync();
                if (string.IsNullOrEmpty(line)) continue;

                var values = ParseCsvLine(line);
                if (values.Length < headers.Length) continue;

                var user = new UserData();

                for (int j = 0; j < headers.Length && j < values.Length; j++)
                {
                    var header = headers[j].ToLowerInvariant();
                    var value = values[j];

                    switch (header)
                    {
                        case "id": user.Id = value; break;
                        case "objecttype": user.ObjectType = value; break;
                        case "displayname": user.DisplayName = value; break;
                        case "userprincipalname": user.UserPrincipalName = value; break;
                        case "mail":
                        case "email": user.Mail = value; break;
                        case "department": user.Department = value; break;
                        case "jobtitle": user.JobTitle = value; break;
                        case "accountenabled": user.AccountEnabled = ParseBool(value); break;
                        case "onpremisessamaccountname":
                        case "samaccountname": user.SamAccountName = value; break;
                        case "givenname": user.GivenName = value; break;
                        case "surname": user.Surname = value; break;
                        case "companyname": user.CompanyName = value; break;
                        case "city": user.City = value; break;
                        case "country": user.Country = value; break;
                        case "mobilephone": user.MobilePhone = value; break;
                        case "managerdisplayname": user.ManagerDisplayName = value; break;
                        case "createddatetime": user.CreatedDateTime = value; break;
                        case "lastsignindatetime": user.LastSignInDateTime = value; break;
                        case "groupmembershipcount": user.GroupMembershipCount = value; break;
                        case "assignedlicenses": user.AssignedLicenses = value; break;
                    }
                }

                if (!string.IsNullOrWhiteSpace(user.DisplayName) || 
                    !string.IsNullOrWhiteSpace(user.UserPrincipalName) ||
                    !string.IsNullOrWhiteSpace(user.SamAccountName))
                {
                    yield return user;
                }
            }
        }
        /// <summary>
        /// Loads user data from CSV files
        /// </summary>
        public async Task<List<UserData>> LoadUsersAsync(string rawDataPath)
        {
            var users = new List<UserData>();

            try
            {
                System.Diagnostics.Debug.WriteLine($"CsvDataService.LoadUsersAsync: Looking for user files in {rawDataPath}");
                
                // Look for user CSV files with various naming patterns
                var userFiles = new[]
                {
                    Path.Combine(rawDataPath, "Users.csv"),
                    Path.Combine(rawDataPath, "AzureUsers.csv"),
                    Path.Combine(rawDataPath, "ActiveDirectoryUsers.csv"),
                    Path.Combine(rawDataPath, "EntraIDUsers.csv"),
                    Path.Combine(rawDataPath, "DirectoryUsers.csv")
                };

                // Also scan for any CSV file that might contain user data
                var allCsvFiles = Directory.GetFiles(rawDataPath, "*.csv", SearchOption.TopDirectoryOnly);
                var additionalUserFiles = allCsvFiles.Where(f => 
                {
                    var fileName = Path.GetFileNameWithoutExtension(f).ToLower();
                    return fileName.Contains("user") || fileName.Equals("tenant");
                }).ToArray();
                
                userFiles = userFiles.Concat(additionalUserFiles).Distinct().ToArray();

                foreach (var filePath in userFiles)
                {
                    if (File.Exists(filePath))
                    {
                        System.Diagnostics.Debug.WriteLine($"CsvDataService.LoadUsersAsync: Loading from {filePath}");
                        try
                        {
                            var fileUsers = await LoadUsersFromCsvAsync(filePath);
                            users.AddRange(fileUsers);
                            System.Diagnostics.Debug.WriteLine($"CsvDataService.LoadUsersAsync: Loaded {fileUsers.Count} users from {Path.GetFileName(filePath)}");
                        }
                        catch (Exception fileEx)
                        {
                            System.Diagnostics.Debug.WriteLine($"CsvDataService.LoadUsersAsync: Error loading {filePath}: {fileEx.Message}");
                            ErrorHandlingService.Instance.HandleException(fileEx, $"Loading user data from {Path.GetFileName(filePath)}");
                        }
                    }
                }

                // Remove duplicates based on UserPrincipalName or SamAccountName
                var originalCount = users.Count;
                users = users
                    .GroupBy(u => u.UserPrincipalName ?? u.SamAccountName ?? u.Id)
                    .Select(g => g.First())
                    .ToList();
                
                System.Diagnostics.Debug.WriteLine($"CsvDataService.LoadUsersAsync: Deduplicated {originalCount} -> {users.Count} users");
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"CsvDataService.LoadUsersAsync: Exception: {ex.Message}");
                ErrorHandlingService.Instance.HandleException(ex, "Loading user data from CSV");
            }

            return users;
        }

        /// <summary>
        /// Loads infrastructure data from CSV files
        /// </summary>
        public async Task<List<InfrastructureData>> LoadInfrastructureAsync(string rawDataPath)
        {
            var infrastructure = new List<InfrastructureData>();

            try
            {
                // Look for infrastructure CSV files
                var infrastructureFiles = Directory.GetFiles(rawDataPath, "*.csv", SearchOption.TopDirectoryOnly)
                    .Where(f => IsInfrastructureFile(Path.GetFileName(f)))
                    .ToArray();

                foreach (var filePath in infrastructureFiles)
                {
                    var fileInfrastructure = await LoadInfrastructureFromCsvAsync(filePath);
                    infrastructure.AddRange(fileInfrastructure);
                }
            }
            catch (Exception ex)
            {
                ErrorHandlingService.Instance.HandleException(ex, "Loading infrastructure data from CSV");
            }

            return infrastructure;
        }

        /// <summary>
        /// Loads application data from CSV files
        /// </summary>
        public async Task<List<ApplicationData>> LoadApplicationsAsync(string rawDataPath)
        {
            var applications = new List<ApplicationData>();

            try
            {
                // Look for application CSV files
                var applicationFiles = new[]
                {
                    Path.Combine(rawDataPath, "Applications.csv"),
                    Path.Combine(rawDataPath, "InstalledApplications.csv"),
                    Path.Combine(rawDataPath, "EntraIDAppRegistrations.csv"),
                    Path.Combine(rawDataPath, "EntraIDEnterpriseApps.csv"),
                    Path.Combine(rawDataPath, "AzureApplications.csv"),
                    Path.Combine(rawDataPath, "EntraIDApplicationSecrets.csv")
                };

                foreach (var filePath in applicationFiles.Where(File.Exists))
                {
                    var fileApplications = await LoadApplicationsFromCsvAsync(filePath);
                    applications.AddRange(fileApplications);
                }

                // Remove duplicates based on Name or Id
                applications = applications
                    .GroupBy(a => a.Id ?? a.Name ?? Guid.NewGuid().ToString())
                    .Select(g => g.First())
                    .ToList();
            }
            catch (Exception ex)
            {
                ErrorHandlingService.Instance.HandleException(ex, "Loading application data from CSV");
            }

            return applications;
        }

        /// <summary>
        /// Loads group data from CSV files
        /// </summary>
        public async Task<List<GroupData>> LoadGroupsAsync(string rawDataPath)
        {
            var groups = new List<GroupData>();

            try
            {
                // Look for group CSV files
                var groupFiles = new[]
                {
                    Path.Combine(rawDataPath, "Groups.csv"),
                    Path.Combine(rawDataPath, "AzureGroups.csv"),
                    Path.Combine(rawDataPath, "ActiveDirectoryGroups.csv"),
                    Path.Combine(rawDataPath, "ExchangeDistributionGroups.csv")
                };

                foreach (var filePath in groupFiles.Where(File.Exists))
                {
                    var fileGroups = await LoadGroupsFromCsvAsync(filePath);
                    groups.AddRange(fileGroups);
                }

                // Remove duplicates
                groups = groups
                    .GroupBy(g => g.Id ?? g.DisplayName)
                    .Select(g => g.First())
                    .ToList();
            }
            catch (Exception ex)
            {
                ErrorHandlingService.Instance.HandleException(ex, "Loading group data from CSV");
            }

            return groups;
        }

        private async Task<List<UserData>> LoadUsersFromCsvAsync(string filePath)
        {
            // Use Task.Run to offload CPU-bound CSV parsing from the UI thread
            return await Task.Run(async () =>
            {
                var users = new List<UserData>();

                try
                {
                    var lines = await File.ReadAllLinesAsync(filePath);
                    if (lines.Length < 2) return users; // No data

                    var headers = ParseCsvLine(lines[0]);
                    
                    for (int i = 1; i < lines.Length; i++)
                    {
                        try
                        {
                            var values = ParseCsvLine(lines[i]);
                            if (values.Length < headers.Length) continue;

                            var user = new UserData();
                        
                        // Map CSV columns to user properties
                        for (int j = 0; j < headers.Length && j < values.Length; j++)
                        {
                            var header = headers[j].ToLowerInvariant();
                            var value = values[j];

                            switch (header)
                            {
                                case "id":
                                    user.Id = value;
                                    break;
                                case "objecttype":
                                    user.ObjectType = value;
                                    break;
                                case "displayname":
                                    user.DisplayName = value;
                                    break;
                                case "userprincipalname":
                                    user.UserPrincipalName = value;
                                    break;
                                case "mail":
                                case "email":
                                    user.Mail = value;
                                    break;
                                case "department":
                                    user.Department = value;
                                    break;
                                case "jobtitle":
                                    user.JobTitle = value;
                                    break;
                                case "accountenabled":
                                    user.AccountEnabled = ParseBool(value);
                                    break;
                                case "onpremisessamaccountname":
                                case "samaccountname":
                                    user.SamAccountName = value;
                                    break;
                                case "givenname":
                                    user.GivenName = value;
                                    break;
                                case "surname":
                                    user.Surname = value;
                                    break;
                                case "companyname":
                                    user.CompanyName = value;
                                    break;
                                case "city":
                                    user.City = value;
                                    break;
                                case "country":
                                    user.Country = value;
                                    break;
                                case "mobilephone":
                                    user.MobilePhone = value;
                                    break;
                                case "managerdisplayname":
                                    user.ManagerDisplayName = value;
                                    break;
                                case "createddatetime":
                                    user.CreatedDateTime = value;
                                    break;
                                case "lastsignindatetime":
                                    user.LastSignInDateTime = value;
                                    break;
                                case "groupmembershipcount":
                                    user.GroupMembershipCount = value;
                                    break;
                                case "assignedlicenses":
                                    user.AssignedLicenses = value;
                                    break;
                            }
                        }

                        // Only add users with meaningful data
                        if (!string.IsNullOrWhiteSpace(user.DisplayName) || 
                            !string.IsNullOrWhiteSpace(user.UserPrincipalName) ||
                            !string.IsNullOrWhiteSpace(user.SamAccountName))
                        {
                            users.Add(user);
                        }
                    }
                    catch (Exception ex)
                    {
                        // Skip malformed rows but continue processing
                        System.Diagnostics.Debug.WriteLine($"Error parsing user row {i}: {ex.Message}");
                    }
                }
                }
                catch (Exception ex)
                {
                    ErrorHandlingService.Instance.HandleException(ex, $"Loading users from {filePath}");
                }

                return users;
            });
        }

        /// <summary>
        /// Streams users from a CSV file asynchronously for immediate UI feedback
        /// </summary>
        private async IAsyncEnumerable<UserData> LoadUsersFromCsvStreamAsync(string filePath, [EnumeratorCancellation] CancellationToken cancellationToken = default)
        {
            if (!File.Exists(filePath)) yield break;

            using var reader = new StreamReader(filePath);
            
            // Read header line
            var headerLine = await reader.ReadLineAsync();
            if (headerLine == null) yield break;
            
            var headers = ParseCsvLine(headerLine);
            string line;
            int lineNumber = 1;
            
            // Stream each line as we read it
            while ((line = await reader.ReadLineAsync()) != null)
            {
                cancellationToken.ThrowIfCancellationRequested();
                lineNumber++;
                
                UserData user = null;
                
                try
                {
                    var values = ParseCsvLine(line);
                    if (values.Length < headers.Length) continue;

                    user = new UserData();
                    
                    // Map CSV columns to user properties
                    for (int j = 0; j < headers.Length && j < values.Length; j++)
                    {
                        var header = headers[j].ToLowerInvariant();
                        var value = values[j];

                        switch (header)
                        {
                            case "id":
                                user.Id = value;
                                break;
                            case "displayname":
                            case "name":
                                user.DisplayName = value;
                                // Name is a readonly property that returns DisplayName
                                break;
                            case "userprincipalname":
                                user.UserPrincipalName = value;
                                break;
                            case "samaccountname":
                                user.SamAccountName = value;
                                break;
                            case "mail":
                            case "email":
                                user.Mail = value;
                                // Email is a readonly property that returns Mail
                                break;
                            case "department":
                                user.Department = value;
                                break;
                            case "jobtitle":
                                user.JobTitle = value;
                                break;
                            case "status":
                            case "accountenabled":
                                user.AccountEnabled = ParseBool(value);
                                // Status is a readonly property based on AccountEnabled
                                break;
                        }
                    }
                }
                catch (Exception ex)
                {
                    System.Diagnostics.Debug.WriteLine($"Error parsing user row {lineNumber}: {ex.Message}");
                    user = null;
                }
                
                // Only yield users with meaningful data (outside of try-catch)
                if (user != null && 
                    (!string.IsNullOrWhiteSpace(user.DisplayName) || 
                     !string.IsNullOrWhiteSpace(user.UserPrincipalName) ||
                     !string.IsNullOrWhiteSpace(user.SamAccountName)))
                {
                    yield return user;
                }
            }
        }

        private async Task<List<InfrastructureData>> LoadInfrastructureFromCsvAsync(string filePath)
        {
            // Use Task.Run to offload CPU-bound CSV parsing from the UI thread
            return await Task.Run(async () =>
            {
                var infrastructure = new List<InfrastructureData>();

                try
                {
                var lines = await File.ReadAllLinesAsync(filePath);
                if (lines.Length < 2) return infrastructure;

                var headers = ParseCsvLine(lines[0]);
                var fileName = Path.GetFileNameWithoutExtension(filePath);
                
                for (int i = 1; i < lines.Length; i++)
                {
                    try
                    {
                        var values = ParseCsvLine(lines[i]);
                        if (values.Length < headers.Length) continue;

                        var device = new InfrastructureData
                        {
                            Type = DetermineInfrastructureType(fileName)
                        };
                        
                        // Map CSV columns to infrastructure properties
                        for (int j = 0; j < headers.Length && j < values.Length; j++)
                        {
                            var header = headers[j].ToLowerInvariant();
                            var value = values[j];

                            switch (header)
                            {
                                case "id":
                                case "deviceid":
                                case "computername":
                                case "hostname":
                                    device.Id = value;
                                    device.Name = device.Name ?? value;
                                    break;
                                case "name":
                                case "displayname":
                                case "devicename":
                                    device.Name = value;
                                    break;
                                case "description":
                                    device.Description = value;
                                    break;
                                case "ipaddress":
                                case "ip":
                                    device.IPAddress = value;
                                    break;
                                case "operatingsystem":
                                case "os":
                                    device.OperatingSystem = value;
                                    break;
                                case "version":
                                case "osversion":
                                    device.Version = value;
                                    break;
                                case "location":
                                case "site":
                                    device.Location = value;
                                    break;
                                case "status":
                                case "state":
                                    device.Status = value;
                                    break;
                                case "manufacturer":
                                    device.Manufacturer = value;
                                    break;
                                case "model":
                                    device.Model = value;
                                    break;
                                case "lastseen":
                                case "lastcontacttime":
                                    device.LastSeen = value;
                                    break;
                            }
                        }

                        // Set default values
                        device.Status = device.Status ?? "Unknown";
                        device.Name = device.Name ?? device.Id ?? "Unknown Device";

                        infrastructure.Add(device);
                    }
                    catch (Exception ex)
                    {
                        System.Diagnostics.Debug.WriteLine($"Error parsing infrastructure row {i}: {ex.Message}");
                    }
                }
            }
            catch (Exception ex)
            {
                ErrorHandlingService.Instance.HandleException(ex, $"Loading infrastructure from {filePath}");
                }

                return infrastructure;
            });
        }

        private async Task<List<ApplicationData>> LoadApplicationsFromCsvAsync(string filePath)
        {
            // Use Task.Run to offload CPU-bound CSV parsing from the UI thread
            return await Task.Run(async () =>
            {
                var applications = new List<ApplicationData>();

                try
            {
                var lines = await File.ReadAllLinesAsync(filePath);
                if (lines.Length < 2) return applications;

                var headers = ParseCsvLine(lines[0]);
                
                for (int i = 1; i < lines.Length; i++)
                {
                    try
                    {
                        var values = ParseCsvLine(lines[i]);
                        if (values.Length < headers.Length) continue;

                        var application = new ApplicationData();
                        
                        // Map CSV columns to application properties
                        for (int j = 0; j < headers.Length && j < values.Length; j++)
                        {
                            var header = headers[j].ToLowerInvariant();
                            var value = values[j];

                            switch (header)
                            {
                                case "id":
                                case "appid":
                                case "applicationid":
                                    application.Id = value;
                                    break;
                                case "objecttype":
                                    application.ObjectType = value;
                                    break;
                                case "name":
                                case "displayname":
                                case "applicationname":
                                    application.Name = value;
                                    break;
                                case "version":
                                    application.Version = value;
                                    break;
                                case "publisher":
                                case "vendor":
                                    application.Publisher = value;
                                    break;
                                case "installdate":
                                case "installedon":
                                    application.InstallDate = value;
                                    break;
                                case "size":
                                case "filesize":
                                    application.Size = value;
                                    break;
                                case "installlocation":
                                    application.InstallLocation = value;
                                    break;
                                case "uninstallstring":
                                    application.UninstallString = value;
                                    break;
                                case "displayicon":
                                    application.DisplayIcon = value;
                                    break;
                                case "comments":
                                    application.Comments = value;
                                    break;
                                case "contact":
                                    application.Contact = value;
                                    break;
                                case "displayversion":
                                    application.DisplayVersion = value;
                                    break;
                                case "helplink":
                                    application.HelpLink = value;
                                    break;
                                case "urlinfoabout":
                                    application.URLInfoAbout = value;
                                    break;
                            }
                        }

                        // Only add applications with meaningful data
                        if (!string.IsNullOrWhiteSpace(application.Name))
                        {
                            applications.Add(application);
                        }
                    }
                    catch (Exception ex)
                    {
                        System.Diagnostics.Debug.WriteLine($"Error parsing application row {i}: {ex.Message}");
                    }
                }
                }
                catch (Exception ex)
                {
                    ErrorHandlingService.Instance.HandleException(ex, $"Loading applications from {filePath}");
                }

                return applications;
            });
        }

        private async Task<List<GroupData>> LoadGroupsFromCsvAsync(string filePath)
        {
            // Use Task.Run to offload CPU-bound CSV parsing from the UI thread
            return await Task.Run(async () =>
            {
                var groups = new List<GroupData>();

                try
            {
                var lines = await File.ReadAllLinesAsync(filePath);
                if (lines.Length < 2) return groups;

                var headers = ParseCsvLine(lines[0]);
                
                for (int i = 1; i < lines.Length; i++)
                {
                    try
                    {
                        var values = ParseCsvLine(lines[i]);
                        if (values.Length < headers.Length) continue;

                        var group = new GroupData();
                        
                        // Map CSV columns to group properties
                        for (int j = 0; j < headers.Length && j < values.Length; j++)
                        {
                            var header = headers[j].ToLowerInvariant();
                            var value = values[j];

                            switch (header)
                            {
                                case "id":
                                    group.Id = value;
                                    break;
                                case "objecttype":
                                    group.ObjectType = value;
                                    break;
                                case "displayname":
                                    group.DisplayName = value;
                                    break;
                                case "description":
                                    group.Description = value;
                                    break;
                                case "grouptypes":
                                    group.GroupType = value;
                                    break;
                                case "mailenabled":
                                    group.MailEnabled = ParseBool(value);
                                    break;
                                case "securityenabled":
                                    group.SecurityEnabled = ParseBool(value);
                                    break;
                                case "mail":
                                    group.Mail = value;
                                    break;
                                case "createddatetime":
                                    group.CreatedDateTime = value;
                                    break;
                                case "membercount":
                                    group.MemberCount = value;
                                    break;
                                case "ownercount":
                                    group.OwnerCount = value;
                                    break;
                                case "visibility":
                                    group.Visibility = value;
                                    break;
                            }
                        }

                        if (!string.IsNullOrWhiteSpace(group.DisplayName))
                        {
                            groups.Add(group);
                        }
                    }
                    catch (Exception ex)
                    {
                        System.Diagnostics.Debug.WriteLine($"Error parsing group row {i}: {ex.Message}");
                    }
                }
                }
                catch (Exception ex)
                {
                    ErrorHandlingService.Instance.HandleException(ex, $"Loading groups from {filePath}");
                }

                return groups;
            });
        }

        private bool IsInfrastructureFile(string fileName)
        {
            var infrastructureFiles = new[]
            {
                "PhysicalServer_", "Security_", "NetworkInfrastructure", "VMware", "Intune",
                "SQLServer_", "Certificate_", "Applications.csv", "ServicePrincipals.csv",
                "EntraIDServicePrincipals", "AzureApplications", "EntraIDAppRegistrations",
                "EntraIDEnterpriseApps", "AzureResourceGroups", "PowerPlatform_"
            };

            return infrastructureFiles.Any(pattern => fileName.StartsWith(pattern, StringComparison.OrdinalIgnoreCase));
        }

        private string DetermineInfrastructureType(string fileName)
        {
            if (fileName.StartsWith("PhysicalServer", StringComparison.OrdinalIgnoreCase))
                return "Physical Server";
            if (fileName.StartsWith("Security_", StringComparison.OrdinalIgnoreCase))
                return "Security Device";
            if (fileName.StartsWith("NetworkInfrastructure", StringComparison.OrdinalIgnoreCase))
                return "Network Device";
            if (fileName.StartsWith("VMware", StringComparison.OrdinalIgnoreCase))
                return "Virtual Machine";
            if (fileName.StartsWith("SQLServer", StringComparison.OrdinalIgnoreCase))
                return "Database Server";
            if (fileName.StartsWith("Certificate", StringComparison.OrdinalIgnoreCase))
                return "Certificate";
            if (fileName.StartsWith("AzureResourceGroups", StringComparison.OrdinalIgnoreCase))
                return "Azure Resource";
            if (fileName.StartsWith("PowerPlatform", StringComparison.OrdinalIgnoreCase))
                return "Power Platform";
            if (fileName.Contains("Application", StringComparison.OrdinalIgnoreCase))
                return "Application";
            if (fileName.Contains("ServicePrincipal", StringComparison.OrdinalIgnoreCase))
                return "Service Principal";

            return "Unknown";
        }

        private string[] ParseCsvLine(string line)
        {
            var values = new List<string>();
            bool inQuotes = false;
            var currentValue = "";

            for (int i = 0; i < line.Length; i++)
            {
                char c = line[i];

                if (c == '"' && (i == 0 || line[i - 1] != '\\'))
                {
                    inQuotes = !inQuotes;
                }
                else if (c == ',' && !inQuotes)
                {
                    values.Add(currentValue.Trim('"'));
                    currentValue = "";
                }
                else
                {
                    currentValue += c;
                }
            }

            values.Add(currentValue.Trim('"'));
            return values.ToArray();
        }

        private bool ParseBool(string value)
        {
            if (string.IsNullOrWhiteSpace(value)) return false;
            
            return value.Equals("true", StringComparison.OrdinalIgnoreCase) ||
                   value.Equals("yes", StringComparison.OrdinalIgnoreCase) ||
                   value.Equals("1", StringComparison.OrdinalIgnoreCase);
        }

        #region IDataService Implementation

        private readonly ILogger<CsvDataService> _logger;
        private readonly IntelligentCacheService _cacheService;

        public CsvDataService(ILogger<CsvDataService> logger, IntelligentCacheService cacheService)
        {
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
            _cacheService = cacheService ?? throw new ArgumentNullException(nameof(cacheService));
        }

        // Parameterless constructor for backward compatibility
        public CsvDataService() : this(null, null) { }

        public async Task<IEnumerable<UserData>> LoadUsersAsync(string profileName, bool forceRefresh = false, CancellationToken cancellationToken = default)
        {
            var cacheKey = $"Users_{profileName}";
            
            if (!forceRefresh && _cacheService != null)
            {
                var cached = _cacheService.GetOrCreate<List<UserData>>(cacheKey, () => null);
                if (cached != null)
                {
                    _logger?.LogInformation($"Loaded {cached.Count} users from cache for profile {profileName}");
                    return cached;
                }
            }

            var allDataPaths = GetAllDataPaths(profileName);
            var allUsers = new List<UserData>();
            
            foreach (var dataPath in allDataPaths)
            {
                var users = await LoadUsersAsync(dataPath);
                allUsers.AddRange(users);
            }
            
            // Remove duplicates based on UserPrincipalName or SamAccountName
            allUsers = allUsers
                .GroupBy(u => u.UserPrincipalName ?? u.SamAccountName ?? u.Id)
                .Select(g => g.First())
                .ToList();
            
            if (_cacheService != null)
            {
                await _cacheService.SetAsync(cacheKey, allUsers, TimeSpan.FromMinutes(15));
            }

            _logger?.LogInformation($"Loaded {allUsers.Count} users for profile {profileName}");
            return allUsers;
        }

        /// <summary>
        /// Streams users asynchronously for large datasets with immediate UI feedback
        /// </summary>
        public async IAsyncEnumerable<UserData> LoadUsersStreamAsync(string profileName, [EnumeratorCancellation] CancellationToken cancellationToken = default)
        {
            var allDataPaths = GetAllDataPaths(profileName);
            
            foreach (var dataPath in allDataPaths)
            {
                await foreach (var user in LoadUsersFromCsvStreamAsync(dataPath, cancellationToken))
                {
                    cancellationToken.ThrowIfCancellationRequested();
                    yield return user;
                }
            }
        }

        public async Task<IEnumerable<InfrastructureData>> LoadInfrastructureAsync(string profileName, bool forceRefresh = false, CancellationToken cancellationToken = default)
        {
            var cacheKey = $"Infrastructure_{profileName}";
            
            if (!forceRefresh && _cacheService != null)
            {
                var cached = _cacheService.GetOrCreate<List<InfrastructureData>>(cacheKey, () => null);
                if (cached != null)
                {
                    _logger?.LogInformation($"Loaded {cached.Count} infrastructure items from cache for profile {profileName}");
                    return cached;
                }
            }

            var allDataPaths = GetAllDataPaths(profileName);
            var allInfrastructure = new List<InfrastructureData>();
            
            foreach (var dataPath in allDataPaths)
            {
                var infrastructure = await LoadInfrastructureAsync(dataPath);
                allInfrastructure.AddRange(infrastructure);
            }
            
            // Remove duplicates based on Name and Type
            allInfrastructure = allInfrastructure
                .GroupBy(i => new { i.Name, i.Type })
                .Select(g => g.First())
                .ToList();
            
            if (_cacheService != null)
            {
                await _cacheService.SetAsync(cacheKey, allInfrastructure, TimeSpan.FromMinutes(15));
            }

            _logger?.LogInformation($"Loaded {allInfrastructure.Count} infrastructure items for profile {profileName}");
            return allInfrastructure;
        }

        public async Task<IEnumerable<GroupData>> LoadGroupsAsync(string profileName, bool forceRefresh = false, CancellationToken cancellationToken = default)
        {
            var cacheKey = $"Groups_{profileName}";
            
            if (!forceRefresh && _cacheService != null)
            {
                var cached = _cacheService.GetOrCreate<List<GroupData>>(cacheKey, () => null);
                if (cached != null)
                {
                    _logger?.LogInformation($"Loaded {cached.Count} groups from cache for profile {profileName}");
                    return cached;
                }
            }

            var allDataPaths = GetAllDataPaths(profileName);
            var allGroups = new List<GroupData>();
            
            foreach (var dataPath in allDataPaths)
            {
                var groups = await LoadGroupsAsync(dataPath);
                allGroups.AddRange(groups);
            }
            
            // Remove duplicates based on Name and Type
            allGroups = allGroups
                .GroupBy(g => new { g.Name, g.Type })
                .Select(g => g.First())
                .ToList();
            
            if (_cacheService != null)
            {
                await _cacheService.SetAsync(cacheKey, allGroups, TimeSpan.FromMinutes(15));
            }

            _logger?.LogInformation($"Loaded {allGroups.Count} groups for profile {profileName}");
            return allGroups;
        }

        public async Task<IEnumerable<ApplicationData>> LoadApplicationsAsync(string profileName, bool forceRefresh = false, CancellationToken cancellationToken = default)
        {
            var cacheKey = $"Applications_{profileName}";
            
            if (!forceRefresh && _cacheService != null)
            {
                var cached = _cacheService.GetOrCreate<List<ApplicationData>>(cacheKey, () => null);
                if (cached != null)
                {
                    _logger?.LogInformation($"Loaded {cached.Count} applications from cache for profile {profileName}");
                    return cached;
                }
            }

            var allDataPaths = GetAllDataPaths(profileName);
            var allApplications = new List<ApplicationData>();
            
            foreach (var dataPath in allDataPaths)
            {
                var applications = await LoadApplicationsAsync(dataPath);
                allApplications.AddRange(applications);
            }
            
            // Remove duplicates based on Name and Version
            allApplications = allApplications
                .GroupBy(a => new { a.Name, a.Version })
                .Select(g => g.First())
                .ToList();
            
            if (_cacheService != null)
            {
                await _cacheService.SetAsync(cacheKey, allApplications, TimeSpan.FromMinutes(15));
            }

            _logger?.LogInformation($"Loaded {allApplications.Count} applications for profile {profileName}");
            return allApplications;
        }

        public async Task<DataSummary> GetDataSummaryAsync(string profileName, CancellationToken cancellationToken = default)
        {
            var summary = new DataSummary
            {
                ProfileName = profileName,
                LastUpdated = DateTime.UtcNow
            };

            try
            {
                var users = await LoadUsersAsync(profileName, false, cancellationToken);
                var infrastructure = await LoadInfrastructureAsync(profileName, false, cancellationToken);
                var groups = await LoadGroupsAsync(profileName, false, cancellationToken);
                var applications = await LoadApplicationsAsync(profileName, false, cancellationToken);

                summary.TotalUsers = users.Count();
                summary.TotalComputers = infrastructure.Count();
                summary.TotalGroups = groups.Count();
                summary.TotalApplications = applications.Count();

                // Analyze user departments
                summary.UsersByDepartment = users
                    .Where(u => !string.IsNullOrEmpty(u.Department))
                    .GroupBy(u => u.Department)
                    .ToDictionary(g => g.Key, g => g.Count());

                // Analyze OS distribution
                summary.ComputersByOperatingSystem = infrastructure
                    .Where(i => !string.IsNullOrEmpty(i.OperatingSystem))
                    .GroupBy(i => i.OperatingSystem)
                    .ToDictionary(g => g.Key, g => g.Count());

                // Determine environment type
                var hasOnPrem = infrastructure.Any(i => !string.IsNullOrEmpty(i.Domain) && !i.Domain.Contains(".onmicrosoft.com"));
                var hasCloud = users.Any(u => u.UserPrincipalName?.Contains("@") == true && u.UserPrincipalName.Contains(".onmicrosoft.com"));

                if (hasOnPrem && hasCloud)
                    summary.EnvironmentType = EnvironmentType.Hybrid;
                else if (hasCloud)
                    summary.EnvironmentType = EnvironmentType.CloudOnly;
                else if (hasOnPrem)
                    summary.EnvironmentType = EnvironmentType.OnPremisesOnly;
                else
                    summary.EnvironmentType = EnvironmentType.Unknown;
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error generating data summary for profile {ProfileName}", profileName);
            }

            return summary;
        }

        public async Task<SearchResults> SearchAsync(string profileName, string searchTerm, SearchOptions searchOptions = null, CancellationToken cancellationToken = default)
        {
            var startTime = DateTime.UtcNow;
            var results = new SearchResults
            {
                SearchTerm = searchTerm
            };

            searchOptions ??= new SearchOptions();

            try
            {
                var searchLower = searchOptions.CaseSensitive ? searchTerm : searchTerm.ToLowerInvariant();

                if (searchOptions.IncludeUsers)
                {
                    var users = await LoadUsersAsync(profileName, false, cancellationToken);
                    results.Users = users.Where(u => MatchesSearch(u, searchLower, searchOptions)).Take(searchOptions.MaxResults / 4).ToList();
                }

                if (searchOptions.IncludeComputers)
                {
                    var computers = await LoadInfrastructureAsync(profileName, false, cancellationToken);
                    results.Computers = computers.Where(c => MatchesSearch(c, searchLower, searchOptions)).Take(searchOptions.MaxResults / 4).ToList();
                }

                if (searchOptions.IncludeGroups)
                {
                    var groups = await LoadGroupsAsync(profileName, false, cancellationToken);
                    results.Groups = groups.Where(g => MatchesSearch(g, searchLower, searchOptions)).Take(searchOptions.MaxResults / 4).ToList();
                }

                if (searchOptions.IncludeApplications)
                {
                    var applications = await LoadApplicationsAsync(profileName, false, cancellationToken);
                    results.Applications = applications.Where(a => MatchesSearch(a, searchLower, searchOptions)).Take(searchOptions.MaxResults / 4).ToList();
                }

                results.TotalResults = results.Users.Count + results.Computers.Count + results.Groups.Count + results.Applications.Count;
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error performing search for term '{SearchTerm}' in profile {ProfileName}", searchTerm, profileName);
            }

            results.SearchDuration = DateTime.UtcNow - startTime;
            return results;
        }

        public async Task<ExportResult> ExportDataAsync(string profileName, ExportOptions exportOptions, CancellationToken cancellationToken = default)
        {
            // This would typically be handled by DataExportService, but implementing basic functionality
            var result = new ExportResult
            {
                Success = false,
                ErrorMessage = "Export functionality requires DataExportService implementation"
            };

            return result;
        }

        public async Task ClearCacheAsync(string profileName)
        {
            if (_cacheService != null)
            {
                var cacheKeys = new[]
                {
                    $"Users_{profileName}",
                    $"Infrastructure_{profileName}",
                    $"Groups_{profileName}",
                    $"Applications_{profileName}"
                };

                foreach (var key in cacheKeys)
                {
                    await _cacheService.RemoveAsync(key);
                }

                _logger?.LogInformation("Cleared cache for profile {ProfileName}", profileName);
            }
        }

        public async Task<CacheStatistics> GetCacheStatisticsAsync()
        {
            // Basic implementation - would be enhanced with actual cache metrics
            return new CacheStatistics
            {
                TotalEntries = 0,
                MemoryUsageBytes = 0,
                HitCount = 0,
                MissCount = 0
            };
        }

        private bool MatchesSearch(object item, string searchTerm, SearchOptions options)
        {
            var properties = item.GetType().GetProperties()
                .Where(p => p.PropertyType == typeof(string))
                .Select(p => p.GetValue(item)?.ToString() ?? string.Empty);

            foreach (var prop in properties)
            {
                var value = options.CaseSensitive ? prop : prop.ToLowerInvariant();
                
                if (options.WholeWordOnly)
                {
                    if (value.Split(' ', StringSplitOptions.RemoveEmptyEntries).Contains(searchTerm))
                        return true;
                }
                else
                {
                    if (value.Contains(searchTerm))
                        return true;
                }
            }

            return false;
        }

        /// <summary>
        /// Gets all potential data paths for a company profile
        /// </summary>
        private List<string> GetAllDataPaths(string profileName)
        {
            var dataPaths = new List<string>();
            var rootPath = ConfigurationService.Instance.DiscoveryDataRootPath;
            
            // Primary location: C:\DiscoveryData\[CompanyName]\Raw
            var primaryPath = Path.Combine(rootPath, profileName, "Raw");
            if (Directory.Exists(primaryPath))
            {
                dataPaths.Add(primaryPath);
                System.Diagnostics.Debug.WriteLine($"CsvDataService: Found primary data path: {primaryPath}");
            }
            
            // Secondary location: C:\DiscoveryData\Profiles\[CompanyName]\Raw
            var profilesPath = Path.Combine(rootPath, "Profiles", profileName, "Raw");
            if (Directory.Exists(profilesPath))
            {
                dataPaths.Add(profilesPath);
                System.Diagnostics.Debug.WriteLine($"CsvDataService: Found profiles data path: {profilesPath}");
            }
            
            // Case-insensitive fallback search
            if (!dataPaths.Any() && Directory.Exists(rootPath))
            {
                var directories = Directory.GetDirectories(rootPath);
                var matchingDir = directories.FirstOrDefault(dir => 
                    Path.GetFileName(dir).Equals(profileName, StringComparison.OrdinalIgnoreCase));
                
                if (matchingDir != null)
                {
                    var rawPath = Path.Combine(matchingDir, "Raw");
                    if (Directory.Exists(rawPath))
                    {
                        dataPaths.Add(rawPath);
                        System.Diagnostics.Debug.WriteLine($"CsvDataService: Found case-insensitive data path: {rawPath}");
                    }
                }
                
                // Also check Profiles subdirectory with case-insensitive search
                var profilesDir = Path.Combine(rootPath, "Profiles");
                if (Directory.Exists(profilesDir))
                {
                    var profileDirectories = Directory.GetDirectories(profilesDir);
                    var matchingProfileDir = profileDirectories.FirstOrDefault(dir => 
                        Path.GetFileName(dir).Equals(profileName, StringComparison.OrdinalIgnoreCase));
                    
                    if (matchingProfileDir != null)
                    {
                        var rawPath = Path.Combine(matchingProfileDir, "Raw");
                        if (Directory.Exists(rawPath))
                        {
                            dataPaths.Add(rawPath);
                            System.Diagnostics.Debug.WriteLine($"CsvDataService: Found case-insensitive profiles data path: {rawPath}");
                        }
                    }
                }
            }
            
            if (!dataPaths.Any())
            {
                System.Diagnostics.Debug.WriteLine($"CsvDataService: No data paths found for profile: {profileName}");
                // Return primary path as fallback even if it doesn't exist
                dataPaths.Add(Path.Combine(rootPath, profileName, "Raw"));
            }
            
            return dataPaths;
        }

        #endregion
    }
}