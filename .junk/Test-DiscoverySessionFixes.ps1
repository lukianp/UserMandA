# -*- coding: utf-8-bom -*-
#Requires -Version 5.1

<#
.SYNOPSIS
    Test script to validate fixes for the M&A Discovery Suite timeout and module loading issues
.DESCRIPTION
    This script validates the fixes implemented for the "zedra" discovery session issues:
    - Timeout configuration changes
    - PowerShell module preloading
    - DataAggregation context validation
.NOTES
    Author: M&A Discovery Team
    Version: 1.0.0
    Created: 2025-06-09
#>

[CmdletBinding()]
param(
    [Parameter(Mandatory=$false)]
    [switch]$Detailed
)

# Initialize test results
$script:TestResults = @{
    TestsRun = 0
    TestsPassed = 0
    TestsFailed = 0
    Details = [System.Collections.ArrayList]::new()
}

function Write-TestLog {
    param(
        [string]$Message,
        [string]$Level = "INFO",
        [string]$TestName = ""
    )
    
    $color = switch ($Level) {
        "PASS" { "Green" }
        "FAIL" { "Red" }
        "WARN" { "Yellow" }
        "INFO" { "White" }
        "DEBUG" { "Gray" }
        default { "White" }
    }
    
    $timestamp = Get-Date -Format "HH:mm:ss"
    $prefix = if ($TestName) { "[$TestName] " } else { "" }
    Write-Host "[$timestamp] $prefix$Message" -ForegroundColor $color
}

function Add-TestResult {
    param(
        [string]$TestName,
        [string]$Status,
        [string]$Message,
        [string]$Details = ""
    )
    
    $script:TestResults.TestsRun++
    if ($Status -eq "PASS") {
        $script:TestResults.TestsPassed++
    } else {
        $script:TestResults.TestsFailed++
    }
    
    $null = $script:TestResults.Details.Add([PSCustomObject]@{
        TestName = $TestName
        Status = $Status
        Message = $Message
        Details = $Details
        Timestamp = Get-Date
    })
    
    Write-TestLog -Message $Message -Level $Status -TestName $TestName
}

function Test-TimeoutConfiguration {
    Write-TestLog -Message "Testing timeout configuration changes..." -Level "INFO"
    
    # Test 1: Check orchestrator timeout value
    try {
        $orchestratorPath = Join-Path $PSScriptRoot "..\Core\MandA-Orchestrator.ps1"
        if (Test-Path $orchestratorPath) {
            $content = Get-Content $orchestratorPath -Raw
            if ($content -match '\$stuckJobThreshold\s*=\s*3600') {
                Add-TestResult -TestName "Orchestrator Timeout" -Status "PASS" -Message "Timeout increased to 1 hour (3600 seconds)"
            } else {
                Add-TestResult -TestName "Orchestrator Timeout" -Status "FAIL" -Message "Timeout not updated in orchestrator"
            }
        } else {
            Add-TestResult -TestName "Orchestrator Timeout" -Status "FAIL" -Message "Orchestrator file not found"
        }
    } catch {
        Add-TestResult -TestName "Orchestrator Timeout" -Status "FAIL" -Message "Error checking orchestrator: $_"
    }
    
    # Test 2: Check configuration file timeout values
    try {
        $configPath = Join-Path $PSScriptRoot "..\Configuration\default-config.json"
        if (Test-Path $configPath) {
            $config = Get-Content $configPath -Raw | ConvertFrom-Json
            if ($config.environment.timeouts.moduleExecution -eq 3600) {
                Add-TestResult -TestName "Config Timeouts" -Status "PASS" -Message "Configuration timeouts updated to 1 hour"
            } else {
                Add-TestResult -TestName "Config Timeouts" -Status "FAIL" -Message "Configuration timeouts not updated"
            }
        } else {
            Add-TestResult -TestName "Config Timeouts" -Status "FAIL" -Message "Configuration file not found"
        }
    } catch {
        Add-TestResult -TestName "Config Timeouts" -Status "FAIL" -Message "Error checking configuration: $_"
    }
}

