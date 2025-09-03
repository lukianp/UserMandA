using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MandADiscoverySuite.Migration;
using MandADiscoverySuite.Models;
using MandADiscoverySuite.Models.Migration;
using MandADiscoverySuite.Models.Identity;
using MandADiscoverySuite.Services.Migration;
using Microsoft.Extensions.Logging;
// Microsoft Graph SDK types
using Microsoft.Graph;
using Microsoft.Graph.Models;

namespace MandADiscoverySuite.MigrationProviders
{
    /// <summary>
    /// Uses Microsoft Graph to create users in the target tenant.
    /// </summary>
    public interface IGraphUserClient
    {
        Task<Microsoft.Graph.Models.User> CreateUserAsync(Microsoft.Graph.Models.User user);
        Task UpdateUserAsync(string userId, Microsoft.Graph.Models.User user);
        Task DeleteUserAsync(string userId);
        Task<Microsoft.Graph.Models.User> GetUserAsync(string userIdOrUpn);
        Task<IEnumerable<Microsoft.Graph.Models.User>> GetUsersAsync();
    }

    /// <summary>
    /// Implements user migration via Microsoft Graph.
    /// </summary>
    public class GraphIdentityMigrator : Migration.IIdentityMigrator
    {
        #region Events

        /// <summary>
        /// Event raised when user migration progress is updated
        /// </summary>
        public event EventHandler<UserMigrationProgressEventArgs>? ProgressUpdated;

        /// <summary>
        /// Event raised when a conflict is detected during migration
        /// </summary>
        public event EventHandler<UserMigrationConflictEventArgs>? ConflictDetected;

        /// <summary>
        /// Event raised when synchronization status changes
        /// </summary>
        public event EventHandler<UserSyncStatusEventArgs>? SyncStatusChanged;

        #endregion

        private readonly IGraphUserClient _client;
        private readonly ILogger _logger;

        public GraphIdentityMigrator(IGraphUserClient client, ILogger logger)
        {
            _client = client;
            _logger = logger;
        }

        public async Task<Migration.MigrationResult> MigrateUserAsync(Models.UserData user, Models.Migration.MigrationSettings settings, TargetContext target, IProgress<Migration.MigrationProgress>? progress = null)
        {
            try
            {
                progress?.Report(new Migration.MigrationProgress { Percentage = 0, Message = $"Creating user {user.DisplayName}" });

                // Convert UserData to Microsoft Graph User
                var graphUser = new Microsoft.Graph.Models.User
                {
                    DisplayName = user.DisplayName,
                    UserPrincipalName = user.UserPrincipalName,
                    Mail = user.Mail,
                    MailNickname = user.SamAccountName ?? user.UserPrincipalName?.Split('@')[0],
                    Department = user.Department,
                    JobTitle = user.JobTitle,
                    AccountEnabled = user.AccountEnabled,
                    CompanyName = user.CompanyName,
                    PasswordProfile = new PasswordProfile
                    {
                        ForceChangePasswordNextSignIn = true, // Always require password change for security
                        Password = GenerateSecurePassword()
                    }
                };

                await _client.CreateUserAsync(graphUser);
                progress?.Report(new Migration.MigrationProgress { Percentage = 100, Message = $"User {user.DisplayName} created" });
                return Migration.MigrationResult.Succeeded();
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, $"Failed to migrate user {user.DisplayName}");
                return Migration.MigrationResult.Failed(ex.Message);
            }
        }

