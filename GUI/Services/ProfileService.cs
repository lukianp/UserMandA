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
    /// Service for managing company profiles
    /// </summary>
    public class ProfileService : IDisposable
    {
        private readonly string _profilesPath;
        private readonly string _profilesFile;
        private List<CompanyProfile> _cachedProfiles;

        public ProfileService()
        {
            var appDataPath = Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData);
            _profilesPath = Path.Combine(appDataPath, "MandADiscoverySuite");
            _profilesFile = Path.Combine(_profilesPath, "profiles.json");
            
            Directory.CreateDirectory(_profilesPath);
            _cachedProfiles = new List<CompanyProfile>();
        }

        /// <summary>
        /// Gets all company profiles
        /// </summary>
        public async Task<List<CompanyProfile>> GetProfilesAsync()
        {
            ThrowIfDisposed();
            
            try
            {
                if (File.Exists(_profilesFile))
                {
                    var json = await File.ReadAllTextAsync(_profilesFile);
                    var profiles = JsonSerializer.Deserialize<List<CompanyProfile>>(json, new JsonSerializerOptions
                    {
                        PropertyNameCaseInsensitive = true
                    });
                    
                    _cachedProfiles = profiles ?? new List<CompanyProfile>();
                }
                else
                {
                    // Create default profiles if none exist
                    _cachedProfiles = CreateDefaultProfiles();
                    await SaveProfilesAsync();
                }

                return _cachedProfiles.OrderBy(p => p.CompanyName).ToList();
            }
            catch (Exception ex)
            {
                ErrorHandlingService.Instance.HandleException(ex, "Loading company profiles");
                return _cachedProfiles ?? new List<CompanyProfile>();
            }
        }

        /// <summary>
        /// Gets a specific profile by ID
        /// </summary>
        public async Task<CompanyProfile> GetProfileAsync(string profileId)
        {
            if (string.IsNullOrWhiteSpace(profileId))
                throw new ArgumentException("Profile ID cannot be null or empty", nameof(profileId));

            var profiles = await GetProfilesAsync();
            return profiles.FirstOrDefault(p => p.Id == profileId);
        }

        /// <summary>
        /// Creates a new company profile
        /// </summary>
        public async Task<CompanyProfile> CreateProfileAsync(CompanyProfile profile)
        {
            ThrowIfDisposed();
            
            if (profile == null)
                throw new ArgumentNullException(nameof(profile));

            if (string.IsNullOrWhiteSpace(profile.CompanyName))
                throw new ArgumentException("Company name is required", nameof(profile));

            // Ensure unique ID
            profile.Id = Guid.NewGuid().ToString();
            profile.Created = DateTime.Now;
            profile.LastModified = DateTime.Now;
            profile.IsActive = true;

            // Validate no duplicate names
            var existingProfiles = await GetProfilesAsync();
            if (existingProfiles.Any(p => p.CompanyName.Equals(profile.CompanyName, StringComparison.OrdinalIgnoreCase)))
            {
                throw new InvalidOperationException($"A profile with the name '{profile.CompanyName}' already exists");
            }

            _cachedProfiles.Add(profile);
            await SaveProfilesAsync();

            return profile;
        }

        /// <summary>
        /// Updates an existing company profile
        /// </summary>
        public async Task<CompanyProfile> UpdateProfileAsync(CompanyProfile profile)
        {
            if (profile == null)
                throw new ArgumentNullException(nameof(profile));

            var existingProfile = _cachedProfiles.FirstOrDefault(p => p.Id == profile.Id);
            if (existingProfile == null)
                throw new InvalidOperationException($"Profile with ID '{profile.Id}' not found");

            // Update properties
            existingProfile.CompanyName = profile.CompanyName;
            existingProfile.Description = profile.Description;
            existingProfile.DomainController = profile.DomainController;
            existingProfile.TenantId = profile.TenantId;
            existingProfile.IsActive = profile.IsActive;
            existingProfile.Configuration = profile.Configuration;
            existingProfile.LastModified = DateTime.Now;

            await SaveProfilesAsync();
            return existingProfile;
        }

        /// <summary>
        /// Deletes a company profile
        /// </summary>
        public async Task<bool> DeleteProfileAsync(string profileId)
        {
            if (string.IsNullOrWhiteSpace(profileId))
                throw new ArgumentException("Profile ID cannot be null or empty", nameof(profileId));

            var profile = _cachedProfiles.FirstOrDefault(p => p.Id == profileId);
            if (profile == null)
                return false;

            _cachedProfiles.Remove(profile);
            await SaveProfilesAsync();
            
            // Also delete associated data directory
            try
            {
                var dataPath = Path.Combine(GetProfileDataPath(profile.CompanyName));
                if (Directory.Exists(dataPath))
                {
                    Directory.Delete(dataPath, true);
                }
            }
            catch (Exception ex)
            {
                ErrorHandlingService.Instance.HandleException(ex, "Deleting profile data directory");
            }

            return true;
        }

        /// <summary>
        /// Imports a profile from a file
        /// </summary>
        public async Task<CompanyProfile> ImportProfileAsync(string filePath)
        {
            if (string.IsNullOrWhiteSpace(filePath))
                throw new ArgumentException("File path cannot be null or empty", nameof(filePath));
            if (!File.Exists(filePath))
                throw new FileNotFoundException($"Profile file not found: {filePath}");

            try
            {
                var json = await File.ReadAllTextAsync(filePath);
                var profile = JsonSerializer.Deserialize<CompanyProfile>(json, new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                });

                if (profile == null)
                    throw new InvalidOperationException("Invalid profile file format");

                // Ensure unique ID and update timestamps
                profile.Id = Guid.NewGuid().ToString();
                profile.Created = DateTime.Now;
                profile.LastModified = DateTime.Now;

                // Check for duplicate names and modify if necessary
                var existingProfiles = await GetProfilesAsync();
                var originalName = profile.CompanyName;
                var counter = 1;

                while (existingProfiles.Any(p => p.CompanyName.Equals(profile.CompanyName, StringComparison.OrdinalIgnoreCase)))
                {
                    profile.CompanyName = $"{originalName} ({counter})";
                    counter++;
                }

                return await CreateProfileAsync(profile);
            }
            catch (JsonException ex)
            {
                throw new InvalidOperationException($"Invalid JSON format in profile file: {ex.Message}");
            }
        }

        /// <summary>
        /// Exports a profile to a file
        /// </summary>
        public async Task ExportProfileAsync(string profileId, string filePath)
        {
            if (string.IsNullOrWhiteSpace(profileId))
                throw new ArgumentException("Profile ID cannot be null or empty", nameof(profileId));
            if (string.IsNullOrWhiteSpace(filePath))
                throw new ArgumentException("File path cannot be null or empty", nameof(filePath));

            var profile = await GetProfileAsync(profileId);
            if (profile == null)
                throw new InvalidOperationException($"Profile with ID '{profileId}' not found");

            var json = JsonSerializer.Serialize(profile, new JsonSerializerOptions
            {
                WriteIndented = true
            });

            await File.WriteAllTextAsync(filePath, json);
        }

        /// <summary>
        /// Gets the data directory path for a profile - points to C:\discoverydata for storing results
        /// Discovery modules (.psm1) are loaded from the build directory, not from here
        /// </summary>
        public string GetProfileDataPath(string companyName)
        {
            if (string.IsNullOrWhiteSpace(companyName))
                throw new ArgumentException("Company name cannot be null or empty", nameof(companyName));

            // Profile data is stored in C:\discoverydata\{companyName}
            return Path.Combine(@"C:\discoverydata", companyName);
        }

        /// <summary>
        /// Validates profile configuration
        /// </summary>
        public ProfileValidationResult ValidateProfile(CompanyProfile profile)
        {
            var result = new ProfileValidationResult();

            if (profile == null)
            {
                result.AddError("Profile cannot be null");
                return result;
            }

            if (string.IsNullOrWhiteSpace(profile.CompanyName))
                result.AddError("Company name is required");

            if (profile.CompanyName?.Length > 100)
                result.AddError("Company name cannot exceed 100 characters");

            if (!string.IsNullOrWhiteSpace(profile.DomainController))
            {
                if (!IsValidDomainController(profile.DomainController))
                    result.AddWarning("Domain controller format may be invalid");
            }

            if (!string.IsNullOrWhiteSpace(profile.TenantId))
            {
                if (!IsValidGuid(profile.TenantId))
                    result.AddWarning("Tenant ID should be a valid GUID");
            }

            return result;
        }

        /// <summary>
        /// Gets profile statistics
        /// </summary>
        public async Task<ProfileStatistics> GetProfileStatisticsAsync(string profileId)
        {
            if (string.IsNullOrWhiteSpace(profileId))
                throw new ArgumentException("Profile ID cannot be null or empty", nameof(profileId));

            var profile = await GetProfileAsync(profileId);
            if (profile == null)
                return null;

            var stats = new ProfileStatistics
            {
                ProfileId = profileId,
                CompanyName = profile.CompanyName,
                Created = profile.Created,
                LastModified = profile.LastModified,
                LastDiscoveryRun = GetLastDiscoveryRunTime(profile.CompanyName),
                TotalDiscoveryRuns = GetTotalDiscoveryRuns(profile.CompanyName),
                DataSizeBytes = GetProfileDataSize(profile.CompanyName)
            };

            return stats;
        }

        #region Private Methods

        private async Task SaveProfilesAsync()
        {
            try
            {
                var json = JsonSerializer.Serialize(_cachedProfiles, new JsonSerializerOptions
                {
                    WriteIndented = true
                });

                await File.WriteAllTextAsync(_profilesFile, json);
            }
            catch (Exception ex)
            {
                ErrorHandlingService.Instance.HandleException(ex, "Saving profiles to file");
                throw;
            }
        }

        private List<CompanyProfile> CreateDefaultProfiles()
        {
            return new List<CompanyProfile>
            {
                new CompanyProfile
                {
                    CompanyName = "Sample Corporation",
                    Description = "Sample company profile for demonstration",
                    DomainController = "dc.sample.com",
                    TenantId = Guid.NewGuid().ToString(),
                    IsActive = true
                }
            };
        }

        private bool IsValidDomainController(string domainController)
        {
            if (string.IsNullOrWhiteSpace(domainController))
                return false;

            // Basic validation - should contain at least one dot and valid characters
            return domainController.Contains('.') && 
                   domainController.All(c => char.IsLetterOrDigit(c) || c == '.' || c == '-');
        }

        private bool IsValidGuid(string guidString)
        {
            return Guid.TryParse(guidString, out _);
        }

        private DateTime? GetLastDiscoveryRunTime(string companyName)
        {
            if (string.IsNullOrWhiteSpace(companyName))
                return null;

            try
            {
                var dataPath = GetProfileDataPath(companyName);
                if (!Directory.Exists(dataPath))
                    return null;

                var files = Directory.GetFiles(dataPath, "*.csv", SearchOption.AllDirectories);
                if (!files.Any())
                    return null;

                return files.Select(f => new FileInfo(f).LastWriteTime).Max();
            }
            catch
            {
                return null;
            }
        }

        private int GetTotalDiscoveryRuns(string companyName)
        {
            if (string.IsNullOrWhiteSpace(companyName))
                return 0;

            try
            {
                var dataPath = GetProfileDataPath(companyName);
                if (!Directory.Exists(dataPath))
                    return 0;

                // Count unique discovery sessions based on file timestamps
                var files = Directory.GetFiles(dataPath, "*.csv", SearchOption.AllDirectories);
                var uniqueDates = files.Select(f => new FileInfo(f).LastWriteTime.Date).Distinct();
                return uniqueDates.Count();
            }
            catch
            {
                return 0;
            }
        }

        private long GetProfileDataSize(string companyName)
        {
            if (string.IsNullOrWhiteSpace(companyName))
                return 0;

            try
            {
                var dataPath = GetProfileDataPath(companyName);
                if (!Directory.Exists(dataPath))
                    return 0;

                var files = Directory.GetFiles(dataPath, "*.*", SearchOption.AllDirectories);
                return files.Sum(f => new FileInfo(f).Length);
            }
            catch
            {
                return 0;
            }
        }

        #endregion

        #region IDisposable

        private bool _disposed = false;

        public void Dispose()
        {
            Dispose(true);
            GC.SuppressFinalize(this);
        }

        protected virtual void Dispose(bool disposing)
        {
            if (!_disposed)
            {
                if (disposing)
                {
                    // Dispose managed resources
                    _cachedProfiles?.Clear();
                }
                
                _disposed = true;
            }
        }

        private void ThrowIfDisposed()
        {
            if (_disposed)
                throw new ObjectDisposedException(nameof(ProfileService));
        }

        #endregion
    }

    /// <summary>
    /// Profile validation result
    /// </summary>
    public class ProfileValidationResult
    {
        public List<string> Errors { get; } = new List<string>();
        public List<string> Warnings { get; } = new List<string>();
        public bool IsValid => !Errors.Any();

        public void AddError(string error) => Errors.Add(error);
        public void AddWarning(string warning) => Warnings.Add(warning);
    }

    /// <summary>
    /// Profile statistics
    /// </summary>
    public class ProfileStatistics
    {
        public string ProfileId { get; set; }
        public string CompanyName { get; set; }
        public DateTime Created { get; set; }
        public DateTime LastModified { get; set; }
        public DateTime? LastDiscoveryRun { get; set; }
        public int TotalDiscoveryRuns { get; set; }
        public long DataSizeBytes { get; set; }

        public string DataSizeText
        {
            get
            {
                if (DataSizeBytes == 0) return "0 B";
                if (DataSizeBytes < 1024) return $"{DataSizeBytes} B";
                if (DataSizeBytes < 1024 * 1024) return $"{DataSizeBytes / 1024.0:F1} KB";
                if (DataSizeBytes < 1024 * 1024 * 1024) return $"{DataSizeBytes / (1024.0 * 1024):F1} MB";
                return $"{DataSizeBytes / (1024.0 * 1024 * 1024):F1} GB";
            }
        }
    }
}