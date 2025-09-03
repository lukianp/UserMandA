using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Text.RegularExpressions;
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
    /// Attribute mapping service for T-041: User Account Migration and Synchronization
    /// Handles complex attribute transformations and mappings between source and target systems
    /// </summary>
    public class AttributeMappingService
    {
        private readonly ILogger<AttributeMappingService> _logger;
        private readonly GraphServiceClient _graphServiceClient;
        private readonly Dictionary<string, AttributeMappingRule> _mappingRules;
        private readonly Dictionary<string, Func<string, MigrationContext, Task<string>>> _transformationFunctions;

        public AttributeMappingService(
            ILogger<AttributeMappingService> logger,
            GraphServiceClient graphServiceClient)
        {
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
            _graphServiceClient = graphServiceClient ?? throw new ArgumentNullException(nameof(graphServiceClient));
            
            // Initialize default attribute mapping rules
            _mappingRules = InitializeDefaultMappingRules();
            
            // Initialize transformation functions
            _transformationFunctions = InitializeTransformationFunctions();
        }

        /// <summary>
        /// Map and apply user attributes from source to target
        /// </summary>
        public async Task<AttributeMappingResult> MapAndApplyUserAttributesAsync(
            UserProfileItem sourceUser,
            string targetUserPrincipalName,
            MigrationContext context,
            CancellationToken cancellationToken = default)
        {
            var result = new AttributeMappingResult
            {
                UserUpn = targetUserPrincipalName,
                SourceAttributes = sourceUser.Attributes ?? new Dictionary<string, string>(),
                StartTime = DateTime.Now,
                SessionId = context.SessionId
            };

            try
            {
                _logger.LogInformation($"Starting attribute mapping for user: {targetUserPrincipalName}");

                // Step 1: Get custom mapping rules from context (if any)
                var customMappingRules = LoadCustomMappingRules(context);
                var effectiveMappingRules = MergeWithCustomRules(_mappingRules, customMappingRules);

                // Step 2: Process each source attribute
                foreach (var sourceAttribute in result.SourceAttributes)
                {
                    cancellationToken.ThrowIfCancellationRequested();
                    
                    if (effectiveMappingRules.TryGetValue(sourceAttribute.Key, out var mappingRule))
                    {
                        try
                        {
                            var mappingResult = await ProcessAttributeMappingAsync(
                                sourceAttribute.Key, 
                                sourceAttribute.Value, 
                                mappingRule, 
                                context, 
                                cancellationToken);
                            
                            if (mappingResult.IsSuccess)
                            {
                                result.MappedAttributes[mappingRule.TargetAttribute] = mappingResult.TransformedValue;
                                
                                if (mappingResult.WasTransformed)
                                {
                                    result.AttributeTransformations[sourceAttribute.Key] = mappingResult.TransformationApplied;
                                }
                            }
                            else
                            {
                                result.UnmappedAttributes.Add($"{sourceAttribute.Key}: {mappingResult.ErrorMessage}");
                                result.MappingIssues.Add(new AttributeMappingIssue
                                {
                                    SourceAttribute = sourceAttribute.Key,
                                    TargetAttribute = mappingRule.TargetAttribute,
                                    IssueType = "MappingFailed",
                                    Severity = mappingRule.IsRequired ? "High" : "Medium",
                                    Description = mappingResult.ErrorMessage,
                                    RecommendedAction = "Review attribute value and mapping rule"
                                });
                            }
                        }
                        catch (Exception ex)
                        {
                            _logger.LogError(ex, $"Error processing attribute mapping: {sourceAttribute.Key}");
                            result.MappingIssues.Add(new AttributeMappingIssue
                            {
                                SourceAttribute = sourceAttribute.Key,
                                TargetAttribute = mappingRule.TargetAttribute,
                                IssueType = "ProcessingError",
                                Severity = "High",
                                Description = ex.Message,
                                RecommendedAction = "Check attribute mapping configuration"
                            });
                        }
                    }
                    else
                    {
                        // No mapping rule found - add to unmapped
                        result.UnmappedAttributes.Add($"{sourceAttribute.Key}: No mapping rule defined");
                        
                        // Create informational issue for unmapped attributes
                        result.MappingIssues.Add(new AttributeMappingIssue
                        {
                            SourceAttribute = sourceAttribute.Key,
                            TargetAttribute = null,
                            IssueType = "NoMappingRule",
                            Severity = "Low",
                            Description = $"No mapping rule defined for attribute: {sourceAttribute.Key}",
                            RecommendedAction = "Define mapping rule or exclude from migration"
                        });
                    }
                }

                // Step 3: Apply mapped attributes to target user
                if (result.MappedAttributes.Any())
                {
                    var applyResult = await ApplyAttributesToTargetUserAsync(
                        targetUserPrincipalName, 
                        result.MappedAttributes, 
                        context, 
                        cancellationToken);
                    
                    if (!applyResult.IsSuccess)
                    {
                        result.Errors.AddRange(applyResult.Errors);
                        result.MappingIssues.Add(new AttributeMappingIssue
                        {
                            IssueType = "ApplyFailed",
                            Severity = "Critical",
                            Description = "Failed to apply mapped attributes to target user",
                            RecommendedAction = "Check Graph API permissions and connectivity"
                        });
                    }
                }

                result.IsSuccess = result.MappedAttributes.Any() && !result.MappingIssues.Any(i => i.IsBlocking);
                result.EndTime = DateTime.Now;

                _logger.LogInformation($"Attribute mapping completed for {targetUserPrincipalName}: " +
                    $"Mapped: {result.MappedAttributes.Count}, Unmapped: {result.UnmappedAttributes.Count}, Issues: {result.MappingIssues.Count}");

                return result;
            }
            catch (Exception ex)
            {
                result.IsSuccess = false;
                result.ErrorMessage = ex.Message;
                result.Errors.Add(ex.ToString());
                _logger.LogError(ex, $"Attribute mapping failed for user: {targetUserPrincipalName}");
                return result;
            }
        }

        /// <summary>
        /// Process individual attribute mapping with transformations
        /// </summary>
        private async Task<AttributeProcessingResult> ProcessAttributeMappingAsync(
            string sourceAttributeName,
            string sourceValue,
            AttributeMappingRule mappingRule,
            MigrationContext context,
            CancellationToken cancellationToken)
        {
            var result = new AttributeProcessingResult
            {
                SourceAttribute = sourceAttributeName,
                SourceValue = sourceValue,
                TargetAttribute = mappingRule.TargetAttribute
            };

            try
            {
                // Step 1: Validate source value
                if (string.IsNullOrEmpty(sourceValue) && mappingRule.IsRequired)
                {
                    result.IsSuccess = false;
                    result.ErrorMessage = $"Required attribute {sourceAttributeName} is empty or null";
                    return result;
                }

                // Step 2: Apply validation rules
                if (!ValidateAttributeValue(sourceValue, mappingRule))
                {
                    result.IsSuccess = false;
                    result.ErrorMessage = $"Attribute value '{sourceValue}' does not meet validation requirements for {sourceAttributeName}";
                    return result;
                }

                // Step 3: Apply transformations
                var transformedValue = sourceValue;
                if (!string.IsNullOrEmpty(mappingRule.TransformationFunction))
                {
                    if (_transformationFunctions.TryGetValue(mappingRule.TransformationFunction, out var transformFunction))
                    {
                        transformedValue = await transformFunction(sourceValue, context);
                        result.WasTransformed = true;
                        result.TransformationApplied = mappingRule.TransformationFunction;
                    }
                    else
                    {
                        _logger.LogWarning($"Transformation function '{mappingRule.TransformationFunction}' not found for attribute {sourceAttributeName}");
                    }
                }

                // Step 4: Apply additional business rules
                transformedValue = ApplyBusinessRules(transformedValue, mappingRule, context);

                result.TransformedValue = transformedValue;
                result.IsSuccess = true;
                return result;
            }
            catch (Exception ex)
            {
                result.IsSuccess = false;
                result.ErrorMessage = ex.Message;
                _logger.LogError(ex, $"Error processing attribute {sourceAttributeName}");
                return result;
            }
        }

        /// <summary>
        /// Apply mapped attributes to target user via Graph API
        /// </summary>
        private async Task<MigrationResultBase> ApplyAttributesToTargetUserAsync(
            string targetUserPrincipalName,
            Dictionary<string, string> mappedAttributes,
            MigrationContext context,
            CancellationToken cancellationToken)
        {
            var result = new GenericMigrationResult("AttributeMapping") { StartTime = DateTime.Now };

            try
            {
                // Find the target user
                var users = await _graphServiceClient.Users
                    .GetAsync(requestConfiguration => {
                        requestConfiguration.QueryParameters.Filter = $"userPrincipalName eq '{targetUserPrincipalName}'";
                        requestConfiguration.QueryParameters.Select = new[] { "id", "displayName", "givenName", "surname", "jobTitle", "department", "companyName", "officeLocation", "businessPhones", "mobilePhone", "streetAddress", "city", "state", "postalCode", "country" };
                    }, cancellationToken)
                    .Filter($"userPrincipalName eq '{targetUserPrincipalName}'")
                    .Select("id")
                    .GetAsync(cancellationToken);

                var targetUser = users?.FirstOrDefault();
                if (targetUser == null)
                {
                    result.IsSuccess = false;
                    result.ErrorMessage = $"Target user not found: {targetUserPrincipalName}";
                    return result;
                }

                // Prepare user update object
                var userUpdate = new Microsoft.Graph.User();
                var extensionAttributes = new Dictionary<string, object>();

                foreach (var attribute in mappedAttributes)
                {
                    MapAttributeToUserObject(userUpdate, extensionAttributes, attribute.Key, attribute.Value);
                }

                // Update the user
                await _graphServiceClient.Users[targetUser.Id].PatchAsync(userUpdate, cancellationToken);

                // Update extension attributes if any
                if (extensionAttributes.Any())
                {
                    // Extension attributes would be handled separately if needed
                    _logger.LogInformation($"Extension attributes detected for {targetUserPrincipalName}: {extensionAttributes.Count}");
                }

                result.IsSuccess = true;
                _logger.LogInformation($"Successfully applied {mappedAttributes.Count} attributes to user {targetUserPrincipalName}");
                return result;
            }
            catch (Exception ex)
            {
                result.IsSuccess = false;
                result.ErrorMessage = ex.Message;
                result.Errors.Add(ex.ToString());
                _logger.LogError(ex, $"Failed to apply attributes to user: {targetUserPrincipalName}");
                return result;
            }
        }

        /// <summary>
        /// Map individual attribute to User object properties
        /// </summary>
        private void MapAttributeToUserObject(Microsoft.Graph.Models.User userUpdate, Dictionary<string, object> extensionAttributes, string attributeName, string attributeValue)
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
                case "usagelocation":
                    userUpdate.UsageLocation = attributeValue;
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
        /// Initialize default attribute mapping rules
        /// </summary>
        private Dictionary<string, AttributeMappingRule> InitializeDefaultMappingRules()
        {
            return new Dictionary<string, AttributeMappingRule>
            {
                ["givenName"] = new AttributeMappingRule
                {
                    SourceAttribute = "givenName",
                    TargetAttribute = "givenName",
                    IsRequired = false,
                    ValidationPattern = @"^[a-zA-Z\s\-'\.]{1,64}$",
                    TransformationFunction = "NormalizeName"
                },
                ["sn"] = new AttributeMappingRule
                {
                    SourceAttribute = "sn",
                    TargetAttribute = "surname",
                    IsRequired = false,
                    ValidationPattern = @"^[a-zA-Z\s\-'\.]{1,64}$",
                    TransformationFunction = "NormalizeName"
                },
                ["displayName"] = new AttributeMappingRule
                {
                    SourceAttribute = "displayName",
                    TargetAttribute = "displayName",
                    IsRequired = true,
                    ValidationPattern = @"^.{1,256}$",
                    TransformationFunction = "NormalizeDisplayName"
                },
                ["title"] = new AttributeMappingRule
                {
                    SourceAttribute = "title",
                    TargetAttribute = "jobTitle",
                    IsRequired = false,
                    ValidationPattern = @"^.{0,128}$"
                },
                ["department"] = new AttributeMappingRule
                {
                    SourceAttribute = "department",
                    TargetAttribute = "department",
                    IsRequired = false,
                    ValidationPattern = @"^.{0,64}$",
                    TransformationFunction = "NormalizeDepartment"
                },
                ["company"] = new AttributeMappingRule
                {
                    SourceAttribute = "company",
                    TargetAttribute = "companyName",
                    IsRequired = false,
                    ValidationPattern = @"^.{0,64}$"
                },
                ["physicalDeliveryOfficeName"] = new AttributeMappingRule
                {
                    SourceAttribute = "physicalDeliveryOfficeName",
                    TargetAttribute = "officeLocation",
                    IsRequired = false,
                    ValidationPattern = @"^.{0,128}$"
                },
                ["telephoneNumber"] = new AttributeMappingRule
                {
                    SourceAttribute = "telephoneNumber",
                    TargetAttribute = "businessPhones",
                    IsRequired = false,
                    ValidationPattern = @"^[\+]?[0-9\s\-\(\)\.]{0,64}$",
                    TransformationFunction = "NormalizePhoneNumber"
                },
                ["mobile"] = new AttributeMappingRule
                {
                    SourceAttribute = "mobile",
                    TargetAttribute = "mobilePhone",
                    IsRequired = false,
                    ValidationPattern = @"^[\+]?[0-9\s\-\(\)\.]{0,64}$",
                    TransformationFunction = "NormalizePhoneNumber"
                },
                ["streetAddress"] = new AttributeMappingRule
                {
                    SourceAttribute = "streetAddress",
                    TargetAttribute = "streetAddress",
                    IsRequired = false,
                    ValidationPattern = @"^.{0,1024}$"
                },
                ["l"] = new AttributeMappingRule
                {
                    SourceAttribute = "l",
                    TargetAttribute = "city",
                    IsRequired = false,
                    ValidationPattern = @"^.{0,128}$"
                },
                ["st"] = new AttributeMappingRule
                {
                    SourceAttribute = "st",
                    TargetAttribute = "state",
                    IsRequired = false,
                    ValidationPattern = @"^.{0,128}$"
                },
                ["postalCode"] = new AttributeMappingRule
                {
                    SourceAttribute = "postalCode",
                    TargetAttribute = "postalCode",
                    IsRequired = false,
                    ValidationPattern = @"^.{0,40}$"
                },
                ["c"] = new AttributeMappingRule
                {
                    SourceAttribute = "c",
                    TargetAttribute = "country",
                    IsRequired = false,
                    ValidationPattern = @"^[A-Z]{2}$",
                    TransformationFunction = "NormalizeCountryCode"
                }
            };
        }

        /// <summary>
        /// Initialize transformation functions
        /// </summary>
        private Dictionary<string, Func<string, MigrationContext, Task<string>>> InitializeTransformationFunctions()
        {
            return new Dictionary<string, Func<string, MigrationContext, Task<string>>>
            {
                ["NormalizeName"] = async (value, context) =>
                {
                    await Task.CompletedTask;
                    return string.IsNullOrEmpty(value) ? value : 
                        CultureInfo.CurrentCulture.TextInfo.ToTitleCase(value.Trim().ToLowerInvariant());
                },
                ["NormalizeDisplayName"] = async (value, context) =>
                {
                    await Task.CompletedTask;
                    return string.IsNullOrEmpty(value) ? value : value.Trim();
                },
                ["NormalizeDepartment"] = async (value, context) =>
                {
                    await Task.CompletedTask;
                    if (string.IsNullOrEmpty(value)) return value;
                    
                    // Apply department standardization from context if available
                    var departmentMappings = context.GetConfiguration<Dictionary<string, string>>("DepartmentMappings");
                    if (departmentMappings != null && departmentMappings.TryGetValue(value, out var standardDept))
                    {
                        return standardDept;
                    }
                    
                    return CultureInfo.CurrentCulture.TextInfo.ToTitleCase(value.Trim().ToLowerInvariant());
                },
                ["NormalizePhoneNumber"] = async (value, context) =>
                {
                    await Task.CompletedTask;
                    if (string.IsNullOrEmpty(value)) return value;
                    
                    // Remove extra spaces and standardize format
                    var cleaned = Regex.Replace(value, @"\s+", " ").Trim();
                    return cleaned;
                },
                ["NormalizeCountryCode"] = async (value, context) =>
                {
                    await Task.CompletedTask;
                    if (string.IsNullOrEmpty(value)) return value;
                    
                    // Convert country names to ISO codes if needed
                    var countryMappings = context.GetConfiguration<Dictionary<string, string>>("CountryMappings");
                    if (countryMappings != null && countryMappings.TryGetValue(value.ToUpperInvariant(), out var isoCode))
                    {
                        return isoCode;
                    }
                    
                    return value.Length == 2 ? value.ToUpperInvariant() : value;
                }
            };
        }

        /// <summary>
        /// Load custom mapping rules from migration context
        /// </summary>
        private Dictionary<string, AttributeMappingRule> LoadCustomMappingRules(MigrationContext context)
        {
            var customRules = context.GetConfiguration<Dictionary<string, AttributeMappingRule>>("CustomAttributeMappings");
            return customRules ?? new Dictionary<string, AttributeMappingRule>();
        }

        /// <summary>
        /// Merge default rules with custom rules
        /// </summary>
        private Dictionary<string, AttributeMappingRule> MergeWithCustomRules(
            Dictionary<string, AttributeMappingRule> defaultRules,
            Dictionary<string, AttributeMappingRule> customRules)
        {
            var merged = new Dictionary<string, AttributeMappingRule>(defaultRules);
            
            foreach (var customRule in customRules)
            {
                merged[customRule.Key] = customRule.Value; // Custom rules override defaults
            }
            
            return merged;
        }

        /// <summary>
        /// Validate attribute value against mapping rule
        /// </summary>
        private bool ValidateAttributeValue(string value, AttributeMappingRule mappingRule)
        {
            if (string.IsNullOrEmpty(value))
            {
                return !mappingRule.IsRequired;
            }

            if (!string.IsNullOrEmpty(mappingRule.ValidationPattern))
            {
                try
                {
                    return Regex.IsMatch(value, mappingRule.ValidationPattern);
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, $"Invalid validation pattern: {mappingRule.ValidationPattern}");
                    return true; // Allow value if pattern is invalid
                }
            }

            return true;
        }

        /// <summary>
        /// Apply business rules to transformed values
        /// </summary>
        private string ApplyBusinessRules(string value, AttributeMappingRule mappingRule, MigrationContext context)
        {
            if (string.IsNullOrEmpty(value)) return value;

            // Apply length limits
            if (mappingRule.MaxLength > 0 && value.Length > mappingRule.MaxLength)
            {
                value = value.Substring(0, mappingRule.MaxLength).Trim();
            }

            // Apply default values for empty required fields
            if (string.IsNullOrEmpty(value) && mappingRule.IsRequired && !string.IsNullOrEmpty(mappingRule.DefaultValue))
            {
                value = mappingRule.DefaultValue;
            }

            return value;
        }

        #region Helper Classes

        /// <summary>
        /// Attribute mapping rule definition
        /// </summary>
        public class AttributeMappingRule
        {
            public string SourceAttribute { get; set; }
            public string TargetAttribute { get; set; }
            public bool IsRequired { get; set; }
            public string ValidationPattern { get; set; }
            public string TransformationFunction { get; set; }
            public string DefaultValue { get; set; }
            public int MaxLength { get; set; }
            public Dictionary<string, string> BusinessRules { get; set; } = new Dictionary<string, string>();
        }

        /// <summary>
        /// Attribute processing result
        /// </summary>
        private class AttributeProcessingResult
        {
            public string SourceAttribute { get; set; }
            public string SourceValue { get; set; }
            public string TargetAttribute { get; set; }
            public string TransformedValue { get; set; }
            public bool IsSuccess { get; set; }
            public string ErrorMessage { get; set; }
            public bool WasTransformed { get; set; }
            public string TransformationApplied { get; set; }
        }

        #endregion
    }
}