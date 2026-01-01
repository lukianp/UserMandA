# Enterprise Discovery Suite Demo Build Script
# Builds guiv2 into a demo exe, packages it in demo/ directory, and zips it

Set-Location $PSScriptRoot

Write-Host "=== Enterprise Discovery Suite Demo Builder ===" -ForegroundColor Green
Write-Host "Building demo version with UI testing capabilities..." -ForegroundColor Yellow

# Install dependencies
Write-Host "Step 1: Installing npm dependencies..."
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Error "npm install failed"
    exit 1
}

# Build webpack bundles
Write-Host "Step 2: Building webpack bundles..."
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Error "Build failed"
    exit 1
}

# Create Electron executable
Write-Host "Step 3: Creating Electron executable for Windows..."
npx electron-forge make --platform win32
if ($LASTEXITCODE -ne 0) {
    Write-Error "Electron Forge make failed"
    exit 1
}

# Create demo directory
Write-Host "Step 4: Setting up demo directory..."
if (Test-Path demo) {
    Remove-Item demo -Recurse -Force
}
New-Item -ItemType Directory -Force -Path demo | Out-Null

# Copy build output to demo directory
Write-Host "Step 5: Copying build output to demo directory..."
$sourcePath = "out\make\squirrel.windows\x64"
if (Test-Path $sourcePath) {
    Copy-Item -Path "$sourcePath\*" -Destination demo -Recurse
} else {
    Write-Error "Build output not found at $sourcePath"
    exit 1
}

# Create a simple launcher script
Write-Host "Step 6: Creating launcher script..."
$launcherContent = @"
@echo off
echo Starting Enterprise Discovery Suite Demo...
echo.
start "" "%~dp0Enterprise Discovery Suite 2.0.0 Setup 2.0.0.exe"
"@
$launcherContent | Out-File -FilePath "demo\run-demo.bat" -Encoding ASCII

# Zip the demo directory
Write-Host "Step 7: Zipping demo directory..."
$zipPath = "enterprise-discovery-demo.zip"
if (Test-Path $zipPath) {
    Remove-Item $zipPath -Force
}
Compress-Archive -Path demo -DestinationPath $zipPath
if ($LASTEXITCODE -ne 0) {
    Write-Error "Zipping failed"
    exit 1
}

Write-Host ""
Write-Host "=== Build Complete! ===" -ForegroundColor Green
Write-Host "Demo package created: $zipPath" -ForegroundColor Cyan
Write-Host "Contents:" -ForegroundColor White
Get-ChildItem demo | ForEach-Object { Write-Host "  - $($_.Name)" -ForegroundColor Gray }
Write-Host ""
Write-Host "To distribute:" -ForegroundColor Yellow
Write-Host "1. Copy $zipPath to another computer" -ForegroundColor White
Write-Host "2. Extract the ZIP contents" -ForegroundColor White
Write-Host "3. Run run-demo.bat or the .exe directly" -ForegroundColor White
Write-Host ""
Write-Host "Note: Demo mode is enabled - all discovery uses dummy data" -ForegroundColor Magenta