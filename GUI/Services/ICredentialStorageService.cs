using System;
using System.Collections.Generic;
using System.Security;
using System.Threading.Tasks;

namespace MandADiscoverySuite.Services
{
    /// <summary>
    /// Interface for secure credential storage and management service
    /// </summary>
    public interface ICredentialStorageService
    {
        /// <summary>
        /// Store domain credentials securely
        /// </summary>
        bool StoreDomainCredentials(string domain, string username, SecureString password);
        
        /// <summary>
        /// Store Azure credentials securely
        /// </summary>
        bool StoreAzureCredentials(string tenantId, string clientId, string clientSecret, string[] scopes = null);
        
        /// <summary>
        /// Retrieve domain credentials
        /// </summary>
        StoredCredentials GetDomainCredentials(string domain);
        
        /// <summary>
        /// Retrieve Azure credentials
        /// </summary>
        StoredCredentials GetAzureCredentials(string tenantId);
        
        /// <summary>
        /// Retrieve credentials by key asynchronously
        /// </summary>
        Task<StoredCredentials> GetCredentialsAsync(string key);
        
        /// <summary>
        /// Store credentials by key asynchronously
        /// </summary>
        Task<bool> StoreCredentialsAsync(string key, StoredCredentials credentials);
        
        /// <summary>
        /// Remove stored credentials
        /// </summary>
        bool RemoveCredentials(string key);
        
        /// <summary>
        /// List all stored credential keys
        /// </summary>
        IEnumerable<string> ListCredentialKeys();
        
        /// <summary>
        /// Test if credentials exist
        /// </summary>
        bool HasCredentials(string key);
        
        /// <summary>
        /// Clear all stored credentials
        /// </summary>
        bool ClearAllCredentials();
    }

    /// <summary>
    /// Represents stored credentials retrieved from secure storage
    /// </summary>
    public class StoredCredentials
    {
        public string Key { get; set; }
        public string Domain { get; set; }
        public string Username { get; set; }
        public SecureString Password { get; set; }
        public string TenantId { get; set; }
        public string ClientId { get; set; }
        public string ClientSecret { get; set; }
        public string[] Scopes { get; set; }
        public DateTime CreatedDate { get; set; }
        public DateTime LastAccessedDate { get; set; }
        public Dictionary<string, string> AdditionalProperties { get; set; } = new Dictionary<string, string>();
        
        public bool IsDomainCredential => !string.IsNullOrEmpty(Domain);
        public bool IsAzureCredential => !string.IsNullOrEmpty(TenantId);
    }
}