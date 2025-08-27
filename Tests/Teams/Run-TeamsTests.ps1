#Requires -Version 5.1
<#
.SYNOPSIS
    Comprehensive test runner for Teams Migration Planning Platform
    
.DESCRIPTION
    Executes unit tests, integration tests, data model validation tests, UI simulation tests,
    and performance tests for the Teams migration platform. Generates detailed reports.
    
.PARAMETER TestCategory
    Optional test category to run. Options: Unit, Integration, DataModel, UISimulation, Performance, All
    Default: All
    
.PARAMETER GenerateReport
    Generate detailed HTML test report. Default: true
    
.PARAMETER OutputPath
    Path for test results and reports. Default: .\TestResults
    
.EXAMPLE
    .\Run-TeamsTests.ps1
    Runs all test categories with reports
    
.EXAMPLE
    .\Run-TeamsTests.ps1 -TestCategory Unit -GenerateReport $false
    Runs only unit tests without HTML report
#>

[CmdletBinding()]
param(
    [Parameter(Mandatory = $false)]
    [ValidateSet("Unit", "Integration", "DataModel", "UISimulation", "Performance", "All")]
    [string]$TestCategory = "All",
    
    [Parameter(Mandatory = $false)]
    [bool]$GenerateReport = $true,
    
    [Parameter(Mandatory = $false)]
    [string]$OutputPath = ".\TestResults"
)

# Test configuration
$TestAssembly = "MandADiscoverySuite.Tests.Teams.dll"
$ProjectPath = Split-Path $MyInvocation.MyCommand.Path -Parent
$SolutionRoot = Split-Path (Split-Path $ProjectPath -Parent) -Parent

# Ensure output directory exists
if (-not (Test-Path $OutputPath)) {
    New-Item -ItemType Directory -Path $OutputPath -Force | Out-Null
}

# Test results tracking
$TestResults = @{
    StartTime = Get-Date
    EndTime = $null
    Categories = @{}
    TotalTests = 0
    PassedTests = 0
    FailedTests = 0
    SkippedTests = 0
    Errors = @()
}

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Teams Migration Platform Test Runner" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Start Time: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Green
Write-Host "Test Category: $TestCategory" -ForegroundColor Green
Write-Host "Output Path: $OutputPath" -ForegroundColor Green
Write-Host ""

function Write-TestHeader {
    param([string]$Category, [string]$Description)
    Write-Host "----------------------------------------" -ForegroundColor Yellow
    Write-Host "$Category Tests: $Description" -ForegroundColor Yellow
    Write-Host "----------------------------------------" -ForegroundColor Yellow
}

function Write-TestResult {
    param([string]$TestName, [string]$Status, [int]$Duration = 0, [string]$Message = "")
    $color = switch ($Status) {
        "PASS" { "Green" }
        "FAIL" { "Red" }
        "SKIP" { "Yellow" }
        default { "White" }
    }
    
    $durationText = if ($Duration -gt 0) { " ($($Duration)ms)" } else { "" }
    Write-Host "  [$Status] $TestName$durationText" -ForegroundColor $color
    
    if ($Message -and $Status -eq "FAIL") {
        Write-Host "    Error: $Message" -ForegroundColor Red
    }
}

