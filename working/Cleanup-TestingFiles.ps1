# -*- coding: utf-8-bom -*-
#Requires -Version 5.1

<#
.SYNOPSIS
    M&A Discovery Suite - Testing Files Cleanup Script
.DESCRIPTION
    Identifies and moves PS1 files that are used for testing and are not referenced by
    the main components (QuickStart, Orchestrator, or Modules) to a /working directory.
.PARAMETER WhatIf
    Shows what would be moved without actually moving files
.PARAMETER Force
    Forces the move operation without prompting
.NOTES
    Version: 1.0.0
    Author: Cleanup Assistant
    Purpose: Clean up testing files to reduce LLM knowledge import overhead
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

Write-Host "M&A Discovery Suite - Testing Files Cleanup" -ForegroundColor Cyan
Write-Host "===========================================" -ForegroundColor Cyan
Write-Host "Script Root: $ScriptRoot" -ForegroundColor Gray
Write-Host ""

# Define main component files that we need to analyze for references
$MainComponents = @{
    "QuickStart" = "QuickStart.ps1"
    "Orchestrator" = "Core\MandA-Orchestrator.ps1"
    "SetSuiteEnvironment" = "Scripts\Set-SuiteEnvironment.ps1"
}

# Find all PS1 files in the project
Write-Host "Scanning for PS1 files..." -ForegroundColor Yellow
$AllPS1Files = Get-ChildItem -Path $ScriptRoot -Recurse -Filter "*.ps1" | Where-Object {
    # Exclude files in already working/temp directories
    $_.FullName -notmatch "\\working\\|\\temp\\|\\backup\\|\\archive\\"
}

Write-Host "Found $($AllPS1Files.Count) PS1 files to analyze" -ForegroundColor Green

# Categorize files
$CoreFiles = @()
$TestingFiles = @()
$ReferencedFiles = @()
$UnknownFiles = @()

# Files that are definitely core (main entry points and critical scripts)
$KnownCorePatterns = @(
    "QuickStart.ps1",
    "Core\\MandA-Orchestrator.ps1",
    "Scripts\\Set-SuiteEnvironment.ps1",
    "Scripts\\DiscoverySuiteModuleCheck.ps1",
    "Scripts\\Prestart.ps1",
    "Scripts\\Validate-Installation.ps1",
    "Scripts\\Validate-SuiteIntegrity.ps1",
    "Modules\\Utilities\\Setup-AppRegistration.ps1",
    "Modules\\Utilities\\Setup-AppRegistrationOnce.ps1"
)

# Files that are clearly testing/development files
$TestingPatterns = @(
    "Test-*.ps1",
    "*Test*.ps1",
    "Scripts\\Test-*.ps1",
    "Scripts\\Diagnose-*.ps1",
    "*Debug*.ps1",
    "*Sample*.ps1",
    "*Example*.ps1",
    "*Demo*.ps1"
)

Write-Host "`nAnalyzing file purposes..." -ForegroundColor Yellow

