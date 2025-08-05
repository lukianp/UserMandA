# M&A Discovery Suite - Interactive Menu System

## Overview

The M&A Discovery Suite now includes a comprehensive interactive menu system that provides easy access to all discovery functionality through a user-friendly interface. This system is designed for both technical and non-technical users to perform comprehensive organizational discovery during M&A activities.

## Key Features

### 🎯 **5 New Discovery Modules**
- **VMware Infrastructure** - Auto-discovers vCenter servers and virtualization infrastructure
- **Certificate Authority** - Discovers PKI infrastructure, CAs, templates, and expiring certificates
- **DNS/DHCP Services** - Maps network foundation services and configurations
- **Power Platform** - Discovers Power BI, Power Apps, and Power Automate resources
- **Security Infrastructure** - Identifies security tools, firewalls, backup systems, and monitoring solutions

### 🔧 **App Registration Management**
- Interactive app registration creation wizard
- Automated app registration with standard permissions
- Permission validation and management
- App registration deletion capabilities

### 🎯 **Discovery Scope Selection**
- **Azure Only** - Cloud-based resources only
- **On-Premises Only** - Local infrastructure only
- **Hybrid (Recommended)** - Complete Azure + On-Premises discovery
- **Custom Scope** - Select specific modules to run

### 📊 **Results & Reporting**
- View discovery results and summaries
- Generate executive reports
- Export raw data in multiple formats
- Access discovery logs and diagnostics

## Quick Start

### Method 1: Through QuickStart (Recommended)
```powershell
# Run the main QuickStart script
.\QuickStart.ps1

# After completion, select option 1 to launch the Interactive Menu
```

### Method 2: Direct Launch
```powershell
# Launch the Interactive Menu directly
.\Scripts\Launch-InteractiveMenu.ps1
```

### Method 3: With Company Name
```powershell
# Pre-populate with company name
.\Scripts\Launch-InteractiveMenu.ps1 -CompanyName "YourCompany"
```

## Menu Navigation

### Main Menu Options
1. **App Registration Management** - Create and manage Azure AD applications
2. **Discovery Scope Selection** - Choose Azure, On-Premises, or Hybrid discovery
3. **Execute Discovery** - Run discovery modules with various options
4. **View Results & Reports** - Access discovery results and generate reports
5. **System Prerequisites Check** - Validate system requirements and setup
6. **Help & Documentation** - Access help and usage information

### Navigation Keys
- Use **number keys** to select menu options
- Use **R** to return to the previous menu
- Use **Q** to quit the application

## Discovery Modules

### Core Modules (Always Available)
- **Active Directory** - On-premises AD users, groups, and computers
- **Azure** - Azure AD users, groups, and resources
- **Exchange** - Exchange Online and on-premises mailboxes
- **Graph** - Microsoft Graph API data
- **SharePoint** - SharePoint sites and content
- **Teams** - Microsoft Teams configuration and usage

### New Enhanced Modules
- **VMware** - vSphere infrastructure with auto-discovery
- **CertificateAuthority** - PKI and certificate management
- **DNSDHCP** - Network services and configuration
- **PowerPlatform** - Power BI, Power Apps, Power Automate
- **SecurityInfrastructure** - Security tools and appliances

## Discovery Scopes

### Azure Only
- Focuses on cloud-based resources
- Ideal for cloud-first organizations
- Includes: Azure AD, Exchange Online, SharePoint Online, Teams, Power Platform

### On-Premises Only
- Focuses on local infrastructure
- Ideal for traditional on-premises environments
- Includes: Active Directory, Exchange on-premises, File Servers, VMware, DNS/DHCP

### Hybrid (Recommended)
- Comprehensive discovery of both cloud and on-premises
- Provides complete organizational visibility
- Includes: All Azure + All On-Premises modules

### Custom Scope
- Select specific modules to run
- Optimize for specific discovery needs
- Customize based on organizational requirements

## App Registration Requirements

### Required Permissions
**Microsoft Graph API:**
- `User.Read.All` - Read all user profiles
- `Group.Read.All` - Read all groups
- `Directory.Read.All` - Read directory data
- `Organization.Read.All` - Read organization info
- `Application.Read.All` - Read applications
- `Exchange.ManageAsApp` - Exchange data access

