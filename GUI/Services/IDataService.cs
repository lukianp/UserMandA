using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using MandADiscoverySuite.Models;

namespace MandADiscoverySuite.Services
{
    /// <summary>
    /// Service interface for data operations and caching
    /// </summary>
    public interface IDataService
    {
        /// <summary>
        /// Loads user data for a specific company profile
        /// </summary>
        /// <param name="profileName">Company profile name</param>
        /// <param name="forceRefresh">Force refresh from source files</param>
        /// <param name="cancellationToken">Cancellation token</param>
        /// <returns>Collection of user data</returns>
        Task<IEnumerable<UserData>> LoadUsersAsync(string profileName, bool forceRefresh = false, CancellationToken cancellationToken = default);

        /// <summary>
        /// Loads infrastructure data for a specific company profile
        /// </summary>
        /// <param name="profileName">Company profile name</param>
        /// <param name="forceRefresh">Force refresh from source files</param>
        /// <param name="cancellationToken">Cancellation token</param>
        /// <returns>Collection of infrastructure data</returns>
        Task<IEnumerable<InfrastructureData>> LoadInfrastructureAsync(string profileName, bool forceRefresh = false, CancellationToken cancellationToken = default);

        /// <summary>
        /// Loads group data for a specific company profile
        /// </summary>
        /// <param name="profileName">Company profile name</param>
        /// <param name="forceRefresh">Force refresh from source files</param>
        /// <param name="cancellationToken">Cancellation token</param>
        /// <returns>Collection of group data</returns>
        Task<IEnumerable<GroupData>> LoadGroupsAsync(string profileName, bool forceRefresh = false, CancellationToken cancellationToken = default);

        /// <summary>
        /// Loads application data for a specific company profile
        /// </summary>
        /// <param name="profileName">Company profile name</param>
        /// <param name="forceRefresh">Force refresh from source files</param>
        /// <param name="cancellationToken">Cancellation token</param>
        /// <returns>Collection of application data</returns>
        Task<IEnumerable<ApplicationData>> LoadApplicationsAsync(string profileName, bool forceRefresh = false, CancellationToken cancellationToken = default);

        /// <summary>
        /// Gets data summary statistics for a company profile
        /// </summary>
        /// <param name="profileName">Company profile name</param>
        /// <param name="cancellationToken">Cancellation token</param>
        /// <returns>Data summary statistics</returns>
        Task<DataSummary> GetDataSummaryAsync(string profileName, CancellationToken cancellationToken = default);

        /// <summary>
        /// Searches across all data types for a company profile
        /// </summary>
        /// <param name="profileName">Company profile name</param>
        /// <param name="searchTerm">Search term</param>
        /// <param name="searchOptions">Search options</param>
        /// <param name="cancellationToken">Cancellation token</param>
        /// <returns>Search results</returns>
        Task<SearchResults> SearchAsync(string profileName, string searchTerm, SearchOptions searchOptions = null, CancellationToken cancellationToken = default);

        /// <summary>
        /// Exports data to various formats
        /// </summary>
        /// <param name="profileName">Company profile name</param>
        /// <param name="exportOptions">Export options</param>
        /// <param name="cancellationToken">Cancellation token</param>
        /// <returns>Export result</returns>
        Task<ExportResult> ExportDataAsync(string profileName, ExportOptions exportOptions, CancellationToken cancellationToken = default);

        /// <summary>
        /// Clears all cached data for a specific profile
        /// </summary>
        /// <param name="profileName">Company profile name</param>
        /// <returns>Task</returns>
        Task ClearCacheAsync(string profileName);

        /// <summary>
        /// Gets cache statistics
        /// </summary>
        /// <returns>Cache statistics</returns>
        Task<CacheStatistics> GetCacheStatisticsAsync();
    }

    /// <summary>
    /// Data summary statistics
    /// </summary>
    public class DataSummary
    {
        public string ProfileName { get; set; }
        public DateTime LastUpdated { get; set; }
        public int TotalUsers { get; set; }
        public int TotalComputers { get; set; }
        public int TotalGroups { get; set; }
        public int TotalApplications { get; set; }
        public Dictionary<string, int> UsersByDepartment { get; set; } = new Dictionary<string, int>();
        public Dictionary<string, int> ComputersByOperatingSystem { get; set; } = new Dictionary<string, int>();
        public Dictionary<string, int> ApplicationsByCategory { get; set; } = new Dictionary<string, int>();
        public EnvironmentType EnvironmentType { get; set; }
        public List<string> DiscoveredDomains { get; set; } = new List<string>();
        public List<string> DiscoveredTenants { get; set; } = new List<string>();
    }

    /// <summary>
    /// Search options
    /// </summary>
    public class SearchOptions
    {
        public bool IncludeUsers { get; set; } = true;
        public bool IncludeComputers { get; set; } = true;
        public bool IncludeGroups { get; set; } = true;
        public bool IncludeApplications { get; set; } = true;
        public bool CaseSensitive { get; set; } = false;
        public bool WholeWordOnly { get; set; } = false;
        public bool UseRegex { get; set; } = false;
        public int MaxResults { get; set; } = 1000;
    }

    /// <summary>
    /// Search results
    /// </summary>
    public class SearchResults
    {
        public string SearchTerm { get; set; }
        public int TotalResults { get; set; }
        public List<UserData> Users { get; set; } = new List<UserData>();
        public List<InfrastructureData> Computers { get; set; } = new List<InfrastructureData>();
        public List<GroupData> Groups { get; set; } = new List<GroupData>();
        public List<ApplicationData> Applications { get; set; } = new List<ApplicationData>();
        public TimeSpan SearchDuration { get; set; }
    }

    /// <summary>
    /// Export options
    /// </summary>
    public class ExportOptions
    {
        public ExportFormat Format { get; set; } = ExportFormat.Csv;
        public string OutputPath { get; set; }
        public bool IncludeUsers { get; set; } = true;
        public bool IncludeComputers { get; set; } = true;
        public bool IncludeGroups { get; set; } = true;
        public bool IncludeApplications { get; set; } = true;
        public List<string> SelectedFields { get; set; } = new List<string>();
        public bool CompressOutput { get; set; } = false;
    }

    /// <summary>
    /// Export formats
    /// </summary>
    public enum ExportFormat
    {
        Csv,
        Excel,
        Json,
        Xml,
        PowerBI
    }

    /// <summary>
    /// Export result
    /// </summary>
    public class ExportResult
    {
        public bool Success { get; set; }
        public string OutputPath { get; set; }
        public string ErrorMessage { get; set; }
        public int RecordsExported { get; set; }
        public long FileSizeBytes { get; set; }
        public TimeSpan Duration { get; set; }
    }

    /// <summary>
    /// Cache statistics
    /// </summary>
    public class CacheStatistics
    {
        public int TotalEntries { get; set; }
        public long MemoryUsageBytes { get; set; }
        public Dictionary<string, int> EntriesByType { get; set; } = new Dictionary<string, int>();
        public Dictionary<string, DateTime> LastAccessTimes { get; set; } = new Dictionary<string, DateTime>();
        public int HitCount { get; set; }
        public int MissCount { get; set; }
        public double HitRatio => HitCount + MissCount > 0 ? (double)HitCount / (HitCount + MissCount) : 0;
    }
}