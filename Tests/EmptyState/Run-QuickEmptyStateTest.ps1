#Requires -Version 5.1
# Quick Empty State Validation Test

param(
    [string]$OutputPath = "D:\Scripts\UserMandA\TestResults\EmptyState"
)

$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$results = @{
    Status = "RUNNING"
    StartTime = Get-Date
    Tests = @()
}

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Empty State Quick Validation Test" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# Ensure output directory exists
if (-not (Test-Path $OutputPath)) {
    New-Item -ItemType Directory -Path $OutputPath -Force | Out-Null
}

# Test 1: Check if build exists
Write-Host "`nTest 1: Checking build directory..." -ForegroundColor Yellow
# Try multiple possible locations
$possiblePaths = @(
    "C:\enterprisediscovery\MandADiscoverySuite.exe",
    "C:\enterprisediscoverypublish\MandADiscoverySuite.exe",
    "C:\EnterpriseDiscovery\MandADiscoverySuite.exe"
)
$exePath = $possiblePaths | Where-Object { Test-Path $_ } | Select-Object -First 1
if (-not $exePath) { 
    $exePath = "C:\enterprisediscovery\MandADiscoverySuite.exe" 
}
if (Test-Path $exePath) {
    Write-Host "  [PASS] Application found" -ForegroundColor Green
    $results.Tests += @{ Name = "BuildExists"; Result = "PASS" }
} else {
    Write-Host "  [FAIL] Application not found" -ForegroundColor Red
    $results.Tests += @{ Name = "BuildExists"; Result = "FAIL" }
}

# Test 2: Create empty test profile
Write-Host "`nTest 2: Creating empty test profile..." -ForegroundColor Yellow
$testProfile = "EmptyQuickTest"
$testDataPath = "C:\discoverydata\$testProfile"
$rawDataPath = "$testDataPath\RawData"

if (-not (Test-Path $rawDataPath)) {
    New-Item -ItemType Directory -Path $rawDataPath -Force | Out-Null
}

# Clean any existing CSV files
Get-ChildItem -Path $rawDataPath -Filter "*.csv" -ErrorAction SilentlyContinue | Remove-Item -Force

Write-Host "  [PASS] Empty profile created" -ForegroundColor Green
$results.Tests += @{ Name = "EmptyProfile"; Result = "PASS" }

# Test 3: Test application launch with empty data
Write-Host "`nTest 3: Testing application launch..." -ForegroundColor Yellow
if (Test-Path $exePath) {
    try {
        $process = Start-Process -FilePath $exePath -ArgumentList "--profile", $testProfile, "--test-mode" -PassThru -WindowStyle Hidden
        Start-Sleep -Seconds 3
        
        if (-not $process.HasExited) {
            Write-Host "  [PASS] Application runs with empty data" -ForegroundColor Green
            $results.Tests += @{ Name = "AppLaunch"; Result = "PASS" }
            Stop-Process -Id $process.Id -Force -ErrorAction SilentlyContinue
        } else {
            Write-Host "  [FAIL] Application crashed" -ForegroundColor Red
            $results.Tests += @{ Name = "AppLaunch"; Result = "FAIL" }
        }
    }
    catch {
        Write-Host "  [FAIL] Launch error: $_" -ForegroundColor Red
        $results.Tests += @{ Name = "AppLaunch"; Result = "FAIL"; Error = $_.ToString() }
    }
} else {
    Write-Host "  [SKIP] No application to test" -ForegroundColor Gray
    $results.Tests += @{ Name = "AppLaunch"; Result = "SKIP" }
}

# Test 4: Check discovery modules
Write-Host "`nTest 4: Checking discovery modules..." -ForegroundColor Yellow
# Check for modules in multiple locations
$possibleModulePaths = @(
    "C:\enterprisediscovery\Modules",
    "C:\enterprisediscoverypublish\Modules",
    "D:\Scripts\UserMandA\Modules"
)
$modulesPath = $possibleModulePaths | Where-Object { Test-Path $_ } | Select-Object -First 1
if (-not $modulesPath) {
    $modulesPath = "C:\enterprisediscovery\Modules"
}
if (Test-Path $modulesPath) {
    $modules = Get-ChildItem -Path $modulesPath -Filter "*.psm1" -ErrorAction SilentlyContinue
    Write-Host "  Found $($modules.Count) modules" -ForegroundColor Cyan
    
    $moduleLoadErrors = 0
    foreach ($module in $modules | Select-Object -First 5) {
        try {
            Import-Module $module.FullName -Force -ErrorAction Stop
            Remove-Module $module.BaseName -ErrorAction SilentlyContinue
        }
        catch {
            $moduleLoadErrors++
        }
    }
    
    if ($moduleLoadErrors -eq 0) {
        Write-Host "  [PASS] Modules load without data" -ForegroundColor Green
        $results.Tests += @{ Name = "ModuleLoad"; Result = "PASS" }
    } else {
        Write-Host "  [PARTIAL] $moduleLoadErrors modules failed to load" -ForegroundColor Yellow
        $results.Tests += @{ Name = "ModuleLoad"; Result = "PARTIAL"; FailCount = $moduleLoadErrors }
    }
} else {
    Write-Host "  [SKIP] No modules directory" -ForegroundColor Gray
    $results.Tests += @{ Name = "ModuleLoad"; Result = "SKIP" }
}

