#Requires -Version 5.1
param(
    [switch]$Dev,
    [switch]$Production,
    [switch]$Clean
)

$ErrorActionPreference = 'Stop'

if (-not $Dev -and -not $Production) { $Dev = $true }

Write-Host ""
Write-Host "=========================================================" -ForegroundColor Blue
Write-Host "  UserMandA Discovery Suite v2" -ForegroundColor Blue
Write-Host "=========================================================" -ForegroundColor Blue
Write-Host ""

$WorkspaceDir = "D:\Scripts\UserMandA\guiv2"
$CanonicalDir = "C:\enterprisediscovery"
$ModulesSourceDir = "D:\Scripts\UserMandA\Modules"

if (-not (Test-Path $WorkspaceDir)) {
    Write-Host "ERROR: Workspace not found: $WorkspaceDir" -ForegroundColor Red
    exit 1
}

# DEV MODE
if ($Dev) {
    Write-Host "MODE: Development (Hot Reload)" -ForegroundColor Cyan
    Set-Location $WorkspaceDir

    if ($Clean) {
        Write-Host "Cleaning..." -ForegroundColor Yellow
        @("node_modules", ".webpack") | ForEach-Object {
            if (Test-Path $_) { Remove-Item -Recurse -Force $_ }
        }
    }

    if (-not (Test-Path "node_modules")) {
        Write-Host "Installing dependencies..." -ForegroundColor Yellow
        npm ci
    }

    $env:NODE_ENV = "development"
    $env:MANDA_DISCOVERY_PATH = "C:\discoverydata"
    $env:MANDA_MODULES_PATH = $ModulesSourceDir

    Write-Host "Starting dev server with hot reload..." -ForegroundColor Green
    npx electron-forge start
    exit $LASTEXITCODE
}

# PRODUCTION MODE
if ($Production) {
    Write-Host "MODE: Production" -ForegroundColor Cyan
    Set-Location $WorkspaceDir

    if ($Clean) {
        Write-Host "Cleaning..." -ForegroundColor Yellow
        if (Test-Path ".webpack") { Remove-Item -Recurse -Force ".webpack" }
        if (Test-Path $CanonicalDir) { Remove-Item -Recurse -Force $CanonicalDir }
    }

    if (-not (Test-Path "node_modules")) {
        npm ci
    }

    Write-Host "Building..." -ForegroundColor Yellow
    $env:NODE_ENV = "production"
    npm run build

    if (-not (Test-Path ".webpack\main\main.js")) {
        Write-Host "ERROR: Build failed" -ForegroundColor Red
        exit 1
    }

    Write-Host "Deploying to $CanonicalDir..." -ForegroundColor Yellow
    if (-not (Test-Path $CanonicalDir)) { New-Item -ItemType Directory $CanonicalDir | Out-Null }

    Copy-Item -Recurse -Force ".webpack" "$CanonicalDir\"
    Copy-Item -Force "package.json", "package-lock.json" $CanonicalDir

    if (Test-Path $ModulesSourceDir) {
        Copy-Item -Recurse -Force $ModulesSourceDir "$CanonicalDir\Modules"
    }

    Push-Location $CanonicalDir
    Write-Host "Installing runtime dependencies (including electron)..." -ForegroundColor Yellow
    npm ci 2>&1 | Out-Null
    Pop-Location

    Write-Host "SUCCESS: Deployed" -ForegroundColor Green
    Write-Host "Launching..." -ForegroundColor Green

    Push-Location $CanonicalDir
    $env:NODE_ENV = "production"
    $env:MANDA_DISCOVERY_PATH = "C:\discoverydata"
    $env:MANDA_MODULES_PATH = "$CanonicalDir\Modules"

    $electronPath = "$CanonicalDir\node_modules\.bin\electron.cmd"
    if (-not (Test-Path $electronPath)) { $electronPath = "electron" }
    $mainPath = "$CanonicalDir\.webpack\main\main.js"

    Write-Host "INFO: Launching from $mainPath" -ForegroundColor Cyan
    & $electronPath $mainPath
    Pop-Location
}
