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
    public class DiscoveryService
    {
        private readonly string _rootPath;
        private readonly string _scriptsPath;
        private readonly Dictionary<string, ModuleConfiguration> _moduleConfigurations;

        public DiscoveryService()
        {
            _rootPath = Path.GetDirectoryName(System.Reflection.Assembly.GetExecutingAssembly().Location);
            _scriptsPath = Path.Combine(Path.GetDirectoryName(_rootPath), "Scripts", "UserMandA");
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
            if (profile == null)
                throw new ArgumentNullException(nameof(profile));

            if (!enabledModules?.Any() == true)
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
            var results = new List<DiscoveryResult>();

            if (profile == null)
                return results;

            try
            {
                var outputPath = Path.Combine("C:\\DiscoveryData", profile.CompanyName, "Raw");
                
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
                // Log error but don't throw - return empty results
                Debug.WriteLine($"Error loading results: {ex.Message}");
            }

            return results.OrderByDescending(r => r.DiscoveryTime).ToList();
        }

        /// <summary>
        /// Exports discovery results to specified format
        /// </summary>
        public async Task ExportResultsAsync(CompanyProfile profile, List<DiscoveryResult> results, string format = "CSV")
        {
            if (profile == null || !results?.Any() == true)
                return;

            var exportPath = Path.Combine("C:\\DiscoveryData", profile.CompanyName, "Exports");
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
                "ActiveDirectory",
                "AzureDiscovery",
                "AzureResourceDiscovery",
                "Exchange",
                "SharePoint",
                "Teams",
                "Intune",
                "NetworkInfrastructure",
                "SQLServer",
                "FileServers",
                "Applications",
                "Certificates",
                "Printers",
                "VMware",
                "DataClassification",
                "SecurityGroups"
            };
        }

        /// <summary>
        /// Gets module configuration
        /// </summary>
        public ModuleConfiguration GetModuleConfiguration(string moduleName)
        {
            _moduleConfigurations.TryGetValue(moduleName, out var config);
            return config ?? new ModuleConfiguration { ModuleName = moduleName, IsEnabled = false };
        }

        /// <summary>
        /// Updates module configuration
        /// </summary>
        public void UpdateModuleConfiguration(ModuleConfiguration configuration)
        {
            if (configuration?.ModuleName != null)
            {
                _moduleConfigurations[configuration.ModuleName] = configuration;
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
                    IsEnabled = moduleName == "ActiveDirectory" || moduleName == "AzureDiscovery" || moduleName == "AzureResourceDiscovery" || moduleName == "Exchange",
                    Priority = GetModulePriority(moduleName),
                    Timeout = GetModuleTimeout(moduleName),
                    ParallelExecution = true
                };
            }
        }

        private string BuildPowerShellArguments(CompanyProfile profile, string sessionId)
        {
            var args = new List<string>
            {
                $"-CompanyName '{profile.CompanyName}'",
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
            var scriptPath = Path.Combine(_scriptsPath, "Start-Discovery.ps1");
            
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
            // Extract module name from file name patterns like "ActiveDirectory_Users.csv"
            var parts = fileName.Split('_');
            return parts[0];
        }

        private string GetModuleDisplayName(string moduleName)
        {
            return moduleName switch
            {
                "ActiveDirectory" => "Active Directory",
                "AzureDiscovery" => "Azure AD (Graph API)",
                "AzureResourceDiscovery" => "Azure Resources (Infrastructure)",
                "Exchange" => "Exchange",
                "SharePoint" => "SharePoint",
                "Teams" => "Microsoft Teams",
                "Intune" => "Intune",
                "NetworkInfrastructure" => "Network Infrastructure",
                "SQLServer" => "SQL Server",
                "FileServers" => "File Servers",
                "Applications" => "Applications",
                "Certificates" => "Certificates",
                "Printers" => "Printers",
                "VMware" => "VMware",
                "DataClassification" => "Data Classification",
                "SecurityGroups" => "Security Groups",
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
                "Exchange" => 2,
                "SharePoint" => 3,
                "Teams" => 3,
                "Intune" => 2,
                _ => 5
            };
        }

        private int GetModuleTimeout(string moduleName)
        {
            return moduleName switch
            {
                "ActiveDirectory" => 600,         // 10 minutes
                "AzureDiscovery" => 300,          // 5 minutes
                "AzureResourceDiscovery" => 900,  // 15 minutes (resource enumeration can take longer)
                "Exchange" => 900,                // 15 minutes
                "SharePoint" => 1200,             // 20 minutes
                "FileServers" => 1800,            // 30 minutes
                _ => 300                          // 5 minutes default
            };
        }

        private async Task ExportToCsvAsync(List<DiscoveryResult> results, string filePath)
        {
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
            var json = System.Text.Json.JsonSerializer.Serialize(results, new System.Text.Json.JsonSerializerOptions 
            { 
                WriteIndented = true 
            });
            await File.WriteAllTextAsync(filePath, json);
        }

        private async Task ExportToXmlAsync(List<DiscoveryResult> results, string filePath)
        {
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

        #endregion
    }
}