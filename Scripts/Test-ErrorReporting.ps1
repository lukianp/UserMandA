# -*- coding: utf-8-bom -*-
#Requires -Version 5.1

# Author: Lukian Poleschtschuk
# Version: 1.0.0
# Created: 2025-06-06
# Last Modified: 2025-06-06
# Change Log: Updated version control header

<#
.SYNOPSIS
    Tests the comprehensive error reporting functionality of the M&A Discovery Suite.
.DESCRIPTION
    This script demonstrates and tests the error reporting capabilities including
    error report generation, export formats, and integration with existing modules.
.NOTES
    Version: 1.0.0
    Author: M&A Discovery Suite Team
    Date: 2025-06-06
    
    This script tests:
    - Error report generation from phase results
    - Multiple export formats (JSON, CSV, HTML)
    - Error analysis and recommendations
    - Integration with existing error handling infrastructure
#>

[CmdletBinding()]
param(
    [Parameter(Mandatory=$false)]
    [string]$OutputPath = ".\TestReports",
    
    [Parameter(Mandatory=$false)]
    [switch]$SkipSetup,
    
    [Parameter(Mandatory=$false)]
    [switch]$DetailedOutput
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
    Import-Module (Join-Path $moduleRoot "Utilities\ErrorHandling.psm1") -Force
    Import-Module (Join-Path $moduleRoot "Utilities\EnhancedLogging.psm1") -Force
    Import-Module (Join-Path $moduleRoot "Utilities\ErrorReporting.psm1") -Force
    
    Write-Host "[Test-ErrorReporting] Required modules imported successfully" -ForegroundColor Green
} catch {
    Write-Error "Failed to import required modules: $($_.Exception.Message)"
    exit 1
}

function Initialize-TestEnvironment {
    <#
    .SYNOPSIS
        Initializes the test environment for error reporting tests.
    #>
    [CmdletBinding()]
    param()
    
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
    <#
    .SYNOPSIS
        Creates a mock phase result for testing error reporting.
    #>
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$false)]
        [string]$PhaseName = "TestDiscovery",
        
        [Parameter(Mandatory=$false)]
        [bool]$IncludeErrors = $true,
        
        [Parameter(Mandatory=$false)]
        [bool]$IncludeWarnings = $true
    )
    
    Write-MandALog -Message "Creating test phase result for: $PhaseName" -Level "DEBUG" -Component "TestData" -Context $global:TestContext
    
    # Create mock module results
    $moduleResults = @{}
    
    # Successful module
    $successModule = [DiscoveryResult]::new("ActiveDirectory")
    $successModule.Data = @{ UserCount = 150; GroupCount = 25 }
    $successModule.AddWarning("Minor configuration issue detected", @{ Setting = "PasswordPolicy" })
    $successModule.Complete()
    $moduleResults["ActiveDirectory"] = $successModule
    
    # Failed module with errors
    $failedModule = [DiscoveryResult]::new("Graph")
    $failedModule.AddError("Authentication failed", [System.UnauthorizedAccessException]::new("Access token expired"), @{ 
        TenantId = "test-tenant-id"
        Endpoint = "https://graph.microsoft.com/v1.0/users"
    })
    $failedModule.AddError("Network timeout", [System.TimeoutException]::new("Request timed out after 30 seconds"), @{
        Endpoint = "https://graph.microsoft.com/v1.0/groups"
        TimeoutSeconds = 30
    })
    $failedModule.AddWarning("Rate limiting detected", @{ RetryAfter = 60 })
    $failedModule.Complete()
    $moduleResults["Graph"] = $failedModule
    
    # Partially successful module
    $partialModule = [DiscoveryResult]::new("Exchange")
    $partialModule.Data = @{ MailboxCount = 75 }
    $partialModule.AddError("Permission denied for shared mailboxes", [System.UnauthorizedAccessException]::new("Insufficient permissions"), @{
        RequiredRole = "Exchange Administrator"
        CurrentPermissions = @("Mail.Read")
    })
    $partialModule.AddWarning("Some mailboxes skipped due to size", @{ SkippedCount = 5; Reason = "Mailbox size > 50GB" })
    $partialModule.Complete()
    $moduleResults["Exchange"] = $partialModule
    
    # Another successful module
    $anotherSuccessModule = [DiscoveryResult]::new("SharePoint")
    $anotherSuccessModule.Data = @{ SiteCount = 12; DocumentCount = 5000 }
    $anotherSuccessModule.Complete()
    $moduleResults["SharePoint"] = $anotherSuccessModule
    
    # Create phase result
    $phaseResult = @{
        Success = $false  # Overall failure due to critical errors
        Phase = $PhaseName
        ModuleResults = $moduleResults
        CriticalErrors = @()
        RecoverableErrors = @()
        Warnings = @()
        StartTime = (Get-Date).AddMinutes(-15)
        EndTime = Get-Date
    }
    
    if ($IncludeErrors) {
        # Add critical errors
        $phaseResult.CriticalErrors += @{
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
        
        # Add recoverable errors
        $phaseResult.RecoverableErrors += @{
            Source = "NetworkConnectivity"
            Message = "Intermittent network connectivity issues"
            Details = "Connection timeouts to some endpoints"
            Timestamp = Get-Date
        }
        
        $phaseResult.RecoverableErrors += @{
            Source = "Configuration"
            Message = "Missing optional configuration settings"
            Details = "Using default values for non-critical settings"
            Timestamp = Get-Date
        }
    }
    
    if ($IncludeWarnings) {
        # Add warnings
        $phaseResult.Warnings += @{
            Source = "Performance"
            Message = "Discovery taking longer than expected"
            Details = "Consider reducing scope or increasing timeout values"
            Timestamp = Get-Date
        }
        
        $phaseResult.Warnings += @{
            Source = "DataQuality"
            Message = "Some user accounts have incomplete information"
            Details = "Missing department or manager information for 15% of users"
            Timestamp = Get-Date
        }
    }
    
    Write-MandALog -Message "Test phase result created with $($moduleResults.Count) modules" -Level "DEBUG" -Component "TestData" -Context $global:TestContext
    
    return $phaseResult
}

