# -*- coding: utf-8-bom -*-
#Requires -Version 5.1

<#
.SYNOPSIS
    Tests the integration between the orchestrator and discovery modules
.DESCRIPTION
    This script creates a shell of the orchestrator functionality to test that:
    - Discovery modules can be loaded and called
    - Modules return proper DiscoveryResult objects
    - Data flows correctly from modules back to orchestrator
    - Error handling works as expected
.NOTES
    Author: M&A Discovery Team
    Version: 1.0.0
    Created: 2025-06-09
#>

[CmdletBinding()]
param(
    [Parameter(Mandatory=$false)]
    [string[]]$ModulesToTest = @("Azure", "Graph", "ActiveDirectory"),
    
    [Parameter(Mandatory=$false)]
    [switch]$SkipAuthentication,
    
    [Parameter(Mandatory=$false)]
    [switch]$DetailedOutput
)

# Initialize test environment
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
        "DEBUG" { "Gray" }
        "HEADER" { "Cyan" }
        default { "White" }
    }
    
    $timestamp = Get-Date -Format "HH:mm:ss"
    Write-Host "[$timestamp] [$Level] $Message" -ForegroundColor $color
}

function Add-TestResult {
    param(
        [string]$TestName,
        [bool]$Passed,
        [string]$Details = "",
        [object]$Data = $null
    )
    
    $script:TestResults.TotalTests++
    if ($Passed) {
        $script:TestResults.PassedTests++
        Write-TestLog "✓ $TestName" -Level "SUCCESS"
    } else {
        $script:TestResults.FailedTests++
        Write-TestLog "✗ $TestName" -Level "ERROR"
    }
    
    $script:TestResults.TestDetails += [PSCustomObject]@{
        TestName = $TestName
        Passed = $Passed
        Details = $Details
        Data = $Data
        Timestamp = Get-Date
    }
    
    if ($DetailedOutput -and $Details) {
        Write-TestLog "  Details: $Details" -Level "DEBUG"
    }
}

function Test-GlobalContext {
    Write-TestLog "Testing global M and A context..." -Level "HEADER"
    
    try {
        # Test if global context exists
        if (-not $global:MandA) {
            Add-TestResult "Global MandA Context Exists" $false "Global MandA variable not found"
            return $false
        }
        Add-TestResult "Global MandA Context Exists" $true
        
        # Test required properties
        $requiredProps = @("Initialized", "Paths", "Config")
        foreach ($prop in $requiredProps) {
            if (-not $global:MandA.ContainsKey($prop)) {
                Add-TestResult "Global Context Property: $prop" $false "Property missing"
                return $false
            }
            Add-TestResult "Global Context Property: $prop" $true
        }
        
        # Test paths
        $requiredPaths = @("Discovery", "RawDataOutput", "ProcessedDataOutput")
        foreach ($pathKey in $requiredPaths) {
            if (-not $global:MandA.Paths.ContainsKey($pathKey)) {
                Add-TestResult "Required Path: $pathKey" $false "Path not configured"
                return $false
            }
            Add-TestResult "Required Path: $pathKey" $true
        }
        
        return $true
    } catch {
        Add-TestResult "Global Context Test" $false $_.Exception.Message
        return $false
    }
}

