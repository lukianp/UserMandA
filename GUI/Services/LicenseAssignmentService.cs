using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using Microsoft.Graph.Beta;
using Microsoft.Graph.Beta.Models;
using Microsoft.Identity.Client;
using MandADiscoverySuite.Models;
using System.Collections.Concurrent;

namespace MandADiscoverySuite.Services
{
    /// <summary>
    /// Enterprise license assignment and compliance service implementation for T-038.
    /// Provides comprehensive license management capabilities for M&A scenarios with Microsoft Graph API integration.
    /// </summary>
    public class LicenseAssignmentService : ILicenseAssignmentService
    {
        private readonly ILogger<LicenseAssignmentService> _logger;
        private readonly ICredentialStorageService _credentialService;
        private readonly ConcurrentDictionary<string, GraphServiceClient> _graphClients;
        private readonly ConcurrentDictionary<string, List<LicenseSku>> _skuCache;
        private readonly ConcurrentDictionary<string, BulkLicenseOperation> _bulkOperations;
        private readonly SemaphoreSlim _cacheSemaphore;
        
        // Required Graph API permissions for license operations
        private readonly string[] RequiredGraphPermissions = {
            "User.ReadWrite.All",
            "Directory.ReadWrite.All", 
            "Organization.Read.All",
            "LicenseAssignment.ReadWrite.All"
        };

        public LicenseAssignmentService(
            ILogger<LicenseAssignmentService> logger = null,
            ICredentialStorageService credentialService = null)
        {
            _logger = logger ?? Microsoft.Extensions.Logging.Abstractions.NullLogger<LicenseAssignmentService>.Instance;
            _credentialService = credentialService ?? new CredentialStorageService();
            _graphClients = new ConcurrentDictionary<string, GraphServiceClient>();
            _skuCache = new ConcurrentDictionary<string, List<LicenseSku>>();
            _bulkOperations = new ConcurrentDictionary<string, BulkLicenseOperation>();
            _cacheSemaphore = new SemaphoreSlim(1, 1);
        }

        #region Events

        public event EventHandler<LicenseOperationProgressEventArgs> OperationProgress;
        public event EventHandler<ComplianceIssueDetectedEventArgs> ComplianceIssueDetected;
        public event EventHandler<BulkOperationCompletedEventArgs> BulkOperationCompleted;

        private void OnOperationProgress(LicenseOperationProgressEventArgs args) => OperationProgress?.Invoke(this, args);
        private void OnComplianceIssueDetected(ComplianceIssueDetectedEventArgs args) => ComplianceIssueDetected?.Invoke(this, args);
        private void OnBulkOperationCompleted(BulkOperationCompletedEventArgs args) => BulkOperationCompleted?.Invoke(this, args);

        #endregion

        #region Graph Client Management

        private async Task<GraphServiceClient> GetGraphClientAsync(string tenantId)
        {
            if (_graphClients.TryGetValue(tenantId, out var existingClient))
                return existingClient;

            try
            {
                var credentials = await _credentialService.GetCredentialsAsync($"GraphAPI_{tenantId}");
                if (credentials == null)
                {
                    throw new InvalidOperationException($"No Graph API credentials found for tenant {tenantId}");
                }

                var app = ConfidentialClientApplicationBuilder
                    .Create(credentials.ClientId)
                    .WithClientSecret(credentials.ClientSecret)
                    .WithAuthority($"https://login.microsoftonline.com/{tenantId}")
                    .Build();

                var graphClient = new GraphServiceClient(app);

                // Test the connection
                try
                {
                    var organization = await graphClient.Organization.GetAsync();
                    _logger.LogInformation($"Successfully connected to tenant {tenantId}");
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, $"Failed to test Graph connection for tenant {tenantId}");
                    throw;
                }

                _graphClients.TryAdd(tenantId, graphClient);
                return graphClient;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Failed to create Graph client for tenant {tenantId}");
                throw;
            }
        }

        #endregion

        #region License Discovery and Management

        public async Task<List<LicenseSku>> GetAvailableLicenseSkusAsync(string tenantId, CancellationToken cancellationToken = default)
        {
            try
            {
                // Check cache first
                if (_skuCache.TryGetValue(tenantId, out var cachedSkus))
                {
                    _logger.LogDebug($"Returning cached license SKUs for tenant {tenantId} ({cachedSkus.Count} SKUs)");
                    return cachedSkus;
                }

                var graphClient = await GetGraphClientAsync(tenantId);
                var subscribedSkus = await graphClient.SubscribedSkus.GetAsync();
                var skuItems = subscribedSkus.Value?.ToList() ?? new List<SubscribedSku>();

                var skus = new List<LicenseSku>();
                
                foreach (var subscribedSku in skuItems)
                {
                    var sku = new LicenseSku
                    {
                        SkuId = subscribedSku.SkuId.ToString(),
                        SkuPartNumber = subscribedSku.SkuPartNumber,
                        DisplayName = GetSkuDisplayName(subscribedSku.SkuPartNumber),
                        AvailableUnits = (int)(subscribedSku.PrepaidUnits?.Enabled ?? 0),
                        AssignedUnits = (int)(subscribedSku.ConsumedUnits ?? 0),
                        IsEnabled = subscribedSku.CapabilityStatus == "Enabled",
                        LastUpdated = DateTime.Now
                    };

                    // Add service plans
                    if (subscribedSku.ServicePlans != null)
                    {
                        sku.ServicePlans = subscribedSku.ServicePlans.Select(sp => new ServicePlan
                        {
                            ServicePlanId = sp.ServicePlanId.ToString(),
                            ServicePlanName = sp.ServicePlanName,
                            DisplayName = sp.ServicePlanName,
                            ProvisioningStatus = sp.ProvisioningStatus,
                            IsEnabled = sp.ProvisioningStatus != "Disabled"
                        }).ToList();
                    }

                    // Set additional properties
                    sku.MonthlyCost = CommonLicenseSkus.SkuMonthlyCosts.GetValueOrDefault(sku.SkuPartNumber, 0);
                    sku.Tier = CommonLicenseSkus.SkuTiers.GetValueOrDefault(sku.SkuPartNumber, LicenseTier.Standard);
                    
                    skus.Add(sku);
                }

                // Cache the results
                await _cacheSemaphore.WaitAsync(cancellationToken);
                try
                {
                    _skuCache.TryAdd(tenantId, skus);
                }
                finally
                {
                    _cacheSemaphore.Release();
                }

                _logger.LogInformation($"Retrieved {skus.Count} license SKUs for tenant {tenantId}");
                return skus;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Failed to retrieve license SKUs for tenant {tenantId}");
                throw;
            }
        }

