using System;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using MandADiscoverySuite.Services;
using MandADiscoverySuite.Utilities;

namespace MandADiscoverySuite.Tools
{
    /// <summary>
    /// Console application for managing the module registry
    /// </summary>
    class ModuleRegistryManager
    {
        static async Task<int> Main(string[] args)
        {
            Console.WriteLine("=== M&A Discovery Suite - Module Registry Manager ===");
            Console.WriteLine();

            if (args.Length == 0)
            {
                PrintUsage();
                return 1;
            }

            try
            {
                var command = args[0].ToLowerInvariant();
                var rootPath = args.Length > 1 ? args[1] : GetDefaultRootPath();

                Console.WriteLine($"Working with root path: {rootPath}");
                Console.WriteLine();

                switch (command)
                {
                    case "validate":
                        return await ValidateCommand(rootPath);

                    case "health":
                        return await HealthCommand(rootPath);

                    case "generate":
                        return await GenerateCommand(rootPath);

                    case "merge":
                        return await MergeCommand(rootPath);

                    case "fix":
                        return await FixCommand(rootPath);

                    case "list":
                        return await ListCommand(rootPath);

                    default:
                        Console.WriteLine($"❌ Unknown command: {command}");
                        PrintUsage();
                        return 1;
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error: {ex.Message}");
                if (args != null && args.Any(arg => arg.Equals("--verbose", StringComparison.OrdinalIgnoreCase)))
                {
                    Console.WriteLine($"Stack trace: {ex.StackTrace}");
                }
                return 1;
            }
        }

        static void PrintUsage()
        {
            Console.WriteLine("Usage: ModuleRegistryManager <command> [rootPath] [options]");
            Console.WriteLine();
            Console.WriteLine("Commands:");
            Console.WriteLine("  validate  - Validate existing registry against filesystem");
            Console.WriteLine("  health    - Generate comprehensive health report");
            Console.WriteLine("  generate  - Generate new registry from filesystem");
            Console.WriteLine("  merge     - Merge discovered modules into existing registry");
            Console.WriteLine("  fix       - Auto-fix registry issues (validate + merge + clean)");
            Console.WriteLine("  list      - List all modules in registry");
            Console.WriteLine();
            Console.WriteLine("Options:");
            Console.WriteLine("  --verbose - Show detailed output and stack traces");
            Console.WriteLine();
            Console.WriteLine($"Default rootPath: {GetDefaultRootPath()}");
            Console.WriteLine();
            Console.WriteLine("Examples:");
            Console.WriteLine("  ModuleRegistryManager validate");
            Console.WriteLine("  ModuleRegistryManager generate C:\\MyApp");
            Console.WriteLine("  ModuleRegistryManager fix --verbose");
        }

        static async Task<int> ValidateCommand(string rootPath)
        {
            Console.WriteLine("🔍 Validating module registry...");
            
            var service = ModuleRegistryService.Instance;
            var validation = await service.ValidateRegistryAsync();
            
            Console.WriteLine($"✅ Valid modules: {validation.ValidModules.Count}");
            Console.WriteLine($"❌ Missing modules: {validation.MissingModules.Count}");
            
            if (validation.MissingModules.Count > 0)
            {
                Console.WriteLine();
                Console.WriteLine("Missing modules:");
                foreach (var mismatch in validation.MissingModules.Values)
                {
                    Console.WriteLine($"  ❌ {mismatch.ModuleId}: {mismatch.Issue}");
                }
                
                Console.WriteLine();
                Console.WriteLine("💡 Run 'fix' command to automatically resolve issues");
                return 1;
            }
            
            Console.WriteLine();
            Console.WriteLine("✅ Registry validation passed!");
            return 0;
        }

        static async Task<int> HealthCommand(string rootPath)
        {
            Console.WriteLine("🏥 Generating health report...");
            
            var service = ModuleRegistryService.Instance;
            var report = await service.GenerateHealthReportAsync();
            
            Console.WriteLine();
            Console.WriteLine("=== MODULE REGISTRY HEALTH REPORT ===");
            Console.WriteLine($"Generated: {report.GeneratedAt:yyyy-MM-dd HH:mm:ss} UTC");
            Console.WriteLine($"Registry: {report.RegistryPath}");
            Console.WriteLine($"Modules Root: {report.ModulesRootPath}");
            Console.WriteLine();
            
            var healthIcon = report.IsHealthy ? "✅" : "❌";
            Console.WriteLine($"Overall Health: {healthIcon} {(report.IsHealthy ? "HEALTHY" : "UNHEALTHY")}");
            Console.WriteLine($"Health Score: {report.HealthScore:F1}% ({report.ValidModules}/{report.TotalRegisteredModules})");
            Console.WriteLine();
            
            Console.WriteLine("📊 Module Statistics:");
            Console.WriteLine($"  Total Registered: {report.TotalRegisteredModules}");
            Console.WriteLine($"  Valid: {report.ValidModules}");
            Console.WriteLine($"  Missing: {report.MissingModules}");
            Console.WriteLine($"  Unregistered: {report.UnregisteredModules}");
            Console.WriteLine($"  Enabled: {report.EnabledModules}");
            Console.WriteLine($"  High Priority: {report.HighPriorityModules}");
            Console.WriteLine();
            
            if (report.ModulesByCategory.Count > 0)
            {
                Console.WriteLine("📂 Categories:");
                foreach (var category in report.ModulesByCategory)
                {
                    Console.WriteLine($"  {category.Key}: {category.Value} modules");
                }
                Console.WriteLine();
            }
            
            if (report.ModuleMismatches.Count > 0)
            {
                Console.WriteLine("❌ Issues Found:");
                foreach (var mismatch in report.ModuleMismatches)
                {
                    Console.WriteLine($"  ❌ {mismatch.ModuleId}: {mismatch.Issue}");
                }
                Console.WriteLine();
            }
            
            if (report.DiscoveredModules.Count > 0)
            {
                Console.WriteLine("➕ Unregistered Modules:");
                foreach (var discovered in report.DiscoveredModules)
                {
                    Console.WriteLine($"  ➕ {discovered.ModuleId}: {discovered.FilePath}");
                }
                Console.WriteLine();
            }
            
            if (report.Errors.Count > 0)
            {
                Console.WriteLine("⚠️ Errors:");
                foreach (var error in report.Errors)
                {
                    Console.WriteLine($"  ⚠️ {error}");
                }
                Console.WriteLine();
            }
            
            if (!report.IsHealthy)
            {
                Console.WriteLine("💡 Recommendations:");
                if (report.MissingModules > 0)
                    Console.WriteLine("  • Run 'fix' command to resolve missing modules");
                if (report.UnregisteredModules > 0)
                    Console.WriteLine("  • Run 'merge' command to add discovered modules");
                Console.WriteLine();
            }
            
            return report.IsHealthy ? 0 : 1;
        }

        static async Task<int> GenerateCommand(string rootPath)
        {
            Console.WriteLine("🔧 Generating new registry from filesystem...");
            
            if (!Directory.Exists(rootPath))
            {
                Console.WriteLine($"❌ Root path does not exist: {rootPath}");
                return 1;
            }
            
            var registry = await ModuleRegistryGenerator.GenerateRegistryFromFilesystemAsync(rootPath);
            await ModuleRegistryService.Instance.SaveRegistryAsync(registry);
            
            Console.WriteLine();
            Console.WriteLine($"✅ Generated registry with {registry.Modules.Count} modules");
            Console.WriteLine($"📁 Registry saved to configuration directory");
            
            return 0;
        }

        static async Task<int> MergeCommand(string rootPath)
        {
            Console.WriteLine("🔄 Merging discovered modules...");
            
            var service = ModuleRegistryService.Instance;
            var registry = await service.LoadRegistryAsync();
            var discovered = await service.DiscoverNewModulesAsync();
            
            if (discovered.Count == 0)
            {
                Console.WriteLine("ℹ️ No new modules discovered");
                return 0;
            }
            
            Console.WriteLine($"Found {discovered.Count} unregistered modules:");
            foreach (var module in discovered)
            {
                Console.WriteLine($"  ➕ {module.ModuleId}: {module.FilePath}");
            }
            
            var updatedRegistry = await ModuleRegistryGenerator.MergeDiscoveredModulesAsync(registry, discovered);
            await service.SaveRegistryAsync(updatedRegistry);
            
            Console.WriteLine();
            Console.WriteLine($"✅ Merged {discovered.Count} new modules into registry");
            
            return 0;
        }

        static async Task<int> FixCommand(string rootPath)
        {
            Console.WriteLine("🛠️ Auto-fixing registry issues...");
            Console.WriteLine();
            
            // Step 1: Validate current state
            Console.WriteLine("Step 1: Validating current registry...");
            var service = ModuleRegistryService.Instance;
            var validation = await service.ValidateRegistryAsync();
            
            Console.WriteLine($"  Valid: {validation.ValidModules.Count}, Missing: {validation.MissingModules.Count}");
            
            // Step 2: Discover new modules
            Console.WriteLine("Step 2: Discovering new modules...");
            var discovered = await service.DiscoverNewModulesAsync();
            Console.WriteLine($"  Found {discovered.Count} unregistered modules");
            
            // Step 3: Merge if needed
            if (discovered.Count > 0)
            {
                Console.WriteLine("Step 3: Merging discovered modules...");
                var registry = await service.LoadRegistryAsync();
                var updatedRegistry = await ModuleRegistryGenerator.MergeDiscoveredModulesAsync(registry, discovered);
                await service.SaveRegistryAsync(updatedRegistry);
                Console.WriteLine($"  Merged {discovered.Count} modules");
            }
            else
            {
                Console.WriteLine("Step 3: No new modules to merge");
            }
            
            // Step 4: Final validation
            Console.WriteLine("Step 4: Final validation...");
            var finalValidation = await service.ValidateRegistryAsync();
            
            Console.WriteLine();
            if (finalValidation.MissingModules.Count == 0)
            {
                Console.WriteLine("✅ All issues resolved! Registry is now healthy.");
                return 0;
            }
            else
            {
                Console.WriteLine($"⚠️ {finalValidation.MissingModules.Count} issues remain:");
                foreach (var mismatch in finalValidation.MissingModules.Values)
                {
                    Console.WriteLine($"  ❌ {mismatch.ModuleId}: {mismatch.Issue}");
                }
                Console.WriteLine();
                Console.WriteLine("💡 These may require manual intervention");
                return 1;
            }
        }

        static async Task<int> ListCommand(string rootPath)
        {
            Console.WriteLine("📋 Listing all modules in registry...");
            
            var service = ModuleRegistryService.Instance;
            var modules = await service.GetAvailableModulesAsync();
            
            Console.WriteLine();
            Console.WriteLine($"Found {modules.Count} modules:");
            Console.WriteLine();
            
            var groupedModules = modules.GroupBy(m => m.Category).OrderBy(g => g.Key);
            
            foreach (var group in groupedModules)
            {
                Console.WriteLine($"📂 {group.Key}");
                foreach (var module in group.OrderBy(m => m.DisplayName))
                {
                    var enabledIcon = module.Enabled ? "✅" : "⚪";
                    var priorityIcon = module.Priority <= 2 ? "🔥" : "📝";
                    Console.WriteLine($"  {enabledIcon} {priorityIcon} {module.DisplayName}");
                    Console.WriteLine($"    Path: {module.FilePath}");
                    Console.WriteLine($"    Priority: {module.Priority}, Timeout: {module.Timeout}s");
                    Console.WriteLine();
                }
            }
            
            var enabled = modules.Where(m => m.Enabled).Count();
            var highPriority = modules.Where(m => m.Priority <= 2).Count();
            
            Console.WriteLine($"Summary: {enabled} enabled, {highPriority} high-priority");
            
            return 0;
        }

        /// <summary>
        /// Gets the default root path by detecting the current executable location
        /// </summary>
        static string GetDefaultRootPath()
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
                
                // Ultimate fallback to current directory
                return Environment.CurrentDirectory;
            }
            catch
            {
                // If all else fails, use the application base directory
                return AppDomain.CurrentDomain.BaseDirectory;
            }
        }
    }
}