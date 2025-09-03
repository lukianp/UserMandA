using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using System.DirectoryServices.AccountManagement;
using System.Security.Principal;
using Microsoft.Extensions.Logging;
using MandADiscoverySuite.Services.Migration;
using MandADiscoverySuite.Models.Migration;
using MandADiscoverySuite.Models;
using MandADiscoverySuite.Migration;
using MigrationCore = MandADiscoverySuite.Migration;

namespace MandADiscoverySuite.MigrationProviders
{
    /// <summary>
    /// Active Directory group management client interface for dependency injection
    /// </summary>
    public interface IActiveDirectoryGroupClient
    {
        Task<GroupPrincipal> CreateGroupAsync(GroupItem group, string targetDomain);
        Task<GroupPrincipal> GetGroupBySidAsync(string sid, string domain);
        Task<GroupPrincipal> GetGroupByNameAsync(string name, string domain);
        Task AddGroupMemberAsync(string groupSid, string memberSid, string domain);
        Task<List<string>> GetGroupMembersAsync(string groupSid, string domain);
        Task<bool> GroupExistsAsync(string name, string domain);
        Task DeleteGroupAsync(string groupSid, string domain);
        Task<Dictionary<string, object>> GetGroupAttributesAsync(string groupSid, string domain);
        Task SetGroupAttributesAsync(string groupSid, Dictionary<string, object> attributes, string domain);
    }

    /// <summary>
    /// SID mapping service for cross-domain identity resolution
    /// </summary>
    public interface ISidMappingService
    {
        Task<string> MapSidAsync(string sourceSid, string targetDomain);
        Task<bool> CreateSidHistoryAsync(string sourceSid, string targetSid);
        Task<Dictionary<string, string>> GetSidMappingsAsync(List<string> sourceSids, string targetDomain);
        Task<bool> ValidateSidMappingAsync(string sourceSid, string targetSid);
    }

    /// <summary>
    /// Implements group migration for security and distribution groups with nested membership support
    /// </summary>
    public class GroupMigrator : IGroupMigrator
    {
        private readonly IActiveDirectoryGroupClient _adClient;
        private readonly ISidMappingService _sidMappingService;
        private readonly ILogger<GroupMigrator> _logger;