        public async Task<LicenseSku> GetLicenseSkuDetailsAsync(string tenantId, string skuId, CancellationToken cancellationToken = default)
        {
            try
            {
                var allSkus = await GetAvailableLicenseSkusAsync(tenantId, cancellationToken);
                var sku = allSkus.FirstOrDefault(s => s.SkuId == skuId);
                
                if (sku == null)
                {
                    throw new ArgumentException($"License SKU {skuId} not found in tenant {tenantId}");
                }

                _logger.LogDebug($"Retrieved details for license SKU {skuId} in tenant {tenantId}");
                return sku;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Failed to get license SKU details for {skuId} in tenant {tenantId}");
                throw;
            }
        }

        public async Task<int> RefreshLicenseSkuDataAsync(string tenantId, CancellationToken cancellationToken = default)
        {
            try
            {
                // Clear cache to force refresh
                await _cacheSemaphore.WaitAsync(cancellationToken);
                try
                {
                    _skuCache.TryRemove(tenantId, out _);
                }
                finally
                {
                    _cacheSemaphore.Release();
                }

                var skus = await GetAvailableLicenseSkusAsync(tenantId, cancellationToken);
                _logger.LogInformation($"Refreshed {skus.Count} license SKUs for tenant {tenantId}");
                return skus.Count;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Failed to refresh license SKU data for tenant {tenantId}");
                throw;
            }
        }

        #endregion

        #region User License Assignment

        public async Task<UserLicenseAssignment> GetUserLicenseAssignmentAsync(string tenantId, string userId, CancellationToken cancellationToken = default)
        {
            try
            {
                var graphClient = await GetGraphClientAsync(tenantId);
                var user = await graphClient.Users[userId]
                    .GetAsync(config => config.QueryParameters.Select = new string[] {"id","userPrincipalName","displayName","department","jobTitle","country","usageLocation","accountEnabled","assignedLicenses"});

                var assignment = new UserLicenseAssignment
                {
                    UserId = user.Id,
                    UserPrincipalName = user.UserPrincipalName,
                    DisplayName = user.DisplayName,
                    Department = user.Department,
                    JobTitle = user.JobTitle,
                    Country = user.Country,
                    UsageLocation = user.UsageLocation,
                    IsEnabled = user.AccountEnabled ?? true,
                    Status = LicenseAssignmentStatus.NotAssigned,
                    AssignedDate = DateTime.Now
                };

                // Get assigned licenses
                if (user.AssignedLicenses?.Any() == true)
                {
                    var availableSkus = await GetAvailableLicenseSkusAsync(tenantId, cancellationToken);
                    
                    foreach (var assignedLicense in user.AssignedLicenses)
                    {
                        var sku = availableSkus.FirstOrDefault(s => s.SkuId == assignedLicense.SkuId.ToString());
                        if (sku != null)
                        {
                            assignment.AssignedSkus.Add(sku);
                        }
                    }

                    assignment.Status = LicenseAssignmentStatus.Assigned;
                }

                _logger.LogDebug($"Retrieved license assignment for user {userId} in tenant {tenantId}");
                return assignment;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Failed to get license assignment for user {userId} in tenant {tenantId}");
                throw;
            }
        }

        public async Task<LicenseAssignmentResult> AssignLicensesToUserAsync(
            string tenantId, 
            string userId, 
            List<string> skuIds, 
            List<string> disableServicePlans = null, 
            CancellationToken cancellationToken = default)
        {
            var result = new LicenseAssignmentResult
            {
                UserId = userId,
                Operation = "Assign",
                ProcessedDate = DateTime.Now
            };

            var stopwatch = System.Diagnostics.Stopwatch.StartNew();

            try
            {
                var graphClient = await GetGraphClientAsync(tenantId);
                
                // Get current user info
                var user = await graphClient.Users[userId]
                    .GetAsync(config => config.QueryParameters.Select = new string[] {"userPrincipalName","assignedLicenses"});
                
                result.UserPrincipalName = user.UserPrincipalName;

                // Prepare license assignment requests
                var assignLicenses = new List<Microsoft.Graph.Models.AssignedLicense>();
                
                foreach (var skuId in skuIds)
                {
                    var assignedLicense = new Microsoft.Graph.Models.AssignedLicense
                    {
                        SkuId = Guid.Parse(skuId)
                    };

                    // Disable specified service plans
                    if (disableServicePlans?.Any() == true)
                    {
                        assignedLicense.DisabledPlans = disableServicePlans.Select(Guid.Parse).ToList();
                    }

                    assignLicenses.Add(assignedLicense);
                }

                // Create the license update request
                var assignLicensePostRequestBody = new Microsoft.Graph.Beta.Models.AssignLicensePostRequestBody
                {
                    AddLicenses = assignLicenses,
                    RemoveLicenses = new List<Guid?>()
                };

                // Execute the license assignment
                await graphClient.Users[userId].AssignLicense.PostAsync(assignLicensePostRequestBody);

                result.IsSuccess = true;
                result.AssignedSkus = skuIds;
                
                _logger.LogInformation($"Successfully assigned {skuIds.Count} licenses to user {userId} in tenant {tenantId}");
            }
            catch (Exception ex)
            {
                result.IsSuccess = false;
                result.Errors.Add($"License assignment failed: {ex.Message}");
                result.FailedSkus = skuIds;
                
                _logger.LogError(ex, $"Failed to assign licenses to user {userId} in tenant {tenantId}");
            }
            finally
            {
                stopwatch.Stop();
                result.ProcessingTime = stopwatch.Elapsed;
            }

            return result;
        }

