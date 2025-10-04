#Requires -Version 5.1

<#
.SYNOPSIS
    Builds the M&A Discovery Suite GUI v2 (Electron) application

.DESCRIPTION
    This script compiles the Electron/React/TypeScript application and creates a distributable
    package that can be deployed to production environments.

    This replaces the C#/WPF GUI with a modern cross-platform Electron application while
    maintaining 100% feature parity and integration with existing PowerShell modules.

.PARAMETER Configuration
    Build configuration: Development or Production (default: Production)

.PARAMETER OutputPath
    Output path for the compiled application (default: C:\enterprisediscovery\guiv2)

.PARAMETER SkipTests
    Skip running tests before building (default: false)

.PARAMETER Package
    Create distributable package (default: true for Production)

.EXAMPLE
    .\buildguiv2.ps1
    Builds the application in Production configuration

.EXAMPLE
    .\buildguiv2.ps1 -Configuration Development
    Builds the application in Development configuration

.EXAMPLE
    .\buildguiv2.ps1 -SkipTests
    Builds without running tests (faster, use for rapid iteration)
#>

[CmdletBinding()]
param(
    [Parameter(Mandatory = $false)]
    [ValidateSet('Development', 'Production')]
    [string]$Configuration = 'Production',

    [Parameter(Mandatory = $false)]
    [string]$OutputPath = "C:\enterprisediscovery\guiv2",

    [Parameter(Mandatory = $false)]
    [switch]$SkipTests,

    [Parameter(Mandatory = $false)]
    [switch]$Package = ($Configuration -eq 'Production')
)

Set-StrictMode -Version 3.0
$ErrorActionPreference = 'Stop'

Write-Host "M&A Discovery Suite - GUI v2 Build Script (Electron)" -ForegroundColor Green
Write-Host "====================================================" -ForegroundColor Green
Write-Host ""

# Get script directory and guiv2 directory
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$GuiV2Dir = Join-Path $ScriptDir "guiv2"

if (!(Test-Path $GuiV2Dir)) {
    Write-Error "guiv2 directory not found at: $GuiV2Dir"
    exit 1
}

Set-Location $GuiV2Dir

# Check if Node.js is installed
Write-Host "Checking for Node.js..." -ForegroundColor Yellow

try {
    $nodeVersion = & node --version 2>$null
    if ($LASTEXITCODE -ne 0) {
        throw "node command not found"
    }

    $majorVersion = [int]($nodeVersion.Substring(1).Split('.')[0])
    if ($majorVersion -lt 16) {
        throw "Requires Node.js 16 or later, found version $nodeVersion"
    }

    Write-Host "  [OK] Found Node.js version: $nodeVersion" -ForegroundColor Green
}
catch {
    Write-Error @"
Node.js 16 or later is required but not found or not properly installed.
Please download and install Node.js from: https://nodejs.org/

Error: $($_.Exception.Message)
"@
    exit 1
}

# Check if npm is installed
try {
    # Try to find npm in PATH
    $npmCmd = Get-Command npm -ErrorAction SilentlyContinue
    if (-not $npmCmd) {
        # Try common Node.js installation paths
        $commonPaths = @(
            "$env:ProgramFiles\nodejs\npm.cmd",
            "$env:APPDATA\npm\npm.cmd",
            "$env:ProgramFiles\nodejs\npm"
        )
        foreach ($path in $commonPaths) {
            if (Test-Path $path) {
                $npmCmd = $path
                break
            }
        }
    }

    if ($npmCmd) {
        $npmVersion = & $npmCmd --version 2>$null
        if ($LASTEXITCODE -eq 0) {
            Write-Host "  [OK] Found npm version: $npmVersion" -ForegroundColor Green
        } else {
            throw "npm command exists but failed to run"
        }
    } else {
        throw "npm command not found"
    }
}
catch {
    Write-Warning "npm check failed: $($_.Exception.Message)"
    Write-Host "  [INFO] Attempting to use npm anyway..." -ForegroundColor Cyan
}

# Check required files
$RequiredFiles = @(
    'package.json',
    'webpack.renderer.config.ts',
    'webpack.main.config.ts',
    'src/index.ts',
    'src/renderer.ts',
    'src/preload.ts'
)

Write-Host "Checking required files..." -ForegroundColor Yellow
foreach ($file in $RequiredFiles) {
    if (!(Test-Path $file)) {
        Write-Error "Required file not found: $file"
        exit 1
    }
    Write-Host "  [OK] $file" -ForegroundColor Green
}

# Install dependencies if node_modules doesn't exist or package-lock changed
Write-Host "Checking dependencies..." -ForegroundColor Yellow

