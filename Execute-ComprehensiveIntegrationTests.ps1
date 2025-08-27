#Requires -Version 5.1
#Requires -Module Pester

<#
.SYNOPSIS
    Execute comprehensive integration tests for the M&A Discovery Suite Migration Platform
    
.DESCRIPTION
    This script orchestrates the execution of all integration tests and generates
    a comprehensive production readiness report. It validates:
    - Data integrity across all CSV files
    - PowerShell module functionality
    - GUI component integration
    - Performance and stability metrics
    - Error handling and recovery capabilities
    
.PARAMETER TestScope
    Scope of testing to execute (Full, Quick, DataOnly, PowerShellOnly)
    
.PARAMETER SkipGUI
    Skip GUI-related tests (useful for headless environments)
    
.PARAMETER OutputPath
    Path for test results and reports
    
.EXAMPLE
    .\Execute-ComprehensiveIntegrationTests.ps1 -TestScope Full
    
.EXAMPLE
    .\Execute-ComprehensiveIntegrationTests.ps1 -TestScope Quick -SkipGUI
    
.NOTES
    Author: Automated Test & Data Validation Agent
    Version: 1.0
    Date: 2025-08-23
#>

[CmdletBinding()]
param(
    [Parameter(Mandatory = $false)]
    [ValidateSet("Full", "Quick", "DataOnly", "PowerShellOnly")]
    [string]$TestScope = "Full",
    
    [Parameter(Mandatory = $false)]
    [switch]$SkipGUI = $false,
    
    [Parameter(Mandatory = $false)]
    [string]$OutputPath = "D:\Scripts\UserMandA\TestLogs"
)

# Initialize execution environment
$ErrorActionPreference = "Continue"
$WarningPreference = "Continue"

# Create output directory
if (!(Test-Path $OutputPath)) {
    New-Item -ItemType Directory -Path $OutputPath -Force | Out-Null
}

$startTime = Get-Date
$sessionId = [System.Guid]::NewGuid().ToString()

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "M&A DISCOVERY SUITE INTEGRATION TESTING" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Test Session ID: $sessionId" -ForegroundColor Green
Write-Host "Start Time: $($startTime.ToString('yyyy-MM-dd HH:mm:ss'))" -ForegroundColor Green
Write-Host "Test Scope: $TestScope" -ForegroundColor Green
Write-Host "Skip GUI: $SkipGUI" -ForegroundColor Green
Write-Host "Output Path: $OutputPath" -ForegroundColor Green
Write-Host ""

# Initialize test results tracking
$testResults = @{
    SessionId = $sessionId
    StartTime = $startTime
    TestScope = $TestScope
    OverallResults = @{
        TotalTests = 0
        PassedTests = 0
        FailedTests = 0
        SkippedTests = 0
        Warnings = 0
    }
    TestSuites = @{}
    PerformanceMetrics = @{}
    DataValidationResults = @{}
    ProductionReadinessStatus = "Unknown"
    Errors = @()
    Recommendations = @()
}

function Write-TestHeader {
    param([string]$Title)
    Write-Host ""
    Write-Host "═══════════════════════════════════════" -ForegroundColor Yellow
    Write-Host " $Title" -ForegroundColor Yellow
    Write-Host "═══════════════════════════════════════" -ForegroundColor Yellow
    Write-Host ""
}

function Write-TestResult {
    param(
        [string]$TestName,
        [string]$Status,
        [int]$Passed = 0,
        [int]$Failed = 0,
        [int]$Skipped = 0,
        [hashtable]$Metrics = @{}
    )
    
    $color = switch ($Status) {
        "PASSED" { "Green" }
        "FAILED" { "Red" }
        "WARNING" { "Yellow" }
        "SKIPPED" { "Gray" }
        default { "White" }
    }
    
    Write-Host "  [$Status] $TestName" -ForegroundColor $color
    if ($Passed -gt 0 -or $Failed -gt 0 -or $Skipped -gt 0) {
        Write-Host "    Passed: $Passed | Failed: $Failed | Skipped: $Skipped" -ForegroundColor Gray
    }
    
    if ($Metrics.Count -gt 0) {
        foreach ($metric in $Metrics.Keys) {
            Write-Host "    $metric`: $($Metrics[$metric])" -ForegroundColor Gray
        }
    }
}

