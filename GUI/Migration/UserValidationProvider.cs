using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Graph;
using MandADiscoverySuite.Models.Migration;
using MandADiscoverySuite.Services.Migration;

namespace MandADiscoverySuite.Migration
{
    /// <summary>
    /// Validates user migrations and provides rollback functionality.
    /// </summary>
    public class UserValidationProvider : IUserValidationProvider
    {
        private readonly GraphServiceClient? _graphClient;

        public string ObjectType => "User";
        public bool SupportsRollback => true;

        public UserValidationProvider(GraphServiceClient? graphClient = null)
        {
            _graphClient = graphClient;
        }

        public async Task<ValidationResult> ValidateUserAsync(UserDto user, TargetContext target, IProgress<ValidationProgress>? progress = null)
        {
            progress?.Report(new ValidationProgress 
            { 
                CurrentStep = $"Validating user {user.DisplayName}",
                StatusMessage = "Checking target account existence and attributes"
            });

            var issues = new List<ValidationIssue>();
            
            try
            {
                // Validate target account exists
                await ValidateAccountExistence(user, target, issues);
                
                // Validate licensing
                await ValidateLicensing(user, target, issues);
                
                // Validate attributes
                await ValidateAttributes(user, target, issues);
                
                // Validate group memberships
                await ValidateGroupMemberships(user, target, issues);
                
                // Validate mail properties
                await ValidateMailProperties(user, target, issues);

                progress?.Report(new ValidationProgress 
                { 
                    CurrentStep = $"Validation complete for {user.DisplayName}",
                    StatusMessage = $"Found {issues.Count} validation issues",
                    PercentageComplete = 100
                });

                var severity = DetermineSeverity(issues);
                var message = issues.Count == 0 
                    ? "User validation passed successfully" 
                    : $"User validation completed with {issues.Count} issues";

                var result = new ValidationResult
                {
                    ValidatedObject = user,
                    ObjectType = ObjectType,
                    ObjectName = user.DisplayName,
                    Severity = severity,
                    Message = message
                };
                result.Issues.AddRange(issues);
                return result;
            }
            catch (Exception ex)
            {
                issues.Add(new ValidationIssue
                {
                    Severity = ValidationSeverity.Critical,
                    Category = "System Error",
                    Description = $"Failed to validate user: {ex.Message}",
                    RecommendedAction = "Check network connectivity and Graph API permissions",
                    TechnicalDetails = ex.ToString()
                });

                return ValidationResult.Failed(user, ObjectType, user.DisplayName, 
                    "User validation failed due to system error", issues);
            }
        }

        private async Task ValidateAccountExistence(UserDto user, TargetContext target, List<ValidationIssue> issues)
        {
            if (_graphClient == null)
            {
                issues.Add(new ValidationIssue
                {
                    Severity = ValidationSeverity.Warning,
                    Category = "Configuration",
                    Description = "Graph client not configured - cannot verify target account existence",
                    RecommendedAction = "Configure Graph API client for comprehensive validation"
                });
                return;
            }

            try
            {
                var targetUser = await _graphClient.Users[user.UserPrincipalName]
                    .GetAsync();

                if (targetUser == null)
                {
                    issues.Add(new ValidationIssue
                    {
                        Severity = ValidationSeverity.Error,
                        Category = "Account Existence",
                        Description = $"Target account {user.UserPrincipalName} was not found",
                        RecommendedAction = "Verify the migration completed successfully and the account was created"
                    });
                }
                else if (targetUser.AccountEnabled != true)
                {
                    issues.Add(new ValidationIssue
                    {
                        Severity = ValidationSeverity.Error,
                        Category = "Account Status",
                        Description = "Target account exists but is disabled",
                        RecommendedAction = "Enable the target account to complete the migration"
                    });
                }
            }
            catch (ServiceException ex) when (ex.ResponseStatusCode == 404)
            {
                issues.Add(new ValidationIssue
                {
                    Severity = ValidationSeverity.Error,
                    Category = "Account Existence",
                    Description = $"Target account {user.UserPrincipalName} was not found in target tenant",
                    RecommendedAction = "Verify the user migration completed successfully"
                });
            }
        }

