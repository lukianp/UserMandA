#Requires -Version 5.1

<#
.SYNOPSIS
    Builds the M&A Discovery Suite GUI v2 (Electron) application in deployment directory

.DESCRIPTION
    This script syncs the guiv2 source to the deployment directory (C:\enterprisediscovery),
    builds all required webpack bundles (main, renderer, preload), and optionally runs the app.

.PARAMETER Clean
    Remove all build artifacts before building (default: true)

.PARAMETER SkipSync
    Skip syncing files from development to deployment directory (default: false)

.PARAMETER Run
    Start the application after building (default: false)

.PARAMETER Configuration
    Build mode: production or development (default: production)

.EXAMPLE
    .\buildguiv2.ps1
    Standard build with sync and clean

.EXAMPLE
    .\buildguiv2.ps1 -Run
    Build and immediately run the application

.EXAMPLE
    .\buildguiv2.ps1 -SkipSync -Configuration development
    Development build without syncing files
#>

[CmdletBinding()]
param(
    [Parameter(Mandatory = $false)]
    [switch]$Clean = $true,

    [Parameter(Mandatory = $false)]
    [switch]$SkipSync = $false,

    [Parameter(Mandatory = $false)]
    [switch]$Run = $false,

    [Parameter(Mandatory = $false)]
    [ValidateSet('production', 'development')]
    [string]$Configuration = 'production'
)

$ErrorActionPreference = 'Stop'

# Configuration
$DevDir = Join-Path $PSScriptRoot "guiv2"
$DeployDir = "C:\enterprisediscovery"

# Helper function for logging
function Write-Step {
    param(
        [string]$Message,
        [string]$Level = 'INFO'
    )

    $color = switch ($Level) {
        'SUCCESS' { 'Green' }
        'WARNING' { 'Yellow' }
        'ERROR' { 'Red' }
        'INFO' { 'Cyan' }
        default { 'White' }
    }

    $prefix = switch ($Level) {
        'SUCCESS' { '[✓]' }
        'WARNING' { '[!]' }
        'ERROR' { '[✗]' }
        'INFO' { '[→]' }
        default { '[·]' }
    }

    Write-Host "$prefix $Message" -ForegroundColor $color
}

# Header
Write-Host ""
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host " M&A Discovery Suite - GUI v2 Build Script" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Step "Development Directory: $DevDir" -Level 'INFO'
Write-Step "Deployment Directory: $DeployDir" -Level 'INFO'
Write-Step "Configuration: $Configuration" -Level 'INFO'
Write-Host ""

# Validate directories
if (!(Test-Path $DevDir)) {
    Write-Step "Development directory not found: $DevDir" -Level 'ERROR'
    exit 1
}

if (!(Test-Path $DeployDir)) {
    Write-Step "Creating deployment directory: $DeployDir" -Level 'INFO'
    New-Item -Path $DeployDir -ItemType Directory -Force | Out-Null
}

# Step 1: Clean build artifacts
if ($Clean) {
    Write-Host ""
    Write-Step "Cleaning build artifacts..." -Level 'INFO'

    $artifactsToClean = @(
        (Join-Path $DeployDir ".webpack"),
        (Join-Path $DeployDir "out")
    )

    foreach ($artifact in $artifactsToClean) {
        if (Test-Path $artifact) {
            Remove-Item -Path $artifact -Recurse -Force -ErrorAction SilentlyContinue
            Write-Step "Removed: $(Split-Path -Leaf $artifact)" -Level 'SUCCESS'
        }
    }
}

# Step 2: Sync files from development to deployment
if (!$SkipSync) {
    Write-Host ""
    Write-Step "Syncing files from development to deployment directory..." -Level 'INFO'

    $robocopyArgs = @(
        "`"$DevDir`"",
        "`"$DeployDir`"",
        "/MIR",
        "/XD", "node_modules", ".webpack", "out", ".git",
        "/XF", "*.log", "*.md", "*.ps1", "*.sh", "*.patch",
        "/NFL", "/NDL", "/NP", "/NJH", "/NJS"
    )

    $robocopyCmd = "robocopy $($robocopyArgs -join ' ')"

    try {
        # Robocopy exit codes 0-7 are success
        $output = Invoke-Expression $robocopyCmd 2>&1
        $exitCode = $LASTEXITCODE

        if ($exitCode -le 7) {
            Write-Step "Files synced successfully" -Level 'SUCCESS'
        } else {
            Write-Step "Robocopy failed with exit code: $exitCode" -Level 'ERROR'
            Write-Host $output
            exit 1
        }
    } catch {
        Write-Step "Sync failed: $($_.Exception.Message)" -Level 'ERROR'
        exit 1
    }
} else {
    Write-Host ""
    Write-Step "Skipping file sync (using existing files in deployment directory)" -Level 'WARNING'
}