try {
    # Test Suite 1: Data Integrity and CSV Validation
    if ($TestScope -in @("Full", "DataOnly")) {
        Write-TestHeader "DATA INTEGRITY & CSV VALIDATION"
        
        try {
            $dataTestResults = Invoke-Pester -Path "D:\Scripts\UserMandA\Tests\Integration\ComprehensiveMigrationIntegrationTests.ps1" -Tag "DataIntegrity" -PassThru -Output None
            
            $testResults.TestSuites["DataIntegrity"] = @{
                Status = if ($dataTestResults.FailedCount -eq 0) { "PASSED" } else { "FAILED" }
                PassedTests = $dataTestResults.PassedCount
                FailedTests = $dataTestResults.FailedCount
                SkippedTests = $dataTestResults.SkippedCount
                Duration = $dataTestResults.Duration.TotalSeconds
            }
            
            Write-TestResult -TestName "CSV File Structure Validation" -Status $testResults.TestSuites["DataIntegrity"].Status -Passed $dataTestResults.PassedCount -Failed $dataTestResults.FailedCount -Skipped $dataTestResults.SkippedCount
            
            $testResults.OverallResults.TotalTests += $dataTestResults.TotalCount
            $testResults.OverallResults.PassedTests += $dataTestResults.PassedCount
            $testResults.OverallResults.FailedTests += $dataTestResults.FailedCount
            $testResults.OverallResults.SkippedTests += $dataTestResults.SkippedCount
            
        } catch {
            $testResults.Errors += "Data Integrity Tests: $($_.Exception.Message)"
            Write-TestResult -TestName "Data Integrity Tests" -Status "FAILED"
        }
    }
    
    # Test Suite 2: PowerShell Module Integration
    if ($TestScope -in @("Full", "PowerShellOnly")) {
        Write-TestHeader "POWERSHELL MODULE INTEGRATION"
        
        try {
            # Test MailboxMigration module
            if (Test-Path "D:\Scripts\UserMandA\Tests\Migration\PowerShell\MailboxMigration\MailboxMigration.Tests.ps1") {
                $mailboxTestResults = Invoke-Pester -Path "D:\Scripts\UserMandA\Tests\Migration\PowerShell\MailboxMigration\MailboxMigration.Tests.ps1" -PassThru -Output None
                
                $testResults.TestSuites["MailboxMigration"] = @{
                    Status = if ($mailboxTestResults.FailedCount -eq 0) { "PASSED" } else { "FAILED" }
                    PassedTests = $mailboxTestResults.PassedCount
                    FailedTests = $mailboxTestResults.FailedCount
                    SkippedTests = $mailboxTestResults.SkippedCount
                    Duration = $mailboxTestResults.Duration.TotalSeconds
                }
                
                Write-TestResult -TestName "MailboxMigration Module Tests" -Status $testResults.TestSuites["MailboxMigration"].Status -Passed $mailboxTestResults.PassedCount -Failed $mailboxTestResults.FailedCount
                
                $testResults.OverallResults.TotalTests += $mailboxTestResults.TotalCount
                $testResults.OverallResults.PassedTests += $mailboxTestResults.PassedCount
                $testResults.OverallResults.FailedTests += $mailboxTestResults.FailedCount
                $testResults.OverallResults.SkippedTests += $mailboxTestResults.SkippedCount
            }
            
            # Test UserMigration module
            if (Test-Path "D:\Scripts\UserMandA\Tests\Migration\PowerShell\UserMigration\UserMigration.Tests.ps1") {
                $userTestResults = Invoke-Pester -Path "D:\Scripts\UserMandA\Tests\Migration\PowerShell\UserMigration\UserMigration.Tests.ps1" -PassThru -Output None
                
                $testResults.TestSuites["UserMigration"] = @{
                    Status = if ($userTestResults.FailedCount -eq 0) { "PASSED" } else { "FAILED" }
                    PassedTests = $userTestResults.PassedCount
                    FailedTests = $userTestResults.FailedCount
                    SkippedTests = $userTestResults.SkippedCount
                    Duration = $userTestResults.Duration.TotalSeconds
                }
                
                Write-TestResult -TestName "UserMigration Module Tests" -Status $testResults.TestSuites["UserMigration"].Status -Passed $userTestResults.PassedCount -Failed $userTestResults.FailedCount
                
                $testResults.OverallResults.TotalTests += $userTestResults.TotalCount
                $testResults.OverallResults.PassedTests += $userTestResults.PassedCount
                $testResults.OverallResults.FailedTests += $userTestResults.FailedCount
                $testResults.OverallResults.SkippedTests += $userTestResults.SkippedCount
            }
            
            # Test FileSystemMigration module
            if (Test-Path "D:\Scripts\UserMandA\Tests\Migration\PowerShell\FileSystemMigration\FileSystemMigration.Tests.ps1") {
                $fileSystemTestResults = Invoke-Pester -Path "D:\Scripts\UserMandA\Tests\Migration\PowerShell\FileSystemMigration\FileSystemMigration.Tests.ps1" -PassThru -Output None
                
                $testResults.TestSuites["FileSystemMigration"] = @{
                    Status = if ($fileSystemTestResults.FailedCount -eq 0) { "PASSED" } else { "FAILED" }
                    PassedTests = $fileSystemTestResults.PassedCount
                    FailedTests = $fileSystemTestResults.FailedCount
                    SkippedTests = $fileSystemTestResults.SkippedCount
                    Duration = $fileSystemTestResults.Duration.TotalSeconds
                }
                
                Write-TestResult -TestName "FileSystemMigration Module Tests" -Status $testResults.TestSuites["FileSystemMigration"].Status -Passed $fileSystemTestResults.PassedCount -Failed $fileSystemTestResults.FailedCount
                
                $testResults.OverallResults.TotalTests += $fileSystemTestResults.TotalCount
                $testResults.OverallResults.PassedTests += $fileSystemTestResults.PassedCount
                $testResults.OverallResults.FailedTests += $fileSystemTestResults.FailedCount
                $testResults.OverallResults.SkippedTests += $fileSystemTestResults.SkippedCount
            }
            
        } catch {
            $testResults.Errors += "PowerShell Module Tests: $($_.Exception.Message)"
            Write-TestResult -TestName "PowerShell Module Tests" -Status "FAILED"
        }
    }
    
    # Test Suite 3: GUI Integration Tests
    if ($TestScope -in @("Full") -and !$SkipGUI) {
        Write-TestHeader "GUI INTEGRATION & WORKFLOW"
        
        try {
            $guiTestResults = Invoke-Pester -Path "D:\Scripts\UserMandA\Tests\Integration\ComprehensiveMigrationIntegrationTests.ps1" -Tag "GUI" -PassThru -Output None
            
            $testResults.TestSuites["GUI"] = @{
                Status = if ($guiTestResults.FailedCount -eq 0) { "PASSED" } else { "FAILED" }
                PassedTests = $guiTestResults.PassedCount
                FailedTests = $guiTestResults.FailedCount
                SkippedTests = $guiTestResults.SkippedCount
                Duration = $guiTestResults.Duration.TotalSeconds
            }
            
            Write-TestResult -TestName "GUI Build and Integration" -Status $testResults.TestSuites["GUI"].Status -Passed $guiTestResults.PassedCount -Failed $guiTestResults.FailedCount
            
            $testResults.OverallResults.TotalTests += $guiTestResults.TotalCount
            $testResults.OverallResults.PassedTests += $guiTestResults.PassedCount
            $testResults.OverallResults.FailedTests += $guiTestResults.FailedCount
            $testResults.OverallResults.SkippedTests += $guiTestResults.SkippedCount
            
        } catch {
            $testResults.Errors += "GUI Integration Tests: $($_.Exception.Message)"
            Write-TestResult -TestName "GUI Integration Tests" -Status "FAILED"
        }
    } elseif ($SkipGUI) {
        Write-TestResult -TestName "GUI Integration Tests" -Status "SKIPPED"
    }
    
    # Test Suite 4: Performance and Stability
    if ($TestScope -in @("Full")) {
        Write-TestHeader "PERFORMANCE & STABILITY"
        
        try {
            $performanceTestResults = Invoke-Pester -Path "D:\Scripts\UserMandA\Tests\Integration\ComprehensiveMigrationIntegrationTests.ps1" -Tag "Performance" -PassThru -Output None
            
            $testResults.TestSuites["Performance"] = @{
                Status = if ($performanceTestResults.FailedCount -eq 0) { "PASSED" } else { "FAILED" }
                PassedTests = $performanceTestResults.PassedCount
                FailedTests = $performanceTestResults.FailedCount
                SkippedTests = $performanceTestResults.SkippedCount
                Duration = $performanceTestResults.Duration.TotalSeconds
            }
            
            Write-TestResult -TestName "Performance and Memory Tests" -Status $testResults.TestSuites["Performance"].Status -Passed $performanceTestResults.PassedCount -Failed $performanceTestResults.FailedCount
            
            $testResults.OverallResults.TotalTests += $performanceTestResults.TotalCount
            $testResults.OverallResults.PassedTests += $performanceTestResults.PassedCount
            $testResults.OverallResults.FailedTests += $performanceTestResults.FailedCount
            $testResults.OverallResults.SkippedTests += $performanceTestResults.SkippedCount
            
        } catch {
            $testResults.Errors += "Performance Tests: $($_.Exception.Message)"
            Write-TestResult -TestName "Performance Tests" -Status "FAILED"
        }
    }
    
    # Test Suite 5: Error Handling and Recovery
    if ($TestScope -in @("Full")) {
        Write-TestHeader "ERROR HANDLING & RECOVERY"
        
        try {
            $errorHandlingTestResults = Invoke-Pester -Path "D:\Scripts\UserMandA\Tests\Integration\ComprehensiveMigrationIntegrationTests.ps1" -Tag "ErrorHandling" -PassThru -Output None
            
            $testResults.TestSuites["ErrorHandling"] = @{
                Status = if ($errorHandlingTestResults.FailedCount -eq 0) { "PASSED" } else { "FAILED" }
                PassedTests = $errorHandlingTestResults.PassedCount
                FailedTests = $errorHandlingTestResults.FailedCount
                SkippedTests = $errorHandlingTestResults.SkippedCount
                Duration = $errorHandlingTestResults.Duration.TotalSeconds
            }
            
            Write-TestResult -TestName "Error Handling and Recovery" -Status $testResults.TestSuites["ErrorHandling"].Status -Passed $errorHandlingTestResults.PassedCount -Failed $errorHandlingTestResults.FailedCount
            
            $testResults.OverallResults.TotalTests += $errorHandlingTestResults.TotalCount
            $testResults.OverallResults.PassedTests += $errorHandlingTestResults.PassedCount
            $testResults.OverallResults.FailedTests += $errorHandlingTestResults.FailedCount
            $testResults.OverallResults.SkippedTests += $errorHandlingTestResults.SkippedCount
            
        } catch {
            $testResults.Errors += "Error Handling Tests: $($_.Exception.Message)"
            Write-TestResult -TestName "Error Handling Tests" -Status "FAILED"
        }
    }
    
} catch {
    $testResults.Errors += "Test Execution Error: $($_.Exception.Message)"
    Write-Host "Critical error during test execution: $($_.Exception.Message)" -ForegroundColor Red
}

