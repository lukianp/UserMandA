# Test Runner for T-031 Pre-Migration Eligibility Checks and User/Data Mapping
# Executes comprehensive test suite and generates validation report

param(
    [string]$OutputPath = "C:\discoverydata\ljpops\Logs\TestResults",
    [switch]$GenerateHtml,
    [switch]$SkipPester,
    [switch]$SkipUnit,
    [switch]$SkipFunctional,
    [string]$Filter = "*"
)

$ErrorActionPreference = "Continue"
$script:TestResults = @{
    Status = "UNKNOWN"
    Suites = @{
        CSharpUnit = @{ Status = "NOT_RUN"; Tests = 0; Passed = 0; Failed = 0; Duration = 0 }
        PesterModules = @{ Status = "NOT_RUN"; Tests = 0; Passed = 0; Failed = 0; Duration = 0 }
        FunctionalSim = @{ Status = "NOT_RUN"; Tests = 0; Passed = 0; Failed = 0; Duration = 0 }
    }
    CsvValidation = @{
        CheckedPaths = @()
        MissingColumns = @()
        BadTypes = @()
        RecordCountDelta = @()
    }
    Artifacts = @{
        ReportPaths = @()
        LogPaths = @()
    }
    FunctionalCases = @()
}

# Ensure output directory exists
if (!(Test-Path $OutputPath)) {
    New-Item -ItemType Directory -Path $OutputPath -Force | Out-Null
}

Write-Host "=== T-031 Pre-Migration Check Test Suite ===" -ForegroundColor Cyan
Write-Host "Starting comprehensive test validation for Pre-Migration Eligibility Checks" -ForegroundColor White
Write-Host ""

# C# Unit Tests
if (-not $SkipUnit) {
    Write-Host "1. Running C# Unit Tests..." -ForegroundColor Yellow
    $unitTestStartTime = Get-Date
    
    try {
        $testProjectPath = Join-Path $PSScriptRoot "..\..\Tests\Migration\MigrationTestSuite.csproj"
        
        if (Test-Path $testProjectPath) {
            $unitTestResults = dotnet test $testProjectPath --filter "TestCategory!=Functional&TestCategory!=Integration" --logger "trx;LogFileName=UnitTests.trx" --logger "console;verbosity=detailed" --results-directory $OutputPath --no-build 2>&1
            
            $unitTestEndTime = Get-Date
            $unitTestDuration = ($unitTestEndTime - $unitTestStartTime).TotalSeconds
            
            # Parse test results from TRX file
            $trxFile = Get-ChildItem -Path $OutputPath -Filter "UnitTests.trx" -ErrorAction SilentlyContinue | Select-Object -First 1
            if ($trxFile) {
                [xml]$trxContent = Get-Content $trxFile.FullName
                $testRunResults = $trxContent.TestRun.Results.UnitTestResult
                
                $script:TestResults.Suites.CSharpUnit.Tests = $testRunResults.Count
                $script:TestResults.Suites.CSharpUnit.Passed = ($testRunResults | Where-Object { $_.outcome -eq "Passed" }).Count
                $script:TestResults.Suites.CSharpUnit.Failed = ($testRunResults | Where-Object { $_.outcome -eq "Failed" }).Count
                $script:TestResults.Suites.CSharpUnit.Duration = $unitTestDuration
                $script:TestResults.Suites.CSharpUnit.Status = if ($script:TestResults.Suites.CSharpUnit.Failed -eq 0) { "PASS" } else { "FAIL" }
                
                $script:TestResults.Artifacts.ReportPaths += $trxFile.FullName
                
                Write-Host "   ✓ Unit Tests: $($script:TestResults.Suites.CSharpUnit.Passed) passed, $($script:TestResults.Suites.CSharpUnit.Failed) failed" -ForegroundColor Green
            }
        } else {
            Write-Host "   ✗ Test project not found: $testProjectPath" -ForegroundColor Red
            $script:TestResults.Suites.CSharpUnit.Status = "FAIL"
        }
    }
    catch {
        Write-Host "   ✗ Unit test execution failed: $($_.Exception.Message)" -ForegroundColor Red
        $script:TestResults.Suites.CSharpUnit.Status = "FAIL"
    }
    
    Write-Host ""
}