function Test-DiscoveryResultClass {
    Write-TestLog "Testing DiscoveryResult class availability..." -Level "HEADER"
    
    try {
        # Check if DiscoveryResult class is available
        if (-not ([System.Management.Automation.PSTypeName]'DiscoveryResult').Type) {
            Add-TestResult "DiscoveryResult Class Available" $false "Class not found in current session"
            
            # Try to define it
            Write-TestLog "Attempting to define DiscoveryResult class..." -Level "INFO"
            Add-Type -TypeDefinition @'
public class DiscoveryResult {
    public bool Success { get; set; }
    public string ModuleName { get; set; }
    public object Data { get; set; }
    public System.Collections.ArrayList Errors { get; set; }
    public System.Collections.ArrayList Warnings { get; set; }
    public System.Collections.Hashtable Metadata { get; set; }
    public System.DateTime StartTime { get; set; }
    public System.DateTime EndTime { get; set; }
    public string ExecutionId { get; set; }
    
    public DiscoveryResult(string moduleName) {
        this.ModuleName = moduleName;
        this.Errors = new System.Collections.ArrayList();
        this.Warnings = new System.Collections.ArrayList();
        this.Metadata = new System.Collections.Hashtable();
        this.StartTime = System.DateTime.Now;
        this.ExecutionId = System.Guid.NewGuid().ToString();
        this.Success = true;
    }
    
    public void AddError(string message, System.Exception exception, System.Collections.Hashtable context) {
        var errorEntry = new System.Collections.Hashtable();
        errorEntry["Timestamp"] = System.DateTime.Now;
        errorEntry["Message"] = message;
        errorEntry["Exception"] = exception?.ToString();
        errorEntry["Context"] = context ?? new System.Collections.Hashtable();
        this.Errors.Add(errorEntry);
        this.Success = false;
    }
    
    public void Complete() {
        this.EndTime = System.DateTime.Now;
        if (this.StartTime != null && this.EndTime != null) {
            var duration = this.EndTime - this.StartTime;
            this.Metadata["Duration"] = duration;
        }
    }
}
'@ -Language CSharp
            Add-TestResult "DiscoveryResult Class Definition" $true "Class defined successfully"
        } else {
            Add-TestResult "DiscoveryResult Class Available" $true
        }
        
        # Test creating an instance
        $testResult = [DiscoveryResult]::new("TestModule")
        if ($testResult -and $testResult.ModuleName -eq "TestModule") {
            Add-TestResult "DiscoveryResult Instance Creation" $true
            return $true
        } else {
            Add-TestResult "DiscoveryResult Instance Creation" $false "Failed to create valid instance"
            return $false
        }
    } catch {
        Add-TestResult "DiscoveryResult Class Test" $false $_.Exception.Message
        return $false
    }
}

function Test-ModuleAvailability {
    param([string[]]$Modules)
    
    Write-TestLog "Testing discovery module availability..." -Level "HEADER"
    
    $availableModules = @()
    
    foreach ($moduleName in $Modules) {
        try {
            $modulePath = Join-Path $global:MandA.Paths.Discovery "${moduleName}Discovery.psm1"
            
            if (Test-Path $modulePath) {
                Add-TestResult "Module File Exists: $moduleName" $true $modulePath
                
                # Test syntax
                try {
                    $null = [System.Management.Automation.PSParser]::Tokenize((Get-Content $modulePath -Raw), [ref]$null)
                    Add-TestResult "Module Syntax Valid: $moduleName" $true
                } catch {
                    Add-TestResult "Module Syntax Valid: $moduleName" $false $_.Exception.Message
                    continue
                }
                
                # Test import
                try {
                    Import-Module $modulePath -Force -ErrorAction Stop
                    Add-TestResult "Module Import: $moduleName" $true
                    
                    # Test function availability
                    $functionName = "Invoke-${moduleName}Discovery"
                    if (Get-Command $functionName -ErrorAction SilentlyContinue) {
                        Add-TestResult "Discovery Function Available: $functionName" $true
                        $availableModules += $moduleName
                    } else {
                        Add-TestResult "Discovery Function Available: $functionName" $false "Function not found after import"
                    }
                } catch {
                    Add-TestResult "Module Import: $moduleName" $false $_.Exception.Message
                }
            } else {
                Add-TestResult "Module File Exists: $moduleName" $false "File not found: $modulePath"
            }
        } catch {
            Add-TestResult "Module Test: $moduleName" $false $_.Exception.Message
        }
    }
    
    return $availableModules
}

