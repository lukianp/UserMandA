#Requires -Version 5.1

<#
.SYNOPSIS
    Comprehensive test runner for the M&A Migration Platform

.DESCRIPTION
    This script executes all migration platform tests including:
    - C# Unit Tests (MSTest)
    - PowerShell Module Tests (Pester)
    - Integration Tests
    - Performance Tests
    - Build Validation Tests

.PARAMETER TestType
    Type of tests to run: All, Unit, Integration, PowerShell, Performance, Build

.PARAMETER GenerateReport
    Generate detailed HTML and JSON test reports

.PARAMETER OutputPath
    Path to output test results and reports

.PARAMETER Parallel
    Run tests in parallel where possible

.PARAMETER Coverage
    Generate code coverage reports

.EXAMPLE
    .\Run-MigrationTests.ps1 -TestType All -GenerateReport -OutputPath "C:\TestResults"

.EXAMPLE
    .\Run-MigrationTests.ps1 -TestType PowerShell -Parallel
#>

[CmdletBinding()]
param(
    [ValidateSet('All', 'Unit', 'Integration', 'PowerShell', 'Performance', 'Build')]
    [string]$TestType = 'All',
    
    [switch]$GenerateReport,
    
    [string]$OutputPath = (Join-Path $PSScriptRoot "TestResults"),
    
    [switch]$Parallel,
    
    [switch]$Coverage,
    
    [int]$TimeoutMinutes = 30,
    
    [switch]$ContinueOnFailure
)

# Import required modules
Import-Module Pester -Force -ErrorAction SilentlyContinue
if (-not (Get-Module Pester)) {
    Write-Error "Pester module is required. Install with: Install-Module Pester -Force"
    exit 1
}

# Global test configuration
$Script:TestConfig = @{
    StartTime = Get-Date
    TestResults = @()
    OverallStatus = 'Running'
    TotalTests = 0
    PassedTests = 0
    FailedTests = 0
    SkippedTests = 0
    OutputPath = $OutputPath
    LogPath = Join-Path $OutputPath "TestExecution.log"
}

# Ensure output directory exists
if (-not (Test-Path $OutputPath)) {
    New-Item -ItemType Directory -Path $OutputPath -Force | Out-Null
}

function Write-TestLog {
    param(
        [string]$Message,
        [ValidateSet('INFO', 'WARNING', 'ERROR', 'SUCCESS')]
        [string]$Level = 'INFO'
    )
    
    $timestamp = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
    $logEntry = "[$timestamp] [$Level] $Message"
    
    # Write to console with colors
    switch ($Level) {
        'ERROR' { Write-Host $logEntry -ForegroundColor Red }
        'WARNING' { Write-Host $logEntry -ForegroundColor Yellow }
        'SUCCESS' { Write-Host $logEntry -ForegroundColor Green }
        default { Write-Host $logEntry -ForegroundColor White }
    }
    
    # Write to log file
    Add-Content -Path $Script:TestConfig.LogPath -Value $logEntry -ErrorAction SilentlyContinue
}

function Test-Prerequisites {
    Write-TestLog "Checking test prerequisites..." "INFO"
    
    $missing = @()
    
    # Check for .NET SDK
    if (-not (Get-Command dotnet -ErrorAction SilentlyContinue)) {
        $missing += ".NET SDK"
    }
    
    # Check for PowerShell modules
    $requiredModules = @('Pester')
    foreach ($module in $requiredModules) {
        if (-not (Get-Module $module -ListAvailable)) {
            $missing += "PowerShell module: $module"
        }
    }
    
    # Check for test project files
    $testProjectPath = Join-Path $PSScriptRoot "MigrationTestSuite.csproj"
    if (-not (Test-Path $testProjectPath)) {
        $missing += "Test project file: $testProjectPath"
    }
    
    if ($missing.Count -gt 0) {
        Write-TestLog "Missing prerequisites:" "ERROR"
        $missing | ForEach-Object { Write-TestLog "  - $_" "ERROR" }
        return $false
    }
    
    Write-TestLog "All prerequisites satisfied" "SUCCESS"
    return $true
}

