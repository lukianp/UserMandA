<#
.SYNOPSIS
    Builds a standalone demo package for Enterprise Discovery Suite

.DESCRIPTION
    Creates a complete, standalone demo package with:
    - Webpack bundles (main, preload, renderer)
    - Obfuscated/stub PowerShell modules (protects IP)
    - Electron runtime
    - Sample data
    - Launcher scripts

.PARAMETER OutputPath
    Path where the demo package will be created

.PARAMETER IncludeElectron
    Whether to include the Electron runtime (larger package but fully standalone)

.PARAMETER DemoMode
    Type of demo: 'Stub' (no real modules), 'Obfuscated' (obfuscated modules)

.EXAMPLE
    .\Build-DemoPackage.ps1 -OutputPath "D:\Demo" -IncludeElectron $true
#>

param(
    [string]$OutputPath = "D:\Scripts\UserMandA\DemoPackage",
    [switch]$IncludeElectron = $true,
    [ValidateSet('Stub', 'Obfuscated')]
    [string]$DemoMode = 'Stub'
)

$ErrorActionPreference = 'Stop'
$ProgressPreference = 'SilentlyContinue'

# Configuration
$WorkspaceDir = "D:\Scripts\UserMandA"
$DeploymentDir = "C:\enterprisediscovery"
$GuiV2Dir = "$DeploymentDir\guiv2"
$ModulesDir = "$DeploymentDir\Modules\Discovery"
$ScriptsDir = "$DeploymentDir\Scripts"

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "Enterprise Discovery Suite - Demo Builder" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Create output directory
Write-Host "[1/8] Creating output directory..." -ForegroundColor Yellow
if (Test-Path $OutputPath) {
    Remove-Item $OutputPath -Recurse -Force
}
New-Item -ItemType Directory -Path $OutputPath -Force | Out-Null
New-Item -ItemType Directory -Path "$OutputPath\Modules\Discovery" -Force | Out-Null
New-Item -ItemType Directory -Path "$OutputPath\Scripts" -Force | Out-Null
New-Item -ItemType Directory -Path "$OutputPath\DemoData" -Force | Out-Null
Write-Host "  Created: $OutputPath" -ForegroundColor Green

# Step 2: Kill any running Electron processes
Write-Host "[2/8] Stopping Electron processes..." -ForegroundColor Yellow
Get-Process -Name electron -ErrorAction SilentlyContinue | Stop-Process -Force
Start-Sleep -Seconds 2
Write-Host "  Done" -ForegroundColor Green

# Step 3: Build webpack bundles
Write-Host "[3/8] Building webpack bundles (this may take a minute)..." -ForegroundColor Yellow
Set-Location $GuiV2Dir

# Clean webpack cache
if (Test-Path '.webpack') {
    Remove-Item -Recurse -Force '.webpack'
    Write-Host "  Cleaned webpack cache" -ForegroundColor Gray
}

# Build main process
Write-Host "  Building main process..." -ForegroundColor Gray
$mainResult = npm run build:main 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "  ERROR: Main build failed" -ForegroundColor Red
    Write-Host $mainResult
    exit 1
}
Write-Host "  Main: OK" -ForegroundColor Green

# Build preload script
Write-Host "  Building preload script..." -ForegroundColor Gray
$preloadResult = npx webpack --config webpack.preload.config.js --mode=production 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "  ERROR: Preload build failed" -ForegroundColor Red
    Write-Host $preloadResult
    exit 1
}
Write-Host "  Preload: OK" -ForegroundColor Green

# Build renderer
Write-Host "  Building renderer..." -ForegroundColor Gray
$rendererResult = npm run build:renderer 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "  ERROR: Renderer build failed" -ForegroundColor Red
    Write-Host $rendererResult
    exit 1
}
Write-Host "  Renderer: OK" -ForegroundColor Green

# Step 4: Copy webpack bundles (excluding source maps for smaller size)
Write-Host "[4/8] Copying webpack bundles..." -ForegroundColor Yellow
$webpackSource = "$GuiV2Dir\.webpack"
$webpackDest = "$OutputPath\.webpack"

# Copy main (exclude .map files)
New-Item -ItemType Directory -Path "$webpackDest\main" -Force | Out-Null
Get-ChildItem "$webpackSource\main\*.js" | Copy-Item -Destination "$webpackDest\main\" -Force

# Copy preload
New-Item -ItemType Directory -Path "$webpackDest\preload" -Force | Out-Null
Copy-Item "$webpackSource\preload\*" -Destination "$webpackDest\preload\" -Force

