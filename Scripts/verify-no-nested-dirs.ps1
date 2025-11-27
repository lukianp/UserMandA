<#
.SYNOPSIS
    Verifies there are no nested duplicate src directories and provides a health check

.DESCRIPTION
    This script checks both deployment and workspace for nested src/src directories
    and other potential duplicate structures. Run this before major file operations.

.EXAMPLE
    .\verify-no-nested-dirs.ps1

.NOTES
    Created: 2025-11-25
    Purpose: Prevent the nested directory disaster from recurring
#>

[CmdletBinding()]
param()

Write-Host "===========================================================" -ForegroundColor Cyan
Write-Host "  Directory Structure Health Check" -ForegroundColor Cyan
Write-Host "===========================================================" -ForegroundColor Cyan
Write-Host ""

$deploymentPath = "C:\enterprisediscovery\guiv2"
$workspacePath = "D:\Scripts\UserMandA\guiv2"
$hasIssues = $false

# Function to check for nested src
function Test-NestedSrc {
    param([string]$BasePath, [string]$Location)

    Write-Host "Checking $Location..." -ForegroundColor Yellow

    $srcPath = Join-Path $BasePath "src"
    if (-not (Test-Path $srcPath)) {
        Write-Host "  ⚠️  WARNING: No src directory found at $srcPath" -ForegroundColor Red
        return $true
    }

    $nestedSrc = Join-Path $srcPath "src"
    if (Test-Path $nestedSrc) {
        Write-Host "  ❌ CRITICAL: Nested src/src found at $nestedSrc" -ForegroundColor Red
        Write-Host "  This will cause webpack build issues!" -ForegroundColor Red
        return $true
    }

    # Check expected directories
    $expectedDirs = @('main', 'renderer', 'shared', 'types')
    $actualDirs = Get-ChildItem -Path $srcPath -Directory | Select-Object -ExpandProperty Name

    $missing = $expectedDirs | Where-Object { $_ -notin $actualDirs }
    if ($missing) {
        Write-Host "  ⚠️  WARNING: Missing expected directories: $($missing -join ', ')" -ForegroundColor Yellow
        return $true
    }

    Write-Host "  ✅ Structure looks good" -ForegroundColor Green
    Write-Host "     Directories: $($actualDirs -join ', ')" -ForegroundColor Gray
    return $false
}

# Check deployment
$deploymentIssues = Test-NestedSrc -BasePath $deploymentPath -Location "DEPLOYMENT ($deploymentPath)"
Write-Host ""

# Check workspace
$workspaceIssues = Test-NestedSrc -BasePath $workspacePath -Location "WORKSPACE ($workspacePath)"
Write-Host ""

$hasIssues = $deploymentIssues -or $workspaceIssues

# Check for junk directories
Write-Host "Checking for junk directories..." -ForegroundColor Yellow
$junkDirs = @('junk', 'backup', 'old', 'temp', 'tmp')
foreach ($location in @($deploymentPath, $workspacePath)) {
    $found = Get-ChildItem -Path $location -Directory -ErrorAction SilentlyContinue |
        Where-Object { $_.Name -in $junkDirs }

    if ($found) {
        Write-Host "  ⚠️  Found junk directories in $location" -ForegroundColor Yellow
        foreach ($dir in $found) {
            Write-Host "     - $($dir.Name) ($([math]::Round($dir.EnumerateFiles('*', [System.IO.SearchOption]::AllDirectories).Length / 1MB, 2)) MB)" -ForegroundColor Gray
        }
        $hasIssues = $true
    }
}

if (-not $hasIssues) {
    Write-Host "  ✅ No junk directories found" -ForegroundColor Green
}
Write-Host ""

# Final summary
Write-Host "===========================================================" -ForegroundColor Cyan
if ($hasIssues) {
    Write-Host "  ❌ ISSUES FOUND - Review warnings above" -ForegroundColor Red
    Write-Host "===========================================================" -ForegroundColor Cyan
    exit 1
} else {
    Write-Host "  ✅ ALL CHECKS PASSED" -ForegroundColor Green
    Write-Host "===========================================================" -ForegroundColor Cyan
    exit 0
}