# Pester Module Tests
if (-not $SkipPester -and (Get-Module -ListAvailable -Name Pester)) {
    Write-Host "2. Running PowerShell/Pester Tests..." -ForegroundColor Yellow
    $pesterStartTime = Get-Date
    
    try {
        $pesterTestPath = Join-Path $PSScriptRoot "PowerShell\Test-PreMigrationCheckModule.ps1"
        
        if (Test-Path $pesterTestPath) {
            Import-Module Pester -Force
            
            $pesterConfig = New-PesterConfiguration
            $pesterConfig.Run.Path = $pesterTestPath
            $pesterConfig.Output.Verbosity = 'Detailed'
            $pesterConfig.TestResult.Enabled = $true
            $pesterConfig.TestResult.OutputPath = Join-Path $OutputPath "PesterResults.xml"
            $pesterConfig.TestResult.OutputFormat = 'NUnitXml'
            
            $pesterResults = Invoke-Pester -Configuration $pesterConfig
            
            $pesterEndTime = Get-Date
            $pesterDuration = ($pesterEndTime - $pesterStartTime).TotalSeconds
            
            $script:TestResults.Suites.PesterModules.Tests = $pesterResults.TotalCount
            $script:TestResults.Suites.PesterModules.Passed = $pesterResults.PassedCount
            $script:TestResults.Suites.PesterModules.Failed = $pesterResults.FailedCount
            $script:TestResults.Suites.PesterModules.Duration = $pesterDuration
            $script:TestResults.Suites.PesterModules.Status = if ($pesterResults.FailedCount -eq 0) { "PASS" } else { "FAIL" }
            
            $script:TestResults.Artifacts.ReportPaths += $pesterConfig.TestResult.OutputPath
            
            Write-Host "   ✓ Pester Tests: $($pesterResults.PassedCount) passed, $($pesterResults.FailedCount) failed" -ForegroundColor Green
        } else {
            Write-Host "   ✗ Pester test file not found: $pesterTestPath" -ForegroundColor Red
            $script:TestResults.Suites.PesterModules.Status = "FAIL"
        }
    }
    catch {
        Write-Host "   ✗ Pester test execution failed: $($_.Exception.Message)" -ForegroundColor Red
        $script:TestResults.Suites.PesterModules.Status = "FAIL"
    }
    
    Write-Host ""
} elseif (-not $SkipPester) {
    Write-Host "2. Skipping Pester Tests - Pester module not available" -ForegroundColor Yellow
    $script:TestResults.Suites.PesterModules.Status = "SKIPPED"
    Write-Host ""
}

