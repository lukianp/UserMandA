using System;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Newtonsoft.Json;
using MandADiscoverySuite.Models;

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
        /// Supports MANDA_DISCOVERY_PATH environment variable override
        /// </summary>
        public string DiscoveryDataRootPath 
        { 
            get => _discoveryDataRootPath ?? GetDefaultDiscoveryDataPath(); 
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
        
        private string _discoveryDataRootPath;

        /// <summary>
        /// Gets the default discovery data path, checking environment variable first
        /// </summary>
        private string GetDefaultDiscoveryDataPath()
        {
            // Check for environment variable override first
            var envPath = Environment.GetEnvironmentVariable("MANDA_DISCOVERY_PATH");
            if (!string.IsNullOrWhiteSpace(envPath))
            {
                // Normalize the path to lowercase for Windows consistency
                var normalizedPath = envPath.ToLowerInvariant().TrimEnd('\\', '/');
                System.Diagnostics.Debug.WriteLine($"ConfigurationService: Using MANDA_DISCOVERY_PATH: {normalizedPath}");
                return normalizedPath;
            }

            // Default to standardized lowercase path
            return @"c:\discoverydata";
        }

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

        #region Configuration Persistence

        private AppConfiguration _applicationSettings;
        private UserPreferences _userPreferences;
        private SessionState _sessionState;
        
        private readonly string _settingsPath;
        private readonly string _preferencesPath;
        private readonly string _sessionPath;
        private readonly object _settingsLock = new object();

        /// <summary>
        /// Gets the current application settings
        /// </summary>
        public AppConfiguration Settings
        {
            get
            {
                if (_applicationSettings == null)
                {
                    LoadSettings();
                }
                return _applicationSettings;
            }
        }

        /// <summary>
        /// Gets the current user preferences
        /// </summary>
        public UserPreferences Preferences
        {
            get
            {
                if (_userPreferences == null)
                {
                    LoadPreferences();
                }
                return _userPreferences;
            }
        }

        /// <summary>
        /// Gets the current session state
        /// </summary>
        public SessionState Session
        {
            get
            {
                if (_sessionState == null)
                {
                    LoadSession();
                }
                return _sessionState;
            }
        }

        /// <summary>
        /// Saves application settings to disk
        /// </summary>
        public async Task SaveSettingsAsync()
        {
            if (_applicationSettings == null) return;

            try
            {
                lock (_settingsLock)
                {
                    _applicationSettings.LastSaved = DateTime.Now;
                    var json = JsonConvert.SerializeObject(_applicationSettings, Formatting.Indented);
                    
                    var directory = Path.GetDirectoryName(_settingsPath);
                    if (!Directory.Exists(directory))
                        Directory.CreateDirectory(directory);
                        
                    File.WriteAllText(_settingsPath, json);
                }
            }
            catch (Exception ex)
            {
                ErrorHandlingService.Instance.HandleException(ex, "Failed to save settings");
                throw;
            }
        }

        /// <summary>
        /// Saves user preferences to disk
        /// </summary>
        public async Task SavePreferencesAsync()
        {
            if (_userPreferences == null) return;

            try
            {
                lock (_settingsLock)
                {
                    var json = JsonConvert.SerializeObject(_userPreferences, Formatting.Indented);
                    
                    var directory = Path.GetDirectoryName(_preferencesPath);
                    if (!Directory.Exists(directory))
                        Directory.CreateDirectory(directory);
                        
                    File.WriteAllText(_preferencesPath, json);
                }
            }
            catch (Exception ex)
            {
                ErrorHandlingService.Instance.HandleException(ex, "Failed to save preferences");
                throw;
            }
        }

        /// <summary>
        /// Saves session state to disk
        /// </summary>
        public async Task SaveSessionAsync()
        {
            if (_sessionState == null) return;

            try
            {
                lock (_settingsLock)
                {
                    _sessionState.LastActivity = DateTime.Now;
                    var json = JsonConvert.SerializeObject(_sessionState, Formatting.Indented);
                    
                    var directory = Path.GetDirectoryName(_sessionPath);
                    if (!Directory.Exists(directory))
                        Directory.CreateDirectory(directory);
                        
                    File.WriteAllText(_sessionPath, json);
                }
            }
            catch (Exception ex)
            {
                ErrorHandlingService.Instance.HandleException(ex, "Failed to save session");
                throw;
            }
        }

        /// <summary>
        /// Loads application settings from disk
        /// </summary>
        public void LoadSettings()
        {
            try
            {
                if (File.Exists(_settingsPath))
                {
                    var json = File.ReadAllText(_settingsPath);
                    _applicationSettings = JsonConvert.DeserializeObject<AppConfiguration>(json);
                    
                    // Validate loaded settings
                    var validationResult = ValidateSettings(_applicationSettings);
                    if (!validationResult.IsValid)
                    {
                        ErrorHandlingService.Instance.LogWarning($"Settings validation failed, using defaults: {string.Join(", ", validationResult.Errors)}");
                        _applicationSettings = new AppConfiguration();
                    }
                }
                else
                {
                    _applicationSettings = new AppConfiguration();
                    _ = SaveSettingsAsync(); // Save default settings
                }
            }
            catch (Exception ex)
            {
                ErrorHandlingService.Instance.HandleException(ex, "Failed to load settings, using defaults");
                _applicationSettings = new AppConfiguration();
            }
        }

        /// <summary>
        /// Loads user preferences from disk
        /// </summary>
        public void LoadPreferences()
        {
            try
            {
                if (File.Exists(_preferencesPath))
                {
                    var json = File.ReadAllText(_preferencesPath);
                    _userPreferences = JsonConvert.DeserializeObject<UserPreferences>(json);
                }
                else
                {
                    _userPreferences = new UserPreferences();
                    _ = SavePreferencesAsync(); // Save default preferences
                }
            }
            catch (Exception ex)
            {
                ErrorHandlingService.Instance.HandleException(ex, "Failed to load preferences, using defaults");
                _userPreferences = new UserPreferences();
            }
        }

        /// <summary>
        /// Loads session state from disk
        /// </summary>
        public void LoadSession()
        {
            try
            {
                if (File.Exists(_sessionPath))
                {
                    var json = File.ReadAllText(_sessionPath);
                    _sessionState = JsonConvert.DeserializeObject<SessionState>(json);
                }
                else
                {
                    _sessionState = new SessionState();
                }
            }
            catch (Exception ex)
            {
                ErrorHandlingService.Instance.HandleException(ex, "Failed to load session state, creating new");
                _sessionState = new SessionState();
            }
        }

        /// <summary>
        /// Validates application settings
        /// </summary>
        public ConfigurationValidationResult ValidateSettings(AppConfiguration settings)
        {
            var result = new ConfigurationValidationResult();
            
            if (settings == null)
            {
                result.AddError("Settings cannot be null");
                return result;
            }

            if (settings.FontSize < 10 || settings.FontSize > 24)
            {
                result.AddWarning($"Font size {settings.FontSize} is outside recommended range (10-24)");
                settings.FontSize = Math.Max(10, Math.Min(24, settings.FontSize));
            }

            if (settings.AutoSaveIntervalMinutes < 1 || settings.AutoSaveIntervalMinutes > 60)
            {
                result.AddWarning($"Auto-save interval {settings.AutoSaveIntervalMinutes} is outside valid range (1-60 minutes)");
                settings.AutoSaveIntervalMinutes = Math.Max(1, Math.Min(60, settings.AutoSaveIntervalMinutes));
            }

            var validThemes = new[] { "Dark", "Light", "Auto", "HighContrast" };
            if (!validThemes.Contains(settings.Theme))
            {
                result.AddWarning($"Unknown theme '{settings.Theme}', defaulting to 'Dark'");
                settings.Theme = "Dark";
            }

            return result;
        }

        /// <summary>
        /// Resets all settings to defaults
        /// </summary>
        public async Task ResetToDefaultsAsync()
        {
            _applicationSettings = new AppConfiguration();
            _userPreferences = new UserPreferences();
            _sessionState = new SessionState();
            
            await SaveSettingsAsync();
            await SavePreferencesAsync();
            await SaveSessionAsync();
        }

        /// <summary>
        /// Creates a backup of current configuration
        /// </summary>
        public async Task CreateBackupAsync()
        {
            try
            {
                var backupDirectory = Path.Combine(Path.GetDirectoryName(_settingsPath), "Backups");
                Directory.CreateDirectory(backupDirectory);
                
                var timestamp = DateTime.Now.ToString("yyyyMMdd_HHmmss");
                
                // Backup settings
                if (File.Exists(_settingsPath))
                {
                    var settingsBackup = Path.Combine(backupDirectory, $"settings_{timestamp}.json");
                    File.Copy(_settingsPath, settingsBackup);
                }
                
                // Backup preferences
                if (File.Exists(_preferencesPath))
                {
                    var preferencesBackup = Path.Combine(backupDirectory, $"preferences_{timestamp}.json");
                    File.Copy(_preferencesPath, preferencesBackup);
                }
                
                // Cleanup old backups (keep last 10)
                var backupFiles = Directory.GetFiles(backupDirectory, "*.json")
                    .OrderByDescending(f => File.GetCreationTime(f))
                    .Skip(10);
                
                foreach (var oldBackup in backupFiles)
                {
                    File.Delete(oldBackup);
                }
            }
            catch (Exception ex)
            {
                ErrorHandlingService.Instance.HandleException(ex, "Failed to create configuration backup");
            }
        }

        /// <summary>
        /// Exports configuration to a file
        /// </summary>
        public async Task ExportConfigurationAsync(string filePath)
        {
            try
            {
                var exportData = new
                {
                    Settings = _applicationSettings,
                    Preferences = _userPreferences,
                    ExportedOn = DateTime.Now,
                    Version = "1.0.0"
                };
                
                var json = JsonConvert.SerializeObject(exportData, Formatting.Indented);
                await File.WriteAllTextAsync(filePath, json);
            }
            catch (Exception ex)
            {
                ErrorHandlingService.Instance.HandleException(ex, "Failed to export configuration");
                throw;
            }
        }

        /// <summary>
        /// Imports configuration from a file
        /// </summary>
        public async Task ImportConfigurationAsync(string filePath)
        {
            try
            {
                var json = await File.ReadAllTextAsync(filePath);
                dynamic importData = JsonConvert.DeserializeObject(json);
                
                if (importData?.Settings != null)
                {
                    _applicationSettings = JsonConvert.DeserializeObject<AppConfiguration>(importData.Settings.ToString());
                    await SaveSettingsAsync();
                }
                
                if (importData?.Preferences != null)
                {
                    _userPreferences = JsonConvert.DeserializeObject<UserPreferences>(importData.Preferences.ToString());
                    await SavePreferencesAsync();
                }
            }
            catch (Exception ex)
            {
                ErrorHandlingService.Instance.HandleException(ex, "Failed to import configuration");
                throw;
            }
        }

        #endregion

        private ConfigurationService()
        {
            // Private constructor for singleton
            var appDataPath = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData), "MandADiscoverySuite");
            Directory.CreateDirectory(appDataPath);
            
            _settingsPath = Path.Combine(appDataPath, "settings.json");
            _preferencesPath = Path.Combine(appDataPath, "preferences.json");
            _sessionPath = Path.Combine(appDataPath, "session.json");
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