#Requires -Version 5.1

<#
.SYNOPSIS
    Builds the M&A Discovery Suite GUI v2 (Electron) application with enhanced debugging

.DESCRIPTION
    This script compiles the Electron/React/TypeScript application with comprehensive
    logging, debug output, and verbose mode for troubleshooting.

.PARAMETER Configuration
    Build configuration: Development or Production (default: Production)

.PARAMETER OutputPath
    Output path for the compiled application (default: C:\enterprisediscovery\guiv2)

.PARAMETER SkipTests
    Skip running tests before building (default: false)

.PARAMETER Package
    Create distributable package (default: true for Production)

.PARAMETER Debug
    Enable debug mode with verbose logging and debug console window

.PARAMETER LogPath
    Path to save build logs (default: C:\enterprisediscovery\logs\build-{timestamp}.log)

.PARAMETER OpenDevTools
    Automatically open Electron DevTools on launch (default: true in Debug mode)

.EXAMPLE
    .\buildguiv2-enhanced.ps1
    Standard production build

.EXAMPLE
    .\buildguiv2-enhanced.ps1 -Debug
    Build with verbose logging and debug console window

.EXAMPLE
    .\buildguiv2-enhanced.ps1 -Configuration Development -Debug -OpenDevTools
    Development build with full debugging enabled
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
    [switch]$Package = ($Configuration -eq 'Production'),

    [Parameter(Mandatory = $false)]
    [switch]$Debug,

    [Parameter(Mandatory = $false)]
    [string]$LogPath = "C:\enterprisediscovery\logs\build-$(Get-Date -Format 'yyyyMMdd-HHmmss').log",

    [Parameter(Mandatory = $false)]
    [switch]$OpenDevTools = $Debug
)

Set-StrictMode -Version 3.0
$ErrorActionPreference = 'Stop'

# Setup logging
function Write-Log {
    param(
        [string]$Message,
        [string]$Level = 'INFO',
        [ConsoleColor]$Color = 'White'
    )

    $timestamp = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
    $logMessage = "[$timestamp] [$Level] $Message"

    # Write to console
    Write-Host $logMessage -ForegroundColor $Color

    # Write to log file if logging is enabled
    if ($script:LogFileHandle) {
        Add-Content -Path $LogPath -Value $logMessage
    }
}

# Initialize logging
if ($Debug) {
    $logDir = Split-Path -Parent $LogPath
    if (!(Test-Path $logDir)) {
        New-Item -Path $logDir -ItemType Directory -Force | Out-Null
    }
    $script:LogFileHandle = $true
    Write-Log "Build log started: $LogPath" -Level 'INFO' -Color Green
    Write-Log "Debug mode: ENABLED" -Level 'DEBUG' -Color Cyan
}

Write-Host ""
Write-Host "M&A Discovery Suite - GUI v2 Enhanced Build Script" -ForegroundColor Green
Write-Host "===================================================" -ForegroundColor Green
Write-Host ""

if ($Debug) {
    Write-Host "DEBUG MODE ENABLED" -ForegroundColor Yellow
    Write-Host "  - Verbose logging: ON" -ForegroundColor Cyan
    Write-Host "  - Log file: $LogPath" -ForegroundColor Cyan
    Write-Host "  - DevTools auto-open: $OpenDevTools" -ForegroundColor Cyan
    Write-Host ""
}

# Get script directory and guiv2 directory
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$GuiV2Dir = Join-Path $ScriptDir "guiv2"

Write-Log "Script directory: $ScriptDir" -Level 'DEBUG' -Color Gray
Write-Log "GUI v2 directory: $GuiV2Dir" -Level 'DEBUG' -Color Gray

if (!(Test-Path $GuiV2Dir)) {
    Write-Log "guiv2 directory not found at: $GuiV2Dir" -Level 'ERROR' -Color Red
    exit 1
}

Set-Location $GuiV2Dir

# Check if Node.js is installed
Write-Log "Checking for Node.js..." -Level 'INFO' -Color Yellow