        public async Task<LicenseAssignmentResult> RemoveLicensesFromUserAsync(
            string tenantId, 
            string userId, 
            List<string> skuIds, 
            CancellationToken cancellationToken = default)
        {
            var result = new LicenseAssignmentResult
            {
                UserId = userId,
                Operation = "Remove",
                ProcessedDate = DateTime.Now
            };

            var stopwatch = System.Diagnostics.Stopwatch.StartNew();

            try
            {
                var graphClient = await GetGraphClientAsync(tenantId);
                
                var user = await graphClient.Users[userId]
                    .GetAsync(config => config.QueryParameters.Select = new string[] {"userPrincipalName"});
                
                result.UserPrincipalName = user.UserPrincipalName;

                var removeLicenses = skuIds.Select(s => (Guid?)Guid.Parse(s)).ToList();

                var assignLicensePostRequestBody = new AssignLicensePostRequestBody
                {
                    AddLicenses = new List<AssignedLicense>(),
                    RemoveLicenses = removeLicenses
                };

                await graphClient.Users[userId].AssignLicense.PostAsync(assignLicensePostRequestBody);

                result.IsSuccess = true;
                result.RemovedSkus = skuIds;
                
                _logger.LogInformation($"Successfully removed {skuIds.Count} licenses from user {userId} in tenant {tenantId}");
            }
            catch (Exception ex)
            {
                result.IsSuccess = false;
                result.Errors.Add($"License removal failed: {ex.Message}");
                result.FailedSkus = skuIds;
                
                _logger.LogError(ex, $"Failed to remove licenses from user {userId} in tenant {tenantId}");
            }
            finally
            {
                stopwatch.Stop();
                result.ProcessingTime = stopwatch.Elapsed;
            }

            return result;
        }

        public async Task<LicenseAssignmentResult> UpdateUserLicenseAssignmentAsync(
            string tenantId, 
            string userId, 
            List<string> assignSkuIds = null, 
            List<string> removeSkuIds = null, 
            List<string> disableServicePlans = null, 
            CancellationToken cancellationToken = default)
        {
            var result = new LicenseAssignmentResult
            {
                UserId = userId,
                Operation = "Update",
                ProcessedDate = DateTime.Now
            };

            var stopwatch = System.Diagnostics.Stopwatch.StartNew();

            try
            {
                var graphClient = await GetGraphClientAsync(tenantId);
                
                var user = await graphClient.Users[userId]
                    .GetAsync(config => config.QueryParameters.Select = new string[] {"userPrincipalName"});
                
                result.UserPrincipalName = user.UserPrincipalName;

                var addLicenses = new List<AssignedLicense>();
                var removeLicenses = new List<Guid?>();

                // Prepare licenses to add
                if (assignSkuIds?.Any() == true)
                {
                    foreach (var skuId in assignSkuIds)
                    {
                        var assignedLicense = new AssignedLicense
                        {
                            SkuId = Guid.Parse(skuId)
                        };

                        if (disableServicePlans?.Any() == true)
                        {
                            assignedLicense.DisabledPlans = disableServicePlans.Select(Guid.Parse).ToList();
                        }

                        addLicenses.Add(assignedLicense);
                    }
                }

                // Prepare licenses to remove
                if (removeSkuIds?.Any() == true)
                {
                    removeLicenses = removeSkuIds.Select(s => (Guid?)Guid.Parse(s)).ToList();
                }

                var assignLicensePostRequestBody = new AssignLicensePostRequestBody
                {
                    AddLicenses = addLicenses,
                    RemoveLicenses = removeLicenses
                };

                await graphClient.Users[userId].AssignLicense.PostAsync(assignLicensePostRequestBody);

                result.IsSuccess = true;
                result.AssignedSkus = assignSkuIds ?? new List<string>();
                result.RemovedSkus = removeSkuIds ?? new List<string>();
                
                _logger.LogInformation($"Successfully updated licenses for user {userId} in tenant {tenantId}");
            }
            catch (Exception ex)
            {
                result.IsSuccess = false;
                result.Errors.Add($"License update failed: {ex.Message}");
                
                _logger.LogError(ex, $"Failed to update licenses for user {userId} in tenant {tenantId}");
            }
            finally
            {
                stopwatch.Stop();
                result.ProcessingTime = stopwatch.Elapsed;
            }

            return result;
        }

        #endregion

        #region Bulk Operations

        public async Task<BulkLicenseOperation> ExecuteBulkLicenseOperationAsync(
            string tenantId, 
            BulkLicenseOperation operation, 
            CancellationToken cancellationToken = default)
        {
            operation.Status = BulkOperationStatus.InProgress;
            operation.StartedDate = DateTime.Now;
            
            _bulkOperations.TryAdd(operation.Id, operation);

            try
            {
                _logger.LogInformation($"Starting bulk license operation {operation.Id} for {operation.TotalUsers} users");

                var semaphore = new SemaphoreSlim(5, 5); // Limit concurrent operations
                var tasks = new List<Task>();

                foreach (var userId in operation.UserIds)
                {
                    tasks.Add(ProcessUserInBulkOperationAsync(tenantId, operation, userId, semaphore, cancellationToken));
                }

                await Task.WhenAll(tasks);

                operation.Status = operation.FailedUsers > 0 
                    ? BulkOperationStatus.CompletedWithErrors 
                    : BulkOperationStatus.Completed;
                operation.CompletedDate = DateTime.Now;

                _logger.LogInformation($"Completed bulk operation {operation.Id}: {operation.SuccessfulUsers} successful, {operation.FailedUsers} failed");

                OnBulkOperationCompleted(new BulkOperationCompletedEventArgs { Operation = operation });
            }
            catch (Exception ex)
            {
                operation.Status = BulkOperationStatus.Failed;
                operation.CompletedDate = DateTime.Now;
                _logger.LogError(ex, $"Bulk operation {operation.Id} failed");
            }

            return operation;
        }