**Azure Service Management API:**
- `user_impersonation` - Access Azure resources

**Office 365 Management APIs:**
- `ActivityFeed.Read` - Read activity feeds
- `ServiceHealth.Read` - Read service health

## Output Locations

Discovery results are organized in the following structure:
```
Profiles/
└── [CompanyName]/
    ├── Logs/                    # Discovery logs and diagnostics
    ├── RawData/                 # Raw discovery data (CSV, JSON)
    ├── ProcessedData/           # Processed and analyzed data
    ├── Export/                  # Final reports and exports
    └── Temp/                    # Temporary files
```

## File Formats

### Raw Data Files
- **CSV** - Structured data suitable for analysis
- **JSON** - Detailed data with metadata
- **Summary JSON** - Module-specific summaries

### Common File Patterns
- `Azure_*.csv` - Azure AD and resource data
- `Exchange_*.csv` - Exchange mailbox and configuration data
- `VMware_*.csv` - VMware infrastructure data
- `Security_*.csv` - Security infrastructure data
- `PowerPlatform_*.csv` - Power Platform resources
- `Network_*.csv` - DNS/DHCP network services
- `CA_*.csv` - Certificate Authority data

## Troubleshooting

### Common Issues

1. **Prerequisites Not Met**
   - Run system prerequisites check from main menu
   - Ensure PowerShell 5.1+ is installed
   - Verify required modules are available

2. **Authentication Failures**
   - Use App Registration Management to create new credentials
   - Verify permissions are correctly assigned
   - Check credential file is properly formatted

3. **Discovery Errors**
   - Review discovery logs in the Logs folder
   - Use validation-only mode to test configuration
   - Check network connectivity for on-premises discovery

4. **Module Not Found**
   - Ensure all M&A Discovery Suite files are properly installed
   - Check that new modules are enabled in configuration
   - Verify module files exist in Modules/Discovery folder

### Support Files
- **Discovery Logs** - Detailed execution logs
- **Error Reports** - Structured error information
- **Progress Summary** - Session progress and statistics
- **Diagnostic Reports** - System health and configuration

## Best Practices

### Before Starting Discovery
1. Run system prerequisites check
2. Create or verify app registration with proper permissions
3. Select appropriate discovery scope
4. Ensure sufficient disk space for results

### During Discovery
1. Monitor progress through the interface
2. Review any warnings or errors immediately
3. Allow sufficient time for comprehensive discovery
4. Avoid interrupting long-running operations

### After Discovery
1. Review discovery summary and statistics
2. Check for any failed modules or errors
3. Validate critical data completeness
4. Archive results for future reference

## Advanced Usage

### Custom Module Selection
Use the Custom Scope option to:
- Run specific modules for targeted discovery
- Optimize for specific organizational needs
- Reduce discovery time and resource usage
- Focus on particular technology areas

### Batch Operations
For automated environments:
```powershell
# Run automated discovery
.\Scripts\Interactive-Menu.ps1 -CompanyName "Company" -AutoMode
```

### Configuration Customization
Modify `Configuration/default-config.json` to:
- Adjust discovery scope and filters
- Configure authentication methods
- Set performance and timeout parameters
- Enable/disable specific modules

## Integration

### With Existing Workflows
The Interactive Menu integrates seamlessly with:
- **QuickStart.ps1** - Full initialization and discovery
- **MandA-Orchestrator.ps1** - Core discovery engine
- **Create-AppRegistration.ps1** - Credential management
- **Set-SuiteEnvironment.ps1** - Environment initialization

### Export Integration
Results can be used with:
- **Excel** - For detailed analysis and reporting
- **Power BI** - For visualization and dashboards
- **PowerApps** - For application development
- **Custom Scripts** - For automated processing

## Version History

### Version 1.0.0
- Initial release of Interactive Menu System
- Added 5 new discovery modules
- Implemented scope selection
- Integrated app registration management
- Added comprehensive help and documentation

---

For additional support or questions, please review the detailed documentation in the `Documentation` folder or contact your IT team.