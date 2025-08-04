# 🎯 Foolproof Module Registry System

## Problem Solved

**Before**: Every time we made major updates, GUI module names would get out of sync with actual PowerShell module files, causing module loading failures.

**After**: The new Module Registry System ensures GUI tiles **ALWAYS** correctly link to discovery modules, regardless of future updates.

## 📋 How It Works

### 1. **Central Registry (ModuleRegistry.json)**
- Single source of truth for all module definitions
- Maps GUI display info to actual module file paths  
- Includes metadata: icons, categories, descriptions, priorities, timeouts
- Auto-validated against filesystem

### 2. **Registry Service (ModuleRegistryService.cs)**
- Loads registry on application startup
- Validates all entries against actual files
- Auto-discovers new modules
- Reports mismatches immediately

### 3. **Auto-Discovery & Validation**
- Scans filesystem for .psm1 files
- Compares with registry entries
- Identifies missing/new modules
- Provides health scoring

### 4. **Management Tools**
- PowerShell script for easy management
- Console application for detailed operations
- Auto-fix capabilities

## 🚀 Quick Start

### Fix Any Issues Right Now
```powershell
# Navigate to tools directory
cd "D:\Scripts\UserMandA\GUI\Tools"

# Auto-fix all registry issues
.\Manage-ModuleRegistry.ps1 -Command fix
```

### Check System Health
```powershell
# Generate comprehensive health report
.\Manage-ModuleRegistry.ps1 -Command health
```

### List All Modules
```powershell
# Show all registered modules by category
.\Manage-ModuleRegistry.ps1 -Command list
```

## 📁 File Structure

```
D:\Scripts\UserMandA\GUI\
├── Configuration\
│   └── ModuleRegistry.json          # ← Single source of truth
├── Services\
│   └── ModuleRegistryService.cs     # ← Core registry service
├── Utilities\
│   └── ModuleRegistryGenerator.cs   # ← Auto-generation utilities
├── Tools\
│   ├── Manage-ModuleRegistry.ps1    # ← PowerShell management script
│   └── ModuleRegistryManager.cs     # ← Console application
└── Documentation\
    └── ModuleRegistrySystem.md      # ← This documentation
```

## 🔧 Available Commands

| Command | Purpose | When to Use |
|---------|---------|-------------|
| `fix` | Auto-fix all issues | **After any module changes** |
| `validate` | Check registry health | Before important deployments |
| `health` | Detailed health report | Troubleshooting |
| `generate` | Create new registry | Setting up from scratch |
| `merge` | Add discovered modules | When new modules are added |
| `list` | Show all modules | Understanding current state |

## 🛠️ Common Scenarios

### After Adding New Modules
```powershell
# Automatically discover and register new modules
.\Manage-ModuleRegistry.ps1 -Command fix
```

### Before Major Deployment
```powershell
# Validate everything is healthy
.\Manage-ModuleRegistry.ps1 -Command validate
```

### After Module Refactoring
```powershell
# Comprehensive health check
.\Manage-ModuleRegistry.ps1 -Command health
```

### Setting Up New Environment
```powershell
# Generate fresh registry from filesystem
.\Manage-ModuleRegistry.ps1 -Command generate
```

## 📊 Registry Structure

The `ModuleRegistry.json` file contains:

```json
{
  "version": "1.0",
  "lastUpdated": "2025-01-04T00:00:00Z",
  "basePaths": {
    "modulesRoot": "Modules",
    "scriptsRoot": "Scripts"
  },
  "modules": {
    "AzureDiscovery": {
      "displayName": "Azure AD Discovery",
      "description": "Discover Azure AD users, groups, and applications",
      "filePath": "Discovery/AzureDiscovery.psm1",
      "category": "Identity",
      "icon": "☁️",
      "priority": 1,
      "enabled": true,
      "timeout": 300
    }
    // ... more modules
  }
}
```

## 🎯 Benefits

### ✅ **Foolproof Operation**
- No more manual module name mapping
- Registry auto-validates against filesystem
- Immediate detection of missing modules

### ✅ **Future-Proof**
- New modules auto-discovered
- Changes automatically detected
- Consistent across all environments

### ✅ **Easy Maintenance**
- Single PowerShell command fixes issues
- Comprehensive health reporting
- Clear error messages and guidance

