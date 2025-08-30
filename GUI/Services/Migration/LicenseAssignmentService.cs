using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using System.Linq;
using Microsoft.Graph;
using Microsoft.Extensions.Logging;
using MandADiscoverySuite.Models;

namespace MandADiscoverySuite.Services.Migration
{
    /// <summary>
    /// License assignment service implementing T-038: License Assignment and Compliance
    /// Manages Microsoft 365 license assignment, compliance checking, and cost optimization
    /// </summary>
    public class LicenseAssignmentService : ILicenseAssignmentService
    {
        private readonly GraphServiceClient _graphServiceClient;
        private readonly ILogger<LicenseAssignmentService> _logger;
        private readonly Dictionary<string, LicenseBusinessRule> _businessRules;
        private readonly Dictionary<string, decimal> _licenseCosts;

        public LicenseAssignmentService(GraphServiceClient graphServiceClient, ILogger<LicenseAssignmentService> logger)
        {
            _graphServiceClient = graphServiceClient ?? throw new ArgumentNullException(nameof(graphServiceClient));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
            
            // Initialize license business rules and cost matrix
            _businessRules = InitializeLicenseBusinessRules();
            _licenseCosts = InitializeLicenseCostMatrix();
        }

        public async Task<LicenseAssignmentResult> AssignLicensesAsync(string userPrincipalName, List<string> requestedLicenses, MigrationContext context, CancellationToken cancellationToken = default)
        {
            var result = new LicenseAssignmentResult
            {
                UserPrincipalName = userPrincipalName,
                AssignmentDate = DateTime.Now
            };

            try
            {
                _logger.LogInformation($"Starting license assignment for user: {userPrincipalName}, Licenses: {string.Join(", ", requestedLicenses)}");
                context.ReportProgress("License Assignment", 0, $"Starting license assignment for {userPrincipalName}");

                // Step 1: Validate license availability
                var inventoryResult = await GetAvailableLicensesAsync(context, cancellationToken);
                if (!inventoryResult.HasCapacityIssues)
                {
                    foreach (var license in requestedLicenses)
                    {
                        if (!inventoryResult.RemainingCapacity.ContainsKey(license) || inventoryResult.RemainingCapacity[license] <= 0)
                        {
                            result.FailedLicenses.Add(license);
                            result.Errors.Add($"Insufficient capacity for license: {license}");
                        }
                    }
                }

                context.ReportProgress("License Assignment", 25, "License availability validated");

                // Step 2: Apply business rules validation
                var availableLicenses = requestedLicenses.Except(result.FailedLicenses).ToList();
                var businessRuleValidation = await ValidateBusinessRulesAsync(userPrincipalName, availableLicenses, context, cancellationToken);
                
                // Remove prohibited licenses
                var allowedLicenses = availableLicenses.Except(businessRuleValidation.ProhibitedLicenses).ToList();
                result.FailedLicenses.AddRange(businessRuleValidation.ProhibitedLicenses);
                
                foreach (var prohibited in businessRuleValidation.ProhibitedLicenses)
                {
                    result.Warnings.Add($"License {prohibited} prohibited by business rule: {businessRuleValidation.ViolationReasons.GetValueOrDefault(prohibited, "Policy violation")}");
                }

                context.ReportProgress("License Assignment", 50, "Business rules validated");

                // Step 3: Perform license assignments via Graph API
                foreach (var license in allowedLicenses)
                {
                    try
                    {
                        var assignmentResult = await AssignSingleLicenseAsync(userPrincipalName, license, context, cancellationToken);
                        if (assignmentResult.IsSuccess)
                        {
                            result.AssignedLicenses.Add(license);
                            
                            // Calculate cost impact
                            if (_licenseCosts.TryGetValue(license, out var cost))
                            {
                                result.EstimatedMonthlyCost += cost;
                            }

                            // Store license details
                            result.LicenseDetails[license] = assignmentResult.LicenseDetails;
                        }
                        else
                        {
                            result.FailedLicenses.Add(license);
                            result.Errors.AddRange(assignmentResult.Errors);
                        }
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, $"Failed to assign license {license} to user {userPrincipalName}");
                        result.FailedLicenses.Add(license);
                        result.Errors.Add($"License assignment failed for {license}: {ex.Message}");
                    }
                }

                context.ReportProgress("License Assignment", 100, "License assignment completed");

                result.IsSuccess = result.AssignedLicenses.Count > 0 && result.Errors.Count == 0;

                _logger.LogInformation($"License assignment completed for {userPrincipalName}: {result.AssignedLicenses.Count} assigned, {result.FailedLicenses.Count} failed");
                context.AuditLogger?.LogMigrationComplete(context.SessionId, "License", userPrincipalName, result.IsSuccess, 
                    $"Assigned: {string.Join(", ", result.AssignedLicenses)}, Failed: {string.Join(", ", result.FailedLicenses)}");

                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"License assignment failed for user: {userPrincipalName}");
                result.IsSuccess = false;
                result.Errors.Add($"License assignment failed: {ex.Message}");
                context.AuditLogger?.LogMigrationComplete(context.SessionId, "License", userPrincipalName, false, ex.Message);
                return result;
            }
        }

        public async Task<LicenseRemovalResult> RemoveLicensesAsync(string userPrincipalName, List<string> licensesToRemove, MigrationContext context, CancellationToken cancellationToken = default)
        {
            var result = new LicenseRemovalResult
            {
                UserPrincipalName = userPrincipalName,
                RemovalDate = DateTime.Now
            };

            try
            {
                _logger.LogInformation($"Starting license removal for user: {userPrincipalName}, Licenses: {string.Join(", ", licensesToRemove)}");

                // Get current user licenses to determine what can be removed
                var currentLicenses = await GetUserCurrentLicensesAsync(userPrincipalName, cancellationToken);

                foreach (var license in licensesToRemove)
                {
                    try
                    {
                        if (currentLicenses.Contains(license))
                        {
                            var removalResult = await RemoveSingleLicenseAsync(userPrincipalName, license, context, cancellationToken);
                            if (removalResult.IsSuccess)
                            {
                                result.RemovedLicenses.Add(license);
                                
                                // Calculate cost savings
                                if (_licenseCosts.TryGetValue(license, out var cost))
                                {
                                    result.MonthlySavings += cost;
                                }
                            }
                            else
                            {
                                result.Errors.AddRange(removalResult.Errors);
                            }
                        }
                        else
                        {
                            result.RetainedLicenses.Add(license); // Not currently assigned
                        }
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, $"Failed to remove license {license} from user {userPrincipalName}");
                        result.Errors.Add($"License removal failed for {license}: {ex.Message}");
                    }
                }

                result.IsSuccess = result.Errors.Count == 0;
                result.RemovalReason = "Cost optimization and compliance";

                _logger.LogInformation($"License removal completed for {userPrincipalName}: {result.RemovedLicenses.Count} removed, Savings: ${result.MonthlySavings:F2}/month");
                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"License removal failed for user: {userPrincipalName}");
                result.IsSuccess = false;
                result.Errors.Add($"License removal failed: {ex.Message}");
                return result;
            }
        }

        public async Task<LicenseComplianceResult> CheckComplianceAsync(string userPrincipalName, MigrationContext context, CancellationToken cancellationToken = default)
        {
            var result = new LicenseComplianceResult
            {
                UserPrincipalName = userPrincipalName,
                ComplianceCheckDate = DateTime.Now,
                ComplianceLevel = context.ComplianceLevel
            };

            try
            {
                _logger.LogInformation($"Checking license compliance for user: {userPrincipalName}");

                // Get current user licenses
                var currentLicenses = await GetUserCurrentLicensesAsync(userPrincipalName, cancellationToken);
                
                // Get user role-based requirements
                var userProfile = await GetUserProfileForComplianceAsync(userPrincipalName, context, cancellationToken);
                var licenseMapping = await MapUserRoleToLicensesAsync(userProfile, context, cancellationToken);
                
                result.RequiredLicenses = licenseMapping.RecommendedLicenses;

                // Check for missing licenses
                result.MissingLicenses = result.RequiredLicenses.Except(currentLicenses).ToList();
                
                // Check for excess licenses
                result.ExcessLicenses = currentLicenses.Except(result.RequiredLicenses).Except(licenseMapping.OptionalLicenses).ToList();

                // Apply compliance rules based on compliance level
                await ApplyComplianceRulesAsync(result, userProfile, context, cancellationToken);

                result.IsCompliant = result.MissingLicenses.Count == 0 && result.Violations.Count(v => v.IsBlocking) == 0;

                // Generate compliance details
                result.ComplianceDetails = new Dictionary<string, object>
                {
                    ["currentLicenses"] = currentLicenses,
                    ["userRole"] = DetermineUserRole(
                        userProfile.Attributes.GetValueOrDefault("JobTitle", ""),
                        userProfile.Attributes.GetValueOrDefault("Department", ""),
                        userProfile.Attributes.GetValueOrDefault("EmployeeType", "")),
                    ["department"] = userProfile.Attributes.GetValueOrDefault("Department", "Unknown"),
                    ["complianceLevel"] = context.ComplianceLevel,
                    ["lastCheck"] = DateTime.Now
                };

                _logger.LogInformation($"Compliance check completed for {userPrincipalName}: Compliant = {result.IsCompliant}, Violations = {result.Violations.Count}");
                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Compliance check failed for user: {userPrincipalName}");
                result.IsCompliant = false;
                result.Violations.Add(new ComplianceViolation
                {
                    ViolationType = "SystemError",
                    ViolationLevel = "Critical",
                    Description = $"Compliance check failed: {ex.Message}",
                    IsBlocking = true,
                    DetectedDate = DateTime.Now
                });
                return result;
            }
        }

        public async Task<LicenseInventoryResult> GetAvailableLicensesAsync(MigrationContext context, CancellationToken cancellationToken = default)
        {
            var result = new LicenseInventoryResult
            {
                InventoryDate = DateTime.Now
            };

            try
            {
                _logger.LogInformation("Retrieving license inventory from target tenant");

                // In a real implementation, this would call Graph API to get subscribedSkus
                // var skus = await _graphServiceClient.SubscribedSkus.Request().GetAsync();
                
                // Simulate license inventory retrieval
                await Task.Delay(1000, cancellationToken);

                // Generate realistic license inventory
                var licenseSkus = new Dictionary<string, LicenseSkuInfo>
                {
                    ["Microsoft 365 E3"] = new LicenseSkuInfo
                    {
                        SkuId = "SPE_E3",
                        SkuName = "Microsoft 365 E3",
                        DisplayName = "Microsoft 365 E3",
                        MonthlyCost = 32.00m,
                        TotalUnits = 1000,
                        ConsumedUnits = 750,
                        IncludedServices = new List<string> { "Exchange Online", "SharePoint Online", "Teams", "Office Apps" }
                    },
                    ["Microsoft 365 E5"] = new LicenseSkuInfo
                    {
                        SkuId = "SPE_E5",
                        SkuName = "Microsoft 365 E5",
                        DisplayName = "Microsoft 365 E5",
                        MonthlyCost = 57.00m,
                        TotalUnits = 200,
                        ConsumedUnits = 150,
                        IncludedServices = new List<string> { "Exchange Online", "SharePoint Online", "Teams", "Office Apps", "Power BI Pro", "Advanced Compliance" }
                    },
                    ["Exchange Online Plan 2"] = new LicenseSkuInfo
                    {
                        SkuId = "EXCHANGESTANDARD",
                        SkuName = "Exchange Online Plan 2",
                        DisplayName = "Exchange Online Plan 2",
                        MonthlyCost = 8.00m,
                        TotalUnits = 500,
                        ConsumedUnits = 300,
                        IncludedServices = new List<string> { "Exchange Online" }
                    },
                    ["Azure AD Premium P1"] = new LicenseSkuInfo
                    {
                        SkuId = "AAD_PREMIUM",
                        SkuName = "Azure AD Premium P1",
                        DisplayName = "Azure Active Directory Premium P1",
                        MonthlyCost = 6.00m,
                        TotalUnits = 800,
                        ConsumedUnits = 600,
                        IncludedServices = new List<string> { "Azure AD Premium P1" }
                    }
                };

                result.AvailableLicenses = licenseSkus;
                
                foreach (var sku in licenseSkus)
                {
                    result.AssignedCounts[sku.Key] = sku.Value.ConsumedUnits;
                    result.RemainingCapacity[sku.Key] = sku.Value.AvailableUnits;
                    result.TotalMonthlyCost += sku.Value.ConsumedUnits * sku.Value.MonthlyCost;
                }

                // Check for capacity issues
                result.HasCapacityIssues = result.RemainingCapacity.Any(kvp => kvp.Value < 10);
                if (result.HasCapacityIssues)
                {
                    foreach (var sku in result.RemainingCapacity.Where(kvp => kvp.Value < 10))
                    {
                        result.Warnings.Add($"Low capacity warning: {sku.Key} has only {sku.Value} licenses remaining");
                    }
                }

                _logger.LogInformation($"License inventory retrieved: {licenseSkus.Count} SKUs, Total Cost: ${result.TotalMonthlyCost:F2}/month");
                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to retrieve license inventory");
                result.HasCapacityIssues = true;
                result.Warnings.Add($"Failed to retrieve license inventory: {ex.Message}");
                return result;
            }
        }

        public async Task<LicenseMappingResult> MapUserRoleToLicensesAsync(UserProfileItem user, MigrationContext context, CancellationToken cancellationToken = default)
        {
            var result = new LicenseMappingResult
            {
                UserPrincipalName = user.UserPrincipalName
            };

            try
            {
                // Extract user role and department from attributes
                user.Attributes.TryGetValue("Department", out var department);
                user.Attributes.TryGetValue("JobTitle", out var jobTitle);
                user.Attributes.TryGetValue("EmployeeType", out var employeeType);

                result.Department = department ?? "Unknown";
                result.UserRole = DetermineUserRole(jobTitle, department, employeeType);

                // Apply business rules to determine license requirements
                if (_businessRules.TryGetValue(result.UserRole, out var businessRule))
                {
                    result.RecommendedLicenses = businessRule.RequiredLicenses.ToList();
                    result.OptionalLicenses = businessRule.OptionalLicenses.ToList();
                    result.ProhibitedLicenses = businessRule.ProhibitedLicenses.ToList();
                    result.EstimatedMonthlyCost = businessRule.RequiredLicenses.Sum(license => 
                        _licenseCosts.TryGetValue(license, out var cost) ? cost : 0);
                    result.MappingReason = $"Role-based mapping for {result.UserRole}";
                    result.RequiresManagerApproval = businessRule.RequiresApproval;
                }
                else
                {
                    // Default mapping for unknown roles
                    result.RecommendedLicenses = new List<string> { "Microsoft 365 E3" };
                    result.OptionalLicenses = new List<string>();
                    result.ProhibitedLicenses = new List<string>();
                    result.EstimatedMonthlyCost = _licenseCosts.GetValueOrDefault("Microsoft 365 E3", 32.00m);
                    result.MappingReason = "Default mapping for unknown role";
                    result.RequiresManagerApproval = false;
                }

                result.MappingDetails = new Dictionary<string, object>
                {
                    ["department"] = department,
                    ["jobTitle"] = jobTitle,
                    ["employeeType"] = employeeType,
                    ["determinedRole"] = result.UserRole,
                    ["businessRuleApplied"] = _businessRules.ContainsKey(result.UserRole),
                    ["mappingDate"] = DateTime.Now
                };

                _logger.LogInformation($"License mapping completed for {user.UserPrincipalName}: Role = {result.UserRole}, Licenses = {result.RecommendedLicenses.Count}");
                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"License mapping failed for user: {user.UserPrincipalName}");
                
                // Return safe defaults on error
                result.RecommendedLicenses = new List<string> { "Microsoft 365 E3" };
                result.EstimatedMonthlyCost = 32.00m;
                result.MappingReason = $"Error occurred, using defaults: {ex.Message}";
                return result;
            }
        }

        public async Task<ComplianceReportResult> GenerateComplianceReportAsync(List<UserProfileItem> users, MigrationContext context, CancellationToken cancellationToken = default)
        {
            var report = new ComplianceReportResult
            {
                GeneratedDate = DateTime.Now,
                TotalUsers = users.Count
            };

            try
            {
                _logger.LogInformation($"Generating compliance report for {users.Count} users");

                var complianceResults = new List<LicenseComplianceResult>();

                // Check compliance for each user
                foreach (var user in users)
                {
                    var compliance = await CheckComplianceAsync(user.UserPrincipalName, context, cancellationToken);
                    complianceResults.Add(compliance);

                    if (compliance.IsCompliant)
                    {
                        report.CompliantUsers++;
                    }
                    else
                    {
                        report.NonCompliantUsers++;
                        report.AllViolations.AddRange(compliance.Violations);
                    }

                    // Track license usage
                    foreach (var license in compliance.RequiredLicenses)
                    {
                        if (!report.LicenseUsageCounts.ContainsKey(license))
                            report.LicenseUsageCounts[license] = 0;
                        report.LicenseUsageCounts[license]++;
                    }
                }

                // Calculate cost metrics
                foreach (var licenseUsage in report.LicenseUsageCounts)
                {
                    if (_licenseCosts.TryGetValue(licenseUsage.Key, out var cost))
                    {
                        report.TotalMonthlyCost += licenseUsage.Value * cost;
                    }
                }

                // Identify cost optimization opportunities
                var excessLicenses = complianceResults.SelectMany(c => c.ExcessLicenses).ToList();
                foreach (var excessLicense in excessLicenses)
                {
                    if (_licenseCosts.TryGetValue(excessLicense, out var cost))
                    {
                        report.PotentialSavings += cost;
                    }
                }

                // Group violations by type
                report.ViolationsByType = report.AllViolations
                    .GroupBy(v => v.ViolationType)
                    .ToDictionary(g => g.Key, g => g.Count());

                // Generate recommendations
                report.RecommendedActions = GenerateRecommendedActions(complianceResults);

                report.ReportDetails = new Dictionary<string, object>
                {
                    ["compliancePercentage"] = report.CompliancePercentage,
                    ["totalViolations"] = report.AllViolations.Count,
                    ["criticalViolations"] = report.AllViolations.Count(v => v.ViolationLevel == "Critical"),
                    ["averageCostPerUser"] = report.TotalUsers > 0 ? report.TotalMonthlyCost / report.TotalUsers : 0,
                    ["generationDuration"] = DateTime.Now - report.GeneratedDate
                };

                _logger.LogInformation($"Compliance report generated: {report.CompliantUsers}/{report.TotalUsers} compliant ({report.CompliancePercentage:F1}%)");
                return report;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to generate compliance report");
                report.RecommendedActions.Add($"Report generation failed: {ex.Message}");
                return report;
            }
        }

        public async Task<BulkLicenseResult> BulkAssignLicensesAsync(Dictionary<string, List<string>> userLicenseMap, MigrationContext context, CancellationToken cancellationToken = default)
        {
            var result = new BulkLicenseResult
            {
                OperationStartTime = DateTime.Now,
                TotalUsers = userLicenseMap.Count
            };

            try
            {
                _logger.LogInformation($"Starting bulk license assignment for {userLicenseMap.Count} users");

                // Process users in parallel batches for efficiency
                var batchSize = context.MaxConcurrentOperations;
                var userBatches = userLicenseMap.Keys.Select((user, index) => new { user, index })
                    .GroupBy(x => x.index / batchSize)
                    .Select(g => g.Select(x => x.user).ToList());

                foreach (var batch in userBatches)
                {
                    var batchTasks = batch.Select(async user =>
                    {
                        var userResult = await AssignLicensesAsync(user, userLicenseMap[user], context, cancellationToken);
                        result.Results.Add(userResult);

                        if (userResult.IsSuccess)
                        {
                            result.SuccessfulAssignments++;
                            result.TotalCostImpact += userResult.EstimatedMonthlyCost;
                        }
                        else
                        {
                            result.FailedAssignments++;
                            result.BulkErrors.AddRange(userResult.Errors);
                        }
                    });

                    await Task.WhenAll(batchTasks);
                    
                    // Report progress
                    var completedUsers = result.SuccessfulAssignments + result.FailedAssignments;
                    var progressPercentage = (double)completedUsers / result.TotalUsers * 100;
                    context.ReportProgress("Bulk License Assignment", progressPercentage, 
                        $"Processed {completedUsers}/{result.TotalUsers} users");
                }

                result.OperationEndTime = DateTime.Now;

                _logger.LogInformation($"Bulk license assignment completed: {result.SuccessfulAssignments}/{result.TotalUsers} successful ({result.SuccessRate:F1}%)");
                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Bulk license assignment failed");
                result.OperationEndTime = DateTime.Now;
                result.BulkErrors.Add($"Bulk operation failed: {ex.Message}");
                return result;
            }
        }

        public async Task<LicenseValidationResult> ValidateLicenseRequirementsAsync(List<UserProfileItem> users, MigrationContext context, CancellationToken cancellationToken = default)
        {
            var result = new LicenseValidationResult
            {
                TotalUsersValidated = users.Count,
                ValidationDate = DateTime.Now
            };

            try
            {
                _logger.LogInformation($"Validating license requirements for {users.Count} users");

                // Get current license inventory
                var inventory = await GetAvailableLicensesAsync(context, cancellationToken);

                // Calculate license requirements for all users
                foreach (var user in users)
                {
                    var mapping = await MapUserRoleToLicensesAsync(user, context, cancellationToken);
                    
                    foreach (var license in mapping.RecommendedLicenses)
                    {
                        if (!result.RequiredLicenseCounts.ContainsKey(license))
                            result.RequiredLicenseCounts[license] = 0;
                        result.RequiredLicenseCounts[license]++;
                    }

                    result.EstimatedTotalCost += mapping.EstimatedMonthlyCost;
                }

                // Check capacity against requirements
                result.AvailableLicenseCounts = inventory.RemainingCapacity;

                foreach (var requirement in result.RequiredLicenseCounts)
                {
                    var available = result.AvailableLicenseCounts.GetValueOrDefault(requirement.Key, 0);
                    if (available < requirement.Value)
                    {
                        result.InsufficientLicenses.Add(requirement.Key);
                        result.ValidationIssues.Add(new LicenseValidationIssue
                        {
                            IssueType = "InsufficientCapacity",
                            IssueLevel = "Critical",
                            Description = $"Insufficient {requirement.Key} licenses: Need {requirement.Value}, Available {available}",
                            IsBlocking = true,
                            RecommendedAction = "Purchase additional licenses or reassign existing licenses"
                        });
                    }
                }

                result.UsersWithIssues = result.ValidationIssues.Count(i => !string.IsNullOrEmpty(i.UserPrincipalName));
                result.BlocksMigration = result.ValidationIssues.Any(i => i.IsBlocking);
                result.IsValid = !result.BlocksMigration;

                _logger.LogInformation($"License validation completed: Valid = {result.IsValid}, Issues = {result.ValidationIssues.Count}, Blocking = {result.BlocksMigration}");
                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "License validation failed");
                result.IsValid = false;
                result.BlocksMigration = true;
                result.ValidationIssues.Add(new LicenseValidationIssue
                {
                    IssueType = "SystemError",
                    IssueLevel = "Critical",
                    Description = $"License validation failed: {ex.Message}",
                    IsBlocking = true
                });
                return result;
            }
        }

        #region Private Helper Methods

        private Dictionary<string, LicenseBusinessRule> InitializeLicenseBusinessRules()
        {
            return new Dictionary<string, LicenseBusinessRule>
            {
                ["Executive"] = new LicenseBusinessRule
                {
                    RequiredLicenses = new[] { "Microsoft 365 E5", "Azure AD Premium P1" },
                    OptionalLicenses = new[] { "Power BI Pro", "Visio Online Plan 2" },
                    ProhibitedLicenses = new[] { "Exchange Online Plan 1" },
                    RequiresApproval = true,
                    MaxMonthlyCost = 100.00m,
                    Description = "Executive tier requires E5 with premium features"
                },
                ["Manager"] = new LicenseBusinessRule
                {
                    RequiredLicenses = new[] { "Microsoft 365 E3", "Azure AD Premium P1" },
                    OptionalLicenses = new[] { "Power BI Pro" },
                    ProhibitedLicenses = new string[0],
                    RequiresApproval = false,
                    MaxMonthlyCost = 50.00m,
                    Description = "Management tier requires E3 with Azure AD Premium"
                },
                ["Developer"] = new LicenseBusinessRule
                {
                    RequiredLicenses = new[] { "Microsoft 365 E3", "Azure AD Premium P1" },
                    OptionalLicenses = new[] { "Visual Studio Professional", "Power Platform" },
                    ProhibitedLicenses = new string[0],
                    RequiresApproval = false,
                    MaxMonthlyCost = 60.00m,
                    Description = "Developer tier requires E3 with development tools"
                },
                ["StandardUser"] = new LicenseBusinessRule
                {
                    RequiredLicenses = new[] { "Microsoft 365 E3" },
                    OptionalLicenses = new[] { "Exchange Online Plan 2" },
                    ProhibitedLicenses = new[] { "Microsoft 365 E5" },
                    RequiresApproval = false,
                    MaxMonthlyCost = 35.00m,
                    Description = "Standard users get E3 license only"
                },
                ["Contractor"] = new LicenseBusinessRule
                {
                    RequiredLicenses = new[] { "Exchange Online Plan 1" },
                    OptionalLicenses = new string[0],
                    ProhibitedLicenses = new[] { "Microsoft 365 E5", "Azure AD Premium P2" },
                    RequiresApproval = true,
                    MaxMonthlyCost = 15.00m,
                    Description = "Contractors receive limited access licenses"
                }
            };
        }

        private Dictionary<string, decimal> InitializeLicenseCostMatrix()
        {
            return new Dictionary<string, decimal>
            {
                ["Microsoft 365 E3"] = 32.00m,
                ["Microsoft 365 E5"] = 57.00m,
                ["Exchange Online Plan 1"] = 4.00m,
                ["Exchange Online Plan 2"] = 8.00m,
                ["Azure AD Premium P1"] = 6.00m,
                ["Azure AD Premium P2"] = 9.00m,
                ["Power BI Pro"] = 10.00m,
                ["Visio Online Plan 2"] = 10.00m,
                ["Visual Studio Professional"] = 45.00m,
                ["Power Platform"] = 15.00m
            };
        }

        private string DetermineUserRole(string jobTitle, string department, string employeeType)
        {
            jobTitle = jobTitle?.ToLower() ?? "";
            department = department?.ToLower() ?? "";
            employeeType = employeeType?.ToLower() ?? "";

            if (employeeType.Contains("contractor") || employeeType.Contains("vendor"))
                return "Contractor";

            if (jobTitle.Contains("ceo") || jobTitle.Contains("cto") || jobTitle.Contains("cfo") || 
                jobTitle.Contains("president") || jobTitle.Contains("vp") || jobTitle.Contains("vice president"))
                return "Executive";

            if (jobTitle.Contains("manager") || jobTitle.Contains("director") || jobTitle.Contains("lead") ||
                jobTitle.Contains("head") || jobTitle.Contains("supervisor"))
                return "Manager";

            if (jobTitle.Contains("developer") || jobTitle.Contains("engineer") || jobTitle.Contains("architect") ||
                department.Contains("engineering") || department.Contains("development") || department.Contains("it"))
                return "Developer";

            return "StandardUser";
        }

        private async Task<BusinessRuleValidation> ValidateBusinessRulesAsync(string userPrincipalName, List<string> requestedLicenses, MigrationContext context, CancellationToken cancellationToken)
        {
            var result = new BusinessRuleValidation();

            // Get user profile for role determination
            var userProfile = await GetUserProfileForComplianceAsync(userPrincipalName, context, cancellationToken);
            var userRole = DetermineUserRole(
                userProfile.Attributes.GetValueOrDefault("JobTitle", ""),
                userProfile.Attributes.GetValueOrDefault("Department", ""),
                userProfile.Attributes.GetValueOrDefault("EmployeeType", "")
            );

            if (_businessRules.TryGetValue(userRole, out var businessRule))
            {
                // Check prohibited licenses
                result.ProhibitedLicenses = requestedLicenses.Intersect(businessRule.ProhibitedLicenses).ToList();
                
                // Calculate cost impact
                var totalCost = requestedLicenses.Sum(license => _licenseCosts.GetValueOrDefault(license, 0));
                if (totalCost > businessRule.MaxMonthlyCost)
                {
                    result.ViolationReasons["CostExceeded"] = $"Total cost ${totalCost:F2} exceeds maximum ${businessRule.MaxMonthlyCost:F2} for role {userRole}";
                }

                foreach (var prohibited in result.ProhibitedLicenses)
                {
                    result.ViolationReasons[prohibited] = $"License {prohibited} is prohibited for role {userRole}";
                }
            }

            return result;
        }

        private async Task<SingleLicenseAssignmentResult> AssignSingleLicenseAsync(string userPrincipalName, string license, MigrationContext context, CancellationToken cancellationToken)
        {
            var result = new SingleLicenseAssignmentResult();

            try
            {
                // In a real implementation, this would use Graph API to assign the license
                // var user = await _graphServiceClient.Users[userPrincipalName].Request().GetAsync();
                // var assignedLicenses = user.AssignedLicenses.ToList();
                // assignedLicenses.Add(new AssignedLicense { SkuId = skuId });
                // await _graphServiceClient.Users[userPrincipalName].Request().UpdateAsync(new User { AssignedLicenses = assignedLicenses });

                // Simulate license assignment
                await Task.Delay(500, cancellationToken);

                result.IsSuccess = true;
                result.LicenseDetails = new Dictionary<string, object>
                {
                    ["licenseId"] = license,
                    ["assignmentDate"] = DateTime.Now,
                    ["assignmentMethod"] = "GraphAPI",
                    ["skuId"] = GetSkuIdForLicense(license)
                };

                return result;
            }
            catch (Exception ex)
            {
                result.IsSuccess = false;
                result.Errors.Add($"Failed to assign license {license}: {ex.Message}");
                return result;
            }
        }

        private async Task<SingleLicenseRemovalResult> RemoveSingleLicenseAsync(string userPrincipalName, string license, MigrationContext context, CancellationToken cancellationToken)
        {
            var result = new SingleLicenseRemovalResult();

            try
            {
                // In a real implementation, this would use Graph API to remove the license
                // Simulate license removal
                await Task.Delay(300, cancellationToken);

                result.IsSuccess = true;
                return result;
            }
            catch (Exception ex)
            {
                result.IsSuccess = false;
                result.Errors.Add($"Failed to remove license {license}: {ex.Message}");
                return result;
            }
        }

        private async Task<List<string>> GetUserCurrentLicensesAsync(string userPrincipalName, CancellationToken cancellationToken)
        {
            // In a real implementation, this would query Graph API for current licenses
            // var user = await _graphServiceClient.Users[userPrincipalName].Request().Select("assignedLicenses").GetAsync();
            
            // Simulate current license retrieval
            await Task.Delay(200, cancellationToken);
            
            // Return simulated current licenses
            return new List<string> { "Microsoft 365 E3", "Azure AD Premium P1" };
        }

        private async Task<UserProfileItem> GetUserProfileForComplianceAsync(string userPrincipalName, MigrationContext context, CancellationToken cancellationToken)
        {
            // In a real implementation, this would fetch user profile from source system or context
            // For simulation, create a sample profile
            await Task.Delay(100, cancellationToken);

            return new UserProfileItem
            {
                UserPrincipalName = userPrincipalName,
                Attributes = new Dictionary<string, string>
                {
                    ["Department"] = "Information Technology",
                    ["JobTitle"] = "Software Developer",
                    ["EmployeeType"] = "Full-time"
                }
            };
        }

        private async Task ApplyComplianceRulesAsync(LicenseComplianceResult result, UserProfileItem userProfile, MigrationContext context, CancellationToken cancellationToken)
        {
            // Apply compliance level-specific rules
            switch (context.ComplianceLevel)
            {
                case "Enterprise":
                    await ApplyEnterpriseComplianceRules(result, userProfile, cancellationToken);
                    break;
                case "High":
                    await ApplyHighComplianceRules(result, userProfile, cancellationToken);
                    break;
                default:
                    await ApplyStandardComplianceRules(result, userProfile, cancellationToken);
                    break;
            }
        }

        private async Task ApplyEnterpriseComplianceRules(LicenseComplianceResult result, UserProfileItem userProfile, CancellationToken cancellationToken)
        {
            await Task.Delay(50, cancellationToken);

            // Enterprise compliance requires E5 for all users
            if (!result.RequiredLicenses.Contains("Microsoft 365 E5"))
            {
                result.Violations.Add(new ComplianceViolation
                {
                    ViolationType = "LicenseTier",
                    ViolationLevel = "High",
                    Description = "Enterprise compliance requires E5 licenses",
                    RecommendedAction = "Upgrade to Microsoft 365 E5",
                    IsBlocking = false
                });
            }

            // Require Azure AD Premium P1 minimum
            if (!result.RequiredLicenses.Contains("Azure AD Premium P1") && !result.RequiredLicenses.Contains("Azure AD Premium P2"))
            {
                result.Violations.Add(new ComplianceViolation
                {
                    ViolationType = "SecurityRequirement",
                    ViolationLevel = "Critical",
                    Description = "Enterprise compliance requires Azure AD Premium",
                    RecommendedAction = "Assign Azure AD Premium P1 or P2",
                    IsBlocking = true
                });
            }
        }

        private async Task ApplyHighComplianceRules(LicenseComplianceResult result, UserProfileItem userProfile, CancellationToken cancellationToken)
        {
            await Task.Delay(50, cancellationToken);

            // High compliance requires at least E3
            var hasE3OrBetter = result.RequiredLicenses.Any(l => l.Contains("E3") || l.Contains("E5"));
            if (!hasE3OrBetter)
            {
                result.Violations.Add(new ComplianceViolation
                {
                    ViolationType = "LicenseTier",
                    ViolationLevel = "High",
                    Description = "High compliance requires E3 or E5 licenses",
                    RecommendedAction = "Upgrade to Microsoft 365 E3 or E5",
                    IsBlocking = false
                });
            }
        }

        private async Task ApplyStandardComplianceRules(LicenseComplianceResult result, UserProfileItem userProfile, CancellationToken cancellationToken)
        {
            await Task.Delay(50, cancellationToken);

            // Standard compliance - basic checks
            if (result.RequiredLicenses.Count == 0)
            {
                result.Violations.Add(new ComplianceViolation
                {
                    ViolationType = "NoLicenses",
                    ViolationLevel = "Medium",
                    Description = "User has no assigned licenses",
                    RecommendedAction = "Assign appropriate licenses based on user role",
                    IsBlocking = false
                });
            }
        }

        private List<string> GenerateRecommendedActions(List<LicenseComplianceResult> complianceResults)
        {
            var actions = new List<string>();

            var criticalViolations = complianceResults.SelectMany(c => c.Violations).Count(v => v.ViolationLevel == "Critical");
            if (criticalViolations > 0)
            {
                actions.Add($"Address {criticalViolations} critical compliance violations before proceeding with migration");
            }

            var unlicensedUsers = complianceResults.Count(c => c.RequiredLicenses.Count == 0);
            if (unlicensedUsers > 0)
            {
                actions.Add($"Assign licenses to {unlicensedUsers} users without any license assignments");
            }

            var excessLicenses = complianceResults.SelectMany(c => c.ExcessLicenses).Count();
            if (excessLicenses > 0)
            {
                actions.Add($"Review {excessLicenses} excess license assignments for cost optimization");
            }

            var missingLicenses = complianceResults.SelectMany(c => c.MissingLicenses).Count();
            if (missingLicenses > 0)
            {
                actions.Add($"Purchase or assign {missingLicenses} missing licenses to achieve compliance");
            }

            return actions;
        }

        private string GetSkuIdForLicense(string licenseName)
        {
            var skuMap = new Dictionary<string, string>
            {
                ["Microsoft 365 E3"] = "SPE_E3",
                ["Microsoft 365 E5"] = "SPE_E5",
                ["Exchange Online Plan 1"] = "EXCHANGESTANDARD",
                ["Exchange Online Plan 2"] = "EXCHANGEENTERPRISE",
                ["Azure AD Premium P1"] = "AAD_PREMIUM",
                ["Azure AD Premium P2"] = "AAD_PREMIUM_P2",
                ["Power BI Pro"] = "POWER_BI_PRO",
                ["Visio Online Plan 2"] = "VISIO_CLIENT_SUBSCRIPTION",
                ["Visual Studio Professional"] = "VS_PROFESSIONAL_MONTHLY",
                ["Power Platform"] = "POWERAPPS_INDIVIDUAL_USER"
            };

            return skuMap.GetValueOrDefault(licenseName, "UNKNOWN_SKU");
        }

        #endregion
    }

    #region Supporting Classes

    public class LicenseBusinessRule
    {
        public string[] RequiredLicenses { get; set; } = new string[0];
        public string[] OptionalLicenses { get; set; } = new string[0];
        public string[] ProhibitedLicenses { get; set; } = new string[0];
        public bool RequiresApproval { get; set; }
        public decimal MaxMonthlyCost { get; set; }
        public string Description { get; set; }
    }

    public class BusinessRuleValidation
    {
        public List<string> ProhibitedLicenses { get; set; } = new List<string>();
        public Dictionary<string, string> ViolationReasons { get; set; } = new Dictionary<string, string>();
    }

    public class SingleLicenseAssignmentResult
    {
        public bool IsSuccess { get; set; }
        public List<string> Errors { get; set; } = new List<string>();
        public Dictionary<string, object> LicenseDetails { get; set; } = new Dictionary<string, object>();
    }

    public class SingleLicenseRemovalResult
    {
        public bool IsSuccess { get; set; }
        public List<string> Errors { get; set; } = new List<string>();
    }

    #endregion
}