using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using Microsoft.Graph;
using MandADiscoverySuite.Models;
using MandADiscoverySuite.Models.Identity;
using MandADiscoverySuite.Models.Migration;
using MandADiscoverySuite.Migration;

namespace MandADiscoverySuite.Services.Migration
{
    /// <summary>
    /// Conflict resolution service for T-041: User Account Migration and Synchronization
    /// Handles user account conflicts during migration with multiple resolution strategies
    /// </summary>
    public class ConflictResolutionService
    {
        private readonly ILogger<ConflictResolutionService> _logger;
        private readonly GraphServiceClient _graphServiceClient;
        private readonly Dictionary<string, Func<UserProfileItem, UserConflict, MigrationContext, Task<ConflictResolutionResult>>> _resolutionStrategies;

        public ConflictResolutionService(
            ILogger<ConflictResolutionService> logger,
            GraphServiceClient graphServiceClient)
        {
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
            _graphServiceClient = graphServiceClient ?? throw new ArgumentNullException(nameof(graphServiceClient));
            
            // Initialize resolution strategies
            _resolutionStrategies = new Dictionary<string, Func<UserProfileItem, UserConflict, MigrationContext, Task<ConflictResolutionResult>>>
            {
                ["UPNConflict"] = ResolveUpnConflictAsync,
                ["EmailConflict"] = ResolveEmailConflictAsync,
                ["SamAccountConflict"] = ResolveSamAccountConflictAsync,
                ["DisplayNameConflict"] = ResolveDisplayNameConflictAsync,
                ["MultipleConflicts"] = ResolveMultipleConflictsAsync
            };
        }

        /// <summary>
        /// Resolve user conflicts before migration
        /// </summary>
        public async Task<ConflictResolutionResult> ResolveUserConflictAsync(
            UserProfileItem user,
            MigrationContext context,
            CancellationToken cancellationToken = default)
        {
            var result = new ConflictResolutionResult
            {
                StartTime = DateTime.Now,
                SessionId = context.SessionId
            };

            try
            {
                _logger.LogInformation($"Starting conflict resolution for user: {user.UserPrincipalName}");

                // Step 1: Detect all potential conflicts
                var conflicts = await DetectUserConflictsAsync(user, context, cancellationToken);
                result.DetectedConflicts = conflicts;

                if (!conflicts.Any())
                {
                    // No conflicts - direct creation
                    result.IsSuccess = true;
                    result.RecommendedAction = "DirectCreation";
                    result.ResolutionStrategy = "NoConflicts";
                    result.ConflictResolutionApplied = false;
                    result.ResolvedUserPrincipalName = user.UserPrincipalName;
                    result.ResolvedSamAccountName = user.SamAccountName;
                    result.ResolvedEmailAddress = user.Attributes.GetValueOrDefault("mail", user.UserPrincipalName);
                    
                    _logger.LogInformation($"No conflicts detected for user: {user.UserPrincipalName}");
                    return result;
                }

                // Step 2: Categorize conflicts
                var conflictCategories = CategorizeConflicts(conflicts);
                var primaryConflictType = GetPrimaryConflictType(conflictCategories);

                // Step 3: Apply appropriate resolution strategy
                if (_resolutionStrategies.TryGetValue(primaryConflictType, out var resolutionStrategy))
                {
                    var primaryConflict = conflicts.First(c => c.ConflictType == primaryConflictType);
                    var resolutionResult = await resolutionStrategy(user, primaryConflict, context);
                    
                    // Merge results
                    result.IsSuccess = resolutionResult.IsSuccess;
                    result.RecommendedAction = resolutionResult.RecommendedAction;
                    result.ResolutionStrategy = resolutionResult.ResolutionStrategy;
                    result.ConflictResolutionApplied = resolutionResult.ConflictResolutionApplied;
                    result.ResolvedUserPrincipalName = resolutionResult.ResolvedUserPrincipalName;
                    result.ResolvedSamAccountName = resolutionResult.ResolvedSamAccountName;
                    result.ResolvedEmailAddress = resolutionResult.ResolvedEmailAddress;
                    result.ExistingUserId = resolutionResult.ExistingUserId;
                    result.ConflictType = resolutionResult.ConflictType;
                    result.ResolutionMetadata = resolutionResult.ResolutionMetadata;
                    result.Errors.AddRange(resolutionResult.Errors);
                    result.Warnings.AddRange(resolutionResult.Warnings);
                }
                else
                {
                    // Default to manual resolution
                    result.IsSuccess = false;
                    result.RecommendedAction = "ManualResolution";
                    result.ResolutionStrategy = "RequiresAdministratorIntervention";
                    result.ErrorMessage = $"Complex conflicts detected requiring manual resolution: {string.Join(", ", conflicts.Select(c => c.ConflictType))}";
                }

                _logger.LogInformation($"Conflict resolution completed for {user.UserPrincipalName}: {result.RecommendedAction}");
                return result;
            }
            catch (Exception ex)
            {
                result.IsSuccess = false;
                result.ErrorMessage = ex.Message;
                result.Errors.Add(ex.ToString());
                _logger.LogError(ex, $"Conflict resolution failed for user: {user.UserPrincipalName}");
                return result;
            }
        }

