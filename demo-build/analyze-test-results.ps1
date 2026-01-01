# Analyze Jest Test Results
$report = Get-Content jest-report.json -Raw | ConvertFrom-Json

Write-Host "=== TEST SUMMARY ===" -ForegroundColor Cyan
Write-Host "Total Test Suites: $($report.numTotalTestSuites)"
Write-Host "Failed Test Suites: $($report.numFailedTestSuites)" -ForegroundColor Red
Write-Host "Passed Test Suites: $($report.numPassedTestSuites)" -ForegroundColor Green
Write-Host "Total Tests: $($report.numTotalTests)"
Write-Host "Failed Tests: $($report.numFailedTests)" -ForegroundColor Red
Write-Host "Passed Tests: $($report.numPassedTests)" -ForegroundColor Green
Write-Host "Pending Tests: $($report.numPendingTests)" -ForegroundColor Yellow
Write-Host ""

# Categorize errors
Write-Host "=== ERROR CATEGORIZATION ===" -ForegroundColor Cyan
$errorPatterns = @{}
$allErrors = @()

foreach ($suite in $report.testResults) {
    $file = $suite.name
    foreach ($test in $suite.assertionResults) {
        if ($test.status -eq 'failed') {
            foreach ($msg in $test.failureMessages) {
                $allErrors += @{
                    File = $file
                    Test = $test.fullName
                    Message = $msg
                }

                # Categorize by error type
                $errorType = "Other"
                if ($msg -match "Element type is invalid") {
                    $errorType = "Invalid Element Type (Import/Export Issue)"
                } elseif ($msg -match "Cannot read properties of undefined") {
                    $errorType = "Undefined Property Access"
                } elseif ($msg -match "Unable to find an element") {
                    $errorType = "Missing Element (Test Assertion)"
                } elseif ($msg -match "AG Grid") {
                    $errorType = "AG Grid Module Not Registered"
                } elseif ($msg -match "is not a function") {
                    $errorType = "Function Not Found"
                } elseif ($msg -match "Cannot find module") {
                    $errorType = "Module Not Found"
                } elseif ($msg -match "ReferenceError") {
                    $errorType = "Reference Error"
                }

                if (-not $errorPatterns.ContainsKey($errorType)) {
                    $errorPatterns[$errorType] = 0
                }
                $errorPatterns[$errorType]++
            }
        }
    }
}

# Display error categories
$errorPatterns.GetEnumerator() | Sort-Object -Property Value -Descending | ForEach-Object {
    Write-Host "$($_.Key): $($_.Value)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "=== FAILED TEST SUITES ===" -ForegroundColor Cyan
$failedSuites = $report.testResults | Where-Object { $_.status -eq 'failed' -or $_.numFailingTests -gt 0 }
foreach ($suite in $failedSuites) {
    $relativePath = $suite.name -replace [regex]::Escape($PWD.Path), '.'
    Write-Host "$relativePath - $($suite.numFailingTests) failed" -ForegroundColor Red
}

# Save detailed error report
Write-Host ""
Write-Host "=== GENERATING DETAILED ERROR REPORT ===" -ForegroundColor Cyan
$errorReport = @"
# Jest Test Error Analysis Report
Generated: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")

## Summary
- Total Test Suites: $($report.numTotalTestSuites)
- Failed Test Suites: $($report.numFailedTestSuites)
- Passed Test Suites: $($report.numPassedTestSuites)
- Total Tests: $($report.numTotalTests)
- Failed Tests: $($report.numFailedTests)
- Passed Tests: $($report.numPassedTests)
- Pending Tests: $($report.numPendingTests)

## Error Categories

"@

$errorPatterns.GetEnumerator() | Sort-Object -Property Value -Descending | ForEach-Object {
    $errorReport += "- **$($_.Key)**: $($_.Value) occurrences`n"
}

$errorReport += "`n## Failed Test Suites`n`n"
foreach ($suite in $failedSuites | Select-Object -First 50) {
    $relativePath = $suite.name -replace [regex]::Escape($PWD.Path), '.'
    $errorReport += "### $relativePath`n"
    $errorReport += "- Failed: $($suite.numFailingTests)`n"
    $errorReport += "- Passed: $($suite.numPassingTests)`n"

    # Get first error from this suite
    $firstFailure = $suite.assertionResults | Where-Object { $_.status -eq 'failed' } | Select-Object -First 1
    if ($firstFailure) {
        $errorReport += "- First Error: $($firstFailure.title)`n"
        $firstMsg = $firstFailure.failureMessages[0]
        if ($firstMsg.Length -gt 200) {
            $errorReport += "  ``````n  $($firstMsg.Substring(0, 200))...`n  ``````n"
        } else {
            $errorReport += "  ``````n  $firstMsg`n  ``````n"
        }
    }
    $errorReport += "`n"
}

$errorReport | Out-File -FilePath "test-error-analysis.md" -Encoding UTF8
Write-Host "Detailed report saved to test-error-analysis.md" -ForegroundColor Green
