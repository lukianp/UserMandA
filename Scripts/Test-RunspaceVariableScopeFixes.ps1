#Requires -Version 5.1
# -*- coding: utf-8-bom -*-

<#
.SYNOPSIS
    Test script to validate runspace variable scope fixes and enhancements
.DESCRIPTION
    Tests all the implemented fixes:
    1. Non-UTF-8 character removal (emoji replacements)
    2. Global DiscoveryResult class registration
    3. Module loading sequence
    4. Runspace session state enhancement
    5. Enhanced error handling in discovery modules
    6. Logging enhancements with structured logging
.NOTES
    Author: M&A Discovery Suite Team
    Version: 1.0.0
    Created: 2025-06-09
#>

[CmdletBinding()]
param(
    [Parameter(Mandatory=$false)]
    [string]$CompanyName = "TestCompany",
    
    [Parameter(Mandatory=$false)]
    [switch]$SkipDiscoveryTest,
    
    [Parameter(Mandatory=$false)]
    [switch]$Verbose
)

$ErrorActionPreference = "Stop"
$script:TestResults = @{
    TotalTests = 0
    PassedTests = 0
    FailedTests = 0
    TestDetails = @()
}

function Write-TestLog {
    param(
        [string]$Message,
        [string]$Level = "INFO"
    )
    
    $color = switch ($Level) {
        "ERROR" { "Red" }
        "WARN" { "Yellow" }
        "SUCCESS" { "Green" }
        "INFO" { "Cyan" }
        "DEBUG" { "Gray" }
        default { "White" }
    }
    
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    Write-Host "[$timestamp] [$Level] $Message" -ForegroundColor $color
}

function Test-Function {
    param(
        [string]$TestName,
        [scriptblock]$TestScript,
        [string]$Description = ""
    )
    
    $script:TestResults.TotalTests++
    $testStart = Get-Date
    
    try {
        Write-TestLog "Running test: $TestName" "INFO"
        if ($Description) {
            Write-TestLog "  Description: $Description" "DEBUG"
        }
        
        $result = & $TestScript
        
        if ($result -eq $true -or $result -eq $null) {
            $script:TestResults.PassedTests++
            Write-TestLog "  PASSED: $TestName" "SUCCESS"
            $status = "PASSED"
        } else {
            $script:TestResults.FailedTests++
            Write-TestLog "  FAILED: $TestName - $result" "ERROR"
            $status = "FAILED"
        }
    } catch {
        $script:TestResults.FailedTests++
        Write-TestLog "  FAILED: $TestName - $($_.Exception.Message)" "ERROR"
        $status = "FAILED"
        $result = $_.Exception.Message
    }
    
    $duration = (Get-Date) - $testStart
    $script:TestResults.TestDetails += @{
        Name = $TestName
        Status = $status
        Duration = $duration
        Result = $result
        Description = $Description
    }
}

Write-TestLog "========================================" "INFO"
Write-TestLog "Runspace Variable Scope Fixes Test Suite" "INFO"
Write-TestLog "========================================" "INFO"

# Test 1: Verify emoji replacements in logging
Test-Function -TestName "Fix1_EmojiReplacements" -Description "Verify ASCII emoji replacements in logging" -TestScript {
    try {
        # Import the logging module
        $loggingPath = Join-Path $PSScriptRoot "..\Modules\Utilities\EnhancedLogging.psm1"
        if (-not (Test-Path $loggingPath)) {
            throw "EnhancedLogging module not found at: $loggingPath"
        }
        
        Import-Module $loggingPath -Force
        
        # Test the emoji function directly
        $testEmojis = @{
            "DEBUG" = "[>>]"
            "INFO" = "[i]"
            "SUCCESS" = "[OK]"
            "WARN" = "[!]"
            "ERROR" = "[X]"
            "CRITICAL" = "[!!]"
            "HEADER" = "[==]"
            "PROGRESS" = "[..]"
            "IMPORTANT" = "[*]"
        }
        
        foreach ($level in $testEmojis.Keys) {
            $emoji = Get-LogEmojiInternal -Level $level -ForContext $null
            if ($emoji -ne $testEmojis[$level]) {
                throw "Emoji mismatch for $level. Expected: $($testEmojis[$level]), Got: $emoji"
            }
        }
        
        Write-TestLog "    All emoji replacements verified" "DEBUG"
        return $true
    } catch {
        return $_.Exception.Message
    }
}