        private async Task ValidateLicensing(UserDto user, TargetContext target, List<ValidationIssue> issues)
        {
            if (_graphClient == null) return;

            try
            {
                var targetUser = await _graphClient.Users[user.UserPrincipalName]
                    .GetAsync(requestConfiguration => requestConfiguration.QueryParameters.Select = new[] { "assignedLicenses", "licenseAssignmentStates" });

                if (targetUser?.AssignedLicenses == null || !targetUser.AssignedLicenses.Any())
                {
                    issues.Add(new ValidationIssue
                    {
                        Severity = ValidationSeverity.Warning,
                        Category = "Licensing",
                        Description = "Target user has no assigned licenses",
                        RecommendedAction = "Assign appropriate licenses to enable full functionality"
                    });
                }

                // Check for license assignment errors
                if (targetUser?.LicenseAssignmentStates != null)
                {
                    foreach (var licenseState in targetUser.LicenseAssignmentStates)
                    {
                        if (licenseState.Error != null)
                        {
                            issues.Add(new ValidationIssue
                            {
                                Severity = ValidationSeverity.Error,
                                Category = "Licensing",
                                Description = $"License assignment error: {licenseState.Error}",
                                RecommendedAction = "Review and fix license assignment issues"
                            });
                        }
                    }
                }
            }
            catch (ServiceException ex)
            {
                issues.Add(new ValidationIssue
                {
                    Severity = ValidationSeverity.Warning,
                    Category = "Licensing",
                    Description = $"Could not validate licensing: {ex.Message}",
                    RecommendedAction = "Manually verify user licensing in target tenant"
                });
            }
        }

        private async Task ValidateAttributes(UserDto user, TargetContext target, List<ValidationIssue> issues)
        {
            if (_graphClient == null) return;

            try
            {
                var targetUser = await _graphClient.Users[user.UserPrincipalName]
                    .GetAsync(requestConfiguration => requestConfiguration.QueryParameters.Select = new[] { "displayName", "mail", "userPrincipalName", "jobTitle", "department", "officeLocation" });

                // Validate display name matches
                if (!string.Equals(targetUser?.DisplayName, user.DisplayName, StringComparison.OrdinalIgnoreCase))
                {
                    issues.Add(new ValidationIssue
                    {
                        Severity = ValidationSeverity.Warning,
                        Category = "Attributes",
                        Description = $"Display name mismatch - Expected: {user.DisplayName}, Found: {targetUser?.DisplayName}",
                        RecommendedAction = "Update display name to match source user"
                    });
                }

                // Validate UPN
                if (!string.Equals(targetUser?.UserPrincipalName, user.UserPrincipalName, StringComparison.OrdinalIgnoreCase))
                {
                    issues.Add(new ValidationIssue
                    {
                        Severity = ValidationSeverity.Error,
                        Category = "Attributes",
                        Description = $"UPN mismatch - Expected: {user.UserPrincipalName}, Found: {targetUser?.UserPrincipalName}",
                        RecommendedAction = "This indicates a serious migration issue - verify target account"
                    });
                }
            }
            catch (ServiceException ex)
            {
                issues.Add(new ValidationIssue
                {
                    Severity = ValidationSeverity.Warning,
                    Category = "Attributes",
                    Description = $"Could not validate attributes: {ex.Message}",
                    RecommendedAction = "Manually verify user attributes in target tenant"
                });
            }
        }

        private async Task ValidateGroupMemberships(UserDto user, TargetContext target, List<ValidationIssue> issues)
        {
            if (_graphClient == null) return;

            try
            {
                var memberOf = await _graphClient.Users[user.UserPrincipalName]
                    .MemberOf
                    .GetAsync();

                if (memberOf?.Value?.Count == 0)
                {
                    issues.Add(new ValidationIssue
                    {
                        Severity = ValidationSeverity.Warning,
                        Category = "Group Memberships",
                        Description = "User is not a member of any groups in target tenant",
                        RecommendedAction = "Verify group memberships match source environment"
                    });
                }
            }
            catch (ServiceException ex)
            {
                issues.Add(new ValidationIssue
                {
                    Severity = ValidationSeverity.Warning,
                    Category = "Group Memberships", 
                    Description = $"Could not validate group memberships: {ex.Message}",
                    RecommendedAction = "Manually verify group memberships in target tenant"
                });
            }
        }

