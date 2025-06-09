# -*- coding: utf-8-bom -*-
#Requires -Version 5.1

<#
.SYNOPSIS
    Test script to validate the runspace error handling fixes implementation
.DESCRIPTION
    This script validates that all the critical fixes for runspace context corruption,
    parameter issues, SharePoint configuration, processing phase context, and memory
    management have been properly implemented.
.NOTES
    Version: 1.0.0
    Created: 2025-06-09
    Author: M&A Discovery Suite Team
#>

[CmdletBinding()]
param(
    [Parameter(Mandatory=$false)]
    [switch]$Detailed,
    
    [Parameter(Mandatory=$false)]
    [string]$OutputPath = "ValidationResults"
)

# Initialize results
$script:TestResults = @{
    Timestamp = Get-Date
    TestsRun = 0
    TestsPassed = 0
    TestsFailed = 0
    Details = [System.Collections.ArrayList]::new()
    Fixes = @{
        Fix1_RunspaceErrorHandling = $false
        Fix2_ContextParameterStandardization = $false
        Fix3_SharePointConfiguration = $false
        Fix4_ProcessingPhaseContext = $false
        Fix5_MemoryManagementTimeout = $false
    }
}

function Write-TestLog {
    param(
        [string]$Message,
        [string]$Level = "INFO",
        [string]$TestName = ""
    )
    
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $color = switch ($Level) {
        "PASS" { "Green" }
        "FAIL" { "Red" }
        "WARN" { "Yellow" }
        "INFO" { "Cyan" }
        default { "White" }
    }
    
    $prefix = if ($TestName) { "[$TestName] " } else { "" }
    Write-Host "$timestamp [$Level] $prefix$Message" -ForegroundColor $color
    
    # Add to results
    $null = $script:TestResults.Details.Add(@{
        Timestamp = Get-Date
        Level = $Level
        TestName = $TestName
        Message = $Message
    })
}

function Test-Fix1-RunspaceErrorHandling {
    Write-TestLog -Message "Testing Fix 1: Runspace Error Handling" -Level "INFO" -TestName "Fix1"
    $script:TestResults.TestsRun++
    
    try {
        $orchestratorPath = Join-Path $PSScriptRoot "..\Core\MandA-Orchestrator.ps1"
        if (-not (Test-Path $orchestratorPath)) {
            throw "Orchestrator file not found: $orchestratorPath"
        }
        
        $content = Get-Content $orchestratorPath -Raw
        
        # Check for enhanced error handling in runspace scriptblock
        if ($content -match 'trap' -and $content -match '\$errorMessage.*\$_\.Exception\.Message') {
            Write-TestLog -Message "Enhanced error handling found in runspace scriptblock" -Level "PASS" -TestName "Fix1"
            $script:TestResults.Fixes.Fix1_RunspaceErrorHandling = $true
            $script:TestResults.TestsPassed++
        } else {
            Write-TestLog -Message "Enhanced error handling NOT found in runspace scriptblock" -Level "FAIL" -TestName "Fix1"
            $script:TestResults.TestsFailed++
        }
        
        # Check for proper error message handling
        if ($content -match 'elseif.*\$_\.ToString') {
            Write-TestLog -Message "Fallback error message handling found" -Level "PASS" -TestName "Fix1"
        } else {
            Write-TestLog -Message "Fallback error message handling missing" -Level "WARN" -TestName "Fix1"
        }
        
    } catch {
        Write-TestLog -Message "Error testing Fix 1: $_" -Level "FAIL" -TestName "Fix1"
        $script:TestResults.TestsFailed++
    }
}

function Test-Fix2-ContextParameterStandardization {
    Write-TestLog -Message "Testing Fix 2: Context Parameter Standardization" -Level "INFO" -TestName "Fix2"
    $script:TestResults.TestsRun++
    
    try {
        $orchestratorPath = Join-Path $PSScriptRoot "..\Core\MandA-Orchestrator.ps1"
        $content = Get-Content $orchestratorPath -Raw
        
        # Check for Context parameter checking logic
        $contextCheckPattern = 'Parameters\.ContainsKey.*Context'
        
        if ($content -match $contextCheckPattern) {
            Write-TestLog -Message "Context parameter checking logic found" -Level "PASS" -TestName "Fix2"
            $script:TestResults.Fixes.Fix2_ContextParameterStandardization = $true
            $script:TestResults.TestsPassed++
        } else {
            Write-TestLog -Message "Context parameter checking logic NOT found" -Level "FAIL" -TestName "Fix2"
            $script:TestResults.TestsFailed++
        }
        
        # Check for parameter addition logic
        if ($content -match '\$params\[''Context''\]\s*=\s*\$globalContext') {
            Write-TestLog -Message "Context parameter addition logic found" -Level "PASS" -TestName "Fix2"
        } else {
            Write-TestLog -Message "Context parameter addition logic missing" -Level "WARN" -TestName "Fix2"
        }
        
    } catch {
        Write-TestLog -Message "Error testing Fix 2: $_" -Level "FAIL" -TestName "Fix2"
        $script:TestResults.TestsFailed++
    }
}

