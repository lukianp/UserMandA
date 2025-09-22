using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using MandADiscoverySuite.Services;

namespace MandADiscoverySuite.Utilities
{
    /// <summary>
    /// Utility for generating and maintaining the module registry
    /// </summary>
    public static class ModuleRegistryGenerator
    {
        /// <summary>
        /// Generates a new module registry by scanning the filesystem
        /// </summary>
        public static ModuleRegistry GenerateRegistryFromFilesystem(string rootPath)
        {
            if (string.IsNullOrWhiteSpace(rootPath))
                throw new ArgumentException("Root path cannot be null or empty", nameof(rootPath));

            if (!Directory.Exists(rootPath))
                throw new DirectoryNotFoundException($"Root path does not exist: {rootPath}");

            var registry = new ModuleRegistry
            {
                Version = "1.0",
                LastUpdated = DateTime.UtcNow.ToString("yyyy-MM-ddTHH:mm:ssZ"),
                BasePaths = new ModuleBasePaths
                {
                    ModulesRoot = "Modules",
                    ScriptsRoot = "Scripts"
                }
            };

            var modulesPath = Path.Combine(rootPath, "Modules");
            if (!Directory.Exists(modulesPath))
            {
                Console.WriteLine($"Warning: Modules directory not found at {modulesPath}");
                return registry;
            }

            // Find all .psm1 files
            var moduleFiles = Directory.GetFiles(modulesPath, "*.psm1", SearchOption.AllDirectories);
            Console.WriteLine($"Found {moduleFiles.Length} module files");

            foreach (var file in moduleFiles)
            {
                try
                {
                    var relativePath = Path.GetRelativePath(modulesPath, file).Replace(Path.DirectorySeparatorChar, '/');
                    var fileName = Path.GetFileNameWithoutExtension(file);
                    var directory = Path.GetDirectoryName(relativePath);

                    var moduleInfo = new ModuleInfo
                    {
                        DisplayName = GenerateDisplayName(fileName),
                        Description = GenerateDescription(fileName, directory),
                        FilePath = relativePath,
                        Category = InferCategory(directory, fileName),
                        Icon = InferIcon(directory, fileName),
                        Priority = InferPriority(fileName, directory),
                        Enabled = InferDefaultEnabled(fileName, directory),
                        Timeout = InferTimeout(fileName)
                    };

                    registry.Modules[fileName] = moduleInfo;
                    Console.WriteLine($"Added: {fileName} -> {relativePath}");
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Error processing {file}: {ex.Message}");
                }
            }

            Console.WriteLine($"Generated registry with {registry.Modules.Count} modules");
            return registry;
        }

        /// <summary>
        /// Validates an existing registry and reports issues
        /// </summary>
        public static async Task<ModuleHealthReport> ValidateRegistryAsync(string registryPath, string rootPath)
        {
            var service = ModuleRegistryService.Instance;
            
            try
            {
                await service.LoadRegistryAsync();
                return await service.GenerateHealthReportAsync();
            }
            catch (Exception ex)
            {
                return new ModuleHealthReport
                {
                    GeneratedAt = DateTime.UtcNow,
                    RegistryPath = registryPath,
                    ModulesRootPath = Path.Combine(rootPath, "Modules"),
                    IsHealthy = false,
                    HealthScore = 0,
                    Errors = { $"Failed to validate registry: {ex.Message}" }
                };
            }
        }