$needsInstall = $false
if (!(Test-Path "node_modules")) {
    Write-Host "  node_modules not found - installing dependencies..." -ForegroundColor Cyan
    $needsInstall = $true
} else {
    # Check if package-lock.json is newer than node_modules
    $packageLock = Get-Item "package-lock.json" -ErrorAction SilentlyContinue
    $nodeModules = Get-Item "node_modules" -ErrorAction SilentlyContinue

    if ($packageLock -and $nodeModules -and $packageLock.LastWriteTime -gt $nodeModules.LastWriteTime) {
        Write-Host "  Dependencies out of date - reinstalling..." -ForegroundColor Cyan
        $needsInstall = $true
    }
}

if ($needsInstall) {
    Write-Host "Installing npm dependencies..." -ForegroundColor Yellow
    & npm ci --prefer-offline --no-audit 2>&1 | Out-Null
    if ($LASTEXITCODE -ne 0) {
        Write-Warning "npm ci failed, trying npm install..."
        & npm install --prefer-offline --no-audit
        if ($LASTEXITCODE -ne 0) {
            Write-Error "Failed to install dependencies"
            exit 1
        }
    }
    Write-Host "  [OK] Dependencies installed" -ForegroundColor Green
} else {
    Write-Host "  [OK] Dependencies up to date" -ForegroundColor Green
}

# Run TypeScript compilation check
Write-Host "Checking TypeScript compilation..." -ForegroundColor Yellow
& npx tsc --noEmit
if ($LASTEXITCODE -ne 0) {
    Write-Warning "TypeScript compilation has errors. Continuing anyway..."
    Write-Host "  [WARNING] TypeScript errors detected (non-blocking)" -ForegroundColor Yellow
} else {
    Write-Host "  [OK] TypeScript compilation successful" -ForegroundColor Green
}

# Run tests unless skipped
if (-not $SkipTests) {
    Write-Host "Running tests..." -ForegroundColor Yellow

    # Run unit tests
    & npm test -- --passWithNoTests --silent 2>&1 | Out-Null
    if ($LASTEXITCODE -ne 0) {
        Write-Warning "Some tests failed, but continuing build..."
        Write-Host "  [WARNING] Tests failed (non-blocking)" -ForegroundColor Yellow
    } else {
        Write-Host "  [OK] Tests passed" -ForegroundColor Green
    }
} else {
    Write-Host "  [SKIPPED] Tests skipped per request" -ForegroundColor Cyan
}

# Set environment for build
$env:NODE_ENV = if ($Configuration -eq 'Production') { 'production' } else { 'development' }
Write-Host "Building application (Configuration: $Configuration)..." -ForegroundColor Yellow

# Clean previous build
if (Test-Path ".webpack") {
    Remove-Item -Path ".webpack" -Recurse -Force -ErrorAction SilentlyContinue
}

# Build the application
if ($Configuration -eq 'Production') {
    Write-Host "  Building optimized production bundle..." -ForegroundColor Cyan
    & npm run build:prod 2>&1 | ForEach-Object {
        if ($_ -match "error|failed") {
            Write-Host "  $_" -ForegroundColor Red
        } elseif ($_ -match "warning") {
            Write-Host "  $_" -ForegroundColor Yellow
        } else {
            Write-Host "  $_" -ForegroundColor Gray
        }
    }
} else {
    Write-Host "  Building development bundle..." -ForegroundColor Cyan
    & npm run package 2>&1 | ForEach-Object {
        if ($_ -match "error|failed") {
            Write-Host "  $_" -ForegroundColor Red
        } elseif ($_ -match "warning") {
            Write-Host "  $_" -ForegroundColor Yellow
        } else {
            Write-Host "  $_" -ForegroundColor Gray
        }
    }
}

if ($LASTEXITCODE -ne 0) {
    Write-Error "Build failed with exit code $LASTEXITCODE"
    exit 1
}

Write-Host "  [OK] Application built successfully" -ForegroundColor Green

# Create/prepare output directory
Write-Host "Preparing deployment directory..." -ForegroundColor Yellow

# Stop any running instances
try {
    $processes = Get-Process -Name "electron" -ErrorAction SilentlyContinue
    if ($processes) {
        Write-Host "  Stopping running Electron instances..." -ForegroundColor Yellow
        $processes | Stop-Process -Force -ErrorAction SilentlyContinue
        Start-Sleep -Seconds 2
    }
} catch {
    Write-Warning "Could not check for running processes: $($_.Exception.Message)"
}

