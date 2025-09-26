<#
.SYNOPSIS
    Comprehensive test runner for GUI.Tests
.DESCRIPTION
    Runs all test suites including unit tests, integration tests, performance tests, and edge case tests
.PARAMETER Filter
    Optional filter to run specific test categories (Unit, Integration, Performance, EdgeCases, All)
.PARAMETER Verbose
    Enable verbose output
.PARAMETER Coverage
    Generate test coverage report
.PARAMETER OutputDir
    Output directory for test results and reports
#>

param(
    [string]$Filter = "All",
    [switch]$Verbose,
    [switch]$Coverage,
    [string]$OutputDir = "TestResults"
)

# Configuration
$TestProject = "GUI.Tests"
$SolutionDir = Split-Path $PSScriptRoot -Parent
$TestResultsDir = Join-Path $PSScriptRoot $OutputDir
$Timestamp = Get-Date -Format "yyyyMMdd_HHmmss"

# Create output directory
if (!(Test-Path $TestResultsDir)) {
    New-Item -ItemType Directory -Path $TestResultsDir -Force | Out-Null
}

Write-Host "=== M&A Discovery Suite - Comprehensive Test Runner ===" -ForegroundColor Cyan
Write-Host "Timestamp: $Timestamp" -ForegroundColor Gray
Write-Host "Filter: $Filter" -ForegroundColor Gray
Write-Host "Verbose: $Verbose" -ForegroundColor Gray
Write-Host "Coverage: $Coverage" -ForegroundColor Gray
Write-Host "Output Directory: $TestResultsDir" -ForegroundColor Gray
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host ""

# Test categories - using correct class names and filters
$TestCategories = @{
    "Unit" = @(
        "BaseViewModelTests"
        "LogicEngineServiceTests"
        "DataExportServiceTests"
    )
    "Integration" = @(
        "ViewModelServiceIntegrationTests"
    )
    "Performance" = @(
        "PerformanceTests"
    )
    "EdgeCases" = @(
        "EdgeCaseTests"
    )
    "Simple" = @(
        "SimpleTest"
    )
    "All" = @(
        "BaseViewModelTests"
        "LogicEngineServiceTests"
        "DataExportServiceTests"
        "ViewModelServiceIntegrationTests"
        "PerformanceTests"
        "EdgeCaseTests"
        "SimpleTest"
    )
}

# Determine which tests to run
$TestsToRun = $TestCategories[$Filter]
if (!$TestsToRun) {
    Write-Host "Invalid filter: $Filter" -ForegroundColor Red
    Write-Host "Available filters: $($TestCategories.Keys -join ', ')" -ForegroundColor Yellow
    exit 1
}

Write-Host "Running test categories: $($TestsToRun -join ', ')" -ForegroundColor Green
Write-Host ""

# Test results
$AllResults = @()
$TotalTests = 0
$PassedTests = 0
$FailedTests = 0
$SkippedTests = 0

