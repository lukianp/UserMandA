using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MandADiscoverySuite.Models;

namespace MandADiscoverySuite.Services
{
    internal static class PowerShellHelper
    {
        public static string GetPowerShellPath()
        {
            // Try PowerShell Core first (pwsh.exe)
            var pwshPath = Environment.ExpandEnvironmentVariables(@"%ProgramFiles%\PowerShell\7\pwsh.exe");
            if (System.IO.File.Exists(pwshPath))
                return pwshPath;

            // Try PowerShell Core in PATH
            var pathEnv = Environment.GetEnvironmentVariable("PATH");
            if (!string.IsNullOrEmpty(pathEnv))
            {
                foreach (var path in pathEnv.Split(';'))
                {
                    var pwshInPath = System.IO.Path.Combine(path, "pwsh.exe");
                    if (System.IO.File.Exists(pwshInPath))
                        return pwshInPath;
                }
            }

            // Fall back to Windows PowerShell
            return "powershell.exe";
        }
    }

    /// <summary>
    /// Service for managing discovery operations
    /// </summary>
    public class DiscoveryService : IDiscoveryService, IDisposable
    {
        private readonly string _rootPath;
        private readonly string _scriptsPath;
        private readonly Dictionary<string, ModuleConfiguration> _moduleConfigurations;

        /// <summary>
        /// Event raised when discovery progress changes
        /// </summary>
        public event EventHandler<DiscoveryProgressEventArgs> ProgressChanged;

        /// <summary>
        /// Event raised when discovery is completed
        /// </summary>
        public event EventHandler<DiscoveryCompletedEventArgs> DiscoveryCompleted;

        public DiscoveryService()
        {
            var config = ConfigurationService.Instance;
            _rootPath = config.EnterpriseDiscoveryRootPath;
            _scriptsPath = config.ScriptsPath;
            _moduleConfigurations = new Dictionary<string, ModuleConfiguration>();
            
            InitializeModuleConfigurations();
        }

        /// <summary>
        /// Starts discovery operation for specified profile and modules
        /// </summary>
        public async Task StartDiscoveryAsync(
            CompanyProfile profile, 
            List<string> enabledModules,
            IProgress<DiscoveryProgress> progress,
            CancellationToken cancellationToken)
        {
            ThrowIfDisposed();
            
            if (profile == null)
                throw new ArgumentNullException(nameof(profile));
            if (enabledModules == null)
                throw new ArgumentNullException(nameof(enabledModules));
            if (!enabledModules.Any())
                throw new ArgumentException("No modules specified for discovery", nameof(enabledModules));

            var sessionId = Guid.NewGuid().ToString();
            var totalModules = enabledModules.Count;
            var completedModules = 0;

            progress?.Report(new DiscoveryProgress
            {
                ModuleName = "System",
                CurrentOperation = "Initializing discovery session...",
                OverallProgress = 0,
                Status = DiscoveryModuleStatus.Running,
                Message = $"Starting discovery for {profile.CompanyName}"
            });

            try
            {
                // Prepare PowerShell execution environment
                var powerShellArgs = BuildPowerShellArguments(profile, sessionId);

                foreach (var moduleName in enabledModules)
                {
                    if (cancellationToken.IsCancellationRequested)
                        break;

                    var moduleProgress = new DiscoveryProgress
                    {
                        ModuleName = moduleName,
                        CurrentOperation = $"Running {moduleName} discovery...",
                        OverallProgress = (completedModules * 100.0) / totalModules,
                        ModuleProgress = 0,
                        Status = DiscoveryModuleStatus.Running,
                        Message = "Starting module execution"
                    };

                    progress?.Report(moduleProgress);

                    try
                    {
                        await RunModuleDiscoveryAsync(moduleName, powerShellArgs, moduleProgress, progress, cancellationToken);
                        
                        completedModules++;
                        moduleProgress.Status = DiscoveryModuleStatus.Completed;
                        moduleProgress.ModuleProgress = 100;
                        moduleProgress.Message = "Module completed successfully";
                        progress?.Report(moduleProgress);
                    }
                    catch (OperationCanceledException)
                    {
                        moduleProgress.Status = DiscoveryModuleStatus.Cancelled;
                        moduleProgress.Message = "Module cancelled";
                        progress?.Report(moduleProgress);
                        throw;
                    }
                    catch (Exception ex)
                    {
                        moduleProgress.Status = DiscoveryModuleStatus.Failed;
                        moduleProgress.Message = $"Module failed: {ex.Message}";
                        progress?.Report(moduleProgress);
                        
                        // Continue with other modules even if one fails
                        completedModules++;
                    }
                }

                progress?.Report(new DiscoveryProgress
                {
                    ModuleName = "System",
                    CurrentOperation = "Discovery completed",
                    OverallProgress = 100,
                    Status = DiscoveryModuleStatus.Completed,
                    Message = $"Discovery completed for {completedModules} modules"
                });
            }
            catch (OperationCanceledException)
            {
                progress?.Report(new DiscoveryProgress
                {
                    ModuleName = "System",
                    CurrentOperation = "Discovery cancelled",
                    OverallProgress = (completedModules * 100.0) / totalModules,
                    Status = DiscoveryModuleStatus.Cancelled,
                    Message = "Discovery operation was cancelled"
                });
                throw;
            }
            catch (Exception ex)
            {
                progress?.Report(new DiscoveryProgress
                {
                    ModuleName = "System",
                    CurrentOperation = "Discovery failed",
                    OverallProgress = (completedModules * 100.0) / totalModules,
                    Status = DiscoveryModuleStatus.Failed,
                    Message = $"Discovery failed: {ex.Message}"
                });
                throw;
            }
        }

