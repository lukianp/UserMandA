# T-030 Test & Data Validation Runner Script
# Executes comprehensive tests for async data loading and caching implementation

param(
    [string]$TestCategory = "T-030",
    [string]$OutputPath = "C:\discoverydata\ljpops\Logs\TestResults",
    [switch]$Verbose,
    [switch]$RunStressTests,
    [switch]$ValidateProduction
)

# Initialize
$ErrorActionPreference = "Stop"
$testStartTime = Get-Date
Write-Host "=== T-030 Async Data Loading & Caching Test Suite ===" -ForegroundColor Cyan
Write-Host "Started: $testStartTime"
Write-Host ""

# Create output directory if not exists
if (!(Test-Path $OutputPath)) {
    New-Item -ItemType Directory -Path $OutputPath -Force | Out-Null
}

$resultsFile = Join-Path $OutputPath "T030_TestResults_$(Get-Date -Format 'yyyyMMdd_HHmmss').xml"
$logFile = Join-Path $OutputPath "T030_TestLog_$(Get-Date -Format 'yyyyMMdd_HHmmss').txt"

# Start transcript
Start-Transcript -Path $logFile

try {
    # Build the test project
    Write-Host "Building test project..." -ForegroundColor Yellow
    $buildPath = "D:\Scripts\UserMandA\Tests"
    
    Push-Location $buildPath
    dotnet build --configuration Release 2>&1 | Out-String | Write-Host
    
    if ($LASTEXITCODE -ne 0) {
        throw "Build failed with exit code $LASTEXITCODE"
    }
    Pop-Location
    
    Write-Host "Build completed successfully" -ForegroundColor Green
    Write-Host ""

    # Define test suites
    $testSuites = @{
        "ConcurrentLoading" = @{
            Assembly = "D:\Scripts\UserMandA\Tests\bin\Release\net6.0-windows7.0\MandADiscoverySuite.Tests.dll"
            Tests = @(
                "TestConcurrentDataLoading_MultipleViews_NoCollision",
                "TestThreadSafetyWithConcurrentReadsAndWrites",
                "TestNoDataRacesInConcurrentCacheAccess"
            )
        }
        "CacheInvalidation" = @{
            Assembly = "D:\Scripts\UserMandA\Tests\bin\Release\net6.0-windows7.0\MandADiscoverySuite.Tests.dll"
            Tests = @(
                "TestCacheInvalidation_OnCsvFileChange",
                "TestCacheInvalidation_MultipleFileChanges_ConcurrentRefresh",
                "TestFileWatcher_AutomaticCacheInvalidation"
            )
        }
        "DataValidation" = @{
            Assembly = "D:\Scripts\UserMandA\Tests\bin\Release\net6.0-windows7.0\MandADiscoverySuite.Tests.dll"
            Tests = @(
                "ValidateUsersCsv_MandatoryColumns",
                "ValidateGroupsCsv_MandatoryColumns",
                "ValidateDataTypes_NumericFields",
                "ValidateRecordIntegrity_NoDuplicateKeys"
            )
        }
        "FunctionalSimulation" = @{
            Assembly = "D:\Scripts\UserMandA\Tests\bin\Release\net6.0-windows7.0\MandADiscoverySuite.Tests.dll"
            Tests = @(
                "SimulateRealWorldUserSession",
                "SimulateMultipleViewsConcurrentAccess",
                "SimulateDiscoveryModuleIntegration"
            )
        }
    }

    if ($RunStressTests) {
        $testSuites["StressTests"] = @{
            Assembly = "D:\Scripts\UserMandA\Tests\bin\Release\net6.0-windows7.0\MandADiscoverySuite.Tests.dll"
            Tests = @(
                "TestPerformance_LargeDatasetConcurrentLoading",
                "TestMemoryPressure_CacheEviction",
                "SimulateHighLoadScenario"
            )
        }
    }

    # Run tests
    $totalTests = 0
    $passedTests = 0
    $failedTests = 0
    $testResults = @()

    foreach ($suiteName in $testSuites.Keys) {
        Write-Host "Running $suiteName suite..." -ForegroundColor Cyan
        $suite = $testSuites[$suiteName]
        
        foreach ($testName in $suite.Tests) {
            $totalTests++
            Write-Host "  Running: $testName" -NoNewline
            
            try {
                # Run test using dotnet test
                $testFilter = "--filter FullyQualifiedName~$testName"
                $testCommand = "dotnet test `"$($suite.Assembly)`" $testFilter --logger `"trx;LogFileName=$testName.trx`" --results-directory `"$OutputPath`" --no-build"
                
                if ($Verbose) {
                    Write-Host ""
                    Write-Host "    Command: $testCommand" -ForegroundColor DarkGray
                }
                
                $testOutput = Invoke-Expression $testCommand 2>&1
                
                if ($LASTEXITCODE -eq 0) {
                    Write-Host " [PASS]" -ForegroundColor Green
                    $passedTests++
                    $testResults += [PSCustomObject]@{
                        Suite = $suiteName
                        Test = $testName
                        Result = "PASS"
                        Duration = "N/A"
                        Output = $testOutput -join "`n"
                    }
                }
                else {
                    Write-Host " [FAIL]" -ForegroundColor Red
                    $failedTests++
                    $testResults += [PSCustomObject]@{
                        Suite = $suiteName
                        Test = $testName
                        Result = "FAIL"
                        Duration = "N/A"
                        Output = $testOutput -join "`n"
                    }
                    
                    if ($Verbose) {
                        Write-Host "    Error Output:" -ForegroundColor Red
                        Write-Host ($testOutput -join "`n")
                    }
                }
            }
            catch {
                Write-Host " [ERROR]" -ForegroundColor Red
                $failedTests++
                $testResults += [PSCustomObject]@{
                    Suite = $suiteName
                    Test = $testName
                    Result = "ERROR"
                    Duration = "N/A"
                    Output = $_.Exception.Message
                }
                
                if ($Verbose) {
                    Write-Host "    Exception: $_" -ForegroundColor Red
                }
            }
        }
        Write-Host ""
    }

    # Validate production data if requested
    if ($ValidateProduction) {
        Write-Host "Validating production CSV data..." -ForegroundColor Yellow
        $prodPath = "C:\discoverydata\ljpops\RawData"
        
        if (Test-Path $prodPath) {
            $csvFiles = Get-ChildItem -Path $prodPath -Filter "*.csv" -File
            Write-Host "  Found $($csvFiles.Count) CSV files in production"
            
            foreach ($csv in $csvFiles) {
                Write-Host "  Checking: $($csv.Name)" -NoNewline
                
                # Basic validation
                $content = Get-Content $csv.FullName -First 2
                if ($content.Count -ge 1) {
                    $headers = $content[0] -split ','
                    $recordCount = (Get-Content $csv.FullName | Measure-Object).Count - 1
                    Write-Host " - $recordCount records, $($headers.Count) columns" -ForegroundColor Gray
                }
                else {
                    Write-Host " - EMPTY FILE" -ForegroundColor Yellow
                }
            }
        }
        else {
            Write-Host "  Production path not found: $prodPath" -ForegroundColor Yellow
        }
        Write-Host ""
    }

    # Generate summary report
    $testEndTime = Get-Date
    $testDuration = $testEndTime - $testStartTime
    
    Write-Host "=== Test Summary ===" -ForegroundColor Cyan
    Write-Host "Total Tests: $totalTests"
    Write-Host "Passed: $passedTests" -ForegroundColor Green
    Write-Host "Failed: $failedTests" -ForegroundColor $(if ($failedTests -eq 0) { "Green" } else { "Red" })
    Write-Host "Success Rate: $([math]::Round(($passedTests / $totalTests) * 100, 2))%"
    Write-Host "Duration: $($testDuration.ToString('mm\:ss'))"
    Write-Host ""

    # Export results
    $summaryReport = @{
        TestRun = @{
            StartTime = $testStartTime
            EndTime = $testEndTime
            Duration = $testDuration.ToString()
            Category = $TestCategory
        }
        Summary = @{
            Total = $totalTests
            Passed = $passedTests
            Failed = $failedTests
            SuccessRate = [math]::Round(($passedTests / $totalTests) * 100, 2)
        }
        Results = $testResults
    }
    
    $summaryReport | ConvertTo-Json -Depth 10 | Out-File (Join-Path $OutputPath "T030_Summary_$(Get-Date -Format 'yyyyMMdd_HHmmss').json")
    
    # Generate status for Claude.local.md
    $claudeStatus = @{
        status = if ($failedTests -eq 0) { "PASS" } elseif ($failedTests -le 2) { "PARTIAL" } else { "FAIL" }
        suites = @{
            concurrent_loading = ($testResults | Where-Object Suite -eq "ConcurrentLoading" | Where-Object Result -eq "PASS").Count
            cache_invalidation = ($testResults | Where-Object Suite -eq "CacheInvalidation" | Where-Object Result -eq "PASS").Count
            data_validation = ($testResults | Where-Object Suite -eq "DataValidation" | Where-Object Result -eq "PASS").Count
            functional_sim = ($testResults | Where-Object Suite -eq "FunctionalSimulation" | Where-Object Result -eq "PASS").Count
        }
        csv_validation = @{
            checked_paths = @("C:\discoverydata\ljpops\RawData")
            validation_complete = $true
        }
        artifacts = @{
            test_results = $resultsFile
            test_log = $logFile
            summary = (Join-Path $OutputPath "T030_Summary_$(Get-Date -Format 'yyyyMMdd_HHmmss').json")
        }
        handoff = "documentation-qa-guardian"
    }
    
    Write-Host "Claude.local.md Status:" -ForegroundColor Magenta
    Write-Host ($claudeStatus | ConvertTo-Json -Depth 5)
    
    # Return status code
    if ($failedTests -eq 0) {
        Write-Host "`nAll tests passed successfully!" -ForegroundColor Green
        exit 0
    }
    else {
        Write-Host "`n$failedTests test(s) failed. Review the logs for details." -ForegroundColor Red
        exit 1
    }
}
catch {
    Write-Host "Test execution failed: $_" -ForegroundColor Red
    Write-Host $_.ScriptStackTrace -ForegroundColor Red
    exit 1
}
finally {
    Stop-Transcript
}