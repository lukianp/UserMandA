using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using MandADiscoverySuite.Models;

namespace MandADiscoverySuite.Services
{
    /// <summary>
    /// Manages creation, update, selection and persistence of target profiles per company profile.
    /// Stores profiles at: C:\\discoverydata\\<CompanyProfile>\\Configuration\\target-profiles.json
    /// Encrypts ClientSecret using DPAPI (CurrentUser) via DataProtectionService.
    /// </summary>
    public class TargetProfileService
    {
        private static TargetProfileService _instance;
        public static TargetProfileService Instance => _instance ??= new TargetProfileService();

        private readonly object _lock = new();
        private List<TargetProfile> _cache = new();
        private string _loadedForCompany = string.Empty;

        private TargetProfileService() { }

        private static string GetConfigDirectory(string companyName)
        {
            var basePath = ConfigurationService.Instance.GetCompanyDataPath(companyName);
            var configDir = Path.Combine(basePath, "Configuration");
            if (!Directory.Exists(configDir)) Directory.CreateDirectory(configDir);
            return configDir;
        }

        private static string GetProfilesPath(string companyName)
        {
            return Path.Combine(GetConfigDirectory(companyName), "target-profiles.json");
        }

        public async Task<IReadOnlyList<TargetProfile>> GetProfilesAsync(string companyName)
        {
            lock (_lock)
            {
                if (_loadedForCompany.Equals(companyName, StringComparison.OrdinalIgnoreCase) && _cache.Any())
                {
                    return _cache.ToList();
                }
            }

            var path = GetProfilesPath(companyName);
            if (File.Exists(path))
            {
                var json = await File.ReadAllTextAsync(path).ConfigureAwait(false);
                var list = JsonSerializer.Deserialize<List<TargetProfile>>(json) ?? new List<TargetProfile>();
                lock (_lock)
                {
                    _cache = list;
                    _loadedForCompany = companyName;
                }
            }
            else
            {
                lock (_lock)
                {
                    _cache = new List<TargetProfile>();
                    _loadedForCompany = companyName;
                }
            }

            return _cache.ToList();
        }

        public async Task<TargetProfile> CreateOrUpdateAsync(string companyName, TargetProfile profile, string plainClientSecret)
        {
            if (profile == null) throw new ArgumentNullException(nameof(profile));
            if (string.IsNullOrWhiteSpace(profile.Name)) throw new ArgumentException("Profile name required", nameof(profile));

            // Encrypt secret only if provided; keep existing if not.
            if (!string.IsNullOrEmpty(plainClientSecret))
            {
                profile.ClientSecretEncrypted = DataProtectionService.ProtectToBase64(plainClientSecret);
            }

            profile.LastModified = DateTime.UtcNow;

            var list = (await GetProfilesAsync(companyName).ConfigureAwait(false)).ToList();
            var existing = list.FirstOrDefault(p => p.Id == profile.Id);
            if (existing == null)
            {
                list.Add(profile);
            }
            else
            {
                existing.Name = profile.Name;
                existing.TenantId = profile.TenantId;
                existing.ClientId = profile.ClientId;
                existing.Scopes = profile.Scopes ?? new List<string>();
                existing.IsActive = profile.IsActive;
                if (!string.IsNullOrEmpty(profile.ClientSecretEncrypted))
                {
                    existing.ClientSecretEncrypted = profile.ClientSecretEncrypted;
                }
                existing.LastModified = profile.LastModified;
            }

            await SaveAllAsync(companyName, list).ConfigureAwait(false);
            lock (_lock)
            {
                _cache = list;
                _loadedForCompany = companyName;
            }
            return profile;
        }

        public async Task DeleteAsync(string companyName, string profileId)
        {
            var list = (await GetProfilesAsync(companyName).ConfigureAwait(false)).ToList();
            list.RemoveAll(p => p.Id == profileId);
            await SaveAllAsync(companyName, list).ConfigureAwait(false);
            lock (_lock)
            {
                _cache = list;
                _loadedForCompany = companyName;
            }
        }

        public async Task<string> GetClientSecretAsync(string companyName, string profileId)
        {
            var list = await GetProfilesAsync(companyName).ConfigureAwait(false);
            var profile = list.FirstOrDefault(p => p.Id == profileId);
            if (profile == null) return string.Empty;
            return DataProtectionService.UnprotectFromBase64(profile.ClientSecretEncrypted);
        }

        public async Task<TargetProfile> GetActiveProfileAsync(string companyName)
        {
            var list = await GetProfilesAsync(companyName).ConfigureAwait(false);
            return list.FirstOrDefault(p => p.IsActive) ?? list.FirstOrDefault();
        }

        public async Task SetActiveAsync(string companyName, string profileId)
        {
            var list = (await GetProfilesAsync(companyName).ConfigureAwait(false)).ToList();
            foreach (var p in list) p.IsActive = p.Id == profileId;
            await SaveAllAsync(companyName, list).ConfigureAwait(false);
            lock (_lock)
            {
                _cache = list;
                _loadedForCompany = companyName;
            }
        }

