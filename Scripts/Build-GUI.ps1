# Build-GUI.ps1 - Build script for M&A Discovery Suite GUI
# Ensures the WPF application is built successfully and places executable in expected location

[CmdletBinding()]
param()

$ErrorActionPreference = 'Stop'

Write-Host "Building M&A Discovery Suite GUI..." -ForegroundColor Green

# Change to GUI directory
$GuiDir = Join-Path $PSScriptRoot "..\GUI"
Push-Location $GuiDir

try {
    # Run dotnet build in Release configuration (specify project file)
    Write-Host "Running dotnet build TestUnified.csproj -c Release..." -ForegroundColor Yellow
    & dotnet build TestUnified.csproj -c Release

    if ($LASTEXITCODE -ne 0) {
        Write-Error "Build failed with exit code $LASTEXITCODE"
        exit $LASTEXITCODE
    }

    Write-Host "Build completed successfully!" -ForegroundColor Green
}
finally {
    Pop-Location
}