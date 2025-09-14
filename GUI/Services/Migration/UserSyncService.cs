using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using System.Text.Json;
using System.IO;
using Microsoft.Extensions.Logging;
using Microsoft.Graph;
using MandADiscoverySuite.Migration;
using MandADiscoverySuite.Models;
using MandADiscoverySuite.Models.Identity;
using MandADiscoverySuite.Services.Migration;
using System.Collections.Concurrent;

namespace MandADiscoverySuite.Services.Migration
{
    /// <summary>
    /// User synchronization service for T-041: User Account Migration and Synchronization
    /// Handles ongoing synchronization of user changes between source and target environments
    /// </summary>
    public class UserSyncService
    {
        private readonly ILogger<UserSyncService> _logger;
        private readonly GraphServiceClient _graphServiceClient;
        private readonly AttributeMappingService _attributeMappingService;
        private readonly ConcurrentDictionary<string, UserSyncConfiguration> _activeSyncConfigurations;
        private readonly Timer _syncTimer;
        private readonly SemaphoreSlim _syncSemaphore;

        public UserSyncService(
            ILogger<UserSyncService> logger,
            GraphServiceClient graphServiceClient,
            AttributeMappingService attributeMappingService)
        {
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
            _graphServiceClient = graphServiceClient ?? throw new ArgumentNullException(nameof(graphServiceClient));
            _attributeMappingService = attributeMappingService ?? throw new ArgumentNullException(nameof(attributeMappingService));
            
            _activeSyncConfigurations = new ConcurrentDictionary<string, UserSyncConfiguration>();
            _syncSemaphore = new SemaphoreSlim(5, 5); // Allow up to 5 concurrent sync operations
            
            // Initialize sync timer to run every 5 minutes
            _syncTimer = new Timer(OnSyncTimerElapsed, null, TimeSpan.FromMinutes(1), TimeSpan.FromMinutes(5));
        }

        /// <summary>
        /// Register user for ongoing synchronization
        /// </summary>
        public async Task<UserSyncRegistrationResult> RegisterUserForSyncAsync(
            string sourceUserPrincipalName,
            string targetUserPrincipalName,
            MigrationContext context,
            CancellationToken cancellationToken = default)
        {
            var result = new UserSyncRegistrationResult
            {
                SourceUserPrincipalName = sourceUserPrincipalName,
                TargetUserPrincipalName = targetUserPrincipalName,
                StartTime = DateTime.Now
            };

            try
            {
                _logger.LogInformation($"Registering user for synchronization: {sourceUserPrincipalName} -> {targetUserPrincipalName}");

                // Create sync configuration
                var syncConfig = new UserSyncConfiguration
                {
                    SourceUserPrincipalName = sourceUserPrincipalName,
                    TargetUserPrincipalName = targetUserPrincipalName,
                    AttributesToSync = GetDefaultAttributesToSync(context),
                    SyncInterval = TimeSpan.FromHours(context.GetConfiguration("UserSyncIntervalHours", 4)),
                    EnableBidirectionalSync = context.GetConfiguration("EnableBidirectionalUserSync", false),
                    IsActive = true,
                    LastSyncTime = DateTime.Now,
                    NextSyncTime = DateTime.Now.AddHours(context.GetConfiguration("UserSyncIntervalHours", 4)),
                    SyncJobId = Guid.NewGuid().ToString(),
                    ConflictResolutionStrategy = GetDefaultConflictResolutionStrategy(context),
                    ExcludedAttributes = GetExcludedAttributes(context)
                };

                // Add to active sync configurations
                _activeSyncConfigurations.AddOrUpdate(
                    sourceUserPrincipalName,
                    syncConfig,
                    (key, existing) => syncConfig);

                // Persist sync configuration (in real implementation, this would go to database)
                await PersistSyncConfigurationAsync(syncConfig, context, cancellationToken);

                result.IsSuccess = true;
                result.SyncSchedule = $"Every {syncConfig.SyncInterval.TotalHours} hours";
                result.NextSyncTime = syncConfig.NextSyncTime;
                result.AttributesToSync = syncConfig.AttributesToSync.ToList();
                result.EnableBidirectionalSync = syncConfig.EnableBidirectionalSync;

                _logger.LogInformation($"Successfully registered user for sync: {sourceUserPrincipalName}");
                return result;
            }
            catch (Exception ex)
            {
                result.IsSuccess = false;
                result.ErrorMessage = ex.Message;
                result.Errors.Add(ex.ToString());
                _logger.LogError(ex, $"Failed to register user for sync: {sourceUserPrincipalName}");
                return result;
            }
        }

