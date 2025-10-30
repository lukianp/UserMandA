#Requires -Version 5.1
<#
.SYNOPSIS
    Deploy UserMandA GUI v2 to canonical location C:\enterprisediscovery
.DESCRIPTION
    Creates canonical directory, copies source, builds, and deploys application
.EXAMPLE
    .\deploy-to-canonical.ps1
#>

param(
    [switch]$SkipBuild,
    [switch]$Launch
)

$ErrorActionPreference = 'Stop'

Write-Host ""
Write-Host "=========================================================" -ForegroundColor Blue
Write-Host "  UserMandA GUI v2 - Deploy to Canonical Location" -ForegroundColor Blue
Write-Host "=========================================================" -ForegroundColor Blue
Write-Host ""

$SourceDir = "D:\Scripts\UserMandA\guiv2"
$CanonicalDir = "C:\enterprisediscovery"

# Step 1: Create canonical directory
if (-not (Test-Path $CanonicalDir)) {
    Write-Host "Creating canonical directory: $CanonicalDir" -ForegroundColor Yellow
    New-Item -Path $CanonicalDir -ItemType Directory -Force | Out-Null
    Write-Host "SUCCESS: Directory created" -ForegroundColor Green
} else {
    Write-Host "Canonical directory exists: $CanonicalDir" -ForegroundColor Green
}

# Step 2: Copy source files (excluding node_modules, build artifacts)
Write-Host ""
Write-Host "Copying source files from dev to canonical..." -ForegroundColor Yellow

$excludeDirs = @("node_modules", ".webpack", "dist", "build", "out", "coverage")
$excludePatterns = "(" + ($excludeDirs -join "|") + ")"

# Use robocopy for efficient directory sync
$robocopyArgs = @(
    $SourceDir,
    $CanonicalDir,
    "/MIR",           # Mirror directory (copy new/updated, delete removed)
    "/XD",            # Exclude directories
    "node_modules",
    ".webpack", 
    "dist",
    "build",
    "out",
    "coverage",
    ".git",
    "/NFL",           # No file list
    "/NDL",           # No directory list  
    "/NJH",           # No job header
    "/NJS",           # No job summary
    "/NP"             # No progress
)

$robocopyResult = robocopy @robocopyArgs 2>&1

if ($LASTEXITCODE -lt 8) {
    Write-Host "SUCCESS: Source files copied" -ForegroundColor Green
} else {
    Write-Host "WARNING: Robocopy exit code $LASTEXITCODE (may be normal)" -ForegroundColor Yellow
}

# Step 3: Build in canonical location
if (-not $SkipBuild) {
    Write-Host ""
    Write-Host "Building application in canonical location..." -ForegroundColor Yellow
    
    Set-Location $CanonicalDir
    
    # Install dependencies
    if (-not (Test-Path "node_modules")) {
        Write-Host "Installing dependencies..." -ForegroundColor Cyan
        npm ci 2>&1 | Out-Null
        Write-Host "SUCCESS: Dependencies installed" -ForegroundColor Green
    } else {
        Write-Host "Dependencies already installed" -ForegroundColor Green
    }
    
    # Build
    Write-Host "Running npm build..." -ForegroundColor Cyan
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
    } else {
        Write-Host "ERROR: Build failed" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "Skipping build (using existing build artifacts)" -ForegroundColor Yellow
}

# Step 4: Create launcher script in canonical location
Write-Host ""
Write-Host "Creating launcher script..." -ForegroundColor Yellow

$launcherPath = Join-Path $CanonicalDir "Launch-UserMandA.ps1"
$launcherContent = @"
#Requires -Version 5.1

Set-Location "C:\enterprisediscovery"

Write-Host "Starting UserMandA Discovery Suite v2 from C:\enterprisediscovery" -ForegroundColor Green

`$env:NODE_ENV = "production"
`$env:MANDA_DISCOVERY_PATH = "C:\discoverydata"

`$electronPath = "C:\enterprisediscovery\node_modules\.bin\electron.cmd"
if (-not (Test-Path `$electronPath)) {
    `$electronPath = "electron"
}

`$mainPath = "C:\enterprisediscovery\.webpack\main"

try {
    & `$electronPath `$mainPath
} catch {
    Write-Host "Error launching application: `$(`$_.Exception.Message)" -ForegroundColor Red
    Read-Host "Press Enter to exit"
}
"@

Set-Content -Path $launcherPath -Value $launcherContent -Encoding UTF8
Write-Host "SUCCESS: Launcher created at $launcherPath" -ForegroundColor Green

# Summary
Write-Host ""
Write-Host "=========================================================" -ForegroundColor Blue
Write-Host "  Deployment Complete" -ForegroundColor Blue
Write-Host "=========================================================" -ForegroundColor Blue
Write-Host ""
Write-Host "SUCCESS: Application deployed to C:\enterprisediscovery" -ForegroundColor Green
Write-Host ""
Write-Host "To launch the application:" -ForegroundColor Yellow
Write-Host "  cd C:\enterprisediscovery" -ForegroundColor White
Write-Host "  .\Launch-UserMandA.ps1" -ForegroundColor White
Write-Host ""
Write-Host "Or simply:" -ForegroundColor Yellow
Write-Host "  C:\enterprisediscovery\Launch-UserMandA.ps1" -ForegroundColor White
Write-Host ""

# Launch if requested
if ($Launch) {
    Write-Host "Launching application from canonical location..." -ForegroundColor Yellow
    Write-Host ""
    & "$CanonicalDir\Launch-UserMandA.ps1"
}