# Test 5: Verify CSV files are missing
Write-Host "`nTest 5: Verifying empty data state..." -ForegroundColor Yellow
$csvFiles = Get-ChildItem -Path $rawDataPath -Filter "*.csv" -ErrorAction SilentlyContinue
if ($null -eq $csvFiles -or $csvFiles.Count -eq 0) {
    Write-Host "  [PASS] No CSV files present (expected)" -ForegroundColor Green
    $results.Tests += @{ Name = "EmptyData"; Result = "PASS" }
} else {
    Write-Host "  [FAIL] Found $($csvFiles.Count) CSV files" -ForegroundColor Red
    $results.Tests += @{ Name = "EmptyData"; Result = "FAIL"; FileCount = $csvFiles.Count }
}

# Calculate summary
$results.EndTime = Get-Date
$results.Duration = ($results.EndTime - $results.StartTime).TotalSeconds

$passCount = ($results.Tests | Where-Object { $_.Result -eq "PASS" }).Count
$failCount = ($results.Tests | Where-Object { $_.Result -eq "FAIL" }).Count
$partialCount = ($results.Tests | Where-Object { $_.Result -eq "PARTIAL" }).Count
$skipCount = ($results.Tests | Where-Object { $_.Result -eq "SKIP" }).Count

if ($failCount -eq 0 -and $partialCount -eq 0) {
    $results.Status = "PASS"
} elseif ($failCount -eq 0) {
    $results.Status = "PARTIAL"
} else {
    $results.Status = "FAIL"
}

# Generate report
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "         TEST SUMMARY" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Status: $($results.Status)" -ForegroundColor $(if ($results.Status -eq "PASS") { "Green" } elseif ($results.Status -eq "PARTIAL") { "Yellow" } else { "Red" })
Write-Host "Duration: $([math]::Round($results.Duration, 2)) seconds"
Write-Host "Results:"
Write-Host "  Passed: $passCount" -ForegroundColor Green
Write-Host "  Failed: $failCount" -ForegroundColor Red
Write-Host "  Partial: $partialCount" -ForegroundColor Yellow
Write-Host "  Skipped: $skipCount" -ForegroundColor Gray

# Save JSON report
$jsonPath = Join-Path $OutputPath "QuickEmptyStateTest_$timestamp.json"
$results | ConvertTo-Json -Depth 10 | Out-File -FilePath $jsonPath -Encoding UTF8
Write-Host "`nReport saved to: $jsonPath" -ForegroundColor Cyan

# Generate summary for claude.local.md
$claudeUpdate = @"

## Empty State Validation Results

**Status:** $($results.Status)
**Date:** $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")

### Test Results
- Build Exists: $(($results.Tests | Where-Object { $_.Name -eq "BuildExists" }).Result)
- Empty Profile: $(($results.Tests | Where-Object { $_.Name -eq "EmptyProfile" }).Result)
- App Launch: $(($results.Tests | Where-Object { $_.Name -eq "AppLaunch" }).Result)
- Module Load: $(($results.Tests | Where-Object { $_.Name -eq "ModuleLoad" }).Result)
- Empty Data: $(($results.Tests | Where-Object { $_.Name -eq "EmptyData" }).Result)

### Summary
The application has been tested with completely empty CSV data:
- Application $(if ($results.Tests | Where-Object { $_.Name -eq "AppLaunch" -and $_.Result -eq "PASS" }) { "successfully launches" } else { "fails to launch" }) with missing data
- Discovery modules $(if ($results.Tests | Where-Object { $_.Name -eq "ModuleLoad" -and $_.Result -eq "PASS" }) { "load correctly" } else { "have issues" }) without CSV files
- Empty state handling: **$($results.Status)**

### Artifacts
- $jsonPath
"@

$mdPath = Join-Path $OutputPath "QuickEmptyStateTest_$timestamp.md"
$claudeUpdate | Out-File -FilePath $mdPath -Encoding UTF8
Write-Host "Markdown report saved to: $mdPath" -ForegroundColor Cyan

# Return exit code
switch ($results.Status) {
    "PASS" { exit 0 }
    "PARTIAL" { exit 2 }
    "FAIL" { exit 1 }
    default { exit 99 }
}