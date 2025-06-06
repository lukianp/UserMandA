# Test script to verify that modules can be loaded without global context errors
# This script tests the fixes for module loading issues

Write-Host "Testing module loading fixes..." -ForegroundColor Cyan

# Test Processing modules
$processingModules = @(
    "DataValidation",
    "UserProfileBuilder", 
    "WaveGeneration",
    "DataAggregation"
)

Write-Host "`nTesting Processing modules:" -ForegroundColor Yellow
foreach ($module in $processingModules) {
    $modulePath = ".\Modules\Processing\$module.psm1"
    try {
        Import-Module $modulePath -Force -ErrorAction Stop
        Write-Host "  [OK] $module loaded successfully" -ForegroundColor Green
        Remove-Module $module -Force -ErrorAction SilentlyContinue
    } catch {
        Write-Host "  [FAIL] $module failed to load: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Test Export modules
$exportModules = @(
    "CSVExport",
    "JSONExport", 
    "ExcelExport",
    "PowerAppsExporter",
    "CompanyControlSheetExporter"
)

Write-Host "`nTesting Export modules:" -ForegroundColor Yellow
foreach ($module in $exportModules) {
    $modulePath = ".\Modules\Export\$module.psm1"
    try {
        Import-Module $modulePath -Force -ErrorAction Stop
        Write-Host "  [OK] $module loaded successfully" -ForegroundColor Green
        Remove-Module $module -Force -ErrorAction SilentlyContinue
    } catch {
        Write-Host "  [FAIL] $module failed to load: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host "`nModule loading test completed." -ForegroundColor Cyan