# Prerequisites Manager - RSAT ActiveDirectory Module Setup Guide

## Overview
This document describes the automated prerequisite system implemented to resolve the "ActiveDirectory PowerShell module is not available" error in M&A Discovery Suite discovery modules.

## Problem Solved
- **Issue**: MultiDomainForestDiscovery and other AD-dependent modules failed with hard-stop errors when RSAT tools weren't installed
- **Root Cause**: Windows 11 systems often don't have Remote Server Administration Tools (RSAT) installed by default
- **Solution**: Automated prerequisites checking and installation system

## Automated Solution Components

### 1. PrerequisitesManager.psm1
**Location**: `Scripts/Prerequisites/PrerequisitesManager.psm1`

**Features**:
- ✅ Windows version detection and compatibility checking
- ✅ Administrator privilege verification
- ✅ PowerShell module availability testing
- ✅ Automatic RSAT Active Directory module installation
- ✅ Comprehensive error handling and fallback mechanisms
- ✅ Windows 10/11 RSAT installation using both DISM and Add-WindowsCapability methods
- ✅ Manual installation instructions when automatic installation fails

### 2. Enhanced Discovery Launcher
**Location**: `Scripts/DiscoveryModuleLauncher.ps1`

**Improvements**:
- ✅ Prerequisites check runs before module loading
- ✅ Automatic installation attempts for missing components
- ✅ Clear progress indicators and user feedback
- ✅ Graceful error handling with actionable guidance
- ✅ Continues execution with warnings for non-critical issues

### 3. Improved Module Error Handling
**Location**: `Modules/Discovery/MultiDomainForestDiscovery.psm1`

**Enhancements**:
- ✅ Detailed installation instructions in error messages
- ✅ Multiple installation method guidance (GUI and command-line)
- ✅ Platform-specific instructions for Windows 10 and Windows 11
- ✅ Separate error handling for module availability vs. import failures

## Usage

### Automatic Prerequisite Check
When running any discovery module through the launcher, prerequisites are automatically checked:

```powershell
.\Scripts\DiscoveryModuleLauncher.ps1 -ModuleName "MultiDomainForestDiscovery" -CompanyName "YourCompany"
```

### Manual Prerequisites Check
You can also run prerequisites check manually:

```powershell
Import-Module .\Scripts\Prerequisites\PrerequisitesManager.psm1
$prereqCheck = Invoke-PrerequisitesCheck -ModuleName "MultiDomainForestDiscovery" -Install -Interactive:$false
```

## Installation Methods Supported

### 1. Automatic Installation (Recommended)
The system automatically attempts these methods in order:
1. **Add-WindowsCapability** (Windows 10/11 modern method)
2. **DISM.exe** (Command-line deployment method)
3. **Fallback manual instructions**

### 2. Manual Installation Instructions

#### Windows 11
1. Press `Win + I` to open Settings
2. Go to `Apps` > `Optional features`
3. Click `View features`
4. Search for `RSAT: Active Directory Domain Services Tools`
5. Check the checkbox and click `Install`
6. Wait for completion and restart PowerShell

#### Windows 10
1. Press `Win + I` to open Settings
2. Go to `Apps` > `Apps & features` > `Optional features`
3. Click `Add a feature`
4. Search for `RSAT: Active Directory Domain Services and Lightweight Directory Services Tools`
5. Click `Install`
6. Wait for completion and restart PowerShell

#### Command Line (Windows 10/11)
```powershell
# Run PowerShell as Administrator
dism /online /Add-Capability /CapabilityName:Rsat.ActiveDirectory.DS-LDS.Tools~~~~0.0.1.0
```

## Error Messages and Solutions

### "ActiveDirectory module is not available"
- **Cause**: RSAT tools not installed
- **Solution**: Follow installation instructions above
- **Automatic Resolution**: System will attempt installation if `-Install` parameter is used

### "Failed to import ActiveDirectory module"
- **Cause**: RSAT installed but import failed
- **Solution**: Check permissions, restart PowerShell, verify installation
- **Common Fix**: Restart PowerShell session after RSAT installation

### "Administrator privileges required"
- **Cause**: RSAT installation requires elevated privileges
- **Solution**: Run PowerShell as Administrator
- **Prevention**: Launch discovery with admin privileges

## Compatibility

### Supported Operating Systems
- ✅ Windows 10 (1809+)
- ✅ Windows 11 (all versions)
- ✅ Windows Server 2016+
- ✅ Windows Server 2019+
- ✅ Windows Server 2022+

### Unsupported Scenarios
- ❌ Windows 7/8/8.1 (RSAT installation methods differ)
- ❌ Non-Windows operating systems
- ❌ Windows builds without RSAT capabilities

## Troubleshooting

### Prerequisites Check Shows Red Warnings
- Run PowerShell as Administrator
- Check Windows version compatibility
- Verify internet connectivity for online installation

### Installation Fails Silently
- Check Windows Event Logs for errors
- Try manual installation method
- Consider downloading and installing RSAT MSU package manually

### Module Import Still Fails After Installation
- Restart PowerShell session completely
- Check environment path variables
- Verify module files are present in `C:\Windows\System32\WindowsPowerShell\v1.0\Modules\ActiveDirectory`

## Future Improvements

### Planned Enhancements
- [ ] Support for Windows Server Core installations
- [ ] Offline RSAT package detection and installation
- [ ] Proxy server compatibility for online installations
- [ ] Enhanced error reporting with diagnostic information
- [ ] Integration with other discovery modules (Azure, Exchange, etc.)

### Additional Module Support
The PrerequisitesManager framework is extensible and can be enhanced to support:
- Azure PowerShell modules (`Az` or `AzureRM`)
- Exchange Online Management module
- SharePoint Online Management Shell
- Teams PowerShell module

## Technical Notes

### PrerequisitesManager Architecture
- **Class-based design**: Uses PowerShell classes for type safety and organization
- **Modular validation**: Separate functions for different validation types
- **Fallback mechanisms**: Multiple installation methods with graceful degradation
- **Logging integration**: Compatible with existing ComprehensiveErrorHandling system

### Security Considerations
- Installation requires administrator privileges
- Changes Windows Optional Features (requires restart)
- No third-party dependencies required
- All operations use built-in Windows APIs

## Version History

### v1.0.0 (2025-09-02)
- ✅ Initial implementation
- ✅ Windows 10/11 RSAT automatic installation
- ✅ Enhanced discovery launcher integration
- ✅ Comprehensive error messages and guidance
- ✅ Manual installation fallback instructions

---

## Quick Reference

### Quick Commands
```powershell
# Check prerequisites
.\Scripts\Prerequisites\PrerequisitesManager.psm1
Invoke-PrerequisitesCheck -ModuleName "MultiDomainForestDiscovery"

# Install RSAT manually (Admin required)
dism /online /Add-Capability /CapabilityName:Rsat.ActiveDirectory.DS-LDS.Tools~~~~0.0.1.0

# Run discovery with automatic prerequisites
.\Scripts\DiscoveryModuleLauncher.ps1 -ModuleName "MultiDomainForestDiscovery" -CompanyName "YourCompany"
```

### Emergency Manual Steps
1. Open PowerShell as Administrator
2. Run: `Get-WindowsCapability -Name "Rsat.ActiveDirectory*" -Online`
3. Run: `Add-WindowsCapability -Online -Name "Rsat.ActiveDirectory.DS-LDS.Tools~~~~0.0.1.0"`
4. Restart PowerShell
5. Test: `Import-Module ActiveDirectory`

---

*This solution ensures smooth deployment and operation of Active Directory-dependent discovery modules across Windows 10 and Windows 11 environments.*