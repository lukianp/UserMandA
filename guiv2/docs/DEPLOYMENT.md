# M&A Discovery Suite GUI v2 - Deployment Guide

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Building for Production](#building-for-production)
3. [Creating Installers](#creating-installers)
4. [Configuration](#configuration)
5. [Installation](#installation)
6. [Troubleshooting](#troubleshooting)

## Prerequisites

### Development Environment

- Node.js 18.x or higher
- npm 9.x or higher
- PowerShell 7.x or higher
- Windows 10/11 or Windows Server 2019+

### Build Tools

- Visual Studio Build Tools (for native modules)
- Windows SDK
- Git

## Building for Production

### 1. Install Dependencies

```bash
cd D:/Scripts/UserMandA/guiv2
npm install
```

### 2. Run Tests

```bash
npm test                  # Unit tests
npm run test:e2e          # E2E tests
npm run test:coverage     # Coverage report
```

### 3. Build Production Package

```bash
npm run package
```

This creates a packaged application in `out/`.

### 4. Analyze Bundle Size

```bash
npm run analyze
npm run check-size
```

Verify:
- Initial bundle < 5MB
- Total bundle < 15MB

## Creating Installers

### Windows Installer (Squirrel)

```bash
npm run make
```

This creates:
- `out/make/squirrel.windows/x64/Setup.exe` - Installer
- `out/make/squirrel.windows/x64/RELEASES` - Update manifest
- `out/make/squirrel.windows/x64/*.nupkg` - Update package

### Portable Zip

```bash
npm run make -- --targets @electron-forge/maker-zip
```

Creates a portable ZIP file in `out/make/zip/`.

## Configuration

### Application Configuration

Create `config/production.json`:

```json
{
  "appName": "M&A Discovery Suite",
  "appId": "com.yourorg.manda-discovery",
  "version": "1.0.0",
  "scriptsPath": "C:\\Program Files\\M&A Discovery Suite\\Scripts",
  "modulesPath": "C:\\Program Files\\M&A Discovery Suite\\Modules",
  "dataPath": "%APPDATA%\\M&A Discovery Suite",
  "logging": {
    "level": "info",
    "maxFileSize": "10MB",
    "maxFiles": 5
  },
  "powerShell": {
    "executablePath": "pwsh.exe",
    "maxSessions": 10,
    "sessionTimeout": 300000
  }
}
```

### Environment Variables

Set during installation:

```powershell
[System.Environment]::SetEnvironmentVariable(
  'MANDA_SCRIPTS_PATH',
  'C:\Program Files\M&A Discovery Suite\Scripts',
  'Machine'
)

[System.Environment]::SetEnvironmentVariable(
  'MANDA_DATA_PATH',
  "$env:APPDATA\M&A Discovery Suite",
  'User'
)
```

## Installation

### Silent Installation

```powershell
Setup.exe --silent
```

### Custom Installation Path

```powershell
Setup.exe --install-path="D:\Apps\M&A Discovery Suite"
```

### Post-Installation Steps

1. **Verify PowerShell Modules:**

```powershell
Get-Module -ListAvailable -Name @(
  'AzureAD',
  'ExchangeOnlineManagement',
  'Microsoft.Online.SharePoint.PowerShell',
  'MicrosoftTeams'
)
```

2. **Test Application Launch:**

```powershell
& "C:\Program Files\M&A Discovery Suite\M&A Discovery Suite.exe"
```

3. **Configure First Profile:**

- Launch application
- Click "Create Profile"
- Enter connection details
- Test connection
- Save profile

## Configuration Files

### User Configuration

Location: `%APPDATA%\M&A Discovery Suite\config.json`

```json
{
  "theme": "dark",
  "profiles": [
    {
      "id": "profile-1",
      "name": "Production",
      "tenantId": "...",
      "domain": "contoso.com"
    }
  ],
  "settings": {
    "autoRefresh": true,
    "refreshInterval": 60000
  }
}
```

### Application Logs

Location: `%APPDATA%\M&A Discovery Suite\logs\`

- `main.log` - Main process logs
- `renderer.log` - UI logs
- `powershell.log` - PowerShell execution logs
- `audit.log` - Audit trail

## Updates

### Auto-Update Configuration

The application supports auto-updates via Squirrel.

**Update Server Configuration:**

```json
{
  "updateServer": "https://updates.yourorg.com/manda-discovery",
  "checkInterval": 3600000,
  "autoDownload": true,
  "autoInstall": false
}
```

### Manual Update

1. Download new installer
2. Run installer
3. Existing configuration preserved
4. Application restarts

## Uninstallation

### Standard Uninstall

Control Panel > Programs > Uninstall M&A Discovery Suite

### Clean Uninstall

```powershell
# Uninstall application
& "C:\Program Files\M&A Discovery Suite\Uninstall.exe"

# Remove user data (optional)
Remove-Item "$env:APPDATA\M&A Discovery Suite" -Recurse -Force

# Remove environment variables
[System.Environment]::SetEnvironmentVariable('MANDA_SCRIPTS_PATH', $null, 'Machine')
[System.Environment]::SetEnvironmentVariable('MANDA_DATA_PATH', $null, 'User')
```

## Troubleshooting

### Installation Fails

**Error:** "Installation failed with code 1"

**Solution:**
1. Run installer as administrator
2. Disable antivirus temporarily
3. Check disk space (minimum 500MB)
4. Review installation log: `%TEMP%\M&A-Discovery-Setup.log`

### Application Won't Start

**Error:** "Application failed to start"

**Solution:**
1. Check Node.js runtime installed
2. Verify PowerShell 7+ installed
3. Check antivirus hasn't quarantined files
4. Review logs in `%APPDATA%\M&A Discovery Suite\logs\`

### PowerShell Execution Fails

**Error:** "PowerShell script execution failed"

**Solution:**
1. Verify PowerShell execution policy:
   ```powershell
   Get-ExecutionPolicy
   Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
   ```
2. Check PowerShell modules installed
3. Verify script paths in configuration
4. Test PowerShell manually:
   ```powershell
   pwsh.exe -NoProfile -ExecutionPolicy Bypass -File "path\to\script.ps1"
   ```

## Performance Tuning

### Recommended System Resources

- **CPU:** 4+ cores
- **RAM:** 8GB+ (16GB recommended)
- **Disk:** SSD recommended
- **Network:** 10+ Mbps

### Performance Settings

Adjust in Settings > Performance:

- Data grid page size: 100-500 rows
- Cache size: 100-500MB
- Session timeout: 5-15 minutes
- Max concurrent PowerShell sessions: 5-10

## Security Considerations

### Credential Storage

- Credentials encrypted with Windows DPAPI
- User-scoped encryption (not machine-wide)
- Credentials stored: `%APPDATA%\M&A Discovery Suite\credentials.dat`

### Network Security

- All connections use TLS 1.2+
- Certificate validation enabled
- Proxy support available

### Audit Logging

- All user actions logged
- Logs encrypted and tamper-proof
- Retention: 90 days default

---

For more information, see:
- [User Guide](USER_GUIDE.md)
- [Developer Guide](DEVELOPER_GUIDE.md)
- [Architecture](ARCHITECTURE.md)
