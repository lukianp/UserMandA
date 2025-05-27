# M&A Discovery Suite v4.0 - Enhanced Modular Architecture

A comprehensive PowerShell-based solution for enterprise M&A environment discovery, analysis, and migration planning. This enhanced modular architecture provides intelligent data collection, correlation, and migration wave generation with advanced error handling and visual feedback.

## 🚀 Key Features

### **Enhanced Capabilities**
- 🔐 **Secure Credential Management** - DPAPI and certificate-based encryption
- 🌐 **Multi-Service Discovery** - AD, Azure AD, Exchange Online, Intune, and more
- 📊 **Intelligent Wave Generation** - Department or complexity-based grouping
- 🎯 **Complexity Analysis** - Automated user migration complexity scoring
- 📈 **Quality Validation** - Built-in data quality checks and reporting
- 🔄 **Robust Connectivity** - Enhanced connection manager with fallback methods
- 📝 **Visual Progress Tracking** - Emoji-enhanced logging and progress bars
- 🛠️ **PowerApps Integration** - Optimized JSON export for Power Platform
- 📍 **Location Independence** - Run from any directory with automatic path resolution
- 🔍 **Enhanced GPO Discovery** - Robust XML parsing with namespace handling and repair

## 🏗️ Architecture Overview

### **Modular Design**
- **1 Orchestrator** - Central execution engine with location-independent paths
- **27+ Specialized Modules** - Focused, maintainable components
- **Enhanced Modules** - Advanced versions with improved capabilities
- **Configuration-Driven** - JSON-based behavior control
- **Comprehensive Error Handling** - Retry logic and graceful degradation

## 📁 Project Structure

```
M&A Discovery Suite/
├── Core/
│   └── MandA-Orchestrator.ps1              # Main execution engine
├── Modules/
│   ├── Authentication/                      # Authentication & credential management
│   │   ├── Authentication.psm1
│   │   └── CredentialManagement.psm1
│   ├── Connectivity/                        # Service connection management
│   │   ├── ConnectionManager.psm1
│   │   └── EnhancedConnectionManager.psm1  # 🆕 Advanced connection handling
│   ├── Discovery/                           # Data collection modules
│   │   ├── ActiveDirectoryDiscovery.psm1
│   │   ├── GraphDiscovery.psm1
│   │   ├── ExchangeDiscovery.psm1        # (To be implemented)
│   │   ├── AzureDiscovery.psm1          # (To be implemented)
│   │   ├── IntuneDiscovery.psm1         # (To be implemented)
│   │   ├── GPODiscovery.psm1
│   │   └── EnhancedGPODiscovery.psm1      # 🆕 Improved XML parsing
│   ├── Processing/                          # Data analysis & transformation
│   │   ├── DataAggregation.psm1
│   │   ├── UserProfileBuilder.psm1
│   │   ├── WaveGeneration.psm1
│   │   └── DataValidation.psm1
│   ├── Export/                              # Export formats
│   │   ├── CSVExport.psm1
│   │   ├── JSONExport.psm1
│   │   └── ExcelExport.psm1             # (To be implemented)
│   └── Utilities/                           # Core utilities
│       ├── Logging.psm1
│       ├── EnhancedLogging.psm1            # 🆕 Visual logging with emojis
│       ├── ErrorHandling.psm1
│       ├── ValidationHelpers.psm1
│       ├── ProgressTracking.psm1
│       └── FileOperations.psm1
├── Configuration/
│   └── default-config.json                  # Default configuration template
├── Scripts/
│   ├── QuickStart.ps1                      # Simplified launcher
│   ├── Setup-AppRegistration.ps1           # 🆕 Azure AD App Registration setup
│   ├── Set-SuiteEnvironment.ps1            # 🆕 Environment setup for location independence
│   ├── Test-LocationIndependence.ps1       # 🆕 Location independence validator
│   └── Validate-Installation.ps1            # 🆕 Installation validator
├── CREDENTIALS_SETUP_GUIDE.md               # 🆕 Detailed credentials setup guide
└── README.md                                # This file
```