# Copy renderer (exclude .map and .gz files for cleaner package)
New-Item -ItemType Directory -Path "$webpackDest\renderer\main_window" -Force | Out-Null
Get-ChildItem "$webpackSource\renderer\main_window\*.js" | Copy-Item -Destination "$webpackDest\renderer\main_window\" -Force
Get-ChildItem "$webpackSource\renderer\main_window\*.html" -ErrorAction SilentlyContinue | Copy-Item -Destination "$webpackDest\renderer\main_window\" -Force
Get-ChildItem "$webpackSource\renderer\main_window\*.css" -ErrorAction SilentlyContinue | Copy-Item -Destination "$webpackDest\renderer\main_window\" -Force

$bundleCount = (Get-ChildItem "$webpackDest" -Recurse -File).Count
Write-Host "  Copied $bundleCount bundle files" -ForegroundColor Green

# Step 5: Create stub PowerShell modules (protects IP)
Write-Host "[5/8] Creating protected PowerShell modules..." -ForegroundColor Yellow

if ($DemoMode -eq 'Stub') {
    # Create stub module template that returns demo data
    $stubModuleTemplate = @'
<#
.SYNOPSIS
    Demo stub module for Enterprise Discovery Suite
.DESCRIPTION
    This module provides demo functionality only.
    No real discovery logic is included.
#>

# Demo mode indicator
$script:IsDemoMode = $true

function Invoke-{0}Discovery {{
    [CmdletBinding()]
    param(
        [string]$CompanyName = "DemoCompany",
        [string]$OutputPath = "C:\DiscoveryData\Demo",
        [string]$EnrichmentLevel = "Basic"
    )

    Write-Host "[DEMO] {0} Discovery - Demo Mode Active" -ForegroundColor Cyan

    # Return demo result
    return @{{
        Success = $true
        ModuleName = "{0}"
        RecordCount = {1}
        Duration = "{2}"
        Message = "Demo discovery completed successfully"
        DemoMode = $true
    }}
}}

Export-ModuleMember -Function Invoke-{0}Discovery
'@

    # Define demo modules with sample record counts
    $demoModules = @{
        'ActiveDirectoryDiscovery' = @{ Records = 150; Duration = "45s" }
        'ApplicationDiscovery' = @{ Records = 250; Duration = "71s" }
        'AzureDiscovery' = @{ Records = 89; Duration = "120s" }
        'AzureResourceDiscovery' = @{ Records = 45; Duration = "60s" }
        'ConditionalAccessDiscovery' = @{ Records = 23; Duration = "30s" }
        'EntraIDAppDiscovery' = @{ Records = 67; Duration = "40s" }
        'ExchangeDiscovery' = @{ Records = 34; Duration = "55s" }
        'FileServerDiscovery' = @{ Records = 12; Duration = "25s" }
        'GPODiscovery' = @{ Records = 45; Duration = "35s" }
        'InfrastructureDiscovery' = @{ Records = 78; Duration = "90s" }
        'IntuneDiscovery' = @{ Records = 156; Duration = "80s" }
        'LicensingDiscovery' = @{ Records = 23; Duration = "20s" }
        'NetworkInfrastructureDiscovery' = @{ Records = 34; Duration = "45s" }
        'OneDriveDiscovery' = @{ Records = 89; Duration = "65s" }
        'PowerBIDiscovery' = @{ Records = 12; Duration = "30s" }
        'PowerPlatformDiscovery' = @{ Records = 45; Duration = "50s" }
        'SecurityInfrastructureDiscovery' = @{ Records = 67; Duration = "75s" }
        'SharePointDiscovery' = @{ Records = 234; Duration = "120s" }
        'SQLServerDiscovery' = @{ Records = 8; Duration = "40s" }
        'TeamsDiscovery' = @{ Records = 156; Duration = "85s" }
        'VirtualizationDiscovery' = @{ Records = 23; Duration = "55s" }
    }

    foreach ($module in $demoModules.GetEnumerator()) {
        $moduleName = $module.Key -replace 'Discovery$', ''
        $content = $stubModuleTemplate -f $moduleName, $module.Value.Records, $module.Value.Duration
        $destPath = "$OutputPath\Modules\Discovery\$($module.Key).psm1"
        Set-Content -Path $destPath -Value $content -Encoding UTF8
    }

    # Create DiscoveryBase stub
    $baseModuleContent = @'
# Discovery Base - Demo Version
$script:IsDemoMode = $true

function Write-ModuleLog {
    param([string]$Message, [string]$Level = "Info")
    $timestamp = Get-Date -Format "HH:mm:ss"
    Write-Host "[$timestamp] [$Level] $Message"
}

function Get-DiscoveryOutputPath {
    param([string]$CompanyName, [string]$ModuleName)
    return "C:\DiscoveryData\$CompanyName\Raw"
}

Export-ModuleMember -Function Write-ModuleLog, Get-DiscoveryOutputPath
'@
    Set-Content -Path "$OutputPath\Modules\Discovery\DiscoveryBase.psm1" -Value $baseModuleContent -Encoding UTF8

    Write-Host "  Created $($demoModules.Count + 1) stub modules (IP protected)" -ForegroundColor Green
}
elseif ($DemoMode -eq 'Obfuscated') {
    # Simple obfuscation: Base64 encode and compress
    Write-Host "  Obfuscating modules..." -ForegroundColor Gray

    Get-ChildItem "$ModulesDir\*.psm1" | ForEach-Object {
        $content = Get-Content $_.FullName -Raw
        $bytes = [System.Text.Encoding]::UTF8.GetBytes($content)
        $compressed = [System.IO.MemoryStream]::new()
        $gzip = [System.IO.Compression.GZipStream]::new($compressed, [System.IO.Compression.CompressionMode]::Compress)
        $gzip.Write($bytes, 0, $bytes.Length)
        $gzip.Close()
        $encoded = [Convert]::ToBase64String($compressed.ToArray())

        $obfuscatedContent = @"
# Obfuscated Module - Do Not Distribute
`$_d = '$encoded'
`$_b = [Convert]::FromBase64String(`$_d)
`$_m = [System.IO.MemoryStream]::new(`$_b)
`$_g = [System.IO.Compression.GZipStream]::new(`$_m, [System.IO.Compression.CompressionMode]::Decompress)
`$_r = [System.IO.StreamReader]::new(`$_g)
`$_c = `$_r.ReadToEnd()
`$_r.Close()
Invoke-Expression `$_c
"@
        Set-Content -Path "$OutputPath\Modules\Discovery\$($_.Name)" -Value $obfuscatedContent -Encoding UTF8
    }

    $moduleCount = (Get-ChildItem "$OutputPath\Modules\Discovery\*.psm1").Count
    Write-Host "  Obfuscated $moduleCount modules" -ForegroundColor Green
}

# Step 6: Copy required files
Write-Host "[6/8] Copying required files..." -ForegroundColor Yellow

# Copy package.json (modified for demo)
$packageJson = Get-Content "$GuiV2Dir\package.json" | ConvertFrom-Json
$packageJson.name = "enterprise-discovery-demo"
$packageJson.version = "2.0.0-demo"
$packageJson.main = ".webpack/main/main.js"  # Fix main entry for standalone demo
$packageJson | ConvertTo-Json -Depth 10 | Set-Content "$OutputPath\package.json"
Write-Host "  package.json: OK" -ForegroundColor Green

# Copy Scripts directory (only safe scripts)
$safeScripts = @('run-demo.bat')
# We'll create the launcher script instead

# Step 7: Create demo data and launcher
Write-Host "[7/8] Creating demo data and launcher..." -ForegroundColor Yellow

# Create sample demo data
$sampleUsers = @(
    @{ DisplayName = "John Smith"; UserPrincipalName = "john.smith@demo.local"; Department = "IT"; JobTitle = "Systems Administrator" }
    @{ DisplayName = "Jane Doe"; UserPrincipalName = "jane.doe@demo.local"; Department = "HR"; JobTitle = "HR Manager" }
    @{ DisplayName = "Bob Wilson"; UserPrincipalName = "bob.wilson@demo.local"; Department = "Finance"; JobTitle = "Financial Analyst" }
    @{ DisplayName = "Alice Brown"; UserPrincipalName = "alice.brown@demo.local"; Department = "Engineering"; JobTitle = "Software Developer" }
    @{ DisplayName = "Charlie Davis"; UserPrincipalName = "charlie.davis@demo.local"; Department = "Sales"; JobTitle = "Sales Manager" }
) | ConvertTo-Json
Set-Content -Path "$OutputPath\DemoData\Users.json" -Value $sampleUsers

$sampleApps = @(
    @{ Name = "Microsoft Office 365"; Vendor = "Microsoft"; Category = "Productivity"; Users = 250 }
    @{ Name = "Salesforce CRM"; Vendor = "Salesforce"; Category = "CRM"; Users = 45 }
    @{ Name = "Slack"; Vendor = "Slack Technologies"; Category = "Communication"; Users = 180 }
    @{ Name = "Zoom"; Vendor = "Zoom Video Communications"; Category = "Communication"; Users = 200 }
    @{ Name = "Adobe Creative Cloud"; Vendor = "Adobe"; Category = "Design"; Users = 25 }
) | ConvertTo-Json
Set-Content -Path "$OutputPath\DemoData\Applications.json" -Value $sampleApps

Write-Host "  Demo data: OK" -ForegroundColor Green

# Create launcher script
$launcherContent = @'
@echo off
title Enterprise Discovery Suite - Demo
echo ============================================
echo Enterprise Discovery Suite - Demo Version
echo ============================================
echo.
echo Starting application...
echo.

REM Check if Node.js is available
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

REM Check for Electron in node_modules
if exist "node_modules\.bin\electron.cmd" (
    echo Using local Electron...
    node_modules\.bin\electron.cmd .
) else (
    echo Installing Electron (one-time setup)...
    npm install electron --save-dev --silent
    if %ERRORLEVEL% NEQ 0 (
        echo ERROR: Failed to install Electron
        pause
        exit /b 1
    )
    node_modules\.bin\electron.cmd .
)

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo Application closed with error code: %ERRORLEVEL%
    pause
)
'@
Set-Content -Path "$OutputPath\run-demo.bat" -Value $launcherContent -Encoding ASCII

# Create PowerShell launcher alternative
$psLauncherContent = @'
# Enterprise Discovery Suite - Demo Launcher
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "Enterprise Discovery Suite - Demo Version" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptDir

# Check for Electron
$electronPath = Join-Path $scriptDir "node_modules\.bin\electron.cmd"
if (-not (Test-Path $electronPath)) {
    Write-Host "Installing Electron (one-time setup)..." -ForegroundColor Yellow
    npm install electron --save-dev --silent
}

Write-Host "Starting application..." -ForegroundColor Green
& $electronPath .
'@
Set-Content -Path "$OutputPath\run-demo.ps1" -Value $psLauncherContent -Encoding UTF8

Write-Host "  Launcher scripts: OK" -ForegroundColor Green

# Step 8: Include Electron if requested
if ($IncludeElectron) {
    Write-Host "[8/8] Including Electron runtime..." -ForegroundColor Yellow
    Set-Location $OutputPath

    # Install Electron locally for the demo package (suppress npm warnings)
    $env:npm_config_loglevel = "error"
    npm init -y 2>$null | Out-Null
    npm install electron@latest --save-dev 2>$null | Out-Null

    if (Test-Path "$OutputPath\node_modules\electron") {
        $electronSize = [math]::Round((Get-ChildItem "$OutputPath\node_modules" -Recurse -File | Measure-Object -Property Length -Sum).Sum / 1MB, 2)
        Write-Host "  Electron installed ($electronSize MB)" -ForegroundColor Green
    } else {
        Write-Host "  WARNING: Electron installation may have failed" -ForegroundColor Yellow
    }
} else {
    Write-Host "[8/8] Skipping Electron (will download on first run)..." -ForegroundColor Yellow
}

# Create README
$readmeContent = @"
# Enterprise Discovery Suite - Demo Version

## Quick Start

### Option 1: Double-click launcher
- Run `run-demo.bat` (Windows)
- Or run `run-demo.ps1` (PowerShell)

### Option 2: Command line
```bash
cd $(Split-Path $OutputPath -Leaf)
npx electron .
```

## Requirements
- Windows 10/11
- Node.js 18+ (https://nodejs.org/)

## Demo Features
- Full UI demonstration
- Sample discovery data
- All navigation and views functional
- No real discovery execution (demo mode)

## Package Contents
- `.webpack/` - Application bundles
- `Modules/` - Discovery modules (stub/protected)
- `DemoData/` - Sample data files
- `run-demo.bat` - Windows launcher
- `run-demo.ps1` - PowerShell launcher

## Notes
- This is a DEMO version for evaluation purposes
- Discovery modules are stubs and do not perform real discovery
- Source code is bundled and minified

---
Built: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
Version: 2.0.0-demo
"@
Set-Content -Path "$OutputPath\README.md" -Value $readmeContent -Encoding UTF8

# Create ZIP package
Write-Host ""
Write-Host "Creating ZIP package..." -ForegroundColor Cyan
$zipPath = "$WorkspaceDir\enterprise-discovery-demo.zip"

if (Test-Path $zipPath) {
    Remove-Item $zipPath -Force
}

Add-Type -AssemblyName System.IO.Compression.FileSystem
[System.IO.Compression.ZipFile]::CreateFromDirectory($OutputPath, $zipPath, [System.IO.Compression.CompressionLevel]::Optimal, $false)

$zipSize = [math]::Round((Get-Item $zipPath).Length / 1MB, 2)

Write-Host ""
Write-Host "============================================" -ForegroundColor Green
Write-Host "Demo Package Created Successfully!" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Green
Write-Host ""
Write-Host "Output Directory: $OutputPath" -ForegroundColor White
Write-Host "ZIP Package: $zipPath ($zipSize MB)" -ForegroundColor White
Write-Host ""
Write-Host "To test locally:" -ForegroundColor Yellow
Write-Host "  cd $OutputPath" -ForegroundColor Gray
Write-Host "  .\run-demo.bat" -ForegroundColor Gray
Write-Host ""

Set-Location $WorkspaceDir