        /// <summary>
        /// Merges discovered modules into an existing registry
        /// </summary>
        public static ModuleRegistry MergeDiscoveredModules(ModuleRegistry existingRegistry, List<DiscoveredModule> discoveredModules)
        {
            if (existingRegistry == null)
                throw new ArgumentNullException(nameof(existingRegistry));

            if (discoveredModules == null || !discoveredModules.Any())
                return existingRegistry;

            foreach (var discovered in discoveredModules)
            {
                if (!existingRegistry.Modules.ContainsKey(discovered.ModuleId))
                {
                    existingRegistry.Modules[discovered.ModuleId] = new ModuleInfo
                    {
                        DisplayName = discovered.DisplayName,
                        Description = discovered.Description,
                        FilePath = discovered.FilePath,
                        Category = discovered.Category,
                        Icon = InferIcon(Path.GetDirectoryName(discovered.FilePath), discovered.ModuleId),
                        Priority = InferPriority(discovered.ModuleId, Path.GetDirectoryName(discovered.FilePath)),
                        Enabled = InferDefaultEnabled(discovered.ModuleId, Path.GetDirectoryName(discovered.FilePath)),
                        Timeout = InferTimeout(discovered.ModuleId)
                    };

                    Console.WriteLine($"Merged discovered module: {discovered.ModuleId}");
                }
            }

            existingRegistry.LastUpdated = DateTime.UtcNow.ToString("yyyy-MM-ddTHH:mm:ssZ");
            return existingRegistry;
        }

        #region Private Helper Methods

        private static string GenerateDisplayName(string fileName)
        {
            // Remove common suffixes and convert PascalCase to space-separated
            var name = fileName
                .Replace("Discovery", "")
                .Replace("Engine", "")
                .Replace("Framework", "")
                .Replace("Management", "")
                .Trim();

            // Convert PascalCase to spaces
            name = System.Text.RegularExpressions.Regex.Replace(name, "([a-z])([A-Z])", "$1 $2");
            
            // Add "Discovery" back if it makes sense
            if (!name.Contains("Discovery") && !name.Contains("Analysis") && !name.Contains("Assessment"))
            {
                name += " Discovery";
            }

            return name.Trim();
        }

        private static string GenerateDescription(string fileName, string directory)
        {
            var displayName = GenerateDisplayName(fileName);
            var category = InferCategory(directory, fileName);

            return category switch
            {
                "Identity" => $"Discover and analyze {displayName.ToLower()} components",
                "Infrastructure" => $"Discover {displayName.ToLower()} infrastructure and configurations",
                "Security" => $"Analyze {displayName.ToLower()} security configurations and policies",
                "Cloud" => $"Discover {displayName.ToLower()} cloud resources and services",
                "Collaboration" => $"Discover {displayName.ToLower()} collaboration tools and configurations",
                "Applications" => $"Discover {displayName.ToLower()} applications and dependencies",
                "Data" => $"Analyze {displayName.ToLower()} data structures and governance",
                "Compliance" => $"Assess {displayName.ToLower()} compliance and regulatory requirements",
                "Risk Assessment" => $"Evaluate {displayName.ToLower()} risks and security posture",
                _ => $"Discover and analyze {displayName.ToLower()}"
            };
        }

        private static string InferCategory(string directory, string fileName)
        {
            // First check directory
            if (!string.IsNullOrEmpty(directory))
            {
                var dirLower = directory.ToLowerInvariant();
                if (dirLower.Contains("assessment")) return "Risk Assessment";
                if (dirLower.Contains("compliance")) return "Compliance";  
                if (dirLower.Contains("cloud")) return "Cloud";
                if (dirLower.Contains("security")) return "Security";
                if (dirLower.Contains("identity")) return "Identity";
            }

            // Then check filename
            var nameLower = fileName.ToLowerInvariant();
            if (nameLower.Contains("azure") || nameLower.Contains("cloud") || nameLower.Contains("multicloud")) return "Cloud";
            if (nameLower.Contains("activedirectory") || nameLower.Contains("entraid") || nameLower.Contains("identity") || nameLower.Contains("graph")) return "Identity";
            if (nameLower.Contains("exchange") || nameLower.Contains("teams") || nameLower.Contains("sharepoint") || nameLower.Contains("powerplatform")) return "Collaboration";
            if (nameLower.Contains("security") || nameLower.Contains("certificate") || nameLower.Contains("threat") || nameLower.Contains("paloalto") || nameLower.Contains("gpo")) return "Security";
            if (nameLower.Contains("network") || nameLower.Contains("server") || nameLower.Contains("physical") || nameLower.Contains("infrastructure")) return "Infrastructure";
            if (nameLower.Contains("application") || nameLower.Contains("dependency")) return "Applications";
            if (nameLower.Contains("data") || nameLower.Contains("database") || nameLower.Contains("sql")) return "Data";
            if (nameLower.Contains("storage") || nameLower.Contains("file") || nameLower.Contains("backup")) return "Storage";
            if (nameLower.Contains("vmware") || nameLower.Contains("container") || nameLower.Contains("virtualization")) return "Virtualization";
            if (nameLower.Contains("licensing") || nameLower.Contains("compliance")) return "Compliance";
            if (nameLower.Contains("risk") || nameLower.Contains("assessment")) return "Risk Assessment";
            if (nameLower.Contains("intune") || nameLower.Contains("device")) return "Device Management";
            if (nameLower.Contains("scheduled") || nameLower.Contains("task")) return "Operations";
            
            return "Other";
        }