function Test-ModulePreloading {
    Write-TestLog -Message "Testing PowerShell module preloading..." -Level "INFO"
    
    try {
        $orchestratorPath = Join-Path $PSScriptRoot "..\Core\MandA-Orchestrator.ps1"
        if (Test-Path $orchestratorPath) {
            $content = Get-Content $orchestratorPath -Raw
            
            # Test for PowerShell modules preloading section
            if ($content -match 'powerShellModulesToLoad.*=.*@\(') {
                Add-TestResult -TestName "Module Preloading Section" -Status "PASS" -Message "PowerShell module preloading section found"
            } else {
                Add-TestResult -TestName "Module Preloading Section" -Status "FAIL" -Message "PowerShell module preloading section not found"
            }
            
            # Test for specific modules
            $requiredModules = @(
                "Microsoft.Graph.Authentication",
                "ExchangeOnlineManagement", 
                "ActiveDirectory",
                "Az.Accounts"
            )
            
            foreach ($module in $requiredModules) {
                if ($content -match [regex]::Escape($module)) {
                    Add-TestResult -TestName "Module: $module" -Status "PASS" -Message "$module found in preload list"
                } else {
                    Add-TestResult -TestName "Module: $module" -Status "FAIL" -Message "$module not found in preload list"
                }
            }
        } else {
            Add-TestResult -TestName "Module Preloading" -Status "FAIL" -Message "Orchestrator file not found"
        }
    } catch {
        Add-TestResult -TestName "Module Preloading" -Status "FAIL" -Message "Error checking module preloading: $_"
    }
}

function Test-DataAggregationFixes {
    Write-TestLog -Message "Testing DataAggregation context validation fixes..." -Level "INFO"
    
    try {
        $dataAggPath = Join-Path $PSScriptRoot "..\Modules\Processing\DataAggregation.psm1"
        if (Test-Path $dataAggPath) {
            $content = Get-Content $dataAggPath -Raw
            
            # Test for enhanced context validation
            if ($content -match 'contextPaths.*=.*if.*hashtable') {
                Add-TestResult -TestName "Context Validation" -Status "PASS" -Message "Enhanced context validation found"
            } else {
                Add-TestResult -TestName "Context Validation" -Status "FAIL" -Message "Enhanced context validation not found"
            }
            
            # Test for hashtable support
            if ($content -match 'Context.*is.*hashtable') {
                Add-TestResult -TestName "Hashtable Support" -Status "PASS" -Message "Hashtable context support found"
            } else {
                Add-TestResult -TestName "Hashtable Support" -Status "FAIL" -Message "Hashtable context support not found"
            }
            
            # Test for debugging improvements
            if ($content -match 'availableProps.*=') {
                Add-TestResult -TestName "Debug Logging" -Status "PASS" -Message "Enhanced debug logging found"
            } else {
                Add-TestResult -TestName "Debug Logging" -Status "FAIL" -Message "Enhanced debug logging not found"
            }
        } else {
            Add-TestResult -TestName "DataAggregation Fixes" -Status "FAIL" -Message "DataAggregation file not found"
        }
    } catch {
        Add-TestResult -TestName "DataAggregation Fixes" -Status "FAIL" -Message "Error checking DataAggregation: $_"
    }
}

function Test-GraphModuleStatus {
    Write-TestLog -Message "Testing Graph module status..." -Level "INFO"
    
    try {
        $graphPath = Join-Path $PSScriptRoot "..\Modules\Discovery\GraphDiscovery.psm1"
        if (Test-Path $graphPath) {
            $content = Get-Content $graphPath -Raw
            
            # Test for proper function definitions
            if ($content -match 'function Invoke-GraphDiscovery') {
                Add-TestResult -TestName "Graph Function" -Status "PASS" -Message "Invoke-GraphDiscovery function found"
            } else {
                Add-TestResult -TestName "Graph Function" -Status "FAIL" -Message "Invoke-GraphDiscovery function not found"
            }
            
            # Test for connection testing
            if ($content -match 'Test-GraphConnection') {
                Add-TestResult -TestName "Graph Connection Test" -Status "PASS" -Message "Graph connection testing found"
            } else {
                Add-TestResult -TestName "Graph Connection Test" -Status "FAIL" -Message "Graph connection testing not found"
            }
            
            # Test for error handling
            if ($content -match 'DiscoveryResult.*new.*Graph') {
                Add-TestResult -TestName "Graph Error Handling" -Status "PASS" -Message "Proper DiscoveryResult usage found"
            } else {
                Add-TestResult -TestName "Graph Error Handling" -Status "FAIL" -Message "Proper DiscoveryResult usage not found"
            }
        } else {
            Add-TestResult -TestName "Graph Module" -Status "FAIL" -Message "Graph module file not found"
        }
    } catch {
        Add-TestResult -TestName "Graph Module" -Status "FAIL" -Message "Error checking Graph module: $_"
    }
}

