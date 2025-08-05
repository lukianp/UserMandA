using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace MandADiscoverySuite.Services
{
    /// <summary>
    /// Service interface for managing company profiles
    /// </summary>
    public interface IProfileService
    {
        /// <summary>
        /// Event raised when profiles are changed
        /// </summary>
        event EventHandler ProfilesChanged;

        /// <summary>
        /// Gets all available company profiles
        /// </summary>
        /// <returns>Collection of company profiles</returns>
        Task<IEnumerable<CompanyProfile>> GetProfilesAsync();

        /// <summary>
        /// Gets a specific company profile by name
        /// </summary>
        /// <param name="profileName">Profile name</param>
        /// <returns>Company profile or null if not found</returns>
        Task<CompanyProfile> GetProfileAsync(string profileName);

        /// <summary>
        /// Creates a new company profile
        /// </summary>
        /// <param name="profile">Profile to create</param>
        /// <returns>Created profile</returns>
        Task<CompanyProfile> CreateProfileAsync(CompanyProfile profile);

        /// <summary>
        /// Updates an existing company profile
        /// </summary>
        /// <param name="profile">Profile to update</param>
        /// <returns>Updated profile</returns>
        Task<CompanyProfile> UpdateProfileAsync(CompanyProfile profile);

        /// <summary>
        /// Deletes a company profile
        /// </summary>
        /// <param name="profileName">Profile name to delete</param>
        /// <returns>True if deleted successfully</returns>
        Task<bool> DeleteProfileAsync(string profileName);

        /// <summary>
        /// Gets the current active profile
        /// </summary>
        /// <returns>Current active profile or null</returns>
        Task<CompanyProfile> GetCurrentProfileAsync();

        /// <summary>
        /// Sets the current active profile
        /// </summary>
        /// <param name="profileName">Profile name to set as active</param>
        /// <returns>True if set successfully</returns>
        Task<bool> SetCurrentProfileAsync(string profileName);

        /// <summary>
        /// Validates a profile configuration
        /// </summary>
        /// <param name="profile">Profile to validate</param>
        /// <returns>Validation result</returns>
        Task<ProfileValidationResult> ValidateProfileAsync(CompanyProfile profile);

        /// <summary>
        /// Gets profile statistics and health information
        /// </summary>
        /// <param name="profileName">Profile name</param>
        /// <returns>Profile statistics</returns>
        Task<ProfileStatistics> GetProfileStatisticsAsync(string profileName);
    }

    /// <summary>
    /// Company profile model
    /// </summary>
    public class CompanyProfile
    {
        public string Name { get; set; }
        public string DisplayName { get; set; }
        public string Description { get; set; }
        public string DataPath { get; set; }
        public DateTime CreatedDate { get; set; }
        public DateTime LastModifiedDate { get; set; }
        public bool IsActive { get; set; }
        public EnvironmentType EnvironmentType { get; set; }
        public string PrimaryDomain { get; set; }
        public string TenantId { get; set; }
        public List<string> AdditionalDomains { get; set; } = new List<string>();
        public Dictionary<string, string> Settings { get; set; } = new Dictionary<string, string>();
        public ProfileCredentials Credentials { get; set; } = new ProfileCredentials();
    }

    /// <summary>
    /// Profile credentials (encrypted storage)
    /// </summary>
    public class ProfileCredentials
    {
        public string AdminUsername { get; set; }
        public string EncryptedPassword { get; set; }
        public string ServicePrincipalId { get; set; }
        public string EncryptedServicePrincipalSecret { get; set; }
        public Dictionary<string, string> AdditionalCredentials { get; set; } = new Dictionary<string, string>();
    }

    /// <summary>
    /// Environment types
    /// </summary>
    public enum EnvironmentType
    {
        Unknown,
        OnPremisesOnly,
        CloudOnly,
        Hybrid
    }

    /// <summary>
    /// Profile validation result
    /// </summary>
    public class ProfileValidationResult
    {
        public bool IsValid { get; set; }
        public List<string> Errors { get; set; } = new List<string>();
        public List<string> Warnings { get; set; } = new List<string>();
        public List<string> Recommendations { get; set; } = new List<string>();
    }

    /// <summary>
    /// Profile statistics
    /// </summary>
    public class ProfileStatistics
    {
        public string ProfileName { get; set; }
        public DateTime LastDiscoveryRun { get; set; }
        public int TotalDiscoveryRuns { get; set; }
        public Dictionary<string, DateTime> ModuleLastRunTimes { get; set; } = new Dictionary<string, DateTime>();
        public Dictionary<string, bool> ModuleHealthStatus { get; set; } = new Dictionary<string, bool>();
        public long DataSizeBytes { get; set; }
        public int TotalDataFiles { get; set; }
        public Dictionary<string, int> DataCountsByType { get; set; } = new Dictionary<string, int>();
        public List<string> RecentErrors { get; set; } = new List<string>();
        public double OverallHealthScore { get; set; }
    }
}