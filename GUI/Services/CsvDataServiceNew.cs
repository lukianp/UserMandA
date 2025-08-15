using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using MandADiscoverySuite.Models;

namespace MandADiscoverySuite.Services
{
    /// <summary>
    /// CSV data service with dynamic header verification and structured logging
    /// </summary>
    public class CsvDataServiceNew
    {
        private readonly ILogger<CsvDataServiceNew> _logger;
        private readonly string _activeProfilePath = @"C:\discoverydata\ljpops\Raw";
        private readonly string _secondaryPath = @"C:\discoverydata\Profiles\ljpops\Raw";

        public CsvDataServiceNew(ILogger<CsvDataServiceNew> logger)
        {
            _logger = logger;
        }

        #region Users Loading
        
        public async Task<DataLoaderResult<UserData>> LoadUsersAsync(string profileName)
        {
            var sw = Stopwatch.StartNew();
            var warnings = new List<string>();
            var users = new List<UserData>();
            
            var filePatterns = new[] { "*Users*.csv", "AzureUsers.csv", "ActiveDirectoryUsers.csv" };
            var expectedHeaders = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase)
            {
                ["DisplayName"] = null,
                ["UserPrincipalName"] = null,
                ["Mail"] = null,
                ["Department"] = null,
                ["JobTitle"] = null,
                ["AccountEnabled"] = null,
                ["SamAccountName"] = null,
                ["CompanyName"] = null,
                ["ManagerDisplayName"] = null,
                ["CreatedDateTime"] = null
            };

            var matchedFiles = new List<string>();
            foreach (var pattern in filePatterns)
            {
                matchedFiles.AddRange(FindFiles(_activeProfilePath, pattern));
                matchedFiles.AddRange(FindFiles(_secondaryPath, pattern));
            }

            foreach (var filePath in matchedFiles.Distinct())
            {
                try
                {
                    using var reader = new StreamReader(filePath, Encoding.UTF8, true, bufferSize: 65536);
                    
                    var headerLine = await reader.ReadLineAsync();
                    if (string.IsNullOrEmpty(headerLine)) continue;

                    var headers = ParseCsvLine(headerLine);
                    var headerMap = BuildHeaderMap(headers, expectedHeaders, Path.GetFileName(filePath), warnings);

                    var fileUsers = new List<UserData>();
                    while (!reader.EndOfStream)
                    {
                        var line = await reader.ReadLineAsync();
                        if (string.IsNullOrEmpty(line)) continue;

                        var values = ParseCsvLine(line);
                        if (values.Length < headers.Length) continue;

                        var user = new UserData(
                            DisplayName: GetMappedValue(values, headerMap["DisplayName"]),
                            UserPrincipalName: GetMappedValue(values, headerMap["UserPrincipalName"]),
                            Mail: GetMappedValue(values, headerMap["Mail"]),
                            Department: GetMappedValue(values, headerMap["Department"]),
                            JobTitle: GetMappedValue(values, headerMap["JobTitle"]),
                            AccountEnabled: ParseBool(GetMappedValue(values, headerMap["AccountEnabled"])),
                            SamAccountName: GetMappedValue(values, headerMap["SamAccountName"]),
                            CompanyName: GetMappedValue(values, headerMap["CompanyName"]),
                            ManagerDisplayName: GetMappedValue(values, headerMap["ManagerDisplayName"]),
                            CreatedDateTime: ParseDateTimeOffset(GetMappedValue(values, headerMap["CreatedDateTime"]))
                        );

                        if (!string.IsNullOrWhiteSpace(user.DisplayName) || 
                            !string.IsNullOrWhiteSpace(user.UserPrincipalName))
                        {
                            fileUsers.Add(user);
                        }
                    }

                    users.AddRange(fileUsers);
                    _logger?.LogDebug($"[CsvDataServiceNew] Loaded {fileUsers.Count} users from {Path.GetFileName(filePath)}");
                }
                catch (Exception ex)
                {
                    warnings.Add($"[Users] File '{Path.GetFileName(filePath)}': Error reading file - {ex.Message}");
                    _logger?.LogError(ex, $"[CsvDataServiceNew] Error loading users from {filePath}");
                }
            }