# Functional Simulation Tests
if (-not $SkipFunctional) {
    Write-Host "3. Running Functional Simulation Tests..." -ForegroundColor Yellow
    $functionalStartTime = Get-Date
    
    try {
        $testProjectPath = Join-Path $PSScriptRoot "..\..\Tests\Migration\MigrationTestSuite.csproj"
        
        if (Test-Path $testProjectPath) {
            $functionalTestResults = dotnet test $testProjectPath --filter "TestCategory=Functional" --logger "trx;LogFileName=FunctionalTests.trx" --logger "console;verbosity=detailed" --results-directory $OutputPath --no-build 2>&1
            
            $functionalEndTime = Get-Date
            $functionalDuration = ($functionalEndTime - $functionalStartTime).TotalSeconds
            
            # Parse functional test results
            $functionalTrxFile = Get-ChildItem -Path $OutputPath -Filter "FunctionalTests.trx" -ErrorAction SilentlyContinue | Select-Object -First 1
            if ($functionalTrxFile) {
                [xml]$functionalTrxContent = Get-Content $functionalTrxFile.FullName
                $functionalTestRunResults = $functionalTrxContent.TestRun.Results.UnitTestResult
                
                $script:TestResults.Suites.FunctionalSim.Tests = $functionalTestRunResults.Count
                $script:TestResults.Suites.FunctionalSim.Passed = ($functionalTestRunResults | Where-Object { $_.outcome -eq "Passed" }).Count
                $script:TestResults.Suites.FunctionalSim.Failed = ($functionalTestRunResults | Where-Object { $_.outcome -eq "Failed" }).Count
                $script:TestResults.Suites.FunctionalSim.Duration = $functionalDuration
                $script:TestResults.Suites.FunctionalSim.Status = if ($script:TestResults.Suites.FunctionalSim.Failed -eq 0) { "PASS" } else { "FAIL" }
                
                # Extract functional case details for reporting
                foreach ($testResult in $functionalTestRunResults) {
                    $script:TestResults.FunctionalCases += @{
                        Name = $testResult.testName
                        Status = $testResult.outcome
                        Duration = $testResult.duration
                        Message = $testResult.Output.ErrorInfo.Message
                    }
                }
                
                $script:TestResults.Artifacts.ReportPaths += $functionalTrxFile.FullName
                
                Write-Host "   ✓ Functional Tests: $($script:TestResults.Suites.FunctionalSim.Passed) passed, $($script:TestResults.Suites.FunctionalSim.Failed) failed" -ForegroundColor Green
            }
        } else {
            Write-Host "   ✗ Test project not found for functional tests: $testProjectPath" -ForegroundColor Red
            $script:TestResults.Suites.FunctionalSim.Status = "FAIL"
        }
    }
    catch {
        Write-Host "   ✗ Functional test execution failed: $($_.Exception.Message)" -ForegroundColor Red
        $script:TestResults.Suites.FunctionalSim.Status = "FAIL"
    }
    
    Write-Host ""
}

# CSV Data Validation
Write-Host "4. Validating CSV Data Integrity..." -ForegroundColor Yellow

$csvValidationStartTime = Get-Date
$csvPaths = @(
    "C:\discoverydata\ljpops\RawData\Users.csv",
    "C:\discoverydata\ljpops\RawData\Mailboxes.csv", 
    "C:\discoverydata\ljpops\RawData\FileShares.csv",
    "C:\discoverydata\ljpops\RawData\Databases.csv"
)

$mandatoryColumns = @{
    "Users.csv" = @("Sid", "DisplayName", "UPN", "Enabled", "Sam")
    "Mailboxes.csv" = @("UPN", "SizeMB", "Type", "PrimarySMTP")
    "FileShares.csv" = @("Path", "Name", "SizeGB", "Owner")
    "Databases.csv" = @("Server", "Instance", "Database", "SizeGB")
}

