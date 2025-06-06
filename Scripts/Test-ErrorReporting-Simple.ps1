# -*- coding: utf-8-bom -*-
#Requires -Version 5.1

# Author: Lukian Poleschtschuk
# Version: 1.0.0
# Created: 2025-06-06
# Last Modified: 2025-06-06
# Change Log: Updated version control header

<#
.SYNOPSIS
    Simple test for the comprehensive error reporting functionality of the M&A Discovery Suite.
.DESCRIPTION
    This script demonstrates the error reporting capabilities using simple hashtable structures
    instead of the DiscoveryResult class to avoid dependency issues.
.NOTES
    Version: 1.0.0
    Author: M&A Discovery Suite Team
    Date: 2025-06-06
#>

[CmdletBinding()]
param(
    [Parameter(Mandatory=$false)]
    [string]$OutputPath = ".\TestErrorReports"
)

# Set error action preference
$ErrorActionPreference = "Stop"

# Define Get-OrElse function if not available
if (-not (Get-Command global:Get-OrElse -ErrorAction SilentlyContinue)) {
    function global:Get-OrElse {
        param($Value, $Default)
        if ($null -ne $Value) { return $Value } else { return $Default }
    }
    Write-Host "[Test-ErrorReporting] Function 'global:Get-OrElse' has been defined." -ForegroundColor DarkGreen
}

# Add HashtableContains method if not available
$testHashtableInstance = @{}
if (-not ($testHashtableInstance.PSObject.Methods.Name -contains 'HashtableContains')) {
    try {
        Update-TypeData -TypeName System.Collections.Hashtable -MemberName HashtableContains -MemberType ScriptMethod -Value { 
            param([string]$KeyToTest) 
            return $this.ContainsKey($KeyToTest) 
        } -Force -ErrorAction Stop
        Write-Host "[Test-ErrorReporting] Successfully added 'HashtableContains' method to System.Collections.Hashtable." -ForegroundColor DarkGreen
    } catch {
        Write-Warning "[Test-ErrorReporting] Error adding 'HashtableContains' method to Hashtable: $($_.Exception.Message)"
    }
}

# Import required modules
$scriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$moduleRoot = Join-Path (Split-Path -Parent $scriptRoot) "Modules"

try {
    # Import utility modules
    Import-Module (Join-Path $moduleRoot "Utilities\EnhancedLogging.psm1") -Force
    Import-Module (Join-Path $moduleRoot "Utilities\ErrorReporting.psm1") -Force
    
    Write-Host "[Test-ErrorReporting] Required modules imported successfully" -ForegroundColor Green
} catch {
    Write-Error "Failed to import required modules: $($_.Exception.Message)"
    exit 1
}

function Initialize-TestEnvironment {
    Write-Host "[Test-ErrorReporting] Initializing test environment..." -ForegroundColor Cyan
    
    # Create test context
    $global:TestContext = [PSCustomObject]@{
        Config = @{
            environment = @{
                logging = @{
                    useEmojis = $true
                    useColors = $true
                    showTimestamp = $true
                    showComponent = $true
                    maxLogSizeMB = 50
                    logRetentionDays = 30
                }
                logLevel = "DEBUG"
            }
            metadata = @{
                companyName = "TestCompany"
                version = "1.0.0"
            }
        }
        Paths = @{
            LogOutput = $OutputPath
            SuiteRoot = Split-Path -Parent $scriptRoot
        }
        CompanyName = "TestCompany"
    }
    
    # Initialize logging
    Initialize-Logging -Context $global:TestContext
    
    # Ensure output directory exists
    if (-not (Test-Path $OutputPath)) {
        New-Item -Path $OutputPath -ItemType Directory -Force | Out-Null
        Write-MandALog -Message "Created test output directory: $OutputPath" -Level "INFO" -Component "TestSetup" -Context $global:TestContext
    }
    
    Write-MandALog -Message "Test environment initialized successfully" -Level "SUCCESS" -Component "TestSetup" -Context $global:TestContext
}

