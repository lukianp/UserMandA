using System;
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
        DiscoveryData
    }
}