foreach ($csvPath in $csvPaths) {
    $csvFileName = Split-Path $csvPath -Leaf
    $script:TestResults.CsvValidation.CheckedPaths += $csvPath
    
    if (Test-Path $csvPath) {
        try {
            Write-Host "   Validating $csvFileName..." -ForegroundColor Gray
            
            # Check file is not locked
            $fileStream = $null
            try {
                $fileStream = [System.IO.File]::Open($csvPath, [System.IO.FileMode]::Open, [System.IO.FileAccess]::Read, [System.IO.FileShare]::Read)
                $fileStream.Close()
                
                # Read CSV and validate structure
                $csvContent = Import-Csv $csvPath -ErrorAction Stop
                $headers = (Get-Content $csvPath -First 1).Split(',')
                
                # Check mandatory columns
                $requiredColumns = $mandatoryColumns[$csvFileName]
                if ($requiredColumns) {
                    $missingColumns = $requiredColumns | Where-Object { $_ -notin $headers }
                    if ($missingColumns) {
                        $script:TestResults.CsvValidation.MissingColumns += @{
                            File = $csvFileName
                            Missing = $missingColumns
                        }
                        Write-Host "     ✗ Missing columns: $($missingColumns -join ', ')" -ForegroundColor Red
                    } else {
                        Write-Host "     ✓ All mandatory columns present" -ForegroundColor Green
                    }
                }
                
                # Validate data types
                $typeErrors = @()
                if ($csvFileName -eq "Users.csv" -and "Enabled" -in $headers) {
                    $invalidEnabled = $csvContent | Where-Object { 
                        $_.Enabled -notin @("true", "false", "True", "False", "1", "0") -and 
                        ![string]::IsNullOrEmpty($_.Enabled) 
                    }
                    if ($invalidEnabled) {
                        $typeErrors += "Invalid boolean values in Enabled column"
                    }
                }
                
                if ($csvFileName -eq "Mailboxes.csv" -and "SizeMB" -in $headers) {
                    $invalidSizes = $csvContent | Where-Object { 
                        ![string]::IsNullOrEmpty($_.SizeMB) -and 
                        ![int]::TryParse($_.SizeMB, [ref]$null) 
                    }
                    if ($invalidSizes) {
                        $typeErrors += "Invalid numeric values in SizeMB column"
                    }
                }
                
                if ($typeErrors) {
                    $script:TestResults.CsvValidation.BadTypes += @{
                        File = $csvFileName
                        Errors = $typeErrors
                    }
                    Write-Host "     ✗ Data type errors: $($typeErrors -join ', ')" -ForegroundColor Red
                } else {
                    Write-Host "     ✓ Data types valid" -ForegroundColor Green
                }
                
                # Record count
                $recordCount = $csvContent.Count
                $script:TestResults.CsvValidation.RecordCountDelta += @{
                    File = $csvFileName
                    Count = $recordCount
                    Timestamp = Get-Date
                }
                Write-Host "     ℹ Record count: $recordCount" -ForegroundColor Cyan
                
            }
            catch {
                Write-Host "     ✗ File is locked or inaccessible: $($_.Exception.Message)" -ForegroundColor Red
            }
            finally {
                if ($fileStream) {
                    $fileStream.Close()
                }
            }
        }
        catch {
            Write-Host "     ✗ CSV validation failed: $($_.Exception.Message)" -ForegroundColor Red
            $script:TestResults.CsvValidation.BadTypes += @{
                File = $csvFileName
                Errors = @($_.Exception.Message)
            }
        }
    } else {
        Write-Host "   ⚠ File not found: $csvPath" -ForegroundColor Yellow
    }
}

$csvValidationEndTime = Get-Date
$csvValidationDuration = ($csvValidationEndTime - $csvValidationStartTime).TotalSeconds
Write-Host "   CSV validation completed in $([math]::Round($csvValidationDuration, 2)) seconds" -ForegroundColor Gray

Write-Host ""

# Overall Status Determination
$totalPassed = $script:TestResults.Suites.CSharpUnit.Passed + $script:TestResults.Suites.PesterModules.Passed + $script:TestResults.Suites.FunctionalSim.Passed
$totalFailed = $script:TestResults.Suites.CSharpUnit.Failed + $script:TestResults.Suites.PesterModules.Failed + $script:TestResults.Suites.FunctionalSim.Failed
$totalTests = $totalPassed + $totalFailed

$csvIssues = $script:TestResults.CsvValidation.MissingColumns.Count + $script:TestResults.CsvValidation.BadTypes.Count

if ($totalFailed -eq 0 -and $csvIssues -eq 0) {
    $script:TestResults.Status = "PASS"
} elseif ($totalPassed -gt 0 -and $csvIssues -eq 0) {
    $script:TestResults.Status = "PARTIAL"
} else {
    $script:TestResults.Status = "FAIL"
}

# Generate Reports
Write-Host "5. Generating Test Reports..." -ForegroundColor Yellow

# Generate JSON report for system processing
$jsonReportPath = Join-Path $OutputPath "PreMigrationTestResults.json"
$script:TestResults | ConvertTo-Json -Depth 10 | Set-Content -Path $jsonReportPath -Encoding UTF8
$script:TestResults.Artifacts.ReportPaths += $jsonReportPath