function Invoke-CSharpUnitTests {
    Write-TestLog "Running C# Unit Tests..." "INFO"
    
    try {
        $testProjectPath = Join-Path $PSScriptRoot "MigrationTestSuite.csproj"
        $resultsPath = Join-Path $OutputPath "CSharpUnitTests.trx"
        
        $dotnetArgs = @(
            'test'
            $testProjectPath
            '--logger', "trx;LogFileName=$resultsPath"
            '--verbosity', 'normal'
        )
        
        if ($Coverage) {
            $coveragePath = Join-Path $OutputPath "CSharpCoverage.xml"
            $dotnetArgs += '--collect', 'XPlat Code Coverage'
            $dotnetArgs += '--results-directory', $OutputPath
        }
        
        $result = & dotnet @dotnetArgs
        $exitCode = $LASTEXITCODE
        
        if ($exitCode -eq 0) {
            Write-TestLog "C# Unit Tests completed successfully" "SUCCESS"
            return @{
                Status = 'Passed'
                ExitCode = $exitCode
                ResultsFile = $resultsPath
                Output = $result
            }
        } else {
            Write-TestLog "C# Unit Tests failed with exit code $exitCode" "ERROR"
            return @{
                Status = 'Failed'
                ExitCode = $exitCode
                ResultsFile = $resultsPath
                Output = $result
            }
        }
    }
    catch {
        Write-TestLog "Error running C# Unit Tests: $($_.Exception.Message)" "ERROR"
        return @{
            Status = 'Error'
            ExitCode = -1
            Error = $_.Exception.Message
        }
    }
}

function Invoke-PowerShellModuleTests {
    param([switch]$Parallel)
    
    Write-TestLog "Running PowerShell Module Tests..." "INFO"
    
    try {
        $testFiles = Get-ChildItem -Path (Join-Path $PSScriptRoot "PowerShell") -Filter "*.Tests.ps1" -Recurse
        
        if ($testFiles.Count -eq 0) {
            Write-TestLog "No PowerShell test files found" "WARNING"
            return @{ Status = 'Skipped'; Message = 'No test files found' }
        }
        
        $pesterConfig = New-PesterConfiguration
        $pesterConfig.Run.Path = $testFiles.FullName
        $pesterConfig.Output.Verbosity = 'Detailed'
        $pesterConfig.TestResult.Enabled = $true
        $pesterConfig.TestResult.OutputPath = Join-Path $OutputPath "PowerShellTests.xml"
        $pesterConfig.TestResult.OutputFormat = 'NUnitXml'
        
        if ($Coverage) {
            $pesterConfig.CodeCoverage.Enabled = $true
            $pesterConfig.CodeCoverage.Path = Join-Path $PSScriptRoot "..\..\Modules\Migration\*.psm1"
            $pesterConfig.CodeCoverage.OutputPath = Join-Path $OutputPath "PowerShellCoverage.xml"
        }
        
        if ($Parallel) {
            # Note: Pester 5+ has parallel execution capabilities
            Write-TestLog "Running PowerShell tests in parallel mode" "INFO"
        }
        
        $result = Invoke-Pester -Configuration $pesterConfig
        
        if ($result.Failed -eq 0) {
            Write-TestLog "PowerShell Module Tests completed successfully" "SUCCESS"
            Write-TestLog "Passed: $($result.Passed), Failed: $($result.Failed), Skipped: $($result.Skipped)" "INFO"
            return @{
                Status = 'Passed'
                Result = $result
                ResultsFile = $pesterConfig.TestResult.OutputPath
            }
        } else {
            Write-TestLog "PowerShell Module Tests failed" "ERROR"
            Write-TestLog "Passed: $($result.Passed), Failed: $($result.Failed), Skipped: $($result.Skipped)" "ERROR"
            return @{
                Status = 'Failed'
                Result = $result
                ResultsFile = $pesterConfig.TestResult.OutputPath
            }
        }
    }
    catch {
        Write-TestLog "Error running PowerShell Module Tests: $($_.Exception.Message)" "ERROR"
        return @{
            Status = 'Error'
            Error = $_.Exception.Message
        }
    }
}

function Invoke-IntegrationTests {
    Write-TestLog "Running Integration Tests..." "INFO"
    
    try {
        $testProjectPath = Join-Path $PSScriptRoot "MigrationTestSuite.csproj"
        $resultsPath = Join-Path $OutputPath "IntegrationTests.trx"
        
        $dotnetArgs = @(
            'test'
            $testProjectPath
            '--filter', 'Category=Integration'
            '--logger', "trx;LogFileName=$resultsPath"
            '--verbosity', 'normal'
        )
        
        $result = & dotnet @dotnetArgs
        $exitCode = $LASTEXITCODE
        
        if ($exitCode -eq 0) {
            Write-TestLog "Integration Tests completed successfully" "SUCCESS"
            return @{
                Status = 'Passed'
                ExitCode = $exitCode
                ResultsFile = $resultsPath
                Output = $result
            }
        } else {
            Write-TestLog "Integration Tests failed with exit code $exitCode" "ERROR"
            return @{
                Status = 'Failed'
                ExitCode = $exitCode
                ResultsFile = $resultsPath
                Output = $result
            }
        }
    }
    catch {
        Write-TestLog "Error running Integration Tests: $($_.Exception.Message)" "ERROR"
        return @{
            Status = 'Error'
            ExitCode = -1
            Error = $_.Exception.Message
        }
    }
}

