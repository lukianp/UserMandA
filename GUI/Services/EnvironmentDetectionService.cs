#nullable enable

using System;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using System.Collections.Generic;
using Microsoft.Extensions.Logging;
using MandADiscoverySuite.Models;
using static MandADiscoverySuite.Models.EnvironmentType;

namespace MandADiscoverySuite.Services
{
    /// <summary>
    /// Service for detecting and analyzing IT environments based on discovery data
    /// </summary>
    public class EnvironmentDetectionService : IEnvironmentDetectionService
    {
        private readonly ILogger<EnvironmentDetectionService>? _logger;
        private readonly ConfigurationService _configurationService;

        public EnvironmentDetectionService(ILogger<EnvironmentDetectionService>? logger = null)
        {
            _logger = logger;
            _configurationService = ConfigurationService.Instance;
        }

        /// <summary>
        /// Detects the environment type for a given company profile by analyzing discovery data
        /// </summary>
        public async Task<EnvironmentDetectionResult> DetectEnvironmentAsync(CompanyProfile companyProfile)
        {
            var result = new EnvironmentDetectionResult
            {
                DetectionSource = "Discovery Data Analysis",
                PrimaryDomain = companyProfile.CompanyName
            };

            try
            {
                _logger?.LogInformation($"Detecting environment for company profile: {companyProfile.CompanyName}");

                var dataPath = _configurationService.GetCompanyRawDataPath(companyProfile.CompanyName);
                
                if (!Directory.Exists(dataPath))
                {
                    _logger?.LogWarning($"Discovery data path does not exist: {dataPath}");
                    result.DisplayStatus = "No Discovery Data";
                    result.Notes = "Run discovery first to detect environment";
                    return result;
                }

                // Analyze discovery data files to determine environment
                await AnalyzeDiscoveryFilesAsync(dataPath, result);
                
                // Determine overall environment type based on detected services
                DetermineEnvironmentType(result);
                
                _logger?.LogInformation($"Environment detection completed for {companyProfile.CompanyName}: {result.EnvironmentType}");
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, $"Error detecting environment for {companyProfile.CompanyName}");
                result.Notes = $"Detection error: {ex.Message}";
                result.DisplayStatus = "Detection Failed";
            }

            return result;
        }

        /// <summary>
        /// Detects the environment type for a target profile based on connection information
        /// </summary>
        public Task<EnvironmentDetectionResult> DetectEnvironmentAsync(TargetProfile targetProfile)
        {
            var result = new EnvironmentDetectionResult
            {
                DetectionSource = "Target Profile Configuration",
                PrimaryDomain = targetProfile.Domain
            };

            try
            {
                _logger?.LogInformation($"Detecting environment for target profile: {targetProfile.Name}");

                // Analyze target profile configuration
                if (!string.IsNullOrWhiteSpace(targetProfile.TenantId))
                {
                    result.HasAzureAD = true;
                    result.CloudServices = result.CloudServices.Append("Azure AD").ToArray();
                }

                if (!string.IsNullOrWhiteSpace(targetProfile.Domain))
                {
                    result.PrimaryDomain = targetProfile.Domain;

                    // Check for common cloud domain patterns
                    if (targetProfile.Domain.EndsWith(".onmicrosoft.com", StringComparison.OrdinalIgnoreCase))
                    {
                        result.HasOffice365 = true;
                        result.CloudServices = result.CloudServices.Append("Microsoft 365").ToArray();
                    }
                }

                // Use environment setting if explicitly configured
                if (!string.IsNullOrWhiteSpace(targetProfile.Environment))
                {
                    if (Enum.TryParse<EnvironmentType>(targetProfile.Environment, true, out var envType))
                    {
                        result.EnvironmentType = envType;
                    }
                }
                else
                {
                    // Determine environment type based on detected services
                    DetermineEnvironmentType(result);
                }

                result.DisplayStatus = result.GetEnvironmentDescription();

                _logger?.LogInformation($"Environment detection completed for {targetProfile.Name}: {result.EnvironmentType}");
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, $"Error detecting environment for target profile {targetProfile.Name}");
                result.Notes = $"Detection error: {ex.Message}";
                result.DisplayStatus = "Detection Failed";
            }

