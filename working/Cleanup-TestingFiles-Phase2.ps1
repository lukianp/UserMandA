# -*- coding: utf-8-bom -*-
#Requires -Version 5.1

<#
.SYNOPSIS
    M&A Discovery Suite - Testing Files Cleanup Script (Phase 2)
.DESCRIPTION
    Handles the files that needed manual review from Phase 1, categorizing them based on
    deeper analysis of their purpose and usage in the M&A Discovery Suite.
.PARAMETER Force
    Forces the move operation without prompting
.NOTES
    Version: 1.0.0
    Author: Cleanup Assistant
    Purpose: Complete the cleanup of testing files
#>

[CmdletBinding(SupportsShouldProcess = $true)]
param(
    [Parameter(Mandatory = $false)]
    [switch]$Force
)

$ErrorActionPreference = "Stop"

# Get script root
$ScriptRoot = $PSScriptRoot
if (-not $ScriptRoot) {
    $ScriptRoot = Split-Path $MyInvocation.MyCommand.Path -Parent
}

Write-Host "M&A Discovery Suite - Testing Files Cleanup (Phase 2)" -ForegroundColor Cyan
Write-Host "====================================================" -ForegroundColor Cyan
Write-Host "Script Root: $ScriptRoot" -ForegroundColor Gray
Write-Host ""

# Files that need manual review from Phase 1
$ManualReviewFiles = @(
    "Fix-ModuleContext.ps1",
    "Unblock-AllFiles.ps1", 
    "Core\MandA-Orchestrator.ps1",
    "Modules\Utilities\Setup-AppRegistration.ps1",
    "Modules\Utilities\Setup-AppRegistrationOnce.ps1",
    "Scripts\Add-VersionHeaders.ps1",
    "Scripts\Apply-LazyInitialization.ps1",
    "Scripts\Diagnose-CredentialFile.ps1",
    "Scripts\DiscoverySuiteModuleCheck.ps1",
    "Scripts\Prestart.ps1",
    "Scripts\Set-SuiteEnvironment.ps1",
    "Scripts\Validate-Installation.ps1",
    "Scripts\Validate-SuiteIntegrity.ps1"
)

# Based on analysis of QuickStart.ps1 and MandA-Orchestrator.ps1, categorize files
$CoreProductionFiles = @(
    "Core\MandA-Orchestrator.ps1",           # Main orchestrator - CORE
    "Scripts\Set-SuiteEnvironment.ps1",      # Referenced by QuickStart - CORE  
    "Scripts\DiscoverySuiteModuleCheck.ps1", # Referenced by Orchestrator - CORE
    "Scripts\Validate-Installation.ps1",     # Installation validation - CORE
    "Scripts\Validate-SuiteIntegrity.ps1",   # Suite integrity validation - CORE
    "Scripts\Prestart.ps1",                  # Startup script - CORE
    "Modules\Utilities\Setup-AppRegistration.ps1",     # App registration setup - CORE
    "Modules\Utilities\Setup-AppRegistrationOnce.ps1"  # One-time app registration - CORE
)

$UtilityDevelopmentFiles = @(
    "Fix-ModuleContext.ps1",                 # Development utility - MOVE
    "Unblock-AllFiles.ps1",                  # Development utility - MOVE
    "Scripts\Add-VersionHeaders.ps1",        # Development utility - MOVE
    "Scripts\Apply-LazyInitialization.ps1",  # Development utility - MOVE
    "Scripts\Diagnose-CredentialFile.ps1"    # Diagnostic utility - MOVE
)

Write-Host "Analyzing Phase 2 files..." -ForegroundColor Yellow

$FilesToMove = @()
$FilesToKeep = @()

foreach ($file in $ManualReviewFiles) {
    $fullPath = Join-Path $ScriptRoot $file
    
    if (Test-Path $fullPath) {
        if ($file -in $CoreProductionFiles) {
            $FilesToKeep += $file
            Write-Host "  [KEEP] $file (Core production file)" -ForegroundColor Green
        } elseif ($file -in $UtilityDevelopmentFiles) {
            $FilesToMove += $file
            Write-Host "  [MOVE] $file (Development utility)" -ForegroundColor Yellow
        } else {
            Write-Host "  [UNKNOWN] $file (Not categorized)" -ForegroundColor Magenta
        }
    } else {
        Write-Host "  [MISSING] $file (File not found)" -ForegroundColor Red
    }
}

# Display summary
Write-Host "`n" + "="*50 -ForegroundColor Cyan
Write-Host "PHASE 2 CLEANUP SUMMARY" -ForegroundColor Cyan
Write-Host "="*50 -ForegroundColor Cyan
Write-Host "Core production files (keeping): $($FilesToKeep.Count)" -ForegroundColor Green
Write-Host "Development utility files (moving): $($FilesToMove.Count)" -ForegroundColor Yellow
Write-Host ""

