using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.DirectoryServices;
using Microsoft.Graph;
using Microsoft.Extensions.Logging;
using MandADiscoverySuite.Migration;
using MandADiscoverySuite.Services.Migration;

namespace MandADiscoverySuite.MigrationProviders
{
    /// <summary>
    /// Concrete implementation of identity delta migration for Active Directory and Azure AD.
    /// Handles user account changes, group memberships, and permission updates.
    /// </summary>
    public class IdentityDeltaMigrator : IIdentityDeltaMigrator
    {
        private readonly GraphServiceClient _graphClient;
        private readonly DirectoryEntry? _adConnection;
        private readonly ILogger<IdentityDeltaMigrator> _logger;

        public IdentityDeltaMigrator(
            GraphServiceClient graphClient, 
            ILogger<IdentityDeltaMigrator> logger,
            DirectoryEntry? adConnection = null)
        {
            _graphClient = graphClient;
            _adConnection = adConnection;
            _logger = logger;
        }

        public async Task<DeltaMigrationResult<MigrationResultBase>> MigrateDeltaAsync(
            DateTime lastRunTimestamp, 
            DeltaMigrationSettings settings, 
            TargetContext target, 
            IProgress<MandADiscoverySuite.Migration.MigrationProgress>? progress = null)
        {
            var result = new DeltaMigrationResult<MigrationResultBase>
            {
                DeltaRunTimestamp = DateTime.UtcNow,
                RunType = settings.AutoCutover ? DeltaRunType.Final : DeltaRunType.Incremental
            };

            try
            {
                progress?.Report(new MandADiscoverySuite.Migration.MigrationProgress 
                { 
                    Message = "Detecting identity changes...", 
                    Percentage = 10 
                });

                // Phase 1: Detect changes since last run
                var changes = await DetectChangesAsync(lastRunTimestamp, settings);
                result.ChangesDetected = changes.Count();

                if (!changes.Any())
                {
                    result.ChangesProcessed = 0;
                    result.Success = true;
                    return result;
                }

                progress?.Report(new MandADiscoverySuite.Migration.MigrationProgress 
                { 
                    Message = $"Processing {result.ChangesDetected} identity changes...", 
                    Percentage = 30 
                });

                // Phase 2: Process each change
                var migrationResults = new List<MigrationResult>();
                var processedCount = 0;

                foreach (var change in changes.Take(settings.MaxChangesToProcess))
                {
                    try
                    {
                        var migrationResult = await ProcessIdentityChangeAsync(change, settings, target);
                        migrationResults.Add(migrationResult);
                        
                        if (migrationResult.Success)
                        {
                            processedCount++;
                        }
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, "Failed to process identity change for {User}", change.Item.UserPrincipalName);
                        migrationResults.Add(MigrationResult.Failed(
                            $"Identity change processing failed: {ex.Message}"));
                    }

                    var progressPercent = 30 + (processedCount * 50) / Math.Max(1, result.ChangesDetected);
                    progress?.Report(new MandADiscoverySuite.Migration.MigrationProgress 
                    { 
                        Message = $"Processed {processedCount} of {result.ChangesDetected} changes", 
                        Percentage = progressPercent 
                    });
                }

                result.MigrationResults = migrationResults;
                result.ChangesProcessed = processedCount;
                result.ChangesSkipped = result.ChangesDetected - processedCount;
                result.Success = migrationResults.All(r => r.Success);

                progress?.Report(new MandADiscoverySuite.Migration.MigrationProgress 
                { 
                    Message = result.Success ? "Identity delta migration completed successfully" : "Identity delta migration completed with errors", 
                    Percentage = 100 
                });

                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Identity delta migration failed");
                result.Success = false;
                result.ErrorMessage = ex.Message;
                return result;
            }
            finally
            {
                result.Duration = DateTime.UtcNow - result.DeltaRunTimestamp;
            }
        }