        /// <summary>
        /// Unregister user from synchronization
        /// </summary>
        public async Task<MigrationResultBase> UnregisterUserFromSyncAsync(
            string userPrincipalName,
            MigrationContext context,
            CancellationToken cancellationToken = default)
        {
            var result = new GenericMigrationResult("UserSync") { StartTime = DateTime.Now };

            try
            {
                _logger.LogInformation($"Unregistering user from synchronization: {userPrincipalName}");

                // Remove from active configurations
                if (_activeSyncConfigurations.TryRemove(userPrincipalName, out var syncConfig))
                {
                    syncConfig.IsActive = false;
                    
                    // Remove persisted configuration
                    await RemoveSyncConfigurationAsync(syncConfig, context, cancellationToken);
                    
                    result.IsSuccess = true;
                    _logger.LogInformation($"Successfully unregistered user from sync: {userPrincipalName}");
                }
                else
                {
                    result.IsSuccess = true; // Not an error if user wasn't registered
                    result.Warnings.Add($"User {userPrincipalName} was not registered for synchronization");
                }

                return result;
            }
            catch (Exception ex)
            {
                result.IsSuccess = false;
                result.ErrorMessage = ex.Message;
                result.Errors.Add(ex.ToString());
                _logger.LogError(ex, $"Failed to unregister user from sync: {userPrincipalName}");
                return result;
            }
        }

        /// <summary>
        /// Synchronize specific user immediately
        /// </summary>
        public async Task<UserSyncResult> SynchronizeUserAsync(
            string userPrincipalName,
            MigrationContext context,
            CancellationToken cancellationToken = default)
        {
            var result = new UserSyncResult
            {
                UserPrincipalName = userPrincipalName,
                StartTime = DateTime.Now
            };

            if (!_activeSyncConfigurations.TryGetValue(userPrincipalName, out var syncConfig))
            {
                result.IsSuccess = false;
                result.ErrorMessage = $"User {userPrincipalName} is not registered for synchronization";
                return result;
            }

            await _syncSemaphore.WaitAsync(cancellationToken);
            try
            {
                _logger.LogInformation($"Starting user synchronization: {userPrincipalName}");

                // Step 1: Get current source user attributes
                var sourceAttributes = await GetSourceUserAttributesAsync(syncConfig.SourceUserPrincipalName, context, cancellationToken);
                if (sourceAttributes == null)
                {
                    result.IsSuccess = false;
                    result.ErrorMessage = $"Could not retrieve source user attributes for {syncConfig.SourceUserPrincipalName}";
                    return result;
                }

                // Step 2: Get current target user attributes
                var targetAttributes = await GetTargetUserAttributesAsync(syncConfig.TargetUserPrincipalName, cancellationToken);
                if (targetAttributes == null)
                {
                    result.IsSuccess = false;
                    result.ErrorMessage = $"Could not retrieve target user attributes for {syncConfig.TargetUserPrincipalName}";
                    return result;
                }

                // Step 3: Compare and detect changes
                var changeSet = DetectAttributeChanges(sourceAttributes, targetAttributes, syncConfig);
                
                // Step 4: Apply changes with conflict detection
                foreach (var change in changeSet)
                {
                    cancellationToken.ThrowIfCancellationRequested();
                    
                    try
                    {
                        var syncResult = await ApplyAttributeChangeAsync(change, syncConfig, context, cancellationToken);
                        if (syncResult.IsSuccess)
                        {
                            result.AttributesSynced++;
                            result.SyncedAttributes[change.AttributeName] = change.NewValue;
                        }
                        else
                        {
                            result.AttributesFailed++;
                            result.FailedAttributes.Add(change.AttributeName);
                            
                            if (syncResult.HasConflict)
                            {
                                result.SyncConflicts.Add(new SyncConflict
                                {
                                    AttributeName = change.AttributeName,
                                    SourceValue = change.NewValue,
                                    TargetValue = change.CurrentValue,
                                    ConflictType = syncResult.ConflictType,
                                    Resolution = syncResult.ConflictResolution
                                });
                            }
                        }
                    }
                    catch (Exception ex)
                    {
                        result.AttributesFailed++;
                        result.FailedAttributes.Add(change.AttributeName);
                        result.Errors.Add($"Failed to sync attribute {change.AttributeName}: {ex.Message}");
                        _logger.LogError(ex, $"Failed to sync attribute {change.AttributeName} for user {userPrincipalName}");
                    }
                }

                // Step 5: Update sync configuration
                syncConfig.LastSyncTime = DateTime.Now;
                syncConfig.NextSyncTime = DateTime.Now.Add(syncConfig.SyncInterval);
                
                result.IsSuccess = result.AttributesFailed == 0 || result.AttributesSynced > 0;
                result.NextSyncTime = syncConfig.NextSyncTime;
                result.EndTime = DateTime.Now;

                _logger.LogInformation($"User synchronization completed for {userPrincipalName}: " +
                    $"Synced: {result.AttributesSynced}, Failed: {result.AttributesFailed}, Conflicts: {result.SyncConflicts.Count}");

                return result;
            }
            catch (Exception ex)
            {
                result.IsSuccess = false;
                result.ErrorMessage = ex.Message;
                result.Errors.Add(ex.ToString());
                _logger.LogError(ex, $"User synchronization failed for: {userPrincipalName}");
                return result;
            }
            finally
            {
                _syncSemaphore.Release();
            }
        }