foreach ($file in $AllPS1Files) {
    $relativePath = $file.FullName.Substring($ScriptRoot.Length + 1)
    $fileName = $file.Name
    $isCore = $false
    $isTesting = $false
    
    # Check if it's a known core file
    foreach ($pattern in $KnownCorePatterns) {
        if ($relativePath -like $pattern) {
            $CoreFiles += $file
            $isCore = $true
            Write-Host "  [CORE] $relativePath" -ForegroundColor Green
            break
        }
    }
    
    if (-not $isCore) {
        # Check if it's a testing file
        foreach ($pattern in $TestingPatterns) {
            if ($fileName -like $pattern -or $relativePath -like $pattern) {
                $TestingFiles += $file
                $isTesting = $true
                Write-Host "  [TEST] $relativePath" -ForegroundColor Yellow
                break
            }
        }
    }
    
    if (-not $isCore -and -not $isTesting) {
        # Additional analysis for unclear files
        $content = Get-Content $file.FullName -Raw -ErrorAction SilentlyContinue
        
        if ($content) {
            # Check for testing indicators in content
            $testingIndicators = @(
                "# Test",
                "# Testing",
                "# Debug",
                "# Sample",
                "# Example",
                "# Demo",
                "Test-",
                "testing",
                "debug",
                "sample",
                "example"
            )
            
            $hasTestingIndicators = $false
            foreach ($indicator in $testingIndicators) {
                if ($content -match [regex]::Escape($indicator)) {
                    $hasTestingIndicators = $true
                    break
                }
            }
            
            # Check for production indicators
            $productionIndicators = @(
                "Import-Module",
                "Export-",
                "function ",
                "param(",
                ".SYNOPSIS",
                ".DESCRIPTION"
            )
            
            $hasProductionIndicators = $false
            foreach ($indicator in $productionIndicators) {
                if ($content -match [regex]::Escape($indicator)) {
                    $hasProductionIndicators = $true
                    break
                }
            }
            
            if ($hasTestingIndicators -and -not $hasProductionIndicators) {
                $TestingFiles += $file
                Write-Host "  [TEST] $relativePath (content analysis)" -ForegroundColor Yellow
            } elseif ($hasProductionIndicators) {
                $UnknownFiles += $file
                Write-Host "  [UNKNOWN] $relativePath (needs manual review)" -ForegroundColor Magenta
            } else {
                $UnknownFiles += $file
                Write-Host "  [UNKNOWN] $relativePath (minimal content)" -ForegroundColor Magenta
            }
        } else {
            $UnknownFiles += $file
            Write-Host "  [UNKNOWN] $relativePath (cannot read content)" -ForegroundColor Magenta
        }
    }
}

# Now check for references in core files
Write-Host "`nChecking for references in core files..." -ForegroundColor Yellow

$ReferencedFileNames = @()
foreach ($coreFile in $CoreFiles) {
    $content = Get-Content $coreFile.FullName -Raw -ErrorAction SilentlyContinue
    if ($content) {
        # Look for script references
        $scriptReferences = [regex]::Matches($content, '(?:\.\\|\\|/)([^\\/"]*\.ps1)', [System.Text.RegularExpressions.RegexOptions]::IgnoreCase)
        foreach ($match in $scriptReferences) {
            $referencedScript = $match.Groups[1].Value
            $ReferencedFileNames += $referencedScript
        }
        
        # Look for Join-Path references to PS1 files
        $joinPathReferences = [regex]::Matches($content, 'Join-Path[^"]*"([^"]*\.ps1)"', [System.Text.RegularExpressions.RegexOptions]::IgnoreCase)
        foreach ($match in $joinPathReferences) {
            $referencedScript = Split-Path $match.Groups[1].Value -Leaf
            $ReferencedFileNames += $referencedScript
        }
    }
}

# Remove duplicates
$ReferencedFileNames = $ReferencedFileNames | Sort-Object -Unique

Write-Host "Found references to: $($ReferencedFileNames -join ', ')" -ForegroundColor Gray

# Move testing files that are not referenced
$FilesToMove = @()
foreach ($testFile in $TestingFiles) {
    if ($testFile.Name -notin $ReferencedFileNames) {
        $FilesToMove += $testFile
    } else {
        Write-Host "  Keeping referenced test file: $($testFile.Name)" -ForegroundColor Cyan
    }
}

# Add unknown files that look like testing files
foreach ($unknownFile in $UnknownFiles) {
    $fileName = $unknownFile.Name
    if ($fileName -like "*Test*" -or $fileName -like "*Debug*" -or $fileName -like "*Sample*") {
        if ($fileName -notin $ReferencedFileNames) {
            $FilesToMove += $unknownFile
        }
    }
}

# Display summary
Write-Host "`n" + "="*50 -ForegroundColor Cyan
Write-Host "CLEANUP SUMMARY" -ForegroundColor Cyan
Write-Host "="*50 -ForegroundColor Cyan
Write-Host "Core files (keeping): $($CoreFiles.Count)" -ForegroundColor Green
Write-Host "Testing files (total found): $($TestingFiles.Count)" -ForegroundColor Yellow
Write-Host "Files to move to /working: $($FilesToMove.Count)" -ForegroundColor Red
Write-Host "Unknown files (manual review needed): $($UnknownFiles.Count)" -ForegroundColor Magenta
Write-Host ""