function Invoke-PerformanceTests {
    Write-TestLog "Running Performance Tests..." "INFO"
    
    try {
        $testProjectPath = Join-Path $PSScriptRoot "MigrationTestSuite.csproj"
        $resultsPath = Join-Path $OutputPath "PerformanceTests.trx"
        
        $dotnetArgs = @(
            'test'
            $testProjectPath
            '--filter', 'Category=Performance'
            '--logger', "trx;LogFileName=$resultsPath"
            '--verbosity', 'normal'
        )
        
        $result = & dotnet @dotnetArgs
        $exitCode = $LASTEXITCODE
        
        if ($exitCode -eq 0) {
            Write-TestLog "Performance Tests completed successfully" "SUCCESS"
            return @{
                Status = 'Passed'
                ExitCode = $exitCode
                ResultsFile = $resultsPath
                Output = $result
            }
        } else {
            Write-TestLog "Performance Tests failed with exit code $exitCode" "ERROR"
            return @{
                Status = 'Failed'
                ExitCode = $exitCode
                ResultsFile = $resultsPath
                Output = $result
            }
        }
    }
    catch {
        Write-TestLog "Error running Performance Tests: $($_.Exception.Message)" "ERROR"
        return @{
            Status = 'Error'
            ExitCode = -1
            Error = $_.Exception.Message
        }
    }
}

function Invoke-BuildValidationTests {
    Write-TestLog "Running Build Validation Tests..." "INFO"
    
    try {
        # Test GUI compilation
        $guiProjectPath = Join-Path $PSScriptRoot "..\..\GUI\MandADiscoverySuite.csproj"
        Write-TestLog "Building GUI project..." "INFO"
        
        $buildResult = & dotnet build $guiProjectPath --verbosity normal
        $buildExitCode = $LASTEXITCODE
        
        if ($buildExitCode -ne 0) {
            Write-TestLog "GUI build failed" "ERROR"
            return @{
                Status = 'Failed'
                Component = 'GUI Build'
                ExitCode = $buildExitCode
                Output = $buildResult
            }
        }
        
        # Test PowerShell module loading
        Write-TestLog "Testing PowerShell module loading..." "INFO"
        $moduleErrors = @()
        
        $migrationModules = Get-ChildItem -Path (Join-Path $PSScriptRoot "..\..\Modules\Migration") -Filter "*.psm1"
        foreach ($module in $migrationModules) {
            try {
                Import-Module $module.FullName -Force -ErrorAction Stop
                Write-TestLog "Successfully loaded module: $($module.Name)" "INFO"
                Remove-Module $module.BaseName -Force -ErrorAction SilentlyContinue
            }
            catch {
                $moduleErrors += "Failed to load $($module.Name): $($_.Exception.Message)"
                Write-TestLog "Failed to load module $($module.Name): $($_.Exception.Message)" "ERROR"
            }
        }
        
        if ($moduleErrors.Count -gt 0) {
            return @{
                Status = 'Failed'
                Component = 'PowerShell Module Loading'
                Errors = $moduleErrors
            }
        }
        
        Write-TestLog "Build Validation Tests completed successfully" "SUCCESS"
        return @{
            Status = 'Passed'
            Component = 'Build Validation'
        }
    }
    catch {
        Write-TestLog "Error running Build Validation Tests: $($_.Exception.Message)" "ERROR"
        return @{
            Status = 'Error'
            Error = $_.Exception.Message
        }
    }
}