        /// <summary>
        /// Auto-imports TargetProfile from App Registration credential outputs in Credentials folder
        /// Supports Windows DPAPI-encrypted credential files written by DiscoveryCreateAppRegistration.ps1
        /// Primary search: source company's Credentials
        /// Fallback search: selected target company's Credentials (ConfigurationService.SelectedTargetCompany)
        /// </summary>
        public async Task<bool> AutoImportFromAppRegistrationAsync(string companyName)
        {
            try
            {
                // Helper local function to try import from a credential folder
                static async Task<(bool ok, string tenantId, string clientId, string clientSecret)> TryImportAsync(string credDir)
                {
                    if (string.IsNullOrWhiteSpace(credDir) || !Directory.Exists(credDir))
                        return (false, string.Empty, string.Empty, string.Empty);

                    var summaryPath = Path.Combine(credDir, "credential_summary.json");
                    if (!File.Exists(summaryPath))
                    {
                        var legacy = Path.Combine(credDir, "discoverycredentials.summary.json");
                        if (File.Exists(legacy)) summaryPath = legacy; else return (false, string.Empty, string.Empty, string.Empty);
                    }

                    var summaryJson = await File.ReadAllTextAsync(summaryPath).ConfigureAwait(false);
                    using var doc = JsonDocument.Parse(summaryJson);
                    var root = doc.RootElement;
                    var tenantId = root.GetProperty("TenantId").GetString() ?? string.Empty;
                    var clientId = root.GetProperty("ClientId").GetString() ?? string.Empty;
                    var credFile = root.TryGetProperty("CredentialFile", out var cf) ? cf.GetString() : Path.Combine(credDir, "discoverycredentials.config");

                    string clientSecret = string.Empty;
                    if (!string.IsNullOrWhiteSpace(credFile) && File.Exists(credFile))
                    {
                        try
                        {
                            var ps = new PowerShellExecutionService();
                            var script = $@"
                                $enc = Get-Content -Raw -Path '{credFile.Replace("'","''")}'
                                $ss = ConvertTo-SecureString -String $enc
                                $bstr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($ss)
                                $json = [Runtime.InteropServices.Marshal]::PtrToStringUni($bstr)
                                Write-Output $json
                            ";
                            var r = await ps.ExecuteScriptAsync(script).ConfigureAwait(false);
                            var json = r.Output?.FirstOrDefault();
                            if (!string.IsNullOrWhiteSpace(json))
                            {
                                using var credDoc = JsonDocument.Parse(json);
                                var credRoot = credDoc.RootElement;
                                if (credRoot.TryGetProperty("ClientSecret", out var s))
                                    clientSecret = s.GetString() ?? string.Empty;
                                if (string.IsNullOrWhiteSpace(clientId) && credRoot.TryGetProperty("ClientId", out var cid))
                                    clientId = cid.GetString() ?? clientId;
                                if (string.IsNullOrWhiteSpace(tenantId) && credRoot.TryGetProperty("TenantId", out var tid))
                                    tenantId = tid.GetString() ?? tenantId;
                            }
                        }
                        catch
                        {
                            // ignore decryption errors
                        }
                    }

                    if (string.IsNullOrWhiteSpace(clientId) || string.IsNullOrWhiteSpace(tenantId))
                        return (false, string.Empty, string.Empty, string.Empty);

                    return (true, tenantId, clientId, clientSecret);
                }

                // 1) Try import from source company's Credentials
                var sourceRoot = ConfigurationService.Instance.GetCompanyDataPath(companyName);
                var credDir = Path.Combine(sourceRoot, "Credentials");
                var import = await TryImportAsync(credDir).ConfigureAwait(false);

                // 2) If not found, try selected target company's Credentials
                if (!import.ok)
                {
                    var targetCompany = ConfigurationService.Instance.SelectedTargetCompany;
                    if (!string.IsNullOrWhiteSpace(targetCompany))
                    {
                        var targetRoot = ConfigurationService.Instance.GetCompanyDataPath(targetCompany);
                        var targetCredDir = Path.Combine(targetRoot, "Credentials");
                        import = await TryImportAsync(targetCredDir).ConfigureAwait(false);
                    }
                }

                if (!import.ok)
                    return false;

                var (ok2, tenantId2, clientId2, clientSecret2) = import;

                // Merge/Save into target-profiles.json under the SOURCE company context
                var list = (await GetProfilesAsync(companyName).ConfigureAwait(false)).ToList();
                var existing = list.FirstOrDefault(p =>
                    p.ClientId.Equals(clientId2, StringComparison.OrdinalIgnoreCase) &&
                    p.TenantId.Equals(tenantId2, StringComparison.OrdinalIgnoreCase));

                if (existing != null)
                {
                    if (!string.IsNullOrWhiteSpace(clientSecret2) && string.IsNullOrWhiteSpace(existing.ClientSecretEncrypted))
                    {
                        existing.ClientSecretEncrypted = DataProtectionService.ProtectToBase64(clientSecret2);
                        await SaveAllAsync(companyName, list).ConfigureAwait(false);
                    }
                    lock (_lock)
                    {
                        _cache = list;
                        _loadedForCompany = companyName;
                    }
                    return true;
                }

                var profile = new TargetProfile
                {
                    Name = "AppRegistration",
                    TenantId = tenantId2,
                    ClientId = clientId2,
                    IsActive = !list.Any()
                };

                if (!string.IsNullOrWhiteSpace(clientSecret2))
                {
                    profile.ClientSecretEncrypted = DataProtectionService.ProtectToBase64(clientSecret2);
                }

                list.Add(profile);
                await SaveAllAsync(companyName, list).ConfigureAwait(false);
                lock (_lock)
                {
                    _cache = list;
                    _loadedForCompany = companyName;
                }
                return true;
            }
            catch
            {
                return false;
            }
        }

        private static async Task SaveAllAsync(string companyName, List<TargetProfile> profiles)
        {
            var path = GetProfilesPath(companyName);
            var dir = Path.GetDirectoryName(path);
            if (!Directory.Exists(dir)) Directory.CreateDirectory(dir!);
            var json = JsonSerializer.Serialize(profiles, new JsonSerializerOptions { WriteIndented = true });
            await File.WriteAllTextAsync(path, json).ConfigureAwait(false);
        }
    }
}
