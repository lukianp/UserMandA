using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using MandADiscoverySuite.Models;
using MandADiscoverySuite.Models.Migration;
using MandADiscoverySuite.Migration;
using MandADiscoverySuite.Services;

namespace MandADiscoverySuite.Services.Migration
{
    /// <summary>
    /// PowerShell-based identity migrator for Active Directory to Azure AD migrations
    /// </summary>
    public class IdentityMigrator : IIdentityMigrator
    {
        private readonly ILogger<IdentityMigrator> _logger;
        private readonly PowerShellExecutionService _powerShellService;
        private readonly ILogicEngineService _logicEngineService;
        private readonly CredentialStorageService _credentialService;

        public IdentityMigrator(
            ILogger<IdentityMigrator> logger,
            PowerShellExecutionService powerShellService,
            ILogicEngineService logicEngineService,
            CredentialStorageService credentialService)
        {
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
            _powerShellService = powerShellService ?? throw new ArgumentNullException(nameof(powerShellService));
            _logicEngineService = logicEngineService ?? throw new ArgumentNullException(nameof(logicEngineService));
            _credentialService = credentialService ?? throw new ArgumentNullException(nameof(credentialService));
        }

        /// <summary>
        /// Migrate user profile from source to target domain
        /// </summary>
        public async Task<MigrationResult<IdentityMigrationResult>> MigrateAsync(
            UserProfileItem item, 
            MigrationContext context, 
            CancellationToken cancellationToken = default)
        {
            var result = new MigrationResult<IdentityMigrationResult>
            {
                SourceId = item.UserPrincipalName,
                StartTime = DateTime.Now,
                SessionId = context.SessionId,
                ExecutedBy = context.InitiatedBy
            };

            try
            {
                _logger.LogInformation($"Starting identity migration for user: {item.UserPrincipalName}");
                context.ReportProgressUpdate("Identity Migration", 0, $"Starting migration for {item.UserPrincipalName}");
                context.AuditLogger?.LogMigrationStart(context.SessionId, "User", item.UserPrincipalName, context.InitiatedBy);

                // Step 1: Validate user readiness
                context.ReportProgressUpdate("Identity Migration", 10, "Validating user prerequisites");
                var validationResult = await ValidateAsync(item, context, cancellationToken);
                if (!validationResult.IsValid)
                {
                    result.IsSuccess = false;
                    result.ErrorMessage = $"Validation failed: {string.Join(", ", validationResult.Errors)}";
                    result.Errors.AddRange(validationResult.Errors);
                    return result;
                }

                // Step 2: Create target user account
                context.ReportProgressUpdate("Identity Migration", 25, "Creating target user account");
                var createUserResult = await CreateTargetUserAsync(item, context, cancellationToken);
                if (!createUserResult.IsSuccess)
                {
                    result.IsSuccess = false;
                    result.ErrorMessage = createUserResult.ErrorMessage;
                    result.Errors.AddRange(createUserResult.Errors);
                    return result;
                }

                var targetUserUpn = createUserResult.Properties["TargetUserUpn"].ToString();
                var targetUserSid = createUserResult.Properties.ContainsKey("TargetUserSid") ? 
                    createUserResult.Properties["TargetUserSid"].ToString() : null;

                context.ReportProgressUpdate("Identity Migration", 40, "Target user created successfully");

                // Step 3: Migrate user attributes
                context.ReportProgressUpdate("Identity Migration", 50, "Migrating user attributes");
                var attributeResult = await MigrateUserAttributesAsync(
                    item.Attributes, 
                    targetUserUpn, 
                    context, 
                    cancellationToken);

                // Step 4: Create SID history (if supported and enabled)
                SidMappingResult sidResult = null;
                if (context.GetConfiguration("EnableSidHistory", true) && !string.IsNullOrEmpty(targetUserSid))
                {
                    context.ReportProgressUpdate("Identity Migration", 65, "Creating SID history");
                    sidResult = await CreateSidHistoryAsync(
                        GetUserSid(item), 
                        targetUserSid, 
                        context, 
                        cancellationToken);
                }

                // Step 5: Migrate group memberships
                context.ReportProgressUpdate("Identity Migration", 80, "Migrating group memberships");
                var groupResult = await MigrateGroupMembershipsAsync(
                    item.SecurityGroups, 
                    targetUserSid ?? targetUserUpn, 
                    context, 
                    cancellationToken);

                // Step 6: Finalize and validate migration
                context.ReportProgressUpdate("Identity Migration", 95, "Finalizing migration");
✅ Task T‑052: Model & DTO Harmonization

Purpose: Resolve dozens of CS0108, CS0117, CS1061, and CS0029 errors caused by missing or mismatched fields and methods in your migration and identity models.

architecture‑lead:

Audit all classes under GUI/Models/Identity and GUI/Services/Migration. Identify properties present in base classes (e.g., MigrationResultBase) but missing in derived classes (GroupMigrationResult, GroupMembershipResult, IdentityMigrationResult, etc.).

Define which properties should be inherited and which must be re-declared with the new keyword to avoid CS0108 warnings (e.g., Warnings, SourceUserPrincipalName, StrategyUsed, AttributeMapping, SessionId, etc.).

Enumerate all missing DTO properties referenced in the code (e.g., TargetGroupSid, GroupCreated, GroupAttributes, MemberSids, CustomAttributes, GroupScope, NestedGroupsProcessed, MigratedMembers, UnmappedMembers, CompatibilityMetadata, etc.) and update the corresponding classes to include them.

gui-module-executor:

Implement or adjust DTO classes to match the new definitions (e.g., GroupItem should include MemberSids, MemberOfSids, CustomAttributes; GroupDto should provide Sid, GroupScope; GroupMigrationResult should include all referenced fields).

Update code in GroupMigrator.cs, GpoMigrator.cs, IdentityMigrator.cs and related services to use the harmonized properties and avoid direct dictionary-to-list mismatches (CS0029 errors).

Replace usages of generic List<string> where a Dictionary<string, object> or a custom result type is expected, or vice versa.

build-verifier-integrator:
Build the solution after these changes; confirm that the number of missing-property and implicit-conversion errors drops to zero.

log-monitor-analyzer:
Watch for any remaining model‑related compile or runtime errors and report them to the team.

test-data-validator:
Add tests to verify that new properties are populated correctly when migration results are generated.

documentation-qa-guardian:
Update the model documentation in /GUI/Documentation/ to reflect the new DTO structures and any renamed properties.

Success criteria:

“Missing definition” and “no accessible extension method” errors disappear when compiling.

All derived result classes expose properties expected by the migrators.

Code no longer attempts to implicitly convert dictionaries to lists or vice versa.

✅ Task T‑053: Service and Helper Implementation Completion

Purpose: Address missing methods and classes in services, especially CredentialStorageService, ConfigurationService, and auditing helpers.

architecture‑lead:

Examine the code for calls to methods such as GetCredentials, StoreCredentials, DeleteCredentials, CredentialExists, GetAllCredentialKeys, ClearAll, TryResolveTenantId, etc. Document the expected behaviors and parameters of each method.

Define new interfaces or extend existing ones (e.g., ICredentialStorageService, IConfigurationService) to include these methods.

gui-module-executor:

Implement the missing functions in CredentialStorageService.cs, using secure storage (DPAPI or Key Vault as appropriate) and file-level encryption for storing credentials.

Add TryResolveTenantId to ConfigurationService. This should look up tenant IDs from saved profiles or configuration files.

Ensure that IAuditService.LogAsync exists and is accessible wherever used (fix ambiguous references to AuditEvent, AuditAction, and AuditStatus). Consider namespacing conflicts (e.g., between your Audit namespace and Microsoft.Graph.Models.AuditEvent).

build-verifier-integrator:
After implementing these methods, rebuild the solution. Confirm that CS0103 (name does not exist) and CS1061 (method not found) errors related to credential and configuration services no longer occur.

test-data-validator:

Write tests to verify that credentials can be saved, retrieved, deleted, and enumerated via the new methods.

Test that TryResolveTenantId returns the correct tenant ID for various profile configurations.

documentation-qa-guardian:
Document the new credential-storage API and environment-resolution logic in /GUI/Documentation/credentials.md and /GUI/Documentation/configuration.md.

Success criteria:

All “name does not exist” and “method not found” errors in CredentialStorageService.cs and ConfigurationService.cs are resolved.

Credentials can be saved, retrieved, and removed using the new methods.

Tenant IDs can be resolved from configuration profiles.

✅ Task T‑054: Graph & Identity API Harmonization

Purpose: Fix dozens of missing Graph types and methods (e.g., MailFoldersRequestBuilder.Inbox, OrganizationCollectionResponse.FirstOrDefault, MailFolderCollectionResponse.Select, etc.) and unify usage of Microsoft Graph SDK.

architecture‑lead:

Review all service classes (e.g., GraphNotificationService.cs, LicenseAssignmentService.cs, AttributeMappingService.cs) for Graph SDK usage. Identify which packages (Microsoft.Graph, Microsoft.Graph.Beta) are imported, and determine if the correct version is referenced.

Specify a consistent Graph SDK version and update all using directives accordingly.

gui-module-executor:

Add missing using Microsoft.Graph; or using Microsoft.Graph.Beta; references to files where Graph types (e.g., UserCollectionResponse, MailFoldersRequestBuilder, OrganizationCollectionResponse) are used.

Replace missing methods (e.g., FirstOrDefault, Any, Select, Inbox, SentItems) with appropriate alternatives from the SDK. For example, use .Value.FirstOrDefault() on collections, and graphServiceClient.Me.MailFolders["Inbox"].Messages rather than nonexistent Inbox properties.

Fix ambiguous references between your own AuditEvent types and Graph’s audit event classes by qualifying namespaces or using alias directives.

build-verifier-integrator:
Restore NuGet packages (if necessary) and rebuild. Confirm that Graph type and method errors disappear.

test-data-validator:

Mock Graph API calls in tests to ensure that corrected methods (e.g., retrieving inbox messages, assigning licenses) work without compile errors.

Write integration tests for license assignment to confirm Graph API interactions succeed.

documentation-qa-guardian:
Update the project’s technical documentation to reflect the SDK version used and note any major changes in Graph API usage.

Success criteria:

Compilation errors referencing missing Graph types or methods (e.g., OrganizationCollectionResponse.FirstOrDefault, MailFoldersRequestBuilder.Inbox) are resolved.

The application uses a consistent version of the Graph SDK and the correct namespaces.

Ambiguities between your custom AuditEvent and Graph’s AuditEvent are eliminated.

✅ Task T‑055: Group & GPO Migration Provider Finalization

Purpose: Fix the many errors in GroupMigrator.cs, GpoMigrator.cs, and related result classes (e.g., GpoReplicationResult, GroupHierarchyResult, GroupDependencyValidationResult, etc.).

architecture‑lead:

Review the interfaces and expected result classes for group/GPO migration (e.g., GroupMigrationResult, GroupDependencyValidationResult, GpoReplicationResult, GroupPolicyConflictResolutionResult). Document the expected fields and methods.

Ensure each result class extends MigrationResultBase where appropriate and includes all referenced fields (e.g., TargetGroupSid, GroupSidMappings, MfaConfiguration, ConflictsResolved, SkippedGroupSids, ResolutionDetails, etc.).

Define the delegate signatures for progress reporting. Replace usages of Action<MigrationProgress> that require three parameters with a proper delegate (e.g., Action<MigrationProgress, TSource, TTarget>).

gui-module-executor:

Implement missing result classes and fields.

Fix calls in GroupMigrator.cs and GpoMigrator.cs where lists are being treated as dictionaries or vice versa (e.g., avoid using ContainsKey on List<string>).

Provide GetMappedSid and other helper methods referenced in migrator classes.

build-verifier-integrator:
Build and run tests for group and GPO migrations. Confirm that compile errors for undefined properties/methods disappear.

log-monitor-analyzer:
During migration testing, monitor logs for any runtime errors due to result-class mismatches or incorrect progress delegates.

test-data-validator:
Create unit tests verifying that group and GPO migration results populate all expected fields and that progress events fire with the correct signature.

documentation-qa-guardian:
Update the GPO/group migration documentation (/GUI/Documentation/migration-gpo-groups-acl.md) to reflect the updated result structures and delegates.

Success criteria:

All missing-field errors in GroupMigrator and GpoMigrator are resolved.

Progress reporting uses a consistent delegate signature.

Result objects include all expected fields and inherit from MigrationResultBase.

✅ Task T‑056: License, Notification, and Sync Provider Corrections

Purpose: Address the numerous errors in LicenseAssignmentService, GraphNotificationService, AttributeMappingService, UserSyncService, and view models (e.g., LicenseComplianceViewModel, MigrationPlanningViewModel) related to license assignment, notifications and user sync.

architecture‑lead:

Define correct API calls for license assignment: use GraphServiceClient.Users[userId].AssignLicense with AssignedLicense objects (import from Microsoft.Graph.Models). Document fields like SkuId, DisabledPlans, etc.

Specify correct types for notification messages (Message, ItemBody, Recipient, EmailAddress from Graph).

For sync, define UserSyncStatus and ensure it includes properties like SyncedAttributes and the expected methods.

gui-module-executor:

Fix ILicenseAssignmentService to return proper types (AssignLicensePostRequestBody instead of Dictionary<string, object>, etc.).

Update GraphNotificationService to use Microsoft.Graph message objects instead of nonexistent types.

Remove uses of TryResolveTenantId in view models or implement it in ConfigurationService.

Fix property assignments in LicenseComplianceViewModel and MigrationPlanningViewModel, ensuring they use the correct logger generic type (e.g., ILogger<LicenseComplianceViewModel> instead of ILogger<LicenseAssignmentService>).

build-verifier-integrator:
Build after these changes; confirm that AssignedLicense, Message, ItemBody, etc., compile.

log-monitor-analyzer:
Monitor logs for Graph API call failures and ensure errors are correctly logged.

test-data-validator:
Write tests that assign licenses to a set of users and confirm the API returns expected results. Mock Graph API calls for notifications and ensure messages are formatted and sent correctly.

documentation-qa-guardian:
Update /GUI/Documentation/migration-licenses.md and notification docs with the corrected API usage.

Success criteria:

Licensing, notifications, and user-sync errors (missing types, incorrect API calls, read-only properties) are resolved.

License assignment results and notifications function properly in tests.

The UI no longer references nonexistent methods or properties in these services.

                // Build successful result
                result.Result = new IdentityMigrationResult
                {
                    SourceUserSid = GetUserSid(item),
                    TargetUserSid = targetUserSid,
                    TargetUserUpn = targetUserUpn,
                    AttributeMappings = attributeResult?.TargetAttributes ?? new Dictionary<string, string>(),
                    MigratedGroups = groupResult?.MigratedGroups ?? new List<string>(),
                    UnmappedGroups = groupResult?.UnmappedGroups ?? new List<string>(),
                    SidHistoryCreated = sidResult?.HistoryCreated ?? false,
                    CustomProperties = new Dictionary<string, object>
                    {
                        ["MigrationDate"] = DateTime.Now,
                        ["SourceDomain"] = item.SourceDomain,
                        ["TargetDomain"] = context.Target.DomainName
                    }
                };

                result.TargetId = targetUserUpn;
                result.IsSuccess = true;
                result.EndTime = DateTime.Now;

                // Add SID mapping to context for dependent operations
                if (!string.IsNullOrEmpty(targetUserSid))
                {
                    context.AddSidMapping(GetUserSid(item), targetUserSid);
                }

                context.ReportProgressUpdate("Identity Migration", 100, "Migration completed successfully");
                context.AuditLogger?.LogMigrationComplete(context.SessionId, "User", item.UserPrincipalName, true);

                _logger.LogInformation($"Identity migration completed successfully for user: {item.UserPrincipalName}");

            }
            catch (OperationCanceledException)
            {
                result.IsSuccess = false;
                result.ErrorMessage = "Migration was cancelled";
                _logger.LogWarning($"Identity migration cancelled for user: {item.UserPrincipalName}");
            }
            catch (Exception ex)
            {
                result.IsSuccess = false;
                result.ErrorMessage = ex.Message;
                result.Errors.Add(ex.ToString());
                result.EndTime = DateTime.Now;

                context.AuditLogger?.LogMigrationComplete(context.SessionId, "User", item.UserPrincipalName, false, ex.Message);
                _logger.LogError(ex, $"Identity migration failed for user: {item.UserPrincipalName}");
            }

            return result;
        }

