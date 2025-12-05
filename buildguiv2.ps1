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
    [string]$Configuration = 'production',

    [Parameter(Mandatory = $false)]
    [ValidateSet('quiet', 'normal', 'verbose')]
    [string]$Verbosity = 'normal',

    [Parameter(Mandatory = $false)]
    [switch]$Deploy = $false,

    [Parameter(Mandatory = $false)]
    [switch]$Optimize = $false
)

$ErrorActionPreference = 'Stop'

# Configuration
$DevDir = Join-Path $PSScriptRoot "guiv2"
$DeployDir = "C:\enterprisediscovery"

# Global tracking variables
$script:BuildStats = @{
    StartTime = $null
    StepTimes = @{}
    TotalFilesSynced = 0
    CurrentStep = 0
    TotalSteps = 8
}

# Enhanced progress bar function
function Write-ProgressBar {
    param(
        [int]$Current,
        [int]$Total,
        [string]$Activity = "Building",
        [string]$Status = "",
        [switch]$Completed
    )

    $percentage = if ($Total -gt 0) { [math]::Min(100, [math]::Round(($Current / $Total) * 100)) } else { 0 }
    $progressBarWidth = 40
    $filledBars = [math]::Round(($percentage / 100) * $progressBarWidth)
    $emptyBars = $progressBarWidth - $filledBars

    $progressBar = "[" + ("█" * $filledBars) + ("░" * $emptyBars) + "]"

    if ($Completed) {
        Write-Host "✅ $Activity Complete! ($percentage%)" -ForegroundColor Green
    } else {
        Write-Host "🔄 $Activity $progressBar $percentage% - $Status" -ForegroundColor Cyan -NoNewline
        Write-Host ""  # New line
    }
}

# Enhanced logging with emojis and timing
function Write-Step {
    param(
        [string]$Message,
        [string]$Level = 'INFO',
        [switch]$StartTimer,
        [switch]$StopTimer,
        [string]$TimerName = ""
    )

    $emoji = switch ($Level) {
        'SUCCESS' { '✅' }
        'WARNING' { '⚠️' }
        'ERROR'   { '❌' }
        'INFO'    { 'ℹ️' }
        'BUILD'   { '🔨' }
        'SYNC'    { '🔄' }
        'CLEAN'   { '🧹' }
        'DEPLOY'  { '🚀' }
        default   { '📝' }
    }

    $color = switch ($Level) {
        'SUCCESS' { 'Green' }
        'WARNING' { 'Yellow' }
        'ERROR'   { 'Red' }
        'INFO'    { 'Cyan' }
        'BUILD'   { 'Magenta' }
        'SYNC'    { 'Blue' }
        'CLEAN'   { 'Gray' }
        'DEPLOY'  { 'Green' }
        default   { 'White' }
    }

    $timestamp = Get-Date -Format "HH:mm:ss"

    if ($StartTimer -and $TimerName) {
        $script:BuildStats.StepTimes[$TimerName] = @{ Start = Get-Date; End = $null; Duration = $null }
        Write-Verbose "⏱️  Started timing: $TimerName"
    }

    if ($StopTimer -and $TimerName -and $script:BuildStats.StepTimes.ContainsKey($TimerName)) {
        $script:BuildStats.StepTimes[$TimerName].End = Get-Date
        $duration = $script:BuildStats.StepTimes[$TimerName].End - $script:BuildStats.StepTimes[$TimerName].Start
        $script:BuildStats.StepTimes[$TimerName].Duration = $duration
        $durationStr = "{0:mm\:ss\.fff}" -f $duration
        $Message += " (${durationStr})"
        Write-Verbose "⏱️  Completed timing: $TimerName - $durationStr"
    }

    Write-Host "$emoji [$timestamp] $Message" -ForegroundColor $color
}

