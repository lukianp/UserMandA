# -*- coding: utf-8-bom -*-
#Requires -Version 5.1

<#
.SYNOPSIS
    Test script to validate the authentication context fixes implementation
.DESCRIPTION
    This script tests the enhanced authentication context injection and connection logic fixes
    implemented in the orchestrator and discovery modules.
.NOTES
    Version: 1.0.0
    Created: 2025-06-10
    Tests the fixes for:
    - Enhanced authentication context capture in orchestrator
    - Fixed discovery module connection logic (Azure and Exchange)
    - Proper module loading in runspaces
    - Improved error handling in discovery modules
#>

[CmdletBinding()]
param(
    [Parameter(Mandatory=$false)]
    [string]$TestCompany = "TestCorp",
    
    [Parameter(Mandatory=$false)]
    [switch]$TestAzureOnly,
    
    [Parameter(Mandatory=$false)]
    [switch]$TestExchangeOnly,
    
    [Parameter(Mandatory=$false)]
    [switch]$SkipActualDiscovery
)

# Initialize
$ErrorActionPreference = "Stop"
$script:TestResults = @{
    OrchestratorFixes = @{}
    AzureDiscoveryFixes = @{}
    ExchangeDiscoveryFixes = @{}
    ModuleLoadingFixes = @{}
    OverallSuccess = $true
}

function Write-TestLog {
    param(
        [string]$Message,
        [string]$Level = "INFO",
        [string]$Component = "AuthContextTest"
    )
    
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $color = switch ($Level) {
        "ERROR" { "Red" }
        "WARN" { "Yellow" }
        "SUCCESS" { "Green" }
        "DEBUG" { "Gray" }
        "HEADER" { "Cyan" }
        default { "White" }
    }
    
    $indicator = switch ($Level) {
        "ERROR" { "[!!]" }
        "WARN" { "[??]" }
        "SUCCESS" { "[OK]" }
        "DEBUG" { "[>>]" }
        "HEADER" { "[==]" }
        default { "[--]" }
    }
    
    Write-Host "$timestamp $indicator [$Level] [$Component] $Message" -ForegroundColor $color
}

function Test-OrchestratorAuthContextFixes {
    Write-TestLog -Message "Testing orchestrator authentication context fixes..." -Level "HEADER"
    
    try {
        # Test 1: Check if enhanced auth context capture is implemented
        $orchestratorPath = Join-Path $global:MandA.Paths.Core "MandA-Orchestrator.ps1"
        $orchestratorContent = Get-Content $orchestratorPath -Raw
        
        # Check for enhanced credential data capture
        if ($orchestratorContent -match "credentialData\s*=\s*@\{") {
            Write-TestLog -Message "✓ Enhanced credential data capture found" -Level "SUCCESS"
            $script:TestResults.OrchestratorFixes["CredentialCapture"] = $true
        } else {
            Write-TestLog -Message "✗ Enhanced credential data capture not found" -Level "ERROR"
            $script:TestResults.OrchestratorFixes["CredentialCapture"] = $false
            $script:TestResults.OverallSuccess = $false
        }
        
        # Check for proper Azure module loading
        if ($orchestratorContent -match "Az\.Accounts.*# Critical for Azure discovery") {
            Write-TestLog -Message "✓ Azure modules properly configured for runspace loading" -Level "SUCCESS"
            $script:TestResults.OrchestratorFixes["AzureModules"] = $true
        } else {
            Write-TestLog -Message "✗ Azure modules not properly configured" -Level "ERROR"
            $script:TestResults.OrchestratorFixes["AzureModules"] = $false
            $script:TestResults.OverallSuccess = $false
        }
        
        # Check for ClientId, ClientSecret, TenantId capture
        if ($orchestratorContent -match "ClientId\s*=\s*\$authContext\.ClientId" -and
            $orchestratorContent -match "ClientSecret\s*=\s*\$authContext\.ClientSecret" -and
            $orchestratorContent -match "TenantId\s*=\s*\$authContext\.TenantId") {
            Write-TestLog -Message "✓ All required credential fields are captured" -Level "SUCCESS"
            $script:TestResults.OrchestratorFixes["CredentialFields"] = $true
        } else {
            Write-TestLog -Message "✗ Not all credential fields are captured" -Level "ERROR"
            $script:TestResults.OrchestratorFixes["CredentialFields"] = $false
            $script:TestResults.OverallSuccess = $false
        }
        
    } catch {
        Write-TestLog -Message "Error testing orchestrator fixes: $_" -Level "ERROR"
        $script:TestResults.OrchestratorFixes["TestError"] = $_.Exception.Message
        $script:TestResults.OverallSuccess = $false
    }
}