        /// <summary>
        /// Get all active user sync configurations
        /// </summary>
        public Task<List<UserSyncConfiguration>> GetActiveSyncConfigurationsAsync(CancellationToken cancellationToken = default)
        {
            var activeConfigs = _activeSyncConfigurations.Values.Where(c => c.IsActive).ToList();
            return Task.FromResult(activeConfigs);
        }

        /// <summary>
        /// Timer callback for automatic synchronization
        /// </summary>
        private async void OnSyncTimerElapsed(object state)
        {
            try
            {
                var dueSyncConfigs = _activeSyncConfigurations.Values
                    .Where(c => c.IsActive && DateTime.Now >= c.NextSyncTime)
                    .ToList();

                if (dueSyncConfigs.Any())
                {
                    _logger.LogInformation($"Starting scheduled synchronization for {dueSyncConfigs.Count} users");
                    
                    // Process up to 10 users concurrently
                    var semaphore = new SemaphoreSlim(10, 10);
                    var tasks = dueSyncConfigs.Select(async config =>
                    {
                        await semaphore.WaitAsync();
                        try
                        {
                            // Create a basic context for scheduled sync
                            var context = CreateBasicSyncContext();
                            var result = await SynchronizeUserAsync(config.SourceUserPrincipalName, context, CancellationToken.None);
                            
                            if (!result.IsSuccess)
                            {
                                _logger.LogWarning($"Scheduled sync failed for user {config.SourceUserPrincipalName}: {result.ErrorMessage}");
                            }
                        }
                        catch (Exception ex)
                        {
                            _logger.LogError(ex, $"Scheduled sync error for user {config.SourceUserPrincipalName}");
                        }
                        finally
                        {
                            semaphore.Release();
                        }
                    });

                    await Task.WhenAll(tasks);
                    _logger.LogInformation($"Scheduled synchronization completed for {dueSyncConfigs.Count} users");
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during scheduled user synchronization");
            }
        }

        #region Helper Methods

        /// <summary>
        /// Get default attributes to sync
        /// </summary>
        private List<string> GetDefaultAttributesToSync(MigrationContext context)
        {
            var customAttributes = context.GetConfiguration<List<string>>("UserSyncAttributes");
            if (customAttributes != null && customAttributes.Any())
            {
                return customAttributes;
            }

            return new List<string>
            {
                "displayName",
                "givenName",
                "surname",
                "jobTitle",
                "department",
                "companyName",
                "officeLocation",
                "businessPhones",
                "mobilePhone",
                "streetAddress",
                "city",
                "state",
                "postalCode",
                "country"
            };
        }

        /// <summary>
        /// Get default conflict resolution strategy
        /// </summary>
        private Dictionary<string, string> GetDefaultConflictResolutionStrategy(MigrationContext context)
        {
            var customStrategy = context.GetConfiguration<Dictionary<string, string>>("ConflictResolutionStrategy");
            if (customStrategy != null)
            {
                return customStrategy;
            }

            return new Dictionary<string, string>
            {
                ["default"] = "UseSource", // Use source value by default
                ["displayName"] = "UseSource",
                ["jobTitle"] = "UseTarget", // Job titles might change more often in target
                ["department"] = "UseSource",
                ["officeLocation"] = "UseTarget",
                ["businessPhones"] = "UseTarget",
                ["mobilePhone"] = "UseTarget"
            };
        }

        /// <summary>
        /// Get attributes to exclude from synchronization
        /// </summary>
        private List<string> GetExcludedAttributes(MigrationContext context)
        {
            var customExclusions = context.GetConfiguration<List<string>>("SyncExcludedAttributes");
            if (customExclusions != null)
            {
                return customExclusions;
            }

            return new List<string>
            {
                "userPrincipalName", // Never sync UPN
                "mail", // Email changes should be controlled
                "accountEnabled", // Account status should be controlled
                "passwordProfile" // Never sync passwords
            };
        }

        /// <summary>
        /// Get source user attributes (from source system)
        /// </summary>
        private async Task<Dictionary<string, string>> GetSourceUserAttributesAsync(
            string sourceUserPrincipalName,
            MigrationContext context,
            CancellationToken cancellationToken)
        {
            try
            {
                // In a real implementation, this would query the source system (AD, LDAP, etc.)
                // For now, we'll simulate by returning the last known attributes from context
                var sourceAttributes = context.GetConfiguration<Dictionary<string, string>>($"SourceUserAttributes_{sourceUserPrincipalName}");
                return sourceAttributes ?? new Dictionary<string, string>();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Failed to get source attributes for user: {sourceUserPrincipalName}");
                return null;
            }
        }

        /// <summary>
        /// Get target user attributes (from Graph API)
        /// </summary>
        private async Task<Dictionary<string, string>> GetTargetUserAttributesAsync(
            string targetUserPrincipalName,
            CancellationToken cancellationToken)
        {
            try
            {
                var users = await _graphServiceClient.Users
                    .GetAsync(requestConfiguration => {
                        requestConfiguration.QueryParameters.Filter = $"userPrincipalName eq '{targetUserPrincipalName}'";
                        requestConfiguration.QueryParameters.Select = new[] { "displayName", "givenName", "surname", "jobTitle", "department", "companyName", "officeLocation", "businessPhones", "mobilePhone", "streetAddress", "city", "state", "postalCode", "country" };
                    }, cancellationToken);

                var user = users?.Value?.FirstOrDefault();
                if (user == null) return null;

                var attributes = new Dictionary<string, string>
                {
                    ["displayName"] = user.DisplayName ?? "",
                    ["givenName"] = user.GivenName ?? "",
                    ["surname"] = user.Surname ?? "",
                    ["jobTitle"] = user.JobTitle ?? "",
                    ["department"] = user.Department ?? "",
                    ["companyName"] = user.CompanyName ?? "",
                    ["officeLocation"] = user.OfficeLocation ?? "",
                    ["businessPhones"] = user.BusinessPhones?.FirstOrDefault() ?? "",
                    ["mobilePhone"] = user.MobilePhone ?? "",
                    ["streetAddress"] = user.StreetAddress ?? "",
                    ["city"] = user.City ?? "",
                    ["state"] = user.State ?? "",
                    ["postalCode"] = user.PostalCode ?? "",
                    ["country"] = user.Country ?? ""
                };

                return attributes;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Failed to get target attributes for user: {targetUserPrincipalName}");
                return null;
            }
        }

        /// <summary>
        /// Detect attribute changes between source and target
        /// </summary>
        private List<AttributeChange> DetectAttributeChanges(
            Dictionary<string, string> sourceAttributes,
            Dictionary<string, string> targetAttributes,
            UserSyncConfiguration syncConfig)
        {
            var changes = new List<AttributeChange>();

            foreach (var attributeName in syncConfig.AttributesToSync)
            {
                if (syncConfig.ExcludedAttributes.Contains(attributeName))
                    continue;

                var sourceValue = sourceAttributes.GetValueOrDefault(attributeName, "");
                var targetValue = targetAttributes.GetValueOrDefault(attributeName, "");

                if (!string.Equals(sourceValue, targetValue, StringComparison.OrdinalIgnoreCase))
                {
                    changes.Add(new AttributeChange
                    {
                        AttributeName = attributeName,
                        CurrentValue = targetValue,
                        NewValue = sourceValue,
                        ChangeType = string.IsNullOrEmpty(targetValue) ? "Add" : "Update"
                    });
                }
            }

            return changes;
        }

        /// <summary>
        /// Apply individual attribute change
        /// </summary>
        private async Task<AttributeSyncResult> ApplyAttributeChangeAsync(
            AttributeChange change,
            UserSyncConfiguration syncConfig,
            MigrationContext context,
            CancellationToken cancellationToken)
        {
            var result = new AttributeSyncResult
            {
                AttributeName = change.AttributeName,
                OldValue = change.CurrentValue,
                NewValue = change.NewValue
            };

            try
            {
                // Check conflict resolution strategy
                var resolutionStrategy = syncConfig.ConflictResolutionStrategy.GetValueOrDefault(
                    change.AttributeName,
                    syncConfig.ConflictResolutionStrategy.GetValueOrDefault("default", "UseSource"));

                if (resolutionStrategy == "Skip")
                {
                    result.IsSuccess = true;
                    result.ConflictResolution = "Skipped";
                    return result;
                }

                if (resolutionStrategy == "UseTarget" && !string.IsNullOrEmpty(change.CurrentValue))
                {
                    result.IsSuccess = true;
                    result.ConflictResolution = "TargetPreferred";
                    return result;
                }

                // Apply the change via Graph API
                var users = await _graphServiceClient.Users
                    .GetAsync(requestConfiguration => {
                        requestConfiguration.QueryParameters.Filter = $"userPrincipalName eq '{syncConfig.TargetUserPrincipalName}'";
                        requestConfiguration.QueryParameters.Select = new[] { "id" };
                    }, cancellationToken);

                var targetUser = users?.Value?.FirstOrDefault();
                if (targetUser == null)
                {
                    result.IsSuccess = false;
                    result.ErrorMessage = $"Target user not found: {syncConfig.TargetUserPrincipalName}";
                    return result;
                }

                // Create user update with single attribute
                var userUpdate = new Microsoft.Graph.Models.User();
                var extensionAttributes = new Dictionary<string, object>();
                
                // Use the existing attribute mapping service to map the attribute correctly
                MapSingleAttributeToUserObject(userUpdate, extensionAttributes, change.AttributeName, change.NewValue);

                // Update the user
                await _graphServiceClient.Users[targetUser.Id].PatchAsync(userUpdate, null, cancellationToken);

                result.IsSuccess = true;
                result.ConflictResolution = resolutionStrategy;
                return result;
            }
            catch (Exception ex)
            {
                result.IsSuccess = false;
                result.ErrorMessage = ex.Message;
                _logger.LogError(ex, $"Failed to apply attribute change {change.AttributeName} for user {syncConfig.TargetUserPrincipalName}");
                return result;
            }
        }

        /// <summary>
        /// Map single attribute to User object (simplified version of AttributeMappingService method)
        /// </summary>
        private void MapSingleAttributeToUserObject(Microsoft.Graph.Models.User userUpdate, Dictionary<string, object> extensionAttributes, string attributeName, string attributeValue)
        {
            switch (attributeName.ToLowerInvariant())
            {
                case "displayname":
                    userUpdate.DisplayName = attributeValue;
                    break;
                case "givenname":
                    userUpdate.GivenName = attributeValue;
                    break;
                case "surname":
                    userUpdate.Surname = attributeValue;
                    break;
                case "jobtitle":
                    userUpdate.JobTitle = attributeValue;
                    break;
                case "department":
                    userUpdate.Department = attributeValue;
                    break;
                case "companyname":
                    userUpdate.CompanyName = attributeValue;
                    break;
                case "officelocation":
                    userUpdate.OfficeLocation = attributeValue;
                    break;
                case "businessphones":
                    userUpdate.BusinessPhones = string.IsNullOrEmpty(attributeValue) ? 
                        new List<string>() : new List<string> { attributeValue };
                    break;
                case "mobilephone":
                    userUpdate.MobilePhone = attributeValue;
                    break;
                case "streetaddress":
                    userUpdate.StreetAddress = attributeValue;
                    break;
                case "city":
                    userUpdate.City = attributeValue;
                    break;
                case "state":
                    userUpdate.State = attributeValue;
                    break;
                case "postalcode":
                    userUpdate.PostalCode = attributeValue;
                    break;
                case "country":
                    userUpdate.Country = attributeValue;
                    break;
                default:
                    // Handle as extension attribute
                    extensionAttributes[attributeName] = attributeValue;
                    break;
            }
        }

        /// <summary>
        /// Create basic migration context for scheduled sync
        /// </summary>
        private MigrationContext CreateBasicSyncContext()
        {
            // In a real implementation, this would create a proper context
            // For now, return a minimal context for sync operations
            return new MigrationContext
            {
                SessionId = $"AutoSync_{DateTime.Now:yyyyMMdd_HHmmss}",
                // Add other required context properties
            };
        }

        /// <summary>
        /// Persist sync configuration to file storage
        /// </summary>
        private async Task PersistSyncConfigurationAsync(UserSyncConfiguration config, MigrationContext context, CancellationToken cancellationToken)
        {
            try
            {
                var syncDataPath = Path.Combine(
                    Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData),
                    "MandADiscoverySuite",
                    "UserSyncConfigurations");

                Directory.CreateDirectory(syncDataPath);

                var fileName = $"{config.SourceUserPrincipalName.Replace("@", "_").Replace(".", "_")}.json";
                var filePath = Path.Combine(syncDataPath, fileName);

                var jsonOptions = new JsonSerializerOptions
                {
                    WriteIndented = true,
                    PropertyNameCaseInsensitive = true
                };

                var json = JsonSerializer.Serialize(config, jsonOptions);
                await File.WriteAllTextAsync(filePath, json, cancellationToken);

                // Configuration successfully persisted

                _logger.LogInformation($"Successfully persisted sync configuration for user: {config.SourceUserPrincipalName} to {filePath}");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Failed to persist sync configuration for user: {config.SourceUserPrincipalName}");
                throw; // Re-throw to maintain error handling in calling method
            }
        }