# Step 3: Verify Node.js is available
Write-Host ""
Write-Step "Checking Node.js..." -Level 'INFO'

try {
    $nodeVersion = & node --version 2>&1
    if ($LASTEXITCODE -ne 0) {
        throw "Node.js not found"
    }
    Write-Step "Node.js version: $nodeVersion" -Level 'SUCCESS'
} catch {
    Write-Step "Node.js is required but not found in PATH" -Level 'ERROR'
    exit 1
}

# Step 4: Build webpack bundles
Write-Host ""
Write-Step "Building webpack bundles..." -Level 'INFO'

Set-Location $DeployDir

$mode = if ($Configuration -eq 'production') { 'production' } else { 'development' }

# Build main process
Write-Host ""
Write-Step "Building main process..." -Level 'INFO'
$mainCmd = "npx webpack --config webpack.main.config.js --mode=$mode --output-path=.webpack/main"
try {
    Invoke-Expression $mainCmd 2>&1 | Out-Null
    if ($LASTEXITCODE -ne 0) {
        throw "Main build failed with exit code: $LASTEXITCODE"
    }
    Write-Step "Main process build complete" -Level 'SUCCESS'
} catch {
    Write-Step "Main process build failed: $($_.Exception.Message)" -Level 'ERROR'
    exit 1
}

# Build renderer process
Write-Host ""
Write-Step "Building renderer process..." -Level 'INFO'
$rendererCmd = "npx webpack --config webpack.renderer-standalone.config.js --mode=$mode"
try {
    Invoke-Expression $rendererCmd 2>&1 | Out-Null
    if ($LASTEXITCODE -ne 0) {
        throw "Renderer build failed with exit code: $LASTEXITCODE"
    }
    Write-Step "Renderer process build complete" -Level 'SUCCESS'
} catch {
    Write-Step "Renderer process build failed: $($_.Exception.Message)" -Level 'ERROR'
    exit 1
}

# Build preload script
Write-Host ""
Write-Step "Building preload script..." -Level 'INFO'
$preloadCmd = "npx webpack --config webpack.preload.config.js --mode=$mode"
try {
    Invoke-Expression $preloadCmd 2>&1 | Out-Null
    if ($LASTEXITCODE -ne 0) {
        throw "Preload build failed with exit code: $LASTEXITCODE"
    }
    Write-Step "Preload script build complete" -Level 'SUCCESS'
} catch {
    Write-Step "Preload script build failed: $($_.Exception.Message)" -Level 'ERROR'
    exit 1
}

# Step 5: Verify build artifacts
Write-Host ""
Write-Step "Verifying build artifacts..." -Level 'INFO'

$requiredArtifacts = @(
    (Join-Path $DeployDir ".webpack\main\main.js"),
    (Join-Path $DeployDir ".webpack\renderer\main_window\index.html"),
    (Join-Path $DeployDir ".webpack\preload\index.js")
)

$allArtifactsPresent = $true
foreach ($artifact in $requiredArtifacts) {
    if (Test-Path $artifact) {
        Write-Step "Found: $(Split-Path -Leaf (Split-Path -Parent $artifact))\$(Split-Path -Leaf $artifact)" -Level 'SUCCESS'
    } else {
        Write-Step "Missing: $artifact" -Level 'ERROR'
        $allArtifactsPresent = $false
    }
}

if (!$allArtifactsPresent) {
    Write-Step "Build verification failed - some artifacts are missing" -Level 'ERROR'
    exit 1
}

# Success summary
Write-Host ""
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Green
Write-Host " Build Completed Successfully!" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Green
Write-Host ""
Write-Step "Application built in: $DeployDir" -Level 'SUCCESS'
Write-Host ""
Write-Host "To run the application:" -ForegroundColor Cyan
Write-Host "  cd $DeployDir" -ForegroundColor White
Write-Host "  npm start" -ForegroundColor White
Write-Host ""

# Step 6: Run if requested
if ($Run) {
    Write-Host ""
    Write-Step "Starting application..." -Level 'INFO'
    Write-Host ""

    try {
        Set-Location $DeployDir
        & npm start
    } catch {
        Write-Step "Failed to start application: $($_.Exception.Message)" -Level 'ERROR'
        exit 1
    }
}
