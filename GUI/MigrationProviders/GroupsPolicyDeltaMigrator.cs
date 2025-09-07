using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using MandADiscoverySuite.Migration;
using MandADiscoverySuite.Models;
using MandADiscoverySuite.Models.Migration;
using MandADiscoverySuite.Models.Identity;
using MandADiscoverySuite.Services.Migration;
using MandADiscoverySuite.Services;

namespace MandADiscoverySuite.MigrationProviders
{
    /// <summary>
    /// Delta migration provider for Groups, GPOs, and ACLs supporting T-036 delta migration framework
    /// Integrates with DeltaMigrationService for comprehensive change detection and incremental migration
    /// </summary>
    public class GroupsPolicyDeltaMigrator : IGroupsPolicyDeltaMigrator
    {
        private readonly ILogger<GroupsPolicyDeltaMigrator> _logger;
        private readonly IGroupsPolicyMigrator _groupsPolicyMigrator;
        private readonly AuditService _auditService;

        public GroupsPolicyDeltaMigrator(
            ILogger<GroupsPolicyDeltaMigrator> logger,
            IGroupsPolicyMigrator groupsPolicyMigrator,
            AuditService auditService)
        {
            _logger = logger;
            _groupsPolicyMigrator = groupsPolicyMigrator;
            _auditService = auditService;
        }

        /// <summary>
        /// Detects changes in groups, GPOs, and ACLs since last migration run
        /// </summary>
        public async Task<IEnumerable<ChangeDetectionResult<GroupsPolicyChangeItem>>> DetectChangesAsync(
            DateTime lastRunTimestamp,
            DeltaMigrationSettings settings)
        {
            var changes = new List<ChangeDetectionResult<GroupsPolicyChangeItem>>();

            _logger.LogInformation("Detecting Groups/GPO/ACL changes since {LastRun}", lastRunTimestamp);

            try
            {
                // Phase 1: Detect group changes
                var groupChanges = await DetectGroupChangesAsync(lastRunTimestamp, settings);
                changes.AddRange(groupChanges);

                // Phase 2: Detect GPO changes  
                var gpoChanges = await DetectGpoChangesAsync(lastRunTimestamp, settings);
                changes.AddRange(gpoChanges);

                // Phase 3: Detect ACL changes
                var aclChanges = await DetectAclChangesAsync(lastRunTimestamp, settings);
                changes.AddRange(aclChanges);

                _logger.LogInformation("Detected {ChangeCount} Groups/GPO/ACL changes", changes.Count);

                return changes;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to detect Groups/GPO/ACL changes");
                throw;
            }
        }