            // Deduplicate
            var uniqueUsers = users
                .GroupBy(u => u.UserPrincipalName ?? u.SamAccountName ?? Guid.NewGuid().ToString())
                .Select(g => g.First())
                .ToList();

            var rowsPerFile = string.Join(";", matchedFiles.Select(f => $"{Path.GetFileName(f)}:{users.Count(u => true)}"));
            _logger?.LogInformation($"[CsvDataServiceNew] loader=Users patterns={string.Join(",", filePatterns)} matched={matchedFiles.Count} rowsPerFile={rowsPerFile} total={uniqueUsers.Count} ms={sw.ElapsedMilliseconds}");

            return DataLoaderResult<UserData>.Success(uniqueUsers, warnings);
        }

        #endregion

        #region Groups Loading

        public async Task<DataLoaderResult<GroupData>> LoadGroupsAsync(string profileName)
        {
            var sw = Stopwatch.StartNew();
            var warnings = new List<string>();
            var groups = new List<GroupData>();

            var filePatterns = new[] { "*Groups*.csv", "AzureGroups.csv", "ActiveDirectoryGroups.csv", "ExchangeDistributionGroups.csv" };
            var expectedHeaders = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase)
            {
                ["DisplayName"] = null,
                ["GroupType"] = null,
                ["MailEnabled"] = null,
                ["SecurityEnabled"] = null,
                ["Mail"] = null,
                ["CreatedDateTime"] = null,
                ["MemberCount"] = null,
                ["OwnerCount"] = null,
                ["Visibility"] = null,
                ["Description"] = null
            };

            var matchedFiles = new List<string>();
            foreach (var pattern in filePatterns)
            {
                matchedFiles.AddRange(FindFiles(_activeProfilePath, pattern));
                matchedFiles.AddRange(FindFiles(_secondaryPath, pattern));
            }

            foreach (var filePath in matchedFiles.Distinct())
            {
                try
                {
                    using var reader = new StreamReader(filePath, Encoding.UTF8, true, bufferSize: 65536);
                    var headerLine = await reader.ReadLineAsync();
                    if (string.IsNullOrEmpty(headerLine)) continue;

                    var headers = ParseCsvLine(headerLine);
                    var headerMap = BuildHeaderMap(headers, expectedHeaders, Path.GetFileName(filePath), warnings);

                    var fileGroups = new List<GroupData>();
                    while (!reader.EndOfStream)
                    {
                        var line = await reader.ReadLineAsync();
                        if (string.IsNullOrEmpty(line)) continue;

                        var values = ParseCsvLine(line);
                        if (values.Length < headers.Length) continue;

                        var group = new GroupData(
                            DisplayName: GetMappedValue(values, headerMap["DisplayName"]),
                            GroupType: GetMappedValue(values, headerMap["GroupType"]),
                            MailEnabled: ParseBool(GetMappedValue(values, headerMap["MailEnabled"])),
                            SecurityEnabled: ParseBool(GetMappedValue(values, headerMap["SecurityEnabled"])),
                            Mail: GetMappedValue(values, headerMap["Mail"]),
                            CreatedDateTime: ParseDateTimeOffset(GetMappedValue(values, headerMap["CreatedDateTime"])),
                            MemberCount: ParseInt(GetMappedValue(values, headerMap["MemberCount"])),
                            OwnerCount: ParseInt(GetMappedValue(values, headerMap["OwnerCount"])),
                            Visibility: GetMappedValue(values, headerMap["Visibility"]),
                            Description: GetMappedValue(values, headerMap["Description"])
                        );

                        if (!string.IsNullOrWhiteSpace(group.DisplayName))
                        {
                            fileGroups.Add(group);
                        }
                    }

                    groups.AddRange(fileGroups);
                    _logger?.LogDebug($"[CsvDataServiceNew] Loaded {fileGroups.Count} groups from {Path.GetFileName(filePath)}");
                }
                catch (Exception ex)
                {
                    warnings.Add($"[Groups] File '{Path.GetFileName(filePath)}': Error reading file - {ex.Message}");
                    _logger?.LogError(ex, $"[CsvDataServiceNew] Error loading groups from {filePath}");
                }
            }