function New-TestReport {
    param([array]$TestResults)
    
    Write-TestLog "Generating test reports..." "INFO"
    
    $summary = @{
        StartTime = $Script:TestConfig.StartTime
        EndTime = Get-Date
        Duration = (Get-Date) - $Script:TestConfig.StartTime
        TestType = $TestType
        OverallStatus = if ($TestResults | Where-Object { $_.Status -eq 'Failed' -or $_.Status -eq 'Error' }) { 'Failed' } else { 'Passed' }
        Results = $TestResults
        Environment = @{
            PowerShellVersion = $PSVersionTable.PSVersion.ToString()
            DotNetVersion = if (Get-Command dotnet -ErrorAction SilentlyContinue) { (& dotnet --version) } else { 'Not Available' }
            OperatingSystem = [System.Environment]::OSVersion.ToString()
            MachineName = $env:COMPUTERNAME
        }
    }
    
    # Generate JSON report
    $jsonReportPath = Join-Path $OutputPath "TestReport.json"
    $summary | ConvertTo-Json -Depth 10 | Out-File -FilePath $jsonReportPath -Encoding UTF8
    Write-TestLog "JSON report generated: $jsonReportPath" "INFO"
    
    if ($GenerateReport) {
        # Generate HTML report
        $htmlReportPath = Join-Path $OutputPath "TestReport.html"
        $htmlContent = New-HtmlTestReport -Summary $summary
        $htmlContent | Out-File -FilePath $htmlReportPath -Encoding UTF8
        Write-TestLog "HTML report generated: $htmlReportPath" "INFO"
    }
    
    return $summary
}