        public GroupMigrator(
            IActiveDirectoryGroupClient adClient, 
            ISidMappingService sidMappingService,
            ILogger<GroupMigrator> logger)
        {
            _adClient = adClient ?? throw new ArgumentNullException(nameof(adClient));
            _sidMappingService = sidMappingService ?? throw new ArgumentNullException(nameof(sidMappingService));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        public async Task<MigrationResult<GroupMigrationResult>> MigrateAsync(
            GroupItem item, 
            MigrationContext context, 
            CancellationToken cancellationToken = default)
        {
            var result = new MigrationResult<GroupMigrationResult>
            {
                SourceId = item.Sid,
                StartTime = DateTime.UtcNow,
                SessionId = context.SessionId,
                ExecutedBy = context.UserPrincipalName
            };

            var migrationResult = new GroupMigrationResult
            {
                SourceGroupSid = item.Sid,
                TargetGroupName = item.Name,
                StartTime = DateTime.UtcNow,
                SessionId = context.SessionId,
                ExecutedBy = context.UserPrincipalName
            };

            try
            {
                _logger.LogInformation("Starting migration of group {GroupName} ({GroupSid})", item.Name, item.Sid);

                // Check for existing group conflict
                var conflictExists = await _adClient.GroupExistsAsync(item.Name, context.TargetDomain);
                if (conflictExists)
                {
                    var conflictResolution = await ResolveGroupConflictsAsync(
                        new List<GroupItem> { item }, context, cancellationToken);
                    
                    if (!conflictResolution.IsSuccess)
                    {
                        result.IsSuccess = false;
                        result.Errors.AddRange(conflictResolution.Errors);
                        migrationResult.Errors.AddRange(conflictResolution.Errors);
                        migrationResult.EndTime = DateTime.UtcNow;
                        result.Result = migrationResult;
                        return result;
                    }

                    // Update group name if renamed
                    if (conflictResolution.RenamedGroups.ContainsKey(item.Name))
                    {
                        migrationResult.TargetGroupName = conflictResolution.RenamedGroups[item.Name];
                        _logger.LogInformation("Group {OriginalName} renamed to {NewName} due to conflict", 
                            item.Name, migrationResult.TargetGroupName);
                    }
                }

                // Create the group in target domain
                var targetGroup = await _adClient.CreateGroupAsync(item, context.TargetDomain);
                if (targetGroup != null)
                {
                    migrationResult.GroupCreated = true;
                    migrationResult.TargetGroupSid = targetGroup.Sid.Value;
                    migrationResult.TargetDistinguishedName = targetGroup.DistinguishedName;
                    result.TargetId = migrationResult.TargetGroupSid;
                    
                    _logger.LogInformation("Successfully created group {GroupName} with SID {TargetSid}", 
                        migrationResult.TargetGroupName, migrationResult.TargetGroupSid);
                }
                else
                {
                    throw new InvalidOperationException($"Failed to create group {item.Name} in target domain");
                }

                // Create SID history for seamless access
                var sidHistoryCreated = await _sidMappingService.CreateSidHistoryAsync(
                    item.Sid, migrationResult.TargetGroupSid);
                
                if (sidHistoryCreated)
                {
                    _logger.LogInformation("SID history created for group {GroupName}", item.Name);
                }

                // Migrate group memberships
                if (item.MemberSids.Any())
                {
                    var membershipResult = await MigrateGroupMembershipsAsync(
                        migrationResult.TargetGroupSid, 
                        item.MemberSids, 
                        new Dictionary<string, string>(), // SID mapping will be resolved dynamically
                        context, 
                        cancellationToken);

                    migrationResult.MembershipsReplicatedFromSource = membershipResult.IsSuccess;
                    migrationResult.MigratedMembers = membershipResult.MigratedMemberSids;
                    migrationResult.UnmappedMembers = membershipResult.UnmappedMemberSids;
                    migrationResult.MemberSidMappings = membershipResult.MemberSidMappings;
                    migrationResult.NestedGroupsProcessed = membershipResult.NestedGroupsIncluded;

                    if (!membershipResult.IsSuccess)
                    {
                        migrationResult.Warnings.AddRange(membershipResult.Warnings);
                        _logger.LogWarning("Group membership migration completed with warnings for {GroupName}", item.Name);
                    }
                }

                // Migrate custom attributes
                if (item.CustomAttributes.Any())
                {
                    await _adClient.SetGroupAttributesAsync(migrationResult.TargetGroupSid, item.CustomAttributes, context.TargetDomain);
                    migrationResult.GroupAttributes = item.CustomAttributes;
                    _logger.LogInformation("Migrated {AttributeCount} custom attributes for group {GroupName}", 
                        item.CustomAttributes.Count, item.Name);
                }

                migrationResult.IsSuccess = true;
                migrationResult.EndTime = DateTime.UtcNow;
                result.IsSuccess = true;
                result.EndTime = DateTime.UtcNow;
                result.Result = migrationResult;

                _logger.LogInformation("Successfully completed migration of group {GroupName} in {Duration}", 
                    item.Name, result.Duration);

                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to migrate group {GroupName} ({GroupSid})", item.Name, item.Sid);
                
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
            SecurityGroupItem item,
            MigrationContext context,
            CancellationToken cancellationToken = default)
        {
            var validationResult = new MandADiscoverySuite.Migration.ValidationResult
            {
                ValidatedObject = item,
                ObjectType = "SecurityGroup",
                ObjectName = item.Name,
                Severity = ValidationSeverity.Success,
                Message = "Group validation completed"
            };

            try
            {
                _logger.LogInformation("Validating group {GroupName} for migration", item.Name);

                // Check if group name is valid in target domain
                if (string.IsNullOrWhiteSpace(item.Name))
                {
                    validationResult.Issues.Add(new Migration.ValidationIssue
                    {
                        Severity = ValidationSeverity.Error,
                        Message = "Group name cannot be empty",
                        ItemId = item.Sid,
                        Category = "GroupName"
                    });
                }

                // Check for reserved names
                var reservedNames = new[] { "Domain Admins", "Enterprise Admins", "Schema Admins", "Administrators" };
                if (reservedNames.Contains(item.Name, StringComparer.OrdinalIgnoreCase))
                {
                    validationResult.Issues.Add(new Migration.ValidationIssue
                    {
                        Severity = ValidationSeverity.Warning,
                        Message = $"Group name '{item.Name}' conflicts with built-in group",
                        ItemId = item.Sid,
                        Category = "GroupConflict"
                    });
                }

                // Validate SID format
                try
                {
                    var sid = new SecurityIdentifier(item.Sid);
                }
                catch (ArgumentException)
                {
                    validationResult.Issues.Add(new Migration.ValidationIssue
                    {
                        Severity = ValidationSeverity.Error,
                        Message = $"Invalid SID format: {item.Sid}",
                        ItemId = item.Sid,
                        Category = "SIDFormat"
                    });
                }

                // Check group scope compatibility
                var validScopes = new[] { "Universal", "Global", "DomainLocal" };
                if (!validScopes.Contains(item.GroupScope, StringComparer.OrdinalIgnoreCase))
                {
                    validationResult.Issues.Add(new Migration.ValidationIssue
                    {
                        Severity = ValidationSeverity.Warning,
                        Message = $"Unknown group scope: {item.GroupScope}",
                        ItemId = item.Sid,
                        Category = "GroupScope"
                    });
                }

                validationResult.Severity = validationResult.Issues.Any(i => i.Severity == ValidationSeverity.Error) 
                    ? ValidationSeverity.Error 
                    : validationResult.Issues.Any(i => i.Severity == ValidationSeverity.Warning) 
                        ? ValidationSeverity.Warning 
                        : ValidationSeverity.Success;

                _logger.LogInformation("Group validation completed for {GroupName} with {IssueCount} issues", 
                    item.Name, validationResult.Issues.Count);

                return validationResult;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error validating group {GroupName}", item.Name);
                
                validationResult.Severity = ValidationSeverity.Critical;
                validationResult.Message = ex.Message;
                validationResult.Issues.Add(new Migration.ValidationIssue
                {
                    Severity = ValidationSeverity.Critical,
                    Message = ex.Message,
                    ItemId = item.Sid,
                    Category = "Exception"
                });

                return validationResult;
            }
        }

        public async Task<Services.Migration.RollbackResult> RollbackAsync(
            GroupMigrationResult result, 
            MigrationContext context, 
            CancellationToken cancellationToken = default)
        {
            var rollbackResult = new Services.Migration.RollbackResult
            {
                RollbackAction = "DeleteGroup",
                StartTime = DateTime.UtcNow,
                SessionId = context.SessionId,
                ExecutedBy = context.UserPrincipalName
            };

            try
            {
                _logger.LogInformation("Starting rollback for group {TargetGroupSid}", result.TargetGroupSid);

                if (!string.IsNullOrEmpty(result.TargetGroupSid))
                {
                    await _adClient.DeleteGroupAsync(result.TargetGroupSid, context.TargetDomain);
                    rollbackResult.DataRestored = true;
                    rollbackResult.RestoredItems.Add($"Deleted group {result.TargetGroupName}");
                    
                    _logger.LogInformation("Successfully rolled back group {TargetGroupName}", result.TargetGroupName);
                }

                rollbackResult.IsSuccess = true;
                rollbackResult.EndTime = DateTime.UtcNow;
                return rollbackResult;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to rollback group {TargetGroupSid}", result.TargetGroupSid);
                
                rollbackResult.IsSuccess = false;
                rollbackResult.ErrorMessage = ex.Message;
                rollbackResult.Errors.Add(ex.Message);
                rollbackResult.EndTime = DateTime.UtcNow;
                rollbackResult.UnrestoredItems.Add($"Failed to delete group {result.TargetGroupName}: {ex.Message}");

                return rollbackResult;
            }
        }

        public async Task<bool> SupportsAsync(
            MigrationType type, 
            MigrationContext context, 
            CancellationToken cancellationToken = default)
        {
            return type == MigrationType.SecurityGroup;
        }

        public async Task<TimeSpan> EstimateDurationAsync(
            GroupItem item, 
            MigrationContext context, 
            CancellationToken cancellationToken = default)
        {
            // Base time for group creation
            var baseTime = TimeSpan.FromSeconds(5);
            
            // Additional time per member
            var memberTime = TimeSpan.FromMilliseconds(item.MemberSids.Count * 100);
            
            // Additional time for custom attributes
            var attributeTime = TimeSpan.FromMilliseconds(item.CustomAttributes.Count * 50);
            
            return baseTime.Add(memberTime).Add(attributeTime);
        }

        public async Task<GroupHierarchyResult> CreateGroupHierarchyAsync(
            List<GroupItem> groupHierarchy, 
            MigrationContext context, 
            CancellationToken cancellationToken = default)
        {
            var result = new GroupHierarchyResult
            {
                StartTime = DateTime.UtcNow,
                SessionId = context.SessionId,
                ExecutedBy = context.UserPrincipalName,
                TotalGroupsProcessed = groupHierarchy.Count
            };

            try
            {
                _logger.LogInformation("Creating group hierarchy with {GroupCount} groups", groupHierarchy.Count);

                // Validate dependencies first
                var dependencyValidation = await ValidateGroupDependenciesAsync(groupHierarchy, context, cancellationToken);
                if (!dependencyValidation.IsSuccess)
                {
                    result.Errors.AddRange(dependencyValidation.Errors);
                    result.CircularDependencies = dependencyValidation.CircularDependencies;
                    result.IsSuccess = false;
                    result.EndTime = DateTime.UtcNow;
                    return result;
                }

                // Sort groups by dependency order (parent groups first)
                var sortedGroups = TopologicalSort(groupHierarchy);
                var sidMappings = new Dictionary<string, string>();

                foreach (var group in sortedGroups)
                {
                    try
                    {
                        var migrationResult = await MigrateAsync(group, context, cancellationToken);
                        
                        if (migrationResult.IsSuccess && migrationResult.Result != null)
                        {
                            result.SuccessfullyMigrated++;
                            result.MigratedGroupSids.Add(migrationResult.Result.TargetGroupSid);
                            sidMappings[group.Sid] = migrationResult.Result.TargetGroupSid;
                            
                            // Track hierarchy relationships
                            if (group.MemberOfSids.Any())
                            {
                                result.HierarchyMap[migrationResult.Result.TargetGroupSid] = 
                                    group.MemberOfSids.Where(sid => sidMappings.ContainsKey(sid))
                                                     .Select(sid => sidMappings[sid])
                                                     .ToList();
                            }
                        }
                        else
                        {
                            result.SkippedGroupSids.Add(group.Sid);
                            result.Warnings.Add($"Failed to migrate group {group.Name}: {migrationResult.ErrorMessage}");
                        }
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, "Error migrating group {GroupName} in hierarchy", group.Name);
                        result.SkippedGroupSids.Add(group.Sid);
                        result.Errors.Add($"Exception migrating group {group.Name}: {ex.Message}");
                    }
                }

                result.GroupSidMappings = sidMappings;
                result.IsSuccess = result.SuccessfullyMigrated > 0;
                result.EndTime = DateTime.UtcNow;

                _logger.LogInformation("Group hierarchy creation completed. Success: {Success}, Skipped: {Skipped}", 
                    result.SuccessfullyMigrated, result.SkippedGroupSids.Count);

                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to create group hierarchy");
                
                result.IsSuccess = false;
                result.ErrorMessage = ex.Message;
                result.Errors.Add(ex.Message);
                result.EndTime = DateTime.UtcNow;

                return result;
            }
        }

        public async Task<GroupMembershipMigrationResult> MigrateGroupMembershipsAsync(
            string groupSid, 
            List<string> memberSids, 
            Dictionary<string, string> sidMapping, 
            MigrationContext context, 
            CancellationToken cancellationToken = default)
        {
            var result = new GroupMembershipMigrationResult
            {
                GroupSid = groupSid,
                SourceMemberSids = new List<string>(memberSids),
                StartTime = DateTime.UtcNow,
                SessionId = context.SessionId,
                ExecutedBy = context.UserPrincipalName
            };

            try
            {
                _logger.LogInformation("Migrating {MemberCount} members for group {GroupSid}", memberSids.Count, groupSid);

                // Get or create SID mappings for all members
                var resolvedMappings = sidMapping.Any() ? sidMapping : 
                    await _sidMappingService.GetSidMappingsAsync(memberSids, context.TargetDomain);

                foreach (var memberSid in memberSids)
                {
                    try
                    {
                        if (resolvedMappings.ContainsKey(memberSid))
                        {
                            var targetMemberSid = resolvedMappings[memberSid];
                            await _adClient.AddGroupMemberAsync(groupSid, targetMemberSid, context.TargetDomain);
                            
                            result.MigratedMemberSids.Add(targetMemberSid);
                            result.MemberSidMappings[memberSid] = targetMemberSid;
                            
                            _logger.LogDebug("Added member {MemberSid} to group {GroupSid}", targetMemberSid, groupSid);
                        }
                        else
                        {
                            result.UnmappedMemberSids.Add(memberSid);
                            result.Warnings.Add($"No SID mapping found for member {memberSid}");
                        }
                    }
                    catch (Exception ex)
                    {
                        _logger.LogWarning(ex, "Failed to add member {MemberSid} to group {GroupSid}", memberSid, groupSid);
                        result.UnmappedMemberSids.Add(memberSid);
                        result.Warnings.Add($"Failed to add member {memberSid}: {ex.Message}");
                    }
                }

                result.NestedGroupsIncluded = memberSids.Any(sid => IsGroupSid(sid));
                result.IsSuccess = result.MigratedMemberSids.Count > 0;
                result.EndTime = DateTime.UtcNow;

                _logger.LogInformation("Group membership migration completed. Migrated: {Migrated}, Unmapped: {Unmapped}", 
                    result.MigratedMemberSids.Count, result.UnmappedMemberSids.Count);

                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to migrate group memberships for {GroupSid}", groupSid);
                
                result.IsSuccess = false;
                result.ErrorMessage = ex.Message;
                result.Errors.Add(ex.Message);
                result.EndTime = DateTime.UtcNow;

                return result;
            }
        }

        public async Task<GroupConflictResolutionResult> ResolveGroupConflictsAsync(
            List<GroupItem> conflictingGroups, 
            MigrationContext context, 
            CancellationToken cancellationToken = default)
        {
            var result = new GroupConflictResolutionResult
            {
                ConflictsIdentified = conflictingGroups.Count,
                StartTime = DateTime.UtcNow,
                SessionId = context.SessionId,
                ExecutedBy = context.UserPrincipalName
            };

            try
            {
                _logger.LogInformation("Resolving conflicts for {ConflictCount} groups", conflictingGroups.Count);

                foreach (var group in conflictingGroups)
                {
                    var conflictExists = await _adClient.GroupExistsAsync(group.Name, context.TargetDomain);
                    
                    if (conflictExists)
                    {
                        // Generate unique name by appending migration suffix
                        var newName = $"{group.Name}_Migrated_{DateTime.UtcNow:yyyyMMdd}";
                        var counter = 1;
                        
                        while (await _adClient.GroupExistsAsync(newName, context.TargetDomain))
                        {
                            newName = $"{group.Name}_Migrated_{DateTime.UtcNow:yyyyMMdd}_{counter}";
                            counter++;
                        }
                        
                        result.RenamedGroups[group.Name] = newName;
                        result.ResolutionActions[group.Sid] = $"Renamed to {newName}";
                        result.ResolvedGroups.Add(group.Sid);
                        result.ConflictsResolved++;
                        
                        _logger.LogInformation("Resolved conflict for group {OriginalName} by renaming to {NewName}", 
                            group.Name, newName);
                    }
                    else
                    {
                        result.UnresolvedConflicts.Add(group.Sid);
                        result.Warnings.Add($"Group {group.Name} reported as conflicting but not found in target");
                    }
                }

                result.IsSuccess = result.ConflictsResolved > 0 || result.UnresolvedConflicts.Count == 0;
                result.EndTime = DateTime.UtcNow;

                _logger.LogInformation("Conflict resolution completed. Resolved: {Resolved}, Unresolved: {Unresolved}", 
                    result.ConflictsResolved, result.UnresolvedConflicts.Count);

                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to resolve group conflicts");
                
                result.IsSuccess = false;
                result.ErrorMessage = ex.Message;
                result.Errors.Add(ex.Message);
                result.EndTime = DateTime.UtcNow;

                return result;
            }
        }

        public async Task<GroupDependencyValidationResult> ValidateGroupDependenciesAsync(
            List<GroupItem> groups, 
            MigrationContext context, 
            CancellationToken cancellationToken = default)
        {
            var result = new GroupDependencyValidationResult
            {
                TotalGroupsAnalyzed = groups.Count,
                StartTime = DateTime.UtcNow,
                SessionId = context.SessionId,
                ExecutedBy = context.UserPrincipalName
            };

            try
            {
                _logger.LogInformation("Validating dependencies for {GroupCount} groups", groups.Count);

                var groupSids = new HashSet<string>(groups.Select(g => g.Sid));
                var dependencyGraph = new Dictionary<string, List<string>>();
                
                // Build dependency graph
                foreach (var group in groups)
                {
                    dependencyGraph[group.Sid] = group.MemberOfSids.Where(sid => groupSids.Contains(sid)).ToList();
                }

                result.DependencyMap = dependencyGraph;

                // Detect circular dependencies
                var circularDependencies = DetectCircularDependencies(dependencyGraph);
                result.CircularDependencies = circularDependencies;

                // Identify orphaned groups (groups with dependencies outside the migration set)
                foreach (var group in groups)
                {
                    var externalDependencies = group.MemberOfSids.Where(sid => !groupSids.Contains(sid)).ToList();
                    if (externalDependencies.Any())
                    {
                        result.OrphanedGroups.Add(group.Sid);
                        result.Warnings.Add($"Group {group.Name} has external dependencies: {string.Join(", ", externalDependencies)}");
                    }
                }

                result.ValidatedGroups = groups.Select(g => g.Sid).ToList();
                result.MigrationSafetyConfirmed = !circularDependencies.Any();
                result.IsSuccess = true;
                result.EndTime = DateTime.UtcNow;

                if (circularDependencies.Any())
                {
                    result.Errors.Add($"Circular dependencies detected: {string.Join(", ", circularDependencies)}");
                    result.IsSuccess = false;
                }

                _logger.LogInformation("Dependency validation completed. Circular: {Circular}, Orphaned: {Orphaned}", 
                    circularDependencies.Count, result.OrphanedGroups.Count);

                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to validate group dependencies");
                
                result.IsSuccess = false;
                result.ErrorMessage = ex.Message;
                result.Errors.Add(ex.Message);
                result.EndTime = DateTime.UtcNow;

                return result;
            }
        }

        public async Task<ServiceAccountMigrationResult> MigrateServiceAccountsAsync(
            List<string> serviceAccountSids, 
            MigrationContext context, 
            CancellationToken cancellationToken = default)
        {
            var result = new ServiceAccountMigrationResult
            {
                StartTime = DateTime.UtcNow,
                SessionId = context.SessionId,
                ExecutedBy = context.UserPrincipalName
            };

            try
            {
                _logger.LogInformation("Migrating {ServiceAccountCount} service accounts", serviceAccountSids.Count);

                foreach (var serviceAccountSid in serviceAccountSids)
                {
                    try
                    {
                        // Get service account details from source
                        var sourceAttributes = await _adClient.GetGroupAttributesAsync(serviceAccountSid, context.SourceDomain);
                        
                        // Map SID to target domain
                        var targetSid = await _sidMappingService.MapSidAsync(serviceAccountSid, context.TargetDomain);
                        
                        if (!string.IsNullOrEmpty(targetSid))
                        {
                            result.MigratedServiceAccounts.Add(serviceAccountSid);
                            result.ServiceAccountMappings[serviceAccountSid] = targetSid;
                            
                            // Extract service principal names if available
                            if (sourceAttributes.ContainsKey("servicePrincipalName"))
                            {
                                var spns = sourceAttributes["servicePrincipalName"] as List<string> ?? new List<string>();
                                result.ServicePrincipalNames[serviceAccountSid] = spns;
                            }
                        }
                        else
                        {
                            result.SkippedServiceAccounts.Add(serviceAccountSid);
                            result.Warnings.Add($"Could not map service account {serviceAccountSid}");
                        }
                    }
                    catch (Exception ex)
                    {
                        _logger.LogWarning(ex, "Failed to migrate service account {ServiceAccountSid}", serviceAccountSid);
                        result.SkippedServiceAccounts.Add(serviceAccountSid);
                        result.Warnings.Add($"Failed to migrate service account {serviceAccountSid}: {ex.Message}");
                    }
                }

                result.ManagedServiceAccountsProcessed = serviceAccountSids.Count > 0;
                result.IsSuccess = result.MigratedServiceAccounts.Count > 0;
                result.EndTime = DateTime.UtcNow;

                _logger.LogInformation("Service account migration completed. Migrated: {Migrated}, Skipped: {Skipped}", 
                    result.MigratedServiceAccounts.Count, result.SkippedServiceAccounts.Count);

                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to migrate service accounts");
                
                result.IsSuccess = false;
                result.ErrorMessage = ex.Message;
                result.Errors.Add(ex.Message);
                result.EndTime = DateTime.UtcNow;

                return result;
            }
        }

        #region Private Helper Methods

        private List<GroupItem> TopologicalSort(List<GroupItem> groups)
        {
            var sorted = new List<GroupItem>();
            var visited = new HashSet<string>();
            var visiting = new HashSet<string>();
            var groupDict = groups.ToDictionary(g => g.Sid);

            void Visit(GroupItem group)
            {
                if (visiting.Contains(group.Sid))
                    throw new InvalidOperationException($"Circular dependency detected involving group {group.Name}");

                if (visited.Contains(group.Sid))
                    return;

                visiting.Add(group.Sid);

                foreach (var memberOfSid in group.MemberOfSids.Where(sid => groupDict.ContainsKey(sid)))
                {
                    Visit(groupDict[memberOfSid]);
                }

                visiting.Remove(group.Sid);
                visited.Add(group.Sid);
                sorted.Add(group);
            }

            foreach (var group in groups.Where(g => !visited.Contains(g.Sid)))
            {
                Visit(group);
            }

            return sorted;
        }

        private List<string> DetectCircularDependencies(Dictionary<string, List<string>> dependencyGraph)
        {
            var circularDeps = new List<string>();
            var visited = new HashSet<string>();
            var visiting = new HashSet<string>();

            void DFS(string node, List<string> path)
            {
                if (visiting.Contains(node))
                {
                    var cycleStart = path.IndexOf(node);
                    var cycle = path.Skip(cycleStart).Concat(new[] { node });
                    circularDeps.Add(string.Join(" -> ", cycle));
                    return;
                }

                if (visited.Contains(node))
                    return;

                visiting.Add(node);
                path.Add(node);

                if (dependencyGraph.ContainsKey(node))
                {
                    foreach (var dependency in dependencyGraph[node])
                    {
                        DFS(dependency, new List<string>(path));
                    }
                }

                visiting.Remove(node);
                visited.Add(node);
                path.Remove(node);
            }

            foreach (var node in dependencyGraph.Keys.Where(k => !visited.Contains(k)))
            {
                DFS(node, new List<string>());
            }

            return circularDeps.Distinct().ToList();
        }

        private bool IsGroupSid(string sid)
        {
            try
            {
                var securityIdentifier = new SecurityIdentifier(sid);
                // Groups typically have specific RID ranges, but this is a simplified check
                // In practice, you'd query AD to determine if the SID represents a group
                return true; // Placeholder - implement actual group detection logic
            }
            catch
            {
                return false;
            }
        }

        #endregion

        #region IGroupMigrator Interface Implementation

        public async Task<GroupMigrationResult> MigrateGroupAsync(SecurityGroupItem group, MigrationContext context, CancellationToken cancellationToken = default)
        {
            return await MigrateAsync(group, context, cancellationToken);
        }

        public async Task<GroupHierarchyResult> ReplicateGroupHierarchyAsync(List<SecurityGroupItem> groups, MigrationContext context, CancellationToken cancellationToken = default)
        {
            var result = await CreateGroupHierarchyAsync(groups.Cast<GroupItem>().ToList(), context, cancellationToken);
            return new GroupHierarchyResult
            {
                IsSuccess = result.IsSuccess,
                ErrorMessage = result.ErrorMessage,
                Errors = result.Errors,
                Warnings = result.Warnings,
                StartTime = result.StartTime,
                EndTime = result.EndTime
            };
        }

        public async Task<MembershipResult> AddGroupMembersAsync(string targetGroupId, List<string> memberSids, MigrationContext context, CancellationToken cancellationToken = default)
        {
            var result = await MigrateGroupMembershipsAsync(targetGroupId, memberSids, new Dictionary<string, string>(), context, cancellationToken);
            return new MembershipResult
            {
                IsSuccess = result.IsSuccess,
                ErrorMessage = result.ErrorMessage,
                Errors = result.Errors,
                Warnings = result.Warnings,
                StartTime = result.StartTime,
                EndTime = result.EndTime
            };
        }

        public async Task<GroupPolicyConflictResolutionResult> ResolveGroupConflictsAsync(List<Services.Migration.GroupConflict> conflicts, Services.Migration.ConflictResolutionStrategy strategy, MigrationContext context, CancellationToken cancellationToken = default)
        {
            // Convert GroupConflict to GroupItem for internal method
            var groups = conflicts.Select(c => new GroupItem 
            { 
                Name = c.GroupName, 
                Sid = c.SourceSid 
            }).ToList();
            
            var result = await ResolveGroupConflictsAsync(groups, context, cancellationToken);
            return new GroupPolicyConflictResolutionResult
            {
                IsSuccess = result.IsSuccess,
                ErrorMessage = result.ErrorMessage,
                Errors = result.Errors,
                Warnings = result.Warnings,
                StartTime = result.StartTime,
                EndTime = result.EndTime
            };
        }

        public async Task<GroupDependencyResult> ValidateGroupDependenciesAsync(List<SecurityGroupItem> groups, MigrationContext context, CancellationToken cancellationToken = default)
        {
            var result = await ValidateGroupDependenciesAsync(groups.Cast<GroupItem>().ToList(), context, cancellationToken);
            return new GroupDependencyResult
            {
                IsSuccess = result.IsSuccess,
                ErrorMessage = result.ErrorMessage,
                Errors = result.Errors,
                Warnings = result.Warnings,
                StartTime = result.StartTime,
                EndTime = result.EndTime
            };
        }

        public async Task<GroupOwnershipResult> MigrateGroupOwnershipAsync(string groupId, List<string> owners, List<string> managers, MigrationContext context, CancellationToken cancellationToken = default)
        {
            return new GroupOwnershipResult
            {
                IsSuccess = true,
                StartTime = DateTime.UtcNow,
                EndTime = DateTime.UtcNow,
                Warnings = new List<string> { "Group ownership migration not yet implemented" }
            };
        }

        public async Task<BulkGroupMigrationResult> BulkMigrateGroupsAsync(List<SecurityGroupItem> groups, MigrationContext context, CancellationToken cancellationToken = default)
        {
            var result = await CreateGroupHierarchyAsync(groups.Cast<GroupItem>().ToList(), context, cancellationToken);
            return new BulkGroupMigrationResult
            {
                IsSuccess = result.IsSuccess,
                ErrorMessage = result.ErrorMessage,
                Errors = result.Errors,
                Warnings = result.Warnings,
                StartTime = result.StartTime,
                EndTime = result.EndTime
            };
        }


        public async Task<TimeSpan> EstimateDurationAsync(SecurityGroupItem item, MigrationContext context, CancellationToken cancellationToken = default)
        {
            return TimeSpan.FromMinutes(5); // Default estimate
        }

        public async Task<MigrationResult<GroupMigrationResult>> MigrateAsync(SecurityGroupItem item, MigrationContext context, CancellationToken cancellationToken = default)
        {
            return await MigrateGroupAsync(item, context, cancellationToken);
        }

        #endregion
    }
}