## 🚀 Quick Start Guide

### **🔐 IMPORTANT: Credentials Setup (Required First Step)**

**Before running any discovery operations, you MUST set up Azure AD App Registration and encrypted credentials.**

#### **Option 1: Create New App Registration (Recommended)**
```powershell
# Run the app registration setup script
.\Scripts\Setup-AppRegistration.ps1 -TenantId "your-tenant-id-here"
```

#### **Option 2: Use Existing App Registration**
```powershell
# If you already have an app registration
.\Scripts\Setup-AppRegistration.ps1 -TenantId "your-tenant-id-here" -UseExistingApp -ExistingClientId "your-client-id-here"
```

#### **📖 Detailed Setup Instructions**
For complete setup instructions, troubleshooting, and security information, see:
**[CREDENTIALS_SETUP_GUIDE.md](CREDENTIALS_SETUP_GUIDE.md)**

#### **✅ Test Your Setup**
```powershell
# Validate configuration without running full discovery
.\Core\MandA-Orchestrator.ps1 -ValidateOnly
```

---

### **Prerequisites**

#### Required Software
- ✅ PowerShell 5.1 or higher
- ✅ .NET Framework 4.7.2 or higher
- ✅ Internet connectivity to Microsoft services

#### Required PowerShell Modules
```powershell
# Install required modules
Install-Module -Name Microsoft.Graph -Force -Scope CurrentUser
Install-Module -Name Microsoft.Graph.Authentication -Force -Scope CurrentUser
Install-Module -Name ExchangeOnlineManagement -Force -Scope CurrentUser

# Optional modules for enhanced functionality
Install-Module -Name ActiveDirectory -Force -Scope CurrentUser      # For on-premises AD
Install-Module -Name ImportExcel -Force -Scope CurrentUser          # For Excel export
Install-Module -Name Az.Accounts -Force -Scope CurrentUser          # For Azure resources
```

### **Installation Validation**

Run the installation validator to ensure everything is properly configured:

```powershell
.\Scripts\Validate-Installation.ps1
```

This will check:
- ✅ PowerShell version
- ✅ Module availability and import capability
- ✅ File structure integrity
- ✅ Network connectivity
- ✅ Configuration validity
- ✅ Orchestrator syntax

### **Basic Usage**

1. **First-time setup with validation:**
   ```powershell
   .\Scripts\QuickStart.ps1 -Operation Validate
   ```

2. **Full discovery and analysis:**
   ```powershell
   .\Scripts\QuickStart.ps1 -Operation Full
   ```

3. **Discovery only (collect data):**
   ```powershell
   .\Scripts\QuickStart.ps1 -Operation Discovery
   ```

4. **Processing only (analyze existing data):**
   ```powershell
   .\Scripts\QuickStart.ps1 -Operation Processing
   ```

5. **Export only (generate reports):**
   ```powershell
   .\Scripts\QuickStart.ps1 -Operation Export
   ```

### **Advanced Usage**

1. **Custom configuration file:**
   ```powershell
   .\Core\MandA-Orchestrator.ps1 -Mode Full -ConfigurationFile ".\Configuration\custom-config.json"
   ```

2. **Override output path:**
   ```powershell
   .\Core\MandA-Orchestrator.ps1 -Mode Full -OutputPath "D:\M&A_Analysis" -Force
   ```

3. **Validation only mode:**
   ```powershell
   .\Core\MandA-Orchestrator.ps1 -ValidateOnly
   ```

4. **Test location independence:**
   ```powershell
   .\Scripts\Test-LocationIndependence.ps1
   # Or test with a specific location
   .\Scripts\Test-LocationIndependence.ps1 -TestLocation "C:\Temp\TestSuite"
   ```

## ⚙️ Configuration

### **Configuration Structure**

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

### **Configuration Parameters**

#### Environment Settings
- **domainController** - On-premises AD domain controller
- **outputPath** - Root directory for all outputs
- **logLevel** - DEBUG, INFO, WARN, ERROR
- **maxRetries** - Retry attempts for failed operations