# Calculate test completion
$endTime = Get-Date
$testResults.EndTime = $endTime
$testResults.Duration = ($endTime - $startTime).TotalMinutes

# Determine Production Readiness Status
$failureRate = if ($testResults.OverallResults.TotalTests -gt 0) {
    ($testResults.OverallResults.FailedTests / $testResults.OverallResults.TotalTests) * 100
} else { 100 }

$testResults.ProductionReadinessStatus = if ($failureRate -eq 0) {
    "PRODUCTION READY"
} elseif ($failureRate -lt 5) {
    "READY WITH MINOR ISSUES"
} elseif ($failureRate -lt 15) {
    "NEEDS ATTENTION"
} else {
    "NOT PRODUCTION READY"
}

# Generate Recommendations
$testResults.Recommendations += "Establish continuous monitoring for data validation failures"
$testResults.Recommendations += "Implement automated backup procedures for migration operations"
$testResults.Recommendations += "Set up alerting for performance threshold breaches"
$testResults.Recommendations += "Create rollback procedures for each migration type"

if ($testResults.OverallResults.FailedTests -gt 0) {
    $testResults.Recommendations += "Address all failed test cases before production deployment"
}

if ($failureRate -gt 10) {
    $testResults.Recommendations += "Conduct additional testing cycles to improve reliability"
}