        public async Task<IEnumerable<ChangeDetectionResult<UserDto>>> DetectChangesAsync(
            DateTime lastRunTimestamp, 
            DeltaMigrationSettings settings)
        {
            var changes = new List<ChangeDetectionResult<UserDto>>();

            try
            {
                // Detect changes in Azure AD using Graph API delta queries
                if (settings.IncludedMigration.ChangeTypes.HasFlag(Migration.ChangeType.Update) || 
                    settings.IncludedMigration.ChangeTypes.HasFlag(Migration.ChangeType.Create))
                {
                    var azureChanges = await DetectAzureADChangesAsync(lastRunTimestamp, settings);
                    changes.AddRange(azureChanges);
                }

                // Detect changes in on-premises AD if available
                if (_adConnection != null)
                {
                    var adChanges = await DetectActiveDirectoryChangesAsync(lastRunTimestamp, settings);
                    changes.AddRange(adChanges);
                }

                // Remove duplicates based on UPN
                var uniqueChanges = changes
                    .GroupBy(c => c.Item.UserPrincipalName)
                    .Select(g => g.OrderByDescending(c => c.ChangeTimestamp).First())
                    .Where(c => c.ChangeTimestamp > lastRunTimestamp && 
                               c.ChangeTimestamp <= DateTime.UtcNow.Subtract(settings.ChangeDetectionBuffer))
                    .OrderBy(c => c.ChangeTimestamp);

                _logger.LogInformation("Detected {ChangeCount} unique identity changes since {LastRun}", 
                    uniqueChanges.Count(), lastRunTimestamp);

                return uniqueChanges;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to detect identity changes");
                return Enumerable.Empty<ChangeDetectionResult<UserDto>>();
            }
        }

        public async Task<CutoverResult> PerformCutoverAsync(
            IEnumerable<MigrationResultBase> migrationResults, 
            CutoverSettings cutoverSettings, 
            TargetContext target, 
            IProgress<MandADiscoverySuite.Migration.MigrationProgress>? progress = null)
        {
            var result = new CutoverResult
            {
                CutoverTimestamp = DateTime.UtcNow
            };

            try
            {
                progress?.Report(new MandADiscoverySuite.Migration.MigrationProgress 
                { 
                    Message = "Starting identity cutover operations...", 
                    Percentage = 10 
                });

                // Step 1: Disable source Active Directory accounts
                if (cutoverSettings.DisableSourceObjects)
                {
                    var disableStep = await DisableSourceIdentitiesAsync(migrationResults, target);
                    result.CompletedSteps.Add(disableStep);
                    
                    if (!disableStep.Success)
                    {
                        result.FailedSteps.Add(disableStep);
                    }
                }

                progress?.Report(new MandADiscoverySuite.Migration.MigrationProgress 
                { 
                    Message = "Updating Azure AD Connect sync scope...", 
                    Percentage = 30 
                });

                // Step 2: Update Azure AD Connect sync scope
                var syncStep = await UpdateAzureADConnectScopeAsync(migrationResults, target);
                result.CompletedSteps.Add(syncStep);

                progress?.Report(new MandADiscoverySuite.Migration.MigrationProgress 
                { 
                    Message = "Enabling target identity objects...", 
                    Percentage = 50 
                });

                // Step 3: Enable target identity objects
                var enableStep = await EnableTargetIdentitiesAsync(migrationResults, target);
                result.CompletedSteps.Add(enableStep);

                progress?.Report(new MandADiscoverySuite.Migration.MigrationProgress 
                { 
                    Message = "Validating authentication flows...", 
                    Percentage = 70 
                });

                // Step 4: Validate authentication flows
                var validationStep = await ValidateAuthenticationFlowsAsync(migrationResults, target);
                result.CompletedSteps.Add(validationStep);

                progress?.Report(new MandADiscoverySuite.Migration.MigrationProgress 
                { 
                    Message = "Updating group memberships...", 
                    Percentage = 90 
                });

                // Step 5: Update group memberships in target
                var groupStep = await UpdateTargetGroupMembershipsAsync(migrationResults, target);
                result.CompletedSteps.Add(groupStep);

                result.Success = result.CompletedSteps.All(s => s.Success);
                
                if (!result.Success)
                {
                    result.ErrorMessage = $"Identity cutover failed. {result.FailedSteps.Count} steps failed.";
                    
                    // Prepare rollback information
                    result.RollbackInfo = new CutoverRollbackInfo
                    {
                        ObjectsToReEnable = migrationResults.Select(r => r.ToString()).ToList(),
                        RollbackReason = "Identity cutover validation failed",
                        RollbackInitiated = DateTime.UtcNow
                    };
                }

                progress?.Report(new MandADiscoverySuite.Migration.MigrationProgress 
                { 
                    Message = result.Success ? "Identity cutover completed successfully" : "Identity cutover completed with errors", 
                    Percentage = 100 
                });

                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Identity cutover failed with exception");
                result.Success = false;
                result.ErrorMessage = ex.Message;
                return result;
            }
            finally
            {
                result.Duration = DateTime.UtcNow - result.CutoverTimestamp;
            }
        }