function New-HtmlTestReport {
    param($Summary)
    
    $statusColor = if ($Summary.OverallStatus -eq 'Passed') { 'green' } else { 'red' }
    
    $html = @"
<!DOCTYPE html>
<html>
<head>
    <title>M&A Migration Platform Test Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { background-color: #f0f0f0; padding: 20px; border-radius: 5px; }
        .status-passed { color: green; font-weight: bold; }
        .status-failed { color: red; font-weight: bold; }
        .status-error { color: orange; font-weight: bold; }
        .test-section { margin: 20px 0; padding: 15px; border: 1px solid #ddd; border-radius: 5px; }
        .summary-table { width: 100%; border-collapse: collapse; }
        .summary-table th, .summary-table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        .summary-table th { background-color: #f2f2f2; }
    </style>
</head>
<body>
    <div class="header">
        <h1>M&A Migration Platform Test Report</h1>
        <p><strong>Status:</strong> <span class="status-$(($Summary.OverallStatus).ToLower())">$($Summary.OverallStatus)</span></p>
        <p><strong>Duration:</strong> $($Summary.Duration.ToString("hh\:mm\:ss"))</p>
        <p><strong>Generated:</strong> $($Summary.EndTime.ToString("yyyy-MM-dd HH:mm:ss"))</p>
    </div>
    
    <div class="test-section">
        <h2>Test Summary</h2>
        <table class="summary-table">
            <tr><th>Test Suite</th><th>Status</th><th>Details</th></tr>
"@
    
    foreach ($result in $Summary.Results) {
        $statusClass = "status-$(($result.Status).ToLower())"
        $details = if ($result.Error) { $result.Error } elseif ($result.ResultsFile) { "Results: $($result.ResultsFile)" } else { "N/A" }
        
        $html += @"
            <tr>
                <td>$($result.TestSuite)</td>
                <td><span class="$statusClass">$($result.Status)</span></td>
                <td>$details</td>
            </tr>
"@
    }
    
    $html += @"
        </table>
    </div>
    
    <div class="test-section">
        <h2>Environment Information</h2>
        <table class="summary-table">
            <tr><th>Property</th><th>Value</th></tr>
            <tr><td>PowerShell Version</td><td>$($Summary.Environment.PowerShellVersion)</td></tr>
            <tr><td>.NET Version</td><td>$($Summary.Environment.DotNetVersion)</td></tr>
            <tr><td>Operating System</td><td>$($Summary.Environment.OperatingSystem)</td></tr>
            <tr><td>Machine Name</td><td>$($Summary.Environment.MachineName)</td></tr>
        </table>
    </div>
</body>
</html>
"@
    
    return $html
}

# Main execution logic
function Main {
    Write-TestLog "Starting M&A Migration Platform Test Suite" "INFO"
    Write-TestLog "Test Type: $TestType, Output Path: $OutputPath" "INFO"
    
    if (-not (Test-Prerequisites)) {
        Write-TestLog "Prerequisites not met. Exiting." "ERROR"
        exit 1
    }
    
    $testResults = @()
    $overallSuccess = $true
    
    try {
        # Run tests based on TestType parameter
        switch ($TestType) {
            'All' {
                Write-TestLog "Running all test suites..." "INFO"
                
                if ($TestType -eq 'All' -or $TestType -eq 'Build') {
                    $buildResult = Invoke-BuildValidationTests
                    $buildResult.TestSuite = 'Build Validation'
                    $testResults += $buildResult
                    if ($buildResult.Status -ne 'Passed') { $overallSuccess = $false }
                }
                
                if ($TestType -eq 'All' -or $TestType -eq 'Unit') {
                    $unitResult = Invoke-CSharpUnitTests
                    $unitResult.TestSuite = 'C# Unit Tests'
                    $testResults += $unitResult
                    if ($unitResult.Status -ne 'Passed') { $overallSuccess = $false }
                }
                
                if ($TestType -eq 'All' -or $TestType -eq 'PowerShell') {
                    $psResult = Invoke-PowerShellModuleTests -Parallel:$Parallel
                    $psResult.TestSuite = 'PowerShell Module Tests'
                    $testResults += $psResult
                    if ($psResult.Status -ne 'Passed') { $overallSuccess = $false }
                }
                
                if ($TestType -eq 'All' -or $TestType -eq 'Integration') {
                    $integrationResult = Invoke-IntegrationTests
                    $integrationResult.TestSuite = 'Integration Tests'
                    $testResults += $integrationResult
                    if ($integrationResult.Status -ne 'Passed') { $overallSuccess = $false }
                }
                
                if ($TestType -eq 'All' -or $TestType -eq 'Performance') {
                    $perfResult = Invoke-PerformanceTests
                    $perfResult.TestSuite = 'Performance Tests'
                    $testResults += $perfResult
                    if ($perfResult.Status -ne 'Passed') { $overallSuccess = $false }
                }
            }
            'Unit' {
                $unitResult = Invoke-CSharpUnitTests
                $unitResult.TestSuite = 'C# Unit Tests'
                $testResults += $unitResult
                if ($unitResult.Status -ne 'Passed') { $overallSuccess = $false }
            }
            'PowerShell' {
                $psResult = Invoke-PowerShellModuleTests -Parallel:$Parallel
                $psResult.TestSuite = 'PowerShell Module Tests'
                $testResults += $psResult
                if ($psResult.Status -ne 'Passed') { $overallSuccess = $false }
            }
            'Integration' {
                $integrationResult = Invoke-IntegrationTests
                $integrationResult.TestSuite = 'Integration Tests'
                $testResults += $integrationResult
                if ($integrationResult.Status -ne 'Passed') { $overallSuccess = $false }
            }
            'Performance' {
                $perfResult = Invoke-PerformanceTests
                $perfResult.TestSuite = 'Performance Tests'
                $testResults += $perfResult
                if ($perfResult.Status -ne 'Passed') { $overallSuccess = $false }
            }
            'Build' {
                $buildResult = Invoke-BuildValidationTests
                $buildResult.TestSuite = 'Build Validation'
                $testResults += $buildResult
                if ($buildResult.Status -ne 'Passed') { $overallSuccess = $false }
            }
        }
        
        # Generate final report
        $finalReport = New-TestReport -TestResults $testResults
        
        # Display summary
        Write-TestLog "`n========== TEST EXECUTION SUMMARY ==========" "INFO"
        Write-TestLog "Overall Status: $($finalReport.OverallStatus)" $(if ($finalReport.OverallStatus -eq 'Passed') { 'SUCCESS' } else { 'ERROR' })
        Write-TestLog "Total Duration: $($finalReport.Duration.ToString("hh\:mm\:ss"))" "INFO"
        Write-TestLog "Test Suites Run: $($testResults.Count)" "INFO"
        
        foreach ($result in $testResults) {
            $logLevel = switch ($result.Status) {
                'Passed' { 'SUCCESS' }
                'Failed' { 'ERROR' }
                'Error' { 'ERROR' }
                default { 'WARNING' }
            }
            Write-TestLog "  $($result.TestSuite): $($result.Status)" $logLevel
        }
        
        Write-TestLog "Reports generated in: $OutputPath" "INFO"
        Write-TestLog "==============================================" "INFO"
        
        # Exit with appropriate code
        if ($overallSuccess) {
            Write-TestLog "All tests completed successfully!" "SUCCESS"
            exit 0
        } else {
            Write-TestLog "Some tests failed. Check the detailed reports for more information." "ERROR"
            if (-not $ContinueOnFailure) {
                exit 1
            }
        }
    }
    catch {
        Write-TestLog "Critical error during test execution: $($_.Exception.Message)" "ERROR"
        Write-TestLog "Stack trace: $($_.ScriptStackTrace)" "ERROR"
        exit 1
    }
}

# Execute main function
Main