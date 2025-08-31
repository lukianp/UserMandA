# Company Profiles & Environment Detection

**Implementation Status**: ✅ **COMPLETED** (T-000)  
**Version**: 2.0  
**Last Updated**: August 31, 2025

## Executive Summary

The M&A Discovery Suite now features a comprehensive dual-profile system that separates source company discovery from target migration environments. This architecture enables seamless management of both discovery data collection and migration execution across different organizational environments.

## Key Features

- **Dual-Profile Architecture**: Separate Source and Target profile management
- **Environment Detection**: Automatic identification of On-Premises, Azure, or Hybrid environments  
- **Connection Testing**: Real-time connectivity validation for both source and target profiles
- **App Registration Setup**: Automated Azure AD application configuration for target tenants
- **Secure Credential Storage**: DPAPI-encrypted credential management with Windows integration
- **Persistent Configuration**: Profile selections and environment status saved across sessions

## Architecture Overview

### Source Company Profile (Discovery)
- **Purpose**: Manages discovery data collection from the organization being assessed
- **Data Location**: `C:\discoverydata\<company>\Profiles\`
- **Focus**: Asset inventory, user enumeration, infrastructure discovery
- **Connection Type**: Read-only discovery operations

### Target Company Profile (Migration)
- **Purpose**: Manages destination tenant configuration for migration operations
- **Data Location**: `C:\discoverydata\<source-company>\Configuration\target-profiles.json`
- **Focus**: Migration execution, credential management, service connectivity
- **Connection Type**: Read/write migration operations

## Getting Started

### 1. Source Profile Setup

#### Creating a New Source Profile
1. Launch the M&A Discovery Suite
2. In the **Source Company Profile** section, click the **"+" button**
3. Enter the company name (e.g., "AcquiredCorp")
4. Click **Create** to establish the profile structure
5. The system creates: `C:\discoverydata\acquiredcorp\` with subdirectories

#### Selecting an Existing Source Profile
1. Click the **Source Company Profile dropdown**
2. Select from available profiles (auto-discovered from `C:\discoverydata\`)
3. Click the **"→" button** to switch active profiles
4. The system loads discovery data and refreshes the interface

#### Testing Source Connection
1. Select a source profile from the dropdown
2. Click the **"Test Connection"** button
3. The system validates:
   - Discovery data directory access
   - File permissions and readability
   - Data consistency and completeness
4. Results display connection status and any issues found

### 2. Target Profile Setup

#### Understanding Target Profiles
Target profiles represent migration destination tenants and require:
- **Azure Tenant Information**: Tenant ID, domain name
- **Application Registration**: Client ID and Client Secret for API access
- **Service Endpoints**: Exchange Online, SharePoint Online, Graph API URLs
- **Administrative Credentials**: Global admin or application-specific permissions

#### Creating a Target Profile

**Step 1: Access Target Profile Management**
1. In the **Target Company Profile** section, click the **"⚙" (Manage)** button
2. The Target Profiles Management window opens

**Step 2: Create New Target Profile**
1. Click **"Add New Target Profile"**
2. Fill in basic information:
   - **Profile Name**: Descriptive name (e.g., "Contoso-Production")
   - **Tenant ID**: Azure AD Tenant ID (GUID format)
   - **Domain**: Primary domain (e.g., "contoso.onmicrosoft.com")

**Step 3: Configure Application Registration**
1. Click **"Setup App Registration"** 
2. Choose setup method:
   - **Automatic**: System creates and configures the application
   - **Manual**: Enter existing application details
   - **Import**: Load from exported configuration file

**Step 4: Automatic App Registration Process**
1. System prompts for Global Administrator credentials
2. Connects to target Azure AD tenant
3. Creates application named: "MandA-Discovery-Suite-Migration"
4. Configures required API permissions:
   - `User.ReadWrite.All`
   - `Group.ReadWrite.All`
   - `Directory.ReadWrite.All`
   - `Mail.ReadWrite`
   - `Sites.FullControl.All`
   - `Application.ReadWrite.All`
5. Generates and stores client secret securely
6. Grants admin consent for permissions

**Step 5: Test and Validate**
1. System automatically tests the configuration
2. Validates Graph API connectivity
3. Confirms permission grants
4. Displays test results and any issues

#### Manual App Registration
If automatic setup isn't available, follow these steps in Azure Portal:

**Azure Portal Configuration**:
1. Navigate to **Azure Active Directory > App registrations**
2. Click **"New registration"**
3. Set name: **"MandA-Discovery-Suite-Migration"**
4. Set redirect URI: **Public client (mobile & desktop)** - `urn:ietf:wg:oauth:2.0:oob`
5. Click **Register**

**API Permissions**:
1. Go to **API permissions** tab
2. Click **"Add a permission"**
3. Select **Microsoft Graph**
4. Choose **Application permissions**
5. Add required permissions (listed above)
6. Click **"Grant admin consent"**

**Client Secret**:
1. Go to **Certificates & secrets** tab
2. Click **"New client secret"**
3. Set description: **"MandA Suite Migration"**
4. Set expiration: **24 months** (recommended)
5. Copy the secret value immediately (not visible later)

**Manual Entry in M&A Suite**:
1. In Target Profile Management, select **Manual Setup**
2. Enter **Application (client) ID**
3. Enter **Client Secret**
4. Click **Test Connection** to validate

### 3. Environment Detection

The system automatically detects the operational environment to optimize module availability and configuration.

#### Detected Environment Types
- **On-Premises**: Domain-joined with Active Directory infrastructure
- **Azure**: Azure AD-joined cloud-native environment
- **Hybrid**: Combined on-premises and cloud infrastructure
- **Unknown**: Unable to determine or mixed environment

#### Detection Signals
The system evaluates multiple signals to determine environment type:

**On-Premises Indicators**:
- Domain membership (`$env:USERDOMAIN`)
- Active Directory domain controllers
- Exchange Server presence
- File server infrastructure
- SQL Server instances

**Azure Indicators**:
- Azure AD join status (`dsregcmd /status`)
- Microsoft 365 service connectivity
- Azure subscription access
- Cloud service dependencies

**Hybrid Indicators**:
- Azure AD Connect synchronization
- Exchange hybrid configuration
- Shared mailbox infrastructure
- Cross-cloud authentication

#### Manual Environment Override
If automatic detection is incorrect:
1. Click the **Environment Status** indicator
2. Select **"Override Environment Detection"**
3. Choose the correct environment type
4. Confirm the override
5. System updates module availability accordingly

## Connection Testing

### Source Connection Testing
Tests the ability to read and process discovery data:

**Validation Steps**:
1. **Data Directory Access**: Verifies path exists and is readable
2. **File Permissions**: Confirms necessary read permissions
3. **Data Integrity**: Validates CSV file formats and structure
4. **Module Compatibility**: Checks discovery module requirements

**Results Interpretation**:
- ✅ **Success**: All validation checks passed
- ⚠️ **Warning**: Minor issues detected (e.g., missing optional data)
- ❌ **Error**: Critical issues prevent operation (e.g., access denied)

### Target Connection Testing
Tests the ability to perform migration operations:

**Validation Steps**:
1. **Azure AD Authentication**: Validates tenant access and credentials
2. **Graph API Connectivity**: Tests Microsoft Graph API access
3. **Service Permissions**: Verifies required API permission grants
4. **Exchange Online**: Tests mailbox access and migration capabilities
5. **SharePoint Online**: Validates site and document access
6. **License Validation**: Confirms required service licenses

**Results Interpretation**:
- ✅ **Connected**: All services accessible with proper permissions
- ⚠️ **Limited**: Some services accessible, others require attention
- ❌ **Failed**: Critical connectivity or permission issues

### Troubleshooting Connection Issues

#### Common Source Profile Issues
| Issue | Cause | Solution |
|-------|-------|----------|
| "Data directory not found" | Profile path doesn't exist | Run discovery for the source company first |
| "Access denied" | Insufficient file permissions | Run as administrator or check folder permissions |
| "Invalid data format" | Corrupted CSV files | Re-run specific discovery modules |
| "Module requirements not met" | Missing PowerShell modules | Install required modules or run setup |

#### Common Target Profile Issues
| Issue | Cause | Solution |
|-------|-------|----------|
| "Authentication failed" | Invalid credentials or expired secret | Regenerate client secret or re-authenticate |
| "Insufficient permissions" | Missing API permissions | Grant admin consent for required permissions |
| "Tenant not found" | Incorrect tenant ID | Verify tenant ID in Azure portal |
| "Service unavailable" | Target service not licensed | Ensure proper Microsoft 365 licenses |

## Advanced Configuration

### Profile Data Locations
```
Source Profiles:
├── C:\discoverydata\<company>\
│   ├── Profiles\
│   │   └── company-profile.json
│   ├── Raw\
│   │   └── (discovery module outputs)
│   └── Processed\
│       └── (processed data files)