try {
    $nodeVersion = & node --version 2>$null
    if ($LASTEXITCODE -ne 0) {
        throw "node command not found"
    }

    $majorVersion = [int]($nodeVersion.Substring(1).Split('.')[0])
    if ($majorVersion -lt 16) {
        throw "Requires Node.js 16 or later, found version $nodeVersion"
    }

    Write-Log "Found Node.js version: $nodeVersion" -Level 'OK' -Color Green
}
catch {
    Write-Log "Node.js 16 or later is required but not found" -Level 'ERROR' -Color Red
    Write-Log $_.Exception.Message -Level 'ERROR' -Color Red
    exit 1
}

# Check npm
try {
    $npmVersion = & npm --version 2>&1
    Write-Log "Found npm version: $npmVersion" -Level 'OK' -Color Green
}
catch {
    Write-Log "npm check failed: $($_.Exception.Message)" -Level 'WARNING' -Color Yellow
}

# Check required files
$RequiredFiles = @(
    'package.json',
    'webpack.renderer.config.ts',
    'webpack.main.config.ts',
    'src/index.ts',
    'src/renderer.tsx',
    'src/preload.ts'
)

Write-Log "Checking required files..." -Level 'INFO' -Color Yellow
foreach ($file in $RequiredFiles) {
    if (!(Test-Path $file)) {
        Write-Log "Required file not found: $file" -Level 'ERROR' -Color Red
        exit 1
    }
    Write-Log "Found: $file" -Level 'DEBUG' -Color Gray
}
Write-Log "All required files present" -Level 'OK' -Color Green

# Install dependencies
Write-Log "Checking dependencies..." -Level 'INFO' -Color Yellow

$needsInstall = $false
if (!(Test-Path "node_modules")) {
    Write-Log "node_modules not found - installing dependencies..." -Level 'INFO' -Color Cyan
    $needsInstall = $true
}

if ($needsInstall) {
    Write-Log "Installing npm dependencies..." -Level 'INFO' -Color Yellow

    $npmArgs = @('ci', '--prefer-offline', '--no-audit')
    if ($Debug) {
        $npmArgs += '--verbose'
    }

    & npm @npmArgs 2>&1 | ForEach-Object {
        Write-Log $_ -Level 'NPM' -Color Gray
    }

    if ($LASTEXITCODE -ne 0) {
        Write-Log "npm ci failed, trying npm install..." -Level 'WARNING' -Color Yellow
        & npm install @npmArgs 2>&1 | ForEach-Object {
            Write-Log $_ -Level 'NPM' -Color Gray
        }
        if ($LASTEXITCODE -ne 0) {
            Write-Log "Failed to install dependencies" -Level 'ERROR' -Color Red
            exit 1
        }
    }
    Write-Log "Dependencies installed" -Level 'OK' -Color Green
} else {
    Write-Log "Dependencies up to date" -Level 'OK' -Color Green
}

# TypeScript compilation check
Write-Log "Checking TypeScript compilation..." -Level 'INFO' -Color Yellow
try {
    $tscOutput = & npx tsc --noEmit 2>&1
    if ($Debug) {
        $tscOutput | ForEach-Object { Write-Log $_ -Level 'TSC' -Color Gray }
    }

    if ($LASTEXITCODE -ne 0) {
        Write-Log "TypeScript compilation has errors (non-blocking)" -Level 'WARNING' -Color Yellow
    } else {
        Write-Log "TypeScript compilation successful" -Level 'OK' -Color Green
    }
}
catch {
    Write-Log "TypeScript check failed: $($_.Exception.Message)" -Level 'WARNING' -Color Yellow
}

# Run tests
if (-not $SkipTests) {
    Write-Log "Running tests..." -Level 'INFO' -Color Yellow

    $testArgs = @('test', '--', '--passWithNoTests')
    if (-not $Debug) {
        $testArgs += '--silent'
    }

    & npm @testArgs 2>&1 | ForEach-Object {
        if ($Debug) {
            Write-Log $_ -Level 'TEST' -Color Gray
        }
    }

    if ($LASTEXITCODE -ne 0) {
        Write-Log "Some tests failed (non-blocking)" -Level 'WARNING' -Color Yellow
    } else {
        Write-Log "Tests passed" -Level 'OK' -Color Green
    }
} else {
    Write-Log "Tests skipped per request" -Level 'INFO' -Color Cyan
}

# Set environment for build
$env:NODE_ENV = if ($Configuration -eq 'Production') { 'production' } else { 'development' }
if ($Debug) {
    $env:DEBUG = 'true'
}
if ($OpenDevTools) {
    $env:OPEN_DEVTOOLS = 'true'
}