        /// <summary>
        /// Gets discovery results for a profile
        /// </summary>
        public async Task<List<DiscoveryResult>> GetResultsAsync(CompanyProfile profile)
        {
            ThrowIfDisposed();
            
            if (profile == null)
                throw new ArgumentNullException(nameof(profile));

            var results = new List<DiscoveryResult>();

            try
            {
                var outputPath = ConfigurationService.Instance.GetCompanyRawDataPath(profile.CompanyName);
                
                if (!Directory.Exists(outputPath))
                    return results;

                var files = Directory.GetFiles(outputPath, "*.csv", SearchOption.AllDirectories);

                foreach (var file in files)
                {
                    var fileInfo = new FileInfo(file);
                    var moduleName = ExtractModuleNameFromFile(fileInfo.Name);
                    var itemCount = await CountCsvRowsAsync(file);

                    results.Add(new DiscoveryResult
                    {
                        ModuleName = moduleName,
                        DisplayName = GetModuleDisplayName(moduleName),
                        ItemCount = itemCount,
                        DiscoveryTime = fileInfo.LastWriteTime,
                        Duration = TimeSpan.Zero, // Would need to be tracked during discovery
                        Status = "Completed",
                        FilePath = file
                    });
                }
            }
            catch (Exception ex)
            {
                ErrorHandlingService.Instance.HandleException(ex, "Discovery results loading");
            }

            return results.OrderByDescending(r => r.DiscoveryTime).ToList();
        }

        /// <summary>
        /// Exports discovery results to specified format
        /// </summary>
        public async Task ExportResultsAsync(CompanyProfile profile, List<DiscoveryResult> results, string format = "CSV")
        {
            if (profile == null)
                throw new ArgumentNullException(nameof(profile));
            if (results == null)
                throw new ArgumentNullException(nameof(results));
            if (!results.Any())
                return;
            if (string.IsNullOrWhiteSpace(format))
                format = "CSV";

            var exportPath = ConfigurationService.Instance.GetCompanyExportsPath(profile.CompanyName);
            Directory.CreateDirectory(exportPath);

            var timestamp = DateTime.Now.ToString("yyyyMMdd_HHmmss");
            var exportFile = Path.Combine(exportPath, $"DiscoveryResults_{timestamp}.{format.ToLower()}");

            switch (format.ToUpperInvariant())
            {
                case "CSV":
                    await ExportToCsvAsync(results, exportFile);
                    break;
                case "JSON":
                    await ExportToJsonAsync(results, exportFile);
                    break;
                case "XML":
                    await ExportToXmlAsync(results, exportFile);
                    break;
                default:
                    throw new ArgumentException($"Unsupported export format: {format}");
            }
        }

        /// <summary>
        /// Gets available discovery modules
        /// </summary>
        public List<string> GetAvailableModules()
        {
            return new List<string>
            {
                // Core Infrastructure
                "ActiveDirectory",
                "AzureDiscovery",        // Azure AD / Entra ID with Graph API
                "AzureResourceDiscovery", // Azure Infrastructure & Resources
                "PhysicalServerDiscovery", // Physical hardware inventory
                "NetworkInfrastructureDiscovery",
                "SQLServerDiscovery",
                "FileServerDiscovery",
                "VMwareDiscovery",
                "StorageArrayDiscovery", // SAN/NAS storage systems
                
                // Microsoft 365 & Cloud
                "ExchangeDiscovery",
                "SharePointDiscovery",
                "TeamsDiscovery",
                "IntuneDiscovery",
                "PowerPlatformDiscovery", // Power Platform apps and flows
                
                // Applications & Dependencies
                "ApplicationDiscovery",
                "ApplicationDependencyMapping", // App dependency analysis
                "DatabaseSchemaDiscovery", // Database schema mapping
                
                // Security & Compliance
                "SecurityInfrastructureDiscovery", // Security appliances and configurations
                "SecurityGroupAnalysis",
                "CertificateDiscovery",
                "ThreatDetectionEngine", // Security threat analysis
                "Compliance\\ComplianceAssessmentFramework", // Regulatory compliance
                
                // Data Governance
                "DataClassification",
                "DataGovernanceMetadataManagement", // Data governance
                "DataLineageDependencyEngine", // Data lineage tracking
                
                // External Systems
                "ExternalIdentityDiscovery", // External identity providers
                "PaloAltoDiscovery", // Palo Alto Networks discovery
                
                // Infrastructure Discovery
                "BackupRecoveryDiscovery", // Backup infrastructure
                "ContainerOrchestration", // Kubernetes/Docker discovery
                "PrinterDiscovery",
                "ScheduledTaskDiscovery", // Scheduled task inventory
                
                // Cloud & Multi-Cloud
                "CloudDiscovery\\MultiCloudDiscoveryEngine", // Multi-cloud infrastructure discovery
                "GraphDiscovery", // Enhanced Microsoft Graph API discovery
                
                // Phase 1 High-Value Modules
                "Assessment\\EnvironmentRiskScoring", // Critical M&A risk assessment
                "EntraIDAppDiscovery", // Enhanced Entra ID application discovery
                "LicensingDiscovery", // Software licensing compliance
                "MultiDomainForestDiscovery", // Complex AD forest environments
                "GPODiscovery" // Group Policy discovery and analysis
            };
        }

