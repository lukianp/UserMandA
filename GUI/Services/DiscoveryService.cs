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
    /// <summary>
    /// Service for managing discovery operations
    /// </summary>
    public class DiscoveryService : IDisposable
    {
        private readonly string _rootPath;
        private readonly string _scriptsPath;
        private readonly Dictionary<string, ModuleConfiguration> _moduleConfigurations;

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
                FileName = "powershell.exe",
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
                var lines = await File.ReadAllLinesAsync(filePath);
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