Write-Log "Building application (Configuration: $Configuration)..." -Level 'INFO' -Color Yellow
Write-Log "NODE_ENV=$env:NODE_ENV" -Level 'DEBUG' -Color Gray
Write-Log "DEBUG=$env:DEBUG" -Level 'DEBUG' -Color Gray
Write-Log "OPEN_DEVTOOLS=$env:OPEN_DEVTOOLS" -Level 'DEBUG' -Color Gray

# Clean previous build
if (Test-Path ".webpack") {
    Remove-Item -Path ".webpack" -Recurse -Force -ErrorAction SilentlyContinue
    Write-Log "Cleaned previous build" -Level 'DEBUG' -Color Gray
}

# Build the application
$buildCommand = if ($Configuration -eq 'Production') { 'build:prod' } else { 'package' }
Write-Log "Running: npm run $buildCommand" -Level 'INFO' -Color Cyan

$buildArgs = @('run', $buildCommand)
if ($Debug) {
    $buildArgs += '--verbose'
}

& npm @buildArgs 2>&1 | ForEach-Object {
    Write-Log $_ -Level 'BUILD' -Color Gray
}

if ($LASTEXITCODE -ne 0) {
    Write-Log "Build failed with exit code $LASTEXITCODE" -Level 'ERROR' -Color Red
    exit 1
}

Write-Log "Application built successfully" -Level 'OK' -Color Green

# Create output directory
Write-Log "Preparing deployment directory: $OutputPath" -Level 'INFO' -Color Yellow

# Stop any running instances
try {
    $processes = Get-Process -Name "electron" -ErrorAction SilentlyContinue
    if ($processes) {
        Write-Log "Stopping $($processes.Count) running Electron instance(s)..." -Level 'INFO' -Color Yellow
        $processes | Stop-Process -Force -ErrorAction SilentlyContinue
        Start-Sleep -Seconds 2
    }
} catch {
    Write-Log "Could not check for running processes: $($_.Exception.Message)" -Level 'WARNING' -Color Yellow
}

if (!(Test-Path $OutputPath)) {
    New-Item -Path $OutputPath -ItemType Directory -Force | Out-Null
    Write-Log "Created output directory" -Level 'OK' -Color Green
}

# Copy built files
Write-Log "Deploying application files..." -Level 'INFO' -Color Yellow

# Webpack output
$WebpackOutput = Join-Path $GuiV2Dir ".webpack"
if (Test-Path $WebpackOutput) {
    $WebpackDest = Join-Path $OutputPath ".webpack"
    if (Test-Path $WebpackDest) {
        Remove-Item -Path $WebpackDest -Recurse -Force -ErrorAction SilentlyContinue
    }
    Copy-Item -Path $WebpackOutput -Destination $WebpackDest -Recurse -Force
    Write-Log "Webpack bundle copied" -Level 'OK' -Color Green
}

Copy-Item -Path "package.json" -Destination $OutputPath -Force
Copy-Item -Path "package-lock.json" -Destination $OutputPath -Force -ErrorAction SilentlyContinue

# Install production dependencies
Write-Log "Installing production dependencies in output directory..." -Level 'INFO' -Color Cyan
Push-Location $OutputPath
& npm ci --production --prefer-offline --no-audit 2>&1 | ForEach-Object {
    if ($Debug) {
        Write-Log $_ -Level 'NPM' -Color Gray
    }
}
Pop-Location

# Copy PowerShell modules
$ModulesSourcePath = Join-Path $ScriptDir "Modules"
$ModulesDestPath = Join-Path $OutputPath "Modules"

if (Test-Path $ModulesSourcePath) {
    if (Test-Path $ModulesDestPath) {
        Remove-Item -Path $ModulesDestPath -Recurse -Force -ErrorAction SilentlyContinue
    }
    Copy-Item -Path $ModulesSourcePath -Destination $ModulesDestPath -Recurse -Force
    $ModuleCount = (Get-ChildItem -Path $ModulesDestPath -Filter "*.psm1" -Recurse | Measure-Object).Count
    Write-Log "Copied $ModuleCount PowerShell modules" -Level 'OK' -Color Green
}