        private async Task ProcessUserInBulkOperationAsync(
            string tenantId, 
            BulkLicenseOperation operation, 
            string userId, 
            SemaphoreSlim semaphore, 
            CancellationToken cancellationToken)
        {
            await semaphore.WaitAsync(cancellationToken);
            
            try
            {
                LicenseAssignmentResult result;

                switch (operation.OperationType)
                {
                    case BulkLicenseOperationType.Assign:
                        result = await AssignLicensesToUserAsync(tenantId, userId, operation.SkuIds, 
                            operation.ServicePlansToDisable, cancellationToken);
                        break;
                    case BulkLicenseOperationType.Remove:
                        result = await RemoveLicensesFromUserAsync(tenantId, userId, operation.SkuIds, cancellationToken);
                        break;
                    case BulkLicenseOperationType.Update:
                        result = await UpdateUserLicenseAssignmentAsync(tenantId, userId, operation.SkuIds, 
                            null, operation.ServicePlansToDisable, cancellationToken);
                        break;
                    default:
                        throw new NotSupportedException($"Bulk operation type {operation.OperationType} is not supported");
                }

                operation.Results.Add(result);

                OnOperationProgress(new LicenseOperationProgressEventArgs
                {
                    OperationId = operation.Id,
                    OperationType = operation.OperationType.ToString(),
                    CurrentUser = result.UserPrincipalName,
                    ProcessedCount = operation.ProcessedUsers,
                    TotalCount = operation.TotalUsers,
                    Status = result.IsSuccess ? "Success" : "Failed"
                });
            }
            catch (Exception ex)
            {
                var errorResult = new LicenseAssignmentResult
                {
                    UserId = userId,
                    IsSuccess = false,
                    Operation = operation.OperationType.ToString(),
                    Errors = new List<string> { ex.Message }
                };
                operation.Results.Add(errorResult);

                _logger.LogError(ex, $"Failed to process user {userId} in bulk operation {operation.Id}");
            }
            finally
            {
                semaphore.Release();
            }
        }

        public async Task<BulkLicenseOperation> GetBulkOperationStatusAsync(string operationId)
        {
            _bulkOperations.TryGetValue(operationId, out var operation);
            return await Task.FromResult(operation);
        }

        public async Task<bool> CancelBulkOperationAsync(string operationId)
        {
            if (_bulkOperations.TryGetValue(operationId, out var operation))
            {
                if (operation.Status == BulkOperationStatus.InProgress)
                {
                    operation.Status = BulkOperationStatus.Cancelled;
                    operation.CompletedDate = DateTime.Now;
                    _logger.LogInformation($"Cancelled bulk operation {operationId}");
                    return true;
                }
            }
            return false;
        }

        #endregion

        #region License Mapping and Rules

        public async Task<LicenseMappingRule> SaveLicenseMappingRuleAsync(LicenseMappingRule rule, CancellationToken cancellationToken = default)
        {
            // Validate the rule
            var validationResult = await ValidateLicenseMappingRuleAsync(rule);
            if (!validationResult.IsValid)
            {
                rule.IsValid = false;
                rule.ValidationErrors = validationResult.Errors;
            }
            else
            {
                rule.IsValid = true;
                rule.ValidationErrors.Clear();
            }

            rule.LastModified = DateTime.Now;
            
            // In a real implementation, this would save to a database or configuration store
            _logger.LogInformation($"Saved license mapping rule {rule.Id}: {rule.Name}");
            return rule;
        }

        public async Task<List<LicenseMappingRule>> GetLicenseMappingRulesAsync(CancellationToken cancellationToken = default)
        {
            // In a real implementation, this would retrieve from a database or configuration store
            return await Task.FromResult(new List<LicenseMappingRule>());
        }

        public async Task<List<string>> ApplyLicenseMappingRulesAsync(UserData user, List<LicenseMappingRule> rules = null)
        {
            if (rules == null)
            {
                rules = await GetLicenseMappingRulesAsync();
            }

            var recommendedSkus = new List<string>();

            foreach (var rule in rules.Where(r => r.IsEnabled && r.IsValid).OrderBy(r => r.Priority))
            {
                if (EvaluateRuleConditions(user, rule.Conditions))
                {
                    recommendedSkus.AddRange(rule.AssignSkuIds);
                    rule.TimesApplied++;
                    rule.LastApplied = DateTime.Now;
                    rule.AffectedUsers.Add(user.UserPrincipalName ?? user.SamAccountName);
                }
            }

            return recommendedSkus.Distinct().ToList();
        }

        private bool EvaluateRuleConditions(UserData user, List<LicenseRuleCondition> conditions)
        {
            if (conditions?.Any() != true) return true;

            var results = new List<bool>();

            foreach (var condition in conditions)
            {
                var userValue = GetUserPropertyValue(user, condition.Property);
                var conditionResult = EvaluateCondition(userValue, condition);
                results.Add(conditionResult);
            }

            // Apply logic operators (simplified - assumes all conditions use same logic)
            var logic = conditions.FirstOrDefault()?.Logic ?? LicenseRuleLogic.And;
            return logic == LicenseRuleLogic.And ? results.All(r => r) : results.Any(r => r);
        }

        private string GetUserPropertyValue(UserData user, string property)
        {
            return property?.ToLower() switch
            {
                "department" => user.Department,
                "jobtitle" => user.JobTitle,
                "country" => user.Country,
                "company" => user.Company,
                "userprincipalname" => user.UserPrincipalName,
                "samaccountname" => user.SamAccountName,
                "displayname" => user.DisplayName,
                _ => string.Empty
            };
        }

