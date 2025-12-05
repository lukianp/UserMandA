#Requires -Version 5.1

<#
.SYNOPSIS
    Deploys the M&A Discovery Suite to the target system
.DESCRIPTION
    This script deploys the M&A Discovery Suite application with all dependencies
    to the standard deployment location (C:\EnterpriseDiscovery)
.PARAMETER SourcePath
    Path to the built application files (default: .\GUI\bin\Release)
.PARAMETER Force
    Force overwrite of existing installation
.EXAMPLE
    .\Deploy-MandADiscoverySuite.ps1
    Deploys from default build location
.EXAMPLE
    .\Deploy-MandADiscoverySuite.ps1 -SourcePath "C:\Build\MandADiscoverySuite" -Force
    Deploys from custom location with force overwrite
#>

[CmdletBinding()]
param(
    [Parameter(Mandatory = $false)]
    [string]$SourcePath = ".\GUI\bin\Release",
    
    [Parameter(Mandatory = $false)]
    [switch]$Force
)

Set-StrictMode -Version 3.0
$ErrorActionPreference = 'Stop'

# Configuration
$TargetPath = "C:\EnterpriseDiscovery"
$DataPath = "c:\discoverydata"

Write-Host "M&A Discovery Suite - Deployment Script" -ForegroundColor Green
Write-Host "=======================================" -ForegroundColor Green

# Resolve source path
if (!(Test-Path $SourcePath)) {
    # Try relative to script location
    $ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
    $SourcePath = Join-Path $ScriptDir $SourcePath
    
    if (!(Test-Path $SourcePath)) {
        Write-Error "Source path not found: $SourcePath"
        exit 1
    }
}

$SourcePath = Resolve-Path $SourcePath
Write-Host "Source Path: $SourcePath" -ForegroundColor Cyan
Write-Host "Target Path: $TargetPath" -ForegroundColor Cyan

# Check if target exists
if (Test-Path $TargetPath) {
    if ($Force) {
        Write-Host "Removing existing installation..." -ForegroundColor Yellow
        Remove-Item -Path $TargetPath -Recurse -Force
    } else {
        $response = Read-Host "Target directory exists. Overwrite? (y/N)"
        if ($response -ne 'y' -and $response -ne 'Y') {
            Write-Host "Deployment cancelled." -ForegroundColor Yellow
            exit 0
        }
        Remove-Item -Path $TargetPath -Recurse -Force
    }
}

# Create target directory
Write-Host "Creating target directory..." -ForegroundColor Yellow
New-Item -Path $TargetPath -ItemType Directory -Force | Out-Null

# Copy application files
Write-Host "Copying application files..." -ForegroundColor Yellow
Copy-Item -Path "$SourcePath\*" -Destination $TargetPath -Recurse -Force

# Verify critical components
Write-Host "Verifying deployment..." -ForegroundColor Yellow

$RequiredFiles = @(
    "MandADiscoverySuite.exe",
    "Launch-MandADiscoverySuite.bat",
    "Modules\Core\CompanyProfileManager.psm1",
    "Modules\Discovery\ActiveDirectoryDiscovery.psm1",
    "Configuration\default-config.json"
)

$MissingFiles = @()
foreach ($file in $RequiredFiles) {
    $filePath = Join-Path $TargetPath $file
    if (!(Test-Path $filePath)) {
        $MissingFiles += $file
    }
}

if ($MissingFiles.Count -gt 0) {
    Write-Error "Deployment verification failed. Missing files: $($MissingFiles -join ', ')"
    exit 1
}

# Create data directory
if (!(Test-Path $DataPath)) {
    Write-Host "Creating data directory..." -ForegroundColor Yellow
    New-Item -Path $DataPath -ItemType Directory -Force | Out-Null
}

# Set permissions (if running as admin)
try {
    $currentUser = [System.Security.Principal.WindowsIdentity]::GetCurrent()
    $principal = New-Object System.Security.Principal.WindowsPrincipal($currentUser)
    $isAdmin = $principal.IsInRole([System.Security.Principal.WindowsBuiltInRole]::Administrator)
    
    if ($isAdmin) {
        Write-Host "Setting directory permissions..." -ForegroundColor Yellow
        
        # Give Users full control to data directory
        $acl = Get-Acl $DataPath
        $accessRule = New-Object System.Security.AccessControl.FileSystemAccessRule("Users", "FullControl", "ContainerInherit,ObjectInherit", "None", "Allow")
        $acl.SetAccessRule($accessRule)
        Set-Acl -Path $DataPath -AclObject $acl
        
        Write-Host "  [OK] Data directory permissions set" -ForegroundColor Green
    }
} catch {
    Write-Warning "Could not set permissions: $($_.Exception.Message)"
}

# Create desktop shortcut (optional)
try {
    $WshShell = New-Object -comObject WScript.Shell
    $Shortcut = $WshShell.CreateShortcut("$([Environment]::GetFolderPath('Desktop'))\M&A Discovery Suite.lnk")
    $Shortcut.TargetPath = Join-Path $TargetPath "Launch-MandADiscoverySuite.bat"
    $Shortcut.WorkingDirectory = $TargetPath
    $Shortcut.Description = "M&A Discovery Suite - Enterprise Discovery Tool"
    $Shortcut.Save()
    
    Write-Host "  [OK] Desktop shortcut created" -ForegroundColor Green
} catch {
    Write-Warning "Could not create desktop shortcut: $($_.Exception.Message)"
}

# Final verification
$ModuleCount = (Get-ChildItem -Path (Join-Path $TargetPath "Modules") -Filter "*.psm1" -Recurse).Count
$ConfigCount = (Get-ChildItem -Path (Join-Path $TargetPath "Configuration") -Filter "*.json").Count

Write-Host ""
Write-Host "Deployment completed successfully!" -ForegroundColor Green
Write-Host "==================================" -ForegroundColor Green
Write-Host "Application Path: $TargetPath" -ForegroundColor Cyan
Write-Host "Data Path: $DataPath" -ForegroundColor Cyan
Write-Host "Modules Deployed: $ModuleCount" -ForegroundColor Cyan
Write-Host "Configuration Files: $ConfigCount" -ForegroundColor Cyan
Write-Host ""
Write-Host "To run the application:" -ForegroundColor Yellow
Write-Host "  1. Navigate to: $TargetPath" -ForegroundColor White
Write-Host "  2. Run: Launch-MandADiscoverySuite.bat" -ForegroundColor White
Write-Host "  OR double-click the desktop shortcut" -ForegroundColor White
Write-Host ""
Write-Host "The application is now ready for use!" -ForegroundColor Green