        /// <summary>
        /// Validate user profile before migration
        /// </summary>
        public async Task<MandADiscoverySuite.Migration.ValidationResult> ValidateAsync(
            UserProfileItem item, 
            MigrationContext context, 
            CancellationToken cancellationToken = default)
        {
            var result = new ValidationResult
            {
                ValidationType = "UserProfile",
                StartTime = DateTime.Now,
                SessionId = context.SessionId
            };

            try
            {
                // Basic user validation
                if (string.IsNullOrEmpty(item.UserPrincipalName))
                {
                    result.Errors.Add("User Principal Name is required");
                }

                if (!item.IsEnabled)
                {
                    result.Warnings.Add(new MandADiscoverySuite.Migration.ValidationIssue 
                    { 
                        Severity = MandADiscoverySuite.Migration.ValidationSeverity.Warning,
                        Category = "Account Status",
                        Description = "User account is disabled in source domain"
                    });
                }

                // Check for conflicting target account
                var conflictCheck = await CheckTargetAccountConflictAsync(item.UserPrincipalName, context, cancellationToken);
                if (conflictCheck.HasConflict)
                {
                    result.Errors.Add($"Target account already exists: {item.UserPrincipalName}");
                }

                // Validate licensing requirements
                var licenseValidation = await ValidateLicensingRequirementsAsync(item, context, cancellationToken);
                if (!licenseValidation.IsValid)
                {
                    result.Errors.AddRange(licenseValidation.Issues.Select(i => i.Description));
                }

                // Validate dependencies
                var dependencyValidation = await ValidateUserDependenciesAsync(item, context, cancellationToken);
                if (!dependencyValidation.CanProceed)
                {
                    result.Errors.AddRange(dependencyValidation.MissingDependencies.Select(d => $"Missing dependency: {d}"));
                }

                result.IsSuccess = !result.Errors.Any();
                result.EndTime = DateTime.Now;

            }
            catch (Exception ex)
            {
                result.IsSuccess = false;
                result.ErrorMessage = ex.Message;
                result.Errors.Add(ex.ToString());
                _logger.LogError(ex, $"Validation failed for user: {item.UserPrincipalName}");
            }

            return result;
        }