# Display Final Results
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "          FINAL TEST RESULTS" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Test Summary:" -ForegroundColor Yellow
Write-Host "  Total Tests: $($testResults.OverallResults.TotalTests)" -ForegroundColor White
Write-Host "  Passed: $($testResults.OverallResults.PassedTests)" -ForegroundColor Green
Write-Host "  Failed: $($testResults.OverallResults.FailedTests)" -ForegroundColor Red
Write-Host "  Skipped: $($testResults.OverallResults.SkippedTests)" -ForegroundColor Gray
Write-Host "  Success Rate: $([math]::Round((($testResults.OverallResults.PassedTests / [math]::Max(1, $testResults.OverallResults.TotalTests)) * 100), 2))%" -ForegroundColor $(if($failureRate -eq 0) {"Green"} else {"Yellow"})
Write-Host "  Duration: $([math]::Round($testResults.Duration, 2)) minutes" -ForegroundColor White
Write-Host ""

$statusColor = switch ($testResults.ProductionReadinessStatus) {
    "PRODUCTION READY" { "Green" }
    "READY WITH MINOR ISSUES" { "Yellow" }
    "NEEDS ATTENTION" { "Yellow" }
    "NOT PRODUCTION READY" { "Red" }
}

Write-Host "PRODUCTION READINESS: " -NoNewline
Write-Host $testResults.ProductionReadinessStatus -ForegroundColor $statusColor -BackgroundColor Black
Write-Host ""

