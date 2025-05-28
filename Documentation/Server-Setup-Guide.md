# M&A Discovery Suite - Server Setup Guide

## Current Situation
You're running the validation script from `C:\UserMigration\Scripts\` but the files are currently in `d:\Scripts\UserMandA`. This guide will help you properly deploy and configure the suite on your server.

## Step 1: Deploy Files to Server

### Option A: Using the Deployment Script (Recommended)
```powershell
# From your current workspace (d:\Scripts\UserMandA)
.\Deploy-ToServer.ps1 -TargetPath "C:\UserMigration" -Force
```

### Option B: Manual Copy
Copy the entire folder structure from `d:\Scripts\UserMandA` to `C:\UserMigration\`

## Step 2: Unblock Files (Critical)
```powershell
# Navigate to the server location
cd "C:\UserMigration"

# Unblock all PowerShell files to prevent security warnings
.\Unblock-AllFiles.ps1 -Path "C:\UserMigration"
```

## Step 3: Validate Installation
```powershell
# From C:\UserMigration
.\Scripts\Validate-Installation.ps1
```

## Step 4: Fix Any Remaining Issues

### If you see "Module not found" errors:
```powershell
# Install required PowerShell modules
Install-Module -Name Microsoft.Graph -Force -Scope CurrentUser
Install-Module -Name Microsoft.Graph.Authentication -Force -Scope CurrentUser
Install-Module -Name ExchangeOnlineManagement -Force -Scope CurrentUser

# Optional modules
Install-Module -Name ActiveDirectory -Force -Scope CurrentUser
Install-Module -Name ImportExcel -Force -Scope CurrentUser
Install-Module -Name Az.Accounts -Force -Scope CurrentUser
```

### If you see path-related errors:
Ensure you're running from the correct directory (`C:\UserMigration`)

## Step 5: Test the Suite
```powershell
# Quick validation test
.\Scripts\QuickStart.ps1 -Operation Validate

# If validation passes, run a discovery test
.\Scripts\QuickStart.ps1 -Operation Discovery
```

## Expected Validation Results

After following these steps, you should see:
```
=================================================================
              M&A Discovery Suite v4.0 - Validation
=================================================================

Testing PowerShell Version...
PASS - PowerShell Version

Testing Module Structure...
PASS - Module: Modules/Authentication/Authentication.psm1
PASS - Module: Modules/Authentication/CredentialManagement.psm1
[... all modules should pass ...]

Testing Core Components...
PASS - Core: Core/MandA-Orchestrator.ps1
PASS - Core: Configuration/default-config.json
PASS - Core: Scripts/QuickStart.ps1
PASS - Core: README.md

Testing Required PowerShell Modules...
PASS - Microsoft.Graph (Required)
PASS - Microsoft.Graph.Authentication (Required)
PASS - ExchangeOnlineManagement (Required)
[... etc ...]

Overall Result: X of X tests passed
M&A Discovery Suite is ready for use!
```

## Troubleshooting

### Security Warnings
If you still see security warnings after unblocking:
```powershell
# Set execution policy (run as Administrator)
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope LocalMachine

# Or for current user only
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Module Import Errors
```powershell
# Check module availability
Get-Module -ListAvailable | Where-Object Name -like "*Graph*"

# Force reinstall if needed
Install-Module Microsoft.Graph -Force -AllowClobber
```

### Configuration Issues
```powershell
# Validate JSON syntax
$config = Get-Content ".\Configuration\default-config.json" -Raw
try { $config | ConvertFrom-Json } catch { $_.Exception.Message }
```

## Next Steps After Successful Validation

1. **Configure Authentication**:
   ```powershell
   .\Scripts\QuickStart.ps1 -Operation Validate
   ```

2. **Run Discovery**:
   ```powershell
   .\Scripts\QuickStart.ps1 -Operation Full
   ```

3. **Review Output**:
   - Check `C:\MandADiscovery\Output\` for results
   - Review logs in `C:\MandADiscovery\Output\Logs\`

## Files Included in Deployment

### Core Files
- `Core/MandA-Orchestrator.ps1` - Main orchestrator
- `Configuration/default-config.json` - Default configuration
- `Scripts/QuickStart.ps1` - Quick launcher
- `Scripts/Validate-Installation.ps1` - Installation validator
- `README.md` - Documentation

### Modules (24 total)
- **Authentication**: 2 modules
- **Connectivity**: 2 modules  
- **Discovery**: 4 modules
- **Processing**: 4 modules
- **Export**: 2 modules
- **Utilities**: 6 modules

All modules are required for full functionality.