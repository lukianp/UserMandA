# Simple verification script
$moduleFiles = Get-ChildItem -Path ".\Modules" -Recurse -Filter "*.psm1" | Where-Object { $_.Name -notlike "*.bak" }
$totalModules = $moduleFiles.Count
$successCount = 0

Write-Host "Checking $totalModules modules for error handling wrapper..."

foreach ($file in $moduleFiles) {
    $content = Get-Content -Path $file.FullName -Raw
    $hasWrapper = $content -match "function Invoke-SafeModuleExecution"
    
    if ($hasWrapper) {
        $successCount++
        Write-Host "OK: $($file.BaseName)" -ForegroundColor Green
    } else {
        Write-Host "MISSING: $($file.BaseName)" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "Summary:"
Write-Host "Total modules: $totalModules"
Write-Host "With wrapper: $successCount"
Write-Host "Missing: $($totalModules - $successCount)"

if ($successCount -eq $totalModules) {
    Write-Host "SUCCESS: All modules have the wrapper!" -ForegroundColor Green
} else {
    Write-Host "Some modules missing wrapper" -ForegroundColor Yellow
}