### ✅ **Developer Friendly**
- Registry can be regenerated from filesystem
- Version controlled configuration
- Extensible for new module types

## 🔍 Troubleshooting

### "Module not found" Errors
```powershell
# Auto-fix will resolve path mismatches
.\Manage-ModuleRegistry.ps1 -Command fix
```

### GUI Shows Wrong Module Count
```powershell
# Validate and merge new modules
.\Manage-ModuleRegistry.ps1 -Command validate
.\Manage-ModuleRegistry.ps1 -Command merge
```

### Registry Corruption
```powershell
# Regenerate from filesystem
.\Manage-ModuleRegistry.ps1 -Command generate
```

### Performance Issues
```powershell
# Check for module timeout issues
.\Manage-ModuleRegistry.ps1 -Command health
```

## 🚀 Integration with Build Process

### Update Build-GUI.ps1
Add registry validation to your build process:

```powershell
# Add this to Build-GUI.ps1 after module copying
Write-Host "Validating module registry..." -ForegroundColor Yellow
& ".\Tools\Manage-ModuleRegistry.ps1" -Command validate
if ($LASTEXITCODE -ne 0) {
    Write-Warning "Registry issues detected. Auto-fixing..."
    & ".\Tools\Manage-ModuleRegistry.ps1" -Command fix
}
```

### Pre-Commit Hook
Create `.git/hooks/pre-commit`:

```bash
#!/bin/bash
echo "Validating module registry..."
powershell -File "GUI/Tools/Manage-ModuleRegistry.ps1" -Command validate
if [ $? -ne 0 ]; then
    echo "❌ Registry validation failed. Please run fix command."
    exit 1
fi
```

## 📈 Monitoring & Alerts

### Health Score Monitoring
```powershell
# Get health score for monitoring
$report = .\Manage-ModuleRegistry.ps1 -Command health
if ($report.HealthScore -lt 95) {
    # Send alert
    Write-Warning "Registry health below 95%: $($report.HealthScore)%"
}
```

### Automated Fixes
```powershell
# Daily automated maintenance
$schedule = New-ScheduledTaskTrigger -Daily -At 2AM
$action = New-ScheduledTaskAction -Execute "powershell.exe" -Argument "-File 'C:\Scripts\Tools\Manage-ModuleRegistry.ps1' -Command fix"
Register-ScheduledTask -TaskName "RegistryMaintenance" -Trigger $schedule -Action $action
```

## 🎯 Best Practices

### 1. **Always Run Fix After Changes**
```powershell
# After adding/removing/moving modules
.\Manage-ModuleRegistry.ps1 -Command fix
```

### 2. **Validate Before Deployment**
```powershell
# Before important releases
.\Manage-ModuleRegistry.ps1 -Command validate
```

### 3. **Monitor Health Regularly**
```powershell
# Weekly health checks
.\Manage-ModuleRegistry.ps1 -Command health
```

### 4. **Version Control the Registry**
- Commit `ModuleRegistry.json` changes
- Review registry diffs in pull requests
- Document module additions/removals

## 🔧 Advanced Usage

### Custom Root Paths
```powershell
# Work with different environments
.\Manage-ModuleRegistry.ps1 -Command fix -RootPath "C:\MyCustomLocation"
```

### Verbose Output
```powershell
# Detailed troubleshooting
.\Manage-ModuleRegistry.ps1 -Command health -Verbose
```

### Programmatic Access
```csharp
// Use in C# code
var service = ModuleRegistryService.Instance;
var modules = await service.GetAvailableModulesAsync();
var report = await service.GenerateHealthReportAsync();
```

## 📞 Support

### Quick Commands Reference
```powershell
# Show help
.\Manage-ModuleRegistry.ps1 -Command help

# Fix everything (most common)
.\Manage-ModuleRegistry.ps1 -Command fix

# Check health
.\Manage-ModuleRegistry.ps1 -Command health
```

### Common Exit Codes
- `0` = Success
- `1` = Issues found (check output)
- `Other` = System error

---

## 🎉 Result

**No more module mapping issues!** The registry system ensures that:

- ✅ GUI tiles always find their modules
- ✅ New modules are automatically discovered  
- ✅ Missing modules are immediately detected
- ✅ Changes are automatically validated
- ✅ System is completely self-maintaining

**One command fixes everything**: `.\Manage-ModuleRegistry.ps1 -Command fix`