Write-Host "   ✓ JSON report generated: $jsonReportPath" -ForegroundColor Green

# Generate human-readable summary
$summaryReportPath = Join-Path $OutputPath "TestSummary.txt"
$summaryContent = @"
T-031 Pre-Migration Eligibility Checks Test Results
==================================================
Generated: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss UTC")
Overall Status: $($script:TestResults.Status)

Test Suite Results:
C# Unit Tests: $($script:TestResults.Suites.CSharpUnit.Status) ($($script:TestResults.Suites.CSharpUnit.Passed)/$($script:TestResults.Suites.CSharpUnit.Tests) passed, $($script:TestResults.Suites.CSharpUnit.Duration)s)
Pester Modules: $($script:TestResults.Suites.PesterModules.Status) ($($script:TestResults.Suites.PesterModules.Passed)/$($script:TestResults.Suites.PesterModules.Tests) passed, $($script:TestResults.Suites.PesterModules.Duration)s)
Functional Sim: $($script:TestResults.Suites.FunctionalSim.Status) ($($script:TestResults.Suites.FunctionalSim.Passed)/$($script:TestResults.Suites.FunctionalSim.Tests) passed, $($script:TestResults.Suites.FunctionalSim.Duration)s)

CSV Validation:
Checked Paths: $($script:TestResults.CsvValidation.CheckedPaths.Count)
Missing Columns: $($script:TestResults.CsvValidation.MissingColumns.Count) files
Data Type Errors: $($script:TestResults.CsvValidation.BadTypes.Count) files
Record Counts: $($script:TestResults.CsvValidation.RecordCountDelta.Count) files

Artifacts Generated:
$($script:TestResults.Artifacts.ReportPaths -join "`n")

Total Tests: $totalTests
Total Passed: $totalPassed  
Total Failed: $totalFailed
"@

$summaryContent | Set-Content -Path $summaryReportPath -Encoding UTF8
$script:TestResults.Artifacts.ReportPaths += $summaryReportPath

Write-Host "   ✓ Summary report generated: $summaryReportPath" -ForegroundColor Green

