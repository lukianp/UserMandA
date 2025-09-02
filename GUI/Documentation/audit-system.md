# Migration Audit System Documentation

## Overview

The Migration Audit System provides comprehensive logging, tracking, and reporting capabilities for all migration operations within the M&A Discovery Suite. This system captures detailed information about who performed what actions, when they occurred, where they were executed, and their outcomes.

## Architecture

### Core Components

1. **IAuditService Interface** - Contract for audit operations
2. **AuditService Implementation** - SQLite-based audit data management
3. **AuditEvent Model** - Comprehensive audit data structure
4. **AuditViewModel** - MVVM pattern view model for UI binding
5. **AuditView** - WPF user interface for audit data visualization
6. **MigrationService Integration** - Automatic audit logging for all migrations

### Data Storage

The audit system uses SQLite as its primary storage mechanism:
- **Location**: `C:\discoverydata\<profile>\Logs\migration-audit.db`
- **Schema**: Comprehensive table with full audit event details
- **Indexing**: Optimized indexes for common query patterns
- **Archiving**: Built-in data retention and archiving capabilities

## Audit Event Schema

### Core Fields

| Field | Type | Description |
|-------|------|-------------|
| AuditId | Guid | Unique identifier for each audit event |
| Timestamp | DateTime | Event timestamp (UTC) |
| UserPrincipalName | String | User who initiated the action |
| SessionId | String | Authentication session identifier |
| SourceProfile | String | Source company profile |
| TargetProfile | String | Target company profile |

### Action Context

| Field | Type | Description |
|-------|------|-------------|
| Action | Enum | Type of action (Started, Completed, Failed, etc.) |
| ObjectType | Enum | Type of object (User, Mailbox, File, etc.) |
| SourceObjectId | String | Unique ID of source object |
| SourceObjectName | String | Display name of source object |
| TargetObjectId | String | Unique ID of target object |
| TargetObjectName | String | Display name of target object |

### Migration Context

| Field | Type | Description |
|-------|------|-------------|
| WaveId | String | Migration wave identifier |
| WaveName | String | Migration wave name |
| BatchId | String | Migration batch identifier |
| Duration | TimeSpan | Operation duration |
| CorrelationId | String | Correlation ID for related operations |

### Environment Context

| Field | Type | Description |
|-------|------|-------------|
| SourceEnvironment | String | Source environment type |
| TargetEnvironment | String | Target environment type |
| MachineName | String | Computer where action was initiated |
| MachineIpAddress | String | IP address of the machine |

### Status and Results

| Field | Type | Description |
|-------|------|-------------|
| Status | Enum | Operation status (Success, Warning, Error, etc.) |
| StatusMessage | String | Detailed status message |
| ErrorCode | String | Error code (if failed) |
| ErrorMessage | String | Error message (if failed) |
| Warnings | List<String> | Warning messages |
| RetryAttempts | Int | Number of retry attempts |

### Performance Metrics

| Field | Type | Description |
|-------|------|-------------|
| ItemsProcessed | Int | Number of items processed |
| DataSizeBytes | Long | Size of data processed (bytes) |
| TransferRate | Double | Transfer rate (items/second or bytes/second) |
| Metadata | Dictionary | Additional key-value metadata |

### Relationship Fields

| Field | Type | Description |
|-------|------|-------------|
| ParentAuditId | Guid | Parent audit event ID |
| MigrationResultData | String | Serialized migration result details |

## Usage Guide

### Viewing Audit Data

1. **Access the Audit View**
   - Navigate to the Audit tab in the main application
   - The view displays recent audit events by default

2. **Filtering Data**
   - **Date Range**: Filter by start and end dates
   - **User**: Filter by user principal name
   - **Object Type**: Filter by migration object type
   - **Action**: Filter by audit action type
   - **Status**: Filter by operation status
   - **Wave**: Filter by migration wave
   - **Search Text**: Full-text search across object names and messages
   - **Max Records**: Limit number of results

3. **Applying Filters**
   - Click "Apply Filters" to refresh data with current filter criteria
   - Click "Clear" to reset all filters to default values
   - Click "Refresh" to reload data with current filters

### Statistics and Reporting

The statistics panel provides key metrics:

- **Total Events**: Total number of audit events
- **Successful Operations**: Number of successful operations
- **Failed Operations**: Number of failed operations  
- **Success Rate**: Percentage of successful operations
- **Warnings**: Number of operations with warnings
- **Average Duration**: Average operation duration
- **Data Processed**: Total amount of data processed

### Exporting Data

1. **CSV Export**
   - Click "Export CSV" to download audit data as CSV file
   - Includes all filtered events with complete details
   - Suitable for analysis in Excel or other tools