        private bool EvaluateCondition(string userValue, LicenseRuleCondition condition)
        {
            if (string.IsNullOrEmpty(userValue) && condition.Operator != LicenseRuleOperator.IsEmpty)
                return false;

            var compareValue = condition.Value ?? string.Empty;
            if (!condition.IsCaseSensitive)
            {
                userValue = userValue?.ToLowerInvariant() ?? string.Empty;
                compareValue = compareValue.ToLowerInvariant();
            }

            return condition.Operator switch
            {
                LicenseRuleOperator.Equals => userValue == compareValue,
                LicenseRuleOperator.NotEquals => userValue != compareValue,
                LicenseRuleOperator.Contains => userValue.Contains(compareValue),
                LicenseRuleOperator.NotContains => !userValue.Contains(compareValue),
                LicenseRuleOperator.StartsWith => userValue.StartsWith(compareValue),
                LicenseRuleOperator.EndsWith => userValue.EndsWith(compareValue),
                LicenseRuleOperator.IsEmpty => string.IsNullOrWhiteSpace(userValue),
                LicenseRuleOperator.IsNotEmpty => !string.IsNullOrWhiteSpace(userValue),
                _ => false
            };
        }

        public async Task<LicenseRuleValidationResult> ValidateLicenseMappingRuleAsync(LicenseMappingRule rule)
        {
            var result = new LicenseRuleValidationResult { IsValid = true };

            // Basic validation
            if (string.IsNullOrWhiteSpace(rule.Name))
            {
                result.Errors.Add("Rule name is required");
                result.IsValid = false;
            }

            if (rule.Conditions?.Any() != true)
            {
                result.Warnings.Add("Rule has no conditions and will apply to all users");
            }

            if (rule.AssignSkuIds?.Any() != true)
            {
                result.Errors.Add("Rule must specify at least one license SKU to assign");
                result.IsValid = false;
            }

            return await Task.FromResult(result);
        }

        #endregion

        #region Migration Integration

        public async Task<WaveLicenseProcessingResult> ProcessWaveLicenseAssignmentsAsync(
            string tenantId, 
            string waveId, 
            List<UserData> users, 
            WaveLicenseSettings settings, 
            CancellationToken cancellationToken = default)
        {
            var result = new WaveLicenseProcessingResult
            {
                WaveId = waveId,
                WaveName = settings.WaveName,
                TotalUsers = users.Count,
                ProcessedAt = DateTime.Now
            };

            var stopwatch = System.Diagnostics.Stopwatch.StartNew();

            try
            {
                _logger.LogInformation($"Processing license assignments for wave {waveId} with {users.Count} users");

                foreach (var user in users ?? new List<UserData>())
                {
                    try
                    {
                        // Apply license mapping rules to determine required licenses
                        var requiredSkus = settings.AutoAssignLicenses 
                            ? await ApplyLicenseMappingRulesAsync(user, settings.CustomMappingRules)
                            : settings.DefaultSkuIds;

                        if (requiredSkus?.Any() == true)
                        {
                            var assignmentResult = await AssignLicensesToUserAsync(
                                tenantId, 
                                user.UserPrincipalName ?? user.SamAccountName, 
                                requiredSkus, 
                                null, 
                                cancellationToken);

                            result.Results.Add(assignmentResult);

                            if (assignmentResult.IsSuccess)
                            {
                                result.SuccessfulAssignments++;
                                
                                // Calculate cost
                                var availableSkus = await GetAvailableLicenseSkusAsync(tenantId, cancellationToken);
                                result.TotalCost += requiredSkus.Sum(skuId => 
                                    availableSkus.FirstOrDefault(s => s.SkuId == skuId)?.MonthlyCost ?? 0);
                            }
                            else
                            {
                                result.FailedAssignments++;
                            }
                        }

                        result.ProcessedUsers++;

                        OnOperationProgress(new LicenseOperationProgressEventArgs
                        {
                            OperationId = waveId,
                            OperationType = "Wave License Assignment",
                            CurrentUser = user.UserPrincipalName ?? user.DisplayName,
                            ProcessedCount = result.ProcessedUsers,
                            TotalCount = result.TotalUsers,
                            Status = "Processing"
                        });
                    }
                    catch (Exception ex)
                    {
                        result.FailedAssignments++;
                        result.Results.Add(new LicenseAssignmentResult
                        {
                            UserId = user.UserPrincipalName,
                            UserPrincipalName = user.UserPrincipalName,
                            IsSuccess = false,
                            Operation = "Wave Assignment",
                            Errors = new List<string> { ex.Message }
                        });

                        _logger.LogError(ex, $"Failed to process licenses for user {user.UserPrincipalName} in wave {waveId}");
                    }
                }

                stopwatch.Stop();
                result.ProcessingTime = stopwatch.Elapsed;

                _logger.LogInformation($"Completed wave license processing: {result.SuccessfulAssignments} successful, {result.FailedAssignments} failed");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Failed to process wave license assignments for wave {waveId}");
                throw;
            }

            return result;
        }

