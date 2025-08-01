#Requires -Version 5.1

<#
.SYNOPSIS
    Builds the M&A Discovery Suite GUI application

.DESCRIPTION
    This script compiles the WPF application using .NET 6 and creates a self-contained executable
    that can be distributed and run on Windows systems without requiring .NET to be installed.

.PARAMETER Configuration
    Build configuration: Debug or Release (default: Release)

.PARAMETER OutputPath
    Output path for the compiled application (default: .\bin\Release)

.PARAMETER SelfContained
    Create a self-contained deployment (default: false)

.EXAMPLE
    .\Build-GUI.ps1
    Builds the application in Release configuration

.EXAMPLE
    .\Build-GUI.ps1 -Configuration Debug
    Builds the application in Debug configuration
#>

[CmdletBinding()]
param(
    [Parameter(Mandatory = $false)]
    [ValidateSet('Debug', 'Release')]
    [string]$Configuration = 'Release',
    
    [Parameter(Mandatory = $false)]
    [string]$OutputPath = "C:\EnterpriseDiscovery\bin\$Configuration",
    
    [Parameter(Mandatory = $false)]
    [switch]$SelfContained
)

Set-StrictMode -Version 3.0
$ErrorActionPreference = 'Stop'

Write-Host "M&A Discovery Suite - GUI Build Script" -ForegroundColor Green
Write-Host "=======================================" -ForegroundColor Green

# Get script directory
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $ScriptDir

# Check if .NET 6 SDK is installed
Write-Host "Checking for .NET 6 SDK..." -ForegroundColor Yellow

try {
    $dotnetVersion = & dotnet --version 2>$null
    if ($LASTEXITCODE -ne 0) {
        throw "dotnet command not found"
    }
    
    $majorVersion = [int]($dotnetVersion.Split('.')[0])
    if ($majorVersion -lt 6) {
        throw "Requires .NET 6 or later, found version $dotnetVersion"
    }
    
    Write-Host "Found .NET version: $dotnetVersion" -ForegroundColor Green
}
catch {
    Write-Error @"
.NET 6 SDK is required but not found or not properly installed.
Please download and install .NET 6 SDK from: https://dotnet.microsoft.com/download/dotnet/6.0

Error: $($_.Exception.Message)
"@
    exit 1
}

# Check required files
$RequiredFiles = @(
    'MandADiscoverySuite.csproj',
    'App.xaml',
    'App.xaml.cs',
    'MandADiscoverySuite.xaml',
    'MandADiscoverySuite.xaml.cs'
)

Write-Host "Checking required files..." -ForegroundColor Yellow
foreach ($file in $RequiredFiles) {
    if (!(Test-Path $file)) {
        Write-Error "Required file not found: $file"
        exit 1
    }
    Write-Host "  [OK] $file" -ForegroundColor Green
}

# Clean previous builds
Write-Host "Cleaning previous builds..." -ForegroundColor Yellow
if (Test-Path "bin") {
    Remove-Item -Path "bin" -Recurse -Force
}
if (Test-Path "obj") {
    Remove-Item -Path "obj" -Recurse -Force
}

# Restore dependencies
Write-Host "Restoring dependencies..." -ForegroundColor Yellow
& dotnet restore
if ($LASTEXITCODE -ne 0) {
    Write-Error "Failed to restore dependencies"
    exit 1
}

# Build the application
Write-Host "Building application..." -ForegroundColor Yellow

$BuildArgs = @(
    'publish'
    '--configuration', $Configuration
    '--output', $OutputPath
    '--verbosity', 'minimal'
    '--nologo'
)

if ($SelfContained) {
    $BuildArgs += '--self-contained', 'true'
    $BuildArgs += '--runtime', 'win-x64'
    Write-Host "Building self-contained application..." -ForegroundColor Cyan
} else {
    $BuildArgs += '--self-contained', 'false'
    Write-Host "Building framework-dependent application..." -ForegroundColor Cyan
}

& dotnet @BuildArgs

if ($LASTEXITCODE -ne 0) {
    Write-Error "Build failed"
    exit 1
}

# Create application icon if it doesn't exist
$IconPath = Join-Path $OutputPath "app.ico"
if (!(Test-Path $IconPath)) {
    Write-Host "Creating default application icon..." -ForegroundColor Yellow
    # Create a simple ICO file (this is a basic implementation)
    # In a real scenario, you'd want to use a proper icon file
    $EmptyIconBytes = @(
        0x00, 0x00, 0x01, 0x00, 0x01, 0x00, 0x10, 0x10, 0x00, 0x00, 0x01, 0x00, 0x08, 0x00,
        0x68, 0x05, 0x00, 0x00, 0x16, 0x00, 0x00, 0x00
    )
    [System.IO.File]::WriteAllBytes($IconPath, $EmptyIconBytes)
}