#### Authentication Settings
- **credentialStorePath** - Encrypted credential storage location
- **certificateThumbprint** - Optional certificate for authentication
- **useInteractiveAuth** - Enable interactive authentication prompts

#### Discovery Settings
- **enabledSources** - Data sources to collect from
- **skipExistingFiles** - Skip if data already exists
- **parallelThreads** - Concurrent discovery operations

#### Processing Settings
- **generateWavesByDepartment** - Group by department vs complexity
- **maxWaveSize** - Maximum users per migration wave
- **complexityThresholds** - Score ranges for complexity categories

## 🔐 Authentication Setup

### **Service Principal Creation**

1. **Create Azure AD App Registration:**
   ```powershell
   # Connect to Azure AD
   Connect-AzureAD
   
   # Create app registration
   $app = New-AzureADApplication -DisplayName "M&A Discovery Suite"
   $sp = New-AzureADServicePrincipal -AppId $app.AppId
   
   # Create client secret
   $secret = New-AzureADApplicationPasswordCredential -ObjectId $app.ObjectId
   
   Write-Host "Client ID: $($app.AppId)"
   Write-Host "Tenant ID: $(Get-AzureADTenantDetail).ObjectId"
   Write-Host "Client Secret: $($secret.Value)"
   ```

2. **Grant Required Permissions:**
   
   **Microsoft Graph API:**
   - User.Read.All
   - Group.Read.All
   - Device.Read.All
   - Application.Read.All
   - Organization.Read.All
   - AuditLog.Read.All
   - Directory.Read.All
   - Reports.Read.All (for OneDrive usage)
   
   **Exchange Online:**
   - Exchange.ManageAsApp
   - full_access_as_app

### **First-Time Authentication**

The suite will prompt for credentials on first run:

```
═══════════════════════════════════════════════════════════════════
       M&A Discovery Suite - Credential Input Required             
═══════════════════════════════════════════════════════════════════

Please provide Azure AD service principal credentials:

Client ID (GUID format): xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
Tenant ID (GUID format): xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
Client Secret: ********************************

✅ Credentials collected successfully

Save credentials securely for future use? (y/N): y
```

## 📊 Discovery Sources & Outputs

### **Data Sources**

| Source | Description | Output Files | Implementation Status |
|--------|-------------|--------------|----------------------|
| **Active Directory** | On-premises AD users, groups, computers | ADUsers.csv, SecurityGroups.csv, ADComputers.csv, OrganizationalUnits.csv | ✅ Implemented |
| **Microsoft Graph** | Azure AD users, groups, devices, licenses | GraphUsers.csv, GraphGroups.csv, GraphDevices.csv, GraphLicenses.csv, GraphApplications.csv | ✅ Implemented |
| **Exchange Online** | Mailboxes, distribution lists, settings | ExchangeMailboxes.csv, DistributionLists.csv | 🚧 Partial |
| **Azure Resources** | Subscriptions, resource groups, VMs | AzureResources.csv, AzureVMs.csv | 📋 Planned |
| **Intune** | Managed devices, compliance policies | IntuneDevices.csv, CompliancePolicies.csv | 📋 Planned |
| **Group Policy** | GPOs, drive/printer mappings | GroupPolicies.csv, DriveMappingsGPO.csv, PrinterMappingsGPO.csv, FolderRedirectionGPO.csv, LogonScripts.csv | ✅ Enhanced |
| **OneDrive** | Usage statistics and storage | OneDriveUsage.csv | ✅ Implemented |
| **App Proxies** | Application proxy configurations | ApplicationProxies.csv | ✅ Implemented |

### **Processing Outputs**