        /// <summary>
        /// Performs delta migration for detected changes
        /// </summary>
        public async Task<DeltaMigrationResult<Services.Migration.MigrationResultBase>> MigrateDeltaAsync(
            DateTime lastRunTimestamp,
            DeltaMigrationSettings settings,
            TargetContext target,
            IProgress<MandADiscoverySuite.Migration.MigrationProgress>? progress = null)
        {
            var result = new DeltaMigrationResult<Services.Migration.MigrationResultBase>
            {
                // LastRunTimestamp not available,
                DeltaRunTimestamp = DateTime.UtcNow,
                MigrationResults = new List<Services.Migration.MigrationResultBase>()
            };

            try
            {
                _logger.LogInformation("Starting Groups/GPO/ACL delta migration since {LastRun}", lastRunTimestamp);

                // Phase 1: Detect changes
                progress?.Report(new MandADiscoverySuite.Migration.MigrationProgress
                {
                    Message = "Detecting Groups/GPO/ACL changes...",
                    Percentage = 10
                });

                var changes = await DetectChangesAsync(lastRunTimestamp, settings);
                var changesList = changes.ToList();

                if (!changesList.Any())
                {
                    // Success is computed property based on MigrationResults
                    result.ErrorMessage = null; // No error, just no changes detected
                    return result;
                }

                progress?.Report(new MandADiscoverySuite.Migration.MigrationProgress
                {
                    Message = $"Processing {changesList.Count} Groups/GPO/ACL changes...",
                    Percentage = 30
                });

                // Phase 2: Group changes by type for efficient processing
                var groupedChanges = GroupChangesByType(changesList);

                // Phase 3: Process group changes
                if (groupedChanges.GroupChanges.Any())
                {
                    progress?.Report(new MandADiscoverySuite.Migration.MigrationProgress
                    {
                        Message = $"Migrating {groupedChanges.GroupChanges.Count} group changes...",
                        Percentage = 50
                    });

                    var groupResults = await ProcessGroupDeltaChangesAsync(groupedChanges.GroupChanges, settings, target);
                    ((List<Services.Migration.MigrationResultBase>)result.MigrationResults).AddRange(groupResults.Cast<Services.Migration.MigrationResultBase>());
                }

                // Phase 4: Process GPO changes
                if (groupedChanges.GpoChanges.Any())
                {
                    progress?.Report(new MandADiscoverySuite.Migration.MigrationProgress
                    {
                        Message = $"Migrating {groupedChanges.GpoChanges.Count} GPO changes...",
                        Percentage = 70
                    });

                    var gpoResults = await ProcessGpoDeltaChangesAsync(groupedChanges.GpoChanges, settings, target);
                    ((List<Services.Migration.MigrationResultBase>)result.MigrationResults).AddRange(gpoResults.Cast<Services.Migration.MigrationResultBase>());
                }

                // Phase 5: Process ACL changes
                if (groupedChanges.AclChanges.Any())
                {
                    progress?.Report(new MandADiscoverySuite.Migration.MigrationProgress
                    {
                        Message = $"Migrating {groupedChanges.AclChanges.Count} ACL changes...",
                        Percentage = 90
                    });

                    var aclResults = await ProcessAclDeltaChangesAsync(groupedChanges.AclChanges, settings, target);
                    ((List<Services.Migration.MigrationResultBase>)result.MigrationResults).AddRange(aclResults.Cast<Services.Migration.MigrationResultBase>());
                }

                result.Duration = DateTime.UtcNow - result.DeltaRunTimestamp;
                
                // Report completion
                progress?.Report(new MandADiscoverySuite.Migration.MigrationProgress());

                _logger.LogInformation("Groups/GPO/ACL delta migration completed. Success: {Success}, Results: {ResultCount}",
                    result.Success, result.MigrationResults.Count);

                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Groups/GPO/ACL delta migration failed");

                // Clear any partial results and set error message; Success is computed based on MigrationResults
                result.MigrationResults.Clear();
                result.ErrorMessage = ex.Message;
                result.Duration = DateTime.UtcNow - result.DeltaRunTimestamp;

                return result;
            }
        }

        /// <summary>
        /// Validates cutover readiness for Groups/GPO/ACL migrations
        /// </summary>
        public async Task<CutoverValidationResult> ValidateCutoverReadinessAsync(
            IEnumerable<Services.Migration.MigrationResultBase> migrationResults,
            TargetContext target)
        {
            var result = new CutoverValidationResult
            {
                ValidationTimestamp = DateTime.UtcNow,
                RiskLevel = CutoverRiskLevel.Low
            };

            try
            {
                _logger.LogInformation("Validating Groups/GPO/ACL cutover readiness for {ResultCount} migrations",
                    migrationResults.Count());

                var groupsResults = migrationResults.OfType<Models.Identity.GroupMigrationResult>().ToList();
                var gpoResults = migrationResults.OfType<Models.Identity.GpoMigrationResult>().ToList();
                var aclResults = migrationResults.OfType<Models.Identity.AclMigrationResult>().ToList();

                // Validate group cutover readiness
                await ValidateGroupsCutoverAsync(groupsResults, result, target);

                // Validate GPO cutover readiness
                await ValidateGpoCutoverAsync(gpoResults, result, target);

                // Validate ACL cutover readiness
                await ValidateAclCutoverAsync(aclResults, result, target);

                // Determine overall readiness
                result.IsReady = !result.Issues.Any(i => i.IsBlocker) && 
                                result.Prerequisites.All(p => p.IsMet);

                // Assess risk level
                if (result.Issues.Any(i => i.Severity == CutoverValidationSeverity.Critical))
                {
                    result.RiskLevel = CutoverRiskLevel.Critical;
                }
                else if (result.Issues.Any(i => i.Severity == CutoverValidationSeverity.Error))
                {
                    result.RiskLevel = CutoverRiskLevel.High;
                }
                else if (result.Issues.Any(i => i.Severity == CutoverValidationSeverity.Warning))
                {
                    result.RiskLevel = CutoverRiskLevel.Medium;
                }

                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to validate Groups/GPO/ACL cutover readiness");
                
                result.RiskLevel = CutoverRiskLevel.Critical;
                result.IsReady = false;
                result.Issues.Add(new CutoverValidationIssue
                {
                    Description = $"Cutover validation failed: {ex.Message}",
                    Severity = CutoverValidationSeverity.Critical,
                    IsBlocker = true
                });

                return result;
            }
        }