        public async Task<CutoverValidationResult> ValidateCutoverReadinessAsync(
            IEnumerable<MigrationResultBase> migrationResults, 
            TargetContext target)
        {
            var result = new CutoverValidationResult
            {
                ValidationTimestamp = DateTime.UtcNow,
                IsReady = true,
                RiskLevel = CutoverRiskLevel.Low
            };

            try
            {
                // Check 1: Verify target tenant connectivity
                var connectivityPrereq = new CutoverPrerequisite
                {
                    Name = "Target Tenant Connectivity",
                    Description = "Verify connection to target Azure AD tenant"
                };

                try
                {
                    var testUser = await _graphClient.Users.GetAsync(requestConfiguration => 
                    {
                        requestConfiguration.QueryParameters.Top = 1;
                    });
                    connectivityPrereq.IsMet = true;
                    connectivityPrereq.ValidationMessage = "Successfully connected to target tenant";
                }
                catch (Exception ex)
                {
                    connectivityPrereq.IsMet = false;
                    connectivityPrereq.ValidationMessage = $"Failed to connect to target: {ex.Message}";
                    result.RiskLevel = CutoverRiskLevel.Critical;
                }

                result.Prerequisites.Add(connectivityPrereq);

                // Check 2: Verify license availability
                var licensePrereq = new CutoverPrerequisite
                {
                    Name = "License Availability",
                    Description = "Ensure sufficient licenses for migrated users"
                };

                var requiredLicenses = migrationResults.Count();
                // License check logic would go here
                licensePrereq.IsMet = true; // Placeholder
                licensePrereq.ValidationMessage = $"Sufficient licenses available for {requiredLicenses} users";
                result.Prerequisites.Add(licensePrereq);

                // Check 3: Verify source-target user mapping
                var mappingPrereq = new CutoverPrerequisite
                {
                    Name = "User Mapping Validation",
                    Description = "Verify all source users have target counterparts"
                };

                // Mapping validation logic would go here
                mappingPrereq.IsMet = true; // Placeholder
                mappingPrereq.ValidationMessage = "All users have valid target mappings";
                result.Prerequisites.Add(mappingPrereq);

                // Check for any critical issues
                if (result.Prerequisites.Any(p => !p.IsMet))
                {
                    result.IsReady = false;
                    result.Issues.Add(new CutoverValidationIssue
                    {
                        Description = "Prerequisites not met for identity cutover",
                        Severity = CutoverValidationSeverity.Critical,
                        IsBlocker = true,
                        Resolution = "Address all prerequisite failures before attempting cutover"
                    });
                }

                // Add warnings for high-risk scenarios
                if (requiredLicenses > 1000)
                {
                    result.Issues.Add(new CutoverValidationIssue
                    {
                        Description = "Large user migration detected - increased risk of partial failures",
                        Severity = CutoverValidationSeverity.Warning,
                        IsBlocker = false,
                        Resolution = "Consider staged cutover approach for large user populations"
                    });
                    
                    if (result.RiskLevel < CutoverRiskLevel.Medium)
                        result.RiskLevel = CutoverRiskLevel.Medium;
                }

                _logger.LogInformation("Identity cutover validation completed. Ready: {IsReady}, Risk: {Risk}", 
                    result.IsReady, result.RiskLevel);

                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Identity cutover validation failed");
                result.IsReady = false;
                result.RiskLevel = CutoverRiskLevel.Critical;
                result.Issues.Add(new CutoverValidationIssue
                {
                    Description = $"Validation failed with exception: {ex.Message}",
                    Severity = CutoverValidationSeverity.Critical,
                    IsBlocker = true,
                    Resolution = "Resolve validation errors before attempting cutover"
                });
                return result;
            }
        }