        /// <summary>
        /// Rollback user migration
        /// </summary>
        public async Task<RollbackResult> RollbackAsync(
            IdentityMigrationResult result, 
            MigrationContext context, 
            CancellationToken cancellationToken = default)
        {
            var rollbackResult = new RollbackResult
            {
                RollbackAction = "UserIdentityRollback",
                StartTime = DateTime.Now,
                SessionId = context.SessionId
            };

            try
            {
                _logger.LogInformation($"Starting rollback for user: {result.TargetUserUpn}");
                context.AuditLogger?.LogRollback(context.SessionId, result.TargetUserUpn, "Manual rollback requested", false);

                // Remove target user account if created
                if (!string.IsNullOrEmpty(result.TargetUserUpn))
                {
                    var deleteResult = await DeleteTargetUserAsync(result.TargetUserUpn, context, cancellationToken);
                    if (deleteResult.IsSuccess)
                    {
                        rollbackResult.RestoredItems.Add($"Deleted target user: {result.TargetUserUpn}");
                    }
                    else
                    {
                        rollbackResult.UnrestoredItems.Add($"Failed to delete target user: {result.TargetUserUpn}");
                    }
                }

                // Remove SID mappings
                if (!string.IsNullOrEmpty(result.SourceUserSid))
                {
                    context.SidMapping.Remove(result.SourceUserSid);
                    rollbackResult.RestoredItems.Add($"Removed SID mapping: {result.SourceUserSid}");
                }

                rollbackResult.IsSuccess = !rollbackResult.UnrestoredItems.Any();
                rollbackResult.EndTime = DateTime.Now;
                rollbackResult.DataRestored = rollbackResult.IsSuccess;

                context.AuditLogger?.LogRollback(context.SessionId, result.TargetUserUpn, "Rollback completed", rollbackResult.IsSuccess);

            }
            catch (Exception ex)
            {
                rollbackResult.IsSuccess = false;
                rollbackResult.ErrorMessage = ex.Message;
                _logger.LogError(ex, $"Rollback failed for user: {result.TargetUserUpn}");
            }

            return rollbackResult;
        }

