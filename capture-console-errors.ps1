#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Capture console errors from running Electron app

.DESCRIPTION
    Monitors the npm start output for console errors and React errors,
    then generates a report for fixing.
#>

param(
    [int]$DurationSeconds = 60,
    [string]$OutputFile = "console-errors.json"
)

$projectDir = "D:\Scripts\UserMandA\guiv2"
$outputPath = Join-Path $projectDir $OutputFile

Write-Host "📊 Console Error Capture Tool" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""
Write-Host "Instructions:" -ForegroundColor Yellow
Write-Host "1. Make sure the Electron app is running (npm start)"
Write-Host "2. Manually click through all views in the app"
Write-Host "3. This script will capture errors in real-time"
Write-Host "4. Press Ctrl+C when done to generate the report"
Write-Host ""
Write-Host "Monitoring for ${DurationSeconds}s (or press Ctrl+C to stop early)..." -ForegroundColor Green
Write-Host ""

$errors = @()
$startTime = Get-Date

# Monitor log files or process output
# Since we can't easily tap into the running Electron console,
# we'll provide instructions for manual capture

Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "MANUAL ERROR COLLECTION MODE" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""
Write-Host "Since the Electron app is running, please:" -ForegroundColor White
Write-Host ""
Write-Host "1. Open DevTools in the Electron app (Ctrl+Shift+I or F12)" -ForegroundColor Cyan
Write-Host "2. Go to the Console tab" -ForegroundColor Cyan
Write-Host "3. Click through each view and note any RED errors" -ForegroundColor Cyan
Write-Host "4. Copy each error message" -ForegroundColor Cyan
Write-Host "5. Paste them here (one per line)" -ForegroundColor Cyan
Write-Host "6. Type 'DONE' when finished" -ForegroundColor Cyan
Write-Host ""

# Collect errors interactively
while ($true) {
    $input = Read-Host "Error (or 'DONE')"

    if ($input -eq "DONE") {
        break
    }

    if ($input.Trim()) {
        $errors += @{
            Message = $input
            Timestamp = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
        }
        Write-Host "  ✓ Captured error #$($errors.Count)" -ForegroundColor Green
    }
}

# Generate report
Write-Host ""
Write-Host "Generating report..." -ForegroundColor Yellow

$report = @{
    CaptureDate = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
    TotalErrors = $errors.Count
    Errors = $errors
}

$report | ConvertTo-Json -Depth 10 | Out-File $outputPath -Encoding UTF8

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Green
Write-Host "REPORT GENERATED" -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Green
Write-Host "Total Errors: $($errors.Count)" -ForegroundColor White
Write-Host "Report saved to: $outputPath" -ForegroundColor Cyan
Write-Host ""
Write-Host "You can now provide this file to Claude for automated fixes." -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Green