        /// <summary>
        /// Detect potential user conflicts in target environment
        /// </summary>
        private async Task<List<UserConflict>> DetectUserConflictsAsync(
            UserProfileItem user,
            MigrationContext context,
            CancellationToken cancellationToken)
        {
            var conflicts = new List<UserConflict>();

            try
            {
                // Check UPN conflict
                var upnConflict = await CheckUpnConflictAsync(user.UserPrincipalName, cancellationToken);
                if (upnConflict != null)
                {
                    conflicts.Add(upnConflict);
                }

                // Check email conflict (if different from UPN)
                var emailAddress = user.Attributes.GetValueOrDefault("mail", "");
                if (!string.IsNullOrEmpty(emailAddress) && emailAddress != user.UserPrincipalName)
                {
                    var emailConflict = await CheckEmailConflictAsync(emailAddress, cancellationToken);
                    if (emailConflict != null)
                    {
                        conflicts.Add(emailConflict);
                    }
                }

                // Check display name conflicts (less critical)
                if (!string.IsNullOrEmpty(user.DisplayName))
                {
                    var displayNameConflicts = await CheckDisplayNameConflictsAsync(user.DisplayName, cancellationToken);
                    conflicts.AddRange(displayNameConflicts);
                }

                _logger.LogInformation($"Detected {conflicts.Count} conflicts for user {user.UserPrincipalName}");
                return conflicts;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error detecting conflicts for user: {user.UserPrincipalName}");
                throw;
            }
        }

        /// <summary>
        /// Check for UPN conflicts in target tenant
        /// </summary>
        private async Task<UserConflict> CheckUpnConflictAsync(string userPrincipalName, CancellationToken cancellationToken)
        {
            try
            {
                var users = await _graphServiceClient.Users
                    .Request()
                    .Filter($"userPrincipalName eq '{userPrincipalName}'")
                    .Select("id,userPrincipalName,displayName,accountEnabled")
                    .GetAsync(cancellationToken);

                var existingUser = users?.FirstOrDefault();
                if (existingUser != null)
                {
                    return new UserConflict
                    {
                        ConflictType = "UPNConflict",
                        ConflictingValue = userPrincipalName,
                        ExistingUserId = existingUser.Id,
                        ExistingUserPrincipalName = existingUser.UserPrincipalName,
                        Severity = "High",
                        Description = $"User Principal Name '{userPrincipalName}' already exists in target tenant",
                        RecommendedAction = "Rename or use existing account",
                        ResolutionOptions = new List<string> { "RenameAndCreate", "UseExisting", "B2BInvitation" }
                    };
                }

                return null;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error checking UPN conflict for: {userPrincipalName}");
                throw;
            }
        }

