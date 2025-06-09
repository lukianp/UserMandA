# Quick Discovery Integration Test
Write-Host "=== DISCOVERY MODULE INTEGRATION TEST ===" -ForegroundColor Cyan

$modules = Get-ChildItem "Modules\Discovery\*.psm1" | Where-Object { $_.Name -notlike "*backup*" }
$success = 0
$total = $modules.Count

foreach ($module in $modules) {
    $name = $module.BaseName -replace 'Discovery$', ''
    $func = "Invoke-${name}Discovery"
    
    Write-Host "Testing: $($module.BaseName)" -ForegroundColor Yellow
    
    Import-Module $module.FullName -Force -ErrorAction SilentlyContinue
    
    if (Get-Command $func -ErrorAction SilentlyContinue) {
        Write-Host "  ✓ Has $func" -ForegroundColor Green
        $success++
    } else {
        Write-Host "  ✗ Missing $func" -ForegroundColor Red
    }
    
    Remove-Module $module.BaseName -Force -ErrorAction SilentlyContinue
}

Write-Host ""
Write-Host "Results: $success/$total modules ready" -ForegroundColor $(if ($success -eq $total) { "Green" } else { "Yellow" })

if ($success -eq $total) {
    Write-Host "🎉 ALL MODULES INTEGRATED! 🎉" -ForegroundColor Green
}