if ($FilesToMove.Count -gt 0) {
    Write-Host "Files to be moved to /working directory:" -ForegroundColor Red
    foreach ($file in $FilesToMove) {
        $relativePath = $file.FullName.Substring($ScriptRoot.Length + 1)
        Write-Host "  - $relativePath" -ForegroundColor Yellow
    }
    Write-Host ""
}

if ($UnknownFiles.Count -gt 0) {
    Write-Host "Files requiring manual review:" -ForegroundColor Magenta
    foreach ($file in $UnknownFiles) {
        $relativePath = $file.FullName.Substring($ScriptRoot.Length + 1)
        Write-Host "  - $relativePath" -ForegroundColor Gray
    }
    Write-Host ""
}

# Execute the move if not WhatIf
if ($FilesToMove.Count -gt 0) {
    if ($WhatIf) {
        Write-Host "WhatIf mode: No files will be moved." -ForegroundColor Cyan
    } else {
        if (-not $Force) {
            $response = Read-Host "Do you want to move $($FilesToMove.Count) files to /working directory? (y/N)"
            if ($response -notmatch '^[Yy]') {
                Write-Host "Operation cancelled." -ForegroundColor Yellow
                exit 0
            }
        }
        
        # Create working directory
        $WorkingDir = Join-Path $ScriptRoot "working"
        if (-not (Test-Path $WorkingDir)) {
            New-Item -Path $WorkingDir -ItemType Directory -Force | Out-Null
            Write-Host "Created working directory: $WorkingDir" -ForegroundColor Green
        }
        
        # Move files
        $movedCount = 0
        foreach ($file in $FilesToMove) {
            try {
                $relativePath = $file.FullName.Substring($ScriptRoot.Length + 1)
                $targetDir = Join-Path $WorkingDir (Split-Path $relativePath -Parent)
                
                # Create target directory structure if needed
                if ($targetDir -and -not (Test-Path $targetDir)) {
                    New-Item -Path $targetDir -ItemType Directory -Force | Out-Null
                }
                
                $targetPath = Join-Path $WorkingDir $relativePath
                Move-Item -Path $file.FullName -Destination $targetPath -Force
                Write-Host "  Moved: $relativePath" -ForegroundColor Green
                $movedCount++
            } catch {
                Write-Host "  Failed to move $($file.Name): $_" -ForegroundColor Red
            }
        }
        
        Write-Host "`nMoved $movedCount files to /working directory" -ForegroundColor Green
    }
} else {
    Write-Host "No files identified for moving." -ForegroundColor Green
}

Write-Host "`nCleanup analysis complete!" -ForegroundColor Cyan

# Create a summary report
$reportPath = Join-Path $ScriptRoot "CleanupReport_$(Get-Date -Format 'yyyyMMdd_HHmmss').txt"
$report = @"
M&A Discovery Suite - Cleanup Report
Generated: $(Get-Date)

SUMMARY:
- Core files (kept): $($CoreFiles.Count)
- Testing files found: $($TestingFiles.Count)
- Files moved to /working: $($FilesToMove.Count)
- Files needing manual review: $($UnknownFiles.Count)

CORE FILES (KEPT):
$($CoreFiles | ForEach-Object { "  - " + $_.FullName.Substring($ScriptRoot.Length + 1) } | Out-String)

FILES MOVED TO /working:
$($FilesToMove | ForEach-Object { "  - " + $_.FullName.Substring($ScriptRoot.Length + 1) } | Out-String)

FILES NEEDING MANUAL REVIEW:
$($UnknownFiles | ForEach-Object { "  - " + $_.FullName.Substring($ScriptRoot.Length + 1) } | Out-String)

REFERENCED FILES (kept even if testing):
$($ReferencedFileNames | ForEach-Object { "  - $_" } | Out-String)
"@

$report | Set-Content -Path $reportPath -Encoding UTF8
Write-Host "Detailed report saved: $reportPath" -ForegroundColor Cyan