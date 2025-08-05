using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Linq;
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
        /// Loads user data from CSV files
        /// </summary>
        public async Task<List<UserData>> LoadUsersAsync(string rawDataPath)
        {
            var users = new List<UserData>();

            try
            {
                // Look for user CSV files
                var userFiles = new[]
                {
                    Path.Combine(rawDataPath, "Users.csv"),
                    Path.Combine(rawDataPath, "AzureUsers.csv"),
                    Path.Combine(rawDataPath, "ActiveDirectoryUsers.csv")
                };

                foreach (var filePath in userFiles.Where(File.Exists))
                {
                    var fileUsers = await LoadUsersFromCsvAsync(filePath);
                    users.AddRange(fileUsers);
                }

                // Remove duplicates based on UserPrincipalName or SamAccountName
                users = users
                    .GroupBy(u => u.UserPrincipalName ?? u.SamAccountName ?? u.Id)
                    .Select(g => g.First())
                    .ToList();
            }
            catch (Exception ex)
            {
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
        }

        private async Task<List<InfrastructureData>> LoadInfrastructureFromCsvAsync(string filePath)
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
        }

        private async Task<List<GroupData>> LoadGroupsFromCsvAsync(string filePath)
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
        }

        private bool IsInfrastructureFile(string fileName)
        {
            var infrastructureFiles = new[]
            {
                "PhysicalServer_", "Security_", "NetworkInfrastructure", "VMware", "Intune",
                "SQLServer_", "Certificate_", "Applications.csv", "ServicePrincipals.csv"
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

            var dataPath = ConfigurationService.Instance.GetCompanyDataPath(profileName);
            var users = await LoadUsersAsync(dataPath);
            
            if (_cacheService != null)
            {
                await _cacheService.SetAsync(cacheKey, users, TimeSpan.FromMinutes(15));
            }

            _logger?.LogInformation($"Loaded {users.Count} users for profile {profileName}");
            return users;
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

            var dataPath = ConfigurationService.Instance.GetCompanyDataPath(profileName);
            var infrastructure = await LoadInfrastructureAsync(dataPath);
            
            if (_cacheService != null)
            {
                await _cacheService.SetAsync(cacheKey, infrastructure, TimeSpan.FromMinutes(15));
            }

            _logger?.LogInformation($"Loaded {infrastructure.Count} infrastructure items for profile {profileName}");
            return infrastructure;
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

            var dataPath = ConfigurationService.Instance.GetCompanyDataPath(profileName);
            var groups = await LoadGroupsAsync(dataPath);
            
            if (_cacheService != null)
            {
                await _cacheService.SetAsync(cacheKey, groups, TimeSpan.FromMinutes(15));
            }

            _logger?.LogInformation($"Loaded {groups.Count} groups for profile {profileName}");
            return groups;
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

            var dataPath = ConfigurationService.Instance.GetCompanyDataPath(profileName);
            var applications = await LoadApplicationsAsync(dataPath);
            
            if (_cacheService != null)
            {
                await _cacheService.SetAsync(cacheKey, applications, TimeSpan.FromMinutes(15));
            }

            _logger?.LogInformation("Loaded " + applications.Count().ToString() + " applications for profile " + profileName);
            return applications;
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

        #endregion
    }
}