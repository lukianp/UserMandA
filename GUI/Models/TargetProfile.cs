using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;
using MandADiscoverySuite.Services;

namespace MandADiscoverySuite.Models
{
    /// <summary>
    /// Represents a target tenant/profile used for migrations.
    /// Secrets are stored encrypted on disk and never logged.
    /// </summary>
    public class TargetProfile
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();
        public string Name { get; set; } = string.Empty;
        public string TenantId { get; set; } = string.Empty;
        public string ClientId { get; set; } = string.Empty;

        // Encrypted client secret persisted as Base64; do not log or expose.
        public string ClientSecretEncrypted { get; set; } = string.Empty;
        
        // Environment information
        public string Environment { get; set; } = string.Empty; // OnPremises, Azure, Hybrid
        public string Domain { get; set; } = string.Empty;
        public string Region { get; set; } = string.Empty;
        public string TenantName { get; set; } = string.Empty; // For SharePoint URL construction
        public string SharePointUrl { get; set; } = string.Empty; // Custom SharePoint URL if not standard
        public string SqlConnectionString { get; set; } = string.Empty; // Azure SQL connection string
        
        // Connection credentials - all encrypted
        public string UsernameEncrypted { get; set; } = string.Empty;
        public string PasswordEncrypted { get; set; } = string.Empty;
        public string CertificateThumbprint { get; set; } = string.Empty;
        
        // Graph API configuration
        public List<string> Scopes { get; set; } = new List<string>
        {
            "User.Read.All",
            "Group.Read.All", 
            "Directory.Read.All",
            "Mail.ReadWrite",
            "Sites.ReadWrite.All",
            "Files.ReadWrite.All"
        };
        
        // Connection test results
        public DateTime? LastConnectionTest { get; set; }
        public bool? LastConnectionTestResult { get; set; }
        public string LastConnectionTestMessage { get; set; } = string.Empty;

        public DateTime Created { get; set; } = DateTime.UtcNow;
        public DateTime LastModified { get; set; } = DateTime.UtcNow;

        // Active selection for migration context
        public bool IsActive { get; set; }
        
        // Encryption key - unique per profile for security
        private static readonly byte[] _additionalEntropy = Encoding.UTF8.GetBytes("MandA-Discovery-Suite-2025");
        
        /// <summary>
        /// Encrypts a plaintext string using Windows DPAPI
        /// </summary>
        public string EncryptString(string plaintext)
        {
            if (string.IsNullOrEmpty(plaintext))
                return string.Empty;
                
            try
            {
                var plaintextBytes = Encoding.UTF8.GetBytes(plaintext);
                var encryptedBytes = ProtectedData.Protect(plaintextBytes, _additionalEntropy, DataProtectionScope.CurrentUser);
                return Convert.ToBase64String(encryptedBytes);
            }
            catch (Exception)
            {
                // If encryption fails, return empty string for security
                return string.Empty;
            }
        }
        
        /// <summary>
        /// Decrypts an encrypted string using Windows DPAPI
        /// </summary>
        public string DecryptString(string encryptedBase64)
        {
            if (string.IsNullOrEmpty(encryptedBase64))
                return string.Empty;
                
            try
            {
                var encryptedBytes = Convert.FromBase64String(encryptedBase64);
                var plaintextBytes = ProtectedData.Unprotect(encryptedBytes, _additionalEntropy, DataProtectionScope.CurrentUser);
                return Encoding.UTF8.GetString(plaintextBytes);
            }
            catch (Exception)
            {
                // If decryption fails, return empty string
                return string.Empty;
            }
        }
        
        /// <summary>
        /// Sets the client secret in encrypted form
        /// </summary>
        public void SetClientSecret(string plainSecret)
        {
            ClientSecretEncrypted = EncryptString(plainSecret);
            LastModified = DateTime.UtcNow;
        }
        
        /// <summary>
        /// Gets the decrypted client secret (use carefully)
        /// </summary>
        public string GetClientSecret()
        {
            return DecryptString(ClientSecretEncrypted);
        }
        
        /// <summary>
        /// Sets the username in encrypted form
        /// </summary>
        public void SetUsername(string plainUsername)
        {
            UsernameEncrypted = EncryptString(plainUsername);
            LastModified = DateTime.UtcNow;
        }
        
        /// <summary>
        /// Gets the decrypted username
        /// </summary>
        public string GetUsername()
        {
            return DecryptString(UsernameEncrypted);
        }
        
        /// <summary>
        /// Sets the password in encrypted form
        /// </summary>
        public void SetPassword(string plainPassword)
        {
            PasswordEncrypted = EncryptString(plainPassword);
            LastModified = DateTime.UtcNow;
        }
        
