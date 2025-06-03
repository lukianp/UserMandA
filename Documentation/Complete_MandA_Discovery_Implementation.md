# Complete M&A Discovery Suite v4.0 Implementation Documentation

## Table of Contents
1. [Executive Summary](#executive-summary)
2. [Architecture Overview](#architecture-overview)
3. [Core Components](#core-components)
4. [Module Reference](#module-reference)
5. [Data Flow](#data-flow)
6. [Implementation Details](#implementation-details)
7. [Security Architecture](#security-architecture)
8. [Performance Considerations](#performance-considerations)
9. [Deployment Guide](#deployment-guide)
10. [Maintenance & Operations](#maintenance--operations)

## Executive Summary

The M&A Discovery Suite v4.0 represents a complete architectural transformation from a monolithic 3-script system (6,289 lines) to a modular, enterprise-ready solution with 27+ specialized modules. This implementation provides comprehensive discovery, analysis, and migration planning capabilities for M&A scenarios.

### Key Achievements
- **Modular Architecture**: 27+ specialized modules vs 3 monolithic scripts
- **Location Independence**: Run from any directory with automatic path resolution
- **Enhanced Error Handling**: Retry logic, graceful degradation, and comprehensive logging
- **Visual Feedback**: Emoji-enhanced logging for better user experience
- **Robust Connectivity**: Multiple authentication methods with automatic fallbacks
- **Data Quality**: Built-in validation and quality scoring
- **PowerApps Ready**: Optimized JSON exports for Power Platform integration

## Architecture Overview

### System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                     M&A Discovery Suite v4.0                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────┐    ┌──────────────────┐    ┌──────────────┐ │
│  │   Scripts   │───▶│  Core/Orchestrator │───▶│   Modules    │ │
│  │ QuickStart  │    │ MandA-Orchestrator │    │ 27+ Modules  │ │
│  │ Validation  │    │   Configuration    │    │              │ │
│  └─────────────┘    └──────────────────┘    └──────────────┘ │
│         │                    │                        │        │
│         ▼                    ▼                        ▼        │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │                    Module Categories                     │  │
│  ├─────────────┬──────────────┬─────────────┬────────────┤  │
│  │Authentication│ Connectivity │  Discovery  │ Processing │  │
│  ├─────────────┼──────────────┼─────────────┼────────────┤  │
│  │   Export    │  Utilities   │   Config    │   Logs     │  │
│  └─────────────┴──────────────┴─────────────┴────────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Module Dependency Graph

```
MandA-Orchestrator.ps1
    ├── Utilities/Logging.psm1
    ├── Utilities/ErrorHandling.psm1
    ├── Utilities/ValidationHelpers.psm1
    ├── Authentication/Authentication.psm1
    │   └── Authentication/CredentialManagement.psm1
    ├── Connectivity/ConnectionManager.psm1
    │   ├── Connectivity/GraphConnection.psm1
    │   ├── Connectivity/AzureConnection.psm1
    │   └── Connectivity/ExchangeConnection.psm1
    ├── Discovery/*
    │   ├── ActiveDirectoryDiscovery.psm1
    │   ├── GraphDiscovery.psm1
    │   ├── GPODiscovery.psm1
    │   └── [Other Discovery Modules]
    ├── Processing/*
    │   ├── DataAggregation.psm1
    │   ├── UserProfileBuilder.psm1
    │   ├── WaveGeneration.psm1
    │   └── DataValidation.psm1
    └── Export/*
        ├── CSVExport.psm1
        ├── JSONExport.psm1
        └── ExcelExport.psm1
```

## Core Components

### 1. MandA-Orchestrator.ps1 (Main Engine)

**Purpose**: Central execution engine that coordinates all discovery, processing, and export operations.

**Key Features**:
- Location-independent path resolution using `$script:SuiteRoot`
- Dynamic module loading based on configuration
- Phase-based execution (Discovery → Processing → Export)
- Comprehensive error handling and recovery
- Progress tracking and metrics collection

**Parameters**:
```powershell
[CmdletBinding()]
param(
    [string]$ConfigurationFile = ".\Configuration\default-config.json",
    [ValidateSet("Discovery", "Processing", "Export", "Full")]
    [string]$Mode = "Full",
    [string]$OutputPath,
    [switch]$Force,
    [switch]$ValidateOnly
)
```

**Execution Flow**:
1. **Initialization**
   - Load configuration
   - Initialize logging
   - Validate prerequisites
   - Create output directories

2. **Authentication**
   - Load stored credentials or prompt
   - Validate credentials
   - Initialize authentication context

3. **Connection**
   - Establish service connections
   - Handle connection failures gracefully
   - Report connection status

4. **Mode Execution**
   - Discovery: Collect data from all sources
   - Processing: Analyze and correlate data
   - Export: Generate reports and exports
   - Full: Execute all phases

5. **Completion**
   - Generate metrics
   - Clean up temporary files
   - Disconnect services

### 2. Configuration System

**default-config.json Structure**:
```json
{
  "metadata": {
    "version": "4.0.0",
    "created": "2025-01-26",
    "description": "M&A Discovery Suite Configuration",
    "companyName": "Your Company Name"
  },
  "environment": {
    "domainController": "ad.company.com",
    "outputPath": "C:\\MandADiscovery\\Output",
    "tempPath": "%TEMP%\\MandADiscovery",
    "logLevel": "INFO",
    "maxRetries": 3,
    "timeoutSeconds": 300
  },
  "authentication": {
    "credentialStorePath": "C:\\MandADiscovery\\Output\\credentials.config",
    "certificateThumbprint": null,
    "useInteractiveAuth": false,
    "tokenRefreshThreshold": 300
  },
  "discovery": {
    "parallelThreads": 5,
    "batchSize": 100,
    "enabledSources": ["ActiveDirectory", "Exchange", "Graph", "Azure", "Intune"],
    "skipExistingFiles": true,
    "compressionEnabled": true
  },
  "processing": {
    "chunkSize": 100,
    "includeDisabledUsers": false,
    "generateWavesByDepartment": true,
    "maxWaveSize": 50,
    "complexityThresholds": {
      "low": 3,
      "medium": 7,
      "high": 10
    }
  },
  "export": {
    "formats": ["CSV", "Excel", "JSON"],
    "excelEnabled": true,
    "powerAppsOptimized": true,
    "includeMetadata": true,
    "archiveResults": true
  },
  "performance": {
    "memoryThresholdMB": 4096,
    "diskSpaceThresholdGB": 5,
    "progressUpdateInterval": 10,
    "enableGarbageCollection": true
  }
}
```

## Module Reference

### Authentication Modules

#### Authentication.psm1
**Functions**:
- `Initialize-MandAAuthentication`: Main authentication orchestration
- `Test-AuthenticationStatus`: Verify token validity
- `Update-AuthenticationTokens`: Refresh expired tokens
- `Get-AuthenticationContext`: Retrieve current auth context
- `Clear-AuthenticationContext`: Clean up authentication

**Key Features**:
- Token lifecycle management
- Automatic refresh before expiry
- Context persistence across operations

#### CredentialManagement.psm1
**Functions**:
- `Get-SecureCredentials`: Retrieve stored or prompt for credentials
- `Read-EncryptedCredentials`: Load from encrypted storage
- `Get-InteractiveCredentials`: Interactive credential prompt
- `Set-SecureCredentials`: Save credentials securely
- `Test-CredentialValidity`: Validate against Graph API
- `Remove-StoredCredentials`: Clean up stored credentials

**Security Features**:
- DPAPI encryption for local storage
- Certificate-based encryption support
- Credential expiry tracking
- Secure string handling

### Connectivity Modules

#### ConnectionManager.psm1
**Functions**:
- `Initialize-AllConnections`: Establish all service connections
- `Connect-MandAGraph`: Microsoft Graph connection
- `Connect-MandAAzure`: Azure Resource Manager connection
- `Connect-MandAExchange`: Exchange Online connection
- `Test-ServiceConnectivity`: Network connectivity testing
- `Get-ConnectionStatus`: Current connection state
- `Disconnect-AllServices`: Clean disconnect

**Connection States**:
```powershell
$script:ConnectionStatus = @{
    Graph = @{ 
        Connected = $false
        LastError = $null
        ConnectedTime = $null
        Context = $null 
    }
    Azure = @{ ... }
    ExchangeOnline = @{ ... }
}
```

#### EnhancedConnectionManager.psm1
**Enhanced Features**:
- Multiple authentication method fallbacks
- Visual connection status with emojis
- Proxy detection and bypass
- WinRM configuration handling
- Detailed connectivity diagnostics

**Authentication Methods**:
1. Service Principal (Primary)
2. Certificate-based
3. Managed Identity
4. Interactive login
5. Manual remote PowerShell

### Discovery Modules

#### ActiveDirectoryDiscovery.psm1
**Functions**:
- `Invoke-ActiveDirectoryDiscovery`: Main AD discovery orchestration
- `Get-ADUsersData`: Collect user information
- `Get-SecurityGroupsData`: Collect security groups
- `Get-SecurityGroupMembersData`: Group membership mapping
- `Get-ADComputersData`: Computer accounts
- `Get-ADOrganizationalUnits`: OU structure

**Collected Data**:
- User attributes (22 properties)
- Group information with member counts
- Computer details including OS and last logon
- OU hierarchy with user/computer counts

#### GraphDiscovery.psm1
**Functions**:
- `Invoke-GraphDiscovery`: Main Graph discovery orchestration
- `Test-GraphConnection`: Verify Graph connectivity
- `Get-GraphUsersData`: Azure AD users
- `Get-GraphGroupsData`: Azure AD groups
- `Get-GraphApplicationsData`: Enterprise applications
- `Get-GraphDevicesData`: Registered devices
- `Get-GraphLicensesData`: License inventory
- `Get-OneDriveUsageData`: OneDrive storage usage
- `Get-ApplicationProxiesData`: App proxy configurations

**Special Features**:
- Batch processing for large datasets
- Progress tracking for long operations
- Error recovery for partial failures

#### GPODiscovery.psm1 & EnhancedGPODiscovery.psm1
**Functions**:
- `Get-GPOData`: Main GPO analysis
- `ConvertFrom-GPOXMLReport`: XML parsing
- `Find-DriveMappings`: Extract drive mappings
- `Find-PrinterMappings`: Extract printer configurations
- `Find-FolderRedirections`: Folder redirection policies
- `Find-LogonScripts`: Startup/logon scripts

**Enhanced Features**:
- Robust XML namespace handling
- Automatic XML repair for malformed files
- Multiple XPath strategies
- Visual progress indicators
- Comprehensive error recovery

### Processing Modules

#### DataAggregation.psm1
**Functions**:
- `Start-DataAggregation`: Main aggregation orchestration
- `Get-AvailableDataSources`: Discover available CSV files
- `Merge-UserData`: Correlate user data across sources
- `Merge-GroupData`: Correlate group information
- `Merge-DeviceData`: Correlate device information
- `New-CorrelationMappings`: Identify orphaned/duplicate accounts

**Correlation Logic**:
- Primary key: UserPrincipalName (case-insensitive)
- Fallback: SamAccountName
- Conflict resolution: Most recent data wins

#### UserProfileBuilder.psm1
**Functions**:
- `New-UserProfiles`: Build comprehensive profiles
- `New-IndividualUserProfile`: Single user analysis
- `Test-UserComplexity`: Calculate complexity score
- `Test-MigrationReadiness`: Assess readiness
- `Measure-ComplexityScores`: Statistical analysis
- `Convert-MailboxSizeToMB`: Parse Exchange sizes

**Complexity Factors**:
- Account status (enabled/disabled)
- Service presence (AD/Azure/Exchange)
- Licensing complexity
- Mailbox size
- Account age
- Activity status
- Missing information

**Profile Structure**:
```powershell
[PSCustomObject]@{
    # Identity
    UserPrincipalName = ""
    SamAccountName = ""
    DisplayName = ""
    GraphId = ""
    
    # Status
    Enabled = $true
    LastLogon = ""
    
    # Migration Analysis
    ComplexityScore = 0
    MigrationCategory = "Standard"
    ReadinessStatus = "Ready"
    EstimatedMigrationTime = 0
    
    # Issues
    ComplexityFactors = @()
    RiskFactors = @()
    BlockingIssues = @()
}
```

#### WaveGeneration.psm1
**Functions**:
- `New-MigrationWaves`: Generate migration waves
- `New-WavesByDepartment`: Department-based grouping
- `New-WavesByComplexity`: Complexity-based grouping
- `Split-UsersIntoWaves`: Wave size management
- `New-MigrationWave`: Create wave object
- `Optimize-MigrationWaves`: Balance and merge waves

**Wave Strategies**:
1. **Department-Based**
   - Maintains team cohesion
   - Respects organizational structure
   - Automatic splitting for large departments

2. **Complexity-Based**
   - Groups by difficulty level
   - Balances workload
   - Priority-based ordering

**Wave Object**:
```powershell
@{
    Name = "Finance - Wave 1"
    Users = @()
    TotalUsers = 45
    EstimatedTimeHours = 67.5
    AverageComplexityScore = 4.2
    AverageReadinessScore = 85.3
    RiskLevel = "Medium"
    Statistics = @{...}
    Departments = "Finance (45)"
}
```

#### DataValidation.psm1
**Functions**:
- `Test-DataQuality`: Comprehensive validation
- `New-QualityReport`: Generate quality report
- `Get-IssueSeverity`: Categorize issues
- `Get-IssueRecommendation`: Provide fixes
- `Export-IssueDetails`: Detailed issue export

**Validation Checks**:
- Required field presence
- Email format validation
- UPN format validation
- Data consistency checks
- Logical validation (e.g., disabled users can't be "ready")
- Score range validation

### Export Modules

#### CSVExport.psm1
**Functions**:
- `Export-ToCSV`: Main CSV export
- `Format-MigrationWavesForCSV`: Wave data formatting
- `Format-ValidationResultsForCSV`: Validation formatting
- `New-SummaryStatistics`: Generate statistics
- `Export-DetailedUserReport`: Comprehensive user export

**Export Files**:
- UserProfiles.csv
- MigrationWaves.csv
- ComplexityAnalysis.csv
- DataQualityReport.csv
- SummaryStatistics.csv
- DetailedUserReport.csv

#### JSONExport.psm1
**Functions**:
- `Export-ToJSON`: Standard JSON export
- `Export-ForPowerApps`: PowerApps-optimized export
- `New-ComprehensiveSummary`: Complete analysis summary
- `New-MigrationRecommendations`: AI-like recommendations

**PowerApps Export Structure**:
```json
{
  "metadata": {
    "exportDate": "2025-01-26T10:30:00Z",
    "version": "4.0.0",
    "totalUsers": 1250,
    "totalWaves": 15,
    "companyName": "Contoso Corp"
  },
  "users": [...],
  "waves": [...],
  "statistics": {...}
}
```

### Utility Modules

#### Logging.psm1 & EnhancedLogging.psm1
**Functions**:
- `Initialize-Logging`: Set up logging
- `Write-MandALog`: Main logging function
- `Write-ProgressBar`: Visual progress
- `Write-StatusTable`: Formatted tables
- `Write-SectionHeader`: Section dividers
- `Write-CompletionSummary`: Final summary

**Log Levels**:
- DEBUG: Detailed debugging information
- INFO: General information
- WARN: Warning conditions
- ERROR: Error conditions
- SUCCESS: Successful operations
- HEADER: Section headers
- PROGRESS: Progress updates
- IMPORTANT: Critical information

**Enhanced Features**:
- Emoji indicators for visual feedback
- Colored console output
- Automatic log rotation
- Structured log format

#### ErrorHandling.psm1
**Functions**:
- `Invoke-WithRetry`: Retry logic wrapper
- `Test-CriticalError`: Identify unrecoverable errors
- `Get-FriendlyErrorMessage`: User-friendly errors
- `Write-ErrorSummary`: Error analysis
- `Test-Prerequisites`: System validation
- `Initialize-OutputDirectories`: Directory setup

**Retry Configuration**:
```powershell
Invoke-WithRetry -ScriptBlock {
    # Operation that might fail
} -MaxRetries 3 -DelaySeconds 5 -OperationName "Graph Query"
```

#### ValidationHelpers.psm1
**Functions**:
- `Test-GuidFormat`: GUID validation
- `Test-EmailFormat`: Email validation
- `Test-UPNFormat`: UPN validation
- `Test-ConfigurationFile`: Config validation
- `Test-DirectoryWriteAccess`: Permission testing
- `Test-ModuleAvailability`: Module checking
- `Test-NetworkConnectivity`: Network testing
- `Test-DataQuality`: Data validation
- `Export-ValidationReport`: Report generation

#### ProgressTracking.psm1
**Functions**:
- `Initialize-ProgressTracker`: Start tracking
- `Update-Progress`: Update status
- `Complete-Progress`: Finish tracking
- `Start-OperationTimer`: Time operations
- `Stop-OperationTimer`: End timing
- `Get-ProgressMetrics`: Retrieve metrics
- `Export-ProgressMetrics`: Save metrics
- `Show-ProgressSummary`: Display summary

**Progress State**:
```powershell
$script:ProgressState = @{
    CurrentPhase = "Discovery"
    TotalSteps = 10
    CurrentStep = 3
    StartTime = [DateTime]
    Operations = @{}
    Metrics = @{}
}
```

#### FileOperations.psm1
**Functions**:
- `Export-DataToCSV`: CSV writing
- `Import-DataFromCSV`: CSV reading
- `Backup-File`: File backup
- `Compress-Directory`: Archive creation
- `Get-DirectorySize`: Size calculation
- `Format-FileSize`: Human-readable sizes
- `Test-FileInUse`: Lock detection
- `Wait-ForFileRelease`: Lock waiting
- `Clear-OldFiles`: Cleanup
- `Protect-DeleteFile`: Secure deletion

## Data Flow

### Discovery Phase Flow
```
1. Initialize Environment
   └── Load Configuration
       └── Setup Logging
           └── Create Directories

2. Authenticate
   └── Load/Prompt Credentials
       └── Validate
           └── Store Context

3. Connect Services
   └── Graph → Azure → Exchange
       └── Test Connectivity
           └── Report Status

4. Execute Discovery
   └── For Each Enabled Source:
       ├── AD Discovery → ADUsers.csv, Groups.csv, etc.
       ├── Graph Discovery → GraphUsers.csv, Devices.csv, etc.
       ├── GPO Discovery → GPOData.csv, DriveMappings.csv, etc.
       └── [Other Sources]

5. Store Raw Data
   └── Output/Raw/{ServiceName}_{DataType}.csv
```

### Processing Phase Flow
```
1. Load Raw Data
   └── Detect Available Sources
       └── Import CSV Files

2. Data Aggregation
   └── Merge User Data (AD + Graph + Exchange)
       └── Merge Group Data
           └── Merge Device Data
               └── Create Correlations

3. Profile Building
   └── For Each User:
       ├── Build Base Profile
       ├── Calculate Complexity
       ├── Assess Readiness
       └── Estimate Time

4. Wave Generation
   └── Choose Strategy (Dept/Complexity)
       └── Group Users
           └── Optimize Distribution
               └── Validate Waves

5. Quality Validation
   └── Check Data Completeness
       └── Identify Issues
           └── Generate Report
```

### Export Phase Flow
```
1. Prepare Data
   └── Load Processed Data
       └── Apply Formatting

2. Generate Exports
   ├── CSV Export
   │   ├── UserProfiles.csv
   │   ├── MigrationWaves.csv
   │   └── Statistics.csv
   ├── JSON Export
   │   ├── Standard JSON
   │   └── PowerApps JSON
   └── Excel Export (if enabled)

3. Create Summary
   └── Generate Metrics
       └── Create Recommendations
           └── Export Report

4. Archive Results
   └── Compress if Enabled
       └── Clean Temp Files
```

## Security Architecture

### Authentication Security
1. **Credential Storage**
   - DPAPI encryption for local storage
   - Certificate-based encryption option
   - No plaintext storage
   - Automatic expiry checking

2. **Token Management**
   - Automatic refresh before expiry
   - Secure context storage
   - Session isolation

3. **Permission Model**
   - Least privilege principle
   - Read-only operations
   - Delegated permissions where possible

### Data Security
1. **In-Transit**
   - HTTPS for all API calls
   - TLS 1.2 minimum
   - Certificate validation

2. **At-Rest**
   - Encrypted credential storage
   - Optional file encryption
   - Secure deletion capability

3. **Access Control**
   - Service principal authentication
   - No user impersonation
   - Audit logging

## Performance Considerations

### Optimization Strategies

1. **Batch Processing**
   ```powershell
   # Configuration
   "discovery": {
     "batchSize": 100,        # API batch size
     "parallelThreads": 5     # Concurrent operations
   }
   ```

2. **Memory Management**
   - Streaming for large datasets
   - Garbage collection triggers
   - Memory threshold monitoring

3. **Caching**
   - Skip existing files option
   - Connection reuse
   - Compiled regex patterns

4. **Progress Tracking**
   - Configurable update intervals
   - Minimal UI overhead
   - Async logging

### Performance Metrics

| Operation | Small Env (<1K users) | Medium (1K-10K) | Large (10K+) |
|-----------|----------------------|-----------------|---------------|
| Discovery | 5-10 minutes | 30-60 minutes | 2-4 hours |
| Processing | 2-5 minutes | 10-20 minutes | 30-60 minutes |
| Export | 1-2 minutes | 5-10 minutes | 15-30 minutes |

### Bottlenecks & Solutions

1. **API Throttling**
   - Solution: Retry logic with exponential backoff
   - Configuration: Adjust batch sizes

2. **Memory Constraints**
   - Solution: Chunked processing
   - Configuration: Increase memory threshold

3. **Network Latency**
   - Solution: Parallel operations
   - Configuration: Increase thread count

## Deployment Guide

### Prerequisites Installation

```powershell
# 1. Verify PowerShell Version
$PSVersionTable.PSVersion

# 2. Install Required Modules
@(
    "Microsoft.Graph",
    "Microsoft.Graph.Authentication",
    "ExchangeOnlineManagement"
) | ForEach-Object {
    Install-Module -Name $_ -Force -Scope CurrentUser
}

# 3. Optional Modules
@(
    "ActiveDirectory",
    "ImportExcel",
    "Az.Accounts"
) | ForEach-Object {
    Install-Module -Name $_ -Force -Scope CurrentUser -ErrorAction SilentlyContinue
}
```

### Deployment Steps

1. **Extract Suite**
   ```powershell
   # Extract to desired location
   Expand-Archive -Path "MandADiscoverySuite_v4.zip" -DestinationPath "C:\MandADiscovery"
   ```

2. **Validate Installation**
   ```powershell
   cd "C:\MandADiscovery"
   .\Scripts\Validate-Installation.ps1
   ```

3. **Configure Settings**
   ```powershell
   # Copy and customize configuration
   Copy-Item ".\Configuration\default-config.json" ".\Configuration\production-config.json"
   # Edit production-config.json as needed
   ```

4. **Test Location Independence**
   ```powershell
   .\Scripts\Test-LocationIndependence.ps1
   ```

5. **Create Service Principal**
   ```powershell
   # Run app registration script or manually create
   # Document ClientId, TenantId, and ClientSecret
   ```

6. **Grant Permissions**
   - Microsoft Graph: User.Read.All, Group.Read.All, etc.
   - Exchange: Exchange.ManageAsApp
   - Azure: Reader role (if using Azure discovery)

7. **Initial Test**
   ```powershell
   .\Scripts\QuickStart.ps1 -Operation Validate
   ```

### Production Deployment

1. **Schedule Execution**
   ```powershell
   # Create scheduled task
   $action = New-ScheduledTaskAction -Execute "PowerShell.exe" -Argument "-File C:\MandADiscovery\Scripts\QuickStart.ps1 -Operation Full"
   $trigger = New-ScheduledTaskTrigger -Daily -At 2:00AM
   Register-ScheduledTask -TaskName "MandA Discovery" -Action $action -Trigger $trigger
   ```

2. **Configure Monitoring**
   - Set up log monitoring
   - Configure alerts for failures
   - Create success notifications

3. **Backup Configuration**
   ```powershell
   # Backup configuration and credentials
   Copy-Item ".\Configuration" "\\BackupServer\MandA\Config" -Recurse
   ```

## Maintenance & Operations

### Daily Operations

1. **Log Review**
   ```powershell
   # Check latest logs
   Get-ChildItem ".\Output\Logs" | Sort-Object LastWriteTime -Descending | Select -First 5
   ```

2. **Data Validation**
   ```powershell
   # Verify data quality
   Import-Csv ".\Output\Processed\DataQualityReport.csv" | Out-GridView
   ```

### Weekly Maintenance

1. **Cleanup Old Files**
   ```powershell
   # Remove files older than 30 days
   Get-ChildItem ".\Output\Logs" -Filter "*.log" | 
       Where-Object { $_.LastWriteTime -lt (Get-Date).AddDays(-30) } | 
       Remove-Item
   ```

2. **Update Modules**
   ```powershell
   @("Microsoft.Graph", "ExchangeOnlineManagement") | ForEach-Object {
       Update-Module -Name $_ -Force
   }
   ```

### Monthly Tasks

1. **Credential Rotation**
   - Generate new client secret
   - Update configuration
   - Test authentication

2. **Performance Review**
   - Analyze execution times
   - Adjust batch sizes if needed
   - Review error patterns

3. **Capacity Planning**
   - Monitor output directory size
   - Plan for data growth
   - Archive old results

### Troubleshooting Guide

#### Common Issues

1. **Authentication Failures**
   ```powershell
   # Clear credentials and re-authenticate
   Remove-Item ".\Output\credentials.config" -Force
   .\Scripts\QuickStart.ps1 -Operation Validate
   ```

2. **Module Loading Errors**
   ```powershell
   # Verify module paths
   Get-Module -ListAvailable | Where-Object Name -like "*Graph*"
   
   # Force reload modules
   Remove-Module * -Force
   .\Scripts\QuickStart.ps1 -Operation Discovery
   ```

3. **Connection Issues**
   ```powershell
   # Test connectivity
   Test-NetConnection -ComputerName "graph.microsoft.com" -Port 443
   Test-NetConnection -ComputerName "outlook.office365.com" -Port 443
   
   # Check proxy settings
   netsh winhttp show proxy
   ```

4. **Performance Issues**
   ```powershell
   # Adjust configuration
   $config = Get-Content ".\Configuration\production-config.json" | ConvertFrom-Json
   $config.discovery.batchSize = 50  # Reduce batch size
   $config.discovery.parallelThreads = 3  # Reduce threads
   $config | ConvertTo-Json -Depth 10 | Set-Content ".\Configuration\production-config.json"
   ```

### Error Recovery

1. **Partial Discovery Failure**
   ```powershell
   # Resume discovery with skipExistingFiles
   .\Scripts\QuickStart.ps1 -Operation Discovery
   # Config already has skipExistingFiles = true
   ```

2. **Processing Failure**
   ```powershell
   # Validate raw data
   $rawFiles = Get-ChildItem ".\Output\Raw" -Filter "*.csv"
   foreach ($file in $rawFiles) {
       $data = Import-Csv $file.FullName
       Write-Host "$($file.Name): $($data.Count) records"
   }
   
   # Re-run processing
   .\Scripts\QuickStart.ps1 -Operation Processing
   ```

3. **Export Failure**
   ```powershell
   # Check processed data
   Test-Path ".\Output\Processed\UserProfiles.csv"
   
   # Re-run export only
   .\Scripts\QuickStart.ps1 -Operation Export
   ```

## Conclusion

The M&A Discovery Suite v4.0 represents a significant evolution in automated discovery and migration planning tools. With its modular architecture, robust error handling, and comprehensive feature set, it provides a reliable foundation for managing complex M&A transitions.

### Key Success Factors
- **Modular Design**: Easy to maintain and extend
- **Error Recovery**: Graceful handling of failures
- **Visual Feedback**: Clear progress and status
- **Data Quality**: Built-in validation and scoring
- **Flexibility**: Configuration-driven behavior

### Future Enhancements
- Azure resource discovery implementation
- Intune device discovery completion
- Machine learning for complexity prediction
- Real-time dashboard integration
- Multi-tenant support

---

**Last Updated**: January 2025  
**Version**: 4.0.0  
**Total Modules**: 27+  
**Lines of Code**: ~8,000 (organized and maintainable)