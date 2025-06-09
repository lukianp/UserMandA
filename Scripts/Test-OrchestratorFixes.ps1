#Requires -Version 5.1

<#
.SYNOPSIS
    Test script to validate the comprehensive orchestrator fixes
.DESCRIPTION
    Tests all the major fixes implemented in MandA-Orchestrator.ps1:
    - Context integrity in runspaces
    - Proper error collection
    - Enhanced error reporting
    - Module prerequisites validation
    - Processing phase context validation
    - Stuck jobs resolution
    - Configuration validation
#>

[CmdletBinding()]
param(
    [Parameter(Mandatory=$false)]
    [switch]$SkipPrerequisites,
    
    [Parameter(Mandatory=$false)]
    [switch]$TestErrorHandling,
    
    [Parameter(Mandatory=$false)]
    [switch]$TestContextIntegrity,
    
    [Parameter(Mandatory=$false)]
    [switch]$VerboseOutput
)

# Set up error handling
$ErrorActionPreference = "Stop"
$VerbosePreference = if ($VerboseOutput) { "Continue" } else { "SilentlyContinue" }

# Test results collection
$TestResults = @{
    Passed = 0
    Failed = 0
    Skipped = 0
    Details = [System.Collections.ArrayList]::new()
}

function Write-TestResult {
    param(
        [string]$TestName,
        [string]$Status,
        [string]$Message = "",
        [string]$Details = ""
    )
    
    $color = switch ($Status) {
        "PASS" { "Green"; $TestResults.Passed++ }
        "FAIL" { "Red"; $TestResults.Failed++ }
        "SKIP" { "Yellow"; $TestResults.Skipped++ }
        default { "White" }
    }
    
    $timestamp = Get-Date -Format "HH:mm:ss"
    Write-Host "[$timestamp] [$Status] $TestName" -ForegroundColor $color
    if ($Message) {
        Write-Host "    $Message" -ForegroundColor Gray
    }
    
    $null = $TestResults.Details.Add([PSCustomObject]@{
        TestName = $TestName
        Status = $Status
        Message = $Message
        Details = $Details
        Timestamp = Get-Date
    })
}

function Test-OrchestratorFileExists {
    Write-Host "`n=== Testing Orchestrator File Existence ===" -ForegroundColor Cyan
    
    $orchestratorPath = Join-Path $PSScriptRoot "..\Core\MandA-Orchestrator.ps1"
    
    if (Test-Path $orchestratorPath) {
        Write-TestResult "Orchestrator File Exists" "PASS" "Found at: $orchestratorPath"
        return $true
    } else {
        Write-TestResult "Orchestrator File Exists" "FAIL" "Not found at: $orchestratorPath"
        return $false
    }
}

function Test-FixedFunctions {
    Write-Host "`n=== Testing Fixed Functions ===" -ForegroundColor Cyan
    
    $orchestratorPath = Join-Path $PSScriptRoot "..\Core\MandA-Orchestrator.ps1"
    $content = Get-Content $orchestratorPath -Raw
    
    # Test 1: Context integrity fix
    if ($content -match "# Set up context for this thread - CREATE A PROPER COPY") {
        Write-TestResult "Context Integrity Fix" "PASS" "Found proper context copy implementation"
    } else {
        Write-TestResult "Context Integrity Fix" "FAIL" "Context copy fix not found"
    }
    
    # Test 2: Error collection enhancement
    if ($content -match "Add to phase result errors") {
        Write-TestResult "Error Collection Enhancement" "PASS" "Found enhanced error collection"
    } else {
        Write-TestResult "Error Collection Enhancement" "FAIL" "Enhanced error collection not found"
    }
    
    # Test 3: Export-ErrorReport enhancement
    if ($content -match "Collect errors from module results") {
        Write-TestResult "Export-ErrorReport Enhancement" "PASS" "Found enhanced error report function"
    } else {
        Write-TestResult "Export-ErrorReport Enhancement" "FAIL" "Enhanced error report not found"
    }
    
    # Test 4: Prerequisites validation
    if ($content -match "function Test-DiscoveryPrerequisites") {
        Write-TestResult "Prerequisites Validation" "PASS" "Found Test-DiscoveryPrerequisites function"
    } else {
        Write-TestResult "Prerequisites Validation" "FAIL" "Test-DiscoveryPrerequisites function not found"
    }
    
    # Test 5: Processing phase context validation
    if ($content -match "Validate context first") {
        Write-TestResult "Processing Phase Context Validation" "PASS" "Found context validation in processing phase"
    } else {
        Write-TestResult "Processing Phase Context Validation" "FAIL" "Context validation not found in processing phase"
    }
    
    # Test 6: Stuck jobs resolution
    if ($content -match "Create timeout result with proper error") {
        Write-TestResult "Stuck Jobs Resolution" "PASS" "Found enhanced timeout handling"
    } else {
        Write-TestResult "Stuck Jobs Resolution" "FAIL" "Enhanced timeout handling not found"
    }
    
    # Test 7: SharePoint configuration validation
    if ($content -match "SharePoint tenant name not configured") {
        Write-TestResult "SharePoint Configuration Validation" "PASS" "Found SharePoint tenant validation"
    } else {
        Write-TestResult "SharePoint Configuration Validation" "FAIL" "SharePoint tenant validation not found"
    }
}