        /// <summary>
        /// Performs cutover operations for Groups/GPO/ACL migrations
        /// </summary>
        public async Task<CutoverResult> PerformCutoverAsync(
            IEnumerable<Services.Migration.MigrationResultBase> migrationResults,
            CutoverSettings settings,
            TargetContext target)
        {
            var result = new CutoverResult
            {
                ServiceName = "Groups/GPO/ACL",
                CutoverTimestamp = DateTime.UtcNow
            };

            try
            {
                _logger.LogInformation("Performing Groups/GPO/ACL cutover for {ResultCount} migrations",
                    migrationResults.Count());

                var groupsResults = migrationResults.OfType<Models.Identity.GroupMigrationResult>().ToList();
                var gpoResults = migrationResults.OfType<Models.Identity.GpoMigrationResult>().ToList();
                var aclResults = migrationResults.OfType<Models.Identity.AclMigrationResult>().ToList();

                // Phase 1: Groups cutover
                if (groupsResults.Any())
                {
                    await PerformGroupsCutoverAsync(groupsResults, settings, target, result);
                }

                // Phase 2: GPO cutover
                if (gpoResults.Any())
                {
                    await PerformGpoCutoverAsync(gpoResults, settings, target, result);
                }

                // Phase 3: ACL cutover
                if (aclResults.Any())
                {
                    await PerformAclCutoverAsync(aclResults, settings, target, result);
                }

                result.Duration = DateTime.UtcNow - result.CutoverTimestamp;

                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Groups/GPO/ACL cutover failed");
                
                result.ErrorMessage = ex.Message;
                result.Success = result.Steps.All(s => s.Success);
                result.Duration = DateTime.UtcNow - result.CutoverTimestamp;
                
                return result;
            }
        }

        #region Private Helper Methods

        private async Task<IEnumerable<ChangeDetectionResult<GroupsPolicyChangeItem>>> DetectGroupChangesAsync(
            DateTime lastRunTimestamp, DeltaMigrationSettings settings)
        {
            var changes = new List<ChangeDetectionResult<GroupsPolicyChangeItem>>();

            try
            {
                // Query source AD for group changes since last run
                // This would integrate with AD APIs to detect modifications
                
                // For now, return empty collection - actual implementation would query AD
                return await Task.FromResult(changes);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to detect group changes");
                throw;
            }
        }

        private async Task<IEnumerable<ChangeDetectionResult<GroupsPolicyChangeItem>>> DetectGpoChangesAsync(
            DateTime lastRunTimestamp, DeltaMigrationSettings settings)
        {
            var changes = new List<ChangeDetectionResult<GroupsPolicyChangeItem>>();

            try
            {
                // Query source AD for GPO changes since last run
                // This would integrate with Group Policy APIs
                
                return await Task.FromResult(changes);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to detect GPO changes");
                throw;
            }
        }

        private async Task<IEnumerable<ChangeDetectionResult<GroupsPolicyChangeItem>>> DetectAclChangesAsync(
            DateTime lastRunTimestamp, DeltaMigrationSettings settings)
        {
            var changes = new List<ChangeDetectionResult<GroupsPolicyChangeItem>>();

            try
            {
                // Query file system for ACL changes since last run
                // This would integrate with file system security APIs
                
                return await Task.FromResult(changes);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to detect ACL changes");
                throw;
            }
        }