function Test-ModuleExecution {
    param(
        [string]$ModuleName,
        [hashtable]$Configuration
    )
    
    Write-TestLog "Testing module execution: $ModuleName..." -Level "HEADER"
    
    try {
        $functionName = "Invoke-${ModuleName}Discovery"
        
        # Create test parameters
        $testParams = @{
            Configuration = $Configuration
        }
        
        # Add Context parameter if the function supports it
        $functionInfo = Get-Command $functionName -ErrorAction SilentlyContinue
        if ($functionInfo -and $functionInfo.Parameters.ContainsKey('Context')) {
            $testParams['Context'] = $global:MandA
        }
        
        Write-TestLog "Executing $functionName with test parameters..." -Level "INFO"
        
        # Execute with timeout
        $job = Start-Job -ScriptBlock {
            param($FunctionName, $Params, $ModulePath)
            
            try {
                Import-Module $ModulePath -Force
                & $FunctionName @Params
            } catch {
                throw $_
            }
        } -ArgumentList $functionName, $testParams, (Join-Path $global:MandA.Paths.Discovery "${ModuleName}Discovery.psm1")
        
        # Wait for completion with timeout
        $timeout = 30 # seconds
        $completed = Wait-Job $job -Timeout $timeout
        
        if ($completed) {
            $result = Receive-Job $job
            Remove-Job $job
            
            # Validate result
            if ($result) {
                Add-TestResult "Module Execution: $ModuleName" $true "Function executed successfully"
                
                # Test result structure
                if ($result -is [DiscoveryResult]) {
                    Add-TestResult "Result Type: $ModuleName" $true "Returned DiscoveryResult object"
                    
                    # Test required properties
                    $requiredProps = @("Success", "ModuleName", "Errors", "Warnings", "Metadata")
                    foreach ($prop in $requiredProps) {
                        if ($result.PSObject.Properties.Name -contains $prop) {
                            Add-TestResult "Result Property ${prop}: $ModuleName" $true
                        } else {
                            Add-TestResult "Result Property ${prop}: $ModuleName" $false "Property missing"
                        }
                    }
                    
                    # Test module name matches
                    if ($result.ModuleName -eq $ModuleName) {
                        Add-TestResult "Module Name Match: $ModuleName" $true
                    } else {
                        Add-TestResult "Module Name Match: $ModuleName" $false "Expected: $ModuleName, Got: $($result.ModuleName)"
                    }
                    
                    return $result
                } else {
                    Add-TestResult "Result Type: $ModuleName" $false "Did not return DiscoveryResult object. Type: $($result.GetType().FullName)"
                    return $result
                }
            } else {
                Add-TestResult "Module Execution: $ModuleName" $false "Function returned null"
                return $null
            }
        } else {
            Remove-Job $job -Force
            Add-TestResult "Module Execution: $ModuleName" $false "Function timed out after $timeout seconds"
            return $null
        }
    } catch {
        Add-TestResult "Module Execution: $ModuleName" $false $_.Exception.Message
        return $null
    }
}

function Test-DataFlow {
    param(
        [object]$ModuleResult,
        [string]$ModuleName
    )
    
    Write-TestLog "Testing data flow for: $ModuleName..." -Level "HEADER"
    
    try {
        if (-not $ModuleResult) {
            Add-TestResult "Data Flow: $ModuleName" $false "No result to test"
            return $false
        }
        
        # Test if result can be serialized (important for orchestrator)
        try {
            $serialized = $ModuleResult | ConvertTo-Json -Depth 3 -ErrorAction Stop
            Add-TestResult "Result Serialization: $ModuleName" $true
        } catch {
            Add-TestResult "Result Serialization: $ModuleName" $false $_.Exception.Message
        }
        
        # Test if result has data
        if ($ModuleResult -is [DiscoveryResult]) {
            if ($ModuleResult.Data -or $ModuleResult.Metadata.Count -gt 0) {
                Add-TestResult "Data Presence: $ModuleName" $true "Result contains data or metadata"
            } else {
                Add-TestResult "Data Presence: $ModuleName" $false "Result contains no data or metadata"
            }
            
            # Test error handling
            if ($ModuleResult.Success -eq $false -and $ModuleResult.Errors.Count -gt 0) {
                Add-TestResult "Error Handling: $ModuleName" $true "Errors properly captured"
            } elseif ($ModuleResult.Success -eq $true) {
                Add-TestResult "Error Handling: $ModuleName" $true "Successful execution"
            } else {
                Add-TestResult "Error Handling: $ModuleName" $false "Failed execution but no errors captured"
            }
        }
        
        return $true
    } catch {
        Add-TestResult "Data Flow Test: $ModuleName" $false $_.Exception.Message
        return $false
    }
}