        /// <summary>
        /// Gets the decrypted password (use carefully)
        /// </summary>
        public string GetPassword()
        {
            return DecryptString(PasswordEncrypted);
        }
        
        /// <summary>
        /// Validates the profile has minimum required configuration
        /// </summary>
        public bool IsValid()
        {
            return !string.IsNullOrWhiteSpace(Name) && 
                   !string.IsNullOrWhiteSpace(TenantId) &&
                   (!string.IsNullOrWhiteSpace(ClientSecretEncrypted) || 
                    !string.IsNullOrWhiteSpace(CertificateThumbprint));
        }
        
        /// <summary>
        /// Creates a TargetProfile from app registration credential files
        /// </summary>
        public static async Task<TargetProfile?> FromAppRegistrationAsync(string companyName, string credentialsPath)
        {
            try
            {
                if (!Directory.Exists(credentialsPath))
                    return null;

                var summaryPath = Path.Combine(credentialsPath, "credential_summary.json");
                if (!File.Exists(summaryPath))
                {
                    // Try legacy name
                    var legacyPath = Path.Combine(credentialsPath, "discoverycredentials.summary.json");
                    if (File.Exists(legacyPath))
                        summaryPath = legacyPath;
                    else
                        return null;
                }

                var summaryJson = await File.ReadAllTextAsync(summaryPath);
                using var doc = System.Text.Json.JsonDocument.Parse(summaryJson);
                var root = doc.RootElement;

                var profile = new TargetProfile
                {
                    Name = companyName,
                    TenantId = root.GetProperty("TenantId").GetString() ?? string.Empty,
                    ClientId = root.GetProperty("ClientId").GetString() ?? string.Empty,
                    Environment = "Azure",
                    Domain = root.TryGetProperty("Domain", out var domainProp) ? domainProp.GetString() ?? string.Empty : string.Empty
                };

                // Load encrypted client secret from credential file
                var credFile = root.TryGetProperty("CredentialFile", out var cf) ? cf.GetString() : 
                    Path.Combine(credentialsPath, "targetcredentials.config");

                if (!string.IsNullOrWhiteSpace(credFile) && File.Exists(credFile))
                {
                    var clientSecret = await DecryptCredentialFileAsync(credFile);
                    if (!string.IsNullOrWhiteSpace(clientSecret))
                    {
                        profile.SetClientSecret(clientSecret);
                    }
                }

                return profile.IsValid() ? profile : null;
            }
            catch
            {
                return null;
            }
        }

        /// <summary>
        /// Decrypts credential file using PowerShell DPAPI decryption
        /// </summary>
        private static async Task<string> DecryptCredentialFileAsync(string credentialFile)
        {
            try
            {
                var ps = new PowerShellExecutionService();
                var script = $@"
                    try {{
                        $enc = Get-Content -Raw -Path '{credentialFile.Replace("'", "''")}'
                        $ss = ConvertTo-SecureString -String $enc
                        $bstr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($ss)
                        $json = [Runtime.InteropServices.Marshal]::PtrToStringUni($bstr)
                        $credData = ConvertFrom-Json $json
                        Write-Output $credData.ClientSecret
                    }} catch {{
                        Write-Output ''
                    }}
                ";

                var result = await ps.ExecuteScriptAsync(script);
                return result.Output?.FirstOrDefault() ?? string.Empty;
            }
            catch
            {
                return string.Empty;
            }
        }

        /// <summary>
        /// Gets a safe display string that doesn't expose secrets
        /// </summary>
        public override string ToString()
        {
            var hasSecret = !string.IsNullOrWhiteSpace(ClientSecretEncrypted);
            var hasCert = !string.IsNullOrWhiteSpace(CertificateThumbprint);
            var authMethod = hasSecret ? "Secret" : hasCert ? "Certificate" : "None";
            
            return $"{Name} ({Environment}) - Auth: {authMethod}";
        }
    }
    
    /// <summary>
    /// Environment types for target profiles
    /// </summary>
    public enum EnvironmentType
    {
        Unknown,
        OnPremises,
        Azure,
        Hybrid
    }
    
    /// <summary>
    /// Connection test result
    /// </summary>
    public class ConnectionTestResult
    {
        public bool Success { get; set; }
        public string Message { get; set; } = string.Empty;
        public DateTime TestedAt { get; set; } = DateTime.UtcNow;
        public TimeSpan Duration { get; set; }
        public Dictionary<string, object> Details { get; set; } = new Dictionary<string, object>();
    }
}
