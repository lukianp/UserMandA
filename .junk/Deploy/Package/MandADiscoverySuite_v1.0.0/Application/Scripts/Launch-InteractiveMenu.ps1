# -*- coding: utf-8-bom -*-
#Requires -Version 5.1

# Author: Lukian Poleschtschuk
# Version: 1.0.0
# Created: 2025-01-18
# Last Modified: 2025-01-18

<#
.SYNOPSIS
    Direct launcher for M&A Discovery Suite Interactive Menu
.DESCRIPTION
    Simplified launcher that initializes the M&A Discovery Suite environment and directly 
    opens the interactive menu system without running the orchestrator first. This provides
    quick access to all suite functionality through a user-friendly interface.
.PARAMETER CompanyName
    Optional company name to pre-populate in the menu system
.NOTES
    Version: 1.0.0
    Author: Lukian Poleschtschuk
    Created: 2025-01-18
    Requires: PowerShell 5.1+, M&A Discovery Suite
#>

[CmdletBinding()]
param(
    [Parameter(Mandatory=$false)]
    [string]$CompanyName,
    
    [Parameter(Mandatory=$false)]
    [switch]$SkipBanner
)

$ErrorActionPreference = "Stop"

try {
    # --- Determine Suite Root ---
    $SuiteRoot = $PSScriptRoot
    if (-not $SuiteRoot) {
        $SuiteRoot = Split-Path $MyInvocation.MyCommand.Path -Parent
    }
    if (-not (Test-Path $SuiteRoot -PathType Container)) {
        throw "Cannot determine Suite Root directory"
    }
    
    $SuiteRoot = Split-Path $SuiteRoot -Parent # Go up one level from Scripts to Suite root
    
    if (-not $SkipBanner) {
        Write-Host ""
        Write-Host "╔═══════════════════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
        Write-Host "║                          M&A DISCOVERY SUITE                                 ║" -ForegroundColor Cyan
        Write-Host "║                      Interactive Menu Launcher                               ║" -ForegroundColor Cyan
        Write-Host "╚═══════════════════════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
        Write-Host ""
    }
    
    # --- Initialize Environment (if not already initialized) ---
    if (-not $global:MandA -or -not $global:MandA.Initialized) {
        Write-Host "[Launcher] Initializing M&A Discovery Suite environment..." -ForegroundColor Yellow
        
        # Use a default company name if none provided
        if (-not $CompanyName) {
            $CompanyName = "DefaultCompany"
        }
        
        $EnvScriptPath = Join-Path $SuiteRoot "Scripts\Set-SuiteEnvironment.ps1"
        if (-not (Test-Path $EnvScriptPath -PathType Leaf)) {
            throw "Set-SuiteEnvironment.ps1 not found at: $EnvScriptPath"
        }
        
        # Source the environment script
        . $EnvScriptPath $SuiteRoot $CompanyName
        
        if (-not $global:MandA -or -not $global:MandA.Initialized) {
            throw "Failed to initialize M&A Discovery Suite environment"
        }
        
        Write-Host "[Launcher] Environment initialized successfully" -ForegroundColor Green
    } else {
        Write-Host "[Launcher] Using existing M&A Discovery Suite environment" -ForegroundColor Green
    }
    
    # --- Launch Interactive Menu ---
    Write-Host "[Launcher] Starting Interactive Menu System..." -ForegroundColor Yellow
    
    $InteractiveMenuScript = Join-Path $SuiteRoot "Scripts\Interactive-Menu.ps1"
    if (-not (Test-Path $InteractiveMenuScript -PathType Leaf)) {
        throw "Interactive-Menu.ps1 not found at: $InteractiveMenuScript"
    }
    
    $menuParams = @{
        CompanyName = if ($CompanyName) { $CompanyName } else { $global:MandA.CompanyName }
        SkipBanner = $SkipBanner
    }
    
    & $InteractiveMenuScript @menuParams
    
    $menuExitCode = $LASTEXITCODE
    Write-Host "[Launcher] Interactive Menu exited with code: $menuExitCode" -ForegroundColor Gray
    
    exit $menuExitCode
    
} catch {
    Write-Host ""
    Write-Host "[ERROR] Failed to launch Interactive Menu: $($_.Exception.Message)" -ForegroundColor Red
    
    if ($_.ScriptStackTrace) {
        Write-Host ""
        Write-Host "Stack Trace:" -ForegroundColor DarkRed
        Write-Host $_.ScriptStackTrace -ForegroundColor DarkGray
    }
    
    Write-Host ""
    Write-Host "Troubleshooting:" -ForegroundColor Yellow
    Write-Host "  1. Ensure M&A Discovery Suite is properly installed" -ForegroundColor Gray
    Write-Host "  2. Check that all required files are present" -ForegroundColor Gray
    Write-Host "  3. Verify PowerShell execution policy allows script execution" -ForegroundColor Gray
    Write-Host "  4. Try running QuickStart.ps1 first to initialize the environment" -ForegroundColor Gray
    
    exit 1
}