#Requires -Version 5.1

param(
    [switch]$Clean,
    [switch]$Launch
)

$ErrorActionPreference = 'Stop'

Write-Host ""
Write-Host "=========================================================" -ForegroundColor Blue
Write-Host "  UserMandA GUI v2 - Simple Build Script" -ForegroundColor Blue
Write-Host "  Based on successful build 2025-10-28" -ForegroundColor Blue
Write-Host "=========================================================" -ForegroundColor Blue
Write-Host ""

$GuiV2Dir = "D:\Scripts\UserMandA\guiv2"

if (-not (Test-Path $GuiV2Dir)) {
    Write-Host "ERROR: GUI v2 directory not found: $GuiV2Dir" -ForegroundColor Red
    exit 1
}

Set-Location $GuiV2Dir

# Environment check
Write-Host "INFO: Node.js: $(node --version)" -ForegroundColor Cyan
Write-Host "INFO: npm: $(npm --version)" -ForegroundColor Cyan
Write-Host "INFO: Working directory: $GuiV2Dir" -ForegroundColor Cyan
Write-Host ""

# Clean if requested
if ($Clean) {
    Write-Host "Cleaning build artifacts..." -ForegroundColor Yellow

    $pathsToClean = @("node_modules", "dist", "build", "out", ".webpack")
    foreach ($path in $pathsToClean) {
        if (Test-Path $path) {
            Write-Host "  Removing $path..." -ForegroundColor Gray
            Remove-Item -Path $path -Recurse -Force -ErrorAction SilentlyContinue
        }
    }

    Write-Host "SUCCESS: Clean complete" -ForegroundColor Green
    Write-Host ""
}

# Install dependencies
if (-not (Test-Path "node_modules")) {
    Write-Host "Installing dependencies..." -ForegroundColor Yellow
    npm ci 2>&1 | Out-Null
    Write-Host "SUCCESS: Dependencies installed" -ForegroundColor Green
    Write-Host ""
}
else {
    Write-Host "SUCCESS: Dependencies already installed" -ForegroundColor Green
    Write-Host ""
}

# Build
Write-Host "Building application..." -ForegroundColor Yellow
$buildStart = Get-Date

npm run build 2>&1 | Out-Null

if ($LASTEXITCODE -eq 0) {
    $buildEnd = Get-Date
    $duration = ($buildEnd - $buildStart).TotalSeconds
    Write-Host "SUCCESS: Build completed in $([math]::Round($duration, 2)) seconds" -ForegroundColor Green

    if (Test-Path ".webpack\main\main.js") {
        $size = (Get-Item ".webpack\main\main.js").Length / 1KB
        Write-Host "  Main bundle: $([math]::Round($size, 2)) KB" -ForegroundColor Cyan
    }
}
else {
    Write-Host "ERROR: Build failed with exit code $LASTEXITCODE" -ForegroundColor Red
    exit 1
}

# Summary
Write-Host ""
Write-Host "=========================================================" -ForegroundColor Blue
Write-Host "  Build Summary" -ForegroundColor Blue
Write-Host "=========================================================" -ForegroundColor Blue
Write-Host ""
Write-Host "SUCCESS: Build Status: SUCCESS" -ForegroundColor Green
Write-Host "OUTPUT: $GuiV2Dir\.webpack\main\main.js" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "  Run 'npm start' to launch the application" -ForegroundColor White
Write-Host ""
Write-Host "Known Issues:" -ForegroundColor Yellow
Write-Host "  WARNING: App crashes on launch (service initialization error)" -ForegroundColor Red
Write-Host "  WARNING: 371 TypeScript errors (type checking disabled)" -ForegroundColor Red
Write-Host ""

# Launch if requested
if ($Launch) {
    Write-Host "Launching application..." -ForegroundColor Yellow
    Write-Host "  (Note: May crash during initialization)" -ForegroundColor Gray
    Write-Host ""
    npm start
}
