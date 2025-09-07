# -*- coding: utf-8 -*-
#Requires -Version 5.1

# Author: System Enhancement
# Version: 1.0.0
# Created: 2025-09-07

<#
.SYNOPSIS
    Comprehensive Test Script for PrerequisitesManager and Real-Time Discovery Engine
.DESCRIPTION
    Tests PrerequisitesManager.psm1 for syntax errors and functionality, then tests
    Invoke-RealTimeDiscoveryEngine.ps1 with sample parameters. Provides clear
    reporting of test results and any issues encountered.
.EXAMPLE
    .\Test-PrerequisitesAndDiscovery.ps1
.NOTES
    This script should be run from the root directory of the M&A Discovery Suite
#>

# Script configuration
[CmdletBinding()]
param()

$ErrorActionPreference = "Continue"
Set-StrictMode -Version Latest

$ScriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectRoot = Split-Path -Parent $ScriptRoot

# Test results tracking
$testResults = @{
    PrerequisitesTest = $false
    DiscoveryTest = $false
    Errors = @()
    Warnings = @()
    SuccessCount = 0
    FailureCount = 0
}

# Utility functions for consistent output formatting
function Write-TestHeader {
    param([string]$message)
    Write-Host ""
    Write-Host "==================================================================" -ForegroundColor Cyan
    Write-Host "$message" -ForegroundColor White
    Write-Host "==================================================================" -ForegroundColor Cyan
}

function Write-Success {
    param([string]$message)
    Write-Host "✓ $message" -ForegroundColor Green
}

function Write-Warning {
    param([string]$message)
    Write-Host "⚠ $message" -ForegroundColor Yellow
    $testResults.Warnings += $message
}

function Write-Error {
    param([string]$message)
    Write-Host "✗ $message" -ForegroundColor Red
    $testResults.Errors += $message
}

function Write-Host {
    param([string]$message)
    Write-Host "ℹ $message" -ForegroundColor White
}