function Test-Fix3-SharePointConfiguration {
    Write-TestLog -Message "Testing Fix 3: SharePoint Configuration" -Level "INFO" -TestName "Fix3"
    $script:TestResults.TestsRun++
    
    try {
        $configPath = Join-Path $PSScriptRoot "..\Configuration\default-config.json"
        if (-not (Test-Path $configPath)) {
            throw "Configuration file not found: $configPath"
        }
        
        $configContent = Get-Content $configPath -Raw | ConvertFrom-Json
        
        # Check for SharePoint configuration
        if ($configContent.discovery.sharepoint -and $configContent.discovery.sharepoint.tenantName) {
            Write-TestLog -Message "SharePoint configuration found with tenantName: $($configContent.discovery.sharepoint.tenantName)" -Level "PASS" -TestName "Fix3"
            $script:TestResults.Fixes.Fix3_SharePointConfiguration = $true
            $script:TestResults.TestsPassed++
        } else {
            Write-TestLog -Message "SharePoint configuration NOT found or incomplete" -Level "FAIL" -TestName "Fix3"
            $script:TestResults.TestsFailed++
        }
        
    } catch {
        Write-TestLog -Message "Error testing Fix 3: $_" -Level "FAIL" -TestName "Fix3"
        $script:TestResults.TestsFailed++
    }
}

function Test-Fix4-ProcessingPhaseContext {
    Write-TestLog -Message "Testing Fix 4: Processing Phase Context" -Level "INFO" -TestName "Fix4"
    $script:TestResults.TestsRun++
    
    try {
        $orchestratorPath = Join-Path $PSScriptRoot "..\Core\MandA-Orchestrator.ps1"
        $content = Get-Content $orchestratorPath -Raw
        
        # Check for complete context passing in processing phase
        $contextPassingPattern = 'Start-DataAggregation.*Parameters\.ContainsKey\(''Context''\)'
        
        if ($content -match $contextPassingPattern) {
            Write-TestLog -Message "Processing phase context checking found" -Level "PASS" -TestName "Fix4"
            $script:TestResults.Fixes.Fix4_ProcessingPhaseContext = $true
            $script:TestResults.TestsPassed++
        } else {
            Write-TestLog -Message "Processing phase context checking NOT found" -Level "FAIL" -TestName "Fix4"
            $script:TestResults.TestsFailed++
        }
        
        # Check for fallback Paths parameter
        if ($content -match '\$aggregationParams\[''Paths''\]\s*=\s*\$global:MandA\.Paths') {
            Write-TestLog -Message "Fallback Paths parameter logic found" -Level "PASS" -TestName "Fix4"
        } else {
            Write-TestLog -Message "Fallback Paths parameter logic missing" -Level "WARN" -TestName "Fix4"
        }
        
    } catch {
        Write-TestLog -Message "Error testing Fix 4: $_" -Level "FAIL" -TestName "Fix4"
        $script:TestResults.TestsFailed++
    }
}

