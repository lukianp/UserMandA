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

