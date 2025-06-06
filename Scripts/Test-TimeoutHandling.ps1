#Requires -Version 5.1
<#
.SYNOPSIS
    Test script to demonstrate and validate timeout handling functionality.

.DESCRIPTION
    This script tests the timeout handling functions added to the ErrorHandling module,
    including basic timeout, timeout with retry, and timeout testing capabilities.

.EXAMPLE
    .\Test-TimeoutHandling.ps1
    Runs all timeout tests with default parameters.

.EXAMPLE
    .\Test-TimeoutHandling.ps1 -TestType Basic
    Runs only the basic timeout test.
#>

[CmdletBinding()]
param(
    [Parameter(Mandatory=$false)]
    [ValidateSet("All", "Basic", "Retry", "Testing")]
    [string]$TestType = "All",
    
    [Parameter(Mandatory=$false)]
    [int]$TimeoutSeconds = 5,
    
    [Parameter(Mandatory=$false)]
    [switch]$Verbose
)

# Import required modules
try {
    Import-Module "$PSScriptRoot\..\Modules\Utilities\ErrorHandling.psm1" -Force
    Import-Module "$PSScriptRoot\..\Modules\Utilities\EnhancedLogging.psm1" -Force -ErrorAction SilentlyContinue
    Write-Host "✓ Modules imported successfully" -ForegroundColor Green
} catch {
    Write-Error "Failed to import required modules: $($_.Exception.Message)"
    exit 1
}

# Initialize basic context for logging
$testContext = [PSCustomObject]@{
    Config = @{
        environment = @{
            maxRetries = 3
            retryDelaySeconds = 2
        }
    }
}

function Test-BasicTimeout {
    param([int]$TimeoutSeconds)
    
    Write-Host "`n=== Testing Basic Timeout Functionality ===" -ForegroundColor Cyan
    
    # Test 1: Operation that completes quickly (should succeed)
    Write-Host "Test 1: Quick operation (should succeed)..." -ForegroundColor Yellow
    try {
        $result = Invoke-WithTimeout -ScriptBlock {
            Start-Sleep -Seconds 1
            return "Quick operation completed"
        } -TimeoutSeconds $TimeoutSeconds -OperationName "Quick Test" -Context $testContext
        
        Write-Host "✓ Quick operation succeeded: $result" -ForegroundColor Green
    } catch {
        Write-Host "✗ Quick operation failed unexpectedly: $($_.Exception.Message)" -ForegroundColor Red
    }
    
    # Test 2: Operation that times out (should fail with timeout)
    Write-Host "Test 2: Slow operation (should timeout)..." -ForegroundColor Yellow
    try {
        $result = Invoke-WithTimeout -ScriptBlock {
            Start-Sleep -Seconds ($TimeoutSeconds + 3)
            return "This should not complete"
        } -TimeoutSeconds $TimeoutSeconds -OperationName "Slow Test" -Context $testContext
        
        Write-Host "✗ Slow operation completed unexpectedly: $result" -ForegroundColor Red
    } catch [System.TimeoutException] {
        Write-Host "✓ Slow operation timed out as expected: $($_.Exception.Message)" -ForegroundColor Green
    } catch {
        Write-Host "✗ Slow operation failed with unexpected error: $($_.Exception.Message)" -ForegroundColor Red
    }
}

function Test-TimeoutWithRetry {
    param([int]$TimeoutSeconds)
    
    Write-Host "`n=== Testing Timeout with Retry Functionality ===" -ForegroundColor Cyan
    
    # Test 1: Operation that succeeds on retry
    Write-Host "Test 1: Operation succeeding on second attempt..." -ForegroundColor Yellow
    $attemptCount = 0
    try {
        $result = Invoke-WithTimeoutAndRetry -ScriptBlock {
            $script:attemptCount++
            if ($script:attemptCount -eq 1) {
                Start-Sleep -Seconds ($TimeoutSeconds + 1)  # First attempt times out
            } else {
                Start-Sleep -Seconds 1  # Second attempt succeeds
                return "Succeeded on attempt $script:attemptCount"
            }
        } -TimeoutSeconds $TimeoutSeconds -MaxRetries 3 -DelaySeconds 1 -OperationName "Retry Test" -Context $testContext
        
        Write-Host "✓ Retry operation succeeded: $result" -ForegroundColor Green
    } catch {
        Write-Host "✗ Retry operation failed: $($_.Exception.Message)" -ForegroundColor Red
    }
    
    # Test 2: Operation that times out on all attempts
    Write-Host "Test 2: Operation timing out on all attempts..." -ForegroundColor Yellow
    try {
        $result = Invoke-WithTimeoutAndRetry -ScriptBlock {
            Start-Sleep -Seconds ($TimeoutSeconds + 2)  # Always times out
            return "This should never complete"
        } -TimeoutSeconds $TimeoutSeconds -MaxRetries 2 -DelaySeconds 1 -OperationName "Always Timeout Test" -Context $testContext
        
        Write-Host "✗ Always timeout operation completed unexpectedly: $result" -ForegroundColor Red
    } catch [System.TimeoutException] {
        Write-Host "✓ Always timeout operation failed as expected: $($_.Exception.Message)" -ForegroundColor Green
    } catch {
        Write-Host "✗ Always timeout operation failed with unexpected error: $($_.Exception.Message)" -ForegroundColor Red
    }
}

function Test-TimeoutTesting {
    param([int]$TimeoutSeconds)
    
    Write-Host "`n=== Testing Timeout Testing Functionality ===" -ForegroundColor Cyan
    
    # Test the timeout testing function
    Write-Host "Test 1: Testing timeout behavior validation..." -ForegroundColor Yellow
    try {
        $testResult = Test-OperationTimeout -TestScriptBlock {
            Start-Sleep -Seconds ($TimeoutSeconds + 1)  # Should timeout
        } -ExpectedTimeoutSeconds $TimeoutSeconds -TestName "Timeout Validation Test" -Context $testContext
        
        if ($testResult.TimedOut) {
            Write-Host "✓ Timeout test correctly identified timeout behavior (Elapsed: $($testResult.ElapsedSeconds)s)" -ForegroundColor Green
        } else {
            Write-Host "✗ Timeout test failed to identify timeout behavior" -ForegroundColor Red
        }
    } catch {
        Write-Host "✗ Timeout testing failed: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Main execution
Write-Host "Starting Timeout Handling Tests" -ForegroundColor Magenta
Write-Host "Timeout Duration: $TimeoutSeconds seconds" -ForegroundColor Gray

switch ($TestType) {
    "All" {
        Test-BasicTimeout -TimeoutSeconds $TimeoutSeconds
        Test-TimeoutWithRetry -TimeoutSeconds $TimeoutSeconds
        Test-TimeoutTesting -TimeoutSeconds $TimeoutSeconds
    }
    "Basic" {
        Test-BasicTimeout -TimeoutSeconds $TimeoutSeconds
    }
    "Retry" {
        Test-TimeoutWithRetry -TimeoutSeconds $TimeoutSeconds
    }
    "Testing" {
        Test-TimeoutTesting -TimeoutSeconds $TimeoutSeconds
    }
}

Write-Host "`n=== Timeout Handling Tests Complete ===" -ForegroundColor Magenta