function Test-Fix5-MemoryManagementTimeout {
    Write-TestLog -Message "Testing Fix 5: Memory Management and Timeout" -Level "INFO" -TestName "Fix5"
    $script:TestResults.TestsRun++
    
    try {
        $orchestratorPath = Join-Path $PSScriptRoot "..\Core\MandA-Orchestrator.ps1"
        $content = Get-Content $orchestratorPath -Raw
        
        # Check for enhanced timeout handling
        $timeoutPattern = '# Force stop the runspace'
        
        if ($content -match $timeoutPattern) {
            Write-TestLog -Message "Enhanced timeout handling found" -Level "PASS" -TestName "Fix5"
        } else {
            Write-TestLog -Message "Enhanced timeout handling NOT found" -Level "FAIL" -TestName "Fix5"
            $script:TestResults.TestsFailed++
            return
        }
        
        # Check for immediate disposal
        if ($content -match '# Dispose immediately to free memory') {
            Write-TestLog -Message "Immediate disposal logic found" -Level "PASS" -TestName "Fix5"
        } else {
            Write-TestLog -Message "Immediate disposal logic missing" -Level "WARN" -TestName "Fix5"
        }
        
        # Check for forced garbage collection
        if ($content -match 'System\.GC.*Collect' -and $content -match 'WaitForPendingFinalizers') {
            Write-TestLog -Message "Forced garbage collection found" -Level "PASS" -TestName "Fix5"
            $script:TestResults.Fixes.Fix5_MemoryManagementTimeout = $true
            $script:TestResults.TestsPassed++
        } else {
            Write-TestLog -Message "Forced garbage collection missing" -Level "WARN" -TestName "Fix5"
        }
        
    } catch {
        Write-TestLog -Message "Error testing Fix 5: $_" -Level "FAIL" -TestName "Fix5"
        $script:TestResults.TestsFailed++
    }
}

function Export-TestResults {
    # Create output directory if it doesn't exist
    if (-not (Test-Path $OutputPath)) {
        New-Item -Path $OutputPath -ItemType Directory -Force | Out-Null
    }
    
    # Generate report
    $reportPath = Join-Path $OutputPath "RunspaceFixesTest_$(Get-Date -Format 'yyyyMMdd_HHmmss').json"
    $script:TestResults | ConvertTo-Json -Depth 10 | Set-Content -Path $reportPath -Encoding UTF8
    
    Write-TestLog -Message "Test results exported to: $reportPath" -Level "INFO"
    
    # Summary
    Write-Host "`n" -NoNewline
    Write-TestLog -Message "=== TEST SUMMARY ===" -Level "INFO"
    Write-TestLog -Message "Tests Run: $($script:TestResults.TestsRun)" -Level "INFO"
    Write-TestLog -Message "Tests Passed: $($script:TestResults.TestsPassed)" -Level $(if ($script:TestResults.TestsPassed -eq $script:TestResults.TestsRun) { "PASS" } else { "INFO" })
    Write-TestLog -Message "Tests Failed: $($script:TestResults.TestsFailed)" -Level $(if ($script:TestResults.TestsFailed -eq 0) { "PASS" } else { "FAIL" })
    
    Write-Host "`n" -NoNewline
    Write-TestLog -Message "=== FIX STATUS ===" -Level "INFO"
    foreach ($fix in $script:TestResults.Fixes.Keys) {
        $status = if ($script:TestResults.Fixes[$fix]) { "IMPLEMENTED" } else { "MISSING" }
        $level = if ($script:TestResults.Fixes[$fix]) { "PASS" } else { "FAIL" }
        Write-TestLog -Message "$fix : $status" -Level $level
    }
    
    return $reportPath
}

# Main execution
try {
    Write-TestLog -Message "Starting Runspace Error Handling Fixes Validation" -Level "INFO"
    Write-TestLog -Message "Output Path: $OutputPath" -Level "INFO"
    
    # Run all tests
    Test-Fix1-RunspaceErrorHandling
    Test-Fix2-ContextParameterStandardization
    Test-Fix3-SharePointConfiguration
    Test-Fix4-ProcessingPhaseContext
    Test-Fix5-MemoryManagementTimeout
    
    # Export results
    $reportPath = Export-TestResults
    
    # Determine exit code
    $exitCode = if ($script:TestResults.TestsFailed -eq 0) { 0 } else { 1 }
    
    Write-TestLog -Message "Validation complete. Exit code: $exitCode" -Level $(if ($exitCode -eq 0) { "PASS" } else { "FAIL" })
    
    if ($Detailed) {
        Write-Host "`nDetailed Results:" -ForegroundColor Cyan
        $script:TestResults.Details | ForEach-Object {
            Write-Host "  [$($_.Level)] [$($_.TestName)] $($_.Message)" -ForegroundColor $(
                switch ($_.Level) {
                    "PASS" { "Green" }
                    "FAIL" { "Red" }
                    "WARN" { "Yellow" }
                    default { "White" }
                }
            )
        }
    }
    
    exit $exitCode
    
} catch {
    Write-TestLog -Message "Fatal error during validation: $_" -Level "FAIL"
    Write-Host "Stack Trace: $($_.ScriptStackTrace)" -ForegroundColor Red
    exit 99
}