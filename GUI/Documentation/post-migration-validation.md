# Post-Migration Validation and Rollback System

## Table of Contents
1. [Overview](#overview)
2. [System Architecture](#system-architecture)
3. [Validation Process](#validation-process)
4. [Understanding Validation Results](#understanding-validation-results)
5. [Rollback Operations](#rollback-operations)
6. [User Guide](#user-guide)
7. [Administrator Guide](#administrator-guide)
8. [Limitations and Considerations](#limitations-and-considerations)
9. [Troubleshooting](#troubleshooting)
10. [API Reference](#api-reference)

## Overview

The Post-Migration Validation and Rollback System is a comprehensive solution designed to verify the success of migration operations and provide rollback capabilities when issues are detected. This system ensures data integrity, validates configuration consistency, and provides administrators with the tools necessary to maintain successful migration outcomes.

### Key Features

- **Multi-Object Type Validation**: Supports Users, Mailboxes, Files, and SQL Databases
- **Real-Time Validation**: Asynchronous validation with progress reporting
- **Intelligent Issue Detection**: Categorized validation issues with severity levels
- **Automated Rollback**: Context-aware rollback operations with safety checks
- **Comprehensive Reporting**: Detailed validation summaries and audit trails
- **Visual Management Interface**: Modern WPF interface for validation result management

### Business Value

- **Risk Mitigation**: Early detection of migration issues prevents business disruption
- **Compliance Assurance**: Validates that migrated data meets organizational standards
- **Operational Efficiency**: Automated validation reduces manual verification overhead
- **Disaster Recovery**: Quick rollback capabilities minimize downtime in case of issues

## System Architecture

### Core Components

```
PostMigrationValidationService
├── UserValidationProvider
├── MailboxValidationProvider  
├── FileValidationProvider
└── SqlValidationProvider
```

### Data Flow

1. **Migration Completion** → Triggers validation workflow
2. **Validation Execution** → Multi-threaded validation across object types
3. **Result Analysis** → Issue categorization and severity assessment
4. **UI Presentation** → Real-time display of validation status
5. **Rollback Decision** → Administrator-driven or automated rollback execution

### Integration Points

- **Migration Service**: Automatic validation after migration completion
- **Logic Engine**: Access to discovery data for validation baseline comparison
- **Graph API**: Real-time validation against target tenant state
- **File System**: Direct validation of migrated file integrity
- **SQL Connections**: Database validation through direct connectivity

## Validation Process

### Validation Workflow

#### 1. Pre-Validation Setup
- **Target Context Verification**: Confirms connectivity to target environment
- **Baseline Data Loading**: Retrieves source configuration for comparison
- **Service Initialization**: Establishes connections to all validation providers

#### 2. Object-Level Validation
Each migrated object undergoes comprehensive validation across multiple categories:

**User Validation Categories:**
- Account Existence and Status
- Licensing and Service Plans
- Attribute Consistency
- Group Membership Verification
- Mail Property Configuration

**Mailbox Validation Categories:**
- Mailbox Existence and Accessibility
- Item Count and Size Verification
- Folder Structure Integrity
- Permission and Delegate Settings
- Archive and Retention Policies

**File Validation Categories:**
- File Existence and Accessibility
- Checksum and Integrity Verification
- ACL and Permission Consistency
- Metadata Preservation
- Path and Naming Compliance

**Database Validation Categories:**
- Database Existence and Connectivity
- Schema and Object Consistency
- Data Integrity Verification
- User Access and Permissions
- Backup and Recovery Readiness

#### 3. Validation Execution Phases

```
Phase 1: Connection Validation (10%)
├── Target environment connectivity
├── Service authentication verification
└── Permission level confirmation

Phase 2: Existence Validation (30%)
├── Object presence verification
├── Basic accessibility testing
└── Primary identifier confirmation

Phase 3: Configuration Validation (60%)
├── Attribute and property comparison
├── Permission and access verification
└── Relationship consistency checking

Phase 4: Integrity Validation (80%)
├── Data consistency verification
├── Checksum and hash comparison
└── Functional testing execution

Phase 5: Compliance Validation (100%)
├── Policy compliance verification
├── Security standard confirmation
└── Final validation summary generation
```

### Validation Criteria

#### Success Criteria
- Object exists in target environment
- All required attributes match source
- Permissions and access rights preserved
- Data integrity verified through checksums
- Functional tests pass without errors

#### Warning Criteria
- Minor attribute discrepancies that don't affect functionality
- Missing non-critical permissions
- Performance variations within acceptable ranges
- Non-blocking configuration differences

#### Error Criteria
- Missing critical attributes or permissions
- Failed functional tests
- Significant data discrepancies
- Security policy violations

#### Critical Criteria
- Object completely missing from target
- Complete loss of data or functionality
- Security breaches or unauthorized access
- System-level failures preventing validation

## Understanding Validation Results

### Validation Result Structure

```json
{
  "id": "unique-validation-id",
  "validatedObject": "source-object-reference",
  "objectType": "User|Mailbox|File|Database",
  "objectName": "human-readable-identifier",
  "severity": "Success|Warning|Error|Critical",
  "message": "summary-message",
  "issues": [
    {
      "severity": "issue-severity-level",
      "category": "validation-category",
      "description": "detailed-issue-description",
      "recommendedAction": "resolution-guidance",
      "technicalDetails": "technical-diagnostic-information"
    }
  ],
  "validatedAt": "validation-timestamp",
  "canRollback": true,
  "rollbackInProgress": false
}
```

### Severity Level Interpretation

#### Success (Green)
- **Meaning**: Migration completed successfully with no issues detected
- **Action Required**: None - object ready for production use
- **Rollback Recommendation**: Not recommended unless business requirements change

#### Warning (Orange)  
- **Meaning**: Migration successful but with minor issues that may need attention
- **Action Required**: Review recommended actions, monitor for impact
- **Rollback Recommendation**: Generally not required, address issues in place

#### Error (Red)
- **Meaning**: Significant issues detected that may impact functionality
- **Action Required**: Address issues promptly, may require manual intervention
- **Rollback Recommendation**: Consider rollback if issues cannot be resolved quickly

#### Critical (Dark Red)
- **Meaning**: Severe issues that prevent normal operation
- **Action Required**: Immediate attention required, likely requires rollback
- **Rollback Recommendation**: Strongly recommended unless issues can be resolved immediately

### Issue Categories

#### Account/Object Existence
- **Purpose**: Verifies the migrated object exists in the target environment
- **Common Issues**: Missing accounts, disabled objects, incorrect object types
- **Resolution**: Check migration logs, verify target permissions, re-run migration if necessary

#### Licensing and Services
- **Purpose**: Ensures appropriate licenses and services are assigned
- **Common Issues**: Missing licenses, incorrect service plans, license assignment errors
- **Resolution**: Assign required licenses, resolve license conflicts, verify tenant quotas

#### Attributes and Configuration
- **Purpose**: Validates attribute values match source configuration
- **Common Issues**: Incorrect display names, missing custom attributes, wrong department assignments
- **Resolution**: Update attributes manually, check attribute mapping rules, verify data source accuracy

#### Permissions and Access
- **Purpose**: Confirms security permissions and access rights are preserved
- **Common Issues**: Missing group memberships, incorrect ACLs, elevated/reduced permissions
- **Resolution**: Update group memberships, adjust ACLs, verify permission inheritance

#### Data Integrity
- **Purpose**: Ensures data consistency and completeness
- **Common Issues**: Checksum mismatches, missing files, corrupted data
- **Resolution**: Re-copy affected data, verify source integrity, check storage systems

## Rollback Operations

### Rollback Philosophy

The rollback system is designed with a "safety first" approach:
- **Non-Destructive**: Rollbacks disable rather than delete target objects
- **Reversible**: Rollback operations can be undone if performed in error
- **Auditable**: All rollback operations are logged with full context
- **Selective**: Rollbacks can be performed on individual objects or in bulk

### Rollback Types

#### User Rollback
**Actions Performed:**
1. Disable target user account (`AccountEnabled = false`)
2. Remove from security groups (optional, configurable)
3. Revoke assigned licenses (optional, configurable)
4. Add rollback audit entry

**Limitations:**
- Does not delete the target account (prevents accidental data loss)
- Group memberships are preserved by default (commented out for safety)
- Requires Graph API permissions: `User.ReadWrite.All`

#### Mailbox Rollback
**Actions Performed:**
1. Cancel active migration requests
2. Disable mailbox access
3. Revert DNS/MX record changes (if applicable)
4. Restore source mailbox connectivity

**Limitations:**
- Cannot roll back completed mailbox moves (use Exchange migration tools)
- May require manual DNS changes
- Large mailboxes may take significant time to roll back

#### File Rollback
**Actions Performed:**
1. Remove target file copies
2. Restore source access permissions
3. Update DFS/namespace redirections
4. Verify source file accessibility

**Limitations:**
- Cannot recover deleted source files
- May leave orphaned ACL entries
- Network share dependencies may require manual resolution

#### Database Rollback
**Actions Performed:**
1. Drop target database (after confirmation)
2. Restore source database connectivity
3. Update connection strings in applications
4. Verify source database integrity

**Limitations:**
- **DESTRUCTIVE OPERATION** - target database is dropped
- Cannot recover if source database has been modified/deleted
- Application connection strings must be updated manually
- May require application restart

### When to Rollback

#### Immediate Rollback Scenarios (Critical)
- Target object completely missing or inaccessible
- Complete data loss or corruption detected
- Security breach or unauthorized access identified
- System-level failures preventing normal operation

#### Consider Rollback Scenarios (Error)
- Significant functionality impaired
- Multiple validation failures across categories
- Business-critical features not working
- Resolution timeline exceeds acceptable downtime

#### Avoid Rollback Scenarios (Warning/Success)
- Minor configuration discrepancies
- Non-critical permission differences
- Performance variations within acceptable ranges
- Issues that can be resolved through configuration updates

### Rollback Decision Matrix

| Issue Count | Critical | Error | Warning | Recommendation |
|-------------|----------|-------|---------|----------------|
| 0 | 0 | 0 | Any | Continue - No rollback needed |
| 0 | 0 | 1-2 | Any | Monitor - Address errors individually |
| 0 | 0 | 3+ | Any | Investigate - Consider batch remediation |
| 0 | 1 | Any | Any | Rollback Recommended - Address critical issue |
| 0 | 2+ | Any | Any | Rollback Strongly Recommended |
| 1+ | Any | Any | Any | **IMMEDIATE ROLLBACK REQUIRED** |

## User Guide

### Accessing Validation Results

1. **Navigate to Migration Validation**
   - Open M&A Discovery Suite
   - Select "Migration" from the main navigation
   - Click on "Validation" tab

2. **View Validation Summary**
   - Review summary statistics at the top of the screen
   - Monitor success rate and issue distribution
   - Identify objects requiring attention

3. **Filter and Search Results**
   - Use object type filters (User, Mailbox, File, Database)
   - Filter by severity (Success, Warning, Error, Critical)
   - Use search to find specific objects
   - Clear filters to view all results

### Interpreting Validation Results

1. **Status Icons**
   - ✅ Green Circle: Validation successful
   - ⚠️ Orange Triangle: Warning - minor issues
   - ❌ Red X: Error - significant issues
   - ⛔ Dark Red Circle: Critical - immediate attention required

2. **Result Details**
   - Click "Details" button to view specific issues
   - Review issue categories and descriptions
   - Follow recommended actions for resolution
   - Check technical details for diagnostic information

3. **Issue Analysis**
   - Focus on Critical and Error severity items first
   - Review Warning items for potential future issues
   - Use recommended actions as resolution guidance
   - Escalate complex issues to system administrators

### Performing Rollbacks

1. **Single Object Rollback**
   - Select the problematic validation result
   - Click "Rollback" button (red background)
   - Confirm rollback operation in dialog
   - Monitor rollback progress and results

2. **Bulk Rollback Operations**
   - Select multiple objects using Ctrl+Click or checkboxes
   - Click "Rollback Selected" in the bottom action bar
   - Review objects to be rolled back
   - Confirm bulk rollback operation

3. **Emergency Rollback**
   - Use "Rollback All Failed" for critical situations
   - Applies to all objects with Error or Critical severity
   - Requires administrative confirmation
   - Provides detailed rollback status report

### Monitoring Progress

1. **Real-Time Updates**
   - Validation progress displayed in bottom status bar
   - Percentage completion for long-running operations
   - Cancel button available for in-progress operations

2. **Result Refresh**
   - Click "Refresh Validation" to update results
   - Automatic refresh after rollback operations
   - Manual refresh recommended after issue remediation

3. **Export and Reporting**
   - Click "Export Report" to generate detailed report
   - Includes summary statistics and all validation details
   - Useful for documentation and compliance purposes

## Administrator Guide

### System Configuration

#### Service Dependencies
```csharp
// Required service registrations
services.AddSingleton<PostMigrationValidationService>();
services.AddSingleton<IUserValidationProvider, UserValidationProvider>();
services.AddSingleton<IMailboxValidationProvider, MailboxValidationProvider>();
services.AddSingleton<IFileValidationProvider, FileValidationProvider>();
services.AddSingleton<ISqlValidationProvider, SqlValidationProvider>();
```

#### Graph API Configuration
```json
{
  "RequiredPermissions": [
    "User.Read.All",
    "User.ReadWrite.All",
    "Group.Read.All",
    "Mail.Read",
    "Directory.Read.All"
  ],
  "OptionalPermissions": [
    "Group.ReadWrite.All",
    "Mail.ReadWrite"
  ]
}
```

### Performance Tuning

#### Validation Concurrency
- Default: 3 concurrent validation operations per object type
- Adjust based on target environment capacity
- Monitor API throttling and adjust accordingly

#### Timeout Configuration
- User validation: 30 seconds default
- Mailbox validation: 60 seconds default
- File validation: 45 seconds default
- Database validation: 90 seconds default

#### Memory Management
- Validation results cached in memory during session
- Automatic cleanup after rollback operations
- Large environments may require memory monitoring

### Security Considerations

#### Permission Requirements
- **User Validation**: Requires Azure AD read permissions
- **Mailbox Validation**: Requires Exchange Online permissions
- **File Validation**: Requires target file system access
- **Database Validation**: Requires database connection permissions

#### Audit Logging
- All validation operations logged to system audit trail
- Rollback operations require administrative approval
- Sensitive data excluded from logs (passwords, keys)

#### Network Security
- Validation traffic encrypted in transit
- Service account authentication required
- Network isolation recommended for production environments

### Troubleshooting Common Issues

#### Graph API Authentication Failures
```
Error: "Insufficient privileges to complete the operation"
Resolution: Verify service principal has required permissions
Check: Application registration in Azure AD
```

#### File System Access Denied
```
Error: "Access to the path is denied"
Resolution: Verify service account has read access to target paths
Check: NTFS permissions and share-level permissions
```

#### Database Connection Failures
```
Error: "A network-related or instance-specific error occurred"
Resolution: Verify network connectivity and SQL authentication
Check: Connection strings, firewall rules, SQL authentication mode
```

## Limitations and Considerations

### General Limitations

#### Validation Scope
- **Real-Time Only**: Validation reflects target state at time of execution
- **No Historical Analysis**: Cannot validate changes made after validation
- **Dependency Awareness**: Limited understanding of complex inter-object dependencies
- **Custom Applications**: Cannot validate application-specific configurations

#### Network Dependencies
- **Connectivity Required**: All validation requires network access to target environment
- **Latency Sensitive**: High latency connections may cause timeout failures
- **Bandwidth Usage**: Large-scale validation may consume significant bandwidth
- **Firewall Restrictions**: Corporate firewalls may block validation traffic

### Object-Specific Limitations

#### User Validation
- **Custom Attributes**: Limited validation of organization-specific attributes
- **Application-Specific Settings**: Cannot validate app-specific user configurations
- **Federated Identity**: Limited validation of federated identity scenarios
- **Hybrid Environments**: Complex hybrid configurations may not validate completely

#### Mailbox Validation
- **Content Scanning**: Cannot validate individual email content integrity
- **Third-Party Add-ins**: Cannot validate Outlook add-in functionality
- **Mobile Device Policies**: Limited validation of mobile device management settings
- **Compliance Policies**: Cannot validate all compliance and retention policies

#### File Validation
- **Open Files**: Cannot validate files currently in use
- **Nested Permissions**: Complex inheritance scenarios may not validate fully
- **DFS Replication**: Cannot validate DFS replication status
- **File Locks**: Cannot detect all types of file locking

#### Database Validation
- **Application Logic**: Cannot validate application-specific business logic
- **Custom Objects**: Limited validation of custom database objects (UDFs, CLR)
- **Cross-Database Dependencies**: Cannot validate complex database relationships
- **Performance**: Cannot validate query performance characteristics

### Rollback Limitations

#### Non-Reversible Operations
- **Database Rollbacks**: Target database deletion cannot be undone
- **File Deletions**: Deleted target files cannot be recovered automatically
- **License Assignments**: Some license changes may not be immediately reversible
- **DNS Changes**: Manual DNS updates may be required

#### Time Constraints
- **Rollback Windows**: Some operations have limited rollback timeframes
- **Business Hours**: Rollbacks may be restricted to maintenance windows
- **Change Freezes**: Rollbacks may be blocked during change freeze periods
- **Approval Processes**: Emergency rollbacks may require management approval

#### Data Consistency
- **Partial Rollbacks**: Selective rollbacks may create inconsistent states
- **Related Objects**: Rolling back one object may affect others
- **External Dependencies**: Third-party systems may not be aware of rollbacks
- **Audit Trails**: Rollbacks may complicate compliance and audit requirements

## Troubleshooting

### Common Validation Issues

#### "Graph client not configured" Warning
**Symptoms**: UserValidationProvider shows configuration warnings
**Cause**: Missing or invalid Graph API client configuration
**Resolution**:
1. Verify Azure AD application registration
2. Confirm required permissions are granted
3. Check service principal authentication
4. Update Graph client configuration in application settings

#### "Could not validate licensing" Warnings
**Symptoms**: License validation consistently fails
**Cause**: Insufficient Graph API permissions or license service issues
**Resolution**:
1. Verify `User.Read.All` and `Directory.Read.All` permissions
2. Check for Azure AD service outages
3. Validate service principal has license assignment permissions
4. Test Graph API connectivity manually

#### File Validation "Access Denied" Errors
**Symptoms**: FileValidationProvider cannot access target files
**Cause**: Insufficient file system permissions
**Resolution**:
1. Verify service account has read access to target directories
2. Check NTFS permissions and inheritance
3. Confirm share-level permissions if accessing network shares
4. Test file access manually with service account credentials

#### Database Connection Timeouts
**Symptoms**: DatabaseValidationProvider fails with timeout errors
**Cause**: Network latency, database performance, or firewall issues
**Resolution**:
1. Increase timeout values in configuration
2. Check network connectivity between systems
3. Verify database server performance
4. Review firewall rules for database ports

### Performance Optimization

#### Slow Validation Performance
**Symptoms**: Validation takes longer than expected
**Causes and Solutions**:
- **Large Object Count**: Implement pagination or increase concurrency limits
- **Network Latency**: Cache frequently accessed data, use local validation where possible
- **API Throttling**: Implement exponential backoff, reduce concurrent requests
- **Resource Constraints**: Monitor memory and CPU usage, scale infrastructure if needed

#### Memory Usage Issues
**Symptoms**: High memory consumption during validation
**Causes and Solutions**:
- **Large Result Sets**: Implement result streaming, clear completed results
- **Object Retention**: Ensure validation objects are properly disposed
- **Cache Growth**: Implement cache size limits and eviction policies
- **Concurrent Operations**: Limit concurrent validation operations

#### UI Responsiveness Issues
**Symptoms**: User interface becomes unresponsive during validation
**Causes and Solutions**:
- **Blocking UI Thread**: Ensure all validation runs on background threads
- **Excessive UI Updates**: Throttle progress updates, batch UI changes
- **Memory Pressure**: Monitor memory usage, implement garbage collection triggers
- **Event Handling**: Review event handler performance, optimize XAML bindings

### Recovery Procedures

#### Failed Rollback Recovery
**If rollback operations fail:**
1. **Check Rollback Logs**: Review detailed error messages and technical details
2. **Verify Permissions**: Confirm service account has required permissions
3. **Manual Rollback**: Perform rollback steps manually using admin tools
4. **Escalation**: Contact system administrator or technical support
5. **Documentation**: Document failed rollback for future analysis

#### Partial Validation Results
**If validation completes with mixed results:**
1. **Priority Triage**: Address Critical and Error severity items first
2. **Batch Processing**: Group similar issues for efficient resolution
3. **Impact Assessment**: Evaluate business impact of unresolved issues
4. **Staged Remediation**: Resolve issues in order of business priority
5. **Re-validation**: Run validation again after issue resolution

#### System Recovery
**If validation system becomes unresponsive:**
1. **Service Restart**: Restart M&A Discovery Suite application
2. **Cache Clearing**: Clear validation result cache if available
3. **Permission Verification**: Verify all service permissions are intact
4. **Network Connectivity**: Test connectivity to all target environments
5. **Log Analysis**: Review application logs for error patterns

## API Reference

### PostMigrationValidationService

#### Core Validation Methods
```csharp
// Validate individual objects
Task<ValidationResult> ValidateUserAsync(UserDto user, TargetContext target, IProgress<ValidationProgress> progress = null)
Task<ValidationResult> ValidateMailboxAsync(MailboxDto mailbox, TargetContext target, IProgress<ValidationProgress> progress = null)
Task<ValidationResult> ValidateFilesAsync(FileItemDto fileItem, TargetContext target, IProgress<ValidationProgress> progress = null)
Task<ValidationResult> ValidateSqlAsync(DatabaseDto database, TargetContext target, IProgress<ValidationProgress> progress = null)

// Validate migration waves
Task<IList<ValidationResult>> ValidateWaveAsync(MigrationWave wave, TargetContext target, IProgress<ValidationProgress> progress = null)
```

#### Rollback Methods
```csharp
// Individual object rollbacks
Task<RollbackResult> RollbackUserAsync(UserDto user, TargetContext target, IProgress<ValidationProgress> progress = null)
Task<RollbackResult> RollbackMailboxAsync(MailboxDto mailbox, TargetContext target, IProgress<ValidationProgress> progress = null)
Task<RollbackResult> RollbackFilesAsync(FileItemDto fileItem, TargetContext target, IProgress<ValidationProgress> progress = null)
Task<RollbackResult> RollbackSqlAsync(DatabaseDto database, TargetContext target, IProgress<ValidationProgress> progress = null)

// Batch rollback operations
Task<RollbackResult> RollbackValidationResultAsync(ValidationResult validationResult, TargetContext target, IProgress<ValidationProgress> progress = null)
Task<IList<RollbackResult>> RollbackMultipleAsync(IList<ValidationResult> validationResults, TargetContext target, IProgress<ValidationProgress> progress = null)
```

#### Utility Methods
```csharp
// Get validation summary statistics
ValidationSummary GetValidationSummary(IList<ValidationResult> validationResults)
```

### Data Models

#### ValidationResult
```csharp
public class ValidationResult
{
    public string Id { get; set; }                          // Unique identifier
    public object ValidatedObject { get; set; }             // Source object reference
    public string ObjectType { get; set; }                  // "User", "Mailbox", "File", "Database"
    public string ObjectName { get; set; }                  // Human-readable name
    public ValidationSeverity Severity { get; set; }        // Success/Warning/Error/Critical
    public string Message { get; set; }                     // Summary message
    public List<ValidationIssue> Issues { get; }            // Detailed issues
    public DateTime ValidatedAt { get; set; }               // Validation timestamp
    public bool CanRollback { get; set; }                   // Rollback capability
    public bool RollbackInProgress { get; set; }            // Rollback status
}
```

#### ValidationIssue
```csharp
public class ValidationIssue
{
    public ValidationSeverity Severity { get; set; }        // Issue severity
    public string Category { get; set; }                    // Validation category
    public string Description { get; set; }                 // Issue description
    public string RecommendedAction { get; set; }           // Resolution guidance
    public string TechnicalDetails { get; set; }            // Diagnostic details
}
```

#### RollbackResult
```csharp
public class RollbackResult
{
    public bool Success { get; set; }                       // Rollback success status
    public string Message { get; set; }                     // Result message
    public List<string> Errors { get; }                     // Error messages
    public List<string> Warnings { get; }                   // Warning messages
    public DateTime RolledBackAt { get; set; }              // Rollback timestamp
}
```

#### ValidationSummary
```csharp
public class ValidationSummary
{
    public int TotalObjects { get; set; }                   // Total validated objects
    public int SuccessfulObjects { get; set; }              // Successful validations
    public int WarningObjects { get; set; }                 // Objects with warnings
    public int ErrorObjects { get; set; }                   // Objects with errors
    public int CriticalObjects { get; set; }                // Objects with critical issues
    public int TotalIssues { get; set; }                    // Total issue count
    public Dictionary<string, int> ObjectTypes { get; set; } // Objects by type
    public double SuccessRate => // Calculated success percentage
    public bool HasErrors => // True if errors or critical issues exist
    public bool HasWarnings => // True if warnings exist
}
```

### Error Handling

#### Exception Types
- **ServiceException**: Graph API and service-related errors
- **UnauthorizedAccessException**: Permission and access errors
- **TimeoutException**: Operation timeout errors
- **ValidationException**: Custom validation errors
- **ArgumentException**: Invalid parameter errors

#### Error Response Format
```csharp
// Standard error handling pattern
try 
{
    var result = await validationService.ValidateUserAsync(user, target);
    return result;
}
catch (ServiceException ex)
{
    // Handle Graph API errors
    var issue = new ValidationIssue
    {
        Severity = ValidationSeverity.Critical,
        Category = "Service Error",
        Description = ex.Error.Message,
        RecommendedAction = "Check service configuration and permissions",
        TechnicalDetails = ex.ToString()
    };
    return ValidationResult.Failed(user, "User", user.DisplayName, "Validation failed", new[] { issue });
}
```

---

## Document Information

- **Document Version**: 1.0
- **Created**: August 28, 2025
- **Last Updated**: August 28, 2025
- **Created By**: Documentation & QA Guardian
- **Review Status**: Ready for Review
- **Classification**: Internal Use - Technical Documentation

### Change History
| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-08-28 | Documentation & QA Guardian | Initial comprehensive documentation |

### Related Documentation
- [Migration Engine Documentation](migration-engine.md)
- [Pre-Migration Check Guide](pre-migration-check.md)
- [Logic Engine Architecture](logic-engine.md)
- [Data Caching System](data-caching.md)

---

*This documentation is part of the M&A Discovery Suite Technical Documentation Library. For questions or updates, contact the Documentation & QA Guardian team.*