        /// <summary>
        /// Remove sync configuration from file storage
        /// </summary>
        private async Task RemoveSyncConfigurationAsync(UserSyncConfiguration config, MigrationContext context, CancellationToken cancellationToken)
        {
            try
            {
                var syncDataPath = Path.Combine(
                    Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData),
                    "MandADiscoverySuite",
                    "UserSyncConfigurations");

                var fileName = $"{config.SourceUserPrincipalName.Replace("@", "_").Replace(".", "_")}.json";
                var filePath = Path.Combine(syncDataPath, fileName);

                if (File.Exists(filePath))
                {
                    await Task.Run(() => File.Delete(filePath), cancellationToken);
                    _logger.LogInformation($"Successfully removed sync configuration file for user: {config.SourceUserPrincipalName}");
                }
                else
                {
                    _logger.LogWarning($"Sync configuration file not found for user: {config.SourceUserPrincipalName} at {filePath}");
                }

                // Also cleanup any backup files if they exist
                var backupPath = filePath + ".backup";
                if (File.Exists(backupPath))
                {
                    await Task.Run(() => File.Delete(backupPath), cancellationToken);
                    _logger.LogDebug($"Cleaned up backup file for user: {config.SourceUserPrincipalName}");
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Failed to remove sync configuration for user: {config.SourceUserPrincipalName}");
                throw; // Re-throw to maintain error handling in calling method
            }
        }

        #endregion

        #region Disposal

        public void Dispose()
        {
            _syncTimer?.Dispose();
            _syncSemaphore?.Dispose();
        }

        #endregion

        #region Helper Classes

        /// <summary>
        /// Attribute change information
        /// </summary>
        private class AttributeChange
        {
            public string AttributeName { get; set; }
            public string CurrentValue { get; set; }
            public string NewValue { get; set; }
            public string ChangeType { get; set; } // Add, Update, Remove
        }

        /// <summary>
        /// Attribute sync result
        /// </summary>
        private class AttributeSyncResult
        {
            public string AttributeName { get; set; }
            public string OldValue { get; set; }
            public string NewValue { get; set; }
            public bool IsSuccess { get; set; }
            public string ErrorMessage { get; set; }
            public bool HasConflict { get; set; }
            public string ConflictType { get; set; }
            public string ConflictResolution { get; set; }
        }

        #endregion
    }
}