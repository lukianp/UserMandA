# -*- coding: utf-8-bom -*-
#Requires -Version 5.1

# Author: Lukian Poleschtschuk
# Version: 1.0.0
# Created: 2025-06-06
# Last Modified: 2025-06-06
# Change Log: Initial implementation of performance metrics testing

<#
.SYNOPSIS
    Tests the performance metrics logging functionality of the M&A Discovery Suite.
.DESCRIPTION
    This script demonstrates and tests the Measure-Operation function and related
    performance tracking capabilities.
.NOTES
    Version: 1.0.0
    Author: M&A Discovery Suite Team
    Date: 2025-06-06
#>

[CmdletBinding()]
param(
    [Parameter(Mandatory=$false)]
    [switch]$Detailed,
    
    [Parameter(Mandatory=$false)]
    [switch]$ExportReport
)

# Ensure we're in the correct directory
$scriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$suiteRoot = Split-Path -Parent $scriptRoot
Set-Location $suiteRoot

Write-Host "=== M&A Discovery Suite - Performance Metrics Test ===" -ForegroundColor Cyan
Write-Host "Testing performance measurement and logging capabilities" -ForegroundColor Gray
Write-Host ""

# Initialize the suite environment
try {
    Write-Host "[1/6] Initializing suite environment..." -ForegroundColor Yellow
    . .\Scripts\Set-SuiteEnvironment.ps1
    Write-Host "    ✓ Suite environment initialized" -ForegroundColor Green
} catch {
    Write-Host "    ✗ Failed to initialize suite environment: $_" -ForegroundColor Red
    exit 1
}

# Load performance metrics module
try {
    Write-Host "[2/6] Loading performance metrics module..." -ForegroundColor Yellow
    Import-Module .\Modules\Utilities\PerformanceMetrics.psm1 -Force
    Write-Host "    ✓ Performance metrics module loaded" -ForegroundColor Green
} catch {
    Write-Host "    ✗ Failed to load performance metrics module: $_" -ForegroundColor Red
    exit 1
}

# Test basic operation measurement
try {
    Write-Host "[3/6] Testing basic operation measurement..." -ForegroundColor Yellow
    
    $result1 = Measure-Operation -Operation {
        Start-Sleep -Milliseconds 500
        return "Test operation completed"
    } -OperationName "BasicSleepTest" -Context $global:MandA -Data @{
        TestType = "Basic"
        SleepDuration = 500
    }
    
    Write-Host "    ✓ Basic operation measurement completed" -ForegroundColor Green
    Write-Host "    Result: $result1" -ForegroundColor Gray
} catch {
    Write-Host "    ✗ Basic operation measurement failed: $_" -ForegroundColor Red
}

# Test operation with error
try {
    Write-Host "[4/6] Testing operation with error handling..." -ForegroundColor Yellow
    
    try {
        $result2 = Measure-Operation -Operation {
            Start-Sleep -Milliseconds 200
            throw "Simulated error for testing"
        } -OperationName "ErrorTest" -Context $global:MandA -Data @{
            TestType = "Error"
            ExpectedToFail = $true
        }
    } catch {
        Write-Host "    ✓ Error handling test completed (expected error caught)" -ForegroundColor Green
        Write-Host "    Error: $($_.Exception.Message)" -ForegroundColor Gray
    }
} catch {
    Write-Host "    ✗ Error handling test failed unexpectedly: $_" -ForegroundColor Red
}

# Test performance session
try {
    Write-Host "[5/6] Testing performance session tracking..." -ForegroundColor Yellow
    
    $sessionId = Start-PerformanceSession -SessionName "TestSession" -Context $global:MandA
    Write-Host "    Started session: $sessionId" -ForegroundColor Gray
    
    # Run multiple operations in the session
    for ($i = 1; $i -le 3; $i++) {
        $result = Measure-Operation -Operation {
            Start-Sleep -Milliseconds (100 * $i)
            return "Session operation $i completed"
        } -OperationName "SessionOperation$i" -Context $global:MandA -Data @{
            SessionTest = $true
            OperationNumber = $i
            SleepDuration = (100 * $i)
        }
        Write-Host "    Operation $i completed: $result" -ForegroundColor Gray
    }
    
    $sessionSummary = Stop-PerformanceSession -SessionName "TestSession" -Context $global:MandA
    Write-Host "    ✓ Performance session completed" -ForegroundColor Green
    Write-Host "    Session duration: $($sessionSummary.TotalDuration) seconds" -ForegroundColor Gray
    Write-Host "    Operations: $($sessionSummary.OperationCount) total, $($sessionSummary.SuccessfulOperations) successful" -ForegroundColor Gray
} catch {
    Write-Host "    ✗ Performance session test failed: $_" -ForegroundColor Red
}