        /// <summary>
        /// Check if provider supports the migration type
        /// </summary>
        public async Task<bool> SupportsAsync(
            MigrationType type, 
            MigrationContext context, 
            CancellationToken cancellationToken = default)
        {
            await Task.CompletedTask; // Async compliance
            return type == MigrationType.User || type == MigrationType.UserProfile;
        }

        /// <summary>
        /// Untyped migration method for base interface compliance
        /// </summary>
        public async Task<MigrationResultBase> MigrateAsync(object item, MigrationContext context, CancellationToken cancellationToken = default)
        {
            if (item is UserProfileItem userProfile)
            {
                var result = await MigrateAsync(userProfile, context, cancellationToken);
                return result.Result;
            }
            throw new ArgumentException($"Invalid item type. Expected UserProfileItem, got {item?.GetType()}");
        }

        /// <summary>
        /// Estimate migration duration
        /// </summary>
        public async Task<TimeSpan> EstimateDurationAsync(
            UserProfileItem item, 
            MigrationContext context, 
            CancellationToken cancellationToken = default)
        {
            await Task.CompletedTask; // Async compliance
            
            // Base time for user migration
            var baseTime = TimeSpan.FromMinutes(2);
            
            // Additional time for group memberships
            var groupTime = TimeSpan.FromSeconds(item.SecurityGroups?.Count * 5 ?? 0);
            
            // Additional time for profile size
            var profileTime = TimeSpan.FromSeconds(item.ProfileSizeMB / 100); // ~1 sec per 100MB
            
            return baseTime.Add(groupTime).Add(profileTime);
        }