        /// <summary>
        /// Check for email conflicts in target tenant
        /// </summary>
        private async Task<UserConflict> CheckEmailConflictAsync(string emailAddress, CancellationToken cancellationToken)
        {
            try
            {
                var users = await _graphServiceClient.Users
                    .Request()
                    .Filter($"mail eq '{emailAddress}' or proxyAddresses/any(x:x eq 'SMTP:{emailAddress}')")
                    .Select("id,userPrincipalName,displayName,mail")
                    .GetAsync(cancellationToken);

                var existingUser = users?.FirstOrDefault();
                if (existingUser != null)
                {
                    return new UserConflict
                    {
                        ConflictType = "EmailConflict",
                        ConflictingValue = emailAddress,
                        ExistingUserId = existingUser.Id,
                        ExistingUserPrincipalName = existingUser.UserPrincipalName,
                        Severity = "Medium",
                        Description = $"Email address '{emailAddress}' already exists in target tenant",
                        RecommendedAction = "Use different email or merge accounts",
                        ResolutionOptions = new List<string> { "AssignAlternateEmail", "UseExisting", "B2BInvitation" }
                    };
                }

                return null;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error checking email conflict for: {emailAddress}");
                throw;
            }
        }

        /// <summary>
        /// Check for display name conflicts (informational)
        /// </summary>
        private async Task<List<UserConflict>> CheckDisplayNameConflictsAsync(string displayName, CancellationToken cancellationToken)
        {
            var conflicts = new List<UserConflict>();

            try
            {
                var users = await _graphServiceClient.Users
                    .Request()
                    .Filter($"displayName eq '{displayName}'")
                    .Select("id,userPrincipalName,displayName")
                    .GetAsync(cancellationToken);

                foreach (var existingUser in users?.ToList() ?? new List<Microsoft.Graph.User>())
                {
                    conflicts.Add(new UserConflict
                    {
                        ConflictType = "DisplayNameConflict",
                        ConflictingValue = displayName,
                        ExistingUserId = existingUser.Id,
                        ExistingUserPrincipalName = existingUser.UserPrincipalName,
                        Severity = "Low",
                        Description = $"Display name '{displayName}' already exists in target tenant",
                        RecommendedAction = "Continue with migration (informational only)",
                        ResolutionOptions = new List<string> { "Continue", "ModifyDisplayName" }
                    });
                }

                return conflicts;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error checking display name conflicts for: {displayName}");
                throw;
            }
        }

        /// <summary>
        /// Categorize conflicts by type and severity
        /// </summary>
        private Dictionary<string, List<UserConflict>> CategorizeConflicts(List<UserConflict> conflicts)
        {
            return conflicts.GroupBy(c => c.ConflictType).ToDictionary(g => g.Key, g => g.ToList());
        }

        /// <summary>
        /// Get primary conflict type for resolution strategy selection
        /// </summary>
        private string GetPrimaryConflictType(Dictionary<string, List<UserConflict>> conflictCategories)
        {
            // Priority order: UPN > Email > SamAccount > DisplayName
            if (conflictCategories.ContainsKey("UPNConflict"))
                return "UPNConflict";
            
            if (conflictCategories.ContainsKey("EmailConflict"))
                return "EmailConflict";
            
            if (conflictCategories.ContainsKey("SamAccountConflict"))
                return "SamAccountConflict";
            
            if (conflictCategories.ContainsKey("DisplayNameConflict"))
                return "DisplayNameConflict";
            
            return "MultipleConflicts";
        }

        #region Resolution Strategy Implementations