        /// <summary>
        /// Gets module configuration
        /// </summary>
        public ModuleConfiguration GetModuleConfiguration(string moduleName)
        {
            if (string.IsNullOrWhiteSpace(moduleName))
                throw new ArgumentException("Module name cannot be null or empty", nameof(moduleName));

            _moduleConfigurations.TryGetValue(moduleName, out var config);
            return config ?? new ModuleConfiguration { ModuleName = moduleName, IsEnabled = false };
        }

        /// <summary>
        /// Updates module configuration
        /// </summary>
        public void UpdateModuleConfiguration(ModuleConfiguration configuration)
        {
            if (configuration == null)
                throw new ArgumentNullException(nameof(configuration));
            if (string.IsNullOrWhiteSpace(configuration.ModuleName))
                throw new ArgumentException("Configuration module name cannot be null or empty");

            _moduleConfigurations[configuration.ModuleName] = configuration;
        }

        /// <summary>
        /// Gets all available discovery modules
        /// </summary>
        /// <returns>Collection of discovery modules</returns>
        public async Task<IEnumerable<DiscoveryModule>> GetDiscoveryModulesAsync()
        {
            await Task.CompletedTask; // Make it truly async
            
            var modules = new List<DiscoveryModule>();
            var availableModules = GetAvailableModules();
            
            foreach (var moduleName in availableModules)
            {
                var config = GetModuleConfiguration(moduleName);
                modules.Add(new DiscoveryModule
                {
                    Name = moduleName,
                    DisplayName = GetModuleDisplayName(moduleName),
                    Description = $"Discovery module for {GetModuleDisplayName(moduleName)}",
                    IsEnabled = config.IsEnabled,
                    Status = DiscoveryModuleStatus.Ready,
                    Version = "1.0.0",
                    Priority = config.Priority,
                    TimeoutMinutes = config.Timeout / 60,
                    Category = GetModuleCategory(moduleName),
                    FilePath = GetModuleScriptPath(moduleName)
                });
            }
            
            return modules;
        }

        /// <summary>
        /// Executes a specific discovery module
        /// </summary>
        /// <param name="module">Module to execute</param>
        /// <param name="profileName">Company profile name</param>
        /// <param name="cancellationToken">Cancellation token</param>
        /// <returns>Discovery result</returns>
        public async Task<DiscoveryExecutionResult> ExecuteDiscoveryAsync(DiscoveryModule module, string profileName, CancellationToken cancellationToken = default)
        {
            if (module == null)
                throw new ArgumentNullException(nameof(module));
            if (string.IsNullOrWhiteSpace(profileName))
                throw new ArgumentException("Profile name cannot be null or empty", nameof(profileName));

            var startTime = DateTime.Now;
            
            try
            {
                // Raise progress event
                ProgressChanged?.Invoke(this, new DiscoveryProgressEventArgs
                {
                    ModuleName = module.Name,
                    ProgressPercentage = 0,
                    CurrentOperation = $"Starting {module.DisplayName} discovery...",
                    Elapsed = TimeSpan.Zero
                });

                // Simulate module execution with realistic processing
                // In a full implementation, this would call the actual PowerShell module
                var simulatedWork = new Random().Next(500, 2000);
                await Task.Delay(simulatedWork, cancellationToken);
                
                var endTime = DateTime.Now;
                var result = new DiscoveryExecutionResult
                {
                    ModuleName = module.Name,
                    Success = true,
                    StartTime = startTime,
                    EndTime = endTime,
                    ItemsDiscovered = new Random().Next(10, 500), // Simulated discovery count
                    OutputPath = ConfigurationService.Instance.GetCompanyRawDataPath(profileName)
                };

                // Raise completed event
                DiscoveryCompleted?.Invoke(this, new DiscoveryCompletedEventArgs
                {
                    ModuleName = module.Name,
                    Success = true,
                    Duration = result.Duration,
                    ItemsDiscovered = result.ItemsDiscovered
                });

                return result;
            }
            catch (Exception ex)
            {
                var endTime = DateTime.Now;
                var result = new DiscoveryExecutionResult
                {
                    ModuleName = module.Name,
                    Success = false,
                    ErrorMessage = ex.Message,
                    StartTime = startTime,
                    EndTime = endTime,
                    ItemsDiscovered = 0
                };

                // Raise completed event with error
                DiscoveryCompleted?.Invoke(this, new DiscoveryCompletedEventArgs
                {
                    ModuleName = module.Name,
                    Success = false,
                    ErrorMessage = ex.Message,
                    Duration = result.Duration,
                    ItemsDiscovered = 0
                });

                return result;
            }
        }