        private static string InferIcon(string directory, string fileName)
        {
            var category = InferCategory(directory, fileName);
            var nameLower = fileName.ToLowerInvariant();

            // Specific icons for well-known modules
            if (nameLower.Contains("activedirectory")) return "👥";
            if (nameLower.Contains("azure")) return "☁️";
            if (nameLower.Contains("exchange")) return "📧";
            if (nameLower.Contains("teams")) return "💬";
            if (nameLower.Contains("sharepoint")) return "📚";
            if (nameLower.Contains("sql")) return "🗄️";
            if (nameLower.Contains("file")) return "📁";
            if (nameLower.Contains("network")) return "🌐";
            if (nameLower.Contains("security")) return "🛡️";
            if (nameLower.Contains("certificate")) return "🔐";
            if (nameLower.Contains("printer")) return "🖨️";
            if (nameLower.Contains("vmware")) return "💻";
            if (nameLower.Contains("physical")) return "🖥️";
            if (nameLower.Contains("storage")) return "💾";
            if (nameLower.Contains("backup")) return "💿";
            if (nameLower.Contains("application")) return "📦";
            if (nameLower.Contains("licensing")) return "📄";
            if (nameLower.Contains("risk")) return "⚖️";
            if (nameLower.Contains("compliance")) return "📋";
            if (nameLower.Contains("threat")) return "🚨";
            if (nameLower.Contains("data")) return "📊";
            if (nameLower.Contains("intune")) return "📱";
            if (nameLower.Contains("container")) return "📦";
            if (nameLower.Contains("scheduled")) return "⏰";

            // Fallback to category-based icons
            return category switch
            {
                "Identity" => "🔑",
                "Infrastructure" => "🏗️",
                "Security" => "🔒",
                "Cloud" => "☁️",
                "Collaboration" => "🤝",
                "Applications" => "📱",
                "Data" => "📊",
                "Storage" => "💾",
                "Virtualization" => "💻",
                "Compliance" => "📋",
                "Risk Assessment" => "⚖️",
                "Device Management" => "📱",
                "Operations" => "⚙️",
                _ => "🔧"
            };
        }

        private static int InferPriority(string fileName, string directory)
        {
            var nameLower = fileName.ToLowerInvariant();
            
            // Priority 1 (High) - Essential for M&A
            if (nameLower.Contains("activedirectory") || 
                nameLower.Contains("azure") || 
                nameLower.Contains("exchange") ||
                nameLower.Contains("sql") ||
                nameLower.Contains("network") ||
                nameLower.Contains("physical") ||
                nameLower.Contains("file") ||
                nameLower.Contains("application") ||
                nameLower.Contains("security") ||
                nameLower.Contains("risk") ||
                nameLower.Contains("licensing") ||
                nameLower.Contains("entraid") ||
                nameLower.Contains("gpo") ||
                nameLower.Contains("multidomainforest") ||
                nameLower.Contains("environmentrisk"))
            {
                return 1;
            }

            // Priority 2 (Medium) - Important but not critical
            if (nameLower.Contains("sharepoint") ||
                nameLower.Contains("intune") ||
                nameLower.Contains("vmware") ||
                nameLower.Contains("storage") ||
                nameLower.Contains("certificate") ||
                nameLower.Contains("multicloud"))
            {
                return 2;
            }

            // Priority 3 (Low) - Nice to have
            return 3;
        }