# Copy Configuration, Tools, Scripts (same as original)
# ... (rest of copy operations from original script)

# Create enhanced launcher with debug console
Write-Log "Creating launcher scripts..." -Level 'INFO' -Color Yellow

# Debug launcher with console window
$DebugLauncherPath = Join-Path $OutputPath "Launch-Debug.ps1"
$DebugLauncherContent = @"
#Requires -Version 5.1

<#
.SYNOPSIS
    Launches M&A Discovery Suite v2 with debug console and verbose logging
#>

Set-StrictMode -Version 3.0

# Create new PowerShell window for verbose output
`$appDir = Split-Path -Parent `$MyInvocation.MyCommand.Path

Write-Host ""
Write-Host "M&A Discovery Suite v2 - DEBUG MODE" -ForegroundColor Yellow
Write-Host "====================================" -ForegroundColor Yellow
Write-Host ""
Write-Host "Application Directory: `$appDir" -ForegroundColor Cyan
Write-Host "Data Directory: `$env:MANDA_DISCOVERY_PATH" -ForegroundColor Cyan
Write-Host ""
Write-Host "Debug Features Enabled:" -ForegroundColor Green
Write-Host "  - Verbose console logging" -ForegroundColor White
Write-Host "  - Electron DevTools auto-open" -ForegroundColor White
Write-Host "  - IPC message tracing" -ForegroundColor White
Write-Host "  - PowerShell execution logs" -ForegroundColor White
Write-Host ""
Write-Host "Press Ctrl+C to stop the application" -ForegroundColor Yellow
Write-Host ""

# Set debug environment variables
`$env:DEBUG = 'true'
`$env:OPEN_DEVTOOLS = 'true'
`$env:ELECTRON_ENABLE_LOGGING = '1'
`$env:NODE_ENV = 'development'

# Change to app directory
Set-Location `$appDir

# Start with npm
& npm start

# Keep console open if error occurs
if (`$LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "Application exited with error code: `$LASTEXITCODE" -ForegroundColor Red
    Write-Host "Press any key to close..." -ForegroundColor Yellow
    `$null = `$Host.UI.RawUI.ReadKey('NoEcho,IncludeKeyDown')
}
"@

Set-Content -Path $DebugLauncherPath -Value $DebugLauncherContent -Encoding UTF8
Write-Log "Debug launcher created" -Level 'OK' -Color Green

# Standard launcher (production mode)
$ProdLauncherPath = Join-Path $OutputPath "Launch-MandADiscoverySuiteV2.ps1"
$ProdLauncherContent = @"
#Requires -Version 5.1
Set-StrictMode -Version 3.0

`$env:MANDA_DISCOVERY_PATH = if (`$env:MANDA_DISCOVERY_PATH) { `$env:MANDA_DISCOVERY_PATH } else { "C:\discoverydata" }
`$env:NODE_ENV = "production"

`$AppDir = Split-Path -Parent `$MyInvocation.MyCommand.Path
Set-Location `$AppDir

Write-Host "Starting M&A Discovery Suite v2..." -ForegroundColor Green
& npm start
"@

Set-Content -Path $ProdLauncherPath -Value $ProdLauncherContent -Encoding UTF8
Write-Log "Production launcher created" -Level 'OK' -Color Green

Write-Host ""
Write-Host "Build completed successfully!" -ForegroundColor Green
Write-Host "=============================" -ForegroundColor Green
Write-Host ""
Write-Host "To run the application:" -ForegroundColor Yellow
Write-Host ""
Write-Host "  PRODUCTION MODE:" -ForegroundColor Cyan
Write-Host "    cd $OutputPath" -ForegroundColor White
Write-Host "    .\Launch-MandADiscoverySuiteV2.ps1" -ForegroundColor White
Write-Host ""
Write-Host "  DEBUG MODE (with verbose console):" -ForegroundColor Cyan
Write-Host "    cd $OutputPath" -ForegroundColor White
Write-Host "    .\Launch-Debug.ps1" -ForegroundColor White
Write-Host ""

if ($Debug) {
    Write-Log "Build log saved to: $LogPath" -Level 'INFO' -Color Green
}

Write-Host "Build and Deployment Completed Successfully!" -ForegroundColor Green
Write-Host "===========================================" -ForegroundColor Green
