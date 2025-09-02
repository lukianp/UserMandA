# License Assignment and Compliance System (T-038)

## Overview

The License Assignment and Compliance System provides comprehensive license management capabilities for M&A migration scenarios. This system integrates deeply with Microsoft Graph API to provide enterprise-grade license assignment, compliance monitoring, and cost management features.

## Architecture

### Core Components

1. **ILicenseAssignmentService Interface** - Contract defining all license management operations
2. **LicenseAssignmentService Implementation** - Production-ready service with Graph API integration
3. **License Models** - Comprehensive data models for licenses, assignments, and compliance
4. **Migration Integration** - Seamless integration with wave-based migration workflows
5. **Compliance Reporting** - Advanced reporting and monitoring capabilities
6. **UI Components** - User-friendly interfaces for license management

### Integration Points

- **Migration Planning** - License selection and validation during migration planning
- **Migration Execution** - Automatic license assignment during user migration
- **Post-Migration** - Source license cleanup and compliance validation
- **Reporting** - Comprehensive compliance and utilization reporting

## Key Features

### License Discovery and Management

```csharp
// Load available license SKUs for a tenant
var skus = await licenseService.GetAvailableLicenseSkusAsync(tenantId);

// Get detailed SKU information
var sku = await licenseService.GetLicenseSkuDetailsAsync(tenantId, skuId);

// Refresh license data cache
await licenseService.RefreshLicenseSkuDataAsync(tenantId);
```

### User License Assignment

```csharp
// Assign licenses to a user
var result = await licenseService.AssignLicensesToUserAsync(
    tenantId, userId, skuIds, disabledServicePlans);

// Remove licenses from a user
var result = await licenseService.RemoveLicensesFromUserAsync(
    tenantId, userId, skuIds);

// Update user license assignment
var result = await licenseService.UpdateUserLicenseAssignmentAsync(
    tenantId, userId, assignSkuIds, removeSkuIds, disableServicePlans);
```

### Bulk Operations

```csharp
// Execute bulk license operations
var operation = new BulkLicenseOperation
{
    OperationType = BulkLicenseOperationType.Assign,
    UserIds = userIds,
    SkuIds = skuIds,
    TotalUsers = userIds.Count
};

var result = await licenseService.ExecuteBulkLicenseOperationAsync(
    tenantId, operation);
```

### License Mapping Rules

```csharp
// Apply license mapping rules based on user attributes
var recommendedSkus = await licenseService.ApplyLicenseMappingRulesAsync(
    userData, mappingRules);

// Save custom mapping rules
var rule = new LicenseMappingRule
{
    Name = "Sales Team Rule",
    Conditions = new List<LicenseRuleCondition>
    {
        new LicenseRuleCondition
        {
            Property = "Department",
            Operator = LicenseRuleOperator.Equals,
            Value = "Sales"
        }
    },
    AssignSkuIds = new List<string> { "SALES_LICENSE_SKU" }
};

await licenseService.SaveLicenseMappingRuleAsync(rule);
```

### Migration Integration

```csharp
// Process wave license assignments during migration
var waveLicenseSettings = new WaveLicenseSettings
{
    WaveId = waveId,
    AutoAssignLicenses = true,
    DefaultSkuIds = defaultSkus,
    CustomMappingRules = mappingRules,
    RemoveSourceLicenses = true
};

var result = await licenseService.ProcessWaveLicenseAssignmentsAsync(
    tenantId, waveId, users, waveLicenseSettings);
```

### Compliance and Reporting

```csharp
// Generate comprehensive compliance report
var report = await licenseService.GenerateComplianceReportAsync(
    tenantId, includeUsers: true, includeIssues: true);

// Scan for compliance issues
var issues = await licenseService.ScanForComplianceIssuesAsync(tenantId);

// Get license utilization statistics
var stats = await licenseService.GetLicenseUtilizationStatsAsync(tenantId);
```

