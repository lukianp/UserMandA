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
    /// Service for managing module registry - the single source of truth for all discovery modules
    /// </summary>
    public class ModuleRegistryService : IDisposable
    {
        private static ModuleRegistryService _instance;
        private static readonly object _lock = new object();
        
        private ModuleRegistry _registry;
        private readonly string _registryPath;
        private readonly string _rootPath;
        private bool _disposed = false;

        public static ModuleRegistryService Instance
        {
            get
            {
                if (_instance == null)
                {
                    lock (_lock)
                    {
                        if (_instance == null)
                            _instance = new ModuleRegistryService();
                    }
                }
                return _instance;
            }
        }

        private ModuleRegistryService()
        {
            // CRITICAL FIX: Handle ConfigurationService initialization failure gracefully
            try
            {
                _rootPath = ConfigurationService.Instance?.EnterpriseDiscoveryRootPath;
            }
            catch (Exception ex)
            {
                // Fallback: Use default enterprise discovery path if ConfigurationService fails
                _rootPath = @"C:\enterprisediscovery";
                System.Diagnostics.Debug.WriteLine($"[ModuleRegistryService] ConfigurationService.Instance failed, using fallback path: {_rootPath}. Error: {ex.Message}");
            }

            // Use robust path resolution with multiple fallback strategies
            string assemblyDirectory;
            try
            {
                var assemblyLocation = System.Reflection.Assembly.GetExecutingAssembly().Location;
                assemblyDirectory = Path.GetDirectoryName(assemblyLocation);

                if (string.IsNullOrEmpty(assemblyDirectory))
                {
                    throw new InvalidOperationException("Assembly location returned null or empty directory");
                }
            }
            catch (Exception ex)
            {
                // Fallback 1: Use current directory
                assemblyDirectory = Environment.CurrentDirectory;
                System.Diagnostics.Debug.WriteLine($"[ModuleRegistryService] Assembly location failed, using current directory: {assemblyDirectory}. Error: {ex.Message}");

                // Fallback 2: If current directory doesn't contain Configuration, use enterprise discovery path
                var configTestPath = Path.Combine(assemblyDirectory, "Configuration");
                if (!Directory.Exists(configTestPath))
                {
                    assemblyDirectory = @"C:\enterprisediscovery";
                    System.Diagnostics.Debug.WriteLine($"[ModuleRegistryService] Configuration directory not found, using enterprise discovery path: {assemblyDirectory}");
                }
            }

            _registryPath = Path.Combine(assemblyDirectory, "Configuration", "ModuleRegistry.json");

            System.Diagnostics.Debug.WriteLine($"[ModuleRegistryService] Initialized with paths:");
            System.Diagnostics.Debug.WriteLine($"  Root Path: {_rootPath ?? "null"}");
            System.Diagnostics.Debug.WriteLine($"  Registry Path: {_registryPath}");
            System.Diagnostics.Debug.WriteLine($"  Registry File Exists: {File.Exists(_registryPath)}");
        }

        /// <summary>
        /// Loads the module registry from disk
        /// </summary>
        public async Task<ModuleRegistry> LoadRegistryAsync()
        {
            ThrowIfDisposed();

            try
            {
                if (!File.Exists(_registryPath))
                {
                    throw new FileNotFoundException($"Module registry not found at: {_registryPath}");
                }

                var json = await File.ReadAllTextAsync(_registryPath);
                _registry = JsonSerializer.Deserialize<ModuleRegistry>(json, new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                });

                if (_registry == null)
                {
                    throw new InvalidOperationException("Failed to deserialize module registry");
                }

                return _registry;
            }
            catch (Exception ex)
            {
                ErrorHandlingService.Instance.HandleException(ex, "Loading module registry");
                throw;
            }
        }

        /// <summary>
        /// Validates all modules in the registry against the filesystem
        /// </summary>
        public async Task<ModuleValidationResult> ValidateRegistryAsync()
        {
            ThrowIfDisposed();

            if (_registry == null)
                await LoadRegistryAsync();

            var result = new ModuleValidationResult();
            var modulesRoot = Path.Combine(_rootPath, _registry.BasePaths.ModulesRoot);

            foreach (var kvp in _registry.Modules)
            {
                var moduleId = kvp.Key;
                var moduleInfo = kvp.Value;
                var fullPath = Path.Combine(modulesRoot, moduleInfo.FilePath);

                if (File.Exists(fullPath))
                {
                    result.ValidModules.Add(moduleId, moduleInfo);
                }
                else
                {
                    result.MissingModules.Add(moduleId, new ModuleMismatch
                    {
                        ModuleId = moduleId,
                        ExpectedPath = fullPath,
                        Issue = $"Module file not found: {fullPath}"
                    });
                }
            }

            return result;
        }

        /// <summary>
        /// Auto-discovers modules on the filesystem that aren't in the registry
        /// </summary>
        public async Task<List<DiscoveredModule>> DiscoverNewModulesAsync()
        {
            ThrowIfDisposed();

            if (_registry == null)
                await LoadRegistryAsync();

            var discovered = new List<DiscoveredModule>();
            var modulesRoot = Path.Combine(_rootPath, _registry.BasePaths.ModulesRoot);
            
            if (!Directory.Exists(modulesRoot))
                return discovered;

            // Get all .psm1 files recursively
            var moduleFiles = Directory.GetFiles(modulesRoot, "*.psm1", SearchOption.AllDirectories);
            var registryPaths = _registry.Modules.Values.Select(m => 
                Path.Combine(modulesRoot, m.FilePath).Replace('/', Path.DirectorySeparatorChar)
            ).ToHashSet(StringComparer.OrdinalIgnoreCase);

            foreach (var file in moduleFiles)
            {
                if (!registryPaths.Contains(file))
                {
                    var relativePath = Path.GetRelativePath(modulesRoot, file).Replace(Path.DirectorySeparatorChar, '/');
                    var fileName = Path.GetFileNameWithoutExtension(file);
                    
                    discovered.Add(new DiscoveredModule
                    {
                        ModuleId = fileName,
                        FilePath = relativePath,
                        FullPath = file,
                        Category = InferCategoryFromPath(relativePath),
                        DisplayName = InferDisplayNameFromFileName(fileName),
                        Description = $"Auto-discovered module: {fileName}"
                    });
                }
            }

            return discovered;
        }

        /// <summary>
        /// Gets all available modules from the registry
        /// </summary>
        public async Task<List<ModuleInfo>> GetAvailableModulesAsync()
        {
            ThrowIfDisposed();

            if (_registry == null)
                await LoadRegistryAsync();

            var validation = await ValidateRegistryAsync();
            return validation.ValidModules.Values.ToList();
        }

        /// <summary>
        /// Gets enabled modules from the registry
        /// </summary>
        public async Task<List<ModuleInfo>> GetEnabledModulesAsync()
        {
            var modules = await GetAvailableModulesAsync();
            return modules.Where(m => m.Enabled).ToList();
        }

        /// <summary>
        /// Gets high priority modules from the registry
        /// </summary>
        public async Task<List<ModuleInfo>> GetHighPriorityModulesAsync()
        {
            var modules = await GetAvailableModulesAsync();
            return modules.Where(m => m.Priority <= 2).ToList();
        }

        /// <summary>
        /// Gets module by ID
        /// </summary>
        public async Task<ModuleInfo> GetModuleAsync(string moduleId)
        {
            if (string.IsNullOrWhiteSpace(moduleId))
                throw new ArgumentException("Module ID cannot be null or empty", nameof(moduleId));

            if (_registry == null)
                await LoadRegistryAsync();

            return _registry.Modules.TryGetValue(moduleId, out var module) ? module : null;
        }

        /// <summary>
        /// Gets the full path to a module file
        /// </summary>
        public async Task<string> GetModulePathAsync(string moduleId)
        {
            var module = await GetModuleAsync(moduleId);
            if (module == null)
                return null;

            return Path.Combine(_rootPath, _registry.BasePaths.ModulesRoot, module.FilePath);
        }

        /// <summary>
        /// Saves an updated registry back to disk
        /// </summary>
        public async Task SaveRegistryAsync(ModuleRegistry registry)
        {
            ThrowIfDisposed();

            if (registry == null)
                throw new ArgumentNullException(nameof(registry));

            try
            {
                registry.LastUpdated = DateTime.UtcNow.ToString("yyyy-MM-ddTHH:mm:ssZ");
                
                var json = JsonSerializer.Serialize(registry, new JsonSerializerOptions
                {
                    WriteIndented = true,
                    PropertyNamingPolicy = JsonNamingPolicy.CamelCase
                });

                await File.WriteAllTextAsync(_registryPath, json);
                _registry = registry;
            }
            catch (Exception ex)
            {
                ErrorHandlingService.Instance.HandleException(ex, "Saving module registry");
                throw;
            }
        }

        /// <summary>
        /// Generates a comprehensive health report of the module system
        /// </summary>
        public async Task<ModuleHealthReport> GenerateHealthReportAsync()
        {
            ThrowIfDisposed();

            var report = new ModuleHealthReport
            {
                GeneratedAt = DateTime.UtcNow,
                RegistryPath = _registryPath,
                ModulesRootPath = Path.Combine(_rootPath, _registry?.BasePaths?.ModulesRoot ?? "Modules")
            };

            try
            {
                // Load and validate registry
                if (_registry == null)
                    await LoadRegistryAsync();

                report.RegistryVersion = _registry.Version;
                report.TotalRegisteredModules = _registry.Modules.Count;

                var validation = await ValidateRegistryAsync();
                report.ValidModules = validation.ValidModules.Count;
                report.MissingModules = validation.MissingModules.Count;
                report.ModuleMismatches = validation.MissingModules.Values.ToList();

                var discovered = await DiscoverNewModulesAsync();
                report.UnregisteredModules = discovered.Count;
                report.DiscoveredModules = discovered;

                report.EnabledModules = _registry.Modules.Values.Count(m => m.Enabled);
                report.HighPriorityModules = _registry.Modules.Values.Count(m => m.Priority <= 2);

                // Category breakdown
                report.ModulesByCategory = _registry.Modules.Values
                    .GroupBy(m => m.Category)
                    .ToDictionary(g => g.Key, g => g.Count());

                report.IsHealthy = report.MissingModules == 0 && report.ValidModules > 0;
                report.HealthScore = report.TotalRegisteredModules > 0 
                    ? (double)report.ValidModules / report.TotalRegisteredModules * 100 
                    : 0;

            }
            catch (Exception ex)
            {
                report.Errors.Add($"Health check failed: {ex.Message}");
                report.IsHealthy = false;
                report.HealthScore = 0;
            }

            return report;
        }

        #region Private Methods

        private string InferCategoryFromPath(string relativePath)
        {
            var parts = relativePath.Split('/', StringSplitOptions.RemoveEmptyEntries);
            if (parts.Length < 2) return "Other";

            return parts[0] switch
            {
                "Discovery" => "Infrastructure",
                "Assessment" => "Risk Assessment", 
                "Compliance" => "Compliance",
                "CloudDiscovery" => "Cloud",
                "Security" => "Security",
                "Identity" => "Identity",
                _ => "Other"
            };
        }

        private string InferDisplayNameFromFileName(string fileName)
        {
            // Convert PascalCase to space-separated words
            return System.Text.RegularExpressions.Regex.Replace(fileName, "([a-z])([A-Z])", "$1 $2")
                .Replace("Discovery", "")
                .Trim();
        }

        #endregion

        #region IDisposable

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
                    _registry = null;
                }
                _disposed = true;
            }
        }

        private void ThrowIfDisposed()
        {
            if (_disposed)
                throw new ObjectDisposedException(nameof(ModuleRegistryService));
        }

        #endregion
    }

    #region Supporting Models

    public class ModuleRegistry
    {
        public string Version { get; set; }
        public string LastUpdated { get; set; }
        public ModuleBasePaths BasePaths { get; set; }
        public Dictionary<string, ModuleInfo> Modules { get; set; } = new Dictionary<string, ModuleInfo>();
    }

    public class ModuleBasePaths
    {
        public string ModulesRoot { get; set; }
        public string ScriptsRoot { get; set; }
    }

    public class ModuleInfo
    {
        public string DisplayName { get; set; }
        public string Description { get; set; }
        public string FilePath { get; set; }
        public string Category { get; set; }
        public string Icon { get; set; }
        public int Priority { get; set; }
        public bool Enabled { get; set; }
        public int Timeout { get; set; }

        // Command parameter for navigation - will be set to the module key/ID
        public string CommandParameter { get; set; }
    }

    public class ModuleValidationResult
    {
        public Dictionary<string, ModuleInfo> ValidModules { get; set; } = new Dictionary<string, ModuleInfo>();
        public Dictionary<string, ModuleMismatch> MissingModules { get; set; } = new Dictionary<string, ModuleMismatch>();
    }

    public class ModuleMismatch
    {
        public string ModuleId { get; set; }
        public string ExpectedPath { get; set; }
        public string Issue { get; set; }
    }

    public class DiscoveredModule
    {
        public string ModuleId { get; set; }
        public string FilePath { get; set; }
        public string FullPath { get; set; }
        public string Category { get; set; }
        public string DisplayName { get; set; }
        public string Description { get; set; }
    }

    public class ModuleHealthReport
    {
        public DateTime GeneratedAt { get; set; }
        public string RegistryPath { get; set; }
        public string ModulesRootPath { get; set; }
        public string RegistryVersion { get; set; }
        public int TotalRegisteredModules { get; set; }
        public int ValidModules { get; set; }
        public int MissingModules { get; set; }
        public int UnregisteredModules { get; set; }
        public int EnabledModules { get; set; }
        public int HighPriorityModules { get; set; }
        public Dictionary<string, int> ModulesByCategory { get; set; } = new Dictionary<string, int>();
        public List<ModuleMismatch> ModuleMismatches { get; set; } = new List<ModuleMismatch>();
        public List<DiscoveredModule> DiscoveredModules { get; set; } = new List<DiscoveredModule>();
        public List<string> Errors { get; set; } = new List<string>();
        public bool IsHealthy { get; set; }
        public double HealthScore { get; set; }
    }

    #endregion
}