# M&A Discovery Suite - Data Loading Configuration Summary

## Overview
This document explains the data directory structure, where discovery modules save raw files, and how the GUI loads this data.

## Data Directory Structure

The M&A Discovery Suite uses a structured approach for storing discovery data under `C:\DiscoveryData\`:

### Primary Data Location
**`C:\DiscoveryData\[CompanyName]\Raw\`**
- This is the main location where discovery modules save their output
- Contains core discovery files like:
  - `Users.csv` - User account data
  - `Groups.csv` - Security groups and distribution groups  
  - `Applications.csv` - Installed applications
  - `ServicePrincipals.csv` - Service principals
  - `DirectoryRoles.csv` - Directory roles
  - `MicrosoftTeams.csv` - Teams data
  - `SharePointSites.csv` - SharePoint sites
  - `Tenant.csv` - Tenant configuration

### Secondary Data Location  
**`C:\DiscoveryData\Profiles\[CompanyName]\Raw\`**
- Contains additional Azure/Entra ID specific discovery files:
  - `AzureApplications.csv` - Azure applications
  - `AzureResourceGroups.csv` - Azure resource groups
  - `AzureTenant.csv` - Azure tenant details
  - `EntraIDAppRegistrations.csv` - App registrations
  - `EntraIDApplicationSecrets.csv` - Application secrets
  - `EntraIDEnterpriseApps.csv` - Enterprise applications
  - `EntraIDServicePrincipals.csv` - Service principals
  - `ExchangeDistributionGroups.csv` - Exchange groups
  - `PowerPlatform_Environments.csv` - Power Platform data

### Example Structure for "ljpops" Company
```
C:\DiscoveryData\
├── ljpops\
│   ├── Raw\
│   │   ├── Users.csv
│   │   ├── Groups.csv  
│   │   ├── Applications.csv
│   │   ├── ServicePrincipals.csv
│   │   └── [other core discovery files]
│   ├── Archives\
│   ├── Backups\
│   ├── Credentials\
│   ├── Discovery\
│   ├── Exports\
│   ├── Logs\
│   ├── Reports\
│   └── Temp\
└── Profiles\
    └── ljpops\
        └── Raw\
            ├── AzureApplications.csv
            ├── EntraIDAppRegistrations.csv
            ├── AzureResourceGroups.csv
            └── [other Azure/Entra files]
```

## GUI Data Loading Configuration

### ConfigurationService Settings
- **DiscoveryDataRootPath**: `"C:\DiscoveryData"`
- **GetCompanyDataPath()**: Returns the primary company directory path
- **GetCompanyRawDataPath()**: Returns the Raw subdirectory path

### Enhanced CsvDataService Loading
The CsvDataService has been enhanced to scan **multiple data locations** for comprehensive data loading:

#### GetAllDataPaths() Method
This method searches for data in the following priority order:
1. **Primary**: `C:\DiscoveryData\[CompanyName]\Raw\`
2. **Secondary**: `C:\DiscoveryData\Profiles\[CompanyName]\Raw\`
3. **Case-insensitive fallbacks** for both locations

#### Data Loading Methods Enhanced
All data loading methods now scan multiple paths and combine results:
- **LoadUsersAsync()** - Combines user data from all paths
- **LoadInfrastructureAsync()** - Combines infrastructure data
- **LoadGroupsAsync()** - Combines group data  
- **LoadApplicationsAsync()** - Combines application data

#### Duplicate Handling
Each method removes duplicates using appropriate keys:
- **Users**: Deduplicated by UserPrincipalName, SamAccountName, or Id
- **Infrastructure**: Deduplicated by Name and Type
- **Groups**: Deduplicated by Name and Type
- **Applications**: Deduplicated by Name and DisplayName

## Problem Resolution

### Issue Identified
The GUI was only loading from the primary location (`C:\DiscoveryData\ljpops\Raw\`) and missing additional discovery data stored in the secondary location (`C:\DiscoveryData\Profiles\ljpops\Raw\`).

### Solution Implemented
1. **Enhanced CsvDataService** with `GetAllDataPaths()` method
2. **Updated all loading methods** to scan multiple directories
3. **Added duplicate removal logic** to prevent data conflicts
4. **Added debug logging** to track data path discovery

### Benefits
- ✅ **Complete Data Loading**: All discovery data from both locations is now loaded
- ✅ **No Data Loss**: Secondary location data is included in GUI
- ✅ **Duplicate Prevention**: Smart deduplication prevents conflicts
- ✅ **Backward Compatibility**: Still works with single-location setups
- ✅ **Case-Insensitive**: Handles company name case variations

## File Type Mapping

### Users Tab
- `Users.csv`, `AzureUsers.csv`, `ActiveDirectoryUsers.csv`
- `EntraIDUsers.csv`, `DirectoryUsers.csv`
- Files containing "user" or "tenant" in filename

### Infrastructure Tab  
- `PhysicalServer_*.csv` files
- `AzureResourceGroups.csv`, `AzureApplications.csv`
- `EntraIDServicePrincipals.csv`, `EntraIDAppRegistrations.csv`
- `EntraIDEnterpriseApps.csv`, `PowerPlatform_*.csv`

### Groups Tab
- `Groups.csv`, `AzureGroups.csv`, `ActiveDirectoryGroups.csv`
- `ExchangeDistributionGroups.csv`

### Applications Tab
- `Applications.csv`, `InstalledApplications.csv`
- `AzureApplications.csv`, `EntraIDAppRegistrations.csv`
- `EntraIDEnterpriseApps.csv`, `EntraIDApplicationSecrets.csv`

## Verification
The enhanced data loading can be verified through:
1. **Debug Output**: Check console for path discovery messages
2. **Data Counts**: Higher record counts indicate multiple paths loaded
3. **Tab Population**: All tabs should show comprehensive data

## Configuration Files Referenced
- `D:\Scripts\UserMandA\GUI\Services\ConfigurationService.cs`
- `D:\Scripts\UserMandA\GUI\Services\CsvDataService.cs`
- `D:\Scripts\UserMandA\GUI\Services\ProfileService.cs`

---
*Last Updated: 2025-01-06*
*Issue Resolution: Multiple data path scanning implemented*