        private static bool InferDefaultEnabled(string fileName, string directory)
        {
            // Enable high priority modules by default
            return InferPriority(fileName, directory) <= 2;
        }

        private static int InferTimeout(string fileName)
        {
            var nameLower = fileName.ToLowerInvariant();

            // Longer timeouts for modules that scan large datasets
            if (nameLower.Contains("file") || nameLower.Contains("storage")) return 1800; // 30 minutes
            if (nameLower.Contains("sharepoint") || nameLower.Contains("azureresource")) return 1200; // 20 minutes
            if (nameLower.Contains("exchange") || nameLower.Contains("activedirectory")) return 900; // 15 minutes
            if (nameLower.Contains("activedirectory")) return 600; // 10 minutes

            // Standard timeout for most modules
            return 300; // 5 minutes
        }

        #endregion

        /// <summary>
        /// Console application entry point for registry management
        /// </summary>
#if DEBUG
        public static async Task<int> Main(string[] args)
        {
            try
            {
                if (args.Length == 0)
                {
                    PrintUsage();
                    return 1;
                }

                var command = args[0].ToLowerInvariant();
                var rootPath = args.Length > 1 ? args[1] : GetDefaultRootPath();

                switch (command)
                {
                    case "generate":
                        await GenerateRegistryCommand(rootPath);
                        return 0;

                    case "validate":
                        return await ValidateRegistryCommand(rootPath);

                    case "health":
                        await HealthReportCommand(rootPath);
                        return 0;

                    case "merge":
                        await MergeCommand(rootPath);
                        return 0;

                    default:
                        Console.WriteLine($"Unknown command: {command}");
                        PrintUsage();
                        return 1;
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error: {ex.Message}");
                return 1;
            }
        }
#endif

        private static void PrintUsage()
        {
            Console.WriteLine("Module Registry Generator");
            Console.WriteLine("Usage: ModuleRegistryGenerator <command> [rootPath]");
            Console.WriteLine();
            Console.WriteLine("Commands:");
            Console.WriteLine("  generate  - Generate new registry from filesystem");
            Console.WriteLine("  validate  - Validate existing registry");
            Console.WriteLine("  health    - Generate health report");
            Console.WriteLine("  merge     - Merge discovered modules into existing registry");
            Console.WriteLine();
            Console.WriteLine($"Default rootPath: {GetDefaultRootPath()}");
        }

        private static async Task GenerateRegistryCommand(string rootPath)
        {
            Console.WriteLine($"Generating module registry from: {rootPath}");
            var registry = GenerateRegistryFromFilesystem(rootPath);
            
            var outputPath = Path.Combine(Environment.CurrentDirectory, "ModuleRegistry.json");
            await ModuleRegistryService.Instance.SaveRegistryAsync(registry);
            
            Console.WriteLine($"Registry generated with {registry.Modules.Count} modules");
            Console.WriteLine($"Saved to: {outputPath}");
        }

        private static async Task<int> ValidateRegistryCommand(string rootPath)
        {
            Console.WriteLine($"Validating module registry against: {rootPath}");
            var report = await ValidateRegistryAsync("", rootPath);
            
            Console.WriteLine($"Health Score: {report.HealthScore:F1}%");
            Console.WriteLine($"Valid Modules: {report.ValidModules}");
            Console.WriteLine($"Missing Modules: {report.MissingModules}");
            Console.WriteLine($"Unregistered Modules: {report.UnregisteredModules}");

            if (report.ModuleMismatches.Any())
            {
                Console.WriteLine("\nMissing Modules:");
                foreach (var mismatch in report.ModuleMismatches)
                {
                    Console.WriteLine($"  ❌ {mismatch.ModuleId}: {mismatch.Issue}");
                }
            }

            if (report.DiscoveredModules.Any())
            {
                Console.WriteLine("\nUnregistered Modules:");
                foreach (var discovered in report.DiscoveredModules)
                {
                    Console.WriteLine($"  ➕ {discovered.ModuleId}: {discovered.FilePath}");
                }
            }

            return report.IsHealthy ? 0 : 1;
        }

        private static async Task HealthReportCommand(string rootPath)
        {
            Console.WriteLine($"Generating health report for: {rootPath}");
            var report = await ValidateRegistryAsync("", rootPath);
            
            Console.WriteLine("=== MODULE REGISTRY HEALTH REPORT ===");
            Console.WriteLine($"Generated: {report.GeneratedAt:yyyy-MM-dd HH:mm:ss} UTC");
            Console.WriteLine($"Registry: {report.RegistryPath}");
            Console.WriteLine($"Modules Root: {report.ModulesRootPath}");
            Console.WriteLine();
            Console.WriteLine($"Overall Health: {(report.IsHealthy ? "✅ HEALTHY" : "❌ UNHEALTHY")}");
            Console.WriteLine($"Health Score: {report.HealthScore:F1}% ({report.ValidModules}/{report.TotalRegisteredModules})");
            Console.WriteLine();
            Console.WriteLine("Module Breakdown:");
            Console.WriteLine($"  Total Registered: {report.TotalRegisteredModules}");
            Console.WriteLine($"  Valid: {report.ValidModules}");
            Console.WriteLine($"  Missing: {report.MissingModules}");
            Console.WriteLine($"  Unregistered: {report.UnregisteredModules}");
            Console.WriteLine($"  Enabled: {report.EnabledModules}");
            Console.WriteLine($"  High Priority: {report.HighPriorityModules}");
            Console.WriteLine();
            
            if (report.ModulesByCategory.Any())
            {
                Console.WriteLine("Categories:");
                foreach (var category in report.ModulesByCategory.OrderByDescending(kvp => kvp.Value))
                {
                    Console.WriteLine($"  {category.Key}: {category.Value}");
                }
            }
        }

        private static async Task MergeCommand(string rootPath)
        {
            Console.WriteLine($"Merging discovered modules from: {rootPath}");
            
            var service = ModuleRegistryService.Instance;
            var registry = await service.LoadRegistryAsync();
            var discovered = await service.DiscoverNewModulesAsync();
            
            if (!discovered.Any())
            {
                Console.WriteLine("No new modules discovered");
                return;
            }

            var updated = MergeDiscoveredModules(registry, discovered);
            await service.SaveRegistryAsync(updated);
            
            Console.WriteLine($"Merged {discovered.Count} new modules into registry");
        }

        /// <summary>
        /// Gets the default root path by detecting the current executable location
        /// </summary>
        private static string GetDefaultRootPath()
        {
            try
            {
                // First try to find the application directory
                var appDirectory = AppDomain.CurrentDomain.BaseDirectory;
                
                // Look for common indicators that this is the right directory
                if (Directory.Exists(Path.Combine(appDirectory, "Modules")) || 
                    File.Exists(Path.Combine(appDirectory, "MandADiscoverySuite.exe")))
                {
                    return appDirectory;
                }
                
                // Check parent directory
                var parentDir = Directory.GetParent(appDirectory)?.FullName;
                if (!string.IsNullOrEmpty(parentDir) && 
                    (Directory.Exists(Path.Combine(parentDir, "Modules")) || 
                     File.Exists(Path.Combine(parentDir, "MandADiscoverySuite.exe"))))
                {
                    return parentDir;
                }
                
                // Use AppDomain base directory as fallback
                return appDirectory;
            }
            catch
            {
                // If all else fails, use the application base directory
                return AppDomain.CurrentDomain.BaseDirectory;
            }
        }
    }
}