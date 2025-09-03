using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using System.IO;
using System.Xml;
using Microsoft.Extensions.Logging;
using MandADiscoverySuite.Services.Migration;
using MandADiscoverySuite.Models.Migration;
using MandADiscoverySuite.Models;
using MandADiscoverySuite.Migration;
using MandADiscoverySuite.Interfaces;

namespace MandADiscoverySuite.MigrationProviders
{
    /// <summary>
    /// Group Policy management client interface for dependency injection
    /// </summary>
    public interface IGroupPolicyClient
    {
        Task<string> CreateGpoAsync(GroupPolicyItem gpo, string targetDomain);
        Task<bool> GpoExistsAsync(string gpoName, string targetDomain);
        Task<GroupPolicyItem> GetGpoAsync(string gpoId, string domain);
        Task<bool> DeleteGpoAsync(string gpoId, string targetDomain);
        Task<bool> LinkGpoToOuAsync(string gpoId, string ouPath, string targetDomain);
        Task<bool> SetGpoSecurityFilteringAsync(string gpoId, List<string> securityPrincipals, string targetDomain);
        Task<bool> BackupGpoAsync(string gpoId, string backupPath, string domain);
        Task<bool> RestoreGpoAsync(string backupPath, string targetGpoId, string targetDomain);
        Task<Dictionary<string, object>> GetGpoSettingsAsync(string gpoId, string domain);
        Task<bool> SetGpoSettingsAsync(string gpoId, Dictionary<string, object> settings, string targetDomain);
        Task<List<string>> GetLinkedOUsAsync(string gpoId, string domain);
        Task<bool> UnlinkGpoFromOuAsync(string gpoId, string ouPath, string domain);
    }

    /// <summary>
    /// WMI filter management interface for GPO dependencies
    /// </summary>
    public interface IWmiFilterClient
    {
        Task<string> CreateWmiFilterAsync(string name, string description, List<string> wmiQueries, string targetDomain);
        Task<bool> WmiFilterExistsAsync(string filterName, string targetDomain);
        Task<bool> LinkWmiFilterToGpoAsync(string filterId, string gpoId, string targetDomain);
        Task<Dictionary<string, string>> GetWmiFilterQueriesAsync(string filterId, string domain);
        Task<bool> DeleteWmiFilterAsync(string filterId, string targetDomain);
    }

    /// <summary>
    /// Implements Group Policy Object migration with settings replication and OU linking
    /// </summary>
    public class GpoMigrator // : IGpoMigrator // Temporarily disabled due to missing interface methods
    {
        private readonly IGroupPolicyClient _gpClient;
        private readonly IWmiFilterClient _wmiClient;
        private readonly ISidMappingService _sidMappingService;
        private readonly ILogger<GpoMigrator> _logger;