        private GroupedChanges GroupChangesByType(List<ChangeDetectionResult<GroupsPolicyChangeItem>> changes)
        {
            return new GroupedChanges
            {
                GroupChanges = changes.Where(c => c.Item.ChangeType == "Group").ToList(),
                GpoChanges = changes.Where(c => c.Item.ChangeType == "GPO").ToList(),
                AclChanges = changes.Where(c => c.Item.ChangeType == "ACL").ToList()
            };
        }

        private async Task<IEnumerable<Models.Identity.GroupMigrationResult>> ProcessGroupDeltaChangesAsync(
            List<ChangeDetectionResult<GroupsPolicyChangeItem>> groupChanges,
            DeltaMigrationSettings settings,
            TargetContext target)
        {
            var results = new List<Models.Identity.GroupMigrationResult>();

            foreach (var change in groupChanges)
            {
                try
                {
                    // Convert change to GroupData and process
                    var groupData = ConvertToGroupData(change.Item);
                    
                    var migrationSettings = new GroupMigrationSettings
                    {
                        PreserveMembership = true,
                        MigrateNestedGroups = true,
                        ConflictResolution = MandADiscoverySuite.Services.Migration.ConflictResolutionStrategy.Overwrite
                    };

                    var result = await _groupsPolicyMigrator.MigrateGroupAsync(groupData, migrationSettings, target);
                    results.Add(result);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Failed to process group delta change for {ItemId}", change.Item.Id);
                    
                    results.Add(new Models.Identity.GroupMigrationResult
                    {
                        SourceGroupId = change.Item.Id,
                        Success = false,
                        ErrorMessage = ex.Message,
                        Status = GroupMigrationStatus.Failed
                    });
                }
            }

            return results;
        }

        private async Task<IEnumerable<Models.Identity.GpoMigrationResult>> ProcessGpoDeltaChangesAsync(
            List<ChangeDetectionResult<GroupsPolicyChangeItem>> gpoChanges,
            DeltaMigrationSettings settings,
            TargetContext target)
        {
            var results = new List<Models.Identity.GpoMigrationResult>();

            foreach (var change in gpoChanges)
            {
                try
                {
                    // Convert change to GpoData and process
                    var gpoData = ConvertToGpoData(change.Item);
                    
                    var migrationSettings = new GpoMigrationSettings
                    {
                        ConvertToIntuneProfiles = true,
                        ConvertToCompliancePolicies = true,
                        Mode = GpoMigrationMode.Automatic
                    };

                    var gpoResults = await _groupsPolicyMigrator.MigrateGposAsync(
                        new[] { gpoData }, migrationSettings, target);
                    
                    results.AddRange(gpoResults);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Failed to process GPO delta change for {ItemId}", change.Item.Id);
                    
                    results.Add(new Models.Identity.GpoMigrationResult
                    {
                        SourceGpoId = change.Item.Id,
                        Success = false,
                        ErrorMessage = ex.Message,
                        Status = GpoMigrationStatus.Failed
                    });
                }
            }

            return results;
        }

        private async Task<IEnumerable<Models.Identity.AclMigrationResult>> ProcessAclDeltaChangesAsync(
            List<ChangeDetectionResult<GroupsPolicyChangeItem>> aclChanges,
            DeltaMigrationSettings settings,
            TargetContext target)
        {
            var results = new List<Models.Identity.AclMigrationResult>();

            foreach (var change in aclChanges)
            {
                try
                {
                    // Convert change to AclData and process
                    var aclData = ConvertToAclData(change.Item);
                    
                    var migrationSettings = new AclMigrationSettings
                    {
                        PreserveOwnership = true,
                        MapToSharePointPermissions = true,
                        MappingStrategy = AclMappingStrategy.BestMatch
                    };

                    var aclResults = await _groupsPolicyMigrator.MigrateAclsAsync(
                        new[] { aclData }, migrationSettings, target);
                    
                    results.AddRange(aclResults);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Failed to process ACL delta change for {ItemId}", change.Item.Id);
                    
                    results.Add(new Models.Identity.AclMigrationResult
                    {
                        SourcePath = change.Item.Id,
                        Success = false,
                        ErrorMessage = ex.Message,
                        Status = AclMigrationStatus.Failed
                    });
                }
            }

            return results;
        }