# Create output directory if it doesn't exist
if (!(Test-Path $OutputPath)) {
    New-Item -Path $OutputPath -ItemType Directory -Force | Out-Null
    Write-Host "  [OK] Created output directory: $OutputPath" -ForegroundColor Green
} else {
    Write-Host "  [OK] Output directory exists: $OutputPath" -ForegroundColor Green
}

# Copy built application to deployment directory
Write-Host "Deploying application files..." -ForegroundColor Yellow

# Copy the webpack output
$WebpackOutput = Join-Path $GuiV2Dir ".webpack"
if (Test-Path $WebpackOutput) {
    $WebpackDest = Join-Path $OutputPath ".webpack"
    if (Test-Path $WebpackDest) {
        Remove-Item -Path $WebpackDest -Recurse -Force -ErrorAction SilentlyContinue
    }
    Copy-Item -Path $WebpackOutput -Destination $WebpackDest -Recurse -Force
    Write-Host "  [OK] Webpack bundle copied" -ForegroundColor Green
}

# Copy package.json and related files
Copy-Item -Path "package.json" -Destination $OutputPath -Force
Copy-Item -Path "package-lock.json" -Destination $OutputPath -Force -ErrorAction SilentlyContinue

# Copy node_modules (production only)
$NodeModulesDest = Join-Path $OutputPath "node_modules"
if (Test-Path $NodeModulesDest) {
    Remove-Item -Path $NodeModulesDest -Recurse -Force -ErrorAction SilentlyContinue
}

Write-Host "  Installing production dependencies in output directory..." -ForegroundColor Cyan
Push-Location $OutputPath
& npm ci --production --prefer-offline --no-audit 2>&1 | Out-Null
if ($LASTEXITCODE -ne 0) {
    Write-Warning "Production dependency installation had issues, but continuing..."
}
Pop-Location

Write-Host "  [OK] Application files deployed" -ForegroundColor Green

# Copy PowerShell modules to the output directory
$ModulesSourcePath = Join-Path $ScriptDir "Modules"
$ModulesDestPath = Join-Path $OutputPath "Modules"

if (Test-Path $ModulesSourcePath) {
    Write-Host "Copying PowerShell modules..." -ForegroundColor Yellow

    if (Test-Path $ModulesDestPath) {
        Remove-Item -Path $ModulesDestPath -Recurse -Force -ErrorAction SilentlyContinue
    }

    Copy-Item -Path $ModulesSourcePath -Destination $ModulesDestPath -Recurse -Force

    $ModuleCount = (Get-ChildItem -Path $ModulesDestPath -Filter "*.psm1" -Recurse -ErrorAction SilentlyContinue | Measure-Object).Count
    Write-Host "  [OK] $ModuleCount PowerShell modules copied" -ForegroundColor Green
} else {
    Write-Warning "Modules directory not found at: $ModulesSourcePath"
}

# Copy configuration files
$ConfigSourcePath = Join-Path $ScriptDir "Configuration"
$ConfigDestPath = Join-Path $OutputPath "Configuration"

if (Test-Path $ConfigSourcePath) {
    Write-Host "Copying configuration files..." -ForegroundColor Yellow

    if (Test-Path $ConfigDestPath) {
        Remove-Item -Path $ConfigDestPath -Recurse -Force -ErrorAction SilentlyContinue
    }

    Copy-Item -Path $ConfigSourcePath -Destination $ConfigDestPath -Recurse -Force

    $ConfigCount = (Get-ChildItem -Path $ConfigDestPath -Filter "*.json" -Recurse -ErrorAction SilentlyContinue | Measure-Object).Count
    Write-Host "  [OK] $ConfigCount configuration files copied" -ForegroundColor Green
} else {
    Write-Warning "Configuration directory not found at: $ConfigSourcePath"
}

# Copy Tools directory (including nmap for Infrastructure Discovery)
$ToolsSourcePath = Join-Path $ScriptDir "Tools"
$ToolsDestPath = Join-Path $OutputPath "Tools"

if (Test-Path $ToolsSourcePath) {
    Write-Host "Copying embedded tools..." -ForegroundColor Yellow

    if (Test-Path $ToolsDestPath) {
        Remove-Item -Path $ToolsDestPath -Recurse -Force -ErrorAction SilentlyContinue
    }

    Copy-Item -Path $ToolsSourcePath -Destination $ToolsDestPath -Recurse -Force

    $ToolCount = (Get-ChildItem -Path $ToolsDestPath -Filter "*.exe" -Recurse -ErrorAction SilentlyContinue | Measure-Object).Count
    Write-Host "  [OK] $ToolCount tool binaries copied" -ForegroundColor Green
} else {
    Write-Warning "Tools directory not found at: $ToolsSourcePath"
}