## User Interface Components

### Migration Planning Integration

The license assignment system integrates seamlessly with the Migration Planning interface:

- **License Selection** - Choose default license bundles per wave
- **Mapping Rules** - Define automatic license assignment based on user attributes
- **Validation** - Pre-migration license requirement validation
- **Cost Estimation** - Calculate estimated monthly license costs

### License Compliance Interface

Dedicated compliance interface provides:

- **User License View** - Comprehensive view of all user license assignments
- **Compliance Issues** - Real-time identification and resolution of compliance issues
- **Bulk Operations** - Mass license assignment and removal capabilities
- **Reporting** - Generate and export compliance reports

## Configuration

### Prerequisites

1. **Azure AD Application Registration** - Required for Graph API access
2. **Required API Permissions**:
   - `User.ReadWrite.All`
   - `Directory.ReadWrite.All`
   - `Organization.Read.All`
   - `LicenseAssignment.ReadWrite.All`

### Setup Steps

1. **Configure Target Profiles** - Set up target tenant profiles with credentials
2. **Test Connectivity** - Verify Graph API connectivity and permissions
3. **Load License SKUs** - Initialize available license inventory
4. **Create Mapping Rules** - Define automatic assignment rules (optional)

### Target Profile Configuration

```json
{
  "tenantId": "12345678-1234-1234-1234-123456789012",
  "displayName": "Target Tenant",
  "graphApiCredentials": {
    "clientId": "your-app-client-id",
    "clientSecret": "your-app-client-secret"
  },
  "licenseSettings": {
    "autoAssignLicenses": true,
    "defaultSkuIds": ["DEFAULT_SKU_ID"],
    "removeSourceLicenses": true
  }
}
```

## Migration Workflow Integration

### Pre-Migration Phase

1. **License Inventory** - Load available license SKUs from target tenant
2. **Requirement Analysis** - Analyze user requirements based on discovery data
3. **Cost Estimation** - Calculate estimated licensing costs
4. **Validation** - Ensure sufficient licenses are available

### Migration Execution

1. **Pre-Assignment** - Assign licenses before user migration (if configured)
2. **Post-Assignment** - Assign licenses after successful user creation
3. **Service Plan Configuration** - Enable/disable specific service plans
4. **Error Handling** - Handle assignment failures gracefully

### Post-Migration

1. **Source Cleanup** - Remove licenses from source environment
2. **Validation** - Verify all users have correct license assignments
3. **Compliance Check** - Scan for any compliance issues
4. **Reporting** - Generate migration license report

## License Mapping Rules

### Rule Structure

```csharp
public class LicenseMappingRule
{
    public string Id { get; set; }
    public string Name { get; set; }
    public bool IsEnabled { get; set; }
    public int Priority { get; set; }
    public List<LicenseRuleCondition> Conditions { get; set; }
    public List<string> AssignSkuIds { get; set; }
    public List<string> RemoveSkuIds { get; set; }
}

public class LicenseRuleCondition
{
    public string Property { get; set; } // User property to evaluate
    public LicenseRuleOperator Operator { get; set; }
    public string Value { get; set; }
    public bool IsCaseSensitive { get; set; }
}
```

### Example Rules

**Executive License Rule**:
```csharp
new LicenseMappingRule
{
    Name = "Executive License Assignment",
    Priority = 1,
    Conditions = new List<LicenseRuleCondition>
    {
        new LicenseRuleCondition
        {
            Property = "JobTitle",
            Operator = LicenseRuleOperator.Contains,
            Value = "CEO|CTO|CFO|Director",
            IsCaseSensitive = false
        }
    },
    AssignSkuIds = new List<string> { "OFFICE365_E5_SKU" }
}
```

