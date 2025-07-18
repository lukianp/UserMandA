# -*- coding: utf-8-bom -*-
#Requires -Version 5.1

# Author: Lukian Poleschtschuk
# Version: 1.0.0
# Created: 2025-01-18
# Last Modified: 2025-01-18

<#
.SYNOPSIS
    Standalone pre-flight validation script for M&A Discovery Suite
.DESCRIPTION
    Performs comprehensive pre-flight validation checks for PowerShell version, execution policy, administrator rights, 
    required modules, and system resources without requiring the full suite environment setup. This script can be run 
    independently before attempting to use the M&A Discovery Suite to ensure all prerequisites are met.
.PARAMETER ThrowOnFailure
    If specified, throws an exception when critical prerequisites fail
.PARAMETER Quiet
    If specified, suppresses detailed output and returns only the result
.NOTES
    Version: 1.0.0
    Author: Lukian Poleschtschuk
    Created: 2025-01-18
    Requires: PowerShell 5.1+
    Author: Lukian Poleschtschuk
    Version: 1.0.0
    Created: 2025-06-06
    Last Modified: 2025-06-06
    Change Log: Initial version - any future changes require version increment
.EXAMPLE
    .\Test-PreFlightValidation.ps1
    Runs all prerequisite checks with standard output
.EXAMPLE
    .\Test-PreFlightValidation.ps1 -ThrowOnFailure
    Runs checks and throws exception on critical failures
.EXAMPLE
    .\Test-PreFlightValidation.ps1 -Quiet
    Runs checks silently and returns boolean result via exit code
#>

[CmdletBinding()]
param(
    [Parameter(Mandatory = $false)]
    [switch]$ThrowOnFailure,
    
    [Parameter(Mandatory = $false)]
    [switch]$Quiet
)

$ErrorActionPreference = "Stop"

# Determine script location for module import
$ScriptRoot = $PSScriptRoot
if (-not $ScriptRoot -or $ScriptRoot -eq $null) {
    $ScriptRoot = Split-Path $MyInvocation.MyCommand.Path -Parent
}

# Try to import the PreFlightValidation module
$PreFlightModulePath = Join-Path (Split-Path $ScriptRoot -Parent) "Modules\Utilities\PreFlightValidation.psm1"

if (Test-Path $PreFlightModulePath) {
    try {
        Import-Module $PreFlightModulePath -Force -ErrorAction Stop
        
        # Run the validation using the module
        $result = Test-SuitePrerequisites -ThrowOnFailure:$ThrowOnFailure -Quiet:$Quiet
        
        # Exit with appropriate code
        if ($result) {
            if (-not $Quiet) {
                Write-Host "Pre-flight validation completed successfully." -ForegroundColor Green
            }
            exit 0
        } else {
            if (-not $Quiet) {
                Write-Host "Pre-flight validation failed. See recommendations above." -ForegroundColor Red
            }
            exit 1
        }
    } catch {
        Write-Error "Failed to import PreFlightValidation module: $($_.Exception.Message)"
        exit 2
    }
} else {
    # Fallback: Run validation inline if module is not available
    if (-not $Quiet) {
        Write-Host "PreFlightValidation module not found. Running inline validation..." -ForegroundColor Yellow
        Write-Host "`n--- M&A Discovery Suite Pre-flight Validation (Inline) ---" -ForegroundColor Cyan
    }
    
    $allValid = $true
    
    # Check PowerShell version
    $psVersion = $PSVersionTable.PSVersion
    $psVersionValid = ($psVersion.Major -gt 5) -or ($psVersion.Major -eq 5 -and $psVersion.Minor -ge 1)
    
    if (-not $Quiet) {
        $status = if ($psVersionValid) { "PASS" } else { "FAIL" }
        $color = if ($psVersionValid) { "Green" } else { "Red" }
        Write-Host "$status - PowerShell Version: Current: $psVersion, Required: 5.1+" -ForegroundColor $color
        if (-not $psVersionValid) {
            Write-Host "    Recommendation: Upgrade to PowerShell 5.1 or higher" -ForegroundColor Yellow
        }
    }
    
    if (-not $psVersionValid) {
        $allValid = $false
        if ($ThrowOnFailure) {
            throw "PowerShell 5.1 or higher required. Current version: $psVersion"
        }
    }
    
    # Check execution policy
    $executionPolicy = Get-ExecutionPolicy
    $executionPolicyValid = $executionPolicy -ne 'Restricted'
    
    if (-not $Quiet) {
        $status = if ($executionPolicyValid) { "PASS" } else { "WARN" }
        $color = if ($executionPolicyValid) { "Green" } else { "Yellow" }
        Write-Host "$status - Execution Policy: Current: $executionPolicy" -ForegroundColor $color
        if (-not $executionPolicyValid) {
            Write-Host "    Recommendation: Set execution policy to RemoteSigned or Bypass: Set-ExecutionPolicy RemoteSigned -Scope CurrentUser" -ForegroundColor Yellow
            Write-Host "    WARNING: Execution policy is Restricted. Some operations may fail." -ForegroundColor Yellow
        }
    }
    
    if (-not $executionPolicyValid) {
        $allValid = $false
    }
    
    # Check administrator rights
    $currentPrincipal = [Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()
    $isAdmin = $currentPrincipal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
    
    if (-not $Quiet) {
        $status = if ($isAdmin) { "PASS" } else { "INFO" }
        $color = if ($isAdmin) { "Green" } else { "Cyan" }
        Write-Host "$status - Administrator Rights: Running as Administrator: $isAdmin" -ForegroundColor $color
        if (-not $isAdmin) {
            Write-Host "    Note: Some operations may require administrator privileges. Consider running as administrator if issues occur." -ForegroundColor Cyan
        }
    }
    
    # Summary
    if (-not $Quiet) {
        Write-Host "`n--- Pre-flight Validation Summary ---" -ForegroundColor Cyan
        if ($allValid) {
            Write-Host "Result: All critical prerequisites met. Ready to proceed." -ForegroundColor Green
        } else {
            Write-Host "Result: Some prerequisites failed. Review recommendations above." -ForegroundColor Yellow
        }
        Write-Host ""
    }
    
    # Exit with appropriate code
    if ($allValid) {
        if (-not $Quiet) {
            Write-Host "Pre-flight validation completed successfully." -ForegroundColor Green
        }
        exit 0
    } else {
        if (-not $Quiet) {
            Write-Host "Pre-flight validation failed. See recommendations above." -ForegroundColor Red
        }
        exit 1
    }
}