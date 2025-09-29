// Version: 1.0.0
// Author: Lukian Poleschtschuk
// Date Modified: 2025-09-16
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using MandADiscoverySuite.Models;
using MandADiscoverySuite.Interfaces;
using MandADiscoverySuite.Repository;

namespace MandADiscoverySuite.Services
{
    /// <summary>
    /// Enhanced CSV data service with enterprise-grade error handling and migration support
    /// Implements ICsvDataLoader as the primary CSV loading service for the application
    /// </summary>
    public class CsvDataServiceNew : ICsvDataLoader
    {
        private readonly ILogger<CsvDataServiceNew> _logger;
        private readonly string _activeProfilePath;
        private readonly string _secondaryPath;
        // Removed test data path - no longer needed after cleanup
        private readonly SemaphoreSlim _fileSemaphore;
        private readonly int _maxConcurrentFiles = 3;
        private readonly int _maxRetryAttempts = 3;
        private readonly TimeSpan _retryDelay = TimeSpan.FromMilliseconds(500);

        public CsvDataServiceNew(ILogger<CsvDataServiceNew> logger, string profileName = "ljpops")
        {
            _logger = logger;
            _activeProfilePath = Path.Combine(ConfigurationService.Instance.DiscoveryDataRootPath, profileName, "Raw");
            _secondaryPath = Path.Combine(ConfigurationService.Instance.DiscoveryDataRootPath, "Profiles", profileName, "Raw");
            // Test data path removed to eliminate dummy data
            _fileSemaphore = new SemaphoreSlim(_maxConcurrentFiles, _maxConcurrentFiles);
        }

        public void Dispose()
        {
            _fileSemaphore?.Dispose();
        }

        #region Generic CSV Loading

        /// <summary>
        /// Generic method to load any CSV file and return data as dynamic objects
        /// </summary>
        public async Task<List<dynamic>> LoadCsvDataAsync(string csvFilePath)
        {
            var results = new List<dynamic>();

            if (!File.Exists(csvFilePath))
            {
                _logger?.LogWarning($"CSV file not found: {csvFilePath}");
                return results;
            }

            try
            {
                using var reader = new StreamReader(csvFilePath, Encoding.UTF8, true, bufferSize: 65536);

                // Read headers
                var headerLine = await reader.ReadLineAsync();
                if (string.IsNullOrEmpty(headerLine))
                {
                    _logger?.LogWarning($"CSV file has empty header line: {csvFilePath}");
                    return results;
                }

                var headers = ParseCsvLine(headerLine);
                var headerCount = headers.Length;

                // Validate that we have headers
                if (headerCount == 0)
                {
                    _logger?.LogWarning($"CSV file has no headers: {csvFilePath}");
                    return results;
                }

                // Read data rows
                while (!reader.EndOfStream)
                {
                    var line = await reader.ReadLineAsync();
                    if (string.IsNullOrEmpty(line)) continue;

                    var values = ParseCsvLine(line);
                    if (values.Length < headerCount) continue;

                    // Create dynamic object from headers and values
                    var rowData = new Dictionary<string, object>();
                    for (int i = 0; i < Math.Min(headers.Length, values.Length); i++)
                    {
                        var header = NormalizeHeader(headers[i]);
                        var value = values[i]?.Trim();
                        rowData[header] = value ?? string.Empty;
                    }

                    results.Add(rowData);
                }

                _logger?.LogDebug($"Loaded {results.Count} rows from CSV file: {Path.GetFileName(csvFilePath)}");
            }
            catch (FileNotFoundException)
            {
                _logger?.LogWarning($"CSV file not found: {csvFilePath}");
                return results;
            }
            catch (UnauthorizedAccessException ex)
            {
                _logger?.LogError(ex, $"Access denied to CSV file: {csvFilePath}");
                return results;
            }
            catch (IOException ex)
            {
                _logger?.LogError(ex, $"IO error reading CSV file: {csvFilePath}");
                return results;
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, $"Unexpected error loading CSV data from {csvFilePath}");
                return results;
            }

            return results;
        }

        /// <summary>
        /// Load network infrastructure discovery data from CSV files
        /// </summary>
        public async Task<List<dynamic>> LoadNetworkInfrastructureDiscoveryAsync()
        {
            var results = new List<dynamic>();

            // Use profile-based paths
            var possiblePaths = new[]
            {
                Path.Combine(_activeProfilePath, "NetworkInfrastructureDiscovery.csv"),
                Path.Combine(_secondaryPath, "NetworkInfrastructureDiscovery.csv")
            };

            foreach (var csvPath in possiblePaths)
            {
                try
                {
                    if (File.Exists(csvPath))
                    {
                        var loadedData = await LoadCsvDataAsync(csvPath);
                        foreach (var item in loadedData)
                        {
                            results.Add(item);
                        }

                        _logger?.LogInformation($"[CsvDataServiceNew] Loaded {results.Count} Network Infrastructure Discovery records from {csvPath}");
                        return results;
                    }
                }
                catch (Exception ex)
                {
                    _logger?.LogError(ex, $"Error loading Network Infrastructure Discovery data from {csvPath}");
                }
            }

            _logger?.LogInformation($"[CsvDataServiceNew] No Network Infrastructure Discovery data found in profile paths");
            return results;
        }

