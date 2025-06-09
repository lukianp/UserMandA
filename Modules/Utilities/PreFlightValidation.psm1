# -*- coding: utf-8-bom -*-

# Author: Lukian Poleschtschuk
# Version: 1.0.0
# Created: 2025-06-06
# Last Modified: 2025-06-06
# Change Log: Initial implementation of pre-flight validation module

<#
.SYNOPSIS
    Pre-flight validation module for M&A Discovery Suite
.DESCRIPTION
    Provides pre-flight validation functions to check PowerShell version, execution policy,
    and administrator rights before running M&A Discovery Suite operations.
.NOTES
    Author: Lukian Poleschtschuk
    Version: 1.0.0
    Created: 2025-06-06
    Last Modified: 2025-06-06
    Change Log: Initial version - any future changes require version increment
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
    <#
    .SYNOPSIS
        Validates M&A Discovery Suite prerequisites
    .DESCRIPTION
        Checks PowerShell version, execution policy, and administrator rights
        to ensure the environment is ready for M&A Discovery Suite operations
    .PARAMETER ThrowOnFailure
        If specified, throws an exception when critical prerequisites fail
    .PARAMETER Quiet
        If specified, suppresses output and returns only boolean result
    .OUTPUTS
        System.Boolean - Returns $true if all prerequisites pass, $false otherwise
    .EXAMPLE
        Test-SuitePrerequisites
        Runs all prerequisite checks with standard output
    .EXAMPLE
        Test-SuitePrerequisites -ThrowOnFailure
        Runs checks and throws exception on critical failures
    .EXAMPLE
        $isReady = Test-SuitePrerequisites -Quiet
        Runs checks silently and returns boolean result
    #>
    [CmdletBinding()]
    param(
        [Parameter(Mandatory = $false)]
        [switch]$ThrowOnFailure,
        
        [Parameter(Mandatory = $false)]
        [switch]$Quiet
    )
    
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
}

function Invoke-PreFlightCheck {
    <#
    .SYNOPSIS
        Alias for Test-SuitePrerequisites with standard parameters
    .DESCRIPTION
        Convenience function that runs pre-flight validation with standard output
    .OUTPUTS
        System.Boolean - Returns $true if all prerequisites pass, $false otherwise
    .EXAMPLE
        Invoke-PreFlightCheck
        Runs all prerequisite checks with standard output
    #>
    [CmdletBinding()]
    param()
    
    return Test-SuitePrerequisites
}

# Export functions
Export-ModuleMember -Function Test-SuitePrerequisites, Invoke-PreFlightCheck
