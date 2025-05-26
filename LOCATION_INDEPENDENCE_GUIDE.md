# M&A Discovery Suite - Location Independence Guide

## Overview

The M&A Discovery Suite has been updated to be completely location-independent, allowing it to run from any directory on any Windows system without requiring hardcoded paths or manual configuration changes.

## Key Changes

### 1. Dynamic Path Resolution
- All scripts now use `$PSScriptRoot` and dynamic path resolution
- No more hardcoded paths like `C:\Scripts` or `D:\temp`
- Suite automatically detects its location and adjusts all paths accordingly

### 2. New Environment Setup Script
**File:** `Scripts\Set-SuiteEnvironment.ps1`

This script provides:
- Automatic suite root detection
- Global variables for all key paths
- Helper functions for module and configuration path resolution
- Consistent environment setup across all scripts

### 3. Updated Core Scripts

#### MandA-Orchestrator.ps1
- Uses `$script:SuiteRoot` for all path operations
- Dynamic module loading based on suite location
- Configuration file path resolution

#### QuickStart.ps1
- Sources environment setup automatically
- Location-independent orchestrator execution
- Robust path validation

#### Validate-Installation.ps1
- All validation tests use suite root-relative paths
- Works from any location
- Validates location independence

## Usage Examples

### Running from Different Locations

```powershell
# From C:\Scripts\UserMandA
C:\Scripts\UserMandA> .\Scripts\QuickStart.ps1 -Operation Validate

# From D:\temp\MandA
D:\temp\MandA> .\Scripts\QuickStart.ps1 -Operation Validate

# From any custom location
E:\MyProjects\Discovery> .\Scripts\QuickStart.ps1 -Operation Full
```

### Testing Location Independence

```powershell
# Test current location
.\Scripts\Test-LocationIndependence.ps1

# Test by copying to a different location
.\Scripts\Test-LocationIndependence.ps1 -TestLocation "C:\Temp\TestSuite"
```

### Deployment to Server

```powershell
# Deploy to any target location
.\Deploy-ToServer.ps1 -TargetPath "C:\UserMigration" -Force
.\Deploy-ToServer.ps1 -TargetPath "D:\Scripts\MandA" -Force
.\Deploy-ToServer.ps1 -TargetPath "E:\Tools\Discovery" -Force
```

## Environment Variables

When `Set-SuiteEnvironment.ps1` is sourced, the following global variables are available:

| Variable | Description | Example |
|----------|-------------|---------|
| `$global:MandASuiteRoot` | Root directory of the suite | `C:\Scripts\UserMandA` |
| `$global:MandACorePath` | Core scripts directory | `C:\Scripts\UserMandA\Core` |
| `$global:MandAConfigPath` | Configuration directory | `C:\Scripts\UserMandA\Configuration` |
| `$global:MandAScriptsPath` | Scripts directory | `C:\Scripts\UserMandA\Scripts` |
| `$global:MandAModulesPath` | Modules root directory | `C:\Scripts\UserMandA\Modules` |
| `$global:MandAOrchestratorPath` | Main orchestrator script | `C:\Scripts\UserMandA\Core\MandA-Orchestrator.ps1` |

## Helper Functions

### Get-MandAModulePath
```powershell
# Get path to a specific module
$loggingModule = Get-MandAModulePath -Category "Utilities" -ModuleName "Logging"
```

### Get-MandAModulesInCategory
```powershell
# Get all modules in a category
$discoveryModules = Get-MandAModulesInCategory -Category "Discovery"
```

### Resolve-MandAConfigPath
```powershell
# Resolve configuration file path (relative or absolute)
$configPath = Resolve-MandAConfigPath -ConfigFile ".\Configuration\custom-config.json"
```

## Validation and Testing

### Location Independence Test
The `Test-LocationIndependence.ps1` script validates:
- Environment setup functionality
- Path resolution accuracy
- Script execution capability
- Syntax validation
- Cross-location compatibility

### Installation Validation
The updated `Validate-Installation.ps1` script:
- Uses location-independent paths
- Validates all components relative to suite root
- Tests module import capability
- Verifies configuration file accessibility

## Migration from Previous Versions

### For Existing Installations
1. No changes required - existing installations will work automatically
2. Run `.\Scripts\Test-LocationIndependence.ps1` to verify
3. Optionally run `.\Scripts\Validate-Installation.ps1` to confirm

### For New Deployments
1. Copy suite to any desired location
2. Run `.\Scripts\Test-LocationIndependence.ps1`
3. Run `.\Scripts\Validate-Installation.ps1`
4. Execute `.\Scripts\QuickStart.ps1 -Operation Validate`

## Best Practices

### 1. Always Use Relative Paths
```powershell
# Good
$configPath = Join-Path $global:MandASuiteRoot "Configuration\custom-config.json"

# Avoid
$configPath = "C:\Scripts\UserMandA\Configuration\custom-config.json"
```

### 2. Source Environment Setup
```powershell
# At the beginning of custom scripts
$envSetupPath = Join-Path (Split-Path $PSScriptRoot -Parent) "Scripts\Set-SuiteEnvironment.ps1"
. $envSetupPath
```

### 3. Use Helper Functions
```powershell
# Use helper functions for module paths
$modulePath = Get-MandAModulePath -Category "Utilities" -ModuleName "Logging"
Import-Module $modulePath
```

## Troubleshooting

### Common Issues

1. **"Module not found" errors**
   - Ensure you're running from the correct directory
   - Verify the suite structure is intact
   - Run `Test-LocationIndependence.ps1`

2. **Configuration file not found**
   - Check that configuration files exist in the Configuration directory
   - Verify relative paths in script parameters

3. **Permission errors**
   - Run `.\Unblock-AllFiles.ps1` to remove download restrictions
   - Ensure proper execution policy: `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser`

### Diagnostic Commands
```powershell
# Test location independence
.\Scripts\Test-LocationIndependence.ps1

# Validate installation
.\Scripts\Validate-Installation.ps1

# Check environment setup
.\Scripts\Set-SuiteEnvironment.ps1

# Verify paths
Get-Variable -Name "MandA*" -Scope Global
```

## Support

For issues related to location independence:
1. Run the diagnostic commands above
2. Check the test results from `Test-LocationIndependence.ps1`
3. Verify all required files are present using `Validate-Installation.ps1`
4. Ensure proper PowerShell execution policy and file permissions

The suite is now fully portable and can be deployed to any Windows environment without modification.