2. **PDF Export**
   - Click "Export PDF" to generate PDF audit report
   - Formatted report with key statistics and event details
   - Suitable for compliance documentation

### Data Management

1. **Archive Old Records**
   - Click "Archive Old" to archive records older than 90 days
   - Creates archive database with timestamped filename
   - Removes archived records from main database
   - Reclaims storage space automatically

2. **Database Validation**
   - Click "Validate DB" to check database integrity
   - Verifies required fields and SQLite integrity
   - Reports any data inconsistencies

## API Usage

### Logging Audit Events

```csharp
// Create audit event
var auditEvent = new AuditEvent
{
    Action = AuditAction.Started,
    ObjectType = ObjectType.User,
    SourceObjectName = "john.doe@company.com",
    Status = AuditStatus.InProgress,
    StatusMessage = "Starting user migration"
};

// Log the event
await auditService.LogAuditEventAsync(auditEvent);
```

### Querying Audit Data

```csharp
// Create filter
var filter = new AuditFilter
{
    StartDate = DateTime.Now.AddDays(-7),
    EndDate = DateTime.Now,
    Status = AuditStatus.Error,
    MaxRecords = 100
};

// Get filtered events
var events = await auditService.GetAuditEventsAsync(filter);
```

### Generating Statistics

```csharp
// Get statistics
var stats = await auditService.GetAuditStatisticsAsync(filter);
Console.WriteLine($"Success Rate: {stats.SuccessRate:F1}%");
Console.WriteLine($"Total Events: {stats.TotalEvents}");
```

## Integration with Migration Service

The audit system is automatically integrated with all migration operations:

1. **Wave-Level Auditing**
   - Logs migration wave start and completion
   - Captures wave composition and settings
   - Tracks overall wave statistics

2. **Item-Level Auditing**
   - Logs start and completion of each migration item
   - Captures detailed results and timing
   - Handles exceptions and failures gracefully

3. **Context Preservation**
   - Maintains audit context across async operations
   - Links related audit events via correlation IDs
   - Preserves user and session information

## Configuration

### Database Location

Default: `C:\discoverydata\<profile>\Logs\migration-audit.db`

Custom path can be specified in AuditService constructor:

```csharp
var auditService = new AuditService(logger, "C:\\custom\\path\\audit.db");
```

### Retention Policy

Default retention: 90 days for automatic archiving

Configure via ArchiveOldRecordsAsync method:

```csharp
// Archive records older than 180 days
await auditService.ArchiveOldRecordsAsync(TimeSpan.FromDays(180));
```

### Performance Tuning

The SQLite database uses optimized settings:
- **WAL Mode**: For better concurrent access
- **Optimized Indexes**: For common query patterns
- **Batched Operations**: For high-volume logging

## Security and Compliance

### Data Protection

- **Sensitive Data**: No passwords or secrets are logged
- **GDPR Compliance**: Personal data can be filtered/redacted
- **Access Control**: Database permissions follow Windows ACLs
- **Integrity Checking**: Built-in validation and corruption detection

### Audit Trail Integrity

- **Immutable Records**: Audit events cannot be modified after creation
- **Correlation IDs**: Enable tracking of related operations
- **Checksums**: Database integrity validation
- **Archive Chain**: Maintains historical continuity

## Troubleshooting

### Common Issues

1. **Database Access Errors**
   - Verify directory permissions for audit database path
   - Check disk space availability
   - Ensure no other processes are locking the database

2. **Performance Issues**
   - Consider archiving old records if database is large
   - Optimize filters to reduce data volume
   - Check available system memory

3. **Missing Audit Events**
   - Verify AuditService is properly injected into MigrationService
   - Check for exceptions in application logs
   - Validate audit context is set before migrations

### Log Locations

- **Application Logs**: Check Windows Event Log for audit service errors
- **Debug Logs**: Enable verbose logging for detailed troubleshooting
- **Database Logs**: SQLite error messages in application output

## Best Practices

1. **Regular Archiving**
   - Schedule monthly archiving of old records
   - Monitor database size and performance
   - Maintain backup of archive files

2. **Filter Usage**
   - Use date ranges to limit result sets
   - Apply specific filters before large exports
   - Monitor query performance with large datasets

3. **Compliance Reporting**
   - Export regular compliance reports
   - Document retention policies
   - Maintain audit trail documentation

4. **Monitoring**
   - Set up alerts for high error rates
   - Monitor migration statistics trends
   - Review warnings and failures regularly

## Version History

- **v1.0** - Initial implementation with basic audit logging
- **v1.1** - Added comprehensive UI and filtering capabilities
- **v1.2** - Enhanced with statistics, export, and archiving features
- **v1.3** - Integrated with MigrationService for automatic logging

---

*This documentation is part of the M&A Discovery Suite T-034 Migration Auditing and Reporting implementation.*