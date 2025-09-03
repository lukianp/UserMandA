# CSV Data Loading Standards for M&A Discovery Suite

## Overview

This document defines the standard CSV file formats and loading mechanisms used by the M&A Discovery Suite. All view models now load data exclusively from CSV files located at `C:\discoverydata\{profileName}\RawData\`.

Effective with this update, **no sample data generation occurs**. View models display empty grids when CSV files are missing or empty.

## Directory Structure

```
C:\discoverydata\
├── {profileName}\
│   └── RawData\
│       ├── Users.csv
│       ├── Groups.csv
│       ├── Infrastructure.csv
│       ├── Applications.csv
│       ├── MigrationItems.csv
│       ├── ExchangeMailboxes.csv
│       ├── SharePointSites.csv
│       ├── OneDriveAccounts.csv
│       ├── SecurityPolicies.csv
│       └── [Other entity-specific CSVs]
```

## CSV Schema Definitions

### 1. Users.csv

**Purpose**: Contains user account information for identity migrations

**Mandatory Columns**:
- `_DiscoveryTimestamp` (DateTimeOffset): When discovery occurred
- `_DiscoveryModule` (string): Discovery module identifier
- `_SessionId` (string): Discovery session identifier
- `DisplayName` (string): User's display name
- `UserPrincipalName` (string): Primary UPN
- `SamAccountName` (string): NT login name

**Optional Columns**:
- `Mail` (string): Primary email address
- `Department` (string): Organizational department
- `JobTitle` (string): Job role/title
- `CompanyName` (string): Company/agency name
- `ManagerDisplayName` (string): Manager's display name
- `CreatedDateTime` (DateTimeOffset): Account creation date
- `AccountEnabled` (bool): Account status
- `MobilePhone` (string): Mobile phone number
- `GivenName` (string): First name
- `Surname` (string): Last name
- `StreetAddress` (string): Street address
- `City` (string): City
- `State` (string): State/province
- `PostalCode` (string): Postal code
- `Country` (string): Country

**Sample Row**:
```
_DiscoveryTimestamp,_DiscoveryModule,_SessionId,DisplayName,UserPrincipalName,Mail,Department,JobTitle,SamAccountName,AccountEnabled,ManagerDisplayName
2024-09-02T10:00:00Z,AzureAD_Discovery,SESSION001,John Smith,john.smith@contoso.com,john.smith@contoso.com,IT,Systems Administrator,jsmith,True,Jane Wilson
```

### 2. Groups.csv

**Purpose**: Contains group information for permissions and distribution migrations

**Mandatory Columns**:
- `_DiscoveryTimestamp` (DateTimeOffset)
- `_DiscoveryModule` (string)
- `_SessionId` (string)
- `DisplayName` (string): Group display name
- `GroupType` (string): Security/Distribution

**Optional Columns**:
- `Mail` (string): Group email
- `Description` (string): Group description
- `MemberCount` (int): Number of members
- `OwnerCount` (int): Number of owners
- `SecurityEnabled` (bool): Security group flag
- `MailEnabled` (bool): Mail-enabled flag
- `Visibility` (string): Public/Private
- `CreatedDateTime` (DateTimeOffset): Creation date
- `Classification` (string): Group classification

**Sample Row**:
```
_DiscoveryTimestamp,_DiscoveryModule,_SessionId,DisplayName,GroupType,MailEnabled,SecurityEnabled,MemberCount,OwnerCount,Description
2024-09-02T10:00:00Z,AD_Groups_Discovery,SESSION001,IT-Admins,Security,False,True,15,2,IT Administration Group
```

### 3. Infrastructure.csv

**Purpose**: Contains infrastructure and device information for IT asset migrations

**Mandatory Columns**:
- `_DiscoveryTimestamp` (DateTimeOffset)
- `_DiscoveryModule` (string)
- `_SessionId` (string)
- `Name` (string): Device/server name
- `Type` (string): Server/Workstation/Printer

**Optional Columns**:
- `IPAddress` (string): Network address
- `OperatingSystem` (string): OS version
- `Domain` (string): Domain membership
- `Location` (string): Physical location
- `Status` (string): Online/Offline
- `Manufacturer` (string): Hardware manufacturer
- `Model` (string): Hardware model
- `LastSeen` (DateTimeOffset): Last connectivity
- `Description` (string): Description notes
- `Owner` (string): Responsible person/department

**Sample Row**:
```
_DiscoveryTimestamp,_DiscoveryModule,_SessionId,Name,Type,IPAddress,OperatingSystem,Domain,Location,Status,LastSeen,Owner
2024-09-02T10:00:00Z,Network_Discovery,SESSION001,DC01,Domain Controller,192.168.1.10,Windows Server 2019,contoso.com,Seattle Datacenter,Online,2024-09-02T10:30:00Z,IT Department
```

### 4. Applications.csv

**Purpose**: Contains software/application inventory for license and migration tracking

**Mandatory Columns**:
- `_DiscoveryTimestamp` (DateTimeOffset)
- `_DiscoveryModule` (string)
- `_SessionId` (string)
- `Name` (string): Application name
- `Version` (string): Software version

**Optional Columns**:
- `Publisher` (string): Software vendor
- `Type` (string): Application category
- `InstallDate` (DateTime): Installation date
- `SizeBytes` (long): Installation size
- `Location` (string): Install path
- `UserCount` (int): Users with access
- `GroupCount` (int): Groups with access
- `DeviceCount` (int): Devices with installation
- `LastAccessed` (DateTimeOffset): Last usage date

**Sample Row**:
```
_DiscoveryTimestamp,_DiscoveryModule,_SessionId,Name,Version,Publisher,Type,SizeBytes,UserCount,LastAccessed
2024-09-02T10:00:00Z,Software_Discovery,SESSION001,Microsoft Office 365,2023,Microsoft Corporation,Productivity Suite,2147483648,250,2024-09-02T09:15:00Z
```

### 5. MigrationItems.csv

**Purpose**: Contains migration tasks and workloads for planning and execution

**Mandatory Columns**:
- `_DiscoveryTimestamp` (DateTimeOffset)
- `_DiscoveryModule` (string)
- `_SessionId` (string)
- `Id` (string): Unique migration identifier
- `Type` (string): OneDrive/SharePoint/Exchange/etc
- `SourceIdentity` (string): Source identifier
- `TargetIdentity` (string): Target identifier

**Optional Columns**:
- `DisplayName` (string): User-friendly name
- `SourcePath` (string): Source location
- `TargetPath` (string): Target location
- `SizeBytes` (long): Data size
- `Status` (string): NotStarted/InProgress/Completed
- `Priority` (string): High/Normal/Low
- `Complexity` (string): Simple/Complex
- `EstimatedDuration` (TimeSpan): Expected duration
- `AssignedTechnician` (string): Responsible technician
- `BusinessJustification` (string): Migration rationale

**Sample Row**:
```
_DiscoveryTimestamp,_DiscoveryModule,_SessionId,Id,Type,SourceIdentity,TargetIdentity,DisplayName,SizeBytes,Status,Priority
2024-09-02T10:00:00Z,OneDrive_Discovery,SESSION001,OD_MIG_001,OneDrive,john.smith@contoso.com,john.smith@contoso.com,PacBook OneDrive Migration,5368709120,NotStarted,High
```

### 6. ExchangeMailboxes.csv

**Purpose**: Contains Exchange Mailbox information for email migration

**Mandatory Columns**:
- `_DiscoveryTimestamp` (DateTimeOffset)
- `_DiscoveryModule` (string)
- `_SessionId` (string)
- `PrimarySmtpAddress` (string): Mailbox SMTP address
- `DisplayName` (string): Mailbox display name

**Optional Columns**:
- `RecipientType` (string): UserMailbox/SharedMailbox
- `TotalItemSizeBytes` (long): Mailbox size
- `ItemCount` (int): Number of items
- `LastLogonTime` (DateTimeOffset): Last access
- `ProhibitSendQuota` (long): Send limit
- `ProhibitSendReceiveQuota` (long): Send/receive limit
- `IssueWarningQuota` (long): Warning threshold

### 7. SharePointSites.csv

**Purpose**: Contains SharePoint site collections and workspaces

**Mandatory Columns**:
- `_DiscoveryTimestamp` (DateTimeOffset)
- `_DiscoveryModule` (string)
- `_SessionId` (string)
- `Url` (string): Site URL
- `Title` (string): Site title

**Optional Columns**:
- `Template` (string): Site template
- `StorageUsedBytes` (long): Storage usage
- `OwnerName` (string): Primary owner
- `LastModifiedDate` (DateTimeOffset): Last modification
- `ItemCount` (int): Total items
- `ListCount` (int): Number of lists
- `SitePolicy` (string): Retention policy

### 8. OneDriveAccounts.csv

**Purpose**: Contains OneDrive for Business account information

**Mandatory Columns**:
- `_DiscoveryTimestamp` (DateTimeOffset)
- `_DiscoveryModule` (string)
- `_SessionId` (string)
- `DisplayName` (string): User display name
- `UserPrincipalName` (string): UPN

**Optional Columns**:
- `MySiteUrl` (string): OneDrive URL
- `AllocatedBytes` (long): Allocated storage
- `UsedBytes` (long): Used storage
- `ItemCount` (int): Number of items
- `LastActivityDate` (DateTimeOffset): Last activity
- `FileCount` (int): Number of files
- `FolderCount` (int): Number of folders

### 9. SecurityPolicies.csv

**Purpose**: Contains security policy and governance information

**Mandatory Columns**:
- `_DiscoveryTimestamp` (DateTimeOffset)
- `_DiscoveryModule` (string)
- `_SessionId` (string)
- `PolicyName` (string): Policy name
- `PolicyType` (string): Group Policy/Conditional Access/etc

**Optional Columns**:
- `Description` (string): Policy description
- `Enabled` (bool): Policy enabled status
- `Scope` (string): Computer/User/Both
- `AppliedTo` (string): Target entities
- `LastModified` (DateTimeOffset): Modification date
- `CreatedBy` (string): Creating entity
- `ComplianceStatus` (string): Compliant/NonCompliant

## Loading Behavior

### File Discovery
- CSV files are discovered using configurable patterns (e.g., `*Groups*.csv`, `Groups.csv`)
- Multiple matching files can be processed (file-based deduplication)
- Files are searched in multiple locations: active profile, secondary, and test data directories

### Error Handling
- Missing CSV files result in empty collections (no exceptions thrown)
- Warnings are logged for incompatible schemas
- Invalid rows are skipped with warnings
- File I/O errors are caught and logged

### Data Deduplication
- Records are deduplicated based on primary key (e.g., UPN for users)
- Latest timestamp takes precedence in conflicts
- Duplicate warnings are logged

### Performance Considerations
- Files up to 10MB are processed synchronously
- Larger files use async streaming with batching
- Concurrent file processing is throttled
- Memory usage is monitored during processing

## Testing & Validation

### Unit Testing
- Test empty CSV files result in empty collections
- Test missing files result in empty collections
- Test malformed CSV files result in empty collections
- Test valid CSV files populate collections correctly
- Test schema validation and warning generation

### Integration Testing
- Test with real discovery data files
- Test cross-entity relationships and validations
- Test file watcher notifications
- Test error handling in production-like scenarios

### Load Testing
- Test with large CSV files (100K+ rows)
- Test concurrent file processing limits
- Test memory usage with multiple large files
- Test application responsiveness during loading

## View Model Integration

Each view model follows this pattern:
1. Inject `ICsvDataLoader` via constructor
2. Call appropriate `Load*Async()` method in `LoadAsync()`
3. Bind `ObservableCollection<T>` to UI
4. Handle exceptions and log warnings
5. Raise `PropertyChanged` to update UI

No fallback to sample data generation exists.

## Monitoring & Logging

### Log Events
- INFO: CSV file loaded successfully with counts
- WARN: CSV file missing (showing empty data)
- WARN: Schema warnings (optional columns missing)
- ERROR: CSV parsing errors
- DEBUG: Detailed loading progress

### Metrics
- File processing time
- Row counts and validation failures
- Memory usage during loading
- Concurrent file processing statistics

### Health Checks
- Can access CSV directory
- Can read CSV files
- Schema validation status
- Loading performance metrics

## Maintenance

### Schema Updates
- New columns should be optional initially
- Document version changes in this file
- Update `CsvDataServiceNew` parsing logic
- Provide migration guidance for existing CSV files

### File Naming Conventions
- Use entity names in singular form: `Users.csv`, not `User.csv`
- Use camel case for compound names: `ExchangeMailboxes.csv`
- Avoid spaces and special characters in filenames

### Backup & Recovery
- CSV files should be backed up with profile data
- Version control integration recommended
- Recovery procedures for corrupted files documented separately

## Future Enhancements

1. **Schema Versioning**: Add version headers to CSV files
2. **Validation Rules**: Enhanced business logic validation
3. **File Change Notifications**: Real-time UI updates
4. **Compressed Archives**: Support for ZIP/tar archives
5. **Database Integration**: Optional database storage
6. **Cloud Storage**: Support for Azure/AWS storage paths