        /// <summary>
        /// Create SID history for seamless access
        /// </summary>
        public async Task<SidMappingResult> CreateSidHistoryAsync(
            string sourceUserSid, 
            string targetUserSid, 
            MigrationContext context, 
            CancellationToken cancellationToken = default)
        {
            var result = new SidMappingResult
            {
                SourceSid = sourceUserSid,
                TargetSid = targetUserSid,
                StartTime = DateTime.Now,
                SessionId = context.SessionId
            };

            try
            {
                // Check if SID history is supported in target environment
                if (context.Target.Type == "AzureAD")
                {
                    result.Warnings.Add("SID history not supported in Azure AD - using alternative mapping");
                    result.HistoryCreated = false;
                    result.IsSuccess = true;
                    return result;
                }

                // Execute PowerShell script to create SID history
                var script = $@"
                    try {{
                        $sourceSid = '{sourceUserSid}'
                        $targetSid = '{targetUserSid}'
                        
                        # Add SID history using PowerShell AD cmdlets
                        $targetUser = Get-ADUser -Filter ""SID -eq '$targetSid'""
                        if ($targetUser) {{
                            $targetUser | Set-ADUser -Add @{{sidHistory = $sourceSid}}
                            Write-Output ""SID history created successfully""
                            Write-Output ""Success:True""
                        }} else {{
                            Write-Error ""Target user not found for SID: $targetSid""
                        }}
                    }}
                    catch {{
                        Write-Error $_.Exception.Message
                    }}
                ";

                var scriptResult = await _powerShellService.ExecuteScriptAsync(
                    script, 
                    null,
                    new PowerShellExecutionOptions { WorkingDirectory = context.WorkingDirectory },
                    context.CancellationToken);

                if (scriptResult.IsSuccess && scriptResult.Output.Contains("Success:True"))
                {
                    result.HistoryCreated = true;
                    result.IsSuccess = true;
                    _logger.LogInformation($"SID history created: {sourceUserSid} -> {targetUserSid}");
                }
                else
                {
                    result.IsSuccess = false;
                    result.ErrorMessage = string.Join(", ", scriptResult.Errors);
                    result.Errors.AddRange(scriptResult.Errors);
                }

                result.EndTime = DateTime.Now;
            }
            catch (Exception ex)
            {
                result.IsSuccess = false;
                result.ErrorMessage = ex.Message;
                result.Errors.Add(ex.ToString());
                _logger.LogError(ex, $"Failed to create SID history: {sourceUserSid} -> {targetUserSid}");
            }

            return result;
        }

        /// <summary>
        /// Migrate user group memberships
        /// </summary>
        public async Task<GroupMembershipResult> MigrateGroupMembershipsAsync(
            List<string> sourceGroups, 
            string targetUserSid, 
            MigrationContext context, 
            CancellationToken cancellationToken = default)
        {
            var result = new GroupMembershipResult
            {
                UserSid = targetUserSid,
                SourceGroups = sourceGroups ?? new List<string>(),
                StartTime = DateTime.Now,
                SessionId = context.SessionId
            };

            try
            {
                foreach (var sourceGroup in sourceGroups ?? new List<string>())
                {
                    cancellationToken.ThrowIfCancellationRequested();

                    // Map source group to target group
                    var targetGroup = context.GroupMapping.TryGetValue(sourceGroup, out var mappedGroup) 
                        ? mappedGroup 
                        : await ResolveTargetGroupAsync(sourceGroup, context, cancellationToken);

                    if (!string.IsNullOrEmpty(targetGroup))
                    {
                        // Add user to target group
                        var addMemberResult = await AddUserToGroupAsync(targetUserSid, targetGroup, context, cancellationToken);
                        if (addMemberResult.IsSuccess)
                        {
                            result.MigratedGroups.Add(targetGroup);
                            result.GroupMappings[sourceGroup] = targetGroup;
                        }
                        else
                        {
                            result.UnmappedGroups.Add(sourceGroup);
                            result.Warnings.Add($"Failed to add user to group {targetGroup}: {addMemberResult.ErrorMessage}");
                        }
                    }
                    else
                    {
                        result.UnmappedGroups.Add(sourceGroup);
                        result.Warnings.Add($"No target mapping found for group: {sourceGroup}");
                    }
                }

                result.IsSuccess = result.MigratedGroups.Any() || !sourceGroups.Any();
                result.EndTime = DateTime.Now;

                _logger.LogInformation($"Group membership migration completed. Migrated: {result.MigratedGroups.Count}, Unmapped: {result.UnmappedGroups.Count}");
            }
            catch (Exception ex)
            {
                result.IsSuccess = false;
                result.ErrorMessage = ex.Message;
                result.Errors.Add(ex.ToString());
                _logger.LogError(ex, "Failed to migrate group memberships");
            }

            return result;
        }