            var uniqueGroups = groups
                .GroupBy(g => g.DisplayName ?? Guid.NewGuid().ToString())
                .Select(g => g.First())
                .ToList();

            _logger?.LogInformation($"[CsvDataServiceNew] loader=Groups patterns={string.Join(",", filePatterns)} matched={matchedFiles.Count} total={uniqueGroups.Count} ms={sw.ElapsedMilliseconds}");

            return DataLoaderResult<GroupData>.Success(uniqueGroups, warnings);
        }

        #endregion

        #region Infrastructure Loading

        public async Task<DataLoaderResult<InfrastructureData>> LoadInfrastructureAsync(string profileName)
        {
            var sw = Stopwatch.StartNew();
            var warnings = new List<string>();
            var infrastructure = new List<InfrastructureData>();

            var filePatterns = new[] { "*Computer*.csv", "*VM*.csv", "*Server*.csv", "NetworkInfrastructure*.csv", "AzureVMs*.csv" };
            var expectedHeaders = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase)
            {
                ["Name"] = null,
                ["Type"] = null,
                ["Description"] = null,
                ["IPAddress"] = null,
                ["OperatingSystem"] = null,
                ["Version"] = null,
                ["Location"] = null,
                ["Status"] = null,
                ["Manufacturer"] = null,
                ["Model"] = null,
                ["LastSeen"] = null
            };

            var matchedFiles = new List<string>();
            foreach (var pattern in filePatterns)
            {
                matchedFiles.AddRange(FindFiles(_activeProfilePath, pattern));
                matchedFiles.AddRange(FindFiles(_secondaryPath, pattern));
            }

            foreach (var filePath in matchedFiles.Distinct())
            {
                try
                {
                    using var reader = new StreamReader(filePath, Encoding.UTF8, true, bufferSize: 65536);
                    var headerLine = await reader.ReadLineAsync();
                    if (string.IsNullOrEmpty(headerLine)) continue;

                    var headers = ParseCsvLine(headerLine);
                    var headerMap = BuildHeaderMap(headers, expectedHeaders, Path.GetFileName(filePath), warnings);

                    var fileItems = new List<InfrastructureData>();
                    while (!reader.EndOfStream)
                    {
                        var line = await reader.ReadLineAsync();
                        if (string.IsNullOrEmpty(line)) continue;

                        var values = ParseCsvLine(line);
                        if (values.Length < headers.Length) continue;

                        var item = new InfrastructureData(
                            Name: GetMappedValue(values, headerMap["Name"]),
                            Type: GetMappedValue(values, headerMap["Type"]),
                            Description: GetMappedValue(values, headerMap["Description"]),
                            IPAddress: GetMappedValue(values, headerMap["IPAddress"]),
                            OperatingSystem: GetMappedValue(values, headerMap["OperatingSystem"]),
                            Version: GetMappedValue(values, headerMap["Version"]),
                            Location: GetMappedValue(values, headerMap["Location"]),
                            Status: GetMappedValue(values, headerMap["Status"]),
                            Manufacturer: GetMappedValue(values, headerMap["Manufacturer"]),
                            Model: GetMappedValue(values, headerMap["Model"]),
                            LastSeen: ParseDateTimeOffset(GetMappedValue(values, headerMap["LastSeen"]))
                        );

                        if (!string.IsNullOrWhiteSpace(item.Name))
                        {
                            fileItems.Add(item);
                        }
                    }

                    infrastructure.AddRange(fileItems);
                    _logger?.LogDebug($"[CsvDataServiceNew] Loaded {fileItems.Count} infrastructure items from {Path.GetFileName(filePath)}");
                }
                catch (Exception ex)
                {
                    warnings.Add($"[Infrastructure] File '{Path.GetFileName(filePath)}': Error reading file - {ex.Message}");
                    _logger?.LogError(ex, $"[CsvDataServiceNew] Error loading infrastructure from {filePath}");
                }
            }

            var uniqueItems = infrastructure
                .GroupBy(i => i.Name ?? Guid.NewGuid().ToString())
                .Select(g => g.First())
                .ToList();

            _logger?.LogInformation($"[CsvDataServiceNew] loader=Infrastructure patterns={string.Join(",", filePatterns)} matched={matchedFiles.Count} total={uniqueItems.Count} ms={sw.ElapsedMilliseconds}");

            return DataLoaderResult<InfrastructureData>.Success(uniqueItems, warnings);
        }

        #endregion

        #region Applications Loading

        public async Task<DataLoaderResult<ApplicationData>> LoadApplicationsAsync(string profileName)
        {
            var sw = Stopwatch.StartNew();
            var warnings = new List<string>();
            var applications = new List<ApplicationData>();

            var filePatterns = new[] { "Applications.csv", "ServicePrincipals.csv", "AzureApplications*.csv" };
            var expectedHeaders = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase)
            {
                ["Name"] = null,
                ["Version"] = null,
                ["Publisher"] = null,
                ["Type"] = null,
                ["UserCount"] = null,
                ["GroupCount"] = null,
                ["DeviceCount"] = null,
                ["LastSeen"] = null
            };

            var matchedFiles = new List<string>();
            foreach (var pattern in filePatterns)
            {
                matchedFiles.AddRange(FindFiles(_activeProfilePath, pattern));
                matchedFiles.AddRange(FindFiles(_secondaryPath, pattern));
            }

            foreach (var filePath in matchedFiles.Distinct())
            {
                try
                {
                    using var reader = new StreamReader(filePath, Encoding.UTF8, true, bufferSize: 65536);
                    var headerLine = await reader.ReadLineAsync();
                    if (string.IsNullOrEmpty(headerLine)) continue;

                    var headers = ParseCsvLine(headerLine);
                    var headerMap = BuildHeaderMap(headers, expectedHeaders, Path.GetFileName(filePath), warnings);

                    var fileApps = new List<ApplicationData>();
                    while (!reader.EndOfStream)
                    {
                        var line = await reader.ReadLineAsync();
                        if (string.IsNullOrEmpty(line)) continue;

                        var values = ParseCsvLine(line);
                        if (values.Length < headers.Length) continue;

                        var app = new ApplicationData(
                            Name: GetMappedValue(values, headerMap["Name"]),
                            Version: GetMappedValue(values, headerMap["Version"]),
                            Publisher: GetMappedValue(values, headerMap["Publisher"]),
                            Type: GetMappedValue(values, headerMap["Type"]),
                            UserCount: ParseInt(GetMappedValue(values, headerMap["UserCount"])),
                            GroupCount: ParseInt(GetMappedValue(values, headerMap["GroupCount"])),
                            DeviceCount: ParseInt(GetMappedValue(values, headerMap["DeviceCount"])),
                            LastSeen: ParseDateTimeOffset(GetMappedValue(values, headerMap["LastSeen"]))
                        );

                        if (!string.IsNullOrWhiteSpace(app.Name))
                        {
                            fileApps.Add(app);
                        }
                    }

                    applications.AddRange(fileApps);
                    _logger?.LogDebug($"[CsvDataServiceNew] Loaded {fileApps.Count} applications from {Path.GetFileName(filePath)}");
                }
                catch (Exception ex)
                {
                    warnings.Add($"[Applications] File '{Path.GetFileName(filePath)}': Error reading file - {ex.Message}");
                    _logger?.LogError(ex, $"[CsvDataServiceNew] Error loading applications from {filePath}");
                }
            }

            var uniqueApps = applications
                .GroupBy(a => a.Name ?? Guid.NewGuid().ToString())
                .Select(g => g.First())
                .ToList();

            _logger?.LogInformation($"[CsvDataServiceNew] loader=Applications patterns={string.Join(",", filePatterns)} matched={matchedFiles.Count} total={uniqueApps.Count} ms={sw.ElapsedMilliseconds}");

            return DataLoaderResult<ApplicationData>.Success(uniqueApps, warnings);
        }

        #endregion

        #region File Servers Loading

        public async Task<DataLoaderResult<FileServerData>> LoadFileServersAsync(string profileName)
        {
            var sw = Stopwatch.StartNew();
            var warnings = new List<string>();
            var servers = new List<FileServerData>();

            var filePatterns = new[] { "FileServers.csv", "Shares.csv", "NTFS*.csv" };
            var expectedHeaders = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase)
            {
                ["ServerName"] = null,
                ["OS"] = null,
                ["Version"] = null,
                ["Location"] = null,
                ["ShareCount"] = null,
                ["TotalSizeGB"] = null,
                ["LastScan"] = null
            };

            var matchedFiles = new List<string>();
            foreach (var pattern in filePatterns)
            {
                matchedFiles.AddRange(FindFiles(_activeProfilePath, pattern));
                matchedFiles.AddRange(FindFiles(_secondaryPath, pattern));
            }

            foreach (var filePath in matchedFiles.Distinct())
            {
                try
                {
                    using var reader = new StreamReader(filePath, Encoding.UTF8, true, bufferSize: 65536);
                    var headerLine = await reader.ReadLineAsync();
                    if (string.IsNullOrEmpty(headerLine)) continue;

                    var headers = ParseCsvLine(headerLine);
                    var headerMap = BuildHeaderMap(headers, expectedHeaders, Path.GetFileName(filePath), warnings);

                    var fileServers = new List<FileServerData>();
                    while (!reader.EndOfStream)
                    {
                        var line = await reader.ReadLineAsync();
                        if (string.IsNullOrEmpty(line)) continue;

                        var values = ParseCsvLine(line);
                        if (values.Length < headers.Length) continue;

                        var server = new FileServerData(
                            ServerName: GetMappedValue(values, headerMap["ServerName"]),
                            OS: GetMappedValue(values, headerMap["OS"]),
                            Version: GetMappedValue(values, headerMap["Version"]),
                            Location: GetMappedValue(values, headerMap["Location"]),
                            ShareCount: ParseInt(GetMappedValue(values, headerMap["ShareCount"])),
                            TotalSizeGB: ParseDouble(GetMappedValue(values, headerMap["TotalSizeGB"])),
                            LastScan: ParseDateTimeOffset(GetMappedValue(values, headerMap["LastScan"]))
                        );

                        if (!string.IsNullOrWhiteSpace(server.ServerName))
                        {
                            fileServers.Add(server);
                        }
                    }

                    servers.AddRange(fileServers);
                    _logger?.LogDebug($"[CsvDataServiceNew] Loaded {fileServers.Count} file servers from {Path.GetFileName(filePath)}");
                }
                catch (Exception ex)
                {
                    warnings.Add($"[FileServers] File '{Path.GetFileName(filePath)}': Error reading file - {ex.Message}");
                    _logger?.LogError(ex, $"[CsvDataServiceNew] Error loading file servers from {filePath}");
                }
            }

            var uniqueServers = servers
                .GroupBy(s => s.ServerName ?? Guid.NewGuid().ToString())
                .Select(g => g.First())
                .ToList();

            _logger?.LogInformation($"[CsvDataServiceNew] loader=FileServers patterns={string.Join(",", filePatterns)} matched={matchedFiles.Count} total={uniqueServers.Count} ms={sw.ElapsedMilliseconds}");

            return DataLoaderResult<FileServerData>.Success(uniqueServers, warnings);
        }

        #endregion

        #region Databases Loading

        public async Task<DataLoaderResult<SqlInstanceData>> LoadDatabasesAsync(string profileName)
        {
            var sw = Stopwatch.StartNew();
            var warnings = new List<string>();
            var instances = new List<SqlInstanceData>();

            var filePatterns = new[] { "SqlServers.csv", "SqlInstances.csv", "Databases.csv" };
            var expectedHeaders = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase)
            {
                ["Server"] = null,
                ["Instance"] = null,
                ["Version"] = null,
                ["Edition"] = null,
                ["DatabaseCount"] = null,
                ["TotalSizeGB"] = null,
                ["LastSeen"] = null,
                ["Engine"] = null
            };

            var matchedFiles = new List<string>();
            foreach (var pattern in filePatterns)
            {
                matchedFiles.AddRange(FindFiles(_activeProfilePath, pattern));
                matchedFiles.AddRange(FindFiles(_secondaryPath, pattern));
            }

            foreach (var filePath in matchedFiles.Distinct())
            {
                try
                {
                    using var reader = new StreamReader(filePath, Encoding.UTF8, true, bufferSize: 65536);
                    var headerLine = await reader.ReadLineAsync();
                    if (string.IsNullOrEmpty(headerLine)) continue;

                    var headers = ParseCsvLine(headerLine);
                    var headerMap = BuildHeaderMap(headers, expectedHeaders, Path.GetFileName(filePath), warnings);

                    var fileInstances = new List<SqlInstanceData>();
                    while (!reader.EndOfStream)
                    {
                        var line = await reader.ReadLineAsync();
                        if (string.IsNullOrEmpty(line)) continue;

                        var values = ParseCsvLine(line);
                        if (values.Length < headers.Length) continue;

                        var instance = new SqlInstanceData(
                            Server: GetMappedValue(values, headerMap["Server"]),
                            Instance: GetMappedValue(values, headerMap["Instance"]),
                            Version: GetMappedValue(values, headerMap["Version"]),
                            Edition: GetMappedValue(values, headerMap["Edition"]),
                            DatabaseCount: ParseInt(GetMappedValue(values, headerMap["DatabaseCount"])),
                            TotalSizeGB: ParseDouble(GetMappedValue(values, headerMap["TotalSizeGB"])),
                            LastSeen: ParseDateTimeOffset(GetMappedValue(values, headerMap["LastSeen"])),
                            Engine: GetMappedValue(values, headerMap["Engine"])
                        );

                        if (!string.IsNullOrWhiteSpace(instance.Server))
                        {
                            fileInstances.Add(instance);
                        }
                    }

                    instances.AddRange(fileInstances);
                    _logger?.LogDebug($"[CsvDataServiceNew] Loaded {fileInstances.Count} SQL instances from {Path.GetFileName(filePath)}");
                }
                catch (Exception ex)
                {
                    warnings.Add($"[Databases] File '{Path.GetFileName(filePath)}': Error reading file - {ex.Message}");
                    _logger?.LogError(ex, $"[CsvDataServiceNew] Error loading databases from {filePath}");
                }
            }

            var uniqueInstances = instances
                .GroupBy(i => $"{i.Server}\\{i.Instance}" ?? Guid.NewGuid().ToString())
                .Select(g => g.First())
                .ToList();

            _logger?.LogInformation($"[CsvDataServiceNew] loader=Databases patterns={string.Join(",", filePatterns)} matched={matchedFiles.Count} total={uniqueInstances.Count} ms={sw.ElapsedMilliseconds}");

            return DataLoaderResult<SqlInstanceData>.Success(uniqueInstances, warnings);
        }

        #endregion

        #region Group Policies Loading

        public async Task<DataLoaderResult<PolicyData>> LoadGroupPoliciesAsync(string profileName)
        {
            var sw = Stopwatch.StartNew();
            var warnings = new List<string>();
            var policies = new List<PolicyData>();

            var filePatterns = new[] { "GPO_*.csv" };
            var expectedHeaders = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase)
            {
                ["Name"] = null,
                ["Path"] = null,
                ["Scope"] = null,
                ["LinkedOUs"] = null,
                ["Enabled"] = null,
                ["ComputerSettingsEnabled"] = null,
                ["UserSettingsEnabled"] = null,
                ["CreatedTime"] = null,
                ["ModifiedTime"] = null,
                ["Description"] = null
            };

            var matchedFiles = new List<string>();
            foreach (var pattern in filePatterns)
            {
                matchedFiles.AddRange(FindFiles(_activeProfilePath, pattern));
                matchedFiles.AddRange(FindFiles(_secondaryPath, pattern));
            }

            foreach (var filePath in matchedFiles.Distinct())
            {
                try
                {
                    using var reader = new StreamReader(filePath, Encoding.UTF8, true, bufferSize: 65536);
                    var headerLine = await reader.ReadLineAsync();
                    if (string.IsNullOrEmpty(headerLine)) continue;

                    var headers = ParseCsvLine(headerLine);
                    var headerMap = BuildHeaderMap(headers, expectedHeaders, Path.GetFileName(filePath), warnings);

                    var filePolicies = new List<PolicyData>();
                    while (!reader.EndOfStream)
                    {
                        var line = await reader.ReadLineAsync();
                        if (string.IsNullOrEmpty(line)) continue;

                        var values = ParseCsvLine(line);
                        if (values.Length < headers.Length) continue;

                        var policy = new PolicyData(
                            Name: GetMappedValue(values, headerMap["Name"]),
                            Path: GetMappedValue(values, headerMap["Path"]),
                            Scope: GetMappedValue(values, headerMap["Scope"]),
                            LinkedOUs: GetMappedValue(values, headerMap["LinkedOUs"]),
                            Enabled: ParseBool(GetMappedValue(values, headerMap["Enabled"])),
                            ComputerSettingsEnabled: ParseBool(GetMappedValue(values, headerMap["ComputerSettingsEnabled"])),
                            UserSettingsEnabled: ParseBool(GetMappedValue(values, headerMap["UserSettingsEnabled"])),
                            CreatedTime: ParseDateTimeOffset(GetMappedValue(values, headerMap["CreatedTime"])),
                            ModifiedTime: ParseDateTimeOffset(GetMappedValue(values, headerMap["ModifiedTime"])),
                            Description: GetMappedValue(values, headerMap["Description"])
                        );

                        if (!string.IsNullOrWhiteSpace(policy.Name))
                        {
                            filePolicies.Add(policy);
                        }
                    }

                    policies.AddRange(filePolicies);
                    _logger?.LogDebug($"[CsvDataServiceNew] Loaded {filePolicies.Count} policies from {Path.GetFileName(filePath)}");
                }
                catch (Exception ex)
                {
                    warnings.Add($"[GroupPolicies] File '{Path.GetFileName(filePath)}': Error reading file - {ex.Message}");
                    _logger?.LogError(ex, $"[CsvDataServiceNew] Error loading policies from {filePath}");
                }
            }

            var uniquePolicies = policies
                .GroupBy(p => p.Name ?? Guid.NewGuid().ToString())
                .Select(g => g.First())
                .ToList();

            _logger?.LogInformation($"[CsvDataServiceNew] loader=GroupPolicies patterns={string.Join(",", filePatterns)} matched={matchedFiles.Count} total={uniquePolicies.Count} ms={sw.ElapsedMilliseconds}");

            return DataLoaderResult<PolicyData>.Success(uniquePolicies, warnings);
        }

        #endregion

        #region Helper Methods

        private List<string> FindFiles(string path, string pattern)
        {
            if (!Directory.Exists(path))
                return new List<string>();

            try
            {
                return Directory.GetFiles(path, pattern, SearchOption.TopDirectoryOnly).ToList();
            }
            catch
            {
                return new List<string>();
            }
        }

        private Dictionary<string, int?> BuildHeaderMap(string[] actualHeaders, Dictionary<string, string> expectedHeaders, string fileName, List<string> warnings)
        {
            var headerMap = new Dictionary<string, int?>(StringComparer.OrdinalIgnoreCase);
            var missingHeaders = new List<string>();

            foreach (var expected in expectedHeaders.Keys)
            {
                var index = FindHeaderIndex(actualHeaders, expected);
                headerMap[expected] = index;
                
                if (!index.HasValue)
                {
                    missingHeaders.Add(expected);
                }
            }

            if (missingHeaders.Any())
            {
                var warning = $"[{Path.GetFileNameWithoutExtension(fileName)}] File '{fileName}': Missing required columns: {string.Join(", ", missingHeaders)}. Values defaulted.";
                warnings.Add(warning);
                _logger?.LogWarning(warning);
            }

            return headerMap;
        }

        private int? FindHeaderIndex(string[] headers, string targetHeader)
        {
            // Normalize target header for comparison
            var normalized = NormalizeHeader(targetHeader);
            
            for (int i = 0; i < headers.Length; i++)
            {
                if (NormalizeHeader(headers[i]).Equals(normalized, StringComparison.OrdinalIgnoreCase))
                {
                    return i;
                }
            }
            
            return null;
        }

        private string NormalizeHeader(string header)
        {
            if (string.IsNullOrWhiteSpace(header))
                return string.Empty;
                
            // Remove spaces, underscores, hyphens and make lowercase
            return header.Replace(" ", "").Replace("_", "").Replace("-", "").ToLowerInvariant();
        }

        private string? GetMappedValue(string[] values, int? index)
        {
            if (!index.HasValue || index.Value >= values.Length)
                return null;
                
            var value = values[index.Value];
            return string.IsNullOrWhiteSpace(value) ? null : value.Trim();
        }

        private string[] ParseCsvLine(string line)
        {
            var values = new List<string>();
            bool inQuotes = false;
            var currentValue = new StringBuilder();
            
            // Handle both comma and semicolon as delimiters
            var delimiter = line.Contains(';') && !line.Contains(',') ? ';' : ',';

            for (int i = 0; i < line.Length; i++)
            {
                char c = line[i];

                if (c == '"')
                {
                    if (i + 1 < line.Length && line[i + 1] == '"')
                    {
                        currentValue.Append('"');
                        i++; // Skip next quote
                    }
                    else
                    {
                        inQuotes = !inQuotes;
                    }
                }
                else if (c == delimiter && !inQuotes)
                {
                    values.Add(currentValue.ToString().Trim());
                    currentValue.Clear();
                }
                else
                {
                    currentValue.Append(c);
                }
            }

            values.Add(currentValue.ToString().Trim());
            return values.ToArray();
        }

        private bool ParseBool(string? value)
        {
            if (string.IsNullOrWhiteSpace(value))
                return false;

            return value.Equals("true", StringComparison.OrdinalIgnoreCase) ||
                   value.Equals("yes", StringComparison.OrdinalIgnoreCase) ||
                   value.Equals("1", StringComparison.OrdinalIgnoreCase) ||
                   value.Equals("enabled", StringComparison.OrdinalIgnoreCase);
        }

        private int ParseInt(string? value)
        {
            if (string.IsNullOrWhiteSpace(value))
                return 0;

            return int.TryParse(value, out var result) ? result : 0;
        }

        private double ParseDouble(string? value)
        {
            if (string.IsNullOrWhiteSpace(value))
                return 0.0;

            return double.TryParse(value, NumberStyles.Any, CultureInfo.InvariantCulture, out var result) ? result : 0.0;
        }

        private DateTimeOffset? ParseDateTimeOffset(string? value)
        {
            if (string.IsNullOrWhiteSpace(value))
                return null;

            if (DateTimeOffset.TryParse(value, out var result))
                return result;

            if (DateTime.TryParse(value, out var dateTime))
                return new DateTimeOffset(dateTime);

            return null;
        }

        #endregion
    }
}