**Department-Based Rule**:
```csharp
new LicenseMappingRule
{
    Name = "Sales Team Licenses",
    Priority = 2,
    Conditions = new List<LicenseRuleCondition>
    {
        new LicenseRuleCondition
        {
            Property = "Department",
            Operator = LicenseRuleOperator.Equals,
            Value = "Sales"
        }
    },
    AssignSkuIds = new List<string> { "OFFICE365_E3_SKU", "DYNAMICS365_SALES_SKU" }
}
```

## Compliance Monitoring

### Compliance Issues Detected

1. **Missing Usage Location** - Users with licenses but no usage location
2. **Disabled Users with Licenses** - Disabled accounts still consuming licenses
3. **Active Users without Licenses** - Enabled users without required licenses
4. **Over-Licensed Users** - Users with more licenses than needed
5. **License Conflicts** - Conflicting license assignments

### Compliance Reporting

- **User Assignment Report** - Detailed view of all user license assignments
- **Utilization Report** - License utilization statistics and trends
- **Cost Analysis** - License cost breakdown and optimization opportunities
- **Issue Summary** - Compliance issues summary with resolution recommendations

## Performance Considerations

### Caching Strategy

- **SKU Cache** - License SKU data cached per tenant with configurable TTL
- **User Assignment Cache** - User license assignments cached for performance
- **Permission Cache** - Graph API permissions cached to reduce API calls

### Bulk Operations

- **Concurrent Processing** - Configurable concurrency limits for bulk operations
- **Batch Size Management** - Intelligent batching for large operations
- **Progress Reporting** - Real-time progress updates for long-running operations
- **Error Resilience** - Individual failure handling without stopping entire operation

### API Rate Limiting

- **Throttling Detection** - Automatic detection of Graph API throttling
- **Exponential Backoff** - Intelligent retry logic with exponential backoff
- **Request Optimization** - Efficient Graph API query patterns
- **Batch Requests** - Use of Graph API batch requests where possible

## Error Handling

### Common Error Scenarios

1. **Authentication Failures** - Invalid credentials or expired tokens
2. **Permission Errors** - Insufficient Graph API permissions
3. **License Shortfalls** - Insufficient available licenses
4. **User Not Found** - Target user doesn't exist
5. **SKU Not Available** - Requested license SKU not available in tenant

### Error Resolution

- **Detailed Logging** - Comprehensive error logging for troubleshooting
- **User-Friendly Messages** - Clear error messages in the UI
- **Automatic Retry** - Intelligent retry logic for transient failures
- **Graceful Degradation** - Continue operation when non-critical errors occur

## Security Considerations

### Credential Management

- **DPAPI Encryption** - All credentials encrypted using Windows DPAPI
- **Secure Storage** - Credentials stored securely in user profile
- **Token Management** - Automatic token refresh and secure token storage
- **Least Privilege** - Minimum required Graph API permissions

### Audit and Compliance

- **Complete Audit Trail** - All license operations logged with full context
- **Compliance Reporting** - Regular compliance reports for audit purposes
- **Data Privacy** - No sensitive user data stored beyond operational requirements
- **Secure Communication** - All API communications use HTTPS/TLS

## Monitoring and Maintenance

### Health Checks

- **Connectivity Tests** - Regular Graph API connectivity validation
- **Permission Verification** - Ongoing validation of required permissions
- **License Inventory** - Regular synchronization of license availability
- **Performance Monitoring** - Track operation performance and identify bottlenecks

### Maintenance Tasks

- **Cache Cleanup** - Regular cleanup of expired cache entries
- **Log Rotation** - Automatic log file rotation and cleanup
- **Report Archival** - Archive old compliance reports
- **Configuration Backup** - Regular backup of license configuration

## Integration Examples

### Migration Service Integration