        public async Task<WaveLicenseValidationResult> ValidateWaveLicenseRequirementsAsync(
            string tenantId, 
            List<UserData> users, 
            WaveLicenseSettings settings)
        {
            var result = new WaveLicenseValidationResult
            {
                WaveId = settings.WaveId,
                IsValid = true
            };

            try
            {
                var availableSkus = await GetAvailableLicenseSkusAsync(tenantId);
                var skuLookup = availableSkus.ToDictionary(s => s.SkuId, s => s);

                foreach (var user in users ?? new List<UserData>())
                {
                    var requiredSkus = settings.AutoAssignLicenses
                        ? await ApplyLicenseMappingRulesAsync(user, settings.CustomMappingRules)
                        : settings.DefaultSkuIds;

                    if (requiredSkus?.Any() == true)
                    {
                        var userRequirement = new UserLicenseRequirement
                        {
                            UserId = user.UserPrincipalName,
                            UserPrincipalName = user.UserPrincipalName,
                            DisplayName = user.DisplayName,
                            RequiredSkuIds = requiredSkus
                        };

                        foreach (var skuId in requiredSkus)
                        {
                            // Track required licenses
                            if (!result.RequiredLicenses.ContainsKey(skuId))
                                result.RequiredLicenses[skuId] = 0;
                            result.RequiredLicenses[skuId]++;

                            // Check availability
                            if (skuLookup.TryGetValue(skuId, out var sku))
                            {
                                if (!result.AvailableLicenses.ContainsKey(skuId))
                                    result.AvailableLicenses[skuId] = sku.RemainingUnits;

                                userRequirement.EstimatedMonthlyCost += sku.MonthlyCost;
                            }
                            else
                            {
                                userRequirement.ValidationIssues.Add($"License SKU {skuId} not available in tenant");
                                result.ValidationWarnings.Add($"User {user.UserPrincipalName} requires unavailable license SKU {skuId}");
                            }
                        }

                        result.UserRequirements.Add(userRequirement);
                        result.EstimatedMonthlyCost += userRequirement.EstimatedMonthlyCost;
                    }
                }

                // Check for license shortfalls
                foreach (var requiredLicense in result.RequiredLicenses)
                {
                    var required = requiredLicense.Value;
                    var available = result.AvailableLicenses.GetValueOrDefault(requiredLicense.Key, 0);
                    
                    if (required > available)
                    {
                        var shortfall = required - available;
                        result.LicenseShortfall[requiredLicense.Key] = shortfall;
                        result.ValidationErrors.Add($"Insufficient {requiredLicense.Key} licenses: need {required}, have {available} (shortfall: {shortfall})");
                        result.IsValid = false;
                    }
                }

                result.UsersRequiringLicenses = result.UserRequirements.Count(u => u.RequiredSkuIds.Any());

                _logger.LogInformation($"Wave license validation completed: {result.UserRequirements.Count} users validated, {result.ValidationErrors.Count} errors");
            }
            catch (Exception ex)
            {
                result.IsValid = false;
                result.ValidationErrors.Add($"Validation failed: {ex.Message}");
                _logger.LogError(ex, $"Failed to validate wave license requirements");
            }

            return result;
        }

        public async Task<List<LicenseAssignmentResult>> RemoveSourceLicensesAsync(
            string sourceTenantId, 
            List<string> userIds, 
            CancellationToken cancellationToken = default)
        {
            var results = new List<LicenseAssignmentResult>();

            try
            {
                var sourceGraphClient = await GetGraphClientAsync(sourceTenantId);
                
                foreach (var userId in userIds)
                {
                    try
                    {
                        // Get user's current licenses
                        var user = await sourceGraphClient.Users[userId]
                            .GetAsync(config => config.QueryParameters.Select = new string[] {"assignedLicenses"});

                        if (user.AssignedLicenses?.Any() == true)
                        {
                            var skusToRemove = user.AssignedLicenses.Select(l => l.SkuId.ToString()).ToList();
                            var result = await RemoveLicensesFromUserAsync(sourceTenantId, userId, skusToRemove, cancellationToken);
                            results.Add(result);
                        }
                    }
                    catch (Exception ex)
                    {
                        results.Add(new LicenseAssignmentResult
                        {
                            UserId = userId,
                            IsSuccess = false,
                            Operation = "Remove Source Licenses",
                            Errors = new List<string> { ex.Message }
                        });
                    }
                }

                _logger.LogInformation($"Processed source license removal for {userIds.Count} users");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Failed to remove source licenses for tenant {sourceTenantId}");
                throw;
            }

            return results;
        }

        #endregion

        #region Compliance and Reporting

        public async Task<LicenseComplianceReport> GenerateComplianceReportAsync(
            string tenantId, 
            bool includeUsers = true, 
            bool includeIssues = true, 
            CancellationToken cancellationToken = default)
        {
            var report = new LicenseComplianceReport
            {
                Name = $"License Compliance Report - {DateTime.Now:yyyy-MM-dd}",
                GeneratedDate = DateTime.Now,
                GeneratedBy = Environment.UserName
            };

            var stopwatch = System.Diagnostics.Stopwatch.StartNew();

            try
            {
                // Get available SKUs
                report.AvailableSkus = await GetAvailableLicenseSkusAsync(tenantId, cancellationToken);

                // Get all users if requested
                if (includeUsers)
                {
                    var graphClient = await GetGraphClientAsync(tenantId);
                    var users = await graphClient.Users
                        .GetAsync(config => config.QueryParameters.Select = new string[] {"id","userPrincipalName","displayName","assignedLicenses","accountEnabled"});

                    foreach (var user in users?.Value ?? new List<Microsoft.Graph.Models.User>())
                    {
                        var assignment = new UserLicenseAssignment
                        {
                            UserId = user.Id,
                            UserPrincipalName = user.UserPrincipalName,
                            DisplayName = user.DisplayName,
                            IsEnabled = user.AccountEnabled ?? true,
                            Status = user.AssignedLicenses?.Any() == true 
                                ? LicenseAssignmentStatus.Assigned 
                                : LicenseAssignmentStatus.NotAssigned
                        };

                        // Map assigned licenses
                        if (user.AssignedLicenses?.Any() == true)
                        {
                            foreach (var assignedLicense in user.AssignedLicenses)
                            {
                                var sku = report.AvailableSkus.FirstOrDefault(s => s.SkuId == assignedLicense.SkuId.ToString());
                                if (sku != null)
                                {
                                    assignment.AssignedSkus.Add(sku);
                                }
                            }
                        }

                        report.UserAssignments.Add(assignment);
                    }
                }

                // Scan for compliance issues if requested
                if (includeIssues)
                {
                    report.ComplianceIssues = await ScanForComplianceIssuesAsync(tenantId, null, cancellationToken);
                }

                // Calculate statistics
                report.TotalUsers = report.UserAssignments.Count;
                report.CompliantUsers = report.UserAssignments.Count(u => u.IsCompliant);
                report.NonCompliantUsers = report.UserAssignments.Count(u => !u.IsCompliant);
                report.UnlicensedUsers = report.UserAssignments.Count(u => u.Status == LicenseAssignmentStatus.NotAssigned);

                // Calculate SKU utilization
                foreach (var sku in report.AvailableSkus)
                {
                    report.SkuUtilization[sku.DisplayName] = sku.AssignedUnits;
                    report.CostBreakdown[sku.DisplayName] = sku.AssignedUnits * sku.MonthlyCost;
                }

                stopwatch.Stop();
                report.GenerationTime = stopwatch.Elapsed;

                _logger.LogInformation($"Generated compliance report: {report.TotalUsers} users, {report.TotalComplianceIssues} issues");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Failed to generate compliance report for tenant {tenantId}");
                throw;
            }

            return report;
        }