if ($testResults.Errors.Count -gt 0) {
    Write-Host "Errors Encountered:" -ForegroundColor Red
    foreach ($error in $testResults.Errors) {
        Write-Host "  • $error" -ForegroundColor Red
    }
    Write-Host ""
}

Write-Host "Key Recommendations:" -ForegroundColor Yellow
foreach ($recommendation in $testResults.Recommendations) {
    Write-Host "  • $recommendation" -ForegroundColor Gray
}
Write-Host ""

# Export detailed test report
$reportPath = Join-Path $OutputPath "comprehensive_test_report_$(Get-Date -Format 'yyyyMMdd_HHmmss').json"
$testResults | ConvertTo-Json -Depth 4 | Set-Content $reportPath

Write-Host "Detailed test report saved to: $reportPath" -ForegroundColor Green

# Export summary report
$summaryPath = Join-Path $OutputPath "test_summary_$(Get-Date -Format 'yyyyMMdd_HHmmss').txt"
$summary = @"
M&A DISCOVERY SUITE - INTEGRATION TEST SUMMARY
==============================================

Test Session: $($testResults.SessionId)
Execution Time: $($testResults.StartTime.ToString('yyyy-MM-dd HH:mm:ss')) - $($testResults.EndTime.ToString('yyyy-MM-dd HH:mm:ss'))
Duration: $([math]::Round($testResults.Duration, 2)) minutes
Test Scope: $($testResults.TestScope)

RESULTS OVERVIEW:
- Total Tests: $($testResults.OverallResults.TotalTests)
- Passed: $($testResults.OverallResults.PassedTests)
- Failed: $($testResults.OverallResults.FailedTests)
- Skipped: $($testResults.OverallResults.SkippedTests)
- Success Rate: $([math]::Round((($testResults.OverallResults.PassedTests / [math]::Max(1, $testResults.OverallResults.TotalTests)) * 100), 2))%

PRODUCTION READINESS STATUS: $($testResults.ProductionReadinessStatus)

TEST SUITE BREAKDOWN:
$($testResults.TestSuites.Keys | ForEach-Object {
    $suite = $testResults.TestSuites[$_]
    "- $_`: $($suite.Status) (P:$($suite.PassedTests) F:$($suite.FailedTests) S:$($suite.SkippedTests))"
} | Out-String)

RECOMMENDATIONS:
$($testResults.Recommendations | ForEach-Object { "• $_" } | Out-String)

Generated: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')
"@

$summary | Set-Content $summaryPath
Write-Host "Test summary saved to: $summaryPath" -ForegroundColor Green

Write-Host ""
if ($testResults.ProductionReadinessStatus -eq "PRODUCTION READY") {
    Write-Host "🎉 PLATFORM IS READY FOR PRODUCTION DEPLOYMENT!" -ForegroundColor Green -BackgroundColor DarkGreen
} elseif ($testResults.ProductionReadinessStatus -eq "READY WITH MINOR ISSUES") {
    Write-Host "⚠️  PLATFORM IS READY WITH MINOR ISSUES TO ADDRESS" -ForegroundColor Black -BackgroundColor Yellow
} else {
    Write-Host "❌ PLATFORM REQUIRES ADDITIONAL WORK BEFORE PRODUCTION" -ForegroundColor White -BackgroundColor Red
}

Write-Host ""

# Return test results for any calling scripts
return $testResults