# Test 2: Verify DiscoveryResult class registration
Test-Function -TestName "Fix2_DiscoveryResultClass" -Description "Verify global DiscoveryResult class registration" -TestScript {
    try {
        # Run Set-SuiteEnvironment to register the class
        $envScript = Join-Path $PSScriptRoot "Set-SuiteEnvironment.ps1"
        if (-not (Test-Path $envScript)) {
            throw "Set-SuiteEnvironment.ps1 not found"
        }
        
        & $envScript -CompanyName $CompanyName
        
        # Verify the class is available
        if (-not ([System.Management.Automation.PSTypeName]'DiscoveryResult').Type) {
            throw "DiscoveryResult class not registered"
        }
        
        # Test creating an instance
        $testResult = [DiscoveryResult]::new("TestModule")
        if ($testResult.ModuleName -ne "TestModule") {
            throw "DiscoveryResult instance creation failed"
        }
        
        # Test methods
        $testResult.AddError("Test error", $null)
        if ($testResult.Errors.Count -ne 1) {
            throw "AddError method failed"
        }
        
        $testResult.AddWarning("Test warning")
        if ($testResult.Warnings.Count -ne 1) {
            throw "AddWarning method failed"
        }
        
        $testResult.Complete()
        if ($null -eq $testResult.EndTime) {
            throw "Complete method failed"
        }
        
        Write-TestLog "    DiscoveryResult class fully functional" "DEBUG"
        return $true
    } catch {
        return $_.Exception.Message
    }
}

# Test 3: Verify module loading sequence
Test-Function -TestName "Fix3_ModuleLoadingSequence" -Description "Verify dependency-ordered module loading" -TestScript {
    try {
        # Check if the orchestrator has the enhanced module loading
        $orchestratorPath = Join-Path $PSScriptRoot "..\Core\MandA-Orchestrator.ps1"
        if (-not (Test-Path $orchestratorPath)) {
            throw "MandA-Orchestrator.ps1 not found"
        }
        
        $orchestratorContent = Get-Content $orchestratorPath -Raw
        
        # Check for the new load order structure
        if ($orchestratorContent -notmatch 'loadOrder\s*=\s*@\(') {
            throw "Enhanced module loading sequence not found in orchestrator"
        }
        
        # Check for dependency order
        $expectedOrder = @("EnhancedLogging", "ErrorHandling", "ValidationHelpers", "CredentialManagement", "Authentication")
        foreach ($module in $expectedOrder) {
            if ($orchestratorContent -notmatch $module) {
                throw "Module $module not found in load order"
            }
        }
        
        Write-TestLog "    Module loading sequence verified" "DEBUG"
        return $true
    } catch {
        return $_.Exception.Message
    }
}

# Test 4: Verify runspace session state enhancements
Test-Function -TestName "Fix4_RunspaceSessionState" -Description "Verify enhanced runspace session state configuration" -TestScript {
    try {
        $orchestratorPath = Join-Path $PSScriptRoot "..\Core\MandA-Orchestrator.ps1"
        $orchestratorContent = Get-Content $orchestratorPath -Raw
        
        # Check for MandAContext variable addition
        if ($orchestratorContent -notmatch 'MandAContext.*Global M&A Context') {
            throw "MandAContext variable not added to session state"
        }
        
        # Check for pre-compiled functions
        if ($orchestratorContent -notmatch 'commonFunctions.*Write-ProgressStep') {
            throw "Pre-compiled functions not found in session state"
        }
        
        # Check for SessionStateFunctionEntry
        if ($orchestratorContent -notmatch 'SessionStateFunctionEntry') {
            throw "SessionStateFunctionEntry not implemented"
        }
        
        Write-TestLog "    Runspace session state enhancements verified" "DEBUG"
        return $true
    } catch {
        return $_.Exception.Message
    }
}

# Test 5: Verify enhanced error handling in discovery modules
Test-Function -TestName "Fix5_EnhancedErrorHandling" -Description "Verify fallback error handling in discovery modules" -TestScript {
    try {
        $azureDiscoveryPath = Join-Path $PSScriptRoot "..\Modules\Discovery\AzureDiscovery.psm1"
        if (-not (Test-Path $azureDiscoveryPath)) {
            throw "AzureDiscovery.psm1 not found"
        }
        
        $azureContent = Get-Content $azureDiscoveryPath -Raw
        
        # Check for DiscoveryResult availability check
        if ($azureContent -notmatch 'if \(-not \(\[System\.Management\.Automation\.PSTypeName\]') {
            throw "DiscoveryResult availability check not found"
        }
        
        # Check for fallback hashtable result
        if ($azureContent -notmatch 'Fallback to hashtable-based result') {
            throw "Fallback error handling not implemented"
        }
        
        Write-TestLog "    Enhanced error handling verified" "DEBUG"
        return $true
    } catch {
        return $_.Exception.Message
    }
}

