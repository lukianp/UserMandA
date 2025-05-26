# M&A Discovery Suite v4.0 - Modular Architecture

A comprehensive PowerShell-based solution for M&A environment discovery, analysis, and migration planning. This modular architecture replaces the previous monolithic approach with maintainable, scalable components.

## 🏗️ Architecture Overview

### **Before (Legacy)**
- 3 monolithic scripts (6,289 lines total)
- Difficult maintenance and updates
- Limited error handling
- No modularity

### **After (New Architecture)**
- 1 orchestrator + 24 specialized modules
- ~6,500 lines organized by function
- Comprehensive error handling
- Configuration-driven behavior
- Automated deployment

## 📁 Project Structure

```
M&A Discovery Suite/
├── Core/
│   └── MandA-Orchestrator.ps1          # Main execution engine
├── Modules/
│   ├── Authentication/                  # Authentication & credentials
│   │   ├── Authentication.psm1
│   │   └── CredentialManagement.psm1
│   ├── Connectivity/                    # Service connections
│   │   └── ConnectionManager.psm1
│   ├── Discovery/                       # Data collection
│   │   ├── ActiveDirectoryDiscovery.psm1
│   │   └── GraphDiscovery.psm1
│   ├── Processing/                      # Data analysis
│   │   ├── DataAggregation.psm1
│   │   ├── UserProfileBuilder.psm1
│   │   ├── WaveGeneration.psm1
│   │   └── DataValidation.psm1
│   ├── Export/                          # Data export
│   │   ├── CSVExport.psm1
│   │   └── JSONExport.psm1
│   └── Utilities/                       # Core utilities
│       ├── Logging.psm1
│       ├── ErrorHandling.psm1
│       ├── ValidationHelpers.psm1
│       ├── ProgressTracking.psm1
│       └── FileOperations.psm1
├── Configuration/
│   └── default-config.json             # Default configuration
├── Scripts/
│   └── QuickStart.ps1                  # Simplified launcher
└── README.md                           # This file
```

## 🚀 Quick Start

### **Prerequisites**
- PowerShell 5.1 or higher
- Required PowerShell modules:
  - Microsoft.Graph
  - Microsoft.Graph.Authentication
  - ExchangeOnlineManagement
  - ActiveDirectory (for on-premises discovery)
  - ImportExcel (optional, for Excel export)

### **Basic Usage**

1. **Quick validation:**
   ```powershell
   .\Scripts\QuickStart.ps1 -Operation Validate
   ```

2. **Full discovery and analysis:**
   ```powershell
   .\Scripts\QuickStart.ps1 -Operation Full
   ```

3. **Discovery only:**
   ```powershell
   .\Scripts\QuickStart.ps1 -Operation Discovery
   ```

4. **Custom output path:**
   ```powershell
   .\Scripts\QuickStart.ps1 -Operation Full -OutputPath "D:\CustomOutput"
   ```

### **Advanced Usage**

1. **Direct orchestrator execution:**
   ```powershell
   .\Core\MandA-Orchestrator.ps1 -Mode Full -ConfigurationFile ".\Configuration\default-config.json"
   ```

2. **Force reprocessing:**
   ```powershell
   .\Core\MandA-Orchestrator.ps1 -Mode Full -Force
   ```

3. **Validation only:**
   ```powershell
   .\Core\MandA-Orchestrator.ps1 -ValidateOnly
   ```

## ⚙️ Configuration

### **Configuration File Structure**

```json
{
  "metadata": {
    "version": "4.0.0",
    "companyName": "Your Company"
  },
  "environment": {
    "domainController": "ad.company.com",
    "outputPath": "C:\\MandADiscovery\\Output",
    "logLevel": "INFO"
  },
  "authentication": {
    "credentialStorePath": "C:\\MandADiscovery\\Output\\credentials.config"
  },
  "discovery": {
    "enabledSources": ["ActiveDirectory", "Exchange", "Graph", "Azure", "Intune"],
    "skipExistingFiles": true
  },
  "processing": {
    "generateWavesByDepartment": true,
    "maxWaveSize": 50
  },
  "export": {
    "formats": ["CSV", "Excel", "JSON"],
    "powerAppsOptimized": true
  }
}
```

### **Key Configuration Options**

- **enabledSources**: Choose which data sources to discover
- **skipExistingFiles**: Skip discovery if files already exist
- **generateWavesByDepartment**: Group migration waves by department
- **maxWaveSize**: Maximum users per migration wave
- **powerAppsOptimized**: Generate PowerApps-compatible export

## 📊 Data Sources

### **Supported Sources**
- **Active Directory**: On-premises user, group, and computer data
- **Microsoft Graph**: Azure AD users, groups, applications, devices
- **Exchange Online**: Mailbox data and configurations
- **Azure**: Infrastructure and resource information
- **Intune**: Device management and compliance data

### **Discovery Outputs**
- `ADUsers.csv` - Active Directory users
- `SecurityGroups.csv` - Security groups
- `GraphUsers.csv` - Azure AD users
- `GraphGroups.csv` - Azure AD groups
- `GraphDevices.csv` - Azure AD devices
- `GraphLicenses.csv` - License information

## 🔄 Processing Pipeline

### **1. Data Aggregation**
- Correlates data from multiple sources
- Identifies orphaned accounts
- Detects data inconsistencies

