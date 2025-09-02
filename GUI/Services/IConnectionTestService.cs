using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using MandADiscoverySuite.Models;

namespace MandADiscoverySuite.Services
{
    /// <summary>
    /// Service interface for testing connections to source and target environments
    /// </summary>
    public interface IConnectionTestService
    {
        /// <summary>
        /// Tests connection to a source company profile (discovery data based)
        /// </summary>
        /// <param name="companyProfile">Source company profile to test</param>
        /// <returns>Connection test result</returns>
        Task<ConnectionTestResult> TestSourceConnectionAsync(CompanyProfile companyProfile);

        /// <summary>
        /// Tests connection to a target profile (credentials based)
        /// </summary>
        /// <param name="targetProfile">Target profile to test</param>
        /// <returns>Connection test result</returns>
        Task<ConnectionTestResult> TestTargetConnectionAsync(TargetProfile targetProfile);

        /// <summary>
        /// Tests Azure AD Graph API connection
        /// </summary>
        /// <param name="tenantId">Azure tenant ID</param>
        /// <param name="clientId">Application client ID</param>
        /// <param name="clientSecret">Application client secret</param>
        /// <param name="scopes">Required scopes</param>
        /// <returns>Connection test result</returns>
        Task<ConnectionTestResult> TestAzureGraphConnectionAsync(string tenantId, string clientId, string clientSecret, string[] scopes);

        /// <summary>
        /// Tests on-premises Active Directory connection
        /// </summary>
        /// <param name="domain">Domain to connect to</param>
        /// <param name="username">Username for authentication</param>
        /// <param name="password">Password for authentication</param>
        /// <returns>Connection test result</returns>
        Task<ConnectionTestResult> TestActiveDirectoryConnectionAsync(string domain, string username, string password);

        /// <summary>
        /// Tests Exchange Online connection
        /// </summary>
        /// <param name="tenantId">Azure tenant ID</param>
        /// <param name="clientId">Application client ID</param>
        /// <param name="clientSecret">Application client secret</param>
        /// <returns>Connection test result</returns>
        Task<ConnectionTestResult> TestExchangeOnlineConnectionAsync(string tenantId, string clientId, string clientSecret);

        /// <summary>
        /// Tests SharePoint Online connection
        /// </summary>
        /// <param name="tenantId">Azure tenant ID</param>
        /// <param name="clientId">Application client ID</param>
        /// <param name="clientSecret">Application client secret</param>
        /// <param name="siteUrl">SharePoint site URL to test</param>
        /// <returns>Connection test result</returns>
        Task<ConnectionTestResult> TestSharePointOnlineConnectionAsync(string tenantId, string clientId, string clientSecret, string siteUrl);

        /// <summary>
        /// Tests Exchange Online PowerShell connection
        /// </summary>
        /// <param name="tenantId">Azure tenant ID</param>
        /// <param name="clientId">Application client ID</param>
        /// <param name="clientSecret">Application client secret</param>
        /// <returns>Connection test result</returns>
        Task<ConnectionTestResult> TestExchangeOnlinePowerShellAsync(string tenantId, string clientId, string clientSecret);

        /// <summary>
        /// Tests Azure SQL Database connection
        /// </summary>
        /// <param name="connectionString">SQL connection string</param>
        /// <param name="username">SQL username (optional if in connection string)</param>
        /// <param name="password">SQL password (optional if in connection string)</param>
        /// <returns>Connection test result</returns>
        Task<ConnectionTestResult> TestAzureSqlConnectionAsync(string connectionString, string username = null, string password = null);

        /// <summary>
        /// Performs comprehensive connectivity health check for target profile
        /// </summary>
        /// <param name="targetProfile">Target profile to test</param>
        /// <returns>Comprehensive connectivity results</returns>
        Task<ConnectivityHealthCheck> PerformHealthCheckAsync(TargetProfile targetProfile);

        /// <summary>
        /// Gets connection status summary for a target profile
        /// </summary>
        /// <param name="targetProfile">Target profile to get status for</param>
        /// <returns>Status summary string</returns>
        Task<string> GetConnectionStatusAsync(TargetProfile targetProfile);
    }

    /// <summary>
    /// Connection test types
    /// </summary>
    public enum ConnectionTestType
    {
        Unknown,
        AzureGraph,
        ActiveDirectory,
        ExchangeOnline,
        SharePointOnline,
        DiscoveryData,
        ExchangeOnlinePowerShell,
        AzureSql
    }

    /// <summary>
    /// Comprehensive connectivity health check result
    /// </summary>
    public class ConnectivityHealthCheck
    {
        public bool OverallHealth { get; set; }
        public Dictionary<string, ConnectionTestResult> ServiceResults { get; set; } = new Dictionary<string, ConnectionTestResult>();
        public List<string> BlockingIssues { get; set; } = new List<string>();
        public List<string> Warnings { get; set; } = new List<string>();
        public TimeSpan TotalDuration { get; set; }
        public DateTime TestTimestamp { get; set; } = DateTime.UtcNow;
    }
}