Target Profiles:
├── C:\discoverydata\<source-company>\Configuration\
│   ├── target-profiles.json (encrypted)
│   ├── app-registrations\
│   │   └── <profile-id>.json
│   └── connection-cache\
       └── <profile-id>-status.json
```

### Environment Detection Cache
Environment status is cached for performance:
- **Cache Duration**: 60 minutes (configurable)
- **Cache Location**: `%TEMP%\MandADiscoverySuite\environment-cache.json`
- **Manual Refresh**: Click **"Refresh Environment Status"** button
- **Automatic Refresh**: Triggered by profile changes

### Security Considerations

#### Credential Protection
- **DPAPI Encryption**: All secrets encrypted with Windows Data Protection API
- **User Scope**: Encryption tied to current Windows user account
- **Storage Security**: Encrypted data stored in protected user directories
- **Memory Protection**: SecureString usage for in-memory credential handling

#### Audit Logging
All profile and connection operations are logged:
- **Connection Attempts**: Success/failure with timestamps
- **Profile Changes**: Creation, modification, deletion events
- **Environment Detection**: Detection results and confidence levels
- **Error Events**: Detailed error information for troubleshooting

#### Best Practices
1. **Regular Secret Rotation**: Update client secrets every 12-24 months
2. **Least Privilege**: Grant only necessary API permissions
3. **Environment Separation**: Use different profiles for dev/test/prod
4. **Backup Configuration**: Export target profile configurations for disaster recovery
5. **Monitor Usage**: Review audit logs for unauthorized access attempts

## Migration Workflow Integration

### Profile Selection Impact
The selected profiles determine available migration capabilities:

**Source Profile Determines**:
- Available user accounts for migration
- Source mailbox inventory
- File share and document libraries
- Security groups and permissions
- Infrastructure dependencies

**Target Profile Determines**:
- Destination tenant capabilities
- Available license types
- Migration service limitations
- Security policy constraints
- Compliance requirements

### Wave Planning Integration
Migration waves utilize both profiles:
1. **Discovery Data**: Source profile provides migration candidates
2. **Capacity Planning**: Target profile determines migration limits
3. **Dependency Mapping**: Cross-profile analysis for migration order
4. **Validation Rules**: Profile-specific validation requirements
5. **Rollback Planning**: Profile-aware rollback procedures

## API Reference

### Profile Service Methods
```csharp
// Source Profile Management
CompanyProfile GetActiveSourceProfile()
void SetActiveSourceProfile(string profileName)
List<CompanyProfile> GetAvailableSourceProfiles()

