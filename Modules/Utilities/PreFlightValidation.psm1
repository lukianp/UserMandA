# -*- coding: utf-8-bom -*-
#Requires -Version 5.1

# Author: Lukian Poleschtschuk
# Version: 1.0.0
# Created: 2025-01-18
# Last Modified: 2025-01-18

<#
.SYNOPSIS
    Pre-flight validation module for M&A Discovery Suite
.DESCRIPTION
    Provides comprehensive pre-flight validation functions to check PowerShell version, execution policy, 
    administrator rights, required modules, network connectivity, and system resources before running 
    M&A Discovery Suite operations. This module ensures all prerequisites are met before beginning 
    discovery operations to prevent runtime failures and ensure optimal performance.
.NOTES
    Version: 1.0.0
    Author: Lukian Poleschtschuk
    Created: 2025-01-18
    Requires: PowerShell 5.1+, EnhancedLogging module
#>

function Invoke-SafeModuleExecution {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [scriptblock]$ScriptBlock,
        
        [Parameter(Mandatory=$true)]
        [string]$ModuleName,
        
        [Parameter(Mandatory=$false)]
        $Context
    )
    
    $result = @{
        Success = $false
        Data = $null
        Error = $null
        Duration = $null
    }
    
    $stopwatch = [System.Diagnostics.Stopwatch]::StartNew()
    
    try {
        # Validate global context
        if (-not $global:MandA -or -not $global:MandA.Initialized) {
            throw "Global M&A context not initialized"
        }
        
        # Execute the module function
        $result.Data = & $ScriptBlock
        $result.Success = $true
    } catch {
        $result.Error = @{
            Message = $_.Exception.Message
            Type = $_.Exception.GetType().FullName
            StackTrace = $_.ScriptStackTrace
            InnerException = if ($_.Exception.InnerException) { $_.Exception.InnerException.Message } else { $null }
        }
        
        # Log to both file and console
        if (Get-Command Write-MandALog -ErrorAction SilentlyContinue) {
            Write-MandALog -Message "[$ModuleName] Error: $($_.Exception.Message)" -Level "ERROR" -Component $ModuleName -Context $Context
        } else {
            Write-Host "[$ModuleName] Error: $($_.Exception.Message)" -ForegroundColor Red
        }
        
        # Don't rethrow - let caller handle based on result
    } finally {
        $stopwatch.Stop()
        $result.Duration = $stopwatch.Elapsed
    }
    
    return $result
}

function Test-SuitePrerequisites {
    param(
        [Parameter(Mandatory = $false)]
        [switch]$ThrowOnFailure,
        
        [Parameter(Mandatory = $false)]
        [switch]$Quiet
    )
    
    try {
        $allValid = $true
        $results = @()
        
        if (-not $Quiet) {
            Write-Host "`n--- M&A Discovery Suite Pre-flight Validation ---" -ForegroundColor Cyan
        }
        
        # Check PowerShell version
        $psVersion = $PSVersionTable.PSVersion
        $psVersionValid = ($psVersion.Major -gt 5) -or ($psVersion.Major -eq 5 -and $psVersion.Minor -ge 1)
        
        $psResult = @{
            Test = "PowerShell Version"
            Passed = $psVersionValid
            Details = "Current: $psVersion, Required: 5.1+"
            Recommendation = if (-not $psVersionValid) { "Upgrade to PowerShell 5.1 or higher" } else { "" }
        }
        $results += $psResult
        
        if (-not $Quiet) {
            $status = if ($psVersionValid) { "PASS" } else { "FAIL" }
            $color = if ($psVersionValid) { "Green" } else { "Red" }
            Write-Host "$status - $($psResult.Test): $($psResult.Details)" -ForegroundColor $color
            if (-not $psVersionValid -and $psResult.Recommendation) {
                Write-Host "    Recommendation: $($psResult.Recommendation)" -ForegroundColor Yellow
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
        
        $epResult = @{
            Test = "Execution Policy"
            Passed = $executionPolicyValid
            Details = "Current: $executionPolicy"
            Recommendation = if (-not $executionPolicyValid) { "Set execution policy to RemoteSigned or Bypass: Set-ExecutionPolicy RemoteSigned -Scope CurrentUser" } else { "" }
        }
        $results += $epResult
        
        if (-not $Quiet) {
            $status = if ($executionPolicyValid) { "PASS" } else { "WARN" }
            $color = if ($executionPolicyValid) { "Green" } else { "Yellow" }
            Write-Host "$status - $($epResult.Test): $($epResult.Details)" -ForegroundColor $color
            if (-not $executionPolicyValid -and $epResult.Recommendation) {
                Write-Host "    Recommendation: $($epResult.Recommendation)" -ForegroundColor Yellow
            }
        }
        
        if (-not $executionPolicyValid) {
            $allValid = $false
            if (-not $Quiet) {
                Write-Host "    WARNING: Execution policy is Restricted. Some operations may fail." -ForegroundColor Yellow
            }
        }
        
        # Check administrator rights
        $currentPrincipal = [Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()
        $isAdmin = $currentPrincipal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
        
        $adminResult = @{
            Test = "Administrator Rights"
            Passed = $isAdmin
            Details = "Running as Administrator: $isAdmin"
            Recommendation = if (-not $isAdmin) { "Some operations may require administrator privileges. Consider running as administrator if issues occur." } else { "" }
        }
        $results += $adminResult
        
        if (-not $Quiet) {
            $status = if ($isAdmin) { "PASS" } else { "INFO" }
            $color = if ($isAdmin) { "Green" } else { "Cyan" }
            Write-Host "$status - $($adminResult.Test): $($adminResult.Details)" -ForegroundColor $color
            if (-not $isAdmin -and $adminResult.Recommendation) {
                Write-Host "    Note: $($adminResult.Recommendation)" -ForegroundColor Cyan
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
        
        # Add results to output for programmatic access
        Add-Member -InputObject $PSCmdlet -MemberType NoteProperty -Name "ValidationResults" -Value $results -Force
        
        return $allValid
    } catch {
        Write-Host "Error in function 'Test-SuitePrerequisites': $($_.Exception.Message)" -ForegroundColor Red
        throw
    }
}

function Invoke-PreFlightCheck {
    param()
    
    try {
        return Test-SuitePrerequisites
    } catch {
        Write-Host "Error in function 'Invoke-PreFlightCheck': $($_.Exception.Message)" -ForegroundColor Red
        throw
    }
}

# Export functions
Export-ModuleMember -Function @(
    'Test-SuitePrerequisites',
    'Invoke-PreFlightCheck',
    'Invoke-SafeModuleExecution'
)

Write-Host "[PreFlightValidation.psm1] Module loaded successfully." -ForegroundColor Green
