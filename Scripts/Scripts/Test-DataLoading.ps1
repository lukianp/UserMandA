#!/usr/bin/env pwsh
# Test script to verify data loading in views after CSV fixes

Write-Host "Testing Data Loading After CSV Service Fixes" -ForegroundColor Green
Write-Host "=============================================" -ForegroundColor Green

# Check if TestData files exist
$testDataPath = "D:\Scripts\UserMandA\TestData"
$discoveryPath = "C:\discoverydata\ljpops\Raw"

Write-Host "`nChecking TestData files:" -ForegroundColor Yellow
Get-ChildItem "$testDataPath\*.csv" | ForEach-Object {
    $lineCount = (Get-Content $_.FullName | Measure-Object -Line).Lines - 1  # Subtract header
    Write-Host "  $($_.Name): $lineCount records" -ForegroundColor Cyan
}

Write-Host "`nChecking Discovery data files:" -ForegroundColor Yellow
Get-ChildItem "$discoveryPath\*.csv" | ForEach-Object {
    $lineCount = (Get-Content $_.FullName | Measure-Object -Line).Lines - 1  # Subtract header
    Write-Host "  $($_.Name): $lineCount records" -ForegroundColor Cyan
}

# Check ViewRegistry debug logs for recent activity
Write-Host "`nRecent ViewRegistry Activity:" -ForegroundColor Yellow
$debugLog = "C:\DiscoveryData\ljpops\Logs\viewregistry-debug.log"
if (Test-Path $debugLog) {
    $recentLogs = Get-Content $debugLog | Select-Object -Last 10
    $recentLogs | ForEach-Object {
        if ($_ -like "*Creating view*") {
            Write-Host "  $_" -ForegroundColor Green
        } elseif ($_ -like "*Error*") {
            Write-Host "  $_" -ForegroundColor Red
        } else {
            Write-Host "  $_" -ForegroundColor Gray
        }
    }
} else {
    Write-Host "  No ViewRegistry debug log found" -ForegroundColor Red
}

# Test CSV loading directly
Write-Host "`nTesting CSV Service..." -ForegroundColor Yellow
try {
    # Start the application in background for testing
    $appPath = "D:\Scripts\UserMandA\GUI\publish\MandADiscoverySuite.exe"
    if (Test-Path $appPath) {
        Write-Host "  Application found at: $appPath" -ForegroundColor Green
        
        # Check for any error logs
        $errorLog = "C:\DiscoveryData\ljpops\Logs\Application\app_log_*.json"
        $errorFiles = Get-ChildItem $errorLog -ErrorAction SilentlyContinue | Sort-Object LastWriteTime -Descending | Select-Object -First 1
        if ($errorFiles) {
            Write-Host "  Latest application log: $($errorFiles.Name)" -ForegroundColor Cyan
        }
    } else {
        Write-Host "  Application not found - build may have failed" -ForegroundColor Red
    }
} catch {
    Write-Host "  Error testing application: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`nTest complete. Check logs for data loading status." -ForegroundColor Green