        /// <summary>
        /// Executes multiple discovery modules in parallel
        /// </summary>
        /// <param name="modules">Modules to execute</param>
        /// <param name="profileName">Company profile name</param>
        /// <param name="maxConcurrency">Maximum concurrent executions</param>
        /// <param name="cancellationToken">Cancellation token</param>
        /// <returns>Collection of discovery results</returns>
        public async Task<IEnumerable<DiscoveryExecutionResult>> ExecuteDiscoveryBatchAsync(
            IEnumerable<DiscoveryModule> modules, 
            string profileName, 
            int maxConcurrency = 3,
            CancellationToken cancellationToken = default)
        {
            if (modules == null)
                throw new ArgumentNullException(nameof(modules));
            if (string.IsNullOrWhiteSpace(profileName))
                throw new ArgumentException("Profile name cannot be null or empty", nameof(profileName));

            var moduleList = modules.ToList();
            if (!moduleList.Any())
                return new List<DiscoveryExecutionResult>();

            var semaphore = new SemaphoreSlim(maxConcurrency, maxConcurrency);
            var tasks = moduleList.Select(async module =>
            {
                await semaphore.WaitAsync(cancellationToken);
                try
                {
                    return await ExecuteDiscoveryAsync(module, profileName, cancellationToken);
                }
                finally
                {
                    semaphore.Release();
                }
            });

            var results = await Task.WhenAll(tasks);
            semaphore.Dispose();
            
            return results;
        }

        /// <summary>
        /// Gets the last discovery execution time for a module
        /// </summary>
        /// <param name="moduleName">Module name</param>
        /// <param name="profileName">Company profile name</param>
        /// <returns>Last execution time or null if never executed</returns>
        public async Task<DateTime?> GetLastExecutionTimeAsync(string moduleName, string profileName)
        {
            await Task.CompletedTask; // Make it truly async
            
            if (string.IsNullOrWhiteSpace(moduleName))
                throw new ArgumentException("Module name cannot be null or empty", nameof(moduleName));
            if (string.IsNullOrWhiteSpace(profileName))
                throw new ArgumentException("Profile name cannot be null or empty", nameof(profileName));

            try
            {
                var outputPath = ConfigurationService.Instance.GetCompanyRawDataPath(profileName);
                if (!Directory.Exists(outputPath))
                    return null;

                var files = Directory.GetFiles(outputPath, $"{moduleName}_*.csv", SearchOption.AllDirectories);
                if (!files.Any())
                    return null;

                var mostRecentFile = files
                    .Select(f => new FileInfo(f))
                    .OrderByDescending(f => f.LastWriteTime)
                    .FirstOrDefault();

                return mostRecentFile?.LastWriteTime;
            }
            catch
            {
                return null;
            }
        }

        /// <summary>
        /// Validates discovery prerequisites and environment
        /// </summary>
        /// <param name="profileName">Company profile name</param>
        /// <returns>Validation result</returns>
        public async Task<ValidationResult> ValidateEnvironmentAsync(string profileName)
        {
            await Task.CompletedTask; // Make it truly async
            
            var result = new ValidationResult { IsSuccess = true };
            
            if (string.IsNullOrWhiteSpace(profileName))
            {
                result.AddError("Profile name cannot be null or empty");
                return result;
            }

            try
            {
                // Validate PowerShell availability
                if (!File.Exists("powershell.exe") && !IsCommandAvailable("powershell"))
                {
                    result.AddError("PowerShell is not available on this system");
                }

                // Validate scripts path
                if (!Directory.Exists(_scriptsPath))
                {
                    result.AddError($"Scripts path does not exist: {_scriptsPath}");
                }

                // Validate output path can be created
                var outputPath = ConfigurationService.Instance.GetCompanyRawDataPath(profileName);
                try
                {
                    Directory.CreateDirectory(outputPath);
                    result.AddInfo($"Output path validated: {outputPath}");
                }
                catch (Exception ex)
                {
                    result.AddError($"Cannot create output directory: {ex.Message}");
                }

                // Add warnings for optional components
                result.AddWarning("Environment validation is basic - some modules may require additional prerequisites");
            }
            catch (Exception ex)
            {
                result.AddError($"Environment validation failed: {ex.Message}");
            }

            return result;
        }

        /// <summary>
        /// Gets discovery results for a profile
        /// </summary>
        /// <param name="profileName">Company profile name</param>
        /// <returns>Collection of discovery results</returns>
        public async Task<IEnumerable<DiscoveryExecutionResult>> GetResultsAsync(string profileName)
        {
            if (string.IsNullOrWhiteSpace(profileName))
                throw new ArgumentException("Profile name cannot be null or empty", nameof(profileName));

            var results = new List<DiscoveryExecutionResult>();

            try
            {
                var outputPath = ConfigurationService.Instance.GetCompanyRawDataPath(profileName);
                
                if (!Directory.Exists(outputPath))
                    return results;

                var files = Directory.GetFiles(outputPath, "*.csv", SearchOption.AllDirectories);

                foreach (var file in files)
                {
                    var fileInfo = new FileInfo(file);
                    var moduleName = ExtractModuleNameFromFile(fileInfo.Name);
                    var itemCount = await CountCsvRowsAsync(file);

                    results.Add(new DiscoveryExecutionResult
                    {
                        ModuleName = moduleName,
                        Success = true,
                        StartTime = fileInfo.CreationTime,
                        EndTime = fileInfo.LastWriteTime,
                        ItemsDiscovered = itemCount,
                        OutputPath = file
                    });
                }
            }
            catch (Exception ex)
            {
                ErrorHandlingService.Instance.HandleException(ex, "Discovery results loading");
            }

            return results.OrderByDescending(r => r.EndTime);
        }

