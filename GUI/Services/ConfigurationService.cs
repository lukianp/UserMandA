using System;
using System.IO;
using System.Linq;

namespace MandADiscoverySuite.Services
{
    /// <summary>
    /// Service for managing application configuration
    /// </summary>
    public class ConfigurationService
    {
        private static ConfigurationService _instance;
        private static readonly object _lock = new object();

        /// <summary>
        /// Gets the singleton instance of ConfigurationService
        /// </summary>
        public static ConfigurationService Instance
        {
            get
            {
                if (_instance == null)
                {
                    lock (_lock)
                    {
                        if (_instance == null)
                            _instance = new ConfigurationService();
                    }
                }
                return _instance;
            }
        }

        /// <summary>
        /// The root directory where PowerShell modules and scripts are located
        /// </summary>
        public string EnterpriseDiscoveryRootPath { get; set; } = @"C:\enterprisediscovery";

        /// <summary>
        /// The directory where PowerShell scripts are located
        /// </summary>
        public string ScriptsPath => Path.Combine(EnterpriseDiscoveryRootPath, "Scripts");

        /// <summary>
        /// The directory where PowerShell modules are located
        /// </summary>
        public string ModulesPath => Path.Combine(EnterpriseDiscoveryRootPath, "Modules", "Discovery");

        /// <summary>
        /// The root directory where discovery data is stored
        /// </summary>
        public string DiscoveryDataRootPath 
        { 
            get => _discoveryDataRootPath; 
            set 
            {
                // Prevent setting to current working directory which causes path issues
                if (!string.IsNullOrWhiteSpace(value) && value != Environment.CurrentDirectory)
                {
                    _discoveryDataRootPath = value;
                    System.Diagnostics.Debug.WriteLine($"ConfigurationService: DiscoveryDataRootPath set to: {value}");
                }
                else
                {
                    System.Diagnostics.Debug.WriteLine($"ConfigurationService: Rejected setting DiscoveryDataRootPath to current directory: {value}");
                }
            }
        }
        
        private string _discoveryDataRootPath = @"C:\DiscoveryData";

        /// <summary>
        /// Gets the discovery data path for a specific company (handles case insensitivity)
        /// </summary>
        public string GetCompanyDataPath(string companyName)
        {
            if (string.IsNullOrWhiteSpace(companyName))
                throw new ArgumentException("Company name cannot be null or empty", nameof(companyName));

            var exactPath = Path.Combine(DiscoveryDataRootPath, companyName);
            
            // If exact path exists, return it
            if (Directory.Exists(exactPath))
                return exactPath;

            // Try to find case-insensitive match in root
            if (Directory.Exists(DiscoveryDataRootPath))
            {
                var directories = Directory.GetDirectories(DiscoveryDataRootPath);
                var matchingDir = directories.FirstOrDefault(dir => 
                    Path.GetFileName(dir).Equals(companyName, StringComparison.OrdinalIgnoreCase));
                
                if (matchingDir != null)
                {
                    System.Diagnostics.Debug.WriteLine($"Found case-insensitive match: {companyName} -> {Path.GetFileName(matchingDir)}");
                    return matchingDir;
                }
                
                // Also check Profiles subdirectory
                var profilesPath = Path.Combine(DiscoveryDataRootPath, "Profiles");
                if (Directory.Exists(profilesPath))
                {
                    var profileDirectories = Directory.GetDirectories(profilesPath);
                    var matchingProfileDir = profileDirectories.FirstOrDefault(dir => 
                        Path.GetFileName(dir).Equals(companyName, StringComparison.OrdinalIgnoreCase));
                    
                    if (matchingProfileDir != null)
                    {
                        System.Diagnostics.Debug.WriteLine($"Found profile match: {companyName} -> {Path.GetFileName(matchingProfileDir)}");
                        return matchingProfileDir;
                    }
                }
            }

            // Return original path if no match found
            return exactPath;
        }

        /// <summary>
        /// Gets the raw data path for a specific company
        /// </summary>
        public string GetCompanyRawDataPath(string companyName)
        {
            if (string.IsNullOrWhiteSpace(companyName))
                throw new ArgumentException("Company name cannot be null or empty", nameof(companyName));

            return Path.Combine(GetCompanyDataPath(companyName), "Raw");
        }

        /// <summary>
        /// Gets the exports path for a specific company
        /// </summary>
        public string GetCompanyExportsPath(string companyName)
        {
            if (string.IsNullOrWhiteSpace(companyName))
                throw new ArgumentException("Company name cannot be null or empty", nameof(companyName));

            return Path.Combine(GetCompanyDataPath(companyName), "Exports");
        }

        /// <summary>
        /// Gets the full path to the DiscoveryModuleLauncher.ps1 script
        /// </summary>
        public string GetDiscoveryLauncherScriptPath()
        {
            return Path.Combine(ScriptsPath, "DiscoveryModuleLauncher.ps1");
        }

        /// <summary>
        /// Gets the full path to the DiscoveryCreateAppRegistration.ps1 script
        /// </summary>
        public string GetAppRegistrationScriptPath()
        {
            return Path.Combine(ScriptsPath, "DiscoveryCreateAppRegistration.ps1");
        }

        /// <summary>
        /// Validates that all required paths exist
        /// </summary>
        public PathValidationResult ValidatePaths()
        {
            var result = new PathValidationResult();

            if (!Directory.Exists(EnterpriseDiscoveryRootPath))
            {
                result.Errors.Add($"Enterprise discovery root path does not exist: {EnterpriseDiscoveryRootPath}");
            }

            if (!Directory.Exists(ScriptsPath))
            {
                result.Errors.Add($"Scripts path does not exist: {ScriptsPath}");
            }

            if (!Directory.Exists(ModulesPath))
            {
                result.Errors.Add($"Modules path does not exist: {ModulesPath}");
            }

            if (!File.Exists(GetDiscoveryLauncherScriptPath()))
            {
                result.Errors.Add($"Discovery launcher script does not exist: {GetDiscoveryLauncherScriptPath()}");
            }

            // Discovery data path doesn't need to exist - it will be created as needed
            result.IsValid = result.Errors.Count == 0;
            return result;
        }

        private ConfigurationService()
        {
            // Private constructor for singleton
        }
    }

    /// <summary>
    /// Result of path validation
    /// </summary>
    public class PathValidationResult
    {
        public bool IsValid { get; set; }
        public System.Collections.Generic.List<string> Errors { get; set; } = new System.Collections.Generic.List<string>();
    }
}