# ASCII Art Header
function Show-BuildHeader {
    $art = @"

======================================================================

                 M and A DISCOVERY SUITE V2

                 Ultimate Build System v2.0

     Sync - Build - Deploy - Analyze

======================================================================

"@

    Write-Host $art -ForegroundColor Cyan
}

# Build summary function
function Show-BuildSummary {
    Write-Host ""
    Write-Host "=======================================================" -ForegroundColor Yellow
    Write-Host " BUILD SUMMARY REPORT" -ForegroundColor Yellow
    Write-Host "=======================================================" -ForegroundColor Yellow
    Write-Host ""

    $totalDuration = (Get-Date) - $script:BuildStats.StartTime
    $totalDurationStr = "{0:mm\:ss\.fff}" -f $totalDuration

    Write-Host "Total Build Time: $totalDurationStr" -ForegroundColor White
    Write-Host "Files Synced: $($script:BuildStats.TotalFilesSynced)" -ForegroundColor White
    Write-Host "Configuration: $Configuration" -ForegroundColor White
    Write-Host "Deployment: $DeployDir" -ForegroundColor White

    Write-Host ""
    Write-Host "Step Timings:" -ForegroundColor Cyan
    foreach ($step in $script:BuildStats.StepTimes.GetEnumerator() | Sort-Object { $_.Value.Start }) {
        if ($step.Value.Duration) {
            $durationStr = "{0:mm\:ss\.fff}" -f $step.Value.Duration
            Write-Host "  - $($step.Key): $durationStr" -ForegroundColor Gray
        }
    }

    Write-Host ""
    Write-Host "Build Status: SUCCESS" -ForegroundColor Green
    Write-Host ""
}

# Header
Write-Host ""
Write-Host "=======================================================" -ForegroundColor Cyan
Write-Host " M and A Discovery Suite - GUI v2 Build Script" -ForegroundColor Green
Write-Host "=======================================================" -ForegroundColor Cyan
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
    Write-Step "🧹 Cleaning build artifacts..." -Level 'CLEAN' -StartTimer -TimerName "Clean"
    Write-ProgressBar -Current 0 -Total 1 -Activity "🧹 Cleaning" -Status "Removing old artifacts"

    $artifactsToClean = @(
        (Join-Path $DeployDir ".webpack"),
        (Join-Path $DeployDir "out"),
        (Join-Path $DeployDir "dist"),
        (Join-Path $DeployDir "*.log")
    )

    $cleanedCount = 0
    foreach ($artifact in $artifactsToClean) {
        if (Test-Path $artifact) {
            try {
                Remove-Item -Path $artifact -Recurse -Force -ErrorAction Stop
                Write-Step "Removed: $(Split-Path -Leaf $artifact)" -Level 'CLEAN'
                $cleanedCount++
            } catch {
                Write-Step "Failed to remove: $(Split-Path -Leaf $artifact) - $($_.Exception.Message)" -Level 'WARNING'
            }
        }
        Write-ProgressBar -Current $cleanedCount -Total $artifactsToClean.Count -Activity "🧹 Cleaning" -Status "$cleanedCount/$(artifactsToClean.Count) artifacts"
    }

    Write-ProgressBar -Current $artifactsToClean.Count -Total $artifactsToClean.Count -Activity "🧹 Cleaning" -Completed
    Write-Step "Cleaned $cleanedCount artifact(s)" -Level 'CLEAN' -StopTimer -TimerName "Clean"
    $script:BuildStats.CurrentStep++
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
Write-Step "🔨 Building webpack bundles..." -Level 'BUILD' -StartTimer -TimerName "Build"
$script:BuildStats.CurrentStep++

Set-Location $DeployDir

$mode = if ($Configuration -eq 'production') { 'production' } else { 'development' }
$buildSteps = @("Main Process", "Renderer Process", "Preload Script")
$currentBuildStep = 0