# Create a batch file launcher
$LauncherPath = Join-Path $OutputPath "Launch-MandADiscoverySuite.bat"

# Create the batch file content using an array and join
$LauncherLines = @(
    '@echo off',
    'REM M&A Discovery Suite Launcher',
    'REM Ensures PowerShell execution policy allows running the application',
    '',
    'echo Starting M&A Discovery Suite...',
    'echo.',
    '',
    'REM Check if .NET 6 runtime is available',
    'dotnet --version >nul 2>&1',
    'if errorlevel 1 (',
    '    echo ERROR: .NET 6 runtime is required but not found.',
    '    echo Please download and install .NET 6 runtime from:',
    '    echo https://dotnet.microsoft.com/download/dotnet/6.0',
    '    echo.',
    '    pause',
    '    exit /b 1',
    ')',
    '',
    'REM Set PowerShell execution policy for current user (if needed)',
    'powershell -Command "Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned -Force -ErrorAction SilentlyContinue"',
    '',
    'REM Launch the application',
    '"MandADiscoverySuite.exe"',
    '',
    'if errorlevel 1 (',
    '    echo.',
    '    echo Application exited with an error.',
    '    pause',
    ')'
)

$LauncherContent = $LauncherLines -join "`r`n"

Set-Content -Path $LauncherPath -Value $LauncherContent -Encoding ASCII

# Copy PowerShell modules to the output directory
$ModulesSourcePath = Join-Path (Split-Path $ScriptDir -Parent) "Modules"
$ModulesDestPath = Join-Path $OutputPath "Modules"

if (Test-Path $ModulesSourcePath) {
    Write-Host "Copying PowerShell modules..." -ForegroundColor Yellow
    Copy-Item -Path $ModulesSourcePath -Destination $ModulesDestPath -Recurse -Force
    Write-Host "  [OK] Modules copied to output directory" -ForegroundColor Green
}

# Create configuration directory
$ConfigDestPath = Join-Path $OutputPath "Configuration"
$ConfigSourcePath = Join-Path (Split-Path $ScriptDir -Parent) "Configuration"

if (Test-Path $ConfigSourcePath) {
    Write-Host "Copying configuration files..." -ForegroundColor Yellow
    Copy-Item -Path $ConfigSourcePath -Destination $ConfigDestPath -Recurse -Force
    Write-Host "  [OK] Configuration files copied" -ForegroundColor Green
}

# Get build information
$ExePath = Join-Path $OutputPath "MandADiscoverySuite.exe"
if (Test-Path $ExePath) {
    $FileInfo = Get-Item $ExePath
    $FileSizeMB = [math]::Round($FileInfo.Length / 1MB, 2)
    
    Write-Host ""
    Write-Host "Build completed successfully!" -ForegroundColor Green
    Write-Host "==============================" -ForegroundColor Green
    Write-Host "Configuration: $Configuration" -ForegroundColor Cyan
    Write-Host "Output Path: $OutputPath" -ForegroundColor Cyan
    Write-Host "Executable: MandADiscoverySuite.exe" -ForegroundColor Cyan
    Write-Host "File Size: $FileSizeMB MB" -ForegroundColor Cyan
    Write-Host "Self-Contained: $SelfContained" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "To run the application:" -ForegroundColor Yellow
    Write-Host "  1. Navigate to: $OutputPath" -ForegroundColor White
    Write-Host "  2. Run: Launch-MandADiscoverySuite.bat" -ForegroundColor White
    Write-Host "  OR" -ForegroundColor Yellow
    Write-Host "  2. Run: MandADiscoverySuite.exe" -ForegroundColor White
    Write-Host ""
    
    # Check if this is a one-click build environment
    if ($env:VSCODE_CLI -or $env:TERM_PROGRAM -eq "vscode") {
        Write-Host "VSCode detected - You can now run the application from the integrated terminal" -ForegroundColor Magenta
    }
    
} else {
    Write-Error "Build appeared to succeed but executable not found at: $ExePath"
    exit 1
}

# Create a deployment package
if ($Configuration -eq 'Release') {
    Write-Host "Creating deployment package..." -ForegroundColor Yellow
    
    $PackageName = "MandADiscoverySuite-v1.0-$(Get-Date -Format 'yyyyMMdd')"
    $PackagePath = "..\$PackageName.zip"
    
    try {
        # Use .NET compression if available, otherwise fall back to PowerShell
        if (Get-Command "Compress-Archive" -ErrorAction SilentlyContinue) {
            Compress-Archive -Path "$OutputPath\*" -DestinationPath $PackagePath -Force
            Write-Host "  [OK] Deployment package created: $PackageName.zip" -ForegroundColor Green
        }
    }
    catch {
        Write-Warning "Could not create deployment package: $($_.Exception.Message)"
    }
}

Write-Host ""
Write-Host "Build process completed!" -ForegroundColor Green