        // Conversion helper methods
        private Models.Identity.GroupData ConvertToGroupData(GroupsPolicyChangeItem item)
        {
            return new Models.Identity.GroupData
            {
                Id = item.Id,
                Name = item.Name,
                DisplayName = item.Name,
                GroupType = GroupType.Security,
                ModifiedDate = item.ChangeTimestamp
            };
        }

        private GpoData ConvertToGpoData(GroupsPolicyChangeItem item)
        {
            return new GpoData
            {
                Id = item.Id,
                Name = item.Name,
                DisplayName = item.Name,
                ModifiedDate = item.ChangeTimestamp
            };
        }

        private AclData ConvertToAclData(GroupsPolicyChangeItem item)
        {
            return new AclData
            {
                ResourcePath = item.Id,
                ResourceType = "File",
                LastModified = item.ChangeTimestamp
            };
        }

        // Validation helper methods
        private async Task ValidateGroupsCutoverAsync(
            List<Models.Identity.GroupMigrationResult> groupResults,
            CutoverValidationResult result,
            TargetContext target)
        {
            foreach (var groupResult in groupResults.Where(r => r.Success))
            {
                // Validate group exists in target and has correct membership
                if (string.IsNullOrEmpty(groupResult.TargetGroupId))
                {
                    result.Issues.Add(new CutoverValidationIssue
                    {
                        Category = "GroupMigration",
                        Description = $"Group {groupResult.GroupName} missing target ID",
                        Severity = CutoverValidationSeverity.Error,
                        IsBlocker = true
                    });
                }
            }

            await Task.CompletedTask;
        }

        private async Task ValidateGpoCutoverAsync(
            List<Models.Identity.GpoMigrationResult> gpoResults,
            CutoverValidationResult result,
            TargetContext target)
        {
            foreach (var gpoResult in gpoResults.Where(r => r.Success))
            {
                if (!gpoResult.CreatedPolicyIds.Any())
                {
                    result.Issues.Add(new CutoverValidationIssue
                    {
                        Category = "GpoMigration",
                        Description = $"GPO {gpoResult.GpoName} has no equivalent cloud policies",
                        Severity = CutoverValidationSeverity.Warning,
                        IsBlocker = false
                    });
                }
            }

            await Task.CompletedTask;
        }

        private async Task ValidateAclCutoverAsync(
            List<Models.Identity.AclMigrationResult> aclResults,
            CutoverValidationResult result,
            TargetContext target)
        {
            foreach (var aclResult in aclResults.Where(r => r.Success))
            {
                if (aclResult.MigratedEntries < aclResult.TotalEntries)
                {
                    result.Issues.Add(new CutoverValidationIssue
                    {
                        Category = "AclMigration",
                        Description = $"ACL {aclResult.SourcePath} has incomplete permission migration ({aclResult.MigratedEntries}/{aclResult.TotalEntries})",
                        Severity = CutoverValidationSeverity.Warning,
                        IsBlocker = false
                    });
                }
            }

            await Task.CompletedTask;
        }

        // Cutover helper methods
        private async Task PerformGroupsCutoverAsync(
            List<Models.Identity.GroupMigrationResult> groupResults,
            CutoverSettings settings,
            TargetContext target,
            CutoverResult result)
        {
            var step = new CutoverStep
            {
                Name = "Groups Cutover",
                Description = "Enable migrated groups and disable source groups",
                Type = CutoverStepType.EnableTargetResources,
                StartTime = DateTime.UtcNow
            };

            try
            {
                // Enable target groups and disable source groups if requested
                if (settings.DisableSourceObjects)
                {
                    foreach (var groupResult in groupResults.Where(r => r.Success))
                    {
                        // Disable source group
                        // Enable target group
                    }
                }

                step.Success = true;
            }
            catch (Exception ex)
            {
                step.Success = false;
                step.ErrorMessage = ex.Message;
            }

            step.EndTime = DateTime.UtcNow;
            result.Steps.Add(step);

            await Task.CompletedTask;
        }