if ($FilesToKeep.Count -gt 0) {
    Write-Host "Core production files to keep:" -ForegroundColor Green
    foreach ($file in $FilesToKeep) {
        Write-Host "  - $file" -ForegroundColor White
    }
    Write-Host ""
}

if ($FilesToMove.Count -gt 0) {
    Write-Host "Development utility files to move to /working:" -ForegroundColor Yellow
    foreach ($file in $FilesToMove) {
        Write-Host "  - $file" -ForegroundColor Yellow
    }
    Write-Host ""
}

# Execute the move if files to move
if ($FilesToMove.Count -gt 0) {
    if (-not $Force) {
        $response = Read-Host "Do you want to move $($FilesToMove.Count) development utility files to /working directory? (y/N)"
        if ($response -notmatch '^[Yy]') {
            Write-Host "Operation cancelled." -ForegroundColor Yellow
            exit 0
        }
    }
    
    # Ensure working directory exists
    $WorkingDir = Join-Path $ScriptRoot "working"
    if (-not (Test-Path $WorkingDir)) {
        New-Item -Path $WorkingDir -ItemType Directory -Force | Out-Null
        Write-Host "Created working directory: $WorkingDir" -ForegroundColor Green
    }
    
    # Move files
    $movedCount = 0
    foreach ($file in $FilesToMove) {
        try {
            $sourcePath = Join-Path $ScriptRoot $file
            $targetDir = Join-Path $WorkingDir (Split-Path $file -Parent)
            
            # Create target directory structure if needed
            if ($targetDir -and -not (Test-Path $targetDir)) {
                New-Item -Path $targetDir -ItemType Directory -Force | Out-Null
            }
            
            $targetPath = Join-Path $WorkingDir $file
            Move-Item -Path $sourcePath -Destination $targetPath -Force
            Write-Host "  Moved: $file" -ForegroundColor Green
            $movedCount++
        } catch {
            Write-Host "  Failed to move $file`: $_" -ForegroundColor Red
        }
    }
    
    Write-Host "`nMoved $movedCount development utility files to /working directory" -ForegroundColor Green
} else {
    Write-Host "No development utility files identified for moving." -ForegroundColor Green
}

# Create final summary report
$reportPath = Join-Path $ScriptRoot "CleanupPhase2Report_$(Get-Date -Format 'yyyyMMdd_HHmmss').txt"
$report = @"
M&A Discovery Suite - Phase 2 Cleanup Report
Generated: $(Get-Date)

PHASE 2 SUMMARY:
- Core production files (kept): $($FilesToKeep.Count)
- Development utility files (moved): $($FilesToMove.Count)

CORE PRODUCTION FILES (KEPT):
$($FilesToKeep | ForEach-Object { "  - $_" } | Out-String)

DEVELOPMENT UTILITY FILES (MOVED TO /working):
$($FilesToMove | ForEach-Object { "  - $_" } | Out-String)

RATIONALE:
Core production files are essential for the M&A Discovery Suite operation:
- MandA-Orchestrator.ps1: Main orchestration engine
- Set-SuiteEnvironment.ps1: Environment setup (referenced by QuickStart)
- DiscoverySuiteModuleCheck.ps1: Module validation (referenced by Orchestrator)
- Validate-*.ps1: Installation and integrity validation scripts
- Setup-AppRegistration*.ps1: Azure app registration setup scripts

Development utility files are helper scripts for development/maintenance:
- Fix-ModuleContext.ps1: Development fix utility
- Unblock-AllFiles.ps1: File unblocking utility
- Add-VersionHeaders.ps1: Version header management
- Apply-LazyInitialization.ps1: Code modification utility
- Diagnose-CredentialFile.ps1: Credential diagnostic utility

FINAL RECOMMENDATION:
The /working directory now contains all testing and development utility files that are
not essential for the core M&A Discovery Suite operation. These files can be excluded
from LLM knowledge import to reduce overhead while preserving them for future reference.
"@

$report | Set-Content -Path $reportPath -Encoding UTF8
Write-Host "`nPhase 2 cleanup complete!" -ForegroundColor Cyan
Write-Host "Detailed report saved: $reportPath" -ForegroundColor Cyan

# Show final working directory contents
Write-Host "`nFinal /working directory contents:" -ForegroundColor Cyan
if (Test-Path $WorkingDir) {
    Get-ChildItem -Path $WorkingDir -Recurse -File | ForEach-Object {
        $relativePath = $_.FullName.Substring($WorkingDir.Length + 1)
        Write-Host "  - $relativePath" -ForegroundColor Gray
    }
} else {
    Write-Host "  (No working directory created)" -ForegroundColor Gray
}