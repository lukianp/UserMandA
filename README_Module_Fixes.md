# M&A Discovery Suite - Module Conflict Resolution

## Quick Start (Recommended)

If you encountered the Azure PowerShell module error, use the automated setup:

```powershell
.\Scripts\Run-DiscoverySetup.ps1
```

This will automatically:
1. Resolve module conflicts
2. Run the M&A Discovery Suite App Registration
3. Provide clear error messages if issues occur

## Manual Resolution

### Option 1: Fix Module Conflicts Only
```powershell
# Basic conflict resolution
.\Scripts\Fix-ModuleConflicts.ps1

# Remove AzureRM modules (recommended)
.\Scripts\Fix-ModuleConflicts.ps1 -RemoveAzureRM

# Force cleanup (requires Administrator)
.\Scripts\Fix-ModuleConflicts.ps1 -RemoveAzureRM -Force
```

### Option 2: Run Original Script with Fixes
The original script has been enhanced with better module management:
```powershell
.\Scripts\DiscoveryCreateAppRegistration.ps1
```

## Error Resolution

### Common Error: "Type initializer for 'Microsoft.Azure.Commands.Common.AzModule' threw an exception"

**Quick Fix:**
1. Close all PowerShell windows
2. Run: `.\Scripts\Run-DiscoverySetup.ps1 -RemoveAzureRM`
3. Follow the on-screen instructions

**Manual Fix:**
1. Run: `.\Scripts\Fix-ModuleConflicts.ps1 -RemoveAzureRM`
2. Close PowerShell completely
3. Open new PowerShell session
4. Run: `.\Scripts\DiscoveryCreateAppRegistration.ps1`

## Files Created/Modified

### New Files:
- `Scripts/Fix-ModuleConflicts.ps1` - Automated module conflict resolution
- `Scripts/Run-DiscoverySetup.ps1` - Complete automated setup wrapper
- `Documentation/Module_Conflict_Troubleshooting_Guide.md` - Comprehensive troubleshooting guide

### Modified Files:
- `Scripts/DiscoveryCreateAppRegistration.ps1` - Enhanced module management with better error handling

## What Was Fixed

1. **Enhanced Module Cleanup**: More comprehensive removal of conflicting modules
2. **AzureRM Detection**: Automatic detection and optional removal of legacy AzureRM modules
3. **Garbage Collection**: Force release of module assemblies from memory
4. **Fallback Import**: Alternative import methods for critical modules
5. **Better Error Messages**: Clear guidance when modules fail to load
6. **Graceful Degradation**: Continue with available modules when non-critical ones fail

## Troubleshooting

### If automated fixes don't work:

1. **Check PowerShell version**: PowerShell 7+ is recommended
   ```powershell
   $PSVersionTable.PSVersion
   ```

2. **Run as Administrator**: Some cleanup operations require elevated privileges
   ```powershell
   # Right-click PowerShell -> "Run as Administrator"
   .\Scripts\Fix-ModuleConflicts.ps1 -Force -RemoveAzureRM
   ```

3. **Manual module removal**: Complete cleanup
   ```powershell
   # Remove all Azure modules
   Get-Module -ListAvailable Az* | Uninstall-Module -Force -AllVersions
   Get-Module -ListAvailable AzureRM* | Uninstall-Module -Force -AllVersions
   ```

4. **Check execution policy**:
   ```powershell
   Get-ExecutionPolicy
   Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
   ```

### For detailed troubleshooting:
See: `Documentation/Module_Conflict_Troubleshooting_Guide.md`

## Usage Examples

### Basic Setup (Recommended)
```powershell
.\Scripts\Run-DiscoverySetup.ps1
```

### Setup with AzureRM Removal
```powershell
.\Scripts\Run-DiscoverySetup.ps1 -RemoveAzureRM
```

### Validation Only
```powershell
.\Scripts\Run-DiscoverySetup.ps1 -ValidateOnly
```

### Skip Azure Roles
```powershell
.\Scripts\Run-DiscoverySetup.ps1 -SkipAzureRoles
```

### Force Recreation
```powershell
.\Scripts\Run-DiscoverySetup.ps1 -Force
```

## Next Steps

After successful setup:
1. Verify the credentials file was created: `C:\DiscoveryData\discoverycredentials.config`
2. Review the log file: `MandADiscovery_Registration_Log.txt`
3. Proceed with environment discovery using the discovery scripts

## Support

If you continue to experience issues:
1. Review the troubleshooting guide
2. Check Windows Event Logs for PowerShell errors
3. Consider using PowerShell 7+ instead of 5.1
4. Try running in Windows Sandbox for isolated testing