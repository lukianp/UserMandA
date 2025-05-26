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

## 🏗️ Architecture Overview

### **Modular Design**
- **1 Orchestrator** - Central execution engine
- **24+ Specialized Modules** - Focused, maintainable components
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
│   │   ├── ExchangeDiscovery.psm1
│   │   ├── AzureDiscovery.psm1
│   │   ├── IntuneDiscovery.psm1
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
│   │   └── ExcelExport.psm1
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
│   └── Validate-Installation.ps1            # 🆕 Installation validator
└── README.md                                # This file
```

## 🚀 Quick Start Guide

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
- ✅ Module availability
- ✅ File structure integrity
- ✅ Network connectivity
- ✅ Configuration validity

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

| Source | Description | Output Files |
|--------|-------------|--------------|
| **Active Directory** | On-premises AD users, groups, computers | ADUsers.csv, SecurityGroups.csv, ADComputers.csv |
| **Microsoft Graph** | Azure AD users, groups, devices, licenses | GraphUsers.csv, GraphGroups.csv, GraphDevices.csv |
| **Exchange Online** | Mailboxes, distribution lists, settings | ExchangeMailboxes.csv, DistributionLists.csv |
| **Azure Resources** | Subscriptions, resource groups, VMs | AzureResources.csv, AzureVMs.csv |
| **Intune** | Managed devices, compliance policies | IntuneDevices.csv, CompliancePolicies.csv |
| **Group Policy** | GPOs, drive/printer mappings | GroupPolicies.csv, DriveMappingsGPO.csv |

### **Processing Outputs**

| Output | Description | Location |
|--------|-------------|----------|
| **User Profiles** | Comprehensive user analysis | Processed/UserProfiles.csv |
| **Migration Waves** | Wave assignments and timing | Processed/MigrationWaves.csv |
| **Complexity Analysis** | User complexity breakdown | Processed/ComplexityAnalysis.csv |
| **Quality Report** | Data validation results | Processed/DataQualityReport.csv |
| **Summary Statistics** | High-level metrics | Processed/SummaryStatistics.csv |

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

2. **Complexity-Based Waves**
   - Groups by migration difficulty
   - Balances workload across waves
   - Optimal for resource planning

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
- Ensure WinRM service is running
- Check proxy settings: `netsh winhttp show proxy`
- Reset proxy if needed: `netsh winhttp reset proxy`
- Verify Exchange permissions for service principal

### **Enhanced Logging**

The suite includes visual logging with emoji indicators:
- 🚀 **Startup/Initialization**
- ✅ **Success Operations**
- ⚠️ **Warnings**
- ❌ **Errors**
- 🔄 **Progress Updates**
- 📊 **Statistics**
- 🎯 **Section Headers**

### **Log Locations**
- **Main Log**: `{OutputPath}\Logs\MandA_Discovery_YYYYMMDD_HHMMSS.log`
- **Progress Metrics**: `{OutputPath}\Logs\ProgressMetrics_YYYYMMDD_HHMMSS.json`
- **Error Details**: Included in main log with full stack traces

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

## 🔄 Version History

### **v4.0.0 (Current)**
- 🆕 Enhanced modular architecture
- 🆕 Visual logging with emojis
- 🆕 Robust connection management with fallbacks
- 🆕 PowerApps-optimized exports
- 🆕 Installation validator script
- 🆕 Enhanced GPO discovery with XML repair

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

### **Adding New Data Sources**
1. Create new discovery module in `Modules\Discovery\`
2. Add source to configuration enabledSources
3. Update data aggregation logic
4. Add export mappings

## 📞 Support

### **Getting Help**
- Review logs in `{OutputPath}\Logs\`
- Run validation script for diagnostics
- Check README troubleshooting section
- Verify service principal permissions

### **Maintenance Tasks**
- 📅 **Monthly** - Update PowerShell modules
- 📅 **Quarterly** - Review and rotate credentials
- 📅 **Annually** - Update complexity thresholds

---

**M&A Discovery Suite v4.0** - Enterprise-ready discovery and migration planning through intelligent automation.

*Built with ❤️ for IT professionals managing complex M&A transitions*