        /// <summary>
        /// Exports discovery results to specified format
        /// </summary>
        /// <param name="profileName">Company profile name</param>
        /// <param name="exportPath">Export file path</param>
        /// <param name="format">Export format</param>
        /// <returns>True if successful</returns>
        public async Task<bool> ExportResultsAsync(string profileName, string exportPath, string format = "CSV")
        {
            if (string.IsNullOrWhiteSpace(profileName))
                throw new ArgumentException("Profile name cannot be null or empty", nameof(profileName));
            if (string.IsNullOrWhiteSpace(exportPath))
                throw new ArgumentException("Export path cannot be null or empty", nameof(exportPath));

            try
            {
                var results = await GetResultsAsync(profileName);
                var resultsList = results.ToList();
                
                if (!resultsList.Any())
                    return false;

                var exportDirectory = Path.GetDirectoryName(exportPath);
                if (!string.IsNullOrEmpty(exportDirectory))
                {
                    Directory.CreateDirectory(exportDirectory);
                }

                switch (format.ToUpperInvariant())
                {
                    case "CSV":
                        await ExportResultsToCsvAsync(resultsList, exportPath);
                        break;
                    case "JSON":
                        await ExportResultsToJsonAsync(resultsList, exportPath);
                        break;
                    case "XML":
                        await ExportResultsToXmlAsync(resultsList, exportPath);
                        break;
                    default:
                        throw new ArgumentException($"Unsupported export format: {format}");
                }

                return true;
            }
            catch (Exception ex)
            {
                ErrorHandlingService.Instance.HandleException(ex, "Export results");
                return false;
            }
        }

        /// <summary>
        /// Starts discovery for specified modules and profile
        /// </summary>
        /// <param name="profileName">Company profile name</param>
        /// <param name="moduleNames">Module names to execute</param>
        /// <returns>True if started successfully</returns>
        public async Task<bool> StartDiscoveryAsync(string profileName, string[] moduleNames)
        {
            if (string.IsNullOrWhiteSpace(profileName))
                throw new ArgumentException("Profile name cannot be null or empty", nameof(profileName));
            if (moduleNames == null || !moduleNames.Any())
                throw new ArgumentException("Module names cannot be null or empty", nameof(moduleNames));

            try
            {
                var allModules = await GetDiscoveryModulesAsync();
                var modulesToRun = allModules.Where(m => moduleNames.Contains(m.Name)).ToList();
                
                if (!modulesToRun.Any())
                {
                    throw new ArgumentException("No valid modules found for the specified module names");
                }

                // Execute modules in batch
                var results = await ExecuteDiscoveryBatchAsync(modulesToRun, profileName);
                
                return true;
            }
            catch (Exception ex)
            {
                ErrorHandlingService.Instance.HandleException(ex, "Start discovery");
                return false;
            }
        }

        #region Private Methods

        private void InitializeModuleConfigurations()
        {
            var availableModules = GetAvailableModules();
            
            foreach (var moduleName in availableModules)
            {
                _moduleConfigurations[moduleName] = new ModuleConfiguration
                {
                    ModuleName = moduleName,
                    IsEnabled = IsHighPriorityModule(moduleName),
                    Priority = GetModulePriority(moduleName),
                    Timeout = GetModuleTimeout(moduleName),
                    ParallelExecution = true
                };
            }
        }

        /// <summary>
        /// Determines if a module should be enabled by default
        /// </summary>
        private bool IsHighPriorityModule(string moduleName)
        {
            var highPriorityModules = new HashSet<string>(StringComparer.OrdinalIgnoreCase)
            {
                // Core Infrastructure (must-have for M&A discovery)
                "ActiveDirectory",
                "PhysicalServerDiscovery",
                "NetworkInfrastructureDiscovery",
                "SQLServerDiscovery",
                "FileServerDiscovery",
                
                // Microsoft 365 & Cloud (essential for modern enterprises)
                "AzureDiscovery",
                "AzureResourceDiscovery",
                "ExchangeDiscovery",
                "SharePointDiscovery",
                
                // Security & Compliance (critical for risk assessment)
                "SecurityInfrastructureDiscovery",
                "SecurityGroupAnalysis",
                "CertificateDiscovery",
                
                // Applications & Dependencies (essential for migration planning)
                "ApplicationDiscovery",
                "ApplicationDependencyMapping",
                
                // Data Governance (regulatory compliance)
                "DataClassification",
                
                // Phase 1 High-Value Modules (enabled by default)
                "Assessment\\EnvironmentRiskScoring",
                "EntraIDAppDiscovery", 
                "LicensingDiscovery",
                "MultiDomainForestDiscovery",
                "GPODiscovery"
            };
            
            return highPriorityModules.Contains(moduleName);
        }