        public GpoMigrator(
            IGroupPolicyClient gpClient,
            IWmiFilterClient wmiClient,
            ISidMappingService sidMappingService,
            ILogger<GpoMigrator> logger)
        {
            _gpClient = gpClient ?? throw new ArgumentNullException(nameof(gpClient));
            _wmiClient = wmiClient ?? throw new ArgumentNullException(nameof(wmiClient));
            _sidMappingService = sidMappingService ?? throw new ArgumentNullException(nameof(sidMappingService));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        public async Task<MigrationResult<GpoMigrationResult>> MigrateAsync(
            GroupPolicyItem item, 
            MandADiscoverySuite.Migration.MigrationContext context, 
            CancellationToken cancellationToken = default)
        {
            var result = new MigrationResult<GpoMigrationResult>
            {
                SourceId = item.Id,
                StartTime = DateTime.UtcNow,
                SessionId = context.SessionId,
                ExecutedBy = context.UserPrincipalName
            };

            var migrationResult = new GpoMigrationResult
            {
                SourceGpoId = item.Id,
                TargetGpoName = item.DisplayName,
                StartTime = DateTime.UtcNow,
                SessionId = context.SessionId,
                ExecutedBy = context.UserPrincipalName
            };

            try
            {
                _logger.LogInformation("Starting migration of GPO {GpoName} ({GpoId})", item.DisplayName, item.Id);

                // Check for existing GPO conflict
                var conflictExists = await _gpClient.GpoExistsAsync(item.DisplayName, context.TargetDomain);
                if (conflictExists)
                {
                    // Generate unique name
                    var newName = $"{item.DisplayName}_Migrated_{DateTime.UtcNow:yyyyMMdd}";
                    var counter = 1;
                    
                    while (await _gpClient.GpoExistsAsync(newName, context.TargetDomain))
                    {
                        newName = $"{item.DisplayName}_Migrated_{DateTime.UtcNow:yyyyMMdd}_{counter}";
                        counter++;
                    }
                    
                    migrationResult.TargetGpoName = newName;
                    migrationResult.Warnings.Add($"GPO renamed from {item.DisplayName} to {newName} due to conflict");
                    
                    _logger.LogWarning("GPO {OriginalName} renamed to {NewName} due to conflict", 
                        item.DisplayName, newName);
                }

                // Create the GPO in target domain
                var targetGpoId = await _gpClient.CreateGpoAsync(item, context.TargetDomain);
                if (!string.IsNullOrEmpty(targetGpoId))
                {
                    migrationResult.GpoCreated = true;
                    migrationResult.TargetGpoId = targetGpoId;
                    result.TargetId = targetGpoId;
                    
                    _logger.LogInformation("Successfully created GPO {GpoName} with ID {TargetGpoId}", 
                        migrationResult.TargetGpoName, targetGpoId);
                }
                else
                {
                    throw new InvalidOperationException($"Failed to create GPO {item.DisplayName} in target domain");
                }

                // Replicate GPO settings
                var settingsResult = await ReplicateGpoSettingsAsync(item.Id, string.Empty, context, cancellationToken);
                if (settingsResult.IsSuccess)
                {
                    migrationResult.SettingsReplicated = true;
                    migrationResult.ReplicatedSettings = settingsResult.PolicySettings;
                    migrationResult.UnsupportedSettings = settingsResult.SkippedSettings;
                    
                    _logger.LogInformation("Replicated {SettingCount} settings for GPO {GpoName}", 
                        settingsResult.ReplicatedSettingCount, item.DisplayName);
                }
                else
                {
                    migrationResult.Warnings.AddRange(settingsResult.Warnings);
                    migrationResult.UnsupportedSettings = settingsResult.SkippedSettings;
                }

                // Link GPO to OUs
                if (item.LinkedOUs.Any())
                {
                    var linkedCount = 0;
                    foreach (var ouPath in item.LinkedOUs)
                    {
                        try
                        {
                            var linkCreated = await _gpClient.LinkGpoToOuAsync(targetGpoId, ouPath, context.TargetDomain);
                            if (linkCreated)
                            {
                                linkedCount++;
                                migrationResult.LinkedOUs.Add(ouPath);
                            }
                            else
                            {
                                migrationResult.Warnings.Add($"Failed to link GPO to OU {ouPath}");
                            }
                        }
                        catch (Exception ex)
                        {
                            _logger.LogWarning(ex, "Failed to link GPO {GpoId} to OU {OuPath}", targetGpoId, ouPath);
                            migrationResult.Warnings.Add($"Error linking to OU {ouPath}: {ex.Message}");
                        }
                    }
                    
                    migrationResult.OuLinksConfigured = linkedCount > 0;
                    
                    _logger.LogInformation("Linked GPO {GpoName} to {LinkedCount} of {TotalCount} OUs", 
                        item.DisplayName, linkedCount, item.LinkedOUs.Count);
                }

                // Apply security filtering
                if (item.SecurityFiltering.Any())
                {
                    var securityResult = await MigrateSecurityFilteringAsync(
                        targetGpoId, item.SecurityFiltering, new Dictionary<string, string>(), context, cancellationToken);
                    
                    migrationResult.SecurityFilteringApplied = securityResult.IsSuccess;
                    if (!securityResult.IsSuccess)
                    {
                        migrationResult.Warnings.AddRange(securityResult.Warnings);
                    }
                    
                    _logger.LogInformation("Applied security filtering to GPO {GpoName}: {Success}", 
                        item.DisplayName, securityResult.IsSuccess);
                }

                // Migrate WMI filters
                if (item.WmiFilters.Any())
                {
                    var wmiResult = await MigrateWmiFiltersAsync(item.WmiFilters, new Dictionary<string, string>(), context, cancellationToken);
                    migrationResult.WmiFiltersApplied = wmiResult.IsSuccess;
                    
                    if (!wmiResult.IsSuccess)
                    {
                        migrationResult.Warnings.AddRange(wmiResult.Warnings);
                    }
                    
                    _logger.LogInformation("Migrated WMI filters for GPO {GpoName}: {Success}", 
                        item.DisplayName, wmiResult.IsSuccess);
                }

                migrationResult.IsSuccess = true;
                migrationResult.EndTime = DateTime.UtcNow;
                result.IsSuccess = true;
                result.EndTime = DateTime.UtcNow;
                result.Result = migrationResult;

                _logger.LogInformation("Successfully completed migration of GPO {GpoName} in {Duration}", 
                    item.DisplayName, result.Duration);

                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to migrate GPO {GpoName} ({GpoId})", item.DisplayName, item.Id);
                
                migrationResult.IsSuccess = false;
                migrationResult.ErrorMessage = ex.Message;
                migrationResult.Errors.Add(ex.Message);
                migrationResult.EndTime = DateTime.UtcNow;
                
                result.IsSuccess = false;
                result.ErrorMessage = ex.Message;
                result.Errors.Add(ex.Message);
                result.EndTime = DateTime.UtcNow;
                result.Result = migrationResult;

                return result;
            }
        }

        public async Task<MandADiscoverySuite.Migration.ValidationResult> ValidateAsync(
            GroupPolicyItem item, 
            MandADiscoverySuite.Migration.MigrationContext context, 
            CancellationToken cancellationToken = default)
        {
            var validationResult = new MandADiscoverySuite.Migration.ValidationResult
            {
                ValidationType = "GroupPolicyMigration",
                StartTime = DateTime.UtcNow,
                SessionId = context.SessionId,
                ExecutedBy = context.UserPrincipalName
            };

            try
            {
                _logger.LogInformation("Validating GPO {GpoName} for migration", item.DisplayName);

                // Check GPO name
                if (string.IsNullOrWhiteSpace(item.DisplayName))
                {
                    validationResult.Issues.Add(new ValidationIssue
                    {
                        Severity = ValidationSeverity.Error,
                        Message = "GPO display name cannot be empty",
                        ItemId = item.Id,
                        Category = "GpoName"
                    });
                }

                // Validate GPO ID format
                if (string.IsNullOrWhiteSpace(item.Id) || !Guid.TryParse(item.Id, out _))
                {
                    validationResult.Issues.Add(new ValidationIssue
                    {
                        Severity = ValidationSeverity.Error,
                        Message = "GPO ID must be a valid GUID",
                        ItemId = item.Id,
                        Category = "GpoId"
                    });
                }

                // Check OU paths format
                foreach (var ouPath in item.LinkedOUs)
                {
                    if (!ouPath.StartsWith("OU=", StringComparison.OrdinalIgnoreCase) && 
                        !ouPath.StartsWith("DC=", StringComparison.OrdinalIgnoreCase))
                    {
                        validationResult.Issues.Add(new ValidationIssue
                        {
                            Severity = ValidationSeverity.Warning,
                            Message = $"Potentially invalid OU path format: {ouPath}",
                            ItemId = item.Id,
                            Category = "OuPath"
                        });
                    }
                }

                // Validate security principals
                foreach (var principal in item.SecurityFiltering)
                {
                    if (string.IsNullOrWhiteSpace(principal))
                    {
                        validationResult.Issues.Add(new ValidationIssue
                        {
                            Severity = ValidationSeverity.Warning,
                            Message = "Empty security principal in filtering list",
                            ItemId = item.Id,
                            Category = "SecurityFiltering"
                        });
                    }
                }

                // Check GPO settings for potential compatibility issues
                if (item.Settings.Any())
                {
                    var unsupportedSettings = GetUnsupportedSettings(item.Settings);
                    foreach (var setting in unsupportedSettings)
                    {
                        validationResult.Issues.Add(new ValidationIssue
                        {
                            Severity = ValidationSeverity.Warning,
                            Message = $"Setting may not be supported in target environment: {setting}",
                            ItemId = item.Id,
                            Category = "UnsupportedSetting"
                        });
                    }
                }

                validationResult.IsSuccess = !validationResult.Issues.Any(i => i.Severity == ValidationSeverity.Error);
                validationResult.EndTime = DateTime.UtcNow;

                _logger.LogInformation("GPO validation completed for {GpoName} with {IssueCount} issues", 
                    item.DisplayName, validationResult.Issues.Count);

                return validationResult;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error validating GPO {GpoName}", item.DisplayName);
                
                validationResult.IsSuccess = false;
                validationResult.ErrorMessage = ex.Message;
                validationResult.Errors.Add(ex.Message);
                validationResult.EndTime = DateTime.UtcNow;

                return validationResult;
            }
        }

        public async Task<MandADiscoverySuite.Migration.RollbackResult> RollbackAsync(
            GpoMigrationResult result, 
            MandADiscoverySuite.Migration.MigrationContext context, 
            CancellationToken cancellationToken = default)
        {
            var rollbackResult = new MandADiscoverySuite.Migration.RollbackResult
            {
                RollbackAction = "DeleteGpo",
                StartTime = DateTime.UtcNow,
                SessionId = context.SessionId,
                ExecutedBy = context.UserPrincipalName
            };

            try
            {
                _logger.LogInformation("Starting rollback for GPO {TargetGpoId}", result.TargetGpoId);

                if (!string.IsNullOrEmpty(result.TargetGpoId))
                {
                    // Unlink from OUs first
                    foreach (var ouPath in result.LinkedOUs)
                    {
                        try
                        {
                            await _gpClient.UnlinkGpoFromOuAsync(result.TargetGpoId, ouPath, context.TargetDomain);
                            rollbackResult.RestoredItems.Add($"Unlinked GPO from OU {ouPath}");
                        }
                        catch (Exception ex)
                        {
                            _logger.LogWarning(ex, "Failed to unlink GPO from OU {OuPath} during rollback", ouPath);
                            rollbackResult.UnrestoredItems.Add($"Failed to unlink from OU {ouPath}: {ex.Message}");
                        }
                    }

                    // Delete the GPO
                    var deleted = await _gpClient.DeleteGpoAsync(result.TargetGpoId, context.TargetDomain);
                    if (deleted)
                    {
                        rollbackResult.DataRestored = true;
                        rollbackResult.RestoredItems.Add($"Deleted GPO {result.TargetGpoName}");
                        _logger.LogInformation("Successfully rolled back GPO {TargetGpoName}", result.TargetGpoName);
                    }
                    else
                    {
                        rollbackResult.UnrestoredItems.Add($"Failed to delete GPO {result.TargetGpoName}");
                    }
                }

                rollbackResult.IsSuccess = rollbackResult.DataRestored;
                rollbackResult.EndTime = DateTime.UtcNow;
                return rollbackResult;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to rollback GPO {TargetGpoId}", result.TargetGpoId);
                
                rollbackResult.IsSuccess = false;
                rollbackResult.ErrorMessage = ex.Message;
                rollbackResult.Errors.Add(ex.Message);
                rollbackResult.EndTime = DateTime.UtcNow;
                rollbackResult.UnrestoredItems.Add($"Exception during rollback: {ex.Message}");

                return rollbackResult;
            }
        }

        public async Task<bool> SupportsAsync(
            MigrationType type, 
            MandADiscoverySuite.Migration.MigrationContext context, 
            CancellationToken cancellationToken = default)
        {
            return type == MandADiscoverySuite.Models.MigrationType.GroupPolicy;
        }

        public async Task<TimeSpan> EstimateDurationAsync(
            GroupPolicyItem item, 
            MandADiscoverySuite.Migration.MigrationContext context, 
            CancellationToken cancellationToken = default)
        {
            // Base time for GPO creation
            var baseTime = TimeSpan.FromSeconds(10);
            
            // Additional time for settings replication
            var settingsTime = TimeSpan.FromMilliseconds(item.Settings.Count * 100);
            
            // Additional time for OU links
            var ouLinkTime = TimeSpan.FromMilliseconds(item.LinkedOUs.Count * 500);
            
            // Additional time for security filtering
            var securityTime = TimeSpan.FromMilliseconds(item.SecurityFiltering.Count * 200);
            
            // Additional time for WMI filters
            var wmiTime = TimeSpan.FromMilliseconds(item.WmiFilters.Count * 1000);
            
            return baseTime.Add(settingsTime).Add(ouLinkTime).Add(securityTime).Add(wmiTime);
        }

        public async Task<GpoReplicationResult> ReplicateGpoSettingsAsync(
            string sourceGpoId, 
            string targetOuPath, 
            MandADiscoverySuite.Migration.MigrationContext context, 
            CancellationToken cancellationToken = default)
        {
            var result = new GpoReplicationResult
            {
                SourceGpoId = sourceGpoId,
                TargetOuPath = targetOuPath,
                StartTime = DateTime.UtcNow,
                SessionId = context.SessionId,
                ExecutedBy = context.UserPrincipalName
            };

            try
            {
                _logger.LogInformation("Replicating settings for GPO {SourceGpoId}", sourceGpoId);

                // Get settings from source GPO
                var sourceSettings = await _gpClient.GetGpoSettingsAsync(sourceGpoId, context.SourceDomain);
                var supportedSettings = new Dictionary<string, object>();
                var skippedSettings = new List<string>();

                // Filter and convert settings for target environment
                foreach (var setting in sourceSettings)
                {
                    if (IsSettingSupported(setting.Key, setting.Value))
                    {
                        var convertedValue = ConvertSettingForTarget(setting.Key, setting.Value, context);
                        supportedSettings[setting.Key] = convertedValue;
                    }
                    else
                    {
                        skippedSettings.Add(setting.Key);
                        _logger.LogWarning("Skipping unsupported setting: {SettingKey}", setting.Key);
                    }
                }

                // Apply supported settings to target GPO
                if (supportedSettings.Any())
                {
                    var applied = await _gpClient.SetGpoSettingsAsync(sourceGpoId, supportedSettings, context.TargetDomain);
                    if (applied)
                    {
                        result.SettingsReplicated = true;
                        result.ReplicatedSettingCount = supportedSettings.Count;
                        result.PolicySettings = supportedSettings;
                    }
                }

                result.SkippedSettings = skippedSettings;
                result.IsSuccess = result.SettingsReplicated || !sourceSettings.Any();
                result.EndTime = DateTime.UtcNow;

                _logger.LogInformation("GPO settings replication completed. Applied: {Applied}, Skipped: {Skipped}", 
                    supportedSettings.Count, skippedSettings.Count);

                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to replicate settings for GPO {SourceGpoId}", sourceGpoId);
                
                result.IsSuccess = false;
                result.ErrorMessage = ex.Message;
                result.Errors.Add(ex.Message);
                result.EndTime = DateTime.UtcNow;

                return result;
            }
        }

        public async Task<WmiFilterMigrationResult> MigrateWmiFiltersAsync(
            List<string> wmiFilterIds, 
            Dictionary<string, string> sidMapping, 
            MandADiscoverySuite.Migration.MigrationContext context, 
            CancellationToken cancellationToken = default)
        {
            var result = new WmiFilterMigrationResult
            {
                StartTime = DateTime.UtcNow,
                SessionId = context.SessionId,
                ExecutedBy = context.UserPrincipalName,
                AllFiltersCompatible = true
            };

            try
            {
                _logger.LogInformation("Migrating {FilterCount} WMI filters", wmiFilterIds.Count);

                foreach (var filterId in wmiFilterIds)
                {
                    try
                    {
                        // Get WMI filter queries from source
                        var queries = await _wmiClient.GetWmiFilterQueriesAsync(filterId, context.SourceDomain);
                        
                        if (queries.Any())
                        {
                            // Create filter in target domain
                            var filterName = $"MigratedFilter_{filterId}_{DateTime.UtcNow:yyyyMMdd}";
                            var targetFilterId = await _wmiClient.CreateWmiFilterAsync(
                                filterName, 
                                "Migrated WMI Filter", 
                                queries.Values.ToList(), 
                                context.TargetDomain);

                            if (!string.IsNullOrEmpty(targetFilterId))
                            {
                                result.MigratedFilters.Add(targetFilterId);
                                result.FilterSidMappings[filterId] = targetFilterId;
                                result.WmiQueries[targetFilterId] = string.Join("; ", queries.Values);
                                
                                _logger.LogInformation("Successfully migrated WMI filter {FilterId} to {TargetFilterId}", 
                                    filterId, targetFilterId);
                            }
                            else
                            {
                                result.SkippedFilters.Add(filterId);
                                result.AllFiltersCompatible = false;
                                result.Warnings.Add($"Failed to create WMI filter for {filterId}");
                            }
                        }
                        else
                        {
                            result.SkippedFilters.Add(filterId);
                            result.Warnings.Add($"No WMI queries found for filter {filterId}");
                        }
                    }
                    catch (Exception ex)
                    {
                        _logger.LogWarning(ex, "Failed to migrate WMI filter {FilterId}", filterId);
                        result.SkippedFilters.Add(filterId);
                        result.AllFiltersCompatible = false;
                        result.Warnings.Add($"Error migrating filter {filterId}: {ex.Message}");
                    }
                }

                result.IsSuccess = result.MigratedFilters.Count > 0 || !wmiFilterIds.Any();
                result.EndTime = DateTime.UtcNow;

                _logger.LogInformation("WMI filter migration completed. Migrated: {Migrated}, Skipped: {Skipped}", 
                    result.MigratedFilters.Count, result.SkippedFilters.Count);

                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to migrate WMI filters");
                
                result.IsSuccess = false;
                result.ErrorMessage = ex.Message;
                result.Errors.Add(ex.Message);
                result.EndTime = DateTime.UtcNow;

                return result;
            }
        }

        public async Task<MandADiscoverySuite.Interfaces.GpoCompatibilityResult> ValidateGpoCompatibilityAsync(
            List<GroupPolicyItem> groupPolicies, 
            MandADiscoverySuite.Migration.MigrationContext context, 
            CancellationToken cancellationToken = default)
        {
            var result = new MandADiscoverySuite.Interfaces.GpoCompatibilityResult
            {
                TotalGposAnalyzed = groupPolicies.Count,
                StartTime = DateTime.UtcNow,
                SessionId = context.SessionId,
                ExecutedBy = context.UserPrincipalName
            };

            try
            {
                _logger.LogInformation("Validating compatibility for {GpoCount} GPOs", groupPolicies.Count);

                foreach (var gpo in groupPolicies)
                {
                    var incompatibilityReasons = new List<string>();

                    // Check for unsupported settings
                    var unsupportedSettings = GetUnsupportedSettings(gpo.Settings);
                    if (unsupportedSettings.Any())
                    {
                        incompatibilityReasons.AddRange(unsupportedSettings.Select(s => $"Unsupported setting: {s}"));
                    }

                    // Check for invalid OU paths
                    var invalidOUs = gpo.LinkedOUs.Where(ou => !IsValidOuPath(ou)).ToList();
                    if (invalidOUs.Any())
                    {
                        incompatibilityReasons.AddRange(invalidOUs.Select(ou => $"Invalid OU path: {ou}"));
                    }

                    // Check for invalid security principals
                    var invalidPrincipals = gpo.SecurityFiltering.Where(p => string.IsNullOrWhiteSpace(p)).ToList();
                    if (invalidPrincipals.Any())
                    {
                        incompatibilityReasons.Add("Invalid security principals found");
                    }

                    if (incompatibilityReasons.Any())
                    {
                        result.IncompatibleGpos++;
                        result.IncompatibilityReasons[gpo.Id] = incompatibilityReasons;
                        
                        // Suggest conversions
                        var conversions = GetRequiredConversions(gpo);
                        result.RequiredConversions.AddRange(conversions);
                    }
                    else
                    {
                        result.CompatibleGpos++;
                        result.CompatibleGpoIds.Add(gpo.Id);
                    }
                }

                result.IsSuccess = result.IncompatibleGpos == 0 || result.CompatibleGpos > 0;
                result.EndTime = DateTime.UtcNow;

                // Add metadata about the analysis
                result.CompatibilityMetadata["AnalysisDate"] = DateTime.UtcNow;
                result.CompatibilityMetadata["SourceDomain"] = context.SourceDomain;
                result.CompatibilityMetadata["TargetDomain"] = context.TargetDomain;

                _logger.LogInformation("GPO compatibility validation completed. Compatible: {Compatible}, Incompatible: {Incompatible}", 
                    result.CompatibleGpos, result.IncompatibleGpos);

                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to validate GPO compatibility");
                
                result.IsSuccess = false;
                result.ErrorMessage = ex.Message;
                result.Errors.Add(ex.Message);
                result.EndTime = DateTime.UtcNow;

                return result;
            }
        }

        public async Task<GpoSecurityFilterResult> MigrateSecurityFilteringAsync(
            string gpoId, 
            List<string> securityPrincipals, 
            Dictionary<string, string> sidMapping, 
            MandADiscoverySuite.Migration.MigrationContext context, 
            CancellationToken cancellationToken = default)
        {
            var result = new GpoSecurityFilterResult
            {
                GpoId = gpoId,
                SourceSecurityPrincipals = new List<string>(securityPrincipals),
                StartTime = DateTime.UtcNow,
                SessionId = context.SessionId,
                ExecutedBy = context.UserPrincipalName
            };

            try
            {
                _logger.LogInformation("Migrating security filtering for GPO {GpoId} with {PrincipalCount} principals", 
                    gpoId, securityPrincipals.Count);

                var mappedPrincipals = new List<string>();
                
                foreach (var principal in securityPrincipals)
                {
                    try
                    {
                        string mappedPrincipal;
                        
                        // Check if it's a SID that needs mapping
                        if (principal.StartsWith("S-") && sidMapping.ContainsKey(principal))
                        {
                            mappedPrincipal = sidMapping[principal];
                        }
                        else if (principal.StartsWith("S-"))
                        {
                            // Try to map the SID
                            mappedPrincipal = await _sidMappingService.MapSidAsync(principal, context.TargetDomain);
                            if (string.IsNullOrEmpty(mappedPrincipal))
                            {
                                result.UnmappedPrincipals.Add(principal);
                                continue;
                            }
                        }
                        else
                        {
                            // Assume it's a name-based principal that can be used as-is
                            mappedPrincipal = principal;
                        }

                        mappedPrincipals.Add(mappedPrincipal);
                        result.MigratedSecurityPrincipals.Add(mappedPrincipal);
                        result.PrincipalSidMappings[principal] = mappedPrincipal;
                    }
                    catch (Exception ex)
                    {
                        _logger.LogWarning(ex, "Failed to map security principal {Principal}", principal);
                        result.UnmappedPrincipals.Add(principal);
                        result.Warnings.Add($"Failed to map principal {principal}: {ex.Message}");
                    }
                }

                // Apply security filtering to GPO
                if (mappedPrincipals.Any())
                {
                    var applied = await _gpClient.SetGpoSecurityFilteringAsync(gpoId, mappedPrincipals, context.TargetDomain);
                    result.SecurityFilteringEnabled = applied;
                    
                    if (applied)
                    {
                        _logger.LogInformation("Successfully applied security filtering to GPO {GpoId}", gpoId);
                    }
                    else
                    {
                        result.Warnings.Add("Failed to apply security filtering to GPO");
                    }
                }

                result.IsSuccess = result.SecurityFilteringEnabled || !securityPrincipals.Any();
                result.EndTime = DateTime.UtcNow;

                _logger.LogInformation("Security filtering migration completed. Mapped: {Mapped}, Unmapped: {Unmapped}", 
                    result.MigratedSecurityPrincipals.Count, result.UnmappedPrincipals.Count);

                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to migrate security filtering for GPO {GpoId}", gpoId);
                
                result.IsSuccess = false;
                result.ErrorMessage = ex.Message;
                result.Errors.Add(ex.Message);
                result.EndTime = DateTime.UtcNow;

                return result;
            }
        }

        public async Task<GpoBackupResult> CreateGpoBackupAsync(
            List<string> gpoIds, 
            string backupLocation, 
            MandADiscoverySuite.Migration.MigrationContext context, 
            CancellationToken cancellationToken = default)
        {
            var result = new GpoBackupResult
            {
                BackupLocation = backupLocation,
                BackupTimestamp = DateTime.UtcNow,
                StartTime = DateTime.UtcNow,
                SessionId = context.SessionId,
                ExecutedBy = context.UserPrincipalName
            };

            try
            {
                _logger.LogInformation("Creating backup for {GpoCount} GPOs at {BackupLocation}", 
                    gpoIds.Count, backupLocation);

                // Ensure backup directory exists
                if (!Directory.Exists(backupLocation))
                {
                    Directory.CreateDirectory(backupLocation);
                }

                long totalBackupSize = 0;

                foreach (var gpoId in gpoIds)
                {
                    try
                    {
                        var gpoBackupPath = Path.Combine(backupLocation, $"GPO_{gpoId}_{DateTime.UtcNow:yyyyMMdd_HHmmss}");
                        
                        var backupSuccessful = await _gpClient.BackupGpoAsync(gpoId, gpoBackupPath, context.SourceDomain);
                        
                        if (backupSuccessful)
                        {
                            result.BackedUpGpoIds.Add(gpoId);
                            result.BackupPaths[gpoId] = gpoBackupPath;
                            
                            // Calculate backup size
                            if (Directory.Exists(gpoBackupPath))
                            {
                                var dirInfo = new DirectoryInfo(gpoBackupPath);
                                var size = dirInfo.GetFiles("*", SearchOption.AllDirectories).Sum(f => f.Length);
                                totalBackupSize += size;
                            }
                            
                            _logger.LogInformation("Successfully backed up GPO {GpoId} to {BackupPath}", gpoId, gpoBackupPath);
                        }
                        else
                        {
                            result.FailedBackups.Add(gpoId);
                            result.Warnings.Add($"Failed to backup GPO {gpoId}");
                        }
                    }
                    catch (Exception ex)
                    {
                        _logger.LogWarning(ex, "Failed to backup GPO {GpoId}", gpoId);
                        result.FailedBackups.Add(gpoId);
                        result.Warnings.Add($"Error backing up GPO {gpoId}: {ex.Message}");
                    }
                }

                result.BackupSizeBytes = totalBackupSize;
                result.IsSuccess = result.BackedUpGpoIds.Count > 0;
                result.EndTime = DateTime.UtcNow;

                _logger.LogInformation("GPO backup completed. Successful: {Success}, Failed: {Failed}, Size: {Size} bytes", 
                    result.BackedUpGpoIds.Count, result.FailedBackups.Count, totalBackupSize);

                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to create GPO backups");
                
                result.IsSuccess = false;
                result.ErrorMessage = ex.Message;
                result.Errors.Add(ex.Message);
                result.EndTime = DateTime.UtcNow;

                return result;
            }
        }

        #region Private Helper Methods

        private List<string> GetUnsupportedSettings(Dictionary<string, object> settings)
        {
            var unsupported = new List<string>();
            
            // Define known unsupported settings for cross-domain migration
            var unsupportedSettingPatterns = new[]
            {
                "LocalMachine\\Software\\Policies\\Microsoft\\Windows\\Installer\\AlwaysInstallElevated", // Security risk
                "LocalMachine\\Software\\Policies\\Microsoft\\WindowsFirewall\\StandardProfile\\DoNotAllowExceptions", // Connectivity issues
                "User\\Software\\Policies\\Microsoft\\Windows\\Explorer\\NoActiveDesktopChanges", // Legacy setting
                // Add more patterns as needed
            };

            foreach (var setting in settings.Keys)
            {
                if (unsupportedSettingPatterns.Any(pattern => setting.Contains(pattern, StringComparison.OrdinalIgnoreCase)))
                {
                    unsupported.Add(setting);
                }
            }

            return unsupported;
        }

        private bool IsSettingSupported(string settingKey, object settingValue)
        {
            // Implement logic to determine if a setting is supported in the target environment
            var unsupportedSettings = GetUnsupportedSettings(new Dictionary<string, object> { { settingKey, settingValue } });
            return !unsupportedSettings.Contains(settingKey);
        }

        private object ConvertSettingForTarget(string settingKey, object settingValue, MandADiscoverySuite.Migration.MigrationContext context)
        {
            // Implement setting conversion logic for target environment
            // For now, return the value as-is
            return settingValue;
        }

        private bool IsValidOuPath(string ouPath)
        {
            // Basic validation for OU path format
            return !string.IsNullOrWhiteSpace(ouPath) &&
                   (ouPath.StartsWith("OU=", StringComparison.OrdinalIgnoreCase) ||
                    ouPath.StartsWith("DC=", StringComparison.OrdinalIgnoreCase) ||
                    ouPath.StartsWith("CN=", StringComparison.OrdinalIgnoreCase));
        }

        private List<string> GetRequiredConversions(GroupPolicyItem gpo)
        {
            var conversions = new List<string>();
            
            // Analyze GPO for required conversions
            if (gpo.Settings.Any(s => s.Key.Contains("WindowsFirewall")))
            {
                conversions.Add("Windows Firewall settings may need manual review");
            }
            
            if (gpo.Settings.Any(s => s.Key.Contains("WindowsUpdate")))
            {
                conversions.Add("Windows Update settings should be validated against target WSUS configuration");
            }
            
            return conversions;
        }

        #endregion
    }
}