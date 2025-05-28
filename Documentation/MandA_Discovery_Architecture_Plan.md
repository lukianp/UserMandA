# M&A Discovery Suite - Complete Architectural Redesign Plan

## Executive Summary

This document outlines the complete architectural redesign of the M&A Discovery Suite, merging the current three-script approach (6,289 lines) into a modular, maintainable architecture with a single orchestrator and specialized function modules.

## Current State Analysis

### Script Breakdown
- **Script 1**: `InfrastructureCreateAppReg.ps1` (1,609 lines) - Authentication & App Registration
- **Script 2**: `InfrastructureDiscoveryInput.ps1` (3,833 lines) - Data Collection
- **Script 3**: `InfrastructureDiscoveryoutput.ps1` (2,448 lines) - Data Processing & Export

### Issues with Current Architecture
1. **Monolithic Design**: Large scripts difficult to maintain and debug
2. **Code Duplication**: Similar functions across scripts
3. **Limited Reusability**: Functions embedded in scripts
4. **Testing Challenges**: Hard to unit test individual components
5. **Deployment Complexity**: Multiple scripts to manage

## Proposed Architecture

### 🏗️ New Modular Structure

```
MandADiscoverySuite/
├── 📁 Core/
│   ├── MandA-Orchestrator.ps1                    (~300 lines)
│   ├── MandA-Configuration.ps1                   (~200 lines)
│   └── MandA-Bootstrap.ps1                       (~150 lines)
├── 📁 Modules/
│   ├── 📁 Authentication/
│   │   ├── Authentication.psm1                   (~400 lines)
│   │   ├── CredentialManagement.psm1             (~300 lines)
│   │   └── AppRegistration.psm1                  (~350 lines)
│   ├── 📁 Connectivity/
│   │   ├── GraphConnection.psm1                  (~250 lines)
│   │   ├── AzureConnection.psm1                  (~200 lines)
│   │   ├── ExchangeConnection.psm1               (~300 lines)
│   │   └── ConnectionManager.psm1                (~200 lines)
│   ├── 📁 Discovery/
│   │   ├── ActiveDirectoryDiscovery.psm1         (~600 lines)
│   │   ├── ExchangeDiscovery.psm1                (~800 lines)
│   │   ├── GraphDiscovery.psm1                   (~700 lines)
│   │   ├── AzureDiscovery.psm1                   (~400 lines)
│   │   ├── GPODiscovery.psm1                     (~500 lines)
│   │   └── IntuneDiscovery.psm1                  (~300 lines)
│   ├── 📁 Processing/
│   │   ├── DataAggregation.psm1                  (~600 lines)
│   │   ├── ProfileBuilder.psm1                   (~500 lines)
│   │   ├── ComplexityCalculator.psm1             (~300 lines)
│   │   ├── WaveGenerator.psm1                    (~400 lines)
│   │   └── DataValidation.psm1                   (~250 lines)
│   ├── 📁 Export/
│   │   ├── CSVExporter.psm1                      (~200 lines)
│   │   ├── ExcelExporter.psm1                    (~300 lines)
│   │   ├── JSONExporter.psm1                     (~150 lines)
│   │   └── PowerAppsExporter.psm1                (~250 lines)
│   └── 📁 Utilities/
│       ├── Logging.psm1                          (~300 lines)
│       ├── ErrorHandling.psm1                    (~200 lines)
│       ├── ProgressTracking.psm1                 (~150 lines)
│       ├── FileOperations.psm1                   (~200 lines)
│       └── ValidationHelpers.psm1                (~150 lines)
├── 📁 Configuration/
│   ├── default-config.json                       (~50 lines)
│   ├── environment-templates/
│   │   ├── development.json
│   │   ├── staging.json
│   │   └── production.json
│   └── schema/
│       └── config-schema.json
├── 📁 Templates/
│   ├── csv-headers/
│   ├── excel-templates/
│   └── report-templates/
├── 📁 Tests/
│   ├── Unit/
│   ├── Integration/
│   └── End-to-End/
└── 📁 Documentation/
    ├── API-Reference.md
    ├── Configuration-Guide.md
    ├── Deployment-Guide.md
    └── Troubleshooting-Guide.md
```

## Detailed Module Breakdown

### 🔐 Authentication Modules

#### `Authentication.psm1` (~400 lines)
**Purpose**: Core authentication orchestration
**Functions**:
- `Initialize-MandAAuthentication`
- `Test-AuthenticationStatus`
- `Refresh-AuthenticationTokens`
- `Get-AuthenticationContext`

#### `CredentialManagement.psm1` (~300 lines)
**Purpose**: Secure credential storage and retrieval
**Functions**:
- `Get-SecureCredentials`
- `Set-SecureCredentials`
- `Test-CredentialValidity`
- `Remove-StoredCredentials`