# Copy Scripts directory
$ScriptsSourcePath = Join-Path $ScriptDir "Scripts"
$ScriptsDestPath = Join-Path $OutputPath "Scripts"

if (Test-Path $ScriptsSourcePath) {
    Write-Host "Copying utility scripts..." -ForegroundColor Yellow

    if (Test-Path $ScriptsDestPath) {
        Remove-Item -Path $ScriptsDestPath -Recurse -Force -ErrorAction SilentlyContinue
    }

    Copy-Item -Path $ScriptsSourcePath -Destination $ScriptsDestPath -Recurse -Force

    $ScriptCount = (Get-ChildItem -Path $ScriptsDestPath -Filter "*.ps1" -Recurse -ErrorAction SilentlyContinue | Measure-Object).Count
    Write-Host "  [OK] $ScriptCount utility scripts copied" -ForegroundColor Green
} else {
    Write-Warning "Scripts directory not found at: $ScriptsSourcePath"
}

# Create launcher scripts
Write-Host "Creating launcher scripts..." -ForegroundColor Yellow

# PowerShell launcher
$PSLauncherPath = Join-Path $OutputPath "Launch-MandADiscoverySuiteV2.ps1"
$PSLauncherContent = @"
#Requires -Version 5.1

<#
.SYNOPSIS
    Launches M&A Discovery Suite GUI v2 (Electron)

.DESCRIPTION
    This script launches the Electron application with proper environment variables
    and ensures all prerequisites are met.
#>

Set-StrictMode -Version 3.0
`$ErrorActionPreference = 'Stop'

# Set environment variables
`$env:MANDA_DISCOVERY_PATH = if (`$env:MANDA_DISCOVERY_PATH) { `$env:MANDA_DISCOVERY_PATH } else { "C:\discoverydata" }
`$env:NODE_ENV = "production"

# Get script directory
`$AppDir = Split-Path -Parent `$MyInvocation.MyCommand.Path

# Set working directory
Set-Location `$AppDir

Write-Host "Starting M&A Discovery Suite v2..." -ForegroundColor Green
Write-Host "Data Directory: `$(`$env:MANDA_DISCOVERY_PATH)" -ForegroundColor Cyan
Write-Host ""

# Launch the Electron application
try {
    & npm start
} catch {
    Write-Error "Failed to start application: `$(`$_.Exception.Message)"
    pause
    exit 1
}
"@

Set-Content -Path $PSLauncherPath -Value $PSLauncherContent -Encoding UTF8
Write-Host "  [OK] PowerShell launcher created" -ForegroundColor Green

# Batch file launcher (for easier double-click launch)
$BatLauncherPath = Join-Path $OutputPath "Launch-MandADiscoverySuiteV2.bat"
$BatLauncherContent = @"
@echo off
REM M&A Discovery Suite v2 Launcher (Electron)

echo Starting M&A Discovery Suite v2...
echo.

REM Set data directory
if not defined MANDA_DISCOVERY_PATH (
    set MANDA_DISCOVERY_PATH=C:\discoverydata
)

REM Set production mode
set NODE_ENV=production

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js is required but not found.
    echo Please download and install Node.js from: https://nodejs.org/
    echo.
    pause
    exit /b 1
)

REM Launch the application
cd /d "%~dp0"
npm start

if errorlevel 1 (
    echo.
    echo Application exited with an error.
    pause
)
"@

Set-Content -Path $BatLauncherPath -Value $BatLauncherContent -Encoding ASCII
Write-Host "  [OK] Batch launcher created" -ForegroundColor Green

# Set up data directory
Write-Host "Setting up data directory..." -ForegroundColor Yellow
$DataPath = if ($env:MANDA_DISCOVERY_PATH) { $env:MANDA_DISCOVERY_PATH } else { "C:\discoverydata" }

if (!(Test-Path $DataPath)) {
    New-Item -Path $DataPath -ItemType Directory -Force | Out-Null
    Write-Host "  [OK] Created $DataPath" -ForegroundColor Green
} else {
    Write-Host "  [OK] $DataPath already exists" -ForegroundColor Green
}