### **2. User Profile Building**
- Creates comprehensive user profiles
- Calculates complexity scores
- Assesses migration readiness

### **3. Migration Wave Generation**
- Groups users into migration waves
- Optimizes wave sizes and composition
- Considers department and complexity factors

### **4. Data Validation**
- Validates data quality
- Generates quality reports
- Identifies issues requiring attention

## 📈 Analysis & Reporting

### **Complexity Analysis**
- **Simple**: Low complexity, standard migration
- **Standard**: Moderate complexity, some considerations
- **Complex**: High complexity, requires planning
- **High Risk**: Requires special handling

### **Readiness Assessment**
- **Ready**: Can migrate immediately
- **Minor Issues**: Quick fixes needed
- **Needs Attention**: Requires investigation
- **Not Ready**: Blocking issues present

### **Migration Waves**
- Intelligent grouping by department or complexity
- Optimized wave sizes
- Risk assessment per wave
- Time estimation

## 📤 Export Formats

### **CSV Export**
- `UserProfiles.csv` - Complete user analysis
- `MigrationWaves.csv` - Wave assignments
- `ComplexityAnalysis.csv` - Analysis summary
- `SummaryStatistics.csv` - High-level metrics

### **JSON Export**
- `UserProfiles.json` - Structured user data
- `MigrationWaves.json` - Wave definitions
- `ComprehensiveSummary.json` - Complete analysis
- `PowerApps_Export.json` - PowerApps-optimized format

### **Excel Export** (Optional)
- Multi-worksheet workbook
- Formatted tables and charts
- Summary dashboard
- Detailed analysis sheets

## 🔐 Security Features

### **Credential Management**
- DPAPI encryption for stored credentials
- Certificate-based encryption support
- Secure credential prompting
- Automatic token refresh

### **Authentication**
- Azure AD service principal authentication
- Multi-service connection management
- Connection status monitoring
- Graceful error handling

## 🛠️ Troubleshooting

### **Common Issues**

1. **Authentication Failures**
   ```powershell
   # Clear stored credentials
   Remove-Item ".\Output\credentials.config" -Force
   .\Scripts\QuickStart.ps1 -Operation Validate
   ```

2. **Module Loading Issues**
   ```powershell
   # Install required modules
   Install-Module Microsoft.Graph -Force -Scope CurrentUser
   Install-Module ExchangeOnlineManagement -Force -Scope CurrentUser
   ```

3. **Permission Issues**
   - Ensure service principal has required permissions
   - Check Azure AD app registration permissions
   - Verify Exchange Online management permissions

### **Log Files**
- Location: `{OutputPath}\Logs\`
- Format: `MandA_Discovery_YYYYMMDD_HHMMSS.log`
- Levels: DEBUG, INFO, WARN, ERROR, SUCCESS

## 📋 Prerequisites Checklist

- [ ] PowerShell 5.1 or higher installed
- [ ] Required PowerShell modules installed
- [ ] Azure AD service principal created
- [ ] Service principal permissions configured
- [ ] Network connectivity to required endpoints
- [ ] Sufficient disk space (5GB+ recommended)
- [ ] Administrative permissions for on-premises discovery

## 🔄 Migration from Legacy Scripts

### **Mapping Legacy to New Architecture**

| Legacy Script | New Module(s) |
|---------------|---------------|
| `InfrastructureCreateAppReg.ps1` | `Authentication/AppRegistration.psm1` |
| `InfrastructureDiscoveryInput.ps1` | `Discovery/*.psm1` |
| `InfrastructureDiscoveryOutput.ps1` | `Processing/*.psm1` + `Export/*.psm1` |

### **Migration Steps**

1. **Backup existing scripts and data**
2. **Install new modular architecture**
3. **Configure authentication and settings**
4. **Test with validation mode**
5. **Run discovery and compare results**
6. **Update any dependent processes**

## 📞 Support & Maintenance

### **Regular Maintenance**
- Review and update service principal credentials
- Monitor log files for errors or warnings
- Update PowerShell modules regularly
- Review and optimize configuration settings

### **Performance Tuning**
- Adjust `parallelThreads` for your environment
- Optimize `batchSize` based on data volume
- Configure `memoryThresholdMB` for available RAM
- Set appropriate `timeoutSeconds` for network conditions

## 🎯 Benefits of New Architecture

### **Maintainability**
- ✅ Replace 4,000-line script edits with targeted 300-line module updates
- ✅ Clear separation of concerns
- ✅ Version control at module level

### **Reliability**
- ✅ Error isolation prevents cascade failures
- ✅ Standardized retry logic
- ✅ Graceful degradation with partial data

### **Performance**
- ✅ Lazy module loading
- ✅ Better memory management
- ✅ Parallel processing capabilities

### **Scalability**
- ✅ Plugin architecture for new data sources
- ✅ Configuration-driven behavior
- ✅ Multi-environment support

---

## 📄 License

This M&A Discovery Suite is provided as-is for internal use. Please ensure compliance with your organization's policies and Microsoft's terms of service when accessing cloud services.

## 🤝 Contributing

To contribute improvements or report issues:
1. Document the issue or enhancement
2. Test changes thoroughly
3. Update relevant documentation
4. Follow PowerShell best practices

---

**M&A Discovery Suite v4.0** - Transforming M&A environment discovery through modular architecture.