# Build main process
Write-Host ""
Write-Step "🔨 Building main process..." -Level 'BUILD' -StartTimer -TimerName "MainBuild"
Write-ProgressBar -Current $currentBuildStep -Total $buildSteps.Count -Activity "🔨 Building" -Status $buildSteps[$currentBuildStep]

$mainCmd = "npx webpack --config webpack.main.config.js --mode=$mode --output-path=.webpack/main"
try {
    if ($Verbosity -eq 'verbose') {
        Invoke-Expression $mainCmd 2>&1
    } else {
        Invoke-Expression $mainCmd 2>&1 | Out-Null
    }
    if ($LASTEXITCODE -ne 0) {
        throw "Main build failed with exit code: $LASTEXITCODE"
    }
    Write-Step "✅ Main process build complete" -Level 'BUILD' -StopTimer -TimerName "MainBuild"
    $currentBuildStep++
    Write-ProgressBar -Current $currentBuildStep -Total $buildSteps.Count -Activity "🔨 Building" -Status $buildSteps[$currentBuildStep]
} catch {
    Write-Step "❌ Main process build failed: $($_.Exception.Message)" -Level 'ERROR'
    Write-Step "💡 Suggestion: Check webpack.main.config.js and ensure all dependencies are installed (npm install)" -Level 'INFO'
    exit 1
}

# Build renderer process
Write-Host ""
Write-Step "🎨 Building renderer process..." -Level 'BUILD' -StartTimer -TimerName "RendererBuild"
# Use webpack.renderer.config.js directly - includes all plugins, optimizations, and bundle analysis
$rendererCmd = "npx webpack --config webpack.renderer.config.js --mode=$mode"
try {
    if ($Verbosity -eq 'verbose') {
        Invoke-Expression $rendererCmd 2>&1
    } else {
        Invoke-Expression $rendererCmd 2>&1 | Out-Null
    }
    if ($LASTEXITCODE -ne 0) {
        throw "Renderer build failed with exit code: $LASTEXITCODE"
    }
    Write-Step "✅ Renderer process build complete" -Level 'BUILD' -StopTimer -TimerName "RendererBuild"
    $currentBuildStep++
    Write-ProgressBar -Current $currentBuildStep -Total $buildSteps.Count -Activity "🔨 Building" -Status $buildSteps[$currentBuildStep]
} catch {
    Write-Step "❌ Renderer process build failed: $($_.Exception.Message)" -Level 'ERROR'
    Write-Step "💡 Suggestion: Check webpack.renderer.config.js and ensure React dependencies are available" -Level 'INFO'
    exit 1
}

# Build preload script
Write-Host ""
Write-Step "⚡ Building preload script..." -Level 'BUILD' -StartTimer -TimerName "PreloadBuild"
$preloadCmd = "npx webpack --config webpack.preload.config.js --mode=$mode"
try {
    if ($Verbosity -eq 'verbose') {
        Invoke-Expression $preloadCmd 2>&1
    } else {
        Invoke-Expression $preloadCmd 2>&1 | Out-Null
    }
    if ($LASTEXITCODE -ne 0) {
        throw "Preload build failed with exit code: $LASTEXITCODE"
    }
    Write-Step "✅ Preload script build complete" -Level 'BUILD' -StopTimer -TimerName "PreloadBuild"
    $currentBuildStep++
    Write-ProgressBar -Current $buildSteps.Count -Total $buildSteps.Count -Activity "🔨 Building" -Completed
} catch {
    Write-Step "❌ Preload script build failed: $($_.Exception.Message)" -Level 'ERROR'
    Write-Step "💡 Suggestion: Check webpack.preload.config.js and ensure preload.ts exists" -Level 'INFO'
    exit 1
}

Write-Step "🎉 All webpack bundles built successfully" -Level 'BUILD' -StopTimer -TimerName "Build"

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
Write-Host "=======================================================" -ForegroundColor Green
Write-Host " Build Completed Successfully!" -ForegroundColor Green
Write-Host "=======================================================" -ForegroundColor Green
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