#### `AppRegistration.psm1` (~350 lines)
**Purpose**: Azure AD app registration automation
**Functions**:
- `New-MandAAppRegistration`
- `Update-AppRegistrationPermissions`
- `Test-AppRegistrationHealth`
- `Remove-MandAAppRegistration`

### 🔗 Connectivity Modules

#### `ConnectionManager.psm1` (~200 lines)
**Purpose**: Centralized connection orchestration
**Functions**:
- `Initialize-AllConnections`
- `Test-ServiceConnectivity`
- `Get-ConnectionStatus`
- `Disconnect-AllServices`

#### `GraphConnection.psm1` (~250 lines)
**Purpose**: Microsoft Graph connectivity
**Functions**:
- `Connect-MandAGraph`
- `Test-GraphConnection`
- `Get-GraphScopes`
- `Disconnect-MandAGraph`

#### `AzureConnection.psm1` (~200 lines)
**Purpose**: Azure Resource Manager connectivity
**Functions**:
- `Connect-MandAAzure`
- `Test-AzureConnection`
- `Get-AzureSubscriptions`
- `Disconnect-MandAAzure`

#### `ExchangeConnection.psm1` (~300 lines)
**Purpose**: Exchange Online connectivity with enhanced error handling
**Functions**:
- `Connect-MandAExchange`
- `Test-ExchangeConnection`
- `Resolve-ExchangeConnectivity`
- `Disconnect-MandAExchange`

### 🔍 Discovery Modules

#### `ActiveDirectoryDiscovery.psm1` (~600 lines)
**Purpose**: On-premises AD data collection
**Functions**:
- `Get-ADUsersData`
- `Get-SecurityGroupsData`
- `Get-SecurityGroupMembersData`
- `Get-ADComputersData`
- `Get-ADOrganizationalUnits`

#### `ExchangeDiscovery.psm1` (~800 lines)
**Purpose**: Exchange Online data collection
**Functions**:
- `Get-ExchangeMailboxes`
- `Get-DistributionLists`
- `Get-SharedMailboxes`
- `Get-MailboxPermissions`
- `Get-TransportRules`

#### `GraphDiscovery.psm1` (~700 lines)
**Purpose**: Microsoft Graph data collection
**Functions**:
- `Get-GraphUsers`
- `Get-GraphGroups`
- `Get-EnterpriseApplications`
- `Get-ConditionalAccessPolicies`
- `Get-UserLicenses`

#### `AzureDiscovery.psm1` (~400 lines)
**Purpose**: Azure infrastructure discovery
**Functions**:
- `Get-AzureResourceGroups`
- `Get-AzureVirtualNetworks`
- `Get-AzureKeyVaults`
- `Get-AzureExpressRoutes`

#### `GPODiscovery.psm1` (~500 lines)
**Purpose**: Group Policy analysis
**Functions**:
- `Get-GPOAnalysisData`
- `Get-DriveMappingsGPO`
- `Get-PrinterMappingsGPO`
- `Get-FolderRedirectionGPO`
- `Get-LogonScriptsData`

#### `IntuneDiscovery.psm1` (~300 lines)
**Purpose**: Intune device and policy discovery
**Functions**:
- `Get-IntuneDevices`
- `Get-IntuneConfigurationPolicies`
- `Get-IntuneCompliancePolicies`
- `Get-IntuneApplications`

### 🔄 Processing Modules

#### `DataAggregation.psm1` (~600 lines)
**Purpose**: Core data aggregation logic
**Functions**:
- `Start-DataAggregation`
- `Merge-UserProfiles`
- `Resolve-DataConflicts`
- `Validate-AggregatedData`

#### `ProfileBuilder.psm1` (~500 lines)
**Purpose**: User profile construction
**Functions**:
- `Build-UserProfile`
- `Add-MailboxInfo`
- `Add-GroupMemberships`
- `Add-DeviceInfo`
- `Add-ApplicationAssignments`

#### `ComplexityCalculator.psm1` (~300 lines)
**Purpose**: Migration complexity analysis
**Functions**:
- `Calculate-MigrationComplexity`
- `Analyze-UserComplexity`
- `Generate-ComplexityReport`
- `Get-ComplexityFactors`

#### `WaveGenerator.psm1` (~400 lines)
**Purpose**: Migration wave planning
**Functions**:
- `Generate-MigrationWaves`
- `Optimize-WaveDistribution`
- `Validate-WaveConfiguration`
- `Export-WaveSchedule`

#### `DataValidation.psm1` (~250 lines)
**Purpose**: Data quality assurance
**Functions**:
- `Test-DataQuality`
- `Validate-UserData`
- `Check-DataCompleteness`
- `Generate-QualityReport`

### 📤 Export Modules