        #endregion

        #region Users Loading

        public async Task<DataLoaderResult<UserData>> LoadUsersAsync(string profileName, CancellationToken cancellationToken = default)
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
                // Test data path removed to eliminate dummy data
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

                    // Determine user source based on filename
                    var fileName = Path.GetFileName(filePath).ToLowerInvariant();
                    var userSource = fileName.Contains("azure") ? "Azure AD" : 
                                   fileName.Contains("activedirectory") ? "Active Directory" : 
                                   "Unknown";

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
                            CreatedDateTime: ParseDateTimeOffset(GetMappedValue(values, headerMap["CreatedDateTime"])),
                            UserSource: userSource
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

        public async Task<DataLoaderResult<GroupData>> LoadGroupsAsync(string profileName, CancellationToken cancellationToken = default)
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
                // Test data path removed to eliminate dummy data
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

                        // Derive missing properties from available data
                        var groupType = GetMappedValue(values, headerMap["GroupType"]);
                        var mailEnabled = headerMap["MailEnabled"].HasValue ? 
                            ParseBool(GetMappedValue(values, headerMap["MailEnabled"])) : 
                            DeriveMailEnabled(groupType);
                        var securityEnabled = headerMap["SecurityEnabled"].HasValue ? 
                            ParseBool(GetMappedValue(values, headerMap["SecurityEnabled"])) : 
                            DeriveSecurityEnabled(groupType);

