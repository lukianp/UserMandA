# Simple verification script for error handling wrapper
param([string]$ModulesPath = ".\Modules")

Write-Host "Verifying Error Handling Wrapper Implementation" -ForegroundColor Green
Write-Host "=" * 50

$moduleFiles = Get-ChildItem -Path $ModulesPath -Recurse -Filter "*.psm1" | Where-Object { $_.Name -notlike "*.bak" }
$totalModules = $moduleFiles.Count
$successCount = 0

Write-Host "Found $totalModules modules to check"
Write-Host ""

foreach ($file in $moduleFiles) {
    $content = Get-Content -Path $file.FullName -Raw
    $hasWrapper = $content -match "function Invoke-SafeModuleExecution"
    
    $moduleName = $file.BaseName
    if ($hasWrapper) {
        Write-Host "✓ $moduleName" -ForegroundColor Green
        $successCount++
    } else {
        Write-Host "✗ $moduleName" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "Results:" -ForegroundColor Yellow
Write-Host "  Total modules: $totalModules"
Write-Host "  With wrapper: $successCount" -ForegroundColor Green
Write-Host "  Missing wrapper: $($totalModules - $successCount)" -ForegroundColor Red

if ($successCount -eq $totalModules) {
    Write-Host ""
    Write-Host "SUCCESS: All modules have the error handling wrapper!" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "INCOMPLETE: Some modules are missing the wrapper." -ForegroundColor Yellow
}