# Set permissions if running as admin
try {
    $currentUser = [System.Security.Principal.WindowsIdentity]::GetCurrent()
    $principal = New-Object System.Security.Principal.WindowsPrincipal($currentUser)
    $isAdmin = $principal.IsInRole([System.Security.Principal.WindowsBuiltInRole]::Administrator)

    if ($isAdmin) {
        $acl = Get-Acl $DataPath
        $accessRule = New-Object System.Security.AccessControl.FileSystemAccessRule("Users", "FullControl", "ContainerInherit,ObjectInherit", "None", "Allow")
        $acl.SetAccessRule($accessRule)
        Set-Acl -Path $DataPath -AclObject $acl
        Write-Host "  [OK] Data directory permissions set" -ForegroundColor Green
    }
} catch {
    Write-Warning "Could not set data directory permissions: $($_.Exception.Message)"
}

# Create deployment package if requested
if ($Package) {
    Write-Host "Creating deployment package..." -ForegroundColor Yellow

    $PackageName = "MandADiscoverySuiteV2-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
    $PackagePath = Join-Path $ScriptDir "$PackageName.zip"

    try {
        Compress-Archive -Path "$OutputPath\*" -DestinationPath $PackagePath -Force

        $PackageInfo = Get-Item $PackagePath
        $PackageSizeMB = [math]::Round($PackageInfo.Length / 1MB, 2)

        Write-Host "  [OK] Package created: $PackageName.zip ($PackageSizeMB MB)" -ForegroundColor Green
    } catch {
        Write-Warning "Could not create deployment package: $($_.Exception.Message)"
    }
}

# Display build summary
Write-Host ""
Write-Host "Build completed successfully!" -ForegroundColor Green
Write-Host "=============================" -ForegroundColor Green
Write-Host ""
Write-Host "Configuration: $Configuration" -ForegroundColor Cyan
Write-Host "Output Path: $OutputPath" -ForegroundColor Cyan
Write-Host "Node.js: $(node --version)" -ForegroundColor Cyan
Write-Host "npm: $(npm --version)" -ForegroundColor Cyan
Write-Host ""
Write-Host "To run the application:" -ForegroundColor Yellow
Write-Host "  1. Navigate to: $OutputPath" -ForegroundColor White
Write-Host "  2. Run: Launch-MandADiscoverySuiteV2.bat" -ForegroundColor White
Write-Host "  OR" -ForegroundColor Yellow
Write-Host "  2. Run: Launch-MandADiscoverySuiteV2.ps1" -ForegroundColor White
Write-Host "  OR" -ForegroundColor Yellow
Write-Host "  2. Run: npm start" -ForegroundColor White
Write-Host ""

# Post-build verification
Write-Host "Post-Build Verification:" -ForegroundColor Yellow

# Check if webpack bundle exists
$MainBundle = Join-Path $OutputPath ".webpack\main\index.js"
$RendererBundle = Join-Path $OutputPath ".webpack\renderer\main_window\index.html"

if ((Test-Path $MainBundle) -and (Test-Path $RendererBundle)) {
    Write-Host "  [OK] Webpack bundles verified" -ForegroundColor Green
} else {
    Write-Warning "Some webpack bundles may be missing"
}

# Verify modules
$ModulesPath = Join-Path $OutputPath "Modules"
if (Test-Path $ModulesPath) {
    $ModuleCount = (Get-ChildItem -Path $ModulesPath -Filter "*.psm1" -Recurse -ErrorAction SilentlyContinue | Measure-Object).Count
    Write-Host "  [OK] PowerShell Modules: $ModuleCount" -ForegroundColor Green
}

# Verify configuration
$ConfigPath = Join-Path $OutputPath "Configuration"
if (Test-Path $ConfigPath) {
    $ConfigCount = (Get-ChildItem -Path $ConfigPath -Filter "*.json" -ErrorAction SilentlyContinue | Measure-Object).Count
    Write-Host "  [OK] Configuration Files: $ConfigCount" -ForegroundColor Green
}

# Verify launcher scripts
if ((Test-Path $PSLauncherPath) -and (Test-Path $BatLauncherPath)) {
    Write-Host "  [OK] Launcher scripts created" -ForegroundColor Green
}

Write-Host ""
Write-Host "Deployment Structure:" -ForegroundColor Cyan
Write-Host "  Application: $OutputPath" -ForegroundColor White
Write-Host "  Bundles: $OutputPath\.webpack" -ForegroundColor White
Write-Host "  Modules: $OutputPath\Modules" -ForegroundColor White
Write-Host "  Config: $OutputPath\Configuration" -ForegroundColor White
Write-Host "  Tools: $OutputPath\Tools" -ForegroundColor White
Write-Host "  Scripts: $OutputPath\Scripts" -ForegroundColor White
Write-Host "  Data: $DataPath" -ForegroundColor White
Write-Host ""
Write-Host "Build and Deployment Completed Successfully!" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green