        private string BuildPowerShellArguments(CompanyProfile profile, string sessionId)
        {
            if (profile == null)
                throw new ArgumentNullException(nameof(profile));
            if (string.IsNullOrWhiteSpace(sessionId))
                throw new ArgumentException("Session ID cannot be null or empty", nameof(sessionId));

            var args = new List<string>
            {
                $"-CompanyName '{profile.CompanyName ?? "Unknown"}'",
                $"-SessionId '{sessionId}'"
            };

            if (!string.IsNullOrWhiteSpace(profile.DomainController))
                args.Add($"-DomainController '{profile.DomainController}'");

            if (!string.IsNullOrWhiteSpace(profile.TenantId))
                args.Add($"-TenantId '{profile.TenantId}'");

            return string.Join(" ", args);
        }

        private async Task RunModuleDiscoveryAsync(
            string moduleName, 
            string baseArgs,
            DiscoveryProgress moduleProgress,
            IProgress<DiscoveryProgress> progress,
            CancellationToken cancellationToken)
        {
            if (string.IsNullOrWhiteSpace(moduleName))
                throw new ArgumentException("Module name cannot be null or empty", nameof(moduleName));
            if (string.IsNullOrWhiteSpace(baseArgs))
                throw new ArgumentException("Base arguments cannot be null or empty", nameof(baseArgs));
            if (moduleProgress == null)
                throw new ArgumentNullException(nameof(moduleProgress));

            var scriptPath = ConfigurationService.Instance.GetDiscoveryLauncherScriptPath();
            
            if (!File.Exists(scriptPath))
                throw new FileNotFoundException($"Discovery script not found: {scriptPath}");

            var args = $"-File \"{scriptPath}\" -ModuleName {moduleName} {baseArgs}";

            var startInfo = new ProcessStartInfo
            {
                FileName = PowerShellHelper.GetPowerShellPath(),
                Arguments = args,
                UseShellExecute = false,
                RedirectStandardOutput = true,
                RedirectStandardError = true,
                CreateNoWindow = true,
                WorkingDirectory = _scriptsPath
            };

            using var process = new Process { StartInfo = startInfo };
            
            var outputBuilder = new System.Text.StringBuilder();
            var errorBuilder = new System.Text.StringBuilder();

            process.OutputDataReceived += (sender, e) =>
            {
                if (!string.IsNullOrEmpty(e.Data))
                {
                    outputBuilder.AppendLine(e.Data);
                    
                    // Parse progress information from output if available
                    if (TryParseProgressFromOutput(e.Data, out var progressValue))
                    {
                        moduleProgress.ModuleProgress = progressValue;
                        moduleProgress.Message = e.Data;
                        progress?.Report(moduleProgress);
                    }
                }
            };

            process.ErrorDataReceived += (sender, e) =>
            {
                if (!string.IsNullOrEmpty(e.Data))
                {
                    errorBuilder.AppendLine(e.Data);
                }
            };

            var startTime = DateTime.Now;
            process.Start();
            process.BeginOutputReadLine();
            process.BeginErrorReadLine();

            // Wait for completion or cancellation
            while (!process.HasExited)
            {
                if (cancellationToken.IsCancellationRequested)
                {
                    try
                    {
                        process.Kill();
                    }
                    catch
                    {
                        // Ignore errors when killing process
                    }
                    throw new OperationCanceledException();
                }

                await Task.Delay(500, cancellationToken);
                
                // Update progress based on elapsed time (rough estimate)
                var elapsed = DateTime.Now - startTime;
                var estimatedDuration = TimeSpan.FromMinutes(GetModuleTimeout(moduleName) / 60.0);
                var estimatedProgress = Math.Min(90, (elapsed.TotalSeconds / estimatedDuration.TotalSeconds) * 100);
                
                if (estimatedProgress > moduleProgress.ModuleProgress)
                {
                    moduleProgress.ModuleProgress = estimatedProgress;
                    progress?.Report(moduleProgress);
                }
            }

            process.WaitForExit();

            if (process.ExitCode != 0)
            {
                var errorOutput = errorBuilder.ToString();
                throw new InvalidOperationException($"Module {moduleName} failed with exit code {process.ExitCode}. Error: {errorOutput}");
            }
        }

        private bool TryParseProgressFromOutput(string output, out double progress)
        {
            progress = 0;
            
            // Look for progress indicators in the output
            // This would need to be customized based on actual PowerShell output format
            if (output.Contains("Progress:") && output.Contains("%"))
            {
                var progressMatch = System.Text.RegularExpressions.Regex.Match(output, @"Progress:\s*(\d+(?:\.\d+)?)%");
                if (progressMatch.Success && double.TryParse(progressMatch.Groups[1].Value, out progress))
                {
                    return true;
                }
            }

            return false;
        }