function Test-ModuleAvailability {
    Write-TestLog -Message "Testing PowerShell module availability..." -Level "INFO"
    
    $criticalModules = @(
        @{Name="Microsoft.Graph.Authentication"; Required=$true},
        @{Name="Microsoft.Graph.Users"; Required=$true},
        @{Name="ExchangeOnlineManagement"; Required=$false},
        @{Name="ActiveDirectory"; Required=$false},
        @{Name="Az.Accounts"; Required=$false}
    )
    
    foreach ($moduleInfo in $criticalModules) {
        try {
            $module = Get-Module -Name $moduleInfo.Name -ListAvailable -ErrorAction SilentlyContinue
            if ($module) {
                Add-TestResult -TestName "Module Available: $($moduleInfo.Name)" -Status "PASS" -Message "$($moduleInfo.Name) is available (Version: $($module[0].Version))"
            } else {
                $status = if ($moduleInfo.Required) { "FAIL" } else { "WARN" }
                Add-TestResult -TestName "Module Available: $($moduleInfo.Name)" -Status $status -Message "$($moduleInfo.Name) is not available"
            }
        } catch {
            Add-TestResult -TestName "Module Available: $($moduleInfo.Name)" -Status "FAIL" -Message "Error checking $($moduleInfo.Name): $_"
        }
    }
}

function Test-ConfigurationIntegrity {
    Write-TestLog -Message "Testing configuration file integrity..." -Level "INFO"
    
    try {
        $configPath = Join-Path $PSScriptRoot "..\Configuration\default-config.json"
        if (Test-Path $configPath) {
            $config = Get-Content $configPath -Raw | ConvertFrom-Json
            
            # Test SharePoint configuration
            if ($config.discovery.sharepoint.tenantName -eq "zedra") {
                Add-TestResult -TestName "SharePoint Config" -Status "PASS" -Message "SharePoint tenant name configured as 'zedra'"
            } else {
                Add-TestResult -TestName "SharePoint Config" -Status "WARN" -Message "SharePoint tenant name: $($config.discovery.sharepoint.tenantName)"
            }
            
            # Test enabled sources
            $enabledSources = $config.discovery.enabledSources
            $expectedSources = @("Graph", "Teams", "Exchange", "EnvironmentDetection")
            $foundSources = 0
            
            foreach ($source in $expectedSources) {
                if ($source -in $enabledSources) {
                    $foundSources++
                }
            }
            
            if ($foundSources -eq $expectedSources.Count) {
                Add-TestResult -TestName "Enabled Sources" -Status "PASS" -Message "All expected sources are enabled"
            } else {
                Add-TestResult -TestName "Enabled Sources" -Status "WARN" -Message "$foundSources/$($expectedSources.Count) expected sources enabled"
            }
        } else {
            Add-TestResult -TestName "Configuration File" -Status "FAIL" -Message "Configuration file not found"
        }
    } catch {
        Add-TestResult -TestName "Configuration File" -Status "FAIL" -Message "Error reading configuration: $_"
    }
}

# Main execution
Write-TestLog -Message "Starting M&A Discovery Suite Fixes Validation" -Level "INFO"
Write-TestLog -Message "=========================================" -Level "INFO"

# Run all tests
Test-TimeoutConfiguration
Test-ModulePreloading
Test-DataAggregationFixes
Test-GraphModuleStatus
Test-ModuleAvailability
Test-ConfigurationIntegrity

# Summary
Write-TestLog -Message "=========================================" -Level "INFO"
Write-TestLog -Message "Test Summary:" -Level "INFO"
Write-TestLog -Message "Tests Run: $($script:TestResults.TestsRun)" -Level "INFO"
Write-TestLog -Message "Tests Passed: $($script:TestResults.TestsPassed)" -Level "PASS"
Write-TestLog -Message "Tests Failed: $($script:TestResults.TestsFailed)" -Level $(if ($script:TestResults.TestsFailed -gt 0) { "FAIL" } else { "PASS" })

if ($Detailed) {
    Write-TestLog -Message "`nDetailed Results:" -Level "INFO"
    foreach ($result in $script:TestResults.Details) {
        Write-TestLog -Message "$($result.TestName): $($result.Status) - $($result.Message)" -Level $result.Status
    }
}

# Export results
$resultsPath = Join-Path $PSScriptRoot "..\ValidationResults\DiscoveryFixesTest_$(Get-Date -Format 'yyyyMMdd_HHmmss').json"
$script:TestResults | ConvertTo-Json -Depth 10 | Set-Content -Path $resultsPath -Encoding UTF8
Write-TestLog -Message "Results exported to: $resultsPath" -Level "INFO"

# Return exit code
$exitCode = if ($script:TestResults.TestsFailed -gt 0) { 1 } else { 0 }
Write-TestLog -Message "Exit Code: $exitCode" -Level "INFO"

if ($script:TestResults.TestsFailed -eq 0) {
    Write-TestLog -Message "`n✅ All fixes appear to be implemented correctly!" -Level "PASS"
    Write-TestLog -Message "Ready to test with: .\QuickStart.ps1 -CompanyName 'zedra' -Force" -Level "INFO"
} else {
    Write-TestLog -Message "`n❌ Some issues found. Please review the failed tests above." -Level "FAIL"
}

exit $exitCode