        private async Task ValidateMailProperties(UserDto user, TargetContext target, List<ValidationIssue> issues)
        {
            if (_graphClient == null) return;

            try
            {
                var targetUser = await _graphClient.Users[user.UserPrincipalName]
                    .GetAsync(requestConfiguration => requestConfiguration.QueryParameters.Select = new[] { "mail", "mailNickname", "proxyAddresses" });

                if (string.IsNullOrEmpty(targetUser?.Mail))
                {
                    issues.Add(new ValidationIssue
                    {
                        Severity = ValidationSeverity.Warning,
                        Category = "Mail Properties",
                        Description = "Target user has no mail address configured",
                        RecommendedAction = "Configure mail address if email services are required"
                    });
                }
            }
            catch (ServiceException ex)
            {
                issues.Add(new ValidationIssue
                {
                    Severity = ValidationSeverity.Warning,
                    Category = "Mail Properties",
                    Description = $"Could not validate mail properties: {ex.Message}",
                    RecommendedAction = "Manually verify mail configuration in target tenant"
                });
            }
        }

        private ValidationSeverity DetermineSeverity(List<ValidationIssue> issues)
        {
            foreach (var issue in issues)
            {
                if (issue.Severity == ValidationSeverity.Critical)
                    return ValidationSeverity.Critical;
            }

            foreach (var issue in issues)
            {
                if (issue.Severity == ValidationSeverity.Error)
                    return ValidationSeverity.Error;
            }

            foreach (var issue in issues)
            {
                if (issue.Severity == ValidationSeverity.Warning)
                    return ValidationSeverity.Warning;
            }

            return ValidationSeverity.Success;
        }

        public async Task<RollbackResult> RollbackUserAsync(UserDto user, TargetContext target, IProgress<ValidationProgress>? progress = null)
        {
            progress?.Report(new ValidationProgress
            {
                CurrentStep = $"Rolling back user {user.DisplayName}",
                StatusMessage = "Disabling target account and cleaning up resources"
            });

            var errors = new List<string>();
            var warnings = new List<string>();

            try
            {
                if (_graphClient == null)
                {
                    errors.Add("Graph client not configured - cannot perform rollback");
                    return RollbackResult.Failed("Rollback failed due to missing Graph client", string.Join("; ", errors));
                }

                // Disable the target account
                var updateUser = new Microsoft.Graph.Models.User
                {
                    AccountEnabled = false
                };

                await _graphClient.Users[user.UserPrincipalName]
                    .PatchAsync(updateUser);

                progress?.Report(new ValidationProgress
                {
                    CurrentStep = $"Disabled target account for {user.DisplayName}",
                    StatusMessage = "Removing group memberships",
                    PercentageComplete = 50
                });

                // Remove from groups (optional - commented out to prevent accidental data loss)
                /*
                var memberOf = await _graphClient.Users[user.UserPrincipalName].MemberOf.GetAsync();
                foreach (var group in memberOf.OfType<Group>())
                {
                    try
                    {
                        await _graphClient.Groups[group.Id].Members[user.UserPrincipalName].Ref.DeleteAsync();
                    }
                    catch (ServiceException ex)
                    {
                        warnings.Add($"Could not remove user from group {group.DisplayName}: {ex.Message}");
                    }
                }
                */

                progress?.Report(new ValidationProgress
                {
                    CurrentStep = $"Rollback complete for {user.DisplayName}",
                    StatusMessage = "Target account disabled successfully",
                    PercentageComplete = 100
                });

                var message = warnings.Count > 0 
                    ? $"Rollback completed with {warnings.Count} warnings"
                    : "User rollback completed successfully";

                var result = new RollbackResult
                {
                    IsSuccess = true,
                    Message = message
                };
                result.Warnings.AddRange(warnings);
                return result;
            }
            catch (ServiceException ex)
            {
                errors.Add($"Graph API error during rollback: {ex.Message}");
                return RollbackResult.Failed($"Rollback failed: {ex.Message}", string.Join("; ", errors));
            }
            catch (Exception ex)
            {
                errors.Add($"Unexpected error during rollback: {ex.Message}");
                return RollbackResult.Failed($"Rollback failed: {ex.Message}", string.Join("; ", errors));
            }
        }
    }
}