        /// <summary>
        /// Migrate user attributes
        /// </summary>
        public async Task<SimpleAttributeMappingResult> MigrateUserAttributesAsync(
            Dictionary<string, string> sourceAttributes, 
            string targetUserUpn, 
            MigrationContext context, 
            CancellationToken cancellationToken = default)
        {
            var result = new SimpleAttributeMappingResult
            {
                UserUpn = targetUserUpn,
                SourceAttributes = sourceAttributes ?? new Dictionary<string, string>(),
                StartTime = DateTime.Now,
                SessionId = context.SessionId
            };

            try
            {
                // Define attribute mappings between source and target
                var attributeMappings = GetAttributeMappings(context);

                foreach (var sourceAttr in sourceAttributes ?? new Dictionary<string, string>())
                {
                    cancellationToken.ThrowIfCancellationRequested();

                    if (attributeMappings.TryGetValue(sourceAttr.Key, out var targetAttr))
                    {
                        // Set target attribute value
                        var setResult = await SetUserAttributeAsync(targetUserUpn, targetAttr, sourceAttr.Value, context, cancellationToken);
                        if (setResult.IsSuccess)
                        {
                            result.TargetAttributes[targetAttr] = sourceAttr.Value;
                        }
                        else
                        {
                            result.UnmappedAttributes.Add($"{sourceAttr.Key}: {setResult.ErrorMessage}");
                        }
                    }
                    else
                    {
                        result.UnmappedAttributes.Add($"No mapping defined for attribute: {sourceAttr.Key}");
                    }
                }

                result.IsSuccess = result.TargetAttributes.Any() || !sourceAttributes.Any();
                result.EndTime = DateTime.Now;

            }
            catch (Exception ex)
            {
                result.IsSuccess = false;
                result.ErrorMessage = ex.Message;
                result.Errors.Add(ex.ToString());
                _logger.LogError(ex, $"Failed to migrate attributes for user: {targetUserUpn}");
            }

            return result;
        }

        /// <summary>
        /// Validate user dependencies
        /// </summary>
        public async Task<DependencyValidationResult> ValidateUserDependenciesAsync(
            UserProfileItem user, 
            MigrationContext context, 
            CancellationToken cancellationToken = default)
        {
            var result = new DependencyValidationResult
            {
                ItemId = user.UserPrincipalName,
                StartTime = DateTime.Now,
                SessionId = context.SessionId
            };

            try
            {
                // Use LogicEngineService to get user dependencies
                var userDetail = await _logicEngineService.GetUserDetailAsync(user.UserPrincipalName);
                if (userDetail != null)
                {
                    // Check manager dependencies
                    if (!string.IsNullOrEmpty(userDetail.ManagerUpn))
                    {
                        result.Dependencies.Add($"Manager: {userDetail.ManagerUpn}");
                        
                        // Check if manager is already migrated or in current batch
                        if (!context.UserMapping.ContainsKey(userDetail.ManagerUpn))
                        {
                            result.MissingDependencies.Add($"Manager not migrated: {userDetail.ManagerUpn}");
                        }
                    }

                    // Check group ownership dependencies
                    foreach (var ownedGroup in userDetail.OwnedGroups ?? new List<string>())
                    {
                        result.Dependencies.Add($"Owns Group: {ownedGroup}");
                        if (!context.GroupMapping.ContainsKey(ownedGroup))
                        {
                            result.MissingDependencies.Add($"Owned group not available: {ownedGroup}");
                        }
                    }
                }

                result.CanProceed = !result.MissingDependencies.Any() || context.GetConfiguration("IgnoreDependencies", false);
                result.IsSuccess = true;
                result.EndTime = DateTime.Now;

            }
            catch (Exception ex)
            {
                result.IsSuccess = false;
                result.ErrorMessage = ex.Message;
                result.Errors.Add(ex.ToString());
                _logger.LogError(ex, $"Failed to validate dependencies for user: {user.UserPrincipalName}");
            }

            return result;
        }

        // Private helper methods

        private async Task<MigrationResultBase> CreateTargetUserAsync(UserProfileItem item, MigrationContext context, CancellationToken cancellationToken)
        {
            var result = new GenericMigrationResult("IdentityMigration") { StartTime = DateTime.Now };

            try
            {
                var script = GenerateCreateUserScript(item, context);
                var scriptResult = await _powerShellService.ExecuteScriptAsync(script, null, new PowerShellExecutionOptions { WorkingDirectory = context.WorkingDirectory }, cancellationToken);

                if (scriptResult.IsSuccess)
                {
                    result.IsSuccess = true;
                    result.Metadata["TargetUserUpn"] = item.UserPrincipalName; // Assuming same UPN
                    // Extract target SID from script output if available
                    var sidMatch = scriptResult.Output.FirstOrDefault(o => o.StartsWith("TargetSID:"));
                    if (!string.IsNullOrEmpty(sidMatch))
                    {
                        result.Metadata["TargetUserSid"] = sidMatch.Substring("TargetSID:".Length);
                    }
                }
                else
                {
                    result.IsSuccess = false;
                    result.ErrorMessage = string.Join(", ", scriptResult.Errors);
                    result.Errors.AddRange(scriptResult.Errors);
                }
            }
            catch (Exception ex)
            {
                result.IsSuccess = false;
                result.ErrorMessage = ex.Message;
                result.Errors.Add(ex.ToString());
            }

            return result;
        }