function Show-TestSummary {
    Write-TestLog "========================================" -Level "HEADER"
    Write-TestLog "ORCHESTRATOR-MODULE INTEGRATION TEST SUMMARY" -Level "HEADER"
    Write-TestLog "========================================" -Level "HEADER"
    
    $passRate = if ($script:TestResults.TotalTests -gt 0) {
        [Math]::Round(($script:TestResults.PassedTests / $script:TestResults.TotalTests) * 100, 1)
    } else { 0 }
    
    Write-TestLog "Total Tests: $($script:TestResults.TotalTests)" -Level "INFO"
    Write-TestLog "Passed: $($script:TestResults.PassedTests)" -Level "SUCCESS"
    Write-TestLog "Failed: $($script:TestResults.FailedTests)" -Level $(if ($script:TestResults.FailedTests -gt 0) { "ERROR" } else { "SUCCESS" })
    Write-TestLog "Pass Rate: $passRate%" -Level $(if ($passRate -ge 80) { "SUCCESS" } elseif ($passRate -ge 60) { "WARN" } else { "ERROR" })
    
    if ($script:TestResults.FailedTests -gt 0) {
        Write-TestLog "" -Level "INFO"
        Write-TestLog "FAILED TESTS:" -Level "ERROR"
        $failedTests = $script:TestResults.TestDetails | Where-Object { -not $_.Passed }
        foreach ($test in $failedTests) {
            Write-TestLog "  - $($test.TestName): $($test.Details)" -Level "ERROR"
        }
    }
    
    # Export detailed results
    $reportPath = ".\ValidationResults\OrchestratorModuleIntegrationTest_$(Get-Date -Format 'yyyyMMdd_HHmmss').json"
    if (-not (Test-Path (Split-Path $reportPath))) {
        New-Item -Path (Split-Path $reportPath) -ItemType Directory -Force | Out-Null
    }
    
    $script:TestResults | ConvertTo-Json -Depth 10 | Set-Content -Path $reportPath -Encoding UTF8
    Write-TestLog "Detailed results exported to: $reportPath" -Level "INFO"
    
    return $passRate
}

# Main execution
try {
    Write-TestLog "Starting Orchestrator-Module Integration Tests..." -Level "HEADER"
    Write-TestLog "Modules to test: $($ModulesToTest -join ', ')" -Level "INFO"
    
    # Test 1: Global Context
    $contextOk = Test-GlobalContext
    if (-not $contextOk) {
        Write-TestLog "Global context test failed. Cannot continue." -Level "ERROR"
        exit 1
    }
    
    # Test 2: DiscoveryResult Class
    $classOk = Test-DiscoveryResultClass
    if (-not $classOk) {
        Write-TestLog "DiscoveryResult class test failed. Cannot continue." -Level "ERROR"
        exit 1
    }
    
    # Test 3: Module Availability
    $availableModules = Test-ModuleAvailability -Modules $ModulesToTest
    if ($availableModules.Count -eq 0) {
        Write-TestLog "No modules available for testing." -Level "ERROR"
        exit 1
    }
    
    # Test 4: Module Execution and Data Flow
    $testConfig = @{
        discovery = @{
            enabledSources = $availableModules
            maxConcurrentJobs = 1
        }
    }
    
    foreach ($moduleName in $availableModules) {
        if (-not $SkipAuthentication -or $moduleName -notin @("Azure", "Graph", "Exchange")) {
            $result = Test-ModuleExecution -ModuleName $moduleName -Configuration $testConfig
            Test-DataFlow -ModuleResult $result -ModuleName $moduleName
        } else {
            Write-TestLog "Skipping $moduleName (authentication required)" -Level "WARN"
        }
    }
    
    # Show summary
    $passRate = Show-TestSummary
    
    # Exit with appropriate code
    if ($passRate -ge 80) {
        Write-TestLog "Integration tests PASSED" -Level "SUCCESS"
        exit 0
    } elseif ($passRate -ge 60) {
        Write-TestLog "Integration tests PARTIALLY PASSED" -Level "WARN"
        exit 1
    } else {
        Write-TestLog "Integration tests FAILED" -Level "ERROR"
        exit 2
    }
    
} catch {
    Write-TestLog "FATAL ERROR: $($_.Exception.Message)" -Level "ERROR"
    Write-TestLog "Stack Trace: $($_.ScriptStackTrace)" -Level "ERROR"
    exit 99
}