function Test-AzureDiscoveryFixes {
    Write-TestLog -Message "Testing Azure discovery module fixes..." -Level "HEADER"
    
    try {
        $azureModulePath = Join-Path $global:MandA.Paths.Discovery "AzureDiscovery.psm1"
        $azureContent = Get-Content $azureModulePath -Raw
        
        # Test 1: Check for always disconnect first
        if ($azureContent -match "Disconnect-AzAccount.*-ErrorAction SilentlyContinue") {
            Write-TestLog -Message "✓ Always disconnect first logic implemented" -Level "SUCCESS"
            $script:TestResults.AzureDiscoveryFixes["AlwaysDisconnect"] = $true
        } else {
            Write-TestLog -Message "✗ Always disconnect first logic not found" -Level "ERROR"
            $script:TestResults.AzureDiscoveryFixes["AlwaysDisconnect"] = $false
            $script:TestResults.OverallSuccess = $false
        }
        
        # Test 1b: Check for proper RecordCount in Metadata
        if ($azureContent -match 'Metadata\["RecordCount"\].*# Orchestrator specifically looks for this') {
            Write-TestLog -Message "✓ RecordCount properly set in Metadata" -Level "SUCCESS"
            $script:TestResults.AzureDiscoveryFixes["RecordCountMetadata"] = $true
        } else {
            Write-TestLog -Message "✗ RecordCount not properly set in Metadata" -Level "ERROR"
            $script:TestResults.AzureDiscoveryFixes["RecordCountMetadata"] = $false
            $script:TestResults.OverallSuccess = $false
        }
        
        # Test 2: Check for proper Azure connection parameters
        if ($azureContent -match "ServicePrincipal\s*=\s*\$true" -and
            $azureContent -match "Tenant\s*=\s*\$authInfo\.TenantId") {
            Write-TestLog -Message "✓ Proper Azure connection parameters found" -Level "SUCCESS"
            $script:TestResults.AzureDiscoveryFixes["ConnectionParams"] = $true
        } else {
            Write-TestLog -Message "✗ Proper Azure connection parameters not found" -Level "ERROR"
            $script:TestResults.AzureDiscoveryFixes["ConnectionParams"] = $false
            $script:TestResults.OverallSuccess = $false
        }
        
        # Test 3: Check for enhanced error handling
        if ($azureContent -match "errorDetails\s*=\s*@\{" -and
            $azureContent -match "ConvertTo-Json.*-Compress") {
            Write-TestLog -Message "✓ Enhanced error handling implemented" -Level "SUCCESS"
            $script:TestResults.AzureDiscoveryFixes["ErrorHandling"] = $true
        } else {
            Write-TestLog -Message "✗ Enhanced error handling not found" -Level "ERROR"
            $script:TestResults.AzureDiscoveryFixes["ErrorHandling"] = $false
            $script:TestResults.OverallSuccess = $false
        }
        
        # Test 4: Check for connection verification
        if ($azureContent -match "Get-AzContext.*-ErrorAction Stop" -and
            $azureContent -match "No Azure context after connection") {
            Write-TestLog -Message "✓ Connection verification implemented" -Level "SUCCESS"
            $script:TestResults.AzureDiscoveryFixes["ConnectionVerification"] = $true
        } else {
            Write-TestLog -Message "✗ Connection verification not found" -Level "ERROR"
            $script:TestResults.AzureDiscoveryFixes["ConnectionVerification"] = $false
            $script:TestResults.OverallSuccess = $false
        }
        
    } catch {
        Write-TestLog -Message "Error testing Azure discovery fixes: $_" -Level "ERROR"
        $script:TestResults.AzureDiscoveryFixes["TestError"] = $_.Exception.Message
        $script:TestResults.OverallSuccess = $false
    }
}