        private string GenerateCreateUserScript(UserProfileItem item, MigrationContext context)
        {
            // Extract Graph app credentials from context if provided
            var graphTenantId = context?.Target?.Configuration?.ContainsKey("GraphTenantId") == true ? context.Target.Configuration["GraphTenantId"]?.ToString() : string.Empty;
            var graphClientId = context?.Target?.Configuration?.ContainsKey("GraphClientId") == true ? context.Target.Configuration["GraphClientId"]?.ToString() : string.Empty;
            var graphClientSecret = context?.Target?.Configuration?.ContainsKey("GraphClientSecret") == true ? context.Target.Configuration["GraphClientSecret"]?.ToString() : string.Empty;

            return $@"
                try {{
                    $upn = '{item.UserPrincipalName}'
                    $displayName = '{item.DisplayName}'
                    $samAccount = '{item.SamAccountName}'
                    
                    # Create user based on target environment type
                    if ('{context.Target.Type}' -eq 'AzureAD') {{
                        # Connect to Microsoft Graph using app-only credentials when available
                        $tenantId = '{graphTenantId}'
                        $clientId = '{graphClientId}'
                        $clientSecret = '{graphClientSecret}'
                        if ($tenantId -and $clientId -and $clientSecret) {{
                            try {{
                                Connect-MgGraph -TenantId $tenantId -ClientId $clientId -ClientSecret $clientSecret -NoWelcome
                            }} catch {{
                                Write-Error ""Failed to connect to Microsoft Graph: $($_.Exception.Message)""
                                throw
                            }}
                        }} else {{
                            Write-Warning 'Graph app credentials not found in context; assuming pre-authenticated Graph session.'
                        }}
                        # Azure AD user creation using Microsoft Graph PowerShell
                        $passwordProfile = @{{
                            Password = 'TempPassword123!'
                            ForceChangePasswordNextSignIn = $true
                        }}
                        
                        $userParams = @{{
                            UserPrincipalName = $upn
                            DisplayName = $displayName
                            MailNickname = $samAccount
                            PasswordProfile = $passwordProfile
                            AccountEnabled = $true
                        }}
                        
                        $newUser = New-MgUser @userParams
                        if ($newUser) {{
                            Write-Output ""User created successfully: $upn""
                            Write-Output ""TargetSID:$($newUser.Id)""
                        }}
                    }} else {{
                        # On-premises AD user creation
                        $password = ConvertTo-SecureString 'TempPassword123!' -AsPlainText -Force
                        $newUser = New-ADUser -UserPrincipalName $upn -DisplayName $displayName -SamAccountName $samAccount -AccountPassword $password -Enabled $true -PassThru
                        if ($newUser) {{
                            Write-Output ""User created successfully: $upn""
                            Write-Output ""TargetSID:$($newUser.SID)""
                        }}
                    }}
                }}
                catch {{
                    Write-Error $_.Exception.Message
                }}
            ";
        }

        private string GetUserSid(UserProfileItem item)
        {
            // Extract SID from user properties or construct based on domain and SAM account
            return item.CustomProperties?.ContainsKey("SID") == true 
                ? item.CustomProperties["SID"].ToString()
                : $"{item.SourceDomain}\\{item.SamAccountName}";
        }

        private async Task<TargetAccountConflictResult> CheckTargetAccountConflictAsync(string upn, MigrationContext context, CancellationToken cancellationToken)
        {
            try
            {
                var script = $@"
                    try {{
                        $upn = '{upn}'
                        if ('{context.Target.Type}' -eq 'AzureAD') {{
                            $existingUser = Get-MgUser -Filter ""UserPrincipalName eq '$upn'"" -ErrorAction SilentlyContinue
                            if ($existingUser) {{
                                Write-Output ""Conflict:True""
                            }} else {{
                                Write-Output ""Conflict:False""
                            }}
                        }} else {{
                            $existingUser = Get-ADUser -Filter ""UserPrincipalName -eq '$upn'"" -ErrorAction SilentlyContinue
                            if ($existingUser) {{
                                Write-Output ""Conflict:True""
                            }} else {{
                                Write-Output ""Conflict:False""
                            }}
                        }}
                    }}
                    catch {{
                        Write-Output ""Conflict:False""
                    }}
                ";

                var scriptResult = await _powerShellService.ExecuteScriptAsync(script, null, new PowerShellExecutionOptions { WorkingDirectory = context.WorkingDirectory }, cancellationToken);
                var hasConflict = scriptResult.Output.Any(o => o.Contains("Conflict:True"));

                return new TargetAccountConflictResult { HasConflict = hasConflict };
            }
            catch
            {
                return new TargetAccountConflictResult { HasConflict = false };
            }
        }

        private Dictionary<string, string> GetAttributeMappings(MigrationContext context)
        {
            // Define standard AD to Azure AD attribute mappings
            var mappings = new Dictionary<string, string>
            {
                ["givenName"] = "givenName",
                ["sn"] = "surname", 
                ["title"] = "jobTitle",
                ["department"] = "department",
                ["company"] = "companyName",
                ["telephoneNumber"] = "businessPhones",
                ["mobile"] = "mobilePhone",
                ["physicalDeliveryOfficeName"] = "officeLocation",
                ["streetAddress"] = "streetAddress",
                ["l"] = "city",
                ["st"] = "state",
                ["postalCode"] = "postalCode",
                ["c"] = "country"
            };

            // Allow custom mappings from context configuration
            var customMappings = context.GetConfiguration<Dictionary<string, string>>("AttributeMappings");
            if (customMappings != null)
            {
                foreach (var mapping in customMappings)
                {
                    mappings[mapping.Key] = mapping.Value;
                }
            }

            return mappings;
        }

        // Additional helper methods would be implemented here for:
        // - ValidateLicensingRequirementsAsync
        // - ResolveTargetGroupAsync
        // - AddUserToGroupAsync
        // - SetUserAttributeAsync
        // - FinalizeUserMigrationAsync
        // - DeleteTargetUserAsync

        private async Task<ValidationResult> ValidateLicensingRequirementsAsync(UserProfileItem item, MigrationContext context, CancellationToken cancellationToken)
        {
            // Placeholder for licensing validation logic
            await Task.CompletedTask;
            return new ValidationResult { IsSuccess = true };
        }

        private async Task<string> ResolveTargetGroupAsync(string sourceGroup, MigrationContext context, CancellationToken cancellationToken)
        {
            // Placeholder for group resolution logic
            await Task.CompletedTask;
            return sourceGroup; // Default to same name
        }