        /// <summary>
        /// Resolve UPN conflicts
        /// </summary>
        private async Task<ConflictResolutionResult> ResolveUpnConflictAsync(
            UserProfileItem user,
            UserConflict conflict,
            MigrationContext context)
        {
            await Task.CompletedTask; // Async compliance
            
            var result = new ConflictResolutionResult();
            var resolutionStrategy = context.GetConfiguration("UPNConflictResolution", "RenameAndCreate");

            switch (resolutionStrategy)
            {
                case "RenameAndCreate":
                    var newUpn = GenerateAlternativeUpn(user.UserPrincipalName, context);
                    result.IsSuccess = true;
                    result.RecommendedAction = "RenameAndCreate";
                    result.ResolutionStrategy = "GeneratedAlternativeUPN";
                    result.ConflictResolutionApplied = true;
                    result.ResolvedUserPrincipalName = newUpn;
                    result.ResolvedSamAccountName = ExtractSamAccountFromUpn(newUpn);
                    result.ResolutionMetadata["OriginalUPN"] = user.UserPrincipalName;
                    result.ResolutionMetadata["GeneratedUPN"] = newUpn;
                    break;

                case "UseExisting":
                    result.IsSuccess = true;
                    result.RecommendedAction = "UseExisting";
                    result.ResolutionStrategy = "MergeWithExistingAccount";
                    result.ConflictResolutionApplied = true;
                    result.ExistingUserId = conflict.ExistingUserId;
                    result.ResolvedUserPrincipalName = conflict.ExistingUserPrincipalName;
                    break;

                case "B2BInvitation":
                    result.IsSuccess = true;
                    result.RecommendedAction = "B2BInvitation";
                    result.ResolutionStrategy = "CreateGuestAccount";
                    result.ConflictResolutionApplied = true;
                    result.ResolvedEmailAddress = user.Attributes.GetValueOrDefault("mail", user.UserPrincipalName);
                    break;

                default:
                    result.IsSuccess = false;
                    result.RecommendedAction = "ManualResolution";
                    result.ErrorMessage = $"Unknown UPN conflict resolution strategy: {resolutionStrategy}";
                    break;
            }

            result.ConflictType = "UPNConflict";
            return result;
        }

        /// <summary>
        /// Resolve email conflicts
        /// </summary>
        private async Task<ConflictResolutionResult> ResolveEmailConflictAsync(
            UserProfileItem user,
            UserConflict conflict,
            MigrationContext context)
        {
            await Task.CompletedTask; // Async compliance
            
            var result = new ConflictResolutionResult();
            var resolutionStrategy = context.GetConfiguration("EmailConflictResolution", "AssignAlternateEmail");

            switch (resolutionStrategy)
            {
                case "AssignAlternateEmail":
                    var alternateEmail = GenerateAlternativeEmail(user.Attributes.GetValueOrDefault("mail", user.UserPrincipalName), context);
                    result.IsSuccess = true;
                    result.RecommendedAction = "DirectCreation";
                    result.ResolutionStrategy = "AlternateEmailAssigned";
                    result.ConflictResolutionApplied = true;
                    result.ResolvedUserPrincipalName = user.UserPrincipalName;
                    result.ResolvedEmailAddress = alternateEmail;
                    result.ResolutionMetadata["OriginalEmail"] = user.Attributes.GetValueOrDefault("mail", "");
                    result.ResolutionMetadata["AlternateEmail"] = alternateEmail;
                    break;

                case "UseExisting":
                    result.IsSuccess = true;
                    result.RecommendedAction = "UseExisting";
                    result.ResolutionStrategy = "MergeWithExistingAccount";
                    result.ConflictResolutionApplied = true;
                    result.ExistingUserId = conflict.ExistingUserId;
                    result.ResolvedUserPrincipalName = conflict.ExistingUserPrincipalName;
                    break;

                default:
                    result.IsSuccess = false;
                    result.RecommendedAction = "ManualResolution";
                    result.ErrorMessage = $"Unknown email conflict resolution strategy: {resolutionStrategy}";
                    break;
            }

            result.ConflictType = "EmailConflict";
            return result;
        }