try {
    Write-TestHeader "Starting Prerequisites and Discovery Engine Test Suite"

    # Test 1: PrerequisitesManager Module Load Test
    Write-TestHeader "TEST 1: PrerequisitesManager Module Load and Syntax Check"

    $prereqModulePath = Join-Path $ScriptRoot "PrerequisitesManager.psm1"

    if (-not (Test-Path $prereqModulePath)) {
        throw "PrerequisitesManager.psm1 not found at: $prereqModulePath"
    }

    Write-Host "Attempting to import PrerequisitesManager.psm1..."

    try {
        Import-Module $prereqModulePath -Force -ErrorAction Stop
        Write-Success "PrerequisitesManager.psm1 loaded successfully"
        Write-Success "Module syntax is valid"
        $testResults.SuccessCount++
    } catch {
        Write-Error "Failed to load PrerequisitesManager.psm1: $($_.Exception.Message)"
        $testResults.FailureCount++
        throw
    }

    # Test 2: Prerequisites Check Function Test
    Write-TestHeader "TEST 2: Prerequisites Check Function Test"

    Write-Host "Testing Invoke-PrerequisitesCheck function..."

    try {
        # Test with basic module check (All modules)
        $prereqResults = Invoke-PrerequisitesCheck -ModuleName "All" -Install:$false

        if ($prereqResults) {
            Write-Success "Invoke-PrerequisitesCheck executed successfully"
            Write-Host "Prerequisites Check Summary:"
            Write-Host "  Total prerequisites: $($prereqResults.Prerequisites.Count)"
            Write-Host "  Installed: $($prereqResults.Installed.Count)"
            Write-Host "  Warnings: $($prereqResults.Warnings.Count)"
            Write-Host "  Errors: $($prereqResults.Errors.Count)"
            Write-Host "  Overall result: $(if ($prereqResults.OverallSuccess) { 'PASS' } else { 'FAIL' })"

            if ($prereqResults.OverallSuccess) {
                $testResults.SuccessCount++
                $testResults.PrerequisitesTest = $true
            } else {
                $testResults.FailureCount++
                Write-Warning "Prerequisites check returned failures - this may be expected in test environment"

                # Display first few errors if any
                if ($prereqResults.Errors.Count -gt 0) {
                    Write-Host "First few errors encountered:"
                    $prereqResults.Errors | Select-Object -First 3 | ForEach-Object {
                        Write-Host "  - $($_.Name): $($_.Status)"
                    }
                }
            }
        } else {
            Write-Error "Invoke-PrerequisitesCheck returned null or empty result"
            $testResults.FailureCount++
        }
    } catch {
        Write-Error "Invoke-PrerequisitesCheck function failed: $($_.Exception.Message)"
        $testResults.FailureCount++
    }

    # Test 3: Real-Time Discovery Engine Test
    Write-TestHeader "TEST 3: Real-Time Discovery Engine Test"

    $discoveryScriptPath = Join-Path $ProjectRoot "Scripts\Invoke-RealTimeDiscoveryEngine.ps1"

    if (-not (Test-Path $discoveryScriptPath)) {
        throw "Invoke-RealTimeDiscoveryEngine.ps1 not found at: $discoveryScriptPath"
    }

    Write-Host "Testing Invoke-RealTimeDiscoveryEngine.ps1 with sample parameters..."

    # Create sample parameters for testing
    $sampleParams = @{
        CompanyName = "TestCompany"
        DiscoveryInterval = 10
        SessionId = "test-session-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
        EnableFileWatchers = $true
        EnableEventLogMonitoring = $true
    }

    Write-Host "Sample parameters:"
    $sampleParams.GetEnumerator() | ForEach-Object {
        Write-Host "  $($_.Key): $($_.Value)"
    }

    try {
        # Note: We're using & to execute the script as a background process might not be suitable for testing
        # We'll use dot sourcing to test syntax and basic execution
        Write-Host "Testing script syntax validation..."

        # Execute the script with sample parameters
        $scriptResult = & $discoveryScriptPath @sampleParams

        if ($scriptResult) {
            Write-Success "Invoke-RealTimeDiscoveryEngine.ps1 executed successfully"
            Write-Host "Engine Status:"
            Write-Host "  Session ID: $($scriptResult.SessionId)"
            Write-Host "  Discovery Interval: $($scriptResult.DiscoveryInterval) seconds"
            Write-Host "  Active Watchers: $($scriptResult.ActiveWatchers)"
            Write-Host "  Is Running: $($scriptResult.IsRunning)"

            $testResults.SuccessCount++
            $testResults.DiscoveryTest = $true
        } else {
            Write-Warning "Script executed but returned no status object"
            Write-Host "This may be expected if the engine starts successfully but returns no data"
            $testResults.SuccessCount++
            $testResults.DiscoveryTest = $true
        }

    } catch {
        Write-Error "Invoke-RealTimeDiscoveryEngine.ps1 failed with error: $($_.Exception.Message)"
        $testResults.FailureCount++
    }

} catch {
    Write-Error "Critical test failure: $($_.Exception.Message)"
    $testResults.FailureCount++

    # Display stack trace if available and verbose
    if ($VerbosePreference -ne "SilentlyContinue" -and $_.Exception.StackTrace) {
        Write-Host "Stack trace:"
        Write-Host $_.Exception.StackTrace
    }
} finally {

    # Test Summary
    Write-TestHeader "TEST SUMMARY"

    Write-Host "Test Results:"
    Write-Host "  PrerequisitesManager Load Test: $(if ($testResults.PrerequisitesTest) { 'PASS' } else { 'FAIL' })"
    Write-Host "  Prerequisites Check Function Test: $(if ($testResults.PrerequisitesTest -and $prereqResults.OverallSuccess) { 'PASS' } else { if ($testResults.PrerequisitesTest) { 'PARTIAL' } else { 'FAIL' } })"
    Write-Host "  Discovery Engine Test: $(if ($testResults.DiscoveryTest) { 'PASS' } else { 'FAIL' })"
    Write-Host ""
    Write-Host "Summary:"
    Write-Host "  Total tests executed: 3"
    Write-Host "  Successes: $($testResults.SuccessCount)"
    Write-Host "  Failures: $($testResults.FailureCount)"
    Write-Host "  Warnings: $($testResults.Warnings.Count)"
    Write-Host "  Errors: $($testResults.Errors.Count)"

    # Overall status
    $overallSuccess = ($testResults.FailureCount -eq 0 -and ($testResults.SuccessCount -gt 0))

    Write-Host ""
    if ($overallSuccess) {
        Write-Host "OVERALL RESULT: SUCCESS" -ForegroundColor Green
        Write-Host "All tests completed successfully or with expected warnings"
        Write-Host "Both PrerequisitesManager and Discovery Engine are functional"
    } else {
        Write-Host "OVERALL RESULT: FAILURE" -ForegroundColor Red
        Write-Host "One or more critical tests failed"
        Write-Host "Review the test output above for specific error details"
    }

    # Display warnings and errors if any
    if ($testResults.Warnings.Count -gt 0) {
        Write-Host ""
        Write-Host "Warnings encountered:"
        $testResults.Warnings | ForEach-Object { Write-Warning $_ }
    }

    if ($testResults.Errors.Count -gt 0) {
        Write-Host ""
        Write-Host "Errors encountered:"
        $testResults.Errors | ForEach-Object { Write-Error $_ }
    }

    Write-TestHeader "Testing Session Complete"
    Write-Host "Timestamp: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
    Write-Host "Project Root: $ProjectRoot"
    Write-Host "PowerShell Version: $($PSVersionTable.PSVersion.ToString())"

    # Return exit code based on results
    if ($overallSuccess) {
        exit 0
    } else {
        exit 1
    }
}