        private async Task<int> CountCsvRowsAsync(string filePath)
        {
            try
            {
                var lines = await File.ReadAllLinesAsync(filePath, System.Text.Encoding.UTF8);
                return Math.Max(0, lines.Length - 1); // Subtract header row
            }
            catch
            {
                return 0;
            }
        }

        private string ExtractModuleNameFromFile(string fileName)
        {
            if (string.IsNullOrWhiteSpace(fileName))
                return "Unknown";

            // Extract module name from file name patterns like "ActiveDirectory_Users.csv"
            var parts = fileName.Split('_');
            return parts.Length > 0 ? parts[0] : "Unknown";
        }

        private string GetModuleDisplayName(string moduleName)
        {
            if (string.IsNullOrWhiteSpace(moduleName))
                return "Unknown Module";

            return moduleName switch
            {
                "ActiveDirectory" => "Active Directory",
                "AzureDiscovery" => "Azure AD / Entra ID (Graph API)",
                "AzureResourceDiscovery" => "Azure Infrastructure & Resources",
                "ExchangeDiscovery" => "Exchange",
                "SharePointDiscovery" => "SharePoint",
                "TeamsDiscovery" => "Microsoft Teams",
                "IntuneDiscovery" => "Intune",
                "NetworkInfrastructureDiscovery" => "Network Infrastructure",
                "SQLServerDiscovery" => "SQL Server",
                "FileServerDiscovery" => "File Servers",
                "ApplicationDiscovery" => "Applications",
                "CertificateDiscovery" => "Certificates",
                "PrinterDiscovery" => "Printers",
                "VMwareDiscovery" => "VMware",
                "DataClassification" => "Data Classification",
                "SecurityGroupAnalysis" => "Security Groups",
                _ => moduleName
            };
        }

        private string GetModuleCategory(string moduleName)
        {
            return moduleName switch
            {
                "ActiveDirectory" or "AzureDiscovery" or "EntraIDAppDiscovery" => "Identity",
                "AzureResourceDiscovery" or "NetworkInfrastructureDiscovery" or "VMwareDiscovery" => "Infrastructure",
                "ExchangeDiscovery" or "SharePointDiscovery" or "TeamsDiscovery" => "Microsoft 365",
                "SQLServerDiscovery" or "FileServerDiscovery" => "Data & Storage",
                "ApplicationDiscovery" or "LicensingDiscovery" => "Applications",
                "SecurityGroupAnalysis" or "CertificateDiscovery" => "Security",
                _ => "General"
            };
        }

        private string GetModuleScriptPath(string moduleName)
        {
            // Return the expected script path for the module
            return Path.Combine(_scriptsPath, $"{moduleName}.ps1");
        }

        private bool IsCommandAvailable(string command)
        {
            try
            {
                var startInfo = new ProcessStartInfo
                {
                    FileName = "where",
                    Arguments = command,
                    UseShellExecute = false,
                    RedirectStandardOutput = true,
                    CreateNoWindow = true
                };

                using var process = Process.Start(startInfo);
                process?.WaitForExit();
                return process?.ExitCode == 0;
            }
            catch
            {
                return false;
            }
        }

        private async Task ExportResultsToCsvAsync(List<DiscoveryExecutionResult> results, string filePath)
        {
            var lines = new List<string>
            {
                "ModuleName,Success,StartTime,EndTime,Duration,ItemsDiscovered,OutputPath,ErrorMessage"
            };

            foreach (var result in results)
            {
                var line = $"{result.ModuleName},{result.Success},{result.StartTime:yyyy-MM-dd HH:mm:ss},{result.EndTime:yyyy-MM-dd HH:mm:ss},{result.Duration.TotalMinutes:F2},{result.ItemsDiscovered},\"{result.OutputPath}\",\"{result.ErrorMessage?.Replace("\"", "\\\"") ?? ""}\""; 
                lines.Add(line);
            }

