using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Security;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using System.Runtime.InteropServices;
using System.Management.Automation;

namespace MandADiscoverySuite.Services
{
    /// <summary>
    /// Enterprise-grade secure credential storage and management service
    /// </summary>
    public class CredentialStorageService : ICredentialStorageService, IDisposable
    {
        private readonly ILogger<CredentialStorageService> _logger;
        private readonly string _credentialStorePath;
        private readonly byte[] _encryptionKey;
        private readonly object _lockObject = new object();
        private bool _disposed = false;

        public CredentialStorageService(ILogger<CredentialStorageService> logger = null)
        {
            _logger = logger;
            
            // Initialize secure storage location
            var appDataPath = Path.Combine(
                Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData),
                "MandADiscoverySuite",
                "Security"
            );
            
            Directory.CreateDirectory(appDataPath);
            _credentialStorePath = Path.Combine(appDataPath, "credentials.dat");
            
            // Initialize or load encryption key
            _encryptionKey = InitializeEncryptionKey(appDataPath);
            
            _logger?.LogInformation("Credential storage service initialized with secure encryption");
        }

        /// <summary>
        /// Store domain credentials securely
        /// </summary>
        public bool StoreDomainCredentials(
            string profileName,
            string domain,
            string username,
            SecureString password,
            CredentialType type = CredentialType.DomainUser)
        {
            try
            {
                lock (_lockObject)
                {
                    var credentials = LoadCredentialsFromFile();
                    var credentialKey = $"{profileName}_{domain}_{type}";
                    
                    var encryptedCredential = new EncryptedCredential
                    {
                        Id = Guid.NewGuid().ToString(),
                        ProfileName = profileName,
                        Domain = domain,
                        Username = username,
                        Type = type,
                        CreatedDate = DateTime.Now,
                        LastUsedDate = DateTime.Now,
                        EncryptedPassword = EncryptSecureString(password),
                        IsActive = true
                    };

                    credentials[credentialKey] = encryptedCredential;
                    SaveCredentialsToFile(credentials);

                    _logger?.LogInformation($"Stored credentials for {username}@{domain} in profile {profileName}");
                    return true;
                }
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, $"Failed to store credentials for {username}@{domain}");
                return false;
            }
        }

        /// <summary>
        /// Retrieve domain credentials
        /// </summary>
        public PSCredential GetDomainCredentials(
            string profileName,
            string domain,
            CredentialType type = CredentialType.DomainUser)
        {
            try
            {
                lock (_lockObject)
                {
                    var credentials = LoadCredentialsFromFile();
                    var credentialKey = $"{profileName}_{domain}_{type}";

                    if (credentials.TryGetValue(credentialKey, out var encryptedCredential) && 
                        encryptedCredential.IsActive)
                    {
                        var password = DecryptToSecureString(encryptedCredential.EncryptedPassword);
                        var psCredential = new PSCredential(
                            $"{encryptedCredential.Domain}\\{encryptedCredential.Username}",
                            password
                        );

                        // Update last used date
                        encryptedCredential.LastUsedDate = DateTime.Now;
                        SaveCredentialsToFile(credentials);

                        _logger?.LogInformation($"Retrieved credentials for {encryptedCredential.Username}@{domain}");
                        return psCredential;
                    }

                    _logger?.LogWarning($"No active credentials found for domain {domain} in profile {profileName}");
                    return null;
                }
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, $"Failed to retrieve credentials for domain {domain}");
                return null;
            }
        }

        /// <summary>
        /// Store service account credentials for automated operations
        /// </summary>
        public bool StoreServiceCredentials(
            string profileName,
            string serviceName,
            string serviceAccount,
            SecureString servicePassword,
            Dictionary<string, object> additionalProperties = null)
        {
            try
            {
                lock (_lockObject)
                {
                    var credentials = LoadCredentialsFromFile();
                    var credentialKey = $"{profileName}_service_{serviceName}";

                    var serviceCredential = new EncryptedCredential
                    {
                        Id = Guid.NewGuid().ToString(),
                        ProfileName = profileName,
                        Domain = serviceName, // Using Domain field for service name
                        Username = serviceAccount,
                        Type = CredentialType.ServiceAccount,
                        CreatedDate = DateTime.Now,
                        LastUsedDate = DateTime.Now,
                        EncryptedPassword = EncryptSecureString(servicePassword),
                        IsActive = true,
                        AdditionalProperties = additionalProperties ?? new Dictionary<string, object>()
                    };

                    credentials[credentialKey] = serviceCredential;
                    SaveCredentialsToFile(credentials);

                    _logger?.LogInformation($"Stored service credentials for {serviceAccount} in service {serviceName}");
                    return true;
                }
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, $"Failed to store service credentials for {serviceAccount}");
                return false;
            }
        }

        /// <summary>
        /// Get service account credentials
        /// </summary>
        public PSCredential GetServiceCredentials(string profileName, string serviceName)
        {
            try
            {
                lock (_lockObject)
                {
                    var credentials = LoadCredentialsFromFile();
                    var credentialKey = $"{profileName}_service_{serviceName}";

                    if (credentials.TryGetValue(credentialKey, out var serviceCredential) && 
                        serviceCredential.IsActive)
                    {
                        var password = DecryptToSecureString(serviceCredential.EncryptedPassword);
                        var psCredential = new PSCredential(serviceCredential.Username, password);

                        // Update last used date
                        serviceCredential.LastUsedDate = DateTime.Now;
                        SaveCredentialsToFile(credentials);

                        _logger?.LogInformation($"Retrieved service credentials for {serviceName}");
                        return psCredential;
                    }

                    _logger?.LogWarning($"No service credentials found for {serviceName} in profile {profileName}");
                    return null;
                }
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, $"Failed to retrieve service credentials for {serviceName}");
                return null;
            }
        }

        /// <summary>
        /// Store API keys and tokens securely
        /// </summary>
        public bool StoreApiCredentials(
            string profileName,
            string apiName,
            Dictionary<string, SecureString> apiSecrets,
            Dictionary<string, string> apiProperties = null)
        {
            try
            {
                lock (_lockObject)
                {
                    var credentials = LoadCredentialsFromFile();
                    var credentialKey = $"{profileName}_api_{apiName}";

                    var encryptedSecrets = new Dictionary<string, string>();
                    foreach (var secret in apiSecrets)
                    {
                        encryptedSecrets[secret.Key] = EncryptSecureString(secret.Value);
                    }

                    var apiCredential = new EncryptedCredential
                    {
                        Id = Guid.NewGuid().ToString(),
                        ProfileName = profileName,
                        Domain = apiName,
                        Username = "API_CREDENTIALS",
                        Type = CredentialType.ApiKey,
                        CreatedDate = DateTime.Now,
                        LastUsedDate = DateTime.Now,
                        IsActive = true,
                        ApiSecrets = encryptedSecrets,
                        AdditionalProperties = apiProperties?.Select(kvp => new { kvp.Key, Value = (object)kvp.Value }).ToDictionary(x => x.Key, x => x.Value) ?? new Dictionary<string, object>()
                    };

                    credentials[credentialKey] = apiCredential;
                    SaveCredentialsToFile(credentials);

                    _logger?.LogInformation($"Stored API credentials for {apiName}");
                    return true;
                }
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, $"Failed to store API credentials for {apiName}");
                return false;
            }
        }

        /// <summary>
        /// Get API credentials with decrypted secrets
        /// </summary>
        public Dictionary<string, SecureString> GetApiCredentials(string profileName, string apiName)
        {
            try
            {
                lock (_lockObject)
                {
                    var credentials = LoadCredentialsFromFile();
                    var credentialKey = $"{profileName}_api_{apiName}";

                    if (credentials.TryGetValue(credentialKey, out var apiCredential) && 
                        apiCredential.IsActive &&
                        apiCredential.ApiSecrets != null)
                    {
                        var decryptedSecrets = new Dictionary<string, SecureString>();
                        foreach (var secret in apiCredential.ApiSecrets)
                        {
                            decryptedSecrets[secret.Key] = DecryptToSecureString(secret.Value);
                        }

                        // Update last used date
                        apiCredential.LastUsedDate = DateTime.Now;
                        SaveCredentialsToFile(credentials);

                        _logger?.LogInformation($"Retrieved API credentials for {apiName}");
                        return decryptedSecrets;
                    }

                    _logger?.LogWarning($"No API credentials found for {apiName} in profile {profileName}");
                    return new Dictionary<string, SecureString>();
                }
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, $"Failed to retrieve API credentials for {apiName}");
                return new Dictionary<string, SecureString>();
            }
        }

        /// <summary>
        /// List all stored credentials for a profile
        /// </summary>
        public List<CredentialInfo> ListCredentials(string profileName)
        {
            try
            {
                lock (_lockObject)
                {
                    var credentials = LoadCredentialsFromFile();
                    var credentialInfos = new List<CredentialInfo>();

                    foreach (var credential in credentials.Values)
                    {
                        if (credential.ProfileName == profileName && credential.IsActive)
                        {
                            credentialInfos.Add(new CredentialInfo
                            {
                                Id = credential.Id,
                                ProfileName = credential.ProfileName,
                                Domain = credential.Domain,
                                Username = credential.Username,
                                Type = credential.Type,
                                CreatedDate = credential.CreatedDate,
                                LastUsedDate = credential.LastUsedDate
                            });
                        }
                    }

                    return credentialInfos;
                }
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, $"Failed to list credentials for profile {profileName}");
                return new List<CredentialInfo>();
            }
        }

        /// <summary>
        /// Remove stored credentials
        /// </summary>
        public bool RemoveCredentials(string profileName, string domain, CredentialType type)
        {
            try
            {
                lock (_lockObject)
                {
                    var credentials = LoadCredentialsFromFile();
                    var credentialKey = $"{profileName}_{domain}_{type}";

                    if (credentials.TryGetValue(credentialKey, out var credential))
                    {
                        credential.IsActive = false;
                        credential.LastUsedDate = DateTime.Now;
                        SaveCredentialsToFile(credentials);

                        _logger?.LogInformation($"Removed credentials for {domain} in profile {profileName}");
                        return true;
                    }

                    return false;
                }
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, $"Failed to remove credentials for {domain}");
                return false;
            }
        }

        /// <summary>
        /// Test credential validity
        /// </summary>
        public async Task<bool> TestCredentialsAsync(string profileName, string domain, CredentialType type)
        {
            try
            {
                var credential = GetDomainCredentials(profileName, domain, type);
                if (credential == null) return false;

                // Test credential by attempting a simple domain operation
                // Implementation would depend on the type of credential and environment
                // For now, return true if credential exists and can be decrypted
                return true;
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, $"Failed to test credentials for {domain}");
                return false;
            }
        }

        private byte[] InitializeEncryptionKey(string securityPath)
        {
            var keyPath = Path.Combine(securityPath, "master.key");
            
            if (File.Exists(keyPath))
            {
                try
                {
                    var encryptedKey = File.ReadAllBytes(keyPath);
                    return ProtectedData.Unprotect(encryptedKey, null, DataProtectionScope.CurrentUser);
                }
                catch (Exception ex)
                {
                    _logger?.LogWarning(ex, "Failed to load existing encryption key, generating new one");
                }
            }

            // Generate new key
            using (var aes = Aes.Create())
            {
                aes.GenerateKey();
                var protectedKey = ProtectedData.Protect(aes.Key, null, DataProtectionScope.CurrentUser);
                File.WriteAllBytes(keyPath, protectedKey);
                
                _logger?.LogInformation("Generated new encryption key for credential storage");
                return aes.Key;
            }
        }

        private string EncryptSecureString(SecureString secureString)
        {
            if (secureString == null || secureString.Length == 0)
                return string.Empty;

            IntPtr unmanagedString = IntPtr.Zero;
            try
            {
                unmanagedString = Marshal.SecureStringToGlobalAllocUnicode(secureString);
                var plainText = Marshal.PtrToStringUni(unmanagedString);
                
                using (var aes = Aes.Create())
                {
                    aes.Key = _encryptionKey;
                    aes.GenerateIV();
                    
                    using (var encryptor = aes.CreateEncryptor())
                    using (var msEncrypt = new MemoryStream())
                    {
                        msEncrypt.Write(aes.IV, 0, aes.IV.Length);
                        
                        using (var csEncrypt = new CryptoStream(msEncrypt, encryptor, CryptoStreamMode.Write))
                        using (var swEncrypt = new StreamWriter(csEncrypt))
                        {
                            swEncrypt.Write(plainText);
                        }
                        
                        return Convert.ToBase64String(msEncrypt.ToArray());
                    }
                }
            }
            finally
            {
                if (unmanagedString != IntPtr.Zero)
                {
                    Marshal.ZeroFreeGlobalAllocUnicode(unmanagedString);
                }
            }
        }

        private SecureString DecryptToSecureString(string encryptedData)
        {
            if (string.IsNullOrEmpty(encryptedData))
                return new SecureString();

            try
            {
                var fullCipher = Convert.FromBase64String(encryptedData);
                
                using (var aes = Aes.Create())
                {
                    aes.Key = _encryptionKey;
                    
                    var iv = new byte[aes.BlockSize / 8];
                    var cipher = new byte[fullCipher.Length - iv.Length];
                    
                    Array.Copy(fullCipher, 0, iv, 0, iv.Length);
                    Array.Copy(fullCipher, iv.Length, cipher, 0, cipher.Length);
                    
                    aes.IV = iv;
                    
                    using (var decryptor = aes.CreateDecryptor())
                    using (var msDecrypt = new MemoryStream(cipher))
                    using (var csDecrypt = new CryptoStream(msDecrypt, decryptor, CryptoStreamMode.Read))
                    using (var srDecrypt = new StreamReader(csDecrypt))
                    {
                        var plainText = srDecrypt.ReadToEnd();
                        var secureString = new SecureString();
                        
                        foreach (char c in plainText)
                        {
                            secureString.AppendChar(c);
                        }
                        
                        secureString.MakeReadOnly();
                        return secureString;
                    }
                }
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Failed to decrypt credential data");
                return new SecureString();
            }
        }

        private Dictionary<string, EncryptedCredential> LoadCredentialsFromFile()
        {
            if (!File.Exists(_credentialStorePath))
            {
                return new Dictionary<string, EncryptedCredential>();
            }

            try
            {
                var encryptedData = File.ReadAllText(_credentialStorePath);
                if (string.IsNullOrEmpty(encryptedData))
                {
                    return new Dictionary<string, EncryptedCredential>();
                }

                var jsonData = Encoding.UTF8.GetString(
                    ProtectedData.Unprotect(
                        Convert.FromBase64String(encryptedData),
                        null,
                        DataProtectionScope.CurrentUser
                    )
                );

                return JsonSerializer.Deserialize<Dictionary<string, EncryptedCredential>>(jsonData) 
                       ?? new Dictionary<string, EncryptedCredential>();
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Failed to load credentials from file");
                return new Dictionary<string, EncryptedCredential>();
            }
        }

        private void SaveCredentialsToFile(Dictionary<string, EncryptedCredential> credentials)
        {
            try
            {
                var jsonData = JsonSerializer.Serialize(credentials, new JsonSerializerOptions 
                { 
                    WriteIndented = false 
                });
                
                var protectedData = ProtectedData.Protect(
                    Encoding.UTF8.GetBytes(jsonData),
                    null,
                    DataProtectionScope.CurrentUser
                );
                
                File.WriteAllText(_credentialStorePath, Convert.ToBase64String(protectedData));
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Failed to save credentials to file");
                throw;
            }
        }

        public void Dispose()
        {
            if (_disposed) return;

            // Clear encryption key from memory
            if (_encryptionKey != null)
            {
                Array.Clear(_encryptionKey, 0, _encryptionKey.Length);
            }

            _disposed = true;
            _logger?.LogInformation("Credential storage service disposed");
        }

        // Interface compatibility methods
        public bool StoreDomainCredentials(string domain, string username, SecureString password)
        {
            return StoreDomainCredentials($"domain_{domain}", domain, username, password, CredentialType.DomainUser);
        }

        public bool StoreAzureCredentials(string tenantId, string clientId, string clientSecret, string[] scopes = null)
        {
            var scopeString = scopes != null ? string.Join(",", scopes) : "";
            var secureSecret = new SecureString();
            foreach (char c in clientSecret ?? "") secureSecret.AppendChar(c);
            secureSecret.MakeReadOnly();
            return StoreDomainCredentials($"azure_{tenantId}", clientId, clientId, secureSecret, CredentialType.ApiKey);
        }

        public StoredCredentials GetDomainCredentials(string domain)
        {
            return GetCredentials($"domain_{domain}");
        }

        public StoredCredentials GetAzureCredentials(string tenantId)
        {
            return GetCredentials($"azure_{tenantId}");
        }

        public async Task<StoredCredentials> GetCredentialsAsync(string key)
        {
            return await Task.FromResult(GetCredentials(key));
        }

        public async Task<bool> StoreCredentialsAsync(string key, StoredCredentials credentials)
        {
            return await Task.FromResult(StoreCredentials(key, credentials));
        }

        public bool RemoveCredentials(string key)
        {
            return DeleteCredentials(key);
        }

        public IEnumerable<string> ListCredentialKeys()
        {
            return GetAllCredentialKeys();
        }

        public bool HasCredentials(string key)
        {
            return CredentialExists(key);
        }

        public bool ClearAllCredentials()
        {
            return ClearAll();
        }
    }

    #region Supporting Classes

    public class EncryptedCredential
    {
        public string Id { get; set; }
        public string ProfileName { get; set; }
        public string Domain { get; set; }
        public string Username { get; set; }
        public CredentialType Type { get; set; }
        public DateTime CreatedDate { get; set; }
        public DateTime LastUsedDate { get; set; }
        public string EncryptedPassword { get; set; }
        public bool IsActive { get; set; }
        public Dictionary<string, string> ApiSecrets { get; set; } = new();
        public Dictionary<string, object> AdditionalProperties { get; set; } = new();
    }

    public class CredentialInfo
    {
        public string Id { get; set; }
        public string ProfileName { get; set; }
        public string Domain { get; set; }
        public string Username { get; set; }
        public CredentialType Type { get; set; }
        public DateTime CreatedDate { get; set; }
        public DateTime LastUsedDate { get; set; }
    }

    public enum CredentialType
    {
        DomainUser,
        DomainAdmin,
        ServiceAccount,
        ApiKey,
        Certificate,
        ManagedIdentity
    }

    #endregion
}