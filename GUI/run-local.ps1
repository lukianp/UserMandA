#Requires -Version 5.1

<#
.SYNOPSIS
    Runs the M&A Discovery Suite GUI directly from the build output directory

.DESCRIPTION
    This script runs the application directly from .\bin\Release to avoid 
    the build/deploy split and make development easier.
#>

[CmdletBinding()]
param()

$ErrorActionPreference = 'Stop'

Write-Host "M&A Discovery Suite - Local Runner" -ForegroundColor Green
Write-Host "==================================" -ForegroundColor Green

# Check if build exists
$ExePath = Join-Path $PSScriptRoot "bin\Release\net6.0-windows\MandADiscoverySuite.exe"

if (-not (Test-Path $ExePath)) {
    Write-Host "Build not found at: $ExePath" -ForegroundColor Red
    Write-Host "Running build first..." -ForegroundColor Yellow
    & "$PSScriptRoot\Build-GUI.ps1"
    
    if (-not (Test-Path $ExePath)) {
        Write-Error "Build failed - executable not found"
        exit 1
    }
}

Write-Host "Starting application from build directory..." -ForegroundColor Green
Start-Process -FilePath $ExePath -WorkingDirectory (Split-Path $ExePath) -PassThru

Write-Host "Application started successfully!" -ForegroundColor Green