function New-TestPhaseResult {
    Write-MandALog -Message "Creating test phase result with hashtable structures" -Level "DEBUG" -Component "TestData" -Context $global:TestContext
    
    # Create mock module results using hashtables instead of DiscoveryResult class
    $moduleResults = @{}
    
    # Successful module
    $moduleResults["ActiveDirectory"] = @{
        Success = $true
        ModuleName = "ActiveDirectory"
        StartTime = (Get-Date).AddMinutes(-5)
        EndTime = Get-Date
        Duration = 300
        ExecutionId = [guid]::NewGuid().ToString()
        ErrorCount = 0
        WarningCount = 1
        Errors = @()
        Warnings = @(
            @{
                Timestamp = Get-Date
                Message = "Minor configuration issue detected"
                Context = @{ Setting = "PasswordPolicy" }
            }
        )
        Data = @{ UserCount = 150; GroupCount = 25 }
        Metadata = @{ Duration = 300 }
    }
    
    # Failed module with errors
    $moduleResults["Graph"] = @{
        Success = $false
        ModuleName = "Graph"
        StartTime = (Get-Date).AddMinutes(-3)
        EndTime = Get-Date
        Duration = 180
        ExecutionId = [guid]::NewGuid().ToString()
        ErrorCount = 2
        WarningCount = 1
        Errors = @(
            @{
                Timestamp = Get-Date
                Message = "Authentication failed"
                Exception = "System.UnauthorizedAccessException: Access token expired"
                ExceptionType = "System.UnauthorizedAccessException"
                Context = @{ 
                    TenantId = "test-tenant-id"
                    Endpoint = "https://graph.microsoft.com/v1.0/users"
                }
            },
            @{
                Timestamp = Get-Date
                Message = "Network timeout"
                Exception = "System.TimeoutException: Request timed out after 30 seconds"
                ExceptionType = "System.TimeoutException"
                Context = @{
                    Endpoint = "https://graph.microsoft.com/v1.0/groups"
                    TimeoutSeconds = 30
                }
            }
        )
        Warnings = @(
            @{
                Timestamp = Get-Date
                Message = "Rate limiting detected"
                Context = @{ RetryAfter = 60 }
            }
        )
        Data = $null
        Metadata = @{ Duration = 180 }
    }
    
    # Create phase result
    $phaseResult = @{
        Success = $false  # Overall failure due to critical errors
        Phase = "TestDiscovery"
        ModuleResults = $moduleResults
        CriticalErrors = @(
            @{
                Source = "Authentication"
                Message = "Failed to authenticate with Azure AD"
                Impact = "Cannot access cloud resources"
                Timestamp = Get-Date
                Errors = @(
                    @{
                        Message = "Invalid client secret"
                        Exception = "System.UnauthorizedAccessException"
                        Context = @{ ClientId = "test-client-id" }
                    }
                )
            }
        )
        RecoverableErrors = @(
            @{
                Source = "NetworkConnectivity"
                Message = "Intermittent network connectivity issues"
                Details = "Connection timeouts to some endpoints"
                Timestamp = Get-Date
            }
        )
        Warnings = @(
            @{
                Source = "Performance"
                Message = "Discovery taking longer than expected"
                Details = "Consider reducing scope or increasing timeout values"
                Timestamp = Get-Date
            }
        )
        StartTime = (Get-Date).AddMinutes(-15)
        EndTime = Get-Date
    }
    
    Write-MandALog -Message "Test phase result created with $($moduleResults.Count) modules" -Level "DEBUG" -Component "TestData" -Context $global:TestContext
    
    return $phaseResult
}

function Test-BasicErrorReporting {
    Write-MandALog -Message "Testing basic error report generation..." -Level "INFO" -Component "ErrorReportTest" -Context $global:TestContext
    
    try {
        # Create test data
        $phaseResult = New-TestPhaseResult
        
        # Test basic error report export
        $result = Export-ErrorReport -PhaseResult $phaseResult -OutputPath $OutputPath -ReportName "BasicErrorReport" -Context $global:TestContext
        
        if ($result.Success) {
            Write-MandALog -Message "Error report generated successfully. Files: $($result.ExportedFiles.Count)" -Level "SUCCESS" -Component "ErrorReportTest" -Context $global:TestContext
            
            # Verify files exist
            foreach ($file in $result.ExportedFiles) {
                if (Test-Path $file) {
                    $fileSize = (Get-Item $file).Length
                    Write-MandALog -Message "Verified file: $(Split-Path $file -Leaf) ($fileSize bytes)" -Level "DEBUG" -Component "ErrorReportTest" -Context $global:TestContext
                } else {
                    throw "Expected file not found: $file"
                }
            }
            
            return $true
        } else {
            throw "Error report generation failed"
        }
        
    } catch {
        Write-MandALog -Message "Error report generation test failed: $($_.Exception.Message)" -Level "ERROR" -Component "ErrorReportTest" -Context $global:TestContext
        return $false
    }
}