```csharp
// Enhanced migration service with license assignment
public async Task<IList<MigrationResult>> MigrateWaveAsync(
    MigrationWave wave, 
    MigrationSettings settings, 
    TargetContext target, 
    WaveLicenseSettings licenseSettings)
{
    // Pre-migration license assignment
    if (licenseSettings?.AutoAssignLicenses == true)
    {
        var licenseResult = await _licenseService.ProcessWaveLicenseAssignmentsAsync(
            target.TenantId, wave.Id, wave.Users, licenseSettings);
    }

    // Perform migration
    var migrationResults = await PerformMigration(wave, settings, target);

    // Post-migration source license cleanup
    if (licenseSettings?.RemoveSourceLicenses == true)
    {
        var sourceCleanup = await _licenseService.RemoveSourceLicensesAsync(
            settings.SourceTenantId, successfulUserIds);
    }

    return migrationResults;
}
```

### UI Integration Example

```csharp
// Migration planning with license validation
private async Task ValidateWaveLicensesAsync(MigrationWave wave)
{
    var users = GetUsersFromWave(wave);
    var validationResult = await _licenseService.ValidateWaveLicenseRequirementsAsync(
        targetTenantId, users, waveLicenseSettings);

    if (!validationResult.IsValid)
    {
        DisplayLicenseValidationErrors(validationResult.ValidationErrors);
    }
}
```

## Best Practices

### License Assignment Strategy

1. **Rule-Based Assignment** - Use mapping rules for consistent, scalable assignment
2. **Gradual Rollout** - Assign licenses in waves to minimize impact
3. **Cost Optimization** - Regularly review and optimize license assignments
4. **Compliance First** - Ensure all assignments comply with licensing terms

### Performance Optimization

1. **Batch Operations** - Use bulk operations for multiple users
2. **Cache Utilization** - Leverage caching for frequently accessed data
3. **Async Processing** - Use asynchronous operations for better responsiveness
4. **Progress Reporting** - Provide feedback for long-running operations

### Error Management

1. **Graceful Degradation** - Continue operation when possible despite errors
2. **Detailed Logging** - Log all operations for troubleshooting
3. **User Communication** - Provide clear, actionable error messages
4. **Automatic Recovery** - Implement retry logic for transient failures

## Troubleshooting Guide

### Common Issues

**Issue: "No Graph API credentials found"**
- **Cause**: Target profile not configured with Graph API credentials
- **Solution**: Configure target profile with valid client ID and secret

**Issue: "Insufficient permissions"**
- **Cause**: Graph API application doesn't have required permissions
- **Solution**: Grant required permissions to the Azure AD application

**Issue: "License not available"**
- **Cause**: Requested license SKU not available in target tenant
- **Solution**: Purchase additional licenses or modify assignment rules

**Issue: "Bulk operation timeout"**
- **Cause**: Large bulk operations exceeding timeout limits
- **Solution**: Reduce batch size or increase timeout settings

### Diagnostic Commands

```csharp
// Test Graph API connectivity
var connectivity = await licenseService.TestGraphConnectivityAsync(tenantId);

// Validate permissions
var permissions = await licenseService.ValidateGraphPermissionsAsync(tenantId);

// Get utilization stats
var stats = await licenseService.GetLicenseUtilizationStatsAsync(tenantId);
```

## Future Enhancements

### Planned Features

1. **Advanced Analytics** - Machine learning-based license optimization recommendations
2. **Cost Forecasting** - Predictive cost analysis based on usage patterns
3. **Automated Cleanup** - Intelligent cleanup of unused licenses
4. **Integration Expansion** - Support for additional Microsoft services
5. **Enhanced Reporting** - Advanced visualization and reporting capabilities

### API Enhancements

1. **Webhook Support** - Real-time notifications for license changes
2. **Advanced Filtering** - More sophisticated filtering options
3. **Custom Attributes** - Support for custom user attributes in mapping rules
4. **Scheduled Operations** - Automated scheduled license operations

This comprehensive license assignment and compliance system provides enterprise-grade capabilities for managing Microsoft 365 licenses during M&A migration scenarios, ensuring optimal license utilization, compliance, and cost management.