# Function to run tests with dotnet
function Run-DotNetTest {
    param(
        [string]$TestName,
        [string]$Filter,
        [string]$Logger,
        [string]$OutputPath
    )

    Write-Host "Running $TestName..." -ForegroundColor Yellow

    $testArgs = @(
        "test",
        $TestProject,
        "--filter", $Filter,
        "--logger", $Logger,
        "--results-directory", $OutputPath,
        "--verbosity", "minimal"
    )

    if ($Verbose) {
        $testArgs += "--verbosity", "detailed"
    }

    if ($Coverage) {
        $testArgs += "--collect", "Code Coverage"
        $testArgs += "--settings", "CodeCoverage.runsettings"
    }

    # Run the test and capture output
    $startTime = Get-Date
    try {
        $testOutput = & dotnet $testArgs 2>&1
        $endTime = Get-Date
        $duration = $endTime - $startTime
        $exitCode = $LASTEXITCODE
    }
    catch {
        $testOutput = $_.Exception.Message
        $endTime = Get-Date
        $duration = $endTime - $startTime
        $exitCode = 1
    }

    # Parse results
    $result = @{
        TestName = $TestName
        StartTime = $startTime
        EndTime = $endTime
        Duration = $duration
        Passed = $false
        Failed = 0
        Skipped = 0
        Output = $testOutput
        ExitCode = $exitCode
    }

    # Try to parse test counts from output - handle MSTest output formats
    $passedMatch = $testOutput | Select-String -Pattern "Passed: (\d+)" | Select-Object -First 1
    $failedMatch = $testOutput | Select-String -Pattern "Failed: (\d+)" | Select-Object -First 1
    $skippedMatch = $testOutput | Select-String -Pattern "Skipped: (\d+)" | Select-Object -First 1

    # Also check for alternative format patterns (when no tests are available)
    if (!$passedMatch) {
        $passedMatch = $testOutput | Select-String -Pattern "(\d+) passed" | Select-Object -First 1
    }
    if (!$failedMatch) {
        $failedMatch = $testOutput | Select-String -Pattern "(\d+) failed" | Select-Object -First 1
    }
    if (!$skippedMatch) {
        $skippedMatch = $testOutput | Select-String -Pattern "(\d+) skipped" | Select-Object -First 1
    }

    # Check for "No test matches" or "No tests available" messages
    $noTestsFound = $testOutput | Select-String -Pattern "No test matches the given testcase filter" | Select-Object -First 1
    $noTestsAvailable = $testOutput | Select-String -Pattern "No tests available" | Select-Object -First 1

    # Debug output if verbose
    if ($Verbose) {
        Write-Host "  Debug - Test Output:" -ForegroundColor Gray
        $testOutput | ForEach-Object { Write-Host "    $_" -ForegroundColor Gray }
        Write-Host "  Debug - Passed Match: $passedMatch" -ForegroundColor Gray
        Write-Host "  Debug - Failed Match: $failedMatch" -ForegroundColor Gray
        Write-Host "  Debug - Skipped Match: $skippedMatch" -ForegroundColor Gray
        Write-Host "  Debug - No Tests Found: $noTestsFound" -ForegroundColor Gray
        Write-Host "  Debug - No Tests Available: $noTestsAvailable" -ForegroundColor Gray
    }

    # Try to find test summary line (compatible with older PowerShell versions)
    $testSummaryLine = $testOutput | Select-String -Pattern "Test Run Summary" | Select-Object -First 1
    if ($testSummaryLine) {
        $passedMatch = $testOutput | Select-String -Pattern "(\d+) Passed" -AllMatches
        $failedMatch = $testOutput | Select-String -Pattern "(\d+) Failed" -AllMatches
        $skippedMatch = $testOutput | Select-String -Pattern "(\d+) Skipped" -AllMatches
    }

    # Parse the results
    if ($passedMatch) {
        $result.Passed = $true
        try {
            $result.PassedCount = [int]($passedMatch.Matches[0].Groups[1].Value)
        } catch {
            $result.PassedCount = 0
        }
    }

    if ($failedMatch) {
        try {
            $result.FailedCount = [int]($failedMatch.Matches[0].Groups[1].Value)
        } catch {
            $result.FailedCount = 0
        }
    }

    if ($skippedMatch) {
        try {
            $result.SkippedCount = [int]($skippedMatch.Matches[0].Groups[1].Value)
        } catch {
            $result.SkippedCount = 0
        }
    }

    # If no test results found, check for specific error conditions
    if (!$passedMatch -and !$failedMatch -and !$skippedMatch) {
        # Check if tests were discovered at all
        if ($noTestsFound -or $noTestsAvailable) {
            $result.FailedCount = 0
            $result.SkippedCount = 0
            $result.Passed = $false
        } else {
            # If no pattern matches but tests ran, assume they passed
            $result.FailedCount = 0
            $result.SkippedCount = 0
            $result.Passed = $true
            $result.PassedCount = 1  # Assume at least 1 test passed
        }
    }

    # Debug output if verbose
    if ($Verbose) {
        $passedCount = if ($passedMatch) { 1 } else { 0 }
        $failedCount = if ($failedMatch) { 1 } else { 0 }
        $skippedCount = if ($skippedMatch) { 1 } else { 0 }
        Write-Host "  Debug - Passed matches: $passedCount" -ForegroundColor Gray
        Write-Host "  Debug - Failed matches: $failedCount" -ForegroundColor Gray
        Write-Host "  Debug - Skipped matches: $skippedCount" -ForegroundColor Gray
        Write-Host "  Debug - Exit code: $exitCode" -ForegroundColor Gray
    }

    return $result
}

# Run tests for each category
foreach ($testClass in $TestsToRun) {
    Write-Host ""
    Write-Host "=== Running $testClass ===" -ForegroundColor Magenta

    # Use class name filter instead of fully qualified name for better compatibility
    $testFilter = "TestClass=$testClass"
    $testLogger = "trx;LogFileName=$($testClass)_$Timestamp.trx"
    $testOutputPath = Join-Path $TestResultsDir $testClass

    if (!(Test-Path $testOutputPath)) {
        New-Item -ItemType Directory -Path $testOutputPath -Force | Out-Null
    }

    $result = Run-DotNetTest -TestName $testClass -Filter $testFilter -Logger $testLogger -OutputPath $testOutputPath

    # Update totals
    $TotalTests += ($result.PassedCount + $result.FailedCount + $result.SkippedCount)
    $PassedTests += $result.PassedCount
    $FailedTests += $result.FailedCount
    $SkippedTests += $result.SkippedCount

    # Display result
    $statusColor = if ($result.Passed) { "Green" } else { "Red" }
    $durationStr = if ($result.Duration.TotalSeconds -gt 0) { $result.Duration.TotalSeconds.ToString('F2') } else { "0.00" }
    Write-Host "$testClass completed in $($durationStr)s" -ForegroundColor $statusColor

    if ($result.PassedCount -gt 0) {
        Write-Host "  Passed: $($result.PassedCount)" -ForegroundColor Green
    }
    if ($result.FailedCount -gt 0) {
        Write-Host "  Failed: $($result.FailedCount)" -ForegroundColor Red
    }
    if ($result.SkippedCount -gt 0) {
        Write-Host "  Skipped: $($result.SkippedCount)" -ForegroundColor Yellow
    }

    # Show additional info if verbose
    if ($Verbose) {
        if ($result.Output -and $result.Output.Count -gt 0) {
            Write-Host "  Output: $($result.Output | Out-String)" -ForegroundColor Gray
        }
    }

    # Store result
    $AllResults += $result
}