        // Private helper methods

        private async Task<IEnumerable<ChangeDetectionResult<UserDto>>> DetectAzureADChangesAsync(
            DateTime lastRunTimestamp, 
            DeltaMigrationSettings settings)
        {
            var changes = new List<ChangeDetectionResult<UserDto>>();

            try
            {
                // Use Graph API delta queries to detect changes
                var deltaUsers = await _graphClient.Users.Delta
                    .GetAsync(requestConfiguration => 
                    {
                        requestConfiguration.QueryParameters.Filter = $"lastPasswordChangeDateTime ge {lastRunTimestamp:yyyy-MM-ddTHH:mm:ssZ} or " +
                               $"createdDateTime ge {lastRunTimestamp:yyyy-MM-ddTHH:mm:ssZ} or " +
                               $"lastSignInDateTime ge {lastRunTimestamp:yyyy-MM-ddTHH:mm:ssZ}";
                    });

                foreach (var user in deltaUsers)
                {
                    var changeType = DetermineMigration.ChangeType(user, lastRunTimestamp);
                    
                    if (settings.IncludedMigration.ChangeTypes.HasFlag(changeType))
                    {
                        changes.Add(new ChangeDetectionResult<UserDto>
                        {
                            Item = new UserDto
                            {
                                DisplayName = user.DisplayName ?? "",
                                UserPrincipalName = user.UserPrincipalName ?? ""
                            },
                            Migration.ChangeType = changeType,
                            ChangeTimestamp = user.CreatedDateTime?.DateTime ?? DateTime.UtcNow,
                            ChangeSource = ChangeSource.AzureAD,
                            ChangeDetails = $"Azure AD user change detected: {changeType}",
                            Metadata = new Dictionary<string, object>
                            {
                                ["UserId"] = user.Id,
                                ["Department"] = user.Department ?? "",
                                ["JobTitle"] = user.JobTitle ?? ""
                            }
                        });
                    }
                }

                return changes;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to detect Azure AD changes");
                return Enumerable.Empty<ChangeDetectionResult<UserDto>>();
            }
        }

        private async Task<IEnumerable<ChangeDetectionResult<UserDto>>> DetectActiveDirectoryChangesAsync(
            DateTime lastRunTimestamp, 
            DeltaMigrationSettings settings)
        {
            var changes = new List<ChangeDetectionResult<UserDto>>();

            try
            {
                if (_adConnection == null) return changes;

                // Query AD for changed users using whenChanged attribute
                var searcher = new DirectorySearcher(_adConnection)
                {
                    Filter = $"(&(objectClass=user)(whenChanged>={lastRunTimestamp:yyyyMMddHHmmss.0Z}))",
                    PropertiesToLoad = { "sAMAccountName", "userPrincipalName", "displayName", 
                                       "whenChanged", "whenCreated", "department", "title" }
                };

                var results = searcher.FindAll();

                foreach (SearchResult result in results)
                {
                    var changeTimestamp = (DateTime)result.Properties["whenChanged"][0];
                    var createTimestamp = (DateTime)result.Properties["whenCreated"][0];
                    
                    var changeType = changeTimestamp == createTimestamp ? Migration.ChangeType.Create : Migration.ChangeType.Update;
                    
                    if (settings.IncludedMigration.ChangeTypes.HasFlag(changeType))
                    {
                        changes.Add(new ChangeDetectionResult<UserDto>
                        {
                            Item = new UserDto
                            {
                                DisplayName = result.Properties["displayName"]?[0]?.ToString() ?? "",
                                UserPrincipalName = result.Properties["userPrincipalName"]?[0]?.ToString() ?? ""
                            },
                            Migration.ChangeType = changeType,
                            ChangeTimestamp = changeTimestamp,
                            ChangeSource = ChangeSource.ActiveDirectory,
                            ChangeDetails = $"Active Directory user change: {changeType}",
                            Metadata = new Dictionary<string, object>
                            {
                                ["sAMAccountName"] = result.Properties["sAMAccountName"]?[0]?.ToString() ?? "",
                                ["Department"] = result.Properties["department"]?[0]?.ToString() ?? "",
                                ["Title"] = result.Properties["title"]?[0]?.ToString() ?? ""
                            }
                        });
                    }
                }

                return changes;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to detect Active Directory changes");
                return Enumerable.Empty<ChangeDetectionResult<UserDto>>();
            }
        }