function Test-ExchangeDiscoveryFixes {
    Write-TestLog -Message "Testing Exchange discovery module fixes..." -Level "HEADER"
    
    try {
        $exchangeModulePath = Join-Path $global:MandA.Paths.Discovery "ExchangeDiscovery.psm1"
        $exchangeContent = Get-Content $exchangeModulePath -Raw
        
        # Test 1: Check for removal of existing connection check
        if ($exchangeContent -notmatch "Using existing Graph session" -and
            $exchangeContent -match "Always disconnect first") {
            Write-TestLog -Message "✓ Existing connection check removed" -Level "SUCCESS"
            $script:TestResults.ExchangeDiscoveryFixes["NoExistingCheck"] = $true
        } else {
            Write-TestLog -Message "✗ Existing connection check still present or new logic not found" -Level "ERROR"
            $script:TestResults.ExchangeDiscoveryFixes["NoExistingCheck"] = $false
            $script:TestResults.OverallSuccess = $false
        }
        
        # Test 2: Check for always disconnect logic
        if ($exchangeContent -match "Disconnect-MgGraph.*-ErrorAction SilentlyContinue") {
            Write-TestLog -Message "✓ Always disconnect logic implemented" -Level "SUCCESS"
            $script:TestResults.ExchangeDiscoveryFixes["AlwaysDisconnect"] = $true
        } else {
            Write-TestLog -Message "✗ Always disconnect logic not found" -Level "ERROR"
            $script:TestResults.ExchangeDiscoveryFixes["AlwaysDisconnect"] = $false
            $script:TestResults.OverallSuccess = $false
        }
        
        # Test 2b: Check for proper RecordCount in Metadata
        if ($exchangeContent -match 'Metadata\["RecordCount"\].*# Orchestrator specifically looks for this') {
            Write-TestLog -Message "✓ RecordCount properly set in Metadata" -Level "SUCCESS"
            $script:TestResults.ExchangeDiscoveryFixes["RecordCountMetadata"] = $true
        } else {
            Write-TestLog -Message "✗ RecordCount not properly set in Metadata" -Level "ERROR"
            $script:TestResults.ExchangeDiscoveryFixes["RecordCountMetadata"] = $false
            $script:TestResults.OverallSuccess = $false
        }
        
        # Test 3: Check for proper credential creation
        if ($exchangeContent -match "New-Object System\.Management\.Automation\.PSCredential") {
            Write-TestLog -Message "✓ Proper credential creation found" -Level "SUCCESS"
            $script:TestResults.ExchangeDiscoveryFixes["CredentialCreation"] = $true
        } else {
            Write-TestLog -Message "✗ Proper credential creation not found" -Level "ERROR"
            $script:TestResults.ExchangeDiscoveryFixes["CredentialCreation"] = $false
            $script:TestResults.OverallSuccess = $false
        }
        
    } catch {
        Write-TestLog -Message "Error testing Exchange discovery fixes: $_" -Level "ERROR"
        $script:TestResults.ExchangeDiscoveryFixes["TestError"] = $_.Exception.Message
        $script:TestResults.OverallSuccess = $false
    }
}

function Test-ModuleAvailability {
    Write-TestLog -Message "Testing module availability for runspace loading..." -Level "HEADER"
    
    $criticalModules = @(
        "Az.Accounts",
        "Az.Resources", 
        "Az.Compute",
        "Microsoft.Graph.Authentication",
        "Microsoft.Graph.Users",
        "Microsoft.Graph.Groups"
    )
    
    foreach ($moduleName in $criticalModules) {
        try {
            $module = Get-Module -Name $moduleName -ListAvailable -ErrorAction SilentlyContinue
            if ($module) {
                Write-TestLog -Message "✓ Module available: $moduleName" -Level "SUCCESS"
                $script:TestResults.ModuleLoadingFixes[$moduleName] = $true
            } else {
                Write-TestLog -Message "⚠ Module not available: $moduleName" -Level "WARN"
                $script:TestResults.ModuleLoadingFixes[$moduleName] = $false
            }
        } catch {
            Write-TestLog -Message "✗ Error checking module $moduleName`: $_" -Level "ERROR"
            $script:TestResults.ModuleLoadingFixes[$moduleName] = "Error: $($_.Exception.Message)"
        }
    }
}