        /// <summary>
        /// Resolve SamAccount conflicts
        /// </summary>
        private async Task<ConflictResolutionResult> ResolveSamAccountConflictAsync(
            UserProfileItem user,
            UserConflict conflict,
            MigrationContext context)
        {
            await Task.CompletedTask; // Async compliance
            
            var result = new ConflictResolutionResult
            {
                IsSuccess = true,
                RecommendedAction = "DirectCreation",
                ResolutionStrategy = "SamAccountIgnored",
                ConflictResolutionApplied = false, // SamAccount not used in Azure AD
                ResolvedUserPrincipalName = user.UserPrincipalName,
                ConflictType = "SamAccountConflict"
            };

            result.ResolutionMetadata["Note"] = "SamAccount conflicts are typically not blocking for Azure AD migrations";
            return result;
        }

        /// <summary>
        /// Resolve display name conflicts
        /// </summary>
        private async Task<ConflictResolutionResult> ResolveDisplayNameConflictAsync(
            UserProfileItem user,
            UserConflict conflict,
            MigrationContext context)
        {
            await Task.CompletedTask; // Async compliance
            
            var result = new ConflictResolutionResult
            {
                IsSuccess = true,
                RecommendedAction = "DirectCreation",
                ResolutionStrategy = "DisplayNameConflictIgnored",
                ConflictResolutionApplied = false, // Display name conflicts are usually acceptable
                ResolvedUserPrincipalName = user.UserPrincipalName,
                ConflictType = "DisplayNameConflict"
            };

            result.ResolutionMetadata["Note"] = "Display name conflicts are informational and typically do not block migration";
            return result;
        }

        /// <summary>
        /// Resolve multiple conflicts
        /// </summary>
        private async Task<ConflictResolutionResult> ResolveMultipleConflictsAsync(
            UserProfileItem user,
            UserConflict conflict,
            MigrationContext context)
        {
            await Task.CompletedTask; // Async compliance
            
            return new ConflictResolutionResult
            {
                IsSuccess = false,
                RecommendedAction = "ManualResolution",
                ResolutionStrategy = "ComplexConflictsRequireIntervention",
                ConflictResolutionApplied = false,
                ConflictType = "MultipleConflicts",
                ErrorMessage = "Multiple conflicts detected requiring administrator review and manual resolution"
            };
        }

        #endregion

        #region Helper Methods

        /// <summary>
        /// Generate alternative UPN when conflicts exist
        /// </summary>
        private string GenerateAlternativeUpn(string originalUpn, MigrationContext context)
        {
            var parts = originalUpn.Split('@');
            var username = parts[0];
            var domain = parts.Length > 1 ? parts[1] : context.Target.DomainName;
            
            // Try different suffixes
            var suffixes = new[] { "1", "2", "3", "_new", "_migrated", DateTime.Now.ToString("MMdd") };
            
            foreach (var suffix in suffixes)
            {
                var candidateUpn = $"{username}{suffix}@{domain}";
                // In a real implementation, you would check if this UPN is available
                // For now, return the first candidate
                return candidateUpn;
            }
            
            return $"{username}_{Guid.NewGuid().ToString("N")[..8]}@{domain}";
        }

        /// <summary>
        /// Generate alternative email address when conflicts exist
        /// </summary>
        private string GenerateAlternativeEmail(string originalEmail, MigrationContext context)
        {
            if (string.IsNullOrEmpty(originalEmail) || !originalEmail.Contains("@"))
                return originalEmail;

            var parts = originalEmail.Split('@');
            var username = parts[0];
            var domain = parts[1];
            
            // Try different suffixes
            var suffixes = new[] { "1", "2", "alt", "new" };
            
            foreach (var suffix in suffixes)
            {
                var candidateEmail = $"{username}.{suffix}@{domain}";
                return candidateEmail; // Return first candidate for simplicity
            }
            
            return originalEmail;
        }

        /// <summary>
        /// Extract SamAccount from UPN
        /// </summary>
        private string ExtractSamAccountFromUpn(string upn)
        {
            return upn.Split('@')[0];
        }

        #endregion
    }
}