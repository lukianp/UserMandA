# Enterprise Discovery Suite Demo Builder
# Copies guiv2/ to C:\enterprisediscoverydemo, builds it there, and creates ZIP

$demoPath = "$PSScriptRoot\demo-build"

Write-Host "=== Enterprise Discovery Suite Demo Builder ===" -ForegroundColor Green
Write-Host "Building demo version in isolated directory..." -ForegroundColor Yellow

# Clean up previous demo directory
if (Test-Path $demoPath) {
    Write-Host "Removing existing demo directory..."
    Remove-Item $demoPath -Recurse -Force
}

# Copy guiv2 to demo directory
Write-Host "Step 1: Copying guiv2/ to $demoPath..."
New-Item -ItemType Directory -Path $demoPath -Force | Out-Null
Copy-Item -Path "guiv2\*" -Destination $demoPath -Recurse
if (!(Test-Path "$demoPath\package.json")) {
    Write-Error "Copy failed - package.json not found"
    exit 1
}

# Modify preload.ts for demo compatibility (remove TypeScript syntax)
Write-Host "Step 1.5: Preparing preload.ts for demo build..."
$preloadPath = "$demoPath\src\preload.ts"
(Get-Content $preloadPath) -replace 'import type \{ ElectronAPI \} from \./renderer/types/electron;', '// import type { ElectronAPI } from ./renderer/types/electron;' | Set-Content $preloadPath
(Get-Content $preloadPath) -replace 'import type \{[\s\S]*?\} from \./shared/types;', '// import types from ./shared/types;' | Set-Content $preloadPath
(Get-Content $preloadPath) -replace 'import type \{ ExecutionOptions \} from \./types/shared;', '// import type { ExecutionOptions } from ./types/shared;' | Set-Content $preloadPath
(Get-Content $preloadPath) -replace 'const electronAPI: ElectronAPI = \{', 'const electronAPI = {' | Set-Content $preloadPath
(Get-Content $preloadPath) -replace '<T = any>', '' | Set-Content $preloadPath
(Get-Content $preloadPath) -replace '<T = unknown>', '' | Set-Content $preloadPath
(Get-Content $preloadPath) -replace ': any', '' | Set-Content $preloadPath
(Get-Content $preloadPath) -replace ': ProgressData', '' | Set-Content $preloadPath
(Get-Content $preloadPath) -replace ': OutputData', '' | Set-Content $preloadPath
(Get-Content $preloadPath) -replace ': string', '' | Set-Content $preloadPath
(Get-Content $preloadPath) -replace ': boolean', '' | Set-Content $preloadPath
(Get-Content $preloadPath) -replace ': unknown', '' | Set-Content $preloadPath
(Get-Content $preloadPath) -replace '\(_: ', '(_' | Set-Content $preloadPath

# Change to demo directory
Set-Location $demoPath

# Install dependencies
Write-Host "Step 2: Installing npm dependencies..."
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Error "npm install failed"
    exit 1
}

# Build webpack bundles
Write-Host "Step 3: Building webpack bundles..."
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Error "Build failed"
    exit 1
}

# Create Electron executable
Write-Host "Step 4: Creating Electron executable for Windows..."
npx electron-forge make --platform win32
if ($LASTEXITCODE -ne 0) {
    Write-Error "Electron Forge make failed"
    exit 1
}

# Create demo package directory
Write-Host "Step 5: Setting up demo package..."
if (Test-Path "demo") {
    Remove-Item "demo" -Recurse -Force
}
New-Item -ItemType Directory -Force -Path "demo" | Out-Null

# Copy build output to demo directory
$sourcePath = "out\make\squirrel.windows\x64"
if (Test-Path $sourcePath) {
    Copy-Item -Path "$sourcePath\*" -Destination "demo" -Recurse
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
$zipPath = "$PSScriptRoot\enterprise-discovery-demo.zip"
if (Test-Path $zipPath) {
    Remove-Item $zipPath -Force
}
Compress-Archive -Path "demo" -DestinationPath $zipPath
if ($LASTEXITCODE -ne 0) {
    Write-Error "Zipping failed"
    exit 1
}

Write-Host ""
Write-Host "=== Build Complete! ===" -ForegroundColor Green
Write-Host "Demo package created: $zipPath" -ForegroundColor Cyan
Write-Host "Contents:" -ForegroundColor White
Get-ChildItem "demo" | ForEach-Object { Write-Host "  - $($_.Name)" -ForegroundColor Gray }
Write-Host ""
Write-Host "To distribute:" -ForegroundColor Yellow
Write-Host "1. Copy $zipPath to another computer" -ForegroundColor White
Write-Host "2. Extract the ZIP contents" -ForegroundColor White
Write-Host "3. Run run-demo.bat or the .exe directly" -ForegroundColor White
Write-Host ""
Write-Host "Note: Demo mode is enabled - all discovery uses dummy data" -ForegroundColor Magenta

# Clean up demo directory
Write-Host "Cleaning up temporary demo directory..."
Set-Location $PSScriptRoot
Remove-Item $demoPath -Recurse -Force