function Test-ErrorReportGeneration {
    <#
    .SYNOPSIS
        Tests the basic error report generation functionality.
    #>
    [CmdletBinding()]
    param()
    
    Write-MandALog -Message "Testing error report generation..." -Level "INFO" -Component "ErrorReportTest" -Context $global:TestContext
    
    try {
        # Create test data
        $phaseResult = New-TestPhaseResult -PhaseName "TestDiscovery" -IncludeErrors $true -IncludeWarnings $true
        
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

function Test-PhaseSpecificReporting {
    <#
    .SYNOPSIS
        Tests phase-specific error reporting functionality.
    #>
    [CmdletBinding()]
    param()
    
    Write-MandALog -Message "Testing phase-specific error reporting..." -Level "INFO" -Component "PhaseReportTest" -Context $global:TestContext
    
    try {
        # Test different phases
        $phases = @("Discovery", "Processing", "Export")
        $allSuccessful = $true
        
        foreach ($phase in $phases) {
            Write-MandALog -Message "Testing phase: $phase" -Level "DEBUG" -Component "PhaseReportTest" -Context $global:TestContext
            
            $phaseResult = New-TestPhaseResult -PhaseName $phase -IncludeErrors $true -IncludeWarnings $true
            $result = Export-PhaseErrorReport -PhaseName $phase -PhaseResult $phaseResult -Context $global:TestContext
            
            if (-not $result.Success) {
                Write-MandALog -Message "Phase-specific reporting failed for: $phase" -Level "ERROR" -Component "PhaseReportTest" -Context $global:TestContext
                $allSuccessful = $false
            } else {
                Write-MandALog -Message "Phase-specific report generated for: $phase" -Level "SUCCESS" -Component "PhaseReportTest" -Context $global:TestContext
            }
        }
        
        return $allSuccessful
        
    } catch {
        Write-MandALog -Message "Phase-specific reporting test failed: $($_.Exception.Message)" -Level "ERROR" -Component "PhaseReportTest" -Context $global:TestContext
        return $false
    }
}

function Test-ErrorAnalysis {
    <#
    .SYNOPSIS
        Tests the error analysis and recommendation functionality.
    #>
    [CmdletBinding()]
    param()
    
    Write-MandALog -Message "Testing error analysis functionality..." -Level "INFO" -Component "AnalysisTest" -Context $global:TestContext
    
    try {
        # Create test data with specific error patterns
        $phaseResult = New-TestPhaseResult -PhaseName "AnalysisTest" -IncludeErrors $true -IncludeWarnings $true
        
        # Test error statistics
        $stats = Get-ErrorStatistics -PhaseResult $phaseResult -Context $global:TestContext
        
        if ($stats -and $stats.Summary) {
            Write-MandALog -Message "Error statistics calculated. Success rate: $($stats.Summary.SuccessRate)%" -Level "SUCCESS" -Component "AnalysisTest" -Context $global:TestContext
            Write-MandALog -Message "Total issues: $($stats.Summary.TotalIssues)" -Level "DEBUG" -Component "AnalysisTest" -Context $global:TestContext
        } else {
            throw "Failed to calculate error statistics"
        }
        
        # Test error analysis export
        $analysisResult = Export-ErrorAnalysis -PhaseResult $phaseResult -OutputPath $OutputPath -Context $global:TestContext
        
        if ($analysisResult.Success) {
            Write-MandALog -Message "Error analysis exported successfully" -Level "SUCCESS" -Component "AnalysisTest" -Context $global:TestContext
            
            # Verify analysis files
            if ((Test-Path $analysisResult.AnalysisPath) -and (Test-Path $analysisResult.RecommendationsPath)) {
                Write-MandALog -Message "Analysis files verified" -Level "DEBUG" -Component "AnalysisTest" -Context $global:TestContext
            } else {
                throw "Analysis files not found"
            }
        } else {
            throw "Error analysis export failed"
        }
        
        # Test quick summary
        $summary = New-ErrorSummaryReport -PhaseResult $phaseResult -Context $global:TestContext
        
        if ($summary -and $summary.Summary) {
            Write-MandALog -Message "Quick summary generated. Failed modules: $($summary.FailedModules.Count)" -Level "SUCCESS" -Component "AnalysisTest" -Context $global:TestContext
        } else {
            throw "Failed to generate quick summary"
        }
        
        return $true
        
    } catch {
        Write-MandALog -Message "Error analysis test failed: $($_.Exception.Message)" -Level "ERROR" -Component "AnalysisTest" -Context $global:TestContext
        return $false
    }
}

function Test-ExportFormats {
    <#
    .SYNOPSIS
        Tests different export formats (JSON, CSV, HTML).
    #>
    [CmdletBinding()]
    param()
    
    Write-MandALog -Message "Testing export formats..." -Level "INFO" -Component "FormatTest" -Context $global:TestContext
    
    try {
        $phaseResult = New-TestPhaseResult -PhaseName "FormatTest" -IncludeErrors $true -IncludeWarnings $true
        $allFormatsSuccessful = $true
        
        # Test individual formats
        $formats = @("JSON", "CSV", "HTML")
        
        foreach ($format in $formats) {
            Write-MandALog -Message "Testing format: $format" -Level "DEBUG" -Component "FormatTest" -Context $global:TestContext
            
            $result = Export-ErrorReport -PhaseResult $phaseResult -OutputPath $OutputPath -ReportName "FormatTest_$format" -ExportFormats @($format) -Context $global:TestContext
            
            if ($result.Success) {
                $formatFile = $result.ExportedFiles | Where-Object { $_ -like "*.$($format.ToLower())" }
                if ($formatFile -and (Test-Path $formatFile)) {
                    $fileSize = (Get-Item $formatFile).Length
                    Write-MandALog -Message "$format export successful ($fileSize bytes)" -Level "SUCCESS" -Component "FormatTest" -Context $global:TestContext
                } else {
                    Write-MandALog -Message "$format file not found or invalid" -Level "ERROR" -Component "FormatTest" -Context $global:TestContext
                    $allFormatsSuccessful = $false
                }
            } else {
                Write-MandALog -Message "$format export failed" -Level "ERROR" -Component "FormatTest" -Context $global:TestContext
                $allFormatsSuccessful = $false
            }
        }
        
        return $allFormatsSuccessful
        
    } catch {
        Write-MandALog -Message "Export format test failed: $($_.Exception.Message)" -Level "ERROR" -Component "FormatTest" -Context $global:TestContext
        return $false
    }
}

function Test-ErrorContextIntegration {
    <#
    .SYNOPSIS
        Tests integration with existing error context functionality.
    #>
    [CmdletBinding()]
    param()
    
    Write-MandALog -Message "Testing error context integration..." -Level "INFO" -Component "ContextTest" -Context $global:TestContext
    
    try {
        # Create an enhanced error with context
        $testException = [System.InvalidOperationException]::new("Test exception for context integration")
        $errorRecord = [System.Management.Automation.ErrorRecord]::new(
            $testException,
            "TestError",
            [System.Management.Automation.ErrorCategory]::InvalidOperation,
            $null
        )
        
        # Add enhanced context
        $enhancedContext = Add-ErrorContext -ErrorRecord $errorRecord -Context @{
            TestOperation = "ErrorContextIntegration"
            TestModule = "ErrorReporting"
            TestPhase = "Integration"
        } -LoggingContext $global:TestContext
        
        if ($enhancedContext -and $enhancedContext.ExecutionId) {
            Write-MandALog -Message "Enhanced error context created (ID: $($enhancedContext.ExecutionId))" -Level "SUCCESS" -Component "ContextTest" -Context $global:TestContext
            
            # Export the enhanced context
            $contextPath = Export-ErrorContext -EnhancedError $enhancedContext -OutputPath $OutputPath -LoggingContext $global:TestContext
            
            if ($contextPath -and (Test-Path $contextPath)) {
                Write-MandALog -Message "Error context exported successfully" -Level "SUCCESS" -Component "ContextTest" -Context $global:TestContext
                return $true
            } else {
                throw "Error context export failed"
            }
        } else {
            throw "Failed to create enhanced error context"
        }
        
    } catch {
        Write-MandALog -Message "Error context integration test failed: $($_.Exception.Message)" -Level "ERROR" -Component "ContextTest" -Context $global:TestContext
        return $false
    }
}

function Show-TestResults {
    <#
    .SYNOPSIS
        Displays a summary of all test results.
    #>
    [CmdletBinding()]
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
        Write-MandALog -Message "  $testName`: $status" -Level $level -Component "TestSummary" -Context $global:TestContext
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
    Write-Host "`n=== M&A Discovery Suite - Error Reporting Test ===" -ForegroundColor Cyan
    Write-Host "Testing comprehensive error reporting functionality`n" -ForegroundColor Gray
    
    # Initialize test environment
    if (-not $SkipSetup) {
        Initialize-TestEnvironment
    }
    
    # Run tests
    $testResults = @{}
    
    Write-MandALog -Message "Starting error reporting tests..." -Level "HEADER" -Component "TestRunner" -Context $global:TestContext
    
    $testResults["BasicErrorReporting"] = Test-ErrorReportGeneration
    $testResults["PhaseSpecificReporting"] = Test-PhaseSpecificReporting
    $testResults["ErrorAnalysis"] = Test-ErrorAnalysis
    $testResults["ExportFormats"] = Test-ExportFormats
    $testResults["ErrorContextIntegration"] = Test-ErrorContextIntegration
    
    # Show results
    Show-TestResults -TestResults $testResults
    
    # Final status
    $overallSuccess = ($testResults.Values | Where-Object { $_ -eq $false }).Count -eq 0
    
    if ($overallSuccess) {
        Write-Host "`nâœ… All error reporting tests passed successfully!" -ForegroundColor Green
        exit 0
    } else {
        Write-Host "`nâŒ Some error reporting tests failed. Check the logs for details." -ForegroundColor Red
        exit 1
    }
    
} catch {
    Write-Error "Test execution failed: $($_.Exception.Message)"
    Write-Error "Stack trace: $($_.ScriptStackTrace)"
    exit 1
}