            return Task.FromResult(result);
        }

        /// <summary>
        /// Gets environment status for display in UI
        /// </summary>
        public async Task<string> GetEnvironmentStatusAsync(CompanyProfile companyProfile)
        {
            try
            {
                var detection = await DetectEnvironmentAsync(companyProfile);
                return detection.DisplayStatus;
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, $"Error getting environment status for {companyProfile.CompanyName}");
                return "Status Unknown";
            }
        }

        /// <summary>
        /// Validates that environment detection data is available
        /// </summary>
        public async Task<bool> HasDetectionDataAsync(CompanyProfile companyProfile)
        {
            try
            {
                var dataPath = _configurationService.GetCompanyRawDataPath(companyProfile.CompanyName);
                
                if (!Directory.Exists(dataPath))
                    return false;

                // Check for key discovery files that indicate successful discovery
                var csvFiles = Directory.GetFiles(dataPath, "*.csv");
                var hasData = csvFiles.Length > 0;

                _logger?.LogInformation($"Detection data available for {companyProfile.CompanyName}: {hasData} ({csvFiles.Length} CSV files)");
                
                return await Task.FromResult(hasData);
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, $"Error checking detection data for {companyProfile.CompanyName}");
                return false;
            }
        }

        /// <summary>
        /// Refreshes environment detection by running discovery modules
        /// </summary>
        public async Task<bool> RefreshEnvironmentDetectionAsync(CompanyProfile companyProfile)
        {
            try
            {
                _logger?.LogInformation($"Refreshing environment detection for {companyProfile.CompanyName}");
                
                // This would trigger a discovery run - for now just return true
                // In a full implementation, this would call the DiscoveryService
                await Task.Delay(100); // Simulate async operation
                
                return true;
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, $"Error refreshing environment detection for {companyProfile.CompanyName}");
                return false;
            }
        }

        /// <summary>
        /// Analyzes discovery CSV files to detect services and environment characteristics
        /// </summary>
        private async Task AnalyzeDiscoveryFilesAsync(string dataPath, EnvironmentDetectionResult result)
        {
            var csvFiles = Directory.GetFiles(dataPath, "*.csv");
            var cloudServices = new List<string>();
            var onPremServices = new List<string>();

            foreach (var csvFile in csvFiles)
            {
                var fileName = Path.GetFileNameWithoutExtension(csvFile).ToLowerInvariant();
                
                try
                {
                    // Analyze file names and content to detect services
                    if (fileName.Contains("azuread") || fileName.Contains("aad"))
                    {
                        result.HasAzureAD = true;
                        cloudServices.Add("Azure AD");
                    }
                    else if (fileName.Contains("activedirectory") || fileName.Contains("ad"))
                    {
                        result.HasActiveDirectory = true;
                        onPremServices.Add("Active Directory");
                    }
                    else if (fileName.Contains("exchange") && fileName.Contains("online"))
                    {
                        result.HasExchangeOnline = true;
                        cloudServices.Add("Exchange Online");
                    }
                    else if (fileName.Contains("exchange"))
                    {
                        result.HasExchangeOnPremises = true;
                        onPremServices.Add("Exchange Server");
                    }
                    else if (fileName.Contains("sharepoint") && fileName.Contains("online"))
                    {
                        result.HasSharePointOnline = true;
                        cloudServices.Add("SharePoint Online");
                    }
                    else if (fileName.Contains("sharepoint"))
                    {
                        result.HasSharePointOnPremises = true;
                        onPremServices.Add("SharePoint Server");
                    }
                    else if (fileName.Contains("teams"))
                    {
                        result.HasTeams = true;
                        cloudServices.Add("Microsoft Teams");
                    }
                    else if (fileName.Contains("office365") || fileName.Contains("o365"))
                    {
                        result.HasOffice365 = true;
                        cloudServices.Add("Microsoft 365");
                    }

                    // Try to extract domain information from tenant files
                    if (fileName.Contains("tenant") && File.Exists(csvFile))
                    {
                        await ExtractDomainFromTenantFileAsync(csvFile, result);
                    }
                }
                catch (Exception ex)
                {
                    _logger?.LogWarning(ex, $"Error analyzing discovery file: {csvFile}");
                }
            }

            result.CloudServices = cloudServices.Distinct().ToArray();
            result.OnPremServices = onPremServices.Distinct().ToArray();
        }

        /// <summary>
        /// Extracts domain information from tenant CSV files
        /// </summary>
        private async Task ExtractDomainFromTenantFileAsync(string csvFile, EnvironmentDetectionResult result)
        {
            try
            {
                var lines = await File.ReadAllLinesAsync(csvFile);
                if (lines.Length >= 2)
                {
                    var headers = lines[0].Split(',');
                    var values = lines[1].Split(',');
                    
                    for (int i = 0; i < headers.Length && i < values.Length; i++)
                    {
                        var header = headers[i].Trim().ToLowerInvariant();
                        var value = values[i].Trim();
                        
                        if ((header.Contains("domain") || header.Contains("defaultdomain")) && !string.IsNullOrWhiteSpace(value))
                        {
                            result.PrimaryDomain = value;
                            break;
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                _logger?.LogWarning(ex, $"Error extracting domain from tenant file: {csvFile}");
            }
        }

        /// <summary>
        /// Determines the overall environment type based on detected services
        /// </summary>
        private void DetermineEnvironmentType(EnvironmentDetectionResult result)
        {
            var hasCloud = result.HasAzureAD || result.HasExchangeOnline || result.HasSharePointOnline || result.HasTeams || result.HasOffice365;
            var hasOnPrem = result.HasActiveDirectory || result.HasExchangeOnPremises || result.HasSharePointOnPremises;

            if (hasCloud && hasOnPrem)
            {
                result.EnvironmentType = EnvironmentType.Hybrid;
                result.DisplayStatus = "Hybrid (On-Premises + Cloud)";
            }
            else if (hasCloud)
            {
                result.EnvironmentType = EnvironmentType.Azure;
                result.DisplayStatus = "Azure / Microsoft 365";
            }
            else if (hasOnPrem)
            {
                result.EnvironmentType = EnvironmentType.OnPremises;
                result.DisplayStatus = "On-Premises";
            }
            else
            {
                result.EnvironmentType = EnvironmentType.Unknown;
                result.DisplayStatus = "Environment Unknown";
            }
        }
    }
}