                        var group = new GroupData(
                            DisplayName: GetMappedValue(values, headerMap["DisplayName"]),
                            GroupType: groupType,
                            MailEnabled: mailEnabled,
                            SecurityEnabled: securityEnabled,
                            Mail: GetMappedValue(values, headerMap["Mail"]),
                            CreatedDateTime: ParseDateTimeOffset(GetMappedValue(values, headerMap["CreatedDateTime"])),
                            MemberCount: ParseInt(GetMappedValue(values, headerMap["MemberCount"])),
                            OwnerCount: ParseInt(GetMappedValue(values, headerMap["OwnerCount"]) ?? "0"),
                            Visibility: GetMappedValue(values, headerMap["Visibility"]) ?? "Private",
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

        public async Task<DataLoaderResult<InfrastructureData>> LoadInfrastructureAsync(string profileName, CancellationToken cancellationToken = default)
        {
            var sw = Stopwatch.StartNew();
            var warnings = new List<string>();
            var infrastructure = new List<InfrastructureData>();

            var filePatterns = new[] { "*Computer*.csv", "*VM*.csv", "*Server*.csv", "NetworkInfrastructure*.csv", "AzureVMs*.csv", "Infrastructure.csv" };
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
                // Test data path removed to eliminate dummy data
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

        public async Task<DataLoaderResult<ApplicationData>> LoadApplicationsAsync(string profileName, CancellationToken cancellationToken = default)
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
                // Test data path removed to eliminate dummy data
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

        public async Task<DataLoaderResult<FileServerData>> LoadFileServersAsync(string profileName, CancellationToken cancellationToken = default)
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
                // Test data path removed to eliminate dummy data
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

        public async Task<DataLoaderResult<SqlInstanceData>> LoadDatabasesAsync(string profileName, CancellationToken cancellationToken = default)
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
                // Test data path removed to eliminate dummy data
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

        public async Task<DataLoaderResult<PolicyData>> LoadGroupPoliciesAsync(string profileName, CancellationToken cancellationToken = default)
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
                // Test data path removed to eliminate dummy data
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

        #region Active Directory Discovery Loading

        public async Task<DataLoaderResult<dynamic>> LoadActiveDirectoryDiscoveryAsync(string profileName)
        {
            var sw = Stopwatch.StartNew();
            var warnings = new List<string>();
            var results = new List<dynamic>();

            var filePatterns = new[] { "*ActiveDirectoryDiscovery*.csv", "ActiveDirectoryDiscovery.csv" };
            var expectedHeaders = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase)
            {
                ["DisplayName"] = null,
                ["UserPrincipalName"] = null,
                ["SamAccountName"] = null,
                ["Mail"] = null,
                ["Department"] = null,
                ["JobTitle"] = null,
                ["AccountEnabled"] = null,
                ["Company"] = null,
                ["Manager"] = null,
                ["CreatedDateTime"] = null
            };

            var matchedFiles = new List<string>();
            foreach (var pattern in filePatterns)
            {
                matchedFiles.AddRange(FindFiles(_activeProfilePath, pattern));
                matchedFiles.AddRange(FindFiles(_secondaryPath, pattern));
                // Test data path removed to eliminate dummy data
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

                    var fileItems = new List<dynamic>();
                    while (!reader.EndOfStream)
                    {
                        var line = await reader.ReadLineAsync();
                        if (string.IsNullOrEmpty(line)) continue;

                        var values = ParseCsvLine(line);
                        if (values.Length < headers.Length) continue;

                        var rowData = new Dictionary<string, object>();
                        for (int i = 0; i < Math.Min(headers.Length, values.Length); i++)
                        {
                            var header = NormalizeHeader(headers[i]);
                            var value = values[i]?.Trim();
                            rowData[header] = value ?? string.Empty;
                        }

                        if (!string.IsNullOrWhiteSpace(rowData.GetValueOrDefault("displayname", "").ToString()) ||
                            !string.IsNullOrWhiteSpace(rowData.GetValueOrDefault("userprincipalname", "").ToString()) ||
                            !string.IsNullOrWhiteSpace(rowData.GetValueOrDefault("samaccountname", "").ToString()))
                        {
                            fileItems.Add(rowData);
                        }
                    }

                    results.AddRange(fileItems);
                    _logger?.LogDebug($"[CsvDataServiceNew] Loaded {fileItems.Count} Active Directory discovery items from {Path.GetFileName(filePath)}");
                }
                catch (Exception ex)
                {
                    warnings.Add($"[ActiveDirectoryDiscovery] File '{Path.GetFileName(filePath)}': Error reading file - {ex.Message}");
                    _logger?.LogError(ex, $"[CsvDataServiceNew] Error loading Active Directory discovery from {filePath}");
                }
            }

            // Validate required columns presence
            var missingRequired = new List<string>();
            if (results.Any())
            {
                var sampleRow = results.First();
                foreach (var required in expectedHeaders.Keys.Where(k => k == "DisplayName" || k == "UserPrincipalName" || k == "SamAccountName"))
                {
                    if (!((IDictionary<string, object>)sampleRow).ContainsKey(NormalizeHeader(required)))
                    {
                        missingRequired.Add(required);
                    }
                }
            }

            if (missingRequired.Any())
            {
                var errorMsg = $"Missing required columns: {string.Join(", ", missingRequired)}";
                warnings.Add($"[ActiveDirectoryDiscovery] Critical: {errorMsg}");
                _logger?.LogError(errorMsg);
            }

            _logger?.LogInformation($"[CsvDataServiceNew] loader=ActiveDirectoryDiscovery patterns={string.Join(",", filePatterns)} matched={matchedFiles.Count} total={results.Count} ms={sw.ElapsedMilliseconds}");

            return DataLoaderResult<dynamic>.Success(results, warnings);
        }

        #endregion

        #region Azure Discovery Loading

        public async Task<List<dynamic>> LoadAzureDiscoveryAsync()
        {
            var sw = Stopwatch.StartNew();
            var warnings = new List<string>();
            var results = new List<dynamic>();

            // Use profile-based paths
            var possiblePaths = new[]
            {
                Path.Combine(_activeProfilePath, "AzureDiscovery.csv"),
                Path.Combine(_secondaryPath, "AzureDiscovery.csv")
            };

            foreach (var csvPath in possiblePaths)
            {
                try
                {
                    if (File.Exists(csvPath))
                    {
                        var loadedData = await LoadCsvDataAsync(csvPath);
                        foreach (var item in loadedData)
                        {
                            results.Add(item);
                        }

                        _logger?.LogInformation($"[CsvDataServiceNew] Loaded {results.Count} Azure Discovery records from {csvPath} in {sw.ElapsedMilliseconds} ms");
                        return results;
                    }
                }
                catch (Exception ex)
                {
                    _logger?.LogError(ex, $"Error loading Azure Discovery data from {csvPath}");
                }
            }

            _logger?.LogInformation($"[CsvDataServiceNew] No Azure Discovery data found in profile paths");
            return results;
        }

        #endregion

        #region Microsoft Teams Discovery Loading

        public async Task<List<dynamic>> LoadTeamsDiscoveryAsync()
        {
            var results = new List<dynamic>();

            // Use profile-based paths
            var possiblePaths = new[]
            {
                Path.Combine(_activeProfilePath, "MicrosoftTeamsDiscovery.csv"),
                Path.Combine(_secondaryPath, "MicrosoftTeamsDiscovery.csv")
            };

            foreach (var csvPath in possiblePaths)
            {
                try
                {
                    if (File.Exists(csvPath))
                    {
                        var loadedData = await LoadCsvDataAsync(csvPath);
                        foreach (var item in loadedData)
                        {
                            results.Add(item);
                        }

                        _logger?.LogInformation($"[CsvDataServiceNew] Loaded {results.Count} Microsoft Teams Discovery records from {csvPath}");
                        return results;
                    }
                }
                catch (Exception ex)
                {
                    _logger?.LogError(ex, $"Error loading Microsoft Teams Discovery data from {csvPath}");
                }
            }

            _logger?.LogInformation($"[CsvDataServiceNew] No Microsoft Teams Discovery data found in profile paths");
            return results;
        }