#### `CSVExporter.psm1` (~200 lines)
**Purpose**: CSV file generation
**Functions**:
- `Export-ToCSV`
- `Create-CSVHeaders`
- `Validate-CSVData`
- `Compress-CSVFiles`

#### `ExcelExporter.psm1` (~300 lines)
**Purpose**: Excel file generation for PowerApps
**Functions**:
- `Export-ToExcel`
- `Create-ExcelWorkbook`
- `Format-ExcelData`
- `Add-ExcelCharts`

#### `JSONExporter.psm1` (~150 lines)
**Purpose**: JSON file generation
**Functions**:
- `Export-ToJSON`
- `Create-JSONChunks`
- `Validate-JSONStructure`
- `Compress-JSONFiles`

#### `PowerAppsExporter.psm1` (~250 lines)
**Purpose**: PowerApps-optimized export
**Functions**:
- `Export-ForPowerApps`
- `Create-PowerAppsSchema`
- `Optimize-PowerAppsData`
- `Generate-PowerAppsMetadata`

### 🛠️ Utility Modules

#### `Logging.psm1` (~300 lines)
**Purpose**: Centralized logging system
**Functions**:
- `Write-MandALog`
- `Initialize-Logging`
- `Set-LogLevel`
- `Export-LogSummary`

#### `ErrorHandling.psm1` (~200 lines)
**Purpose**: Standardized error handling
**Functions**:
- `Invoke-WithRetry`
- `Handle-ServiceError`
- `Write-ErrorReport`
- `Test-ErrorRecovery`

#### `ProgressTracking.psm1` (~150 lines)
**Purpose**: Progress monitoring and reporting
**Functions**:
- `Initialize-ProgressTracker`
- `Update-Progress`
- `Show-ProgressSummary`
- `Export-ProgressMetrics`

#### `FileOperations.psm1` (~200 lines)
**Purpose**: File system operations
**Functions**:
- `Initialize-OutputDirectories`
- `Backup-ExistingFiles`
- `Cleanup-TempFiles`
- `Validate-FilePaths`

#### `ValidationHelpers.psm1` (~150 lines)
**Purpose**: Common validation functions
**Functions**:
- `Test-Prerequisites`
- `Validate-Configuration`
- `Test-ModuleDependencies`
- `Check-SystemRequirements`

## Core Orchestrator Design

### `MandA-Orchestrator.ps1` (~300 lines)

```powershell
#Requires -Version 5.1
#Requires -Modules @{ModuleName="ImportExcel"; ModuleVersion="7.0.0"}

[CmdletBinding()]
param(
    [Parameter(Mandatory=$false)]
    [string]$ConfigurationFile = ".\Configuration\default-config.json",
    
    [Parameter(Mandatory=$false)]
    [ValidateSet("Discovery", "Processing", "Export", "Full")]
    [string]$Mode = "Full",
    
    [Parameter(Mandatory=$false)]
    [string]$OutputPath,
    
    [Parameter(Mandatory=$false)]
    [switch]$Force,
    
    [Parameter(Mandatory=$false)]
    [switch]$ValidateOnly
)

# Main orchestration logic
function Start-MandADiscovery {
    param($Configuration, $Mode)
    
    try {
        # Phase 1: Initialize
        Initialize-MandAEnvironment -Configuration $Configuration
        
        # Phase 2: Authenticate
        if (-not (Initialize-MandAAuthentication -Configuration $Configuration)) {
            throw "Authentication failed"
        }
        
        # Phase 3: Connect
        if (-not (Initialize-AllConnections -Configuration $Configuration)) {
            throw "Service connections failed"
        }
        
        # Phase 4: Execute based on mode
        switch ($Mode) {
            "Discovery" { Invoke-DiscoveryPhase -Configuration $Configuration }
            "Processing" { Invoke-ProcessingPhase -Configuration $Configuration }
            "Export" { Invoke-ExportPhase -Configuration $Configuration }
            "Full" { 
                Invoke-DiscoveryPhase -Configuration $Configuration
                Invoke-ProcessingPhase -Configuration $Configuration
                Invoke-ExportPhase -Configuration $Configuration
            }
        }
        
        # Phase 5: Cleanup
        Complete-MandADiscovery -Configuration $Configuration
        
    } catch {
        Handle-ServiceError -Error $_ -Context "Main Orchestration"
        throw
    } finally {
        Disconnect-AllServices
    }
}
```

## Configuration Management

### `default-config.json` Structure