function Show-TestResults {
    param(
        [Parameter(Mandatory=$true)]
        [hashtable]$TestResults
    )
    
    Write-MandALog -Message "Test Results Summary" -Level "HEADER" -Component "TestSummary" -Context $global:TestContext
    
    $totalTests = $TestResults.Count
    $passedTests = ($TestResults.Values | Where-Object { $_ -eq $true }).Count
    $failedTests = $totalTests - $passedTests
    $successRate = if ($totalTests -gt 0) { [math]::Round(($passedTests / $totalTests) * 100, 2) } else { 0 }
    
    Write-MandALog -Message "Total Tests: $totalTests" -Level "INFO" -Component "TestSummary" -Context $global:TestContext
    Write-MandALog -Message "Passed: $passedTests" -Level "SUCCESS" -Component "TestSummary" -Context $global:TestContext
    Write-MandALog -Message "Failed: $failedTests" -Level $(if ($failedTests -gt 0) { "ERROR" } else { "SUCCESS" }) -Component "TestSummary" -Context $global:TestContext
    Write-MandALog -Message "Success Rate: $successRate%" -Level $(if ($successRate -ge 100) { "SUCCESS" } elseif ($successRate -ge 80) { "WARN" } else { "ERROR" }) -Component "TestSummary" -Context $global:TestContext
    
    Write-MandALog -Message "Individual Test Results:" -Level "INFO" -Component "TestSummary" -Context $global:TestContext
    foreach ($testName in $TestResults.Keys) {
        $result = $TestResults[$testName]
        $status = if ($result) { "PASS" } else { "FAIL" }
        $level = if ($result) { "SUCCESS" } else { "ERROR" }
        Write-MandALog -Message "  $testName : $status" -Level $level -Component "TestSummary" -Context $global:TestContext
    }
    
    if ($failedTests -eq 0) {
        Write-MandALog -Message "All error reporting tests completed successfully!" -Level "SUCCESS" -Component "TestSummary" -Context $global:TestContext
    } else {
        Write-MandALog -Message "Some tests failed. Please review the error messages above." -Level "WARN" -Component "TestSummary" -Context $global:TestContext
    }
    
    # Show output directory
    if (Test-Path $OutputPath) {
        $files = Get-ChildItem -Path $OutputPath -File | Measure-Object
        Write-MandALog -Message "Test output files generated: $($files.Count) files in $OutputPath" -Level "INFO" -Component "TestSummary" -Context $global:TestContext
    }
}

# Main execution
try {
    Write-Host "`n=== M&A Discovery Suite - Error Reporting Test (Simple) ===" -ForegroundColor Cyan
    Write-Host "Testing comprehensive error reporting functionality`n" -ForegroundColor Gray
    
    # Initialize test environment
    Initialize-TestEnvironment
    
    # Run tests
    $testResults = @{}
    
    Write-MandALog -Message "Starting error reporting tests..." -Level "HEADER" -Component "TestRunner" -Context $global:TestContext
    
    $testResults["BasicErrorReporting"] = Test-BasicErrorReporting
    
    # Show results
    Show-TestResults -TestResults $testResults
    
    # Final status
    $overallSuccess = ($testResults.Values | Where-Object { $_ -eq $false }).Count -eq 0
    
    if ($overallSuccess) {
        Write-Host "`n[SUCCESS] All error reporting tests passed successfully!" -ForegroundColor Green
        Write-Host "[INFO] Check the output directory for generated reports: $OutputPath" -ForegroundColor Cyan
        exit 0
    } else {
        Write-Host "`n[FAILED] Some error reporting tests failed. Check the logs for details." -ForegroundColor Red
        exit 1
    }
    
} catch {
    Write-Error "Test execution failed: $($_.Exception.Message)"
    Write-Error "Stack trace: $($_.ScriptStackTrace)"
    exit 1
}