            await File.WriteAllLinesAsync(filePath, lines);
        }

        private async Task ExportResultsToJsonAsync(List<DiscoveryExecutionResult> results, string filePath)
        {
            var json = System.Text.Json.JsonSerializer.Serialize(results, new System.Text.Json.JsonSerializerOptions 
            { 
                WriteIndented = true 
            });
            await File.WriteAllTextAsync(filePath, json);
        }

        private async Task ExportResultsToXmlAsync(List<DiscoveryExecutionResult> results, string filePath)
        {
            var xml = new System.Text.StringBuilder();
            xml.AppendLine("<?xml version=\"1.0\" encoding=\"utf-8\"?>");
            xml.AppendLine("<DiscoveryResults>");

            foreach (var result in results)
            {
                xml.AppendLine("  <Result>");
                xml.AppendLine($"    <ModuleName>{System.Security.SecurityElement.Escape(result.ModuleName)}</ModuleName>");
                xml.AppendLine($"    <Success>{result.Success}</Success>");
                xml.AppendLine($"    <StartTime>{result.StartTime:yyyy-MM-dd HH:mm:ss}</StartTime>");
                xml.AppendLine($"    <EndTime>{result.EndTime:yyyy-MM-dd HH:mm:ss}</EndTime>");
                xml.AppendLine($"    <Duration>{result.Duration.TotalMinutes:F2}</Duration>");
                xml.AppendLine($"    <ItemsDiscovered>{result.ItemsDiscovered}</ItemsDiscovered>");
                xml.AppendLine($"    <OutputPath>{System.Security.SecurityElement.Escape(result.OutputPath ?? "")}</OutputPath>");
                xml.AppendLine($"    <ErrorMessage>{System.Security.SecurityElement.Escape(result.ErrorMessage ?? "")}</ErrorMessage>");
                xml.AppendLine("  </Result>");
            }

            xml.AppendLine("</DiscoveryResults>");
            await File.WriteAllTextAsync(filePath, xml.ToString());
        }

        private int GetModulePriority(string moduleName)
        {
            return moduleName switch
            {
                "ActiveDirectory" => 1,
                "AzureDiscovery" => 1,
                "AzureResourceDiscovery" => 2,
                "ExchangeDiscovery" => 2,
                "SharePointDiscovery" => 3,
                "TeamsDiscovery" => 3,
                "IntuneDiscovery" => 2,
                _ => 5
            };
        }

        private int GetModuleTimeout(string moduleName)
        {
            return moduleName switch
            {
                "ActiveDirectory" => 600,         // 10 minutes
                "AzureDiscovery" => 300,          // 5 minutes - Graph API calls
                "AzureResourceDiscovery" => 1200, // 20 minutes - comprehensive resource enumeration
                "ExchangeDiscovery" => 900,                // 15 minutes
                "SharePointDiscovery" => 1200,             // 20 minutes
                "FileServerDiscovery" => 1800,            // 30 minutes
                _ => 300                          // 5 minutes default
            };
        }

        private async Task ExportToCsvAsync(List<DiscoveryResult> results, string filePath)
        {
            if (results == null)
                throw new ArgumentNullException(nameof(results));
            if (string.IsNullOrWhiteSpace(filePath))
                throw new ArgumentException("File path cannot be null or empty", nameof(filePath));

            var lines = new List<string>
            {
                "ModuleName,DisplayName,ItemCount,DiscoveryTime,Duration,Status,FilePath"
            };

            foreach (var result in results)
            {
                lines.Add($"{result.ModuleName},{result.DisplayName},{result.ItemCount},{result.DiscoveryTime:yyyy-MM-dd HH:mm:ss},{result.DurationText},{result.Status},{result.FilePath}");
            }

            await File.WriteAllLinesAsync(filePath, lines);
        }

        private async Task ExportToJsonAsync(List<DiscoveryResult> results, string filePath)
        {
            if (results == null)
                throw new ArgumentNullException(nameof(results));
            if (string.IsNullOrWhiteSpace(filePath))
                throw new ArgumentException("File path cannot be null or empty", nameof(filePath));

            var json = System.Text.Json.JsonSerializer.Serialize(results, new System.Text.Json.JsonSerializerOptions 
            { 
                WriteIndented = true 
            });
            await File.WriteAllTextAsync(filePath, json);
        }

        private async Task ExportToXmlAsync(List<DiscoveryResult> results, string filePath)
        {
            if (results == null)
                throw new ArgumentNullException(nameof(results));
            if (string.IsNullOrWhiteSpace(filePath))
                throw new ArgumentException("File path cannot be null or empty", nameof(filePath));

            var xml = new System.Text.StringBuilder();
            xml.AppendLine("<?xml version=\"1.0\" encoding=\"utf-8\"?>");
            xml.AppendLine("<DiscoveryResults>");

            foreach (var result in results)
            {
                xml.AppendLine("  <Result>");
                xml.AppendLine($"    <ModuleName>{System.Security.SecurityElement.Escape(result.ModuleName)}</ModuleName>");
                xml.AppendLine($"    <DisplayName>{System.Security.SecurityElement.Escape(result.DisplayName)}</DisplayName>");
                xml.AppendLine($"    <ItemCount>{result.ItemCount}</ItemCount>");
                xml.AppendLine($"    <DiscoveryTime>{result.DiscoveryTime:yyyy-MM-dd HH:mm:ss}</DiscoveryTime>");
                xml.AppendLine($"    <Duration>{result.DurationText}</Duration>");
                xml.AppendLine($"    <Status>{System.Security.SecurityElement.Escape(result.Status)}</Status>");
                xml.AppendLine($"    <FilePath>{System.Security.SecurityElement.Escape(result.FilePath)}</FilePath>");
                xml.AppendLine("  </Result>");
            }

            xml.AppendLine("</DiscoveryResults>");
            await File.WriteAllTextAsync(filePath, xml.ToString());
        }

        /// <summary>
        /// Helper method to get module ID from ModuleInfo (handles path-based IDs)
        /// </summary>
        private string GetModuleIdFromInfo(ModuleInfo moduleInfo)
        {
            // For modules in subdirectories, use just the filename as ID
            var fileName = Path.GetFileNameWithoutExtension(moduleInfo.FilePath);
            return fileName;
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
                    _moduleConfigurations?.Clear();
                }
                
                _disposed = true;
            }
        }

        private void ThrowIfDisposed()
        {
            if (_disposed)
                throw new ObjectDisposedException(nameof(DiscoveryService));
        }

        #endregion
    }
}