function Export-TestResults {
    Write-TestLog -Message "Exporting test results..." -Level "HEADER"
    
    $timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
    $resultsPath = Join-Path $global:MandA.Paths.LogOutput "AuthContextFixesTest_$timestamp.json"
    
    $testReport = @{
        Timestamp = Get-Date
        TestParameters = @{
            TestCompany = $TestCompany
            TestAzureOnly = $TestAzureOnly.IsPresent
            TestExchangeOnly = $TestExchangeOnly.IsPresent
            SkipActualDiscovery = $SkipActualDiscovery.IsPresent
        }
        Results = $script:TestResults
        Summary = @{
            OverallSuccess = $script:TestResults.OverallSuccess
            OrchestratorFixesCount = ($script:TestResults.OrchestratorFixes.Values | Where-Object { $_ -eq $true }).Count
            AzureFixesCount = ($script:TestResults.AzureDiscoveryFixes.Values | Where-Object { $_ -eq $true }).Count
            ExchangeFixesCount = ($script:TestResults.ExchangeDiscoveryFixes.Values | Where-Object { $_ -eq $true }).Count
            ModulesAvailable = ($script:TestResults.ModuleLoadingFixes.Values | Where-Object { $_ -eq $true }).Count
        }
    }
    
    $testReport | ConvertTo-Json -Depth 10 | Set-Content -Path $resultsPath -Encoding UTF8
    Write-TestLog -Message "Test results exported to: $resultsPath" -Level "SUCCESS"
    
    # Display summary
    Write-TestLog -Message "=== TEST SUMMARY ===" -Level "HEADER"
    Write-TestLog -Message "Overall Success: $($testReport.Summary.OverallSuccess)" -Level $(if ($testReport.Summary.OverallSuccess) { "SUCCESS" } else { "ERROR" })
    Write-TestLog -Message "Orchestrator Fixes: $($testReport.Summary.OrchestratorFixesCount)" -Level "INFO"
    Write-TestLog -Message "Azure Discovery Fixes: $($testReport.Summary.AzureFixesCount)" -Level "INFO"
    Write-TestLog -Message "Exchange Discovery Fixes: $($testReport.Summary.ExchangeFixesCount)" -Level "INFO"
    Write-TestLog -Message "Modules Available: $($testReport.Summary.ModulesAvailable)" -Level "INFO"
}

#===============================================================================
# MAIN EXECUTION
#===============================================================================

try {
    Write-TestLog -Message "Starting Authentication Context Fixes Test" -Level "HEADER"
    Write-TestLog -Message "Test Company: $TestCompany" -Level "INFO"
    
    # Verify global context
    if (-not $global:MandA -or -not $global:MandA.Initialized) {
        throw "Global M&A context not initialized. Run through QuickStart.ps1 first."
    }
    
    # Run tests
    Test-OrchestratorAuthContextFixes
    Test-AzureDiscoveryFixes
    Test-ExchangeDiscoveryFixes
    Test-ModuleAvailability
    
    # Export results
    Export-TestResults
    
    Write-TestLog -Message "Authentication context fixes test completed" -Level "SUCCESS"
    
    # Return appropriate exit code
    exit $(if ($script:TestResults.OverallSuccess) { 0 } else { 1 })
    
} catch {
    Write-TestLog -Message "FATAL ERROR: $_" -Level "ERROR"
    Write-TestLog -Message "Stack Trace: $($_.ScriptStackTrace)" -Level "ERROR"
    exit 99
}