        #endregion

        #region Exchange Discovery Loading

        public async Task<List<dynamic>> LoadExchangeDiscoveryAsync()
        {
            var results = new List<dynamic>();

            // Use profile-based paths
            var possiblePaths = new[]
            {
                Path.Combine(_activeProfilePath, "ExchangeDiscovery.csv"),
                Path.Combine(_secondaryPath, "ExchangeDiscovery.csv")
            };

            foreach (var csvPath in possiblePaths)
            {
                try
                {
                    if (File.Exists(csvPath))
                    {
                        var loadedData = await LoadCsvDataAsync(csvPath);
                        foreach (var item in loadedData)
                        {
                            results.Add(item);
                        }

                        _logger?.LogInformation($"[CsvDataServiceNew] Loaded {results.Count} Exchange Discovery records from {csvPath}");
                        return results;
                    }
                }
                catch (Exception ex)
                {
                    _logger?.LogError(ex, $"Error loading Exchange Discovery data from {csvPath}");
                }
            }

            _logger?.LogInformation($"[CsvDataServiceNew] No Exchange Discovery data found in profile paths");
            return results;
        }

        #endregion

        #region SharePoint Discovery Loading

        public async Task<List<dynamic>> LoadSharePointDiscoveryAsync()
        {
            var results = new List<dynamic>();

            // Use profile-based paths
            var possiblePaths = new[]
            {
                Path.Combine(_activeProfilePath, "SharePointDiscovery.csv"),
                Path.Combine(_secondaryPath, "SharePointDiscovery.csv")
            };

            foreach (var csvPath in possiblePaths)
            {
                try
                {
                    if (File.Exists(csvPath))
                    {
                        var loadedData = await LoadCsvDataAsync(csvPath);
                        foreach (var item in loadedData)
                        {
                            results.Add(item);
                        }

                        _logger?.LogInformation($"[CsvDataServiceNew] Loaded {results.Count} SharePoint Discovery records from {csvPath}");
                        return results;
                    }
                }
                catch (Exception ex)
                {
                    _logger?.LogError(ex, $"Error loading SharePoint Discovery data from {csvPath}");
                }
            }

            _logger?.LogInformation($"[CsvDataServiceNew] No SharePoint Discovery data found in profile paths");
            return results;
        }

        #endregion

        #region Migration Data Loading

        /// <summary>
        /// Load migration items from CSV files with comprehensive error handling
        /// </summary>
        public async Task<DataLoaderResult<MigrationItem>> LoadMigrationItemsAsync(string profileName, CancellationToken cancellationToken = default)
        {
            var sw = Stopwatch.StartNew();
            var warnings = new List<string>();
            var items = new List<MigrationItem>();

            var filePatterns = new[] { "MigrationItems*.csv", "Migration*.csv", "*Migration*.csv" };
            var expectedHeaders = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase)
            {
                ["Id"] = null,
                ["SourceIdentity"] = null,
                ["TargetIdentity"] = null,
                ["SourcePath"] = null,
                ["TargetPath"] = null,
                ["Type"] = null,
                ["Status"] = null,
                ["Priority"] = null,
                ["Complexity"] = null,
                ["SizeBytes"] = null,
                ["EstimatedDuration"] = null,
                ["DisplayName"] = null,
                ["Description"] = null,
                ["AssignedTechnician"] = null,
                ["BusinessJustification"] = null,
                ["IsValidationRequired"] = null,
                ["AllowConcurrentMigration"] = null,
                ["SupportsRollback"] = null
            };