| Output | Description | Location |
|--------|-------------|----------|
| **User Profiles** | Comprehensive user analysis with complexity scoring | Processed/UserProfiles.csv |
| **Migration Waves** | Wave assignments and timing | Processed/MigrationWaves.csv |
| **Complexity Analysis** | User complexity breakdown | Processed/ComplexityAnalysis.csv |
| **Quality Report** | Data validation results | Processed/DataQualityReport.csv |
| **Summary Statistics** | High-level metrics | Processed/SummaryStatistics.csv |
| **Detailed User Report** | Complete user profile data | Processed/DetailedUserReport.csv |
| **PowerApps Export** | Optimized JSON for Power Platform | PowerApps_Export.json |

## 🎯 Migration Planning Features

### **Complexity Scoring**

Users are analyzed across multiple factors:
- 📊 **Account Status** - Enabled/disabled, last logon
- 📧 **Mailbox Size** - Storage requirements
- 🔑 **Licensing** - Number and type of licenses
- 🏢 **Service Presence** - AD, Azure AD, Exchange
- 📅 **Account Age** - Legacy account considerations
- 🔗 **Dependencies** - Group memberships, manager relationships

### **Migration Categories**

1. **🟢 Simple** (Score 0-3)
   - Standard users with minimal complexity
   - Estimated time: 30-45 minutes

2. **🟡 Standard** (Score 4-7)
   - Typical users with some considerations
   - Estimated time: 45-90 minutes

3. **🟠 Complex** (Score 8-10)
   - Users requiring special attention
   - Estimated time: 90-180 minutes

4. **🔴 High Risk** (Score 11+)
   - Critical users needing careful planning
   - Estimated time: 180+ minutes

### **Wave Generation Options**

1. **Department-Based Waves**
   - Groups users by department
   - Maintains team cohesion
   - Optimal for business continuity
   - Automatic wave splitting for large departments

2. **Complexity-Based Waves**
   - Groups by migration difficulty
   - Balances workload across waves
   - Optimal for resource planning
   - Priority-based ordering

### **Enhanced Features**

#### **Visual Logging System**
The suite includes enhanced visual logging with emoji indicators:
- 🚀 **Startup/Initialization**
- ✅ **Success Operations**
- ⚠️ **Warnings**
- ❌ **Errors**
- 🔄 **Progress Updates**
- 📊 **Statistics**
- 🎯 **Section Headers**
- 🔍 **Debug Information**
- 🔧 **Recommendations**

#### **Connection Management**
Enhanced connection handling with multiple fallback methods:
- **Primary** - Service principal authentication
- **Certificate** - Certificate-based authentication
- **Interactive** - User interactive login
- **Managed Identity** - Azure managed identity
- **Proxy Handling** - Automatic proxy detection and bypass

#### **GPO Discovery**
Enhanced GPO discovery with robust XML parsing:
- Namespace-aware XML parsing
- Automatic XML repair for malformed files
- Multiple XPath strategies for finding settings
- Comprehensive error recovery
- Visual progress indicators

## 🛠️ Troubleshooting

### **Common Issues & Solutions**

#### Authentication Failures
```powershell
# Clear stored credentials
Remove-Item "C:\MandADiscovery\Output\credentials.config" -Force

# Re-run with fresh authentication
.\Scripts\QuickStart.ps1 -Operation Validate
```

#### Module Not Found Errors
```powershell
# Verify module installation
Get-Module -ListAvailable | Where-Object Name -like "*Graph*"

# Reinstall if needed
Install-Module Microsoft.Graph -Force -AllowClobber
```

#### Configuration Parsing Errors
```powershell
# Validate JSON syntax
$config = Get-Content ".\Configuration\default-config.json" -Raw
try { $config | ConvertFrom-Json } catch { $_.Exception.Message }
```

#### Exchange Connection Issues
The enhanced connection manager will automatically try:
1. Modern auth with proxy bypass
2. WinRM proxy configuration
3. Direct connection
4. Manual remote PowerShell

If all fail:
- Ensure WinRM service is running: `Get-Service WinRM`
- Check proxy settings: `netsh winhttp show proxy`
- Reset proxy if needed: `netsh winhttp reset proxy`
- Verify Exchange permissions for service principal
- Run as administrator for best results