```json
{
  "metadata": {
    "version": "4.0.0",
    "created": "2025-05-26",
    "description": "M&A Discovery Suite Configuration"
  },
  "environment": {
    "domainController": "ad.zedra.com",
    "outputPath": "C:\\DiscoveryData",
    "tempPath": "C:\\Temp\\MandADiscovery",
    "logLevel": "INFO",
    "maxRetries": 3,
    "timeoutSeconds": 300
  },
  "authentication": {
    "credentialStorePath": "C:\\DiscoveryData\\credentials.config",
    "certificateThumbprint": null,
    "useInteractiveAuth": false,
    "tokenRefreshThreshold": 300
  },
  "discovery": {
    "parallelThreads": 5,
    "batchSize": 100,
    "enabledSources": [
      "ActiveDirectory",
      "Exchange",
      "Graph",
      "Azure",
      "Intune"
    ],
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

## Migration Strategy

### Phase 1: Foundation (Week 1-2)
1. **Create Module Structure**
   - Set up directory structure
   - Create module manifests (.psd1 files)
   - Implement core utilities (Logging, ErrorHandling)

2. **Extract Authentication Logic**
   - Move app registration functions to `AppRegistration.psm1`
   - Create `CredentialManagement.psm1`
   - Implement `Authentication.psm1`

### Phase 2: Connectivity (Week 3)
1. **Extract Connection Logic**
   - Create connection modules for each service
   - Implement `ConnectionManager.psm1`
   - Add retry and error handling

### Phase 3: Discovery (Week 4-5)
1. **Modularize Discovery Functions**
   - Extract AD discovery functions
   - Extract Exchange discovery functions
   - Extract Graph discovery functions
   - Extract Azure discovery functions

### Phase 4: Processing (Week 6)
1. **Extract Processing Logic**
   - Move aggregation logic to `DataAggregation.psm1`
   - Create `ProfileBuilder.psm1`
   - Implement `ComplexityCalculator.psm1`

### Phase 5: Export (Week 7)
1. **Modularize Export Functions**
   - Create export modules for each format
   - Implement PowerApps optimization

### Phase 6: Integration (Week 8)
1. **Create Orchestrator**
   - Implement main orchestration script
   - Add configuration management
   - Create bootstrap script

### Phase 7: Testing & Documentation (Week 9-10)
1. **Comprehensive Testing**
   - Unit tests for each module
   - Integration tests
   - End-to-end testing

2. **Documentation**
   - API reference
   - Configuration guide
   - Migration documentation

## Benefits of New Architecture

### 🎯 Maintainability
- **Modular Design**: Each module has a single responsibility
- **Smaller Files**: Average 300 lines per module vs 2,000+ per script
- **Clear Dependencies**: Explicit module imports and dependencies
- **Version Control**: Easier to track changes in specific functionality

### 🔧 Testability
- **Unit Testing**: Each function can be tested independently
- **Mock Support**: Easy to mock dependencies for testing
- **Integration Testing**: Test module interactions
- **Automated Testing**: CI/CD pipeline integration

### 🚀 Performance
- **Lazy Loading**: Load only required modules
- **Parallel Processing**: Better resource utilization
- **Memory Management**: Improved garbage collection
- **Caching**: Reuse connections and data where appropriate

### 📈 Scalability
- **Plugin Architecture**: Easy to add new discovery sources
- **Configuration-Driven**: Behavior controlled by configuration
- **Multi-Environment**: Support for dev/staging/production
- **Cloud-Ready**: Prepared for Azure Functions/Logic Apps

### 🛡️ Reliability
- **Error Isolation**: Failures in one module don't affect others
- **Retry Logic**: Standardized retry mechanisms
- **Graceful Degradation**: Continue with partial data
- **Health Monitoring**: Built-in health checks

## Implementation Timeline

| Phase | Duration | Deliverables |
|-------|----------|-------------|
| Foundation | 2 weeks | Core modules, utilities, structure |
| Connectivity | 1 week | Connection modules, manager |
| Discovery | 2 weeks | All discovery modules |
| Processing | 1 week | Aggregation and processing modules |
| Export | 1 week | Export modules, PowerApps integration |
| Integration | 1 week | Orchestrator, configuration |
| Testing | 2 weeks | Tests, validation, documentation |
| **Total** | **10 weeks** | **Complete modular solution** |

## Success Metrics

### Code Quality
- **Lines of Code**: Reduce from 6,289 to ~6,500 (better organized)
- **Cyclomatic Complexity**: Average <10 per function
- **Test Coverage**: >80% code coverage
- **Documentation**: 100% function documentation

### Performance
- **Execution Time**: <20% increase due to module loading
- **Memory Usage**: <30% of current usage through better management
- **Error Rate**: <5% failure rate with retry logic
- **Recovery Time**: <2 minutes for transient failures

### Maintainability
- **Deployment Time**: <50% of current time
- **Bug Fix Time**: <30% of current time
- **Feature Addition**: <40% of current time
- **Onboarding Time**: <60% for new developers

This architectural redesign transforms the M&A Discovery Suite from a monolithic script collection into a modern, maintainable, and scalable solution that will serve as a foundation for future enhancements and enterprise deployment.