# Generate HTML report if requested
if ($GenerateHtml) {
    $htmlReportPath = Join-Path $OutputPath "TestResults.html"
    
    $htmlContent = @"
<!DOCTYPE html>
<html>
<head>
    <title>T-031 Pre-Migration Test Results</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { background-color: #f0f8ff; padding: 10px; border-left: 4px solid #4CAF50; }
        .pass { color: green; font-weight: bold; }
        .fail { color: red; font-weight: bold; }
        .partial { color: orange; font-weight: bold; }
        .section { margin: 20px 0; }
        table { border-collapse: collapse; width: 100%; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
        .status-pass { background-color: #d4edda; }
        .status-fail { background-color: #f8d7da; }
        .status-partial { background-color: #fff3cd; }
    </style>
</head>
<body>
    <div class="header">
        <h1>T-031 Pre-Migration Eligibility Checks Test Results</h1>
        <p><strong>Generated:</strong> $(Get-Date -Format "yyyy-MM-dd HH:mm:ss UTC")</p>
        <p><strong>Overall Status:</strong> <span class="$($script:TestResults.Status.ToLower())">$($script:TestResults.Status)</span></p>
    </div>
    
    <div class="section">
        <h2>Test Suite Summary</h2>
        <table>
            <tr><th>Suite</th><th>Status</th><th>Tests</th><th>Passed</th><th>Failed</th><th>Duration (s)</th></tr>
            <tr class="status-$($script:TestResults.Suites.CSharpUnit.Status.ToLower())">
                <td>C# Unit Tests</td><td>$($script:TestResults.Suites.CSharpUnit.Status)</td>
                <td>$($script:TestResults.Suites.CSharpUnit.Tests)</td>
                <td>$($script:TestResults.Suites.CSharpUnit.Passed)</td>
                <td>$($script:TestResults.Suites.CSharpUnit.Failed)</td>
                <td>$($script:TestResults.Suites.CSharpUnit.Duration)</td>
            </tr>
            <tr class="status-$($script:TestResults.Suites.PesterModules.Status.ToLower())">
                <td>Pester Modules</td><td>$($script:TestResults.Suites.PesterModules.Status)</td>
                <td>$($script:TestResults.Suites.PesterModules.Tests)</td>
                <td>$($script:TestResults.Suites.PesterModules.Passed)</td>
                <td>$($script:TestResults.Suites.PesterModules.Failed)</td>
                <td>$($script:TestResults.Suites.PesterModules.Duration)</td>
            </tr>
            <tr class="status-$($script:TestResults.Suites.FunctionalSim.Status.ToLower())">
                <td>Functional Simulation</td><td>$($script:TestResults.Suites.FunctionalSim.Status)</td>
                <td>$($script:TestResults.Suites.FunctionalSim.Tests)</td>
                <td>$($script:TestResults.Suites.FunctionalSim.Passed)</td>
                <td>$($script:TestResults.Suites.FunctionalSim.Failed)</td>
                <td>$($script:TestResults.Suites.FunctionalSim.Duration)</td>
            </tr>
        </table>
    </div>
    
    <div class="section">
        <h2>CSV Validation Results</h2>
        <p><strong>Files Checked:</strong> $($script:TestResults.CsvValidation.CheckedPaths.Count)</p>
        <p><strong>Column Issues:</strong> $($script:TestResults.CsvValidation.MissingColumns.Count) files</p>
        <p><strong>Data Type Issues:</strong> $($script:TestResults.CsvValidation.BadTypes.Count) files</p>
    </div>
</body>
</html>
"@

    $htmlContent | Set-Content -Path $htmlReportPath -Encoding UTF8
    $script:TestResults.Artifacts.ReportPaths += $htmlReportPath
    
    Write-Host "   ✓ HTML report generated: $htmlReportPath" -ForegroundColor Green
}

Write-Host ""

# Final Summary
Write-Host "=== Test Execution Complete ===" -ForegroundColor Cyan
Write-Host ""

$statusColor = switch ($script:TestResults.Status) {
    "PASS" { "Green" }
    "PARTIAL" { "Yellow" }  
    "FAIL" { "Red" }
    default { "White" }
}

Write-Host "Overall Status: " -NoNewline
Write-Host $script:TestResults.Status -ForegroundColor $statusColor
Write-Host "Total Tests: $totalTests (Passed: $totalPassed, Failed: $totalFailed)" -ForegroundColor White
Write-Host "CSV Validation: $($script:TestResults.CsvValidation.CheckedPaths.Count) files checked" -ForegroundColor White
Write-Host ""

if ($script:TestResults.CsvValidation.MissingColumns.Count -gt 0) {
    Write-Host "CSV Issues Found:" -ForegroundColor Yellow
    foreach ($issue in $script:TestResults.CsvValidation.MissingColumns) {
        Write-Host "  - $($issue.File): Missing columns $($issue.Missing -join ', ')" -ForegroundColor Red
    }
    Write-Host ""
}

if ($script:TestResults.CsvValidation.BadTypes.Count -gt 0) {
    Write-Host "Data Type Issues Found:" -ForegroundColor Yellow
    foreach ($issue in $script:TestResults.CsvValidation.BadTypes) {
        Write-Host "  - $($issue.File): $($issue.Errors -join ', ')" -ForegroundColor Red
    }
    Write-Host ""
}

Write-Host "Reports generated in: $OutputPath" -ForegroundColor Cyan
$script:TestResults.Artifacts.ReportPaths | ForEach-Object {
    Write-Host "  - $(Split-Path $_ -Leaf)" -ForegroundColor Gray
}

Write-Host ""
Write-Host "Handoff to documentation-qa-guardian for final validation review." -ForegroundColor Magenta

# Return test results for further processing
return $script:TestResults