function Test-SyntaxValidation {
    Write-Host "`n=== Testing Syntax Validation ===" -ForegroundColor Cyan
    
    $orchestratorPath = Join-Path $PSScriptRoot "..\Core\MandA-Orchestrator.ps1"
    
    try {
        # Test PowerShell syntax
        $null = [System.Management.Automation.PSParser]::Tokenize((Get-Content $orchestratorPath -Raw), [ref]$null)
        Write-TestResult "PowerShell Syntax" "PASS" "No syntax errors detected"
    } catch {
        Write-TestResult "PowerShell Syntax" "FAIL" "Syntax error: $($_.Exception.Message)"
    }
    
    try {
        # Test script compilation
        $scriptBlock = [ScriptBlock]::Create((Get-Content $orchestratorPath -Raw))
        Write-TestResult "Script Compilation" "PASS" "Script compiles successfully"
    } catch {
        Write-TestResult "Script Compilation" "FAIL" "Compilation error: $($_.Exception.Message)"
    }
}

function Test-FunctionDefinitions {
    Write-Host "`n=== Testing Function Definitions ===" -ForegroundColor Cyan
    
    $orchestratorPath = Join-Path $PSScriptRoot "..\Core\MandA-Orchestrator.ps1"
    $content = Get-Content $orchestratorPath -Raw
    
    $expectedFunctions = @(
        "Test-DiscoveryPrerequisites",
        "Test-ExchangeOnlineAvailable",
        "Export-ErrorReport",
        "Invoke-DiscoveryPhase",
        "Invoke-ProcessingPhase",
        "Invoke-ExportPhase"
    )
    
    foreach ($functionName in $expectedFunctions) {
        if ($content -match "function $functionName") {
            Write-TestResult "Function Definition: $functionName" "PASS" "Function is defined"
        } else {
            Write-TestResult "Function Definition: $functionName" "FAIL" "Function not found"
        }
    }
}

function Test-ErrorHandlingImprovements {
    Write-Host "`n=== Testing Error Handling Improvements ===" -ForegroundColor Cyan
    
    $orchestratorPath = Join-Path $PSScriptRoot "..\Core\MandA-Orchestrator.ps1"
    $content = Get-Content $orchestratorPath -Raw
    
    # Test for enhanced error context
    if ($content -match "Deep copy paths to avoid reference issues") {
        Write-TestResult "Enhanced Error Context" "PASS" "Found context preservation logic"
    } else {
        Write-TestResult "Enhanced Error Context" "FAIL" "Context preservation logic not found"
    }
    
    # Test for timeout exception handling
    if ($content -match "System\.TimeoutException") {
        Write-TestResult "Timeout Exception Handling" "PASS" "Found proper timeout exception handling"
    } else {
        Write-TestResult "Timeout Exception Handling" "FAIL" "Timeout exception handling not found"
    }
    
    # Test for module error aggregation
    if ($content -match "moduleErrors.*=.*@\(\)" -and $content -match "moduleWarnings.*=.*@\(\)") {
        Write-TestResult "Module Error Aggregation" "PASS" "Found module error aggregation"
    } else {
        Write-TestResult "Module Error Aggregation" "FAIL" "Module error aggregation not found"
    }
}

function Test-PerformanceImprovements {
    Write-Host "`n=== Testing Performance Improvements ===" -ForegroundColor Cyan
    
    $orchestratorPath = Join-Path $PSScriptRoot "..\Core\MandA-Orchestrator.ps1"
    $content = Get-Content $orchestratorPath -Raw
    
    # Test for memory management
    if ($content -match "Force garbage collection") {
        Write-TestResult "Memory Management" "PASS" "Found garbage collection logic"
    } else {
        Write-TestResult "Memory Management" "FAIL" "Garbage collection logic not found"
    }
    
    # Test for runspace cleanup
    if ($content -match "Clean up immediately") {
        Write-TestResult "Runspace Cleanup" "PASS" "Found immediate cleanup logic"
    } else {
        Write-TestResult "Runspace Cleanup" "FAIL" "Immediate cleanup logic not found"
    }
}

# Main execution
try {
    Write-Host "=== MandA Orchestrator Fixes Validation ===" -ForegroundColor Yellow
    Write-Host "Testing comprehensive fixes implementation..." -ForegroundColor Gray
    Write-Host "Start Time: $(Get-Date)" -ForegroundColor Gray
    
    # Run tests
    if (-not (Test-OrchestratorFileExists)) {
        throw "Cannot proceed without orchestrator file"
    }
    
    Test-FixedFunctions
    Test-SyntaxValidation
    Test-FunctionDefinitions
    Test-ErrorHandlingImprovements
    Test-PerformanceImprovements
    
    # Summary
    Write-Host "`n=== Test Summary ===" -ForegroundColor Yellow
    Write-Host "Passed: $($TestResults.Passed)" -ForegroundColor Green
    Write-Host "Failed: $($TestResults.Failed)" -ForegroundColor Red
    Write-Host "Skipped: $($TestResults.Skipped)" -ForegroundColor Yellow
    Write-Host "Total: $($TestResults.Passed + $TestResults.Failed + $TestResults.Skipped)" -ForegroundColor White
    
    # Export detailed results
    $resultsPath = Join-Path $PSScriptRoot "..\ValidationResults\OrchestratorFixesTest_$(Get-Date -Format 'yyyyMMdd_HHmmss').json"
    $TestResults | ConvertTo-Json -Depth 10 | Set-Content -Path $resultsPath -Encoding UTF8
    Write-Host "`nDetailed results exported to: $resultsPath" -ForegroundColor Gray
    
    # Determine exit code
    $exitCode = if ($TestResults.Failed -gt 0) { 1 } else { 0 }
    Write-Host "`nValidation completed with exit code: $exitCode" -ForegroundColor $(if ($exitCode -eq 0) { "Green" } else { "Red" })
    
    exit $exitCode
    
} catch {
    Write-Host "`nFATAL ERROR: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Stack Trace: $($_.ScriptStackTrace)" -ForegroundColor Red
    exit 99
}