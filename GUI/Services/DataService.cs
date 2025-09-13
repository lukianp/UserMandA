using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using MandADiscoverySuite.Models;

namespace MandADiscoverySuite.Services
{
    /// <summary>
    /// Implementation of IDataService that wraps CsvDataServiceNew for data operations
    /// </summary>
    public class DataService : IDataService
    {
        private readonly ILogger<DataService> _logger;
        private readonly CsvDataServiceNew _csvDataService;

        public DataService(ILogger<DataService> logger)
        {
            _logger = logger;
            _csvDataService = new CsvDataServiceNew(_logger as ILogger<CsvDataServiceNew>);
        }

        public async Task<IEnumerable<UserData>> LoadUsersAsync(string profileName, bool forceRefresh = false, CancellationToken cancellationToken = default)
        {
            try
            {
                var result = await _csvDataService.LoadUsersAsync(profileName);
                return result.Data ?? Enumerable.Empty<UserData>();
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, $"Failed to load users for profile '{profileName}'");
                return Enumerable.Empty<UserData>();
            }
        }

        public async Task<IEnumerable<InfrastructureData>> LoadInfrastructureAsync(string profileName, bool forceRefresh = false, CancellationToken cancellationToken = default)
        {
            try
            {
                var result = await _csvDataService.LoadInfrastructureAsync(profileName);
                return result.Data ?? Enumerable.Empty<InfrastructureData>();
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, $"Failed to load infrastructure for profile '{profileName}'");
                return Enumerable.Empty<InfrastructureData>();
            }
        }

        public async Task<IEnumerable<GroupData>> LoadGroupsAsync(string profileName, bool forceRefresh = false, CancellationToken cancellationToken = default)
        {
            try
            {
                var result = await _csvDataService.LoadGroupsAsync(profileName);
                return result.Data ?? Enumerable.Empty<GroupData>();
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, $"Failed to load groups for profile '{profileName}'");
                return Enumerable.Empty<GroupData>();
            }
        }

        public async Task<IEnumerable<ApplicationData>> LoadApplicationsAsync(string profileName, bool forceRefresh = false, CancellationToken cancellationToken = default)
        {
            try
            {
                var result = await _csvDataService.LoadApplicationsAsync(profileName);
                return result.Data ?? Enumerable.Empty<ApplicationData>();
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, $"Failed to load applications for profile '{profileName}'");
                return Enumerable.Empty<ApplicationData>();
            }
        }

        public async Task<IEnumerable<PolicyData>> LoadGroupPoliciesAsync(string profileName, bool forceRefresh = false, CancellationToken cancellationToken = default)
        {
            try
            {
                var result = await _csvDataService.LoadGroupPoliciesAsync(profileName);
                return result.Data ?? Enumerable.Empty<PolicyData>();
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, $"Failed to load group policies for profile '{profileName}'");
                return Enumerable.Empty<PolicyData>();
            }
        }

        public async Task<DataSummary> GetDataSummaryAsync(string profileName, CancellationToken cancellationToken = default)
        {
            try
            {
                // Load all data types in parallel to generate summary
                var userTask = LoadUsersAsync(profileName, false, cancellationToken);
                var infrastructureTask = LoadInfrastructureAsync(profileName, false, cancellationToken);
                var groupTask = LoadGroupsAsync(profileName, false, cancellationToken);
                var appTask = LoadApplicationsAsync(profileName, false, cancellationToken);

                Task[] tasks = new Task[] { userTask, infrastructureTask, groupTask, appTask };
                await Task.WhenAll(tasks);
                
                var users = userTask.Result.ToList();
                var infrastructure = infrastructureTask.Result.ToList();
                var groups = groupTask.Result.ToList();
                var applications = appTask.Result.ToList();

                return new DataSummary
                {
                    ProfileName = profileName,
                    LastUpdated = DateTime.UtcNow,
                    TotalUsers = users.Count(),
                    TotalComputers = infrastructure.Count(),
                    TotalGroups = groups.Count(),
                    TotalApplications = applications.Count(),
                    UsersByDepartment = users
                        .Where(u => !string.IsNullOrEmpty(u.Department))
                        .GroupBy(u => u.Department)
                        .ToDictionary(g => g.Key, g => g.Count()),
                    ComputersByOperatingSystem = infrastructure
                        .Where(i => !string.IsNullOrEmpty(i.OperatingSystem))
                        .GroupBy(i => i.OperatingSystem)
                        .ToDictionary(g => g.Key, g => g.Count()),
                    ApplicationsByCategory = applications
                        .Where(a => !string.IsNullOrEmpty(a.Type))
                        .GroupBy(a => a.Type)
                        .ToDictionary(g => g.Key, g => g.Count()),
                    EnvironmentType = DetermineEnvironmentType(users, groups),
                    DiscoveredDomains = ExtractDomains(users),
                    DiscoveredTenants = ExtractTenants(users)
                };
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, $"Failed to get data summary for profile '{profileName}'");
                return new DataSummary
                {
                    ProfileName = profileName,
                    LastUpdated = DateTime.UtcNow
                };
            }
        }

        public async Task<SearchResults> SearchAsync(string profileName, string searchTerm, SearchOptions searchOptions = null, CancellationToken cancellationToken = default)
        {
            var options = searchOptions ?? new SearchOptions();
            var results = new SearchResults
            {
                SearchTerm = searchTerm,
                SearchDuration = TimeSpan.Zero
            };

            if (string.IsNullOrWhiteSpace(searchTerm))
                return results;

            var startTime = DateTime.UtcNow;

            try
            {
                var tasks = new List<Task>();

                if (options.IncludeUsers)
                {
                    tasks.Add(Task.Run(async () =>
                    {
                        var users = await LoadUsersAsync(profileName, false, cancellationToken);
                        results.Users = FilterUsers(users, searchTerm, options).Take(options.MaxResults / 4).ToList();
                    }, cancellationToken));
                }

                if (options.IncludeComputers)
                {
                    tasks.Add(Task.Run(async () =>
                    {
                        var computers = await LoadInfrastructureAsync(profileName, false, cancellationToken);
                        results.Computers = FilterInfrastructure(computers, searchTerm, options).Take(options.MaxResults / 4).ToList();
                    }, cancellationToken));
                }

                if (options.IncludeGroups)
                {
                    tasks.Add(Task.Run(async () =>
                    {
                        var groups = await LoadGroupsAsync(profileName, false, cancellationToken);
                        results.Groups = FilterGroups(groups, searchTerm, options).Take(options.MaxResults / 4).ToList();
                    }, cancellationToken));
                }

                if (options.IncludeApplications)
                {
                    tasks.Add(Task.Run(async () =>
                    {
                        var applications = await LoadApplicationsAsync(profileName, false, cancellationToken);
                        results.Applications = FilterApplications(applications, searchTerm, options).Take(options.MaxResults / 4).ToList();
                    }, cancellationToken));
                }

                await Task.WhenAll(tasks);
                results.TotalResults = results.Users.Count + results.Computers.Count + results.Groups.Count + results.Applications.Count;
                results.SearchDuration = DateTime.UtcNow - startTime;
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, $"Failed to search data for profile '{profileName}' with term '{searchTerm}'");
            }

            return results;
        }

        public async Task<ExportResult> ExportDataAsync(string profileName, ExportOptions exportOptions, CancellationToken cancellationToken = default)
        {
            // Basic implementation - can be enhanced later
            return new ExportResult
            {
                Success = false,
                ErrorMessage = "Export functionality not yet implemented",
                Duration = TimeSpan.Zero
            };
        }

        public Task ClearCacheAsync(string profileName)
        {
            // No cache to clear in this implementation
            return Task.CompletedTask;
        }

        public Task<CacheStatistics> GetCacheStatisticsAsync()
        {
            // Return empty statistics as no cache is implemented
            return Task.FromResult(new CacheStatistics());
        }

        private EnvironmentType DetermineEnvironmentType(IEnumerable<UserData> users, IEnumerable<GroupData> groups)
        {
            var userList = users.ToList();
            var hasAzureUsers = userList.Any(u => u.UserSource == "Azure AD" || u.UserPrincipalName?.Contains("@") == true);
            var hasOnPremUsers = userList.Any(u => u.UserSource == "Active Directory" || !string.IsNullOrEmpty(u.SamAccountName));
            
            if (hasAzureUsers && hasOnPremUsers)
                return EnvironmentType.Hybrid;
            else if (hasAzureUsers)
                return EnvironmentType.Azure;
            else if (hasOnPremUsers)
                return EnvironmentType.OnPremises;
            else
                return EnvironmentType.Unknown;
        }

        private List<string> ExtractDomains(IEnumerable<UserData> users)
        {
            return users
                .Where(u => !string.IsNullOrEmpty(u.UserPrincipalName) && u.UserPrincipalName.Contains("@"))
                .Select(u => u.UserPrincipalName.Split('@').LastOrDefault())
                .Where(d => !string.IsNullOrEmpty(d))
                .Distinct()
                .ToList();
        }

        private List<string> ExtractTenants(IEnumerable<UserData> users)
        {
            // For now, use domains as tenant identifiers
            return ExtractDomains(users);
        }

        private IEnumerable<UserData> FilterUsers(IEnumerable<UserData> users, string searchTerm, SearchOptions options)
        {
            var comparisonType = options.CaseSensitive ? StringComparison.Ordinal : StringComparison.OrdinalIgnoreCase;
            
            return users.Where(u =>
                ContainsText(u.DisplayName, searchTerm, comparisonType, options) ||
                ContainsText(u.UserPrincipalName, searchTerm, comparisonType, options) ||
                ContainsText(u.Mail, searchTerm, comparisonType, options) ||
                ContainsText(u.Department, searchTerm, comparisonType, options) ||
                ContainsText(u.JobTitle, searchTerm, comparisonType, options)
            );
        }

        private IEnumerable<InfrastructureData> FilterInfrastructure(IEnumerable<InfrastructureData> infrastructure, string searchTerm, SearchOptions options)
        {
            var comparisonType = options.CaseSensitive ? StringComparison.Ordinal : StringComparison.OrdinalIgnoreCase;
            
            return infrastructure.Where(i =>
                ContainsText(i.Name, searchTerm, comparisonType, options) ||
                ContainsText(i.Type, searchTerm, comparisonType, options) ||
                ContainsText(i.Description, searchTerm, comparisonType, options) ||
                ContainsText(i.OperatingSystem, searchTerm, comparisonType, options)
            );
        }

        private IEnumerable<GroupData> FilterGroups(IEnumerable<GroupData> groups, string searchTerm, SearchOptions options)
        {
            var comparisonType = options.CaseSensitive ? StringComparison.Ordinal : StringComparison.OrdinalIgnoreCase;
            
            return groups.Where(g =>
                ContainsText(g.DisplayName, searchTerm, comparisonType, options) ||
                ContainsText(g.Mail, searchTerm, comparisonType, options) ||
                ContainsText(g.Description, searchTerm, comparisonType, options)
            );
        }

        private IEnumerable<ApplicationData> FilterApplications(IEnumerable<ApplicationData> applications, string searchTerm, SearchOptions options)
        {
            var comparisonType = options.CaseSensitive ? StringComparison.Ordinal : StringComparison.OrdinalIgnoreCase;
            
            return applications.Where(a =>
                ContainsText(a.Name, searchTerm, comparisonType, options) ||
                ContainsText(a.Publisher, searchTerm, comparisonType, options) ||
                ContainsText(a.Type, searchTerm, comparisonType, options)
            );
        }

        private bool ContainsText(string text, string searchTerm, StringComparison comparison, SearchOptions options)
        {
            if (string.IsNullOrEmpty(text) || string.IsNullOrEmpty(searchTerm))
                return false;

            if (options.UseRegex)
            {
                try
                {
                    var regex = new System.Text.RegularExpressions.Regex(searchTerm, 
                        options.CaseSensitive ? System.Text.RegularExpressions.RegexOptions.None : System.Text.RegularExpressions.RegexOptions.IgnoreCase);
                    return regex.IsMatch(text);
                }
                catch
                {
                    // Fall back to normal text search if regex is invalid
                    return text.Contains(searchTerm, comparison);
                }
            }

            if (options.WholeWordOnly)
            {
                var words = text.Split(new[] { ' ', '\t', '\n', '\r', '.', ',', ';', ':', '!', '?' }, StringSplitOptions.RemoveEmptyEntries);
                return words.Any(word => string.Equals(word, searchTerm, comparison));
            }

            return text.Contains(searchTerm, comparison);
        }

        public void Dispose()
        {
            _csvDataService?.Dispose();
        }
    }
}