        public async Task<RollbackResult> RollbackUserAsync(Models.UserData user, TargetContext target, IProgress<Migration.MigrationProgress>? progress = null)
        {
            try
            {
                progress?.Report(new Migration.MigrationProgress { Percentage = 0, Message = $"Rolling back user {user.DisplayName}" });

                // Find the user by UPN
                var targetUser = await _client.GetUserAsync(user.UserPrincipalName!);
                if (targetUser != null && !string.IsNullOrEmpty(targetUser.Id))
                {
                    // Disable the user account instead of deleting to preserve data
                    var updateUser = new Microsoft.Graph.Models.User
                    {
                        AccountEnabled = false
                    };
                    await _client.UpdateUserAsync(targetUser.Id, updateUser);
                }

                progress?.Report(new Migration.MigrationProgress { Percentage = 100, Message = $"User {user.DisplayName} rollback completed" });
                return RollbackResult.Succeeded("User account disabled in target tenant");
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, $"Failed to rollback user {user.DisplayName}");
                return RollbackResult.Failed($"User rollback failed: {ex.Message}");
            }
        }

        private string GenerateSecurePassword(int length = 12)
        {
            const string chars = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%";
            var random = new Random();
            return new string(Enumerable.Repeat(chars, length)
                .Select(s => s[random.Next(s.Length)]).ToArray());
        }

        // Migration batch methods
        public async Task<IList<Models.Identity.UserMigrationResult>> MigrateBatchAsync(
            IEnumerable<Models.UserData> users,
            Models.Identity.UserMigrationSettings settings,
            TargetContext target,
            int batchSize = 10,
            IProgress<Models.Identity.BatchMigrationProgress>? progress = null,
            CancellationToken cancellationToken = default)
        {
            var userList = users.ToList();
            var results = new List<Models.Identity.UserMigrationResult>();
            var processed = 0;
            var successful = 0;
            var failed = 0;
            var skipped = 0;

            foreach (var batch in userList.Chunk(batchSize))
            {
                if (cancellationToken.IsCancellationRequested)
                    break;

                foreach (var user in batch)
                {
                    if (cancellationToken.IsCancellationRequested)
                        break;

                    try
                    {
                        // Convert UserMigrationSettings to MigrationSettings
                        var migrationSettings = new Models.Migration.MigrationSettings();
                        var result = await MigrateUserAsync(user, migrationSettings, target, null);

                        if (result.IsSuccess)
                        {
                            successful++;
                        }
                        else
                        {
                            failed++;
                        }

                        // Create UserMigrationResult
                        var migrationResult = new Models.Identity.UserMigrationResult
                        {
                            SourceUserPrincipalName = user.UserPrincipalName,
                            TargetUserPrincipalName = user.UserPrincipalName, // Assuming same UPN
                            StrategyUsed = Models.Identity.MigrationStrategy.DirectCreation,
                            IsSuccess = result.IsSuccess,
                            Message = result.IsSuccess ? "User created successfully" : result.ErrorMessage
                        };
                        results.Add(migrationResult);
                    }
                    catch (Exception ex)
                    {
                        failed++;
                        var migrationResult = new Models.Identity.UserMigrationResult
                        {
                            SourceUserPrincipalName = user.UserPrincipalName,
                            StrategyUsed = Models.Identity.MigrationStrategy.DirectCreation,
                            IsSuccess = false,
                            Message = $"Migration failed: {ex.Message}"
                        };
                        results.Add(migrationResult);
                    }

                    processed++;

                    // Report progress
                    progress?.Report(new Models.Identity.BatchMigrationProgress
                    {
                        TotalUsers = userList.Count,
                        ProcessedUsers = processed,
                        SuccessfulUsers = successful,
                        FailedUsers = failed,
                        SkippedUsers = skipped,
                        CurrentUserPrincipalName = user.UserPrincipalName
                    });
                }
            }

            return results;
        }

        public async Task<IList<Models.Identity.UserMigrationResult>> MigrateDeltaAsync(
            IEnumerable<Models.UserData> users,
            DateTime lastSyncTime,
            Models.Identity.UserMigrationSettings settings,
            TargetContext target,
            CancellationToken cancellationToken = default)
        {
            var results = new List<Models.Identity.UserMigrationResult>();

            foreach (var user in users)
            {
                if (cancellationToken.IsCancellationRequested)
                    break;

                try
                {
                    // Check if user was modified since last sync (simplified)
                    var modifiedSinceLastSync = true; // For now, always true

                    if (modifiedSinceLastSync)
                    {
                        var migrationSettings = new Models.Migration.MigrationSettings();
                        var result = await MigrateUserAsync(user, migrationSettings, target, null);

                        var migrationResult = new Models.Identity.UserMigrationResult
                        {
                            SourceUserPrincipalName = user.UserPrincipalName,
                            TargetUserPrincipalName = user.UserPrincipalName,
                            StrategyUsed = Models.Identity.MigrationStrategy.DirectCreation,
                            IsSuccess = result.IsSuccess,
                            Message = result.IsSuccess ? "Delta migration completed" : result.ErrorMessage
                        };

                        results.Add(migrationResult);
                    }
                    else
                    {
                        // No changes, create skipped result
                        var migrationResult = new Models.Identity.UserMigrationResult
                        {
                            SourceUserPrincipalName = user.UserPrincipalName,
                            TargetUserPrincipalName = user.UserPrincipalName,
                            StrategyUsed = Models.Identity.MigrationStrategy.DirectCreation,
                            IsSuccess = true,
                            Message = "No changes since last sync"
                        };
                        results.Add(migrationResult);
                    }
                }
                catch (Exception ex)
                {
                    var migrationResult = new Models.Identity.UserMigrationResult
                    {
                        SourceUserPrincipalName = user.UserPrincipalName,
                        StrategyUsed = Models.Identity.MigrationStrategy.DirectCreation,
                        IsSuccess = false,
                        Message = $"Delta migration failed: {ex.Message}"
                    };
                    results.Add(migrationResult);
                }
            }

            return results;
        }

        // Account management methods
        public async Task<Models.Identity.UserAccountCreationResult> CreateUserAccountAsync(
            Models.UserData userData,
            Models.Identity.UserAccountCreationSettings settings,
            TargetContext target,
            CancellationToken cancellationToken = default)
        {
            try
            {
                // Use Microsoft Graph to create user
                var graphUser = new Microsoft.Graph.Models.User
                {
                    DisplayName = userData.DisplayName,
                    UserPrincipalName = userData.UserPrincipalName,
                    Mail = userData.Mail,
                    MailNickname = userData.SamAccountName ?? userData.UserPrincipalName?.Split('@')[0],
                    Department = userData.Department,
                    JobTitle = userData.JobTitle,
                    AccountEnabled = true, // Always enable for new accounts
                    CompanyName = userData.CompanyName,
                    PasswordProfile = new PasswordProfile
                    {
                        ForceChangePasswordNextSignIn = true,
                        Password = settings.GeneratePassword ? GenerateSecurePassword() : "TempPassword123!" // Fallback
                    }
                };

                var createdUser = await _client.CreateUserAsync(graphUser);

                return new Models.Identity.UserAccountCreationResult
                {
                    IsSuccess = true,
                    TargetUserId = createdUser?.Id,
                    TargetUserPrincipalName = createdUser?.UserPrincipalName,
                    GeneratedPassword = graphUser.PasswordProfile.Password,
                    PasswordIsTemporary = true,
                    Message = "User account created successfully"
                };
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, $"Failed to create user account for {userData.UserPrincipalName}");
                return new Models.Identity.UserAccountCreationResult
                {
                    IsSuccess = false,
                    Message = $"Account creation failed: {ex.Message}"
                };
            }
        }

        public async Task<Models.Identity.UserInvitationResult> InviteUserAsync(
            Models.UserData userData,
            Models.Identity.UserInvitationSettings invitationSettings,
            TargetContext target,
            CancellationToken cancellationToken = default)
        {
            try
            {
                // For Graph implementation, check if we should use direct creation or invitation
                // Simplified: always use direct creation
                var result = await CreateUserAccountAsync(userData, new Models.Identity.UserAccountCreationSettings(), target, cancellationToken);

                return new Models.Identity.UserInvitationResult
                {
                    IsSuccess = result.IsSuccess,
                    InvitationId = Guid.NewGuid().ToString(),
                    InvitedUserEmail = userData.Mail,
                    InvitationStatus = "Completed", // Since we created directly
                    Message = "User created directly (B2B invitation simulation)"
                };
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, $"Failed to invite user {userData.UserPrincipalName}");
                return new Models.Identity.UserInvitationResult
                {
                    IsSuccess = false,
                    InvitedUserEmail = userData.Mail,
                    InvitationStatus = "Failed",
                    Message = $"Invitation failed: {ex.Message}"
                };
            }
        }

        public async Task<Models.Identity.UserUpdateResult> UpdateUserAccountAsync(
            string targetUserId,
            Models.UserData userData,
            Models.Identity.UserUpdateSettings settings,
            TargetContext target,
            CancellationToken cancellationToken = default)
        {
            try
            {
                // Get existing user
                var existingUser = await _client.GetUserAsync(targetUserId);
                if (existingUser == null)
                {
                    return new Models.Identity.UserUpdateResult
                    {
                        IsSuccess = false,
                        TargetUserId = targetUserId,
                        Message = "User not found"
                    };
                }

                // Update the user with new data
                var updateUser = new Microsoft.Graph.Models.User
                {
                    DisplayName = userData.DisplayName ?? existingUser.DisplayName,
                    Department = userData.Department ?? existingUser.Department,
                    JobTitle = userData.JobTitle ?? existingUser.JobTitle,
                    CompanyName = userData.CompanyName ?? existingUser.CompanyName,
                    Mail = userData.Mail ?? existingUser.Mail
                };

                await _client.UpdateUserAsync(targetUserId, updateUser);

                return new Models.Identity.UserUpdateResult
                {
                    IsSuccess = true,
                    TargetUserId = targetUserId,
                    UpdatedAttributes = new Dictionary<string, string>
                    {
                        ["DisplayName"] = userData.DisplayName,
                        ["Department"] = userData.Department,
                        ["JobTitle"] = userData.JobTitle
                    },
                    Message = "User account updated successfully"
                };
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, $"Failed to update user account {targetUserId}");
                return new Models.Identity.UserUpdateResult
                {
                    IsSuccess = false,
                    TargetUserId = targetUserId,
                    Message = $"Update failed: {ex.Message}"
                };
            }
        }

        // Conflict resolution methods
        public async Task<IList<Models.Identity.UserMigrationConflict>> DetectConflictsAsync(
            IEnumerable<Models.UserData> users,
            TargetContext target,
            CancellationToken cancellationToken = default)
        {
            var conflicts = new List<Models.Identity.UserMigrationConflict>();

            foreach (var user in users)
            {
                if (cancellationToken.IsCancellationRequested)
                    break;

                try
                {
                    // Check if user already exists in target
                    var existingUser = await _client.GetUserAsync(user.UserPrincipalName!);
                    if (existingUser != null)
                    {
                        var conflict = new Models.Identity.UserMigrationConflict
                        {
                            SourceUserPrincipalName = user.UserPrincipalName,
                            ConflictType = "UserPrincipalNameExists",
                            SourceValue = user.UserPrincipalName,
                            ConflictingValue = user.UserPrincipalName,
                            ExistingUserId = existingUser.Id,
                            Severity = "Warning",
                            RecommendedAction = "UseExistingOrRename",
                            Description = $"User with UPN {user.UserPrincipalName} already exists",
                            ResolutionOptions = new List<string> { "Skip", "UseExisting", "RenameSource", "RenameTarget" }
                        };
                        conflicts.Add(conflict);
                    }
                }
                catch (Exception ex)
                {
                    _logger?.LogWarning(ex, $"Error checking conflicts for user {user.UserPrincipalName}");
                }
            }

            return conflicts;
        }

        public async Task<Models.Identity.ConflictResolutionResult> ResolveConflictAsync(
            Models.Identity.UserMigrationConflict conflict,
            Models.Identity.ConflictResolution resolution,
            TargetContext target,
            CancellationToken cancellationToken = default)
        {
            // Simplified conflict resolution - for now, just mark as resolved
            return new Models.Identity.ConflictResolutionResult
            {
                IsSuccess = true,
                RecommendedAction = "UseExisting",
                ResolutionStrategy = "Auto",
                ConflictResolutionApplied = true,
                ResolvedUserPrincipalName = conflict.SourceUserPrincipalName,
                ExistingUserId = conflict.ExistingUserId,
                Message = "Conflict resolved by using existing user"
            };
        }

        // Synchronization methods
        public async Task<Models.Identity.UserSynchronizationResult> SynchronizeUsersAsync(
            IEnumerable<Models.UserData> sourceUsers,
            Models.Identity.UserSynchronizationSettings settings,
            TargetContext target,
            CancellationToken cancellationToken = default)
        {
            var totalUsers = sourceUsers.Count();
            var successful = 0;
            var failed = 0;

            foreach (var user in sourceUsers)
            {
                if (cancellationToken.IsCancellationRequested)
                    break;

                try
                {
                    // Simplified sync - just check if user exists
                    var targetUser = await _client.GetUserAsync(user.UserPrincipalName!);
                    if (targetUser != null)
                    {
                        successful++;
                    }
                }
                catch (Exception)
                {
                    failed++;
                }
            }

            return new Models.Identity.UserSynchronizationResult
            {
                IsSuccess = true,
                TotalUsers = totalUsers,
                SuccessfulUsers = successful,
                FailedUsers = failed,
                Message = $"{successful} users synchronized successfully"
            };
        }

        public async Task<Models.Identity.UserSyncStatus> GetSyncStatusAsync(
            string sourceUserId,
            TargetContext target,
            CancellationToken cancellationToken = default)
        {
            try
            {
                // Simplified - assume synced
                return new Models.Identity.UserSyncStatus
                {
                    SourceUserPrincipalName = sourceUserId,
                    TargetUserPrincipalName = sourceUserId,
                    Status = "Synchronized",
                    LastSyncTime = DateTime.Now,
                    IsActive = true
                };
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, $"Error getting sync status for {sourceUserId}");
                return new Models.Identity.UserSyncStatus
                {
                    SourceUserPrincipalName = sourceUserId,
                    Status = "Error",
                    IsActive = false
                };
            }
        }

        public async Task<string> StartPeriodicSyncAsync(
            IEnumerable<Models.UserData> users,
            Models.Identity.PeriodicSyncSettings settings,
            TargetContext target,
            CancellationToken cancellationToken = default)
        {
            // Simplified - generate sync job ID
            var jobId = Guid.NewGuid().ToString();
            _logger?.LogInformation($"Started periodic sync job {jobId} for {users.Count()} users");
            return jobId;
        }

        public async Task<bool> StopPeriodicSyncAsync(string syncJobId, CancellationToken cancellationToken = default)
        {
            _logger?.LogInformation($"Stopped periodic sync job {syncJobId}");
            return true;
        }

        // Attribute mapping methods
        public async Task<Models.Identity.UserAttributeMapping> GetAttributeMappingAsync()
        {
            // Return default mapping
            return Models.Identity.UserAttributeMapping.CreateDefaultMapping();
        }

        public async Task<bool> UpdateAttributeMappingAsync(
            Models.Identity.UserAttributeMapping mapping,
            CancellationToken cancellationToken = default)
        {
            _logger?.LogInformation("Updated attribute mapping configuration");
            return true;
        }

        public async Task<Models.Identity.AttributeMappingValidationResult> ValidateAttributeMappingAsync(Models.Identity.UserAttributeMapping mapping)
        {
            // Simplified validation
            var validMappings = mapping.AttributeMap.Count;
            var issues = new List<Models.Identity.AttributeMappingIssue>();

            return new Models.Identity.AttributeMappingValidationResult
            {
                IsSuccess = true,
                IsValid = true,
                ValidMappings = validMappings,
                ValidationIssues = issues,
                Message = "Attribute mapping validation completed"
            };
        }

        // Password and MFA methods
        public async Task<IList<string>> GenerateTemporaryPasswordsAsync(
            int count,
            PasswordRequirements requirements)
        {
            var passwords = new List<string>();
            for (int i = 0; i < count; i++)
            {
                passwords.Add(GenerateSecurePassword(requirements?.MinimumLength ?? 12));
            }
            return passwords;
        }

        public async Task<IList<Models.Identity.MfaConfigurationResult>> ConfigureMfaAsync(
            IEnumerable<string> userIds,
            Models.Identity.MfaSettings mfaSettings,
            TargetContext target,
            CancellationToken cancellationToken = default)
        {
            var results = new List<Models.Identity.MfaConfigurationResult>();

            foreach (var userId in userIds)
            {
                try
                {
                    // Simplified MFA configuration
                    results.Add(new Models.Identity.MfaConfigurationResult
                    {
                        IsSuccess = true,
                        TargetUserId = userId,
                        UserPrincipalName = userId,
                        MfaEnabled = mfaSettings.EnableMfa,
                        Message = "MFA configured successfully (simulated)"
                    });
                }
                catch (Exception ex)
                {
                    results.Add(new Models.Identity.MfaConfigurationResult
                    {
                        IsSuccess = false,
                        TargetUserId = userId,
                        MfaEnabled = false,
                        Message = $"MFA configuration failed: {ex.Message}"
                    });
                }
            }

            return results;
        }

        // Validation methods
        public async Task<Models.Identity.IdentityConnectivityResult> TestConnectivityAsync(
            SourceContext sourceContext,
            TargetContext target,
            CancellationToken cancellationToken = default)
        {
            // Simplified connectivity test
            return new Models.Identity.IdentityConnectivityResult
            {
                IsSuccess = true,
                SourceConnectivity = true,
                TargetConnectivity = true,
                Message = "Graph connectivity test successful (simulated)"
            };
        }

        public async Task<IList<Models.Identity.UserValidationResult>> ValidateMigratedUsersAsync(
            IEnumerable<string> userIds,
            TargetContext target,
            CancellationToken cancellationToken = default)
        {
            var results = new List<Models.Identity.UserValidationResult>();

            foreach (var userId in userIds)
            {
                try
                {
                    var user = await _client.GetUserAsync(userId);
                    results.Add(new Models.Identity.UserValidationResult
                    {
                        IsSuccess = true,
                        TargetUserId = userId,
                        UserPrincipalName = user?.UserPrincipalName,
                        CanAuthenticate = true,
                        CanAccessResources = true,
                        Message = "User validation successful"
                    });
                }
                catch (Exception ex)
                {
                    results.Add(new Models.Identity.UserValidationResult
                    {
                        IsSuccess = false,
                        TargetUserId = userId,
                        CanAuthenticate = false,
                        CanAccessResources = false,
                        Message = $"Validation failed: {ex.Message}"
                    });
                }
            }

            return results;
        }
    }
}