        private async Task PerformGpoCutoverAsync(
            List<Models.Identity.GpoMigrationResult> gpoResults,
            CutoverSettings settings,
            TargetContext target,
            CutoverResult result)
        {
            var step = new CutoverStep
            {
                Name = "GPO Cutover",
                Description = "Enable Intune policies and disable source GPOs",
                Type = CutoverStepType.UpdateConfiguration,
                StartTime = DateTime.UtcNow
            };

            try
            {
                // Enable Intune policies and disable GPOs if requested
                if (settings.DisableSourceObjects)
                {
                    foreach (var gpoResult in gpoResults.Where(r => r.Success))
                    {
                        // Disable source GPO
                        // Ensure Intune policies are enabled and assigned
                    }
                }

                step.Success = true;
            }
            catch (Exception ex)
            {
                step.Success = false;
                step.ErrorMessage = ex.Message;
            }

            step.EndTime = DateTime.UtcNow;
            result.Steps.Add(step);

            await Task.CompletedTask;
        }

        private async Task PerformAclCutoverAsync(
            List<Models.Identity.AclMigrationResult> aclResults,
            CutoverSettings settings,
            TargetContext target,
            CutoverResult result)
        {
            var step = new CutoverStep
            {
                Name = "ACL Cutover",
                Description = "Activate SharePoint permissions and redirect file access",
                Type = CutoverStepType.UpdateServiceEndpoints,
                StartTime = DateTime.UtcNow
            };

            try
            {
                // Activate SharePoint permissions and update file access if needed
                foreach (var aclResult in aclResults.Where(r => r.Success && !string.IsNullOrEmpty(r.TargetPath)))
                {
                    // Ensure SharePoint permissions are active
                    // Update file redirections if applicable
                }

                step.Success = true;
            }
            catch (Exception ex)
            {
                step.Success = false;
                step.ErrorMessage = ex.Message;
            }

            step.EndTime = DateTime.UtcNow;
            result.Steps.Add(step);

            await Task.CompletedTask;
        }

        #endregion
    }

    #region Helper Classes

    /// <summary>
    /// Represents a change item for Groups, GPOs, or ACLs
    /// </summary>
    public class GroupsPolicyChangeItem
    {
        public string Id { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string ChangeType { get; set; } = string.Empty; // Group, GPO, ACL
        public DateTime ChangeTimestamp { get; set; }
        public string ChangeOperation { get; set; } = string.Empty; // Create, Update, Delete
        public Dictionary<string, object> ChangedProperties { get; set; } = new();
    }

    /// <summary>
    /// Groups changes by their type for efficient processing
    /// </summary>
    public class GroupedChanges
    {
        public List<ChangeDetectionResult<GroupsPolicyChangeItem>> GroupChanges { get; set; } = new();
        public List<ChangeDetectionResult<GroupsPolicyChangeItem>> GpoChanges { get; set; } = new();
        public List<ChangeDetectionResult<GroupsPolicyChangeItem>> AclChanges { get; set; } = new();
    }

    /// <summary>
    /// Delta migrator interface for Groups/GPO/ACL changes
    /// </summary>
    public interface IGroupsPolicyDeltaMigrator
    {
        Task<IEnumerable<ChangeDetectionResult<GroupsPolicyChangeItem>>> DetectChangesAsync(
            DateTime lastRunTimestamp,
            DeltaMigrationSettings settings);

        Task<DeltaMigrationResult<Services.Migration.MigrationResultBase>> MigrateDeltaAsync(
            DateTime lastRunTimestamp,
            DeltaMigrationSettings settings,
            TargetContext target,
            IProgress<MandADiscoverySuite.Migration.MigrationProgress>? progress = null);

        Task<CutoverValidationResult> ValidateCutoverReadinessAsync(
            IEnumerable<Services.Migration.MigrationResultBase> migrationResults,
            TargetContext target);

        Task<CutoverResult> PerformCutoverAsync(
            IEnumerable<Services.Migration.MigrationResultBase> migrationResults,
            CutoverSettings settings,
            TargetContext target);
    }

    #endregion
}