function Invoke-TestCategory {
    param(
        [string]$CategoryName,
        [string]$TestClass,
        [string]$Description
    )
    
    Write-TestHeader $CategoryName $Description
    
    $categoryResults = @{
        Tests = 0
        Passed = 0
        Failed = 0
        Skipped = 0
        Duration = 0
        Errors = @()
    }
    
    try {
        # Build the project first
        Write-Host "  Building test project..." -ForegroundColor Cyan
        $buildResult = dotnet build "$ProjectPath\Teams.Tests.csproj" --configuration Debug --verbosity quiet 2>&1
        
        if ($LASTEXITCODE -ne 0) {
            throw "Build failed: $buildResult"
        }
        
        # Run tests with detailed output
        $testFilter = if ($TestClass) { "--filter `"FullyQualifiedName~$TestClass`"" } else { "" }
        $testCommand = "dotnet test `"$ProjectPath\Teams.Tests.csproj`" --configuration Debug --logger trx --results-directory `"$OutputPath`" --verbosity normal $testFilter"
        
        Write-Host "  Running tests..." -ForegroundColor Cyan
        $testOutput = Invoke-Expression $testCommand 2>&1
        
        # Parse test results from output
        $testLines = $testOutput -split "`n" | Where-Object { $_ -match "^\s*(Passed|Failed|Skipped)" }
        
        foreach ($line in $testLines) {
            if ($line -match "Passed.*?(\d+)") {
                $categoryResults.Passed += [int]$matches[1]
            }
            elseif ($line -match "Failed.*?(\d+)") {
                $categoryResults.Failed += [int]$matches[1]
            }
            elseif ($line -match "Skipped.*?(\d+)") {
                $categoryResults.Skipped += [int]$matches[1]
            }
        }
        
        $categoryResults.Tests = $categoryResults.Passed + $categoryResults.Failed + $categoryResults.Skipped
        
        # Extract individual test results if available
        $detailLines = $testOutput -split "`n" | Where-Object { $_ -match "^\s*✓|^\s*✗|^\s*-" }
        foreach ($line in $detailLines) {
            if ($line -match "✓\s*(.+?)\s*\[(\d+)ms\]") {
                Write-TestResult $matches[1] "PASS" ([int]$matches[2])
            }
            elseif ($line -match "✗\s*(.+?)\s*\[(\d+)ms\]") {
                Write-TestResult $matches[1] "FAIL" ([int]$matches[2])
                $categoryResults.Errors += "Test failed: $($matches[1])"
            }
            elseif ($line -match "-\s*(.+)") {
                Write-TestResult $matches[1] "SKIP"
            }
        }
        
        Write-Host ""
        Write-Host "  Category Summary:" -ForegroundColor Cyan
        Write-Host "    Total: $($categoryResults.Tests)" -ForegroundColor White
        Write-Host "    Passed: $($categoryResults.Passed)" -ForegroundColor Green
        Write-Host "    Failed: $($categoryResults.Failed)" -ForegroundColor Red
        Write-Host "    Skipped: $($categoryResults.Skipped)" -ForegroundColor Yellow
        
    }
    catch {
        Write-Host "  ERROR: Failed to run $CategoryName tests" -ForegroundColor Red
        Write-Host "  $($_.Exception.Message)" -ForegroundColor Red
        $categoryResults.Errors += "Category execution failed: $($_.Exception.Message)"
    }
    
    $TestResults.Categories[$CategoryName] = $categoryResults
    $TestResults.TotalTests += $categoryResults.Tests
    $TestResults.PassedTests += $categoryResults.Passed
    $TestResults.FailedTests += $categoryResults.Failed
    $TestResults.SkippedTests += $categoryResults.Skipped
    $TestResults.Errors += $categoryResults.Errors
    
    Write-Host ""
}

# Run test categories based on parameter
switch ($TestCategory) {
    "Unit" {
        Invoke-TestCategory "Unit Tests" "TeamsMigrationPlanningViewModelTests" "Core ViewModel functionality"
    }
    "Integration" {
        Invoke-TestCategory "Integration Tests" "TeamsMigrationIntegrationTests" "ViewRegistry and navigation integration"
    }
    "DataModel" {
        Invoke-TestCategory "Data Model Tests" "TeamsDataModelTests" "Data model validation and calculations"
    }
    "UISimulation" {
        Invoke-TestCategory "UI Simulation Tests" "TeamsUISimulationTests" "UI functionality simulation"
    }
    "Performance" {
        Invoke-TestCategory "Performance Tests" "TeamsPerformanceTests" "Performance and scalability"
    }
    "All" {
        Invoke-TestCategory "Unit Tests" "TeamsMigrationPlanningViewModelTests" "Core ViewModel functionality"
        Invoke-TestCategory "Integration Tests" "TeamsMigrationIntegrationTests" "ViewRegistry and navigation integration"
        Invoke-TestCategory "Data Model Tests" "TeamsDataModelTests" "Data model validation and calculations"
        Invoke-TestCategory "UI Simulation Tests" "TeamsUISimulationTests" "UI functionality simulation"
        Invoke-TestCategory "Performance Tests" "TeamsPerformanceTests" "Performance and scalability"
    }
}

# Finalize results
$TestResults.EndTime = Get-Date
$duration = ($TestResults.EndTime - $TestResults.StartTime).TotalSeconds

# Display final summary
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Test Execution Summary" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Duration: $($duration.ToString('F2')) seconds" -ForegroundColor Green
Write-Host "Total Tests: $($TestResults.TotalTests)" -ForegroundColor White
Write-Host "Passed: $($TestResults.PassedTests)" -ForegroundColor Green
Write-Host "Failed: $($TestResults.FailedTests)" -ForegroundColor $(if($TestResults.FailedTests -gt 0) { "Red" } else { "Green" })
Write-Host "Skipped: $($TestResults.SkippedTests)" -ForegroundColor Yellow

$successRate = if ($TestResults.TotalTests -gt 0) { 
    ($TestResults.PassedTests / $TestResults.TotalTests * 100).ToString("F1") 
} else { 
    "N/A" 
}
Write-Host "Success Rate: $successRate%" -ForegroundColor $(if($TestResults.FailedTests -gt 0) { "Yellow" } else { "Green" })

# Show errors if any
if ($TestResults.Errors.Count -gt 0) {
    Write-Host ""
    Write-Host "Errors Encountered:" -ForegroundColor Red
    foreach ($error in $TestResults.Errors) {
        Write-Host "  • $error" -ForegroundColor Red
    }
}

# Generate HTML report if requested
if ($GenerateReport) {
    Write-Host ""
    Write-Host "Generating detailed test report..." -ForegroundColor Cyan
    
    $reportPath = Join-Path $OutputPath "TeamsTestReport.html"
    
    $html = @"
<!DOCTYPE html>
<html>
<head>
    <title>Teams Migration Platform Test Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { background-color: #f0f0f0; padding: 15px; border-radius: 5px; margin-bottom: 20px; }
        .summary { background-color: #e8f5e8; padding: 10px; border-radius: 5px; margin-bottom: 20px; }
        .category { margin-bottom: 30px; border: 1px solid #ddd; border-radius: 5px; overflow: hidden; }
        .category-header { background-color: #333; color: white; padding: 10px; font-weight: bold; }
        .category-content { padding: 15px; }
        .metric { display: inline-block; margin-right: 20px; }
        .passed { color: #28a745; font-weight: bold; }
        .failed { color: #dc3545; font-weight: bold; }
        .skipped { color: #ffc107; font-weight: bold; }
        .error { color: #dc3545; margin: 5px 0; }
        table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
        .test-recommendations { background-color: #fff3cd; padding: 15px; border-radius: 5px; margin-top: 20px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Teams Migration Platform - Test Report</h1>
        <p><strong>Generated:</strong> $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')</p>
        <p><strong>Test Category:</strong> $TestCategory</p>
        <p><strong>Duration:</strong> $($duration.ToString('F2')) seconds</p>
    </div>
    
    <div class="summary">
        <h2>Executive Summary</h2>
        <div class="metric">Total Tests: <strong>$($TestResults.TotalTests)</strong></div>
        <div class="metric passed">Passed: $($TestResults.PassedTests)</div>
        <div class="metric failed">Failed: $($TestResults.FailedTests)</div>
        <div class="metric skipped">Skipped: $($TestResults.SkippedTests)</div>
        <div class="metric">Success Rate: <strong>$successRate%</strong></div>
    </div>
"@

    # Add category details
    foreach ($category in $TestResults.Categories.GetEnumerator()) {
        $catName = $category.Key
        $catData = $category.Value
        
        $html += @"
    <div class="category">
        <div class="category-header">$catName</div>
        <div class="category-content">
            <div class="metric">Tests: $($catData.Tests)</div>
            <div class="metric passed">Passed: $($catData.Passed)</div>
            <div class="metric failed">Failed: $($catData.Failed)</div>
            <div class="metric skipped">Skipped: $($catData.Skipped)</div>
"@
        
        if ($catData.Errors.Count -gt 0) {
            $html += "<h4>Errors:</h4>"
            foreach ($error in $catData.Errors) {
                $html += "<div class='error'>• $error</div>"
            }
        }
        
        $html += @"
        </div>
    </div>
"@
    }
    
    # Add recommendations
    $html += @"
    <div class="test-recommendations">
        <h2>Quality Assessment & Recommendations</h2>
"@
    
    if ($TestResults.FailedTests -eq 0) {
        $html += "<p><strong>✅ All tests passed!</strong> The Teams migration platform is functioning correctly.</p>"
    } else {
        $html += "<p><strong>⚠️ Some tests failed.</strong> Please review the failed tests and address the issues before deployment.</p>"
    }
    
    $html += @"
        <h3>Test Coverage Analysis:</h3>
        <ul>
            <li><strong>Unit Tests:</strong> Validates core ViewModel functionality, commands, and property calculations</li>
            <li><strong>Integration Tests:</strong> Ensures ViewRegistry registration and navigation work correctly</li>
            <li><strong>Data Model Tests:</strong> Validates TeamsDiscoveryItem and ChannelDiscoveryItem properties and calculations</li>
            <li><strong>UI Simulation Tests:</strong> Tests data binding, filtering, search, and progress indicators</li>
            <li><strong>Performance Tests:</strong> Validates performance with realistic data volumes and memory usage</li>
        </ul>
        
        <h3>Key Quality Metrics:</h3>
        <ul>
            <li>Teams Discovery: Should complete within 10 seconds</li>
            <li>Content Analysis: Should complete within 15 seconds</li>
            <li>UI Filtering: Should respond within 100ms</li>
            <li>Memory Usage: Should not exceed 100MB during operations</li>
            <li>Success Rate: Target >95% for production readiness</li>
        </ul>
    </div>
    
</body>
</html>
"@
    
    $html | Out-File -FilePath $reportPath -Encoding UTF8
    Write-Host "Test report generated: $reportPath" -ForegroundColor Green
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan

# Set exit code based on test results
if ($TestResults.FailedTests -gt 0) {
    Write-Host "Test execution completed with FAILURES" -ForegroundColor Red
    exit 1
} else {
    Write-Host "Test execution completed SUCCESSFULLY" -ForegroundColor Green
    exit 0
}