using System;
using System.Threading.Tasks;
using MandADiscoverySuite.Models;

namespace MandADiscoverySuite.Services
{
    /// <summary>
    /// Service interface for detecting and analyzing IT environments
    /// </summary>
    public interface IEnvironmentDetectionService
    {
        /// <summary>
        /// Detects the environment type for a given company profile
        /// </summary>
        /// <param name="companyProfile">Company profile to analyze</param>
        /// <returns>Environment detection result</returns>
        Task<EnvironmentDetectionResult> DetectEnvironmentAsync(CompanyProfile companyProfile);

        /// <summary>
        /// Detects the environment type for a target profile based on connection information
        /// </summary>
        /// <param name="targetProfile">Target profile to analyze</param>
        /// <returns>Environment detection result</returns>
        Task<EnvironmentDetectionResult> DetectEnvironmentAsync(TargetProfile targetProfile);

        /// <summary>
        /// Gets environment status for display in UI
        /// </summary>
        /// <param name="companyProfile">Company profile to get status for</param>
        /// <returns>Environment status string</returns>
        Task<string> GetEnvironmentStatusAsync(CompanyProfile companyProfile);

        /// <summary>
        /// Validates that environment detection data is available
        /// </summary>
        /// <param name="companyProfile">Company profile to validate</param>
        /// <returns>True if detection data is available</returns>
        Task<bool> HasDetectionDataAsync(CompanyProfile companyProfile);

        /// <summary>
        /// Refreshes environment detection by running discovery modules
        /// </summary>
        /// <param name="companyProfile">Company profile to refresh detection for</param>
        /// <returns>True if refresh was successful</returns>
        Task<bool> RefreshEnvironmentDetectionAsync(CompanyProfile companyProfile);
    }

    /// <summary>
    /// Result of environment detection analysis
    /// </summary>
    public class EnvironmentDetectionResult
    {
        public EnvironmentType EnvironmentType { get; set; } = EnvironmentType.Unknown;
        public string PrimaryDomain { get; set; } = string.Empty;
        public string DisplayStatus { get; set; } = string.Empty;
        public bool HasActiveDirectory { get; set; }
        public bool HasAzureAD { get; set; }
        public bool HasExchangeOnline { get; set; }
        public bool HasExchangeOnPremises { get; set; }
        public bool HasSharePointOnline { get; set; }
        public bool HasSharePointOnPremises { get; set; }
        public bool HasTeams { get; set; }
        public bool HasOffice365 { get; set; }
        public string[] CloudServices { get; set; } = Array.Empty<string>();
        public string[] OnPremServices { get; set; } = Array.Empty<string>();
        public DateTime DetectedAt { get; set; } = DateTime.UtcNow;
        public string DetectionSource { get; set; } = string.Empty;
        public string Notes { get; set; } = string.Empty;
        
        /// <summary>
        /// Gets a user-friendly environment description
        /// </summary>
        public string GetEnvironmentDescription()
        {
            return EnvironmentType switch
            {
                EnvironmentType.OnPremises => "On-Premises Active Directory",
                EnvironmentType.Azure => "Azure Active Directory / Microsoft 365",
                EnvironmentType.Hybrid => "Hybrid (On-Premises + Azure)",
                _ => "Unknown Environment"
            };
        }

        /// <summary>
        /// Gets a status indicator color for UI display
        /// </summary>
        public string GetStatusColor()
        {
            return EnvironmentType switch
            {
                EnvironmentType.OnPremises => "#FF4CAF50", // Green
                EnvironmentType.Azure => "#FF2196F3", // Blue  
                EnvironmentType.Hybrid => "#FFFF9800", // Orange
                _ => "#FF9E9E9E" // Gray
            };
        }
    }
}