# Enterprise Discovery Suite - Demo Version

## Overview

This demo package provides a fully functional preview of the Enterprise Discovery Suite with protected intellectual property. The demo runs independently without requiring the full development environment.

## Building the Demo Package

Run the build script from PowerShell:

```powershell
# Navigate to scripts directory
cd D:\Scripts\UserMandA\Scripts

# Build demo with stub modules (recommended - smallest size, IP protected)
.\Build-DemoPackage.ps1 -OutputPath "D:\DemoPackage" -DemoMode Stub

# Build demo with obfuscated modules (larger, some IP exposure risk)
.\Build-DemoPackage.ps1 -OutputPath "D:\DemoPackage" -DemoMode Obfuscated

# Build without bundled Electron (smaller, requires npm install on target)
.\Build-DemoPackage.ps1 -OutputPath "D:\DemoPackage" -DemoMode Stub -IncludeElectron:$false
```

## Package Contents

```
enterprise-discovery-demo/
├── .webpack/
│   ├── main/           # Main process bundle (Electron)
│   ├── preload/        # Preload script (IPC bridge)
│   └── renderer/       # React UI bundle
├── Modules/
│   └── Discovery/      # Protected stub modules
├── DemoData/           # Sample data files
├── node_modules/       # Electron runtime (if included)
├── package.json        # Demo package manifest
├── run-demo.bat        # Windows launcher
├── run-demo.ps1        # PowerShell launcher
└── README.md           # Usage instructions
```

## IP Protection

### Stub Mode (Recommended)
- PowerShell modules are replaced with minimal stubs
- No real discovery logic included
- Functions return realistic demo data
- Zero IP exposure

### Obfuscated Mode
- Original modules are compressed and Base64 encoded
- Provides some protection but can be reversed
- Use only for trusted evaluators

## Demo Features

### Working Components
- Complete UI with all navigation views
- Dashboard with statistics
- Discovery module views (all 55+ modules)
- Data tables with sorting/filtering
- Export functionality
- Settings and configuration panels

### Demo Limitations
- Discovery execution returns stub data
- No real Azure/AD/API connections
- Sample data pre-loaded
- No credential storage

## Running the Demo

### On Target Machine

1. **Extract** `enterprise-discovery-demo-final.zip` to any location
2. **Run the launcher**:
   - Double-click `run-demo.bat`, or
   - Run `.\run-demo.ps1` in PowerShell

### Requirements
- Windows 10/11
- **Fully standalone** - Electron is bundled (no npm install required)
- No dependency on `C:\enterprisediscovery` - app detects standalone mode automatically

## Build Automation

To automatically build a demo package during development, add to your CI/CD or run manually:

```powershell
# Quick build script
$timestamp = Get-Date -Format "yyyyMMdd-HHmm"
.\Build-DemoPackage.ps1 -OutputPath "D:\Demos\demo-$timestamp"
```

## Security Notes

- Source code is webpack bundled (not human-readable)
- PowerShell modules use stub implementations
- No credentials or API keys included
- Demo mode flag prevents real operations
- CSP headers enabled in Electron

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 2.1.0-demo | 2025-12-23 | Fully standalone - dynamic path detection, bundled Electron (304 MB) |
| 2.0.0-demo | 2025-12-23 | New build system with IP protection |
| 1.0.0-demo | 2025-12-22 | Initial demo package |

---

**Built with:** Build-DemoPackage.ps1
**Final Package:** `enterprise-discovery-demo-final.zip` (304 MB with bundled Electron)