            try
            {
                var matchedFiles = await FindFilesAsync(filePatterns, cancellationToken);
                var loadTasks = matchedFiles.Select(async filePath =>
                {
                    await _fileSemaphore.WaitAsync(cancellationToken);
                    try
                    {
                        return await LoadMigrationItemsFromFileAsync(filePath, expectedHeaders, warnings, cancellationToken);
                    }
                    finally
                    {
                        _fileSemaphore.Release();
                    }
                });

                var results = await Task.WhenAll(loadTasks);
                items.AddRange(results.SelectMany(r => r));

                // Deduplicate by Id
                var uniqueItems = items
                    .GroupBy(i => i.Id ?? Guid.NewGuid().ToString())
                    .Select(g => g.First())
                    .ToList();

                _logger?.LogInformation($"[CsvDataServiceNew] loader=MigrationItems patterns={string.Join(",", filePatterns)} matched={matchedFiles.Count} total={uniqueItems.Count} ms={sw.ElapsedMilliseconds}");

                return DataLoaderResult<MigrationItem>.Success(uniqueItems, warnings);
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Failed to load migration items");
                return DataLoaderResult<MigrationItem>.Failure(
                    new List<string> { $"Critical error loading migration items: {ex.Message}" });
            }
        }

        /// <summary>
        /// Load migration batches from CSV files
        /// </summary>
        public async Task<DataLoaderResult<MigrationBatch>> LoadMigrationBatchesAsync(string profileName, CancellationToken cancellationToken = default)
        {
            var sw = Stopwatch.StartNew();
            var warnings = new List<string>();
            var batches = new List<MigrationBatch>();

            var filePatterns = new[] { "MigrationBatches*.csv", "Batches*.csv", "*Batch*.csv" };
            var expectedHeaders = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase)
            {
                ["Name"] = null,
                ["Description"] = null,
                ["Type"] = null,
                ["Status"] = null,
                ["Priority"] = null,
                ["Complexity"] = null,
                ["PlannedStartDate"] = null,
                ["PlannedEndDate"] = null,
                ["AssignedTechnician"] = null,
                ["BusinessOwner"] = null,
                ["BusinessJustification"] = null,
                ["EstimatedCost"] = null,
                ["RequiresApproval"] = null
            };

            try
            {
                var matchedFiles = await FindFilesAsync(filePatterns, cancellationToken);
                var loadTasks = matchedFiles.Select(async filePath =>
                {
                    await _fileSemaphore.WaitAsync(cancellationToken);
                    try
                    {
                        return await LoadMigrationBatchesFromFileAsync(filePath, expectedHeaders, warnings, cancellationToken);
                    }
                    finally
                    {
                        _fileSemaphore.Release();
                    }
                });

                var results = await Task.WhenAll(loadTasks);
                batches.AddRange(results.SelectMany(r => r));

                // Deduplicate by Name
                var uniqueBatches = batches
                    .GroupBy(b => b.Name ?? Guid.NewGuid().ToString())
                    .Select(g => g.First())
                    .ToList();

                _logger?.LogInformation($"[CsvDataServiceNew] loader=MigrationBatches patterns={string.Join(",", filePatterns)} matched={matchedFiles.Count} total={uniqueBatches.Count} ms={sw.ElapsedMilliseconds}");

                return DataLoaderResult<MigrationBatch>.Success(uniqueBatches, warnings);
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Failed to load migration batches");
                return DataLoaderResult<MigrationBatch>.Failure(
                    new List<string> { $"Critical error loading migration batches: {ex.Message}" });
            }
        }

        private async Task<List<MigrationItem>> LoadMigrationItemsFromFileAsync(
            string filePath, 
            Dictionary<string, string> expectedHeaders, 
            List<string> warnings, 
            CancellationToken cancellationToken)
        {
            var items = new List<MigrationItem>();
            var fileName = Path.GetFileName(filePath);

            for (int attempt = 1; attempt <= _maxRetryAttempts; attempt++)
            {
                try
                {
                    if (!File.Exists(filePath))
                    {
                        warnings.Add($"[MigrationItems] File '{fileName}': File not found");
                        return items;
                    }

                    using var reader = new StreamReader(filePath, Encoding.UTF8, true, bufferSize: 65536);
                    var headerLine = await reader.ReadLineAsync();
                    if (string.IsNullOrEmpty(headerLine)) return items;

                    var headers = ParseCsvLine(headerLine);
                    var headerMap = BuildHeaderMap(headers, expectedHeaders, fileName, warnings);

                    while (!reader.EndOfStream)
                    {
                        cancellationToken.ThrowIfCancellationRequested();
                        var line = await reader.ReadLineAsync();
                        if (string.IsNullOrEmpty(line)) continue;

                        var values = ParseCsvLine(line);
                        if (values.Length < headers.Length) continue;

                        try
                        {
                            var item = CreateMigrationItem(values, headerMap);
                            if (item != null && !string.IsNullOrWhiteSpace(item.SourceIdentity))
                            {
                                items.Add(item);
                            }
                        }
                        catch (Exception ex)
                        {
                            warnings.Add($"[MigrationItems] File '{fileName}': Error parsing row - {ex.Message}");
                        }
                    }

                    _logger?.LogDebug($"[CsvDataServiceNew] Loaded {items.Count} migration items from {fileName}");
                    return items;
                }
                catch (Exception ex) when (attempt < _maxRetryAttempts)
                {
                    _logger?.LogWarning($"[CsvDataServiceNew] Attempt {attempt} failed for {fileName}: {ex.Message}. Retrying...");
                    await Task.Delay(_retryDelay, cancellationToken);
                }
                catch (Exception ex)
                {
                    warnings.Add($"[MigrationItems] File '{fileName}': Final attempt failed - {ex.Message}");
                    _logger?.LogError(ex, $"[CsvDataServiceNew] Error loading migration items from {filePath} after {_maxRetryAttempts} attempts");
                    return items;
                }
            }

            return items;
        }

        private async Task<List<MigrationBatch>> LoadMigrationBatchesFromFileAsync(
            string filePath,
            Dictionary<string, string> expectedHeaders,
            List<string> warnings,
            CancellationToken cancellationToken)
        {
            var batches = new List<MigrationBatch>();
            var fileName = Path.GetFileName(filePath);

            for (int attempt = 1; attempt <= _maxRetryAttempts; attempt++)
            {
                try
                {
                    if (!File.Exists(filePath))
                    {
                        warnings.Add($"[MigrationBatches] File '{fileName}': File not found");
                        return batches;
                    }

                    using var reader = new StreamReader(filePath, Encoding.UTF8, true, bufferSize: 65536);
                    var headerLine = await reader.ReadLineAsync();
                    if (string.IsNullOrEmpty(headerLine)) return batches;

                    var headers = ParseCsvLine(headerLine);
                    var headerMap = BuildHeaderMap(headers, expectedHeaders, fileName, warnings);

                    while (!reader.EndOfStream)
                    {
                        cancellationToken.ThrowIfCancellationRequested();
                        var line = await reader.ReadLineAsync();
                        if (string.IsNullOrEmpty(line)) continue;

                        var values = ParseCsvLine(line);
                        if (values.Length < headers.Length) continue;

                        try
                        {
                            var batch = CreateMigrationBatch(values, headerMap);
                            if (batch != null && !string.IsNullOrWhiteSpace(batch.Name))
                            {
                                batches.Add(batch);
                            }
                        }
                        catch (Exception ex)
                        {
                            warnings.Add($"[MigrationBatches] File '{fileName}': Error parsing row - {ex.Message}");
                        }
                    }

                    _logger?.LogDebug($"[CsvDataServiceNew] Loaded {batches.Count} migration batches from {fileName}");
                    return batches;
                }
                catch (Exception ex) when (attempt < _maxRetryAttempts)
                {
                    _logger?.LogWarning($"[CsvDataServiceNew] Attempt {attempt} failed for {fileName}: {ex.Message}. Retrying...");
                    await Task.Delay(_retryDelay, cancellationToken);
                }
                catch (Exception ex)
                {
                    warnings.Add($"[MigrationBatches] File '{fileName}': Final attempt failed - {ex.Message}");
                    _logger?.LogError(ex, $"[CsvDataServiceNew] Error loading migration batches from {filePath} after {_maxRetryAttempts} attempts");
                    return batches;
                }
            }

            return batches;
        }

        private MigrationItem? CreateMigrationItem(string[] values, Dictionary<string, int?> headerMap)
        {
            try
            {
                var typeString = GetMappedValue(values, headerMap["Type"]) ?? "User";
                if (!Enum.TryParse<MigrationType>(typeString, true, out var migrationType))
                {
                    migrationType = MigrationType.User;
                }

                var statusString = GetMappedValue(values, headerMap["Status"]) ?? "NotStarted";
                if (!Enum.TryParse<MigrationStatus>(statusString, true, out var migrationStatus))
                {
                    migrationStatus = MigrationStatus.NotStarted;
                }

                var priorityString = GetMappedValue(values, headerMap["Priority"]) ?? "Normal";
                if (!Enum.TryParse<MigrationPriority>(priorityString, true, out var migrationPriority))
                {
                    migrationPriority = MigrationPriority.Normal;
                }

                var complexityString = GetMappedValue(values, headerMap["Complexity"]) ?? "Simple";
                if (!Enum.TryParse<MigrationComplexity>(complexityString, true, out var migrationComplexity))
                {
                    migrationComplexity = MigrationComplexity.Simple;
                }

                return new MigrationItem
                {
                    Id = GetMappedValue(values, headerMap["Id"]) ?? Guid.NewGuid().ToString(),
                    SourceIdentity = GetMappedValue(values, headerMap["SourceIdentity"]) ?? string.Empty,
                    TargetIdentity = GetMappedValue(values, headerMap["TargetIdentity"]) ?? string.Empty,
                    SourcePath = GetMappedValue(values, headerMap["SourcePath"]),
                    TargetPath = GetMappedValue(values, headerMap["TargetPath"]),
                    Type = migrationType,
                    Status = migrationStatus,
                    Priority = migrationPriority,
                    Complexity = migrationComplexity,
                    SizeBytes = ParseLong(GetMappedValue(values, headerMap["SizeBytes"])),
                    EstimatedDuration = ParseTimeSpan(GetMappedValue(values, headerMap["EstimatedDuration"])),
                    DisplayName = GetMappedValue(values, headerMap["DisplayName"]),
                    Description = GetMappedValue(values, headerMap["Description"]),
                    AssignedTechnician = GetMappedValue(values, headerMap["AssignedTechnician"]),
                    BusinessJustification = GetMappedValue(values, headerMap["BusinessJustification"]),
                    IsValidationRequired = ParseBool(GetMappedValue(values, headerMap["IsValidationRequired"]) ?? "true"),
                    AllowConcurrentMigration = ParseBool(GetMappedValue(values, headerMap["AllowConcurrentMigration"]) ?? "true"),
                    SupportsRollback = ParseBool(GetMappedValue(values, headerMap["SupportsRollback"]) ?? "true")
                };
            }
            catch (Exception ex)
            {
                _logger?.LogWarning($"Error creating migration item: {ex.Message}");
                return null;
            }
        }

        private MigrationBatch? CreateMigrationBatch(string[] values, Dictionary<string, int?> headerMap)
        {
            try
            {
                var typeString = GetMappedValue(values, headerMap["Type"]) ?? "User";
                if (!Enum.TryParse<MigrationType>(typeString, true, out var migrationType))
                {
                    migrationType = MigrationType.User;
                }

                var statusString = GetMappedValue(values, headerMap["Status"]) ?? "NotStarted";
                if (!Enum.TryParse<MigrationStatus>(statusString, true, out var migrationStatus))
                {
                    migrationStatus = MigrationStatus.NotStarted;
                }

                var priorityString = GetMappedValue(values, headerMap["Priority"]) ?? "Normal";
                if (!Enum.TryParse<MigrationPriority>(priorityString, true, out var migrationPriority))
                {
                    migrationPriority = MigrationPriority.Normal;
                }

                var complexityString = GetMappedValue(values, headerMap["Complexity"]) ?? "Simple";
                if (!Enum.TryParse<MigrationComplexity>(complexityString, true, out var migrationComplexity))
                {
                    migrationComplexity = MigrationComplexity.Simple;
                }

                return new MigrationBatch
                {
                    Name = GetMappedValue(values, headerMap["Name"]) ?? string.Empty,
                    Description = GetMappedValue(values, headerMap["Description"]),
                    Type = migrationType,
                    Status = migrationStatus,
                    Priority = migrationPriority,
                    Complexity = migrationComplexity,
                    PlannedStartDate = ParseDateTime(GetMappedValue(values, headerMap["PlannedStartDate"])),
                    PlannedEndDate = ParseDateTime(GetMappedValue(values, headerMap["PlannedEndDate"])),
                    AssignedTechnician = GetMappedValue(values, headerMap["AssignedTechnician"]),
                    BusinessOwner = GetMappedValue(values, headerMap["BusinessOwner"]),
                    BusinessJustification = GetMappedValue(values, headerMap["BusinessJustification"]),
                    EstimatedCost = ParseDecimal(GetMappedValue(values, headerMap["EstimatedCost"])),
                    RequiresApproval = ParseBool(GetMappedValue(values, headerMap["RequiresApproval"]) ?? "false")
                };
            }
            catch (Exception ex)
            {
                _logger?.LogWarning($"Error creating migration batch: {ex.Message}");
                return null;
            }
        }

        private async Task<List<string>> FindFilesAsync(string[] filePatterns, CancellationToken cancellationToken)
        {
            var matchedFiles = new List<string>();
            var searchPaths = new[] { _activeProfilePath, _secondaryPath };

            foreach (var path in searchPaths)
            {
                foreach (var pattern in filePatterns)
                {
                    cancellationToken.ThrowIfCancellationRequested();
                    matchedFiles.AddRange(await FindFilesInPathAsync(path, pattern, cancellationToken));
                }
            }

            return matchedFiles.Distinct().ToList();
        }

        private async Task<List<string>> FindFilesInPathAsync(string path, string pattern, CancellationToken cancellationToken)
        {
            if (!Directory.Exists(path))
                return new List<string>();

            try
            {
                return await Task.Run(() =>
                {
                    cancellationToken.ThrowIfCancellationRequested();
                    return Directory.GetFiles(path, pattern, SearchOption.TopDirectoryOnly).ToList();
                }, cancellationToken);
            }
            catch (Exception ex)
            {
                _logger?.LogWarning($"Error searching files in {path} with pattern {pattern}: {ex.Message}");
                return new List<string>();
            }
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
            catch (Exception ex)
            {
                _logger?.LogWarning($"Error finding files in {path} with pattern {pattern}: {ex.Message}");
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
            
            // First try exact match
            for (int i = 0; i < headers.Length; i++)
            {
                if (NormalizeHeader(headers[i]).Equals(normalized, StringComparison.OrdinalIgnoreCase))
                {
                    return i;
                }
            }
            
            // Try common aliases if exact match fails
            var aliases = GetHeaderAliases(targetHeader);
            foreach (var alias in aliases)
            {
                var normalizedAlias = NormalizeHeader(alias);
                for (int i = 0; i < headers.Length; i++)
                {
                    if (NormalizeHeader(headers[i]).Equals(normalizedAlias, StringComparison.OrdinalIgnoreCase))
                    {
                        return i;
                    }
                }
            }
            
            return null;
        }

        private string[] GetHeaderAliases(string targetHeader)
        {
            return targetHeader.ToLowerInvariant() switch
            {
                // User aliases - updated for Azure AD data
                "displayname" => new[] { "Name", "GroupName", "FullName" },
                "userprincipalname" => new[] { "UserPrincipalName", "UPN", "PrincipalName" },
                "mail" => new[] { "Email", "EmailAddress", "E-Mail" },
                "department" => new[] { "Department", "Dept" },
                "jobtitle" => new[] { "Title", "Position", "Role", "JobTitle" },
                "accountenabled" => new[] { "AccountStatus", "Status", "Enabled", "Active", "AccountEnabled" },
                "samaccountname" => new[] { "SamAccountName", "SAM", "OnPremisesSamAccountName" },
                "companyname" => new[] { "Company", "CompanyName", "Organization" },
                "managerdisplayname" => new[] { "Manager", "ManagerName", "ReportsTo", "ManagerDisplayName" },
                "createddatetime" => new[] { "CreatedDate", "Created", "DateCreated", "CreatedDateTime" },
                
                // Group aliases
                "grouptype" => new[] { "Type", "Category", "Classification", "Kind", "GroupType" },
                "mailenabled" => new[] { "MailEnabled", "EmailEnabled", "HasEmail" },
                "securityenabled" => new[] { "SecurityEnabled", "IsSecurity", "Security" },
                "membercount" => new[] { "Members", "MemberCount", "GroupMembershipCount" },
                "ownercount" => new[] { "Owners", "OwnerCount" },
                "visibility" => new[] { "Visibility", "Access" },
                "description" => new[] { "Description", "Notes" },
                
                // Application aliases
                "name" => new[] { "Name", "DisplayName", "ApplicationName", "AppName" },
                "version" => new[] { "Version", "AppVersion" },
                "publisher" => new[] { "Vendor", "Manufacturer", "Company", "Publisher" },
                "type" => new[] { "Category", "Classification", "Kind", "Type" },
                "usercount" => new[] { "Users", "UserCount" },
                "groupcount" => new[] { "Groups", "GroupCount" },
                "devicecount" => new[] { "Devices", "DeviceCount" },
                "lastseen" => new[] { "LastSeen", "LastActivity", "LastAccessed", "LastSeenDate" },
                
                _ => Array.Empty<string>()
            };
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

        private long? ParseLong(string? value)
        {
            if (string.IsNullOrWhiteSpace(value))
                return null;

            return long.TryParse(value, out var result) ? result : null;
        }

        private decimal? ParseDecimal(string? value)
        {
            if (string.IsNullOrWhiteSpace(value))
                return null;

            return decimal.TryParse(value, NumberStyles.Any, CultureInfo.InvariantCulture, out var result) ? result : null;
        }

        private DateTime? ParseDateTime(string? value)
        {
            if (string.IsNullOrWhiteSpace(value))
                return null;

            return DateTime.TryParse(value, out var result) ? result : null;
        }

        private TimeSpan? ParseTimeSpan(string? value)
        {
            if (string.IsNullOrWhiteSpace(value))
                return null;

            if (TimeSpan.TryParse(value, out var result))
                return result;

            // Try parsing as hours (e.g., "2.5" means 2.5 hours)
            if (double.TryParse(value, out var hours))
                return TimeSpan.FromHours(hours);

            return null;
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

        private bool DeriveMailEnabled(string? groupType)
        {
            if (string.IsNullOrWhiteSpace(groupType))
                return false;
            
            // Distribution groups are typically mail-enabled
            return groupType.Contains("Distribution", StringComparison.OrdinalIgnoreCase) ||
                   groupType.Contains("Mail", StringComparison.OrdinalIgnoreCase);
        }

        private bool DeriveSecurityEnabled(string? groupType)
        {
            if (string.IsNullOrWhiteSpace(groupType))
                return true; // Default to security-enabled
            
            // Security groups are security-enabled, distribution groups typically are not
            return groupType.Contains("Security", StringComparison.OrdinalIgnoreCase) ||
                   !groupType.Contains("Distribution", StringComparison.OrdinalIgnoreCase);
        }

        #endregion
    }
}