# Azure PowerShell Module Conflict Troubleshooting Guide

## Overview

The M&A Discovery Suite App Registration script may encounter module conflicts, particularly with Azure PowerShell modules. This guide provides comprehensive troubleshooting steps to resolve these issues.

## Common Error Symptoms

### 1. Type Initializer Exception
```
The type initializer for 'Microsoft.Azure.Commands.Common.AzModule' threw an exception.
```

### 2. Serialization Settings Error
```
Method 'get_SerializationSettings' in type 'Microsoft.Azure.Management.Internal.Resources.ResourceManagementClient' does not have an implementation.
```

### 3. Module Import Failures
```
Failed to process Az.Resources: [Various assembly loading errors]
```

## Root Causes

1. **AzureRM and Az Module Conflicts**: Legacy AzureRM modules conflict with newer Az modules
2. **Module Assembly Locking**: PowerShell sessions holding module assemblies in memory
3. **Version Mismatches**: Different versions of related modules causing compatibility issues
4. **Corrupted Module Cache**: Damaged module files in the PowerShell module cache

## Resolution Steps

### Step 1: Quick Fix (Recommended First Attempt)

1. **Close all PowerShell windows**
2. **Run the module conflict fix script**:
   ```powershell
   .\Scripts\Fix-ModuleConflicts.ps1
   ```
3. **Open a new PowerShell session**
4. **Re-run the M&A Discovery Suite script**

### Step 2: Comprehensive Cleanup

If the quick fix doesn't work:

1. **Run with AzureRM removal**:
   ```powershell
   .\Scripts\Fix-ModuleConflicts.ps1 -RemoveAzureRM
   ```

2. **Force cleanup (requires Administrator)**:
   ```powershell
   .\Scripts\Fix-ModuleConflicts.ps1 -Force -RemoveAzureRM
   ```

### Step 3: Manual Module Management

If automated fixes fail:

1. **Uninstall all Azure modules**:
   ```powershell
   # Remove AzureRM modules
   Get-Module -ListAvailable AzureRM* | Uninstall-Module -Force -AllVersions
   
   # Remove Az modules
   Get-Module -ListAvailable Az* | Uninstall-Module -Force -AllVersions
   
   # Remove Microsoft.Graph modules
   Get-Module -ListAvailable Microsoft.Graph* | Uninstall-Module -Force -AllVersions
   ```

2. **Clear module cache**:
   ```powershell
   # User modules
   Remove-Item "$env:USERPROFILE\Documents\PowerShell\Modules\Az*" -Recurse -Force -ErrorAction SilentlyContinue
   Remove-Item "$env:USERPROFILE\Documents\WindowsPowerShell\Modules\Az*" -Recurse -Force -ErrorAction SilentlyContinue
   
   # System modules (requires Administrator)
   Remove-Item "$env:ProgramFiles\WindowsPowerShell\Modules\Az*" -Recurse -Force -ErrorAction SilentlyContinue
   Remove-Item "$env:ProgramFiles\PowerShell\Modules\Az*" -Recurse -Force -ErrorAction SilentlyContinue
   ```

3. **Restart PowerShell completely**

4. **Reinstall required modules**:
   ```powershell
   Install-Module Az.Accounts -Scope CurrentUser -Force
   Install-Module Az.Resources -Scope CurrentUser -Force
   Install-Module Microsoft.Graph.Authentication -Scope CurrentUser -Force
   Install-Module Microsoft.Graph.Applications -Scope CurrentUser -Force
   Install-Module Microsoft.Graph.Identity.DirectoryManagement -Scope CurrentUser -Force
   ```

### Step 4: PowerShell Environment Reset

For persistent issues:

1. **Use PowerShell 7+ instead of 5.1**:
   - Download from: https://github.com/PowerShell/PowerShell/releases
   - PowerShell 7+ has better module isolation

2. **Reset PowerShell execution policy**:
   ```powershell
   Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
   ```

3. **Trust PowerShell Gallery**:
   ```powershell
   Set-PSRepository -Name 'PSGallery' -InstallationPolicy Trusted
   ```

## Prevention Strategies

### 1. Environment Preparation
- Always run the module conflict fix script before major operations
- Use PowerShell 7+ for better module management
- Avoid mixing AzureRM and Az modules

### 2. Module Management Best Practices
- Install modules with `-Scope CurrentUser` to avoid permission issues
- Use `-Force` and `-AllowClobber` parameters during installation
- Regularly update modules to latest versions

### 3. Session Management
- Start fresh PowerShell sessions for important operations
- Avoid long-running PowerShell sessions with many module imports
- Use `Remove-Module` to unload modules when switching contexts

## Advanced Troubleshooting

### Check Module Conflicts
```powershell
# List all Azure-related modules
Get-Module -ListAvailable | Where-Object Name -like "*Azure*" | Sort-Object Name

# Check for version conflicts
Get-Module -ListAvailable Az.Accounts | Sort-Object Version
```

### Verify Module Dependencies
```powershell
# Check module dependencies
Get-Module -ListAvailable Az.Resources | Select-Object -ExpandProperty RequiredModules
```

### Test Module Import
```powershell
# Test individual module import
try {
    Import-Module Az.Accounts -Force -ErrorAction Stop
    Write-Host "Az.Accounts imported successfully" -ForegroundColor Green
} catch {
    Write-Host "Az.Accounts import failed: $($_.Exception.Message)" -ForegroundColor Red
}
```

## Environment-Specific Solutions

### Windows PowerShell 5.1
- More prone to module conflicts
- Requires careful module management
- Consider upgrading to PowerShell 7+

### PowerShell 7+
- Better module isolation
- Improved error handling
- Recommended for complex module scenarios

### Corporate Environments
- May have restricted execution policies
- Proxy settings can affect module downloads
- Group policies may prevent module installation

## Script Modifications

The M&A Discovery Suite script has been enhanced with:

1. **Comprehensive module cleanup** before installation
2. **Fallback import methods** for critical modules
3. **Enhanced error reporting** with specific guidance
4. **Graceful degradation** when non-critical modules fail

## Support and Escalation

If all troubleshooting steps fail:

1. **Collect diagnostic information**:
   ```powershell
   $PSVersionTable
   Get-Module -ListAvailable | Where-Object Name -like "*Az*" | Format-Table Name, Version, Path
   Get-ExecutionPolicy -List
   ```

2. **Check Windows Event Logs** for PowerShell errors

3. **Consider using Windows Sandbox** for isolated testing

4. **Contact system administrator** for enterprise environments

## Quick Reference Commands

```powershell
# Quick conflict resolution
.\Scripts\Fix-ModuleConflicts.ps1 -RemoveAzureRM

# Force cleanup (Administrator required)
.\Scripts\Fix-ModuleConflicts.ps1 -Force -RemoveAzureRM

# Manual module removal
Get-Module -ListAvailable AzureRM* | Uninstall-Module -Force -AllVersions

# Fresh module installation
Install-Module Az.Accounts, Az.Resources, Microsoft.Graph.Authentication -Scope CurrentUser -Force

# Test script prerequisites
.\Scripts\DiscoveryCreateAppRegistration.ps1 -ValidateOnly
```

## Version History

- **v1.0**: Initial troubleshooting guide
- **v1.1**: Added PowerShell 7+ recommendations
- **v1.2**: Enhanced with automated fix script integration