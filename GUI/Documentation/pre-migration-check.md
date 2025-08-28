# Pre-Migration Eligibility Check System

## Overview

The Pre-Migration Check System provides comprehensive eligibility validation and object mapping capabilities before executing migration operations. This system ensures migration readiness by identifying blocked objects, validating configurations, and providing intelligent mapping between source and target environments.

## Table of Contents

1. [System Architecture](#system-architecture)
2. [Eligibility Rules](#eligibility-rules)
3. [Object Mapping](#object-mapping)
4. [User Interface Guide](#user-interface-guide)
5. [Configuration](#configuration)
6. [Troubleshooting](#troubleshooting)
7. [API Reference](#api-reference)

## System Architecture

### Core Components

- **PreMigrationCheckService** - Core service implementing eligibility validation and object mapping
- **PreMigrationCheckViewModel** - MVVM ViewModel managing UI interactions and state
- **PreMigrationCheckView** - WPF UserControl providing the user interface
- **FuzzyMatchingAlgorithm** - Jaro-Winkler algorithm implementation for intelligent object matching

### Data Flow

```
Source Environment → Eligibility Rules → Object Mapping → Manual Review → Migration Readiness
```

### Dependencies

- **ILogicEngineService** - Provides access to discovery data (users, mailboxes, files, databases)
- **Microsoft.Extensions.Logging** - Structured logging and diagnostics
- **System.Text.Json** - Manual mapping persistence

## Eligibility Rules

The system implements comprehensive eligibility rules for each object type to ensure migration readiness.

### User Eligibility Rules

| Rule | Description | Resolution |
|------|-------------|------------|
| **Account Enabled** | Source account must be enabled | Enable the user account in source domain |
| **Valid UPN** | User Principal Name must be present and valid | Correct UPN format, remove invalid characters |
| **Character Validation** | UPN cannot contain spaces, quotes, or invalid characters | Clean up UPN: `user@domain.com` format |
| **Mailbox Size** | Mailbox size must be under 100GB limit | Archive or clean mailbox to reduce size |
| **Display Name** | Display name cannot contain blocked characters (`<>"|`) | Remove or replace invalid characters |

#### User Rule Details

**Account Enabled Check**
```csharp
// Rule implementation
if (!user.Enabled)
{
    item.Issues.Add("Source account is disabled");
}
```
**Resolution**: Navigate to Active Directory Users and Computers, locate the user, and enable the account.

**UPN Validation**
```csharp
// Check for missing UPN
if (string.IsNullOrEmpty(user.UPN))
{
    item.Issues.Add("User Principal Name is missing");
}
// Check for invalid characters
else if (user.UPN.Contains(" ") || user.UPN.Contains("'") || user.UPN.Contains("\""))
{
    item.Issues.Add("UPN contains invalid characters");
}
```
**Resolution**: Set a valid UPN in format `username@domain.com` without spaces or special characters.

### Mailbox Eligibility Rules

| Rule | Description | Resolution |
|------|-------------|------------|
| **Size Limit** | Mailbox size must be under 100GB | Archive old emails, compress attachments |
| **Supported Type** | Must be UserMailbox, SharedMailbox, RoomMailbox, or EquipmentMailbox | Convert unsupported mailbox types |
| **Valid UPN** | Mailbox UPN must be valid email format | Correct mailbox UPN configuration |
| **Litigation Hold** | Mailbox should not be under litigation hold (future) | Remove litigation hold if appropriate |
| **Archive Status** | Archive mailbox must be properly configured (future) | Configure archive mailbox settings |

#### Mailbox Rule Details

**Size Validation**
```csharp
// Size limit check
if (mailbox.SizeMB > 100000) // 100GB default limit
{
    item.Issues.Add($"Mailbox size ({mailbox.SizeMB:N0} MB) exceeds 100GB limit");
}
```
**Resolution**: Use `Get-MailboxStatistics` to verify size, then archive or delete old items.

**Type Validation**
```csharp
// Supported mailbox types
var supportedTypes = new[] { "UserMailbox", "SharedMailbox", "RoomMailbox", "EquipmentMailbox" };
if (!supportedTypes.Contains(mailbox.Type))
{
    item.Issues.Add($"Unsupported mailbox type: {mailbox.Type}");
}
```
**Resolution**: Convert mailbox to supported type using Exchange Management Shell.

### File Share Eligibility Rules

| Rule | Description | Resolution |
|------|-------------|------------|
| **Path Length** | Path must be under 260 characters | Restructure folder hierarchy, use shorter names |
| **Invalid Characters** | Path cannot contain invalid file system characters | Remove or replace invalid characters |
| **Accessibility** | Share path must be accessible from migration server | Fix network connectivity, permissions |
| **File Locks** | No open file locks during migration window (future) | Coordinate with users to close files |
| **Blocked Extensions** | Certain file types may be blocked (future) | Review and approve blocked file types |

#### File Share Rule Details

**Path Length Check**
```csharp
// Windows path length limitation
if (share.Path.Length > 260)
{
    item.Issues.Add($"Path length ({share.Path.Length}) exceeds 260 character limit");
}
```
**Resolution**: Restructure the folder hierarchy to use shorter path names.

**Invalid Characters**
```csharp
// File system invalid characters
var invalidChars = Path.GetInvalidPathChars();
if (share.Path.IndexOfAny(invalidChars) >= 0)
{
    item.Issues.Add("Path contains invalid characters");
}
```
**Resolution**: Rename folders/files to remove characters like `<>:"|?*`.

### Database Eligibility Rules

| Rule | Description | Resolution |
|------|-------------|------------|
| **Valid Name** | Database name cannot be empty or contain invalid characters | Rename database with valid naming convention |
| **Connection Availability** | Database must be accessible during migration (future) | Ensure SQL Server connectivity |
| **Compatibility Level** | Database compatibility level must be supported (future) | Upgrade database compatibility level |
| **Encryption Status** | Encrypted databases may require special handling (future) | Plan for TDE/encryption key management |
| **Active Connections** | Database should not have active connections during migration (future) | Schedule maintenance window |

#### Database Rule Details

**Name Validation**
```csharp
// Database name validation
if (string.IsNullOrEmpty(db.Database))
{
    item.Issues.Add("Database name is missing");
}
else if (db.Database.IndexOfAny(new[] { '<', '>', '"', '|', '\0', '\n', '\r', '\t' }) >= 0)
{
    item.Issues.Add("Database name contains invalid characters");
}
```
**Resolution**: Use `ALTER DATABASE` to rename with valid characters only.

## Object Mapping

The system provides intelligent object mapping between source and target environments using multiple matching strategies.

### Mapping Strategies

#### 1. Exact Match
- **Priority**: Highest
- **Method**: Direct comparison of key identifiers (UPN, Object ID)
- **Confidence**: 100%
- **Use Case**: Objects with identical identifiers in source and target

```csharp
// Exact UPN match
var exactMatch = targetUsers.FirstOrDefault(t => 
    string.Equals(t.UPN, sourceUser.UPN, StringComparison.OrdinalIgnoreCase));
```

#### 2. Fuzzy Match (Jaro-Winkler Algorithm)
- **Priority**: Medium
- **Method**: Similarity analysis of DisplayName and SamAccountName
- **Confidence**: 80%-99%
- **Threshold**: 80% for DisplayName, 85% for SamAccountName
- **Use Case**: Objects with similar but not identical names

```csharp
// DisplayName similarity
var nameConfidence = _fuzzyMatcher.CalculateJaroWinklerSimilarity(
    sourceUser.DisplayName, targetUser.DisplayName);
if (nameConfidence >= 0.8)
{
    // Consider as potential match
}
```

**Jaro-Winkler Algorithm Details**:
- Accounts for character transpositions and common prefixes
- Bias toward strings that match from the beginning (common with names)
- Maximum 4-character prefix bonus
- Case-insensitive comparison

#### 3. Manual Mapping
- **Priority**: Override (highest when specified)
- **Method**: Administrator-specified mappings
- **Confidence**: 100% (user-defined)
- **Persistence**: Stored in `{ProfilePath}\Mappings\manual-mappings.json`
- **Use Case**: Complex scenarios requiring human judgment

### Mapping Configuration

**Fuzzy Matching Thresholds**:
```json
{
  "FuzzyMatchingSettings": {
    "DisplayNameThreshold": 0.80,
    "SamAccountNameThreshold": 0.85,
    "MaxPrefixLength": 4,
    "CaseInsensitive": true
  }
}
```

**Manual Mapping Storage**:
```json
{
  "sourceUserSID": {
    "SourceId": "S-1-5-21-...",
    "TargetId": "target-object-id",
    "TargetName": "Target Display Name",
    "MappingType": "Manual",
    "Confidence": 1.0,
    "CreatedAt": "2025-08-28T10:30:00Z",
    "CreatedBy": "admin@company.com",
    "Notes": "Special mapping due to name change"
  }
}
```

## User Interface Guide

### Main Interface Components

#### 1. Control Panel
Located at the top of the interface:

- **Run Checks** - Executes eligibility validation for all objects
- **Refresh** - Re-runs the eligibility checks with current data
- **Export Report** - Exports results to CSV/Excel format (future feature)
- **Save Mappings** - Persists manual mappings to configuration

#### 2. Progress Indicator
Shows during eligibility check execution:
- Progress percentage (0-100%)
- Current operation description
- Estimated completion time

#### 3. Summary Statistics
Real-time counters showing:
- **Eligible** (Green) - Objects ready for migration
- **Blocked** (Red) - Objects with eligibility issues
- **Unmapped** (Orange) - Eligible objects without target mapping
- **Mapped** (Blue) - Objects with confirmed target mapping

#### 4. Filter Controls
Advanced filtering options:
- **Search** - Text search across names, IDs, and issues
- **Type** - Filter by object type (User, Mailbox, FileShare, Database)
- **Status** - Filter by eligibility status (All, Eligible, Blocked)
- **Mapping** - Filter by mapping status (All, Mapped, Unmapped, Exact Match, Fuzzy Match, Manual)

### Using the Interface

#### Running Eligibility Checks

1. **Click "Run Checks"** to start the validation process
2. **Monitor Progress** via the progress bar and status messages
3. **Review Results** in the main list view
4. **Filter Results** to focus on specific object types or issues
5. **Export Report** for documentation and planning

#### Interpreting Results

**Status Indicators**:
- 🟢 **Green Circle** - Object is eligible for migration
- 🔴 **Red Circle** - Object is blocked due to issues

**Issue Resolution**:
1. **Click on an object** to see detailed issue descriptions
2. **Review "Issues Summary"** column for quick problem identification
3. **Refer to resolution guidance** in this documentation
4. **Re-run checks** after fixing issues

#### Manual Mapping Process

1. **Select an eligible object** in the main list
2. **Click "Map" button** to open mapping dialog
3. **Enter Target ID** and **Target Name** for the destination object
4. **Add Notes** for documentation (optional)
5. **Click "Apply"** to create the mapping
6. **Click "Save Mappings"** to persist changes

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| **Ctrl+R** | Run Checks |
| **F5** | Refresh |
| **Ctrl+F** | Focus Search Box |
| **Ctrl+E** | Export Report |
| **Ctrl+S** | Save Mappings |
| **Delete** | Remove Selected Mapping |

## Configuration

### File Locations

**Configuration Files**:
- `C:\discoverydata\{ProfileName}\Mappings\manual-mappings.json` - Manual object mappings
- `C:\discoverydata\{ProfileName}\PreMigrationReports\` - Generated reports (future)

**CSV Data Sources** (via LogicEngineService):
- `C:\discoverydata\{ProfileName}\RawData\users.csv`
- `C:\discoverydata\{ProfileName}\RawData\mailboxes.csv`
- `C:\discoverydata\{ProfileName}\RawData\fileshares.csv`
- `C:\discoverydata\{ProfileName}\RawData\sqldatabases.csv`

### Service Configuration

**Dependency Injection Registration**:
```csharp
services.AddScoped<PreMigrationCheckService>();
services.AddScoped<PreMigrationCheckViewModel>();
```

**Service Constructor Parameters**:
```csharp
public PreMigrationCheckService(
    ILogger<PreMigrationCheckService> logger,
    ILogicEngineService logicEngineService,
    string? profilePath = null)
```

### Eligibility Rule Customization

Modify eligibility rules in `PreMigrationCheckService.cs`:

**Custom Mailbox Size Limit**:
```csharp
// Change from 100GB to 50GB
if (mailbox.SizeMB > 50000) // 50GB limit
{
    item.Issues.Add($"Mailbox size ({mailbox.SizeMB:N0} MB) exceeds 50GB limit");
}
```

**Additional User Validation**:
```csharp
// Add custom validation rule
if (string.IsNullOrEmpty(user.Department))
{
    item.Issues.Add("Department field is required for migration");
}
```

## Troubleshooting

### Common Issues

#### 1. "No data available" Message

**Symptoms**: Empty eligibility report after running checks
**Causes**:
- Discovery data not loaded in LogicEngineService
- CSV files missing or empty
- Incorrect profile path configuration

**Resolution**:
```powershell
# Verify CSV files exist
Get-ChildItem "C:\discoverydata\{ProfileName}\RawData\*.csv"

# Check file content
Get-Content "C:\discoverydata\{ProfileName}\RawData\users.csv" | Select-Object -First 5
```

#### 2. Fuzzy Matching Not Working

**Symptoms**: No fuzzy matches found when exact matches fail
**Causes**:
- Similarity threshold too high
- Target user data not available
- Algorithm configuration issues

**Resolution**:
1. **Lower similarity thresholds** in service configuration
2. **Verify target environment data** availability
3. **Check algorithm implementation** for edge cases

#### 3. Manual Mappings Not Persisting

**Symptoms**: Manual mappings disappear after application restart
**Causes**:
- Insufficient file system permissions
- Invalid JSON serialization
- Incorrect file path configuration

**Resolution**:
```csharp
// Verify file permissions
var mappingsPath = Path.Combine(profilePath, "Mappings");
Directory.CreateDirectory(mappingsPath); // Ensure directory exists

// Test JSON serialization
var testMapping = new ObjectMapping { /* test data */ };
var json = JsonSerializer.Serialize(testMapping);
```

#### 4. Performance Issues with Large Datasets

**Symptoms**: Slow eligibility checks or UI freezing
**Causes**:
- Synchronous operations on UI thread
- Large dataset processing without chunking
- Memory pressure from large object collections

**Resolution**:
1. **Ensure async/await patterns** in service methods
2. **Implement progress reporting** for long operations
3. **Use ConfigureAwait(false)** for service operations
4. **Consider pagination** for very large datasets

### Logging and Diagnostics

**Enable Detailed Logging**:
```csharp
_logger.LogInformation("Starting pre-migration eligibility checks");
_logger.LogDebug("Processing {Count} users for eligibility", users.Count);
_logger.LogWarning("User {UPN} has {IssueCount} eligibility issues", user.UPN, issues.Count);
```

**Log Locations**:
- Application logs: Check system event log and application console
- Service logs: `ILogger<PreMigrationCheckService>` outputs
- Performance metrics: Monitor memory usage and execution time

### Error Recovery

**Service Recovery**:
```csharp
try
{
    var report = await _preMigrationCheckService.GetEligibilityReportAsync();
}
catch (Exception ex)
{
    _logger.LogError(ex, "Pre-migration check failed");
    // Display user-friendly error message
    // Offer retry option
    // Provide fallback functionality
}
```

## API Reference

### PreMigrationCheckService

#### Methods

**GetEligibilityReportAsync()**
```csharp
Task<EligibilityReport> GetEligibilityReportAsync()
```
Performs comprehensive eligibility checks for all object types.

**Returns**: `EligibilityReport` containing categorized eligibility results

**SaveManualmappingsAsync(List\<ObjectMapping> mappings)**
```csharp
Task SaveManualmappingsAsync(List<ObjectMapping> mappings)
```
Persists manual object mappings to configuration file.

**Parameters**: 
- `mappings` - List of ObjectMapping instances to save

#### Properties

**MappingsPath**
```csharp
string MappingsPath { get; }
```
File system path for manual mapping storage.

### Data Models

#### EligibilityReport
```csharp
public class EligibilityReport
{
    public DateTime GeneratedAt { get; set; }
    public List<EligibilityItem> Users { get; set; }
    public List<EligibilityItem> Mailboxes { get; set; }
    public List<EligibilityItem> Files { get; set; }
    public List<EligibilityItem> Databases { get; set; }
    
    // Computed properties
    public int TotalEligible { get; }
    public int TotalBlocked { get; }
    public int TotalUnmapped { get; }
}
```

#### EligibilityItem
```csharp
public class EligibilityItem
{
    public string Id { get; set; }
    public string Name { get; set; }
    public string Type { get; set; }
    public bool IsEligible { get; set; }
    public List<string> Issues { get; set; }
    public object SourceObject { get; set; }
    public ObjectMapping? TargetMapping { get; set; }
    public string MappingStatus { get; set; }
    
    // Computed properties
    public string IssuesSummary { get; }
    public string EligibilityStatus { get; }
}
```

#### ObjectMapping
```csharp
public class ObjectMapping
{
    public string SourceId { get; set; }
    public string TargetId { get; set; }
    public string TargetName { get; set; }
    public string MappingType { get; set; } // "Exact Match", "Fuzzy Match", "Manual"
    public double Confidence { get; set; }
    public DateTime CreatedAt { get; set; }
    public string CreatedBy { get; set; }
    public string? Notes { get; set; }
}
```

### ViewModel Commands

#### PreMigrationCheckViewModel Commands

- **RunChecksCommand** - Execute eligibility validation
- **RefreshCommand** - Re-run eligibility checks
- **SaveMappingsCommand** - Persist manual mappings
- **ExportReportCommand** - Export results to file
- **ClearFiltersCommand** - Reset all filter controls
- **ShowMappingPanelCommand** - Toggle mapping panel visibility
- **CreateMappingCommand** - Create new manual mapping
- **RemoveMappingCommand** - Remove manual mapping
- **ApplyMappingCommand** - Apply manual mapping to object

## Best Practices

### Migration Planning

1. **Run Pre-Migration Checks Early** - Execute checks well before planned migration window
2. **Address Blocking Issues** - Resolve eligibility issues before migration execution
3. **Validate Mappings** - Verify target environment objects exist and are accessible
4. **Document Decisions** - Use mapping notes to record business decisions
5. **Test with Subset** - Validate process with small batch before full migration

### Performance Optimization

1. **Filter Data Sources** - Load only objects planned for migration
2. **Use Incremental Checks** - Re-run only changed objects when possible
3. **Batch Operations** - Process objects in manageable batches
4. **Monitor Resources** - Watch memory and CPU usage during large checks
5. **Schedule Appropriately** - Run intensive checks during off-peak hours

### Security Considerations

1. **Protect Mapping Data** - Secure manual mapping files with appropriate permissions
2. **Audit Trail** - Maintain logs of eligibility decisions and mapping changes
3. **Access Control** - Limit pre-migration check access to authorized personnel
4. **Data Classification** - Handle sensitive object data according to security policies
5. **Environment Isolation** - Keep source and target environment access segregated

---

## Appendix

### Supported Object Types

| Type | Discovery Source | Key Identifier | Validation Rules |
|------|------------------|----------------|------------------|
| User | `users.csv` | SID, UPN | Account status, UPN format, character validation |
| Mailbox | `mailboxes.csv` | UPN, SMTP | Size limits, type validation, accessibility |
| FileShare | `fileshares.csv` | Path | Path length, character validation, accessibility |
| Database | `sqldatabases.csv` | Server\Instance\Database | Name validation, connectivity (future) |

### Future Enhancements

**Planned Features**:
- Advanced target environment validation
- Batch processing for large environments
- Integration with migration scheduling
- Automated remediation suggestions
- Enhanced reporting with charts and analytics
- API integration with external validation systems

**Version History**:
- v1.0.0 - Initial implementation with core eligibility rules and fuzzy matching
- v1.1.0 - Enhanced UI with filtering and manual mapping capabilities (planned)
- v1.2.0 - Target environment integration and validation (planned)

---

*This documentation is maintained as part of the M&A Discovery Suite documentation set. For technical support or enhancement requests, refer to the development team.*

*Last Updated: August 28, 2025*
*Version: 1.0.0*