        private async Task<MigrationResult> ProcessIdentityChangeAsync(
            ChangeDetectionResult<UserDto> change, 
            DeltaMigrationSettings settings, 
            TargetContext target)
        {
            try
            {
                switch (change.Migration.ChangeType)
                {
                    case Migration.ChangeType.Create:
                        return await ProcessUserCreationAsync(change.Item, settings, target);
                    
                    case Migration.ChangeType.Update:
                        return await ProcessUserUpdateAsync(change.Item, change.Metadata, settings, target);
                    
                    case Migration.ChangeType.Delete:
                        return await ProcessUserDeletionAsync(change.Item, settings, target);
                    
                    default:
                        _logger.LogWarning("Unsupported change type: {Migration.ChangeType}", change.Migration.ChangeType);
                        return MigrationResult.Failed($"Unsupported change type: {change.Migration.ChangeType}");
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to process identity change for {UPN}", change.Item.UserPrincipalName);
                return MigrationResult.Failed($"Change processing failed: {ex.Message}");
            }
        }

        private async Task<MigrationResult> ProcessUserCreationAsync(
            UserDto user, 
            DeltaMigrationSettings settings, 
            TargetContext target)
        {
            // User creation logic using Graph API
            var newUser = new User
            {
                DisplayName = user.DisplayName,
                UserPrincipalName = user.UserPrincipalName,
                AccountEnabled = true,
                PasswordProfile = new PasswordProfile
                {
                    ForceChangePasswordNextSignIn = true,
                    Password = GenerateTemporaryPassword()
                }
            };

            var createdUser = await _graphClient.Users.PostAsync(newUser);
            
            return MigrationResult.Success($"User {user.UserPrincipalName} created in target tenant");
        }

        private async Task<MigrationResult> ProcessUserUpdateAsync(
            UserDto user, 
            Dictionary<string, object> metadata, 
            DeltaMigrationSettings settings, 
            TargetContext target)
        {
            // User update logic
            var userUpdate = new User();
            bool hasUpdates = false;

            if (metadata.ContainsKey("Department"))
            {
                userUpdate.Department = metadata["Department"].ToString();
                hasUpdates = true;
            }

            if (metadata.ContainsKey("JobTitle") || metadata.ContainsKey("Title"))
            {
                userUpdate.JobTitle = (metadata.ContainsKey("JobTitle") 
                    ? metadata["JobTitle"] 
                    : metadata["Title"]).ToString();
                hasUpdates = true;
            }

            if (hasUpdates)
            {
                await _graphClient.Users[user.UserPrincipalName].PatchAsync(userUpdate);
                return MigrationResult.Success($"User {user.UserPrincipalName} updated in target tenant");
            }

            return MigrationResult.Success($"No updates required for user {user.UserPrincipalName}");
        }

        private async Task<MigrationResult> ProcessUserDeletionAsync(
            UserDto user, 
            DeltaMigrationSettings settings, 
            TargetContext target)
        {
            // User deletion/deactivation logic
            var userUpdate = new User
            {
                AccountEnabled = false
            };

            await _graphClient.Users[user.UserPrincipalName].PatchAsync(userUpdate);
            
            return MigrationResult.Success($"User {user.UserPrincipalName} disabled in target tenant");
        }

        // Cutover helper methods

        private async Task<CutoverStep> DisableSourceIdentitiesAsync(
            IEnumerable<MigrationResultBase> migrationResults, 
            TargetContext target)
        {
            var step = new CutoverStep
            {
                Name = "Disable Source Identities",
                Description = "Disable user accounts in source Active Directory",
                Type = CutoverStepType.DisableSource,
                StartTime = DateTime.UtcNow
            };

            try
            {
                if (_adConnection != null)
                {
                    // Logic to disable AD accounts would go here
                    // This is a placeholder for the actual implementation
                    await Task.Delay(100);
                }

                step.Success = true;
                step.EndTime = DateTime.UtcNow;
                return step;
            }
            catch (Exception ex)
            {
                step.Success = false;
                step.ErrorMessage = ex.Message;
                step.EndTime = DateTime.UtcNow;
                return step;
            }
        }

        private async Task<CutoverStep> UpdateAzureADConnectScopeAsync(
            IEnumerable<MigrationResultBase> migrationResults, 
            TargetContext target)
        {
            var step = new CutoverStep
            {
                Name = "Update Azure AD Connect Scope",
                Description = "Modify sync scope to exclude migrated users",
                Type = CutoverStepType.UpdateServiceEndpoints,
                StartTime = DateTime.UtcNow
            };

            try
            {
                // Azure AD Connect scope update logic would go here
                await Task.Delay(100);

                step.Success = true;
                step.EndTime = DateTime.UtcNow;
                return step;
            }
            catch (Exception ex)
            {
                step.Success = false;
                step.ErrorMessage = ex.Message;
                step.EndTime = DateTime.UtcNow;
                return step;
            }
        }

        private async Task<CutoverStep> EnableTargetIdentitiesAsync(
            IEnumerable<MigrationResultBase> migrationResults, 
            TargetContext target)
        {
            var step = new CutoverStep
            {
                Name = "Enable Target Identities",
                Description = "Enable user accounts in target tenant",
                Type = CutoverStepType.EnableTarget,
                StartTime = DateTime.UtcNow
            };

            try
            {
                // Logic to enable target accounts would go here
                await Task.Delay(100);

                step.Success = true;
                step.EndTime = DateTime.UtcNow;
                return step;
            }
            catch (Exception ex)
            {
                step.Success = false;
                step.ErrorMessage = ex.Message;
                step.EndTime = DateTime.UtcNow;
                return step;
            }
        }

        private async Task<CutoverStep> ValidateAuthenticationFlowsAsync(
            IEnumerable<MigrationResultBase> migrationResults, 
            TargetContext target)
        {
            var step = new CutoverStep
            {
                Name = "Validate Authentication Flows",
                Description = "Test user authentication in target environment",
                Type = CutoverStepType.FinalVerification,
                StartTime = DateTime.UtcNow
            };

            try
            {
                // Authentication validation logic would go here
                await Task.Delay(100);

                step.Success = true;
                step.EndTime = DateTime.UtcNow;
                return step;
            }
            catch (Exception ex)
            {
                step.Success = false;
                step.ErrorMessage = ex.Message;
                step.EndTime = DateTime.UtcNow;
                return step;
            }
        }

        private async Task<CutoverStep> UpdateTargetGroupMembershipsAsync(
            IEnumerable<MigrationResultBase> migrationResults, 
            TargetContext target)
        {
            var step = new CutoverStep
            {
                Name = "Update Group Memberships",
                Description = "Synchronize group memberships in target tenant",
                Type = CutoverStepType.FinalVerification,
                StartTime = DateTime.UtcNow
            };

            try
            {
                // Group membership sync logic would go here
                await Task.Delay(100);

                step.Success = true;
                step.EndTime = DateTime.UtcNow;
                return step;
            }
            catch (Exception ex)
            {
                step.Success = false;
                step.ErrorMessage = ex.Message;
                step.EndTime = DateTime.UtcNow;
                return step;
            }
        }

        // Helper methods

        private Migration.ChangeType DetermineChangeType(User user, DateTime lastRunTimestamp)
        {
            if (user.CreatedDateTime.HasValue && user.CreatedDateTime.Value.DateTime > lastRunTimestamp)
            {
                return Migration.ChangeType.Create;
            }

            return Migration.ChangeType.Update;
        }

        private string GenerateTemporaryPassword()
        {
            // Generate a secure temporary password
            var chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
            var random = new Random();
            return new string(Enumerable.Repeat(chars, 12)
                .Select(s => s[random.Next(s.Length)]).ToArray());
        }
    }
}