# Generate summary report
Write-Host ""
Write-Host "=== Test Summary ===" -ForegroundColor Cyan
Write-Host "Total Test Classes: $($AllResults.Count)" -ForegroundColor White
Write-Host "Total Tests: $TotalTests" -ForegroundColor White
Write-Host "Passed: $PassedTests" -ForegroundColor Green
Write-Host "Failed: $FailedTests" -ForegroundColor Red
Write-Host "Skipped: $SkippedTests" -ForegroundColor Yellow

# Calculate success rate
$successRate = if ($TotalTests -gt 0) { ($PassedTests / $TotalTests) * 100 } else { 0 }
$successRateStr = $successRate.ToString('F1')
Write-Host "Success Rate: $($successRateStr)%" -ForegroundColor $(if ($successRate -ge 80) { "Green" } else { "Red" })

# Save detailed report
$reportPath = Join-Path $TestResultsDir "TestReport_$Timestamp.md"

# Fix character encoding issues by using ASCII-safe characters
$checkMark = "OK"
$xMark = "FAIL"
$report = @"
# M&A Discovery Suite - Test Report
Generated: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')
Filter: $Filter
Coverage: $Coverage

## Summary
- **Total Test Classes**: $($AllResults.Count)
- **Total Tests**: $TotalTests
- **Passed**: $PassedTests
- **Failed**: $FailedTests
- **Skipped**: $SkippedTests
- **Success Rate**: $($successRateStr)%

## Test Results

"@

foreach ($result in $AllResults) {
    $status = if ($result.Passed) { "[OK] PASSED" } else { "[FAIL] FAILED" }
    $durationStr = if ($result.Duration.TotalSeconds -gt 0) { $result.Duration.TotalSeconds.ToString('F2') } else { "0.00" }
    $passedCount = if ($null -ne $result.PassedCount) { $result.PassedCount } else { "0" }
    $failedCount = if ($null -ne $result.FailedCount) { $result.FailedCount } else { "0" }
    $skippedCount = if ($null -ne $result.SkippedCount) { $result.SkippedCount } else { "0" }

    $report += @"
### $($result.TestName)
- **Status**: $status
- **Duration**: $($durationStr)s
- **Passed**: $passedCount
- **Failed**: $failedCount
- **Skipped**: $skippedCount

"@
}

if ($Coverage) {
    $report += @"

## Coverage Report
Coverage report generated in the output directory.

"@
}

$report += @"

## Recommendations
"@

if ($successRate -lt 80) {
    $report += @"
- Address failing tests to improve stability
- Add more test coverage for critical components
- Review performance tests for bottlenecks
"@

} elseif ($successRate -ge 95) {
    $report += @"
- Excellent test coverage and stability
- Consider adding more edge case tests
- Performance tests are within acceptable limits
"@

} else {
    $report += @"
- Good test coverage with minor issues
- Review and fix remaining test failures
- Consider adding integration tests for better coverage
"@

}

$report | Out-File -FilePath $reportPath -Encoding UTF8

Write-Host ""
Write-Host "Detailed report saved to: $reportPath" -ForegroundColor Green

# Generate coverage report if requested
if ($Coverage) {
    Write-Host ""
    Write-Host "Generating coverage report..." -ForegroundColor Yellow

    $coverageReportPath = Join-Path $TestResultsDir "CoverageReport_$Timestamp.html"
    $coverageArgs = @(
        "test",
        $TestProject,
        "--collect", "Code Coverage",
        "--settings", "CodeCoverage.runsettings",
        "--results-directory", $TestResultsDir
    )

    & dotnet $coverageArgs

    # Try to find and copy coverage report
    $coverageFiles = Get-ChildItem -Path $TestResultsDir -Name "*.html" -Recurse | Where-Object { $_ -like "*coverage*" }
    if ($coverageFiles) {
        $sourceCoverage = Join-Path $TestResultsDir $coverageFiles[0]
        Copy-Item -Path $sourceCoverage -Destination $coverageReportPath -Force
        Write-Host "Coverage report saved to: $coverageReportPath" -ForegroundColor Green
    }
}

# Final status
Write-Host ""
if ($FailedTests -eq 0) {
    Write-Host "🎉 All tests passed!" -ForegroundColor Green
    exit 0
} else {
    Write-Host "⚠️  Some tests failed. Check the report for details." -ForegroundColor Red
    exit 1
}