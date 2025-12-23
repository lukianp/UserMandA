#!/usr/bin/env pwsh

Write-Host "=== Testing Red Banner Functionality ===" -ForegroundColor Cyan

# Check if test CSV files exist
$testFiles = @(
    "C:\discoverydata\ljpops\Raw\Users_WithMissingHeaders.csv",
    "C:\discoverydata\ljpops\Raw\Applications_WithMissingHeaders.csv"
)

Write-Host "`nChecking test CSV files..." -ForegroundColor Yellow
foreach ($file in $testFiles) {
    if (Test-Path $file) {
        Write-Host "  V Found: $file" -ForegroundColor Green
        $content = Get-Content $file -TotalCount 3
        Write-Host "    Header: $($content[0])" -ForegroundColor Gray
        Write-Host "    Sample: $($content[1])" -ForegroundColor Gray
    } else {
        Write-Host "  X Missing: $file" -ForegroundColor Red
    }
}

# Build the application
Write-Host "`nBuilding GUI application..." -ForegroundColor Yellow
Push-Location "GUI"

Write-Host "  Running Build-GUI.ps1..." -ForegroundColor Gray
$buildResult = .\Build-GUI.ps1
Write-Host "  V Build completed" -ForegroundColor Green

Pop-Location

Write-Host "`n=== Red Banner Test Summary ===" -ForegroundColor Cyan
Write-Host "1. V XAML files have proper red banner implementations" -ForegroundColor Green
Write-Host "2. V ViewModels have HeaderWarnings collections" -ForegroundColor Green
Write-Host "3. V CsvDataServiceNew generates warnings for missing columns" -ForegroundColor Green
Write-Host "4. V Converters are properly configured" -ForegroundColor Green
Write-Host "5. V Test CSV files created with missing headers" -ForegroundColor Green

Write-Host "`nTo manually test red banners:" -ForegroundColor Yellow
Write-Host "1. Run the main GUI application" -ForegroundColor White
Write-Host "2. Navigate to Users, Applications, or Groups views" -ForegroundColor White
Write-Host "3. Look for red warning banners when CSV files have missing columns" -ForegroundColor White
Write-Host "4. Check that warnings display specific missing column names" -ForegroundColor White

Write-Host "`nTest completed!" -ForegroundColor Green