        private async Task<MigrationResultBase> AddUserToGroupAsync(string userSid, string groupName, MigrationContext context, CancellationToken cancellationToken)
        {
            var result = new GenericMigrationResult("IdentityMigration") { StartTime = DateTime.Now };
            try
            {
                // Build PowerShell that connects to Graph and adds the user to the group
                var tenantId = context?.Target?.Configuration?.ContainsKey("GraphTenantId") == true ? context.Target.Configuration["GraphTenantId"].ToString() : string.Empty;
                var clientId = context?.Target?.Configuration?.ContainsKey("GraphClientId") == true ? context.Target.Configuration["GraphClientId"].ToString() : string.Empty;
                var clientSecret = context?.Target?.Configuration?.ContainsKey("GraphClientSecret") == true ? context.Target.Configuration["GraphClientSecret"].ToString() : string.Empty;

                var script = $@"
                    try {{
                        $tenantId = '{tenantId}'
                        $clientId = '{clientId}'
                        $clientSecret = '{clientSecret}'
                        if ($tenantId -and $clientId -and $clientSecret) {{
                            Connect-MgGraph -TenantId $tenantId -ClientId $clientId -ClientSecret $clientSecret -NoWelcome
                        }} else {{
                            Write-Warning 'Graph app credentials not found in context; assuming pre-authenticated Graph session.'
                        }}

                        $groupName = '{groupName}'
                        $userId = '{userSid}'
                        $group = Get-MgGroup -Filter ""displayName eq '$groupName'"" -ConsistencyLevel eventual -CountVariable c | Select-Object -First 1
                        if (-not $group) {{ throw ""Group not found: $groupName"" }}
                        $ref = @{{ '@odata.id' = ""https://graph.microsoft.com/v1.0/directoryObjects/$userId"" }}
                        New-MgGroupMemberByRef -GroupId $group.Id -BodyParameter $ref | Out-Null
                        Write-Output ""Added user $userId to group $($group.Id)""
                    }} catch {{
                        Write-Error $_.Exception.Message
                    }}
                ";

                var psOptions = new PowerShellExecutionOptions { WorkingDirectory = context.WorkingDirectory };
                var exec = await _powerShellService.ExecuteScriptAsync(script, null, psOptions, cancellationToken);
                result.IsSuccess = exec.State == PowerShellExecutionState.Completed && !(exec.Errors?.Any() == true);
                if (!result.IsSuccess)
                {
                    result.ErrorMessage = string.Join(", ", exec.Errors ?? new List<string>());
                    result.Errors.AddRange(exec.Errors ?? new List<string>());
                }
            }
            catch (Exception ex)
            {
                result.IsSuccess = false;
                result.ErrorMessage = ex.Message;
                result.Errors.Add(ex.ToString());
            }
            return result;
        }

        private async Task<MigrationResultBase> SetUserAttributeAsync(string userUpn, string attributeName, string value, MigrationContext context, CancellationToken cancellationToken)
        {
            var result = new GenericMigrationResult("IdentityMigration") { StartTime = DateTime.Now };
            try
            {
                var tenantId = context?.Target?.Configuration?.ContainsKey("GraphTenantId") == true ? context.Target.Configuration["GraphTenantId"].ToString() : string.Empty;
                var clientId = context?.Target?.Configuration?.ContainsKey("GraphClientId") == true ? context.Target.Configuration["GraphClientId"].ToString() : string.Empty;
                var clientSecret = context?.Target?.Configuration?.ContainsKey("GraphClientSecret") == true ? context.Target.Configuration["GraphClientSecret"].ToString() : string.Empty;

                // Graph property update via BodyParameter
                var script = $@"
                    try {{
                        $tenantId = '{tenantId}'
                        $clientId = '{clientId}'
                        $clientSecret = '{clientSecret}'
                        if ($tenantId -and $clientId -and $clientSecret) {{
                            Connect-MgGraph -TenantId $tenantId -ClientId $clientId -ClientSecret $clientSecret -NoWelcome
                        }} else {{
                            Write-Warning 'Graph app credentials not found in context; assuming pre-authenticated Graph session.'
                        }}

                        $userId = '{userUpn}'
                        $attr = '{attributeName}'
                        $val = '{value}'
                        $body = @{{}}; $body[$attr] = $val
                        Update-MgUser -UserId $userId -BodyParameter $body
                        Write-Output ""Updated $attr on $userId""
                    }} catch {{
                        Write-Error $_.Exception.Message
                    }}
                ";

                var psOptions = new PowerShellExecutionOptions { WorkingDirectory = context.WorkingDirectory };
                var exec = await _powerShellService.ExecuteScriptAsync(script, null, psOptions, cancellationToken);
                result.IsSuccess = exec.State == PowerShellExecutionState.Completed && !(exec.Errors?.Any() == true);
                if (!result.IsSuccess)
                {
                    result.ErrorMessage = string.Join(", ", exec.Errors ?? new List<string>());
                    result.Errors.AddRange(exec.Errors ?? new List<string>());
                }
            }
            catch (Exception ex)
            {
                result.IsSuccess = false;
                result.ErrorMessage = ex.Message;
                result.Errors.Add(ex.ToString());
            }
            return result;
        }

        private async Task FinalizeUserMigrationAsync(string targetUserUpn, MigrationContext context, CancellationToken cancellationToken)
        {
            // Placeholder for finalization logic (enable account, send welcome email, etc.)
            await Task.CompletedTask;
        }

        private async Task<MigrationResultBase> DeleteTargetUserAsync(string targetUserUpn, MigrationContext context, CancellationToken cancellationToken)
        {
            // Placeholder for user deletion logic
            await Task.CompletedTask;
            return new GenericMigrationResult("DeleteTargetUser") { IsSuccess = true };
        }
    }

    // Helper classes
    public class TargetAccountConflictResult
    {
        public bool HasConflict { get; set; }
        public string ConflictDetails { get; set; }
    }
}