        public async Task<List<ComplianceIssue>> ScanForComplianceIssuesAsync(
            string tenantId, 
            List<string> userIds = null, 
            CancellationToken cancellationToken = default)
        {
            var issues = new List<ComplianceIssue>();

            try
            {
                var graphClient = await GetGraphClientAsync(tenantId);
                
                var users = await graphClient.Users.GetAsync(config => 
                {
                    config.QueryParameters.Select = new string[] {"id","userPrincipalName","displayName","assignedLicenses","accountEnabled","usageLocation"};
                    if (userIds?.Any() == true)
                    {
                        config.QueryParameters.Filter = $"id in ('{string.Join("','", userIds)}')";
                    }
                });

                foreach (var user in users?.Value ?? new List<Microsoft.Graph.Models.User>())
                {
                    // Check for users without usage location
                    if (string.IsNullOrEmpty(user.UsageLocation) && user.AssignedLicenses?.Any() == true)
                    {
                        issues.Add(new ComplianceIssue
                        {
                            UserId = user.Id,
                            UserPrincipalName = user.UserPrincipalName,
                            IssueType = "Missing Usage Location",
                            Severity = "High",
                            Description = "User has assigned licenses but no usage location set",
                            RecommendedAction = "Set usage location for the user",
                            DetectedDate = DateTime.Now
                        });
                    }

                    // Check for disabled users with licenses
                    if (user.AccountEnabled == false && user.AssignedLicenses?.Any() == true)
                    {
                        issues.Add(new ComplianceIssue
                        {
                            UserId = user.Id,
                            UserPrincipalName = user.UserPrincipalName,
                            IssueType = "Disabled User with Licenses",
                            Severity = "Medium",
                            Description = "Disabled user account has assigned licenses",
                            RecommendedAction = "Remove licenses from disabled user account",
                            DetectedDate = DateTime.Now
                        });
                    }

                    // Check for enabled users without licenses
                    if (user.AccountEnabled == true && (user.AssignedLicenses?.Any() != true))
                    {
                        issues.Add(new ComplianceIssue
                        {
                            UserId = user.Id,
                            UserPrincipalName = user.UserPrincipalName,
                            IssueType = "Active User without Licenses",
                            Severity = "Low",
                            Description = "Active user account has no assigned licenses",
                            RecommendedAction = "Review if user requires license assignment",
                            DetectedDate = DateTime.Now
                        });
                    }
                }

                _logger.LogInformation($"Compliance scan completed: {issues.Count} issues found");

                // Fire compliance issue events
                foreach (var issue in issues)
                {
                    OnComplianceIssueDetected(new ComplianceIssueDetectedEventArgs
                    {
                        Issue = issue,
                        TenantId = tenantId,
                        Context = "Compliance Scan"
                    });
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Failed to scan for compliance issues in tenant {tenantId}");
                throw;
            }

            return issues;
        }

        public async Task<bool> ResolveComplianceIssueAsync(
            string issueId, 
            string resolution, 
            string resolvedBy, 
            CancellationToken cancellationToken = default)
        {
            // In a real implementation, this would update the issue in a database
            _logger.LogInformation($"Compliance issue {issueId} resolved by {resolvedBy}: {resolution}");
            return await Task.FromResult(true);
        }

        public async Task<LicenseUtilizationStats> GetLicenseUtilizationStatsAsync(string tenantId, CancellationToken cancellationToken = default)
        {
            try
            {
                var availableSkus = await GetAvailableLicenseSkusAsync(tenantId, cancellationToken);
                
                var stats = new LicenseUtilizationStats
                {
                    TenantId = tenantId,
                    GeneratedAt = DateTime.Now,
                    TotalSkus = availableSkus.Count
                };

                foreach (var sku in availableSkus)
                {
                    stats.TotalPurchasedLicenses += sku.AvailableUnits;
                    stats.TotalAssignedLicenses += sku.AssignedUnits;
                    stats.TotalMonthlyCost += sku.AssignedUnits * sku.MonthlyCost;

                    var skuInfo = new SkuUtilizationInfo
                    {
                        SkuId = sku.SkuId,
                        DisplayName = sku.DisplayName,
                        PurchasedUnits = sku.AvailableUnits,
                        AssignedUnits = sku.AssignedUnits,
                        AvailableUnits = sku.RemainingUnits,
                        UtilizationPercentage = sku.UtilizationPercentage,
                        MonthlyCostPerUnit = sku.MonthlyCost,
                        TotalMonthlyCost = sku.AssignedUnits * sku.MonthlyCost,
                        LastUpdated = sku.LastUpdated
                    };

                    stats.SkuUtilization[sku.SkuId] = skuInfo;

                    // Identify over/under utilized SKUs
                    if (sku.UtilizationPercentage > 90)
                        stats.OverUtilizedSkus.Add(sku.SkuId);
                    else if (sku.UtilizationPercentage < 50 && sku.AssignedUnits > 0)
                        stats.UnderUtilizedSkus.Add(sku.SkuId);
                }

                stats.TotalAvailableLicenses = stats.TotalPurchasedLicenses - stats.TotalAssignedLicenses;
                stats.OverallUtilizationPercentage = stats.TotalPurchasedLicenses > 0 
                    ? (double)stats.TotalAssignedLicenses / stats.TotalPurchasedLicenses * 100 
                    : 0;

                _logger.LogInformation($"Generated utilization stats for tenant {tenantId}: {stats.TotalAssignedLicenses}/{stats.TotalPurchasedLicenses} licenses assigned ({stats.OverallUtilizationPercentage:F1}% utilization)");

                return stats;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Failed to get license utilization stats for tenant {tenantId}");
                throw;
            }
        }

        #endregion

        #region Graph API Integration

        public async Task<GraphConnectivityResult> TestGraphConnectivityAsync(string tenantId, CancellationToken cancellationToken = default)
        {
            var result = new GraphConnectivityResult
            {
                TenantId = tenantId,
                TestedAt = DateTime.Now
            };

            var stopwatch = System.Diagnostics.Stopwatch.StartNew();

            try
            {
                var graphClient = await GetGraphClientAsync(tenantId);

                // Test various endpoints
                var endpoints = new Dictionary<string, Func<Task>>
                {
                    { "Organization", async () => await graphClient.Organization.GetAsync() },
                    { "Users", async () => await graphClient.Users.GetAsync(config => config.QueryParameters.Top = 1) },
                    { "SubscribedSkus", async () => await graphClient.SubscribedSkus.GetAsync() },
                    { "ServicePrincipals", async () => await graphClient.ServicePrincipals.GetAsync(config => config.QueryParameters.Top = 1) }
                };

                foreach (var endpoint in endpoints)
                {
                    try
                    {
                        await endpoint.Value();
                        result.SuccessfulEndpoints.Add(endpoint.Key);
                    }
                    catch (Exception ex)
                    {
                        result.FailedEndpoints.Add(endpoint.Key);
                        result.EndpointErrors[endpoint.Key] = ex.Message;
                    }
                }

                // Get tenant information
                try
                {
                    var organization = await graphClient.Organization.GetAsync();
                    var org = organization.Value?.FirstOrDefault();
                    if (org != null)
                    {
                        result.TenantDisplayName = org.DisplayName;
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "Could not retrieve tenant display name");
                }

                result.IsConnected = result.SuccessfulEndpoints.Any();
                result.AuthenticationMethod = "Client Credentials";
                result.GraphVersion = "v1.0";

                stopwatch.Stop();
                result.ResponseTime = stopwatch.Elapsed;

                _logger.LogInformation($"Graph connectivity test completed for tenant {tenantId}: {result.SuccessfulEndpoints.Count} successful, {result.FailedEndpoints.Count} failed");
            }
            catch (Exception ex)
            {
                result.IsConnected = false;
                result.EndpointErrors["Authentication"] = ex.Message;
                _logger.LogError(ex, $"Graph connectivity test failed for tenant {tenantId}");
            }

            return result;
        }

        public async Task<GraphPermissionValidationResult> ValidateGraphPermissionsAsync(string tenantId)
        {
            var result = new GraphPermissionValidationResult
            {
                RequiredPermissions = RequiredGraphPermissions.ToList(),
                ValidatedAt = DateTime.Now
            };

            try
            {
                var graphClient = await GetGraphClientAsync(tenantId);

                // Get the current application's service principal
                var servicePrincipals = await graphClient.ServicePrincipals
                    .GetAsync(config => config.QueryParameters.Filter = "appRoles/any(r:r/id eq guid'00000000-0000-0000-0000-000000000000')");

                // In a real implementation, you would check the actual permissions granted to the service principal
                // For now, we'll do basic endpoint testing to infer permissions

                var permissionTests = new Dictionary<string, Func<Task>>
                {
                    { "User.ReadWrite.All", async () => await graphClient.Users.GetAsync(config => config.QueryParameters.Top = 1) },
                    { "Directory.ReadWrite.All", async () => await graphClient.Users.GetAsync(config => config.QueryParameters.Top = 1) },
                    { "Organization.Read.All", async () => await graphClient.Organization.GetAsync() },
                    { "LicenseAssignment.ReadWrite.All", async () => await graphClient.SubscribedSkus.GetAsync() }
                };

                foreach (var test in permissionTests)
                {
                    try
                    {
                        await test.Value();
                        result.GrantedPermissions.Add(test.Key);
                    }
                    catch (Exception)
                    {
                        // Permission likely not granted
                    }
                }

                result.MissingPermissions = result.RequiredPermissions.Except(result.GrantedPermissions).ToList();
                result.HasRequiredPermissions = !result.MissingPermissions.Any();

                _logger.LogInformation($"Permission validation completed for tenant {tenantId}: {result.GrantedPermissions.Count} granted, {result.MissingPermissions.Count} missing");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Failed to validate Graph permissions for tenant {tenantId}");
            }

            return result;
        }

        #endregion

        #region Helper Methods

        private string GetSkuDisplayName(string skuPartNumber)
        {
            return CommonLicenseSkus.SkuDisplayNames.GetValueOrDefault(skuPartNumber, skuPartNumber);
        }

        #endregion

        #region IDisposable Implementation

        public void Dispose()
        {
            _cacheSemaphore?.Dispose();
            
            foreach (var client in _graphClients.Values)
            {
                // GraphServiceClient doesn't implement IDisposable, so we can't dispose it directly
            }
            
            _graphClients.Clear();
            _skuCache.Clear();
            _bulkOperations.Clear();
        }

        #endregion
    }
}