### **Log Locations**
- **Main Log**: `{OutputPath}\Logs\MandA_Discovery_YYYYMMDD_HHMMSS.log`
- **Progress Metrics**: `{OutputPath}\Logs\ProgressMetrics_YYYYMMDD_HHMMSS.json`
- **Validation Reports**: `{OutputPath}\Processed\ValidationReport_YYYYMMDD_HHMMSS.csv`
- **GPO Reports**: `{OutputPath}\GPOReports\{GPO-GUID}.xml`

## 📈 Performance Optimization

### **Configuration Tuning**

```json
{
  "discovery": {
    "parallelThreads": 10,      // Increase for faster discovery
    "batchSize": 200            // Larger batches for better performance
  },
  "performance": {
    "memoryThresholdMB": 8192,  // Increase for large environments
    "progressUpdateInterval": 30 // Less frequent updates
  }
}
```

### **Best Practices**
1. **Run during off-hours** for minimal impact
2. **Start with discovery only** to assess data volume
3. **Use skipExistingFiles** for incremental updates
4. **Monitor memory usage** in Task Manager
5. **Enable compression** for large datasets
6. **Review logs** for optimization opportunities

## 🔄 Version History

### **v4.0.0 (Current - January 2025)**
- 🆕 Enhanced modular architecture (27+ modules)
- 🆕 Visual logging with emoji indicators
- 🆕 Robust connection management with multiple fallbacks
- 🆕 PowerApps-optimized exports
- 🆕 Installation validator script
- 🆕 Enhanced GPO discovery with XML repair
- 🆕 Location-independent architecture
- 🆕 OneDrive usage reporting
- 🆕 Application proxy discovery
- 🆕 Comprehensive data validation
- 🆕 Department-based wave generation
- 🆕 Enhanced error handling with retry logic

### **v3.0.0**
- Initial modular design
- Basic discovery and processing
- CSV export functionality

## 🤝 Contributing

### **Development Guidelines**
1. **Module Structure** - One module per functional area
2. **Error Handling** - Use Invoke-WithRetry for network operations
3. **Logging** - Use Write-MandALog for consistent output
4. **Documentation** - Update help comments in modules
5. **Testing** - Validate with Validate-Installation.ps1
6. **Path Independence** - Use $script:SuiteRoot for all paths

### **Adding New Data Sources**
1. Create new discovery module in `Modules\Discovery\`
2. Add source to configuration enabledSources
3. Update data aggregation logic in DataAggregation.psm1
4. Add export mappings in export modules
5. Update documentation

### **Module Development Template**
```powershell
<#
.SYNOPSIS
    Brief description
.DESCRIPTION
    Detailed description
#>

function Invoke-YourFunction {
    param([hashtable]$Configuration)
    
    try {
        Write-MandALog "Starting operation" -Level "INFO"
        # Your code here
        Write-MandALog "Operation completed" -Level "SUCCESS"
    } catch {
        Write-MandALog "Operation failed: $($_.Exception.Message)" -Level "ERROR"
        throw
    }
}

# Export functions
Export-ModuleMember -Function @('Invoke-YourFunction')
```

## 📞 Support

### **Getting Help**
- Review logs in `{OutputPath}\Logs\`
- Run validation script for diagnostics
- Check troubleshooting section
- Verify service principal permissions
- Test location independence

### **Maintenance Tasks**
- 📅 **Weekly** - Review logs and clean up old files
- 📅 **Monthly** - Update PowerShell modules
- 📅 **Quarterly** - Review and rotate credentials
- 📅 **Annually** - Update complexity thresholds

### **Known Limitations**
- Exchange discovery requires direct connectivity (proxy issues may occur)
- Excel export requires ImportExcel module (optional)
- Some Azure/Intune modules are planned but not yet implemented
- Maximum recommended users per wave: 50 (configurable)

---

**M&A Discovery Suite v4.0** - Enterprise-ready discovery and migration planning through intelligent automation.

*Built with ❤️ for IT professionals managing complex M&A transitions*

**Last Updated:** January 2025