# Test 6: Verify structured logging enhancements
Test-Function -TestName "Fix6_StructuredLogging" -Description "Verify structured logging with correlation IDs" -TestScript {
    try {
        $loggingPath = Join-Path $PSScriptRoot "..\Modules\Utilities\EnhancedLogging.psm1"
        $loggingContent = Get-Content $loggingPath -Raw
        
        # Check for StructuredLogging configuration
        if ($loggingContent -notmatch 'StructuredLogging.*=.*true') {
            throw "StructuredLogging configuration not found"
        }
        
        # Check for CorrelationId parameter
        if ($loggingContent -notmatch '\[string\]\$CorrelationId') {
            throw "CorrelationId parameter not added to Write-MandALog"
        }
        
        # Check for StructuredData parameter
        if ($loggingContent -notmatch '\[hashtable\]\$StructuredData') {
            throw "StructuredData parameter not added to Write-MandALog"
        }
        
        # Check for JSON logging implementation
        if ($loggingContent -notmatch 'ConvertTo-Json.*Compress') {
            throw "JSON structured logging not implemented"
        }
        
        Write-TestLog "    Structured logging enhancements verified" "DEBUG"
        return $true
    } catch {
        return $_.Exception.Message
    }
}

# Test 7: Integration test - Run a simple discovery with enhanced features
if (-not $SkipDiscoveryTest) {
    Test-Function -TestName "Integration_DiscoveryTest" -Description "Integration test with enhanced runspace features" -TestScript {
        try {
            # Ensure environment is set up
            if (-not $global:MandA -or -not $global:MandA.Initialized) {
                $envScript = Join-Path $PSScriptRoot "Set-SuiteEnvironment.ps1"
                & $envScript -CompanyName $CompanyName
            }
            
            # Test creating a DiscoveryResult with structured logging
            $testResult = [DiscoveryResult]::new("IntegrationTest")
            $testResult.AddError("Test integration error", $null, @{
                TestData = "Integration test context"
                Timestamp = Get-Date
            })
            
            # Test structured logging if available
            if (Get-Command Write-MandALog -ErrorAction SilentlyContinue) {
                Write-MandALog -Message "Integration test message" -Level "INFO" -Component "TestSuite" -CorrelationId "TEST-001" -StructuredData @{
                    TestType = "Integration"
                    Module = "RunspaceFixes"
                }
            }
            
            $testResult.Complete()
            
            if ($testResult.Success -eq $false -and $testResult.Errors.Count -eq 1) {
                Write-TestLog "    Integration test completed successfully" "DEBUG"
                return $true
            } else {
                throw "Integration test validation failed"
            }
        } catch {
            return $_.Exception.Message
        }
    }
}

# Generate test report
Write-TestLog "========================================" "INFO"
Write-TestLog "TEST RESULTS SUMMARY" "INFO"
Write-TestLog "========================================" "INFO"
Write-TestLog "Total Tests: $($script:TestResults.TotalTests)" "INFO"
Write-TestLog "Passed: $($script:TestResults.PassedTests)" "SUCCESS"
Write-TestLog "Failed: $($script:TestResults.FailedTests)" $(if ($script:TestResults.FailedTests -gt 0) { "ERROR" } else { "SUCCESS" })

if ($script:TestResults.FailedTests -gt 0) {
    Write-TestLog "FAILED TESTS:" "ERROR"
    foreach ($test in ($script:TestResults.TestDetails | Where-Object { $_.Status -eq "FAILED" })) {
        Write-TestLog "  - $($test.Name): $($test.Result)" "ERROR"
    }
}

# Export detailed results
$reportPath = Join-Path $PSScriptRoot "..\ValidationResults\RunspaceFixesTest_$(Get-Date -Format 'yyyyMMdd_HHmmss').json"
$script:TestResults | ConvertTo-Json -Depth 10 | Set-Content -Path $reportPath -Encoding UTF8
Write-TestLog "Detailed test report saved: $reportPath" "INFO"

# Return exit code
$exitCode = if ($script:TestResults.FailedTests -gt 0) { 1 } else { 0 }
Write-TestLog "Test suite completed. Exit code: $exitCode" "INFO"
exit $exitCode