# Generate and display performance report
try {
    Write-Host "[6/6] Generating performance report..." -ForegroundColor Yellow
    
    $report = Get-PerformanceReport -OperationFilter "*Test*" -TimeRange 1
    
    Write-Host "    ✓ Performance report generated" -ForegroundColor Green
    Write-Host ""
    Write-Host "=== PERFORMANCE REPORT SUMMARY ===" -ForegroundColor Cyan
    Write-Host "Total Operations: $($report.Summary.TotalOperations)" -ForegroundColor White
    Write-Host "Successful: $($report.Summary.SuccessfulOperations)" -ForegroundColor Green
    Write-Host "Failed: $($report.Summary.FailedOperations)" -ForegroundColor Red
    Write-Host "Success Rate: $($report.Summary.SuccessRate)%" -ForegroundColor White
    Write-Host "Total Duration: $([math]::Round($report.Summary.TotalDuration, 3)) seconds" -ForegroundColor White
    Write-Host "Average Duration: $([math]::Round($report.Summary.AverageDuration, 3)) seconds" -ForegroundColor White
    Write-Host "Min Duration: $([math]::Round($report.Summary.MinDuration, 3)) seconds" -ForegroundColor White
    Write-Host "Max Duration: $([math]::Round($report.Summary.MaxDuration, 3)) seconds" -ForegroundColor White
    
    if ($Detailed) {
        Write-Host ""
        Write-Host "=== OPERATIONS BY NAME ===" -ForegroundColor Cyan
        foreach ($opName in $report.ByOperation.Keys) {
            $opData = $report.ByOperation[$opName]
            Write-Host "$opName`: $($opData.Count) runs, avg $([math]::Round($opData.AverageDuration, 3))s" -ForegroundColor White
        }
        
        Write-Host ""
        Write-Host "=== TOP 5 SLOWEST OPERATIONS ===" -ForegroundColor Cyan
        $report.TopSlowest | Select-Object -First 5 | ForEach-Object {
            Write-Host "$($_.OperationName): $([math]::Round($_.DurationSeconds, 3))s" -ForegroundColor Yellow
        }
        
        if ($report.Errors.Count -gt 0) {
            Write-Host ""
            Write-Host "=== ERRORS ===" -ForegroundColor Red
            $report.Errors | ForEach-Object {
                Write-Host "$($_.OperationName): $($_.ErrorMessage)" -ForegroundColor Red
            }
        }
    }
    
    # Export report if requested
    if ($ExportReport) {
        try {
            $reportPath = Export-PerformanceReport -ReportType "Detailed" -Context $global:MandA
            Write-Host ""
            Write-Host "✓ Detailed performance report exported to: $reportPath" -ForegroundColor Green
        } catch {
            Write-Host ""
            Write-Host "✗ Failed to export performance report: $_" -ForegroundColor Red
        }
    }
    
} catch {
    Write-Host "    ✗ Performance report generation failed: $_" -ForegroundColor Red
}

# Display performance statistics
try {
    $stats = Get-PerformanceStatistics
    Write-Host ""
    Write-Host "=== PERFORMANCE TRACKING STATISTICS ===" -ForegroundColor Cyan
    Write-Host "Total Metrics Collected: $($stats.TotalMetrics)" -ForegroundColor White
    Write-Host "Active Sessions: $($stats.ActiveSessions)" -ForegroundColor White
    Write-Host "Tracking Enabled: $($stats.Configuration.Enabled)" -ForegroundColor White
    Write-Host "Detailed Logging: $($stats.Configuration.DetailedLogging)" -ForegroundColor White
    Write-Host "System Metrics Collection: $($stats.Configuration.CollectSystemMetrics)" -ForegroundColor White
    if ($stats.OldestMetric) {
        Write-Host "Oldest Metric: $($stats.OldestMetric)" -ForegroundColor Gray
    }
    if ($stats.NewestMetric) {
        Write-Host "Newest Metric: $($stats.NewestMetric)" -ForegroundColor Gray
    }
} catch {
    Write-Host "Failed to get performance statistics: $_" -ForegroundColor Red
}

Write-Host ""
Write-Host "=== PERFORMANCE METRICS TEST COMPLETED ===" -ForegroundColor Cyan
Write-Host "All performance measurement capabilities have been tested." -ForegroundColor Gray
Write-Host ""
Write-Host "Usage in discovery modules:" -ForegroundColor Yellow
Write-Host "  `$result = Measure-Operation -Operation {" -ForegroundColor Gray
Write-Host "      # Your discovery code here" -ForegroundColor Gray
Write-Host "      Get-ADUser -Filter * -Properties *" -ForegroundColor Gray
Write-Host "  } -OperationName 'ActiveDirectoryUserDiscovery' -Context `$context" -ForegroundColor Gray
Write-Host ""
Write-Host "The orchestrator will automatically use Measure-Operation for all discovery modules." -ForegroundColor Green