// Target Profile Management  
TargetProfile GetActiveTargetProfile()
void SetActiveTargetProfile(string profileId)
List<TargetProfile> GetTargetProfiles(string sourceCompany)

// Connection Testing
ConnectionTestResult TestSourceConnection(CompanyProfile profile)
ConnectionTestResult TestTargetConnection(TargetProfile profile)

// Environment Detection
EnvironmentStatus DetectEnvironment(CompanyProfile profile)
EnvironmentCapabilities GetEnvironmentCapabilities()
```

### Configuration Properties
```json
{
  "profiles": {
    "activeSourceProfileName": "acquiredcorp",
    "activeTargetProfileId": "12345678-1234-1234-1234-123456789012",
    "lastEnvironmentDetection": "2025-08-31T10:00:00Z",
    "environmentDetectionInterval": 3600
  },
  "connectionTesting": {
    "timeoutSeconds": 30,
    "retryAttempts": 3,
    "cacheResultsMinutes": 15
  },
  "security": {
    "requireEncryption": true,
    "auditConnectionTests": true,
    "credentialCacheMinutes": 30
  }
}
```

## Success Criteria Verification

### ✅ Dual Profile System
- **Requirement**: "The UI displays separate 'Source Company Profile' and 'Target Company Profile' dropdowns populated from the discovery data directory"
- **Implementation**: Complete with dropdown selectors, management buttons, and persistent selection

### ✅ Target Profile Configuration  
- **Requirement**: "Selecting a target profile updates configuration and is reflected in the migration view"
- **Implementation**: Target profile changes trigger environment refresh and migration view updates

### ✅ Connection Testing
- **Requirement**: "'Test Connection' actions verify connectivity to both source and target using stored credentials"
- **Implementation**: Comprehensive connection testing with detailed result reporting

### ✅ Environment Detection
- **Requirement**: "Environment detection status (On-Premises, Azure, Hybrid) is visible to the user and influences which discovery modules are enabled"
- **Implementation**: Real-time environment detection with module filtering and status display

## Support and Troubleshooting

### Getting Help
- **Documentation**: This guide covers most common scenarios
- **Logs**: Check `%TEMP%\MandADiscoverySuite\Logs\` for detailed error information
- **Support**: Contact your M&A Discovery Suite administrator

### Known Limitations
1. **Single Tenant**: Each target profile supports one Azure tenant
2. **Windows Authentication**: DPAPI encryption requires Windows environment
3. **Network Dependencies**: Connection testing requires internet access for cloud services
4. **Permission Requirements**: Some operations require administrative privileges

### Changelog
- **v2.0**: Initial T-000 implementation with dual-profile system
- **v2.0.1**: Added app registration automation
- **v2.0.2**: Enhanced connection testing and error reporting
- **v2.0.3**: Improved environment detection accuracy

---

*This documentation is automatically generated from T-000: Source and Target Company Profiles & Environment Detection implementation. For technical details, refer to the architecture documentation and source code.*